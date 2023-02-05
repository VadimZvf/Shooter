import { Group, Box3 } from 'three';

export interface ICharacter extends Group {
    update(delta: number, time: number): void;

    hit: (time: number) => void;

    getBox(): Box3;
}
