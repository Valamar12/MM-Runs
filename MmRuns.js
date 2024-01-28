const axios = require('axios');
const { google } = require('googleapis');

// Define the character names
const characterNames = ['nialo', 'nialomd', 'nialodrd', 'ethernialo', 'nialodormu', 'nialofist', 'nialopal', 'nialoded', 'nialoshot', 'nialowr', 'nialosham', 'ashatara']; // Replace 'character2', 'character3', etc. with your actual character names

// Define an async function
async function fetchAndWriteData(characterName) {
    // Fetch data from the first Raider.io API
    const response = await axios.get('https://raider.io/api/v1/characters/profile', {
        params: {
            region: 'eu',
            realm: 'elune',
            name: characterName,
            fields: 'mythic_plus_recent_runs',
        },
    });
    const runs = response.data.mythic_plus_recent_runs;

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

        // Include the id in the returned object
        return { ...run, id: id, details: response.data };
    }));

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
        const urlParts = run.url.split('/');
        const idWithSuffix = urlParts[urlParts.length - 1]; // The ID with suffix is the last part of the URL
        const id = idWithSuffix.split('-')[0]; // Split by '-' and get the first part to get the actual ID

        return !existingIds.includes(id);
    });

    // Format data for Google Sheets
    const values = detailedRuns.map(run => {
        // Find the character in the roster
        const character = run.details.roster.find(character => character.character.name.toLowerCase() === characterName.toLowerCase());

        // If the character was found, use its spec, otherwise use a default value
        const specName = character ? character.character.spec.name : 'N/A';
        const className = character ? character.character.class.name : 'N/A';

        // Create a mapping of class and spec names to the names you want to use
        const nameMapping = {
            'Death Knight': { 'Frost': 'FrostDK' },
            'Paladin': { 'Holy': 'Hpal' },
            'Warrior': { 'Protection': 'ProtW' },
            'Druid': { 'Restoration': 'Rdrood' },
            'Shaman': { 'Restoration': 'Rsham' }
        };

        // Get the name you want to use based on the class and spec
        const spec = nameMapping[className] && nameMapping[className][specName] ? nameMapping[className][specName] : specName;

        // Sort the roster based on the role
        const sortedRoster = run.details.roster.sort((a, b) => {
            const roleOrder = ['tank', 'heal', 'dps'];
            return roleOrder.indexOf(a.character.spec.role) - roleOrder.indexOf(b.character.spec.role);
        });

        // Extract the characters
        const tankCharacter = sortedRoster.find(character => character.character.spec.role === 'tank');
        const healCharacter = sortedRoster.find(character => character.character.spec.role === 'healer');
        const dpsCharacters = sortedRoster.filter(character => character.character.spec.role === 'dps');

        // Get the spec names
        const tankSpec = tankCharacter ? (nameMapping[tankCharacter.character.class.name] && nameMapping[tankCharacter.character.class.name][tankCharacter.character.spec.name] ? nameMapping[tankCharacter.character.class.name][tankCharacter.character.spec.name] : tankCharacter.character.spec.name) : 'N/A';
        const healSpec = healCharacter ? (nameMapping[healCharacter.character.class.name] && nameMapping[healCharacter.character.class.name][healCharacter.character.spec.name] ? nameMapping[healCharacter.character.class.name][healCharacter.character.spec.name] : healCharacter.character.spec.name) : 'N/A';
        const dpsSpecs = dpsCharacters.length > 0 ? dpsCharacters.map(character => nameMapping[character.character.class.name] && nameMapping[character.character.class.name][character.character.spec.name] ? nameMapping[character.character.class.name][character.character.spec.name] : character.character.spec.name) : ['N/A', 'N/A', 'N/A'];


        // Extract the date part from run.completed_at
        const datePart = run.completed_at.split('T')[0];

        // Split the date into its components
        const [year, month, day] = datePart.split('-');

        // Format the date in the MM/DD/YYYY format
        const formattedDate = `'${month}/${day}/${year}`;

        const num_chests = run.details.num_chests;
        const status = num_chests === 3 ? "'+3" : num_chests === 2 ? "'+2" : num_chests === 1 ? "'+1" : 'deplete';

        return [
            '', // Empty cell for column A
            formattedDate, // Date for column B
            status, // Result for column C
            characterName.charAt(0).toUpperCase() + characterName.slice(1), // Character for column D
            spec, // Spec for column E
            run.short_name, // Dungeon abbreviated name for column F
            run.mythic_level, // Dungeon level for column G
            tankSpec, // Tank spec for column F
            healSpec, // Healer spec for column G
            ...dpsSpecs, // DPS specs for columns H, I, J
            '',
            run.id,
            // Add more fields as needed
        ];
    });

    // Write data to the sheet
    const resp = await googleSheets.spreadsheets.values.get({
        spreadsheetId: '16EydzkYMnzvhC7Ddyl9yojYF8Zk88fW71bc_DtR_Li8', // Replace with your spreadsheet ID
        range: 'DFS3!A:E', // Update based on your needs
    });

    const numRows = resp.data.values ? resp.data.values.length : 0;
    const startRow = numRows + 1; // Add 1 because spreadsheet rows are 1-indexed

    for (const data of values) {
        if (!existingIds.includes(data[data.length - 1])) { // Assuming the last element is run.id
            await googleSheets.spreadsheets.values.append({
                spreadsheetId: '16EydzkYMnzvhC7Ddyl9yojYF8Zk88fW71bc_DtR_Li8',
                range: `DFS3!A${startRow}`,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [data],
                },
            });
        }
    }
}
// Loop over the character names
for (const characterName of characterNames) {
    // Call the async function
    fetchAndWriteData(characterName).catch(console.error);
}