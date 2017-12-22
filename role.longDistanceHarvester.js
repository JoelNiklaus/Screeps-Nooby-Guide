const roleBuilder = require('role.builder');
const roleRepairer = require('role.repairer');

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function (creep) {
        // if creep is bringing energy to a structure but has no energy left
        if (creep.memory.working === true && creep.carry.energy === 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working === true) {
            // if in home room
            if (creep.room.name === creep.memory.home) {
                // find closest spawn, extension or tower which is not full
                let structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    // the second argument for findClosestByPath is an object which takes
                    // a property called filter which can be a function
                    // we use the arrow operator to define it
                    filter: (s) => (s.structureType === STRUCTURE_SPAWN
                        || s.structureType === STRUCTURE_EXTENSION
                        || s.structureType === STRUCTURE_TOWER
                        || s.structureType === STRUCTURE_CONTAINER)
                        && s.energy < s.energyCapacity
                });

                if (structure === undefined) {
                    structure = creep.room.storage;
                }

                // if we found one
                if (structure) {
                    // try to transfer energy, if it is not in range
                    if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(structure);
                    }
                }
            }
            // if not in home room...
            else {
                // go build roads
                if (creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)) {
                    roleBuilder.run(creep);
                }
                // go repairing the roads
                else if (creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax * 0.9})) {
                    //roleRepairer.run(creep);
                }
                else {
                    creep.exitRoom(creep.memory.home);
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            // if in target room
            if (creep.room.name === creep.memory.target) {
                let energy = creep.energyLyingAround();
                if (energy && energy.amount > 0) {
                    creep.pickupResources(energy);
                } else {
                    let player = creep.room.controller.owner;
                    if (player && player !== WHOAMI)
                        console.log("Cannot mine in Room belonging to " + player);

                    // find source
                    let source = creep.pos.findClosestByPath(FIND_SOURCES);

                    // try to harvest energy, if the source is not in range
                    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                        // move towards the source
                        creep.moveTo(source);
                    }
                }

            }
            // if not in target room
            else {
                creep.exitRoom(creep.memory.target);
            }
        }
    }
};