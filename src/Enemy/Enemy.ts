import {
    Group,
    BoxGeometry,
    Mesh,
    Vector3,
    Box3,
    ShaderMaterial,
} from "three";
import { ICharacter } from "../ICharacter";
import fragmentShader from './fragment_shader.frag';
import vertexShader from './vertex_shader.frag';

export default class Enemy extends Group implements ICharacter {
    private geometry: BoxGeometry;
    private material: ShaderMaterial;
    private mesh: Mesh;

    constructor(startPosition: Vector3) {
        super();

        this.geometry = new BoxGeometry(1, 1, 1);
        this.material = new ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uSparkleTime: { value: 0 },
            },
            vertexShader,
            fragmentShader,
        });
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.position.y = 0.5;
        this.position.copy(startPosition);
        this.add(this.mesh);
        this.recalculateBoundingBox();
    }

    public update(delta: number, time: number) {
        this.material.uniforms.uTime.value = time;
    }

    public move(position: Vector3) {
        this.position.copy(position);
        this.position.y = 0;
    }

    public hit(time: number) {
        this.material.uniforms.uSparkleTime.value = time;
    }

    public getBox(): Box3 {
        return this.geometry.boundingBox;
    }

    private recalculateBoundingBox() {
        this.geometry.computeBoundingBox();
        this.geometry.boundingBox.applyMatrix4(this.mesh.matrixWorld);
    }
}
