// Controller.js
const axios = require('axios');
const runs = require('./Model.js');

async function getCharRuns(characterName) {
    try {
        const response = await axios.get('https://raider.io/api/v1/characters/profile', {
            params: {
                region: 'eu',
                realm: 'elune',
                name: characterName,
                fields: 'mythic_plus_recent_runs',
            },
        });
        const recentRuns = response.data.mythic_plus_recent_runs;
        for (const run in recentRuns) {
            runs.setData(run);
        }
    } catch (error) {
        console.error('Error fetching runs for ', characterName, ' :', error);
        throw error; // Rethrow the error to handle it in the caller
    }
}

module.exports = {
    getCharRuns
};

/*
async function getRunsDetails() {
    // Fetch additional data for each run
    const detailedRuns = await Promise.all(runs.map(async run => {
        const urlParts = run.url.split('/');
        const idWithSuffix = urlParts[urlParts.length - 1]; // The ID with suffix is the last part of the URL
        const id = idWithSuffix.split('-')[0]; // Split by '-' and get the first part to get the actual ID
        const response = await axios.get('https://raider.io/api/v1/mythic-plus/run-details', {
            params: {
                season: 'season-df-3',
                id: id,
            },
        });

        // Find the character in the roster that matches one of the character names
        const character = response.data.roster.find(member => characterNames.includes(member.character.name));

        // Add the character's spec to the run object
        run.spec = character ? character.character.spec.name : 'N/A';

        // Find the week range for the "completed_at" date
        const completedAt = new Date(response.data.completed_at);
        const weekRange = weekRanges.find(range => completedAt >= range.start && completedAt < range.end);
        run.week = weekRange ? weekRange.week : 'N/A';

        // Include the id in the returned object
        return { ...run, id: id, details: response.data };
    }));
}
}*/