const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  platform: { type: String, required: true },
  difficulty: { type: Number, enum: [0, 1, 2], required: true }, // 0=Easy,1=Medium,2=Hard
  solved: {
    value: { type: Boolean, default: false },
    date: { type: Number, default: 0 },
    tries: { type: Number, default: 0 }
  },
  ignored: { type: Boolean, default: false },
  parent_topic: { type: String, required: true },
  grandparent: { type: String },
  problem_link: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', problemSchema);