// Controller.js
const axios = require('axios');
const runs = require('./Model.js');
const utils = require('./utils.js');
const { recaptchaenterprise } = require('googleapis/build/src/apis/recaptchaenterprise/index.js');

async function getCharRuns(characterName, existingIds) {
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
        console.log(`${recentRuns.length} runs found for ${characterName}.`);
        for (let i = 0; i < recentRuns.length; i++) {
            const run = recentRuns[i];
            const runId = utils.extractRunId(run.url);

            if (existingIds.includes(runId)) {
                console.log(`Run ${runId} for ${characterName} already exists in the sheet... Skipping`);
                recentRuns.splice(i, 1);
                i--;
            }
            else {
                const runDetails = await getRunsDetails(runId);
                runs.setData(run, runDetails, characterName, runId);
            }
        }
    } catch (error) {
        console.error('Error fetching runs for ', characterName, ' :', error);
    }
}



async function getRunsDetails(id) {
    try {
        const response = await axios.get('https://raider.io/api/v1/mythic-plus/run-details', {
            params: {
                season: 'season-df-4',
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
