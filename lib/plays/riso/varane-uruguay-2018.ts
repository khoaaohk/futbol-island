/** Raphaël Varane's glancing header — Uruguay 0–2 France, FIFA World Cup quarter-final, Friday 6 July 2018, Nizhny Novgorod Stadium.
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx). A reconstruction
 * of the goal from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print. Shared kit: ./broadcast3d.ts.
 *
 * SOURCES (read Sept 2026 with curl, cached in the build scratchpad kd-films/src/):
 *  - Wikipedia, "2018 FIFA World Cup knockout stage" (raw wikitext; cites FIFA "Clinical Bleus end Uruguay's dream", 6 July 2018, and the
 *    FIFA match report / tactical line-up PDFs): "Five minutes before the break, Antoine Griezmann's inswinging free kick from the right was
 *    met by Raphaël Varane, who headed the ball into the bottom left corner"; Varane {{goal|40}}; 6 July 2018; Nizhny Novgorod Stadium;
 *    attendance 43,319; referee Néstor Pitana; Varane No. 4; kits: Uruguay home pattern (sky-blue shirt), black shorts, black socks; France
 *    away (white shirt, white shorts, white socks). Griezmann 61' made it 2–0.
 *  - BBC Sport, "France beat Uruguay 2–0 to reach semi-final", 6 July 2018: "Raphael Varane headed France into a first-half lead from a
 *    free-kick that came straight off the training field, with Antoine Griezmann checking his run before delivering the perfect cross for
 *    the Real Madrid defender to glance home"; "Varane's goal was his third for France, with all three of them being headers".
 * CONFIRMED: date, venue, 0–0 until the 40th minute; the free kick from the RIGHT, an IN-SWINGER, Griezmann (left-footed — his shots in this
 *  match are described as left-footed) checking his run before he crosses; Varane GLANCES it home into the BOTTOM LEFT corner (from the
 *  attacker's view: the far corner from a right-sided delivery); France lead 1–0; kits as above.
 * INFERRED (illustrative, never claimed in the narration): every position, run and timing (the free kick ≈ 31 m from goal and ≈ 23 m in
 *  from the right touchline, ≈ 1.3 s flight; Varane arriving from deep to meet it ≈ 8.5 m out, just right of centre; the glance ≈ .5 s to
 *  the line); Muslera's keeper kit (printed yellow) and his late dive; the number and placement of the other players and the wall; which end
 *  and which side the main camera was on; hair; the late-afternoon daylight (17:00 local kick-off); crowd colours; camera placements.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (bowl → the far flank free kick → the stutter and
 * the cross → the glance → the celebration); ch2 = slow replay LOW BEHIND GRIEZMANN looking down the in-swinger into the box (the check in
 * the run, the bend, Varane's run from deep); ch3 = a second replay LOW BESIDE THE FAR (LEFT) POST: the glance skims past Muslera into the
 * bottom corner at the camera; ch4 = the lesson from behind the penalty area: lit footprints of the timed run, a ring on the forehead, the
 * glance arrow to the far corner. Composed on the FULL sheet. Handedness: right-handed world, France attack +x, +z = France's RIGHT, so the
 * right-sided free kick is +z and the bottom LEFT corner is z < 0; Griezmann strikes with strike({foot:'l'}); Muslera faces −x so his dive to
 * his RIGHT (side 'r') goes to −z. Poses on twos, cameras on ones; all randomness seeded. */
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,stand,keeperSet,keeperDive,celebrate,header,blendPose,STRIKE_CONTACT,type Pose,type AthleteStyle,type V3,type Build} from './athlete';
import {type NarrationTiming} from './timing';
import timingJson from '../../../public/plays/narration/varane-uruguay-2018/timing.json';
import {Y,R,B,K,SPEC,DEG,add3,sub3,mix3,d3,yawTo,nrm2,lerpAng,buildChapters,mono,frame,toCam,scr,pr,kAt,polyP,stadium,ground,makeTracks,loco,faceYaw,win,DEJECT,
 drawScene,plan,arrow3,groundRing,trail,launch,flyA,G3,GRAV,BALL_R,SKIN_L,SKIN_M,SKIN_D,type Fig,type State,type Cam,type Stadium} from './broadcast3d';

// ---------------------------------------------------------------- narration + timing
const SCRIPT=[
 {label:'Nizhny Novgorod, 2018',text:'Nizhny Novgorod, 2018, a World Cup quarter-final. France against Uruguay. Antoine Griezmann stands over a free kick on the right. He stops, curls it in... Raphaël Varane glances it home!',tail:2.2,
  cues:['Nizhny Novgorod','World Cup','France against Uruguay','Antoine Griezmann','free kick','He stops','curls it in','Raphaël Varane','glances it home']},
 {label:'Watch it again',text:'Watch again. Griezmann checks his run. The ball bends in towards goal. Varane times his run from deep and gets there first.',tail:1.6,
  cues:['Watch again','checks his run','bends in','times his run','gets there first']},
 {label:'The glance',text:'From beside the post, see his forehead flick it. The ball skims into the bottom corner. France lead, one–nil!',tail:2,
  cues:['From beside','forehead flick','skims','bottom corner','France lead']},
 {label:'Time your run',text:'At a free kick, time your run. Attack the ball with your forehead. Glance it to the far corner.',tail:2,
  cues:['At a free kick','time your run','Attack the ball','forehead','far corner']},
];
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const {CHAPTERS,CUE,SECS}=buildChapters('varane',SCRIPT,VOICE);

// ---------------------------------------------------------------- the cast (kits sourced: Uruguay sky blue / black / black; France all white)
const uru=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.5],shorts:[K,.92],socks:[K,.9],boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.8],numberInk:[K,.9],hairStyle:'short',build:{height:1.83,bulk:1.02},...o});
const fra=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[B,.8],numberInk:[B,.9],hairStyle:'short',build:{height:1.8,bulk:1},...o});
const B_VAR:Build={height:1.91,bulk:1},B_GRI:Build={height:1.76,bulk:.92},B_MUS:Build={height:1.9,bulk:1};
const VAR_ST=fra({number:4,skin:SKIN_D,hair:[K,.95],build:B_VAR,seed:4});
const GRI_ST=fra({number:7,hair:[Y,.55],build:B_GRI,seed:7});
const MUS_ST:AthleteStyle={shirt:[Y,.95],shorts:[K,.9],socks:[Y,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:B_MUS,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (τ = 0 is Griezmann's contact)
/** the free kick flies TF s to Varane's head; the glance reaches the goal line at TG */
const TF=1.3,TG=TF+.5;
/** Varane's header spot (pelvis) ≈ 8.5 m out, just right of centre; he faces up and across toward the ball's side, and the glance is a
 * turn of the head to his LEFT (toward the far corner). */
const HP:[number,number]=[-8.5,1.3],FACE:[number,number]=nrm2(.62,.78),YAW_H=yawTo(FACE[0],FACE[1]);
function varHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.08;const w=Math.sin(Math.PI*clamp((u-.3)/.42)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(-.12,.55,sn)*w;p.twist+=lerp(-.06,.22,sn)*w;p.neckP-=.2*w;return p;}
const CU=.47,HD=1.0,TJ=TF-CU*HD;
const HEAD_PT:V3=(()=>{const sk=solve(varHeader(CU),B_VAR,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.03,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the free-kick spot: out on the right (+z) */
const P0:V3=[-24,BALL_R,21];
/** a left-footer's in-swinger from the right: a steady sideways pull toward the goal line (+x) on top of gravity */
const SWING:V3=[2.4,-GRAV,-.6];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_G=yawTo(DC[0],DC[1]);
/** Griezmann's pelvis at contact so his LEFT boot meets the back of the ball */
const PCG:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),B_GRI,{x:0,z:0,yaw:YAW_G});return[P0[0]-DC[0]*.12-sk.lToe[0],P0[2]-DC[1]*.12-sk.lToe[2]];})();
/** a left-footer's run-up: from behind the ball and to its RIGHT */
const RIGHT_G:[number,number]=[-DC[1],DC[0]];
const kp=(u:number,side=0):[number,number]=>[PCG[0]+DC[0]*u+RIGHT_G[0]*side,PCG[1]+DC[1]*u+RIGHT_G[1]*side];
/** the glance: across and down into the bottom LEFT (−z) corner */
const GOAL_PT:V3=[0,.32,-2.95],NET_HIT:V3=[1.7,.3,-3.1],REST:V3=[1.2,BALL_R,-2.9];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5);return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u)),lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*5:TF*TAU*5+(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- tracks (illustrative, see header)
type Role='var'|'gri'|'gk'|'fra'|'uru'|'wall';
type Actor={role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-9,T1=12;
/** the wall: two sky-blue shirts 9.15 m from the ball toward goal */
const WALL=(i:number):[number,number]=>{const g=nrm2(-P0[0],-P0[2]),n:[number,number]=[-g[1],g[0]];return[P0[0]+g[0]*9.15+n[0]*(i-.5)*.62,P0[2]+g[1]*9.15+n[1]*(i-.5)*.62];};
const toVar=(x:number,z:number,k:number):number[][]=>[[TG+.5+k*.2,x,z],[TG+4+k*.3,lerp(x,-10,.5),lerp(z,12,.5)],[T1,lerp(x,-12,.7),lerp(z,16,.7)]];
const ACTORS:Actor[]=[
 {role:'var',hero:true,style:VAR_ST,keys:[[T0,-17.5,-1.5],[-3,-17,-1],[-1,-16.4,-.4],[TJ-1.1,-12.4,.6],[TJ-.28,HP[0],HP[1]],[TF+.45,HP[0],HP[1]],[TF+1.4,-10.6,5],[TF+3.4,-13,12],[TF+6.2,-15.5,17],[T1,-16,18.5]]},
 {role:'gri',hero:true,style:GRI_ST,keys:[[T0,...kp(-4.2,.8)],[-2.4,...kp(-4.2,.8)],[-1.5,...kp(-1.9,.5)],[-.75,...kp(-1.55,.45)],[0,...kp(0)],[.7,...kp(1)],[3,...kp(3.2)],[T1,-16,16]]},
 {role:'gk',hero:true,style:MUS_ST,keys:[[T0,-.9,.9],[0,-1,.8],[TF-.3,-1.1,.5],[T1,-1,.4]]},
 {role:'wall',style:uru({seed:31,skin:SKIN_M}),keys:[[T0,...WALL(0)],[T1,...WALL(0)]]},
 {role:'wall',style:uru({seed:32,build:{height:1.86}}),keys:[[T0,...WALL(1)],[T1,...WALL(1)]]},
 {role:'uru',style:uru({seed:41,build:{height:1.88}}),keys:[[T0,-9.8,-.4],[0,-9.6,-.2],[TF,-8.9,.2],[T1,-8.4,.4]]},
 {role:'uru',style:uru({seed:42,skin:SKIN_M}),keys:[[T0,-10.5,3.8],[0,-10.2,3.6],[TF,-9,2.6],[T1,-8.6,2.2]]},
 {role:'uru',style:uru({seed:43,build:{height:1.9}}),keys:[[T0,-9.6,-4.2],[0,-9.4,-4],[TF,-8.3,-3.4],[T1,-7.8,-3]]},
 {role:'uru',style:uru({seed:44}),keys:[[T0,-6,5.6],[0,-6.2,5.4],[TF,-5.6,4.4],[T1,-5.2,3.8]]},
 {role:'uru',style:uru({seed:45,skin:SKIN_M,build:{height:1.8}}),keys:[[T0,-14.5,2],[0,-14.2,1.6],[TF,-12.6,1.4],[T1,-11.8,1.2]]},
 {role:'fra',style:fra({seed:61,skin:SKIN_D,build:{height:1.9,bulk:1.06}}),keys:[[T0,-11.6,-3.8],[-1,-11.2,-3.6],[TF,-8.6,-2.6],...toVar(-8,-2.2,0)]},
 {role:'fra',style:fra({seed:62,skin:SKIN_M}),keys:[[T0,-11.8,4.8],[-1,-11.4,4.4],[TF,-8.8,3.6],...toVar(-8.2,3.2,1)]},
 {role:'fra',style:fra({seed:63,build:{height:1.86}}),keys:[[T0,-7,-6.4],[-1,-6.8,-6],[TF,-5.6,-5],...toVar(-5.4,-4.6,2)]},
];
const VAR=0,GRI=1,GK=2;
const TR=makeTracks(ACTORS.map(a=>a.keys),T0,T1);

// ---------------------------------------------------------------- poses
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'r',height:.15}),T_DIVE=TF+.1,DIVE_L=.95;
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=TR.posOf(k,tau);let pose=loco(TR,k,tau),yaw=faceYaw(TR,k,tau,ballAt(tau));
 switch(a.role){
  case 'var':{
   if(tau<-.3)yaw=faceYaw(TR,k,tau,P0);
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD;pose=blendPose(pose,varHeader(u),sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4.2,{kind:'run'}),sm(TJ+HD+.1,TJ+HD+.8,tau));}
   const w=sm(TJ-.6,TJ-.15,tau)*(1-sm(TF+.5,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'gri':{
   // the check: he stops for a beat on the way in (sourced), then strikes with his LEFT foot
   const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'l'}),w);
   if(tau>-1.5&&tau<-.75)pose=blendPose(pose,stand(),win(tau,-1.5,-.75,.2)*.8);
   yaw=lerpAng(yaw,YAW_G,sm(-2.6,-1.8,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(TR,k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.6)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4,{kind:'arms'}),sm(TG+.6,TG+1.2,tau)*.8);
   break;}
  case 'gk':{pose=keeperSet(tau*1.3);
   if(tau>T_DIVE-.15)pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.6);
   yaw=faceYaw(TR,k,Math.min(tau,TF-.1),ballAt(Math.min(tau,TF-.1)));if(tau>TF-.1)yaw=lerpAng(yaw,Math.PI,sm(TF-.1,TF+.1,tau));break;}
  case 'wall':{yaw=yawTo(P0[0]-x,P0[2]-z);if(tau>-.1&&tau<.9){const hp=header(clamp((tau+.1)/1.0));hp.air*=.35;pose=blendPose(pose,hp,win(tau,-.1,.9,.2)*.8);}break;}
  case 'uru':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(TR,k,TF+.2,ballAt(TF+.2));break;
  case 'fra':if(tau>TG+.3)pose=blendPose(pose,celebrate(TR.distOf(k,tau)/4.2,{kind:'arms'}),sm(TG+.4,TG+1,tau)*.7);break;
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((_,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k],st=stateOf(k,tau),hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===VAR&&tau>TJ&&tau<TF+.3)||(k===GRI&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}
/** Nizhny Novgorod in the late afternoon: pale sky, blue-and-white seats, sky-blue Uruguay and blue-white-red France fans */
const ARENA=(roar=0,flash=0):Stadium=>({sky:'day',seats:[[B,.3]],crowd:[['paper',.36],[B,.34],[R,.16],[K,.14]],roar,flash});
const at=(k:number,tau:number,y=1)=>TR.at(k,tau,y);

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
function tau1(t:number){const tH=CUE(0,'Raphaël Varane')+.4;return Math.max(T0+.5,t-(tH-TF));}
const P1:V3=[-26,22,-66];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-26,9,30],fov:38})],
  [CUE(0,'France against')-.3,1.3,()=>({P:P1,T:[-14,1,8],fov:16})],
  [CUE(0,'Antoine')-.4,1,()=>({P:P1,T:mix3(at(GRI,tau,.9),P0,.3),fov:7})],
  [CUE(0,'He stops')-.3,.8,()=>({P:P1,T:mix3(at(GRI,tau,.9),P0,.4),fov:8})],
  [CUE(0,'Raphaël')-TF-.25,.6,()=>({P:P1,T:mix3(add3(b,[0,.6,0]),[HP[0],1.6,HP[1]],.25+.6*sm(0,TF,tau)),fov:lerp(10,14,sm(0,.9,tau))})],
  [CUE(0,'Raphaël')-.1,.7,()=>({P:P1,T:[HP[0]+2.5,1.2,HP[1]-1.6],fov:8})],
  [CUE(0,'glances')+.6,1.4,()=>({P:P1,T:mix3(at(VAR,tau,1.1),[-8,1,4],.3),fov:12})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tN=CUE(0,'Raphaël')+.5;
  stadium(s,c,t,[0,1,3],ARENA(sm(tN,tN+.5,t),sm(tN,tN+.4,t)*(1-sm(tN+2.4,tN+3,t))));
  ground(s,c);
  play(s,c,tau,tp,{min:16,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Raphaël')+.4;},
};
// ---------------------------------------------------------------- 2 · slow replay: low behind Griezmann, down the in-swinger
const tau2=(t:number)=>key(t,mono([[0,-2.6],[CUE(1,'checks'),-1.3],[CUE(1,'bends in'),.1],[CUE(1,'times his run'),TJ-.6],[CUE(1,'gets there first'),TF-.05],[SECS(1)-.2,TG+.3]]),linear);
const E2:V3=[P0[0]-DC[0]*7-RIGHT_G[0]*.6,2.6,P0[2]-DC[1]*7-RIGHT_G[1]*.6];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E2,T:add3(P0,[DC[0]*6,.9,DC[1]*6]),fov:30})],
  [CUE(1,'checks')-.3,.9,()=>({P:E2,T:add3(mix3(at(GRI,tau,1),P0,.4),[DC[0]*2,.3,DC[1]*2]),fov:24})],
  [CUE(1,'bends in')-.2,1,()=>({P:E2,T:mix3(add3(b,[0,.3,0]),[HP[0],1.5,HP[1]],.45),fov:13})],
  [CUE(1,'times his run')-.2,.9,()=>({P:E2,T:mix3(at(VAR,tau,1.3),b,.3),fov:9.5})],
  [CUE(1,'gets there first')-.2,.8,()=>({P:add3(E2,[0,.3,0]),T:mix3(HEAD_PT,[-4,1.2,-1],.2+.4*sm(TF,TG,tau)),fov:lerp(7.5,11,sm(TF,TG,tau))})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,2,3],ARENA(sm(TG,TG+.4,tau),sm(TG+.05,TG+.3,tau)));
  ground(s,c);
  trail(s,c,ballAt,Math.max(0,tau-.8),Math.min(tau,TG),1-sm(TG+.1,TG+.5,tau));
  // the replay graphic: a yellow ring under Varane's feet ("that's him") until he takes off
  groundRing(s,c,at(VAR,tau,0),.8,Y,sm(CUE(1,'times')-.3,CUE(1,'times')+.1,t)*(1-sm(TJ-.1,TJ+.1,tau)),.16);
  const r=play(s,c,tau,tp,{smear:true,min:10});
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'gets there first')+.1;},
};
// ---------------------------------------------------------------- 3 · replay beside the far (left) post: the glance skims in at us
const tau3=(t:number)=>key(t,mono([[0,TJ-.7],[CUE(2,'forehead'),TF+.02],[CUE(2,'skims'),TF+.3],[CUE(2,'bottom corner'),TG+.12],[CUE(2,'France lead')-.3,TG+2],[SECS(2),TG+4.6]]),linear);
const E3:V3=[-1.2,1.9,-10.6];
function cam3v(t:number):Cam{
 const tau=tau3(t),v=at(VAR,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E3,T:[HP[0]+.3,1.7,HP[1]-.4],fov:17})],
  [CUE(2,'forehead')-.3,.8,()=>({P:E3,T:[HEAD_PT[0]+.2,HEAD_PT[1]-.1,HEAD_PT[2]-.3],fov:11})],
  [CUE(2,'skims')-.2,.9,()=>({P:E3,T:[-3,.8,-1.6],fov:30})],
  [CUE(2,'bottom corner')+.2,1.1,()=>({P:E3,T:[-2,.6,-2.2],fov:34})],
  [CUE(2,'France lead')-.8,1.6,()=>({P:[-2,4,-12],T:v,fov:16})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tF=CUE(2,'France lead');
  stadium(s,c,t,[1,2,3],ARENA(sm(TG,TG+.4,tau),Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tF-.1,tF+.3,t))));
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06)});
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.3,TG+.8,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(VAR,tau3(twos(t))),sk=solve(p.pose,B_VAR,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'skims')+.2;},
};
// ---------------------------------------------------------------- 4 · the lesson: behind the penalty area, a slow replay with teaching marks
const tau4=(t:number)=>key(t,mono([[0,-1.4],[CUE(3,'time your run'),TJ-1.2],[CUE(3,'Attack the ball'),TJ-.1],[CUE(3,'forehead'),TF-.04],[CUE(3,'far corner'),TF+.12],[SECS(3),TG+.4]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(VAR,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:[-24,5.4,-8],T:[-9,.6,1],fov:34})],
  [CUE(3,'time your run')-.2,1,()=>({P:[-22,4,-7],T:mix3(w,[HP[0],1,HP[1]],.5),fov:24})],
  [CUE(3,'Attack the ball')-.2,.9,()=>({P:[-19,3,-5],T:[HP[0],1.8,HP[1]],fov:18})],
  [CUE(3,'forehead')-.2,.7,()=>({P:[-18,2.8,-4.6],T:HEAD_PT,fov:12})],
  [CUE(3,'far corner')-.2,1,()=>({P:[-19,3.4,-5],T:[-4,1,-1.2],fov:30})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tA=CUE(3,'At a free'),tR=CUE(3,'time your run'),tB=CUE(3,'Attack the ball'),tH=CUE(3,'forehead'),tC=CUE(3,'far corner');
  stadium(s,c,t,[0,1,3],ARENA(.3+.3*sm(tC+.3,tC+.9,t)));
  ground(s,c);
  // "At a free kick": the ball's spot glows out on the right
  groundRing(s,c,P0,1.1,R,sm(tA-.1,tA+.4,t)*(1-sm(tR+1,tR+1.5,t)));
  // "time your run": his footprints light up in order, from deep to the meeting point
  const run=sm(tR-.2,tR+.3,t)*(1-sm(tC,tC+.6,t));
  if(run>0){const dim=new Path2D(),lit=new Path2D();for(let k=0;k<9;k++){const Tk=TJ-1.6+k*(1.4/8),[x,z]=TR.posOf(VAR,Tk),v=TR.velOf(VAR,Tk),n=nrm2(-v[1],v[0]),side=k%2?.14:-.14,pts:Pt[]=[];
    for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[x+n[0]*side+Math.cos(a)*.16,.01,z+n[1]*side+Math.sin(a)*.1]);if(p)pts.push(p);}(Tk<=tau+.02?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*run);s.stroke(K,lit,5,.9*run);s.knockout(lit,run);s.fill(Y,lit,.95*run);}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[VAR,GK,5,6]});
  // "Attack the ball": an arrow from his feet up to the meeting point
  const ab=sm(tB-.1,tB+.4,t)*(1-sm(tH+.2,tH+.6,t));
  if(ab>0){const f=at(VAR,Math.min(tau,TJ-.2),.3);arrow3(s,c,[f,mix3(f,HEAD_PT,.5*ab),mix3(f,HEAD_PT,.92*ab)],Math.max(9,kAt(c,HEAD_PT)*.06),R,.95*ab);}
  // "forehead": a ring on the ball at his forehead and a spark
  const fh=sm(tH-.15,tH+.2,t)*(1-sm(tC+.3,tC+.8,t));
  if(fh>0&&r.ball){const g=r.ball.g,rr=r.ball.r*1.9,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}
   const rp=ribbon(ring,Math.max(5,r.ball.r*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp,.9*fh);s.fill(Y,rp,.95*fh);}
  // "far corner": the glance arrow across the goal to the bottom corner, the corner itself lit
  const fc=sm(tC-.1,tC+.9,t,easeInOutSine);
  if(fc>0){const q:V3[]=[];for(let i=0;i<=8;i++)q.push(flyA(HEAD_PT,V_HEAD,G3,(TG-TF)*fc*i/8));arrow3(s,c,q,Math.max(9,kAt(c,HEAD_PT)*.05),Y,.95);
   const zone=polyP(c,[[.02,.02,-3.6],[.02,1,-3.6],[.02,1,-2.2],[.02,.02,-2.2]]);if(zone.length>2){const zp=polyPath(zone,true);s.knockout(zp,.4*fc);s.tone(Y,zp,.45*fc);}}
 },
 get still(){return CUE(3,'forehead')+.3;},
};

const film:RisoStory={
 id:'varane-uruguay-2018',format:'11v11',title:"Varane's glancing header",
 theme:'At a free kick, time your run and attack the ball with your forehead — a glance can send it into the far corner',
 ageNote:'Uruguay 0–2 France, World Cup quarter-final, Nizhny Novgorod, 6 July 2018. For players of every age.',
 spec:SPEC,
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball swings in from one side, a yellow spark where it is met, and it glances away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.3),out=clamp((age-.3)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.3?x+200*(1-u):x-190*easeOut(out),by=age<.3?y-60*(1-u)*(1-u):y+50*out;
  if(age>.26&&age<.6)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.26)/.12))*(1-clamp((age-.46)/.14)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; the attacked goal line x = 0, +z = France's right) — checked by tests/play-film-varane-uruguay-2018.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,ballAt,kickFoot:'l' as const,
 griezmannContact:()=>{const st=stateOf(GRI,0),sk=solve(st.pose,B_GRI,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 varaneAt:(tau:number)=>{const st=stateOf(VAR,tau),sk=solve(st.pose,B_VAR,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 keeperAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_MUS,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};},
 d3};
void DEG;void R;
