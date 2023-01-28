import { Group, Mesh, Vector3 } from "three";
import EventEmitter from "events";
import Enemy from "../Enemy";
import Room from "../Room";
import { IHitable } from "../IHitable";
import { IEnemyController } from "./IEnemyController";

const MODE: "TOWER" | "SURVIVE" = "TOWER";

export default class EnemyController extends Group implements IEnemyController {
    private enemies: Record<number, Enemy> = {};
    private room: Room;
    public events = new EventEmitter();

    constructor(room: Room, tower: IHitable) {
        super();
        this.room = room;
    }

    public spawn(id: number, position: Vector3): Enemy {
        const enemy = new Enemy(position, this.room);
        this.enemies[id] = enemy;
        this.add(enemy);
        return enemy;
    }

    public die(id: number) {
        this.remove(this.enemies[id]);
        delete this.enemies[id];
    }

    public hit(id: number, time: number) {
        if (this.enemies[id]) {
            this.enemies[id].hit(time);
        }
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

    public update(delta: number, time: number, players: IHitable[]) {
        Object.entries(this.enemies).forEach(([enemyId, enemy]) => {
            enemy.update(delta, time);
        });
    }
}
