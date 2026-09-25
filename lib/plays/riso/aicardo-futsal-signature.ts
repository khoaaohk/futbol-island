/** Aicardo — "the reader of the game": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: the card (lib/town/playerAppearance.json country "Spain"; playerBios "Spanish cierre from Cádiz … Barcelona … 2012 European champion
 * with Spain") is Jesús Nazaret Aicardo Collantes, "Aicardo" (b. 4 Dec 1988, Cádiz), Spain + FC Barcelona fixo/defender — sources agree
 * (no namesake / country mismatch).
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — "the reader of the game" — not one match. The best-documented big
 * match in which HE is the story is the UEFA Futsal EURO 2012 SEMI-FINAL: Spain 1–0 Italy, 9 Feb 2012, Arena Zagreb, 21:00 CET. Aicardo
 * scored the only goal at 6:09 and UEFA.com's report describes it in words: "Ortiz slid the ball left for Aicardo to beat Mammarella at his
 * near post", then "a superb defensive display", "Spain's watertight defence". A defender arriving unseen in the right place is the reader's
 * trait, so the goal is recreated from that sentence. The match is used by no other futsal film (Sergio Lozano and Luis Amado: the EURO
 * 2012 FINAL v Russia; Falcão: the 2012 World Cup final; Mammarella: the EURO 2014 final).
 *  1  LIVE (broadcast camera, main stand, real time): 6:09 — Ortiz slides the ball left; Aicardo arrives and beats Mammarella at his near
 *     post; 1–0.
 *  2  REPLAY (slow motion, low, behind Aicardo — the same choreography rotated): the pass left, the near-post finish; then Spain defend
 *     and win (board only: "Spain 1–0 Italy", "into the final").
 *  3  HOW HE DOES IT (a labelled demonstration in TRAINING bibs, no match claimed): watch the passer — eyes and hips show where the pass
 *     goes — step in early and steal it. From the entry's `lesson`: "Watch the passer, not just the ball, to see where it’s going."
 * Sources (written; ≤ 8 requests, 5 s apart, cached in scratchpad/films/src-cache/):
 *  - UEFA.com match report "Spain stand firm to beat Italy in semi-final", Paul Saffer, Arena Zagreb, 9 Feb 2012 (archived):
 *    https://web.archive.org/web/2012/http://www.uefa.com/futsaleuro/season=2012/matches/round=2000148/match=2008818/postmatch/report/index.html
 *    — "Semi-finals - 09/02/2012 - 21:00CET - Arena Zagreb"; "Goals 6:09: Aicardo"; "Aicardo's seventh-minute goal proved enough for the
 *    holders"; "Ortiz slid the ball left for Aicardo to beat Mammarella at his near post"; "a superb defensive display ended Italy's bid";
 *    "Italy … seldom allowed sight of goal by Spain's watertight defence"; "their first clean sheet against Italy took them through";
 *    Italy had more possession; stats 27–31 attempts.
 *  - Wikipedia, "UEFA Futsal Euro 2012" (raw, cached): semi-final 9 Feb 2012, Spain 1–0 Italy, Aicardo 6', Arena Zagreb, att. 8,300.
 *  - Wikipedia, "Jesús Aicardo" (raw): born Cádiz 4 Dec 1988, 1.81 m, defender, Lobelle de Santiago 2008–12, Barcelona 2012–.
 *  - FIFA.com 2012 Futsal World Cup final report (cached): Spain's no. 3 AICARDO, no. 2 ORTIZ (numbers at that tournament).
 * CONFIRMED: match, round, date, venue, the 1–0 score line and 6:09 goal time, Ortiz's pass to the LEFT, the finish at Mammarella's NEAR
 *  post, Italy's keeper Mammarella, Spain's clean sheet / defensive display, Spain into the final.
 * INFERRED (not named in the narration): which end Spain attacked, the court positions, a first-time finish, the RIGHT foot (library
 *  default), the ball's height, every other player's movement; kits (Spain red shirts / navy shorts / red socks; Italy blue shirts / white
 *  shorts; Mammarella in yellow); shirt numbers 3 (Aicardo) and 2 (Ortiz) taken from the 2012 World Cup. No video was reviewed.
 *  Chapter 3 is a demonstration of the signature, not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike and the steal). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 * z → −Z. The replay reuses the LIVE generators through one rotation (live (X,Z) → replay (Z−10, GZ−(X+20)), yaw − 90°): a true 1:1 replay.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: red (Spain, rings), yellow (Mammarella, lights, sight lines), blue (court, Italy), navy (key line, run-off, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill,type Build} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2012 semi-final',text:'The 2012 Futsal Euro semi-final. Spain against Italy, in Zagreb. In the seventh minute, Ortiz slides the ball left. Aicardo arrives and beats the keeper at his near post. One nil!',tail:2.6,
  cues:['The 2012','Spain against','in Zagreb','In the seventh','Ortiz slides','Aicardo arrives','beats the keeper','near post','One nil'],
  heads:{'The 2012':'Euro semi-final 2012','Spain against':'Spain v Italy','in Zagreb':'Arena Zagreb','In the seventh':'6:09','One nil':'1–0'}},
 {label:'Replay: the near post',text:'Watch again. The pass goes left, and Aicardo hits it at the near post. Then Spain defend superbly and win!',tail:2.4,
  cues:['Watch again','The pass goes','Aicardo hits','near post','Then Spain','defend superbly','and win'],heads:{'Watch again':'Replay','and win':'Spain 1–0 Italy'}},
 {label:'Watch the passer',text:'How does he read the game? He watches the passer, not just the ball. Eyes and hips show where the pass will go. So he steps in early and steals it. Watch the passer, not just the ball!',tail:2.6,
  cues:['How does','He watches','not just the ball','Eyes and hips','show where','So he steps','steals it','Watch the passer'],heads:{'How does':'How he does it','Watch the passer':'Watch the passer'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/aicardo-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/aicardo-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/aicardo-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('aicardo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('aicardo: no cue '+w);return c.at;};
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

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line; on the blue court it is knocked out to paper first so the ink prints clean (no overprint) */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a dashed floor arrow from a to b (metres), drawn as progress grows */
function floorArrow(s:Sheet,st:Stage,ink:string,a:[number,number],b:[number,number],w:number,seed:number,progress:number,bend=0){
 if(progress<=.02)return;const mid:[number,number]=[(a[0]+b[0])/2-(b[1]-a[1])*bend,(a[1]+b[1])/2+(b[0]-a[0])*bend];
 const pts:Pt[]=[];for(let k=0;k<=10;k++){const u=k/10,x=(1-u)*(1-u)*a[0]+2*u*(1-u)*mid[0]+u*u*b[0],z=(1-u)*(1-u)*a[1]+2*u*(1-u)*mid[1]+u*u*b[1];pts.push(proj(st,x,0,z));}
 const q=partial(pts,progress);if(q.length<2)return;dashed(s,ink,q,w,seed,{dash:w*3.6});arrowHead(s,ink,q,w*3,seed+1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.8],[R,.3]];
const BUILD:Build={height:1.81,bulk:1};
/** Aicardo: Spain (no. 3 inferred from the 2012 World Cup) — red shirt, navy shorts, red socks (kit inferred), short dark hair, 1.81 m */
const AICARDO:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:SKIN,hair:K,line:K,trim:Y,number:3,numberInk:Y,hairStyle:'short',build:BUILD,seed:3};
/** the demonstration: Aicardo in a yellow training bib (no match claimed) */
const AICARDO_TRAIN:AthleteStyle={...AICARDO,shirt:Y,trim:K,number:undefined,seed:4};
/** Carlos Ortiz, Spain (no. 2 inferred) */
const ORTIZ:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.74],[R,.24]],hair:K,line:K,trim:Y,number:2,numberInk:Y,hairStyle:'short',build:{height:1.76},seed:12};
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.72],[R,.22]],hair:K,line:K,trim:Y,hairStyle:n%2?'bald':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Italy (blue shirts, white shorts — inferred) */
const ITA=(n:number):AthleteStyle=>({shirt:B,shorts:'paper',socks:B,boots:K,skin:[[Y,.84],[R,.28]],hair:K,line:K,trim:'paper',hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.72+hash(n,3)*.12},seed:20+n});
/** Stefano Mammarella, Italy's keeper — a yellow keeper kit (inferred) */
const MAMMA:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.76],[R,.26]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:62};
/** demonstration attackers: neutral paper training tops */
const DEMO=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:n?'curly':'short',build:{height:1.78+.03*n},seed:77+n});
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[R,.6],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at a right-foot contact: just past the kicking toe along the foot (our coords, place at the origin) */
function toeBall(pose:Pose,build:Build,yaw:number):[number,number,number]{const sk=solve(pose,build,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}

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

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, red / yellow / blue shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.1)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.3)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Italy's goal at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void;under?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
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
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 o.under?.();
 sideGoal(s,st,bulge,bz,by);o.keeper?.();sidePosts(s,st);
}
/** the goal at X = −20 seen side-on: the net runs back to −X */
function sideGoal(s:Sheet,st:Stage,bulge:number,bz:number,by:number){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((Z-bz)**2+(Yh-by)**2)/.35);return proj(st,GOAL_X-lerp(Db,Dt,Yh/H)-d,Yh,Z);};
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

// ---- REPLAY / DEMO court facing the goal end (camera looks along +Z): goal centre (0, GZ), wall behind it ----
const GZ=11,WALLZ=13.4;
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;quiet?:boolean};
/** the court seen end-on: blue floor + run-off, paper lines (goal line and the D), boards, stands, the goal */
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-10,-30,10,GZ),true);s.knockout(court,.25);s.fill(B,court,.82);
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
 if(o.quiet){const span2=9000;s.fill(K,rectPath(-span2,wall-board-span2,span2*2,span2),.62);const rows=new Path2D(),rowH=.55*kw;for(let r=0;r<12;r+=2)rows.rect(-span2,wall-board-(r+1)*rowH,span2*2,rowH*.55);s.fill(K,rows,.35);}
 else stands(s,wall-board,kw,t,cheer,flash,st.cx);
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

// ================= chapter 1 — LIVE: EURO 2012 semi-final, 6:09 — Ortiz slides it left, Aicardo arrives, near post, 1–0 =================
const C1={spain:A(0,'Spain against'),zagreb:A(0,'in Zagreb'),seventh:A(0,'In the seventh'),ortiz:A(0,'Ortiz'),arrives:A(0,'Aicardo arrives'),beats:A(0,'beats'),near:A(0,'near post'),one:A(0,'One nil'),end:AUTH[0].seconds};
/** the finish: first-time, right foot (inferred), from ≈6 m on the near side, to Mammarella's near post (Z = POST_N) */
const T_HIT=C1.beats+.2,T_IN=T_HIT+.34,PASS0=Math.max(C1.ortiz+.45,T_HIT-1.55);
const SHOT:[number,number]=[-14.1,5.3],LOWC:V3=[GOAL_X+.08,.34,POST_N+.3];
const YAW_SHOT=yawTo(LOWC[0]-SHOT[0],LOWC[2]-SHOT[1]);
const SB=toeBall(strike(STRIKE_CONTACT),BUILD,YAW_SHOT),PLANT:[number,number]=[SHOT[0]-SB[0],SHOT[1]-SB[2]];
/** Ortiz: carries it infield toward goal, then slides it LEFT (for a man facing −X, left is toward the camera) */
const OR_YAW=yawTo(SHOT[0]-(-8.6),SHOT[1]-9.4);
const OB=toeBall(strike(STRIKE_CONTACT,{power:.35}),{height:1.76},OR_YAW);
const PASS_FROM:[number,number]=[-8.6,9.4],OPL:[number,number]=[PASS_FROM[0]-OB[0],PASS_FROM[1]-OB[2]];
const liveO:Gen=T=>{
 const X=key(T,[[0,OPL[0]+5.2],[PASS0-.4,OPL[0]+.35,easeOut],[PASS0,OPL[0]],[PASS0+.8,OPL[0]-.9,easeIO],[T_IN+.3,OPL[0]-2.2],[C1.end,PLANT[0]+2.2,easeIO]]);
 const Z=key(T,[[0,OPL[1]+.5],[PASS0-.4,OPL[1]+.1],[PASS0,OPL[1]],[PASS0+.8,OPL[1]-.4],[T_IN+.3,OPL[1]-1.4],[C1.end,1.9,easeIO]]);
 let pose:Pose,yaw=FACE_LEFT;
 const pT=key(T,[[PASS0-.4,.2],[PASS0,STRIKE_CONTACT],[PASS0+.55,.85]],linear);
 if(T<PASS0-.4)pose=dribble(T*1.5,{foot:'r',speed:.35});
 else if(T<PASS0+.55){pose=blendPose(dribble((PASS0-.4)*1.5,{foot:'r',speed:.35}),strike(pT,{power:.35}),sm(PASS0-.4,PASS0-.28,T));yaw=lerp(FACE_LEFT,OR_YAW,sm(PASS0-.5,PASS0-.2,T));}
 else if(T<T_IN+.3){pose=blendPose(strike(.85,{power:.35}),runCycle(T*runCadence(.4),{speed:.4}),sm(PASS0+.55,PASS0+.8,T));yaw=FACE_LEFT-.25;}
 else{pose=celebrate((T-T_IN)*1.1,{kind:'run'});yaw=yawTo(-.6,-1);}
 return{pose,yaw,X,Z};};
/** Aicardo live: holds on the near side, then ARRIVES unseen onto the pass → first-time strike → wheels away toward the near corner */
const S_T0=T_HIT-.62;
const RUN0=C1.ortiz-.2;
const liveA:Gen=T=>{
 const stT=key(T,[[S_T0,.12],[S_T0+.3,.24],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,1]],linear);
 const X=key(T,[[0,-7.2],[RUN0,-8.4,easeIO],[S_T0,PLANT[0]+1.1,easeIn],[T_HIT,PLANT[0],easeOut],[T_HIT+.5,PLANT[0]-.4,easeOut],[C1.end,PLANT[0]+.8,easeIO]]);
 const Z=key(T,[[0,2.9],[RUN0,3.3,easeIO],[S_T0,PLANT[1]-.25,easeIn],[T_HIT,PLANT[1],easeOut],[T_HIT+.5,PLANT[1]-.3,easeOut],[C1.end,1.4,easeIO]]);
 let pose:Pose,yaw=FACE_LEFT+.25;
 if(T<RUN0)pose=blendPose(stand(),backpedal(T*.9),.35);
 else if(T<S_T0){const sp=.35+.5*sm(RUN0,S_T0,T);pose=blendPose(stand(),runCycle((T-RUN0)*runCadence(sp)*1.1,{speed:sp}),sm(RUN0,RUN0+.35,T));yaw=yawTo(PLANT[0]-(-8.4),PLANT[1]-3.3);}
 else if(T<T_HIT+.55){pose=blendPose(runCycle((S_T0-RUN0)*runCadence(.85)*1.1,{speed:.85}),strike(stT),sm(S_T0,S_T0+.12,T));yaw=lerp(yawTo(PLANT[0]-(-8.4),PLANT[1]-3.3),YAW_SHOT,sm(S_T0,S_T0+.3,T));}
 else{const u=sm(T_HIT+.55,T_HIT+1.1,T,easeIO);pose=blendPose(strike(1),celebrate((T-T_HIT-.55)*1.3,{kind:'run'}),u);yaw=lerp(YAW_SHOT,yawTo(.7,-1),u);}
 return{pose,yaw,X,Z};};
/** the ball: at Ortiz's feet → the slide LEFT, rolling (still quick when it reaches Aicardo) → struck low to the near post → in */
const PASS_EASE=(x:number)=>x*(1.3-.3*x);
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 if(T<PASS0-.4){const o=liveO(T);return{X:o.X-.5,Y:BALL_R,Z:o.Z+.12,flying:false,spin:T*6};}
 if(T<PASS0){const o=liveO(PASS0-.4),u=sm(PASS0-.4,PASS0-.1,T);return{X:lerp(o.X-.5,PASS_FROM[0],u),Y:BALL_R,Z:lerp(o.Z+.12,PASS_FROM[1],u),flying:false,spin:T*6};}
 if(T<T_HIT){const u=sm(PASS0,T_HIT,T,PASS_EASE);return{X:lerp(PASS_FROM[0],SHOT[0],u),Y:BALL_R,Z:lerp(PASS_FROM[1],SHOT[1],u),flying:false,spin:8+u*12};}
 if(T<T_IN){const u=sm(T_HIT,T_IN,T,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(SHOT[0],LOWC[0],.5),.46,lerp(SHOT[1],LOWC[2],.5)];
  return{X:a*SHOT[0]+b*M[0]+c*LOWC[0],Y:a*BALL_R+b*M[1]+c*LOWC[1],Z:a*SHOT[1]+b*M[2]+c*LOWC[2],flying:true,spin:20+u*40};}
 const d=sm(T_IN+.1,T_IN+.4,T,easeIn);
 return{X:GOAL_X-.6,Y:lerp(LOWC[1],BALL_R,d),Z:LOWC[2]+.1,flying:false,spin:60};
}
/** Italy (blue, defending −X, facing +X): drawn to Ortiz and the ball; the nearest man (0) turns too late for Aicardo's run */
type Mark={x:number[];z:number[];ph:number};
const ITALY:Mark[]=[{x:[-7.4,-8.6,-12.0],z:[8.2,8.0,8.3],ph:.1},{x:[-9.6,-11.4,-12.6],z:[11.8,11.2,10.8],ph:.4},{x:[-4.8,-6.8,-8.4],z:[14.6,14.0,13.4],ph:.7},{x:[-12.4,-13.4,-14.8],z:[13.0,12.4,11.6],ph:.2}];
const italyAt=(m:Mark,T:number):[number,number]=>{const u1=sm(0,PASS0,T),u2=sm(PASS0,T_HIT+.3,T);return[lerp(lerp(m.x[0],m.x[1],u1),m.x[2],u2),lerp(lerp(m.z[0],m.z[1],u1),m.z[2],u2)];};
const liveIta=(i:number):Gen=>T=>{const m=ITALY[i],[X,Z]=italyAt(m,T),post=sm(T_IN+.3,T_IN+1.3,T);let pose=backpedal(T*1.4+m.ph);
 if(i===0){const lu=key(T,[[T_HIT-.3,0],[T_HIT+.1,.6],[T_HIT+.6,1]],linear);pose=blendPose(pose,lunge(lu,{side:'r'}),sm(T_HIT-.4,T_HIT-.25,T));}
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20}),post);
 const look=i===0?lerp(0,-.9,sm(PASS0,T_HIT,T)):0;
 return{pose,yaw:FACE_RIGHT+look+(i%2?.2:-.2)*post,X,Z};};
/** Spain's other two (red): the far wing and the pivot; after the goal they run to Aicardo */
const ESP_POS:[number,number][]=[[-5.2,15.6],[-13.6,12.6]];
const liveEsp=(i:number):Gen=>T=>{const[x0,z0]=ESP_POS[i],go=sm(T_IN+.25,C1.end,T,easeIO),f=liveA(C1.end);const X=lerp(x0-1.2*sm(0,PASS0,T),f.X+[1.3,-1.1][i],go),Z=lerp(z0,f.Z+[1.2,1.3][i],go);
 let pose=blendPose(stand(),runCycle(T*runCadence(.3)+i*.5,{speed:.3}),.6*(1-sm(PASS0,PASS0+.5,T)));
 if(go>0)pose=blendPose(pose,celebrate(T*1.1+i*.3,{kind:'run'}),sm(T_IN+.25,T_IN+.7,T));
 return{pose,yaw:go>0?yawTo(f.X-x0,f.Z-z0):FACE_LEFT+(i?.4:-.2),X,Z};};
/** Mammarella: shading his near post as the ball comes left, then a late low dive toward it — beaten at the near post */
const DIVE0=T_HIT+.08;
const liveK:Gen=T=>{let pose=keeperSet(T*1.3),yaw=FACE_RIGHT;
 const b=liveBall(Math.min(T,T_HIT));
 if(T>=DIVE0){const u=sm(DIVE0,DIVE0+.9,T,linear)*.95;pose=blendPose(keeperSet(DIVE0*1.3),keeperDive(u,{side:'r',height:.1}),sm(DIVE0,DIVE0+.1,T));}
 yaw=FACE_RIGHT+.25*sm(PASS0,T_HIT,T);
 return{pose,yaw,X:GOAL_X+.85,Z:clamp(lerp(10,b.Z,.28),9.1,10.9)-.55*sm(DIVE0+.05,DIVE0+.5,T,easeOut)};};
const liveCam=(T:number)=>({x:key(T,mono([[0,-5.6],[C1.seventh,-6.4],[PASS0,-8.6],[T_HIT-.4,-14.2],[T_HIT,-15.6],[T_IN,-16.2],[T_IN+.5,-16.2],[C1.end-1,-14.6],[C1.end,-14.2]]),easeInOutSine),
 zoom:key(T,mono([[0,.58],[C1.zagreb,.56],[C1.seventh,.6],[PASS0,.62],[T_HIT-.3,.64],[T_IN,.66],[T_IN+.9,.74],[C1.end,.86]]),easeInOutSine),
 y:key(T,mono([[0,1120],[C1.seventh,1150],[PASS0,1200],[T_HIT,1240],[T_IN+.4,1260],[C1.end,1360]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_HIT,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.12+.35*pulse(T,C1.zagreb,1.2),flash:pulse(T,T_IN,1.2)+.5*pulse(T,C1.zagreb,1),bulge:.5*sm(T_IN-.12,T_IN,T)*(1-.6*sm(T_IN+.2,T_IN+1.1,T))+.12*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:LOWC[2],by:LOWC[1],
  keeper:()=>{athlete(s,st,liveK,T,MAMMA,{detail:'low'});},
  under:()=>{
   // "Spain against Italy": red rings on the reds, then blue on the blues (a roll-call of the two teams)
   const sp=easeOutBack(sm(C1.spain,C1.spain+.3,T))*(1-sm(C1.zagreb-.1,C1.zagreb+.2,T)),it=easeOutBack(sm(C1.spain+.6,C1.spain+.9,T))*(1-sm(C1.zagreb+.1,C1.zagreb+.4,T));
   if(sp>.02){const o=liveO(T),a=liveA(T);floorDashRing(s,st,R,o.X,o.Z,.7,7,511,sp);floorDashRing(s,st,R,a.X,a.Z,.7,7,512,sp);ESP_POS.forEach((_,i)=>{const e=liveEsp(i)(T);floorDashRing(s,st,R,e.X,e.Z,.7,7,513+i,sp);});}
   if(it>.02)ITALY.forEach((_,i)=>{const g=liveIta(i)(T);floorDashRing(s,st,Y,g.X,g.Z,.7,7,520+i,it);});
   // "Ortiz slides the ball left": the pass line draws ahead of the ball (yellow), from Ortiz to the space
   const pl=sm(C1.ortiz,C1.ortiz+.5,T,easeOut)*(1-sm(T_HIT,T_HIT+.3,T));if(pl>.02)floorArrow(s,st,Y,[PASS_FROM[0]-.3,PASS_FROM[1]-.2],[SHOT[0]+.3,SHOT[1]+.3],.1,530,pl,.08);
   // "Aicardo arrives": a red ring finds him and a red run arrow shows his arrival from behind the marker
   const a=liveA(T),find=easeOutBack(sm(C1.arrives,C1.arrives+.3,T))*(1-sm(T_HIT+.2,T_HIT+.5,T));floorDashRing(s,st,R,a.X,a.Z,.8,8,531,find);
   const run=sm(RUN0,RUN0+.6,T,easeOut)*(1-sm(T_HIT,T_HIT+.4,T));if(run>.02)floorArrow(s,st,R,[-8.2,2.9],[PLANT[0]+.8,PLANT[1]-.6],.09,532,run,-.12);
   // "near post": a yellow dashed ring on the floor at the post it went in by
   const np=easeOutBack(sm(C1.near,C1.near+.3,T))*(1-sm(C1.end-1,C1.end-.5,T));floorDashRing(s,st,Y,GOAL_X+.3,POST_N,.7,9,533,np);
  }});
 // everyone back to front by depth (far side first); the ball slots in by its depth
 type It={z:number;draw:()=>void};const items:It[]=[];
 ITALY.forEach((_,i)=>{const g=liveIta(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ITA(i),{detail:'mid'})});});
 ESP_POS.forEach((_,i)=>{const g=liveEsp(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i),{detail:'low'})});});
 items.push({z:liveO(T).Z,draw:()=>athlete(s,st,liveO,T,ORTIZ,{detail:'low'})});
 items.push({z:liveA(T).Z,draw:()=>athlete(s,st,liveA,T,AICARDO,{smear:T>T_HIT-.2&&T<T_HIT+.25?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45);
  if(b.flying){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_HIT,T-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.5,{seed:17,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.5:0,dir:Math.PI+.3});
  if(T>=T_HIT&&T<T_HIT+.3)sparkBurst(s,Y,p[0],p[1],r*3,{n:9,seed:19,g:easeOut(sm(T_HIT,T_HIT+.25,T))});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** a figure's chest (the passage enters his red shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveA(tt),.12));},still:T_HIT+.05};

// ================= chapter 2 — REPLAY: slow motion, low, behind Aicardo: the pass left, the near-post finish; Spain defend and win =================
const C2={watch:A(1,'Watch'),pass:A(1,'The pass'),hits:A(1,'Aicardo hits'),near:A(1,'near post'),then:A(1,'Then Spain'),defend:A(1,'defend'),win:A(1,'and win'),end:AUTH[1].seconds};
/** the rotation: live (X,Z) → replay (Z − 10, GZ − (X − GOAL_X)); live yaw → yaw − 90° (a rotation, so feet stay feet) */
const rot=(X:number,Z:number):[number,number]=>[Z-10,GZ-(X-GOAL_X)];
const rotGen=(g:Gen):Gen=>t=>{const a=g(t),[X,Z]=rot(a.X,a.Z);return{pose:a.pose,yaw:a.yaw-Math.PI/2,X,Z};};
/** replay clock → live clock: the pass at half speed, the strike and the ball into the net at a third; then real time for the aftermath */
const RL=(t:number)=>key(t,mono([[0,PASS0-.35],[C2.pass,PASS0+.05],[C2.hits+.15,T_HIT-.02],[C2.near+.2,T_IN+.02],[C2.then,T_IN+.9],[C2.end,T_IN+.9+(C2.end-C2.then)*.8]]),linear);
const R_HIT=key(T_HIT,[[PASS0-.35,0],[PASS0+.05,C2.pass],[T_HIT-.02,C2.hits+.15],[T_IN+.02,C2.near+.2]],linear),R_IN=C2.near+.2;
const repA=rotGen(liveA),repO=rotGen(liveO),repK=rotGen(liveK),repI=ITALY.map((_,i)=>rotGen(liveIta(i))),repE=ESP_POS.map((_,i)=>rotGen(liveEsp(i)));
function repBall(t:number){const b=liveBall(RL(t)),[X,Z]=rot(b.X,b.Z);return{X,Y:b.Y,Z,flying:b.flying};}
/** "Then Spain defend": in the aftermath the reds turn and jog back toward their own half (toward the camera) */
const backOff=(t:number,i:number)=>sm(C2.then,C2.end,t,easeIO)*(1.1+i*.3);
const A_SHOT=rot(SHOT[0],SHOT[1]);
const st2:Stage={F:2200,eye:1.6,cx:A_SHOT[0]-.6,cz:A_SHOT[1]-8};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,T=RL(tt),hit=pulse(t,R_HIT,.4),net=pulse(t,R_IN,.6),goal=T>=T_IN;
  camPath(s,t,[[0,260,260,1.0],[C2.pass,200,260,1.05],[C2.hits-.4,260,240,1.22],[R_HIT,360,220,1.32],[R_IN,560,190,1.45],[C2.near+.6,560,190,1.48],[C2.then,420,280,1.02],[C2.defend+.4,380,320,.94],[C2.end,380,320,.94]],[8*hit*Math.sin(t*90),5*hit*Math.cos(t*77)+4*net*Math.sin(t*60)]);
  const b=repBall(tt);
  arena(s,st,{t:tt,cheer:goal?1-.35*sm(C2.end-1,C2.end,tt):.1,flash:pulse(tt,R_IN,1.2)+.7*pulse(tt,C2.win,1.4),bulge:.55*sm(R_IN-.2,R_IN,tt)*(1-.6*sm(R_IN+.4,R_IN+1.4,tt))+.12*settle(tt,R_IN,{amp:1,freq:3,decay:3}),bx:-1.2,by:.34,
   keeper:stg=>{athlete(s,stg,repK,T,MAMMA,{detail:'mid'});}});
  // "The pass goes left": the pass line (yellow dashes) drawn along the ball's path
  const pl=sm(C2.pass,C2.pass+.4,tt,easeOut)*(1-sm(R_HIT+.3,R_HIT+.7,tt));
  if(pl>.02){const a=rot(PASS_FROM[0],PASS_FROM[1]),c=rot(SHOT[0]+.25,SHOT[1]+.2);floorArrow(s,st,Y,a,c,.08,640,pl,-.05);}
  // "near post": a yellow dashed ring at the post, and the flight line
  const np=easeOutBack(sm(C2.near,C2.near+.3,tt))*(1-sm(C2.then,C2.then+.4,tt));floorDashRing(s,st,Y,-1.5,GZ-.2,.55,9,641,np);
  if(tt>R_HIT&&T<T_IN+1){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=repBall(lerp(R_HIT,Math.min(tt,R_IN),k/14));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,10,642,{dash:40});}
  // "defend superbly": red dashed arrows point the reds back into shape (toward their own goal, behind the camera)
  const df=sm(C2.defend,C2.defend+.5,tt,easeOut);
  const reds:[Gen,AthleteStyle,number][]=[[repA,AICARDO,0],[repO,ORTIZ,1],[repE[0],ESP(0),2],[repE[1],ESP(1),3]];
  const red=(g:Gen,i:number):Gen=>q=>{const a=g(RL(q)),o=backOff(q,i);if(o<=0)return a;const u=sm(C2.then,C2.then+.5,q);return{pose:blendPose(a.pose,runCycle(q*runCadence(.4)+i*.3,{speed:.4}),u),yaw:lerp(a.yaw,FACE_CAMERA,u),X:a.X,Z:a.Z-o};};
  if(df>.02)reds.forEach(([g,,i])=>{const a=red(g,i)(tt);if(a.Z<st.cz+3)return;floorArrow(s,st,R,[a.X,a.Z-.3],[a.X,a.Z-2.2],.09,650+i,df);});
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(-.1,-.35);shadow(s,g[0],g[1],r*1.1,r*.3,96,b.flying?.3:.45);
   if(b.flying)speedLines(s,R,p[0],p[1],dir,{n:5,seed:604+Math.floor(tt*6),len:r*3.5,spread:r*.8,width:5});
   ball(s,p[0],p[1],r,97,{rot:tt*5,smear:b.flying?.4:0,dir});
   if(tt>=R_HIT&&tt<R_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:98,g:easeOut(sm(R_HIT,R_HIT+.3,tt))});};
  const its:{z:number;draw:()=>void}[]=[];
  repI.forEach((g,i)=>{const a=g(T);if(a.Z<st.cz+2.5)return;its.push({z:a.Z,draw:()=>athlete(s,st,g,T,ITA(i),{detail:'mid'})});});
  reds.forEach(([g,style,i])=>{const gg=red(g,i),a=gg(tt);if(a.Z<st.cz+(i===0?2.5:5.5))return;its.push({z:a.Z,draw:()=>athlete(s,st,gg,tt,style,{detail:i===0?'high':'mid',smear:i===0&&T>T_HIT-.3&&T<T_HIT+.3?.25:0})});});
  its.push({z:b.Z,draw:drawBall});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=R_IN&&tt<R_IN+1.2){const p=proj(st,-1.2,.34,GZ+.4);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:99,g:easeOut(sm(R_IN,R_IN+.3,tt))*(1-sm(R_IN+.8,R_IN+1.2,tt))});}
  // "and win": a big yellow tick stamps over the stands
  const tick=easeOutBack(sm(C2.win,C2.win+.35,tt));
  if(tick>.02){const c=proj(st,2.2,3.2,GZ+.5),S=170*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:660,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:661,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:662,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 aperture(t0){const{tt}=clock(1,t0),b=repBall(tt),p=proj(st2,b.X,b.Y,b.Z),r=Math.max(10,kAt(st2,b.Z)*BALL_R)*1.1,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return aperture(q);},
 still:R_HIT+.4,
};

// ================= chapter 3 — HOW HE DOES IT (demonstration, training bibs): watch the passer, read eyes + hips, step in early, steal it =================
const C3={how:A(2,'How does'),watches:A(2,'He watches'),notball:A(2,'not just the ball'),eyes:A(2,'Eyes and'),show:A(2,'show where'),steps:A(2,'So he steps'),steals:A(2,'steals'),lesson:A(2,'Watch the passer'),end:AUTH[2].seconds};
/** the demo: the passer (left, back to us) dribbles toward goal; the receiver waits on the right; Aicardo guards the lane between */
const PAS:[number,number]=[-2.9,GZ-10],RCV:[number,number]=[3.2,GZ-4.6];
const P_YAW0=yawTo(.2,1),P_YAW=yawTo(RCV[0]-PAS[0],RCV[1]-PAS[1]);
const D_PASS=C3.steps+.35,D_STEAL=C3.steals+.1;
/** Aicardo's lunge toe at full reach meets the pass on the lane (60 % of the way to the receiver) */
const LANE_U=.45,STEAL_PT:[number,number]=[lerp(PAS[0]+.5,RCV[0],LANE_U),lerp(PAS[1]+.3,RCV[1],LANE_U)];
const A_YAW=yawTo(-.55,-1);
const LT=toeBall(lunge(.6),BUILD,A_YAW),A_STEAL:[number,number]=[STEAL_PT[0]-LT[0],STEAL_PT[1]-LT[2]];
const A_HOME:[number,number]=[A_STEAL[0]+1.3,A_STEAL[1]+1.3];
const demoP:Gen=t=>{
 const pT=key(t,[[D_PASS-.4,.2],[D_PASS,STRIKE_CONTACT],[D_PASS+.55,.85]],linear);
 const open=sm(C3.eyes,C3.eyes+.8,t,easeIO);
 let pose:Pose=dribble(t*1.1,{foot:'r',speed:.2}),yaw=lerp(P_YAW0,P_YAW,open);
 // eyes: the head turns to the receiver ahead of the hips
 pose={...pose,neckY:pose.neckY-.5*sm(C3.eyes-.2,C3.eyes+.3,t)*(1-open*.6)};
 if(t>=D_PASS-.4){pose=blendPose(pose,strike(pT,{power:.3}),sm(D_PASS-.4,D_PASS-.28,t));yaw=P_YAW;}
 if(t>=D_PASS+.55)pose=blendPose(strike(.85,{power:.3}),posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:10,neckP:10,lShA:30,rShA:30,lElb:40,rElb:40}),sm(D_PASS+.55,D_PASS+1.1,t));
 return{pose,yaw,X:PAS[0],Z:PAS[1]+.25*sm(0,D_PASS,t)};};
const PB=toeBall(strike(STRIKE_CONTACT,{power:.3}),{height:1.78},P_YAW),P_BALL:[number,number]=[PAS[0]+PB[0],PAS[1]+.25+PB[2]];
const demoR:Gen=t=>{const u=sm(D_STEAL+.1,D_STEAL+.8,t,easeIO);return{pose:blendPose(blendPose(stand(),backpedal(t*.8),.3),posed({lHipF:14,rHipF:-4,lKnee:24,rKnee:14,lean:6,neckP:18,lShA:40,rShA:40,lShF:30,rShF:30,lElb:30,rElb:30}),u),yaw:yawTo(PAS[0]-RCV[0],PAS[1]-RCV[1]),X:RCV[0]-.5*sm(D_PASS,D_STEAL,t),Z:RCV[1]-.2*sm(D_PASS,D_STEAL,t)};};
const demoA:Gen=t=>{
 const X=key(t,[[0,A_HOME[0]],[C3.steps-.1,A_HOME[0]-.1],[D_STEAL-.25,A_STEAL[0],easeIO],[D_STEAL+.5,A_STEAL[0]],[C3.end,A_STEAL[0]+2.6,easeIO]]);
 const Z=key(t,[[0,A_HOME[1]],[C3.steps-.1,A_HOME[1]+.1],[D_STEAL-.25,A_STEAL[1],easeIO],[D_STEAL+.5,A_STEAL[1]],[C3.end,A_STEAL[1]-3.6,easeIO]]);
 const lu=key(t,[[D_STEAL-.45,0],[D_STEAL-.2,.3],[D_STEAL,.6],[D_STEAL+.5,1]],linear);
 let pose:Pose=blendPose(stand(),backpedal(t*.9),.3),yaw=yawTo(PAS[0]-A_HOME[0],PAS[1]-A_HOME[1]);
 // he watches the PASSER: head up and on him (not down at the ball)
 pose={...pose,neckP:pose.neckP-.2*sm(C3.watches,C3.watches+.3,t)};
 if(t>=C3.steps-.1&&t<D_STEAL-.45){pose=blendPose(pose,runCycle(t*runCadence(.7),{speed:.7}),sm(C3.steps-.1,C3.steps+.1,t));yaw=yawTo(A_STEAL[0]-A_HOME[0],A_STEAL[1]-A_HOME[1]);}
 else if(t>=D_STEAL-.45&&t<D_STEAL+.6){pose=blendPose(runCycle((D_STEAL-.45)*runCadence(.7),{speed:.7}),lunge(lu),sm(D_STEAL-.45,D_STEAL-.3,t));yaw=A_YAW;}
 else if(t>=D_STEAL+.6){pose=blendPose(lunge(1),dribble((t-D_STEAL)*1.5,{foot:'r',speed:.5}),sm(D_STEAL+.6,D_STEAL+.9,t));yaw=lerp(A_YAW,yawTo(.6,-1),sm(D_STEAL+.6,D_STEAL+1,t));}
 return{pose,yaw,X,Z};};
function demoBall(t:number):{X:number;Z:number;moving:boolean}{
 if(t<D_PASS-.3){const p=demoP(t),f=[Math.cos(p.yaw),Math.sin(p.yaw)];return{X:p.X+f[0]*.45,Z:p.Z+f[1]*.45,moving:false};}
 if(t<D_PASS){const p=demoP(D_PASS-.3),f=[Math.cos(p.yaw),Math.sin(p.yaw)],u=sm(D_PASS-.3,D_PASS-.05,t);return{X:lerp(p.X+f[0]*.45,P_BALL[0],u),Z:lerp(p.Z+f[1]*.45,P_BALL[1],u),moving:false};}
 if(t<D_STEAL){const u=sm(D_PASS,D_STEAL,t,PASS_EASE);return{X:lerp(P_BALL[0],STEAL_PT[0],u),Z:lerp(P_BALL[1],STEAL_PT[1],u),moving:true};}
 if(t<D_STEAL+.6)return{X:STEAL_PT[0]+.05,Z:STEAL_PT[1]-.08*sm(D_STEAL,D_STEAL+.3,t),moving:false};
 const a=demoA(t),f=[Math.cos(a.yaw),Math.sin(a.yaw)];return{X:lerp(STEAL_PT[0]+.05,a.X+f[0]*.5,sm(D_STEAL+.6,D_STEAL+.95,t)),Z:lerp(STEAL_PT[1]-.08,a.Z+f[1]*.5,sm(D_STEAL+.6,D_STEAL+.95,t)),moving:false};}
const st3:Stage={F:1500,eye:3.6,cx:.2,cz:GZ-17};
/** a head position in our coords */
const headAt=(g:Gen,t:number,build:Build):[number,number,number]=>{const a=g(t),sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw));return toMine(sk.head);};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  camPath(s,t,[[0,-150,420,1.28],[C3.watches,-200,410,1.36],[C3.notball,-320,480,1.6],[C3.eyes,-170,410,1.34],[C3.show,-110,400,1.28],[C3.steps,-110,420,1.3],[D_STEAL,-40,440,1.5],[C3.lesson,-100,410,1.3],[C3.end,-80,410,1.26]]);
  const b=demoBall(tt);
  arena(s,st,{t:tt,cheer:0});
  // "not just the ball": a yellow ring round the ball that shrinks away (look up, not down)
  const nb=sm(C3.notball,C3.notball+.25,tt)*(1-sm(C3.notball+.9,C3.notball+1.3,tt));if(nb>.02)floorDashRing(s,st,Y,b.X,b.Z,.45*(1.4-nb*.4),7,701,nb);
  // "show where the pass will go": the predicted lane, dashed navy, passer → receiver, with the receiver's spot ringed
  const lane=sm(C3.show,C3.show+.5,tt,easeOut)*(1-sm(D_STEAL+.4,D_STEAL+.8,tt));
  if(lane>.02){floorArrow(s,st,K,[P_BALL[0]+.2,P_BALL[1]+.1],[RCV[0]-.4,RCV[1]-.25],.08,702,lane,.02);floorDashRing(s,st,K,RCV[0],RCV[1],.65,8,703,lane);}
  // "Eyes and hips": red floor arrow from the passer's hips toward where they point
  const hp=sm(C3.eyes+.3,C3.eyes+.8,tt,easeOut)*(1-sm(C3.steps,C3.steps+.4,tt));
  if(hp>.02){const p=demoP(tt);floorArrow(s,st,R,[p.X+Math.cos(p.yaw)*.4,p.Z+Math.sin(p.yaw)*.4],[p.X+Math.cos(p.yaw)*2.2,p.Z+Math.sin(p.yaw)*2.2],.09,704,hp);}
  // "So he steps in early": a red ring snaps round Aicardo's step point on the lane
  const stp=easeOutBack(sm(C3.steps,C3.steps+.3,tt))*(1-sm(D_STEAL+.3,D_STEAL+.7,tt));floorDashRing(s,st,R,STEAL_PT[0],STEAL_PT[1],.6,9,705,stp);
  const its:{z:number;draw:()=>void}[]=[
   {z:demoP(tt).Z,draw:()=>athlete(s,st,demoP,tt,DEMO(0),{detail:'mid'})},
   {z:demoR(tt).Z,draw:()=>athlete(s,st,demoR,tt,DEMO(1),{detail:'mid'})},
   {z:demoA(tt).Z,draw:()=>athlete(s,st,demoA,tt,AICARDO_TRAIN,{detail:'high',smear:tt>D_STEAL-.4&&tt<D_STEAL+.1?.18:0})},
   {z:b.Z,draw:()=>{const p=proj(st,b.X,BALL_R,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(-.3,1);shadow(s,g[0],g[1],r*1.1,r*.3,706,.45);
    if(b.moving)speedLines(s,R,p[0],p[1],dir,{n:4,seed:707+Math.floor(tt*6),len:r*2.6,spread:r*.7,width:4});
    ball(s,p[0],p[1],r,708,{rot:tt*5,smear:b.moving?.3:0,dir});
    if(tt>=D_STEAL&&tt<D_STEAL+.45)sparkBurst(s,Y,p[0],p[1],r*3,{n:10,seed:709,g:easeOut(sm(D_STEAL,D_STEAL+.3,tt))});}},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "He watches the passer" (and again at the lesson): a red dashed sight line from Aicardo's eyes to the passer's head
  const w1=sm(C3.watches,C3.watches+.4,tt,easeOut)*(1-sm(C3.eyes-.1,C3.eyes+.2,tt)),w2=sm(C3.lesson,C3.lesson+.4,tt,easeOut);
  const ww=Math.max(w1,w2);
  if(ww>.02){const a=headAt(demoA,tt,BUILD),p=headAt(demoP,tt,{height:1.78});dashed(s,R,[proj(st,a[0],a[1]+.05,a[2]),proj(st,(a[0]+p[0])/2,Math.max(a[1],p[1])+.35,(a[2]+p[2])/2),proj(st,p[0],p[1]+.05,p[2])],9,710,{dash:34,progress:ww});}
  // "Eyes": a yellow sight line from the passer's eyes to the receiver — where he looks is where it goes
  const ey=sm(C3.eyes,C3.eyes+.4,tt,easeOut)*(1-sm(D_PASS,D_PASS+.3,tt));
  if(ey>.02){const p=headAt(demoP,tt,{height:1.78}),r=headAt(demoR,tt,{height:1.81});dashed(s,Y,[proj(st,p[0],p[1]+.05,p[2]),proj(st,(p[0]+r[0])/2,Math.max(p[1],r[1])+.3,(p[2]+r[2])/2),proj(st,r[0],r[1]+.05,r[2])],9,711,{dash:34,progress:ey});}
  // "steals it": a big yellow tick stamps beside the steal; at the lesson it stays
  const tick=easeOutBack(sm(C3.steals+.3,C3.steals+.65,tt));
  if(tick>.02){const c=proj(st,STEAL_PT[0]+3.6,1.6,STEAL_PT[1]+.6),S=140*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:712,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:713,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:714,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoA(tt),.13));},
 still:D_STEAL+.3,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'aicardo-futsal-signature',format:'futsal',title:'Aicardo reads the game',theme:'Watch the passer, not just the ball, to see where it’s going.',
 ageNote:'For players aged 7–12: the 2012 EURO semi-final goal is real; the last chapter is a training demonstration of how he reads the game.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls across the touch point and is STOPPED dead by an interception — a yellow spark and a red stop bar; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.5),bx=x-110+110*easeOut(u);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.22,seed+2,{n:16}),true),.3);
  if(u<1)speedLines(s,R,bx,y,0,{n:4,seed:seed+1,len:r*2.6,spread:r*.8,width:5});
  else{const g=easeOut(clamp((age-.5)/.3));s.fill(R,ribbon([[x+r*1.25,y-r*1.1],[x+r*1.25,y+r*1.1]],10*g+2,{seed:seed+3,taper:.2,wobble:1}));if(age<1)sparkBurst(s,Y,x+r*.9,y,r*2.2,{n:8,seed:seed+4,g});}
  ball(s,bx,y,r,seed,{rot:age*10*(1-u*.8),smear:u<1?.35*(1-u):0,dir:0});
 },
};
export default film;
