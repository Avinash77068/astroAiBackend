const Astrologer = require("../model/astrologerSchema.js");
const logger = require("../utils/logger");

const getAstrologerData = async (req, res) => {
    try {
        logger.info('Fetching astrologer data');

        const astrologerData = await Astrologer.find();

        logger.success('Astrologers fetched successfully', { count: astrologerData.length });
        logger.database('FIND', 'astrologers', { count: astrologerData.length });

        res.status(200).json({
            success: true,
            data: astrologerData,
            message: "Astrologers fetched successfully"
        });
    } catch (error) {
        logger.error('Error fetching astrologers', {
            error: error.message
        });
        res.status(500).json({
            success: false,
            message: "Error fetching astrologers",
            error: error.message
        });
    }
};

const createAstrologerData = async (req, res) => {
    try {
        logger.info('Creating astrologer seed data');

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

        logger.success('Astrologers created successfully');
        logger.database('INSERT_MANY', 'astrologers', { count: 1 });

        res.status(201).json({
            success: true,
            message: "Astrologers created successfully"
        });
    } catch (error) {
        logger.error('Error creating astrologers', {
            error: error.message
        });
        res.status(500).json({
            success: false,
            message: "Error creating astrologers",
            error: error.message
        });
    }
};

module.exports = { getAstrologerData, createAstrologerData };