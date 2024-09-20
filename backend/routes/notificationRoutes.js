const express = require('express');
const router = express.Router();
const { getAllNotifications } = require('../controllers/notificationController');

// Route to get all notifications
router.get('/', getAllNotifications);

module.exports = router;
