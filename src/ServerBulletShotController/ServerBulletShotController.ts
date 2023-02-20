import EventEmitter from 'events';
import { IHitable } from '../IHitable';
import Bullet from '../Bullet';

export class ServerBulletShotController {
    public events = new EventEmitter();

    public update(time: number, bullets: Set<Bullet>, enemies: Map<number, IHitable>, remotePlayers: Map<number, IHitable>, playerId: number, player: IHitable) {
        bullets.forEach((bullet) => {
            for (const [id, target] of enemies) {
                target.recalculateBoundingBox();
                const isHit = bullet.isHit(target.getBox());

                if (isHit) {
                    bullet.hit();
                    target.hit(time, bullet.getDirection());

                    this.events.emit('hit', id);

                    return;
                }
            }

            for (const [id, target] of remotePlayers) {
                if (id === bullet.ownerID) {
                    continue;
                }

                target.recalculateBoundingBox();
                const isHit = bullet.isHit(target.getBox());

                if (isHit) {
                    bullet.hit();
                    target.hit(time, bullet.getDirection());

                    this.events.emit('hit', id);

                    return;
                }
            }

            if (bullet.ownerID !== playerId) {
                player.recalculateBoundingBox();

                const isHit = bullet.isHit(player.getBox());

                if (isHit) {
                    bullet.hit();
                    player.hit(time, bullet.getDirection());

                    this.events.emit('hit', playerId);

                    return;
                }
            }
        });
    }
}
