import Room from "./Room";
import Game from "./Game";

function init() {
    document.getElementById('login_interface').addEventListener('submit', async (event) => {
        event.preventDefault();
        const roomNameNode = document.getElementById('room_name_input');

        if (!(roomNameNode instanceof HTMLInputElement)) {
            throw new Error('Cannot find room name input');
        }

        const room = new Room(roomNameNode.value);
        await room.connect();

        const game = new Game(room);
        game.start();

        document.body.removeChild(document.getElementById('login_interface'));
    });
}

init();
