const homepageRoutes = require("./HomepageRoute");
const astrologerRoutes = require("./astrologerRoute");
const userRoutesController = require("./userRoute");
const aiFeatureRoutes = require("./aiFeatureRoute");

const setupRoutes = (app) => {
    app.use("/api/homepage", homepageRoutes);
    app.use("/api/astrologer", astrologerRoutes);
    app.use("/api/user", userRoutesController);
    app.use("/api/aiFeature", aiFeatureRoutes);
};

module.exports = setupRoutes;