const User = require("../model/userSchema");
const Astrologer = require("../model/astrologerSchema");
const mongoose = require("mongoose");
const { getAiChatResponse } = require("../middleware/AiChatResponse");
const sendSMS = require("../middleware/services/twilioService");
const { sendOtpEmail, sendAstrologerActivityEmail } = require("../middleware/services/emailService");
const { ensureWallet } = require("../services/walletService");
const { signAuthToken, normalizeRoles } = require("../services/authTokenService");
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

        const contactFilter = email
            ? { $or: [
                { notificationEmail: email.trim().toLowerCase() },
                { email: email.trim().toLowerCase() }
            ] }
            : phoneNumber ? { phoneNumber: String(phoneNumber).replace(/\s+/g, '') } : null;
        let astrologer = contactFilter
            ? await Astrologer.findOne(contactFilter)
                .select("+notificationEmail +email +phoneNumber name userId accountId roles place dateOfBirth gender photo chat")
                .populate("userId", "email roles")
            : null;

        if (!astrologer && user && normalizeRoles(user.roles).includes("ASTROLOGER")) {
            astrologer = await Astrologer.findOne({ $or: [{ accountId: user._id }, { userId: user._id }] })
                .select("+notificationEmail +email +phoneNumber name userId accountId roles place dateOfBirth gender photo chat")
                .populate("userId", "email roles");
        }

        if (user || astrologer) {
            const accountRoles = normalizeRoles([
                ...(user?.roles || []),
                ...(astrologer?.roles || []),
                ...(astrologer ? ["ASTROLOGER"] : user ? ["USER"] : [])
            ]);
            const accountId = astrologer?.accountId || user?._id || astrologer._id;
            const astrologerId = astrologer?._id;

            if (user) await ensureWallet(user._id);
            const token = signAuthToken(accountId, accountRoles, astrologerId);
            if (!(await consumeOtpChallenge(res, storedData))) return;

            const userData = user?.toObject ? user.toObject() : {
                id: String(accountId),
                name: astrologer?.name || "",
                email: astrologer?.email || astrologer?.notificationEmail || astrologer?.userId?.email || email || "",
                phone: astrologer?.phoneNumber || phoneNumber || "",
                place: astrologer?.place || "",
                dateOfBirth: astrologer?.dateOfBirth || "",
                gender: astrologer?.gender || "",
                photo: astrologer?.photo || ""
            };
            delete userData.role;
            userData.roles = accountRoles;
            userData.id = String(accountId);
            if (astrologerId) userData.astrologerId = String(astrologerId);

            return res.json({
                success: true,
                data: {
                    token,
                    userId: accountId,
                    roles: accountRoles,
                    astrologerId,
                    user: userData,
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
            const astrologer = await Astrologer.findOne({ accountId: id })
                .select("+email +phoneNumber +notificationEmail name roles place dateOfBirth gender photo astrologerApplicationStatus");
            if (astrologer) {
                const profile = astrologer.toObject();
                profile.id = astrologer.accountId.toString();
                profile.email = astrologer.email || astrologer.notificationEmail || "";
                profile.phone = astrologer.phoneNumber || "";
                profile.roles = normalizeRoles(astrologer.roles);
                return res.json({ success: true, data: profile, message: "Astrologer profile fetched successfully" });
            }
        }
        
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
        const { name, place, dateOfBirth, gender, isGoogleLogin, photo, token, accountType } = req.body;
        // Blank values must stay unset: phoneNumber has a unique index and "" would collide between users.
        const phoneNumber = typeof req.body.phoneNumber === "string" ? req.body.phoneNumber.trim() : req.body.phoneNumber;
        const email = typeof req.body.email === "string" ? req.body.email.trim() : req.body.email;

        const userData = {
            name,
            place,
            dateOfBirth,
            gender,
            ...(phoneNumber ? { phoneNumber } : {}),
            ...(email ? { email } : {}),
            isGoogleLogin,
            photo,
            token
        };
        const userUpdate = {
            $set: userData,
            $setOnInsert: { roles: ["USER"] }
        };
        if (accountType === "ASTROLOGER") {
            userUpdate.$set.astrologerApplicationStatus = "PENDING";
        }

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
                userUpdate,
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );

        }
        else if(email) {
            user = await User.findOneAndUpdate(
                { email },
                userUpdate,
                { new: true, upsert: true, setDefaultsOnInsert: true }
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
                token: signAuthToken(user._id, user.roles || ["USER"]),
                user: { ...user.toObject(), roles: normalizeRoles(user.roles) }
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
        const allowedFields = ["name", "place", "dateOfBirth", "gender", "phoneNumber", "email", "photo"];
        const updates = Object.fromEntries(
            allowedFields
                .filter(field => req.body[field] !== undefined)
                .map(field => [field, req.body[field]])
        );
        let user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!user) {
            const astrologerUpdates = { ...updates };
            if (updates.email) astrologerUpdates.notificationEmail = updates.email.trim().toLowerCase();
            user = await Astrologer.findOneAndUpdate(
                { accountId: req.params.id },
                { $set: astrologerUpdates },
                { new: true }
            ).select("+email +phoneNumber +notificationEmail name roles place dateOfBirth gender photo");
            if (user) {
                const profile = user.toObject();
                profile.id = user.accountId.toString();
                profile.email = user.email || user.notificationEmail || "";
                profile.phone = user.phoneNumber || "";
                profile.roles = normalizeRoles(user.roles);
                return res.json({ success: true, data: profile, message: "Astrologer profile updated" });
            }
        }
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
            const astrologer = await Astrologer.findOne({
                $or: [
                    { email: email.trim().toLowerCase() },
                    { notificationEmail: email.trim().toLowerCase() }
                ]
            }).select("+email +notificationEmail name roles accountId astrologerApplicationStatus photo _id");
            if (astrologer) {
                const accountId = astrologer.accountId || astrologer._id;
                const roles = normalizeRoles(astrologer.roles);
                const sessionUser = {
                    id: accountId.toString(),
                    name: astrologer.name,
                    email: astrologer.email || astrologer.notificationEmail || email,
                    photo: astrologer.photo || photo,
                    roles,
                    astrologerId: astrologer._id.toString()
                };
                return res.status(200).json({
                    success: true,
                    data: {
                        token: signAuthToken(accountId, roles, astrologer._id),
                        userId: accountId,
                        roles,
                        astrologerId: astrologer._id,
                        user: sessionUser,
                        isNewUser: false
                    },
                    message: "Google login successful"
                });
            }
        }

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
                token: signAuthToken(user._id, user.roles || ["USER"]),
                name: user.name,
                email: user.email,
                photo: user.photo,
                userId: user._id,
                roles: normalizeRoles(user.roles),
                user: { ...user.toObject(), roles: normalizeRoles(user.roles) },
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
            .select("name notificationEmail userId accountId")
            .populate("userId", "email");
        if (!astrologer) {
            return res.status(404).json({
                success: false,
                message: "Astrologer not found"
            });
        }
        // Astrologers with a real account reply themselves; only listed demo profiles get an AI reply.
        const isHumanAstrologer = Boolean(astrologer.accountId);

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
        const generatedResponse = isHumanAstrologer ? null : await getAiChatResponse(message, astrologerChat, userDetails);
        const astroResponse = isHumanAstrologer ? null : generatedResponse || "Sorry, Unable to Understand Your Query";
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

// Called when the app opens: if an admin has approved this customer as an astrologer, hand back a fresh
// astrologer session so the app can show the approval message and switch to the astrologer screens.
const getAccountStatus = async (req, res) => {
    try {
        await connectDB();
        if (req.auth.roles.includes("ASTROLOGER") || !mongoose.isValidObjectId(req.auth.id)) {
            return res.json({ success: true, data: { approved: false } });
        }

        const astrologer = await Astrologer.findOne({ $or: [{ accountId: req.auth.id }, { _id: req.auth.id }] })
            .select("+email +notificationEmail +phoneNumber name roles accountId place dateOfBirth gender photo");
        if (!astrologer || !normalizeRoles(astrologer.roles).includes("ASTROLOGER")) {
            return res.json({ success: true, data: { approved: false } });
        }

        const roles = normalizeRoles(astrologer.roles);
        const accountId = astrologer.accountId || astrologer._id;
        return res.json({
            success: true,
            data: {
                approved: true,
                token: signAuthToken(accountId, roles, astrologer._id),
                user: {
                    id: String(accountId),
                    name: astrologer.name,
                    email: astrologer.email || astrologer.notificationEmail || "",
                    phone: astrologer.phoneNumber || "",
                    place: astrologer.place || "",
                    dateOfBirth: astrologer.dateOfBirth || "",
                    gender: astrologer.gender || "",
                    photo: astrologer.photo || "",
                    roles,
                    astrologerId: String(astrologer._id)
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Unable to check account status" });
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
    getAccountStatus,
    googleLogin
};
