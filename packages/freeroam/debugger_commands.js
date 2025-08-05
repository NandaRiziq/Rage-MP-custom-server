const playerManager = require('../utils/playerDataManager');

// Spawn vehicle
mp.events.addCommand('spawnride', (player, _, vehicleName) =>{
    if (!vehicleName) return player.outputChatBox('USAGE: /spawnRide [vehicle model]')
    
    const spawnPos = new mp.Vector3(player.position.x + 2, player.position.y, player.position.z);
    const vehicle = mp.vehicles.new(mp.joaat(vehicleName), spawnPos);

    if (vehicle) {
        player.putIntoVehicle(vehicle, 0);
    }

    else{
        return player.outputChatBox('No such vehicle exist');
    }

});

// Add money to player
mp.events.addCommand('addmoney', (player, _, amount) => {
    if (!amount) {
        return player.outputChatBox('USAGE: /addmoney [amountInt]');
    }

    const amountInt = parseInt(amount);

    if (isNaN(amountInt)) {
        return player.outputChatBox('ERROR: Invalid number provided.');
    }

    // Get current money
    const currentMoney = player.getVariable('money') || 0;
    const newMoney = currentMoney + amountInt;
    
    // Update player data and HUD in one operation
    playerManager.savePlayerData(player, { money: newMoney })
        .then(() => {
            player.outputChatBox(`!{#4CAF50}You have received $${amountInt.toLocaleString()}. Your new balance is $${newMoney.toLocaleString()}.`);
        })
        .catch(err => {
            console.error('Error updating money:', err);
            player.outputChatBox('An error occurred while updating your money.');
        });
});

mp.events.addCommand('heal', (player) => {
    const currentHealth = player.health;
    console.log(`Heal command: ${player.name} - Current: ${currentHealth}`);
    // Call the healPlayer event from events.js with 10 heal amount
    mp.events.call('healPlayer', player, 10);
    // Inform player
    player.outputChatBox(`You have been healed. Health: ${currentHealth} → ${Math.min(currentHealth + 10, 100)}`);
});

mp.events.addCommand('takedamage', (player) => {
    // Calculate new health and armor values
    const currentHealth = player.health;
    const currentArmour = player.armour;
    const newHealth = Math.max(currentHealth - 10, 0);
    let newArmour = currentArmour;
    
    if (currentArmour > 0) {
        newArmour = Math.max(currentArmour - 10, 0);
        player.armour = newArmour;
    }
    
    console.log(`TakeDamage command: ${player.name} - Health: ${currentHealth} → ${newHealth}, Armor: ${currentArmour} → ${newArmour}`);
    
    // Set new health
    player.health = newHealth;
    
    // Save to database explicitly (don't rely on playerDamage event)
    playerManager.savePlayerData(player, { health: newHealth }).then(() => {
        console.log(`Damage saved for ${player.name}: Health: ${newHealth}`);
    }).catch(err => {
        console.error('Error saving damage:', err);
    });
    
    // Inform player
    player.outputChatBox(`You took damage. Health: ${currentHealth} → ${newHealth}`);
});

// Teleport to waypoint on the map (if exist)
mp.events.addCommand('tpwaypoint', (player) => {
    player.call('teleportToWaypoint');
});

// Change player name and save to player data
mp.events.addCommand('changename', (player, _, newName) => {
    if (!newName) {
        return player.outputChatBox('USAGE: /changename [new name]');
    }

    // Update player data and HUD in one operation
    playerManager.savePlayerData(player, { name: newName })
        .then(() => {
            player.outputChatBox(`!{#4CAF50}Your name has been changed to ${newName}.`);
        })
        .catch(err => {
            console.error('Error changing name:', err);
            player.outputChatBox('An error occurred while changing your name.');
        });
});

// Server-side getPos command
mp.events.addCommand('getpos', (player) => {
    player.call('getPos');
});

// Server-side handler to receive position from client
mp.events.add('sendPositionToServer', (player, x, y, z) => {
    console.log(`Received position from ${player.name}: x: ${x.toFixed(1)}, y: ${y.toFixed(1)}, z: ${z.toFixed(1)}`);
    
    const message = `Current position: x: ${x.toFixed(1)}, y: ${y.toFixed(1)}, z: ${z.toFixed(1)}`;
    
    // Send message back to player
    player.outputChatBox(`!{yellow}${message}`);
});