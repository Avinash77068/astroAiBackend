const Astronomy = require("astronomy-engine");

// Zodiac Signs
const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// 27 Nakshatras
const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

// Lahiri Ayanamsha (approx 24° for modern era)
function applyAyanamsha(tropicalLongitude) {
    const lahiriOffset = 24;
    return (tropicalLongitude - lahiriOffset + 360) % 360;
}

function getZodiac(longitude) {
    return zodiacSigns[Math.floor(longitude / 30)];
}

function getNakshatra(longitude) {
    return nakshatras[Math.floor(longitude / (360 / 27))];
}

// Get Tropical Longitude
function normalizeTimeOfBirth(timeOfBirth) {
    if (!timeOfBirth) return '12:00';

    const value = String(timeOfBirth).trim();
    if (!value) return '12:00';

    if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(value)) {
        const [hours, minutes] = value.split(':');
        return `${String(parseInt(hours, 10)).padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    const match = value.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
    if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const modifier = match[3].toUpperCase();

        if (modifier === 'AM' && hours === 12) hours = 0;
        if (modifier === 'PM' && hours !== 12) hours += 12;

        return `${String(hours).padStart(2, '0')}:${minutes}`;
    }

    throw new Error(`Invalid timeOfBirth format: ${timeOfBirth}`);
}

function buildAstroDate(dateOfBirth, timeOfBirth) {
    if (dateOfBirth instanceof Date && !Number.isNaN(dateOfBirth.getTime())) {
        return dateOfBirth;
    }

    if (typeof dateOfBirth === 'number' && Number.isFinite(dateOfBirth)) {
        return new Date(dateOfBirth);
    }

    if (!dateOfBirth) {
        throw new Error('dateOfBirth is required');
    }

    const cleanDate = String(dateOfBirth).trim();
    const normalizedTime = normalizeTimeOfBirth(timeOfBirth);

    const candidates = [
        `${cleanDate}T${normalizedTime}:00`,
        `${cleanDate} ${normalizedTime}:00`,
        `${cleanDate}T${normalizedTime}`,
        cleanDate,
    ];

    for (const value of candidates) {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    const ddmmyyyy = cleanDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        const parsed = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${normalizedTime}:00`);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    throw new Error(`Invalid dateOfBirth format: ${dateOfBirth}`);
}

function getPlanetLongitude(date, body) {
    const time = new Astronomy.AstroTime(date);
    
    // For Moon, use special function
    if (body === Astronomy.Body.Moon) {
        const ecliptic = Astronomy.EclipticGeoMoon(time);
        return ecliptic.lon;
    }
    
    // For other bodies, use GeoVector
    const vector = Astronomy.GeoVector(body, time, true);
    const ecliptic = Astronomy.Ecliptic(vector);
    return ecliptic.elon;
}

async function generateKundliReport({ dateOfBirth, timeOfBirth }) {
    const date = buildAstroDate(dateOfBirth, timeOfBirth);

    const bodies = {
        Sun: Astronomy.Body.Sun,
        Moon: Astronomy.Body.Moon,
        Mercury: Astronomy.Body.Mercury,
        Venus: Astronomy.Body.Venus,
        Mars: Astronomy.Body.Mars,
        Jupiter: Astronomy.Body.Jupiter,
        Saturn: Astronomy.Body.Saturn
    };

    const result = {};

    for (const [name, body] of Object.entries(bodies)) {
        const tropical = getPlanetLongitude(date, body);
        const sidereal = applyAyanamsha(tropical);

        result[name] = {
            longitude: sidereal.toFixed(2),
            sign: getZodiac(sidereal),
            nakshatra: getNakshatra(sidereal)
        };
    }

    // Rahu (Mean Node Approximation) - using Moon's node
    const time = new Astronomy.AstroTime(date);
    
    // Get Moon's ecliptic longitude
    const moonEcliptic = Astronomy.EclipticGeoMoon(time);
    const moonLon = moonEcliptic.lon;
    
    // Get Sun's ecliptic longitude
    const sunVector = Astronomy.GeoVector(Astronomy.Body.Sun, time, true);
    const sunEcliptic = Astronomy.Ecliptic(sunVector);
    const sunLon = sunEcliptic.elon;
    
    // Rahu is approximately 180° from the Sun-Moon midpoint (simplified calculation)
    // More accurate: use the Moon's ascending node
    const rahuTropical = (moonLon + 180) % 360;
    const rahuSidereal = applyAyanamsha(rahuTropical);

    result["Rahu"] = {
        longitude: rahuSidereal.toFixed(2),
        sign: getZodiac(rahuSidereal),
        nakshatra: getNakshatra(rahuSidereal)
    };

    const ketuLongitude = (rahuSidereal + 180) % 360;

    result["Ketu"] = {
        longitude: ketuLongitude.toFixed(2),
        sign: getZodiac(ketuLongitude),
        nakshatra: getNakshatra(ketuLongitude)
    };

    return result;
}

module.exports = { generateKundliReport };
