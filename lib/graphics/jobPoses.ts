/**
 * Island job poses (Sep 30 2026, docs/island-jobs.md §10): what the character's body does for each job action, as small
 * keyframe tables sampled by progress (0 → 1). lib/graphics/player.ts turns a target into joint rotations (a two-bone leg
 * solve keeps both boots on the grass or a knee on it) and blends it over the live pose, fading in and out over ~0.15 s.
 * Rig-local axes: +z forward, +y up. Arms: sx = shoulder pitch (−π/2 = straight forward, −π = straight up), sz = out to the
 * side, ex = elbow bend (negative), hy = wrist twist. Torso tx > 0 leans forward; head hx > 0 looks down, hy turns it (a head
 * shake); toe > 0 points both toes down (up on tiptoe, with the pelvis and boots raised a little).
 * Pure data + arithmetic: no allocation beyond the one reused target, no timers.
 */
import {UPPER_POSES,type JobPose,type JobPoseKind} from '../town/jobs/jobMoves';
export type Arm=[sx:number,sz:number,ex:number,hy?:number];
export type PoseTarget={py:number;pz:number;tx:number;ty:number;hx:number;hy:number;toe:number;fl:[z:number,y:number];fr:[z:number,y:number];al:Arm;ar:Arm;upper:boolean};
type Key=[t:number,p:Partial<Omit<PoseTarget,'upper'>>];
const N:Omit<PoseTarget,'upper'>={py:.86,pz:0,tx:0,ty:0,hx:0,hy:0,toe:0,fl:[0,.07],fr:[0,.07],al:[.05,.12,-.25,0],ar:[.05,.12,-.25,0]};
/** Garden shift: the left hand carries the basket by its handle, a little forward and out from the hip. */
const BASKET:Arm=[-.3,.2,-.55];
/** Free picking (no basket): the left arm just balances. */
const BALANCE:Arm=[-.35,.35,-.4];
const GARDEN_POSES=new Set<JobPoseKind>(['gpick','reachpick','headshake']);
const TIPTOE={py:.9,toe:.55,fl:[.04,.11] as [number,number],fr:[-.04,.11] as [number,number]};
const CARRY_BALL:Arm=[-.75,-.05,-1.55],CARD:Arm=[-.95,-.05,-1.1],STACK:Arm=[-.35,.08,-1.45];
/** Tree shake (Summit Isle foraging): braced with the elbows bent, then pushing with straight arms and the weight forward. */
// Oct 14 2026 (user: "fix the animation of shaking to actually touch the tree"): the hands grip the bark at chest height. The body
// stands hands-on (trunk radius + 0.25 m, lib/town/summitForage.ts contactAt), so both arms reach straight forward at the shoulders
// and bend at the elbows: pulled in on the brace (body back), pushed out on the push (body in); the tree sways with each push.
const SHAKE_BRACE={py:.8,pz:-.07,tx:.04,hx:-.3,fl:[.22,.07] as [number,number],fr:[-.2,.07] as [number,number],al:[-1.48,.2,-1.4] as Arm,ar:[-1.48,.2,-1.4] as Arm};
const SHAKE_PUSH={py:.78,pz:.06,tx:.3,hx:-.22,fl:[.26,.07] as [number,number],fr:[-.24,.07] as [number,number],al:[-1.45,.14,-.8] as Arm,ar:[-1.45,.14,-.8] as Arm};
const PULLED={py:.66,pz:-.22,tx:-.28,hx:.2,fl:[.26,.07] as [number,number],fr:[-.05,.07] as [number,number],al:[-.95,.14,-.1] as Arm,ar:[-.95,.14,-.1] as Arm};
/** Tree kick: wind-up (weight on the planted left boot, the right leg back), the strike (the right boot forward and up on the
 *  bark, hips in) and the follow-through. Arms counter-swing: the left forward on the wind-up, the right forward on the strike. */
const KICK_WIND={py:.84,pz:-.03,tx:.05,hx:.3,fl:[.1,.07] as [number,number],fr:[-.4,.16] as [number,number],al:[-.85,.3,-.5] as Arm,ar:[.45,.35,-.35] as Arm};
const KICK_STRIKE={py:.82,pz:.1,tx:.2,hx:.35,fl:[.06,.07] as [number,number],fr:[.44,.26] as [number,number],al:[-.2,.5,-.3] as Arm,ar:[-.95,.4,-.4] as Arm};
const KICK_THROUGH={py:.83,pz:.08,tx:.12,hx:.3,fl:[.06,.07] as [number,number],fr:[.3,.2] as [number,number],al:[-.3,.4,-.3] as Arm,ar:[-.6,.35,-.4] as Arm};
/** One-shot keyframes (progress 0 → 1). Held poses are computed below from their live value (`tug`). */
const KEYS:Partial<Record<JobPoseKind,Key[]>>={
 // ---- Bug squad catching (Oct 20 2026, catching lane: "the net needs to have a swing") ----
 // Net swing, both hands on the pole: wind-up (torso turned, net raised up and back over the right shoulder, weight on the back
 // foot), the sweep across the front (torso unwinds, arms reach forward and low, a step in: the hit frame is ~0.48), follow-through.
 netswing:[[0,{al:[-.9,.15,-.6],ar:[-1,.05,-.5]}],[.26,{py:.84,pz:-.04,tx:-.12,ty:-.55,hx:-.15,fl:[.12,.07],fr:[-.22,.07],al:[-2.35,.35,-.9],ar:[-2.55,.2,-.7]}],
  [.48,{py:.8,pz:.06,tx:.32,ty:.1,hx:.2,fl:[.24,.07],fr:[-.14,.07],al:[-1.35,.12,-.25],ar:[-1.3,.02,-.2]}],
  [.68,{py:.79,pz:.08,tx:.38,ty:.55,hx:.25,fl:[.24,.07],fr:[-.14,.07],al:[-1,.05,-.3],ar:[-.95,-.15,-.35]}],[1,{tx:.1,ty:.15,al:[-.9,.15,-.6],ar:[-1,.05,-.5]}]],
 // The firefly jar's Cup (Oct 21 2026): the body for the scoop (both hands are solved onto the jar by player.ts, jarGrip below):
 // crouch and turn to the right with the jar low, rise up on the toes as it sweeps up and over the firefly, then settle.
 jarcup:[[0,{}],[.26,{py:.76,pz:-.02,tx:.35,ty:-.4,hx:.15,fl:[.14,.07],fr:[-.2,.07],al:[-.6,.15,-.9],ar:[-.5,.1,-.9]}],
  [.48,{py:.9,pz:.08,tx:-.08,ty:.05,hx:-.35,toe:.25,fl:[.26,.09],fr:[-.12,.09],al:[-2.2,.1,-.4],ar:[-2.2,.1,-.4]}],
  [.68,{py:.84,pz:.06,tx:.05,hx:-.15,fl:[.24,.07],fr:[-.14,.07],al:[-1.6,.15,-.9],ar:[-1.6,.15,-.9]}],[1,{}]],
 // Catch! The net raised high in both hands, up on tiptoe and looking up at it, a joyful little bounce, then down again.
 netcatch:[[0,{}],[.25,{...TIPTOE,tx:-.12,hx:-.5,al:[-2.85,.25,-.25],ar:[-2.95,.15,-.2]}],[.45,{py:.98,toe:.7,fl:[.04,.16],fr:[-.04,.16],tx:-.15,hx:-.55,al:[-2.95,.3,-.15],ar:[-3.05,.2,-.1]}],
  [.62,{...TIPTOE,tx:-.1,hx:-.45,al:[-2.8,.25,-.3],ar:[-2.9,.15,-.25]}],[.8,{py:.84,tx:.05,hx:-.1,al:[-1.6,.2,-.6],ar:[-1.7,.1,-.5]}],[1,{}]],
 // ---- Garden (Sep 30 2026, docs/island-jobs.md §13) ----
 // Bed crop: crouch and reach down to the plant, two small tugs, rise and bring it across into the basket in the left hand.
 gpick:[[0,{al:BASKET}],[.3,{py:.6,pz:-.04,tx:.85,hx:.4,fl:[.16,.07],fr:[-.12,.07],al:[-.55,.3,-.6],ar:[-1.05,.02,-.1]}],
  [.42,{py:.62,pz:-.05,tx:.78,hx:.38,fl:[.16,.07],fr:[-.12,.07],al:[-.55,.3,-.6],ar:[-.85,.02,-.45]}],
  [.5,{py:.6,pz:-.04,tx:.84,hx:.4,fl:[.16,.07],fr:[-.12,.07],al:[-.55,.3,-.6],ar:[-1,.02,-.15]}],
  [.72,{py:.74,tx:.42,hx:.3,fl:[.1,.07],fr:[-.06,.07],al:[-.75,.32,-.95],ar:[-.85,-.35,-1.05]}],
  [.86,{py:.82,tx:.22,hx:.35,al:[-.65,.3,-.9],ar:[-.6,-.3,-.95]}],[1,{al:BASKET}]],
 // Tree fruit: up on tiptoe, eyes up, the right arm straight up; a small pluck; down into the basket.
 reachpick:[[0,{al:BASKET}],[.35,{...TIPTOE,tx:-.15,hx:-.55,al:BASKET,ar:[-2.95,.12,-.1]}],[.5,{...TIPTOE,tx:-.12,hx:-.5,al:BASKET,ar:[-2.8,.14,-.5]}],
  [.58,{...TIPTOE,tx:-.14,hx:-.55,al:BASKET,ar:[-2.95,.12,-.15]}],[.8,{py:.85,tx:.15,hx:.3,al:[-.7,.3,-.9],ar:[-.75,-.3,-1.1]}],[1,{al:BASKET}]],
 // Not ripe yet: lean in and look at it, then a gentle shake of the head.
 headshake:[[0,{al:BASKET}],[.25,{tx:.3,hx:.35,al:BASKET,ar:[-.5,.1,-.6]}],[.42,{tx:.28,hx:.3,hy:.32,al:BASKET,ar:[-.45,.1,-.6]}],[.58,{tx:.28,hx:.3,hy:-.32,al:BASKET,ar:[-.4,.1,-.5]}],
  [.74,{tx:.24,hx:.28,hy:.26,al:BASKET}],[.88,{tx:.12,hx:.15,hy:-.06,al:BASKET}],[1,{al:BASKET}]],
 // At the crate: lean in and tip the basket with both hands.
 tipbasket:[[0,{al:BASKET}],[.45,{py:.78,tx:.5,hx:.4,al:[-1.25,.05,-.35],ar:[-1.1,-.15,-.5]}],[.75,{py:.78,tx:.52,hx:.42,al:[-1.35,.05,-.25],ar:[-1.2,-.15,-.4]}],[1,{al:BASKET}]],
 pop:[[0,PULLED],[.3,{py:.8,pz:-.3,tx:-.45,hx:-.1,fr:[-.36,.07],al:[-2.1,.5,-.4],ar:[-2.2,.45,-.5]}],[.7,{py:.84,pz:-.1,tx:-.1,al:[-1,.2,-.4],ar:[-1,.2,-.4]}],[1,{}]],
 slip:[[0,PULLED],[.3,{py:.7,pz:.04,tx:.7,hx:.3,fl:[.3,.07],al:[-.55,.55,-.15],ar:[-.6,.5,-.15]}],[.65,{py:.8,tx:.3,al:[-.3,.25,-.3],ar:[-.3,.25,-.3]}],[1,{}]],
 twist:[[0,{}],[.3,{py:.8,tx:.45,hx:.4,al:[-1.1,.08,-.45],ar:[-1.25,.02,-.35,.9]}],[.6,{py:.8,tx:.45,hx:.4,al:[-1.1,.08,-.45],ar:[-1.25,.02,-.35,-.9]}],[.85,{py:.84,tx:.12,al:[-.5,.12,-.5],ar:[-.6,.05,-1.6]}],[1,{}]],
 nope:[[0,{}],[.35,{py:.82,tx:.4,hx:.35,ar:[-1.2,.04,-.35,.6]}],[.65,{py:.84,tx:.2,ty:.12,hx:.1,ar:[-.4,.2,-.4]}],[1,{}]],
 snip:[[0,{}],[.35,{py:.8,tx:.5,hx:.4,al:[-1.2,-.05,-.5],ar:[-1.2,-.05,-.5]}],[.65,{py:.8,tx:.5,hx:.4,al:[-1.2,.28,-.3],ar:[-1.2,.28,-.3]}],[1,{py:.82,tx:.4,hx:.3,al:[-1.1,-.05,-.5],ar:[-1.1,-.05,-.5]}]],
 // Jobs upgrade (Oct 25 2026): bend from the hips with the knees bent (a squat, not a stiff-legged stoop), grab, rise, and pop it
 // over the right shoulder into the bag on the back (the hand goes up and back, the torso turns a little with it).
 pick:[[0,{}],[.36,{py:.58,pz:-.05,tx:.92,hx:.35,fl:[.16,.07],fr:[-.12,.07],al:[-.9,.18,-.2],ar:[-1.05,.06,-.08]}],[.48,{py:.6,pz:-.05,tx:.88,hx:.38,fl:[.16,.07],fr:[-.12,.07],al:[-.85,.18,-.25],ar:[-.95,.06,-.4]}],
  [.7,{py:.8,tx:.2,ty:-.18,hx:.05,al:[-.5,.25,-.4],ar:[-2.3,.35,-1.55]}],[.84,{py:.84,tx:.08,ty:-.22,al:[-.3,.2,-.35],ar:[-2.55,.3,-1.8]}],[1,{}]],
 stuff:[[0,{}],[.45,{py:.66,tx:.8,hx:.3,fl:[.14,.07],al:[-.95,.15,-.2],ar:[-.95,.15,-.2]}],[.8,{py:.82,tx:.2,ty:-.35,ar:[-.25,.55,-1.1],al:[-.6,.2,-.6]}],[1,{}]],
 toss:[[0,{}],[.35,{py:.82,tx:-.1,ty:.35,fr:[-.2,.07],ar:[.75,.3,-.2],al:[-.5,.3,-.3]}],[.62,{py:.84,tx:.25,ty:-.3,fl:[.2,.07],ar:[-2.05,.2,-.2],al:[-.7,.35,-.3]}],[1,{}]],
 scoop:[[0,{}],[.45,{py:.58,tx:.85,hx:.35,fl:[.16,.07],fr:[-.12,.07],al:[-1.1,.02,-.2],ar:[-1.1,.02,-.2]}],[.8,{py:.8,tx:.3,al:[-1.1,-.02,-1.2],ar:[-1.1,-.02,-1.2]}],[1,{al:CARRY_BALL,ar:CARRY_BALL}]],
 throwin:[[0,{al:CARRY_BALL,ar:CARRY_BALL}],[.4,{py:.84,tx:-.3,hx:-.2,fl:[.26,.07],fr:[-.22,.07],al:[-2.9,.15,-1.7],ar:[-2.9,.15,-1.7]}],[.62,{py:.82,tx:.35,fl:[.26,.07],fr:[-.22,.07],al:[-2.05,.1,-.2],ar:[-2.05,.1,-.2]}],[1,{tx:.12,al:[-1.1,.12,-.3],ar:[-1.1,.12,-.3]}]],
 // Cone (Jobs upgrade, Oct 25 2026): a real crouch with the stack held in the left arm, eyes on the mark, the right hand sets the
 // cone down and gives it a small press (the beat at the bottom), then up again.
 place:[[0,{al:STACK}],[.3,{py:.55,pz:-.03,tx:.72,hx:.45,fl:[.22,.07],fr:[-.16,.07],al:STACK,ar:[-.9,.05,-.2]}],[.52,{py:.53,pz:-.03,tx:.78,hx:.5,fl:[.22,.07],fr:[-.16,.07],al:STACK,ar:[-.78,.04,-.04]}],
  [.62,{py:.55,pz:-.03,tx:.75,hx:.48,fl:[.22,.07],fr:[-.16,.07],al:STACK,ar:[-.82,.04,-.12]}],[.84,{py:.76,tx:.3,hx:.32,fl:[.1,.07],al:STACK,ar:[-.35,.12,-.4]}],[1,{al:STACK}]],
 mallet:[[0,{}],[.25,{py:.84,tx:-.22,hx:-.1,fl:[.18,.07],fr:[-.14,.07],al:[-2.85,.08,-.7],ar:[-2.85,.08,-.7]}],[.55,{py:.76,tx:.55,hx:.3,fl:[.18,.07],fr:[-.14,.07],al:[-.75,.04,-.1],ar:[-.75,.04,-.1]}],[1,{py:.8,tx:.35,hx:.25,al:[-.85,.06,-.3],ar:[-.85,.06,-.3]}]],
 drop:[[0,{al:CARD,ar:CARD}],[.5,{py:.78,tx:.55,hx:.4,al:[-1.3,.05,-.2],ar:[-1.3,.05,-.2]}],[1,{}]],
 take:[[0,{}],[.5,{py:.78,tx:.5,hx:.4,al:[-1.2,.05,-.3],ar:[-1.2,.05,-.3]}],[1,{al:CARD,ar:CARD}]],
 // First touch on the rebound: the right boot comes up to cushion it, eyes on the ball, arms out for balance.
 control:[[0,{py:.84,tx:.12,hx:.3,fr:[.14,.12],al:[-.2,.35,-.3],ar:[-.1,.3,-.3]}],[.5,{py:.82,tx:.18,hx:.35,fr:[.32,.2],al:[-.25,.45,-.3],ar:[-.1,.4,-.3]}],[1,{}]],
 // Wall rebounds: the legs keep the juggle's receive; eyes down on the ball, a soft knee-high balance with the arms.
 firsttouch:[[0,{}],[.4,{tx:.2,hx:.4,al:[-.3,.55,-.35],ar:[-.25,.5,-.35]}],[1,{}]],
 // Flag up (Jobs upgrade, Oct 25 2026): a sharp, straight arm up, the body rising onto the toes and the free arm out for balance,
 // the eyes on the line; held while the whistle goes, then lowered.
 flagup:[[0,{}],[.22,{py:.89,toe:.22,fl:[.03,.09],fr:[-.03,.09],tx:-.05,hx:-.12,hy:.12,al:[-.25,.55,-.35],ar:[-3.05,.04,-.05]}],[.85,{py:.88,toe:.15,fl:[.03,.08],fr:[-.03,.08],hx:-.1,hy:.1,al:[-.2,.45,-.35],ar:[-3.05,.04,-.05]}],[1,{ar:[-3.05,.04,-.05]}]],
 // Job done (Jobs upgrade, Oct 25 2026): a little crouch with fists in, a hop with both arms up, the landing, a fist pump.
 cheer:[[0,{}],[.16,{py:.76,pz:-.02,tx:.2,hx:.15,fl:[.06,.07],fr:[-.06,.07],al:[-.55,.3,-1.5],ar:[-.55,.3,-1.5]}],[.38,{py:1,toe:.7,fl:[.04,.2],fr:[-.04,.2],tx:-.12,hx:-.35,al:[-2.85,.5,-.2],ar:[-2.85,.5,-.2]}],
  [.56,{py:.82,tx:.08,hx:-.05,fl:[.06,.07],fr:[-.06,.07],al:[-2.5,.55,-.5],ar:[-2.5,.55,-.5]}],[.76,{py:.86,tx:-.04,hx:-.2,al:[-.4,.35,-.6],ar:[-2.7,.2,-1.9]}],[.88,{py:.85,tx:-.02,hx:-.15,al:[-.3,.3,-.5],ar:[-2.4,.2,-1.95]}],[1,{}]],
 flagdown:[[0,{}],[.4,{al:[-1.45,.12,-.1],ar:[.1,.1,-.1],tx:.05}],[.8,{al:[-1.3,.35,-.1]}],[1,{}]],
 // Summit Isle foraging (lib/graphics/fruitTrees.ts): a staggered stance, both hands on the trunk, two pushes (elbows bent →
 // arms straight, leaning in) with the eyes up on the canopy; the fruit falls on the second push (TREE_SHAKE_PUSHES).
 treeshake:[[0,{}],[.15,{...SHAKE_BRACE}],[.3,{...SHAKE_PUSH}],[.46,{...SHAKE_BRACE}],[.62,{...SHAKE_PUSH}],
  [.82,{...SHAKE_BRACE,py:.83,tx:.1}],[1,{}]],
 // Summit Isle tree kick (Oct 15 2026, lib/town/summitTreeKick.ts): the left boot plants beside the trunk, the right leg draws
 // back (the left arm swings forward for balance), then strikes through the bark with the laces at TREE_KICK_CONTACT (hips in,
 // eyes on the trunk, arms swapped) and follows through before settling. The host stands the root so the toe meets the bark.
 treekick:[[0,{}],[.2,{...KICK_WIND}],[.4,{...KICK_STRIKE}],[.5,{...KICK_STRIKE,fr:[.43,.26]}],[.72,{...KICK_THROUGH}],[1,{}]],
};
/** Tree shake: the push peaks' progress (the canopy gets a shove at each; lib/graphics/fruitTrees.ts reads these). */
export const TREE_SHAKE_PUSHES=[.3,.62] as const;
/** Tree kick: the progress at which the boot meets the bark (the thunk, the sway and the leaves; fruitTrees.ts reads it). */
export const TREE_KICK_CONTACT=.4;
const out:PoseTarget={...N,fl:[0,.07],fr:[0,.07],al:[0,0,0,0],ar:[0,0,0,0],upper:false};
const lerp=(a:number,b:number,k:number)=>a+(b-a)*k;
/** The live gait (player.ts): the walk cycle's phase (rad, one stride pair per 2π), how much the body is moving (0 still → 1
 *  walking) and sprinting (0 → 1). Held carry poses sway with it instead of a clock, so the sway lands on the steps. */
export type Gait={phase:number;amount:number;sprint:number};
const IDLE_GAIT:Gait={phase:0,amount:0,sprint:0};

// ---- Bug squad net grip (bug-polish, Oct 20 2026; user: "fix the body mechanics to hold the net while walking", "while walking
// around with the net, have it held with both hands"). Rig-local (+z forward, +y up from the feet, arms[0] on −x, arms[1] on +x).
// The pole line is fixed first and both hands are solved onto it (player.ts poseNetGrip, the zipline's two-bone solve), so no
// hand can float off the pole and nothing stretches: every target is inside the arm's reach from its shoulder (tests check it).
//  - carry: a relaxed diagonal across the body, the rear (+x) hand low by the hip, the front (−x) hand at the chest, the hoop up
//    front and to the side, high and clear of the face. Still = "low and ready" (the pole tipped forward); sprinting tucks it up.
//  - sneak (Net down): both hands forward and low, the pole pointing ahead and down so the hoop skims the grass; knees bent.
type GripKey={l:readonly [number,number,number];d:readonly [number,number,number]};
const GRIP_IDLE:GripKey={l:[.13,.92,.22],d:[-.3,.5,.81]};
const GRIP_WALK:GripKey={l:[.13,.93,.29],d:[-.36,.8,.48]};
const GRIP_SPRINT:GripKey={l:[.14,.97,.25],d:[-.3,.9,.32]};
const GRIP_SNEAK:GripKey={l:[.04,1,.24],d:[-.16,-.38,.91]};
/** The catch stage's show (Oct 21 2026, user: the net covered the face): `present` = both hands on the pole, the hoop held out in
 *  front at arm's length on the right, at about shoulder height (open toward the bug); `raised` = lifted up beside the head on the
 *  right (lower hand at the chest, upper hand over the right shoulder), the hoop above and to the side, the face clear. */
const GRIP_PRESENT:GripKey={l:[.04,.98,.26],d:[-.32,.32,.89]};
const GRIP_RAISED:GripKey={l:[-.1,1.26,.12],d:[-.38,.9,.2]};
/** Hands apart along the pole (m): carry / Net down. */
export const NET_HAND_GAP={idle:.3,carry:.34,sneak:.18} as const;
/** Net down: how far the pelvis drops (m); player.ts bends both knees to match while the legs keep stepping. */
export const NET_SNEAK_CROUCH=.08;
export type NetGrip={h0:[number,number,number];h1:[number,number,number];dir:[number,number,number];crouch:number};
const gripOut:NetGrip={h0:[0,0,0],h1:[0,0,0],dir:[0,1,0],crouch:0};
/** The pole line and both hand targets for a held net pose (the same object is reused). `sneakW` 0 = carry, 1 = Net down
 *  (callers ease it, so switching never snaps). */
export function netGrip(sneakW:number,g:Gait,reduced:boolean,showW=0,showK=0,jar?:JarGripIn):NetGrip{
 if(jar&&jar.w>=1){const o=gripOut;return jarGrip(o,sneakW,g,reduced,showW,showK,jar);}
 const a=Math.max(0,Math.min(1,g.amount)),sp=Math.max(0,Math.min(1,g.sprint)),k=Math.max(0,Math.min(1,sneakW)),wob=reduced?0:1;
 const sw=Math.sin(g.phase)*a*wob,bob=Math.cos(g.phase*2)*a*wob;
 const o=gripOut;let lx=0,ly=0,lz=0,dx=0,dy=0,dz=0;
 for(let i=0;i<3;i++){// idle → walk → sprint, then toward Net down
  const c=lerp(lerp(GRIP_IDLE.l[i],GRIP_WALK.l[i],a),GRIP_SPRINT.l[i],sp),cd=lerp(lerp(GRIP_IDLE.d[i],GRIP_WALK.d[i],a),GRIP_SPRINT.d[i],sp);
  const v=lerp(c,GRIP_SNEAK.l[i],k),vd=lerp(cd,GRIP_SNEAK.d[i],k);
  if(i===0){lx=v;dx=vd;}else if(i===1){ly=v;dy=vd;}else{lz=v;dz=vd;}}
 // The carry sway: the pole rocks across with each stride and the hands bob on the steps (softer when stalking or sprinting).
 const amp=(1-.5*sp)*(1-.6*k);lx+=.012*sw*amp;ly+=.016*bob*amp;dx+=.06*sw*amp;dz+=.02*bob*amp;
 const n=Math.hypot(dx,dy,dz)||1;dx/=n;dy/=n;dz/=n;
 let gap=lerp(lerp(NET_HAND_GAP.idle,NET_HAND_GAP.carry,a),NET_HAND_GAP.sneak,k);
 // The catch stage's show: present → raised by showK, blended in by showW (both eased by the caller).
 const sw2=Math.max(0,Math.min(1,showW)),sk=Math.max(0,Math.min(1,showK));
 if(sw2>0){const L=(i:number)=>lerp(GRIP_PRESENT.l[i],GRIP_RAISED.l[i],sk),D=(i:number)=>lerp(GRIP_PRESENT.d[i],GRIP_RAISED.d[i],sk);
  lx=lerp(lx,L(0),sw2);ly=lerp(ly,L(1),sw2);lz=lerp(lz,L(2),sw2);dx=lerp(dx,D(0),sw2);dy=lerp(dy,D(1),sw2);dz=lerp(dz,D(2),sw2);
  const m=Math.hypot(dx,dy,dz)||1;dx/=m;dy/=m;dz/=m;gap=lerp(gap,.3,sw2);}
 o.h1[0]=lx;o.h1[1]=ly;o.h1[2]=lz;o.h0[0]=lx+dx*gap;o.h0[1]=ly+dy*gap;o.h0[2]=lz+dz*gap;o.dir[0]=dx;o.dir[1]=dy;o.dir[2]=dz;o.crouch=NET_SNEAK_CROUCH*k;
 if(jar&&jar.w>0)jarGrip(o,sneakW,g,reduced,showW,showK,jar);
 return o;
}
// ---- The firefly jar's grip (Oct 21 2026, user: "the player holds the jar in both hands"). Both mittens on the jar's sides
// (JAR_HAND_GAP apart, across the body), the jar's centre on a path (rig-local, from the feet): carried in front of the chest, a
// little lower and further out in Jar low, the Cup's scoop (low on the right → up and over in front at head height → back), the
// catch's hold-up and the stage's show (presented → raised over the head). Every point is inside both arms' reach (tests check it).
type V3=readonly [number,number,number];
const JAR_IDLE:V3=[0,.98,.3],JAR_WALK:V3=[0,.99,.32],JAR_SPRINT:V3=[0,1.03,.27],JAR_SNEAK:V3=[0,.88,.37];
const JAR_CUP:readonly [number,V3|null][]=[[0,null],[.26,[.18,.82,.26]],[.48,[0,1.38,.42]],[.68,[0,1.18,.37]],[1,null]];
const JAR_UP:V3=[0,1.72,.17],JAR_PRESENT:V3=[0,1.12,.4];
/** Mitten centres either side of the jar (m). */
export const JAR_HAND_GAP=.28;
const jarC=[0,0,0];
export type JarGripIn={w:number;cupW:number;cupK:number;catchW:number;catchK:number};
/** Overrides `o` (netGrip's result) with the jar hold, weighted by `j.w`. */
function jarGrip(o:NetGrip,sneakW:number,g:Gait,reduced:boolean,showW:number,showK:number,j:JarGripIn){
 const a=Math.max(0,Math.min(1,g.amount)),sp=Math.max(0,Math.min(1,g.sprint)),k=Math.max(0,Math.min(1,sneakW)),wob=reduced?0:1;
 const sw=Math.sin(g.phase)*a*wob,bob=Math.cos(g.phase*2)*a*wob,amp=(1-.5*sp)*(1-.6*k);
 const c=jarC;for(let i=0;i<3;i++)c[i]=lerp(lerp(lerp(JAR_IDLE[i],JAR_WALK[i],a),JAR_SPRINT[i],sp),JAR_SNEAK[i],k);
 c[0]+=.01*sw*amp;c[1]+=.014*bob*amp;
 const cw=Math.max(0,Math.min(1,j.cupW));if(cw>0){const q=Math.max(0,Math.min(1,j.cupK));let i=0;while(i<JAR_CUP.length-2&&q>JAR_CUP[i+1][0])i++;
  const [t0,p0]=JAR_CUP[i],[t1,p1]=JAR_CUP[i+1],u0=t1>t0?Math.max(0,Math.min(1,(q-t0)/(t1-t0))):1,u=u0*u0*(3-2*u0);
  for(let d=0;d<3;d++){const A=p0?p0[d]:c[d],B=p1?p1[d]:c[d];c[d]=lerp(c[d],lerp(A,B,u),cw);}}
 const kw=Math.max(0,Math.min(1,j.catchW));if(kw>0){const q=Math.max(0,Math.min(1,j.catchK)),up=q<.25?q/.25:q<.62?1:q<.85?1-(q-.62)/.23:0,e=up*up*(3-2*up);
  for(let d=0;d<3;d++)c[d]=lerp(c[d],lerp(c[d],JAR_UP[d],e),kw);}
 const hw=Math.max(0,Math.min(1,showW));if(hw>0){const s=Math.max(0,Math.min(1,showK));for(let d=0;d<3;d++)c[d]=lerp(c[d],lerp(JAR_PRESENT[d],JAR_UP[d],s),hw);}
 const w=Math.max(0,Math.min(1,j.w)),h=JAR_HAND_GAP/2;
 o.h0[0]=lerp(o.h0[0],c[0]-h,w);o.h0[1]=lerp(o.h0[1],c[1],w);o.h0[2]=lerp(o.h0[2],c[2],w);
 o.h1[0]=lerp(o.h1[0],c[0]+h,w);o.h1[1]=lerp(o.h1[1],c[1],w);o.h1[2]=lerp(o.h1[2],c[2],w);
 if(w>=.5){o.dir[0]=-1;o.dir[1]=0;o.dir[2]=0;}o.crouch=lerp(o.crouch,NET_SNEAK_CROUCH*k*.6,w);
 return o;
}
function set(p:Partial<Omit<PoseTarget,'upper'>>){
 out.py=p.py??N.py;out.pz=p.pz??N.pz;out.tx=p.tx??N.tx;out.ty=p.ty??N.ty;out.hx=p.hx??N.hx;out.hy=p.hy??N.hy;out.toe=p.toe??N.toe;
 const fl=p.fl??N.fl,fr=p.fr??N.fr,al=p.al??N.al,ar=p.ar??N.ar;out.fl[0]=fl[0];out.fl[1]=fl[1];out.fr[0]=fr[0];out.fr[1]=fr[1];
 for(let i=0;i<4;i++){out.al[i]=al[i]??0;out.ar[i]=ar[i]??0;}
}
/** Blend keyframe a → b by k into `out` (Jobs upgrade, Oct 25 2026: no merged objects per frame; a missing key reads the neutral). */
function mixKeys(a:Partial<Omit<PoseTarget,'upper'>>,b:Partial<Omit<PoseTarget,'upper'>>,k:number){
 out.py=lerp(a.py??N.py,b.py??N.py,k);out.pz=lerp(a.pz??N.pz,b.pz??N.pz,k);out.tx=lerp(a.tx??N.tx,b.tx??N.tx,k);out.ty=lerp(a.ty??N.ty,b.ty??N.ty,k);
 out.hx=lerp(a.hx??N.hx,b.hx??N.hx,k);out.hy=lerp(a.hy??N.hy,b.hy??N.hy,k);out.toe=lerp(a.toe??N.toe,b.toe??N.toe,k);
 const afl=a.fl??N.fl,bfl=b.fl??N.fl,afr=a.fr??N.fr,bfr=b.fr??N.fr,aal=a.al??N.al,bal=b.al??N.al,aar=a.ar??N.ar,bar=b.ar??N.ar;
 for(let i=0;i<2;i++){out.fl[i]=lerp(afl[i],bfl[i],k);out.fr[i]=lerp(afr[i],bfr[i],k);}
 for(let i=0;i<4;i++){out.al[i]=lerp(aal[i]??0,bal[i]??0,k);out.ar[i]=lerp(aar[i]??0,bar[i]??0,k);}
}
/** Allocation-free writers for the held poses (Jobs upgrade, Oct 25 2026). */
function neutral(){out.py=N.py;out.pz=N.pz;out.tx=N.tx;out.ty=N.ty;out.hx=N.hx;out.hy=N.hy;out.toe=N.toe;out.fl[0]=N.fl[0];out.fl[1]=N.fl[1];out.fr[0]=N.fr[0];out.fr[1]=N.fr[1];
 for(let i=0;i<4;i++){out.al[i]=N.al[i]??0;out.ar[i]=N.ar[i]??0;}}
function arm(a:Arm,sx:number,sz:number,ex:number,hy=0){a[0]=sx;a[1]=sz;a[2]=ex;a[3]=hy;}
function armOf(a:Arm,b:Arm){a[0]=b[0];a[1]=b[1];a[2]=b[2];a[3]=b[3]??0;}
/** Idle fidget for the held carry poses: standing still, a slow breath in the chest and a look around (0 while walking). */
function fidget(g:Gait,time:number,wob:number){const still=(1-Math.max(0,Math.min(1,g.amount)))*wob;out.tx+=.018*Math.sin(time*2.1)*still;out.hy+=.14*Math.sin(time*.55)*still;}
/** The pose target for `pose` (the same object is reused: copy what you keep). `time` drives the tug / sweep rhythm. */
/** The firefly jar's held poses use the net's body (the arms are solved onto the jar instead of the pole). */
const JAR_BODY:Partial<Record<JobPoseKind,JobPoseKind>>={jarcarry:'netcarry',jarsneak:'netsneak',jarshow:'netshow',jarcatch:'netcatch'};
export const JAR_POSES=new Set<JobPoseKind>(['jarcarry','jarsneak','jarcup','jarcatch','jarshow']);
export function jobPoseTarget(pose:JobPose,time:number,reduced:boolean,gait?:Gait):PoseTarget{
 const k=Math.max(0,Math.min(1,pose.progress)),tug=Math.max(0,Math.min(1,pose.tug??0)),wob=reduced?0:1;out.upper=!!pose.upper||UPPER_POSES.has(pose.kind);
 const kind=JAR_BODY[pose.kind]??pose.kind;
 const keys=KEYS[kind];
 if(keys){let i=0;while(i<keys.length-2&&k>keys[i+1][0])i++;const [t0,a]=keys[i],[t1,b]=keys[i+1],u=t1>t0?Math.max(0,Math.min(1,(k-t0)/(t1-t0))):1;mixKeys(a,b,u*u*(3-2*u));
  // Garden: free picking has no basket, so the left arm balances instead; reduced motion keeps the look but not the shake.
  if(GARDEN_POSES.has(pose.kind)&&!pose.basket)for(let j=0;j<4;j++)out.al[j]=BALANCE[j]??0;
  if(reduced&&pose.kind==='headshake')out.hy=0;
  if(reduced&&pose.kind==='cheer'){out.py=Math.min(out.py,N.py);out.toe=0;out.fl[1]=out.fr[1]=N.fl[1];}
  return out;}
 switch(kind){
  // Crouch, grip the leaves with both hands and lean back as the meter fills; small tugs in rhythm with it.
  case 'pull':{const t=Math.sin(time*22)*.035*tug*wob;set({py:.6+.06*tug,pz:-.06-.16*tug+t,tx:.45-.73*tug+t*2,hx:.35-.15*tug,fl:[.26,.07],fr:[-.05,.07],al:[-.9+.1*tug,.14,-.12],ar:[-.9+.1*tug,.14,-.12]});break;}
  // Two-handed rake: the torso turns and the arms sweep across in front while Rake is held.
  // Jobs upgrade (Oct 25 2026): a real raking stroke. Reach out (arms long, chest over the front boot, the front foot steps in), then
  // the firmer pull back toward you (elbows bend, weight back), with the sweep turning a little across the pile each stroke.
  case 'rake':{const a=k*Math.PI*2,r=wob?.5-.5*Math.cos(a):.5,pull=wob?Math.max(0,Math.sin(a)):0,s=Math.sin(a*.5)*wob;neutral();
   out.py=.8-.03*r;out.pz=-.02+.05*r;out.tx=.3+.24*r;out.ty=.2*s;out.hx=.32+.08*r;out.fl[0]=.18+.08*r;out.fr[0]=-.18+.03*pull;
   arm(out.al,-.68-.4*r,.22,-.7+.38*r);arm(out.ar,-.92-.38*r,.04,-.45+.3*r);break;}
  // Bug squad net carry (bug-polish, Oct 20 2026): the arms are solved onto the pole by player.ts (netGrip below); these angles are
  // only the fallback. The torso counter-rotates against the walk (the arms no longer swing) and leans a little more with speed.
  case 'netcarry':{const g=gait??IDLE_GAIT,s=Math.sin(g.phase)*g.amount*wob;
   set({tx:.03+.05*g.amount+.08*g.sprint,ty:-.1+.07*s,hx:.02-.03*g.amount,al:[-1.25,.1,-1.2],ar:[-.9,.1,-1.3]});break;}
  // Net down (stalking): lean in and look down the pole, both hands forward and low, the net ahead at the grass (legs bent by
  // player.ts, NET_SNEAK_CROUCH); a small sway with the creeping steps.
  // The catch stage's show (bugCatch.ts CATCH_STAGE): progress = the raise (0 = net presented in front, 1 = raised beside the head),
  // tug = the hop of joy (0..1, up on the toes); the arms are solved onto the pole by player.ts (netGrip's show keys).
  case 'netshow':{const r=k,h=tug;set({py:.84+.02*r+.13*h,pz:.02,tx:.1-.16*r,ty:-.08*r,hx:.12-.42*r,hy:.18*r,toe:.5*h,fl:[.12,.07+.13*h],fr:[-.12,.07+.13*h],al:[-1.2-1.2*r,.15,-.6],ar:[-1.1-1.2*r,.1,-.5]});break;}
  case 'netsneak':{const g=gait??IDLE_GAIT,s=Math.sin(g.phase)*g.amount*wob;set({tx:.3,hx:.12,ty:-.05+.04*s,al:[-1.1,.05,-.5],ar:[-.9,.05,-.9]});break;}
  // Line marker (Jobs upgrade, Oct 25 2026): both hands on the handle at the hips; painting, the body leans into it and the eyes
  // follow the line down at the wheel; every step gives the handle a small push.
  case 'push':{const g=gait??IDLE_GAIT,st=Math.sin(g.phase*2)*g.amount*wob,h=tug;neutral();
   out.tx=.1+.16*h+.025*st;out.hx=.08+.26*h;out.ty=.04*Math.sin(g.phase)*g.amount*wob;
   arm(out.al,-1.02+.22*(1-h)-.05*st,-.05,-.42+.08*st);arm(out.ar,-1.02+.22*(1-h)-.05*st,-.05,-.42+.08*st);fidget(g,time,wob*(1-h));break;}
  // Carrying with a load (Jobs upgrade, Oct 25 2026): the body leans back a little against a ball hugged to the chest, the load
  // bobs with each step, a free arm swings against the stride; standing, a slow breath and a look around.
  case 'carryball':{const g=gait??IDLE_GAIT,b=Math.cos(g.phase*2)*g.amount*wob;neutral();out.tx=-.02-.05*g.amount+.015*b;out.hx=-.03;
   arm(out.al,CARRY_BALL[0]+.05*b,CARRY_BALL[1],CARRY_BALL[2]-.06*b);arm(out.ar,CARRY_BALL[0]+.05*b,CARRY_BALL[1],CARRY_BALL[2]-.06*b);fidget(g,time,wob);break;}
  case 'carrycard':{const g=gait??IDLE_GAIT,b=Math.cos(g.phase*2)*g.amount*wob;neutral();out.tx=.02+.02*g.amount;out.hx=.12;
   arm(out.al,CARD[0]+.04*b,CARD[1],CARD[2]);arm(out.ar,CARD[0]+.04*b,CARD[1],CARD[2]);fidget(g,time,wob);break;}
  case 'carrystack':{const g=gait??IDLE_GAIT,sw=Math.sin(g.phase)*g.amount*wob,b=Math.cos(g.phase*2)*g.amount*wob;neutral();out.ty=.06*sw;out.tx=.03*g.amount;
   arm(out.al,STACK[0]+.04*b,STACK[1],STACK[2]-.04*b);arm(out.ar,.05-.45*sw,.14,-.3-.15*Math.abs(sw));fidget(g,time,wob);break;}
  case 'carrybasket':{const g=gait??IDLE_GAIT,sw=Math.sin(g.phase)*g.amount*wob;neutral();armOf(out.al,BASKET);out.al[0]+=.06*sw;
   arm(out.ar,.05-.42*sw,.13,-.3-.12*Math.abs(sw));out.ty=.05*sw;fidget(g,time,wob);break;}
  // The assistant referee's ready stance: flag held down by the right leg, the free arm relaxed; standing, the eyes keep scanning.
  case 'flaghold':{const g=gait??IDLE_GAIT;neutral();arm(out.ar,-.12,.1,-.2);fidget(g,time,wob);break;}
  // Kneel at the pump (right knee down), both hands on the handle; each stroke leans in and pushes it down.
  // Jobs upgrade (Oct 25 2026): each stroke also dips the body onto the handle (a small bounce through the hips).
  case 'kneel':set({py:.52-.035*tug*wob,pz:.02,tx:.3+.25*tug,hx:.35+.08*tug,fl:[.32,.07],fr:[-.4,.1],al:[-1.05+.2*tug,.06,-.65+.45*tug],ar:[-1.05+.2*tug,.06,-.65+.45*tug]});break;
  default:set({});
 }
 return out;
}
