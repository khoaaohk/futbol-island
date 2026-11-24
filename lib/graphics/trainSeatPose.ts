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
export const KNEEL={seatTop:.64,sill:1.03,pelvisY:.82,pitch:.2,ankleZ:-.32,legX:.13,turn:.14,look:.34} as const;

/** The kneeling-at-the-window pose; lean +1 turns toward the rig's +x (the travel side, trainRunning SeatPose.lean). */
export function trainRiderPose(lean:number):TrickPose{
 const o=createTrickPose(),ctx=createTrickCtx();stancePose('sit',ctx,o);
 o.w=1;o.pelvisY=KNEEL.pelvisY;o.pelvisZ=0;o.pelvisPitch=-.04;o.pelvisRoll=0;o.pelvisYaw=0;o.torsoPitch=KNEEL.pitch;o.torsoRoll=0;
 o.torsoYaw=KNEEL.turn*lean;o.headYaw=KNEEL.look*lean;o.headPitch=-.06;
 // shins along the seat behind the knees, feet on the board (toes pointed back)
 for(const [i,l] of o.legs.entries()){l.x=i?KNEEL.legX:-KNEEL.legX;l.y=KNEEL.seatTop+.07;l.z=KNEEL.ankleZ;l.toe=.9;l.w=1;}
 // hands on the window sill in front of the chest
 for(const [i,a] of o.arms.entries())restHand(o,i?1:-1,.34,KNEEL.sill+.06,a);
 return o;
}
