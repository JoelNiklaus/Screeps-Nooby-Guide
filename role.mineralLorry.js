module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function (creep) {
        // if creep is bringing mineral to a structure but has no mineral left
        if (creep.memory.working === true && _.sum(creep.carry) === 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is withdrawing mineral but is full
        else if (creep.memory.working === false && _.sum(creep.carry) === creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to transfer mineral to a structure
        if (creep.memory.working === true) {
            let structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_TERMINAL
            });

            // if no terminal is built or terminal is full
            if (!structure || _.sum(structure.store) === structure.storeCapacity) {
                structure = creep.room.storage;
            }

            // if we found one
            if (structure) {
                // transfer all resources, if it is not in range
                for (const resourceType in creep.carry) {
                    if (creep.transfer(structure, resourceType) === ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(structure);
                    }
                }
            }
        }
        // if creep is supposed to get mineral
        else {
            let resource = creep.resourceLyingAround();
            if (resource && resource.amount > 0) {
                creep.pickupResources(resource);
            }
            else {
                // find closest container
                let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER && _.sum(s.store) > 0 && s.store[RESOURCE_ENERGY] === 0
                });

                if (!container) {
                    container = creep.room.storage;
                }

                // if one was found
                if (container) {
                    // try to withdraw mineral, if the container is not in range
                    for (const resourceType in container.store) {
                        if (resourceType !== RESOURCE_ENERGY) {
                            if (creep.withdraw(container, resourceType) === ERR_NOT_IN_RANGE) {
                                // move towards it
                                creep.moveTo(container);
                            }
                        }
                    }
                }
            }


        }
    }
};