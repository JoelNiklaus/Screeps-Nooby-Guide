// create a new function for StructureTower
StructureTower.prototype.defend =
    function () {
        // find closes hostile creep
        var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // if one is found...
        if (target != undefined) {
            // ...FIRE!
            this.attack(target);
        }
    };

StructureTower.prototype.repairStructures =
    function () {
        // Only heal if 50% energy left -> spare rest for attacks
        if (this.energy > 0.5 * this.energyCapacity) {
            var closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if (closestDamagedStructure) {
                this.repair(closestDamagedStructure);
            }
        }
    };


