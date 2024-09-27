const Comment = require("../models/Comment"); // Import the Comment model
const User = require("../models/User"); // Import the User model
const Notification = require("../models/Notification"); // Import the Notification model

// Get comments for a specific ticket
const getCommentsForTicket = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { ticketId },
      include: [
        {
          model: User,
          attributes: ["id", "name"], // Include user details
        },
      ],
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res
      .status(500)
      .json({ message: "Error fetching comments", error: error.message });
  }
};

// Create a new comment
const createComment = async (req, res) => {
  const { ticketId } = req.params; // Get ticketId from request parameters
  const { content } = req.body; // Get content from request body
  const userId = req.user.userId; // Assuming user ID is stored in req.user by your authentication middleware
  // Validate input
  if (!content) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  try {
    // Create the comment
    const newComment = await Comment.create({
      content,
      createdBy: userId,
      ticketId,
    });

    try {
      await Notification.create({
        title: "New Comment",
        description: `A comment added by the user with id: ${userId}`,
        ticketId: ticketId,
      });
    } catch (error) {
      console.error("Error creating Notification:", error);
    }

    res
      .status(201)
      .json({ message: "Comment created successfully", comment: newComment });
  } catch (error) {
    console.error("Error creating comment:", error);
    res
      .status(500)
      .json({ message: "Error creating comment", error: error.message });
  }
};

module.exports = {
  getCommentsForTicket,
  createComment,
};
