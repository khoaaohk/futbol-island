/** Mesut Özil — "The Solo Goal v Ludogorets" (lib/town/iconicPlays.json: kind "moment", template solo_dribble_goal, side center, beaten 3,
 * distance box, foot left; lesson "Stay calm in front of goal: one more touch can send the defenders sliding past."). An iconic-play riso
 * film (RisoStory, chapters mode): a 1:1 reconstruction, from WRITTEN accounts (the footage itself was not reviewed frame by frame), of
 * Arsenal's winner in Ludogorets 2–3 Arsenal, UEFA Champions League group A, Vasil Levski National Stadium, Sofia, Tuesday 1 November 2016
 * (night, floodlit), 88th minute (2–2 → 2–3).
 *
 * SOURCES (read 26 Sep 2026 with curl, cached under scratchpad/six/):
 *  - These Football Times, "Mesut Özil's ballet in Bulgaria" (tft.txt): "an ill-conceived Ludogorets raid forward that broke down midway
 *    into Arsenal's half … leaving Mohamed Elneny to pick up the loose possession … swept a searching ball into Özil's unfolding path, over
 *    the heads … of the defenders"; "After a single touch that slowed the ball to match his stride, Özil lifted his head and found the
 *    goalkeeper suddenly out of his area and bearing down on him"; "Feigning an early shot, he dinked the ball neatly over the despairing
 *    custodian … before Özil took one further cushioned touch with the outside of his left boot"; "the two Ludogorets defenders … had
 *    scurried back to their area and … positioned themselves between the attacker and his target. As Özil raised his foot once more, the
 *    pair … dived … before falling to the ground … simply faked one last shot before evading them entirely and rolling the ball into the
 *    unguarded goal."
 *  - SPORTbible (sb.txt): Elneny "played Ozil in behind and he beat the Ludogorets offside trap with a superbly timed run. After a perfect
 *    first touch, the goalkeeper came rushing out and Ozil delicately flicked the ball over his head. Two defenders came charging back in …
 *    an insane feint. They both went sliding … rolling the ball into the net"; Özil called it his "best ever goal". Yahoo Sports / FC
 *    Yahoo (yh.txt): 88th minute, 3–2 comeback after 0–2 (Xhaka, Giroud), "making goalkeeper Milan Borjan and two Ludogorets look foolish".
 *  - Getty Images captions (getty2.txt): "Mesut Ozil knocks the ball past Milan Borjan of Ludogorets … Vasil Levski".
 *  - Card facts: Germany (playerAppearance: skin 1, hair 0, slick); Özil's Arsenal number 11.
 * CONFIRMED: the match, venue, date, late winner (87th–88th minute), 2–2 → 2–3; Elneny's long ball over the defenders from inside Arsenal's
 *  half; Özil beat the offside trap; ONE touch to slow it; the keeper (Borjan) rushed OUT OF HIS AREA; Özil faked a shot and DINKED it
 *  over him; a cushioned touch with the OUTSIDE OF HIS LEFT BOOT; TWO defenders got back between him and the goal; he faked again, BOTH
 *  SLID, and he ROLLED it into the empty net.
 * INFERRED (illustrative; never narrated): every position, path and timing (Elneny ~30 m from his own goal, the ball landing ~34 m from
 *  goal, the dink ~28 m out, the fake ~13 m out); which way he went round the sliding pair (drawn: to his left) and the feet of the first
 *  touch, dink and finish (drawn: his left, his strong foot, as the card says); the other players (unnamed, no numbers); kits — Arsenal
 *  in red with white trim and white shorts, Ludogorets in green with white shorts (the home side's colours), the keeper in yellow; which
 *  end Arsenal attacked on the TV picture (drawn: screen-right); the bowl and the crowd; the celebration; every camera.
 *
 * FRAMING (the TV broadcast, never top-down; full-sheet card window, never sheet.safe): 1 = the high main-stand camera in near real time
 * (the long ball → through → dink → the sliding pair → the roll in); 2 = slow replay LOW behind Özil (the soft touch, the keeper rushing,
 * the dink); 3 = replay from BEHIND THE GOAL (the pair racing back, the fake, the slides, the roll into the net); 4 = the lesson, low and
 * side-on in the box (stay calm → one more touch → they slide past). All bodies go through ONE adapter, drawPlayer() → athlete.ts. The world
 * is right-handed like athlete.ts (X toward Ludogorets' goal at 105, Y up, +Z = the near touchline under the main camera), so a figure
 * attacking +X has its left side at −Z and Özil's LEFT boot plays with no mirrored projector. Shared machinery: ./tv-kit-six.ts. Inks:
 * yellow, red (Arsenal), green (Ludogorets, the grass), navy — no blue. Scenes read only (t, c); seeded randomness only. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,easeOut,easeOutBack,easeInOutSine,linear} from '../../paths/riso/motion';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,strike,keeperSet,keeperDive,slideTackle,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type V3,type DrawResult} from './athlete';
import {Y,K,estimate,cueFn,mono,lerp3,lerpA,yawOf,bump,over,frame,look,toCam,scr,stadium,ground,goal3,bulgeAt,tracks,footOn,play,
 streaks,groundArrow,airArrow,groundRing,bootRing,spark,touchTurf,add3,type Cam,type View,type Venue,type Pitch,type CastE} from './tv-kit-six';

const ID='ozil-ludogorets-2016',R='red',G='green';
// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Sofia, 2016: Arsenal and Ludogorets are level near the end. Mohamed Elneny sends a long ball over the defence. Mesut Özil is through! He lifts it over the keeper, sends two defenders sliding... and rolls it in!',tail:1.8,
  cues:['Sofia','Arsenal and','level near','Mohamed Elneny','sends a long','Mesut Özil','He lifts','sends two','rolls']},
 {label:'Watch it again',text:'Watch again. One soft touch slows the ball down. The keeper rushes out, so Özil dinks it over him!',tail:1.2,
  cues:['Watch again','One soft','slows','The keeper','rushes out','dinks']},
 {label:'The fake',text:'Two defenders race back to guard the goal. Özil pretends to shoot. They both slide... and he calmly rolls it past them into the net!',tail:1.8,
  cues:['Two defenders','race back','Özil pretends','They both','slide','calmly','into the net']},
 {label:'Your turn',text:'Your turn: stay calm in front of goal. One more touch can send the defenders sliding past!',tail:1.5,
  cues:['Your turn','stay calm','One more','send the','sliding past']},
];
/** VOICE: the Kokoro narration (scripts/plays/kokoro-narrate.py ozil-ludogorets-2016 → timing.json): withTiming re-times the film. */
import timingJson from '../../../public/plays/narration/ozil-ludogorets-2016/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail,ID);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUEW=cueFn(CHAPTERS,ID),SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- venue + kits
const VENUE:Venue={sky:'night',crowd:[[G,4],['paper',3],[R,1],[K,1]],fill:.55,tiers:0,alt:G,seed:21};
const PITCH:Pitch={grass:[[G,.82],[Y,.28]],stripe:[K,.1]};
const SKIN:InkFill[]=[[Y,.34],[R,.22]],SKIN_S:InkFill[]=[[Y,.36],[R,.26],[K,.04]],SKIN_M:InkFill[]=[[Y,.42],[R,.32],[K,.12]],SKIN_D:InkFill[]=[[R,.45],[Y,.5],[K,.24]];
/** Arsenal: red shirts with white trim, white shorts (inferred detail) */
const ARS=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],trim:'paper',shorts:'paper',socks:'paper',boots:K,numberInk:'paper',skin:SKIN,hair:[K,.9],hairStyle:'short',line:K,shade:[K,.25],sleeves:'short',seed:5,...o});
/** Özil: number 11, about 1.80 m and slim, dark slicked-back hair */
const OZ_ST=ARS({number:11,skin:SKIN_S,hair:[K,.95],build:{height:1.8,bulk:.9},seed:11});
/** Ludogorets: green shirts, white shorts, green socks (inferred) */
const LUD=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[G,.95],shorts:'paper',socks:[G,.95],boots:K,trim:'paper',skin:SKIN_M,hair:[K,.95],hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',seed:3,...o});
const GK_ST:AthleteStyle={shirt:[Y,.95],shorts:[K,.9],socks:[Y,.95],boots:K,skin:SKIN_S,hair:[K,.9],hairStyle:'short',line:K,shade:[G,.4],gloves:'paper',sleeves:'long',trim:K,build:{height:1.96,bulk:1.05},seed:23};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
}

// ---------------------------------------------------------------- the play: tracks (τ = seconds after Elneny's pass)
type Actor={role:'hero'|'ars'|'lud'|'def'|'gk';style:AthleteStyle;keys:number[][];key?:boolean};
const LAND=1.85,T1=2.05,DINK=2.9,DL=3.75,T3=4.35,T4=5.05,FAKE=5.8,ROLL=7.0,IN=ROLL+1.15,NETHIT=IN+.12;
const ACTORS:Actor[]=[
 {role:'hero',style:OZ_ST,key:true,keys:[[-4,45,5.5],[-2,51,4.8],[0,57.5,3.8],[1,63.5,3],[2.05,70.2,2.2],[2.9,76.5,1.7],[3.4,79.4,.2],[3.9,82.4,-.3],[4.35,84.9,0],[5.05,88.4,-.1],[5.8,91.2,-.3],[6.3,92.6,-2],[7,94.4,-2.8],[7.6,95.6,-2.6],[8.6,97.4,-1.6],[10,99.5,1]]},
 {role:'def',style:LUD({seed:41,build:{height:1.86},skin:SKIN_M}),key:true,keys:[[-4,55,-3],[0,58.2,-2.4],[1,60.5,-2],[2,65.5,-1.4],[4,82,-.4],[5.3,92.2,.2],[5.8,93.4,.3],[6.35,92.3,-.1],[10,92.3,-.1]]},
 {role:'def',style:LUD({seed:42,build:{height:1.84},skin:SKIN_D}),key:true,keys:[[-4,55.5,6],[0,58.4,5.4],[1,60.8,5],[2,66,4.4],[4,83,3],[5.3,93,2.1],[5.8,94.1,2],[6.4,92.9,1.4],[10,92.9,1.4]]},
 {role:'gk',style:GK_ST,key:true,keys:[[-4,99,0],[0,97.5,.5],[1.5,90,1.1],[2.6,82.6,1.3],[2.95,81.3,1.3],[10,81.3,1.3]]},
 {role:'ars',style:ARS({skin:SKIN_D,seed:7,build:{height:1.75}}),key:true,keys:[[-4,24,-8],[-1,28,-6.2],[0,30,-5.6],[2,33,-5],[6,40,-3],[10,46,-2]]},
 {role:'ars',style:ARS({seed:17,skin:SKIN_S,build:{height:1.92}}),keys:[[-4,50,-11],[0,56,-9.5],[4,70,-6],[8,84,-3],[10,90,-1]]},
 {role:'ars',style:ARS({seed:18,skin:SKIN_M}),keys:[[-4,36,9],[0,40,8],[5,52,8],[10,62,7]]},
 {role:'lud',style:LUD({seed:43,skin:SKIN_D}),keys:[[-4,27,-3],[0,30,-2.5],[3,36,-1],[10,50,0]]},
 {role:'lud',style:LUD({seed:44,skin:SKIN_S,hairStyle:'bald'}),keys:[[-4,38,3],[0,42,3],[4,52,2],[10,66,1]]},
 {role:'lud',style:LUD({seed:45,skin:SKIN_M}),keys:[[-4,44,-14],[0,50,-12],[5,64,-8],[10,76,-5]]},
];
const OZ=0,DA=1,DB=2,GK=3,EL=4;
const TR=tracks(ACTORS.map(a=>a.keys),-6,11);
// ---------------------------------------------------------------- the ball: Elneny's long ball → the soft touch → the dink over the keeper → the outside-of-the-left cushion → the fake → the roll in
const E0=footOn(TR,EL,0,1),LANDP:[number,number]=[69.4,2.4],TP1=footOn(TR,OZ,T1,-1),DP=footOn(TR,OZ,DINK,-1),LD:[number,number]=[84.2,.2],TP3=footOn(TR,OZ,T3,-1),TP4=footOn(TR,OZ,T4,-1),FP=footOn(TR,OZ,FAKE,-1),RP=footOn(TR,OZ,ROLL,-1);
const GIN:V3=[105.05,.11,-1.3],NETP:V3=[106.6,.2,-1.5],REST:V3=[106.3,.11,-1.5];
const lerp2=(a:[number,number],b:[number,number],u:number):[number,number]=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
function ballAt(tau:number):V3{
 if(tau<0){const p=footOn(TR,EL,tau,1);return[p[0],.11,p[1]];}
 if(tau<LAND){const u=tau/LAND;return[lerp(E0[0],LANDP[0],u),.11+4*5*u*(1-u),lerp(E0[1],LANDP[1],u)];}
 if(tau<T1){const u=(tau-LAND)/(T1-LAND),p=lerp2(LANDP,TP1,u);return[p[0],.11+.25*u+4*.45*u*(1-u),p[1]];}
 if(tau<DINK){const u=(tau-T1)/(DINK-T1),p=lerp2(TP1,DP,1-(1-u)*(1-u));return[p[0],.11+.25*(1-u)*(1-u),p[1]];}
 if(tau<DL){const u=(tau-DINK)/(DL-DINK),p=lerp2(DP,LD,u);return[p[0],.11+4*2.7*u*(1-u),p[1]];}
 if(tau<T3){const u=(tau-DL)/(T3-DL),p=lerp2(LD,TP3,u);return[p[0],.11+4*.35*u*(1-u),p[1]];}
 if(tau<T4){const u=(tau-T3)/(T4-T3),p=lerp2(TP3,TP4,1-(1-u)*(1-u));return[p[0],.11,p[1]];}
 if(tau<FAKE){const u=(tau-T4)/(FAKE-T4),p=lerp2(TP4,FP,1-(1-u)*(1-u));return[p[0],.11,p[1]];}
 if(tau<ROLL){const u=(tau-FAKE)/(ROLL-FAKE),p=lerp2(FP,RP,u);return[p[0],.11,p[1]];}
 if(tau<IN){const u=(tau-ROLL)/(IN-ROLL),e=u*(1.2-.2*u);return[lerp(RP[0],GIN[0],e),.11,lerp(RP[1],GIN[2],e)];}
 if(tau<NETHIT){const u=(tau-IN)/(NETHIT-IN);return lerp3(GIN,NETP,u);}
 const u=clamp((tau-NETHIT)/.5),e=1-(1-u)*(1-u);return[lerp(NETP[0],REST[0],e),.11+(.2-.11)*(1-e),lerp(NETP[2],REST[2],e)];
}
const bulge=(tau:number)=>.55*bulgeAt(tau,NETHIT);
const dinkPts=(n=16):V3[]=>{const o:V3[]=[];for(let i=0;i<=n;i++)o.push(ballAt(lerp(DINK,DL,i/n)));return o;};
const rollPts=(n=12):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<=n;i++){const b=ballAt(lerp(ROLL,IN,i/n));o.push([b[0],b[2]]);}return o;};

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** Özil's gait: free running by distance; from the first touch whole strides between touches, so the LEFT boot meets the ball at each */
const TOUCHES=[T1,DINK,T3,T4,FAKE,ROLL];
const PH_KEYS:[number,number][]=(()=>{const o:[number,number][]=[[T1,Math.floor(TR.dist(OZ,T1)/3.2)+touchPhase]];for(let i=1;i<TOUCHES.length;i++){const d=TR.dist(OZ,TOUCHES[i])-TR.dist(OZ,TOUCHES[i-1]);o.push([TOUCHES[i],o[i-1][1]+Math.max(1,Math.round(d/3.2))]);}return o;})();
function gaitPh(tau:number){const f=(u:number)=>TR.dist(OZ,u)/3.2,a=PH_KEYS[0],z=PH_KEYS[PH_KEYS.length-1];if(tau<a[0])return f(tau)+a[1]-f(a[0]);if(tau>z[0])return z[1]+f(tau)-f(z[0]);return key(tau,PH_KEYS,linear);}
/** a short left-foot move timed so the boot meets the ball at `at` (power .3 = a soft dink / roll) */
const leftKick=(p:Pose,tau:number,at:number,power:number,D=.7,cut=1.4)=>{const u=(tau-(at-STRIKE_CONTACT*D))/D;return u>0&&u<cut?blendPose(p,strike(Math.min(1,u),{foot:'l',power}),Math.min(sm(0,.15,u),1-sm(Math.min(1,cut-.4),cut,u))):p;};
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=TR.vel(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=TR.pos(k,tau),b=ballAt(tau);
 let yaw=sp>.5?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.role==='gk'||a.role==='def')yaw=yawOf(b[0]-x,b[2]-z);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='lud'||a.role==='def'?READY:stand();
 let p:Pose;
 if(k===OZ){
  if(tau<T1&&tau>.2)yaw=lerpA(yaw,yawOf(b[0]-x,b[2]-z),.35*bump(.2,T1,tau));
  const s=clamp((sp-2)/4.5),ph=gaitPh(tau),run=runCycle(ph,{speed:.6+.4*s}),dr=dribble(ph,{foot:'l',speed:.45+.4*s});
  p=blendPose(idle,tau<T1-.3?run:dr,clamp((sp-.3)/.8));
  // the soft first touch: the left foot cushions the dropping ball
  p=over(p,{lHipF:46,lKnee:50,lAnk:-12,lean:18,neckP:32,lShA:46,rShA:40},bump(T1-.18,T1+.14,tau));
  // the dink (feigning a shot first), the outside-of-the-left cushion, the fake (the foot raised, no contact), the roll in
  p=leftKick(p,tau,DINK,.35);
  p=over(p,{lHipR:-30,lHipA:-14,lKnee:30,lAnk:10,neckP:30},bump(T3-.2,T3+.18,tau));
  {const D=.9,u=(tau-(FAKE-.4*D))/D;if(u>0&&u<1)p=blendPose(p,strike(.4*Math.sin(Math.PI*u)+.05,{foot:'l',power:.7}),bump(0,1,u));}
  p=leftKick(p,tau,ROLL,.35);
  if(tau>NETHIT+.2)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(NETHIT+.2,NETHIT+.7,tau));
 }
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(TR.dist(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(TR.dist(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 if(a.role==='def'){// racing back facing their own goal until they turn to face him; then both go to ground at the fake
  if(tau<4.6){const vv=TR.vel(k,tau);yaw=lerpA(yawOf(vv[0],vv[1]),yaw,sm(4,4.6,tau));}
  const t0=FAKE+(k===DA?-.05:.08);if(tau>t0){const u=clamp((tau-t0)/.75);p=blendPose(p,slideTackle(.35+.65*u,{foot:k===DA?'r':'l'}),sm(0,.12,u));yaw=yawOf(FP[0]-x,FP[1]-z);}}
 if(k===EL){const D=.75,u=(tau-(0-STRIKE_CONTACT*D))/D;if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.85}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>-.6&&tau<.4)yaw=lerpA(yaw,yawOf(LANDP[0]-x,LANDP[1]-z),bump(-.6,.4,tau));}
 if(k===GK){// out of his area at speed, arms spread as Özil shapes to shoot, the dink floats over, he goes down
  p=over(p,{lShA:120,rShA:120,lShF:30,rShF:30,lElb:16,rElb:16,lHand:1,rHand:1,lKnee:40,rKnee:40,lean:10},bump(DINK-.35,DINK+.35,tau));
  if(tau>DINK+.15)p=keeperDive(clamp((tau-DINK-.15)/.9),{side:'l',height:.2});}
 return{p,yaw};
}

// ---------------------------------------------------------------- drawing the match through a camera
function draw(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;trail?:number;trailFrom?:number;before?:()=>void}={}){
 return play(s,c,v,tau,{n:ACTORS.length,pos:TR.pos,ball:ballAt,ballInk:K,draw:(k:number,e:CastE,q:{passing:boolean;px:number})=>{
  const a=ACTORS[k],{p,yaw}=poseOf(k,tauP),big=e.h>=300,detail=q.passing?(k===OZ?'mid':'low'):q.px<50||(!a.key&&q.px<110)?'low':'auto';
  return drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},big&&a.key&&!q.passing?{prev:poseOf(k,tauPrev).p,smear:!!o.hero&&k===OZ}:{});}},
  {minBall:o.minBall,trail:o.trail,trailFrom:o.trailFrom,before:o.before});
}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
const tau1=(t:number)=>{const ro=CUEW(0,'rolls'),S=SECS(0);return key(t,mono([[0,-3.2],[CUEW(0,'Mohamed'),-.8],[CUEW(0,'sends a long'),0],[CUEW(0,'Mesut'),1.6],[CUEW(0,'He lifts'),DINK-.2],[CUEW(0,'sends two'),FAKE-.3],[ro,ROLL],[S+1,ROLL+(S+1-ro)*1.05]]),linear);};
const CAM1:V3=[70,21,92];
function cam1(t:number):Cam{
 const tau=tau1(t),S=SECS(0),ro=CUEW(0,'rolls');
 const bs=(u:number):V3=>{const b=ballAt(Math.min(u,IN));return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const goalward=.3*sm(CUEW(0,'sends two'),ro+.4,t,easeInOutSine),T=lerp3([bt[0],lerp(2.4,1.2,sm(0,CUEW(0,'Mesut'),t)),bt[2]*.9],[100,1,0],goalward);
 const F=key(t,mono([[0,4000],[CUEW(0,'sends a long'),4200],[CUEW(0,'Mesut'),5600],[CUEW(0,'He lifts'),6600],[CUEW(0,'sends two'),7400],[ro,6800],[S,6000]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),ro=CUEW(0,'rolls');
  stadium(s,c,v,t,VENUE,[0,2,3],{roar:sm(ro+.5,ro+1,t),flash:sm(ro+.6,ro+.9,t)*(1-sm(SECS(0)-.9,SECS(0)-.4,t))});
  ground(s,c,PITCH,{bulge:bulge(tau),ballZ:NETP[2],ballY:.3});
  draw(s,c,v,tau,tau1(twos(t)),tau1(twos(t)-1/12),{minBall:8,trail:tau>DINK&&tau<DL?1:0,trailFrom:DINK});
 },
 aperture(t){const c=cam1(t),[x,z]=TR.pos(OZ,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low behind Özil: the soft touch, the keeper rushing, the dink
const tau2=(t:number)=>key(t,mono([[0,1.2],[CUEW(1,'One'),T1-.2],[CUEW(1,'slows'),T1+.1],[CUEW(1,'The keeper'),2.45],[CUEW(1,'rushes'),2.65],[CUEW(1,'dinks'),DINK],[SECS(1),DINK+.75]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=TR.smooth(OZ,Math.min(tau,DINK+.2)),open=1-sm(0,1,t,easeInOutSine),push=sm(CUEW(1,'One')-.3,CUEW(1,'slows')+.3,t,easeInOutSine),back=sm(CUEW(1,'The keeper')-.2,SECS(1),t,easeInOutSine);
 const g=TR.pos(GK,tau),T:V3=[lerp(m[0]+3,g[0],.25+.25*back),1+.5*back,lerp(m[1],g[1],.25+.25*back)],dx=T[0]-m[0],dz=T[2]-m[1],l=Math.hypot(dx,dz)||1,D=6+1.5*open-1.2*push+1.5*back;
 return look([m[0]-dx/l*D+.8,3.2+.6*open+.6*back,m[1]-dz/l*D-3.2],T,2100+450*push-250*back-250*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),os=CUEW(1,'One'),sl=CUEW(1,'slows'),tk=CUEW(1,'The keeper'),ro=CUEW(1,'rushes'),dk=CUEW(1,'dinks'),E=SECS(1);
  stadium(s,c,v,t,VENUE,[0,2]);
  ground(s,c,PITCH);
  // "slows the ball down": a yellow ring settles round the ball under him; "the keeper rushes out": his red run arrow + ring; "dinks it over
  // him": the yellow dotted arc over the keeper's head
  const bp=ballAt(Math.min(tau,DINK));groundRing(s,c,bp[0],bp[2],1.1,1.1,Y,sm(sl-.1,sl+.3,t,easeOutBack)*(1-sm(tk,tk+.4,t)),61,.2);
  groundArrow(s,c,TR.path(GK,0,DINK,14),R,sm(tk-.2,tk+.5,t,easeOut)*(1-sm(dk+.2,dk+.6,t)),62,.12);
  airArrow(s,c,dinkPts(),Y,sm(dk-.3,dk+.5,t,easeOut),63,.09);
  const r=play2(s,c,v,tau,t,tau2,()=>{const g=TR.pos(GK,tau);groundRing(s,c,g[0],g[1],1.3,1.3,R,sm(ro-.2,ro+.2,t,easeOutBack)*(1-sm(dk+.3,dk+.6,t)),64,.25);});
  // "one soft touch": a yellow ring round the LEFT boot; again as it dinks
  bootRing(s,r.res[OZ],'l',Y,Math.max(sm(os-.1,os+.2,t,easeOutBack)*(1-sm(sl+.3,sl+.7,t)),sm(dk-.3,dk,t,easeOutBack)*(1-sm(dk+.35,dk+.7,t))));
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:4,
};
/** one pass of the match for the replays (poses on twos, the drawing before for secondary motion) */
function play2(s:Sheet,c:Cam,v:View,tau:number,t:number,map:(t:number)=>number,before?:()=>void,trail=0,trailFrom=0){return draw(s,c,v,tau,map(twos(t)),map(twos(t)-1/12),{minBall:5,hero:true,trail,trailFrom,before});}

// ---------------------------------------------------------------- 3 · replay from behind the goal: the pair racing back, the fake, both slide, the roll in
const tau3=(t:number)=>{const it=CUEW(2,'into the net');return key(t,mono([[0,4.2],[CUEW(2,'race back'),4.7],[CUEW(2,'Özil pretends'),FAKE-.25],[CUEW(2,'They both'),FAKE+.15],[CUEW(2,'slide'),FAKE+.5],[CUEW(2,'calmly'),ROLL-.05],[it,IN-.1],[SECS(2),IN-.1+(SECS(2)-it)*.8]]),linear);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=TR.smooth(OZ,tau),e=sm(CUEW(2,'calmly')-.3,SECS(2),t,easeInOutSine);
 const C:V3=[112.5-1.5*e,4.4-.8*e,8.8-1.5*e],T:V3=[lerp(m[0],99,.3+.3*e),.8,lerp(m[1],-1,.3)];
 return look(C,T,2700+500*sm(CUEW(2,'Özil pretends')-.3,CUEW(2,'slide'),t,easeInOutSine)-400*e);
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tw=CUEW(2,'Two'),rb=CUEW(2,'race back'),op=CUEW(2,'Özil pretends'),tb=CUEW(2,'They both'),sd=CUEW(2,'slide'),cl=CUEW(2,'calmly'),it=CUEW(2,'into the net');
  stadium(s,c,v,t,VENUE,[0,1,3],{roar:sm(it-.1,it+.3,t),flash:sm(it,it+.3,t)*(1-sm(SECS(2)-.9,SECS(2)-.5,t)),lamps:sm(it,it+.4,t)});
  ground(s,c,PITCH,{goalLater:true});
  // "two defenders race back": red arrows along their recovery runs; "they both slide": red slide streaks toward where the ball was;
  // "calmly rolls it past them": the ball's yellow path into the empty net
  for(const [k,sd0] of [[DA,71],[DB,72]] as [number,number][])groundArrow(s,c,TR.path(k,Math.max(3,tau-1.5),Math.min(tau,5.5),10),R,sm(tw-.1,rb+.4,t,easeOut)*(1-sm(op,op+.4,t)),sd0,.1);
  for(const [k,sd0] of [[DA,73],[DB,74]] as [number,number][])groundArrow(s,c,TR.path(k,FAKE,FAKE+.6,8),R,sm(sd-.2,sd+.3,t,easeOut)*(1-sm(cl+.3,cl+.7,t)),sd0,.14);
  groundArrow(s,c,rollPts(),Y,sm(cl-.2,cl+.6,t,easeOut),75,.12);
  const r=play2(s,c,v,tau,t,tau3);
  // "Özil pretends to shoot": a yellow ring round the raised LEFT boot
  bootRing(s,r.res[OZ],'l',Y,sm(op-.1,op+.25,t,easeOutBack)*(1-sm(tb+.3,tb+.6,t)));
  goal3(s,c,105,1,bulge(tau),NETP[2],.3);
  spark(s,c,GIN,(tau-IN)*1.4,.4,76);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=TR.pos(OZ,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.4,
};

// ---------------------------------------------------------------- 4 · the lesson: low and side-on in the box
const tau4=(t:number)=>key(t,mono([[0,5],[CUEW(3,'stay'),5.35],[CUEW(3,'One more'),FAKE-.15],[CUEW(3,'send'),FAKE+.2],[CUEW(3,'sliding'),FAKE+.55],[SECS(3),ROLL+.6]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=TR.smooth(OZ,tau),push=sm(CUEW(3,'stay')-.3,CUEW(3,'One more'),t,easeInOutSine),back=sm(CUEW(3,'sliding'),SECS(3),t,easeInOutSine);
 const T:V3=[m[0]+1.8,.8+.3*back,m[1]+.8];
 return look([T[0]-2,3.4+.6*back,T[2]+11-1.5*push+1.5*back],T,2000+350*push-250*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),sc=CUEW(3,'stay'),om=CUEW(3,'One more'),se=CUEW(3,'send'),sp=CUEW(3,'sliding'),E=SECS(3);
  stadium(s,c,v,t,VENUE,[0,2]);
  ground(s,c,PITCH,{bulge:bulge(tau),ballZ:NETP[2],ballY:.3});
  // "stay calm": a steady yellow ring round Özil and the ball; "one more touch": the left boot ringed; "send the defenders sliding past":
  // red slide streaks, then his yellow way round them
  const m=TR.pos(OZ,tau);
  for(const [k,sd0] of [[DA,81],[DB,82]] as [number,number][])groundArrow(s,c,TR.path(k,FAKE,FAKE+.6,8),R,sm(se-.2,se+.3,t,easeOut)*(1-sm(E-.5,E-.2,t)),sd0,.14);
  groundArrow(s,c,TR.path(OZ,FAKE,ROLL,10),Y,sm(sp-.2,sp+.5,t,easeOut)*(1-sm(E-.5,E-.2,t)),83,.12);
  const r=play2(s,c,v,tau,t,tau4,()=>groundRing(s,c,m[0]+.3,m[1]-.2,1.3,1.3,Y,sm(sc-.15,sc+.3,t,easeOutBack)*(1-sm(om+.4,om+.8,t)),84,.18));
  bootRing(s,r.res[OZ],'l',Y,sm(om-.1,om+.25,t,easeOutBack)*(1-sm(se+.3,se+.6,t)));
 },
 still:3.6,
};

const film:RisoStory={
 id:ID,format:'11v11',title:'Özil’s solo goal in Sofia',theme:'Stay calm in front of goal: one more touch can send the defenders sliding past',
 ageNote:'Champions League group stage, Ludogorets 2–3 Arsenal, Vasil Levski National Stadium, Sofia, 1 November 2016 (88th minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of floodlit turf and a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){touchTurf(s,x,y,age,seed,G,R);},
};
export default film;
