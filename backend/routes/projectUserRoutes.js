const express = require("express");
const router = express.Router();
const { getAllProjectUsers } = require("../controllers/projectUserController");

// Route to get all projects
router.get("/", getAllProjectUsers);

module.exports = router;
