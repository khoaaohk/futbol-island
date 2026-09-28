/** James Rodríguez's Puskás volley — Colombia 2–0 Uruguay, FIFA World Cup round of 16, Saturday 28 June 2014, Estádio do Maracanã, Rio de
 * Janeiro. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or
 * StoryFilmPlayer. A reconstruction of the goal from WRITTEN accounts (the broadcast footage itself was not reviewed), rendered as a riso
 * print. Plumbing: ./broadcast-kit. (The narration says "Rodríguez" only: the English voice cannot say "James" the Spanish way.)
 *
 * SOURCES (read Sept 2026 with curl, cached in the build scratchpad cardfilms-src/):
 *  - Wikipedia, "2014 FIFA World Cup knockout stage" (raw wikitext): 28 June 2014, 17:00 local, Maracanã, 73,804, referee Björn Kuipers;
 *    James 28' and 50'; "the first in the 28th minute, where he controlled Abel Aguilar's headed ball on his chest before volleying
 *    left-footed from 25 yards out with the ball going in off the underside of the crossbar ... which won the 2014 FIFA Puskás Award";
 *    James No. 10, Aguilar No. 8; kit boxes (pattern files checked): Colombia yellow shirts with navy trim, white shorts, white socks;
 *    Uruguay sky-blue shirts, black shorts, black socks. https://en.wikipedia.org/wiki/2014_FIFA_World_Cup_knockout_stage
 *  - The Guardian, match report, 28 June 2014: "Abel Aguilar nodded the ball forward to Rodríguez, loitering with his back to goal in a
 *    pocket of space just outside the Uruguay penalty area ... flashed a quick glance at goal to make certain of his bearings before, as
 *    Godín and Maxi Pereira edged forward half-heartedly in anticipation of a block ... collecting the ball on his chest and dispatching
 *    his shot left-footed on the volley. The attempt dipped gloriously, a startled Fernando Muslera leaping to his right only for the ball
 *    to graze the fingertips of his right hand and kiss the underside of the crossbar before careering into the net."
 *    https://www.theguardian.com/football/2014/jun/28/colombia-uruguay-world-cup-2014-last-16-match-report
 * CONFIRMED: date, venue, 0–0 until 28'; Aguilar's header forward; back to goal just outside the area (about 25 yards out); the quick
 *  glance at goal; chest control; LEFT-foot volley; the dip; Muslera leaping to HIS RIGHT (so the ball went to the attackers' left, −z),
 *  grazing his right-hand fingertips; in off the UNDERSIDE of the bar; Godín and Maxi Pereira nearest him; kits; the Puskás Award.
 * INFERRED (never named in the narration): every position, time and height; the direction of his turn; the dusk light (kick-off 17:00,
 *  sunset in Rio ≈ 17:15 in late June) and floodlights; Muslera's keeper kit (printed red); the stadium's seat colours and crowd; the other
 *  players (unnamed, no numbers); camera positions.
 *
 * FRAMING: ch1 = the high main-stand camera in REAL TIME (Aguilar's header → back to goal → chest, turn, volley → the bar → in); ch2 = a slow
 * replay from GOAL-SIDE, facing him: his back to goal, the quick look over the shoulder (his face turns to us), his sight-line to the goal;
 * ch3 = a replay from HIGH BEHIND THE GOAL: chest, spin, the left-foot volley coming at us, dipping over Muslera's fingertips, the bar;
 * ch4 = the lesson from the side: a ring on the chest, the turn's arc, a ring on the left boot, and the ball's path that never lands.
 * World: right-handed metres (./broadcast-kit): Uruguay's goal line x = 0, +z = Colombia's right. */
import timingJson from '../../../public/plays/narration/james-volley-2014/timing.json';
import type {NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,volley,header,keeperSet,keeperTip,celebrate,posed,blendPose,
 type Pose,type AthleteStyle,type Build,type V3} from './athlete';
import {Y,R,B,K,SPEC,chaptersFrom,mono,add3,sub3,mix3,d3,lerpAng,yawTo,nrm2,launch,flyA,BALL_R,G3,frame,toCam,scr,pr,kAt,plan,seg3,
 stadium,ground,makeTracks,loco,faceYaw,win,DEJECT,at3,drawScene,arrow3,groundRing,trail,markRing,type Cam,type State,type Fig,type StadiumSpec} from './broadcast-kit';

// ---------------------------------------------------------------- narration (text = public/plays/narration/<id>/script.json)
const SCRIPT=[
 {label:'Maracanã, 2014',text:'Rio de Janeiro, 2014, the World Cup. Colombia play Uruguay at the Maracanã. The ball is headed to Rodríguez... chest, turn, volley! Off the crossbar and in!',tail:2.2,
  cues:['Rio de Janeiro','Colombia play Uruguay','The ball is headed','chest','turn','volley','Off the crossbar']},
 {label:'Watch it again',text:'Watch again. His back is to the goal, but first he takes a quick look over his shoulder. Now he knows where the goal is.',tail:1.4,
  cues:['Watch again','back is to the goal','quick look','Now he knows']},
 {label:'Chest and volley',text:"From behind the goal. He cushions it on his chest, spins, and volleys with his left foot. It dips over the keeper's fingertips!",tail:2.2,
  cues:['From behind','cushions','spins','left foot','dips']},
 {label:'Chest, turn, volley',text:'Cushion the ball on your chest, turn, and volley it before it touches the ground!',tail:2,
  cues:['Cushion','turn','volley it','before it touches']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const {CHAPTERS,CUE,SECS}=chaptersFrom('james',SCRIPT,VOICE);

// ---------------------------------------------------------------- cast
type Screens=[string,number][];
const SKIN_L:Screens=[[Y,.35],[R,.18]],SKIN_M:Screens=[[Y,.42],[R,.26],[K,.06]],SKIN_D:Screens=[[Y,.8],[R,.62],[K,.28]];
/** Colombia: yellow shirts with navy trim, white shorts and socks, navy numbers */
const col=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:'paper',socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,trim:[K,.9],numberInk:[K,.9],hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Uruguay: sky-blue shirts (a light blue screen), black (navy) shorts and socks */
const uru=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],shorts:[K,.92],socks:[K,.92],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:[K,.9],number:null,hairStyle:'short',build:{height:1.82,bulk:1.02},...o});
const B_JAM:Build={height:1.8,bulk:.97},B_AGU:Build={height:1.85,bulk:1},B_MUS:Build={height:1.9,bulk:1},B_GOD:Build={height:1.87,bulk:1.06};
const JAM_ST=col({number:10,build:B_JAM,seed:10});
const AGU_ST=col({number:8,skin:SKIN_D,build:B_AGU,seed:8});
const MUS_ST:AthleteStyle={shirt:[R,.82],shorts:[R,.82],socks:[R,.82],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:B_MUS,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (τ = 0: the ball meets his chest)
/** James with his back to goal, 25 yards out, just left of centre, facing back up the pitch (−x) */
const JP:[number,number]=[-21.4,-1.1],YAW_BACK=Math.PI;
const CHEST_POSE=():Pose=>posed({lean:-24,pitch:-8,neckP:40,lShA:52,rShA:52,lShF:14,rShF:14,lElb:60,rElb:60,lHipF:24,rHipF:18,lKnee:34,rKnee:28,lAnk:-6,rAnk:-6});
/** where the header meets him: just in front of his chest */
const CHEST_PT:V3=(()=>{const sk=solve(CHEST_POSE(),B_JAM,{x:JP[0],z:JP[1],yaw:YAW_BACK});return[sk.chest[0]-.2,sk.chest[1]+.02,sk.chest[2]] as V3;})();
/** Aguilar's forward header: from ≈ 11 m further out, TH1 s in the air */
const TH1=1.05;
/** the turn and the volley: the ball pops up off the chest, he spins to face goal and meets it with his LEFT foot TV s later */
const TV=.74,VCU=.5,VDUR=.9,VH=.45;
const GOAL_PT:V3=[0,2.3,-1.95],ACC:V3=[0,-12.6,0],TS=.95,TG=TV+TS;
/** volley stance: pelvis a little toward goal, facing along the shot */
const VPL:[number,number]=[JP[0]+.35,JP[1]-.2];
const PV:V3=(()=>{const dir=nrm2(GOAL_PT[0]-VPL[0],GOAL_PT[2]-VPL[1]),yaw=yawTo(dir[0],dir[1]),sk=solve(volley(VCU,{foot:'l',height:VH}),B_JAM,{x:VPL[0],z:VPL[1],yaw});return[sk.lToe[0]+dir[0]*.1,Math.max(.35,sk.lToe[1]),sk.lToe[2]+dir[1]*.1] as V3;})();
const YAW_V=(()=>{const d=nrm2(GOAL_PT[0]-VPL[0],GOAL_PT[2]-VPL[1]);return yawTo(d[0],d[1]);})();
const V_POP=launch(CHEST_PT,PV,TV,G3);
const V_SHOT=launch(PV,GOAL_PT,TS,ACC);
/** off the underside of the bar, down into the net */
const DOWN_PT:V3=[.95,BALL_R,-2.05],TD=.2,REST:V3=[1.6,BALL_R,-2.1];
/** Aguilar heads it from out here (his forehead solved from a standing header) */
const AGP:[number,number]=[-32.2,.4],YAW_A=yawTo(JP[0]-AGP[0],JP[1]-AGP[1]);
const HEAD_A:V3=(()=>{const sk=solve(header(.52),B_AGU,{x:AGP[0],z:AGP[1],yaw:YAW_A}),d=sub3(sk.face,sk.head),l=Math.hypot(d[0],d[1],d[2])||1;return[sk.face[0]+d[0]/l*(BALL_R+.02),sk.face[1]+d[1]/l*(BALL_R+.02),sk.face[2]+d[2]/l*(BALL_R+.02)] as V3;})();
const V_HEAD=launch(HEAD_A,CHEST_PT,TH1,G3);
/** Muslera: a late leap to HIS RIGHT (−z; he faces −x), right palm up toward the top corner; the ball grazes his right-hand fingertips */
const TIP_L=.8,T_TOUCH=TG-.1,T_DIVE=T_TOUCH-.62*TIP_L,DIVE=(u:number)=>keeperTip(clamp(u),{hand:'r'});
/** where Muslera plants for the leap (tuned so his right fingertips just reach the ball) */
const MZ=-1.8,MX=-2.4;
const T0=-4,T1=TG+6;
type Actor={name:string;style:AthleteStyle;keys:number[][];hero?:boolean;build:Build};
const ACTORS:Actor[]=[
 {name:'James Rodríguez',hero:true,style:JAM_ST,build:B_JAM,keys:[[T0,-24,-3.4],[-2.2,-22.8,-2.2],[-.9,-21.6,-1.3],[-.2,...JP],[.25,...JP],[TV-.1,...VPL],[TV+.5,-20.6,-1.6],[TG+1.2,-18,-8],[T1,-12,-22]]},
 {name:'Abel Aguilar',hero:true,style:AGU_ST,build:B_AGU,keys:[[T0,-36,1.4],[-2.2,-33.4,.8],[-TH1-.3,...AGP],[1,...AGP],[T1,-26,-6]]},
 {name:'Fernando Muslera',hero:true,style:MUS_ST,build:B_MUS,keys:[[T0,-2.2,.4],[0,-1.9,-.1],[TV,-2.2,-.9],[TV+.3,MX,MZ],[T1,MX,MZ]]},
 {name:'Diego Godín',hero:true,style:uru({number:3,build:B_GOD,seed:3}),build:B_GOD,keys:[[T0,-14.5,-3.2],[0,-15.8,-2.8],[TV,-17.2,-2.4],[T1,-17,-2.2]]},
 {name:'Maxi Pereira',style:uru({number:16,skin:SKIN_M,seed:16}),build:{},keys:[[T0,-16,3],[0,-17.4,2.2],[TV,-18.3,1.6],[T1,-18,1.4]]},
 {name:'Uruguay midfielder',style:uru({seed:41}),build:{},keys:[[T0,-28,-5],[0,-25.5,-3.6],[TV,-24.6,-3],[T1,-23,-2.6]]},
 {name:'Uruguay defender',style:uru({skin:SKIN_D,seed:42}),build:{},keys:[[T0,-12,6],[0,-12.6,5],[TV,-13,4],[T1,-12.5,3.6]]},
 {name:'Uruguay full-back',style:uru({seed:43}),build:{},keys:[[T0,-14,-11],[0,-15,-10],[TV,-15.6,-9.6],[T1,-15,-9]]},
 {name:'Colombia striker',style:col({skin:SKIN_D,seed:61}),build:{},keys:[[T0,-16,8],[0,-14,7],[TV,-12,6],[T1,-14,-6]]},
];
const JAM=0,AGU=1,GK=2,GOD=3;
const TR=makeTracks(ACTORS.map(a=>a.keys),T0,T1);

// ---------------------------------------------------------------- the ball
function ballAt(tau:number):V3{
 if(tau<=-TH1)return HEAD_A;
 if(tau<=0)return flyA(HEAD_A,V_HEAD,G3,tau+TH1);
 if(tau<TV)return flyA(CHEST_PT,V_POP,G3,tau);
 if(tau<TG)return flyA(PV,V_SHOT,ACC,tau-TV);
 if(tau<TG+TD)return mix3(GOAL_PT,DOWN_PT,easeOut((tau-TG)/TD));
 const u=clamp((tau-TG-TD)/.6),b=.28*Math.abs(Math.sin(u*Math.PI*2))*(1-u);
 return[lerp(DOWN_PT[0],REST[0],u),BALL_R+b,lerp(DOWN_PT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?tau*TAU*1.5:tau<TV?tau*TAU*.8:TV*TAU*.8+(tau-TV)*TAU*9;
const bulgeAt=(tau:number)=>tau<TG+TD?0:Math.exp(-(tau-TG-TD)*2.4)*(1+.3*Math.sin((tau-TG)*14));
/** the bar shakes after the ball kisses its underside */
const barShake=(tau:number)=>tau<TG?0:.05*Math.exp(-(tau-TG)*6)*Math.sin((tau-TG)*60);

// ---------------------------------------------------------------- poses
/** the quick look over the shoulder (Guardian): head and shoulders turn back toward the goal for a beat */
const T_LOOK=-.85,LOOK=(p:Pose,w:number):Pose=>({...p,neckY:p.neckY-1.2*w,twist:p.twist-.35*w,neckP:p.neckP-.1*w});
function stateOf(k:number,tau:number):State{
 const[x,z]=TR.pos(k,tau);let pose=loco(TR,k,tau),yaw=faceYaw(TR,k,tau,ballAt(tau));
 switch(k){
  case JAM:{
   yaw=YAW_BACK;if(tau<-1.2)yaw=lerpAng(faceYaw(TR,JAM,tau,ballAt(tau)),YAW_BACK,sm(-2,-1.2,tau));
   pose=LOOK(pose,win(tau,T_LOOK-.25,T_LOOK+.3,.12));
   pose=blendPose(pose,CHEST_POSE(),win(tau,-.35,.3,.2));
   // the spin: to his left, as one mass, to face goal before the ball drops
   if(tau>.12)yaw=lerpAng(YAW_BACK+.001,YAW_V,sm(.12,.55,tau));
   const vt=(tau-(TV-VCU*VDUR))/VDUR,w=win(tau,TV-VCU*VDUR-.05,TV+.6,.15);if(w>0)pose=blendPose(pose,volley(clamp(vt),{foot:'l',height:VH}),w);
   if(tau>TG+.3){pose=blendPose(pose,celebrate(TR.dist(JAM,tau)/4.2,{kind:'run'}),sm(TG+.3,TG+.9,tau));yaw=faceYaw(TR,JAM,tau,[0,0,-30]);}
   break;}
  case AGU:{const u=(tau+TH1)/1+.52;if(u>0&&u<1.2)pose=blendPose(pose,header(clamp(u)),win(u,0,1.1,.15));yaw=lerpAng(yaw,YAW_A,sm(-TH1-.9,-TH1-.4,tau)*(1-sm(.6,1.2,tau)));break;}
  case GK:{pose=blendPose(keeperSet(tau*1.3),pose,.3);
   if(tau>T_DIVE-.15)pose=blendPose(pose,DIVE((tau-T_DIVE)/TIP_L),sm(T_DIVE-.15,T_DIVE,tau));
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.6);
   {const b=ballAt(Math.min(tau,TV));yaw=yawTo(b[0]-x,b[2]-z);}break;}
  default:if(k>=3&&k<=7){yaw=faceYaw(TR,k,Math.min(tau,TV),ballAt(Math.min(tau,TV)));if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);}
   if(k===8&&tau>TG+.4)pose=blendPose(pose,celebrate(tau,{kind:'arms'}),sm(TG+.5,TG+1.1,tau)*.8);
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k],hero=!!a.hero;return{st:stateOf(k,tau),prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===JAM&&tau>TV-.3&&tau<TV+.3)||(k===GK&&tau>T_DIVE&&tau<T_DIVE+.6))};});
 const r=drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2],by:.6});
 // the kissed crossbar: a paper-and-navy shake line over the bar for a moment
 const sh=barShake(tau);if(sh!==0){const p=new Path2D();seg3(c,[0,2.44+sh,-3.66],[0,2.44+sh,3.66],.1,p);s.knockout(p);s.stroke(K,p,2,.9);}
 return r;
}

// ---------------------------------------------------------------- the stadium: the Maracanã at dusk, floodlights on, a yellow Colombian crowd
const MARACANA:StadiumSpec={sky:'dusk',seats:[[B,.3],[Y,.18]],rake:36,tiers:[[.42,.47]],roof:true,lamps:true,
 crowd:[[.14,.52,.1,.1,.14],[.12,.56,.1,.08,.14],[.16,.46,.1,.1,.18],[.14,.3,.1,.1,.36]]};

// ---------------------------------------------------------------- 1 · live: high main-stand camera, real time
function tau1(t:number){const tV=CUE(0,'volley')+.05;return Math.max(T0+.2,t-(tV-TV));}
const P1:V3=[-28,26,-74];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-24,4,6],fov:36})],
  [CUE(0,'Colombia play')-.2,1.2,()=>({P:P1,T:mix3(at3(TR,AGU,tau,1),[JP[0],1,JP[1]],.4),fov:14})],
  [CUE(0,'The ball is headed')-.3,.9,()=>({P:P1,T:mix3(b,[JP[0],1.2,JP[1]],.5),fov:10})],
  [CUE(0,'chest')-.3,.6,()=>({P:P1,T:[JP[0]+.6,1.1,JP[1]],fov:6})],
  [CUE(0,'volley')+.1,.6,()=>({P:P1,T:mix3([JP[0],1.2,JP[1]],[-2,1.6,-1.5],.2+.7*sm(TV,TG,tau)),fov:lerp(8,14,sm(TV,TG,tau))})],
  [CUE(0,'Off the crossbar')+.9,1.2,()=>({P:P1,T:at3(TR,JAM,tau,1),fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tO=CUE(0,'Off the crossbar');
  stadium(s,c,t,MARACANA,[0,1,3],{roar:sm(TG,TG+.4,tau),flash:sm(tO-.2,tO+.3,t)*(1-sm(tO+2.2,tO+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:14,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'turn')+.1;},
};

// ---------------------------------------------------------------- 2 · slow replay from goal-side, facing him: the quick look
const tau2=(t:number)=>key(t,mono([[0,-2.2],[CUE(1,'back is to the goal'),-1.6],[CUE(1,'quick look'),T_LOOK-.1],[CUE(1,'quick look')+1.2,T_LOOK+.3],[CUE(1,'Now he knows'),-.5],[SECS(1),-.12]]),linear);
const E2:V3=[-9.5,3.4,-6.2];
function cam2(t:number):Cam{
 const tau=tau2(t),j=at3(TR,JAM,tau,1.4);
 return plan(t,[
  [0,0,()=>({P:E2,T:add3(j,[-2,-.3,.4]),fov:26})],
  [CUE(1,'back is to the goal')-.2,.9,()=>({P:E2,T:j,fov:15})],
  [CUE(1,'quick look')-.2,.6,()=>({P:E2,T:add3(j,[0,.25,0]),fov:9})],
  [CUE(1,'Now he knows')-.2,1,()=>({P:add3(E2,[0,.8,0]),T:add3(j,[.4,-.2,0]),fov:22})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,MARACANA,[2,3]);
  ground(s,c);
  groundRing(s,c,at3(TR,JAM,tau,0),.8,Y,sm(CUE(1,'Watch')-.1,CUE(1,'Watch')+.4,t),.14);
  // "Now he knows where the goal is": a dashed yellow sight-line from his head to the goal mouth
  const la=sm(CUE(1,'quick look')+.2,CUE(1,'quick look')+.8,t);if(la>0){const st=stateOf(JAM,Math.max(tau,T_LOOK)),sk=solve(st.pose,B_JAM,st.place),a=pr(c,sk.head),b=pr(c,[0,1.3,-1.6]);
   if(a&&b){const gaps:[number,number][]=[];for(let i=0;i<10;i++)gaps.push([(i+.6)/10,(i+.97)/10]);const d=ribbon(partial([a,b],la),7,{seed:33,taper:0,wobble:.4,gaps});s.knockout(d,.9*la);s.fill(Y,d,.95*la);s.stroke(K,d,2,.7*la);}}
  markRing(s,c,at3(TR,GOD,tau,0),win(t,CUE(1,'back is to the goal'),CUE(1,'quick look'),.3));
  trail(s,c,ballAt,Math.max(-TH1,tau-.8),Math.min(tau,0),1);
  play(s,c,tau,tp,{min:10});
 },
 aperture(t){const c=cam2(t),q=pr(c,at3(TR,JAM,tau2(twos(t)),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 get still(){return CUE(1,'quick look')+.3;},
};

// ---------------------------------------------------------------- 3 · high behind the goal: chest, spin, volley, the dip, the fingertips, the bar
const tau3=(t:number)=>key(t,mono([[0,-.5],[CUE(2,'cushions'),-.02],[CUE(2,'spins'),.3],[CUE(2,'left foot'),TV],[CUE(2,'dips'),TV+.55],[CUE(2,'dips')+1.4,TG+.1],[SECS(2),TG+2]]),linear);
const E3:V3=[7.5,5.4,-3.2];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E3,T:[JP[0],1.2,JP[1]],fov:12})],
  [CUE(2,'left foot')+.1,.7,()=>({P:E3,T:mix3(b,[-1,1.8,-1.4],.5),fov:24})],
  [CUE(2,'dips')+.2,.9,()=>({P:E3,T:[-1.5,1.9,-1.6],fov:30})],
  [CUE(2,'dips')+1.9,1.2,()=>({P:E3,T:at3(TR,JAM,tau,1),fov:20})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12);
  stadium(s,c,t,MARACANA,[2,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau))});
  ground(s,c);
  trail(s,c,ballAt,Math.max(TV,tau-1),Math.min(tau,TG),1-sm(TG+.3,TG+.8,tau));
  play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  // the kiss on the bar: a yellow burst at the underside
  const hit=(tau-TG)/.3;if(hit>0&&hit<1){const g=pr(c,GOAL_PT);if(g)sparkBurst(s,Y,g[0],g[1],Math.max(50,kAt(c,GOAL_PT)*.7),{n:10,seed:29,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:9});}
 },
 // the passage opens from the scorer, not an empty point in the net (that showed a blank green disc in the mesh)
 aperture(t){const c=cam3v(t),q=pr(c,at3(TR,JAM,tau3(twos(t)),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 get still(){return CUE(2,'dips')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson from the side: chest, turn, volley, never touches the ground
const tau4=(t:number)=>key(t,mono([[0,-.6],[CUE(3,'Cushion'),-.05],[CUE(3,'Cushion')+.8,.05],[CUE(3,'turn'),.2],[CUE(3,'volley it'),TV],[CUE(3,'volley it')+.7,TV+.04],[SECS(3),TV+.7]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-21,2.4,-11.5],T:[JP[0]+.3,1,JP[1]],fov:22})],
  [CUE(3,'turn')-.2,.8,()=>({P:[-21.5,2.2,-10.5],T:[JP[0]+.4,.8,JP[1]],fov:18})],
  [CUE(3,'before it touches')-.3,.9,()=>({P:[-22,2.6,-12],T:[JP[0]+3,.9,JP[1]],fov:28})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tC=CUE(3,'Cushion'),tT=CUE(3,'turn'),tV=CUE(3,'volley it'),tB=CUE(3,'before it touches');
  stadium(s,c,t,MARACANA,[0,1,3],{roar:.3});
  ground(s,c);
  // "before it touches the ground": the pop's path, dashed, and a red ring on the grass under it that the ball never reaches
  const ba=sm(tB-.2,tB+.4,t);if(ba>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,flyA(CHEST_PT,V_POP,G3,TV*i/16));if(p)pts.push(p);}
   if(pts.length>2){const gaps:[number,number][]=[];for(let i=0;i<8;i++)gaps.push([(i+.62)/8,(i+.98)/8]);const d=ribbon(pts,Math.max(6,kAt(c,PV)*.05),{seed:21,taper:.1,wobble:.5,gaps});s.knockout(d,.9*ba);s.fill(Y,d,.95*ba);}
   groundRing(s,c,[PV[0],0,PV[2]],.55,R,ba,.1);}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[JAM,GOD,4]});
  const st=stateOf(JAM,tau),sk=solve(st.pose,B_JAM,st.place);
  const ring=(P:V3,rr:number,ink:string,a:number,seed:number)=>{const q=pr(c,P);if(!q||a<=0)return;const pts:Pt[]=[];for(let i=0;i<28;i++){const u=i/28*TAU;pts.push([q[0]+Math.cos(u)*rr,q[1]+Math.sin(u)*rr*.8]);}const rp=ribbon(pts,Math.max(5,rr*.15),{seed,close:true,wobble:.8,pressure:.2});s.knockout(rp,.9*a);s.fill(ink,rp,.95*a);};
  // "Cushion the ball on your chest": a yellow ring on the chest as it lands
  ring(sk.chest,Math.max(30,kAt(c,sk.chest)*.3),Y,win(t,tC-.1,tT+.3,.2),8);
  // "turn": a red arc arrow round him, turning to face goal
  const ta=win(t,tT-.1,tV+.4,.2);if(ta>0){const q:V3[]=[];for(let i=0;i<=10;i++){const a=Math.PI*.95*(i/10)*ta+Math.PI/2;q.push([JP[0]+Math.cos(a)*.9,.9,JP[1]-Math.sin(a)*.9]);}arrow3(s,c,q,Math.max(7,kAt(c,[JP[0],1,JP[1]])*.07),R,.95*ta);}
  // "volley it": a ring on the LEFT boot and a burst at contact
  const va=win(t,tV-.1,SECS(3),.2);if(va>0){ring(sk.lToe,Math.max(24,kAt(c,sk.lToe)*.2),Y,va,9);if(tau>TV-.05&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],70*va,{n:9,seed:41,g:easeOutBack(va),width:9});}
 },
 get still(){return CUE(3,'volley it')+.4;},
};

const film:RisoStory={
 id:'james-volley-2014',format:'11v11',title:"Rodríguez's Puskás volley",
 theme:'Cushion the ball on your chest, turn, and volley it before it touches the ground',
 ageNote:'Colombia 2–0 Uruguay, World Cup round of 16, Maracanã, Rio de Janeiro, 28 June 2014. For players of every age.',
 spec:SPEC,
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: chest and volley — a ball pops up off the tap, hangs, and is volleyed away with a yellow burst. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const pop=clamp(age/.35),out=clamp((age-.38)/.4),bx=age<.38?x:x+260*easeOut(out),by=age<.38?y-110*Math.sin(Math.PI*pop):y-80*out;
  if(age>.36&&age<.6)sparkBurst(s,Y,x,y,110,{n:10,seed:seed+1,g:easeOutBack(clamp((age-.36)/.12))*(1-clamp((age-.48)/.12)),width:14});
  if(out<1)footballPanels(s,bx,by,28,{rot:age*12+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved facts (pitch metres; Uruguay's goal line x = 0, +z = Colombia's right) — checked by tests/play-film-james-volley-2014.cjs. */
export const FACTS={JP,CHEST_PT,PV,TV,TG,GOAL_PT,HEAD_A,ballAt,shotFoot:'l' as const,T_LOOK,
 jamesAt:(tau:number)=>{const st=stateOf(JAM,tau),sk=solve(st.pose,B_JAM,st.place);return{chest:sk.chest,lToe:sk.lToe,rToe:sk.rToe,pelvis:sk.pelvis,head:sk.head,face:sk.face,yaw:st.place.yaw??0};},
 aguilarAt:(tau:number)=>{const st=stateOf(AGU,tau),sk=solve(st.pose,B_AGU,st.place);return{face:sk.face};},
 musleraAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_MUS,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};},d3};
