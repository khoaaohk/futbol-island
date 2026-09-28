/** Ivan Rakitić's early goal — Juventus 1–3 Barcelona, UEFA Champions League final, Saturday 6 June 2015, Olympiastadion, Berlin.
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx). A reconstruction
 * of the goal from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print. Shared kit: ./broadcast3d.ts.
 *
 * SOURCES (read Sept 2026 with curl, cached in the build scratchpad kd-films/src/):
 *  - The Guardian, Scott Murray, "Juventus v Barcelona: Champions League final 2015 – as it happened", 6 June 2015: "GOAL! Juventus 0-1
 *    Barcelona (Rakitic 4) ... Jordi Alba is sent skittering down the left. He slips it inside for Neymar, in a little space on the left-hand
 *    corner of the Juve box. Neymar flicks further inside for Iniesta, who slides the ball across to Rakitic, on the penalty spot. Juve have
 *    been pulled to pieces, and Rakitic sidefoots into the net!"; photo caption: "Andres Iniesta dances through the Juve area before pulling
 *    the ball back to Ivan Rakitic".
 *  - Wikipedia, "2015 UEFA Champions League final" (raw wikitext; kit boxes and line-ups cite UEFA's tactical line-ups): 6 June 2015,
 *    Olympiastadion Berlin, 70,442, referee Cüneyt Çakır; "two minutes later, Jordi Alba made a run on Barcelona's left, passing to Neymar
 *    and then Andrés Iniesta who set up Ivan Rakitić to score the first goal from close range"; Barcelona's fastest goal in a final; kits:
 *    Juventus home (black-and-white stripes), white shorts, white socks; Barcelona home (blue-and-garnet stripes), navy shorts, navy socks.
 * CONFIRMED: 4th minute, 0–0 → 1–0; the chain Alba (down the LEFT) → Neymar (left-hand corner of the box) → Iniesta (inside, into the area)
 *  → the ball slid ACROSS to Rakitić ON THE PENALTY SPOT → Rakitić SIDEFOOTS it into the net; kits as above; Barcelona won 3–1.
 * INFERRED (illustrative, never claimed in the narration): every position, run, pass speed and timing; Rakitić's foot (drawn RIGHT, his
 *  stronger foot) and that he finished first time; where in the net it went (drawn low, just right of centre); Buffon's keeper kit (printed
 *  yellow) and movement; the other players' positions; which end and which side the main camera was on; the dusk sky (20:45 kick-off); the
 *  Olympiastadion's blue running track and seat colours; crowd colours; camera placements. Numbers: Rakitić 4, Iniesta 8, Neymar 11, Alba 18.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME following the move down the near (left) side,
 * into the box, the finish and the celebration; ch2 = a slow replay from HIGH BEHIND THE GOAL: Neymar's flick, Iniesta's dance and the ball
 * slid across; ch3 = a slow replay LOW BEHIND RAKITIĆ as he arrives on the spot and sidefoots it past Buffon; ch4 = the lesson from the edge
 * of the box: the arrival timed to the pass (lit footprints + a meeting ring), a defender's blocking leg arriving too late, the quick finish.
 * Composed on the FULL sheet. Handedness: right-handed world, Barcelona attack +x, +z = Barcelona's RIGHT, so the left wing is −z. Poses on
 * twos, cameras on ones; all randomness seeded. */
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,polyPath,ribbon,easeOut,easeIO,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,dribble,keeperSet,keeperDive,celebrate,lunge,blendPose,STRIKE_CONTACT,type AthleteStyle,type V3,type Build} from './athlete';
import {type NarrationTiming} from './timing';
import timingJson from '../../../public/plays/narration/rakitic-final-2015/timing.json';
import {Y,R,B,K,SPEC,mix3,d3,yawTo,nrm2,lerpAng,buildChapters,mono,frame,toCam,scr,pr,kAt,polyP,stadium,ground,makeTracks,loco,faceYaw,win,DEJECT,
 drawScene,plan,arrow3,groundRing,trail,BALL_R,SKIN_L,SKIN_M,SKIN_D,type Fig,type State,type Cam,type Stadium} from './broadcast3d';

// ---------------------------------------------------------------- narration + timing
const SCRIPT=[
 {label:'Berlin, 2015',text:'Berlin, 2015, the Champions League final. Barcelona against Juventus, just four minutes in. Jordi Alba races down the left. Neymar, then Andrés Iniesta... Ivan Rakitić sidefoots it in!',tail:2.2,
  cues:['Berlin','Champions League final','Barcelona against Juventus','four minutes','Jordi Alba','races','Neymar','Andrés Iniesta','Ivan Rakitić','sidefoots it in']},
 {label:'Watch it again',text:'Watch again. Neymar flicks it inside. Iniesta dances into the box and slides it across.',tail:1.6,
  cues:['Watch again','Neymar flicks','Iniesta dances','slides it across']},
 {label:'Right on time',text:'Rakitić arrives on the penalty spot at just the right moment. A calm sidefoot, and it is in! Barcelona lead, one–nil.',tail:2,
  cues:['Rakitić arrives','penalty spot','right moment','calm sidefoot','Barcelona lead']},
 {label:'Arrive and finish',text:'Arrive in the box at the right moment. Then finish fast, before a defender can block your shot.',tail:2,
  cues:['Arrive in the box','right moment','finish fast','before a defender','block']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const {CHAPTERS,CUE,SECS}=buildChapters('rakitic',SCRIPT,VOICE);

// ---------------------------------------------------------------- the cast (kits sourced: Barça blue-garnet stripes / navy / navy; Juve black-white stripes / white / white)
const bar=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.9],pattern:'stripes',patternInk:[B,.95],shorts:[K,.92],socks:[K,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:[Y,.8],numberInk:'paper',hairStyle:'short',build:{height:1.78,bulk:.98},...o});
const juv=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:[K,.95],shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],hairStyle:'short',build:{height:1.85,bulk:1.02},...o});
const B_RAK:Build={height:1.84,bulk:.98},B_INI:Build={height:1.71,bulk:.9},B_NEY:Build={height:1.75,bulk:.9},B_ALB:Build={height:1.7,bulk:.92},B_BUF:Build={height:1.92,bulk:1.04};
const RAK_ST=bar({number:4,hair:[Y,.55],build:B_RAK,seed:4});
const INI_ST=bar({number:8,hair:[K,.6],hairStyle:'balding',build:B_INI,seed:8});
const NEY_ST=bar({number:11,skin:SKIN_M,hair:[Y,.5],build:B_NEY,seed:11});
const ALB_ST=bar({number:18,hair:[K,.9],build:B_ALB,seed:18});
const BUF_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:B_BUF,seed:1};

// ---------------------------------------------------------------- the move on one clock τ (τ = 0 is Rakitić's sidefoot)
/** passes: Alba → Neymar, Neymar's flick → Iniesta, Iniesta slides it across → Rakitić */
const T_ALB=-4.5,T_NEY=-3.55,T_FLK=-3.35,T_INI=-2.8,T_SLD=-.7,TS=.42;
/** meeting points (illustrative; "the left-hand corner of the Juve box", "on the penalty spot") */
const P_NEY:[number,number]=[-17.3,-18.6],P_INI0:[number,number]=[-14.6,-12.4],P_INI1:[number,number]=[-8.2,-8.6];
/** the finish: aimed low, just right of centre */
const GOAL_PT:V3=[0,.3,1.7],NET_HIT:V3=[1.8,.28,1.9],REST:V3=[1.3,BALL_R,1.8];
const YAW_R=yawTo(GOAL_PT[0]+11,GOAL_PT[2]);
/** Rakitić's pelvis at contact so his RIGHT instep meets the ball on the penalty spot (x −11, z 0) */
const SPOT:V3=[-11,BALL_R,.25];
const PCR:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.45}),B_RAK,{x:0,z:0,yaw:YAW_R});return[SPOT[0]-sk.rToe[0]-.05,SPOT[2]-sk.rToe[2]];})();
type Role='rak'|'ini'|'ney'|'alb'|'gk'|'bar'|'juv'|'blk';
type Actor={role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-8,T1=12;
const toRak=(x:number,z:number,k:number):number[][]=>[[1.2+k*.25,x,z],[4+k*.3,lerp(x,-6,.5),lerp(z,-20,.5)],[T1,lerp(x,-4,.7),lerp(z,-27,.7)]];
const ACTORS:Actor[]=[
 {role:'rak',hero:true,style:RAK_ST,keys:[[T0,-30,-3],[-4,-25,-2.4],[-2,-18.5,-.9],[-.7,-13.6,-.1],[-.08,...PCR],[.5,PCR[0]+.6,PCR[1]-.2],[2,-8.6,-4.5],[5,-5.5,-15],[T1,-3.5,-26]]},
 {role:'ini',hero:true,style:INI_ST,keys:[[T0,-24,-9],[-4.5,-19,-10.5],[T_INI,...P_INI0],[-1.8,-11.8,-11.2],[-1.1,-9.6,-9.4],[T_SLD,...P_INI1],[0,-7.7,-8],[1.4,-7,-9],...toRak(-7,-9,0).slice(1)]},
 {role:'ney',hero:true,style:NEY_ST,keys:[[T0,-27,-24],[-5,-22,-21],[T_NEY,...P_NEY],[T_FLK,P_NEY[0]+.2,P_NEY[1]+.2],[-2.2,-15.6,-16.4],[0,-12.8,-13.6],...toRak(-12,-13,1).slice(0)]},
 {role:'alb',hero:true,style:ALB_ST,keys:[[T0,-43,-29],[-6,-36,-29.2],[T_ALB,-28,-27.6],[-3.5,-24.5,-26.6],[0,-19,-24],[T1,-12,-24]]},
 {role:'gk',hero:true,style:BUF_ST,keys:[[T0,-1.2,.2],[T_INI,-1.5,-1.4],[T_SLD,-2.4,-2.2],[-.25,-2,-.8],[T1,-1.6,-.4]]},
 {role:'blk',style:juv({seed:31,build:{height:1.9}}),keys:[[T0,-16,-2],[-2,-13.5,-3.6],[T_SLD,-10.2,-4.6],[-.1,-10.2,-1.7],[T1,-10,-2]]},// the covering centre-back, a step late
 {role:'juv',style:juv({seed:32,skin:SKIN_M}),keys:[[T0,-18,-8],[-3,-15.4,-10.4],[T_SLD,-10.4,-9.8],[0,-9,-8.8],[T1,-8.8,-8.6]]},
 {role:'juv',style:juv({seed:33}),keys:[[T0,-40,-22],[T_ALB,-30.5,-24.4],[-2.5,-22,-21],[0,-18.5,-18],[T1,-16,-16]]},// right-back turned by Alba
 {role:'juv',style:juv({seed:34,skin:SKIN_D}),keys:[[T0,-17,6],[-2,-14,3],[0,-11.5,2.6],[T1,-11,2.4]]},
 {role:'juv',style:juv({seed:35}),keys:[[T0,-25,4],[-2,-20,1.5],[0,-17,.6],[T1,-16,.4]]},
 {role:'juv',style:juv({seed:36,build:{height:1.8}}),keys:[[T0,-28,-12],[-2,-22,-8],[0,-18.5,-5],[T1,-17,-4]]},
 {role:'bar',style:bar({seed:61,skin:SKIN_M}),keys:[[T0,-20,12],[-2,-14,8],[0,-10.6,5.4],...toRak(-10,5,2)]},
 {role:'bar',style:bar({seed:62,hair:[Y,.4]}),keys:[[T0,-32,10],[-2,-27,6],[0,-23,4],[T1,-18,-6]]},
];
const RAK=0,INI=1,NEY=2,ALB=3,GK=4,BLK=5;
const TR=makeTracks(ACTORS.map(a=>a.keys),T0,T1);

// ---------------------------------------------------------------- the ball: carried, passed, flicked, slid across, sidefooted, the net
const feet=(k:number,tau:number,ahead=.55):V3=>{const[x,z]=TR.posOf(k,tau),v=TR.velOf(k,tau),n=nrm2(v[0],v[1]),sp=Math.hypot(v[0],v[1]);return[x+n[0]*ahead*clamp(sp/2),BALL_R,z+n[1]*ahead*clamp(sp/2)];};
const pass=(a:V3,b:V3,u:number,lift=0):V3=>{const e=1-Math.pow(1-u,1.7),p=mix3(a,b,e);p[1]=BALL_R+lift*Math.sin(Math.PI*u);return p;};
function ballAt(tau:number):V3{
 if(tau<T_ALB)return feet(ALB,tau);
 if(tau<T_NEY)return pass(feet(ALB,T_ALB),feet(NEY,T_NEY,.3),(tau-T_ALB)/(T_NEY-T_ALB));
 if(tau<T_FLK)return feet(NEY,T_NEY,.3);
 if(tau<T_INI)return pass(feet(NEY,T_NEY,.3),feet(INI,T_INI,.35),(tau-T_FLK)/(T_INI-T_FLK),.35);
 if(tau<T_SLD){// Iniesta's dance: the ball stays a touch ahead of him, nudged on each touch
  const f=feet(INI,tau,.45);const w=.08*Math.sin((tau-T_INI)*TAU*1.6);return[f[0]+w,BALL_R,f[2]-w];}
 if(tau<0)return pass(feet(INI,T_SLD,.45),SPOT,(tau-T_SLD)/(0-T_SLD));
 if(tau<TS)return mix3(SPOT,GOAL_PT,easeOut(tau/TS,));
 if(tau<TS+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TS)/.14));
 const u=clamp((tau-TS-.14)/.5);return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u)),lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau*TAU*2.2;
const bulgeAt=(tau:number)=>tau<TS+.08?0:.8*Math.exp(-(tau-TS-.08)*2.4)*(1+.3*Math.sin((tau-TS)*14));

// ---------------------------------------------------------------- poses
/** a pass / flick / finish: the strike clip around a contact time */
const kick=(pose:ReturnType<typeof loco>,tau:number,t0:number,foot:'l'|'r',power:number,dur=.9)=>{const w=win(tau,t0-.45,t0+.5,.15);return w>0?blendPose(pose,strike(clamp((tau-t0)/dur+STRIKE_CONTACT),{foot,power}),w):pose;};
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:.1});
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=TR.posOf(k,tau),b=ballAt(tau);let pose=loco(TR,k,tau),yaw=faceYaw(TR,k,tau,b);
 switch(a.role){
  case 'rak':{pose=kick(pose,tau,0,'r',.45,.8);const w=sm(-.5,-.15,tau)*(1-sm(.5,1,tau));yaw=lerpAng(yaw,YAW_R,w);
   if(tau>.9)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4.2,{kind:'run'}),sm(.9,1.6,tau));break;}
  case 'ini':{if(tau>T_INI&&tau<T_SLD)pose=blendPose(pose,dribble(TR.distOf(k,tau)/1.6,{foot:'r',speed:.5}),win(tau,T_INI,T_SLD,.2));
   pose=kick(pose,tau,T_SLD,'r',.35,.7);if(tau>T_SLD-.4&&tau<T_SLD+.3)yaw=lerpAng(yaw,yawTo(SPOT[0]-x,SPOT[2]-z),win(tau,T_SLD-.4,T_SLD+.3,.15));
   if(tau>TS+.6)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4,{kind:'arms'}),sm(TS+.6,TS+1.2,tau)*.8);break;}
  case 'ney':{pose=kick(pose,tau,T_FLK,'r',.2,.6);if(tau>TS+.5)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4,{kind:'arms'}),sm(TS+.5,TS+1.1,tau)*.8);break;}
  case 'alb':{if(tau<T_ALB)pose=blendPose(pose,dribble(TR.distOf(k,tau)/2.2,{foot:'l',speed:.9}),.6);pose=kick(pose,tau,T_ALB,'l',.4,.7);break;}
  case 'gk':{pose=keeperSet(tau*1.3);if(tau>-.05)pose=blendPose(pose,DIVE((tau+.05)/.95),sm(-.05,.1,tau));if(tau>TS+1.4)pose=blendPose(pose,DEJECT,sm(TS+1.6,TS+2.4,tau)*.6);
   yaw=faceYaw(TR,k,Math.min(tau,-.1),ballAt(Math.min(tau,-.1)));break;}
  case 'blk':{// the covering defender stretches to block — a step too late
   if(tau>-.45&&tau<1.2)pose=blendPose(pose,lunge(clamp((tau+.45)/.9),{side:'l'}),win(tau,-.45,1.2,.2));if(tau>TS+.8)pose=blendPose(pose,DEJECT,sm(TS+.8,TS+1.6,tau)*.8);break;}
  case 'juv':if(tau>TS+.5)pose=blendPose(pose,DEJECT,sm(TS+.8,TS+1.8,tau)*.8);break;
  case 'bar':if(tau>TS+.3)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4.2,{kind:'arms'}),sm(TS+.4,TS+1,tau)*.7);break;
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((_,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k],st=stateOf(k,tau),hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===RAK&&tau>-.25&&tau<.35)||(k===INI&&Math.abs(tau-T_SLD)<.3)||(k===GK&&tau>.05&&tau<.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}
/** Berlin at dusk: grey-blue seats; Barça blue and garnet, Juve black and white in the crowd */
const ARENA=(roar=0,flash=0):Stadium=>({sky:'dusk',seats:[[B,.3],[K,.2]],crowd:[['paper',.28],[K,.24],[B,.24],[R,.24]],roar,flash});
const GROUND={track:B};
const at=(k:number,tau:number,y=1)=>TR.at(k,tau,y);

// ---------------------------------------------------------------- 1 · live: the high main-stand camera over the near (left) side, real time
function tau1(t:number){const tS=CUE(0,'sidefoots')+.1;return Math.max(T0+.3,t-tS);}
const P1:V3=[-30,24,-72];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-34,8,20],fov:40})],
  [CUE(0,'Barcelona against')-.3,1.3,()=>({P:P1,T:[-26,1,-6],fov:22})],
  [CUE(0,'Jordi')-.5,.9,()=>({P:P1,T:mix3(b,at(ALB,tau,.8),.3),fov:12})],
  [CUE(0,'Neymar')-.3,.8,()=>({P:P1,T:mix3(b,[-14,1,-10],.3),fov:13})],
  [CUE(0,'Andrés')-.2,.8,()=>({P:P1,T:mix3(b,[-10,1,-5],.35),fov:12})],
  [CUE(0,'Ivan')-.1,.6,()=>({P:P1,T:mix3(b,[-6,1,-1],.4),fov:12})],
  [CUE(0,'sidefoots')+.9,1.4,()=>({P:P1,T:mix3(at(RAK,tau,1.1),[-7,1,-6],.3),fov:13})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tN=CUE(0,'sidefoots')+.5;
  stadium(s,c,t,[0,1,3],ARENA(sm(tN,tN+.5,t),sm(tN,tN+.4,t)*(1-sm(tN+2.4,tN+3,t))));
  ground(s,c,GROUND);
  play(s,c,tau,tp,{min:15,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'sidefoots')+.2;},
};
// ---------------------------------------------------------------- 2 · slow replay from high behind the goal: the flick, the dance, across
const tau2=(t:number)=>key(t,mono([[0,T_ALB-.3],[CUE(1,'Neymar flicks'),T_FLK-.15],[CUE(1,'Iniesta dances'),T_INI+.1],[CUE(1,'slides'),T_SLD-.1],[SECS(1)-.2,.25]]),linear);
const E2:V3=[14,11,-6];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-18,0,-16],fov:30})],
  [CUE(1,'Neymar')-.3,.9,()=>({P:E2,T:mix3(b,at(NEY,tau,.8),.4),fov:18})],
  [CUE(1,'Iniesta')-.2,1,()=>({P:E2,T:mix3(b,at(INI,tau,.8),.4),fov:17})],
  [CUE(1,'slides')-.2,.9,()=>({P:E2,T:mix3(b,[-10,.5,-3],.5),fov:20})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[2,3],ARENA());
  ground(s,c,GROUND);
  trail(s,c,ballAt,Math.max(T_ALB-.3,tau-1.2),tau,1);
  // the replay graphic: a ring under whoever has the ball
  const who=tau<T_NEY?ALB:tau<T_INI?NEY:tau<T_SLD?INI:RAK;groundRing(s,c,at(who,tau,0),.8,Y,sm(.2,.5,t),.14);
  play(s,c,tau,tp,{smear:true,min:11});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'Iniesta dances')+.6;},
};
// ---------------------------------------------------------------- 3 · slow replay low behind Rakitić: the arrival and the sidefoot
const tau3=(t:number)=>key(t,mono([[0,-2.2],[CUE(2,'penalty spot'),-.9],[CUE(2,'right moment'),-.2],[CUE(2,'calm sidefoot'),.02],[CUE(2,'Barcelona lead')-.4,TS+1.4],[SECS(2),TS+3.4]]),linear);
function cam3v(t:number):Cam{
 const tau=tau3(t),r=at(RAK,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:[-24,2.2,-2.5],T:mix3(r,[-11,.8,0],.4),fov:26})],
  [CUE(2,'penalty spot')-.3,.9,()=>({P:[-21,1.8,-2],T:mix3(r,SPOT,.5),fov:18})],
  [CUE(2,'right moment')-.2,.8,()=>({P:[-18.5,1.6,-1.2],T:mix3(SPOT,[-2,1,1.2],.3),fov:22})],
  [CUE(2,'calm')-.1,.9,()=>({P:[-18.5,1.6,-1.2],T:[-3,1,1.2],fov:24})],
  [CUE(2,'Barcelona lead')-.6,1.5,()=>({P:[-17,4,-8],T:r,fov:20})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tL=CUE(2,'Barcelona lead');
  stadium(s,c,t,[0,1,3],ARENA(sm(TS,TS+.4,tau),Math.max(sm(TS,TS+.3,tau)*(1-sm(TS+1.4,TS+2,tau)),sm(tL-.1,tL+.3,t))));
  ground(s,c,GROUND);
  groundRing(s,c,SPOT,.9,Y,sm(CUE(2,'penalty')-.2,CUE(2,'penalty')+.2,t)*(1-sm(.05,.3,tau)),.14);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  const hit=tau/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(RAK,tau3(twos(t))),sk=solve(p.pose,B_RAK,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'calm sidefoot')+.2;},
};
// ---------------------------------------------------------------- 4 · the lesson: from the edge of the box, arrive with the pass, finish fast
const tau4=(t:number)=>key(t,mono([[0,-2.4],[CUE(3,'right moment'),-1.1],[CUE(3,'finish fast'),-.08],[CUE(3,'before a defender'),.1],[CUE(3,'block'),.3],[SECS(3),TS+.8]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(RAK,tau,1);
 return plan(t,[
  [0,0,()=>({P:[-27,6,6],T:[-12,.4,-2],fov:34})],
  [CUE(3,'right moment')-.2,1,()=>({P:[-25,4.5,5],T:mix3(w,SPOT,.5),fov:24})],
  [CUE(3,'finish fast')-.2,.8,()=>({P:[-23,3.4,4.2],T:SPOT,fov:17})],
  [CUE(3,'before')-.2,.9,()=>({P:[-23,3.8,4.6],T:mix3(SPOT,[-2,.6,1.5],.45),fov:26})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tA=CUE(3,'Arrive'),tM=CUE(3,'right moment'),tF=CUE(3,'finish fast'),tD=CUE(3,'before a defender');
  stadium(s,c,t,[0,1],ARENA(.3+.3*sm(tF+.4,tF+1,t)));
  ground(s,c,GROUND);
  // "Arrive in the box": the box lights up
  const bx=sm(tA-.1,tA+.4,t)*(1-sm(tF,tF+.6,t));
  if(bx>0){const zone=polyP(c,[[-16.5,.01,-20.16],[0,.01,-20.16],[0,.01,20.16],[-16.5,.01,20.16]]);if(zone.length>2){const zp=polyPath(zone,true);s.knockout(zp,.2*bx);s.tone(Y,zp,.22*bx);}}
  // "right moment": his footprints and the pass's path both lead to one meeting ring on the spot
  const rm=sm(tM-.2,tM+.3,t)*(1-sm(tD+.4,tD+1,t));
  if(rm>0){const dim=new Path2D(),lit=new Path2D();for(let k=0;k<8;k++){const Tk=-2.2+k*(2.1/7),[x,z]=TR.posOf(RAK,Tk),v=TR.velOf(RAK,Tk),n=nrm2(-v[1],v[0]),side=k%2?.14:-.14,pts:Pt[]=[];
    for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[x+n[0]*side+Math.cos(a)*.16,.01,z+n[1]*side+Math.sin(a)*.1]);if(p)pts.push(p);}(Tk<=tau+.02?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*rm);s.stroke(K,lit,5,.9*rm);s.knockout(lit,rm);s.fill(Y,lit,.95*rm);
   groundRing(s,c,SPOT,.8,R,rm,.12);
   const q:V3[]=[];for(let i=0;i<=10;i++)q.push(pass(feet(INI,T_SLD,.45),SPOT,i/10));arrow3(s,c,q,Math.max(8,kAt(c,SPOT)*.05),Y,.9*rm);}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[RAK,INI,GK,BLK,6]});
  // "finish fast": a spark at the contact and the shot's arrow into the net
  if(r.ball&&tau>=0&&tau<.25)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(60,r.ball.r*4.5),{n:9,seed:29,g:easeOutBack(clamp(tau/.1))*(1-clamp((tau-.12)/.12)),width:10});
  const ff=sm(tF+.1,tF+.9,t,easeInOutSine)*(1-sm(SECS(3)-1,SECS(3)-.7,t));
  if(ff>0){const q:V3[]=[];for(let i=0;i<=6;i++)q.push(mix3(SPOT,GOAL_PT,ff*i/6));arrow3(s,c,q,Math.max(9,kAt(c,SPOT)*.05),Y,.95);}
  // "before a defender can block": a red ring round the defender's stretching boot, too late
  const bd=sm(tD-.1,tD+.3,t)*(1-sm(SECS(3)-1,SECS(3)-.7,t));
  if(bd>0){const st=stateOf(BLK,tau),sk=solve(st.pose,{height:1.9},st.place);groundRing(s,c,[sk.lToe[0],0,sk.lToe[2]],.7,R,bd,.12);}
  void easeIO;
 },
 get still(){return CUE(3,'finish fast')+.4;},
};

const film:RisoStory={
 id:'rakitic-final-2015',format:'11v11',title:"Rakitić's early goal",
 theme:'Arrive in the box at the right moment and finish fast, before a defender can block',
 ageNote:'Juventus 1–3 Barcelona, Champions League final, Berlin, 6 June 2015. For players of every age.',
 spec:SPEC,
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball rolls in along the grass and is sidefooted away with a spark. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x-220*(1-u):x+60*easeOut(out),by=age<.3?y:y-200*easeOut(out);
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Checked by tests/play-film-rakitic-final-2015.cjs (pitch metres; the attacked goal line x = 0, +z = Barcelona's right). */
export const FACTS={SPOT,GOAL_PT,TS,T_ALB,T_NEY,T_FLK,T_INI,T_SLD,ballAt,finishFoot:'r' as const,
 posOf:(k:number,tau:number)=>TR.posOf(k,tau),RAK,INI,NEY,ALB,
 rakiticContact:()=>{const st=stateOf(RAK,0),sk=solve(st.pose,B_RAK,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 keeperAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_BUF,st.place);return{lHa:sk.lHa,rHa:sk.rHa};},
 d3,builds:{B_INI,B_NEY,B_ALB}};
