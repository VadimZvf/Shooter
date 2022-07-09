import Connection from "./Connection";
import Game from "./Game";

function init() {
    document.getElementById('login_interface').addEventListener('submit', async (event) => {
        event.preventDefault();
        const roomNameNode = document.getElementById('room_name_input');

        if (!(roomNameNode instanceof HTMLInputElement)) {
            throw new Error('Cannot find room name input');
        }

        const conection = new Connection();
        await conection.init();
        await conection.joinRoom(roomNameNode.value);

        const game = new Game(conection);
        game.start();

        document.body.removeChild(document.getElementById('login_interface'));
    });
}

init();
