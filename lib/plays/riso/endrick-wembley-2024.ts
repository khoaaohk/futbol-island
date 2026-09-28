/** Endrick's first goal for Brazil — England 0–1 Brazil, friendly, Saturday 23 March 2024, Wembley Stadium, London.
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx). A reconstruction
 * of the goal from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print. Shared kit: ./broadcast3d.ts.
 *
 * SOURCES (read Sept 2026 with curl, cached in the build scratchpad kd-films/src/):
 *  - The FA (englandfootball.com), "Match Centre: England 0-1 Brazil", 23 March 2024: "it was Brazil who found the breakthrough in the 80th
 *    minute when a long ball over the top set Vinicius through on goal and, while Pickford did well to save the initial shot, the ball fell to
 *    Endrick to tap in"; "The 17 year old ... tapped in a rebound ... with just ten minutes to go"; line-ups: Pickford 1; Vinicius Junior 7;
 *    "21. Endrick for Rodrygo 71'".
 *  - BBC Sport, Phil McNulty, "England 0-1 Brazil: Teenager Endrick scores late winner at Wembley", 23 March 2024: "Vinicius Jr broke clear,
 *    the 17-year-old substitute left with a simple finish from close range despite England keeper Jordan Pickford's save with 10 minutes
 *    left"; "the youngest male goalscorer for club or country at the stadium at just 17 years and 246 days".
 *  - CNN, 24 March 2024: "tapping home from close range in the 80th minute for his first international goal".
 *  - Wikipedia, "Endrick" (23 March 2024, Wembley, his first senior international goal, 1–0).
 * CONFIRMED: date, venue, 0–0 until the 80th minute; a long ball over the top sends Vinícius Júnior clear; Pickford saves his shot; the ball
 *  falls to Endrick (17, a second-half substitute, No. 21), who taps it in from close range; Brazil win 1–0.
 * INFERRED (illustrative, never claimed in the narration): who played the long ball and from where (drawn: an unnamed Brazil player in his
 *  own half); every position, run and timing; Endrick's foot (drawn LEFT, his stronger foot); which way the save went and where the tap-in
 *  entered the net; kits (drawn: England white shirts, navy shorts, white socks; Brazil yellow shirts, blue shorts, white socks; Pickford in
 *  red); the night sky (19:45 kick-off), Wembley's arch and red seats; crowd colours; which end; camera placements.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Wembley at night → the long ball → Vinícius
 * clear → the save → Endrick's tap-in → he wheels away); ch2 = a slow replay from HIGH BEHIND THE GOAL, down Vinícius's run and shot into
 * Pickford, with Endrick following in (a ring under him); ch3 = a slow replay LOW BESIDE THE POST: the ball drops at Endrick's feet and he
 * taps it home; ch4 = the lesson from the edge of the box: an arrow following the shot in, the rebound's landing spot, the quick finish
 * before the keeper can get up. Composed on the FULL sheet. Right-handed world: Brazil attack +x, +z = Brazil's right. Poses on twos,
 * cameras on ones; all randomness seeded. */
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,keeperDive,celebrate,blendPose,STRIKE_CONTACT,type AthleteStyle,type V3,type Build} from './athlete';
import {type NarrationTiming} from './timing';
import timingJson from '../../../public/plays/narration/endrick-wembley-2024/timing.json';
import {Y,R,B,K,SPEC,DEG,add3,mix3,d3,yawTo,nrm2,lerpAng,buildChapters,mono,frame,toCam,scr,pr,kAt,polyP,stadium,ground,makeTracks,loco,faceYaw,win,DEJECT,
 drawScene,plan,arrow3,groundRing,trail,launch,flyA,G3,BALL_R,SKIN_L,SKIN_M,SKIN_D,type Fig,type State,type Cam,type Stadium} from './broadcast3d';

// ---------------------------------------------------------------- narration + timing
const SCRIPT=[
 {label:'Wembley, 2024',text:'Wembley, 2024. England against Brazil, ten minutes to go. A long ball sends Vinícius Júnior clear. Jordan Pickford saves... but seventeen-year-old Endrick taps it in!',tail:2.2,
  cues:['Wembley','England against Brazil','ten minutes','long ball','Vinícius Júnior','Jordan Pickford','saves','Endrick','taps it in']},
 {label:'Watch it again',text:'Watch again. Vinícius races through and shoots. The keeper blocks it, but look who is following in.',tail:1.6,
  cues:['Watch again','races through','shoots','keeper blocks','following in']},
 {label:'In the right place',text:'Endrick is in the right place. The ball drops right at his feet, and he taps it home. Brazil win, one–nil!',tail:2,
  cues:['Endrick is','ball drops','taps it home','Brazil win']},
 {label:'Be ready',text:'Always follow a shot in. Be ready near goal: a quick finish gives the keeper no time to get up.',tail:2,
  cues:['Always follow','Be ready','quick finish','no time']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const {CHAPTERS,CUE,SECS}=buildChapters('endrick',SCRIPT,VOICE);

// ---------------------------------------------------------------- the cast (kits inferred, see header)
const bra=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[B,.9],socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,trim:[B,.9],numberInk:[B,.95],hairStyle:'short',build:{height:1.78,bulk:.98},...o});
const eng=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.9],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],hairStyle:'short',build:{height:1.85,bulk:1.02},...o});
const B_END:Build={height:1.73,bulk:1.02,thighs:1.1},B_VIN:Build={height:1.76,bulk:.9},B_PIC:Build={height:1.85,bulk:1.02};
const END_ST=bra({number:21,skin:SKIN_D,hair:[K,.95],build:B_END,seed:21});
const VIN_ST=bra({number:7,skin:SKIN_D,hair:[K,.95],hairStyle:'curly',build:B_VIN,seed:7});
const PIC_ST:AthleteStyle={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],boots:K,skin:SKIN_L,hair:[Y,.45],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:B_PIC,seed:1};

// ---------------------------------------------------------------- the move on one clock τ (τ = 0 is Endrick's tap-in)
const T_LONG=-4.6,T_CTRL=-2.5,T_SHOT=-.95,T_SAVE=-.62,TS=.36;
const LONG0:V3=[-56,BALL_R,-1],CTRL:[number,number]=[-27,-6.5];
/** Pickford comes out and dives to his RIGHT (−z for a keeper facing −x); the shot meets his hands at T_SAVE */
const PIC_AT:[number,number]=[-4.6,-2.4],DIVE_U=.5,DIVE=(u:number)=>keeperDive(clamp(u),{side:'r',height:.08});
const T_DIVE=T_SAVE-DIVE_U*.8;
const SAVE_PT:V3=(()=>{const sk=solve(DIVE(DIVE_U),B_PIC,{x:PIC_AT[0],z:PIC_AT[1],yaw:Math.PI});return[(sk.lHa[0]+sk.rHa[0])/2-.14,Math.max(BALL_R,(sk.lHa[1]+sk.rHa[1])/2),(sk.lHa[2]+sk.rHa[2])/2];})();
/** the rebound falls to Endrick ≈ 6 m out; he taps it into the net low (illustrative) */
const TAP:V3=[-6.2,BALL_R,1.2],GOAL_PT:V3=[0,.25,.2],NET_HIT:V3=[1.8,.25,.1],REST:V3=[1.3,BALL_R,.2];
const YAW_E=yawTo(GOAL_PT[0]-TAP[0],GOAL_PT[2]-TAP[2]);
const PCE:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l',power:.25}),B_END,{x:0,z:0,yaw:YAW_E});return[TAP[0]-sk.lToe[0]-.05,TAP[2]-sk.lToe[2]];})();
type Role='end'|'vin'|'gk'|'bra'|'eng'|'lng';
type Actor={role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-8,T1=12;
const SHOT_FROM:[number,number]=[-12.6,-4.6];
const ACTORS:Actor[]=[
 {role:'end',hero:true,style:END_ST,keys:[[T0,-40,5],[T_LONG,-36,4.6],[T_CTRL,-27,4],[T_SHOT,-15.5,2.8],[T_SAVE,-11.6,2.2],[-.12,...PCE],[.06,...PCE],[.6,PCE[0]+.5,PCE[1]+.4],[2,-6,7],[5,-9,17],[T1,-11,26]]},
 {role:'vin',hero:true,style:VIN_ST,keys:[[T0,-36,-9],[T_LONG,-33,-8.6],[T_CTRL-.1,CTRL[0]-.5,CTRL[1]+.1],[T_SHOT,...SHOT_FROM],[T_SAVE,-11.6,-4.3],[.5,-9.5,-3.5],[3,-8,4],[T1,-10,20]]},
 {role:'gk',hero:true,style:PIC_ST,keys:[[T0,-2,0],[T_CTRL,-2.4,-.8],[T_SHOT,-4,-1.8],[T_DIVE,...PIC_AT],[T1,...PIC_AT]]},
 {role:'lng',style:bra({seed:41}),keys:[[T0,-60,-3],[T_LONG,LONG0[0]-.8,LONG0[2]-.1],[T1,-50,-2]]},
 {role:'eng',style:eng({seed:31,skin:SKIN_D}),keys:[[T0,-30,-5],[T_CTRL,-25.5,-5],[T_SHOT,-15,-2.8],[0,-9,-1.8],[T1,-8,-1.5]]},// the covering centre-backs, chasing
 {role:'eng',style:eng({seed:32,build:{height:1.94}}),keys:[[T0,-31,2],[T_CTRL,-26,.8],[T_SHOT,-17,.6],[0,-10.5,.8],[T1,-9.6,1]]},
 {role:'eng',style:eng({seed:33}),keys:[[T0,-29,-15],[T_CTRL,-24,-13],[T_SHOT,-16,-9],[0,-11,-6.5],[T1,-10,-6]]},
 {role:'eng',style:eng({seed:34,skin:SKIN_M}),keys:[[T0,-32,12],[T_CTRL,-27,10],[T_SHOT,-19,7],[0,-14,5],[T1,-13,5]]},
 {role:'bra',style:bra({seed:61}),keys:[[T0,-44,14],[T_CTRL,-34,12],[0,-22,9],[3,-12,10],[T1,-11,18]]},
];
const END=0,VIN=1,GK=2,LNG=3;
const TR=makeTracks(ACTORS.map(a=>a.keys),T0,T1);

// ---------------------------------------------------------------- the ball: the long ball, Vinícius's run, the shot, the save, the rebound, the tap-in
const feet=(k:number,tau:number,ahead=.6):V3=>{const[x,z]=TR.posOf(k,tau),v=TR.velOf(k,tau),n=nrm2(v[0],v[1]),sp=Math.hypot(v[0],v[1]);return[x+n[0]*ahead*clamp(sp/2),BALL_R,z+n[1]*ahead*clamp(sp/2)];};
const CTRL_PT:V3=[CTRL[0],BALL_R,CTRL[1]];
const V_LONG=launch(LONG0,CTRL_PT,T_CTRL-T_LONG,G3);
const SHOT0=():V3=>feet(VIN,T_SHOT);
function ballAt(tau:number):V3{
 if(tau<T_LONG)return LONG0;
 if(tau<T_CTRL)return flyA(LONG0,V_LONG,G3,tau-T_LONG);
 if(tau<T_SHOT){const f=feet(VIN,tau),u=sm(T_CTRL,T_CTRL+.4,tau);return mix3(CTRL_PT,f,u);}
 if(tau<T_SAVE){const u=(tau-T_SHOT)/(T_SAVE-T_SHOT);return mix3(SHOT0(),SAVE_PT,u);}
 if(tau<0){const u=(tau-T_SAVE)/(0-T_SAVE),p=mix3(SAVE_PT,TAP,1-Math.pow(1-u,1.4));p[1]=Math.max(BALL_R,lerp(SAVE_PT[1],BALL_R,u)+.9*Math.sin(Math.PI*u));return p;}
 if(tau<TS)return mix3(TAP,GOAL_PT,easeOut(tau/TS));
 if(tau<TS+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TS)/.14));
 const u=clamp((tau-TS-.14)/.5);return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u)),lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau*TAU*2.4;
const bulgeAt=(tau:number)=>tau<TS+.08?0:.7*Math.exp(-(tau-TS-.08)*2.4)*(1+.3*Math.sin((tau-TS)*14));

// ---------------------------------------------------------------- poses
const kick=(pose:ReturnType<typeof loco>,tau:number,t0:number,foot:'l'|'r',power:number,dur=.9)=>{const w=win(tau,t0-.45,t0+.5,.15);return w>0?blendPose(pose,strike(clamp((tau-t0)/dur+STRIKE_CONTACT),{foot,power}),w):pose;};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=TR.posOf(k,tau),b=ballAt(tau);let pose=loco(TR,k,tau),yaw=faceYaw(TR,k,tau,b);
 switch(a.role){
  case 'end':{pose=kick(pose,tau,0,'l',.25,.75);yaw=lerpAng(yaw,YAW_E,sm(-.45,-.12,tau)*(1-sm(.5,1,tau)));
   if(tau>.8)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4.2,{kind:'run'}),sm(.8,1.5,tau));break;}
  case 'vin':{pose=kick(pose,tau,T_SHOT,'r',.8,.9);if(tau>T_SHOT-.5&&tau<T_SHOT+.3)yaw=lerpAng(yaw,yawTo(SAVE_PT[0]-x,SAVE_PT[2]-z),win(tau,T_SHOT-.5,T_SHOT+.3,.15));
   if(tau>TS+.5)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4,{kind:'arms'}),sm(TS+.5,TS+1.1,tau)*.8);break;}
  case 'gk':{if(tau>T_DIVE-.15)pose=blendPose(pose,DIVE((tau-T_DIVE)/.8),sm(T_DIVE-.15,T_DIVE,tau));yaw=tau>T_DIVE-.4?Math.PI:yaw;
   if(tau>TS+1.4)pose=blendPose(pose,DEJECT,sm(TS+1.6,TS+2.4,tau)*.5);break;}
  case 'lng':{pose=kick(pose,tau,T_LONG,'r',1,1);if(Math.abs(tau-T_LONG)<.6)yaw=lerpAng(yaw,yawTo(CTRL[0]-x,CTRL[1]-z),win(tau,T_LONG-.6,T_LONG+.6,.2));break;}
  case 'eng':if(tau>TS+.5)pose=blendPose(pose,DEJECT,sm(TS+.8,TS+1.8,tau)*.8);break;
  case 'bra':if(tau>TS+.3)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4.2,{kind:'arms'}),sm(TS+.4,TS+1,tau)*.7);break;
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((_,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k],st=stateOf(k,tau),hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===END&&tau>-.25&&tau<.35)||(k===VIN&&Math.abs(tau-T_SHOT)<.3)||(k===GK&&tau>T_DIVE&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}
/** Wembley's arch: a 315 m span rising 133 m, leaning back over the far stand */
const ARCH:V3[]=Array.from({length:33},(_,i)=>{const u=i/32,y=133*(1-Math.pow(2*u-1,2));return[-52.5+(u-.5)*315,y,80+y*Math.tan(22*DEG)];});
function arch(s:Sheet,c:Cam){const pts:Pt[]=[];for(const p of ARCH){const q=toCam(c,p);if(q[2]<8)return;pts.push(scr(c,q));}
 const w=clamp(7.4*c.F/toCam(c,ARCH[16])[2],3,60),tube=ribbon(pts,w,{taper:.15,wobble:.4,pressure:0});s.knockout(tube,.85);s.tone(B,tube,.12);}
/** Wembley at night: red seats, England white and Brazil yellow in the crowd */
const ARENA=(roar=0,flash=0):Stadium=>({sky:'night',seats:[[R,.5],[K,.42]],crowd:[['paper',.36],[Y,.34],[B,.12],[R,.18]],fascia:[[.3,.36],[.6,.66]],roar,flash,behind:arch});
const at=(k:number,tau:number,y=1)=>TR.at(k,tau,y);

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
function tau1(t:number){const tE=CUE(0,'taps it in')+.05;return Math.max(T0+.3,t-tE);}
const P1:V3=[-30,24,-72];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-40,14,40],fov:42})],
  [CUE(0,'England against')-.3,1.3,()=>({P:P1,T:[-38,1,0],fov:24})],
  [CUE(0,'long ball')-.4,.9,()=>({P:P1,T:mix3(add3(b,[0,-b[1]*.5,0]),[-26,1,-4],.4),fov:17})],
  [CUE(0,'Vinícius')-.2,.8,()=>({P:P1,T:mix3(b,[-8,1,-2],.35),fov:12})],
  [CUE(0,'Jordan')-.2,.6,()=>({P:P1,T:mix3(b,[-5,1,-1],.4),fov:10})],
  [CUE(0,'taps')+.8,1.4,()=>({P:P1,T:mix3(at(END,tau,1.1),[-6,1,4],.3),fov:13})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tN=CUE(0,'taps')+.4;
  stadium(s,c,t,[0,1,3],ARENA(sm(tN,tN+.5,t),sm(tN,tN+.4,t)*(1-sm(tN+2.4,tN+3,t))));
  ground(s,c);
  play(s,c,tau,tp,{min:15,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'taps')+.2;},
};
// ---------------------------------------------------------------- 2 · slow replay from high behind the goal: the run, the shot, the save
const tau2=(t:number)=>key(t,mono([[0,T_CTRL-.4],[CUE(1,'races'),T_CTRL+.3],[CUE(1,'shoots'),T_SHOT-.1],[CUE(1,'keeper blocks'),T_SAVE],[CUE(1,'following in'),-.3],[SECS(1)-.2,.1]]),linear);
const E2:V3=[13,10,2];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-22,0,-3],fov:26})],
  [CUE(1,'races')-.3,.9,()=>({P:E2,T:mix3(b,at(VIN,tau,.8),.4),fov:17})],
  [CUE(1,'shoots')-.2,.8,()=>({P:E2,T:mix3(b,[-6,.5,-1.5],.5),fov:16})],
  [CUE(1,'following')-.3,.9,()=>({P:E2,T:mix3(at(END,tau,.6),TAP,.5),fov:19})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[2,3],ARENA());
  ground(s,c);
  trail(s,c,ballAt,Math.max(T_CTRL,tau-1.1),tau,1);
  groundRing(s,c,at(VIN,tau,0),.8,Y,sm(CUE(1,'races')-.3,CUE(1,'races'),t)*(1-sm(CUE(1,'following')-.4,CUE(1,'following'),t)),.14);
  groundRing(s,c,at(END,tau,0),.9,Y,sm(CUE(1,'following')-.3,CUE(1,'following')+.1,t),.16);
  const r=play(s,c,tau,tp,{smear:true,min:11});
  const hit=(tau-T_SAVE)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(40,r.ball.r*4.5),{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:8});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'keeper blocks')+.3;},
};
// ---------------------------------------------------------------- 3 · slow replay low beside the post: the ball drops at his feet, the tap-in
const tau3=(t:number)=>key(t,mono([[0,T_SHOT-.3],[CUE(2,'ball drops'),T_SAVE+.1],[CUE(2,'taps it home'),.02],[CUE(2,'Brazil win')-.3,TS+1.2],[SECS(2),TS+3.4]]),linear);
const E3:V3=[-1.2,1.4,8.4];
function cam3v(t:number):Cam{
 const tau=tau3(t),e=at(END,tau,1.1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(e,[-8,.8,0],.5),fov:26})],
  [CUE(2,'ball drops')-.3,.9,()=>({P:E3,T:mix3(TAP,e,.35),fov:17})],
  [CUE(2,'taps')-.3,.7,()=>({P:E3,T:mix3(TAP,[0,.6,.2],.72),fov:44})],
  [CUE(2,'Brazil win')-.6,1.4,()=>({P:[-1,3,9],T:e,fov:18})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tW=CUE(2,'Brazil win');
  stadium(s,c,t,[1,2,3],ARENA(sm(TS,TS+.4,tau),Math.max(sm(TS,TS+.3,tau)*(1-sm(TS+1.4,TS+2,tau)),sm(tW-.1,tW+.3,t))));
  ground(s,c);
  groundRing(s,c,TAP,.8,Y,sm(CUE(2,'ball drops')-.3,CUE(2,'ball drops'),t)*(1-sm(.05,.3,tau)),.14);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  const hit=tau/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(END,tau3(twos(t))),sk=solve(p.pose,B_END,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'taps it home')+.2;},
};
// ---------------------------------------------------------------- 4 · the lesson: follow the shot in, be ready, finish before the keeper is up
const tau4=(t:number)=>key(t,mono([[0,T_SHOT-.6],[CUE(4-1,'Be ready'),T_SAVE-.05],[CUE(3,'quick finish'),-.05],[CUE(3,'no time'),.3],[SECS(3),TS+.8]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),e=at(END,tau,1);
 return plan(t,[
  [0,0,()=>({P:[-26,6,9],T:[-10,.4,0],fov:32})],
  [CUE(3,'Be ready')-.2,1,()=>({P:[-23,4.5,8],T:mix3(e,TAP,.5),fov:22})],
  [CUE(3,'quick finish')-.2,.8,()=>({P:[-21,3.6,7],T:mix3(TAP,[-3,.5,0],.4),fov:20})],
  [CUE(3,'no time')-.2,.9,()=>({P:[-21,3.6,7],T:mix3(TAP,[PIC_AT[0],.4,PIC_AT[1]],.6),fov:24})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tA=CUE(3,'Always'),tB=CUE(3,'Be ready'),tQ=CUE(3,'quick finish'),tN=CUE(3,'no time');
  stadium(s,c,t,[0,1],ARENA(.3+.3*sm(tQ+.4,tQ+1,t)));
  ground(s,c);
  // "Always follow a shot in": a yellow arrow runs from Endrick's start along his run toward the goal
  const fa=sm(tA-.1,tA+.9,t,easeInOutSine)*(1-sm(tQ,tQ+.5,t));
  if(fa>0){const q:V3[]=[];for(let i=0;i<=10;i++){const[x,z]=TR.posOf(END,lerp(T_SHOT-.6,-.1,fa*i/10));q.push([x,.05,z]);}arrow3(s,c,q,Math.max(8,kAt(c,TAP)*.06),Y,.95);}
  // "Be ready near goal": the rebound's landing spot glows red
  groundRing(s,c,TAP,.9,R,sm(tB-.1,tB+.3,t)*(1-sm(tN+.6,tN+1.1,t)),.14);
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[END,VIN,GK,4,5]});
  if(r.ball&&tau>=0&&tau<.25)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(60,r.ball.r*4.5),{n:9,seed:29,g:easeOutBack(clamp(tau/.1))*(1-clamp((tau-.12)/.12)),width:10});
  // "no time to get up": a navy ring round the keeper on the ground, the finish arrow past him
  const nt=sm(tN-.1,tN+.3,t);
  if(nt>0){groundRing(s,c,[PIC_AT[0]-.2,0,PIC_AT[1]-1.2],1.3,K,nt,.12);const q:V3[]=[];for(let i=0;i<=6;i++)q.push(mix3(TAP,GOAL_PT,i/6*nt));arrow3(s,c,q,Math.max(9,kAt(c,TAP)*.05),Y,.95);}
  void polyP;
 },
 get still(){return CUE(3,'quick finish')+.4;},
};

const film:RisoStory={
 id:'endrick-wembley-2024',format:'11v11',title:"Endrick's Wembley winner",
 theme:'Follow every shot in and be ready near goal: a quick finish gives the keeper no time',
 ageNote:'England 0–1 Brazil, friendly, Wembley, 23 March 2024. For players of every age.',
 spec:SPEC,
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball bounces down off an unseen keeper and is tapped away with a spark. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x-120*(1-u):x+200*easeOut(out),by=age<.3?y-140*Math.sin(Math.PI*u)*.8:y-30*out;
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Checked by tests/play-film-endrick-wembley-2024.cjs (pitch metres; the attacked goal line x = 0, +z = Brazil's right). */
export const FACTS={TAP,SAVE_PT,GOAL_PT,TS,T_LONG,T_CTRL,T_SHOT,T_SAVE,ballAt,finishFoot:'l' as const,LONG0,
 endrickContact:()=>{const st=stateOf(END,0),sk=solve(st.pose,B_END,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 keeperAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_PIC,st.place);return{lHa:sk.lHa,rHa:sk.rHa};},
 vinAt:(tau:number)=>TR.posOf(VIN,tau),d3,LNG};
