const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  github: {
    id: String,
    username: String,
    repo: String,
    branch: String,
    linked: { type: Boolean, default: false }
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  created_at: { type: Date, default: Date.now },
  last_active: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);