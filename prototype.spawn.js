const listOfRoles = ['harvester', 'lorry', 'claimer', 'upgrader', 'repairer', 'builder', 'wallRepairer'];

const HOME_FIRST = 'E28N36';
const HOME_SECOND = 'E28N37';

const MIN_NUMBER_OF_CREEPS = {
    upgrader: 2,
    builder: 2,
    repairer: 2,
    wallRepairer: 1,
    lorry: 2,
};

const MIN_NUMBER_OF_LONG_DISTANCE_HARVESTERS = {
    'E29N36': 4,
    'E29N37': 2,
    'E28N37': 0,
    'E27N37': 0,
    'E28N38': 0,
};

const MIN_NUMBER_OF_ATTACKERS = {
    'E29N36': 0,
    'E29N37': 0,
    'E28N37': 0,
    'E27N37': 0,
    'E28N38': 0,
};
// create a new function for StructureSpawn
StructureSpawn.prototype.spawnCreepsIfNecessary =
    function () {


        /** @type {Room} */
        let room = this.room;
        // find all creeps in room
        /** @type {Array.<Creep>} */
        let creepsInRoom = room.find(FIND_MY_CREEPS);

        // count the number of creeps alive for each role in this room
        // _.sum will count the number of properties in Game.creeps filtered by the
        //  arrow function, which checks for the creep being a specific role
        /** @type {Object.<string, number>} */
        let numberOfCreeps = {};
        for (let role of listOfRoles) {
            numberOfCreeps[role] = _.sum(creepsInRoom, (c) => c.memory.role === role);
        }
        let maxEnergy = room.energyCapacityAvailable;
        let name = undefined;


        // if no harvesters are left AND either no miners or no lorries are left
        //  create a backup creep
        if (numberOfCreeps['harvester'] === 0 && numberOfCreeps['lorry'] === 0) {
            // if there are still miners or enough energy in Storage left
            if (numberOfCreeps['miner'] > 0 ||
                (room.storage !== undefined && room.storage.store[RESOURCE_ENERGY] >= 150 + 550)) {
                // create a lorry
                name = this.createLorry(150);
            }
            // if there is no miner and not enough energy in Storage left
            else {
                // create a harvester because it can work on its own
                name = this.createCustomCreep(room.energyAvailable, 'harvester');
            }
        }
        // if no backup creep is required
        else {
            // check if all sources have miners
            let sources = room.find(FIND_SOURCES);
            // iterate over all sources
            for (let source of sources) {
                // if the source has no miner
                if (!_.some(creepsInRoom, c => c.memory.role === 'miner' && c.memory.sourceId === source.id)) {
                    // check whether or not the source has a container
                    /** @type {Array.StructureContainer} */
                    let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType === STRUCTURE_CONTAINER
                    });
                    // if there is a container next to the source
                    if (containers.length > 0) {
                        // spawn a miner
                        name = this.createMiner(source.id);
                        break;
                    }
                }
            }
        }

        // if none of the above caused a spawn command check for other roles
        if (name === undefined) {
            for (let role of listOfRoles) {
                // check for claim order
                if (role === 'claimer' && this.memory.claimRoom !== undefined) {
                    // try to spawn a claimer
                    name = this.createClaimer(this.memory.claimRoom);
                    // if that worked
                    if (name !== undefined && _.isString(name)) {
                        // delete the claim order
                        delete this.memory.claimRoom;
                    }
                    break;
                }
                // if no claim order was found, check other roles
                else if (numberOfCreeps[role] < MIN_NUMBER_OF_CREEPS[role]) {
                    if (role === 'lorry') {
                        name = this.createLorry(maxEnergy);
                    }
                    else {
                        name = this.createCustomCreep(maxEnergy, role);
                    }
                    break;
                }
            }
        }

        // if none of the above caused a spawn command check for Attackers
        /** @type {Object.<string, number>} */
        let numberOfAttackers = {};
        if (name === undefined) {
            // count the number of attackers globally
            for (let roomName in MIN_NUMBER_OF_ATTACKERS) {
                numberOfAttackers[roomName] = _.sum(Game.creeps, (c) =>
                    c.memory.role === 'attacker' && c.memory.target === roomName);

                if (numberOfAttackers[roomName] < MIN_NUMBER_OF_ATTACKERS[roomName]) {
                    name = this.createAttacker(700, 3, room.name, roomName, 0);
                }
            }
        }

        // if none of the above caused a spawn command check for LongDistanceHarvesters
        /** @type {Object.<string, number>} */
        let numberOfLongDistanceHarvesters = {};
        if (name === undefined) {
            // count the number of long distance harvesters globally
            for (let roomName in MIN_NUMBER_OF_LONG_DISTANCE_HARVESTERS) {
                numberOfLongDistanceHarvesters[roomName] = _.sum(Game.creeps, (c) =>
                    c.memory.role === 'longDistanceHarvester' && c.memory.target === roomName);

                if (numberOfLongDistanceHarvesters[roomName] < MIN_NUMBER_OF_LONG_DISTANCE_HARVESTERS[roomName]) {
                    name = this.createLongDistanceHarvester(maxEnergy, 2, room.name, roomName);
                }
            }
        }


        // print name to console if spawning was a success
        if (name !== undefined && _.isString(name)) {
            console.log(this.name + " spawned new creep: " + name + " (" + Game.creeps[name].memory.role + ")");
            for (let role of listOfRoles) {
                console.log(role + ": " + numberOfCreeps[role]);
            }
            for (let roomName in numberOfLongDistanceHarvesters) {
                console.log("LongDistanceHarvester" + roomName + ": " + numberOfLongDistanceHarvesters[roomName]);
            }
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createCustomCreep =
    function (energy, roleName, target) {
        // create a balanced body as big as possible with the given energy
        let numberOfParts = Math.floor(energy / 200);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        let body = [];
        for (let i = 0; i < numberOfParts; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body and the given role
        return this.createCreep(body, roleName + Game.time, {role: roleName, working: false, target: target});
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createLongDistanceHarvester =
    function (energy, numberOfWorkParts, home, target) {
        // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
        let body = [];
        for (let i = 0; i < numberOfWorkParts; i++) {
            body.push(WORK);
        }

        // 150 = 100 (cost of WORK) + 50 (cost of MOVE)
        energy -= 150 * numberOfWorkParts;

        let numberOfParts = Math.floor(energy / 100);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor((50 - numberOfWorkParts * 2) / 2));
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body
        return this.createCreep(body, "longDistanceHarvester" + Game.time, {
            role: 'longDistanceHarvester',
            home: home,
            target: target,
            working: false
        });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createAttacker =
    function (energy, numberOfAttackParts, home, target) {
        // create a body with the specified number of ATTACK parts and one MOVE part per non-MOVE part
        let body = [];
        // 130 = 80 (cost of WORK) + 50 (cost of MOVE)
        energy -= 130 * numberOfAttackParts;

        let numberOfParts = Math.floor(energy / 100);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor((50 - numberOfAttackParts * 2) / 2));
        for (let i = 0; i < numberOfParts; i++) {
            body.push(TOUGH);
        }
        for (let i = 0; i < numberOfAttackParts; i++) {
            body.push(ATTACK);
        }
        for (let i = 0; i < numberOfParts + numberOfAttackParts; i++) {
            body.push(MOVE);
        }

        return this.createCreep(body, "attacker" + Game.time, {role: 'attacker', home: home, target: target});
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createClaimer =
    function (target) {
        return this.createCreep([CLAIM, MOVE], "claimer" + Game.time, {role: 'claimer', target: target});
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createMiner =
    function (sourceId) {
        return this.createCreep([WORK, WORK, WORK, WORK, WORK, MOVE], "miner" + Game.time,
            {role: 'miner', sourceId: sourceId});
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createLorry =
    function (energy) {
        // create a body with twice as many CARRY as MOVE parts
        let numberOfParts = Math.floor(energy / 150);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        let body = [];
        for (let i = 0; i < numberOfParts * 2; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body and the role 'lorry'
        return this.createCreep(body, "lorry" + Game.time, {role: 'lorry', working: false});
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.placeClaimOrder =
    function (roomName) {
        this.memory.claimRoom = roomName;

        console.log('Created Claim Order for Room ' + this.memory.claimRoom);

        return true;
    };


