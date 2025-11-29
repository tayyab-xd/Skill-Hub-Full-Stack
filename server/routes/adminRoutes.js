const express = require('express');
const router = express.Router()
const jwt = require('jsonwebtoken')
const userModel = require('../model/userModel.js')
require('dotenv').config();
const mongoose = require("mongoose");
const courseModel = require('../model/courseModel.js');
const gigModel = require('../model/gigModel.js');
const orderModel = require('../model/orderModel.js');

const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if(user.isAdmin===false){
      return res.status(403).json({ error: "Forbidden: Not Admin" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

router.get('/data', async (req, res) => {
  try {
    const users = await userModel.find();
    const courses = await courseModel.find();
    const gigs = await gigModel.find();

    res.json({ users, courses, gigs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin data' });
  }
});

router.delete('/delete/:type/:id', verifyAdmin, async (req, res) => {
  const { type, id } = req.params;
  let Model;

  switch (type) {
    case 'course':
      Model = Course;
      break;
    case 'gig':
      Model = Gig;
      break;
    case 'comment':
      Model = Comment;
      break;
    default:
      return res.status(400).json({ error: 'Invalid type' });
  }

  try {
    await Model.findByIdAndDelete(id);
    res.json({ message: `${type} deleted` });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
