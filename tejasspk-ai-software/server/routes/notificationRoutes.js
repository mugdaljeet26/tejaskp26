const express = require('express');
const router = express.Router();
const { sendNotification, getAllNotifications, getMyNotifications } = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, sendNotification);
router.get('/all', protect, adminOnly, getAllNotifications);
router.get('/my', protect, getMyNotifications);

module.exports = router;
