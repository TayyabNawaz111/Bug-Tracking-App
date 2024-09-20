const Ticket = require("../models/Ticket"); // Import the ticket model

// Get all tickets
getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets", error });
  }
};

module.exports = {
    getAllTickets
  };