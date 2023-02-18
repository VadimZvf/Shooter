import EventEmitter from 'events';
import { Group, Mesh, Box3, BoxGeometry, MeshBasicMaterial, Vector3, PerspectiveCamera } from 'three';
import { IHitable } from './IHitable';
import { addScreenSizeListener } from './browserUtils/screenSize';

const HIST_COUNT = 10;

export default class EnemyTarget extends Group implements IHitable {
    private hitLeft = HIST_COUNT;
    private mesh: Mesh;
    private camera: PerspectiveCamera;
    private screenWidth: number;
    private screenHeight: number;
    private marker: HTMLDivElement;
    public events = new EventEmitter();

    constructor(position: Vector3, camera: PerspectiveCamera) {
        super();

        this.camera = camera;
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: 0x0000aa });

        this.mesh = new Mesh(geometry, material);

        this.position.copy(position);
        this.position.y = 0.5;
        this.add(this.mesh);

        this.marker = document.createElement('div');
        this.marker.classList.add('tower-marker');
        document.body.appendChild(this.marker);

        addScreenSizeListener((width, height) => {
            this.screenWidth = width;
            this.screenHeight = height;
        });
    }

    public hit() {
        this.hitLeft--;
        console.log('Бьют башню!');

        if (this.hitLeft === 0) {
            this.events.emit('die');
        }
    }

    public update() {
        const vector = this.position.clone().project(this.camera);

        const screenX = ((vector.x + 1) / 2) * this.screenWidth;
        const screenY = -((vector.y - 1) / 2) * this.screenHeight;

        if (screenX < 0 || screenY < 0 || screenX > this.screenWidth || screenY > this.screenHeight) {
            this.marker.style.display = 'block';
            const x = Math.max(Math.min(screenX, this.screenWidth - 10), 10);
            const y = Math.max(Math.min(screenY, this.screenHeight - 10), 10);

            this.marker.style.left = `${x}px`;
            this.marker.style.top = `${y}px`;
        } else {
            this.marker.style.display = 'none';
        }
    }

    public reset() {
        this.hitLeft = HIST_COUNT;
    }

    public getBox(): Box3 {
        return this.mesh.geometry.boundingBox;
    }
}
