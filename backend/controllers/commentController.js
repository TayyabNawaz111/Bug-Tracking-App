const Comment = require("../models/Comment"); // Import the Comment model

// Get all comments
const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.findAll(); // Fetch all comments from the database
    res.status(200).json(comments); // Return the comments in JSON format
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error }); // Handle any errors
  }
};

module.exports = { getAllComments };
