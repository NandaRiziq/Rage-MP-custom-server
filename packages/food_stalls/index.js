// Food stalls server-side package
const fs = require('fs');
const path = require('path');
const playerManager = require('../utils/playerDataManager');

// Food items configuration (should match client-side)
const foodItems = {
    "Pizza": { price: 30, hunger: 50 },
    "Burger": { price: 15, hunger: 25 },
    "Donut": { price: 5, hunger: 10 }
};

// Maximum hunger value
const MAX_HUNGER = 100;

// Handle food purchase
mp.events.add('buyFood', (player, foodName, price, hungerRestore) => {
    try {
        // Validate food item exists
        if (!foodItems[foodName]) {
            player.call('foodPurchaseResult', [false, 'Invalid food item']);
            return;
        }

        // Verify the price and hunger values match server config
        const serverFoodData = foodItems[foodName];
        if (price !== serverFoodData.price || hungerRestore !== serverFoodData.hunger) {
            player.call('foodPurchaseResult', [false, 'Invalid food data']);
            console.log(`Player ${player.name} tried to buy ${foodName} with invalid data`);
            return;
        }

        // Get player's current stats
        const currentMoney = player.getVariable('money') || 0;
        const currentHunger = player.getVariable('hunger') || 0;

        // Check if player has enough money
        if (currentMoney < price) {
            player.call('foodPurchaseResult', [false, `You need $${price} to buy ${foodName}. You only have $${currentMoney}.`]);
            return;
        }

        // Check if player's hunger is already full
        if (currentHunger >= MAX_HUNGER) {
            player.call('foodPurchaseResult', [false, 'You are not hungry right now.']);
            return;
        }

        // Process the purchase
        const newMoney = currentMoney - price;
        const newHunger = Math.min(currentHunger + hungerRestore, MAX_HUNGER);
        const actualHungerGained = newHunger - currentHunger;

        // Update player data and HUD in one operation
        playerManager.savePlayerData(player, {
            money: newMoney,
            hunger: newHunger
        });

        // Send success message
        let message = `You bought ${foodName} for $${price} and restored ${actualHungerGained} hunger points.`;
        if (actualHungerGained < hungerRestore) {
            message += ` (${hungerRestore - actualHungerGained} points wasted due to full hunger)`;
        }
        
        player.call('foodPurchaseResult', [true, message]);
        
        console.log(`${player.name} bought ${foodName} for $${price}. Money: ${currentMoney} -> ${newMoney}, Hunger: ${currentHunger} -> ${newHunger}`);

    } catch (error) {
        console.error('Error processing food purchase:', error);
        player.call('foodPurchaseResult', [false, 'An error occurred while processing your purchase.']);
    }
});

// Load test commands
require('./commands.js');