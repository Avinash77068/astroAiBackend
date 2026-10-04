const express = require("express");
const { authenticate, requireRole } = require("../middleware/authMiddleware");
const {
    listConversations,
    getConversation,
    replyToCustomer,
    getConversationAiSettings,
    updateConversationAiSettings
} = require("../controllers/astrologerChatController");

const router = express.Router();
router.use(authenticate, requireRole("ASTROLOGER"));
router.get("/conversations", listConversations);
router.get("/conversations/:customerId/ai-settings", getConversationAiSettings);
router.patch("/conversations/:customerId/ai-settings", updateConversationAiSettings);
router.get("/conversations/:customerId", getConversation);
router.post("/conversations/:customerId/messages", replyToCustomer);

module.exports = router;
