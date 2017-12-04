module.exports =  {

    findEnergyStructure : function (creep, structureType) {
        // find closest spawn, extension or tower which is not full
        var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            // the second argument for findClosestByPath is an object which takes
            // a property called filter which can be a function
            // we use the arrow operator to define it
            filter: (s) => (s.structureType == structureType)
                && s.energy < s.energyCapacity
        });
        return structure;
    }
};