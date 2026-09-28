/** Park Ji-sung — "The World Cup Winner v Portugal" (lib/town/iconicPlays.json; lesson: "Control the ball with your chest, then shoot before
 * the defender can block"). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * rendered as a riso print on the shared broadcast-pitch kit (lib/plays/riso/broadcast-pitch.ts).
 *
 * THE MOMENT: Portugal 0–1 South Korea, 2002 FIFA World Cup, Group D, Incheon Munhak (World Cup) Stadium, 14 June 2002, 20:30 kick-off,
 * the 70th minute: Lee Young-pyo's cross from the left, Park controls it on his chest, beats Sérgio Conceição with a flick and volleys a
 * left-foot shot through goalkeeper Vítor Baía's legs. Korea won 1–0 and reached the knockout stage for the first time; Park was named the
 * match's outstanding player.
 *
 * SOURCES (Sept 2026, read as raw pages; cached in the build scratchpad cf6/):
 *  - Wikipedia, "2002 FIFA World Cup Group D" (raw wikitext): date, 20:30, Incheon World Cup Stadium, 50,239, Park 70', line-ups and numbers
 *    (Park 21, Lee Young-pyo 10, Ahn Jung-hwan 19, Seol Ki-hyeon 9, Yoo Sang-chul 6; Baía 1, Sérgio Conceição 11, Couto 5, Jorge Costa 2,
 *    Figo 7), Park man of the match; kit table: PORTUGAL red shirts (Kit_body_por02H.png, sampled: red body), GREEN shorts, red socks; SOUTH
 *    KOREA white shirts (Kit_body_kor02A.png, sampled: white body with red trim), RED shorts, white socks.
 *  - Wikipedia, "Park Ji-sung": "Park received Lee Young-pyo's cross from the left, controlled the ball with his chest, beat Sérgio
 *    Conceição and scored left-footed through goalkeeper Vítor Baía's legs in the 70th minute."
 *  - FIFA World Cup 2002 match report (web.archive.org copy of fifaworldcup.yahoo.com/en/020614/2/11vq.html): "Park Ji Sung trapped the
 *    ball on his chest, beat Sergio Conceicao with a flick and then volleyed a left-foot shot through the legs of Baia (0 : 1, 70)";
 *    Portugal had nine players by then; "a sea of red" in the stands.
 * CONFIRMED: match, date, venue, evening kick-off, the minute, 0–0 before it, the cross from the LEFT by Lee Young-pyo, the chest control,
 *   the flick past Conceição, the LEFT-foot volley through Baía's legs, the kits (Korea white/red/white, Portugal red/green/red), numbers.
 * INFERRED (illustrative reconstruction, never named in the narration): every position, run and timing; Park receiving on the RIGHT of the
 *   box (the far side of a cross from the left); Lee's crossing foot (drawn LEFT) and the flick's foot (drawn RIGHT, the inside of the
 *   boot, over Conceição's lunge); Baía's kit (drawn grey-blue) and his step off the line; the stadium's track, roof and crowd layout; the
 *   broadcast side (main camera on Korea's right, Korea attacking left → right on screen).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Lee's cross, chest, flick, shot, goal);
 * ch2 = the slow-motion REPLAY low and side-on (the chest cushions it, the flick past the defender); ch3 = a second replay behind the goal
 * (the left-foot shot through the keeper's legs); ch4 = the lesson on the slowed move (a ring on the chest, a ring on the ball as it drops,
 * the shot lane before the defender can block). Composed on the FULL sheet. Inks: yellow, red, green, navy (Portugal red, Korea's red
 * shorts, Portugal's green shorts, grass = yellow × green). All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,polyPath,ribbon,easeOut,easeOutBack,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,volley,keeperSet,celebrate,posed,blendPose,keyPoses,lunge,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type V3,type Build} from './athlete';
import {frame,toCam,scr,pr,kAt,stadium,ground,drawScene,tracks,plan,gnd,arrow3,groundRing,pathRibbon,estimate,mono,add3,sub3,mix3,yawTo,lerpAng,nrm2,win,
 DEJECT,BALL_R,kickerAt,type Pal,type StadiumSpec,type Cam,type State,type Fig} from './broadcast-pitch';

// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Seventy minutes',text:'Incheon, 2002, the World Cup. South Korea against Portugal, no goals yet. Lee Young-pyo crosses from the left. Park Ji-sung takes it on his chest, flicks it past a defender, and shoots. Goal!',tail:2.4,
  cues:['Incheon','South Korea','Lee Young','crosses from','Park Ji','takes it on his chest','flicks it past','shoots','Goal']},
 {label:'Chest and flick',text:'Watch again. His chest cushions the ball. Then a quick flick takes it past the defender.',tail:1.8,
  cues:['Watch again','His chest','cushions','Then a quick flick','past the defender']},
 {label:'Through the legs',text:'From behind the goal: a left foot volley, right through the keeper\'s legs! Korea lead, one-nil!',tail:2.2,
  cues:['From behind','left foot','volley','right through','Korea lead']},
 {label:'Chest, then shoot',text:'Like Park: control the ball with your chest, then shoot before the defender can block.',tail:2.2,
  cues:['Like Park','control the ball','with your chest','then shoot','before the defender','block']},
];
import timingJson from '../../../public/plays/narration/park-portugal-2002/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail,'park');return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('park: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, stadium
const Y='yellow',R='red',G='green',K='navy';
const PAL:Pal={Y,R,B:G,K};
/** Incheon Munhak: a bowl with a running track and roofs over the side stands; a June evening under floodlights; "a sea of red" (Korea's
 * fans in red) with a few Portugal patches (inferred layout). */
const MUNHAK:StadiumSpec={pal:PAL,side:46,end:16,rake:34,height:26,tiers:[.46],roof:true,track:R,night:true,sky:null,seats:[[K,.35]],
 crowdInks:[R,'paper',[K,.9],Y,G],boards:R,
 crowd:(si,a,h,hb)=>{const red=si===3&&a>.7?.3:.8;return hb<red?0:hb<red+.1?1:h<.85?2:h<.95?3:4;}};

// ---------------------------------------------------------------- the cast: kits
const SKIN_E:InkFill[]=[[Y,.4],[R,.16]],SKIN_P:InkFill[]=[[Y,.38],[R,.24]];
/** South Korea v Portugal 2002 (kit table): white shirts, red shorts, white socks; red numbers */
const kor=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:R,socks:'paper',boots:K,skin:SKIN_E,hair:K,line:K,trim:R,number:n,numberInk:R,hairStyle:'short',build:{height:1.76},seed:n,...o});
/** Portugal 2002 home: red shirts, green shorts, red socks; paper numbers */
const por=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:G,socks:R,boots:K,skin:SKIN_P,hair:K,line:K,trim:G,number:n,numberInk:'paper',hairStyle:'short',build:{height:1.8},seed:40+n,...o});
const B_PARK:Build={height:1.75,bulk:.96,thighs:1.05},B_LEE:Build={height:1.77},B_SC:Build={height:1.76},B_BAIA:Build={height:1.84};
const PARK_ST=kor(21,{build:B_PARK});
const BAIA_ST:AthleteStyle={shirt:[G,.5],shorts:[K,.7],socks:[G,.5],boots:K,skin:SKIN_P,hair:K,line:K,gloves:'paper',sleeves:'long',number:1,numberInk:'paper',hairStyle:'short',build:B_BAIA,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Lee's cross)
/** TC chest, TF the flick, TS the left-foot volley, TG over the goal line */
const TC=1.5,TF=TC+.62,TS=TF+.58,TG=TS+.5;
/** Park: on the right of the box, facing the cross (from the left) as it arrives, then turning toward goal */
const PK:[number,number]=[-10.4,7.6],PS:[number,number]=[-9.3,6.7];
const FACE_C=nrm2(-24-PK[0],-26-PK[1]),YAW_C=yawTo(FACE_C[0],FACE_C[1]),YAW_S=yawTo(9.3,-5.8);
/** the chest trap: arched back, chin down on the ball, arms out, knees soft */
const CHEST=posed({lean:-20,pitch:-6,neckP:34,lShA:52,rShA:52,lShF:-6,rShF:-6,lElb:64,rElb:64,lHipF:22,rHipF:8,lKnee:34,rKnee:26,lAnk:-6,rAnk:-4,squash:-.03});
/** the flick: the right foot lifts the ball up and across, over the lunge (inside of the boot) */
const FLICK_UP=posed({lHipF:16,lKnee:30,rHipF:26,rKnee:70,rAnk:30,rHipA:-14,rHipR:28,lean:14,neckP:34,lShA:48,rShA:40,lElb:40,rElb:40});
const FLICK=posed({lHipF:14,lKnee:32,rHipF:40,rKnee:40,rAnk:26,rHipA:-22,rHipR:34,lean:10,neckP:30,lShA:52,rShA:36,lElb:36,rElb:44,twist:-10});
const LEE:[number,number]=[-26,-25.5],P0:V3=[-24.6,BALL_R,-24.2];
const DLC=nrm2(PK[0]-P0[0],PK[1]-P0[2]),PLC=kickerAt(P0,DLC,B_LEE,'l');
type Role='park'|'lee'|'sc'|'baia'|'kor'|'por';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-7,T1=10;
const ACTORS:Actor[]=[
 {name:'Park Ji-sung',role:'park',hero:true,style:PARK_ST,keys:[[T0,-18,11],[-3,-13.5,9.6],[0,-11.2,8.2],[TC-.3,PK[0],PK[1]],[TF-.1,PK[0]+.15,PK[1]-.1],[TS-.05,PS[0],PS[1]],[TS+.5,PS[0]+.6,PS[1]-.3],[TG+1.5,-7,9],[TG+4,-4,15],[T1,-2,20]]},
 {name:'Lee Young-pyo',role:'lee',hero:true,style:kor(10,{build:B_LEE}),keys:[[T0,-35,-30],[-3,-29.5,-27.5],[-.3,PLC[0]-DLC[0]*.6,PLC[1]-DLC[1]*.6],[0,...PLC],[1.2,-22,-22.5],[T1,-18,-18]]},
 {name:'Sérgio Conceição',role:'sc',hero:true,style:por(11,{build:B_SC}),keys:[[T0,-15,13],[-3,-11.5,10],[0,-10,8.6],[TC,-9.6,7.8],[TF-.3,-9.5,7.5],[TF+.2,-9.8,7.3],[TS,-10,7.3],[T1,-10,7.3]]},
 {name:'Vítor Baía',role:'baia',hero:true,style:BAIA_ST,keys:[[T0,-1.6,-1],[0,-1.8,0],[TC,-2,1.6],[TF,-2.2,1.6],[TS,-2.4,1.5],[T1,-2.4,1.5]]},
 {name:'Fernando Couto',role:'por',style:por(5,{build:{height:1.86},hairStyle:'long'}),keys:[[T0,-12,2],[-2,-7.5,.5],[TC,-6.6,.8],[T1,-6.4,1]]},
 {name:'Jorge Costa',role:'por',style:por(2,{build:{height:1.86}}),keys:[[T0,-12,-5],[-2,-8,-3],[TC,-7,-2],[T1,-6.8,-1.6]]},
 {name:'Ahn Jung-hwan',role:'kor',style:kor(19,{hairStyle:'long',build:{height:1.77}}),keys:[[T0,-14,-2],[-2,-9,-1],[TC,-7.8,-.4],[T1,-7.4,-.2]]},
 {name:'Seol Ki-hyeon',role:'kor',style:kor(9,{build:{height:1.84}}),keys:[[T0,-16,-9],[-2,-11,-6],[TC,-9.6,-5],[T1,-9,-4.6]]},
 {name:'Paulo Bento',role:'por',style:por(17,{build:{height:1.8}}),keys:[[T0,-22,-8],[-2,-17,-6],[TC,-15.6,-4],[T1,-14,-3]]},
 {name:'Luís Figo',role:'por',style:por(7,{build:{height:1.8}}),keys:[[T0,-30,-18],[-2,-26,-20],[TC,-24,-20],[T1,-22,-18]]},
 {name:'Yoo Sang-chul',role:'kor',style:kor(6,{build:{height:1.84}}),keys:[[T0,-34,0],[-2,-28,-3],[TC,-25,-4],[T1,-22,-4]]},
];
const PARK=0,LEEK=1,SC=2,BAIA=3;
const TR=tracks(ACTORS,T0,T1);
const posOf=TR.posOf,distOf=TR.distOf;

// ---------------------------------------------------------------- Park's move (poses) and the ball, solved from the skeleton
/** Park's pose over τ: arrive → the chest trap at TC → the right-foot flick at TF → the left-foot volley at TS (contact = volley .5) */
const VOLLEY_DUR=1;
const vol=(tau:number)=>volley(clamp(.5+(tau-TS)/VOLLEY_DUR),{foot:'l',height:.3});
function parkPose(tau:number,run:Pose):Pose{
 if(tau<TC-.55||tau>TS+1.6)return run;
 const keys:[number,Pose][]=[[TC-.55,run],[TC-.08,CHEST],[TC+.2,blendPose(CHEST,posed({lHipF:18,rHipF:14,lKnee:30,rKnee:26,lean:12,neckP:30,lShA:40,rShA:40,lElb:50,rElb:50}),.6)],[TF-.2,FLICK_UP],[TF,FLICK],[TS-.5,vol(TS-.5)],[TS,vol(TS)],[TS+.3,vol(TS+.3)],[TS+.5,vol(TS+.5)]];
 return keyPoses(tau,keys);
}
function parkYaw(tau:number,run:number){const toC=sm(TC-1.2,TC-.55,tau)*(1-sm(TC+.2,TF-.1,tau)),toS=sm(TC+.3,TF-.05,tau)*(1-sm(TS+.9,TS+1.6,tau));
 let y=lerpAng(run,YAW_C,toC);y=lerpAng(y,YAW_S,toS);return y;}
const parkSk=(tau:number)=>{const[x,z]=posOf(PARK,tau),run=TR.loco(PARK,tau),ry=TR.faceYaw(PARK,tau,[0,0,0]);return solve(parkPose(tau,run),B_PARK,{x,z,yaw:parkYaw(tau,ry)});};
const fwd=(yaw:number):V3=>[Math.cos(yaw),0,-Math.sin(yaw)];
/** the chest point (ball centre) at TC, the flick point on the right boot at TF, the volley point on the left laces at TS */
const PCH:V3=(()=>{const sk=parkSk(TC),f=fwd(YAW_C);return add3(sk.chest,[f[0]*.2,.06,f[2]*.2]);})();
const PFL:V3=(()=>{const sk=parkSk(TF),m=mix3(sk.rAn,sk.rToe,.5);return[m[0],Math.max(BALL_R+.05,m[1]+.08),m[2]];})();
const PV:V3=(()=>{const sk=parkSk(TS),m=mix3(sk.lAn,sk.lToe,.6);return[m[0],m[1]+.1,m[2]];})();
/** through Baía's legs: low, a little to the right of centre from Park */
const PG:V3=[0,.16,.55],NETP:V3=[1.7,.2,.4],REST:V3=[1.6,BALL_R,.3];
const fly=(A:V3,Bp:V3,d:number):V3=>[(Bp[0]-A[0])/d,(Bp[1]-A[1]+4.905*d*d)/d,(Bp[2]-A[2])/d];
const at=(A:V3,V:V3,t:number):V3=>[A[0]+V[0]*t,A[1]+V[1]*t-4.905*t*t,A[2]+V[2]*t];
const V_CROSS=fly(P0,PCH,TC),V_DROP=fly(PCH,PFL,TF-TC),V_FLICK=fly(PFL,PV,TS-TF),V_SHOT=fly(PV,PG,TG-TS);
function ballAt(tau:number):V3{
 if(tau<-2.2){const p=posOf(LEEK,tau),v=TR.velOf(LEEK,tau),l=Math.hypot(v[0],v[1])||1,f=((distOf(LEEK,tau)/1.9)%1+1)%1,d=.42+.38*(f<.18?f/.18:1-(f-.18)/.82);return[p[0]+v[0]/l*d,BALL_R,p[1]+v[1]/l*d];}
 if(tau<0){const a=ballAt(-2.21),u=easeOut((tau+2.2)/2.2);return mix3(a,P0,u);}
 if(tau<TC)return at(P0,V_CROSS,tau);
 if(tau<TF)return at(PCH,V_DROP,tau-TC);
 if(tau<TS)return at(PFL,V_FLICK,tau-TF);
 if(tau<TG)return at(PV,V_SHOT,tau-TS);
 if(tau<TG+.2)return mix3(PG,NETP,easeOut((tau-TG)/.2));
 const u=clamp((tau-TG-.2)/.4);return[lerp(NETP[0],REST[0],u),lerp(NETP[1],REST[1],u),lerp(NETP[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<TC?tau*TAU*1.5:tau<TS?TC*TAU*1.5+(tau-TC)*TAU*.8:TC*TAU*1.5+(TS-TC)*TAU*.8+(tau-TS)*TAU*4;
const bulgeAt=(tau:number)=>tau<TG+.06?0:.7*Math.exp(-(tau-TG-.06)*2.4)*(1+.3*Math.sin((tau-TG)*14));
/** where the shot passes Baía's line (his x): Baía stands astride it */
const BX=-2.4,U_B=(BX-PV[0])/(PG[0]-PV[0]),TB=TS+U_B*(TG-TS),BZ=at(PV,V_SHOT,TB-TS)[2];
ACTORS[BAIA].keys=[[T0,-1.6,-1],[0,-1.8,0],[TC,-2,BZ*.6],[TF,-2.2,BZ],[TS,BX,BZ],[T1,BX,BZ]];
const TR2=tracks(ACTORS,T0,T1);

// ---------------------------------------------------------------- poses
function kick(pose:Pose,tau:number,tc:number,foot:'l'|'r',dur=.9,w=1):Pose{const ww=win(tau,tc-.5,tc+.7,.2)*w;return ww>0?blendPose(pose,strike(clamp((tau-tc)/dur+STRIKE_CONTACT),{foot}),ww):pose;}
/** Baía: set, wide stance (legs astride the shot's line), a late crouch — the ball goes between his feet */
const BAIA_WIDE=posed({lHipF:44,rHipF:44,lHipA:26,rHipA:26,lKnee:56,rKnee:56,lAnk:-6,rAnk:-6,lean:22,pitch:8,lShF:44,rShF:44,lShA:48,rShA:48,lElb:40,rElb:40,lHand:1,rHand:1,neckP:-10});
function stateOf(k:number,tau:number):State{
 const T=k===BAIA?TR2:TR,a=ACTORS[k],[x,z]=T.posOf(k,tau),b=ballAt(tau);let pose=T.loco(k,tau),yaw=T.faceYaw(k,tau,b);
 switch(a.role){
  case 'park':{pose=parkPose(tau,pose);yaw=parkYaw(tau,T.faceYaw(k,tau,b));
   if(tau>TG+.4){const run=celebrate(distOf(k,tau)/4,{kind:'run'});pose=blendPose(pose,run,sm(TG+.5,TG+1.2,tau));}break;}
  case 'lee':{pose=kick(pose,tau,0,'l',.85);const w=sm(-.5,-.15,tau)*(1-sm(.5,1,tau));yaw=lerpAng(yaw,yawTo(DLC[0],DLC[1]),w);
   if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;}
  case 'sc':{const w=win(tau,TF-.45,TF+.6,.2);if(w>0)pose=blendPose(pose,lunge(clamp((tau-(TF-.45))/.9),{side:'l'}),w);
   yaw=T.faceYaw(k,Math.min(tau,TF),parkSk(Math.min(tau,TF)).pelvis);if(tau>TG+.4)pose=blendPose(pose,DEJECT,sm(TG+.6,TG+1.4,tau)*.8);break;}
  case 'baia':{pose=blendPose(keeperSet(Math.min(tau,TS)*1.3),BAIA_WIDE,sm(TF,TS-.15,tau));
   if(tau>TG+.3)pose=blendPose(pose,DEJECT,sm(TG+.5,TG+1.3,tau)*.7);yaw=Math.PI+.05;break;}
  case 'por':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TC)yaw=T.faceYaw(k,TC,ballAt(TC));break;
  case 'kor':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;cap?:number}={}){
 const figs:Fig[]=ACTORS.map((a,k)=>{const hero=!!a.hero;return{st:stateOf(k,tau),prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===PARK&&tau>TF-.2&&tau<TS+.35)||(k===LEEK&&tau>-.25&&tau<.35)||(k===SC&&tau>TF-.3&&tau<TF+.3))};});
 return drawScene(s,c,PAL,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2],by:.4},o.cap);
}
const atA=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
function tau1(t:number){const tL=CUE(0,'crosses from')+.1,tC=CUE(0,'takes it on')+.5,tF=CUE(0,'flicks it past')+.2,tS=CUE(0,'shoots')+.1,S=SECS(0);
 return key(t,mono([[0,Math.max(T0+.2,-tL*.7)],[tL,0],[tC,TC],[tF,TF],[tS,TS],[S+1,TS+S+1-tS]]),linear);}
const P1:V3=[-18,25,78];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-22,0,-8],fov:15})],
  [CUE(0,'Lee Young')-.3,1,()=>({P:P1,T:mix3(gnd(b,1),atA(PARK,tau,1),.25),fov:12})],
  [CUE(0,'crosses from')-.1,1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1+.3*b[1],0]),[PK[0],1.4,PK[1]],.3+.6*sm(0,TC,tau)),fov:11})],
  [CUE(0,'takes it on')-.2,.8,()=>({P:P1,T:mix3(atA(PARK,tau,1.1),[-5,.8,3],.3*sm(TF,TG,tau)),fov:8})],
  [CUE(0,'shoots')-.1,.6,()=>({P:P1,T:mix3(atA(PARK,tau,1),[-1,.6,1],.6),fov:9})],
  [CUE(0,'Goal')+.3,1.5,()=>{const w=atA(PARK,tau,1.2);return{P:P1,T:mix3(w,[-5,1.2,6],.3),fov:10};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tA=CUE(0,'Goal');
  stadium(s,c,MUNHAK,t,[2,1,3],{roar:sm(TG,TG+.5,tau),flash:sm(tA-.1,tA+.4,t)*(1-sm(tA+2.2,tA+3,t))});
  ground(s,c,MUNHAK);
  play(s,c,tau,tp,{min:18,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'flicks it past')+.2;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay, low and side-on: chest, then the flick
const tau2=(t:number)=>key(t,mono([[0,TC-.8],[CUE(1,'His chest'),TC-.15],[CUE(1,'cushions'),TC+.05],[CUE(1,'Then a quick'),TF-.25],[CUE(1,'past the defender'),TF+.1],[SECS(1),TF+.5]]),linear);
/** low and side-on to Park as he faces the cross (perpendicular to his facing, on the halfway side): chest, ball and flick in profile */
const E2:V3=[PK[0]-FACE_C[1]*-9.5,1.25,PK[1]+FACE_C[0]*-9.5];
function cam2(t:number):Cam{
 const tau=tau2(t),pk=atA(PARK,tau,1.2),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(pk,b,.4),fov:34})],
  [CUE(1,'His chest')-.3,.9,()=>({P:mix3(E2,[PK[0],1.3,PK[1]],.25),T:mix3(pk,[PCH[0],1.3,PCH[2]],.5),fov:24})],
  [CUE(1,'Then a quick')-.3,1,()=>({P:mix3(E2,[PK[0],1.1,PK[1]],.12),T:mix3(atA(PARK,tau,.7),atA(SC,tau,.7),.4),fov:28})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tH=CUE(1,'His chest'),tQ=CUE(1,'Then a quick');
  stadium(s,c,MUNHAK,t,[2,3]);
  ground(s,c,MUNHAK);
  const r=play(s,c,tau,tp,{smear:true,min:12,cap:2});
  // replay graphics: a yellow ring pops on the chest at the trap; the flick's arc drawn yellow as it goes
  const ch=win(t,tH-.1,tQ-.2,.2);if(ch>0){const q=pr(c,PCH);if(q){const rr=Math.max(26,kAt(c,PCH)*.34)*easeOutBack(clamp((t-tH+.1)/.35));s.stroke(Y,polyPath(Array.from({length:24},(_,i)=>{const a=i/24*TAU;return[q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr] as Pt;}),true),Math.max(5,rr*.14),.95*ch);}}
  if(tau>TF){const pts:V3[]=[];for(let i=0;i<=12;i++)pts.push(ballAt(lerp(TF,Math.min(tau,TS),i/12)));pathRibbon(s,c,pts,Y,sm(tQ-.1,tQ+.3,t),.18);}
  if(r.ball&&Math.abs(tau-TC)<.08)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(40,r.ball.r*3.5),{n:8,seed:17,g:1-Math.abs(tau-TC)/.08,width:Math.max(5,r.ball.r*.4)});
 },
 aperture(t){const c=cam2(t),sk=parkSk(tau2(twos(t))),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(1,'cushions')+.2;},
};

// ---------------------------------------------------------------- 3 · a second replay behind the goal: the left-foot volley through the legs
const tau3=(t:number)=>key(t,mono([[0,TF-.1],[CUE(2,'left foot'),TS-.3],[CUE(2,'volley'),TS],[CUE(2,'right through'),TB],[CUE(2,'Korea lead'),TG+.8],[SECS(2),TG+2.8]]),linear);
const E3:V3=[12,4.6,-1.5];
function cam3v(t:number):Cam{
 const tau=tau3(t);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(atA(PARK,tau,1),[BX,.8,BZ],.4),fov:30})],
  [CUE(2,'volley')-.2,.7,()=>({P:add3(E3,[-1.5,-1,.5]),T:[lerp(PV[0],BX,.6),.6,lerp(PV[2],BZ,.6)],fov:24})],
  [CUE(2,'right through')-.2,.5,()=>({P:add3(E3,[-2,-1.8,.5]),T:[BX,.5,BZ],fov:22})],
  [CUE(2,'Korea lead')+.1,1.4,()=>({P:[4,5,-14],T:mix3(atA(PARK,tau,1.2),[-6,1,6],.3),fov:32})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tE=CUE(2,'Korea lead');
  stadium(s,c,MUNHAK,t,[3,0,2],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tE,tE+.3,t))});
  ground(s,c,MUNHAK);
  const cf=1-sm(TG+.2,TG+.8,tau);if(cf>0&&tau>TS){const pts:V3[]=[];for(let i=0;i<=12;i++)pts.push(ballAt(lerp(TS,Math.min(tau,TG),i/12)));pathRibbon(s,c,pts,Y,cf,.22);}
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06),cap:2});
  const hit=(tau-TS)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4),{n:9,seed:29,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 // the passage opens from Park, as in ch2 (it used to open from an empty point inside the net: a blank green disc in the mesh)
 aperture(t){const c=cam3v(t),sk=parkSk(tau3(twos(t))),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'right through')+.1;},
};

// ---------------------------------------------------------------- 4 · the lesson: chest, then shoot — before the block
const tau4=(t:number)=>key(t,mono([[0,TC-.6],[CUE(3,'control the ball'),TC-.2],[CUE(3,'with your chest'),TC],[CUE(3,'then shoot'),TF+.1],[CUE(3,'before the defender'),TS-.12],[CUE(3,'block'),TS],[SECS(3),TS+.1]]),linear);
const E4:V3=[PK[0]-5,2.4,PK[1]+7];
function cam4v(t:number):Cam{
 const tau=tau4(t),pk=atA(PARK,tau,1.1);
 return plan(t,[
  [0,0,()=>({P:E4,T:mix3(pk,[PCH[0],1.2,PCH[2]],.4),fov:30})],
  [CUE(3,'with your chest')-.3,1,()=>({P:add3(E4,[1,-.4,-1]),T:[PCH[0],1.2,PCH[2]],fov:24})],
  [CUE(3,'then shoot')-.3,1,()=>({P:add3(E4,[.5,0,0]),T:mix3(pk,[-4,.5,3],.45),fov:32})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tC=CUE(3,'with your chest'),tS=CUE(3,'then shoot'),tD=CUE(3,'before the defender'),tB=CUE(3,'block');
  stadium(s,c,MUNHAK,t,[2,3]);
  ground(s,c,MUNHAK);
  // "then shoot … before the defender can block": the shot lane (yellow) opens to goal; the defender's reach ringed red
  const ln=sm(tS-.1,tS+.5,t);if(ln>0){const a:V3=[PV[0],.03,PV[2]],e:V3=[lerp(PV[0],-.2,ln),.03,lerp(PV[2],PG[2],ln)];arrow3(s,c,K,[a,mix3(a,e,.5),e],Math.max(8,kAt(c,a)*.08),Y,.95);}
  groundRing(s,c,atA(SC,tau,0),1.2,R,sm(tD-.2,tD+.3,t));
  play(s,c,tau,tp,{min:14,cap:2});
  // "with your chest": a ring on the chest; "block": a red wall mark in front of the defender that arrives too late
  const cr=win(t,tC-.2,tS,.2);if(cr>0){const q=pr(c,PCH);if(q){const rr=Math.max(26,kAt(c,PCH)*.34);s.stroke(Y,polyPath(Array.from({length:24},(_,i)=>{const a=i/24*TAU;return[q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr] as Pt;}),true),Math.max(5,rr*.14),.95*cr);}}
  const bl=sm(tB-.2,tB+.3,t);if(bl>0){const[x,z]=posOf(SC,tau);const w=new Path2D(),a=pr(c,[x+.7,0,z-.6]),b=pr(c,[x+.7,1.3*bl,z-.6]);if(a&&b){w.addPath(ribbon([a,b],Math.max(6,kAt(c,[x,0,z])*.1),{taper:.1,wobble:.5}));s.fill(R,w,.9);}}
 },
 get still(){return CUE(3,'then shoot')+.4;},
};

const film:RisoStory={
 id:'park-portugal-2002',format:'11v11',title:"Park's World Cup winner",
 theme:'Control the ball with your chest, then shoot before the defender can block',
 ageNote:'Portugal 0–1 South Korea, World Cup, Incheon, 14 June 2002. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball drops onto the point, is cushioned (a ring) and flicked up. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const d=clamp(age/.3),up=clamp((age-.35)/.4),fade=1-clamp((age-.6)/.2),by=y-120*(1-d)*(1-d)-110*Math.sin(Math.PI*up),bx=x+60*up;
  if(age>.25&&age<.6)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const a=i/20*TAU;return[x+Math.cos(a)*50,y+Math.sin(a)*50] as Pt;}),true),8,.9*fade);
  footballPanels(s,bx,by,26,{rot:age*10+r()*TAU,key:K,shadow:G,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Portugal's goal line x = 0, +z = Korea's right) — checked by tests/play-film-park-portugal-2002.cjs. */
export const FACTS={P0,PCH,PFL,PV,PG,TC,TF,TS,TG,TB,BX,ballAt,shotFoot:'l' as const,
 park:(tau:number)=>{const sk=parkSk(tau);return{chest:sk.chest,lToe:sk.lToe,rToe:sk.rToe,lLaces:mix3(sk.lAn,sk.lToe,.6),rAn:sk.rAn};},
 leeContact:()=>{const st=stateOf(LEEK,0),sk=solve(st.pose,B_LEE,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 baia:(tau:number)=>{const st=stateOf(BAIA,tau),sk=solve(st.pose,B_BAIA,st.place);return{lAn:sk.lAn,rAn:sk.rAn,lHa:sk.lHa,rHa:sk.rHa,lKn:sk.lKn,rKn:sk.rKn,pelvis:sk.pelvis};},
 conceicao:(tau:number)=>{const st=stateOf(SC,tau),sk=solve(st.pose,B_SC,st.place);return{lToe:sk.lToe,rToe:sk.rToe,pelvis:sk.pelvis};},
 sub3};
