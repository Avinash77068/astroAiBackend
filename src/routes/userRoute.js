
const express = require("express");
const router = express.Router();
const { getAllUsers, createUser,googleLogin, getUserById, updateUser, deleteUser, chatResponse, sendOTP, verifyOTP } = require("../controllers/userController");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/login", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/chat", chatResponse);
router.post("/google-login",googleLogin);

module.exports = router;