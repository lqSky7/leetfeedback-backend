const express = require('express');
const router = express.Router();
const { getGitSolvedQuestions } = require('../controllers/gitController');
const auth = require('../middleware/auth');

router.get('/getGitSolvedQuestions', auth, getGitSolvedQuestions);

module.exports = router;