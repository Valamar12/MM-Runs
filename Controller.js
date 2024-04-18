// Controller.js
const axios = require('axios');
const runs = require('./Model.js');
const utils = require('./utils.js');

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
        if (recentRuns.length === 0) {
            console.log(`No recent runs found for ${characterName}.`);
            return;
        }
        for (const run of recentRuns) {
            const runId = utils.extractRunId(run.url);
            const runDetails = await getRunsDetails(runId);
            runs.setData(run, runDetails, characterName, runId);
        }
    } catch (error) {
        console.error('Error fetching runs for ', characterName, ' :', error);
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
        const runDetails = response.data;
        return runDetails;
    } catch (error) {
        console.error('Error fetching runs details for id=', id, ':', error);
    }
}


module.exports = {
    getCharRuns,
};
