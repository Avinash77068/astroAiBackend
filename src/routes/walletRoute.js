const express = require("express");
const { getWalletByUserId } = require("../controllers/walletController.js");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:userId", authenticate, getWalletByUserId);

module.exports = router;
