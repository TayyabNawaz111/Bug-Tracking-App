const Project = require("../models/Project"); // Import the project model
// Controller to get all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch projects" });
  }
};

// Controller to get a single project by ID
const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch project" });
  }
};
const createProject = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.userId; // Extracted user ID from JWT
  try {
    // Create the project and associate it with the logged-in user
    const project = await Project.create({
      title,
      description,
      createdBy: userId,
    });

    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
};
