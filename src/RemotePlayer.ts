import {
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    Vector3,
} from "three";

const TOP_VECTOR = new Vector3(0, -1, 0);

export default class RemotePlayer extends Mesh {
    constructor() {
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: 0xbbbb00 });

        super(geometry, material);

        this.position.y = 0.5;
    }

    public move(position: Vector3, lookVector: Vector3) {
        this.position.x = position.x;
        this.position.z = position.z;
    }
}