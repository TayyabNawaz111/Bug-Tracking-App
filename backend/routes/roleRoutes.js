const express = require("express");
const router = express.Router();
const {
  getAllRoles
} = require("../controllers/roleController");

// Route to get all projects
router.get("/", getAllRoles);


module.exports = router;
