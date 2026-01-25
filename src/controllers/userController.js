const User = require("../model/userSchema");
const { getAiChatResponse } = require("../middleware/AiChatResponse");
// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

const sendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP with 5 minute expiry
        otpStore.set(phoneNumber, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        // TODO: Send OTP via SMS service (Twilio, AWS SNS, etc.)
        console.log(`OTP for ${phoneNumber}: ${otp}`);

        res.json({
            success: true,
            message: "OTP sent successfully",
            // Remove this in production - only for testing
            data: { otp }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone number and OTP are required"
            });
        }

        const storedData = otpStore.get(phoneNumber);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired"
            });
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(phoneNumber);
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

        // OTP verified successfully
        otpStore.delete(phoneNumber);

        // Check if user exists with this phone number
        let user = await User.findOne({ phoneNumber });
        
        if (!user) {
            // Create a temporary user record
            user = await User.create({
                phoneNumber,
                name: "",
                dateOfBirth: "",
                gender: ""
            });
        }

        res.json({
            success: true,
            data: {
                token: "jwt-token-" + user._id,
                name: user.name,
                userId: user._id,
                isNewUser: !user.name
            },
            message: "OTP verified successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
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
        const { name, place, dateOfBirth, gender, phoneNumber,email } = req.body;

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
                { name, place, dateOfBirth, gender },
                { new: true, upsert: true }
            );

        }
        else if(email) {
            user = await User.findOneAndUpdate(
                { email },
                { name, place, dateOfBirth, gender },
                { new: true, upsert: true }
            );
        }
        else {
            // Create new user without phone number
            user = await User.create({
                name,
                place,
                dateOfBirth,
                gender
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
const chatResponse = async (req, res) => {
    try {
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

        user.chat.push({
            message: message,
            sender: "user",
            astroResponse: astroResponse,
            timestamp: new Date()
        });

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
    chatResponse
};
