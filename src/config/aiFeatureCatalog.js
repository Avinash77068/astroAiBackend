const questionField = (label, placeholder) => ({
    name: "question",
    label,
    placeholder,
    multiline: true,
    required: true
});

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
            questionField("ज्योतिषीय सवाल", "अपना सवाल लिखें। चाहें तो जन्म-विवरण भी शामिल करें।")
        ]
    }
];