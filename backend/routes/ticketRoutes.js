const express = require("express");
const router = express.Router();
const {
  getAllTickets,
  createTicket,
  updateStatus,
  assignDeveloper,
  requestApproval,
  approveTicket,
  verifyTicket,
  AllTickets,
  getATicket,
} = require("../controllers/ticketController");
const { upload } = require("../controllers/commentController");
const authenticateToken = require("../middlewares/authenticateToken");
const { authorizeRole } = require("../middlewares/authorizeRole");

// Route to get all tickets assigned to the logged-in user
router.get("/", authenticateToken, authorizeRole("Developer", "Tester", "Admin"), getAllTickets);
router.get("/AllTickets", authenticateToken, authorizeRole("Admin"), AllTickets);

// Route to create ticket (Developers, Testers, Admins)
router.post(
  "/:projectId/createTicket",
  authenticateToken,
  authorizeRole("Developer", "Tester", "Admin"),
  upload.array("attachments"),
  createTicket
);

// Route to update status of ticket
router.put(
  "/:ticketId/updateStatus",
  authenticateToken,
  authorizeRole("Developer", "Admin", "Tester"),
  updateStatus
);

// Route to assign developer
router.put(
  "/:ticketId/assignDeveloper",
  authenticateToken,
  authorizeRole("Admin"),
  assignDeveloper
);

// Developer requests approval after applying fix
router.post(
  "/:ticketId/requestApproval",
  authenticateToken,
  authorizeRole("Developer", "Admin"),
  requestApproval
);

// Tester approves developer's fix
router.post(
  "/:ticketId/approve",
  authenticateToken,
  authorizeRole("Tester", "Admin"),
  approveTicket
);

// Tester verifies resolved ticket and closes it
router.post(
  "/:ticketId/verify",
  authenticateToken,
  authorizeRole("Tester", "Admin"),
  verifyTicket
);

// Route to get a specific ticket by ID
router.get("/:id", authenticateToken, authorizeRole("Developer", "Tester", "Admin"), getATicket);

module.exports = router;
