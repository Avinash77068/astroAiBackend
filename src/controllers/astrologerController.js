const Astrologer = require("../model/astrologerSchema.js");
const connectDB = require("../database/db.js");
const mongoose = require("mongoose");
const getAstrologerData = async (req, res) => {
    try {
        await connectDB();
        const astrologerData = await Astrologer.find();

        res.status(200).json({
            success: true,
            data: astrologerData,
            message: "Astrologers fetched successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching astrologers",
            error: error.message
        });
    }
};


const createAstrologerData = async (req, res) => {
    try {
        await connectDB();

        const astrologerProfiles = [
            { name: "Aditya Kumar", image: "https://example.com/images/astrologers/rrupa.jpg" },
            { name: "Avinash Shrivastav", image: "https://example.com/images/astrologers/arya.jpg" },
            { name: "Shalini Shrivastav", image: "https://example.com/images/astrologers/meera.jpg" },
            { name: "Shivi Shrivastav", image: "https://example.com/images/astrologers/kavya.jpg" },
        ];

        const generatedAstrologers = astrologerProfiles.map((profile, index) => ({
            name: profile.name,
            type: "Tarot",
            rating: +(4 + Math.random()).toFixed(1),
            reviews: Math.floor(Math.random() * 100),
            price: `₹${20 + Math.floor(Math.random() * 30)}/min`,
            verified: true,
            image: profile.image,
            experience: `${2 + index} years`,
            languages: ["English", "Hindi"],
            specialization: ["Tarot", "Relationships"],
            description: `${profile.name} is a professional Tarot astrologer.`,
            jwtToken:
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15),
            sessionId: `session_${Date.now()}_${index}`,
            astrologerId: index + 1,
            userId: new mongoose.Types.ObjectId(),
            sessionType: "CHAT",
            status: "ONLINE",

            startTime: new Date(),
        }));

        await Astrologer.insertMany(generatedAstrologers);

        res.status(201).json({
            success: true,
            message: "Astrologers created successfully",
            count: generatedAstrologers.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating astrologers",
            error: error.message
        });
    }
};


module.exports = { getAstrologerData, createAstrologerData };