/** Hope Solo saves Daiane's penalty — Brazil 2–2 USA (USA win 5–3 on penalties), FIFA Women's World Cup quarter-final, Sunday 10 July
 * 2011, Rudolf-Harbig-Stadion, Dresden. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the save from WRITTEN accounts and the official FIFA line-up
 * sheet (the footage itself was not reviewed), rendered as a riso print. The same match as wambach-header-2011.ts (the Dresden bowl, the
 * seats, the flags and Solo's build are shared); this film stays on Solo and the save, from its own camera angles.
 *
 * SOURCES (read Sept 2026 with curl, cached in the film scratchpad src-cache/):
 *  - FIFA, "Tactical Line-up — Quarter-finals — Brazil - USA, #28, 10 JUL 2011 17:30, Dresden / Rudolf-Harbig-Stadion" (archived PDF):
 *    "Brazil (BRA) Shirt: yellow Shorts: white Socks: white"; "USA (USA) Shirt: black Shorts: black Socks: black"; 3 DAIANE; 1 Hope SOLO;
 *    26 °C. https://web.archive.org/web/20121112023401/http://www.fifa.com/mm/document/tournament/competition/01/47/25/00/28_0710_bra-usa_tacticalstartlist.pdf
 *  - Wikipedia, "2011 FIFA Women's World Cup knockout stage" (the shootout order: Brazil Cristiane ✓, Marta ✓, Daiane ✗, Francielle ✓;
 *    USA Boxx ✓, Lloyd ✓, Wambach ✓, Rapinoe ✓, Krieger ✓; 3–5; 25,598; Solo player of the match; Buehler sent off 65')
 *    https://en.wikipedia.org/wiki/2011_FIFA_Women%27s_World_Cup_knockout_stage
 *  - The New York Times, Jeré Longman, "U.S. Goalkeeper Made Quite a Comeback of Her Own", 12 July 2011 (archived): before the shootout
 *    Solo walked away to calm herself — "I was at peace, clear-headed"; "When Daiane, the third Brazilian shooter, set up for her penalty
 *    kick, Solo made her wait. She moved unhurriedly in the goal mouth, stalling, trying to spot something that would betray Daiane's
 *    intent ... The way Daiane ran toward the ball, the arc of her approach, was the giveaway. She was behind the ball and her hips opened,
 *    and the ball could go in only one direction. Solo dived to her right and punched the ball away"
 *    https://www.nytimes.com/2011/07/13/sports/soccer/us-goalkeeper-made-quite-a-comeback-of-her-own.html
 *  - Al Jazeera, "'Hands' Solo tips US into semi-finals", 10 July 2011 ("Hope Solo palms away Daiane's kick as the Americans scored all
 *    five"; "Alex Krieger hit the winning penalty") https://www.aljazeera.com/sports/2011/7/10/hands-solo-tips-us-into-semi-finals
 *  - Wikipedia, "Hope Solo" (5 ft 9 in ≈ 1.75 m; "Solo saved Brazil's third penalty kick") https://en.wikipedia.org/wiki/Hope_Solo
 * CONFIRMED: the date, Dresden, the quarter-final, 2–2 after extra time; the shootout order and scores above, so the USA kicked first
 *  (Brazil took only four) and it stood 3–2 to the USA when Daiane (3), Brazil's third taker, stepped up; Solo stalled, moving unhurriedly
 *  in her goalmouth; Daiane's curved approach, "behind the ball", hips open; Solo DIVED TO HER RIGHT and punched / palmed the ball away;
 *  Krieger scored the winner; 5–3. Kits: Brazil yellow shirts, WHITE shorts and socks; the USA all BLACK (the dark away kit — printed
 *  here as a solid navy, the darkest ink). Solo 1.75 m.
 * INFERRED (illustrative): Daiane's shooting foot (drawn right-footed, curling her approach in from her left — the arc and open hips
 *  point that way, but no source names the foot, and the narration does not); the exact run (≈ 5 m, ≈ 1.5 s), the shot's speed
 *  (≈ .45 s to the glove) and height (≈ .6 m, ≈ 2 m to Solo's right) and which hand touched it first (drawn: the lower, right glove, open
 *  and firm); where the ball went after the parry; Solo's stalling path (a slow walk to her left and back) and her set pose; the moment
 *  she moved; her roar after the save; which end of the ground (the same goal as the Wambach film) and which touchline the main camera
 *  was on; Solo's keeper kit colour (drawn red — it had to differ from both black and yellow; the Wambach film's navy guess would clash
 *  with the black USA strip); Daiane's hair, skin and height; the referee's and assistant's positions and kit; the two teams standing
 *  arm in arm in the centre circle and their reactions; the evening light, crowd colours, flags and TV camera positions.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the bowl and the two lines in the centre
 * circle → the box → Daiane sets the ball and walks to her mark → Solo takes her time, strolling along her line → the curved run, the
 * shot, the dive to her right → "Saved!", Solo roars); ch2 = the slow-motion replay from the KEEPER'S EYE, low inside the goal over Solo's
 * right shoulder, the posts framing the kicker (calm, big, the arc of Daiane's run, the push-off, the glove); ch3 = the second replay
 * angle, LOW IN FRONT and to Solo's right on the six-yard line, the dive coming at the lens: the glove sends it wide, then live again as she
 * gets up and roars; ch4 = the lesson, side-on from the touchline: a slow calm ring (calm) → arrows out from her gloves and boots (big) →
 * Daiane's curved run lit footprint by footprint and a sight line (read the kicker), a ring on the hips and an arrow where they open →
 * a red dive arrow → a yellow burst on the strong hand. Composed on the FULL sheet (world units = sheet units centred on the canvas;
 * never sheet.safe), so it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion,
 * `prev` secondary motion for the ponytails and hems, motionSmear on the run, the strike and the dive). Women footballers: per-player
 * builds (1.62–1.75 m, slimmer bulk) with ponytails. Handedness: the world is right-handed (x toward the goal, y up), athlete.ts's own
 * convention, so Daiane's strike() is her RIGHT foot with no mirrored projector; Solo faces −x, so her RIGHT is −z (keeperDive side 'r'),
 * toward the main-stand camera. The ball is aimed at Solo's solved right glove, so it always meets her hand. Inks: yellow, red, blue, navy
 * (the Wambach film's set). Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. Heat: small figures print at 'low', every figure inside a passage is capped; ≈ 150–330 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build,type Skeleton} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/solo-brazil-2011/timing.json, add
 *   import timingJson from '../../../public/plays/narration/solo-brazil-2011/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * NB withTiming matches a cue by its FIRST word only, in order — so no cue starts with a word that also appears between it and the previous
 * cue's first word. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Penalties in Dresden',text:"Dresden, 2011. The USA and Brazil go to penalties. Brazil's Daiane steps up. Hope Solo takes her time... Daiane shoots. Solo dives to her right. Saved!",tail:2.4,
  cues:['Dresden','The USA','penalties','Daiane steps','Hope Solo','Daiane shoots','Solo dives','Saved']},
 {label:'Watch it again',text:'Watch again, slowly. Solo stays calm and big. She watches how Daiane runs at the ball, then pushes off and punches it away.',tail:1.5,
  cues:['Watch again','stays calm','watches how','runs at','pushes off','punches']},
 {label:'Strong hands',text:'Up close: strong hands send it wide. Then Ali Krieger scores, and the USA win five to three!',tail:2,
  cues:['Up close','strong hands','wide','Then','the USA win']},
 {label:'The secret',text:"Keepers: stay calm and big. Read the kicker's run and hips. Then dive, and push the ball away with strong hands.",tail:1.9,
  cues:['Keepers','calm','big','Read','hips','dive','strong hands']},
];
import timingJson from '../../../public/plays/narration/solo-brazil-2011/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('solo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('solo: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const DEG=Math.PI/180;
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the shootout goal line is x = 0 (the kick goes +x), goal centre z = 0; touchlines z = ±34 (the main stand at −z), halfway x = −52.5. */
type Cam=Camera;
const NEAR=.4;
function toCam(c:Cam,P:V3):V3{const d:V3=[P[0]-c.eye[0],P[1]-c.eye[1],P[2]-c.eye[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.center[0]+c.F*q[0]/q[2],c.center[1]-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- the Rudolf-Harbig-Stadion (as in the Wambach film): a closed bowl, one steep tier, one roof
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z), 1 behind the shootout goal (+x), 2 the main stand (−z, the camera
 * side), 3 the other end. Closed corners: the side stands run past the goal lines. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-124,20,a),1.4+22*b,41+30*b],
 (a,b)=>[8+28*b,1.4+20*b,lerp(-62,62,a)],
 (a,b)=>[lerp(20,-124,a),1.4+22*b,-41-30*b],
 (a,b)=>[-113-28*b,1.4+20*b,lerp(62,-62,a)],
];
const STAND_COLS=[104,72,104,72],STAND_ROWS=13,AISLES=[[.5],[.5],[.5],[.5]];
/** flags on the stand fronts: [stand, a, 0 = USA | 1 = Brazil] */
const FLAGS:[number,number,number][]=[[0,.3,0],[0,.46,1],[0,.58,0],[0,.72,0],[0,.84,1],[1,.18,0],[1,.36,1],[1,.62,0],[1,.8,0],[2,.2,0],[2,.34,1],[2,.7,1],[2,.86,0],[3,.4,0],[3,.62,1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a July evening in Dresden (26 °C at kick-off, the shootout near eight o'clock): a pale blue screen, a warm band low down
 s.field(B,.17,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){const band=polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true);s.tone(Y,band,.24);s.tone(R,band,.09);}
 const planes=new Path2D(),aisle=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of AISLES[i])seg3(c,S(0,b),S(1,b),.6,aisle);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.7),[0,10.5,0]),add3(S(0,.7),[0,10.5,0])]));
  seg3(c,add3(S(0,.7),[0,10.3,0]),add3(S(1,.7),[0,10.3,0]),.45,edge);}
 // yellow-and-navy seats under the crowd
 s.knockout(planes);s.tone(Y,planes,.55);s.tone(K,planes,.3);s.knockout(aisle,.85);
 // the crowd: seeded dots (white, USA red, navy, Brazil yellow), sized by distance; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(AISLES[si].some(w=>Math.abs(b-w)<.045))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,11);if(h<.26)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.6?0:h<.78?1:h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(edge,.8);
 // flags: the Stars and Stripes (paper, red stripes, a navy canton) and Brazil's (green = yellow × blue, a yellow rhombus, a blue globe)
 const fl=new Path2D(),stripe=new Path2D(),canton=new Path2D(),green=new Path2D(),globe=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.08),P(0,.08)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){for(let k=0;k<3;k++){const b0=.005+(.075*(2*k+1))/7,b1=b0+.075/7;addPoly(stripe,polyP(c,[P(0,b0),P(1,b0),P(1,b1),P(0,b1)]));}addPoly(canton,polyP(c,[P(0,.045),P(.42,.045),P(.42,.08),P(0,.08)]));}
  else{const outer=q,rh=polyP(c,[P(.5,.013),P(.92,.0425),P(.5,.072),P(.08,.0425)]);if(rh.length>2){const g=new Path2D(polyPath(outer,true));g.addPath(polyPath(rh.slice().reverse(),true));green.addPath(g);}
   addPoly(globe,polyP(c,[P(.4,.03),P(.6,.03),P(.6,.055),P(.4,.055)]));}}
 s.knockout(fl);s.fill(R,stripe,.95);s.fill(K,canton,.95);s.fill(Y,green,.95);s.fill(B,green,.9);s.fill(B,globe,.95);
 // floodlights along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<6;k++){const u=(k+.5)/6,a=add3(S(u-.03,.7),[0,9.6,0]),b=add3(S(u+.03,.7),[0,9.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,.9,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.7);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, the spot, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // advertising boards: red with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(R,bd,.9);s.fill(K,bd,.2);s.knockout(pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 // the penalty spot: a round white disc
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** the shootout goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; a side-net ripple where the parried ball brushes it */
function goal3(s:Sheet,c:Cam,ripple=0){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+(z<-3?ripple*.25:0);
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles) — women footballers
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** the USA all in black (FIFA line-up sheet) — the darkest ink, solid navy — with white numbers */
const usa=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.95],shorts:[K,.95],socks:[K,.95],boots:K,skin:SKIN_L,hair:[K,.75],line:K,trim:'paper',numberInk:'paper',hairStyle:'ponytail',build:{height:1.7,bulk:.88},...o});
/** Brazil: yellow shirts, white shorts, white socks (FIFA line-up sheet); blue numbers and trim */
const brazil=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:'paper',socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,trim:[B,.9],numberInk:[B,.9],hairStyle:'ponytail',build:{height:1.68,bulk:.88},...o});
/** Hope Solo: 1.75 m (Wikipedia), as in the Wambach film; the keeper kit colour is inferred (red: clear of the black and the yellow) */
const B_SOLO:Build={height:1.75,bulk:.95};
const SOLO_ST:AthleteStyle={shirt:[R,.92],shorts:[R,.92],socks:[R,.92],boots:K,skin:SKIN_L,hair:[K,.5],line:K,trim:[K,.85],gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:[K,.9],build:B_SOLO,seed:1};
/** Daiane, Brazil's 3 (build, hair and skin inferred; the same taker style as the Wambach film's shootout) */
const B_DAI:Build={height:1.66,bulk:.9};
const DAI_ST=brazil({number:3,build:B_DAI,skin:SKIN_D,seed:73});
/** the referee and her assistant (kit inferred) */
const REF_ST:AthleteStyle={shirt:[B,.85],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:K,hairStyle:'ponytail',build:{height:1.68,bulk:.88},seed:30};

// ---------------------------------------------------------------- the kick on one clock σ (seconds; σ = 0 is Daiane's contact)
const BALL_R=.11;
const SPOT:V3=[-11,BALL_R,0];
/** Solo on her line, facing the field: her right is −z, toward the main-stand camera */
const SOLO_X=-.3,SOLO_YAW=Math.PI;
/** the dive to her right: she goes as Daiane plants (she had read the run), full stretch at u = .55; the ball meets her right glove there */
const DIVE_H=.3,DIVE=(u:number)=>keeperDive(clamp(u),{side:'r',height:DIVE_H}),T_DIVE=-.1,DIVE_L=1.0,HAND_U=.55,T_HAND=T_DIVE+HAND_U*DIVE_L;
const soloPlace0:Place={x:SOLO_X,z:0,yaw:SOLO_YAW};
/** her right glove at full stretch (solved, FK); the ball's centre sits a hair in front of the palm, toward the kicker */
const HAND:V3=(()=>{const sk=solve(DIVE(HAND_U),B_SOLO,soloPlace0);return sk.rHa;})();
const TGT:V3=[HAND[0]-.13,Math.max(.2,HAND[1]),HAND[2]+.02];
/** the parry: punched away past the right-hand post, a bounce, a roll toward the corner of the six-yard box */
const OUT:V3=[-.55,.32,-6.1],REST:V3=[-2.6,BALL_R,-9.6],T_OUT=.36;
const ballistic=(A:V3,Bp:V3,d:number):V3=>[(Bp[0]-A[0])/d,(Bp[1]-A[1]+4.905*d*d)/d,(Bp[2]-A[2])/d];
const fly=(A:V3,V:V3,t:number):V3=>[A[0]+V[0]*t,A[1]+V[1]*t-4.905*t*t,A[2]+V[2]*t];
const V_SHOT=ballistic(SPOT,TGT,T_HAND),V_PARRY=ballistic(TGT,OUT,T_OUT);
function ballAt(sg:number):V3{
 if(sg<=0)return SPOT;
 if(sg<T_HAND)return fly(SPOT,V_SHOT,sg);
 if(sg<T_HAND+T_OUT)return fly(TGT,V_PARRY,sg-T_HAND);
 const u=clamp((sg-T_HAND-T_OUT)/1.4),e=easeOut(u);
 return[lerp(OUT[0],REST[0],e),Math.max(BALL_R,lerp(OUT[1],BALL_R,clamp(u*4)))+.3*Math.abs(Math.sin(u*Math.PI*2.2))*(1-u)*(1-u),lerp(OUT[2],REST[2],e)];
}
const spinAt=(sg:number)=>sg<=0?0:sg<T_HAND?sg*TAU*4:T_HAND*TAU*4-(sg-T_HAND)*TAU*2.5;

// ---------------------------------------------------------------- Daiane: the curved run ("the arc of her approach"), right foot, open hips
/** at contact she runs along DIRK (in from her left), so her hips are open; the ball goes across her, to her left = Solo's right */
const DIRK=nrm2(1,.42),YAW_D=yawTo(DIRK[0],DIRK[1]),POWER=.85,SD=.9;
/** where her pelvis stands at contact so the toe of her RIGHT boot meets the back of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:POWER}),B_DAI,{x:0,z:0,yaw:YAW_D});return[SPOT[0]-DIRK[0]*.1-sk.rToe[0],SPOT[2]-DIRK[1]*.1-sk.rToe[2]];})();
/** the arc: a quadratic Bézier from her mark (back and wide to her left) that bends in and ends along DIRK */
const MARK:[number,number]=[PC[0]-3.3,PC[1]-3.9],CTRL:[number,number]=[PC[0]-DIRK[0]*2.1,PC[1]-DIRK[1]*2.1];
const bez=(u:number):[number,number]=>{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*MARK[0]+b*CTRL[0]+c*PC[0],a*MARK[1]+b*CTRL[1]+c*PC[1]];};
/** arc-length table, so her speed along the curve is honest */
const ARC=(()=>{const L:number[]=[0];let p=bez(0);for(let i=1;i<=60;i++){const q=bez(i/60);L.push(L[i-1]+Math.hypot(q[0]-p[0],q[1]-p[1]));p=q;}return L;})(),ARC_L=ARC[60];
function arcAt(s:number):{p:[number,number];yaw:number}{const d=clamp(s,0,ARC_L);let i=0;while(i<59&&ARC[i+1]<d)i++;const u=(i+(d-ARC[i])/Math.max(1e-6,ARC[i+1]-ARC[i]))/60,p=bez(u),q=bez(Math.min(1,u+.01)),r=bez(Math.max(0,u-.01));return{p,yaw:yawTo(q[0]-r[0],q[1]-r[1])};}
const T_RUN0=-1.55;
/** where she places the ball from, and the straight walk back to her mark */
const PLACE_P:[number,number]=[SPOT[0]-.5,SPOT[2]-.2];
const P_PLACE=posed({lHipF:70,rHipF:40,lKnee:100,rKnee:60,lean:40,pitch:12,neckP:30,lShF:62,rShF:66,lElb:18,rElb:20,lShA:14,rShA:12,lHand:.8,rHand:.8});
const P_WAIT=posed({lHipF:-4,rHipF:10,lKnee:12,rKnee:18,lAnk:0,rAnk:-4,lean:8,pitch:2,neckP:-2,lShA:14,rShA:14,lShF:2,rShF:0,lElb:22,rElb:24});
const P_GO=posed({lHipF:-18,rHipF:22,lKnee:24,rKnee:30,lAnk:16,rAnk:-6,lean:14,pitch:4,neckP:10,lShA:22,rShA:20,lShF:-12,rShF:14,lElb:40,rElb:46,twist:-8});
const HANDS_HEAD=posed({lShA:150,rShA:150,lShF:36,rShF:36,lElb:138,rElb:138,lShR:30,rShR:30,neckP:14,lean:10,lHipF:6,rHipF:10,lKnee:12,rKnee:14,lHand:1,rHand:1});
const walkPose=(ph:number)=>{const p=blendPose(runCycle(ph,{speed:0,stride:.55}),P_WAIT,.35);p.air=0;return p;};
const runS=(sg:number)=>{const u=clamp((sg-T_RUN0)/-T_RUN0);return ARC_L*(1.2*u-.2*u*u);};
type State={pose:Pose;place:Place};
/** walk ∈ [0,1]: she sets the ball, turns and walks back to her mark, turns to face it (ch1 only; 1 = waiting at the mark) */
function daianeState(sg:number,walk=1,it=0):State{
 const faceArc=arcAt(.05).yaw;
 if(sg<=T_RUN0){
  if(walk<1){const u=walk;if(u<.14){return{pose:blendPose(P_PLACE,stand(),sm(.06,.14,u)),place:{x:PLACE_P[0],z:PLACE_P[1],yaw:0}};}
   const w=sm(.14,.84,u,linear),x=lerp(PLACE_P[0],MARK[0],w),z=lerp(PLACE_P[1],MARK[1],w),away=yawTo(MARK[0]-PLACE_P[0],MARK[1]-PLACE_P[1]);
   let p=walkPose(Math.hypot(MARK[0]-PLACE_P[0],MARK[1]-PLACE_P[1])*w/1.3);if(u>.84)p=blendPose(p,P_WAIT,sm(.84,1,u));
   return{pose:p,place:{x,z,yaw:u<.2?lerpAng(0,away,sm(.12,.22,u)):lerpAng(away,faceArc,sm(.84,1,u))}};}
  const br=.5+.5*Math.sin(it*2.1),p=blendPose(P_WAIT,P_GO,sm(T_RUN0-.35,T_RUN0,sg));p.lean+=.02*br;p.neckP+=.03*br;return{pose:p,place:{x:MARK[0],z:MARK[1],yaw:faceArc}};}
 const RUN_END=-STRIKE_CONTACT*SD;
 if(sg<0){const s=runS(sg),a=arcAt(s);let p=blendPose(P_GO,runCycle(s/1.9,{speed:.62}),sm(T_RUN0,T_RUN0+.3,sg));
  if(sg>RUN_END-.12)p=blendPose(p,strike(clamp(STRIKE_CONTACT+sg/SD),{power:POWER}),sm(RUN_END-.12,RUN_END+.02,sg));
  return{pose:p,place:{x:a.p[0],z:a.p[1],yaw:sg>RUN_END?lerpAng(a.yaw,YAW_D,sm(RUN_END,RUN_END+.15,sg)):a.yaw}};}
 const g=.8*(1-Math.pow(1-clamp(sg/.8),2));
 let p=strike(clamp(STRIKE_CONTACT+sg/SD),{power:POWER});
 // she stops, sees it pushed away, and her hands go to her head
 if(sg>.62)p=blendPose(p,P_WAIT,sm(.62,1,sg));
 if(sg>1.05)p=blendPose(p,HANDS_HEAD,sm(1.05,1.6,sg));
 return{pose:p,place:{x:PC[0]+DIRK[0]*g,z:PC[1]+DIRK[1]*g,yaw:YAW_D}};
}

// ---------------------------------------------------------------- Solo: the unhurried stroll, set, BIG, the dive to her right, up, the roar
/** stay big: knees bent, on the balls of her feet, arms wide and low, palms open to the kicker */
const BIG=posed({lHipF:42,rHipF:42,lHipA:22,rHipA:22,lKnee:50,rKnee:50,lAnk:-4,rAnk:-4,lean:14,pitch:6,lShA:88,rShA:88,lShF:18,rShF:18,lElb:22,rElb:22,lShR:20,rShR:20,lHand:1,rHand:1,neckP:-12});
/** up on her feet, fists clenched, chest out, head back: the roar */
const ROAR=posed({lHipF:24,rHipF:24,lHipA:20,rHipA:20,lKnee:36,rKnee:36,lean:-6,pitch:-2,neckP:-28,lShA:50,rShA:50,lShF:-14,rShF:-14,lElb:108,rElb:108,lShR:10,rShR:10,lHand:0,rHand:0});
const T_BIG=-2.1,T_UP=1.35,T_ROAR=2.05,STROLL=1.05;
/** stall ∈ [0,1]: a slow walk along her line to her left (+z) and back (ch1 only; 1 = back in the middle) */
function soloState(sg:number,stall=1,it=0):State{
 let pose=keeperSet(it*1.1),place:Place={...soloPlace0};
 if(stall>0&&stall<1){const e=stall*stall*(3-2*stall),z=STROLL*Math.sin(Math.PI*e),dir=Math.cos(Math.PI*e)*6*stall*(1-stall),walking=clamp(Math.abs(dir)*1.6),d=e<.5?z:2*STROLL-z;
  const w=blendPose(walkPose(d/1.25),stand(),.25);w.neckY=-38*DEG*Math.sign(dir);pose=blendPose(blendPose(stand(),posed({lHipF:8,rHipF:10,lKnee:10,rKnee:12,lShA:14,rShA:14,lElb:30,rElb:30,lean:4,neckP:-4,lHand:1,rHand:1}),.6),w,walking);
  place={x:SOLO_X,z,yaw:lerpAng(SOLO_YAW,dir>0?-Math.PI/2:Math.PI/2,walking*.9)};}
 if(sg>T_BIG)pose=blendPose(pose,BIG,sm(T_BIG,T_BIG+.45,sg)*(1-sm(T_DIVE-.35,T_DIVE-.05,sg)*.55));
 if(sg>T_DIVE-.35)pose=blendPose(pose,keeperSet(.72),sm(T_DIVE-.35,T_DIVE-.05,sg)*.5);
 if(sg>T_DIVE-.05)pose=blendPose(pose,DIVE((sg-T_DIVE)/DIVE_L),sm(T_DIVE-.05,T_DIVE,sg));
 const dz=DIVE(1).dz,up=sm(T_UP,T_UP+.7,sg,easeInOutSine);
 if(up>0){pose=blendPose(pose,stand(),up);place={...place,z:(place.z??0)-dz*up};}
 if(sg>T_ROAR-.35){pose=blendPose(pose,ROAR,sm(T_ROAR-.35,T_ROAR,sg));const pump=Math.max(0,Math.sin((sg-T_ROAR)*7))*sm(T_ROAR-.1,T_ROAR+.2,sg);pose.lElb-=26*DEG*pump;pose.rElb-=26*DEG*pump;pose.neckP-=8*DEG*pump;pose.lean-=4*DEG*pump;}
 return{pose,place};
}
const soloSk=(sg:number,stall=1,it=0):Skeleton=>{const st=soloState(sg,stall,it);return solve(st.pose,B_SOLO,st.place);};

// ---------------------------------------------------------------- everyone else: the officials, the two lines arm in arm in the centre circle
type Extra={name:string;st:AthleteStyle;x:number;z:number;yaw:number;kind:'ref'|'usa'|'bra';ph:number};
const EXTRAS:Extra[]=[
 {name:'referee',st:REF_ST,x:-7.2,z:9.4,yaw:yawTo(-3.8,-9.4),kind:'ref',ph:.3},
 {name:'assistant',st:{...REF_ST,seed:31},x:.3,z:9.2,yaw:yawTo(-1,-.25),kind:'ref',ph:.7},
];
{// the teams in the centre circle (USA in black, Brazil in yellow), side by side facing the shootout goal
 for(let i=0;i<7;i++)EXTRAS.push({name:'USA '+i,st:usa({number:[7,10,20,15,11,13,17][i],hair:i%3===1?[Y,.8]:[K,.7],seed:60+i,detail:'low'}),x:-51.6+(i%2)*.25,z:-6.3+i*.95,yaw:0,kind:'usa',ph:i*.37});
 for(let i=0;i<7;i++)EXTRAS.push({name:'Brazil '+i,st:brazil({number:[11,10,15,4,13,2,5][i],skin:i%2?SKIN_D:SKIN_M,seed:80+i,detail:'low'}),x:-51.9+(i%2)*.25,z:1.2+i*.95,yaw:0,kind:'bra',ph:i*.29});}
const LINKED=posed({lShA:40,rShA:40,lShF:4,rShF:4,lElb:30,rElb:30,lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:6,neckP:4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
function extraState(e:Extra,sg:number,it:number):State{
 const saved=sm(T_HAND+.3,T_HAND+.9,sg),br=Math.sin(it*2+e.ph*TAU);
 if(e.kind==='ref'){const p=blendPose(stand(),posed({lShA:24,rShA:24,lShF:-20,rShF:-20,lElb:80,rElb:80,lHipF:8,rHipF:8,lKnee:12,rKnee:12,lean:6}),.4+.1*br);return{pose:p,place:{x:e.x,z:e.z,yaw:e.yaw}};}
 let p=blendPose(stand(),LINKED,.8);
 if(saved>0)p=e.kind==='usa'?blendPose(p,celebrate(it*.9+e.ph,{kind:'arms'}),saved):blendPose(p,e.ph*10%2<1?HANDS_HEAD:SLUMP,saved*.85);
 return{pose:p,place:{x:e.x,z:e.z,yaw:e.yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the run, the strike, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,sg:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(sg),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&sg>0&&sg<T_HAND+T_OUT){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(240,d*1.3),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(sg),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Env={it:number;walk?:number;stall?:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;crowd?:boolean;goal?:boolean};
/** everything on the pitch, depth-sorted (far first): the players at σp (poses on twos) with their previous drawn pose, the ball at σ,
 * the goal. Heat: small figures print at `low`; inside a passage every figure is capped. */
function play(s:Sheet,c:Cam,sg:number,sp:number,spPrev:number,e:Env):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<.8)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if((!hero&&px<120)||px<44)return{...st,detail:'low'};return st;};
 const walk=e.walk??1,stall=e.stall??1,itp=e.it-1/12;
 {const cur=daianeState(sp,walk,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=daianeState(spPrev,walk,itp);drawPlayer(s,cur.pose,c,detailFor(DAI_ST,d,true),cur.place,prev,!!e.smear&&sp>T_RUN0+.3&&sp<.3);}});}
 {const cur=soloState(sp,stall,e.it),q=toCam(c,[(cur.place.x??0)+.3,.8,(cur.place.z??0)-(sp>T_DIVE?1:0)]),d=q[2];
  if(d>.5)items.push({d,draw:()=>{const prev=soloState(spPrev,stall,itp);drawPlayer(s,cur.pose,c,detailFor(SOLO_ST,Math.max(d,1),true),cur.place,prev,!!e.smear&&sp>T_DIVE&&sp<T_HAND+.25);}});}
 if(e.crowd)for(const x of EXTRAS){const cur=extraState(x,sp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>drawPlayer(s,cur.pose,c,detailFor(x.st,d,false),cur.place,extraState(x,spPrev,itp))});}
 let out:{g:Pt;r:number}|null=null;
 const bq=toCam(c,ballAt(sg));if(bq[2]>=NEAR)items.push({d:bq[2]-(Math.abs(sg-T_HAND)<.08?.3:0),draw:()=>{const r=drawBall(s,c,sg,{min:e.minBall,lines:e.lines,prev:e.prevT});if(r)out={g:r.g,r:r.r};}});
 if(e.goal!==false){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,sm(T_HAND+T_OUT-.1,T_HAND+T_OUT+.1,sg)*(1-sm(T_HAND+T_OUT+.2,T_HAND+T_OUT+.9,sg)))});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const plXZ=(p:Place,y=1):V3=>[p.x??0,y,p.z??0];
/** the save's glove burst */
function gloveBurst(s:Sheet,c:Cam,g:number,seed:number,min=50){if(g<=0||g>=1)return;const q=pr(c,TGT);if(!q)return;const k=kAt(c,TGT);
 sparkBurst(s,Y,q[0],q[1],Math.max(min,k*.75)*easeOutBack(clamp(g*2.5)),{n:10,seed,g:1-clamp((g-.45)/.55),width:Math.max(6,k*.05)});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** Daiane sets the ball and walks back to her mark from "The USA"; Solo strolls her line from just after it and is back in the middle before the run;
 * contact a beat after "Daiane shoots" (later if a quick voice crowds the stroll) */
const stall0=()=>CUE(0,'The USA')+.3,stall1=()=>Math.max(stall0()+3,CUE(0,'Hope Solo')+.4);
const tS1=()=>Math.max(CUE(0,'Daiane shoots')+.25,stall1()+.3-T_RUN0);
const sig1=(t:number)=>Math.max(-12,t-tS1());
const walk1=(t:number)=>{const a=CUE(0,'The USA')-.2,b=Math.max(a+2.5,tS1()+T_RUN0-.6);return sm(a,b,t,linear);};
const stall1f=(t:number)=>sm(stall0(),stall1(),t,linear);
const P1:V3=[-30,19,-62];
function cam1(t:number):Cam{
 const tR=tS1()+T_RUN0;
 return plan(t,[
  [0,0,()=>({P:P1,T:[-32,3.5,4],fov:30})],
  [CUE(0,'The USA')-.2,1.3,()=>({P:P1,T:[-51.8,.9,.4],fov:10})],
  [CUE(0,'penalties')-.15,1,()=>({P:P1,T:[-6.5,1,0],fov:11})],
  [CUE(0,'Daiane steps')-.2,.9,()=>({P:P1,T:plXZ(daianeState(-9,walk1(t)).place,1),fov:4.6})],
  [CUE(0,'Hope Solo')-.25,.9,()=>({P:P1,T:plXZ(soloState(-9,stall1f(t)).place,1.05),fov:4.3})],
  [Math.max(tR-.5,CUE(0,'Hope Solo')+.7),.8,()=>({P:P1,T:[-6.2,1,-1.1],fov:11.5})],
  [tS1()+T_HAND+.05,.7,()=>({P:P1,T:[-1.4,.8,-3.2],fov:6.8})],
  [CUE(0,'Saved')+.1,1.3,()=>({P:P1,T:plXZ(soloState(sig1(t)).place,1.1),fov:5})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),sg=sig1(t),sp=sig1(tt),spp=sig1(tt-1/12),tH=tS1()+T_HAND,tSv=CUE(0,'Saved');
  stadium(s,c,t,[0,1,3],{roar:sm(tH,tH+.4,t),flash:sm(tSv-.15,tSv+.3,t)*(1-sm(tSv+2,tSv+2.8,t))});
  ground(s,c);
  const r=play(s,c,sg,sp,spp,{it:tt,walk:walk1(tt),stall:stall1f(tt),minBall:10,lines:true,prevT:sig1(t-.06),crowd:true});
  if(r.ball)gloveBurst(s,c,(sg-T_HAND+.02)/.45,29,40);
 },
 aperture(t){const c=cam1(t),sk=soloSk(sig1(twos(t))),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],Math.max(40,kAt(c,sk.chest)*.5),12);},
 get still(){return tS1()+T_HAND+.05;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from the keeper's eye (inside the goal, over her right shoulder)
const sig2=(t:number)=>key(t,mono([[0,-2.6],[CUE(1,'stays calm'),-2.1],[CUE(1,'watches how'),T_RUN0+.05],[CUE(1,'runs at'),-.75],[CUE(1,'pushes off'),T_DIVE+.02],[CUE(1,'punches'),T_HAND+.02],[SECS(1),T_HAND+.75]]),linear);
const E2:V3=[1.05,1.72,-.62];
function cam2(t:number):Cam{
 const sg=sig2(t),d=daianeState(sg).place;
 return plan(t,[
  [0,0,()=>({P:E2,T:[-11,1.1,-.9],fov:30})],
  [CUE(1,'stays calm')-.2,1,()=>({P:add3(E2,[.15,.05,.05]),T:[-6,1.05,-.4],fov:36})],
  [CUE(1,'watches how')-.2,1,()=>({P:E2,T:plXZ(d,.95),fov:17})],
  [CUE(1,'pushes off')-.3,.6,()=>({P:[1.85,1.8,1.15],T:[-2.4,.75,-1.9],fov:40})],
  [CUE(1,'punches')-.15,.7,()=>({P:[1.85,1.75,1.1],T:add3(TGT,[-.6,0,.2]),fov:32})],
 ]);
}
/** the replay trail: the shot so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,sg:number,fade:number){
 if(fade<=0||sg<=.02)return;const pts:Pt[]=[];const a=Math.max(0,sg-.45),b=Math.min(sg,T_HAND);for(let i=0;i<=18;i++){const p=pr(c,ballAt(lerp(a,b,i/18)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(sg,T_HAND)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),sg=sig2(t),sp=sig2(tt),spp=sig2(tt-1/12);
  stadium(s,c,t,[0,2,3],{roar:sm(T_HAND,T_HAND+.4,sg)});
  ground(s,c);
  trail(s,c,sg,1-sm(T_HAND+.15,T_HAND+.6,sg));
  play(s,c,sg,sp,spp,{it:tt,smear:true,minBall:9,crowd:true});
  gloveBurst(s,c,(sg-T_HAND+.02)/.4,23,50);
 },
 aperture(t){const c=cam2(t),q=pr(c,ballAt(sig2(twos(t))))??[0,0];return apertureDisc(q[0],q[1],50,12);},
 get still(){return CUE(1,'punches')+.1;},
};

// ---------------------------------------------------------------- 3 · the second angle, low in front on her right: the glove at the lens, then she roars
const sig3=(t:number)=>key(t,mono([[0,T_HAND-.3],[CUE(2,'strong hands'),T_HAND+.02],[CUE(2,'wide'),T_HAND+.3],[CUE(2,'Then'),T_UP+.05],[CUE(2,'the USA win'),T_ROAR+.1],[SECS(2),T_ROAR+.1+(SECS(2)-CUE(2,'the USA win'))]]),linear);
const E3:V3=[-3.6,.58,-5.3];
function cam3v(t:number):Cam{
 const sg=sig3(t);
 return plan(t,[
  [0,0,()=>({P:E3,T:add3(TGT,[-.2,.1,.5]),fov:30})],
  [CUE(2,'strong hands')-.2,.8,()=>({P:add3(E3,[.3,.05,.2]),T:add3(TGT,[0,.05,.05]),fov:21})],
  [CUE(2,'wide')-.1,.8,()=>({P:add3(E3,[-.6,.3,-.4]),T:mix3(plXZ(soloState(sg).place,.5),ballAt(Math.min(sg,T_HAND+.5)),.4),fov:44})],
  [CUE(2,'Then')-.2,1.4,()=>({P:[-6.4,1.35,-6.6],T:plXZ(soloState(sg).place,1.05),fov:26})],
  [CUE(2,'the USA')-.2,1.2,()=>({P:[-5.6,1.1,-5.2],T:plXZ(soloState(sg).place,1.35),fov:22})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),sg=sig3(t),sp=sig3(tt),spp=sig3(tt-1/12),tU=CUE(2,'the USA win');
  stadium(s,c,t,[0,1],{roar:.3+.7*sm(T_HAND,T_HAND+.4,sg),flash:sm(tU-.1,tU+.3,t)});
  ground(s,c);
  play(s,c,sg,sp,spp,{it:tt,smear:true,minBall:9,lines:true,prevT:sig3(t-.06),crowd:true});
  gloveBurst(s,c,(sg-T_HAND+.02)/.45,31,60);
 },
 aperture(t){const c=cam3v(t),sk=soloSk(sig3(twos(t))),q=pr(c,sk.head)??[0,0];return apertureDisc(q[0],q[1],Math.max(50,kAt(c,sk.head)*.3),12);},
 get still(){return CUE(2,'strong hands')+.1;},
};

// ---------------------------------------------------------------- 4 · the lesson, side-on: calm → big → read the run and the hips → dive → strong hands
const sig4=(t:number)=>key(t,mono([[0,-3],[CUE(3,'calm'),-2.7],[CUE(3,'big'),T_BIG+.25],[CUE(3,'Read'),T_RUN0+.02],[CUE(3,'hips'),-.62],[CUE(3,'dive'),T_DIVE+.03],[CUE(3,'strong hands'),T_HAND+.02],[SECS(3),T_HAND+.5]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-6.6,1.45,-.9],T:[-.3,1.05,0],fov:24})],
  [CUE(3,'big')-.2,.9,()=>({P:[-6.2,1.4,-.8],T:[-.3,1,0],fov:27})],
  [CUE(3,'Read')-.25,1.1,()=>({P:[-8.6,2.7,-9.6],T:[-13.3,.7,-2.5],fov:38})],
  [CUE(3,'hips')-.2,.9,()=>({P:[-9.4,1.7,-6.8],T:plXZ(daianeState(sig4(t)).place,.95),fov:28})],
  [CUE(3,'dive')-.25,.9,()=>({P:[-4.4,1.5,-7.2],T:[-.5,.75,-1.8],fov:27})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a ring round a 3D point: flat on the ground, or upright facing the camera */
function ring3(s:Sheet,c:Cam,at:V3,r:number,w:number,ink:string,cov:number,flat=true,seed=43){
 const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,P:V3=flat?[at[0]+Math.cos(a)*r,at[1],at[2]+Math.sin(a)*r]:add3(at,[c.r[0]*Math.cos(a)*r+c.u[0]*Math.sin(a)*r,c.r[1]*Math.cos(a)*r+c.u[1]*Math.sin(a)*r,c.r[2]*Math.cos(a)*r+c.u[2]*Math.sin(a)*r]),p=pr(c,P);if(p)pts.push(p);}
 if(pts.length<28)return;const rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:.8});s.knockout(rr,.9*cov);s.fill(ink,rr,.95*cov);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),sg=sig4(t),sp=sig4(tt),spp=sig4(tt-1/12);
  const tC=CUE(3,'calm'),tB=CUE(3,'big'),tR=CUE(3,'Read'),tH=CUE(3,'hips'),tD=CUE(3,'dive'),tS=CUE(3,'strong hands');
  stadium(s,c,t,[0,1],{roar:.6*sm(tS,tS+.4,t)});
  ground(s,c);
  // "Read the kicker's run": the arc of Daiane's run as footprints on the grass, lit in order as she runs it (under the players)
  const rd=sm(tR-.2,tR+.3,t)*(1-sm(tD+.3,tD+.9,t));
  if(rd>0){const dim=new Path2D(),lit=new Path2D(),n=10;for(let k=0;k<n;k++){const sk=ARC_L*(k+.5)/n,a=arcAt(sk),side=k%2?.13:-.13,nx=Math.sin(a.yaw)*side,nz=Math.cos(a.yaw)*side,pts:Pt[]=[];
    for(let i=0;i<12;i++){const u=i/12*TAU,p=pr(c,[a.p[0]+nx+Math.cos(u)*.17,.01,a.p[1]+nz+Math.sin(u)*.1]);if(p)pts.push(p);}(sg>T_RUN0&&runS(sp)>=sk?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*rd);s.stroke(K,lit,4,.9*rd);s.knockout(lit);s.fill(Y,lit,.95*rd);}
  play(s,c,sg,sp,spp,{it:tt,smear:true,minBall:10});
  const so=soloSk(sp,1,tt);
  // "calm": a slow breath ring round her, swelling and settling twice
  const cm=sm(tC-.15,tC+.3,t)*(1-sm(tB+.1,tB+.6,t));
  if(cm>.02){const br=.5-.5*Math.cos((t-tC)*TAU/1.3);ring3(s,c,mix3(so.pelvis,so.chest,.6),.62+.16*br,Math.max(5,kAt(c,so.chest)*.03),Y,cm*(.65+.35*br),false,41);}
  // "big": short red arrows pushing out from her gloves and boots — she fills the goal
  const bg=sm(tB-.1,tB+.35,t,easeOutBack)*(1-sm(tR+.2,tR+.7,t));
  if(bg>.02){const cen=mix3(so.pelvis,so.chest,.5);for(const P of[so.lHa,so.rHa,so.lToe,so.rToe]){const d=sub3(P,cen),l=Math.hypot(d[0],d[1],d[2])||1,u:V3=[d[0]/l,d[1]/l,d[2]/l],a=add3(P,[u[0]*.12,u[1]*.12,u[2]*.12]),b=add3(a,[u[0]*.55*clamp(bg),u[1]*.55*clamp(bg),u[2]*.55*clamp(bg)]);
    arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(6,kAt(c,a)*.045),R,.95);}}
  // "Read": a dashed yellow sight line from Solo's eyes to Daiane's body
  const ds=(()=>{const st=daianeState(sp,1,tt);return solve(st.pose,B_DAI,st.place);})();
  const sl=sm(tR-.1,tR+.45,t)*(1-sm(tD-.1,tD+.25,t));
  if(sl>.02){const a=pr(c,so.face),b=pr(c,ds.pelvis);
   if(a&&b){const rb=new Path2D(),n=10,w=Math.max(6,kAt(c,so.face)*.03),u1=clamp(sl);for(let i=0;i<n;i++){const u0=i/n*u1,ue=(i+.6)/n*u1;rb.addPath(ribbon([[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)]],w,{seed:13+i,taper:.2,wobble:0}));}
    s.knockout(rb,.95);s.fill(Y,rb,.95);s.stroke(K,rb,1.6,.8);}}
  // "hips": a ring round them and an arrow the way they open — across her, to Solo's right
  const hp=sm(tH-.15,tH+.4,t,easeOutBack)*(1-sm(tD+.25,tD+.8,t));
  if(hp>.02){ring3(s,c,ds.pelvis,.3,Math.max(5,kAt(c,ds.pelvis)*.035),Y,clamp(hp),false,47);
   const a=ds.pelvis,dir=nrm2(TGT[0]-SPOT[0],TGT[2]-SPOT[2]),b=add3(a,[dir[0]*1.6*clamp(hp),0,dir[1]*1.6*clamp(hp)]);arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(6,kAt(c,a)*.04),Y,.95);}
  // "dive": a red arrow along her dive, low to her right
  const dv=sm(tD-.1,tD+.35,t,easeOutBack)*(1-sm(tS+.6,tS+1.2,t));
  if(dv>.02){const a:V3=[SOLO_X-.25,.95,-.2],b:V3=[SOLO_X-.3,.7,-.2-2.3*clamp(dv)];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(8,kAt(c,a)*.06),R,.95);}
  // "strong hands": a yellow burst and a ring on the glove as it meets the ball
  const sh=sm(tS-.05,tS+.4,t);if(sh>0&&sg>T_HAND-.05){gloveBurst(s,c,clamp(sh*.9),61,60);ring3(s,c,TGT,.26,Math.max(6,kAt(c,TGT)*.035),Y,clamp(sh)*(1-sm(tS+1.2,tS+1.8,t)),false,59);}
 },
 get still(){return CUE(3,'strong hands')+.3;},
};

const film:RisoStory={
 id:'solo-brazil-2011',format:'11v11',title:"Solo's shootout save v Brazil",
 theme:'Goalkeeping: stay calm and big, read the kicker\'s run and hips, then dive and push it away with strong hands',
 ageNote:'Brazil 2–2 USA (USA won 5–3 on penalties), Women’s World Cup quarter-final, Dresden, 10 July 2011. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a keeper's punch — a red glove swings in, a yellow burst, the ball flies away. Reduced motion: the burst. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,80,{n:8,seed,width:10});return;}
  const u=easeOut(clamp(age/.22)),out=clamp((age-.2)/.45),fade=1-clamp((age-.6)/.25);
  if(age>.18&&age<.5)sparkBurst(s,Y,x,y,90,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.18)/.1))*(1-clamp((age-.36)/.14)),width:11});
  if(fade>0){const gx=x-60+50*u,gy=y+30-26*u,p=new Path2D();p.ellipse(gx,gy,26,32,-.5,0,TAU);s.knockout(p,.9*fade);s.fill(R,p,.92*fade);s.stroke(K,p,3,.85*fade);
   footballPanels(s,x+200*easeOut(out),y-90*Math.sin(out*Math.PI*.8),24,{rot:age*12+r()*TAU,key:K,shadow:B,seed:5});}
 },
};
export default film;
/** Solved contact points (pitch metres; the goal line x = 0, Solo's right = −z) — checked by tests/play-film-solo-brazil-2011.cjs. */
export const FACTS={SPOT,HAND,TGT,T_HAND,T_DIVE,ballAt,diveSide:'r' as const,kickFoot:'r' as const,
 daianeContact:()=>{const st=daianeState(0),sk=solve(st.pose,B_DAI,st.place);return{rToe:sk.rToe,lToe:sk.lToe};},
 soloAt:(sg:number)=>{const sk=soloSk(sg);return{rHa:sk.rHa,lHa:sk.lHa,pelvis:sk.pelvis,head:sk.head};}};
