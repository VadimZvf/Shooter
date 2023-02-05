import { Object3D, Box3 } from 'three';

export interface IHitable extends Object3D {
    hit: (time: number) => void;

    getBox(): Box3;
}
