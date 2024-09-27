const express = require("express");
const router = express.Router();
const {
  getAllProjectUsers,
  assignUsers,
} = require("../controllers/projectUserController");
const authenticateToken = require("../middlewares/authenticateToken");

// Route to get all projects
router.get("/", getAllProjectUsers);
// Route to assign users to a project
router.post("/:projectId/assign", authenticateToken, assignUsers);

module.exports = router;
