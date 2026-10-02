const connectDB = require("../src/database/db.js");
const { seedAll } = require("../src/services/seedService");

connectDB()
    .then(async mongoose => {
        console.log("Seeded:", await seedAll());
        await mongoose.disconnect();
    })
    .catch(error => {
        console.error("Seed failed:", error.message);
        process.exit(1);
    });
