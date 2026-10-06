/** Sandro Tonali — "The Goal on His Premier League Debut" (lib/town/iconicPlays.json; lesson: "Arrive late in the box: a midfielder's run
 * is the hardest one for defenders to follow"). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A reconstruction from WRITTEN accounts and two broadcaster stills (the footage itself
 * was not reviewed), rendered as a riso print on the shared broadcast-pitch kit (lib/plays/riso/broadcast-pitch.ts).
 *
 * THE MOMENT: Newcastle United 5–1 Aston Villa, Premier League, St James' Park, 12 August 2023 (lunchtime kick-off), the 6th minute: Tonali
 * — on his debut after joining from Milan — started the move with an interception in central midfield, Joelinton and Anthony Gordon played a
 * one-two on the left, Gordon crossed from the left wing and Tonali, arriving untracked from midfield, slid/stretched in to volley past
 * Emiliano Martínez: 1–0.
 *
 * SOURCES (Sept 2026, read as raw pages; cached in the build scratchpad cf6/):
 *  - The Guardian, Louise Taylor, "Sandro Tonali and Alexander Isak star in Newcastle's rout of Aston Villa" (12 Aug 2023): "Tonali finished
 *    off a move he had started courtesy of a fine central midfield interception"; "After stretching to connect with a fine left wing cross
 *    dispatched by the outstanding Anthony Gordon, Howe's £50m summer signing from Milan volleyed the ball inexorably beyond Emiliano
 *    Martínez"; "Joelinton – who played a lovely one-two with Gordon in the preamble to Tonali's opener".
 *  - ESPN, match report (gameId 671037): Tonali 6'; "he slid in to volley home Anthony Gordon's cross"; Isak 16', 58', Wilson 77', Barnes
 *    90+1'; Diaby 11' for Villa.
 *  - Premier League, "Tonali's dream debut shows how he can drive Newcastle forward": "He ran untracked into the box to convert from a superb
 *    Anthony Gordon cross for the opening goal."
 *  - Sky Sports goal-clip stills (og:image of /watch/video/12938788 and /12938796, viewed): Newcastle in the black-and-white striped home
 *    shirt (Tonali, long dark hair; Bruno Guimarães); Villa (Diaby) in CLARET shirts with SKY-BLUE sleeves and white shorts; daylight.
 * CONFIRMED: match, date, venue, daytime, score, the minute; Tonali's interception starting the move; the Joelinton–Gordon one-two; Gordon's
 *   cross from the LEFT wing; Tonali running in untracked from midfield and sliding/stretching into a volley past Martínez; the kits
 *   (Newcastle striped home; Villa claret with sky-blue sleeves, white shorts).
 * INFERRED (illustrative reconstruction, never named in the narration): every position, pass, run and timing; the order of the one-two
 *   (Gordon → Joelinton → Gordon); Gordon's crossing foot (drawn RIGHT) and TONALI'S VOLLEYING FOOT (drawn RIGHT — no account I could read
 *   names it, so the narration never says which foot); where the ball entered the goal (drawn low, beyond Martínez); Martínez's kit (drawn
 *   yellow) and his reaction; Villa's socks (drawn sky blue); the other players; which end; the stands' shapes.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in near REAL TIME (interception, the one-two, the cross, the
 * sliding volley); ch2 = the REPLAY from high behind the move following Tonali's run from midfield (a yellow ribbon marks his run, nobody
 * follows); ch3 = a second replay low behind the goal (the stretch, the volley past the keeper); ch4 = the lesson: the move frozen as Gordon
 * crosses, with the defenders ringed on the attackers they watch and Tonali's late lane lit. Composed on the FULL sheet. Inks: yellow,
 * red (Villa claret — the closest ink; purple printed grey at card size), blue (sky, Villa sleeves, grass with yellow), navy (Newcastle stripes). All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,keeperSet,keeperDive,slideTackle,celebrate,blendPose,lunge,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type V3,type Build} from './athlete';
import {frame as framePitch,toCam,scr,pr,kAt,stadium,ground,drawScene,tracks,gnd,arrow3,groundRing,pathRibbon,estimate,mono,add3,mix3,yawTo,lerpAng,nrm2,win,
 DEJECT,BALL_R,kickerAt,blendShot,cam3,type Shot,type Pal,type StadiumSpec,type Cam,type State,type Fig} from './broadcast-pitch';
import {beats,shotAt,reframe,steady,focalOf,fovOf,near,type Beats,type Keep,type Subject,type ReframeOpts,type View as DView} from './director';

// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'First game',text:'Newcastle, 2023. Sandro Tonali\'s first Premier League game, against Aston Villa. He wins the ball in midfield, and keeps running. Anthony Gordon crosses from the left... Tonali slides in and volleys it home. Goal!',tail:2.4,
  cues:['Newcastle','Sandro Tonali','Aston Villa','wins the ball','keeps running','Anthony Gordon','crosses','slides in','volleys','Goal']},
 {label:'The late run',text:'Watch his run again. He comes from deep in midfield, and nobody follows him.',tail:1.8,
  cues:['Watch his run','comes from deep','midfield','nobody follows']},
 {label:'The volley',text:'From behind the goal: he stretches, meets the cross, and it flies past the keeper. Newcastle lead!',tail:2.2,
  cues:['From behind','stretches','meets the cross','flies past','Newcastle lead']},
 {label:'Arrive late',text:'Like Tonali: arrive late in the box. A midfielder\'s run is the hardest one for defenders to follow.',tail:2.2,
  cues:['Like Tonali','arrive late','in the box','hardest','defenders to follow']},
];
import timingJson from '../../../public/plays/narration/tonali-debut-2023/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail,'tonali');return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('tonali: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, stadium
const Y='yellow',P='red',B='blue',K='navy';
const PAL:Pal={Y,R:P,B,K};
/** St James' Park: no track, stands close to the pitch, two huge tiered stands and a lower end; a daytime August crowd in black and white
 * with Villa's claret-and-blue away end (inferred layout). */
const SJP:StadiumSpec={pal:PAL,side:41,end:10,rake:34,height:40,tiers:[.36,.68],roof:true,track:null,night:false,seats:[[K,.35],[B,.12]],
 crowdInks:['paper',[K,.95],P,B,Y],boards:K,
 crowd:(si,a,h,hb)=>{if(si===3&&a>.72)return hb<.6?2:hb<.85?3:0;return hb<.46?0:hb<.9?1:h<.9?3:4;}};

// ---------------------------------------------------------------- the cast: kits
const SKIN_L:InkFill[]=[[Y,.35],[P,.12]],SKIN_M:InkFill[]=[[Y,.42],[P,.2],[B,.06]],SKIN_D:InkFill[]=[[P,.4],[Y,.5],[K,.22]];
/** Newcastle home 2023–24: black-and-white stripes (paper shirt, navy stripes), black shorts, black socks; paper numbers on the back panel */
const nuf=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:K,shorts:K,socks:K,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,number:n,numberInk:K,hairStyle:'short',build:{height:1.82},seed:n,...o});
/** Aston Villa (Sky still): claret shirt with sky-blue sleeves (printed by drawPlayer), white shorts; socks drawn sky blue (inferred) */
const avl=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:P,shorts:'paper',socks:B,boots:K,skin:SKIN_L,hair:K,line:K,trim:B,number:null,hairStyle:'short',build:{height:1.84},seed:60,...o});
const B_TON:Build={height:1.81,bulk:.96},B_GOR:Build={height:1.83,bulk:.94},B_EMI:Build={height:1.95};
const TON_ST=nuf(8,{build:B_TON,hairStyle:'long',hair:K});
const EMI_ST:AthleteStyle={shirt:Y,shorts:Y,socks:Y,boots:K,skin:SKIN_L,hair:K,line:K,gloves:'paper',sleeves:'long',number:1,numberInk:K,hairStyle:'short',build:B_EMI,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Gordon's cross)
/** TC = the sliding volley, TG = over the line */
const TC=1.05,TG=TC+.36;
/** the build-up: the Villa pass Tonali intercepts, his pass to Gordon, Gordon → Joelinton → Gordon (the one-two), the cross spot */
const TI=-9,TT=-8.2,TGJ=-3.5,TJG=-2.6,TGT=-1.1;
const VA:V3=[-41,BALL_R,-13],TIP:V3=[-50.5,BALL_R,-3.5],GP:V3=[-35,BALL_R,-25],GB:V3=[-27,BALL_R,-25.6],JP:V3=[-22.5,BALL_R,-17.5],GR:V3=[-12.4,BALL_R,-27],P0:V3=[-9.6,BALL_R,-25.4];
/** Tonali's slide spot (pelvis) and heading: arriving from deep, sliding across the ball toward goal */
const SP:[number,number]=[-8.1,1.4],YAW_S=yawTo(1,-.28);
const SLIDE_C=.44;// slideTackle contact (the lead RIGHT leg long and low)
const slide=(tau:number)=>slideTackle(clamp(SLIDE_C+(tau-TC)/1.1),{foot:'r'});
/** where his pelvis must be so the right laces meet the ball at TC (solved) */
const SK_C=solve(slide(TC),B_TON,{x:0,z:0,yaw:YAW_S});
const PC:V3=(()=>{const m=mix3(SK_C.rAn,SK_C.rToe,.62);return[SP[0]+m[0],Math.max(BALL_R+.02,m[1]+.06),SP[1]+m[2]];})();
const DGC=nrm2(PC[0]-P0[0],PC[2]-P0[2]),PGC=kickerAt(P0,DGC,B_GOR,'r');
const DTP=nrm2(GP[0]-TIP[0],GP[2]-TIP[2]),PTP=kickerAt(TIP,DTP,B_TON,'r');
const DJ=nrm2(GR[0]-JP[0],GR[2]-JP[2]),PJ=kickerAt(JP,DJ,{height:1.86,bulk:1.08},'r');
const DG1=nrm2(JP[0]-GB[0],JP[2]-GB[2]),PG1=kickerAt(GB,DG1,B_GOR,'r');
type Role='ton'|'gor'|'joe'|'emi'|'nuf'|'avl'|'avp';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean;sleeves?:boolean};
const T0=-11,T1=8;
const ACTORS:Actor[]=[
 {name:'Sandro Tonali',role:'ton',hero:true,style:TON_ST,keys:[[T0,-52,-1],[TI-.6,TIP[0]-1.2,TIP[2]+.9],[TT,...PTP],[TT+1,-47,-2.5],[-5,-33,-1.5],[-2,-20,0],[0,-12.4,1.3],[TC-SLIDE_C*1.1,SP[0],SP[1]],[TC+1.3,SP[0],SP[1]],[TC+3,-6,5],[T1,-5,14]]},
 {name:'Anthony Gordon',role:'gor',hero:true,style:nuf(10,{build:B_GOR,hair:[Y,.5]}),keys:[[T0,-40,-27],[TT,-38,-26],[TT+1.3,GP[0]-.8,GP[2]-.3],[TGJ-.1,...PG1],[TJG,-22,-27],[TGT,GR[0]-1,GR[2]],[-.2,PGC[0]-DGC[0]*.6,PGC[1]-DGC[1]*.6],[0,...PGC],[1.2,-6,-23],[T1,-3,-18]]},
 {name:'Joelinton',role:'joe',hero:true,style:nuf(7,{build:{height:1.86,bulk:1.08},skin:SKIN_M}),keys:[[T0,-34,-12],[TGJ-1.5,-26,-15.5],[TJG-.1,...PJ],[TJG+.8,-19,-14],[T1,-14,-10]]},
 {name:'Emiliano Martínez',role:'emi',hero:true,style:EMI_ST,keys:[[T0,-2,1],[-1,-1.8,-.6],[.4,-1.3,-1.6],[TC,-1.2,-1.5],[T1,-1.2,-1.5]]},
 {name:'Villa midfielder (the intercepted pass)',role:'avp',sleeves:true,style:avl({seed:61}),keys:[[T0,-42,-14],[TI-.9,VA[0]-.6,VA[2]-.3],[TI+1,-43,-11],[T1,-30,-4]]},
 {name:'Villa right-back (with Gordon)',role:'avl',hero:true,sleeves:true,style:avl({seed:62,build:{height:1.78}}),keys:[[T0,-30,-22],[TGJ,-24,-23],[TGT,-15,-24.5],[0,-11,-23],[TC,-10.4,-22.4],[T1,-9,-20]]},
 {name:'Villa centre-back (with Isak)',role:'avl',sleeves:true,style:avl({seed:63,build:{height:1.92}}),keys:[[T0,-14,-4],[-2,-8.5,-2.6],[TC,-6.4,-2],[T1,-6.2,-1.8]]},
 {name:'Villa centre-back',role:'avl',sleeves:true,style:avl({seed:64,build:{height:1.9}}),keys:[[T0,-14,4],[-2,-8.8,3],[TC,-6.8,3.6],[T1,-6.5,3.4]]},
 {name:'Villa left-back',role:'avl',sleeves:true,style:avl({seed:65}),keys:[[T0,-18,14],[-2,-10,10],[TC,-8.6,8.8],[T1,-8.4,8.6]]},
 {name:'Villa midfielder (watching the ball)',role:'avl',sleeves:true,style:avl({seed:66}),keys:[[T0,-40,-4],[-4,-26,-9],[0,-17,-10],[TC,-15.4,-9.4],[T1,-14,-8]]},
 {name:'Alexander Isak',role:'nuf',style:nuf(14,{build:{height:1.92,bulk:.92},skin:SKIN_D}),keys:[[T0,-20,-4],[-2,-9.4,-3.2],[TC,-5.6,-1.4],[T1,-5.4,-1]]},
 {name:'Miguel Almirón',role:'nuf',style:nuf(24,{build:{height:1.74},skin:SKIN_M}),keys:[[T0,-26,18],[-2,-14,10],[TC,-11,7],[T1,-10,6]]},
 {name:'Bruno Guimarães',role:'nuf',style:nuf(39,{skin:SKIN_M,hair:[Y,.5]}),keys:[[T0,-54,6],[-4,-40,2],[TC,-30,-1],[T1,-26,-1]]},
];
const TON=0,GOR=1,JOE=2,EMI=3;
const TR=tracks(ACTORS,T0,T1);
const posOf=TR.posOf,distOf=TR.distOf;

// ---------------------------------------------------------------- the ball
/** where it crosses the line: low, beyond Martínez (inferred) */
const PG:V3=[0,.5,1.7],NETP:V3=[1.7,.55,1.9],REST:V3=[1.6,BALL_R,1.8];
const fly=(A:V3,Bp:V3,d:number):V3=>[(Bp[0]-A[0])/d,(Bp[1]-A[1]+4.905*d*d)/d,(Bp[2]-A[2])/d];
const at=(A:V3,V:V3,t:number):V3=>[A[0]+V[0]*t,A[1]+V[1]*t-4.905*t*t,A[2]+V[2]*t];
const V_CROSS=fly(P0,PC,TC),V_SHOT=fly(PC,PG,TG-TC);
const roll=(A:V3,Bp:V3,t0:number,t1:number,tau:number):V3=>{const u=clamp((tau-t0)/(t1-t0)),s=u*(1.35-.35*u);return mix3(A,Bp,s);};
function ballAt(tau:number):V3{
 if(tau<TI-1.1)return VA;
 if(tau<TI)return roll(VA,TIP,TI-1.1,TI,tau);
 if(tau<TT)return mix3(TIP,[TIP[0]+.4,BALL_R,TIP[2]+.1],sm(TI,TT,tau));
 if(tau<TT+1.3)return roll([TIP[0]+.4,BALL_R,TIP[2]+.1],GP,TT,TT+1.3,tau);
 if(tau<TGJ){const u=(tau-TT-1.3)/(TGJ-TT-1.3);return mix3(GP,GB,u);}
 if(tau<TJG)return roll(GB,JP,TGJ,TJG,tau);
 if(tau<TGT)return roll(JP,GR,TJG,TGT,tau);
 if(tau<0)return mix3(GR,P0,easeOut((tau-TGT)/-TGT));
 if(tau<TC)return at(P0,V_CROSS,tau);
 if(tau<TG)return at(PC,V_SHOT,tau-TC);
 if(tau<TG+.2)return mix3(PG,NETP,easeOut((tau-TG)/.2));
 const u=clamp((tau-TG-.2)/.4);return[lerp(NETP[0],REST[0],u),lerp(NETP[1],REST[1],u*u),lerp(NETP[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau*TAU*(tau<TC?1.3:3);
const bulgeAt=(tau:number)=>tau<TG+.06?0:.8*Math.exp(-(tau-TG-.06)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses
function kick(pose:Pose,tau:number,tc:number,foot:'l'|'r',dur=.9,w=1):Pose{const ww=win(tau,tc-.5,tc+.7,.2)*w;return ww>0?blendPose(pose,strike(clamp((tau-tc)/dur+STRIKE_CONTACT),{foot}),ww):pose;}
const TSL=TC-SLIDE_C*1.1;// the slide starts here
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x0,z0]=posOf(k,tau),b=ballAt(tau);let x=x0,z=z0,pose=TR.loco(k,tau),yaw=TR.faceYaw(k,tau,b);
 switch(a.role){
  case 'ton':{
   // the interception (a step and a block with the right), the pass left, the long run; then the slide: the pelvis is placed exactly
   if(tau>TI-.5&&tau<TI+.4)pose=blendPose(pose,lunge(clamp((tau-(TI-.5))/.8),{side:'r'}),win(tau,TI-.5,TI+.4,.15));
   pose=kick(pose,tau,TT,'r',.8,.9);if(tau<TT+.5&&tau>TT-.8)yaw=lerpAng(yaw,yawTo(DTP[0],DTP[1]),win(tau,TT-.8,TT+.5,.2));
   if(tau>TSL-.25&&tau<TC+1.3){const w=sm(TSL-.25,TSL,tau)*(1-sm(TC+.9,TC+1.3,tau));pose=blendPose(pose,slide(tau),w);yaw=lerpAng(yaw,YAW_S,w);
}
   if(tau>TG+.5){const run=celebrate(distOf(k,tau)/4,{kind:'run'});pose=blendPose(pose,run,sm(TG+.8,TG+1.5,tau));}break;}
  case 'gor':{pose=kick(pose,tau,TGJ,'r',.85);pose=kick(pose,tau,0,'r',.85);
   if(tau<TGJ+.5&&tau>TGJ-.8)yaw=lerpAng(yaw,yawTo(DG1[0],DG1[1]),win(tau,TGJ-.8,TGJ+.5,.2));
   const w=sm(-.5,-.15,tau)*(1-sm(.5,1,tau));yaw=lerpAng(yaw,yawTo(DGC[0],DGC[1]),w);
   if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;}
  case 'joe':pose=kick(pose,tau,TJG,'r',.8);if(tau<TJG+.5&&tau>TJG-.8)yaw=lerpAng(yaw,yawTo(DJ[0],DJ[1]),win(tau,TJG-.8,TJG+.5,.2));
   if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
  case 'emi':{pose=keeperSet(Math.min(tau,TC)*1.3);const t0=TC-.02;
   if(tau>t0)pose=blendPose(pose,keeperDive(clamp((tau-t0)/1.1),{side:'l',height:.25}),.7*sm(t0,t0+.12,tau)*(1-sm(TG+1,TG+1.6,tau)));
   if(tau>TG+1.3)pose=blendPose(pose,DEJECT,sm(TG+1.5,TG+2.2,tau)*.6);yaw=TR.faceYaw(k,Math.min(tau,TC),ballAt(Math.min(tau,TC)));break;}
  case 'avp':pose=kick(pose,tau,TI-1.1,'r',.8);break;
  case 'avl':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TC)yaw=TR.faceYaw(k,TC,ballAt(TC));break;
  case 'nuf':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;cap?:number}={}){
 const figs:Fig[]=ACTORS.map((a,k)=>{const hero=!!a.hero;return{st:stateOf(k,tau),prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,sleeves:a.sleeves?B:null,
  smear:o.smear&&((k===TON&&tau>TSL&&tau<TC+.35)||(k===GOR&&tau>-.25&&tau<.35)||(k===EMI&&tau>TC&&tau<TG+.4))};});
 return drawScene(s,c,PAL,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2],by:.6},o.cap);
}
const atA=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- the director (lib/plays/riso/director.ts): closer, eased camera moves
/** the kit's frame(), plus the two numbers the director needs (the kit keeps them private): its lens factor (the same formula as
 * broadcast-pitch.ts frame(), so cam3's makeCamera size is 1080·LENS) and the window in camera units (frame() calls s.camera(…,1/s.fit)) */
let LENS=1,DV:DView={w:1566,h:1080};
function frame(s:Sheet){framePitch(s);LENS=Math.pow(Math.min(1,s.W/1620),.6);DV={w:s.W,h:s.H};}
/** the kit's plan(), but each authored Shot is moved toward the beat's framing (reframe), averaged over ±.5 s (steady) so a keep point
 * ramping in never pops the framing; rebuilt with the kit's own cam3 */
function plan(t:number,steps:[number,number,(t:number)=>Shot][],B?:Beats,subj?:(t:number)=>Subject,o:ReframeOpts={}):Cam{
 const authored=(u:number):Shot=>{let cur=steps[0][2](u);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const w=sm(a,a+Math.max(.01,d),u,easeInOutSine);if(w>0)cur=blendShot(cur,f(u),w);}return cur;};
 if(!B||!subj){const c=authored(t);return cam3(c.P,c.T,c.fov);}
 const size=1080*LENS,at=(u:number)=>{const c=authored(u);return reframe({eye:c.P,target:c.T,F:focalOf(c.fov,size)},subj(u),shotAt(u,B),DV,o);};
 const r=steady(t,at,.5);return cam3(r.eye,r.target,fovOf(r.F,size));}
const pos3=(k:number,tau:number,y=0):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
/** a player's feet and head as keep points, weight w (0 = not kept). Weights stay below .99 (soft) so a ramping keep never flips into the
 * director's hard set (recenter's aim) within a frame */
const body=(k:number,tau:number,w:number):Keep[]=>w<=.01?[]:[{P:pos3(k,tau),w},{P:pos3(k,tau,1.85),w}];
const VILLA=[4,5,6,7,8,9];

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
function tau1(t:number){const tW=CUE(0,'wins the ball')+.2,tG=CUE(0,'Anthony Gordon')+.1,tC=CUE(0,'crosses')+.2,tS=CUE(0,'slides in')+.3,S=SECS(0);
 return key(t,mono([[0,Math.max(T0+.2,TI-tW*.8)],[tW,TI],[tG,TGT-.4],[tC,0],[tS,TC],[S+1,TC+S+1-tS]]),linear);}
const P1:V3=[-26,27,76];
/** Director beats: a short establishing wide of St James' Park; follow Tonali to the ball; push in low as he wins it (the interception that
 * starts the move); back to following his run; pull out for the one-two and Gordon's cross (Gordon, the ball and Tonali's run all in
 * frame — the space he runs into is the lesson); push in low for the sliding volley; hold on him for the goal. Tonali is the hero throughout. */
const B1=beats([[0,'wide'],[1.2,'follow'],[CUE(0,'wins the ball')-.4,'tight'],[CUE(0,'keeps running')-.3,'follow'],
 [CUE(0,'Anthony Gordon')-.4,{from:'space',size:.24,low:.5}],[CUE(0,'slides in')-.45,'tight'],[CUE(0,'Goal')+.3,'reaction']]);
function subj1(tau:number):Subject{const h=pos3(TON,tau),g=sm(TGT-1.4,TGT-.8,tau,easeInOutSine)*(1-sm(.3,.9,tau,easeInOutSine)),
  wb=sm(TI-.85,TI-.3,tau,easeInOutSine)*(1-sm(TG+1.6,TG+2.2,tau,easeInOutSine)),b=ballAt(tau);
 // the ball eases in as the kept point as the Villa pass he intercepts nears him (before that it is 10–16 m off with the Villa midfielder),
 // and eases out once it has been in the net for a beat (the camera then holds on the scorer): the director's `ball` slides continuously
 // from his chest to the real ball, so the aim and the fit never switch within a frame
 return{hero:h,height:1.81,ball:mix3([h[0],1,h[2]],b,wb),keep:[...body(GOR,tau,.98*g),...near(h,[...VILLA,EMI,10,11].map(k=>pos3(k,tau)),5,9)]};}
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:mix3(gnd(b,1),atA(TON,tau,1),.5),fov:13})],
  [CUE(0,'keeps running')-.3,1.2,()=>({P:P1,T:mix3(gnd(b,1),atA(TON,tau,1),.45),fov:17})],
  [CUE(0,'Anthony Gordon')-.3,1,()=>({P:P1,T:mix3(gnd(b,1),atA(TON,tau,1),.4),fov:14})],
  [CUE(0,'crosses')-.2,.8,()=>({P:P1,T:mix3(add3(gnd(b),[0,.8,0]),[SP[0],1,SP[1]],.4+.5*sm(0,TC,tau)),fov:11})],
  [CUE(0,'slides in')-.2,.6,()=>({P:P1,T:[lerp(SP[0],-2,sm(TC,TG,tau)),.9,lerp(SP[1],1,sm(TC,TG,tau))],fov:9})],
  [CUE(0,'Goal')+.3,1.5,()=>{const w=atA(TON,tau,1.2);return{P:P1,T:mix3(w,[-6,1.2,3],.3),fov:11};}],
 ],B1,u=>subj1(tau1(u)),{recenter:.5});
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tA=CUE(0,'Goal');
  stadium(s,c,SJP,t,[2,1,3],{roar:sm(TG,TG+.5,tau),flash:sm(tA-.1,tA+.4,t)*(1-sm(tA+2.2,tA+3,t))});
  ground(s,c,SJP);
  play(s,c,tau,tp,{min:17,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P0b=ballAt(tau1(twos(t))),q=toCam(c,P0b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'slides in')+.3;},
};

// ---------------------------------------------------------------- 2 · the replay from high behind the move: Tonali's run from midfield
const tau2=(t:number)=>key(t,mono([[0,TT],[CUE(1,'comes from deep'),-6.2],[CUE(1,'midfield'),-5],[CUE(1,'nobody follows'),-2.2],[SECS(1),TC-.1]]),linear);
/** Director beats: the replay follows Tonali's run from midfield at once (closer than the live shot, the yellow ribbon of his run behind
 * him); on "nobody follows" it eases out so the two Villa centre-backs he runs past (ringed in purple, watching the ball) are in frame with
 * him (the midfielder and left-back beside him were outside the authored frame too, so they are not forced in). */
const B2=beats([[0,{from:'follow',ball:.2}],[CUE(1,'nobody follows')-.5,{from:'space',size:.26,ball:.5}]]);
/** subject: Tonali; `ball` is the replay's lead point (the authored aim, 10 m ahead of him toward the box: there is no ball near him in
 * this replay), so the follow keeps the space he runs into ahead of him and the pull-out aims between him and the defenders */
function subj2(t:number):Subject{const tau=tau2(t),h=pos3(TON,tau),tN=CUE(1,'nobody follows'),w=sm(tN-.6,tN,t,easeInOutSine);
 return{hero:h,height:1.81,ball:add3(h,[10,1,-3]),keep:[6,7].flatMap(k=>body(k,tau,w*.8))};}
function cam2(t:number):Cam{
 const tau=tau2(t),tn=atA(TON,tau,1);
 return plan(t,[
  [0,0,()=>({P:add3(tn,[-11,7,-4]),T:add3(tn,[9,0,-2]),fov:38})],
  [CUE(1,'nobody follows')-.3,1.2,()=>({P:add3(tn,[-10,7.5,-3]),T:add3(tn,[10,0,-3]),fov:44})],
 ],B2,subj2);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tN=CUE(1,'nobody follows'),tD=CUE(1,'comes from deep');
  stadium(s,c,SJP,t,[1,0,2]);
  ground(s,c,SJP);
  // replay graphic: Tonali's run so far (yellow ribbon) from "comes from deep"; the defenders' eyes stay on the ball (purple rings) on "nobody follows"
  const pts:V3[]=[];for(let i=0;i<=24;i++){const[x,z]=posOf(TON,lerp(TT,tau,i/24));pts.push([x,.02,z]);}pathRibbon(s,c,pts,Y,sm(tD-.2,tD+.3,t),.9);
  const nf=sm(tN-.2,tN+.3,t);if(nf>0)for(let k=6;k<=9;k++)groundRing(s,c,atA(k,tau,0),1,P,nf);
  play(s,c,tau,tp,{min:11,cap:2});
 },
 aperture(t){const c=cam2(t),st=stateOf(TON,tau2(twos(t))),sk=solve(st.pose,B_TON,st.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(1,'nobody follows')+.4;},
};

// ---------------------------------------------------------------- 3 · a second replay low behind the goal: the stretch, the volley, past the keeper
const tau3=(t:number)=>key(t,mono([[0,-.6],[CUE(2,'stretches'),TSL],[CUE(2,'meets the cross'),TC],[CUE(2,'flies past'),TG-.05],[CUE(2,'Newcastle lead'),TG+.8],[SECS(2),TG+2.8]]),linear);
const E3:V3=[10,3.4,4.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),tn=atA(TON,tau,.8);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(tn,gnd(ballAt(tau),1),.4),fov:34})],
  [CUE(2,'stretches')-.2,.7,()=>({P:add3(E3,[-2,-1.2,-.8]),T:[PC[0],.6,PC[2]],fov:26})],
  [CUE(2,'flies past')-.2,.5,()=>({P:add3(E3,[-2.4,-1.4,-1]),T:[-1.4,.7,.6],fov:28})],
  [CUE(2,'Newcastle lead')+.1,1.4,()=>({P:[3,5,-14],T:mix3(atA(TON,tau,1.2),[-6,1,3],.3),fov:32})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tE=CUE(2,'Newcastle lead');
  stadium(s,c,SJP,t,[3,0,2],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tE,tE+.3,t))});
  ground(s,c,SJP);
  const cf=1-sm(TC+.1,TC+.5,tau);if(cf>0&&tau>0){const pts:V3[]=[];for(let i=0;i<=14;i++)pts.push(ballAt(lerp(Math.max(0,tau-.9),Math.min(tau,TC),i/14)));pathRibbon(s,c,pts,Y,cf,.22);}
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06),cap:2});
  const hit=(tau-TC)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4),{n:9,seed:29,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 // the passage opens from the scorer, not an empty point in the net (that showed a blank green disc in the mesh)
 aperture(t){const c=cam3v(t),st=stateOf(TON,tau3(twos(t))),sk=solve(st.pose,B_TON,st.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'meets the cross')+.1;},
};

// ---------------------------------------------------------------- 4 · the lesson: frozen as Gordon crosses — defenders watch the ball and the forwards, the late runner is free
const tau4=(t:number)=>key(t,mono([[0,-2.2],[CUE(3,'arrive late'),-1.4],[CUE(3,'in the box'),-.5],[CUE(3,'hardest'),-.15],[CUE(3,'defenders to follow'),0],[SECS(3),.12]]),linear);
const E4:V3=[-28,9,-15];
/** Director beats (the lesson): closer on Tonali, frozen as Gordon crosses; as the yellow lane grows to the slide spot ("arrive late")
 * the spot is kept in frame, and on "hardest" it eases out so the ringed Villa back three in the box (both centre-backs, the left-back), all watching the
 * ball, are in frame with him. */
const B4=beats([[0,'lesson'],[CUE(3,'hardest')-.5,{from:'lesson',size:.26}]]);
function subj4(t:number):Subject{const tau=tau4(t),h=pos3(TON,tau),tA=CUE(3,'arrive late'),tH=CUE(3,'hardest'),wa=sm(tA-.4,tA+.3,t,easeInOutSine),wd=sm(tH-.6,tH,t,easeInOutSine);
 return{hero:h,height:1.81,keep:[...(wa>.01?[{P:[SP[0],0,SP[1]] as V3,w:.98*wa}]:[]),...[6,7,8].flatMap(k=>body(k,tau,wd*.8))]};}
function cam4v(t:number):Cam{
 const tau=tau4(t),tn=atA(TON,tau,1);
 return plan(t,[
  [0,0,()=>({P:E4,T:mix3(tn,[-10,.5,-4],.5),fov:28})],
  [CUE(3,'in the box')-.3,1,()=>({P:add3(E4,[3,-1,0]),T:mix3(tn,[-9,.5,-2],.45),fov:27})],
  [CUE(3,'defenders to follow')-.3,1,()=>({P:add3(E4,[4,-1,2]),T:[-10,.5,-2],fov:30})],
 ],B4,subj4,{recenter:.5});
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tA=CUE(3,'arrive late'),tB=CUE(3,'in the box'),tH=CUE(3,'hardest'),tF=CUE(3,'defenders to follow');
  stadium(s,c,SJP,t,[2,1]);
  ground(s,c,SJP);
  // "arrive late": Tonali's lane into the box (yellow arrow grows to the slide spot); "in the box": the box edge glows
  const al=sm(tA-.2,tA+.4,t);if(al>0){const a=atA(TON,tau,.02),e:V3=[lerp(a[0],SP[0],sm(tA,tA+1.2,t)),.02,lerp(a[2],SP[1],sm(tA,tA+1.2,t))];arrow3(s,c,K,[a,mix3(a,e,.5),e],Math.max(8,kAt(c,a)*.09),Y,.95*al);}
  const bx=sm(tB-.2,tB+.4,t)*(1-sm(tH+.3,tH+.8,t));if(bx>0){const pts:V3[]=[[0,.02,-20.16],[-16.5,.02,-20.16],[-16.5,.02,20.16],[0,.02,20.16]];pathRibbon(s,c,pts,Y,bx*.8,.35);}
  // "defenders to follow": purple rings on the Villa back line, all turned to the ball and the forwards in front of them
  const df=sm(tH-.2,tH+.3,t);if(df>0)for(let k=5;k<=9;k++)groundRing(s,c,atA(k,tau,0),1,P,df);
  groundRing(s,c,atA(TON,tau,0),1.2,Y,sm(tF-.2,tF+.3,t));
  play(s,c,tau,tp,{min:13,cap:2});
 },
 get still(){return CUE(3,'hardest')+.4;},
};

const film:RisoStory={
 id:'tonali-debut-2023',format:'11v11',title:"Tonali's debut goal",
 theme:"Arrive late in the box: a midfielder's run is the hardest one for defenders to follow",
 ageNote:'Newcastle 5–1 Aston Villa, Premier League, St James\' Park, 12 August 2023. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a late run — a yellow lane darts in from behind the point and a ball arrives to meet it. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.5),fade=1-clamp((age-.6)/.2);
  if(fade>0){const pts:Pt[]=[];for(let i=0;i<=8;i++){const q=i/8*u;pts.push([x-140+140*q,y+60-60*q]);}if(pts.length>2)s.fill(Y,ribbon(pts,12,{taper:.7,wobble:.4}),.9*fade);}
  footballPanels(s,x+120-120*u,y-80*Math.sin(Math.PI*u*.5),24,{rot:age*12+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Villa's goal line x = 0, +z = Newcastle's right) — checked by tests/play-film-tonali-debut-2023.cjs. */
export const FACTS={P0,PC,PG,TC,TG,TI,TIP,ballAt,volleyFoot:'r' as const,
 tonali:(tau:number)=>{const st=stateOf(TON,tau),sk=solve(st.pose,B_TON,st.place);return{rLaces:mix3(sk.rAn,sk.rToe,.62),lToe:sk.lToe,rToe:sk.rToe,pelvis:sk.pelvis};},
 gordonContact:()=>{const st=stateOf(GOR,0),sk=solve(st.pose,B_GOR,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 joelintonContact:()=>{const st=stateOf(JOE,TJG),sk=solve(st.pose,{height:1.86,bulk:1.08},st.place);return{rToe:sk.rToe};},JP,
 posOf:(k:number,tau:number)=>posOf(k,tau),
 emi:(tau:number)=>{const st=stateOf(EMI,tau),sk=solve(st.pose,B_EMI,st.place);return{lHa:sk.lHa,rHa:sk.rHa};}};
