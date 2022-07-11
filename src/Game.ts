import { Scene, WebGLRenderer, MeshBasicMaterial, Mesh, PlaneGeometry, BoxGeometry, Clock, Vector3 } from "three";
import Player from "./Player";
import BulletShotController from "./BulletShotController";
import Enemy from "./Enemy";
import EnemyController from "./EnemyController";
import Room from "./Room";
import P2PMessage, { MessageType } from "./Message";
import Bullet from "./Bullet";
import RemotePlayer from "./RemotePlayer";

export default class Game {
    private canvas: HTMLCanvasElement;
    private room: Room;
    private clock = new Clock();
    private scene = new Scene();
    private renderer: WebGLRenderer;
    private player: Player;
    private bulletShotController: BulletShotController;
    private enemyController: EnemyController;
    private remotePlayers: Record<number, RemotePlayer> = {};

    constructor(room: Room) {
        this.room = room;

        let SCREEN_WIDTH = window.innerWidth;
        let SCREEN_HEIGHT = window.innerHeight;

        const canvas = document.getElementById("root");

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("Root is not canvas!!!");
        }

        this.canvas = canvas;
        this.renderer = new WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

        window.addEventListener("resize", () => {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;
            this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        });
    }

    public start() {
        const plane = new Mesh(new PlaneGeometry(10, 10), new MeshBasicMaterial({ color: 0xaaaaaa }));
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(0, 0, 0);
        this.scene.add(plane);

        this.bulletShotController = new BulletShotController(this.room);
        this.scene.add(this.bulletShotController);

        this.enemyController = new EnemyController(this.room);
        this.scene.add(this.enemyController);

        this.enemyController.events.addListener("move", (id: number, position: Vector3) => {
            const message = new P2PMessage(MessageType.MOVE_NPC);
            message.setProp("id", id).setProp("x", position.x).setProp("z", position.z);
            this.room.sendMessage(message);
            this.enemyController.move(id, position);
        });
        this.enemyController.events.addListener("die", (id: number) => {
            const message = new P2PMessage(MessageType.DIE_NPC).setProp("id", id);
            this.room.sendMessage(message);
        });

        this.player = new Player(this.canvas);
        this.scene.add(this.player);
        this.player.events.addListener("shot", (position, direction) => {
            const bullet = new Bullet(position, direction);
            this.bulletShotController.addBullet(bullet);

            const message = new P2PMessage(MessageType.SHOT);
            message.setProp("x", position.x).setProp("z", position.z).setProp("direction_x", direction.x).setProp("direction_z", direction.z);
            this.room.sendMessage(message);
        });
        this.player.events.addListener("move", (position, direction) => {
            const moveMessage = new P2PMessage(MessageType.MOVE);
            moveMessage.setProp("x", position.x).setProp("z", position.z).setProp("direction_x", direction.x).setProp("direction_z", direction.z);

            this.room.sendMessage(moveMessage);
        });

        const spawnMessage = new P2PMessage(MessageType.SPAWN);
        spawnMessage.setProp("x", 0).setProp("z", 0);
        this.room.sendMessage(spawnMessage);

        this.room.on("message", (playerId, message: P2PMessage) => {
            switch (message.type) {
                case MessageType.SPAWN:
                    this.spawnRemotePlayer(playerId, new Vector3(message.getProp("x"), 0, message.getProp("z")));
                    break;

                case MessageType.MOVE:
                    const position = new Vector3(message.getProp("x"), 0, message.getProp("z"));
                    if (!this.remotePlayers[playerId]) {
                        this.spawnRemotePlayer(playerId, position);
                        break;
                    }

                    this.remotePlayers[playerId].move(position, new Vector3(message.getProp("direction_x"), 0, message.getProp("direction_z")));
                    break;

                case MessageType.SHOT:
                    const bullet = new Bullet(new Vector3(message.getProp("x"), 0, message.getProp("z")), new Vector3(message.getProp("direction_x"), 0, message.getProp("direction_z")));
                    this.bulletShotController.addBullet(bullet);
                    break;

                case MessageType.SPAWN_NPC:
                    this.enemyController.spawn(message.getProp("id"), new Vector3(message.getProp("x"), 0, message.getProp("z")));
                    break;

                case MessageType.DIE_NPC:
                    this.enemyController.die(message.getProp("id"));

                    break;

                case MessageType.MOVE_NPC:
                    this.enemyController.move(message.getProp("id"), new Vector3(message.getProp("x"), 0, message.getProp("z")));
                    break;

                default:
                    break;
            }
        });

        if (this.room.getIsHost()) {
            let enemyId = 0;
            setInterval(() => {
                enemyId++;
                const position = new Vector3(Math.random() * 2, 0.5, Math.random() * 2);
                const message = new P2PMessage(MessageType.SPAWN_NPC);
                message.setProp("id", enemyId).setProp("x", position.x).setProp("z", position.z);
                this.room.sendMessage(message);
                this.enemyController.spawn(enemyId, position);
            }, 10000);
        }

        this.update();
    }

    private update = () => {
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        this.player.update(delta);
        this.enemyController.update(delta, [this.player, ...Object.values(this.remotePlayers)]);
        this.bulletShotController.update(delta, time, this.enemyController.getEnemies());

        requestAnimationFrame(this.update);

        this.renderer.render(this.scene, this.player.getCamera());
    };

    private spawnRemotePlayer(id: number, position: Vector3) {
        const player = new RemotePlayer();
        player.move(position, new Vector3(0, 0, 0));

        this.remotePlayers[id] = player;
        this.scene.add(player);
    }
}
