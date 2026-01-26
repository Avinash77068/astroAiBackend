const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
    throw new Error("❌ MONGO_URL not found in env");
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
            serverSelectionTimeoutMS: 10000,
        });
    }

    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected");
    return cached.conn;
};

module.exports = connectDB;
