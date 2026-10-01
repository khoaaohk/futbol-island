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
const PULLED={py:.66,pz:-.22,tx:-.28,hx:.2,fl:[.26,.07] as [number,number],fr:[-.05,.07] as [number,number],al:[-.95,.14,-.1] as Arm,ar:[-.95,.14,-.1] as Arm};
/** One-shot keyframes (progress 0 → 1). Held poses are computed below from their live value (`tug`). */
const KEYS:Partial<Record<JobPoseKind,Key[]>>={
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
 pick:[[0,{}],[.45,{py:.58,pz:-.05,tx:.95,hx:.3,fl:[.14,.07],fr:[-.1,.07],al:[-1,.1,-.1],ar:[-1,.1,-.1]}],[.75,{py:.72,tx:.5,al:[-.8,.1,-.6],ar:[-.8,.1,-.6]}],[1,{}]],
 stuff:[[0,{}],[.45,{py:.66,tx:.8,hx:.3,fl:[.14,.07],al:[-.95,.15,-.2],ar:[-.95,.15,-.2]}],[.8,{py:.82,tx:.2,ty:-.35,ar:[-.25,.55,-1.1],al:[-.6,.2,-.6]}],[1,{}]],
 toss:[[0,{}],[.35,{py:.82,tx:-.1,ty:.35,fr:[-.2,.07],ar:[.75,.3,-.2],al:[-.5,.3,-.3]}],[.62,{py:.84,tx:.25,ty:-.3,fl:[.2,.07],ar:[-2.05,.2,-.2],al:[-.7,.35,-.3]}],[1,{}]],
 scoop:[[0,{}],[.45,{py:.58,tx:.85,hx:.35,fl:[.16,.07],fr:[-.12,.07],al:[-1.1,.02,-.2],ar:[-1.1,.02,-.2]}],[.8,{py:.8,tx:.3,al:[-1.1,-.02,-1.2],ar:[-1.1,-.02,-1.2]}],[1,{al:CARRY_BALL,ar:CARRY_BALL}]],
 throwin:[[0,{al:CARRY_BALL,ar:CARRY_BALL}],[.4,{py:.84,tx:-.3,hx:-.2,fl:[.26,.07],fr:[-.22,.07],al:[-2.9,.15,-1.7],ar:[-2.9,.15,-1.7]}],[.62,{py:.82,tx:.35,fl:[.26,.07],fr:[-.22,.07],al:[-2.05,.1,-.2],ar:[-2.05,.1,-.2]}],[1,{tx:.12,al:[-1.1,.12,-.3],ar:[-1.1,.12,-.3]}]],
 place:[[0,{al:STACK}],[.5,{py:.56,tx:.72,hx:.35,fl:[.2,.07],fr:[-.15,.07],al:STACK,ar:[-.85,.05,-.1]}],[1,{al:STACK}]],
 mallet:[[0,{}],[.25,{py:.84,tx:-.22,hx:-.1,fl:[.18,.07],fr:[-.14,.07],al:[-2.85,.08,-.7],ar:[-2.85,.08,-.7]}],[.55,{py:.76,tx:.55,hx:.3,fl:[.18,.07],fr:[-.14,.07],al:[-.75,.04,-.1],ar:[-.75,.04,-.1]}],[1,{py:.8,tx:.35,hx:.25,al:[-.85,.06,-.3],ar:[-.85,.06,-.3]}]],
 drop:[[0,{al:CARD,ar:CARD}],[.5,{py:.78,tx:.55,hx:.4,al:[-1.3,.05,-.2],ar:[-1.3,.05,-.2]}],[1,{}]],
 take:[[0,{}],[.5,{py:.78,tx:.5,hx:.4,al:[-1.2,.05,-.3],ar:[-1.2,.05,-.3]}],[1,{al:CARD,ar:CARD}]],
 // First touch on the rebound: the right boot comes up to cushion it, eyes on the ball, arms out for balance.
 control:[[0,{py:.84,tx:.12,hx:.3,fr:[.14,.12],al:[-.2,.35,-.3],ar:[-.1,.3,-.3]}],[.5,{py:.82,tx:.18,hx:.35,fr:[.32,.2],al:[-.25,.45,-.3],ar:[-.1,.4,-.3]}],[1,{}]],
 // Wall rebounds: the legs keep the juggle's receive; eyes down on the ball, a soft knee-high balance with the arms.
 firsttouch:[[0,{}],[.4,{tx:.2,hx:.4,al:[-.3,.55,-.35],ar:[-.25,.5,-.35]}],[1,{}]],
 flagup:[[0,{}],[.3,{ar:[-3.05,.04,-.05],hx:-.1}],[.85,{ar:[-3.05,.04,-.05],hx:-.1}],[1,{ar:[-3.05,.04,-.05]}]],
 flagdown:[[0,{}],[.4,{al:[-1.45,.12,-.1],ar:[.1,.1,-.1],tx:.05}],[.8,{al:[-1.3,.35,-.1]}],[1,{}]],
};
const out:PoseTarget={...N,fl:[0,.07],fr:[0,.07],al:[0,0,0,0],ar:[0,0,0,0],upper:false};
const lerp=(a:number,b:number,k:number)=>a+(b-a)*k;
function set(p:Partial<Omit<PoseTarget,'upper'>>){
 out.py=p.py??N.py;out.pz=p.pz??N.pz;out.tx=p.tx??N.tx;out.ty=p.ty??N.ty;out.hx=p.hx??N.hx;out.hy=p.hy??N.hy;out.toe=p.toe??N.toe;
 const fl=p.fl??N.fl,fr=p.fr??N.fr,al=p.al??N.al,ar=p.ar??N.ar;out.fl[0]=fl[0];out.fl[1]=fl[1];out.fr[0]=fr[0];out.fr[1]=fr[1];
 for(let i=0;i<4;i++){out.al[i]=al[i]??0;out.ar[i]=ar[i]??0;}
}
function mixKeys(a:Partial<Omit<PoseTarget,'upper'>>,b:Partial<Omit<PoseTarget,'upper'>>,k:number){
 const A={...N,...a},B={...N,...b};
 out.py=lerp(A.py,B.py,k);out.pz=lerp(A.pz,B.pz,k);out.tx=lerp(A.tx,B.tx,k);out.ty=lerp(A.ty,B.ty,k);out.hx=lerp(A.hx,B.hx,k);out.hy=lerp(A.hy,B.hy,k);out.toe=lerp(A.toe,B.toe,k);
 for(let i=0;i<2;i++){out.fl[i]=lerp(A.fl[i],B.fl[i],k);out.fr[i]=lerp(A.fr[i],B.fr[i],k);}
 for(let i=0;i<4;i++){out.al[i]=lerp(A.al[i]??0,B.al[i]??0,k);out.ar[i]=lerp(A.ar[i]??0,B.ar[i]??0,k);}
}
/** The pose target for `pose` (the same object is reused: copy what you keep). `time` drives the tug / sweep rhythm. */
export function jobPoseTarget(pose:JobPose,time:number,reduced:boolean):PoseTarget{
 const k=Math.max(0,Math.min(1,pose.progress)),tug=Math.max(0,Math.min(1,pose.tug??0)),wob=reduced?0:1;out.upper=!!pose.upper||UPPER_POSES.has(pose.kind);
 const keys=KEYS[pose.kind];
 if(keys){let i=0;while(i<keys.length-2&&k>keys[i+1][0])i++;const [t0,a]=keys[i],[t1,b]=keys[i+1],u=t1>t0?Math.max(0,Math.min(1,(k-t0)/(t1-t0))):1;mixKeys(a,b,u*u*(3-2*u));
  // Garden: free picking has no basket, so the left arm balances instead; reduced motion keeps the look but not the shake.
  if(GARDEN_POSES.has(pose.kind)&&!pose.basket)for(let j=0;j<4;j++)out.al[j]=BALANCE[j]??0;
  if(reduced&&pose.kind==='headshake')out.hy=0;
  return out;}
 switch(pose.kind){
  // Crouch, grip the leaves with both hands and lean back as the meter fills; small tugs in rhythm with it.
  case 'pull':{const t=Math.sin(time*22)*.035*tug*wob;set({py:.6+.06*tug,pz:-.06-.16*tug+t,tx:.45-.73*tug+t*2,hx:.35-.15*tug,fl:[.26,.07],fr:[-.05,.07],al:[-.9+.1*tug,.14,-.12],ar:[-.9+.1*tug,.14,-.12]});break;}
  // Two-handed rake: the torso turns and the arms sweep across in front while Rake is held.
  case 'rake':{const s=Math.sin(k*Math.PI*2)*wob;set({py:.8,tx:.38+.08*Math.cos(k*Math.PI*4)*wob,ty:.28*s,hx:.3,fl:[.22,.07],fr:[-.16,.07],al:[-.75+.25*s,.25,-.55],ar:[-1.05+.25*s,.05,-.3]});break;}
  case 'push':set({tx:.18,hx:.1,al:[-1.05+.25*(1-tug),-.05,-.4],ar:[-1.05+.25*(1-tug),-.05,-.4]});break;
  case 'carryball':set({tx:.04,al:CARRY_BALL,ar:CARRY_BALL});break;
  case 'carrycard':set({tx:.04,al:CARD,ar:CARD});break;
  case 'carrystack':set({al:STACK});break;
  case 'carrybasket':set({al:BASKET});break;
  case 'flaghold':set({ar:[-.12,.1,-.2]});break;
  // Kneel at the pump (right knee down), both hands on the handle; each stroke leans in and pushes it down.
  case 'kneel':set({py:.52,pz:.02,tx:.3+.25*tug,hx:.35,fl:[.32,.07],fr:[-.4,.1],al:[-1.05+.2*tug,.06,-.65+.45*tug],ar:[-1.05+.2*tug,.06,-.65+.45*tug]});break;
  default:set({});
 }
 return out;
}
