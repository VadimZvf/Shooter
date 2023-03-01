import { Group, Mesh, TextureLoader, PlaneGeometry, MeshBasicMaterial, Vector3, SpriteMaterial, Sprite } from 'three';
import tree from './tree.png';

const treeSprite = new TextureLoader().load(tree);

const COLOR = 0xacbc8a;

export default class Plane extends Group {
    private grid: Mesh;
    private treesPositions: Vector3[] = [];

    constructor() {
        super();

        this.grid = new Mesh(new PlaneGeometry(1000, 1000), new MeshBasicMaterial({ color: COLOR }));
        this.grid.rotateX(-Math.PI / 2);
        this.add(this.grid);
    }

    public update(time: number) {}

    public initialize() {
        for (let index = 0; index < 30; index++) {
            const x = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            this.addTree(x, z);
        }
    }

    public initializeFromData(treesPositions: Array<{ x: number; z: number }>) {
        for (let index = 0; index < treesPositions.length; index++) {
            this.addTree(treesPositions[index].x, treesPositions[index].z);
        }
    }

    public addTree(x: number, z: number) {
        const tree = new Sprite(new SpriteMaterial({ map: treeSprite }));

        tree.scale.set(15, 15, 15);
        tree.position.set(x, 3.8, z);

        this.treesPositions.push(tree.position);

        this.add(tree);
    }

    public getTreesData(): Array<{ x: number; z: number }> {
        return this.treesPositions.map((vector) => ({ x: vector.x, z: vector.z }));
    }

    public getGround(): Mesh {
        return this.grid;
    }

    public setCenter(point: Vector3) {
        this.grid.position.x = point.x;
        this.grid.position.z = point.z;
    }
}
