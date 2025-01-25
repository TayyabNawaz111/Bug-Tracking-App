const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  addUser, 
  deleteUser,
  updateUserName} = require("../controllers/userController");

// Route to get all users
router.get("/", getAllUsers);

// Route to get a user by ID
router.get("/:id", getUserById);

// Route to change role of a user
router.post("/update-role", updateUserRole);

// Route to add a new user (Admin functionality)
router.post("/add", addUser);

// Route to delete a user (Admin functionality)
router.delete("/:id", deleteUser);

router.put("/updateUsername", updateUserName);

module.exports = router;
