/** Adolfo — "the quick 1v1 on the wing": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHY THIS MOMENT: Adolfo's entry (lib/town/iconicPlays.json) is a signature (the quick 1v1 on the right wing), not one match. The best-
 * documented big Adolfo goal we could reach in writing is his extra-time WINNER in the 2022 UEFA Futsal Champions League semi-final:
 * Benfica 4–5 Barcelona (a.e.t.), Arena Riga, 29 April 2022 — Barça were 3–0 down at half-time, came back, and "Adolfo winning it 18
 * seconds from the end" (UEFA.com). No source we could reach describes HOW that goal was scored, so the film follows the brief's honest
 * fallback: chapter 1 shows ONLY confirmed things (the arena, the hanging scoreboard running through the documented score line and goal
 * times, then the celebration) — no goal, pass or tackle of that match is staged, and no ball is shown in it. The move itself is a separate,
 * clearly framed demonstration ("This is how he does it"; the defender and keeper wear neutral training kit; no match is claimed).
 * (Other futsal films already use the 2022 FINAL, Euro 2026 final, Euro 2012/2014/2016 finals and the 2012/2021 World Cup finals; this
 * semi-final is a different match.)
 *  1  LIVE (broadcast camera high in the main stand, up on the scoreboard): 0–0 → Benfica 3–0 at half-time → Barça's four goals (20:21 o.g.,
 *     30:23, 34:08, 37:30) → Chishkala 4–4 (37:56) → extra time: the clock runs to 49:43 and the board flips to 4–5 (Adolfo). The camera
 *     tilts down to the court: Adolfo runs off celebrating, team-mates chase him, Benfica's heads drop.
 *  2  HOW HE DOES IT (demonstration, real time, lower side-on TV angle): he takes the ball on the right wing, runs at his defender fast,
 *     sells a quick fake inside (dips his left shoulder, the ball stays on his right foot), bursts past on the outside and shoots early —
 *     right foot, low, across to the far post — before the keeper is set.
 *  3  WATCH AGAIN (slow-motion replay, reverse angle: low, behind him, the camera tracking his run toward goal): speed, fake, burst, shot.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Attack your defender at speed and shoot early in futsal."): he runs it again; three
 *     cards (attack, speed, shoot early); a tick.
 * Sources (written; fetched with curl and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2021–22 UEFA Futsal Champions League" (raw, cached by an earlier film): SF 2, 29 April 2022, 21:00, Arena Riga, Benfica 4–5
 *    Barcelona (a.e.t.); Benfica: Tayyebi 0:41 (pen.), Rocha 8:57, Afonso Jesus 16:38, Chishkala 37:56; Barcelona: Sousa 20:21 (o.g.),
 *    Ferrão 30:23, Dyego 34:08 and 37:30, Adolfo 49:43; attendance 4,319; referees Manzione / Perona (Italy).
 *    — https://en.wikipedia.org/wiki/2021%E2%80%9322_UEFA_Futsal_Champions_League
 *  - UEFA.com, "UEFA Futsal Champions League final preview: Barça vs Sporting CP" (1 May 2022, cached): "Barça trailed Benfica 3-0 at
 *    half-time but came back to lead before extra time was forced, Adolfo winning it 18 seconds from the end."
 *  - Wikipedia (es), "Adolfo Fernández Díaz" (raw, fetched Sep 2026): born 19 May 1993, Santa Coloma de Gramenet; came through Marfil Santa
 *    Coloma, signed for Barcelona in 2015 (loaned back one season); pívot/ala; Spain debut 2017; UEFA Futsal Champions League 2020 and 2022;
 *    Futsal EURO 2026. — https://es.wikipedia.org/wiki/Adolfo_Fern%C3%A1ndez_D%C3%ADaz
 *  - Wikipedia (es), "Selección de fútbol sala de España" (raw, cached): Adolfo, Barça, listed as ala-pívot, 96 caps.
 *  - UEFA.com match page 2034715 (Benfica v Barça) fetched: a JS shell, no goal description; UEFA's match API refused our requests (400/404);
 *    two web searches returned nothing relevant. Research stopped at the 8-page budget.
 * CONFIRMED (the narration states only these): the competition, round, year, city (Riga), the opponents, 3–0 down (at half-time), the
 *  comeback to 4–4, extra time, Adolfo's late winner, the 5–4 result. On the board: every goal time above.
 * INFERRED (never named in the narration): the kits (Benfica red shirts / white shorts / red socks as the listed home side; Barça blue-and-
 *  garnet stripes / navy shorts / navy socks; Benfica's keeper in yellow); the board's look and where it hangs; which goal, where the
 *  celebration happened and who ran where; Adolfo's short dark hair, his height (drawn 1.76 m) and shooting foot (right) in the
 *  demonstration; his shirt number (not shown). HOW the winner was scored is unknown and deliberately not shown. Chapters 2–4 are a
 *  demonstration of the wing 1v1, not footage of any match. No video was reviewed.
 * Technique (poses): attack the defender at speed with small touches, ball on the outside foot; slow a fraction to sell the fake (shoulder,
 *  head and hips dip to the inside, root steps left, the ball stays out on the right); the defender shifts; explode into the space on the
 *  outside with a long push and a sprint stride; shoot on the next step, low, before the keeper has set his feet.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the burst and the strike). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across,
 *  +v = the attacker's right wing); each stage maps it with a proper rotation (no mirror), so the right foot stays the right foot. Our
 *  stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagrams), red (Benfica, Barça garnet, arrows), blue (Barça blue), navy (key line, stands, board).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2022 semi-final',text:'The 2022 Futsal Champions League semi-final, in Riga. Barça were three nil down to Benfica, but fought back. Four all, extra time. With seconds left, Adolfo scores the winner. Five four!',tail:2.6,
  cues:['The 2022','in Riga','three nil','fought back','Four all','extra time','With seconds','Adolfo scores','the winner','Five four'],heads:{'The 2022':'Semi-final 2022','three nil':'Benfica 3–0','Four all':'4–4','Five four':'Barça win 5–4'}},
 {label:'How he does it',text:'This is how he does it. He takes it on the right wing and runs at his defender, fast. A quick fake inside, then he bursts past and shoots early, before the keeper is ready!',tail:2.2,
  cues:['This is how','He takes','right wing','runs at','fast','quick fake','bursts past','shoots early','before the keeper'],heads:{'right wing':'The 1v1 on the wing','shoots early':''}},
 {label:'Watch again',text:'Watch again, slowly. Speed at the defender, fake, burst past, shoot early!',tail:2.2,
  cues:['Watch again','Speed at','fake','burst past','shoot early'],heads:{'Watch again':'Slow motion','shoot early':''}},
 {label:'Your turn',text:'Your turn: attack your defender at speed, and shoot early!',tail:2.6,
  cues:['Your turn','attack your','at speed','shoot early'],heads:{'Your turn':'Speed, then shoot early','shoot early':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/adolfo-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/adolfo-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/adolfo-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('adolfo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('adolfo: no cue '+w);return c.at;};
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
/** a solid red arrow (a player's movement) */
function redArrow(s:Sheet,pts:Pt[],width:number,seed:number,progress=1){const q=partial(smoothPts(pts,false,8),progress);if(q.length<2)return;const rp=ribbon(q,width,{seed,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(progress>.6)arrowHead(s,R,q,width*2.6,seed+1);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- the LOCAL court frame: u = metres out from the goal line (0 = the line), v = across (0 = the goal's centre) ----------------
/** a stage frame: where the goal centre sits on the stage floor and the rotation (a proper rotation, never a mirror) */
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
const BUILD={height:1.76,bulk:1};
/** Adolfo: Barcelona — blue-and-garnet stripes (blue/red), navy shorts and socks (kit inferred), short dark hair, a quick ala */
const ADOLFO:AthleteStyle={shirt:B,pattern:'stripes',patternInk:R,shorts:K,socks:K,boots:'paper',skin:[[Y,.8],[R,.3]],hair:K,line:K,trim:Y,hairStyle:'short',build:BUILD,seed:11};
const BAR=(n:number):AthleteStyle=>({shirt:B,pattern:'stripes',patternInk:R,shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:Y,hairStyle:(['curly','short','bald'] as const)[n%3],build:{height:1.7+hash(n,3)*.14},seed:20+n});
const BEN=(n:number):AthleteStyle=>({shirt:R,shorts:'paper',socks:R,boots:K,skin:[[Y,.74],[R,.2]],hair:K,line:K,trim:'paper',hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const BEN_GK:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.74],[R,.2]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:61};
/** the demonstration players (chapters 2–4): a neutral paper/navy training kit, no team is claimed */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.05},seed:77};
const DEMO_GK:AthleteStyle={shirt:[K,.55],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.22]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'bald',build:{height:1.82},seed:78};
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

// ---------------- the arena: wood court, stands (Benfica red, Barça blue/garnet), futsal goal ----------------
/** stepped navy rows, lit faces, red and blue shirts, Benfica and Barça flags, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.3)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.42)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 // flags: Benfica (red with a paper band) and Barça (blue and garnet stripes), waving
 for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const flag=polyPath([pole(0,0),pole(.5,0),pole(1,0),pole(1,1),pole(.5,1),pole(0,1)],true);s.knockout(flag);
  if(f%2){reds.addPath(flag);}
  else for(let k=0;k<4;k++)(k%2?reds:blues).addPath(polyPath([pole(k/4,0),pole(k/4+.25,0),pole(k/4+.25,1),pole(k/4,1)],true));}
 s.fill(Y,heads,.6);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal goal (3 m × 2 m) on any frame: net halftone + mesh bulging round (bv, by); posts red/paper bands */
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
/** convex hull of a few points (goal quads seen from any angle stay clean) */
function convex(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo:Pt[]=[],up:Pt[]=[];
 for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}
/** the court's painted lines in the local frame: goal line, the D (6 m quarter circles from the posts), 6 m and 10 m spots, touchlines */
function courtLines(st:Stage,fr:Frame,lines:Path2D,uMax:number){
 const S=(pts:Pt[])=>pts.map(([u,v])=>toStage(fr,u,v) as Pt),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([6*Math.sin(a),-1.5-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([6*Math.sin(a),1.5+6*Math.cos(a)]);}
 lines.addPath(polyPath(floorStrip(st,S([[0,-10],[0,10]]),.05),true));lines.addPath(polyPath(floorStrip(st,S(arc),.05),true));
 for(const u of[6,10]){const[X,Z]=toStage(fr,u,0);lines.addPath(polyPath(floorRing(st,X,Z,.12,12),true));}
 for(const v of[-10,10])lines.addPath(polyPath(floorStrip(st,S([[0,v],[uMax,v]]),.05),true));
}

// ---- SIDE court from the broadcast position (chapters 1–2): the attacked goal at X = +20, the near touchline Z = 0, the far boards Z = 21 ----
//      FR is turned half a turn: u runs toward −X, and +v (the attacker's RIGHT wing) comes toward the camera (the near touchline).
const TOUCH_FAR=20,BOARDS=21,FR:Frame={ox:20,oz:10,rot:Math.PI};
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
type CourtOpt={cheer?:number;flash?:number;bulge?:number;bv?:number;by?:number;keeper?:()=>void};
function courtSide(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.45);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 const strips=new Path2D(),seams=new Path2D(),X0=st.cx-30,X1=st.cx+30,z00=Math.max(-1,st.cz+.6);
 for(let k=0;k<46;k++){const z0=z00+k*.5,z1=z0+.5;if(z0>BOARDS)break;const a=proj(st,X0,0,z0),b=proj(st,X1,0,z1);if(hash(k,5)>.55)strips.rect(a[0],b[1],b[0]-a[0],a[1]-b[1]);seams.moveTo(a[0],a[1]);seams.lineTo(proj(st,X1,0,z0)[0],a[1]);
  for(let x=Math.floor(X0/2.4)*2.4+hash(k,9)*2.4;x<X1;x+=2.4){const p=proj(st,x,0,z0),q=proj(st,x,0,z1);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,FR,lines,40);
 lines.addPath(polyPath(floorStrip(st,[[0,0],[0,TOUCH_FAR]],.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,FR,bulge,bv,by);o.keeper?.();goalPosts(s,st,FR);
}
// ---- END-ON court (chapters 3–4): the camera sits BEHIND the attacker and looks along +Z at the goal (centre X = 0, Z = GZ); the frame is
//      turned so +v (his right wing) is screen right and the run heads away from the camera, a touch to the left ----
const GZ=16,WALLZ=18.6,FB:Frame={ox:0,oz:GZ,rot:-Math.PI/2-.22};
function arena(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 const floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.45);s.fill(R,floor,.3);
 const strips=new Path2D(),seams=new Path2D(),near=st.cz+.35;
 for(let i=-40;i<40;i++){const X0=i*.5,X1=X0+.5;if(hash(i+40,5)>.55)strips.addPath(polyPath([proj(st,X0,0,near),proj(st,X1,0,near),proj(st,X1,0,WALLZ),proj(st,X0,0,WALLZ)],true));
  const a=proj(st,X0,0,near),b=proj(st,X0,0,WALLZ);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);
  for(let z=near+hash(i,9)*2.2;z<WALLZ;z+=2.2){const p=proj(st,X0,0,z),q=proj(st,X1,0,z);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,FB,lines,Math.max(1,GZ-near+2));s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,FB,bulge,bv,by);o.keeper?.();goalPosts(s,st,FB);
}

// ================= the wing 1v1 (local frame): poses, the attacker, the defender, the ball, the keeper =================
/** FAKE: a quick dip to the inside — head, shoulders and hips drop left, the left foot steps out, the ball stays out on the right foot */
const FAKE=posed({lHipF:22,rHipF:10,lKnee:44,rKnee:34,lHipA:30,rHipA:8,lAnk:-6,rAnk:-4,lean:18,bend:-18,twist:24,roll:-8,neckP:14,neckY:22,
 lShF:-12,lShA:44,lElb:50,rShF:22,rShA:30,rElb:54,dz:-.2,squash:-.05});
/** SETTLE: the ball stopped under the right sole, head up, looking at the defender */
const SETTLE=posed({lHipF:14,rHipF:40,lKnee:30,rKnee:48,lAnk:-6,rAnk:-4,lHipA:10,rHipA:4,lean:12,neckP:0,lShA:26,rShA:30,lElb:40,rElb:44});
/** the ready stance (waiting for the pass), a small bounce */
const ready=(t:number)=>{const b=Math.sin(t*5.2)*.5+.5;return posed({lHipF:18,rHipF:18,lKnee:30+6*b,rKnee:28+6*b,lHipA:10,rHipA:10,lean:14,neckP:8,lShA:22,rShA:22,lElb:40,rElb:40});};
const RECV_P:[number,number]=[19.4,6.7];// he takes the pass here (just past halfway, right wing)
const FAKE_P:[number,number]=[12.1,6.3];// where he sells the fake
const FAKE_E:[number,number]=[11.75,6.08];// the fake's dip (a step inside)
const BURST_M:[number,number]=[10.2,7.15];// the burst goes round the outside
const STANCE:[number,number]=[8.3,6.1];// the planted foot's spot for the shot
const PASS_FROM:[number,number]=[23.8,1.2];
const DEF0:[number,number]=[15.8,5.7],DEF1:[number,number]=[10.35,5.75];
const GK_P:[number,number]=[.72,1.05];
const TGT:V3=[-.1,.3,-1.08];// low, inside the FAR post (local u, y, v)
const YAW_S=yawTo(TGT[0]-STANCE[0],TGT[2]-STANCE[1]);
const RUN_DIR:[number,number]=(()=>{const d=[FAKE_P[0]-RECV_P[0],FAKE_P[1]-RECV_P[1]],l=Math.hypot(d[0],d[1]);return[d[0]/l,d[1]/l];})();
const YAW_RUN=yawTo(RUN_DIR[0],RUN_DIR[1]);
/** where the ball sits at the right-foot strike's contact (local, relative to the stance) */
const SB:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD,{yaw:YAW_S}),toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[toe[0]+d[0]/l*.08,-(toe[2]+d[1]/l*.08)];})();
const SHOT:[number,number]=[STANCE[0]+SB[0],STANCE[1]+SB[1]];
const bez=(a:[number,number],b:[number,number],c:[number,number],u:number):[number,number]=>[(1-u)*(1-u)*a[0]+2*u*(1-u)*b[0]+u*u*c[0],(1-u)*(1-u)*a[1]+2*u*(1-u)*b[1]+u*u*c[1]];
type WingT={pass0:number;recv:number;run0:number;fake:number;burst:number;hit:number};
type Ball={u:number;y:number;v:number;flying:boolean;spin:number};
type Wing={att:LGen;def:LGen;gk:LGen;ball:(t:number)=>Ball;inn:number;st0:number};
function makeWing(T:WingT):Wing{
 const inn=T.hit+.5,st0=T.hit-.32;
 const accel=(x:number)=>x*x*(2-x);// starts slow, ends at full speed
 const posAt=(t:number):[number,number]=>{
  if(t<T.run0)return RECV_P;
  if(t<T.fake){const u=accel(sm(T.run0,T.fake,t,linear));return[lerp(RECV_P[0],FAKE_P[0],u),lerp(RECV_P[1],FAKE_P[1],u)];}
  if(t<T.burst){const u=sm(T.fake,T.burst,t,easeOut);return[lerp(FAKE_P[0],FAKE_E[0],u),lerp(FAKE_P[1],FAKE_E[1],u)];}
  if(t<st0){const u=sm(T.burst,st0,t,x=>1-(1-x)*(1-x)*(1-.3*x));return bez(FAKE_E,BURST_M,STANCE,u);}
  const f=t>T.hit?.3*sm(T.hit,T.hit+.6,t,easeOut):0;return[STANCE[0]+f*Math.cos(YAW_S),STANCE[1]+f*Math.sin(YAW_S)];};
 const burstYaw=(t:number)=>{const u=sm(T.burst,st0,t,linear),a=bez(FAKE_E,BURST_M,STANCE,Math.max(0,u-.05)),b=bez(FAKE_E,BURST_M,STANCE,Math.min(1,u+.05));return yawTo(b[0]-a[0],b[1]-a[1]);};
 const dribPh=(t:number)=>(t-T.run0)*runCadence(.8)*1.3;
 const att:LGen=t=>{
  const[u,v]=posAt(t);let pose:Pose,yaw=YAW_RUN;
  if(t<T.recv){pose=ready(t);yaw=lerp(yawTo(PASS_FROM[0]-RECV_P[0],PASS_FROM[1]-RECV_P[1]),YAW_RUN,sm(T.recv-.5,T.recv,t,easeIO));}
  else if(t<T.run0){pose=blendPose(ready(t),SETTLE,sm(T.recv-.1,T.recv+.2,t,easeIO));}
  else if(t<T.fake){pose=blendPose(SETTLE,dribble(dribPh(t),{foot:'r',speed:lerp(.6,1,sm(T.run0,T.fake,t))}),sm(T.run0,T.run0+.25,t,easeIO));}
  else if(t<T.burst){const d=dribble(dribPh(t),{foot:'r',speed:.8}),rock=.5+.5*Math.sin((t-T.fake)*9);pose=blendPose(d,FAKE,sm(T.fake,T.fake+.22,t,easeIO)*(1-.15*rock*sm(T.fake+.3,T.fake+.5,t)));
   pose=blendPose(pose,runCycle(0,{speed:1}),sm(T.burst-.14,T.burst,t,easeIO));yaw=YAW_RUN-.12*sm(T.fake,T.fake+.22,t);}
  else if(t<st0){pose=runCycle((t-T.burst)*runCadence(1)*1.1,{speed:1});yaw=burstYaw(t);}
  else{const k=key(t,[[st0,.22],[T.hit,STRIKE_CONTACT],[T.hit+.5,.82],[T.hit+1.1,.95]],linear);pose=blendPose(runCycle((st0-T.burst)*runCadence(1)*1.1,{speed:1}),strike(k,{foot:'r'}),sm(st0-.06,st0+.1,t,easeIO));
   yaw=lerp(burstYaw(st0-.01),YAW_S,sm(st0-.06,st0+.12,t,easeIO));
   const c=sm(inn+.4,inn+.9,t,easeIO);if(c>0){pose=blendPose(pose,celebrate((t-inn-.4)*1.1,{kind:'arms'}),c);yaw=lerp(YAW_S,YAW_S-1.9,c);}}
  return{pose,yaw,u,v};};
 const DEF_F:[number,number]=[DEF1[0],DEF1[1]-.45],DEF_E:[number,number]=[9.7,4.9];
 const def:LGen=t=>{
  let u:number,v:number,pose:Pose,yaw=0;
  const shuffle=backpedal(t*1.6);
  if(t<T.fake){const g=sm(T.run0,T.fake,t,easeIO);u=lerp(DEF0[0],DEF1[0],g);v=lerp(DEF0[1],DEF1[1],g);pose=blendPose(stand(),shuffle,sm(T.recv-.3,T.recv+.2,t));}
  else{const sh=sm(T.fake+.05,T.fake+.4,t,easeIO),lu=key(t,[[T.fake,0],[T.fake+.35,.6],[T.burst+.2,.64]],linear);
   u=DEF1[0];v=lerp(DEF1[1],DEF_F[1],sh);pose=blendPose(shuffle,lunge(lu,{side:'r'}),sm(T.fake,T.fake+.25,t,easeIO));
   const ch=sm(T.burst+.25,T.hit+.6,t,easeIO);if(ch>0){u=lerp(DEF_F[0],DEF_E[0],ch);v=lerp(DEF_F[1],DEF_E[1],ch);pose=blendPose(pose,runCycle((t-T.burst)*runCadence(.6),{speed:.6}),sm(T.burst+.2,T.burst+.55,t,easeIO));}
   yaw=lerp(0,Math.PI*.92,sm(T.burst+.1,T.burst+.6,t,easeIO));}
  return{pose,yaw,u,v};};
 const gk:LGen=t=>{const d=sm(T.hit+.1,T.hit+.6,t,linear);let pose=keeperSet(t*1.3);if(d>0)pose=keeperDive(Math.min(.95,.3+d*.65),{side:'r'});
  return{pose,yaw:.3-.2*d,u:GK_P[0],v:GK_P[1]-.5*sm(T.hit,T.hit+.4,t)};};
 // the ball
 const RB0:[number,number]=[RECV_P[0]+RUN_DIR[0]*.45,RECV_P[1]+RUN_DIR[1]*.45+.15];
 const carried=(t:number):[number,number]=>{const[u,v]=posAt(t),ph=dribPh(t),fk=sm(T.fake,T.fake+.25,t),lead=lerp(.5+.22*Math.sin(TAU*ph),.42,fk),side=lerp(.14,.34,fk);
  return[u+RUN_DIR[0]*lead,v+RUN_DIR[1]*lead+side];};
 let BB:[number,number]|null=null;
 const ballF=(t:number):Ball=>{
  if(t<T.pass0)return{u:PASS_FROM[0],y:BALL_R,v:PASS_FROM[1],flying:false,spin:0};
  if(t<T.recv){const u=sm(T.pass0,T.recv,t,easeOut);return{u:lerp(PASS_FROM[0],RB0[0],u),y:BALL_R,v:lerp(PASS_FROM[1],RB0[1],u),flying:false,spin:u*10};}
  if(t<T.run0)return{u:RB0[0],y:BALL_R,v:RB0[1],flying:false,spin:10};
  if(t<T.burst){const g=sm(T.run0,T.run0+.3,t),[cu,cv]=carried(t);return{u:lerp(RB0[0],cu,g),y:BALL_R,v:lerp(RB0[1],cv,g),flying:false,spin:10+(t-T.recv)*8};}
  if(!BB)BB=carried(T.burst-.001);
  if(t<T.hit){const u=easeOut(sm(T.burst,T.hit-.04,t,linear)),p=bez(BB,[BURST_M[0]-.9,BURST_M[1]+.05],SHOT,u);return{u:p[0],y:BALL_R,v:p[1],flying:false,spin:20+u*8};}
  if(t<inn){const u=sm(T.hit,inn,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M=[lerp(SHOT[0],TGT[0],.5),.4,lerp(SHOT[1],TGT[2],.5)];
   return{u:a*SHOT[0]+b*M[0]+c*TGT[0],y:a*BALL_R+b*M[1]+c*TGT[1],v:a*SHOT[1]+b*M[2]+c*TGT[2],flying:true,spin:30+u*30};}
  const d=sm(inn+.05,inn+.35,t,easeIn),bo=Math.abs(Math.sin(sm(inn+.35,inn+1.1,t)*Math.PI*2))*.1*(1-sm(inn+.35,inn+1.1,t));
  return{u:-.62,y:lerp(TGT[1],BALL_R,d)+bo,v:TGT[2]+.05,flying:false,spin:60};};
 return{att,def,gk,ball:ballF,inn,st0};
}
/** a ball drawn on stage st through frame fr, with its floor shadow (a flying ball smears back along its flight from the shot) */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:Ball,seed:number,min=9){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R),o=fp(st,fr,SHOT[0],SHOT[1],BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?.45:0,dir:Math.atan2(p[1]-o[1],p[0]-o[0])});return{p,r};
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** the player's chest (the passage enters his striped shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
/** a joint of a player on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:'lSh'|'rSh'|'chest'|'pelvis'|'head'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];

// ---------------- the hanging scoreboard (a riso seven-segment board; score + match clock) ----------------
const SEG:Record<string,number[]>={'0':[1,1,1,1,1,1,0],'1':[0,1,1,0,0,0,0],'2':[1,1,0,1,1,0,1],'3':[1,1,1,1,0,0,1],'4':[0,1,1,0,0,1,1],'5':[1,0,1,1,0,1,1],'6':[1,0,1,1,1,1,1],'7':[1,1,1,0,0,0,0],'8':[1,1,1,1,1,1,1],'9':[1,1,1,1,0,1,1]};
const SEGL:[Pt,Pt][]=[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[1,2]],[[0,2],[1,2]],[[0,1],[0,2]],[[0,0],[0,1]],[[0,1],[1,1]]];
/** digits (and ':') as ribbons into `path`; h = digit height, sy squashes a flipping digit; returns the width used */
function digits(path:Path2D,str:string,x:number,y:number,h:number,seed:number,sy=1):number{
 const w=h*.5,gap=h*.26,lw=h*.13;let cx=x;
 for(const ch of str){
  if(ch===':'){for(const dy of[.6,1.4])path.addPath(polyPath(blob(cx+lw*.6,y+dy*h/2,lw*.62,lw*.62,seed+dy*7,{n:10}),true));cx+=lw*1.2+gap;continue;}
  const on=SEG[ch];if(!on){cx+=w+gap;continue;}
  if(ch==='1')cx-=w*.55;
  on.forEach((v,i)=>{if(!v)return;const[a,b]=SEGL[i],p:Pt[]=[[cx+a[0]*w,y+h/2+(a[1]-1)*h/2*sy],[cx+b[0]*w,y+h/2+(b[1]-1)*h/2*sy]];path.addPath(ribbon(p,lw,{seed:seed+i,taper:0,wobble:.4}));});
  cx+=w+gap;}
 return cx-x-gap;
}
type Board={home:number;away:number;clock:string;flipH:number;flipA:number;glow:number};
/** the board, flat to the camera, centred at sheet point c, k units per metre (6 m × 3 m): Benfica (red swatch) left, Barça (blue/garnet) right */
function scoreboard(s:Sheet,c:Pt,k:number,b:Board,seed:number){
 const W=6*k,H=3*k,x0=c[0]-W/2,y0=c[1]-H/2,box=handCut([[x0,y0],[x0+W,y0],[x0+W,y0+H],[x0,y0+H]],seed,k*.05,k*.9);
 const cab=new Path2D();for(const u of[.18,.82])cab.addPath(ribbon([[x0+W*u,y0],[x0+W*u+(u-.5)*k*.6,y0-k*9]],Math.max(2,k*.04),{seed:seed+2,taper:0,wobble:.5}));s.fill(K,cab,.8);
 if(b.glow>.02)s.fill(Y,polyPath(blob(c[0],c[1],W*.62*(1+.08*b.glow),H*.75*(1+.1*b.glow),seed+3,{amp:.04,n:28}),true),.35*b.glow);
 const bp=polyPath(box,true);s.knockout(bp);s.fill(K,bp,.92);s.fill(R,ribbon([...box,box[0]],k*.09,{seed:seed+4,close:true,wobble:.6}));
 const sw=k*.9,sh=k*.62,ly=y0+H*.2;
 const pr=polyPath(handCut([[x0+k*.35,ly],[x0+k*.35+sw,ly],[x0+k*.35+sw,ly+sh],[x0+k*.35,ly+sh]],seed+5,k*.02,k*.4),true);s.knockout(pr);s.fill(R,pr);
 const ax=x0+W-k*.35-sw,ap=polyPath(handCut([[ax,ly],[ax+sw,ly],[ax+sw,ly+sh],[ax,ly+sh]],seed+6,k*.02,k*.4),true);s.knockout(ap);s.fill(B,ap);
 const gs=new Path2D();for(let i=1;i<4;i+=2)gs.rect(ax+sw*i/4,ly,sw/4,sh);s.fill(R,gs);
 const dh=H*.36,num=new Path2D(),syH=1-.8*Math.sin(Math.PI*clamp(b.flipH)),syA=1-.8*Math.sin(Math.PI*clamp(b.flipA));
 digits(num,String(b.home),c[0]-k*1.35,ly-dh*.02,dh,seed+10,syH);digits(num,String(b.away),c[0]+k*.85,ly-dh*.02,dh,seed+20,syA);
 num.addPath(ribbon([[c[0]-k*.32,ly+dh*.5],[c[0]+k*.32,ly+dh*.5]],dh*.13,{seed:seed+30,taper:0}));
 s.knockout(num);
 const clk=new Path2D(),ch=H*.2,cw=digits(new Path2D(),b.clock,0,0,ch,0);digits(clk,b.clock,c[0]-cw/2,y0+H*.7,ch,seed+40);s.knockout(clk);s.fill(Y,clk);
}
const mmss=(sec:number)=>{const m=Math.floor(sec/60),ss=Math.floor(sec%60);return`${m}:${ss<10?'0':''}${ss}`;};

// ================= chapter 1 — LIVE: the 2022 semi-final in Riga. Only confirmed things: the board runs through the documented score line and
// goal times (0–0, 3–0 at half-time, 3–1 … 3–4, 4–4, extra time, 4–5 at 49:43), then the camera tilts down onto the celebration. No goal,
// pass or tackle of the match is staged and no ball is shown. =================
const C1={the:A(0,'The 2022'),riga:A(0,'in Riga'),three:A(0,'three nil'),fought:A(0,'fought'),four:A(0,'Four all'),extra:A(0,'extra'),secs:A(0,'With seconds'),scores:A(0,'Adolfo scores'),winner:A(0,'the winner'),five:A(0,'Five four'),end:AUTH[0].seconds};
/** the board over the centre of the court (X = 0, 11 m up, above the halfway line); goal times from the Wikipedia match box */
const BOARD_AT:V3=[0,11,10];
const ZT=C1.scores;
/** Barça's comeback: their four goals flip one after another on "fought back" (20:21, 30:23, 34:08, 37:30) */
const AWAY_T=[0,1,2,3].map(i=>C1.fought+.1+i*.32),AWAY_CLK=[20*60+21,30*60+23,34*60+8,37*60+30];
function board1(T:number):Board{
 const f3=C1.three+.05,f4=C1.four+.05;
 const home=T<f3?0:T<f4?3:4;
 let away=0;AWAY_T.forEach(a=>{if(T>=a)away++;});if(T>=ZT+.05)away=5;
 let clk:number;
 if(T<f3)clk=lerp(0,4,sm(0,f3,T,linear));
 else if(T<AWAY_T[0])clk=20*60;
 else if(T<f4){let i=0;AWAY_T.forEach((a,k)=>{if(T>=a)i=k;});clk=AWAY_CLK[i];}
 else if(T<C1.extra)clk=lerp(37*60+56,40*60,sm(f4+.4,C1.extra,T,linear));
 else if(T<ZT+.05)clk=lerp(40*60,49*60+43,sm(C1.extra,ZT+.05,T,linear));
 else clk=49*60+43;
 const lastA=T>=ZT+.05?ZT+.05:[...AWAY_T].reverse().find(a=>T>=a)??-9,lastH=T>=f4?f4:T>=f3?f3:-9;
 return{home,away,clock:mmss(clk),flipH:sm(lastH,lastH+.25,T,linear),flipA:sm(lastA,lastA+.25,T,linear),glow:pulse(T,ZT+.05,1.6)};
}
/** after the winner: Adolfo runs off toward the near corner, arms out; team-mates chase him; Benfica's heads drop (positions inferred) */
const RUN0:[number,number]=[7.2,1.4],RUN1:[number,number]=[3.6,7.6];// local (u from Benfica's goal, v): toward the near touchline
const liveA:LGen=T=>{const u=sm(ZT+.2,ZT+2.8,T,easeOut),pu=lerp(RUN0[0],RUN1[0],u),pv=lerp(RUN0[1],RUN1[1],u);
 let pose=celebrate((T-ZT)*1.3,{kind:'run'});pose=blendPose(pose,celebrate((T-ZT)*1.1,{kind:'arms'}),sm(ZT+2.4,ZT+3,T));
 return{pose,yaw:yawTo(RUN1[0]-RUN0[0],RUN1[1]-RUN0[1])+lerp(0,1.2,sm(ZT+2.4,ZT+3.1,T)),u:pu,v:pv};};
const MATES:[number,number][]=[[11.6,-2.4],[14.2,4.2],[17.4,-.6]];
const liveMate=(i:number):LGen=>T=>{const[u0,v0]=MATES[i],go=sm(ZT+.3+.2*i,ZT+3,T,easeIO),f=liveA(ZT+3),tu=f.u+[1.1,.9,1.6][i],tv=f.v+[-.9,.9,-.1][i];
 const u=lerp(u0,tu,go),v=lerp(v0,tv,go);const pose=blendPose(runCycle(T*runCadence(.9)+i*.3,{speed:.9}),celebrate(T*1.1+i*.3,{kind:'arms'}),sm(ZT+2.7,ZT+3.1,T));
 return{pose,yaw:go<.98?yawTo(tu-u0,tv-v0):yawTo(f.u-tu,f.v-tv),u,v};};
const BENF:[number,number][]=[[3.4,-2.2],[5.6,3.2],[8.8,-4.6],[2.2,4.4]];
const down=(i:number)=>posed({lHipF:6+i*3,rHipF:6,lKnee:10,rKnee:10+i*4,lean:22,neckP:44,lShA:10,rShA:10,lElb:20,rElb:20,twist:i*6});
const liveBen=(i:number):LGen=>T=>({pose:blendPose(backpedal(.2+i*.2),down(i),sm(ZT,ZT+1,T)),yaw:[.4,-.3,.5,-.6][i],u:BENF[i][0],v:BENF[i][1]});
/** Benfica's keeper on his line, crouched, head down */
const liveK:LGen=T=>({pose:blendPose(keeperSet(.2),posed({lHipF:70,rHipF:70,lKnee:110,rKnee:110,lean:30,neckP:40,lShA:14,rShA:14,lElb:40,rElb:40}),sm(ZT,ZT+1.2,T)),yaw:.2,u:.8,v:-.4});
/** the camera: up on the board and the crowd for the score, then it tilts down onto the court for the celebration */
const CEL_X=toStage(FR,5,4.5)[0];
const liveCam=(T:number)=>({x:key(T,mono([[0,0],[ZT+.5,0],[ZT+1.8,CEL_X-.6],[C1.end,CEL_X-.9]]),easeInOutSine),
 zoom:key(T,mono([[0,.5],[C1.riga,.56],[C1.three,.78],[C1.fought,.86],[C1.extra,.92],[ZT+.5,.88],[ZT+1.8,.86],[C1.end,1.0]]),easeInOutSine),
 y:key(T,mono([[0,-170],[C1.riga,-260],[C1.three,-600],[C1.fought,-680],[C1.extra,-720],[ZT+.5,-690],[ZT+1.8,1200],[C1.end,1250]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),g=pulse(Tc,ZT+.05,.35);
 cam(s,0,c.y+3*g*Math.sin(Tc*80),c.zoom);
 const cheer=T<ZT?.08+.3*sm(C1.fought,C1.four,T)*(1-.6*sm(C1.four,C1.four+.4,T))+.25*sm(C1.secs,ZT,T):1-.35*sm(C1.end-1.5,C1.end,T);
 courtSide(s,st,T,{cheer,flash:pulse(T,ZT,1.2)+.4*pulse(T,C1.four+.05,1),keeper:()=>{athlete(s,st,FR,liveK,T,BEN_GK,{detail:'low'});}});
 const bc=proj(st,BOARD_AT[0],BOARD_AT[1],BOARD_AT[2]),kb=kAt(st,BOARD_AT[2]);scoreboard(s,bc,kb,board1(T),501);
 // "three nil": a red ring round Benfica's 3; "fought back": a yellow ring round Barça's score as it counts up; "Adolfo scores": a red ring on the 5
 const r3=easeOutBack(sm(C1.three+.05,C1.three+.4,T))*(1-sm(C1.fought-.2,C1.fought+.1,T));
 const rA=easeOutBack(sm(C1.fought+.1,C1.fought+.45,T))*(1-sm(C1.four-.2,C1.four,T))+easeOutBack(sm(ZT+.05,ZT+.4,T))*(1-sm(ZT+1.2,ZT+1.5,T));
 const ring=(x:number,g2:number,ink:string,seed:number)=>{if(g2<=.02)return;const q=blob(x,bc[1]-kb*.55,kb*.75*Math.min(1,g2),kb*.62*Math.min(1,g2),seed,{n:22});const rp=ribbon([...q,q[0]],kb*.1,{seed:seed+1,close:true,wobble:1});s.knockout(rp);s.fill(ink,rp);};
 ring(bc[0]-kb*1.1,r3,R,502);ring(bc[0]+kb*1.1,rA,T>=ZT?R:Y,505);
 // "Four all": both scores ring in yellow; "extra time": a yellow bracket under the clock
 const r4=easeOutBack(sm(C1.four+.05,C1.four+.4,T))*(1-sm(C1.extra+.3,C1.extra+.6,T));ring(bc[0]-kb*1.1,r4,Y,508);ring(bc[0]+kb*1.1,r4,Y,511);
 const ex=sm(C1.extra,C1.extra+.4,T,easeOut)*(1-sm(ZT-.2,ZT,T));if(ex>.02){const y=bc[1]+kb*1.05,pts:Pt[]=[[bc[0]-kb*1.2,y],[bc[0]-kb*1.2,y+kb*.25],[bc[0]+kb*1.2,y+kb*.25],[bc[0]+kb*1.2,y]];cased(s,pts,kb*.06,514,{dash:kb*.3,progress:ex});}
 if(T>=ZT&&T<ZT+.9)sparkBurst(s,Y,bc[0],bc[1],kb*4,{n:12,seed:504,g:easeOut(sm(ZT,ZT+.3,T))*(1-sm(ZT+.5,ZT+.9,T))});
 if(T<ZT-.2)return;// the court below is out of shot until the tilt
 const items:Item[]=[];
 BENF.forEach((_,i)=>{const gg=liveBen(i);items.push({z:depth(FR,gg(T)),draw:()=>athlete(s,st,FR,gg,T,BEN(i),{detail:'low'})});});
 MATES.forEach((_,i)=>{const gg=liveMate(i);items.push({z:depth(FR,gg(T)),draw:()=>athlete(s,st,FR,gg,T,BAR(i),{detail:'low'})});});
 items.push({z:depth(FR,liveA(T))-.01,draw:()=>athlete(s,st,FR,liveA,T,ADOLFO,{detail:'mid',smear:T<ZT+1.5?.1:0})});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FR,liveA(tt),.14));},still:C1.five+.4};

// ================= chapter 2 — HOW HE DOES IT (demonstration, real time, a lower side-on TV angle): the wing 1v1 =================
const C2={how:A(1,'This is'),takes:A(1,'He takes'),wing:A(1,'right wing'),runs:A(1,'runs at'),fast:A(1,'fast'),fake:A(1,'quick fake'),bursts:A(1,'bursts'),shoots:A(1,'shoots'),before:A(1,'before'),end:AUTH[1].seconds};
const T2:WingT={pass0:C2.takes-.55,recv:C2.takes+.2,run0:C2.runs-.1,fake:C2.fake+.35,burst:C2.bursts-.45,hit:Math.max(C2.bursts+.55,C2.shoots)};
const wing2=makeWing(T2);
const st2:Stage={F:3000,eye:3,cx:10,cz:-5};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,inn=wing2.inn,hit=pulse(t,T2.hit,.35);
  camPath(s,t,[[0,-1900,620,.46],[C2.takes,-2800,640,.6],[C2.wing,-2750,640,.58],[C2.runs,-2300,640,.62],[C2.fast,-1500,640,.64],[C2.fake,-700,600,.78],[C2.bursts,-350,600,.74],[T2.hit,650,560,.56],[inn+.6,1050,540,.56],[C2.end,1100,540,.57]],[5*hit*Math.sin(t*80),0]);
  const goal=tt>=inn;
  courtSide(s,st,tt,{cheer:goal?.6:0,flash:pulse(tt,inn,1.2),bulge:.5*sm(inn-.1,inn,tt)*(1-.6*sm(inn+.3,inn+1.2,tt))+.1*settle(tt,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FR,wing2.gk,tt,DEMO_GK,{detail:'mid'});}});
  const a=wing2.att(tt),df=wing2.def(tt);
  // "right wing": a yellow dashed lane along the right touchline (his wing) and a ring under him
  const lane=sm(C2.wing,C2.wing+.6,tt,easeOut)*(1-sm(C2.fake-.3,C2.fake,tt));
  if(lane>.02){const pts=[fp(st,FR,20.5,7.6),fp(st,FR,14,7.6),fp(st,FR,7.5,7.6)];cased(s,pts,14,201,{dash:50,progress:lane});if(lane>.9)casedHead(s,pts,40,202);}
  const rg=easeOutBack(sm(C2.wing,C2.wing+.35,tt))*(1-sm(C2.runs,C2.runs+.3,tt));if(rg>.02){const[X,Z]=toStage(FR,a.u,a.v);floorDashRing(s,st,K,X,Z,.9,22,203,rg);floorDashRing(s,st,Y,X,Z,.9,14,204,rg);}
  // "runs at his defender": a red arrow from him straight at the defender
  const ra=sm(C2.runs,C2.runs+.5,tt,easeOut)*(1-sm(C2.fake-.2,C2.fake+.1,tt));
  if(ra>.02){const pts=[fp(st,FR,a.u-.7,a.v),fp(st,FR,lerp(a.u,df.u,.5),lerp(a.v,df.v,.5)+.1),fp(st,FR,df.u+.8,df.v+.1)];redArrow(s,pts,12,205,ra);}
  // "quick fake inside": the defender's lean (a red arrow to the inside); "bursts past": a yellow arrow round the outside
  const la=sm(C2.fake+.2,C2.fake+.6,tt,easeOut)*(1-sm(T2.hit,T2.hit+.4,tt));
  if(la>.02){const pts=[fp(st,FR,DEF1[0],DEF1[1]),fp(st,FR,DEF1[0]-.1,DEF1[1]-.7),fp(st,FR,DEF1[0]-.2,DEF1[1]-1.4)];redArrow(s,pts,11,206,la);}
  const bu=sm(C2.bursts-.3,C2.bursts+.2,tt,easeOut)*(1-sm(T2.hit+.2,T2.hit+.7,tt));
  if(bu>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=bez(FAKE_E,[BURST_M[0],BURST_M[1]+.5],STANCE,k/12);pts.push(fp(st,FR,q[0],q[1]+.25));}cased(s,pts,12,207,{dash:36,progress:bu});if(bu>.9)casedHead(s,pts,34,208);}
  // the shot line (dashed yellow) as the ball goes
  if(tt>T2.hit){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=wing2.ball(lerp(T2.hit,Math.min(tt,inn),k/14));pts.push(fp(st,FR,q.u,q.v,q.y));}cased(s,pts,10,209,{dash:36});}
  const b=wing2.ball(tt),fastMove=(tt>T2.recv+.6&&tt<T2.fake)||(tt>T2.burst&&tt<T2.hit+.2);
  const items:Item[]=[
   {z:depth(FR,df),draw:()=>athlete(s,st,FR,wing2.def,tt,DEMO_D,{detail:'high'})},
   {z:depth(FR,a)-.001,draw:()=>athlete(s,st,FR,wing2.att,tt,ADOLFO,{detail:'high',smear:fastMove?.12:0})},
   {z:depth(FR,b)-.02,draw:()=>{drawBallL(s,st,FR,b,211);if(tt>=T2.hit&&tt<T2.hit+.35){const p=fp(st,FR,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],110,{n:9,seed:212,g:easeOut(sm(T2.hit,T2.hit+.25,tt))});}}},
  ];
  items.sort((p,q)=>q.z-p.z).forEach(it=>it.draw());
  // "fast": yellow speed lines stream off his back
  const fs=sm(C2.fast,C2.fast+.3,tt)*(1-sm(C2.fake,C2.fake+.2,tt))+sm(C2.bursts,C2.bursts+.15,tt)*(1-sm(T2.hit,T2.hit+.2,tt));
  if(fs>.05){const ch=jointPt(st,FR,a,'chest');speedLines(s,Y,ch[0]-60,ch[1]+40,Math.PI,{n:6,seed:220+Math.floor(tt*6),len:260*fs,spread:160,width:9,cov:.9});}
  // "before the keeper is ready": a yellow ring round the keeper, still setting his feet
  const kr=easeOutBack(sm(C2.before,C2.before+.35,tt))*(1-sm(C2.end-.9,C2.end-.5,tt));
  if(kr>.02){const gl=wing2.gk(tt),p=jointPt(st,FR,gl,'chest'),rr=kAt(st,depth(FR,gl))*.95*Math.min(1,kr);s.fill(Y,ribbon(blob(p[0],p[1],rr*.8,rr,230,{n:22}),9,{seed:231,close:true,wobble:1}),1);}
  if(tt>=inn&&tt<inn+1.2){const p=fp(st,FR,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],140,{n:12,seed:232,g:easeOut(sm(inn,inn+.3,tt))*(1-sm(inn+.8,inn+1.2,tt))});}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,FR,wing2.att(tt),.13));},
 still:C2.fake+.4,
};

// ================= chapter 3 — WATCH AGAIN (slow-motion replay, reverse angle: low, behind him, the camera tracking his run) =================
const C3={watch:A(2,'Watch'),speed:A(2,'Speed at'),fake:A(2,'fake'),burst:A(2,'burst'),shoot:A(2,'shoot'),end:AUTH[2].seconds};
/** the replay re-uses the chapter 2 sequence, slowed and keyed to the words (sequence time = seq(t)) */
const seq3=(t:number)=>key(t,mono([[0,T2.fake-1.5],[C3.speed,T2.fake-1],[C3.fake,T2.fake+.05],[C3.burst,T2.burst],[C3.shoot,T2.hit-.02],[C3.shoot+1.1,wing2.inn+.3],[C3.end,wing2.inn+1.4]]),linear);
const g3=(g:LGen):LGen=>t=>g(seq3(t));
const att3=g3(wing2.att),def3=g3(wing2.def),gk3=g3(wing2.gk);
/** the tracking camera: behind him and a little inside, low; it stops when he plants to shoot */
function st3(q:number):Stage{const a=wing2.att(Math.min(q,wing2.st0)),[X,Z]=toStage(FB,a.u,a.v);return{F:1750,eye:1.9,cx:X-.4,cz:Z-5.4};}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),q=seq3(tt),st=st3(q),inn=wing2.inn,hit=pulse(q,T2.hit,.4);
  camPath(s,t,[[0,180,240,1.02],[C3.fake,200,240,1.05],[C3.burst,180,230,1],[C3.shoot,40,190,.86],[C3.shoot+1,-120,170,.86],[C3.end,-140,170,.88]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  const goal=q>=inn;
  arena(s,st,tt,{cheer:goal?.8:0,flash:goal?pulse(q,inn,1.2):0,bulge:.55*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q))+.1*settle(q,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FB,gk3,tt,DEMO_GK,{detail:'mid'});}});
  const a=att3(tt);
  // "fake": the defender's lean (red); "burst past": the yellow burst arrow round the outside; "shoot early": the shot line
  const la=sm(C3.fake+.2,C3.fake+.7,tt,easeOut)*(1-sm(C3.shoot,C3.shoot+.4,tt));
  if(la>.02){const pts=[fp(st,FB,DEF1[0],DEF1[1]),fp(st,FB,DEF1[0]-.1,DEF1[1]-.7),fp(st,FB,DEF1[0]-.2,DEF1[1]-1.4)];redArrow(s,pts,13,301,la);}
  const bu=sm(C3.burst-.2,C3.burst+.4,tt,easeOut)*(1-sm(C3.shoot+.6,C3.shoot+1.1,tt));
  if(bu>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const p=bez(FAKE_E,[BURST_M[0],BURST_M[1]+.5],STANCE,k/12);pts.push(fp(st,FB,p[0],p[1]+.25));}cased(s,pts,13,302,{dash:38,progress:bu});if(bu>.9)casedHead(s,pts,36,303);}
  if(q>T2.hit){const pts:Pt[]=[];for(let k=0;k<=14;k++){const bb=wing2.ball(lerp(T2.hit,Math.min(q,inn),k/14));pts.push(fp(st,FB,bb.u,bb.v,bb.y));}cased(s,pts,12,304,{dash:40});}
  const b=wing2.ball(q);
  const items:Item[]=[
   {z:depth(FB,def3(tt)),draw:()=>athlete(s,st,FB,def3,tt,DEMO_D,{detail:'high'})},
   {z:depth(FB,a)-.001,draw:()=>athlete(s,st,FB,att3,tt,ADOLFO,{detail:'high',smear:(q>T2.burst&&q<wing2.st0)||(q>T2.hit-.2&&q<T2.hit+.2)?.45:0})},
   {z:depth(FB,b)-.02,draw:()=>{drawBallL(s,st,FB,b,311,10);if(q>=T2.hit&&q<T2.hit+.35){const p=fp(st,FB,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],120,{n:9,seed:312,g:easeOut(sm(T2.hit,T2.hit+.25,q))});}}},
  ];
  items.sort((p,c)=>c.z-p.z).forEach(it=>it.draw());
  // "Speed at": speed lines off his back; "fake": a red ring round his dipping shoulder
  const fs=sm(C3.speed,C3.speed+.3,tt)*(1-sm(C3.fake-.1,C3.fake+.1,tt))+sm(C3.burst,C3.burst+.2,tt)*(1-sm(C3.shoot,C3.shoot+.2,tt));
  if(fs>.05){const ch=jointPt(st,FB,a,'chest');speedLines(s,Y,ch[0],ch[1]+80,Math.PI/2,{n:6,seed:320+Math.floor(tt*6),len:240*fs,spread:180,width:9,cov:.9});}
  const fr=easeOutBack(sm(C3.fake,C3.fake+.35,tt))*(1-sm(C3.burst-.2,C3.burst+.1,tt));
  if(fr>.02){const sh=jointPt(st,FB,a,'lSh'),rr=kAt(st,depth(FB,a))*.3*Math.min(1,fr);s.fill(R,ribbon(blob(sh[0],sh[1],rr,rr*.85,321,{n:22}),10,{seed:322,close:true,wobble:1}),1);}
  if(q>=inn&&q<inn+1.2){const p=fp(st,FB,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:330,g:easeOut(sm(inn,inn+.3,q))*(1-sm(inn+.8,inn+1.2,q))});}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3(seq3(tt)),FB,att3(tt),.13));},
 still:C3.burst+.2,
};

// ================= chapter 4 — YOUR TURN: he runs the move again; three cards (attack, speed, shoot early); a tick =================
const C4={your:A(3,'Your'),attack:A(3,'attack'),speed:A(3,'at speed'),shoot:A(3,'shoot'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T2.fake-1.1],[C4.attack,T2.fake-.3],[C4.speed,T2.burst+.05],[C4.shoot,T2.hit+.02],[C4.end,wing2.inn+1.5]]),linear);
const g4=(g:LGen):LGen=>t=>g(seq4(t));
const att4=g4(wing2.att),def4=g4(wing2.def),gk4=g4(wing2.gk);
const st4:Stage={F:1500,eye:2.5,cx:2.9,cz:-3.6};
const CARD_Y=770,CARD_W=175,CARDS:[number,number,'attack'|'speed'|'shoot'][]=[[-420,C4.attack,'attack'],[0,C4.speed,'speed'],[420,C4.shoot,'shoot']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,q=seq4(tt),inn=wing2.inn;
  camPath(s,t,[[0,120,200,1.0],[C4.your+.4,0,330,.92],[C4.shoot,0,330,.92],[C4.end,0,325,.93]]);
  const goal=q>=inn;
  arena(s,st,tt,{cheer:goal?.9*(1-sm(C4.end-1,C4.end,tt)):0,flash:goal?pulse(q,inn,1.2):0,bulge:.5*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q)),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FB,gk4,tt,DEMO_GK,{detail:'mid'});}});
  const a=att4(tt),b=wing2.ball(q);
  if(q>T2.hit){const pts:Pt[]=[];for(let k=0;k<=14;k++){const bb=wing2.ball(lerp(T2.hit,Math.min(q,inn),k/14));pts.push(fp(st,FB,bb.u,bb.v,bb.y));}cased(s,pts,11,401,{dash:38});}
  const items:Item[]=[
   {z:depth(FB,def4(tt)),draw:()=>athlete(s,st,FB,def4,tt,DEMO_D,{detail:'mid'})},
   {z:depth(FB,a)-.001,draw:()=>athlete(s,st,FB,att4,tt,ADOLFO,{detail:'high',smear:q>T2.burst&&q<wing2.st0?.16:0})},
   {z:depth(FB,b)-.02,draw:()=>{drawBallL(s,st,FB,b,411,10);}},
  ];
  items.sort((p,c)=>c.z-p.z).forEach(it=>it.draw());
  // the three cards rise on "Your turn"; each prints its step as it is said (attack, speed, shoot early)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+150;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+(kind==='speed'?-20:10),y:gy+25,height:330*(.9+.1*on),azimuth:kind==='attack'?60:kind==='speed'?0:30,elevation:12,fov:18,at:[0,0,0]});
    const pose=kind==='attack'?FAKE:kind==='speed'?runCycle(.72,{speed:1}):strike(STRIKE_CONTACT,{foot:'r'});
    const csk=solve(pose,BUILD,{}),P=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    // attack = a red arrow at an outlined defender's spot; speed = yellow speed lines; shoot early = a yellow shot arrow off the boot
    if(kind==='attack'){const p0=P([.5,.05,0]),p1=P([1.9,.05,0]);redArrow(s,[p0,L2(p0,p1,.5),p1],9,85);}
    if(kind==='speed')speedLines(s,Y,cx-90,gy-150,Math.PI,{n:5,seed:86,len:120,spread:140,width:8,cov:.9});
    if(kind==='shoot'){const tb:V3=[csk.rToe[0]+.12,BALL_R,csk.rToe[2]],p0=P(tb),p1=P([tb[0]+1.6,.3,tb[2]]),pts:Pt[]=[p0,L2(p0,p1,.5),p1];dashed(s,Y,pts,8,87,{dash:22});arrowHead(s,Y,pts,24,88);const bR=BALL_R*(fc.scale?fc.scale(tb):100);ball(s,p0[0],p0[1],bR,81+i);}
    drawAthlete(s,pose,fc,{...ADOLFO,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "shoot early": a big tick (yellow over red, navy echo) stamps beside him
  const tick=easeOutBack(sm(C4.shoot+.45,C4.shoot+.8,tt));
  if(tick>.02){const g=fp(st,FB,a.u,a.v),h=kAt(st,depth(FB,a))*1.8,c:Pt=[g[0]+h*.62,g[1]-h*.8],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.speed+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'adolfo-futsal-signature',format:'futsal',title:'Adolfo’s quick 1v1 on the wing',theme:'Attack your defender at speed and shoot early.',
 ageNote:'For players aged 7–12: the 2022 semi-final and Adolfo’s winner are real; the wing 1v1 is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball darts in from the left, cuts round an invisible defender and speed lines trail it; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const go=sm(0,.4,age,easeOut),bx=x-160*(1-go),by=y-50*Math.sin(Math.PI*go);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,by,r,seed,{rot:(1-go)*6});
  const sp=(1-sm(.4,.9,age));if(sp>.02)speedLines(s,Y,bx-r*1.2,by,Math.PI,{n:4,seed:seed+3,len:120*sp,spread:60,width:7,cov:.9});
 },
};
export default film;
