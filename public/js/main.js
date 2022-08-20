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
const play_button = document.querySelector('#play_button');
const myAudio = document.createElement('audio');

let song_url;
let chosen_player;
let selected_card;
let choice_is_correct;


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
        }, 500);
    }

    console.log(start)
})

socket.on('new_round', lobby_data => {
    render_next_round(lobby_data);
});

socket.on('select', (object) => {
    let player_card = object.card;
    let correct = object.correct;

    console.log(player_card);
    console.log(correct);

    if (player_card.value === "false") {
        player_card.classList.remove('bg-transparent', 'border-light');
        player_card.classList.add('bg-light', 'border-dark');
        text.classList.remove('text-light');
        text.classList.add('text-dark');
        player_card.value = "true";
    } else {
        player_card.classList.remove('bg-light', 'border-dark');
        player_card.classList.add('bg-transparent', 'border-light');
        text.classList.remove('text-dark');
        text.classList.add('text-light');
        player_card.value = "false";
    }

    selected_card = player_card;
    if (correct) {
        choice_is_correct = true;
    } else {
        choice_is_correct = false;
    }
});

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


function show_leaderboard() {

}

function render_next_round(lobby_data) {
    round_div.classList.add('d-none');

    while (player_choices_div.firstChild) {
        player_choices_div.removeChild(player_choices_div.firstChild);
    }

    round_number_div.classList.remove('d-none');
    play_button.value = "false";
    myAudio.pause();
    populate_players(lobby_data);
    set_random_song(lobby_data);

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

function populate_players(lobby_data) {
    let current_players = lobby_data.current_players;

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
            entry.setAttribute('value', 'false');
            let text = document.createElement("h4");
            text.innerText = player.username;
            text.classList.add('text-light');

            player_choices_div.append(current_row);
            current_row.append(entry);
            entry.append(text);
        } else {
            let entry = document.createElement("div");
            entry.classList.add('bg-transparent', 'border', 'border-light', 'col', 'p-4', 'mx-4', 'text-center')
            entry.setAttribute('id', 'player_card');
            entry.setAttribute('value', 'false');
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
        let player_card = player_cards[index];
        let text = player_card.firstChild;

        player_card.addEventListener("click", () => {
            console.log(player_card);
            socket.emit('select', { card: player_card });

        });

    }

}

function set_random_song(song_data) {
    album_image.setAttribute('src', song_data.song_image_url);
    song_title.innerText = song_data.title;
    song_artist.innerText = song_data.artist;
    song_url = song_data.song_url;
}


play_button.addEventListener("click", () => {
    myAudio.setAttribute('src', song_url);

    if (play_button.value === "false") {
        myAudio.play();
        play_button.value = "true";
    } else {
        myAudio.pause();
        play_button.value = "false";
    }
})

start_game_button.addEventListener("click", () => {
    socket.emit('startgame', 'true');
    console.log("emits")
});



// const myAudio = document.createElement('audio');

// if (myAudio.canPlayType('audio/mpeg')) {
//     myAudio.setAttribute('src', 'https://p.scdn.co/mp3-preview/022b6aef48436fa9ffdebf761bde4a719d686dc3?cid=618a3849a7234a949622b2722ba8bfdb');
// }

// myAudio.play();

