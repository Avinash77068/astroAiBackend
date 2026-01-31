const User = require("../model/userSchema");
const { getAiChatResponse } = require("../middleware/AiChatResponse");
const sendSMS = require("../middleware/services/twilioService");
const sendEmail = require("../middleware/services/emailService");
// In-memory OTP storage (use Redis in production)
const otpStore = new Map();
const connectDB = require("../database/db.js");
const dotenv = require("dotenv");
dotenv.config();

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

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const key = phoneNumber || email;

        otpStore.set(key, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
        });

        if (phoneNumber) {
            await sendSMS(phoneNumber, otp);
        } else {
            await sendEmail(email, otp);
        }

        res.status(200).json({
            success: true,
            data: {
                otp
            },
            message: "OTP sent successfully",
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

        const key = phoneNumber || email;
        const storedData = otpStore.get(key);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired"
            });
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(key);
            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // OTP verified
        otpStore.delete(key);

        // 🔹 Check user existence (DO NOT CREATE)
        const user = await User.findOne({
            $or: [
                phoneNumber ? { phoneNumber } : null,
                email ? { email } : null
            ].filter(Boolean)
        });

        // 🔹 If user exists
        if (user) {
            return res.json({
                success: true,
                data: {
                    token: "jwt-token-" + user._id,
                    userId: user._id,
                    name: user.name,
                    user: user,
                    isNewUser: false
                },
                message: "OTP verified successfully"
            });
        }

        // 🔹 If user DOES NOT exist (new user)
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

        res.status(201).json({
            success: true,
            data: {
                userId: user._id,
                token: "dummy-token-" + user._id,
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

        res.status(200).json({
            success: true,
            data: {
                token: "jwt-token-" + user._id,
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
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({
                success: false,
                message: "userId and message are required"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const userDetails = {
            name: user.name,
            dateOfBirth: user.dateOfBirth,
            place: user.place,
            gender: user.gender,
            phoneNumber: user.phoneNumber
        };

        const astroResponse = await getAiChatResponse(message, user.chat, userDetails);
        if(!astroResponse || astroResponse === ""){
            user.chat.push({
                message: message,
                sender: "user",
                astroResponse: "Sorry, Unable to Understand Your Query",
                timestamp: new Date()
            });
        }
        else {
            user.chat.push({
                message: message,
                sender: "user",
                astroResponse: astroResponse,
                timestamp: new Date()
            });

        }

        
        await user.save();

        return res.json({
            success: true,
            message: "Chat created successfully",
            data: {
                message: message,
                sender: "user",
                astroResponse: astroResponse,
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
module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    sendOTP,
    verifyOTP,
    getUserById,
    chatResponse,
    googleLogin
};
