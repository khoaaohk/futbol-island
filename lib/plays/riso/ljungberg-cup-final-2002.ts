/** Freddie Ljungberg's curler — Arsenal 2–0 Chelsea, FA Cup final, Saturday 4 May 2002, Millennium Stadium, Cardiff. An iconic-play riso
 * film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A reconstruction
 * of the goal from WRITTEN accounts (the broadcast footage itself was not reviewed), rendered as a riso print. Plumbing: ./broadcast-kit.
 *
 * SOURCES (read Sept 2026 with curl, cached in the build scratchpad cardfilms-src/):
 *  - Wikipedia, "2002 FA Cup final" (raw wikitext): 4 May 2002, Millennium Stadium, Cardiff, 73,963, referee Mike Riley; Parlour 70',
 *    Ljungberg 80'; "the Swede ran forward, evaded the challenge of Terry before curling the ball past Cudicini from the edge of the penalty
 *    area" (citing The Sunday Times); Terry (No. 26) came on at half-time; Cudicini No. 23; Ljungberg No. 8, man of the match; the Arsenal
 *    crowd sang "We love you Freddie, 'cos you've got red hair"; kit boxes: Arsenal red shirts with white sleeves, white shorts, red socks;
 *    Chelsea blue shirts and shorts, white socks. https://en.wikipedia.org/wiki/2002_FA_Cup_final
 *  - Wikipedia, "2001–02 Arsenal F.C. season": the same home kit (red socks). https://en.wikipedia.org/wiki/2001%E2%80%9302_Arsenal_F.C._season
 *  - BBC Sport clockwatch, 4 May 2002: "79 mins: Arsenal double their lead ... Freddie Ljungberg skips past John Terry's despairing tackle on
 *    the left and curls a fantastic shot past Cudicini and into the back of the Chelsea net"; "a sun-bathed Millennium Stadium".
 *    http://news.bbc.co.uk/sport1/hi/football/fa_cup/1965793.stm
 *  - BBC Sport, "Freddie Ljungberg's class": "He broke from inside his own half, brushed aside John Terry's challenge, before looking up to
 *    bend the ball around Carlo Cudicini." http://news.bbc.co.uk/sport2/hi/football/fa_cup/1968486.stm
 *  - The Observer, Paul Wilson, 5 May 2002: "Ljungberg was next to break clear, beating two men and leaving Terry on the floor on a run from
 *    halfway that culminated in a delightfully curled shot from the edge of the area into Cudicini's far corner."
 *    https://www.theguardian.com/football/2002/may/05/match.sport
 * CONFIRMED: date, venue, sunshine, 1–0 → 2–0 (~80'); the run from inside his own half on the LEFT, two men beaten, Terry's despairing
 *  (sliding) tackle skipped past and Terry left on the floor; he looked up and bent (curled) the shot from the EDGE of the area around
 *  Cudicini into the FAR corner; kits and numbers as above; the red hair.
 * INFERRED (never named in the narration): the shooting foot (his RIGHT, his stronger foot: from the left of the area a right-foot curl aimed
 *  outside the far post and bending back in is the geometry of "bend it around" into the far corner); every position, time and speed; the
 *  shot's height (drawn mid-height); Cudicini's late dive and his keeper kit (printed navy); the other players (unnamed, no numbers); which
 *  end, the camera positions and lenses; the stadium's seat colours; the celebration run.
 *
 * FRAMING: ch1 = the high main-stand camera in REAL TIME, panning with the run (the whole run, the tackle, the curl, the net); ch2 = the
 * slow replay from a LOW touchline camera running alongside him (straight at the defence, Terry's slide, the skip over the leg); ch3 = a
 * replay from HIGH BEHIND THE GOAL: the ghost of his aim outside the far post, then the real ball bending back inside it past Cudicini;
 * ch4 = the lesson from behind the shooter: an arrow at the defender, his eye-line to the far corner, a ring on the inside of the right
 * boot, the far-corner zone and the curve. World: right-handed metres (./broadcast-kit), Chelsea's goal line x = 0, +z = Arsenal's right,
 * so the LEFT channel is −z and the far corner is +z. */
import timingJson from '../../../public/plays/narration/ljungberg-cup-final-2002/timing.json';
import type {NarrationTiming} from './timing';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,dribble,slideTackle,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,touchPhase,
 type Pose,type AthleteStyle,type Build,type V3} from './athlete';
import {Y,R,B,K,DEG,SPEC,chaptersFrom,mono,add3,mix3,d3,lerpAng,yawTo,nrm2,launch,flyA,BALL_R,G3,frame,toCam,scr,pr,kAt,polyP,cam3,plan,
 stadium,ground,makeTracks,loco,faceYaw,win,DEJECT,at3,drawScene,arrow3,groundRing,trail,zone,markRing,type Cam,type Shot,type State,type Fig,type StadiumSpec} from './broadcast-kit';

// ---------------------------------------------------------------- narration
const SCRIPT=[
 {label:'Cardiff, 2002',text:'Cardiff, 2002, the FA Cup final. Arsenal lead Chelsea one–nil. Freddie Ljungberg races from his own half, past John Terry... and curls it in! Two–nil!',tail:2.2,
  cues:['Cardiff','Arsenal lead','Freddie Ljungberg','races','past John Terry','curls it in','Two']},
 {label:'Watch it again',text:'Watch again, slowly. He runs straight at the defence. Terry slides in, but Freddie skips over his leg and keeps the ball.',tail:1.4,
  cues:['Watch again','runs straight','Terry slides','skips over','keeps the ball']},
 {label:'The curl',text:'From behind the goal, see the curl. He aims outside the far post, and it bends back in, past Cudicini!',tail:2.2,
  cues:['From behind','the curl','aims outside','bends back in','past Cudicini']},
 {label:'Curl it far',text:'Run at defenders, then look up. Use the inside of your foot and curl it into the far corner!',tail:2,
  cues:['Run at defenders','look up','inside of your foot','far corner']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const {CHAPTERS,CUE,SECS}=chaptersFrom('ljungberg',SCRIPT,VOICE);

// ---------------------------------------------------------------- cast
const SKIN_L=[[Y,.35],[R,.18]] as [string,number][],SKIN_M=[[Y,.42],[R,.26],[K,.06]] as [string,number][],SKIN_D=[[Y,.8],[R,.62],[K,.28]] as [string,number][];
/** Arsenal: red shirts with WHITE sleeves (painted on by the kit's sleeve overlay), white shorts, red socks, white numbers */
const ars=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:'paper',socks:[R,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Chelsea: blue shirts and shorts, white socks, white numbers */
const che=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:[B,.95],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.82,bulk:1},...o});
const B_LJU:Build={height:1.75,bulk:.94},B_TER:Build={height:1.87,bulk:1.06},B_CUD:Build={height:1.86,bulk:1};
/** Ljungberg No. 8 — and the famous red hair */
const LJU_ST=ars({number:8,hair:[R,.9],build:B_LJU,seed:8});
const TER_ST=che({number:26,hair:[K,.9],build:B_TER,seed:26});
const CUD_ST:AthleteStyle={shirt:[K,.72],shorts:[K,.8],socks:[K,.72],boots:K,skin:SKIN_L,hair:K,line:K,trim:[Y,.6],gloves:'paper',sleeves:'long',hairStyle:'short',number:23,numberInk:[Y,.9],build:B_CUD,seed:23};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is the shot)
/** the ball when he strikes it: just outside the D's left edge, the left of the area */
const P0:V3=[-17.6,BALL_R,-5.0];
/** a right-foot inside curl: spin pulls the ball to the shooter's LEFT (−z); aimed outside the far post it bends back in */
const CURL:V3=[0,-9.81,-5.4],TG=.95;
const GOAL_PT:V3=[0,1.15,2.95],NET_HIT:V3=[1.55,1.0,3.05],REST:V3=[1.2,BALL_R,2.9];
const V_SHOT=launch(P0,GOAL_PT,TG,CURL);
/** where the aim line (no curl) would cross the goal line: outside the far post */
const AIM_Z=P0[2]+V_SHOT[2]*(-P0[0]/V_SHOT[0]);
const DC=nrm2(V_SHOT[0],V_SHOT[2]),YAW_S=yawTo(DC[0],DC[1]);
/** where his pelvis stands at contact so his RIGHT boot meets the back of the ball */
const PCK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_LJU,{x:0,z:0,yaw:YAW_S});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
const kp=(u:number):[number,number]=>[PCK[0]+DC[0]*u,PCK[1]+DC[1]*u];
/** Terry's despairing slide: from the middle toward the left touchline and back toward the ball */
const T_SLIDE=-1.75,SLIDE_L=1.15,D_T=nrm2(-.42,-.91),YAW_T=yawTo(D_T[0],D_T[1]),ST0:[number,number]=[-22.0,-4.6];
/** Ljungberg's skip over the leg */
const T_HOP=-1.2;
/** Cudicini: set, then a late dive to his LEFT (+z, he faces −x) */
const T_DIVE=.28,DIVE_L=.95,DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:.45});
const T0=-7.6,T1=9;
type Actor={name:string;style:AthleteStyle;keys:number[][];hero?:boolean;sleeve?:'paper'};
const ACTORS:Actor[]=[
 {name:'Freddie Ljungberg',hero:true,style:LJU_ST,sleeve:'paper',keys:[[T0,-57.5,-11],[-6.9,-54.5,-10.4],[-5.3,-44.5,-9.5],[-3.8,-35.4,-8.7],[-2.5,-28.4,-7.8],[-1.35,-23.3,-6.9],[-.55,...kp(-1.7)],[0,...kp(0)],[.7,...kp(.9)],[2,-14.4,-8],[4.4,-9.5,-17],[T1,-6.5,-25]]},
 {name:'John Terry',hero:true,style:TER_ST,keys:[[T0,-30,-2],[-4,-26,-2.4],[-2.6,-23.4,-2.9],[T_SLIDE,...ST0],[T1,...ST0]]},
 {name:'Carlo Cudicini',hero:true,style:CUD_ST,keys:[[T0,-2.2,-.2],[-3,-2,-.6],[-.6,-1.4,-1.0],[0,-1.3,-1.05],[T1,-1.3,-1.05]]},
 {name:'Chelsea midfielder (beaten first)',style:che({skin:SKIN_M,seed:41}),keys:[[T0,-30.5,-6.2],[-4.6,-33.8,-6.9],[-3.8,-35,-7.2],[-3,-35.4,-7.4],[-1.5,-33,-7.4],[T1,-24,-6.5]]},
 {name:'Chelsea centre-back',style:che({build:{height:1.88,bulk:1.05},skin:SKIN_D,seed:42}),keys:[[T0,-26,4],[-3,-19,2.2],[-1,-14.5,.6],[0,-13.6,.4],[T1,-11,0]]},
 {name:'Chelsea full-back',style:che({seed:43}),keys:[[T0,-36,-18],[-3,-26,-15],[-1,-19,-12],[T1,-14,-11]]},
 {name:'Chelsea right-back',style:che({skin:SKIN_M,seed:44}),keys:[[T0,-30,12],[-3,-22,9],[-1,-15,6.5],[T1,-10,5]]},
 {name:'Arsenal striker',style:ars({skin:SKIN_D,seed:61}),keys:[[T0,-36,3],[-4,-28,3.2],[-2,-19,3.6],[0,-12.5,3.4],[2,-12,-4],[T1,-8,-20]]},
 {name:'Arsenal winger',style:ars({seed:62}),keys:[[T0,-44,16],[-4,-34,14],[-1,-24,11],[1,-19,9],[T1,-10,-10]]},
];
const LJU=0,TER=1,GK=2,MID=3;
const TR=makeTracks(ACTORS.map(a=>a.keys),T0,T1);

// ---------------------------------------------------------------- the ball: dribble → settle → the curl → the net
const STRIDE=2.3;
const dribblePhase=(tau:number)=>TR.dist(LJU,tau)/STRIDE;
/** the dribble: each right-foot touch (dribble touchPhase) knocks the ball ~1 m ahead; he runs onto it; the touch before Terry's slide is
 * a longer knock past the leg */
function dribbleBall(tau:number):V3{
 const[x,z]=TR.pos(LJU,tau),v=TR.vel(LJU,tau),[fx,fz]=nrm2(v[0]||1,v[1]),u=((dribblePhase(tau)-touchPhase)%1+1)%1;
 const knock=1+1.1*win(tau,T_SLIDE-.45,T_HOP+.3,.2),off=.34+(.95*knock)*Math.sin(Math.PI*u);
 return[x+fx*off-fz*.12,BALL_R,z+fz*off+fx*.12];
}
function ballAt(tau:number):V3{
 if(tau<-.45)return dribbleBall(tau);
 if(tau<=0)return mix3(dribbleBall(-.45),P0,easeOut(clamp((tau+.45)/.45)));
 if(tau<TG)return flyA(P0,V_SHOT,CURL,tau);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?dribblePhase(tau)*TAU*.8:dribblePhase(0)*TAU*.8+tau*TAU*7;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses
/** the skip: knees tucked high over the sliding leg, arms out for balance */
const HOP=(u:number):Pose=>{const w=Math.sin(Math.PI*clamp(u));return posed({air:.62*w,lHipF:62*w+10,rHipF:34*w+8,lKnee:30+80*w,rKnee:30+60*w,lShA:30+50*w,rShA:30+60*w,lElb:40,rElb:40,lean:12,neckP:22,lAnk:30,rAnk:30});};
function stateOf(k:number,tau:number):State{
 const[x,z]=TR.pos(k,tau);let pose=loco(TR,k,tau),yaw=faceYaw(TR,k,tau,ballAt(tau));
 switch(k){
  case LJU:{
   const v=TR.vel(LJU,tau),sp=Math.hypot(v[0],v[1]);
   if(tau<-.4){pose=blendPose(pose,dribble(dribblePhase(tau),{foot:'r',speed:clamp(sp/8)}),.85);}
   if(Math.abs(tau-T_HOP)<.4)pose=blendPose(pose,HOP((tau-T_HOP+.3)/.6),win(tau,T_HOP-.35,T_HOP+.35,.12));
   // the look up before the shot: chin lifts toward the far corner
   if(tau>-.9&&tau<-.5)pose={...pose,neckP:pose.neckP-.35*win(tau,-.9,-.5,.12),neckY:pose.neckY-.25*win(tau,-.9,-.5,.12)};
   const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   yaw=lerpAng(yaw,YAW_S,sm(-.8,-.45,tau)*(1-sm(.9,1.6,tau)));
   if(tau>TG+.3){const run=celebrate(TR.dist(LJU,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TG+.3,TG+.9,tau));}
   break;}
  case TER:{
   yaw=faceYaw(TR,TER,tau,ballAt(tau));
   if(tau>T_SLIDE-.1){const u=(tau-T_SLIDE)/SLIDE_L;pose=blendPose(pose,slideTackle(clamp(u),{foot:'r'}),sm(T_SLIDE-.1,T_SLIDE+.05,tau));yaw=lerpAng(yaw,YAW_T,sm(T_SLIDE-.3,T_SLIDE,tau));}
   break;}
  case GK:{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,.35);
   if(tau>T_DIVE-.15)pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));
   if(tau>TG+1.5)pose=blendPose(pose,DEJECT,sm(TG+1.7,TG+2.5,tau)*.6);
   yaw=faceYaw(TR,GK,Math.min(tau,.1),ballAt(Math.min(tau,0)));break;}
  case MID:{if(tau>-4.1&&tau<-2.9){pose=blendPose(pose,lunge(clamp((tau+4.1)/1.1),{side:'r'}),win(tau,-4.1,-2.9,.2));yaw=Math.PI;}break;}
  default:if(k>=4&&k<=6&&tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.7);
   if(k>=7&&tau>TG+.4){pose=blendPose(pose,celebrate(TR.dist(k,tau)/4,{kind:'arms'}),sm(TG+.5,TG+1.1,tau)*.7);}
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:import('../../paths/riso/sheet').Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k],hero=!!a.hero;return{st:stateOf(k,tau),prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,sleeve:a.sleeve,
  smear:o.smear&&((k===LJU&&tau>-.25&&tau<.35)||(k===TER&&tau>T_SLIDE&&tau<T_SLIDE+.6)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}

// ---------------------------------------------------------------- the stadium: a sunny afternoon in Cardiff, red and blue crowds
const CARDIFF:StadiumSpec={sky:'day',seats:[[R,.35],[K,.3]],rake:40,tiers:[[.3,.35],[.62,.67]],roof:true,
 crowd:[[.3,.05,.1,.32,.23],[.28,.04,.1,.42,.16],[.3,.05,.1,.25,.3],[.26,.04,.12,.18,.4]]};
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];

// ---------------------------------------------------------------- 1 · live: high main-stand camera, real time, panning with the run
function tau1(t:number){const tC=CUE(0,'curls it in')+.05;return Math.max(T0+.2,t-tC);}
const P1:V3=[-30,27,-80];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau),follow=():Shot=>({P:P1,T:add3(gnd(b),[3,1,0]),fov:7.5});
 return plan(t,[
  [0,0,()=>({P:P1,T:[-48,8,14],fov:40})],
  [CUE(0,'Arsenal lead')-.2,1.3,()=>({P:P1,T:add3(gnd(b),[4,1,0]),fov:12})],
  [CUE(0,'races')-.4,1,follow],
  [CUE(0,'past John Terry')-.3,.8,()=>({P:P1,T:add3(gnd(b),[3,.8,1]),fov:6.5})],
  [CUE(0,'curls it in')-.5,.7,()=>({P:P1,T:mix3(add3(gnd(b),[0,1,0]),[-3,1.2,0],.35+.5*sm(0,TG,tau)),fov:14})],
  [CUE(0,'Two')+.2,1.3,()=>({P:P1,T:at3(TR,LJU,tau,1.1),fov:12})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tT=CUE(0,'Two');
  stadium(s,c,t,CARDIFF,[0,1,3],{roar:sm(TG,TG+.4,tau),flash:sm(tT-.3,tT+.2,t)*(1-sm(tT+2,tT+2.8,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:14,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'past John Terry')+.2;},
};

// ---------------------------------------------------------------- 2 · slow replay: a low touchline camera running alongside him
const tau2=(t:number)=>key(t,mono([[0,-5],[CUE(1,'runs straight'),-4.2],[CUE(1,'Terry slides'),T_SLIDE-.1],[CUE(1,'skips over'),T_HOP-.12],[CUE(1,'keeps the ball'),T_HOP+.45],[SECS(1),-.35]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),l=at3(TR,LJU,tau,1),eye=():V3=>[l[0]-5,1.9,-37.5];
 return plan(t,[
  [0,0,()=>({P:eye(),T:add3(l,[5,0,1]),fov:15})],
  [CUE(1,'runs straight')-.2,.9,()=>({P:eye(),T:add3(l,[6,0,2]),fov:12})],
  [CUE(1,'Terry slides')-.3,.8,()=>({P:eye(),T:mix3(l,at3(TR,TER,tau,.6),.45),fov:10})],
  [CUE(1,'skips over')-.2,.6,()=>({P:eye(),T:add3(l,[.6,-.1,.5]),fov:8})],
  [CUE(1,'keeps the ball')-.2,.9,()=>({P:eye(),T:add3(l,[3,0,.8]),fov:12})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,CARDIFF,[0,1,3]);
  ground(s,c);
  // the replay graphic: a yellow ring under Ljungberg until the skip, a red ring under Terry while he slides
  groundRing(s,c,at3(TR,LJU,tau,0),.8,Y,sm(CUE(1,'Watch')-.1,CUE(1,'Watch')+.4,t)*(1-sm(T_HOP-.4,T_HOP-.2,tau)),.14);
  groundRing(s,c,at3(TR,TER,tau,0),1,R,win(tau,T_SLIDE-.4,T_HOP+.3,.2),.12);
  const r=play(s,c,tau,tp,{smear:true,min:10});
  // the skip: a yellow spark under him at the top of the hop
  const hp=(tau-T_HOP+.05)/.3;if(hp>0&&hp<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1]-r.ball.r*3,r.ball.r*5,{n:9,seed:17,g:easeOutBack(clamp(hp*2))*(1-clamp((hp-.5)*2)),width:r.ball.r*.45});
 },
 aperture(t){const c=cam2(t),p=stateOf(LJU,tau2(twos(t))),sk=solve(p.pose,B_LJU,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],70,12);},
 get still(){return CUE(1,'skips over')+.15;},
};

// ---------------------------------------------------------------- 3 · replay from high behind the goal: the aim, the bend, past Cudicini
const tau3=(t:number)=>key(t,mono([[0,-1.1],[CUE(2,'the curl'),-.12],[CUE(2,'aims outside'),.2],[CUE(2,'bends back in'),.62],[CUE(2,'past Cudicini'),TG+.02],[SECS(2),TG+2.4]]),linear);
const E3:V3=[10.5,7.2,1.4];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-14,1,-3.5],fov:26})],
  [CUE(2,'the curl')-.3,.8,()=>({P:E3,T:mix3([-16,1,-4],[-4,1.2,0],.25),fov:22})],
  [CUE(2,'aims outside')-.2,1,()=>({P:E3,T:mix3(b,[-2,1.2,1.5],.5),fov:30})],
  [CUE(2,'past Cudicini')-.3,1,()=>({P:E3,T:[-4,1,.6],fov:34})],
  [CUE(2,'past Cudicini')+1,1.4,()=>({P:E3,T:at3(TR,LJU,tau,1.1),fov:26})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tP=CUE(2,'past Cudicini');
  stadium(s,c,t,CARDIFF,[2,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.6,TG+2.2,tau))});
  ground(s,c);
  // "aims outside the far post": the ghost of a straight shot, dashed paper, ending outside the far post
  const ga=sm(CUE(2,'aims outside')-.2,CUE(2,'aims outside')+.5,t)*(1-sm(tP+.8,tP+1.4,t));
  if(ga>0){const q=[pr(c,P0),pr(c,[0,GOAL_PT[1]+.3,AIM_Z])].filter((p):p is Pt=>!!p);if(q.length===2){const gaps:[number,number][]=[];for(let i=0;i<9;i++)gaps.push([(i+.62)/9,(i+.98)/9]);
   const d=ribbon(partial(q,ga),Math.max(6,kAt(c,[0,1,AIM_Z])*.08),{seed:21,taper:.1,wobble:.5,gaps});s.knockout(d,.9*ga);s.stroke(K,d,2.5,.7*ga);}}
  // the real ball's path so far, a yellow ribbon that visibly bends back inside the post
  trail(s,c,ballAt,Math.max(0,tau-1),Math.min(tau,TG),1-sm(TG+.4,TG+1,tau));
  play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  const hit=(tau-TG)/.3;if(hit>0&&hit<1){const g=pr(c,GOAL_PT);if(g)sparkBurst(s,Y,g[0],g[1],Math.max(60,kAt(c,GOAL_PT)*.8),{n:10,seed:29,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:10});}
 },
 // the passage opens from the scorer, not an empty point in the net (that showed a blank green disc in the mesh)
 aperture(t){const c=cam3v(t),p=stateOf(LJU,tau3(twos(t))),sk=solve(p.pose,B_LJU,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],70,12);},
 get still(){return CUE(2,'bends back in')+.3;},
};

// ---------------------------------------------------------------- 4 · the lesson: from behind the shooter, slow, with teaching marks
const tau4=(t:number)=>key(t,mono([[0,-3],[CUE(3,'look up'),-.85],[CUE(3,'inside of your foot'),-.02],[CUE(3,'inside of your foot')+1,.02],[CUE(3,'far corner'),.3],[SECS(3),TG+.6]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),l=at3(TR,LJU,tau,1);
 return plan(t,[
  [0,0,()=>({P:[l[0]-9,3.4,l[2]-3.2],T:add3(l,[8,-.2,1.5]),fov:34})],
  [CUE(3,'look up')-.2,.9,()=>({P:[-30,2.8,-9.5],T:[-8,1.2,-.5],fov:30})],
  [CUE(3,'inside of your foot')-.3,.8,()=>({P:[-21.6,1.1,-8.9],T:[P0[0]-.2,.2,P0[2]-.3],fov:24})],
  [CUE(3,'far corner')-.3,1,()=>({P:[-25,3,-9],T:[-4,1.2,1.2],fov:30})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tR=CUE(3,'Run at'),tL=CUE(3,'look up'),tI=CUE(3,'inside of your foot'),tF=CUE(3,'far corner');
  stadium(s,c,t,CARDIFF,[0,1,3],{roar:.3+.4*sm(TG,TG+.4,tau)});
  ground(s,c);
  // "far corner": the far-corner zone of the goal mouth lights up (goal-line strip + the target square inside the post)
  const fz=sm(tF-.2,tF+.3,t);zone(s,c,[[0,.01,1.6],[0,.01,3.66],[-2.5,.01,3.66],[-2.5,.01,1.6]],Y,fz);
  // "Run at defenders": his line straight at the defender, a red arrow
  const ra=sm(tR-.1,tR+.6,t)*(1-sm(tL+.4,tL+1,t));if(ra>0){const a=at3(TR,LJU,Math.min(tau,-1.6),.05),b=at3(TR,TER,T_SLIDE,.05);arrow3(s,c,[a,mix3(a,b,.5*ra),mix3(a,b,.9*ra)],Math.max(8,kAt(c,a)*.1),R,.95*ra);markRing(s,c,b,ra);}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[LJU,TER,GK,4]});
  // "look up": a dashed eye-line from his head to the far corner
  const la=sm(tL-.1,tL+.4,t)*(1-sm(tI+.4,tI+1,t));if(la>0){const st=stateOf(LJU,tau),sk=solve(st.pose,B_LJU,st.place),a=pr(c,sk.head),b=pr(c,[0,1.2,3]);
   if(a&&b){const gaps:[number,number][]=[];for(let i=0;i<10;i++)gaps.push([(i+.6)/10,(i+.97)/10]);const d=ribbon(partial([a,b],la),7,{seed:33,taper:0,wobble:.4,gaps});s.knockout(d,.9*la);s.fill(Y,d,.95*la);s.stroke(K,d,2,.7*la);}}
  // "inside of your foot": a ring on the right boot at contact, a spark
  const ia=sm(tI-.2,tI+.2,t)*(1-sm(tF+.2,tF+.8,t));if(ia>0){const st=stateOf(LJU,Math.min(tau,.02)),sk=solve(st.pose,B_LJU,st.place),q=pr(c,sk.rToe);
   if(q){const rr=Math.max(26,kAt(c,sk.rToe)*.22),ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr*.7]);}const rp=ribbon(ring,Math.max(5,rr*.16),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp,.9*ia);s.fill(R,rp,.95*ia);
    sparkBurst(s,Y,q[0],q[1],rr*1.8*ia,{n:9,seed:41,g:easeOutBack(ia),width:8});}}
  // the curve itself, arrowed, once it is struck
  const ca=sm(tF-.3,tF+1,t,easeInOutSine);if(ca>0){const q:V3[]=[];for(let i=0;i<=12;i++)q.push(flyA(P0,V_SHOT,CURL,TG*ca*i/12));arrow3(s,c,q,Math.max(8,kAt(c,P0)*.07),Y,.95);}
  if(r.ball&&tau>TG){const g=r.ball.g;sparkBurst(s,Y,g[0],g[1],60,{n:9,seed:55,g:easeOutBack(clamp((tau-TG)/.3)),width:10});}
 },
 get still(){return CUE(3,'far corner')+.6;},
};

const film:RisoStory={
 id:'ljungberg-cup-final-2002',format:'11v11',title:"Ljungberg's cup final curler",
 theme:'Run at defenders, look up, and curl the ball with the inside of your foot into the far corner',
 ageNote:'Arsenal 2–0 Chelsea, FA Cup final, Millennium Stadium, Cardiff, 4 May 2002. For players of every age.',
 spec:SPEC,
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little curler — a ball swerves across the tap in a bending arc, with a yellow spark where it is struck. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.7),bx=x-120+260*u,by=y+40-200*u*(1-u)*1.2-40*u;
  if(age<.25)sparkBurst(s,Y,x-120,y+40,100,{n:9,seed:seed+1,g:easeOutBack(clamp(age/.12))*(1-clamp((age-.12)/.13)),width:12});
  if(u<1)footballPanels(s,bx,by,28,{rot:age*16+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved facts (pitch metres; Chelsea's goal line x = 0, +z = Arsenal's right) — checked by tests/play-film-ljungberg-cup-final-2002.cjs. */
export const FACTS={P0,GOAL_PT,TG,AIM_Z,CURL,ballAt,shotFoot:'r' as const,T_HOP,T_SLIDE,
 ljungbergContact:()=>{const st=stateOf(LJU,0),sk=solve(st.pose,B_LJU,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 ljungbergAt:(tau:number)=>{const st=stateOf(LJU,tau),sk=solve(st.pose,B_LJU,st.place);return{pelvis:sk.pelvis,air:st.pose.air,lToe:sk.lToe,rToe:sk.rToe};},
 terryAt:(tau:number)=>{const st=stateOf(TER,tau),sk=solve(st.pose,B_TER,st.place);return{lToe:sk.lToe,rToe:sk.rToe,pelvis:sk.pelvis};},
 cudiciniAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_CUD,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};},
 midAt:(tau:number)=>{const st=stateOf(MID,tau),sk=solve(st.pose,che().build??{},st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 d3,DEG};
