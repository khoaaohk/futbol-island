// Busy friends' force field (multiplayer presence, docs/multiplayer-design.md 4.4.1; user Oct 22 2026: "a green force field
// around them"). Heat: ONE InstancedMesh (capacity = party max) for every busy friend, one draw call, no shadows, no texture;
// a fresnel rim with a slow pulse in the shader (uTime frozen with reduced motion = a static dome); per-instance alpha, shake
// and impact ripple live in two small instanced attributes. Nothing is allocated per frame.
import * as T from 'three';
import { FIELD_CENTER_Y, FIELD_RADIUS } from '../town/forceFieldBounce';

export const FIELD_GREEN = '#5fe39a';

const VERT = /* glsl */`
attribute vec4 aField; // alpha, shake (0..1), ripple progress (0..1, >= 1 none), seed
attribute vec3 aHit;   // impact direction (unit, dome space)
uniform float uTime;
varying vec3 vN; varying vec3 vView; varying float vAlpha; varying float vRipple; varying float vBand;
void main(){
  vec3 n = normalize(normal);
  float shake = aField.y;
  vec3 p = position + n * shake * .09 * sin(uTime * 42. + dot(n, vec3(6., 9., 4.)) + aField.w * 6.283);
  vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.);
  vN = normalize(mat3(modelMatrix * instanceMatrix) * n);
  vView = normalize(cameraPosition - wp.xyz);
  vAlpha = aField.x;
  float age = aField.z, d = distance(n, aHit);
  vRipple = age < 1. ? (1. - age) * (smoothstep(.34, 0., abs(d - age * 1.7)) + (1. - smoothstep(0., .5, d)) * (1. - age)) : 0.;
  vBand = position.y * 7. + aField.w * 6.283;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const FRAG = /* glsl */`
uniform float uTime; uniform vec3 uColor;
varying vec3 vN; varying vec3 vView; varying float vAlpha; varying float vRipple; varying float vBand;
void main(){
  float fres = pow(1. - abs(dot(normalize(vN), normalize(vView))), 2.2);
  float pulse = .82 + .18 * sin(uTime * 1.8);
  float shimmer = .5 + .5 * sin(vBand - uTime * 1.4);
  float a = (.07 + .5 * fres * pulse + .06 * shimmer * fres + .75 * vRipple) * vAlpha;
  gl_FragColor = vec4(uColor * (.55 + .9 * fres + vRipple), a);
}`;

export interface ForceFields {
  readonly mesh: T.InstancedMesh;
  begin(): void;
  /** One busy friend's dome this frame: feet position, alpha 0..1, extra scale (the pop), shake 0..1, ripple 0..1 (>= 1 none), impact normal. */
  add(x: number, y: number, z: number, alpha: number, scale: number, shake: number, ripple: number, hx: number, hy: number, hz: number, seed: number): void;
  end(dt: number, reduced: boolean): void;
  dispose(): void;
}

const m4 = new T.Matrix4(), pos = new T.Vector3(), scl = new T.Vector3(), q = new T.Quaternion();

export function createForceFields(capacity: number): ForceFields {
  const geo = new T.SphereGeometry(1, 28, 18);
  const field = new T.InstancedBufferAttribute(new Float32Array(capacity * 4), 4), hit = new T.InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
  field.setUsage(T.DynamicDrawUsage); hit.setUsage(T.DynamicDrawUsage);
  geo.setAttribute('aField', field); geo.setAttribute('aHit', hit);
  const mat = new T.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: new T.Color(FIELD_GREEN) } }, toneMapped: false,
  });
  const mesh = new T.InstancedMesh(geo, mat, capacity);
  mesh.name = 'remote-force-fields'; mesh.frustumCulled = false; mesh.castShadow = mesh.receiveShadow = false; mesh.count = 0; mesh.renderOrder = 3;
  mesh.raycast = () => {};
  let n = 0;
  return {
    mesh,
    begin() { n = 0; },
    add(x, y, z, alpha, scale, shake, ripple, hx, hy, hz, seed) {
      if (n >= capacity || alpha <= .002) return;
      const r = FIELD_RADIUS * scale;
      pos.set(x, y + FIELD_CENTER_Y, z); scl.set(r, r, r); m4.compose(pos, q, scl); mesh.setMatrixAt(n, m4);
      field.setXYZW(n, alpha, shake, ripple, seed); hit.setXYZ(n, hx, hy, hz);
      n++;
    },
    end(dt, reduced) {
      mesh.count = n;
      if (n) { mesh.instanceMatrix.needsUpdate = true; field.needsUpdate = true; hit.needsUpdate = true; }
      if (!reduced) mat.uniforms.uTime.value = (mat.uniforms.uTime.value + dt) % 1000;
      mesh.visible = n > 0;
    },
    dispose() { mesh.removeFromParent(); geo.dispose(); mat.dispose(); },
  };
}
