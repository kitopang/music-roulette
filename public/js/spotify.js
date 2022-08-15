const SpotifyWebApi = require("spotify-web-api-node");

const spotify_data = [];

const spotify_api = new SpotifyWebApi();


function add_spotify(access_token, ip_address) {
    spotify_api.setAccessToken(access_token);

    spotify_api.getMyTopTracks()
        .then(function (data) {
            let topTracks = data.body.items;
            spotify_api.getMe()
                .then(function (data) {
                    console.log('Some information about the authenticated user', data.body);
                    spotify_item = { username: data.body.id, topTracks, ip_address }
                    console.log(spotify_item);
                    spotify_data.push(spotify_item);
                }, function (err) {
                    console.log('Something went wrong!', err);
                });



        }, function (err) {
            console.log('Something went wrong!', err);
        });
}

module.exports = {
    add_spotify
};