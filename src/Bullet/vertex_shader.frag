uniform float uTime;
varying vec2 vTextureCoord;
varying float intensity;

void main() {
    vTextureCoord = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vec3 actualNormal = vec3(modelMatrix * vec4(normal, 0.0));
    intensity = pow(dot(normalize(vec3(0.0, 0.0, 1.0)), actualNormal), 10.0);
}
