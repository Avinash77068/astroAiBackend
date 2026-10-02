const axios = require('axios');
const {
    otpTemplate,
    passwordResetTemplate,
    astrologerActivityTemplate
} = require('./emailTemplates');

const MAIL_TIMEOUT_MS = Number(process.env.MAIL_TIMEOUT_MS) || 30000;

const withTimeout = (promise, timeoutMs = MAIL_TIMEOUT_MS) => {
    let timer;
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(`Mail send timed out after ${timeoutMs}ms`)), timeoutMs);
        })
    ]).finally(() => clearTimeout(timer));
};

const parseFrom = () => {
    const raw = process.env.EMAIL_FROM || 'no-reply@astroai.app';
    const match = raw.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
    return {
        name: process.env.EMAIL_FROM_NAME || 'AstroAI',
        email: match ? match[2].trim() : raw.trim()
    };
};

const send = async ({ to, name, subject, html, label = 'email' }) => {
    if (!process.env.BREVO_API_KEY) {
        throw new Error('Missing BREVO_API_KEY in environment; cannot send email');
    }
    if (typeof to !== 'string' || !to.trim()) {
        throw new Error(`A recipient email is required to send ${label}`);
    }

    try {
        const response = await withTimeout(axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: parseFrom(),
                to: [{ email: to.trim(), ...(name ? { name } : {}) }],
                subject,
                htmlContent: html
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                },
                timeout: MAIL_TIMEOUT_MS
            }
        ));
        return response.data;
    } catch (error) {
        const detail = error.response?.data?.message || error.message;
        console.error('Brevo send failed:', error.response?.data || error.message);
        throw new Error(`Failed to send ${label}: ${detail}`);
    }
};

const sendOtpEmail = (to, otp, name) => send({
    to,
    name,
    subject: 'Your AstroAI verification code',
    html: otpTemplate(otp, name),
    label: 'OTP email'
});

const sendPasswordResetEmail = (to, otp, name, ttlMinutes = 10) => send({
    to,
    name,
    subject: 'Reset your AstroAI password',
    html: passwordResetTemplate(otp, name, ttlMinutes),
    label: 'password reset email'
});

const sendAstrologerActivityEmail = ({ to, astrologerName, customerName, eventLabel }) => send({
    to,
    name: astrologerName,
    subject: `AstroAI: ${eventLabel}`,
    html: astrologerActivityTemplate({ astrologerName, customerName, eventLabel }),
    label: 'astrologer notification'
});

module.exports = {
    send,
    sendOtpEmail,
    sendPasswordResetEmail,
    sendAstrologerActivityEmail
};
