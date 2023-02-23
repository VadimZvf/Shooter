import { TextureLoader, ShaderMaterial, PlaneGeometry, Mesh } from 'three';
import sprites from './sprite_sheet.png';
import vertexShader from './vertex_shader.frag';
import fragmentShader from './fragment_shader.frag';

const texture = new TextureLoader().load(sprites);

type State = 'WALK_LEFT' | 'WALK_RIGHT' | 'WALK_UP' | 'WALK_DOWN' | 'WALK_LEFT_UP' | 'WALK_LEFT_DOWN' | 'WALK_RIGHT_UP' | 'WALK_RIGHT_DOWN';

export default class Pigeon extends Mesh<PlaneGeometry, ShaderMaterial> {
    constructor() {
        const geometry = new PlaneGeometry(3, 3);
        const material = new ShaderMaterial({
            uniforms: {
                uSpriteSheet: { value: texture },
                uTime: { value: 1.0 },
                uSpritesPerAnimation: { value: 6 },
                uAnimationCount: { value: 5 },
                uCurrentAnimation: { value: 3 },
                uIsInvertSprite: { value: 0 },
            },
            vertexShader,
            fragmentShader,
            transparent: true,
        });

        super(geometry, material);

        this.position.setY(3);
    }

    public update(delta: number, time: number) {
        this.material.uniforms.uTime.value = time;
    }

    public setState(state: State) {
        switch (state) {
            case 'WALK_DOWN':
                this.material.uniforms.uCurrentAnimation.value = 0;
                this.material.uniforms.uIsInvertSprite.value = 0;
                break;
            case 'WALK_UP':
                this.material.uniforms.uCurrentAnimation.value = 3;
                this.material.uniforms.uIsInvertSprite.value = 0;
                break;
            case 'WALK_LEFT':
                this.material.uniforms.uCurrentAnimation.value = 2;
                this.material.uniforms.uIsInvertSprite.value = 0;
                break;
            case 'WALK_RIGHT':
                this.material.uniforms.uCurrentAnimation.value = 2;
                this.material.uniforms.uIsInvertSprite.value = 1;
                break;
            case 'WALK_LEFT_UP':
                this.material.uniforms.uCurrentAnimation.value = 4;
                this.material.uniforms.uIsInvertSprite.value = 0;
                break;
            case 'WALK_RIGHT_UP':
                this.material.uniforms.uCurrentAnimation.value = 4;
                this.material.uniforms.uIsInvertSprite.value = 1;
                break;
            case 'WALK_LEFT_DOWN':
                this.material.uniforms.uCurrentAnimation.value = 1;
                this.material.uniforms.uIsInvertSprite.value = 0;
                break;
            case 'WALK_RIGHT_DOWN':
                this.material.uniforms.uCurrentAnimation.value = 1;
                this.material.uniforms.uIsInvertSprite.value = 1;
                break;

            default:
                break;
        }
    }
}
