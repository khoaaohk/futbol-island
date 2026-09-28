/** Gareth Bale — "The Overhead Kick in the Final" (lib/town/iconicPlays.json; lesson: "Be brave when the ball is in the air and keep your
 * eyes on it as you kick"). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the footage itself was not reviewed),
 * rendered as a riso print on the shared broadcast-pitch kit (lib/plays/riso/broadcast-pitch.ts).
 *
 * THE MOMENT: Real Madrid 3–1 Liverpool, UEFA Champions League final, NSC Olimpiyskiy, Kyiv, 26 May 2018. 1–1 (Benzema 51', Mané 55');
 * Bale came on for Isco in the 61st minute and, about two minutes later (64'), scored with an overhead (bicycle) kick from Marcelo's
 * cross from the left: 2–1. Madrid won 3–1 (Bale again, 83'); Bale was man of the match.
 *
 * SOURCES (Sept 2026, read as raw pages; cached in the build scratchpad cf6/):
 *  - Wikipedia, "2018 UEFA Champions League final" (raw wikitext): date, NSC Olimpiyskiy, Kyiv; 61,561; "Sunny, 20 °C" at kick-off (20:45
 *    local, so the 64th minute is under floodlights at dusk); Benzema 51', Mané 55'; "Gareth Bale was substituted in for Isco in the 61st
 *    minute and scored Madrid's second goal two minutes later, using an acrobatic bicycle kick to finish a cross by Marcelo from the left";
 *    kits (Real Madrid all white, Liverpool all red); numbers (Bale 11, Marcelo 12, Casemiro 14, Ronaldo 7, Benzema 9, Modrić 10, Kroos 8;
 *    Karius 1, Alexander-Arnold 66, Van Dijk 4, Lovren 6, Robertson 26, Mané 19, Henderson 14).
 *  - The Guardian, Daniel Taylor, "Real Madrid win Champions League as brilliant Bale sinks Liverpool" (26 May 2018): "a twisting, mid-air
 *    bicycle kick to redirect Marcelo's left-wing cross and flash the ball into Liverpool's net".
 *  - BBC Sport, Phil McNulty, "Real Madrid 3-1 Liverpool" (26 May 2018): "a magnificent overhead kick to put Real 2-1 up after 64 minutes".
 *  - 90min, "Anatomy of a goal: Gareth Bale's overhead kick in the 2018 Champions League final": "Casemiro's clever chipped ball over the top
 *    of the Liverpool midfield found countryman Marcelo, who was quickly closed down by Trent Alexander-Arnold. The Brazilian cut inside onto
 *    his weaker right foot"; the cross "was under-hit"; Benzema and Ronaldo close together in the box.
 *  - Search summaries of the same accounts (90min / Goal): "a jaw-dropping left-foot overhead volley"; "met the ball with the outside of his
 *    left boot … dipping under the bar and into the top left corner".
 * CONFIRMED: match, date, venue, score before/after (1–1 → 2–1), the minute, Bale's sub two minutes earlier, Casemiro's chip to Marcelo,
 *   Alexander-Arnold closing Marcelo, Marcelo cutting inside onto his RIGHT foot to cross from the LEFT, an under-hit cross, the overhead
 *   kick with Bale's LEFT foot (outside of the boot), the ball into the TOP LEFT corner (the attacker's left = Karius's right), kits, numbers.
 * INFERRED (illustrative reconstruction, never named in the narration): every position, run and timing in metres and seconds; Bale near the
 *   penalty spot with his back to goal, facing the crosser; the jump mechanics (the bicycle key poses follow ronaldo-bicycle-2018.ts, mirrored
 *   for the left foot); Karius's small late step (the accounts only say he could not reach it) and his kit (drawn grey-blue); Bale's hair
 *   tied back; where the other players stood; which stands the fans filled; the running track's colour; the roof; the broadcast side (main
 *   camera on Madrid's right, Madrid attacking left → right on screen).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Marcelo's cross drops behind Bale, the overhead
 * kick, the goal); ch2 = the slow-motion REPLAY from a low camera side-on to Bale (back to goal, eyes on the ball, the left foot swings up);
 * ch3 = a second replay high behind the goal (it flies into the top corner past Karius); ch4 = the lesson on the frozen jump (a sight line
 * from his eyes to the ball, a ring on the ball, the left boot's arc). Composed on the FULL sheet, so it frames from the 1.45:1 card window
 * down to square. Inks: yellow, red, blue, navy (Liverpool red, floodlit navy sky, grass = yellow × blue). All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,polyPath,ribbon,easeOut,easeOutBack,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {solve,strike,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,clampPose,mirrorPose,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type V3,type Build} from './athlete';
import {frame,cam3,toCam,scr,pr,kAt,stadium,ground,drawScene,tracks,plan,gnd,arrow3,groundRing,pathRibbon,estimate,mono,add3,sub3,mix3,len3,yawTo,lerpAng,nrm2,win,
 DEJECT,BALL_R,kickerAt,type Pal,type StadiumSpec,type Cam,type State,type Fig,type Shot} from './broadcast-pitch';

// ---------------------------------------------------------------- narration + timing
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Two minutes on',text:'Kyiv, 2018, the Champions League final. Real Madrid and Liverpool are level. Gareth Bale has just come on. Marcelo crosses from the left, but it drops behind him... so Bale kicks it over his head. Goal!',tail:2.4,
  cues:['Kyiv','Champions League final','Real Madrid','Gareth Bale','Marcelo crosses','drops behind','kicks it over','Goal']},
 {label:'Back to goal',text:'Watch again. His back is to the goal. Eyes on the ball, he swings his left foot up high.',tail:1.8,
  cues:['Watch again','His back','Eyes on the ball','swings','left foot','up high']},
 {label:'Top corner',text:'From behind the goal: it flies over the keeper, into the top corner. Madrid lead, two goals to one!',tail:2.2,
  cues:['From behind','flies over','top corner','Madrid lead','two goals']},
 {label:'Be brave',text:'Like Bale: be brave when the ball is in the air, and keep your eyes on it as you kick.',tail:2.2,
  cues:['Like Bale','be brave','in the air','keep your eyes','as you kick']},
];
import timingJson from '../../../public/plays/narration/bale-overhead-2018/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail,'bale');return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('bale: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, stadium
const Y='yellow',R='red',B='blue',K='navy';
const PAL:Pal={Y,R,B,K};
/** NSC Olimpiyskiy: an athletics bowl (running track), one big sweep of seats, a ring roof; evening under floodlights. Crowd (inferred):
 * Liverpool red behind one goal (stand 3) and in patches, Madrid white behind the other (stand 1). */
const OLIMP:StadiumSpec={pal:PAL,side:48,end:17,rake:40,height:30,tiers:[.5],roof:true,track:B,night:true,seats:[[B,.3],[K,.3]],
 crowdInks:['paper',R,[K,.9],Y],boards:B,
 crowd:(si,a,h,hb)=>{const red=si===3?.7:si===1?.1:a<.5===(si===0)?.45:.25,white=si===1?.62:si===3?.06:.3;return hb<red?1:hb<red+white?0:h<.9?2:3;}};

// ---------------------------------------------------------------- the cast: kits
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Real Madrid 2018 final: all white (Wikipedia kit table); navy numbers */
const rm=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:[K,.4],number:n,numberInk:K,hairStyle:'short',build:{height:1.8},seed:n,...o});
/** Liverpool 2018 final: all red; paper numbers */
const lfc=(n:number,o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',number:n,numberInk:'paper',hairStyle:'short',build:{height:1.82},seed:40+n,...o});
const B_BALE:Build={height:1.85,bulk:1.02,thighs:1.06};
const BALE_ST=rm(11,{build:B_BALE,hairStyle:'ponytail',hair:[K,.85],detail:'auto'});
const KAR_ST:AthleteStyle={shirt:[B,.55],shorts:[B,.55],socks:[B,.55],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,gloves:'paper',sleeves:'long',number:1,numberInk:'paper',hairStyle:'short',build:{height:1.91},seed:1};

// ---------------------------------------------------------------- the bicycle kick (u = seconds from contact), LEFT foot
/** Ronaldo-bicycle-2018's key poses (right foot) mirrored for Bale's LEFT: set facing the crosser → the RIGHT knee drives up as the left
 * foot pushes off (.3 s before contact) → tip back past horizontal → the scissor: the left leg whips up straight through the ball above the
 * hips → land on the hands and upper back → sit up. A small extra roll = the "twisting" of the accounts. */
const BIKE_R:[number,Pose][]=[
 [-.45,posed({lHipF:34,rHipF:48,lKnee:46,rKnee:74,lAnk:-8,rAnk:14,lean:16,pitch:2,neckP:-38,lShA:34,rShA:30,lShF:-26,rShF:16,lElb:44,rElb:50})],
 [-.3,posed({pitch:-14,lean:-8,lHipF:98,lKnee:78,lAnk:30,rHipF:-10,rKnee:14,rAnk:52,lShF:72,rShF:64,lShA:44,rShA:40,lElb:40,rElb:46,neckP:-32})],
 [-.17,posed({pitch:-60,lean:-12,lHipF:124,lKnee:26,lAnk:40,rHipF:36,rKnee:100,rAnk:36,lShA:86,rShA:84,lShF:18,rShF:12,lElb:24,rElb:28,neckP:18,roll:-8})],
 [-.07,posed({pitch:-84,lean:-10,lHipF:70,lKnee:40,lAnk:40,rHipF:74,rKnee:62,rAnk:44,lShA:90,rShA:90,lShF:-12,rShF:-12,lElb:18,rElb:18,neckP:38,roll:-12})],
 [0,posed({pitch:-96,lean:-8,rHipF:100,rKnee:8,rAnk:52,lHipF:-14,lKnee:52,lAnk:30,lShA:88,rShA:88,lShF:-36,rShF:-36,lElb:14,rElb:14,neckP:48,lHand:1,rHand:1,roll:-14,rHipR:-18})],
 [.14,posed({pitch:-100,lean:-4,rHipF:122,rKnee:20,rAnk:40,lHipF:-26,lKnee:60,lAnk:24,lShA:58,rShA:58,lShF:-66,rShF:-66,lElb:10,rElb:10,neckP:46,lHand:1,rHand:1,roll:-10})],
 [.34,posed({pitch:-90,lean:6,rHipF:98,rKnee:46,lHipF:8,lKnee:74,lShA:36,rShA:36,lShF:-78,rShF:-78,lElb:22,rElb:22,neckP:52,lHand:1,rHand:1})],
 [.58,posed({pitch:-90,lean:26,rHipF:82,rKnee:82,lHipF:70,lKnee:92,lShA:42,rShA:42,lShF:-56,rShF:-56,lElb:56,rElb:56,neckP:46,lHand:.8,rHand:.8})],
 [1.15,posed({pitch:-14,lean:14,lHipF:88,rHipF:76,lKnee:62,rKnee:34,lShA:26,rShA:26,lShF:-44,rShF:-44,lElb:14,rElb:14,neckP:6,lHand:1,rHand:1})],
 [1.75,posed({lHipF:96,lKnee:118,lAnk:10,rHipF:-8,rKnee:104,rAnk:40,lean:24,pitch:4,lShA:30,rShA:30,lShF:20,rShF:10,lElb:40,rElb:40,neckP:-8})],
];
const BIKE:[number,Pose][]=BIKE_R.map(([u,p])=>[u,clampPose(mirrorPose(p))]);
const CONTACT_POSE=BIKE[4][1];
const pelvisY=(p:Pose,b:Build)=>solve({...p,air:0},b).pelvis[1];
const lacesOf=(sk:{lAn:V3;lToe:V3})=>mix3(sk.lAn,sk.lToe,.6);
/** a ballistic pelvis through (contact, hc): take-off .3 s before contact from standing height, g = 9.81 */
const ARC=(()=>{const sk=solve({...CONTACT_POSE,air:0},B_BALE),hc=2.05-(lacesOf(sk)[1]-sk.pelvis[1]),y0=pelvisY(BIKE[1][1],B_BALE),v=(hc-y0+4.905*.09)/.3;
 return{hc,h:(u:number)=>y0+v*(u+.3)-4.905*(u+.3)*(u+.3)};})();
function flyPose(p:Pose,u:number):Pose{if(u<=-.3||u>1.2)return p;return{...p,air:clamp(ARC.h(u)-pelvisY(p,B_BALE),0,2)};}

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Marcelo's cross)
/** the cross flies TC s to Bale's left boot; the shot reaches the line TG */
const TC=1.45,TG=TC+.5;
/** Bale: just behind the penalty spot, a little left, back to goal, facing out toward the crosser */
const BP:[number,number]=[-11.6,-1.2],B_YAW=yawTo(-.93,-.37);
/** the chip, Marcelo's control and cut inside, the cross spot */
const CS=-3.5,CL=-2.1;
const CA:V3=[-39,BALL_R,-9],CB:V3=[-25.5,BALL_R,-27.5],P0:V3=[-23.2,BALL_R,-24.6];
const B_MAR:Build={height:1.74,bulk:1.02};
/** Marcelo's pelvis at the cross: his RIGHT boot meets the ball striking toward Bale's jump spot (solved) */
const DMC=nrm2(BP[0]-P0[0],BP[1]-P0[2]),PMC=kickerAt(P0,DMC,B_MAR,'r');
type Role='bale'|'marcelo'|'case'|'taa'|'kar'|'rm'|'lfc';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-8,T1=10;
const ACTORS:Actor[]=[
 {name:'Gareth Bale',role:'bale',hero:true,style:BALE_ST,keys:[[T0,-19,-2.5],[-4,-15.5,-2],[-1.5,-12.8,-1.5],[0,-12,-1.3],[TC-.7,BP[0],BP[1]],[TC+2.4,BP[0]+.2,BP[1]],[TC+4,-9,3],[T1,-6,9]]},
 {name:'Marcelo',role:'marcelo',hero:true,style:rm(12,{skin:SKIN_M,hairStyle:'curly',build:B_MAR}),keys:[[T0,-31,-30],[CS,-27.5,-29.2],[CL,CB[0]-.6,CB[2]-.4],[-.9,-24.4,-26.2],[-.2,PMC[0]-DMC[0]*.6,PMC[1]-DMC[1]*.6],[0,...PMC],[1.2,-21.5,-23],[T1,-15,-18]]},
 {name:'Casemiro',role:'case',style:rm(14,{skin:SKIN_M,build:{height:1.84}}),keys:[[T0,-43,-6],[CS-.6,CA[0]-.8,CA[2]+.3],[CS,CA[0]-.4,CA[2]+.15],[CS+1,CA[0]+.5,CA[2]-.2],[T1,-30,-8]]},
 {name:'Trent Alexander-Arnold',role:'taa',hero:true,style:lfc(66,{build:{height:1.8}}),keys:[[T0,-17,-24],[CS,-19.5,-25.5],[CL,-21.6,-25.8],[-.6,-22.1,-24.4],[0,-22.2,-23.7],[TC,-21,-22.4],[T1,-19,-20]]},
 {name:'Sadio Mané',role:'lfc',style:lfc(19,{skin:SKIN_D,build:{height:1.75}}),keys:[[T0,-34,-18],[CS,-30,-21],[CL,-27.6,-22.6],[0,-25.2,-22.2],[T1,-22,-20]]},
 {name:'Loris Karius',role:'kar',hero:true,style:KAR_ST,keys:[[T0,-2.2,-2],[0,-1.6,-1.2],[TC-.2,-1.3,-.4],[TC+.3,-1.2,-.5],[T1,-1.2,-.5]]},
 {name:'Cristiano Ronaldo',role:'rm',style:rm(7,{build:{height:1.87,bulk:1.04},skin:SKIN_M}),keys:[[T0,-14,3],[-2,-8.6,.6],[TC,-7.4,.2],[T1,-7,.2]]},
 {name:'Karim Benzema',role:'rm',style:rm(9,{build:{height:1.85},skin:SKIN_M}),keys:[[T0,-13,-1],[-2,-8.2,-.6],[TC,-7.1,-1.1],[T1,-6.8,-1.2]]},
 {name:'Virgil van Dijk',role:'lfc',style:lfc(4,{skin:SKIN_D,build:{height:1.93,bulk:1.08}}),keys:[[T0,-11,2],[-2,-7,1.6],[TC,-6.2,1],[T1,-6,1]]},
 {name:'Dejan Lovren',role:'lfc',style:lfc(6,{build:{height:1.88}}),keys:[[T0,-11,-5],[-2,-7.6,-3],[TC,-6.5,-2.4],[T1,-6.2,-2.4]]},
 {name:'Andrew Robertson',role:'lfc',style:lfc(26,{build:{height:1.78}}),keys:[[T0,-15,12],[-2,-10,8],[TC,-8.4,6.2],[T1,-8,6]]},
 {name:'Jordan Henderson',role:'lfc',style:lfc(14,{build:{height:1.82}}),keys:[[T0,-26,-4],[-2,-19.5,-4.5],[TC,-17.4,-3.6],[T1,-16,-3]]},
 {name:'Luka Modrić',role:'rm',style:rm(10,{build:{height:1.72},hairStyle:'long',hair:[Y,.5]}),keys:[[T0,-30,6],[-2,-24,5],[TC,-21.5,4.2],[T1,-19,3]]},
 {name:'Toni Kroos',role:'rm',style:rm(8,{hair:[Y,.55]}),keys:[[T0,-42,2],[-2,-33,-1],[TC,-30,-2],[T1,-27,-2]]},
];
const BALE=0,MARC=1,CASE=2,TAA=3,KAR=5;
const TR=tracks(ACTORS,T0,T1);
const posOf=TR.posOf,distOf=TR.distOf;

// ---------------------------------------------------------------- the ball
/** the contact point: the ball on Bale's LEFT laces at TC (solved from the skeleton at the top of his jump) */
const CONTACT_SK=solve({...CONTACT_POSE,air:clamp(ARC.hc-pelvisY(CONTACT_POSE,B_BALE),0,2)},B_BALE,{x:BP[0],z:BP[1],yaw:B_YAW});
const PC:V3=(()=>{const l=lacesOf(CONTACT_SK),d=sub3(P0,l),n=len3(d);return add3(l,[d[0]/n*(BALL_R+.03),d[1]/n*(BALL_R+.03),d[2]/n*(BALL_R+.03)]);})();
/** where it crosses the line: under the bar, inside the left post (attacker's left = −z) */
const PG:V3=[0,2.14,-2.95],NETP:V3=[1.55,1.8,-3.1],REST:V3=[1.5,BALL_R,-3];
const fly=(A:V3,Bp:V3,d:number):V3=>[(Bp[0]-A[0])/d,(Bp[1]-A[1]+4.905*d*d)/d,(Bp[2]-A[2])/d];
const V_CROSS=fly(P0,PC,TC),V_SHOT=fly(PC,PG,TG-TC),V_CHIP=fly(CA,CB,CL-CS);
const at=(A:V3,V:V3,t:number):V3=>[A[0]+V[0]*t,A[1]+V[1]*t-4.905*t*t,A[2]+V[2]*t];
function ballAt(tau:number):V3{
 if(tau<=CS)return CA;
 if(tau<CL)return at(CA,V_CHIP,tau-CS);
 if(tau<0){// Marcelo cushions it, then cuts inside onto his right foot (two touches)
  const u=(tau-CL)/(-CL),q=u<.55?u/.55*.55:.55+(u-.55)/.45*.45,m:V3=[-24.3,BALL_R,-26.4],s=q<.55?q/.55:1;return q<.55?mix3(CB,m,1-(1-s)*(1-s)):mix3(m,P0,(q-.55)/.45);}
 if(tau<TC)return at(P0,V_CROSS,tau);
 if(tau<TG)return at(PC,V_SHOT,tau-TC);
 if(tau<TG+.22)return mix3(PG,NETP,easeOut((tau-TG)/.22));
 const u=clamp((tau-TG-.22)/.45),b=u>=1?.08*Math.abs(Math.sin((tau-TG-.67)*9))*Math.exp(-(tau-TG-.67)*3.5):0;return[lerp(NETP[0],REST[0],u),Math.max(BALL_R,lerp(NETP[1],BALL_R,u*u))+b,lerp(NETP[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<0?tau*TAU*1.4:tau<TC?tau*TAU*2:TC*TAU*2-(tau-TC)*TAU*5;
const bulgeAt=(tau:number)=>tau<TG+.06?0:Math.exp(-(tau-TG-.06)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses
function kick(pose:Pose,tau:number,tc:number,foot:'l'|'r',dur=.9,w=1):Pose{const ww=win(tau,tc-.5,tc+.7,.2)*w;return ww>0?blendPose(pose,strike(clamp((tau-tc)/dur+STRIKE_CONTACT),{foot}),ww):pose;}
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau),b=ballAt(tau);let pose=TR.loco(k,tau),yaw=TR.faceYaw(k,tau,b);
 switch(a.role){
  case 'bale':{const u=tau-TC;
   if(u>=-.62&&u<1.75)pose=keyPoses(u,[[-.62,TR.loco(k,TC-.62)],...BIKE]);
   else if(u>=1.75){const run=celebrate(distOf(k,tau)/4,{kind:'run'});pose=blendPose(BIKE[BIKE.length-1][1],run,sm(1.75,2.5,u));}
   pose=flyPose(pose,u);
   yaw=lerpAng(TR.faceYaw(k,tau,b),B_YAW,sm(-1.5,-.62,u));if(u>1.3)yaw=lerpAng(B_YAW,TR.faceYaw(k,tau,b),sm(1.3,2.4,u));
   break;}
  case 'marcelo':{pose=kick(pose,tau,0,'r',.85);const w=sm(-.5,-.15,tau)*(1-sm(.5,1,tau));yaw=lerpAng(yaw,yawTo(DMC[0],DMC[1]),w);
   if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;}
  case 'case':pose=kick(pose,tau,CS,'r',.95);if(tau<CS+.6)yaw=lerpAng(yaw,yawTo(CB[0]-CA[0],CB[2]-CA[2]),win(tau,CS-1.2,CS+.6,.4));break;
  case 'taa':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);break;
  case 'kar':{pose=keeperSet(Math.min(tau,TC)*1.3);const t0=TC+.08;
   if(tau>t0)pose=blendPose(pose,keeperDive(clamp((tau-t0)/1.1),{side:'r',height:.85}),.62*sm(t0,t0+.12,tau)*(1-sm(TG+1,TG+1.6,tau)));
   if(tau>TG+1.3)pose=blendPose(pose,DEJECT,sm(TG+1.5,TG+2.2,tau)*.6);
   yaw=TR.faceYaw(k,Math.min(tau,TG),ballAt(Math.min(tau,TC)));break;}
  case 'lfc':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TC)yaw=TR.faceYaw(k,TC,ballAt(TC));break;
  case 'rm':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;cap?:number}={}){
 const figs:Fig[]=ACTORS.map((a,k)=>{const hero=!!a.hero;return{st:stateOf(k,tau),prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===BALE&&tau>TC-.35&&tau<TC+.3)||(k===MARC&&tau>-.25&&tau<.35)||(k===KAR&&tau>TC+.2&&tau<TG+.4))};});
 return drawScene(s,c,PAL,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2],by:1.8},o.cap);
}
const atA=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
function tau1(t:number){const tM=CUE(0,'Marcelo crosses')+.3,tD=CUE(0,'drops behind')+.2,tK=CUE(0,'kicks it over')+.25,S=SECS(0);
 return key(t,mono([[0,Math.max(T0+.2,CS-.4-tM*.6)],[tM*.6,CS-.4],[tM,0],[tD,TC*.62],[tK,TC],[S+1,TC+S+1-tK]]),linear);}
const P1:V3=[-18,26,80];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-25,0,-10],fov:15})],
  [CUE(0,'Gareth Bale')-.2,1.2,()=>({P:P1,T:mix3(gnd(b,1),atA(BALE,tau,1),.5),fov:13})],
  [CUE(0,'Marcelo crosses')-.5,1,()=>({P:P1,T:mix3(gnd(b,1),atA(BALE,tau,1),.35),fov:11})],
  [CUE(0,'drops behind')-.3,.8,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.2+.3*b[1],0]),[BP[0],1.6,BP[1]],.5+.4*sm(0,TC,tau)),fov:9.5})],
  [CUE(0,'kicks it over')-.2,.5,()=>({P:P1,T:[lerp(BP[0],-2,sm(TC,TG,tau)),1.6,lerp(BP[1],-1.8,sm(TC,TG,tau))],fov:8.5})],
  [CUE(0,'Goal')+.3,1.5,()=>{const w=atA(BALE,tau,1.2);return{P:P1,T:mix3(w,[-6,1.2,-2],.4),fov:10};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tA=CUE(0,'Goal');
  stadium(s,c,OLIMP,t,[2,1,3],{roar:sm(TG,TG+.5,tau),flash:sm(tA-.1,tA+.4,t)*(1-sm(tA+2.2,tA+3,t))});
  ground(s,c,OLIMP);
  play(s,c,tau,tp,{min:18,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'kicks it over')+.3;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay, low and side-on: back to goal, eyes up, the left foot
const tau2=(t:number)=>key(t,mono([[0,.2],[CUE(1,'His back'),.6],[CUE(1,'Eyes on'),1.0],[CUE(1,'swings'),TC-.2],[CUE(1,'left foot'),TC-.02],[CUE(1,'up high'),TC+.08],[SECS(1),TC+.55]]),linear);
/** side-on from Bale's LEFT (his left side toward the camera, the goal to screen right) */
const E2:V3=[BP[0]-2.2,1.1,BP[1]+9.5];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(tau),bl=atA(BALE,tau,1.4);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(bl,b,.35),fov:34})],
  [CUE(1,'His back')-.3,1,()=>({P:add3(E2,[.6,0,-1]),T:mix3(bl,b,.3),fov:30})],
  [CUE(1,'Eyes on')-.2,1,()=>({P:add3(E2,[.4,-.2,-1.6]),T:mix3(bl,b,.55),fov:30})],
  [CUE(1,'swings')-.2,.9,()=>({P:add3(E2,[.9,-.3,-2.6]),T:[PC[0]-.2,1.3,PC[2]],fov:26})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tB=CUE(1,'His back'),tE=CUE(1,'Eyes on');
  stadium(s,c,OLIMP,t,[2,3]);
  ground(s,c,OLIMP);
  // replay graphic: the cross's flight so far (yellow) from "Eyes on the ball"
  const pts:V3[]=[];for(let i=0;i<=16;i++)pts.push(ballAt(lerp(Math.max(0,tau-1.2),Math.min(tau,TC),i/16)));pathRibbon(s,c,pts,Y,sm(tE-.2,tE+.3,t)*(1-sm(TC+.1,TC+.4,tau)),.3);
  // "His back is to the goal": a red arrow on the grass from Bale toward the goal behind him
  const bk=sm(tB-.1,tB+.4,t)*(1-sm(tE+.4,tE+.9,t));if(bk>0){const g=atA(BALE,tau,.02);arrow3(s,c,K,[g,add3(g,[3.2*sm(tB,tB+.6,t),0,-.4*sm(tB,tB+.6,t)])],Math.max(7,kAt(c,g)*.08),R,.9*bk);}
  const r=play(s,c,tau,tp,{smear:true,min:12,cap:2});
  const hit=(tau-TC)/.16;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam2(t),st=stateOf(BALE,tau2(twos(t))),sk=solve(st.pose,B_BALE,st.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(1,'left foot')+.2;},
};

// ---------------------------------------------------------------- 3 · a second replay high behind the goal: over the keeper, into the top corner
const tau3=(t:number)=>key(t,mono([[0,TC-.9],[CUE(2,'flies over'),TC+.05],[CUE(2,'top corner'),TG],[CUE(2,'Madrid lead'),TG+.9],[SECS(2),TG+3]]),linear);
const E3:V3=[13,8.5,5];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-9,1.6,-1.2],fov:32})],
  [CUE(2,'flies over')-.3,.8,()=>({P:E3,T:mix3(b,[-1,1.8,-2],.45),fov:26})],
  [CUE(2,'top corner')-.2,.6,()=>({P:add3(E3,[-2,-1.5,-1]),T:[0,1.9,-2.6],fov:22})],
  [CUE(2,'Madrid lead')+.1,1.4,()=>({P:[3,5,16],T:mix3(atA(BALE,tau,1.2),[-6,1,-2],.3),fov:32})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tE=CUE(2,'Madrid lead');
  stadium(s,c,OLIMP,t,[3,0,2],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tE,tE+.3,t))});
  ground(s,c,OLIMP);
  const cf=1-sm(TG+.2,TG+.8,tau);if(cf>0&&tau>TC){const pts:V3[]=[];for(let i=0;i<=14;i++)pts.push(ballAt(lerp(TC,Math.min(tau,TG),i/14)));pathRibbon(s,c,pts,Y,cf,.25);}
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06),cap:2});
  const hit=(tau-TG)/.2;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4),{n:9,seed:29,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),q=pr(c,[0,1.6,-2.4])??[0,0];return apertureDisc(q[0],q[1],70,12);},
 get still(){return CUE(2,'top corner')+.15;},
};

// ---------------------------------------------------------------- 4 · the lesson: the jump slowed almost to a stop, with teaching marks
const tau4=(t:number)=>key(t,mono([[0,TC-.55],[CUE(3,'be brave'),TC-.32],[CUE(3,'in the air'),TC-.14],[CUE(3,'keep your eyes'),TC-.06],[CUE(3,'as you kick'),TC],[SECS(3),TC+.12]]),linear);
const E4:V3=[BP[0]-3,1.3,BP[1]+7.5];
function cam4v(t:number):Cam{
 const tau=tau4(t),bl=atA(BALE,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E4,T:mix3(bl,PC,.3),fov:32})],
  [CUE(3,'in the air')-.3,1,()=>({P:add3(E4,[.5,-.2,-1]),T:mix3(bl,PC,.5),fov:28})],
  [CUE(3,'as you kick')-.3,1,()=>({P:add3(E4,[1,-.3,-1.8]),T:PC,fov:24})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tB=CUE(3,'be brave'),tA=CUE(3,'in the air'),tE=CUE(3,'keep your eyes'),tK=CUE(3,'as you kick');
  stadium(s,c,OLIMP,t,[2,3]);
  ground(s,c,OLIMP);
  // "be brave": a yellow ring on the grass under the jump; "in the air": a dashed rise from the ground to his hips
  groundRing(s,c,[BP[0],0,BP[1]],1.3,Y,sm(tB-.2,tB+.4,t));
  const st=stateOf(BALE,tau),sk=solve(st.pose,B_BALE,st.place);
  const ai=sm(tA-.2,tA+.4,t);if(ai>0)arrow3(s,c,K,[[sk.pelvis[0],.05,sk.pelvis[2]],[sk.pelvis[0],.05+(sk.pelvis[1]-.3)*sm(tA,tA+.6,t),sk.pelvis[2]]],Math.max(6,kAt(c,sk.pelvis)*.06),Y,.95*ai);
  play(s,c,tau,tp,{min:14,cap:2});
  // "keep your eyes on it": a dashed yellow sight line from his face to the ball
  const ey=sm(tE-.2,tE+.3,t);if(ey>0){const a=pr(c,sk.face),bq=pr(c,ballAt(tau));if(a&&bq){const gaps:[number,number][]=[];for(let x=.07;x<1;x+=.14)gaps.push([x,x+.06]);
   s.fill(Y,ribbon([a,[lerp(a[0],bq[0],ey),lerp(a[1],bq[1],ey)]],Math.max(6,kAt(c,sk.face)*.05),{taper:.2,pressure:.2,wobble:.6,gaps}),.95);}}
  // "as you kick": a ring on the ball and the left boot's arc
  const kk=sm(tK-.2,tK+.3,t);if(kk>0){const b=ballAt(tau);groundRing(s,c,[b[0],0,b[2]],.6,R,kk*.8);const q=pr(c,b);if(q){const r=Math.max(18,kAt(c,b)*.22);
   s.stroke(Y,polyPath(Array.from({length:24},(_,i)=>{const a=i/24*TAU;return[q[0]+Math.cos(a)*r*1.4*kk,q[1]+Math.sin(a)*r*1.4*kk] as Pt;}),true),Math.max(5,r*.2),.95);}}
 },
 get still(){return CUE(3,'keep your eyes')+.5;},
};

const film:RisoStory={
 id:'bale-overhead-2018',format:'11v11',title:"Bale's overhead kick",
 theme:'Be brave when the ball is in the air and keep your eyes on it as you kick',
 ageNote:'Real Madrid 3–1 Liverpool, Champions League final, Kyiv, 26 May 2018. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball pops up from the point and is flicked back over in a yellow arc. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.7),fade=1-clamp((age-.6)/.2),bx=x-90+180*u,by=y-150*Math.sin(Math.PI*u);
  if(fade>0){const pts:Pt[]=[];for(let i=0;i<=10;i++){const q=i/10*u;pts.push([x-90+180*q,y-150*Math.sin(Math.PI*q)]);}if(pts.length>2)s.fill(Y,ribbon(pts,10,{taper:.7,wobble:.4}),.9*fade);}
  footballPanels(s,bx,by,26,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Liverpool's goal line x = 0, +z = Madrid's right) — checked by tests/play-film-bale-overhead-2018.cjs. */
export const FACTS={P0,PC,PG,TC,TG,BP,ballAt,kickFoot:'l' as const,crossFoot:'r' as const,
 baleContact:()=>{const st=stateOf(BALE,TC),sk=solve(st.pose,B_BALE,st.place);return{lToe:sk.lToe,rToe:sk.rToe,lLaces:lacesOf(sk),pelvis:sk.pelvis,head:sk.head,air:st.pose.air,yaw:st.place.yaw??0};},
 marceloContact:()=>{const st=stateOf(MARC,0),sk=solve(st.pose,B_MAR,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 casemiroAt:(tau:number)=>posOf(CASE,tau),taaAt:(tau:number)=>posOf(TAA,tau),
 karius:(tau:number)=>{const st=stateOf(KAR,tau),sk=solve(st.pose,{height:1.91},st.place);return{lHa:sk.lHa,rHa:sk.rHa};},
};
