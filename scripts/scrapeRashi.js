const mongoose = require("mongoose");
const { scrapeHoroscopes, PERIODS } = require("../src/services/horoscopeScraperService");

const arg = process.argv[2] || "all";
const periods = arg === "all" ? Object.keys(PERIODS) : [arg];

scrapeHoroscopes(periods, { dryRun: Boolean(process.env.DRY_RUN) })
    .then(async ({ saved, total }) => {
        if (!process.env.DRY_RUN) console.log(`Saved ${saved}/${total}`);
        await mongoose.disconnect();
    })
    .catch(error => {
        console.error("Scrape failed:", error.message);
        process.exit(1);
    });
