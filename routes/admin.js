const express = require('express');

const router = express.Router();

const admin = require('../middleware/admin');

const User = require('../models/User');

router.get('/users', admin, async (req, res) => {

  try {

    const users = await User.find().select('-password_hash');

    res.json(users);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});

router.delete('/users/:userId', admin, async (req, res) => {

  try {

    const userId = req.params.userId;

    if (userId === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });

    const user = await User.findByIdAndDelete(userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted' });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});

module.exports = router;