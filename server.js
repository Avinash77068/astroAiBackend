const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/database/db.js");
const homepageRoutes = require("./src/routes/HomepageRoute.js");
const astrologerRoutes = require("./src/routes/astrologerRoute.js");
const userRoutesController = require("./src/routes/userRoute.js");
dotenv.config();

const app = express();
const api ="api"
// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Routes
app.use("/api/homepage", homepageRoutes);
app.use("/api/astrologer", astrologerRoutes);
app.use("/api/user", userRoutesController);

app.listen(3000, () => {
    console.log("Server started on port http://localhost:3000");
});