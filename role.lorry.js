module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function (creep) {
        // if creep is bringing energy to a structure but has no energy left
        if (creep.memory.working === true && creep.carry.energy === 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is withdrawing energy but is full
        else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }


        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working === true) {
            let structure = creep.findEnergyStructure(STRUCTURE_EXTENSION);

            if (!structure) {
                structure = creep.findEnergyStructure(STRUCTURE_TOWER);
            }

            if (!structure) {
                structure = creep.findEnergyStructure(STRUCTURE_SPAWN);
            }

            if (!structure) {
                structure = creep.findEnergyStructure(STRUCTURE_LAB);
            }

            if (!structure) {
                structure = creep.room.terminal;
            }

            if (!structure) {
                structure = creep.room.storage;
            }

            // if we found one
            if (structure) {
                // try to transfer energy, if it is not in range
                if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(structure, {reusePath: 50});
                }
            }
        }
        // if creep is supposed to get energy
        else {
            let energy = creep.energyLyingAround();
            if (energy && energy.amount > 0) {
                creep.pickupResources(energy);
            }
            else {
                // find closest container which is already full
                let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] === s.storeCapacity
                });

                // find closest container which is at least half full
                if (!container) {
                    container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > s.storeCapacity * 0.5
                    });
                }

                // find closest container
                if (!container) {
                    container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
                    });
                }

                if (!container) {
                    container = creep.room.terminal;
                }

                if (!container) {
                    container = creep.room.storage;
                }

                // if one was found
                if (container) {
                    // try to withdraw energy, if the container is not in range
                    if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(container, {reusePath: 50});
                    }
                }
            }

        }


    }
};