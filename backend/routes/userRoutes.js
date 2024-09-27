const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
} = require("../controllers/userController");

// Route to get all users
router.get("/", getAllUsers);

// Route to get a user by ID
router.get("/:id", getUserById);
//Route to change role of a user

router.post("/update-role", updateUserRole);

module.exports = router;
