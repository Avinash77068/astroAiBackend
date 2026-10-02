const express = require("express");
const { getSidebarData } = require("../controllers/sidebarController.js");

const router = express.Router();

router.get("/", getSidebarData);

module.exports = router;