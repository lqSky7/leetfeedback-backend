const User = require('../models/User');
const Problem = require('../models/Problem');
const UserProgress = require('../models/UserProgress');

// Get user profile and stats by username
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username, excluding sensitive data
    const user = await User.findOne({ username })
      .select('-password_hash -email')
      .populate('friends', 'username created_at');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get user's problem-solving progress
    const userProgress = await UserProgress.find({ user: user._id })
      .populate('problems', 'title difficulty category');

    // Calculate stats
    const totalProblems = userProgress.length;
    const solvedProblems = userProgress.filter(p => p.status === 'solved').length;
    const difficultyBreakdown = userProgress.reduce((acc, progress) => {
      if (progress.problems && progress.problems.difficulty) {
        acc[progress.problems.difficulty] = (acc[progress.problems.difficulty] || 0) + 1;
      }
      return acc;
    }, {});

    // Get recent activity (last 10 solved problems)
    const recentActivity = await UserProgress.find({ 
      user: user._id, 
      status: 'solved' 
    })
      .populate('problems', 'title difficulty')
      .sort({ updated_at: -1 })
      .limit(10);

    const profileData = {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        github: user.github,
        created_at: user.created_at,
        last_active: user.last_active,
        friends: user.friends
      },
      stats: {
        totalProblems,
        solvedProblems,
        successRate: totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0,
        difficultyBreakdown
      },
      recentActivity: recentActivity.map(activity => ({
        problem: activity.problems,
        solvedAt: activity.updated_at,
        attempts: activity.attempts || 1
      }))
    };

    res.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get available API endpoints for a user (showcasing the API)
exports.getAvailableEndpoints = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Check if user exists
    const user = await User.findOne({ username }).select('username role');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const endpoints = [
      {
        method: 'GET',
        path: `/api/username/${username}`,
        description: 'Get user profile and statistics',
        auth: 'Optional',
        response: 'User profile with stats and recent activity'
      },
      {
        method: 'GET',
        path: `/api/username/${username}/endpoints`,
        description: 'Get available API endpoints for this user',
        auth: 'None',
        response: 'List of available endpoints'
      },
      {
        method: 'GET',
        path: `/api/problems`,
        description: 'Get all available problems',
        auth: 'Required',
        response: 'List of coding problems'
      },
      {
        method: 'GET',
        path: `/api/friends`,
        description: 'Get user friends list',
        auth: 'Required',
        response: 'List of user friends'
      },
      {
        method: 'POST',
        path: `/api/git/sync`,
        description: 'Sync with GitHub repository',
        auth: 'Required',
        response: 'Sync status and updated data'
      }
    ];

    // Add admin endpoints if user is admin
    if (user.role === 'admin') {
      endpoints.push(
        {
          method: 'GET',
          path: '/api/admin/users',
          description: 'Get all users (Admin only)',
          auth: 'Admin Required',
          response: 'List of all users'
        },
        {
          method: 'GET',
          path: '/api/admin/stats',
          description: 'Get system statistics (Admin only)',
          auth: 'Admin Required',
          response: 'System-wide statistics'
        }
      );
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        role: user.role
      },
      endpoints: endpoints
    });

  } catch (error) {
    console.error('Error fetching endpoints:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get user's GitHub integration status and repositories
exports.getUserGitHub = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username })
      .select('username github');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      github: user.github || {
        linked: false,
        username: null,
        repo: null,
        branch: null
      }
    });

  } catch (error) {
    console.error('Error fetching GitHub info:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};