var roles = {
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    repairer: require('role.repairer'),
    wallRepairer: require('role.wallRepairer'),
    longDistanceHarvester: require('role.longDistanceHarvester'),
    claimer: require('role.claimer'),
    miner: require('role.miner'),
    lorry: require('role.lorry'),
    attacker: require('role.attacker')
};

Creep.prototype.runRole =
    function () {
        roles[this.memory.role].run(this);
    };

/** @function
 @param {bool} useContainer
 @param {bool} useSource */
Creep.prototype.getEnergy =
    function (useContainer, useSource) {
        /** @type {StructureContainer} */
        let container;
        // if the Creep should look for containers
        if (useContainer) {
            // find closest container
            container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) &&
                    s.store[RESOURCE_ENERGY] > 0
            });

            // if one was found
            if (container) {
                // try to withdraw energy, if the container is not in range
                if (this.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(container);
                }
            }
        }
        // if no container was found and the Creep should look for Sources
        if (!container && useSource) {
            // find closest source
            let source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

            // try to harvest energy, if the source is not in range
            if (this.harvest(source) === ERR_NOT_IN_RANGE) {
                // move towards it
                this.moveTo(source);
            }
        }
    };

Creep.prototype.exitRoom =
    function (target) {
        // find exit to target room
        let exit = this.room.findExitTo(target);
        // move to exit
        this.moveTo(this.pos.findClosestByRange(exit));
    };

Creep.prototype.findEnergyStructure =
    function (structureType) {
        // find closest spawn, extension or tower which is not full
        return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            // the second argument for findClosestByPath is an object which takes
            // a property called filter which can be a function
            // we use the arrow operator to define it
            filter: (s) => (s.structureType === structureType)
                && s.energy < s.energyCapacity
        });
    };

Creep.prototype.repairStructure =
    function (structure) {
        // try to repair it, if it is out of range
        if (this.repair(structure) === ERR_NOT_IN_RANGE) {
            // move towards it
            this.moveTo(structure);
        }
    };