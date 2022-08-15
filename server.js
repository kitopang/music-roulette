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
const { player_join, get_player } = require('./public/js/players');
const { add_spotify } = require('./public/js/spotify');

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

io.on('connection', socket => {
    var socketId = socket.id;
    var clientIp = socket.request.connection.remoteAddress;

    socket.on('join_lobby', (code) => {
        const player = player_join('kitop40',)
    })

    console.log(clientIp);

    socket.emit('message', 'Connected to music-roulette');

    socket.broadcast.emit('message', 'User has joined the lobby');

    socket.on('disconnect', () => {
        io.emit('message', 'User has left the lobby');
    });

    //Listen for start command
    socket.on('startgame', (start) => {
        io.emit('startgame', start)
    })
})


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
    redirectUri: 'http://localhost:3000/callback'
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