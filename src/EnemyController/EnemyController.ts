import { Group, Mesh, Vector3 } from "three";
import EventEmitter from "events";
import Enemy from "../Enemy";
import Room from '../Room';
import {IHitable} from '../IHitable';
import { IEnemyController } from './IEnemyController';

export class EnemyController extends Group implements IEnemyController {
    protected enemies: Map<number, Enemy>;
    protected events = new EventEmitter();
    protected room: Room;
    protected tower: IHitable;

    constructor(room: Room, tower: IHitable) {
        super();
        this.room = room;
        this.tower = tower;
        this.enemies = new Map();
    }

    public spawn(id: number, position: Vector3): Enemy {
        const enemy = new Enemy(position, this.room);
        this.enemies.set(id, enemy);
        this.add(enemy);
        return enemy;
    }

    public die(id: number) {
        this.remove(this.enemies.get(id));
        this.enemies.delete(id);
    }

    public hit(id: number, time: number) {
        if (this.enemies.has(id)) {
            this.enemies.get(id).hit(time);
        }
    }

    public move(id: number, position: Vector3) {
        if (!this.enemies.has(id)) {
            console.warn(`Enemy ${id} not found!`);
            this.spawn(id, position);
            return;
        }

        this.enemies.get(id).move(position);
    }

    public getEnemies(): [number, Enemy][] {
        return Object.entries(this.enemies).map(([id, enemy]) => [Number(id), enemy]);
    }

    public update(delta: number, time: number, players: Enemy[]) {
        this.enemies.forEach(enemy => {
            enemy.update(delta, time);
        });
    }
}
