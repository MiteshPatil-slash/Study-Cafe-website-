const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, college } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      avatar: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      // ✅ save college ObjectId (sent from Signup.js dropdown)
      college: college || null,
    });

    // ✅ populate college so frontend gets full object
    await user.populate('college', '_id name short color city');

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        college: user.college,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ populate college on login so frontend knows the user's college
    const user = await User.findOne({ email }).populate('college', '_id name short color city');

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        // ✅ full college object returned — frontend uses this to filter
        college: user.college,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  // req.user already has college populated (fixed in authMiddleware)
  res.json(req.user);
});

// POST /api/auth/create-teacher — Admin only
router.post('/create-teacher', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password, college } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists)
      return res.status(400).json({ message: 'This email is already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const teacher = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'teacher',
      avatar,
      college: college || null,
    });

    await teacher.populate('college', '_id name short');

    res.status(201).json({
      message: 'Teacher account created successfully',
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        college: teacher.college,
        avatar: teacher.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;