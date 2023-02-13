import EventEmitter from 'events';
import { Clock, PerspectiveCamera, Group, BoxGeometry, Raycaster, Box3, MeshBasicMaterial, Mesh, Vector3, Vector2 } from 'three';
import { ICharacter } from '../ICharacter';
import { easeInOutQuad } from '../timing/easeInOutQuad';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
const CAMERA_DISTANTION = 10;

const RELOAD_TIME = 0.1;
const MOVEMENT_SPEED = 10;
const CAMERA_ACCELERATION = 0.8;
const CAMERA_ACCELERATION_DISTANTION = 10;

export default class Player extends Group implements ICharacter {
    private camera: PerspectiveCamera = new PerspectiveCamera(90, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
    private cameraSpeed: number = 0;

    private clock = new Clock();
    private lastShotTime: number = 0;
    private mesh: Mesh;
    private userControlVector: Vector3 = new Vector3(0, 0, 0); // Нажатые клавиши
    private raycaster: Raycaster = new Raycaster();
    private mousePointer: Vector2 = new Vector2(0, 0);
    private coursorWorldPointer: Vector3 = new Vector3(0, 0, 0);
    private targetPoint: Vector3 | null = null;
    private ground: Mesh;
    public events = new EventEmitter();

    constructor(spawnPosition: Vector3, ground: Mesh) {
        super();

        window.addEventListener('resize', () => {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;
            this.camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
            this.camera.updateProjectionMatrix();
        });

        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: 0x00ff00 });
        this.mesh = new Mesh(geometry, material);
        this.mesh.position.y = 0.5;
        this.add(this.mesh);

        this.position.copy(spawnPosition);

        this.camera.position.copy(this.getCameraTargetPosition());
        this.camera.lookAt(spawnPosition);

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

        const cameraTargetPosition = this.getCameraTargetPosition();
        const distanceToCameraTarget = this.camera.position.distanceTo(cameraTargetPosition);
        if (distanceToCameraTarget > 0.5) {
            const cameraPositionShift = cameraTargetPosition.sub(this.camera.position).setLength(this.cameraSpeed * delta);
            this.camera.position.add(cameraPositionShift);

            this.cameraSpeed = Math.min(CAMERA_ACCELERATION_DISTANTION, distanceToCameraTarget) * CAMERA_ACCELERATION;
        } else {
            this.cameraSpeed = 0;
        }
    }

    public getCamera(): PerspectiveCamera {
        return this.camera;
    }

    public hit() {
        console.log('Фаак факк!! Бьют!');
    }

    public getBox(): Box3 {
        return this.mesh.geometry.boundingBox;
    }

    private notifyMovement() {
        this.events.emit('move', this.position.clone(), this.coursorWorldPointer.clone().sub(this.position));
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

    private getCameraTargetPosition(): Vector3 {
        return this.position
            .clone()
            .setY(15)
            .setZ(this.position.z + CAMERA_DISTANTION);
    }

    public shot() {
        if (this.clock.getElapsedTime() - this.lastShotTime >= RELOAD_TIME) {
            this.events.emit('shot', this.position.clone(), this.coursorWorldPointer.clone().sub(this.position));
            this.lastShotTime = this.clock.getElapsedTime();
        }
    }
}
