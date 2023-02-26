import { Group, BoxGeometry, Box3, PerspectiveCamera, MeshBasicMaterial, Mesh, Vector3 } from 'three';
import Pigeon from '../Pigeon';
import { ICharacter } from '../ICharacter';
import { IHitable } from '../IHitable';
import { PlayerCamera } from './PlayerCamera';

export default class Player extends Group implements ICharacter, IHitable {
    private pigeon: Pigeon;
    private camera: PlayerCamera;
    private mesh: Mesh;
    private geometry: BoxGeometry;

    constructor(spawnPosition: Vector3) {
        super();

        this.pigeon = new Pigeon();

        const material = new MeshBasicMaterial({ transparent: true, opacity: 0, depthTest: true, depthWrite: false });
        this.geometry = new BoxGeometry(1, 1, 1);
        this.mesh = new Mesh(this.geometry, material);
        this.mesh.position.y = 0.5;
        this.add(this.pigeon);
        this.add(this.mesh);

        this.position.copy(spawnPosition);

        this.camera = new PlayerCamera(spawnPosition);
        this.recalculateBoundingBox();
    }

    public update(delta: number, time: number) {
        this.camera.update(delta);
        this.pigeon.update(delta, time);
    }

    public move(position: Vector3, lookAt: Vector3) {
        this.pigeon.lookDirection(lookAt);

        this.position.copy(position);
        this.mesh.lookAt(position.clone().add(lookAt).setY(0.5));
        this.camera.setTargetPosition(position);
    }

    public getCamera(): PerspectiveCamera {
        return this.camera.getCamera();
    }

    public getMesh(): Mesh {
        return this.mesh;
    }

    public hit() {
        console.log('Фаак факк!! Бьют!');
    }

    public getBox(): Box3 {
        return this.geometry.boundingBox;
    }

    public recalculateBoundingBox() {
        this.geometry.computeBoundingBox();
        this.geometry.boundingBox.applyMatrix4(this.mesh.matrixWorld);
    }
}
