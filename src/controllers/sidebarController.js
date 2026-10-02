const connectDB = require("../database/db.js");
const Home = require("../model/HomepageSchema.js");

const getSidebarData = async (req, res) => {
    try {
        await connectDB();
        const homepage = await Home.findOne().select("data.sidebarConfig").lean();
        if (!homepage) {
            return res.status(404).json({
                success: false,
                message: "Homepage configuration has not been seeded"
            });
        }
        const sidebarItems = homepage.data?.sidebarConfig?.sidebarItems || [];

        res.status(200).json({
            success: true,
            data: { sidebarItems },
            message: "Sidebar data fetched successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching sidebar data",
            error: error.message
        });
    }
};

module.exports = { getSidebarData };