const { getAiChatResponse } = require("../middleware/AiChatResponse");
const connectDB = require("../database/db.js");
const Rashi = require("../model/rashiSchema.js");
const AiFeature = require("../model/aiFeatureSchema.js");
const User = require("../model/userSchema.js");

const getRashis = async (req, res) => {
    try {
        await connectDB();
        const rashis = await Rashi.find({ isActive: true })
            .select("id symbol name englishName element rulingPlanet description order")
            .sort({ order: 1 })
            .lean();
        return res.json({
            success: true,
            data: { rashis },
            message: "Rashi catalog fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Unable to load Rashis" });
    }
};

const getRashiById = async (req, res) => {
    try {
        await connectDB();
        const rashi = await Rashi.findOne({ id: req.params.id, isActive: true }).lean();
        if (!rashi) {
            return res.status(404).json({ success: false, message: "Rashi not found" });
        }

        return res.json({
            success: true,
            data: rashi,
            message: "Rashi details fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Unable to load Rashi details" });
    }
};

const askAboutRashi = async (req, res) => {
    try {
        await connectDB();
        const rashi = await Rashi.findOne({ id: req.params.id, isActive: true }).lean();
        if (!rashi) {
            return res.status(404).json({ success: false, message: "Rashi not found" });
        }

        const question = typeof req.body.question === "string" ? req.body.question.trim() : "";
        const allowedPeriods = ["daily", "weekly", "monthly", "yearly"];
        const period = allowedPeriods.includes(req.body.period) ? req.body.period : "daily";
        const userId = req.body.userId;

        if (!question) {
            return res.status(400).json({ success: false, message: "question is required" });
        }
        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required to save guidance" });
        }
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const prompt = [
            `Give a concise, balanced ${period} traditional Vedic astrology reading about ${rashi.name} (${rashi.englishName}).`,
            `Element: ${rashi.element}. Ruling planet: ${rashi.rulingPlanet}.`,
            `Traditional overview: ${rashi.description}`,
            `Traditional area insights: ${rashi.areas.map(area => `${area.label}: ${area.description}`).join("; ")}`,
            `Answer the user's question in Hindi: ${question}`,
            "Frame astrology as traditional guidance, not a guaranteed prediction."
        ].join("\n");
        const answer = await getAiChatResponse(prompt);
        await AiFeature.create({
            userId: String(userId),
            featureType: "rashi",
            input: { rashiId: rashi.id, period, question },
            output: answer
        });

        return res.json({
            success: true,
            data: { rashiId: rashi.id, period, answer },
            message: "Rashi guidance generated successfully"
        });
    } catch (error) {
        console.error("Rashi guidance error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to generate rashi guidance",
            error: error.message
        });
    }
};

module.exports = { getRashis, getRashiById, askAboutRashi };