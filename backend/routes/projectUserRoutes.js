const express = require("express");
const router = express.Router();
const {
  getAllProjectUsers,
  assignUsers,
  getAssignedProjects,
} = require("../controllers/projectUserController");
const authenticateToken = require("../middlewares/authenticateToken");

// Route to get all projects
router.get("/", getAllProjectUsers);
// Route to assign users to a project
router.put("/:projectId/assign", authenticateToken, assignUsers);
// Route to get assigned projects
router.get("/assignedProjects", authenticateToken, getAssignedProjects);

module.exports = router;
