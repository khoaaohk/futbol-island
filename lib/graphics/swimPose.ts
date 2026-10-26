/**
 * Swim poses for the procedural rig (P0, Oct 15 2026; docs/swimming-research.md §2.3, docs/body-mechanics/BODY_MECHANICS.md):
 * treading water (idle), the front crawl (moving; faster and flatter on the Swim fast hold, with a breath every third stroke),
 * floating on the back (kept as a shape; the Float toggle became Dive on Oct 19 2026, which levels the crawl under water) and the splash-down entry (feet first, a belly-flop or a clean streamlined entry)
 * with the head-shake on surfacing. Applied from one optional `PlayerMotion.swim` field, like the zipline's pose: the keyframe
 * shapes are module constants, every joint is damped toward its target from a held copy (so wade → swim → float never pop),
 * nothing is allocated per frame, and offscreen posing stays skipped (the rig's host does not call update offscreen).
 *
 * Frame: the rig root sits SWIM_ROOT_DEPTH under the water line (lib/town/water/waterDepth.ts), so the water line is at
 * WATER_LINE above the root (every pelvis height is relative to it, so the body keeps its place against the water whatever the
 * root depth). Pelvis +x is the right hip; pelvis.rotation.x > 0 pitches the body forward (torso toward +z, the legs trailing
 * behind); hip.rotation.x > 0 swings a leg backward. Under the line the ocean opens a clear disc round the swimmer and the body
 * takes the underwater tint (lib/graphics/swimClear.ts, Oct 19 2026).
 */
import type * as T from 'three';

export type EntryStyle='feet'|'belly'|'clean';
export type SwimRigPose={
 /** 0 = not swimming (the rig fades the held pose out over ~.2 s); 1 = in the water. */
 w:number;
 kind:'tread'|'crawl'|'float'|'entry'|'hold';
 /** The stroke clock (rad; 0 with reduced motion), or seconds since the hit for 'entry'. */
 phase:number;
 /** 0..1 how hard the crawl is going; `fast` 1 on the Swim fast hold. */
 effort:number;fast:number;
 entry:EntryStyle;
 /** 1 → 0 over the surfacing head-shake (the splash-down's, and on the way back up from a dive). */
 shake:number;
 /** Dive (Oct 19 2026, waterState.ts DIVE): 0..1 how far under (the crawl levels out, the head lines up with the body) and the
  *  extra body pitch (rad, + = head down on the way down, − = head up on the way back up). Optional: 0 when absent. */
 under?:number;tilt?:number;
 /** Explore delight (Oct 21 2026, diveDelight.ts): a friendly WAVE (0..1: the right arm up and out, the hand swinging) or a HIGH FIVE
  *  (0..1: the right arm reaching straight ahead, palm forward) over any shape; `emoteT` the gesture's clock (s). Optional: 0 when absent. */
 wave?:number;five?:number;emoteT?:number;
 /** The surface glide (Oct 25 2026, waterState.ts GLIDE): 0..1, the stick let go while still carrying: both arms reach ahead together
  *  (a streamline), the flutter kick eases. Optional: 0 when absent. Under the water the crawl's own coast (arms back) applies. */
 glide?:number;
};
export type SwimJoints={pelvis:T.Group;torso:T.Group;head:T.Group;legs:{hip:T.Group;knee:T.Group;ankle:T.Group}[];arms:{shoulder:T.Group;elbow:T.Group;hand:T.Group}[]};

/** The water line above the rig root while swimming (= waterDepth.ts SWIM_ROOT_DEPTH; tests pin them equal). */
export const WATER_LINE=1.0;
/** How fast a new swim shape blends in (per second: ~.25 s to 90 %), and the fade-out when swimming ends. */
export const SWIM_SETTLE=9,SWIM_FADE=.2;
/** Treading water (user, Oct 15 2026: "wade in the water more with the arm movements"): one sculling cycle in seconds; with
 *  reduced motion the sculling runs at TREAD_REDUCED of that speed and nothing else moves. */
export const TREAD_CYCLE=1.1,TREAD_REDUCED=.55;
/** Target slots: pelvis y z pitch x roll | torso pitch yaw roll | head pitch yaw roll | per leg hipX hipZ hipY knee ankle (×2) |
 *  per arm shX shZ shY elbow (×2). Pelvis "roll" is pelvis.rotation.y: with the body pitched, the turn about the swim axis. */
const N=5+3+3+10+8;
const P_Y=0,P_Z=1,P_PITCH=2,P_X=3,P_ROLL=4,T_X=5,T_Y=6,T_Z=7,H_X=8,H_Y=9,H_Z=10,LEG=11,ARM=21;
const KIND={tread:0,crawl:1,float:2,entry:3,hold:4} as const,ENTRY={feet:0,belly:1,clean:2} as const;
const TAU=Math.PI*2;

export function createSwimPoser(j:SwimJoints){
 const held=new Float32Array(N),target=new Float32Array(N);
 // held = target + offset: the offset (where the body was minus the new shape) decays at SWIM_SETTLE, so a new shape blends in
 // over ~.25 s while the stroke itself plays at full amplitude with no lag.
 const offset=new Float32Array(N);
 let active=false,fade=0,key=-1,tread=0,roll=0;
 /** Read the joints the gait just posed, so the first swim frame blends from the walk instead of snapping. */
 const capture=()=>{
  held[P_Y]=j.pelvis.position.y;held[P_Z]=j.pelvis.position.z;held[P_PITCH]=j.pelvis.rotation.x;held[P_X]=j.pelvis.position.x;held[P_ROLL]=j.pelvis.rotation.y;
  held[T_X]=j.torso.rotation.x;held[T_Y]=j.torso.rotation.y;held[T_Z]=j.torso.rotation.z;
  held[H_X]=j.head.rotation.x;held[H_Y]=j.head.rotation.y;held[H_Z]=j.head.rotation.z;
  for(let i=0;i<2;i++){const l=j.legs[i],o=LEG+i*5;held[o]=l.hip.rotation.x;held[o+1]=l.hip.rotation.z;held[o+2]=l.hip.rotation.y;held[o+3]=l.knee.rotation.x;held[o+4]=l.ankle.rotation.x;
   const a=j.arms[i],q=ARM+i*4;held[q]=a.shoulder.rotation.x;held[q+1]=a.shoulder.rotation.z;held[q+2]=a.shoulder.rotation.y;held[q+3]=a.elbow.rotation.x;}
  key=-1;
 };
 const write=(w:number)=>{
  const mix=(o:T.Euler|T.Vector3,k:'x'|'y'|'z',v:number)=>{o[k]+=(v-o[k])*w;};
  if(j.pelvis.rotation.order!=='XYZ')j.pelvis.rotation.reorder('XYZ');
  mix(j.pelvis.position,'x',held[P_X]);mix(j.pelvis.position,'y',held[P_Y]);mix(j.pelvis.position,'z',held[P_Z]);
  mix(j.pelvis.rotation,'x',held[P_PITCH]);mix(j.pelvis.rotation,'y',held[P_ROLL]);mix(j.pelvis.rotation,'z',0);
  mix(j.torso.rotation,'x',held[T_X]);mix(j.torso.rotation,'y',held[T_Y]);mix(j.torso.rotation,'z',held[T_Z]);
  mix(j.head.rotation,'x',held[H_X]);mix(j.head.rotation,'y',held[H_Y]);mix(j.head.rotation,'z',held[H_Z]);
  for(let i=0;i<2;i++){const l=j.legs[i],o=LEG+i*5;if(l.hip.rotation.order!=='XYZ')l.hip.rotation.reorder('XYZ');
   mix(l.hip.rotation,'x',held[o]);mix(l.hip.rotation,'y',held[o+2]);mix(l.hip.rotation,'z',held[o+1]);mix(l.knee.rotation,'x',held[o+3]);mix(l.knee.rotation,'y',0);mix(l.knee.rotation,'z',0);mix(l.ankle.rotation,'x',held[o+4]);mix(l.ankle.rotation,'y',0);mix(l.ankle.rotation,'z',0);
   const a=j.arms[i],q=ARM+i*4;if(a.shoulder.rotation.order!=='XYZ')a.shoulder.rotation.reorder('XYZ');
   mix(a.shoulder.rotation,'x',held[q]);mix(a.shoulder.rotation,'y',held[q+2]);mix(a.shoulder.rotation,'z',held[q+1]);mix(a.elbow.rotation,'x',held[q+3]);mix(a.elbow.rotation,'y',0);mix(a.hand.rotation,'x',0);mix(a.hand.rotation,'y',0);mix(a.hand.rotation,'z',0);}
 };
 /** Fill `target` for the pose. `rollTurn` is the smoothed lean into a turn (rad). */
 const shape=(s:SwimRigPose,reduced:boolean,rollTurn:number)=>{
  const ph=reduced?0:s.phase;
  target[P_X]=0;target[P_ROLL]=0;
  for(let i=0;i<2;i++){target[LEG+i*5+2]=0;target[ARM+i*4+2]=0;}
  if(s.kind==='tread'){
   // Treading water, the face up (user, Oct 15 2026: "have the face pop up"; "wade in the water more with the arm
   // movements"). Both hands scull in slow figure-eights at the surface: elbows out, the upper arm sweeping in and out about the
   // body's vertical (shoulder y ±.5 rad; the hands skim the line and dip under on the out-sweep), the elbow folding in on the in-sweep and the hand dipping twice per cycle (shoulder z
   // ±.1 at 2×), one cycle per TREAD_CYCLE s, the arms half a cycle apart. The shoulders roll with each sweep (torso yaw ±.09,
   // roll ±.05; the head counters so the face stays front), the legs eggbeater (alternating knee circles: knee ±.32 with the hip
   // turning in/out ±.3, thighs apart) and the body bobs 4 cm (±2) with each push. Reduced motion: slower sculling only.
   const a0=tread,m=reduced?0:1,sweepL=Math.sin(a0),sweepR=-sweepL;
   target[P_Y]=WATER_LINE-.27+m*.02*Math.sin(2*a0-.6);target[P_Z]=0;target[P_PITCH]=-.04;
   target[T_X]=-.06;target[T_Y]=m*.09*sweepR;target[T_Z]=m*.05*Math.cos(a0)+rollTurn*.3;
   target[H_X]=-.42;target[H_Y]=-.7*target[T_Y];target[H_Z]=-.6*target[T_Z];
   for(let i=0;i<2;i++){const side=i===0?-1:1,o=LEG+i*5,a=a0+i*Math.PI,c=Math.sin(a),sw=i===0?sweepL:sweepR;
    // Eggbeater: thighs forward and apart, shins hanging, each lower leg circling (knee + hip turn in quadrature).
    target[o]=-.55+m*.08*c;target[o+1]=side*.42;target[o+2]=m*side*.3*Math.cos(a);target[o+3]=1.25+m*.32*c;target[o+4]=.25;
    // Sculling: sw = +1 at the in-sweep (hand in front of the chest), -1 at the out-sweep.
    const q=ARM+i*4;target[q]=-.35;target[q+1]=side*(1.25+.1*Math.sin(2*a+.8));target[q+2]=-side*(.25+.5*sw);target[q+3]=-.95-.3*sw;}
  }else if(s.kind==='crawl'){
   // A head-up crawl (user, Oct 15 2026: "have the face pop up"; "move side to side more when swimming"): the hips at the line,
   // the back out of the water, alternating arm recovery over the water, a flutter kick. The body rolls about the swim axis
   // with the stroke, the recovering arm's shoulder lifting: hips ±.17 rad (~10°), shoulders ±.37 (~21°; hips + torso); the
   // whole body sways ±3.5 cm; a breath to the right every second stroke (the face turns .6 rad, the head otherwise counters the
   // roll so the face stays forward and clear). Swim fast: flatter, quicker (the clock), the roll and sway 20 % smaller.
   // Under water (a dive): the body levels out (pitch toward 1.5), pitched further head-down / head-up by `tilt` on the way, the
   // head in line with the body, no breath; the same arms and flutter kick, so the stroke reads through the clear water.
   const fast=s.fast,e=s.effort,rs=1-.2*fast,rec1=-Math.sin(ph),uw=s.under??0;
   target[P_Y]=WATER_LINE+.02-.04*fast;target[P_Z]=.08;target[P_PITCH]=1.0+.12*fast+(1.5-1.0-.12*fast)*uw+(s.tilt??0);
   target[P_X]=.035*rs*Math.cos(ph);target[P_ROLL]=.17*rs*rec1;
   target[T_X]=.1-.04*fast;target[T_Y]=.2*rs*rec1;target[T_Z]=rollTurn;
   const breathe=reduced?0:Math.pow(Math.max(0,Math.sin(ph-.3)*-1),3)*(1-uw),bodyRoll=target[P_ROLL]+target[T_Y];
   target[H_X]=(-1.45-.12*fast+.08*breathe)*(1-uw)-.45*uw;target[H_Y]=.6*breathe;target[H_Z]=-bodyRoll*(1-.5*breathe);
   for(let i=0;i<2;i++){const side=i===0?-1:1,o=LEG+i*5,k=Math.sin(ph*1.5+i*Math.PI);
    target[o]=.12+.28*k*(.5+.5*e);target[o+1]=side*.06;target[o+3]=.2+.22*Math.max(0,-k);target[o+4]=-.35;
    const q=ARM+i*4,a=ph+i*Math.PI,rec=Math.max(0,Math.sin(a));
    target[q]=-1.45-1.3*Math.cos(a);target[q+1]=side*(.3+.4*rec);target[q+3]=-.35-.7*rec;}
   {const gl=Math.max(0,Math.min(1,s.glide??0))*(1-uw);
    if(gl>0)for(let i=0;i<2;i++){const side=i===0?-1:1,q=ARM+i*4,o=LEG+i*5;
     // The glide: arms stretched ahead, hands close (shoulder well forward, elbows straight), the kick easing toward a lazy flutter.
     target[q]+=(-2.8-target[q])*gl;target[q+1]+=(side*.14-target[q+1])*gl;target[q+3]+=(-.08-target[q+3])*gl;
     target[o]=.12+(target[o]-.12)*(1-.65*gl);target[o+3]+=(.12-target[o+3])*gl*.6;}
    if(gl>0){target[P_ROLL]*=1-.7*gl;target[T_Y]*=1-.7*gl;}}
   if(uw>.5){// Explore life (Oct 22 2026): under water the body undulates a little with the kick; coasting (the stick let go) the arms
    // sweep back along the body into a streamlined glide and the kick slows (the crawl's arms only turn over while really swimming).
    const g=uw*Math.max(0,1-e*2.2);target[P_PITCH]+=reduced?0:.05*uw*e*Math.sin(ph*1.5);
    for(let i=0;i<2;i++){const side=i===0?-1:1,q=ARM+i*4,o=LEG+i*5;target[q]+=(.15-target[q])*g;target[q+1]+=(side*.14-target[q+1])*g;target[q+3]+=(-.1-target[q+3])*g;
     target[o]=.12+(target[o]-.12)*(1-.6*g);}}
  }else if(s.kind==='hold'){
   // Hanging on to a manta or the whale shark (water P1b, lib/town/water/animalRides.ts): prone along the animal's back, the head
   // up out of the water (the face ahead), both arms reaching forward and down to the grip, hands close; the legs trailing in
   // the wake with a lazy flutter. `effort` carries the ride's roll into the turns (rad), on top of the poser's own turn lean.
   const k=reduced?0:Math.sin(ph*1.4),lean=Math.max(-.5,Math.min(.5,s.effort));
   target[P_Y]=WATER_LINE+.04;target[P_Z]=.1;target[P_PITCH]=1.12;target[P_ROLL]=lean*.6;
   target[T_X]=-.08;target[T_Y]=0;target[T_Z]=rollTurn+lean*.5;target[H_X]=-1.5;target[H_Y]=0;target[H_Z]=-(lean*.6+rollTurn)*.8;
   for(let i=0;i<2;i++){const side=i===0?-1:1,o=LEG+i*5;target[o]=.08+.1*k*side;target[o+1]=side*.1;target[o+3]=.18;target[o+4]=-.55;
    const q=ARM+i*4;target[q]=-2.55;target[q+1]=side*.16;target[q+3]=-.3;}
  }else if(s.kind==='float'){
   // On the back, a star, drifting: the body lies back along the line, face up, arms and legs apart.
   target[P_Y]=WATER_LINE-.04+(reduced?0:.03*Math.sin(ph));target[P_Z]=-.05;target[P_PITCH]=-1.5;
   target[T_X]=-.12;target[T_Y]=0;target[T_Z]=0;target[H_X]=-.25;target[H_Y]=0;target[H_Z]=0;
   for(let i=0;i<2;i++){const side=i===0?-1:1,o=LEG+i*5;target[o]=-.05;target[o+1]=side*.26;target[o+3]=.06;target[o+4]=.2;
    const q=ARM+i*4;target[q]=-.3;target[q+1]=side*(1.5+(reduced?0:.05*Math.sin(ph+i)));target[q+3]=-.1;}
  }else{
   // Entry: clean = arms together over the head, body straight (a streamlined drop); belly = flat and spread; feet = the fall's
   // upright shape with the arms up. Then the surfacing head-shake (shake 1 → 0).
   const clean=s.entry==='clean',belly=s.entry==='belly',shake=reduced?0:s.shake*Math.sin(s.phase*26)*.3;
   target[P_Y]=belly?WATER_LINE-.1:WATER_LINE-.37;target[P_Z]=0;target[P_PITCH]=belly?1.2:0;
   target[T_X]=belly?.1:0;target[T_Y]=0;target[T_Z]=shake*.3;target[H_X]=belly?-.9:clean?.25:-.15;target[H_Y]=shake;target[H_Z]=-shake*.5;
   for(let i=0;i<2;i++){const side=i===0?-1:1,o=LEG+i*5;target[o]=belly?.1:clean?0:-.2;target[o+1]=side*(belly?.45:clean?.02:.1);target[o+3]=clean?.02:belly?.15:.5;target[o+4]=clean?-.3:0;
    const q=ARM+i*4;target[q]=clean?-2.95:belly?-1.3:-.6;target[q+1]=side*(clean?.12:belly?1.3:2.2);target[q+3]=clean?-.05:belly?-.4:-.6;}
  }
  // Explore delight: the wave / high five take over one arm (the other keeps its stroke), blended by their amounts.
  const wv=Math.max(0,Math.min(1,s.wave??0)),fv=Math.max(0,Math.min(1,s.five??0));
  if(wv>0||fv>0){const q=ARM+4,swing=reduced?0:Math.sin((s.emoteT??0)*11),mixT=(i:number,v:number,k:number)=>{target[i]+=(v-target[i])*k;};
   mixT(q,-2.5,wv);mixT(q+1,.95+.35*swing,wv);mixT(q+2,0,wv);mixT(q+3,-.75,wv);
   mixT(q,-2.95,fv);mixT(q+1,.3,fv);mixT(q+2,0,fv);mixT(q+3,-.08,fv);
   target[H_X]+=(-.2)*Math.max(wv,fv);}
  // The surfacing head-shake on the everyday shapes too (a dive coming back up); the entry shape has its own.
  if(s.kind!=='entry'&&s.shake>0&&!reduced){const sh=s.shake*Math.sin(s.shake*40)*.3;target[H_Y]+=sh;target[H_Z]-=sh*.5;}
 };
 return {
  /** Apply the swim pose over the solved body. Call every rig update (also with `swim` undefined, so the fade-out runs). */
  apply(swim:SwimRigPose|undefined,dt:number,reduced:boolean,turn:number){
   const want=swim&&swim.w>0?Math.min(1,swim.w):0;
   if(want>0){
    if(!active){capture();active=true;}
    const k=reduced?1:1-Math.exp(-dt*SWIM_SETTLE);
    // The sculling clock is the poser's own (the water state's clock stands still with reduced motion; the sculling does not).
    tread=(tread+dt*TAU/TREAD_CYCLE*(reduced?TREAD_REDUCED:1))%TAU;
    roll+=((reduced?0:Math.max(-.35,Math.min(.35,-turn*.18)))-roll)*k;
    shape(swim!,reduced,roll);
    // A new shape (kind, Swim fast, entry style): restart the blend from wherever the body is now.
    const nk=KIND[swim!.kind]*8+(swim!.fast>.5?4:0)+ENTRY[swim!.entry];
    if(nk!==key){key=nk;for(let i=0;i<N;i++)offset[i]=held[i]-target[i];}
    for(let i=0;i<N;i++){offset[i]*=1-k;held[i]=target[i]+offset[i];}
    fade=1;write(want);
   }else if(active){
    fade=reduced?0:Math.max(0,fade-dt/SWIM_FADE);
    if(fade<=0){active=false;return;}
    write(fade*fade);
   }
  },
  get active(){return active;},
 };
}
