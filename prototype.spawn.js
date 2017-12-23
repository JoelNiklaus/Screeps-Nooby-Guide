const listOfRoles = ['harvester', 'lorry', 'claimer', 'upgrader', 'repairer', 'builder', 'wallRepairer', 'mineralLorry'];

const MIN_NUMBER_OF_CREEPS = {
    upgrader: 1,
    builder: 1,
    repairer: 1,
    wallRepairer: 1,
    lorry: 2,
    mineralLorry: 1,
};

const MIN_NUMBER_OF_LONG_DISTANCE_HARVESTERS = {
    'E28N36': {
        'E29N36': 6,
        'E29N37': 3,
    },
    'E28N37': {
        'E28N38': 3,
        'E29N37': 3,
    }
};

const MIN_NUMBER_OF_SCAVENGERS = {
    'E28N36': {
        'E27N39': 0,
    },
    'E28N37': {
        'E27N39': 0,
    }
};

const MIN_NUMBER_OF_ATTACKERS = {
    'E28N36': {
        'E28N36': 0,
        'E28N37': 0,
        'E29N36': 0,
        'E29N37': 0,
        'E27N38': 0,
        'E28N38': 0,
        'E29N39': 0,
    },
    'E28N37': {
        'E28N36': 0,
        'E28N37': 0,
        'E29N36': 0,
        'E29N37': 0,
        'E27N38': 0,
        'E28N38': 0,
        'E29N39': 0,
    },
};

const BIGGEST_CREEP_THRESHOLD = 1200;

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
            let containers = room.find(FIND_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_CONTAINER
                    && s.store.energy > 0
            });
            // if there are still miners or enough energy in Storage left or energy in containers left
            if (numberOfCreeps['miner'] > 0 ||
                (room.storage !== undefined && room.storage.store[RESOURCE_ENERGY] >= 150 + 550)
            //|| containers.length > 0
            ) {
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
            // if we have the minimum amount of energy capacity needed for a miner
            if (maxEnergy >= 550) {
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
        }

        // if none of the above caused a spawn command check for mineralMiners
        if (name === undefined) {
            // if we have the minimum amount of energy capacity needed for a miner and there is an extractor built
            if (maxEnergy >= 1050 && room.find(FIND_STRUCTURES, {
                    filter: s => s.structureType === STRUCTURE_EXTRACTOR
                }).length >= 1) {
                // check if all minerals have miners
                let minerals = room.find(FIND_MINERALS);
                if (minerals.length > 0) {
                    let mineral = minerals[0];
                    // if the mineral has no miner
                    if (mineral.mineralAmount > 0
                        && !_.some(creepsInRoom, c => c.memory.role === 'mineralMiner' && c.memory.mineralId === mineral.id)) {
                        // check whether or not the mineral has a container
                        /** @type {Array.StructureContainer} */
                        let containers = mineral.pos.findInRange(FIND_STRUCTURES, 1, {
                            filter: s => s.structureType === STRUCTURE_CONTAINER
                        });
                        // if there is a container next to the mineral
                        if (containers.length > 0) {
                            // spawn a mineralMiner
                            name = this.createMineralMiner(mineral.id);
                        }
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
                    name = this.createClaimer(this.memory.claimRoom, true);
                    // if that worked
                    if (name !== undefined && _.isString(name)) {
                        // delete the claim order
                        delete this.memory.claimRoom;
                    }
                    break;
                }
                // if no claim order was found, check other roles
                else if (numberOfCreeps[role] < MIN_NUMBER_OF_CREEPS[role]) {
                    if (role === 'lorry' && _.some(creepsInRoom, c => c.memory.role === 'miner')) {
                        // if we have at least one miner in this room
                        name = this.createLorry(550);
                    }
                    else if (role === 'mineralLorry' && _.some(creepsInRoom, c => c.memory.role === 'mineralMiner')) {
                        // if we have at least one mineralMiner in this room
                        name = this.createMineralLorry(550);
                    }
                    else {
                        if (role === 'lorry' || role === 'mineralLorry') {
                            continue;
                        }
                        if (room.energyCapacityAvailable < BIGGEST_CREEP_THRESHOLD)
                            name = this.createCustomCreep(maxEnergy, role);
                        else
                            name = this.createCustomCreep(BIGGEST_CREEP_THRESHOLD, role);
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
            for (let roomName in MIN_NUMBER_OF_ATTACKERS[room.name]) {
                numberOfAttackers[roomName] = _.sum(Game.creeps, (c) =>
                    c.memory.role === 'attacker' && c.memory.target === roomName);

                if (numberOfAttackers[roomName] < MIN_NUMBER_OF_ATTACKERS[room.name][roomName]) {
                    name = this.createAttacker(maxEnergy, 3, room.name, roomName, 0);
                }
            }
        }

        // if none of the above caused a spawn command check for Scavengers
        /** @type {Object.<string, number>} */
        let numberOfScavengers = {};
        if (name === undefined) {
            // count the number of scavengers globally
            for (let roomName in MIN_NUMBER_OF_SCAVENGERS[room.name]) {
                numberOfScavengers[roomName] = _.sum(Game.creeps, (c) =>
                    c.memory.role === 'scavenger' && c.memory.target === roomName);

                if (numberOfScavengers[roomName] < MIN_NUMBER_OF_SCAVENGERS[room.name][roomName]) {
                    name = this.createScavenger(maxEnergy, 2, room.name, roomName);
                }
            }
        }

        // if none of the above caused a spawn command check for LongDistanceHarvesters
        /** @type {Object.<string, number>} */
        let numberOfLongDistanceHarvesters = {};
        if (name === undefined) {
            // count the number of long distance harvesters globally
            for (let roomName in MIN_NUMBER_OF_LONG_DISTANCE_HARVESTERS[room.name]) {
                numberOfLongDistanceHarvesters[roomName] = _.sum(Game.creeps, (c) =>
                    c.memory.role === 'longDistanceHarvester' && c.memory.target === roomName);

                if (numberOfLongDistanceHarvesters[roomName] < MIN_NUMBER_OF_LONG_DISTANCE_HARVESTERS[room.name][roomName]) {
                    if (room.energyCapacityAvailable < BIGGEST_CREEP_THRESHOLD)
                        name = this.createLongDistanceHarvester(maxEnergy, 2, room.name, roomName);
                    else
                        name = this.createLongDistanceHarvester(BIGGEST_CREEP_THRESHOLD, 2, room.name, roomName);
                } else {
                    // if we do not yet have a claimer reserving the controller
                    if (!_.some(Game.creeps, (c) =>
                            c.memory.role === 'claimer' && c.memory.target === roomName && c.memory.reserve === true))
                    // create claimer used for reserving the controller
                        name = this.createClaimer(roomName, false);
                }
            }
        }

        // If everything is full
        if (name === undefined && room.energyAvailable === room.energyCapacityAvailable) {
            // spawn new upgrader
            name = this.createCustomCreep(maxEnergy, 'upgrader');
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
StructureSpawn.prototype.createScavenger =
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
        return this.createCreep(body, "scavenger" + Game.time, {
            role: 'scavenger',
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
    function (target, claim) {
        if (claim) {
            return this.createCreep([CLAIM, MOVE], "claimer" + Game.time, {
                role: 'claimer',
                target: target,
                claim: true
            });
        } else {
            return this.createCreep([CLAIM, CLAIM, MOVE, MOVE], "claimer" + Game.time, {
                role: 'claimer',
                target: target,
                reserve: true
            });
        }

    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createMiner =
    function (sourceId) {
        return this.createCreep([WORK, WORK, WORK, WORK, WORK, MOVE], "miner" + Game.time,
            {role: 'miner', sourceId: sourceId});
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createMineralMiner =
    function (mineralId) {
        return this.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE], "mineralMiner" + Game.time,
            {role: 'mineralMiner', mineralId: mineralId});
    };

let makeLorryBody = function (energy) {
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
    return body;
};

// create a new function for StructureSpawn
StructureSpawn.prototype.createLorry =
    function (energy) {
        let body = makeLorryBody(energy);

        // create creep with the created body and the role 'lorry'
        return this.createCreep(body, "lorry" + Game.time, {role: 'lorry', working: false});
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createMineralLorry =
    function (energy) {
        let body = makeLorryBody(energy);

        // create creep with the created body and the role 'mineralLorry'
        return this.createCreep(body, "mineralLorry" + Game.time, {role: 'mineralLorry', working: false});
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.placeClaimOrder =
    function (roomName) {
        this.memory.claimRoom = roomName;

        console.log('Created Claim Order for Room ' + this.memory.claimRoom);

        return true;
    };


