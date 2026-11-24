/**
 * Island Line riders face out of their window (Gameplay 2, owner Nov 24 2026: "riders face outward ... slight lean towards travel;
 * bench/body/window line up, no clipping"): a child kneels up on the long wall bench, sitting back on their heels (seiza on the
 * seat, the way kids ride a Japanese local train), chest to the window, hands on the sill, head and shoulders in the window band,
 * the torso and head turned a little toward the way the train runs. One pose per lean direction, built once, shared by the local
 * rider (lib/town/trainRide.ts) and drawn friends (lib/graphics/remoteAvatars.ts); no per-frame work.
 * Frame: rig root on the car floor under the bench (trainRunning seat table: RIDER_ROOT_X from the car's centre line), +z = facing
 * = out of the window; metres before the rig's scale (the player is scale 1). Bench and window numbers: lib/town/trainCarModel.ts.
 */
import {createTrickPose,type TrickPose} from './trickPose';
import {createTrickCtx,stancePose} from './freestyleTricks';
import {restHand} from './npcSeatPose';

/** Seat top over the floor (trainCarModel: bench box at CAR_FLOOR_Y + .32 ± .32), the window sill over the floor (WIN_Y0 − CAR_FLOOR_Y). */
export const KNEEL={seatTop:.64,sill:1.03,pelvisY:.88,pitch:.28,ankleZ:0,legX:.13,turn:.14,look:.34} as const;

/** The kneeling-at-the-window pose; lean +1 turns toward the rig's +x (the travel side, trainRunning SeatPose.lean). */
export function trainRiderPose(lean:number):TrickPose{
 const o=createTrickPose(),ctx=createTrickCtx();stancePose('sit',ctx,o);
 o.w=1;o.pelvisY=KNEEL.pelvisY;o.pelvisZ=0;o.pelvisPitch=-.04;o.pelvisRoll=0;o.pelvisYaw=0;o.torsoPitch=KNEEL.pitch;o.torsoRoll=0;
 o.torsoYaw=KNEEL.turn*lean;o.headYaw=KNEEL.look*lean;o.headPitch=-.06;
 // sitting back on the heels: the ankles under the hips, so the knees fold forward onto the cushion (~.4 m out)
 for(const [i,l] of o.legs.entries()){l.x=i?KNEEL.legX:-KNEEL.legX;l.y=KNEEL.seatTop+.07;l.z=KNEEL.ankleZ;l.toe=.9;l.w=1;}
 // hands on the window sill in front of the chest
 for(const [i,a] of o.arms.entries())restHand(o,i?1:-1,.48,KNEEL.sill+.06,a);
 return o;
}

/** Standing in the aisle (Gameplay 3, "walk inside the carriage"): upright, feet a little apart, one hand up on a strap handle
 *  (trainCarModel STRAP_GRIP_Y, 1.49 m over the floor), the other loose. side −1 / +1: which hand is up (the strap rail on that
 *  side). Weight `w` is set by the host (0 while walking: the rig's own gait shows). The sway is written per frame by
 *  swayStrapPose (a couple of adds, no allocation). */
export const STRAP={pelvisY:.86,armSx:-2.72,armSz:.2,armEl:-.3,sway:.9,swayMax:.09} as const;
export function trainStrapPose(side:-1|1):TrickPose{
 const o=createTrickPose(),ctx=createTrickCtx();stancePose('stand',ctx,o);
 o.w=0;o.pelvisY=STRAP.pelvisY;o.pelvisPitch=0;o.torsoPitch=0;o.headPitch=0;
 for(const l of o.legs)l.w=0;// the rig keeps its own feet (it may shuffle a step); only the body and the strap arm are posed
 const up=o.arms[side>0?1:0],down=o.arms[side>0?0:1];up.sx=STRAP.armSx;up.sz=STRAP.armSz;up.el=STRAP.armEl;up.w=1;down.w=0;
 return o;
}
/** Curve sway (reduced motion: pass 0): the body rolls a little against the car's lean, the head stays level. */
export function swayStrapPose(o:TrickPose,lean:number){
 const r=Math.max(-STRAP.swayMax,Math.min(STRAP.swayMax,lean*STRAP.sway));o.pelvisRoll=r*.5;o.torsoRoll=-r*.3;o.pelvisZ=0;
}
