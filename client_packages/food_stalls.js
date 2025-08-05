const NativeUI = require('nativeUI/index.js');

// Food stall locations (coordinates around the map)
const foodStallLocations = [
    { x: -1695.6, y: -1071.5, z: 13.1, name: "Beach Food Stall" },
    { x: -656.3, y: -677.5, z: 31.5, name: "Taco Bomb" },
    { x: 47.0, y: -998.8, z: 29.3, name: "Chihuahua Hotdogs" },
    { x: 167.5, y: -1631.6, z: 29.3, name: "Bishop's Chicken" }
];

// Food items data
const foodItems = [
    { name: "Pizza", price: 30, hunger: 50 },
    { name: "Burger", price: 15, hunger: 25 },
    { name: "Donut", price: 5, hunger: 10 }
];

// Variables
let foodStallMarkers = [];
let currentMenu = null;
let nearFoodStall = false;
let currentStallIndex = -1;

// Create markers and blips for food stalls
function createFoodStallMarkers() {
    foodStallLocations.forEach((location, index) => {
        // Create map blip
        const blip = mp.blips.new(52, new mp.Vector3(location.x, location.y, location.z), {
            name: location.name,
            scale: 0.8,
            color: 47,
            shortRange: true
        });

        // Create ground marker
        const marker = mp.markers.new(1, new mp.Vector3(location.x, location.y, location.z - 1.0), 1.0, {
            color: [255, 165, 0, 150],
            visible: true,
            dimension: 0
        });

        foodStallMarkers.push({ blip, marker, location, index });
    });

    console.log(`Created ${foodStallMarkers.length} food stall markers`);
}

// Create Native UI menu for food stall
function createFoodStallMenu(stallName) {
    if (currentMenu) {
        currentMenu.Close();
        currentMenu = null;
    }

    currentMenu = new NativeUI.Menu("Food Stall", stallName, new NativeUI.Point(50, 50));
    
    // Add food items to menu
    foodItems.forEach((item, index) => {
        const menuItem = new NativeUI.UIMenuItem(
            item.name,
            `Price: $${item.price} | Restores: ${item.hunger} hunger points`
        );
        menuItem.SetRightLabel(`$${item.price}`);
        currentMenu.AddItem(menuItem);
    });

    // Handle item selection
    currentMenu.ItemSelect.on((item, index) => {
        const selectedFood = foodItems[index];
        mp.events.callRemote('buyFood', selectedFood.name, selectedFood.price, selectedFood.hunger);
        currentMenu.Close();
        currentMenu = null;
    });

    // Handle menu close
    currentMenu.MenuClose.on(() => {
        currentMenu = null;
    });

    currentMenu.Open();
}

// Check if player is near any food stall
function checkFoodStallProximity() {
    const playerPos = mp.players.local.position;
    
    for (let i = 0; i < foodStallLocations.length; i++) {
        const stall = foodStallLocations[i];
        const distance = mp.game.system.vdist(
            playerPos.x, playerPos.y, playerPos.z,
            stall.x, stall.y, stall.z
        );

        if (distance <= 1.0) {
            mp.gui.chat.show(false);
            if (!nearFoodStall) {
                nearFoodStall = true;
                currentStallIndex = i;
            }
            
            // Check for interaction key (E key)
            if (mp.game.controls.isControlJustPressed(0, 51)) { // E key
                createFoodStallMenu(stall.name);
            }
            return;
        }
    }
    
    // Player is not near any food stall
    if (nearFoodStall) {
        nearFoodStall = false;
        currentStallIndex = -1;
        
        // Close menu if player walked away from food stall
        if (currentMenu) {
            currentMenu.Close();
            currentMenu = null;
        }
        mp.gui.chat.show(true);
    }
}

// Event handlers
mp.events.add('render', () => {
    if (foodStallMarkers.length > 0) {
        checkFoodStallProximity();
        
        // Show help text when near a food stall (only if menu is not open)
        if (nearFoodStall && currentStallIndex >= 0 && !currentMenu) {
            const stall = foodStallLocations[currentStallIndex];
            // Use the correct method for displaying help text
            mp.game.ui.setTextComponentFormat("STRING");
            mp.game.ui.addTextComponentSubstringPlayerName(`Press ~INPUT_CONTEXT~ to browse ${stall.name}`);
            mp.game.ui.displayHelpTextFromStringLabel(0, false, true, -1);
        }
    }
});

// Response from server for food purchase
mp.events.add('foodPurchaseResult', (success, message) => {
    console.log(`Food purchase result: ${success} - ${message}`);
    if (success) {
        mp.gui.chat.push(`!{lightgreen}${message}`);
    } else {
        mp.gui.chat.push(`!{red}${message}`);
    }
});

// Initialize when ready
mp.events.add('playerReady', () => {
    createFoodStallMarkers();
});

// Also initialize on script load for testing
setTimeout(() => {
    if (mp.players.local) {
        createFoodStallMarkers();
    }
}, 2000);

// Cleanup when disconnecting
mp.events.add('disconnect', () => {
    if (currentMenu) {
        currentMenu.Close();
        currentMenu = null;
    }
}); 