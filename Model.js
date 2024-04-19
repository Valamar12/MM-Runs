const utils = require('./utils.js');

// Model.js
class RunModel {
    constructor() {
        this.data = [];
    }

    setData(run, runDetails, characterName, id) {
        const tank = runDetails.roster.find(character => character.role === 'tank');
        const tankSpec = tank && tank.character && tank.character.class && tank.character.spec
            ? utils.convertSpecDoublons(tank.character.class.name, tank.character.spec.name)
            : 'Unknown';
        const healer = runDetails.roster.find(character => character.role === 'healer');
        const healerSpec = healer && healer.character && healer.character.class && healer.character.spec
            ? utils.convertSpecDoublons(healer.character.class.name, healer.character.spec.name)
            : 'Unknown';
        const dps = runDetails.roster.filter(character => character.role === 'dps');
        const dps1Spec = utils.convertSpecDoublons(dps[0].character.class.name, dps[0].character.spec.name) || 'Unknown'
        const dps2Spec = utils.convertSpecDoublons(dps[1].character.class.name, dps[1].character.spec.name) || 'Unknown'
        const dps3Spec = utils.convertSpecDoublons(dps[2].character.class.name, dps[2].character.spec.name) || 'Unknown'
        const upperCaseCharName = characterName.charAt(0).toUpperCase() + characterName.slice(1);
        const mychar = runDetails.roster.find(character => character.character.name === upperCaseCharName);
        const mycharSpec = mychar.character.spec ? mychar.character.spec.name : 'Unknown';


        const recentRun = {
            characterName: upperCaseCharName,
            characterSpec: mycharSpec,
            runId: id,
            dungeon: run.short_name,
            level: run.mythic_level,
            week: utils.assignRunToWeek(run.completed_at),
            date: run.completed_at,
            numChests: runDetails.num_chests,
            tank: tankSpec || 'Unknown',
            healer: healerSpec || 'Unknown',
            dps1: dps1Spec || 'Unknown',
            dps2: dps2Spec || 'Unknown',
            dps3: dps3Spec || 'Unknown',
        };
        // Append the recent run to the data array
        this.data.push(recentRun);
    }

    getData() {
        return this.data;
    }
}

module.exports = new RunModel(); // Export an instance of the class

