import {Group, Mesh, Vector3} from 'three';
import EventEmitter from "events";
import Enemy from "./Enemy";
import Room from "./Room";

export default class EnemyController extends Group {
    private enemies: Record<number, Enemy> = {};
    private room: Room;
    public events = new EventEmitter();

    constructor(room: Room) {
        super();
        this.room = room;
    }

    public spawn(id: number, position: Vector3) {
        const enemy = new Enemy(position, this.room);
        this.enemies[id] = enemy;
        this.add(enemy);

        if (this.room.getIsHost()) {
            enemy.events.addListener('die', () => {
                this.events.emit('die', id);
                this.die(id);
            });
            enemy.events.addListener('move', (position) => this.events.emit('move', id, position));
        }
    }

    public die(id: number) {
        this.remove(this.enemies[id]);
        delete this.enemies[id];
    }

    public move(id: number, position: Vector3) {
        if (!this.enemies[id]) {
            console.warn(`Enemy ${id} not found!`);
            this.spawn(id, position);
            return;
        }

        this.enemies[id].move(position);
    }

    public getEnemies(): [number, Enemy][] {
        return Object.entries(this.enemies).map(([id, enemy]) => [Number(id), enemy]);
    }

    public update(delta: number, players: Array<Mesh | Group>) {
        Object.entries(this.enemies).forEach(([enemyId, enemy]) => {
            enemy.update(delta);
        });

        if (this.room.getIsHost()) {
            Object.entries(this.enemies).forEach(([enemyId, enemy]) => {
                enemy.recalculateTarget(players);
            });
        }
    }
}
