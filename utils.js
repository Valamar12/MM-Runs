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
            return '+1';
        case 2:
            return '+2';
        case 3:
            return '+3';
        default:
            return 'depleted';
    }
}

module.exports = {
    extractRunId,
    formatDate,
    convertNumChests,
};
