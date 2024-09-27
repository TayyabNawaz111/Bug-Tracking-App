const express = require('express');
const router = express.Router();
const { signup, signin } = require('../controllers/authController');

// Route for user signup
router.post('/signup', signup);

// Route for user signin
router.post('/signin', signin);

module.exports = router;
