const connectDB = require("../database/db.js");
const Home = require("../model/HomepageSchema.js");
const defaultSidebarItems = require("../config/sidebarMenu.js");

const getSidebarData = async (req, res) => {
    try {
        await connectDB();
        const homepage = await Home.findOne().select("data.sidebarConfig").lean();
        const configuredItems = homepage?.data?.sidebarConfig?.sidebarItems;
        const sidebarItems = Array.isArray(configuredItems)
            ? configuredItems
            : defaultSidebarItems;

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