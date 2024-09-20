const { DataTypes } = require("sequelize");
const sequelize = require("../config/connection"); // Import sequelize connection
const User = require("./User");

const Role = sequelize.define("Role", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true, // Automatically assign a value to 'id'
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
// Define association: User belongs to one Role
User.belongsTo(Role, {
  foreignKey: {
    name: "roleId",
    allowNull: false,
  },
});

// Define association: Role has many Users
Role.hasMany(User, {
  foreignKey: "roleId",
});

module.exports = Role;
