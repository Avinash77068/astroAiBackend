const Astrologer = require("../model/astrologerSchema.js");
const connectDB = require("../database/db");

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
        await Astrologer.insertMany([
        {
            name: "Rrupa",
            type: "Tarot",
            rating: 4.9,
            reviews: 15,
            price: "₹30/min",
            verified: true,
            image: "https://example.com/images/astrologers/rrupa.jpg",
            experience: "5 years",
            languages: ["English", "Hindi"],
            specialization: ["Tarot", "Relationships"],
            description: "Rrupa is a Tarot astrologer with 5 years of experience. She is fluent in English and Hindi and specializes in Tarot and Relationships.",
            jwtToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            sessionId: 'session_1737650940000',
            astrologerId: 1,
            userId: '918334904005',
            sessionType: 'chat',
            status: 'active',
            startTime: new Date(),
        }
    ]);

        res.status(201).json({
            success: true,
            message: "Astrologers created successfully"
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