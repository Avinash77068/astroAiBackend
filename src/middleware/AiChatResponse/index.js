const SYSTEM_PROMPTS = require('./api/prompts');
const { buildUserContext } = require('./api/helpers');
const { callOpenRouter } = require('./api/openRouterService');

const getAiChatResponse = async (userMessage, chatHistory = [], userDetails = null) => {
    try {
        const messages = [
            {
                role: 'system',
                content: SYSTEM_PROMPTS.chat + buildUserContext(userDetails)
            }
        ];

        const recentMessages = chatHistory.flatMap(chat => [
            ...(chat.message ? [{ role: 'user', content: chat.message }] : []),
            ...(chat.astroResponse ? [{ role: 'assistant', content: chat.astroResponse }] : [])
        ]).slice(-8);

        messages.push(...recentMessages, { role: 'user', content: userMessage });

        return await callOpenRouter(messages, { maxTokens: 250, timeoutMs: 20000 });
    } catch (error) {
        console.error('OpenRouter API Error:', error.response?.data || error.message);
        return 'I apologize, but I’m having trouble connecting right now. Please try again in a moment.';
    }
};

module.exports = { getAiChatResponse };
