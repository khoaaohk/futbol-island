// Still townsfolk poses (Oct 12 2026, townsfolk cast; lib/town/townsfolkCast.ts): sitting on a bench, sitting on a towel or the
// sand, and lying in the sun. Built once per townsperson from the freestyle stances (freestyleTricks.stancePose 'sit' / 'lie')
// and handed to the rig as `motion.trick` (lib/graphics/trickPose.ts), so no new animation system and no per-frame allocation.
// Frame: rig root, +z = the facing (workYaw), metres before the root's own scale; `scale` is the townsperson's height profile,
// so a bench seat (a fixed world height) stays under a child's and a grown-up's hips alike.
// Bench fit (Oct 22 2026, "character shouldn't be sitting through the bench"): the bench pose is SOLVED against the bench
// geometry below (world.ts benchParts, eastPierWorld bench), not hand-tuned: the bean's lowest shell point rests on the seat top,
// its back sits a hair in front of the backrest face, the thighs lie along the board and end beyond the front edge, the lower
// legs hang over it and the hands rest on the thighs. tests/seat-fit.cjs checks every build and scale against the bench boxes.
import {createTrickPose,type TrickPose} from './trickPose';
import {createTrickCtx,stancePose} from './freestyleTricks';
import {BEAN_SHAPES,type BeanShape} from './beanSkin';
import {beanSurface} from './beanGearFit';
export type NpcPoseKind='bench'|'sit'|'lie';
/** The island bench (world.ts benchParts, eastPierWorld bench), metres, in the bench's own frame: x along it, z toward the open
 *  (front) side, y up. A townsperson's root stands `rootZ` in front of the bench centre (the cast places them at z ± .05, the
 *  yaw faces the open side: 0 for a bench whose back is at -z, PI for eastPierWorld's mirrored one). */
export const BENCH={seatTop:.64,seatBottom:.52,halfWidth:1,halfDepth:.325,backFace:-.205,backBehind:-.295,backBottom:.685,backTop:1.135,rootZ:.05} as const;
/** World height of the island benches' seat top (world.ts benchParts / eastPierWorld bench: .58 + .06). */
export const BENCH_SEAT_Y=BENCH.seatTop;
const ALL_SHAPES:readonly BeanShape[]=Object.values(BEAN_SHAPES);
/** Where the seat fit leaves the body (rig-root metres before scale): pelvis height/depth, torso pitch, thigh slope (rad, down). */
export type BenchSeatFit={pelvisY:number;pelvisZ:number;pitch:number;thighDown:number};
const BOTTOM_GAP=.004,BACK_GAP=.012,THIGH_R=.09,SEAT_PITCH=-.06;
/** Shell samples (torso-local, pitched by `f`, pelvis at the origin): the lowest point under the seat and every point's (y, z). */
function shell(shape:BeanShape,f:number){
 const c=Math.cos(f),s=Math.sin(f),pts:{y:number;z:number}[]=[];let low=Infinity;
 for(let i=0;i<=40;i++)for(let j=0;j<48;j++){const p=beanSurface(shape,i/40,j/48*Math.PI*2),y=p.y*c-p.z*s,z=p.y*s+p.z*c;
  if(Math.abs(p.x)<.14&&y<low)low=y;pts.push({y,z});}
 return {low,pts};
}
/** Solve the bench pose numbers for a body shape (the rig's own, `beanShapeOf(rig.root)`; without one, the envelope of every build so
 *  none can clip) and a height profile. Pure maths, run once per townsperson. */
export function benchSeatFit(scale=1,shape?:BeanShape):BenchSeatFit{
 const shells=(shape?[shape]:ALL_SHAPES).map(s=>shell(s,SEAT_PITCH));
 // Bottom on the seat: world y of the lowest shell point = seat top + a hair.
 const low=Math.min(...shells.map(s=>s.low)),pelvisY=(BENCH.seatTop+BOTTOM_GAP)/scale-low,hipWorld=pelvisY*scale;
 // Back against the backrest: the deepest shell point between the seat and the backrest's top sits just in front of its face.
 let deepest=0;for(const sh of shells)for(const b of sh.pts){const wy=hipWorld+b.y*scale;if(wy>=BENCH.seatTop&&wy<=BENCH.backTop&&b.z<deepest)deepest=b.z;}
 let pelvisZ=(BENCH.backFace-BENCH.rootZ+BACK_GAP)/scale-deepest;
 // A short person (a child) cannot reach the front edge with the back on the backrest: the knees would hang over the board and
 // the shins sink into it. They scoot forward until the knee clears the edge by the shin's width (the shortest leg profile, .96).
 const edge=(BENCH.halfDepth-BENCH.rootZ)/scale,kneeClear=edge+(.067*scale+.015)/scale-.43*.96;
 if(pelvisZ<kneeClear)pelvisZ=kneeClear;
 // Thighs slope down so their underside just meets the front edge of the board, then carry on past it.
 const run=Math.max(.2,edge-pelvisZ),drop=Math.max(0,(hipWorld-(THIGH_R+.01)*scale-BENCH.seatTop)/scale);
 return {pelvisY,pelvisZ,pitch:SEAT_PITCH,thighDown:Math.atan2(drop,run)};
}
/** Arm angles that put a hand at root-frame (±.15, y, z): a grid search over the shoulder pitch / spread and elbow, with the
 *  rig's own arm lengths (player.ts: shoulder at (±.235, .385) in the torso frame, upper arm .28, forearm + hand .265). */
function restHand(o:TrickPose,side:-1|1,z:number,y:number,arm:{sx:number;sz:number;el:number;w:number}){
 const f=o.pelvisPitch+o.torsoPitch,cf=Math.cos(f),sf=Math.sin(f),tx=side*.15;let best=Infinity;
 for(let sz=0;sz<=.3;sz+=.03)for(let sx=-1.6;sx<=.2;sx+=.04)for(let el=-1.8;el<=0;el+=.04){
  const wy=-.28-.265*Math.cos(el),wz=-.265*Math.sin(el),ax=-wy*Math.sin(sz)*side,ay=wy*Math.cos(sz);
  const by=ay*Math.cos(sx)-wz*Math.sin(sx),bz=ay*Math.sin(sx)+wz*Math.cos(sx);// shoulder frame -> torso frame
  const px=side*.235+ax,py=.385+by,pz=bz;
  const ry=o.pelvisY+py*cf-pz*sf,rz=o.pelvisZ+py*sf+pz*cf,d=Math.hypot(px-tx,ry-y,rz-z);
  if(d<best){best=d;arm.sx=sx;arm.sz=sz;arm.el=el;}}
 arm.w=1;
}
export function npcSeatPose(kind:NpcPoseKind,scale=1,shape?:BeanShape):TrickPose{
 const o=createTrickPose(),ctx=createTrickCtx();
 if(kind==='lie'){
  stancePose('lie',ctx,o);
  // Flat on the back: legs out along the towel instead of raised for a juggle, arms resting by the sides, head on the ground.
  o.headPitch=.25;o.torsoPitch=-.12;
  o.legs[0].x=-.13;o.legs[0].y=.1;o.legs[0].z=.86;o.legs[0].toe=.6;o.legs[1].x=.13;o.legs[1].y=.1;o.legs[1].z=.86;o.legs[1].toe=.6;
  for(const a of o.arms){a.sx=-.1;a.sz=.32;a.el=-.15;a.w=1;}
  return o;
 }
 stancePose('sit',ctx,o);
 if(kind==='bench'){
  const fit=benchSeatFit(scale,shape);
  o.pelvisY=fit.pelvisY;o.pelvisZ=fit.pelvisZ;o.pelvisPitch=fit.pitch;o.torsoPitch=0;o.headPitch=.08;
  // Knees just past the front edge, thighs along the board, shins hanging; the boots dangle, soles level.
  const kz=o.pelvisZ+.43*Math.cos(fit.thighDown),ky=o.pelvisY-.43*Math.sin(fit.thighDown);
  for(const [i,l] of o.legs.entries()){l.x=i?.12:-.12;l.y=ky-.4;l.z=kz+.01;l.toe=0;l.w=1;}
  // Hands rest on the thighs, a little in front of the lap: the arm angles that bring each hand there (solved once, below).
  for(const [i,a] of o.arms.entries())restHand(o,i?1:-1,(o.pelvisZ+kz)/2,(o.pelvisY+ky)/2+.09,a);
 }else{
  // On a towel or the sand: the freestyle sit, knees up a little, leaning back on both hands.
  for(const l of o.legs){l.z=.62;l.y=.09;}
 }
 return o;
}
