/** Jordi Alba — "The Sprint and Finish in the Euro Final" (lib/town/iconicPlays.json: kind "moment", template solo_dribble_goal, side left,
 * beaten 1, distance box, foot left; lesson "When a teammate looks up, sprint into the space behind the defence."). An iconic-play riso
 * film (RisoStory, chapters mode): a 1:1 reconstruction, from WRITTEN accounts (the footage itself was not reviewed frame by frame), of
 * Spain's second goal in the UEFA Euro 2012 final, Spain 4–0 Italy, Olympic Stadium, Kyiv, Sunday 1 July 2012 (night, floodlit), 41st minute.
 *
 * SOURCES (read 26 Sep 2026 with curl / web search, cached under scratchpad/six/):
 *  - Wikipedia, "UEFA Euro 2012 final": "Spain then doubled their lead four minutes before half-time when, after a period of passing around
 *    their defence, Casillas sent a long ball which was eventually picked up by Xavi. He then passed to Alba, who capped a long forward run
 *    with a left-footed finish past Buffon"; "Alba of Valencia played on the left".
 *  - UEFA.com, "Magic moments: Alba on 2012 final goal" (via the search record): "Alba initially picked up the ball in his own half, but a
 *    50-metre sprint forward allowed him to latch onto Xavi Hernández's pass and fire past Gianluigi Buffon"; Alba: "I got it in my own half
 *    and gave it to Xavi. We weren't really playing with any strikers so I just ran forward without thinking about it"; "Xavi slipped the
 *    ball between Leonardo Bonucci and Andrea Barzagli for the full-back to control and curl past Gianluigi Buffon"; his first
 *    international goal. CNN / AP (via the search record): 41 minutes, "ran onto a sublime through-ball from Xavi … slotted a left-foot shot
 *    past … Buffon".
 *  - Card facts: Spain (playerAppearance: skin 1, hair 0, short, stubble); Alba wore 18 for Spain; Xavi 8.
 * CONFIRMED: the match, venue, date, 41st minute, 1–0 → 2–0 (final 4–0); Alba (on the LEFT) got the ball in his OWN HALF, GAVE IT TO XAVI
 *  and SPRINTED about 50 METRES forward; Xavi slipped it BETWEEN BONUCCI AND BARZAGLI; Alba CONTROLLED it and finished with his LEFT FOOT
 *  past BUFFON; his first goal for Spain.
 * INFERRED (illustrative; never narrated): every position, path and timing (Alba from ~38 m to ~16 m from goal, left of centre); the touch
 *  and shot spots; that the control was also with the left foot; where the shot went (drawn: low, curled inside the far post) and Buffon's
 *  dive (drawn: low to his left); the other players (Bonucci and Barzagli placed as the two centre-backs either side of the gap, the rest
 *  unnamed, no numbers except Xavi's 8); kits — Spain in red shirts with dark navy shorts and socks, Italy in white, Buffon drawn in dark
 *  navy; the running track (drawn blue) and the bowl; which end Spain attacked on the TV picture (drawn: screen-right, Alba on the far
 *  side); the celebration; every camera.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window, never sheet.safe): 1 = the high main-stand camera in near real time
 * (Alba → Xavi → the sprint → the pass through → the finish); 2 = slow replay from a HIGH camera behind Alba (his 50 m run, the space behind,
 * the pass between the two centre-backs into his path); 3 = replay from BEHIND THE GOAL (the touch, the left-foot finish past Buffon);
 * 4 = the lesson, low behind Xavi (a teammate looks up → sprint → into the space behind). All bodies go through ONE adapter, drawPlayer() →
 * athlete.ts. The world is right-handed like athlete.ts (X toward Italy's goal at 105, Y up, +Z = the near touchline under the main camera),
 * so a figure attacking +X has its LEFT side at −Z: Spain's left wing is the far side and Alba's LEFT boot plays with no mirrored projector.
 * Shared machinery: ./tv-kit-six.ts. Scenes read only (t, c); seeded randomness only. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,polyPath,easeOut,easeOutBack,easeInOutSine,linear} from '../../paths/riso/motion';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type V3,type DrawResult} from './athlete';
import {Y,K,estimate,cueFn,mono,lerp3,lerpA,yawOf,bump,over,frame,look,toCam,scr,polyP,stadium,ground,goal3,bulgeAt,tracks,footOn,play,
 streaks,groundArrow,groundRing,bootRing,spark,touchTurf,type Cam,type View,type Venue,type Pitch,type CastE} from './tv-kit-six';

const ID='alba-euro-final-2012',R='red',B='blue';
// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Kyiv, 2012: the Euro final, Spain against Italy. Jordi Alba passes to Xavi in his own half... and keeps running! Xavi slides the ball through. Alba finishes with his left foot. Two nil to Spain!',tail:1.8,
  cues:['Kyiv','the Euro','Spain against','Jordi Alba','passes to Xavi','and keeps','Xavi slides','Alba finishes','left foot','Two nil']},
 {label:'Watch it again',text:'Watch again. Alba sprints fifty metres, into the space behind the defence. The pass goes between two defenders, right into his path.',tail:1.2,
  cues:['Watch again','Alba sprints','into the space','The pass','between two','right into']},
 {label:'The finish',text:'One touch to control it, then he slots it past Gianluigi Buffon. His first goal for Spain!',tail:1.8,
  cues:['One touch','control','slots','Gianluigi Buffon','His first']},
 {label:'Your turn',text:'Your turn: when a teammate looks up, sprint into the space behind the defence!',tail:1.5,
  cues:['Your turn','when a teammate','looks up','sprint','behind the defence']},
];
/** VOICE: the Kokoro narration (scripts/plays/kokoro-narrate.py alba-euro-final-2012 → timing.json): withTiming re-times the film. */
import timingJson from '../../../public/plays/narration/alba-euro-final-2012/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail,ID);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUEW=cueFn(CHAPTERS,ID),SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- venue + kits
/** Kyiv's Olympic Stadium at night: a big two-tier bowl behind a running track (inferred look), one roof ring */
const VENUE:Venue={sky:'night',crowd:[[R,4],[Y,2],['paper',3],[B,2]],fill:.8,gap:9,tiers:.5,seed:31};
const PITCH:Pitch={grass:[[Y,.88],[B,.55]],stripe:[B,.18],track:B,gap:9};
const SKIN:InkFill[]=[[Y,.34],[R,.22]],SKIN_S:InkFill[]=[[Y,.36],[R,.26],[K,.04]],SKIN_M:InkFill[]=[[Y,.42],[R,.32],[K,.12]];
/** Spain: red shirts with yellow trim, dark navy shorts and socks (inferred detail) */
const ESP=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],trim:[Y,.9],shorts:[K,.92],socks:[K,.92],boots:K,numberInk:Y,skin:SKIN_M,hair:[K,.95],hairStyle:'short',line:K,shade:[K,.25],sleeves:'short',seed:5,...o});
/** Alba: number 18, about 1.70 m, quick and compact, short dark hair */
const ALBA_ST=ESP({number:18,skin:SKIN_M,hair:[K,.95],build:{height:1.7,bulk:.95},seed:18});
/** Italy: white shirts with blue trim, white shorts and socks (inferred) */
const ITA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:[B,.85],shorts:'paper',socks:'paper',boots:K,skin:SKIN_S,hair:[K,.95],hairStyle:'short',line:K,shade:[B,.3],sleeves:'short',seed:3,...o});
const GK_ST:AthleteStyle={shirt:[K,.85],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN,hair:[K,.9],hairStyle:'short',line:K,shade:[B,.4],gloves:'paper',sleeves:'long',trim:Y,build:{height:1.91,bulk:1.05},seed:23};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the play: tracks (τ = seconds after Alba's pass to Xavi)
type Actor={role:'hero'|'esp'|'ita'|'cb'|'gk';style:AthleteStyle;keys:number[][];key?:boolean};
const XR=.85,XP=4.6,T1=5.65,SHOT=6.15,IN=SHOT+.6,NETHIT=IN+.12;
const ACTORS:Actor[]=[
 {role:'hero',style:ALBA_ST,key:true,keys:[[-3,33,-22],[-1.5,36,-21],[0,38.4,-19.6],[1,45,-17.5],[2,53.5,-15],[3,62,-12.6],[4,71,-10],[4.6,76.2,-8.6],[5.2,82.2,-7],[5.65,86.4,-5.9],[6.15,89.4,-4.8],[6.8,92.4,-4.2],[8,95,-6],[10,96,-12]]},
 {role:'esp',style:ESP({number:8,skin:SKIN_S,build:{height:1.7},seed:8}),key:true,keys:[[-3,43,-8],[0,46,-8.8],[.85,47.3,-9.2],[2,53,-8.2],[3.5,60.5,-6.6],[4.6,64.4,-6],[6,66,-5],[10,70,-3]]},
 {role:'cb',style:ITA({seed:41,build:{height:1.87},skin:SKIN_M}),key:true,keys:[[-3,70,-11],[0,72,-11.5],[3,78,-11],[4.6,82.4,-10.6],[5.4,85,-9.4],[6.2,88,-7.5],[10,90,-6]]},
 {role:'cb',style:ITA({seed:42,build:{height:1.9},skin:SKIN_S}),key:true,keys:[[-3,70,-1],[0,72,-1.8],[3,78.5,-2.4],[4.6,83,-2.6],[5.4,86.4,-3.2],[6.2,89.5,-3.4],[10,92,-2]]},
 {role:'gk',style:GK_ST,key:true,keys:[[-3,102.5,-.5],[4,101.8,-1],[5.6,100.8,-1.8],[6.1,100.4,-2],[10,100.4,-2]]},
 {role:'ita',style:ITA({seed:43,skin:SKIN_M}),keys:[[-3,64,-24],[0,67,-22],[4.6,79,-18],[6.2,85,-14],[10,90,-10]]},
 {role:'ita',style:ITA({seed:44,skin:SKIN_S,hairStyle:'long'}),keys:[[-3,56,2],[0,56,2.5],[3,59,3],[4.6,62,3.5],[8,70,3]]},
 {role:'ita',style:ITA({seed:45,skin:SKIN_M}),keys:[[-3,66,14],[0,69,12],[4.6,79,8],[6.2,86,5],[10,90,3]]},
 {role:'ita',style:ITA({seed:46,skin:SKIN_S}),keys:[[-3,52,8],[0,53,6],[4.6,60,3],[8,68,2]]},
 {role:'esp',style:ESP({seed:17,skin:SKIN_S}),keys:[[-3,60,4],[0,64,3],[4.6,78,4],[6.2,86,3.5],[10,92,4]]},
 {role:'esp',style:ESP({seed:19,skin:SKIN,build:{height:1.73}}),keys:[[-3,55,16],[0,59,15],[4.6,72,12],[8,82,9]]},
 {role:'esp',style:ESP({seed:20,skin:SKIN_M}),keys:[[-3,40,5],[0,42,4],[4.6,50,2],[8,56,1]]},
];
const AL=0,XA=1,CB1=2,CB2=3,GK=4;
const TR=tracks(ACTORS.map(a=>a.keys),-5,11);
// ---------------------------------------------------------------- the ball: Alba → Xavi → Xavi's carry → the pass between the centre-backs → the touch → the finish
const A0=footOn(TR,AL,0,-1),XT=footOn(TR,XA,XR,1),XPP=footOn(TR,XA,XP,1),TP1=footOn(TR,AL,T1,-1),SP=footOn(TR,AL,SHOT,-1);
const GIN:V3=[105.05,.3,2.7],NETP:V3=[106.7,.35,2.9],REST:V3=[106.3,.11,2.9];
const l2=(a:[number,number],b:[number,number],u:number):[number,number]=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
function ballAt(tau:number):V3{
 if(tau<0){const p=footOn(TR,AL,tau,-1);return[p[0],.11,p[1]];}
 if(tau<XR){const p=l2(A0,XT,tau/XR);return[p[0],.11,p[1]];}
 if(tau<XP){const p=footOn(TR,XA,tau,1),b=.3*Math.abs(Math.sin(TR.dist(XA,tau)/2.2*Math.PI));return[p[0]+b,.11,p[1]];}
 if(tau<T1){const u=(tau-XP)/(T1-XP),p=l2(XPP,TP1,u*(1.15-.15*u));return[p[0],.11,p[1]];}
 if(tau<SHOT){const u=(tau-T1)/(SHOT-T1),p=l2(TP1,SP,1-(1-u)*(1-u));return[p[0],.11,p[1]];}
 if(tau<IN){const u=(tau-SHOT)/(IN-SHOT),bend=Math.sin(Math.PI*u)*.9;return[lerp(SP[0],GIN[0],u),lerp(.11,GIN[1],u)+.25*Math.sin(Math.PI*u),lerp(SP[1],GIN[2],u)-bend];}
 if(tau<NETHIT){const u=(tau-IN)/(NETHIT-IN);return lerp3(GIN,NETP,u);}
 const u=clamp((tau-NETHIT)/.5),e=1-(1-u)*(1-u);return[lerp(NETP[0],REST[0],e),lerp(NETP[1],REST[1],e),lerp(NETP[2],REST[2],e)];
}
const bulge=(tau:number)=>.7*bulgeAt(tau,NETHIT);
const passPath=(n=12):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++){const b=ballAt(lerp(XP,T1,i/n));o.push([b[0],b[2]]);}return o;};

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const PH0=Math.floor(TR.dist(AL,T1)/3.3)+touchPhase;
function gaitPh(tau:number){const f=(u:number)=>TR.dist(AL,u)/3.3;if(tau<T1)return f(tau)+PH0-f(T1);if(tau>SHOT)return PH0+1+f(tau)-f(SHOT);return key(tau,[[T1,PH0],[SHOT,PH0+1]],linear);}
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=TR.vel(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=TR.pos(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ita'||a.role==='cb'?READY:stand();
 let p:Pose;
 if(k===AL){
  // a glance back at Xavi mid-sprint, then eyes on the ball coming through
  if(tau>2.4&&tau<XP+.6)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),.3*bump(2.4,XP+.6,tau));
  const s=clamp((sp-2)/5),ph=gaitPh(tau),run=runCycle(ph,{speed:.7+.3*s}),dr=dribble(ph,{foot:'l',speed:.7+.3*s});
  p=blendPose(idle,tau<T1-.35?run:dr,clamp((sp-.3)/.8));
  // the pass to Xavi (left foot, inferred) at τ 0
  {const D=.7,u=(tau-(0-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.5}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
  // the control, then the left-foot finish
  p=over(p,{lHipF:40,lKnee:40,lAnk:-8,lean:16,neckP:30},bump(T1-.16,T1+.12,tau));
  {const D=.75,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.65}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
  if(tau>NETHIT+.2)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(NETHIT+.2,NETHIT+.7,tau));
 }
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(TR.dist(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(TR.dist(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 if(k===XA){// takes it, carries, LOOKS UP (head up, turned toward Alba's run), then slides it through with the right foot
  if(tau>XR&&tau<XP){p=blendPose(p,dribble(TR.dist(XA,tau)/2.2,{foot:'r',speed:.5}),clamp((sp-.3)/.8));}
  const al=TR.pos(AL,tau);p=over(p,{neckP:-18},bump(XP-1.6,XP-.1,tau));if(tau>XP-1.6&&tau<XP+.2)yaw=lerpA(yaw,yawOf(al[0]+6-x,al[1]-z),.5*bump(XP-1.6,XP+.2,tau));
  const D=.7,u=(tau-(XP-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.45}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(a.role==='cb'&&tau>XP-.2&&tau<T1+.3)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),bump(XP-.2,T1+.3,tau));
 if(k===GK){const t0=SHOT-.05;if(tau>t0)p=keeperDive(clamp((tau-t0)/.8),{side:'l',height:0});}
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
function draw(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;trail?:number;before?:()=>void}={}){
 return play(s,c,v,tau,{n:ACTORS.length,pos:TR.pos,ball:ballAt,draw:(k:number,e:CastE,q:{passing:boolean;px:number})=>{
  const a=ACTORS[k],{p,yaw}=poseOf(k,tauP),big=e.h>=300,detail=q.passing?(k===AL?'mid':'low'):q.px<50||(!a.key&&q.px<110)?'low':'auto';
  return drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&a.key&&!q.passing?{prev:poseOf(k,tauPrev).p,smear:!!o.hero&&k===AL}:{});}},
  {minBall:o.minBall,trail:o.trail,trailFrom:SHOT,before:o.before});
}
const replay=(s:Sheet,c:Cam,v:View,tau:number,t:number,map:(t:number)=>number,before?:()=>void,trail=0)=>draw(s,c,v,tau,map(twos(t)),map(twos(t)-1/12),{minBall:5,hero:true,trail,before});

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const tn=CUEW(0,'Two'),S=SECS(0);return key(t,mono([[0,-2.6],[CUEW(0,'Jordi'),-.8],[CUEW(0,'passes'),0],[CUEW(0,'and keeps'),1.2],[CUEW(0,'Xavi slides'),XP-.3],[CUEW(0,'Alba finishes'),T1-.1],[CUEW(0,'left'),SHOT],[tn,IN+.4],[S+1,IN+.4+(S+1-tn)*.95]]),linear);};
const CAM1:V3=[66,22,94];
function cam1(t:number):Cam{
 const tau=tau1(t),S=SECS(0),tn=CUEW(0,'Two');
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,IN));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const al=TR.pos(AL,tau),mid:V3=[lerp(bt[0],al[0],.35*sm(CUEW(0,'and keeps')-.3,CUEW(0,'and keeps')+.5,t)*(1-sm(CUEW(0,'Xavi slides'),CUEW(0,'Alba finishes'),t))),1.4,lerp(bt[2],al[1],.35)];
 const goalward=.35*sm(CUEW(0,'Alba finishes')-.3,tn,t,easeInOutSine),T=lerp3(mid,[99,1,0],goalward);
 const F=key(t,mono([[0,5600],[CUEW(0,'passes'),6400],[CUEW(0,'and keeps'),5200],[CUEW(0,'Xavi slides'),5600],[CUEW(0,'Alba finishes'),8000],[tn,7600],[S,8200]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tn=CUEW(0,'Two');
  stadium(s,c,v,t,VENUE,[0,2,3],{roar:sm(tn-.3,tn+.3,t),flash:sm(tn-.2,tn+.2,t)*(1-sm(SECS(0)-.9,SECS(0)-.4,t))});
  ground(s,c,PITCH,{bulge:bulge(tau),ballZ:NETP[2],ballY:.3});
  draw(s,c,v,tau,tau1(twos(t)),tau1(twos(t)-1/12),{minBall:8,trail:tau>SHOT&&tau<NETHIT+.3?1:0});
 },
 aperture(t){const c=cam1(t),[x,z]=TR.pos(AL,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, high behind Alba: the 50 m sprint, the space, the pass between the two centre-backs
const tau2=(t:number)=>key(t,mono([[0,.6],[CUEW(1,'Alba sprints'),1.3],[CUEW(1,'into the space'),3.2],[CUEW(1,'The pass'),XP-.05],[CUEW(1,'between'),XP+.35],[CUEW(1,'right into'),T1-.1],[SECS(1),T1+.25]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=TR.smooth(AL,tau),back=sm(CUEW(1,'The pass')-.3,SECS(1),t,easeInOutSine);
 const T:V3=[m[0]+12+2*back,.5,m[1]+4.5],C:V3=[m[0]-9+2*back,7.5-1.5*back,m[1]-6.5];
 return look(C,T,1500+300*back);
}
/** the space behind the defence: a yellow screen between the two centre-backs and the keeper, toward Alba's side */
function space(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const a=TR.pos(CB1,tau),b=TR.pos(CB2,tau),g=polyP(c,[[a[0]+1.5,.02,a[1]-1],[b[0]+1.5,.02,b[1]+.5],[97,.02,b[1]+1.5],[97,.02,a[1]-2]]);
 if(g.length<3)return;const p=polyPath(g,true);s.knockout(p,.45*w);s.tone(Y,p,.6*w);}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),as=CUEW(1,'Alba sprints'),is=CUEW(1,'into the space'),tp=CUEW(1,'The pass'),bt=CUEW(1,'between'),ri=CUEW(1,'right into'),E=SECS(1);
  stadium(s,c,v,t,VENUE,[0,2]);
  ground(s,c,PITCH);
  // "sprints fifty metres": his yellow run line from where he gave it to Xavi; "the space behind the defence": the yellow screen;
  // "between two defenders": red rings on the two centre-backs and the pass's line through the gap; "right into his path": a ring
  // where ball and runner meet
  groundArrow(s,c,TR.path(AL,0,Math.max(.4,Math.min(tau+.3,T1)),18),Y,sm(as-.2,as+.6,t,easeOut)*(1-sm(E-.6,E-.3,t)),61,.14);
  space(s,c,Math.min(tau,XP+.4),sm(is-.2,is+.4,t,easeOut)*(1-sm(ri,ri+.4,t)));
  groundArrow(s,c,passPath(),B,sm(tp-.1,tp+.5,t,easeOut)*(1-sm(E-.5,E-.2,t)),62,.1);
  groundRing(s,c,TP1[0],TP1[1],1.3,1.3,Y,sm(ri-.15,ri+.3,t,easeOutBack)*(1-sm(E-.4,E-.15,t)),63,.2);
  replay(s,c,v,tau,t,tau2,()=>{for(const [k,sd] of [[CB1,64],[CB2,65]] as [number,number][]){const q=TR.pos(k,tau);groundRing(s,c,q[0],q[1],1.1,1.1,R,sm(bt-.15,bt+.25,t,easeOutBack)*(1-sm(ri+.2,ri+.6,t)),sd,.2);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the touch, the left-foot finish past Buffon
const tau3=(t:number)=>{const hf=CUEW(2,'His first');return key(t,mono([[0,T1-.55],[CUEW(2,'One touch'),T1-.1],[CUEW(2,'control'),T1+.05],[CUEW(2,'slots'),SHOT],[CUEW(2,'Gianluigi'),SHOT+.35],[hf,NETHIT+.5],[SECS(2),NETHIT+.5+(SECS(2)-hf)*.8]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=TR.smooth(AL,tau),u=sm(CUEW(2,'His first')-.3,SECS(2),t,easeInOutSine);
 // fixed behind the goal, up over the bar; on "his first goal" it pushes in on Alba (never through the goal frame)
 const C0:V3=[115,5.2,8.5],T0:V3=[lerp(m[0],100,.3*(1-u)),1,lerp(m[1],0,.3*(1-u))];
 return look(C0,T0,lerp(3000+700*sm(CUEW(2,'One touch')-.3,CUEW(2,'slots'),t,easeInOutSine),5200,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),ot=CUEW(2,'One touch'),co=CUEW(2,'control'),sl=CUEW(2,'slots'),gb=CUEW(2,'Gianluigi'),hf=CUEW(2,'His first');
  stadium(s,c,v,t,VENUE,[0,1,3],{roar:sm(IN,IN+.3,tau),flash:sm(hf-.3,hf+.2,t)*(1-sm(SECS(2)-.9,SECS(2)-.5,t)),lamps:sm(hf-.2,hf+.3,t)});
  ground(s,c,PITCH,{goalLater:true});
  // "one touch to control it": a yellow ring settles round the ball at his feet; "slots it": the shot's yellow line into the corner;
  // "past Gianluigi Buffon": a red ring round the keeper going down; "his first goal for Spain": the camera swings to him
  const bp=ballAt(Math.min(tau,SHOT));groundRing(s,c,bp[0],bp[2],1,1,Y,sm(co-.1,co+.3,t,easeOutBack)*(1-sm(sl-.2,sl+.1,t)),71,.2);
  const shot:[number,number][]=[];for(let i=0;i<=10;i++){const b=ballAt(lerp(SHOT,IN,i/10));shot.push([b[0],b[2]]);}groundArrow(s,c,shot,Y,sm(sl-.15,sl+.4,t,easeOut)*(1-sm(hf,hf+.4,t)),72,.1);
  const r=replay(s,c,v,tau,t,tau3,()=>{const g=TR.pos(GK,tau);groundRing(s,c,g[0],g[1],1.3,1.3,R,sm(gb-.15,gb+.25,t,easeOutBack)*(1-sm(hf,hf+.4,t)),73,.2);},tau>SHOT&&tau<NETHIT+.4?1-sm(NETHIT,NETHIT+.4,tau):0);
  bootRing(s,r.res[AL],'l',Y,Math.max(sm(ot-.1,ot+.2,t,easeOutBack)*(1-sm(co+.3,co+.6,t)),sm(sl-.3,sl,t,easeOutBack)*(1-sm(sl+.35,sl+.7,t))));
  goal3(s,c,105,1,bulge(tau),NETP[2],.3);spark(s,c,GIN,(tau-IN)*1.4,.4,74);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=TR.pos(AL,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4,
};

// ---------------------------------------------------------------- 4 · the lesson: low behind Xavi as he looks up
const tau4=(t:number)=>key(t,mono([[0,2.6],[CUEW(3,'when'),3],[CUEW(3,'looks'),3.5],[CUEW(3,'sprint'),4.1],[CUEW(3,'behind'),XP+.3],[SECS(3),T1]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),x=TR.smooth(XA,Math.min(tau,XP)),al=TR.pos(AL,tau),back=sm(CUEW(3,'sprint'),SECS(3),t,easeInOutSine);
 const T:V3=[lerp(x[0]+9,al[0],.45+.2*back),1,lerp(x[1],al[1],.45)];
 return look([x[0]-5-2*back,2.4+1.2*back,x[1]+3.4],T,1700-150*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),wt=CUEW(3,'when'),lu=CUEW(3,'looks'),sp=CUEW(3,'sprint'),bd=CUEW(3,'behind'),E=SECS(3);
  stadium(s,c,v,t,VENUE,[0,2]);
  ground(s,c,PITCH);
  // "when a teammate looks up": a yellow ring round Xavi, his head lifting; "sprint": Alba's yellow run; "into the space behind the
  // defence": the yellow screen behind the two centre-backs, and the pass arriving in it
  const x=TR.pos(XA,tau);groundRing(s,c,x[0],x[1],1.2,1.2,Y,sm(wt-.1,wt+.3,t,easeOutBack)*(1-sm(sp+.3,sp+.7,t)),81,.18);
  groundArrow(s,c,TR.path(AL,Math.max(0,tau-2),Math.min(T1,tau+.6),14),Y,sm(sp-.2,sp+.4,t,easeOut)*(1-sm(E-.5,E-.2,t)),82,.14);
  space(s,c,Math.min(tau,XP+.4),sm(bd-.3,bd+.3,t,easeOut)*(1-sm(E-.4,E-.15,t)));
  groundArrow(s,c,passPath(),B,sm(bd,bd+.5,t,easeOut),83,.1);
  const r=replay(s,c,v,tau,t,tau4);
  // "looks up": a small yellow spark at Xavi's eyes
  const h=r.res[XA];if(h){const f=h.joints.face,a=sm(lu-.1,lu+.2,t,easeOutBack)*(1-sm(lu+.6,lu+.9,t));if(a>0){const pth=polyPath([[f[0]-26*a,f[1]-30*a],[f[0],f[1]-60*a],[f[0]+26*a,f[1]-30*a]],false);s.stroke(Y,pth,Math.max(6,10*a),.95);}}
 },
 still:3.6,
};

const film:RisoStory={
 id:ID,format:'11v11',title:'Alba’s sprint in the Euro final',theme:'When a teammate looks up, sprint into the space behind the defence',
 ageNote:'UEFA Euro 2012 final, Spain 4–0 Italy, Olympic Stadium, Kyiv, 1 July 2012 (41st minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf and a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){touchTurf(s,x,y,age,seed,Y,R);},
};
export default film;
