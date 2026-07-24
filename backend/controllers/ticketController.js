const Ticket = require("../models/Ticket"); // Import the ticket model
const Notification = require("../models/Notification"); // Import the Notification model
const ActivityLog = require("../models/ActivityLog");
const ProjectUser = require("../models/ProjectUser");
const Attachment = require("../models/Attachment");
const { ROLE_IDS } = require("../middlewares/authorizeRole");

// Get all tickets for the logged-in user
const getAllTickets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const roleId = req.user.roleId;

    // Admins get all tickets
    if (roleId === ROLE_IDS.Admin) {
      const tickets = await Ticket.findAll();
      return res.status(200).json(tickets);
    }

    // Developers and Testers: return tickets assigned to them or tickets in projects they belong to
    const projectUsers = await ProjectUser.findAll({ where: { userId } });
    const projectIds = projectUsers.map((pu) => pu.projectId);

    const whereClause = {
      $or: [],
    };

    const { Op } = require("sequelize");
    const criteria = {
      [Op.or]: [],
    };

    if (projectIds.length > 0) {
      criteria[Op.or].push({ projectId: projectIds });
    }

    // include tickets explicitly assigned to the user
    criteria[Op.or].push({ assignedTo: userId });

    const tickets = await Ticket.findAll({ where: criteria });

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res
      .status(500)
      .json({ message: "Error fetching tickets", error: error.message });
  }
};
const getATicket = async (req, res) => {
  const { id } = req.params;

  try {
    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Error fetching ticket", error: error.message });
  }
};
const AllTickets = async (req, res) => {
  try {
    // Fetch all tickets from the database
    const tickets = await Ticket.findAll();
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res
      .status(500)
      .json({ message: "Error fetching tickets", error: error.message });
  }
};
// Create a new ticket
const createTicket = async (req, res) => {
  const projectId = req.params.projectId; // project id from params
  const creatorId = req.user.userId;
  const { title, description, severity, status, assignedTo, stepsToReproduce, attachments } = req.body;

  // Basic validation
  if (!title || !description || !severity || !projectId || !assignedTo) {
    return res.status(400).json({ message: "Missing required fields (including assigned developer)" });
  }

  try {
    // Ensure that if the creator is a Tester, they belong to the project
    if (req.user.roleId === ROLE_IDS.Tester) {
      const membership = await ProjectUser.findOne({ where: { userId: creatorId, projectId } });
      if (!membership) {
        return res.status(403).json({ message: "Tester can only create bugs in projects they belong to" });
      }
    }

    // Create ticket
    const ticketData = {
      title,
      description,
      severity,
      projectId,
      createdBy: creatorId,
    };
    if (status) ticketData.status = status;
    if (assignedTo) ticketData.assignedTo = assignedTo;
    if (stepsToReproduce) ticketData.stepsToReproduce = stepsToReproduce;

    const newTicket = await Ticket.create(ticketData);

    // Create attachments if files were uploaded (via multipart/form-data)
    if (req.files && req.files.length > 0) {
      try {
        const fs = require("fs");
        const path = require("path");
        const uploadPath = path.join(__dirname, "../server/uploads");
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

        const created = [];
        for (const f of req.files) {
          const filename = `${Date.now()}-${f.originalname}`;
          const filePath = path.join(uploadPath, filename);
          fs.writeFileSync(filePath, f.buffer);
          const fileUrl = `/uploads/${filename}`;
          const title = f.originalname;
          const att = await Attachment.create({ title, fileUrl, ticketId: newTicket.id });
          created.push(att);
        }
      } catch (err) {
        console.error("Error saving attachment files", err);
      }
    }

    try {
      await ActivityLog.create({
        title: "New Bug",
        description: `New bug[${newTicket.id}] created by the user with id ${req.user.userId}`,
        projectId: projectId,
      });
    } catch (error) {
      console.log("Error creating Log", error);
    }

    res.status(201).json({ message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: "Error creating ticket", error: error.message });
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

// Developer requests approval for a ticket after applying fix
const requestApproval = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Allow developer or admin to request approval
    if (req.user.roleId !== ROLE_IDS.Developer && req.user.roleId !== ROLE_IDS.Admin) {
      return res.status(403).json({ message: "Only developers can request approval" });
    }

    ticket.status = "Ready for Approval";
    await ticket.save();

    await ActivityLog.create({ title: "Request Approval", description: `User ${req.user.userId} requested approval for ticket ${ticketId}`, projectId: ticket.projectId });

    res.status(200).json({ message: "Approval requested", ticket });
  } catch (err) {
    console.error("Error requesting approval:", err);
    res.status(500).json({ message: "Error requesting approval", error: err.message });
  }
};

// Tester approves the ticket after verification
const approveTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Only Testers or Admins can approve
    if (req.user.roleId !== ROLE_IDS.Tester && req.user.roleId !== ROLE_IDS.Admin) {
      return res.status(403).json({ message: "Only testers can approve fixes" });
    }

    ticket.status = "Approved";
    await ticket.save();

    await ActivityLog.create({ title: "Approved", description: `Tester ${req.user.userId} approved ticket ${ticketId}`, projectId: ticket.projectId });

    res.status(200).json({ message: "Ticket approved", ticket });
  } catch (err) {
    console.error("Error approving ticket:", err);
    res.status(500).json({ message: "Error approving ticket", error: err.message });
  }
};

// Tester verifies a resolved ticket and closes it
const verifyTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (req.user.roleId !== ROLE_IDS.Tester && req.user.roleId !== ROLE_IDS.Admin) {
      return res.status(403).json({ message: "Only testers can verify tickets" });
    }

    if (ticket.status !== "Resolved" && ticket.status !== "Approved") {
      return res.status(400).json({ message: "Ticket must be resolved or approved before verification" });
    }

    ticket.status = "Closed";
    await ticket.save();

    await ActivityLog.create({ title: "Verified", description: `Tester ${req.user.userId} verified ticket ${ticketId}`, projectId: ticket.projectId });

    res.status(200).json({ message: "Ticket verified and closed", ticket });
  } catch (err) {
    console.error("Error verifying ticket:", err);
    res.status(500).json({ message: "Error verifying ticket", error: err.message });
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
  requestApproval,
  approveTicket,
  verifyTicket,
  AllTickets,
  getATicket
};
