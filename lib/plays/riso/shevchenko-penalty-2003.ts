/** Andriy Shevchenko's winning penalty — Juventus 0–0 AC Milan (Milan won 3–2 on penalties), the 2003 UEFA Champions League final,
 * Old Trafford, Manchester, 28 May 2003 — an iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the kick from WRITTEN accounts and one match photograph
 * (the broadcast footage itself was not reviewed), rendered as a riso print.
 *
 * SOURCES (read Sept 2026, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2003 UEFA Champions League final" (date, Old Trafford, 62,315, referee Markus Merk (Germany), kick-off 20:45 CEST =
 *    19:45 BST, clear and 18 °C, line-ups + numbers, the shoot-out order, "Shevchenko then had the chance to score the decisive penalty,
 *    and did") https://en.wikipedia.org/wiki/2003_UEFA_Champions_League_final
 *  - Wikipedia (it), "Finale della UEFA Champions League 2002-2003" (the shoot-out, "battendo Buffon", the kit boxes)
 *    https://it.wikipedia.org/wiki/Finale_della_UEFA_Champions_League_2002-2003
 *  - The Guardian, Michael Walker, "Milan are united in joy once more", 29 May 2003 ("Andrei Shevchenko's cool penalty rolled into the back
 *    of the Old Trafford net. Shevchenko wheeled away to his left and was enveloped by a posse of colleagues"; Gattuso "sprinted straight
 *    at the Milan fans who had draped the old Stretford End in AC's red and black", Inzaghi chasing him; "the humid Manchester air")
 *    https://www.theguardian.com/football/2003/may/29/sport.comment
 *  - The Guardian, minute-by-minute, "AC Milan 0 - 0 Juventus", 28 May 2003 ("The penalties will be taken into the non-Stretford End, where
 *    Juve's fans are gathered"; "Andriy Shevchenko wins the Champions League for AC Milan, as he calmly clips the ball past Gianluigi Buffon";
 *    the numbers) https://www.theguardian.com/football/2003/may/28/minutebyminute.sport
 *  - Wikimedia Commons, "Edgar Davids (Juventus F.C., no. 26) clashing with Gennaro Gattuso (A.C. Milan) - 20030528.jpg" (the kits that
 *    night: Milan ALL WHITE — white shirt, white shorts with a red-and-black side stripe, white socks; Juventus black-and-white STRIPED
 *    shirts, black shorts, black socks with white tops)
 * CONFIRMED by those accounts: 28 May 2003 at Old Trafford; 0–0 after extra time; the shoot-out order Trezeguet ✗ (Dida), Serginho ✓,
 *  Birindelli ✓, Seedorf ✗ (Buffon), Zalayeta ✗, Kaladze ✗, Montero ✗, Nesta ✓, Del Piero ✓ — so at 2–2, with Juventus' five taken,
 *  Shevchenko's kick (Milan's fifth) would win it — and he scored: Milan won 3–2; the kicks were taken at the end AWAY from the Stretford
 *  End, where the Juventus fans were, while Milan's fans had draped the Stretford End in red and black; Shevchenko (7) beat Buffon (1) with a
 *  cool, calm shot that ROLLED into the net, wheeled away TO HIS LEFT and was enveloped by team-mates; Gattuso (8) sprinted to the Milan fans
 *  at the Stretford End with Inzaghi (9) after him; Dida (12) was Milan's keeper; Milan all in white, Juventus in black-and-white stripes with
 *  black shorts and socks; referee Markus Merk; a clear, humid evening (19:45 kick-off + 120 min + penalties → the shoot-out in the late
 *  dusk, under floodlights); Shevchenko is right-footed.
 * INFERRED (illustrative): WHICH WAY the ball went and which way Buffon dived (drawn: the ball low into the corner to Shevchenko's right,
 *  Buffon diving to his own right, the other way — the narration only says "one way … the other"); the run-up (short, from his left, ≈ 4 m
 *  at ≈ 25°) and every position and time in metres/seconds (a side-foot drive at ≈ 65 km/h, never above ≈ 0.4 m); his path when he wheeled
 *  away and where the team-mates caught him; the goalkeepers' kit colours (Buffon grey, Dida yellow) and the officials' navy; where the
 *  referee, the assistant and Dida stood (the Laws' positions); the players linked in the centre circle; the dusk sky colours; the stadium
 *  as drawn (red seats, tiers, a cantilever roof with lights along its lip, blue boards), the crowd colours, banners and scarves.
 *
 * FRAMING (the TV broadcast, never top-down) — deliberately unlike the other penalty films: a LATE-DUSK light (violet sky, a red-gold
 * afterglow over the roof, red Old Trafford seats) and the goal on the LEFT of the live picture. ch1 = the high main-stand camera from the
 * −z side in REAL TIME (Old Trafford at dusk → the lines in the centre circle → Shevchenko puts the ball down and walks back → Buffon on his
 * line → the short run → Buffon goes one way, the ball rolls in the other → he wheels away); ch2 = the slow-motion replay from PITCH LEVEL,
 * SIDE-ON from his right (long lens: the still head, the run, the side-foot; the camera pans with the ball to the goal, where Buffon falls
 * away from us and the ball comes toward our post; a riso trail); ch3 = the reverse angle HIGH IN THE JUVENTUS END over the fans' heads and
 * scarves (the ball rolls in below them, then the lens follows him wheeling away and the white shirts running to him); ch4 = the lesson from
 * an elevated pitch-side three-quarter view across the box: a calm routine (footsteps back, a breathing ring) → pick your spot (a yellow target in the corner, a sight
 * line; the referee is left out of this one shot so he does not block it) → trust it (Buffon's red arrow goes the other way, the ball follows the yellow line into the target).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe) and kept inside the central ~1000 units, so
 * it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little). Figures: every body goes through ONE
 * adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion, motion smear on the run, the strike, the
 * dive and the sprints); small figures in the wide shots and every figure inside a passage print at `low` detail. Handedness: the world is
 * right-handed (x toward Juventus' goal, y up, +z = Shevchenko's right), athlete.ts's own convention, so his RIGHT foot strikes with no
 * mirrored projector; Buffon faces −x, so his right is −z. Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps
 * in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. Budget: ~150–340 plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/shevchenko-penalty-2003/timing.json, add
 *   import timingJson from '../../../public/plays/narration/shevchenko-penalty-2003/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * NB withTiming matches a cue by its FIRST word, in order — so no cue starts with a word that also appears between it and the previous cue
 * ("the ball goes" + "other way", not "the other way", which would catch the "the" of "the ball"). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Penalties, live',text:'Manchester, 2003. The Champions League final, and it\'s penalties. Score this, and Milan win. Andriy Shevchenko sets the ball down, calm. Buffon waits. A short run... Buffon goes one way, the ball rolls the other. Champions!',tail:1.6,
  cues:['Manchester','penalties','Score this','Andriy Shevchenko','sets the ball','Buffon waits','A short run','Buffon goes','the ball rolls','Champions']},
 {label:'Watch it again',text:'Again, slowly. No rush. He picked his spot and sticks to it. Buffon dives, and the ball goes the other way.',tail:1.2,
  cues:['Again','No rush','He picked','sticks to it','Buffon dives','the ball goes','other way']},
 {label:'From behind the goal',text:'From behind: it rolls in. Shevchenko wheels away, and his team-mates chase him!',tail:1.6,
  cues:['From behind','rolls in','Shevchenko wheels','team-mates chase']},
 {label:'The secret',text:'The secret? Keep a calm routine. Pick your spot, and trust it.',tail:1.8,
  cues:['The secret','Keep a calm','Pick your spot','trust it']},
];
import timingJson from '../../../public/plays/narration/shevchenko-penalty-2003/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? : ... — all × .87, calibrated on the recorded Kokoro
 * voice of the other penalty films (their clips run ≈ .87 × the raw estimate) */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.87*(.26+.025*w.replace(/[^a-z0-9]/gi,'').length);if(/[,;:]$/.test(w))t+=.19;if(/[.!?]$/.test(w))t+=.37;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('shevchenko: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('shevchenko: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Juventus' goal line is x = 0 (the kick goes +x), the goal centre z = 0, +z = Shevchenko's right. The Stretford End is x ≈ −112. */
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

// ---------------------------------------------------------------- Old Trafford at late dusk: violet sky, a red-gold afterglow, red seats, a cantilever roof
/** stand planes (a along, b up the rake 0..1): 0 the −z side (the live camera's side), 1 behind Juventus' goal (the Juve fans, x > 0),
 * 2 the +z side (the tall stand facing the live camera), 3 the Stretford End (Milan's fans, x < −105) */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-116,11,a),1.2+25*b,-40-30*b],
 (a,b)=>[9+28*b,1.2+25*b,lerp(-52,52,a)],
 (a,b)=>[lerp(11,-116,a),1.2+30*b,40+34*b],
 (a,b)=>[-114-28*b,1.2+25*b,lerp(52,-52,a)],
];
const STAND_COLS=[112,78,112,78],STAND_ROWS=15,TIERS=[.36,.66];
/** crowd colours per stand: cumulative weights for [paper (white shirts), red, navy (black), blue] */
const CROWD:[number,number,number][]=[[.36,.62,.9],[.46,.5,.97],[.34,.6,.9],[.14,.62,.97]];
/** banners on the stand fronts: [stand, a, kind] kind 0 = Milan (red | black stripes), 1 = Juventus (white | black stripes) */
const BANNERS:[number,number,number][]=[[1,.18,1],[1,.34,1],[1,.5,1],[1,.66,1],[1,.82,1],[3,.2,0],[3,.34,0],[3,.48,0],[3,.62,0],[3,.76,0],[0,.2,0],[0,.8,1],[2,.14,1],[2,.88,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number;dim?:number}={}){
 const{roar=0,flash=0,dim=0}=o,v=view(s),tt=twos(t),Bnd=Math.max(s.W,s.H)*2;
 // late dusk: a blue field, navy over it, a violet (red over blue) glow and a thin gold afterglow toward the horizon
 s.field(B,.52,.6);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))?.[1]??0;
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,Bnd],[-Bnd,Bnd]],true),.34+.25*dim);
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-620],[-Bnd,hz-560]],true),.28);
 s.tone(R,polyPath([[-Bnd,hz-470],[Bnd,hz-520],[Bnd,Bnd],[-Bnd,Bnd]],true),.34*(1-dim));
 s.tone(Y,polyPath([[-Bnd,hz-260],[Bnd,hz-300],[Bnd,Bnd],[-Bnd,Bnd]],true),.3*(1-dim));
 const planes=new Path2D(),tiers=new Path2D(),boxes=new Path2D(),wins=new Path2D(),roof=new Path2D(),edge=new Path2D(),truss=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);
  for(const b of TIERS)seg3(c,S(0,b),S(1,b),.5,tiers);
  // the executive boxes between the tiers: a dark band with lit windows
  addPoly(boxes,polyP(c,[S(0,.5),S(1,.5),S(1,.56),S(0,.56)]));
  for(let k=0;k<14;k++){const a0=k/14+.012,a1=k/14+.05;addPoly(wins,polyP(c,[S(a0,.513),S(a1,.513),S(a1,.547),S(a0,.547)]));}
  // the cantilever roof, a paper fascia along its lip and the trusses under it
  addPoly(roof,polyP(c,[add3(S(0,1),[0,2,0]),add3(S(1,1),[0,2,0]),add3(S(1,.28),[0,27,0]),add3(S(0,.28),[0,27,0])]));
  seg3(c,add3(S(0,.28),[0,26.8,0]),add3(S(1,.28),[0,26.8,0]),.5,edge);
  for(let k=1;k<8;k++){const a=k/8;seg3(c,add3(S(a,1),[0,1.5,0]),add3(S(a,.28),[0,26.5,0]),.35,truss);}}
 s.knockout(planes);s.tone(R,planes,.5);s.tone(K,planes,.42);
 s.knockout(tiers,.5);s.fill(K,boxes,.8);s.fill(Y,wins,.85);
 // the crowd: seeded dots in each end's colours, sized by distance; roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],w=CROWD[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIERS.some(x=>Math.abs(b-x)<.04)||(b>.49&&b<.57))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,5);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const u=hash(i*17+j*3+si,11),ink=u<w[0]?0:u<w[1]?1:u<w[2]?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.72);s.fill(R,inks[1],.95);s.fill(K,inks[2],.92);s.fill(B,inks[3],.95);
 s.knockout(roof);s.tone(K,roof,.66);s.tone(B,roof,.28);s.fill(K,truss,.5);s.knockout(edge,.85);
 // striped banners on the stand fronts
 const bn=new Path2D(),rd=new Path2D(),bk=new Path2D();
 for(const[si,a,kind] of BANNERS){if(!which.includes(si))continue;const S=STANDS[si],w=.034,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;bn.addPath(polyPath(q,true));
  for(let k=0;k<6;k+=2){const Q=polyP(c,[P(k/6,.005),P((k+1)/6,.005),P((k+1)/6,.075),P(k/6,.075)]);addPoly(kind===0?rd:bk,Q);if(kind===0)addPoly(bk,polyP(c,[P((k+1)/6,.005),P((k+2)/6,.005),P((k+2)/6,.075),P((k+1)/6,.075)]));}}
 s.knockout(bn);s.fill(R,rd,.95);s.fill(K,bk,.92);
 // floodlights: lamp strips along the roof lip, a warm yellow wash under them
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<9;k++){const u=(k+.5)/9,a=add3(S(u-.025,.28),[0,26,0]),b=add3(S(u+.025,.28),[0,26,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.85);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number;goal?:boolean}={}){
 // no running track at Old Trafford: the grass runs out to the boards
 const g=polyP(c,[[-113,0,-41],[8,0,-41],[8,0,41],[-113,0,41]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.82);s.tone(K,gp,.16);
 // mowing stripes across the width, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.14);
 // advertising boards: blue with paper panels, behind the goal and along both touchlines
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([6,0,-37],[6,0,37]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<11;k++){const z=-34+k*6.3;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.6],[5.9,.65,z+3.6],[5.9,.65,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<17;k++){const x=-106+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.6,.25,zz],[x+3.6,.65,zz],[x,.65,zz]]));}
 s.knockout(bd);s.fill(B,bd,.95);s.tone(K,bd,.35);s.knockout(pn,.9);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 s.knockout(ln);
 if(o.goal!==false)goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out low in the +z corner */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=2.7,back=(z:number,y=0)=>X+2+bulge*.55*Math.exp(-Math.pow((z-bz)/1.4,2))*(1-.6*y/1.9);
 const zs=[z0,-2.4,-1.2,0,1.2,2.4,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the kick on one clock τ (seconds; τ = 0 is the contact)
/** the ball on the spot, 11 m out */
const B0:V3=[-11,.11,0];
const DXG=-B0[0];
/** the placed shot: a low side-foot drive into the corner to his right — never higher than ≈ .4 m, crossing the line ≈ .3 m up at z ≈ 2.75 */
const ZT=2.75,[HA,HB]=(()=>{const dp=6.93,b=.29/(dp*dp);return[2*dp*b,b];})();
const flight=(d:number):V3=>[B0[0]+d,.11+HA*d-HB*d*d,B0[2]+ZT*d/DXG];
const FLY=.62;// 11.3 m in ≈ .6 s (≈ 65 km/h): calm, not a blast
const dAt=(tau:number)=>{const u=clamp(tau/FLY);return DXG*u*(1.15-.15*u);};
const GOAL_PT=flight(DXG),NET_HIT:V3=[1.8,.22,3.05],REST:V3=[1.45,.11,2.9],IN_NET=FLY+.14;
function ballAt(tau:number):V3{
 if(tau<=0)return B0;
 if(tau<FLY)return flight(dAt(tau));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.5),h=NET_HIT[1]*(1-u)+.11*u;
 return[lerp(NET_HIT[0],REST[0],easeOut(u)),Math.max(.11,h),lerp(NET_HIT[2],REST[2],u)];
}
/** ball spin (panel rotation): topspin off the side-foot, then the roll */
const spinAt=(tau:number)=>tau<=0?0:TAU*5*Math.min(tau,IN_NET)+TAU*1.4*Math.max(0,Math.min(tau,IN_NET+.6)-IN_NET);
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:.75*Math.exp(-(tau-IN_NET+.03)*2.8)*(1+.3*Math.sin((tau-IN_NET)*12));

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.55],[K,.45]];
/** Milan all in white (red-and-black stripe on the shorts → trim) */
const milan=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:R,numberInk:K,hairStyle:'short',...o});
/** Juventus in black-and-white stripes, black shorts and socks */
const juve=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:[K,.95],shorts:[K,.95],socks:[K,.95],boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const SHEVA_B={height:1.83,bulk:1};
const SHEVA_ST=milan({number:7,hair:[K,.7],build:SHEVA_B,seed:7});
const BUFFON_ST:AthleteStyle={shirt:[K,.5],shorts:[K,.72],socks:[K,.5],boots:K,skin:SKIN_L,hair:[K,.88],line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',build:{height:1.91},seed:1};
const DIDA_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_D,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'bald',number:12,numberInk:K,build:{height:1.95},seed:12};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,hairStyle:'balding',build:{height:1.84},seed:30};

// ---------------------------------------------------------------- Shevchenko: the ball down, the walk back, the calm wait, the short run, the strike, wheeling away
/** approach from his LEFT (≈ 25°), so the right foot comes through across the ball toward the corner on his right */
const DIRN=Math.hypot(1,.47),DIR:[number,number]=[1/DIRN,.47/DIRN];
const YAW_P=yawTo(0,0,DIR[0],DIR[1]);
const SD=.9,RUN_END=-STRIKE_CONTACT*SD,T_RUN0=-1.3,RUN_L=2.8,STRIKE_L=1.3,G_MARK=-(RUN_L+STRIKE_L),G_BALL=-.35;
const POWER=.62;// a placed side-foot: a medium backswing and follow-through
/** where his pelvis stands at contact so the toe of his RIGHT boot meets the back of the ball (solved once, FK) */
const PC:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{power:POWER}),SHEVA_B,{x:0,z:0,yaw:YAW_P}),toe:[number,number]=[B0[0]-DIR[0]*.1,B0[2]-DIR[1]*.1];return[toe[0]-sk.rToe[0],toe[1]-sk.rToe[2]];})();
const gPos=(g:number):[number,number]=>[PC[0]+DIR[0]*g,PC[1]+DIR[1]*g];
/** crouched over the ball, setting it on the spot */
const P_PLACE=posed({lHipF:70,rHipF:40,lKnee:100,rKnee:60,lean:40,pitch:12,neckP:30,lShF:62,rShF:66,lElb:18,rElb:20,lShA:14,rShA:12,lHand:.8,rHand:.8});
/** at his mark: upright, hands on hips-ish (elbows out), weight even, eyes up on the goal */
const P_WAIT=posed({lHipF:-2,rHipF:8,lKnee:10,rKnee:14,lAnk:0,rAnk:-4,lean:4,pitch:1,neckP:-4,lShA:30,rShA:30,lShF:-8,rShF:-8,lElb:70,rElb:70,lShR:30,rShR:30});
const P_GO=posed({lHipF:-18,rHipF:22,lKnee:24,rKnee:30,lAnk:16,rAnk:-6,lean:14,pitch:4,neckP:8,lShA:22,rShA:20,lShF:-12,rShF:14,lElb:40,rElb:46,twist:-8});
const walkPose=(ph:number)=>{const p=blendPose(runCycle(ph,{speed:0,stride:.55}),P_WAIT,.3);p.air=0;return p;};
/** the celebration: after the strike he wheels away to his LEFT (−z), arms out, and stops where the team-mates catch him */
const T_WHEEL=.42;
const CEL:[number,number][]=(()=>{const s0=gPos(.55);return[s0,[s0[0]-1.6,s0[1]-2.8],[-14.5,-7.5],[-18.5,-12.5],[-22,-16.5]];})();
const CEL_L=(()=>{let l=0;for(let i=1;i<CEL.length;i++)l+=Math.hypot(CEL[i][0]-CEL[i-1][0],CEL[i][1]-CEL[i-1][1]);return l;})();
const T_STOP=T_WHEEL+CEL_L*1.57/7.2;
function celAt(d:number):[number,number]{let r=clamp(d,0,CEL_L);for(let i=1;i<CEL.length;i++){const a=CEL[i-1],b=CEL[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(r<=l||i===CEL.length-1){const u=clamp(r/l);return[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];}r-=l;}return CEL[CEL.length-1];}
const celD=(tau:number)=>CEL_L*sm(T_WHEEL,T_STOP,tau,easeInOutSine);
const runU=(tau:number)=>clamp((tau-T_RUN0)/(RUN_END-T_RUN0));
function runG(tau:number){const u=runU(tau);return G_MARK+RUN_L*(1.15*u-.15*u*u);}
function shevPose(tau:number,walk=1,it=0):Pose{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk;if(u<.12)return blendPose(P_PLACE,stand(),sm(0,.12,u));
   const d=Math.abs(G_MARK-G_BALL)*sm(.12,.82,u,linear);let p=walkPose(d*.72);if(u>.82)p=blendPose(p,P_WAIT,sm(.82,1,u));return p;}
  const br=.5+.5*Math.sin(it*2.1),p=blendPose(P_WAIT,P_GO,sm(T_RUN0-.35,T_RUN0,tau));p.lean+=.02*br;p.neckP+=.03*br;return p;}
 if(tau<RUN_END){const u=runU(tau);return blendPose(P_GO,runCycle(1.9*Math.pow(u,.9),{speed:.55+.1*(1-u)}),sm(0,.2,u));}
 const us=STRIKE_CONTACT+tau/SD,run=runCycle(1.9+(tau-RUN_END)*1.4,{speed:.5});
 let p=blendPose(run,strike(Math.min(1,us),{power:POWER}),sm(RUN_END,RUN_END+.12,tau));
 // side-foot: the kicking foot opens out through contact, the head stays down over the ball
 const sf=sm(-.25,0,tau)*(1-sm(.2,.45,tau));p.rHipR+=.6*sf;p.neckP+=.15*sf;
 // wheeling away to his left: the airplane-arms run, then arms up when they reach him
 if(tau>T_WHEEL-.12){const ph=(tau-T_WHEEL)*1.45;let c=celebrate(ph,{kind:'run'});c.lShA=Math.min(c.lShA,1.75);c.rShA=Math.min(c.rShA,1.75);
  const slow=sm(T_STOP-.9,T_STOP,tau);if(slow>0)c=blendPose(c,celebrate((tau-T_STOP)*.9+.8,{kind:'arms'}),slow);
  p=blendPose(p,c,sm(T_WHEEL-.12,T_WHEEL+.3,tau));}
 return p;
}
function shevPlace(tau:number,walk=1):Place{
 if(tau<=T_RUN0){
  if(walk<1){const u=walk,g=lerp(G_BALL,G_MARK,sm(.12,.82,u,linear)),[x,z]=gPos(g);
   return{x,z,yaw:u<.12?YAW_P:lerpAng(lerpAng(YAW_P,YAW_P+Math.PI,sm(.08,.2,u)),YAW_P+TAU,sm(.8,1,u))};}
  const[x,z]=gPos(G_MARK);return{x,z,yaw:YAW_P};}
 if(tau<T_WHEEL){let g:number;
  if(tau<RUN_END)g=runG(tau);
  else if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
  else g=.55*(1-Math.pow(1-clamp(tau/T_WHEEL),2));
  const[x,z]=gPos(g);return{x,z,yaw:YAW_P};}
 const d=celD(tau),[x,z]=celAt(d),[x2,z2]=celAt(d+1.2);
 const head=d<CEL_L-.6?yawTo(x,z,x2,z2):yawTo(CEL[3][0],CEL[3][1],CEL[4][0],CEL[4][1]);
 return{x,z,yaw:lerpAng(YAW_P,head,sm(T_WHEEL,T_WHEEL+.45,tau,easeInOutSine))};
}

// ---------------------------------------------------------------- Buffon: set on his line, a little bounce, then the dive to his right — the wrong way
const T_DIVE=-.1,DIVE_S=1.1,BUF_X=-.1;
function buffonAt(tau:number,it:number):{pose:Pose;place:Place}{
 let p=keeperSet(it*1.1);
 if(tau>T_DIVE-.45)p=blendPose(p,keeperSet(.75),sm(T_DIVE-.45,T_DIVE,tau));
 if(tau>T_DIVE)p=blendPose(p,keeperDive(clamp((tau-T_DIVE)/DIVE_S),{side:'r',height:.35}),sm(T_DIVE,T_DIVE+.06,tau));
 // on the ground he turns his head to see it in the other corner, then drops it
 if(tau>1)p.neckY-=.9*sm(1,1.5,tau);
 const sway=.12*Math.sin(it*1.3)*(1-sm(T_DIVE-.6,T_DIVE,tau));
 return{pose:p,place:{x:BUF_X,z:sway,yaw:Math.PI}};
}

// ---------------------------------------------------------------- everyone else
type Role='dida'|'ref'|'ar'|'mil'|'juv'|'gattuso'|'inzaghi';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;phase:number;k:number};
/** the players linked in the centre circle (Milan nearer the far side, Juventus nearer the live camera) */
const LINE:Actor[]=[];
{const mil=[[13,'short'],[3,'long'],[4,'short'],[25,'short'],[8,'short'],[20,'bald'],[27,'short'],[23,'curly'],[9,'short']] as [number,string][];
 const juv=[[21,'bald'],[2,'short'],[4,'short'],[15,'short'],[10,'short'],[17,'short']] as [number,string][];
 mil.forEach(([n,h],i)=>{const role:Role=n===8?'gattuso':n===9?'inzaghi':'mil';LINE.push({name:'Milan '+n,role,st:milan({number:n,hairStyle:h as AthleteStyle['hairStyle'],skin:n===20||n===27||n===25?SKIN_D:SKIN_L,build:{height:1.8+.02*(i%3)},seed:40+i,detail:'low'}),x:-52.5+.2*(i%2),z:.8+i*.62,phase:i*.23,k:i});});
 juv.forEach(([n,h],i)=>LINE.push({name:'Juventus '+n,role:'juv',st:juve({number:n,hairStyle:h as AthleteStyle['hairStyle'],skin:n===21?SKIN_D:SKIN_L,build:{height:1.8+.03*(i%2)},seed:60+i,detail:'low'}),x:-52.5-.2*(i%2),z:-1.4-i*.62,phase:i*.31,k:i}));}
const ACTORS:Actor[]=[
 {name:'Dida',role:'dida',st:DIDA_ST,x:.4,z:-20.4,phase:.2,k:0},
 {name:'Merk',role:'ref',st:REF_ST,x:-7.2,z:-10.2,phase:.6,k:0},
 {name:'assistant',role:'ar',st:{...REF_ST,hairStyle:'short',seed:31},x:.6,z:9.4,phase:.1,k:0},
 ...LINE,
];
const LINKED=posed({lShA:26,rShA:26,lShF:-6,rShF:-6,lElb:12,rElb:12,lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:6,neckP:4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
/** where the chasers catch him: a loose ring round his stopping point */
const CATCH=(k:number):[number,number]=>{const a=k*2.1+.4,e=CEL[CEL.length-1];return[e[0]+Math.cos(a)*1.1,e[1]+Math.sin(a)*1.1];};
/** a sprinter from (x,z) toward a target, leaving at t0 at v m/s; returns place, running phase and whether he has arrived */
function sprint(x:number,z:number,tx:number,tz:number,t0:number,v:number,tau:number,ph:number){
 const L=Math.hypot(tx-x,tz-z),T=L/v+.35,u=clamp((tau-t0)/T),e=u*u*(3-2*u)*.5+u*.5;return{x:lerp(x,tx,e),z:lerp(z,tz,e),yaw:yawTo(x,z,tx,tz),run:u>0&&u<1,done:u>=1,phase:Math.max(0,tau-t0)*1.55+ph};}
/** one actor's pose + place at τ (it = idle clock) */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const toBall=yawTo(a.x,a.z,B0[0],B0[2]),br=Math.sin(it*2.1+a.phase*TAU),goal=sm(IN_NET-.1,IN_NET+.3,tau);
 const runner=(tx:number,tz:number,t0:number,v:number,idle:Pose)=>{const r=sprint(a.x,a.z,tx,tz,t0,v,tau,a.phase);let p=idle;
  if(r.run||r.done)p=blendPose(idle,runCycle(r.phase,{speed:.95}),sm(t0,t0+.3,tau));if(r.done)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(0,.4,tau-t0-Math.hypot(tx-a.x,tz-a.z)/v-.35));
  return{pose:p,place:{x:r.x,z:r.z,yaw:r.run||r.done?lerpAng(toBall,r.yaw,sm(t0,t0+.3,tau)):toBall}};};
 switch(a.role){
  case 'dida':{const idle=blendPose(stand(),LINKED,.3+.1*br),c=CATCH(7);return runner(c[0],c[1],IN_NET+.15,7.4,idle);}
  case 'ref':{const p=blendPose(stand(),LINKED,.2+.1*br);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,.5)}};}
  case 'ar':{const p=blendPose(stand(),LINKED,.2);return{pose:p,place:{x:a.x,z:a.z,yaw:yawTo(a.x,a.z,0,0)}};}
  case 'gattuso':case 'inzaghi':{// Gattuso sprints at the Milan fans in the Stretford End, Inzaghi after him
   const idle=blendPose(LINKED,stand(),.2+.1*br),g=a.role==='gattuso';return runner(-104,g?6:5,IN_NET+(g?.2:.55),g?8.4:8.8,idle);}
  case 'mil':{const idle=blendPose(LINKED,stand(),.2+.1*br),c=CATCH(a.k);return runner(c[0],c[1],IN_NET+.2+.08*a.k,8.6,idle);}
  default:{let p=blendPose(LINKED,stand(),.2+.1*br);if(goal>0)p=blendPose(p,SLUMP,goal*.85);return{pose:p,place:{x:a.x,z:a.z,yaw:toBall}};}
 }
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hem trail), smear = halftone echo + speed lines on fast limbs (the run, the strike, the dive, the sprints). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>0&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;crew?:boolean;walk?:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';line?:boolean};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(!hero&&px<120)return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 const walk=e.walk??1;
 {const pl=shevPlace(tp,walk),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=shevPose(tp,walk,e.it),prev={pose:shevPose(tpPrev,walk,e.it-1/12),place:shevPlace(tpPrev,walk)};
  drawPlayer(s,pose,c,detailFor(SHEVA_ST,d,true),pl,prev,!!e.smear&&tp>T_RUN0+.2);}});}
 {const cur=buffonAt(tp,e.it),d=visible(cur.place);if(d>0)items.push({d,draw:()=>{const prev=buffonAt(tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(BUFFON_ST,d,true),cur.place,prev,!!e.smear&&tp>T_DIVE&&tp<.7);}});}
 for(const a of ACTORS){if(e.crew===false&&a.role==='ref')continue;if(!e.line&&(a.role==='juv'||a.role==='mil'||a.role==='gattuso'||a.role==='inzaghi'))continue;const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev,!!e.smear&&a.role!=='juv'&&tp>IN_NET);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const sxz=(tau:number,walk=1):V3=>{const p=shevPlace(tau,walk);return[p.x??0,0,p.z??0];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera from the −z side (goal on the LEFT), real time
/** contact lands so the ball rolls in just after "the ball rolls" — and never before the run has started after "A short run" */
const tS1=()=>Math.max(CUE(0,'the ball rolls')+.2-FLY,CUE(0,'A short run')+.15-T_RUN0);
const tau1=(t:number)=>Math.max(T_RUN0-4,t-tS1());
/** the walk back to his mark: from "walks back" until well before the run */
const walk1=(t:number)=>{const a=CUE(0,'sets the ball')+.45,b=Math.max(a+.8,Math.min(a+2.6,tS1()+T_RUN0-.9));return sm(a,b,t,linear);};
const P1:V3=[-38,21,-62];
function cam1(t:number):Cam{
 const tau=tau1(t),tRun=tS1()+T_RUN0,w=walk1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-46,13,34],fov:48})],
  [CUE(0,'penalties')-.2,1.1,()=>({P:P1,T:[-52.5,1,.2],fov:9.5})],
  [CUE(0,'Score this')-.15,.9,()=>({P:P1,T:[-52.5,1,3.4],fov:6.2})],
  [CUE(0,'Andriy')-.3,1,()=>({P:P1,T:add3(sxz(T_RUN0-2,Math.max(.02,w)),[0,1,0]),fov:5.2})],
  [CUE(0,'sets the ball')-.1,.8,()=>({P:P1,T:add3(sxz(T_RUN0-.5,w),[.6,1,0]),fov:6})],
  [CUE(0,'Buffon waits')-.25,.8,()=>({P:P1,T:[BUF_X,1.25,0],fov:4.4})],
  [Math.max(tRun-.45,CUE(0,'Buffon waits')+.5),.8,()=>({P:P1,T:[-6.2,1.1,.4],fov:14})],
  [tS1()+IN_NET+.1,.9,()=>({P:P1,T:[-2.5,1,1.2],fov:11})],
  [tS1()+T_WHEEL+.6,1.4,()=>({P:P1,T:add3(sxz(tau),[-1.5,1,-1]),fov:13})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+IN_NET;
  const walk=walk1(tt);
  stadium(s,c,t,[1,2,3],{roar:sm(tN-.1,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,walk,smear:true,minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid',line:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:14,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay at pitch level, side-on from his right: the still head, the side-foot, the wrong way
const tau2=(t:number)=>key(t,mono([[0,T_RUN0-.7],[CUE(1,'No rush'),T_RUN0-.35],[CUE(1,'He picked'),T_RUN0-.05],[CUE(1,'sticks to it'),RUN_END+.05],[CUE(1,'Buffon dives'),.02],[CUE(1,'the ball goes'),.3],[CUE(1,'other way'),FLY],[SECS(1),IN_NET+.7]]),linear);
const E2:V3=[-12.5,.85,12.5];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY));
 return plan(t,[
  [0,0,()=>({P:E2,T:add3(sxz(T_RUN0),[.8,1,0]),fov:13})],
  [CUE(1,'He picked')-.3,1,()=>({P:E2,T:add3(sxz(T_RUN0),[1.4,1.05,0]),fov:11.5})],
  [CUE(1,'sticks to it')-.2,.9,()=>({P:add3(E2,[.8,0,0]),T:add3(sxz(Math.min(tau,0)),[.9,.95,0]),fov:14})],
  [CUE(1,'Buffon dives')-.25,.9,()=>({P:add3(E2,[2.2,.1,0]),T:mix3(b,[-.6,.9,.3],.6),fov:15})],
  [CUE(1,'other way')-.2,1.1,()=>({P:add3(E2,[3.2,.1,0]),T:[-.3,.8,.8],fov:13.5})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,3],{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET+.1,IN_NET+.3,tau),dim:.2});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the replay trail: the low drive so far, fading at the tail (under the players)
  if(tau>.02&&tau<IN_NET+.7){const pts=pathPts(c,Math.max(0,tau-.5),Math.min(tau,FLY+.001),20),fade=1-sm(FLY+.1,IN_NET+.7,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,FLY)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12});
  // "he picked his spot": a dashed yellow sight line from his eyes toward the corner on his right, held until the strike
  const tP=CUE(1,'He picked'),sl=sm(tP-.1,tP+.5,t,easeOutBack)*(1-sm(-.25,0,tau));
  if(sl>.02){const sk=solve(shevPose(tp,1,tt),SHEVA_B,shevPlace(tp)),a=pr(c,sk.face),b=pr(c,[0,.35,ZT]);
   if(a&&b){const rb=new Path2D(),n=10,w=Math.max(8,kAt(c,sk.face)*.04),u1=clamp(sl);for(let i=0;i<n;i++){const u0=i/n*u1,ue=(i+.6)/n*u1;rb.addPath(ribbon([[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)]],w,{seed:13+i,taper:.2,wobble:0}));}
    s.knockout(rb,.95);s.fill(Y,rb,.95);s.stroke(K,rb,1.8,.8);}}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 3 · high in the Juventus end, over the fans' heads: it rolls in below them, then he wheels away
const tau3=(t:number)=>key(t,mono([[0,.04],[CUE(2,'rolls in'),FLY+.06],[CUE(2,'Shevchenko wheels'),T_WHEEL+.35],[CUE(2,'team-mates'),2.6],[SECS(2),2.6+(SECS(2)-CUE(2,'team-mates'))*1.05]]),linear);
const E3:V3=[22,15.2,-6.5];
/** the Juventus fans in the rows in front of the lens (a band along the bottom of the picture, sized to the sheet, so every window keeps them the same): dark heads and shoulders, a few black-and-white scarves held up; they sink at the goal */
function fans(s:Sheet,t:number,sink:number){
 const body=new Path2D(),scarf=new Path2D(),stripe=new Path2D(),tt=twos(t),H=s.H,W=s.W,bot=H/2;
 for(let j=0;j<2;j++){const k=H*(.2-.05*j),n=Math.ceil(W/(k*.62))+2;for(let i=0;i<n;i++){const x=-W/2+(i+(j?.5:0)+(hash(i+j*29,3)-.5)*.25)*k*.62,bob=Math.sin(tt*3+i*1.7+j)*k*.025;
  const y=bot+k*(.12+.16*j),hy=y-k*(.52-.1*sink)+bob;
  body.addPath(polyPath([[x-k*.3,y+k*.5],[x-k*.27,hy+k*.3],[x-k*.08,hy+k*.2],[x+k*.08,hy+k*.2],[x+k*.27,hy+k*.3],[x+k*.3,y+k*.5]],true));
  {const hd:Pt[]=[];for(let m=0;m<10;m++){const a=m/10*TAU;hd.push([x+Math.cos(a)*k*.11,hy+Math.sin(a)*k*.13]);}body.addPath(polyPath(hd,true));}
  if(hash(i*3+j,7)>.72&&sink<.85){const up=(1-sink)*k*.28,w=k*.42,top=hy-up-k*.16;const Q:Pt[]=[[x-w/2,top],[x+w/2,top+k*.04],[x+w/2,top+k*.13],[x-w/2,top+k*.09]];scarf.addPath(polyPath(Q,true));
   for(let m=0;m<5;m+=2){const u0=m/5,u1=(m+1)/5;stripe.addPath(polyPath([[lerp(Q[0][0],Q[1][0],u0),lerp(Q[0][1],Q[1][1],u0)],[lerp(Q[0][0],Q[1][0],u1),lerp(Q[0][1],Q[1][1],u1)],[lerp(Q[3][0],Q[2][0],u1),lerp(Q[3][1],Q[2][1],u1)],[lerp(Q[3][0],Q[2][0],u0),lerp(Q[3][1],Q[2][1],u0)]],true));}}}}
 s.knockout(scarf);s.fill(K,stripe,.95);s.stroke(K,scarf,2,.8);s.knockout(body,.9);s.fill(K,body,.9);s.tone(R,body,.22);
}
function cam3v(t:number):Cam{
 const tau=tau3(t),at=sxz(tau);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-4,-.6,1.4],fov:17})],
  [CUE(2,'rolls in')-.2,.8,()=>({P:E3,T:[-2.5,-.7,1.3],fov:16})],
  [CUE(2,'Shevchenko wheels')-.25,1.1,()=>({P:E3,T:add3(at,[-1,-1.2,0]),fov:17})],
  [CUE(2,'team-mates')-.2,1.3,()=>({P:E3,T:add3(at,[-4,-1.8,2]),fov:24})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12);
  stadium(s,c,t,[0,2,3],{roar:.3+.7*sm(IN_NET,IN_NET+.4,tau),flash:.3*sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:10,line:true});
  fans(s,t,sm(IN_NET,IN_NET+.6,tau));
  const tW=CUE(2,'team-mates'),wc=sm(tW-.05,tW+.4,t);if(wc>0&&tau>2){const q=pr(c,add3(sxz(tau),[0,1.2,0]));if(q)sparkBurst(s,Y,q[0],q[1],90+120*wc,{n:11,seed:9,g:easeOutBack(wc),width:12});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(sxz(tau3(t)),[0,1,0]))??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:4,
};

// ---------------------------------------------------------------- 4 · the lesson, pitch-side across the box: calm routine → pick your spot → trust it
const tau4=(t:number)=>key(t,mono([[0,T_RUN0-1],[CUE(3,'Pick your spot'),T_RUN0-.4],[CUE(3,'trust it'),T_RUN0+.05],[CUE(3,'trust it')+1.4,IN_NET+.1],[SECS(3),IN_NET+.6]]),linear);
const walk4=(t:number)=>sm(.1,Math.max(.9,CUE(3,'Keep a calm')+1.1),t,linear);
const TARGET:V3=[.02,.4,ZT];
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-5.4,3.6,-18.6],T:[-12.5,1.8,-1.4],fov:22})],
  [CUE(3,'Pick your spot')-.25,1.1,()=>({P:[-5,3.8,-19],T:[-7.2,2.7,.6],fov:46})],
  [CUE(3,'trust it')+.2,1.2,()=>({P:[-4.8,3.8,-19],T:[-6.6,2.6,.8],fov:44})],
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
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12),walk=walk4(tt);
  const tR=CUE(3,'Keep a calm'),tS=CUE(3,'Pick your spot'),tT=CUE(3,'trust it');
  stadium(s,c,t,[0,2,3],{dim:.15});
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · a calm routine: his footsteps back to the mark, counted out, then a slow breathing ring round him
  const rt=sm(tR-.2,tR+.3,t)*(1-sm(tT+.3,tT+.9,t));
  if(rt>.02){const fp=new Path2D(),n=5;for(let i=0;i<n;i++){const u=(i+.5)/n;if(walk<.12+.7*u)break;const g=lerp(G_BALL,G_MARK,u),[x,z]=gPos(g),sd=(i%2?.14:-.14),q:Pt[]=[];
    for(let k=0;k<10;k++){const a=k/10*TAU;const p=pr(c,[x+Math.cos(a)*.16,.01,z+sd+Math.sin(a)*.08]);if(p)q.push(p);}if(q.length>6)fp.addPath(polyPath(q,true));}
   s.knockout(fp,.9*rt);s.fill(Y,fp,.95*rt);
   if(walk>.95){const m=sxz(T_RUN0),br=.5+.5*Math.sin((t-tR)*2.4),ring:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,rr=.8+.18*br,p=pr(c,[m[0]+Math.cos(a)*rr,.02,m[2]+Math.sin(a)*rr]);if(p)ring.push(p);}
    if(ring.length>24){const rb=ribbon(ring,Math.max(6,kAt(c,m)*.05),{close:true,seed:43,taper:0,wobble:.6});s.knockout(rb,.85*rt);s.fill(Y,rb,.95*rt);}}}
  // 2 · pick your spot: a yellow target in the corner and a dashed sight line from his eyes to it
  const pk=sm(tS-.15,tS+.35,t,easeOutBack);
  if(pk>.02){const ring:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU,p=pr(c,[TARGET[0],TARGET[1]+Math.sin(a)*.55*Math.min(1,pk),TARGET[2]+Math.cos(a)*.55*Math.min(1,pk)]);if(p)ring.push(p);}
   if(ring.length>20){const rr=ribbon(ring,Math.max(9,kAt(c,TARGET)*.11),{close:true,seed:11,taper:0,wobble:1});s.knockout(rr,.9);s.fill(Y,rr,.95);s.stroke(K,rr,1.8,.8);}}
  // 3 · trust it: the yellow line the ball will follow, drawn as it goes (under the players)
  const tv=sm(tT-.1,tT+.3,t);
  if(tv>.02){const all=pathPts(c,0,FLY,28),pts=tau>0?partial(all,clamp(tau/FLY)):all.slice(0,2),w=Math.max(9,kAt(c,[-5,.3,1.2])*.1);if(pts.length>1){s.knockout(ribbon(pts.length>2?pts:all,w*1.6,{taper:.3,pressure:.2,wobble:0}),.4*tv);s.fill(Y,ribbon(pts.length>2?pts:all,w,{taper:.3,pressure:.2,wobble:0}),.95*tv);}}
  play(s,c,tau,tp,tpp,{it:tt,walk,crew:false,smear:true,minBall:13});
  // his eyes on the spot until he runs
  const sl=pk*(1-sm(T_RUN0-.1,T_RUN0+.2,tau));
  if(sl>.02){const sk=solve(shevPose(tp,walk,tt),SHEVA_B,shevPlace(tp,walk)),a=pr(c,sk.face),b=pr(c,TARGET);
   if(a&&b){const rb=new Path2D(),n=9,w=Math.max(8,kAt(c,sk.face)*.045),u1=clamp(sl);for(let i=0;i<n;i++){const u0=i/n*u1,ue=(i+.62)/n*u1;rb.addPath(ribbon([[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],[lerp(a[0],b[0],ue),lerp(a[1],b[1],ue)]],w,{seed:13+i,taper:.2,wobble:0}));}
    s.knockout(rb,.95);s.fill(Y,rb,.95);s.stroke(K,rb,1.8,.8);}}
  // the keeper goes the other way: a red arrow along his dive
  const dv=sm(T_DIVE,T_DIVE+.3,tau,easeOutBack);
  if(dv>.02){const a:V3=[BUF_X-.3,.9,0],b:V3=[BUF_X-.3,.5,-2.4*dv];arrow3(s,c,[a,mix3(a,b,.5),b],Math.max(8,kAt(c,a)*.05),R,.95);}
  // it goes in where he chose: a yellow burst in the target
  const gd=sm(IN_NET-.05,IN_NET+.3,tau);if(gd>0){const q=pr(c,TARGET);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,TARGET)*1.1)*easeOutBack(gd),{n:10,seed:61,width:Math.max(6,kAt(c,TARGET)*.05)});}
 },
 still:5,
};

const film:RisoStory={
 id:'shevchenko-penalty-2003',format:'11v11',title:"Shevchenko's winning penalty v Juventus",
 theme:'Penalties: keep a calm routine, pick your spot early and trust it — even when the keeper moves',
 ageNote:'Juventus 0–0 AC Milan (Milan won 3–2 on penalties), UEFA Champions League final, Old Trafford, Manchester, 28 May 2003. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a calm, low side-foot — a yellow line skimming into a little target ring, the ball rolling along it. Reduced motion: the still. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.6)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=12;i++){const k=i/12*u;pts.push([x+150*k,y-26*Math.sin(Math.PI*k)]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,12,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const ring:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;ring.push([x+150+Math.cos(a)*30,y+Math.sin(a)*30]);}
  s.fill(Y,ribbon(ring,8,{close:true,seed,taper:0,wobble:1}),.9*fade);
  const e=pts[pts.length-1];if(age>.45&&age<.75)sparkBurst(s,Y,x+150,y,60,{n:7,seed,g:clamp((age-.45)/.3),width:8});
  footballPanels(s,e[0],e[1],28,{rot:age*9+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
