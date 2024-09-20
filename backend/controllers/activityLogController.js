const ActivityLog = require("../models/ActivityLog"); // Import the ActivityLog model

// Controller function to get all activity logs
const getAllActivityLogs = async (req, res) => {
  try {
    const activityLogs = await ActivityLog.findAll(); // Fetch all activity logs from the database
    res.status(200).json(activityLogs); // Return the logs in JSON format
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity logs", error }); // Handle any errors
  }
};

module.exports = { getAllActivityLogs };
