import { Group, Box3, Vector3 } from "three";
import Bullet from "./Bullet";
import Room from "./Room";

interface IHitable {
    getBox(): Box3;
    hit(time: number): void;
}

export default class BulletShotController extends Group {
    private bullets = new Set<Bullet>();
    private room: Room;

    constructor(room: Room) {
        super();
        this.room = room;
    }

    public addBullet(bullet: Bullet) {
        this.add(bullet);
        this.bullets.add(bullet);
        bullet.events.addListener('die', () => {
            this.remove(bullet);
            this.bullets.delete(bullet);
        });
    }

    public update(delta: number, time: number, targets: [number, IHitable][]) {
        this.bullets.forEach((bullet) => {
            bullet.update(delta, time);

            const hitedTarget = targets.find(([id, target]) => {
                return bullet.isHit(target.getBox());
            });

            if (hitedTarget) {
                this.remove(bullet);
                this.bullets.delete(bullet);

                if (this.room.getIsHost()) {
                    hitedTarget[1].hit(time);
                }
            }
        });
    }
}
