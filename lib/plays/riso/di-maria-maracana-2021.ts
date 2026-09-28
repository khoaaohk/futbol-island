/** Ángel Di María — "The Maracanã Chip" (lib/town/iconicPlays.json: kind "moment", template chip_goal, distance box, foot left; lesson
 * "When the keeper rushes out, lift the ball gently over them."). An iconic-play riso film (RisoStory, chapters mode): a 1:1 reconstruction,
 * from WRITTEN accounts (the footage itself was not reviewed frame by frame), of the only goal of the Copa América final, Argentina 1–0
 * Brazil, Estádio do Maracanã, Rio de Janeiro, Saturday 10 July 2021 (night, floodlit), 22nd minute.
 *
 * SOURCES (read 26 Sep 2026 with curl, cached under scratchpad/six/):
 *  - Wikipedia, "2021 Copa América final": "Ángel Di María opened the scoring for Argentina in the 22nd minute, receiving a long pass from
 *    Rodrigo De Paul and beating defender Renan Lodi to lob the ball over the advancing goalkeeper Ederson"; Di María man of the match.
 *  - Goal.com, "Messi's Angel of mercy" (goal-dm.txt): "Rodrigo De Paul's laser-guided pass eluded Renan Lodi and landed into the path of
 *    the flying Di Maria. With one touch of his left foot, he gained control, while the second chipped the ball over the head of Ederson and
 *    into the net"; "Di Maria's pace on the right" was picked to exploit Lodi.
 *  - Copa América (CONMEBOL) "Argentina reaches glory after 28 years" (ca.txt): "a beautiful chip shot over Brazilian GK Ederson".
 *  - Al Jazeera / AP (aj.txt): "a long pass" from De Paul; "sloppy defending from left-back Renan Lodi"; "to take control and lob it past
 *    goalkeeper Ederson"; Messi's first title "in a blue and white shirt". Planet Football (pf.txt): "taking down Rodrigo de Paul's lofted
 *    pass before lobbing … Ederson". Telangana Today: "latched on to a ball over the top".
 *  - Card facts: Argentina (lib/town/playerAppearance.json: skin 1, hair 1, short); Di María's Argentina number 11.
 * CONFIRMED: the match, venue, date, 22nd minute, 1–0 and final score; a LONG, LOFTED pass from De Paul from his OWN HALF (Wikipedia /
 *  Copa América "from his own half" via the search record) over the top; it ELUDED Renan Lodi, Brazil's LEFT-back (so Di María ran in on
 *  Argentina's RIGHT); ONE TOUCH OF HIS LEFT FOOT to control, the SECOND touch CHIPPED it over the ADVANCING keeper Ederson, into the net.
 * INFERRED (illustrative; never narrated): every position, path and timing in metres and seconds (a ~38 m lofted pass, the touch 13 m out
 *  on the right of the box, the chip from ~12 m, Ederson ~6 m off his line); that the chip was also with the left foot (Goal: "the second"
 *  touch, after "one touch of his left foot"); De Paul's passing foot (right); where the chip landed (drawn: just left of centre, dropping
 *  under the bar); the other players shown (unnamed, no numbers); kits — Argentina's sky-blue-and-white stripes (confirmed "blue and white
 *  shirt") with black shorts and white socks, Brazil's yellow shirts, blue shorts, white socks (hosts at home), Ederson drawn in dark
 *  navy; which end Argentina attacked on the TV picture (drawn: screen-right from the main camera, the right wing on the near side); the
 *  crowd (drawn thin — a limited-capacity crowd) and the bowl's shape; the celebration; every camera.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window, never sheet.safe): 1 = the high main-stand camera in near real time
 * (De Paul's long ball → Di María behind Lodi → touch → chip → net); 2 = slow replay from a LOW camera behind Di María (the pass flying past
 * Lodi, the left-foot touch, the keeper rushing out); 3 = replay from BEHIND THE GOAL (the chip over Ederson, into the net, swing to Di
 * María); 4 = the lesson, low and side-on at the box edge (keeper rushes → stay calm → lift it over). All bodies go through ONE adapter,
 * drawPlayer() → athlete.ts. The world is right-handed like athlete.ts (X toward Brazil's goal at 105, Y up, +Z = the near touchline
 * under the main camera = Argentina's right wing), so a figure attacking +X has its right side at +Z and Di María's LEFT boot plays with no
 * mirrored projector; Ederson faces −X. Shared machinery: ./tv-kit-six.ts. Scenes read only (t, c); seeded randomness only. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,polyPath,easeOut,easeOutBack,easeInOutSine,linear} from '../../paths/riso/motion';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,header,strike,keeperSet,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type V3,type DrawResult} from './athlete';
import {Y,K,estimate,cueFn,mono,lerp3,lerpA,yawOf,bump,over,frame,look,toCam,scr,pr,kAt,stadium,ground,goal3,bulgeAt,tracks,footOn,play,
 streaks,strikeOut,groundArrow,airArrow,groundRing,bootRing,spark,touchTurf,add3,type Cam,type View,type Venue,type Pitch,type CastE} from './tv-kit-six';

const ID='di-maria-maracana-2021',R='red',B='blue';
// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` key the action; every cue starts with a plain word (no contraction or hyphen). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Rio, 2021: the Copa América final against Brazil. Rodrigo De Paul sends a long pass from his own half. Di María races in behind... and lifts it over the keeper! One nil to Argentina!',tail:1.8,
  cues:['Rio','the Copa','against Brazil','Rodrigo De Paul','sends a long','from his own','Di María races','in behind','lifts','One nil']},
 {label:'Watch it again',text:'Watch again. The pass flies past the defender, Renan Lodi. One touch with his left foot, and it’s his. Here comes the keeper, rushing out!',tail:1.2,
  cues:['Watch again','The pass flies','Renan Lodi','One touch','left foot','and it','Here comes','rushing out']},
 {label:'The chip',text:'So Di María does not blast it. He chips it gently over Ederson... and it drops into the net!',tail:1.8,
  cues:['So Di','does not blast','He chips','gently','Ederson','drops into']},
 {label:'Your turn',text:'Your turn: when the keeper rushes out, stay calm. Lift the ball gently over them!',tail:1.5,
  cues:['Your turn','when the keeper','rushes out','stay calm','Lift the ball','over them']},
];
/** VOICE: the Kokoro narration (scripts/plays/kokoro-narrate.py di-maria-maracana-2021 → timing.json next to script.json): withTiming
 * swaps in the clips, chapter lengths and word onsets and the film re-times itself. */
import timingJson from '../../../public/plays/narration/di-maria-maracana-2021/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail,ID);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUEW=cueFn(CHAPTERS,ID),SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- venue + kits
/** the Maracanã at night: one steep bowl under a ring roof, floodlights in its lip; a thin crowd (inferred look) */
const VENUE:Venue={sky:'night',crowd:[[Y,4],[B,2],['paper',2],[K,1]],fill:.3,tiers:0,seed:11};
const PITCH:Pitch={grass:[[Y,.88],[B,.55]],stripe:[B,.18]};
const SKIN:InkFill[]=[[Y,.34],[R,.22]],SKIN_S:InkFill[]=[[Y,.36],[R,.26],[K,.04]],SKIN_M:InkFill[]=[[Y,.42],[R,.32],[K,.12]],SKIN_D:InkFill[]=[[R,.45],[Y,.5],[K,.24]];
/** Argentina: sky-blue and white stripes (a blue screen with paper stripes), black shorts, white socks (inferred detail) */
const ARG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],pattern:'stripes',patternInk:'paper',shorts:[K,.95],socks:'paper',boots:K,numberInk:K,skin:SKIN,hair:[K,.9],hairStyle:'short',line:K,shade:[B,.3],sleeves:'short',seed:5,...o});
/** Di María: number 11, about 1.80 m and slim, short dark hair */
const DM_ST=ARG({number:11,skin:SKIN_S,hair:[K,.8],build:{height:1.8,bulk:.9},seed:11});
/** Brazil at home: yellow shirts, blue shorts, white socks (inferred) */
const BRA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[B,.95],socks:'paper',boots:K,trim:[B,.8],skin:SKIN_M,hair:[K,.95],hairStyle:'short',line:K,shade:[R,.25],sleeves:'short',seed:3,...o});
const GK_ST:AthleteStyle={shirt:[K,.85],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_M,hair:[K,.9],hairStyle:'bald',line:K,shade:[B,.4],gloves:'paper',sleeves:'long',trim:Y,build:{height:1.88,bulk:1.05},seed:23};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the play: tracks (τ = seconds after De Paul's pass)
type Actor={role:'hero'|'arg'|'bra'|'lodi'|'gk';style:AthleteStyle;keys:number[][];key?:boolean};
const LAND=2.1,TOUCH=2.4,CHIP=3.05,IN=CHIP+1.05,NETHIT=IN+.16;
const ACTORS:Actor[]=[
 {role:'hero',style:DM_ST,key:true,keys:[[-4,64,27.5],[-2,69.5,27],[0,75.5,25.6],[1,80.4,23],[2,84.4,19.4],[2.4,85.9,17.7],[2.75,88.5,15],[3.05,90.9,12.4],[3.4,92.9,10.9],[4.2,95.8,9.8],[5.5,98.2,11.5],[8,100,16]]},
 {role:'lodi',style:BRA({skin:SKIN_M,hair:[K,.95],build:{height:1.73},seed:31}),key:true,keys:[[-4,76,20.5],[-2,78.2,21],[0,80.2,21.4],[1,81.8,21.3],[1.9,83,20.8],[2.5,84.4,19.6],[3.2,87.6,16],[4.2,91,12.6],[8,94,11]]},
 {role:'gk',style:GK_ST,key:true,keys:[[-4,103.6,1],[1.5,103,2.4],[2.4,101,4.2],[3,98.6,6],[3.3,98.1,6.4],[8,98.1,6.4]]},
 {role:'arg',style:ARG({skin:SKIN,seed:7,build:{height:1.8},hair:[K,.95]}),key:true,keys:[[-4,39,9],[-1.5,45,7.4],[0,48,6.4],[1,50.2,6.2],[4,57,6],[8,63,7]]},
 {role:'bra',style:BRA({seed:41,build:{height:1.84},skin:SKIN_D}),keys:[[-4,82,8.5],[0,85.5,8.4],[2,89.5,7.4],[3.2,93,6.6],[5,96,5.5],[8,97,5]]},
 {role:'bra',style:BRA({seed:42,build:{height:1.83},skin:SKIN_M,hair:[K,.6]}),keys:[[-4,82,-3],[0,85.5,-2],[3,91.5,0],[5,95,1],[8,96,1]]},
 {role:'bra',style:BRA({seed:43,skin:SKIN_D}),keys:[[-4,78,-19],[0,82,-17.5],[3,88,-13],[8,93,-9]]},
 {role:'arg',style:ARG({seed:17,skin:SKIN_M}),keys:[[-4,76,2],[0,81,1.5],[2.5,89,.2],[5,95,-1],[8,98,4]]},
 {role:'arg',style:ARG({seed:18,skin:SKIN_S,build:{height:1.7}}),keys:[[-4,60,-9],[0,67,-6],[3,78,-3],[5,85,-1],[8,90,3]]},
 {role:'bra',style:BRA({seed:44,skin:SKIN_D,hairStyle:'bald'}),keys:[[-4,57,5],[0,58,6.5],[3,66,9.5],[8,76,11]]},
 {role:'bra',style:BRA({seed:45,skin:SKIN_M}),keys:[[-4,61,-11],[0,62,-8.5],[3,70,-4],[8,79,0]]},
 {role:'arg',style:ARG({seed:19,skin:SKIN_M,hair:[K,.7]}),keys:[[-4,44,-7],[0,48,-4.5],[3,56,-1],[8,64,2]]},
];
const DM=0,LODI=1,GK=2,DP=3;
const TR=tracks(ACTORS.map(a=>a.keys),-6,10);
// ---------------------------------------------------------------- the ball: De Paul's feet → the long ball → past Lodi → the left-foot touch → the chip → the net
const DP0=footOn(TR,DP,0,1),LANDP:[number,number]=[85.3,18.4],TP1=footOn(TR,DM,TOUCH,-1),CP=footOn(TR,DM,CHIP,-1);
const GIN:V3=[105.05,1.6,-.7],NETP:V3=[106.7,.95,-.95],REST:V3=[106.3,.11,-.95];
function ballAt(tau:number):V3{
 if(tau<0){const p=footOn(TR,DP,tau,1),b=.3*Math.abs(Math.sin(TR.dist(DP,tau)/2.4*Math.PI));return[p[0]+b,.11,p[1]];}
 if(tau<LAND){const u=tau/LAND;return[lerp(DP0[0],LANDP[0],u),.11+4*5.2*u*(1-u),lerp(DP0[1],LANDP[1],u)];}
 if(tau<TOUCH){const u=(tau-LAND)/(TOUCH-LAND);return[lerp(LANDP[0],TP1[0],u),.11+.35*u+4*.7*u*(1-u),lerp(LANDP[1],TP1[1],u)];}
 if(tau<CHIP){const u=(tau-TOUCH)/(CHIP-TOUCH),e=1-(1-u)*(1-u);return[lerp(TP1[0],CP[0],e),.11+.35*(1-u)*(1-u),lerp(TP1[1],CP[1],e)];}
 if(tau<IN){const u=(tau-CHIP)/(IN-CHIP);return[lerp(CP[0],GIN[0],u),lerp(.11,GIN[1],u)+4*3.1*u*(1-u),lerp(CP[1],GIN[2],u)];}
 if(tau<NETHIT){const u=(tau-IN)/(NETHIT-IN);return lerp3(GIN,NETP,u);}
 const u=clamp((tau-NETHIT)/.5),e=1-(1-u)*(1-u);return[lerp(NETP[0],REST[0],e),lerp(NETP[1],REST[1],e*e),lerp(NETP[2],REST[2],e)];
}
const bulge=(tau:number)=>bulgeAt(tau,NETHIT);
const chipPts=(n=16):V3[]=>{const o:V3[]=[];for(let i=0;i<=n;i++)o.push(ballAt(lerp(CHIP,IN,i/n)));return o;};
const passPts=(n=16):V3[]=>{const o:V3[]=[];for(let i=0;i<=n;i++)o.push(ballAt(lerp(0,LAND,i/n)));return o;};

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** Di María's gait: free running by distance; from the touch one stride... two strides to the chip, so the LEFT boot meets the ball at both */
const PH0=Math.floor(TR.dist(DM,TOUCH)/3.2)+touchPhase;
function gaitPh(tau:number){const f=(u:number)=>TR.dist(DM,u)/3.2;if(tau<TOUCH)return f(tau)+PH0-f(TOUCH);if(tau>CHIP)return PH0+2+f(tau)-f(CHIP);return key(tau,[[TOUCH,PH0],[CHIP,PH0+2]],linear);}
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=TR.vel(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=TR.pos(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='bra'||a.role==='lodi'?READY:stand();
 let p:Pose;
 if(k===DM){
  // eyes on the dropping ball before the touch, then on the keeper
  if(tau<TOUCH&&tau>.2)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),.35*bump(.2,TOUCH,tau));
  if(tau>CHIP-.4&&tau<CHIP+.3)yaw=lerpA(yaw,yawOf(GIN[0]-x,GIN[2]-z),.8*bump(CHIP-.4,CHIP+.3,tau));
  const s=clamp((sp-2)/4.5),ph=gaitPh(tau),run=runCycle(ph,{speed:.6+.4*s}),dr=dribble(ph,{foot:'l',speed:.55+.4*s});
  p=blendPose(idle,tau<TOUCH-.3?run:dr,clamp((sp-.3)/.8));
  // the touch: the left foot cushions the dropping ball (knee up, body over it)
  p=over(p,{lHipF:48,lKnee:52,lAnk:-12,lean:18,neckP:34,lShA:48,rShA:40},bump(TOUCH-.18,TOUCH+.14,tau));
  // the chip: a short, soft left-foot stab under the ball, leaning back a touch
  {const D=.7,u=(tau-(CHIP-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=over(blendPose(p,strike(Math.min(1,u),{foot:'l',power:.3}),Math.min(sm(0,.15,u),1-sm(1,1.4,u))),{lean:2},bump(CHIP-.2,CHIP+.25,tau)*.6);}
  if(tau>NETHIT+.2)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(NETHIT+.2,NETHIT+.7,tau));
 }
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(TR.dist(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(TR.dist(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 if(k===LODI){// backing off, then a leap for the high ball that goes past him; he turns to chase
  const D=.9,u=(tau-(1.95-.52*D))/D;if(u>0&&u<1.3)p=blendPose(p,header(Math.min(1,u)),Math.min(sm(0,.12,u),1-sm(1,1.3,u))*.9);
  if(tau>1.9&&tau<2.7)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),bump(1.9,2.7,tau));}
 if(k===DP){const D=.75,u=(tau-(0-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.85}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>-.6&&tau<.4)yaw=lerpA(yaw,yawOf(LANDP[0]-x,LANDP[1]-z),bump(-.6,.4,tau));}
 if(k===GK){// rushes out, spreads tall and reaches up as the chip floats over; turns to watch it drop
  p=over(p,{lShA:150,rShA:150,lShF:36,rShF:36,lElb:12,rElb:12,lHand:1,rHand:1,air:.3,lKnee:30,rKnee:30},bump(CHIP-.2,CHIP+.65,tau));
  if(tau>CHIP+.3)p=over(p,{neckY:tau<IN?40:70,twist:24,lean:-6},sm(CHIP+.3,IN,tau));}
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
function draw(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;trail?:number;before?:()=>void}={}){
 return play(s,c,v,tau,{n:ACTORS.length,pos:TR.pos,ball:ballAt,draw:(k:number,e:CastE,q:{passing:boolean;px:number})=>{
  const a=ACTORS[k],{p,yaw}=poseOf(k,tauP),big=e.h>=300,detail=q.passing?(k===DM?'mid':'low'):q.px<50||(!a.key&&q.px<110)?'low':'auto';
  return drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&(k===DM||k===GK||k===LODI||e.h>520)&&!q.passing?{prev:poseOf(k,tauPrev).p,smear:!!o.hero&&k===DM}:{});}},
  {minBall:o.minBall,trail:o.trail,trailFrom:CHIP,before:o.before});
}
const heroOf=(r:ReturnType<typeof draw>)=>r.res[DM];

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const on=CUEW(0,'One'),S=SECS(0);return key(t,mono([[0,-3.4],[CUEW(0,'Rodrigo'),-.9],[CUEW(0,'sends'),0],[CUEW(0,'Di María races'),1.25],[CUEW(0,'in behind'),TOUCH-.2],[CUEW(0,'lifts'),CHIP],[on,IN+.3],[S+1,IN+.3+(S+1-on)*.95]]),linear);};
const CAM1:V3=[72,20,92];
function cam1(t:number):Cam{
 const tau=tau1(t),on=CUEW(0,'One'),S=SECS(0);
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,IN));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const m=TR.pos(DM,tau),cel:V3=[m[0]-1,1.1,m[1]];
 const goalward=.45*sm(CUEW(0,'in behind'),CUEW(0,'lifts')+.3,t,easeInOutSine),toS=sm(on+.5,on+1.6,t,easeInOutSine);
 const tb:V3=[bt[0],lerp(2.6,1.3,sm(0,CUEW(0,'Di María races'),t)),bt[2]*.9],tg=lerp3(tb,[99,1.2,4],goalward*(1-toS)),T=lerp3(tg,cel,toS);
 const F=key(t,mono([[0,4200],[CUEW(0,'sends'),4400],[CUEW(0,'Di María races'),5200],[CUEW(0,'in behind'),7400],[CUEW(0,'lifts'),6400],[on,5400],[on+1.6,7200],[S,7400]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),on=CUEW(0,'One');
  stadium(s,c,v,t,VENUE,[0,2,3],{roar:sm(on-.2,on+.4,t),flash:sm(on,on+.3,t)*(1-sm(SECS(0)-.9,SECS(0)-.4,t))});
  ground(s,c,PITCH,{bulge:bulge(tau),ballZ:NETP[2],ballY:1.2});
  draw(s,c,v,tau,tau1(twos(t)),tau1(twos(t)-1/12),{minBall:8,trail:tau>CHIP&&tau<NETHIT+.3?1:0});
 },
 aperture(t){const c=cam1(t),[x,z]=TR.pos(DM,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low behind Di María: past Lodi, the left-foot touch, the keeper rushing out
const tau2=(t:number)=>key(t,mono([[0,.7],[CUEW(1,'The pass'),1.05],[CUEW(1,'Renan'),1.75],[CUEW(1,'One'),TOUCH-.12],[CUEW(1,'left'),TOUCH+.05],[CUEW(1,'Here'),2.62],[CUEW(1,'rushing'),2.8],[SECS(1),2.95]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=TR.smooth(DM,tau),open=1-sm(0,1.1,t,easeInOutSine),push=sm(CUEW(1,'One')-.3,CUEW(1,'left')+.3,t,easeInOutSine),back=sm(CUEW(1,'Here')-.3,SECS(1),t,easeInOutSine);
 const b=ballAt(tau),T:V3=[lerp(lerp(b[0],m[0]+5,.5),101,.15+.4*back),lerp(Math.max(.9,b[1]*.55),.9,push),lerp(lerp(b[2],m[1],.5),5,.15+.4*back)],dx=T[0]-m[0],dz=T[2]-m[1],l=Math.hypot(dx,dz)||1,D=6+1.6*open-1.4*push+1.2*back;
 const C:V3=[m[0]-dx/l*D+.6,2.1+.7*open+.5*back,m[1]-dz/l*D-1.4];
 return look(C,T,2200+500*push-250*back-250*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),pf=CUEW(1,'The pass'),rl=CUEW(1,'Renan'),ot=CUEW(1,'One'),lf=CUEW(1,'left'),ai=CUEW(1,'and it'),hc=CUEW(1,'Here'),ro=CUEW(1,'rushing'),E=SECS(1);
  stadium(s,c,v,t,VENUE,[0,2]);
  ground(s,c,PITCH);
  // "the pass flies past": the yellow flight line of De Paul's ball; "Renan Lodi": a red ring round the defender it beats
  airArrow(s,c,passPts(),Y,sm(pf-.2,pf+.6,t,easeOut)*(1-sm(ot,ot+.4,t)),61,.12);
  const lp=TR.pos(LODI,tau);groundRing(s,c,lp[0],lp[1],1.1,1.1,R,sm(rl-.15,rl+.25,t,easeOutBack)*(1-sm(ot+.2,ot+.6,t)),62,.2);
  // "and it's his": a yellow ring round Di María and the ball; "here comes the keeper, rushing out": the keeper's red run arrow
  const mp=TR.pos(DM,tau);groundRing(s,c,mp[0]+.3,mp[1]-.2,1.2,1.2,Y,sm(ai-.1,ai+.3,t,easeOutBack)*(1-sm(hc,hc+.4,t)),63,.2);
  groundArrow(s,c,TR.path(GK,1.2,CHIP-.1,14),R,sm(hc-.2,hc+.5,t,easeOut)*(1-sm(E-.6,E-.3,t)),64,.12);
  const r=draw(s,c,v,tau,tau2(twos(t)),tau2(twos(t)-1/12),{minBall:5,hero:true,before:()=>{const g=TR.pos(GK,tau);groundRing(s,c,g[0],g[1],1.3,1.3,R,sm(ro-.2,ro+.2,t,easeOutBack)*(1-sm(E-.5,E-.2,t)),65,.25);}});
  // "one touch with his left foot": a yellow ring round the LEFT boot
  bootRing(s,heroOf(r),'l',Y,sm(ot-.1,lf+.1,t,easeOutBack)*(1-sm(lf+.5,lf+.9,t)));
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the chip over Ederson, into the net, then Di María
const tau3=(t:number)=>{const dr=CUEW(2,'drops');return key(t,mono([[0,CHIP-.75],[CUEW(2,'does'),CHIP-.45],[CUEW(2,'He chips'),CHIP],[CUEW(2,'gently'),CHIP+.3],[CUEW(2,'Ederson'),CHIP+.6],[dr,IN+.05],[SECS(2),IN+.05+(SECS(2)-dr)*.7]]),linear);};
const swing3=(t:number)=>sm(CUEW(2,'drops')+.4,SECS(2)-.3,t,easeInOutSine);
function cam3(t:number):Cam{
 const tau=tau3(t),m=TR.smooth(DM,Math.min(tau,IN)),u=swing3(t),e=sm(CHIP,IN,tau,easeInOutSine);
 const C0:V3=[107.5,2.6,-9.5],T0:V3=[lerp(m[0],99,.35*e),lerp(1.2,1.9,e),lerp(m[1],4,.35*e)];
 const md=TR.pos(DM,tau),C1:V3=[md[0]+6,1.9,md[1]-5.5],T1:V3=[md[0]-.3,1.1,md[1]];
 const arc=Math.sin(Math.PI*u);
 return look(add3(lerp3(C0,C1,u),[3*arc,3*arc,0]),lerp3(T0,T1,u),lerp(3900-800*sm(CUEW(2,'does'),CUEW(2,'He chips'),t,easeInOutSine),3000,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),db=CUEW(2,'does'),hc=CUEW(2,'He chips'),gn=CUEW(2,'gently'),ed=CUEW(2,'Ederson'),dr=CUEW(2,'drops'),u=swing3(t);
  stadium(s,c,v,t,VENUE,u<.5?[0,1,3]:[0,1,2,3],{roar:sm(IN,IN+.3,tau),flash:sm(dr-.1,dr+.3,t)*(1-sm(SECS(2)-.9,SECS(2)-.5,t)),lamps:sm(dr,dr+.4,t)});
  ground(s,c,PITCH,{goalLater:u<.5});
  // "does not blast it": the hard, low shot he didn't hit — a navy line straight at the keeper that is struck through and fades
  const blast=sm(db-.1,db+.3,t,easeOut)*(1-sm(hc-.3,hc,t));
  if(blast>0){const g=TR.pos(GK,CHIP),a=ballAt(CHIP-.02);groundArrow(s,c,[[a[0],a[2]],[lerp(a[0],g[0],.5),lerp(a[2],g[1],.5)],[g[0]-.3,g[1]]],K,blast,71,.1,.3);
   const mid=pr(c,[lerp(a[0],g[0],.55),.35,lerp(a[2],g[1],.55)]);if(mid){const w=Math.min(60,kAt(c,[a[0],.3,a[2]])*.5);strikeOut(s,mid,w,R,sm(db+.1,db+.4,t));}}
  // "gently": the chip's yellow dotted arc drawn ahead of the ball
  airArrow(s,c,chipPts(),Y,sm(gn-.25,gn+.5,t,easeOut)*(1-sm(dr+.2,dr+.6,t)),72,.09);
  const r=draw(s,c,v,tau,tau3(twos(t)),tau3(twos(t)-1/12),{minBall:5,hero:true,trail:tau>CHIP&&tau<NETHIT+.4?1-sm(NETHIT,NETHIT+.4,tau):0,
   before:()=>{const g=TR.pos(GK,tau);groundRing(s,c,g[0],g[1],1.2,1.2,R,sm(ed-.15,ed+.25,t,easeOutBack)*(1-sm(dr,dr+.3,t)),73,.2);}});
  // "he chips": a yellow ring round the left boot as it goes under the ball
  bootRing(s,heroOf(r),'l',Y,sm(hc-.3,hc,t,easeOutBack)*(1-sm(hc+.35,hc+.7,t)));
  if(u<.5){goal3(s,c,105,1,bulge(tau),NETP[2],1.2);spark(s,c,GIN,(tau-IN)*1.4,.45,74);}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=TR.pos(DM,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 4 · the lesson: low, side-on at the edge of the box
const tau4=(t:number)=>key(t,mono([[0,2.2],[CUEW(3,'when'),2.45],[CUEW(3,'rushes'),2.75],[CUEW(3,'stay'),CHIP-.2],[CUEW(3,'Lift'),CHIP],[CUEW(3,'over'),CHIP+.55],[SECS(3),IN]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=TR.smooth(DM,Math.min(tau,CHIP+.3)),g=TR.pos(GK,Math.min(tau,CHIP)),push=sm(CUEW(3,'stay')-.3,CUEW(3,'Lift'),t,easeInOutSine),back=sm(CUEW(3,'Lift'),SECS(3),t,easeInOutSine);
 const wg=lerp(.22,.42,sm(0,CUEW(3,'rushes'),t,easeInOutSine)),T:V3=[lerp(m[0],g[0],wg),1.1+.8*back,lerp(m[1],g[1],wg)];
 return look([T[0]-2,3.6+.8*back,T[2]+12.5-2*push+1.5*back],[T[0],T[1]*.5,T[2]],2000+350*push-250*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),wk=CUEW(3,'when'),ro=CUEW(3,'rushes'),sc=CUEW(3,'stay'),lb=CUEW(3,'Lift'),ot=CUEW(3,'over'),E=SECS(3);
  stadium(s,c,v,t,VENUE,[0,2]);
  ground(s,c,PITCH,{bulge:bulge(tau),ballZ:NETP[2],ballY:1.2});
  // "when the keeper rushes out": his red run arrow and ring; "stay calm": a steady yellow ring round Di María; "lift the ball gently
  // over them": the yellow chip arc, then a spark at its top as it clears the keeper's hands
  groundArrow(s,c,TR.path(GK,1.6,CHIP,14),R,sm(wk-.2,wk+.5,t,easeOut)*(1-sm(lb,lb+.4,t)),81,.12);
  const m=TR.pos(DM,tau);
  const r=draw(s,c,v,tau,tau4(twos(t)),tau4(twos(t)-1/12),{minBall:5,hero:true,trail:tau>CHIP?1:0,before:()=>{const g=TR.pos(GK,tau);groundRing(s,c,g[0],g[1],1.2,1.2,R,sm(ro-.15,ro+.25,t,easeOutBack)*(1-sm(lb,lb+.4,t)),82,.2);
   groundRing(s,c,m[0]+.3,m[1]-.2,1.3,1.3,Y,sm(sc-.15,sc+.3,t,easeOutBack)*(1-sm(ot,ot+.4,t)),83,.18);}});
  airArrow(s,c,chipPts(),Y,sm(lb-.3,lb+.5,t,easeOut)*(1-sm(E-.5,E-.2,t)),84,.09);
  bootRing(s,heroOf(r),'l',Y,sm(lb-.3,lb,t,easeOutBack)*(1-sm(lb+.4,lb+.8,t)));
  const top=ballAt(CHIP+.45);spark(s,c,top,tau-(CHIP+.45),.5,85);
 },
 still:4.2,
};

const film:RisoStory={
 id:ID,format:'11v11',title:'Di María’s Maracanã chip',theme:'When the keeper rushes out, lift the ball gently over them',
 ageNote:'Copa América final, Argentina 1–0 Brazil, Estádio do Maracanã, Rio de Janeiro, 10 July 2021 (22nd minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf and a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){touchTurf(s,x,y,age,seed,Y,R);},
};
export default film;
