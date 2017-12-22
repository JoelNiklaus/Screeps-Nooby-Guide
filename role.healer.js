module.exports = {
    // a function to run the logic for this role
    run: function (creep) {

        let healBehaviour = function () {
            const target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: function(object) {
                    return object.hits < object.hitsMax;
                }
            });
            if(target) {
                creep.moveTo(target);
                if(creep.pos.isNearTo(target)) {
                    creep.heal(target);
                }
                else {
                    creep.rangedHeal(target);
                }
            }
        };


        // if creep is is wounded
        if (creep.isWounded()) {
            // if in home room
            if (creep.room.name === creep.memory.home) {
                // move to rally point
                healBehaviour();
                //creep.moveTo(Game.flags.rallyPoint);
            }
            // if not in home room...
            else {
                creep.exitRoom(creep.memory.home);
            }
        }
        // if creep is not wounded
        else {
            // if in target room
            if (creep.room.name === creep.memory.target) {
                healBehaviour();
            }
            // if not in target room
            else {
                if (creep.isFullyHealed()) {
                    creep.exitRoom(creep.memory.target);
                }
            }
        }

    }
}
;