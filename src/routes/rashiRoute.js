const express = require("express");
const { getRashis, getRashiById, askAboutRashi } = require("../controllers/rashiController.js");

const router = express.Router();

router.get("/", getRashis);
router.get("/:id", getRashiById);
router.post("/:id/ask", askAboutRashi);

module.exports = router;