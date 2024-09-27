const Role = require('../models/Role');

const seedRoles = async () => {
  try {
    await Role.bulkCreate([
      { id: 1, name: 'Admin' },
      { id: 2, name: 'Developer' },
      { id: 3, name: 'Project Manager' },
      { id: 4, name: 'QA Tester' },
    ], { ignoreDuplicates: true }); // Ignore if roles already exist

    console.log('Roles have been seeded');
  } catch (error) {
    console.error('Error seeding roles:', error);
  }
};

module.exports = seedRoles;
