const mongoose = require("mongoose");

const rashiAreaSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        title: { type: String, required: true },
        label: { type: String, required: true },
        description: { type: String, required: true }
    },
    { _id: false }
);

const rashiSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true, index: true },
        symbol: { type: String, required: true },
        name: { type: String, required: true },
        englishName: { type: String, required: true },
        element: { type: String, required: true },
        rulingPlanet: { type: String, required: true },
        description: { type: String, required: true },
        areas: { type: [rashiAreaSchema], default: [] },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Rashi", rashiSchema);