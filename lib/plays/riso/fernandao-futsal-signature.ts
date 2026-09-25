/** Fernandão — "the big pivot's turn": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: the card's "Fernandão" is Fernando Maciel Gonçalves (born 16 Aug 1980, São Paulo, Brazil), a PIVOT, 1.84 m, FC Barcelona 2007–2014,
 *  102 caps / 70 goals for SPAIN (2008–2016). Card bio (lib/town/playerBios.json): "Brazilian-born Spain pivot who won two UEFA Futsal Cups
 *  with Barcelona…"; card country Spain (lib/town/playerAppearance.json: skin 4, black buzz-cut hair) — sources and card agree. He is not
 *  the Brazilian football striker Fernandão (Internacional) nor Fernandinho.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the big pivot's turn, lesson "Use your size to shield the ball,
 *  then turn and shoot." — not one match. The one Fernandão goal whose HOW a written source describes, in a match no other futsal film
 *  uses, is from the 2012 FIFA Futsal World Cup, Group B, Thursday 8 November 2012, Indoor Stadium Huamark, Bangkok: Morocco 1–5 Spain.
 *  FIFA.com: "Spain soon re-established their lead with another fine goal though, Torras working an opportunity on the left and crossing
 *  for Fernandao to chest the ball into the net" (32'36", 1–4). A big pivot using his body to score is his signature in one real moment.
 *  (Carlos Ortiz's film uses the QF v Russia, Falcão's the final, Gabriel's the 2014 UEFA Futsal Cup final with Fernandão's header —
 *  so this film picks a different match.) The TURN itself has no dated written description, so it is a separate, labelled demonstration.
 *  1  LIVE (broadcast camera, main stand, real time): board Morocco 1–3 Spain; Torras (#4, captain) works the ball down the left and
 *     crosses; Fernandão (#5) chests it into the net — the board flips to 1–4; team-mates run to him.
 *  2  WATCH AGAIN (slow-motion replay, low camera out on the court at the far-post side): his big body in the way, the ball in off his
 *     chest; "Spain win five one" (the final score — Álvaro's 5th at 33'58" is NOT staged).
 *  3  HOW HE DOES IT (a demonstration, real time, no match claimed; neutral paper/navy defender and keeper): back to goal, he shields the
 *     ball with his size (arm and body), feels the defender lean, spins the other way and shoots low.
 *  4  YOUR TURN (lesson from the entry's `lesson`): he runs it again side-on, slower; three cards (shield, turn, shoot); a tick.
 * Sources (written; fetched with curl, ≤ 4 requests, cached in scratchpad/films/src-cache/):
 *  - FIFA.com (archived 2013), match 32 summary "Five-star Spain finish top" (fifa-2012-futsal-mar-esp-summary.txt): the quote above; "Lozano's
 *    curling right-foot shot" 1–0, Lozano 2–0, Borja 3–0 "a minute before the break", "Mohamed Talibi bundling the ball over the line" 1–3,
 *    Álvaro's "deflected shot trickled agonisingly over the line" 1–5; Spain "European champions" top Group B.
 *  - FIFA.com (archived) play-by-play, match 300215815 (fifa-2012-futsal-mar-esp-playbyplay.txt): "32'36" (1 - 4) FERNANDAO (Spain)
 *    scores!!"; "21'26" (1 - 3) M. TALIBI"; "33'58" (1 - 5) ALVARO"; Y. Kelkaghi (Morocco) booked 32'36".
 *  - FIFA.com (archived) official match report (fifa-2012-futsal-mar-esp-report.txt): 08 November 2012, Bangkok / Indoor Stadium Huamark,
 *    19:00, attendance 1,898, referee Naoki Miyatani (JPN); Spain starters Juanjo (12, GK), Torras (4, C), Lozano (9), Borja (10), Lin (11);
 *    used subs incl. Aicardo (3), FERNANDAO (5), Álvaro (6), Miguelín (7); Morocco keeper Rabie Zaari (1) started; Spain 44 shots to 9.
 *  - Wikipedia, "Fernandão (futsal player)" (raw, fetched Sep 2026): Fernando Maciel Gonçalves, born 16 Aug 1980, São Paulo; Pivot;
 *    1.84 m; Barcelona 2007–2014; Spain 102 caps, 70 goals; UEFA Futsal Cup 2012, 2014. Spanish Wikipedia (Selección de fútbol sala de
 *    España): "Fernandao 102 (2008-2016)".
 * CONFIRMED: match, date, venue, round, score line (1–3 → 1–4 at 32'36" → 1–5), that TORRAS worked the chance ON THE LEFT and CROSSED, and
 *  that FERNANDÃO CHESTED the ball into the net; shirt numbers Torras 4 and Fernandão 5; Fernandão a pivot, 1.84 m, Brazilian-born.
 *  The narration only states these.
 * INFERRED (never named in the narration): the kits (Spain red shirts / navy shorts / red socks; Morocco white shirts, green trim and
 *  shorts; Morocco's keeper in green) — Morocco's first kit is also red, so one side changed, unverified; which end; that "the left" means
 *  Spain's attacking left (the near touchline here); Torras's crossing foot (left), the cross's height and path; every player's position;
 *  which Moroccan keeper was on court (Kelkaghi was booked at the same second — not claimed); that Fernandão arrived at the far post; the
 *  celebration. No video was reviewed. Chapters 3–4 demonstrate the pivot turn; no match is claimed there.
 * Technique (poses): a CHEST finish — upright, chest pushed out and angled to the goal, arms wide for balance, chin down, eyes on the ball;
 *  the pivot turn — low wide base, the arm nearest the defender bent and held back against him (feel, don't push), the sole on the ball
 *  away from him; when he leans one way, spin over the other shoulder and shoot early and low.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the fast moves). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across); each stage
 *  maps it with a proper rotation (no mirror), so the left foot stays the left foot. Our stages are LEFT-handed (X right, Z away), so
 *  `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through the
 *  cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagrams), red (Spain, arrows), green (Morocco trim, keeper), navy (key line, shorts, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,runCycle,dribble,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: World Cup 2012',text:'The 2012 Futsal World Cup. Spain play Morocco and lead three one. Torras works the ball on the left and crosses. Big Fernandão chests it into the net! Four one!',tail:2.4,
  cues:['The 2012','Spain play','three one','Torras works','on the left','crosses','Big Fernandão','chests it','Four one'],heads:{'The 2012':'World Cup 2012','three one':'Spain 3–1','Four one':'Spain 4–1'}},
 {label:'Watch again',text:'Watch again. He puts his big body in the way, and in it goes off his chest. Spain win five one!',tail:2.2,
  cues:['Watch again','big body','in it goes','off his chest','Spain win','five one'],heads:{'Watch again':'Slow motion','five one':'Spain 5–1'}},
 {label:'How he does it',text:'He is a pivot. This is how he does it: back to goal, he shields the ball with his size, feels the defender, turns and shoots!',tail:2.2,
  cues:['He is a pivot','This is how','back to goal','shields the ball','with his size','feels the','turns and','shoots'],heads:{'He is a pivot':'The pivot','shoots':''}},
 {label:'Your turn',text:'Your turn: use your size to shield the ball, then turn and shoot!',tail:2.6,
  cues:['Your turn','use your size','shield the ball','then turn','shoot'],heads:{'Your turn':'Shield, turn, shoot','shoot':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/fernandao-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/fernandao-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/fernandao-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('fernandao: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('fernandao: no cue '+w);return c.at;};
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
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
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
/** Fernandão's skin (card: skin tone 4 of 7, a warm mid-brown) — one flat red screen + a light navy screen */
const SKIN_F:InkFill[]=[[R,.8],[K,.2]];
const BUILD={height:1.84,bulk:1.1};
/** Fernandão: Spain — red shirt, navy shorts, red socks (kit inferred), no. 5 (FIFA line-up), black buzz-cut hair (card), 1.84 m */
const FERNANDAO:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:SKIN_F,hair:K,line:K,trim:Y,hairStyle:'bald',number:5,numberInk:'paper',build:BUILD,seed:5};
/** Torras: Spain no. 4, captain (FIFA line-up); short dark hair (inferred) */
const TORRAS:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:Y,hairStyle:'short',number:4,numberInk:'paper',build:{height:1.76},seed:4};
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:Y,hairStyle:(['short','curly','short'] as const)[n%3],build:{height:1.72+hash(n,3)*.1},seed:20+n});
/** Morocco: white shirts with green trim, green shorts (inferred — see header) */
const MAR=(n:number):AthleteStyle=>({shirt:'paper',trim:G,shorts:G,socks:'paper',boots:K,skin:[[Y,.8],[R,.42]],hair:K,line:K,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const MAR_GK:AthleteStyle={shirt:[G,.85],shorts:K,socks:[G,.85],boots:K,skin:[[Y,.8],[R,.4]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:61};
/** the demonstration players (chapters 3–4): a neutral paper/navy training kit, no team is claimed */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.02},seed:77};
const DEMO_GK:AthleteStyle={shirt:[K,.55],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.22]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:78};
/** THE adapter: draw one athlete from a local generator at time t on stage st / frame fr (prev = one drawn frame earlier; smear = motion echo) */
function athlete(s:Sheet,st:Stage,fr:Frame,gen:LGen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const pl=(l:Loc)=>{const[X,Z]=toStage(fr,l.u,l.v);return placeAt(X,Z,l.yaw+fr.rot);};
 const a=gen(t),b=gen(t-1/12),cm=projector(st);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl(a),{prevPlace:pl(c),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl(a),{prev:b.pose,prevPlace:pl(b)});
}
/** a skeleton in the local frame: joints come back as [u, height, v] */
function jointsL(l:Loc,build=BUILD){const sk=solve(l.pose,build,{x:l.u,z:-l.v,yaw:l.yaw}),J=(j:V3):[number,number,number]=>[j[0],j[1],-j[2]];return{sk,J};}

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

// ---------------- the arena: wood court, stands, futsal goal ----------------
/** stepped navy rows, lit faces, red and green shirts, Spain (red-yellow-red) and Morocco (red with a green star) flags, roof lights */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),greens=new Path2D(),yel=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.22)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.3)greens.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  if(f%2){reds.addPath(band(0,1));const c=pole(.5,.5),st:Pt[]=[];for(let k=0;k<10;k++){const a=-Math.PI/2+k/10*TAU,rr=(k%2?.4:1)*fh*.24;st.push([c[0]+Math.cos(a)*rr,c[1]+Math.sin(a)*rr]);}greens.addPath(polyPath(st,true));}
  else{reds.addPath(band(0,.25));yel.addPath(band(.25,.75));reds.addPath(band(.75,1));}}
 s.fill(Y,heads,.6);s.knockout(yel);s.fill(Y,yel);s.fill(R,reds);s.fill(G,greens);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal goal (3 m × 2 m) on any frame: net halftone + mesh bulging round (bu, by, bv); posts red/paper bands */
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

// ---- SIDE court from the broadcast position (chapters 1 and 4): the goal at X = −20, the near touchline Z = 0, the far boards Z = 21 ----
const TOUCH_FAR=20,BOARDS=21,FA:Frame={ox:-20,oz:10,rot:0};
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
type CourtOpt={cheer?:number;flash?:number;bulge?:number;bv?:number;by?:number;keeper?:()=>void};
function courtSide(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.45);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 const strips=new Path2D(),seams=new Path2D(),X0=st.cx-30,X1=st.cx+30,z00=Math.max(-1,st.cz+.6);
 for(let k=0;k<46;k++){const z0=z00+k*.5,z1=z0+.5;if(z0>BOARDS)break;const a=proj(st,X0,0,z0),b=proj(st,X1,0,z1);if(hash(k,5)>.55)strips.rect(a[0],b[1],b[0]-a[0],a[1]-b[1]);seams.moveTo(a[0],a[1]);seams.lineTo(proj(st,X1,0,z0)[0],a[1]);
  for(let x=Math.floor(X0/2.4)*2.4+hash(k,9)*2.4;x<X1;x+=2.4){const p=proj(st,x,0,z0),q=proj(st,x,0,z1);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,FA,lines,40);
 lines.addPath(polyPath(floorStrip(st,[[0,0],[0,TOUCH_FAR]],.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,FA,bulge,bv,by);o.keeper?.();goalPosts(s,st,FA);
}
// ---- END-ON court (chapters 2–3): the camera looks along +Z at a goal (centre X = 0, Z = GZ) turned by the frame ----
const GZ=11,WALLZ=15;
function arena(s:Sheet,st:Stage,fr:Frame,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 const floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.45);s.fill(R,floor,.3);
 const strips=new Path2D(),seams=new Path2D(),near=st.cz+.35;
 for(let i=-40;i<40;i++){const X0=i*.5,X1=X0+.5;if(hash(i+40,5)>.55)strips.addPath(polyPath([proj(st,X0,0,near),proj(st,X1,0,near),proj(st,X1,0,WALLZ),proj(st,X0,0,WALLZ)],true));
  const a=proj(st,X0,0,near),b=proj(st,X0,0,WALLZ);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);
  for(let z=near+hash(i,9)*2.2;z<WALLZ;z+=2.2){const p=proj(st,X0,0,z),q=proj(st,X1,0,z);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,fr,lines,20);s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,fr,bulge,bv,by);o.keeper?.();goalPosts(s,st,fr);
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
type BallS={u:number;y:number;v:number;flying:boolean;spin:number};
/** a ball drawn on stage st through frame fr, with its floor shadow (a flying ball smears back along its flight) */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:BallS,seed:number,min=9,from?:BallS){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R);let dir=0;
 if(from){const[X2,Z2]=toStage(fr,from.u,from.v),o=proj(st,X2,from.y,Z2);dir=Math.atan2(p[1]-o[1],p[0]-o[0]);}
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?.45:0,dir});return{p,r};
}
/** the player's chest (the passage enters his red shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
/** a joint of the player on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:'lEl'|'lHa'|'lSh'|'rSh'|'chest'|'pelvis'|'rToe'|'head'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];
/** a pose that stays put with a small breathing bob */
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** runs along keyed floor points [t,u,v]: a run cycle whose speed follows the path, facing where it goes (or `face` once it stops) */
function runner(Kp:Key[],face:number,ph=0):LGen{
 const at=(t:number)=>key(t,Kp,easeInOutSine,true) as number[];
 return t=>{const p=at(t),q=at(t+.08),du=q[0]-p[0],dv=q[1]-p[1],sp=Math.hypot(du,dv)/.08,go=Math.min(1,sp/3.5);
  const pose=go>.12?blendPose(idle(t,ph),runCycle(t*(1.3+go*.35)+ph,{speed:go}),Math.min(1,go*2)):idle(t,ph);
  return{pose,yaw:go>.12?yawTo(du,dv):face,u:p[0],v:p[1]};};
}

// ================= chapter 1 — LIVE: 2012 FIFA Futsal World Cup, Morocco 1–5 Spain, Bangkok. Board 1–3; Torras works it on the left
// and crosses; Fernandão chests it into the net (32'36", 1–4). Local frame: u out from MOROCCO's goal, the near touchline v = −10
// (Spain attack toward the camera's left, so their LEFT is the near side). =================
const C1={spain:A(0,'Spain play'),lead:A(0,'three one'),tor:A(0,'Torras'),left:A(0,'on the left'),cross:A(0,'crosses'),big:A(0,'Big'),chest:A(0,'chests'),four:A(0,'Four one'),end:AUTH[0].seconds};
/** the cross leaves Torras's boot on "crosses"; it meets Fernandão's chest ~.8 s later; in the net .3 s after that */
const XT=C1.cross+.12,CT=Math.max(XT+.8,C1.chest+.05),NT=CT+.3;
/** the celebration: away from goal toward the near touchline, team-mates in */
const CEL:[number,number]=[4.6,-3.6];
/** Torras (left foot, inferred) — carries the ball down the near touchline, plants and crosses */
const T_KEYS:Key[]=mono([[0,17.8,-6.0],[C1.tor,15.4,-6.3],[XT-.38,5.2,-6.7],[XT,5.05,-6.75]]);
const YAW_X=yawTo(1.15-5.05,.95+6.75);// Torras opens up toward the far post
const torrasF:LGen=t=>{
 if(t<XT-.38){const p=key(t,T_KEYS,easeInOutSine,true) as number[],q=key(t+.08,T_KEYS,easeInOutSine,true) as number[],sp=Math.hypot(q[0]-p[0],q[1]-p[1])/.08;
  return{pose:dribble(t*(1.5+sp*.25),{foot:'l',speed:Math.min(1,sp/4)}),yaw:yawTo(q[0]-p[0],q[1]-p[1]),u:p[0],v:p[1]};}
 const k=key(t,[[XT-.38,.22],[XT,STRIKE_CONTACT],[XT+.5,.82],[XT+1,.95]],linear),p=key(t,T_KEYS,easeInOutSine,true) as number[];
 let pose=strike(k,{foot:'l'}),yaw=lerp(Math.PI,YAW_X+.35,sm(XT-.38,XT-.1,t,easeIO)),u=p[0],v=p[1];
 // after the goal he runs in to Fernandão
 const r=sm(NT+.3,NT+1.6,t,easeInOutSine);if(r>0){pose=blendPose(pose,celebrate((t-NT)*1.2,{kind:'run'}),Math.min(1,r*3));u=lerp(u,CEL[0]+1.1,r);v=lerp(v,CEL[1]-.9,r);yaw=yawTo(CEL[0]-u+.01,CEL[1]-v);}
 return{pose,yaw,u,v};};
/** where the ball sits on Torras's left boot at the cross */
const XB:[number,number]=(()=>{const l=torrasF(XT),{sk,J}=jointsL(l,{height:1.76,bulk:1}),toe=J(sk.lToe),an=J(sk.lAn),d=[toe[0]-an[0],toe[2]-an[2]],n=Math.hypot(d[0],d[1])||1;return[toe[0]+d[0]/n*.08,toe[2]+d[1]/n*.08];})();
/** CHEST: upright, chest pushed out, a slight back-lean, arms wide for balance, chin down on the ball */
const CHEST=posed({lHipF:14,rHipF:22,lKnee:24,rKnee:30,lAnk:-6,rAnk:-4,lHipA:10,rHipA:8,lean:-16,pitch:-4,neckP:30,twist:-12,lShF:18,rShF:24,lShA:62,rShA:58,lElb:38,rElb:42,lHand:.6,rHand:.6,squash:.03,air:.04});
/** Fernandão meets it here (inferred: the far post, a metre out) facing half toward the cross and half toward the goal */
const F_C:[number,number]=[1.2,1.05];
const YAW_C=(()=>{const a=[XB[0]-F_C[0],XB[1]-F_C[1]],la=Math.hypot(a[0],a[1]),b=[-1,-.2],lb=Math.hypot(b[0],b[1]);return yawTo(a[0]/la+b[0]/lb,a[1]/la+b[1]/lb);})();
const F_KEYS:Key[]=mono([[0,10.2,2.6],[C1.tor,8.6,2.4],[XT-.3,3.2,1.8],[CT-.2,F_C[0]+.08,F_C[1]+.05],[CT,F_C[0],F_C[1]]]);
const fernF:LGen=t=>{
 const run=runner(F_KEYS,YAW_C,.3);
 if(t<CT-.45)return run(t);
 const p=key(t,F_KEYS,easeInOutSine,true) as number[];
 if(t<NT+.25){const c=sm(CT-.45,CT-.1,t,easeIO),r=run(t);return{pose:blendPose(r.pose,CHEST,c),yaw:lerp(r.yaw,YAW_C,c),u:p[0],v:p[1]};}
 const r=sm(NT+.25,NT+1.5,t,easeInOutSine),u=lerp(F_C[0],CEL[0],r),v=lerp(F_C[1],CEL[1],r);
 const pose=r<.95?blendPose(CHEST,celebrate((t-NT)*1.2,{kind:'run'}),sm(NT+.25,NT+.5,t)):celebrate((t-NT)*1.1,{kind:'arms'});
 return{pose,yaw:r<.95?lerp(YAW_C,yawTo(CEL[0]-F_C[0],CEL[1]-F_C[1]),sm(NT+.25,NT+.55,t)):-Math.PI/2-.3,u,v};};
/** the chest contact point (local u, y, v): his chest joint + a ball radius in front */
const CP:V3=(()=>{const l=fernF(CT),{sk,J}=jointsL(l),c=J(sk.chest);return[c[0]+Math.cos(YAW_C)*(BALL_R+.12),c[1]+.02,c[2]+Math.sin(YAW_C)*(BALL_R+.12)];})();
const NETP:V3=[-.55,.32,.85];
/** the ball: dribbled at Torras's left foot → the cross (a looping arc) → off the chest → into the net */
function ball1(t:number):BallS{
 if(t<XT){const l=torrasF(t),dir=l.yaw,fwd=.55+.12*Math.sin(t*9),w=sm(XT-.38,XT,t,easeIO);
  const bu=l.u+Math.cos(dir)*fwd-Math.sin(dir)*.12,bv=l.v+Math.sin(dir)*fwd+Math.cos(dir)*.12;return{u:lerp(bu,XB[0],w),y:BALL_R,v:lerp(bv,XB[1],w),flying:false,spin:t*9};}
 if(t<CT){const u=sm(XT,CT,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(XB[0],CP[0],.5)+.6,2.9,lerp(XB[1],CP[2],.5)];
  return{u:a*XB[0]+b*M[0]+c*CP[0],y:a*BALL_R+b*M[1]+c*CP[1],v:a*XB[1]+b*M[2]+c*CP[2],flying:true,spin:u*14};}
 if(t<NT){const u=sm(CT,NT,t,easeIn);return{u:lerp(CP[0],NETP[0],u),y:lerp(CP[1],NETP[1],u)-.15*Math.sin(u*Math.PI),v:lerp(CP[2],NETP[2],u),flying:true,spin:14+u*8};}
 const d=sm(NT,NT+.25,t,easeIn),bo=Math.abs(Math.sin(sm(NT+.25,NT+1,t)*Math.PI*2))*.1*(1-sm(NT+.25,NT+1,t));
 return{u:-.72,y:lerp(NETP[1],BALL_R,d)+bo,v:NETP[2],flying:false,spin:22};}
/** Morocco's keeper: covers the near post as Torras comes, shuffles across, reaches too late */
const gk1:LGen=t=>{const v=key(t,[[0,-.2],[XT-.6,-.85],[CT-.35,.1],[NT+.5,.2]],easeIO),d=sm(CT-.3,CT+.25,t,linear);
 let pose=keeperSet(t*1.3);if(d>0)pose=blendPose(pose,keeperDive(Math.min(.55,.2+d*.4),{side:'l'}),Math.min(1,d*2.2)*.8);return{pose,yaw:yawTo(1,-.2),u:.55,v};};
/** Morocco's outfield four: m0 chases Torras and blocks late; m1 at the near post; m2 marks Fernandão (goal side, beaten by the flight); m3 at the top */
const marF:LGen[]=[
 t=>{const l=torrasF(Math.min(t,XT)),c=sm(0,XT,t,easeOut),u=l.u-1.9+.5*c,v=l.v+2.3-.4*c,lu=sm(XT-.3,XT+.1,t,easeIO);
  let pose=blendPose(backpedal(t*1.3),lunge(Math.min(.6,lu*.6),{side:'l'}),lu);const late=sm(NT,NT+1,t);if(late>0)pose=blendPose(pose,idle(t,2),late);return{pose,yaw:yawTo(l.u-u,l.v-v),u,v};},
 t=>{const b=ball1(Math.min(t,NT)),u=2.1,v=key(t,[[0,-.6],[XT,-2],[CT,-1.3]],easeIO);return{pose:blendPose(backpedal(t),idle(t,1),.6),yaw:yawTo(b.u-u,b.v-v),u,v};},
 t=>{const f=fernF(Math.min(t,CT)),u=f.u+.7,v=f.v+1.1,b=ball1(Math.min(t,CT+.2)),tu=sm(CT-.3,CT+.2,t);
  const pose=tu>0?blendPose(backpedal(t*1.2),posed({lHipF:30,lKnee:40,rHipF:10,rKnee:30,lean:-8,neckP:-20,lShF:60,lShA:40,rShA:30,lElb:30}),tu):backpedal(t*1.2);return{pose,yaw:yawTo(b.u-u,b.v-v),u,v};},
 t=>{const u=key(t,[[0,11.5],[XT,8.2]],easeIO),v=key(t,[[0,-.8],[XT,-2.8]],easeIO),b=ball1(Math.min(t,NT));return{pose:blendPose(backpedal(t),idle(t,3),sm(XT,XT+.5,t)),yaw:yawTo(b.u-u,b.v-v),u,v};},
];
/** Spain's other two on court (positions inferred): an ala arriving at the top of the D, the fixo holding near halfway */
const espF:LGen[]=[runner(mono([[0,13,-1.5],[XT,7.6,-1.6],[NT+.4,7.2,-1.9],[NT+1.8,CEL[0]+1.1,CEL[1]+1]]),Math.PI,.6),
 runner(mono([[0,19,1.8],[XT,15.5,.6],[NT+.4,15.2,.4],[NT+2.4,CEL[0]+2.4,CEL[1]+.4]]),Math.PI,.1)];
const liveCam=(T:number)=>({x:key(T,mono([[0,-5.6],[C1.tor,-6.6],[XT-.8,-14.2],[CT,-16.8],[NT+.8,-16.6],[C1.end,-15.8]]),easeInOutSine),
 zoom:key(T,mono([[0,.6],[C1.lead,.62],[C1.tor,.68],[XT,.78],[CT,.92],[NT+.6,.96],[C1.end,.92]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.tor,1060],[XT,1070],[CT,1020],[C1.end,1010]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'1':[2,5],'3':[0,2,3,5,6],'4':[1,2,3,5],'5':[0,1,3,5,6]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** the hanging board: MAR (green tab) left, ESP (red tab) right; the Spain digit pops on a goal */
function scoreboard(s:Sheet,st:Stage,camX:number,score:string,pop:number){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+2.6,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),hot=new Path2D(),h=H*.62,y=top-H+H*.19;
 const tabs=(ink:string,x:number)=>{const p=new Path2D();p.rect(x,top-H+H*.06,W*.16,H*.07);s.fill(ink,p);};tabs(G,cx-W*.38);tabs(R,cx+W*.22);
 digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(pop>0?hot:lit,score[2],cx+W*.3-h*.55,y,h);s.fill(Y,lit);
 if(pop>0){s.fill(Y,hot);s.fill(R,hot,.5*pop);sparkBurst(s,Y,cx+W*.3-h*.28,y+h*.5,H*.9,{n:9,seed:133,g:pop});}
}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const goal=T>=NT;
 courtSide(s,st,T,{cheer:goal?.9:.12,flash:goal?pulse(T,NT,1.2):0,bulge:.55*sm(NT-.1,NT,T)*(1-.6*sm(NT+.3,NT+1.2,T))+.1*settle(T,NT,{amp:1,freq:3,decay:3}),bv:NETP[2],by:NETP[1],
  keeper:()=>{athlete(s,st,FA,gk1,T,MAR_GK,{detail:'low'});}});
 scoreboard(s,st,c.x,goal?'1-4':'1-3',goal?easeOut(sm(NT,NT+.3,T))*(1-sm(NT+1.4,NT+2,T)):0);
 const items:Item[]=[];
 marF.forEach((g,i)=>items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,MAR(i),{detail:'low'})}));
 espF.forEach((g,i)=>items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,ESP(i),{detail:'low'})}));
 items.push({z:depth(FA,torrasF(T)),draw:()=>athlete(s,st,FA,torrasF,T,TORRAS,{detail:c.zoom>.8?'mid':'low',smear:T>XT-.12&&T<XT+.15?.12:0})});
 items.push({z:depth(FA,fernF(T))-.02,draw:()=>athlete(s,st,FA,fernF,T,FERNANDAO,{detail:'mid'})});
 const b=ball1(T);
 items.push({z:depth(FA,b)-.01,draw:()=>{drawBallL(s,st,FA,b,18,9,ball1(T-.08));if(T>=CT&&T<CT+.3){const p=fp(st,FA,CP[0],CP[2],CP[1]);sparkBurst(s,Y,p[0],p[1],90,{n:9,seed:19,g:easeOut(sm(CT,CT+.2,T))});}}});
 // "on the left": a red dashed run arrow along the near touchline ahead of Torras; "crosses": the cross line (dashed yellow) as it flies
 const la=sm(C1.left,C1.left+.5,T,easeOut)*(1-sm(XT-.2,XT+.2,T));
 if(la>.02){const l=torrasF(T);items.push({z:depth(FA,l)+.5,draw:()=>{const pts=[fp(st,FA,l.u-.8,l.v-.4),fp(st,FA,lerp(l.u,5.3,.5),-7.1),fp(st,FA,5.3,-6.9)];const q=partial(pts,la),rp=ribbon(q,14,{seed:31,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(la>.7)arrowHead(s,R,q,36,32);}});}
 if(T>XT&&T<NT+1.4){const fade=1-sm(NT+.8,NT+1.4,T);items.push({z:-99,draw:()=>{const pts:Pt[]=[];for(let k=0;k<=16;k++){const q=ball1(lerp(XT,Math.min(T,CT),k/16));pts.push(fp(st,FA,q.u,q.v,q.y));}if(fade>.05)cased(s,pts,10,33,{dash:34});}});}
 // "Big Fernandão": a red dashed ring under him
 const rg=easeOutBack(sm(C1.big,C1.big+.35,T))*(1-sm(CT+.2,CT+.5,T));
 if(rg>.02){const l=fernF(T),[X,Z]=toStage(FA,l.u,l.v);items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.1,20,50,rg);floorDashRing(s,st,R,X,Z,1.1,12,51,rg);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FA,fernF(tt),.14));},still:C1.chest+.1};

// ================= chapter 2 — WATCH AGAIN (slow-motion replay; low camera out on the court on the far-post side, the cross coming
// in from the left background) =================
const C2={watch:A(1,'Watch'),body:A(1,'big body'),goes:A(1,'in it goes'),chest:A(1,'off his'),win:A(1,'Spain win'),five:A(1,'five one'),end:AUTH[1].seconds};
/** replay time → chapter-1 action time (slow motion keyed to the words) */
const seq2=(t:number)=>key(t,mono([[0,XT-1.1],[C2.body,XT+.05],[C2.goes,CT-.12],[C2.chest,CT+.12],[C2.win,NT+.5],[C2.end,NT+2.2]]),linear);
const FR2:Frame={ox:0,oz:GZ,rot:-Math.PI/2-.55};
const CPS=toStage(FR2,CP[0],CP[2]);
const st2:Stage={F:1500,eye:1.35,cx:CPS[0]-1.2,cz:CPS[1]-7.2};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,q=seq2(tt),q2=seq2(t),hit=pulse(q2,CT,.5);
  const c=fp(st,FR2,CP[0],CP[2],CP[1]);
  camPath(s,t,[[0,-240,60,.7],[C2.body,-80,0,.82],[C2.goes,c[0]-40,c[1]+60,1.18],[C2.chest,c[0]-60,c[1]+80,1.22],[C2.win,c[0]-160,c[1]+120,1.02],[C2.end,c[0]-180,c[1]+120,.98]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  const goal=q>=NT;
  arena(s,st,FR2,tt,{cheer:goal?.9:.1,flash:goal?pulse(q,NT,1.4):0,bulge:.55*sm(NT-.1,NT,q)*(1-.6*sm(NT+.4,NT+1.4,q))+.1*settle(q,NT,{amp:1,freq:3,decay:3}),bv:NETP[2],by:NETP[1],
   keeper:()=>{athlete(s,st,FR2,gk1,q,MAR_GK,{detail:'mid'});}});
  const items:Item[]=[];
  const g2=(g:LGen):LGen=>x=>g(seq2(x));
  [marF[1],marF[2]].forEach((g,i)=>items.push({z:depth(FR2,g(q)),draw:()=>athlete(s,st,FR2,g2(g),tt,MAR(i+1),{detail:'mid'})}));
  items.push({z:depth(FR2,torrasF(q)),draw:()=>athlete(s,st,FR2,g2(torrasF),tt,TORRAS,{detail:'mid'})});
  items.push({z:depth(FR2,fernF(q))-.01,draw:()=>athlete(s,st,FR2,g2(fernF),tt,FERNANDAO,{detail:'high',smear:q>CT-.3&&q<CT+.1?.35:0})});
  const b=ball1(q);
  items.push({z:depth(FR2,b)-.02,draw:()=>{drawBallL(s,st,FR2,b,211,10,ball1(q-.1));if(q>=CT&&q<CT+.35)sparkBurst(s,Y,c[0],c[1],130,{n:10,seed:212,g:easeOut(sm(CT,CT+.25,q))});}});
  items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
  // the flight line (dashed yellow) and, on "big body", a yellow bracket down his side (his size in the ball's way)
  if(q>XT){const pts:Pt[]=[];for(let k=0;k<=16;k++){const bb=ball1(lerp(XT,Math.min(q,NT),k/16));pts.push(fp(st,FR2,bb.u,bb.v,bb.y));}cased(s,pts,12,221,{dash:40});}
  const bd=sm(C2.body,C2.body+.5,tt,easeOut)*(1-sm(C2.win,C2.win+.4,tt));
  if(bd>.02){const f=fernF(q),hd=jointPt(st,FR2,f,'head'),g=fp(st,FR2,f.u,f.v),o=kAt(st,depth(FR2,f))*.62,pts:Pt[]=[[g[0]-o*.6,g[1]],[g[0]-o,lerp(g[1],hd[1],.5)],[hd[0]-o*.6,hd[1]-o*.2]];cased(s,pts,11,223,{dash:30,progress:bd});
   const pts2:Pt[]=pts.map(p=>[2*g[0]-p[0]+(hd[0]-g[0])*(p[1]-g[1])/(hd[1]-g[1]||1)*2,p[1]] as Pt);cased(s,pts2,11,224,{dash:30,progress:bd});}
  // "off his chest": a red ring on his chest at the touch
  const ch=easeOutBack(sm(C2.chest-.1,C2.chest+.25,tt))*(1-sm(C2.win,C2.win+.3,tt));
  if(ch>.02){const r=kAt(st,depth(FR2,fernF(q)))*.26*ch;s.fill(R,ribbon(blob(c[0],c[1],r,r*.85,231,{n:22}),10,{seed:232,close:true,wobble:1}),1);}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,FR2,fernF(seq2(tt)),.13));},
 still:C2.chest+.2,
};

// ================= the pivot turn (chapters 3–4, a demonstration; local frame): shield, feel, spin, shoot =================
/** HOLD: low wide base, weight forward, the LEFT arm bent and held back against the defender, the head turned to feel him */
const HOLD=posed({lHipF:26,rHipF:24,lKnee:46,rKnee:44,lAnk:-8,rAnk:-8,lHipA:14,rHipA:14,lHipR:10,rHipR:10,lean:24,pitch:4,neckP:12,neckY:42,
 lShF:-50,lShA:36,lShR:12,lElb:34,rShF:30,rShA:42,rElb:60,twist:14,squash:-.04});
/** RECV: the same hold, the RIGHT sole up and flat on the ball (the foot away from the defender) */
const RECV=posed({lHipF:22,rHipF:48,lKnee:50,rKnee:56,lAnk:-6,rAnk:-4,lHipA:12,rHipA:-2,lHipR:10,lean:24,pitch:4,neckP:14,neckY:48,
 lShF:-52,lShA:38,lShR:12,lElb:34,rShF:28,rShA:46,rElb:58,twist:16,squash:-.05});
/** TURN: spinning over the right shoulder on the left foot, the right leg swinging round with the ball, arms out for balance */
const TURN=posed({lHipF:30,lKnee:52,lHipA:6,lAnk:-4,rHipF:34,rKnee:70,rHipA:30,rHipR:22,rAnk:10,lean:24,bend:-10,twist:-28,roll:-6,neckY:-38,neckP:16,
 lShF:14,lShA:64,lElb:40,rShF:-12,rShA:60,rElb:46,squash:-.06});
/** the defender pressing: chest to his back, forearms on him */
const PRESS=posed({lHipF:30,rHipF:12,lKnee:42,rKnee:36,lAnk:-6,lean:24,neckP:16,lShF:60,rShF:52,lShA:16,rShA:14,lElb:52,rElb:46});
const P0:[number,number]=[5.4,.3];// the pivot's stance (local)
const D0:[number,number]=[4.72,.44];// the defender, goal side of him
const TGT:V3=[-.1,.34,-1.12];// low, inside the post on the pivot's right (local u, y, v)
const YAW_S=yawTo(TGT[0]-P0[0],TGT[2]-P0[1]);
const SB:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD,{yaw:YAW_S}),toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[toe[0]+d[0]/l*.08,-(toe[2]+d[1]/l*.08)];})();
const SHOT:[number,number]=[P0[0]+SB[0],P0[1]+SB[1]];
type TurnT={pass0:number;pass1:number;hold:number;lean:number;turn0:number;turn1:number;hit:number;from:[number,number]};
type Turn={piv:LGen;def:LGen;gk:LGen;ball:(t:number)=>BallS;inn:number};
function makeTurn(T:TurnT):Turn{
 const inn=T.hit+.3;
 const strikeT=(t:number)=>key(t,[[T.turn1,.26],[T.hit,STRIKE_CONTACT],[T.hit+.5,.82],[T.hit+1.1,.95]],linear);
 const ready=(t:number)=>{const bob=Math.sin(t*5.2)*.5+.5;return posed({lHipF:18,rHipF:18,lKnee:32+6*bob,rKnee:30+6*bob,lHipA:10,rHipA:10,lean:16,neckP:8,neckY:20,lShA:22,rShA:22,lElb:40,rElb:40});};
 const piv:LGen=t=>{
  let pose:Pose,yaw=0;
  if(t<T.hold-.4)pose=ready(t);
  else if(t<T.pass1-.25)pose=blendPose(ready(t),HOLD,sm(T.hold-.4,T.hold,t,easeIO));
  else if(t<T.turn0)pose=blendPose(HOLD,RECV,sm(T.pass1-.25,T.pass1,t,easeIO));
  else if(t<T.turn1){pose=keyPoses(t,[[T.turn0,RECV],[lerp(T.turn0,T.turn1,.5),TURN],[T.turn1,strike(.26,{foot:'r'})]]);yaw=lerp(0,YAW_S,sm(T.turn0,T.turn1,t,easeIO));}
  else{pose=strike(strikeT(t),{foot:'r'});yaw=YAW_S;const c=sm(inn+.4,inn+.9,t,easeIO);if(c>0){pose=blendPose(pose,celebrate((t-inn-.4)*1.1,{kind:'arms'}),c);yaw=lerp(YAW_S,YAW_S+1.9,c);}}
  const push=t>T.hold&&t<T.turn0?.03*Math.sin(t*7):0;
  const fwd=t>T.hit?.25*sm(T.hit,T.hit+.6,t,easeOut):0;
  return{pose,yaw,u:P0[0]+push-fwd,v:P0[1]};};
 const def:LGen=t=>{
  const close=sm(0,T.hold,t,easeOut),lu=key(t,[[T.lean-.05,0],[T.lean+.45,.55],[T.turn1,.62],[T.turn1+.9,.85]],linear);
  let pose=blendPose(backpedal(t*1.2),PRESS,sm(T.hold-.6,T.hold,t,easeIO));
  pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T.lean-.1,T.lean+.2,t,easeIO));
  const late=sm(T.turn1-.1,T.turn1+.7,t,easeIO);
  if(late>0)pose=blendPose(pose,posed({lHipF:40,rHipF:20,lKnee:56,rKnee:44,lean:22,neckY:-50,lShA:40,rShA:36,lElb:50,rElb:50,twist:-20}),late*.7);
  const shift=.36*sm(T.lean,T.lean+.4,t,easeIO);
  return{pose,yaw:-late*1.3,u:D0[0]-.9*(1-close),v:D0[1]+shift};};
 const gk:LGen=t=>{const d=sm(T.hit+.02,T.hit+.55,t,linear);let pose=keeperSet(t*1.3);if(d>0)pose=keeperDive(Math.min(.95,.3+d*.65),{side:'r'});return{pose,yaw:0,u:.62,v:.08};};
 const soleAt=(t:number):[number,number]=>{const{sk,J}=jointsL(piv(t)),toe=J(sk.rToe),heel=J(sk.rHeel);return[lerp(heel[0],toe[0],.66),lerp(heel[2],toe[2],.66)];};
 let RB:[number,number]|null=null;
 const ballF=(t:number):BallS=>{
  if(!RB)RB=soleAt(T.pass1);
  if(t<T.pass0)return{u:T.from[0],y:BALL_R,v:T.from[1],flying:false,spin:0};
  if(t<T.pass1){const u=sm(T.pass0,T.pass1,t,easeOut);return{u:lerp(T.from[0],RB[0],u),y:BALL_R,v:lerp(T.from[1],RB[1],u),flying:false,spin:u*10};}
  if(t<T.turn0){const[u,v]=soleAt(t);return{u,y:BALL_R,v,flying:false,spin:10};}
  if(t<T.hit){const w=sm(T.turn0,T.turn1,t,easeIO),[u,v]=soleAt(Math.min(t,T.turn1-.001));return{u:lerp(u,SHOT[0],w),y:BALL_R,v:lerp(v,SHOT[1],w),flying:false,spin:10+w*6};}
  if(t<inn){const u=sm(T.hit,inn,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M=[lerp(SHOT[0],TGT[0],.5),.42,lerp(SHOT[1],TGT[2],.5)];
   return{u:a*SHOT[0]+b*M[0]+c*TGT[0],y:a*BALL_R+b*M[1]+c*TGT[1],v:a*SHOT[1]+b*M[2]+c*TGT[2],flying:true,spin:20+u*30};}
  const d=sm(inn+.05,inn+.35,t,easeIn),bo=Math.abs(Math.sin(sm(inn+.35,inn+1.1,t)*Math.PI*2))*.1*(1-sm(inn+.35,inn+1.1,t));
  return{u:-.62,y:lerp(TGT[1],BALL_R,d)+bo,v:TGT[2]+.05,flying:false,spin:50};};
 return{piv,def,gk,ball:ballF,inn};
}

// ================= chapter 3 — HOW HE DOES IT (a demonstration, real time; camera out on the court off his LEFT front, goal behind him) =================
const C3={piv:A(2,'He is'),how:A(2,'This is'),back:A(2,'back to'),shields:A(2,'shields'),size:A(2,'with his'),feels:A(2,'feels'),turns:A(2,'turns'),shoots:A(2,'shoots'),end:AUTH[2].seconds};
const T3:TurnT={pass0:C3.back-.3,pass1:C3.shields,hold:C3.back,lean:C3.feels+.15,turn0:C3.turns-.05,turn1:C3.turns+.55,hit:Math.max(C3.turns+.8,C3.shoots),from:[11.5,-5.2]};
const turn3=makeTurn(T3);
const FB:Frame={ox:0,oz:GZ,rot:-Math.PI/2-.45};
const P0B=toStage(FB,P0[0],P0[1]);
const st3:Stage={F:1500,eye:2.3,cx:P0B[0]+1.4,cz:P0B[1]-5.4};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,inn=turn3.inn,hit=pulse(t,T3.hit,.35),pv=fp(st,FB,P0[0],P0[1],1.1);
  camPath(s,t,[[0,pv[0]-60,pv[1]-60,.72],[C3.how,pv[0]-40,pv[1]-40,.78],[C3.shields,pv[0]-10,pv[1]-10,1.05],[C3.size,pv[0]-10,pv[1]-10,1.12],[C3.feels,pv[0]-20,pv[1]-20,1.08],[C3.turns,pv[0]-120,pv[1]-40,.9],[T3.hit+.2,pv[0]-260,pv[1]-60,.78],[C3.end,pv[0]-240,pv[1]-60,.8]],[5*hit*Math.sin(t*80),0]);
  const goal=tt>=inn;
  arena(s,st,FB,tt,{cheer:goal?.6:0,flash:pulse(tt,inn,1.2),bulge:.5*sm(inn-.1,inn,tt)*(1-.6*sm(inn+.3,inn+1.2,tt))+.1*settle(tt,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FB,turn3.gk,tt,DEMO_GK,{detail:'mid'});}});
  const piv=turn3.piv(tt),df=turn3.def(tt),PZ=depth(FB,piv);
  // "He is a pivot": a red dashed ring under him; "back to goal": a dashed yellow arrow from his back to the goal
  const rg=easeOutBack(sm(C3.piv,C3.piv+.35,tt))*(1-sm(C3.how,C3.how+.3,tt));
  if(rg>.02){const[X,Z]=toStage(FB,piv.u,piv.v);floorDashRing(s,st,K,X,Z,1.1,20,300,rg);floorDashRing(s,st,R,X,Z,1.1,12,301,rg);}
  const bk=easeOut(sm(C3.back,C3.back+.5,tt))*(1-sm(C3.shields+.2,C3.shields+.5,tt));
  if(bk>.02){const pts=[fp(st,FB,piv.u-.9,piv.v-.3),fp(st,FB,piv.u-2.8,piv.v-.5),fp(st,FB,1.1,-.2)];cased(s,pts,12,302,{dash:40,progress:bk});if(bk>.9)casedHead(s,pts,36,303);}
  const sp=sm(C3.turns-.1,C3.turns+.35,tt,easeOut)*(1-sm(T3.hit+.3,T3.hit+.8,tt));
  if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=-.3-k/14*2.6;pts.push(fp(st,FB,P0[0]+Math.cos(a)*1.2,P0[1]+Math.sin(a)*1.2));}cased(s,pts,12,304,{dash:34,progress:sp});if(sp>.9)casedHead(s,pts,32,305);}
  if(tt>T3.hit){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=turn3.ball(lerp(T3.hit,Math.min(tt,inn),k/14));pts.push(fp(st,FB,q.u,q.v,q.y));}cased(s,pts,10,306,{dash:36});}
  const b=turn3.ball(tt);
  const items:Item[]=[
   {z:depth(FB,df),draw:()=>athlete(s,st,FB,turn3.def,tt,DEMO_D,{detail:'high'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FB,turn3.piv,tt,FERNANDAO,{detail:'high',smear:(tt>T3.turn0&&tt<T3.turn1+.05)||(tt>T3.hit-.15&&tt<T3.hit+.2)?.14:0})},
   {z:tt<T3.hit&&tt>=T3.pass1?PZ-.01:depth(FB,b),draw:()=>{drawBallL(s,st,FB,b,311,10);if(tt>=T3.hit&&tt<T3.hit+.35){const p=fp(st,FB,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],110,{n:9,seed:312,g:easeOut(sm(T3.hit,T3.hit+.25,tt))});}}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "shields the ball": a red ring round the holding arm; "with his size": yellow brackets along his broad back; "feels the defender": pulse rings at the hand
  if(tt>=C3.shields&&tt<T3.turn0+.1){const e=jointPt(st,FB,piv,'lEl'),h=jointPt(st,FB,piv,'lHa'),g=easeOutBack(sm(C3.shields,C3.shields+.35,tt))*(1-sm(T3.turn0-.2,T3.turn0+.1,tt)),c:Pt=[(e[0]+h[0])/2,(e[1]+h[1])/2],r=kAt(st,PZ)*.3*g;
   if(g>.02)s.fill(R,ribbon(blob(c[0],c[1],r,r*.8,321,{n:22}),9,{seed:322,close:true,wobble:1}),1);
   const bd=sm(C3.size,C3.size+.45,tt,easeOut)*(1-sm(T3.turn0-.2,T3.turn0+.1,tt));if(bd>.02){const ls=jointPt(st,FB,piv,'lSh'),rs=jointPt(st,FB,piv,'rSh'),pe=jointPt(st,FB,piv,'pelvis'),o=kAt(st,PZ)*.2,up=Math.min(ls[1],rs[1])-o;
    const pts:Pt[]=[[Math.min(ls[0],rs[0])-o,pe[1]],[Math.min(ls[0],rs[0])-o,up],[Math.max(ls[0],rs[0])+o,up],[Math.max(ls[0],rs[0])+o,pe[1]]];cased(s,pts,10,323,{dash:26,progress:bd});}
   const fe=pulse(tt,C3.feels+.1,.8);if(fe>.05)for(let k=0;k<2;k++){const rr=kAt(st,PZ)*(.14+.22*k+.2*(1-fe));s.fill(Y,ribbon(blob(h[0],h[1],rr,rr,324+k,{n:18}),6,{seed:326+k,close:true,wobble:.8}),fe);}}
  // the defender leans: a red arrow toward his lean
  const la=sm(T3.lean,T3.lean+.5,tt,easeOut)*(1-sm(T3.hit,T3.hit+.5,tt));
  if(la>.02){const pts=[fp(st,FB,D0[0],D0[1]+.3),fp(st,FB,D0[0]-.1,D0[1]+1),fp(st,FB,D0[0]-.2,D0[1]+1.8)];const q=partial(pts,la),rp=ribbon(q,12,{seed:331,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(la>.6)arrowHead(s,R,q,30,332);}
  if(tt>=inn&&tt<inn+1.2){const p=fp(st,FB,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],130,{n:12,seed:333,g:easeOut(sm(inn,inn+.3,tt))*(1-sm(inn+.8,inn+1.2,tt))});}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,FB,turn3.piv(tt),.13));},
 still:C3.size+.3,
};

// ================= chapter 4 — YOUR TURN (side-on, from the main stand; he runs it again, slower); three cards (shield, turn, shoot); a tick =================
const C4={your:A(3,'Your'),size:A(3,'use your'),shield:A(3,'shield the'),turn:A(3,'then turn'),shoot:A(3,'shoot'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T3.hold-.7],[C4.size,T3.hold+.1],[C4.shield,T3.pass1+.1],[C4.turn,T3.turn0],[C4.shoot,T3.hit+.02],[C4.end,turn3.inn+1.5]]),linear);
const g4=(g:LGen):LGen=>t=>g(seq4(t));
const piv4=g4(turn3.piv),def4=g4(turn3.def),gk4=g4(turn3.gk);
const st4=(_t:number):Stage=>({F:2200,eye:2.4,cx:-16.9,cz:1.2});
const CARD_Y=-50,CARD_W=165,CARDS:[number,number,'shield'|'turn'|'shoot'][]=[[-420,C4.shield-.1,'shield'],[0,C4.turn,'turn'],[420,C4.shoot,'shoot']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4(tt),q=seq4(tt),inn=turn3.inn;
  camPath(s,t,[[0,200,420,1.0],[C4.your+.4,0,320,.84],[C4.turn,0,320,.84],[C4.shoot+.4,0,320,.84],[C4.end,0,315,.85]]);
  const goal=q>=inn;
  courtSide(s,st,tt,{cheer:goal?.9*(1-sm(C4.end-1,C4.end,tt)):0,flash:goal?pulse(q,inn,1.2):0,bulge:.5*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q)),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FA,gk4,tt,DEMO_GK,{detail:'mid'});}});
  const piv=piv4(tt),PZ=depth(FA,piv),b=turn3.ball(q);
  const items:Item[]=[
   {z:depth(FA,def4(tt)),draw:()=>athlete(s,st,FA,def4,tt,DEMO_D,{detail:'mid'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FA,piv4,tt,FERNANDAO,{detail:'high',smear:q>T3.turn0&&q<T3.turn1+.05?.2:0})},
   {z:q<T3.hit&&q>=T3.pass1?PZ-.01:depth(FA,b),draw:()=>{drawBallL(s,st,FA,b,411,10);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards drop in on "Your turn"; each prints its step as it is said (shield, turn, shoot)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=-(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-170+dy],[cx+CARD_W,CARD_Y-170+dy],[cx+CARD_W,CARD_Y+170+dy],[cx-CARD_W,CARD_Y+170+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+135;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+10,y:gy+20,height:320*(.9+.1*on),azimuth:kind==='shield'?-90:kind==='turn'?20:80,elevation:14,fov:18,at:[0,0,0]});
    const pose=kind==='shield'?RECV:kind==='turn'?TURN:strike(STRIKE_CONTACT,{foot:'r'});
    const csk=solve(pose,BUILD,{}),P=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    if(kind==='turn'){const pts:Pt[]=[];for(let k=0;k<=10;k++){const a=k/10*2.4;pts.push(P([Math.cos(a)*.7,0,Math.sin(a)*.7]));}dashed(s,Y,pts,8,85,{dash:22});arrowHead(s,Y,pts,22,86);}
    if(kind==='shoot'){const tb:V3=[csk.rToe[0]+.12,BALL_R,csk.rToe[2]],p0=P(tb),p1=P([tb[0]+1.6,.3,tb[2]]),pts:Pt[]=[p0,L2(p0,p1,.5),p1];dashed(s,Y,pts,8,87,{dash:22});arrowHead(s,Y,pts,24,88);const bR=BALL_R*(fc.scale?fc.scale(tb):100);ball(s,p0[0],p0[1],bR,81+i);}
    drawAthlete(s,pose,fc,{...FERNANDAO,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    if(kind==='shield'){const e=P(csk.lEl),h=P(csk.lHa),c:Pt=[(e[0]+h[0])/2,(e[1]+h[1])/2];s.fill(R,ribbon(blob(c[0],c[1],34*on,28*on,90+i,{n:18}),6,{seed:93+i,close:true,wobble:1}),1);}
    s.restore();});
   s.fill(K,frames);}
  // "shoot": a big tick (yellow over red, navy echo) stamps beside him
  const tick=easeOutBack(sm(C4.shoot+.35,C4.shoot+.7,tt));
  if(tick>.02){const g=fp(st,FA,piv.u,piv.v),h=kAt(st,PZ)*1.8,c:Pt=[g[0]-h*.75,g[1]-h*.85],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.turn+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'fernandao-futsal-signature',format:'futsal',title:'Fernandão’s big pivot turn',theme:'Use your size to shield the ball, then turn and shoot.',
 ageNote:'For players aged 7–12: the 2012 World Cup match and Fernandão’s chest goal are real; the turn is shown as a demonstration. Use your arm to feel, not to push.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in and stops under a sole; a curved spin arrow flicks round it; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const roll=sm(0,.3,age,easeOut),bx=x+140*(1-roll);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:(1-roll)*6});
  const sp=sm(.3,.7,age,easeOut)*(1-sm(.9,1.2,age));if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const a=-.4-k/12*3.4*sp;pts.push([x+Math.cos(a)*r*1.9,y+Math.sin(a)*r*1.2]);}s.fill(Y,ribbon(pts,10,{seed,taper:.3,wobble:1}),1);s.fill(R,ribbon(pts.map(p=>[p[0]+4,p[1]+4] as Pt),4,{seed:seed+1,taper:.3,wobble:1}),.6);}
 },
};
export default film;
