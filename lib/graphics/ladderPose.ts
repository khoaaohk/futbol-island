// Lighthouse ladder climbing pose (Oct 26 2026; lib/town/lighthouseLadder.ts drives it). Fills the rig's optional full-body
// TrickPose (lib/graphics/trickPose.ts: rig root frame, +z toward the ladder) from the ladder's state, once per frame, with no
// allocation. The rig blends it over its own solve and fades it out by itself when the host stops sending it.
//  - Climb: hand over hand, opposite foot with it (left hand with right foot). The rhythm is the ladder's `cycle` (two rungs per
//    cycle, SIGNED, so a planted foot stays on its rung both ways): a foot stands on its rung for 70% of the cycle and steps one
//    up (or down) in the rest; the hand on the other side reaches up as that foot steps. Body close to the rails, a slight hip
//    sway, the head up on the way up and down on the way down.
//  - Slide (down held): both hands on the side rails, feet off the rungs and crossed, body straight, looking down.
//  - Landing: a gentle squat at the foot (deeper after a fast slide). Top: a leg swings over onto the gallery (and back).
//  - Reduced motion: the same poses, no hip sway.
import type {TrickPose} from './trickPose';
import type {LadderState} from '../town/lighthouseLadder';

const TAU=Math.PI*2;
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;
const smooth=(k:number)=>{k=clamp(k,0,1);return k*k*(3-2*k);};
const frac=(v:number)=>v-Math.floor(v);
/** One foot's height in the root frame (ankle, m) and its toward-the-ladder offset at cycle phase f (0…1). */
const FOOT_HI=.52,PLANT=.7,STEP=.6;// two rungs (0.3 m) a cycle
function footAt(f:number,out:{y:number;z:number}){
 if(f<PLANT){out.y=FOOT_HI-STEP*f;out.z=.24;return;}
 const k=(f-PLANT)/(1-PLANT),e=smooth(k);out.y=FOOT_HI-STEP*PLANT+STEP*PLANT*e+Math.sin(Math.PI*k)*.05;out.z=.24-Math.sin(Math.PI*k)*.1;// lifts clear of the rung
}
/** One hand's shoulder pitch and elbow at phase f: reaching high as its opposite foot steps, pulling down while it holds. */
function handAt(f:number,out:{sx:number;el:number}){
 if(f<PLANT){const k=f/PLANT;out.sx=-2.85+.8*k;out.el=-.2-.75*k;return;}
 const e=smooth((f-PLANT)/(1-PLANT));out.sx=-2.05-.8*e;out.el=-.95+.75*e;
}
const foot={y:0,z:0},hand={sx:0,el:0};

function neutral(p:TrickPose){
 p.pelvisY=.86;p.pelvisZ=.02;p.pelvisPitch=0;p.pelvisRoll=0;p.pelvisYaw=0;p.torsoPitch=.08;p.torsoRoll=0;p.torsoYaw=0;p.headPitch=0;p.headYaw=0;
 for(let i=0;i<2;i++){const L=p.legs[i];L.x=i?.12:-.12;L.y=.075;L.z=0;L.toe=0;L.w=1;const A=p.arms[i];A.sx=0;A.sz=.12;A.el=-.2;A.w=1;}
}
/** The climbing pose at the ladder's cycle (both directions), written into p. */
function climbPose(p:TrickPose,s:LadderState,reduced:boolean){
 const c=s.cycle,fl=frac(c),fr=frac(c+.5);
 footAt(fl,foot);p.legs[0].y=foot.y;p.legs[0].z=foot.z;footAt(fr,foot);p.legs[1].y=foot.y;p.legs[1].z=foot.z;
 p.legs[0].x=-.13;p.legs[1].x=.13;p.legs[0].toe=p.legs[1].toe=.05;
 // Left hand with the right foot, right hand with the left foot.
 handAt(fr,hand);p.arms[0].sx=hand.sx;p.arms[0].el=hand.el;p.arms[0].sz=.16;handAt(fl,hand);p.arms[1].sx=hand.sx;p.arms[1].el=hand.el;p.arms[1].sz=.16;
 p.pelvisY=.8;p.pelvisZ=.03;p.torsoPitch=.12;
 const sway=reduced?0:Math.sin(c*TAU);p.pelvisRoll=.05*sway;p.pelvisYaw=.04*sway;p.torsoRoll=-.03*sway;
 p.headPitch=s.speed<-.05?.3:-.28;// look where you are going
}
function slidePose(p:TrickPose){
 p.pelvisY=.9;p.pelvisZ=0;p.pelvisPitch=0;p.pelvisRoll=0;p.pelvisYaw=0;p.torsoPitch=.04;p.torsoRoll=0;p.headPitch=.4;
 const L=p.legs;L[0].x=.04;L[1].x=-.04;L[0].y=.2;L[1].y=.12;L[0].z=L[1].z=.2;L[0].toe=L[1].toe=.45;// crossed, off the rungs
 for(let i=0;i<2;i++){const A=p.arms[i];A.sx=-1.65;A.sz=.3;A.el=-.55;}// both hands round the side rails at chest height
}

/**
 * Writes the ladder pose for state `s` into `p` (one per player) and returns its blend weight (0 = off: the host passes no pose
 * and the rig fades it out). Pure apart from the module scratch; no allocation.
 */
export function fillLadderPose(p:TrickPose,s:LadderState,reduced:boolean){
 neutral(p);
 switch(s.phase){
  case 'off':p.w=0;return 0;
  case 'mount':climbPose(p,s,reduced);p.w=smooth(s.k/.8);break;
  case 'climb':climbPose(p,s,reduced);p.w=1;break;
  case 'slide':slidePose(p);p.w=1;break;
  case 'topOut':case 'topIn':{// a leg swings over the deck's edge between the gate posts; the hands let go of the handles
   const k=s.phase==='topOut'?s.k:1-s.k,lift=Math.sin(Math.PI*clamp(k*1.4,0,1));
   p.legs[1].y=.075+.42*lift;p.legs[1].z=.3*lift;p.legs[1].toe=.2*lift;p.legs[0].y=.075;p.legs[0].z=-.05;
   p.arms[0].sx=p.arms[1].sx=-1.5*(1-smooth(k));p.arms[0].el=p.arms[1].el=-.5;p.arms[0].sz=p.arms[1].sz=.2;
   p.pelvisY=.86-.06*lift;p.torsoPitch=.1*lift;p.w=1-smooth((k-.55)/.45);break;}
  case 'land':{const q=Math.sin(Math.PI*clamp(s.k,0,1))*(s.impact>.3?.3+.5*s.impact:.25);
   p.pelvisY=.88-.32*q;p.torsoPitch=.08+.3*q;p.headPitch=.1;
   p.legs[0].x=-.14;p.legs[1].x=.14;p.legs[0].z=p.legs[1].z=.06;
   for(let i=0;i<2;i++){const A=p.arms[i];A.sx=-.7*q-.3;A.sz=.3;A.el=-.5;}
   p.w=1-smooth((s.k-.6)/.4);break;}
 }
 return p.w;
}
