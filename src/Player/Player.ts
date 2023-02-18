import EventEmitter from 'events';
import { Clock, Group, BoxGeometry, Raycaster, Box3, PerspectiveCamera, MeshBasicMaterial, Mesh, Vector3, Vector2 } from 'three';
import { ICharacter } from '../ICharacter';
import { PlayerCamera } from './PlayerCamera';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;

const RELOAD_TIME = 0.1;
const MOVEMENT_SPEED = 10;

export default class Player extends Group implements ICharacter {
    private camera: PlayerCamera;
    private mesh: Mesh;

    constructor(spawnPosition: Vector3, ground: Mesh) {
        super();

        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: 0x00ff00 });
        this.mesh = new Mesh(geometry, material);
        this.mesh.position.y = 0.5;
        this.add(this.mesh);

        this.position.copy(spawnPosition);

        this.camera = new PlayerCamera(spawnPosition);
    }

    public update(delta: number) {
        this.camera.update(delta);
    }

    public move(position: Vector3, lookAt: Vector3) {
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
        return this.mesh.geometry.boundingBox;
    }
}
