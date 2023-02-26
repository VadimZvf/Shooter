varying vec2 vTextureCoord;
void main() {
    vTextureCoord = uv;

    vec4 finalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
    finalPosition.xy += position.xy;
    finalPosition = projectionMatrix * finalPosition;

    gl_Position =  finalPosition;
}
