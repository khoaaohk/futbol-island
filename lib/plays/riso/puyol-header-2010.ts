/** Carles Puyol's header — Germany 0–1 Spain, 2010 FIFA World Cup semi-final, Moses Mabhida Stadium, Durban, 7 July 2010, 73rd minute.
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * A 1:1 reconstruction of the goal from WRITTEN accounts and two spectator photos of the match (the broadcast footage itself was not
 * reviewed), rendered as a riso print.
 * Narration text: public/plays/narration/puyol-header-2010/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (see estimate()); EVERY action time is read from cue onsets and chapter seconds, so once timing.json exists
 * `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/puyol-header-2010/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/puyol-header-2010/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - Wikipedia, "2010 FIFA World Cup knockout stage" (raw wikitext, "Germany vs Spain"): 7 July 2010, Moses Mabhida Stadium, Durban, kick-off
 *    20:30, attendance 60,960, referee Viktor Kassai; 0–0 "until the 73rd minute, when Spain was awarded a corner. The corner, taken by Xavi,
 *    was met by Carles Puyol, who headed the ball into the net"; the kit table (Germany white shirts, black shorts, white socks; Spain red
 *    shirts, blue shorts, red socks) citing FIFA's tactical line-up; the line-ups and numbers (Puyol 5, Xavi 8, Neuer 1, Piqué 3).
 *  - BBC Sport, Paul Fletcher, "Germany 0–1 Spain" live text + report, 7 July 2010 (news.bbc.co.uk … match_62): "73 mins GOAL … Xavi flings
 *    over a corner from the left and Barcelona captain Carles Puyol climbs highest to absolutely thump a header from 10 yards past Manuel
 *    Neuer"; "not a short pass in sight"; Puyol had headed over from an Iniesta cross in the 14th minute.
 *  - ESPN Soccernet, "Puyol heads Spain into final", 7 July 2010 (web.archive.org copy): "Xavi curled a corner deep into the German box,
 *    32-year-old Puyol … rose highest and then powered an unstoppable header beyond Manuel Neuer"; "Puyol's skill was to evade the arm grabs
 *    that are now commonplace at all corners by beginning his run from deep. It had the added advantage of giving him the power to ensure
 *    once he had got his head to Xavi's corner, Neuer had no chance of keeping the ball out."
 *  - Wikipedia, "Carles Puyol": height 1.78 m; "a powerful header from a corner taken by Barcelona teammate Xavi, which sent the national
 *    team through to their first World Cup final".
 *  - Wikipedia, "Moses Mabhida Stadium": the 350 m arch rising 106 m above the pitch that holds up the roof; the translucent Teflon-coated
 *    membrane roof "attached to the arch by … steel cables"; the bowl.
 *  - Wikimedia Commons, "FIFA World Cup 2010 Germany Spain.jpg" and "FIFA World Cup 2010 Germany vs Spain semi-final.jpg" (spectator photos
 *    of this match): Spain in red shirts, blue shorts, red socks; Germany in white shirts, black shorts, white socks; the referee in black;
 *    Puyol's long dark curly hair; the pale seats, the white roof underside ringed with floodlights, the orange World Cup band on the tier
 *    fronts, the blue band along the lower tier; a night match.
 * CONFIRMED by those sources: the date, venue, semi-final, 0–0 until the 73rd minute; the corner came from the LEFT (BBC), taken by Xavi and
 *  curled deep into the box (ESPN); Puyol began his run FROM DEEP, which kept him away from the arm grabs and gave his header its power
 *  (ESPN); he rose/climbed highest (BBC, ESPN) and thumped the header from about 10 yards past Neuer, who had no chance (BBC, ESPN); Spain's
 *  first World Cup final; the kits and numbers above; Puyol 1.78 m.
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds (Puyol waiting ≈ 25 m out, sprinting ≈ 15 m, taking off ≈ 9 m
 *  out slightly toward the near post; the corner ≈ 34 m of flight in ≈ 1.7 s); "from the left" read as Spain's attacking left; Xavi taking it
 *  with his RIGHT foot as an in-swinger (his stronger foot; not stated in the sources, and not narrated); the header's line into the goal
 *  (drawn about head height, a little to Neuer's left of centre); Neuer's small late reaction and his kit colour (drawn yellow, navy
 *  shorts); which touchline the main camera sat on (drawn: the side opposite the corner, Spain attacking left → right on screen); the other
 *  players' spots and who marked whom (drawn unnamed: Germany's markers holding Spanish players, a tall German marker beaten to the ball);
 *  the celebration run; Spain's yellow numbers; the stadium as drawn (a closed bowl, the arch along the pitch's long axis splitting into two
 *  legs at one end, cables from the roof lip to the arch, the crowd's colours); the TV camera positions and lenses. The narration names none
 *  of the inferred details ("taller defenders" is the lesson's general point: Germany's back line was taller than 1.78 m Puyol).
 *
 * STRUCTURE (the TV broadcast, never top-down): the play is ONE simulation on a real clock τ (seconds, τ = 0 Xavi's corner): ch1 = the live
 * broadcast — the establishing shot up at the arch over the roof, then the high main-stand camera in real time (Spain in red, Germany in
 * white, the 0–0 / 73' score bug, Xavi at the flag, the corner, the header, the net); ch2 = the TV slow-motion replay, low from beside the
 * far post looking back at Puyol's long run from deep past the grabbing arms in the box; ch3 = a second replay, high behind the goal: he
 * leaps above everyone, meets the ball at its highest point and it comes at the camera past Neuer; ch4 = the lesson: a close, very slow
 * replay with teaching marks (a height ruler: taller defenders; his run's footprints lit in order from deep; the ball's arc and a ring at
 * its highest point; the header's arrow into the net). Composed on the FULL sheet (world units = sheet units centred on the canvas; never
 * sheet.safe), so it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for his curly hair and hems, motionSmear on the corner, the leap, the dive). Handedness: the world is right-handed (x
 * toward Germany's goal, y up, +z = Spain's right), exactly athlete.ts's convention, so Xavi's strike({foot:'r'}) is his RIGHT foot and the
 * corner from Spain's left is the −z corner. Inks: yellow, red, blue, navy (Germany's white = paper). Everything is keyed to cue times
 * (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. Heat: small figures print at 'low',
 * at most FULL_CAP non-hero figures at full detail, every figure inside a passage capped; ≈ 150–330 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Durban, 2010',text:'Durban, 2010, the World Cup semi-final. Spain, in red, play Germany, in white. Nil-nil, seventy-three minutes. Xavi whips in a corner... and Carles Puyol thunders a header into the net!',tail:2.2,
  cues:['Durban','semi-final','Spain, in red','Germany, in white','Nil-nil','seventy-three','Xavi','whips in','Carles Puyol','thunders','into the net']},
 {label:'The long run',text:'Watch again, slowly. Puyol starts far from goal, away from the grabbing arms. Then he charges in at full speed.',tail:1.4,
  cues:['Watch again','slowly','starts far','grabbing arms','charges in','full speed']},
 {label:'Highest point',text:'He leaps above everyone and meets the ball at its highest point. Neuer has no chance!',tail:2.4,
  cues:['He leaps','above everyone','meets the ball','highest point','Neuer','no chance']},
 {label:'Attack the ball',text:'To beat taller defenders, make a long, brave run. Attack the ball at its highest point, and head it hard!',tail:2,
  cues:['taller defenders','long, brave run','Attack the ball','highest point','head it hard']},
];
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py puyol-header-2010 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header): withTiming swaps in the clips, the chapter
 * lengths and the word onsets, and every action below re-times itself. */
import timingJson from '../../../public/plays/narration/puyol-header-2010/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('puyol: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('puyol: no cue '+w);return c.at;};
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
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** the visible window in world units (centre cx,cy + half extents), with margin for the .68 passage preview. Inside an outgoing passage
 * the zoomed window is read back from the sheet transform, so figures and crowd the zoom has already pushed off the canvas are skipped
 * (heat: a passage prints two scenes). */
function view(s:Sheet):{cx:number;cy:number;hx:number;hy:number}{
 const base={cx:0,cy:0,hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120};if(!s._passage.pending)return base;
 const inv=s.getTransform().inverse(),W=s.width*s.dpr,H=s.height*s.dpr,cs=[[0,0],[W,0],[0,H],[W,H]].map(([x,y])=>inv.transformPoint(new DOMPoint(x,y)));
 const x0=Math.min(...cs.map(p=>p.x)),x1=Math.max(...cs.map(p=>p.x)),y0=Math.min(...cs.map(p=>p.y)),y1=Math.max(...cs.map(p=>p.y));
 if(!Number.isFinite(x0+x1+y0+y1))return base;const mg=(x1-x0)*.06+8;return{cx:(x0+x1)/2,cy:(y0+y1)/2,hx:(x1-x0)/2+mg,hy:(y1-y0)/2+mg};}

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Germany's goal line is x = 0 (Spain attack +x), goal centre z = 0, +z = Spain's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- Moses Mabhida Stadium at night: a closed bowl, a white membrane roof, the arch
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z), 1 behind Germany's goal (+x), 2 the main stand (+z, the camera side),
 * 3 the other end. Closed corners: the side stands run past the goal lines. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-128,24,a),1.4+27*b,-42-34*b],
 (a,b)=>[9+32*b,1.4+25*b,lerp(66,-66,a)],
 (a,b)=>[lerp(24,-128,a),1.4+27*b,42+34*b],
 (a,b)=>[-114-32*b,1.4+25*b,lerp(-66,66,a)],
];
/** corner joins: [stand, its end a, next stand, its end a] */
const CORNERS:[number,number,number,number][]=[[0,1,1,1],[1,0,2,0],[2,1,3,1],[3,0,0,0]];
const STAND_COLS=[104,72,104,72],STAND_ROWS=14,TIER=[.46];
/** the roof: from the top of each stand in to its lip (the membrane's inner edge), over the seats */
const lipOf=(S:(a:number,b:number)=>V3,a:number):V3=>add3(S(a,.2),[0,40,0]);
const topOf=(S:(a:number,b:number)=>V3,a:number):V3=>add3(S(a,1),[0,2,0]);
/** the arch along the pitch's long axis (z = 0): 350 m end to end, 106 m high over the centre spot; at the +x end it splits into two legs */
const ARCH_C=-52.5,ARCH_HALF=175,ARCH_H=106;
const archY=(u:number)=>ARCH_H*(1-u*u);
const archPt=(u:number,leg=0):V3=>{const split=u>.5?22*Math.pow((u-.5)/.5,1.3)*leg:0;return[ARCH_C+u*ARCH_HALF,archY(u),split];};
function arch(s:Sheet,c:Cam,glow=0){
 const body=new Path2D(),edge=new Path2D(),cables=new Path2D();
 const run=(pts:V3[])=>{for(let i=0;i+1<pts.length;i++){seg3(c,pts[i],pts[i+1],5,body,2);seg3(c,pts[i],pts[i+1],7,edge,3);}};
 const spine:V3[]=[];for(let i=0;i<=20;i++)spine.push(archPt(-1+i/20*1.5));run(spine);
 for(const leg of[-1,1]){const p:V3[]=[];for(let i=0;i<=8;i++)p.push(archPt(.5+i/8*.5,leg));run(p);}
 // the roof hangs from the arch by cables from the lip of each side stand
 for(const si of[0,2]){const S=STANDS[si];for(let k=1;k<12;k++){const a=k/12,l=lipOf(S,a),u=(l[0]-ARCH_C)/ARCH_HALF;if(Math.abs(u)>.95)continue;seg3(c,l,[l[0],archY(u),0],.25,cables,.7);}}
 s.fill(K,cables,.55);s.fill(K,edge,.9);s.knockout(body);s.tone(B,body,.12);if(glow>.02)s.fill(Y,body,.7*glow);
}
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number;archGlow?:number}={}){
 const{roar=0,flash=0,archGlow=0}=o,v=view(s),tt=twos(t),lite=!!s._passage.pending;// heat: inside a passage (two scenes printing) the decoration thins out
 // a July (winter) night in Durban: a navy sky, a floodlit blue haze low down
 s.field(K,.5,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.12,.2,.3].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));}
 if(!lite||archGlow>.02)arch(s,c,archGlow);
 const planes=new Path2D(),tier=new Path2D(),band=new Path2D(),blueBand=new Path2D(),roof=new Path2D(),seams=new Path2D(),lip=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));
  for(const b of TIER)seg3(c,S(0,b),S(1,b),1.3,band);seg3(c,S(0,.02),S(1,.02),1.2,blueBand);seg3(c,S(0,.72),S(1,.72),.7,tier);
  // the white membrane roof: from the top of the stand in to its lip, radial seams, the lit lip
  addPoly(roof,polyP(c,[topOf(S,0),topOf(S,1),lipOf(S,1),lipOf(S,0)]));
  for(let k=1;k<10;k++){const a=k/10;seg3(c,topOf(S,a),lipOf(S,a),.35,seams,.7);}
  seg3(c,lipOf(S,0),lipOf(S,1),.8,lip);}
 for(const[i,ai,j,aj] of CORNERS){if(!which.includes(i)&&!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,polyP(c,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)]));
  addPoly(roof,polyP(c,[topOf(A,ai),topOf(Bs,aj),lipOf(Bs,aj),lipOf(A,ai)]));seg3(c,lipOf(A,ai),lipOf(Bs,aj),.8,lip);}
 // pale seats under the crowd, the orange World Cup band on the tier front, the blue band along the lower tier
 s.knockout(planes);s.tone(K,planes,.24);s.tone(B,planes,.12);s.knockout(tier,.7);
 // the crowd: seeded dots (Spain red and yellow, Germany white and black, a mixed crowd), sized by distance; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,11);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0]-v.cx)>v.hx||Math.abs(p[1]-v.cy)>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.5?0:h<.74?1:h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 // the closed corners carry the crowd too
 for(const[ci,[i,ai,j,aj]] of CORNERS.entries()){if(!which.includes(i)&&!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];for(let jr=0;jr<STAND_ROWS;jr++){const b=(jr+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.04))continue;
  for(let ic=0;ic<56;ic++){const h=hash(ic*97+jr*6131+ci*29,12);if(h<.22)continue;const P=mix3(A(ai,b),Bs(aj,b),(ic+.5)/56),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0]-v.cx)>v.hx||Math.abs(p[1]-v.cy)>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.5?0:h<.74?1:h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);if(!lite){s.fill(K,inks[2],.9);s.fill(Y,inks[3],.95);}
 s.knockout(band);s.fill(R,band,.6);s.fill(Y,band,.8);s.knockout(blueBand);s.fill(B,blueBand,.85);
 s.knockout(roof);s.tone(B,roof,.14);if(!lite){s.tone(K,roof,.1);s.tone(K,seams,.28);}
 // floodlights along the roof lip
 if(lite)return;
 s.knockout(lip);s.fill(Y,lip,.5);
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<8;k++){const u=(k+.5)/8,a=add3(lipOf(S,u-.02),[0,-.8,0]),b=add3(lipOf(S,u+.02),[0,-.8,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1.4,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.85);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 // mowing stripes across the pitch, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // advertising boards: orange with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(R,bd,.7);s.fill(Y,bd,.8);s.knockout(pn,.85);
 // painted lines
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
/** Germany's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around (by, bz) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.6,-1.3,0,1.3,2.6,z1];
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
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** Spain's home kit that night: red shirts, blue shorts, red socks (yellow numbers and trim: inferred) */
const esp=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:[B,.95],socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,numberInk:Y,hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Germany's home kit: white shirts, black shorts, white socks (black numbers and trim) */
const ger=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.92],socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.7],line:K,trim:K,numberInk:K,hairStyle:'short',build:{height:1.86,bulk:1},...o});
const B_PUY:Build={height:1.78,bulk:1.06,thighs:1.1},B_XAV:Build={height:1.7,bulk:.9},B_NEU:Build={height:1.93,bulk:1},B_TALL:Build={height:1.96,bulk:1.02};
/** Puyol: No. 5, long dark curly hair (confirmed by the spectator photo), 1.78 m */
const PUY_ST=esp({number:5,hairStyle:'curly',hair:[K,.92],skin:SKIN_L,build:B_PUY,seed:5});
const XAV_ST=esp({number:8,hair:[K,.85],build:B_XAV,seed:8});
/** Neuer: keeper's kit drawn yellow with navy shorts (inferred) */
const NEU_ST:AthleteStyle={shirt:[Y,.95],shorts:[K,.85],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[Y,.75],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:B_NEU,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Xavi's corner)
const BALL_R=.11,GRAV=9.81;
/** the corner flies TF s to Puyol's forehead; his header reaches the goal line TG (≈ 9 m in .42 s: thumped) */
const TF=1.7,TG=TF+.42;
/** Puyol's header spot (his pelvis) ≈ 9 m out (the BBC's "10 yards"), a little toward the near post; he faces the goal, a touch toward the ball */
const HP:[number,number]=[-9.3,-.9],YAW_H=yawTo(1,-.22);
/** Puyol's header pose: header() with a big spring off his long run ("climbs highest"), head and shoulders driving straight through, a
 * touch to his RIGHT (toward Neuer's left) */
function puyHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.45;const w=Math.sin(Math.PI*clamp((u-.34)/.36)),sn=clamp((u-.36)/.2);
 p.neckY+=lerp(.14,-.16,sn)*w;p.twist+=lerp(.08,-.1,sn)*w;p.neckP+=.22*w;return p;}
/** contact on the header clock: mid-snap, forehead through the ball */
const CU=.47,HD=1.0,TJ=TF-CU*HD;
/** his forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(puyHeader(CU),B_PUY,{x:HP[0],z:HP[1],yaw:YAW_H}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.02,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the corner spot (ball in the quadrant at Spain's LEFT, the −z corner flag) */
const P0:V3=[-.45,BALL_R,-33.55];
/** the in-swinger: a steady sideways pull TOWARD goal (+x) on top of gravity (right foot from the left) */
const SWING:V3=[2.6,-GRAV,0];
const launch=(A:V3,Bp:V3,d:number,a:V3):V3=>[(Bp[0]-A[0]-.5*a[0]*d*d)/d,(Bp[1]-A[1]-.5*a[1]*d*d)/d,(Bp[2]-A[2]-.5*a[2]*d*d)/d];
const flyA=(A:V3,V:V3,a:V3,t:number):V3=>[A[0]+V[0]*t+.5*a[0]*t*t,A[1]+V[1]*t+.5*a[1]*t*t,A[2]+V[2]*t+.5*a[2]*t*t];
const V_CROSS=launch(P0,HEAD_PT,TF,SWING);
/** Xavi strikes along the ball's launch direction */
const DC=nrm2(V_CROSS[0],V_CROSS[2]),YAW_X=yawTo(DC[0],DC[1]);
/** where Xavi's pelvis stands at contact so his RIGHT boot meets the back of the ball (solved once, FK) */
const PCX:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),B_XAV,{x:0,z:0,yaw:YAW_X});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
/** the run-up: from behind the ball and to its left (a right-footer's angle) */
const LEFT_X:[number,number]=[DC[1],-DC[0]],RUN0:[number,number]=[PCX[0]-DC[0]*3.4+LEFT_X[0]*1.6,PCX[1]-DC[1]*3.4+LEFT_X[1]*1.6];
/** where the header crosses the goal line: about head height, a little to Neuer's left of centre (+z) */
const GOAL_PT:V3=[0,1.5,1.25],NET_HIT:V3=[1.8,1.3,1.4],REST:V3=[1.2,BALL_R,1.1];
const G3:V3=[0,-GRAV,0];
const V_HEAD=launch(HEAD_PT,GOAL_PT,TG-TF,G3);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='puy'|'xav'|'gk'|'mark'|'hold'|'esp'|'ger';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean;holds?:number};
const T0=-10,T1=12,DT=.02;
const mp=(u:number):[number,number]=>[PCX[0]+DC[0]*u,PCX[1]+DC[1]*u];
/** after the goal the Spanish players chase Puyol toward the near (+z) touchline */
const toPuyol=(x:number,z:number,k:number):number[][]=>[[TF+1.2+k*.2,x,z],[TF+4+k*.3,lerp(x,-7,.6),lerp(z,20,.6)],[T1,lerp(x,-5.5,.8),lerp(z,27,.85)]];
const ACTORS:Actor[]=[
 // Puyol: waits deep, outside the arc of the box, away from the grabbing arms; starts, then sprints ≈ 15 m and takes off ≈ 9 m out
 {name:'Carles Puyol',role:'puy',hero:true,style:PUY_ST,keys:[[T0,-25.4,4.2],[-5,-25,3.9],[-2.2,-24.6,3.5],[-1.2,-23,3],[0,-19.4,1.9],[.8,-15.2,.6],[TJ,HP[0]-1,HP[1]+.2],[TJ+.24,HP[0],HP[1]],[TF+.5,HP[0],HP[1]],[TF+1.4,-8.2,3.8],[TF+3.6,-7.2,12],[TF+6.6,-6,22],[T1,-5.4,28]]},
 {name:'Xavi',role:'xav',hero:true,style:XAV_ST,keys:[[T0,.6,-36.4],[-6.4,.2,-35.4],[-5.2,...mp(-.7)],[-3.6,...RUN0],[-1,...RUN0],[-.5,...mp(-1.6)],[0,...mp(0)],[.7,...mp(.9)],[3,...mp(3.5)],[T1,-3,-28]]},
 {name:'Manuel Neuer',role:'gk',hero:true,style:NEU_ST,keys:[[T0,-.6,-.7],[-2,-.7,-1],[0,-.8,-1.2],[TF-.4,-.9,-.8],[TF,-.95,-.6],[T1,-.9,-.4]]},
 {name:'tall German marker (beaten)',role:'mark',hero:true,style:ger({build:B_TALL,hair:[Y,.8],seed:41}),keys:[[T0,-11.4,-2.3],[-2,-11.2,-2.1],[0,-11,-1.9],[TF-.6,-10.6,-1.7],[TF,-10.4,-1.6],[T1,-9.8,-1.5]]},
 // the pack in the box: Germany's markers holding Spanish players (the "arm grabs")
 {name:'Germany near post',role:'ger',style:ger({skin:SKIN_M,seed:42}),keys:[[T0,-.9,-4.3],[0,-.8,-4.1],[TF,-1.2,-3.3],[T1,-1.4,-2.8]]},
 {name:'Germany holder 1',role:'hold',holds:10,style:ger({build:{height:1.91},seed:43}),keys:[[T0,-4.6,-2.9],[-2,-4.7,-2.7],[0,-4.9,-2.5],[TF,-5.2,-2.1],[T1,-5,-1.5]]},
 {name:'Germany holder 2',role:'hold',holds:11,style:ger({hair:[K,.8],seed:44}),keys:[[T0,-5.3,1.1],[-2,-5.4,1],[0,-5.6,.9],[TF,-6,.7],[T1,-5.6,.4]]},
 {name:'Germany holder 3',role:'hold',holds:12,style:ger({build:{height:1.85},seed:45}),keys:[[T0,-8.2,2.2],[-2,-8.1,2.1],[0,-8.2,2],[TF,-8.6,1.6],[T1,-8,1.2]]},
 {name:'Germany edge',role:'ger',style:ger({skin:SKIN_D,hair:K,seed:46}),keys:[[T0,-15.6,-5.2],[-2,-15.9,-4.9],[0,-15.4,-4.4],[TF,-13.4,-3.4],[T1,-12.5,-2.6]]},
 {name:'Germany back post',role:'ger',style:ger({skin:SKIN_M,hair:K,seed:48}),keys:[[T0,-6.3,5.4],[0,-6.4,5],[TF,-6.8,4.2],[T1,-6.2,3.4]]},
 {name:'Spain attacker 1 (held)',role:'esp',style:esp({build:{height:1.93},seed:61}),keys:[[T0,-4.1,-2.2],[-2,-4.1,-2],[0,-4.2,-1.8],[TF,-4.2,-1.2],...toPuyol(-4.4,-.6,0)]},
 {name:'Spain attacker 2 (held)',role:'esp',style:esp({skin:SKIN_M,seed:62}),keys:[[T0,-4.7,1.7],[-2,-4.7,1.6],[0,-4.8,1.5],[TF,-5,1.4],...toPuyol(-5.2,1.6,1)]},
 {name:'Spain attacker 3 (held)',role:'esp',style:esp({build:{height:1.84},seed:63}),keys:[[T0,-7.6,2.8],[-2,-7.5,2.7],[0,-7.5,2.6],[TF,-7.4,2.3],...toPuyol(-7.2,2.4,2)]},
 {name:'Spain attacker 4',role:'esp',style:esp({skin:SKIN_M,hair:[K,.7],seed:64}),keys:[[T0,-12.6,-5.6],[-2,-12.2,-5.4],[0,-12,-5],[TF,-10.8,-4],...toPuyol(-10,-3.2,3)]},
];
const PUY=0,XAV=1,GK=2,MARK=3;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 // a held key (same spot twice) keeps zero speed at its ends
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball: the Jabulani (white, with curved coloured triangles)
/** placed in the quadrant (Xavi sets it down early) → the corner → the header → the net */
function ballAt(tau:number):V3{
 if(tau<=0)return P0;
 if(tau<TF)return flyA(P0,V_CROSS,SWING,tau);
 if(tau<TG)return flyA(HEAD_PT,V_HEAD,G3,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.55),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.69)*9))*Math.exp(-(tau-TG-.69)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*4:TF*TAU*4-(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));
/** the 2010 match ball: paper white, a blue shade crescent, three curved triangle graphics (red and navy) turning with the spin, a navy rim */
function jabulani(s:Sheet,x:number,y:number,r:number,spin:number){
 const rim:Pt[]=Array.from({length:24},(_,i)=>{const a=i/24*TAU;return[x+Math.cos(a)*r,y+Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);s.save();s.clip(disc);s.tone(B,crescent(x,y,r*1.02,[-.4,-.45]),.4);
 const red=new Path2D(),nav=new Path2D(),m=Math.cos(spin*.6);
 for(let k=0;k<3;k++){const a=spin+k*TAU/3,tri:Pt[]=[[x+Math.cos(a)*r*.2,y+Math.sin(a)*r*.2*m],[x+Math.cos(a+.55)*r*.8,y+Math.sin(a+.55)*r*.8*m],[x+Math.cos(a+1.25)*r*.62,y+Math.sin(a+1.25)*r*.62*m]];(k%2?nav:red).addPath(polyPath(tri,true));}
 s.fill(R,red,.9);s.fill(K,nav,.85);s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.1),{close:true,pressure:.5,wobble:r*.02}));
}

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
/** Neuer: set, then a small late step and dive to his left (+z) — the ball is past him first */
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'l',height:.7}),T_DIVE=TF+.1,DIVE_L=.9;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'puy':{
   // eyes on the corner while he waits deep; the run; he gathers, springs off his run, heads it through, lands, runs off
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=puyHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   if(tau<-1.4){yaw=faceYaw(k,tau,P0);}
   const w=sm(TJ-.7,TJ-.2,tau)*(1-sm(TF+.55,TF+1.1,tau));yaw=w>=1?YAW_H:lerpAng(yaw,YAW_H,w);break;}
  case 'xav':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r'}),w);
   if(tau<-4.8&&tau>-6.6){// bends to set the ball in the quadrant
    pose=blendPose(pose,posed({lHipF:70,rHipF:40,lKnee:90,rKnee:60,lean:40,pitch:10,neckP:30,lShF:60,rShF:50,lElb:30,rElb:30}),win(tau,-6.6,-4.8,.5));yaw=faceYaw(k,tau,P0);}
   // the raised arm (a signal to the box) as he steps back
   if(tau>-3.4&&tau<-1.4)pose=blendPose(pose,posed({lHipF:8,rHipF:4,lKnee:12,rKnee:10,rShF:170,rShA:20,rElb:10,lShA:14,lElb:30,neckY:10}),win(tau,-3.4,-1.4,.4)*.9);
   if(tau>-3.6&&tau<-1){yaw=lerpAng(faceYaw(k,tau,[HP[0],0,HP[1]]),YAW_X,sm(-2.2,-1.2,tau));}
   yaw=lerpAng(yaw,YAW_X,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HP[0],0,HP[1]]),sm(1.4,1.9,tau));
   if(tau>TG+.6){const run=celebrate(distOf(k,tau)/4,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.6,TG+1.2,tau)*.8);}
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.6,1.1,tau)*(1-sm(TF-.85,TF-.65,tau)));
   if(tau>T_DIVE-.15){pose=blendPose(pose,DIVE((tau-T_DIVE)/DIVE_L),sm(T_DIVE-.15,T_DIVE,tau));}
   if(tau>TG+1.4)pose=blendPose(pose,DEJECT,sm(TG+1.6,TG+2.4,tau)*.6);
   yaw=faceYaw(k,Math.min(tau,TF-.1));if(tau>TF-.1)yaw=lerpAng(yaw,Math.PI,sm(TF-.1,TF+.1,tau));break;}
  case 'mark':{// taller, but standing still: a late, lower jump beside Puyol, then hands on hips
   if(tau>TF-.6&&tau<TF+1){const hp=header(clamp((tau-(TF-.42))/1.0));hp.air*=.42;pose=blendPose(pose,hp,sm(TF-.6,TF-.42,tau)*(1-sm(TF+.6,TF+1,tau)));}
   if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'hold':{const m=a.holds??0,[mx,mz]=posOf(m,tau),g=1-sm(TF-.3,TF+.2,tau);pose=blendPose(pose,HOLD(tau,k),g*.95);
   if(g>.02)yaw=lerpAng(faceYaw(k,tau),yawTo(mx-x,mz-z),g);
   if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);break;}
  case 'ger':if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);if(tau>TF+.2)yaw=faceYaw(k,TF+.2);break;
  case 'esp':if(tau>TG+.3){const run=celebrate(distOf(k,tau)/4.2,{kind:'arms'});pose=blendPose(pose,run,sm(TG+.4,TG+1,tau)*.7);}break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: his curly hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the corner, the leap, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 jabulani(s,g[0],g[1],r,rot);
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=2;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; in a chapter's last .7 s and inside a passage
 * every figure is capped (Puyol 'mid', everyone else 'low', tiny extras skipped). */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null,cap=false):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending||cap;
 // heat cap: at most FULL_CAP big non-hero figures print at full detail (the nearest); the rest of a crowded box prints 'low'
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0]-v.cx)>v.hx+k||g[1]-v.cy<-v.hy-k||g[1]-v.cy>v.hy+k)continue;
  const px=k*ppu;if(passing&&!f.hero&&px<34)continue;const style:AthleteStyle=passing?{...f.style,detail:f.style===PUY_ST?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[];cap?:boolean}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===PUY&&tau>-.6&&tau<TF+.3)||(k===XAV&&tau>-.25&&tau<.35)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]},!!o.cap);
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
/** a team ring on the grass round each player of a side (on "in red" / "in white") */
function teamRings(s:Sheet,c:Cam,tau:number,side:'esp'|'ger',g:number){
 if(g<=.02)return;const p=new Path2D();
 ACTORS.forEach((a,k)=>{const isEsp=a.role==='puy'||a.role==='xav'||a.role==='esp',isGer=a.role==='gk'||a.role==='mark'||a.role==='hold'||a.role==='ger';if(side==='esp'?!isEsp:!isGer)return;
  const[x,z]=posOf(k,tau),pts:Pt[]=[];for(let i=0;i<20;i++){const u=i/20*TAU,q=pr(c,[x+Math.cos(u)*.9*g,.02,z+Math.sin(u)*.9*g]);if(q)pts.push(q);}if(pts.length>12)p.addPath(ribbon(pts,Math.max(5,kAt(c,[x,0,z])*.13),{close:true,taper:0,wobble:.6}));});
 s.knockout(p,.9);if(side==='esp')s.fill(R,p,.95);else s.stroke(K,p,2,.8);
}
/** 7-segment block digits (glyph box 1 × 2) for the score bug */
const SEGS:Record<string,number[][]>={a:[[0,0],[1,0]],b:[[1,0],[1,1]],c:[[1,1],[1,2]],d:[[0,2],[1,2]],e:[[0,1],[0,2]],f:[[0,0],[0,1]],g:[[0,1],[1,1]]};
const DIGITS:Record<string,string>={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abfgcd','-':'g'};
function glyphs(str:string,x0:number,y0:number,gw:number,path:Path2D){const th=gw*.3;[...str].forEach((ch,ci)=>{const ox=x0+ci*gw*1.6;for(const sg of DIGITS[ch]??''){const[[a0,b0],[a1,b1]]=SEGS[sg],x=ox+Math.min(a0,a1)*gw-th/2,y=y0+Math.min(b0,b1)*gw-th/2,w=a0===a1?th:gw+th,h=b0===b1?th:gw+th;path.rect(x,y,w,h);}});}
/** the TV score bug (top left): Germany's flag (navy/red/yellow), 0-0 (1-0 after the goal, Spain's side), Spain's flag, the minute */
function scoreBug(s:Sheet,g:number,goal:boolean,minute:number){
 if(g<=.02)return;const x=-s.W/2+60-(1-g)*120,y=-s.H/2+54,w=380,h=112,panel=polyPath([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],true);
 s.knockout(panel,.95*g);s.fill(K,panel,.92*g);
 const fl=(fx:number,cols:[string,number][])=>{cols.forEach(([ink,cov],i)=>{const p=polyPath([[fx,y+16+i*14],[fx+54,y+16+i*14],[fx+54,y+30+i*14],[fx,y+30+i*14]],true);s.knockout(p,g);if(ink!=='paper')s.fill(ink,p,cov*g);});};
 fl(x+16,[[K,.4],[R,.95],[Y,.95]]);fl(x+w-70,[[R,.95],[Y,.95],[R,.95]]);
 const sc=new Path2D(),mn=new Path2D();glyphs(goal?'0-1':'0-0',x+118,y+14,28,sc);s.knockout(sc,g);if(minute>.02){glyphs('73',x+150,y+82-8*(1-minute),11,mn);s.knockout(mn,g*minute);s.fill(Y,mn,.95*g*minute);}
}

// ---------------------------------------------------------------- 1 · live: the arch, then the high main-stand camera, real time
/** τ from chapter time: real time (×≈1), anchored so the corner is struck on "whips in a corner" and his forehead meets it just after "Carles Puyol" */
function tau1(t:number){const tX=Math.min(CUE(0,'whips in')+.7,CUE(0,'Carles Puyol')-1),tH=CUE(0,'Carles Puyol')+.45,k=clamp(TF/Math.max(.5,tH-tX),.8,1.15);return Math.max(T0+.5,(t-tX)*k);}
const P1:V3=[-24,22,64];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:[-40,28,74],T:[-54,66,-18],fov:64})],
  [CUE(0,'semi-final')-.1,1.8,()=>({P:P1,T:[-26,0,-6],fov:30})],
  [CUE(0,'Spain')-.2,1.2,()=>({P:P1,T:[-12,1,-.5],fov:15})],
  [CUE(0,'Nil-nil')-.1,1.2,()=>({P:P1,T:mix3(at(PUY,tau,1),[-12,1,0],.45),fov:17})],
  [CUE(0,'Xavi')-.9,.8,()=>({P:P1,T:mix3(at(XAV,tau,.9),P0,.35),fov:4.6})],
  [CUE(0,'whips in')+.6,1.1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.4+.3*b[1],0]),[HP[0],1.6,HP[1]],.25+.5*sm(0,TF,tau)),fov:lerp(12,16,sm(-.1,.8,tau))})],
  [CUE(0,'Carles')-.45,.8,()=>({P:P1,T:[HP[0]+1.2,1.8,HP[1]+1.2],fov:7.5})],
  [CUE(0,'into the net')-.2,1.5,()=>{const w=at(PUY,tau,1.2);return{P:P1,T:mix3(w,[-2,1.2,2],.35),fov:12};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tA=CUE(0,'into the net'),tN=CUE(0,'thunders')+.4,tR=CUE(0,'Spain'),tW=CUE(0,'Germany'),tZ=CUE(0,'Nil-nil'),tD=CUE(0,'Durban'),tM=CUE(0,'seventy-three');
  // "Durban": the arch lights up over the roof
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tA-.2,tA+.3,t)*(1-sm(tA+2.2,tA+3,t)),archGlow:sm(tD,tD+.5,t,easeOut)*(1-sm(CUE(0,'semi-final'),CUE(0,'semi-final')+1.2,t))});
  ground(s,c);
  // "in red": red rings round Spain; "in white": paper rings round Germany
  teamRings(s,c,tau,'esp',sm(tR,tR+.3,tt,easeOutBack)*(1-sm(tW,tW+.4,tt)));
  teamRings(s,c,tau,'ger',sm(tW,tW+.3,tt,easeOutBack)*(1-sm(tZ,tZ+.4,tt)));
  play(s,c,tau,tp,{min:19,lines:true,prevBall:tau1(t-.06),cap:t>SECS(0)-.7});
  // "Nil-nil, seventy-three minutes": the TV score bug slides in (and turns to 0-1 on the goal)
  scoreBug(s,sm(tZ-.1,tZ+.3,t,easeOut)*(1-sm(SECS(0)-.9,SECS(0)-.5,t)),tau>TG+.1,sm(tM-.05,tM+.3,t,easeOutBack));
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Carles')+.5;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low beside the far post, looking back at the run
const tau2=(t:number)=>key(t,mono([[0,-3],[CUE(1,'starts far'),-2.4],[CUE(1,'grabbing arms'),-1.8],[CUE(1,'charges in'),-.9],[CUE(1,'full speed'),.35],[SECS(1)-.2,TJ+.05]]),linear);
const E2:V3=[4.5,2.6,15];
function cam2(t:number):Cam{
 const tau=tau2(t),r=at(PUY,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(r,[-20,1,2],.3),fov:16})],
  [CUE(1,'starts far')-.2,1.1,()=>({P:E2,T:mix3(r,[-20,1,2],.2),fov:12})],
  [CUE(1,'grabbing arms')-.2,1,()=>({P:E2,T:[-5.8,1.2,-.4],fov:15})],
  [CUE(1,'charges in')-.2,1,()=>({P:add3(E2,[0,.1,-.5]),T:mix3(r,[HP[0],1.3,HP[1]],.25),fov:13})],
  [CUE(1,'full speed')-.1,.9,()=>({P:add3(E2,[0,.2,-1]),T:mix3(r,[HP[0],1.4,HP[1]],.45),fov:15})],
 ]);
}
/** the replay trail: the corner's path so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.9),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
/** a flat ring on the grass */
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;s.stroke(ink,polyPath(pts,true),Math.max(5,kAt(c,P)*.07),.95*a);
}
/** yellow rings round the grabbing hands of the German holders */
function grabRings(s:Sheet,c:Cam,tau:number,g:number){
 if(g<=.02)return;const p=new Path2D();
 ACTORS.forEach((a,k)=>{if(a.role!=='hold')return;const st=stateOf(k,tau),sk=solve(st.pose,a.style.build,st.place);for(const h of[sk.lHa,sk.rHa]){const q=pr(c,h);if(!q)continue;const rr=Math.max(10,kAt(c,h)*.2)*easeOutBack(clamp(g)),pts:Pt[]=[];for(let i=0;i<16;i++){const u=i/16*TAU;pts.push([q[0]+Math.cos(u)*rr,q[1]+Math.sin(u)*rr]);}p.addPath(ribbon(pts,Math.max(4,rr*.22),{close:true,taper:0,wobble:.6}));}});
 s.knockout(p,.9*g);s.fill(Y,p,.95*g);
}
/** the TV replay badge (top left): "Watch again" → a rewind mark (two yellow triangles on navy); "slowly" → the second triangle gives way
 * to three slow dots */
function replayBadge(s:Sheet,g:number,slow:number){
 if(g<=.02)return;const x=-s.W/2+60-(1-g)*120,y=-s.H/2+54,w=190,h=96,panel=polyPath([[x,y],[x+w,y],[x+w-18,y+h],[x-18,y+h]],true);
 s.knockout(panel,.95*g);s.fill(K,panel,.92*g);
 const tri=(cx:number,cov:number)=>{const p=polyPath([[cx+22,y+22],[cx+22,y+h-22],[cx-14,y+h/2]],true);s.knockout(p,cov);s.fill(Y,p,.95*cov);};
 tri(x+50,g);tri(x+100,g*(1-slow));
 if(slow>.02){const d=new Path2D();for(let i=0;i<3;i++){const cx=x+96+i*26,cy=y+h/2,r=7*easeOutBack(clamp(slow*1.4-i*.2));if(r>.5)d.addPath(polyPath(blob(cx,cy,r,r,i+3,{n:10}),true));}s.knockout(d,g);s.fill(Y,d,.95*g);}
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12),tS=CUE(1,'starts far'),tG=CUE(1,'grabbing arms'),tC=CUE(1,'charges in'),tF=CUE(1,'full speed');
  stadium(s,c,t,[0,2,3],{roar:.25});
  ground(s,c);
  // "starts far from goal": a red ring where he waits, outside the box
  groundRing(s,c,[-24.6,0,3.5],1,R,sm(tS-.15,tS+.3,t)*(1-sm(tC+.4,tC+1,t)));
  trail(s,c,tau,1);
  play(s,c,tau,tp,{smear:true,min:10,cap:t>SECS(1)-.7});
  // "away from the grabbing arms": the holders' hands ringed in yellow
  grabRings(s,c,tau,sm(tG-.1,tG+.3,t)*(1-sm(tC+.3,tC+.9,t)));
  // "Watch again, slowly": the replay badge
  const tWa=CUE(1,'Watch again'),tSl=CUE(1,'slowly');replayBadge(s,sm(tWa-.1,tWa+.3,t,easeOut)*(1-sm(tS+.6,tS+1,t)),sm(tSl-.05,tSl+.4,t));
  // "charges in at full speed": speed lines trail him
  const fs=sm(tC,tC+.3,t);if(fs>0){const a=pr(c,at(PUY,tau-.12,1.1)),b=pr(c,at(PUY,tau,1.1));if(a&&b&&Math.hypot(b[0]-a[0],b[1]-a[1])>2)speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:6,seed:13,len:lerp(120,240,sm(tF,tF+.4,t)),spread:kAt(c,at(PUY,tau))*.6,width:6,cov:.85*fs});}
 },
 aperture(t){const c=cam2(t),p=stateOf(PUY,tau2(twos(t))),sk=solve(p.pose,B_PUY,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(1,'full speed')+.2;},
};

// ---------------------------------------------------------------- 3 · a second replay: high behind the goal — the leap, the highest point, past Neuer
const tau3=(t:number)=>key(t,mono([[0,TJ-.35],[CUE(2,'He leaps'),TJ],[CUE(2,'above everyone'),TJ+.3],[CUE(2,'meets the ball'),TF-.12],[CUE(2,'highest point'),TF],[CUE(2,'Neuer'),TF+.18],[CUE(2,'no chance'),TG+.1],[SECS(2),TG+1.9]]),linear);
const E3:V3=[16,9,8];
function cam3v(t:number):Cam{
 const tau=tau3(t),r=at(PUY,tau,1.8);
 return plan(t,[
  [0,0,()=>({P:E3,T:[HP[0],1.6,HP[1]],fov:22})],
  [CUE(2,'above everyone')-.2,.9,()=>({P:E3,T:[HP[0],2.2,HP[1]],fov:17})],
  [CUE(2,'highest point')-.3,.8,()=>({P:E3,T:mix3(HEAD_PT,[HP[0],2,HP[1]],.3),fov:14})],
  [CUE(2,'Neuer')-.1,1,()=>({P:E3,T:[-3,1.3,-.3],fov:28})],
  [CUE(2,'no chance')+.4,1.6,()=>({P:[13,8,11],T:r,fov:24})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tp=tau3(tt-1/12),tA=CUE(2,'above everyone'),tH=CUE(2,'highest point'),tN=CUE(2,'Neuer'),tC=CUE(2,'no chance');
  stadium(s,c,t,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  const r=play(s,c,tau,tp,{smear:true,min:11,lines:true,prevBall:tau3(t-.06),cap:t>SECS(2)-.7});
  // "above everyone": a yellow level line at his head height, across the heads of the pack
  const ae=sm(tA-.1,tA+.3,t,easeOut)*(1-sm(tN-.3,tN+.2,t));
  if(ae>0){const st=stateOf(PUY,tau),sk=solve(st.pose,B_PUY,st.place),hy=sk.head[1]+.14,l=pr(c,[HP[0]-.4,hy,HP[1]-3.6*ae]),rr=pr(c,[HP[0]-.4,hy,HP[1]+4.6*ae]);
   if(l&&rr){const gaps:[number,number][]=[];for(let i=0;i<9;i++)gaps.push([(i+.66)/9,(i+.96)/9]);const p=ribbon([l,rr],Math.max(6,kAt(c,sk.head)*.05),{taper:0,wobble:.5,gaps});s.knockout(p,.9);s.fill(Y,p,.95);}}
  // "highest point": a ring on the ball at the top of his leap
  const hp=sm(tH-.15,tH+.2,t)*(1-sm(tN+.2,tN+.6,t));if(hp>0&&r.ball){const g=r.ball.g,rr=r.ball.r*2,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rp=ribbon(ring,Math.max(5,r.ball.r*.3),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp,.9*hp);s.fill(Y,rp,.95*hp);}
  // the touch: a spark on his forehead at contact
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
  // "Neuer": a ring round the keeper; "no chance": the header's path printed over the net
  const nr=sm(tN-.1,tN+.25,t,easeOutBack)*(1-sm(tC+.5,tC+1,t));if(nr>.02){const st=stateOf(GK,tau),sk=solve(st.pose,B_NEU,st.place),q=pr(c,sk.chest);if(q){const rr=kAt(c,sk.chest)*.8*nr,pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;pts.push([q[0]+Math.cos(a)*rr,q[1]+Math.sin(a)*rr*1.15]);}const p=ribbon(pts,Math.max(5,rr*.07),{close:true,taper:0,wobble:.8});s.knockout(p,.9);s.fill(Y,p,.95);}}
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.6,TG+1.1,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,HEAD_PT)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
 },
 aperture(t){const c=cam3v(t),p=stateOf(PUY,tau3(twos(t))),sk=solve(p.pose,B_PUY,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'highest point')+.1;},
};

// ---------------------------------------------------------------- 4 · the lesson: a close, very slow replay with teaching marks
const tau4=(t:number)=>key(t,mono([[0,-2.6],[CUE(3,'taller defenders'),-2.3],[CUE(3,'long, brave run'),-1.5],[CUE(3,'Attack the ball'),TJ-.1],[CUE(3,'highest point'),TF-.02],[CUE(3,'head it hard'),TF+.1],[SECS(3),TG+.5]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(PUY,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:[-17,2.6,16],T:[-18.5,1.2,0],fov:42})],
  [CUE(3,'long, brave run')-.2,1.1,()=>({P:[-17,2.4,15],T:mix3(w,[-16,1,0],.4),fov:40})],
  [CUE(3,'Attack the ball')-.2,1,()=>({P:[-12.5,1.8,10],T:mix3(w,[HP[0],1.8,HP[1]],.6),fov:30})],
  [CUE(3,'highest point')-.2,.8,()=>({P:[-11.8,1.9,8.6],T:[HP[0],2.3,HP[1]],fov:26})],
  [CUE(3,'head it hard')-.1,.9,()=>({P:[-11.4,2.2,9],T:mix3(HEAD_PT,[0,1.4,1.2],.4),fov:40})],
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
/** "taller defenders": a height ruler between the tall marker and Puyol — two navy ticks at their head heights (standing), then Puyol's
 * yellow tick rising above the German's as he leaps */
function ruler(s:Sheet,c:Cam,tau:number,g:number){
 if(g<=.02)return;const mst=stateOf(MARK,tau),msk=solve(mst.pose,B_TALL,mst.place),pst=stateOf(PUY,tau),psk=solve(pst.pose,B_PUY,pst.place);
 const base:V3=[lerp(msk.pelvis[0],HP[0],.5)-.2,0,lerp(msk.pelvis[2],HP[1],.5)+.6],top=Math.max(3.2,psk.head[1]+.4);
 const pole=new Path2D();seg3(c,base,[base[0],top*g,base[2]],.07,pole,2);for(let m=1;m<=3;m++)seg3(c,[base[0],m,base[2]-.12],[base[0],m,base[2]+.12],.04,pole,1.5);s.fill(K,pole,.9);
 const tick=(y:number,ink:string,len:number)=>{const p=new Path2D();seg3(c,[base[0],y,base[2]-len],[base[0],y,base[2]+len],.09,p,3);s.knockout(p);if(ink!=='paper')s.fill(ink,p,.95);s.stroke(K,p,2,.85);};
 tick(msk.head[1]+.12,'paper',.42*g);tick(psk.head[1]+.12,Y,.55*g);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tT=CUE(3,'taller defenders'),tL=CUE(3,'long, brave run'),tA=CUE(3,'Attack the ball'),tH=CUE(3,'highest point'),tD=CUE(3,'head it hard');
  stadium(s,c,t,[0,2,3],{roar:.3+.6*sm(tD+.3,tD+.9,t)});
  ground(s,c);
  // "a long, brave run": his run's footprints light up in order from deep as he arrives
  const run=sm(tL-.2,tL+.3,t)*(1-sm(tD+.2,tD+.8,t));
  if(run>0){const dim=new Path2D(),lit=new Path2D();for(let k=0;k<12;k++){const Tk=-1.2+k*((TJ+.2+1.2)/11),[x,z]=posOf(PUY,Tk),v=velOf(PUY,Tk),n=nrm2(-v[1],v[0]),side=k%2?.14:-.14,pts:Pt[]=[];
    for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[x+n[0]*side+Math.cos(a)*.16,.01,z+n[1]*side+Math.sin(a)*.1]);if(p)pts.push(p);}(Tk<=tau+.02?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*run);s.stroke(K,lit,5,.9*run);s.knockout(lit,run);s.fill(Y,lit,.95*run);}
  // "Attack the ball": the corner's arc dotted in, arriving where he will meet it
  const ab=sm(tA-.2,tA+.3,t)*(1-sm(tD+.4,tD+1,t));
  if(ab>0){const pts:Pt[]=[];for(let i=0;i<=24;i++){const p=pr(c,flyA(P0,V_CROSS,SWING,lerp(TF*.45,TF,i/24)));if(p)pts.push(p);}
   if(pts.length>2){const gaps:[number,number][]=[];for(let i=0;i<10;i++)gaps.push([(i+.62)/10,(i+.98)/10]);const d=ribbon(partial(pts,sm(tA,tA+1.1,t)),Math.max(7,kAt(c,HEAD_PT)*.06),{seed:21,taper:.2,wobble:.6,gaps});s.knockout(d,.8*ab);s.fill(Y,d,.95*ab);}}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[PUY,GK,MARK,5,10]});
  // "taller defenders": the ruler (and it stays up through the leap to show him rising above)
  ruler(s,c,tau,sm(tT-.1,tT+.4,t,easeOut)*(1-sm(tD+.3,tD+.8,t)));
  // "highest point": a ring on the ball at the top of his leap and a spark under his take-off
  const hp=sm(tH-.2,tH+.2,t);
  if(hp>0&&r.ball&&tau<TF+.1){const g=r.ball.g,rr=r.ball.r*1.9,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rp_=ribbon(ring,Math.max(5,r.ball.r*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp_,.9*hp);s.fill(Y,rp_,.95*hp);}
  const jp=sm(tA-.1,tA+.3,t)*(1-sm(tH+.2,tH+.6,t));if(jp>0){const q=pr(c,[HP[0],.05,HP[1]]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(70,kAt(c,[HP[0],0,HP[1]])*.7)*jp,{n:9,seed:41,g:easeOutBack(jp),width:12});}
  // "head it hard": his forehead glows and the header's arrow drives into the net
  const hd=sm(tD-.2,tD+.2,t);
  if(hd>0){const st=stateOf(PUY,tau),sk=solve(st.pose,B_PUY,st.place),h=sk.head,fc=sk.face,fp=add3(h,mul3(sub3(fc,h),1.05)),q=pr(c,add3(fp,[0,.05,0])),fade=1-sm(tD+1.6,tD+2.2,t);
   if(q){const rr=kAt(c,fp)*.07*clamp(hd,0,1.2),glow=polyPath(blob(q[0],q[1],rr,rr*.8,11,{amp:.06,n:16}),true);s.knockout(glow,.8*fade);s.fill(Y,glow,.9*fade);}
   const arr=sm(tD+.1,tD+1,t,easeInOutSine);if(arr>0){const pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(flyA(HEAD_PT,V_HEAD,G3,(TG-TF)*arr*i/8));pts.push(mix3(GOAL_PT,NET_HIT,.4*arr));arrow3(s,c,pts,Math.max(9,kAt(c,HEAD_PT)*.05),Y,.95);}}
 },
 get still(){return CUE(3,'head it hard')+.3;},
};

const film:RisoStory={
 id:'puyol-header-2010',format:'11v11',title:"Puyol's World Cup header",
 theme:'To beat taller defenders, make a long, brave run from deep and attack the ball at its highest point',
 ageNote:'Germany 0–1 Spain, World Cup semi-final, Durban, 7 July 2010. Puyol headed Xavi\'s corner in the 73rd minute. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little header — a ball drops in on an arc, a yellow spark where it is met at the top, and it is driven away. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.35),out=clamp((age-.35)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.35?x-170*(1-u):x+220*easeOut(out),by=age<.35?y-130*(1-u)*(1-u)-10:y+60*out;
  if(age>.3&&age<.65)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.3)/.12))*(1-clamp((age-.5)/.15)),width:14});
  if(fade>0)jabulani(s,bx,by,30,age*14+r()*TAU);
 },
};
export default film;
/** Solved contact points (pitch metres; Germany's goal line x = 0, +z = Spain's right) — checked by tests/play-film-puyol-header-2010.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,ballAt,cornerFoot:'r' as const,
 xaviContact:()=>{const st=stateOf(XAV,0),sk=solve(st.pose,B_XAV,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 puyolAt:(tau:number)=>{const st=stateOf(PUY,tau),sk=solve(st.pose,B_PUY,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,pelvis:sk.pelvis};},
 markerAt:(tau:number)=>{const st=stateOf(MARK,tau),sk=solve(st.pose,B_TALL,st.place);return{head:sk.head};},
 runStart:()=>posOf(PUY,-2.2)};
