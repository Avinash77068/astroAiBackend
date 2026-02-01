const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/database/db.js");
const setupRoutes = require("./src/routes/index.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
setupRoutes(app);

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

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