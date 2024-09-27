const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Signup controller
const signup = async (req, res) => {
  const { name, email, password, roleId } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if role exists
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Hash password with parsed salt
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT, 10)
    );

    // Create a new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId,
    });

    // Create a JWT token
    const token = jwt.sign(
      { userId: newUser.id, roleId: newUser.roleId },
      process.env.SECRET_KEY
    );

    res.status(201).json({ message: "User created", token });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// Signin controller
const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId },
      process.env.SECRET_KEY
    );

    res.status(200).json({ message: "Signin successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error signing in", error });
  }
};

module.exports = {
  signin,
  signup,
};
