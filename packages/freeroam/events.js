const fs = require('fs');
const path = require('path');
let skins       = require('./configs/skins.json').Skins;
let spawnPoints = require('./configs/spawn_points.json').SpawnPoints;
const playerDataPath = path.join(__dirname, 'player_data.json');
const playerManager = require('../utils/playerDataManager');

/* !!! REMOVE AFTER FIX (TRIGGERED FROM SERVER) !!! */
mp.events.add('playerEnteredVehicle', (player) => {
    if (player.vehicle && player.seat === 0 || player.seat === 255)
        player.call('playerEnteredVehicle');
});
/* */

mp.events.add('playerExitVehicle', (player) => {
    player.call('playerExitVehicle');
});

// player join events
mp.events.add('playerJoin', (player) => {
    player.customData = {};

    mp.players.forEach(_player => {
        if (_player != player)
            _player.call('playerJoinedServer', [player.id, player.name]);
    });

    fs.readFile(playerDataPath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading player data:', err);
            return;
        }

        let playerData = {};
        if (data) {
            try {
                playerData = JSON.parse(data);
            } catch (parseErr) {
                console.error('Error parsing player data:', parseErr);
                return;
            }
        }

        const playerKey = player.socialClub;
        let money = 1000; // Give new players starting money for testing
        let hunger = 100;
        let health = 100;

        if (playerData[playerKey]) {
            player.name = playerData[playerKey].name || player.socialClub;
            money = playerData[playerKey].money || 1000; // Starting money for existing players too
            hunger = playerData[playerKey].hunger || 100;
            health = playerData[playerKey].health || 100;
        } else {
            player.name = player.socialClub;
            playerData[playerKey] = { name: player.name, money: money, hunger: hunger, health: health };
        }
        
        // First spawn the player
        player.spawn(spawnPoints[Math.floor(Math.random() * spawnPoints.length)]);
        player.model = skins[Math.floor(Math.random() * skins.length)];
        
        // Store health data on player object to set after spawn
        player.pendingHealth = health;
        player.pendingMoney = money;
        player.pendingHunger = hunger;

        // Update Discord status after player name is set
        mp.discord.update('Playing on Freeroam', `Playing as ${player.name}`);
    });
});

// player quit events
mp.events.add('playerQuit', (player, exitType, reason) => {
    playerManager.savePlayerData(player);
    if (player.customData.vehicle)
        player.customData.vehicle.destroy();

    mp.players.forEach(_player => {
        if (_player != player)
            _player.call('playerLeavedServer', [player.id, player.name]);
    });
});

// player take damage events
mp.events.add("playerDamage", (player, healthLoss, armorLoss) => {
    // This will be called automatically when player takes damage in-game
    console.log(`${player.name} took damage: Health loss: ${healthLoss}, Armor loss: ${armorLoss}`);
    playerManager.savePlayerData(player, { health: player.health });
});

// player death events
mp.events.add('playerDeath', (player) => {
    player.spawn(spawnPoints[Math.floor(Math.random() * spawnPoints.length)]);

    // Store respawn data to set after spawn
    player.pendingHealth = 100;
    const hunger = Math.max(player.getVariable('hunger') || 0, 50);
    player.pendingHunger = hunger;
});

// Handle player spawn - triggered after spawn is complete
mp.events.add('playerSpawn', (player) => {
    console.log(`Player ${player.name} spawned - Setting pending data...`);
    
    // Set health from pending data (from join or respawn)
    if (player.pendingHealth !== undefined) {
        console.log(`Setting health for ${player.name}: ${player.pendingHealth}`);
        player.health = player.pendingHealth;
        player.armour = 100;
        
        // Tell client to set the same health value
        player.call('setPlayerHealth', [player.pendingHealth]);
        
        // Save all pending data
        const saveData = {
            health: player.pendingHealth
        };
        
        if (player.pendingMoney !== undefined) {
            saveData.money = player.pendingMoney;
            saveData.name = player.name;
        }
        
        if (player.pendingHunger !== undefined) {
            saveData.hunger = player.pendingHunger;
        }
        
        playerManager.savePlayerData(player, saveData);
        
        console.log(`Spawn complete for ${player.name}: Health = ${player.health}`);
        
        // Initialize lastHealth for continuous monitoring system
        player.customData.lastHealth = player.health;
        
        // Clear pending data
        delete player.pendingHealth;
        delete player.pendingMoney;
        delete player.pendingHunger;
    }
});

mp.events.add('playerChat', (player, message) => {
    mp.players.broadcast(`<b>${player.name}[${player.id}]:</b> ${message}`);
});

mp.events.add('healPlayer', (player, amount) => {
    // Calculate new health value
    const currentHealth = player.health;
    const newHealth = Math.min(currentHealth + amount, 100);
    // Set server-side health
    player.health = newHealth;
    player.call('setPlayerHealth', [newHealth]);
    playerManager.savePlayerData(player, { health: player.health });
});

// hunger level decrease every 30 seconds
setInterval(() => {
    mp.players.forEach(player => {
        let hunger = player.getVariable('hunger');
        let updateData = {};
        
        if (hunger > 0) {
            hunger--;
            updateData.hunger = hunger;
            // Only update hunger, no health changes
            playerManager.savePlayerData(player, updateData);
        } else { // if hunger 0, damage player
            // First damage the player
            player.health -= 5;
            // Then save both hunger and health separately to avoid conflicts
            updateData.hunger = 0;
            updateData.health = player.health;
            playerManager.savePlayerData(player, updateData);
        }
    });
}, 30000);

// continuous health monitoring and update system
setInterval(() => {
    mp.players.forEach(player => {
        // Skip if player is not fully spawned or doesn't have custom data
        if (!player || !player.customData) return;
        
        const currentHealth = player.health;
        
        // Initialize lastHealth if it doesn't exist
        if (player.customData.lastHealth === undefined) {
            player.customData.lastHealth = currentHealth;
            return;
        }
        
        // Check if health has changed since last check
        if (player.customData.lastHealth !== currentHealth) {
            console.log(`Health change detected for ${player.name}: ${player.customData.lastHealth} -> ${currentHealth}`);
            
            // Update the stored health value
            player.customData.lastHealth = currentHealth;
            
            // Save the new health to player_data.json
            playerManager.savePlayerData(player, { health: currentHealth });
            
            // Sync with client to ensure consistency
            player.call('setPlayerHealth', [currentHealth]);
        }
    });
}, 1000); // Check every 1 second

// Getting data from client.
mp.events.add('clientData', function() {
    let player = arguments[0];
    /*
        @@ args[0] - data name.
        @@ args[n] - data value (if it is needed).
    */
    let args = JSON.parse(arguments[1]);

    switch (args[0]) {
    // Suicide.
    case 'kill':
        player.health = 0;

        break;
    // Change skin.
    case 'skin':
        player.model = args[1];

        break;
    // Creating new vehicle for player.
    case 'vehicle':
        // If player has vehicle - change model.
        if (player.customData.vehicle) {
            let pos = player.position;
            pos.x += 2;
            player.customData.vehicle.position = pos;
            player.customData.vehicle.model = mp.joaat(args[1]);
        // Else - create new vehicle.
        } else {
            let pos = player.position;
            pos.x += 2;
            player.customData.vehicle = mp.vehicles.new(mp.joaat(args[1]), pos);
        }
        // Hide vehicle buttons (bugfix).
        player.call('hideVehicleButtons');

        break;
        // Weapon.
    case 'weapon':
        player.giveWeapon(mp.joaat(args[1]), 1000);

        break;
    // Repair the vehicle.
    case 'fix':
        if (player.vehicle)
            player.vehicle.repair();

        break;
    // Flip the vehicle.
    case 'flip':
        if (player.vehicle) {
            let rotation = player.vehicle.rotation;
            rotation.y = 0;
            player.vehicle.rotation = rotation;
        }

        break;
    // Vehicle color or neon.
    case 'server_color':
        if (player.vehicle) {
            if (args[1] == 'color') {
                let colorPrimary = JSON.parse(args[2]);
                let colorSecondary = JSON.parse(args[3]);
                player.vehicle.setColourRGB(colorPrimary.r, colorPrimary.g, colorPrimary.b, colorSecondary.r, colorSecondary.g, colorSecondary.b);
            }

            if (args[1] == 'neon') {
                let color = JSON.parse(args[2]);
                player.vehicle.setNeonColour(color.r, color.g, color.b);
            }
        }

        break;
    }
});
