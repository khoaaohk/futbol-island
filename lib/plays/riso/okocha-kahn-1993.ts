/** Jay-Jay Okocha's dance past Oliver Kahn — Eintracht Frankfurt 3–1 Karlsruher SC, Bundesliga, Tuesday 31 August 1993, Waldstadion,
 * Frankfurt. Germany's Goal of the Year 1993. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx). A reconstruction from WRITTEN accounts (the footage itself was not reviewed). Shared kit: ./broadcast3d.ts.
 *
 * SOURCES (read Sept 2026 with curl, cached in the build scratchpad kd-films/src/):
 *  - Sportschau "Tor des Monats" archive, "August 1993 – Okocha" (via web.archive.org): Okocha (Eintracht Frankfurt), 31.08.1993, Eintracht
 *    Frankfurt – Karlsruher SC, "in der 87. Min. zum 3:1-Endstand"; winner of "Tor des Jahres 1993"; "Wahnsinnstanz ... gegen vier Karlsruher",
 *    among them Oliver Kahn.
 *  - Eintracht Frankfurt, "„Ich habe das Loch gesucht“": "Elf Sekunden, fünf Haken, Oliver Kahns Kopf im Rasen des Waldstadions"; "Der Pass auf
 *    Okocha vor dem legendären Solo kam von Uwe Bein"; Okocha: "Ich habe das Loch gesucht"; Toppmöller shouted "Schieß endlich" eight or nine times.
 *  - watson.ch, "Jay-Jay Okocha demütigt Oliver Kahn und drei Verteidiger ...": 87th minute; "Bein zum 3:1 einschieben können, doch der Deutsche
 *    legt den Ball zurück auf Okocha"; "spielt mit dem jungen Oliver Kahn Katz und Maus, dribbelt vor das Tor" and finishes for 3–1.
 *  - Wikipedia (de), "Jay-Jay Okocha": "Er umspielte im Strafraum die gegnerischen Abwehrspieler und ließ den Torhüter Oliver Kahn durch
 *    Körpertäuschungen und plötzliche Richtungswechsel mehrere Male hin und her rennen, ehe er schließlich den Ball ins Tor schoss";
 *    (en): "dribbling in the penalty box, even going past some players twice, and slotting the ball past goalkeeper Oliver Kahn".
 * CONFIRMED: date, Waldstadion, the 87th minute, 2–1 → 3–1; Uwe Bein could have scored but LAID THE BALL BACK to Okocha; the solo IN THE
 *  PENALTY BOX lasted ELEVEN SECONDS with FIVE changes of direction (Haken) and body feints, beating defenders (some twice) and sending Kahn
 *  back and forth until Kahn's head was in the grass; then Okocha "found the gap" and shot it in. Goal of the Year 1993.
 * INFERRED (illustrative, never claimed in the narration): the exact path of every cut, which way each feint went, how many defenders were
 *  on screen and their names (sources differ; drawn unnamed, without numbers), which foot he used for each touch and for the shot (drawn:
 *  RIGHT), where the shot went in (drawn: low, right of centre as he faced goal); kits (drawn: Eintracht red-and-black stripes, black shorts;
 *  Karlsruhe blue shirts, white shorts; Kahn in yellow); the evening light; the crowd; which end; camera placements; no shirt numbers drawn.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, REAL TIME: the Waldstadion, the move into the box, Bein's
 * lay-back to Okocha; ch2 = the broadcast camera stays with the dance (the same real clock, a closer lens): the cuts, defenders beaten, Kahn
 * on the grass; ch3 = the slow-motion REPLAY from LOW BEHIND OKOCHA: the fifth cut, the gap opening, the shot, the net; ch4 = the lesson
 * from the edge of the box: his zig-zag path lit cut by cut, the defenders' and Kahn's lunges ringed, the gap. Composed on the FULL sheet.
 * Right-handed world: Eintracht attack +x, +z = their right. Poses on twos, cameras on ones; all randomness seeded. */
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,dribble,keeperSet,keeperDive,slideTackle,lunge,celebrate,blendPose,posed,STRIKE_CONTACT,type AthleteStyle,type V3,type Build} from './athlete';
import {type NarrationTiming} from './timing';
import timingJson from '../../../public/plays/narration/okocha-kahn-1993/timing.json';
import {Y,R,B,K,SPEC,mix3,d3,yawTo,nrm2,lerpAng,buildChapters,mono,frame,toCam,scr,pr,kAt,stadium,ground,makeTracks,loco,faceYaw,win,DEJECT,
 drawScene,plan,arrow3,groundRing,BALL_R,SKIN_L,SKIN_M,SKIN_D,type Fig,type State,type Cam,type Stadium} from './broadcast3d';

// ---------------------------------------------------------------- narration + timing
const SCRIPT=[
 {label:'Frankfurt, 1993',text:'Frankfurt, 1993. Eintracht against Karlsruhe, three minutes to go. Uwe Bein could shoot, but he lays the ball back to Jay-Jay Okocha, right in the box.',tail:1.6,
  cues:['Frankfurt','Eintracht against Karlsruhe','three minutes','Uwe Bein','lays the ball back','Okocha','in the box']},
 {label:'The dance',text:'Now watch him dance. He cuts one way, then the other. He beats the defenders, and Oliver Kahn ends up on the grass!',tail:1.4,
  cues:['Now watch','cuts one way','the other','beats the defenders','Oliver Kahn','on the grass']},
 {label:'The gap',text:'Five changes of direction in eleven seconds. Then he finds the gap, and scores! Three–one.',tail:2,
  cues:['Five changes','eleven seconds','finds the gap','scores']},
 {label:'Stay calm',text:'Stay calm in the box. Quick changes of direction can beat defenders, and even the keeper.',tail:2,
  cues:['Stay calm','Quick changes','beat defenders','even the keeper']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const {CHAPTERS,CUE,SECS}=buildChapters('okocha',SCRIPT,VOICE);

// ---------------------------------------------------------------- the cast (kits inferred, see header)
const sge=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],pattern:'stripes',patternInk:[K,.95],shorts:[K,.92],socks:[K,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
const ksc=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:'paper',socks:[B,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',hairStyle:'short',build:{height:1.86,bulk:1.04},...o});
const B_OKO:Build={height:1.73,bulk:.95},B_KAHN:Build={height:1.88,bulk:1.08};
const OKO_ST=sge({skin:SKIN_D,hair:[K,.95],build:B_OKO,seed:10});
const BEIN_ST=sge({hair:[Y,.45],build:{height:1.82},seed:8});
const KAHN_ST:AthleteStyle={shirt:[Y,.95],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:B_KAHN,seed:1};

// ---------------------------------------------------------------- the solo on one clock τ (τ = 0 is the shot)
const T_LAY=-11.3,T_RECV=-10.7,TS=.45;
/** the five cuts (Haken): times and the ground points where he changes direction (illustrative zig-zag in the box) */
const HAKEN:[number,number,number][]=[[-8.8,-10.4,-.6],[-7.1,-9.6,2.4],[-5.4,-8.5,-1.2],[-3.7,-7.6,2.0],[-2.0,-6.6,-.9]];
const RECV:[number,number]=[-12.2,1.8],SHOT_AT:[number,number]=[-6.1,1.3];
/** the shot: low into the gap on the right-hand side while Kahn lies on the grass on the left */
const GOAL_PT:V3=[0,.35,2.1],NET_HIT:V3=[1.8,.3,2.2],REST:V3=[1.3,BALL_R,2.1];
const YAW_S=yawTo(GOAL_PT[0]-SHOT_AT[0],GOAL_PT[2]-SHOT_AT[1]);
const SHOT_BALL:V3=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.55}),B_OKO,{x:SHOT_AT[0],z:SHOT_AT[1],yaw:YAW_S});return[sk.rToe[0]+.04,BALL_R,sk.rToe[2]];})();
/** Kahn goes down to his RIGHT (−z, facing −x) on the fourth/fifth feint — his head in the grass */
const T_KDIVE=-2.35,K_AT:[number,number]=[-3.3,-.4];
type Role='oko'|'bein'|'gk'|'d1'|'d2'|'d3'|'sge';
type Actor={role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-17,T1=10;
const hk=(i:number):number[]=>[HAKEN[i][0],HAKEN[i][1],HAKEN[i][2]];
const ACTORS:Actor[]=[
 {role:'oko',hero:true,style:OKO_ST,keys:[[T0,-24,6],[-13,-17,3.4],[T_RECV,...RECV],hk(0),hk(1),hk(2),hk(3),hk(4),[-.12,...SHOT_AT],[.08,...SHOT_AT],[1.6,-5.4,4.8],[4,-8,12],[T1,-12,20]]},
 {role:'bein',hero:true,style:BEIN_ST,keys:[[T0,-22,-6],[-13,-13,-2],[T_LAY-.1,-9.2,-.9],[T_LAY+.2,-9.1,-.8],[-8,-7.6,3.2],[-4,-5.4,5.4],[0,-4.6,5.8],[3,-6,8],[T1,-10,14]]},
 {role:'gk',hero:true,style:KAHN_ST,keys:[[T0,-1.2,0],[T_RECV,-2.2,.5],[-8.8,-3,-.4],[-7.1,-3.2,1.6],[-5.4,-3.4,-.8],[-3.7,-3.4,1.2],[T_KDIVE,...K_AT],[T1,...K_AT]]},
 {role:'d1',style:ksc({seed:31,build:{height:1.88}}),keys:[[T0,-16,-6],[T_RECV,-12.4,-2.6],[-9.1,-11,-1.4],[-8.2,-10.9,-1.2],[-6,-10.4,-1],[-3,-9,.2],[0,-8.2,.2],[T1,-8,0]]},
 {role:'d2',style:ksc({seed:32,skin:SKIN_M}),keys:[[T0,-10,8],[T_RECV,-9,5],[-7.4,-9.4,3.4],[-6.6,-9.5,3.5],[-5.8,-9.2,1.6],[-4,-8.6,.2],[-2.3,-7.6,-1.6],[-1.4,-7.4,-1.7],[T1,-6.8,-.6]]},// beaten twice
 {role:'d3',style:ksc({seed:33,build:{height:1.84}}),keys:[[T0,-6,-8],[T_RECV,-6.6,-5.4],[-5.6,-7.6,-2.6],[-4.1,-7.8,1],[-3.3,-7.4,2.2],[T1,-7,2.6]]},
 {role:'sge',style:sge({seed:62,skin:SKIN_M}),keys:[[T0,-30,-14],[-11,-20,-10],[0,-14,-7],[T1,-12,4]]},
];
const OKO=0,BEIN=1,GK=2,D1=3,D2=4,D3=5;
const TR=makeTracks(ACTORS.map(a=>a.keys),T0,T1);

// ---------------------------------------------------------------- the ball: Bein's lay-back, then glued to Okocha's feet through every cut, the shot, the net
const feet=(k:number,tau:number,ahead=.45):V3=>{const[x,z]=TR.posOf(k,tau),v=TR.velOf(k,tau),n=nrm2(v[0],v[1]),sp=Math.hypot(v[0],v[1]);return[x+n[0]*ahead*clamp(sp/1.5),BALL_R,z+n[1]*ahead*clamp(sp/1.5)];};
const LAY0:V3=[-8.6,BALL_R,-.7];
function ballAt(tau:number):V3{
 if(tau<T_LAY){const f=feet(BEIN,tau,.5);return f;}
 if(tau<T_RECV){const u=(tau-T_LAY)/(T_RECV-T_LAY);return mix3(LAY0,feet(OKO,T_RECV),1-Math.pow(1-u,1.5));}
 if(tau<-.12){const f=feet(OKO,tau);return tau>-.5?mix3(f,SHOT_BALL,sm(-.5,-.12,tau)):f;}
 if(tau<0)return SHOT_BALL;
 if(tau<TS)return mix3(SHOT_BALL,GOAL_PT,easeOut(tau/TS));
 if(tau<TS+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TS)/.14));
 const u=clamp((tau-TS-.14)/.5);return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u)),lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau*TAU*1.6;
const bulgeAt=(tau:number)=>tau<TS+.08?0:.7*Math.exp(-(tau-TS-.08)*2.4)*(1+.3*Math.sin((tau-TS)*14));

// ---------------------------------------------------------------- poses
/** a body feint: the shoulders dip and the hips drop the other way just before a cut */
const FEINT=(side:number)=>posed({lHipF:26,rHipF:26,lKnee:46,rKnee:46,lHipA:side>0?26:8,rHipA:side>0?8:26,lean:24,bend:side*18,roll:side*8,twist:side*16,neckP:30,lShA:side>0?20:60,rShA:side>0?60:20,lElb:40,rElb:40});
const kick=(pose:ReturnType<typeof loco>,tau:number,t0:number,foot:'l'|'r',power:number,dur=.8)=>{const w=win(tau,t0-.45,t0+.5,.15);return w>0?blendPose(pose,strike(clamp((tau-t0)/dur+STRIKE_CONTACT),{foot,power}),w):pose;};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=TR.posOf(k,tau),b=ballAt(tau);let pose=loco(TR,k,tau),yaw=faceYaw(TR,k,tau,b);
 switch(a.role){
  case 'oko':{
   if(tau>T_RECV&&tau<-.3){pose=blendPose(pose,dribble(TR.distOf(k,tau)/1.3,{foot:'r',speed:.45}),.75);
    // facing the goal while he dances sideways, with a feint into every cut
    yaw=lerpAng(yaw,yawTo(-x,-z*.3),.7);for(let i=0;i<HAKEN.length;i++){const[th,,hz]=HAKEN[i],next=HAKEN[i+1]?HAKEN[i+1][2]:SHOT_AT[1],side=Math.sign(next-hz)||1,w=win(tau,th-.45,th+.2,.15);if(w>0)pose=blendPose(pose,FEINT(-side),w*.8);}}
   pose=kick(pose,tau,0,'r',.55,.8);if(tau>-.5&&tau<.4)yaw=lerpAng(yaw,YAW_S,win(tau,-.5,.4,.15));
   if(tau>1)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4.2,{kind:'run'}),sm(1,1.7,tau));break;}
  case 'bein':{pose=kick(pose,tau,T_LAY,'r',.2,.6);if(tau>T_LAY-.6&&tau<T_LAY+.3)yaw=lerpAng(yaw,yawTo(RECV[0]-x,RECV[1]-z),win(tau,T_LAY-.6,T_LAY+.3,.15));
   if(tau>TS+.4)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4,{kind:'arms'}),sm(TS+.4,TS+1,tau)*.8);break;}
  case 'gk':{pose=keeperSet(tau*1.6);yaw=lerpAng(faceYaw(TR,k,tau,b),Math.PI,.5);
   if(tau>T_KDIVE-.15){pose=blendPose(pose,keeperDive(clamp((tau-T_KDIVE)/1.1),{side:'r',height:0}),sm(T_KDIVE-.15,T_KDIVE,tau));yaw=Math.PI;}break;}
  case 'd1':if(tau>-9.3&&tau<-7.8)pose=blendPose(pose,lunge(clamp((tau+9.3)/1),{side:'l'}),win(tau,-9.3,-7.8,.2));if(tau>TS+.5)pose=blendPose(pose,DEJECT,sm(TS+.8,TS+1.6,tau)*.8);break;
  case 'd2':if(tau>-7.6&&tau<-6.2)pose=blendPose(pose,lunge(clamp((tau+7.6)/1),{side:'r'}),win(tau,-7.6,-6.2,.2));
   if(tau>-2.6&&tau<-1)pose=blendPose(pose,lunge(clamp((tau+2.6)/1),{side:'l'}),win(tau,-2.6,-1,.2));if(tau>TS+.5)pose=blendPose(pose,DEJECT,sm(TS+.8,TS+1.6,tau)*.8);break;
  case 'd3':if(tau>-4.3&&tau<-2.3)pose=blendPose(pose,slideTackle(clamp((tau+4.3)/1.4),{foot:'r'}),win(tau,-4.3,-2.3,.2));break;
  default:break;
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((_,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k],st=stateOf(k,tau),hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===OKO&&(Math.abs(tau)<.3||HAKEN.some(h=>Math.abs(tau-h[0])<.2)))||(k===GK&&tau>T_KDIVE&&tau<T_KDIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}
/** the Waldstadion on a late-summer evening: Eintracht red, black and white in the crowd, a few Karlsruhe blue */
const ARENA=(roar=0,flash=0):Stadium=>({sky:'dusk',seats:[[K,.3],[R,.12]],crowd:[['paper',.3],[R,.3],[K,.3],[B,.1]],roar,flash});
const at=(k:number,tau:number,y=1)=>TR.at(k,tau,y);

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, the move into the box, the lay-back
function tau1(t:number){const tL=CUE(0,'lays the ball back')+.3;return key(t,mono([[0,T_LAY-tL],[tL,T_LAY],[SECS(0),T_RECV+.9]]),linear);}
const P1:V3=[-26,22,-68];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-30,8,20],fov:40})],
  [CUE(0,'Eintracht against')-.3,1.3,()=>({P:P1,T:mix3(b,[-12,1,0],.4),fov:18})],
  [CUE(0,'Uwe Bein')-.4,1,()=>({P:P1,T:mix3(b,at(BEIN,tau,1),.4),fov:10})],
  [CUE(0,'Okocha')-.3,.9,()=>({P:P1,T:mix3(b,at(OKO,tau,1),.5),fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12);
  stadium(s,c,t,[0,1,3],ARENA(.2));
  ground(s,c);
  play(s,c,tau,tp,{min:14,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Okocha')+.3;},
};
// ---------------------------------------------------------------- 2 · the broadcast camera stays on the dance (same real clock, closer lens)
const tau2=(t:number)=>key(t,mono([[0,tau1(SECS(0))],[CUE(1,'cuts one way'),HAKEN[0][0]-.1],[CUE(1,'the other'),HAKEN[1][0]],[CUE(1,'beats'),HAKEN[2][0]+.2],[CUE(1,'Oliver Kahn'),T_KDIVE-.3],[CUE(1,'on the grass'),-1.4],[SECS(1),-1.0]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),o=at(OKO,tau,1);
 return plan(t,[
  [0,0,()=>({P:P1,T:mix3(o,[-5,.8,.5],.25),fov:6})],
  [CUE(1,'the other')-.3,1,()=>({P:P1,T:mix3(o,[-4,.8,.5],.35),fov:5.6})],
  [CUE(1,'Oliver Kahn')-.3,.8,()=>({P:P1,T:mix3(o,at(GK,tau,.5),.5),fov:6.2})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,3],ARENA(.35+.3*sm(CUE(1,'Oliver'),CUE(1,'Oliver')+.5,t)));
  ground(s,c);
  const r=play(s,c,tau,tp,{min:12,smear:true});
  // each cut: a small yellow spark at the ball (the change of direction)
  for(const[th] of HAKEN){const u=(tau-th)/.25;if(u>0&&u<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(30,r.ball.r*3.5),{n:7,seed:Math.round(th*10)+50,g:easeOutBack(clamp(u*2))*(1-clamp((u-.5)*2)),width:6});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'on the grass')+.2;},
};
// ---------------------------------------------------------------- 3 · slow replay low behind Okocha: the fifth cut, the gap, the shot
const tau3=(t:number)=>key(t,mono([[0,HAKEN[3][0]-.3],[CUE(2,'eleven seconds'),HAKEN[4][0]],[CUE(2,'finds the gap'),-.35],[CUE(2,'scores'),TS-.05],[SECS(2),TS+2.4]]),linear);
function cam3v(t:number):Cam{
 const tau=tau3(t),o=at(OKO,tau,1);
 return plan(t,[
  [0,0,()=>({P:[-3.5,1.6,-12.5],T:mix3(o,[-3,.8,0],.35),fov:30})],
  [CUE(2,'eleven')-.3,.9,()=>({P:[-3.5,1.5,-12],T:mix3(o,[-3,.6,0],.45),fov:26})],
  [CUE(2,'finds')-.3,.8,()=>({P:[-3.2,1.4,-11.5],T:mix3(SHOT_BALL,GOAL_PT,.5),fov:30})],
  [CUE(2,'scores')+.4,1.4,()=>({P:[-3.5,2.2,-12],T:o,fov:24})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12);
  stadium(s,c,t,[0,1,3],ARENA(sm(TS,TS+.4,tau),sm(TS,TS+.3,tau)*(1-sm(TS+1.6,TS+2.2,tau))));
  ground(s,c);
  // "finds the gap": the open side of the goal lights up
  const gp=sm(CUE(2,'finds')-.2,CUE(2,'finds')+.2,t)*(1-sm(TS+.1,TS+.5,tau));
  if(gp>0){const q=[[.02,.02,.4],[.02,1.4,.4],[.02,1.4,3.5],[.02,.02,3.5]].map(p=>pr(c,p as V3)).filter((p):p is Pt=>!!p);if(q.length>2){const zp=polyPath(q,true);s.knockout(zp,.35*gp);s.tone(Y,zp,.45*gp);}}
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  const hit=tau/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(OKO,tau3(twos(t))),sk=solve(p.pose,B_OKO,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'finds the gap')+.3;},
};
// ---------------------------------------------------------------- 4 · the lesson: the zig-zag lit cut by cut, the lunges ringed
const tau4=(t:number)=>key(t,mono([[0,T_RECV],[CUE(3,'Quick changes'),HAKEN[1][0]],[CUE(3,'beat defenders'),HAKEN[2][0]+.4],[CUE(3,'even the keeper'),T_KDIVE],[SECS(3),TS+.6]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-24,8,-8],T:[-8,.4,.6],fov:30})],
  [CUE(3,'Quick')-.2,1,()=>({P:[-22,7,-7],T:[-8,.4,.6],fov:24})],
  [CUE(3,'even')-.2,.9,()=>({P:[-21,6,-6],T:[-5,.4,.3],fov:24})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tS=CUE(3,'Stay calm'),tQ=CUE(3,'Quick'),tB=CUE(3,'beat defenders'),tE=CUE(3,'even the keeper');
  stadium(s,c,t,[0,1,3],ARENA(.25));
  ground(s,c);
  // "Stay calm in the box": the box glows
  const bx=sm(tS-.1,tS+.4,t)*(1-sm(tQ+.4,tQ+1,t));
  if(bx>0){const q=[[-16.5,.01,-20.16],[0,.01,-20.16],[0,.01,20.16],[-16.5,.01,20.16]].map(p=>pr(c,p as V3)).filter((p):p is Pt=>!!p);if(q.length>2){const zp=polyPath(q,true);s.knockout(zp,.2*bx);s.tone(Y,zp,.22*bx);}}
  // "Quick changes of direction": the zig-zag path drawn cut by cut as he dances it
  const zz=sm(tQ-.2,tQ+.2,t);
  if(zz>0){const pts:V3[]=[[RECV[0],.03,RECV[1]]];for(const h of HAKEN)if(h[0]<=tau)pts.push([h[1],.03,h[2]]);const o=at(OKO,tau,.03);pts.push(o);
   const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length>1){const rb=ribbon(q,Math.max(6,kAt(c,o)*.07),{seed:9,taper:0,wobble:.5,pressure:0});s.knockout(rb,.9*zz);s.fill(Y,rb,.95*zz);}
   for(const h of HAKEN)if(h[0]<=tau)groundRing(s,c,[h[1],0,h[2]],.35,Y,zz,.08);}
  // "beat defenders": red rings where each defender lunged and missed
  const bd=sm(tB-.1,tB+.3,t);if(bd>0)for(const k of [D1,D2,D3])if(tau>-7)groundRing(s,c,at(k,tau,0),.8,R,bd,.1);
  // "even the keeper": a navy ring round Kahn on the grass
  const ek=sm(tE-.1,tE+.3,t);if(ek>0)groundRing(s,c,[K_AT[0]-.2,0,K_AT[1]-1.2],1.3,K,ek,.12);
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[OKO,GK,D1,D2,D3]});
  if(r.ball&&tau>=0&&tau<.25)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(60,r.ball.r*4.5),{n:9,seed:29,g:easeOutBack(clamp(tau/.1))*(1-clamp((tau-.12)/.12)),width:10});
  const fa=sm(-.1,.3,tau,easeInOutSine);if(fa>0){const q:V3[]=[];for(let i=0;i<=6;i++)q.push(mix3(SHOT_BALL,GOAL_PT,fa*i/6));arrow3(s,c,q,Math.max(8,kAt(c,SHOT_BALL)*.05),Y,.95);}
 },
 get still(){return CUE(3,'beat defenders')+.4;},
};

const film:RisoStory={
 id:'okocha-kahn-1993',format:'11v11',title:"Okocha's dance past Kahn",
 theme:'Stay calm in the box: quick changes of direction can beat defenders and even the keeper',
 ageNote:'Eintracht Frankfurt 3–1 Karlsruher SC, Bundesliga, Waldstadion, 31 August 1993 — Germany’s Goal of the Year. For players of every age.',
 spec:SPEC,
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball zig-zags through three quick cuts with a spark on each. Reduced motion: one spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,80,{n:7,seed,width:10});return;}
  const u=clamp(age/.75),seg=Math.min(2,Math.floor(u*3)),f=u*3-seg,zx=[[-90,30],[-30,-30],[30,30],[90,-30]];
  const a=zx[seg],b=zx[seg+1],bx=x+lerp(a[0],b[0],f),by=y+lerp(a[1],b[1],f);
  if(f<.3)sparkBurst(s,Y,x+a[0],y+a[1],70,{n:6,seed:seed+seg,g:easeOutBack(clamp(f/.15))*(1-clamp((f-.15)/.15)),width:9});
  footballPanels(s,bx,by,24,{rot:age*12+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Checked by tests/play-film-okocha-kahn-1993.cjs (pitch metres; the attacked goal line x = 0, +z = Eintracht's right). */
export const FACTS={HAKEN,T_LAY,T_RECV,TS,GOAL_PT,SHOT_BALL,ballAt,shotFoot:'r' as const,
 okoAt:(tau:number)=>TR.posOf(OKO,tau),beinAt:(tau:number)=>TR.posOf(BEIN,tau),
 okochaContact:()=>{const st=stateOf(OKO,0),sk=solve(st.pose,B_OKO,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 kahnAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_KAHN,st.place);return{lHa:sk.lHa,rHa:sk.rHa,head:sk.head};},d3};
