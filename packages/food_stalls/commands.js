const playerManager = require('../utils/playerDataManager');

// Set hunger level for testing
mp.events.addCommand('sethunger', (player, _, amount) => {
    if (!amount) {
        return player.outputChatBox('USAGE: /sethunger [0-100]');
    }

    const hungerValue = parseInt(amount);

    if (isNaN(hungerValue) || hungerValue < 0 || hungerValue > 100) {
        return player.outputChatBox('Hunger must be between 0 and 100.');
    }

    // Update player data and HUD in one operation
    playerManager.savePlayerData(player, { hunger: hungerValue })
        .then(() => {
            player.outputChatBox(`!{#4CAF50}Your hunger has been set to ${hungerValue}.`);
        })
        .catch(err => {
            console.error('Error setting hunger:', err);
            player.outputChatBox('Error updating hunger value.');
        });
});

// Teleport to food stall for testing
mp.events.addCommand('tpfood', (player, _, stallNumber) => {
    const foodStallLocations = [
        { x: -1695.6, y: -1071.5, z: 13.1, name: "Beach Food Stall" },
        { x: -656.3, y: -677.5, z: 31.5, name: "Taco Bomb" },
        { x: 47.0, y: -998.8, z: 29.3, name: "Chihuahua Hotdogs" },
        { x: 167.5, y: -1631.6, z: 29.3, name: "Bishop's Chicken" }
    ];

    if (!stallNumber) {
        player.outputChatBox(`USAGE: /tpfood [1-${foodStallLocations.length}]`);
    }

    const index = parseInt(stallNumber) - 1;

    if (isNaN(index) || index < 0 || index >= foodStallLocations.length) {
        player.outputChatBox(`ERROR: Stall number must be between 1 and ${foodStallLocations.length}.`);
        return;
    }

    const stall = foodStallLocations[index];
    player.position = new mp.Vector3(stall.x, stall.y, stall.z);
    player.outputChatBox(`!{#4CAF50}Teleported to ${stall.name}.`);
}); 