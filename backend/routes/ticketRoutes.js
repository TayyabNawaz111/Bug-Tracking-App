const express = require("express");
const router = express.Router();
const { getAllTickets } = require("../controllers/ticketController");

// Route to get all tickets
router.get("/", getAllTickets);

module.exports = router;
