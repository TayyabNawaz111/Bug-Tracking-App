const ProjectUser = require("../models/ProjectUser"); // Import the projectUser model

// Controller to get all Project Users
const getAllProjectUsers = async (req, res) => {
  try {
    const projectUsers = await ProjectUser.findAll();
    res.json(projectUsers);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch Project Users" });
  }
};
// Controller to assign users to a project
const assignUsers = async (req, res) => {
  const { projectId } = req.params;
  const { userIds } = req.body;

  try {
    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "No users provided for assignment" });
    }

    // Check for existing assignments
    const existingAssignments = await ProjectUser.findAll({
      where: {
        projectId,
        userId: userIds, 
      },
    });

    // Get the IDs of already assigned users
    const existingUserIds = existingAssignments.map(
      (assignment) => assignment.userId
    );

    // Filter out userIds that are already assigned
    const newUserIds = userIds.filter(
      (userId) => !existingUserIds.includes(userId)
    );

    // If no new users to assign, return a message
    if (newUserIds.length === 0) {
      return res
        .status(400)
        .json({ message: "All users are already assigned to this project." });
    }

    // Assign new users to the project
    const assignments = await Promise.all(
      newUserIds.map((userId) => ProjectUser.create({ projectId, userId }))
    );

    res
      .status(201)
      .json({ message: "Users assigned to project successfully", assignments });
  } catch (error) {
    console.error("Error assigning users to project:", error);
    res.status(500).json({
      message: "Error assigning users to project",
      error: error.message,
    });
  }
};
module.exports = {
  getAllProjectUsers,
  assignUsers,
};
