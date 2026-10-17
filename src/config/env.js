const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const read = name => {
    const value = process.env[name];
    return value === undefined || value.trim() === "" ? undefined : value.trim();
};

const required = name => {
    const value = read(name);
    if (!value) throw new Error(`❌ ${name} not found in env`);
    return value;
};

const toNumber = (name, fallback) => {
    const value = read(name);
    if (value === undefined) return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) throw new Error(`❌ ${name} must be a number, got "${value}"`);
    return parsed;
};

const nodeEnv = read("NODE_ENV") || "development";

const env = Object.freeze({
    NODE_ENV: nodeEnv,
    IS_PRODUCTION: nodeEnv === "production",
    IS_DEVELOPMENT: nodeEnv === "development",
    PORT: toNumber("PORT", 3000),

    MONGO_URL: required("MONGO_URL"),

    JWT_SECRET: required("JWT_SECRET"),
    JWT_EXPIRE: read("JWT_EXPIRE") || "7d",
    OTP_SECRET: read("OTP_SECRET") || required("JWT_SECRET"),

    // Admin
    MAIL_USER: read("MAIL_USER"),

    // Email (Brevo)
    BREVO_API_KEY: read("BREVO_API_KEY"),
    EMAIL_FROM: read("EMAIL_FROM") || "no-reply@astroai.app",
    EMAIL_FROM_NAME: read("EMAIL_FROM_NAME") || "AstroAI",
    MAIL_TIMEOUT_MS: toNumber("MAIL_TIMEOUT_MS", 30000),

    // SMS (Twilio)
    TWILIO_ACCOUNT_SID: read("TWILIO_ACCOUNT_SID"),
    TWILIO_AUTH_TOKEN: read("TWILIO_AUTH_TOKEN"),
    TWILIO_PHONE: read("TWILIO_PHONE"),

    // AI (OpenRouter)
    OPENROUTER_API_KEY: read("OPENROUTER_API_KEY"),
    OPENROUTER_MODEL: read("OPENROUTER_MODEL"),
    OPENROUTER_SITE_URL: read("OPENROUTER_SITE_URL"),

    // Media (Cloudinary)
    CLOUDINARY_CLOUD_NAME: read("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: read("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: read("CLOUDINARY_API_SECRET"),

    // Google sign-in
    WEB_CLIENT_ID:
        read("WEB_CLIENT_ID") ||
        "693439184836-s3rn40uaml3bfq2bdpteb53p8de38ji7.apps.googleusercontent.com",
});

module.exports = env;
