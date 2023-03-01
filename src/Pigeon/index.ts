import { Vector3 } from 'three';
import AnimatedSprite from '../AnimatedSprite';
import sprites from './sprite_sheet.png';

export default class Pigeon extends AnimatedSprite {
    constructor() {
        super({
            spriteUrl: sprites,
            animationsCount: 5,
            spritesPerAnimation: 6,
            initialAnimaton: 3,
        });

        this.position.setY(0.8);
    }

    public lookDirection(direction: Vector3) {
        const angle = Math.atan2(direction.z, direction.x);

        const sateIndex = Math.round(((angle + Math.PI) / (Math.PI * 2)) * 8);
        const looped = sateIndex === 8 ? 0 : sateIndex;

        switch (looped) {
            case 0:
                // WALK_LEFT
                this.setAnimation(2, false);
                break;
            case 1:
                // WALK_LEFT_UP
                this.setAnimation(4, false);
                break;
            case 2:
                // WALK_UP
                this.setAnimation(3, false);
                break;
            case 3:
                // WALK_RIGHT_UP
                this.setAnimation(4, true);
                break;
            case 4:
                // WALK_RIGHT
                this.setAnimation(2, true);
                break;
            case 5:
                // WALK_RIGHT_DOWN
                this.setAnimation(1, true);
                break;
            case 6:
                // WALK_DOWN
                this.setAnimation(0, false);
                break;
            case 7:
                // WALK_LEFT_DOWN
                this.setAnimation(1, false);
                break;

            default:
                break;
        }
    }
}
