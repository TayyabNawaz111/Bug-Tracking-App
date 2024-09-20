const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection"); // Import sequelize connection
const Ticket = require("./Ticket");
const Notification = sequelize.define("Notification", {
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
Notification.belongsTo(Ticket, {
  foreignKey: {
    name: "ticketId",
    allowNull: false,
  },
});

Ticket.hasMany(Notification, {
  foreignKey: "ticketId",
});

module.exports = Notification;
