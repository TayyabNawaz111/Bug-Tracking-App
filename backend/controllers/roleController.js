
const Role = require("../models/Role"); // Import the role model

// Controller to get all Roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch roles' });
  }
};



module.exports = {
  getAllRoles
};
