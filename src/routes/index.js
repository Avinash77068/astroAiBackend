const homepageRoutes = require("./HomepageRoute");
const astrologerRoutes = require("./astrologerRoute");
const userRoutesController = require("./userRoute");
const aiFeatureRoutes = require("./aiFeatureRoute");
const sidebarRoutes = require("./sidebarRoute");
const rashiRoutes = require("./rashiRoute");
const walletRoutes = require("./walletRoute");
const setupApiRoutes = require("./setupRoute");
const astrologerChatRoutes = require("./astrologerChatRoute");
const notificationRoutes = require("./notificationRoute");
const astrologerApplicationRoutes = require("./astrologerApplicationRoute");

const setupRoutes = (app) => {
    app.use("/api/homepage", homepageRoutes);
    app.use("/api/astrologer", astrologerRoutes);
    app.use("/api/user", userRoutesController);
    app.use("/api/aiFeature", aiFeatureRoutes);
    app.use("/api/sidebar", sidebarRoutes);
    app.use("/api/rashis", rashiRoutes);
    app.use("/api/wallet", walletRoutes);
    app.use("/api/setup", setupApiRoutes);
    app.use("/api/astrologer-chat", astrologerChatRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/admin/astrologer-applications", astrologerApplicationRoutes);
};

module.exports = setupRoutes;