import {
    PerspectiveCamera,
    Group,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    Vector3,
} from "three";

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
const CAMERA_DISTANTION = 10;

const ACCELERATION = 0.6;
const STOP_ACCELERATION = 0.02;

const TOP_VECTOR = new Vector3(0, -1, 0);

export default class Player extends Group {
    private camera: PerspectiveCamera = new PerspectiveCamera(
        90,
        SCREEN_WIDTH / SCREEN_HEIGHT,
        0.1,
        1000
    );

    private mesh: Mesh;
    private energyVector: Vector3 = new Vector3(0, 0, 0);
    private userControlVector: Vector3 = new Vector3(0, 0, 0); // Нажатые клавиши
    private userDirectionVector: Vector3 = new Vector3(0, 0, 0); // Направление движения персонажа
    private shotListeners: Array<(position: Vector3, direction: Vector3) => void> = [];
    private moveListeners: Array<(position: Vector3) => void> = [];

    constructor(canvas: HTMLCanvasElement) {
        super();

        canvas.addEventListener("click", () => {
            // @ts-ignore
            canvas.requestPointerLock =
                canvas.requestPointerLock ||
                // @ts-ignore
                canvas.mozRequestPointerLock ||
                // @ts-ignore
                canvas.webkitRequestPointerLock;
            canvas.requestPointerLock();
        });

        window.addEventListener('resize', () => {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;
            this.camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
            this.camera.updateProjectionMatrix();
        });

        this.camera.position.z = CAMERA_DISTANTION;
        this.camera.position.y = 5;
        this.camera.lookAt(0, 0, 0);
        this.add(this.camera);

        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: 0x55ff99 });
        this.mesh = new Mesh(geometry, material);
        this.mesh.position.y = 0.5;
        this.add(this.mesh);

        document.addEventListener("keydown", (event) => {
            switch (event.code) {
                case "KeyW":
                    this.userControlVector.z = 1;
                    break;
                case "KeyS":
                    this.userControlVector.z = -1;
                    break;
                case "KeyA":
                    this.userControlVector.x = 1;
                    break;
                case "KeyD":
                    this.userControlVector.x = -1;
                    break;
                case "Space":
                    this.shot();
                    break;
                default:
                    break;
            }
            this.userDirectionVector.copy(this.getUserDirection());
        });

        document.addEventListener("keyup", (event) => {
            switch (event.code) {
                case "KeyW":
                    this.userControlVector.z = 0;
                    break;
                case "KeyS":
                    this.userControlVector.z = 0;
                    break;
                case "KeyA":
                    this.userControlVector.x = 0;
                    break;
                case "KeyD":
                    this.userControlVector.x = 0;
                    break;

                default:
                    break;
            }
            this.userDirectionVector.copy(this.getUserDirection());
        });

        document.addEventListener("mousemove", (event) => {
            this.rotateY(event.movementX / 200);
            this.camera.position.y = Math.max(
                this.camera.position.y - event.movementY / 100,
                0
            );
            this.camera.lookAt(this.position);

            this.userDirectionVector.copy(this.getUserDirection());
        });
    }

    public update(delta: number) {
        const currentSpeed = this.energyVector.length();

        // Применяем ускорение
        if (this.userDirectionVector.length() > 0) {
            this.energyVector.add(
                this.userDirectionVector.clone().multiplyScalar(ACCELERATION)
            );
        }

        if (currentSpeed > 0) {
            // Применяем силу трения
            this.energyVector.add(
                this.energyVector
                    .clone()
                    .negate()
                    .multiplyScalar(STOP_ACCELERATION)
            );

            const movedDistantion = delta * currentSpeed;
            this.position.add(
                this.energyVector.clone().setLength(movedDistantion)
            );
            this.notifyMovement();
        }
    }

    public getCamera(): PerspectiveCamera {
        return this.camera;
    }

    public subscribeShot(onShot: (position: Vector3, direction: Vector3) => void) {
        this.shotListeners.push(onShot);
    }

    public subscribeMovement(onMove: (position: Vector3) => void) {
        this.moveListeners.push(onMove);
    }

    private notifyMovement() {
        this.moveListeners.forEach((listener) => {
            listener(this.position.clone());
        });
    }

    private getUserDirection(): Vector3 {
        const lookVector = this.getCameraLookDirection();

        let angle = Math.atan2(lookVector.z, lookVector.x);
        angle -= Math.PI * 0.5;
        angle += angle < 0 ? Math.PI * 2 : 0;

        return this.userControlVector.clone().applyAxisAngle(TOP_VECTOR, angle);
    }

    private getCameraLookDirection(): Vector3 {
        const lookVector = this.position
            .clone()
            .sub(this.camera.getWorldPosition(new Vector3(0, 0, 0)))
            .normalize();
        lookVector.y = 0;

        return lookVector;
    }

    private shot() {
        this.shotListeners.forEach((listener) => {
            listener(this.position.clone(), this.getCameraLookDirection());
        });
    }
}
