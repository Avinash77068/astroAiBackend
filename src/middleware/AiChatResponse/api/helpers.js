const buildUserContext = (userDetails) => {
    if (!userDetails) return '';

    const details = [
        userDetails.name && `name: ${userDetails.name}`,
        userDetails.dateOfBirth && `birth date: ${userDetails.dateOfBirth}`,
        userDetails.place && `birth place: ${userDetails.place}`,
        userDetails.gender && `gender: ${userDetails.gender}`
    ].filter(Boolean);

    return details.length
        ? `\nRelevant client details, if useful: ${details.join('; ')}.`
        : '';
};

module.exports = { buildUserContext };
