// import modules
require('prototype.creep');
require('prototype.spawn');

const towers = require('structure.towers');

module.exports.loop = function() {

    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] === undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }

    // for each creep
    for (let name in Game.creeps) {
        // run creep logic
        Game.creeps[name].runRole();
    }

    // for each room
    //for(let room in Game.rooms)
        towers.defendMyRoom(HOME);

    // for each spawn
    for (let spawnName in Game.spawns) {
        // run spawn logic
        Game.spawns[spawnName].spawnCreepsIfNecessary();
        if (Game.spawns[spawnName].spawning) {
            let spawningCreep = Game.creeps[Game.spawns[spawnName].spawning.name];
            Game.spawns[spawnName].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns[spawnName].pos.x + 1,
                Game.spawns[spawnName].pos.y,
                {align: 'left', opacity: 0.8});
        }
    }
};