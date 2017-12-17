module.exports = {

    //TOWER CODE
    defendMyRoom: function (myRoomName) {

        let hostiles = Game.rooms[myRoomName].find(FIND_HOSTILE_CREEPS);
        let hostileHealers = Game.rooms[myRoomName].find(FIND_HOSTILE_CREEPS, {filter: (c) => (c.getActiveBodyparts(HEAL) > 0)});
        let hostileAttackers = Game.rooms[myRoomName].find(FIND_HOSTILE_CREEPS, {filter: (c) => ( c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0)});
        let towers = Game.rooms[myRoomName].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        let healerHit = false;

        //Alternative to finding towers:
        //var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);

        // if there are hostileHealers - attack them
        if (hostileHealers.length > 0 && healerHit === false) {
            towers.forEach(tower => tower.attack(hostileHealers[0]));
            healerHit = true;
            console.log("ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ");
        }
        // if there are hostileAttackers - attack them
        else if (hostileAttackers.length > 0) {
            towers.forEach(tower => tower.attack(hostileAttackers[0]));
            healerHit = false;
            console.log("ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ");
        }
        // if there are ANY Hostiles - attack them
        else if (hostiles.length > 0) {
            towers.forEach(tower => tower.attack(hostiles[0]));
            healerHit = false;
            console.log("ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ");
        }

        // if there are no hostiles....
        if (hostiles.length === 0) {

            //....first heal any damaged creeps
            let woundedCreeps = _.filter(Game.creeps, (c) => c.hits < c.hitsMax && c.room.name === myRoomName);
            for (let creep of woundedCreeps) {
                if (creep.hits < creep.hitsMax) {
                    towers.forEach(tower => tower.heal(creep));
                    console.log("Tower is healing Creeps.");
                }
            }

            for (let tower of towers) {
                let ramparts = tower.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_RAMPART
                });

                let target = undefined;

                // loop with increasing percentages
                for (let percentage = 0.0001; percentage <= 0.1; percentage = percentage + 0.0001){
                    // find a rampart with less than percentage hits
                    for (let rampart of ramparts) {
                        if (rampart.hits / rampart.hitsMax < percentage) {
                            target = rampart;
                            break;
                        }
                    }

                    // if there is one
                    if (target) {
                        // break the loop
                        break;
                    }
                }

                if (target && tower.energy > 0.9 * tower.energyCapacity) {
                    tower.repair(target);
                    console.log("The tower is repairing ramparts.");
                }


                // ...repair Buildings! :) But ONLY until HALF the energy of the tower is gone.
                // Because we don't want to be exposed if something shows up at our door :)
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
