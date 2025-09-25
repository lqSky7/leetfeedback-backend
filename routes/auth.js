const express = require('express');
const passport = require('../config/passport');
const { register, login, githubCallback } = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), githubCallback);

module.exports = router;