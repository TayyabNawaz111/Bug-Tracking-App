const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

const User = require("./User");
const Project = require("./Project");

const Ticket = sequelize.define("Ticket", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true, // Automatically assign a value to 'id'
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
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Backlog",
  },
  severity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
// Define association:
Ticket.belongsTo(Project, {
  foreignKey: {
    name: "projectId",
    allowNull: false,
  },
});

// Define association:
Project.hasMany(Ticket, {
  foreignKey: "projectId",
});
// Define association:
//creation
Ticket.belongsTo(User, {
  foreignKey: {
    name: "createdBy",
    allowNull: false,
  },
});

// Define association:
User.hasMany(Ticket, {
  foreignKey: "projectId",
});

//assignment
Ticket.belongsTo(User, {
  foreignKey: "assignedTo",
  allowNull: true,
});
User.hasMany(Ticket, {
  foreignKey: "assignedTo",
});

module.exports = Ticket;
