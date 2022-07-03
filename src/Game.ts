import { Scene, WebGLRenderer, MeshBasicMaterial, Mesh, PlaneGeometry, BoxGeometry, Clock, Vector3 } from "three";
import Player from "./Player";
import BulletShotController from "./BulletShotController";
import Enemy from "./Enemy";
import Connection from "./Connection";
import P2PMessage, { MessageType } from "./Connection/P2PMessage";

type IRemotePlayers = Record<number, Mesh>;

export default class Game {
    connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    public start() {
        let SCREEN_WIDTH = window.innerWidth;
        let SCREEN_HEIGHT = window.innerHeight;

        const canvas = document.getElementById("root");

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("Root is not canvas!!!");
        }

        const clock = new Clock();
        const scene = new Scene();

        const renderer = new WebGLRenderer({ canvas });
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

        window.addEventListener("resize", () => {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;
            renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        });

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

            const moveMessage = new P2PMessage(MessageType.MOVE);
            moveMessage.setProp('x', position.x).setProp('z', position.z);

            this.connection.sendMessage(moveMessage);
        });

        const spawnMessage = new P2PMessage(MessageType.SPAWN);
        spawnMessage.setProp('x', 0).setProp('z', 0);
        this.connection.sendMessage(spawnMessage);

        const remotePlayers: IRemotePlayers = {};

        this.connection.subscribeMessages((playerId, message) => {
            switch (message.type) {
                case MessageType.SPAWN:
                    const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0xbbbb00 }));
                    mesh.position.y = 0.5;
                    mesh.position.x = message.getProp('x');
                    mesh.position.z = message.getProp('z');

                    remotePlayers[playerId] = mesh;
                    scene.add(mesh);

                    break;

                case MessageType.MOVE:
                    if (!remotePlayers[playerId]) {
                        const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0xbbbb00 }));
                        mesh.position.y = 0.5;
    
                        remotePlayers[playerId] = mesh;
                        scene.add(mesh);
                    }

                    remotePlayers[playerId].position.x = message.getProp('x');
                    remotePlayers[playerId].position.z = message.getProp('z');
                    break;

                default:
                    break;
            }
        });

        const plane = new Mesh(new PlaneGeometry(10, 10), new MeshBasicMaterial({ color: 0xaaaaaa }));
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(0, 0, 0);
        scene.add(plane);

        setInterval(() => {
            const newEnemy = new Enemy(new Vector3(Math.random() * 3, 0, Math.random() * 3));
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
}
