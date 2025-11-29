const express = require('express');
const router = express.Router()
const jwt = require('jsonwebtoken');
const courseModel = require('../model/courseModel')
const auth = require('../middlewares/authCheck')
const fs = require("fs");
const userModel = require('../model/userModel');
const AWS = require('aws-sdk');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const cloudinary = require('cloudinary').v2
require('dotenv').config()

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

const progressMap = {}; 

router.post("/upload", auth, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const verify = jwt.verify(token, process.env.JWT_SECRET);
  const userId = verify.userId;

  try {
    progressMap[userId] = { progress: 0, message: "Starting upload..." };

    const { title, description, category } = req.body;
    if (!title || !description || !category || !req.files?.thumbnail || !req.files?.video) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    progressMap[userId] = { progress: 10, message: "Uploading thumbnail..." };
    let image;
    try {
      image = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
        folder: "CourseThumbnail",
        resource_type: "image",
      });

      fs.unlinkSync(req.files.thumbnail.tempFilePath); 
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      return res.status(500).json({ msg: "Error uploading thumbnail", error: error.message });
    }

    progressMap[userId] = { progress: 50, message: "Uploading video..." };
    let video;
    try {
      video = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
        folder: "CourseVideos",
        resource_type: "video", 
        eager: [{ width: 1280, height: 720, crop: "limit", quality: "auto", fetch_format: "mp4" }], 
      });
      fs.unlinkSync(req.files.video.tempFilePath)
    } catch (error) {
      if (image) {
        await cloudinary.uploader.destroy(image.public_id, { resource_type: "image" });
      }
      console.error("Video upload error:", error);
      return res.status(500).json({ msg: "Error uploading video", error: error.message });
    }

    progressMap[userId] = { progress: 90, message: "Saving course to database..." };

    const course = await courseModel.create({
      title,
      description,
      category,
      userId,
      thumbnail: image.secure_url,
      thumbnailId: image.public_id,
      video: video.secure_url,
      videoId: video.public_id,
    });
    await userModel.findByIdAndUpdate(userId, {
      $push: { courses: course._id },
    });

    progressMap[userId] = { progress: 100, message: "Upload complete!" };

    res.status(201).json({ msg: "Course Uploaded Successfully", course });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  } finally {
    delete progressMap[userId]; 
  }
});

router.get("/upload-progress", auth, (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    const userId = verify.userId;

    const progress = progressMap[userId] || { progress: 0, message: "No upload in progress" };
    res.json(progress);
});

router.get('/all-courses', async (req, res) => {
    try {
        const courses = await courseModel.find().populate('userId', 'name email profilePic profilePicId designation')
        res.status(200).json(courses)
    } catch (error) {
        console.log(error)
    }
})

router.post('/:id/reviews', auth, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);

        const course = await courseModel.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        course.reviews.push({ userId, comment: req.body.newComment });
        await course.save();

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get('/:id/reviews', auth, async (req, res) => {
    try {
        const course = await courseModel.findById(req.params.id)
            .populate({
                path: 'reviews.userId',
                select: 'name profilePicId profilePic'
            });

        res.json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/deletecomment/:courseId/:commentId', auth, async (req, res) => {
    try {
        const course = await courseModel.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const commentIndex = course.reviews.findIndex(
            (item) => item._id.toString() === req.params.commentId
        );

        if (commentIndex === -1) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        course.reviews.splice(commentIndex, 1);
        await course.save();

        res.status(200).json({ msg: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

router.post('/enroll/:courseId', auth, async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ msg: 'Authorization token is missing' });
    }

    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET);

        const course = await courseModel.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const user = await userModel.findById(verify.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.coursesEnrolled.some(item => item.toString() === req.params.courseId)) {
            return res.status(400).json({ msg: 'You are already enrolled in this course' });
        }

        user.coursesEnrolled.push(req.params.courseId);
        await user.save();


        if (course.students.some(item => item.userId.toString() === verify.userId)) {
            return res.status(400).json({ msg: 'You are already enrolled in this course' });
        }

        course.students.push({ userId: verify.userId });
        await course.save();

        res.status(200).json({ msg: 'You are successfully enrolled in the course' });

    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({ msg: 'Error enrolling the student', error: error.message });
    }
});

router.delete('/leavecourse/:courseId', auth, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ msg: 'Authorization token is missing' });
        }
        const verify = jwt.verify(token, process.env.JWT_SECRET);

        const course = await courseModel.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const user = await userModel.findById(verify.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const userIndex = user.coursesEnrolled.findIndex(item => item.toString() === req.params.courseId);
        if (userIndex === -1) {
            return res.status(400).json({ msg: 'You are not enrolled in this course' });
        }

        user.coursesEnrolled.splice(userIndex, 1);
        await user.save();


        const courseIndex = course.students.findIndex(item => item.userId.toString() === verify.userId);
        if (courseIndex === -1) {
            return res.status(400).json({ msg: 'You are not enrolled in this course' });
        }

        course.students.splice(courseIndex, 1);
        await course.save();

        res.status(200).json({ msg: 'You have successfully left the course' });

    } catch (error) {
        console.error('Error leaving course:', error);
        res.status(500).json({ msg: 'Internal server error', error: error.message });
    }
});

router.delete('/deletecourse/:courseId', auth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ msg: "No token provided" });
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    const course = await courseModel.findById(req.params.courseId);
    if (!course) return res.status(404).json({ msg: "Course not found" });
    if (verify.userId !== course.userId.toString()) {
      return res.status(403).json({ msg: "Unauthorized User" });
    }

    if (course.videoId) {
      try {
        await cloudinary.uploader.destroy(course.videoId, { resource_type: "video" });
      } catch (err) {
        console.error('Video delete failed:', err);
      }
    }

    if (course.thumbnailId) {
      try {
        await cloudinary.uploader.destroy(course.thumbnailId, { resource_type: "image" });
      } catch (err) {
        console.error('Thumbnail delete failed:', err);
      }
    }

    await courseModel.findByIdAndDelete(req.params.courseId);

    res.status(200).json({ msg: 'Course Deleted Successfully' });
  } catch (error) {
    console.error("Delete Course Error:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

router.put('/editcourse/:courseId', auth, async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const token = req.headers.authorization?.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    if (verify.userId !== course.userId.toString()) {
      return res.status(403).json({ msg: "Unauthorized User" });
    }

    const newData = {
      title: req.body.title || course.title,
      category: req.body.category || course.category,
      description: req.body.description || course.description,
    };

    let updatedImage;
    if (req.files?.thumbnail) {
      try {
        if (course.thumbnailId) {
          await cloudinary.uploader.destroy(course.thumbnailId, {
            resource_type: "image",
          });
        }
        updatedImage = await cloudinary.uploader.upload(
          req.files.thumbnail.tempFilePath,
          {
            folder: "CourseThumbnail",
            resource_type: "image",
          }
        );

        fs.unlinkSync(req.files.thumbnail.tempFilePath);

        newData.thumbnail = updatedImage.secure_url;
        newData.thumbnailId = updatedImage.public_id;
      } catch (error) {
        console.error("Thumbnail upload error:", error);
        return res
          .status(500)
          .json({ msg: "Error uploading thumbnail", error: error.message });
      }
    }

    let updatedVideo;
    if (req.files?.video) {
      try {
        if (course.videoId) {
          await cloudinary.uploader.destroy(course.videoId, {
            resource_type: "video",
          });
        }

        updatedVideo = await cloudinary.uploader.upload(
          req.files.video.tempFilePath,
          {
            folder: "CourseVideos",
            resource_type: "video",
            eager: [{ width: 1280, height: 720, crop: "limit" }], 
          }
        );

        fs.unlinkSync(req.files.video.tempFilePath);

        newData.video = updatedVideo.secure_url;
        newData.videoId = updatedVideo.public_id;
      } catch (error) {
        if (updatedImage) {
          await cloudinary.uploader.destroy(updatedImage.public_id, {
            resource_type: "image",
          });
        }

        console.error("Video upload error:", error);
        return res
          .status(500)
          .json({ msg: "Error uploading video", error: error.message });
      }
    }

    const updatedCourse = await courseModel.findByIdAndUpdate(
      req.params.courseId,
      newData,
      { new: true }
    );

    res.json(updatedCourse);
  } catch (err) {
    console.error("Edit course failed:", err);
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: err.message });
  }
});

module.exports = router;