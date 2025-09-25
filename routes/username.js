const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const usernameController = require('../controllers/usernameController');

// Public routes
router.get('/:username', usernameController.getUserProfile);
router.get('/:username/endpoints', usernameController.getAvailableEndpoints);
router.get('/:username/github', usernameController.getUserGitHub);

module.exports = router;
