const axios = require('axios');

const callOpenRouter = async (messages, { maxTokens = 500, timeoutMs = 30000 } = {}) => {
    const response = await axios.post(
        process.env.OPENROUTER_SITE_URL,
        {
            model: process.env.OPENROUTER_MODEL,
            messages: messages,
            temperature: 0.3,
            max_tokens: maxTokens
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://astroai.app',
                'X-Title': 'AstroAI'
            },
            timeout: timeoutMs
        }
    );

    const choices = response?.data?.choices;
    const content = Array.isArray(choices) ? choices[0]?.message?.content : null;

    if (typeof content !== 'string' || !content.trim()) {
        const apiMessage = response?.data?.error?.message || response?.data?.message;
        const responsePreview = JSON.stringify(response?.data || {}).slice(0, 1000);
        console.error('Unexpected OpenRouter response:', responsePreview);
        throw new Error(apiMessage || 'OpenRouter returned no message content');
    }

    return content;
};

module.exports = { callOpenRouter };
