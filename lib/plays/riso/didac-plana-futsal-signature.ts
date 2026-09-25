/** Dídac Plana — "the spectacular reflex save": a signature-move riso film (iconic plays, FUTSAL goleiro).
 *
 * WHY THIS MOMENT: Dídac Plana's entry (lib/town/iconicPlays.json) is a signature — the reflex save — not one match. No written source we
 * could reach describes ONE dated Plana save (UEFA's match pages are script-rendered; the UEFA final report names the goals, not the saves),
 * so the film follows the brief's fallback: chapter 1 is the REAL, documented match he played in goal — the UEFA Futsal EURO 2026 final,
 * Portugal 3–5 Spain, 7 Feb 2026, Arena Stožice, Ljubljana (UEFA line-up: "Spagna: Didac Plana (GK) …") — and it shows ONLY confirmed
 * things: the arena, the 5–3 result, Spain celebrating. No save, shot or pass is staged inside that final. The save itself lives in two
 * clearly labelled demonstration chapters ("This is how he saves"; labels "(demo)") against a neutral training-kit shooter.
 * (Moment choice: the other Barcelona films (Ferrão, Pito) use Barcelona club finals, so this film uses Plana's Spain final.)
 *  1  LIVE (broadcast camera, main stand): the 2026 final is won — Spain's players run to celebrate with Plana; Portugal heads drop;
 *     the 5–3 headline and confetti. Nobody plays the ball.
 *  2  HOW HE SAVES — DEMONSTRATION (slow motion, low, behind the shooter): on his toes, knees soft, hands ready; a close shot; the right
 *     leg snaps out; blocked.
 *  3  FROM BEHIND HIM — DEMONSTRATION (net camera, real time): so close there is no time to dive — quick feet, quick hands.
 *  4  THE LESSON (entry `lesson`: "Stay on your toes so you can react fast to shots from close range"): he bounces on his toes, a close
 *     flick from a friend, a fast block, a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - UEFA.com, "Finale UEFA Futsal EURO 2026: Portogallo - Spagna 3-5" (7 Feb 2026; uefa-futsaleuro-2026-final.txt):
 *    https://www.uefa.com/futsaleuro/news/02a2-1fdf1b047fd6-346089e7ed31-1000--finale-uefa-futsal-euro-2026-portogallo-spagna-3-5/
 *    — Spain win 5–3 at the Arena Stožice, Ljubljana; Antonio Pérez hat-trick (78 s, before half-time, 35'), José Raya 2–0, Afonso Jesus and
 *    Rúben Góis level at 2–2, Pauleta 3–3, Adolfo closes it; line-ups: Portugal Bernardo Paçó (GK), Tomás Paçó, Erick, Bruno Coelho,
 *    Pany Varela; Spain Didac Plana (GK), Antonio Pérez, Pablo Ramirez, Francisco Cortés, Mellado.
 *  - Wikipedia, "Dídac Plana" (raw, fetched Sep 2026; wiki-didac-plana.txt): goalkeeper, FC Barcelona and Spain, 1.79 m, born 1990;
 *    part of the Spain squad that won UEFA Futsal Euro 2026; UEFA Futsal Champions League 2019–20 and 2021–22.
 *    https://en.wikipedia.org/wiki/D%C3%ADdac_Plana
 *  - Wikipedia, "2019–20 UEFA Futsal Champions League" and "2021–22 …" (raw): the Barcelona finals (checked, not used — see above).
 * CONFIRMED: the match (Futsal EURO 2026 final), date, venue, Portugal v Spain, the 5–3 Spain win, Plana starting in goal for Spain,
 *  his height; futsal court and goal sizes (40 × 20 m, 3 × 2 m goals).
 * INFERRED / DEMONSTRATION (not named in the narration): chapters 2–4 are a demonstration (a representative close-range reflex block —
 *  no dated Plana save could be sourced; the shooter wears a neutral training kit); in chapter 1, where each player stood at the whistle
 *  and who ran to whom; kits — Portugal (first-named, "home") in red shirts / navy shorts / red socks,
 *  Spain in a white change strip with navy shorts, Plana in a yellow keeper top with long sleeves and navy long legs (the athlete library
 *  has no trousers: navy shorts + navy socks); the blue court; which end; Plana's shirt number (not drawn); his short dark hair. No video
 *  was reviewed.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the leg snap and the strike). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 * z → −Z. The save is the keeper's RIGHT leg (`reflex()` below, authored from the library's keeper set); the shooter strikes right-footed.
 * Every ball target is solved from the skeleton (the boot the ball meets), so the ball and the leg always meet.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Plana's top, lights, diagram rings), red (Portugal, posts), blue (court), navy (key line, run-off, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,runCycle,runCadence,keeperSet,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill,type Build,type Skeleton} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; every cue starts with a plain word. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2026 final',text:'The 2026 Futsal Euro final: Spain against Portugal, with Dídac Plana in goal. Spain win, five goals to three! He is famous for lightning saves.',tail:1.8,
  cues:['The 2026','Spain against','with Dídac','Spain win','five goals','He is famous'],heads:{'The 2026':'Final 2026','five goals':'5–3'}},
 {label:'How he saves (demo)',text:'This is how he saves. He stays up on his toes, knees soft, hands ready. The shot comes, and he snaps out a leg. Blocked!',tail:2.0,
  cues:['This is how','on his toes','knees soft','hands ready','The shot comes','snaps out','Blocked'],heads:{'on his toes':'On his toes','Blocked':'Blocked!'}},
 {label:'From behind him (demo)',text:'From behind him: the ball is so close, there is no time to dive. Quick feet and quick hands win it.',tail:2.4,
  cues:['From behind','so close','no time','Quick feet','quick hands'],heads:{'no time':'No time to dive','Quick feet':'Quick feet'}},
 {label:'Stay on your toes',text:'Now you: stay on your toes, so you can react fast to shots from close range!',tail:2.6,
  cues:['Now you','stay on your toes','react fast','close range'],heads:{'stay on your toes':'On your toes','react fast':'React fast'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/didac-plana-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/didac-plana-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/didac-plana-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('didac: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('didac: no cue '+w);return c.at;};
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
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
/** a quadratic arc from a to c through the lifted midpoint (ball flights) */
const arc3=(a:V3,c:V3,lift:number,u:number):V3=>{const M:V3=[(a[0]+c[0])/2,(a[1]+c[1])/2+lift,(a[2]+c[2])/2],p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*M[0]+r*c[0],p*a[1]+q*M[1]+r*c[1],p*a[2]+q*M[2]+r*c[2]];};

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line; knocked out to paper first so the ink prints clean on the blue court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);void seed;}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
// facing, in our floor: FACE_RIGHT → his right side is −Z; FACE_CAMERA → his right is −X (screen left); FACE_AWAY → his right is +X
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.84],[R,.3]];
const KBUILD:Build={height:1.79,bulk:1};
/** Dídac Plana — Spain GK (UEFA line-up). Yellow keeper top, long sleeves, navy long legs, gloves (all inferred); 1.79 m; no number drawn */
const PLANA:AthleteStyle={shirt:Y,shorts:K,socks:K,boots:K,skin:SKIN,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',number:null,hairStyle:'short',build:KBUILD,seed:21};
const POR=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.78],[R,.3]],hair:K,line:K,trim:Y,hairStyle:n%3===1?'curly':'short',build:{height:1.72+hash(n,3)*.12,bulk:.98},seed:30+n});
const ESP=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.72],[R,.2]],hair:K,line:K,trim:R,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:50+n});
/** the demonstration shooter (chapters 2–3): a neutral paper/navy training kit — no team or player is claimed */
const PIVOT:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,number:null,hairStyle:'short',build:{height:1.8,bulk:1.04},seed:44};
/** the practice partner in the lesson (neutral paper/navy training kit) */
const FRIEND:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.62},seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
const skOf=(g:Gen,t:number,build:Build):Skeleton=>{const a=g(t);return solve(a.pose,build,placeAt(a.X,a.Z,a.yaw));};

// ---------------- the reflex save: the library keeper set → the right leg snaps out to the side, hands wide, weight dropping onto the left ----------------
const SET_D={lHipF:52,rHipF:52,lHipA:16,rHipA:16,lKnee:62,rKnee:62,lAnk:-6,rAnk:-6,lean:20,pitch:8,lShF:48,rShF:48,lShA:34,rShA:34,lElb:66,rElb:66,lShR:24,rShR:24,lHand:1,rHand:1,neckP:-12};
/** u 0 → 1: set → load (.3) → full block (.6: right leg long and low along the floor, boot turned up) → hold (1) */
function reflex(u:number):Pose{
 return keyPoses(clamp(u),[
  [0,posed(SET_D)],
  [.3,posed({...SET_D,lKnee:74,rKnee:52,rHipA:30,dz:.08,roll:6,lShA:48,rShA:52,neckY:-14,neckP:-4})],
  [.6,posed({dz:.36,roll:20,bend:10,lean:18,pitch:6,air:.02,rHipA:74,rHipF:14,rKnee:6,rAnk:-14,rHipR:34,lHipF:56,lHipA:20,lKnee:92,lAnk:-4,lShA:82,rShA:74,lShF:24,rShF:30,lElb:26,rElb:18,lHand:1,rHand:1,neckY:-24,neckP:6,squash:-.04})],
  [1,posed({dz:.4,roll:22,bend:8,lean:20,pitch:6,rHipA:70,rHipF:16,rKnee:10,rAnk:-10,rHipR:30,lHipF:60,lHipA:20,lKnee:98,lShA:74,rShA:66,lShF:30,rShF:34,lElb:34,rElb:28,lHand:1,rHand:1,neckY:-22,neckP:10})],
 ]);
}
const R_PEAK=.6;
/** where the ball meets his right boot at the full block (our coords) */
function bootAt(X:number,Z:number,yaw:number):V3{const sk=solve(reflex(R_PEAK),KBUILD,placeAt(X,Z,yaw)),toe=toMine(sk.rToe),an=toMine(sk.rAn);return[lerp(an[0],toe[0],.6),Math.max(BALL_R+.02,(an[1]+toe[1])/2+.06),lerp(an[2],toe[2],.6)];}
/** the right-foot strike's contact: where the ball sits just past the kicking toe (library coords, place at the origin) */
function strikeBall(yaw:number,build:Build):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),build,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;sx?:number;sy?:number;smear?:number;dir?:number}={}){
 const{rot=0,sx=1,sy=1,smear=0,dir=0}=o;let pts=blob(x,y,r*sx,r*sy,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);s.fill(K,crescent(x,y,r*1.02,[-.42,-.45]),.2);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr*sx,cy+Math.sin(a)*pr*sy]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88*sx,y+Math.sin(a)*r*.88*sy,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);
/** a ball in stage st at (X,Yh,Z): ground shadow + the ball (+ a smear when it flies) */
function ballAt(s:Sheet,st:Stage,X:number,Yh:number,Z:number,seed:number,o:{min?:number;rot?:number;smear?:number;dir?:number}={}){
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,Yh>.5?.25:.45);ball(s,p[0],p[1],r,seed,{rot:o.rot,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, red / yellow shirts and a few paper ones in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),paper=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.16)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.4)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.48)paper.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.knockout(paper);s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Spain's goal at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true);s.knockout(court,.25);s.fill(B,court,.82);
 s.fill(B,polyPath(floorQuad(st,-20,6,20,13),true),.12);
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
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st);o.keeper?.();sidePosts(s,st);
}
function sideGoal(s:Sheet,st:Stage){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>proj(st,GOAL_X-lerp(Db,Dt,Yh/H),Yh,Z);
 const hull=[proj(st,GOAL_X,0,POST_N),proj(st,GOAL_X,H,POST_N),proj(st,GOAL_X,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
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

// ---- REPLAY court facing the goal end (camera looks along +Z): goal centre (0, GZ), wall behind it ----
const GZ=11,WALLZ=13.4;
type ArenaOpt={cheer?:number;flash?:number;t?:number;keeper?:(st:Stage)=>void;goal?:boolean};
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,t=0,goal:withGoal=true}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-10,-30,10,GZ),true);s.knockout(court,.25);s.fill(B,court,.82);
 const lines=new Path2D();
 if(withGoal){const arcPts:Pt[]=[];
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,GZ],[10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts,.05),true));
  lines.addPath(polyPath(floorRing(st,0,GZ-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,GZ-10,.12,12),true));}
 lines.addPath(polyPath(floorStrip(st,[[-10,-30],[-10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,-30],[10,GZ]],.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 if(withGoal){goalEnd(s,st);o.keeper?.(st);postsEnd(s,st);}else o.keeper?.(st);
}
function goalEnd(s:Sheet,st:Stage){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H));
 const out=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const X of[Lx,Rx])for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,X,Yh,GZ),b=back(X,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,GZ)*.018),.6);
}
function postsEnd(s:Sheet,st:Stage,gz=GZ){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,gz);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,gz)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ================= chapter 1 — LIVE: the 2026 final is over; Spain 5–3 Portugal; Spain's players run to celebrate with Plana =================
// Brief (fallback mode): no save is staged inside the real final. This chapter shows only confirmed things — the arena, the result, the
// celebration (who ran where is inferred; nobody plays the ball).
const C1={yr:A(0,'The 2026'),spain:A(0,'Spain against'),with:A(0,'with'),win:A(0,'Spain win'),five:A(0,'five goals'),famous:A(0,'He is'),end:AUTH[0].seconds};
/** Plana at the edge of his area (faces +X) */
const KX=-18.3,KZ=10.1;
const liveK:Gen=T=>{const a=sm(C1.with-.4,C1.with+.2,T);let pose=blendPose(posed({lHipF:14,rHipF:10,lKnee:22,rKnee:18,lean:4,lShA:30,rShA:30,lShF:140,rShF:140,lElb:110,rElb:110,neckP:-18}),celebrate(T*1.1,{kind:'arms'}),a);
 const hug=sm(C1.win,C1.win+.5,T);if(hug>0)pose=blendPose(pose,celebrate(T*1.3+.2,{kind:'arms'}),hug);
 return{pose,yaw:FACE_RIGHT+.25*Math.sin(T*.8),X:KX,Z:KZ};};
/** Spain (white change strip, inferred): from where the whistle found them, they run to their keeper, then jump together */
const ESP0:[number,number][]=[[-9.2,6.2],[-11.8,14.8],[-7.6,11.4],[-13.6,9.0]],ESP1:[number,number][]=[[-16.2,11.0],[-17.4,12.0],[-15.6,12.3],[-18.9,11.9]];
const liveEsp=(i:number):Gen=>T=>{const t0=C1.spain+i*.25,go=sm(t0,C1.win+.1,T,easeIO),[a,b]=[ESP0[i],ESP1[i]],X=lerp(a[0],b[0],go),Z=lerp(a[1],b[1],go);
 let pose=celebrate(T*1.1+i*.3,{kind:'arms'});if(go>0&&go<1)pose=blendPose(pose,celebrate(T*1.25+i*.2,{kind:'run'}),sm(t0,t0+.25,T)*(1-sm(C1.win-.1,C1.win+.2,T)));
 const yaw=go>0&&go<1?yawTo(b[0]-a[0],b[1]-a[1]):yawTo(KX-X,KZ-Z);return{pose,yaw,X,Z};};
/** Portugal (red): heads down, hands on knees or on heads, a slow walk away */
const POR_P:[number,number][]=[[-10.6,8.4],[-14.2,4.6],[-12.4,15.6],[-8.4,13.2]];
const livePor=(i:number):Gen=>T=>{const[x0,z0]=POR_P[i],walk=i%2?.25*T:0;
 const pose=i%2?blendPose(runCycle(T*.9*runCadence(.1)+i*.3,{speed:.05}),posed({lHipF:14,rHipF:14,lKnee:18,rKnee:18,lean:10,neckP:40,lShA:30,rShA:30,lShF:150,rShF:150,lElb:130,rElb:130}),.6)
  :posed({lHipF:44,rHipF:40,lKnee:40,rKnee:36,lean:46,pitch:6,neckP:30,lShA:12,rShA:12,lShF:60,rShF:60,lElb:10,rElb:10});
 return{pose,yaw:i%2?FACE_RIGHT+.6*(i-2):FACE_LEFT+.3,X:x0+walk*(i===1?-1:1),Z:z0};};
const BALL1:[number,number]=[-11.4,6.9];
const liveCam=(T:number)=>({x:key(T,mono([[0,-8.6],[C1.spain,-9.6],[C1.with,-14.6],[C1.win,-15.4],[C1.famous,-16.4],[C1.end,-16.8]]),easeInOutSine),
 zoom:key(T,mono([[0,.6],[C1.spain,.62],[C1.with+.4,.74],[C1.win,.72],[C1.famous,.84],[C1.end,.9]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.with,1040],[C1.end,1030]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 courtSide(s,st,T,{cheer:.6+.4*sm(C1.win,C1.win+.4,T),flash:pulse(T,0,1)+pulse(T,C1.win,1.2)+.7*pulse(T,C1.five,1.2)});
 type It={z:number;draw:()=>void};const items:It[]=[];
 ESP0.forEach((_,i)=>{const g=liveEsp(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i),{detail:'low'})});});
 POR_P.forEach((_,i)=>{const g=livePor(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,POR(i),{detail:'low'})});});
 items.push({z:KZ,draw:()=>athlete(s,st,liveK,T,PLANA,{detail:'mid'})});
 items.push({z:BALL1[1],draw:()=>{ballAt(s,st,BALL1[0],BALL_R,BALL1[1],18,{min:9});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "five goals to three": paper, yellow and red confetti falls over Spain's end
 if(T>=C1.five-.2){const u=sm(C1.five-.2,C1.end,T,linear),top=proj(st,-15,4.5,10)[1],x0=proj(st,-22,0,10)[0],x1=proj(st,-8,0,10)[0];confetti(s,['paper',Y,R],[x0,top+u*260,x1-x0,300],34,Math.floor(T*6),{size:14});}
}
/** a ring of points round a figure's chest (the passage enters his yellow top) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},build:Build,r=.09):Pt[]{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveK(tt),KBUILD,.13));},still:C1.five+.4};

// ================= chapter 2 — HOW HE SAVES: slow motion, low, behind the shooter: toes, knees, hands; the shot; the leg; blocked =================
const C2={how:A(1,'This is'),toes:A(1,'on his'),knees:A(1,'knees'),hands:A(1,'hands'),shot:A(1,'The shot'),snaps:A(1,'snaps'),blocked:A(1,'Blocked'),end:AUTH[1].seconds};
/** replay world = the live chance seen end-on: he is 0.75 m off his line, facing the camera; the pivot is 4.6 m out, back to the camera */
const K2X=.1,K2Z=GZ-.75;
const BOOT2=bootAt(K2X,K2Z,FACE_CAMERA);
const SHOT2:[number,number]=[1.45,K2Z-4.4];
const YAW_S2=yawTo(BOOT2[0]-SHOT2[0],BOOT2[2]-SHOT2[1]);
const SB2=toMine(strikeBall(YAW_S2,PIVOT.build!)),PLANT2:[number,number]=[SHOT2[0]-SB2[0],SHOT2[1]-SB2[2]];
/** slow motion: contact just after "The shot comes"; the ball takes ≈1.4 s to reach the boot; the leg starts on "snaps out" */
const R_HIT=C2.shot+.45,R_BLOCK=Math.max(C2.snaps+.55,C2.blocked-.12),R_OUT=R_BLOCK+2.2;
const OUT2:V3=[-3.4,BALL_R,K2Z-1.6];
function repBall(t:number){if(t<R_HIT)return{X:SHOT2[0],Y:BALL_R,Z:SHOT2[1],flying:false};
 if(t<R_BLOCK){const u=sm(R_HIT,R_BLOCK,t,linear);return{X:lerp(SHOT2[0],BOOT2[0],u),Y:lerp(BALL_R,BOOT2[1],u)+.14*Math.sin(u*Math.PI),Z:lerp(SHOT2[1],BOOT2[2],u),flying:true};}
 const u=sm(R_BLOCK,R_OUT,t,easeOut),p=arc3(BOOT2,OUT2,2.1,u);return{X:p[0],Y:p[1],Z:p[2],flying:u<1};}
const repK:Gen=t=>{let pose=keeperSet(t*.55);
 if(t>=C2.snaps-.2){const u=key(t,[[C2.snaps-.2,0],[R_BLOCK,R_PEAK],[R_BLOCK+1.2,1]],linear);pose=blendPose(pose,reflex(u),sm(C2.snaps-.2,C2.snaps,t));}
 return{pose,yaw:FACE_CAMERA,X:K2X,Z:K2Z};};
const repS:Gen=t=>{const stT=key(t,[[0,.18],[C2.shot-.4,.3],[R_HIT,STRIKE_CONTACT],[R_HIT+2.2,.9],[C2.end,1]],linear);
 return{pose:strike(stT,{foot:'r'}),yaw:YAW_S2,X:PLANT2[0]+key(t,[[0,.18],[R_HIT,0,easeOut]]),Z:PLANT2[1]+key(t,[[0,-.35],[R_HIT,0,easeOut],[R_HIT+1.5,.2]])};};
const st2=(t:number):Stage=>({F:1500,eye:1.4,cx:.2,cz:SHOT2[1]-5.4+.5*sm(R_HIT,R_BLOCK,t,easeIO)});
/** a small ring of points round a joint (our coords) */
const ringAt=(st:Stage,p:V3,r:number):Pt[]=>{const c=proj(st,p[0],p[1],p[2]),rad=r*kAt(st,p[2]),q:Pt[]=[];for(let i=0;i<14;i++){const a=i/14*TAU;q.push([c[0]+Math.cos(a)*rad,c[1]+Math.sin(a)*rad*.9]);}return q;};
function ringMark(s:Sheet,st:Stage,ink:string,p:V3,r:number,g:number,seed:number,w=7){if(g<=.02)return;const q=ringAt(st,p,r*g),rp=ribbon([...q,q[0]],w,{seed,close:true,wobble:1});s.knockout(rp);s.fill(ink,rp);}
/** a diagram halo round his right leg (hip → knee → ankle → toe), printed BEFORE the figure so only the rim shows */
function legHalo(s:Sheet,st:Stage,sk:Skeleton,ink:string,g:number,cov=.8){
 if(g<=.02)return;const P=(j:V3)=>{const m=toMine(j);return proj(st,m[0],m[1],m[2]);},k=kAt(st,-sk.pelvis[2]),w=(m:number)=>(m+.1*g)*k;
 const pts=[P(sk.rHip),P(sk.rKn),P(sk.rAn),P(sk.rToe)],ws=[w(.22),w(.16),w(.12),w(.12)];
 const path=new Path2D();for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/30));for(let j=0;j<=n;j++){const u=j/n,x=lerp(a[0],b[0],u),y=lerp(a[1],b[1],u),r=lerp(ws[i],ws[i+1],u)/2;path.moveTo(x+r,y);path.arc(x,y,r,0,TAU);}}
 s.fill(ink,path,cov);
}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(tt),hit=pulse(t,R_BLOCK,.45);
  camPath(s,t,[[0,80,150,1.0],[C2.toes-.2,-10,190,1.6],[C2.knees,-10,130,1.6],[C2.hands,-10,60,1.5],[C2.shot-.2,90,150,1.1],[R_HIT+.4,40,150,1.2],[R_BLOCK,-50,150,1.4],[C2.end,-60,140,1.3]],[7*hit*Math.sin(t*90),5*hit*Math.cos(t*77)]);
  const b=repBall(tt),sk=skOf(repK,tt,KBUILD);
  arena(s,st,{t:tt,cheer:.9*sm(R_BLOCK,R_BLOCK+.4,tt),flash:pulse(tt,R_BLOCK,1.2),
   keeper:stg=>{
    // "snaps out a leg": a red halo round the right leg, printed before him so only its rim shows
    legHalo(s,stg,sk,R,easeOutBack(sm(C2.snaps,C2.snaps+.35,tt))*(1-sm(R_BLOCK+1.2,R_BLOCK+1.8,tt)));
    athlete(s,stg,repK,tt,PLANA,{detail:'high',smear:tt>C2.snaps-.1&&tt<R_BLOCK+.2?.22:0});
    // "on his toes": yellow rings under the balls of both feet, with a small up-tick; "knees soft": red rings on both knees; "hands ready": yellow rings on the gloves
    const toes=easeOutBack(sm(C2.toes,C2.toes+.35,tt))*(1-sm(C2.shot,C2.shot+.4,tt));
    if(toes>.02)for(const[j,sd] of[[sk.lToe,1],[sk.rToe,2]] as [V3,number][]){const m=toMine(j);floorDashRing(s,stg,Y,m[0],m[2]+.02,.16,6,110+sd,toes);}
    const kn=easeOutBack(sm(C2.knees,C2.knees+.35,tt))*(1-sm(C2.shot,C2.shot+.4,tt));
    for(const[j,sd] of[[sk.lKn,1],[sk.rKn,2]] as [V3,number][])ringMark(s,stg,R,toMine(j),.13,kn,120+sd);
    const hd=easeOutBack(sm(C2.hands,C2.hands+.35,tt))*(1-sm(C2.shot,C2.shot+.4,tt));
    for(const[j,sd] of[[sk.lHa,1],[sk.rHa,2]] as [V3,number][])ringMark(s,stg,Y,toMine(j),.13,hd,130+sd);
   }});
  // "The shot comes": the dashed yellow flight line, drawn as the ball flies; after the block a navy dashed line shows where it went
  if(tt>R_HIT){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=repBall(lerp(R_HIT,Math.min(tt,R_BLOCK),k/14));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,140,{dash:40});}
  if(tt>R_BLOCK+.05){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=repBall(lerp(R_BLOCK,Math.min(tt,R_OUT),k/12));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,K,pts,9,141,{dash:34,cov:.8});if(tt>R_BLOCK+.5)arrowHead(s,K,pts,30,142,.8);}
  const drawBall=()=>{const r=ballAt(s,st,b.X,b.Y,b.Z,143,{min:10,rot:tt*5,smear:b.flying?.35:0,dir:tt<R_BLOCK?-Math.PI/2:Math.PI*.8});
   if(tt>=R_BLOCK&&tt<R_BLOCK+.5)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3.4,{n:11,seed:144,g:easeOut(sm(R_BLOCK,R_BLOCK+.3,tt))*(1-sm(R_BLOCK+.3,R_BLOCK+.5,tt))});};
  const sh=repS(tt);const its:{z:number;draw:()=>void}[]=[{z:sh.Z,draw:()=>athlete(s,st,repS,tt,PIVOT,{detail:'high',smear:tt>R_HIT-.35&&tt<R_HIT+.3?.25:0})},{z:b.flying||tt>R_HIT?b.Z:sh.Z+.01,draw:drawBall}];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
 },
 aperture(t0){const{tt}=clock(1,t0),st=st2(tt);return aperture(chestPts(st,repK(tt),KBUILD,.13));},
 still:R_BLOCK+.1,
};

// ================= chapter 3 — FROM BEHIND HIM (net camera, real time): so close, no time to dive, quick feet; champions, 5–3 =================
const C3={behind:A(2,'From'),close:A(2,'so close'),none:A(2,'no time'),quick:A(2,'Quick'),hands:A(2,'quick hands'),end:AUTH[2].seconds};
/** stage 3 looks OUT of the goal (along +Z): the goal line at Z = 0, the camera just behind the net; he faces away, the shooter faces us */
const K3X=0,K3Z=.75;
const BOOT3=bootAt(K3X,K3Z,FACE_AWAY);
const SHOT3:[number,number]=[-1.7,K3Z+4.4];
const YAW_S3=yawTo(BOOT3[0]-SHOT3[0],BOOT3[2]-SHOT3[1]);
const SB3=toMine(strikeBall(YAW_S3,PIVOT.build!)),PLANT3:[number,number]=[SHOT3[0]-SB3[0],SHOT3[1]-SB3[2]];
const T3_HIT=C3.none+.15,T3_BLOCK=T3_HIT+.22,T3_OUT=T3_BLOCK+1.1;
const OUT3:V3=[3.6,BALL_R,2.2];
function b3(t:number){if(t<T3_HIT)return{X:SHOT3[0],Y:BALL_R,Z:SHOT3[1],flying:false};
 if(t<T3_BLOCK){const u=sm(T3_HIT,T3_BLOCK,t,linear);return{X:lerp(SHOT3[0],BOOT3[0],u),Y:lerp(BALL_R,BOOT3[1],u)+.1*Math.sin(u*Math.PI),Z:lerp(SHOT3[1],BOOT3[2],u),flying:true};}
 const u=sm(T3_BLOCK,T3_OUT,t,easeOut),p=arc3(BOOT3,OUT3,2.2,u);return{X:p[0],Y:p[1],Z:p[2],flying:u<1};}
const k3:Gen=t=>{let pose=keeperSet(t*1.7),yaw=FACE_AWAY;
 if(t>=T3_HIT-.05){const u=key(t,[[T3_HIT-.05,0],[T3_BLOCK,R_PEAK],[T3_BLOCK+.5,1]],linear);pose=blendPose(pose,reflex(u),sm(T3_HIT-.05,T3_HIT+.03,t));}
 const back=sm(C3.hands-.5,C3.hands+.1,t,easeIO);if(back>0)pose=blendPose(pose,keeperSet(t*1.7),back);
 return{pose,yaw,X:K3X,Z:K3Z};};
const s3:Gen=t=>{const stT=key(t,[[0,.16],[T3_HIT-.4,.3],[T3_HIT,STRIKE_CONTACT],[T3_HIT+.5,1]],linear);let pose=strike(stT,{foot:'r'});
 const drop=sm(T3_BLOCK+.5,T3_BLOCK+1.2,t,easeIO);if(drop>0)pose=blendPose(pose,posed({lHipF:10,rHipF:10,lKnee:18,rKnee:18,lean:26,neckP:46,lShA:14,rShA:14,lElb:30,rElb:30}),drop);
 return{pose,yaw:YAW_S3,X:PLANT3[0],Z:PLANT3[1]};};
const st3:Stage={F:1500,eye:1.5,cx:-.2,cz:-3.2};
/** the near net: the back plane and roof mesh the camera looks through (one stroke), and the posts seen from behind */
function netCam(s:Sheet,st:Stage){
 const mesh=new Path2D(),Zb=-.9,H=2;for(let X=-1.5;X<=1.5+1e-6;X+=.25){const a=proj(st,X,0,Zb),b=proj(st,X,H*.72,Zb);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 for(let Yh=0;Yh<=H*.72+1e-6;Yh+=.25){const a=proj(st,-1.5,Yh,Zb),b=proj(st,1.5,Yh,Zb);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,3,.35);
}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,hit=pulse(t,T3_BLOCK,.35);
  camPath(s,t,[[0,0,260,1.0],[C3.close,-120,300,1.2],[C3.none,-60,280,1.1],[T3_BLOCK+.3,40,300,1.15],[C3.hands,20,230,1.12],[C3.end,0,240,1.05]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*70)]);
  const b=b3(tt);
  arena(s,st,{t:tt,goal:false,cheer:.8*pulse(tt,T3_BLOCK,1.2),flash:pulse(tt,T3_BLOCK,1.2)});
  // the D in front of him (6 m arcs from the posts at Z = 0) and the goal line
  const dl=new Path2D(),arcP:Pt[]=[];for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcP.push([-1.5-6*Math.cos(a),6*Math.sin(a)]);}for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcP.push([1.5+6*Math.cos(a),6*Math.sin(a)]);}
  dl.addPath(polyPath(floorStrip(st,arcP,.05),true));dl.addPath(polyPath(floorStrip(st,[[-10,0],[10,0]],.05),true));s.knockout(dl,.94);
  // "so close": a dashed paper-and-red measuring line from the ball to his feet, with one tick a metre
  const cl=easeOut(sm(C3.close,C3.close+.5,tt))*(1-sm(T3_HIT-.1,T3_HIT+.1,tt));
  if(cl>.02){const a:Pt=[SHOT3[0],SHOT3[1]-.25],c:Pt=[K3X,K3Z+.35],pts:Pt[]=[];for(let k=0;k<=10;k++){const u=k/10;pts.push(proj(st,lerp(a[0],c[0],u),0,lerp(a[1],c[1],u)));}dashed(s,R,pts,9,150,{dash:26,progress:cl});
   const ticks=new Path2D();for(let m=1;m<4.6&&m/4.6<cl;m++){const u=m/4.6,X=lerp(a[0],c[0],u),Z=lerp(a[1],c[1],u),p0=proj(st,X-.18,0,Z),p1=proj(st,X+.18,0,Z);ticks.addPath(ribbon([p0,p1],6,{seed:151+m,taper:0,wobble:.5}));}s.fill(R,ticks);}
  // figures back to front: the shooter (far), the ball, the keeper (near)
  const its:{z:number;draw:()=>void}[]=[{z:s3(tt).Z,draw:()=>athlete(s,st,s3,tt,PIVOT,{detail:'mid',smear:tt>T3_HIT-.15&&tt<T3_HIT+.2?.1:0})},
   {z:b.Z,draw:()=>{const r=ballAt(s,st,b.X,b.Y,b.Z,152,{min:10,rot:tt*6,smear:b.flying?.4:0,dir:tt<T3_BLOCK?Math.PI/2:0});if(tt>=T3_BLOCK&&tt<T3_BLOCK+.45)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3.6,{n:11,seed:153,g:easeOut(sm(T3_BLOCK,T3_BLOCK+.25,tt))*(1-sm(T3_BLOCK+.3,T3_BLOCK+.45,tt))});}},
   {z:k3(tt).Z,draw:()=>{
    // "Quick feet": yellow rings flash under both boots
    const q=easeOutBack(sm(C3.quick,C3.quick+.3,tt))*(1-sm(C3.hands-.1,C3.hands+.2,tt)),sk=skOf(k3,tt,KBUILD);
    if(q>.02)for(const[j,sd] of[[sk.lToe,1],[sk.rToe,2]] as [V3,number][]){const m=toMine(j);floorDashRing(s,st,Y,m[0],m[2],.2,7,160+sd,q);}
    athlete(s,st,k3,tt,PLANA,{detail:'high',smear:tt>T3_HIT&&tt<T3_BLOCK+.2?.15:0});}}];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "no time": speed lines behind the shot
  if(tt>=T3_HIT&&tt<T3_BLOCK+.1){const p=proj(st,b.X,b.Y,b.Z);speedLines(s,Y,p[0],p[1],Math.PI/2,{n:6,seed:154,len:160,spread:40,width:6});}
  // the net and the posts, seen from behind (in front of everything)
  netCam(s,st);postsEnd(s,st,0);
  // "Spain became champions": paper, yellow and red confetti; "five goals to three": a second burst
  // "quick hands": yellow rings on both gloves
  {const g=easeOutBack(sm(C3.hands,C3.hands+.35,tt)),sk=skOf(k3,tt,KBUILD);for(const[j,sd] of[[sk.lHa,1],[sk.rHa,2]] as [V3,number][]){const m=toMine(j),c=proj(st,m[0],m[1],m[2]);if(g>.02){const q=ribbon(blob(c[0],c[1],60*g,56*g,170+sd,{n:18}),8,{seed:172+sd,close:true,wobble:1});s.knockout(q);s.fill(Y,q);}}}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,k3(tt),KBUILD,.14));},
 still:T3_BLOCK+.1,
};

// ================= chapter 4 — THE LESSON: bounce on your toes; a close flick; a fast block; a tick =================
const C4={now:A(3,'Now'),toes:A(3,'stay'),react:A(3,'react'),close:A(3,'close range'),end:AUTH[3].seconds};
const K4X=0,K4Z=3.6;
const BOOT4=bootAt(K4X,K4Z,FACE_CAMERA);
const T4_HIT=C4.react-.1,T4_BLOCK=T4_HIT+.3,T4_OUT=T4_BLOCK+.9;
const FR:[number,number]=[-2.3,2.1];// the friend's spot (camera side, left), flicking the ball at him from close
const SRC4:V3=[FR[0]+.45,BALL_R,FR[1]+.5],OUT4:V3=[-2.6,BALL_R,4.4];
function b4(t:number){if(t<T4_HIT)return{X:SRC4[0],Y:BALL_R,Z:SRC4[2],flying:false};
 if(t<T4_BLOCK){const u=sm(T4_HIT,T4_BLOCK,t,linear);return{X:lerp(SRC4[0],BOOT4[0],u),Y:lerp(BALL_R,BOOT4[1],u)+.1*Math.sin(u*Math.PI),Z:lerp(SRC4[2],BOOT4[2],u),flying:true};}
 const u=sm(T4_BLOCK,T4_OUT,t,easeOut),p=arc3(BOOT4,OUT4,1.2,u);return{X:p[0],Y:p[1],Z:p[2],flying:u<1};}
/** Plana practising: an exaggerated bounce on the toes (heels never down) → the block → back to the bounce, a fist on "close range" */
const k4:Gen=t=>{const bounce=posed({...SET_D,air:.07*Math.abs(Math.sin(t*TAU*1.1)),lAnk:22,rAnk:22,lKnee:54,rKnee:54});let pose=blendPose(keeperSet(t*1.1),bounce,sm(C4.toes-.2,C4.toes+.2,t));
 const bl=sm(T4_HIT-.05,T4_HIT+.03,t)*(1-sm(T4_OUT+.3,T4_OUT+.9,t));if(bl>0)pose=blendPose(pose,reflex(key(t,[[T4_HIT-.05,0],[T4_BLOCK,R_PEAK],[T4_BLOCK+.5,1]],linear)),bl);
 const fist=sm(C4.close+.1,C4.close+.5,t,easeIO);if(fist>0)pose=blendPose(pose,posed({lHipF:12,rHipF:12,lKnee:18,rKnee:18,lean:4,lShA:24,rShA:40,rShF:150,rElb:100,lElb:40,neckP:-14}),fist);
 return{pose,yaw:FACE_CAMERA,X:K4X,Z:K4Z};};
/** the friend: a quick right-foot flick from close (seen from behind, left of frame) */
const f4:Gen=t=>({pose:strike(key(t,[[0,.1],[T4_HIT-.35,.3],[T4_HIT,STRIKE_CONTACT],[T4_HIT+.6,1]],linear),{foot:'r',power:.4}),yaw:yawTo(BOOT4[0]-SRC4[0],BOOT4[2]-SRC4[2]),X:FR[0],Z:FR[1]});
const st4:Stage={F:1500,eye:1.7,cx:0,cz:-2.6};
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  camPath(s,t,[[0,-120,260,1.0],[C4.toes,0,400,1.35],[C4.react-.3,-160,300,1.05],[T4_BLOCK+.3,-120,300,1.1],[C4.close,-60,280,1.1],[C4.end,-60,270,1.08]]);
  arena(s,st,{t:tt,cheer:.6*pulse(tt,C4.close+.2,1.4)});
  const sk=skOf(k4,tt,KBUILD),b=b4(tt);
  // "stay on your toes": yellow rings under both forefeet and little up-ticks under the heels, pulsing with the bounce
  const toes=easeOutBack(sm(C4.toes,C4.toes+.35,tt))*(1-sm(T4_HIT-.2,T4_HIT,tt))+easeOutBack(sm(T4_OUT+.4,T4_OUT+.8,tt));
  if(toes>.02){for(const[j,sd] of[[sk.lToe,1],[sk.rToe,2]] as [V3,number][]){const m=toMine(j);floorDashRing(s,st,Y,m[0],m[2]+.03,.17,7,410+sd,Math.min(1,toes));}
   const up=new Path2D();for(const[h,sd] of[[sk.lHeel,1],[sk.rHeel,2]] as [V3,number][]){const m=toMine(h),g=proj(st,m[0],0,m[2]),top=proj(st,m[0],.38,m[2]),pts:Pt[]=[g,L2(g,top,.5),top];up.addPath(ribbon(pts,7,{seed:420+sd,taper:.3,wobble:.6}));}
   s.fill(R,up,Math.min(1,toes));}
  const its:{z:number;draw:()=>void}[]=[
   {z:K4Z,draw:()=>athlete(s,st,k4,tt,PLANA,{detail:'high',smear:tt>T4_HIT&&tt<T4_BLOCK+.2?.18:0})},
   {z:b.Z,draw:()=>{const r=ballAt(s,st,b.X,b.Y,b.Z,430,{min:10,rot:tt*5,smear:b.flying?.35:0,dir:tt<T4_BLOCK?0:Math.PI});if(tt>=T4_BLOCK&&tt<T4_BLOCK+.45)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3.4,{n:10,seed:431,g:easeOut(sm(T4_BLOCK,T4_BLOCK+.25,tt))*(1-sm(T4_BLOCK+.3,T4_BLOCK+.45,tt))});}},
   {z:FR[1],draw:()=>athlete(s,st,f4,tt,FRIEND,{detail:'high'})}];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "react fast": a red dashed flight line from the flick to the boot
  if(tt>T4_HIT){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=b4(lerp(T4_HIT,Math.min(tt,T4_BLOCK),k/10));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,R,pts,9,432,{dash:30,cov:1-sm(T4_OUT,T4_OUT+.6,tt)});}
  // "close range": a big tick stamps beside him, with a navy misregistered echo
  const tick=easeOutBack(sm(C4.close+.2,C4.close+.55,tt));
  if(tick>.02){const g=proj(st,K4X,0,K4Z),h=kAt(st,K4Z)*1.79,c:Pt=[g[0]+h*.55,g[1]-h*.72],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:439,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:440,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:438,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:T4_BLOCK+.1,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'didac-plana-futsal-signature',format:'futsal',title:'Dídac Plana’s reflex save',theme:'Stay on your toes so you can react fast to close shots.',
 ageNote:'For players aged 7–12: the 2026 Futsal EURO final and its 5–3 result are real; the save chapters are a demonstration of how he saves.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball flies in and a navy glove print blocks it; yellow rings squeak out; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const fly=sm(0,.2,age,easeIn),bx=x-160*(1-fly),u=clamp((age-.2)/.5);
  if(age>.2&&u<1){s.fill(Y,ribbon(blob(x,y,r*(1+2*u),r*(1+1.6*u),seed,{n:24}),8*(1-u)+2,{seed,close:true,wobble:1.2}),1);s.fill(R,ribbon(blob(x,y,r*(.6+1.3*u),r*(.6+1.1*u),seed+1,{n:24}),6*(1-u)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  const back=sm(.2,.6,age,easeOut);ball(s,bx-70*back,y-60*back,r,seed,{rot:age*6});
  const glove=sm(.14,.22,age)*(1-sm(.45,.7,age));if(glove>.02)s.fill(K,polyPath(blob(x+r*.9,y,r*.5,r*.8,seed+3,{n:18}),true),.85*glove);
 },
};
export default film;
