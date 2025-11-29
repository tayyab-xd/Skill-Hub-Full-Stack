const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userModel = require('../model/userModel.js')
const auth = require('../middlewares/authCheck.js')
const AWS = require('aws-sdk');
const cloudinary = require('cloudinary').v2
const fs = require("fs");
require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require("mongoose");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})
const s3 = new AWS.S3({
  endpoint: process.env.STORJ_ENDPOINT,
  accessKeyId: process.env.STORJ_ACCESS_KEY,
  secretAccessKey: process.env.STORJ_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tayyabimo@gmail.com',
    pass: 'aapb rbqs zujb suub',
  }
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  try {
    const userExists = await userModel.findOne({ email: email.trim().toLowerCase() })
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const hash = await bcrypt.hash(password, 10)
    const newUser = await userModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash
    })
    res.status(201).json({ msg: 'Sign up successful', data: newUser });
  } catch (error) {
    res.status(500).json({ msg: 'Internal Server Error', error: error.message });
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await userModel.findOne({ email: email.trim().toLowerCase() })
    if (!user) {
      return res.status(404).json({ msg: 'User does not exist' })
    }
    const checkPass = await bcrypt.compare(password, user.password)
    if (!checkPass) {
      return res.status(401).json({ msg: 'Incorrect Password' })
    }
    const token = jwt.sign({ name: user.name, email: user.email, userId: user.id }, process.env.JWT_SECRET)
    res.status(200).json({ msg: 'Login Successful', token, name: user.name, userId: user.id, email: user.email, isAdmin: user.isAdmin })

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
})

router.get('/profile/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const user = await userModel
      .findById(req.params.id)
      .populate('courses')
      .populate('gigs')
      .populate('coursesEnrolled')
      .populate({
        path: 'gigOrders.gig',
        populate: {
          path: 'userId',
          model: 'User'
        }
      });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/updateUser/:id', auth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    if (verify.userId !== req.params.id) {
      return res.status(401).json({ msg: 'Unauthorized user' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const oldData = await userModel.findById(req.params.id);
    if (!oldData) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const { name, email, designation, bio, password } = req.body;
    let hash;
    if (password) {
      hash = await bcrypt.hash(password, 10);
    }

    const newUser = {
      name: name || oldData.name,
      email: email || oldData.email,
      designation: designation,
      bio: bio || oldData.bio || '',
      password: password ? hash : oldData.password
    };

    if (req.files && req.files.image) {
      try {
        if (oldData.profilePicId) {
          try {
            await cloudinary.uploader.destroy(oldData.profilePicId, {
              resource_type: "image"
            });
          } catch (err) {
            console.error('Cloudinary delete failed:', err);
          }
        }

        const uploadedImage = await cloudinary.uploader.upload(
          req.files.image.tempFilePath,
          {
            folder: "profilePics",
            resource_type: "image"
          }
        );

        newUser.profilePic = uploadedImage.secure_url;
        newUser.profilePicId = uploadedImage.public_id;

        fs.unlink(req.files.image.tempFilePath, (err) => {
          if (err) console.error('Failed to delete temp file:', err);
        });
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({ msg: "Error uploading profile image" });
      }
    }

    const updateUser = await userModel.findByIdAndUpdate(
      req.params.id,
      newUser,
      { new: true }
    );

    return res.status(200).json({ msg: 'User updated successfully', user: updateUser });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Internal Server Error' });
  }
});

router.delete('/:profileId/deleteprofilepic', auth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    if (verify.userId !== req.params.profileId) {
      return res.status(401).json({ msg: 'Unauthorized User' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.profileId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const user = await userModel.findById(req.params.profileId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.profilePicId) {
      return res.status(400).json({ msg: 'No profile pic to delete' });
    }

    try {
      await cloudinary.uploader.destroy(user.profilePicId, { resource_type: "image" });
    } catch (err) {
      console.error('Cloudinary delete failed:', err);
    }

    user.profilePicId = '';
    user.profilePic = '';
    await user.save();

    res.status(200).json({ msg: 'Profile Pic Deleted' });

  } catch (error) {
    console.error("Delete Profile Pic Error:", error);
    res.status(500).json({ msg: 'Server Error' });
  }
});


// Step 1: Send reset code
router.post('/reset-request', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    user.resetPassword = {
      code,
      expiry
    };
    await user.save();

    await transporter.sendMail({
      from: `"SkillHub Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Code - SkillHub',
      html: `
    <div style="background-color:#121212;padding:30px;border-radius:8px;color:#ffffff;font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#00bcd4">SkillHub Password Reset</h2>
      <p style="font-size:16px">Hi there,</p>
      <p style="font-size:16px">You recently requested to reset your password. Use the following code to proceed:</p>
      
      <div style="background-color:#1e1e1e;padding:20px;border-radius:6px;margin:20px 0;text-align:center">
        <span style="font-size:28px;color:#00ffcc;letter-spacing:4px;font-weight:bold;">${code}</span>
      </div>

      <p style="font-size:14px;color:#cccccc"> This code will expire in <strong>5 minutes</strong>.</p>
      <p style="font-size:14px;color:#cccccc">⚠️ If you did not request this, you can safely ignore this email.</p>

      <hr style="border:0;border-top:1px solid #333;margin:30px 0">
      <p style="font-size:13px;color:#777;text-align:center;">SkillHub © ${new Date().getFullYear()} | All rights reserved</p>
    </div>
  `
    });


    res.json({ msg: 'Reset code sent to email' });
  } catch (err) {
    console.error('Reset request error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Step 2: Verify Reset Code
router.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (
      !user ||
      !user.resetPassword?.code ||
      user.resetPassword.code !== code
    )
      return res.status(400).json({ msg: 'Invalid code' });

    if (Date.now() > new Date(user.resetPassword.expiry).getTime())
      return res.status(400).json({ msg: 'Code expired' });

    res.json({ msg: 'Code verified' });
  } catch (err) {
    console.error('Verify code error:', err);
    res.status(500).json({ msg: 'Serbver error' });
  }
});

// Step 3: Set New Password
router.post('/set-new-password', async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (
      !user ||
      !user.resetPassword?.code ||
      user.resetPassword.code !== code
    )
      return res.status(400).json({ msg: 'Invalid code' });

    if (Date.now() > new Date(user.resetPassword.expiry).getTime())
      return res.status(400).json({ msg: 'Code expired' });

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;

    user.resetPassword = { code: null, expiry: null };
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
