const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Resource = require('../models/Resource');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// GET /api/resources — ✅ filter by user's college
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'student' || req.user.role === 'teacher') {
      // Only show resources for this user's college
      if (req.user.college) {
        const collegeId = req.user.college._id || req.user.college;
        filter.college = collegeId;
      }
    }
    // admin sees all resources — no filter

    if (req.query.type)    filter.type    = req.query.type;
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.search)  filter.title   = { $regex: req.query.search, $options: 'i' };

    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name avatar')
      .populate('college', 'name short color')
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/resources — ✅ teacher uploads locked to their college
router.post('/', protect, teacherOnly, upload.single('file'), async (req, res) => {
  try {
    // Force teacher's own college — they can't upload for another college
    const collegeId = req.user.college?._id || req.user.college || req.body.college;

    const resource = await Resource.create({
      ...req.body,
      college: collegeId,
      uploadedBy: req.user._id,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : '',
      collegeName:  req.body.collegeName  || '',
      collegeShort: req.body.collegeShort || '',
      tags: req.body.tags
        ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()))
        : [],
    });

    await resource.populate('uploadedBy', 'name avatar');
    await resource.populate('college', 'name short color');

    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/resources/:id/download
router.put('/:id/download', async (req, res) => {
  try {
    res.json(await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/resources/:id/register (doubt sessions)
router.put('/:id/register', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Session not found' });
    if (resource.registered >= resource.seats)
      return res.status(400).json({ message: 'Session is full' });
    resource.registered += 1;
    if (resource.registered >= resource.seats) resource.status = 'full';
    await resource.save();
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/resources/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Resource not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;