const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('bug_tracking_db', process.env.DB_USER, process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
});

module.exports = sequelize;
