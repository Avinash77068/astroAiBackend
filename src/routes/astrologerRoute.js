const express = require("express");
const router = express.Router();
const {getAstrologerData,createAstrologerData} = require("../controllers/astrologerController.js");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

router.get("/",getAstrologerData);
router.post("/create", authenticate, requireRole("ADMIN"), createAstrologerData);

module.exports = router;