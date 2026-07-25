const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const Project = require('../models/Project');
const ProjectUser = require('../models/ProjectUser');
const Ticket = require('../models/Ticket');

/**
 * Creates two demo accounts (developer + tester), assigns both to all projects,
 * and assigns every ticket to the developer account so you can hand these
 * credentials to a real user for testing.
 */
const seedDemoAccounts = async () => {
  try {
    const saltRounds = parseInt(process.env.SALT, 10) || 10;
    const passwordHash = await bcrypt.hash('Password123!', saltRounds);

    // Create or find demo developer
    const [devUser] = await User.findOrCreate({
      where: { email: 'demo.dev@seed.pk' },
      defaults: { name: 'Demo Developer', email: 'demo.dev@seed.pk', password: passwordHash, roleId: 2 },
    });

    // Create or find demo tester
    const [testerUser] = await User.findOrCreate({
      where: { email: 'demo.tester@seed.pk' },
      defaults: { name: 'Demo Tester', email: 'demo.tester@seed.pk', password: passwordHash, roleId: 3 },
    });

    console.log('Demo accounts ready:');
    console.log(`  developer: ${devUser.email} / Password123! (roleId=2)`);
    console.log(`  tester:    ${testerUser.email} / Password123! (roleId=3)`);

    // Attach both users to all projects
    const projects = await Project.findAll();
    for (const p of projects) {
      await ProjectUser.findOrCreate({ where: { projectId: p.id, userId: devUser.id }, defaults: { projectId: p.id, userId: devUser.id } });
      await ProjectUser.findOrCreate({ where: { projectId: p.id, userId: testerUser.id }, defaults: { projectId: p.id, userId: testerUser.id } });
    }
    console.log(`Assigned demo users to ${projects.length} project(s).`);

    // Assign all tickets to the demo developer
    const [updatedCount] = await Ticket.update({ assignedTo: devUser.id }, { where: {} });
    console.log(`Assigned ${updatedCount} ticket(s) to demo developer.`);

    console.log('Demo seeding completed.');
  } catch (err) {
    console.error('Error in demo seeder:', err);
  }
};

module.exports = seedDemoAccounts;
