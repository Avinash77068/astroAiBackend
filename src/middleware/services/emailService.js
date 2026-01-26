const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
    try {
        // Check if email credentials are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`📧 Email OTP for ${email}: ${otp}`);
            console.log("⚠️  Email credentials not configured. Add EMAIL_USER and EMAIL_PASS to .env file");
            return { success: true, message: "OTP logged to console (Email not configured)" };
        }

        const transporter = nodemailer.createTransporter({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your AstroAI OTP Code",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #4F46E5;">Your AstroAI OTP</h2>
                    <p style="font-size: 18px;">Your OTP code is:</p>
                    <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                    <p style="color: #666;">This OTP is valid for 5 minutes.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
            `,
        });

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Email Service Error:", error.message);
        console.log(`📧 Fallback - OTP for ${email}: ${otp}`);
        return { success: true, message: "OTP logged to console (Email failed)" };
    }
};

module.exports = sendEmail;
