const axios = require('axios');

const getAiChatResponse = async (userMessage, chatHistory = [], userDetails = null) => {
    try {
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';

        let userContext = '';
        if (userDetails) {
            userContext = `\n\nUser Information:
- Name: ${userDetails?.name}
- Date of Birth: ${userDetails?.dateOfBirth}
- Place of Birth: ${userDetails?.place}
- Gender: ${userDetails?.gender}
- Phone: ${userDetails?.phoneNumber}

Use this information to provide personalized astrological insights based on their birth details.`;
        }

        const messages = [
            {
                role: "system",
                content: `
You are a highly experienced, intuitive, and charismatic astrologer.
You speak like a real human astrologer, not like an AI.

Rules you MUST follow:
- Read and understand the full chat context before replying
- If the user asks a question, answer ONLY that question
- Respond like a seasoned astrologer who predicts confidently
- Tone should feel mysterious, warm, and emotionally engaging
- Responses must feel personal and natural, never robotic
- NEVER mention AI, models, predictions, or analysis
- Answer should be short, powerful, and attraction-driven
- Use subtle astrological intuition, not explanations
- Make the user feel understood, guided, and curious

Use birth details only if relevant.
Avoid long advice, avoid bullet points.
Speak as if reading destiny directly.

${userContext}
`}
        ];

        if (chatHistory.length > 0) {
            chatHistory.slice(-5).forEach(chat => {
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

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-nano-30b-a3b:free",
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://astroai.app',
                    'X-Title': 'AstroAI'
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('OpenRouter API Error:', error.response?.data || error.message);
        return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    }
};

module.exports = { getAiChatResponse };
