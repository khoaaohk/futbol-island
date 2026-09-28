/** Filippo Inzaghi's second goal — AC Milan 2–1 Liverpool, UEFA Champions League final, Wednesday 23 May 2007, Olympic Stadium, Athens.
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * A reconstruction of the goal from WRITTEN accounts (the broadcast footage itself was not reviewed), rendered as a riso print.
 * Plumbing: ./broadcast-kit. The card's moment is "Two Goals in the Champions League Final"; the film recreates the second (the run on
 * the last defender's shoulder, the card's lesson) and only mentions the first (a Pirlo free-kick deflected in off him).
 *
 * SOURCES (read Sept 2026 with curl, cached in the build scratchpad cardfilms-src/):
 *  - Wikipedia, "2007 UEFA Champions League final" (raw wikitext): 23 May 2007, Athens Olympic Stadium, 63,000; Inzaghi 45' and 82', Kuyt
 *    89'; first goal: "Andrea Pirlo's free-kick deflected off the shoulder of Milan striker Filippo Inzaghi, and into the Liverpool goal";
 *    second: "Kaká had the space to pick out a pass to Inzaghi, who took the ball to the side of the Liverpool goalkeeper Reina and rolled it
 *    into the net"; Milan chose their all-white strip, Liverpool all red; Inzaghi No. 9, man of the match; Kaká No. 22; Reina No. 25.
 *    https://en.wikipedia.org/wiki/2007_UEFA_Champions_League_final
 *  - BBC Sport, "AC Milan 2–1 Liverpool – as it happened" (Charlie Henderson): "2126: GOAL AC Milan 2-0 Liverpool ... Kaka picks up a
 *    Massimo Ambrosini pass, advances on the Liverpool defence and releases Pippo Inzaghi with a threaded throughball. 'Superpippo' rounds
 *    Pepe Reina and rolls the ball under the diving Spaniard. Reina clasps his head in his gloved hands as the ball trickles into the net."
 *    https://news.bbc.co.uk/sport1/hi/football/europe/6685231.stm
 * CONFIRMED: date, venue, evening; 1–0 → 2–0 (82'); Kaká advancing on the defence and threading the pass through; Inzaghi running onto it,
 *  rounding Reina (who dived) and rolling it into the net; the first goal's deflection; all-white Milan v all-red Liverpool; numbers.
 * INFERRED (never named in the narration): every position, time and speed; which side he went round Reina (drawn: Reina's right, −z) and his
 *  feet (right foot for the touches and the finish; Kaká's pass also right-footed); Reina's keeper kit (printed yellow) and dive; the Liverpool
 *  defenders (unnamed, no numbers) and exactly how level Inzaghi was when the pass was played (drawn just onside); cameras; the stadium's
 *  colours (the two great roof arches are Athens's).
 *
 * FRAMING: ch1 = the high main-stand camera in REAL TIME (Kaká advancing → the pass through → Inzaghi away → round Reina → the empty net);
 * ch2 = a slow replay from HIGH ALONG THE DEFENSIVE LINE: the offside line drawn across the pitch, Inzaghi waiting level on the last
 * defender's shoulder, gone the instant the pass leaves Kaká's boot; ch3 = a low replay from BEHIND THE GOAL: Reina comes and dives, Inzaghi
 * takes it round him and rolls it into the empty net toward us; ch4 = the lesson from high behind: the line, a ring on his shoulder spot,
 * the "go" burst on the pass, his run's arrow. World: right-handed metres (./broadcast-kit): Liverpool's goal line x = 0, +z = Milan's right. */
import timingJson from '../../../public/plays/narration/inzaghi-final-2007/timing.json';
import type {NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,ribbon,partial,easeOut,easeIO,easeOutBack,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,keeperSet,keeperDive,celebrate,blendPose,STRIKE_CONTACT,
 type AthleteStyle,type Build,type V3} from './athlete';
import {Y,R,B,K,SPEC,chaptersFrom,mono,add3,mix3,d3,lerpAng,yawTo,nrm2,BALL_R,frame,toCam,scr,pr,kAt,plan,
 stadium,ground,makeTracks,loco,faceYaw,win,DEJECT,at3,drawScene,arrow3,groundRing,trail,markRing,type Cam,type State,type Fig,type StadiumSpec} from './broadcast-kit';

// ---------------------------------------------------------------- narration (text = public/plays/narration/<id>/script.json)
const SCRIPT=[
 {label:'Athens, 2007',text:'Athens, 2007, the Champions League final. Inzaghi has already scored once. Now Kaká slides a pass through... Inzaghi is gone! Round the keeper... two–nil Milan!',tail:2.2,
  cues:['Athens','already scored','Kaká slides','Inzaghi is gone','Round the keeper','two–nil']},
 {label:'Watch it again',text:'Watch again. Inzaghi waits on the shoulder of the last defender, and he runs the moment Kaká passes.',tail:1.5,
  cues:['Watch again','waits on the shoulder','last defender','runs the moment']},
 {label:'Round the keeper',text:'From behind the goal. He takes the ball round the keeper, and rolls it into the empty net!',tail:2.2,
  cues:['From behind','takes the ball','round the keeper','rolls it']},
 {label:'On the shoulder',text:'Stay on the shoulder of the last defender, and go the moment the pass is played!',tail:2,
  cues:['Stay on the shoulder','go the moment','pass is played']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const {CHAPTERS,CUE,SECS}=chaptersFrom('inzaghi',SCRIPT,VOICE);

// ---------------------------------------------------------------- cast
type Screens=[string,number][];
const SKIN_L:Screens=[[Y,.35],[R,.18]],SKIN_M:Screens=[[Y,.42],[R,.26],[K,.06]],SKIN_D:Screens=[[Y,.8],[R,.62],[K,.28]];
/** Milan: all white (their "lucky" European kit), navy numbers and trim */
const acm=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.9],numberInk:[K,.9],hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Liverpool: all red, white numbers */
const lfc=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:[R,.95],socks:[R,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',number:null,hairStyle:'short',build:{height:1.84,bulk:1.03},...o});
const B_INZ:Build={height:1.81,bulk:.9},B_KAK:Build={height:1.86,bulk:.96},B_REI:Build={height:1.88,bulk:1.02};
const INZ_ST=acm({number:9,build:B_INZ,seed:9});
const KAK_ST=acm({number:22,build:B_KAK,seed:22});
const REI_ST:AthleteStyle={shirt:[Y,.85],shorts:[Y,.85],socks:[Y,.85],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:25,numberInk:K,build:B_REI,seed:25};

// ---------------------------------------------------------------- the play on one clock τ (τ = 0: Kaká's pass leaves his boot)
/** the defensive line when the pass is played (the last outfield defender's x) and Inzaghi just onside of it */
const LINE_X=-24.2;
const P0:V3=[-27.4,BALL_R,2.7],DECEL=2.4;
/** the pass: a rolling through ball decelerating from P0 to R0, where Inzaghi meets it TR s later */
const R0:V3=[-13.2,BALL_R,-1.7],TR_=1.45;
const PASS_D=Math.hypot(R0[0]-P0[0],R0[2]-P0[2]),PASS_V0=(PASS_D+.5*DECEL*TR_*TR_)/TR_,PASS_DIR=nrm2(R0[0]-P0[0],R0[2]-P0[2]);
/** after the pass: his first touch forward, the touch round Reina (to Reina's right, −z), the roll into the empty net */
const T1PT:V3=[-8.9,BALL_R,-1.9],T_T1=2.2;
const RND:V3=[-5.3,BALL_R,-4.2],T_RND=2.35,T_RND1=2.95;
const T_FIN=3.25,FIN_PT:V3=[0,BALL_R,-1.1],T_GL=4.35,NET:V3=[1.1,BALL_R,-1.15];
/** Kaká passes along the ball's path with his right foot (inferred) */
const YAW_K=yawTo(PASS_DIR[0],PASS_DIR[1]);
const PCK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.5}),B_KAK,{x:0,z:0,yaw:YAW_K});return[P0[0]-PASS_DIR[0]*.12-sk.rToe[0],P0[2]-PASS_DIR[1]*.12-sk.rToe[2]];})();
const kk=(u:number):[number,number]=>[PCK[0]+PASS_DIR[0]*u,PCK[1]+PASS_DIR[1]*u];
/** the finish: a side-foot roll with his right foot (inferred) */
const FIN_DIR=nrm2(FIN_PT[0]-RND[0]-.3,FIN_PT[2]-RND[2]-.1),YAW_F=yawTo(FIN_DIR[0],FIN_DIR[1]);
const FIN_BALL:V3=[RND[0]+.3,BALL_R,RND[2]+.1];
const PCF:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.35}),B_INZ,{x:0,z:0,yaw:YAW_F});return[FIN_BALL[0]-FIN_DIR[0]*.1-sk.rToe[0],FIN_BALL[2]-FIN_DIR[1]*.1-sk.rToe[2]];})();
/** Reina: rushes out, then dives at the ball to HIS RIGHT (−z; he faces −x) — the ball is already past him */
const T_DIVE=2.3,DIVE_L=1,DIVE=(u:number)=>keeperDive(clamp(u),{side:'r',height:.05});
const T0=-4.5,T1=T_GL+6;
type Actor={name:string;style:AthleteStyle;keys:number[][];hero?:boolean;build:Build};
const ACTORS:Actor[]=[
 {name:'Filippo Inzaghi',hero:true,style:INZ_ST,build:B_INZ,keys:[[T0,-27.5,-2.2],[-2.5,-25.8,-2.9],[-1,-24.9,-3.1],[0,-24.55,-3.1],[.5,-21.8,-2.8],[TR_,R0[0]-.9,R0[2]-.2],[T_T1,T1PT[0]-.8,T1PT[2]],[T_RND1-.1,RND[0]-1.1,RND[2]+.6],[T_FIN-.02,PCF[0],PCF[1]],[T_FIN+.7,PCF[0]+1.6,PCF[1]-.8],[T_GL+1.4,-2,-10],[T1,-4,-20]]},
 {name:'Kaká',hero:true,style:KAK_ST,build:B_KAK,keys:[[T0,-40,5],[-2.5,-35,4],[-1,...kk(-3.2)],[-.5,...kk(-1.6)],[0,...kk(0)],[.8,...kk(.9)],[3,-22,.6],[T1,-12,-4]]},
 {name:'Pepe Reina',hero:true,style:REI_ST,build:B_REI,keys:[[T0,-4,-.6],[0,-3.4,-.8],[1.2,-4.8,-.9],[T_DIVE-.05,-7.7,-.9],[T1,-7.7,-.9]]},
 {name:'Liverpool defender (the last line)',hero:true,style:lfc({seed:41}),build:{height:1.88},keys:[[T0,-26,-1.2],[-1,-24.6,-1.4],[0,LINE_X,-1.5],[1,-20.8,-1.9],[T_T1,-16,-2.4],[T1,-8,-4]]},
 {name:'Liverpool centre-back',style:lfc({skin:SKIN_L,seed:42}),build:{},keys:[[T0,-26.5,5],[0,LINE_X-.3,4.4],[1.4,-20,2.4],[T1,-10,0]]},
 {name:'Liverpool full-back',style:lfc({seed:43}),build:{},keys:[[T0,-27,-11],[0,LINE_X-.5,-10],[1.4,-21,-8],[T1,-12,-6]]},
 {name:'Liverpool midfielder',style:lfc({skin:SKIN_D,seed:44}),build:{},keys:[[T0,-34,1],[0,-30.5,1.5],[1.5,-27,1],[T1,-18,-1]]},
 {name:'Liverpool right-back',style:lfc({seed:45}),build:{},keys:[[T0,-27,12],[0,LINE_X-.8,11],[1.5,-22,8],[T1,-14,4]]},
 {name:'Milan midfielder',style:acm({skin:SKIN_D,seed:61}),build:{},keys:[[T0,-42,-6],[0,-36,-6],[2,-30,-5],[T1,-18,-6]]},
];
const INZ=0,KAK=1,GK=2,DEF=3;
const TR=makeTracks(ACTORS.map(a=>a.keys),T0,T1);

// ---------------------------------------------------------------- the ball
const roll=(A:V3,Bp:V3,t0:number,t1:number,tau:number):V3=>{const u=easeOut(clamp((tau-t0)/(t1-t0)));return mix3(A,Bp,u);};
function ballAt(tau:number):V3{
 if(tau<-.4){const[x,z]=TR.pos(KAK,tau),v=TR.vel(KAK,tau),[fx,fz]=nrm2(v[0]||1,v[1]),ph=((TR.dist(KAK,tau)/2.1)%1+1)%1;const off=.35+.8*Math.sin(Math.PI*ph);return[x+fx*off+fz*.12,BALL_R,z+fz*off-fx*.12];}
 if(tau<=0){const a=ballAt(-.41);return mix3(a,P0,easeOut(clamp((tau+.4)/.4)));}
 if(tau<TR_){const d=PASS_V0*tau-.5*DECEL*tau*tau;return[P0[0]+PASS_DIR[0]*d,BALL_R,P0[2]+PASS_DIR[1]*d];}
 if(tau<T_RND)return roll(R0,T1PT,TR_,T_RND,tau);
 if(tau<T_FIN)return roll(T1PT,FIN_BALL,T_RND,T_FIN,tau);
 if(tau<T_GL)return roll(FIN_BALL,FIN_PT,T_FIN,T_GL,tau);
 return roll(FIN_PT,NET,T_GL,T_GL+.8,tau);
}
const spinAt=(tau:number)=>tau*TAU*2.2;
const bulgeAt=(tau:number)=>tau<T_GL+.3?0:.35*Math.exp(-(tau-T_GL-.3)*2.4);

// ---------------------------------------------------------------- poses
function stateOf(k:number,tau:number):State{
 const[x,z]=TR.pos(k,tau);let pose=loco(TR,k,tau),yaw=faceYaw(TR,k,tau,ballAt(tau));
 switch(k){
  case INZ:{
   // waiting on the shoulder: side-on, watching Kaká; then gone
   if(tau<.1)yaw=lerpAng(faceYaw(TR,INZ,tau,ballAt(tau)),yawTo(1,.35),.35);
   const wf=win(tau,T_FIN-.55,T_FIN+.8,.2);if(wf>0){pose=blendPose(pose,strike(clamp((tau-T_FIN)/1.0+STRIKE_CONTACT),{foot:'r',power:.35}),wf);yaw=lerpAng(yaw,YAW_F,sm(T_FIN-.6,T_FIN-.3,tau)*(1-sm(T_FIN+.8,T_FIN+1.3,tau)));}
   if(tau>T_GL-.2){pose=blendPose(pose,celebrate(TR.dist(INZ,tau)/4.2,{kind:'run'}),sm(T_GL-.2,T_GL+.5,tau));}
   break;}
  case KAK:{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r',power:.5}),w);
   yaw=lerpAng(yaw,YAW_K,sm(-1,-.45,tau)*(1-sm(.9,1.6,tau)));if(tau>T_GL+.3)pose=blendPose(pose,celebrate(tau,{kind:'arms'}),sm(T_GL+.4,T_GL+1,tau)*.8);break;}
  case GK:{if(tau<1.1)pose=blendPose(keeperSet(tau*1.3),pose,.4);
   if(tau>T_DIVE-.15)pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));
   if(tau>T_GL+.4)pose=blendPose(pose,DEJECT,sm(T_GL+.6,T_GL+1.4,tau)*.5);
   {const b=ballAt(Math.min(tau,T_DIVE));yaw=yawTo(b[0]-x,b[2]-z);}break;}
  default:if(k>=3&&k<=7){if(tau<0)yaw=faceYaw(TR,k,tau,ballAt(tau));if(tau>T_GL+.3)pose=blendPose(pose,DEJECT,sm(T_GL+.6,T_GL+1.6,tau)*.8);}
   if(k===8&&tau>T_GL+.3)pose=blendPose(pose,celebrate(tau,{kind:'arms'}),sm(T_GL+.4,T_GL+1,tau)*.8);
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k],hero=!!a.hero;return{st:stateOf(k,tau),prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===INZ&&tau>0&&tau<.6)||(k===GK&&tau>T_DIVE&&tau<T_DIVE+.6))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:NET[2],by:.3});
}
/** the offside line: a dashed paper line across the pitch at the last defender's x */
function offsideLine(s:Sheet,c:Cam,x:number,a:number){if(a<=0)return;const pts:Pt[]=[];for(let i=0;i<=24;i++){const p=pr(c,[x,.02,-34+68*i/24]);if(p)pts.push(p);}
 if(pts.length<2)return;const gaps:[number,number][]=[];for(let i=0;i<24;i++)gaps.push([(i+.6)/24,(i+.95)/24]);const d=ribbon(pts,Math.max(5,kAt(c,[x,0,0])*.12),{seed:51,taper:0,wobble:.3,gaps});s.knockout(d,.9*a);s.fill(Y,d,.9*a);}

// ---------------------------------------------------------------- the stadium: Athens at night, the two great roof arches, red crowds
const ATHENS:StadiumSpec={sky:'night',seats:[[B,.25],[K,.3]],rake:34,tiers:[[.45,.5]],roof:true,lamps:true,arches:true,
 crowd:[[.14,.04,.3,.47,.05],[.1,.04,.18,.63,.05],[.16,.04,.34,.41,.05],[.12,.04,.38,.41,.05]]};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
function tau1(t:number){const tP=CUE(0,'Kaká slides')+.55;return Math.max(T0+.2,t-tP);}
const P1:V3=[-26,28,-78];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-30,6,8],fov:40})],
  [CUE(0,'already scored')-.2,1.3,()=>({P:P1,T:add3(at3(TR,KAK,tau,1),[4,0,-2]),fov:13})],
  [CUE(0,'Kaká slides')-.3,.8,()=>({P:P1,T:mix3(at3(TR,KAK,tau,1),at3(TR,INZ,tau,1),.5),fov:10})],
  [CUE(0,'Inzaghi is gone')-.4,.8,()=>({P:P1,T:add3([b[0],1,b[2]],[2.5,0,0]),fov:10})],
  [CUE(0,'Round the keeper')-.3,.7,()=>({P:P1,T:mix3([b[0],1,b[2]],[-4,1,-2],.4),fov:9})],
  [CUE(0,'two–nil')+.4,1.2,()=>({P:P1,T:at3(TR,INZ,tau,1),fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tN=CUE(0,'two–nil');
  stadium(s,c,t,ATHENS,[0,1,3],{roar:sm(T_GL,T_GL+.4,tau),flash:sm(tN-.3,tN+.2,t)*(1-sm(tN+2,tN+2.8,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:14,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Inzaghi is gone')+.2;},
};

// ---------------------------------------------------------------- 2 · slow replay from high along the defensive line
const tau2=(t:number)=>key(t,mono([[0,-2.2],[CUE(1,'waits on the shoulder'),-1.4],[CUE(1,'last defender'),-.7],[CUE(1,'runs the moment'),-.05],[CUE(1,'runs the moment')+.9,.35],[SECS(1),1.2]]),linear);
const E2:V3=[LINE_X+1,12,-40];
function cam2(t:number):Cam{
 const tau=tau2(t),i=at3(TR,INZ,tau,1);
 return plan(t,[
  [0,0,()=>({P:E2,T:[LINE_X-2,1,0],fov:22})],
  [CUE(1,'waits on the shoulder')-.2,.9,()=>({P:E2,T:mix3(i,at3(TR,DEF,tau,1),.5),fov:10})],
  [CUE(1,'runs the moment')-.3,.8,()=>({P:E2,T:mix3(i,at3(TR,KAK,tau,1),.45),fov:14})],
  [CUE(1,'runs the moment')+.8,1,()=>({P:E2,T:add3(i,[2.5,0,0]),fov:13})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,ATHENS,[0,1,3]);
  ground(s,c);
  const lx=tau<0?TR.pos(DEF,tau)[0]:LINE_X;offsideLine(s,c,lx,sm(CUE(1,'last defender')-.3,CUE(1,'last defender')+.2,t));
  groundRing(s,c,at3(TR,INZ,tau,0),.8,Y,sm(CUE(1,'waits')-.2,CUE(1,'waits')+.3,t)*(1-sm(.3,.6,tau)),.14);
  markRing(s,c,at3(TR,DEF,tau,0),win(t,CUE(1,'last defender')-.2,CUE(1,'runs the moment')+.4,.3));
  const r=play(s,c,tau,tp,{smear:true,min:10});
  // "the moment Kaká passes": a yellow "go" burst at Inzaghi's feet as the ball leaves Kaká
  const go=tau/.35;if(go>0&&go<1){const p=pr(c,at3(TR,INZ,tau,.05));if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,at3(TR,INZ,tau,0))*.9),{n:10,seed:17,g:easeOutBack(clamp(go*2))*(1-clamp((go-.5)*2)),width:8});}
  void r;
 },
 aperture(t){const c=cam2(t),q=pr(c,at3(TR,INZ,tau2(twos(t)),1.1))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 get still(){return CUE(1,'last defender')+.2;},
};

// ---------------------------------------------------------------- 3 · low replay from behind the goal: round the keeper, into the empty net
const tau3=(t:number)=>key(t,mono([[0,1.3],[CUE(2,'takes the ball'),T_T1-.1],[CUE(2,'round the keeper'),T_RND+.2],[CUE(2,'rolls it'),T_FIN],[SECS(2)-.5,T_GL+.4],[SECS(2),T_GL+1.2]]),linear);
const E3:V3=[4.8,2.1,-2.6];
function cam3v(t:number):Cam{
 const tau=tau3(t),i=at3(TR,INZ,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(i,[-8,1,-2],.4),fov:24})],
  [CUE(2,'round the keeper')-.3,.7,()=>({P:E3,T:mix3(i,at3(TR,GK,tau,.6),.5),fov:26})],
  [CUE(2,'rolls it')-.2,.8,()=>({P:E3,T:mix3(ballAt(tau),[-1,.5,-1],.4),fov:34})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12);
  stadium(s,c,t,ATHENS,[0,2,3],{roar:sm(T_GL,T_GL+.4,tau),flash:sm(T_GL,T_GL+.3,tau)});
  ground(s,c);
  trail(s,c,ballAt,Math.max(TR_,tau-1.1),Math.min(tau,T_GL),1-sm(T_GL+.2,T_GL+.6,tau));
  play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(TR,INZ,tau3(twos(t)),1.1))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 get still(){return CUE(2,'round the keeper')+.3;},
};

// ---------------------------------------------------------------- 4 · the lesson from high behind: the line, the shoulder, go on the pass
const tau4=(t:number)=>key(t,mono([[0,-1.6],[CUE(3,'go the moment'),-.1],[CUE(3,'pass is played'),.05],[CUE(3,'pass is played')+.6,.12],[SECS(3),1.4]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-42,10,-8],T:[-25,1,-1.5],fov:30})],
  [CUE(3,'go the moment')-.2,.9,()=>({P:[-40,8,-7],T:[-22,1,-1.5],fov:30})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tS=CUE(3,'Stay on the shoulder'),tG=CUE(3,'go the moment'),tP=CUE(3,'pass is played');
  stadium(s,c,t,ATHENS,[0,1,3],{roar:.35});
  ground(s,c);
  offsideLine(s,c,tau<0?TR.pos(DEF,tau)[0]:LINE_X,sm(tS-.2,tS+.4,t));
  // "on the shoulder": a ring where he waits, level with the line, beside the defender
  groundRing(s,c,at3(TR,INZ,Math.min(tau,0),0),.75,Y,win(t,tS-.1,tG+.6,.25),.14);
  play(s,c,tau,tp,{smear:true,min:12,only:[INZ,KAK,DEF,4,5,6]});
  // "go the moment the pass is played": the pass's arrow and his run's arrow start together
  const ga=sm(tP-.1,tP+.8,t);if(ga>0){const a=at3(TR,INZ,0,.05),b:V3=[R0[0]-.9,.05,R0[2]-.2];arrow3(s,c,[a,mix3(a,b,.5*ga),mix3(a,b,ga)],Math.max(8,kAt(c,a)*.1),R,.95);
   const pa:V3=[P0[0],.05,P0[2]],pb:V3=[R0[0],.05,R0[2]];arrow3(s,c,[pa,mix3(pa,pb,.5*ga),mix3(pa,pb,ga)],Math.max(7,kAt(c,pa)*.08),Y,.95);
   const q=pr(c,a);if(q)sparkBurst(s,Y,q[0],q[1],80*clamp(ga*1.5),{n:10,seed:41,g:easeOutBack(clamp(ga*1.5)),width:9});}
 },
 get still(){return CUE(3,'pass is played')+.5;},
};

const film:RisoStory={
 id:'inzaghi-final-2007',format:'11v11',title:"Inzaghi's final run",
 theme:'Stay on the shoulder of the last defender and go the moment the pass is played',
 ageNote:'AC Milan 2–1 Liverpool, Champions League final, Athens, 23 May 2007. For players of every age.',
 spec:SPEC,
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a through ball — a ball rolls away from the tap along a dashed line, with a yellow "go" spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=easeIO(clamp(age/.75)),bx=x+280*u,by=y+30*u;
  if(age<.25)sparkBurst(s,Y,x,y,100,{n:9,seed:seed+1,g:easeOutBack(clamp(age/.12))*(1-clamp((age-.12)/.13)),width:12});
  const gaps:[number,number][]=[];for(let i=0;i<6;i++)gaps.push([(i+.6)/6,(i+.95)/6]);const d=ribbon(partial([[x,y],[x+280,y+30]],u),8,{seed,taper:0,wobble:.3,gaps});s.knockout(d,.9);s.fill(Y,d,.9);
  if(age<.8)footballPanels(s,bx,by,26,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved facts (pitch metres; Liverpool's goal line x = 0, +z = Milan's right) — checked by tests/play-film-inzaghi-final-2007.cjs. */
export const FACTS={P0,R0,TR:TR_,T_FIN,T_GL,FIN_PT,LINE_X,ballAt,finishFoot:'r' as const,
 inzaghiAt:(tau:number)=>{const st=stateOf(INZ,tau),sk=solve(st.pose,B_INZ,st.place);return{pelvis:sk.pelvis,lToe:sk.lToe,rToe:sk.rToe};},
 kakaContact:()=>{const st=stateOf(KAK,0),sk=solve(st.pose,B_KAK,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 reinaAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_REI,st.place);return{lHa:sk.lHa,rHa:sk.rHa,lToe:sk.lToe,rToe:sk.rToe,pelvis:sk.pelvis};},
 defendersAt:(tau:number)=>[3,4,5,7].map(k=>at3(TR,k,tau,0)),d3};
