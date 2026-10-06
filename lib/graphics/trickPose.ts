// Freestyle trick pose (Oct 4 2026, docs/player-moves/MOVES.md § G): an OPTIONAL full-body pose the rig applies over its
// finished solve when `PlayerMotion.trick` is set (sitting, lying, bowing for a neck stall, a free leg aimed anywhere). Pure
// maths, no three.js and no allocation: the host mutates one TrickPose per rig, and `solveTrickLeg` is the same analytic
// two-bone solve the rig uses, so freestyleTricks.ts can place the ball exactly where the boot will be.
//
// Frame: the rig root (+z forward, +x = the `right-*` (+1) leg's side, y up, metres before the root's own scale).
// Angles: pitch + leans forward (rotation about +x), roll + tips toward −x (rotation about +z), yaw + turns toward +x.

/** Ankle target for one leg (rig root frame) and toe angle (0 = sole level with the ground, + = pointed); w 0..1. */
export type TrickLeg={x:number;y:number;z:number;toe:number;w:number};
/** Shoulder pitch (+ = arm back), shoulder spread (+ = out from the side), elbow (− = bent forward); w 0..1. */
export type TrickArm={sx:number;sz:number;el:number;w:number};
export type TrickPose={
 /** Overall blend 0..1 over the rig's own solve (the host ramps it at the start and end of a trick). */
 w:number;
 pelvisY:number;pelvisZ:number;pelvisPitch:number;pelvisRoll:number;pelvisYaw:number;
 torsoPitch:number;torsoRoll:number;torsoYaw:number;headPitch:number;headYaw:number;
 legs:[TrickLeg,TrickLeg];arms:[TrickArm,TrickArm];
};
export const createTrickPose=():TrickPose=>({w:0,pelvisY:.88,pelvisZ:0,pelvisPitch:0,pelvisRoll:0,pelvisYaw:0,torsoPitch:0,torsoRoll:0,torsoYaw:0,headPitch:0,headYaw:0,
 legs:[{x:-.12,y:.075,z:0,toe:0,w:0},{x:.12,y:.075,z:0,toe:0,w:0}],arms:[{sx:0,sz:.12,el:0,w:0},{sx:0,sz:.12,el:0,w:0}]});
export function copyTrickPose(to:TrickPose,from:TrickPose){
 to.w=from.w;to.pelvisY=from.pelvisY;to.pelvisZ=from.pelvisZ;to.pelvisPitch=from.pelvisPitch;to.pelvisRoll=from.pelvisRoll;to.pelvisYaw=from.pelvisYaw;
 to.torsoPitch=from.torsoPitch;to.torsoRoll=from.torsoRoll;to.torsoYaw=from.torsoYaw;to.headPitch=from.headPitch;to.headYaw=from.headYaw;
 for(let i=0;i<2;i++){const a=to.legs[i],b=from.legs[i];a.x=b.x;a.y=b.y;a.z=b.z;a.toe=b.toe;a.w=b.w;const c=to.arms[i],d=from.arms[i];c.sx=d.sx;c.sz=d.sz;c.el=d.el;c.w=d.w;}
 return to;
}
/** Rig constants the solve shares with player.ts (hip offset, thigh and shin length at leg scale 1). */
export const TRICK_RIG={hipX:.108,thigh:.43,shin:.40} as const;
/** Joint angles for one leg: hip abduction (rotation.z), hip pitch (rotation.x), knee (rotation.x), ankle (rotation.x). */
export type TrickLegAngles={hipZ:number;hipX:number;knee:number;ankle:number;reach:number};
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;
/**
 * Two-bone leg solve in the pelvis frame. The pelvis sits at (0, pelvisY, pelvisZ) with Euler XYZ (pitch, yaw, roll); the hip
 * at (side·hipX, 0, 0) under it; hip Euler XYZ = (hipX, 0, hipZ), knee and ankle rotate about x (knee + bends the shin back).
 * The ankle lands exactly on the target when it is within reach; beyond reach the leg points at it, straight.
 */
export function solveTrickLeg(p:TrickPose,side:-1|1,leg:TrickLeg,legScale:number,out:TrickLegAngles):TrickLegAngles{
 // Root → pelvis frame: inverse of Rx(pitch)·Ry(yaw)·Rz(roll) applied to (target − pelvis origin).
 let x=leg.x,y=leg.y-p.pelvisY,z=leg.z-p.pelvisZ;
 let c=Math.cos(p.pelvisPitch),s=Math.sin(p.pelvisPitch),t=y*c+z*s;z=-y*s+z*c;y=t;
 c=Math.cos(p.pelvisYaw);s=Math.sin(p.pelvisYaw);t=x*c-z*s;z=x*s+z*c;x=t;
 c=Math.cos(p.pelvisRoll);s=Math.sin(p.pelvisRoll);t=x*c+y*s;y=-x*s+y*c;x=t;
 x-=side*TRICK_RIG.hipX;
 const L1=TRICK_RIG.thigh*legScale,L2=TRICK_RIG.shin*legScale,d=clamp(Math.hypot(x,y,z),Math.abs(L1-L2)+.01,L1+L2-.002);
 const knee=Math.PI-Math.acos(clamp((L1*L1+L2*L2-d*d)/(2*L1*L2),-1,1));
 // Unrotated ankle: (0, −(L1+L2·cos k), −L2·sin k). Abduction swings it sideways, hip pitch then turns it in the y–z plane.
 const hang=L1+L2*Math.cos(knee),hipZ=Math.asin(clamp(x/hang,-1,1)),y1=-hang*Math.cos(hipZ),z0=-L2*Math.sin(knee);
 let hipX=Math.atan2(z,y)-Math.atan2(z0,y1);if(hipX>Math.PI)hipX-=2*Math.PI;else if(hipX<-Math.PI)hipX+=2*Math.PI;
 out.hipZ=hipZ;out.hipX=hipX;out.knee=knee;out.ankle=leg.toe-(p.pelvisPitch+hipX+knee);out.reach=Math.hypot(x,y,z)/(L1+L2);
 return out;
}
