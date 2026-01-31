const axios = require('axios');
const SYSTEM_PROMPTS = require('./api/prompts');
const { buildUserContext } = require('./api/helpers');
const { callOpenRouter } = require('./api/openRouterService');

const getAiChatResponse = async (userMessage, chatHistory = [], userDetails = null) => {
    try {
        // Step 1: Classify the message type using AI
        const classificationMessages = [
            {
                role: "system",
                content: "Classify the following user message into one of these categories: astro, career, relationship. Respond with only the category name in lowercase, nothing else."
            },
            {
                role: "user",
                content: userMessage
            }
        ];

        const classificationResponse = await callOpenRouter(classificationMessages);
        let type = classificationResponse.trim().toLowerCase();

        // Validate type, default to astro if invalid
        if (!['astro', 'career', 'relationship'].includes(type)) {
            type = 'astro';
        }

        // Step 2: Generate response using the classified type
        const userContext = buildUserContext(userDetails);

        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPTS[type] + userContext
            }
        ];

        if (chatHistory.length > 0) {
            chatHistory.slice(-15).forEach(chat => {
                messages.push({
                    role: chat.sender === 'user' ? 'user' : 'assistant',
                    content: chat.message
                });
            });
        }

        messages.push({
            role: "user",
            content: userMessage
        });

        const aiResponse = await callOpenRouter(messages);

        return aiResponse;
    } catch (error) {
        console.error('OpenRouter API Error:', error.response?.data || error.message);
        return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    }
};

module.exports = { getAiChatResponse };
