const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Configure Multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Create a new comment (with file upload)
const createComment = async (req, res) => {
  const { ticketId } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  let fileUrl = null;

  // Handle file upload
  if (req.file) {
    try {
      const uploadPath = path.join(__dirname, "../server/uploads");

      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const filename = `${req.file.originalname}`;
      const filePath = path.join(uploadPath, filename);

      fs.writeFileSync(filePath, req.file.buffer);
      fileUrl = `/uploads/${filename}`;
    } catch (error) {
      return res.status(500).json({ message: "Error saving file", error });
    }
  }

  try {
    const newComment = await Comment.create({
      content,
      createdBy: userId,
      ticketId,
      fileUrl,
    });

    await Notification.create({
      title: "New Comment",
      description: `A comment was added by user with ID: ${userId}`,
      ticketId,
    });

    res.status(201).json({ message: "Comment created", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Error creating comment", error });
  }
};

// Get comments for a ticket
const getCommentsForTicket = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { ticketId },
      include: [{ model: User, attributes: ["id", "name"] }],
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

// Export the functions
module.exports = {
  createComment,
  getCommentsForTicket,
  upload, // Export Multer upload middleware
};
