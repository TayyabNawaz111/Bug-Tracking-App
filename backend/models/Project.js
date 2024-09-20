const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection"); // Import sequelize connection
const User = require("./User");
const Project = sequelize.define("Project", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});
Project.belongsTo(User, {
  foreignKey: {
    name: "createdBy",
    allowNull: false,
  },
});

User.hasMany(Project, {
  foreignKey: "createdBy",
});

module.exports = Project;
