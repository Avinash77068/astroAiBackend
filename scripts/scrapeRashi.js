const axios = require("axios");
const connectDB = require("../src/database/db.js");
const DailyHoroscope = require("../src/model/dailyHoroscopeSchema.js");

const BASE_URL = "https://www.astrosage.com/rashifal";
const SLUGS = {
    aries: "mesh",
    taurus: "vrishabha",
    gemini: "mithun",
    cancer: "karka",
    leo: "simha",
    virgo: "kanya",
    libra: "tula",
    scorpio: "vrishchika",
    sagittarius: "dhanu",
    capricorn: "makara",
    aquarius: "kumbha",
    pisces: "meena"
};

const stripTags = html => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

const parseLabeled = (html, label) => {
    const match = html.match(new RegExp(`<b>\\s*${label}\\s*:-\\s*</b>([^<]*)`));
    return match ? match[1].trim() : "";
};

const parseRatings = html => {
    const section = html.match(/<div class=show-grid>([\s\S]*?)<div class=clearfix>/);
    const ratings = {};
    if (!section) return ratings;
    for (const cell of section[1].matchAll(/<b>([^<:]+):\s*<\/b>([\s\S]*?)<br\/>/g)) {
        ratings[cell[1].trim()] = (cell[2].match(/star2/g) || []).length;
    }
    return ratings;
};

const parseDate = html => {
    const match = html.match(/<b>\s*([A-Za-z]+,\s*[A-Za-z]+ \d{1,2}, \d{4})\s*<\/b>/);
    const parsed = match ? new Date(`${match[1]} 12:00:00`) : new Date();
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
};

const scrapeRashi = async (rashiId, slug) => {
    const { data: html } = await axios.get(`${BASE_URL}/${slug}-rashifal.asp`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 20000
    });

    const prediction = html.match(/<div class='[^']*ui-large-content text-justify'>([\s\S]*?)<\/div>/);
    if (!prediction) throw new Error("prediction block not found (page layout may have changed)");

    return {
        rashiId,
        date: parseDate(html),
        prediction: stripTags(prediction[1]),
        luckyNumber: parseLabeled(html, "शुभ अंक"),
        luckyColor: parseLabeled(html, "शुभ रंग"),
        remedy: parseLabeled(html, "उपाय"),
        ratings: parseRatings(html)
    };
};

const run = async () => {
    const dryRun = Boolean(process.env.DRY_RUN);
    const mongoose = dryRun ? null : await connectDB();
    let saved = 0;

    for (const [rashiId, slug] of Object.entries(SLUGS)) {
        try {
            const data = await scrapeRashi(rashiId, slug);
            if (dryRun) {
                console.log(JSON.stringify(data, null, 2));
                break;
            }
            await DailyHoroscope.updateOne(
                { rashiId: data.rashiId, date: data.date },
                { $set: data },
                { upsert: true }
            );
            saved++;
            console.log(`✔ ${rashiId} (${data.date})`);
        } catch (error) {
            console.error(`✘ ${rashiId}: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log(`Saved ${saved}/${Object.keys(SLUGS).length}`);
    if (mongoose) await mongoose.disconnect();
};

run().catch(error => {
    console.error("Scrape failed:", error.message);
    process.exit(1);
});
