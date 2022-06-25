import { Group, Box3, Vector3 } from "three";
import Bullet from "./Bullet";

interface IHitable {
    getBox(): Box3;
    hit(): void;
}

export default class BulletShotController extends Group {
    bullets: Array<Bullet> = [];

    public addBullet(bullet: Bullet) {
        this.add(bullet);
        this.bullets.push(bullet);
    }

    public update(delta: number, targets: Array<IHitable>) {
        this.bullets.forEach((bullet) => {
            bullet.update(delta);

            const hitedTarget = targets.find((target) => {
                return bullet.isHit(target.getBox());
            });

            if (hitedTarget) {
                hitedTarget.hit();

                this.remove(bullet);

                const index = this.bullets.indexOf(bullet);
                if (index > -1) {
                    this.bullets.splice(index, 1);
                }
            }
        });
    }
}
