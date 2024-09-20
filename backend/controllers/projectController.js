const Project = require("../models/Project"); // Import the project model

// Controller to get all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch projects' });
  }
};

// Controller to get a single project by ID
const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch project' });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
};
