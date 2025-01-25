const Role = require("../models/Role");
const User = require("../models/User"); // Import the user model
const bcrypt = require("bcryptjs"); // Using bcryptjs for password hashing

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

// Controller to update user's role
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
    res.status(500).json({ message: "Error updating user role", error: error.message });
  }
};

// Controller to add a new user (Admin functionality)
const addUser = async (req, res) => {
  const { username, email, password, roleId } = req.body;

  try {
    // Check if the role exists
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      roleId,
    });

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error adding user", error: error.message });
  }
};

// Controller to delete a user (Admin functionality)
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the user by ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await user.destroy();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

const updateUserName = async (req, res) => {
  const { id, name } = req.body; // Extract both id and name from the body
  console.log("Updating username for userId:", id, "with newUsername:", name); // Debug log

  try {
    // Find the user by userId
    const user = await User.findByPk(id);  // Use 'id' from the body
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's name
    user.name = name;
    await user.save();

    res.status(200).json({ message: "User's username updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating username", error: error.message });
  }
};



module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  addUser,
  deleteUser,
  updateUserName
};
