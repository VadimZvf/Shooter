import EventEmitter from 'events';
import { IHitable } from '../IHitable';
import Bullet from '../Bullet';

export class ServerBulletShotController {
    public events = new EventEmitter();

    public update(time: number, bullets: Set<Bullet>, targets: Map<number, IHitable>) {
        bullets.forEach((bullet) => {
            for (const [id, target] of targets) {
                const isHit = bullet.isHit(target.getBox());

                if (isHit) {
                    bullet.hit();
                    target.hit(time);

                    this.events.emit('hit', id);

                    return;
                }
            }
        });
    }
}
