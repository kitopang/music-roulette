const lobbies = [];

function new_lobby(code, player) {
    let existing_lobby = get_lobby(code);

    if (existing_lobby) {
        existing_lobby.players.push(player);
    } else {
        const lobby = { code, info: undefined, interval: undefined, players: [], ready_players: 0, current_round: 0, max_rounds: 15, music_info: undefined };
        lobby.players.push(player);
        lobbies.push(lobby);
    }
}

function get_lobby(code) {
    return lobbies.find(lobby => lobby.code === code);
}

function update_lobby_info(lobby, lobby_info, interval) {
    lobby.info = lobby_info;
    lobby.interval = interval;
}

function increment_ready_players(lobby) {
    lobby.ready_players++;
}

function reset_ready_players(lobby) {
    lobby.ready_players = 0;
}

function populate_lobby(lobby) {
    return lobby.players;
}




module.exports = {
    new_lobby,
    get_lobby,
    update_lobby_info,
    increment_ready_players,
    reset_ready_players,
    populate_lobby
};