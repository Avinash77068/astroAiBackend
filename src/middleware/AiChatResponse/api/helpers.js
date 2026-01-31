const buildUserContext = (userDetails) => {
    if (!userDetails) return '';

    return `\n\nUser Information:
- Name: ${userDetails?.name}
- Date of Birth: ${userDetails?.dateOfBirth}
- Place of Birth: ${userDetails?.place}
- Gender: ${userDetails?.gender}
- Phone: ${userDetails?.phoneNumber}

Use this information to provide personalized astrological insights based on their birth details.`;
};

module.exports = { buildUserContext };
