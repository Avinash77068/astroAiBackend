const axios = require("axios");
const connectDB = require("../database/db.js");
const Horoscope = require("../model/horoscopeSchema.js");

const SITE_URL = "https://www.astrosage.com";
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

const decodeEntities = text => text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const stripTags = html => decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

const withLineBreaks = html => decodeEntities(
    html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "")
).split("\n").map(line => line.trim()).filter(Boolean).join("\n");

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

const parseHeading = html => {
    const match = html.match(/<div class='ui-large-hdg'>([\s\S]*?)<\/div>/);
    return match ? stripTags(match[1]) : "";
};

const toIsoDate = label => {
    const parsed = new Date(`${label} 12:00:00`);
    if (Number.isNaN(parsed.getTime())) return "";
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
};

const PERIODS = {
    daily: {
        url: slug => `${SITE_URL}/rashifal/${slug}-rashifal.asp`,
        parse: html => {
            const block = html.match(/<div class='[^']*ui-large-content text-justify'>([\s\S]*?)<\/div>/);
            const dateLabel = (html.match(/<b>\s*([A-Za-z]+,\s*[A-Za-z]+ \d{1,2}, \d{4})\s*<\/b>/) || [])[1];
            return {
                periodKey: (dateLabel && toIsoDate(dateLabel)) || toIsoDate(new Date().toDateString()),
                prediction: block ? stripTags(block[1]) : "",
                luckyNumber: parseLabeled(html, "शुभ अंक"),
                luckyColor: parseLabeled(html, "शुभ रंग"),
                remedy: parseLabeled(html, "उपाय"),
                ratings: parseRatings(html)
            };
        }
    },
    weekly: {
        url: slug => `${SITE_URL}/rashifal/saptahik/${slug}-rashifal.asp`,
        parse: html => {
            const block = html.match(/<div class='ui-large-content'>([\s\S]*?)(?:<br\s*\/?>\s*<p>|<\/div>)/);
            return {
                periodKey: parseHeading(html),
                prediction: block ? stripTags(block[1]) : ""
            };
        }
    },
    monthly: {
        url: slug => `${SITE_URL}/rashifal/masik/${slug}-rashifal.asp`,
        parse: html => {
            const sections = [...html.matchAll(
                /<div class='ui-large-content'><b>([^<]+)<\/b><\/div><div class='text-justify'>([\s\S]*?)<\/div>/g
            )].map(match => ({ title: stripTags(match[1]), text: withLineBreaks(match[2]) }));
            return { periodKey: parseHeading(html), sections };
        }
    },
    yearly: {
        url: slug => `${SITE_URL}/${new Date().getFullYear()}/${slug}-rashifal-${new Date().getFullYear()}.asp`,
        parse: html => {
            const sections = html.split("<h2><strong>").slice(1).map(chunk => {
                const [title, rest = ""] = chunk.split("</h2>");
                const body = rest.split("</div>")[0];
                const text = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)]
                    .map(match => match[1])
                    .filter(paragraph => !/href=/.test(paragraph))
                    .map(stripTags)
                    .filter(Boolean)
                    .join("\n");
                return { title: stripTags(title), text };
            }).filter(section => section.text);
            return { periodKey: String(new Date().getFullYear()), sections };
        }
    }
};

const scrape = async (period, rashiId, slug) => {
    const config = PERIODS[period];
    const { data: html } = await axios.get(config.url(slug), {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 20000
    });

    const parsed = config.parse(html);
    if (!parsed.periodKey || (!parsed.prediction && !(parsed.sections || []).length)) {
        throw new Error("content not found (page layout may have changed)");
    }
    return { rashiId, period, ...parsed };
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const scrapeHoroscopes = async (periods = Object.keys(PERIODS), { dryRun = false } = {}) => {
    const unknown = periods.find(period => !PERIODS[period]);
    if (unknown) {
        throw new Error(`Unknown period "${unknown}". Use daily, weekly, monthly, yearly or all.`);
    }

    if (!dryRun) await connectDB();
    let saved = 0;
    let total = 0;

    for (const period of periods) {
        for (const [rashiId, slug] of Object.entries(SLUGS)) {
            total++;
            try {
                const data = await scrape(period, rashiId, slug);
                if (dryRun) {
                    console.log(JSON.stringify(data, null, 2));
                    break;
                }
                await Horoscope.updateOne(
                    { rashiId, period, periodKey: data.periodKey },
                    { $set: data },
                    { upsert: true }
                );
                saved++;
                console.log(`✔ ${period} ${rashiId} (${data.periodKey})`);
            } catch (error) {
                console.error(`✘ ${period} ${rashiId}: ${error.message}`);
            }
            await delay(1500);
        }
    }

    return { saved, total };
};

module.exports = { scrapeHoroscopes, PERIODS };
