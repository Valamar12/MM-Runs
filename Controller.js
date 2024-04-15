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
        for (const run of recentRuns) {
            runs.setData(run, characterName);
        }
    } catch (error) {
        console.error('Error fetching runs for ', characterName, ' :', error);
        throw error; // Rethrow the error to handle it in the caller
    }
}

async function getRunsDetails(id) {
    try {
        const response = await axios.get('https://raider.io/api/v1/mythic-plus/run-details', {
            params: {
                season: 'season-df-3',
                id: id,
            },
        });
        const runDetails = response.data.run_details;
        console.log(runDetails);
        //runs.setData(runDetails);
    } catch (error) {
        console.error('Error fetching runs details :', error);
        throw error; // Rethrow the error to handle it in the caller
    }
}

module.exports = {
    getCharRuns,
    getRunsDetails,
};
