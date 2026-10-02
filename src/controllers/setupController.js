const connectDB = require("../database/db.js");
const { seedAll } = require("../services/seedService");

// One call to (re)create every backend-driven collection: homepage/appConfig/sidebar, AI features, rashis, astrologers.
const createAllData = async (req, res) => {
    try {
        if (!process.env.MAIL_USER || req.body.adminMail !== process.env.MAIL_USER) {
            return res.status(400).json({
                success: false,
                message: "You are not authorized to create app data 😔"
            });
        }
        await connectDB();
        const created = await seedAll();
        res.status(200).json({
            success: true,
            message: "All app data created successfully",
            data: created
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to create app data",
            error: error.message
        });
    }
};

module.exports = { createAllData };
