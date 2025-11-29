const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const gigModel = require('../model/gigModel.js')
const userModel = require('../model/userModel.js')
const auth = require('../middlewares/authCheck.js')
const AWS = require('aws-sdk');
const cloudinary = require('cloudinary').v2
const fs = require("fs");
const orderModel = require('../model/orderModel.js');
const stripe = require('stripe')(process.env.stripe_secret_key);
require('dotenv').config();

const s3 = new AWS.S3({
  endpoint: process.env.STORJ_ENDPOINT,
  accessKeyId: process.env.STORJ_ACCESS_KEY,
  secretAccessKey: process.env.STORJ_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/creategig', auth, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const verify = jwt.verify(token, process.env.JWT_SECRET)
  try {
    const { title, description, category, price, deliveryTime } = req.body;
    if (!title || !description || !category || !price || !deliveryTime) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const image = req.files?.image;
    const uploadedImageUrls = [];
    const imageFiles = Array.isArray(image) ? image : [image];

    for (const img of imageFiles) {
      const uploadResult = await cloudinary.uploader.upload(img.tempFilePath, {
        folder: "gigImages", 
        resource_type: "image"
      });
      uploadedImageUrls.push(uploadResult.secure_url); 
    }

    const gig = await gigModel.create({
      title,
      description,
      category,
      price,
      deliveryTime,
      images: uploadedImageUrls,
      userId: verify.userId,
    });

    await userModel.findByIdAndUpdate(verify.userId, {
      $push: { gigs: gig._id }
    });

    res.status(201).json('gig');
  } catch (err) {
    console.error('Create gig error:', err);

    if (err.name === 'ValidationError') {
      return res.status(422).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

// Edit gig
router.put('/editgig/:gigId', auth, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const verify = jwt.verify(token, process.env.JWT_SECRET);

  try {
    const { gigId } = req.params;
    const { title, description, category, price, deliveryTime } = req.body;

    const gig = await gigModel.findOne({ _id: gigId, userId: verify.userId });
    if (!gig) {
      return res.status(404).json({ error: "Gig not found or unauthorized" });
    }

    // ---- Handle Images ----
    let uploadedImageKeys = gig.images || [];

    if (req.files?.image) {
      // Delete old images
      if (gig.images?.length) {
        for (const imgKey of gig.images) {
          try {
            await s3.deleteObject({
              Bucket: process.env.BUCKET_NAME,
              Key: imgKey,
            }).promise();
          } catch (err) {
            console.error("Image delete failed:", err);
          }
        }
      }

      const imageFiles = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
      uploadedImageKeys = [];

      for (const img of imageFiles) {
        const fileName = `gigImages/${Date.now()}_${img.name.replace(/\s+/g, "_")}`;
        const fileStream = fs.createReadStream(img.tempFilePath);

        const uploadResult = await s3.upload({
          Bucket: process.env.BUCKET_NAME,
          Key: fileName,
          Body: fileStream,
          ContentType: img.mimetype,
          ACL: "public-read",
        }).promise();

        uploadedImageKeys.push(uploadResult.Key);
        fs.unlinkSync(img.tempFilePath); 
      }
    }

    // ---- Handle Video ----
    let uploadedVideoKey = gig.video || null;

    if (req.files?.video) {
      // Delete old video
      if (gig.video) {
        try {
          await s3.deleteObject({
            Bucket: process.env.BUCKET_NAME,
            Key: gig.video,
          }).promise();
        } catch (err) {
          console.error("Video delete failed:", err);
        }
      }

      const video = req.files.video;
      const fileName = `gigVideos/${Date.now()}_${video.name.replace(/\s+/g, "_")}`;
      const fileStream = fs.createReadStream(video.tempFilePath);

      const uploadResult = await s3.upload({
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: fileStream,
        ContentType: video.mimetype,
        ACL: "public-read",
      }).promise();

      uploadedVideoKey = uploadResult.Key;
      fs.unlinkSync(video.tempFilePath); // cleanup temp file
    }

    // ---- Update DB ----
    gig.title = title || gig.title;
    gig.description = description || gig.description;
    gig.category = category || gig.category;
    gig.price = price || gig.price;
    gig.deliveryTime = deliveryTime || gig.deliveryTime;
    gig.images = uploadedImageKeys;
    gig.video = uploadedVideoKey;

    await gig.save();

    res.status(200).json({ message: "Gig updated successfully", gig });

  } catch (err) {
    console.error("Edit gig error:", err);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});



// DELETE a gig
router.delete('/deletegig/:id', auth, async (req, res) => {
  try {
    const gigId = req.params.id;
    const userId = req.user.userId; // from auth middleware

    // Find gig
    const gig = await gigModel.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Check ownership
    if (gig.userId.toString() !== userId) {
      return res.status(403).json({ error: 'You are not allowed to delete this gig' });
    }

    // ---- Delete gig images from S3 ----
    if (gig.images && gig.images.length > 0) {
      try {
        const deleteParams = {
          Bucket: process.env.BUCKET_NAME,
          Delete: { Objects: gig.images.map(key => ({ Key: key })) }
        };
        await s3.deleteObjects(deleteParams).promise();
      } catch (err) {
        console.error("Image delete failed:", err);
      }
    }

    // ---- Delete gig video from S3 ----
    if (gig.video) {
      try {
        await s3.deleteObject({
          Bucket: process.env.BUCKET_NAME,
          Key: gig.video
        }).promise();
      } catch (err) {
        console.error("Video delete failed:", err);
      }
    }

    // ---- Delete gig from DB ----
    await gigModel.findByIdAndDelete(gigId);

    // ---- Remove reference from user ----
    await userModel.findByIdAndUpdate(userId, { $pull: { gigs: gigId } });

    res.json({ msg: 'Gig deleted successfully' });

  } catch (err) {
    console.error('Delete gig error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/all-gigs', async (req, res) => {
  try {
    const gigs = await gigModel.find().populate('userId', 'name email profilePicId designation profilePic')
    res.status(200).json(gigs)
  } catch (error) {
    console.log(error)
  }
})

router.post('/add-review/:id', auth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    const { stars, comment } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Stars must be between 1 and 5." });
    }
    if (!comment || typeof comment !== 'string') {
      return res.status(400).json({ error: "Comment is required and must be a string." });
    }
    const gig = await gigModel.findById(req.params.id);
    if (!gig) return res.status(404).json({ error: "Gig not found." });

    // if (gig.userId.toString()==verify.userId.toString()) {
    //   return res.status(400).json({ error: "Can not review your own gig" })
    // }
    const alreadyReviewed = gig.reviews.find(
      (review) => review.userId.toString() === verify.userId
    );
    if (alreadyReviewed) {
      return res.status(400).json({ error: "You have already reviewed this gig." });
    }
    gig.reviews.push({ userId: verify.userId, stars, comment });
    await gig.save();

    res.status(201).json({ message: "Review added successfully.", gig });
  } catch (err) {
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token." });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired." });
    }
    res.status(500).json({ error: "Server error." });
  }
});

router.get('/get-reviews/:id', async (req, res) => {
  try {
    const gig = await gigModel.findById(req.params.id)
      .populate('reviews.userId', 'name email profilePicId profilePic designation');

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    res.status(200).json({
      reviews: gig.reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
});

router.delete('/delete-review/:reviewId/:gigId', auth, async (req, res) => {
  try {
    const { reviewId, gigId } = req.params;

    const gig = await gigModel.findById(gigId);
    if (!gig) return res.status(404).json({ error: 'Gig not found' });

    const reviewIndex = gig.reviews.findIndex(
      (review) => review._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    gig.reviews.splice(reviewIndex, 1);
    await gig.save();

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/create-payment-session/:id', async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: 'Gig Payment',
            },
            unit_amount: req.body.amount * 100,
            unit_amount: 5000000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/payment?gigId=${order._id}`,
      cancel_url: 'http://localhost:5173/home',
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/mark-paid/:id', async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Gig not found" });

    order.paid = true;
    order.status = 'paid';
    await order.save();

    res.json({ message: "Gig marked as paid", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update gig' });
  }
});

// Create new order
router.post('/order/create-order', async (req, res) => {
  try {
    const { gig, buyer, seller, initialMessage } = req.body;

    const existingOrder = await orderModel.findOne({ gig, buyer, seller });
    if (existingOrder) {
      return res.status(400).json({ msg: 'Order already exists' });
    }

    const newOrder = new orderModel({
      gig,
      buyer,
      seller,
      conversation: [
        {
          sender: buyer,
          message: initialMessage,
        }
      ]
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all
router.get('/my-orders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await orderModel.find({
      $or: [{ buyer: userId }, { seller: userId }]
    }).populate('gig buyer seller');

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/add-gigorder/:gigId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const verify = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(verify.userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    user.gigOrders.push({
      gig: req.params.gigId,
      status: 'pending'
    });

    await user.save();

    res.status(200).json({ msg: "Gig order added successfully" });
  } catch (error) {
    console.error("Error adding gig order:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post('/order-status-update/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "rejected", "paid", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Order update error:", err);
    res.status(500).json({ message: "Server error" });
  }
})

module.exports = router;