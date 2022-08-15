const start_game_button = document.querySelector("#start_button");
const lobby_div = document.querySelector('#lobby');
const round_number_div = document.querySelector('#round_number');
const round_div = document.querySelector('#round');

const lobby = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

console.log(lobby.code);

const socket = io();

socket.on('message', message => {
    console.log(message);
})

socket.emit('join_lobby', lobby.code);

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



