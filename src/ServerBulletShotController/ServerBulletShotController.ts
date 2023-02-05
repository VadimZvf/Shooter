import EventEmitter from 'events';
import { IHitable } from '../IHitable';
import Bullet from '../Bullet';

export class ServerBulletShotController {
    public update(time: number, bullets: Set<Bullet>, targets: [number, IHitable][]) {
        bullets.forEach((bullet) => {
            for (const [id, target] of targets) {
                const isHit = bullet.isHit(target.getBox());

                if (isHit) {
                    bullet.hit();
                    target.hit(time);

                    return;
                }
            }
        });
    }
}
