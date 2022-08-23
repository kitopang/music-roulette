const players = [];

function player_join(socket_id, username, lobby_code, top_tracks, score, round_num, lobby_info) {
    const player = { socket_id, username, lobby_code, top_tracks, score, round_num, lobby_info };

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

function increment_score(socket_id) {
    let player = get_player(socket_id);
    player.score++;
}

function increment_round(lobby_code) {
    all_players = populate_lobby(lobby_code);

    for (let i = 0; i < all_players.length; i++) {
        all_players[i].round_num++;
    }
}

function get_round(socket_id) {
    return get_player(socket_id).round_num;
}




module.exports = {
    player_join,
    player_leave,
    populate_lobby,
    get_player,
    increment_score,
    increment_round
};