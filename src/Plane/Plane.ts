import { Group, Mesh, PlaneGeometry, MeshBasicMaterial, Vector3 } from 'three';

const COLOR = 0xacbc8a;

export default class Plane extends Group {
    private grid: Mesh;

    constructor() {
        super();

        this.grid = new Mesh(new PlaneGeometry(1000, 1000), new MeshBasicMaterial({ color: COLOR }));
        this.grid.rotateX(-Math.PI / 2);
        this.add(this.grid);
    }

    public update(time: number) {}

    public getGround(): Mesh {
        return this.grid;
    }

    public setCenter(point: Vector3) {
        this.grid.position.x = point.x;
        this.grid.position.z = point.z;
    }
}
