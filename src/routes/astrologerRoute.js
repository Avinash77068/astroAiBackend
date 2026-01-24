const express = require("express");
const router = express.Router();
const {getAstrologerData,createAstrologerData} = require("../controllers/astrologerController.js");
router.get("/",getAstrologerData);
router.post("/create",createAstrologerData);

module.exports = router;