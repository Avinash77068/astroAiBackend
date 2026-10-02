const mongoose = require("mongoose");

const featureFieldSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        label: { type: String, required: true },
        placeholder: { type: String, default: "" },
        keyboardType: { type: String, default: "default" },
        multiline: { type: Boolean, default: false },
        required: { type: Boolean, default: false }
    },
    { _id: false }
);

const aiFeatureConfigSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true },
        endpoint: { type: String, required: true },
        iconKey: { type: String, required: true },
        backgroundColor: { type: String, default: "#121420" },
        fields: { type: [featureFieldSchema], default: [] },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AiFeatureConfig", aiFeatureConfigSchema);