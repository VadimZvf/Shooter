import {
    Group,
    BoxGeometry,
    Mesh,
    Vector3,
    Box3,
    ShaderMaterial,
} from "three";
import EventEmitter from "events";
import { ICharacter } from "../ICharacter";
import { IHitable } from "../IHitable";
import Enemy from "../Enemy";

type Target = (Mesh | Group) & IHitable;

export class ServerEnemy {
    private target: Target;
    private worldObject: Enemy;
    private life: number = 5;

    constructor(enemy: Enemy) {
        this.worldObject = enemy;
    }

    public recalculateTarget(targets: Target[]) {
        let minimumDistance = Infinity;

        for (let target of targets) {
            const distance = target.position.distanceTo(this.worldObject.position);
            if (minimumDistance > distance) {
                minimumDistance = distance;
                this.target = target;
            }
        }
    }

    public hit() {
        this.events.emit('hit');
        this.life = this.life - 1;

        if (this.life <= 0) {
            this.events.emit('die');
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