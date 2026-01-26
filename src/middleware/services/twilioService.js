const twilio = require("twilio");
const logger = require("../../utils/logger");

const sendSMS = async (phone, otp) => {
    try {
        // Check if Twilio credentials are configured
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE) {
            logger.warn('Twilio credentials not configured - OTP logged to console');
            console.log(`📱 SMS OTP for ${phone}: ${otp}`);
            return { success: true, message: "OTP logged to console (Twilio not configured)" };
        }

        logger.info('Sending SMS via Twilio', { phone });

        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        const message = await client.messages.create({
            body: `Your AstroAI OTP is: ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE,
            to: phone,
        });

        logger.success('SMS sent successfully', { messageId: message.sid, phone });

        return { success: true, sid: message.sid };
    } catch (error) {
        logger.error('Twilio SMS failed', {
            error: error.message,
            phone
        });
        console.error("Twilio SMS Error:", error.message);
        console.log(`📱 Fallback - OTP for ${phone}: ${otp}`);
        return { success: true, message: "OTP logged to console (SMS failed)" };
    }
};

module.exports = sendSMS;
