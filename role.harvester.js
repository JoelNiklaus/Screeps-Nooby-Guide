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
            let structure = creep.findEnergyStructure(STRUCTURE_SPAWN);

            if (!structure) {
                structure = creep.findEnergyStructure(STRUCTURE_EXTENSION);
            }

            if (!structure) {
                structure = creep.findEnergyStructure(STRUCTURE_TOWER);
            }

            if (!structure) {
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
        // if creep is supposed to harvest energy from source
        else {
            creep.getEnergy(false, true);
        }
    }
};