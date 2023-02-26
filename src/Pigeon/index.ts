import { Vector3 } from 'three';
import AnimatedSprite from '../AnimatedSprite';
import sprites from './sprite_sheet.png';

type State = 'WALK_LEFT' | 'WALK_RIGHT' | 'WALK_UP' | 'WALK_DOWN' | 'WALK_LEFT_UP' | 'WALK_LEFT_DOWN' | 'WALK_RIGHT_UP' | 'WALK_RIGHT_DOWN';

export default class Pigeon extends AnimatedSprite {
    constructor() {
        super({
            spriteUrl: sprites,
            animationsCount: 5,
            spritesPerAnimation: 6,
            initialAnimaton: 3,
        });

        this.position.setY(1.1);
    }

    public setState(state: State) {
        switch (state) {
            case 'WALK_DOWN':
                this.setAnimation(0, false);
                break;
            case 'WALK_UP':
                this.setAnimation(3, false);
                break;
            case 'WALK_LEFT':
                this.setAnimation(2, false);
                break;
            case 'WALK_RIGHT':
                this.setAnimation(2, true);
                break;
            case 'WALK_LEFT_UP':
                this.setAnimation(4, false);
                break;
            case 'WALK_RIGHT_UP':
                this.setAnimation(4, true);
                break;
            case 'WALK_LEFT_DOWN':
                this.setAnimation(1, false);
                break;
            case 'WALK_RIGHT_DOWN':
                this.setAnimation(1, true);
                break;

            default:
                break;
        }
    }

    public lookDirection(direction: Vector3) {
        const angle = Math.atan2(direction.z, direction.x);

        const sateIndex = Math.round(((angle + Math.PI) / (Math.PI * 2)) * 8);
        const looped = sateIndex === 8 ? 0 : sateIndex;

        switch (looped) {
            case 0:
                this.setState('WALK_LEFT');
                break;
            case 1:
                this.setState('WALK_LEFT_UP');
                break;
            case 2:
                this.setState('WALK_UP');
                break;
            case 3:
                this.setState('WALK_RIGHT_UP');
                break;
            case 4:
                this.setState('WALK_RIGHT');
                break;
            case 5:
                this.setState('WALK_RIGHT_DOWN');
                break;
            case 6:
                this.setState('WALK_DOWN');
                break;
            case 7:
                this.setState('WALK_LEFT_DOWN');
                break;

            default:
                break;
        }
    }
}
