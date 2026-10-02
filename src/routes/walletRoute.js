const express = require("express");
const { getWalletByUserId } = require("../controllers/walletController.js");

const router = express.Router();

router.get("/:userId", getWalletByUserId);

module.exports = router;