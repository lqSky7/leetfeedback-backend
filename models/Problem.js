const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  difficulty: {
    level: { type: Number, enum: [0, 1, 2], required: true }, // 0=Easy,1=Medium,2=Hard
    label: { type: String, required: true }
  },
  parent_topic: { type: String, required: true },
  grandparent: { type: String, required: true },
  problem_link: { type: String, required: true },
  platform: { type: String, enum: ['leetcode', 'codeforces', 'custom'], required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', problemSchema);