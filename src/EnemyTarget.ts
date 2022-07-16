import EventEmitter from "events";
import { Group, Mesh, BoxGeometry, MeshBasicMaterial, Vector3 } from "three";
import { IHitable } from "./Hitable";

export default class EnemyTarget extends Group implements IHitable {
    private hitLeft = 10;
    public events = new EventEmitter();

    constructor(position: Vector3) {
        super();

        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: 0x0000aa });

        const mesh = new Mesh(geometry, material);

        this.position.copy(position);
        this.position.y = 0.5;
        this.add(mesh);
    }

    public hit() {
        this.hitLeft--;
        console.log('Бьют башню!');

        if (this.hitLeft === 0) {
            this.events.emit("die");
        }
    }
}
