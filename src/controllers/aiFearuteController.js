const express = require("express");
const { getAiChatResponse } = require("../middleware/AiChatResponse");
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
    try {
        await connectDB();
        const { userId, ...input } = req.body;
        const userDetails = { name: input.name, dateOfBirth: input.dateOfBirth, place: input.placeOfBirth };
        const report = await generateKundliReport(input, userDetails);
        await AiFeature.create({ userId, featureType: 'kundli', input, output: report });
        res.json({ success: true, report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const analyzeAstrology = (req, res) => {
    res.json({ success: true, message: "Astrology analysis requested" });
};

const analyzeLove = (req, res) => {
    res.json({ success: true, message: "Love analysis requested" });
};

module.exports={analyzeCareer,analyzeHealth,analyzeEducation,analyzeFinance,analyzeMatching,analyzeMentalHealth,analyzeKundli,analyzeAstrology,analyzeLove}