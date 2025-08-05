const playerManager = require('../utils/playerDataManager');

// Set health level for testing
mp.events.addCommand('sethealth', (player, _, amount) => {
    if (!amount) {
        return player.outputChatBox('USAGE: /sethealth [0-100]');
    }

    const healthValue = parseInt(amount);

    if (isNaN(healthValue) || healthValue < 0 || healthValue > 100) {
        return player.outputChatBox('Health must be between 0 and 100.');
    }

    // Set player health
    player.health = healthValue;
    
    // Tell client to set the same health value
    player.call('setPlayerHealth', [healthValue]);

    // Update player data and HUD in one operation
    playerManager.savePlayerData(player, { health: healthValue })
        .then(() => {
            player.outputChatBox(`!{#4CAF50}Your health has been set to ${healthValue}.`);
        })
        .catch(err => {
            console.error('Error setting health:', err);
            player.outputChatBox('Error updating health value.');
        });
});

// Teleport to first aid station for testing
mp.events.addCommand('tpmed', (player, _, stationNumber) => {
    const firstAidStationLocations = [
        { x: -677.9, y: 298.9, z: 82.1, name: "Eclipse Medical Tower" },
        { x: -874.0, y: -305.2, z: 39.5, name: "Portola Trinity Medical Center" },
        { x: -475.5, y: -356.3, z: 34.1, name: "Mount Zonah Medical Center" },
        { x: -475.5, y: -356.3, z: 34.1, name: "Pillbox Hill Medical Center" },
        { x: 317.0, y: -1376.7, z: 31.9, name: "Central Los Santos Medical Center" },
        { x: 1152.9, y: -1527.5, z: 34.8, name: "St Fiacre Hospital" }
    ];

    if (!stationNumber) {
        player.outputChatBox(`USAGE: /tpmedical [1-${firstAidStationLocations.length}]`);
        return;
    }

    const index = parseInt(stationNumber) - 1;

    if (isNaN(index) || index < 0 || index >= firstAidStationLocations.length) {
        player.outputChatBox(`ERROR: Station number must be between 1 and ${firstAidStationLocations.length}.`);
        return;
    }

    const station = firstAidStationLocations[index];
    player.position = new mp.Vector3(station.x, station.y, station.z);
    player.outputChatBox(`!{#4CAF50}Teleported to ${station.name}.`);
});