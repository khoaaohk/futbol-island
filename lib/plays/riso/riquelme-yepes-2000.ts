/** Juan Román Riquelme's nutmeg on Mario Yepes — Boca Juniors 3–0 River Plate, Copa Libertadores quarter-final second leg, Wednesday
 * 24 May 2000, La Bombonera, Buenos Aires. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx). A reconstruction from WRITTEN accounts (the footage itself was not reviewed). Shared kit: ./broadcast3d.ts.
 *
 * SOURCES (read Sept 2026 with curl, cached in the build scratchpad kd-films/src/):
 *  - Wikipedia, "Juan Román Riquelme": in "the quarterfinals second leg against rivals River Plate, ... he scored a goal, assisted in another,
 *    and made a historic play where he nutmegged River defender Mario Yepes as Boca won 3–0".
 *  - Goal.com (es), "A 21 años del caño de Riquelme a Yepes y del 'muletazo' de Palermo": "Ocurrió en el segundo tiempo: el enganche del
 *    Xeneize tomó la pelota volcado sobre la derecha, cerca de la mitad de la cancha, y cuando Yepes se acercó a marcarlo, hizo la maravilla";
 *    Riquelme, years later: "Él me siguió hasta el córner y no hizo nada"; "la joyita del todavía 10 de Boca".
 *  - Mediotiempo, "A 20 años de la gran maravilla de Riquelme, un túnel a Yepes": "Riquelme era dueño del balón sobre la banda y Yepes encaró al
 *    jugador. Cuando el colombiano intentó quitarle el esférico, Juan Román usó su pie derecho para mandar la pelota entre las piernas de su
 *    rival y seguir con la jugada"; 24 May 2000, 3–0 (Delgado, Riquelme, Palermo).
 *  - Infobae, 24 May 2019: "cuando el defensor central se le acercó para marcarlo dejó en ridículo al colombiano con un exquisito caño".
 * CONFIRMED: date, La Bombonera, the second half, Boca 3–0; Riquelme (Boca's No. 10) had the ball on the RIGHT touchline near HALFWAY; the
 *  centre-back Yepes came to mark him and tried to take the ball; Riquelme's RIGHT foot sent it THROUGH YEPES'S LEGS and he carried on
 *  with the play, Yepes following him toward the corner.
 * INFERRED (illustrative, never claimed in the narration): the pass that reached Riquelme and who played it; every position, run and
 *  timing; how Riquelme stood while shielding and which side of Yepes he went round (drawn: he rolls it through and steps round Yepes's
 *  infield side); the minute; Yepes's number (none drawn); kit details (colours drawn: Boca blue with yellow trim — the yellow chest band
 *  is not drawn by the figure library; River white with red trim — the red sash is not drawn; shorts and socks as drawn); the night sky;
 *  the crowd; which end; camera placements.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME, the right touchline NEAR us (La Bombonera's
 * steep stands behind → Riquelme on the ball → Yepes closing → the nutmeg → away down the wing); ch2 = a slow replay LOW BEHIND RIQUELME:
 * he shields, Yepes reaches in; ch3 = a slow replay LOW AT PITCH LEVEL FROM THE SIDE: Yepes's legs open (a gate), the right-foot touch,
 * the ball through, Riquelme away; ch4 = the lesson, a slow repeat with marks: the shield (a line from ball to defender through the body),
 * the gate between the legs, the arrow through it. Composed on the FULL sheet. Right-handed world: Boca attack +x, +z = Boca's RIGHT (the
 * right touchline is z = +34). Poses on twos, cameras on ones; all randomness seeded. */
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,dribble,lunge,stand,posed,blendPose,STRIKE_CONTACT,type AthleteStyle,type V3,type Build} from './athlete';
import {type NarrationTiming} from './timing';
import timingJson from '../../../public/plays/narration/riquelme-yepes-2000/timing.json';
import {Y,R,B,K,SPEC,mix3,d3,yawTo,nrm2,lerpAng,buildChapters,mono,frame,toCam,scr,pr,kAt,stadium,ground,makeTracks,loco,faceYaw,win,
 drawScene,plan,arrow3,groundRing,BALL_R,SKIN_L,SKIN_M,SKIN_D,type Fig,type State,type Cam,type Stadium} from './broadcast3d';

// ---------------------------------------------------------------- narration + timing
const SCRIPT=[
 {label:'Buenos Aires, 2000',text:'Buenos Aires, 2000. Boca Juniors against River Plate, in the Copa Libertadores. Juan Román Riquelme has the ball on the right wing. Mario Yepes closes in... and Riquelme slips it through his legs!',tail:2.2,
  cues:['Buenos Aires','Boca Juniors','Copa Libertadores','Juan Román Riquelme','right wing','Mario Yepes','closes in','slips it through']},
 {label:'Watch it again',text:'Watch again. Riquelme keeps the ball close. Yepes reaches in to take it.',tail:1.8,
  cues:['Watch again','keeps the ball','Yepes reaches','take it']},
 {label:'The nutmeg',text:'His legs open, and a touch of the right foot sends it through. Riquelme is away with the ball!',tail:2,
  cues:['His legs open','right foot','sends it through','Riquelme is away']},
 {label:'Shield, then slip it',text:'Shield the ball with your body. When a defender gets too close, slip it through their legs!',tail:2,
  cues:['Shield the ball','body','too close','slip it through']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const {CHAPTERS,CUE,SECS}=buildChapters('riquelme',SCRIPT,VOICE);

// ---------------------------------------------------------------- the cast
const boca=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.95],shorts:[B,.95],socks:[B,.95],boots:K,skin:SKIN_M,hair:K,line:K,trim:[Y,.95],numberInk:[Y,.95],hairStyle:'short',build:{height:1.8,bulk:1},...o});
const river=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.9],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[R,.95],hairStyle:'short',build:{height:1.82,bulk:1.02},...o});
const B_RIQ:Build={height:1.82,bulk:.98},B_YEP:Build={height:1.86,bulk:1.06};
const RIQ_ST=boca({number:10,hair:[K,.95],build:B_RIQ,seed:10});
const YEP_ST=river({skin:SKIN_D,hair:[K,.95],build:B_YEP,seed:2});

// ---------------------------------------------------------------- the play on one clock τ (τ = 0 is the nutmeg touch)
const T_PASS=-3.4,T_RECV=-2.3,T_OUT=.62,T_COLLECT=.95;
/** Riquelme on the ball on the right touchline, a few metres into River's half, back half-turned to Yepes */
const RQ0:[number,number]=[-49.6,30.2];
/** Yepes plants in front of him, lunging for the ball, legs apart (lunge reach .6 lands just after the touch) */
const YP:[number,number]=[-47.9,29.7];
const LUNGE_T0=-.36,LUNGE_L=.8;
const YAW_Y=yawTo(RQ0[0]-YP[0],RQ0[1]-YP[1]);
/** the gate: midway between Yepes's ankles at the touch, just off the ground */
const GATE:V3=(()=>{const sk=solve(lunge(clamp((0-LUNGE_T0)/LUNGE_L),{side:'r'}),B_YEP,{x:YP[0],z:YP[1],yaw:YAW_Y});return[(sk.lAn[0]+sk.rAn[0])/2,BALL_R,(sk.lAn[2]+sk.rAn[2])/2];})();
/** the touch point, one step in front of the gate on Riquelme's side; the ball rolls through and out the far side */
const DIRN=nrm2(GATE[0]-RQ0[0],GATE[2]-RQ0[1]);
const TOUCH:V3=[GATE[0]-DIRN[0]*1.05,BALL_R,GATE[2]-DIRN[1]*1.05],OUT:V3=[GATE[0]+DIRN[0]*2.4,BALL_R,GATE[2]+DIRN[1]*2.4];
const YAW_R=yawTo(DIRN[0],DIRN[1]);
const PCR:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.15}),B_RIQ,{x:0,z:0,yaw:YAW_R});return[TOUCH[0]-sk.rToe[0]-.03,TOUCH[2]-sk.rToe[2]];})();
/** round Yepes on his infield side, collect beyond him */
const SIDE:[number,number]=[-DIRN[1],DIRN[0]];// DIRN rotated to the right of travel (+z-ish = touchline side)
const ROUND:[number,number]=[GATE[0]-SIDE[0]*1.3,GATE[2]-SIDE[1]*1.3];
const PASSER:[number,number]=[-60,21];
type Role='riq'|'yep'|'boca'|'riv'|'pas';
type Actor={role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-7,T1=12;
const ACTORS:Actor[]=[
 {role:'riq',hero:true,style:RIQ_ST,keys:[[T0,-54,26],[T_PASS,-51.5,28.6],[T_RECV,RQ0[0]-.3,RQ0[1]-.1],[-1,RQ0[0]+.05,RQ0[1]],[-.1,...PCR],[.05,...PCR],[.5,...ROUND],[T_COLLECT,OUT[0]-.5,OUT[2]-.1],[3,-37,31.6],[6,-24,32.4],[T1,-4,32.2]]},
 {role:'yep',hero:true,style:YEP_ST,keys:[[T0,-38,20],[T_PASS,-41,24],[T_RECV,-44.5,27.4],[-1,YP[0]+.7,YP[1]-.3],[LUNGE_T0,...YP],[1.1,...YP],[2.2,YP[0]+1.5,YP[1]+.8],[4,-34,31],[7,-21,31.6],[T1,-6,31]]},
 {role:'pas',style:boca({seed:41,skin:SKIN_L}),keys:[[T0,-63,19],[T_PASS,...PASSER],[T1,-54,22]]},
 {role:'boca',style:boca({seed:42}),keys:[[T0,-50,14],[0,-46,16],[T1,-30,20]]},
 {role:'boca',style:boca({seed:43,skin:SKIN_D}),keys:[[T0,-40,8],[0,-38,10],[T1,-22,16]]},
 {role:'riv',style:river({seed:31,skin:SKIN_M}),keys:[[T0,-44,16],[0,-43,19],[T1,-30,24]]},
 {role:'riv',style:river({seed:32}),keys:[[T0,-36,26],[0,-38,24],[T1,-26,26]]},
 {role:'riv',style:river({seed:33,build:{height:1.78}}),keys:[[T0,-55,20],[0,-52,23],[T1,-40,24]]},
];
const RIQ=0,YEP=1,PAS=2;
const TR=makeTracks(ACTORS.map(a=>a.keys),T0,T1);

// ---------------------------------------------------------------- the ball: the pass in, kept close, the touch through the gate, collected, down the wing
const feet=(k:number,tau:number,ahead=.5):V3=>{const[x,z]=TR.posOf(k,tau),v=TR.velOf(k,tau),n=nrm2(v[0],v[1]),sp=Math.hypot(v[0],v[1]);return[x+n[0]*ahead*clamp(sp/2),BALL_R,z+n[1]*ahead*clamp(sp/2)];};
const PASS0:V3=[PASSER[0]+.6,BALL_R,PASSER[1]+.4];
const RECV:V3=[RQ0[0]-.15,BALL_R,RQ0[1]-.45];
function ballAt(tau:number):V3{
 if(tau<T_PASS)return PASS0;
 if(tau<T_RECV){const u=(tau-T_PASS)/(T_RECV-T_PASS);return mix3(PASS0,RECV,1-Math.pow(1-u,1.6));}
 if(tau<-.12){// kept close: small drags back and forth under his sole while he shields
  const u=sm(T_RECV,-.12,tau),w=.18*Math.sin((tau-T_RECV)*TAU*.9);return[lerp(RECV[0],TOUCH[0],u)+w*DIRN[1],BALL_R,lerp(RECV[2],TOUCH[2],u)-w*DIRN[0]];}
 if(tau<0)return TOUCH;
 if(tau<T_OUT){const u=tau/T_OUT;return mix3(TOUCH,OUT,1-Math.pow(1-u,1.5));}
 if(tau<T_COLLECT)return OUT;
 return feet(RIQ,tau,.55);
}
const spinAt=(tau:number)=>tau*TAU*1.4;

// ---------------------------------------------------------------- poses
const SHIELD=posed({lHipF:30,rHipF:22,lKnee:40,rKnee:34,lHipA:18,rHipA:14,lean:22,pitch:6,twist:-14,neckP:26,neckY:24,lShA:58,rShA:40,lShF:-10,lElb:40,rElb:50});
const kick=(pose:ReturnType<typeof loco>,tau:number,t0:number,foot:'l'|'r',power:number,dur=.8)=>{const w=win(tau,t0-.4,t0+.45,.15);return w>0?blendPose(pose,strike(clamp((tau-t0)/dur+STRIKE_CONTACT),{foot,power}),w):pose;};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=TR.posOf(k,tau),b=ballAt(tau);let pose=loco(TR,k,tau),yaw=faceYaw(TR,k,tau,b);
 switch(a.role){
  case 'riq':{
   // shielding: body between Yepes and the ball, knees bent, arm out, head turned to feel him
   if(tau>T_RECV&&tau<-.2){pose=blendPose(pose,SHIELD,win(tau,T_RECV,-.2,.3));yaw=lerpAng(yaw,YAW_R+.9,win(tau,T_RECV,-.3,.4));}
   pose=kick(pose,tau,0,'r',.15,.7);if(tau>-.35&&tau<.25)yaw=lerpAng(yaw,YAW_R,win(tau,-.35,.25,.12));
   if(tau>T_COLLECT)pose=blendPose(pose,dribble(TR.distOf(k,tau)/2,{foot:'r',speed:.9}),sm(T_COLLECT,T_COLLECT+.3,tau)*.7);break;}
  case 'yep':{yaw=faceYaw(TR,k,tau,b);
   if(tau>LUNGE_T0-.2&&tau<1.3){pose=blendPose(pose,lunge(clamp((tau-LUNGE_T0)/LUNGE_L),{side:'r'}),win(tau,LUNGE_T0-.2,1.3,.2));yaw=lerpAng(yaw,YAW_Y,win(tau,LUNGE_T0-.3,1.2,.2));}
   if(tau>1.1&&tau<2.2)pose=blendPose(pose,stand(),win(tau,1.1,2.2,.3)*.6);break;}
  case 'pas':{pose=kick(pose,tau,T_PASS,'r',.45,.8);break;}
  default:break;
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((_,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k],st=stateOf(k,tau),hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===RIQ&&Math.abs(tau)<.3)||(k===YEP&&tau>LUNGE_T0&&tau<LUNGE_T0+.6))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},null);
}
/** La Bombonera at night: steep stands packed with Boca blue and yellow */
const ARENA=(roar=0,flash=0):Stadium=>({sky:'night',seats:[[B,.45],[Y,.2]],crowd:[['paper',.18],[B,.36],[Y,.36],[K,.1]],fascia:[[.33,.38],[.66,.71]],roar,flash});
const at=(k:number,tau:number,y=1)=>TR.at(k,tau,y);
const GATE_Y=(tau:number)=>{const st=stateOf(YEP,tau),sk=solve(st.pose,B_YEP,st.place);return{l:sk.lAn,r:sk.rAn};};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera over the right touchline (near us)
function tau1(t:number){const tN=CUE(0,'slips it through')+.1;return Math.max(T0+.3,t-tN);}
const P1:V3=[-40,22,82];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-48,10,-30],fov:42})],
  [CUE(0,'Boca Juniors')-.3,1.3,()=>({P:P1,T:[-50,1,20],fov:26})],
  [CUE(0,'Juan Román')-.4,1,()=>({P:P1,T:mix3(b,at(RIQ,tau,1),.5),fov:6.5})],
  [CUE(0,'Mario Yepes')-.3,.8,()=>({P:P1,T:mix3(b,at(YEP,tau,1),.35),fov:5.2})],
  [CUE(0,'slips')+.2,.8,()=>({P:P1,T:mix3(b,at(RIQ,tau,1),.4),fov:6})],
  [CUE(0,'slips')+1.6,1.4,()=>({P:P1,T:mix3(b,at(RIQ,tau,1),.4),fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tN=CUE(0,'slips')+.4;
  stadium(s,c,t,[1,2,3],ARENA(sm(tN,tN+.5,t),sm(tN,tN+.4,t)*(1-sm(tN+2.4,tN+3,t))));
  ground(s,c);
  play(s,c,tau,tp,{min:14,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'slips')+.2;},
};
// ---------------------------------------------------------------- 2 · slow replay low behind Riquelme: he keeps it close, Yepes reaches in
const tau2=(t:number)=>key(t,mono([[0,T_RECV-.4],[CUE(1,'keeps'),T_RECV+.2],[CUE(1,'Yepes reaches'),LUNGE_T0-.05],[CUE(1,'take it'),-.08],[SECS(1)-.2,.02]]),linear);
const E2:V3=[RQ0[0]-DIRN[0]*10-SIDE[0]*3,3,RQ0[1]-DIRN[1]*10-SIDE[1]*3];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(b,at(YEP,tau,1),.5),fov:26})],
  [CUE(1,'keeps')-.3,.9,()=>({P:E2,T:mix3(b,at(RIQ,tau,.8),.5),fov:16})],
  [CUE(1,'Yepes')-.3,.9,()=>({P:E2,T:mix3(b,at(YEP,tau,.9),.5),fov:15})],
  [CUE(1,'take it')-.2,.7,()=>({P:E2,T:add0(GATE,.5),fov:13})],
 ]);
}
const add0=(p:V3,y:number):V3=>[p[0],p[1]+y,p[2]];
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,3],ARENA());
  ground(s,c);
  groundRing(s,c,at(RIQ,tau,0),.8,Y,sm(CUE(1,'keeps')-.3,CUE(1,'keeps'),t)*(1-sm(CUE(1,'Yepes')-.2,CUE(1,'Yepes')+.2,t)),.12);
  groundRing(s,c,at(YEP,tau,0),.9,R,sm(CUE(1,'Yepes')-.2,CUE(1,'Yepes')+.2,t),.12);
  play(s,c,tau,tp,{smear:true,min:11});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'take it')+.1;},
};
// ---------------------------------------------------------------- 3 · slow replay at pitch level from the side: the gate opens, through it goes
const tau3=(t:number)=>key(t,mono([[0,LUNGE_T0-.3],[CUE(2,'right foot'),-.05],[CUE(2,'sends it through'),T_OUT*.45],[CUE(2,'Riquelme is away'),T_COLLECT+.1],[SECS(2),3]]),linear);
const E3:V3=[GATE[0]+SIDE[0]*5.6,.7,GATE[2]+SIDE[1]*5.6];
function cam3v(t:number):Cam{
 const tau=tau3(t),r=at(RIQ,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:add0(GATE,.7),fov:24})],
  [CUE(2,'His legs')-.1,.7,()=>({P:E3,T:add0(GATE,.35),fov:15})],
  [CUE(2,'sends')-.2,.8,()=>({P:E3,T:mix3(add0(GATE,.3),ballAt(tau),.5),fov:17})],
  [CUE(2,'Riquelme is away')-.3,1.2,()=>({P:[E3[0]+2,1.4,E3[2]],T:mix3(r,ballAt(tau),.4),fov:22})],
 ]);
}
function gate(s:Sheet,c:Cam,tau:number,a:number,ink=Y){if(a<=0)return;const g=GATE_Y(tau),pl=pr(c,[g.l[0],.05,g.l[2]]),pr_=pr(c,[g.r[0],.05,g.r[2]]);if(!pl||!pr_)return;
 const mx=(pl[0]+pr_[0])/2,my=(pl[1]+pr_[1])/2,w=Math.hypot(pr_[0]-pl[0],pr_[1]-pl[1])/2,h=w*.9,pts:Pt[]=[];for(let i=0;i<=16;i++){const u=Math.PI*i/16;pts.push([mx-Math.cos(u)*w,my-Math.sin(u)*h*a]);}
 const d=ribbon(pts,Math.max(5,w*.16),{seed:13,taper:.1,wobble:.6});s.knockout(d,.9);s.fill(ink,d,.95);}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tA=CUE(2,'Riquelme is away');
  stadium(s,c,t,[0,1,2,3],ARENA(sm(tA-.3,tA+.3,t),sm(tA-.2,tA+.3,t)*(1-sm(tA+1.6,tA+2.2,t))));
  ground(s,c);
  const ga=sm(CUE(2,'His legs')-.1,CUE(2,'His legs')+.3,t,easeOutBack)*(1-sm(T_OUT,T_OUT+.4,tau));
  const r=play(s,c,tau,tp,{smear:true,min:10,lines:true,prevBall:tau3(t-.06)});
  gate(s,c,tau,ga);
  const hit=tau/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(40,r.ball.r*4),{n:8,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(5,r.ball.r*.4)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(RIQ,tau3(twos(t))),sk=solve(p.pose,B_RIQ,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'sends it through')+.1;},
};
// ---------------------------------------------------------------- 4 · the lesson: shield it, then slip it through the gate
const tau4=(t:number)=>key(t,mono([[0,T_RECV],[CUE(3,'body'),-1],[CUE(3,'too close'),LUNGE_T0+.1],[CUE(3,'slip it through'),-.03],[SECS(3),T_COLLECT+.3]]),linear);
const E4:V3=[GATE[0]+SIDE[0]*6.5-DIRN[0]*3,3.2,GATE[2]+SIDE[1]*6.5-DIRN[1]*3];
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E4,T:add0(mix3([RQ0[0],0,RQ0[1]],GATE,.4),.7),fov:24})],
  [CUE(3,'too close')-.2,.9,()=>({P:E4,T:add0(GATE,.5),fov:18})],
  [CUE(3,'slip')-.1,.8,()=>({P:E4,T:add0(mix3(GATE,OUT,.4),.4),fov:20})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tS=CUE(3,'Shield'),tB=CUE(3,'body'),tC=CUE(3,'too close'),tT=CUE(3,'slip');
  stadium(s,c,t,[0,1,3],ARENA(.25+.35*sm(tT+.3,tT+.9,t)));
  ground(s,c);
  // "Shield the ball": a yellow ring on the ball, a blue arc behind his back between the ball and the defender
  const sh=sm(tS-.1,tS+.4,t)*(1-sm(tC+.2,tC+.6,t));
  if(sh>0){groundRing(s,c,ballAt(tau),.45,Y,sh,.1);
   const rp=at(RIQ,tau,0),yp=at(YEP,tau,0),d=nrm2(yp[0]-rp[0],yp[2]-rp[2]),pts:V3[]=[];for(let i=0;i<=12;i++){const u=(i/12-.5)*2.2,cs=Math.cos(u),sn=Math.sin(u);pts.push([rp[0]+(d[0]*cs-d[1]*sn)*.75,.05,rp[2]+(d[1]*cs+d[0]*sn)*.75]);}
   const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length>2){const rb=ribbon(q,Math.max(6,kAt(c,rp)*.09),{seed:5,taper:.2,wobble:.6});s.knockout(rb,sh);s.fill(B,rb,.95*sh);}}
  // "body": his body glows as the wall
  const bd=sm(tB-.1,tB+.3,t)*(1-sm(tC,tC+.4,t));if(bd>0)groundRing(s,c,at(RIQ,tau,0),.7,B,bd,.12);
  // "too close": a red ring round the defender's feet
  groundRing(s,c,at(YEP,tau,0),.95,R,sm(tC-.1,tC+.3,t)*(1-sm(tT+.6,tT+1,t)),.12);
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[RIQ,YEP]});
  // "slip it through their legs": the gate between the ankles and the arrow through it
  const gt=sm(tT-.3,tT+.1,t,easeOutBack)*(1-sm(SECS(3)-.9,SECS(3)-.7,t));gate(s,c,tau,gt);
  const ar=sm(tT,tT+.8,t,easeInOutSine)*(1-sm(SECS(3)-.9,SECS(3)-.7,t));
  if(ar>0){const q:V3[]=[];for(let i=0;i<=6;i++)q.push(add0(mix3(TOUCH,OUT,ar*i/6),.02));arrow3(s,c,q,Math.max(7,kAt(c,GATE)*.05),Y,.95);}
  void r;
 },
 get still(){return CUE(3,'slip it through')+.3;},
};

const film:RisoStory={
 id:'riquelme-yepes-2000',format:'11v11',title:"Riquelme's nutmeg on Yepes",
 theme:'Shield the ball with your body, then slip it through the defender’s legs when they get too close',
 ageNote:'Boca Juniors 3–0 River Plate, Copa Libertadores quarter-final, La Bombonera, 24 May 2000. For players of every age.',
 spec:SPEC,
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little yellow gate pops up and a ball rolls through it. Reduced motion: the gate. */
 touch(s,x,y,age,seed){
  const r=rng(seed),g=age<=0?1:easeOutBack(clamp(age/.2)),gp:Pt[]=[];for(let i=0;i<=12;i++){const u=Math.PI*i/12;gp.push([x-Math.cos(u)*60,y-Math.sin(u)*70*g]);}
  const d=ribbon(gp,12,{seed,taper:.1,wobble:.6});s.knockout(d);s.fill(Y,d,.95);if(age<=0)return;
  const u=clamp(age/.7),fade=1-clamp((age-.6)/.2);if(fade>0)footballPanels(s,x-160+320*easeOut(u),y-20,24,{rot:age*12+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Checked by tests/play-film-riquelme-yepes-2000.cjs (pitch metres; +x = Boca's attack, +z = Boca's right: the right touchline is z = 34). */
export const FACTS={GATE,TOUCH,OUT,T_OUT,T_COLLECT,ballAt,touchFoot:'r' as const,RQ0,
 riquelmeContact:()=>{const st=stateOf(RIQ,0),sk=solve(st.pose,B_RIQ,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 yepesAnkles:(tau:number)=>GATE_Y(tau),riqAt:(tau:number)=>TR.posOf(RIQ,tau),d3,PAS};
