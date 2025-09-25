const mongoose = require('mongoose');

const gamificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  xp: { type: Number, default: 0 },
  streak_days: { type: Number, default: 0 },
  last_streak_date: Date,
  badges: [{ type: String }],
  level: { type: Number, default: 1 },
  rank: { type: Number, default: 0 }
});

module.exports = mongoose.model('Gamification', gamificationSchema);