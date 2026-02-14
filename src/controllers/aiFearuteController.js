
const AiFeature = require("../model/aiFeatureSchema");
const connectDB = require("../database/db.js");
const { generateKundliReport } = require('../services/kundliService');
connectDB();
const analyzeCareer = (req, res) => {
    res.json({ success: true, message: "Career analysis requested" });
};

const analyzeHealth = (req, res) => {
    res.json({ success: true, message: "Health analysis requested" });
};
const analyzeEducation = (req, res) => {
    res.json({ success: true, message: "Education analysis requested" });
};
const analyzeFinance = (req, res) => {
    res.json({ success: true, message: "Finance analysis requested" });
};
const analyzeMatching = (req, res) => {
    res.json({ success: true, message: "Matching analysis requested" });
};
const analyzeMentalHealth = (req, res) => {
    res.json({ success: true, message: "Mental Health analysis requested" });
};

const generateKundli = async (req, res) => {
    try {
        let { dateOfBirth, timeOfBirth } = req.body;

        if (!dateOfBirth || !timeOfBirth) {
            return res.status(400).json({
                success: false,
                message: "dateOfBirth and timeOfBirth are required"
            });
        }

        // Convert 12:00 PM → 24 hour format if needed
        if (timeOfBirth.includes("AM") || timeOfBirth.includes("PM")) {
            const [time, modifier] = timeOfBirth.split(" ");
            let [hours, minutes] = time.split(":");

            hours = parseInt(hours);

            if (modifier === "PM" && hours !== 12) {
                hours += 12;
            }
            if (modifier === "AM" && hours === 12) {
                hours = 0;
            }

            timeOfBirth = `${hours.toString().padStart(2, "0")}:${minutes}`;
        }

        const kundli = await generateKundliReport({
            dateOfBirth,
            timeOfBirth
        });

        return res.json({
            success: true,
            data: kundli
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Kundli generation failed",
            error: error.message
        });
    }
};

const analyzeAstrology = (req, res) => {
    res.json({ success: true, message: "Astrology analysis requested" });
};

const analyzeLove = (req, res) => {
    res.json({ success: true, message: "Love analysis requested" });
};

module.exports = { analyzeCareer, analyzeHealth, analyzeEducation, analyzeFinance, analyzeMatching, analyzeMentalHealth, generateKundli, analyzeAstrology, analyzeLove }