const express = require("express");
const router = express.Router();
const {
  getCommentsForTicket,
  createComment,
  upload,
} = require("../controllers/commentController");
const authenticateToken = require("../middlewares/authenticateToken");

// Route to get all comments for a specific ticket
router.get("/:ticketId", authenticateToken, getCommentsForTicket);
// Route to create a comment for a specific ticket
router.post(
  "/:ticketId",
  authenticateToken,
  upload.single("file"),
  createComment
);

module.exports = router;
