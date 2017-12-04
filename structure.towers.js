module.exports = {

    //TOWER CODE
    defendMyRoom: function (myRoomName) {

        let hostiles = Game.rooms[myRoomName].find(FIND_HOSTILE_CREEPS);
        let hostileHealers = Game.rooms[myRoomName].find(FIND_HOSTILE_CREEPS, {filter: (s) => (s.getActiveBodyparts(HEAL) > 0)});
        let hostileAttackers = Game.rooms[myRoomName].find(FIND_HOSTILE_CREEPS, {filter: (s) => ( s.getActiveBodyparts(ATTACK) > 0 || s.getActiveBodyparts(RANGED_ATTACK) > 0)});
        let towers = Game.rooms[myRoomName].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        let healerHit = false;

        //Alternative to finding towers:
        //var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);

        //if there are hostileHealers - attack them
        if (hostileHealers.length > 0 && healerHit === false) {
            towers.forEach(tower => tower.attack(hostileHealers[0]));
            healerHit = true;
            console.log("ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ");
        }

        //if there are hostileAttackers - attack them
        else if (hostileAttackers.length > 0) {
            towers.forEach(tower => tower.attack(hostileAttackers[0]));
            healerHit = false;
            console.log("ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ");
        }
        //if there are ANY Hostiles - attack them
        else if (hostiles.length > 0) {
            towers.forEach(tower => tower.attack(hostiles[0]));
            healerHit = false;
            console.log("ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ");
        }

        //if there are no hostiles....
        if (hostiles.length === 0) {

            //....first heal any damaged creeps
            for (let name in Game.creeps) {
                // get the creep object
                let creep = Game.creeps[name];
                if (creep.hits < creep.hitsMax) {
                    towers.forEach(tower => tower.heal(creep));
                    console.log("Tower is healing Creeps.");
                }
            }

            for (let tower of towers) {
                // repair ramparts which just have been built in order to keep them alive.
                const percentage = 0.001;
                // find a rampart with less than percentage hits
                let rampart = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (s) => s.hits < s.hitsMax
                        && (s.hits / s.hitsMax) < percentage
                        && s.structureType === STRUCTURE_RAMPART
                });

                if (rampart && tower.energy > 100) {
                    tower.repair(rampart);
                    console.log("The tower is repairing ramparts.");
                }


                //...repair Buildings! :) But ONLY until HALF the energy of the tower is gone.
                //Because we don't want to be exposed if something shows up at our door :)
                if (tower.energy > 0.5 * tower.energyCapacity) {

                    //Find the closest damaged Structure
                    let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (s) => s.hits < s.hitsMax
                            && s.structureType !== STRUCTURE_WALL
                            && s.structureType !== STRUCTURE_RAMPART
                    });
                    if (closestDamagedStructure) {
                        tower.repair(closestDamagedStructure);
                        console.log("The tower is repairing buildings.");
                    }
                }
            }
        }

    }
};
