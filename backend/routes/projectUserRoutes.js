const express = require("express");
const router = express.Router();
const {
  getAllProjectUsers,
  assignUsers,
  getAssignedProjects,
  removeUserFromProject,
  getUsersForProject,
} = require("../controllers/projectUserController");
const authenticateToken = require("../middlewares/authenticateToken");
const { authorizeRole } = require("../middlewares/authorizeRole");

console.log("projectUserRoutes loaded");

// Route to get all project users
router.get("/", authenticateToken, authorizeRole("Admin"), getAllProjectUsers);

// Route to assign users to a project
router.put(
  "/:projectId/assign",
  authenticateToken,
  authorizeRole("Admin"),
  assignUsers
);

// Route to remove a single user assignment from a project
router.delete(
  "/:projectId/assign/:userId",
  authenticateToken,
  authorizeRole("Admin"),
  removeUserFromProject
);

// Route to get assigned projects
router.get(
  "/assignedProjects",
  authenticateToken,
  authorizeRole("Developer", "Tester", "Admin"),
  getAssignedProjects
);

// Get users assigned to a project
// Lightweight unauthenticated test route to verify route registration
router.get("/:projectId/users/test", (req, res) => {
  return res.json({ ok: true, projectId: req.params.projectId });
});

router.get(
  "/:projectId/users",
  authenticateToken,
  authorizeRole("Developer", "Tester", "Admin"),
  getUsersForProject
);

module.exports = router;
