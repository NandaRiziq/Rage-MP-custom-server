// Wait for player to be ready
mp.events.add('playerReady', () => {
    // Disable auto-health regeneration
    mp.game.player.setHealthRechargeMultiplier(0.0);
    console.log("Native health regeneration disabled");
});