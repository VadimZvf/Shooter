import Connection from "./Connection";
import Game from "./Game";

async function connect() {
    const conection = new Connection();
    await conection.init();

    document.getElementById('login_interface').addEventListener('submit', async (event) => {
        event.preventDefault();
        const roomNameNode = document.getElementById('room_name_input');

        if (!(roomNameNode instanceof HTMLInputElement)) {
            throw new Error('Cannot find room name input');
        }

        document.body.removeChild(document.getElementById('login_interface'));

        await conection.joinRoom(roomNameNode.value);

        const game = new Game(conection);

        game.start();
    }, {once: true});

}

function init() {
    document.addEventListener(
        "click",
        () => {
            connect();
        },
        { once: true }
    );
}

init();
