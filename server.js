//https://www.youtube.com/watch?v=Bk90lT6ne3g
//https://www.youtube.com/watch?v=Bk90lT6ne3g

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server)


const ready_players = new Set();
const total_rounds = 15;

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
const { player_join, player_leave, get_player } = require('./public/js/players');
const { add_spotify, get_spotify } = require('./public/js/spotify');
const { new_lobby, lobby_leave, get_lobby, sort_players } = require('./public/js/lobby');

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

io.on('connection', socket => {
    // let interval;
    var socketId = socket.id;
    var clientIp = socket.request.connection.remoteAddress;

    console.log("connected!");

    socket.on('join_lobby', (code) => {
        const spotify_item = get_spotify(clientIp);
        const player = player_join(socket.id, spotify_item.username, code, spotify_item.topTracks, 0, undefined);

        new_lobby(code, player, 1);

        socket.join(player.lobby_code)
        console.log(player.username);

        socket.to(player.lobby_code).emit('message', spotify_item.username + ' has joined the lobby');
        socket.to(player.lobby_code).emit('join_lobby', player);
    })

    socket.on('initialize_lobby', (code) => {
        socket.emit('initialize_lobby', get_lobby(code).players)
    })

    socket.on('disconnect', () => {
        console.log("socket! " + socket.id);
        let player = get_player(socket.id);

        if (player) {
            let lobby = get_lobby(player.lobby_code);


            socket.to(player.lobby_code).emit('disconnect_player', player);
            socket.leave(player.lobby_code);
            lobby_leave(lobby, player)
            player_leave(socket.id);
        }
    });

    socket.on('ready', (username) => {
        let player = get_player(socket.id);
        let lobby = get_lobby(player.lobby_code);

        lobby.ready_players++;

        if (username.trim() === lobby.music_info.player_chosen.username.trim()) {
            console.log("TRUE");
            let score = Math.floor((1 - ((lobby.time_elapsed / lobby.max_time) / 2)) * 1000);
            player.score += score;
            socket.emit('select', true);
        } else {
            player.score += 0;
            socket.emit('select', false);
        }

        // console.log("ONE " + lobby.ready_players);
        // console.log("two " + lobby.players.length);
        if (lobby.ready_players === lobby.players.length) {
            initiate_next_round(lobby, player, socket);
        }
    });

    //Listen for start command
    socket.on('startgame', (start) => {
        let player = get_player(socket.id);
        let lobby = get_lobby(player.lobby_code);
        io.in(player.lobby_code).emit('startgame', start);

        // Recursive call
        game_timer(lobby, socket);
    })


})

function game_timer(lobby, socket) {
    let seconds = 0;
    let player = get_player(socket.id);
    let music_info = choose_random_song(lobby.players);
    let first_round = lobby.current_round === 0;

    //Base case
    if (lobby.current_round === lobby.max_rounds) {
        io.in(player.lobby_code).emit('end_game', lobby)
        return;
    }

    io.in(player.lobby_code).emit('new_round', music_info, lobby.players, first_round);

    let interval = setInterval(function () {
        console.log(seconds);
        lobby.time_elapsed = seconds;
        seconds++;
        if (seconds === lobby.max_time) {
            initiate_next_round(lobby, player, socket);
        }
    }, 1000);

    lobby.interval = interval;
    lobby.music_info = music_info;
}

function initiate_next_round(lobby, player, socket) {
    sort_players(lobby);
    lobby.ready_players = 0;
    lobby.current_round++;

    clearInterval(lobby.interval);
    lobby.time_elapsed = 0;

    io.in(player.lobby_code).emit('show_results', lobby);

    setTimeout(function () {
        game_timer(lobby, socket);
    }, 3000);
}

function choose_random_song(current_players) {
    let random_player_index = Math.floor(Math.random() * current_players.length);
    let random_player = current_players[random_player_index];
    let random_song_index = Math.floor(Math.random() * random_player.top_tracks.length);
    let random_song = random_player.top_tracks[random_song_index];

    let music_info = { song_image_url: random_song.album.images[0].url, song_url: random_song.preview_url, title: random_song.name, artist: random_song.artists[0].name, player_chosen: random_player }
    return music_info;
}


var SpotifyWebApi = require('spotify-web-api-node');
const { isObject } = require('util');

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
];

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: '618a3849a7234a949622b2722ba8bfdb',
    clientSecret: '4037f89d0c0f464fa173e62f9fa247fa',
    redirectUri: 'http://192.168.1.202:3000/callback'
});

app.get('/spotifylogin', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;
    const ip = req.socket.remoteAddress;
    console.log('added ip ' + ip)

    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    //res.render('home_page.ejs')

    spotifyApi
        .authorizationCodeGrant(code)
        .then(data => {
            const access_token = data.body['access_token'];
            const refresh_token = data.body['refresh_token'];
            const expires_in = data.body['expires_in'];

            spotifyApi.setAccessToken(access_token);
            spotifyApi.setRefreshToken(refresh_token);

            console.log('access_token:', access_token);
            console.log('refresh_token:', refresh_token);

            console.log(
                `Sucessfully retreived access token. Expires in ${expires_in} s.`
            );

            add_spotify(access_token, ip)
            res.render('home_page.ejs')


            setInterval(async () => {
                const data = await spotifyApi.refreshAccessToken();
                const access_token = data.body['access_token'];

                console.log('The access token has been refreshed!');
                console.log('access_token:', access_token);
                spotifyApi.setAccessToken(access_token);
            }, expires_in / 2 * 1000);
        })
        .catch(error => {
            console.error('Error getting Tokens:', error);
            res.send(`Error getting Tokens: ${error}`);
        });

});


server.listen(PORT, '0.0.0.0', () => {
    console.log("Open on port: " + PORT)
})