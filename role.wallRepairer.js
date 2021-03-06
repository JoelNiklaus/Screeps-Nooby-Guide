const roleBuilder = require('role.builder');
HOME = 'E28N36';


module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function(creep) {
        // if creep is not instructed to work in another room
        if(creep.memory.target && creep.room.name !== creep.memory.target){
            creep.exitRoom(creep.memory.target);
            // return the function to not do anything else
            return;
        }

        // if creep is trying to repair something but has no energy left
        if (creep.memory.working === true && creep.carry.energy === 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to repair something
        if (creep.memory.working === true) {
            // find all wallsAndRamparts in the room
            let wallsAndRamparts = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_RAMPART
                    || s.structureType === STRUCTURE_WALL
            });

            let target = undefined;

            // loop with increasing percentages
            for (let percentage = 0.00001; percentage <= 0.0001; percentage = percentage + 0.00001){
                // find a wall with less than percentage hits
                for (let wall of wallsAndRamparts) {
                    if (wall.hits / wall.hitsMax < percentage) {
                        target = wall;
                        break;
                    }
                }

                // if there is one
                if (target) {
                    // break the loop
                    break;
                }
            }

            // if we find a wall that has to be repaired
            if (target) {
                // try to repair, if the structure is not in range
                if (creep.repairStructure(target) === ERR_NOT_IN_RANGE) {
                    // move towards the constructionSite
                    creep.moveTo(target, {reusePath: 50});
                }
            }
            // if we can't fine one
            else {
                // look for construction sites
                roleBuilder.run(creep);
            }
        }
        // if creep is supposed to get energy
        else {
            creep.getEnergy(true, true);
        }
    }
};