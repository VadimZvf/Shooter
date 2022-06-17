import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  PlaneGeometry,
  Clock,
  Vector2,
} from "three";

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const CAMERA_MOVE_INTENSITY = 0.1;

const MAX_USER_SPEED = 10;
const ACCELERATION = 0.1;

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
  const userMoveDirection = new Vector2(0, 0);

  const plane = new Mesh(
    new PlaneGeometry(10, 10),
    new MeshBasicMaterial({ color: 0xaaaaaa })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(0, 0, 0);
  scene.add(plane);
  let currentUserSpeed = 0;

  function animate() {
    const delta = clock.getDelta();
    const movedDistantion = delta * currentUserSpeed;
    const directionVectorlength = Math.sqrt(userMoveDirection.x * userMoveDirection.x + userMoveDirection.y * userMoveDirection.y);

    if (directionVectorlength > 0) {
        console.log('двигайся ', currentUserSpeed);
        if (currentUserSpeed < MAX_USER_SPEED) {
            console.log('разгон ', currentUserSpeed);
            currentUserSpeed += ACCELERATION;
        }
    } else {
        console.log('стой ', currentUserSpeed);
        if (currentUserSpeed > 0) {
            console.log('тормоз ', currentUserSpeed);
            currentUserSpeed -= ACCELERATION;
        }
        
        if (currentUserSpeed <= 0) {
            userMoveDirection.x = 0;
            userMoveDirection.y = 0;
        }
    }

    if (currentUserSpeed > 0) {
        const coef = movedDistantion / directionVectorlength;

        user.position.x += (userMoveDirection.x * coef);
        user.position.z += (userMoveDirection.y * coef);
    }

    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  animate();

  document.addEventListener("keydown", (event) => {
    switch (event.code) {
      case "KeyW":
        userMoveDirection.y = -1;
        break;
      case "KeyS":
        userMoveDirection.y = 1;
        break;
      case "KeyA":
        userMoveDirection.x = -1;
        break;
      case "KeyD":
        userMoveDirection.x = 1;
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
