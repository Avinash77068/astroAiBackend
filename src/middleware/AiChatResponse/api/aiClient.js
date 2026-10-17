const env = require("../../../config/env");
const { callGemini } = require('./geminiService');
const { callOpenRouter } = require('./openRouterService');

// Gemini first; OpenRouter is the fallback when Gemini is unconfigured or fails.
const callAi = async (messages, options = {}) => {
    if (env.GEMINI_API_KEY) {
        try {
            return await callGemini(messages, options);
        } catch (error) {
            console.error('Gemini API Error, falling back to OpenRouter:', error.response?.data?.error?.message || error.message);
        }
    }
    return callOpenRouter(messages, options);
};

module.exports = { callAi };
