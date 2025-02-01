const express = require("express");
const cors = require("cors");
const path = require("path");
const createDatabase = require("../config/database"); // Database creation script
const sequelize = require("../config/connection"); // Sequelize connection
const userRoutes = require("../routes/userRoutes"); // Import user routes
const projectRoutes = require("../routes/projectRoutes"); // Import project routes
const roleRoutes = require("../routes/roleRoutes"); // Import role routes
const projectUserRoutes = require("../routes/projectUserRoutes"); // Import project users route
const ticketRoutes = require("../routes/ticketRoutes"); // Import ticket route
const attachmentRoutes = require("../routes/attachmentRoutes"); // Import attachment route
const commentRoutes = require("../routes/commentRoutes"); // Import comment route
const activityLogRoutes = require("../routes/activityLogRoutes"); // Import activity log route
const notificationRoutes = require("../routes/notificationRoutes"); // Import notification route
const authRoutes = require("../routes/authRoutes"); // Import auth routes
const seedRoles = require("../seeders/seedRoles"); // import seeder

require("dotenv").config();

// Main function to setup database, models, and Express server
(async function main() {
  // Create the database
  await createDatabase();

  // Sync models
  try {
    await sequelize.sync({ alter: true });
    console.log("Models synchronized with the database.");
    await seedRoles();
  } catch (error) {
    console.error("Unable to sync models:", error);
  }

  // Set up Express server
  const app = express();
  app.use(cors());
  const port = process.env.PORT || 3000;

  // Middleware to parse JSON requests
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  //Download File
  app.get("/uploads/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.filename);

    res.download(filePath, req.params.filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file.");
      }
    });
  });

  // Routes
  app.use("/auth", authRoutes); // Route for authentications
  app.use("/users", userRoutes); // Route for user-related operations
  app.use("/projects", projectRoutes); // Route for project-related operations
  app.use("/roles", roleRoutes); // Route for role-related operations
  app.use("/project-users", projectUserRoutes); // Route for project-users-related operations
  app.use("/tickets", ticketRoutes); // Route for ticket-related operations
  app.use("/attachments", attachmentRoutes); // Route for attachment-related operations
  app.use("/comments", commentRoutes); // Route for comment-related operations
  app.use("/activity-logs", activityLogRoutes); // Route for activity-related operations
  app.use("/notifications", notificationRoutes); // Route for notification-related operations

  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})();
