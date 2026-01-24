const express = require("express");
const { getHomepageData, createHomepageData } = require("../controllers/HomepageController.js");
const router = express.Router();

router.get("/", getHomepageData);
router.post("/create", createHomepageData);

module.exports = router;