import {
  PerspectiveCamera,
  Group,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  Scene,
  MathUtils,
} from "three";
import Bullet from "./Bullet";

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const CAMERA_DISTANTION = 10;

const MAX_USER_SPEED = 10;
const ACCELERATION = 0.1;
const STOP_ACCELERATION = 0.91;

const TOP_VECTOR = new Vector3(0, -1, 0);

export default class Player extends Group {
  private camera: PerspectiveCamera = new PerspectiveCamera(
    90,
    SCREEN_WIDTH / SCREEN_HEIGHT,
    0.1,
    1000
  );

  private energyVector: Vector3 = new Vector3(0, 0, 0);
  private userControlVector: Vector3 = new Vector3(0, 0, 0); // Нажатые клавиши
  private userDirectionVector: Vector3 = new Vector3(0, 0, 0); // Направление движения персонажа
  private shotListeners: Array<(bullet: Bullet) => void> = [];

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

    this.camera.position.z = CAMERA_DISTANTION;
    this.camera.position.y = 5;
    this.camera.lookAt(0, 0, 0);
    this.add(this.camera);

    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0x55ff99 });
    const box = new Mesh(geometry, material);
    box.position.y = 0.5;
    this.add(box);

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
    });
  }

  private getUserDirection(): Vector3 {
    const lookVector = this.position
      .clone()
      .sub(this.camera.getWorldPosition(new Vector3(0, 0, 0)))
      .normalize();
    lookVector.y = 0;

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
    const bullet = new Bullet(this.getCameraLookDirection());
    bullet.position.copy(this.position);
    this.shotListeners.forEach((listener) => {
      listener(bullet);
    });
  }

  public update(delta: number) {
    const currentSpeed = this.energyVector.length();

    if (this.userDirectionVector.length() > 0) {
      if (currentSpeed < MAX_USER_SPEED) {
        this.energyVector.add(
          this.userDirectionVector.clone().multiplyScalar(ACCELERATION)
        );
      }
    } else {
      if (currentSpeed > 0) {
        this.energyVector.multiplyScalar(STOP_ACCELERATION);
      }
    }

    if (currentSpeed > 0) {
      const movedDistantion = delta * currentSpeed;
      this.position.add(this.energyVector.clone().setLength(movedDistantion));
    }
  }

  public getCamera(): PerspectiveCamera {
    return this.camera;
  }

  public subscribeShot(onShot: (bullet: Bullet) => void) {
    this.shotListeners.push(onShot);
  }
}
