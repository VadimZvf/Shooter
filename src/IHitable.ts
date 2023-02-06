import { Box3, Vector3 } from 'three';

export interface IHitable {
    hit: (time: number) => void;

    getBox(): Box3;

    position: Vector3;
}
