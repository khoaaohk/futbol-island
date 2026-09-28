/** Sergio Agüero — "The 93:20 Title Winner" (lib/town/iconicPlays.json: kind "moment", template solo_dribble_goal, side right, beaten 1,
 * distance box, foot right; lesson "Never stop believing: a quick one-two in the box can win a match in the last minute."). An iconic-play
 * riso film (RisoStory, chapters mode): a 1:1 reconstruction, from WRITTEN accounts (the footage itself was not reviewed frame by frame), of
 * Manchester City 3–2 Queens Park Rangers, Premier League, final day, City of Manchester Stadium (the Etihad), Sunday 13 May 2012 (an
 * afternoon kick-off in daylight), the winner at 93 minutes 20 seconds that won City the title on goal difference.
 *
 * SOURCES (read 26 Sep 2026 with curl / web search, cached under scratchpad/six/):
 *  - World Football Journey, "Agüero 93:20 – The Goal That Won Manchester City the Premier League" (wfj.txt): "93:20 Balotelli, falling,
 *    flicks the ball with an outstretched leg. Agüero controls, swerves past Onuoha, and drives low into the near corner past Kenny";
 *    "Agüero took one touch to control, sidestepped around a challenge from Nedum Onuoha … and drove a powerful low shot hard into the near
 *    corner past goalkeeper Paddy Kenny. The clock read 93:20"; City 3–2 (Zabaleta 39', Džeko 90+2', Agüero 90+4'; Cissé 48', Mackie
 *    66'); "The only Premier League title ever decided on goal difference"; Agüero "tore his shirt off and sprinted towards the corner flag".
 *  - The Football Artist, "93:20 Man City v QPR 2012" (tfa.txt): "Aguero's one-two with Mario Balotelli, the shot blasting past QPR keeper
 *    Paddy Kenny". Planet Football / search record: Balotelli's only Premier League assist.
 *  - Card facts: Argentina (playerAppearance: skin 1, hair 1, short); Agüero wore 16 for City; Balotelli 45.
 * CONFIRMED: the match, venue, date, 93:20, 2–2 → 3–2 and the title on goal difference; a ONE-TWO with BALOTELLI, who, FALLING, flicked it
 *  back with an outstretched leg; Agüero took ONE TOUCH to control, SIDESTEPPED ONUOHA's challenge and drove a POWERFUL LOW shot into the
 *  NEAR CORNER past KENNY.
 * INFERRED (illustrative; never narrated unless noted): every position, path and timing (the one-two at the edge of the box, the shot ~11 m
 *  out on the right); the shooting foot (drawn: his right, as the card says — narrated only as "smashes it"); which way he stepped past
 *  (drawn: to his right, toward the near post side); the other players (unnamed except as "the defender", no numbers except Agüero 16 and
 *  Balotelli 45); kits — City in sky blue with white shorts, QPR drawn in red-and-black hoops with black shorts (their change colours —
 *  NOT confirmed for this match), Kenny in yellow; which end City attacked on the TV picture (drawn: screen-right, the right side of the box
 *  on the near side); the bowl and the crowd; the celebration (drawn: a run with his arms out, no shirt removed); every camera.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window, never sheet.safe): 1 = the high main-stand camera in near real time
 * (the pass to Balotelli → the flick back → the touch → past the defender → the near corner); 2 = slow replay from a HIGH camera behind
 * Agüero (he passes and keeps running; Balotelli, falling, pokes it back); 3 = replay from BEHIND THE GOAL (one touch, the step past, the
 * shot into the near corner); 4 = the lesson, side-on (never stop believing → a quick one-two → the last minute). All bodies go through ONE
 * adapter, drawPlayer() → athlete.ts. The world is right-handed like athlete.ts (X toward QPR's goal at 105, Y up, +Z = the near
 * touchline under the main camera = City's right), so a figure attacking +X has its right side at +Z and Agüero's RIGHT boot plays with no
 * mirrored projector; the near post (from the right) is +Z. Shared machinery: ./tv-kit-six.ts. Scenes read only (t, c); seeded randomness. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,easeOut,easeOutBack,easeInOutSine,linear} from '../../paths/riso/motion';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,strike,lunge,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type V3,type DrawResult} from './athlete';
import {Y,K,estimate,cueFn,mono,lerp3,lerpA,yawOf,bump,over,frame,look,toCam,scr,stadium,ground,goal3,bulgeAt,tracks,footOn,play,
 streaks,groundArrow,airArrow,groundRing,bootRing,spark,touchTurf,type Cam,type View,type Venue,type Pitch,type CastE} from './tv-kit-six';

const ID='aguero-qpr-2012',R='red',B='blue';
// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Manchester, 2012: the last day of the season. City need a goal to win the league, and it is injury time. Sergio Agüero plays a one-two with Mario Balotelli... and scores! City are champions!',tail:1.8,
  cues:['Manchester','the last day','City need','injury time','Sergio Agüero','plays a','Mario Balotelli','and scores','City are']},
 {label:'Watch it again',text:'Watch again. Agüero passes, and keeps running into the box. Balotelli, falling over, pokes it back into his path.',tail:1.2,
  cues:['Watch again','Agüero passes','keeps running','Balotelli','falling','pokes']},
 {label:'The finish',text:'One touch to control. He steps past the defender, and smashes it into the near corner. Ninety-three minutes and twenty seconds!',tail:1.8,
  cues:['One touch','control','He steps','smashes','near corner','and twenty']},
 {label:'Your turn',text:'Your turn: never stop believing. A quick one-two in the box can win a match in the last minute!',tail:1.5,
  cues:['Your turn','never stop','A quick','in the box','last minute']},
];
/** VOICE: the Kokoro narration (scripts/plays/kokoro-narrate.py aguero-qpr-2012 → timing.json): withTiming re-times the film. */
import timingJson from '../../../public/plays/narration/aguero-qpr-2012/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail,ID);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUEW=cueFn(CHAPTERS,ID),SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- venue + kits
/** the Etihad on a May afternoon: a two-tier bowl under a roof, packed with sky blue (inferred look) */
const VENUE:Venue={sky:'day',crowd:[[B,5],['paper',3],[K,1],[Y,.4]],fill:.85,tiers:.5,seed:61};
const PITCH:Pitch={grass:[[Y,.9],[B,.52]],stripe:[B,.18]};
const SKIN:InkFill[]=[[Y,.34],[R,.22]],SKIN_S:InkFill[]=[[Y,.36],[R,.26],[K,.04]],SKIN_M:InkFill[]=[[Y,.42],[R,.32],[K,.12]],SKIN_D:InkFill[]=[[R,.45],[Y,.5],[K,.24]];
/** Manchester City: sky blue shirts, white shorts, sky blue socks */
const MCI=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],trim:'paper',shorts:'paper',socks:[B,.5],boots:K,numberInk:K,skin:SKIN,hair:[K,.9],hairStyle:'short',line:K,shade:[B,.3],sleeves:'short',seed:5,...o});
/** Agüero: number 16, about 1.73 m and stocky, short dark hair */
const AG_ST=MCI({number:16,skin:SKIN_S,hair:[K,.85],build:{height:1.73,bulk:1.05,thighs:1.1},seed:16});
/** Balotelli: number 45, about 1.89 m */
const BAL_ST=MCI({number:45,skin:SKIN_D,hair:[K,.95],build:{height:1.89,bulk:1.05},seed:45});
/** QPR: red and black hoops, black shorts (NOT confirmed for this match) */
const QPR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],pattern:'hoops',patternInk:[K,.9],shorts:[K,.92],socks:[K,.92],boots:K,skin:SKIN_M,hair:[K,.95],hairStyle:'short',line:K,shade:[K,.25],sleeves:'short',seed:3,...o});
const GK_ST:AthleteStyle={shirt:[Y,.95],shorts:[K,.9],socks:[Y,.95],boots:K,skin:SKIN_S,hair:[K,.7],hairStyle:'short',line:K,shade:[B,.4],gloves:'paper',sleeves:'long',trim:K,build:{height:1.83,bulk:1.1},seed:23};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the play: tracks (τ = seconds after Agüero's pass to Balotelli)
type Actor={role:'hero'|'mci'|'qpr'|'def'|'gk';style:AthleteStyle;keys:number[][];key?:boolean};
const BACK=.8,T1=1.1,STEP=1.45,SHOT=1.9,IN=SHOT+.34,NETHIT=IN+.1;
const ACTORS:Actor[]=[
 {role:'hero',style:AG_ST,key:true,keys:[[-3,68,3],[-1.5,74.5,4],[0,80.6,5.2],[.6,84.4,6.8],[1.1,87.6,8.6],[1.45,89.8,10.8],[1.9,92.2,12.2],[2.5,94.2,13],[3.5,96,16],[6,97,23]]},
 {role:'mci',style:BAL_ST,key:true,keys:[[-3,86,1],[0,87.4,2.6],[.8,88,3.2],[2,88.2,3.4],[6,88.4,3.5]]},
 {role:'def',style:QPR({seed:41,build:{height:1.88},skin:SKIN_D}),key:true,keys:[[-3,93,5],[0,93.5,6],[1,93.2,8.2],[1.45,92.2,10.1],[1.9,92,10.4],[6,92.2,10.6]]},
 {role:'qpr',style:QPR({seed:42,build:{height:1.85},skin:SKIN_S}),key:true,keys:[[-3,89,-1],[0,88.9,1.7],[.8,88.7,2.9],[2,89,3.2],[6,89.3,3.3]]},
 {role:'gk',style:GK_ST,key:true,keys:[[-3,103,0],[1,102.8,1.6],[1.9,102.6,2.2],[6,102.6,2.2]]},
 {role:'mci',style:MCI({seed:17,skin:SKIN_D,build:{height:1.93}}),keys:[[-3,84,-6],[0,88,-5],[2,94,-3],[6,97,-2]]},
 {role:'mci',style:MCI({seed:18,skin:SKIN_M}),keys:[[-3,70,16],[0,75,18],[2,80,19],[6,84,19]]},
 {role:'qpr',style:QPR({seed:43,skin:SKIN_M}),keys:[[-3,90,-7],[0,91,-6],[2,95,-4.5],[6,97,-4]]},
 {role:'qpr',style:QPR({seed:44,skin:SKIN_S}),keys:[[-3,82,10],[0,85,12],[2,89,15],[6,92,16]]},
 {role:'qpr',style:QPR({seed:45,skin:SKIN_D}),keys:[[-3,78,-3],[0,80,-2],[2,83,0],[6,85,1]]},
 {role:'mci',style:MCI({seed:19,skin:SKIN_S}),keys:[[-3,64,-10],[0,68,-9],[3,74,-7],[6,78,-6]]},
];
const AG=0,MB=1,ON=2,GK=4;
const TR=tracks(ACTORS.map(a=>a.keys),-5,8);
// ---------------------------------------------------------------- the ball: Agüero → Balotelli → the flick back as he falls → the touch → the step → the low shot at the near post
const A0=footOn(TR,AG,0,1),BP:[number,number]=[88.3,3.3],TP1=footOn(TR,AG,T1,1),SP0=footOn(TR,AG,STEP,1),SP=footOn(TR,AG,SHOT,1);
const GIN:V3=[105.05,.35,3.1],NETP:V3=[106.7,.4,3.3],REST:V3=[106.3,.11,3.3];
const l2=(a:[number,number],b:[number,number],u:number):[number,number]=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
function ballAt(tau:number):V3{
 if(tau<0){const p=footOn(TR,AG,tau,1),b=.3*Math.abs(Math.sin(TR.dist(AG,tau)/2.2*Math.PI));return[p[0]+b,.11,p[1]];}
 if(tau<.55){const p=l2(A0,BP,tau/.55);return[p[0],.11,p[1]];}
 if(tau<BACK){const p=BP;return[p[0]+(tau-.55)*.4,.11,p[1]];}
 if(tau<T1){const u=(tau-BACK)/(T1-BACK),p=l2([BP[0]+.1,BP[1]],TP1,u);return[p[0],.11+4*.25*u*(1-u),p[1]];}
 if(tau<STEP){const u=(tau-T1)/(STEP-T1),p=l2(TP1,SP0,1-(1-u)*(1-u));return[p[0],.11,p[1]];}
 if(tau<SHOT){const u=(tau-STEP)/(SHOT-STEP),p=l2(SP0,SP,u);return[p[0],.11,p[1]];}
 if(tau<IN){const u=(tau-SHOT)/(IN-SHOT);return[lerp(SP[0],GIN[0],u),lerp(.11,GIN[1],u)+.12*Math.sin(Math.PI*u),lerp(SP[1],GIN[2],u)];}
 if(tau<NETHIT){const u=(tau-IN)/(NETHIT-IN);return lerp3(GIN,NETP,u);}
 const u=clamp((tau-NETHIT)/.5),e=1-(1-u)*(1-u);return[lerp(NETP[0],REST[0],e),lerp(NETP[1],REST[1],e),lerp(NETP[2],REST[2],e)];
}
const bulge=(tau:number)=>.9*bulgeAt(tau,NETHIT);
const passPts=(t0:number,t1:number,n=10):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++){const b=ballAt(lerp(t0,t1,i/n));o.push([b[0],b[2]]);}return o;};

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const TOUCHES=[T1,STEP];
const PH_KEYS:[number,number][]=(()=>{const o:[number,number][]=[[T1,Math.floor(TR.dist(AG,T1)/3.2)+touchPhase]];o.push([STEP,o[0][1]+1]);return o;})();
function gaitPh(tau:number){const f=(u:number)=>TR.dist(AG,u)/3.2,a=PH_KEYS[0],z=PH_KEYS[1];if(tau<a[0])return f(tau)+a[1]-f(a[0]);if(tau>z[0])return z[1]+f(tau)-f(z[0]);return key(tau,PH_KEYS,linear);}
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=TR.vel(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=TR.pos(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.role==='gk'||a.role==='def'||k===MB)yaw=sp>1.5&&a.role!=='gk'?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='qpr'||a.role==='def'?READY:stand();
 let p:Pose;
 if(k===AG){
  if(tau>.1&&tau<T1)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),.35*bump(.1,T1,tau));
  const s=clamp((sp-2)/4.5),ph=gaitPh(tau),run=runCycle(ph,{speed:.6+.4*s}),dr=dribble(ph,{foot:'r',speed:.55+.4*s});
  p=blendPose(idle,tau<-.4||(tau>.3&&tau<T1-.3)?run:dr,clamp((sp-.3)/.8));
  {const D=.6,u=(tau-(0-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.4}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
  p=over(p,{rHipF:40,rKnee:40,rAnk:-8,lean:16,neckP:30},bump(T1-.16,T1+.12,tau));
  // the sidestep: a quick drop of the hips to his right past the lunging defender
  p=over(p,{roll:12,bend:10,twist:-10,lean:22,lKnee:56,rKnee:50,lShA:70,neckY:-8},bump(STEP-.25,STEP+.3,tau));
  {const D=.75,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:1}),Math.min(sm(0,.12,u),1-sm(1,1.4,u)));}
  if(tau>NETHIT+.2)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(NETHIT+.2,NETHIT+.7,tau));
 }
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(TR.dist(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(TR.dist(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 if(k===MB){// under pressure, falling, the outstretched leg flicks it back; he ends on the grass
  p=over(p,{rHipF:70,rKnee:10,rAnk:30,rHipA:20,pitch:-30,roll:-24,lean:-10,lShA:80,rShA:60,air:.1},sm(BACK-.35,BACK,tau)*(1-sm(BACK+.5,BACK+.9,tau)*.2));
  if(tau>BACK+.25)p=over(p,{pitch:-70,roll:-60,lKnee:60,rKnee:40,lShA:90,rShA:90},sm(BACK+.25,BACK+.8,tau));
  yaw=lerpA(yaw,yawOf(TP1[0]-x,TP1[1]-z),bump(BACK-.5,BACK+.3,tau));}
 if(k===ON){// comes across and lunges for the ball; Agüero steps past
  const D=.8,u=(tau-(STEP-.6*D))/D;if(u>0&&u<1.6)p=blendPose(p,lunge(Math.min(1,u),{side:'l'}),Math.min(sm(0,.12,u),1-sm(1,1.6,u))*.9);
  if(tau>.6&&tau<2.4)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),bump(.6,2.4,tau));}
 if(k===GK&&tau>SHOT-.02)p=keeperDive(clamp((tau-SHOT+.02)/.8),{side:'l',height:.1});
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
function draw(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;trail?:number;before?:()=>void}={}){
 return play(s,c,v,tau,{n:ACTORS.length,pos:TR.pos,ball:ballAt,draw:(k:number,e:CastE,q:{passing:boolean;px:number})=>{
  const a=ACTORS[k],{p,yaw}=poseOf(k,tauP),big=e.h>=300,detail=q.passing?(k===AG?'mid':'low'):q.px<50||(!a.key&&q.px<110)?'low':'auto';
  return drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&a.key&&!q.passing?{prev:poseOf(k,tauPrev).p,smear:!!o.hero&&k===AG}:{});}},
  {minBall:o.minBall,trail:o.trail,trailFrom:SHOT,before:o.before});
}
const replay=(s:Sheet,c:Cam,v:View,tau:number,t:number,map:(t:number)=>number,before?:()=>void,trail=0)=>draw(s,c,v,tau,map(twos(t)),map(twos(t)-1/12),{minBall:5,hero:true,trail,before});

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const sc=CUEW(0,'and scores'),S=SECS(0);return key(t,mono([[0,-3.4],[CUEW(0,'Sergio'),-1.4],[CUEW(0,'plays'),-.3],[CUEW(0,'Mario'),BACK],[sc,SHOT+.1],[S+1,SHOT+.1+(S+1-sc)*.95]]),linear);};
const CAM1:V3=[82,19,86];
function cam1(t:number):Cam{
 const tau=tau1(t),S=SECS(0),sc=CUEW(0,'and scores');
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,IN));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,1.1,(b0[2]+b1[2]+b2[2])/3];
 const m=TR.pos(AG,tau),cel=sm(sc+.6,sc+1.8,t,easeInOutSine),T=lerp3(lerp3(bt,[97,1,6],.35*sm(CUEW(0,'Mario')-.5,sc,t,easeInOutSine)),[m[0],1.1,m[1]],cel);
 const F=key(t,mono([[0,4600],[CUEW(0,'Sergio'),5600],[CUEW(0,'Mario'),7200],[sc,7000],[sc+1.8,8400],[S,8600]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),sc=CUEW(0,'and scores');
  stadium(s,c,v,t,VENUE,[0,2,3],{roar:sm(sc,sc+.5,t),flash:sm(sc,sc+.3,t)*(1-sm(SECS(0)-.9,SECS(0)-.4,t))});
  ground(s,c,PITCH,{bulge:bulge(tau),ballZ:NETP[2],ballY:.4});
  draw(s,c,v,tau,tau1(twos(t)),tau1(twos(t)-1/12),{minBall:8,trail:tau>SHOT&&tau<NETHIT+.3?1:0});
 },
 aperture(t){const c=cam1(t),[x,z]=TR.pos(AG,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, high behind Agüero: he passes and keeps running; Balotelli, falling, pokes it back
const tau2=(t:number)=>key(t,mono([[0,-.9],[CUEW(1,'Agüero passes'),-.2],[CUEW(1,'keeps'),.3],[CUEW(1,'Balotelli'),.55],[CUEW(1,'falling'),.72],[CUEW(1,'pokes'),BACK],[SECS(1),T1+.1]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=TR.smooth(AG,tau),push=sm(CUEW(1,'Balotelli')-.3,SECS(1),t,easeInOutSine);
 return look([m[0]-8+2*push,6.5-1.5*push,m[1]+2],[lerp(m[0]+6,BP[0],.5),.6,lerp(m[1],BP[1]+2,.5)],1650+450*push);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),ap=CUEW(1,'Agüero passes'),kr=CUEW(1,'keeps'),bl=CUEW(1,'Balotelli'),fa=CUEW(1,'falling'),pk=CUEW(1,'pokes'),E=SECS(1);
  stadium(s,c,v,t,VENUE,[0,2]);
  ground(s,c,PITCH);
  // "Agüero passes": the pass's blue line to Balotelli; "keeps running into the box": his yellow run; "Balotelli, falling over": a ring
  // on him as he goes down; "pokes it back into his path": the return's blue line and a yellow ring where the two meet
  groundArrow(s,c,passPts(0,.55),B,sm(ap-.1,ap+.4,t,easeOut)*(1-sm(E-.5,E-.2,t)),61,.1);
  groundArrow(s,c,TR.path(AG,0,Math.max(.3,Math.min(tau+.5,T1)),12),Y,sm(kr-.2,kr+.4,t,easeOut)*(1-sm(E-.5,E-.2,t)),62,.14);
  groundArrow(s,c,passPts(BACK,T1),B,sm(pk-.1,pk+.4,t,easeOut),63,.1);
  groundRing(s,c,TP1[0],TP1[1],1.1,1.1,Y,sm(pk,pk+.4,t,easeOutBack)*(1-sm(E-.3,E-.1,t)),64,.2);
  replay(s,c,v,tau,t,tau2,()=>{const q=TR.pos(MB,tau);groundRing(s,c,q[0],q[1],1.2,1.2,B,sm(bl-.1,fa+.2,t,easeOutBack)*(1-sm(pk+.4,pk+.8,t)),65,.2);});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:4,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: one touch, the step past, the near corner
const tau3=(t:number)=>{const tw=CUEW(2,'and twenty');return key(t,mono([[0,T1-.4],[CUEW(2,'One touch'),T1-.1],[CUEW(2,'control'),T1+.05],[CUEW(2,'He steps'),STEP-.1],[CUEW(2,'smashes'),SHOT],[CUEW(2,'near corner'),IN],[tw,NETHIT+.9],[SECS(2),NETHIT+.9+(SECS(2)-tw)*.8]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=TR.smooth(AG,tau),u=sm(CUEW(2,'near corner')+.3,SECS(2),t,easeInOutSine);
 return look([117,7.5,1.5],[lerp(m[0],103,.4*(1-u)),1,lerp(m[1],3,.4*(1-u))],lerp(2500+700*sm(CUEW(2,'One touch')-.2,CUEW(2,'smashes'),t,easeInOutSine),3200,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),ot=CUEW(2,'One touch'),co=CUEW(2,'control'),hs=CUEW(2,'He steps'),sm_=CUEW(2,'smashes'),nc=CUEW(2,'near corner'),tw=CUEW(2,'and twenty'),E=SECS(2);
  stadium(s,c,v,t,VENUE,[0,1,3],{roar:sm(IN,IN+.3,tau),flash:sm(tw-.3,tw+.2,t)*(1-sm(E-.9,E-.5,t)),lamps:sm(tw-.2,tw+.3,t)});
  ground(s,c,PITCH,{goalLater:true});
  // "one touch to control": a yellow ring settles round the ball; "he steps past the defender": the red ring on the lunging defender and
  // Agüero's yellow step around him; "smashes it into the near corner": the shot line and a spark inside the near post; "ninety-three
  // minutes and twenty seconds": the crowd's flashes and the camera turns to him
  const bp=ballAt(Math.min(tau,T1+.2));groundRing(s,c,bp[0],bp[2],1,1,Y,sm(co-.1,co+.3,t,easeOutBack)*(1-sm(hs-.1,hs+.2,t)),71,.2);
  groundArrow(s,c,TR.path(AG,T1,SHOT,10),Y,sm(hs-.2,hs+.4,t,easeOut)*(1-sm(nc,nc+.4,t)),72,.12);
  airArrow(s,c,[ballAt(SHOT),ballAt(SHOT+.1),ballAt(SHOT+.2),ballAt(SHOT+.3),ballAt(IN)],Y,sm(sm_-.1,sm_+.3,t,easeOut)*(1-sm(tw,tw+.4,t)),73,.08);
  const r=replay(s,c,v,tau,t,tau3,()=>{const q=TR.pos(ON,tau);groundRing(s,c,q[0],q[1],1.1,1.1,R,sm(hs-.15,hs+.25,t,easeOutBack)*(1-sm(sm_+.2,sm_+.5,t)),74,.2);},tau>SHOT&&tau<NETHIT+.4?1-sm(NETHIT,NETHIT+.4,tau):0);
  bootRing(s,r.res[AG],'r',Y,Math.max(sm(ot-.1,ot+.2,t,easeOutBack)*(1-sm(co+.3,co+.6,t)),sm(sm_-.3,sm_,t,easeOutBack)*(1-sm(sm_+.35,sm_+.7,t))));
  goal3(s,c,105,1,bulge(tau),NETP[2],.4);
  spark(s,c,GIN,(tau-IN)*1.2,.45,75);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=TR.pos(AG,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4,
};

// ---------------------------------------------------------------- 4 · the lesson: side-on, the one-two again
const tau4=(t:number)=>key(t,mono([[0,-.6],[CUEW(3,'never'),-.2],[CUEW(3,'A quick'),.2],[CUEW(3,'in the box'),BACK],[CUEW(3,'last'),SHOT+.1],[SECS(3),IN+.4]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=TR.smooth(AG,Math.min(tau,SHOT)),push=sm(CUEW(3,'A quick')-.3,CUEW(3,'last'),t,easeInOutSine),w=.3+.3*push,T:V3=[lerp(m[0],101,w),.9,lerp(m[1],4,w)];
 return look([T[0]-6,6-1.2*push,T[2]+17-3*push],T,1650+350*push);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),ns=CUEW(3,'never'),aq=CUEW(3,'A quick'),ib=CUEW(3,'in the box'),lm=CUEW(3,'last'),E=SECS(3);
  stadium(s,c,v,t,VENUE,[0,2]);
  ground(s,c,PITCH,{bulge:bulge(tau),ballZ:NETP[2],ballY:.4});
  // "never stop believing": a yellow ring round Agüero, running; "a quick one-two": the pass and the return as two blue lines forming a
  // triangle; "in the box": the box edge printed yellow; "in the last minute": a spark in the net
  const m=TR.pos(AG,tau);
  groundArrow(s,c,passPts(0,.55),B,sm(aq-.2,aq+.3,t,easeOut)*(1-sm(E-.5,E-.2,t)),81,.1);
  groundArrow(s,c,passPts(BACK,T1),B,sm(aq+.3,aq+.8,t,easeOut)*(1-sm(E-.5,E-.2,t)),82,.1);
  groundArrow(s,c,[[88.5,-8],[88.5,0],[88.5,8],[88.5,16],[88.5,20.2]],Y,sm(ib-.2,ib+.4,t,easeOut)*(1-sm(E-.5,E-.2,t)),83,.07);
  const r=replay(s,c,v,tau,t,tau4,()=>groundRing(s,c,m[0],m[1],1.1,1.1,Y,sm(ns-.1,ns+.3,t,easeOutBack)*(1-sm(aq+.2,aq+.5,t)),84,.18));
  bootRing(s,r.res[AG],'r',Y,sm(lm-.3,lm,t,easeOutBack)*(1-sm(E-.4,E-.15,t)));
  spark(s,c,GIN,(tau-IN)*1.2,.45,85);
 },
 still:3.6,
};

const film:RisoStory={
 id:ID,format:'11v11',title:'Agüero at 93:20',theme:'Never stop believing: a quick one-two in the box can win a match in the last minute',
 ageNote:'Premier League final day, Manchester City 3–2 Queens Park Rangers, Etihad Stadium, Manchester, 13 May 2012 (93:20). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of sunlit turf and a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){touchTurf(s,x,y,age,seed,Y,B);},
};
export default film;
