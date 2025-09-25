const express = require('express');
const router = express.Router();
const Gamification = require('../models/Gamification');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const gam = await Gamification.findOne({ user_id: req.user.id });
    if (!gam) return res.status(404).json({ error: 'Gamification not found' });
    res.json(gam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;