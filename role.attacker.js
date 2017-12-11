module.exports = {
    // a function to run the logic for this role
    run: function (creep) {

        let isWounded = function () {
            return creep.hits / creep.hitsMax < 0.5;
        };

        let isFullyHealed = function () {
            return creep.hits === creep.hitsMax;
        };

        let attackCreepOrStructure = function (hostile) {
            if (hostile) {
                if (creep.attack(hostile) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostile);
                }
            }
        };
        let attackBehaviour = function () {
            let hostileCreepOrStructure = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: (c) => (c.getActiveBodyparts(HEAL) > 0)});
            if (!hostileCreepOrStructure)
                hostileCreepOrStructure = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: (c) => ( c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0)});
            if (!hostileCreepOrStructure)
                hostileCreepOrStructure = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (!hostileCreepOrStructure)
                hostileCreepOrStructure = creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
            if (!hostileCreepOrStructure)
                hostileCreepOrStructure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: (s) => (s.structureType === STRUCTURE_TOWER)});
            if (!hostileCreepOrStructure)
                hostileCreepOrStructure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: (s) => (s.structureType !== STRUCTURE_CONTROLLER)});

            attackCreepOrStructure(hostileCreepOrStructure);
        };


        // if creep is is wounded
        if (isWounded()) {
            // if in home room
            if (creep.room.name === creep.memory.home) {
                // move to rally point
                attackBehaviour();
                //creep.moveTo(Game.flags.rallyPoint);
            }
            // if not in home room...
            else {
                // find exit to home room
                let exit = creep.room.findExitTo(creep.memory.home);
                // and move to exit
                creep.moveTo(creep.pos.findClosestByRange(exit));
            }
        }
        // if creep is not wounded
        else {
            // if in target room
            if (creep.room.name === creep.memory.target) {
                attackBehaviour();
            }
            // if not in target room
            else {
                if (isFullyHealed()) {
                    creep.exitRoom(creep.memory.target);
                }
            }
        }

    }
}
;