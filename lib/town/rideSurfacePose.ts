import type {TravelMode} from './travelModes';
/** Match both wheel circles to stair surfaces; caller reuses the result. */
export function rideSurfacePose(mode:TravelMode,x:number,z:number,yaw:number,height:number,surface:(x:number,z:number)=>number,out:{height:number;pitch:number}){
 const scale=1.12,front=(mode==='scooter'?.5:.62)*scale,rear=(mode==='scooter'?-.4:-.53)*scale,radius=(mode==='scooter'?.12:mode==='bike'?.32:.24)*scale;
 const sx=Math.sin(yaw),sz=Math.cos(yaw);
 const floor=(distance:number)=>{const h=surface(x+sx*distance,z+sz*distance);return Math.abs(h-height)<=1.5?h:height;};
 const hf=floor(front),hr=floor(rear);out.pitch=Math.atan2(hr-hf,front-rear);out.height=height;
 if(hf===height&&hr===height)return out;
 const c=Math.cos(out.pitch),s=Math.sin(out.pitch);let support=-Infinity;
 for(const wheel of [rear,front]){
  const center=wheel*c+radius*s,cy=radius*c-wheel*s;
  for(let i=0;i<=16;i++){const offset=(i/8-1)*radius,bottom=cy-Math.sqrt(Math.max(0,radius*radius-offset*offset));support=Math.max(support,floor(center+offset)-bottom);}
 }
 // The scooter deck also spans the treads between its wheels.
 for(let i=0;i<=6;i++){const distance=rear+(front-rear)*i/6;support=Math.max(support,floor(distance*c)-(-distance*s+(mode==='scooter'?.13:.3)*scale));}
 out.height=support+.045;return out;
}
/** Tyre contacts ahead of / behind the ride's root (m, drawn at the town's 1.12 ride scale), as vehicle.ts places the wheels. */
export const rideWheelbase=(mode:TravelMode)=>mode==='scooter'?{front:.5*1.12,rear:.4*1.12}:{front:.62*1.12,rear:.53*1.12};
/** Most the ride (and rider) roll with the slope across it: a light lean, never a tilt. */
export const RIDE_SLOPE_ROLL_MAX=8*Math.PI/180;
/** A ride on open ground (Oct 15 2026, user: "riding on the mountain, the bike is in the island"). `sample` is the ground the
 *  tyres meet (on Summit Isle the drawn terrain, not only the smooth walked height); it is read twice, under the front and rear
 *  contacts. The pitch is the chord between them and the root sits on that chord, so on any even slope both tyres touch it
 *  (the wheels are drawn with their contact at the root's level). The roll is half the slope across the ride (`lateralGrade`,
 *  rise per metre to the ride's left, +x), capped at RIDE_SLOPE_ROLL_MAX. On level ground: height + 0.005, no pitch, no roll. */
export function rideSlopePose(mode:TravelMode,x:number,z:number,yaw:number,sample:(x:number,z:number)=>number,lateralGrade:number,out:{height:number;pitch:number;roll:number}){
 const {front,rear}=mode==='scooter'?SCOOTER_BASE:RIDE_BASE,sx=Math.sin(yaw),sz=Math.cos(yaw);
 const hf=sample(x+sx*front,z+sz*front),hr=sample(x-sx*rear,z-sz*rear);
 out.pitch=Math.atan2(hr-hf,front+rear);out.height=(hf*rear+hr*front)/(front+rear)+.005;
 out.roll=Math.max(-RIDE_SLOPE_ROLL_MAX,Math.min(RIDE_SLOPE_ROLL_MAX,Math.atan(lateralGrade)*.5));return out;
}
const SCOOTER_BASE=rideWheelbase('scooter'),RIDE_BASE=rideWheelbase('bike');
