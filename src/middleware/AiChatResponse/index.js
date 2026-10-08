const { buildUserContext } = require('./api/helpers');
const { callOpenRouter } = require('./api/openRouterService');

const getAiChatResponse = async (userMessage, userDetails = null) => {
    try {
        const messages = [
            {
                role: 'system',
                content: 'You are a friendly astrologer. Reply in the language the user writes (Hindi/Hinglish or English). Keep replies short and helpful.' + buildUserContext(userDetails)
            },
            { role: 'user', content: userMessage }
        ];

        return await callOpenRouter(messages, { maxTokens: 500, timeoutMs: 20000 });
    } catch (error) {
        console.error('OpenRouter API Error:', error.response?.data || error.message);
        return 'I apologize, but I’m having trouble connecting right now. Please try again in a moment.';
    }
};

module.exports = { getAiChatResponse };
