const Ticket = require("../models/Ticket"); // Import the ticket model
const Notification = require("../models/Notification"); // Import the Notification model
const ActivityLog = require("../models/ActivityLog");

// Get all tickets
const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets", error });
  }
};

// Create a new ticket
const createTicket = async (req, res) => {
  const { userId, projectId } = req.params; // Get userId from request parameters
  const { title, description, severity, status } = req.body;

  // Validate the input
  if (!title || !description || !severity || !userId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Create a new ticket
    let newTicket;
    if (!status) {
      newTicket = await Ticket.create({
        title,
        description,
        severity,
        projectId,
        createdBy: userId, // Set createdBy to userId from params
      });
    } else {
      newTicket = await Ticket.create({
        title,
        description,
        severity,
        status,
        projectId,
        createdBy: userId, // Set createdBy to userId from params
      });
    }

    try {
      await ActivityLog.create({
        title: "New Bug",
        description: `New bug[${newTicket.id}] created by the user with id ${createdBy}`,
        projectId: projectId,
      });
    } catch (error) {
      console.log("Error creating Log", error);
    }

    res
      .status(201)
      .json({ message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res
      .status(500)
      .json({ message: "Error creating ticket", error: error.message });
  }
};
const updateStatus = async (req, res) => {
  const { ticketId } = req.params; // Get ticketId from request parameters
  const { status } = req.body; // Get status from request body

  // Validate input
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    // Find the ticket by ID
    const ticket = await Ticket.findByPk(ticketId);

    // Check if the ticket exists
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update the ticket's status
    ticket.status = status;

    // Save the updated ticket to the database
    await ticket.save();

    // Create a notification for the status update
    try {
      await Notification.create({
        title: "Ticket Status Update",
        description: `The status of the ticket with ID: ${ticketId} has been updated to: ${status}`,
        ticketId: ticketId,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
    try {
      const info = await Ticket.findByPk(ticketId);
      await ActivityLog.create({
        title: "Status Change",
        description: `status of bug[${ticketId}] is now changed to ${status}`,
        projectId: info.projectId,
      });
    } catch (error) {
      console.log("Error creating Log", error);
    }
    // Respond with the updated ticket
    res.status(200).json({ message: "Ticket updated successfully", ticket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res
      .status(500)
      .json({ message: "Error updating ticket", error: error.message });
  }
};

//assign developers
const assignDeveloper = async (req, res) => {
  const { ticketId } = req.params; // Get the ticket ID from params
  const { assignedTo } = req.body; // Get the developer ID from the request body

  if (!assignedTo) {
    return res.status(400).json({ message: "Developer ID is required" });
  }

  try {
    // Find the ticket by ID
    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update the ticket with the assigned developer
    ticket.assignedTo = assignedTo;
    await ticket.save();

    // Create Notification for bug assignment
    try {
      const createNotification = async (ticketId, assignedTo) => {
        await Notification.create({
          title: "Bug Assignment",
          description: `Bug has been assigned to the user with ID: ${assignedTo}`,
          ticketId: ticketId,
        });
      };

      // Call the notification function to create the notification
      await createNotification(ticketId, assignedTo);
    } catch (err) {
      console.error("Error creating notification:", err);
    }

    res
      .status(200)
      .json({ message: "Developer assigned successfully", ticket });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error assigning developer", error: error.message });
  }
};

module.exports = {
  getAllTickets,
  createTicket,
  updateStatus,
  assignDeveloper,
};
