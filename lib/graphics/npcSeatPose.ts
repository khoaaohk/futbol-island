// Still townsfolk poses (Oct 12 2026, townsfolk cast; lib/town/townsfolkCast.ts): sitting on a bench, sitting on a towel or the
// sand, and lying in the sun. Built once per townsperson from the freestyle stances (freestyleTricks.stancePose 'sit' / 'lie')
// and handed to the rig as `motion.trick` (lib/graphics/trickPose.ts), so no new animation system and no per-frame allocation.
// Frame: rig root, +z = the facing (workYaw), metres before the root's own scale; `scale` is the townsperson's height profile,
// so a bench seat (a fixed world height) stays under a child's and a grown-up's hips alike.
import {createTrickPose,type TrickPose} from './trickPose';
import {createTrickCtx,stancePose} from './freestyleTricks';
export type NpcPoseKind='bench'|'sit'|'lie';
/** World height of the island benches' seat top (world.ts benchParts / eastPierWorld bench: .58 + .06). */
export const BENCH_SEAT_Y=.64;
export function npcSeatPose(kind:NpcPoseKind,scale=1):TrickPose{
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
  // On the seat: hips at the seat top, upright back, feet hanging toward the ground, hands on the knees.
  o.pelvisY=(BENCH_SEAT_Y+.1)/scale;o.pelvisZ=-.02;o.pelvisPitch=-.12;o.torsoPitch=-.04;o.headPitch=.1;
  for(const [i,l] of o.legs.entries()){l.x=i?.14:-.14;l.y=.08;l.z=.42;l.toe=0;l.w=1;}
  for(const a of o.arms){a.sx=-.55;a.sz=.18;a.el=-.75;a.w=1;}
 }else{
  // On a towel or the sand: the freestyle sit, knees up a little, leaning back on both hands.
  for(const l of o.legs){l.z=.62;l.y=.09;}
 }
 return o;
}
