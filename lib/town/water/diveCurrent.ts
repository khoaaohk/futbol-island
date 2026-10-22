/**
 * Explore life (Oct 21 2026; docs/swimming-research.md §13, docs/performance-guide.md "Explore life"). User: "improve the explore
 * swimming scenes ... make that more life like. improve animation, water movements, light shining down. corals. all this without
 * additional heat. also find heat savings in that scene as well".
 *
 * Pure numbers shared by the reef room's shaders (lib/graphics/diveRoom.ts) and the tests (tests/explore-life.cjs): ONE slow current
 * and swell that every moving thing in the room follows (plants, plankton, the god rays, the camera's breath), the sun's slant, the
 * water's colour absorption with depth (red fades first), the room's phone pixel ratios and the deep rest. No three.js here.
 */

/** The reef's current: a slow surge along `dir` (unit, room x / z), a swell of `period` seconds travelling down-current (`wave` rad per
 *  metre, so neighbouring plants lean one after another, not in lock-step), `surge` metres of sway at the tip of a plant, `flutter`
 *  metres of each plant's own small quick motion on top. */
export const DIVE_CURRENT={dir:[.8,.6] as const,period:10,wave:.18,surge:.2,flutter:.05,drift:.14} as const;
/** The whole scene's slow breath (the swell lifting the water column): the camera rises and falls this many metres, the rays pulse. */
export const DIVE_BREATH_M=.035;
/** The swell's phase at time t (s) and room point (x, z): -1..1, one period every DIVE_CURRENT.period seconds, travelling down-current. */
export function diveSwell(t:number,x=0,z=0){const c=DIVE_CURRENT;return Math.sin(t*Math.PI*2/c.period-(x*c.dir[0]+z*c.dir[1])*c.wave);}
/** A plant tip's sway (metres along the current) at weight w (0 at the root .. 1 at the tip): the swell's surge, always a little more
 *  down-current than up (the current leans it), plus its own flutter (seed). Bounded by (surge * 1.35 + flutter) * w². */
export function diveSway(t:number,x:number,z:number,w:number,seed:number){const c=DIVE_CURRENT,s=diveSwell(t,x,z),k=w*w;
 return (c.surge*(.35+s)+c.flutter*Math.sin(t*1.7+seed))*k;}
/** The GLSL twin of diveSwell / diveSway (the same constants), for the room's vertex shaders. Needs `uniform float uDiveTime`. */
export const DIVE_CURRENT_GLSL=/* glsl */`
const vec2 DV_CUR=vec2(${DIVE_CURRENT.dir[0].toFixed(3)},${DIVE_CURRENT.dir[1].toFixed(3)});
float dvSwell(vec2 p){return sin(uDiveTime*${(Math.PI*2/DIVE_CURRENT.period).toFixed(5)}-dot(p,DV_CUR)*${DIVE_CURRENT.wave.toFixed(3)});}
`;

/** The sun's slant under the water: light shafts go this many metres along +x / +z per metre down (the same side the surface preview's
 *  light lines come from). */
export const DIVE_SUN={x:.3,z:.12} as const;
/** Colour absorption per metre of water above a point (linear rgb): red fades first, then green; blue stays. Floors keep a deep reef
 *  from going black (kid-friendly, the shore's muted look). */
export const DIVE_ABSORB={k:[.1,.04,.02] as const,floor:[.5,.75,.88] as const};
/** The rgb multiplier at `depth` metres under the surface. */
export function diveAbsorb(depth:number,out:[number,number,number]=[1,1,1]){const d=Math.max(0,depth);
 for(let i=0;i<3;i++)out[i]=Math.max(DIVE_ABSORB.floor[i],Math.exp(-DIVE_ABSORB.k[i]*d));return out;}
/** GLSL twin of diveAbsorb: a per-VERTEX varying (zero fragment cost). */
export const DIVE_ABSORB_GLSL=/* glsl */`
vec3 dvAbsorb(float d){d=max(0.,d);return max(vec3(${DIVE_ABSORB.floor.map(v=>v.toFixed(3)).join(',')}),exp(-vec3(${DIVE_ABSORB.k.map(v=>v.toFixed(3)).join(',')})*d));}
`;

/** Heat: the room on a phone draws at a lower pixel ratio than the island (soft, fogged water hides it): MOVING while swimming,
 *  REST once still (the island's 1.5 / 1.75). Heat tiers still cap lower; desktop is untouched. */
export const DIVE_PIXEL_RATIO={moving:1.25,rest:1.5} as const;
/** Heat: after this long resting in the room (no stick, nothing the player moved still moving) a deeper rest: 12 fps. */
export const DIVE_DEEP_REST_MS=60000,DIVE_DEEP_FRAME_MS=1000/12;
/** The room's pixel-ratio cap for a device class: phones get DIVE_PIXEL_RATIO, desktop none (Infinity). */
export function divePixelCap(phone:boolean,moving:boolean){return phone?(moving?DIVE_PIXEL_RATIO.moving:DIVE_PIXEL_RATIO.rest):Infinity;}
/** The room's rest frame (ms between frames; 0 = no cap): the island's rest interval, deeper after DIVE_DEEP_REST_MS of rest. */
export function diveRestFrame(restFrame:number,restMs:number){return restFrame>0&&restMs>=DIVE_DEEP_REST_MS?Math.max(restFrame,DIVE_DEEP_FRAME_MS):restFrame;}

/** Fish LOD: a school fish's triangles. Schools of small fish use the room's own low-poly reef fish (lib/graphics/diveFish.ts) instead of
 *  the fishing catalogue's close-up models (~380-430 triangles each). */
export const DIVE_SCHOOL_FISH_TRIS=96;
