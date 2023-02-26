import { Group, Mesh, TextureLoader, PlaneGeometry, MeshBasicMaterial, Vector3, SpriteMaterial, Sprite } from 'three';
import tree from './tree.png';

const treeSprite = new TextureLoader().load(tree);

const COLOR = 0xacbc8a;

export default class Plane extends Group {
    private grid: Mesh;

    constructor() {
        super();

        for (let index = 0; index < 30; index++) {
            const tree = new Sprite(new SpriteMaterial({ map: treeSprite }));

            const x = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            tree.scale.set(15, 15, 15);
            tree.position.set(x, 4, z);

            this.add(tree);
        }

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
