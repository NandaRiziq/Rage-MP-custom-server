exports = function(menu) {
    // Add player in the table.
    mp.events.add('playerJoinedServer', (id, name) => {
        menu.execute(`addPlayerInTheTable('${id}', '${name}');`);
    });

    // Remove player from the table.
    mp.events.add('playerLeavedServer', (id) => {
        menu.execute(`removePlayerInTheTable('${id}');`);
    });

    // Hide vehicle buttons, when player exits vehicle (triggered from server, will be fixed on the client-side).
    function hideVehicleButtons() {
        menu.execute('$("#vehicle_buttons").fadeOut(250);');
    }
    mp.events.add('playerExitVehicle', hideVehicleButtons);
    mp.events.add('hideVehicleButtons', hideVehicleButtons);

    // Show vehicle buttons, when player enters vehicle (triggered from server, will be fixed on the client-side).
    mp.events.add('playerEnteredVehicle', () => {
        menu.execute('$("#vehicle_buttons").fadeIn(250);');
    });

    // Change chat activity.
    mp.events.add('chatInputActive', () => {
        menu.execute(`setChatActive(true);`);
    });

    mp.events.add('chatInputInactive', () => {
        menu.execute(`setChatActive(false);`);
    });

    // Getting data from CEF.
    mp.events.add('cefData', function() {
        // CEF data.
        if (arguments[0] !== 'client_color')
            mp.events.callRemote('clientData', JSON.stringify(arguments));
        // Vehicle color or neon.
        else {
            let color = JSON.parse(arguments[2]);
            switch (arguments[1]) {
            // Primary color.
            case 'primary':
                mp.players.local.vehicle.setCustomPrimaryColour(color.r, color.g, color.b);

                break;
            // Secondary color.
            case 'secondary':
                mp.players.local.vehicle.setCustomSecondaryColour(color.r, color.g, color.b);

                break;
            // Neon.
            case 'neon':
                // If vehicle neon disabled - enable it.
                if (!mp.players.local.vehicle.isNeonLightEnabled(0)) {
                    for (let i = 0; i < 4; i++) {
                        mp.players.local.vehicle.setNeonLightEnabled(i, true);
                    }
                }

                // Set neon color.
                mp.players.local.vehicle.setNeonLightsColour(color.r, color.g, color.b);

                break;
            }
        }
    });

    mp.events.add('teleportToWaypoint', () => {
        const waypoint = mp.game.ui.getFirstBlipInfoId(8); // 8 is for waypoint
        if (mp.game.ui.doesBlipExist(waypoint)) {
            const waypointPos = mp.game.ui.getBlipInfoIdCoord(waypoint);
            if (waypointPos) {
                let zCoord;
                let found = false;
                for (let i = 1000; i >= 0; i -= 25) {
                    mp.game.streaming.requestCollisionAtCoord(waypointPos.x, waypointPos.y, i);
                    mp.game.wait(0);
                    zCoord = mp.game.gameplay.getGroundZFor3dCoord(waypointPos.x, waypointPos.y, i, false, false);
                    if (zCoord !== 0) {
                        found = true;
                        break;
                    }
                }

                if (found) {
                    mp.players.local.position = new mp.Vector3(waypointPos.x, waypointPos.y, zCoord + 1.0);
                } else {
                    // Fallback if no ground is found
                    zCoord = mp.game.gameplay.getGroundZFor3dCoord(waypointPos.x, waypointPos.y, 1000.0, false, false);
                    mp.players.local.position = new mp.Vector3(waypointPos.x, waypointPos.y, zCoord + 1.0);
                }
            } else {
                mp.gui.chat.push('Failed to retrieve waypoint position');
            }
        } else {
            mp.gui.chat.push('Please set a waypoint on the map first');
        }
    });
};

mp.events.add('setPlayerHealth', (newHealth) => {
    // Ensure client accepts the server's health value
    mp.players.local.setHealth(100 + newHealth);
});