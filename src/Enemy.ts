import {
    Group,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    Vector3,
    Box3,
} from "three";

const SPEED = 1;

export default class Enemy extends Group {
    target: Vector3;
    geometry: BoxGeometry;
    material: MeshBasicMaterial;
    mesh: Mesh;
    deathListeners: Array<() => void> = [];
    life: number = 5;

    constructor(startPosition: Vector3) {
        super();

        this.geometry = new BoxGeometry(1, 1, 1);
        this.material = new MeshBasicMaterial({ color: 0xff5555 });
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.position.copy(startPosition);
        this.mesh.position.y = 0.5;
        this.add(this.mesh);
        this.recalculateBoundingBox();
    }

    private recalculateBoundingBox() {
        this.geometry.computeBoundingBox();
        this.geometry.boundingBox.applyMatrix4(this.mesh.matrixWorld);
    }

    public subscribeDeath(listener: () => void) {
        this.deathListeners.push(listener);
    }

    public setTargetPosition(target: Vector3) {
        this.target = target;
    }

    public hit() {
        this.life = this.life - 1;

        if (this.life <= 0) {
            this.deathListeners.forEach((listener) => listener());
        }
    }

    public getBox(): Box3 {
        return this.geometry.boundingBox;
    }

    public update(delta: number) {
        if (!this.target) {
            return;
        }

        const distantion = delta * SPEED;
        const direction = this.target.clone().sub(this.position);

        this.position.add(direction.setLength(distantion));
        this.recalculateBoundingBox();
    }
}
