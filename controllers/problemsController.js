const Problem = require('../models/Problem');
const updateGamification = require('../services/gamificationService');

exports.pushProblem = async (req, res) => {
  try {
    const { name, platform, difficulty, solved, ignored, parent_topic, grandparent, problem_link } = req.body;

    // Validate required fields
    const missing = [];
    if (!name) missing.push('name');
    if (!platform) missing.push('platform');
    if (difficulty === undefined || difficulty === null) missing.push('difficulty');
    if (!parent_topic) missing.push('parent_topic');
    if (!problem_link) missing.push('problem_link');

    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
    }

    const problem = new Problem({
      name,
      platform,
      difficulty,
      solved,
      ignored,
      parent_topic,
      grandparent,
      problem_link
    });

    await problem.save();

    // Update gamification based on difficulty
    let xpGain = 10; // default
    if (difficulty === 0) xpGain = 10;
    else if (difficulty === 1) xpGain = 20;
    else if (difficulty === 2) xpGain = 30;

    await updateGamification(req.user.id, xpGain);

    res.status(201).json({ message: 'Problem added successfully', problem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSolvedProblems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { 'solved.value': true } },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const problems = await Problem.aggregate(pipeline);
    const total = await Problem.countDocuments({ 'solved.value': true });

    res.json({ problems, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProblems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const problems = await Problem.aggregate([
      { $sort: { created_at: -1 } }, // Sort by newest first
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await Problem.countDocuments();
    res.json({ problems, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};