const Notification = require("../models/Notification"); // Import the notification model

// Controller function to get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll(); // Fetch all notifications from the database
    res.status(200).json(notifications); // Return the notifications in JSON format
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error }); // Handle any errors
  }
};
module.exports = {
  getAllNotifications,
};
