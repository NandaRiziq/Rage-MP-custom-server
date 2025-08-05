const NativeUI = require('nativeUI/index.js');

// First aid station locations (coordinates around the map)
const firstAidStationLocations = [
    { x: -677.9, y: 298.9, z: 82.1, name: "Eclipse Medical Tower" },
    { x: -874.0, y: -305.2, z: 39.5, name: "Portola Trinity Medical Center" },
    { x: -475.5, y: -356.3, z: 34.1, name: "Mount Zonah Medical Center" },
    { x: -475.5, y: -356.3, z: 34.1, name: "Pillbox Hill Medical Center" },
    { x: 317.0, y: -1376.7, z: 31.9, name: "Central Los Santos Medical Center" },
    { x: 1152.9, y: -1527.5, z: 34.8, name: "St Fiacre Hospital" }
];

// Medical items data
const medicalItems = [
    { name: "First Aid Kit", price: 70, heal: 100 },
    { name: "Bandage", price: 15, heal: 15 }
];

// Variables
let firstAidStationMarkers = [];
let currentMenu = null;
let nearFirstAidStation = false;
let currentStationIndex = -1;

// Create markers and blips for first aid stations
function createFirstAidStationMarkers() {
    firstAidStationLocations.forEach((location, index) => {
        // Create map blip
        const blip = mp.blips.new(61, new mp.Vector3(location.x, location.y, location.z), {
            name: location.name,
            scale: 0.8,
            color: 2,
            shortRange: true
        });

        // Create ground marker
        const marker = mp.markers.new(1, new mp.Vector3(location.x, location.y, location.z - 1.0), 1.0, {
            color: [0, 255, 0, 150],
            visible: true,
            dimension: 0
        });

        firstAidStationMarkers.push({ blip, marker, location, index });
    });

    console.log(`Created ${firstAidStationMarkers.length} first aid station markers`);
}

// Create Native UI menu for first aid station
function createFirstAidStationMenu(stationName) {
    if (currentMenu) {
        currentMenu.Close();
        currentMenu = null;
    }

    currentMenu = new NativeUI.Menu("First Aid Station", stationName, new NativeUI.Point(50, 50));
    
    // Add medical items to menu
    medicalItems.forEach((item, index) => {
        const menuItem = new NativeUI.UIMenuItem(
            item.name,
            `Price: $${item.price} | Restores: ${item.heal} health points`
        );
        menuItem.SetRightLabel(`$${item.price}`);
        currentMenu.AddItem(menuItem);
    });

    // Handle item selection
    currentMenu.ItemSelect.on((item, index) => {
        const selectedMedicine = medicalItems[index];
        mp.events.callRemote('buyMedicine', selectedMedicine.name, selectedMedicine.price, selectedMedicine.heal);
        currentMenu.Close();
        currentMenu = null;
    });

    // Handle menu close
    currentMenu.MenuClose.on(() => {
        currentMenu = null;
    });

    currentMenu.Open();
}

// Check if player is near any first aid station
function checkFirstAidStationProximity() {
    const playerPos = mp.players.local.position;
    
    for (let i = 0; i < firstAidStationLocations.length; i++) {
        const station = firstAidStationLocations[i];
        const distance = mp.game.system.vdist(
            playerPos.x, playerPos.y, playerPos.z,
            station.x, station.y, station.z
        );

        if (distance <= 1.0) {
            mp.gui.chat.show(false);
            if (!nearFirstAidStation) {
                nearFirstAidStation = true;
                currentStationIndex = i;
            }
            
            // Check for interaction key (E key)
            if (mp.game.controls.isControlJustPressed(0, 51)) { // E key
                createFirstAidStationMenu(station.name);
            }
            return;
        }
    }
    
    // Player is not near any first aid station
    if (nearFirstAidStation) {
        nearFirstAidStation = false;
        currentStationIndex = -1;
        
        // Close menu if player walked away from first aid station
        if (currentMenu) {
            currentMenu.Close();
            currentMenu = null;
        }
        mp.gui.chat.show(true);
    }
}

// Event handlers
mp.events.add('render', () => {
    if (firstAidStationMarkers.length > 0) {
        checkFirstAidStationProximity();
        
        // Show help text when near a first aid station (only if menu is not open)
        if (nearFirstAidStation && currentStationIndex >= 0 && !currentMenu) {
            const station = firstAidStationLocations[currentStationIndex];
            // Use the correct method for displaying help text
            mp.game.ui.setTextComponentFormat("STRING");
            mp.game.ui.addTextComponentSubstringPlayerName(`Press ~INPUT_CONTEXT~ to browse ${station.name}`);
            mp.game.ui.displayHelpTextFromStringLabel(0, false, true, -1);
        }
    }
});

// Response from server for medicine purchase
mp.events.add('medicinePurchaseResult', (success, message) => {
    console.log(`Medicine purchase result: ${success} - ${message}`);
    if (success) {
        mp.gui.chat.push(`!{lightgreen}${message}`);
    } else {
        mp.gui.chat.push(`!{red}${message}`);
    }
});

// Initialize when ready
mp.events.add('playerReady', () => {
    createFirstAidStationMarkers();
});

// Also initialize on script load for testing
setTimeout(() => {
    if (mp.players.local) {
        createFirstAidStationMarkers();
    }
}, 2000);

// Cleanup when disconnecting
mp.events.add('disconnect', () => {
    if (currentMenu) {
        currentMenu.Close();
        currentMenu = null;
    }
}); 