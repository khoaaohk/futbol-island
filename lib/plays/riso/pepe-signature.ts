/** Pepe — SIGNATURE-MOVE DEMO: "how he defends crosses" (lib/town/iconicPlays.json, "The Euro 2016 Final Wall"; lesson: "Stay close to your
 * striker, stay on your feet and head every cross away"). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture
 * window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, on the shared broadcast-pitch kit (lib/plays/riso/broadcast-pitch.ts).
 *
 * WHY A DEMO, NOT THE MATCH: Pepe's Euro 2016 final (Portugal 1–0 France after extra time, Stade de France, Saint-Denis, 10 July 2016) was a
 * whole-match performance — he was named man of the match — not one famous play. The written accounts list many small actions (a block on
 * Payet's shot, a dispossession, a clearance that led to a corner) and even one where he was beaten (Gignac hit the post in stoppage time),
 * but no single, well-described headed clearance whose side, minute and players I could confirm. Staging one inside the named final would be
 * an invention, so — per the brief — this is a clearly labelled demo of the defending the lesson teaches (tight, goal-side marking; stay on
 * your feet; attack the cross first; head it high and wide). The narration states only the sourced fact (man of the match in the final that
 * Portugal won against France) and then says "This is how he defends crosses".
 *
 * SOURCES (Sept 2026, read as raw pages; cached in the build scratchpad cf6/):
 *  - Wikipedia, "UEFA Euro 2016 final" (raw wikitext): Portugal 1–0 France (a.e.t.), 10 July 2016, ~21:00 CEST, Stade de France, 75,868;
 *    "Man of the Match: Pepe (Portugal)" (UEFA post-match report cited); Pepe number 3 at centre-back; kit table: Portugal "Red shirts, red
 *    shorts and green socks"; the match narrative quoted above (Payet's shot blocked by Pepe; Gignac "beat Pepe and struck the ball against
 *    the inside of the Portugal goalpost").
 * CONFIRMED (narrated): Pepe was man of the match in the Euro 2016 final, which Portugal won against France.
 * INFERRED / DEMO (never claimed as a match play): the whole sequence and its positions; the winger, striker and keeper are generic and
 *   unnamed (opponents in white shirts and navy shorts, not France's kit; keeper drawn in yellow); the cross from the attackers' right; the
 *   night setting. Portugal's red/red/green kit and Pepe's number 3 are as worn in that final; Pepe's shaved head.
 *
 * FRAMING (TV grammar, never top-down): ch1 = a wide main-stand shot of the demo in real time (the winger crosses, Pepe heads it away);
 * ch2 = a low replay behind the pair (touching distance, goal side); ch3 = a side replay of the jump (on his feet, up first, forehead);
 * ch4 = the lesson with teaching marks (the touching-distance ring, the goal-side arrow, the header's escape route high and wide).
 * Inks: yellow, red, green, navy. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,polyPath,ribbon,easeOut,easeOutBack,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,keeperSet,header,blendPose,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type V3,type Build} from './athlete';
import {frame,toCam,scr,pr,kAt,stadium,ground,drawScene,tracks,plan,gnd,arrow3,groundRing,pathRibbon,estimate,mono,add3,sub3,mix3,len3,yawTo,lerpAng,nrm2,win,
 BALL_R,kickerAt,type Pal,type StadiumSpec,type Cam,type State,type Fig} from './broadcast-pitch';

// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'How he defends',text:'Pepe was the man of the match in the Euro 2016 final, when Portugal beat France. This is how he defends crosses. The winger crosses... and Pepe heads it away!',tail:2.4,
  cues:['Pepe was','man of the match','Portugal beat France','This is how','winger crosses','heads it away']},
 {label:'Touching distance',text:'Watch again. He stays close to the striker, at touching distance, always between him and the goal.',tail:1.8,
  cues:['Watch again','stays close','touching distance','always between']},
 {label:'Up first',text:'He stays on his feet, jumps first, and meets the ball with his forehead. High and wide!',tail:2.2,
  cues:['He stays on his feet','jumps first','meets the ball','forehead','High and wide']},
 {label:'Head it away',text:'Like Pepe: stay close to your striker, stay on your feet, and head every cross away.',tail:2.2,
  cues:['Like Pepe','stay close','stay on your feet','head every cross']},
];
import timingJson from '../../../public/plays/narration/pepe-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail,'pepe');return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('pepe: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, stadium
const Y='yellow',R='red',G='green',K='navy';
const PAL:Pal={Y,R,B:G,K};
/** a big bowl at night under floodlights (demo setting), a mixed crowd with red-and-green patches */
const BOWL:StadiumSpec={pal:PAL,side:46,end:14,rake:38,height:34,tiers:[.34,.68],roof:true,track:null,night:true,sky:null,seats:[[K,.4]],
 crowdInks:[R,'paper',[K,.95],G,Y],boards:K,
 crowd:(si,a,h,hb)=>hb<.35?0:hb<.65?1:hb<.85?2:h<.8?3:4};

// ---------------------------------------------------------------- the cast
const SKIN_L:InkFill[]=[[Y,.35],[R,.18]],SKIN_M:InkFill[]=[[Y,.42],[R,.26],[G,.06]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** Portugal as in the Euro 2016 final (kit table): red shirts, red shorts, green socks; paper numbers */
const por=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:G,boots:K,skin:SKIN_L,hair:K,line:K,trim:G,number:n,numberInk:'paper',hairStyle:'short',build:{height:1.82},seed:n??20,...o});
/** the demo attackers (generic, unnamed — not France's kit): white shirts, navy shorts */
const opp=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,number:null,hairStyle:'short',build:{height:1.86},seed:70,...o});
const B_PEPE:Build={height:1.88,bulk:1.06,thighs:1.06},B_STR:Build={height:1.86};
const PEPE_ST=por(3,{build:B_PEPE,skin:SKIN_M,hairStyle:'bald'});
const GK_ST:AthleteStyle={shirt:Y,shorts:Y,socks:Y,boots:K,skin:SKIN_L,hair:K,line:K,gloves:'paper',sleeves:'long',number:null,hairStyle:'short',build:{height:1.9},seed:1};

// ---------------------------------------------------------------- the demo on one clock τ (τ = 0 is the cross)
const TC=1.3,HD=.95,CU=.52;// cross flight to Pepe's forehead; header duration and its contact phase
const TJ=TC-CU*HD;// jump starts
/** the striker attacks the near side of the six-yard box; Pepe goal side of him, touching distance */
const STR:[number,number]=[-8.6,2.2],PEP:[number,number]=[-7.6,2.35];
const P0:V3=[-12.5,BALL_R,27.2];
const FACE=nrm2(P0[0]-PEP[0],P0[2]-PEP[1]),YAW_P=yawTo(FACE[0],FACE[1]);
const pepeHead=(u:number):Pose=>{const p=header(clamp(u));return p;};
/** Pepe's forehead at contact (solved) — the ball's centre a radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(pepeHead(CU),B_PEPE,{x:PEP[0],z:PEP[1],yaw:YAW_P}),d=sub3(sk.face,sk.head),l=len3(d)||1;return[sk.face[0]+d[0]/l*(BALL_R+.02),sk.face[1]+d[1]/l*(BALL_R+.02)+.02,sk.face[2]+d[2]/l*(BALL_R+.02)];})();
/** the clearance: high and wide, back toward the touchline it came from */
const OUT:V3=[-24,BALL_R,19];const TO=TC+1.9;
const fly=(A:V3,Bp:V3,d:number):V3=>[(Bp[0]-A[0])/d,(Bp[1]-A[1]+4.905*d*d)/d,(Bp[2]-A[2])/d];
const at=(A:V3,V:V3,t:number):V3=>[A[0]+V[0]*t,A[1]+V[1]*t-4.905*t*t,A[2]+V[2]*t];
const V_CROSS=fly(P0,HEAD_PT,TC),V_OUT=fly(HEAD_PT,OUT,TO-TC);
const DWC=nrm2(HEAD_PT[0]-P0[0],HEAD_PT[2]-P0[2]),PWC=kickerAt(P0,DWC,{height:1.78},'r');
type Role='pepe'|'str'|'wing'|'gk'|'por'|'opp';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-6,T1=8;
const ACTORS:Actor[]=[
 {name:'Pepe (demo)',role:'pepe',hero:true,style:PEPE_ST,keys:[[T0,-12.5,4.2],[-3,-10.4,3.6],[-1,-8.4,2.8],[TJ-.2,PEP[0],PEP[1]],[TC+1.5,PEP[0],PEP[1]],[TC+3,-9.5,4.5],[T1,-12,6]]},
 {name:'the striker (demo)',role:'str',hero:true,style:opp({build:B_STR,seed:71,skin:SKIN_D}),keys:[[T0,-13.5,4.8],[-3,-11.5,4],[-1,-9.6,3],[TJ-.1,STR[0],STR[1]],[TC+1.5,STR[0]-.2,STR[1]],[T1,-11,3]]},
 {name:'the winger (demo)',role:'wing',hero:true,style:opp({seed:72,build:{height:1.78}}),keys:[[T0,-26,29],[-2,-17,28.2],[-.3,PWC[0]-DWC[0]*.6,PWC[1]-DWC[1]*.6],[0,...PWC],[1.4,-9.6,25.2],[T1,-10,24]]},
 {name:'keeper (demo)',role:'gk',hero:true,style:GK_ST,keys:[[T0,-2,1],[TC,-2.2,2.6],[T1,-2.2,2.6]]},
 {name:'full-back (demo)',role:'por',style:por(null,{seed:21}),keys:[[T0,-22,24],[-2,-16,25.4],[0,-13.5,25.6],[T1,-12,24]]},
 // the far-side pair sits on the penalty spot, out of the low side replay's line of sight to Pepe
 {name:'centre-back (demo)',role:'por',style:por(null,{seed:22,build:{height:1.87}}),keys:[[T0,-15,-3],[-1,-13.6,-1.6],[TC,-13,-1.1],[T1,-13,-1]]},
 {name:'attacker (demo)',role:'opp',style:opp({seed:73}),keys:[[T0,-16,-4.2],[-1,-14.4,-2.8],[TC,-13.9,-2.2],[T1,-14,-2]]},
 {name:'midfielder (demo)',role:'por',style:por(null,{seed:23}),keys:[[T0,-22,8],[-1,-17,6],[TC,-16,5],[T1,-16,6]]},
];
const PEPE=0,STRK=1,WING=2,GK=3;
const TR=tracks(ACTORS,T0,T1);
const posOf=TR.posOf,distOf=TR.distOf;

// ---------------------------------------------------------------- the ball
function ballAt(tau:number):V3{
 if(tau<-.8){const p=posOf(WING,tau),v=TR.velOf(WING,tau),l=Math.hypot(v[0],v[1])||1,f=((distOf(WING,tau)/1.9)%1+1)%1,d=.42+.38*(f<.18?f/.18:1-(f-.18)/.82);return[p[0]+v[0]/l*d,BALL_R,p[1]+v[1]/l*d];}
 if(tau<0){const a=ballAt(-.81);return mix3(a,P0,easeOut((tau+.8)/.8));}
 if(tau<TC)return at(P0,V_CROSS,tau);
 if(tau<TO)return at(HEAD_PT,V_OUT,tau-TC);
 const e=tau-TO;return[OUT[0]-e*2,BALL_R+.4*Math.abs(Math.sin(e*5))*Math.exp(-e*2.5),OUT[2]+e*1.2];
}
const spinAt=(tau:number)=>tau*TAU*(tau<TC?1.6:2.4);

// ---------------------------------------------------------------- poses
function kick(pose:Pose,tau:number,tc:number,foot:'l'|'r',dur=.9,w=1):Pose{const ww=win(tau,tc-.5,tc+.7,.2)*w;return ww>0?blendPose(pose,strike(clamp((tau-tc)/dur+STRIKE_CONTACT),{foot}),ww):pose;}
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau),b=ballAt(tau);let pose=TR.loco(k,tau),yaw=TR.faceYaw(k,tau,b);
 switch(a.role){
  case 'pepe':{// shadowing the striker, eyes on the ball; the header: on his feet until the jump, up first, forehead through the ball
   if(tau>TJ-.3&&tau<TJ+HD+.5){const w=sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.5,tau));pose=blendPose(pose,pepeHead((tau-TJ)/HD),w);yaw=lerpAng(yaw,YAW_P,w>0?1:0);}
   if(tau>TJ-.6&&tau<TJ)yaw=lerpAng(yaw,YAW_P,sm(TJ-.6,TJ-.2,tau));break;}
  case 'str':{// jumps late and lower — beaten to it
   const tj=TJ+.12;if(tau>tj-.3&&tau<tj+HD+.5){const hp=header(clamp((tau-tj)/HD));hp.air*=.6;pose=blendPose(pose,hp,sm(tj-.3,tj,tau)*(1-sm(tj+HD,tj+HD+.5,tau)));}
   yaw=TR.faceYaw(k,Math.min(tau,TC),ballAt(Math.min(tau,TC)));break;}
  case 'wing':pose=kick(pose,tau,0,'r',.85);{const w=sm(-.5,-.15,tau)*(1-sm(.5,1,tau));yaw=lerpAng(yaw,yawTo(DWC[0],DWC[1]),w);}break;
  case 'gk':pose=keeperSet(tau*1.3);yaw=TR.faceYaw(k,tau,b);break;
  default:break;
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;cap?:number}={}){
 const figs:Fig[]=ACTORS.map((a,k)=>{const hero=!!a.hero;return{st:stateOf(k,tau),prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===PEPE&&tau>TJ&&tau<TC+.3)||(k===WING&&tau>-.25&&tau<.35))};});
 return drawScene(s,c,PAL,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:0,bz:0},o.cap);
}
const atA=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · the wide main-stand shot, real time
function tau1(t:number){const tT=CUE(0,'This is how'),tW=CUE(0,'winger crosses')+.2,tH=CUE(0,'heads it away')+.1,S=SECS(0);
 return key(t,mono([[0,Math.max(T0+.2,-2.5-tT*.5)],[tT,-2.5],[tW,0],[tH,TC],[S+1,TC+S+1-tH]]),linear);}
const P1:V3=[-16,22,-72];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-10,0,10],fov:16})],
  [CUE(0,'This is how')-.3,1,()=>({P:P1,T:mix3(gnd(b,1),atA(PEPE,tau,1),.5),fov:14})],
  [CUE(0,'winger crosses')-.2,.8,()=>({P:P1,T:mix3(add3(gnd(b),[0,.8+.3*b[1],0]),[PEP[0],1.6,PEP[1]],.4+.5*sm(0,TC,tau)),fov:11})],
  [CUE(0,'heads it away')+.2,1,()=>({P:P1,T:mix3(gnd(b,1),[PEP[0],1,PEP[1]],.5),fov:13})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12);
  stadium(s,c,BOWL,t,[0,1,3],{roar:.3*sm(TC,TC+.4,tau)});
  ground(s,c,BOWL);
  play(s,c,tau,tp,{min:17,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'heads it away')+.1;},
};

// ---------------------------------------------------------------- 2 · low replay behind the pair: touching distance, goal side
const tau2=(t:number)=>key(t,mono([[0,-3],[CUE(1,'stays close'),-2],[CUE(1,'touching distance'),-1.2],[CUE(1,'always between'),-.4],[SECS(1),TJ-.1]]),linear);
const E2:V3=[1,1.7,-15];// wide of the near post, so the goal frame never stands between the lens and the pair
function cam2(t:number):Cam{
 const tau=tau2(t),pe=atA(PEPE,tau,1.2),st=atA(STRK,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(pe,st,.5),fov:19})],
  [CUE(1,'touching distance')-.3,1,()=>({P:add3(E2,[-1.5,0,1.5]),T:mix3(pe,st,.5),fov:14})],
  [CUE(1,'always between')-.3,1,()=>({P:add3(E2,[-.5,.3,.5]),T:mix3(pe,[0,1,0],.25),fov:22})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tT=CUE(1,'touching distance'),tA=CUE(1,'always between');
  stadium(s,c,BOWL,t,[3,2]);
  ground(s,c,BOWL);
  // "touching distance": a yellow ring around the pair; "always between him and the goal": a line striker → Pepe → goal
  const tr=sm(tT-.2,tT+.3,t);if(tr>0){const m=mix3(atA(PEPE,tau,0),atA(STRK,tau,0),.5);groundRing(s,c,m,1.1,Y,tr);}
  const ab=sm(tA-.2,tA+.4,t);if(ab>0){const a=atA(STRK,tau,.02),e:V3=[lerp(a[0],-.4,sm(tA,tA+.8,t)),.02,lerp(a[2],.5,sm(tA,tA+.8,t))];arrow3(s,c,K,[a,mix3(a,e,.5),e],Math.max(6,kAt(c,a)*.07),R,.9*ab);}
  play(s,c,tau,tp,{min:12,cap:2});
 },
 aperture(t){const c=cam2(t),st=stateOf(PEPE,tau2(twos(t))),sk=solve(st.pose,B_PEPE,st.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(1,'touching distance')+.4;},
};

// ---------------------------------------------------------------- 3 · side replay of the jump: on his feet, up first, forehead, high and wide
const tau3=(t:number)=>key(t,mono([[0,TC-1.3],[CUE(2,'He stays on'),TJ-.3],[CUE(2,'jumps first'),TJ+.1],[CUE(2,'meets the ball'),TC-.05],[CUE(2,'forehead'),TC+.05],[CUE(2,'High and wide'),TC+.6],[SECS(2),TC+1.8]]),linear);
/** side-on from the goal-line side (perpendicular to the pair) */
const E3:V3=[PEP[0]+3,1.5,PEP[1]-8.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),pe=atA(PEPE,tau,1.6);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(pe,atA(STRK,tau,1.4),.4),fov:30})],
  [CUE(2,'jumps first')-.3,.8,()=>({P:add3(E3,[-.5,.2,1.5]),T:[HEAD_PT[0],HEAD_PT[1]-.5,HEAD_PT[2]],fov:24})],
  [CUE(2,'High and wide')-.2,1,()=>({P:add3(E3,[-1,.5,0]),T:mix3([HEAD_PT[0],2,HEAD_PT[2]],ballAt(tau),.5),fov:36})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tF=CUE(2,'He stays on');
  stadium(s,c,BOWL,t,[0,3]);
  ground(s,c,BOWL);
  // "stays on his feet": both boots ringed on the grass until the jump
  const sf=win(t,tF-.1,CUE(2,'jumps first')+.2,.2);if(sf>0)groundRing(s,c,atA(PEPE,tau,0),.55,Y,sf);
  if(tau>TC){const pts:V3[]=[];for(let i=0;i<=14;i++)pts.push(ballAt(lerp(TC,Math.min(tau,TO),i/14)));pathRibbon(s,c,pts,Y,1-sm(TO,TO+.5,tau),.2);}
  const r=play(s,c,tau,tp,{smear:true,min:12,lines:true,prevBall:tau3(t-.06),cap:2});
  const hit=(tau-TC)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4),{n:9,seed:29,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),P=ballAt(tau3(twos(t))),q=pr(c,P)??[0,0];return apertureDisc(q[0],q[1],50,12);},
 get still(){return CUE(2,'forehead')+.1;},
};

// ---------------------------------------------------------------- 4 · the lesson: close, on your feet, head it away
const tau4=(t:number)=>key(t,mono([[0,-1.5],[CUE(3,'stay close'),-.6],[CUE(3,'stay on your feet'),TJ-.1],[CUE(3,'head every cross'),TC],[SECS(3),TC+.9]]),linear);
const E4:V3=[-24,6,-6];
function cam4v(t:number):Cam{
 const tau=tau4(t),pe=atA(PEPE,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E4,T:mix3(pe,[-4,.5,4],.3),fov:28})],
  [CUE(3,'head every cross')-.3,1,()=>({P:add3(E4,[2,1,2]),T:mix3(pe,[-14,2,12],.35),fov:34})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tC=CUE(3,'stay close'),tF=CUE(3,'stay on your feet'),tH=CUE(3,'head every cross');
  stadium(s,c,BOWL,t,[0,3]);
  ground(s,c,BOWL);
  const cl=sm(tC-.2,tC+.3,t);if(cl>0){const m=mix3(atA(PEPE,tau,0),atA(STRK,tau,0),.5);groundRing(s,c,m,1.1,Y,cl);}
  const ft=win(t,tF-.2,tH,.2);if(ft>0)groundRing(s,c,atA(PEPE,tau,0),.55,R,ft);
  const hd=sm(tH-.1,tH+.5,t);if(hd>0){const pts:V3[]=[];const u=sm(tH,tH+1,t);for(let i=0;i<=10;i++)pts.push(ballAt(TC+(TO-TC)*u*i/10));arrow3(s,c,K,pts,Math.max(7,kAt(c,HEAD_PT)*.07),Y,.95*hd);}
  play(s,c,tau,tp,{min:13,cap:2});
 },
 get still(){return CUE(3,'stay on your feet')+.4;},
};

const film:RisoStory={
 id:'pepe-signature',format:'11v11',title:'Pepe: how he defends',
 theme:'Stay close to your striker, stay on your feet and head every cross away',
 ageNote:'Signature-move demo (not a specific match). Fact: man of the match, Euro 2016 final, Portugal 1–0 France, 10 July 2016.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball drops onto the point and is headed away high in a yellow arc. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const d=clamp(age/.3),u=clamp((age-.3)/.45),fade=1-clamp((age-.6)/.2),bx=x-90*(1-d)+150*u,by=y-90*(1-d)-160*Math.sin(Math.PI*u*.6);
  if(age>.28&&age<.45)sparkBurst(s,Y,x,y,70,{n:7,seed,width:10,g:fade});
  footballPanels(s,bx,by,24,{rot:age*12+r()*TAU,key:K,shadow:G,seed:5});
 },
};
export default film;
/** Demo geometry (pitch metres; the attacked (Portugal) goal line x = 0, +z = the attackers' right) — checked by tests/play-film-pepe-signature.cjs. */
export const FACTS={P0,HEAD_PT,OUT,TC,TJ,TO,ballAt,demo:true as const,
 pepe:(tau:number)=>{const st=stateOf(PEPE,tau),sk=solve(st.pose,B_PEPE,st.place);return{face:sk.face,head:sk.head,air:st.pose.air,pelvis:sk.pelvis};},
 striker:(tau:number)=>{const st=stateOf(STRK,tau),sk=solve(st.pose,B_STR,st.place);return{head:sk.head,air:st.pose.air,pelvis:sk.pelvis};},
 wingerContact:()=>{const st=stateOf(WING,0),sk=solve(st.pose,{height:1.78},st.place);return{rToe:sk.rToe};},
 posOf:(k:number,tau:number)=>posOf(k,tau)};
