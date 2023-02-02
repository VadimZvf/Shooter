import { Vector3 } from "three";
import Room from "./Room";
import { IHitable } from "./IHitable";
import { EnemyController as Base } from "./Common";
import Enemy from "./Enemy";

const MODE: "TOWER" | "SURVIVE" = "TOWER";

export default class ServerEnemyController extends Base {
    constructor(room: Room, tower: IHitable) {
        super();
        this.room = room;
        this.tower = tower;
    }

    public add(id: number, enemy: Enemy) {
        enemy.events.addListener("die", () => {
            this.events.emit("die", id);
            this.die(id);
        });
        enemy.events.addListener("hit", () => {
            this.events.emit("hit", id);
        });
        enemy.events.addListener("move", (position) => this.events.emit("move", id, position));

        this.events.emit("spawn", id, position);
        return enemy;
    }

    public update(delta: number, time: number, players: Enemy[]) {
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
