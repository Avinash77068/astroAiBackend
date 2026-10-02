const connectDB = require("../src/database/db.js");
const { seedAstrologers } = require("../src/services/seedService");

connectDB()
    .then(async mongoose => {
        console.log("Seeded astrologers:", await seedAstrologers());
        await mongoose.disconnect();
    })
    .catch(error => {
        console.error("Astrologer seed failed:", error.message);
        process.exit(1);
    });
