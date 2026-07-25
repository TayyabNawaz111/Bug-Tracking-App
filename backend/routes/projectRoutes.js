const express = require("express");
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  getProjectDetails,
  createProject,
} = require("../controllers/projectController");
const authenticateToken = require("../middlewares/authenticateToken");
const { authorizeRole } = require("../middlewares/authorizeRole");

// Route to get all projects
router.get("/", authenticateToken, authorizeRole("Developer", "Tester", "Admin"), getAllProjects);

// Route to get project details with assignments and tickets
router.get(
  "/:id/details",
  authenticateToken,
  authorizeRole("Developer", "Tester", "Admin"),
  getProjectDetails
);

// Route to get specific project
router.get("/:id", authenticateToken, authorizeRole("Developer", "Tester", "Admin"), getProjectById);

router.post(
  "/createProject",
  authenticateToken,
  authorizeRole("Developer", "Admin"),
  createProject
);
module.exports = router;
