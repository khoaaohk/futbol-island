/** Willian Dorn — "the goleiro who plays out": a signature-move riso film (iconic plays, FUTSAL; Willian is a goleiro).
 *
 * WHO: Willian Felipe Dorn (b. 17 Dec 1994, Jaraguá do Sul, Brazil; 1.84 m), goalkeeper: Joinville 2013–2023 (11 seasons, 158 games,
 *  9 goals), MFK Norilsk Nickel (Russia) from 2024; Brazil from 2021 (World Cups 2021 and 2024, No. 3 in both squads); Futsal Planet's
 *  best goalkeeper in the world 2023; Golden Glove of the 2024 FIFA Futsal World Cup. Matches the card: lib/town/playerAppearance.json
 *  country "Brazil"; lib/town/playerBios.json "Brazilian goleiro who spent 11 seasons at Joinville, was named the world's best futsal keeper
 *  for 2023 and won the 2024 World Cup". (No namesake problem: not the footballer Willian Borges da Silva.)
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — "the goleiro who plays out" (template sweeper_keeper; lesson "A
 *  futsal keeper is a fifth outfield player: be ready to pass with your feet") — not one match. No written source we could reach describes
 *  HOW he played one particular ball out (Wikipedia gives clubs and honours; FIFA's match timeline logs events, not techniques), so the
 *  film follows the brief's honest FALLBACK. The real-match chapter is the biggest match he played: the 2024 FIFA Futsal World Cup FINAL,
 *  Brazil 2–1 Argentina, 6 Oct 2024, 20:00, Humo Arena, Tashkent. It shows ONLY confirmed things: the arena, the teams, the hanging board
 *  going 0–0 → 2–1 (the goals happen while the camera is on the board, no goal is staged), Brazil celebrating as champions, Willian (No. 3)
 *  with them, a broadcast graphic of his TWO attempts on goal in that final (FIFA's timeline: "25'30" / 37'14" WILLIAN (Brazil) attempts an
 *  effort on goal" — a keeper who comes out to play; HOW those two efforts came is unknown and is NOT shown), and the Golden Glove.
 *  The playing-out itself lives in clearly labelled demonstration chapters ("This is how he plays out"; training bibs, an empty arena; no
 *  match claimed). The Edu film already teaches the keeper's quick THROW; this film teaches the keeper passing with his FEET (goleiro-linha).
 *  (Match choice: the 2024 final is not used by any other futsal film — Gauna uses the 2024 semi-final, João Victor the round of 16, Catela/
 *  Mykytiuk/Touré/Sid Belhaj/Higor/Pito other 2024 games or other matches; Guitta's film (the other Brazil keeper) uses the 2019 UEFA final.)
 *  (Camera plan chosen to differ from every other futsal film — main stand, gantry end-on, corner, goal-line, net, knee-high, far touchline,
 *  ball's-eye on the floor, orbit, crane: here chapter 1 is a flying CABLE-CAM over the court that glides in diagonally from above a corner,
 *  swoops up to the hanging board and dives down to the celebration; chapter 2 is a PRESSER'S-EYE camera that runs behind the attacker as he
 *  presses the keeper and whips round when the ball goes past him; chapter 3 is a BALL-CAM that rides the pass along the floor, just behind
 *  the ball, from the keeper's foot to the free player; chapter 4 is a RECEIVER'S-EYE camera — the kid keeper passes to us.)
 *  1  LIVE (the cable-cam, real time): kick-off shape at 0–0 (nobody identified: which keeper started is not known) → the camera swoops up to
 *     the board, which runs 1–0, 2–0, 2–1 and the clock to 40:00 (a time cut hidden on the board) → it dives down: Brazil jump together,
 *     Argentina's heads drop; Willian, No. 3, runs in from the bench side (whether he was on court at the whistle is not known) and is ringed;
 *     on "two shots" a broadcast bubble pops two ball icons; on "Golden Glove" a yellow glove rises over him.
 *  2  HOW HE PLAYS OUT (demonstration, real time; the PRESSER'S-EYE camera; Willian in his red keeper top, his team in yellow bibs, the
 *     opponents in blue bibs): the fixo passes back; one attacker leaves the winger he was marking and sprints at the keeper; Willian stops the
 *     ball under his RIGHT sole, looks up, and passes along the floor with the inside of his right foot to the winger the attacker left —
 *     the camera whips round after the ball. Three (keeper included) against two.
 *  3  WATCH AGAIN (slow motion; the BALL-CAM, low, riding the pass): the attacker's run (navy arrow), the free teammate (red ring), the pass
 *     flat and firm along the floor (red dashed line), right to his feet.
 *  4  YOUR TURN (lesson from the entry's `lesson`; the RECEIVER'S-EYE camera): a kid keeper stops a back pass with the sole, looks up and
 *     passes to us; a red ring on "fifth outfield player", a tick.
 * Sources (written; curl, 5 s apart, a generic User-Agent; cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Willian Dorn" (raw; wiki-willian-dorn.txt): full name, birth 17 Dec 1994 in Jaraguá do Sul, 1.84 m, goalkeeper; Joinville
 *    2013–2023 (158 apps, 9 goals), Norilsk Nickel 2024–; Brazil 2021–; World Cups 2021 and 2024; honours incl. FIFA Futsal World Cup 2024,
 *    Futsal Planet best goalkeeper 2023, 2024 World Cup Golden Glove. — https://en.wikipedia.org/wiki/Willian_Dorn
 *  - Wikipedia, "2024 FIFA Futsal World Cup" (raw, cached; wiki-2024-futsal-wc.txt): FINAL 6 October 2024, 20:00, Humo Arena, Tashkent,
 *    Brazil 2–1 Argentina (Ferrão 05'47", Rafa Santos 12'34"; Rosa 38'00"), attendance 9,029, referee Alejandro Martínez (Spain); awards:
 *    Golden Glove Willian Dorn (Brazil). — https://en.wikipedia.org/wiki/2024_FIFA_Futsal_World_Cup
 *  - Wikipedia, "2024 FIFA Futsal World Cup squads" (raw, cached): Brazil No. 3, GK, Willian Dorn, Norilsk Nickel (RUS); No. 1 Guitta,
 *    No. 2 Diego Roncáglio.
 *  - FIFA match centre API, match 400017897 (live + timeline JSON; fifa-api-bra-arg-2024-final*.json): Humo Arena, Tashkent, 6 Oct 2024,
 *    20:00 local; Brazil 2 Argentina 1; Brazil's list incl. "3 WILLIAN" (captain Dyego, No. 7); timeline "25'30" WILLIAN (Brazil) attempts an
 *    effort on goal", "37'14" WILLIAN (Brazil) attempts an effort on goal", goals as above, "39'32" GUITTA (Brazil) is booked", "40'00" The
 *    referee brings the second period to an end", "The final whistle sounds". (Its attendance field reads 10045, Wikipedia 9,029 — no figure
 *    is used.)
 *  - FIFA.com, "Dyego, Marcel and Willian win Golden Ball, Boot and Glove" (6 Oct 2024; cxm API JSON, fifa-cxm-2024-futsal-awards*.json):
 *    "adidas Golden Glove: Willian (Brazil)".
 *  - Wikipédia (pt) "Willian Dorn" was requested and does not exist (404). No other pages were fetched (6 requests in all).
 * CONFIRMED: the match, round, date, time, venue, city; Brazil 2–1 Argentina and the goal times; Brazil world champions; Willian No. 3 in
 *  Brazil's list for the final and that he made two attempts on goal in it (so he played in it); his Golden Glove; that he is a goalkeeper,
 *  1.84 m, Brazilian. The narration states only these, plus the entry's signature framed as a demonstration ("This is how he plays out").
 * INFERRED (never named in the narration): the kits (Brazil yellow shirts / blue shorts / white socks as the listed home side; Argentina
 *  sky-blue-and-white stripes, navy shorts; Willian in a red keeper top with a paper No. 3); the wood-look court and the arena's look; which
 *  end each team defended; every position in chapter 1; which keeper started, and that Willian ran in from the bench side at the whistle
 *  (the timeline also books Guitta at 39'32", so who was in goal at the end is unknown and not shown); his appearance (card data: skin 1,
 *  short hair, stubble — marked uncertain there). His kicking foot is unverified (the demonstration uses the right foot). No video was
 *  reviewed. Chapters 2–4 are teaching DEMONSTRATIONS of the signature, not footage of a particular match.
 * Technique (poses): he opens his body to the ball, reaches out and stops it dead under his right SOLE (standing knee soft, arms out for
 *  balance, eyes on the ball), then lifts his head to find the free player; the pass is a short inside-of-the-foot strike (the library's
 *  strike at low power) that keeps the ball on the floor. The attacker's press is a sprint that ends in a jab (lunge) — too late.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the passes and the sprint). Our stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z; every
 *  chapter is a yawed pinhole camera over the SAME court coordinates (X along the court −20..20, Z across 0..20), so the right foot stays the
 *  right foot from every angle.
 * Timing: cues are estimated until the lead voices it; `authored()` maps each chapter's recorded clock through the cue anchors back onto
 *  the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Brazil shirts, bibs, wood screen, lights, the Golden Glove), red (Willian's top, posts, wood screen, teaching marks),
 *  blue (Brazil shorts, Argentina stripes, the opponents' bibs), navy (key line, stands, shorts, "pressing" marks).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; crowd heads batched per ink; objects on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,circlePath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,runCycle,runCadence,stand,backpedal,lunge,keeperSet,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2024 World Cup final',text:'The 2024 Futsal World Cup final, in Tashkent. Brazil beat Argentina two one! Goalkeeper Willian, number three, even tries two shots, and wins the Golden Glove.',tail:2.4,
  cues:['The 2024','in Tashkent','Brazil beat','two one','Goalkeeper Willian','number three','even tries','two shots','wins the','Golden Glove'],heads:{'The 2024':'World Cup final 2024','two one':'2–1','two shots':'2 shots at goal','Golden Glove':'Golden Glove'}},
 {label:'How he plays out',text:'This is how he plays out. The ball comes back. Willian stops it with his sole, looks up, and passes to the free teammate. Three against two!',tail:2,
  cues:['This is how','The ball comes','Willian stops','with his sole','looks up','and passes','the free teammate','Three against'],heads:{'This is how':'How he plays out','with his sole':'Sole','looks up':'Look up','Three against':'3 v 2'}},
 {label:'Watch again: the pass',text:'Again, slowly. One attacker presses him, so a teammate is free. A flat, firm pass, right to his feet.',tail:2,
  cues:['Again','One attacker','presses him','so a teammate','A flat','firm pass','right to'],heads:{'Again':'Replay','presses him':'Pressed','so a teammate':'Free','firm pass':'Flat and firm'}},
 {label:'Your turn',text:'Your turn! A futsal keeper is a fifth outfield player: be ready to pass with your feet!',tail:2.6,
  cues:['Your turn','A futsal keeper','fifth outfield','be ready','pass with'],heads:{'fifth outfield':'5th outfield player','be ready':'Be ready','pass with':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/willian-dorn-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/willian-dorn-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/willian-dorn-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('willian-dorn: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('willian-dorn: no cue '+w);return c.at;};
const maps:number[][][]=[];
/** chapter time (recording) → authored scene time: piecewise linear through [0,0], each cue, the passage start and the end */
function authored(i:number,t:number){
 let m=maps[i];
 if(!m){const ch=CHAPTERS[i],Au=AUTH[i],raw:number[][]=[[0,0]];ch.cues.forEach((c,k)=>{if(Au.cues[k])raw.push([c.at,Au.cues[k].at]);});raw.push([ch.seconds-.65,Au.seconds-.65],[ch.seconds,Au.seconds]);
  m=[raw[0]];for(const p of raw.slice(1)){const q=m[m.length-1];if(p[0]>q[0]+.02&&p[1]>q[1]+.02&&p[0]<=ch.seconds&&(p[0]>=ch.seconds-.65||p[0]<ch.seconds-.65-.02))m.push(p);}maps[i]=m;}
 if(t<=0)return 0;for(let k=1;k<m.length;k++)if(t<=m[k][0])return m[k-1][1]+(m[k][1]-m[k-1][1])*(t-m[k-1][0])/(m[k][0]-m[k-1][0]);return m[m.length-1][1];
}
const clock=(i:number,t:number)=>({tt:authored(i,twos(t)),tc:authored(i,t)});
/** key() needs increasing times */
function mono(Kk:Key[],gap=.04):Key[]{const o:Key[]=[];for(const k of Kk){const t=o.length?Math.max(k[0] as number,(o[o.length-1][0] as number)+gap):k[0] as number;o.push([t,...k.slice(1)] as Key);}return o;}

// ---------------- camera: centre a 1566×1080 composition box on the canvas (card window or full screen) ----------------
const BOX_W=1566,BOX_H=1080;
function cam(s:Sheet,x:number,y:number,zoom:number,rot=0){
 const base=Math.min(s.W/BOX_W,s.H/BOX_H),S=zoom*base*s.arrival,c=Math.cos(rot),sn=Math.sin(rot),dx=(s.W/2-s.cx)/S,dy=(s.H/2-s.cy)/S;
 s.camera(x-(c*dx+sn*dy),y-(-sn*dx+c*dy),zoom*base/Math.max(.01,s.fit),rot);
}

// ---------------- stage: a yawed pinhole camera over the court (metres → world units); X along the court, Y up, Z across ----------------
/** camera at (x, eye, z) looking along heading a (a = 0 looks along +Z; + turns toward +X) */
type Stage={F:number;eye:number;x:number;z:number;a:number};
const NEAR=.4;
function view(st:Stage,X:number,Z:number):Pt{const dx=X-st.x,dz=Z-st.z,s=Math.sin(st.a),c=Math.cos(st.a);return[dx*c-dz*s,dx*s+dz*c];}
const depth=(st:Stage,X:number,Z:number)=>view(st,X,Z)[1];
const kAt=(st:Stage,X:number,Z:number)=>st.F/Math.max(NEAR,depth(st,X,Z));
const proj=(st:Stage,X:number,Yh:number,Z:number):Pt=>{const[l,d]=view(st,X,Z),k=st.F/Math.max(NEAR,d);return[l*k,(st.eye-Yh)*k];};
/** a stage at (x,z,eye) aimed at (tx,tz) */
const aimed=(F:number,eye:number,x:number,z:number,tx:number,tz:number):Stage=>({F,eye,x,z,a:Math.atan2(tx-x,tz-z)});
/** a 3D polygon clipped to the near plane, projected */
function poly3(st:Stage,pts:V3[]):Pt[]{
 const v=pts.map(p=>{const q=view(st,p[0],p[2]);return[q[0],p[1],q[1]] as V3;}),out:V3[]=[],n=v.length,zn=NEAR+.05;
 for(let i=0;i<n;i++){const a=v[i],b=v[(i+1)%n],ia=a[2]>=zn,ib=b[2]>=zn;if(ia)out.push(a);
  if(ia!==ib){const u=(zn-a[2])/(b[2]-a[2]);out.push([lerp(a[0],b[0],u),lerp(a[1],b[1],u),zn]);}}
 return out.map(([l,y,d])=>{const k=st.F/d;return[l*k,(st.eye-y)*k] as Pt;});
}
const floorPoly=(st:Stage,pts:Pt[])=>poly3(st,pts.map(p=>[p[0],0,p[1]] as V3));
const BALL_R=.11;
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
type XZ=[number,number];
const unit=(dx:number,dz:number):XZ=>{const l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];};

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean over the court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number}={}){const{dash=width*4.5,cov=1,progress=1}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function ringXZ(X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push([X+Math.cos(a)*r,Z+Math.sin(a)*r]);}return out;}
/** a floor polyline (X,Z) as painted strips (one clipped quad per segment) added to `into` */
function lineOn(into:Path2D,st:Stage,pts:Pt[],hw=.05){
 for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],[ux,uz]=unit(b[0]-a[0],b[1]-a[1]),nx=-uz*hw,nz=ux*hw,ex=ux*hw*.6,ez=uz*hw*.6;
  const q=floorPoly(st,[[a[0]+nx-ex,a[1]+nz-ez],[b[0]+nx+ex,b[1]+nz+ez],[b[0]-nx+ex,b[1]-nz+ez],[a[0]-nx-ex,a[1]-nz-ez]]);if(q.length>2)into.addPath(polyPath(q,true));}
}
/** a floor ring (solid or dashed) round (X,Z), grown in by g */
function floorRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1,dash=false){if(g<=.02)return;const q=floorPoly(st,ringXZ(X,Z,r*g,28));if(q.length<3)return;const p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dash?dashGaps(q,w*3.4):undefined});s.knockout(p);s.fill(ink,p,1);}
/** a floor path (X,Z points) as a dashed line with an optional head */
function floorArrow(s:Sheet,st:Stage,ink:string,pts:Pt[],w:number,seed:number,prog:number,head=true){if(prog<=.02)return;const sp=pts.map(p=>proj(st,p[0],.02,p[1]));dashed(s,ink,sp,w,seed,{dash:w*3.2,progress:prog});if(head&&prog>.9)arrowHead(s,ink,sp,w*3,clamp((prog-.9)*10));}
/** a hand-drawn ring round a screen point (knocked out first); g grows it in */
function ring2(s:Sheet,ink:string,c:Pt,rx:number,ry:number,w:number,seed:number,g=1){if(g<=.02)return;const p=ribbon(blob(c[0],c[1],rx*g,ry*g,seed,{n:22,amp:.06}),w,{seed:seed+1,close:true,wobble:1.1});s.knockout(p);s.fill(ink,p,1);}
function tick(s:Sheet,c:Pt,S:number,seed:number){if(S<=1)return;const tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 s.knockout(ribbon(tk,S*.34,{seed,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:seed+1,taper:.2,wobble:1}),.5);s.fill(R,ribbon(tk,S*.24,{seed:seed+2,taper:.2,wobble:1}));}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.x,st.eye,-st.z] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],depth(st,p[0],Z)];},scale(p:V3){return kAt(st,p[0],-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const SKIN:InkFill[]=[[Y,.84],[R,.24]];
/** Willian: 1.84 m (Wikipedia); a red long-sleeved keeper top with a paper No. 3 (kit inferred; the number is his squad number), navy
 * shorts, paper gloves, short dark hair (card: short, stubble) */
const WBUILD={height:1.84,bulk:1.02};
const WILLIAN:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:SKIN,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',number:3,numberInk:'paper',hairStyle:'short',build:WBUILD,seed:3};
/** the demonstration: the same keeper top without a number (no match is claimed) */
const WILLIAN_T:AthleteStyle={...WILLIAN,number:null,seed:4};
/** Brazil: yellow shirts, blue shorts, white socks (inferred) */
const BRA=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,skin:n%3===1?[[Y,.8],[R,.34]]:SKIN,hair:K,line:K,trim:B,hairStyle:(['short','curly','bald','short','curly','balding'] as const)[n%6],build:{height:1.7+hash(n,3)*.14},seed:40+n});
/** Argentina: sky-blue and white stripes, navy shorts (inferred) */
const ARG=(n:number):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:[B,.8],shorts:K,socks:'paper',boots:K,skin:SKIN,hair:K,line:K,trim:B,hairStyle:(['short','long','curly','short','bald'] as const)[n%5],build:{height:1.72+hash(n,5)*.12},seed:60+n});
const ARG_GK:AthleteStyle={...ARG(9),shirt:Y,pattern:'plain',shorts:Y,socks:Y,trim:K,gloves:'paper',sleeves:'long',seed:69};
const BRA_GK:AthleteStyle={...BRA(8),shirt:R,shorts:K,socks:R,trim:K,gloves:'paper',sleeves:'long',seed:48};
/** the demonstration: his team in yellow training bibs, the opponents in blue bibs (no team is claimed) */
const MATE=(n:number):AthleteStyle=>({shirt:Y,shorts:K,socks:K,boots:K,skin:n?[[Y,.8],[R,.32]]:SKIN,hair:K,line:K,trim:'paper',hairStyle:n?'curly':'balding',build:{height:1.74+n*.04},seed:80+n});
const OPP=(n:number):AthleteStyle=>({shirt:B,shorts:K,socks:K,boots:K,skin:SKIN,hair:K,line:K,trim:'paper',hairStyle:n?'bald':'short',build:{height:1.78+n*.03},seed:90+n});
const PBUILD={height:1.76};
/** chapter 4: a young keeper and a friend */
const KBUILD={height:1.44,bulk:.94};
const KID_GK:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.8],[R,.3]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',number:null,hairStyle:'ponytail',build:KBUILD,seed:111};
const KID:AthleteStyle={shirt:Y,shorts:K,socks:K,boots:K,skin:SKIN,hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.4,bulk:.92},seed:121};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** a joint of a generator's pose, in our stage coords */
function jointAt(gen:Gen,t:number,build:{height?:number;bulk?:number},j:'head'|'chest'|'rToe'|'rAn'|'pelvis'):V3{const a=gen(t),sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw));return toMine(sk[j]);}

// ---------------- the keeper's feet: a sole stop and a short inside-foot pass ----------------
/** the sole stop: standing on the left leg (knee soft), the RIGHT foot up and forward, toes pulled up so the sole sits on the ball; arms out
 * for balance, eyes on the ball */
const SOLE=posed({lHipF:12,lKnee:30,lAnk:-8,rHipF:34,rKnee:44,rAnk:-26,rHipR:6,lean:12,pitch:2,lShA:40,rShA:34,lShF:14,rShF:10,lElb:34,rElb:30,neckP:30});
/** the same, head up: he looks for the free player (neckY set per shot) */
const soleLook=(ny:number)=>({...SOLE,neckP:-.12,neckY:ny});
/** receiving: open, on the toes, arms a little out (a keeper who is ready to play) */
const READY=blendPose(stand(),keeperSet(.25),.35);
/** where the ball sits under the sole of `pose` (our coords, relative to the stance place, body turned to yaw) */
function soleBall(pose:Pose,build:{height:number;bulk?:number},yaw:number):XZ{const sk=solve(pose,build,{yaw}),a=toMine(sk.rAn),t=toMine(sk.rToe);return[a[0]*.4+t[0]*.6,a[2]*.4+t[2]*.6];}
/** where the ball sits at the right-foot strike's contact (our coords, relative to the stance place) */
function strikeBall(yaw:number,build:{height:number;bulk?:number},power:number):XZ{const sk=solve(strike(STRIKE_CONTACT,{power}),build,{yaw}),toe=toMine(sk.rToe),an=toMine(sk.rAn),d=unit(toe[0]-an[0],toe[2]-an[2]);return[toe[0]+d[0]*.07,toe[2]+d[1]*.07];}

// ---------------- the arena: wood court, both goals, four banks ----------------
const POST_N=8.5,POST_F=11.5,GH=2;
const AW={x0:-21.8,x1:21.8,z0:-1.8,z1:21.4};
type Wall={a:XZ;b:XZ;n:XZ};
const WALLS:Wall[]=[{a:[AW.x0,AW.z1],b:[AW.x1,AW.z1],n:[0,1]},{a:[AW.x0,AW.z0],b:[AW.x0,AW.z1],n:[-1,0]},{a:[AW.x1,AW.z0],b:[AW.x1,AW.z1],n:[1,0]},{a:[AW.x0,AW.z0],b:[AW.x1,AW.z0],n:[0,-1]}];
/** one bank of seats behind a wall: boards (ads, red rail), stepped rows, a crowd (heads + shirts; many Brazil yellow), roof lights */
function standBank(s:Sheet,st:Stage,w:Wall,t:number,cheer:number,flash:number,crowd:boolean){
 const{a,b,n}=w,P=(p:XZ,out:number,Yh:number):V3=>[p[0]+n[0]*out,Yh,p[1]+n[1]*out],L=Math.hypot(b[0]-a[0],b[1]-a[1]),dir:XZ=[(b[0]-a[0])/L,(b[1]-a[1])/L];
 const along=(u:number):XZ=>[a[0]+dir[0]*u,a[1]+dir[1]*u];
 const bank=poly3(st,[P(a,0,1),P(b,0,1),P(b,13,11.5),P(a,13,11.5)]);if(bank.length<3)return;
 const bp=polyPath(bank,true);s.knockout(bp);s.fill(K,bp,.42);
 const rows=new Path2D();for(let r=0;r<11;r+=2){const q=poly3(st,[P(a,r*1.2,1+r*.9),P(b,r*1.2,1+r*.9),P(b,(r+.5)*1.2,1+(r+.5)*.9),P(a,(r+.5)*1.2,1+(r+.5)*.9)]);if(q.length>2)rows.addPath(polyPath(q,true));}s.fill(K,rows,crowd?.3:.14);
 if(crowd){const heads=new Path2D(),yel=new Path2D(),blues=new Path2D(),reds=new Path2D(),tw=Math.floor(t*12);
  for(let r=0;r<10;r++)for(let u=.4+(r%2)*.42;u<L;u+=.84){const p=along(u),base=P(p,(r+.35)*1.2,1+(r+.35)*.9),[l,d]=view(st,base[0],base[2]);if(d<5||Math.abs(l)>1.5*d)continue;
   const i=Math.round(u*10)*31+r*977+Math.round((a[0]+a[1])*7),hsh=hash(i,3),k=st.F/d,jump=cheer*.35*Math.abs(Math.sin(tw*.9+hsh*6)),hx=l*k+(hsh-.5)*.3*k,hy=(st.eye-base[1]-.5-jump)*k,rr=.16*k;
   heads.moveTo(hx+rr,hy);heads.arc(hx,hy,rr,0,TAU);const body=hash(i,4),bx=hx-rr*1.3,by=hy+rr*.9,bw=rr*2.6,bh=rr*1.8;
   if(body<.36)yel.rect(bx,by,bw,bh);else if(body<.5)blues.rect(bx,by,bw,bh);else if(body<.56)reds.rect(bx,by,bw,bh);}
  s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(B,blues);s.fill(R,reds,.8);}
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let u=3;u<L;u+=7){const p=P(along(u),12,13),[l,d]=view(st,p[0],p[2]);if(d<2)continue;const k=st.F/d,lx=l*k,ly=(st.eye-p[1])*k,rr=.5*k*(1+.5*flash);
  for(let j=0;j<3;j++)lights[j].addPath(polyPath(blob(lx,ly,rr*(1+(2-j)*.8),rr*(1+(2-j)*.8)*.7,40+Math.round(u)+j,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
 const bd=poly3(st,[P(a,0,0),P(b,0,0),P(b,0,1),P(a,0,1)]);if(bd.length>2){const bdp=polyPath(bd,true);s.knockout(bdp);s.fill(K,bdp,.8);}
 const ads=new Path2D();for(let u=.4;u<L-2;u+=3){const p0=along(u),p1=along(u+2.2),q=poly3(st,[P(p0,-.01,.22),P(p1,-.01,.22),P(p1,-.01,.76),P(p0,-.01,.76)]);if(q.length>2)ads.addPath(polyPath(q,true));}s.fill(Y,ads,.75);
 const rail=poly3(st,[P(a,-.01,.94),P(b,-.01,.94),P(b,-.01,1.04),P(a,-.01,1.04)]);if(rail.length>2)s.fill(R,polyPath(rail,true));
}
/** the arena: roof, the banks the camera looks at (far first), run-off, the wood court, lines */
function arena(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;crowd?:boolean}={}){
 const{cheer=0,flash=0,crowd=true}=o,span=20000;
 s.fill(K,rectPath(-span,-span,span*2,span*2),.72);
 WALLS.filter(w=>(st.x-w.a[0])*w.n[0]+(st.z-w.a[1])*w.n[1]<0).map(w=>({w,d:depth(st,(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2)})).sort((p,q)=>q.d-p.d).forEach(({w})=>standBank(s,st,w,t,cheer,flash,crowd));
 const ro=floorPoly(st,[[AW.x0,AW.z0],[AW.x1,AW.z0],[AW.x1,AW.z1],[AW.x0,AW.z1]]);if(ro.length>2){const rp=polyPath(ro,true);s.knockout(rp);s.fill(B,rp,.55);s.fill(K,rp,.35);}
 const cz=floorPoly(st,[[-20,0],[20,0],[20,20],[-20,20]]);if(cz.length>2){const cp=polyPath(cz,true);s.knockout(cp);s.fill(Y,cp,.5);s.fill(R,cp,.32);}
 // plank seams along the court
 const seams=new Path2D();for(let Z=.6;Z<20;Z+=.6){const q=[proj(st,-20,0,Z),proj(st,20,0,Z)],d0=depth(st,-20,Z),d1=depth(st,20,Z);if(d0>NEAR+.5&&d1>NEAR+.5){seams.moveTo(q[0][0],q[0][1]);seams.lineTo(q[1][0],q[1][1]);}}s.stroke(K,seams,2.4,.2);
 const lines=new Path2D();
 for(const seg of[[[-20,0],[20,0]],[[-20,20],[20,20]],[[-20,0],[-20,20]],[[20,0],[20,20]],[[0,0],[0,20]]] as Pt[][])lineOn(lines,st,seg);
 for(const gx of[-20,20]){const sg=gx<0?1:-1,arc:Pt[]=[];for(let k=0;k<=8;k++){const q=k/8*Math.PI/2;arc.push([gx+sg*6*Math.sin(q),POST_N-6*Math.cos(q)]);}
  for(let k=0;k<=8;k++){const q=Math.PI/2-k/8*Math.PI/2;arc.push([gx+sg*6*Math.sin(q),POST_F+6*Math.cos(q)]);}lineOn(lines,st,arc);
  for(const d of[6,10]){const q=floorPoly(st,ringXZ(gx+sg*d,10,.12,12));if(q.length>2)lines.addPath(polyPath(q,true));}}
 const cc=ringXZ(0,10,3,32);lineOn(lines,st,[...cc,cc[0]]);
 s.knockout(lines,.94);
}
/** a goal at X = gx (net going outward): hull + mesh, drawn before the players */
const gb=(gx:number,Z:number,Yh:number):V3=>[gx+Math.sign(gx)*lerp(.95,.55,Yh/GH),Yh,Z];
function hull2(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo:Pt[]=[],up:Pt[]=[];for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
 for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}
function goalNet(s:Sheet,st:Stage,gx:number){
 const all:V3[]=[[gx,0,POST_N],[gx,GH,POST_N],[gx,GH,POST_F],[gx,0,POST_F],gb(gx,POST_N,0),gb(gx,POST_N,GH),gb(gx,POST_F,GH),gb(gx,POST_F,0)];
 if(all.some(p=>depth(st,p[0],p[2])<NEAR+.3))return;
 const P=(p:V3)=>proj(st,p[0],p[1],p[2]);
 const np=polyPath(hull2(all.map(P)),true);s.knockout(np,.5);s.fill(K,np,.18);
 const mesh=new Path2D(),mv=(p:V3)=>{const q=P(p);mesh.moveTo(q[0],q[1]);},ln=(p:V3)=>{const q=P(p);mesh.lineTo(q[0],q[1]);};
 for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){mv(gb(gx,Z,0));for(let Yh=.25;Yh<=GH+1e-6;Yh+=.25)ln(gb(gx,Z,Yh));ln([gx,GH,Z]);}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.3){mv(gb(gx,POST_N,Yh));for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3)ln(gb(gx,Z,Yh));}
 s.stroke(K,mesh,Math.max(1.4,kAt(st,gx,10)*.018),.55);
}
function goalFrame(s:Sheet,st:Stage,gx:number){
 if(depth(st,gx,POST_N)<NEAR+.3||depth(st,gx,POST_F)<NEAR+.3)return;
 const P=(Yh:number,Z:number)=>proj(st,gx,Yh,Z),kk=kAt(st,gx,10),w=Math.max(4,kk*.09),lw=Math.max(2,kk*.014);
 const frame:Pt[]=[P(0,POST_N),P(GH,POST_N),P(GH,POST_F),P(0,POST_F)];
 s.fill(K,ribbon(frame,w+lw*2,{seed:3,taper:0,wobble:.3}),.95);s.knockout(ribbon(frame,w,{seed:3,taper:0,wobble:.3}));
 const bands=new Path2D(),seg=(y0:number,z0:number,y1:number,z1:number)=>bands.addPath(ribbon([P(y0,z0),P(y1,z1)],w,{seed:5,taper:0,wobble:.2}));
 for(let k=0;k<8;k+=2){seg(k/8*GH,POST_N,(k+1)/8*GH,POST_N);seg(k/8*GH,POST_F,(k+1)/8*GH,POST_F);}
 for(let k=0;k<12;k+=2)seg(GH,lerp(POST_N,POST_F,k/12),GH,lerp(POST_N,POST_F,(k+1)/12));
 s.fill(R,bands);
}

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;smear?:number;dir?:number}={}){
 const{rot=0,smear=0,dir=0}=o;let pts=blob(x,y,r,r,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);
type Ball3={X:number;Y:number;Z:number;moving:boolean;spin:number};
function ballOn(s:Sheet,st:Stage,b:Ball3,seed:number,o:{min?:number;dir?:number;smear?:number}={}){
 if(depth(st,b.X,b.Z)<NEAR+.35)return null;
 const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(o.min??8,kAt(st,b.X,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,.45);
 ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.moving?(o.smear??.3):0,dir:o.dir});return{p,r};
}
/** the screen direction the ball is travelling (for the smear) */
function ballDir(st:Stage,f:(p:number)=>Ball3,p:number){const a=f(p-.04),b=f(p),q0=proj(st,a.X,a.Y,a.Z),q1=proj(st,b.X,b.Y,b.Z);return Math.atan2(q1[1]-q0[1],q1[0]-q0[0]);}
/** a disc of points round a screen point (the passage aperture) */
const discPts=(c:Pt,r:number):Pt[]=>{const q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r]);}return q;};

// ================= chapter 1 — LIVE: the 2024 World Cup final (confirmed things only), from the flying CABLE-CAM =================
const C1={y24:A(0,'The 2024'),tash:A(0,'in Tashkent'),beat:A(0,'Brazil beat'),two1:A(0,'two one'),gk:A(0,'Goalkeeper'),num:A(0,'number three'),even:A(0,'even tries'),shots:A(0,'two shots'),wins:A(0,'wins the'),glove:A(0,'Golden Glove'),end:AUTH[0].seconds};
/** the board runs through the goals while the camera is up on it (a hidden time cut): 1–0, 2–0, 2–1, then the clock runs out */
const B_G1=C1.beat+.35,B_G2=C1.beat+.7,B_G3=C1.beat+1.05,B_END=C1.two1+.05;
/** the kick-off shape (nobody identified; Brazil left, Argentina right — inferred ends) */
const KO_BRA:XZ[]=[[-19.2,10],[-.7,10.3],[-5.5,5.2],[-5.8,14.6],[-9.5,10.2]];
const KO_ARG:XZ[]=[[19.2,10],[3.2,9.6],[5.6,5.6],[5.4,14.2],[9.4,10.6]];
/** after the whistle: Brazil's knot (inferred place), Argentina's players where the whistle found them */
const KNOT:XZ=[-3.4,8.8];
const BRA_C:XZ[]=[[-1.1,.2],[.3,1.1],[1.2,-.4],[-.4,-1.2],[.9,1.6],[-1.6,1.3],[1.8,.7]];
const ARG_C:XZ[]=[[6.2,12.4],[8.4,8.2],[4.6,6.2],[10.8,13.2],[2.8,14.4]];
const W_IN:XZ=[-9.5,-.6],W_AT:XZ=[KNOT[0]-.3,KNOT[1]-2.2];
const DOWN:Pose=posed({lHipF:58,rHipF:58,lKnee:74,rKnee:74,lean:46,neckP:40,lShF:40,rShF:40,lElb:24,rElb:24,lShA:10,rShA:10});
const HEADS:Pose=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:10,neckP:30,lShF:150,rShF:150,lShA:40,rShA:40,lElb:150,rElb:150});
const T_DOWN=C1.two1+.1;
/** before the time cut the teams stand in kick-off shape; after it Brazil celebrate in a knot and Argentina's heads drop */
const liveBra=(i:number):Gen=>T=>{if(T<B_G1&&i<KO_BRA.length){const[x,z]=KO_BRA[i];return{pose:blendPose(stand(),keeperSet(T*.6+i*.2),i===0?.8:.2),yaw:0,X:x,Z:z};}
 const g=BRA_C[i],X=KNOT[0]+g[0],Z=KNOT[1]+g[1],ph=(T-T_DOWN)*1.2+i*.17;
 return{pose:blendPose(celebrate(((ph%1)+1)%1,{kind:'arms'}),stand(),.1),yaw:yawTo(-g[0],-g[1]-.4),X,Z};};
const liveArg=(i:number):Gen=>T=>{if(T<B_G1){const[x,z]=KO_ARG[i];return{pose:blendPose(stand(),keeperSet(T*.6+i*.3),i===0?.8:.2),yaw:Math.PI,X:x,Z:z};}
 const[x,z]=ARG_C[i];return{pose:i%2?DOWN:blendPose(stand(),HEADS,.85),yaw:yawTo(KNOT[0]-x,KNOT[1]-z)+(i%2?.6:-.5),X:x,Z:z};};
/** Willian (No. 3): after the cut he runs in from the bench side and jumps at the front of the knot */
const T_WRUN=C1.two1+.2,T_WARR=C1.gk+.35;
const liveW:Gen=T=>{const go=sm(T_WRUN,T_WARR,T,easeIO),X=lerp(W_IN[0],W_AT[0],go),Z=lerp(W_IN[1],W_AT[1],go);
 let pose=runCycle(T*runCadence(.8),{speed:.8});pose=blendPose(pose,celebrate(((T-T_WRUN)*1.4)%1,{kind:'run'}),.45*(1-sm(T_WARR-.3,T_WARR,T)));
 if(T>T_WARR-.3)pose=blendPose(pose,celebrate((((T-T_WARR)*1.1)%1+1)%1,{kind:'arms'}),sm(T_WARR-.3,T_WARR+.1,T));
 return{pose,yaw:go<.97?yawTo(W_AT[0]-W_IN[0],W_AT[1]-W_IN[1]):yawTo(-.35,-1),X,Z};};
/** the cable-cam: [x, z, eye, aim x, aim y, aim z, zoom] — it glides in from above the corner behind Brazil's goal, swoops up to the board,
 * then dives down toward the celebration and settles on Willian */
const BOARD:V3=[0,8.2,10];
const CAB:Key[]=mono([[0,-27,-6,15,-3,0,9,1.45],[C1.tash,-23,-3.5,13.5,-1,0,9.5,1.4],[C1.beat-.1,-19,-1.5,12.2,0,3,10,1.2],[C1.beat+.35,-15,.2,11.6,0,8.2,10,2.2],[B_END,-14,.8,11.2,0,8.2,10,2.3],
 [T_DOWN+.6,-11.5,.4,7,-2.8,1.2,8.2,1.25],[C1.gk,-10,-.2,5.6,W_AT[0]-.8,1.1,W_AT[1]-.3,1.4],[C1.num,-9.2,.2,4.8,W_AT[0],1.3,W_AT[1],1.9],[C1.shots,-9.4,.4,4.9,W_AT[0]+.3,1.5,W_AT[1],1.75],[C1.glove,-9.6,.6,5.1,W_AT[0]+.2,1.8,W_AT[1],1.7],[C1.end,-9.8,.8,5.2,W_AT[0]+.2,1.8,W_AT[1],1.66]]);
const cab=(T:number)=>{const v=key(T,padKeys(CAB,[0,0,10,0,0,0,1]),easeInOutSine,true);return{st:aimed(1100,v[2],v[0],v[1],v[3],v[5]),aim:[v[3],v[4],v[5]] as V3,zoom:v[6]};};
/** the hanging board: a billboard panel facing the camera; Brazil yellow pips v Argentina blue pips; a clock bar that runs out */
function board(s:Sheet,st:Stage,T:number){
 const c=BOARD,rx=Math.cos(st.a),rz=-Math.sin(st.a),W=2.4,H=1.3;
 const q=poly3(st,[[c[0]-rx*W,c[1]+H,c[2]-rz*W],[c[0]+rx*W,c[1]+H,c[2]+rz*W],[c[0]+rx*W,c[1]-H,c[2]+rz*W],[c[0]-rx*W,c[1]-H,c[2]-rz*W]]);if(q.length<4)return;
 const cable=new Path2D();for(const u of[-.6,.6]){const a=proj(st,c[0]+rx*W*u,c[1]+H,c[2]+rz*W*u),b=proj(st,c[0]+rx*W*u,c[1]+H+9,c[2]+rz*W*u);cable.moveTo(a[0],a[1]);cable.lineTo(b[0],b[1]);}s.stroke(K,cable,3,.8);
 const pn=polyPath(q,true);s.knockout(pn);s.fill(K,pn,.95);
 const P=(u:number,v:number):Pt=>{const x=lerp(q[0][0],q[1][0],(u+1)/2),y=lerp(q[0][1],q[3][1],(v+1)/2);return[x,y];},ww=Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1]);
 s.fill(Y,rectPath(P(-1,.86)[0],P(-1,.86)[1],ww,ww*.03));
 const pip=(u:number,v:number,ink:string,on:boolean,at:number)=>{const p=P(u,v),r=ww*.05*(1+.5*pulse(T,at,.7));s.knockout(circlePath(p[0],p[1],r*1.25));if(on)s.fill(ink,circlePath(p[0],p[1],r));else s.fill(ink,ribbon(blob(p[0],p[1],r*.8,r*.8,7,{n:14,amp:.02}),r*.28,{seed:5,close:true}),.5);};
 // Brazil (left): two pips; Argentina (right): one pip — they fill as the board runs
 pip(-.72,-.3,Y,T>=B_G1,B_G1);pip(-.46,-.3,Y,T>=B_G2,B_G2);pip(.52,-.3,B,T>=B_G3,B_G3);
 s.fill(Y,rectPath(P(-.1,-.34)[0],P(-.1,-.34)[1],ww*.1,ww*.025),.8);
 // the clock bar runs down to 40:00
 const left=T<C1.beat?.62:1-sm(C1.beat,B_END,T,linear),bx=P(-.8,.42),bw=ww*.8;s.fill(B,rectPath(bx[0],bx[1],bw,ww*.05),.35);s.fill(Y,rectPath(bx[0],bx[1],bw*(1-left),ww*.05));
 const horn=pulse(T,B_END,1.2);if(horn>.02){const p=P(0,0);sparkBurst(s,Y,p[0],p[1],ww*.9,{n:14,seed:151,g:easeOut(sm(B_END,B_END+.3,T))*(1-sm(B_END+.7,B_END+1.3,T))});}
}
/** the broadcast bubble on "two shots": two ball icons pop in a navy panel beside him; the Golden Glove rises over him */
function bubble(s:Sheet,st:Stage,T:number){
 const w=liveW(T),h=jointAt(liveW,T,WBUILD,'head'),hp=proj(st,h[0],h[1]+.3,h[2]),kk=kAt(st,w.X,w.Z);
 const g=easeOutBack(sm(C1.even,C1.even+.35,T))*(1-sm(C1.glove-.2,C1.glove+.2,T));
 if(g>.02){const cx=hp[0]+kk*1.35,cy=hp[1]-kk*.25,bw=kk*1.5*g,bh=kk*.72*g,pn=polyPath(blob(cx,cy,bw/2,bh/2,171,{n:22,amp:.04}),true);
  s.knockout(pn);s.fill(K,pn,.92);const tail=polyPath([[cx-bw*.36,cy+bh*.3],[hp[0]+kk*.3,hp[1]+kk*.15],[cx-bw*.1,cy+bh*.42]],true);s.knockout(tail);s.fill(K,tail,.92);
  for(let k=0;k<2;k++){const at=C1.shots+.05+k*.32,on=easeOutBack(sm(at,at+.25,T));if(on>.02)ball(s,cx+(k?.3:-.3)*bw,cy,kk*.2*on*g,177+k,{rot:k*.9});}}
 const gl=easeOutBack(sm(C1.glove,C1.glove+.5,T));
 if(gl>.02){const cx=hp[0],cy=hp[1]-kk*(.55+.35*gl),S=kk*.62*gl;
  // a stylised glove: a padded palm, four fingers and a thumb, a navy cuff; yellow ink = gold
  const palm=blob(cx,cy+S*.18,S*.42,S*.42,181,{n:18,amp:.04}),parts=new Path2D();parts.addPath(polyPath(palm,true));
  for(let f=0;f<4;f++){const fx=cx+(f-1.5)*S*.2;parts.addPath(polyPath(blob(fx,cy-S*.32-(f===1||f===2?S*.06:0),S*.09,S*.3,183+f,{n:12,amp:.03}),true));}
  parts.addPath(polyPath(rotPts(blob(0,0,S*.1,S*.26,189,{n:12,amp:.03}),-.7).map(p=>[p[0]+cx-S*.44,p[1]+cy+S*.05] as Pt),true));
  s.knockout(parts);s.fill(Y,parts);s.fill(K,ribbon([...palm,palm[0]],Math.max(3,S*.04),{seed:191,close:true,wobble:.6}),.8);
  const cuff=rectPath(cx-S*.34,cy+S*.52,S*.68,S*.2);s.knockout(cuff);s.fill(K,cuff,.9);
  sparkBurst(s,Y,cx,cy,S*1.6,{n:12,seed:193,g:easeOut(sm(C1.glove,C1.glove+.3,T))*(1-sm(C1.glove+.8,C1.glove+1.4,T))});}
}
function live(s:Sheet,T:number,Tc:number){
 const c=cab(Tc),st=c.st,ap=proj(st,c.aim[0],c.aim[1],c.aim[2]);cam(s,ap[0],ap[1],c.zoom);
 const joy=sm(B_END,B_END+.4,T);
 arena(s,st,T,{cheer:.25+.6*joy+.3*pulse(T,C1.glove,1.5),flash:pulse(T,B_END,1)+.5*pulse(T,C1.glove,1.2)});
 goalNet(s,st,-20);goalNet(s,st,20);
 type It={z:number;draw:()=>void};const items:It[]=[];
 const n=T<B_G1?5:BRA_C.length;
 for(let i=0;i<n;i++){const g=liveBra(i),a=g(T);items.push({z:depth(st,a.X,a.Z),draw:()=>athlete(s,st,g,T,T<B_G1&&i===0?BRA_GK:BRA(i),{detail:T>C1.gk&&i<4?'auto':'low'})});}
 for(let i=0;i<5;i++){const g=liveArg(i),a=g(T);items.push({z:depth(st,a.X,a.Z),draw:()=>athlete(s,st,g,T,T<B_G1&&i===0?ARG_GK:ARG(i),{detail:'low'})});}
 if(T<B_G1)items.push({z:depth(st,0,10)-.05,draw:()=>{ballOn(s,st,{X:-.25,Y:BALL_R,Z:10,moving:false,spin:0},18,{min:5});}});
 if(T>=T_WRUN){const w=liveW(T);items.push({z:depth(st,w.X,w.Z),draw:()=>{const g=proj(st,w.X,0,w.Z),h=1.84*kAt(st,w.X,w.Z);
   floorRing(s,st,R,w.X,w.Z,.75,8,121,easeOutBack(sm(C1.gk,C1.gk+.4,T)));
   athlete(s,st,liveW,T,WILLIAN,{detail:T>C1.gk?'auto':'low',smear:T<T_WARR?.08:0});
   // "number three": a paper ring round his back number
   ring2(s,R,[g[0],g[1]-h*.62],h*.2,h*.2,6,123,easeOutBack(sm(C1.num,C1.num+.35,T))*(1-sm(C1.even,C1.even+.3,T)));}});}
 items.sort((p,q)=>q.z-p.z).forEach(it=>it.draw());
 goalFrame(s,st,-20);goalFrame(s,st,20);
 board(s,st,T);
 if(T>=B_END){const u=sm(B_END,B_END+4,T,linear),p=proj(st,KNOT[0],3,KNOT[1]),kk=kAt(st,KNOT[0],KNOT[1]);confetti(s,[Y,B,'paper'],[p[0]-kk*6,p[1]-kk*4+u*kk*2.5,kk*12,kk*3],22,Math.floor(T*6),{size:Math.max(8,kk*.12)});}
 if(T>=T_WRUN)bubble(s,st,T);
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},
 aperture(t){const{tt,tc}=clock(0,t),st=cab(tc).st,h=jointAt(liveW,tt,WBUILD,'chest');return aperture(discPts(proj(st,h[0],h[1],h[2]),.3*kAt(st,h[0],h[2])));},still:C1.glove+.6};

// ================= the demonstration play, authored ONCE on the court (X along, Z across); his goal at X = −20. Play time p in seconds =================
const P_BACK=.55,P_RECV=1.45,P_LOOK=1.95,P_WIND=2.3,SD=.72,P_PASS=P_WIND+STRIKE_CONTACT*SD,P_ARR=P_PASS+.62,P_END=6.5;
const WB:XZ=[-16.2,10.4];                         // where he stops the back pass
const T1B:XZ=[-11.3,14],T1Y=yawTo(WB[0]-T1B[0],WB[1]-T1B[1]);   // the fixo's back pass
const T2_0:XZ=[-12.9,3.5],TR:XZ=[-13.3,3.7];     // the winger, and where he takes the pass
const O1_0:XZ=[-11.9,5.1],O1_END:XZ=[-14.5,8.7]; // the presser: marking the winger, then sprinting at the keeper
const O2_0:XZ=[-10.5,12.9];                      // the second opponent, marking the fixo
const YR=yawTo(T1B[0]-WB[0],T1B[1]-WB[1]);       // facing the back pass
const YP=yawTo(TR[0]-WB[0],TR[1]-WB[1]);         // facing the pass to the winger
const BR:XZ=(()=>{const d=unit(WB[0]-TR[0],WB[1]-TR[1]);return[TR[0]+d[0]*.42,TR[1]+d[1]*.42] as XZ;})();
const SOLE_OFF=soleBall(SOLE,WBUILD,YR),PASS_OFF=strikeBall(YP,WBUILD,.4);
const W_SOLE:XZ=[WB[0]-SOLE_OFF[0],WB[1]-SOLE_OFF[1]],W_PASS:XZ=[WB[0]-PASS_OFF[0],WB[1]-PASS_OFF[1]];
const T1_OFF=strikeBall(T1Y,PBUILD,.3),T1_PL:XZ=[T1B[0]-T1_OFF[0],T1B[1]-T1_OFF[1]];
/** Willian: ready on his toes → reaches the sole onto the ball → looks up (turning to the winger) → the inside-foot pass → steps up */
const wGen=(style:{ny:number}={ny:.5}):Gen=>p=>{
 let pose=blendPose(READY,keeperSet(p*1.2),.4),yaw=YR,X=W_SOLE[0]-.35*Math.cos(YR),Z=W_SOLE[1]-.35*Math.sin(YR);
 if(p>P_RECV-.4){const u=sm(P_RECV-.4,P_RECV,p);pose=blendPose(pose,SOLE,u);X=lerp(X,W_SOLE[0],u);Z=lerp(Z,W_SOLE[1],u);}
 if(p>P_LOOK-.1){const u=sm(P_LOOK-.1,P_LOOK+.25,p);pose=blendPose(pose,soleLook(style.ny),u);}
 if(p>P_WIND-.25){const u=sm(P_WIND-.25,P_WIND,p,easeIO);yaw=lerp(YR,YP,u);X=lerp(W_SOLE[0],W_PASS[0],u);Z=lerp(W_SOLE[1],W_PASS[1],u);
  if(p>=P_WIND){pose=blendPose(pose,strike((p-P_WIND)/SD,{power:.4}),sm(P_WIND,P_WIND+.1,p));}}
 if(p>P_WIND+SD){const u=p-(P_WIND+SD);pose=blendPose(strike(1,{power:.4}),stand(),sm(0,.5,u));X+=Math.cos(YP)*.3*sm(0,1,u);Z+=Math.sin(YP)*.3*sm(0,1,u);}
 return{pose,yaw,X,Z};};
const W_GEN=wGen();
/** the fixo: the back pass (right foot, soft), then he moves wide to support */
const t1Gen:Gen=p=>{const st0=P_BACK-STRIKE_CONTACT*.7;let pose=blendPose(stand(),runCycle(p*runCadence(.1),{speed:.1}),.2),yaw=T1Y,X=T1_PL[0],Z=T1_PL[1];
 if(p>st0){pose=blendPose(pose,strike(clamp((p-st0)/.7),{power:.3}),sm(st0,st0+.08,p));}
 if(p>st0+.7){const u=p-st0-.7;pose=blendPose(strike(1,{power:.3}),runCycle(u*runCadence(.4),{speed:.4}),sm(0,.4,u));yaw=lerp(T1Y,yawTo(.2,1),sm(0,.5,u));X-=.25*u;Z+=.9*Math.max(0,u-.2);}
 return{pose,yaw,X,Z};};
/** the presser: marks the winger (small shuffle), sprints at the keeper on the back pass, jabs a leg at the ball — too late — and turns */
const O1_GO=P_BACK+.12,O1_LUNGE=P_PASS-.28;
const o1Gen:Gen=p=>{const dirY=yawTo(O1_END[0]-O1_0[0],O1_END[1]-O1_0[1]);
 if(p<O1_GO)return{pose:blendPose(backpedal(p*1.4),stand(),.5),yaw:yawTo(WB[0]-O1_0[0],WB[1]-O1_0[1]),X:O1_0[0],Z:O1_0[1]};
 const u=sm(O1_GO,O1_LUNGE+.1,p,(x:number)=>x*(2-x)),X=lerp(O1_0[0],O1_END[0],u),Z=lerp(O1_0[1],O1_END[1],u);
 let pose=runCycle((p-O1_GO)*runCadence(.95),{speed:.95});
 if(p>O1_LUNGE){pose=blendPose(pose,lunge(clamp((p-O1_LUNGE)/.7),{side:'r'}),sm(O1_LUNGE,O1_LUNGE+.12,p));}
 const yaw=p<P_ARR?dirY:lerp(dirY,yawTo(TR[0]-O1_END[0],TR[1]-O1_END[1]),sm(P_ARR-.3,P_ARR+.4,p));
 return{pose,yaw,X,Z};};
/** the second opponent: stays tight on the fixo */
const o2Gen:Gen=p=>{const t=t1Gen(p);return{pose:blendPose(backpedal(p*1.5),stand(),.45),yaw:yawTo(t.X-O2_0[0],t.Z-O2_0[1]-.3),X:lerp(O2_0[0],t.X+.9,sm(1.5,4,p)),Z:lerp(O2_0[1],t.Z-1.1,sm(1.5,4,p))};};
/** the winger: marked, then left free — he shows for it (arm up), steps to the ball, takes it and drives up the wing */
const t2Gen:Gen=p=>{const face=yawTo(WB[0]-TR[0],WB[1]-TR[1]);
 if(p<P_ARR){const u=sm(P_PASS-.35,P_ARR-.05,p),X=lerp(T2_0[0],TR[0],u),Z=lerp(T2_0[1],TR[1],u);let pose=blendPose(stand(),runCycle(p*runCadence(.2),{speed:.2}),.3);
  const show=sm(O1_GO+.3,O1_GO+.7,p)*(1-sm(P_PASS-.1,P_PASS+.2,p));pose=blendPose(pose,{...pose,rShF:2.6,rShA:.5,rElb:.3},show);
  if(u>0&&u<1)pose=blendPose(pose,runCycle(p*runCadence(.35),{speed:.35}),.6*Math.sin(Math.PI*u));
  return{pose,yaw:face,X,Z};}
 const u=p-P_ARR;let pose=blendPose(stand(),dribbleRun(u),sm(.1,.4,u));
 return{pose,yaw:lerp(face,0,sm(.35,.9,u)),X:TR[0]+2.9*Math.max(0,u-.5)*sm(.4,1,u),Z:TR[1]};};
const dribbleRun=(u:number)=>runCycle(u*runCadence(.6),{speed:.6});
/** the ball on the court */
function playBall(p:number):Ball3{
 if(p<P_BACK)return{X:T1B[0],Y:BALL_R,Z:T1B[1],moving:false,spin:0};
 if(p<P_RECV){const u=sm(P_BACK,P_RECV,p,(x:number)=>x*(1.6-.6*x));return{X:lerp(T1B[0],WB[0],u),Y:BALL_R,Z:lerp(T1B[1],WB[1],u),moving:true,spin:u*9};}
 if(p<P_PASS)return{X:WB[0],Y:BALL_R,Z:WB[1],moving:false,spin:9};
 if(p<P_ARR){const u=sm(P_PASS,P_ARR,p,(x:number)=>x*(1.35-.35*x));return{X:lerp(WB[0],BR[0],u),Y:BALL_R,Z:lerp(WB[1],BR[1],u),moving:true,spin:9+u*12};}
 const t=t2Gen(p),f=unit(Math.cos(t.yaw),Math.sin(t.yaw)),lead=.42+.12*Math.abs(Math.sin((p-P_ARR)*5));return{X:t.X+f[0]*lead,Y:BALL_R,Z:t.Z+f[1]*lead,moving:p>P_ARR+.3,spin:21+(p-P_ARR)*14};
}
/** everyone in the play, back to front, drawn from stage st */
function drawPlay(s:Sheet,st:Stage,p:number,o:{wGen?:Gen;wStyle?:AthleteStyle;hide?:number;hideOthers?:number;detail?:'auto'|'mid'|'high'}={}){
 const wg=o.wGen??W_GEN,ws=o.wStyle??WILLIAN_T,hide=o.hide??.9;
 const cast:[Gen,AthleteStyle,{height:number}, 'auto'|'low'|'mid'|'high',number][]=[[t1Gen,MATE(1),PBUILD,'auto',p>P_BACK-.3&&p<P_BACK+.2?.1:0],[o2Gen,OPP(1),PBUILD,'auto',0],[o1Gen,OPP(0),PBUILD,'auto',p>O1_GO&&p<P_ARR?.08:0],[t2Gen,MATE(0),PBUILD,'auto',p>P_ARR+.3?.06:0],[wg,ws,WBUILD,o.detail??'high',p>P_WIND+.1&&p<P_PASS+.15?.1:0]];
 const items:{z:number;draw:()=>void}[]=[];
 for(const[g,sty,,det,sm0] of cast){const a=g(p),d=depth(st,a.X,a.Z);if(d<(g===o1Gen||g===o2Gen||g===t1Gen?Math.max(hide,o.hideOthers??0):hide))continue;items.push({z:d,draw:()=>athlete(s,st,g,p,sty,{detail:det,smear:sm0})});}
 const b=playBall(p);items.push({z:depth(st,b.X,b.Z)-.03,draw:()=>{const r=ballOn(s,st,b,311,{min:9,dir:ballDir(st,playBall,p)});
  if(r&&p>=P_RECV&&p<P_RECV+.3)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3,{n:9,seed:305,g:easeOut(sm(P_RECV,P_RECV+.15,p))*(1-sm(P_RECV+.15,P_RECV+.3,p))});
  if(r&&p>=P_PASS&&p<P_PASS+.25)sparkBurst(s,R,r.p[0],r.p[1],r.r*2.6,{n:8,seed:307,g:easeOut(sm(P_PASS,P_PASS+.12,p))*(1-sm(P_PASS+.12,P_PASS+.25,p))});}});
 items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
}

// ================= chapter 2 — HOW HE PLAYS OUT: the PRESSER'S-EYE camera (real time), running behind the attacker, whipping round after the pass =================
const C2={how:A(1,'This is'),comes:A(1,'The ball'),stops:A(1,'Willian stops'),sole:A(1,'with his sole'),looks:A(1,'looks up'),passes:A(1,'and passes'),free:A(1,'the free'),three:A(1,'Three against'),end:AUTH[1].seconds};
/** chapter clock → play time: the back pass on "The ball comes", the stop on "Willian stops", the pass on "and passes" */
const p2=(t:number)=>key(t,mono([[0,0],[C2.comes,P_BACK-.05],[C2.stops+.2,P_RECV],[C2.looks+.1,P_LOOK+.05],[C2.passes+.2,P_PASS],[C2.free+.25,P_ARR],[C2.end,P_ARR+(C2.end-C2.free-.25)*.9]]),linear);
/** the camera rides 3.4 m behind the presser, head height; it aims at the keeper, then swings after the ball to the winger */
function st2(p:number):{st:Stage;aim:V3}{
 const o=o1Gen(p),d=unit(WB[0]-o.X,WB[1]-o.Z),x=o.X-d[0]*3.4+d[1]*1.5,z=o.Z-d[1]*3.4-d[0]*1.5,b=playBall(Math.min(p,P_ARR+.2));
 const f=sm(P_PASS-.02,P_PASS+.35,p,easeIO),g=sm(P_ARR-.1,P_ARR+.6,p,easeIO),t2=t2Gen(p);
 const ax=lerp(lerp(WB[0],b.X,f),t2.X,g),az=lerp(lerp(WB[1],b.Z,f),t2.Z,g);
 return{st:aimed(1050,1.95+.08*Math.sin(p*9)*sm(O1_GO,O1_GO+.3,p)*(1-sm(O1_LUNGE,O1_LUNGE+.2,p)),x,z,ax,az),aim:[ax,.9,az]};
}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc}=clock(1,t0),p=p2(tt),pc=p2(tc),{st,aim}=st2(pc),ap=proj(st,aim[0],aim[1],aim[2]);
  const zoom=key(tc,mono([[0,.92],[C2.stops,1.02],[C2.looks,1.08],[C2.passes,.96],[C2.three,.86],[C2.end,.84]]),easeInOutSine),whip=pulse(pc,P_PASS+.1,.5);
  cam(s,ap[0]+18*whip*Math.sin(tc*70),ap[1]-60,zoom);
  arena(s,st,tt,{crowd:false,flash:.4*pulse(p,P_PASS,1)});
  goalNet(s,st,-20);
  // "Three against two": red rings under his three (keeper included), dashed navy rings under the two opponents — drawn on the floor first
  const th=easeOutBack(sm(C2.three,C2.three+.4,tt));
  if(th>.02){[W_GEN,t1Gen,t2Gen].forEach((g,i)=>{const a=g(p);floorRing(s,st,R,a.X,a.Z,.7,9,331+i,th);});[o1Gen,o2Gen].forEach((g,i)=>{const a=g(p);floorRing(s,st,K,a.X,a.Z,.7,8,341+i,th,true);});}
  // "looks up": his eye-line to the free winger (red dashed, drawn at floor level so it reads from behind the presser)
  const look=sm(C2.looks,C2.looks+.4,tt,easeOut)*(1-sm(C2.passes+.2,C2.passes+.6,tt));
  if(look>.02){const a=t2Gen(p);floorArrow(s,st,R,[[WB[0],WB[1]],[(WB[0]+a.X)/2+.4,(WB[1]+a.Z)/2],[a.X,a.Z]],9,351,look,false);}
  drawPlay(s,st,p,{hide:.9});
  goalFrame(s,st,-20);
  // "This is how he plays out": a red ring round the keeper; "with his sole": a ring at his foot on the ball
  const w=W_GEN(p),wg=proj(st,w.X,0,w.Z),kw=kAt(st,w.X,w.Z);
  ring2(s,R,[wg[0],wg[1]-kw*.92],kw*.55,kw*1.08,9,361,easeOutBack(sm(C2.how,C2.how+.4,tt))*(1-sm(C2.comes+.3,C2.comes+.7,tt)));
  const so=easeOutBack(sm(C2.sole,C2.sole+.35,tt))*(1-sm(C2.looks+.2,C2.looks+.6,tt));
  if(so>.02){const q=proj(st,WB[0],.18,WB[1]),kb=kAt(st,WB[0],WB[1]);ring2(s,Y,q,kb*.34,kb*.26,7,363,so);}
  // "the free teammate": a red ring on the winger
  const fr=easeOutBack(sm(C2.free,C2.free+.35,tt))*(1-sm(C2.three,C2.three+.3,tt));
  if(fr>.02){const a=t2Gen(p),g=proj(st,a.X,.9,a.Z),kk=kAt(st,a.X,a.Z);ring2(s,R,g,kk*.62,kk*1.05,9,365,fr);}
 },
 aperture(t0){const{tt,tc}=clock(1,t0),p=p2(tt),{st}=st2(p2(tc)),b=playBall(p),q=proj(st,b.X,b.Y,b.Z),r=Math.max(14,kAt(st,b.X,b.Z)*BALL_R)*1.6;void tc;return aperture(discPts(q,r));},
 still:C2.looks+.3,
};

// ================= chapter 3 — WATCH AGAIN: slow motion, the BALL-CAM riding the pass along the floor to the free player =================
const C3={again:A(2,'Again'),one:A(2,'One attacker'),presses:A(2,'presses him'),so:A(2,'so a teammate'),flat:A(2,'A flat'),firm:A(2,'firm pass'),right:A(2,'right to'),end:AUTH[2].seconds};
/** chapter clock → play time (slow): the sole on the ball at the start, the pass on "firm pass", the arrival on "right to his feet" */
const p3=(t:number)=>key(t,mono([[0,P_RECV+.05],[C3.one,P_RECV+.35],[C3.so,P_LOOK+.1],[C3.flat,P_WIND+.15],[C3.firm+.1,P_PASS],[C3.right+.1,P_ARR-.02],[C3.end,P_ARR+.5]]),linear);
const DP=unit(BR[0]-WB[0],BR[1]-WB[1]),PERP:XZ=[-DP[1],DP[0]];
/** the ball-cam: before the pass it waits low behind his standing foot, off to one side; as the ball goes it chases it along the floor */
function st3(p:number):Stage{
 const b=playBall(Math.min(p,P_ARR+.15)),u=sm(P_PASS,P_ARR,p),back=lerp(2.5,1.9,u),side=lerp(-1.1,-.35,u),eye=lerp(.95,.7,sm(P_PASS,P_PASS+.3,p))+.5*sm(P_ARR-.3,P_ARR+.5,p);
 const bx=p<P_PASS?WB[0]:b.X,bz=p<P_PASS?WB[1]:b.Z,x=bx-DP[0]*back+PERP[0]*side,z=bz-DP[1]*back+PERP[1]*side,tx=lerp(BR[0],t2Gen(p).X,sm(P_ARR,P_ARR+.6,p)),tz=lerp(BR[1],t2Gen(p).Z,sm(P_ARR,P_ARR+.6,p));
 return aimed(1000,eye,x,z,tx,tz);
}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc}=clock(2,t0),p=p3(tt),pc=p3(tc),st=st3(pc),b=playBall(pc),bp=proj(st,b.X,b.Y+.6,b.Z);
  const zoom=key(tc,mono([[0,.88],[C3.one,.9],[C3.so,.95],[C3.flat,.9],[C3.firm,.84],[C3.right,1.02],[C3.end,1.06]]),easeInOutSine);
  cam(s,lerp(0,bp[0]*.4,sm(P_PASS,P_ARR,pc)),lerp(proj(st,WB[0],1,WB[1])[1],bp[1],sm(P_PASS,P_PASS+.2,pc))-40,zoom);
  arena(s,st,tt,{crowd:false});
  // "presses him": a navy dashed arrow along the attacker's run, a dashed navy ring at his feet
  const pr=sm(C3.presses,C3.presses+.6,tt,easeOut)*(1-sm(C3.firm,C3.firm+.5,tt));
  if(pr>.02){floorArrow(s,st,K,[[O1_0[0],O1_0[1]],[lerp(O1_0[0],O1_END[0],.5)+.3,lerp(O1_0[1],O1_END[1],.5)],[O1_END[0]+.4,O1_END[1]-.4]],10,371,pr);}
  // "so a teammate is free": the empty space he left (a yellow floor ring) and a red ring on the winger
  const fr=easeOutBack(sm(C3.so,C3.so+.4,tt))*(1-sm(C3.right+.3,C3.right+.7,tt));
  if(fr>.02){floorRing(s,st,Y,O1_0[0],O1_0[1],.9,9,373,fr,true);}
  // "A flat, firm pass": the red dashed floor line, drawn ahead of the ball
  const fl=sm(C3.flat,C3.firm+.2,tt,easeOut)*(1-sm(C3.right+.4,C3.right+.9,tt));
  if(fl>.02)floorArrow(s,st,R,[[WB[0],WB[1]],[lerp(WB[0],BR[0],.5),lerp(WB[1],BR[1],.5)],[BR[0],BR[1]]],11,375,fl);
  drawPlay(s,st,p,{hide:1.1,hideOthers:2.6,detail:'high'});
  if(fr>.02){const a=t2Gen(p),g=proj(st,a.X,.9,a.Z),kk=kAt(st,a.X,a.Z);ring2(s,R,g,kk*.6,kk*1.05,9,377,fr);}
  // "right to his feet": a red ring at his feet as the ball arrives, yellow speed lines behind the ball
  const rt=easeOutBack(sm(C3.right,C3.right+.35,tt));
  if(rt>.02){const q=proj(st,BR[0],.1,BR[1]),kk=kAt(st,BR[0],BR[1]);ring2(s,R,q,kk*.45,kk*.25,8,379,rt);}
  if(pc>P_PASS&&pc<P_ARR){const q=proj(st,b.X,b.Y,b.Z),q0=proj(st,b.X-DP[0]*.5,b.Y,b.Z-DP[1]*.5);speedLines(s,Y,q[0],q[1],Math.atan2(q0[1]-q[1],q0[0]-q[0]),{n:5,seed:381,len:140,spread:40,width:6});}
 },
 aperture(t0){const{tt,tc}=clock(2,t0),st=st3(p3(tc)),a=t2Gen(p3(tt)),q=proj(st,a.X,1.1,a.Z);return aperture(discPts(q,.35*kAt(st,a.X,a.Z)));},
 still:C3.so+.4,
};

// ================= chapter 4 — YOUR TURN: the RECEIVER'S-EYE camera; a kid keeper stops a back pass with the sole and passes to us =================
const C4={turn:A(3,'Your turn'),keeper:A(3,'A futsal'),fifth:A(3,'fifth'),ready:A(3,'be ready'),pass:A(3,'pass with'),end:AUTH[3].seconds};
const EYE:XZ=[-11,9.1],KB:XZ=[-16.6,10.2],F1B:XZ=[-13.9,14.3];
const Q_BACK=C4.turn+.35,Q_RECV=C4.keeper+.4,Q_LOOK=C4.ready-.1,Q_WIND=C4.pass-.2,QSD=.72,Q_PASS=Q_WIND+STRIKE_CONTACT*QSD,Q_ARR=Q_PASS+.95;
const KY_R=yawTo(F1B[0]-KB[0],F1B[1]-KB[1]),KY_P=yawTo(EYE[0]-KB[0],EYE[1]-KB[1]);
const K_SOLE=soleBall(SOLE,KBUILD,KY_R),K_PASS=strikeBall(KY_P,KBUILD,.4);
const KS:XZ=[KB[0]-K_SOLE[0],KB[1]-K_SOLE[1]],KP:XZ=[KB[0]-K_PASS[0],KB[1]-K_PASS[1]];
const F1Y=yawTo(KB[0]-F1B[0],KB[1]-F1B[1]),F1_OFF=strikeBall(F1Y,{height:1.4,bulk:.92},.3),F1P:XZ=[F1B[0]-F1_OFF[0],F1B[1]-F1_OFF[1]];
const BSTOP:XZ=[lerp(KB[0],EYE[0],.8),lerp(KB[1],EYE[1],.8)];
const kidGen:Gen=t=>{let pose=blendPose(READY,keeperSet(t*1.2),.5),yaw=KY_R,X=KS[0],Z=KS[1];
 if(t>Q_RECV-.4)pose=blendPose(pose,SOLE,sm(Q_RECV-.4,Q_RECV,t));
 if(t>Q_LOOK)pose=blendPose(pose,soleLook(-.3),sm(Q_LOOK,Q_LOOK+.3,t));
 if(t>Q_WIND-.25){const u=sm(Q_WIND-.25,Q_WIND,t);yaw=lerp(KY_R,KY_P,u);X=lerp(KS[0],KP[0],u);Z=lerp(KS[1],KP[1],u);if(t>=Q_WIND)pose=blendPose(pose,strike((t-Q_WIND)/QSD,{power:.4}),sm(Q_WIND,Q_WIND+.1,t));}
 if(t>Q_WIND+QSD)pose=blendPose(strike(1,{power:.4}),celebrate((((t-Q_WIND-QSD)*1.1)%1+1)%1,{kind:'arms'}),sm(C4.end-1.6,C4.end-1.1,t));
 return{pose,yaw,X,Z};};
const friendGen:Gen=t=>{const s0=Q_BACK-STRIKE_CONTACT*.7;let pose=stand();if(t>s0)pose=blendPose(pose,strike(clamp((t-s0)/.7),{power:.3}),sm(s0,s0+.08,t));
 if(t>s0+.7)pose=blendPose(strike(1,{power:.3}),stand(),sm(s0+.7,s0+1.2,t));return{pose,yaw:F1Y,X:F1P[0],Z:F1P[1]};};
function kidBall(t:number):Ball3{
 if(t<Q_BACK)return{X:F1B[0],Y:BALL_R,Z:F1B[1],moving:false,spin:0};
 if(t<Q_RECV){const u=sm(Q_BACK,Q_RECV,t,(x:number)=>x*(1.5-.5*x));return{X:lerp(F1B[0],KB[0],u),Y:BALL_R,Z:lerp(F1B[1],KB[1],u),moving:true,spin:u*8};}
 if(t<Q_PASS)return{X:KB[0],Y:BALL_R,Z:KB[1],moving:false,spin:8};
 const u=sm(Q_PASS,Q_ARR,t,(x:number)=>x*(1.7-.7*x));return{X:lerp(KB[0],BSTOP[0],u),Y:BALL_R,Z:lerp(KB[1],BSTOP[1],u),moving:u<1,spin:8+u*14};
}
const st4:Stage=aimed(1150,1.02,EYE[0],EYE[1],KB[0],KB[1]+.2);
const sc4:Scene={
 draw(s,t0){
  const{tt,tc}=clock(3,t0),st=st4,k=proj(st,KB[0],.9,KB[1]),b=kidBall(tc),bp=proj(st,b.X,b.Y,b.Z);
  const arr=sm(Q_PASS,Q_ARR,tc,easeIO),zoom=key(tc,mono([[0,1.05],[C4.keeper,1.2],[C4.fifth,1.12],[C4.pass,1.05],[C4.end,.96]]),easeInOutSine);
  cam(s,lerp(k[0]+60,(k[0]+bp[0])/2,arr),lerp(k[1]-20,(k[1]+bp[1])/2,arr),zoom);
  arena(s,st,tt,{crowd:false});
  goalNet(s,st,-20);
  // "fifth outfield player": a red ring round the kid keeper, a dashed red arrow from him up the court (he is in the play)
  const ff=easeOutBack(sm(C4.fifth,C4.fifth+.4,tt))*(1-sm(C4.pass,C4.pass+.4,tt));
  if(ff>.02){const a=kidGen(tt);floorRing(s,st,R,a.X,a.Z,.8,10,411,ff);floorArrow(s,st,R,[[a.X+1,a.Z-.4],[a.X+2.6,a.Z-1.4],[a.X+4,a.Z-1.2]],10,413,clamp(ff));}
  const its:{z:number;draw:()=>void}[]=[
   {z:depth(st,F1P[0],F1P[1]),draw:()=>athlete(s,st,friendGen,tt,KID,{detail:'auto',smear:tt>Q_BACK-.2&&tt<Q_BACK+.2?.1:0})},
   {z:depth(st,KS[0],KS[1]),draw:()=>athlete(s,st,kidGen,tt,KID_GK,{detail:'high',smear:tt>Q_WIND+.1&&tt<Q_PASS+.15?.1:0})},
   {z:depth(st,b.X,b.Z)-.03,draw:()=>{ballOn(s,st,kidBall(tt),421,{min:10,dir:ballDir(st,kidBall,tt)});}},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  goalFrame(s,st,-20);
  // "be ready": yellow bounce marks under his toes
  const rd=easeOutBack(sm(C4.ready,C4.ready+.35,tt))*(1-sm(C4.pass+.3,C4.pass+.7,tt));
  if(rd>.02){const q=proj(st,KB[0],.18,KB[1]),kb=kAt(st,KB[0],KB[1]);ring2(s,Y,q,kb*.36,kb*.26,7,425,rd);}
  // the tick
  const tk=easeOutBack(sm(Q_ARR-.1,Q_ARR+.3,tt));if(tk>.02){const kk=kAt(st,KB[0],KB[1]);tick(s,[k[0]+kk*1.1,k[1]-kk*.9],kk*.55*tk,431);}
 },
 still:C4.fifth+.5,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'willian-dorn-futsal-signature',format:'futsal',title:'Willian Dorn plays out',theme:'A futsal keeper is a fifth outfield player: be ready to pass with your feet.',
 ageNote:'For players aged 7–12: the 2024 World Cup final, its 2–1 result, his two shots and his Golden Glove are real; the passing chapters show how he plays out, not a filmed moment.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in and stops under a sole (a navy boot print), then is passed away right with a red dashed line.
  * Reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const inn=sm(0,.18,age,easeOut),out=sm(.42,.8,age,easeOut),bx=age<.42?lerp(x-160,x,inn):x+190*out,by=y;
  if(age>.42){dashed(s,R,[[x,y+r],[x+95,y+r+6],[x+190,y+r]],7,seed,{dash:22,progress:out});}
  ball(s,bx,by,r*(1-.25*out),seed,{rot:age*(age<.42?9:14)});
  const sole=sm(.12,.2,age)*(1-sm(.4,.5,age));if(sole>.02){const pr=blob(x+4,y-r*.95,r*.9*sole,r*.3*sole,seed+3,{n:18});s.knockout(polyPath(pr,true));s.fill(K,polyPath(pr,true),.85);}
 },
};
export default film;
