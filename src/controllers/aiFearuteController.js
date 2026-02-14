
const AiFeature = require("../model/aiFeatureSchema");
const connectDB = require("../database/db.js");
const { generateKundliReport } = require('../services/kundliService');

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
const analyzeKundli = async (req, res) => {
   res.json({ success: true, message: "Kundli analysis requested" });
};
const analyzeAstrology = (req, res) => {
    res.json({ success: true, message: "Astrology analysis requested" });
};

const analyzeLove = (req, res) => {
    res.json({ success: true, message: "Love analysis requested" });
};

module.exports={analyzeCareer,analyzeHealth,analyzeEducation,analyzeFinance,analyzeMatching,analyzeMentalHealth,analyzeKundli,analyzeAstrology,analyzeLove}