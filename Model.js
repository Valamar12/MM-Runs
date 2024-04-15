const { tagmanager } = require("googleapis/build/src/apis/tagmanager");

// Model.js
class RunModel {
    constructor() {
        this.data = [];
    }

    setData(run, runDetails, characterName, id) {
        const recentRun = {
            characterName: characterName,
            characterSpec: runDetails.roster.find(character => character.character.name.toLowerCase() === characterName.toLowerCase()).spec,
            runId: id,
            dungeon: run.short_name,
            level: run.mythic_level,
            affix1: run.affixes[0].name,
            affix2: run.affixes[1].name,
            affix3: run.affixes[2].name,
            date: run.completed_at,
            numChests: runDetails.num_chests,
            player1: runDetails.roster[0].character,
            player2: runDetails.roster[1].character,
            player3: runDetails.roster[2].character,
            player4: runDetails.roster[3].character,
            //player5: runDetails.roster[4].character,
        };
        // Append the recent run to the data array
        this.data.push(recentRun);
    }

    extractRunId(url) {
        const parts = url.split('/');
        return parts[parts.length - 1].split('-')[0];
    }

    getData() {
        return this.data;
    }
}

module.exports = new RunModel(); // Export an instance of the class

