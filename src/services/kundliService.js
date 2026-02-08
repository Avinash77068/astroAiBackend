const { getAiChatResponse } = require('../middleware/AiChatResponse');

// Helper functions for basic astrology calculations
const getSunSign = (dateOfBirth) => {
    const [year, month, day] = dateOfBirth.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfYear = Math.floor((date - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24));
    // Approximate sun sign based on day of year
    const signs = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'];
    const startDays = [1, 20, 50, 80, 110, 141, 172, 204, 235, 266, 296, 326];
    for (let i = startDays.length - 1; i >= 0; i--) {
        if (dayOfYear >= startDays[i]) return signs[i];
    }
    return 'Capricorn';
};

const getMoonSign = (dateOfBirth, timeOfBirth) => {
    // Simplified moon sign calculation (moon moves ~12-13 degrees per day)
    const [year, month, day] = dateOfBirth.split('-').map(Number);
    const [hour, minute] = timeOfBirth.split(':').map(Number);
    const baseDate = new Date(2000, 0, 1); // Reference date
    const birthDate = new Date(year, month - 1, day, hour, minute);
    const daysDiff = (birthDate - baseDate) / (1000 * 60 * 60 * 24);
    const moonPosition = (daysDiff * 13) % 360; // Approximate 13 degrees per day
    const signIndex = Math.floor(moonPosition / 30);
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[signIndex];
};

const getAscendant = (dateOfBirth, timeOfBirth, placeOfBirth) => {
    // Very simplified ascendant calculation (based on time and place)
    const [hour] = timeOfBirth.split(':').map(Number);
    // Assume Delhi timezone +5.5, rough calculation
    const adjustedHour = (hour + 5.5) % 24;
    const signIndex = Math.floor((adjustedHour / 2) % 12);
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[signIndex];
};

const generateKundliReport = async (input, userDetails) => {
    const { dateOfBirth, timeOfBirth, placeOfBirth } = input;

    // Calculate basic chart elements
    const sunSign = getSunSign(dateOfBirth);
    const moonSign = getMoonSign(dateOfBirth, timeOfBirth);
    const ascendant = getAscendant(dateOfBirth, timeOfBirth, placeOfBirth);

    // Format chart data
    const chartData = `Birth Chart: Ascendant in ${ascendant}, Sun in ${sunSign}, Moon in ${moonSign}. (Simplified calculation for demo)`;

    // Use AI to interpret the chart
    const prompt = `Interpret this Vedic birth chart: ${chartData} Provide a detailed analysis.`;
    const aiResponse = await getAiChatResponse(prompt, [], userDetails);

    return aiResponse;
};

module.exports = { generateKundliReport };
