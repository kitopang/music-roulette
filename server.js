//https://www.youtube.com/watch?v=Bk90lT6ne3g
//https://www.youtube.com/watch?v=Bk90lT6ne3g

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
const { player_join, player_leave, populate_lobby, get_player } = require('./public/js/players');
const { add_spotify, get_spotify } = require('./public/js/spotify');

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

io.on('connection', socket => {
    var socketId = socket.id;
    var clientIp = socket.request.connection.remoteAddress;


    console.log("connected!");


    socket.on('join_lobby', (code) => {
        const spotify_item = get_spotify(clientIp);
        const player = player_join(socket.id, spotify_item.username, code, spotify_item.topTracks, 0);

        socket.join(player.lobby_code)
        console.log(player.username);


        socket.to(player.lobby_code).emit('message', spotify_item.username + ' has joined the lobby');
        socket.to(player.lobby_code).emit('join_lobby', player);
    })

    socket.on('initialize_lobby', (code) => {
        socket.emit('initialize_lobby', populate_lobby(code))
    })

    socket.on('get_self', (code) => {
        socket.emit('get_self', get_player(socket.id));
    })

    // socket.on('play_game' () => {

    // })

    socket.on('get_players', (code) => {
        socket.emit('get_players', populate_lobby(code));
    })

    socket.on('disconnect', () => {
        let player = get_player(socket.id);
        console.log(player);

        socket.to(player.lobby_code).emit('disconnect_player', player);
        socket.leave(player.lobby_code);
        player_leave(socket.id);
    });

    //Listen for start command
    socket.on('startgame', (start) => {
        let player = get_player(socket.id);
        io.in(player.lobby_code).emit('startgame', start);

        // Recursive call
        game_timer(0, 15, socket);
    })


})

function game_timer(round_number, total_rounds, socket) {
    //Base case
    if (round_number === total_rounds) {
        io.in(player.lobby_code).emit('end_game', '')
        return;
    }

    let player = get_player(socket.id);
    let lobby_info = choose_random_song(socket, round_number);
    io.in(player.lobby_code).emit('new_round', lobby_info);

    socket.on('select', (player_card) => {
        let object;
        console.log(player_card);

        if (player_card.innerText === lobby_info.player_chosen.username) {
            object = { correct: true, card: player_card }
            socket.emit('select', object);
        } else {
            object = { correct: false, card: player_card }
            socket.emit('select', object)
        }
    });

    let seconds = 0;
    const interval = setInterval(function () {
        console.log(seconds);
        seconds++;
        if (seconds === 8) {
            clearInterval(interval);
            round_number++;
            game_timer(round_number, total_rounds, socket);
        }
    }, 1000);
}

function choose_random_song(socket, round_number) {
    let lobby = get_player(socket.id).lobby_code;
    let current_players = populate_lobby(lobby);

    let random_player_index = Math.floor(Math.random() * current_players.length);
    let random_player = current_players[random_player_index];
    let random_song_index = Math.floor(Math.random() * random_player.top_tracks.length);
    let random_song = random_player.top_tracks[random_song_index];

    let song_data = { song_image_url: random_song.album.images[0].url, song_url: random_song.preview_url, title: random_song.name, artist: random_song.artists[0].name, player_chosen: random_player, current_players: current_players, round: round_number }

    return song_data;
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