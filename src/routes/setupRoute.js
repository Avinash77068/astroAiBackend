const express = require("express");
const { createAllData } = require("../controllers/setupController.js");
const router = express.Router();

router.post("/create", createAllData);

module.exports = router;
