const express = require('express');
const router = express.Router();
const { getAllAttachments } = require('../controllers/attachmentController');
const authenticateToken = require('../middlewares/authenticateToken');
const { authorizeRole } = require('../middlewares/authorizeRole');

// Route to get all attachments
router.get(
  '/',
  authenticateToken,
  authorizeRole('Admin'),
  getAllAttachments
);

module.exports = router;
