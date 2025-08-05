const moneyHudBrowser = mp.browsers.new('package://ui/hud.html');

mp.events.add('updateHUD', (data) => {
    if (moneyHudBrowser) {
        const playerData = JSON.parse(data);
        if (playerData.money !== undefined) {
            moneyHudBrowser.execute(`updateMoney(${playerData.money});`);
        }
        if (playerData.name !== undefined) {
            moneyHudBrowser.execute(`updateName('${playerData.name}');`);
        }
        if (playerData.hunger !== undefined) {
            moneyHudBrowser.execute(`updateHunger(${playerData.hunger});`);
        }
        if (playerData.health !== undefined) {
            moneyHudBrowser.execute(`updateHealth(${playerData.health});`);
        }
    }
});
