import { Mesh } from 'three';
import { IHitable } from './IHitable';

export interface ICharacter extends IHitable, Mesh {
    update(delta: number, time: number): void;
}