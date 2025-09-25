const express = require('express');
const router = express.Router();
const { pushProblem, getSolvedProblems, getProblems } = require('../controllers/problemsController');
const auth = require('../middleware/auth');

router.post('/push', auth, pushProblem);
router.get('/solved', auth, getSolvedProblems);
router.get('/', auth, getProblems);

module.exports = router;