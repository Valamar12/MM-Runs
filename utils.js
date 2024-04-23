//utils.js
function extractRunId(url) {
    const parts = url.split('/');
    return parts[parts.length - 1].split('-')[0];
}

function formatDate(date) {
    // Extract the date part from run.completed_at
    const datePart = date.split('T')[0];

    // Split the date into its components
    const [year, month, day] = datePart.split('-');

    // Format the date in the MM/DD/YYYY format
    const formattedDate = `'${month}/${day}/${year}`;
    return formattedDate
}

function convertNumChests(numChests) {
    switch (numChests) {
        case 1:
            return "'+1";
        case 2:
            return "'+2";
        case 3:
            return "'+3";
        default:
            return 'Depleted';
    }
}

function assignRunToWeek(dateString) {
    // Define the start date and time of the first week
    const startDate = new Date('2024-04-23T06:00:00Z'); // Wednesday, November 14, 2023, 6:00 AM GMT+2

    // Convert the provided date string to a Date object
    const date = new Date(dateString);

    // Calculate the number of milliseconds since the start date
    const millisecondsSinceStart = date - startDate;

    // Calculate the number of weeks since the start date
    const weeksSinceStart = Math.floor(millisecondsSinceStart / (1000 * 60 * 60 * 24 * 7));

    // Calculate the week number based on the number of weeks since the start date
    const weekNumber = (weeksSinceStart % 10) + 1;

    return weekNumber;
}

function convertSpecDoublons(className, spec) {
    const nameMapping = {
        'Death Knight': { 'Frost': 'FrostDK' },
        'Paladin': { 'Holy': 'Hpal' },
        'Warrior': { 'Protection': 'ProtW' },
        'Druid': { 'Restoration': 'Rdrood' },
        'Shaman': { 'Restoration': 'Rsham' }
    };

    // Check if the provided class and spec combination exists in the nameMapping
    if (nameMapping[className] && nameMapping[className][spec]) {
        return nameMapping[className][spec]; // Return the mapped spec name
    } else {
        return spec; // Return the initial spec name
    }
}

module.exports = {
    extractRunId,
    formatDate,
    convertNumChests,
    assignRunToWeek,
    convertSpecDoublons,
};
