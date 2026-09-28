/** Carlos Tevez — "The Olympic Final Winner" (lib/town/iconicPlays.json: kind "moment", template volley_goal, side center, distance box;
 * lesson "Keep moving in the box so you are ready the moment the chance arrives."). An iconic-play riso film (RisoStory, chapters mode): a
 * 1:1 reconstruction, from WRITTEN accounts (the footage itself was not reviewed frame by frame), of the only goal of the men's Olympic
 * football final, Argentina 1–0 Paraguay, Athens Olympic Stadium, Saturday 28 August 2004 (a morning kick-off in daylight), 18th minute.
 *
 * SOURCES (read 26 Sep 2026 with curl / web search, cached under scratchpad/six/):
 *  - ESPN / AP, "Argentina captures first Olympic gold" (espn-tev.txt): "Carlos Tevez scored his eighth goal of the tournament"; "Tevez,
 *    a 20-year-old Boca Juniors striker … beat two Paraguayan defenders to a cross from Mauro Rosales to score in the 18th minute before
 *    41,116 fans at the Olympic Stadium"; "A break from defense by AC Milan's Fabricio Coloccini started Rosales down the right. He crossed
 *    to the near post and Tevez ran between defenders Julio Manzur and Carlos Gamarra to prod the ball home from six yards."
 *  - Olympics.com (via the search record): "an early near-post flick, his eighth of the tournament to finish top scorer", Argentina's first
 *    Olympic football gold; the gold-medal match kicked off in the morning (07:00 UTC = 10:00 in Athens).
 *  - Wikipedia, "Football at the 2004 Summer Olympics – Men's tournament" (oly04.txt): the gold medal match, Argentina 1–0 Paraguay.
 *  - Card facts: Argentina (playerAppearance: skin 2, hair 0, short).
 * CONFIRMED: the match, venue, date, a morning (daylight) kick-off, 18th minute, 1–0 and Argentina's gold; Coloccini's BREAK FROM DEFENCE;
 *  Rosales DOWN THE RIGHT; a CROSS TO THE NEAR POST; Tevez RAN BETWEEN Manzur and Gamarra and PRODDED it home FROM SIX YARDS; his EIGHTH
 *  goal of the tournament.
 * INFERRED (illustrative; never narrated): every position, path and timing; the cross's height and pace (drawn: low and driven) and the
 *  finishing foot (drawn: his right, first time; never narrated); which of Manzur and Gamarra stood where (unnamed on screen, no numbers);
 *  that Coloccini passed to Rosales (drawn: one pass out to the right); where the ball went in (drawn: inside the near post); kits — both
 *  teams are drawn in their famous striped shirts (Argentina sky-blue and white with black shorts, Paraguay red and white with blue
 *  shorts), the keeper in yellow — the colours worn that morning were NOT confirmed; no shirt numbers are drawn; the Olympic Stadium as a
 *  bowl behind a running track under a bright sky (its roof shape is not drawn); the celebration; every camera.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window, never sheet.safe): 1 = the high main-stand camera in near real time
 * (Coloccini's break → the run down the right → the cross → Tevez first to the near post → goal); 2 = slow replay from a HIGH camera
 * behind Tevez (he keeps moving, between the two defenders, to the near post as the cross comes); 3 = replay from BEHIND THE GOAL (six
 * yards out, the prod, the net, gold); 4 = the lesson, side-on (keep moving → be ready → the chance arrives). All bodies go through ONE
 * adapter, drawPlayer() → athlete.ts. The world is right-handed like athlete.ts (X toward Paraguay's goal at 105, Y up, +Z = the near
 * touchline under the main camera = Argentina's right wing), so a cross from the right arrives at the near post (+Z). Shared machinery:
 * ./tv-kit-six.ts. Scenes read only (t, c); seeded randomness only. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,easeOut,easeOutBack,easeInOutSine,linear} from '../../paths/riso/motion';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type V3,type DrawResult} from './athlete';
import {Y,K,estimate,cueFn,mono,lerp3,lerpA,yawOf,bump,over,frame,look,toCam,scr,seg3,stadium,ground,goal3,bulgeAt,tracks,footOn,play,
 streaks,groundArrow,airArrow,groundRing,bootRing,spark,touchTurf,type Cam,type View,type Venue,type Pitch,type CastE} from './tv-kit-six';

const ID='tevez-olympic-final-2004',R='red',B='blue';
// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Athens, 2004: the Olympic final, Argentina against Paraguay. Fabricio Coloccini breaks out of defence. The winger races down the right and crosses to the near post. Carlos Tevez gets there first... Goal!',tail:1.8,
  cues:['Athens','the Olympic','Argentina against','Fabricio Coloccini','breaks out','The winger','down the right','crosses','Carlos Tevez','gets there','Goal']},
 {label:'Watch Tevez',text:'Watch Tevez. He never stops moving. He runs between two defenders, toward the near post, just as the cross comes in.',tail:1.2,
  cues:['Watch Tevez','He never','He runs','between two','toward the near','just as']},
 {label:'The finish',text:'From six yards, he prods it in! His eighth goal of the Olympics, and Argentina win the gold!',tail:1.8,
  cues:['From six','prods','His eighth','and Argentina','gold']},
 {label:'Your turn',text:'Your turn: keep moving in the box, so you are ready the moment the chance arrives!',tail:1.5,
  cues:['Your turn','keep moving','so you are ready','the moment','chance arrives']},
];
/** VOICE: the Kokoro narration (scripts/plays/kokoro-narrate.py tevez-olympic-final-2004 → timing.json): withTiming re-times the film. */
import timingJson from '../../../public/plays/narration/tevez-olympic-final-2004/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail,ID);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUEW=cueFn(CHAPTERS,ID),SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- venue + kits
/** Athens in the morning: a bright sky, a big open bowl behind a red running track (inferred look) */
const VENUE:Venue={sky:'day',crowd:[[B,3],['paper',3],[R,2],[Y,1]],fill:.65,gap:9,tiers:0,roof:false,seed:51};
const PITCH:Pitch={grass:[[Y,.9],[B,.5]],stripe:[B,.16],track:R,gap:9};
const SKIN:InkFill[]=[[Y,.34],[R,.22]],SKIN_S:InkFill[]=[[Y,.36],[R,.26],[K,.04]],SKIN_M:InkFill[]=[[Y,.42],[R,.32],[K,.12]],SKIN_D:InkFill[]=[[R,.45],[Y,.5],[K,.24]];
/** Argentina: sky-blue and white stripes, black shorts, white socks (NOT confirmed for this match) */
const ARG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],pattern:'stripes',patternInk:'paper',shorts:[K,.95],socks:'paper',boots:K,skin:SKIN,hair:[K,.9],hairStyle:'short',line:K,shade:[B,.3],sleeves:'short',seed:5,...o});
/** Tevez: about 1.73 m, stocky, short dark hair (no shirt number drawn — his Olympic number was not checked) */
const TEV_ST=ARG({skin:SKIN_D,hair:[K,.95],build:{height:1.73,bulk:1.08,thighs:1.1},seed:32});
/** Paraguay: red and white stripes, blue shorts (NOT confirmed for this match) */
const PAR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:[R,.95],shorts:[B,.95],socks:[B,.95],boots:K,skin:SKIN_M,hair:[K,.95],hairStyle:'short',line:K,shade:[K,.25],sleeves:'short',seed:3,...o});
const GK_ST:AthleteStyle={shirt:[Y,.95],shorts:[K,.9],socks:[Y,.95],boots:K,skin:SKIN_M,hair:[K,.9],hairStyle:'short',line:K,shade:[B,.4],gloves:'paper',sleeves:'long',trim:K,build:{height:1.86,bulk:1.02},seed:23};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the play: tracks (τ = seconds after Coloccini's pass out to the right)
type Actor={role:'tev'|'arg'|'par'|'cb'|'gk';style:AthleteStyle;keys:number[][];key?:boolean};
const RX=1.1,CROSS=3.6,PROD=4.35,IN=PROD+.3,NETHIT=IN+.1;
const ACTORS:Actor[]=[
 {role:'tev',style:TEV_ST,key:true,keys:[[-3,76,-6],[-1.5,80,-5],[0,83.5,-4.2],[1.2,87.2,-3],[2.2,90.5,-1.6],[2.9,93.2,-1.2],[3.4,95.6,.2],[3.9,97.6,1.4],[4.35,99.1,2.1],[4.8,100.2,2.5],[6,101.2,4.6],[8,100,10]]},
 {role:'cb',style:PAR({seed:41,build:{height:1.86},skin:SKIN_M}),key:true,keys:[[-3,88,6],[0,92,5.5],[2,95.5,4.8],[3.6,97.5,4.2],[4.35,98.4,3.9],[6,98.8,3.8]]},
 {role:'cb',style:PAR({seed:42,build:{height:1.82},skin:SKIN_S}),key:true,keys:[[-3,87,-2],[0,91,-1.4],[2,94.5,-.6],[3.6,97,.2],[4.35,98.2,.3],[6,98.6,.4]]},
 {role:'gk',style:GK_ST,key:true,keys:[[-3,102.5,.5],[3,102.6,1.2],[3.9,103.2,2.2],[4.35,103.4,2.6],[8,103.4,2.6]]},
 {role:'arg',style:ARG({seed:7,skin:SKIN_S,build:{height:1.84},hair:[K,.9],hairStyle:'long'}),key:true,keys:[[-3,40,8],[-1.5,45,9.5],[0,49,10.8],[1,51,11.5],[4,54,12]]},
 {role:'arg',style:ARG({seed:8,skin:SKIN_M,build:{height:1.73}}),key:true,keys:[[-3,56,25],[0,63,27.5],[1.1,69,28.4],[2.3,77.6,29.2],[3.6,86.2,29.4],[4.6,88.5,28.6],[8,90,27]]},
 {role:'par',style:PAR({seed:43,skin:SKIN_D}),keys:[[-3,70,22],[0,75,24],[2,80,26],[3.6,84.5,26.5],[8,88,24]]},
 {role:'par',style:PAR({seed:44,skin:SKIN_M}),keys:[[-3,84,-12],[0,88,-10],[3.6,93,-7],[8,96,-5]]},
 {role:'arg',style:ARG({seed:17,skin:SKIN_S}),keys:[[-3,70,-14],[0,76,-12],[3.6,86,-9],[8,92,-6]]},
 {role:'par',style:PAR({seed:45,skin:SKIN_S}),keys:[[-3,68,4],[0,72,6],[3.6,80,9],[8,86,8]]},
 {role:'arg',style:ARG({seed:18,skin:SKIN_M}),keys:[[-3,62,0],[0,68,1],[3.6,78,4],[8,84,5]]},
];
const TV=0,M1=1,M2=2,GK=3,CO=4,WG=5;
const TR=tracks(ACTORS.map(a=>a.keys),-5,9);
// ---------------------------------------------------------------- the ball: Coloccini's carry → out to the right → the run → the low cross to the near post → the prod → the net
const C0=footOn(TR,CO,0,1),RP=footOn(TR,WG,RX,1),XP=footOn(TR,WG,CROSS,1),PP=footOn(TR,TV,PROD,1,.4);
const GIN:V3=[105.05,.45,2.6],NETP:V3=[106.6,.55,2.8],REST:V3=[106.3,.11,2.8];
const l2=(a:[number,number],b:[number,number],u:number):[number,number]=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
function ballAt(tau:number):V3{
 if(tau<0){const p=footOn(TR,CO,tau,1),b=.3*Math.abs(Math.sin(TR.dist(CO,tau)/2.2*Math.PI));return[p[0]+b,.11,p[1]];}
 if(tau<RX){const u=tau/RX,p=l2(C0,RP,u);return[p[0],.11+4*1.6*u*(1-u),p[1]];}
 if(tau<CROSS){const p=footOn(TR,WG,tau,1),b=.35*Math.abs(Math.sin(TR.dist(WG,tau)/2.4*Math.PI));return[p[0]+b,.11,p[1]];}
 if(tau<PROD){const u=(tau-CROSS)/(PROD-CROSS),p=l2(XP,PP,u);return[p[0],lerp(.11,.35,u)+4*.9*u*(1-u),p[1]];}
 if(tau<IN){const u=(tau-PROD)/(IN-PROD);return[lerp(PP[0],GIN[0],u),lerp(.35,GIN[1],u),lerp(PP[1],GIN[2],u)];}
 if(tau<NETHIT){const u=(tau-IN)/(NETHIT-IN);return lerp3(GIN,NETP,u);}
 const u=clamp((tau-NETHIT)/.5),e=1-(1-u)*(1-u);return[lerp(NETP[0],REST[0],e),lerp(NETP[1],REST[1],e),lerp(NETP[2],REST[2],e)];
}
const bulge=(tau:number)=>.6*bulgeAt(tau,NETHIT);
const crossPts=(n=14):V3[]=>{const o:V3[]=[];for(let i=0;i<=n;i++)o.push(ballAt(lerp(CROSS,PROD,i/n)));return o;};

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** Tevez's stride lands the right foot on the ball at PROD */
const PH0=Math.floor(TR.dist(TV,PROD)/3.3)+touchPhase;
const gaitTev=(tau:number)=>TR.dist(TV,tau)/3.3+PH0-TR.dist(TV,PROD)/3.3;
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=TR.vel(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=TR.pos(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='par'||a.role==='cb'?READY:stand();
 let p:Pose;
 if(k===TV){
  // always moving: a curved run, eyes on the ball out wide, then the first-time prod at the near post
  if(tau<PROD-.2)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),.35);
  const s=clamp((sp-2)/4.5);p=blendPose(idle,runCycle(gaitTev(tau),{speed:.55+.45*s}),clamp((sp-.3)/.8));
  const D=.6,u=(tau-(PROD-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.45}),Math.min(sm(0,.12,u),1-sm(1,1.4,u)));
  if(tau>NETHIT+.25)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(NETHIT+.25,NETHIT+.75,tau));
 }
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(TR.dist(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(TR.dist(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 if(k===CO&&tau<0)p=blendPose(p,dribble(TR.dist(CO,tau)/2.2,{foot:'r',speed:.6}),clamp((sp-.3)/.8));
 if(k===CO){const D=.7,u=(tau-(0-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(k===WG){if(tau>RX&&tau<CROSS)p=blendPose(p,dribble(TR.dist(WG,tau)/2.4,{foot:'r',speed:.9}),clamp((sp-.3)/.8));
  const D=.75,u=(tau-(CROSS-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.8}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));yaw=lerpA(yaw,yawOf(PP[0]-x,PP[1]-z),bump(0,1.4,u));}}
 if(a.role==='cb'&&tau>CROSS-.3)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),sm(CROSS-.3,CROSS,tau));
 if(k===GK&&tau>PROD-.08)p=keeperDive(clamp((tau-PROD+.08)/.8),{side:'l',height:.2});
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
function draw(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;trail?:number;before?:()=>void}={}){
 return play(s,c,v,tau,{n:ACTORS.length,pos:TR.pos,ball:ballAt,draw:(k:number,e:CastE,q:{passing:boolean;px:number})=>{
  const a=ACTORS[k],{p,yaw}=poseOf(k,tauP),big=e.h>=300,detail=q.passing?(k===TV?'mid':'low'):q.px<50||(!a.key&&q.px<110)?'low':'auto';
  return drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&a.key&&!q.passing?{prev:poseOf(k,tauPrev).p,smear:!!o.hero&&k===TV}:{});}},
  {minBall:o.minBall,trail:o.trail,trailFrom:CROSS,before:o.before});
}
const replay=(s:Sheet,c:Cam,v:View,tau:number,t:number,map:(t:number)=>number,before?:()=>void,trail=0)=>draw(s,c,v,tau,map(twos(t)),map(twos(t)-1/12),{minBall:5,hero:true,trail,before});

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const gl=CUEW(0,'Goal'),S=SECS(0);return key(t,mono([[0,-3],[CUEW(0,'Fabricio'),-1.4],[CUEW(0,'breaks'),-.4],[CUEW(0,'The winger'),RX+.2],[CUEW(0,'crosses'),CROSS],[CUEW(0,'Carlos'),CROSS+.4],[CUEW(0,'gets'),PROD],[gl,IN+.3],[S+1,IN+.3+(S+1-gl)*.95]]),linear);};
const CAM1:V3=[70,20,90];
function cam1(t:number):Cam{
 const tau=tau1(t),S=SECS(0),gl=CUEW(0,'Goal');
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,IN));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,1.2,(b0[2]+b1[2]+b2[2])/3];
 const box=sm(CUEW(0,'crosses')-.6,CUEW(0,'crosses')+.4,t,easeInOutSine),T=lerp3(bt,[98,1,3],.55*box);
 const F=key(t,mono([[0,4400],[CUEW(0,'breaks'),4600],[CUEW(0,'down the right'),5400],[CUEW(0,'crosses'),5800],[CUEW(0,'gets'),7400],[gl,7200],[S,7800]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),gl=CUEW(0,'Goal');
  stadium(s,c,v,t,VENUE,[0,2,3],{roar:sm(gl-.2,gl+.4,t),flash:sm(gl,gl+.3,t)*(1-sm(SECS(0)-.9,SECS(0)-.4,t))});
  ground(s,c,PITCH,{bulge:bulge(tau),ballZ:NETP[2],ballY:.5});
  draw(s,c,v,tau,tau1(twos(t)),tau1(twos(t)-1/12),{minBall:8,trail:tau>CROSS&&tau<NETHIT+.3?1:0});
 },
 aperture(t){const c=cam1(t),[x,z]=TR.pos(TV,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, high behind Tevez: always moving, between the two, to the near post as the cross comes
const tau2=(t:number)=>key(t,mono([[0,.6],[CUEW(1,'He never'),1.3],[CUEW(1,'He runs'),2.6],[CUEW(1,'between'),3.1],[CUEW(1,'toward'),3.6],[CUEW(1,'just as'),CROSS+.3],[SECS(1),PROD+.05]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=TR.smooth(TV,tau),back=sm(CUEW(1,'toward')-.3,SECS(1),t,easeInOutSine);
 return look([m[0]-9,7.5-1.5*back,m[1]-5.5+2*back],[lerp(m[0]+8,99.5,back*.6),.6,lerp(m[1]+3,2.4,back*.6)],1550+350*back);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),hn=CUEW(1,'He never'),bt=CUEW(1,'between'),tw=CUEW(1,'toward'),ja=CUEW(1,'just as'),E=SECS(1);
  stadium(s,c,v,t,VENUE,[0,2]);
  ground(s,c,PITCH);
  // "he never stops moving": his yellow run drawn along behind him as he goes; "between two defenders": red rings on the pair; "toward
  // the near post": a yellow ring on the spot he is running to; "just as the cross comes in": the cross's blue flight line
  groundArrow(s,c,TR.path(TV,Math.max(0,tau-1.8),Math.max(.3,tau+.15),16),Y,sm(hn-.2,hn+.5,t,easeOut)*(1-sm(E-.5,E-.2,t)),61,.14);
  groundRing(s,c,PP[0],PP[1],1.2,1.2,Y,sm(tw-.15,tw+.3,t,easeOutBack)*(1-sm(E-.4,E-.15,t)),62,.22);
  airArrow(s,c,crossPts(),B,sm(ja-.2,ja+.5,t,easeOut),63,.1);
  replay(s,c,v,tau,t,tau2,()=>{for(const [k,sd] of [[M1,64],[M2,65]] as [number,number][]){const q=TR.pos(k,tau);groundRing(s,c,q[0],q[1],1.1,1.1,R,sm(bt-.15,bt+.25,t,easeOutBack)*(1-sm(E-.5,E-.2,t)),sd,.2);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.14/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: six yards out, the prod, the net, gold
const tau3=(t:number)=>{const g=CUEW(2,'gold');return key(t,mono([[0,CROSS+.1],[CUEW(2,'prods'),PROD],[CUEW(2,'His eighth'),NETHIT+.3],[g,NETHIT+1.2],[SECS(2),NETHIT+1.2+(SECS(2)-g)*.7]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=TR.smooth(TV,tau),u=sm(CUEW(2,'His eighth'),SECS(2),t,easeInOutSine);
 return look([111.5,4.2+.5*u,13],[lerp(m[0],103.5,.55*(1-u)),1,lerp(m[1],2.5,.55*(1-u))],lerp(2300+700*sm(CUEW(2,'From')-.2,CUEW(2,'prods'),t,easeInOutSine),3000,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),fs=CUEW(2,'From'),pr_=CUEW(2,'prods'),he=CUEW(2,'His eighth'),aw=CUEW(2,'and Argentina'),gd=CUEW(2,'gold'),E=SECS(2);
  stadium(s,c,v,t,VENUE,[0,1,3],{roar:sm(IN,IN+.3,tau),flash:sm(aw-.2,aw+.3,t)*(1-sm(E-.9,E-.5,t))});
  ground(s,c,PITCH,{goalLater:true});
  // "from six yards": the six-yard box printed yellow; "prods it in": a yellow ring round the right boot; "his eighth goal": a spark in the
  // net; "win the gold": gold (yellow) confetti bursts over the crowd
  const sy=sm(fs-.2,fs+.3,t,easeOut)*(1-sm(he,he+.4,t));if(sy>0){const six=new Path2D();const L=(a:V3,b:V3)=>seg3(c,a,b,.35,six);L([105,.03,-9.16],[99.5,.03,-9.16]);L([99.5,.03,-9.16],[99.5,.03,9.16]);L([99.5,.03,9.16],[105,.03,9.16]);s.fill(Y,six,.95*sy);}
  const r=replay(s,c,v,tau,t,tau3,undefined,tau>CROSS&&tau<NETHIT+.4?1-sm(NETHIT,NETHIT+.4,tau):0);
  bootRing(s,r.res[TV],'r',Y,sm(pr_-.3,pr_,t,easeOutBack)*(1-sm(pr_+.35,pr_+.7,t)));
  goal3(s,c,105,1,bulge(tau),NETP[2],.5);
  spark(s,c,GIN,(tau-IN)*1.2,.45,74);
  for(let i=0;i<3;i++)spark(s,c,[104-i*9,10+i*3,-30+i*14],(t-gd)*1.3-i*.18,4,75+i);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=TR.pos(TV,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4,
};

// ---------------------------------------------------------------- 4 · the lesson: side-on in the box
const tau4=(t:number)=>key(t,mono([[0,1.2],[CUEW(3,'keep'),1.8],[CUEW(3,'so you'),2.9],[CUEW(3,'the moment'),CROSS+.2],[CUEW(3,'chance'),PROD],[SECS(3),PROD+.6]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=TR.smooth(TV,Math.min(tau,PROD)),push=sm(CUEW(3,'so you')-.3,CUEW(3,'chance'),t,easeInOutSine),T:V3=[m[0]+2.5,.9,m[1]+1.5];
 return look([T[0]-10+2*push,4-.6*push,T[2]+2.5],T,1850+450*push);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),km=CUEW(3,'keep'),sy=CUEW(3,'so you'),tm=CUEW(3,'the moment'),ca=CUEW(3,'chance'),E=SECS(3);
  stadium(s,c,v,t,VENUE,[1,2]);
  ground(s,c,PITCH,{bulge:bulge(tau),ballZ:NETP[2],ballY:.5});
  // "keep moving in the box": his yellow run; "so you are ready": a yellow ring on him, feet going; "the moment the chance arrives": the
  // cross line in blue and a ring on the ball as it reaches his boot
  groundArrow(s,c,TR.path(TV,Math.max(0,tau-1.6),Math.max(.3,tau+.1),14),Y,sm(km-.2,km+.5,t,easeOut)*(1-sm(E-.5,E-.2,t)),81,.14);
  airArrow(s,c,crossPts(),B,sm(tm-.2,tm+.4,t,easeOut),82,.1);
  const m=TR.pos(TV,tau);
  const r=replay(s,c,v,tau,t,tau4,()=>groundRing(s,c,m[0],m[1],1.1,1.1,Y,sm(sy-.1,sy+.3,t,easeOutBack)*(1-sm(tm,tm+.3,t)),83,.18));
  bootRing(s,r.res[TV],'r',Y,sm(ca-.2,ca+.1,t,easeOutBack)*(1-sm(E-.4,E-.15,t)));
 },
 still:3.6,
};

const film:RisoStory={
 id:ID,format:'11v11',title:'Tevez’s Olympic gold goal',theme:'Keep moving in the box so you are ready the moment the chance arrives',
 ageNote:'Men’s Olympic football final, Argentina 1–0 Paraguay, Olympic Stadium, Athens, 28 August 2004 (18th minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of sunlit turf and a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){touchTurf(s,x,y,age,seed,Y,R);},
};
export default film;
