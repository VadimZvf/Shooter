import { Group, Mesh, MeshBasicMaterial, BoxBufferGeometry, Box3, Vector3 } from "three";

const SPEED = 100;

export default class Bullet extends Group {
    direction: Vector3;
    box: Box3;
    mesh: Mesh;
    geometry: BoxBufferGeometry;

    constructor(direction: Vector3) {
        super();
        
        this.box = new Box3();
        this.geometry = new BoxBufferGeometry(0.1, 1, 0.1)
        this.mesh = new Mesh(
            this.geometry,
            new MeshBasicMaterial({ color: 0xff0000 })
        );
        this.geometry.computeBoundingBox();
        this.add(this.mesh);

        this.direction = direction;
    }

    public isHit(box: Box3): boolean {
        return this.box.intersectsBox(box);
    }

    public update(delta: number) {
        const distantion = delta * SPEED;
        this.position.add(
            this.direction.clone().setLength(distantion)
        );
        this.box.copy(this.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld);
    }
}