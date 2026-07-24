"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add deletedAt column to users for paranoid soft deletes
    await queryInterface.addColumn("Users", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Users", "deletedAt");
  },
};
