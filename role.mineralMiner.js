module.exports = {
    // a function to run the logic for this role
    run: function (creep) {
        // get mineral
        let mineral = Game.getObjectById(creep.memory.mineralId);
        // find container next to mineral
        let container = mineral.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType === STRUCTURE_CONTAINER
                && _.sum(s.store) < s.storeCapacity
        })[0];

        if(container){
            // if creep is on top of the container
            if (creep.pos.isEqualTo(container.pos)) {
                // harvest mineral
                creep.harvest(mineral);
            }
            // if creep is not on top of the container
            else {
                // move towards it
                creep.moveTo(container);
            }
        }

    }
};