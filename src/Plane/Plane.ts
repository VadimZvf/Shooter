import { Group, GridHelper, ShaderMaterial, MeshBasicMaterial, Vector2, Vector3 } from "three";

const GRID_SIZE = 1200;
const GRID_CELLS_COUNT = 60;
const CELL_SIZE = GRID_SIZE / GRID_CELLS_COUNT;

const COLOR = 0xFF00CC;

export default class Plane extends Group {
    private grid: GridHelper;
    private mountains: GridHelper;

    constructor() {
        super();

        this.grid = new GridHelper(GRID_SIZE, GRID_CELLS_COUNT, COLOR, COLOR);
        this.grid.material = new MeshBasicMaterial({ color: COLOR });
        this.grid.position.set(0, 0, 0);
        this.add(this.grid);


        this.mountains = new GridHelper(GRID_SIZE, GRID_CELLS_COUNT, COLOR, COLOR);
        this.mountains.material = new ShaderMaterial({
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
        // this.add(this.mountains);
    }

    public update(time: number) {
        if (this.grid.material instanceof ShaderMaterial && this.grid.material.uniforms) {
            // this.material.uniforms.time.value = time;
            this.grid.material.needsUpdate = true;
        }
    }

    public setCenter(point: Vector3) {
      this.grid.position.x = Math.floor(point.x / CELL_SIZE) * CELL_SIZE;
      this.grid.position.z = Math.floor(point.z / CELL_SIZE) * CELL_SIZE;
    }
}