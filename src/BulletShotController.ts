import { Group } from 'three';
import Bullet from './Bullet';

export default class BulletShotController extends Group {
    public bullets = new Set<Bullet>();

    public addBullet(bullet: Bullet) {
        this.add(bullet);
        this.bullets.add(bullet);
        bullet.events.addListener('die', () => {
            this.remove(bullet);
            this.bullets.delete(bullet);
        });
    }

    public deleteBullet(bullet: Bullet) {
        this.bullets.delete(bullet);
    }

    public update(delta: number, time: number) {
        this.bullets.forEach((bullet) => {
            bullet.update(delta, time);
        });
    }
}
