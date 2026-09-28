/** Robin van Persie's flying header — Spain 1–5 Netherlands, FIFA World Cup Group B, Friday 13 June 2014, Arena Fonte Nova, Salvador.
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * A reconstruction of the goal from WRITTEN accounts (the broadcast footage itself was not reviewed), rendered as a riso print.
 * Plumbing: ./broadcast-kit.
 *
 * SOURCES (read Sept 2026 with curl, cached in the build scratchpad cardfilms-src/):
 *  - Wikipedia, "2014 FIFA World Cup Group B" (raw wikitext): 13 June 2014, 16:00 local, Arena Fonte Nova, Salvador, 48,173, referee Nicola
 *    Rizzoli; Alonso pen. 27' (1–0 Spain); "Robin van Persie scoring a 15-yard diving looping header after a long ball from Daley Blind from
 *    the left after he spotted Iker Casillas slightly off his line" (44'); Van Persie No. 9, captain; kit boxes: Spain in their white 2014
 *    change kit (the pattern files print white with red trim), the Netherlands in all dark blue (#00005C) away kit.
 *    https://en.wikipedia.org/wiki/2014_FIFA_World_Cup_Group_B
 *  - The Guardian, Paul Wilson, match report, 13 June 2014: "the Dutch equalised ... right on the stroke of the break ... Daley Blind must be
 *    congratulated on a stunning diagonal ball from halfway on the left touchline. Robin van Persie's run picked it up almost magnetically
 *    ... the Manchester United striker repositioned himself expertly to beat Casillas with a diving header instead. It could almost be
 *    described as a headed volley". https://www.theguardian.com/football/2014/jun/13/spain-holland-world-cup-2014-group-b-match-report
 * CONFIRMED: date, venue, daytime kick-off, 1–0 → 1–1 on the stroke of half-time; Blind's long DIAGONAL ball from HALFWAY on the LEFT
 *  touchline; Van Persie's run; a DIVING, LOOPING header from about 15 yards (≈ 14 m) over Casillas, who was off his line; kits and No. 9.
 * INFERRED (never named in the narration): Blind's kicking foot (his LEFT, his natural foot, from the left touchline); every position, time
 *  and height; the loop's apex and where it dropped in (drawn just left of centre, under the bar); Casillas's keeper kit (printed yellow)
 *  and his late back-pedal leap; the Spanish defender beside Van Persie and the other players (unnamed, no numbers); which end and the
 *  camera positions; the stadium's seat colours and crowd; the celebration.
 *
 * FRAMING: ch1 = the high main-stand camera in REAL TIME (Blind below us on the left touchline → the long diagonal → the flying header → the
 * loop into the net); ch2 = the slow replay from LOW IN FRONT OF HIM, looking back up his run: eyes on the ball over his shoulder, the run behind the
 * defender; ch3 = a replay from the SIDE, level with the dive: the body flat in the air, the forehead, the loop over Casillas; ch4 = the lesson
 * from high behind: his eye-line to the ball all the way, the dive arrow, a ring on the forehead and the loop arrow. World: right-handed metres
 * (./broadcast-kit): Spain's goal line x = 0, +z = the Dutch right, so the LEFT touchline is z = −34. */
import timingJson from '../../../public/plays/narration/van-persie-header-2014/timing.json';
import type {NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,keeperSet,keeperTip,celebrate,posed,blendPose,keyPoses,runCycle,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Build,type V3} from './athlete';
import {Y,R,B,K,SPEC,chaptersFrom,mono,add3,sub3,mix3,d3,lerpAng,yawTo,nrm2,launch,flyA,BALL_R,G3,frame,toCam,scr,pr,kAt,plan,
 stadium,ground,makeTracks,loco,faceYaw,win,DEJECT,at3,drawScene,arrow3,groundRing,trail,markRing,type Cam,type State,type Fig,type StadiumSpec} from './broadcast-kit';

// ---------------------------------------------------------------- narration
const SCRIPT=[
 {label:'Salvador, 2014',text:'Salvador, 2014, the World Cup. Spain lead the Netherlands one–nil. Daley Blind hits a long ball... Robin van Persie flies through the air! One–one!',tail:2.2,
  cues:['Salvador','Spain lead','Daley Blind','long ball','Robin van Persie','flies','One–one']},
 {label:'Watch it again',text:'Watch again, slowly. He watches the ball all the way over his shoulder, and times his run past the defender.',tail:1.5,
  cues:['Watch again','watches the ball','over his shoulder','times his run','past the defender']},
 {label:'The flying header',text:'Now from the side. He dives, flat as a plank, meets it with his forehead, and loops it over Casillas!',tail:2.2,
  cues:['Now from the side','dives','flat as a plank','forehead','loops it over']},
 {label:'Be brave',text:'Watch the long ball all the way. Be brave, dive at it, and meet it with your forehead!',tail:2,
  cues:['Watch the long ball','Be brave','dive at it','meet it']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const {CHAPTERS,CUE,SECS}=chaptersFrom('van-persie',SCRIPT,VOICE);

// ---------------------------------------------------------------- cast
type Screens=[string,number][];
const SKIN_L:Screens=[[Y,.35],[R,.18]],SKIN_M:Screens=[[Y,.42],[R,.26],[K,.06]],SKIN_D:Screens=[[Y,.8],[R,.62],[K,.28]];
/** the Netherlands: all dark blue (printed navy screens), paper numbers, orange (yellow × red) trim is too thin to print: red trim */
const ned=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.82],shorts:[K,.82],socks:[K,.82],boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.8],numberInk:'paper',hairStyle:'short',build:{height:1.82,bulk:1},...o});
/** Spain: all white with red trim and red numbers */
const esp=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,trim:[R,.9],numberInk:[R,.9],hairStyle:'short',build:{height:1.82,bulk:1},...o});
const B_RVP:Build={height:1.86,bulk:.97},B_BLI:Build={height:1.8,bulk:.95},B_CAS:Build={height:1.85,bulk:1},B_DEF:Build={height:1.84,bulk:1.04};
const RVP_ST=ned({number:9,build:B_RVP,seed:9});
const BLI_ST=ned({number:5,hair:[Y,.55],build:B_BLI,seed:5});
const CAS_ST:AthleteStyle={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:B_CAS,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (τ = 0 is Blind's long ball)
/** Blind's ball: from just inside halfway on the left touchline, TP s in the air */
const P0:V3=[-51.5,BALL_R,-31.8],TP=2.45,TH=1.22;
/** the flying header: take-off spot (pelvis) and the dive's direction (toward goal, a little toward the ball's side) */
const HPL:[number,number]=[-15.3,.9],FACE=nrm2(1,-.08),YAW_H=yawTo(FACE[0],FACE[1]);
/** the dive: run → take-off (.24) → flat in the air, chin up, CONTACT (.5) → arms forward (.74) → land on the chest (1) */
const DIVE_HEADER=(t:number):Pose=>keyPoses(clamp(t),[
 [0,runCycle(.1,{speed:1})],
 [.24,posed({lHipF:44,rHipF:-26,lKnee:80,rKnee:24,lAnk:20,rAnk:40,lean:18,pitch:24,lShF:-30,rShF:-40,lShA:30,rShA:30,lElb:60,rElb:60,air:.12,neckP:-22,dx:.3})],
 [.5,posed({pitch:74,air:.82,lean:-12,neckP:-48,lHipF:-12,rHipF:-22,lKnee:34,rKnee:46,lAnk:40,rAnk:40,lShA:58,rShA:62,lShF:-26,rShF:-30,lElb:30,rElb:34,dx:1.2,squash:.06})],
 [.74,posed({pitch:82,air:.32,lean:-10,neckP:-40,lHipF:-8,rHipF:-10,lKnee:30,rKnee:30,lShF:110,rShF:110,lShA:30,rShA:30,lElb:30,rElb:30,lHand:1,rHand:1,dx:2.1})],
 [1,posed({pitch:88,air:0,lean:-6,neckP:-30,lHipF:0,rHipF:4,lKnee:20,rKnee:26,lShF:120,rShF:120,lShA:40,rShA:40,lElb:50,rElb:50,lHand:1,rHand:1,dx:2.6,squash:-.05})],
]);
const HCU=.5,HDUR=.9,TJ=TP-HCU*HDUR;
/** his forehead at contact (solved from the skeleton): the ball's centre one radius in front of the face */
const HEAD_PT:V3=(()=>{const sk=solve(DIVE_HEADER(HCU),B_RVP,{x:HPL[0],z:HPL[1],yaw:YAW_H}),d=sub3(sk.face,sk.head),l=Math.hypot(d[0],d[1],d[2])||1;return[sk.face[0]+d[0]/l*(BALL_R+.02),sk.face[1]+d[1]/l*(BALL_R+.02),sk.face[2]+d[2]/l*(BALL_R+.02)] as V3;})();
const V_PASS=launch(P0,HEAD_PT,TP,G3);
/** the loop: up over Casillas, dropping in under the bar just left of centre */
const GOAL_PT:V3=[0,1.95,-.7],NET_HIT:V3=[1.5,1.2,-.8],REST:V3=[1.1,BALL_R,-.8];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TH,G3),TG=TP+TH;
/** Blind strikes along the pass with his LEFT foot */
const DC=nrm2(V_PASS[0],V_PASS[2]),YAW_B=yawTo(DC[0],DC[1]);
const PCB:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),B_BLI,{x:0,z:0,yaw:YAW_B});return[P0[0]-DC[0]*.12-sk.lToe[0],P0[2]-DC[1]*.12-sk.lToe[2]];})();
const kb=(u:number):[number,number]=>[PCB[0]+DC[0]*u,PCB[1]+DC[1]*u];
/** Casillas: off his line, then a late back-pedal leap; the loop goes over his glove */
const T_TIP=TP+.2,TIP_L=.95;
const T0=-4,T1=TG+6;
type Actor={name:string;style:AthleteStyle;keys:number[][];hero?:boolean;build:Build};
const ACTORS:Actor[]=[
 {name:'Robin van Persie',hero:true,style:RVP_ST,build:B_RVP,keys:[[T0,-25,-6.8],[-1.5,-24.4,-6.4],[0,-23.8,-5.6],[.8,-21.8,-3.8],[1.3,-19.6,-1.9],[TJ,...HPL],[T1,...HPL]]},
 {name:'Daley Blind',hero:true,style:BLI_ST,build:B_BLI,keys:[[T0,-56,-30.5],[-2.2,-55,-31],[-1,...kb(-2.6)],[-.5,...kb(-1.6)],[0,...kb(0)],[.8,...kb(.9)],[3,-49,-29],[T1,-44,-24]]},
 {name:'Iker Casillas',hero:true,style:CAS_ST,build:B_CAS,keys:[[T0,-7.4,-1.8],[0,-7.2,-1.2],[TP-.6,-6.4,-.6],[TP,-6.0,-.4],[T1,-6,-.4]]},
 {name:'Spanish defender (beaten)',hero:true,style:esp({number:null,build:B_DEF,seed:31}),build:B_DEF,keys:[[T0,-27,-2.6],[0,-25.5,-2.2],[1,-21.5,-.6],[TP-.3,-17.6,1.4],[TP+.2,-16.8,2],[T1,-15.5,2.2]]},
 {name:'Spanish centre-back',style:esp({skin:SKIN_L,seed:32}),build:{},keys:[[T0,-26,6],[0,-25,5.5],[TP,-18,4.4],[T1,-15,3.6]]},
 {name:'Spanish right-back',style:esp({seed:33}),build:{},keys:[[T0,-30,-14],[0,-29,-13],[TP,-22,-9],[T1,-18,-7]]},
 {name:'Spanish midfielder',style:esp({skin:SKIN_L,seed:34}),build:{},keys:[[T0,-45,-22],[0,-44,-24],[TP,-40,-22],[T1,-34,-18]]},
 {name:'Dutch attacker',style:ned({skin:SKIN_L,hair:[Y,.5],seed:61}),build:{},keys:[[T0,-30,12],[0,-29,11],[TP,-19,8],[T1,-11,3]]},
 {name:'Dutch midfielder',style:ned({skin:SKIN_D,seed:62}),build:{},keys:[[T0,-44,-6],[0,-43,-5],[TP,-34,-3],[T1,-24,-2]]},
];
const RVP=0,BLI=1,GK=2,DEF=3;
const TR=makeTracks(ACTORS.map(a=>a.keys),T0,T1);

// ---------------------------------------------------------------- the ball
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TP)return flyA(P0,V_PASS,G3,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TP);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TP?tau*TAU*3:TP*TAU*3-(tau-TP)*TAU*2;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses
const LOOK_BACK=(p:Pose,w:number):Pose=>({...p,neckY:p.neckY+.9*w,twist:p.twist+.3*w,neckP:p.neckP-.25*w});
function stateOf(k:number,tau:number):State{
 const[x,z]=TR.pos(k,tau);let pose=loco(TR,k,tau),yaw=faceYaw(TR,k,tau,ballAt(tau));
 switch(k){
  case RVP:{
   // running in, head turned back over his LEFT shoulder to watch the ball all the way
   const v=TR.vel(RVP,tau),sp=Math.hypot(v[0],v[1]);if(sp>.5)yaw=yawTo(v[0],v[1]);
   if(tau>-.3&&tau<TJ)pose=LOOK_BACK(pose,win(tau,-.3,TJ,.3));
   if(tau>TJ-.2){const u=(tau-TJ)/HDUR;pose=blendPose(pose,DIVE_HEADER(u),sm(TJ-.2,TJ,tau));yaw=lerpAng(yaw,YAW_H,sm(TJ-.4,TJ,tau));}
   if(tau>TJ+HDUR+.5){const up=sm(TJ+HDUR+.5,TJ+HDUR+1.2,tau);pose=blendPose(pose,celebrate(tau*1.1,{kind:'arms'}),up);}
   break;}
  case BLI:{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'l'}),w);
   yaw=lerpAng(yaw,YAW_B,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));if(tau>1.6)yaw=faceYaw(TR,BLI,tau,ballAt(tau));break;}
  case GK:{pose=blendPose(keeperSet(tau*1.3),pose,.3);
   if(tau>T_TIP-.2)pose=blendPose(pose,keeperTip((tau-T_TIP)/TIP_L,{hand:'l'}),sm(T_TIP-.2,T_TIP,tau));
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.6);
   yaw=faceYaw(TR,GK,Math.min(tau,TP),ballAt(Math.min(tau,TP-.1)));break;}
  case DEF:{if(tau>TP+.3)pose=blendPose(pose,DEJECT,sm(TP+.6,TP+1.4,tau)*.7);break;}
  default:if(k<=6&&tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.7);
   if(k>=7&&tau>TG+.4)pose=blendPose(pose,celebrate(TR.dist(k,tau)/4,{kind:'arms'}),sm(TG+.5,TG+1.1,tau)*.7);
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k],hero=!!a.hero;return{st:stateOf(k,tau),prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===RVP&&tau>TJ&&tau<TP+.3)||(k===BLI&&tau>-.25&&tau<.35)||(k===GK&&tau>T_TIP&&tau<T_TIP+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2],by:1.4});
}

// ---------------------------------------------------------------- the stadium: an afternoon in Salvador, orange and red-and-yellow crowds
const SALVADOR:StadiumSpec={sky:'day',seats:[[B,.3],[K,.22]],rake:34,tiers:[[.46,.52]],roof:true,
 crowd:[[.26,.32,.06,.3,.06],[.2,.4,.04,.32,.04],[.26,.3,.08,.3,.06],[.24,.34,.06,.3,.06]]};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
function tau1(t:number){const tH=CUE(0,'flies')+.25;return Math.max(T0+.2,t-(tH-TP));}
const P1:V3=[-34,26,-80];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-40,6,8],fov:40})],
  [CUE(0,'Spain lead')-.2,1.2,()=>({P:P1,T:mix3(at3(TR,BLI,tau,1),at3(TR,RVP,tau,1),.2),fov:14})],
  [CUE(0,'Daley Blind')-.3,.9,()=>({P:P1,T:at3(TR,BLI,tau,1),fov:8})],
  [CUE(0,'long ball')-.1,1.2,()=>({P:P1,T:mix3(b,[HEAD_PT[0],1,HEAD_PT[2]],.35+.5*sm(0,TP,tau)),fov:lerp(13,9,sm(.5,TP,tau))})],
  [CUE(0,'flies')-.25,.7,()=>({P:P1,T:mix3([HEAD_PT[0]+4,1.3,HEAD_PT[2]],b,.4*sm(TP,TG,tau)),fov:lerp(9,13,sm(TP,TG,tau))})],
  [CUE(0,'One–one')+.3,1.3,()=>({P:P1,T:at3(TR,RVP,tau,.8),fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tO=CUE(0,'One–one');
  stadium(s,c,t,SALVADOR,[0,1,3],{roar:sm(TG,TG+.4,tau),flash:sm(tO-.3,tO+.2,t)*(1-sm(tO+2,tO+2.8,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:14,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'flies')+.25;},
};

// ---------------------------------------------------------------- 2 · slow replay from low in front of him, looking back up his run
const tau2=(t:number)=>key(t,mono([[0,-.3],[CUE(1,'watches the ball'),.5],[CUE(1,'over his shoulder'),1.1],[CUE(1,'times his run'),1.6],[CUE(1,'past the defender'),TJ-.05],[SECS(1),TP-.15]]),linear);
function cam2(t:number):Cam{
 // a low camera AHEAD of him on the line from the ball through him, looking back: his head turned over the shoulder with the ball dropping
 // out of the sky right behind him
 const tau=tau2(t),r=at3(TR,RVP,tau,1.3),b=ballAt(Math.max(tau,.15)),[ax,az]=nrm2(r[0]-b[0],r[2]-b[2]),eye=(d:number,y:number,side:number):V3=>[r[0]+ax*d-az*side,y,r[2]+az*d+ax*side];
 const up=(k:number):V3=>mix3(r,[b[0],Math.max(r[1],b[1]),b[2]],k);
 return plan(t,[
  [0,0,()=>({P:eye(7,1,1.2),T:up(.1),fov:44})],
  [CUE(1,'watches the ball')-.2,.9,()=>({P:eye(6,.8,1),T:up(.14),fov:50})],
  [CUE(1,'over his shoulder')-.2,.8,()=>({P:eye(4.5,1.2,.8),T:add3(r,[0,.3,0]),fov:28})],
  [CUE(1,'times his run')-.2,.9,()=>({P:eye(7,1.2,1.5),T:mix3(r,at3(TR,DEF,tau,1.2),.4),fov:34})],
  [CUE(1,'past the defender')-.2,.8,()=>({P:eye(6.5,1,1.2),T:up(.12),fov:46})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,SALVADOR,[0,1,3]);
  ground(s,c);
  trail(s,c,ballAt,Math.max(0,tau-1.1),Math.min(tau,TP),1);
  groundRing(s,c,at3(TR,RVP,tau,0),.8,Y,sm(CUE(1,'Watch')-.1,CUE(1,'Watch')+.4,t)*(1-sm(TJ-.2,TJ,tau)),.14);
  markRing(s,c,at3(TR,DEF,tau,0),win(t,CUE(1,'times his run')-.2,SECS(1),.3));
  // "over his shoulder": a dashed yellow eye-line from his head back up to the ball
  const la=win(t,CUE(1,'watches the ball')-.1,CUE(1,'times his run')+.6,.3);if(la>0){const st=stateOf(RVP,tau),sk=solve(st.pose,B_RVP,st.place),a=pr(c,sk.head),b=pr(c,ballAt(tau));
   if(a&&b){const gaps:[number,number][]=[];for(let i=0;i<10;i++)gaps.push([(i+.6)/10,(i+.97)/10]);const d=ribbon(partial([a,b],la),7,{seed:33,taper:0,wobble:.4,gaps});s.knockout(d,.9*la);s.fill(Y,d,.95*la);s.stroke(K,d,2,.7*la);}}
  play(s,c,tau,tp,{smear:true,min:10});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(18,c.F*BALL_R/q[2]*1.4),12);},
 get still(){return CUE(1,'over his shoulder')+.2;},
};

// ---------------------------------------------------------------- 3 · replay from the side, level with the dive
const tau3=(t:number)=>key(t,mono([[0,TJ-.5],[CUE(2,'dives'),TJ],[CUE(2,'flat as a plank'),TP-.12],[CUE(2,'forehead'),TP],[CUE(2,'loops it over'),TP+.3],[SECS(2)-.6,TG+.3],[SECS(2),TG+1.3]]),linear);
const E3:V3=[-15.8,1.5,-12.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E3,T:[HPL[0]+.4,1,HPL[1]],fov:22})],
  [CUE(2,'dives')-.2,.7,()=>({P:E3,T:[HEAD_PT[0]-.4,1.1,HEAD_PT[2]],fov:17})],
  [CUE(2,'forehead')-.3,.6,()=>({P:E3,T:[HEAD_PT[0],HEAD_PT[1],HEAD_PT[2]],fov:11})],
  [CUE(2,'loops it over')-.2,1.1,()=>({P:add3(E3,[3,.8,-1]),T:mix3(b,[-3,1.8,0],.45),fov:34})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12);
  stadium(s,c,t,SALVADOR,[0,1],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,ballAt,Math.max(0,tau-.9),Math.min(tau,TG),1-sm(TG+.2,TG+.6,tau));
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  const hit=(tau-TP)/.22;if(hit>0&&hit<1){const g=pr(c,HEAD_PT);if(g)sparkBurst(s,Y,g[0],g[1],Math.max(50,kAt(c,HEAD_PT)*.5),{n:10,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,kAt(c,HEAD_PT)*.05)});}
  void r;
 },
 aperture(t){const c=cam3v(t),g=pr(c,ballAt(tau3(twos(t))))??[0,0];return apertureDisc(g[0],g[1],60,12);},
 get still(){return CUE(2,'flat as a plank')+.15;},
};

// ---------------------------------------------------------------- 4 · the lesson from high behind: the eye-line, the dive, the forehead, the loop
const tau4=(t:number)=>key(t,mono([[0,.2],[CUE(3,'Be brave'),TJ-.2],[CUE(3,'dive at it'),TJ+.1],[CUE(3,'meet it'),TP],[CUE(3,'meet it')+.9,TP+.05],[SECS(3),TG]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-33,9,-10],T:[-18,1,-1],fov:34})],
  [CUE(3,'Be brave')-.3,.9,()=>({P:[-26,5,-5],T:[HPL[0]+1,1,HPL[1]],fov:26})],
  [CUE(3,'meet it')-.3,.9,()=>({P:[-24,4,-4],T:mix3(HEAD_PT,[-4,1.8,0],.4),fov:30})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tW=CUE(3,'Watch the long ball'),tB=CUE(3,'Be brave'),tD=CUE(3,'dive at it'),tM=CUE(3,'meet it');
  stadium(s,c,t,SALVADOR,[0,1,3],{roar:.3+.4*sm(TG,TG+.4,tau)});
  ground(s,c);
  // "Watch the long ball all the way": the pass so far and a dashed eye-line from his head to it
  trail(s,c,ballAt,0,Math.min(tau,TP),win(t,tW-.2,tM+.6,.3));
  const la=win(t,tW,tD+.3,.3);if(la>0){const st=stateOf(RVP,tau),sk=solve(st.pose,B_RVP,st.place),a=pr(c,sk.head),b=pr(c,ballAt(Math.min(tau,TP)));
   if(a&&b){const gaps:[number,number][]=[];for(let i=0;i<10;i++)gaps.push([(i+.6)/10,(i+.97)/10]);const d=ribbon(partial([a,b],la),7,{seed:33,taper:0,wobble:.4,gaps});s.knockout(d,.9*la);s.fill(Y,d,.95*la);s.stroke(K,d,2,.7*la);}}
  // "Be brave, dive at it": a red arrow along the dive, a yellow burst at take-off
  const da=sm(tB-.1,tB+.6,t)*(1-sm(tM+.6,tM+1.2,t));if(da>0){const a:V3=[HPL[0]-.6,.05,HPL[1]],b:V3=[HPL[0]+2.8,.05,HPL[1]-.2];arrow3(s,c,[a,mix3(a,b,.5*da),mix3(a,b,da)],Math.max(8,kAt(c,a)*.1),R,.95*da);
   const q=pr(c,a);if(q)sparkBurst(s,Y,q[0],q[1],70*da,{n:9,seed:41,g:easeOutBack(da),width:10});}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[RVP,GK,DEF]});
  // "meet it with your forehead": a ring on the forehead at contact, then the loop's arrow over the keeper
  const ma=sm(tM-.2,tM+.2,t);if(ma>0){const g=pr(c,HEAD_PT);if(g&&tau<TP+.2){const rr=Math.max(22,kAt(c,HEAD_PT)*.3),ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rp=ribbon(ring,Math.max(5,rr*.15),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp,.9*ma);s.fill(Y,rp,.95*ma);}
   const arr=sm(tM+.2,tM+1.3,t,easeInOutSine);if(arr>0){const q:V3[]=[];for(let i=0;i<=10;i++)q.push(flyA(HEAD_PT,V_HEAD,G3,TH*arr*i/10));arrow3(s,c,q,Math.max(8,kAt(c,HEAD_PT)*.06),Y,.95);}}
  void r;
 },
 get still(){return CUE(3,'meet it')+.8;},
};

const film:RisoStory={
 id:'van-persie-header-2014',format:'11v11',title:"Van Persie's flying header",
 theme:'Watch the long ball all the way, be brave, and dive to meet it with your forehead',
 ageNote:'Spain 1–5 Netherlands, World Cup group stage, Salvador, 13 June 2014. For players of every age.',
 spec:SPEC,
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little loop — a ball bounces off the tap in a high arc, with a yellow spark where it is headed. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.7),bx=x+220*u,by=y-320*u*(1-u);
  if(age<.25)sparkBurst(s,Y,x,y,100,{n:9,seed:seed+1,g:easeOutBack(clamp(age/.12))*(1-clamp((age-.12)/.13)),width:12});
  if(u<1)footballPanels(s,bx,by,28,{rot:age*12+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved facts (pitch metres; Spain's goal line x = 0, +z = the Dutch right) — checked by tests/play-film-van-persie-header-2014.cjs. */
export const FACTS={P0,HEAD_PT,TP,TG,GOAL_PT,ballAt,passFoot:'l' as const,
 blindContact:()=>{const st=stateOf(BLI,0),sk=solve(st.pose,B_BLI,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 rvpAt:(tau:number)=>{const st=stateOf(RVP,tau),sk=solve(st.pose,B_RVP,st.place);return{head:sk.head,face:sk.face,pelvis:sk.pelvis,chest:sk.chest,air:st.pose.air};},
 casillasAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_CAS,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};},
 defAt:(tau:number)=>{const st=stateOf(DEF,tau),sk=solve(st.pose,B_DEF,st.place);return{head:sk.head,pelvis:sk.pelvis};},d3};
