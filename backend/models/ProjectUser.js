const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection"); // Import sequelize connection
const User = require("./User");
const Project = require("./Project");

const ProjectUser = sequelize.define("ProjectUser", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true, // Automatically assign a value to 'id'
    primaryKey: true,
  },
});
// Define association: 
ProjectUser.belongsTo(User, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
});

// Define association:
User.hasMany(ProjectUser, {
  foreignKey: "userId",
});
// Define association: 
ProjectUser.belongsTo(Project, {
  foreignKey: {
    name: "projectId",
    allowNull: false,
  },
});

// Define association:
Project.hasMany(ProjectUser, {
  foreignKey: "projectId",
});

module.exports = ProjectUser;
