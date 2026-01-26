const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("../utils/logger");
dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
    logger.error('MONGO_URL not found in environment variables');
    throw new Error("❌ MONGO_URL not found in environment variables");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        logger.info('Using cached MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        logger.info('Initializing MongoDB connection');
        cached.promise = mongoose.connect(MONGO_URL, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        });
    }

    try {
        cached.conn = await cached.promise;
        logger.success('MongoDB connected successfully', {
            database: cached.conn.name,
            host: cached.conn.host
        });
    } catch (error) {
        cached.promise = null;
        logger.error('MongoDB connection failed', {
            error: error.message,
            mongoUrl: MONGO_URL ? 'Present' : 'Missing'
        });
        console.error("❌ MongoDB connection error:", error.message);
        throw error;
    }

    return cached.conn;
};

module.exports = connectDB;
