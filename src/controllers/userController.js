const User = require("../model/userSchema");
const Astrologer = require("../model/astrologerSchema");
const mongoose = require("mongoose");
const { getAiChatResponse } = require("../middleware/AiChatResponse");
const sendSMS = require("../middleware/services/twilioService");
const { sendOtpEmail, sendAstrologerActivityEmail } = require("../middleware/services/emailService");
const { ensureWallet } = require("../services/walletService");
const { signAuthToken } = require("../services/authTokenService");
const Notification = require("../model/notificationSchema");
const OtpChallenge = require("../model/otpChallengeSchema");
const { getOtpIdentifier, generateOtp, hashOtp, otpMatches } = require("../services/otpService");
const connectDB = require("../database/db.js");
const dotenv = require("dotenv");
dotenv.config();

const consumeOtpChallenge = async (res, storedData) => {
    const consumedChallenge = await OtpChallenge.findOneAndDelete({
        _id: storedData._id,
        otpHash: storedData.otpHash
    });
    if (!consumedChallenge) {
        res.status(400).json({
            success: false,
            message: "OTP not found or expired"
        });
        return false;
    }
    return true;
};

const sendOTP = async (req, res) => {
    try {
        await connectDB();
        const { phoneNumber, email } = req.body;

        if (!phoneNumber && !email) {
            return res.status(400).json({
                success: false,
                message: "Phone number or email is required",
            });
        }

        const identifier = getOtpIdentifier({ phoneNumber, email });
        const previousOtp = await OtpChallenge.findOne({ identifier }).lean();
        if (previousOtp?.resendAt > new Date()) {
            return res.status(429).json({
                success: false,
                message: "Please wait before requesting another code",
                data: { retryAfterSeconds: Math.ceil((previousOtp.resendAt.getTime() - Date.now()) / 1000) }
            });
        }

        const otp = generateOtp();
        const sentAt = Date.now();
        const otpHash = hashOtp(otp);
        await OtpChallenge.findOneAndUpdate(
            { identifier },
            {
                $set: {
                    otpHash,
                    expiresAt: new Date(sentAt + 5 * 60 * 1000),
                    resendAt: new Date(sentAt + 60 * 1000)
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        try {
            if (phoneNumber) {
                await sendSMS(phoneNumber, otp);
            } else {
                await sendOtpEmail(email.trim().toLowerCase(), otp);
            }
        } catch (error) {
            await OtpChallenge.deleteOne({ identifier, otpHash });
            throw error;
        }

        res.status(200).json({
            success: true,
            data: {
                expiresInSeconds: 300,
                resendAfterSeconds: 60
            },
            message: "OTP sent successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "OTP sending failed",
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        await connectDB();
        const { phoneNumber, email, otp } = req.body;

        if ((!phoneNumber && !email) || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone number or email and OTP are required"
            });
        }

        const identifier = getOtpIdentifier({ phoneNumber, email });
        const storedData = await OtpChallenge.findOne({ identifier }).select("+otpHash");

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired"
            });
        }

        if (Date.now() > storedData.expiresAt.getTime()) {
            await OtpChallenge.deleteOne({ _id: storedData._id });
            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }

        if (!otpMatches(otp, storedData.otpHash)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Check user and astrologer records without allowing a client-selected role.
        const user = await User.findOne({
            $or: [
                phoneNumber ? { phoneNumber } : null,
                email ? { email } : null
            ].filter(Boolean)
        });

        let astrologer = null;
        if (email) {
            const normalizedEmail = email.trim().toLowerCase();
            astrologer = await Astrologer.findOne({ notificationEmail: normalizedEmail })
                .select("+notificationEmail name userId")
                .populate("userId", "email");

            if (!astrologer && user) {
                astrologer = await Astrologer.findOne({ userId: user._id })
                    .select("+notificationEmail name userId")
                    .populate("userId", "email");
            }
        }

        if (astrologer) {
            const astrologerEmail = astrologer.notificationEmail || astrologer.userId?.email || email;
            const token = signAuthToken(astrologer._id, "ASTROLOGER", astrologer._id);
            if (!(await consumeOtpChallenge(res, storedData))) return;

            return res.json({
                success: true,
                data: {
                    token,
                    userId: astrologer._id,
                    role: "ASTROLOGER",
                    astrologerId: astrologer._id,
                    user: {
                        id: astrologer._id.toString(),
                        name: astrologer.name,
                        email: astrologerEmail,
                        role: "ASTROLOGER",
                        astrologerId: astrologer._id.toString()
                    },
                    isNewUser: false
                },
                message: "Astrologer OTP verified successfully"
            });
        }

        // 🔹 If user exists
        if (user) {
            await ensureWallet(user._id);
            const token = signAuthToken(user._id, "USER");
            if (!(await consumeOtpChallenge(res, storedData))) return;

            return res.json({
                success: true,
                data: {
                    token,
                    userId: user._id,
                    name: user.name,
                    user: user,
                    isNewUser: false
                },
                message: "OTP verified successfully"
            });
        }

        // 🔹 If user DOES NOT exist (new user)
        if (!(await consumeOtpChallenge(res, storedData))) return;
        return res.json({
            success: true,
            data: {
                isNewUser: true
            },
            message: "OTP verified. New user, please complete profile"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        await connectDB();
        const users = await User.find();
        res.json({
            success: true,
            data: users,
            message: "Users fetched successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        await connectDB();
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            data: user,
            message: "User fetched successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const createUser = async (req, res) => {
    try {
        await connectDB();
        const { name, place, dateOfBirth, gender, phoneNumber, email, isGoogleLogin, photo, token } = req.body;

        const userData = {
            name,
            place,
            dateOfBirth,
            gender,
            phoneNumber,
            email,
            isGoogleLogin,
            photo,
            token
        };

        if (!name || !dateOfBirth || !gender) {
            return res.status(400).json({
                success: false,
                message: "Name, date of birth, and gender are required"
            });
        }

        let user;

        // If phoneNumber provided, update existing user
        if (phoneNumber) {
            user = await User.findOneAndUpdate(
                { phoneNumber },
                userData,
                { new: true, upsert: true }
            );

        }
        else if(email) {
            user = await User.findOneAndUpdate(
                { email },
                userData,
                { new: true, upsert: true }
            );
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Phone number or email is required"
            });
        }

        await ensureWallet(user._id);

        res.status(201).json({
            success: true,
            data: {
                userId: user._id,
                token: signAuthToken(user._id, "USER"),
                user: user
            },
            message: "User registered successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        await connectDB();
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.json({
            success: true,
            data: user,
            message: "User updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        await connectDB();
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.json({
            success: true,
            data: user,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



const googleLogin = async (req, res) => {
    try {
        await connectDB();

        const { name, email, photo, token: token, isGoogleLogin } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required for Google login"
            });
        }

        // Check if user already exists with this email
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user with Google data
            user = await User.create({
                name: name || "Google User",
                email,
                photo,
                token,
                isGoogleLogin,
                dateOfBirth: "",
                gender: "",
            });
        } else {
            // Update existing user's Google data
            user.photo = photo || user.photo;
            user.token = token || user.token;
            user.isGoogleLogin = isGoogleLogin || user.isGoogleLogin;
            await user.save();
        }

        await ensureWallet(user._id);

        res.status(200).json({
            success: true,
            data: {
                token: signAuthToken(user._id, "USER"),
                name: user.name,
                email: user.email,
                photo: user.photo,
                userId: user._id,
                isNewUser: !user.dateOfBirth // Consider user new if they haven't set birth details
            },
            message: "Google login successful"
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }
        console.error("Google login error:", error);
        res.status(500).json({
            success: false,
            message: "Google login failed",
            error: error.message
        });
    }
}

const chatResponse = async (req, res) => {
    try {
        await connectDB();
        const { userId, astrologerId, message } = req.body;

        if (!userId || !astrologerId || !message) {
            return res.status(400).json({
                success: false,
                message: "userId, astrologerId, and message are required"
            });
        }

        if (!mongoose.isValidObjectId(astrologerId)) {
            return res.status(400).json({
                success: false,
                message: "astrologerId must be a valid astrologer id"
            });
        }
        const normalizedAstrologerId = new mongoose.Types.ObjectId(astrologerId).toString();

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const astrologer = await Astrologer.findById(normalizedAstrologerId)
            .select("name notificationEmail userId")
            .populate("userId", "email");
        if (!astrologer) {
            return res.status(404).json({
                success: false,
                message: "Astrologer not found"
            });
        }

        const userDetails = {
            name: user.name,
            dateOfBirth: user.dateOfBirth,
            place: user.place,
            gender: user.gender,
            phoneNumber: user.phoneNumber
        };

        const astrologerChat = user.chat.filter(
            chat => chat.astrologerId?.toString() === normalizedAstrologerId
        );
        const generatedResponse = await getAiChatResponse(message, astrologerChat, userDetails);
        const astroResponse = generatedResponse || "Sorry, Unable to Understand Your Query";
        const chatEntry = {
            astrologerId: normalizedAstrologerId,
            message,
            sender: "user",
            astroResponse,
            timestamp: new Date()
        };
        user.chat.push(chatEntry);

        await user.save();

        Notification.create({
            recipientId: astrologer._id,
            recipientRole: "ASTROLOGER",
            type: "CHAT_MESSAGE",
            title: "New customer message",
            body: `${user.name || "A customer"} sent you a message.`,
            data: { customerId: user._id.toString() }
        }).catch(error => {
            console.error("Astrologer in-app notification failed:", error.message);
        });

        const astrologerEmail = astrologer.notificationEmail || astrologer.userId?.email;
        if (astrologerEmail) {
            sendAstrologerActivityEmail({
                to: astrologerEmail,
                astrologerName: astrologer.name,
                customerName: user.name,
                eventLabel: "New customer message"
            }).catch(error => {
                console.error("Astrologer message notification failed:", error.message);
            });
        }

        return res.json({
            success: true,
            message: "Chat created successfully",
            data: {
                message: message,
                sender: "user",
                astroResponse: astroResponse,
                astrologerId: normalizedAstrologerId,
                timestamp: user.chat[user.chat.length - 1].timestamp,
                _id: user.chat[user.chat.length - 1]._id
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating chat",
            error: error.message
        });
    }
}

const getChatHistory = async (req, res) => {
    try {
        await connectDB();
        const { userId, astrologerId } = req.body;

        if (!userId || !astrologerId) {
            return res.status(400).json({
                success: false,
                message: "userId and astrologerId are required"
            });
        }

        if (!mongoose.isValidObjectId(astrologerId)) {
            return res.status(400).json({
                success: false,
                message: "astrologerId must be a valid astrologer id"
            });
        }
        const normalizedAstrologerId = new mongoose.Types.ObjectId(astrologerId).toString();

        const astrologerExists = await Astrologer.exists({ _id: normalizedAstrologerId });
        if (!astrologerExists) {
            return res.status(404).json({
                success: false,
                message: "Astrologer not found"
            });
        }

        const user = await User.findById(userId).select("chat");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            data: {
                chatHistory: user.chat.filter(
                    chat => chat.astrologerId?.toString() === normalizedAstrologerId
                )
            },
            message: "Chat history fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching chat history",
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    sendOTP,
    verifyOTP,
    getUserById,
    chatResponse,
    getChatHistory,
    googleLogin
};
