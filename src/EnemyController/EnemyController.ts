import { Group, Vector3 } from 'three';
import Enemy from '../Enemy';

export class EnemyController extends Group {
    protected enemies: Map<number, Enemy>;

    constructor() {
        super();
        this.enemies = new Map();
    }

    public spawn(id: number, position: Vector3) {
        const enemy = new Enemy(position, id);
        this.enemies.set(id, enemy);
        this.add(enemy);
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

    public getEnemy(id: number): Enemy {
        return this.enemies.get(id);
    }

    public update(delta: number, time: number) {
        this.enemies.forEach((enemy) => {
            enemy.update(delta, time);
        });
    }
}
