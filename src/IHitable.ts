import { Box3, Vector3 } from 'three';

export interface IHitable {
    hit: (time: number, direction: Vector3) => void;

    getBox(): Box3;

    recalculateBoundingBox(): void;

    position: Vector3;
}
