// Create a new browser instance for the speedometer
const speedometerBrowser = mp.browsers.new('package://ui/speedometer.html');

// Variable to store the last speed to avoid unnecessary updates
let lastSpeed = 0;

// Event handler for player entering a vehicle
mp.events.add('playerEnterVehicle', (vehicle, seat) => {
    // Show the speedometer UI
    speedometerBrowser.execute('show();');
});

// Event handler for player leaving a vehicle
mp.events.add('playerLeaveVehicle', (vehicle, seat) => {
    // Hide the speedometer UI
    speedometerBrowser.execute('hide();');
});

// Render event to continuously update the speed
mp.events.add('render', () => {
    const player = mp.players.local;

    // Check if the player is in any vehicle
    if (player.vehicle) {
        // Get the vehicle's speed (in m/s) using the getSpeed() native
        const currentSpeed = player.vehicle.getSpeed();

        // Convert speed to KM/H and round it
        const speedKmh = Math.round(currentSpeed * 3.6);

        // Update the UI only if the speed has changed
        if (speedKmh !== lastSpeed) {
            lastSpeed = speedKmh;
            speedometerBrowser.execute(`updateSpeed(${lastSpeed});`);
        }
    }
});
