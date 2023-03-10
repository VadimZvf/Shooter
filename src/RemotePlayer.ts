import { BoxGeometry, MeshBasicMaterial, Group, Box3, Mesh, Vector3 } from 'three';
import { ICharacter } from './ICharacter';
import Pigeon from './Pigeon';

export default class RemotePlayer extends Group implements ICharacter {
    private pigeon: Pigeon;
    private mesh: Mesh;
    private geometry: BoxGeometry;

    constructor() {
        super();

        const material = new MeshBasicMaterial({ transparent: true, opacity: 0, depthTest: true, depthWrite: false });
        this.geometry = new BoxGeometry(1, 1, 1);
        this.mesh = new Mesh(this.geometry, material);
        this.mesh.position.y = 0.5;

        this.pigeon = new Pigeon();

        this.add(this.mesh);
        this.add(this.pigeon);
        this.recalculateBoundingBox();
    }

    public move(position: Vector3, lookVector: Vector3) {
        this.position.x = position.x;
        this.position.z = position.z;

        this.pigeon.lookDirection(lookVector);
    }

    public hit() {
        console.log('Бьюют соседа!');
    }

    public update(delta: number, time: number) {
        this.pigeon.update(delta, time);
    }

    public getBox(): Box3 {
        return this.mesh.geometry.boundingBox;
    }

    public recalculateBoundingBox() {
        this.geometry.computeBoundingBox();
        this.geometry.boundingBox.applyMatrix4(this.mesh.matrixWorld);
    }
}
