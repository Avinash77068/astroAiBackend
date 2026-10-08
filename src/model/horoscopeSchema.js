const mongoose = require("mongoose");

const dailyHoroscopeSchema = new mongoose.Schema(
    {
        rashiId: { type: String, required: true, index: true },
        date: { type: String, required: true },
        prediction: { type: String, required: true },
        luckyNumber: { type: String, default: "" },
        luckyColor: { type: String, default: "" },
        remedy: { type: String, default: "" },
        ratings: { type: Map, of: Number, default: {} },
        source: { type: String, default: "astrosage.com" }
    },
    { timestamps: true }
);

dailyHoroscopeSchema.index({ rashiId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyHoroscope", dailyHoroscopeSchema);
