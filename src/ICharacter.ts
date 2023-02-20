import { Group, Box3, Vector3 } from 'three';

export interface ICharacter extends Group {
    update(delta: number, time: number): void;

    hit: (time: number, direction: Vector3) => void;

    getBox(): Box3;

    recalculateBoundingBox(): void;
}
