import { Group } from 'three';
import { IHitable } from './IHitable';

export interface ICharacter extends IHitable, Group {
    update(delta: number, time: number): void;
}
