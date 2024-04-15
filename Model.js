// Model.js
class RunModel {
    constructor() {
        this.data = [];
    }

    setData(run, characterName) {
        const recentRun = {
            characterName: characterName,
            runId: this.extractRunId(run.url),
            dungeon: run.short_name,
            level: run.mythic_level,
            affix1: run.affixes[0].name,
            affix2: run.affixes[1].name,
            affix3: run.affixes[2].name,
            date: run.completed_at,
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

