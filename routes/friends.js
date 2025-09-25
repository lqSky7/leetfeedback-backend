const express = require('express');
const router = express.Router();
const { addFriend, getFriends, getFriendsGamification } = require('../controllers/friendsController');
const auth = require('../middleware/auth');

router.post('/add', auth, addFriend);
router.get('/', auth, getFriends);
router.get('/gamification', auth, getFriendsGamification);

module.exports = router;