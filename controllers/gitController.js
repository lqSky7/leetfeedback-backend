const axios = require('axios');
const User = require('../models/User');

exports.getGitSolvedQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.github.repo) return res.status(400).json({ error: 'GitHub repo not set' });

    const { username, repo, branch } = user.github;
    const url = `https://api.github.com/repos/${username}/${repo}/commits`;
    const params = branch ? { sha: branch } : {};
    const response = await axios.get(url, { params });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};