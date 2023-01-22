import EventEmitter from "events";
import {
    Mesh,
    ShaderMaterial,
    SphereBufferGeometry,
    Box3,
    Vector3,
} from "three";
import fragmentShader from './fragment_shader.frag';
import vertexShader from './vertex_shader.frag';

const SPEED = 50;
const LIFE_TIME = 60;

export default class Bullet extends Mesh {
    private direction: Vector3;
    private startTime: number;
    public events = new EventEmitter();
    public material: ShaderMaterial;

    constructor(position: Vector3, direction: Vector3) {
        const geometry = new SphereBufferGeometry(0.1, 10, 10);
        const material = new ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uSparkleTime: { value: 0 },
            },
            vertexShader,
            fragmentShader,
        });
        super(geometry, material);

        this.position.copy(position);
        this.position.y += 0.5;
        this.updateMatrix();
        this.updateMatrixWorld(true);

        this.recalculateBoundingBox();

        this.direction = direction;
    }

    private recalculateBoundingBox() {
        this.geometry.computeBoundingBox();
        this.geometry.boundingBox.applyMatrix4(this.matrixWorld);
    }

    public isHit(box: Box3): boolean {
        return this.geometry.boundingBox.intersectsBox(box);
    }

    public update(delta: number, time: number) {
        this.material.uniforms.uTime.value = time;
        if (!this.startTime) {
            this.startTime = time;
        }

        const distantion = delta * SPEED;
        this.position.add(this.direction.clone().setLength(distantion));
        this.recalculateBoundingBox();

        if (time - this.startTime > LIFE_TIME) {
            this.events.emit('die');
        }
    }
}
