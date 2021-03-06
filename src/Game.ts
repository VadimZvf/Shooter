import { Scene, WebGLRenderer, MeshBasicMaterial, Mesh, PlaneGeometry, BoxGeometry, Clock, Vector3 } from "three";
import Player from "./Player";
import BulletShotController from "./BulletShotController";
import EnemyController from "./EnemyController";
import WaveController from "./WaveController";
import Room from "./Room";
import P2PMessage, { MessageType } from "./Message";
import Bullet from "./Bullet";
import RemotePlayer from "./RemotePlayer";
import EnemyTarget from "./EnemyTarget";
import Plane from "./Plane";

const RESPAWN_POINT = new Vector3(0, 0, 80);

export default class Game {
    private canvas: HTMLCanvasElement;
    private room: Room;
    private clock = new Clock();
    private scene = new Scene();
    private renderer: WebGLRenderer;
    private player: Player;
    private plane: Plane;
    private bulletShotController: BulletShotController;
    private enemyController: EnemyController;
    private waveController: WaveController;
    private enemyTarget: EnemyTarget;
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
        this.plane = new Plane();
        this.scene.add(this.plane);

        this.bulletShotController = new BulletShotController(this.room);
        this.scene.add(this.bulletShotController);

        this.enemyTarget = new EnemyTarget(RESPAWN_POINT);
        this.enemyTarget.events.addListener('die', () => {
            this.end();
        });
        this.scene.add(this.enemyTarget);

        this.enemyController = new EnemyController(this.room, this.enemyTarget);
        this.scene.add(this.enemyController);

        if (this.room.getIsHost()) {
            this.enemyController.events.addListener('spawn', (id: number, position: Vector3) => {
                const message = new P2PMessage(MessageType.NPC_SPAWN);
                message.setProp("id", id).setProp("x", position.x).setProp("z", position.z);
                this.room.sendMessage(message);
            });

            this.waveController = new WaveController(this.enemyController);
            this.waveController.start();
        }

        this.enemyController.events.addListener("move", (id: number, position: Vector3) => {
            const message = new P2PMessage(MessageType.NPC_MOVE);
            message.setProp("id", id).setProp("x", position.x).setProp("z", position.z);
            this.room.sendMessage(message);
            this.enemyController.move(id, position);
        });
        this.enemyController.events.addListener("die", (id: number) => {
            const message = new P2PMessage(MessageType.NPC_DIE).setProp("id", id);
            this.room.sendMessage(message);
        });

        this.player = new Player(this.canvas, RESPAWN_POINT);
        this.scene.add(this.player);
        this.player.events.addListener("shot", (position, direction) => {
            const bullet = new Bullet(position, direction);
            this.bulletShotController.addBullet(bullet);

            const message = new P2PMessage(MessageType.PLAYER_SHOT);
            message.setProp("x", position.x).setProp("z", position.z).setProp("direction_x", direction.x).setProp("direction_z", direction.z);
            this.room.sendMessage(message);
        });
        this.player.events.addListener("move", (position, direction) => {
            const moveMessage = new P2PMessage(MessageType.PLAYER_MOVE);
            moveMessage.setProp("x", position.x).setProp("z", position.z).setProp("direction_x", direction.x).setProp("direction_z", direction.z);

            this.room.sendMessage(moveMessage);
            this.plane.setCenter(position);
        });

        const spawnMessage = new P2PMessage(MessageType.PLAYER_SPAWN);
        spawnMessage.setProp("x", RESPAWN_POINT.x).setProp("z", RESPAWN_POINT.z);
        this.room.sendMessage(spawnMessage); // ?? ??????????????! *(o_o)*

        this.room.on("message", (playerId, message: P2PMessage) => {
            switch (message.type) {
                case MessageType.PLAYER_SPAWN:
                    this.spawnRemotePlayer(playerId, new Vector3(message.getProp("x"), 0, message.getProp("z")));
                    break;

                case MessageType.PLAYER_MOVE:
                    const position = new Vector3(message.getProp("x"), 0, message.getProp("z"));
                    if (!this.remotePlayers[playerId]) {
                        this.spawnRemotePlayer(playerId, position);
                        break;
                    }

                    this.remotePlayers[playerId].move(position, new Vector3(message.getProp("direction_x"), 0, message.getProp("direction_z")));
                    break;

                case MessageType.PLAYER_SHOT:
                    const bullet = new Bullet(new Vector3(message.getProp("x"), 0, message.getProp("z")), new Vector3(message.getProp("direction_x"), 0, message.getProp("direction_z")));
                    this.bulletShotController.addBullet(bullet);
                    break;

                case MessageType.NPC_SPAWN:
                    this.enemyController.spawn(message.getProp("id"), new Vector3(message.getProp("x"), 0, message.getProp("z")));
                    break;

                case MessageType.NPC_DIE:
                    this.enemyController.die(message.getProp("id"));

                    break;

                case MessageType.NPC_MOVE:
                    this.enemyController.move(message.getProp("id"), new Vector3(message.getProp("x"), 0, message.getProp("z")));
                    break;

                default:
                    break;
            }
        });

        this.update();
    }

    private update = () => {
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        this.plane.update(time);
        this.player.update(delta);
        this.enemyController.update(delta, time, [this.player, ...Object.values(this.remotePlayers)]);
        this.bulletShotController.update(delta, time, this.enemyController.getEnemies());

        requestAnimationFrame(this.update);

        this.renderer.render(this.scene, this.player.getCamera());
    };

    private end() {
        this.clock.stop();
        console.log('??????????!');
    }

    private spawnRemotePlayer(id: number, position: Vector3) {
        const player = new RemotePlayer();
        player.move(position, new Vector3(0, 0, 0));

        this.remotePlayers[id] = player;
        this.scene.add(player);
    }
}
