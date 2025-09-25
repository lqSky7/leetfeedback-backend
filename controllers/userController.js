const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Gamification = require('../models/Gamification');

// Static catalog of relevant API endpoints to surface in the UI
const PUBLIC_API_BASE_URL = process.env.PUBLIC_API_BASE_URL || 'https://leetfeedback-backend.onrender.com';

const endpointCatalog = [
  {
    category: 'Authentication',
    method: 'POST',
    path: '/api/auth/register',
    description: 'Create a new backend-managed user account.',
    authRequired: false,
  },
  {
    category: 'Authentication',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate with email and password to receive a token.',
    authRequired: false,
  },
  {
    category: 'Authentication',
    method: 'PUT',
    path: '/api/auth/github',
    description: 'Link GitHub information to your profile.',
    authRequired: true,
  },
  {
    category: 'Problems',
    method: 'GET',
    path: '/api/problems',
    description: 'Fetch paginated problems tracked by LeetFeedback.',
    authRequired: true,
  },
  {
    category: 'Problems',
    method: 'GET',
    path: '/api/problems/solved',
    description: 'Retrieve recently solved problems across the community.',
    authRequired: true,
  },
  {
    category: 'Problems',
    method: 'POST',
    path: '/api/problems/push',
    description: 'Add a new problem and earn XP based on difficulty.',
    authRequired: true,
  },
  {
    category: 'Gamification',
    method: 'GET',
    path: '/api/gamification',
    description: 'View your current XP and rank progression.',
    authRequired: true,
  },
  {
    category: 'Friends',
    method: 'POST',
    path: '/api/friends/add',
    description: 'Send a friend request by username.',
    authRequired: true,
  },
  {
    category: 'Friends',
    method: 'GET',
    path: '/api/friends',
    description: 'List your current LeetFeedback friends.',
    authRequired: true,
  },
  {
    category: 'Friends',
    method: 'GET',
    path: '/api/friends/gamification',
    description: "Compare your friends' XP and levels.",
    authRequired: true,
  },
  {
    category: 'Git Integration',
    method: 'GET',
    path: '/api/git/getGitSolvedQuestions',
    description: 'Fetch solved questions from your configured Git repository.',
    authRequired: true,
  },
  {
    category: 'Administration',
    method: 'GET',
    path: '/api/admin/users',
    description: 'List users (admin only).',
    authRequired: true,
    role: 'admin',
  },
  {
    category: 'Administration',
    method: 'DELETE',
    path: '/api/admin/users/:userId',
    description: 'Remove a user (admin only).',
    authRequired: true,
    role: 'admin',
  },
].map((endpoint) => ({
  ...endpoint,
  url: `${PUBLIC_API_BASE_URL}${endpoint.path}`,
}));

const getUserOverview = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).populate('friends', 'username email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSelf = req.user.id === user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const friendsList = Array.isArray(user.friends) ? user.friends : [];

    const [progressStats, gamification] = await Promise.all([
      UserProgress.aggregate([
        { $match: { user_id: user._id } },
        {
          $group: {
            _id: '$user_id',
            trackedProblems: { $sum: 1 },
            solvedCount: {
              $sum: {
                $cond: ['$$ROOT.solved.value', 1, 0],
              },
            },
          },
        },
      ]),
      Gamification.findOne({ user_id: user._id }),
    ]);

    const progressSummary = progressStats[0] || {
      trackedProblems: 0,
      solvedCount: 0,
    };

    const payload = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        github: user.github,
        created_at: user.created_at,
        last_active: user.last_active,
        friends: friendsList.map((friend) => ({
          id: friend._id,
          username: friend.username,
          email: friend.email,
        })),
      },
      stats: {
        trackedProblems: progressSummary.trackedProblems,
        solvedProblems: progressSummary.solvedCount,
        friendsCount: friendsList.length,
        githubLinked: Boolean(user.github?.linked),
        xp: gamification?.xp ?? 0,
        level: gamification?.level ?? 1,
      },
      endpoints: endpointCatalog,
    };

    res.json(payload);
  } catch (error) {
    console.error('getUserOverview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserOverview,
};
