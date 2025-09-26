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
    // Check if user exists in request (from auth middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let targetUser;
    
    // If POST request with username in body, find that user
    if (req.method === 'POST' && req.body.username) {
      targetUser = await User.findOne({ username: req.body.username });
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      console.log(`Looking up friends gamification for user: ${req.body.username}`);
    } else {
      // GET request - use authenticated user
      targetUser = await User.findById(req.user.id);
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      console.log(`Looking up friends gamification for authenticated user: ${targetUser.username}`);
    }

    const friendsIds = targetUser.friends || [];
    console.log('User friends count:', friendsIds.length);
    console.log('Friends IDs:', friendsIds.map(id => id.toString()));
    
    // If user has no friends, return empty array
    if (friendsIds.length === 0) {
      console.log('User has no friends');
      return res.json([]);
    }

    const gam = await Gamification.find({ user_id: { $in: friendsIds } }).populate('user_id', 'username');
    console.log('Gamification records found:', gam.length);
    console.log('Gamification data:', gam.map(g => ({ username: g.user_id?.username, xp: g.xp, level: g.level })));
    
    // Return the gamification data for friends
    res.json(gam);
  } catch (error) {
    console.error('getFriendsGamification error:', error);
    res.status(500).json({ error: error.message });
  }
};