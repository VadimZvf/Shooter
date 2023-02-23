import { Scene, WebGLRenderer, Clock, Vector3 } from 'three';
import Player from './Player';
import PlayerController from './Player/PlayerController';
import BulletShotController from './BulletShotController';
import EnemyController from './EnemyController';
import ServerEnemyController from './ServerEnemyController';
import ServerBulletShotController from './ServerBulletShotController';
import WaveController from './WaveController';
import Room from './Room';
import P2PMessage, { MessageType } from './Message';
import Bullet from './Bullet';
import RemotePlayer from './RemotePlayer';
import EnemyTarget from './EnemyTarget';
import Plane from './Plane';
import { addScreenSizeListener } from './browserUtils/screenSize';

const RESPAWN_POINT = new Vector3(0, 0, 80);
let ENEMY_ID = 1;

function createId(): number {
    return ++ENEMY_ID;
}

export default class Game {
    private canvas: HTMLCanvasElement;
    private room: Room;
    private clock = new Clock();
    private scene = new Scene();
    private renderer: WebGLRenderer;
    private player: Player;
    private playerController: PlayerController;
    private plane: Plane;
    private bulletShotController: BulletShotController;
    private enemyController: EnemyController;
    private serverEnemyController: ServerEnemyController;
    private serverBulletShotController: ServerBulletShotController;
    private waveController: WaveController;
    private tower: EnemyTarget;
    private remotePlayers: Map<number, RemotePlayer> = new Map();

    constructor(room: Room) {
        this.room = room;

        const canvas = document.getElementById('root');

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error('Root is not canvas!!!');
        }

        this.canvas = canvas;
        this.renderer = new WebGLRenderer({ canvas: this.canvas });

        addScreenSizeListener((width, height) => this.renderer.setSize(width, height));
    }

    public start() {
        this.plane = new Plane();
        this.plane.position.copy(RESPAWN_POINT);
        this.scene.add(this.plane);

        this.bulletShotController = new BulletShotController();
        this.scene.add(this.bulletShotController);

        this.waveController = new WaveController(RESPAWN_POINT);

        this.player = new Player(RESPAWN_POINT);
        this.scene.add(this.player);
        this.scene.add(this.player.getCamera());

        this.enemyController = new EnemyController(this.player.getCamera());
        this.scene.add(this.enemyController);

        this.tower = new EnemyTarget(RESPAWN_POINT, this.player.getCamera());
        this.tower.events.addListener('die', () => {
            this.end();
        });
        this.scene.add(this.tower);

        this.playerController = new PlayerController(this.player, this.plane.getGround(), this.player.getCamera(), this.enemyController);
        this.playerController.events.addListener('shot', (position, direction) => {
            const message = new P2PMessage(MessageType.PLAYER_SHOT);
            message.setProp('id', this.room.playerId).setProp('x', position.x).setProp('z', position.z).setProp('direction_x', direction.x).setProp('direction_z', direction.z);
            this.room.sendMessage(message);
            this.performMessage(this.room.playerId, message);
        });
        this.playerController.events.addListener('move', (position, direction) => {
            const moveMessage = new P2PMessage(MessageType.PLAYER_MOVE);
            moveMessage.setProp('x', position.x).setProp('z', position.z).setProp('direction_x', direction.x).setProp('direction_z', direction.z);

            this.room.sendMessage(moveMessage);
            this.player.move(position, direction);
            this.plane.setCenter(position);
        });
        this.scene.add(this.playerController);

        const spawnMessage = new P2PMessage(MessageType.PLAYER_SPAWN);
        spawnMessage.setProp('x', RESPAWN_POINT.x).setProp('z', RESPAWN_POINT.z);
        this.room.sendMessage(spawnMessage); // Я родился! *(o_o)*

        this.room.on('message', this.performMessage);

        if (this.room.getIsHost()) {
            this.initHost();
        }

        this.room.on('receive_host_role', () => {
            this.initHost();
        });

        this.update();
    }

    private performMessage = (playerId: number, message: P2PMessage) => {
        switch (message.type) {
            case MessageType.PLAYER_SPAWN:
                this.spawnRemotePlayer(playerId, new Vector3(message.getProp('x'), 0, message.getProp('z')));

                if (this.room.getIsHost()) {
                    const waveNumberInformMessage = new P2PMessage(MessageType.WAVE_NUMBER);
                    waveNumberInformMessage.setProp('id', this.waveController.getWaveNumber());
                    this.room.sendMessage(waveNumberInformMessage);
                }
                break;

            case MessageType.PLAYER_MOVE:
                const position = new Vector3(message.getProp('x'), 0, message.getProp('z'));
                if (!this.remotePlayers.get(playerId)) {
                    this.spawnRemotePlayer(playerId, position);
                    break;
                }

                this.remotePlayers.get(playerId).move(position, new Vector3(message.getProp('direction_x'), 0, message.getProp('direction_z')));
                break;

            case MessageType.PLAYER_SHOT:
                const bullet = new Bullet(message.getProp('id'), new Vector3(message.getProp('x'), 0, message.getProp('z')), new Vector3(message.getProp('direction_x'), 0, message.getProp('direction_z')));
                this.bulletShotController.addBullet(bullet);
                break;

            case MessageType.NPC_SPAWN:
                this.enemyController.spawn(message.getProp('id'), new Vector3(message.getProp('x'), 0, message.getProp('z')));
                break;

            case MessageType.NPC_DIE:
                this.enemyController.die(message.getProp('id'));
                break;

            case MessageType.NPC_HIT:
                this.enemyController.hit(message.getProp('id'), this.clock.getElapsedTime());
                break;

            case MessageType.NPC_MOVE:
                this.enemyController.move(message.getProp('id'), new Vector3(message.getProp('x'), 0, message.getProp('z')));
                break;

            case MessageType.WAVE_NUMBER:
                this.waveController.syncWaveNumber(message.getProp('id'));
                break;

            default:
                break;
        }
    };

    private update = () => {
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        this.tower.update();
        this.plane.update(time);
        this.playerController.update(delta);
        this.player.update(delta, time);
        this.enemyController.update(delta, time);
        this.bulletShotController.update(delta, time);

        if (this.serverEnemyController) {
            this.serverEnemyController.update(delta, time, [this.player, ...Object.values(this.remotePlayers)]);
        }

        if (this.serverBulletShotController) {
            this.serverBulletShotController.update(time, this.bulletShotController.bullets, this.serverEnemyController.getEnemies(), this.remotePlayers, this.room.playerId, this.player);
        }

        requestAnimationFrame(this.update);

        this.renderer.render(this.scene, this.player.getCamera());
    };

    private initHost() {
        if (!this.serverEnemyController) {
            this.serverEnemyController = new ServerEnemyController(this.tower);
        }

        this.serverEnemyController.events.addListener('move', (id: number, position: Vector3) => {
            const message = new P2PMessage(MessageType.NPC_MOVE);
            message.setProp('id', id).setProp('x', position.x).setProp('z', position.z);
            this.room.sendMessage(message);
            this.enemyController.move(id, position);
            this.performMessage(this.room.playerId, message);
        });
        this.serverEnemyController.events.addListener('die', (id: number) => {
            const message = new P2PMessage(MessageType.NPC_DIE).setProp('id', id);
            this.room.sendMessage(message);
            this.performMessage(this.room.playerId, message);

            this.waveController.onEnemyDie();
        });
        this.serverEnemyController.events.addListener('hit', (id: number) => {
            const message = new P2PMessage(MessageType.NPC_HIT).setProp('id', id);
            this.room.sendMessage(message);
            this.performMessage(this.room.playerId, message);
        });

        this.enemyController.getEnemies().forEach(([id, enemy]) => {
            this.serverEnemyController.add(id, enemy);
        });

        if (!this.serverBulletShotController) {
            this.serverBulletShotController = new ServerBulletShotController();
        }

        this.waveController.syncEnemiesCount(this.enemyController.getEnemies().length);
        this.waveController.start();
        this.waveController.events.addListener('wave_start', (number: number) => {
            const message = new P2PMessage(MessageType.WAVE_NUMBER);
            message.setProp('id', number);
            this.room.sendMessage(message);
        });
        this.waveController.events.addListener('spawn', (position: Vector3) => {
            const id = createId();
            const message = new P2PMessage(MessageType.NPC_SPAWN);
            message.setProp('id', id).setProp('x', position.x).setProp('z', position.z);
            this.room.sendMessage(message);
            this.performMessage(this.room.playerId, message);
            this.serverEnemyController.add(id, this.enemyController.getEnemy(id));
        });
    }

    private end() {
        this.clock.stop();

        if (this.room.getIsHost()) {
            const failInterface = document.getElementById('failed_interface');
            failInterface.classList.remove('hidden');

            document.getElementById('restart').addEventListener(
                'click',
                () => {
                    this.tower.reset();
                    this.waveController.reset();
                    this.serverEnemyController.restart();
                    failInterface.classList.add('hidden');
                    this.clock.start();
                },
                { once: true }
            );
        }
    }

    private spawnRemotePlayer(id: number, position: Vector3) {
        const player = new RemotePlayer();
        player.move(position, new Vector3(0, 0, 0));

        this.remotePlayers.set(id, player);
        this.scene.add(player);
    }
}
