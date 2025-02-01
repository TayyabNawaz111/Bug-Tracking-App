const express = require("express");
const router = express.Router();
const {
  getAllTickets,
  createTicket,
  updateStatus,
  assignDeveloper,
  AllTickets,getATicket
} = require("../controllers/ticketController");
const authenticateToken = require("../middlewares/authenticateToken");

// Route to get all tickets
router.get("/", authenticateToken, getAllTickets);
router.get("/AllTickets", authenticateToken, AllTickets);
router.get("/:id", authenticateToken, getATicket);
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
