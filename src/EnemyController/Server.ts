import { Group, Mesh, Vector3 } from "three";
import EventEmitter from "events";
import Enemy from "./Enemy";
import Room from "./Room";
import { IHitable } from "../IHitable";
import { ICharacter } from "../ICharacter";

const MODE: "TOWER" | "SURVIVE" = "TOWER";

export default class EnemyController extends Group {
    private enemies: Record<number, ICharacter> = {};
    private room: Room;
    private tower: Mesh;
    public events = new EventEmitter();

    constructor(room: Room, tower: Mesh) {
        super();
        this.room = room;
        this.tower = tower;
    }

    public spawn(id: number, position: Vector3): ICharacter {
        const enemy = new Enemy(position, this.room);
        this.enemies[id] = enemy;
        this.add(enemy);

        if (this.room.getIsHost()) {
            enemy.events.addListener("die", () => {
                this.events.emit("die", id);
                this.die(id);
            });
            enemy.events.addListener("hit", () => {
                this.events.emit("hit", id);
            });
            enemy.events.addListener("move", (position) => this.events.emit("move", id, position));
        }

        this.events.emit("spawn", id, position);
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

    public update(delta: number, time: number, players: Array<(Group | Mesh) & IHitable>) {
        Object.entries(this.enemies).forEach(([enemyId, enemy]) => {
            enemy.update(delta, time);
        });

        if (this.room.getIsHost()) {
            if (MODE === "TOWER") {
                Object.entries(this.enemies).forEach(([enemyId, enemy]) => {
                    enemy.recalculateTarget([this.tower]);
                });
            } else {
                Object.entries(this.enemies).forEach(([enemyId, enemy]) => {
                    enemy.recalculateTarget(players);
                });
            }
        }
    }
}
