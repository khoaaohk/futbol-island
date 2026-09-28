/** Elliot Anderson — SIGNATURE-MOVE DEMO: "win it and drive forward" (lib/town/iconicPlays.json, kind:"signature", interception_counter;
 * lesson: "Win the ball, lift your head and carry it forward into the space in front of you"). An iconic-play riso film (RisoStory,
 * chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer, on the shared broadcast-pitch kit
 * (lib/plays/riso/broadcast-pitch.ts).
 *
 * WHY A DEMO: the card itself proposes a signature, not a match, and I found no single famous, well-described Anderson interception-and-carry
 * whose side, minute and players I could confirm. So this is a clearly labelled demo of the move the lesson teaches (read the pass, step in,
 * head up, drive into the space, release), never claimed as a moment of any match. The narration states only a sourced fact (he played for
 * England at the 2026 World Cup, where England won bronze) and then says "This is how he wins the ball and drives forward".
 *
 * SOURCES (Sept 2026, read as raw pages; cached in the build scratchpad cf6/):
 *  - Wikipedia, "Elliot Anderson" (raw wikitext): English midfielder (Manchester City, number 5, from summer 2026; before that Nottingham
 *    Forest); first senior England call-up 29 August 2025; "In May 2026, Anderson was selected in England's squad for the 2026 FIFA World
 *    Cup in which he helped England reach the semi-finals and win the bronze medal"; honours: World Cup third place 2026.
 *  - Wikimedia Commons photo "Elliot Anderson 8 England v Ghana at 2026 Fifa World Cup (YantsImages)", viewed: England's WHITE home shirt
 *    with a navy collar and a RED number 8; short light-brown hair.
 * CONFIRMED (narrated): he played for England at the 2026 World Cup, where England won bronze.
 * INFERRED / DEMO (never claimed as a match play): the whole sequence and its positions; the opponents (generic, unnamed: yellow shirts,
 *   navy shorts) and the teammates; England's shorts (drawn navy) and socks (drawn white); the foot he steps in with (drawn RIGHT); the
 *   daytime bowl.
 *
 * FRAMING (TV grammar, never top-down): ch1 = a wide main-stand shot of the demo in real time (the pass, the interception, the drive);
 * ch2 = a low replay behind him reading the passer (the passer's hips turn, he steps across); ch3 = a side tracking replay of the carry (head
 * up, the space in front, fast); ch4 = the lesson with teaching marks (the win ring, the head-up sight line, the space ahead). Inks: yellow,
 * red, blue, navy. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,polyPath,ribbon,easeOut,easeOutBack,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,lunge,dribble,blendPose,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type V3,type Build} from './athlete';
import {frame,toCam,scr,pr,kAt,stadium,ground,drawScene,tracks,plan,gnd,arrow3,groundRing,pathRibbon,estimate,mono,add3,mix3,yawTo,lerpAng,nrm2,win,
 DEJECT,BALL_R,kickerAt,type Pal,type StadiumSpec,type Cam,type State,type Fig} from './broadcast-pitch';

// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'How he does it',text:'Elliot Anderson played for England at the 2026 World Cup, where they won bronze. This is how he wins the ball and drives forward. He reads the pass, steps in... and he is away!',tail:2.4,
  cues:['Elliot Anderson','England','bronze','This is how','reads the pass','steps in','away']},
 {label:'Read the pass',text:'Watch again. He watches the passer, then steps across at just the right moment.',tail:1.8,
  cues:['Watch again','watches the passer','steps across','right moment']},
 {label:'Head up, go',text:'Now he lifts his head, sees the space in front, and carries the ball into it, fast.',tail:2.2,
  cues:['Now he lifts','sees the space','carries the ball','fast']},
 {label:'Win it and drive',text:'Like Anderson: win the ball, lift your head, and carry it forward into the space in front of you.',tail:2.2,
  cues:['Like Anderson','win the ball','lift your head','carry it forward','space in front']},
];
import timingJson from '../../../public/plays/narration/elliot-anderson-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail,'anderson');return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('anderson: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, stadium
const Y='yellow',R='red',B='blue',K='navy';
const PAL:Pal={Y,R,B,K};
/** a daytime bowl (demo setting): open-roofed, a white-and-red crowd with a yellow away end */
const BOWL:StadiumSpec={pal:PAL,side:44,end:13,rake:36,height:32,tiers:[.5],roof:true,track:null,night:false,seats:[[R,.3],[K,.2]],
 crowdInks:['paper',R,[K,.95],Y],boards:R,
 crowd:(si,a,h,hb)=>si===3?(hb<.7?3:0):(hb<.45?0:hb<.8?1:h<.9?2:3)};

// ---------------------------------------------------------------- the cast
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.06]];
/** England (Commons photo): white shirt, navy collar trim, red numbers; shorts drawn navy, socks white (inferred) */
const eng=(n:number|null,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,number:n,numberInk:R,hairStyle:'short',build:{height:1.82},seed:n??40,...o});
/** the demo opponents (generic, unnamed): yellow shirts, navy shorts */
const opp=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:K,socks:Y,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,number:null,hairStyle:'short',build:{height:1.84},seed:70,...o});
const B_EA:Build={height:1.79,bulk:1,thighs:1.05};
const EA_ST=eng(8,{build:B_EA,hair:[Y,.55],skin:SKIN_L});

// ---------------------------------------------------------------- the demo on one clock τ (τ = 0 is the interception)
const TPASS=-1.05,TW=0,TREL=3.5;// the opponent's pass, the win, the release pass forward
const PA:V3=[-40,BALL_R,-6];const PB:[number,number]=[-58.5,12.5];
const PI:V3=[PA[0]+(PB[0]-PA[0])*.44,BALL_R,PA[2]+(PB[1]-PA[2])*.44];// on the pass line
const DIR=nrm2(PB[0]-PA[0],PB[1]-PA[2]);
/** the carry: straight at goal through the space in front, touches every ~2.2 m */
const CARRY:[number,number][]=[[PI[0],PI[2]],[-44,1.4],[-38.5,.6],[-33,-.3]];
const PR:V3=[-32.2,BALL_R,-.5],PT:V3=[-17,BALL_R,-5.5];// the release and the striker's run
const DR=nrm2(PT[0]-PR[0],PT[2]-PR[2]);
const PPK=kickerAt(PA,DIR,{height:1.84},'r'),PRK=kickerAt(PR,DR,B_EA,'r');
/** his step-in: the right boot meets the ball on the pass line (lunge full reach) — pelvis solved from the lunge skeleton */
const LUNGE_C=.6,lng=(tau:number)=>lunge(clamp(LUNGE_C+(tau-TW)/.9),{side:'r'});
const YAW_W=yawTo(-DIR[1],DIR[0]);// facing across the pass (toward the passer's side of the line, i.e. perpendicular), the lunge reaches right
const PW:[number,number]=(()=>{const sk=solve(lng(TW),B_EA,{x:0,z:0,yaw:YAW_W});return[PI[0]-sk.rToe[0],PI[2]-sk.rToe[2]];})();
type Role='ea'|'pas'|'rec'|'str'|'eng'|'opp';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-5,T1=8;
const ACTORS:Actor[]=[
 {name:'Elliot Anderson (demo)',role:'ea',hero:true,style:EA_ST,keys:[[T0,-54,-1],[-2.5,-51.5,1.5],[TPASS,-50,2.4],[-.35,PW[0]-.3,PW[1]-.5],[TW,...PW],[.5,PW[0]+.9,PW[1]],[1,CARRY[1][0]-.8,CARRY[1][1]],[2,CARRY[2][0]-.8,CARRY[2][1]],[3,CARRY[3][0]-.8,CARRY[3][1]],[TREL,...PRK],[TREL+.9,-29,-1],[T1,-24,-2]]},
 {name:'the passer (demo)',role:'pas',hero:true,style:opp({seed:71,skin:SKIN_D}),keys:[[T0,-36,-9],[TPASS-.6,PPK[0]-DIR[0]*.6,PPK[1]-DIR[1]*.6],[TPASS,...PPK],[1,-41,-4],[T1,-44,-2]]},
 {name:'the intended receiver (demo)',role:'rec',hero:true,style:opp({seed:72}),keys:[[T0,-60,14],[TPASS,-58.8,12.8],[0,-57.6,11.8],[1.5,-54,9],[T1,-48,6]]},
 {name:'the striker (demo)',role:'str',style:eng(9,{build:{height:1.88},skin:SKIN_M}),keys:[[T0,-28,-2],[1,-26,-3],[TREL,-21,-4.6],[TREL+1.2,PT[0]-1,PT[2]],[T1,-12,-6]]},
 {name:'midfielder (demo)',role:'eng',style:eng(null,{seed:41}),keys:[[T0,-47,-14],[2,-40,-12],[T1,-30,-10]]},
 {name:'midfielder (demo)',role:'opp',style:opp({seed:73}),keys:[[T0,-44,10],[0,-45,8],[2,-41,6],[T1,-36,4]]},
 {name:'defender (demo)',role:'opp',style:opp({seed:74,build:{height:1.9}}),keys:[[T0,-24,4],[TREL,-22,2],[T1,-18,0]]},
 {name:'defender (demo)',role:'opp',style:opp({seed:75}),keys:[[T0,-25,-9],[TREL,-22,-8],[T1,-17,-7]]},
];
const EA=0,PAS=1,REC=2;
const TR=tracks(ACTORS,T0,T1);
const posOf=TR.posOf,distOf=TR.distOf;

// ---------------------------------------------------------------- the ball
const roll=(A:V3,Bp:V3,t0:number,t1:number,tau:number):V3=>{const u=clamp((tau-t0)/(t1-t0)),s=u*(1.3-.3*u);return mix3(A,Bp,s);};
function ballAt(tau:number):V3{
 if(tau<TPASS-1){const p=posOf(PAS,tau);return[p[0]+.5,BALL_R,p[1]+.2];}
 if(tau<TPASS){const a=ballAt(TPASS-1.01);return mix3(a,PA,easeOut((tau-TPASS+1)));}
 if(tau<TW)return roll(PA,PI,TPASS,TW,tau);
 if(tau<3){// the carry: each touch pushes it ~2.4 m ahead, it slows until the next touch
  const k=Math.min(2,Math.floor(tau)),a=CARRY[k],b=CARRY[k+1],u=tau-k,s=1-Math.pow(1-u,1.8);return[lerp(a[0],b[0],s),BALL_R,lerp(a[1],b[1],s)];}
 if(tau<TREL)return mix3([CARRY[3][0],BALL_R,CARRY[3][1]],PR,easeOut((tau-3)/(TREL-3)));
 return roll(PR,PT,TREL,TREL+1.3,tau);
}
const spinAt=(tau:number)=>tau*TAU*1.4;

// ---------------------------------------------------------------- poses
function kick(pose:Pose,tau:number,tc:number,foot:'l'|'r',dur=.9,w=1):Pose{const ww=win(tau,tc-.5,tc+.7,.2)*w;return ww>0?blendPose(pose,strike(clamp((tau-tc)/dur+STRIKE_CONTACT),{foot}),ww):pose;}
/** head up: the chin lifts off the ball once he is away (on "lifts his head") */
const HEAD_UP=.55;
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau),b=ballAt(tau);let pose=TR.loco(k,tau),yaw=TR.faceYaw(k,tau,b);
 switch(a.role){
  case 'ea':{
   // reading: side-on to the pass, weight on the toes; the step-in lunge (right boot on the ball); then the carry with the head coming up
   if(tau<TW+.2)yaw=lerpAng(TR.faceYaw(k,tau,[PA[0],0,PA[2]]),YAW_W,sm(TW-.5,TW-.25,tau));
   const lw=win(tau,TW-.45,TW+.45,.15);if(lw>0)pose=blendPose(pose,lng(tau),lw);
   if(tau>TW+.3&&tau<3.2){const dw=sm(TW+.3,TW+.6,tau)*(1-sm(3,3.2,tau)),ph=distOf(k,tau)/2.4;let d=dribble(ph,{foot:'r',speed:.95});
    d={...d,neckP:lerp(d.neckP,-.3,sm(HEAD_UP,HEAD_UP+.35,tau))};pose=blendPose(pose,d,dw);}
   if(tau>TW+.3)yaw=lerpAng(yaw,yawTo(1,-.12),sm(TW+.3,TW+.7,tau));
   pose=kick(pose,tau,TREL,'r',.85);if(tau>TREL-.6)yaw=lerpAng(yaw,yawTo(DR[0],DR[1]),win(tau,TREL-.6,TREL+.6,.2));break;}
  case 'pas':pose=kick(pose,tau,TPASS,'r',.85);if(tau<TPASS+.5&&tau>TPASS-.8)yaw=lerpAng(yaw,yawTo(DIR[0],DIR[1]),win(tau,TPASS-.8,TPASS+.5,.2));if(tau>1)pose=blendPose(pose,DEJECT,sm(1,1.6,tau)*.5);break;
  case 'rec':yaw=TR.faceYaw(k,Math.min(tau,.2),ballAt(Math.min(tau,.2)));break;
  default:break;
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;cap?:number}={}){
 const figs:Fig[]=ACTORS.map((a,k)=>{const hero=!!a.hero;return{st:stateOf(k,tau),prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===EA&&tau>TW-.3&&tau<TW+.4)||(k===PAS&&tau>TPASS-.25&&tau<TPASS+.35))};});
 return drawScene(s,c,PAL,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},null,o.cap);
}
const atA=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · the wide main-stand shot, real time
function tau1(t:number){const tT=CUE(0,'This is how'),tR=CUE(0,'reads the pass'),tS=CUE(0,'steps in')+.15,tA=CUE(0,'away'),S=SECS(0);
 return key(t,mono([[0,Math.max(T0+.2,-2.6-tT*.4)],[tT,-2.6],[tR,TPASS],[tS,TW],[tA,1.2],[S+1,1.2+S+1-tA]]),linear);}
const P1:V3=[-44,24,74];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  // while the intro fact is read: a tight tracking shot on Anderson himself (so the card's small window shows the player), then out wide
  [0,0,()=>({P:P1,T:atA(EA,tau,1),fov:3.6})],
  [CUE(0,'This is how')-1,1.3,()=>({P:P1,T:mix3(gnd(b,1),atA(EA,tau,1),.5),fov:12})],
  [CUE(0,'reads the pass')-.3,.8,()=>({P:P1,T:mix3(gnd(b,1),atA(EA,tau,1),.6),fov:9.5})],
  [CUE(0,'away')-.2,1.2,()=>({P:P1,T:add3(atA(EA,tau,1),[3,0,0]),fov:11})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12);
  stadium(s,c,BOWL,t,[2,1,3],{roar:.25*sm(TW,TW+.5,tau)});
  ground(s,c,BOWL);
  const r=play(s,c,tau,tp,{min:17,lines:true,prevBall:tau1(t-.06)});
  const hit=(tau-TW)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(40,r.ball.r*3.5),{n:8,seed:19,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(5,r.ball.r*.4)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'steps in')+.2;},
};

// ---------------------------------------------------------------- 2 · low replay behind him: he reads the passer, steps across
const tau2=(t:number)=>key(t,mono([[0,-2.6],[CUE(1,'watches the passer'),TPASS-.5],[CUE(1,'steps across'),-.3],[CUE(1,'right moment'),TW],[SECS(1),TW+.6]]),linear);
const E2:V3=[PW[0]-7,1.6,PW[1]+5];
function cam2(t:number):Cam{
 const tau=tau2(t),ea=atA(EA,tau,1.2),pa=atA(PAS,tau,1);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(ea,pa,.45),fov:32})],
  [CUE(1,'steps across')-.3,.9,()=>({P:add3(E2,[2,-.3,-1.5]),T:[PI[0],.4,PI[2]],fov:26})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tW2=CUE(1,'watches the passer'),tS=CUE(1,'steps across');
  stadium(s,c,BOWL,t,[1,0]);
  ground(s,c,BOWL);
  // "watches the passer": a dashed yellow sight line from his eyes to the passer; "steps across": the pass line (red) cut by a yellow ring
  const w=win(t,tW2-.1,tS+.3,.2);if(w>0){const st=stateOf(EA,tau),sk=solve(st.pose,B_EA,st.place),a=pr(c,sk.face),e=pr(c,atA(PAS,tau,1.4));
   if(a&&e){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.14)gaps.push([x,x+.06]);s.fill(Y,ribbon([a,[lerp(a[0],e[0],w),lerp(a[1],e[1],w)]],Math.max(5,kAt(c,sk.face)*.06),{taper:.2,wobble:.5,gaps}),.95);}}
  const sl=sm(tS-.2,tS+.3,t);if(sl>0){pathRibbon(s,c,[gnd(PA,.03),gnd(PI,.03),[PB[0],.03,PB[1]]],R,sl*.8*(1-sm(TW+.3,TW+.6,tau)),.2);groundRing(s,c,PI,.8,Y,sl);}
  play(s,c,tau,tp,{smear:true,min:12,cap:2});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=pr(c,P)??[0,0];return apertureDisc(q[0],q[1],50,12);},
 get still(){return CUE(1,'right moment')+.1;},
};

// ---------------------------------------------------------------- 3 · side tracking replay of the carry: head up, the space, fast
const tau3=(t:number)=>key(t,mono([[0,TW+.1],[CUE(2,'Now he lifts'),HEAD_UP],[CUE(2,'sees the space'),1.1],[CUE(2,'carries the ball'),1.6],[CUE(2,'fast'),2.6],[SECS(2),3.4]]),linear);
function cam3v(t:number):Cam{
 const tau=tau3(t),ea=atA(EA,tau,1);
 return plan(t,[
  [0,0,()=>({P:add3(ea,[-2,1.6,-9]),T:add3(ea,[1.2,0,0]),fov:30})],
  [CUE(2,'sees the space')-.3,.8,()=>({P:add3(ea,[-5,2.2,-10]),T:add3(ea,[3,0,0]),fov:38})],
  [CUE(2,'fast')-.3,.8,()=>({P:add3(ea,[-3,1.6,-9]),T:add3(ea,[1.8,0,0]),fov:32})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tS=CUE(2,'sees the space');
  stadium(s,c,BOWL,t,[2,3]);
  ground(s,c,BOWL);
  // "sees the space in front": a yellow zone opens ahead of him
  const sp=sm(tS-.2,tS+.4,t);if(sp>0)groundRing(s,c,[CARRY[3][0]+2,0,CARRY[3][1]],3.4*easeOutBack(clamp((t-tS+.2)/.6)),Y,sp*(1-sm(3,3.3,tau)));
  play(s,c,tau,tp,{min:12,lines:true,prevBall:tau3(t-.06),cap:2});
 },
 aperture(t){const c=cam3v(t),st=stateOf(EA,tau3(twos(t))),sk=solve(st.pose,B_EA,st.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'carries the ball')+.3;},
};

// ---------------------------------------------------------------- 4 · the lesson: win it, head up, drive into the space
const tau4=(t:number)=>key(t,mono([[0,TPASS],[CUE(3,'win the ball'),TW],[CUE(3,'lift your head'),HEAD_UP+.2],[CUE(3,'carry it forward'),1.4],[CUE(3,'space in front'),2.3],[SECS(3),2.8]]),linear);
const E4:V3=[-60,10,-16];
function cam4v(t:number):Cam{
 const tau=tau4(t),ea=atA(EA,tau,1);
 return plan(t,[
  [0,0,()=>({P:E4,T:add3(ea,[3,0,0]),fov:22})],
  [CUE(3,'carry it forward')-.3,1.2,()=>({P:add3(E4,[8,0,2]),T:add3(ea,[5,0,0]),fov:25})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tW4=CUE(3,'win the ball'),tH=CUE(3,'lift your head'),tC=CUE(3,'carry it forward'),tF=CUE(3,'space in front');
  stadium(s,c,BOWL,t,[2,1]);
  ground(s,c,BOWL);
  groundRing(s,c,PI,.9,R,sm(tW4-.2,tW4+.3,t)*(1-sm(tC,tC+.5,t)));
  const cf=sm(tC-.1,tC+.5,t);if(cf>0){const a=atA(EA,Math.max(TW+.3,Math.min(tau,1.2)),.02),e:V3=[lerp(a[0],CARRY[3][0]+3,sm(tC,tC+1,t)),.02,lerp(a[2],CARRY[3][1],sm(tC,tC+1,t))];arrow3(s,c,K,[a,mix3(a,e,.5),e],Math.max(8,kAt(c,a)*.09),Y,.95*cf);}
  groundRing(s,c,[CARRY[3][0]+2,0,CARRY[3][1]],3.2,Y,sm(tF-.2,tF+.3,t));
  play(s,c,tau,tp,{min:13,cap:2});
  // "lift your head": a dashed yellow sight line from his eyes forward, far up the pitch
  const hu=sm(tH-.2,tH+.3,t);if(hu>0){const st=stateOf(EA,tau),sk=solve(st.pose,B_EA,st.place),a=pr(c,sk.face),e=pr(c,add3(sk.face,[14,-.8,-1]));
   if(a&&e){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.14)gaps.push([x,x+.06]);s.fill(Y,ribbon([a,[lerp(a[0],e[0],hu),lerp(a[1],e[1],hu)]],Math.max(5,kAt(c,sk.face)*.06),{taper:.2,wobble:.5,gaps}),.95);}}
 },
 get still(){return CUE(3,'lift your head')+.4;},
};

const film:RisoStory={
 id:'elliot-anderson-signature',format:'11v11',title:'Anderson: win it and drive',
 theme:'Win the ball, lift your head and carry it forward into the space in front of you',
 ageNote:'Signature-move demo (not a specific match). Fact: England squad, 2026 World Cup (bronze).',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a pass line is cut — a red dash snaps and a ball is carried off to the right with a yellow streak. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.6),fade=1-clamp((age-.6)/.2);
  if(age<.3)s.fill(R,ribbon([[x-120,y-60],[x-20*(1-age/.3),y-10]],8,{taper:.3,wobble:.3}),.9);
  if(fade>0)s.fill(Y,ribbon([[x,y],[x+150*easeOut(u),y]],10,{taper:.7,wobble:.3}),.9*fade);
  footballPanels(s,x+150*easeOut(u),y,24,{rot:age*12+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Demo geometry (pitch metres; the attacked goal line x = 0, +z = the attackers' right) — checked by tests/play-film-elliot-anderson-signature.cjs. */
export const FACTS={PA,PI,PB,PR,PT,TPASS,TW,TREL,HEAD_UP,ballAt,demo:true as const,
 ea:(tau:number)=>{const st=stateOf(EA,tau),sk=solve(st.pose,B_EA,st.place);return{rToe:sk.rToe,lToe:sk.lToe,neckP:st.pose.neckP,pelvis:sk.pelvis};},
 passerContact:()=>{const st=stateOf(PAS,TPASS),sk=solve(st.pose,{height:1.84},st.place);return{rToe:sk.rToe};},
 posOf:(k:number,tau:number)=>posOf(k,tau),velOf:(k:number,tau:number)=>TR.velOf(k,tau)};
