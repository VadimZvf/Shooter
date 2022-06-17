import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  PlaneGeometry,
  Clock,
  Vector3,
} from "three";

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const CAMERA_MOVE_INTENSITY = 0.1;

const MAX_USER_SPEED = 10;
const ACCELERATION = 0.1;
const STOP_ACCELERATION = 0.91;

function init() {
  const clock = new Clock();
  const scene = new Scene();
  const camera = new PerspectiveCamera(
    90,
    SCREEN_WIDTH / SCREEN_HEIGHT,
    0.1,
    1000
  );
  camera.position.z = 10;
  camera.position.y = 5;
  camera.lookAt(0, 0, 0);

  const renderer = new WebGLRenderer();
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  document.body.appendChild(renderer.domElement);

  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshBasicMaterial({ color: 0x55ff99 });
  const user = new Mesh(geometry, material);
  user.position.y = 0.5;
  scene.add(user);
  const forceVector = new Vector3(0, 0, 0);
  const userControlVector = new Vector3(0, 0, 0);

  const plane = new Mesh(
    new PlaneGeometry(10, 10),
    new MeshBasicMaterial({ color: 0xaaaaaa })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(0, 0, 0);
  scene.add(plane);

  function animate() {
    const forseValue = forceVector.length();

    if (userControlVector.length() > 0) {
      if (forseValue < MAX_USER_SPEED) {
        forceVector.add(userControlVector.clone().multiplyScalar(ACCELERATION));
      }
    } else {
      if (forseValue > 0) {
        forceVector.multiplyScalar(STOP_ACCELERATION);
      }
    }

    if (forseValue > 0) {
      const delta = clock.getDelta();
      const movedDistantion = delta * forseValue;
      user.position.add(forceVector.clone().setLength(movedDistantion));
    }

    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  animate();

  document.addEventListener("keydown", (event) => {
    switch (event.code) {
      case "KeyW":
        userControlVector.z = 1;
        break;
      case "KeyS":
        userControlVector.z = -1;
        break;
      case "KeyA":
        userControlVector.x = 1;
        break;
      case "KeyD":
        userControlVector.x = -1;
        break;

      default:
        break;
    }
  });

  document.addEventListener("keyup", (event) => {
    switch (event.code) {
      case "KeyW":
        userControlVector.z = 0;
        break;
      case "KeyS":
        userControlVector.z = 0;
        break;
      case "KeyA":
        userControlVector.x = 0;
        break;
      case "KeyD":
        userControlVector.x = 0;
        break;

      default:
        break;
    }
  });

  document.addEventListener("mousemove", (event) => {
    const xDelta = (event.clientX - SCREEN_WIDTH / 2) * CAMERA_MOVE_INTENSITY;
    const yDelta = (event.clientY - SCREEN_HEIGHT / 2) * CAMERA_MOVE_INTENSITY;

    camera.position.x = xDelta;
    camera.position.z = yDelta;
    camera.lookAt(0, 0, 0);
  });
}

init();
