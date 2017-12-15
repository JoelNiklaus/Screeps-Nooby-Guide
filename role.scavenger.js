module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function (creep) {
        // if creep is bringing energy and resources to a structure but has nothing in carry left
        if (creep.memory.working === true && _.sum(creep.carry) === 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is scavenging but is full
        else if (creep.memory.working === false && _.sum(creep.carry) === creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy and resources to a structure
        if (creep.memory.working === true) {
            // if in home room
            if (creep.room.name === creep.memory.home) {
                // just bring back scavenged energy or resources to storage
                let structure = creep.room.storage;

                // if we found one
                if (structure) {
                    // transfer all resources
                    for (const resourceType in creep.carry) {
                        // try to transfer energy, if it is not in range
                        if (creep.transfer(structure, resourceType) === ERR_NOT_IN_RANGE) {
                            // move towards it
                            creep.moveTo(structure);
                        }
                    }
                }
            }
            // if not in home room...
            else {
                creep.exitRoom(creep.memory.home);
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            // if in target room
            if (creep.room.name === creep.memory.target) {
                creep.pickupEnergy();

                // TODO get minerals before energy
                let structure = creep.room.storage;

                // if there is something stored in the structure
                if (structure && _.some(structure.store)) {
                    // withdraw all resources
                    for (const resourceType in structure.store) {
                        // try to withdraw energy or resources, if it is not in range
                        if (creep.withdraw(structure, resourceType) === ERR_NOT_IN_RANGE) {
                            // move towards it
                            creep.moveTo(structure);
                        }
                    }
                }

                // else start to dismantle buildings
                else {
                    //let structure = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);

                    // try to harvest energy by dismantling structure, if the structure is not in range
                    if (creep.dismantle(structure) === ERR_NOT_IN_RANGE) {
                        // move towards the structure
                        creep.moveTo(structure);
                    }
                }
            }
            // if not in target room
            else {
                creep.exitRoom(creep.memory.target);
            }
        }
    }
}
;