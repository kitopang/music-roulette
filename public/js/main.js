const start_game_button = document.querySelector("#start_button");
const lobby_div = document.querySelector('#lobby');
const round_number_div = document.querySelector('#round_number');
const round_div = document.querySelector('#round');
const joined_players_div = document.querySelector('#joined_players_list');
const lobby_number = document.querySelector('#lobby_number');

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
    if (start === 'false') {
        lobby_div.style.opacity = '0';

        setTimeout(function () {
            lobby_div.classList.add('d-none');
            render_next_round();
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

function render_next_round() {
    round_number_div.classList.remove('d-none');

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

start_game_button.addEventListener("click", () => {
    socket.emit('startgame', 'true');
    console.log("emits")
});

const myAudio = document.createElement('audio');

if (myAudio.canPlayType('audio/mpeg')) {
    myAudio.setAttribute('src', 'https://p.scdn.co/mp3-preview/022b6aef48436fa9ffdebf761bde4a719d686dc3?cid=618a3849a7234a949622b2722ba8bfdb');
}

myAudio.play();

