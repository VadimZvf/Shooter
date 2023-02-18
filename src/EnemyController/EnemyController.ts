import { Group, Vector3, PerspectiveCamera } from 'three';
import { addScreenSizeListener } from '../browserUtils/screenSize';
import Enemy from '../Enemy';

export class EnemyController extends Group {
    protected enemies: Map<number, Enemy>;
    protected enemiesMarkers: Map<number, HTMLDivElement>;
    private camera: PerspectiveCamera;
    private screenWidth: number;
    private screenHeight: number;

    constructor(camera: PerspectiveCamera) {
        super();
        this.enemies = new Map();
        this.enemiesMarkers = new Map();
        this.camera = camera;

        addScreenSizeListener((width, height) => {
            this.screenWidth = width;
            this.screenHeight = height;
        });
    }

    public spawn(id: number, position: Vector3) {
        const enemy = new Enemy(position, id);
        this.enemies.set(id, enemy);
        this.add(enemy);

        const marker = document.createElement('div');
        marker.classList.add('enemy-marker');
        document.body.appendChild(marker);
        this.enemiesMarkers.set(id, marker);
    }

    public die(id: number) {
        this.remove(this.enemies.get(id));
        this.enemies.delete(id);

        document.body.removeChild(this.enemiesMarkers.get(id));
        this.enemiesMarkers.delete(id);
    }

    public hit(id: number, time: number) {
        if (this.enemies.has(id)) {
            this.enemies.get(id).hit(time);
        }
    }

    public move(id: number, position: Vector3) {
        if (!this.enemies.has(id)) {
            console.warn(`Enemy ${id} not found!`);
            this.spawn(id, position);
            return;
        }

        this.enemies.get(id).move(position);
    }

    public getEnemies(): [number, Enemy][] {
        return Array.from(this.enemies);
    }

    public getEnemy(id: number): Enemy {
        return this.enemies.get(id);
    }

    public update(delta: number, time: number) {
        this.enemies.forEach((enemy) => {
            enemy.update(delta, time);
            const vector = enemy.position.clone().project(this.camera);

            const screenX = ((vector.x + 1) * this.screenWidth) / 2;
            const screenY = -((vector.y - 1) * this.screenHeight) / 2;
            const marker = this.enemiesMarkers.get(enemy.ID);

            if (screenX < 0 || screenY < 0 || screenX > this.screenWidth || screenY > this.screenHeight) {
                marker.style.display = 'block';
                const x = Math.max(Math.min(screenX, this.screenWidth - 10), 10);
                const y = Math.max(Math.min(screenY, this.screenHeight - 10), 10);

                marker.style.left = `${x}px`;
                marker.style.top = `${y}px`;
            } else {
                marker.style.display = 'none';
            }
        });
    }
}
