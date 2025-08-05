mp.events.add('getPos', () => {
    const player_pos = mp.players.local.position;
    const message = `Current position: x: ${player_pos.x.toFixed(1)}, y: ${player_pos.y.toFixed(1)}, z: ${player_pos.z.toFixed(1)}`;
    // Send position back to server
    mp.events.callRemote('sendPositionToServer', player_pos.x, player_pos.y, player_pos.z);
});