const User = require('../models/User');
const Gamification = require('../models/Gamification');

exports.addFriend = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });

    const friend = await User.findOne({ username });
    if (!friend) return res.status(404).json({ error: 'User not found' });

    const user = await User.findById(req.user.id);
    if (user.friends.includes(friend._id)) return res.status(400).json({ error: 'Already friends' });

    user.friends.push(friend._id);
    await user.save();

    res.json({ message: 'Friend added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'username email');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFriendsGamification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const friendsIds = user.friends;
    const gam = await Gamification.find({ user_id: { $in: friendsIds } }).populate('user_id', 'username');
    res.json(gam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};