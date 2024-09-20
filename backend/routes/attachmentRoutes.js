const express = require('express');
const router = express.Router();
const { getAllAttachments } = require('../controllers/attachmentController');

// Route to get all attachments
router.get('/', getAllAttachments);

module.exports = router;
