const Home = require("../model/HomepageSchema");

const getHomepageData = async (req, res) => {
    try {
        const homeData = await Home.findOne();
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
        const homeData = await Home.findOneAndUpdate(
            {},
            {
                data: {
                    aiOptions: [
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/2920/2920329.png",
                            title: "Kundli AI",
                            bgColor: "#FBBF24"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/3064/3064197.png",
                            title: "Matching",
                            bgColor: "#374151"
                        }
                    ],

                    quickActions: [
                        {
                            label: "Career",
                            iconKey: "Briefcase",
                            image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        },
                        {
                            label: "Mental Health",
                            iconKey: "User",
                            image: "https://cdn-icons-png.flaticon.com/512/4003/4003407.png"
                        }
                    ],

                    homeTabs: [
                        "Home",
                        "2025",
                        "Consult",
                        "Reports",
                        "Panchang",
                        "Horoscope"
                    ],

                    horoscopeItems: [
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
                            title: "Daily"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/869/869636.png",
                            title: "Weekly"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/869/869636.png",
                            title: "Monthly"
                        }
                    ],

                    reports: [
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/942/942748.png",
                            title: "Life Report",
                            price: "₹499"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/942/942748.png",
                            title: "Monthly Report",
                            price: "₹199"
                        }
                    ],

                    panchangItems: [
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png",
                            title: "Daily Panchang"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/747/747310.png",
                            title: "Monthly Calendar"
                        }
                    ],

                    section2025Items: [
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
                            title: "Horoscope 2025"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/3208/3208722.png",
                            title: "Jupiter Transit 2025"
                        }
                    ],

                    consultFilters: [
                        { label: "All", iconKey: null, image: null },
                        {
                            label: "Love",
                            iconKey: "Heart",
                            image: "https://cdn-icons-png.flaticon.com/512/833/833472.png"
                        },
                        {
                            label: "Career",
                            iconKey: "Briefcase",
                            image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        },
                        {
                            label: "Marriage",
                            iconKey: null,
                            image: "https://cdn-icons-png.flaticon.com/512/1006/1006363.png"
                        }
                    ],

                    categories: [
                        "Reports",
                        "Spiritual",
                        "Gemstones",
                        "Herbs",
                        "Services",
                        "Premium",
                        "AI Services",
                        "Others",
                        "Wellness",
                        "Accessories"
                    ],

                    appConfig: {
                        appName: "AstroSage AI",
                        notificationCount: "80",
                        userProfile: {
                            name: "918334904005",
                            plan: "Basic"
                        }
                    }
                }
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