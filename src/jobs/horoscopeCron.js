const cron = require("node-cron");
const { scrapeHoroscopes } = require("../services/horoscopeScraperService");

const TIMEZONE = "Asia/Kolkata";

const SCHEDULES = [
    { period: "daily", expression: "30 0 * * *" },
    { period: "weekly", expression: "45 0 * * 1" },
    { period: "monthly", expression: "0 1 1 * *" },
    { period: "yearly", expression: "15 1 1 1 *" }
];

const startHoroscopeCron = () => {
    const running = new Set();

    for (const { period, expression } of SCHEDULES) {
        cron.schedule(expression, async () => {
            if (running.has(period)) return;
            running.add(period);
            try {
                const { saved, total } = await scrapeHoroscopes([period]);
                console.log(`Horoscope cron (${period}): saved ${saved}/${total}`);
            } catch (error) {
                console.error(`Horoscope cron (${period}) failed:`, error.message);
            } finally {
                running.delete(period);
            }
        }, { timezone: TIMEZONE });
    }

    console.log("Horoscope cron scheduled");
};

module.exports = startHoroscopeCron;
