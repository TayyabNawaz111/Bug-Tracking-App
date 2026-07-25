const express = require('express');
const router = express.Router();
const { getAllActivityLogs } = require('../controllers/activityLogController');
const authenticateToken = require('../middlewares/authenticateToken');
const { authorizeRole } = require('../middlewares/authorizeRole');

// Route to get all activity logs
router.get(
  '/',
  authenticateToken,
  authorizeRole('Admin'),
  getAllActivityLogs
);

module.exports = router;
