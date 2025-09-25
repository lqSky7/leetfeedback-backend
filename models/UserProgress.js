const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  solved: {
    value: { type: Boolean, default: false },
    date: Date,
    tries: Number,
    time_taken: Number // seconds
  },
  ignored: { type: Boolean, default: false },
  history: [{
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['attempted', 'solved', 'ignored'], required: true },
    tries: Number,
    time_taken: Number, // seconds
    commit_ref: String
  }],
  last_updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserProgress', userProgressSchema);