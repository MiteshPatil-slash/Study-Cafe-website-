const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

// 🔥 DELETE (simple - no auth)
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    console.log("Deleting:", id);

    const deleted = await Resource.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;