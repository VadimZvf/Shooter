import { Box3, Vector3 } from 'three';
import EventEmitter from 'events';
import { IHitable } from '../IHitable';
import Enemy from '../Enemy';

const SPEED = 1;
const HIT_DISTANCE = 1;
const RELOAD_TIME = 2;

export class ServerEnemy implements IHitable {
    private target: IHitable | void;
    private worldObject: Enemy;
    private life: number = 5;
    private lastShotTime: number | null = null;
    public events = new EventEmitter();

    constructor(enemy: Enemy) {
        this.worldObject = enemy;
    }

    public update(delta: number, time: number) {
        if (!this.target) {
            return;
        }

        const movedDistantion = delta * SPEED;
        const direction = this.target.position.clone().sub(this.worldObject.position);

        const distantionToTarget = direction.length();

        const leftTimeFromLastHit = time - this.lastShotTime;

        if (distantionToTarget <= HIT_DISTANCE && leftTimeFromLastHit >= RELOAD_TIME) {
            this.target.hit(time, direction);
            this.lastShotTime = time;
            return;
        }

        if (movedDistantion > 0) {
            this.events.emit('move', this.worldObject.position.clone().add(direction.setLength(movedDistantion)));
        }
    }

    public recalculateTarget(targets: IHitable[]) {
        if (targets.length === 1) {
            this.target = targets[0];
            return;
        }

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

    public getBox(): Box3 {
        return this.worldObject.getBox();
    }

    public recalculateBoundingBox() {
        this.worldObject.recalculateBoundingBox();
    }

    get position(): Vector3 {
        return this.worldObject.position;
    }
}
