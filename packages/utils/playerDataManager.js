const fs = require('fs');
const path = require('path');

// Define the path to player data file
const playerDataPath = path.join(__dirname, '../freeroam/player_data.json');

// Save player data to JSON file and update HUD if needed
function savePlayerData(player, specificFields = null, updateHUD = true) {
    return new Promise((resolve, reject) => {
        fs.readFile(playerDataPath, 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Error reading player data for saving:', err);
                reject(err);
                return;
            }

            let playerData = {};
            if (data) {
                try {
                    playerData = JSON.parse(data);
                } catch (parseErr) {
                    console.error('Error parsing player data for saving:', parseErr);
                    reject(parseErr);
                    return;
                }
            }

            const playerKey = player.socialClub;
            if (!playerData[playerKey]) {
                playerData[playerKey] = {};
            }

            // Track which fields were updated for HUD
            const updatedFields = {};

            // If specific fields are provided, only update those
            if (specificFields && typeof specificFields === 'object') {
                Object.keys(specificFields).forEach(field => {
                    playerData[playerKey][field] = specificFields[field];
                    
                    // Also update player variable if applicable
                    if (field === 'hunger' || field === 'money') {
                        player.setVariable(field, specificFields[field]);
                        updatedFields[field] = specificFields[field];
                    } else if (field === 'health') {
                        // DON'T overwrite player.health here - it should already be set by the calling code
                        updatedFields.health = specificFields[field];
                    } else if (field === 'name') {
                        player.name = specificFields[field];
                        updatedFields.name = specificFields[field];
                    }
                });
            } else {
                // Save all player data
                playerData[playerKey].name = player.name;
                playerData[playerKey].money = player.getVariable('money');
                playerData[playerKey].hunger = player.getVariable('hunger');
                playerData[playerKey].health = player.health;
                
                // Track all fields for HUD update
                updatedFields.name = player.name;
                updatedFields.money = player.getVariable('money');
                updatedFields.hunger = player.getVariable('hunger');
                updatedFields.health = player.health;
            }

            fs.writeFile(playerDataPath, JSON.stringify(playerData, null, 4), (writeErr) => {
                if (writeErr) {
                    console.error('Error saving player data:', writeErr);
                    reject(writeErr);
                    return;
                }
                
                // After server data is saved, update client HUD UI
                if (updateHUD && Object.keys(updatedFields).length > 0) {
                    player.call('updateHUD', [JSON.stringify(updatedFields)]);
                }
                
                resolve(playerData[playerKey]);
            });
        });
    });
}

// Load player data from JSON file
function loadPlayerData(playerSocialClub) {
    return new Promise((resolve, reject) => {
        fs.readFile(playerDataPath, 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Error reading player data:', err);
                reject(err);
                return;
            }

            let playerData = {};
            if (data) {
                try {
                    playerData = JSON.parse(data);
                } catch (parseErr) {
                    console.error('Error parsing player data:', parseErr);
                    reject(parseErr);
                    return;
                }
            }

            resolve(playerData[playerSocialClub] || null);
        });
    });
}

module.exports = {
    savePlayerData,
    loadPlayerData
};