const { getAiChatResponse } = require("../middleware/AiChatResponse");
const rashiCatalog = require("../config/rashiCatalog.js");
const { getRashiAreas } = require("../config/rashiInsights.js");

const getRashis = (req, res) => {
    return res.json({
        success: true,
        data: { rashis: rashiCatalog },
        message: "Rashi catalog fetched successfully"
    });
};

const getRashiById = (req, res) => {
    const rashi = rashiCatalog.find(item => item.id === req.params.id);
    if (!rashi) {
        return res.status(404).json({
            success: false,
            message: "Rashi not found"
        });
    }

    return res.json({
        success: true,
        data: { ...rashi, areas: getRashiAreas(rashi.id) },
        message: "Rashi details fetched successfully"
    });
};

const askAboutRashi = async (req, res) => {
    const rashi = rashiCatalog.find(item => item.id === req.params.id);
    if (!rashi) {
        return res.status(404).json({
            success: false,
            message: "Rashi not found"
        });
    }

    const question = typeof req.body.question === "string" ? req.body.question.trim() : "";
    const allowedPeriods = ["daily", "weekly", "monthly", "yearly"];
    const period = allowedPeriods.includes(req.body.period) ? req.body.period : "daily";
    if (!question) {
        return res.status(400).json({
            success: false,
            message: "question is required"
        });
    }

    try {
        const prompt = [
            `Give a concise, balanced ${period} traditional Vedic astrology reading about ${rashi.name} (${rashi.englishName}).`,
            `Element: ${rashi.element}. Ruling planet: ${rashi.rulingPlanet}.`,
            `Traditional overview: ${rashi.description}`,
            `Traditional area insights: ${getRashiAreas(rashi.id).map(area => `${area.label}: ${area.description}`).join("; ")}`,
            `Answer the user's question in Hindi: ${question}`,
            "Frame astrology as traditional guidance, not a guaranteed prediction."
        ].join("\n");
        const answer = await getAiChatResponse(prompt);

        return res.json({
            success: true,
            data: { rashiId: rashi.id, period, answer },
            message: "Rashi guidance generated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to generate rashi guidance",
            error: error.message
        });
    }
};

module.exports = { getRashis, getRashiById, askAboutRashi };