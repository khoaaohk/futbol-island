/**
 * See-through when close (Oct 22 2026; user, at Turtle Pool: "when swimming through things like this, it needs to be see through").
 * Soft things in the reef room (fish and schools, jellies, rays, turtles, the zone friend, kelp, sea grass, fans, anemones) fade to
 * PROXIMITY_FADE.min as the diver gets within PROXIMITY_FADE.near m of them, from 1 at .far m; anything between the camera and the
 * diver fades the same way (a turtle passing in front of the lens). Solid things (the wreck, rocks, the arch) never fade: they collide
 * and the camera pulls in for them (lib/town/water/diveSolids.ts).
 *
 * Cost: the fade is computed per VERTEX from the uniforms each material already has (the diver: the room's shared uDiver; the camera:
 * the shared uCam), and the fragment shader does a screen-door dither (an interleaved-gradient threshold, `discard` below it): no
 * sorting, no blending, no new draw, no per-frame uniform write. Compiled out (no discard at all) with `calm` / Battery saver / heat
 * tier 2+ (`lite`): there the plain opaque program keeps early depth testing.
 *
 * For other materials (e.g. a new creature): put PROXIMITY_FADE_GLSL in the vertex shader's header, set
 * `vDvFade=dvProxFade(worldPos,diverPos,cameraPos);` in main, and PROXIMITY_DITHER_GLSL + `dvDitherDiscard(vDvFade);` in the fragment.
 */
export const PROXIMITY_FADE={near:.8,far:2.5,min:.15} as const;
/** The fade (opacity share, min .. 1) at distance d (m): smoothstep from near to far. */
export function proximityFade(d:number){const {near,far,min}=PROXIMITY_FADE,k=Math.max(0,Math.min(1,(d-near)/(far-near)));return min+(1-min)*k*k*(3-2*k);}
const f=(v:number)=>v.toFixed(3);
/** Vertex: the fade of a world point from its distance to the diver and to the camera-to-diver line. */
export const PROXIMITY_FADE_GLSL=/* glsl */`
varying float vDvFade;
float dvProxFade(vec3 w,vec3 diver,vec3 cam){vec3 ab=diver-cam;float t=clamp(dot(w-cam,ab)/max(dot(ab,ab),1e-4),0.,1.);
 float d=min(length(w-diver),length(w-cam-ab*t));return mix(${f(PROXIMITY_FADE.min)},1.,smoothstep(${f(PROXIMITY_FADE.near)},${f(PROXIMITY_FADE.far)},d));}
`;
/** Fragment: the screen-door dither (no blending, no sort). */
export const PROXIMITY_DITHER_GLSL=/* glsl */`
varying float vDvFade;
void dvDitherDiscard(float a){if(a<.999&&a<fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715)))))discard;}
`;
