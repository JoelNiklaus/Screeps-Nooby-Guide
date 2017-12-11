module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if in target room
        if (creep.room.name !== creep.memory.target) {
            creep.exitRoom(creep.memory.target);
        }
        else {
            // try to claim controller
            if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                // move towards the controller
                creep.moveTo(creep.room.controller);
            }
        }
    }
};