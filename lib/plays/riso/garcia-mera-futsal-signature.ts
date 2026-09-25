/** Julio García Mera — "the step-in steal": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Julio García Mera ("Julio"), born 27 May 1972 in Madrid — the card's country (playerAppearance: Spain) and bio ("Spanish cierre and
 *  Inter Movistar legend") match the Wikipedia player: a Spain defender (cierre = fixo) 1996–2005 who played for Interviú / Inter Movistar
 *  1991–2007. Not to be confused with any football namesake.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature (the fixo who steps in front of his attacker to steal the pass), not one
 *  match. No written source we could reach describes a single Julio steal in words, so the film follows the brief's honest fallback: it opens
 *  on a REAL, documented match in which he did something that IS written down — the 2004 FIFA Futsal World Cup semi-final against Brazil,
 *  where he took and SCORED Spain's third kick of the shoot-out — and shows ONLY confirmed things (the arena, the two teams lined up for the
 *  shoot-out, the scoreboard at 2–2, Julio scoring his kick, the 5–4 shoot-out result and Spain celebrating). No open-play goal, pass or
 *  tackle of that match is staged. Then "This is how he does it" introduces the steal in a separate, labelled demonstration (training kit,
 *  no opponent named) that is never passed off as that match. (Match choice: Kike's film uses the 2004 FINAL; no futsal film uses this
 *  semi-final.)
 *  1  LIVE (broadcast camera, main stand): 3 December 2004, 18:00, NTU Gymnasium (National Taiwan University Sports Center), Taipei, Brazil
 *     2–2 Spain after extra time. The two lines of players in the centre circle for the shoot-out, Julio in Spain's line; the scoreboard 2–2
 *     (shoot-out 1–2 before his kick: on either kicking order Spain had 1 and Brazil 2 when he stepped up); whip pan (a cut in time) to the
 *     penalty mark: Julio's kick goes in, the shoot-out row turns 2–2; whip pan (a cut in time) to the end: 5–4, Spain's players run together.
 *  2  HOW HE DOES IT (a demonstration, real time, side-on; he in a plain red training top, the attackers in paper training bibs): he stays
 *     close behind the pivot; the pass is played to the pivot's feet; at the right moment he steps round and in front, meets the ball first
 *     with his right foot and attacks.
 *  3  WATCH AGAIN (slow-motion replay of the demonstration, reverse angle: low, from behind him looking up the court): stay close, watch the
 *     pass, step in front.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Step in front of your attacker at the right moment to steal the pass."): he runs it again;
 *     three cards (close, step, steal); a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Julio García Mera" (raw; wiki-julio-garcia-mera.txt): born 27 May 1972, Madrid; position Defender; Interviú 1991–2007
 *    ("best known for his spell with Inter Movistar as a defender"); Spain 1996–2005; World Champion 2000, runner-up 1996; European Champion
 *    1996, 2001, 2005; in Spain's 1996, 2000 and 2004 World Cup squads. — https://en.wikipedia.org/wiki/Julio_Garc%C3%ADa_Mera
 *    (The Spanish Wikipedia has no article: 404.)
 *  - Wikipedia, "2004 FIFA Futsal World Cup" (raw; wiki-2004-futsal-wc.txt): semi-final 3 December 2004, 18:00, NTU Gymnasium, Taipei City,
 *    Brazil 2–2 Spain (a.e.t.; Andreu 23', Marcelo 35' for Spain; Pablo 26', Simi 35' for Brazil), attendance 3,400, referee Néstor Valiente;
 *    penalties 4–5: Brazil — Simi ✓, Euler ✓, Índio ✗, Falcão ✓, Schumacher ✓, Neto ✗; Spain — Kike ✗, Torras ✓, JULIO ✓, Limones ✓, Javi
 *    Rodríguez ✓, Andreu ✓. Spain then beat Italy 2–1 in the final. — https://en.wikipedia.org/wiki/2004_FIFA_Futsal_World_Cup
 *  - Wikipedia (es), "Selección de fútbol sala de España" (raw; eswiki-seleccion-futsal-espana.txt): "Julio García Mera 115 (1994-2005)" caps.
 * CONFIRMED (the narration states only these): Taipei, 2004, a Futsal World Cup semi-final, Spain v Brazil, 2–2, penalties, Julio (a Spain
 *  defender = fixo) taking and scoring a kick, Spain winning the shoot-out (5–4, shown on the scoreboard).
 * INFERRED (never named in the narration): the kicking order (so which team kicked first is not shown — only the tally before/after his kick,
 *  which is the same either way); kits (Spain red shirts, navy shorts; Brazil yellow shirts, blue shorts, white socks; the keeper's colours);
 *  which goal the shoot-out used; Julio's run-up, his right foot and where the kick went (low, to the keeper's right; the keeper goes the
 *  other way); who won the last kick is not shown as anyone in particular (Andreu scored it — an unnamed team-mate stands at the knot);
 *  where the celebration happened; every position in chapter 1; the scoreboard's look; his short dark hair (playerAppearance). No video was
 *  reviewed. Chapters 2–4 are a demonstration; the right foot for the steal is a choice, not a fact.
 * Technique (poses): goal side and close to the pivot (an arm's length, a forearm touching his back) so the pivot can't turn; eyes on the
 *  passer; he does NOT move before the pass is played (or the passer just picks another pass) — once the ball is on its way he steps round
 *  the pivot's shoulder on the ball side, in front of him, arrives before the ball, low, and meets it with the foot nearest it; first touch
 *  forward, and he attacks the space the attacker left.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the step, the steal and the kick). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v =
 *  across); each stage maps it with a proper rotation (no mirror), so the right foot stays the right foot. Our stages are LEFT-handed (X right,
 *  Z away), so `projector()` maps library z → −Z. (The court, ball and goal machinery follow the approved Kike Boned and Eremenko films.)
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through the
 *  cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, Brazil shirts, diagrams), red (Spain, arrows), blue (Brazil shorts), navy (key line, shorts, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,stand,lunge,runCycle,runCadence,dribble,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Build,type AthleteStyle,type Projector,type Place,type V3} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2004 semi-final',text:'Taipei, 2004: the Futsal World Cup semi-final, Spain against Brazil. Julio is Spain’s fixo. It ends two all, so penalties! Julio steps up and scores, and Spain win the shootout!',tail:2.4,
  cues:['Taipei','Futsal World','Spain against','Julio is','fixo','two all','penalties','Julio steps','scores','Spain win','shootout'],heads:{'Taipei':'Semi-final 2004','two all':'2–2','Spain win':'5–4 on penalties'}},
 {label:'How he does it',text:'A fixo can steal passes too. This is how he does it: he stays close behind the pivot. The pass comes, he steps in front at the right moment, steals it and attacks!',tail:2.2,
  cues:['fixo can','This is how','stays close','behind the pivot','The pass comes','steps in front','right moment','steals it','attacks'],heads:{'fixo can':'The step-in steal','attacks':''}},
 {label:'Watch again',text:'Watch again, slowly. Stay close, watch the pass, step in front!',tail:2.3,
  cues:['Watch again','slowly','Stay close','watch the pass','step in front'],heads:{'Watch again':'Slow motion','step in front':''}},
 {label:'Your turn',text:'Your turn: step in front of your attacker at the right moment to steal the pass!',tail:2.6,
  cues:['Your turn','step in front','your attacker','right moment','steal the pass'],heads:{'Your turn':'Close, step, steal','steal the pass':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/garcia-mera-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/garcia-mera-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/garcia-mera-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('garcia-mera: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('garcia-mera: no cue '+w);return c.at;};
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
/** a camera key [t, x, y, zoom] that frames a set of sheet points (with padding) inside the composition box */
function frameOn(t:number,pts:Pt[],pad=260,maxZoom=1.3):Key{let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}
 const z=Math.min(maxZoom,BOX_W/(x1-x0+pad*2),BOX_H/(y1-y0+pad*2));return[t,(x0+x1)/2,(y0+y1)/2,+z.toFixed(3)];}

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
/** a solid red arrow (the step) */
function redArrow(s:Sheet,pts:Pt[],w:number,seed:number,progress=1){const q=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(q.length<2)return;const rp=ribbon(q,w,{seed,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(progress>.6)arrowHead(s,R,q,w*2.6,seed+1);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24,rz=r):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*rz));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- the LOCAL court frame: u = metres out from a goal line (0 = the line), v = across (0 = the goal's centre) ----------------
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
const BUILD:Build={height:1.76,bulk:1.02};
/** Julio in the 2004 semi-final: Spain red shirt, navy shorts, red socks (kit inferred), short dark hair */
const JULIO:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.8],[R,.3]],hair:K,line:K,trim:Y,hairStyle:'short',build:BUILD,seed:5};
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.78],[R,.26]],hair:K,line:K,trim:Y,hairStyle:(['curly','short','bald','short'] as const)[n%4],build:{height:1.72+hash(n,3)*.12},seed:20+n});
const BRA=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,skin:[[Y,.8],[R,.3+.05*(n%2)]],hair:K,line:K,trim:B,hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.7+hash(n,4)*.12},seed:40+n});
const BRA_GK:AthleteStyle={shirt:[K,.6],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.26]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:61};
/** the demonstration (chapters 2–4): Julio in a plain red training top; the attackers in paper training bibs, navy shorts — no team is claimed */
const JULIO_TR:AthleteStyle={...JULIO,socks:K,trim:'paper'};
const DEMO=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.22+.06*n]],hair:K,line:K,trim:B,hairStyle:n?'curly':'short',build:{height:1.8+.04*n,bulk:1.04},seed:77+n});
/** THE adapter: draw one athlete from a local generator at time t on stage st / frame fr (prev = one drawn frame earlier; smear = motion echo) */
function athlete(s:Sheet,st:Stage,fr:Frame,gen:LGen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const pl=(l:Loc)=>{const[X,Z]=toStage(fr,l.u,l.v);return placeAt(X,Z,l.yaw+fr.rot);};
 const a=gen(t),b=gen(t-1/12),cm=projector(st);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl(a),{prevPlace:pl(c),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl(a),{prev:b.pose,prevPlace:pl(b)});
}
/** a skeleton in the local frame: joints come back as [u, height, v] */
function jointsL(l:Loc,build:Build=BUILD){const sk=solve(l.pose,build,{x:l.u,z:-l.v,yaw:l.yaw}),J=(j:V3):[number,number,number]=>[j[0],j[1],-j[2]];return{sk,J};}

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
type BallL={u:number;y:number;v:number;moving:boolean;spin:number;fly?:boolean};
/** a ball drawn on stage st through frame fr, with its floor shadow (a moving ball smears back along its path from prev) */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:BallL,prev:{u:number;v:number;y?:number},seed:number,min=9){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R),o=fp(st,fr,prev.u,prev.v,prev.y??BALL_R);
 shadow(s,g[0]+r*.2,g[1],r*1.15,r*.3,seed+5,b.fly?.25:.4);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.moving?(b.fly?.45:.35):0,dir:Math.atan2(p[1]-o[1],p[0]-o[0])});return{p,r};
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** a player's chest (the passage enters his red shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
/** a joint of a player on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:'head'|'chest'|'pelvis'|'rToe',build:Build=BUILD):Pt{const{sk,J}=jointsL(l,build),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];

// ---------------- the arena: wood court, stands, futsal goal ----------------
/** stepped navy rows, lit faces, red and yellow shirts, roof lights; `flags` waves Spain (red-yellow-red) and Brazil-fan (yellow with a blue
 * disc) flags — only in the real semi-final (chapter 1); the demonstration's crowd carries none. cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,flags=false){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),yel=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.22)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.34)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 if(flags)for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  if(f%3===1){yel.addPath(band(0,1));const c=pole(.5,.5);blues.addPath(polyPath(blob(c[0],c[1],fh*.26,fh*.26,300+f,{n:14}),true));}// Brazil fans: yellow, blue disc
  else{reds.addPath(band(0,.25));yel.addPath(band(.25,.75));reds.addPath(band(.75,1));}}// Spain: red, yellow, red
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal goal (3 m × 2 m) on any frame: net halftone + mesh bulging round (bv, by) */
function goalNet(s:Sheet,st:Stage,fr:Frame,bulge=0,bv=0,by=1){
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
/** the court's painted lines in the local frame: goal line, the D (6 m quarter circles from the posts), 6 m and 10 m spots, touchlines, halfway */
function courtLines(st:Stage,fr:Frame,lines:Path2D,uMin:number,uMax:number){
 const S=(pts:Pt[])=>pts.map(([u,v])=>toStage(fr,u,v) as Pt),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([6*Math.sin(a),-1.5-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([6*Math.sin(a),1.5+6*Math.cos(a)]);}
 if(uMin<=0){lines.addPath(polyPath(floorStrip(st,S([[0,-10],[0,10]]),.05),true));lines.addPath(polyPath(floorStrip(st,S(arc),.05),true));}
 for(const u of[6,10])if(u>=uMin){const[X,Z]=toStage(fr,u,0);lines.addPath(polyPath(floorRing(st,X,Z,.12,12),true));}
 for(const v of[-10,10])lines.addPath(polyPath(floorStrip(st,S([[Math.max(0,uMin),v],[uMax,v]]),.05),true));
 if(uMax>=20){lines.addPath(polyPath(floorStrip(st,S([[20,-10],[20,10]]),.05),true));const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([20+Math.cos(a)*3,Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,S(cc),.05),true));}
}

// ---- SIDE court from the broadcast position (chapters 1–2): the goal at X = −20, the near touchline Z = 0, the far boards Z = 21 ----
const BOARDS=21,FA:Frame={ox:-20,oz:10,rot:0};
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
type CourtOpt={cheer?:number;flash?:number;bulge?:number;bv?:number;by?:number;keeper?:()=>void;flags?:boolean};
function courtSide(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.45);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 const strips=new Path2D(),seams=new Path2D(),X0=st.cx-30,X1=st.cx+30,z00=Math.max(-1,st.cz+.6);
 for(let k=0;k<46;k++){const z0=z00+k*.5,z1=z0+.5;if(z0>BOARDS)break;const a=proj(st,X0,0,z0),b=proj(st,X1,0,z1);if(hash(k,5)>.55)strips.rect(a[0],b[1],b[0]-a[0],a[1]-b[1]);seams.moveTo(a[0],a[1]);seams.lineTo(proj(st,X1,0,z0)[0],a[1]);
  for(let x=Math.floor(X0/2.4)*2.4+hash(k,9)*2.4;x<X1;x+=2.4){const p=proj(st,x,0,z0),q=proj(st,x,0,z1);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,FA,lines,0,40);
 s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx,!!o.flags);
 if(st.cx<-3){goalNet(s,st,FA,bulge,bv,by);o.keeper?.();goalPosts(s,st,FA);}
}
// ---- UP-COURT view (chapters 3–4): low, from behind Julio, looking up the court toward halfway (the far wall ≈ the far end) ----
const FC:Frame={ox:0,oz:0,rot:Math.PI/2-.3},WALLC=37;
function upCourt(s:Sheet,st:Stage,t:number,cheer=0,flash=0){
 const wall=proj(st,0,0,WALLC)[1],kw=kAt(st,WALLC),board=.95*kw,span=6000;
 const floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.45);s.fill(R,floor,.3);
 const strips=new Path2D(),seams=new Path2D(),near=st.cz+.35;
 for(let i=-60;i<60;i++){const X0=st.cx+i*.5,X1=X0+.5;if(hash(i+60,5)>.55)strips.addPath(polyPath([proj(st,X0,0,near),proj(st,X1,0,near),proj(st,X1,0,WALLC),proj(st,X0,0,WALLC)],true));
  const a=proj(st,X0,0,near),b=proj(st,X0,0,WALLC);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);
  for(let z=near+hash(i+60,9)*2.2;z<WALLC;z+=2.2){const p=proj(st,X0,0,z),q=proj(st,X1,0,z);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,FC,lines,4,38);s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-16;i<16;i++){const x0=proj(st,st.cx+i*2.4+.3,0,WALLC)[0],x1=proj(st,st.cx+i*2.4+1.9,0,WALLC)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
}

// ================= the step-in steal (local frame FA/FC: u out from Julio's goal line) =================
/** CLOSE: goal side of the pivot, low, the left forearm resting on his back, eyes past him on the passer */
const CLOSE=(t:number)=>{const b=Math.sin(t*5.2)*.5+.5;return posed({lHipF:28,rHipF:20,lKnee:42+5*b,rKnee:36+5*b,lAnk:-8,rAnk:-6,lHipA:10,rHipA:12,lean:22,pitch:4,neckP:-12,neckY:-14,
 lShF:62,lShA:14,lElb:58,rShF:10,rShA:30,rElb:44,air:.012*b});};
/** READY: the fixo's ready stance (used on the cards) */
const READY=posed({lHipF:26,rHipF:24,lKnee:40,rKnee:38,lAnk:-8,rAnk:-8,lHipA:12,rHipA:12,lHipR:10,rHipR:10,lean:20,pitch:4,neckP:-10,lShA:26,rShA:26,lShF:10,rShF:10,lElb:44,rElb:44});
/** the pivot: back to goal, showing for the ball — low, the left arm back feeling for the defender, the right arm out asking */
const SHOW=(t:number)=>{const b=Math.sin(t*4.6)*.5+.5;return posed({lHipF:22,rHipF:26,lKnee:34+5*b,rKnee:38+5*b,lHipA:12,rHipA:12,lean:16,neckP:-4,neckY:10*Math.sin(t*1.1),
 lShF:-40,lShA:32,lElb:30,rShF:46,rShA:36,rElb:24,rHand:1});};
const PV:[number,number]=[8.3,.4];// the pivot (paper bib), back to Julio's goal
const P0:[number,number]=[15.4,-4.3];// the passer (paper bib), ball at his feet
const J0:[number,number]=[7.45,.5];// Julio, goal side, an arm's length behind the pivot
const DIRP=(()=>{const d=[P0[0]-PV[0],P0[1]-PV[1]],l=Math.hypot(d[0],d[1]);return[d[0]/l,d[1]/l] as Pt;})();
const PT:[number,number]=[PV[0]+DIRP[0]*.55,PV[1]+DIRP[1]*.55];// where the pass is aimed: the pivot's front foot
const YAW_P=yawTo(PT[0]-P0[0],PT[1]-P0[1]);
const YAW_V=yawTo(DIRP[0],DIRP[1]);// the pivot faces the passer
/** where the ball sits at the passer's right-foot contact (local) */
const B0:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),{height:1.8},{yaw:YAW_P}),toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[P0[0]+toe[0]+d[0]/l*.08,P0[1]-(toe[2]+d[1]/l*.08)];})();
const BP:[number,number]=[B0[0]+.3,B0[1]-.5];
/** the steal point: on the pass line, 1.6 m in front of the pivot's foot — he gets there first */
const IP:[number,number]=(()=>{const L=Math.hypot(B0[0]-PT[0],B0[1]-PT[1]);return L2(PT,B0,1.6/L) as [number,number];})();
const YAW_K=yawTo(P0[0]-IP[0],P0[1]-IP[1]);// he meets the ball facing the passer
/** where Julio stands so his right toe, at the lunge's full reach, meets the ball at IP */
const KSTOP:[number,number]=(()=>{const sk=solve(lunge(.6,{side:'r'}),BUILD,{yaw:YAW_K}),toe=sk.rToe;return[IP[0]-toe[0],IP[1]+toe[2]];})();
/** the step round: a curve past the pivot's ball-side shoulder */
const CTRL:[number,number]=[PV[0]+.3,PV[1]-1.9];
const stepPath=(w:number):[number,number]=>{const a=(1-w)*(1-w),b=2*w*(1-w),c=w*w;return[a*J0[0]+b*CTRL[0]+c*KSTOP[0],a*J0[1]+b*CTRL[1]+c*KSTOP[1]];};
const YAW_D=yawTo(1,.75);// the attack: up the court, away from the passer
const CARRY=2.6;// m/s
type StealT={close:number;plant:number;pass:number;step0:number;step1:number;steal:number;go:number};
type Steal={julio:LGen;passer:LGen;pivot:LGen;ball:(t:number)=>BallL};
function makeSteal(T:StealT):Steal{
 const lung0=T.steal-.34;
 const carryD=(t:number)=>{const x=Math.max(0,t-T.go);return CARRY*(x-.2*(1-Math.exp(-x/.2)));};
 const face0=yawTo(PV[0]-J0[0],PV[1]-J0[1]);
 const julio:LGen=t=>{
  if(t<T.step0)return{pose:CLOSE(t),yaw:face0,u:J0[0],v:J0[1]};
  if(t<T.step1){const w=sm(T.step0,T.step1,t,easeIO),[u,v]=stepPath(w),[u2,v2]=stepPath(Math.min(1,w+.05)),mv=yawTo(u2-u,v2-v),ph=(t-T.step0)*runCadence(.6)*1.15,run=runCycle(ph,{speed:.6,stride:.85});
   const pose=blendPose(blendPose(CLOSE(t),run,sm(T.step0,T.step0+.18,t,easeIO)),READY,sm(T.step1-.22,T.step1,t,easeIO));
   const yaw=lerp(lerp(face0,mv,sm(T.step0,T.step0+.15,t)),YAW_K,sm(T.step1-.3,T.step1,t,easeIO));
   return{pose,yaw,u,v};}
  if(t<T.go){const lu=key(t,[[lung0,.02],[T.steal,.6],[T.go,.9]],linear),pose=t<lung0?READY:blendPose(READY,lunge(lu,{side:'r'}),sm(lung0,lung0+.12,t,easeIO));
   return{pose,yaw:YAW_K,u:KSTOP[0],v:KSTOP[1]};}
  const d=carryD(t),ph=(t-T.go)*runCadence(.6)*1.15,w=sm(T.go,T.go+.35,t,easeIO);
  return{pose:blendPose(lunge(.9,{side:'r'}),dribble(ph,{foot:'r',speed:.6}),w),yaw:lerp(YAW_K,YAW_D,w),u:KSTOP[0]+Math.cos(YAW_D)*d,v:KSTOP[1]+Math.sin(YAW_D)*d};};
 const passer:LGen=t=>{
  const sT=key(t,[[T.plant,0],[T.pass,STRIKE_CONTACT],[T.pass+.6,.84],[T.pass+1.1,.97]],linear);
  if(t<T.plant){const p=blendPose(stand(),posed({lHipF:18,rHipF:24,lKnee:30,rKnee:36,lean:14,neckP:-4,neckY:18*Math.sin(t*.9),lShA:22,rShA:22,lElb:40,rElb:40}),.8);return{pose:p,yaw:YAW_P,u:P0[0],v:P0[1]};}
  const late=sm(T.steal+.15,T.steal+.6,t,easeIO);
  if(late<=0)return{pose:strike(sT,{foot:'r',power:.45}),yaw:YAW_P,u:P0[0],v:P0[1]};
  const TG:[number,number]=[KSTOP[0]+Math.cos(YAW_D)*3.2,KSTOP[1]+Math.sin(YAW_D)*3.2],dd=Math.hypot(TG[0]-P0[0],TG[1]-P0[1]),cy=yawTo(TG[0]-P0[0],TG[1]-P0[1]);
  const ph=(t-T.steal)*runCadence(.55),x=Math.min(dd-2.2,Math.max(0,t-T.steal-.5)*1.7);
  return{pose:blendPose(strike(sT,{foot:'r',power:.45}),runCycle(ph,{speed:.55}),late),yaw:lerp(YAW_P,cy,late),u:P0[0]+Math.cos(cy)*x,v:P0[1]+Math.sin(cy)*x};};
 const pivot:LGen=t=>{
  // shows for the ball; leans to receive as it comes; is beaten to it; turns to watch Julio go, hands on hips
  const reach=posed({lHipF:30,rHipF:40,lKnee:40,rKnee:44,lHipA:10,rHipA:8,lean:22,neckP:14,lShF:-30,lShA:40,lElb:30,rShF:30,rShA:40,rElb:30});
  const beaten=posed({lHipF:10,rHipF:10,lKnee:14,rKnee:14,lean:12,neckP:10,neckY:-30,lShA:40,rShA:40,lElb:100,rElb:100,lShR:40,rShR:40});
  let pose=blendPose(SHOW(t),reach,sm(T.pass+.1,T.pass+.6,t,easeIO));
  pose=blendPose(pose,beaten,sm(T.steal+.25,T.steal+.9,t,easeIO));
  const turn=sm(T.steal+.2,T.go+.9,t,easeIO),yaw=lerp(YAW_V,YAW_V+1.9,turn),fwd=.25*sm(T.pass+.1,T.pass+.8,t,easeIO);
  return{pose,yaw,u:PV[0]+DIRP[0]*fwd,v:PV[1]+DIRP[1]*fwd};};
 const toeAt=(t:number):[number,number]=>{const{sk,J}=jointsL(julio(t)),toe=J(sk.rToe),heel=J(sk.rHeel),d=[toe[0]-heel[0],toe[2]-heel[2]],l=Math.hypot(d[0],d[1])||1;return[toe[0]+d[0]/l*.06,toe[2]+d[1]/l*.06];};
 let TS:[number,number]|null=null;
 const ballF=(t:number):BallL=>{
  if(t<T.pass){const w=sm(T.plant,T.pass-.1,t,easeIO);return{u:lerp(BP[0],B0[0],w),y:BALL_R,v:lerp(BP[1],B0[1],w),moving:false,spin:w*2};}
  if(t<T.steal){const w=sm(T.pass,T.steal,t,linear);return{u:lerp(B0[0],IP[0],w),y:BALL_R,v:lerp(B0[1],IP[1],w),moving:true,spin:w*8};}
  if(!TS)TS=toeAt(T.go);
  if(t<T.go){const w=sm(T.steal,T.steal+.12,t,easeOut),[tu,tv]=toeAt(t);return{u:lerp(IP[0],tu,w),y:BALL_R,v:lerp(IP[1],tv,w),moving:false,spin:8};}
  const k=julio(t),ph=(t-T.go)*runCadence(.6)*1.15,ahead=.52+.14*Math.sin(ph*TAU),w=sm(T.go,T.go+.3,t,easeIO),au=k.u+Math.cos(YAW_D)*ahead,av=k.v+Math.sin(YAW_D)*ahead;
  return{u:lerp(TS[0],au,w),y:BALL_R,v:lerp(TS[1],av,w),moving:true,spin:8+(t-T.go)*14};};
 return{julio,passer,pivot,ball:ballF};
}

// ================= chapter 1 — LIVE: the 2004 World Cup semi-final in Taipei. Only confirmed things: the arena, the two teams lined up for
// the shoot-out, the scoreboard at 2–2, then (a whip pan, a cut in time) Julio scoring his kick, then (a cut in time) the 5–4 shoot-out
// result and Spain celebrating. No open-play goal, pass or tackle of the match is staged. =================
const C1={taipei:A(0,'Taipei'),wc:A(0,'Futsal'),vs:A(0,'Spain against'),julio:A(0,'Julio is'),fixo:A(0,'fixo'),two:A(0,'two all'),pens:A(0,'penalties'),
 steps:A(0,'Julio steps'),scores:A(0,'scores'),win:A(0,'Spain win'),shoot:A(0,'shootout'),end:AUTH[0].seconds};
/** the whip pans (cuts in time): the centre circle → the penalty mark; the penalty mark → the end of the shoot-out */
const W0=C1.pens-.1,W1=W0+.26,WM=(W0+W1)/2,V0=C1.win-.05,V1=V0+.26,VM=(V0+V1)/2;
/** KT: his boot meets the ball (on "scores"); INN: the ball is in the net */
const KT=C1.scores-.05,INN=KT+.3;
/** the two lines in the centre circle for the shoot-out (local u from the goal line; halfway = 20); Julio is second in Spain's line */
const LINE_ESP:[number,number][]=[[19.6,-1.3],[20.8,-1.4],[22.0,-1.2],[23.2,-1.4]];
const LINE_BRA:[number,number][]=[[19.9,1.3],[21.1,1.4],[22.3,1.2],[23.5,1.4]];
const JL=1;// Julio's place in the line
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** the 6 m penalty mark and where the kick goes (inferred: low, to the keeper's right; the keeper goes the other way) */
const SPOT:[number,number]=[6,0],PTG:V3=[-.12,.34,-1.0];
const YAW_KK=yawTo(PTG[0]-SPOT[0],PTG[2]-SPOT[1]);
/** where he stands at contact so the right boot meets the ball on the spot */
const EPOS:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD,{yaw:YAW_KK}),toe=sk.rToe;return[SPOT[0]-toe[0]-Math.cos(YAW_KK)*.1,SPOT[1]+toe[2]-Math.sin(YAW_KK)*.1];})();
/** a short futsal run-up from behind and to his left */
const RUN0:[number,number]=[EPOS[0]+2.0,EPOS[1]+.8];
/** after the kick he jogs back toward the centre circle, one fist up */
const BACK:[number,number]=[10.6,-.9];
/** the end: Spain's players run together at KNOT (an unnamed team-mate — the last kick — already there) */
const KNOT:[number,number]=[11.4,-.6];
const kickT=(T:number)=>key(T,[[KT-1,0],[KT-.42,.22],[KT,STRIKE_CONTACT],[KT+.5,.82],[KT+1,.95]],linear);
const liveJ:LGen=T=>{
 if(T<WM)return{pose:idle(T,0),yaw:Math.PI,u:LINE_ESP[JL][0],v:LINE_ESP[JL][1]};
 if(T<VM){
  if(T<KT-1){const b=Math.sin((T-WM)*3)*.5+.5;return{pose:blendPose(stand(),posed({lHipF:10,rHipF:14,lKnee:18,rKnee:22,lean:14,neckP:18,lShA:12,rShA:12,lElb:24,rElb:24}),.5+.3*b),yaw:YAW_KK,u:RUN0[0],v:RUN0[1]};}
  if(T<KT+.9){const w=sm(KT-1,KT-.42,T,easeIn);return{pose:strike(kickT(T),{foot:'r'}),yaw:YAW_KK,u:lerp(RUN0[0],EPOS[0],w),v:lerp(RUN0[1],EPOS[1],w)};}
  const go=sm(KT+.9,KT+2.6,T,easeOut),yw=lerp(YAW_KK,yawTo(BACK[0]-EPOS[0],BACK[1]-EPOS[1]),sm(KT+.9,KT+1.2,T,easeIO));
  return{pose:blendPose(strike(.95,{foot:'r'}),celebrate((T-KT-.9)*1.2,{kind:'run'}),sm(KT+.9,KT+1.15,T,easeIO)),yaw:yw,u:lerp(EPOS[0],BACK[0],go),v:lerp(EPOS[1],BACK[1],go)};}
 // the end of the shoot-out: he sprints in from the line and jumps with his team-mates
 const a=LINE_ESP[JL],go=sm(VM,VM+1.6,T,easeOut),tgt:[number,number]=[KNOT[0]+1,KNOT[1]-.9],u=lerp(a[0],tgt[0],go),v=lerp(a[1],tgt[1],go);
 return{pose:go<.94?celebrate((T-VM)*1.25,{kind:'run'}):celebrate((T-VM)*1.1+.2,{kind:'arms'}),yaw:go<.94?yawTo(tgt[0]-a[0],tgt[1]-a[1]):yawTo(KNOT[0]-u,KNOT[1]-v)+.4*Math.sin((T-VM)*1.3),u,v};};
/** Spain's other players (0, 2, 3): wait in the line; at the end, run to the knot; the unnamed last kicker (3) is already there, arms up */
const liveEsp=(i:number):LGen=>T=>{const a=LINE_ESP[i];
 if(T<VM)return{pose:idle(T,i*.31+.2),yaw:Math.PI,u:a[0],v:a[1]};
 if(i===3)return{pose:celebrate((T-VM)*1.1+.5,{kind:'arms'}),yaw:.6,u:KNOT[0],v:KNOT[1]};
 const go=sm(VM,VM+1.5+.2*i,T,easeOut),off:[number,number]=i===0?[1.1,.8]:[.9,-.1],tgt:[number,number]=[KNOT[0]+off[0],KNOT[1]+off[1]],u=lerp(a[0],tgt[0],go),v=lerp(a[1],tgt[1],go);
 return{pose:go<.94?celebrate((T-VM)*1.25+i*.3,{kind:'run'}):celebrate((T-VM)*1.1+i*.4,{kind:'arms'}),yaw:go<.94?yawTo(tgt[0]-a[0],tgt[1]-a[1]):yawTo(KNOT[0]-u,KNOT[1]-v),u,v};};
/** Brazil's players: wait in the line; at the end, hands on knees */
const SAD=posed({lHipF:40,rHipF:40,lKnee:40,rKnee:40,lean:52,neckP:30,lShF:40,rShF:40,lShA:10,rShA:10,lElb:20,rElb:20});
const liveBra=(i:number):LGen=>T=>{const a=LINE_BRA[i],d=sm(VM+.2,VM+.9,T,easeIO);return{pose:blendPose(idle(T,.5+i*.29),SAD,d),yaw:Math.PI+d*(.3-i*.2),u:a[0],v:a[1]};};
/** Brazil's keeper: set on his line; dives to HIS left (the far side) as the ball goes to his right */
const liveGK:LGen=T=>{
 if(T>=VM)return{pose:SAD,yaw:.3,u:1.2,v:.4};
 const d=sm(KT-.06,KT+.45,T,linear);let pose=keeperSet(T*1.3);if(d>0)pose=keeperDive(Math.min(.95,.3+d*.65),{side:'l'});
 const lie=sm(INN+.5,INN+1.3,T,easeIO);if(lie>0)pose=blendPose(pose,keeperDive(.95,{side:'l'}),lie);return{pose,yaw:0,u:.55,v:.9*sm(KT-.06,KT+.4,T,easeOut)};};
/** the kick: on the spot until contact, then low and hard to the keeper's right, then drops in the net */
const liveBall=(T:number):BallL=>{
 if(T<KT)return{u:SPOT[0],y:BALL_R,v:SPOT[1],moving:false,spin:0};
 if(T<INN){const u=sm(KT,INN,T,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M=[lerp(SPOT[0],PTG[0],.5),.4,lerp(SPOT[1],PTG[2],.5)];
  return{u:a*SPOT[0]+b*M[0]+c*PTG[0],y:a*BALL_R+b*M[1]+c*PTG[1],v:a*SPOT[1]+b*M[2]+c*PTG[2],moving:true,fly:true,spin:20+u*30};}
 const d=sm(INN+.05,INN+.35,T,easeIn),bo=Math.abs(Math.sin(sm(INN+.35,INN+1.1,T)*Math.PI*2))*.1*(1-sm(INN+.35,INN+1.1,T));
 return{u:-.62,y:lerp(PTG[1],BALL_R,d)+bo,v:PTG[2]-.05,moving:false,spin:50};};
const liveCam=(T:number)=>({x:key(T,mono([[0,2.8],[C1.vs,2.2],[C1.julio,.8],[C1.fixo,.7],[C1.two,1.6],[W0,1.8],[W1,-16.4],[KT-.3,-16.7],[KT+.9,-16.4],[V0,-16],[V1,-7.2],[C1.end,-7]]),easeInOutSine),
 zoom:key(T,mono([[0,.58],[C1.wc,.6],[C1.julio+.2,.95],[C1.fixo,1.02],[C1.two,.74],[W0,.74],[W1,.8],[KT-.3,.84],[KT+1,.84],[V0,.84],[V1,.9],[C1.end,.96]]),easeInOutSine),
 y:key(T,mono([[0,1040],[C1.julio+.2,990],[C1.fixo,975],[C1.two,1020],[W1,990],[KT+1,1000],[V1,990],[C1.end,980]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'1':[2,5],'2':[0,2,3,4,6],'4':[1,2,3,5],'5':[0,1,3,5,6]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** the scoreboard above the boards: Spain (red tab) 2–2 Brazil (yellow tab); the shoot-out row below (Spain–Brazil); `ring` = a yellow
 * highlight round it on "two all" */
function scoreboard(s:Sheet,st:Stage,camX:number,pens:string,ring:number){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=2.5*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=1.8*kw*.62,y=top-H+1.8*kw*.19;
 const tab=(ink:string,x:number)=>{const p=new Path2D();p.rect(x,top-H+kw*.1,W*.16,kw*.13);s.fill(ink,p);};tab(R,cx-W*.38);
 const yt=new Path2D();yt.rect(cx+W*.22,top-H+kw*.1,W*.16,kw*.13);s.knockout(yt);s.fill(Y,yt);
 digit(lit,'2',cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,'2',cx+W*.3-h*.55,y,h);
 const ph=h*.42,py=top-kw*.62;digit(lit,pens[0],cx-W*.12-ph*.55,py,ph);digit(lit,pens[2],cx+W*.12,py,ph);lit.rect(cx-ph*.12,py+ph*.44,ph*.24,ph*.12);
 s.fill(Y,lit);
 if(ring>.02){const m=16*ring+6,q=handCut([[cx-W/2-m,top-H-m],[cx+W/2+m,top-H-m],[cx+W/2+m,top+m],[cx-W/2-m,top+m]],133,4,60);const rp=ribbon([...q,q[0]],10,{seed:134,close:true,wobble:1});s.knockout(rp);s.fill(Y,rp,ring);}
}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const phase=T<WM?0:T<VM?1:2,goal=phase===1&&T>=INN;
 courtSide(s,st,T,{flags:true,cheer:phase===0?.12+.25*pulse(T,C1.wc,1.4):phase===1?(goal?.8:.05):.95,flash:pulse(T,C1.taipei,1.3)+(goal?pulse(T,INN,1.2):0)+(phase===2?pulse(T,VM,1.3):0),
  bulge:phase===1?.55*sm(INN-.1,INN,T)*(1-.6*sm(INN+.3,INN+1.2,T))+.1*settle(T,INN,{amp:1,freq:3,decay:3}):0,bv:PTG[2],by:PTG[1],
  keeper:()=>{if(phase>0)athlete(s,st,FA,liveGK,T,BRA_GK,{detail:phase===1?'mid':'low'});}});
 scoreboard(s,st,c.x,phase===0?'1-2':phase===1?(T<INN+.25?'1-2':'2-2'):'5-4',pulse(T,C1.two,1.6)+(phase===2?pulse(T,C1.win+.1,1.4):0));
 const items:Item[]=[];
 LINE_BRA.forEach((_,i)=>{const g=liveBra(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,BRA(i),{detail:'low'})});});
 [0,2,3].forEach(i=>{const g=liveEsp(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,ESP(i),{detail:phase===2?'mid':'low'})});});
 const j=liveJ(T),[JX,JZ]=toStage(FA,j.u,j.v),kick=phase===1&&T>KT-.2&&T<KT+.25;
 items.push({z:JZ-.02,draw:()=>athlete(s,st,FA,liveJ,T,JULIO,{detail:'mid',smear:kick?.1:0})});
 const b=liveBall(T);
 if(phase===1)items.push({z:T<KT?toStage(FA,b.u,b.v)[1]+.01:depth(FA,b),draw:()=>{drawBallL(s,st,FA,b,liveBall(T-.06),18,9);if(T>=KT&&T<KT+.3){const p=fp(st,FA,SPOT[0],SPOT[1],.2);sparkBurst(s,Y,p[0],p[1],100,{n:9,seed:19,g:easeOut(sm(KT,KT+.22,T))});}}});
 if(phase===0){
  // "Spain against Brazil": a red dashed line under Spain's line, a yellow (navy-cased) one under Brazil's
  const r1=sm(C1.vs,C1.vs+.5,T,easeOut)*(1-sm(C1.julio-.2,C1.julio+.2,T)),r2=sm(C1.vs+.6,C1.vs+1.1,T,easeOut)*(1-sm(C1.julio-.2,C1.julio+.2,T));
  if(r1>.02)items.push({z:JZ+3,draw:()=>dashed(s,R,[fp(st,FA,19,-2.2),fp(st,FA,21.4,-2.3),fp(st,FA,23.8,-2.2)],16,41,{dash:46,progress:r1})});
  if(r2>.02)items.push({z:JZ+4,draw:()=>cased(s,[fp(st,FA,19.3,2.2),fp(st,FA,21.7,2.3),fp(st,FA,24.1,2.2)],11,42,{dash:46,progress:r2})});
  // "Julio": a dashed ring under him; "fixo": the ring pulses and a dashed arrow points back to the goal he guards
  const g=easeOutBack(sm(C1.julio,C1.julio+.35,T))*(1-sm(W0-.3,W0,T));if(g>.02)items.push({z:JZ+.9,draw:()=>{const gg=g*(1+.15*pulse(T,C1.fixo,.8));floorDashRing(s,st,K,JX,JZ,1.05,22,50,gg);floorDashRing(s,st,R,JX,JZ,1.05,14,51,gg);}});
  const fx=sm(C1.fixo,C1.fixo+.6,T,easeOut)*(1-sm(C1.two-.2,C1.two+.2,T));
  if(fx>.02)items.push({z:JZ-1,draw:()=>{const pts=[fp(st,FA,j.u-1.3,j.v-.2),fp(st,FA,j.u-3.2,j.v-.5),fp(st,FA,j.u-5.2,j.v-.3)];cased(s,pts,16,52,{dash:44,progress:fx});if(fx>.9)casedHead(s,pts,42,53);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // the shot line (dashed yellow) as the ball goes; a burst in the net
 if(phase===1&&T>KT){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=liveBall(lerp(KT,Math.min(T,INN),k/14));pts.push(fp(st,FA,q.u,q.v,q.y));}cased(s,pts,10,58,{dash:36});}
 if(phase===1&&T>=INN&&T<INN+1.2){const p=fp(st,FA,PTG[0]-.2,PTG[2],PTG[1]);sparkBurst(s,Y,p[0],p[1],140,{n:12,seed:59,g:easeOut(sm(INN,INN+.3,T))*(1-sm(INN+.8,INN+1.2,T))});}
 // the end: a yellow burst over the knot of red shirts
 if(phase===2){const g=sm(VM+1.2,VM+1.6,T,easeOut)*(1-sm(VM+3.2,VM+4,T));if(g>.02){const p=fp(st,FA,KNOT[0]+.6,KNOT[1]-.2,2.6);sparkBurst(s,Y,p[0],p[1],180,{n:12,seed:61,g});}}
 // the whip pans: yellow speed lines sweep across the frame (cuts in time)
 for(const[a0,a1] of[[W0,W1],[V0,V1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI),c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FA,liveJ(tt),.14));},still:C1.fixo+.3};

// ================= chapter 2 — HOW HE DOES IT (demonstration, real time, side-on): close, pass, step in front, steal, attack =================
const C2={fixo:A(1,'fixo can'),how:A(1,'This is'),close:A(1,'stays'),behind:A(1,'behind'),comes:A(1,'The pass'),steps:A(1,'steps'),right:A(1,'right'),steals:A(1,'steals'),att:A(1,'attacks'),end:AUTH[1].seconds};
const STEAL2=C2.right+.45;
const T2:StealT={close:C2.close,plant:C2.steps-.75,pass:C2.steps-.2,step0:C2.steps+.05,step1:STEAL2-.28,steal:STEAL2,go:Math.max(STEAL2+.4,C2.steals+.2)};
const steal2=makeSteal(T2);
const st2:Stage={F:2600,eye:3.4,cx:-8.6,cz:-3};
const S2=(u:number,v:number,y=0)=>fp(st2,FA,u,v,y);
const END2=steal2.julio(C2.end),MID2=steal2.julio(T2.go+.7);
const CAM2:Key[]=[
 frameOn(0,[S2(J0[0],J0[1],2),S2(P0[0],P0[1],0),S2(P0[0],P0[1],2),S2(J0[0]-1,J0[1],0)],300,.9),
 frameOn(C2.close,[S2(J0[0]-.6,J0[1],2.1),S2(PV[0]+.6,PV[1],2.1),S2(J0[0]-.6,J0[1],0),S2(PV[0]+.6,PV[1],0)],300,1.35),
 frameOn(C2.behind+.3,[S2(J0[0]-.6,J0[1],2.1),S2(PV[0]+.6,PV[1],2.1),S2(J0[0]-.6,J0[1],0),S2(PV[0]+.6,PV[1],0)],280,1.4),
 frameOn(C2.comes,[S2(J0[0],J0[1],2),S2(P0[0],P0[1],2),S2(P0[0],P0[1],0),S2(J0[0],J0[1],0)],230),
 frameOn(C2.steps+.2,[S2(J0[0],J0[1],2),S2(B0[0],B0[1],0),S2(KSTOP[0],KSTOP[1],2),S2(CTRL[0],CTRL[1],0)],240),
 frameOn(STEAL2+.15,[S2(KSTOP[0],KSTOP[1],2.1),S2(KSTOP[0],KSTOP[1],0),S2(IP[0],IP[1],0),S2(PV[0],PV[1],2)],320,1.25),
 frameOn(T2.go+.4,[S2(KSTOP[0],KSTOP[1],2),S2(MID2.u,MID2.v,0),S2(MID2.u+2.4,MID2.v+1.6,1)],240),
 frameOn(C2.end,[S2(END2.u-1.5,END2.v,2),S2(END2.u,END2.v,0),S2(END2.u+2.4,END2.v+1.6,2)],260,1.2),
];
/** the diagrams shared by the demonstration views: the "close" ring round the pair, the pass line to the pivot's feet, the step arrow round
 * him, the steal ring, the attack arrow */
function stealDiagrams(s:Sheet,st:Stage,fr:Frame,S:Steal,t:number,c:{close:number;pass:number;step:number;moment:number;steal:number;go?:number},scale=1){
 const k=S.julio(t);
 // "close": one dashed red ring round Julio and the pivot together (an arm's length apart)
 const cl=easeOutBack(sm(c.close,c.close+.4,t))*(1-sm(c.step,c.step+.3,t));
 if(cl>.02){const m=L2(J0,PV,.5),[X,Z]=toStage(fr,m[0],m[1]),q=floorRing(st,X,Z,1.05*cl,26,.8*cl),p=ribbon([...q,q[0]],15*scale,{seed:401,close:true,wobble:1,gaps:dashGaps(q,15*scale*3.4)});s.knockout(p);s.fill(R,p,1);}
 // "the pass comes": the pass line (dashed yellow) from the ball to the pivot's front foot, and a yellow ring at his feet
 const pl=sm(c.pass-.1,c.pass+.35,t,easeOut)*(1-sm(c.steal+.3,c.steal+.8,t));
 if(pl>.02){const pts=[fp(st,fr,B0[0],B0[1]),fp(st,fr,lerp(B0[0],PT[0],.5),lerp(B0[1],PT[1],.5)),fp(st,fr,PT[0]+DIRP[0]*.35,PT[1]+DIRP[1]*.35)];cased(s,pts,14*scale,404,{dash:42*scale,progress:pl});if(pl>.9)casedHead(s,pts,38*scale,405);
  const[X,Z]=toStage(fr,PT[0],PT[1]),g=easeOutBack(sm(c.pass+.2,c.pass+.5,t))*(1-sm(c.step+.2,c.step+.6,t));if(g>.02){floorDashRing(s,st,K,X,Z,.5,22*scale,406,g);floorDashRing(s,st,Y,X,Z,.5,13*scale,407,g);}}
 // "steps in front": a red arrow on the floor round the pivot's shoulder, from where he stood to where he meets the ball
 const sp=sm(c.step,c.step+.5,t,easeOut)*(1-sm(c.steal+.4,c.steal+.9,t));
 if(sp>.02){const pts:Pt[]=[];for(let i=0;i<=10;i++){const[u,v]=stepPath(i/10);pts.push(fp(st,fr,u,v));}redArrow(s,pts,15*scale,408,sp);}
 // "the right moment": a red dashed ring on the pass line where he gets to the ball first
 const rm=easeOutBack(sm(c.moment,c.moment+.35,t))*(1-sm(c.steal+.5,c.steal+1,t));
 if(rm>.02){const[X,Z]=toStage(fr,IP[0],IP[1]);floorDashRing(s,st,K,X,Z,.6,24*scale,409,rm);floorDashRing(s,st,R,X,Z,.6,15*scale,410,rm);}
 // "attacks": a yellow arrow ahead of him up the court
 if(c.go!==undefined){const ar=sm(c.go,c.go+.5,t,easeOut);if(ar>.02){const pts=[fp(st,fr,k.u+Math.cos(YAW_D)*.9,k.v+Math.sin(YAW_D)*.9),fp(st,fr,k.u+Math.cos(YAW_D)*2.4,k.v+Math.sin(YAW_D)*2.4),fp(st,fr,k.u+Math.cos(YAW_D)*3.9,k.v+Math.sin(YAW_D)*3.9)];cased(s,pts,15*scale,411,{dash:46*scale,progress:ar});if(ar>.9)casedHead(s,pts,42*scale,412);}}
}
/** the steal itself: a spark and a red ring at the ball on the word */
function stealFlash(s:Sheet,st:Stage,fr:Frame,t:number,at:number,r=120){if(t<at-.02||t>at+1)return;const p=fp(st,fr,IP[0],IP[1],BALL_R),g=easeOut(sm(at,at+.25,t))*(1-sm(at+.6,at+1,t));
 sparkBurst(s,Y,p[0],p[1],r,{n:10,seed:420,g});s.fill(R,ribbon(blob(p[0],p[1],r*.55*g+4,r*.4*g+3,421,{n:20}),8,{seed:422,close:true,wobble:1}),g);}
function drawSteal(s:Sheet,st:Stage,fr:Frame,S:Steal,t:number,detail:'mid'|'high',smearK:number){
 const k=S.julio(t),b=S.ball(t),bp=S.ball(t-.08),dK=depth(fr,k);
 const items:Item[]=[
  {z:depth(fr,S.passer(t)),draw:()=>athlete(s,st,fr,S.passer,t,DEMO(0),{detail:'mid'})},
  {z:depth(fr,S.pivot(t)),draw:()=>athlete(s,st,fr,S.pivot,t,DEMO(1),{detail})},
  {z:dK,draw:()=>athlete(s,st,fr,S.julio,t,JULIO_TR,{detail,smear:smearK})},
  {z:depth(fr,b)+(Math.abs(depth(fr,b)-dK)<.6?-.3:0),draw:()=>{drawBallL(s,st,fr,b,bp,211,10);}},
 ];
 items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2;
  camPath(s,t,CAM2);
  courtSide(s,st,tt,{cheer:tt>T2.steal?.5*(1-sm(T2.steal+1.5,T2.steal+3,tt)):0,flash:pulse(tt,T2.steal,1)});
  stealDiagrams(s,st,FA,steal2,tt,{close:C2.close,pass:T2.pass,step:T2.step0,moment:C2.right,steal:T2.steal,go:C2.att});
  const smear=(tt>T2.step0&&tt<T2.step1)?.12:(tt>T2.steal-.2&&tt<T2.steal+.15)?.14:0;
  drawSteal(s,st,FA,steal2,tt,'high',smear);
  stealFlash(s,st,FA,tt,T2.steal,130);
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,FA,steal2.julio(tt),.13));},
 still:C2.behind+.6,
};

// ================= chapter 3 — WATCH AGAIN (slow-motion replay, reverse angle: low, from behind him looking up the court) =================
const C3={watch:A(2,'Watch'),slow:A(2,'slowly'),close:A(2,'Stay'),pass:A(2,'watch the pass'),step:A(2,'step in'),end:AUTH[2].seconds};
/** the replay re-uses the chapter 2 sequence, slowed and keyed to the words (sequence time = seq(t)) */
const seq3=(t:number)=>key(t,mono([[0,T2.close-.6],[C3.close,T2.close],[C3.pass,T2.pass-.1],[C3.step,T2.step0+.05],[C3.step+1.3,T2.steal+.05],[C3.end,T2.go+.15]]),linear);
const J0C=toStage(FC,J0[0],J0[1]);
const st3:Stage={F:1500,eye:1.2,cx:J0C[0]+.9,cz:J0C[1]-3.6};
const S3=(u:number,v:number,y=0)=>fp(st3,FC,u,v,y);
const CAM3:Key[]=[
 frameOn(0,[S3(J0[0],J0[1],2),S3(PV[0],PV[1],2),S3(P0[0],P0[1],2),S3(J0[0],J0[1],0)],150,1.5),
 frameOn(C3.close,[S3(J0[0],J0[1],2.1),S3(PV[0],PV[1],2.1),S3(J0[0],J0[1],0),S3(PV[0]+.5,PV[1]-.6,0)],170,1.6),
 frameOn(C3.pass,[S3(J0[0],J0[1],2),S3(P0[0],P0[1],2),S3(B0[0],B0[1],0),S3(J0[0],J0[1],0)],150,1.5),
 frameOn(C3.step+.4,[S3(KSTOP[0],KSTOP[1],2),S3(KSTOP[0],KSTOP[1],0),S3(IP[0],IP[1],0),S3(PV[0],PV[1],2),S3(CTRL[0],CTRL[1],0)],170,1.6),
 frameOn(C3.end,[S3(KSTOP[0],KSTOP[1],2.1),S3(KSTOP[0],KSTOP[1],0),S3(IP[0],IP[1],0),S3(PV[0],PV[1],2)],190,1.6),
];
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,q=seq3(tt),hit=pulse(q,T2.steal,.4);
  camPath(s,t,CAM3,[5*hit*Math.sin(t*80),3*hit*Math.cos(t*77)]);
  upCourt(s,st,tt,q>T2.steal?.6:0,pulse(q,T2.steal,1));
  stealDiagrams(s,st,FC,steal2,q,{close:seq3(C3.close),pass:T2.pass,step:T2.step0,moment:seq3(C3.step)+.35,steal:T2.steal},.85);
  const smear=(q>T2.step0&&q<T2.step1)?.35:(q>T2.steal-.25&&q<T2.steal+.2)?.4:0;
  drawSteal(s,st,FC,steal2,q,'high',smear);
  stealFlash(s,st,FC,q,T2.steal,110);
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,FC,steal2.julio(seq3(tt)),.13));},
 still:C3.close+.4,
};

// ================= chapter 4 — YOUR TURN: he runs it again; three cards (close, step, steal); a tick =================
const C4={your:A(3,'Your'),step:A(3,'step in'),att:A(3,'your attacker'),moment:A(3,'right'),steal:A(3,'steal the'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T2.close-.4],[C4.step,T2.pass-.2],[C4.att,T2.step0],[C4.moment,T2.step1-.1],[C4.steal,T2.steal-.02],[C4.end,T2.go+.3]]),linear);
const st4:Stage={F:1500,eye:1.7,cx:J0C[0]+1,cz:J0C[1]-4.8};
type CardKind='close'|'step'|'steal';
const CARD_Y=770,CARD_W=175,CARDS:[number,number,CardKind][]=[[-420,C4.att,'close'],[0,C4.moment,'step'],[420,C4.steal,'steal']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,q=seq4(tt);
  camPath(s,t,[[0,-60,120,1.02],[C4.your+.4,0,330,.9],[C4.moment,0,330,.9],[C4.end,0,320,.92]]);
  upCourt(s,st,tt,q>T2.steal?.8*(1-sm(C4.end-1,C4.end,tt)):0,pulse(q,T2.steal,1));
  drawSteal(s,st,FC,steal2,q,'mid',(q>T2.step0&&q<T2.step1)?.15:0);
  stealFlash(s,st,FC,q,T2.steal,90);
  // the three cards rise on "Your turn"; each prints its step as it is said (close, step in front, steal)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+125;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+(kind==='close'?-20:kind==='step'?-20:-70),y:gy+20,height:330*(.9+.1*on),azimuth:kind==='steal'?-60:0,elevation:14,fov:18,at:[0,0,0]});
    const pose=kind==='close'?CLOSE(.3):kind==='step'?runCycle(.3,{speed:.7}):lunge(.6,{side:'r'});
    const csk=solve(pose,BUILD,{}),P=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    // close = a red dashed ring at arm's length in front of him (where the attacker stands); step = a red curved floor arrow; steal = the ball on his toe
    if(kind==='close'){const f=P([0,0,0]),c:Pt=[f[0]+78,f[1]-4],pts:Pt[]=[];for(let k=0;k<=18;k++){const a=k/18*TAU;pts.push([c[0]+Math.cos(a)*34,c[1]+Math.sin(a)*12]);}dashed(s,R,pts,8,84,{dash:20});const br=[[f[0]+18,f[1]-150],[f[0]+78,f[1]-150]] as Pt[];cased(s,br,6,85,{dash:14});}
    if(kind==='step'){const a=P([-1.1,.3,.1]),m=P([0,.3,.75]),b=P([1,.3,.1]);redArrow(s,[a,m,b],9,88);}
    drawAthlete(s,pose,fc,{...JULIO_TR,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    if(kind==='steal'){const tb:V3=[csk.rToe[0]+.06,BALL_R,csk.rToe[2]+.08],p0=P(tb),bR=BALL_R*(fc.scale?fc.scale(tb):100);ball(s,p0[0],p0[1],bR,81+i);s.fill(R,ribbon(blob(p0[0],p0[1],bR*1.9,bR*1.5,93,{n:18}),6,{seed:94,close:true,wobble:1}),1);}
    s.restore();});
   s.fill(K,frames);}
  // "steal the pass": a big tick (yellow over red, navy echo) stamps beside him
  const tick=easeOutBack(sm(C4.steal+.35,C4.steal+.7,tt));
  if(tick>.02){const k=steal2.julio(q),[,KZ]=toStage(FC,k.u,k.v),g=fp(st,FC,k.u,k.v),h=kAt(st,KZ)*1.8,c:Pt=[g[0]+h*.62,g[1]-h*.85],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.moment+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'garcia-mera-futsal-signature',format:'futsal',title:'Julio’s step-in steal',theme:'Step in front of your attacker at the right moment to steal the pass.',
 ageNote:'For players aged 7–12: the 2004 semi-final and Julio’s penalty are real; the steal is shown as a demonstration. Wait for the pass, then step in.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in along a dashed pass line and a red arrow cuts in front of it, stopping it in a red ring; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const roll=sm(0,.3,age,easeOut),bx=x+170*(1-roll);
  const ln=1-sm(.5,.9,age);if(ln>.02)dashed(s,Y,[[x+240,y+r*.6],[x+120,y+r*.6],[x,y+r*.6]],8,seed+3,{dash:26,cov:ln});
  const ar=sm(.12,.34,age,easeOut)*(1-sm(.8,1.1,age));if(ar>.02)redArrow(s,[[x-r*.4,y+r*2.2],[x-r*.2,y+r*1.3],[x,y+r*.9]],9,seed+6,ar);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:(1-roll)*6});
  const g=easeOutBack(sm(.25,.5,age))*(1-sm(.9,1.2,age));if(g>.02)s.fill(R,ribbon(blob(x,y,r*1.6*g,r*1.3*g,seed+4,{n:18}),8,{seed:seed+5,close:true,wobble:1}),1);
 },
};
export default film;
