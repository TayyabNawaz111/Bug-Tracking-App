const { Sequelize } = require('sequelize');
require('dotenv').config();
console.log('Environment Variables:', process.env);  // To check if they are loaded
console.log(process.env.DB_USER)

// Function to create a new database
async function createDatabase() {
  const sequelize = new Sequelize(`postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:5432`, {
    dialect: 'postgres',
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL server has been established successfully.');

    // Create the new database
    await sequelize.query('CREATE DATABASE Bug_Tracking_db;');
    console.log('Database "Bug_Tracking_db" created successfully.');

    await sequelize.close();
  } catch (error) {
    console.error('Unable to create the database:', error);
  }
}

module.exports = createDatabase;
