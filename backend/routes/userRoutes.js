
const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById } = require('../controllers/userController');

// Route to get all users
router.get('/', getAllUsers);

// Route to get a user by ID
router.get('/:id', getUserById);

module.exports = router;
