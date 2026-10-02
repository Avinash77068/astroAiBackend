
const AiFeature = require("../model/aiFeatureSchema");
const connectDB = require("../database/db.js");
const aiFeatureCatalog = require("../config/aiFeatureCatalog.js");
const { getAiChatResponse } = require("../middleware/AiChatResponse");
const { generateKundliReport } = require('../services/kundliService');
const { generateVedicInterpretation } = require('../services/vedicAstrologyService');
const {
    analyzeCareerAI,
    analyzeEducationAI,
    analyzeFinanceAI,
    analyzeHealthAI,
    analyzeLoveAI,
    analyzeMatchingAI,
    analyzeMentalHealthAI
} = require('../services/aiAnalysisServices');
connectDB();
const getAiFeatureCatalog = (req, res) => {
    return res.json({
        success: true,
        data: { features: aiFeatureCatalog },
        message: "AI feature catalog fetched successfully"
    });
};

const askAiFeature = async (req, res) => {
    const feature = aiFeatureCatalog.find(item => item.id === req.body.featureId);
    if (!feature || feature.id === "kundli") {
        return res.status(400).json({
            success: false,
            message: "Choose a supported guidance category"
        });
    }

    const question = typeof req.body.question === "string" ? req.body.question.trim() : "";
    if (!question) {
        return res.status(400).json({
            success: false,
            message: "question is required"
        });
    }
    if (question.length > 3000) {
        return res.status(400).json({
            success: false,
            message: "question must be 3000 characters or fewer"
        });
    }

    try {
        const prompt = [
            `The user chose the ${feature.title} guidance category.`,
            "Respond in Hindi with compassionate, practical, non-deterministic astrology guidance.",
            "Treat astrology as traditional guidance, not a guaranteed prediction.",
            `User's question: ${question}`
        ].join("\n");
        const answer = await getAiChatResponse(prompt);

        return res.json({
            success: true,
            data: { featureId: feature.id, answer },
            message: "Guidance generated successfully"
        });
    } catch (error) {
        console.error("AI feature question error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to generate guidance",
            error: error.message
        });
    }
};

const analyzeCareer = async (req, res) => {
    try {
        const { currentJob, experience, skills, goals } = req.body;

        const analysis = await analyzeCareerAI({
            currentJob,
            experience,
            skills,
            goals
        });

        return res.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Career Analysis Error:', error);
        return res.status(500).json({
            success: false,
            message: "Career analysis failed",
            error: error.message
        });
    }
};

const analyzeHealth = async (req, res) => {
    try {
        const { name, dateOfBirth, healthConcerns, lifestyle } = req.body;

        const analysis = await analyzeHealthAI({
            name,
            dateOfBirth,
            healthConcerns,
            lifestyle
        });

        return res.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Health Analysis Error:', error);
        return res.status(500).json({
            success: false,
            message: "Health analysis failed",
            error: error.message
        });
    }
};
const analyzeEducation = async (req, res) => {
    try {
        const { educationLevel, fieldOfInterest, learningGoals, currentSkills } = req.body;

        const analysis = await analyzeEducationAI({
            educationLevel,
            fieldOfInterest,
            learningGoals,
            currentSkills
        });

        return res.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Education Analysis Error:', error);
        return res.status(500).json({
            success: false,
            message: "Education analysis failed",
            error: error.message
        });
    }
};
const analyzeFinance = async (req, res) => {
    try {
        const { monthlyIncome, monthlyExpenses, financialGoals, currentSavings } = req.body;

        const analysis = await analyzeFinanceAI({
            monthlyIncome,
            monthlyExpenses,
            financialGoals,
            currentSavings
        });

        return res.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Finance Analysis Error:', error);
        return res.status(500).json({
            success: false,
            message: "Finance analysis failed",
            error: error.message
        });
    }
};
const analyzeMatching = async (req, res) => {
    try {
        const { userName, userDOB, partnerName, partnerDOB, relationshipType } = req.body;

        const analysis = await analyzeMatchingAI({
            userName,
            userDOB,
            partnerName,
            partnerDOB,
            relationshipType
        });

        return res.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Matching Analysis Error:', error);
        return res.status(500).json({
            success: false,
            message: "Matching analysis failed",
            error: error.message
        });
    }
};
const analyzeMentalHealth = async (req, res) => {
    try {
        const { currentMood, stressLevel, feelings, concerns } = req.body;

        const analysis = await analyzeMentalHealthAI({
            currentMood,
            stressLevel,
            feelings,
            concerns
        });

        return res.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Mental Health Analysis Error:', error);
        return res.status(500).json({
            success: false,
            message: "Mental health analysis failed",
            error: error.message
        });
    }
};

const generateKundli = async (req, res) => {
    try {
        let { dateOfBirth, timeOfBirth, name, placeOfBirth, userId } = req.body;

        if (!dateOfBirth || !timeOfBirth) {
            return res.status(400).json({
                success: false,
                message: "dateOfBirth and timeOfBirth are required"
            });
        }

        const originalTimeOfBirth = timeOfBirth;

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

        const interpretation = await generateVedicInterpretation({
            name: name || "Client",
            dateOfBirth,
            timeOfBirth: originalTimeOfBirth,
            placeOfBirth: placeOfBirth || "Not specified",
            kundliData: kundli
        });

        return res.json({
            success: true,
            data: {
                clientDetails: {
                    name: name || "Client",
                    dateOfBirth,
                    timeOfBirth: originalTimeOfBirth,
                    placeOfBirth: placeOfBirth || "Not specified",
                    userId: userId || null
                },
                planetaryPositions: kundli,
                vedicInterpretation: interpretation
            }
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

const analyzeAstrology = async (req, res) => {
    try {
        const { question, birthDetails, concerns } = req.body;

        // For general astrology consultations, we can use a general AI response
        // Since this is more of a chat-based astrology consultation, I'll create a simple response for now
        const analysis = {
            astrology: {
                consultationType: ["General Astrology Reading"],
                insights: ["Personalized astrological guidance based on your query"],
                recommendations: ["Consider getting a full birth chart analysis for deeper insights"],
                nextSteps: ["Provide more specific birth details for detailed analysis"]
            }
        };

        return res.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Astrology Analysis Error:', error);
        return res.status(500).json({
            success: false,
            message: "Astrology analysis failed",
            error: error.message
        });
    }
};

const analyzeLove = async (req, res) => {
    try {
        const { userName, partnerName, relationshipStatus, concerns } = req.body;

        const analysis = await analyzeLoveAI({
            userName,
            partnerName,
            relationshipStatus,
            concerns
        });

        return res.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Love Analysis Error:', error);
        return res.status(500).json({
            success: false,
            message: "Love analysis failed",
            error: error.message
        });
    }
};

module.exports = { getAiFeatureCatalog, askAiFeature, analyzeCareer, analyzeHealth, analyzeEducation, analyzeFinance, analyzeMatching, analyzeMentalHealth, generateKundli, analyzeAstrology, analyzeLove }