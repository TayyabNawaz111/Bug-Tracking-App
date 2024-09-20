const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection"); // Import sequelize connection
const Project = require("./Project");
const ActivityLog = sequelize.define("ActivityLog", {
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
    type: DataTypes.STRING,
    allowNull: false,
  },
});
ActivityLog.belongsTo(Project, {
  foreignKey: {
    name: "projectId",
    allowNull: false,
  },
});

Project.hasMany(ActivityLog, {
  foreignKey: "projectId"
});



module.exports = ActivityLog;
