const express = require("express");
const router = express.Router();
const { analyzeCareer,analyzeHealth,analyzeEducation,analyzeFinance,analyzeMatching,analyzeMentalHealth,generateKundli,analyzeAstrology,analyzeLove } = require("../controllers/aiFearuteController");

router.post("/analyze-career", analyzeCareer );
router.post("/analyze-health", analyzeHealth );
router.post("/analyze-education", analyzeEducation );
router.post("/analyze-finance", analyzeFinance );
router.post("/analyze-love", analyzeLove );
router.post("/analyze-matching", analyzeMatching );
router.post("/analyze-mental-health", analyzeMentalHealth );
router.post("/analyze-kundli", generateKundli);
router.post("/analyze-astrology", analyzeAstrology);

module.exports = router;
