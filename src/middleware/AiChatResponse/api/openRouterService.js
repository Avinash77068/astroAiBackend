const axios = require('axios');

const callOpenRouter = async (messages) => {
    const response = await axios.post(
        process.env.OPENROUTER_SITE_URL,
        {
            model: process.env.OPENROUTER_MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://astroai.app',
                'X-Title': 'AstroAI'
            }
        }
    );

    return response.data.choices[0].message.content;
};

module.exports = { callOpenRouter };
