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

const SPEED = 1;

export default class Enemy extends Group {
    private target: Vector3;
    private geometry: BoxGeometry;
    private material: MeshBasicMaterial;
    private mesh: Mesh;
    private life: number = 5;
    private room: Room;
    public events = new EventEmitter();

    constructor(startPosition: Vector3, room: Room) {
        super();

        this.room = room;
        this.geometry = new BoxGeometry(1, 1, 1);
        this.material = new MeshBasicMaterial({ color: 0xff5555 });
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.position.copy(startPosition);
        this.mesh.position.y = 0.5;
        this.add(this.mesh);
        this.recalculateBoundingBox();
    }

    public update(delta: number) {
        if (!this.target) {
            return;
        }

        if (this.room.getIsHost()) {
            const distantion = delta * SPEED;
            const direction = this.target.clone().sub(this.position);
    
            if (distantion > 0) {
                this.recalculateBoundingBox();
    
                this.events.emit('move', this.position.clone().add(direction.setLength(distantion)));
            }
        }
    }

    public move(position: Vector3) {
        this.position.copy(position);
    }

    public recalculateTarget(players: Array<Mesh | Group>) {
        let minimumDistance = Infinity;

        for (let player of players) {
            const distance = player.position.distanceTo(this.position);
            if (minimumDistance > distance) {
                minimumDistance = distance;
                this.setTarget(player.position);
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

    private setTarget(target: Vector3) {
        if (this.target) {
            this.target.copy(target);
        } else {
            this.target = target.clone();
        }
    }
}
