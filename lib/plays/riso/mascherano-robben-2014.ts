/** Javier Mascherano — "The Tackle on Robben" (lib/town/iconicPlays.json: kind "moment", template last_ditch_tackle, side center; lesson
 * "Stay on your feet as long as you can, and only slide when you are sure you can reach the ball."). An iconic-play riso film (RisoStory,
 * chapters mode): a 1:1 reconstruction, from WRITTEN accounts (the footage itself was not reviewed frame by frame), of the block in the
 * 2014 FIFA World Cup semi-final, Netherlands 0–0 Argentina (Argentina won 4–2 on penalties), Arena de São Paulo, Wednesday 9 July 2014
 * (a cold evening under floodlights), on the stroke of 90 minutes.
 *
 * SOURCES (read 26 Sep 2026 with curl, cached under scratchpad/six/):
 *  - Socceroos.com.au / AAP, "Mascherano: I tackled doubts to block Robben" (soc.txt): "Mascherano lunged to block an Arjen Robben shot on
 *    the stroke of 90 minutes in their semi-final in Sao Paulo"; "tracked Robben's run into the left side of the area, and stopped the …
 *    shot with the bottom of his boot"; Mascherano: "I thought I'd slip, I thought I wouldn't make it, I thought he'd get ahead of me";
 *    "He played a great exchange with (Wesley) Sneijder but, because of that extra touch, he didn't quite hit it so early, it gave me the
 *    possibility, that extra split second"; "The team was lucky Robben took one more touch."
 *  - ESPN match report (espn-m.txt): Arena Corinthians, "a cold night"; "Sneijder glanced a diagonal pass into Robben's path, but Javier
 *    Mascherano came to the rescue for Argentina, and the game went to extra time"; 0–0 after 120 minutes, 4–2 on penalties (Romero saved
 *    from Vlaar and Sneijder).
 *  - Wikipedia, "2014 FIFA World Cup knockout stage" (semi-final, 9 July 2014, São Paulo).
 *  - Card facts: Argentina (playerAppearance: skin 1, hair 0, short, stubble); Mascherano wore 14 for Argentina; Robben 11 for the Netherlands.
 * CONFIRMED: the match, venue, date, 0–0 and the result; the last minute of normal time; Robben's EXCHANGE WITH SNEIJDER (a diagonal pass
 *  back into his path); Robben broke into the LEFT SIDE OF THE AREA; he took ONE MORE TOUCH; Mascherano TRACKED the run and LUNGED, blocking
 *  the shot with the BOTTOM OF HIS BOOT.
 * INFERRED (illustrative; never narrated): every position, path and timing (the exchange ~25 m out, the block ~10 m out, left of centre);
 *  "left side" read from the attackers' view; Robben's shooting foot (drawn: his left, his strong foot) and Mascherano's sliding leg
 *  (drawn: his left, reaching across); where the blocked ball went (drawn: spinning away wide toward the byline); the other players
 *  (unnamed, no numbers); kits — the Netherlands in orange, Argentina in their dark blue change kit, Romero in yellow; which end the Dutch
 *  attacked on the TV picture (drawn: screen-right); the bowl and crowd; every camera.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window, never sheet.safe): 1 = the high main-stand camera in near real time
 * (the exchange → Robben in on goal → Mascherano's chase and block); 2 = slow replay LOW behind the pair (Robben in behind, Mascherano on
 * his feet, tracking); 3 = replay low from in FRONT, by the goal (the extra touch, the slide, the sole of the boot on the ball); 4 = the
 * lesson, side-on (stay on your feet → only slide when you can reach it). All bodies go through ONE adapter, drawPlayer() → athlete.ts.
 * The world is right-handed like athlete.ts (X toward Argentina's goal at 105, Y up, +Z = the near touchline under the main camera), so a
 * Dutch attacker facing +X has his LEFT side at −Z: the left side of the area is −Z. Shared machinery: ./tv-kit-six.ts. Inks: yellow,
 * orange (the Dutch), blue (Argentina), navy. Scenes read only (t, c); seeded randomness only. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,easeOut,easeOutBack,easeInOutSine,linear} from '../../paths/riso/motion';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,strike,keeperSet,slideTackle,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type V3,type DrawResult} from './athlete';
import {Y,K,estimate,cueFn,mono,lerp3,lerpA,yawOf,bump,over,frame,look,toCam,scr,stadium,ground,tracks,footOn,play,
 streaks,groundArrow,groundRing,bootRing,spark,touchTurf,type Cam,type View,type Venue,type Pitch,type CastE} from './tv-kit-six';

const ID='mascherano-robben-2014',O='orange',B='blue';
// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The block, live',text:'São Paulo, 2014: the World Cup semi-final, Netherlands against Argentina. The last minute, and no goals yet. Arjen Robben breaks into the box... but Javier Mascherano chases him down and blocks the shot!',tail:1.8,
  cues:['São Paulo','the World Cup','Netherlands against','The last','Arjen Robben','breaks into','but Javier','chases','blocks']},
 {label:'Watch it again',text:'Watch again. Robben gets in behind. Mascherano does not give up. He stays on his feet and tracks the run.',tail:1.2,
  cues:['Watch again','Robben gets','Mascherano does','He stays','tracks']},
 {label:'The slide',text:'Robben takes one more touch. Now Mascherano slides, and blocks it with the bottom of his boot!',tail:1.8,
  cues:['Robben takes','one more','Now Mascherano','slides','blocks','bottom of his boot']},
 {label:'Your turn',text:'Your turn: stay on your feet as long as you can. Only slide when you are sure you can reach the ball!',tail:1.5,
  cues:['Your turn','stay on your feet','as long','Only slide','reach the ball']},
];
/** VOICE: the Kokoro narration (scripts/plays/kokoro-narrate.py mascherano-robben-2014 → timing.json): withTiming re-times the film. */
import timingJson from '../../../public/plays/narration/mascherano-robben-2014/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail,ID);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUEW=cueFn(CHAPTERS,ID),SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- venue + kits
const VENUE:Venue={sky:'night',crowd:[[Y,2],[O,2],['paper',3],[B,3]],fill:.8,tiers:.44,seed:41};
const PITCH:Pitch={grass:[[Y,.88],[B,.55]],stripe:[B,.18]};
const SKIN:InkFill[]=[[Y,.34],[O,.18]],SKIN_S:InkFill[]=[[Y,.36],[O,.22],[K,.04]],SKIN_M:InkFill[]=[[Y,.42],[O,.3],[K,.12]],SKIN_D:InkFill[]=[[O,.45],[Y,.5],[K,.24]];
/** the Netherlands: orange shirts, orange shorts and socks (inferred detail) */
const NED=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[O,.95],trim:[K,.8],shorts:[O,.95],socks:[O,.95],boots:K,numberInk:K,skin:SKIN_S,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.22],sleeves:'short',seed:5,...o});
/** Robben: number 11, about 1.80 m, balding */
const ROB_ST=NED({number:11,skin:SKIN_S,hair:[K,.5],hairStyle:'balding',build:{height:1.8,bulk:.95},seed:11});
/** Argentina: the dark blue change kit (inferred), dark shorts and socks */
const ARG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],trim:[Y,.6],shorts:[K,.9],socks:[B,.95],boots:K,numberInk:'paper',skin:SKIN_M,hair:[K,.95],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',seed:3,...o});
/** Mascherano: number 14, about 1.74 m, short dark hair */
const MAS_ST=ARG({number:14,skin:SKIN_M,hair:[K,.95],build:{height:1.74,bulk:1.02},seed:14});
const GK_ST:AthleteStyle={shirt:[Y,.95],shorts:[K,.9],socks:[Y,.95],boots:K,skin:SKIN_M,hair:[K,.9],hairStyle:'short',line:K,shade:[O,.35],gloves:'paper',sleeves:'long',trim:K,build:{height:1.88,bulk:1.02},seed:23};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the play: tracks (τ = seconds after Sneijder's return pass)
type Actor={role:'rob'|'mas'|'ned'|'arg'|'gk';style:AthleteStyle;keys:number[][];key?:boolean};
const GIVE=-1.2,T1=.85,T2=1.35,SLIDE=1.3,SLIDE_D=.9,SHOT=1.85,OUT=3.9;
const ACTORS:Actor[]=[
 {role:'rob',style:ROB_ST,key:true,keys:[[-3.5,68,-14],[-2,72,-13],[-1.2,75,-12.2],[0,80.6,-10.8],[.85,86.2,-9.6],[1.35,89.4,-8.8],[1.85,91.9,-8.2],[2.4,92.9,-8.3],[3.5,93.3,-8.6],[6,93.4,-8.7]]},
 {role:'mas',style:MAS_ST,key:true,keys:[[-3.5,71,-6],[-2,74.6,-6.4],[-1.2,77.2,-6.8],[0,82,-7.1],[.85,86.7,-6.9],[1.3,89.2,-6.7],[6,89.2,-6.7]]},
 {role:'ned',style:NED({seed:10,skin:SKIN_S,hair:[Y,.6],build:{height:1.7}}),key:true,keys:[[-3.5,76,-4],[-1.2,79,-3.5],[0,80,-3.4],[1,81.5,-3.6],[4,84,-4]]},
 {role:'gk',style:GK_ST,key:true,keys:[[-3.5,102.6,-1],[1,101.8,-3.2],[1.85,101,-4.2],[6,101,-4.2]]},
 {role:'arg',style:ARG({seed:41,skin:SKIN,build:{height:1.9}}),keys:[[-3.5,86,-1],[0,90,-1.8],[1.85,94,-2.4],[6,96,-2.8]]},
 {role:'arg',style:ARG({seed:42,skin:SKIN_S,build:{height:1.85}}),keys:[[-3.5,86.5,6],[0,90,4],[1.85,94,2],[6,96,1]]},
 {role:'arg',style:ARG({seed:43,skin:SKIN_M}),keys:[[-3.5,80,-20],[0,85,-18],[1.85,90,-16],[6,94,-14]]},
 {role:'arg',style:ARG({seed:44,skin:SKIN_M}),keys:[[-3.5,76,4],[0,80,3],[2,84,1],[6,88,-1]]},
 {role:'ned',style:NED({seed:12,skin:SKIN_S,build:{height:1.87}}),keys:[[-3.5,82,7],[0,88,6],[2,92,4.5],[6,95,3]]},
 {role:'ned',style:NED({seed:13,skin:SKIN_D}),keys:[[-3.5,70,10],[0,76,9],[3,82,7],[6,86,6]]},
 {role:'arg',style:ARG({seed:45,skin:SKIN}),keys:[[-3.5,66,-2],[0,70,-3],[3,75,-5],[6,80,-6]]},
];
const RB=0,MS=1,SN=2,GK=3;
const TR=tracks(ACTORS.map(a=>a.keys),-5,8);
// ---------------------------------------------------------------- the ball: Robben → Sneijder → the diagonal ball back into his path → touch → one more touch → the shot, blocked → spinning away wide
const G0=footOn(TR,RB,GIVE,-1),SNT=footOn(TR,SN,-.02,1),TP1=footOn(TR,RB,T1,-1),TP2=footOn(TR,RB,T2,-1),SP=footOn(TR,RB,SHOT,-1);
const DEFL:V3=[97.5,.9,-13.5],OUTP:V3=[105.5,.11,-19];
const l2=(a:[number,number],b:[number,number],u:number):[number,number]=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
function ballAt(tau:number):V3{
 if(tau<GIVE){const p=footOn(TR,RB,tau,-1);return[p[0],.11,p[1]];}
 if(tau<0){const p=l2(G0,SNT,(tau-GIVE)/-GIVE);return[p[0],.11,p[1]];}
 if(tau<T1){const u=tau/T1,p=l2(SNT,TP1,u*(1.2-.2*u));return[p[0],.11,p[1]];}
 if(tau<T2){const u=(tau-T1)/(T2-T1),p=l2(TP1,TP2,1-(1-u)*(1-u));return[p[0],.11,p[1]];}
 if(tau<SHOT){const u=(tau-T2)/(SHOT-T2),p=l2(TP2,SP,1-(1-u)*(1-u));return[p[0],.11,p[1]];}
 // the shot hits the sole of the sliding boot at once and loops away wide, bouncing toward the byline
 const u=clamp((tau-SHOT)/.7);if(u<1)return[lerp(SP[0],DEFL[0],u),.11+4*1.4*u*(1-u)+DEFL[1]*u*u*.2,lerp(SP[1],DEFL[2],u)];
 const w=clamp((tau-SHOT-.7)/(OUT-SHOT-.7)),e=1-(1-w)*(1-w);return[lerp(DEFL[0],OUTP[0],e),.11+.5*Math.abs(Math.sin(w*Math.PI*2))*(1-w),lerp(DEFL[2],OUTP[2],e)];
}
const runPts=(k:number,t0:number,t1:number)=>TR.path(k,t0,t1,14);

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const PH0=Math.floor(TR.dist(RB,T1)/3.2)+touchPhase;
function gaitRob(tau:number){const f=(u:number)=>TR.dist(RB,u)/3.2;if(tau<T1)return f(tau)+PH0-f(T1);if(tau>T2)return PH0+1+f(tau)-f(T2);return key(tau,[[T1,PH0],[T2,PH0+1]],linear);}
/** Mascherano's slide yaw: at the spot where Robben will shoot */
const SLIDE_YAW=(()=>{const p=TR.pos(MS,SLIDE);return yawOf(SP[0]-p[0],SP[1]-p[1]);})();
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=TR.vel(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=TR.pos(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='arg'?READY:stand();
 let p:Pose;
 if(k===RB){
  const s=clamp((sp-2)/4.5),ph=gaitRob(tau),run=runCycle(ph,{speed:.6+.4*s}),dr=dribble(ph,{foot:'l',speed:.6+.4*s});
  p=blendPose(idle,tau<-.3&&tau>GIVE+.3?run:dr,clamp((sp-.3)/.8));
  {const D=.7,u=(tau-(GIVE-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.4}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
  {const D=.8,u=(tau-(SHOT-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3)p=blendPose(p,strike(Math.min(.62,u),{foot:'l',power:.9}),Math.min(sm(0,.15,u),1-sm(.9,1.3,u)));}
  if(tau>SHOT+.4)p=over(p,{lShA:70,rShA:70,neckP:-20,lean:-4},sm(SHOT+.4,SHOT+1,tau)*.8);
 }
 else if(k===MS){
  // on his feet, running with Robben (eyes on the ball), then the slide at SLIDE: lead leg long and low into the shot
  const s=clamp((sp-2)/5);p=blendPose(idle,runCycle(TR.dist(MS,tau)/3.3,{speed:.75+.25*s}),clamp((sp-.3)/.8));
  if(tau<SLIDE)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),.25);
  if(tau>=SLIDE){p=slideTackle(clamp((tau-SLIDE)/SLIDE_D),{foot:'l'});yaw=SLIDE_YAW;}
 }
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(TR.dist(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(TR.dist(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 if(k===SN){const D=.6,u=(tau-(0-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.4}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>-1.3&&tau<.3)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),bump(-1.3,.3,tau));}
 if(k===GK)p=over(p,{lShA:60,rShA:60,lKnee:70,rKnee:70,lean:22},bump(SHOT-.4,SHOT+.5,tau));
 return{p,yaw};
}
/** Mascherano's drawn position: frozen at the slide start (the slide pose carries him forward through its own root shift) */
const posFor=(k:number,tau:number):[number,number]=>k===MS&&tau>SLIDE?TR.pos(MS,SLIDE):TR.pos(k,tau);

// ---------------------------------------------------------------- drawing the match through a camera
function draw(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;before?:()=>void}={}){
 return play(s,c,v,tau,{n:ACTORS.length,pos:posFor,ball:ballAt,draw:(k:number,e:CastE,q:{passing:boolean;px:number})=>{
  const a=ACTORS[k],{p,yaw}=poseOf(k,tauP),big=e.h>=300,detail=q.passing?(k===MS?'mid':'low'):q.px<50||(!a.key&&q.px<110)?'low':'auto';
  return drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&a.key&&!q.passing?{prev:poseOf(k,tauPrev).p,smear:!!o.hero&&(k===MS||k===RB)}:{});}},
  {minBall:o.minBall,before:o.before});
}
const replay=(s:Sheet,c:Cam,v:View,tau:number,t:number,map:(t:number)=>number,before?:()=>void)=>draw(s,c,v,tau,map(twos(t)),map(twos(t)-1/12),{minBall:5,hero:true,before});
/** the sole of the sliding boot, on the sheet (for the "bottom of his boot" ring) */
const soleRing=(s:Sheet,r:DrawResult|undefined,w:number)=>bootRing(s,r,'l',Y,w,91);

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const bl=CUEW(0,'blocks'),S=SECS(0);return key(t,mono([[0,-3.4],[CUEW(0,'Arjen'),GIVE-.2],[CUEW(0,'breaks'),.3],[CUEW(0,'but Javier'),T1],[CUEW(0,'chases'),T2-.1],[bl,SHOT],[S+1,SHOT+(S+1-bl)*.9]]),linear);};
const CAM1:V3=[76,18,78];
function cam1(t:number):Cam{
 const tau=tau1(t),S=SECS(0);
 const r=TR.pos(RB,Math.min(tau,SHOT+.5)),m=TR.pos(MS,Math.min(tau,SLIDE)),T:V3=[lerp(r[0],m[0],.3)+2,1.1,lerp(r[1],m[1],.3)];
 const F=key(t,mono([[0,4400],[CUEW(0,'Arjen'),5200],[CUEW(0,'breaks'),6400],[CUEW(0,'but Javier'),7800],[CUEW(0,'blocks'),9000],[S,8400]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),bl=CUEW(0,'blocks');
  stadium(s,c,v,t,VENUE,[0,2,3],{roar:sm(bl,bl+.5,t),flash:sm(bl,bl+.3,t)*(1-sm(SECS(0)-.9,SECS(0)-.4,t))});
  ground(s,c,PITCH);
  draw(s,c,v,tau,tau1(twos(t)),tau1(twos(t)-1/12),{minBall:8});
  spark(s,c,[SP[0],.3,SP[1]],(tau-SHOT)*1.4,.5,11);
 },
 aperture(t){const c=cam1(t),q=toCam(c,[SP[0],.3,SP[1]]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.25/q[2]),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low behind the pair: Robben in behind, Mascherano on his feet, tracking
const tau2=(t:number)=>key(t,mono([[0,-1.6],[CUEW(1,'Robben gets'),-.3],[CUEW(1,'Mascherano does'),.35],[CUEW(1,'He stays'),.8],[CUEW(1,'tracks'),1.05],[SECS(1),1.3]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),r=TR.smooth(RB,tau),m=TR.smooth(MS,Math.min(tau,SLIDE)),mid:[number,number]=[(r[0]+m[0])/2,(r[1]+m[1])/2],push=sm(CUEW(1,'He stays')-.3,SECS(1),t,easeInOutSine);
 return look([mid[0]-8+2*push,2.3,mid[1]+4.5],[mid[0]+5,.9,mid[1]-.5],1800+500*push);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),rg=CUEW(1,'Robben gets'),md=CUEW(1,'Mascherano does'),hs=CUEW(1,'He stays'),tr=CUEW(1,'tracks'),E=SECS(1);
  stadium(s,c,v,t,VENUE,[0,2]);
  ground(s,c,PITCH);
  // "Robben gets in behind": his orange run arrow; "Mascherano does not give up": his blue chase arrow; "he stays on his feet": a yellow
  // ring round his feet (upright, running); "tracks the run": a yellow line from him to Robben that he keeps beside him
  groundArrow(s,c,runPts(RB,-1,Math.max(-.6,Math.min(tau+.6,SHOT))),O,sm(rg-.2,rg+.5,t,easeOut)*(1-sm(E-.5,E-.2,t)),61,.12);
  groundArrow(s,c,runPts(MS,-1.2,Math.max(-.8,Math.min(tau+.4,SLIDE))),B,sm(md-.2,md+.5,t,easeOut)*(1-sm(E-.5,E-.2,t)),62,.12);
  const m=TR.pos(MS,tau),r=TR.pos(RB,tau);groundRing(s,c,m[0],m[1],1,1,Y,sm(hs-.1,hs+.3,t,easeOutBack)*(1-sm(E-.4,E-.15,t)),63,.2);
  const w=sm(tr-.1,tr+.3,t,easeOut)*(1-sm(E-.3,E-.1,t));if(w>0)groundArrow(s,c,[[m[0],m[1]],[lerp(m[0],r[0],.5),lerp(m[1],r[1],.5)],[r[0],r[1]+.8]],Y,w,64,.08);
  replay(s,c,v,tau,t,tau2);
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=TR.pos(MS,tau2(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 3 · replay low from in front, by the goal: one more touch, the slide, the sole on the ball
const tau3=(t:number)=>{const bb=CUEW(2,'bottom');return key(t,mono([[0,.55],[CUEW(2,'one more'),T2-.1],[CUEW(2,'Now'),SLIDE],[CUEW(2,'slides'),SLIDE+.3],[CUEW(2,'blocks'),SHOT],[bb,SHOT+.3],[SECS(2),SHOT+.3+(SECS(2)-bb)*.5]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),r=TR.smooth(RB,Math.min(tau,SHOT)),push=sm(CUEW(2,'Now')-.2,CUEW(2,'blocks'),t,easeInOutSine),hold=sm(CUEW(2,'blocks'),SECS(2),t,easeInOutSine);
 const T:V3=[lerp(r[0]+1.5,SP[0],push),lerp(1,.45,push),lerp(r[1]+.5,SP[1]+.6,push)];
 return look([100.5-2*push,1.9-.6*push+.3*hold,-14.5+2.5*push],T,2100+1300*push-1300*hold);
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),om=CUEW(2,'one more'),nm=CUEW(2,'Now'),sl=CUEW(2,'slides'),bb=CUEW(2,'bottom'),E=SECS(2);
  stadium(s,c,v,t,VENUE,[3,0]);
  ground(s,c,PITCH);
  // "one more touch": an orange ring round the ball as it is pushed on; "now Mascherano slides": his blue slide streak; "blocks it": a
  // yellow burst on the ball; "the bottom of his boot": a yellow ring round the sole that meets it
  const bp=ballAt(Math.min(tau,SHOT));groundRing(s,c,bp[0],bp[2],.9,.9,O,sm(om-.1,om+.3,t,easeOutBack)*(1-sm(nm,nm+.3,t)),71,.2);
  groundArrow(s,c,[TR.pos(MS,SLIDE),[lerp(TR.pos(MS,SLIDE)[0],SP[0],.5),lerp(TR.pos(MS,SLIDE)[1],SP[1],.5)],[SP[0]-.3,SP[1]+.3]],B,sm(sl-.2,sl+.3,t,easeOut)*(1-sm(E-.5,E-.2,t)),72,.16);
  const r=replay(s,c,v,tau,t,tau3);
  spark(s,c,[SP[0],.25,SP[1]],(tau-SHOT)*1.2,.35,73);
  soleRing(s,r.res[MS],sm(bb-.2,bb+.2,t,easeOutBack)*(1-sm(E-.4,E-.15,t)));
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),b=ballAt(tau3(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.12/q[2]),12);},
 still:3.8,
};

// ---------------------------------------------------------------- 4 · the lesson: side-on, low
const tau4=(t:number)=>key(t,mono([[0,-.6],[CUEW(3,'stay'),-.2],[CUEW(3,'as long'),.4],[CUEW(3,'Only slide'),SLIDE],[CUEW(3,'reach'),SHOT],[SECS(3),SHOT+.5]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=TR.smooth(MS,Math.min(tau,SLIDE)),r=TR.smooth(RB,Math.min(tau,SHOT)),T:V3=[(m[0]+r[0])/2+1,.9,(m[1]+r[1])/2],push=sm(CUEW(3,'Only slide')-.3,CUEW(3,'reach'),t,easeInOutSine);
 return look([T[0]-2,3.2-.8*push,T[2]+11-2*push],T,1900+500*push);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),sf=CUEW(3,'stay'),al=CUEW(3,'as long'),os=CUEW(3,'Only slide'),rb=CUEW(3,'reach'),E=SECS(3);
  stadium(s,c,v,t,VENUE,[0,2]);
  ground(s,c,PITCH);
  // "stay on your feet": a yellow ring round Mascherano running upright; "as long as you can": his blue path beside Robben; "only slide":
  // the slide streak; "when you are sure you can reach the ball": a yellow ring round the ball at the moment the boot gets there
  const m=TR.pos(MS,Math.min(tau,SLIDE));
  groundArrow(s,c,runPts(MS,-.8,Math.max(-.5,Math.min(tau,SLIDE))),B,sm(al-.2,al+.4,t,easeOut)*(1-sm(E-.5,E-.2,t)),81,.12);
  groundArrow(s,c,[TR.pos(MS,SLIDE),[SP[0]-.3,SP[1]+.3]],Y,sm(os-.1,os+.3,t,easeOut)*(1-sm(E-.5,E-.2,t)),82,.16);
  groundRing(s,c,SP[0],SP[1],1,1,Y,sm(rb-.15,rb+.25,t,easeOutBack)*(1-sm(E-.4,E-.15,t)),83,.2);
  const r=replay(s,c,v,tau,t,tau4,()=>groundRing(s,c,m[0],m[1],1.1,1.1,Y,sm(sf-.1,sf+.3,t,easeOutBack)*(1-sm(os,os+.3,t)),84,.18));
  soleRing(s,r.res[MS],sm(rb-.1,rb+.2,t,easeOutBack)*(1-sm(E-.4,E-.15,t)));
 },
 still:3.6,
};

const film:RisoStory={
 id:ID,format:'11v11',title:'Mascherano’s block on Robben',theme:'Stay on your feet as long as you can; only slide when you are sure you can reach the ball',
 ageNote:'2014 World Cup semi-final, Netherlands 0–0 Argentina (Argentina won on penalties), Arena de São Paulo, 9 July 2014 (90th minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf and a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){touchTurf(s,x,y,age,seed,Y,O);},
};
export default film;
