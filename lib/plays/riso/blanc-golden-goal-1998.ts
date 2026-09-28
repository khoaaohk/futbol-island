/** Laurent Blanc's golden goal — France 1–0 Paraguay (golden goal, 114'), FIFA World Cup round of 16, Sunday 28 June 1998, Stade
 * Félix-Bollaert, Lens. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx)
 * or StoryFilmPlayer. A reconstruction of the goal from WRITTEN accounts (the broadcast footage itself was not reviewed), rendered as a riso
 * print. Plumbing: ./broadcast-kit.
 *
 * SOURCES (read Sept 2026 with curl, cached in the build scratchpad cardfilms-src/):
 *  - Wikipedia, "1998 FIFA World Cup knockout stage" (raw wikitext): 28 June 1998, 16:30 CEST, Stade Félix-Bollaert, Lens, 31,800, referee
 *    Ali Bujsaim; Blanc golden goal 114'; line-ups: Blanc No. 5, Trezeguet No. 20, Pires No. 11 (on 64'), Desailly No. 8, Thuram No. 15;
 *    Paraguay: Chilavert No. 1 (captain); kit boxes: France blue shirts, white shorts, red socks; Paraguay red-and-white striped shirts
 *    (pattern file: red and white vertical stripes), blue shorts, white socks. https://en.wikipedia.org/wiki/1998_FIFA_World_Cup_knockout_stage
 *  - Wikipedia, "Laurent Blanc" / "Golden goal": the first golden goal in World Cup history.
 *  - French Wikipedia, "Laurent Blanc": "le libéro marseillais reste aux avant-postes malgré Marcel Desailly qui l'exhorte de reprendre sa
 *    place. Blanc profite d'une remise de David Trezeguet et ajuste José Luis Chilavert"; career goals table: "du pied droit" (right foot).
 *    https://fr.wikipedia.org/wiki/Laurent_Blanc
 *  - OneFootball, "Laurent Blanc's golden goal that sent France through against Paraguay in 1998" (2026): "In extra time, Laurent Blanc chose
 *    to push on ... Lilian Thuram and Marcel Desailly urged him to stay back, but he went anyway. In the 114th minute, Pirès crossed, David
 *    Trezeguet cushioned a superb header and Blanc half-volleyed in with his right". https://onefootball.com/fr/news/laurent-blancs-golden-goal-that-sent-france-through-against-paraguay-in-1998-43094342
 * CONFIRMED: date, venue, afternoon, 0–0 into extra time, the golden-goal rule; Blanc (a defender) stayed forward although his team-mates
 *  urged him back; Pirès crossed; Trezeguet cushioned a header down; Blanc half-volleyed it in with his RIGHT foot past Chilavert; the first
 *  golden goal in World Cup history; kits and numbers.
 * INFERRED (never named in the narration): the side of the cross (drawn from the left) and Pirès's crossing foot (right); every position,
 *  time and height; where the ball went in (drawn low, to Chilavert's left) and his dive; Chilavert's keeper kit (printed navy); which
 *  team-mate waves (drawn as Desailly's No. 8, far behind); the other players (unnamed, no numbers); cameras; the stadium's colours.
 *
 * FRAMING: ch1 = the high main-stand camera in REAL TIME (the box → Pirès on the left → the cross → Trezeguet's header down → Blanc's
 * half-volley → the net); ch2 = a slow wide replay from HIGH ON THE GOAL LINE looking back out: Blanc hanging at the edge of the box, No. 8
 * waving him back, Blanc waiting; ch3 = a low replay from BEHIND THE NET: the header down, the bounce, the right-foot half-volley straight at
 * us past Chilavert; ch4 = the lesson from the side: the late run from deep (arrow), nobody marking him (the nearest defender ringed far
 * away), the "ready" ring on the bounce and the first-time strike's arrow. World: right-handed metres (./broadcast-kit): Paraguay's goal
 * line x = 0, +z = France's right, so the left wing is −z. */
import timingJson from '../../../public/plays/narration/blanc-golden-goal-1998/timing.json';
import type {NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,header,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Build,type V3} from './athlete';
import {Y,R,B,K,DEG,SPEC,chaptersFrom,mono,add3,sub3,mix3,d3,lerpAng,yawTo,nrm2,launch,flyA,BALL_R,G3,frame,toCam,scr,pr,kAt,plan,
 stadium,ground,makeTracks,loco,faceYaw,win,DEJECT,at3,drawScene,arrow3,groundRing,trail,zone,markRing,type Cam,type State,type Fig,type StadiumSpec} from './broadcast-kit';

// ---------------------------------------------------------------- narration (text = public/plays/narration/<id>/script.json)
const SCRIPT=[
 {label:'Lens, 1998',text:'Lens, 1998. France against Paraguay, nil–nil in extra time. The next goal wins! Pirès crosses, Trezeguet heads it down... Laurent Blanc scores!',tail:2.2,
  cues:['Lens','nil–nil','next goal wins','Pirès crosses','Trezeguet','Laurent Blanc']},
 {label:'Watch it again',text:'Watch again. Blanc is a defender, but he stays up front. His teammates wave him back... but he waits for his chance.',tail:1.5,
  cues:['Watch again','a defender','stays up front','wave him back','he waits']},
 {label:'First time',text:'Here comes the header down. Blanc hits it first time, with his right foot, before it can bounce again. The first golden goal in World Cup history!',tail:2.2,
  cues:['Here comes','first time','right foot','before it can bounce','first golden goal']},
 {label:'Be ready',text:'Defenders who join the attack late are hard to mark. Be ready, and finish first time!',tail:2,
  cues:['Defenders who join','hard to mark','Be ready','finish first time']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const {CHAPTERS,CUE,SECS}=chaptersFrom('blanc',SCRIPT,VOICE);

// ---------------------------------------------------------------- cast
type Screens=[string,number][];
const SKIN_L:Screens=[[Y,.35],[R,.18]],SKIN_M:Screens=[[Y,.42],[R,.26],[K,.06]],SKIN_D:Screens=[[Y,.8],[R,.62],[K,.28]];
/** France: blue shirts, white shorts, red socks, white numbers */
const fra=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:'paper',socks:[R,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.9],numberInk:'paper',hairStyle:'short',build:{height:1.82,bulk:1},...o});
/** Paraguay: red and white vertical stripes, blue shorts, white socks */
const par=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],pattern:'stripes',patternInk:'paper',shorts:[B,.95],socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,trim:K,number:null,hairStyle:'short',build:{height:1.8,bulk:1.02},...o});
const B_BLA:Build={height:1.92,bulk:1},B_TRE:Build={height:1.9,bulk:.98},B_PIR:Build={height:1.86,bulk:.95},B_CHI:Build={height:1.88,bulk:1.12};
/** Blanc No. 5: tall, balding with short dark hair at the sides */
const BLA_ST=fra({number:5,hairStyle:'balding',hair:[K,.8],build:B_BLA,seed:5});
const TRE_ST=fra({number:20,hair:[K,.9],skin:SKIN_M,build:B_TRE,seed:20});
const PIR_ST=fra({number:11,hair:[K,.85],build:B_PIR,seed:11});
const DES_ST=fra({number:8,hairStyle:'bald',skin:SKIN_D,build:{height:1.86,bulk:1.08},seed:8});
const CHI_ST:AthleteStyle={shirt:[K,.72],shorts:[K,.8],socks:[K,.72],boots:K,skin:SKIN_M,hair:K,line:K,trim:[Y,.7],gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:[Y,.9],build:B_CHI,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (τ = 0 is Pirès's cross)
/** the cross from the left, TC s to Trezeguet's head */
const P0:V3=[-12.5,BALL_R,-26.5],TC=1.2;
/** Trezeguet meets it level with the penalty spot, just left of centre, facing back toward the cross */
const HPT:[number,number]=[-8.6,-.6],FACE_T=nrm2(-.55,-.83),YAW_T=yawTo(FACE_T[0],FACE_T[1]);
const TCU=.52,TDUR=1,TJT=TC-TCU*TDUR;
/** the cushioned header: a softer, lower jump than a power header */
const CUSHION=(u:number):Pose=>{const p=header(clamp(u));p.air*=.55;return p;};
const HEAD_T:V3=(()=>{const sk=solve(CUSHION(TCU),B_TRE,{x:HPT[0],z:HPT[1],yaw:YAW_T}),d=sub3(sk.face,sk.head),l=Math.hypot(d[0],d[1],d[2])||1;return[sk.face[0]+d[0]/l*(BALL_R+.02),sk.face[1]+d[1]/l*(BALL_R+.02),sk.face[2]+d[2]/l*(BALL_R+.02)] as V3;})();
const V_CROSS=launch(P0,HEAD_T,TC,G3);
/** the header drops to a bounce, and Blanc meets the rising ball (the half-volley) */
const BNC:V3=[-11.1,BALL_R,-1.9],TB1=.62,TB2=.12,REST_K=.28;
const V_DOWN=launch(HEAD_T,BNC,TB1,G3);
const V_UP:V3=[V_DOWN[0]*.85,-(V_DOWN[1]-GRAVT(TB1))*REST_K,V_DOWN[2]*.85];
function GRAVT(t:number){return 9.81*t;}
const TS=TC+TB1+TB2;
const PC:V3=flyA(BNC,V_UP,G3,TB2);
/** the finish: low, to Chilavert's left (+z) */
const GOAL_PT:V3=[0,.42,1.95],TF=.5,TG=TS+TF,NET_HIT:V3=[1.5,.35,2.05],REST:V3=[1.2,BALL_R,2];
const V_SHOT=launch(PC,GOAL_PT,TF,G3);
const DS=nrm2(V_SHOT[0],V_SHOT[2]),YAW_S=yawTo(DS[0],DS[1]);
const PCB:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.8}),B_BLA,{x:0,z:0,yaw:YAW_S});return[PC[0]-DS[0]*.1-sk.rToe[0],PC[2]-DS[1]*.1-sk.rToe[2]];})();
const kb=(u:number):[number,number]=>[PCB[0]+DS[0]*u,PCB[1]+DS[1]*u];
/** Pirès crosses along the ball's path with his right foot (inferred) */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_P=yawTo(DC[0],DC[1]);
const PCP:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_PIR,{x:0,z:0,yaw:YAW_P});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
const kp=(u:number):[number,number]=>[PCP[0]+DC[0]*u,PCP[1]+DC[1]*u];
/** Chilavert: set, then a dive to his LEFT (+z; he faces −x), beaten low */
const T_DIVE=TS+.05,DIVE_L=.9,DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:.1});
/** Desailly (No. 8, far behind) waves Blanc back */
const T_WAVE0=-5.4,T_WAVE1=-2.8;
const T0=-7,T1=TG+6;
type Actor={name:string;style:AthleteStyle;keys:number[][];hero?:boolean;build:Build};
const ACTORS:Actor[]=[
 {name:'Laurent Blanc',hero:true,style:BLA_ST,build:B_BLA,keys:[[T0,-25.5,-3.5],[-5,-24.6,-3],[-2.4,-24.2,-2.6],[-.4,-23.2,-2.4],[.6,-19.4,-2.4],[TS-.55,...kb(-1.6)],[TS,...kb(0)],[TS+.7,...kb(.9)],[TG+1.5,-9,-6],[T1,-6,-14]]},
 {name:'David Trezeguet',hero:true,style:TRE_ST,build:B_TRE,keys:[[T0,-12,2],[-2,-11,1.2],[0,-10.2,.6],[TJT-.2,...HPT],[TC+.8,...HPT],[T1,-7,-6]]},
 {name:'Robert Pirès',hero:true,style:PIR_ST,build:B_PIR,keys:[[T0,-22,-28],[-2.4,-17,-27.4],[-.9,...kp(-2.8)],[-.5,...kp(-1.6)],[0,...kp(0)],[.7,...kp(.9)],[T1,-6,-20]]},
 {name:'José Luis Chilavert',hero:true,style:CHI_ST,build:B_CHI,keys:[[T0,-1.8,-1.8],[0,-1.6,-1.6],[TC,-1.4,-.6],[TS,-1.4,-.4],[T1,-1.4,-.4]]},
 {name:'Marcel Desailly (waving)',style:DES_ST,build:{height:1.86},keys:[[T0,-44,-4],[-3,-43,-3.5],[0,-40,-3],[T1,-30,-4]]},
 {name:'Paraguay marker',hero:true,style:par({seed:41}),build:{},keys:[[T0,-10.5,2.6],[0,-9.8,1.6],[TC,-9.1,.4],[T1,-8.4,-.2]]},
 {name:'Paraguay centre-back',hero:true,style:par({skin:SKIN_D,seed:42}),build:{},keys:[[T0,-8,-5],[0,-7.6,-5.4],[TC,-7,-4.2],[TS,-7.2,-3.4],[T1,-7,-2.6]]},
 {name:'Paraguay full-back',style:par({skin:SKIN_L,seed:43}),build:{},keys:[[T0,-18,-22],[0,-14.6,-24.6],[TC,-13.4,-22],[T1,-11,-16]]},
 {name:'Paraguay midfielder',style:par({seed:44}),build:{},keys:[[T0,-17,6],[0,-16.2,4.6],[TS,-14.8,2.6],[T1,-12,1]]},
 {name:'Paraguay far post',style:par({skin:SKIN_D,seed:45}),build:{},keys:[[T0,-6,6],[0,-5.6,5.4],[TS,-5,4],[T1,-4.4,3]]},
 {name:'French attacker',style:fra({seed:61}),build:{},keys:[[T0,-9,6.2],[0,-8,5.6],[TC,-6.6,4.6],[T1,-8,-2]]},
];
const BLA=0,TRE=1,PIR=2,GK=3,DES=4;
const TR=makeTracks(ACTORS.map(a=>a.keys),T0,T1);

// ---------------------------------------------------------------- the ball
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TC)return flyA(P0,V_CROSS,G3,tau);
 if(tau<TC+TB1)return flyA(HEAD_T,V_DOWN,G3,tau-TC);
 if(tau<TS)return flyA(BNC,V_UP,G3,tau-TC-TB1);
 if(tau<TG)return flyA(PC,V_SHOT,G3,tau-TS);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5);return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u)),lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TS?tau*TAU*3:TS*TAU*3+(tau-TS)*TAU*8;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses
const WAVE=(p:Pose,w:number,tau:number):Pose=>w<=0?p:blendPose(p,{...p,rShA:(158-18*Math.sin(tau*9))*DEG,rShF:20*DEG,rElb:25*DEG,lShA:(145-20*Math.sin(tau*9+1))*DEG,lElb:30*DEG},w);
function stateOf(k:number,tau:number):State{
 const[x,z]=TR.pos(k,tau);let pose=loco(TR,k,tau),yaw=faceYaw(TR,k,tau,ballAt(tau));
 switch(k){
  case BLA:{
   if(tau<-.4)yaw=faceYaw(TR,BLA,tau,[-9,0,-4]);
   const w=win(tau,TS-.55,TS+.85,.2);if(w>0)pose=blendPose(pose,strike(clamp((tau-TS)/1.0+STRIKE_CONTACT),{foot:'r',power:.8}),w);
   yaw=lerpAng(yaw,YAW_S,sm(TS-.8,TS-.45,tau)*(1-sm(TS+.9,TS+1.6,tau)));
   if(tau>TG+.3)pose=blendPose(pose,celebrate(TR.dist(BLA,tau)/4.2,{kind:'run'}),sm(TG+.3,TG+.9,tau));
   break;}
  case TRE:{
   if(tau>TJT-.3&&tau<TJT+TDUR+.5){const u=(tau-TJT)/TDUR;pose=blendPose(pose,CUSHION(u),sm(TJT-.3,TJT,tau)*(1-sm(TJT+TDUR,TJT+TDUR+.5,tau)));}
   const w=sm(TJT-.6,TJT-.1,tau)*(1-sm(TC+.6,TC+1.2,tau));yaw=lerpAng(yaw,YAW_T,w);
   if(tau>TG+.4)pose=blendPose(pose,celebrate(tau,{kind:'arms'}),sm(TG+.5,TG+1.1,tau)*.8);break;}
  case PIR:{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   yaw=lerpAng(yaw,YAW_P,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));if(tau>TG+.4)pose=blendPose(pose,celebrate(tau,{kind:'arms'}),sm(TG+.5,TG+1.1,tau)*.8);break;}
  case GK:{pose=blendPose(keeperSet(tau*1.3),pose,.3);
   if(tau>T_DIVE-.15)pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.7);
   yaw=faceYaw(TR,GK,Math.min(tau,TS),ballAt(Math.min(tau,TS)));break;}
  case DES:{yaw=faceYaw(TR,DES,tau,at3(TR,BLA,tau));pose=WAVE(pose,win(tau,T_WAVE0,T_WAVE1,.3),tau);
   if(tau>TG+.4)pose=blendPose(pose,celebrate(tau,{kind:'arms'}),sm(TG+.5,TG+1.1,tau)*.8);break;}
  default:if(k>=5&&k<=9&&tau>TG+.4)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);
   if(k===10&&tau>TG+.4)pose=blendPose(pose,celebrate(tau,{kind:'arms'}),sm(TG+.5,TG+1.1,tau)*.8);
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k],hero=!!a.hero;return{st:stateOf(k,tau),prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===BLA&&tau>TS-.25&&tau<TS+.35)||(k===TRE&&tau>TC-.2&&tau<TC+.3)||(k===GK&&tau>T_DIVE&&tau<T_DIVE+.6))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2],by:.5});
}

// ---------------------------------------------------------------- the stadium: a June afternoon in Lens, close English-style stands
const LENS:StadiumSpec={sky:'day',seats:[[Y,.25],[R,.22],[K,.18]],rake:28,tiers:[[.5,.55]],roof:true,
 crowd:[[.34,.06,.1,.26,.24],[.3,.06,.1,.3,.24],[.34,.06,.1,.24,.26],[.3,.05,.1,.25,.3]]};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
function tau1(t:number){const tS=CUE(0,'Laurent Blanc')+.05;return Math.max(T0+.2,t-(tS-TS));}
const P1:V3=[-18,22,-60];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-14,3,4],fov:34})],
  [CUE(0,'next goal wins')-.3,1.2,()=>({P:P1,T:mix3(at3(TR,PIR,tau,1),[-10,1,-4],.3),fov:18})],
  [CUE(0,'Pirès crosses')-.5,.8,()=>({P:P1,T:at3(TR,PIR,tau,1),fov:9})],
  [CUE(0,'Pirès crosses')+.2,1,()=>({P:P1,T:mix3(b,[HEAD_T[0],1.4,HEAD_T[2]],.5),fov:12})],
  [CUE(0,'Laurent Blanc')-.6,.6,()=>({P:P1,T:mix3([PC[0],1,PC[2]],[-4,1,0],.35),fov:12})],
  [CUE(0,'Laurent Blanc')+1,1.2,()=>({P:P1,T:at3(TR,BLA,tau,1),fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tS=CUE(0,'Laurent Blanc');
  stadium(s,c,t,LENS,[0,1,3],{roar:sm(TG,TG+.4,tau),flash:sm(tS,tS+.4,t)*(1-sm(tS+2.2,tS+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:14,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Laurent Blanc')+.4;},
};

// ---------------------------------------------------------------- 2 · a slow wide replay from high on the goal line, looking back out
const tau2=(t:number)=>key(t,mono([[0,-6.4],[CUE(1,'a defender'),-5.8],[CUE(1,'stays up front'),-5.2],[CUE(1,'wave him back'),-4.4],[CUE(1,'he waits'),-2],[SECS(1),-.2]]),linear);
const E2:V3=[3,8.5,-17];
function cam2(t:number):Cam{
 const tau=tau2(t),bl=at3(TR,BLA,tau,1.2),de=at3(TR,DES,tau,1.4);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-16,1,-2],fov:30})],
  [CUE(1,'a defender')-.3,.9,()=>({P:E2,T:bl,fov:12})],
  [CUE(1,'stays up front')-.2,.9,()=>({P:E2,T:mix3(bl,[-12,1,-1],.4),fov:18})],
  [CUE(1,'wave him back')-.3,.9,()=>({P:E2,T:mix3(bl,de,.55),fov:18})],
  [CUE(1,'he waits')-.2,1,()=>({P:E2,T:add3(bl,[-1,0,-.5]),fov:15})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,LENS,[2,3]);
  ground(s,c);
  groundRing(s,c,at3(TR,BLA,tau,0),.9,Y,sm(CUE(1,'a defender')-.2,CUE(1,'a defender')+.3,t),.14);
  // "wave him back": a red arrow from Blanc back toward his own half (what his team-mates want), which he ignores
  const wa=win(t,CUE(1,'wave him back')-.1,CUE(1,'he waits')+.4,.3);if(wa>0){const a=at3(TR,BLA,tau,.05),b=add3(a,[-9,0,-.5]);arrow3(s,c,[a,mix3(a,b,.5*wa),mix3(a,b,wa)],Math.max(8,kAt(c,a)*.12),R,.9*wa);}
  play(s,c,tau,tp,{min:10});
 },
 aperture(t){const c=cam2(t),q=pr(c,at3(TR,BLA,tau2(twos(t)),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 get still(){return CUE(1,'wave him back')+.3;},
};

// ---------------------------------------------------------------- 3 · low replay from behind the net: the header down, the half-volley at us
const tau3=(t:number)=>key(t,mono([[0,TC-.5],[CUE(2,'first time'),TS-.05],[CUE(2,'right foot'),TS+.08],[CUE(2,'before it can bounce'),TS+.3],[CUE(2,'first golden goal'),TG+.8],[SECS(2),TG+3.5]]),linear);
const E3:V3=[3.4,1.5,-1];
function cam3v(t:number):Cam{
 const tau=tau3(t);
 return plan(t,[
  [0,0,()=>({P:E3,T:[HEAD_T[0],1.6,HEAD_T[2]],fov:24})],
  [CUE(2,'first time')-.4,.6,()=>({P:E3,T:[PC[0],.4,PC[2]],fov:18})],
  [CUE(2,'before it can bounce')-.2,.7,()=>({P:E3,T:[-4,.6,.2],fov:40})],
  [CUE(2,'first golden goal')-.3,1.4,()=>({P:add3(E3,[0,1.5,0]),T:at3(TR,BLA,tau,1.1),fov:24})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tG=CUE(2,'first golden goal');
  stadium(s,c,t,LENS,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.2,TG+1.8,tau)),sm(tG-.1,tG+.4,t))});
  ground(s,c);
  trail(s,c,ballAt,Math.max(TC,tau-.9),Math.min(tau,TG),1-sm(TG+.3,TG+.8,tau));
  // the bounce: a small yellow burst where the header lands
  const bn=(tau-TC-TB1)/.3;if(bn>0&&bn<1){const g=pr(c,BNC);if(g)sparkBurst(s,Y,g[0],g[1],Math.max(40,kAt(c,BNC)*.5),{n:8,seed:13,g:easeOutBack(clamp(bn*2))*(1-clamp((bn-.5)*2)),width:8});}
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  const hit=(tau-TS)/.22;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4),{n:10,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:8});
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(TR,BLA,tau3(twos(t)),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 get still(){return CUE(2,'right foot')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson from the side: the late run, unmarked, ready, first time
const tau4=(t:number)=>key(t,mono([[0,-.6],[CUE(3,'hard to mark'),.6],[CUE(3,'Be ready'),TC+.3],[CUE(3,'finish first time'),TS],[CUE(3,'finish first time')+.8,TS+.08],[SECS(3),TG+.4]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-17,6,-19],T:[-16,1,-2.4],fov:34})],
  [CUE(3,'Be ready')-.3,.9,()=>({P:[-15,4,-14],T:[BNC[0],.5,BNC[2]],fov:26})],
  [CUE(3,'finish first time')-.3,.9,()=>({P:[-15,4.5,-15],T:[-5,.8,0],fov:34})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tD=CUE(3,'Defenders who join'),tH=CUE(3,'hard to mark'),tB=CUE(3,'Be ready'),tF=CUE(3,'finish first time');
  stadium(s,c,t,LENS,[0,1,3],{roar:.3+.4*sm(TG,TG+.4,tau)});
  ground(s,c);
  // "join the attack late": a yellow arrow of his run from deep into the space at the edge of the box
  const ra=sm(tD-.1,tD+.8,t)*(1-sm(tF+.5,tF+1.1,t));if(ra>0){const a:V3=[-25,.05,-3],b:V3=[PCB[0]-.6,.05,PCB[1]];arrow3(s,c,[a,mix3(a,b,.5*ra),mix3(a,b,ra)],Math.max(8,kAt(c,a)*.1),Y,.95*ra);}
  // "hard to mark": a paper zone of free space round him, the nearest defender ringed, far away
  const ha=win(t,tH-.1,tF+.3,.3);zone(s,c,[[PCB[0]-2.4,.01,PCB[1]-2.4],[PCB[0]+2.4,.01,PCB[1]-2.4],[PCB[0]+2.4,.01,PCB[1]+2.4],[PCB[0]-2.4,.01,PCB[1]+2.4]],Y,ha);markRing(s,c,at3(TR,8,tau,0),ha);
  // "Be ready": a red ring where the header will bounce
  groundRing(s,c,BNC,.7,R,win(t,tB-.1,tF+.5,.25),.12);
  play(s,c,tau,tp,{smear:true,min:12,only:[BLA,TRE,GK,5,6,8]});
  // "finish first time": the strike's arrow into the net
  const fa=sm(tF+.1,tF+1,t,easeInOutSine);if(fa>0){const q:V3[]=[];for(let i=0;i<=8;i++)q.push(flyA(PC,V_SHOT,G3,TF*fa*i/8));arrow3(s,c,q,Math.max(8,kAt(c,PC)*.07),Y,.95);}
 },
 get still(){return CUE(3,'finish first time')+.6;},
};

const film:RisoStory={
 id:'blanc-golden-goal-1998',format:'11v11',title:"Blanc's golden goal",
 theme:'Defenders who join the attack late are hard to mark: be ready and finish first time',
 ageNote:'France 1–0 Paraguay (golden goal), World Cup round of 16, Lens, 28 June 1998. For players of every age.',
 spec:SPEC,
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a golden goal — a ball drops, bounces once and is struck away, with a yellow star burst. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const fall=clamp(age/.25),out=clamp((age-.3)/.45),bx=age<.3?x:x+240*easeOut(out),by=age<.25?y-120*(1-fall*fall):age<.3?y-30*Math.sin(Math.PI*(age-.25)/.05):y-60*out;
  if(age>.28&&age<.55)sparkBurst(s,Y,x,y,110,{n:10,seed:seed+1,g:easeOutBack(clamp((age-.28)/.12))*(1-clamp((age-.43)/.12)),width:14});
  if(out<1)footballPanels(s,bx,by,28,{rot:age*12+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved facts (pitch metres; Paraguay's goal line x = 0, +z = France's right) — checked by tests/play-film-blanc-golden-goal-1998.cjs. */
export const FACTS={P0,HEAD_T,BNC,PC,TC,TS,TG,GOAL_PT,ballAt,shotFoot:'r' as const,T_WAVE0,T_WAVE1,
 blancContact:()=>{const st=stateOf(BLA,TS),sk=solve(st.pose,B_BLA,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 blancAt:(tau:number)=>{const st=stateOf(BLA,tau),sk=solve(st.pose,B_BLA,st.place);return{pelvis:sk.pelvis};},
 trezeguetAt:(tau:number)=>{const st=stateOf(TRE,tau),sk=solve(st.pose,B_TRE,st.place);return{face:sk.face,head:sk.head};},
 piresContact:()=>{const st=stateOf(PIR,0),sk=solve(st.pose,B_PIR,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 chilavertAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_CHI,st.place);return{lHa:sk.lHa,rHa:sk.rHa,lToe:sk.lToe,rToe:sk.rToe};},
 desaillyAt:(tau:number)=>{const st=stateOf(DES,tau),sk=solve(st.pose,{height:1.86},st.place);return{rHa:sk.rHa,head:sk.head,pelvis:sk.pelvis};},
 defendersAt:(tau:number)=>[5,6,7,8,9].map(k=>at3(TR,k,tau,0)),d3};
