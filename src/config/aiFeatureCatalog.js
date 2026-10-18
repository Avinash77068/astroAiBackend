const questionField = (label, placeholder) => ({
    name: "question",
    label,
    placeholder,
    multiline: true,
    required: true
});

// Optional detail: may be left blank, only sent to the AI when filled.
const optionalField = (name, label, placeholder = "") => ({ name, label, placeholder, required: false });

module.exports = [
    {
        id: "kundli",
        title: "Kundli",
        endpoint: "analyze-kundli",
        iconKey: "stars",
        backgroundColor: "#FFF4D6",
        fields: [
            { name: "name", label: "Name", required: true },
            { name: "dateOfBirth", label: "Date of birth", placeholder: "YYYY-MM-DD", required: true },
            { name: "timeOfBirth", label: "Time of birth", placeholder: "HH:mm", required: true },
            { name: "placeOfBirth", label: "Place of birth", required: true }
        ]
    },
    {
        id: "career",
        title: "Career",
        endpoint: "analyze-career",
        iconKey: "briefcase",
        backgroundColor: "#EAF3FF",
        fields: [
            optionalField("profession", "वर्तमान काम / पद (वैकल्पिक)", "जैसे: सॉफ्टवेयर इंजीनियर, शिक्षक, व्यवसायी"),
            optionalField("experience", "अनुभव (वैकल्पिक)", "जैसे: 3 साल"),
            questionField("काम या करियर से जुड़ा सवाल", "आप किस काम या करियर निर्णय पर मार्गदर्शन चाहते हैं?")
        ]
    },
    {
        id: "health",
        title: "Health",
        endpoint: "analyze-health",
        iconKey: "heart-pulse",
        backgroundColor: "#FDECEC",
        fields: [
            optionalField("age", "उम्र (वैकल्पिक)", "जैसे: 28"),
            optionalField("lifestyle", "दिनचर्या (वैकल्पिक)", "जैसे: देर रात तक काम, कम नींद, रोज़ टहलना"),
            questionField("स्वास्थ्य और दिनचर्या का सवाल", "अपनी चिंता या सवाल लिखें। यह सामान्य ज्योतिषीय मार्गदर्शन है, चिकित्सकीय सलाह नहीं।")
        ]
    },
    {
        id: "education",
        title: "Education",
        endpoint: "analyze-education",
        iconKey: "graduation-cap",
        backgroundColor: "#EAF7F0",
        fields: [
            optionalField("educationLevel", "अभी की पढ़ाई (वैकल्पिक)", "जैसे: 12वीं, B.Tech, UPSC की तैयारी"),
            optionalField("subject", "विषय या परीक्षा (वैकल्पिक)", "जैसे: गणित, NEET, CA"),
            questionField("पढ़ाई से जुड़ा सवाल", "किस विषय, परीक्षा या सीखने के लक्ष्य पर सलाह चाहिए?")
        ]
    },
    {
        id: "finance",
        title: "Business & Finance",
        endpoint: "analyze-finance",
        iconKey: "wallet",
        backgroundColor: "#F2EDFF",
        fields: [
            optionalField("incomeSource", "आमदनी का स्रोत (वैकल्पिक)", "जैसे: नौकरी, दुकान, फ्रीलांस"),
            optionalField("financialGoal", "आर्थिक लक्ष्य (वैकल्पिक)", "जैसे: घर खरीदना, कर्ज़ चुकाना, बचत"),
            questionField("व्यवसाय या पैसों का सवाल", "काम, व्यवसाय, निवेश या आर्थिक निर्णय पर अपना सवाल लिखें।")
        ]
    },
    {
        id: "love",
        title: "Love Life",
        endpoint: "analyze-love",
        iconKey: "heart",
        backgroundColor: "#FFF0F4",
        fields: [
            optionalField("relationshipStatus", "रिश्ते की स्थिति (वैकल्पिक)", "जैसे: सिंगल, रिलेशनशिप में, शादीशुदा, ब्रेकअप"),
            optionalField("partnerName", "पार्टनर का नाम (अगर हो)", "नहीं है तो खाली छोड़ें"),
            optionalField("partnerDateOfBirth", "पार्टनर की जन्म तिथि (अगर पता हो)", "YYYY-MM-DD"),
            questionField("प्रेम जीवन का सवाल", "रिश्ते या प्रेम जीवन के बारे में क्या जानना चाहते हैं?")
        ]
    },
    {
        id: "matching",
        title: "Compatibility",
        endpoint: "analyze-matching",
        iconKey: "users-round",
        backgroundColor: "#E9F7F8",
        fields: [
            optionalField("userName", "आपका नाम (वैकल्पिक)"),
            optionalField("dateOfBirth", "आपकी जन्म तिथि (वैकल्पिक)", "YYYY-MM-DD"),
            optionalField("partnerName", "दूसरे व्यक्ति का नाम (वैकल्पिक)"),
            optionalField("partnerDateOfBirth", "दूसरे व्यक्ति की जन्म तिथि (अगर पता हो)", "YYYY-MM-DD"),
            questionField("अनुकूलता का सवाल", "किन दो लोगों या रिश्ते की अनुकूलता समझना चाहते हैं? जन्म-विवरण सवाल में जोड़ सकते हैं।")
        ]
    },
    {
        id: "mental-health",
        title: "Wellbeing",
        endpoint: "analyze-mental-health",
        iconKey: "brain",
        backgroundColor: "#F1F2FA",
        fields: [
            optionalField("mood", "अभी मन कैसा है (वैकल्पिक)", "जैसे: चिंतित, उदास, बेचैन, शांत"),
            questionField("मन और संतुलन का सवाल", "अपनी स्थिति या सवाल साझा करें। यह मानसिक स्वास्थ्य विशेषज्ञ की सलाह का विकल्प नहीं है।")
        ]
    },
    {
        id: "astrology",
        title: "Ask Astrology",
        endpoint: "analyze-astrology",
        iconKey: "sparkles",
        backgroundColor: "#FFF5E8",
        fields: [
            optionalField("dateOfBirth", "जन्म तिथि (वैकल्पिक)", "YYYY-MM-DD"),
            optionalField("timeOfBirth", "जन्म समय (वैकल्पिक)", "HH:mm"),
            optionalField("placeOfBirth", "जन्म स्थान (वैकल्पिक)"),
            questionField("ज्योतिषीय सवाल", "अपना सवाल लिखें। चाहें तो जन्म-विवरण भी शामिल करें।")
        ]
    }
];