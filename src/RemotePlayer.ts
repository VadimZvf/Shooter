import { BoxGeometry, MeshBasicMaterial, Group, Box3, Mesh, Vector3 } from 'three';
import { ICharacter } from './ICharacter';

export default class RemotePlayer extends Group implements ICharacter {
    private mesh: Mesh;
    private geometry: BoxGeometry;

    constructor() {
        super();

        const material = new MeshBasicMaterial({ color: 0xffff00 });
        this.geometry = new BoxGeometry(1, 1, 1);
        this.mesh = new Mesh(this.geometry, material);
        this.mesh.position.y = 0.5;

        this.add(this.mesh);
        this.recalculateBoundingBox();
    }

    public move(position: Vector3, lookVector: Vector3) {
        this.position.x = position.x;
        this.position.z = position.z;

        this.lookAt(lookVector.add(this.position));
    }

    public hit() {
        console.log('Бьюют соседа!');
    }

    public update(delta: number, time: number) {}

    public getBox(): Box3 {
        return this.mesh.geometry.boundingBox;
    }

    public recalculateBoundingBox() {
        this.geometry.computeBoundingBox();
        this.geometry.boundingBox.applyMatrix4(this.mesh.matrixWorld);
    }
}
