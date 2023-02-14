import { PerspectiveCamera, Vector3 } from 'three';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
const CAMERA_DISTANTION = 10;
const CAMERA_HEIGHT = 15;

const CAMERA_ACCELERATION = 0.8;
const CAMERA_ACCELERATION_DISTANTION = 10;

export class PlayerCamera {
    private camera: PerspectiveCamera = new PerspectiveCamera(90, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
    private cameraSpeed: number = 0;
    private targetPotision: Vector3;

    constructor(playerPosition: Vector3) {
        window.addEventListener('resize', () => {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;
            this.camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
            this.camera.updateProjectionMatrix();
        });

        this.setTargetPosition(playerPosition);
        this.camera.position.copy(this.targetPotision);
        this.camera.lookAt(playerPosition);
    }

    public update(delta: number) {
        const distanceToTarget = this.camera.position.distanceTo(this.targetPotision);
        if (distanceToTarget > 0.5) {
            const cameraPositionShift = this.targetPotision
                .clone()
                .sub(this.camera.position)
                .setLength(this.cameraSpeed * delta);
            this.camera.position.add(cameraPositionShift);

            this.cameraSpeed = Math.min(CAMERA_ACCELERATION_DISTANTION, distanceToTarget) * CAMERA_ACCELERATION;
        } else {
            this.cameraSpeed = 0;
        }
    }

    public getCamera(): PerspectiveCamera {
        return this.camera;
    }

    public setTargetPosition(playerPosition: Vector3) {
        this.targetPotision = playerPosition
            .clone()
            .setY(CAMERA_HEIGHT)
            .setZ(playerPosition.z + CAMERA_DISTANTION);
    }
}
