const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        text: { type: String, required: true }
    },
    { _id: false }
);

const horoscopeSchema = new mongoose.Schema(
    {
        rashiId: { type: String, required: true, index: true },
        period: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], required: true },
        periodKey: { type: String, required: true },
        prediction: { type: String, default: "" },
        sections: { type: [sectionSchema], default: [] },
        luckyNumber: { type: String, default: "" },
        luckyColor: { type: String, default: "" },
        remedy: { type: String, default: "" },
        ratings: { type: Map, of: Number, default: {} },
        source: { type: String, default: "astrosage.com" }
    },
    { timestamps: true }
);

horoscopeSchema.index({ rashiId: 1, period: 1, periodKey: 1 }, { unique: true });

module.exports = mongoose.model("Horoscope", horoscopeSchema);
