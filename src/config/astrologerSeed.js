const profiles = [
    { name: "Pandit Rajesh Sharma", type: "Vedic Astrology", price: "₹25/min", experience: "12 years", specialization: ["Birth chart", "Horoscope"], status: "ONLINE" },
    { name: "Acharya Meera Joshi", type: "Tarot", price: "₹30/min", experience: "8 years", specialization: ["Tarot", "Relationships"], status: "ONLINE" },
    { name: "Guru Anil Mishra", type: "Numerology", price: "₹20/min", experience: "10 years", specialization: ["Numerology", "Career"], status: "ONLINE" },
    { name: "Dr. Kavita Rao", type: "Vastu", price: "₹40/min", experience: "15 years", specialization: ["Vastu", "Finance"], status: "BUSY" },
    { name: "Swami Prakash Tiwari", type: "Vedic Astrology", price: "₹35/min", experience: "20 years", specialization: ["Marriage", "Health"], status: "ONLINE" },
    { name: "Jyotishi Neha Verma", type: "Palmistry", price: "₹22/min", experience: "6 years", specialization: ["Palmistry", "Love"], status: "OFFLINE" },
    { name: "Pandit Suresh Pandey", type: "Vedic Astrology", price: "₹28/min", experience: "14 years", specialization: ["Career", "Education"], status: "ONLINE" },
    { name: "Acharya Sunita Devi", type: "Tarot", price: "₹18/min", experience: "5 years", specialization: ["Tarot", "Mental health"], status: "OFFLINE" }
];

module.exports = profiles.map((profile, index) => ({
    ...profile,
    astrologerId: index + 1,
    description: `${profile.name} offers guidance in ${profile.type}.`,
    rating: +(4.2 + ((index * 7) % 8) / 10).toFixed(1),
    reviews: 40 + index * 17,
    verified: true,
    image: `https://i.pravatar.cc/200?img=${index + 11}`,
    languages: ["Hindi", "English"],
    sessionType: "CHAT"
}));
