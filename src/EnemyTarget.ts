import EventEmitter from 'events';
import { Group, Mesh, Box3, BoxGeometry, MeshBasicMaterial, Vector3 } from 'three';
import { IHitable } from './IHitable';

const HIST_COUNT = 10;

export default class EnemyTarget extends Group implements IHitable {
    private hitLeft = HIST_COUNT;
    private mesh: Mesh;
    public events = new EventEmitter();

    constructor(position: Vector3) {
        super();

        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: 0x0000aa });

        this.mesh = new Mesh(geometry, material);

        this.position.copy(position);
        this.position.y = 0.5;
        this.add(this.mesh);
    }

    public hit() {
        this.hitLeft--;
        console.log('Бьют башню!');

        if (this.hitLeft === 0) {
            this.events.emit('die');
        }
    }

    public reset() {
        this.hitLeft = HIST_COUNT;
    }

    public getBox(): Box3 {
        return this.mesh.geometry.boundingBox;
    }
}
