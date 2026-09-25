/** Konstantin Eremenko — "the classic pivot turn": a signature-move riso film (iconic plays, FUTSAL; Eremenko was a pivot).
 *
 * WHO: Konstantin Viktorovich Yeryomenko / Eremenko (5 Aug 1970 – 18 Mar 2010), Russia's tall futsal pivot (1.90 m) of Dina Moscow
 *  (1991–2001), named the greatest futsal player of the 20th century (card bio, lib/town/playerBios.json: "Russian legend of Dina Moscow …
 *  scored the winning shootout kick at Euro 1999"). He died young (2010); the film, for 7–12 year olds, does not dwell on it.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the classic pivot turn, "Receive with your back to goal, then turn
 *  when the defender leans" — not one match. No written source we could reach describes HOW any single Eremenko goal was scored (older
 *  futsal is thinly covered: Wikipedia's match boxes give scorer + minute; UEFA's 1999 match report survives only on archive.today, which
 *  answered our one request with a 429, so we stopped fetching). So the film follows the brief's honest FALLBACK:
 *  1  LIVE (broadcast camera, main stand, real time): the UEFA Futsal Championship FINAL, 28 Feb 1999, Palacio Municipal de Deportes,
 *     Granada, Russia 3–3 Spain, Russia win 4–2 on penalties. The one Eremenko action that IS documented in writing is the shoot-out: he took
 *     Russia's fourth kick and scored the winning penalty. So the chapter shows the two lines of players waiting, the scoreboard at 3–3,
 *     then (whip pan, a cut in time) Eremenko at the 6 m penalty mark scoring the winner, and Russia's players running to him. His 34th-
 *     minute goal in the final is NOT staged (no source says how it was scored).
 *  2  HOW HE DOES IT (a labelled demonstration, real time; he wears a plain blue training top, the defender and keeper neutral kit, no
 *     match is claimed; the camera looks from the main stand with the goal on the RIGHT): back to goal, he takes the pass under his sole,
 *     feels the defender with his arm, waits for the lean, spins the other way (over his right shoulder) and shoots low.
 *  3  WATCH AGAIN (slow-motion replay of the demonstration, reverse angle: low, in front of him, the goal behind).
 *  4  YOUR TURN (lesson from the entry's `lesson`): he runs it again; three cards (receive, the lean, turn); a tick.
 * Sources (written; fetched with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "1999 UEFA Futsal Championship" (raw, wiki-futsal-euro-1999.txt): held in Granada, 22–28 Feb 1999, Palacio Municipal de
 *    Deportes (capacity 7,500); FINAL 28 Feb 1999, Russia 3–3 Spain, attendance 7,500; goals Llorente 8' 35', Belyi 27', Alekberov 33',
 *    Eremenko 34', Javi Sánchez 34'; penalties 4–2 to Russia — Russia: Gorine ✓, Verizhnikov ✓, Alekberov ✓, Eremenko ✓; Spain: Ferreira
 *    de Araujo ✓, Mena ✓, two misses. Top scorer AND best player of the tournament: Konstantin Eremenko (11 goals). Semi-final Russia 9–6
 *    Netherlands (Eremenko four goals). — https://en.wikipedia.org/wiki/1999_UEFA_Futsal_Championship
 *  - Wikipedia, "Konstantin Yeryomenko" (raw, wiki-konstantin-yeryomenko.txt): pivot, 1.90 m, Dina Moscow 1991–2001; Russia 1992–2001, 66
 *    caps, 122 goals (all-time top scorer); "He became a key player in Russia's 1999 UEFA Futsal Championship triumph, scoring the winning
 *    penalty in a shoot-out against hosts Spain"; Golden Shoe 1996 and 1999, Best Player 1999. — https://en.wikipedia.org/wiki/Konstantin_Yeryomenko
 *  - archive.today copy of UEFA's final report (linked from the Wikipedia page): HTTP 429, not read.
 * CONFIRMED (the narration states only these): the final, the year, Granada, Russia v Spain, 3–3, penalties, Eremenko scoring Russia's
 *  winning (fourth) penalty, Russia European champions; Eremenko a pivot, 1.90 m (tall), the tournament's top scorer.
 * INFERRED (never named in the narration): kits — Russia white shirts with blue shorts, Spain red shirts with navy shorts, Spain's keeper in
 *  yellow; the wood court; which end the shoot-out was taken at; the shoot-out order (Russia's 4th kick is shown as the last kick either way:
 *  the pens read 3–2 before it and 4–2 after it, which holds whichever team kicked first); Eremenko's kicking foot (right), his run-up, the
 *  corner (low, to the keeper's left) and the keeper's dive (the other way); where the players stood and ran; the scoreboard's look; his hair
 *  (short, dark; his moustache is not drawn — the athlete library has no facial hair). No video was reviewed. Chapters 2–4 are a demonstration.
 * Technique (poses): the pivot sits low with a wide base, knees bent, weight forward, the arm nearest the defender bent and held back
 *  against him (feel, don't push); he stops the pass with the sole of the foot away from the defender; when the defender leans to one side
 *  he spins over the other shoulder on his standing foot and shoots early and low, before the keeper can set.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the spin and the strikes). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across); each
 *  stage maps it with a proper rotation (no mirror), so the right foot stays the right foot. Our stages are LEFT-handed (X right, Z away), so
 *  `projector()` maps library z → −Z. (The court, ball, goal and turn machinery follow the approved Ferrão film.)
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through the
 *  cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagrams), red (Spain shirts, arrows), blue (Russia shorts, his training top), navy (key line, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–280 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 1999 final',text:'Granada, 1999: the European futsal final, Russia against Spain. Konstantin Eremenko is Russia’s tall pivot and top scorer. It ends three all, so penalties! Eremenko scores, and Russia are champions of Europe!',tail:2.6,
  cues:['Granada','European futsal','Russia against','Konstantin','tall pivot','top scorer','three all','penalties','Eremenko scores','champions'],heads:{'Granada':'Final 1999','three all':'3–3','champions':'Champions!'}},
 {label:'How he does it',text:'Pivots play with their back to goal. This is how he does it: he takes the pass and feels the defender. When the defender leans one way, he turns the other and shoots!',tail:2.2,
  cues:['Pivots play','back to goal','This is how','takes the pass','feels the defender','defender leans','turns the other','shoots'],heads:{'back to goal':'The pivot','shoots':''}},
 {label:'Watch again',text:'Watch again, slowly. Back to goal, feel the lean, turn!',tail:2.4,
  cues:['Watch again','Back to goal','feel the lean','turn'],heads:{'Watch again':'Slow motion','turn':''}},
 {label:'Your turn',text:'Your turn: receive with your back to goal, turn when the defender leans!',tail:2.8,
  cues:['Your turn','receive','back to goal','turn when','defender leans'],heads:{'Your turn':'Receive, turn','defender leans':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/eremenko-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/eremenko-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/eremenko-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('eremenko: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('eremenko: no cue '+w);return c.at;};
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
const SKIN:InkFill[]=[[Y,.8],[R,.3]];
/** Eremenko: 1.90 m (Wikipedia), a tall, strong pivot */
const BUILD={height:1.9,bulk:1.08};
/** Eremenko in the 1999 final: Russia white shirt with blue trim, blue shorts, white socks (kit inferred), short dark hair */
const EREM:AthleteStyle={shirt:'paper',shorts:B,socks:'paper',boots:K,skin:SKIN,hair:K,line:K,trim:B,hairStyle:'short',build:BUILD,seed:9};
/** Eremenko in the demonstration (chapters 2–4): a plain blue training top, navy shorts — no team or match is claimed */
const EREM_DEMO:AthleteStyle={shirt:B,shorts:K,socks:K,boots:K,skin:SKIN,hair:K,line:K,trim:'paper',hairStyle:'short',build:BUILD,seed:9};
const RUS=(n:number):AthleteStyle=>({shirt:'paper',shorts:B,socks:'paper',boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:B,hairStyle:(['short','balding','curly','short'] as const)[n%4],build:{height:1.72+hash(n,3)*.14},seed:20+n});
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.28]],hair:K,line:K,trim:Y,hairStyle:n%2?'short':'curly',build:{height:1.7+hash(n,4)*.12},seed:40+n});
const ESP_GK:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:61};
/** the demonstration players (chapters 2–4): a neutral paper/navy training kit, no team is claimed */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.82,bulk:1.05},seed:77};
const DEMO_GK:AthleteStyle={shirt:[K,.55],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.22]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'bald',build:{height:1.8},seed:78};
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

// ---------------- the arena: wood court, stands (Barça blue/garnet and Sporting green), futsal goal ----------------
/** stepped navy rows, lit faces, red (home Spain) and blue shirts, roof lights; `flags` waves Spain (red-yellow-red) and Russia (white-
 * blue-red) flags — only in the real final (chapter 1); the demonstration's crowd carries none. cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,flags=false){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),yel=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.3)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.38)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 if(flags)for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  if(f%3===1){s.knockout(band(0,1/3));blues.addPath(band(1/3,2/3));reds.addPath(band(2/3,1));}// Russia: white, blue, red
  else{reds.addPath(band(0,.25));yel.addPath(band(.25,.75));reds.addPath(band(.75,1));}}// Spain: red, yellow, red
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
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
 /** a bar from a to b (u, y, v): a screen-space quad as wide as the bar at its depth, banded red/paper */
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
/** the court's painted lines in the local frame: goal line, the D (6 m quarter circles from the posts), 6 m and 10 m spots */
function courtLines(st:Stage,fr:Frame,lines:Path2D,uMax:number){
 const S=(pts:Pt[])=>pts.map(([u,v])=>toStage(fr,u,v) as Pt),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([6*Math.sin(a),-1.5-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([6*Math.sin(a),1.5+6*Math.cos(a)]);}
 lines.addPath(polyPath(floorStrip(st,S([[0,-10],[0,10]]),.05),true));lines.addPath(polyPath(floorStrip(st,S(arc),.05),true));
 for(const u of[6,10]){const[X,Z]=toStage(fr,u,0);lines.addPath(polyPath(floorRing(st,X,Z,.12,12),true));}
 for(const v of[-10,10])lines.addPath(polyPath(floorStrip(st,S([[0,v],[uMax,v]]),.05),true));
}

// ---- SIDE court from the broadcast position (chapters 1–2): the near touchline Z = 0, the far boards Z = 21. Chapter 1 (the final) uses the
//      goal at X = −20 (frame FA); chapter 2 (the demonstration) the goal at X = +20 (frame FR, FA turned 180°: a rotation, not a mirror) ----
const TOUCH_FAR=20,BOARDS=21,FA:Frame={ox:-20,oz:10,rot:0},FR:Frame={ox:20,oz:10,rot:Math.PI};
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
type CourtOpt={cheer?:number;flash?:number;bulge?:number;bv?:number;by?:number;keeper?:()=>void;flags?:boolean};
function courtSide(s:Sheet,st:Stage,t:number,o:CourtOpt={},fr:Frame=FA){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.45);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 // planks run along the court (horizontal on screen), alternate strips tinted, butt joints staggered
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
 stands(s,wall-board,kw,t,cheer,flash,st.cx,!!o.flags);
 goalNet(s,st,fr,bulge,bv,by);o.keeper?.();goalPosts(s,st,fr);
}
// ---- END-ON court (chapters 3–4): the camera looks along +Z at the goal (centre X = 0, Z = GZ); the frame is turned 29° so the camera sits
//      off the pivot's LEFT front (his holding arm, the defender's lean) with the goal behind him ----
const GZ=11,WALLZ=13.6,FB:Frame={ox:0,oz:GZ,rot:-Math.PI/2-.5};
function arena(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 const floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.45);s.fill(R,floor,.3);
 const strips=new Path2D(),seams=new Path2D(),near=st.cz+.35;
 for(let i=-40;i<40;i++){const X0=i*.5,X1=X0+.5;if(hash(i+40,5)>.55)strips.addPath(polyPath([proj(st,X0,0,near),proj(st,X1,0,near),proj(st,X1,0,WALLZ),proj(st,X0,0,WALLZ)],true));
  const a=proj(st,X0,0,near),b=proj(st,X0,0,WALLZ);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);
  for(let z=near+hash(i,9)*2.2;z<WALLZ;z+=2.2){const p=proj(st,X0,0,z),q=proj(st,X1,0,z);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,FB,lines,Math.max(1,GZ-near));s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,FB,bulge,bv,by);o.keeper?.();goalPosts(s,st,FB);
}

// ================= the pivot turn (local frame): poses, the pivot, the defender, the ball, the keeper =================
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
const P0:[number,number]=[5.6,.3];// the pivot's stance (local)
const D0:[number,number]=[4.92,.44];// the defender, goal side of him
const TGT:V3=[-.1,.34,-1.12];// low, inside the post on the pivot's right (local u, y, v)
const YAW_S=yawTo(TGT[0]-P0[0],TGT[2]-P0[1]);// facing the goal after a RIGHT spin (yaw goes down from 0)
/** where the ball sits at the right-foot strike's contact (local, relative to the stance) */
const SB:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD,{yaw:YAW_S}),toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[toe[0]+d[0]/l*.08,-(toe[2]+d[1]/l*.08)];})();
const SHOT:[number,number]=[P0[0]+SB[0],P0[1]+SB[1]];
type TurnT={pass0:number;pass1:number;hold:number;lean:number;turn0:number;turn1:number;hit:number;from:[number,number]};
type Turn={piv:LGen;def:LGen;gk:LGen;ball:(t:number)=>{u:number;y:number;v:number;flying:boolean;spin:number};inn:number};
function makeTurn(T:TurnT):Turn{
 const inn=T.hit+.3;
 const strikeT=(t:number)=>key(t,[[T.turn1,.26],[T.hit,STRIKE_CONTACT],[T.hit+.5,.82],[T.hit+1.1,.95]],linear);
 const piv:LGen=t=>{
  let pose:Pose,yaw=0;const bob=Math.sin(t*5.2)*.5+.5;
  const ready=posed({lHipF:18,rHipF:18,lKnee:32+6*bob,rKnee:30+6*bob,lHipA:10,rHipA:10,lean:16,neckP:8,neckY:20,lShA:22,rShA:22,lElb:40,rElb:40});
  if(t<T.hold-.4)pose=ready;
  else if(t<T.pass1-.25)pose=blendPose(ready,HOLD,sm(T.hold-.4,T.hold,t,easeIO));
  else if(t<T.turn0)pose=blendPose(HOLD,RECV,sm(T.pass1-.25,T.pass1,t,easeIO));
  else if(t<T.turn1){pose=keyPoses(t,[[T.turn0,RECV],[lerp(T.turn0,T.turn1,.5),TURN],[T.turn1,strike(.26,{foot:'r'})]]);yaw=lerp(0,YAW_S,sm(T.turn0,T.turn1,t,easeIO));}
  else{pose=strike(strikeT(t),{foot:'r'});yaw=YAW_S;const c=sm(inn+.4,inn+.9,t,easeIO);if(c>0){pose=blendPose(pose,celebrate((t-inn-.4)*1.1,{kind:'arms'}),c);yaw=lerp(YAW_S,YAW_S+1.9,c);}}
  // hold pressure: tiny rocking into the defender while he holds
  const push=t>T.hold&&t<T.turn0?.03*Math.sin(t*7):0;
  const fwd=t>T.hit?.25*sm(T.hit,T.hit+.6,t,easeOut):0;
  return{pose,yaw,u:P0[0]+push-fwd,v:P0[1]};};
 const def:LGen=t=>{
  const close=sm(0,T.hold,t,easeOut),lu=Number.isFinite(T.lean)?key(t,[[T.lean-.05,0],[T.lean+.45,.55],[T.turn1,.62],[T.turn1+.9,.85]],linear):0;
  let pose=blendPose(backpedal(t*1.2),PRESS,sm(T.hold-.6,T.hold,t,easeIO));
  if(Number.isFinite(T.lean))pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T.lean-.1,T.lean+.2,t,easeIO));
  const late=sm(T.turn1-.1,T.turn1+.7,t,easeIO);
  if(late>0)pose=blendPose(pose,posed({lHipF:40,rHipF:20,lKnee:56,rKnee:44,lean:22,neckY:-50,lShA:40,rShA:36,lElb:50,rElb:50,twist:-20}),late*.7);
  const shift=Number.isFinite(T.lean)?.36*sm(T.lean,T.lean+.4,t,easeIO):0;
  return{pose,yaw:-late*1.3,u:D0[0]-.9*(1-close),v:D0[1]+shift};};
 const gk:LGen=t=>{const d=sm(T.hit+.02,T.hit+.55,t,linear);let pose=keeperSet(t*1.3);if(d>0)pose=keeperDive(Math.min(.95,.3+d*.65),{side:'r'});
  pose=blendPose(pose,posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:14,neckP:44,lShA:12,rShA:12,lElb:30,rElb:30}),0);return{pose,yaw:0,u:.62,v:.08};};
 // the ball
 const soleAt=(t:number):[number,number]=>{const{sk,J}=jointsL(piv(t)),toe=J(sk.rToe),heel=J(sk.rHeel);return[lerp(heel[0],toe[0],.66),lerp(heel[2],toe[2],.66)];};
 let RB:[number,number]|null=null;
 const ballF=(t:number)=>{
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
/** a ball drawn on stage st through frame fr, with its floor shadow (a flying ball smears back along its flight from the shot) */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:{u:number;y:number;v:number;flying:boolean;spin:number},seed:number,min=9,from:[number,number]=SHOT){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R),o=fp(st,fr,from[0],from[1],BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?.45:0,dir:Math.atan2(p[1]-o[1],p[0]-o[0])});return{p,r};
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** the pivot's chest (the passage enters his striped shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
/** the joint of the pivot on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:'lEl'|'lHa'|'lSh'|'chest'|'pelvis'|'rToe'|'head'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];

// ================= chapter 1 — LIVE: the 1999 final in Granada. Only confirmed things: the arena, the two teams, Eremenko the pivot, the
// scoreboard at 3–3, then (a whip pan, a cut in time) the documented moment — Eremenko scoring Russia's winning shoot-out penalty — and
// Russia's players running to him. No open-play goal, pass or tackle of the match is staged. =================
const C1={gra:A(0,'Granada'),eur:A(0,'European'),rus:A(0,'Russia against'),kon:A(0,'Konstantin'),tall:A(0,'tall'),top:A(0,'top scorer'),three:A(0,'three all'),
 pens:A(0,'penalties'),sc:A(0,'Eremenko scores'),champ:A(0,'champions'),end:AUTH[0].seconds};
/** the whip pan (a cut in time): the halfway line → the shoot-out's last kick at the goal on the left */
const W0=C1.pens-.1,W1=W0+.26,WM=(W0+W1)/2;
/** KT: his boot meets the ball (on "scores"); INN: the ball is in the net */
const KT=C1.sc+.5,INN=KT+.3;
/** the two lines of players in the centre circle during the shoot-out (local u from the goal line; halfway = 20); Eremenko is Russia's first */
const LINE_RUS:[number,number][]=[[19.7,1.3],[20.9,1.4],[22.1,1.2],[23.3,1.4]];// Eremenko, then three team-mates (white)
const LINE_ESP:[number,number][]=[[20.3,-1.2],[21.5,-1.3],[22.7,-1.1],[23.9,-1.3]];// Spain (red)
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** the 6 m penalty mark and where the kick goes (inferred: low, to the keeper's left; the keeper goes the other way) */
const SPOT:[number,number]=[6,0],PTG:V3=[-.12,.36,1.02];
const YAW_K=yawTo(PTG[0]-SPOT[0],PTG[2]-SPOT[1]);
/** where he stands at contact so the right boot meets the ball on the spot */
const EPOS:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD,{yaw:YAW_K}),toe=sk.rToe;return[SPOT[0]-toe[0]-Math.cos(YAW_K)*.1,SPOT[1]+toe[2]-Math.sin(YAW_K)*.1];})();
/** a short futsal run-up: from behind and to his left */
const RUN0:[number,number]=[EPOS[0]+2.1,EPOS[1]-.9];
/** the celebration: he runs back up the court, his team-mates run in from the halfway line; they meet at MEET */
const MEET:[number,number]=[11.6,.9];
const kickT=(T:number)=>key(T,[[KT-1,0],[KT-.42,.22],[KT,STRIKE_CONTACT],[KT+.5,.82],[KT+1,.95]],linear);
const liveE:LGen=T=>{
 if(T<WM)return{pose:idle(T,0),yaw:Math.PI,u:LINE_RUS[0][0],v:LINE_RUS[0][1]};
 if(T<KT-1){const b=Math.sin((T-WM)*3)*.5+.5;return{pose:blendPose(stand(),posed({lHipF:10,rHipF:14,lKnee:18,rKnee:22,lean:14,neckP:18,lShA:12,rShA:12,lElb:24,rElb:24}),.5+.3*b),yaw:YAW_K,u:RUN0[0],v:RUN0[1]};}
 if(T<KT+1.05){const w=sm(KT-1,KT-.42,T,easeIn);return{pose:strike(kickT(T),{foot:'r'}),yaw:YAW_K,u:lerp(RUN0[0],EPOS[0],w),v:lerp(RUN0[1],EPOS[1],w)};}
 // the celebration: turn and run back toward his team-mates, arms out, then arms up where they meet
 const go=sm(KT+1.05,KT+2.5,T,easeOut),yw=lerp(YAW_K,yawTo(MEET[0]-EPOS[0],MEET[1]-EPOS[1]),sm(KT+1.05,KT+1.35,T,easeIO));
 const pose=go<.92?blendPose(strike(.95,{foot:'r'}),celebrate((T-KT-1.05)*1.2,{kind:'run'}),sm(KT+1.05,KT+1.3,T,easeIO)):celebrate((T-KT-2.5)*1.1+.2,{kind:'arms'});
 return{pose,yaw:go<.92?yw:yw+.6*Math.sin((T-KT)*1.3),u:lerp(EPOS[0],MEET[0],go),v:lerp(EPOS[1],MEET[1],go)};};
/** Russia's team-mates (i = 1..3): wait in the line, then sprint to him and jump, arms up */
const liveRus=(i:number):LGen=>T=>{const a=LINE_RUS[i];if(T<INN+.1)return{pose:idle(T,i*.31),yaw:Math.PI,u:a[0],v:a[1]};
 const go=sm(INN+.1,INN+2.4,T,easeOut),tgt:[number,number]=[MEET[0]+[.9,1.1,-.4][i-1],MEET[1]+[.8,-.7,1.2][i-1]],u=lerp(a[0],tgt[0],go),v=lerp(a[1],tgt[1],go);
 return{pose:go<.94?celebrate((T-INN)*1.25+i*.3,{kind:'run'}):celebrate((T-INN)*1.1+i*.4,{kind:'arms'}),yaw:go<.94?yawTo(tgt[0]-a[0],tgt[1]-a[1]):yawTo(MEET[0]-u,MEET[1]-v),u,v};};
/** Spain's players: wait in the line; after the kick, hands on knees */
const SAD=posed({lHipF:40,rHipF:40,lKnee:40,rKnee:40,lean:52,neckP:30,lShF:40,rShF:40,lShA:10,rShA:10,lElb:20,rElb:20});
const liveEsp=(i:number):LGen=>T=>{const a=LINE_ESP[i],d=sm(INN+.3,INN+1,T,easeIO);return{pose:blendPose(idle(T,.5+i*.29),SAD,d),yaw:Math.PI+d*(.3-i*.2),u:a[0],v:a[1]};};
/** Spain's keeper: set on his line; dives to HIS right (the other way) as the ball goes to his left */
const liveGK:LGen=T=>{const d=sm(KT-.06,KT+.45,T,linear);let pose=keeperSet(T*1.3);if(d>0)pose=keeperDive(Math.min(.95,.3+d*.65),{side:'r'});
 const lie=sm(INN+.5,INN+1.3,T,easeIO);if(lie>0)pose=blendPose(pose,keeperDive(.95,{side:'r'}),lie);return{pose,yaw:0,u:.55,v:-.9*sm(KT-.06,KT+.4,T,easeOut)};};
/** the kick: on the spot until contact, then low and hard to the keeper's left, then drops in the net */
const liveBall=(T:number)=>{
 if(T<KT)return{u:SPOT[0],y:BALL_R,v:SPOT[1],flying:false,spin:0};
 if(T<INN){const u=sm(KT,INN,T,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M=[lerp(SPOT[0],PTG[0],.5),.4,lerp(SPOT[1],PTG[2],.5)];
  return{u:a*SPOT[0]+b*M[0]+c*PTG[0],y:a*BALL_R+b*M[1]+c*PTG[1],v:a*SPOT[1]+b*M[2]+c*PTG[2],flying:true,spin:20+u*30};}
 const d=sm(INN+.05,INN+.35,T,easeIn),bo=Math.abs(Math.sin(sm(INN+.35,INN+1.1,T)*Math.PI*2))*.1*(1-sm(INN+.35,INN+1.1,T));
 return{u:-.62,y:lerp(PTG[1],BALL_R,d)+bo,v:PTG[2]+.05,flying:false,spin:50};};
const liveCam=(T:number)=>({x:key(T,mono([[0,2.6],[C1.kon,.9],[C1.top,.8],[C1.three,1.6],[W0,1.8],[W1,-16],[KT-.3,-16.3],[KT+.9,-14.4],[C1.champ,-11],[C1.end,-10.4]]),easeInOutSine),
 zoom:key(T,mono([[0,.58],[C1.eur,.62],[C1.kon+.2,.92],[C1.tall,1.02],[C1.top+.3,.98],[C1.three,.74],[W0,.74],[W1,.76],[KT-.3,.78],[KT+1,.8],[C1.champ,.84],[C1.end,.88]]),easeInOutSine),
 y:key(T,mono([[0,1040],[C1.kon+.2,990],[C1.tall,960],[C1.three,1020],[W1,980],[KT+1,1000],[C1.end,980]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'2':[0,2,3,4,6],'3':[0,2,3,5,6],'4':[1,2,3,5]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** the scoreboard above the boards: Russia (blue tab) 3–3 Spain (red tab); `pens` adds the shoot-out row (e.g. '3-2', then '4-2'); `ring` = a
 * yellow highlight round it on "three all" */
function scoreboard(s:Sheet,st:Stage,camX:number,pens:string|null,ring:number){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=(pens?2.5:1.8)*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=1.8*kw*.62,y=top-H+1.8*kw*.19;
 const tab=(ink:string,x:number)=>{const p=new Path2D();p.rect(x,top-H+kw*.1,W*.16,kw*.13);s.fill(ink,p);};tab(B,cx-W*.38);tab(R,cx+W*.22);
 digit(lit,'3',cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,'3',cx+W*.3-h*.55,y,h);
 if(pens){const ph=h*.42,py=top-kw*.62;digit(lit,pens[0],cx-W*.12-ph*.55,py,ph);digit(lit,pens[2],cx+W*.12,py,ph);const brk=new Path2D();brk.rect(cx-ph*.12,py+ph*.44,ph*.24,ph*.12);lit.addPath(brk);}
 s.fill(Y,lit);
 if(ring>.02){const m=16*ring+6,q=handCut([[cx-W/2-m,top-H-m],[cx+W/2+m,top-H-m],[cx+W/2+m,top+m],[cx-W/2-m,top+m]],133,4,60);const rp=ribbon([...q,q[0]],10,{seed:134,close:true,wobble:1});s.knockout(rp);s.fill(Y,rp,ring);}
}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const phase=T<WM?0:1,goal=T>=INN;
 courtSide(s,st,T,{flags:true,cheer:phase===0?.12+.25*pulse(T,C1.eur,1.4):goal?.9+.1*sm(C1.champ,C1.champ+.4,T):.05,flash:pulse(T,C1.gra,1.3)+(goal?pulse(T,INN,1.2)+.7*pulse(T,C1.champ,1.4):0),
  bulge:.55*sm(INN-.1,INN,T)*(1-.6*sm(INN+.3,INN+1.2,T))+.1*settle(T,INN,{amp:1,freq:3,decay:3}),bv:PTG[2],by:PTG[1],
  keeper:()=>{if(phase===1)athlete(s,st,FA,liveGK,T,ESP_GK,{detail:'mid'});}},FA);
 scoreboard(s,st,c.x,phase===1?(T<INN+.25?'3-2':'4-2'):null,pulse(T,C1.three,1.6));
 const items:Item[]=[];
 LINE_ESP.forEach((_,i)=>{const g=liveEsp(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,ESP(i),{detail:'low'})});});
 [1,2,3].forEach(i=>{const g=liveRus(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,RUS(i),{detail:'mid'})});});
 const e=liveE(T),[EX,EZ]=toStage(FA,e.u,e.v),kick=T>KT-.2&&T<KT+.25;
 items.push({z:EZ-.02,draw:()=>athlete(s,st,FA,liveE,T,EREM,{detail:'mid',smear:kick?.1:0})});
 const b=liveBall(T);
 if(phase===1)items.push({z:T<KT?toStage(FA,b.u,b.v)[1]+.01:depth(FA,b),draw:()=>{drawBallL(s,st,FA,b,18,9,SPOT);if(T>=KT&&T<KT+.3){const p=fp(st,FA,SPOT[0],SPOT[1],.2);sparkBurst(s,Y,p[0],p[1],100,{n:9,seed:19,g:easeOut(sm(KT,KT+.22,T))});}}});
 // "Russia against Spain": a blue dashed line under Russia's players, a red one under Spain's
 if(phase===0){const r1=sm(C1.rus,C1.rus+.5,T,easeOut)*(1-sm(C1.kon-.2,C1.kon+.2,T)),r2=sm(C1.rus+.6,C1.rus+1.1,T,easeOut)*(1-sm(C1.kon-.2,C1.kon+.2,T));
  if(r1>.02)items.push({z:EZ+3,draw:()=>dashed(s,B,[fp(st,FA,19.1,2.2),fp(st,FA,21.5,2.3),fp(st,FA,23.9,2.2)],16,41,{dash:46,progress:r1})});
  if(r2>.02)items.push({z:EZ+3,draw:()=>dashed(s,R,[fp(st,FA,19.7,-2.1),fp(st,FA,22.1,-2.2),fp(st,FA,24.5,-2.1)],16,42,{dash:46,progress:r2})});
  // "Konstantin": a dashed ring under him
  const g=easeOutBack(sm(C1.kon,C1.kon+.35,T))*(1-sm(W0-.3,W0,T));if(g>.02)items.push({z:EZ+.9,draw:()=>{floorDashRing(s,st,K,EX,EZ,1.05,22,50,g);floorDashRing(s,st,R,EX,EZ,1.05,14,51,g);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 if(phase===0){
  // "tall pivot": a yellow measuring bracket from the floor to the top of his head (1.90 m)
  const tb=sm(C1.tall,C1.tall+.5,T,easeOut)*(1-sm(C1.three-.2,C1.three+.2,T));
  if(tb>.02){const g0=proj(st,EX+.75,0,EZ),hd=jointPt(st,FA,e,'head'),top=proj(st,EX+.75,1.98,EZ),w=kAt(st,EZ)*.16,y1=lerp(g0[1],top[1],tb);
   cased(s,[[g0[0],g0[1]],[g0[0],y1]],10,55,{dash:26});const cap=ribbon([[g0[0]-w,y1],[g0[0]+w,y1]],10,{seed:56,taper:0,wobble:.5});s.knockout(cap);s.fill(Y,cap);void hd;}
  // "top scorer": a burst of yellow sparks over his head
  const ts=sm(C1.top,C1.top+.3,T,easeOut)*(1-sm(C1.top+1.1,C1.top+1.5,T));if(ts>.02){const hd=jointPt(st,FA,e,'head');sparkBurst(s,Y,hd[0],hd[1]-kAt(st,EZ)*.35,kAt(st,EZ)*.55,{n:10,seed:57,g:ts});}}
 // the shot line (dashed yellow) as the ball goes; a burst in the net
 if(phase===1&&T>KT){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=liveBall(lerp(KT,Math.min(T,INN),k/14));pts.push(fp(st,FA,q.u,q.v,q.y));}cased(s,pts,10,58,{dash:36});}
 if(T>=INN&&T<INN+1.2){const p=fp(st,FA,PTG[0]-.2,PTG[2],PTG[1]);sparkBurst(s,Y,p[0],p[1],140,{n:12,seed:59,g:easeOut(sm(INN,INN+.3,T))*(1-sm(INN+.8,INN+1.2,T))});}
 // the whip pan: yellow speed lines sweep across the frame (a cut in time)
 if(Tc>=W0&&Tc<W1){const u=sm(W0,W1,Tc),a=Math.sin(u*Math.PI),c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
 // "champions of Europe": confetti in Russia's colours
 if(T>C1.champ-.1){const u=sm(C1.champ-.1,C1.champ+3,T,linear),top=proj(st,c.x,4,BOARDS)[1],x0=proj(st,c.x-9,0,10)[0],x1=proj(st,c.x+9,0,10)[0];confetti(s,[B,R,Y,'paper'],[x0,top-200+u*500,x1-x0,420],26,Math.floor(T*6),{size:16});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FA,liveE(tt),.14));},still:C1.tall+.3};

// ================= chapter 2 — HOW HE DOES IT (a labelled demonstration, real time, side-on from the main stand, the goal on the RIGHT):
// receive with the back to goal, feel the defender, wait for the lean, spin the other way, shoot =================
const C2={pivots:A(1,'Pivots'),back:A(1,'back to'),how:A(1,'This is'),takes:A(1,'takes'),feels:A(1,'feels'),leans:A(1,'defender leans'),turns:A(1,'turns'),shoots:A(1,'shoots'),end:AUTH[1].seconds};
const T2:TurnT={pass0:C2.takes-.25,pass1:C2.takes+.45,hold:C2.takes-.05,lean:C2.leans,turn0:C2.turns+.05,turn1:C2.turns+.62,hit:Math.max(C2.turns+.84,C2.shoots),from:[11.5,-5.2]};
const turn2=makeTurn(T2);
const st2=(_t:number):Stage=>({F:3000,eye:2.6,cx:17.2,cz:-.4});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(tt),inn=turn2.inn,hit=pulse(t,T2.hit,.35);
  camPath(s,t,[[0,-120,420,.62],[C2.back,-60,440,.64],[C2.how,-380,390,.84],[C2.takes,-560,350,1.02],[C2.feels,-680,330,1.24],[C2.leans,-680,330,1.22],[C2.turns,-420,370,.84],[T2.hit,-160,400,.68],[inn+.6,-40,420,.64],[C2.end,-60,420,.66]],[5*hit*Math.sin(t*80),0]);
  const goal=tt>=inn;
  courtSide(s,st,tt,{cheer:goal?.6:0,flash:pulse(tt,inn,1.2),bulge:.5*sm(inn-.1,inn,tt)*(1-.6*sm(inn+.3,inn+1.2,tt))+.1*settle(tt,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FR,turn2.gk,tt,DEMO_GK,{detail:'mid'});}},FR);
  const piv=turn2.piv(tt),df=turn2.def(tt),[,PZ]=toStage(FR,piv.u,piv.v);
  // "back to goal": a dashed yellow arrow from his back to the goal
  const bk=easeOut(sm(C2.back,C2.back+.6,tt))*(1-sm(C2.takes-.3,C2.takes+.1,tt));
  if(bk>.02){const pts=[fp(st,FR,piv.u-.8,piv.v-.6),fp(st,FR,piv.u-2.6,piv.v-.8),fp(st,FR,1.2,-.4)];cased(s,pts,12,201,{dash:40,progress:bk});if(bk>.9)casedHead(s,pts,36,202);}
  // "takes the pass": the pass line (dashed yellow) from off the court to his sole
  const pl=sm(T2.pass0-.1,T2.pass0+.3,tt,easeOut)*(1-sm(T2.pass1+.2,T2.pass1+.6,tt));
  if(pl>.02){const pts=[fp(st,FR,T2.from[0],T2.from[1]),fp(st,FR,lerp(T2.from[0],P0[0],.5),lerp(T2.from[1],P0[1],.5)),fp(st,FR,P0[0]+.2,P0[1]-.5)];cased(s,pts,11,208,{dash:36,progress:pl});}
  // "turns the other way": a yellow spin arc on the floor (to his right)
  const sp=sm(C2.turns-.1,C2.turns+.4,tt,easeOut)*(1-sm(T2.hit+.3,T2.hit+.8,tt));
  if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=-.3-k/14*2.6;pts.push(fp(st,FR,P0[0]+Math.cos(a)*1.45,P0[1]+Math.sin(a)*1.45));}cased(s,pts,12,203,{dash:34,progress:sp});if(sp>.9)casedHead(s,pts,32,204);}
  // "defender leans": a red arrow from the defender toward his lean
  const la=sm(C2.leans,C2.leans+.5,tt,easeOut)*(1-sm(T2.hit,T2.hit+.5,tt));
  if(la>.02){const pts=[fp(st,FR,D0[0],D0[1]+.3),fp(st,FR,D0[0]-.1,D0[1]+1),fp(st,FR,D0[0]-.2,D0[1]+1.8)];const q=partial(pts,la),rp=ribbon(q,12,{seed:205,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(la>.6)arrowHead(s,R,q,30,206);}
  // the shot line (dashed yellow) as the ball goes
  if(tt>T2.hit){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=turn2.ball(lerp(T2.hit,Math.min(tt,inn),k/14));pts.push(fp(st,FR,q.u,q.v,q.y));}cased(s,pts,10,207,{dash:36});}
  const b=turn2.ball(tt);
  const items:Item[]=[
   {z:depth(FR,df),draw:()=>athlete(s,st,FR,turn2.def,tt,DEMO_D,{detail:'high'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FR,turn2.piv,tt,EREM_DEMO,{detail:'high',smear:(tt>T2.turn0&&tt<T2.turn1+.05)||(tt>T2.hit-.15&&tt<T2.hit+.2)?.14:0})},
   {z:tt<T2.hit&&tt>=T2.pass1?PZ-.01:depth(FR,b),draw:()=>{drawBallL(s,st,FR,b,211);if(tt>=T2.hit&&tt<T2.hit+.35){const p=fp(st,FR,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],110,{n:9,seed:212,g:easeOut(sm(T2.hit,T2.hit+.25,tt))});}}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "feels the defender": a red ring round the arm that feels him, and yellow pulse rings at the hand
  if(tt>=C2.feels&&tt<T2.turn0+.1){const e=jointPt(st,FR,piv,'lEl'),h=jointPt(st,FR,piv,'lHa'),g=easeOutBack(sm(C2.feels,C2.feels+.35,tt))*(1-sm(T2.turn0-.2,T2.turn0+.1,tt)),c:Pt=[(e[0]+h[0])/2,(e[1]+h[1])/2],r=kAt(st,PZ)*.34*g;
   if(g>.02)s.fill(R,ribbon(blob(c[0],c[1],r,r*.8,221,{n:22}),9,{seed:222,close:true,wobble:1}),1);
   const fe=pulse(tt,C2.feels+.25,.9);if(fe>.05)for(let k=0;k<2;k++){const rr=kAt(st,PZ)*(.14+.22*k+.2*(1-fe));s.fill(Y,ribbon(blob(h[0],h[1],rr,rr,224+k,{n:18}),6,{seed:226+k,close:true,wobble:.8}),fe);}}
  if(tt>=inn&&tt<inn+1.2){const p=fp(st,FR,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],140,{n:12,seed:230,g:easeOut(sm(inn,inn+.3,tt))*(1-sm(inn+.8,inn+1.2,tt))});}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2(tt),FR,turn2.piv(tt),.13));},
 still:C2.feels+.3,
};
// ================= chapter 3 — WATCH AGAIN (slow-motion replay of the demonstration, reverse angle: low, in front of him, the goal behind) =================
const C3={watch:A(2,'Watch'),back:A(2,'Back to'),feel:A(2,'feel the'),turn:A(2,'turn'),end:AUTH[2].seconds};
/** the replay re-uses the chapter 2 sequence, slowed and keyed to the words (sequence time = seq(t)) */
const seq3=(t:number)=>key(t,mono([[0,T2.hold-.5],[C3.back,T2.pass1-.1],[C3.feel,T2.lean-.1],[C3.turn,T2.turn0],[C3.turn+1.2,T2.hit+.02],[C3.turn+2.2,turn2.inn+.35],[C3.end,turn2.inn+1.3]]),linear);
const g3=(g:LGen):LGen=>t=>g(seq3(t));
const piv3=g3(turn2.piv),def3=g3(turn2.def),gk3=g3(turn2.gk);
const P0B=toStage(FB,P0[0],P0[1]);
const st3:Stage={F:1500,eye:1.25,cx:P0B[0]+1.2,cz:P0B[1]-4.6};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,q=seq3(tt),inn=turn2.inn,hit=pulse(q,T2.hit,.4);
  camPath(s,t,[[0,-120,110,1.02],[C3.back,-220,100,1.16],[C3.feel,-220,120,1.2],[C3.turn,-160,120,1.05],[C3.turn+1.2,-40,90,.94],[C3.turn+2.2,40,70,1],[C3.end,40,70,1.02]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  const goal=q>=inn;
  arena(s,st,tt,{cheer:goal?.8:0,flash:goal?pulse(q,inn,1.2):0,bulge:.55*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q))+.1*settle(q,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FB,gk3,tt,DEMO_GK,{detail:'mid'});}});
  const piv=piv3(tt),[,PZ]=toStage(FB,piv.u,piv.v);
  // "Back to goal": a dashed yellow arrow from his back to the goal behind him
  const bk=easeOut(sm(C3.back,C3.back+.5,tt))*(1-sm(C3.feel-.1,C3.feel+.3,tt));
  if(bk>.02){const pts=[fp(st,FB,piv.u-.7,piv.v-.5),fp(st,FB,piv.u-2.4,piv.v-.6),fp(st,FB,1.2,-.3)];cased(s,pts,13,305,{dash:38,progress:bk});if(bk>.9)casedHead(s,pts,36,306);}
  // "feel the lean": the red lean arrow from the defender
  const la=sm(C3.feel+.2,C3.feel+.8,tt,easeOut)*(1-sm(C3.turn+.8,C3.turn+1.3,tt));
  if(la>.02){const pts=[fp(st,FB,D0[0],D0[1]+.3),fp(st,FB,D0[0]-.1,D0[1]+1),fp(st,FB,D0[0]-.2,D0[1]+1.7)];const qq=partial(pts,la),rp=ribbon(qq,13,{seed:307,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(la>.6)arrowHead(s,R,qq,32,308);}
  // the spin arc (yellow) on "turn"; the shot line as the ball goes
  const sp=sm(C3.turn-.1,C3.turn+.5,tt,easeOut)*(1-sm(C3.turn+2,C3.turn+2.5,tt));
  if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=-.3-k/14*2.6;pts.push(fp(st,FB,P0[0]+Math.cos(a)*1.05,P0[1]+Math.sin(a)*1.05));}cased(s,pts,13,301,{dash:36,progress:sp});if(sp>.9)casedHead(s,pts,36,302);}
  if(q>T2.hit){const pts:Pt[]=[];for(let k=0;k<=14;k++){const bb=turn2.ball(lerp(T2.hit,Math.min(q,inn),k/14));pts.push(fp(st,FB,bb.u,bb.v,bb.y));}cased(s,pts,12,303,{dash:40});}
  const b=turn2.ball(q);
  const items:Item[]=[
   {z:depth(FB,def3(tt)),draw:()=>athlete(s,st,FB,def3,tt,DEMO_D,{detail:'mid'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FB,piv3,tt,EREM_DEMO,{detail:'high',smear:(q>T2.turn0&&q<T2.turn1+.1)||(q>T2.hit-.2&&q<T2.hit+.2)?.5:0})},
   {z:q<T2.hit&&q>=T2.pass1?PZ-.01:depth(FB,b),draw:()=>{drawBallL(s,st,FB,b,311,10);if(q>=T2.hit&&q<T2.hit+.35){const p=fp(st,FB,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],120,{n:9,seed:312,g:easeOut(sm(T2.hit,T2.hit+.25,q))});}}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "feel": the red ring on the arm that feels the defender
  const ar=easeOutBack(sm(C3.feel,C3.feel+.35,tt))*(1-sm(C3.turn-.2,C3.turn+.1,tt));
  if(ar>.02){const e=jointPt(st,FB,piv,'lEl'),h=jointPt(st,FB,piv,'lHa'),c:Pt=[(e[0]+h[0])/2,(e[1]+h[1])/2],r=kAt(st,PZ)*.3*ar;s.fill(R,ribbon(blob(c[0],c[1],r,r*.85,321,{n:22}),10,{seed:322,close:true,wobble:1}),1);}
  if(q>=inn&&q<inn+1.2){const p=fp(st,FB,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:330,g:easeOut(sm(inn,inn+.3,q))*(1-sm(inn+.8,inn+1.2,q))});}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,FB,piv3(tt),.13));},
 still:C3.turn+.25,
};

// ================= chapter 4 — YOUR TURN: he runs the move again; three cards (receive, the lean, turn); a tick =================
const C4={your:A(3,'Your'),rec:A(3,'receive'),back:A(3,'back to'),turn:A(3,'turn when'),leans:A(3,'defender leans'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T2.hold-.6],[C4.rec,T2.pass0],[C4.back,T2.pass1+.1],[C4.turn,T2.lean-.05],[C4.leans,T2.turn0],[C4.leans+.9,T2.hit+.02],[C4.end,turn2.inn+1.5]]),linear);
const g4=(g:LGen):LGen=>t=>g(seq4(t));
const piv4=g4(turn2.piv),def4=g4(turn2.def),gk4=g4(turn2.gk);
const st4:Stage={F:1500,eye:1.6,cx:P0B[0]+1.3,cz:P0B[1]-6.2};
type CardKind='receive'|'lean'|'turn';
const CARD_Y=760,CARD_W=175,CARDS:[number,number,CardKind][]=[[-420,C4.rec,'receive'],[0,C4.leans,'lean'],[420,C4.leans+.4,'turn']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,q=seq4(tt),inn=turn2.inn;
  camPath(s,t,[[0,-80,160,1.05],[C4.your+.4,0,350,.92],[C4.turn,0,350,.92],[C4.leans+.4,0,340,.92],[C4.end,0,335,.93]]);
  const goal=q>=inn;
  arena(s,st,tt,{cheer:goal?.9*(1-sm(C4.end-1,C4.end,tt)):0,flash:goal?pulse(q,inn,1.2):0,bulge:.5*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q)),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FB,gk4,tt,DEMO_GK,{detail:'mid'});}});
  const piv=piv4(tt),[,PZ]=toStage(FB,piv.u,piv.v),b=turn2.ball(q);
  const items:Item[]=[
   {z:depth(FB,def4(tt)),draw:()=>athlete(s,st,FB,def4,tt,DEMO_D,{detail:'mid'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FB,piv4,tt,EREM_DEMO,{detail:'high',smear:q>T2.turn0&&q<T2.turn1+.05?.2:0})},
   {z:q<T2.hit&&q>=T2.pass1?PZ-.01:depth(FB,b),draw:()=>{drawBallL(s,st,FB,b,411,10);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Your turn"; each prints its step as it is said (receive, the defender's lean, turn)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+150;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+10,y:gy+25,height:360*(.9+.1*on),azimuth:kind==='receive'?-90:kind==='lean'?90:20,elevation:14,fov:18,at:[0,0,0]});
    const pose=kind==='receive'?RECV:kind==='lean'?blendPose(PRESS,lunge(.55,{side:'l'}),.8):TURN;
    const csk=solve(pose,kind==='lean'?{height:1.82,bulk:1.05}:BUILD,{}),P=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    // the step's diagram: receive = the ball under his sole; lean = a red arrow the way the defender leans; turn = a yellow spin arc
    if(kind==='turn'){const pts:Pt[]=[];for(let k=0;k<=10;k++){const a=k/10*2.4;pts.push(P([Math.cos(a)*.7,0,Math.sin(a)*.7]));}dashed(s,Y,pts,8,85,{dash:22});arrowHead(s,Y,pts,22,86);}
    if(kind==='lean'){const p0=P([0,1.1,0]),p1=P([0,1.1,.9]),pts:Pt[]=[p0,L2(p0,p1,.5),p1];const rp=ribbon(pts,9,{seed:87,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);arrowHead(s,R,pts,24,88);}
    drawAthlete(s,pose,fc,{...(kind==='lean'?DEMO_D:EREM_DEMO),detail:'mid',shadow:[K,.2]},{},{prev:pose});
    if(kind==='receive'){const toe=csk.rToe,heel=csk.rHeel,tb:V3=[lerp(heel[0],toe[0],.66),BALL_R,lerp(heel[2],toe[2],.66)],p0=P(tb),bR=BALL_R*(fc.scale?fc.scale(tb):100);ball(s,p0[0],p0[1],bR,81+i);
     const e=P(csk.lEl),h=P(csk.lHa),c:Pt=[(e[0]+h[0])/2,(e[1]+h[1])/2];s.fill(R,ribbon(blob(c[0],c[1],30*on,24*on,90+i,{n:18}),6,{seed:93+i,close:true,wobble:1}),1);}
    s.restore();});
   s.fill(K,frames);}
  // "defender leans" → he turns: a big tick (yellow over red, navy echo) stamps beside him
  const tick=easeOutBack(sm(C4.leans+.9,C4.leans+1.25,tt));
  if(tick>.02){const g=fp(st,FB,piv.u,piv.v),h=kAt(st,PZ)*1.8,c:Pt=[g[0]+h*.62,g[1]-h*.8],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.turn+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'eremenko-futsal-signature',format:'futsal',title:'Eremenko’s pivot turn',theme:'Receive with your back to goal, then turn when the defender leans.',
 ageNote:'For players aged 7–12: the 1999 final and Eremenko’s winning penalty are real; the pivot turn is shown as a demonstration. Use your arm to feel, not to push.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in and stops under a sole; a curved spin arrow flicks round it; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const roll=sm(0,.3,age,easeOut),bx=x-140*(1-roll);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:(roll-1)*6});
  const sp=sm(.3,.7,age,easeOut)*(1-sm(.9,1.2,age));if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const a=-.4-k/12*3.4*sp;pts.push([x+Math.cos(a)*r*1.9,y+Math.sin(a)*r*1.2]);}s.fill(Y,ribbon(pts,10,{seed,taper:.3,wobble:1}),1);s.fill(B,ribbon(pts.map(p=>[p[0]+4,p[1]+4] as Pt),4,{seed:seed+1,taper:.3,wobble:1}),.6);}
 },
};
export default film;
