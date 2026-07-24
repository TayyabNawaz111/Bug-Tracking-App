const express = require('express');
const router = express.Router();
const { getAllNotifications } = require('../controllers/notificationController');
const authenticateToken = require('../middlewares/authenticateToken');
const { authorizeRole } = require('../middlewares/authorizeRole');

// Route to get all notifications
router.get(
  '/',
  authenticateToken,
  authorizeRole('Developer', 'Tester', 'Admin'),
  getAllNotifications
);

module.exports = router;
