const express = require('express');
const passport = require('../config/passport');
const { register, login, githubCallback, updateGithub } = require('../controllers/auth');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/github', auth, updateGithub);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), githubCallback);

module.exports = router;