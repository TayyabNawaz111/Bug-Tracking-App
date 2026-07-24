const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  addUser,
  deleteUser,
  updateUserName,
} = require("../controllers/userController");
const authenticateToken = require("../middlewares/authenticateToken");
const { authorizeRole, authorizeSelfOrRoles } = require("../middlewares/authorizeRole");

// Route to get all users
router.get("/", authenticateToken, authorizeRole("Admin"), getAllUsers);

// Route to get a user by ID
router.get("/:id", authenticateToken, authorizeSelfOrRoles("Admin"), getUserById);

// Route to change role of a user
router.post(
  "/update-role",
  authenticateToken,
  authorizeRole("Admin"),
  updateUserRole
);

// Route to add a new user (Admin functionality)
router.post("/add", authenticateToken, authorizeRole("Admin"), addUser);

// Route to delete a user (Admin functionality)
router.delete("/:id", authenticateToken, authorizeRole("Admin"), deleteUser);
  
// Route to restore a soft-deleted user (Admin functionality)
router.post("/:id/restore", authenticateToken, authorizeRole("Admin"), (req, res) => {
  // import controller lazily to avoid circular reference issues
  const { restoreUser } = require("../controllers/userController");
  return restoreUser(req, res);
});

router.put(
  "/updateUsername",
  authenticateToken,
  authorizeSelfOrRoles("Admin"),
  updateUserName
);

module.exports = router;
