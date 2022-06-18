import { BoxBufferGeometry, Mesh, MeshBasicMaterial, Object3D, Vector3 } from "three";

const SPEED = 1;

export default class Bullet extends Object3D {
    direction: Vector3;

    constructor(direction: Vector3) {
        super();
        
        this.add(
            new Mesh(
                new BoxBufferGeometry(0.1, 0.1, 0.1),
                new MeshBasicMaterial({ color: 0xff0000 })
            )
        );

        this.direction = direction;
    }

    public update(delta: number) {
        this.position.add(this.direction.multiplyScalar(SPEED));
    }
}