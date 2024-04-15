const axios = require('axios');
const { google } = require('googleapis');
const run = require('./Model.js');
const controller = require('./Controller.js');
const utils = require('./utils.js');
require('dotenv').config();


controller.getCharRuns('nialo').then(() => {
    console.log(run.getData()[2]);
});

// Define the character names
const characterNames = ['nialo', 'nialomd', 'nialodrd', 'ethernialo', 'nialodormu', 'nialofist', 'nialopal', 'nialoded', 'nialoshot', 'nialowr', 'nialosham', 'ashatara']; // Replace 'character2', 'character3', etc. with your actual character names


// Authenticate with Google Sheets API
const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/Nialoshaar/Desktop/Git/MM-Runs/mm-runs-53edb4f66eb4.json', // Replace with path to your service account file
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const googleSheets = google.sheets({ version: 'v4', auth: client });


// Fetch existing IDs from the sheet
const idResponse = await googleSheets.spreadsheets.values.get({
    spreadsheetId: '16EydzkYMnzvhC7Ddyl9yojYF8Zk88fW71bc_DtR_Li8', // Replace with your spreadsheet ID
    range: 'DFS3!N:N', // Update based on your needs
});

// Convert the response to a flat array of IDs
const existingIds = idResponse.data.values ? idResponse.data.values.flat() : [];

// Filter out runs that are already in the sheet
const newRuns = detailedRuns.filter(run => {
    const id = utils.extractRunId(run.url);
    return !existingIds.includes(id);
});

// Format data for Google Sheets
const values = detailedRuns.map(run => {
    // Extract the characters
    const tankCharacter = run.character.find(character => character.character.role === 'tank');
    const healCharacter = run.character.find(character => character.character.role === 'healer');
    const dpsCharacter = run.character.filter(character => character.role === 'dps');

    return {
        runData: [
            '', // Empty cell for column A
            formattedDate, // Date for column B
            status, // Result for column C
            characterName.charAt(0).toUpperCase() + characterName.slice(1), // Character for column D
            spec, // Spec for column E
            run.short_name, // Dungeon abbreviated name for column F
            run.mythic_level, // Dungeon level for column G
            tankCharacter.spec, // Tank spec for column F
            healCharacter.spec, // Healer spec for column G
            dpsCharacter[0], // DPS specs for columns H, I, J
            dpsCharacter[1],
            dpsCharacter[2],
            '',
            run.id,
            // Add more fields as needed
        ],
    };
});

// get ids from the sheet
const resp = await googleSheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'DFS3!A1:Z',
});
// write data to the sheet if id is not found
for (const data of values) {
    if (!existingIds.includes(data[data.length - 1])) { // Assuming the last element is run.id
        await googleSheets.spreadsheets.values.append({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: `DFS3!A${startRow + index}`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [data],
            },
        });
    }
}
