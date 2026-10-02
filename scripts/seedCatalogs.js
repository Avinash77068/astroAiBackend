const connectDB = require("../src/database/db.js");
const AiFeatureConfig = require("../src/model/AiFeatureConfig");
const Rashi = require("../src/model/rashiSchema");
const aiFeatureCatalog = require("../src/config/aiFeatureCatalog");
const rashiCatalog = require("../src/config/rashiCatalog");
const { getRashiAreas } = require("../src/config/rashiInsights");

const seed = async () => {
    const mongoose = await connectDB();

    await AiFeatureConfig.bulkWrite(
        aiFeatureCatalog.map((feature, index) => ({
            updateOne: {
                filter: { id: feature.id },
                update: { $set: { ...feature, order: index + 1, isActive: true } },
                upsert: true
            }
        }))
    );

    await Rashi.bulkWrite(
        rashiCatalog.map((rashi, index) => ({
            updateOne: {
                filter: { id: rashi.id },
                update: { $set: { ...rashi, areas: getRashiAreas(rashi.id), order: index + 1, isActive: true } },
                upsert: true
            }
        }))
    );

    console.log(`Seeded ${aiFeatureCatalog.length} AI features, ${rashiCatalog.length} rashis`);
    await mongoose.disconnect();
};

seed().catch(error => {
    console.error("Seed failed:", error.message);
    process.exit(1);
});
