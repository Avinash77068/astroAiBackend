module.exports = [
    { title: "My Profile", icon: "user", route: "/profile", isActive: true, requiresAuth: true, order: 1 },
    { title: "My Rewards", icon: "gift", route: "/rewards", isActive: true, requiresAuth: true, order: 2 },
    { title: "Help & Support", icon: "support", route: "/support", isActive: true, requiresAuth: false, order: 3 },
    { title: "About Us", icon: "info", route: "/about", isActive: true, requiresAuth: false, order: 4 },
    { title: "Terms & Conditions", icon: "terms", route: "/terms", isActive: true, requiresAuth: false, order: 5 },
    { title: "Privacy Policy", icon: "privacy", route: "/privacy", isActive: true, requiresAuth: false, order: 6 },
    { title: "Settings", icon: "settings", route: "/settings", isActive: true, requiresAuth: true, order: 7 },
    { title: "Language", icon: "language", route: "/language", isActive: true, requiresAuth: false, order: 8 },
    { title: "Logout", icon: "logout", route: "logout", isActive: true, requiresAuth: true, order: 9 }
];