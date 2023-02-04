import { Vector3 } from "three";
import Room from "../Room";
import { IHitable } from "../IHitable";
import Enemy from "../Enemy";

const MODE: "TOWER" | "SURVIVE" = "TOWER";
const SPEED = 1;
const HIT_DISTANCE = 1;
const RELOAD_TIME = 2;

export class ServerEnemyController {
    constructor(room: Room, tower: IHitable) {
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

    private moveEnemy() {
        if (!this.target) {
            return;
        }

        const movedDistantion = delta * SPEED;
        const direction = this.target.position.clone().sub(this.position);

        const distantionToTarget = direction.length();

        const leftTimeFromLastHit = time - this.lastHitTime;

        if (distantionToTarget <= HIT_DISTANCE && leftTimeFromLastHit >= RELOAD_TIME) {
            this.target.hit(time);
            this.lastHitTime = time;
            return;
        }

        if (movedDistantion > 0) {
            this.recalculateBoundingBox();

            this.events.emit('move', this.position.clone().add(direction.setLength(movedDistantion)));
        }
    }
}
