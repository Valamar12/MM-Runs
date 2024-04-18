const utils = require('./utils.js');

// Model.js
class RunModel {
    constructor() {
        this.data = [];
    }

    setData(run, runDetails, characterName, id) {
        const tank = runDetails.roster.find(character => character.role === 'tank');
        const healer = runDetails.roster.find(character => character.role === 'healer');
        const dps = runDetails.roster.filter(character => character.role === 'dps');
        const upperCaseCharName = characterName.charAt(0).toUpperCase() + characterName.slice(1);
        const mychar = runDetails.roster.find(character => character.character.name === upperCaseCharName);
        const mycharSpec = mychar.character.spec ? mychar.character.spec.name : 'Unknown';


        const recentRun = {
            characterName: upperCaseCharName,
            characterSpec: mycharSpec,
            runId: id,
            dungeon: run.short_name,
            level: run.mythic_level,
            affix1: run.affixes[0].name,
            affix2: run.affixes[1].name,
            affix3: run.affixes[2].name,
            week: utils.assignRunToWeek(run.completed_at),
            date: run.completed_at,
            numChests: runDetails.num_chests,
            tank: tank ? tank.character.spec.name : 'Unknown',
            healer: healer ? healer.character.spec.name : 'Unknown',
            dps1: dps.length > 0 ? dps[0].character.spec.name : 'Unknown',
            dps2: dps.length > 1 ? dps[1].character.spec.name : 'Unknown',
            dps3: dps.length > 2 ? dps[2].character.spec.name : 'Unknown',
        };
        // Append the recent run to the data array
        this.data.push(recentRun);
    }

    getData() {
        return this.data;
    }
}

module.exports = new RunModel(); // Export an instance of the class

