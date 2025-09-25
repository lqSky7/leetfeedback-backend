const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { username, email, password, github_username, github_repo, github_branch } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username,
      email,
      password_hash,
      github: {
        username: github_username,
        repo: github_repo,
        branch: github_branch
      },
      role: 'student'
    });

    await user.save();

    // Create JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1y' });

    res.status(201).json({ token, user: { id: user._id, username, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last active
    user.last_active = new Date();
    await user.save();

    // Create JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '10y' });

    // Set cookie
    res.cookie('token', token, { httpOnly: true, maxAge: 10 * 365 * 24 * 60 * 60 * 1000 }); // 10 years

    res.json({ token, user: { id: user._id, username: user.username, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const githubCallback = (req, res) => {
  // After GitHub auth, redirect or send token
  const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '10y' });
  res.redirect(`http://localhost:3000/auth/callback?token=${token}`); // Assuming frontend on 3000
};

module.exports = { register, login, githubCallback };