import { GridHelper, PlaneGeometry, ShaderMaterial, Vector2, Vector3 } from "three";

const GRID_CELL_SIZE = 800;
const GRID_SIZE = 60;

export default class Plane extends GridHelper {
    constructor() {
        super(GRID_CELL_SIZE, GRID_SIZE, 0xFF00CC, 0xFF00CC);
        const geometry = new PlaneGeometry(10, 10);

        const material = new ShaderMaterial({
            uniforms: {
              speedZ: {
                value: 10
              },
              gridLimits: {
                value: new Vector2(-200, 200)
              },
              time: {
                value: 0
              }
            },
            vertexShader: `
              uniform float time;
              uniform vec2 gridLimits;
              uniform float speedZ;
              
              attribute float moveableZ;
              
              varying vec3 vColor;
            
              void main() {
                vColor = color;
                vec3 pos = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
            `,
            fragmentShader: `
              varying vec3 vColor;
            
              void main() {
                gl_FragColor = vec4(vColor, 1.);
              }
            `,
            vertexColors: true,
          });


        this.material = material;
        this.position.set(0, 0, 0);
    }

    public update(time: number) {
        if (this.material instanceof ShaderMaterial && this.material.uniforms) {
            // this.material.uniforms.time.value = time;
            this.material.needsUpdate = true;
        }
    }

    public setCenter(point: Vector3) {
      
    }
}