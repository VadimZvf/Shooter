import {
    Group,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    Vector3,
    Box3,
} from "three";
import EventEmitter from "events";
import Room from "./Room";
import { IHitable } from "./Hitable";

const SPEED = 1;
const HIT_DISTANCE = 1;
const RELOAD_TIME = 2;

export default class Enemy extends Group {
    private target: (Mesh | Group) & IHitable;
    private geometry: BoxGeometry;
    private material: MeshBasicMaterial;
    private mesh: Mesh;
    private life: number = 5;
    private room: Room;
    private lastHitTime: number = 0;
    public events = new EventEmitter();

    constructor(startPosition: Vector3, room: Room) {
        super();

        this.room = room;
        this.geometry = new BoxGeometry(1, 1, 1);
        this.material = new MeshBasicMaterial({ color: 0xff5555 });
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.position.y = 0.5;
        this.position.copy(startPosition);
        this.add(this.mesh);
        this.recalculateBoundingBox();
    }

    public update(delta: number, time: number) {
        if (!this.target || !this.room.getIsHost()) {
            return;
        }

        const movedDistantion = delta * SPEED;
        const direction = this.target.position.clone().sub(this.position);

        const distantionToTarget = direction.length();

        const leftTimeFromLastHit = time - this.lastHitTime;

        if (distantionToTarget <= HIT_DISTANCE && leftTimeFromLastHit >= RELOAD_TIME) {
            this.target.hit();
            this.lastHitTime = time;
            return;
        }


        if (movedDistantion > 0) {
            this.recalculateBoundingBox();

            this.events.emit('move', this.position.clone().add(direction.setLength(movedDistantion)));
        }
    }

    public move(position: Vector3) {
        this.position.copy(position);
        this.position.y = 0;
    }

    public recalculateTarget(targets: Array<(Mesh | Group) & IHitable>) {
        let minimumDistance = Infinity;

        for (let target of targets) {
            const distance = target.position.distanceTo(this.position);
            if (minimumDistance > distance) {
                minimumDistance = distance;
                this.setTarget(target);
            }
        }
    }

    public hit() {
        this.life = this.life - 1;

        if (this.life <= 0) {
            this.events.emit('die');
        }
    }

    public getBox(): Box3 {
        return this.geometry.boundingBox;
    }

    private recalculateBoundingBox() {
        this.geometry.computeBoundingBox();
        this.geometry.boundingBox.applyMatrix4(this.mesh.matrixWorld);
    }

    private setTarget(target: (Mesh | Group) & IHitable) {
        this.target = target;
    }
}
