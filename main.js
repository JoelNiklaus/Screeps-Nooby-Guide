// import modules
require('prototype.creep');
require('prototype.spawn');

const towers = require('structure.towers');

global.WHOAMI = _.find(Game.structures).owner;
global.HOME_FIRST = 'E28N36';
global.HOME_SECOND = 'E28N37';

module.exports.loop = function () {

    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] === undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }

    // for each creep
    for (let name in Game.creeps) {
        // run creep logic
        Game.creeps[name].runRole();
    }

    // for each room
    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        // that I control
        if (room.controller.owner && room.controller.owner.username === WHOAMI.username)
            towers.defendMyRoom(roomName);
    }

    // for each spawn
    for (let spawnName in Game.spawns) {
        // run spawn logic
        Game.spawns[spawnName].spawnCreepsIfNecessary();
        if (Game.spawns[spawnName].spawning) {
            let spawningCreep = Game.creeps[Game.spawns[spawnName].spawning.name];
            Game.spawns[spawnName].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns[spawnName].pos.x + 1,
                Game.spawns[spawnName].pos.y,
                {align: 'left', opacity: 0.8});
        }
    }

    // Resource market
    let deal = function (amountToBuy, maxTransferEnergyCost, room, resourceType) {
        const orders = Game.market.getAllOrders(
            order => order.resourceType === resourceType && order.type === ORDER_BUY &&
                Game.market.calcTransactionCost(amountToBuy, room, order.roomName) < maxTransferEnergyCost);

        if(orders.length > 0)
            Game.market.deal(orders[0].id, amountToBuy, room);
        console.log(JSON.stringify(orders));
        console.log("Credits: " + Game.market.credits);
    };
    deal(2000, 500, HOME_FIRST, RESOURCE_ZYNTHIUM);
    deal(2000, 500, HOME_SECOND, RESOURCE_OXYGEN);
}
;