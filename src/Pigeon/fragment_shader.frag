precision highp float;
uniform sampler2D uSpriteSheet;
uniform float uTime;
uniform float uSpritesPerAnimation;
uniform float uAnimationCount;
uniform float uCurrentAnimation;
uniform float uIsInvertSprite;
varying vec2 vTextureCoord;

#define ANIMATION_TIME 0.5

void main(void) {
    float x = vTextureCoord.x;

    if (uIsInvertSprite == 0.0) {
        x = 1.0 - vTextureCoord.x;
    }

    float currentSlideIndex = floor((mod(uTime, ANIMATION_TIME) / ANIMATION_TIME) * uSpritesPerAnimation);
    float indexInSheet = (uCurrentAnimation * uSpritesPerAnimation) + currentSlideIndex;
    float xSpriteStartPosition = indexInSheet / (uSpritesPerAnimation * uAnimationCount);

    float xSpriteSize = 1.0 / (uSpritesPerAnimation * uAnimationCount);
    float xPositionInSprite = x * xSpriteSize;
    float xPosition = xSpriteStartPosition + xPositionInSprite;

    vec4 color = texture2D(
        uSpriteSheet,
        vec2(xPosition, vTextureCoord.y)
    );

    gl_FragColor = color;
}