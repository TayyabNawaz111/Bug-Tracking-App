const express = require("express");
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
} = require("../controllers/projectController");

// Route to get all projects
router.get("/", getAllProjects);

//Route to get specific project

router.get("/:id", getProjectById);

module.exports = router;
