/** Pauleta — "the pass across the box": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: the card's Pauleta is the FUTSAL player — Paulo César Vaz Mendes (b. 12 Jun 1994), a Portuguese ala/winger of Sporting CP
 * (lib/town/playerBios.json: "Portuguese ala … Sporting CP"), NOT the Portugal football striker Pedro Pauleta.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the pass across the box, from the left — not one match. No
 * written source we could reach describes ONE dated Pauleta assist across the box (UEFA's reports of his big finals do not describe his
 * passes), so the film follows the brief's honest fallback, like the approved Falcão film: it opens on a REAL, documented Pauleta moment
 * in a big futsal match, then says "Watch how he does it" and shows the pass as a demonstration that is never passed off as that match.
 *  1  LIVE (broadcast camera, main stand, real time): UEFA Futsal EURO 2026 final, 7 Feb 2026, Portugal 3–5 Spain, Arena Stožice,
 *     Ljubljana. Spain lead 3–2 (Antonio Pérez, penalty, 19'20"); in the second half Pauleta (Portugal #14, a substitute) equalises at
 *     29'19" — 3–3. (Spain went on to win 5–3; the narration does not claim otherwise.) FALLBACK RULE: how that goal was scored is not
 *     described anywhere we could reach, so NO goal is staged: the camera holds on the arena and its scoreboard (2–3), swings down on
 *     "Then Pauleta scores" to a ball already in the net and Pauleta already wheeling away, and the board flips to 3–3.
 *  2  HOW HE DOES IT (a labelled demonstration, not the match; broadcast camera, real time; red training tops without numbers for the
 *     attackers, grey bibs for the defenders): he races down the LEFT wing (the near touchline),
 *     gets to the end line, and rolls a ground pass across the goal, past the keeper, to the back post, where a teammate taps it in.
 *  3  REPLAY of the demonstration (slow motion, low, end-on from behind the play): the ball crossing the goal mouth out of the keeper's
 *     reach, the back post, the tap-in.
 *  4  PRACTISE (lesson from the entry's `lesson`: "Pass across the box to the back post where a teammate can tap it in"): the box lit,
 *     the pass drawn across it, the back-post ring stamped, the tap-in and a tick.
 * Sources (written; fetched once, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Pauleta (futsal player)" (raw, Sep 2026): Paulo César Vaz Mendes, born 12 Jun 1994, São Domingos de Rana; Sporting CP
 *    (from 2019), a winger; Portugal international; Cape Verdean descent; UEFA Futsal Champions League 2020–21, World Cup 2021,
 *    Futsal EURO 2022; runner-up at Futsal EURO 2026. — https://en.wikipedia.org/wiki/Pauleta_(futsal_player)
 *  - Wikipedia, "UEFA Futsal Euro 2026 final" (raw): 7 Feb 2026, 19:30, Arena Stožice, Ljubljana, attendance 8,126; Portugal 3–5 Spain;
 *    goals Pérez 1'18", Raya 2'29", Afonso 4'43", Góis 6'35", Pérez 19'20" (pen.), Pauleta 29'19", Pérez 35'20", Adolfo 39'55"; Portugal
 *    line-up: #14 Pauleta (FW) among the substitutes. — https://en.wikipedia.org/wiki/UEFA_Futsal_Euro_2026_final
 *  - UEFA.com final report, "Finale UEFA Futsal EURO 2026: Portogallo - Spagna 3-5" (7 Feb 2026; the Italian edition was served):
 *    "Nella ripresa ha pareggiato Pauleta per il Portogallo" (in the second half Pauleta equalised), then Antonio's decisive third.
 *    https://www.uefa.com/futsaleuro/news/02a2-1fdf1b047fd6-346089e7ed31-1000--uefa-futsal-euro-2026-final-portugal-3-5-spain/
 *  - (checked, not used) Wikipedia "2020–21 UEFA Futsal Champions League" credits Pauleta with Sporting's 4th goal (36:26) in the 4–3
 *    final v Barça, but UEFA's own report credits that goal to Pany Varela — conflicting, so that final is not depicted.
 * CONFIRMED: the match, date, venue, the 3–2 Spain lead before his goal, his equaliser (3–3) in the second half at 29'19", his shirt
 *  number 14, that he started on the bench, that he is Portuguese of Cape Verdean descent and plays as a winger.
 * INFERRED (never named in the narration): kits — Portugal red shirts / green shorts / red socks (team listed first), Spain in a white
 *  change kit with navy shorts, Spain's keeper in green; the court's wood colour; which goal; the celebration's path (to the near
 *  corner); the scoreboard's look (its 2–3 / 3–3 readings are confirmed); his hair and build (short, 1.76 m). HOW the 29'19" goal was
 *  scored is unknown and is not shown. Chapters 2–4 are a demonstration of the pass across the box (the left-foot pass, the teammate's
 *  tap-in, the keeper and bib defenders), not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strikes). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library z → −Z.
 * The demonstration is authored once in the side (broadcast) frame; the replay and the lesson show the SAME choreography through a
 * rotation of the floor (endOn(): side (X,Z) → end-on (Z−10, −9−X), yaw − 90°), so the feet, the pass and the tap-in stay consistent.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights), red (Portugal shirts/socks, post bands), green (Portugal shorts, run-off, Spain's
 *  keeper), navy (key line, stands, shorts, the dashed diagram lines on the wood). Same ink set as the approved Ricardinho (Portugal) futsal film.
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the Euro 2026 final',text:'The Euro 2026 final. Portugal are losing to Spain, three to two. Then Pauleta scores! Three all!',tail:2.6,
  cues:['The Euro','Portugal are losing','three to two','Then Pauleta','scores','Three all'],heads:{'The Euro':'Final 2026','three to two':'2–3','Three all':'3–3'}},
 {label:'How he does it',text:'His special move is the pass across the box. Watch how he does it. He races down the left, gets to the end line, and rolls it across the goal.',tail:2.4,
  cues:['His special move','pass across the box','Watch how','races down the left','end line','rolls it across'],heads:{'His special move':'Signature','Watch how':''}},
 {label:'Replay: the back post',text:'Again, slowly. The keeper can’t reach it. At the back post, a teammate taps it in!',tail:1.8,
  cues:['Again','The keeper','back post','taps it in']},
 {label:'Practise it',text:'Now you try. Pass across the box to the back post, where a teammate can tap it in!',tail:2.6,
  cues:['Now you try','Pass across','back post','tap it in'],heads:{'back post':'Back post','tap it in':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/pauleta-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/pauleta-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/pauleta-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('pauleta: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('pauleta: no cue '+w);return c.at;};
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
function camPath(s:Sheet,t:number,K0:Key[],shake:Pt=[0,0]){const v=key(t,padKeys(mono(K0),[0,0,1,0]),easeInOutSine,true);cam(s,(v[0]||0)+shake[0],(v[1]||0)+shake[1],Number.isFinite(v[2])?v[2]:1,Number.isFinite(v[3])?v[3]:0);}

// ---------------- stage: a perspective camera over the court floor (metres → world units); X right, Y up, Z away ----------------
type Stage={F:number;eye:number;cx:number;cz:number};
const proj=(st:Stage,X:number,Yh:number,Z:number):Pt=>{const k=st.F/Math.max(.25,Z-st.cz);return[(X-st.cx)*k,(st.eye-Yh)*k];};
const kAt=(st:Stage,Z:number)=>st.F/Math.max(.25,Z-st.cz);
const BALL_R=.11;
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line; knocked out to paper first so the ink prints clean on the wood (no overprint) */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);void seed;}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0;
const BUILD={height:1.76,bulk:.96};
/** Pauleta: Portugal #14 (Wikipedia final line-up) — red shirt, green shorts, red socks (kit inferred), short dark hair, Cape Verdean descent */
const SKIN_P:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
const PAULETA:AthleteStyle={shirt:R,shorts:G,socks:R,boots:K,skin:SKIN_P,hair:K,line:K,trim:G,number:14,numberInk:'paper',hairStyle:'short',build:BUILD,seed:14};
const POR=(n:number):AthleteStyle=>({shirt:R,shorts:G,socks:R,boots:K,skin:n%2?[[Y,.84],[R,.3]]:[[R,.36],[Y,.6],[K,.12]],hair:K,line:K,trim:G,hairStyle:n%3?'short':'curly',build:{height:1.72+hash(n,3)*.12},seed:20+n});
/** Spain (inferred white change kit) */
const ESP=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.72],[R,.2]],hair:K,line:K,trim:R,hairStyle:n%2?'short':'balding',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const ESP_GK:AthleteStyle={shirt:G,shorts:K,socks:G,boots:K,skin:[[Y,.72],[R,.2]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:61};
/** the demonstration: neutral grey-blue training bibs for the defenders, a green keeper; Pauleta and the teammate in Portugal red */
const BIB=(n:number):AthleteStyle=>({shirt:[K,.45],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:n?'curly':'short',build:{height:1.8,bulk:1.03},seed:70+n});
const DEMO_GK:AthleteStyle={...ESP_GK,trim:K,seed:66};
/** the attackers in the demonstration wear plain red training tops and navy shorts (no numbers): it is not a match */
const PAULETA_TR:AthleteStyle={...PAULETA,number:undefined,shorts:K,socks:K,trim:'paper'};
const MATE:AthleteStyle={...POR(3),shorts:K,socks:K,trim:'paper',number:undefined,seed:33};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at a strike's contact: just past the kicking toe along the foot (library coords, place at the origin) */
function strikeBall(yaw:number,foot:'l'|'r',power=1):V3{const sk=solve(strike(STRIKE_CONTACT,{foot,power}),BUILD,{yaw}),toe=foot==='l'?sk.lToe:sk.rToe,an=foot==='l'?sk.lAn:sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}
/** the rotation from the side (broadcast) floor to the end-on floor: goal line X=−20 → Z=11, the near touchline Z=0 → X=−10 */
const endOn=(g:Gen):Gen=>t=>{const a=g(t);return{pose:a.pose,yaw:a.yaw-Math.PI/2,X:a.Z-10,Z:-9-a.X};};
const endPt=(X:number,Z:number):[number,number]=>[Z-10,-9-X];

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
type BallState={X:number;Y:number;Z:number;flying:boolean;spin:number};
function drawBallAt(s:Sheet,st:Stage,b:BallState,seed:number,o:{min?:number;smear?:number;dir?:number}={}){const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(o.min??9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.Y>.3?.25:.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:o.smear,dir:o.dir});return{p,r};}

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, red / green / white shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),greens=new Path2D(),whites=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.26)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.36)greens.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)whites.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(R,reds);s.fill(G,greens);s.knockout(whites,.85);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the wood court: yellow screen + a warm red touch, a paper knock-back first so it prints clean */
function woodFloor(s:Sheet,path:Path2D){s.knockout(path);s.fill(Y,path,.62);s.fill(R,path,.1);}

// ---- SIDE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; the goal at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
type SideOpt={cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void;glow?:(st:Stage)=>void;stands?:()=>void;inNet?:()=>void};
function courtSide(s:Sheet,st:Stage,t:number,o:SideOpt={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 // run-off (green + navy) and the wood court
 s.fill(G,rectPath(-span,wall,span*2,span),.55);s.fill(K,rectPath(-span,wall,span*2,span),.3);
 woodFloor(s,polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true));
 o.glow?.(st);
 // painted lines: touchlines, goal line, halfway, the penalty area (6 m arcs from the posts), the 6 m and 10 m marks, the centre circle
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X+6,GOAL_X+10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 // boards and the crowd on the far side
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);o.stands?.();
 sideGoal(s,st,bulge,bz,by,o.inNet);o.keeper?.();sidePosts(s,st);
}
function sideGoal(s:Sheet,st:Stage,bulge:number,bz:number,by:number,inNet?:()=>void){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((Z-bz)**2+(Yh-by)**2)/.35);return proj(st,GOAL_X-lerp(Db,Dt,Yh/H)-d,Yh,Z);};
 const hull=[proj(st,GOAL_X,0,POST_N),proj(st,GOAL_X,H,POST_N),proj(st,GOAL_X,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);inNet?.();
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,GOAL_X,Yh,POST_N),b=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,GOAL_X+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>proj(st,GOAL_X,H+dy,Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---- END-ON court facing the goal (camera looks along +Z): goal centre (0, GZ), wall behind it ----
const GZ=11,WALLZ=13.4;
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;glow?:(st:Stage)=>void};
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 s.fill(G,rectPath(-span,wall,span*2,span),.55);s.fill(K,rectPath(-span,wall,span*2,span),.3);
 woodFloor(s,polyPath(floorQuad(st,-10,-30,10,GZ),true));
 o.glow?.(st);
 const lines=new Path2D(),arcPts:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
 lines.addPath(polyPath(floorStrip(st,[[-10,GZ],[10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts,.05),true));
 lines.addPath(polyPath(floorRing(st,0,GZ-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,GZ-10,.12,12),true));
 lines.addPath(polyPath(floorStrip(st,[[-10,-30],[-10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,-30],[10,GZ]],.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalEnd(s,st,bulge,bx,by);o.keeper?.(st);postsEnd(s,st);
}
function goalEnd(s:Sheet,st:Stage,bulge:number,bx:number,by:number){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((X-bx)**2+(Yh-by)**2)/.35);return proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H)+d);};
 const out=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const X of[Lx,Rx])for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,X,Yh,GZ),b=back(X,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,GZ)*.018),.6);
}
function postsEnd(s:Sheet,st:Stage){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,GZ);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,GZ)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ================= chapter 1 — LIVE: the Euro 2026 final; the scoreboard reads 2–3, then Pauleta's equaliser: ONLY the aftermath =================
// Fallback rule: no invented goal inside the real match. The broadcast camera holds on the arena and the scoreboard (2–3); on "Then
// Pauleta scores" it swings down to the goal: the ball is already in the net and he is already wheeling away; the board flips to 3–3.
const C1={euro:A(0,'The Euro'),losing:A(0,'Portugal'),three:A(0,'three to'),then:A(0,'Then'),scores:A(0,'scores'),all:A(0,'Three all'),end:AUTH[0].seconds};
/** the goal happens off camera (while the camera is on the scoreboard), just before "Then" */
const T_G=C1.then-.35;
const NET:[number,number]=[GOAL_X-.6,10.6];
function liveBall(T:number):BallState{const d=sm(T_G,T_G+.35,T,easeIn);return{X:NET[0],Y:lerp(.5,BALL_R,d)+Math.abs(Math.sin(sm(T_G+.35,T_G+1.2,T)*TAU))*.1*(1-sm(T_G+.35,T_G+1.2,T)),Z:NET[1],flying:false,spin:T*2};}
/** Pauleta: already running away from the goal, arms out, to the near corner; teammates catch him there */
const CEL0:[number,number]=[-16.4,9.4],CEL1:[number,number]=[-11.2,2.6];
const liveF:Gen=T=>{const u=sm(T_G,C1.all+.4,T,easeOut),X=lerp(CEL0[0],CEL1[0],u),Z=lerp(CEL0[1],CEL1[1],u),slow=sm(C1.all,C1.all+1,T);
 const pose=blendPose(celebrate((T-T_G)*1.3,{kind:'run'}),celebrate((T-C1.all)*1.1,{kind:'arms'}),slow);
 return{pose,yaw:yawTo(CEL1[0]-CEL0[0],CEL1[1]-CEL0[1]),X,Z};};
/** Spain (white): standing in their box, heads dropping */
const SPAIN:[number,number,number][]=[[-17.2,11.6,.1],[-16.4,7.0,.4],[-14.2,10.8,.7],[-13.2,5.8,.2]];
const liveSpain=(i:number):Gen=>T=>{const[X,Z,ph]=SPAIN[i],drop=sm(T_G+.3,T_G+1.5,T);
 const pose=blendPose(blendPose(stand(),backpedal(T*.8+ph),.4),posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:44,lShA:10,rShA:10,lElb:20,rElb:20}),drop);
 return{pose,yaw:FACE_RIGHT+(i%2?.5:-.4)*drop+(ph-.4),X,Z};};
/** Portugal's other three (red): run from the box to Pauleta */
const POR_POS:[number,number][]=[[-15.2,12.8],[-12.6,6.4],[-9.4,10.8]];
const livePor=(i:number):Gen=>T=>{const[x0,z0]=POR_POS[i],go=sm(T_G+.2+i*.15,C1.end,T,easeIO),f=liveF(C1.end),tx=f.X+[1.2,-.9,.5][i],tz=f.Z+[1.0,.7,-.8][i];
 const pose=blendPose(stand(),celebrate(T*1.1+i*.3,{kind:'run'}),sm(T_G+.1,T_G+.5,T));
 return{pose,yaw:yawTo(tx-x0,tz-z0),X:lerp(x0,tx,go),Z:lerp(z0,tz,go)};};
/** Spain's keeper: on his line, gets up and turns to look at the net */
const liveK:Gen=T=>({pose:blendPose(stand(),posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:14,neckP:44,lShA:12,rShA:12,lElb:30,rElb:30}),sm(T_G+.4,T_G+1.4,T)),yaw:FACE_RIGHT+2.2*sm(T_G+.3,T_G+1.2,T),X:GOAL_X+.9,Z:9.4});
/** the arena scoreboard (hung above the far stands): Portugal (green bar) | Spain (yellow bar); 7-segment digits */
const SEG:Record<number,string>={2:'abged',3:'abgcd'};
function digit(n:number,x:number,y:number,h:number):Pt[][]{const w=h*.55,P:Record<string,Pt[]>={a:[[x,y],[x+w,y]],b:[[x+w,y],[x+w,y+h/2]],c:[[x+w,y+h/2],[x+w,y+h]],d:[[x,y+h],[x+w,y+h]],e:[[x,y+h/2],[x,y+h]],f:[[x,y],[x,y+h/2]],g:[[x,y+h/2],[x+w,y+h/2]]};return[...SEG[n]].map(c=>P[c]);}
function scoreboard(s:Sheet,st:Stage,T:number){
 const tl=proj(st,-16,9.4,BOARDS+3),br=proj(st,-6,5.2,BOARDS+3),w=br[0]-tl[0],h=br[1]-tl[1],flip=T>=C1.all,fl=pulse(T,C1.all,1.2);
 const panel=polyPath([[tl[0],tl[1]],[br[0],tl[1]],[br[0],br[1]],[tl[0],br[1]]],true);s.knockout(panel);s.fill(K,panel,.92);
 s.stroke(K,polyPath([[tl[0]+w*.5,tl[1]-h*.9],[tl[0]+w*.5,tl[1]]],false),Math.max(2,h*.03),.8);
 s.fill(G,rectPath(tl[0]+w*.08,br[1]-h*.2,w*.34,h*.1));s.fill(Y,rectPath(tl[0]+w*.58,br[1]-h*.2,w*.34,h*.1));
 const dh=h*.52,y0=tl[1]+h*.14,segs=new Path2D();
 for(const[n,x] of[[flip?3:2,tl[0]+w*.17],[3,tl[0]+w*.67]] as [number,number][])for(const sg of digit(n,x,y0,dh))segs.addPath(ribbon(sg,dh*.14,{seed:n*7+Math.round(x),taper:0,wobble:.4}));
 s.fill(Y,segs);if(fl>.02)s.fill(R,rectPath(tl[0]+w*.08,tl[1]+h*.08,w*.36,h*.66),.5*fl);
 const dash=ribbon([[tl[0]+w*.47,y0+dh*.5],[tl[0]+w*.53,y0+dh*.5]],dh*.1,{seed:5,taper:0});s.fill(Y,dash);
}
const liveCam=(T:number)=>({x:key(T,mono([[0,-6.4],[C1.three,-8.4],[C1.then,-10.4],[C1.then+.7,-14.8],[C1.all,-13.6],[C1.end,-12.4]]),easeInOutSine),
 zoom:key(T,mono([[0,.6],[C1.three,.66],[C1.then,.64],[C1.then+.7,.74],[C1.all,.72],[C1.end,.84]]),easeInOutSine),
 y:key(T,mono([[0,330],[C1.three,290],[C1.then,400],[C1.then+.7,1120],[C1.all,1180],[C1.end,1260]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const goal=T>=T_G;
 courtSide(s,st,T,{cheer:goal?1-.3*sm(C1.end-1.5,C1.end,T):.15,flash:pulse(T,T_G+.1,1.4)+.6*pulse(T,C1.all,1.2),bulge:.45*sm(T_G-.1,T_G,T)*(1-.7*sm(T_G+.2,T_G+1.3,T))+.1*settle(T,T_G,{amp:1,freq:3,decay:3}),bz:NET[1],by:.6,
  keeper:()=>{athlete(s,st,liveK,T,ESP_GK,{detail:'low'});},stands:()=>scoreboard(s,st,T),inNet:()=>{drawBallAt(s,st,liveBall(T),18);}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 SPAIN.forEach((_,i)=>{const g=liveSpain(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i),{detail:'low'})});});
 POR_POS.forEach((_,i)=>{const g=livePor(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,POR(i),{detail:'low'})});});
 items.push({z:liveF(T).Z,draw:()=>athlete(s,st,liveF,T,PAULETA)});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** a figure's chest in stage st (the passage enters the red shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const ringPts=(p:Pt,r:number):Pt[]=>{const q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return q;};
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveF(tt),.12));},still:C1.all+.5};

// ================= the DEMONSTRATION (authored once in the side frame, on chapter 2's authored clock) =================
const C2={special:A(1,'His special'),across:A(1,'pass across'),watch:A(1,'Watch'),races:A(1,'races'),byline:A(1,'end line'),rolls:A(1,'rolls'),end:AUTH[1].seconds};
/** the pass: from the left corner of the box (2 m off the end line) along the floor, across the goal, to the back post */
const PB0:[number,number]=[-17.7,2.5],BP:[number,number]=[-18.95,12.45],T_P=C2.rolls+.15,T_ARR=T_P+1.0,T_TAP=T_ARR+.02,T_GOAL=T_TAP+.26;
const IN2:V3=[GOAL_X-.55,.22,11.0];
const YAW_P=yawTo(BP[0]-PB0[0],BP[1]-PB0[1]);
const SBp=toMine(strikeBall(YAW_P,'l',.45)),PLANT_P:[number,number]=[PB0[0]-SBp[0],PB0[1]-SBp[2]];
const YAW_T=yawTo(IN2[0]-BP[0],IN2[2]-BP[1]);
const SBt=toMine(strikeBall(YAW_T,'r',.3)),PLANT_T:[number,number]=[BP[0]-SBt[0],BP[1]-SBt[2]];
const START:[number,number]=[-5.2,1.9],RACE0=-6.9,RACE1=-15.9,S2_T0=T_P-.55;
/** Pauleta's floor position */
function pPos(t:number):[number,number]{
 const X=key(t,mono([[0,START[0]],[C2.races,RACE0,easeIO],[C2.byline+.35,RACE1,linear],[S2_T0,PLANT_P[0]+.3,easeOut],[T_P,PLANT_P[0],easeOut],[T_P+.6,PLANT_P[0]-.2,easeOut],[C2.end,PLANT_P[0]+.6,easeIO]]));
 const Z=key(t,mono([[0,START[1]],[C2.races,START[1]],[C2.byline+.35,2.1],[S2_T0,PLANT_P[1]-.25,easeOut],[T_P,PLANT_P[1],easeOut],[T_P+.6,PLANT_P[1]+.3,easeOut],[C2.end,PLANT_P[1]+.9,easeIO]]));
 return[X,Z];
}
const demoF:Gen=t=>{
 const[X,Z]=pPos(t),stT=key(t,[[S2_T0,0],[S2_T0+.25,.22],[T_P,STRIKE_CONTACT],[T_P+.55,1]],linear);
 let pose:Pose,yaw=FACE_LEFT;
 const racing=sm(C2.races-.2,C2.races+.3,t)*(1-sm(C2.byline+.1,C2.byline+.5,t));
 if(t<S2_T0)pose=dribble(t*lerp(1.3,2.3,racing),{foot:'l',speed:lerp(.25,.75,racing)});
 else if(t<T_P+.6){pose=blendPose(dribble(S2_T0*1.3,{foot:'l',speed:.25}),strike(stT,{foot:'l',power:.45}),sm(S2_T0,S2_T0+.12,t));yaw=lerp(FACE_LEFT,YAW_P,sm(S2_T0-.1,S2_T0+.3,t,easeIO));}
 else{const u=sm(T_P+.6,T_GOAL+.3,t,easeIO);pose=blendPose(strike(1,{foot:'l',power:.45}),t>T_GOAL?celebrate((t-T_GOAL)*1.2,{kind:'arms'}):stand(),u);yaw=lerp(YAW_P,yawTo(BP[0]-PLANT_P[0],BP[1]-PLANT_P[1]),u);}
 return{pose,yaw,X,Z};
};
/** the ball: close to his left foot on the slow dribble, pushed further on the race, set for the pass, across, tapped in, in the net */
function demoBall(t:number):BallState{
 const racing=sm(C2.races-.2,C2.races+.3,t)*(1-sm(C2.byline+.1,C2.byline+.5,t));
 if(t<S2_T0){const[X,Z]=pPos(t),ph=((t*lerp(1.3,2.3,racing))%1+1)%1,k=lerp(.42,.8,racing)+.12*Math.sin(ph*TAU);return{X:X-k,Y:BALL_R,Z:Z+.12,flying:false,spin:t*9};}
 if(t<T_P){const[X0,Z0]=pPos(S2_T0),u=sm(S2_T0,T_P-.18,t,easeOut),k=lerp(.42,.8,racing);return{X:lerp(X0-k,PB0[0],u),Y:BALL_R,Z:lerp(Z0+.12,PB0[1],u),flying:false,spin:t*9};}
 if(t<T_ARR){const s0=sm(T_P,T_ARR,t,linear),u=1-Math.pow(1-s0,1.25);return{X:lerp(PB0[0],BP[0],u),Y:BALL_R,Z:lerp(PB0[1],BP[1],u),flying:false,spin:12+u*22};}
 if(t<T_TAP)return{X:BP[0],Y:BALL_R,Z:BP[1],flying:false,spin:34};
 if(t<T_GOAL){const u=sm(T_TAP,T_GOAL,t,linear);return{X:lerp(BP[0],IN2[0],u),Y:lerp(BALL_R,IN2[1],u),Z:lerp(BP[1],IN2[2],u),flying:true,spin:34+u*20};}
 const d=sm(T_GOAL+.05,T_GOAL+.35,t,easeIn);return{X:IN2[0]-.15*d,Y:lerp(IN2[1],BALL_R,d),Z:IN2[2],flying:false,spin:54};
}
/** the teammate: waits wide at the far side, then attacks the back post and taps in with his right foot */
const M0:[number,number]=[-12.4,15.6],M_GO=C2.byline-.1;
const mateG:Gen=t=>{
 const u=sm(M_GO,T_TAP,t,easeIO),X=lerp(M0[0],PLANT_T[0],u),Z=lerp(M0[1],PLANT_T[1],u),stT=key(t,[[T_TAP-.3,.22],[T_TAP,STRIKE_CONTACT],[T_TAP+.45,1]],linear);
 let pose:Pose;
 if(t<M_GO)pose=blendPose(stand(),runCycle(t*runCadence(.2),{speed:.2}),.35);
 else if(t<T_TAP-.3)pose=runCycle((t-M_GO)*runCadence(.75),{speed:.75});
 else if(t<T_TAP+.5)pose=blendPose(runCycle((T_TAP-.3-M_GO)*runCadence(.75),{speed:.75}),strike(stT,{foot:'r',power:.3}),sm(T_TAP-.3,T_TAP-.15,t));
 else pose=blendPose(strike(1,{foot:'r',power:.3}),celebrate((t-T_TAP-.5)*1.2,{kind:'arms'}),sm(T_TAP+.5,T_TAP+.9,t));
 const yaw=t<T_TAP-.35?yawTo(PLANT_T[0]-M0[0],PLANT_T[1]-M0[1]):lerp(yawTo(PLANT_T[0]-M0[0],PLANT_T[1]-M0[1]),YAW_T,sm(T_TAP-.35,T_TAP-.1,t));
 return{pose,yaw,X,Z};
};
/** defender 1 (bib): jockeys goal-side of Pauleta down the wing, stabs at the pass and misses */
const d1:Gen=t=>{const[px]=pPos(t),X=Math.max(-18.9,px-1.35),Z=3.3+.25*sm(C2.byline,T_P,t);
 const lu=key(t,[[T_P-.3,0],[T_P+.05,.6],[T_P+.7,.9]],linear);let pose=backpedal(t*lerp(1.2,2.2,sm(C2.races,C2.races+.3,t)));pose=blendPose(pose,lunge(lu,{side:'r'}),sm(T_P-.4,T_P-.25,t));
 pose=blendPose(pose,posed({lHipF:14,rHipF:14,lKnee:24,rKnee:24,lean:14,neckP:20,neckY:-50,lShA:16,rShA:16,lElb:30,rElb:30}),sm(T_P+.8,T_P+1.4,t));
 return{pose,yaw:FACE_RIGHT+.25*sm(C2.byline,T_P,t),X,Z};};
/** defender 2 (bib): in the middle, watching the ball; turns too late as it goes behind him */
const d2:Gen=t=>{const u=sm(T_P+.2,T_TAP,t,easeIO),X=lerp(-15.7,-16.6,u),Z=lerp(9.6,10.5,u);let pose=blendPose(backpedal(t*.9+.4),stand(),.5);
 pose=blendPose(pose,lunge(key(t,[[T_P+.4,0],[T_ARR,.55],[T_ARR+.8,.8]],linear),{side:'l'}),sm(T_P+.3,T_P+.5,t));
 return{pose,yaw:lerp(yawTo(PB0[0]+15.7,PB0[1]-9.6),yawTo(-1,.9),sm(T_P,T_ARR,t,easeIO)),X,Z};};
/** the keeper (green): guards his near post, dives across as the ball goes past, out of reach */
const KP:[number,number]=[GOAL_X+.55,9.1];
const demoK:Gen=t=>{const dv=sm(T_P+.18,T_P+1.1,t,linear);let pose=dv>0?keeperDive(dv*.85,{side:'l',height:.05}):keeperSet(t*1.3);
 return{pose,yaw:yawTo(1,-.25*(1-sm(T_P-.2,T_P+.1,t))),X:KP[0]+.15*sm(C2.byline,T_P,t),Z:lerp(KP[1]-.8,KP[1],sm(C2.races,T_P,t))};};

// ================= chapter 2 — HOW HE DOES IT (demonstration, broadcast camera, real time) =================
const demoCam=(t:number)=>({x:key(t,mono([[0,-7.4],[C2.watch,-7.8],[C2.races,-8.6],[C2.byline,-14.2],[C2.rolls,-15.6],[T_ARR,-16.4],[C2.end,-16.2]]),easeInOutSine),
 zoom:key(t,mono([[0,.95],[C2.across-.2,.9],[C2.across+.2,.72],[C2.watch+.1,.72],[C2.watch+.7,.95],[C2.races+.3,.88],[C2.byline,.82],[C2.rolls,.72],[T_ARR,.72],[C2.end,.78]]),easeInOutSine),
 y:key(t,mono([[0,1560],[C2.across-.2,1540],[C2.across+.2,1380],[C2.watch+.1,1380],[C2.watch+.7,1560],[C2.byline,1520],[C2.rolls,1400],[T_ARR,1350],[C2.end,1360]]),easeInOutSine)});
/** the route diagram in the side frame: the dashed pass line across the goal and the back-post ring */
function routeLine(s:Sheet,st:Stage,g:number,seed:number){if(g<=.02)return;const pts:Pt[]=[];for(let k=0;k<=10;k++){const u=k/10;pts.push(proj(st,lerp(PB0[0],BP[0],u),0,lerp(PB0[1],BP[1],u)));}dashed(s,K,pts,14,seed,{dash:40,progress:g});if(g>.9)arrowHead(s,K,pts,40,seed+1);}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc}=clock(1,t0),c=demoCam(tc),st=bst(c.x),tap=pulse(tc,T_TAP,.35);
  cam(s,0,c.y+3*tap*Math.sin(tc*80),c.zoom);
  const b=demoBall(tt),goal=tt>=T_GOAL;
  // "pass across the box": the route is drawn (dashed yellow) and the back post ringed, then it fades before the run
  const route=sm(C2.across,C2.across+.7,tt,easeOut)*(1-sm(C2.watch+.3,C2.watch+.7,tt));
  courtSide(s,st,tt,{cheer:goal?.9:.08,flash:pulse(tt,T_GOAL,1.2),bulge:.45*sm(T_GOAL-.1,T_GOAL,tt)*(1-.6*sm(T_GOAL+.2,T_GOAL+1.1,tt))+.1*settle(tt,T_GOAL,{amp:1,freq:3,decay:3}),bz:IN2[2],by:.6,
   glow:stg=>{
    routeLine(s,stg,route,201);floorDashRing(s,stg,R,BP[0],BP[1],.7,12,203,easeOutBack(sm(C2.across+.4,C2.across+.8,tt))*(1-sm(C2.watch+.3,C2.watch+.7,tt)));
    // "races down the left": a green dashed run line along the touchline, ahead of him
    const run=sm(C2.races,C2.races+.4,tt,easeOut)*(1-sm(C2.byline+.2,C2.byline+.6,tt));if(run>.02){const pts:Pt[]=[];for(let k=0;k<=8;k++)pts.push(proj(stg,lerp(RACE0-.6,RACE1-.4,k/8),0,1.15));dashed(s,G,pts,12,205,{dash:36,progress:run});if(run>.9)arrowHead(s,G,pts,36,206);}
    // "end line": the goal line on his side flashes red
    const el=sm(C2.byline,C2.byline+.25,tt,easeOut)*(1-sm(C2.rolls+.1,C2.rolls+.5,tt));if(el>.02){const p=polyPath(floorStrip(stg,[[GOAL_X,0],[GOAL_X,lerp(0,POST_N-.2,el)]],.16),true);s.knockout(p);s.fill(R,p);}
    // "rolls it across": the ball's trail, dashed yellow on the floor
    if(tt>T_P){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=demoBall(lerp(T_P,Math.min(tt,T_ARR),k/14));pts.push(proj(stg,q.X,0,q.Z));}dashed(s,K,pts,11,207,{dash:34,cov:1-sm(T_GOAL+.6,C2.end,tt)*.6});}
   },
   keeper:()=>{athlete(s,st,demoK,tt,DEMO_GK,{detail:'mid'});}});
  type It={z:number;draw:()=>void};const items:It[]=[];
  items.push({z:d1(tt).Z,draw:()=>athlete(s,st,d1,tt,BIB(0),{detail:'mid'})});
  items.push({z:d2(tt).Z,draw:()=>athlete(s,st,d2,tt,BIB(1),{detail:'mid'})});
  items.push({z:mateG(tt).Z,draw:()=>athlete(s,st,mateG,tt,MATE,{detail:'mid',smear:tt>T_TAP-.2&&tt<T_TAP+.2?.1:0})});
  const f=demoF(tt);items.push({z:f.Z,draw:()=>athlete(s,st,demoF,tt,PAULETA_TR,{smear:(tt>C2.races+.2&&tt<C2.byline)||(tt>T_P-.15&&tt<T_P+.2)?.1:0})});
  items.push({z:b.Z<f.Z+.5&&tt<T_P?f.Z-.01:b.Z-.05,draw:()=>{const r=drawBallAt(s,st,b,218,{smear:b.flying?.4:tt>T_P&&tt<T_ARR?.25:0,dir:Math.atan2(-1,.1)});if(tt>=T_TAP&&tt<T_TAP+.35)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3,{n:9,seed:219,g:easeOut(sm(T_TAP,T_TAP+.25,tt))});}});
  items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 },
 aperture(t0){const{tt,tc}=clock(1,t0),st=bst(demoCam(tc).x),b=demoBall(tt),p=proj(st,b.X,b.Y,b.Z);return aperture(ringPts(p,Math.max(10,kAt(st,b.Z)*BALL_R)*1.2));},
 still:T_P+.55,
};

// ================= chapter 3 — REPLAY of the demonstration: slow motion, low, end-on: out of the keeper's reach, back post, tap-in =================
const C3={again:A(2,'Again'),keeper:A(2,'The keeper'),back:A(2,'back post'),taps:A(2,'taps'),end:AUTH[2].seconds};
/** replay clock → demonstration clock (slow motion, ≈0.3–0.4×) */
const rDemo=(t:number)=>key(t,mono([[0,T_P-1.0],[C3.keeper,T_P+.38],[C3.back,T_P+.92],[C3.taps,T_TAP],[C3.taps+.9,T_GOAL+.1],[C3.end,T_GOAL+.9]]),linear);
const st3:Stage={F:1500,eye:1.3,cx:-2.4,cz:.4};
const E={f:endOn(demoF),m:endOn(mateG),d1:endOn(d1),d2:endOn(d2),k:endOn(demoK)};
const endBall=(t:number):BallState=>{const b=demoBall(t),[X,Z]=endPt(b.X,b.Z);return{...b,X,Z};};
const BPe=endPt(BP[0],BP[1]),KPe=endPt(KP[0],KP[1]),PB0e=endPt(PB0[0],PB0[1]);
const sc3:Scene={
 draw(s,t0){
  const{tt,tc}=clock(2,t0),d=rDemo(tt),dc=rDemo(tc),bc=endBall(dc),bp=proj(st3,bc.X,bc.Y,bc.Z),tap=pulse(tc,C3.taps,.4);
  camPath(s,tc,[[0,-780,40,1.15],[C3.keeper-.6,-420,20,1.2],[C3.keeper+.4,Math.max(-300,bp[0]*.8),10,1.25],[C3.back,380,20,1.3],[C3.taps,420,20,1.4],[C3.taps+.8,300,0,1.3],[C3.end,260,10,1.25]],[5*tap*Math.sin(tc*90),4*tap*Math.cos(tc*77)]);
  const goal=d>=T_GOAL;
  arena(s,st3,{t:d,cheer:goal?.9:0,flash:pulse(d,T_GOAL,1.2),bulge:.5*sm(T_GOAL-.1,T_GOAL,d)*(1-.6*sm(T_GOAL+.2,T_GOAL+1.1,d))+.12*settle(d,T_GOAL,{amp:1,freq:3,decay:3}),bx:endPt(IN2[0],IN2[2])[0],by:.5,
   glow:stg=>{
    // the pass line (dashed yellow, drawn as the ball goes)
    if(d>T_P){const pts:Pt[]=[];for(let k=0;k<=16;k++){const q=endBall(lerp(T_P,Math.min(d,T_ARR),k/16));pts.push(proj(stg,q.X,0,q.Z));}dashed(s,K,pts,10,301,{dash:30});}
    // "The keeper can't reach it": his reach, a red dashed ring on the floor round him — the ball rolls outside it
    const kr=easeOutBack(sm(C3.keeper,C3.keeper+.4,tt))*(1-sm(C3.back+.2,C3.back+.6,tt));floorDashRing(s,stg,R,KPe[0]+.3,KPe[1]-.1,1.7,9,302,kr);
    // "back post": a yellow ring stamps where the teammate arrives
    const bpR=easeOutBack(sm(C3.back,C3.back+.35,tt))*(1-sm(C3.end-.8,C3.end,tt)*.5);floorDashRing(s,stg,K,BPe[0],BPe[1],.6,11,303,bpR);
   },
   keeper:stg=>{athlete(s,stg,E.k,d,DEMO_GK,{detail:'mid'});}});
  // start marker: where the pass came from (a small yellow tick of floor under Pauleta's plant)
  void PB0e;
  type It={z:number;draw:()=>void};const items:It[]=[];
  for(const[g,sty] of [[E.d1,BIB(0)],[E.d2,BIB(1)]] as [Gen,AthleteStyle][])items.push({z:g(d).Z,draw:()=>athlete(s,st3,g,d,sty,{detail:'mid'})});
  items.push({z:E.m(d).Z,draw:()=>athlete(s,st3,E.m,d,MATE,{detail:'high',smear:d>T_TAP-.2&&d<T_TAP+.2?.12:0})});
  items.push({z:E.f(d).Z,draw:()=>athlete(s,st3,E.f,d,PAULETA_TR,{detail:'high',smear:d>T_P-.15&&d<T_P+.2?.12:0})});
  const b=endBall(d);items.push({z:b.Z-.05,draw:()=>{const r=drawBallAt(s,st3,b,311,{min:10,smear:b.flying?.3:0,dir:0});if(d>=T_TAP&&d<T_TAP+.4)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3.2,{n:10,seed:312,g:easeOut(sm(T_TAP,T_TAP+.3,d))});}});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(d>=T_GOAL){const u=sm(T_GOAL,T_GOAL+2.2,d,linear),top=proj(st3,0,6,WALLZ)[1];confetti(s,[R,G,'paper'],[-700,top-200+u*460,1700,380],24,Math.floor(tt*6),{size:15});}
 },
 aperture(t0){const{tc}=clock(2,t0),b=endBall(rDemo(tc)),p=proj(st3,b.X,b.Y,b.Z);return aperture(ringPts(p,Math.max(10,kAt(st3,b.Z)*BALL_R)*1.15));},
 still:C3.back+.1,
};

// ================= chapter 4 — PRACTISE: the box lit, the pass drawn across it, the back post stamped, the tap-in, a tick =================
const C4={now:A(3,'Now'),pass:A(3,'Pass across'),back:A(3,'back post'),tap:A(3,'tap it'),end:AUTH[3].seconds};
const pDemo=(t:number)=>key(t,mono([[0,T_P-1.6],[C4.pass,T_P],[C4.back,T_P+.85],[C4.tap,T_TAP],[C4.end,T_GOAL+2.2]]),linear);
const st4:Stage={F:1500,eye:3,cx:-2.4,cz:3};
/** the box (the 6 m area in futsal) as a floor polygon: goal line + the two quarter-circle arcs + the straight between them */
function boxPoly(st:Stage):Pt[]{const pts:Pt[]=[proj(st,-7.5,0,GZ)];for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;pts.push(proj(st,-1.5-6*Math.cos(a),0,GZ-6*Math.sin(a)));}for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;pts.push(proj(st,1.5+6*Math.cos(a),0,GZ-6*Math.sin(a)));}pts.push(proj(st,7.5,0,GZ));return pts;}
const sc4:Scene={
 draw(s,t0){
  const{tt,tc}=clock(3,t0),d=pDemo(tt),st=st4;
  camPath(s,tc,[[0,-1480,560,1],[C4.pass-.2,-1380,560,1],[C4.pass+.7,-150,480,.8],[C4.back,820,440,.98],[C4.tap+.4,760,430,1],[C4.end,650,440,.94]]);
  const goal=d>=T_GOAL;
  arena(s,st,{t:d,cheer:goal?.8*(1-sm(C4.end-1,C4.end,tt)):0,flash:pulse(d,T_GOAL,1.2),bulge:.45*sm(T_GOAL-.1,T_GOAL,d)*(1-.6*sm(T_GOAL+.2,T_GOAL+1.1,d))+.1*settle(d,T_GOAL,{amp:1,freq:3,decay:3}),bx:endPt(IN2[0],IN2[2])[0],by:.5,
   glow:stg=>{
    // "Now you try": the box lights up (a red screen on the wood)
    const lit=sm(C4.now,C4.now+.5,tt,easeOut);if(lit>.02)s.fill(R,polyPath(boxPoly(stg),true),.34*lit);
    // "Pass across": the dashed yellow pass line is drawn across the box ahead of the ball, with its arrow
    const g=sm(C4.pass-.1,C4.pass+.6,tt,easeOut);if(g>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const u=k/12,[X,Z]=endPt(lerp(PB0[0],BP[0],u),lerp(PB0[1],BP[1],u));pts.push(proj(stg,X,0,Z));}dashed(s,K,pts,14,401,{dash:40,progress:g});if(g>.9)arrowHead(s,K,pts,42,402);}
    // "back post": a big yellow ring and a red ring stamp at the back post
    const bpR=easeOutBack(sm(C4.back,C4.back+.35,tt));floorDashRing(s,stg,K,BPe[0],BPe[1],.75,13,403,bpR);floorDashRing(s,stg,R,BPe[0],BPe[1],1.15,9,404,easeOutBack(sm(C4.back+.12,C4.back+.5,tt)));
   },
   keeper:stg=>{athlete(s,stg,E.k,d,DEMO_GK,{detail:'mid'});}});
  type It={z:number;draw:()=>void};const items:It[]=[];
  items.push({z:E.m(d).Z,draw:()=>athlete(s,st,E.m,d,MATE,{detail:'high'})});
  items.push({z:E.f(d).Z,draw:()=>athlete(s,st,E.f,d,PAULETA_TR,{detail:'high'})});
  const b=endBall(d);items.push({z:b.Z-.05,draw:()=>{drawBallAt(s,st,b,411,{min:10});}});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "tap it in": a big yellow tick stamps above the back post, with a navy misregistered echo
  const tick=easeOutBack(sm(C4.tap+.25,C4.tap+.6,tt));
  if(tick>.02){const g=proj(st,BPe[0],0,BPe[1]),h=kAt(st,BPe[1])*1.77,c:Pt=[g[0]-h*.95,g[1]-h*.95],S=h*.34*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(R,tp);}
 },
 still:C4.back+.4,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'pauleta-futsal-signature',format:'futsal',title:'Pauleta’s pass across the box',theme:'Pass across the box to the back post, where a teammate can tap it in.',
 ageNote:'For players aged 7–12: the Euro 2026 final goal is real; the pass across the box is shown as a demonstration. Practise it with a friend.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls across a dashed yellow line and stops in a back-post ring; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=42;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.45),bx=x-150*(1-easeOut(u)),g=clamp((age-.35)/.4);
  const line=ribbon([[x-170,y+r*.9],[x,y+r*.9]],7,{seed,taper:.2,wobble:1,gaps:dashGaps([[x-170,y],[x,y]],28)});s.fill(Y,line,1-g*.6);
  if(g>0&&g<1){s.fill(Y,ribbon(blob(x,y+r*.9,r*(1+1.6*g),r*(.35+.5*g),seed,{n:24}),8*(1-g)+2,{seed,close:true,wobble:1.2}),1);s.fill(R,ribbon(blob(x,y+r*.9,r*(.6+1.1*g),r*(.22+.35*g),seed+1,{n:24}),6*(1-g)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:-u*6});
 },
};
export default film;
