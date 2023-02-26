import { TextureLoader, ShaderMaterial, PlaneGeometry, Mesh } from 'three';
import vertexShader from './vertex_shader.frag';
import fragmentShader from './fragment_shader.frag';

interface IParams {
    spriteUrl: string;
    animationsCount: number;
    initialAnimaton: number;
    spritesPerAnimation: number;
}

export default class AnimatedSprite extends Mesh<PlaneGeometry, ShaderMaterial> {
    constructor(params: IParams) {
        const texture = new TextureLoader().load(params.spriteUrl);
        const geometry = new PlaneGeometry(3, 3);
        const material = new ShaderMaterial({
            uniforms: {
                uSpriteSheet: { value: texture },
                uTime: { value: 1.0 },
                uAnimationCount: { value: params.animationsCount },
                uCurrentAnimation: { value: params.initialAnimaton },
                uSpritesPerAnimation: { value: params.spritesPerAnimation },
                uIsInvertSprite: { value: 0 },
            },
            vertexShader,
            fragmentShader,
            transparent: true,
        });

        super(geometry, material);

        this.position.setY(1.1);
    }

    public update(delta: number, time: number) {
        this.material.uniforms.uTime.value = time;
    }

    public setAnimation(index: number, isInvert: boolean = false) {
        this.material.uniforms.uCurrentAnimation.value = index;
        this.material.uniforms.uIsInvertSprite.value = isInvert ? 1 : 0;
    }
}
