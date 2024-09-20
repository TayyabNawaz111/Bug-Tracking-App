const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection"); // Import sequelize connection
const Ticket = require("./Ticket");
const Attachment = sequelize.define("Attachment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
Attachment.belongsTo(Ticket, {
  foreignKey: {
    name: "ticketId",
    allowNull: false,
  },
});

Ticket.hasMany(Attachment, {
  foreignKey: "ticketId",
});

module.exports = Attachment;
