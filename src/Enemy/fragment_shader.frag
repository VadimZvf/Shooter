precision highp float;
uniform float uSparkleTime;
uniform float uTime;

#define SPARKLE_DURATION 0.2

void main(void) {
    vec4 currentPointColor = vec4(1.0, 0.0, 0.0, 1.0);

    float leftTime = uTime - uSparkleTime;

    float sparkState = sin(
        smoothstep(0.0, SPARKLE_DURATION, leftTime) * 3.14
    );

    vec4 sparkColor = vec4(1.0, 1.0, 1.0, 1.0) * sparkState;

    currentPointColor += sparkColor;

    gl_FragColor = currentPointColor;
}