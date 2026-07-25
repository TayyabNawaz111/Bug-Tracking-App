const ProjectUser = require("../models/ProjectUser");
const Project = require("../models/Project");
const { normalizeIdList, buildWebhookPayload, dispatchWebhookEvent } = require("../utils");

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
  let { userIds } = req.body;
  userIds = normalizeIdList(userIds);

  try {
    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "No users provided for assignment" });
    }

    // Validate project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
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

    const assignedUserIds = assignments.map((a) => a.userId || a.dataValues?.userId);

    await dispatchWebhookEvent(
      buildWebhookPayload("project.user.assigned", req.user?.userId || null, {
        projectId,
        assignedUserIds,
      })
    );

    res.status(201).json({ message: "Users assigned to project successfully", assignedUserIds });
  } catch (error) {
    console.error("Error assigning users to project:", error);
    res.status(500).json({
      message: "Error assigning users to project",
      error: error.message,
    });
  }
};

const getAssignedProjects = async (req, res) => {
  const userId = req.user.userId; // Extract user ID from JWT

  try {
    const assignedProjectIds = await ProjectUser.findAll({
      where: { userId: userId },
      attributes: ["projectId"],
    });

    const projectIds = assignedProjectIds.map(
      (projUser) => projUser.projectId
    );

    const projects = await Project.findAll({
      where: { id: projectIds },
    });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching assigned projects:", error); // Log the error for debugging
    res.status(500).json({ error: "Unable to fetch assigned projects" });
  }
};

const removeUserFromProject = async (req, res) => {
  const { projectId, userId } = req.params;

  try {
    const assignment = await ProjectUser.findOne({ where: { projectId, userId } });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    await assignment.destroy();

    return res.json({ message: "User removed from project", userId: Number(userId) });
  } catch (error) {
    console.error("Error removing user from project:", error);
    return res.status(500).json({ message: "Error removing user from project", error: error.message });
  }
};

// Get users assigned to a specific project (includes user details)
const getUsersForProject = async (req, res) => {
  const { projectId } = req.params;
  console.log("getUsersForProject called for projectId=", projectId);
  const User = require("../models/User");

  try {
    const assignments = await ProjectUser.findAll({ where: { projectId }, include: [{ model: User, attributes: ["id", "name", "roleId", "email"] }] });
    const users = assignments.map((a) => a.User || a.dataValues?.User).filter(Boolean);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users for project:", error);
    res.status(500).json({ message: "Unable to fetch users for project" });
  }
};
module.exports = {
  getAllProjectUsers,
  assignUsers,
  getAssignedProjects,
  removeUserFromProject,
  getUsersForProject,
};

