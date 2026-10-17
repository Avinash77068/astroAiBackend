const twilio = require("twilio");
const env = require("../../config/env");

const sendSMS = async (phone, otp) => {
    try {    
        // Check if Twilio credentials are configured
        if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE) {
            console.log(`📱 SMS OTP for ${phone}: ${otp}`);
            console.log("⚠️  Twilio credentials not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE to .env file");
            return { success: true, message: "OTP logged to console (Twilio not configured)" };
        }

        const client = require('twilio')(
            env.TWILIO_ACCOUNT_SID,
            env.TWILIO_AUTH_TOKEN
        );
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        const message = await client.messages.create({
            body: `Your AstroAI OTP is: ${otp}. Valid for 5 minutes.`,
            from: env.TWILIO_PHONE,
            to: formattedPhone,
        });

        return { success: true, sid: message.sid };
    } catch (error) {
        console.error("Twilio SMS Error:", error.message);
        console.log(`📱 Fallback - OTP for ${phone}: ${otp}`);
        return { success: true, message: "OTP logged to console (SMS failed)" };
    }
};

module.exports = sendSMS;
