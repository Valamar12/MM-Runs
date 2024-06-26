const { google } = require('googleapis');
const runModel = require('./Model.js');
const controller = require('./Controller.js');
const utils = require('./utils.js');
require('dotenv').config();

const characterNamesString = process.env.CHARACTER_NAMES || ''; // Retrieve the string representation of the array
const characterNames = characterNamesString.split(','); // Convert the string to an array using split(',')
processCharacterRuns(characterNames)

async function processCharacterRuns(characterNames) {
    let existingIds = await getExistingRunsID();
    for (const characterName of characterNames) {
        await controller.getCharRuns(characterName, existingIds);
        const runData = runModel.getData(); // Retrieve the data from the model
        const values = runData.map(runModel => {
            return [
                '', // Empty cell for column A
                utils.formatDate(runModel.date), // Date for column B
                utils.convertNumChests(runModel.numChests), // Result for column C (assuming you have a function to convert numChests)
                runModel.characterName, // Character for column D
                runModel.characterSpec, // Spec for column E
                runModel.dungeon, // Dungeon abbreviated name for column F
                runModel.level, // Dungeon level for column G
                runModel.tank, // Tank spec for column F
                runModel.healer, // Healer spec for column G
                runModel.dps1, // DPS specs for columns H, I, J
                runModel.dps2,
                runModel.dps3,
                '', // Placeholder for additional fields
                runModel.runId,
                runModel.week,
                // Add more fields as needed
            ];
        });
        await writeToSheet(values, existingIds); // Call the writeToSheet function with the values array
    };
}

async function connectToSheet() {
    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.KEYFILE, // Replace with path to your service account file
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
}

async function getExistingRunsID() {
    // Fetch IDs for runs already the sheet
    googleSheets = await connectToSheet();
    const idResponse = await googleSheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID, // Replace with your spreadsheet ID
        range: `${process.env.TAB_NAME}!N:N`, // Update based on your needs
    });
    const existingIds = idResponse.data.values ? idResponse.data.values.flat() : [];
    return existingIds;
}

function getLastFilledRow(resp, startRow, endRow) {
    for (let i = startRow - 1; i < endRow; i++) {
        // Check if any cell in the current row is not empty
        if (resp.data.values[i].some(cellValue => cellValue !== "")) {
            return lastFilledRow = i + 3; // Update lastFilledRow based on zero-based indexing
        }
    }
}


async function writeToSheet(values, existingIds) {
    for (const data of values) {
        if (existingIds.includes(data[data.length - 2])) {
            continue;
        }
        else {
            googleSheets = await connectToSheet();
            const resp = await googleSheets.spreadsheets.values.get({
                spreadsheetId: process.env.SPREADSHEET_ID, // Replace with your spreadsheet ID
                range: `${process.env.TAB_NAME}!A:E`, // Update based on your needs
            });// Assuming the last element is runModel.id
            const weekNumber1 = parseInt(data[data.length - 1]);
            const weekNumber2 = weekNumber1 + 1;
            currentWeekRow = resp.data.values.findIndex(row => row.includes("Week " + weekNumber1));
            currentWeekRow = parseInt(currentWeekRow) + 1;
            // Find the index of the next "Week" row by starting the search from the currentWeekRow + 1
            nextWeekRow = resp.data.values.findIndex(row => row.includes("Week " + weekNumber2));
            var lastFilledRow = getLastFilledRow(resp, currentWeekRow, nextWeekRow);
            await googleSheets.spreadsheets.values.append({
                spreadsheetId: process.env.SPREADSHEET_ID,
                range: `${process.env.TAB_NAME}!A${lastFilledRow}`,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [data],
                },
            });
            existingIds.push(data[data.length - 2])
            console.log(`runModel ${data[data.length - 2]} for ${data[data.length - 12]} added to the sheet.`)
        }
    }
}