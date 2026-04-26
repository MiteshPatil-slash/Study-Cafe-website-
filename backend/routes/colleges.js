const express = require('express');
const router = express.Router();
const College = require('../models/College');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/colleges
router.get('/', async (req, res) => {
  try {
    const colleges = await College.find().sort({ rating: -1 });
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/colleges  (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const college = await College.create(req.body);
    res.status(201).json(college);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/colleges/:id  (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await College.findByIdAndDelete(req.params.id);
    res.json({ message: 'College deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;