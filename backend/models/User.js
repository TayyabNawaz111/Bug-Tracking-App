const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection"); // Import sequelize connection

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true, // Automatically assign a value to 'id'
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING, // Password field
    allowNull: false, // Makes the field required
  },
});

module.exports = User;
