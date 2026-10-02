const homepageRoutes = require("./HomepageRoute");
const astrologerRoutes = require("./astrologerRoute");
const userRoutesController = require("./userRoute");
const aiFeatureRoutes = require("./aiFeatureRoute");
const sidebarRoutes = require("./sidebarRoute");
const rashiRoutes = require("./rashiRoute");
const walletRoutes = require("./walletRoute");
const setupApiRoutes = require("./setupRoute");

const setupRoutes = (app) => {
    app.use("/api/homepage", homepageRoutes);
    app.use("/api/astrologer", astrologerRoutes);
    app.use("/api/user", userRoutesController);
    app.use("/api/aiFeature", aiFeatureRoutes);
    app.use("/api/sidebar", sidebarRoutes);
    app.use("/api/rashis", rashiRoutes);
    app.use("/api/wallet", walletRoutes);
    app.use("/api/setup", setupApiRoutes);
};

module.exports = setupRoutes;