const mongoose = require("mongoose");

/* AI Options Schema */
const aiOptionSchema = new mongoose.Schema(
    {
        image: { type: String, required: true },
        title: { type: String, required: true },
        bgColor: { type: String, required: true },
        route: { type: String, required: false }
    },
    { _id: false }
);

/* Quick Actions Schema */
const quickActionSchema = new mongoose.Schema(
    {
        label: { type: String, required: true },
        iconKey: { type: String, required: true },
        image: { type: String, required: true },
        route: { type: String, required: false }
    },
    { _id: false }
);

/* Horoscope Item Schema */
const horoscopeItemSchema = new mongoose.Schema(
    {
        image: { type: String, required: true },
        title: { type: String, required: true },
        route: { type: String, required: false }
    },
    { _id: false }
);

/* Report Schema */
const reportSchema = new mongoose.Schema(
    {
        image: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: String },
        route: { type: String, required: false }
    },
    { _id: false }
);

/* Panchang Item Schema */
const panchangItemSchema = new mongoose.Schema(
    {
        image: { type: String, required: true },
        title: { type: String, required: true },
        route: { type: String, required: false }
    },
    { _id: false }
);

/* Section 2025 Item Schema */
const section2025ItemSchema = new mongoose.Schema(
    {
        image: { type: String, required: true },
        title: { type: String, required: true },
        route: { type: String, required: false }
    },
    { _id: false }
);

/* User Profile Schema */
const userProfileSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        plan: {
            type: String,
            enum: ["Basic", "Premium", "Pro"],
            default: "Basic"
        }
    },
    { _id: false }
);

/* App Config Schema */
const appConfigSchema = new mongoose.Schema(
    {
        appName: { type: String, required: true },
        notificationCount: { type: String, default: "0" },
        userProfile: { type: userProfileSchema, required: true }
    },
    { _id: false }
);
const consultFilters = new mongoose.Schema(
    {
        label: { type: String, required: true },
        iconKey: { type: String, required: true },
        image: { type: String, required: true },
        route: { type: String, required: false } 
    },
    { _id: false }
)

/* Main Home Schema */
const homeSchema = new mongoose.Schema(
    {
        success: { type: Boolean, default: true },
        message: { type: String, default: "Home data fetched successfully" },

        data: {
            aiOptions: { type: [aiOptionSchema], default: [] },
            quickActions: { type: [quickActionSchema], default: [] },
            homeTabs: { type: [String], default: [] },
            horoscopeItems: { type: [horoscopeItemSchema], default: [] },
            reports: { type: [reportSchema], default: [] },
            panchangItems: { type: [panchangItemSchema], default: [] },
            section2025Items: { type: [section2025ItemSchema], default: [] },
            categories: { type: [String], default: [] },
            appConfig: { type: appConfigSchema, required: true },
            consultFilters: { type: [consultFilters], default: [] }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Homepage", homeSchema);
