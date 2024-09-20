const Attachment = require("../models/Attachment"); // Import the Attachment model

// Get all attachments
const getAllAttachments = async (req, res) => {
  try {
    const attachments = await Attachment.findAll();
    res.status(200).json(attachments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attachments", error });
  }
};
module.exports = { getAllAttachments };
