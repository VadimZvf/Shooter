import {Vector3} from 'three';
import {ICharacter} from '../ICharacter';
import Enemy from '../Enemy';

export interface IEnemyController {
    update(delta: number, time: number, players: ICharacter[]): void;

    spawn(id: number, position: Vector3): Enemy;

    getEnemies(): [number, Enemy][];

    die(id: number): void;

    hit(id: number, time: number): void;

    move(id: number, position: Vector3): void;
}
