const mongoose = require("mongoose");

const aiFeatureSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    featureType: { type: String, required: true, enum: ['career', 'education', 'finance', 'health', 'kundli', 'love', 'matching', 'mental-health'] },
    input: { type: Object, required: true },
    output: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AiFeature', aiFeatureSchema);