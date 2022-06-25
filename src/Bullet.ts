import {
    Mesh,
    MeshBasicMaterial,
    SphereBufferGeometry,
    Box3,
    Vector3,
} from "three";

const SPEED = 5;

export default class Bullet extends Mesh {
    direction: Vector3;

    constructor(direction: Vector3, position: Vector3) {
        const geometry = new SphereBufferGeometry(0.1, 10, 10);
        const material = new MeshBasicMaterial({ color: 0xff0000 })
        super(geometry, material);

        this.position.copy(position);
        this.updateMatrix();
        this.updateMatrixWorld(true);

        this.recalculateBoundingBox();

        this.direction = direction;
    }

    private recalculateBoundingBox() {
        this.geometry.computeBoundingBox();
        this.geometry.boundingBox.applyMatrix4(this.matrixWorld);
    }

    public isHit(box: Box3): boolean {
        return this.geometry.boundingBox.intersectsBox(box);
    }

    public update(delta: number) {
        const distantion = delta * SPEED;
        this.position.add(this.direction.clone().setLength(distantion));
        this.recalculateBoundingBox();
    }
}
