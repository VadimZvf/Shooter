import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    MeshBasicMaterial,
    Mesh,
    PlaneGeometry,
    Clock,
    Vector3,
} from "three";
import Player from "./Player";
import BulletShotController from "./BulletShotController";
import Enemy from "./Enemy";
import Connection from "./Connection";

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

async function connect() {
    const conection = new Connection();
    await conection.init();

    conection.joinRoom('wow');
    conection.subscribeMessages((userId, data) => {
        console.log(userId, data);
    });

    document.addEventListener('click', () => {
        conection.sendMessage({data: 'Wow!'});
    });
}

function init() {
    document.addEventListener('click', () => {
        connect();
    }, {once: true});

    const canvas = document.getElementById("root");

    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Root is not canvas!!!");
    }

    const clock = new Clock();
    const scene = new Scene();
    const camera = new PerspectiveCamera(
        90,
        SCREEN_WIDTH / SCREEN_HEIGHT,
        0.1,
        1000
    );
    camera.position.z = 10;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

    const renderer = new WebGLRenderer({ canvas });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    const bulletShotController = new BulletShotController();
    scene.add(bulletShotController);

    let enemies: Array<Enemy> = [];

    const user = new Player(canvas);
    scene.add(user);
    user.subscribeShot((bullet) => {
        bulletShotController.addBullet(bullet);
    });
    user.subscribeMovement((position) => {
        enemies.forEach((enemy) => {
            enemy.setTargetPosition(position);
        });
    });

    const plane = new Mesh(
        new PlaneGeometry(10, 10),
        new MeshBasicMaterial({ color: 0xaaaaaa })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, 0, 0);
    scene.add(plane);

    setInterval(() => {
        const newEnemy = new Enemy(
            new Vector3(Math.random() * 3, 0, Math.random() * 3)
        );
        newEnemy.subscribeDeath(() => {
            const index = enemies.indexOf(newEnemy);
            if (index > -1) {
                enemies.splice(index, 1);
                scene.remove(newEnemy);
            }
        });

        scene.add(newEnemy);
        enemies.push(newEnemy);
    }, 10000);

    function animate() {
        const delta = clock.getDelta();

        user.update(delta);
        bulletShotController.update(delta, enemies);
        enemies.forEach((enemy) => {
            enemy.update(delta);
        });

        requestAnimationFrame(animate);

        renderer.render(scene, user.getCamera());
    }

    animate();
}

init();
