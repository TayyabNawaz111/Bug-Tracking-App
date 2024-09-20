const express = require('express');
const router = express.Router();
const { getAllActivityLogs } = require('../controllers/activityLogController');

// Route to get all activity logs
router.get('/', getAllActivityLogs);

module.exports = router;
