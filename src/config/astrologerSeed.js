const profiles = [
    {
        name: "Anandan",
        type: "Vedic Astrology",
        price: "₹25/min",
        experience: "8 years",
        languages: ["English", "Tamil", "Kannada", "Hindi"],
        specialization: ["Vedic", "Remedies", "Predictions"],
        profileUrl: "https://astrotalk.com/best-astrologer/anandan",
        description: "External AstroTalk profile. Listed for Vedic astrology, remedies, and predictions. Availability is managed on AstroTalk."
    },
    {
        name: "Rajish",
        type: "Vedic Astrology",
        price: "₹20/min",
        experience: "4 years",
        languages: ["English", "Hindi", "Sanskrit"],
        specialization: ["Vedic", "Remedies", "Predictions"],
        profileUrl: "https://astrotalk.com/best-astrologer/rajish",
        description: "External AstroTalk profile. Listed for Vedic astrology, remedies, and predictions. Availability is managed on AstroTalk."
    },
    {
        name: "Harikishan",
        type: "Vedic Astrology",
        price: "₹17/min",
        experience: "4 years",
        languages: ["Hindi"],
        specialization: ["Vedic", "Vastu", "Remedies", "Predictions"],
        profileUrl: "https://astrotalk.com/best-astrologer/harikishan",
        description: "External AstroTalk profile. Listed for Vedic astrology, Vastu, remedies, and predictions. Availability is managed on AstroTalk."
    },
    {
        name: "Srinath",
        type: "Vedic Astrology",
        price: "₹57/min",
        experience: "9 years",
        languages: ["English", "Hindi"],
        specialization: ["Vedic", "Numerology", "Vastu", "Face Reading", "Remedies", "Predictions"],
        profileUrl: "https://astrotalk.com/best-astrologer/Srinath",
        description: "External AstroTalk profile. Listed for Vedic astrology, numerology, Vastu, and face reading. Availability is managed on AstroTalk."
    },
    {
        name: "Mahinath",
        type: "Vedic Astrology",
        price: "₹14/min",
        experience: "9 years",
        languages: ["Hindi"],
        specialization: ["Vedic", "Life Coach", "Remedies", "Predictions"],
        profileUrl: "https://astrotalk.com/best-astrologer/mahinath",
        description: "External AstroTalk profile. Listed for Vedic astrology and life coaching. Availability is managed on AstroTalk."
    },
    {
        name: "Svaminath",
        type: "Vedic Astrology",
        price: "₹35/min",
        experience: "5 years",
        languages: ["Hindi", "English"],
        specialization: ["Vedic", "Nadi", "Vastu", "Prashana", "Palmistry", "Face Reading", "Remedies", "Predictions"],
        profileUrl: "https://astrotalk.com/best-astrologer/svaminath",
        description: "External AstroTalk profile. Listed for Vedic, Nadi, Vastu, Prashana, and palmistry. Availability is managed on AstroTalk."
    },
    {
        name: "Gaurav",
        type: "Vedic Astrology",
        price: "₹53/min",
        experience: "26 years",
        languages: ["English", "Hindi"],
        specialization: ["Vedic", "Tarot", "Palmistry", "Face Reading", "Remedies", "Predictions"],
        profileUrl: "https://astrotalk.com/best-astrologer/gaurav",
        description: "External AstroTalk profile. Listed for Vedic astrology, Tarot, palmistry, and face reading. Availability is managed on AstroTalk."
    },
    {
        name: "Ramlakhan",
        type: "Vedic Astrology",
        price: "₹18/min",
        experience: "23 years",
        languages: ["Hindi"],
        specialization: ["Vedic", "Nadi", "Vastu", "Remedies", "Predictions"],
        profileUrl: "https://astrotalk.com/best-astrologer/ramlakhan",
        description: "External AstroTalk profile. Listed for Vedic, Nadi, Vastu, and remedies. Availability is managed on AstroTalk."
    },
    {
        name: "Eeswaran",
        type: "Vedic Astrology",
        price: "₹16/min",
        experience: "4 years",
        languages: ["English", "Tamil"],
        specialization: ["Vedic", "Remedies", "Predictions"],
        profileUrl: "https://astrotalk.com/best-astrologer/eeswaran",
        description: "External AstroTalk profile. Listed for Vedic astrology, remedies, and predictions. Availability is managed on AstroTalk."
    },
    {
        name: "Ishrith",
        type: "Vedic Astrology",
        price: "₹25/min",
        experience: "6 years",
        languages: ["Hindi", "Marathi"],
        specialization: ["Vedic", "Remedies", "Predictions"],
        profileUrl: "https://astrotalk.com/best-astrologer/ishrith",
        description: "External AstroTalk profile. Listed for Vedic astrology, remedies, and predictions. Availability is managed on AstroTalk."
    }
];

module.exports = profiles.map((profile, index) => ({
    ...profile,
    astrologerId: index + 1,
    rating: 0,
    reviews: 0,
    verified: false,
    image: "",
    status: "OFFLINE",
    sessionType: "CHAT"
}));
