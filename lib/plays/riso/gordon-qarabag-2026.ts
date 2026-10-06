/** Anthony Gordon's run and finish — the first of his four first-half goals in Qarabağ 1–6 Newcastle United, UEFA Champions League
 * knockout play-off first leg, Wednesday 18 February 2026, Tofiq Bahramov Republican Stadium, Baku. An iconic-play riso film (RisoStory,
 * chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx). A reconstruction from WRITTEN accounts (the footage
 * itself was not reviewed). Shared kit: ./broadcast3d.ts.
 *
 * WHY THIS GOAL: the card's Top Play is "Four Goals in One Night". Of the four (3', a penalty, a rounded keeper after a defender's error,
 * a second penalty), the opener is the one whose build-up is described in the sources and it is the card's lesson exactly: a run behind
 * the defence, picked out, finished first time. The narration names the four-goal night as context only.
 *
 * SOURCES (read Sept 2026 with curl, cached in the build scratchpad kd-films/src/):
 *  - RTÉ / PA, "Gordon bags four goals as Newcastle demolish Qarabag", 18 Feb 2026: "Kochalski was picking the ball out of his net with less
 *    than three minutes gone when central defender Dan Burn surged upfield to pick out Gordon's run and the striker shot right-footed across
 *    the keeper to get his side off to the perfect start"; the Tofiq Bahramov Republican Stadium; all four of Gordon's goals before half-time.
 *  - ESPN match report (same PA text), gameId 401858736.
 *  - Sky Sports, "Qarabag 1-6 Newcastle: Anthony Gordon scores four in first half ...": "Gordon finished well after Dan Burn had surged
 *    forward and played him in"; "scoring in the third minute, netting two penalties and rounding goalkeeper Mateusz Kochalski".
 * CONFIRMED: date, venue, the 3rd minute, 0–0 → 1–0; centre-back Dan Burn SURGED FORWARD and PICKED OUT / PLAYED IN Gordon's RUN; Gordon
 *  shot RIGHT-FOOTED ACROSS the keeper; Gordon scored four in the first half; Newcastle won 6–1.
 * INFERRED (illustrative, never claimed in the narration beyond the words above): which channel Gordon ran in (drawn: the inside-left, the
 *  card's "left" side), every position, run and timing, the pass's weight, whether he took a touch (drawn: none, first time), where the shot
 *  went (drawn: low into the far corner — "across the keeper"), Kochalski's dive; KITS ARE NOT VERIFIED (drawn: Qarabağ black shirts,
 *  black shorts; Newcastle white shirts, navy shorts; the keeper in yellow); Burn's height (drawn 1.98 m, well known) and left foot; the
 *  night sky; the crowd; which end; camera placements. Numbers: none drawn.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the bowl → Burn charging out of defence → the
 * pass into the run → the shot → the net → Gordon wheels away); ch2 = a slow replay from HIGH BEHIND BURN down the pitch: Gordon's run in
 * behind the back line, a line marking the defenders, the pass landing in his path; ch3 = a slow replay LOW BEHIND THE GOAL: the right-foot
 * strike comes across Kochalski into the far corner; ch4 = the lesson: the run's arrow behind the defensive line, lit, and the four-goal
 * night as four ticks. Composed on the FULL sheet. Right-handed world: Newcastle attack +x, +z = Newcastle's right, so the inside-left is
 * z < 0. Poses on twos, cameras on ones; all randomness seeded. */
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,dribble,keeperSet,keeperDive,celebrate,blendPose,STRIKE_CONTACT,type AthleteStyle,type V3,type Build} from './athlete';
import {type NarrationTiming} from './timing';
import timingJson from '../../../public/plays/narration/gordon-qarabag-2026/timing.json';
import {Y,R,B,K,SPEC,mix3,d3,yawTo,nrm2,lerpAng,buildChapters,mono,frame,toCam,scr,pr,kAt,stadium,ground,makeTracks,loco,faceYaw,win,DEJECT,
 drawScene,plan,cam3,arrow3,groundRing,trail,BALL_R,SKIN_L,SKIN_M,SKIN_D,type Fig,type State,type Cam,type Stadium,type Shot} from './broadcast3d';
import {beats,shotAt,directShot,near,type Beats,type Subject,type Keep,type ReframeOpts,type View as DView} from './director';

// ---------------------------------------------------------------- narration + timing
const SCRIPT=[
 {label:'Baku, 2026',text:'Baku, 2026, the Champions League play-offs. Qarabağ against Newcastle, not even three minutes in. Dan Burn charges forward and spots Anthony Gordon running. Gordon shoots across the keeper... goal!',tail:2.2,
  cues:['Baku','Champions League','Qarabağ against Newcastle','three minutes','Dan Burn','charges forward','Anthony Gordon','shoots across','goal']},
 {label:'Watch the run',text:'Watch the run again. Gordon sprints in behind the defenders, and the pass lands right in his path.',tail:1.6,
  cues:['Watch the run','sprints in behind','defenders','the pass lands']},
 {label:'Across the keeper',text:'One strike with his right foot, across the keeper and into the far corner. It is the first of his four goals that night!',tail:2,
  cues:['One strike','right foot','across the keeper','far corner','first of his four']},
 {label:'Keep running',text:'Keep making runs behind the defence. One good run can turn into many goals.',tail:2.2,
  cues:['Keep making runs','behind the defence','One good run','many goals']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const {CHAPTERS,CUE,SECS}=buildChapters('gordon',SCRIPT,VOICE);

// ---------------------------------------------------------------- the cast (kits NOT verified, see header)
const qar=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.92],shorts:[K,.92],socks:[K,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',hairStyle:'short',build:{height:1.84,bulk:1.02},...o});
const nuf=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.9],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],hairStyle:'short',build:{height:1.8,bulk:1},...o});
const B_GOR:Build={height:1.83,bulk:.92},B_BURN:Build={height:1.98,bulk:1.1},B_GK:Build={height:1.9,bulk:1};
const GOR_ST=nuf({hair:[Y,.45],build:B_GOR,seed:10});
const BURN_ST=nuf({hair:[Y,.35],hairStyle:'balding',build:B_BURN,seed:33});
const GK_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:B_GK,seed:1};

// ---------------------------------------------------------------- the move on one clock τ (τ = 0 is Gordon's shot)
const T_PASS=-1.55,TS=.5;
/** Burn carries it out of defence up the left-centre; Gordon's diagonal run starts level with the Qarabağ back line and goes in behind */
const LINE_X=-24;// the back line when the pass is played (illustrative)
const SHOT_AT:[number,number]=[-12.4,-6.6];
const GOAL_PT:V3=[0,.35,2.7],NET_HIT:V3=[1.8,.3,2.8],REST:V3=[1.3,BALL_R,2.7];
const YAW_S=yawTo(GOAL_PT[0]-SHOT_AT[0],GOAL_PT[2]-SHOT_AT[1]);
const SHOT_BALL:V3=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.9}),B_GOR,{x:SHOT_AT[0],z:SHOT_AT[1],yaw:YAW_S});return[sk.rToe[0]+.04,BALL_R,sk.rToe[2]];})();
const PASS0:V3=[-37.2,BALL_R,-5.2];
/** Kochalski comes off his line and dives to his LEFT (+z for a keeper facing −x), too late */
const GK_AT:[number,number]=[-2.2,-1.6],T_DIVE=.05;
type Role='gor'|'burn'|'gk'|'qar'|'nuf';
type Actor={role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-8,T1=12;
const ACTORS:Actor[]=[
 {role:'gor',hero:true,style:GOR_ST,keys:[[T0,-28,-12],[-4,-25.5,-11.6],[T_PASS,-22.6,-9.8],[-.6,-15.6,-7.6],[-.12,...SHOT_AT],[.08,SHOT_AT[0]+.3,SHOT_AT[1]+.05],[1.4,-9,-9],[4,-8,-18],[T1,-9,-27]]},
 {role:'burn',hero:true,style:BURN_ST,keys:[[T0,-58,-9],[-5,-50,-7.6],[-2.6,-41.5,-6],[T_PASS,PASS0[0]-.8,PASS0[2]-.2],[0,-33,-4.6],[T1,-24,-8]]},
 {role:'gk',hero:true,style:GK_ST,keys:[[T0,-1,0],[T_PASS,-1.2,-.8],[-.4,-2,-1.4],[0,...GK_AT],[T1,...GK_AT]]},
 {role:'qar',style:qar({seed:31,build:{height:1.9}}),keys:[[T0,-30,-6],[T_PASS,LINE_X,-6.5],[-.6,-17,-5.2],[0,-14.2,-4.8],[T1,-12,-4]]},// the centre-backs turning to chase
 {role:'qar',style:qar({seed:32,skin:SKIN_M}),keys:[[T0,-31,3],[T_PASS,LINE_X-.4,2.2],[-.6,-18,.4],[0,-15,-.6],[T1,-13,-1]]},
 {role:'qar',style:qar({seed:33}),keys:[[T0,-29,-16],[T_PASS,LINE_X+.3,-14],[-.6,-18.5,-11.8],[0,-16,-10.6],[T1,-14,-10]]},
 {role:'qar',style:qar({seed:34,skin:SKIN_D}),keys:[[T0,-31,13],[T_PASS,LINE_X-.6,11],[0,-18,7],[T1,-16,6]]},
 {role:'qar',style:qar({seed:35}),keys:[[T0,-40,-2],[T_PASS,-35.5,-3],[0,-30,-4],[T1,-26,-4]]},// the midfielder Burn ran past
 {role:'nuf',style:nuf({seed:61,skin:SKIN_D}),keys:[[T0,-30,8],[T_PASS,-26,6],[0,-17,3],[1.5,-13,-2],[T1,-11,-18]]},
 {role:'nuf',style:nuf({seed:62}),keys:[[T0,-36,16],[T_PASS,-30,14],[0,-22,10],[T1,-14,-14]]},
];
const GOR=0,BURN=1,GK=2;
const TR=makeTracks(ACTORS.map(a=>a.keys),T0,T1);

// ---------------------------------------------------------------- the ball: Burn's carry, the pass into the run, the first-time strike, the net
const feet=(k:number,tau:number,ahead=.6):V3=>{const[x,z]=TR.posOf(k,tau),v=TR.velOf(k,tau),n=nrm2(v[0],v[1]),sp=Math.hypot(v[0],v[1]);return[x+n[0]*ahead*clamp(sp/2),BALL_R,z+n[1]*ahead*clamp(sp/2)];};
function ballAt(tau:number):V3{
 if(tau<T_PASS-.3)return feet(BURN,tau);
 if(tau<T_PASS)return mix3(feet(BURN,tau),PASS0,sm(T_PASS-.3,T_PASS,tau));
 if(tau<0){const u=(tau-T_PASS)/(0-T_PASS),p=mix3(PASS0,SHOT_BALL,1-Math.pow(1-u,1.35));p[1]=BALL_R+.5*Math.sin(Math.PI*u);return p;}
 if(tau<TS)return mix3(SHOT_BALL,GOAL_PT,easeOut(tau/TS));
 if(tau<TS+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TS)/.14));
 const u=clamp((tau-TS-.14)/.5);return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u)),lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau*TAU*2.2;
const bulgeAt=(tau:number)=>tau<TS+.08?0:.8*Math.exp(-(tau-TS-.08)*2.4)*(1+.3*Math.sin((tau-TS)*14));

// ---------------------------------------------------------------- poses
const kick=(pose:ReturnType<typeof loco>,tau:number,t0:number,foot:'l'|'r',power:number,dur=.85)=>{const w=win(tau,t0-.45,t0+.5,.15);return w>0?blendPose(pose,strike(clamp((tau-t0)/dur+STRIKE_CONTACT),{foot,power}),w):pose;};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=TR.posOf(k,tau),b=ballAt(tau);let pose=loco(TR,k,tau),yaw=faceYaw(TR,k,tau,b);
 switch(a.role){
  case 'gor':{pose=kick(pose,tau,0,'r',.9,.85);if(tau>-.5&&tau<.4)yaw=lerpAng(yaw,YAW_S,win(tau,-.5,.4,.15));
   if(tau>1)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4.2,{kind:'run'}),sm(1,1.7,tau));break;}
  case 'burn':{if(tau<T_PASS-.3)pose=blendPose(pose,dribble(TR.distOf(k,tau)/2.4,{foot:'l',speed:.9}),.55);pose=kick(pose,tau,T_PASS,'l',.55,.8);
   if(Math.abs(tau-T_PASS)<.5)yaw=lerpAng(yaw,yawTo(SHOT_BALL[0]-PASS0[0],SHOT_BALL[2]-PASS0[2]),win(tau,T_PASS-.5,T_PASS+.5,.15));
   if(tau>TS+.6)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4,{kind:'arms'}),sm(TS+.6,TS+1.2,tau)*.8);break;}
  case 'gk':{pose=keeperSet(tau*1.4);if(tau>T_DIVE-.12)pose=blendPose(pose,keeperDive(clamp((tau-T_DIVE)/.95),{side:'l',height:.12}),sm(T_DIVE-.12,T_DIVE,tau));
   yaw=faceYaw(TR,k,Math.min(tau,-.1),ballAt(Math.min(tau,-.1)));if(tau>-.1)yaw=lerpAng(yaw,Math.PI,sm(-.1,.1,tau));if(tau>TS+1.4)pose=blendPose(pose,DEJECT,sm(TS+1.6,TS+2.4,tau)*.5);break;}
  case 'qar':if(tau>TS+.5)pose=blendPose(pose,DEJECT,sm(TS+.8,TS+1.8,tau)*.8);break;
  case 'nuf':if(tau>TS+.3)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4.2,{kind:'arms'}),sm(TS+.4,TS+1,tau)*.7);break;
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((_,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k],st=stateOf(k,tau),hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===GOR&&Math.abs(tau)<.3)||(k===BURN&&Math.abs(tau-T_PASS)<.3)||(k===GK&&tau>T_DIVE&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}
/** Baku at night: a packed home crowd in black and white, a pocket of travelling fans */
const ARENA=(roar=0,flash=0):Stadium=>({sky:'night',seats:[[B,.3],[K,.3]],crowd:[['paper',.38],[K,.42],[R,.1],[B,.1]],roar,flash});
const at=(k:number,tau:number,y=1)=>TR.at(k,tau,y);

// ---------------------------------------------------------------- the shared director (lib/plays/riso/director.ts), camera math only
/** the window in the camera's screen units (frame() → {w:s.W,h:s.H}) and the kit's lens size (broadcast3d LENS), set in frameD() */
let DV:DView={w:1620,h:1080},LENSD=1;
const frameD=(s:Sheet)=>{frame(s);DV={w:s.W,h:s.H};LENSD=Math.pow(Math.min(1,s.W/1620),.6);};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** plan() through the director: the authored Shot (same easing as the kit's plan()), then moved toward the beat's framing */
function planD(t:number,steps:[number,number,(t:number)=>Shot][],B:Beats,subj:Subject,o:ReframeOpts={}):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}
 const r=directShot(cur,subj,shotAt(t,B),DV,1080*LENSD,o);return cam3(r.P,r.T,r.fov);}
const g3=(k:number,tau:number):V3=>{const[x,z]=TR.posOf(k,tau);return[x,0,z];};
/** a player's feet and head as soft keep points of weight w (0 = free, 1 = hard) */
const body=(k:number,tau:number,w:number):Keep[]=>{if(w<=.01)return[];const g=g3(k,tau);return[{P:g,w},{P:[g[0],1.9,g[2]],w}];};
const OTHERS=[3,4,5,6,7,8,9];

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
function tau1(t:number){const tG=CUE(0,'goal')-.1;return Math.max(T0+.3,t-tG+TS);}
const P1:V3=[-30,24,-72];
/** Director beats, ch1: a short establishing wide of the Baku bowl tilting down to the pitch; follow Burn as he charges out of defence
 * with the ball; as he "spots Anthony Gordon" pull out to reveal Gordon's run in behind, so Burn (the passer), the ball and Gordon are
 * all in one frame for the pass — the pass is the lesson; swing round behind Gordon's shoulder (az −30°) and push in low on the
 * first-time shot with Kochalski and the goal mouth held in frame (the shot goes ACROSS him); stay on Gordon as he wheels away. */
const T_SHOT1=CUE(0,'goal')-.1-TS;// the ch1 time of the strike (tau1 = 0)
const B1=beats([[0,'wide'],[.7,'follow'],[T_SHOT1+T_PASS-1.35,{from:'space',size:.22,az:-30}],[T_SHOT1-.9,{from:'tight',az:-30}],[CUE(0,'goal')+.3,{from:'reaction',az:-30}]]);
/** a log ramp 0 → 1 for a soft keep's weight (the framing it forces scales ~ with w, so this pulls out at an even zoom rate) */
const logRamp=(r:number)=>r>0?.1*Math.pow(10,r):0;
function subj1(tau:number):Subject{
 // the aim: Burn → the middle of Burn and Gordon (the pass: both held in frame) → Gordon once the ball is on its way to him
 const a=sm(T_PASS-1.35,T_PASS-.2,tau,easeInOutSine),b=sm(T_PASS+.2,T_PASS+1.1,tau,easeInOutSine),bu=g3(BURN,tau),go=g3(GOR,tau),h=mix3(mix3(bu,mix3(bu,go,.5),a),go,b);
 const ramp=logRamp(clamp((tau-T_PASS+1.35)/1.15)),gk=logRamp(clamp((tau+1)/.8))*logRamp(1-clamp((tau-TS-.3)/.9)),nw=1-sm(-.3,.1,tau);
 return{hero:h,ball:null,keep:[ballAt(tau),...body(GOR,tau,ramp),...body(BURN,tau,ramp*logRamp(1-clamp((tau-T_PASS-.15)/.75))),...body(GK,tau,gk),
  ...(gk>.01?[{P:GOAL_PT,w:gk},{P:[0,0,3.66] as V3,w:gk}]:[]),...near(h,OTHERS.map(k=>g3(k,tau)),3,7).map(k=>({...(k as {P:V3;w:number}),w:(k as {w:number}).w*nw}))]};
}
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return planD(t,[
  [0,0,()=>({P:P1,T:[-38,10,30],fov:42})],
  [.3,1,()=>({P:P1,T:mix3(b,[-30,1,-4],.5),fov:30})],// tilt down from the bowl onto the pitch (lets the director's follow pick Burn up)
  [CUE(0,'Qarabağ against')-.3,1.3,()=>({P:P1,T:mix3(b,[-30,1,-4],.5),fov:22})],
  [CUE(0,'Dan Burn')-.4,.9,()=>({P:P1,T:mix3(b,at(BURN,tau,1),.4),fov:12})],
  [CUE(0,'Anthony Gordon')-.3,.9,()=>({P:P1,T:mix3(b,at(GOR,tau,1),.45),fov:14})],
  [CUE(0,'shoots')-.3,.8,()=>({P:P1,T:mix3(b,[-5,1,-2],.4),fov:12})],
  [CUE(0,'goal')+.6,1.4,()=>({P:P1,T:mix3(at(GOR,tau,1.1),[-8,1,-6],.3),fov:13})],
 ],B1,subj1(tau));
}
const ch1:Scene={
 draw(s,t){
  frameD(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tN=CUE(0,'goal')-.1;
  stadium(s,c,t,[0,1,3],ARENA(sm(tN,tN+.5,t),sm(tN,tN+.4,t)*(1-sm(tN+2.4,tN+3,t))));
  ground(s,c);
  play(s,c,tau,tp,{min:14,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'goal')-.2;},
};
// ---------------------------------------------------------------- 2 · slow replay from high behind Burn: the run in behind, the pass into his path
const tau2=(t:number)=>key(t,mono([[0,-3.4],[CUE(1,'sprints'),-2.4],[CUE(1,'defenders'),T_PASS-.1],[CUE(1,'the pass lands'),-.7],[SECS(1)-.2,-.05]]),linear);
const E2:V3=[-60,11,-10];// (was [-54,9,-9]: Burn, close below the lens, was cut off by the bottom edge)
/** Director beats, ch2: the passer's view — in over Burn's shoulder as he carries it, with Gordon's run and the back line beyond him
 * held in frame (Gordon is a hard keep: the run is the lesson); ease out a little as the pass is played on "defenders" (the followed
 * player hands over Burn → Gordon over the pass); push in on Gordon as the pass lands in his path (ball kept). */
const B2=beats([[0,{from:'follow',size:.4}],[CUE(1,'defenders')-.4,{from:'space',size:.34}],[CUE(1,'the pass lands')-.4,{from:'tight',size:.45}]]);
function subj2(tau:number):Subject{const u=sm(T_PASS-.2,T_PASS+.6,tau,easeInOutSine),h=mix3(g3(BURN,tau),g3(GOR,tau),u);
 return{hero:h,ball:ballAt(tau),keep:[...body(GOR,tau,1),...body(BURN,tau,logRamp(1-clamp((tau-T_PASS-.1)/1.1))),...near(h,[3,4,5,6].map(k=>g3(k,tau)),3,6)]};}
function cam2(t:number):Cam{
 const tau=tau2(t),g=at(GOR,tau,.8);
 return planD(t,[
  [0,0,()=>({P:E2,T:mix3(ballAt(tau),g,.5),fov:30})],
  [CUE(1,'sprints')-.3,.9,()=>({P:E2,T:mix3(g,[LINE_X,.5,-6],.4),fov:22})],
  [CUE(1,'the pass')-.3,.9,()=>({P:E2,T:mix3(g,ballAt(tau),.5),fov:20})],
 ],B2,subj2(tau),{recenter:.6});
}
const ch2:Scene={
 draw(s,t){
  frameD(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[1],ARENA());
  ground(s,c);
  // "defenders": the back line as a dashed red rule across the pitch; "behind": Gordon's ring once he is past it
  const dl=sm(CUE(1,'defenders')-.2,CUE(1,'defenders')+.2,t)*(1-sm(-.4,-.1,tau));
  if(dl>0){const lx=([3,4,5,6].reduce((m,k)=>m+TR.posOf(k,tau)[0],0))/4,q=[pr(c,[lx,.02,-20]),pr(c,[lx,.02,14])];if(q[0]&&q[1]){const gaps:[number,number][]=[];for(let i=0;i<12;i++)gaps.push([(i+.62)/12,(i+.97)/12]);const d=ribbon([q[0],q[1]],Math.max(5,kAt(c,[LINE_X,0,-4])*.12),{seed:7,taper:0,wobble:.4,gaps});s.knockout(d,.9*dl);s.fill(R,d,.95*dl);}}
  groundRing(s,c,at(GOR,tau,0),.8,Y,sm(CUE(1,'sprints')-.3,CUE(1,'sprints'),t),.14);
  trail(s,c,ballAt,Math.max(T_PASS,tau-1.2),tau,tau>T_PASS?1:0);
  play(s,c,tau,tp,{smear:true,min:11});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'the pass lands')+.2;},
};
// ---------------------------------------------------------------- 3 · slow replay low behind the goal: the right-foot strike across the keeper
const tau3=(t:number)=>key(t,mono([[0,-1],[CUE(2,'right foot'),-.05],[CUE(2,'across the keeper'),TS*.45],[CUE(2,'far corner'),TS+.1],[CUE(2,'first of his four'),TS+1.4],[SECS(2),TS+3.2]]),linear);
const E3:V3=[5.5,2.3,-3.2];
function cam3v(t:number):Cam{
 const tau=tau3(t),g=at(GOR,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(g,[-2,1,0],.3),fov:30})],
  [CUE(2,'right foot')-.3,.8,()=>({P:E3,T:mix3(g,SHOT_BALL,.4),fov:22})],
  [CUE(2,'across')-.2,.8,()=>({P:E3,T:mix3(SHOT_BALL,GOAL_PT,.6),fov:34})],
  [CUE(2,'first of his four')-.5,1.3,()=>({P:[4,3,-6],T:g,fov:24})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frameD(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tF=CUE(2,'first of his four');
  stadium(s,c,t,[3],ARENA(sm(TS,TS+.4,tau),Math.max(sm(TS,TS+.3,tau)*(1-sm(TS+1.4,TS+2,tau)),sm(tF-.1,tF+.3,t))));
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  const hf=sm(-.05,.05,tau)*(1-sm(TS+.3,TS+.8,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=14;i++){const p=pr(c,ballAt(lerp(0,Math.min(tau,TS),i/14)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,GOAL_PT)*.1);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=tau/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(GOR,tau3(twos(t))),sk=solve(p.pose,B_GOR,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'across the keeper')+.2;},
};
// ---------------------------------------------------------------- 4 · the lesson: the run behind the line, and four goals from runs like it
const tau4=(t:number)=>key(t,mono([[0,-4],[CUE(3,'behind the defence'),T_PASS],[CUE(3,'One good run'),-.2],[CUE(3,'many goals'),TS+.2],[SECS(3),TS+1.2]]),linear);
/** Director beats, ch4 (lesson): the authored wide while the red line draws on; then swing round behind the run (az −30°, so the arrow
 * runs away from us) and move in on it as it bends in behind the line. The aim is the middle of the run, and the whole arrow (its tail
 * behind the line, the shot spot), Gordon and — on "many goals" — the four balls over the goal are hard keeps, so nothing is cut. */
const M4:V3=(()=>{const[x,z]=TR.posOf(GOR,-4);return[(x+SHOT_AT[0])/2,0,(z+SHOT_AT[1])/2];})();
const B4=beats([[0,'wide'],[CUE(3,'behind')-.3,{from:'lesson',size:.3,az:-30}]]);
function subj4(t:number):Subject{const tau=tau4(t),tM=CUE(3,'many goals'),m=logRamp(clamp((t-tM+.9)/.8));
 return{hero:M4,ball:null,keep:[g3(GOR,-4),[SHOT_AT[0],0,SHOT_AT[1]] as V3,...body(GOR,tau,1),...(m>.01?[{P:[.5,3.6,-3.4] as V3,w:m},{P:[.5,3.6,3.4] as V3,w:m}]:[])]};}
function cam4v(t:number):Cam{
 return planD(t,[
  [0,0,()=>({P:[-40,14,-30],T:[-22,.5,-7],fov:30})],
  [CUE(3,'behind')-.2,1,()=>({P:[-36,11,-27],T:[-18,.5,-7],fov:26})],
  [CUE(3,'One good')-.2,.9,()=>({P:[-32,9,-24],T:[-10,.5,-4],fov:28})],
 ],B4,subj4(t));
}
const ch4:Scene={
 draw(s,t){
  frameD(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tK=CUE(3,'Keep making'),tB=CUE(3,'behind the defence'),tO=CUE(3,'One good run'),tM=CUE(3,'many goals');
  stadium(s,c,t,[0,1],ARENA(.3+.3*sm(tM,tM+.6,t)));
  ground(s,c);
  // the defensive line (red), and the run's arrow bending in behind it (yellow), drawn on as he runs it
  const ln=sm(tK-.1,tK+.4,t);if(ln>0){const q=[pr(c,[LINE_X,.02,-20]),pr(c,[LINE_X,.02,14])];if(q[0]&&q[1]){const d=ribbon([q[0],q[1]],Math.max(5,kAt(c,[LINE_X,0,-4])*.1),{seed:7,taper:0,wobble:.4});s.knockout(d,.9*ln);s.fill(R,d,.95*ln);}}
  const ra=sm(tB-.2,tO,t,easeInOutSine);if(ra>0){const q:V3[]=[];for(let i=0;i<=12;i++){const[x,z]=TR.posOf(GOR,lerp(-4,-.12,ra*i/12));q.push([x,.04,z]);}arrow3(s,c,q,Math.max(8,kAt(c,[-18,0,-8])*.08),Y,.95);}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[GOR,BURN,GK,3,4,5]});
  if(r.ball&&tau>=0&&tau<.25)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(60,r.ball.r*4.5),{n:9,seed:29,g:easeOutBack(clamp(tau/.1))*(1-clamp((tau-.12)/.12)),width:10});
  // "many goals": four balls pop up in a row above the goal — his four that night
  const mg=sm(tM-.1,tM+1.2,t);if(mg>0)for(let i=0;i<4;i++){const u=easeOutBack(clamp(mg*4-i)),p=pr(c,[.5,3.6,-3+i*2]);if(p&&u>0)footballPanels(s,p[0],p[1],Math.max(14,kAt(c,[.5,3.6,0])*.3)*u,{rot:i,key:K,shadow:B,seed:5+i});}
 },
 get still(){return CUE(3,'One good run')+.4;},
};

const film:RisoStory={
 id:'gordon-qarabag-2026',format:'11v11',title:"Gordon's run in Baku",
 theme:'Keep making runs behind the defence: one good run can turn into many goals',
 ageNote:'Qarabağ 1–6 Newcastle United, Champions League play-off, Baku, 18 February 2026 — the first of Gordon’s four goals. For players of every age.',
 spec:SPEC,
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a yellow run-arrow darts past a red line and a ball meets it. Reduced motion: the arrow. */
 touch(s,x,y,age,seed){
  const r=rng(seed),g=age<=0?1:easeOut(clamp(age/.4));
  const ln=ribbon([[x,y-60],[x,y+60]],10,{seed,taper:0,wobble:.5});s.knockout(ln,.9);s.fill(R,ln,.95);
  const a=ribbon([[x-90,y+30],[x-90+180*g,y+30-50*g]],12,{seed:seed+1,taper:.3,wobble:.5});s.knockout(a);s.fill(Y,a,.95);
  if(age>0&&age<.8)footballPanels(s,x-120+220*easeOut(clamp(age/.6)),y-10,22,{rot:age*12+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Checked by tests/play-film-gordon-qarabag-2026.cjs (pitch metres; the attacked goal line x = 0, +z = Newcastle's right). */
export const FACTS={SHOT_BALL,GOAL_PT,TS,T_PASS,PASS0,LINE_X,ballAt,shotFoot:'r' as const,
 gordonAt:(tau:number)=>TR.posOf(GOR,tau),burnAt:(tau:number)=>TR.posOf(BURN,tau),defAt:(k:number,tau:number)=>TR.posOf(k,tau),
 gordonContact:()=>{const st=stateOf(GOR,0),sk=solve(st.pose,B_GOR,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 keeperAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_GK,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};},d3};
