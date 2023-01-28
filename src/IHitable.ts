import { Vector3 } from "three";

export interface IHitable {
    hit: (time: number) => void;

    position: Vector3;
}