const express = require('express');
const router = express.Router();
const { getAllComments } = require('../controllers/commentController');

// Route to get all comments
router.get('/', getAllComments);

module.exports = router;
