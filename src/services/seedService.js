const Home = require("../model/HomepageSchema");
const AiFeatureConfig = require("../model/AiFeatureConfig");
const Rashi = require("../model/rashiSchema");
const Astrologer = require("../model/astrologerSchema");
const buildHomepageData = require("../config/homepageSeed");
const aiFeatureCatalog = require("../config/aiFeatureCatalog");
const rashiCatalog = require("../config/rashiCatalog");
const { getRashiAreas } = require("../config/rashiInsights");
const astrologerSeed = require("../config/astrologerSeed");

// Homepage (appConfig + sidebar + home sections) lives in one document and is reset to defaults.
const seedHomepage = async () => {
    await Home.findOneAndUpdate({}, { data: buildHomepageData() }, { upsert: true, new: true });
    return 1;
};

const seedAiFeatures = async () => {
    await AiFeatureConfig.bulkWrite(
        aiFeatureCatalog.map((feature, index) => ({
            updateOne: {
                filter: { id: feature.id },
                update: { $set: { ...feature, order: index + 1, isActive: true } },
                upsert: true
            }
        }))
    );
    return aiFeatureCatalog.length;
};

const seedRashis = async () => {
    await Rashi.bulkWrite(
        rashiCatalog.map((rashi, index) => ({
            updateOne: {
                filter: { id: rashi.id },
                update: { $set: { ...rashi, areas: getRashiAreas(rashi.id), order: index + 1, isActive: true } },
                upsert: true
            }
        }))
    );
    return rashiCatalog.length;
};

// $setOnInsert so existing astrologers (and the chat history tied to them) are never overwritten.
const seedAstrologers = async () => {
    await Astrologer.bulkWrite(
        astrologerSeed.map(astrologer => ({
            updateOne: {
                filter: { astrologerId: astrologer.astrologerId },
                update: { $setOnInsert: astrologer },
                upsert: true
            }
        }))
    );
    return astrologerSeed.length;
};

const seedAll = async () => ({
    homepage: await seedHomepage(),
    aiFeatures: await seedAiFeatures(),
    rashis: await seedRashis(),
    astrologers: await seedAstrologers()
});

module.exports = { seedAll, seedHomepage, seedAiFeatures, seedRashis, seedAstrologers };
