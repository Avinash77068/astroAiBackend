const mongoose = require("mongoose");
const env = require("../config/env");

const MONGO_URL = env.MONGO_URL;

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
