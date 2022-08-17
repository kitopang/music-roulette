const players = [];

function player_join(socket_id, username, lobby_code, top_tracks) {
    const player = { socket_id, username, lobby_code, top_tracks };

    players.push(player);

    console.log(players);

    return player;
}

function player_leave(socket_id) {
    const index = players.findIndex(player => player.socket_id === socket_id);

    if (index !== -1) {
        players.splice(index, 1);
    }
}

function populate_lobby(lobby_code) {
    return players.filter(player => player.lobby_code === lobby_code);
}

function get_player(socket_id) {
    return players.find(player => player.socket_id === socket_id);
}


module.exports = {
    player_join,
    player_leave,
    populate_lobby,
    get_player
};