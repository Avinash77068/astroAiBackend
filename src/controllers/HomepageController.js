const connectDB = require("../database/db.js");
const Home = require("../model/HomepageSchema");
const dotenv = require("dotenv");
const buildHomepageData = require("../config/homepageSeed.js");
dotenv.config();

const getHomepageData = async (req, res) => {
    try {
        await connectDB();
        const homeData = await Home.findOne();
        if (!homeData) {
            return res.status(404).json({
                success: false,
                message: "Homepage configuration has not been seeded"
            });
        }

        res.status(200).json({
            success: true,
            data: homeData,
            message: "Home data fetched successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching home data",
            error: error.message
        });
    }
};


const createHomepageData = async (req, res) => {
    try {
        const { adminMail } = req.body;
        if (adminMail !== process.env.MAIL_USER) {
            return res.status(400).json({
                success: false,
                message: "You are not authorized to create home data 😔"
            });
        }
        await connectDB();
        const homeData = await Home.findOneAndUpdate(
            {},
            {
                data: buildHomepageData()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: "Home data saved successfully",
            data: homeData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


module.exports = { getHomepageData, createHomepageData };