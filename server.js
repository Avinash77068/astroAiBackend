const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/database/db.js");
const homepageRoutes = require("./src/routes/HomepageRoute.js");
const astrologerRoutes = require("./src/routes/astrologerRoute.js");
const userRoutesController = require("./src/routes/userRoute.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api/homepage", homepageRoutes);
app.use("/api/astrologer", astrologerRoutes);
app.use("/api/user", userRoutesController);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        success: true, 
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT}`);
});