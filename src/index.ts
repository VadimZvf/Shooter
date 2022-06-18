import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  MeshBasicMaterial,
  Mesh,
  PlaneGeometry,
  Clock,
} from "three";
import Player from "./Player";
import Bullet from './Bullet';

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

function init() {
  const canvas = document.getElementById('root');

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Root is not canvas!!!');
  }

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

  const renderer = new WebGLRenderer({canvas});
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

  const user = new Player(canvas);
  const bullets: Array<Bullet> = [];
  user.subscribeShot((bullet) => {
    scene.add(bullet);
    bullets.push(bullet);
  });
  scene.add(user);

  const plane = new Mesh(
    new PlaneGeometry(10, 10),
    new MeshBasicMaterial({ color: 0xaaaaaa })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(0, 0, 0);
  scene.add(plane);

  function animate() {
    const delta = clock.getDelta();
    user.update(delta);

    bullets.forEach(bullet=> {
      bullet.update(delta);
    })

    requestAnimationFrame(animate);

    renderer.render(scene, user.getCamera());
  }

  animate();
}

init();
