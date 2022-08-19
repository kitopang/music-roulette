const start_game_button = document.querySelector("#start_button");
const lobby_div = document.querySelector('#lobby');
const round_number_div = document.querySelector('#round_number');
const round_div = document.querySelector('#round');
const joined_players_div = document.querySelector('#joined_players_list');
const lobby_number = document.querySelector('#lobby_number');
const player_choices_div = document.querySelector('#player_choices');
const album_image = document.querySelector('#album_image');
const song_title = document.querySelector('#song_title');
const song_artist = document.querySelector('#song_artist');


const lobby = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

lobby_number.innerText = 'Lobby: ' + lobby.code;
console.log(lobby.code);

const socket = io();

socket.on('message', message => {
    console.log(message);
})

socket.on('disconnect_player', player => {
    remove_player_from_lobby(player);
})

socket.emit('join_lobby', lobby.code);

socket.on('join_lobby', player => {
    add_player_to_lobby(player);
})

socket.emit('initialize_lobby', lobby.code)

socket.on('initialize_lobby', players => {
    for (player of players) {
        add_player_to_lobby(player);
    }
})

// socket.emit('get_self', lobby.code)

// socket.on('get_self', self_player => {
//     add_player_to_lobby(self_player);
// })

socket.on('startgame', start => {
    if (start === 'true') {
        lobby_div.style.opacity = '0';

        setTimeout(function () {
            lobby_div.classList.add('d-none');
            initialize_game();
        }, 500);
    }

    console.log(start)
})

function add_player_to_lobby(player) {
    let entry = document.createElement('li');
    entry.classList.add('list-group-item');
    entry.classList.add('bg-transparent');
    entry.classList.add('border');
    entry.classList.add('border-light');
    entry.classList.add('text-light');
    entry.innerText = player.username;

    joined_players_div.appendChild(entry);
}

function remove_player_from_lobby(player) {
    const player_elements = joined_players_div.children;

    for (let i = 0; i < player_elements.length; i++) {
        if (player_elements[i].innerText === player.username) {
            player_elements[i].remove();
        }
    }
}

function initialize_game() {
    const total_rounds = 16;
    const time_per_round = 30;


    play_game(0, total_rounds);
}

function play_game(round_number, total_rounds) {
    let player_cards;
    let seconds = 0;

    if (round_number === total_rounds) {
        return;
    }

    if (round_number === 0) {
        player_cards = render_next_round();
    } else {
        show_leaderboard();
        player_cards = render_next_round();
    }

    const interval = setInterval(function () {
        console.log(seconds);
        seconds++;
        if (seconds === 30) {
            clearInterval(interval);
            round_number++;
            play_game(round_number, total_rounds);
        }
    }, 1000);
}

function show_leaderboard() {

}

function render_next_round() {
    round_number_div.classList.remove('d-none');
    populate_players_and_music();

    setTimeout(function () {
        round_number_div.style.opacity = '100';

        setTimeout(function () {
            round_number_div.style.opacity = '0';

            setTimeout(function () {
                round_number_div.classList.add('d-none');
                round_div.classList.remove('d-none');

                setTimeout(function () {
                    round_div.style.opacity = '100';
                }, 500)
            }, 500)
        }, 1000);
    }, 500);
}

function populate_players_and_music() {
    socket.emit('get_players', lobby.code);

    socket.on('get_players', current_players => {
        choose_random_song(current_players);
        let current_row;
        index = 0;
        for (let i = 0; i < current_players.length; i++) {
            let player = current_players[i];

            if ((index % 2) === 0) {
                current_row = document.createElement("div");
                current_row.classList.add('row', 'mt-3');

                let entry = document.createElement("div");
                entry.classList.add('bg-transparent', 'border', 'border-light', 'col', 'p-4', 'mx-4', 'text-center')
                entry.setAttribute('id', 'player_card')
                let text = document.createElement("h4");
                text.innerText = player.username;
                text.classList.add('text-light');

                player_choices_div.append(current_row);
                current_row.append(entry);
                entry.append(text);
            } else {
                let entry = document.createElement("div");
                entry.classList.add('bg-transparent', 'border', 'border-light', 'col', 'p-4', 'mx-4', 'text-center')
                entry.setAttribute('id', 'player_card')
                let text = document.createElement("h4");
                text.innerText = player.username;
                text.classList.add('text-light');

                current_row.append(entry);
                entry.append(text);
            }

            index++;
        }

        let player_cards = document.querySelectorAll('#player_card');
        for (let index = 0; index < player_cards.length; index++) {
            player_cards[index].addEventListener("click", () => {
                console.log("clicked!")
            });
        }
    })
}

function choose_random_song(current_players) {
    let combined_array = [];

    for (let index = 0; index < current_players.length; index++) {
        combined_array = combined_array.concat(current_players[index].top_tracks);
    }

    random_num = Math.floor(Math.random() * combined_array.length);
    random_song = combined_array[random_num];

    let song_image_url = random_song.album.images[0].url;
    let song_preview_url = random_song.preview_url;
    let title = random_song.name;
    let artist = random_song.artists[0].name;

    album_image.setAttribute('src', song_image_url);
    song_title.innerText = title;
    song_artist.innerText = artist;


}


start_game_button.addEventListener("click", () => {
    socket.emit('startgame', 'true');
    console.log("emits")
});

// const myAudio = document.createElement('audio');

// if (myAudio.canPlayType('audio/mpeg')) {
//     myAudio.setAttribute('src', 'https://p.scdn.co/mp3-preview/022b6aef48436fa9ffdebf761bde4a719d686dc3?cid=618a3849a7234a949622b2722ba8bfdb');
// }

// myAudio.play();

