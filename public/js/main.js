const socket = io();

socket.on('message', message => {
    console.log(message);
})

const start_game_button = document.querySelector("#start_button");

start_game_button.addEventListener("click", () => {
    socket.emit('startgame', 'true');
    console.log("emits")
}); 