const express = require('express');
const router = express.Router();
const { createSubmission, getMySubmissions, getAllSubmissions } = require('../controllers/submissionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createSubmission);
router.get('/my', protect, getMySubmissions);
router.get('/all', protect, adminOnly, getAllSubmissions);

module.exports = router;
