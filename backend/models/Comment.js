const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection"); // Import sequelize connection
const User = require("./User");
const Ticket = require("./Ticket");

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true, // The file URL can be null if no file is uploaded
  },
});

// Associations
Comment.belongsTo(User, {
  foreignKey: {
    name: "createdBy",
    allowNull: false,
  },
});

User.hasMany(Comment, {
  foreignKey: "createdBy",
});

Comment.belongsTo(Ticket, {
  foreignKey: "ticketId",
  allowNull: false,
});

Ticket.hasMany(Comment, {
  foreignKey: "ticketId",
});

module.exports = Comment;
