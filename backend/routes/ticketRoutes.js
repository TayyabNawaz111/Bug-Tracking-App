const express = require("express");
const router = express.Router();
const {
  getAllTickets,
  createTicket,
  updateStatus,
  assignDeveloper,
} = require("../controllers/ticketController");
const authenticateToken = require("../middlewares/authenticateToken");

// Route to get all tickets
router.get("/", authenticateToken, getAllTickets);
//Route to create ticket
router.post(
  "/:userId/:projectId/createTicket",
  authenticateToken,
  createTicket
);
//Route to update status of ticket
router.put("/:ticketId/updateStatus", authenticateToken, updateStatus);

//Route to assign developer
router.put("/:ticketId/assignDeveloper", authenticateToken, assignDeveloper);

module.exports = router;
