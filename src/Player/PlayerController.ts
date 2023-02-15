import EventEmitter from 'events';
import { Clock, Group, BoxGeometry, Raycaster, Box3, PerspectiveCamera, MeshBasicMaterial, Mesh, Vector3, Vector2 } from 'three';
import { ICharacter } from '../ICharacter';
import EnemyController from '../EnemyController';
import { PlayerCamera } from './PlayerCamera';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;

const RELOAD_TIME = 0.1;
const MOVEMENT_SPEED = 10;

export default class PlayerController {
    private camera: PerspectiveCamera;
    private enemyController: EnemyController;
    private mesh: Mesh;

    private clock = new Clock();
    private lastShotTime: number = 0;
    private userControlVector: Vector3 = new Vector3(0, 0, 0); // Нажатые клавиши
    private raycaster: Raycaster = new Raycaster();
    private mousePointer: Vector2 = new Vector2(0, 0);
    private coursorWorldPointer: Vector3 = new Vector3(0, 0, 0);
    private targetPoint: Vector3 | null = null;
    private ground: Mesh;
    public events = new EventEmitter();

    constructor(mesh: Mesh, ground: Mesh, enemyController: EnemyController, camera: PerspectiveCamera) {
        this.mesh = mesh;
        this.camera = camera;
        this.enemyController = enemyController;
        this.ground = ground;

        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.userControlVector.z = -1;
                    break;
                case 'KeyS':
                    this.userControlVector.z = 1;
                    break;
                case 'KeyA':
                    this.userControlVector.x = -1;
                    break;
                case 'KeyD':
                    this.userControlVector.x = 1;
                    break;
                case 'Space':
                    this.shot();
                    break;
                default:
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.userControlVector.z = 0;
                    break;
                case 'KeyS':
                    this.userControlVector.z = 0;
                    break;
                case 'KeyA':
                    this.userControlVector.x = 0;
                    break;
                case 'KeyD':
                    this.userControlVector.x = 0;
                    break;

                default:
                    break;
            }
        });

        document.addEventListener('mousemove', (event) => {
            const mousePosition = this.getMousePosition(event);

            if (mousePosition) {
                mousePosition.setY(0.5);
                this.mesh.lookAt(mousePosition);
                this.coursorWorldPointer.copy(mousePosition);
            }
        });

        document.addEventListener('click', (event) => {
            const mousePosition = this.getMousePosition(event);

            if (mousePosition) {
                this.targetPoint = mousePosition;
                this.mesh.lookAt(mousePosition.clone().setY(0.5));
            }
        });
    }

    public update(delta: number) {
        if (this.userControlVector.length() > 0) {
            this.position.add(this.userControlVector.clone().setLength(MOVEMENT_SPEED * delta));
            this.notifyMovement();
            this.targetPoint = null;
        }

        if (this.targetPoint) {
            const distance = this.targetPoint.distanceTo(this.position);

            if (distance > 0.5) {
                const direction = this.targetPoint
                    .clone()
                    .sub(this.position)
                    .setLength(MOVEMENT_SPEED * delta);

                this.position.add(direction);
            } else {
                this.targetPoint = null;
            }
            this.notifyMovement();
        }

        this.camera.update(delta);
    }

    private notifyMovement(newPosition: Vector3, lookAt: Vector3) {
        this.events.emit('move', newPosition, lookAt);
    }

    private getMousePosition(event: MouseEvent): Vector3 | void {
        let x = (event.offsetX / SCREEN_WIDTH) * 2 - 1;
        let y = -(event.offsetY / SCREEN_HEIGHT) * 2 + 1;
        this.mousePointer.set(x, y);
        this.raycaster.setFromCamera(this.mousePointer, this.camera);
        const intersects = this.raycaster.intersectObject(this.ground);

        for (const intersection of intersects) {
            if (intersection.point) {
                return intersection.point;
            }
        }
    }

    public shot() {
        if (this.clock.getElapsedTime() - this.lastShotTime >= RELOAD_TIME) {
            this.events.emit('shot', this.position.clone(), this.coursorWorldPointer.clone().sub(this.position));
            this.lastShotTime = this.clock.getElapsedTime();
        }
    }
}
