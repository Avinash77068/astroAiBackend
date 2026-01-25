const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
    throw new Error("❌ MONGO_URL not found in environment variables");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URL, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log("✅ MongoDB connected");
    } catch (error) {
        cached.promise = null;
        console.error("❌ MongoDB connection error:", error.message);
        throw error;
    }

    return cached.conn;
};

module.exports = connectDB;
