// First aid stations server-side package
const fs = require('fs');
const path = require('path');
const playerManager = require('../utils/playerDataManager');

// Medical items configuration (should match client-side)
const medicalItems = {
    "First Aid Kit": { price: 70, heal: 100 },
    "Bandage": { price: 15, heal: 15 }
};

// Maximum health value
const MAX_HEALTH = 100;

// Handle medicine purchase
mp.events.add('buyMedicine', (player, medicineName, price, healAmount) => {
    try {
        // Validate medical item exists
        if (!medicalItems[medicineName]) {
            player.call('medicinePurchaseResult', [false, 'Invalid medical item']);
            return;
        }

        // Verify the price and heal values match server config
        const serverMedicineData = medicalItems[medicineName];
        if (price !== serverMedicineData.price || healAmount !== serverMedicineData.heal) {
            player.call('medicinePurchaseResult', [false, 'Invalid medicine data']);
            console.log(`Player ${player.name} tried to buy ${medicineName} with invalid data`);
            return;
        }

        // Get player's current stats
        const currentMoney = player.getVariable('money') || 0;
        const currentHealth = player.health || 0;

        // Check if player has enough money
        if (currentMoney < price) {
            player.call('medicinePurchaseResult', [false, `You need $${price} to buy ${medicineName}. You only have $${currentMoney}.`]);
            return;
        }

        // Check if player's health is already full
        if (currentHealth >= MAX_HEALTH) {
            player.call('medicinePurchaseResult', [false, 'You are already at full health.']);
            return;
        }

        // Process the purchase
        const newMoney = currentMoney - price;
        const newHealth = Math.min(currentHealth + healAmount, MAX_HEALTH);
        const actualHealthGained = newHealth - currentHealth;

        // Update player health
        player.health = newHealth;
        
        // Tell client to set the same health value
        player.call('setPlayerHealth', [newHealth]);

        // Update player data and HUD in one operation
        playerManager.savePlayerData(player, {
            money: newMoney,
            health: newHealth
        });

        // Send success message
        let message = `You bought ${medicineName} for $${price} and restored ${actualHealthGained} health points.`;
        if (actualHealthGained < healAmount) {
            message += ` (${healAmount - actualHealthGained} points wasted due to full health)`;
        }
        
        player.call('medicinePurchaseResult', [true, message]);
        
        console.log(`${player.name} bought ${medicineName} for $${price}. Money: ${currentMoney} -> ${newMoney}, Health: ${currentHealth} -> ${newHealth}`);

    } catch (error) {
        console.error('Error processing medicine purchase:', error);
        player.call('medicinePurchaseResult', [false, 'An error occurred while processing your purchase.']);
    }
});

// Load test commands
require('./commands.js');

console.log('First aid stations package loaded successfully!');