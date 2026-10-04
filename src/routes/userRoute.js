
const express = require("express");
const router = express.Router();
const { getAllUsers, createUser, googleLogin, getUserById, updateUser, deleteUser, chatResponse, getChatHistory, getAccountStatus, sendOTP, verifyOTP } = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const { parseProfilePhoto } = require("../middleware/profilePhotoUpload");
const { uploadProfilePhoto } = require("../controllers/profilePhotoController");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/profile-photo", authenticate, parseProfilePhoto, uploadProfilePhoto);
router.post("/signup", createUser);
router.get("/account-status", authenticate, getAccountStatus);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/login", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/chat", authenticate, chatResponse);
router.post("/chat-history", authenticate, getChatHistory);
router.post("/google-login",googleLogin);

module.exports = router;
