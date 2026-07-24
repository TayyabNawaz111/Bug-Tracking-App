const express = require("express");
const router = express.Router();
const {
  getAllRoles
} = require("../controllers/roleController");
const authenticateToken = require("../middlewares/authenticateToken");
const { authorizeRole } = require("../middlewares/authorizeRole");

// Route to get all roles
router.get(
  "/",
  authenticateToken,
  authorizeRole("Admin"),
  getAllRoles
);

module.exports = router;
