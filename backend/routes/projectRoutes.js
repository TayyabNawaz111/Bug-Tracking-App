const express = require("express");
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
} = require("../controllers/projectController");
const authenticateToken = require("../middlewares/authenticateToken"); // import authenticator

// Route to get all projects
router.get("/", getAllProjects);

//Route to get specific project

router.get("/:id", getProjectById);

router.post("/createProject", authenticateToken, createProject);
module.exports = router;
