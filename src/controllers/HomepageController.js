const connectDB = require("../database/db");
const Home = require("../model/HomepageSchema");

const getHomepageData = async (req, res) => {
    try {
        await connectDB();
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
        await connectDB();
        const homeData = await Home.findOneAndUpdate(
            {},
            {
                data: {
                    aiOptions: [
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/2920/2920329.png",
                            title: "Kundli AI",
                            bgColor: "#FBBF24",
                            route: "/kundli-ai"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/3064/3064197.png",
                            title: "Matching",
                            bgColor: "#374151",
                            route: "/matching"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
                            title: "Love AI",
                            bgColor: "#F472B6",
                            route: "/love-ai"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/2942/2942831.png",
                            title: "Health AI",
                            bgColor: "#34D399",
                            route: "/health-ai"
                        }
                    ],
                    quickActions: [
                        {
                            label: "Career",
                            iconKey: "Briefcase",
                            image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                            route: "/career"
                        },
                        {
                            label: "Mental Health",
                            iconKey: "User",
                            image: "https://cdn-icons-png.flaticon.com/512/4003/4003407.png",
                            route: "/mental-health"
                        },
                        {
                            label: "Love",
                            iconKey: "Heart",
                            image: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
                            route: "/love"
                        },
                        {
                            label: "Finance",
                            iconKey: "Wallet",
                            image: "https://cdn-icons-png.flaticon.com/512/1170/1170576.png",
                            route: "/finance"
                        },
                        {
                            label: "Education",
                            iconKey: "Book",
                            image: "https://cdn-icons-png.flaticon.com/512/2436/2436636.png",
                            route: "/education"
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
                            title: "Daily",
                            route: "/daily-horoscope"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/869/869636.png",
                            title: "Weekly",
                            route: "/weekly-horoscope"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/869/869636.png",
                            title: "Monthly",
                            route: "/monthly-horoscope"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
                            title: "Yearly",
                            route: "/yearly-horoscope"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/869/869636.png",
                            title: "Tomorrow",
                            route: "/tomorrow-horoscope"
                        }
                    ],
                    reports: [
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/942/942748.png",
                            title: "Life Report",
                            price: "₹499",
                            route: "/life-report"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/942/942748.png",
                            title: "Monthly Report",
                            price: "₹199",
                            route: "/monthly-report"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/942/942748.png",
                            title: "Career Report",
                            price: "₹299",
                            route: "/career-report"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/942/942748.png",
                            title: "Marriage Report",
                            price: "₹399",
                            route: "/marriage-report"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/942/942748.png",
                            title: "Health Report",
                            price: "₹249",
                            route: "/health-report"
                        }
                    ],
                    panchangItems: [
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png",
                            title: "Daily Panchang",
                            route: "/daily-panchang"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/747/747310.png",
                            title: "Monthly Calendar",
                            route: "/monthly-calendar"
                        }
                    ],
                    section2025Items: [
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
                            title: "Horoscope 2025",
                            route: "/horoscope-2025"
                        },
                        {
                            image: "https://cdn-icons-png.flaticon.com/512/3208/3208722.png",
                            title: "Jupiter Transit 2025",
                            route: "/jupiter-transit-2025"
                        }
                    ],
                    consultFilters: [
                        {
                            label: "All",
                            iconKey: null,
                            image: null
                        },
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
                        },
                        {
                            label: "Health",
                            iconKey: "Activity",
                            image: "https://cdn-icons-png.flaticon.com/512/2966/2966486.png"
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
                        notificationCount: "6",
                        userProfile: {
                            name: "Guest",
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