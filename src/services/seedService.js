const Home = require("../model/HomepageSchema");
const AiFeatureConfig = require("../model/AiFeatureConfig");
const Rashi = require("../model/rashiSchema");
const Astrologer = require("../model/astrologerSchema");
const buildHomepageData = require("../config/homepageSeed");
const aiFeatureCatalog = require("../config/aiFeatureCatalog");
const rashiCatalog = require("../config/rashiCatalog");
const { getRashiAreas } = require("../config/rashiInsights");
const astrologerSeed = require("../config/astrologerSeed");
const { syncAstrologerUsers } = require("./astrologerSyncService");

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

// Refresh seeded profile fields without changing user/session identifiers or chat history.
const seedAstrologers = async () => {
    await Astrologer.bulkWrite(
        astrologerSeed.map(({ rating, reviews, verified, status, sessionType, ...profile }) => ({
            updateOne: {
                filter: { astrologerId: profile.astrologerId },
                update: {
                    $set: profile,
                    $setOnInsert: { rating, reviews, verified, status, sessionType }
                },
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
    astrologers: await seedAstrologers(),
    syncedAstrologerUsers: await syncAstrologerUsers()
});

module.exports = { seedAll, seedHomepage, seedAiFeatures, seedRashis, seedAstrologers };
