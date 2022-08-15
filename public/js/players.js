const players = [];

function player_join(username, lobby, top_tracks) {
    const player = { username, lobby, top_tracks };

    players.push(player);

    return player;
}

function get_player(username) {
    return players.find(player => player.username === username);
}

module.exports = {
    player_join,
    get_player
};