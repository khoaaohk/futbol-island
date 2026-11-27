/**
 * Boats rocking in place with the sea (Nov 26 2026, owner shot 152: "these boats in the middle of the sea need to be moving and have
 * the waves move with it. feels so flat and static", "moving as shifting back and forth not moving the boat around"). `?vehicles=0` =
 * the small bob before. Pure maths + two uniform arrays; no allocation per frame.
 *
 * - swellPose(): a closed-form pose from the SAME long swell the far sea draws (waterSurface.ts SKY_SEA_ALBEDO: phase
 *   dot(q, (.096, .128)) + 1.4 sin(q.x .011 + q.y .006) - .5 t on WATER_UNIFORMS.uWaterTime, ~39 m crests, ~12.6 s period): the boat
 *   heaves as a band passes under it and tilts with the band's slope along its own bow and beam (pitch / roll), plus a little roll that
 *   lags the slope (a hull rolls a beat late). Each boat's own position gives it its own phase; moored boats pass a small `amp`.
 *   About 30 float ops, called only for a boat that is built, near and on screen (deepSeaBoat.ts) or for the ferry (world.ts).
 * - The water rings: up to BOAT_RING_SLOTS hull ellipses in the ocean shader (waterSurface.ts BOAT_RING_GLSL): a soft foam ring where
 *   the hull meets the water and small lapping ripples running out from it on the same clock. Off on the still path (uWaterDetail < .5:
 *   reduced motion, Battery saver, heat tiers 3-4, governor slow); a slot whose strength is 0 costs one compare.
 */
import * as T from 'three';
export const SWELL_K=[.096,.128] as const,SWELL_W=.5;
export type SwellAmp={heave:number;pitch:number;roll:number};
/** Open-sea boats (on top of boatMotion.ts's 5.6 s bob) and a boat tied at a pier (much less). */
export const SWELL_AMP={sea:{heave:.07,pitch:.018,roll:.045},moored:{heave:.035,pitch:.004,roll:.012}} as const;
export type SwellPose={heave:number;pitch:number;roll:number};
/** The pose at world (x, z), water clock t, for a boat whose bow points along yaw (three.js y rotation of local +x). Writes `out`. */
export function swellPose(x:number,z:number,t:number,yaw:number,amp:SwellAmp,out:SwellPose){
 const wa=x*.011+z*.006,ph=SWELL_K[0]*x+SWELL_K[1]*z+1.4*Math.sin(wa)-SWELL_W*t,cw=1.4*Math.cos(wa);
 let gx=SWELL_K[0]+cw*.011,gz=SWELL_K[1]+cw*.006;const gl=Math.hypot(gx,gz)||1;gx/=gl;gz/=gl;
 const s=Math.sin(ph),c=Math.cos(ph),cy=Math.cos(yaw),sy=Math.sin(yaw);
 // bow = (cos yaw, -sin yaw), starboard = (sin yaw, cos yaw) in world xz
 const along=gx*cy-gz*sy,across=gx*sy+gz*cy;
 out.heave=amp.heave*s;
 out.pitch=amp.pitch*c*along;
 out.roll=-amp.roll*(c*across*.6+Math.sin(ph+.7)*.4);
 return out;
}
export const BOAT_RING_SLOTS=3;
/** Slot i: (x, z, cos yaw, sin yaw) and (half length, half beam, strength 0..1, reach squared). Slot 0 the ferry, 1-2 the deep-sea boats. */
export const BOAT_RING_UNIFORMS={uBoatRing:{value:Array.from({length:BOAT_RING_SLOTS},()=>new T.Vector4())},uBoatRingS:{value:Array.from({length:BOAT_RING_SLOTS},()=>new T.Vector4())}};
export function setBoatRing(slot:number,x:number,z:number,yaw:number,halfLength:number,halfBeam:number,strength:number){
 BOAT_RING_UNIFORMS.uBoatRing.value[slot].set(x,z,Math.cos(yaw),Math.sin(yaw));BOAT_RING_UNIFORMS.uBoatRingS.value[slot].set(halfLength,halfBeam,strength,(halfLength+3)*(halfLength+3));
}
/** The ocean's ring code (in the albedo stage; vWaterXZ, uWaterTime, uWaterDetail in scope). Static worst case (all slots lit, every branch) pinned in tests/ground-shader-cost.cjs BOAT_RING_ALU. */
export const BOAT_RING_GLSL=/* glsl */`
     if(uWaterDetail>.5){for(int i=0;i<${BOAT_RING_SLOTS};i++){vec4 bs=uBoatRingS[i];vec4 br=uBoatRing[i];vec2 dq=vWaterXZ-br.xy;
      if(bs.z>0.&&dot(dq,dq)<bs.w){vec2 bq=abs(vec2(dq.x*br.z-dq.y*br.w,dq.x*br.w+dq.y*br.z));
       float dm=length(max(bq-vec2(bs.x-bs.y,0.),0.))-bs.y;// metres outside the hull's stadium outline
       float k=1.-smoothstep(-.3,2.6,dm),f=k*k*k;// the foam hugs the hull, the ripples fade out by ~2.5 m
       diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.86,.95,.94),min((f*.5+(.5+.5*sin(dm*6.-uWaterTime*2.6))*k*.14)*bs.z,.5));}}}`;
