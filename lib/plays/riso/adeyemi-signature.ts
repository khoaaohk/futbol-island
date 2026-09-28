/** Karim Adeyemi — SIGNATURE-MOVE DEMO: "how he does it" (lib/town/iconicPlays.json, "The Hat-trick v Celtic"; lesson: "Use your speed
 * early: attack the space behind the defence before it closes"). An iconic-play riso film (RisoStory, chapters mode) played by the card's
 * picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, on the shared broadcast-pitch kit (lib/plays/riso/broadcast-pitch.ts).
 *
 * WHY A DEMO, NOT THE MATCH: the card proposes the hat-trick against Celtic (Borussia Dortmund 7–1 Celtic, Champions League league phase,
 * Signal Iduna Park, 1 October 2024; Adeyemi 11', 29', 42', all in the first half). The accounts I could read confirm the goals but NOT which
 * side of the pitch the first one (Brandt's through ball, a shot deflected in off Trusty) or the second one (a LEFT-foot drive from a tight
 * angle at the near post after a half-cleared corner) came from, and the footage was not reviewed. A film of either would have to invent the
 * side, so — per the brief — this is a clearly labelled demo of the move the lesson teaches (a teammate's pass into the space behind, an early
 * sprint, one touch, a finish), never claimed as a moment of that match. The narration states only the sourced fact (a first-half hat-trick
 * against Celtic) and then says "Here's how he does it".
 *
 * SOURCES (Sept 2026, read as raw pages; cached in the build scratchpad cf6/):
 *  - The Guardian, "Karim Adeyemi fires hat-trick as Borussia Dortmund demolish Celtic" (1 Oct 2024): Adeyemi "beat Auston Trusty for pace
 *    before lashing a shot beyond Schmeichel with the assistance of a deflection"; the second "flew past him at the near post from a tight
 *    angle"; the third "a low drive after Maeda coughed up possession"; the Yellow Wall.
 *  - Sports Mole match report (1 Oct 2024): goals 11', 29', 42'; "raced on to Julian Brandt's through ball"; "on his potent left foot he fizzed
 *    a ferocious drive beyond Schmeichel at his near post"; theScore: "a left-footed rocket from a tight angle".
 *  - Outlook India / Stats Perform: "the second German player to score three goals in the first half of a Champions League match".
 * CONFIRMED (narrated): the first-half hat-trick against Celtic in 2024; his speed as the weapon (beating a defender for pace).
 * INFERRED / DEMO (never claimed as a match play): the whole sequence, its positions, the passer, the defender and keeper (generic, unnamed
 *   kits: white shirts, blue shorts; keeper red), the finishing foot (drawn RIGHT), the right-hand channel (the card's "side: right"), the
 *   night and the stadium look (a Signal-Iduna-like bowl with a yellow south stand). Dortmund's yellow shirts and black shorts and Adeyemi's
 *   number 27 are his club kit.
 *
 * FRAMING (TV grammar, never top-down): ch1 = a wide main-stand shot of the demo in real time; ch2 = a high replay from behind the move (the
 * early run starts before the pass; the defender still watches the ball); ch3 = a low side replay (one touch, the finish); ch4 = the lesson
 * with teaching marks (the space behind lit, his early lane, the gap closing). Inks: yellow, red, blue, navy. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,polyPath,ribbon,easeOut,easeOutBack,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,keeperSet,keeperDive,celebrate,blendPose,backpedal,dribble,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type V3,type Build} from './athlete';
import {frame,toCam,scr,pr,kAt,stadium,ground,drawScene,tracks,plan,gnd,arrow3,groundRing,pathRibbon,estimate,mono,add3,mix3,yawTo,lerpAng,nrm2,win,
 DEJECT,BALL_R,kickerAt,type Pal,type StadiumSpec,type Cam,type State,type Fig} from './broadcast-pitch';

// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'How he does it',text:'Karim Adeyemi is one of the fastest players in football. In 2024, he scored a hat-trick against Celtic in just one half! Here\'s how he does it: he sprints behind the defence, onto the pass, and scores.',tail:2.4,
  cues:['Karim Adeyemi','fastest','scored','Celtic','how he does it','sprints behind','onto the pass','scores']},
 {label:'Go early',text:'Watch again. He starts running before the pass, while the defender is still watching the ball.',tail:1.8,
  cues:['Watch again','starts running','before the pass','while the defender','watching the ball']},
 {label:'Touch and finish',text:'One touch to go past, then a calm finish. The defender never catches him.',tail:2.2,
  cues:['One touch','go past','calm finish','never catches']},
 {label:'Use your speed',text:'Like Adeyemi: use your speed early, and attack the space behind the defence before it closes.',tail:2.2,
  cues:['Like Adeyemi','use your speed','attack the space','before it closes']},
];
import timingJson from '../../../public/plays/narration/adeyemi-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail,'adeyemi');return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('adeyemi: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, stadium
const Y='yellow',R='red',B='blue',K='navy';
const PAL:Pal={Y,R,B,K};
/** a Signal-Iduna-like bowl under floodlights: steep stands close to the pitch, a yellow south stand (demo setting) */
const BOWL:StadiumSpec={pal:PAL,side:41,end:11,rake:34,height:36,tiers:[.5],roof:true,track:null,night:true,seats:[[K,.4]],
 crowdInks:[Y,[K,.95],'paper',B],boards:K,wall:{stand:1,ink:Y,cov:.75},
 crowd:(si,a,h,hb)=>si===1?(hb<.8?0:1):(hb<.5?0:hb<.85?1:h<.9?2:3)};

// ---------------------------------------------------------------- the cast
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.06]];
/** Dortmund home: yellow shirts, black shorts, yellow socks; navy numbers */
const bvb=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:K,socks:Y,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,number:n,numberInk:K,hairStyle:'short',build:{height:1.82},seed:n??30,...o});
/** the demo opponents (generic, unnamed): white shirts, blue shorts */
const opp=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:B,socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:B,number:null,hairStyle:'short',build:{height:1.86},seed:70,...o});
const B_ADE:Build={height:1.8,bulk:.96,thighs:1.06},B_DEF:Build={height:1.88};
const ADE_ST=bvb(27,{build:B_ADE,skin:SKIN_D,hairStyle:'curly'});
const GK_ST:AthleteStyle={shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,gloves:'paper',sleeves:'long',number:null,hairStyle:'short',build:{height:1.92},seed:1};

// ---------------------------------------------------------------- the demo on one clock τ (τ = 0 is the pass)
const TS0=-.7,TP=0,TA=1.55,TSH=2.35,TG=TSH+.42;// run starts, pass, first touch (arrival), shot, goal
const PASSER:[number,number]=[-39,5];
const PA:V3=[-38.2,BALL_R,5.3];// pass point
const PT:V3=[-12.2,BALL_R,11.2];// where the pass meets his run (the space behind)
const PS:V3=[-7.4,BALL_R,7.8];// the shot (after one touch forward)
const PG:V3=[0,.32,-2.4],NETP:V3=[1.7,.3,-2.6],REST:V3=[1.6,BALL_R,-2.5];
const DPS=nrm2(PG[0]-PS[0],PG[2]-PS[2]),PSK=kickerAt(PS,DPS,B_ADE,'r');
const DPA=nrm2(PT[0]-PA[0],PT[2]-PA[2]),PPK=kickerAt(PA,DPA,{height:1.84},'r');
type Role='ade'|'pas'|'def'|'gk'|'bvb'|'opp';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-10,T1=8;
const ACTORS:Actor[]=[
 {name:'Karim Adeyemi (demo)',role:'ade',hero:true,style:ADE_ST,keys:[[T0,-34,20],[-5,-27,19],[-2,-24.6,18.4],[TS0,-24,18.2],[TP,-21.6,17],[TA-.05,PT[0]-.9,PT[2]+.7],[TSH-.25,PSK[0]-DPS[0]*.9,PSK[1]-DPS[1]*.9],[TSH,PSK[0],PSK[1]],[TSH+.7,-5.2,6.2],[TG+2,-4,10],[T1,-6,18]]},
 {name:'the passer (demo)',role:'pas',hero:true,style:bvb(null,{build:{height:1.84},seed:31,skin:SKIN_M}),keys:[[T0,-62,-2],[-5,-50,1.5],[-.6,PPK[0]-DPA[0]*.7,PPK[1]-DPA[1]*.7],[TP,...PPK],[1.5,-35,6],[T1,-30,7]]},
 {name:'the last defender (demo)',role:'def',hero:true,style:opp({build:B_DEF,seed:71}),keys:[[T0,-22,12],[TP,-21,13.6],[.6,-19.4,13.9],[TA,-14.6,12.8],[TSH,-10.2,10],[TG,-8.4,8.8],[T1,-8,8.6]]},
 {name:'keeper (demo)',role:'gk',hero:true,style:GK_ST,keys:[[T0,-2,0],[TA,-2.4,1.2],[TSH,-3,1.9],[T1,-3,1.9]]},
 {name:'defender (demo)',role:'opp',style:opp({seed:72}),keys:[[T0,-21,2],[TP,-20,2.4],[TA,-15,4],[TSH,-11,4.6],[T1,-9,5]]},
 {name:'defender (demo)',role:'opp',style:opp({seed:73,skin:SKIN_D}),keys:[[T0,-21,-8],[TP,-20.5,-7],[TA,-16,-4],[T1,-12,-2]]},
 {name:'striker (demo)',role:'bvb',style:bvb(null,{seed:32,build:{height:1.87},skin:SKIN_M}),keys:[[T0,-24,-2],[TP,-21.5,-1],[TA,-15,-.5],[T1,-9,0]]},
 {name:'midfielder (demo)',role:'opp',style:opp({seed:74}),keys:[[T0,-33,10],[TP,-34,8.5],[T1,-30,8]]},
];
const ADE=0,PAS=1,DEF=2,GK=3;
const TR=tracks(ACTORS,T0,T1);
const posOf=TR.posOf,distOf=TR.distOf;

// ---------------------------------------------------------------- the ball
const fly=(A:V3,Bp:V3,d:number):V3=>[(Bp[0]-A[0])/d,(Bp[1]-A[1]+4.905*d*d)/d,(Bp[2]-A[2])/d];
const at=(A:V3,V:V3,t:number):V3=>[A[0]+V[0]*t,A[1]+V[1]*t-4.905*t*t,A[2]+V[2]*t];
const roll=(A:V3,Bp:V3,t0:number,t1:number,tau:number):V3=>{const u=clamp((tau-t0)/(t1-t0)),s=u*(1.3-.3*u);return mix3(A,Bp,s);};
const V_SHOT=fly(PS,PG,TG-TSH);
function ballAt(tau:number):V3{
 if(tau<TP-1.2){const p=posOf(PAS,tau);return[p[0]+.5,BALL_R,p[1]+.1];}
 if(tau<TP){const a=ballAt(TP-1.21);return mix3(a,PA,easeOut((tau-TP+1.2)/1.2));}
 if(tau<TA)return roll(PA,PT,TP,TA,tau);
 if(tau<TSH)return roll(PT,PS,TA,TSH,tau);
 if(tau<TG)return at(PS,V_SHOT,tau-TSH);
 if(tau<TG+.2)return mix3(PG,NETP,easeOut((tau-TG)/.2));
 const u=clamp((tau-TG-.2)/.4);return[lerp(NETP[0],REST[0],u),lerp(NETP[1],REST[1],u),lerp(NETP[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau*TAU*(tau<TSH?1.2:3);
const bulgeAt=(tau:number)=>tau<TG+.06?0:.7*Math.exp(-(tau-TG-.06)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses
function kick(pose:Pose,tau:number,tc:number,foot:'l'|'r',dur=.9,w=1):Pose{const ww=win(tau,tc-.5,tc+.7,.2)*w;return ww>0?blendPose(pose,strike(clamp((tau-tc)/dur+STRIKE_CONTACT),{foot}),ww):pose;}
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau),b=ballAt(tau);let pose=TR.loco(k,tau),yaw=TR.faceYaw(k,tau,b);
 switch(a.role){
  case 'ade':{// before the run he watches the passer (head turned), the early sprint, the touch (a dribble stride), the right-foot finish
   if(tau<TS0)yaw=yawTo(PASSER[0]-x,PASSER[1]-z);
   const tw=win(tau,TA-.45,TA+.35,.15);if(tw>0)pose=blendPose(pose,dribble(.97+(tau-TA)*1.4,{foot:'r',speed:.9}),tw*.7);
   pose=kick(pose,tau,TSH,'r',.85);const w=sm(TSH-.5,TSH-.15,tau)*(1-sm(TSH+.5,TSH+1,tau));yaw=lerpAng(yaw,yawTo(DPS[0],DPS[1]),w);
   if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4,{kind:'run'});pose=blendPose(pose,run,sm(TG+.5,TG+1.2,tau));}break;}
  case 'pas':pose=kick(pose,tau,TP,'r',.85);if(tau>TP-.8&&tau<TP+.6)yaw=lerpAng(yaw,yawTo(DPA[0],DPA[1]),win(tau,TP-.8,TP+.6,.2));
   if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
  case 'def':{// watching the ball (facing the passer, backpedalling) until the pass is gone, then a late turn and chase
   const turn=sm(TP+.2,TP+.75,tau);if(turn<1){pose=blendPose(backpedal(tau*2.2),pose,turn);yaw=lerpAng(TR.faceYaw(k,tau,[PASSER[0],0,PASSER[1]]),yaw,turn);if(turn<.5)yaw=yawTo(PASSER[0]-x,PASSER[1]-z);}
   if(tau>TG+.3)pose=blendPose(pose,DEJECT,sm(TG+.5,TG+1.3,tau)*.8);break;}
  case 'gk':{pose=keeperSet(Math.min(tau,TSH)*1.3);const t0=TSH+.02;
   if(tau>t0)pose=blendPose(pose,keeperDive(clamp((tau-t0)/1.1),{side:'r',height:.25}),.7*sm(t0,t0+.12,tau)*(1-sm(TG+1,TG+1.6,tau)));
   if(tau>TG+1.3)pose=blendPose(pose,DEJECT,sm(TG+1.5,TG+2.2,tau)*.6);yaw=TR.faceYaw(k,Math.min(tau,TSH),ballAt(Math.min(tau,TSH)));break;}
  case 'opp':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);break;
  case 'bvb':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;cap?:number}={}){
 const figs:Fig[]=ACTORS.map((a,k)=>{const hero=!!a.hero;return{st:stateOf(k,tau),prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===ADE&&tau>TS0&&tau<TSH+.35)||(k===PAS&&tau>-.25&&tau<.35))};});
 return drawScene(s,c,PAL,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2],by:.5},o.cap);
}
const atA=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · the wide main-stand shot, real time
function tau1(t:number){const tH=CUE(0,'how he')+.2,tS=CUE(0,'sprints behind'),tO=CUE(0,'onto the pass')+.2,tC=CUE(0,'scores'),S=SECS(0);
 return key(t,mono([[0,Math.max(T0+.2,-2.2-tH*.85)],[tH,-2.2],[tS,TS0],[tO,TA],[tC,TSH+.1],[S+1,TSH+.1+S+1-tC]]),linear);}
const P1:V3=[-22,24,-74];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  // while the intro fact is read: a tight tracking shot on Adeyemi himself (so the card's small window shows the player), then out wide
  [0,0,()=>({P:P1,T:atA(ADE,tau,1),fov:3.6})],
  [CUE(0,'how he')-1,1.3,()=>({P:P1,T:mix3(gnd(b,1),atA(ADE,tau,1),.5),fov:13})],
  [CUE(0,'sprints behind')-.3,.8,()=>({P:P1,T:mix3(gnd(b,1),atA(ADE,tau,1),.55),fov:13})],
  [CUE(0,'scores')-.3,.8,()=>({P:P1,T:mix3(atA(ADE,tau,1),[-2,.8,0],.5),fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tC=CUE(0,'scores');
  stadium(s,c,BOWL,t,[0,1,3],{roar:sm(TG,TG+.5,tau),flash:sm(tC,tC+.4,t)*(1-sm(tC+2,tC+2.8,t))});
  ground(s,c,BOWL);
  play(s,c,tau,tp,{min:17,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'onto the pass')+.2;},
};

// ---------------------------------------------------------------- 2 · high replay from behind the move: he goes before the pass
const tau2=(t:number)=>key(t,mono([[0,-2],[CUE(1,'starts running'),TS0],[CUE(1,'before the pass'),TP-.15],[CUE(1,'while the defender'),TP+.2],[CUE(1,'watching the ball'),TP+.5],[SECS(1),TA]]),linear);
const E2:V3=[-48,10,16];
function cam2(t:number):Cam{
 const tau=tau2(t);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(atA(ADE,tau,0),atA(PAS,tau,0),.3),fov:30})],
  [CUE(1,'starts running')-.3,1,()=>({P:add3(E2,[6,-2,0]),T:mix3(atA(ADE,tau,0),atA(DEF,tau,0),.5),fov:26})],
  [CUE(1,'watching the ball')-.3,1,()=>({P:add3(E2,[10,-3,-1]),T:mix3(atA(ADE,tau,0),[PT[0],0,PT[2]],.4),fov:28})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tS=CUE(1,'starts running'),tW=CUE(1,'while the defender');
  stadium(s,c,BOWL,t,[0,1]);
  ground(s,c,BOWL);
  // replay graphics: his early run (yellow, from "starts running"); the defender's eyes on the ball (a red sight line to the passer)
  const pts:V3[]=[];for(let i=0;i<=16;i++){const[x,z]=posOf(ADE,lerp(TS0,Math.max(TS0+.01,tau),i/16));pts.push([x,.02,z]);}pathRibbon(s,c,pts,Y,sm(tS-.1,tS+.3,t),.9);
  const dw=win(t,tW-.1,SECS(1)-.3,.2);if(dw>0){const d=atA(DEF,tau,1.7),p=atA(PAS,tau,1);const a=pr(c,d),e=pr(c,mix3(d,p,.55));if(a&&e){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.14)gaps.push([x,x+.06]);s.fill(R,ribbon([a,e],Math.max(5,kAt(c,d)*.08),{taper:.2,wobble:.5,gaps}),.9*dw);}}
  play(s,c,tau,tp,{min:11,cap:2});
 },
 aperture(t){const c=cam2(t),st=stateOf(ADE,tau2(twos(t))),sk=solve(st.pose,B_ADE,st.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(1,'while the defender')+.4;},
};

// ---------------------------------------------------------------- 3 · low side replay: one touch, the calm finish, the chase that never catches him
const tau3=(t:number)=>key(t,mono([[0,TA-.9],[CUE(3-1,'One touch'),TA],[CUE(2,'go past'),TA+.35],[CUE(2,'calm finish'),TSH],[CUE(2,'never catches'),TG+.4],[SECS(2),TG+2.2]]),linear);
function cam3v(t:number):Cam{
 const tau=tau3(t),ad=atA(ADE,tau,1);
 return plan(t,[
  [0,0,()=>({P:add3(ad,[-2,1,11]),T:add3(ad,[3,0,-1]),fov:34})],
  [CUE(2,'calm finish')-.3,.8,()=>({P:[PS[0]-3,1.3,PS[2]+9],T:mix3([PS[0],.6,PS[2]],[0,.6,-1],.4),fov:34})],
  [CUE(2,'never catches')-.2,1.2,()=>({P:[PS[0]-4,1.8,PS[2]+11],T:mix3(ad,atA(DEF,tau,1),.5),fov:34})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tF=CUE(2,'calm finish');
  stadium(s,c,BOWL,t,[2,1],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau))});
  ground(s,c,BOWL);
  const r=play(s,c,tau,tp,{smear:true,min:12,lines:true,prevBall:tau3(t-.06),cap:2});
  const hit=(tau-TSH)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4),{n:9,seed:29,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
  // "one touch to go past": the touch pushes the ball ahead — a yellow tick along its roll
  const tk=win(t,CUE(2,'One touch')-.1,tF,.2);if(tk>0){const pts:V3[]=[];for(let i=0;i<=10;i++)pts.push(gnd(ballAt(lerp(TA,Math.min(TSH,Math.max(TA+.01,tau)),i/10)),.03));pathRibbon(s,c,pts,Y,tk,.3);}
 },
 // the passage opens from the scorer, not an empty point in the net (that showed a blank green disc in the mesh)
 aperture(t){const c=cam3v(t),st=stateOf(ADE,tau3(twos(t))),sk=solve(st.pose,B_ADE,st.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'calm finish')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson: the space behind, the early lane, the gap that closes
const tau4=(t:number)=>key(t,mono([[0,-1.6],[CUE(3,'use your speed'),TS0],[CUE(3,'attack the space'),TP+.3],[CUE(3,'before it closes'),TA-.3],[SECS(3),TA]]),linear);
const E4:V3=[-40,11,30];
function cam4v(t:number):Cam{
 const tau=tau4(t);
 return plan(t,[
  [0,0,()=>({P:E4,T:mix3(atA(ADE,tau,0),[PT[0],0,PT[2]],.4),fov:30})],
  [CUE(3,'attack the space')-.3,1,()=>({P:add3(E4,[5,-1,-2]),T:mix3(atA(ADE,tau,0),[PT[0],0,PT[2]],.55),fov:28})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tU=CUE(3,'use your speed'),tA=CUE(3,'attack the space'),tB=CUE(3,'before it closes');
  stadium(s,c,BOWL,t,[2,1]);
  ground(s,c,BOWL);
  // "the space behind": a yellow zone behind the defender; "before it closes": the defender's recovery ring (red) grows toward it
  const sp=sm(tA-.2,tA+.4,t);if(sp>0)groundRing(s,c,PT,3.2*easeOutBack(clamp((t-tA+.2)/.6)),Y,sp);
  const cl=sm(tB-.2,tB+.4,t);if(cl>0)groundRing(s,c,atA(DEF,tau,0),1.2+2*sm(tB,tB+1.2,t),R,cl);
  const ln=sm(tU-.1,tU+.5,t);if(ln>0){const a=atA(ADE,Math.min(tau,TS0),.02),e:V3=[lerp(a[0],PT[0],ln),.02,lerp(a[2],PT[2],ln)];arrow3(s,c,K,[a,mix3(a,e,.5),e],Math.max(8,kAt(c,a)*.09),Y,.95);}
  play(s,c,tau,tp,{min:13,cap:2});
 },
 get still(){return CUE(3,'attack the space')+.5;},
};

const film:RisoStory={
 id:'adeyemi-signature',format:'11v11',title:'Adeyemi: how he does it',
 theme:'Use your speed early: attack the space behind the defence before it closes',
 ageNote:'Signature-move demo (not a specific match). Fact: first-half hat-trick, Borussia Dortmund 7–1 Celtic, 1 October 2024.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a burst — speed streaks from the point and a ball rolls into the space ahead. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.6),fade=1-clamp((age-.6)/.2);
  if(fade>0)for(let i=0;i<3;i++){const yy=y-30+i*30,len=160*easeOut(u);s.fill(Y,ribbon([[x-len,yy],[x,yy]],8,{taper:.8,wobble:.3}),.85*fade);}
  footballPanels(s,x+140*easeOut(u),y,24,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Demo geometry (pitch metres; the attacked goal line x = 0, +z = the attackers' right) — checked by tests/play-film-adeyemi-signature.cjs. */
export const FACTS={PA,PT,PS,PG,TS0,TP,TA,TSH,TG,ballAt,demo:true as const,
 ade:(tau:number)=>{const st=stateOf(ADE,tau),sk=solve(st.pose,B_ADE,st.place);return{rToe:sk.rToe,lToe:sk.lToe,pelvis:sk.pelvis};},
 passerContact:()=>{const st=stateOf(PAS,TP),sk=solve(st.pose,{height:1.84},st.place);return{rToe:sk.rToe};},
 posOf:(k:number,tau:number)=>posOf(k,tau),velOf:(k:number,tau:number)=>TR.velOf(k,tau),
 gk:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,{height:1.92},st.place);return{lHa:sk.lHa,rHa:sk.rHa};}};
