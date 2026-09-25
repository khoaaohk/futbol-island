/** Catela — "the ala's overlapping run": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Juanjo Catela (b. 15 Apr 1995), a Spanish ala (winger) of FC Barcelona, Spain's #3 at the 2024 FIFA Futsal World Cup
 * (lib/town/playerBios.json: "Spanish ala from Cádiz … FC Barcelona in 2022, a Spain international since 2016"; playerAppearance country
 * Spain — the sources below give the same player: Spain squad, FC Barcelona, winger).
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the ala's overlapping run on the LEFT — not one match. No written
 * source we could reach describes HOW any Catela goal or run happened (Wikipedia match boxes give scorer + minute; the FIFA and UEFA match
 * pages are script shells; he has no Wikipedia article), so the film follows the brief's honest FALLBACK: the real-match chapter shows ONLY
 * confirmed things (the arena, the teams at kick-off, Catela as Spain's ala, a celebration with the board at 3–1, a TV timeline of his three
 * goal times, the 7–1 final whistle) and never stages a goal, pass or run inside that match. The move is a separate, clearly labelled
 * demonstration ("This is how he does it": a team-mate in a training bib, a neutral defender and keeper, no match claimed).
 * The match: his HAT-TRICK in the 2024 FIFA Futsal World Cup group game Spain 7–1 New Zealand. No other futsal film uses it (checked
 * lib/plays/riso/*futsal*: the 2024 World Cup / Andijan / New Zealand appear in none).
 *  1  LIVE (broadcast camera, main stand, real time), CONFIRMED THINGS ONLY: 18 Sep 2024, 20:00, Andijan Universal Sports Complex, Andijan
 *     (Uzbekistan), attendance 1,993 (a thin crowd is drawn). Kick-off: Catela at left ala (a ring, then an arrow along his wing); whip pan
 *     (a cut in time) to a celebration with the arena board at 3–1 (his first goal, 24'26", made it 3–1); a TV timeline (0–40 min, the second
 *     half tinted) drops a ball on each of his goal times 24'26", 31'00", 32'04"; whip pan to the final whistle, board 7–1.
 *  2  HOW HE DOES IT (demonstration, real time, side-on): the ala dribbles down the left, passes inside to a team-mate, keeps running, sprints
 *     round the OUTSIDE of him and his defender, gets the ball back in the space and shoots low to the far post.
 *  3  WATCH AGAIN (replay of the demonstration from the reverse angle, the opposite stand): pass, run round, the defender between two jobs.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Keep moving after you pass: futsal is all about pass and move."): the move again from the
 *     reverse angle; three cards (pass, move, get it back); a tick.
 * Sources (written; fetched with curl and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2024 FIFA Futsal World Cup" (raw; wiki-2024-futsal-wc.txt): 18 Sep 2024, 20:00, Spain 7–1 New Zealand, Andijan Universal
 *    Sports Complex, Andijan, att. 1,993, referee Mohamed Youssef (Egypt); goals Twigg 05'58" (NZ), Mellado 11'14", Gómez 20'18",
 *    Catela 24'26" / 31'00" / 32'04", Gordillo 25'12", Campos 29'50". Catela also scored in Libya 0–8 Spain (18'46").
 *  - Wikipedia, "2024 FIFA Futsal World Cup squads" (raw; wiki-2024-futsal-wc-squads.txt): Spain no. 3 Juanjo Catela, MF, b. 15 Apr 1995,
 *    FC Barcelona.
 *  - Wikipedia, "FC Barcelona Futsal" (raw; wiki-fcb-futsal.txt): no. 13 Juanjo Catela, Winger. "2023–24 UEFA Futsal Champions League"
 *    (raw): Catela scorer lines (e.g. the 5–4 semi-final v Sporting, 21:28). es.wikipedia "Miquel Feixas": Catela's winning penalty in the
 *    2024 Copa de España final shoot-out.
 *  - en/es Wikipedia "Catela" (404: no article) and the es.wikipedia search API (no player article) — so no written description of a goal.
 * CONFIRMED: the match, date, venue, the 7–1 result and every goal time above; Catela Spain's #3, an ala/winger; his three goals all in the
 *  second half (futsal halves are 20 min); his first made it 3–1. The narration states only these.
 * INFERRED (never narrated): kits — Spain red shirts, navy shorts, red socks, yellow trim; New Zealand white shirts, navy shorts, white socks;
 *  the NZ keeper in blue; which end, every position in chapter 1, where the celebration happened and the board's look; Catela's hair (short,
 *  stubble per playerAppearance), his shooting foot (right) and every detail of the demonstration (chapters 2–4 claim no match). No video was
 *  reviewed.
 * Technique (demonstration): the overlap — the ala passes inside, does NOT stop to watch, runs round the OUTSIDE of the team-mate on the ball
 *  (between him and the touchline); the team-mate's defender cannot mark the ball and the runner at once (2 v 1), so the return pass into
 *  the space beyond him is free; the ala takes it in stride and shoots low across the keeper to the far post.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the sprint and the strike). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across;
 *  the attackers' LEFT is −v); each stage maps it with a proper rotation (no mirror), so the right foot stays the right foot. Our stages are
 *  LEFT-handed (X right, Z away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through the
 *  cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagrams), red (Spain, arrows), blue (the training bib, NZ keeper), navy (key line, shorts, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,clamp,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,runCycle,dribble,touchPhase,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: World Cup 2024',text:'The 2024 Futsal World Cup, in Uzbekistan. Spain play New Zealand. Catela is Spain’s ala, a winger. He scores three goals in the second half, and Spain win seven one!',tail:2.4,
  cues:['The 2024','in Uzbekistan','Spain play','Catela','ala','winger','He scores','three goals','second half','Spain win','seven one'],heads:{'The 2024':'World Cup 2024','three goals':'Hat-trick','seven one':'7–1'}},
 {label:'How he does it',text:'An ala plays on the wing, close to the touchline. This is how he does it: he passes inside, then keeps running. He sprints round the outside, gets it back in space and shoots!',tail:2.2,
  cues:['An ala','wing','close to','This is how','passes inside','then keeps','sprints round','outside','gets it','space','shoots'],heads:{'An ala':'The ala','This is how':'The overlap','shoots':''}},
 {label:'Watch again',text:'Watch again. Pass, run round the outside: the defender cannot follow both!',tail:2.4,
  cues:['Watch again','Pass','run round','outside','defender cannot','both'],heads:{'Watch again':'Replay','both':''}},
 {label:'Your turn',text:'Your turn: pass, then keep moving. Futsal is all about pass and move!',tail:2.6,
  cues:['Your turn','pass','then keep','Futsal is','pass and','move'],heads:{'Your turn':'Pass and move','move':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/catela-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/catela-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/catela-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('catela: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('catela: no cue '+w);return c.at;};
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
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the wood */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
/** a yellow dashed line cased in navy (reads on the yellow wood) */
function cased(s:Sheet,pts:Pt[],width:number,seed:number,o:{dash?:number;progress?:number}={}){dashed(s,K,pts,width*1.8,seed,{...o,ko:false,cov:.9});dashed(s,Y,pts,width,seed,{...o});}
function casedHead(s:Sheet,pts:Pt[],size:number,seed:number){arrowHead(s,K,pts,size*1.35,seed,.9);arrowHead(s,Y,pts,size,seed);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);void seed;}
/** a solid red arrow (the pass lines) */
function redArrow(s:Sheet,pts:Pt[],w:number,seed:number,progress=1){const q=partial(smoothPts(pts,false,8),progress);if(q.length<2)return;const rp=ribbon(q,w,{seed,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(progress>.6)arrowHead(s,R,q,w*2.6,seed+1);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- the LOCAL court frame: u = metres out from the goal line (0 = the line), v = across (0 = the goal's centre) ----------------
type Frame={ox:number;oz:number;rot:number};
const toStage=(fr:Frame,u:number,v:number):[number,number]=>{const c=Math.cos(fr.rot),sn=Math.sin(fr.rot);return[fr.ox+u*c-v*sn,fr.oz+u*sn+v*c];};
type Loc={pose:Pose;yaw:number;u:number;v:number};
type LGen=(t:number)=>Loc;

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
/** yaw that faces the floor direction (du,dv) (library yaw 0 faces +u; + turns toward +v) */
const yawTo=(du:number,dv:number)=>Math.atan2(dv,du);
const SKIN:InkFill[]=[[Y,.8],[R,.3]];
const BUILD={height:1.76,bulk:1};
/** Catela: Spain — red shirt, navy shorts, red socks, yellow trim (kit inferred), short dark hair, #3 (the 2024 squad number) */
const CATELA:AthleteStyle={shirt:R,shorts:K,socks:R,boots:'paper',skin:SKIN,hair:K,line:K,trim:Y,hairStyle:'short',number:3,numberInk:Y,build:BUILD,seed:9};
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.78],[R,.26]],hair:K,line:K,trim:Y,hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.72+hash(n,3)*.12},seed:20+n});
const NZL=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.7],[R,.22]],hair:K,line:K,trim:K,hairStyle:n%2?'short':'curly',build:{height:1.74+hash(n,4)*.12},seed:40+n});
const NZL_GK:AthleteStyle={shirt:B,shorts:K,socks:B,boots:K,skin:[[Y,.74],[R,.2]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:61};
/** the demonstration (chapters 2–4): Catela's team-mate in a blue training bib; a neutral paper/navy defender and keeper; no match claimed */
const DEMO_M:AthleteStyle={shirt:B,shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:'paper',hairStyle:'curly',build:{height:1.8,bulk:1.05},seed:76};
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'bald',build:{height:1.82,bulk:1.05},seed:77};
const DEMO_GK:AthleteStyle={shirt:[K,.55],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.22]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:78};
/** THE adapter: draw one athlete from a local generator at time t on stage st / frame fr (prev = one drawn frame earlier; smear = motion echo) */
function athlete(s:Sheet,st:Stage,fr:Frame,gen:LGen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const pl=(l:Loc)=>{const[X,Z]=toStage(fr,l.u,l.v);return placeAt(X,Z,l.yaw+fr.rot);};
 const a=gen(t),b=gen(t-1/12),cm=projector(st);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl(a),{prevPlace:pl(c),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl(a),{prev:b.pose,prevPlace:pl(b)});
}
/** a skeleton in the local frame: joints come back as [u, height, v] */
function jointsL(l:Loc){const sk=solve(l.pose,BUILD,{x:l.u,z:-l.v,yaw:l.yaw}),J=(j:V3):[number,number,number]=>[j[0],j[1],-j[2]];return{sk,J};}

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;smear?:number;dir?:number}={}){
 const{rot=0,smear=0,dir=0}=o;let pts=blob(x,y,r,r,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);s.fill(K,rectPath(x-r*.1,y-r*1.2,r*1.4,r*2.4),.18);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);

// ---------------- the arena: wood court, a thin crowd (1,993 in Andijan), Spain flags, futsal goal ----------------
/** stepped navy rows, lit faces with gaps (a thin crowd), red shirts, Spain flags (red-yellow-red) and a few navy ones; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),navies=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3);
   if(hash(Math.floor((x+off)/(gap*7))*13+r,8)<.38||hash(i,9)<.3)continue;// empty blocks and seats: a thin crowd
   const jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);if(hash(i,4)<.3)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 for(let f=0;f<5;f++){const fx=-2400+f*1150+hash(f,6)*300-((off*.3)%1150),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  if(f===3){navies.addPath(band(0,1));continue;}
  s.knockout(band(0,1));s.fill(Y,band(.25,.75));reds.addPath(band(0,.25));reds.addPath(band(.75,1));}
 s.fill(Y,heads,.6);s.fill(R,reds);s.fill(K,navies,.9);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal goal (3 m × 2 m) on any frame: net halftone + mesh bulging round (bu, by, bv) */
function goalNet(s:Sheet,st:Stage,fr:Frame,bulge:number,bv:number,by:number){
 const H=2,Db=.95,Dt=.55,P=(u:number,Yh:number,v:number):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,Yh,Z);};
 const back=(v:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((v-bv)**2+(Yh-by)**2)/.35);return P(-lerp(Db,Dt,Yh/H)-d,Yh,v);};
 const pts=[P(0,0,-1.5),P(0,H,-1.5),P(0,H,1.5),P(0,0,1.5),back(1.5,0),back(1.5,H),back(-1.5,H),back(-1.5,0)];
 const hull=polyPath(convex(pts),true);s.knockout(hull,.6);s.fill(K,hull,.2);
 const mesh=new Path2D();for(let v=-1.5;v<=1.5+1e-6;v+=.3){const a=back(v,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(v,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(-1.5,Yh);mesh.moveTo(a[0],a[1]);for(let v=-1.2;v<=1.5+1e-6;v+=.3){const b=back(v,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const v of[-1.5,1.5])for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=P(0,Yh,v),b=back(v,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 const Zc=toStage(fr,0,0)[1];s.stroke(K,mesh,Math.max(1.6,kAt(st,Zc)*.018),.6);
}
function goalPosts(s:Sheet,st:Stage,fr:Frame){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),P=(u:number,Yh:number,v:number):[Pt,number]=>{const[X,Z]=toStage(fr,u,v);return[proj(st,X,Yh,Z),kAt(st,Z)];};
 const Zc=toStage(fr,0,0)[1],lw=Math.max(2,kAt(st,Zc)*.012);
 const bar=(a:V3,b:V3,n:number)=>{const seg=(u0:number,u1:number):Pt[]=>{const[p0,k0]=P(lerp(a[0],b[0],u0),lerp(a[1],b[1],u0),lerp(a[2],b[2],u0)),[p1,k1]=P(lerp(a[0],b[0],u1),lerp(a[1],b[1],u1),lerp(a[2],b[2],u1));
   const dx=p1[0]-p0[0],dy=p1[1]-p0[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;return[[p0[0]+nx*w*k0,p0[1]+ny*w*k0],[p1[0]+nx*w*k1,p1[1]+ny*w*k1],[p1[0]-nx*w*k1,p1[1]-ny*w*k1],[p0[0]-nx*w*k0,p0[1]-ny*w*k0]];};
  const q=seg(-.02,1.02);frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<n;k+=2)bands.addPath(polyPath(seg(k/n,(k+1)/n),true));};
 bar([0,0,-1.5],[0,H,-1.5],8);bar([0,0,1.5],[0,H,1.5],8);bar([0,H,-1.5],[0,H,1.5],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
function convex(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo:Pt[]=[],up:Pt[]=[];
 for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}
/** the court's painted lines in the local frame: goal line, the D (6 m quarter circles from the posts), 6 m and 10 m spots, both touchlines */
function courtLines(st:Stage,fr:Frame,lines:Path2D,uMax:number){
 const S=(pts:Pt[])=>pts.map(([u,v])=>toStage(fr,u,v) as Pt),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([6*Math.sin(a),-1.5-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([6*Math.sin(a),1.5+6*Math.cos(a)]);}
 lines.addPath(polyPath(floorStrip(st,S([[0,-10],[0,10]]),.05),true));lines.addPath(polyPath(floorStrip(st,S(arc),.05),true));
 for(const u of[6,10]){const[X,Z]=toStage(fr,u,0);lines.addPath(polyPath(floorRing(st,X,Z,.12,12),true));}
 for(const v of[-10,10])lines.addPath(polyPath(floorStrip(st,S([[0,v],[uMax,v]]),.05),true));
}

// ---- SIDE court from a main-stand position: the halfway line X = 0, the near touchline Z = 0, the far boards Z = 21.
//      FA: the goal on the LEFT (X = −20), attack right → left, the attackers' left wing is the NEAR touchline.
//      FC: the reverse angle from the opposite stand — the same goal on the RIGHT (X = +20), the left wing is now the FAR touchline. ----
const TOUCH_FAR=20,BOARDS=21,FA:Frame={ox:-20,oz:10,rot:0},FC:Frame={ox:20,oz:10,rot:Math.PI};
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
type CourtOpt={cheer?:number;flash?:number;bulge?:number;bv?:number;by?:number;keeper?:()=>void};
function courtSide(s:Sheet,st:Stage,t:number,o:CourtOpt={},fr:Frame=FA){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.45);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 const strips=new Path2D(),seams=new Path2D(),X0=st.cx-30,X1=st.cx+30,z00=Math.max(-1,st.cz+.6);
 for(let k=0;k<46;k++){const z0=z00+k*.5,z1=z0+.5;if(z0>BOARDS)break;const a=proj(st,X0,0,z0),b=proj(st,X1,0,z1);if(hash(k,5)>.55)strips.rect(a[0],b[1],b[0]-a[0],a[1]-b[1]);seams.moveTo(a[0],a[1]);seams.lineTo(proj(st,X1,0,z0)[0],a[1]);
  for(let x=Math.floor(X0/2.4)*2.4+hash(k,9)*2.4;x<X1;x+=2.4){const p=proj(st,x,0,z0),q=proj(st,x,0,z1);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,fr,lines,40);
 lines.addPath(polyPath(floorStrip(st,[[0,0],[0,TOUCH_FAR]],.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,fr,bulge,bv,by);o.keeper?.();goalPosts(s,st,fr);
}

// ================= the overlap (local frame): the ala, his team-mate, the team-mate's defender, the keeper, the ball =================
/** a Catmull-Rom path through knots (metres), n samples a span; knot k sits at sample k·n */
function crPath(pts:Pt[],n=16):Pt[]{const out:Pt[]=[];for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
  for(let j=0;j<n;j++){const u=j/n,u2=u*u,u3=u2*u,f=(a:number,b:number,c:number,d:number)=>.5*(2*b+(c-a)*u+(2*a-5*b+4*c-d)*u2+(3*b-a-3*c+d)*u3);out.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]);}}
 out.push(pts[pts.length-1]);return out;}
/** a monotone cubic Hermite through (xs, ys) with start slope d0 and end slope dn (arc length vs time: no jolts at the knots) */
function hermite(x:number,xs:number[],ys:number[],d0:number,dn:number){
 const n=xs.length;if(x<=xs[0])return ys[0]+d0*(x-xs[0])*0;if(x>=xs[n-1])return ys[n-1];
 const sec=(i:number)=>(ys[i+1]-ys[i])/(xs[i+1]-xs[i]),d=xs.map((_,i)=>i===0?d0:i===n-1?dn:Math.min(sec(i-1),sec(i))*2*Math.max(sec(i-1),sec(i))/Math.max(1e-6,sec(i-1)+sec(i)));
 let i=0;while(i<n-2&&x>xs[i+1])i++;const h=xs[i+1]-xs[i],u=(x-xs[i])/h,u2=u*u,u3=u2*u;
 return(2*u3-3*u2+1)*ys[i]+(u3-2*u2+u)*h*d[i]+(-2*u3+3*u2)*ys[i+1]+(u3-u2)*h*d[i+1];}
const fwdOf=(yaw:number):Pt=>[Math.cos(yaw),Math.sin(yaw)];
const rightOf=(yaw:number):Pt=>[Math.sin(yaw),-Math.cos(yaw)];
/** where the ball sits at a right-foot strike's contact, relative to the stance, for a body facing yaw */
function contactOff(yaw:number):Pt{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[toe[0]+d[0]/l*.08,-(toe[2]+d[1]/l*.08)];}
const S0:Pt=[19.6,-7.5],PASSPT:Pt=[14.8,-7.4];// the ala dribbles down the left wing to here, then passes inside
const MATE:Pt=[11.1,-4.4];// the team-mate (training bib) who receives inside
const DEF0:Pt=[9.0,-4.0],DEFP:Pt=[10.1,-5.0];// his defender: goal side of him, then pressing his back
const KNOTS:Pt[]=[PASSPT,[13.9,-8.3],[11.8,-9.1],[9.4,-9.3],[7.1,-8.7],[5.1,-6.9]];// the overlap run: round the OUTSIDE, then cut in
const RUN=crPath(KNOTS),RUNL:number[]=[0];for(let i=1;i<RUN.length;i++)RUNL.push(RUNL[i-1]+Math.hypot(RUN[i][0]-RUN[i-1][0],RUN[i][1]-RUN[i-1][1]));
const LK=(k:number)=>RUNL[k*16];
function runAt(sd:number):{p:Pt;yaw:number}{const L=clamp(sd,0,RUNL[RUNL.length-1]);let i=1;while(i<RUNL.length-1&&RUNL[i]<L)i++;const a=RUN[i-1],b=RUN[i],u=(L-RUNL[i-1])/Math.max(1e-6,RUNL[i]-RUNL[i-1]);return{p:L2(a,b,u),yaw:yawTo(b[0]-a[0],b[1]-a[1])};}
const ST=KNOTS[KNOTS.length-1];
const TGT:V3=[-.1,.3,1.08];// low, just inside the FAR post (local u, y, v)
const YAW_P=yawTo(MATE[0]-PASSPT[0],MATE[1]-PASSPT[1]);// the pass inside
const YAW_S=yawTo(TGT[0]-ST[0],TGT[2]-ST[1]);// the shot across the keeper
const CB:Pt=(()=>{const o=contactOff(YAW_P);return[PASSPT[0]+o[0],PASSPT[1]+o[1]];})();
const SHOT:Pt=(()=>{const o=contactOff(YAW_S);return[ST[0]+o[0],ST[1]+o[1]];})();
type OvT={pass0:number;sprint:number;ret0:number;rec:number;hit:number};
type Ball={u:number;y:number;v:number;flying:boolean;spin:number};
type Ov={ala:LGen;mate:LGen;def:LGen;gk:LGen;ball:(t:number)=>Ball;T:OvT&{pass1:number;run0:number;stop:number;inn:number};R1B:Pt;TB:Pt};
const ready=(t:number,ph:number)=>{const b=Math.sin(t*5.2+ph)*.5+.5;return posed({lHipF:18,rHipF:18,lKnee:30+6*b,rKnee:28+6*b,lHipA:10,rHipA:10,lean:16,neckP:8,lShA:22,rShA:22,lElb:40,rElb:40});};
/** the team-mate shielding: low wide base, back into the defender, the left arm bent back to feel him */
const SHIELD=posed({lHipF:26,rHipF:24,lKnee:46,rKnee:44,lAnk:-8,rAnk:-8,lHipA:14,rHipA:14,lHipR:10,rHipR:10,lean:22,pitch:4,neckP:14,neckY:30,
 lShF:-44,lShA:36,lShR:12,lElb:34,rShF:30,rShA:42,rElb:60,twist:12,squash:-.04});
const PRESS=posed({lHipF:30,rHipF:12,lKnee:42,rKnee:36,lAnk:-6,lean:24,neckP:16,lShF:52,rShF:44,lShA:18,rShA:16,lElb:52,rElb:46});
function makeOverlap(T0:OvT):Ov{
 const pass1=T0.pass0+.62,run0=T0.pass0+.26,stop=T0.hit-.3,inn=T0.hit+.36,T={...T0,pass1,run0,stop,inn};
 // arc length vs time: jog (run0 → sprint) to the first knot, sprint round the outside (→ rec) to the fourth, carry and cut in (→ stop)
 const xs=[run0,T.sprint,T.rec,stop],ys=[0,LK(1),LK(4),LK(5)],sAt=(t:number)=>hermite(t,xs,ys,.8,(LK(5)-LK(4))/(stop-T.rec)*.9);
 const speedAt=(t:number)=>(sAt(t+.04)-sAt(t-.04))/.08;
 const R1:Pt=(()=>{const r=runAt(LK(4)),f=fwdOf(r.yaw),rt=rightOf(r.yaw);return[r.p[0]+f[0]*.55+rt[0]*.1,r.p[1]+f[1]*.55+rt[1]*.1];})();
 const YAW_R=yawTo(R1[0]-MATE[0],R1[1]-MATE[1]),YAW_M0=yawTo(PASSPT[0]-MATE[0],PASSPT[1]-MATE[1]);
 const TB:Pt=(()=>{const o=contactOff(YAW_R);return[MATE[0]+o[0],MATE[1]+o[1]];})();
 const dribT=Math.max(.5,T.pass0-.36),dribD=Math.hypot(PASSPT[0]-S0[0],PASSPT[1]-S0[1]);
 const dribPos=(t:number):Pt=>L2(S0,PASSPT,sm(0,dribT,t,linear));
 const YAW_D=yawTo(PASSPT[0]-S0[0],PASSPT[1]-S0[1]);
 const ala:LGen=t=>{
  let pose:Pose,yaw:number,p:Pt;
  if(t<dribT){p=dribPos(t);const ph=dribD*sm(0,dribT,t,linear)/1.1;pose=dribble(ph,{foot:'r',speed:.45});yaw=YAW_D;}
  else if(t<run0+.2){p=PASSPT;const u=clamp(STRIKE_CONTACT+(t-T.pass0)/.7,0,1);pose=strike(u,{foot:'r',power:.35});yaw=lerp(YAW_D,YAW_P,sm(dribT-.05,dribT+.15,t));
   if(t>run0-.05){const r=runAt(0);pose=blendPose(pose,runCycle(0,{speed:.3}),sm(run0-.05,run0+.2,t));yaw=lerp(yaw,r.yaw,sm(run0-.05,run0+.2,t));}}
  else if(t<T.hit-.47){const sd=sAt(t),r=runAt(sd);p=r.p;yaw=r.yaw;pose=runCycle(sd/2.3,{speed:clamp(speedAt(t)/6.2,.3,1)});}
  else{const sd=sAt(Math.min(t,stop)),r=runAt(sd);p=r.p;yaw=lerp(r.yaw,YAW_S,sm(T.hit-.47,T.hit-.25,t));
   const u=clamp(STRIKE_CONTACT+(t-T.hit)/.9,0,1),rs=runCycle(sAt(T.hit-.47)/2.3,{speed:.8});pose=blendPose(rs,strike(u,{foot:'r'}),sm(T.hit-.47,T.hit-.34,t));
   const c=sm(inn+.35,inn+.85,t,easeIO);if(c>0){pose=blendPose(pose,celebrate((t-inn-.35)*1.1,{kind:'arms'}),c);yaw=lerp(YAW_S,YAW_S+2.2,c);}}
  return{pose,yaw,u:p[0],v:p[1]};};
 const mate:LGen=t=>{
  let pose:Pose=ready(t,1),yaw=YAW_M0;
  if(t>pass1-.35)pose=blendPose(pose,SHIELD,sm(pass1-.35,pass1+.1,t));
  if(t>T.ret0-.75){yaw=lerp(YAW_M0,YAW_R,sm(T.ret0-.75,T.ret0-.3,t));}
  if(t>T.ret0-.42){const u=clamp(STRIKE_CONTACT+(t-T.ret0)/.8,0,.9);pose=blendPose(pose,strike(u,{foot:'r',power:.4}),sm(T.ret0-.42,T.ret0-.3,t));}
  if(t>T.ret0+.4){pose=blendPose(pose,posed({lHipF:14,rHipF:14,lKnee:24,rKnee:24,lean:10,neckP:4,neckY:30,lShA:18,rShA:18,lElb:34,rElb:34}),sm(T.ret0+.4,T.ret0+.8,t));}
  const c=sm(inn+.4,inn+.9,t);if(c>0)pose=blendPose(pose,celebrate((t-inn)*1.1+.4,{kind:'arms'}),c);
  return{pose,yaw,u:MATE[0],v:MATE[1]};};
 const YAW_DF=yawTo(MATE[0]-DEFP[0],MATE[1]-DEFP[1]);
 const def:LGen=t=>{
  const go=sm(T.pass0,pass1+.25,t,easeOut);let u=lerp(DEF0[0],DEFP[0],go),v=lerp(DEF0[1],DEFP[1],go),yaw=lerp(yawTo(PASSPT[0]-DEF0[0],PASSPT[1]-DEF0[1]),YAW_DF,go);
  let pose=blendPose(backpedal(t*1.1),PRESS,sm(pass1-.3,pass1+.2,t,easeIO));
  // he cannot mark both: his head snaps round to the runner on his right, then back to the ball
  const look=sm(T.sprint+.2,T.sprint+.6,t)*(1-sm(T.ret0-.3,T.ret0,t));if(look>0)pose={...pose,neckY:pose.neckY-1.05*look,twist:pose.twist-.3*look};
  // the return pass: a late lunge toward the lane on his right
  const lu=key(t,[[T.ret0,0],[T.ret0+.45,.6],[T.rec+.4,.8]],linear);if(t>T.ret0){pose=blendPose(pose,lunge(lu,{side:'r'}),sm(T.ret0,T.ret0+.2,t));v-=.35*sm(T.ret0,T.ret0+.5,t,easeOut);}
  const turn=sm(T.rec,T.rec+.7,t,easeIO);if(turn>0){yaw-=1.3*turn;pose=blendPose(pose,posed({lHipF:30,rHipF:20,lKnee:46,rKnee:40,lean:18,neckY:-40,lShA:30,rShA:30,lElb:50,rElb:50}),turn*.8);u-=.4*turn;}
  return{pose,yaw,u,v};};
 const gk:LGen=t=>{const d=sm(T.hit+.02,T.hit+.5,t,linear);let pose=keeperSet(t*1.3);if(d>0)pose=keeperDive(Math.min(.95,.3+d*.65),{side:'l'});
  return{pose,yaw:yawTo(1,-.25*sm(T.rec-.6,T.hit-.2,t)),u:.6,v:-.55*sm(T.rec-.6,T.hit-.2,t,easeIO)};};
 const ahead=(t:number,d=.55):Pt=>{const l=ala(t),f=fwdOf(l.yaw),rt=rightOf(l.yaw);return[l.u+f[0]*d+rt[0]*.1,l.v+f[1]*d+rt[1]*.1];};
 const B47=ahead(T.hit-.47);
 const ballF=(t:number):Ball=>{
  if(t<dribT){const p=ahead(t,.5+.12*Math.sin(t*9)*.5);return{u:p[0],y:BALL_R,v:p[1],flying:false,spin:t*6};}
  if(t<T.pass0){const a=ahead(dribT,.5),u=sm(dribT,T.pass0,t,easeOut);return{u:lerp(a[0],CB[0],u),y:BALL_R,v:lerp(a[1],CB[1],u),flying:false,spin:6};}
  if(t<pass1){const u=sm(T.pass0,pass1,t,easeOut);return{u:lerp(CB[0],TB[0],u),y:BALL_R,v:lerp(CB[1],TB[1],u),flying:false,spin:6+u*8};}
  if(t<T.ret0)return{u:TB[0],y:BALL_R,v:TB[1],flying:false,spin:14};
  if(t<T.rec){const u=sm(T.ret0,T.rec,t,(x:number)=>1-Math.pow(1-x,1.8));return{u:lerp(TB[0],R1[0],u),y:BALL_R,v:lerp(TB[1],R1[1],u),flying:false,spin:14+u*12};}
  if(t<T.hit-.47){const p=ahead(t);return{u:p[0],y:BALL_R,v:p[1],flying:false,spin:26+t*6};}
  if(t<T.hit){const u=sm(T.hit-.47,T.hit,t,easeOut);return{u:lerp(B47[0],SHOT[0],u),y:BALL_R,v:lerp(B47[1],SHOT[1],u),flying:false,spin:32};}
  if(t<inn){const u=sm(T.hit,inn,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M=[lerp(SHOT[0],TGT[0],.5),.34,lerp(SHOT[1],TGT[2],.5)];
   return{u:a*SHOT[0]+b*M[0]+c*TGT[0],y:a*BALL_R+b*M[1]+c*TGT[1],v:a*SHOT[1]+b*M[2]+c*TGT[2],flying:true,spin:40+u*30};}
  const d=sm(inn+.05,inn+.35,t,easeIn),bo=Math.abs(Math.sin(sm(inn+.35,inn+1.1,t)*Math.PI*2))*.1*(1-sm(inn+.35,inn+1.1,t));
  return{u:-.6,y:lerp(TGT[1],BALL_R,d)+bo,v:TGT[2]-.05,flying:false,spin:70};};
 return{ala,mate,def,gk,ball:ballF,T,R1B:R1,TB};
}
/** a ball drawn on stage st through frame fr, with its floor shadow (a flying ball smears back along its flight from the shot) */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:Ball,seed:number,min=9){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R),o=fp(st,fr,SHOT[0],SHOT[1],BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?.45:0,dir:Math.atan2(p[1]-o[1],p[0]-o[0])});return{p,r};
}
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** a player's chest (the passage enters his shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
function jointPt(st:Stage,fr:Frame,l:Loc,name:'head'|'chest'|'pelvis'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];
/** the run drawn on the floor (local path samples from arc length a to b), cased yellow */
function runLine(st:Stage,fr:Frame,a:number,b:number):Pt[]{const out:Pt[]=[];for(let k=0;k<=18;k++){const r=runAt(lerp(a,b,k/18));out.push(fp(st,fr,r.p[0],r.p[1]));}return out;}

// ================= chapter 1 — LIVE: Spain 7–1 New Zealand, Andijan, 18 Sep 2024. Only confirmed things: the arena, the teams at kick-off,
// Catela at left ala, (cut) a celebration with the board at 3–1, the TV timeline of his three goal times, (cut) the 7–1 final whistle. =================
const C1={uzb:A(0,'in Uzbekistan'),esp:A(0,'Spain play'),cat:A(0,'Catela'),ala:A(0,'ala'),wing:A(0,'winger'),scores:A(0,'He scores'),three:A(0,'three goals'),half:A(0,'second half'),win:A(0,'Spain win'),seven:A(0,'seven one'),end:AUTH[0].seconds};
const W0=C1.scores-.12,W1=W0+.26,WM=(W0+W1)/2,V0=C1.win-.14,V1=V0+.26,VM=(V0+V1)/2;
/** kick-off (local u from New Zealand's goal; halfway = 20): Spain attack u → 0; Catela the LEFT ala (−v, the near side) */
const KO_ESP:[number,number][]=[[23.3,-5.6],[21,.6],[23.4,5.4],[27.6,.3]];// Catela (left ala), pivot, right ala, fixo
const KO_NZL:[number,number][]=[[18.4,2.2],[16.2,-4.6],[16.4,5],[13.2,-.3]];
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
const CEL:[number,number]=[8.6,-7.6];// the celebration, near the left corner (position inferred)
const CEL_IN:[number,number][]=[[13.6,-2.8],[16.8,3.6],[21,.8]];
const FIN:[number,number]=[15.4,-2.2];// the final whistle: Spain's players meet in the middle of their attacking half
function kickoffGen(i:number,team:'esp'|'nzl'):LGen{const p=(team==='esp'?KO_ESP:KO_NZL)[i];return t=>({pose:idle(t,i+(team==='esp'?0:.37)),yaw:team==='esp'?Math.PI:0,u:p[0],v:p[1]});}
const liveC:LGen=T=>{
 if(T<WM)return kickoffGen(0,'esp')(T);
 if(T<VM){const c=celebrate((T-WM)*1.1,{kind:'arms'});return{pose:c,yaw:-Math.PI/2+.4*Math.sin((T-WM)*1.4),u:CEL[0],v:CEL[1]};}
 return{pose:celebrate((T-VM)*1.1+.3,{kind:'arms'}),yaw:-Math.PI/2-.35,u:FIN[0]+.3,v:FIN[1]-1.1};};
const liveEsp=(i:number):LGen=>T=>{// i = 0..2: pivot, right ala, fixo
 if(T<WM)return kickoffGen(i+1,'esp')(T);
 if(T<VM){const a=CEL_IN[i],go=sm(WM,VM-.6,T,easeOut),tgt:[number,number]=[CEL[0]+[.9,1.2,-.8][i],CEL[1]+[.9,-.2,1.2][i]],u=lerp(a[0],tgt[0],go),v=lerp(a[1],tgt[1],go);
  return{pose:go<.95?celebrate((T-WM)*1.2+i*.3,{kind:'run'}):celebrate((T-WM)*1.1+i*.4,{kind:'arms'}),yaw:yawTo(CEL[0]-u,CEL[1]-v),u,v};}
 const spot:[number,number][]=[[FIN[0]-.9,FIN[1]+1.1],[FIN[0]+.8,FIN[1]+1.3],[FIN[0]-.7,FIN[1]-1.9]];
 return{pose:celebrate((T-VM)*1.1+i*.37,{kind:'arms'}),yaw:-Math.PI/2+[.3,-.2,.5][i],u:spot[i][0],v:spot[i][1]};};
const liveNzl=(i:number):LGen=>T=>{if(T<WM)return kickoffGen(i,'nzl')(T);
 const base:[number,number]=T<VM?[[5.2,3.6],[11.4,4.2],[3.2,-.9],[14.4,-1.8]][i] as [number,number]:[[20.2,5.8],[22.4,-6.6],[24.2,2.2],[18.6,7.4]][i] as [number,number];
 const walk=T>=VM?sm(VM,C1.end,T,linear):0;
 return{pose:T>=VM?blendPose(posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:10,rShA:10,lElb:24,rElb:24}),runCycle(T*.9+i*.3,{speed:0}),.5):posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:10,rShA:10,lElb:24,rElb:24}),
  yaw:T<VM?(i%2?.7:-.5):Math.PI*.8,u:base[0]+walk*1.2,v:base[1]-walk*.4};};
const liveGK:LGen=T=>T<WM?{pose:keeperSet(T*1.3),yaw:0,u:.7,v:0}:{pose:posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:16,neckP:44,lShA:12,rShA:12,lElb:30,rElb:30}),yaw:-.4,u:.8,v:.4};
const liveCam=(T:number)=>({x:key(T,mono([[0,-.5],[C1.esp,0],[C1.cat,1.2],[C1.ala,2.4],[C1.wing,1.2],[W0,.6],[W1,-10.2],[C1.three,-10.4],[V0,-10.5],[V1,-5],[C1.end,-4.8]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.esp,.58],[C1.cat+.2,.86],[C1.ala,.95],[C1.wing,.9],[W0,.9],[W1,.9],[C1.three,.86],[V0,.86],[V1,.98],[C1.end,1.04]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.cat+.2,1040],[C1.wing,1050],[W1,1100],[C1.three,1150],[V0,1150],[V1,990],[C1.end,980]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'0':[0,1,2,4,5,6],'1':[2,5],'3':[0,2,3,5,6],'6':[0,1,3,4,5,6],'7':[0,2,5]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
function scoreboard(s:Sheet,st:Stage,camX:number,score:string){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=H*.62,y=top-H+H*.19;// Spain left (red tab), New Zealand right (paper tab)
 const tab=(x:number)=>{const p=new Path2D();p.rect(x,top-H+H*.06,W*.16,H*.07);return p;};s.fill(R,tab(cx-W*.38));s.knockout(tab(cx+W*.22));
 digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,score[2],cx+W*.3-h*.55,y,h);s.fill(Y,lit);
}
/** the TV match timeline (0–40 min, halves of 20): the second half tints on "second half"; a ball drops on each of his goal times */
const GOALS=[24+26/60,31,32+4/60];
function timeline(s:Sheet,c:{y:number;zoom:number},T:number){
 const on=sm(C1.three-.15,C1.three+.25,T,easeOut)*(1-sm(V0-.2,V0,T));if(on<=.01)return;
 const z=c.zoom,W=1180/z,x0=-W/2,y=c.y+(430+(1-on)*260)/z,h=26/z,X=(m:number)=>x0+W*m/40;
 const plate=polyPath(handCut([[x0-40/z,y-110/z],[x0+W+40/z,y-110/z],[x0+W+40/z,y+40/z],[x0-40/z,y+40/z]],171,4,90),true);s.knockout(plate);s.fill(K,plate,.9);
 const bar=rectPath(x0,y-h/2,W,h);s.knockout(bar);
 const second=sm(C1.half,C1.half+.4,T);if(second>0)s.fill(Y,rectPath(X(20),y-h/2,(X(40)-X(20))*second,h));
 s.fill(R,rectPath(X(20)-3/z,y-h*1.6,6/z,h*3.2));// half-time tick
 GOALS.forEach((m,i)=>{const g=easeOutBack(sm(C1.three+.1+i*.28,C1.three+.4+i*.28,T));if(g<=.01)return;const bx=X(m),by=y-h/2-30/z*g-14/z;
  s.fill(R,rectPath(bx-2/z,by,4/z,y-h/2-by));ball(s,bx,by-34/z,34/z*g+1,300+i);});
}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const phase=T<WM?0:T<VM?1:2;
 courtSide(s,st,T,{cheer:phase===0?.1:phase===1?.8:.9,flash:phase===1?pulse(T,WM,1.2):phase===2?pulse(T,VM,1.2)+.6*pulse(T,C1.seven,1.2):0,
  keeper:()=>{athlete(s,st,FA,liveGK,T,NZL_GK,{detail:'low'});}});
 if(phase>0)scoreboard(s,st,c.x,phase===1?'3-1':'7-1');
 const items:Item[]=[];
 KO_NZL.forEach((_,i)=>{const g=liveNzl(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,NZL(i),{detail:'low'})});});
 [0,1,2].forEach(i=>{const g=liveEsp(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,ESP(i),{detail:'low'})});});
 items.push({z:depth(FA,liveC(T))-.02,draw:()=>athlete(s,st,FA,liveC,T,CATELA,{detail:'mid'})});
 if(phase===0)items.push({z:10,draw:()=>{drawBallL(s,st,FA,{u:20,y:BALL_R,v:0,flying:false,spin:0},18);}});
 // "ala": a red dashed ring under him; "winger": an arrow down his wing, along the near touchline, toward New Zealand's goal
 if(phase===0){const l=liveC(T),[X,Z]=toStage(FA,l.u,l.v),g=easeOutBack(sm(C1.ala,C1.ala+.35,T))*(1-sm(W0-.3,W0,T));if(g>.02)items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.15,22,50,g);floorDashRing(s,st,R,X,Z,1.15,14,51,g);}});
  const ar=sm(C1.wing,C1.wing+.5,T,easeOut)*(1-sm(W0-.3,W0,T));if(ar>.02)items.push({z:Z-1,draw:()=>{const pts=[fp(st,FA,l.u-.9,l.v-.6),fp(st,FA,l.u-3.4,l.v-2.6),fp(st,FA,l.u-7.4,l.v-3)];cased(s,pts,16,52,{dash:50,progress:ar});if(ar>.9)casedHead(s,pts,46,53);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 for(const[a0,a1] of[[W0,W1],[V0,V1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,a0===W0?Math.PI:0,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
 timeline(s,c,T);
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FA,liveC(tt),.14));},still:C1.wing+.3};

// ================= chapter 2 — HOW HE DOES IT (demonstration, real time, side-on from the main stand): pass inside, keep running, round the
// outside, get it back in space, shoot =================
const C2={ala:A(1,'An ala'),wing:A(1,'wing'),close:A(1,'close to'),how:A(1,'This is'),passes:A(1,'passes inside'),keeps:A(1,'then keeps'),sprints:A(1,'sprints'),outside:A(1,'outside'),gets:A(1,'gets it'),space:A(1,'space'),shoots:A(1,'shoots'),end:AUTH[1].seconds};
const OV=makeOverlap({pass0:C2.passes+.1,sprint:C2.sprints,ret0:C2.gets+.05,rec:C2.space+.1,hit:Math.max(C2.space+.95,C2.shoots+.1)});
const TT=OV.T;
const st2=(t:number):Stage=>({F:2300,eye:3.4,cx:key(t,mono([[0,-2.4],[C2.how,-3.4],[TT.pass0,-6.4],[TT.sprint,-8],[TT.rec,-12.2],[TT.hit,-14.6],[C2.end,-14.8]]),easeInOutSine),cz:-8});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(t),inn=TT.inn,hit=pulse(t,TT.hit,.35);
  camPath(s,t,[[0,60,580,.84],[C2.wing,40,590,.88],[C2.how,0,560,.9],[TT.pass0,-60,540,.88],[TT.sprint,0,560,.92],[TT.rec,0,540,.94],[TT.hit,-100,490,.9],[inn+.6,-140,470,.86],[C2.end,-140,470,.86]],[5*hit*Math.sin(t*80),0]);
  const goal=tt>=inn;
  courtSide(s,st,tt,{cheer:goal?.6:0,flash:pulse(tt,inn,1.2),bulge:.5*sm(inn-.1,inn,tt)*(1-.6*sm(inn+.3,inn+1.2,tt))+.1*settle(tt,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FA,OV.gk,tt,DEMO_GK,{detail:'mid'});}});
  // "wing … close to the touchline": a yellow lane along the near touchline
  const ln=sm(C2.wing,C2.wing+.5,tt,easeOut)*(1-sm(TT.pass0-.3,TT.pass0+.1,tt));
  if(ln>.02){const a=fp(st,FA,20,-8.8),b=fp(st,FA,lerp(20,4,ln),-8.8);cased(s,[a,L2(a,b,.5),b],14,201,{dash:44});}
  const tl=pulse(tt,C2.close,1.1);if(tl>.05){const a=fp(st,FA,22,-10),b=fp(st,FA,2,-10);s.fill(R,ribbon([a,b],10,{seed:202,taper:.1,wobble:1}),tl);}
  // "passes inside": a red pass arrow to the team-mate
  const pa=sm(TT.pass0-.1,TT.pass0+.4,tt,easeOut)*(1-sm(TT.sprint,TT.sprint+.4,tt));
  if(pa>.02)redArrow(s,[fp(st,FA,CB[0],CB[1]),fp(st,FA,lerp(CB[0],OV.TB[0],.5),lerp(CB[1],OV.TB[1],.5)-.2),fp(st,FA,OV.TB[0]+.3,OV.TB[1]-.3)],10,203,pa);
  // "then keeps running … sprints round the outside": his route draws on the floor ahead of him
  const rt=sm(C2.keeps,C2.sprints+.6,tt,easeOut)*(1-sm(TT.hit-.2,TT.hit+.3,tt));
  if(rt>.02){const pts=runLine(st,FA,0,lerp(LK(1),LK(4),rt));cased(s,pts,12,204,{dash:40});casedHead(s,pts,34,205);}
  // "gets it back": a red arrow from the team-mate into the space; "space": a dashed ring on it
  const ra=sm(TT.ret0-.05,TT.ret0+.35,tt,easeOut)*(1-sm(TT.hit-.1,TT.hit+.3,tt));
  if(ra>.02)redArrow(s,[fp(st,FA,OV.TB[0],OV.TB[1]),fp(st,FA,lerp(OV.TB[0],OV.R1B[0],.5),lerp(OV.TB[1],OV.R1B[1],.5)),fp(st,FA,OV.R1B[0],OV.R1B[1])],10,206,ra);
  const sp=easeOutBack(sm(C2.space-.2,C2.space+.2,tt))*(1-sm(TT.hit-.2,TT.hit+.2,tt));
  if(sp>.02){const[X,Z]=toStage(FA,OV.R1B[0],OV.R1B[1]);floorDashRing(s,st,K,X,Z,1.2,20,207,sp);floorDashRing(s,st,Y,X,Z,1.2,12,208,sp);}
  if(tt>TT.hit){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=OV.ball(lerp(TT.hit,Math.min(tt,inn),k/14));pts.push(fp(st,FA,q.u,q.v,q.y));}cased(s,pts,10,209,{dash:36});}
  const b=OV.ball(tt),al=OV.ala(tt),mt=OV.mate(tt),df=OV.def(tt);
  const sprinting=tt>TT.sprint&&tt<TT.rec;
  const items:Item[]=[
   {z:depth(FA,df),draw:()=>athlete(s,st,FA,OV.def,tt,DEMO_D,{detail:'mid'})},
   {z:depth(FA,mt),draw:()=>athlete(s,st,FA,OV.mate,tt,DEMO_M,{detail:'mid'})},
   {z:depth(FA,al)-.001,draw:()=>athlete(s,st,FA,OV.ala,tt,CATELA,{detail:'high',smear:sprinting||(tt>TT.hit-.15&&tt<TT.hit+.2)?.14:0})},
   {z:depth(FA,b)-.01,draw:()=>{drawBallL(s,st,FA,b,211);if(tt>=TT.hit&&tt<TT.hit+.35){const p=fp(st,FA,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],110,{n:9,seed:212,g:easeOut(sm(TT.hit,TT.hit+.25,tt))});}}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "outside": a red ring round the defender (beaten on the outside)
  const ob=easeOutBack(sm(C2.outside,C2.outside+.35,tt))*(1-sm(TT.ret0+.3,TT.ret0+.7,tt));
  if(ob>.02){const h=jointPt(st,FA,df,'chest'),[,Z]=toStage(FA,df.u,df.v),r=kAt(st,Z)*.55*ob;s.fill(R,ribbon(blob(h[0],h[1]+r*.3,r,r*1.3,221,{n:22}),8,{seed:222,close:true,wobble:1}),1);}
  if(tt>=inn&&tt<inn+1.2){const p=fp(st,FA,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],140,{n:12,seed:230,g:easeOut(sm(inn,inn+.3,tt))*(1-sm(inn+.8,inn+1.2,tt))});}
 },
 aperture(t0){const{tt,tc}=clock(1,t0);return aperture(chestPts(st2(tc),FA,OV.ala(tt),.13));},
 still:C2.keeps+.2,
};

// ================= chapter 3 — WATCH AGAIN (replay, reverse angle from the opposite stand: the wing is now the far touchline) =================
const C3={watch:A(2,'Watch'),pass:A(2,'Pass'),run:A(2,'run round'),out:A(2,'outside'),def:A(2,'defender'),both:A(2,'both'),end:AUTH[2].seconds};
/** the replay re-uses the chapter 2 sequence (pass → the ball back in the space), keyed to the words (sequence time = seq3(t)) */
const seq3=(t:number)=>key(t,mono([[0,TT.pass0-.7],[C3.pass,TT.pass0],[C3.run,TT.sprint-.3],[C3.out,lerp(TT.sprint,TT.ret0,.55)],[C3.def,TT.ret0-.2],[C3.both,TT.ret0+.2],[C3.end,TT.rec+.55]]),linear);
const g3=(g:LGen):LGen=>t=>g(seq3(t));
const ala3=g3(OV.ala),mate3=g3(OV.mate),def3=g3(OV.def);
const st3=(q:number):Stage=>({F:4200,eye:4.4,cx:key(q,mono([[TT.pass0-.7,5.4],[TT.pass0,7.4],[TT.sprint,9.2],[TT.ret0,10.8],[TT.rec+.6,12.2]]),easeInOutSine),cz:-7});
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),q=seq3(tt),qc=seq3(t),st=st3(qc);
  camPath(s,t,[[0,0,560,1.1],[C3.pass,0,560,1.22],[C3.run,0,570,1.2],[C3.def,0,560,1.28],[C3.both,0,560,1.24],[C3.end,0,570,1.2]]);
  courtSide(s,st,tt,{keeper:()=>{athlete(s,st,FC,g3(OV.gk),tt,DEMO_GK,{detail:'low'});}},FC);
  // "Pass": the pass arrow; "run round": his whole route draws; "outside": the lane lights; "defender cannot follow both": two red sight lines
  const pa=sm(C3.pass,C3.pass+.4,tt,easeOut)*(1-sm(C3.def,C3.def+.4,tt));
  if(pa>.02)redArrow(s,[fp(st,FC,CB[0],CB[1]),fp(st,FC,lerp(CB[0],OV.TB[0],.5),lerp(CB[1],OV.TB[1],.5)),fp(st,FC,OV.TB[0],OV.TB[1])],9,301,pa);
  const rt=sm(C3.run,C3.out+.3,tt,easeOut);
  if(rt>.02){const pts=runLine(st,FC,0,lerp(0,LK(4),rt));cased(s,pts,11,302,{dash:36});casedHead(s,pts,30,303);}
  const al=ala3(tt),mt=mate3(tt),df=def3(tt),b=OV.ball(q);
  const bt=pulse(tt,C3.both,1.6)+sm(C3.def,C3.def+.3,tt)*(1-sm(C3.both,C3.both+1.4,tt))*.6;
  if(bt>.05){const h=jointPt(st,FC,df,'head');for(const[tg,sd] of[[jointPt(st,FC,mt,'chest'),311],[jointPt(st,FC,al,'chest'),312]] as [Pt,number][]){dashed(s,R,[h,L2(h,tg,.5),tg],8,sd,{dash:26,cov:Math.min(1,bt)});}}
  if(qc>TT.ret0-.05){const ra=sm(TT.ret0-.05,TT.ret0+.4,qc,easeOut);redArrow(s,[fp(st,FC,OV.TB[0],OV.TB[1]),fp(st,FC,lerp(OV.TB[0],OV.R1B[0],.5),lerp(OV.TB[1],OV.R1B[1],.5)),fp(st,FC,OV.R1B[0],OV.R1B[1])],9,313,ra);}
  const items:Item[]=[
   {z:depth(FC,df),draw:()=>athlete(s,st,FC,def3,tt,DEMO_D,{detail:'mid'})},
   {z:depth(FC,mt),draw:()=>athlete(s,st,FC,mate3,tt,DEMO_M,{detail:'mid'})},
   {z:depth(FC,al)-.001,draw:()=>athlete(s,st,FC,ala3,tt,CATELA,{detail:'high',smear:q>TT.sprint&&q<TT.rec?.2:0})},
   {z:depth(FC,b)-.01,draw:()=>{drawBallL(s,st,FC,b,321,9);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "both": a big red question ring over the defender's head
  const qm=easeOutBack(sm(C3.both,C3.both+.35,tt))*(1-sm(C3.end-.8,C3.end-.3,tt));
  if(qm>.02){const h=jointPt(st,FC,df,'head'),[,Z]=toStage(FC,df.u,df.v),r=kAt(st,Z)*.32*qm;s.fill(R,ribbon(blob(h[0],h[1]-r*1.8,r,r,331,{n:18}),7,{seed:332,close:true,wobble:1}),1);
   s.fill(R,polyPath(blob(h[0],h[1]-r*1.8,r*.28,r*.28,333,{n:10}),true));}
 },
 aperture(t0){const{tt,tc}=clock(2,t0);return aperture(chestPts(st3(seq3(tc)),FC,ala3(tt),.13));},
 still:C3.out+.2,
};

// ================= chapter 4 — YOUR TURN: the move again (reverse angle, wide); three cards (pass, move, get it back); a tick =================
const C4={your:A(3,'Your'),pass:A(3,'pass'),keep:A(3,'then keep'),fut:A(3,'Futsal'),pand:A(3,'pass and'),move:A(3,'move'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,TT.pass0-.6],[C4.pass,TT.pass0],[C4.keep,TT.sprint],[C4.pand,TT.ret0+.1],[C4.move,TT.rec+.3],[C4.end,TT.inn+1.2]]),linear);
const g4=(g:LGen):LGen=>t=>g(seq4(t));
const ala4=g4(OV.ala),mate4=g4(OV.mate),def4=g4(OV.def),gk4=g4(OV.gk);
const st4:Stage={F:3400,eye:4.4,cx:10.2,cz:-9};
const CARD_Y=890,CARD_W=165,CARDS:[number,number,'pass'|'move'|'back'][]=[[-420,C4.pass,'pass'],[0,C4.keep,'move'],[420,C4.pand,'back']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,q=seq4(tt),inn=TT.inn;
  camPath(s,t,[[0,0,520,1.05],[C4.your+.4,0,640,.96],[C4.end,0,640,.96]]);
  const goal=q>=inn;
  courtSide(s,st,tt,{cheer:goal?.9*(1-sm(C4.end-1,C4.end,tt)):0,flash:goal?pulse(q,inn,1.2):0,bulge:.5*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q)),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FC,gk4,tt,DEMO_GK,{detail:'low'});}},FC);
  const b=OV.ball(q);
  const items:Item[]=[
   {z:depth(FC,def4(tt)),draw:()=>athlete(s,st,FC,def4,tt,DEMO_D,{detail:'mid'})},
   {z:depth(FC,mate4(tt)),draw:()=>athlete(s,st,FC,mate4,tt,DEMO_M,{detail:'mid'})},
   {z:depth(FC,ala4(tt))-.001,draw:()=>athlete(s,st,FC,ala4,tt,CATELA,{detail:'mid',smear:q>TT.sprint&&q<TT.rec?.15:0})},
   {z:depth(FC,b)-.01,draw:()=>{drawBallL(s,st,FC,b,411,8);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Your turn"; each prints its step as it is said (pass, move, get it back)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-180+dy],[cx+CARD_W,CARD_Y-180+dy],[cx+CARD_W,CARD_Y+180+dy],[cx-CARD_W,CARD_Y+180+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+140;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+(kind==='move'?-30:10),y:gy+25,height:330*(.9+.1*on),azimuth:kind==='pass'?20:kind==='move'?0:30,elevation:14,fov:18,at:[0,0,0]});
    const pose=kind==='pass'?strike(STRIKE_CONTACT+.08,{foot:'r',power:.35}):kind==='move'?runCycle(.3,{speed:1}):dribble(touchPhase,{foot:'r',speed:.6});
    const csk=solve(pose,BUILD,{}),P=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    // the step's diagram: pass = a red arrow away from the foot; move = a yellow run arrow; back = a red arrow INTO the foot, then the ball
    if(kind==='pass'){const tb:V3=[csk.rToe[0]+.18,BALL_R,csk.rToe[2]+.1],p0=P(tb),p1=P([tb[0]+.6,.12,tb[2]+1.5]);redArrow(s,[p0,L2(p0,p1,.5),p1],7,85);ball(s,p0[0],p0[1],BALL_R*(fc.scale?fc.scale(tb):100),81);}
    if(kind==='move'){const pts:Pt[]=[];for(let k=0;k<=10;k++){const a=k/10;pts.push(P([.4+a*1.4,0,-.9+Math.sin(a*Math.PI)*-.5+a*1.3]));}dashed(s,Y,pts,8,86,{dash:22});arrowHead(s,Y,pts,22,87);}
    if(kind==='back'){const tb:V3=[csk.rToe[0]+.14,BALL_R,csk.rToe[2]],p1=P(tb),p0=P([tb[0]+.4,.12,tb[2]+1.6]);redArrow(s,[p0,L2(p0,p1,.5),p1],7,88,Math.min(1,on));ball(s,p1[0],p1[1],BALL_R*(fc.scale?fc.scale(tb):100),82);}
    drawAthlete(s,pose,fc,{...CATELA,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "move": a tick stamps beside him
  const tick=easeOutBack(sm(C4.move+.3,C4.move+.65,tt));
  if(tick>.02){const al=ala4(tt),g=fp(st,FC,al.u,al.v),[,Z]=toStage(FC,al.u,al.v),h=kAt(st,Z)*1.8,c:Pt=[g[0]+h*.7,g[1]-h*.9],S=h*.34*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.keep+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'catela-futsal-signature',format:'futsal',title:'Catela’s overlapping run',theme:'Keep moving after you pass: futsal is all about pass and move.',
 ageNote:'For players aged 7–12: the 2024 World Cup match and Catela’s three goals are real; the overlap is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball is passed away, and a curved run arrow loops round the outside after it; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const go=sm(0,.35,age,easeOut),bx=x+150*go;
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:go*6});
  const sp=sm(.25,.7,age,easeOut)*(1-sm(.9,1.2,age));if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const a=Math.PI+k/12*Math.PI*sp;pts.push([x+75+Math.cos(a)*r*2.2,y+Math.sin(a)*r*1.5]);}s.fill(Y,ribbon(pts,10,{seed,taper:.3,wobble:1}),1);s.fill(R,ribbon(pts.map(p=>[p[0]+4,p[1]+4] as Pt),4,{seed:seed+1,taper:.3,wobble:1}),.6);}
 },
};
export default film;
