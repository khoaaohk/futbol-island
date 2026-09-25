/** Kike Boned — "the clever interception": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHY THIS MOMENT: Kike's entry (lib/town/iconicPlays.json) is a signature (the fixo who reads the next pass and steps in to steal it), not
 * one match. No written source we could reach describes a single Kike interception in words, so the film follows the brief's honest
 * fallback: it opens on a REAL, documented final he played in and scored in, showing ONLY confirmed things (the arena, the two teams, Kike
 * as Spain's fixo, the celebration of his goal with the scoreboard at 1–0, the 2–1 final whistle and the trophy) — no goal, pass or tackle
 * of that match is staged — then says "This is how he does it" and shows the interception in a separate, labelled demonstration (training
 * shirts, no opponent named) that is never passed off as that match.
 *  1  LIVE (broadcast camera, main stand): FIFA Futsal World Cup final, 5 December 2004, 16:00, NTU Gymnasium (National Taiwan University
 *     Sports Center), Taipei, Spain 2–1 Italy. The teams at kick-off, Kike the deepest Spain player (the fixo, the last defender); whip pan
 *     (a cut in time, into the second half — the teams have changed ends) to the celebration of his goal (24', the first goal) with the
 *     scoreboard at 1–0; whip pan to the final whistle: 2–1, a team-mate lifts the cup, confetti.
 *  2  HOW HE DOES IT (a demonstration, real time, side-on; paper/navy training bibs for the attackers, no match claimed): he watches the
 *     passer, reads the next pass (a ghost line to the far player), steps into the gap early, meets the ball with his right foot and
 *     carries it forward.
 *  3  WATCH AGAIN (slow-motion replay of the demonstration, reverse angle: low, from behind him looking up the court): eyes up, step early,
 *     win the ball — the eye line, the ghost pass, the step arrow.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Think one pass ahead so you are already there when it comes."): he runs it again;
 *     three cards (think, step, win); a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2004 FIFA Futsal World Cup" (raw; wiki-2004-futsal-wc.txt): final 5 December 2004, 16:00, NTU Gymnasium, Taipei City,
 *    Spain 2–1 Italy; goals Kike 24', Marcelo 30' (Spain), Zanetti 40' (Italy); attendance 3,500; referee Juan Carlos Sciancalepore;
 *    Spain's second title. Semi-final 3 Dec: Brazil 2–2 Spain a.e.t., Spain 5–4 on penalties (Kike missed Spain's first kick).
 *    — https://en.wikipedia.org/wiki/2004_FIFA_Futsal_World_Cup
 *  - Wikipedia, "Kike (futsal player)" (raw; wiki-kike-futsal.txt): Enrique Boned Guillot, born 4 May 1978, Valencia; 1.84 m; defender;
 *    ElPozo Murcia 2001–2015; World Cup winner 2000 and 2004, finalist 2008 and 2012; 2009 Futsal Player of the Year (Futsal Planet).
 *    — https://en.wikipedia.org/wiki/Kike_(futsal_player)
 *  - Wikipedia (es), "Kike Boned" (raw; eswiki-kike-boned.txt): position "cierre" (fixo); Spain captain; 180 caps; five European titles;
 *    best fixo of the Spanish league six times; biography titled "Kike Boned, el ídolo inteligente" (the intelligent idol).
 *    — https://es.wikipedia.org/wiki/Kike_Boned
 *  - The FIFA match report (archived) could not be fetched (404), so HOW the goals were scored is unknown and not shown.
 * CONFIRMED: the match, date, venue, city, final score 2–1, Kike scoring the first goal (24'), his position (fixo/cierre, a defender), 1.84 m.
 *  The narration only states these, plus the demonstration, which it frames as "how he does it".
 * INFERRED (not named in the narration): kits — Spain red shirts, navy shorts, red socks; Italy blue shirts, white shorts, blue socks; the
 *  keepers' colours; the wood court; which end each team attacked (the film only needs that ends change at half-time, a futsal rule); every
 *  position in chapter 1; where the celebration happened; who lifted the cup (an unnamed team-mate); the scoreboard's look; Kike's short
 *  dark hair. No video was reviewed. Chapters 2–4 are a demonstration; the right foot for the interception is a choice, not a fact.
 *  Note: the prompt mentioned Inter Movistar; our sources list only CLM Talavera, Valencia Vijusa and ElPozo Murcia, so no club is named.
 * Technique (poses): the fixo stays goal-side in a low ready stance, eyes on the passer's body (hips and standing foot), not the ball; as the
 *  passer plants to pass he is already moving into the line; he arrives BEFORE the ball, low and balanced, and reaches with the foot nearest
 *  the ball to meet it early, then his first touch goes forward.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the step and the steal). Choreography lives in one LOCAL court frame (u = metres out from Kike's goal line, v = across);
 *  each stage maps it with a proper rotation (no mirror), so the right foot stays the right foot. Our stages are LEFT-handed (X right, Z
 *  away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through the
 *  cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagrams), red (Spain, arrows), blue (Italy), navy (key line, shorts, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,stand,lunge,runCycle,runCadence,dribble,keeperSet,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Build,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2004 final',text:'The 2004 Futsal World Cup final, in Taipei. Spain play Italy. Kike is Spain’s fixo, the last defender. He scores the first goal, and Spain win two one!',tail:2.4,
  cues:['The 2004','in Taipei','Spain play','Kike','fixo','last defender','He scores','first goal','Spain win','two one'],heads:{'The 2004':'Final 2004','first goal':'1–0','two one':'2–1'}},
 {label:'How he does it',text:'Fixos read the game. This is how he does it: he watches the passer, thinks one pass ahead and steps into the gap early. The ball comes, and he steals it and attacks!',tail:2.2,
  cues:['Fixos read','This is how','watches the passer','thinks one','steps into','gap early','The ball comes','steals it','attacks'],heads:{'Fixos read':'The fixo','attacks':''}},
 {label:'Watch again',text:'Watch again, slowly. Eyes up, step early, win the ball!',tail:2.2,
  cues:['Watch again','slowly','Eyes up','step early','win the'],heads:{'Watch again':'Slow motion','win the':''}},
 {label:'Your turn',text:'Your turn: think one pass ahead, so you are already there when it comes!',tail:2.6,
  cues:['Your turn','think one','pass ahead','already there','when it comes'],heads:{'Your turn':'Think, step, win','when it comes':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/kike-boned-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/kike-boned-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/kike-boned-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('kike: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('kike: no cue '+w);return c.at;};
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
/** a solid red arrow (the step, the lean) */
function redArrow(s:Sheet,pts:Pt[],w:number,seed:number,progress=1){const q=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(q.length<2)return;const rp=ribbon(q,w,{seed,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(progress>.6)arrowHead(s,R,q,w*2.6,seed+1);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- the LOCAL court frame: u = metres out from a goal line (0 = the line), v = across (0 = the goal's centre) ----------------
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
const BUILD:Build={height:1.84,bulk:1.04};
/** Kike: Spain — red shirt, navy shorts, red socks (kit inferred), short dark hair, 1.84 m */
const KIKE:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.8],[R,.28]],hair:K,line:K,trim:Y,hairStyle:'short',build:BUILD,seed:9};
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.78],[R,.26]],hair:K,line:K,trim:Y,hairStyle:(['short','curly','bald'] as const)[n%3],build:{height:1.72+hash(n,3)*.12},seed:20+n});
const ITA=(n:number):AthleteStyle=>({shirt:B,shorts:'paper',socks:B,boots:K,skin:[[Y,.76],[R,.24]],hair:K,line:K,trim:'paper',hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const ESP_GK:AthleteStyle={shirt:[K,.6],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:60};
const ITA_GK:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.76],[R,.22]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:61};
/** the demonstration (chapters 2–4): Kike in a plain red training top; the attackers in paper training bibs, navy shorts — no team is claimed */
const KIKE_TR:AthleteStyle={...KIKE,trim:'paper'};
const DEMO=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.22+.06*n]],hair:K,line:K,trim:B,hairStyle:n?'curly':'short',build:{height:1.76+.05*n,bulk:1.02},seed:77+n});
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

// ---------------- the arena: wood court, stands (Spain red-and-yellow, Italy blue), futsal goal ----------------
/** stepped navy rows, lit faces, red and blue shirts, Spanish (red-yellow-red) and Italian-fan (blue) flags, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),yel=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.24)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.38)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  if(f%2)blues.addPath(band(0,1));
  else{s.knockout(band(0,1));reds.addPath(band(0,.25));reds.addPath(band(.75,1));yel.addPath(band(.25,.75));}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal goal (3 m × 2 m) on any frame: net halftone + mesh */
function goalNet(s:Sheet,st:Stage,fr:Frame){
 const H=2,Db=.95,Dt=.55,P=(u:number,Yh:number,v:number):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,Yh,Z);};
 const back=(v:number,Yh:number):Pt=>P(-lerp(Db,Dt,Yh/H),Yh,v);
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
function courtLines(st:Stage,fr:Frame,lines:Path2D,uMin:number,uMax:number){
 const S=(pts:Pt[])=>pts.map(([u,v])=>toStage(fr,u,v) as Pt),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([6*Math.sin(a),-1.5-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([6*Math.sin(a),1.5+6*Math.cos(a)]);}
 if(uMin<=0){lines.addPath(polyPath(floorStrip(st,S([[0,-10],[0,10]]),.05),true));lines.addPath(polyPath(floorStrip(st,S(arc),.05),true));}
 for(const u of[6,10])if(u>=uMin){const[X,Z]=toStage(fr,u,0);lines.addPath(polyPath(floorRing(st,X,Z,.12,12),true));}
 for(const v of[-10,10])lines.addPath(polyPath(floorStrip(st,S([[Math.max(0,uMin),v],[uMax,v]]),.05),true));
 // halfway line + centre circle (u = 20)
 if(uMax>=20){lines.addPath(polyPath(floorStrip(st,S([[20,-10],[20,10]]),.05),true));const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([20+Math.cos(a)*3,Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,S(cc),.05),true));}
}

// ---- SIDE court from the broadcast position (chapters 1–2): Kike's goal at X = −20, the near touchline Z = 0, the far boards Z = 21 ----
const BOARDS=21,FA:Frame={ox:-20,oz:10,rot:0};
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
type CourtOpt={cheer?:number;flash?:number;keeper?:()=>void};
function courtSide(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
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
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 if(st.cx<-4){goalNet(s,st,FA);o.keeper?.();goalPosts(s,st,FA);}
}
// ---- UP-COURT view (chapters 3–4): low, from behind Kike, looking up the court toward halfway (the far wall ≈ the far end) ----
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

// ================= the interception (local frame FA/FC: u out from Kike's goal line) =================
/** READY: the fixo's low ready stance, weight on the balls of the feet, arms loose, eyes up on the passer */
const READY=(t:number)=>{const b=Math.sin(t*5.6)*.5+.5;return posed({lHipF:26,rHipF:24,lKnee:40+6*b,rKnee:38+6*b,lAnk:-8,rAnk:-8,lHipA:12,rHipA:12,lHipR:10,rHipR:10,lean:20,pitch:4,neckP:-10,
 lShA:26,rShA:26,lShF:10,rShF:10,lElb:44,rElb:44,air:.015*b});};
const P0:[number,number]=[15.6,-4.2];// the passer (paper bib), ball at his feet
const QS:[number,number]=[14.4,5.8],QT:[number,number]=[10.8,3.9];// the far player's run: from → where he wants the ball
const K0:[number,number]=[10.3,-2.5];// Kike, goal side, a step toward the ball
const YAW_P=yawTo(QT[0]-P0[0],QT[1]-P0[1]);
/** where the ball sits at the passer's right-foot contact (local) */
const B0:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),{height:1.76},{yaw:YAW_P}),toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[P0[0]+toe[0]+d[0]/l*.08,P0[1]-(toe[2]+d[1]/l*.08)];})();
/** before he plants, the ball sits just outside his right foot (toward the camera), then he rolls it into his stride */
const BP:[number,number]=[B0[0]+.3,B0[1]-.5];
/** the interception point: early on the pass line, nearer the passer than the far player */
const IP:[number,number]=L2(B0,QT,.4);
const YAW_K=yawTo(P0[0]-IP[0],P0[1]-IP[1]);// he meets the ball facing the passer
/** where Kike stands so his right toe, at the lunge's full reach, meets the ball at IP */
const KSTOP:[number,number]=(()=>{const sk=solve(lunge(.6,{side:'r'}),BUILD,{yaw:YAW_K}),toe=sk.rToe;return[IP[0]-toe[0],IP[1]+toe[2]];})();
const YAW_D=yawTo(1,.7);// the carry: up the court and inside, away from the passer
const CARRY=2.5;// m/s
type StealT={look:number;think:number;step0:number;step1:number;plant:number;pass:number;steal:number;go:number};
type Steal={kike:LGen;passer:LGen;runner:LGen;ball:(t:number)=>{u:number;y:number;v:number;rolling:boolean;spin:number}};
function makeSteal(T:StealT):Steal{
 const lung0=T.steal-.34;
 const carryD=(t:number)=>{const x=Math.max(0,t-T.go);return CARRY*(x-.2*(1-Math.exp(-x/.2)));};
 const kike:LGen=t=>{
  const moveYaw=yawTo(KSTOP[0]-K0[0],KSTOP[1]-K0[1]),face0=yawTo(P0[0]-K0[0],P0[1]-K0[1]);
  if(t<T.step0){const p=READY(t);p.neckY=.25*Math.sin(t*1.3);return{pose:p,yaw:face0,u:K0[0],v:K0[1]};}
  if(t<T.step1){const w=sm(T.step0,T.step1,t,easeIO),ph=(t-T.step0)*runCadence(.55)*1.1,run=runCycle(ph,{speed:.55,stride:.8});
   const pose=blendPose(blendPose(READY(t),run,sm(T.step0,T.step0+.2,t,easeIO)),READY(t),sm(T.step1-.25,T.step1,t,easeIO));
   const yaw=lerp(lerp(face0,moveYaw,sm(T.step0,T.step0+.2,t)),YAW_K,sm(T.step1-.35,T.step1,t,easeIO));
   return{pose,yaw,u:lerp(K0[0],KSTOP[0],w),v:lerp(K0[1],KSTOP[1],w)};}
  if(t<T.go){const lu=key(t,[[lung0,.02],[T.steal,.6],[T.go,.9]],linear),pose=t<lung0?READY(t):blendPose(READY(t),lunge(lu,{side:'r'}),sm(lung0,lung0+.12,t,easeIO));
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
 const runner:LGen=t=>{
  const ry=yawTo(QT[0]-QS[0],QT[1]-QS[1]),arrive=T.pass+.2;
  if(t<T.think)return{pose:blendPose(stand(),READY(t),.4),yaw:yawTo(P0[0]-QS[0],P0[1]-QS[1]),u:QS[0],v:QS[1]};
  if(t<arrive){const w=sm(T.think,arrive,t,easeIO),ph=(t-T.think)*runCadence(.5);return{pose:blendPose(runCycle(ph,{speed:.5}),READY(t),sm(arrive-.3,arrive,t)),yaw:lerp(ry,yawTo(B0[0]-QT[0],B0[1]-QT[1]),sm(arrive-.4,arrive,t)),u:lerp(QS[0],QT[0],w),v:lerp(QS[1],QT[1],w)};}
  // waiting with his arm out for the ball… then it never comes
  const ask=posed({lHipF:20,rHipF:20,lKnee:30,rKnee:30,lean:12,neckP:-6,lShF:50,lShA:40,lElb:20,rShA:20,rElb:40,lHand:1});
  const slump=posed({lHipF:8,rHipF:8,lKnee:12,rKnee:12,lean:18,neckP:30,lShA:16,rShA:16,lElb:20,rElb:20});
  return{pose:blendPose(blendPose(READY(t),ask,sm(arrive,arrive+.3,t)),slump,sm(T.steal+.2,T.steal+.8,t,easeIO)),yaw:yawTo(B0[0]-QT[0],B0[1]-QT[1]),u:QT[0],v:QT[1]};};
 const toeAt=(t:number):[number,number]=>{const{sk,J}=jointsL(kike(t)),toe=J(sk.rToe),heel=J(sk.rHeel),d=[toe[0]-heel[0],toe[2]-heel[2]],l=Math.hypot(d[0],d[1])||1;return[toe[0]+d[0]/l*.06,toe[2]+d[1]/l*.06];};
 let TS:[number,number]|null=null;
 const ballF=(t:number)=>{
  if(t<T.pass){const w=sm(T.plant,T.pass-.1,t,easeIO);return{u:lerp(BP[0],B0[0],w),y:BALL_R,v:lerp(BP[1],B0[1],w),rolling:false,spin:w*2};}
  if(t<T.steal){const w=sm(T.pass,T.steal,t,linear);return{u:lerp(B0[0],IP[0],w),y:BALL_R,v:lerp(B0[1],IP[1],w),rolling:true,spin:w*8};}
  if(!TS)TS=toeAt(T.go);
  if(t<T.go){const w=sm(T.steal,T.steal+.12,t,easeOut),[tu,tv]=toeAt(t);return{u:lerp(IP[0],tu,w),y:BALL_R,v:lerp(IP[1],tv,w),rolling:false,spin:8};}
  const k=kike(t),ph=(t-T.go)*runCadence(.6)*1.15,ahead=.52+.14*Math.sin(ph*TAU),w=sm(T.go,T.go+.3,t,easeIO),au=k.u+Math.cos(YAW_D)*ahead,av=k.v+Math.sin(YAW_D)*ahead;
  return{u:lerp(TS[0],au,w),y:BALL_R,v:lerp(TS[1],av,w),rolling:true,spin:8+(t-T.go)*14};};
 return{kike,passer,runner,ball:ballF};
}
/** a ball drawn on stage st through frame fr, with its floor shadow (a rolling ball smears back along its path) */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:{u:number;y:number;v:number;rolling:boolean;spin:number},prev:{u:number;v:number},seed:number,min=9){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R),o=fp(st,fr,prev.u,prev.v,BALL_R);
 shadow(s,g[0]+r*.2,g[1],r*1.15,r*.3,seed+5,.4);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.rolling?.35:0,dir:Math.atan2(p[1]-o[1],p[0]-o[0])});return{p,r};
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** a player's chest (the passage enters his red shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
/** a joint of a player on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:"head"|"chest"|"pelvis"|"rToe"|"lHa"|"rHa",build:Build=BUILD):Pt{const{sk,J}=jointsL(l,build),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];

// ================= chapter 1 — LIVE: the 2004 World Cup final in Taipei. Only confirmed things: the arena, the teams at kick-off, Kike the
// fixo, then (cut, second half) the celebration of his goal with the scoreboard at 1–0, and (cut) the 2–1 final whistle and the trophy. =================
const C1={taipei:A(0,'in Taipei'),spain:A(0,'Spain play'),kike:A(0,'Kike'),fixo:A(0,'fixo'),last:A(0,'last'),scores:A(0,'He scores'),first:A(0,'first'),win:A(0,'Spain win'),two:A(0,'two one'),end:AUTH[0].seconds};
const W0=C1.scores-.12,W1=W0+.26,WM=(W0+W1)/2,V0=C1.win-.14,V1=V0+.26,VM=(V0+V1)/2;
/** kick-off (local u from Spain's goal; halfway = 20): Spain in their half, Kike the deepest outfield player; Italy kick off */
const KO_K:[number,number]=[12.4,.6];
const KO_ESP:[number,number][]=[[16.8,-5.6],[16.6,5.4],[18.3,1.6]];
const KO_ITA:[number,number][]=[[20.4,-.4],[21.4,-4.2],[23.8,5.2],[27.6,.3]];
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** second half (ends changed): Spain attack this goal; the celebration of his goal (1–0) */
const CEL:[number,number]=[8.8,-2.8];
const CEL_IN:[number,number][]=[[14.6,1.8],[15.8,-6.2],[20.4,.8]];
/** the trophy (2–1): the team in a knot, a team-mate lifts the cup, Kike beside him */
const TRO:[number,number]=[12.4,.2];
const liveK:LGen=T=>{
 if(T<WM)return{pose:idle(T,0),yaw:0,u:KO_K[0],v:KO_K[1]};
 if(T<VM)return{pose:celebrate((T-WM)*1.1,{kind:'arms'}),yaw:-Math.PI/2+.4*Math.sin((T-WM)*1.4),u:CEL[0],v:CEL[1]};
 return{pose:celebrate((T-VM)*1.1+.3,{kind:'arms'}),yaw:-Math.PI/2-.35,u:TRO[0]+.4,v:TRO[1]-1.15};};
const liveEsp=(i:number):LGen=>T=>{
 if(T<WM)return{pose:idle(T,i+1),yaw:0,u:KO_ESP[i][0],v:KO_ESP[i][1]};
 if(T<VM){const a=CEL_IN[i],go=sm(WM,VM-.6,T,easeOut),tgt:[number,number]=[CEL[0]+[.9,-.8,1.1][i],CEL[1]+[-.9,.8,.9][i]],u=lerp(a[0],tgt[0],go),v=lerp(a[1],tgt[1],go);
  return{pose:go<.95?celebrate((T-WM)*1.2+i*.3,{kind:'run'}):celebrate((T-WM)*1.1+i*.4,{kind:'arms'}),yaw:yawTo(CEL[0]-u,CEL[1]-v),u,v};}
 const spot:[number,number][]=[[TRO[0]-.9,TRO[1]+1.1],[TRO[0]+.7,TRO[1]+1.3],[TRO[0]-.6,TRO[1]-1.9]];
 return{pose:celebrate((T-VM)*1.1+i*.37,{kind:'arms'}),yaw:-Math.PI/2+[.3,-.2,.5][i],u:spot[i][0],v:spot[i][1]};};
const LIFT=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:-6,neckP:-30,lShF:170,rShF:170,lShA:14,rShA:14,lElb:22,rElb:22,lHand:.3,rHand:.3});
const lifter:LGen=T=>({pose:blendPose(stand(),LIFT,sm(VM,VM+.7,T,easeOutBack)),yaw:-Math.PI/2,u:TRO[0],v:TRO[1]});
const liveIta=(i:number):LGen=>T=>{if(T<WM)return{pose:idle(T,i+.37),yaw:Math.PI,u:KO_ITA[i][0],v:KO_ITA[i][1]};
 const base:[number,number]=T<VM?[[5.2,3.6],[6.4,-6.2],[3.4,-.9],[12.4,5.8]][i] as [number,number]:[[20.2,5.8],[22.4,-6.6],[24.2,2.2],[18.6,7.4]][i] as [number,number];
 return{pose:posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:10,rShA:10,lElb:24,rElb:24}),yaw:T<VM?(i%2?.7:-.5):Math.PI*.8,u:base[0],v:base[1]};};
/** the keeper in this goal: Spain's in the first half, Italy's after the ends change */
const liveGK:LGen=T=>T<WM?{pose:keeperSet(T*1.3),yaw:0,u:.7,v:0}:{pose:posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:16,neckP:44,lShA:12,rShA:12,lElb:30,rElb:30}),yaw:.4,u:.8,v:-.4};
const liveCam=(T:number)=>({x:key(T,mono([[0,-.5],[C1.spain,-1],[C1.kike,-5.6],[C1.fixo,-6.8],[C1.last,-7.4],[W0,-7.8],[W1,-11.2],[C1.first,-11.4],[V0,-11.5],[V1,-8],[C1.end,-7.9]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.spain,.58],[C1.kike+.2,.86],[C1.fixo,.95],[C1.last,.9],[W0,.9],[W1,.86],[C1.first,.92],[V0,.94],[V1,1.05],[C1.end,1.12]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.kike+.2,1000],[C1.last,1010],[W1,990],[V0,990],[V1,940],[C1.end,930]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'0':[0,1,2,4,5,6],'1':[2,5],'2':[0,2,3,4,6]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
function scoreboard(s:Sheet,st:Stage,camX:number,score:string){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=H*.62,y=top-H+H*.19;// Spain left (red tab), Italy right (blue tab)
 const tabs=(ink:string,x:number)=>{const p=new Path2D();p.rect(x,top-H+H*.06,W*.16,H*.07);s.fill(ink,p);};tabs(R,cx-W*.38);tabs(B,cx+W*.22);digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,score[2],cx+W*.3-h*.55,y,h);s.fill(Y,lit);
}
/** the cup: paper with a navy key line and yellow glints, held between the lifter's hands */
function trophy(s:Sheet,st:Stage,l:Loc){const{sk,J}=jointsL(l,{height:1.76}),a=J(sk.lHa),b=J(sk.rHa),m=[(a[0]+b[0])/2,(a[1]+b[1])/2+.12,(a[2]+b[2])/2],[X,Z]=toStage(FA,m[0],m[2]),p=proj(st,X,m[1],Z),k=kAt(st,Z);
 const cup:Pt[]=[[-.2,-.5],[.2,-.5],[.16,-.28],[.05,-.2],[.05,-.06],[.13,0],[-.13,0],[-.05,-.06],[-.05,-.2],[-.16,-.28]].map(([x,y])=>[p[0]+x*k,p[1]+y*k] as Pt);
 const path=polyPath(smoothPts(cup,true,6,2),true);s.knockout(path);s.fill(K,ribbon([...smoothPts(cup,true,6,2),cup[0]],Math.max(3,k*.02),{seed:141,close:true,wobble:.5}));
 s.fill(Y,polyPath(blob(p[0]-.08*k,p[1]-.4*k,.03*k,.07*k,142,{n:10}),true));}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const phase=T<WM?0:T<VM?1:2;
 courtSide(s,st,T,{cheer:phase===0?.1:phase===1?.9:1,flash:phase===1?pulse(T,WM,1.2):phase===2?pulse(T,VM,1.2)+.6*pulse(T,C1.two,1.2):0,
  keeper:()=>{athlete(s,st,FA,liveGK,T,phase===0?ESP_GK:ITA_GK,{detail:'low'});}});
 if(phase>0)scoreboard(s,st,c.x,phase===1?'1-0':'2-1');
 const items:Item[]=[];
 KO_ITA.forEach((_,i)=>{const g=liveIta(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,ITA(i),{detail:'low'})});});
 [0,1,2].forEach(i=>{const g=liveEsp(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,ESP(i),{detail:'low'})});});
 if(phase===2)items.push({z:depth(FA,lifter(T)),draw:()=>{athlete(s,st,FA,lifter,T,ESP(3),{detail:'mid'});trophy(s,st,lifter(T));}});
 items.push({z:depth(FA,liveK(T))-.02,draw:()=>athlete(s,st,FA,liveK,T,KIKE,{detail:'mid'})});
 if(phase===0)items.push({z:10,draw:()=>{drawBallL(s,st,FA,{u:20,y:BALL_R,v:0,rolling:false,spin:0},{u:20,v:0},18);}});
 // "fixo": a red dashed ring under him; "last defender": a dashed yellow line across the court at his depth (nobody behind him but the keeper)
 if(phase===0){const l=liveK(T),[X,Z]=toStage(FA,l.u,l.v),g=easeOutBack(sm(C1.fixo,C1.fixo+.35,T))*(1-sm(W0-.3,W0,T));
  const ln=sm(C1.last,C1.last+.6,T,easeOut)*(1-sm(W0-.3,W0,T));
  if(ln>.02)items.push({z:BOARDS,draw:()=>{const pts:Pt[]=[];for(let k=0;k<=8;k++)pts.push(fp(st,FA,l.u-.4,lerp(9.6,-9.6,k/8)));cased(s,pts,14,54,{dash:48,progress:ln});}});
  if(g>.02)items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.15,22,50,g);floorDashRing(s,st,R,X,Z,1.15,14,51,g);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // the whip pans: yellow speed lines sweep across the frame (cuts in time)
 for(const[a0,a1] of[[W0,W1],[V0,V1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
 // world champions: confetti in Spain's colours
 if(phase===2){const u=sm(VM,VM+3,T,linear),top=proj(st,c.x,4,BOARDS)[1],x0=proj(st,c.x-9,0,10)[0],x1=proj(st,c.x+9,0,10)[0];confetti(s,[R,Y,K,'paper'],[x0,top-200+u*500,x1-x0,420],26,Math.floor(T*6),{size:16});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FA,liveK(tt),.14));},still:C1.last+.4};

// ================= chapter 2 — HOW HE DOES IT (demonstration, real time, side-on): watch, think, step, steal, attack =================
const C2={fixos:A(1,'Fixos'),how:A(1,'This is'),watch:A(1,'watches'),think:A(1,'thinks'),steps:A(1,'steps'),gap:A(1,'gap'),comes:A(1,'The ball'),steals:A(1,'steals'),att:A(1,'attacks'),end:AUTH[1].seconds};
const T2:StealT={look:C2.watch,think:C2.think,step0:C2.steps,step1:C2.comes+.15,plant:C2.comes,pass:C2.steals-.5,steal:C2.steals+.05,go:C2.att-.2};
const steal2=makeSteal(T2);
const st2:Stage={F:2600,eye:3.4,cx:-6.5,cz:-3};
const S2=(u:number,v:number,y=0)=>fp(st2,FA,u,v,y);
const END2=steal2.kike(C2.end),MID2=steal2.kike(C2.att+.6);
const CAM2:Key[]=[
 frameOn(0,[S2(K0[0],K0[1],2),S2(P0[0],P0[1],0),S2(QS[0],QS[1],2),S2(K0[0],K0[1],0)],300,.9),
 frameOn(C2.watch,[S2(K0[0],K0[1],2),S2(P0[0],P0[1],2),S2(P0[0],P0[1],0),S2(K0[0],K0[1],0)],230),
 frameOn(C2.think,[S2(K0[0],K0[1],2),S2(P0[0],P0[1],0),S2(QT[0],QT[1],2),S2(QS[0],QS[1],0)],240),
 frameOn(C2.comes,[S2(KSTOP[0],KSTOP[1],2),S2(P0[0],P0[1],0),S2(IP[0],IP[1],0),S2(QT[0],QT[1],2)],230),
 frameOn(C2.steals+.2,[S2(KSTOP[0],KSTOP[1],2.1),S2(KSTOP[0],KSTOP[1],0),S2(IP[0],IP[1],0)],330,1.25),
 frameOn(C2.att,[S2(KSTOP[0],KSTOP[1],2),S2(MID2.u,MID2.v,0),S2(MID2.u+2.4,MID2.v+1,1)],240),
 frameOn(C2.end,[S2(END2.u-1.5,END2.v,2),S2(END2.u,END2.v,0),S2(END2.u+2.4,END2.v+1,2)],260,1.2),
];
/** the diagrams shared by the demonstration views: eye line, ghost pass + target ring, the step arrow, the carry arrow */
function stealDiagrams(s:Sheet,st:Stage,fr:Frame,S:Steal,t:number,c:{watch:number;think:number;step:number;steal:number;go?:number;fade:number},scale=1){
 const k=S.kike(t),p=S.passer(t);
 // eye line: from his head to the passer's hips (watch the passer's body, not the ball)
 const ey=sm(c.watch,c.watch+.4,t,easeOut)*(1-sm(c.fade-.3,c.fade,t));
 if(ey>.02){const h=jointPt(st,fr,k,'head'),hp=jointPt(st,fr,p,'pelvis',{height:1.76});cased(s,[h,L2(h,hp,.5),hp],13*scale,401,{dash:34*scale,progress:ey});
  if(ey>.9){const r=34*scale*(1+.3*pulse(t,c.watch+.4,.8));s.fill(Y,ribbon(blob(hp[0],hp[1],r,r*.8,402,{n:18}),6*scale,{seed:403,close:true,wobble:.8}),1);}}
 // "one pass ahead": the ghost pass (dashed, from the ball to the far player) and a red dashed ring where he will meet it
 const gh=sm(c.think,c.think+.6,t,easeOut)*(1-sm(c.steal+.4,c.steal+.9,t));
 if(gh>.02){const pts=[S2f(st,fr,B0[0],B0[1]),S2f(st,fr,lerp(B0[0],QT[0],.5),lerp(B0[1],QT[1],.5)),S2f(st,fr,QT[0]+.5,QT[1]-.6)];cased(s,pts,15*scale,404,{dash:44*scale,progress:gh});if(gh>.9)casedHead(s,pts,40*scale,405);
  const[X,Z]=toStage(fr,IP[0],IP[1]),g=easeOutBack(sm(c.think+.35,c.think+.7,t));if(g>.02){floorDashRing(s,st,K,X,Z,.6,24*scale,406,g);floorDashRing(s,st,R,X,Z,.6,15*scale,407,g);}}
 // the step: a red arrow on the floor from where he stood to the ring
 const sp=sm(c.step,c.step+.5,t,easeOut)*(1-sm(c.steal+.4,c.steal+.9,t));
 if(sp>.02){const a=S2f(st,fr,K0[0]+.25,K0[1]+.1),b=S2f(st,fr,KSTOP[0]-.1,KSTOP[1]+.05),m=L2(a,b,.5);redArrow(s,[a,[m[0],m[1]+8],b],15*scale,408,sp);}
 // the carry: a yellow arrow ahead of him up the court
 if(c.go!==undefined){const ar=sm(c.go,c.go+.5,t,easeOut);if(ar>.02){const pts=[S2f(st,fr,k.u+Math.cos(YAW_D)*.9,k.v+Math.sin(YAW_D)*.9),S2f(st,fr,k.u+Math.cos(YAW_D)*2.4,k.v+Math.sin(YAW_D)*2.4),S2f(st,fr,k.u+Math.cos(YAW_D)*3.9,k.v+Math.sin(YAW_D)*3.9)];cased(s,pts,15*scale,409,{dash:46*scale,progress:ar});if(ar>.9)casedHead(s,pts,42*scale,410);}}
}
const S2f=(st:Stage,fr:Frame,u:number,v:number)=>fp(st,fr,u,v);
/** the steal itself: a spark and a red ring at the ball on the word */
function stealFlash(s:Sheet,st:Stage,fr:Frame,t:number,at:number,r=120){if(t<at-.02||t>at+1)return;const p=fp(st,fr,IP[0],IP[1],BALL_R),g=easeOut(sm(at,at+.25,t))*(1-sm(at+.6,at+1,t));
 sparkBurst(s,Y,p[0],p[1],r,{n:10,seed:420,g});s.fill(R,ribbon(blob(p[0],p[1],r*.55*g+4,r*.4*g+3,421,{n:20}),8,{seed:422,close:true,wobble:1}),g);}
function drawSteal(s:Sheet,st:Stage,fr:Frame,S:Steal,t:number,detail:'mid'|'high',smearK:number){
 const k=S.kike(t),b=S.ball(t),bp=S.ball(t-.08),dK=depth(fr,k);
 const items:Item[]=[
  {z:depth(fr,S.passer(t)),draw:()=>athlete(s,st,fr,S.passer,t,DEMO(0),{detail:'mid'})},
  {z:depth(fr,S.runner(t)),draw:()=>athlete(s,st,fr,S.runner,t,DEMO(1),{detail:'mid'})},
  {z:dK,draw:()=>athlete(s,st,fr,S.kike,t,KIKE_TR,{detail,smear:smearK})},
  {z:depth(fr,b)+(Math.abs(depth(fr,b)-dK)<.6?-.3:0),draw:()=>{drawBallL(s,st,fr,b,bp,211,10);}},
 ];
 items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2;
  camPath(s,t,CAM2);
  courtSide(s,st,tt,{cheer:tt>T2.steal?.5*(1-sm(T2.steal+1.5,T2.steal+3,tt)):0,flash:pulse(tt,T2.steal,1)});
  stealDiagrams(s,st,FA,steal2,tt,{watch:C2.watch,think:C2.think,step:C2.steps,steal:T2.steal,go:C2.att,fade:C2.steals});
  const smear=(tt>T2.step0&&tt<T2.step1)?.12:(tt>T2.steal-.2&&tt<T2.steal+.15)?.14:0;
  drawSteal(s,st,FA,steal2,tt,'high',smear);
  stealFlash(s,st,FA,tt,T2.steal,130);
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,FA,steal2.kike(tt),.13));},
 still:C2.think+.9,
};

// ================= chapter 3 — WATCH AGAIN (slow-motion replay, reverse angle: low, from behind him looking up the court) =================
const C3={watch:A(2,'Watch'),slow:A(2,'slowly'),eyes:A(2,'Eyes up'),step:A(2,'step early'),win:A(2,'win the'),end:AUTH[2].seconds};
/** the replay re-uses the chapter 2 sequence, slowed and keyed to the words (sequence time = seq(t)) */
const seq3=(t:number)=>key(t,mono([[0,T2.look-.6],[C3.eyes,T2.think+.2],[C3.step,T2.step0+.1],[C3.win,T2.steal-.05],[C3.win+1.2,T2.steal+.5],[C3.end,T2.go+.9]]),linear);
const K0C=toStage(FC,K0[0],K0[1]);
const st3:Stage={F:1500,eye:1.15,cx:K0C[0]+.6,cz:K0C[1]-3.4};
const S3=(u:number,v:number,y=0)=>fp(st3,FC,u,v,y);
const CAM3:Key[]=[
 frameOn(0,[S3(K0[0],K0[1],2),S3(P0[0],P0[1],2),S3(QS[0],QS[1],2),S3(K0[0],K0[1],0)],150,1.5),
 frameOn(C3.eyes,[S3(K0[0],K0[1],2),S3(P0[0],P0[1],2),S3(P0[0],P0[1],0),S3(K0[0],K0[1],0)],160,1.5),
 frameOn(C3.step,[S3(KSTOP[0],KSTOP[1],2),S3(P0[0],P0[1],0),S3(QT[0],QT[1],2),S3(K0[0],K0[1],0)],150,1.5),
 frameOn(C3.win,[S3(KSTOP[0],KSTOP[1],2),S3(KSTOP[0],KSTOP[1],0),S3(IP[0],IP[1],0),S3(P0[0],P0[1],1)],170,1.6),
 frameOn(C3.end,[S3(KSTOP[0],KSTOP[1],2),S3(KSTOP[0]+3,KSTOP[1]+.6,0),S3(P0[0],P0[1],2)],170,1.5),
];
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,q=seq3(tt),hit=pulse(q,T2.steal,.4);
  camPath(s,t,CAM3,[5*hit*Math.sin(t*80),3*hit*Math.cos(t*77)]);
  upCourt(s,st,tt,q>T2.steal?.6:0,pulse(q,T2.steal,1));
  stealDiagrams(s,st,FC,steal2,q,{watch:seq3(C3.eyes)-.1,think:seq3(C3.eyes)+.05,step:seq3(C3.step),steal:T2.steal,fade:seq3(C3.win)},.85);
  const smear=(q>T2.step0&&q<T2.step1)?.35:(q>T2.steal-.25&&q<T2.steal+.2)?.4:0;
  drawSteal(s,st,FC,steal2,q,'high',smear);
  stealFlash(s,st,FC,q,T2.steal,110);
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,FC,steal2.kike(seq3(tt)),.13));},
 still:C3.step+.5,
};

// ================= chapter 4 — YOUR TURN: he runs it again; three cards (think, step, win); a tick =================
const C4={your:A(3,'Your'),think:A(3,'think one'),ahead:A(3,'pass ahead'),there:A(3,'already'),comes:A(3,'when it'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T2.look-.4],[C4.think,T2.think+.1],[C4.there,T2.step0+.2],[C4.comes,T2.steal-.1],[C4.end,T2.go+1.3]]),linear);
const st4:Stage={F:1500,eye:1.7,cx:K0C[0]+.8,cz:K0C[1]-4.6};
const CARD_Y=770,CARD_W=175,CARDS:[number,number,'think'|'step'|'win'][]=[[-420,C4.think,'think'],[0,C4.there,'step'],[420,C4.comes,'win']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,q=seq4(tt);
  camPath(s,t,[[0,-60,120,1.02],[C4.your+.4,0,330,.9],[C4.there,0,330,.9],[C4.end,0,320,.92]]);
  upCourt(s,st,tt,q>T2.steal?.8*(1-sm(C4.end-1,C4.end,tt)):0,pulse(q,T2.steal,1));
  drawSteal(s,st,FC,steal2,q,'mid',(q>T2.step0&&q<T2.step1)?.15:0);
  stealFlash(s,st,FC,q,T2.steal,90);
  // the three cards rise on "Your turn"; each prints its step as it is said (think, step, win)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+160;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+(kind==='think'?-40:kind==='step'?-20:-70),y:gy+20,height:330*(.9+.1*on),azimuth:kind==='win'?-60:0,elevation:14,fov:18,at:[0,0,0]});
    const pose=kind==='think'?READY(.3):kind==='step'?runCycle(.3,{speed:.7}):lunge(.6,{side:'r'});
    const csk=solve(pose,BUILD,{}),P=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    // think = an eye line forward to a ghost ball; step = a red floor arrow; win = the ball on his toe
    if(kind==='step'){const a=P([-1.1,.3,0]),b=P([.95,.3,0]);redArrow(s,[a,L2(a,b,.5),b],9,88);}
    drawAthlete(s,pose,fc,{...KIKE_TR,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    if(kind==='think'){const h=csk.head,p0=P([h[0]+.2,h[1]-.02,h[2]]),p1=P([h[0]+1.05,.35,h[2]]),pts:Pt[]=[p0,L2(p0,p1,.5),p1];dashed(s,K,pts,11,84,{dash:24,ko:false,cov:.9});dashed(s,Y,pts,6,85,{dash:24});const r=15;s.fill(K,ribbon(blob(p1[0],p1[1],r,r,86,{n:16}),5,{seed:87,close:true,wobble:.6}),.9);}
    if(kind==='win'){const tb:V3=[csk.rToe[0]+.06,BALL_R,csk.rToe[2]+.08],p0=P(tb),bR=BALL_R*(fc.scale?fc.scale(tb):100);ball(s,p0[0],p0[1],bR,81+i);s.fill(R,ribbon(blob(p0[0],p0[1],bR*1.9,bR*1.5,93,{n:18}),6,{seed:94,close:true,wobble:1}),1);}
    s.restore();});
   s.fill(K,frames);}
  // "when it comes": a big tick (yellow over red, navy echo) stamps beside him
  const tick=easeOutBack(sm(C4.comes+.35,C4.comes+.7,tt));
  if(tick>.02){const k=steal2.kike(q),[,KZ]=toStage(FC,k.u,k.v),g=fp(st,FC,k.u,k.v),h=kAt(st,KZ)*1.8,c:Pt=[g[0]+h*.62,g[1]-h*.85],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.there+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'kike-boned-futsal-signature',format:'futsal',title:'Kike’s clever interception',theme:'Think one pass ahead so you are already there when it comes.',
 ageNote:'For players aged 7–12: the 2004 final and Kike’s goal are real; the interception is shown as a demonstration. Watch the passer, not just the ball.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in along a dashed pass line and is stopped dead inside a red ring; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const roll=sm(0,.3,age,easeOut),bx=x+170*(1-roll);
  const ln=1-sm(.5,.9,age);if(ln>.02)dashed(s,Y,[[x+240,y+r*.6],[x+120,y+r*.6],[x,y+r*.6]],8,seed+3,{dash:26,cov:ln});
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:(1-roll)*6});
  const g=easeOutBack(sm(.25,.5,age))*(1-sm(.9,1.2,age));if(g>.02)s.fill(R,ribbon(blob(x,y,r*1.6*g,r*1.3*g,seed+4,{n:18}),8,{seed:seed+5,close:true,wobble:1}),1);
 },
};
export default film;
