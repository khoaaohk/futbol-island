/** Gabriel Magalhães's signature — "the corner-kick header" (lib/town/iconicPlays.json: kind "signature", lesson "Start your run late and
 * attack the ball, don't wait for it."). THE MOMENT: Tottenham Hotspur 0–1 Arsenal, Premier League (the North London derby), Tottenham
 * Hotspur Stadium, London, Sunday 15 September 2024 — the 64th-minute winning HEADER from Bukayo Saka's inswinging corner. An iconic-play riso
 * film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1
 * reconstruction from WRITTEN accounts plus one agency photo of the header (the footage itself was not reviewed), rendered as a riso print.
 * WHY THIS MOMENT: it is his best-documented corner header — a derby winner, described beat by beat by two match reports — and the Guardian's
 * account is exactly the lesson: Gabriel stayed behind Cristian Romero ("applied a bit of pressure into Cristian Romero's back and, when he
 * rose, the conversion was straightforward"), i.e. a late move to attack the ball, not a player standing on the spot waiting for it. Sky:
 * "Cristian Romero went to sleep and Gabriel rose highest".
 * Narration text: public/plays/narration/gabriel-magalhaes-signature/script.json. The lead voices it later with local Kokoro. Until then every
 * chapter runs on provisional cue times (see estimate()); EVERY action time is read from cue onsets and chapter seconds, so once timing.json
 * exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/gabriel-magalhaes-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/gabriel-magalhaes-signature/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (23 Sep 2026, read as raw pages with a generic UA; cached under the session scratchpad films/src-cache/):
 *  - Sky Sports, Nick Wright, "Tottenham 0-1 Arsenal: Gabriel Magalhaes heads winner as Gunners stay on Man City's tail with derby victory"
 *    (15 Sep 2024) https://www.skysports.com/football/tottenham-vs-arsenal/report/505845  (cache: sky-tot-ars-2024.txt)
 *    "Gabriel rose above Cristiano [sic] Romero to power home Bukayo Saka's corner midway through the second half"; "Gabriel's header,
 *    powered home from inside the Spurs six-yard box from Saka's inswinging delivery"; "Cristian Romero went to sleep and Gabriel rose
 *    highest to send his close-range header crashing into the net"; line-ups (Vicario; Raya, White, Saliba, Gabriel, Timber …; Ødegaard
 *    injured, Rice suspended).
 *  - The Guardian, "Gabriel's towering header secures derby win for depleted Arsenal at Tottenham" (15 Sep 2024)
 *    https://www.theguardian.com/football/2024/sep/15/tottenham-arsenal-premier-league-match-report  (cache: guardian-tot-ars-2024.txt)
 *    "When Saka bent in the kick, it was impossible to ignore the mass of bodies that engulfed Vicario. He could not get out to the ball,
 *    which Saka had dropped into the ideal area. Gabriel applied a bit of pressure into Cristian Romero's back and, when he rose, the
 *    conversion was straightforward"; "Guglielmo Vicario was boxed in … and there was Gabriel to power home the header"; the goal came
 *    after a counter had won the corner.
 *  - Wikipedia (raw wikitext), "Gabriel Magalhães": "On 15 September 2024, Gabriel headed in a 64th minute corner in the North London
 *    derby, sealing a 1–0 away win for Arsenal" (cache: wiki-gabriel-magalhaes.txt).
 *  - Reuters / Tony O'Brien photo in the Guardian report ("Arsenal's Gabriel Magalhaes scores their first goal", viewed, not reproduced;
 *    cache: guardian-tot-ars-2024-celebr.jpg) and the report's lead photo of his celebration (guardian-tot-ars-2024-header.jpg): the kits
 *    THAT day — Arsenal in their BLACK away strip (black shirts with red-and-green trim, black shorts, black socks; Saliba's 2 on his
 *    shorts); Tottenham in WHITE shirts, NAVY shorts, WHITE socks; Vicario in bright YELLOW; a sunny afternoon; Gabriel high above the
 *    pack with the ball just over his head, knees tucked, arms out, orange-red boots; Vicario at the post, hemmed in by bodies.
 * CONFIRMED by those sources: date, ground, competition, opponent, 0–0 until the 64th minute, 1–0 final; the corner by Saka, INSWINGING;
 *  Vicario boxed in by bodies and unable to come for it; Gabriel behind Romero, rising above him; the header from inside the six-yard box,
 *  powered in; the kits above; daylight.
 * INFERRED / ILLUSTRATIVE: which corner (drawn: Arsenal's RIGHT, the +z flag on the far side of the TV picture, because an INSWINGER from
 *  Saka's LEFT foot — his stronger foot — comes from the right; never narrated); which end, and the single-tier South Stand drawn behind that
 *  goal; every position, run and timing in metres and seconds (Gabriel waiting ≈ 2.5 m behind Romero, a late 2 m step-in, meeting the ball
 *  ≈ 5.6 m out; the corner ≈ 34 m in ≈ 1.35 s); where the header went (drawn: down, left of Vicario, into the middle of the net); the other
 *  players (unnamed except Saliba, whose 2 is in the photo), who stood where; squad numbers (Gabriel 6, Saka 7, Saliba 2, Romero 17,
 *  Vicario 1 — the 2024-25 numbers); shirt numbers printed in paper; the black kit printed in navy ink, its trim in red; the stadium's shape,
 *  seat and crowd colours, the Arsenal fans' corner; the celebration run; the TV camera positions and lenses. The narration names none of
 *  the inferred details.
 *
 * STRUCTURE (the TV broadcast, never top-down; compositions distinct from the other corner-header films): the play is ONE simulation on a
 *  real clock τ (seconds, τ = 0 the corner is struck):
 *  ch1 = the live broadcast from the high West Stand camera, real time, on a sunny afternoon: team rings (white / black), the 0-0 / 64' score
 *  bug, Saka at the FAR flag, the inswinger, the header, the away corner erupts; ch2 = the TV slow-motion replay LOW ON THE GOAL LINE beside
 *  the near post (the agency photographer's angle): Gabriel waiting behind Romero, Vicario boxed in by bodies, the late step and the header
 *  coming at the lens; ch3 = a second replay from BEHIND SAKA at the corner flag, the ball curling away from us into the box: Romero loses
 *  track of Gabriel, who rises highest; ch4 = the lesson from the side of the box, very slow, with teaching marks (a pale ghost who arrives
 *  early and stands still on the spot and can only jump from a standstill; Gabriel's late run arrow; the ball ring; the header arrow).
 *  Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), so it frames from the 1.45:1 card window
 *  down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion, motionSmear on the corner, the leap and the header). Handedness: the world is right-handed (x toward Tottenham's goal,
 * y up, +z = Arsenal's right), exactly athlete.ts's convention, so strike({foot:'l'}) is Saka's LEFT foot and the corner from Arsenal's right
 * is the +z corner. Inks: yellow, red, blue, navy (Tottenham's white = paper; Arsenal's black = navy). Everything is keyed to cue times,
 * poses on twos, cameras on ones; all randomness seeded. Heat: small figures print at 'low', at most FULL_CAP non-hero figures at full
 * detail, every figure inside a passage (and a chapter's last .7 s) capped. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word:
 * Kokoro splits contractions and hyphens); their `at` and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Derby day',text:'North London derby, September 2024: Tottenham in white, Arsenal in black. Still no goals after sixty-four minutes. Bukayo Saka curls in a corner... Gabriel attacks it... Goal!',tail:2.1,
  cues:['North London','Tottenham in white','Arsenal in black','Still no goals','minutes','Bukayo Saka','curls in','Gabriel attacks','Goal']},
 {label:'Watch it again',text:'Watch again, slowly. Gabriel waits behind Cristian Romero. The keeper, Vicario, is boxed in. Gabriel moves late, jumps, and powers it home.',tail:1.7,
  cues:['Watch again','slowly','Gabriel waits','Cristian Romero','Vicario','boxed in','moves late','powers it home']},
 {label:'From the corner',text:'From behind Saka: the ball curls toward goal. Romero loses track of Gabriel, and Gabriel rises highest to head it in!',tail:2.1,
  cues:['From behind','curls toward','Romero loses','track of','rises highest','head it in']},
 {label:'Attack the ball',text:"Never stand still on the spot. Start your run late, and attack the ball. Don't wait for it!",tail:2.2,
  cues:['Never stand','on the spot','Start your run','late','attack the ball','wait for it']},
];
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py gabriel-magalhaes-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/gabriel-magalhaes-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('gabriel: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('gabriel: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*clamp(u);
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
/** Pitch: Tottenham's goal line is x = 0 (Arsenal attack +x), goal centre z = 0, +z = Arsenal's right; touchlines z = ±34, halfway
 * x = −52.5. The TV camera side (the West Stand) is −z, so Saka's corner comes from the FAR flag. */
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

// ---------------------------------------------------------------- Tottenham Hotspur Stadium on a sunny September afternoon
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z, East: two tiers with an LED ribbon between), 1 behind Tottenham's goal
 * (+x: the great single-tier South Stand), 2 the West Stand (−z, the camera side), 3 the North end (−x, three tiers). A closed bowl:
 * the corners are filled. The Arsenal fans: a red block low in the far corner of the East Stand (inferred). */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-114,9,a),1.4+26*b,41+30*b],
 (a,b)=>[9+34*b,1.4+38*b,lerp(-42,42,a)],
 (a,b)=>[lerp(9,-114,a),1.4+30*b,-41-34*b],
 (a,b)=>[-114-26*b,1.4+24*b,lerp(40,-40,a)],
];
const STAND_COLS=[100,80,100,64],STAND_ROWS=[13,17,14,11],TIERS=[[.46],[],[.4],[.34,.68]];
/** Arsenal's away block: stand 0, a ∈ [.74,.9], b < .42 */
const awayBlock=(si:number,a:number,b:number)=>si===0&&a>.74&&a<.9&&b<.42;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a pale September sky: paper with a light blue screen, a warm yellow haze low down
 s.field(B,.17,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.1,.16].forEach((d,i)=>s.tone(Y,polyPath([[-1e4,hz[1]+80-i*140],[1e4,hz[1]+80-i*140],[1e4,hz[1]-220-i*140],[-1e4,hz[1]-220-i*140]],true),d));}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D(),led=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[i]){seg3(c,S(0,b),S(1,b),1.4,tier);seg3(c,S(0,b+.012),S(1,b+.012),.7,led);}
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1,0]),add3(S(1,1),[0,1,0]),add3(S(1,.78),[0,9,0]),add3(S(0,.78),[0,9,0])]));
  seg3(c,add3(S(0,.78),[0,8.8,0]),add3(S(1,.78),[0,8.8,0]),.4,edge);}
 // navy seats in the shade of the roof
 s.knockout(planes);s.tone(K,planes,.52);s.tone(B,planes,.3);s.knockout(tier,.85);s.fill(K,led,.9);
 // the crowd: seeded marks sized by distance (Spurs white and navy, some blue; the away block red); the roar lifts the away block (and all of it on flash)
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.2)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),away=awayBlock(si,a,b);
   const lift=roar>0&&away?roar*z*1.4*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=away?(h<.7?1:0):h<.55?0:h<.82?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.fill(R,inks[1],.95);s.fill(K,inks[2],.85);s.fill(B,inks[3],.9);
 s.knockout(roof);s.fill(K,roof,.9);s.tone(B,roof,.4);s.knockout(edge,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(18*flash);for(let i=0;i<n;i++){const r1=hash(i*29+Math.floor(tt*12)*7,4),q=pr(c,STANDS[0](lerp(.75,.89,r1),.05+.33*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=8+11*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.78);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.3,z],[5.9,.3,z+4.2],[5.9,.6,z+4.2],[5.9,.6,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.3,zz],[x+4.4,.3,zz],[x+4.4,.6,zz],[x,.6,zz]]));}
 // the dark LED boards with pale lettering bands
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.8);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.12,0,0],[-10.88,0,0],.24,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** Tottenham's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around (bz) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.6,-1.3,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** Arsenal, 15 Sep 2024: the BLACK away strip — black shirts, shorts and socks (the photo), printed in navy; red trim; paper numbers */
const ars=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.92],shorts:[K,.92],socks:[K,.92],boots:[R,.85],skin:SKIN_M,hair:K,line:K,shade:[B,.35],trim:R,numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Tottenham, 15 Sep 2024: white shirts, navy shorts, white socks (the photo) */
const tot=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.92],socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',build:{height:1.83,bulk:1},...o});
const B_GAB:Build={height:1.9,bulk:1.08,thighs:1.06},B_SAKA:Build={height:1.78,bulk:.98,thighs:1.04},B_VIC:Build={height:1.94,bulk:1.02},B_ROM:Build={height:1.85,bulk:1.04};
/** Gabriel: No. 6, 1.90 m, dark skin, short black hair, orange-red boots (the photo) */
const GAB_ST=ars({number:6,skin:SKIN_D,hair:[K,.95],build:B_GAB,seed:6});
const SAKA_ST=ars({number:7,skin:SKIN_D,hair:[K,.95],build:B_SAKA,boots:K,seed:7});
/** Vicario: all bright yellow (the photo), No. 1, pale gloves */
const VIC_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.85],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:B_VIC,seed:1};
/** Romero: No. 17, dark hair */
const ROM_ST=tot({number:17,skin:SKIN_M,hair:[K,.95],build:B_ROM,seed:17});
/** the lesson's ghost: a pale navy print of a player who arrives early and stands still (not a real player) */
const GHOST_ST:AthleteStyle={shirt:[K,.16],shorts:[K,.16],socks:[K,.16],boots:[K,.3],skin:[[K,.12]],hair:[K,.3],line:K,hairStyle:'short',shadow:false,lineWeight:.7,build:B_GAB,seed:40};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is the corner struck)
const BALL_R=.11,GRAV=9.81;
/** the corner flies TF s to his forehead; the powered header reaches the goal line TG (≈ 5.7 m in .32 s) */
const TF=1.35,TG=TF+.32;
/** Gabriel's header spot (his pelvis) ≈ 5.6 m out, just behind Romero's back; he faces the goal, turned toward the corner (+z) */
const HP:[number,number]=[-5.55,-1.0],YAW_H=yawTo(1,.42);
/** his header: header() with a big spring ("rose highest", knees tucked in the photo), a powerful downward nod, the head turned to his left */
function gabHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.18;const w=Math.sin(Math.PI*clamp((u-.34)/.36)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(-.14,.26,sn)*w;p.twist+=lerp(-.08,.14,sn)*w;p.neckP+=.36*w;p.lKnee+=.3*w;p.rKnee+=.3*w;return p;}
/** contact on the header clock: mid-snap, forehead through the ball */
const CU=.47,HD=1.0,TJ=TF-CU*HD;
/** the late move: he leaves his waiting spot behind Romero when the ball is already in the air */
const TM=TJ-.5;
const HEAD_PT:V3=(()=>{const sk=solve(gabHeader(CU),B_GAB,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.02,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the corner spot: Arsenal's RIGHT, the +z flag on the far side of the TV picture (inferred from "inswinging" + Saka's left foot) */
const P0:V3=[-.45,BALL_R,33.55];
/** the in-swinger: a steady sideways pull toward goal (+x) on top of gravity (left foot from the right) */
const SWING:V3=[2.6,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
/** Saka strikes along the ball's launch direction */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_X=yawTo(DC[0],DC[1]);
/** where his pelvis stands at contact so his LEFT boot meets the back of the ball (solved once, FK) */
const PCX:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),B_SAKA,{x:0,z:0,yaw:YAW_X});return[P0[0]-DC[0]*.12-sk.lToe[0],P0[2]-DC[1]*.12-sk.lToe[2]];})();
/** the run-up: from behind the ball and to its right (a left-footer's angle) */
const RIGHT_X:[number,number]=[-DC[1],DC[0]],RUN0:[number,number]=[PCX[0]-DC[0]*3.2+RIGHT_X[0]*1.5,PCX[1]-DC[1]*3.2+RIGHT_X[1]*1.5];
/** where the header crosses the goal line: down, to Vicario's right, into the middle of the net (inferred) */
const GOAL_PT:V3=[0,.62,-1.3],NET_HIT:V3=[1.8,.45,-1.45],REST:V3=[1.3,BALL_R,-1.2];
const G3:V3=[0,-GRAV,0];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='gab'|'saka'|'gk'|'mark'|'hold'|'ars'|'tot';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean;holds?:number};
const T0=-9,T1=12,DT=.02;
const mp=(u:number):[number,number]=>[PCX[0]+DC[0]*u,PCX[1]+DC[1]*u];
/** after the goal the Arsenal players chase Gabriel toward the West Stand corner (−z, x ≈ 0) */
const toGab=(x:number,z:number,k:number):number[][]=>[[TG+1+k*.2,x,z],[TG+3.6+k*.3,lerp(x,-3,.6),lerp(z,-13,.6)],[T1,lerp(x,-1.6,.8),lerp(z,-21,.85)]];
/** Gabriel's waiting spot, ≈ 2.4 m behind Romero */
const WAIT:[number,number]=[-7.7,-2.3];
const ACTORS:Actor[]=[
 // Gabriel: waits behind Romero, moves LATE (the ball already in the air), steps into Romero's back, rises, runs off celebrating
 {name:'Gabriel Magalhães',role:'gab',hero:true,style:GAB_ST,keys:[[T0,-8.1,-2.6],[-4,-7.9,-2.5],[-1.2,...WAIT],[TM,...WAIT],[TM+.3,-6.8,-1.75],[TJ-.08,HP[0]-.5,HP[1]-.2],[TJ+.2,HP[0],HP[1]],[TF+.5,HP[0],HP[1]],[TF+1.3,-4.6,-4.5],[TF+3.4,-3.4,-12],[TF+6,-1.8,-19.5],[T1,-.8,-25]]},
 {name:'Bukayo Saka',role:'saka',hero:true,style:SAKA_ST,keys:[[T0,.5,36.2],[-6,.2,35.3],[-4.8,...mp(-.7)],[-3.2,...RUN0],[-1,...RUN0],[-.5,...mp(-1.6)],[0,...mp(0)],[.7,...mp(.9)],[3,...mp(3.2)],[T1,-3,24]]},
 // Vicario: on his line near the near post, hemmed in — he can't get out to it
 {name:'Guglielmo Vicario',role:'gk',hero:true,style:VIC_ST,keys:[[T0,-.7,1.0],[-2,-.75,1.2],[0,-.8,1.35],[TF-.4,-1.0,1.5],[TF,-1.05,1.45],[T1,-.9,.8]]},
 // Romero: goal-side of Gabriel, facing the corner, watching the ball — a late small hop
 {name:'Cristian Romero',role:'mark',hero:true,style:ROM_ST,keys:[[T0,-5.6,-.5],[-2,-5.5,-.4],[0,-5.3,-.35],[TF-.3,-5.1,-.3],[TF,-5.05,-.3],[T1,-4.6,-.1]]},
 {name:'William Saliba',role:'ars',style:ars({number:2,skin:SKIN_D,build:{height:1.92},seed:2}),keys:[[T0,-5.9,3.5],[-2,-5.7,3.3],[0,-5.6,3.2],[TF,-5.2,2.9],...toGab(-5,2.7,0)]},
 {name:'Spurs holder (on Saliba)',role:'hold',holds:4,style:tot({skin:SKIN_M,seed:43}),keys:[[T0,-5,3.8],[-2,-4.9,3.6],[0,-4.8,3.5],[TF,-4.5,3.3],[T1,-4.4,3]]},
 {name:'Arsenal blocker (in front of Vicario)',role:'ars',style:ars({build:{height:1.9},seed:29}),keys:[[T0,-2.2,1.5],[-2,-2,1.4],[0,-1.8,1.4],[TF,-1.7,1.5],...toGab(-1.8,1.6,1)]},
 {name:'Spurs near post',role:'tot',style:tot({seed:44,skin:SKIN_D}),keys:[[T0,-.5,.1],[0,-.45,.2],[TF,-.6,.3],[T1,-.9,.4]]},
 {name:'Spurs zone',role:'tot',style:tot({seed:45,build:{height:1.9}}),keys:[[T0,-7.4,1.8],[-2,-7.3,1.7],[0,-7.2,1.6],[TF,-6.8,1.3],[T1,-6.6,1]]},
 {name:'Arsenal attacker',role:'ars',style:ars({skin:SKIN_L,hair:[Y,.55],seed:19}),keys:[[T0,-8.2,4.6],[-2,-8,4.5],[0,-7.8,4.3],[TF,-7.2,3.7],...toGab(-7,3.4,2)]},
 {name:'Spurs back post',role:'tot',style:tot({seed:46}),keys:[[T0,-2.6,-3.3],[0,-2.5,-3.2],[TF,-2.3,-2.8],[T1,-2.4,-2.5]]},
 {name:'Spurs edge',role:'tot',style:tot({seed:47,skin:SKIN_M}),keys:[[T0,-15.4,1.5],[-2,-15.6,1.2],[0,-15,1],[TF,-13.4,.6],[T1,-12.4,.2]]},
 {name:'Arsenal edge',role:'ars',style:ars({skin:SKIN_L,seed:12}),keys:[[T0,-18.2,-1.6],[-2,-18,-1.4],[0,-17.6,-1.2],[TF,-15.8,-.8],...toGab(-14,-.5,3)]},
 {name:'Spurs far zone',role:'tot',style:tot({seed:48,skin:SKIN_D}),keys:[[T0,-9.8,-4.4],[0,-9.6,-4.2],[TF,-9,-3.6],[T1,-8.4,-3]]},
];
const GAB=0,SAKA=1,GK=2,ROM=3;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball
/** at the flag → the corner → the header → the net */
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.12)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.12));
 const u=clamp((tau-TG-.12)/.55),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.67)*9))*Math.exp(-(tau-TG-.67)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?-tau*TAU*4:-TF*TAU*4+(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 // set-piece jostling: knees bent, arms out, a small shuffle
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:26,rShA:22,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
/** a marker holding his man: both arms out and grabbing, knees bent, leaning in (pulses on a slow tug) */
const HOLD=(tau:number,k:number)=>posed({lHipF:30,rHipF:22,lKnee:34,rKnee:30,lean:18,pitch:6,lShF:74+10*Math.sin(tau*3+k),rShF:52,lShA:26,rShA:34,lElb:18,rElb:42,lHand:1,rHand:1,neckP:-8,twist:-.12});
/** Vicario hemmed in: up on his toes, both gloves up between the bodies, a small hop that goes nowhere */
const PENNED=(h:number)=>posed({air:.16*h,lHipF:18+20*h,rHipF:12+10*h,lKnee:30+30*h,rKnee:24+10*h,lean:6,pitch:0,lShF:70+70*h,rShF:64+76*h,lShA:28,rShA:30,lElb:40-20*h,rElb:44-20*h,neckP:-24-14*h,lHand:1,rHand:1});
/** Gabriel's waiting stance behind Romero: low, a hand on Romero's back (the "bit of pressure"), eyes on the corner */
const LEAN_IN=posed({lHipF:28,rHipF:14,lKnee:34,rKnee:24,lean:18,pitch:6,neckP:-18,lShF:62,lShA:12,lElb:30,rShF:10,rShA:24,rElb:50,lHand:1,twist:.12});
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'gab':{
   // waiting behind Romero, eyes on the corner; the late step-in; he gathers, springs, powers it down; lands, runs off
   if(tau<TM+.15&&tau>-1.4)pose=blendPose(pose,LEAN_IN,.8*sm(-1.4,-.8,tau)*(1-sm(TM-.05,TM+.15,tau)));
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=gabHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   if(tau<TM)yaw=faceYaw(k,tau,tau<0?P0:ballAt(tau));
   const w=sm(TJ-.4,TJ-.1,tau)*(1-sm(TF+.55,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'saka':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'l'}),w);
   if(tau<-4.4&&tau>-6.2){// bends to set the ball in the quadrant
    pose=blendPose(pose,posed({lHipF:40,rHipF:70,lKnee:60,rKnee:90,lean:40,pitch:10,neckP:30,lShF:50,rShF:60,lElb:30,rElb:30}),win(tau,-6.2,-4.4,.5));yaw=faceYaw(k,tau,P0);}
   // the raised arm (a signal to the box) as he steps back
   if(tau>-3.2&&tau<-1.3)pose=blendPose(pose,posed({lHipF:4,rHipF:8,lKnee:10,rKnee:12,lShF:170,lShA:20,lElb:10,rShA:14,rElb:30,neckY:-10}),win(tau,-3.2,-1.3,.4)*.9);
   if(tau>-3.4&&tau<-1){yaw=lerpAng(faceYaw(k,tau,[HP[0],0,HP[1]]),YAW_X,sm(-2.1,-1.2,tau));}
   yaw=lerpAng(yaw,YAW_X,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.5){const j=celebrate((tau-TG)*1.1,{kind:'arms'});pose=blendPose(pose,j,sm(TG+.5,TG+1.1,tau)*.85);}
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=set;
   const h=sm(TF-.5,TF-.15,tau)*(1-sm(TF+.25,TF+.7,tau));if(tau>TF-.9)pose=blendPose(pose,PENNED(h),sm(TF-.9,TF-.5,tau));
   if(tau>TG+1)pose=blendPose(pose,DEJECT,sm(TG+1.2,TG+2,tau)*.7);
   yaw=faceYaw(k,Math.min(tau,TF+.05),ballAt(Math.min(tau,TF)));if(tau>TF+.1)yaw=lerpAng(yaw,yawTo(1,-.4),sm(TF+.1,TF+.6,tau));break;}
  case 'mark':{// ball-watching toward the corner; a late, small hop as the ball arrives over him; then hands on hips
   if(tau>TF-.35&&tau<TF+.8){const hp=header(clamp((tau-(TF-.3))/1.0));hp.air*=.28;hp.neckP-=.4;pose=blendPose(pose,hp,sm(TF-.35,TF-.2,tau)*(1-sm(TF+.4,TF+.8,tau)));}
   if(tau>TF+.7)pose=blendPose(pose,DEJECT,sm(TF+.7,TF+1.4,tau));yaw=faceYaw(k,Math.min(tau,TF),tau<0?P0:ballAt(Math.min(tau,TF-.15)));break;}
  case 'hold':{const m=a.holds??0,[mx,mz]=posOf(m,tau),g=1-sm(TF-.3,TF+.2,tau);pose=blendPose(pose,HOLD(tau,k),g*.95);
   if(g>.02)yaw=lerpAng(faceYaw(k,tau),yawTo(mx-x,mz-z),g);
   if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);break;}
  case 'tot':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'ars':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}
/** the lesson's ghost: arrives EARLY on the spot and stands still, then can only jump from a standstill — his head is under the ball */
const GHOST_P:[number,number]=[HP[0]+.3,HP[1]-1.5];
function ghostState(tau:number):State{
 const t0=-2.2,t1=-1.1,u=clamp((tau-t0)/(t1-t0)),x=lerp(WAIT[0]-.6,GHOST_P[0],easeInOutSine(u)),z=lerp(WAIT[1]-1.8,GHOST_P[1],easeInOutSine(u));
 const run=runCycle((tau-t0)*2.2,{speed:.45}),idle=posed({lHipF:6,rHipF:6,lKnee:8,rKnee:8,lean:4,neckP:-14,lShA:10,rShA:10});
 let p=blendPose(run,idle,sm(t1-.3,t1+.1,tau));
 const j=(tau-(TJ+.02))/HD;if(j>-.3){const hp=header(clamp(j));hp.air*=.42;p=blendPose(p,hp,sm(-.3,0,j)*(1-sm(1,1.4,j)));}
 return{pose:p,place:{x,z,yaw:tau<t1-.2?yawTo(GHOST_P[0]-x+1e-3,GHOST_P[1]-z):YAW_H}};}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hems trail), smear = halftone echo + speed lines on fast limbs (the corner, the leap). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05&&Math.abs(P[2])<34.5)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=2;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; in a chapter's last .7 s and inside a passage
 * every figure is capped (Gabriel 'mid', everyone else 'low', tiny extras skipped). */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null,cap=false):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending||cap;
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu;if(passing&&!f.hero&&px<34)continue;const style:AthleteStyle=passing?{...f.style,detail:f.style===GAB_ST?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal (+ the lesson's ghost) */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];cap?:boolean;ghost?:boolean}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===GAB&&tau>TJ-.3&&tau<TF+.3)||(k===SAKA&&tau>-.25&&tau<.35))};});
 if(o.ghost)figs.push({st:ghostState(tau),prev:ghostState(tauPrev),style:GHOST_ST,hero:true});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]},!!o.cap);
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times) + teaching marks
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
const HP3:V3=[HP[0],1.7,HP[1]];
/** a flat ring on the grass (navy band, paper core, ink) */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const w=Math.max(5,kAt(c,P)*.07),band=ribbon(pts,w*1.5,{close:true,seed:5,taper:0,wobble:.6}),core=ribbon(pts,w,{close:true,seed:5,taper:0,wobble:.6});s.fill(K,band,.7*a);s.knockout(core,a);s.fill(ink,core,.95*a);
}
/** a team ring on the grass round each player of a side ("in white": paper rings keyed in navy; "in black": red rings) */
function teamRings(s:Sheet,c:Cam,tau:number,side:'ars'|'tot',g:number){
 if(g<=.02)return;const p=new Path2D();
 ACTORS.forEach((a,k)=>{const isA=a.role==='gab'||a.role==='saka'||a.role==='ars';if(side==='ars'?!isA:isA)return;
  const[x,z]=posOf(k,tau),pts:Pt[]=[];for(let i=0;i<20;i++){const u=i/20*TAU,q=pr(c,[x+Math.cos(u)*.9*g,.02,z+Math.sin(u)*.9*g]);if(q)pts.push(q);}if(pts.length>12)p.addPath(ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.13),{close:true,taper:0,wobble:.6}));});
 if(side==='ars'){s.knockout(p,.9);s.fill(R,p,.95);}else{s.fill(K,p,.9);s.knockout(p,.9);s.stroke(K,p,2.5,.9);}
}
/** a ring round a point on screen */
function screenRing(s:Sheet,q:Pt,rr:number,g:number,ink=Y,seed=8){if(g<=.02||rr<1)return;const pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr*1.08]);}
 const p=ribbon(pts,Math.max(5,rr*.1),{seed,close:true,taper:0,wobble:.8});s.knockout(p,.9*g);s.fill(ink,p,.95*g);}
/** a red cross on screen (the wrong way) */
function cross(s:Sheet,q:Pt,rr:number,e:number){if(e<=.02)return;const x=new Path2D();x.addPath(ribbon([[q[0]-rr,q[1]-rr],[q[0]+rr,q[1]+rr]],Math.max(5,rr*.28),{taper:0,wobble:.4}));x.addPath(ribbon([[q[0]+rr,q[1]-rr],[q[0]-rr,q[1]+rr]],Math.max(5,rr*.28),{taper:0,wobble:.4}));s.knockout(x,e);s.fill(R,x,.95*e);}
/** 7-segment block digits (glyph box 1 × 2) for the score bug */
const SEGS:Record<string,number[][]>={a:[[0,0],[1,0]],b:[[1,0],[1,1]],c:[[1,1],[1,2]],d:[[0,2],[1,2]],e:[[0,1],[0,2]],f:[[0,0],[0,1]],g:[[0,1],[1,1]]};
const DIGITS:Record<string,string>={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abfgcd','-':'g'};
function glyphs(str:string,x0:number,y0:number,gw:number,path:Path2D){const th=gw*.3;[...str].forEach((ch,ci)=>{const ox=x0+ci*gw*1.6;for(const sg of DIGITS[ch]??''){const[[a0,b0],[a1,b1]]=SEGS[sg],x=ox+Math.min(a0,a1)*gw-th/2,y=y0+Math.min(b0,b1)*gw-th/2,w=a0===a1?th:gw+th,h=b0===b1?th:gw+th;path.rect(x,y,w,h);}});}
/** the TV score bug (top left): Tottenham's white block, 0-0 (0-1 after the goal), Arsenal's red block, the minute (64) */
function scoreBug(s:Sheet,g:number,goal:boolean,minute:number){
 if(g<=.02)return;const x=-s.W/2+60-(1-g)*120,y=-s.H/2+54,w=380,h=112,panel=polyPath([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],true);
 s.knockout(panel,.95*g);s.fill(K,panel,.92*g);
 const blk=(fx:number,ink:string|null)=>{const p=polyPath([[fx,y+16],[fx+54,y+16],[fx+54,y+58],[fx,y+58]],true);s.knockout(p,g);if(ink)s.fill(ink,p,.95*g);};
 blk(x+16,null);blk(x+w-70,R);
 const sc=new Path2D(),mn=new Path2D();glyphs(goal?'0-1':'0-0',x+118,y+14,28,sc);s.knockout(sc,g);if(minute>.02){glyphs('64',x+150,y+82-8*(1-minute),11,mn);s.knockout(mn,g*minute);s.fill(Y,mn,.95*g*minute);}
}
/** the TV replay badge (top left): a rewind mark (two yellow triangles on navy); "slowly" → the second triangle gives way to three slow dots */
function replayBadge(s:Sheet,g:number,slow:number){
 if(g<=.02)return;const x=-s.W/2+60-(1-g)*120,y=-s.H/2+54,w=190,h=96,panel=polyPath([[x,y],[x+w,y],[x+w-18,y+h],[x-18,y+h]],true);
 s.knockout(panel,.95*g);s.fill(K,panel,.92*g);
 const tri=(cx:number,cov:number)=>{const p=polyPath([[cx+22,y+22],[cx+22,y+h-22],[cx-14,y+h/2]],true);s.knockout(p,cov);s.fill(Y,p,.95*cov);};
 tri(x+50,g);tri(x+100,g*(1-slow));
 if(slow>.02){const d=new Path2D();for(let i=0;i<3;i++){const cx=x+96+i*26,cy=y+h/2,r=7*easeOutBack(clamp(slow*1.4-i*.2));if(r>.5)d.addPath(polyPath(blob(cx,cy,r,r,i+3,{n:10}),true));}s.knockout(d,g);s.fill(Y,d,.95*g);}
}
/** the replay trail: the corner's path so far, a fading yellow ribbon */
function trail(s:Sheet,c:Cam,tau:number,fade:number,span=.9){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-span),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p,cov);s.fill(ink,p,cov*.95);s.stroke(K,p,Math.max(2,w*.12),.85*cov);
}
/** Gabriel's late run on the grass: from his waiting spot to his take-off, grown by u */
function runArrow(s:Sheet,c:Cam,u:number,cov:number){if(u<=.02||cov<=.02)return;const pts:V3[]=[];for(let i=0;i<=10;i++){const[x,z]=posOf(GAB,lerp(TM,TJ,i/10*clamp(u)));pts.push([x,.03,z]);}arrow3(s,c,pts,Math.max(7,kAt(c,[HP[0],0,HP[1]])*.07),Y,cov);}
/** a dashed yellow level line across the pack at Gabriel's head height (above Romero's) */
function levelLine(s:Sheet,c:Cam,tau:number,g:number,z0=-1.8,z1=2.2){
 if(g<=.02)return;const st=stateOf(GAB,tau),sk=solve(st.pose,B_GAB,st.place),hy=sk.head[1]+.14,l=pr(c,[HP[0]+.2,hy,HP[1]+z0*g]),rr=pr(c,[HP[0]+.2,hy,HP[1]+z1*g]);
 if(l&&rr){const gaps:[number,number][]=[];for(let i=0;i<9;i++)gaps.push([(i+.66)/9,(i+.96)/9]);const p=ribbon([l,rr],Math.max(6,kAt(c,sk.head)*.05),{taper:0,wobble:.5,gaps});s.knockout(p,.9*g);s.fill(Y,p,.95*g);}
}
const headOf=(k:number,tau:number)=>{const st=stateOf(k,tau),sk=solve(st.pose,k===GAB?B_GAB:k===ROM?B_ROM:k===GK?B_VIC:B_SAKA,st.place);return sk;};
function spark(s:Sheet,tau:number,ball:{g:Pt;r:number}|null,span=.22){const hit=(tau-TF)/span;if(hit>0&&hit<1&&ball)sparkBurst(s,Y,ball.g[0],ball.g[1],Math.max(55,ball.r*5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,ball.r*.5)});}

// ---------------------------------------------------------------- 1 · live: the high West Stand camera, real time, the corner from the far flag
/** τ from chapter time: real time (×≈1), anchored so the corner is struck on "curls in" and his forehead meets it on "Gabriel attacks" */
function tau1(t:number){const tX=Math.min(CUE(0,'curls in')+.3,CUE(0,'Gabriel attacks')-1),tH=CUE(0,'Gabriel attacks')+.45,k=clamp(TF/Math.max(.5,tH-tX),.8,1.15);return Math.max(T0+.5,(t-tX)*k);}
const P1:V3=[-19,25,-70];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-11,0,4],fov:22})],
  [CUE(0,'Tottenham in white')-.2,1,()=>({P:P1,T:[-8,1,1],fov:15})],
  [CUE(0,'Still no goals')-.1,1.2,()=>({P:P1,T:mix3(at(GAB,tau,1),[-6,1,0],.5),fov:11})],
  [CUE(0,'Bukayo Saka')-.5,.8,()=>({P:P1,T:mix3(at(SAKA,tau,.9),P0,.35),fov:3.6})],
  [CUE(0,'curls in')+.3,1.1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.4+.3*b[1],0]),HP3,.25+.5*sm(0,TF,tau)),fov:lerp(10,14,sm(-.1,.8,tau))})],
  [CUE(0,'Gabriel attacks')-.45,.8,()=>({P:P1,T:[HP[0]+1.4,1.9,HP[1]+.6],fov:7.5})],
  [CUE(0,'Goal')-.2,1.5,()=>{const w=at(GAB,tau,1.2);return{P:P1,T:mix3(w,[-2,1.4,6],.35),fov:13};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tG=CUE(0,'Goal'),tW=CUE(0,'Tottenham in white'),tB=CUE(0,'Arsenal in black'),tS=CUE(0,'Still no goals'),tM=CUE(0,'minutes'),tN=CUE(0,'North London');
  stadium(s,c,t,[0,1,3],{roar:sm(tG-.2,tG+.4,t),flash:sm(tG-.2,tG+.3,t)*(1-sm(tG+2,tG+2.8,t))});
  ground(s,c);
  // "North London derby": a yellow ring on the box where it happens; "in white" / "in black": team rings
  groundRing(s,c,[-8,0,0],5*easeOutBack(sm(tN,tN+.5,t)),Y,sm(tN,tN+.4,t)*(1-sm(tW-.3,tW,t)));
  teamRings(s,c,tau,'tot',sm(tW,tW+.3,tt,easeOutBack)*(1-sm(tB,tB+.4,tt)));
  teamRings(s,c,tau,'ars',sm(tB,tB+.3,tt,easeOutBack)*(1-sm(tS,tS+.4,tt)));
  play(s,c,tau,tp,{min:18,lines:true,prevBall:tau1(t-.06),cap:t>SECS(0)-.7});
  // "Still no goals after sixty-four minutes": the TV score bug slides in (and turns to 0-1 on the goal)
  scoreBug(s,sm(tS-.1,tS+.3,t,easeOut)*(1-sm(SECS(0)-.9,SECS(0)-.5,t)),tau>TG+.1,sm(tM-.05,tM+.3,t,easeOutBack));
  // "Bukayo Saka": a red ring round the corner-taker at the far flag
  const tK=CUE(0,'Bukayo Saka'),kg=sm(tK-.1,tK+.3,t)*(1-sm(CUE(0,'curls in')+.2,CUE(0,'curls in')+.6,t));if(kg>0){const q=pr(c,at(SAKA,tau,1));if(q)screenRing(s,q,kAt(c,at(SAKA,tau,1))*1.3*easeOutBack(clamp(kg)),kg,R,14);}
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Gabriel attacks')+.6;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay, low on the goal line beside the near post
const tau2=(t:number)=>key(t,mono([[0,-1.2],[CUE(1,'Gabriel waits'),-.7],[CUE(1,'Cristian Romero'),-.2],[CUE(1,'Vicario'),.2],[CUE(1,'boxed in'),TM-.25],[CUE(1,'moves late'),TM+.05],[CUE(1,'powers it home'),TF-.08],[SECS(1)-.2,TG+.35]]),linear);
const E2:V3=[.6,1.15,7.6];
function cam2(t:number):Cam{
 const tau=tau2(t),g=at(GAB,tau,1.4),r=at(ROM,tau,1.4);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-5.5,1.5,-.4],fov:30})],
  [CUE(1,'Gabriel waits')-.3,1,()=>({P:E2,T:mix3(g,r,.35),fov:20})],
  [CUE(1,'Vicario')-.2,1,()=>({P:add3(E2,[0,.1,-.4]),T:mix3(at(GK,tau,1.3),r,.35),fov:26})],
  [CUE(1,'moves late')-.3,1,()=>({P:add3(E2,[0,.15,-.6]),T:mix3(g,[HP[0]+.4,2.2,HP[1]+.2],.4),fov:19})],
  [CUE(1,'powers it home')-.2,.8,()=>({P:add3(E2,[0,.2,-.7]),T:[HP[0]+.9,2.25,HP[1]+.2],fov:27})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tGw=CUE(1,'Gabriel waits'),tR=CUE(1,'Cristian Romero'),tV=CUE(1,'Vicario'),tBx=CUE(1,'boxed in'),tL=CUE(1,'moves late'),tP=CUE(1,'powers it home');
  stadium(s,c,t,[2,3],{roar:.15,flash:sm(TG,TG+.2,tau)*.6});
  ground(s,c);
  trail(s,c,tau,1-sm(TF+.1,TF+.4,tau));
  // "moves late": his late run drawn on the grass as he makes it
  runArrow(s,c,sm(tL-.1,tP,t),sm(tL-.1,tL+.3,t)*(1-sm(SECS(1)-.9,SECS(1)-.5,t)));
  const r=play(s,c,tau,tp,{smear:true,min:10,cap:t>SECS(1)-.7});
  // "Gabriel waits": a yellow ring round him; "Cristian Romero": a navy ring round Romero, whose back he leans on
  {const sk=headOf(GAB,tau),q=pr(c,sk.chest),e=sm(tGw-.1,tGw+.3,t)*(1-sm(tL-.2,tL+.2,t));if(q)screenRing(s,q,kAt(c,sk.chest)*.8*easeOutBack(clamp(e)),e,Y,11);}
  {const sk=headOf(ROM,tau),q=pr(c,sk.chest),e=sm(tR-.1,tR+.3,t)*(1-sm(tBx,tBx+.4,t));if(q)screenRing(s,q,kAt(c,sk.chest)*.75*easeOutBack(clamp(e)),e,K,12);}
  // "Vicario": a ring round the keeper; "boxed in": a red box of bodies round him
  {const sk=headOf(GK,tau),q=pr(c,sk.chest),e=sm(tV-.1,tV+.3,t)*(1-sm(tBx-.1,tBx+.2,t));if(q)screenRing(s,q,kAt(c,sk.chest)*.7*easeOutBack(clamp(e)),e,Y,13);
   const bx=sm(tBx-.1,tBx+.3,t)*(1-sm(tL+.3,tL+.8,t));if(bx>0){const m=pr(c,[-1.4,1.1,1.5]);if(m)screenRing(s,m,kAt(c,[-1.4,1.1,1.5])*1.5*easeOutBack(clamp(bx)),bx,R,15);}}
  // "moves late": speed lines trail him; "powers it home": the spark on his forehead
  const rs=sm(tL,tL+.3,t)*(1-sm(tP-.1,tP+.2,t));if(rs>0){const a=pr(c,at(GAB,tau-.14,1.1)),b=pr(c,at(GAB,tau,1.1));if(a&&b&&Math.hypot(b[0]-a[0],b[1]-a[1])>1)speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:13,len:150,spread:kAt(c,at(GAB,tau))*.5,width:6,cov:.85*rs});}
  spark(s,tau,r.ball,.25);
  // "Watch again, slowly": the replay badge
  const tWa=CUE(1,'Watch again'),tSl=CUE(1,'slowly');replayBadge(s,sm(tWa-.1,tWa+.3,t,easeOut)*(1-sm(tGw+.6,tGw+1,t)),sm(tSl-.05,tSl+.4,t));
 },
 aperture(t){const c=cam2(t),sk=headOf(GAB,tau2(twos(t))),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(1,'powers it home')+.2;},
};

// ---------------------------------------------------------------- 3 · a second replay from behind Saka at the corner flag, the ball curling away into the box
const tau3=(t:number)=>key(t,mono([[0,-1.1],[CUE(2,'From behind'),-.55],[CUE(2,'curls toward'),.3],[CUE(2,'Romero loses'),TM-.1],[CUE(2,'track of'),TM+.25],[CUE(2,'rises highest'),TF-.06],[CUE(2,'head it in'),TF+.12],[SECS(2),TG+1.6]]),linear);
const E3:V3=[-2.4,2.9,41.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.max(0,tau));
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(at(SAKA,tau,1),[HP[0],1,HP[1]],.15),fov:34})],
  [CUE(2,'curls toward')-.2,1,()=>({P:add3(E3,[0,.3,-1]),T:mix3(b,HP3,.55),fov:20})],
  [CUE(2,'Romero loses')-.3,.9,()=>({P:add3(E3,[0,.3,-1.4]),T:[HP[0]+.1,1.9,HP[1]+.3],fov:10})],
  [CUE(2,'head it in')+.1,1.4,()=>({P:add3(E3,[0,.4,-1.6]),T:[-2.6,1.4,-.8],fov:14})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tFb=CUE(2,'From behind'),tC=CUE(2,'curls toward'),tRl=CUE(2,'Romero loses'),tT=CUE(2,'track of'),tH=CUE(2,'rises highest'),tI=CUE(2,'head it in');
  stadium(s,c,t,[1,2,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.2,TG+1.8,tau))});
  ground(s,c);
  // "curls toward goal": the inswinger's path, a yellow ribbon bending in toward the goal
  trail(s,c,tau,sm(tC-.1,tC+.3,t)*(1-sm(TF+.2,TF+.6,tau)),1.4);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06),cap:t>SECS(2)-.7});
  // "Romero loses track": a red ring on Romero's head and his eye line fixed on the ball; "of Gabriel": a yellow ring on Gabriel
  const rl=sm(tRl-.1,tRl+.3,t)*(1-sm(tH,tH+.4,t));if(rl>0){const sk=headOf(ROM,tau),q=pr(c,sk.head),bq=r.ball?.g;if(q){screenRing(s,q,kAt(c,sk.head)*.3*easeOutBack(clamp(rl)),rl,R,31);
   if(bq){const gaps:[number,number][]=[];for(let i=0;i<7;i++)gaps.push([(i+.6)/7,(i+.95)/7]);const e=ribbon([q,bq],Math.max(4,kAt(c,sk.head)*.035),{taper:0,wobble:.4,gaps});s.knockout(e,.8*rl);s.fill(R,e,.9*rl);}}}
  const tr=sm(tT-.1,tT+.3,t)*(1-sm(tI,tI+.4,t));if(tr>0){const sk=headOf(GAB,tau),q=pr(c,sk.chest);if(q)screenRing(s,q,kAt(c,sk.chest)*.8*easeOutBack(clamp(tr)),tr,Y,33);}
  // "rises highest": the level line above Romero's head
  levelLine(s,c,tau,sm(tH-.1,tH+.3,t,easeOut)*(1-sm(tI+.2,tI+.6,t)));
  // "head it in": the spark, the header's path over the goal
  spark(s,tau,r.ball);
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.8,TG+1.3,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12),rb=ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0});s.stroke(K,rb,3,.8*hf);s.knockout(rb,hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  // "From behind Saka": the replay badge (a second angle), gone before the delivery
  replayBadge(s,sm(tFb-.1,tFb+.3,t,easeOut)*(1-sm(tC+.2,tC+.6,t)),1);
 },
 aperture(t){const c=cam3v(t),sk=headOf(GAB,tau3(twos(t))),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'rises highest')+.1;},
};

// ---------------------------------------------------------------- 4 · the lesson: from the side of the box, very slow, with teaching marks
const tau4=(t:number)=>key(t,mono([[0,-2.3],[CUE(3,'Never stand'),-1.6],[CUE(3,'on the spot'),-.8],[CUE(3,'Start your run'),TM-.25],[CUE(3,'late'),TM+.05],[CUE(3,'attack the ball'),TJ+.1],[CUE(3,'wait for it'),TF],[SECS(3),TF+.3]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),g=at(GAB,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:[-9.5,2.6,-14.5],T:mix3(g,[GHOST_P[0],1.1,GHOST_P[1]],.6),fov:19})],
  [CUE(3,'Start your run')-.3,1,()=>({P:[-9.2,2.5,-14],T:mix3(g,[HP[0],1.3,HP[1]],.5),fov:17})],
  [CUE(3,'attack the ball')-.3,.9,()=>({P:[-8.8,2.6,-13.4],T:[HP[0]+.4,2.1,HP[1]-.4],fov:14})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tN=CUE(3,'Never stand'),tO=CUE(3,'on the spot'),tS=CUE(3,'Start your run'),tL=CUE(3,'late'),tA=CUE(3,'attack the ball'),tW=CUE(3,'wait for it'),E=SECS(3);
  stadium(s,c,t,[0,1,3],{roar:.1+.6*sm(tW+.3,tW+.9,t)});
  ground(s,c);
  // "Never stand still on the spot": a red ring pinned under the ghost, who has arrived early and waits
  const gh=sm(0,.4,t)*(1-sm(tA+1,tA+1.6,t));
  {const e=sm(tN-.1,tN+.3,t)*(1-sm(tS,tS+.4,t)),st=ghostState(tau);groundRing(s,c,[st.place.x??0,0,st.place.z??0],.75+.12*Math.sin(t*6)*sm(tO,tO+.3,t),R,e*gh);}
  // "Start your run late": Gabriel's late run arrow grows under him as he goes
  runArrow(s,c,sm(tS,tA,t),sm(tS-.1,tS+.3,t)*(1-sm(E-.6,E-.2,t)));
  // the corner's arc dotted in, arriving where he will meet it
  const ab=sm(tS-.2,tS+.3,t)*(1-sm(E-.6,E-.2,t));
  if(ab>0){const pts:Pt[]=[];for(let i=0;i<=24;i++){const p=pr(c,flyA(P0,V_CROSS,SWING,lerp(TF*.6,TF,i/24)));if(p)pts.push(p);}
   if(pts.length>2){const gaps:[number,number][]=[];for(let i=0;i<10;i++)gaps.push([(i+.62)/10,(i+.98)/10]);const d=ribbon(partial(pts,sm(tS,tS+1.1,t)),Math.max(7,kAt(c,HEAD_PT)*.06),{seed:21,taper:.2,wobble:.6,gaps});s.knockout(d,.8*ab);s.fill(Y,d,.95*ab);}}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[GAB,ROM],ghost:gh>.05});
  // "late": a yellow spark under his first step
  const lp=sm(tL-.1,tL+.3,t)*(1-sm(tA,tA+.4,t));if(lp>0){const q=pr(c,[WAIT[0],.05,WAIT[1]]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,[WAIT[0],0,WAIT[1]])*.6)*lp,{n:9,seed:41,g:easeOutBack(lp),width:12});}
  // "attack the ball": a ring on the ball as he goes up to meet it
  const ar=sm(tA-.1,tA+.3,t)*(1-sm(E-.5,E-.2,t));if(ar>0&&r.ball&&tau<TF+.05)screenRing(s,r.ball.g,r.ball.r*1.9,ar,Y,8);
  // "wait for it": a red cross on the ghost's head, still under the ball; Gabriel's forehead glows and the header's arrow drives on
  if(gh>.05){const st=ghostState(tau),sk=solve(st.pose,B_GAB,st.place),q=pr(c,sk.head);if(q)cross(s,q,kAt(c,sk.head)*.16,sm(tW-.1,tW+.3,t)*gh);}
  const hd=sm(tW-.05,tW+.3,t);
  if(hd>0){const sk=headOf(GAB,tau),h=sk.head,fc=sk.face,fp=add3(h,mul3(sub3(fc,h),1.05)),q=pr(c,add3(fp,[0,.05,0]));
   if(q){const rr=kAt(c,fp)*.07*clamp(hd,0,1.2),glow=polyPath(blob(q[0],q[1],rr,rr*.8,11,{amp:.06,n:16}),true);s.knockout(glow,.8);s.fill(Y,glow,.9);}
   const arr=sm(tW+.2,E-.3,t,easeInOutSine);if(arr>0){const pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(flyA(HEAD_PT,V_HEAD,G3,(TG-TF)*arr*i/8));arrow3(s,c,pts,Math.max(9,kAt(c,HEAD_PT)*.05),Y,.95);}}
 },
 get still(){return CUE(3,'wait for it')+.3;},
};

const film:RisoStory={
 id:'gabriel-magalhaes-signature',format:'11v11',title:"Gabriel's derby header",
 theme:'Attack the corner: start your run late and meet the ball, don’t wait for it',
 ageNote:'Tottenham 0–1 Arsenal, Premier League, Tottenham Hotspur Stadium, 15 September 2024. Gabriel headed Bukayo Saka\'s corner in the 64th minute. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little header — a ball curls in, a yellow spark where it is met, and it is powered away downward. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.35),out=clamp((age-.35)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.35?x+170*(1-u):x-200*easeOut(out),by=age<.35?y-130*(1-u)*(1-u)-10:y+120*out;
  if(age>.3&&age<.65)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.3)/.12))*(1-clamp((age-.5)/.15)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Tottenham's goal line x = 0, +z = Arsenal's right) — checked by tests/play-film-gabriel-magalhaes-signature.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,TJ,TM,WAIT,ballAt,cornerFoot:'l' as const,
 sakaContact:()=>{const st=stateOf(SAKA,0),sk=solve(st.pose,B_SAKA,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 gabAt:(tau:number)=>{const st=stateOf(GAB,tau),sk=solve(st.pose,B_GAB,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 gabPos:(tau:number)=>posOf(GAB,tau),
 vicarioAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_VIC,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};},
 romeroAt:(tau:number)=>{const st=stateOf(ROM,tau),sk=solve(st.pose,B_ROM,st.place);return{head:sk.head,pelvis:sk.pelvis};},
 ghostAt:(tau:number)=>{const st=ghostState(tau),sk=solve(st.pose,B_GAB,st.place);return{head:sk.head,air:st.pose.air,x:st.place.x,z:st.place.z};}};
