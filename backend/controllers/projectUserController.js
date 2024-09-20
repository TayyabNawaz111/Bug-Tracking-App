const ProjectUser = require("../models/ProjectUser");  // Import the projectUser model

// Controller to get all Project Users
const getAllProjectUsers = async (req, res) => {
  try {
    const projectUsers = await ProjectUser.findAll();
    res.json(projectUsers);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch Project Users" });
  }
};

module.exports = {
  getAllProjectUsers,
};
