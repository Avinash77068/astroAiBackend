const axios = require('axios');
const env = require("../../../config/env");

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// OpenAI-style messages -> Gemini systemInstruction + contents
const toGeminiPayload = (messages) => {
    const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
    const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    return { system, contents };
};

const callGemini = async (messages, { maxTokens = 500, timeoutMs = 30000, temperature = 0.3 } = {}) => {
    const { system, contents } = toGeminiPayload(messages);
    const generationConfig = { temperature, maxOutputTokens: maxTokens };
    // 2.5 Flash "thinking" tokens eat into maxOutputTokens; keep replies from getting cut off
    if (/2\.5-flash/.test(env.GEMINI_MODEL)) generationConfig.thinkingConfig = { thinkingBudget: 0 };

    const response = await axios.post(
        `${GEMINI_BASE_URL}/${env.GEMINI_MODEL}:generateContent`,
        {
            ...(system && { systemInstruction: { parts: [{ text: system }] } }),
            contents,
            generationConfig
        },
        {
            headers: { 'x-goog-api-key': env.GEMINI_API_KEY, 'Content-Type': 'application/json' },
            timeout: timeoutMs
        }
    );

    const parts = response?.data?.candidates?.[0]?.content?.parts;
    const content = Array.isArray(parts) ? parts.map((p) => p.text || '').join('') : '';

    if (!content.trim()) {
        console.error('Unexpected Gemini response:', JSON.stringify(response?.data || {}).slice(0, 1000));
        throw new Error(response?.data?.error?.message || 'Gemini returned no message content');
    }

    return content;
};

module.exports = { callGemini };
