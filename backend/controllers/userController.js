const Role = require("../models/Role");
const User = require("../models/User"); // Import the user model

// Controller to get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch users" });
  }
};

// Controller to get a single user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch user" });
  }
};
//Update role

const updateUserRole = async (req, res) => {
  const { userId, roleId } = req.body;
  console.log("Updating role for userId:", userId, "with roleId:", roleId); // Debug log

  try {
    // Find the user by userId
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the new role by roleId
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Update user's role
    user.roleId = roleId;
    await user.save();

    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user role", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
};
