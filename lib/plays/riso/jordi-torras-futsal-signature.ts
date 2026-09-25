/** Jordi Torras — "the direct run from the wing": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Jordi Torras Badosa (born 24 Sep 1980, Sant Vicenç dels Horts), the Spanish ala of FC Barcelona and Spain (135 caps). Card bio
 * (lib/town/playerBios.json): "Left-footed Spanish ala who captained Barcelona and Spain, won the 2004 World Cup and played in four Euros";
 * playerAppearance.json country "Spain". Wikipedia's page (Jordi Torras) matches: Spain 2000–2015, Barcelona 1996–2003 and 2010–2014,
 * world champion 2004, European champion 2005/2007/2010/2012. Same player — no mismatch.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature, not one match, and no written source describes one of his direct
 * runs from the wing, so the film follows the brief's honest fallback: a real-match chapter that recreates ONLY a goal UEFA.com describes in
 * words, then a clearly labelled demonstration ("This is how he attacks from the wing") in training kit. The match is the UEFA Futsal
 * EURO 2012 QUARTER-FINAL, Romania 3–8 Spain, 6 Feb 2012, 18:30 CET, Arena Zagreb — the tournament where Torras won the Golden Boot, and
 * a match where he scored a hat-trick. No other futsal film uses it (Paco Sedano: the 2014 UEFA Futsal Cup semi v Araz; Aicardo: the EURO
 * 2012 semi v Italy; Luis Amado / Sergio Lozano: the EURO 2012 final; Falcão / Eder Lima: the 2012 World Cup final; Gabriel: the 2014
 * UEFA Futsal Cup final).
 *  1  LIVE (broadcast camera, main stand, real time): 3:25 — "Kike's back-heel gave Alemao the chance to send in a low ball from the left
 *     which was turned in by Torras." Romania 0–1 Spain.
 *  2  REPLAY (slow motion, low, behind Torras's run): he attacks the space and gets to the ball first; 0–1. Then only the score bug moves
 *     (no goal is staged): 19:14 "Torras curls past Iancu" (4–2 at half-time), 29:31 "Torras rolls into an unguarded net" (6–3, hat-trick),
 *     full time 3–8.
 *  3  HOW HE DOES IT (a demonstration, no match claimed; training bib, neutral defenders and keeper): run straight at the space in front of
 *     you from the right wing, beat one defender, shoot early before the block comes. From the entry's `lesson`: "Attack the space in front of
 *     you and shoot before the block comes." (params side right, beaten 1)
 * Sources (written; ≤ 8 requests, 5 s apart, cached in scratchpad/films/src-cache/):
 *  - UEFA.com match report "Spain's Torras treble ends Romania hopes", Paul Saffer, Arena Zagreb, 6 Feb 2012 (archived 26 Nov 2012):
 *    https://web.archive.org/web/20121126020324/http://www.uefa.com/futsaleuro/season=2012/matches/round=2000147/match=2008814/postmatch/report/index.html
 *    (uefa-futsaleuro2012-qf-rou-esp-report.txt) — "It was 1-0 on four minutes when Kike's back-heel gave Alemao the chance to send in a low
 *    ball from the left which was turned in by Torras"; "just before the break Torras bent in his fourth goal of the finals"; "Torras then
 *    completed his hat-trick, rolling into an unguarded net to take the adidas Golden Boot lead on five goals"; photo caption "Torras
 *    celebrates making it 4-2"; Romania's keeper Vlad Iancu.
 *  - UEFA.com minute-by-minute commentary, same match (uefa-futsaleuro2012-qf-rou-esp-commentary.txt): goal times Torras 3:25, 19:14,
 *    29:31; Aicardo 13:28, 26:50; Rafael Usín 16:10; Lin 29:48; Ortiz 37:03; Gherman 8:21, 14:07; Matei 24:59; "Torras turning in Alemao's
 *    centre from the left"; "Torras curls past Iancu"; "Romania had most of the ball in the first couple of minutes"; Iancu saves at 3:13.
 *  - The report's photo of Torras celebrating (uefa-futsaleuro2012-qf-rou-esp-torras.jpg): a WHITE Spain shirt with red trim, short dark hair.
 *  - Wikipedia, "UEFA Futsal Euro 2012" (raw, cached): QF 6 Feb 2012, 18:30, Romania 3–8 Spain, Arena Zagreb, attendance 1,516; top scorer
 *    Jordi Torras (5 goals). Wikipedia, "Jordi Torras" (raw): 1.83 m, ala / cierre, career and honours above.
 * CONFIRMED: match, date, venue, score line and goal times; the 1–0 move (Kike back-heel → Alemao's low ball from the left → Torras turns
 *  it in); Romania's keeper Iancu; Spain in white shirts that day (photo); the later curler and the roll into an unguarded net; the hat-trick;
 *  8–3; Torras's Golden Boot lead.
 * INFERRED (not named in the narration): which end Spain attacked; every player's exact position; the foot Torras used (the card says
 *  left-footed, so the demonstration shoots left-footed); Spain's shorts (navy) and number 4 (his number at the 2008 and 2012 World Cups);
 *  Romania's kit (yellow shirts, blue shorts) and Iancu's (red, long sleeves); the demonstration's defenders, keeper and red training bib.
 *  No video was reviewed. Chapter 3 is a demonstration of the lesson, not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the finishes). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: red (Spain trim, Iancu, rings, the bib), yellow (Romania shirts, lights, flight lines), blue (court, Romania shorts), navy (key line).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';


// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: EURO 2012 quarter-final',text:'Futsal Euro 2012. Spain, in white, against Romania. Kike back-heels to Alemao, a low ball across, Jordi Torras turns it in! One nil to Spain!',tail:2.4,
  cues:['Futsal Euro','Spain, in white','Kike back','low ball','Jordi Torras','turns it','One nil'],heads:{'Futsal Euro':'EURO 2012','One nil':'0–1'}},
 {label:'Replay: first to the ball',text:'Watch again. Torras attacks the space and gets to the ball first. Later he curls in another, then rolls in a third. Three goals! Spain win eight three.',tail:2.4,
  cues:['Watch again','Torras attacks','gets to','Later he','then rolls','Three goals','Spain win'],heads:{'Later he':'2–4','then rolls':'3–6','Three goals':'Hat-trick','Spain win':'3–8'}},
 {label:'How he does it: the direct run',text:'This is how he attacks from the wing. Run straight at the space in front of you. Beat your defender, then shoot early, before the block comes!',tail:2.6,
  cues:['This is how','Run straight','space in front','Beat your','shoot early','before the block'],heads:{'Run straight':'Attack the space','shoot early':'Shoot early'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/jordi-torras-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/jordi-torras-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/jordi-torras-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('torras: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('torras: no cue '+w);return c.at;};
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

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.8],[R,.3]];
const BUILD={height:1.83,bulk:1};
/** Jordi Torras: Spain's WHITE shirt with red trim that day (photo); navy shorts and no. 4 inferred; short dark hair; 1.83 m */
const TORRAS:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:SKIN,hair:K,line:K,trim:R,number:4,numberInk:R,hairStyle:'short',build:BUILD,seed:4};
/** the demonstration: Torras in a red training bib (no match claimed) */
const TORRAS_BIB:AthleteStyle={...TORRAS,shirt:R,trim:Y,socks:K,number:undefined,seed:5};
const ESP=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.72],[R,.22]],hair:K,line:K,trim:R,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Romania (yellow shirts, blue shorts — inferred) */
const ROU=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:Y,boots:K,skin:[[Y,.62],[R,.2]],hair:n%3?K:[K,.6],line:K,trim:R,hairStyle:n%2?'short':'balding',build:{height:1.74+hash(n,3)*.12},seed:20+n});
/** Vlad Iancu, Romania's keeper — red, long sleeves (inferred) */
const IANCU:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.7],[R,.26]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:62};
/** the demonstration defenders and keeper: neutral paper/navy training kits */
const DEMO_D=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:n?'short':'curly',build:{height:1.8,bulk:1.04},seed:77+n});
const DEMO_K:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.7],[R,.2]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:79};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[R,.6],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
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
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.12)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.34)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Russia's goal at X = +20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true);s.knockout(court,.25);s.fill(B,court,.82);
 s.fill(B,polyPath(floorQuad(st,-20,6,20,13),true),.12);
 // painted lines: touchlines, goal line, halfway, the penalty area (6 m arcs from the posts), the 6 m and 10 m marks, the centre circle
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X-6,GOAL_X-10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st,bulge,bz,by);o.keeper?.();sidePosts(s,st);
}
/** the goal at X = +20 seen side-on: the net runs back to +X */
function sideGoal(s:Sheet,st:Stage,bulge:number,bz:number,by:number){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((Z-bz)**2+(Yh-by)**2)/.35);return proj(st,GOAL_X+lerp(Db,Dt,Yh/H)+d,Yh,Z);};
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
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;glow?:number};
/** the court seen end-on: blue floor + run-off, paper lines (goal line and the D), boards, stands, the goal */
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0,glow=0}=o;
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
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalEnd(s,st,bulge,bx,by,glow);o.keeper?.(st);postsEnd(s,st);
}
function goalEnd(s:Sheet,st:Stage,bulge:number,bx:number,by:number,glow:number){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((X-bx)**2+(Yh-by)**2)/.35);return proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H)+d);};
 const out=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 // "the goal is small": the mouth glows yellow (only 3 × 2 m)
 if(glow>.02)s.fill(Y,polyPath([out[0],out[1],out[2],out[3]],true),.45*glow);
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

/** where the ball sits at a strike's contact: just past the kicking toe along the foot (library coords, place at the origin) */
function strikeBall(yaw:number,foot:'l'|'r',power=1):V3{const sk=solve(strike(STRIKE_CONTACT,{foot,power}),BUILD,{yaw}),toe=foot==='l'?sk.lToe:sk.rToe,an=foot==='l'?sk.lAn:sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}
/** a quadratic ball flight a → b through a mid height */
function flight(a:V3,b:V3,u:number,mid:number):V3{const q=(1-u)*(1-u),w=2*u*(1-u),c=u*u,M:V3=[lerp(a[0],b[0],.5),mid,lerp(a[2],b[2],.5)];return[q*a[0]+w*M[0]+c*b[0],q*a[1]+w*M[1]+c*b[1],q*a[2]+w*M[2]+c*b[2]];}
/** a floor arrow (dashed, knocked out on the court) from a to b on the floor; progress draws it on */
function floorArrow(s:Sheet,st:Stage,ink:string,a:[number,number],b:[number,number],w:number,seed:number,progress:number){
 if(progress<=.02)return;const pts:Pt[]=[];for(let k=0;k<=10;k++){const u=k/10;pts.push(proj(st,lerp(a[0],b[0],u),0,lerp(a[1],b[1],u)));}
 const q=partial(pts,clamp(progress));if(q.length<2)return;dashed(s,ink,q,w,seed,{dash:w*3.6});if(progress>.9)arrowHead(s,ink,q,w*3,seed+1);}
/** a player's chest (the passage enters the shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
/** camera keys → [x, y, zoom] (so the HUD can pin itself to the composition box) */
function camAt(t:number,K0:Key[]):[number,number,number]{const v=key(t,padKeys(mono(K0),[0,0,1,0]),easeInOutSine,true);return[v[0]||0,v[1]||0,Number.isFinite(v[2])?v[2]:1];}

// ---------------- the TV score bug (a riso seven-segment board pinned to the top-left of the box): ROU v ESP + the match clock ----------------
const SEG:Record<string,number[]>={'0':[1,1,1,1,1,1,0],'1':[0,1,1,0,0,0,0],'2':[1,1,0,1,1,0,1],'3':[1,1,1,1,0,0,1],'4':[0,1,1,0,0,1,1],'5':[1,0,1,1,0,1,1],'6':[1,0,1,1,1,1,1],'7':[1,1,1,0,0,0,0],'8':[1,1,1,1,1,1,1],'9':[1,1,1,1,0,1,1]};
const SEGL:[Pt,Pt][]=[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[1,2]],[[0,2],[1,2]],[[0,1],[0,2]],[[0,0],[0,1]],[[0,1],[1,1]]];
function digits(path:Path2D,str:string,x:number,y:number,h:number,seed:number,sy=1):number{
 const w=h*.5,gap=h*.26,lw=h*.13;let cx=x;
 for(const ch of str){
  if(ch===':'){for(const dy of[.6,1.4])path.addPath(polyPath(blob(cx+lw*.6,y+dy*h/2,lw*.62,lw*.62,seed+dy*7,{n:10}),true));cx+=lw*1.2+gap;continue;}
  const on=SEG[ch];if(!on){cx+=w+gap;continue;}
  on.forEach((v,i)=>{if(!v)return;const[a,b]=SEGL[i],p:Pt[]=[[cx+a[0]*w,y+h/2+(a[1]-1)*h/2*sy],[cx+b[0]*w,y+h/2+(b[1]-1)*h/2*sy]];path.addPath(ribbon(p,lw,{seed:seed+i,taper:0,wobble:.4}));});
  cx+=w+gap;}
 return cx-x-gap;
}
const mmss=(sec:number)=>{const s0=Math.max(0,Math.min(2400,Math.floor(sec)));return String(Math.floor(s0/60)).padStart(2,'0')+':'+String(s0%60).padStart(2,'0');};
/** the board, centred at c, k units per "metre" (6 × 3): Romania (blue-yellow-red, vertical) left, Spain (red-yellow-red) right */
function scoreboard(s:Sheet,c:Pt,k:number,b:{home:number;away:number;clock:string;flip:number;glow:number;flipHome?:number},seed:number){
 const W=6*k,H=3*k,x0=c[0]-W/2,y0=c[1]-H/2,box=handCut([[x0,y0],[x0+W,y0],[x0+W,y0+H],[x0,y0+H]],seed,k*.05,k*.9);
 if(b.glow>.02)s.fill(Y,polyPath(blob(c[0],c[1],W*.62*(1+.08*b.glow),H*.75*(1+.1*b.glow),seed+3,{amp:.04,n:28}),true),.35*b.glow);
 const bp=polyPath(box,true);s.knockout(bp);s.fill(K,bp,.92);s.fill(R,ribbon([...box,box[0]],k*.09,{seed:seed+4,close:true,wobble:.6}));
 const sw=k*.9,sh=k*.62,ly=y0+H*.2;
 const hx=x0+k*.35,hp=polyPath(handCut([[hx,ly],[hx+sw,ly],[hx+sw,ly+sh],[hx,ly+sh]],seed+5,k*.02,k*.4),true);s.knockout(hp);
 s.fill(B,rectPath(hx,ly,sw/3,sh));s.fill(Y,rectPath(hx+sw/3,ly,sw/3,sh));s.fill(R,rectPath(hx+sw*2/3,ly,sw/3,sh));
 const ax=x0+W-k*.35-sw,ap=polyPath(handCut([[ax,ly],[ax+sw,ly],[ax+sw,ly+sh],[ax,ly+sh]],seed+6,k*.02,k*.4),true);s.knockout(ap);s.fill(R,ap);s.fill(Y,rectPath(ax,ly+sh*.25,sw,sh*.5));
 const dh=H*.36,num=new Path2D(),sq=(f:number)=>1-.8*Math.sin(Math.PI*clamp(f));
 digits(num,String(b.home),c[0]-k*1.35,ly-dh*.02,dh,seed+10,sq(b.flipHome??0));digits(num,String(b.away),c[0]+k*.85,ly-dh*.02,dh,seed+20,sq(b.flip));
 num.addPath(ribbon([[c[0]-k*.32,ly+dh*.5],[c[0]+k*.32,ly+dh*.5]],dh*.13,{seed:seed+30,taper:0}));s.knockout(num);
 const clk=new Path2D(),ch=H*.2,cw=digits(new Path2D(),b.clock,0,0,ch,0);digits(clk,b.clock,c[0]-cw/2,y0+H*.7,ch,seed+40);s.knockout(clk);s.fill(Y,clk);
}
/** pinned to the top-left of the composition box whatever the camera does */
function scoreBug(s:Sheet,cm:[number,number,number],b:{home:number;away:number;clock:string;flip:number;glow:number;flipHome?:number},show:number,size=62){
 if(show<=.02)return;const[x,y,z]=cm,k=size/z*easeOutBack(clamp(show)),c:Pt=[x-(BOX_W/2-40)/z+3.3*k,y-(BOX_H/2-40)/z+1.6*k];scoreboard(s,c,k,b,811);}

// ================= chapter 1 — LIVE: EURO 2012 QF, Romania v Spain, 3:25 — Kike back-heel → Alemao low ball from the left → Torras turns it in =================
const C1={euro:A(0,'Futsal'),spain:A(0,'Spain'),kike:A(0,'Kike'),low:A(0,'low ball'),jordi:A(0,'Jordi'),turns:A(0,'turns'),one:A(0,'One nil'),end:AUTH[0].seconds};
/** the tap: contact a beat before "turns it"; the ball is in 0.28 s later (so the net moves on "turns") */
const T_TAP=Math.max(C1.jordi+.3,C1.turns-.3),T_NET=T_TAP+.28,CROSS=T_TAP-1.0,HEEL=C1.kike+.35,HEEL_IN=HEEL+.6;
const P0=[C1.spain+.5,C1.spain+1.3];
/** Spain attack the goal at X = +20 (inferred end). Alemao is on Spain's LEFT = the far side (+Z); Torras comes in from the near side. */
const FIXO:[number,number]=[9.4,8.6],KIKE:[number,number]=[15.2,13.0],ALE_IN:[number,number]=[16.7,15.9],CROSS_B:[number,number]=[17.4,15.3],TAP_B:[number,number]=[18.0,9.5];
const NETP:V3=[20.3,.24,9.2];
const TYAW=yawTo(NETP[0]-TAP_B[0],NETP[2]-TAP_B[1]),TSB=toMine(strikeBall(TYAW,'l',.5)),TPL:[number,number]=[TAP_B[0]-TSB[0],TAP_B[1]-TSB[2]];
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 const roll=(a:[number,number],b:[number,number],t0:number,t1:number,sp=8)=>{const u=sm(t0,t1,T,easeOut);return{X:lerp(a[0],b[0],u),Y:BALL_R,Z:lerp(a[1],b[1],u),flying:false,spin:u*sp};};
 const kikeB:[number,number]=[KIKE[0]+.25,KIKE[1]+.2];
 if(T<P0[0])return{X:FIXO[0]+.45,Y:BALL_R,Z:FIXO[1],flying:false,spin:0};
 if(T<HEEL)return roll([FIXO[0]+.45,FIXO[1]],kikeB,P0[0],P0[1]);
 if(T<HEEL_IN+.05)return roll(kikeB,ALE_IN,HEEL,HEEL_IN,5);
 if(T<CROSS)return roll(ALE_IN,CROSS_B,HEEL_IN+.35,CROSS-.25,6);
 if(T<T_TAP)return roll(CROSS_B,TAP_B,CROSS,T_TAP+.12,14);
 if(T<T_NET){const u=sm(T_TAP,T_NET,T,linear),p=flight([TAP_B[0],BALL_R,TAP_B[1]],NETP,u,.3);return{X:p[0],Y:p[1],Z:p[2],flying:true,spin:20+u*30};}
 const d=sm(T_NET+.1,T_NET+.4,T,easeIn);return{X:NETP[0]+.35,Y:lerp(NETP[1],BALL_R,d),Z:NETP[2],flying:false,spin:50};
}
/** Torras live: holds the near side, then attacks the space in front of him as Alemao shapes to cross, meets it first and turns it in; wheels away */
const TOR0:[number,number]=[11.2,3.6],TORW:[number,number]=[12.6,4.6];
const liveT:Gen=T=>{
 const stT=key(T,[[T_TAP-.34,.22],[T_TAP,STRIKE_CONTACT],[T_TAP+.5,1]],linear),go=T_TAP-1.5;
 const X=key(T,[[0,TOR0[0]],[go,TORW[0],easeIO],[T_TAP-.34,TPL[0]-.5,easeIn],[T_TAP,TPL[0],easeOut],[T_TAP+.5,TPL[0]+.4,easeOut],[C1.end,15.4,easeIO]]);
 const Z=key(T,[[0,TOR0[1]],[go,TORW[1],easeIO],[T_TAP-.34,TPL[1]-.7,easeIn],[T_TAP,TPL[1],easeOut],[T_TAP+.5,TPL[1]-.15,easeOut],[C1.end,2.4,easeIO]]);
 let pose:Pose,yaw=yawTo(TPL[0]-TORW[0],TPL[1]-TORW[1]);
 if(T<go)pose=blendPose(stand(),runCycle(T*runCadence(.2),{speed:.2}),.5+.5*Math.sin(T*.9));
 else if(T<T_TAP-.4)pose=runCycle(T*runCadence(.9),{speed:.9});
 else if(T<T_TAP+.55){pose=blendPose(runCycle((T_TAP-.4)*runCadence(.9),{speed:.9}),strike(stT,{foot:'l',power:.5}),sm(T_TAP-.4,T_TAP-.3,T));yaw=lerp(yaw,TYAW,sm(T_TAP-.4,T_TAP-.2,T));}
 else{const u=sm(T_TAP+.55,T_TAP+1.1,T,easeIO);pose=blendPose(strike(1,{foot:'l',power:.5}),celebrate((T-T_TAP-.55)*1.3,{kind:'run'}),u);yaw=lerp(TYAW,yawTo(-.5,-1),u);}
 if(T<go)yaw=lerp(yawTo(1,.4),yawTo(TPL[0]-TORW[0],TPL[1]-TORW[1]),sm(go-.6,go,T));
 return{pose,yaw,X,Z};
};
/** Kike: receives from the fixo facing back up the court (back to goal), back-heels it round the corner to Alemao */
const liveKike:Gen=T=>{
 const heel=posed({lHipF:-34,lKnee:88,lAnk:34,lHipA:8,rKnee:30,rHipF:16,lean:22,neckP:34,neckY:30,lShA:30,rShA:34,lElb:40,rElb:44,twist:-10});
 let pose=stand();pose=blendPose(pose,heel,sm(HEEL-.25,HEEL,T)*(1-sm(HEEL+.25,HEEL+.7,T)));
 const go=sm(T_NET+.2,C1.end,T,easeIO),f=liveT(C1.end);if(go>0)pose=blendPose(pose,celebrate(T*1.1,{kind:'run'}),sm(T_NET+.2,T_NET+.6,T));
 return{pose,yaw:go>0?yawTo(f.X-KIKE[0],f.Z-KIKE[1]):FACE_LEFT+.25,X:lerp(KIKE[0],f.X+1.1,go),Z:lerp(KIKE[1],f.Z+.9,go)};};
/** Alemao: runs onto the back-heel on the left (far side), one touch, the low ball across */
const ALE0:[number,number]=[13.2,17.4],AYAW=yawTo(TAP_B[0]-CROSS_B[0],TAP_B[1]-CROSS_B[1]),ASB=toMine(strikeBall(AYAW,'l',.6)),APL:[number,number]=[CROSS_B[0]-ASB[0],CROSS_B[1]-ASB[2]];
const liveAle:Gen=T=>{
 const stT=key(T,[[CROSS-.34,.22],[CROSS,STRIKE_CONTACT],[CROSS+.5,1]],linear),go=sm(T_NET+.3,C1.end,T,easeIO),f=liveT(C1.end);
 const X=key(T,[[0,ALE0[0]],[HEEL,ALE0[0]+1.4,easeIO],[HEEL_IN,ALE_IN[0]-.5,easeOut],[CROSS-.34,APL[0]-.25,easeIO],[CROSS,APL[0],easeOut],[CROSS+.6,APL[0]+.2]]);
 const Z=key(T,[[0,ALE0[1]],[HEEL,ALE0[1]-.3,easeIO],[HEEL_IN,ALE_IN[1]+.2,easeOut],[CROSS-.34,APL[1]+.2,easeIO],[CROSS,APL[1],easeOut],[CROSS+.6,APL[1]-.2]]);
 let pose:Pose,yaw=yawTo(1,-.35);
 if(T<HEEL_IN)pose=runCycle(T*runCadence(.7),{speed:.7});
 else if(T<CROSS-.4)pose=dribble((T-HEEL_IN)*1.6,{foot:'l',speed:.35});
 else{pose=blendPose(dribble((CROSS-.4-HEEL_IN)*1.6,{foot:'l',speed:.35}),strike(stT,{foot:'l',power:.6}),sm(CROSS-.4,CROSS-.3,T));yaw=lerp(yawTo(1,-.35),AYAW,sm(CROSS-.45,CROSS-.2,T));}
 if(go>0){pose=blendPose(pose,celebrate(T*1.1+.4,{kind:'run'}),sm(T_NET+.3,T_NET+.7,T));yaw=yawTo(f.X-APL[0],f.Z-APL[1]);}
 return{pose,yaw,X:lerp(X,f.X+.9,go),Z:lerp(Z,f.Z+1.6,go)};};
/** the fixo who starts it (deep, centre) */
const liveFixo:Gen=T=>{const kick=pulse(T,P0[0]-.05,.3);return{pose:blendPose(stand(),posed({lHipF:-10,rHipF:40,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2)),yaw:yawTo(KIKE[0]-FIXO[0],KIKE[1]-FIXO[1]),X:FIXO[0]+1.2*sm(T_NET,C1.end,T),Z:FIXO[1]-1.5*sm(T_NET,C1.end,T)};};
/** Romania (yellow, facing −X): Kike's marker, Alemao's man (turns late), the man who loses Torras, the ball-watcher in the middle */
type Mark={x:number[];z:number[];t:number[];ph:number};
const RMARK:Mark[]=[
 {x:[16.3,16.3,16.6],z:[13.0,13.3,12.6],t:[0,HEEL,T_TAP],ph:.1},
 {x:[14.4,15.4,17.2],z:[15.0,15.2,14.4],t:[0,HEEL_IN,CROSS+.3],ph:.4},
 {x:[13.6,14.4,16.9],z:[6.4,6.8,8.4],t:[0,T_TAP-1.5,T_TAP],ph:.7},
 {x:[12.6,14.2,16.0],z:[11.2,12.0,11.3],t:[0,HEEL,T_TAP],ph:.2}];
const rouAt=(m:Mark,T:number):[number,number]=>{const u1=sm(m.t[0],m.t[1],T,easeIO),u2=sm(m.t[1],m.t[2],T,easeIO);return[lerp(lerp(m.x[0],m.x[1],u1),m.x[2],u2),lerp(lerp(m.z[0],m.z[1],u1),m.z[2],u2)];};
const liveRou=(i:number):Gen=>T=>{const m=RMARK[i],[X,Z]=rouAt(m,T),post=sm(T_NET+.3,T_NET+1.3,T);let pose=backpedal(T*1.3+m.ph);
 if(i===2){pose=blendPose(pose,runCycle(T*runCadence(.8),{speed:.8}),sm(T_TAP-1.5,T_TAP-1.2,T)*(1-sm(T_TAP,T_TAP+.4,T)));const lu=key(T,[[T_TAP-.3,0],[T_TAP+.1,.6],[T_TAP+.6,1]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_TAP-.35,T_TAP-.25,T));}
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20}),post);
 const face=i===2&&T>T_TAP-1.5&&T<T_TAP?yawTo(1,.5):FACE_LEFT+(i===1?-.5:.2);
 return{pose,yaw:lerp(face,FACE_LEFT+.4*(i%2?1:-1),post),X,Z};};
/** Iancu: covers the far side while Alemao has it, gets back across as the cross comes, goes down late to his left (toward the near post) */
const DIVE0=T_TAP+.02;
const liveK:Gen=T=>{let pose=keeperSet(T*1.3);
 if(T>=DIVE0){const u=sm(DIVE0,DIVE0+.9,T,linear)*.95;pose=blendPose(keeperSet(DIVE0*1.3),keeperDive(u,{side:'l',height:.05}),sm(DIVE0,DIVE0+.1,T));}
 const Z=10+.9*sm(HEEL,HEEL_IN+.4,T,easeIO)-.5*sm(CROSS,T_TAP,T,easeIO)-.8*sm(DIVE0+.1,DIVE0+.6,T,easeOut);
 return{pose,yaw:FACE_LEFT,X:GOAL_X-.75,Z};};
const liveCam=(T:number)=>({x:key(T,mono([[0,11.2],[P0[1],12.6],[HEEL,13.4],[CROSS,14.2],[T_TAP,14.8],[T_NET+.4,15.2],[C1.end,14.4]]),easeInOutSine),
 zoom:key(T,mono([[0,.58],[C1.spain,.6],[HEEL,.64],[CROSS,.62],[T_TAP,.6],[T_NET+.9,.7],[C1.end,.8]]),easeInOutSine),
 y:key(T,mono([[0,1070],[HEEL,1060],[T_TAP,1050],[C1.end,1090]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_NET,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_NET;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.1,flash:pulse(T,T_NET,1.2)+.4*pulse(T,C1.one,1),bulge:.5*sm(T_NET-.12,T_NET,T)*(1-.6*sm(T_NET+.2,T_NET+1.1,T))+.12*settle(T,T_NET,{amp:1,freq:3,decay:3}),bz:NETP[2],by:NETP[1],
  keeper:()=>{athlete(s,st,liveK,T,IANCU,{detail:'low'});}});
 // "Spain, in white": red rings find the four white shirts; "low ball": the yellow lane across the box; "Jordi Torras": a red ring finds him
 const T0=liveT(T),spain=easeOutBack(sm(C1.spain,C1.spain+.35,T))*(1-sm(C1.kike-.6,C1.kike-.2,T));
 if(spain>.02){for(const g of[liveT,liveKike,liveAle,liveFixo]){const a=g(T);floorDashRing(s,st,R,a.X,a.Z,.7,6,520,spain);}}
 const lane=sm(C1.low,C1.low+.5,T,easeOut)*(1-sm(T_TAP,T_TAP+.3,T));
 if(lane>.02)floorArrow(s,st,Y,[CROSS_B[0]+.2,CROSS_B[1]-.6],[TAP_B[0]+.1,TAP_B[1]+.5],9,530,lane);
 const find=easeOutBack(sm(C1.jordi,C1.jordi+.35,T))*(1-sm(C1.one,C1.one+.4,T));floorDashRing(s,st,R,T0.X,T0.Z,.8,7,501,find);
 type It={z:number;draw:()=>void};const items:It[]=[];
 RMARK.forEach((_,i)=>{const g=liveRou(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ROU(i),{detail:'low'})});});
 ([[liveKike,ESP(1)],[liveAle,ESP(2)],[liveFixo,ESP(3)]] as [Gen,AthleteStyle][]).forEach(([g,sty])=>items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,sty,{detail:'low'})}));
 items.push({z:T0.Z,draw:()=>athlete(s,st,liveT,T,TORRAS,{detail:'mid',smear:T>T_TAP-.2&&T<T_TAP+.25?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45);
  if(b.flying){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_TAP,T-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.5,{seed:17,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.5:0,dir:Math.atan2(-.1,1)});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 if(T>=T_NET&&T<T_NET+1){const p=proj(st,NETP[0],NETP[1]+.3,NETP[2]);sparkBurst(s,Y,p[0],p[1],90,{n:10,seed:19,g:easeOut(sm(T_NET,T_NET+.3,T))*(1-sm(T_NET+.7,T_NET+1,T))});}
 // the score bug: 0–0 → 0–1 on the goal; the clock runs in real time to 03:25
 scoreBug(s,[0,c.y,c.zoom],{home:0,away:goal?1:0,clock:mmss(205-(T_NET-T)),flip:sm(T_NET,T_NET+.25,T,linear),glow:pulse(T,T_NET,1.2)},sm(C1.euro,C1.euro+.4,T));
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveT(tt),.13));},still:T_NET+.1};

// ================= chapter 2 — REPLAY: slow motion, low, behind his run; then only the score bug moves: 2–4, 3–6 (hat-trick), 3–8 =================
const C2={watch:A(1,'Watch'),attacks:A(1,'Torras'),gets:A(1,'gets'),later:A(1,'Later'),rolls:A(1,'then'),three:A(1,'Three'),win:A(1,'Spain win'),end:AUTH[1].seconds};
/** replay world = the live move seen end-on (X right = Spain's right, Z toward the goal): Alemao's low ball comes from the LEFT */
const RA:[number,number]=[-5.2,GZ-2.9],RTB:[number,number]=[.5,GZ-2.0],RT:V3=[.8,.24,GZ+.05],RS:[number,number]=[4.8,GZ-8.2];
const R_CROSS=.55,R_TAP=C2.gets+.15,R_IN=R_TAP+.75;
const RYAW=yawTo(RT[0]-RTB[0],RT[2]-RTB[1]),RSB=toMine(strikeBall(RYAW,'l',.5)),RPL:[number,number]=[RTB[0]-RSB[0],RTB[1]-RSB[2]];
function repBall(t:number){if(t<R_CROSS)return{X:RA[0],Y:BALL_R,Z:RA[1],flying:false};
 if(t<R_TAP){const u=sm(R_CROSS,R_TAP+.2,t,easeOut);return{X:lerp(RA[0],RTB[0],u),Y:BALL_R,Z:lerp(RA[1],RTB[1],u),flying:false};}
 if(t<R_IN){const u=sm(R_TAP,R_IN,t,linear),p=flight([RTB[0],BALL_R,RTB[1]],RT,u,.32);return{X:p[0],Y:p[1],Z:p[2],flying:true};}
 const d=sm(R_IN+.2,R_IN+.8,t,easeIn);return{X:RT[0],Y:lerp(RT[1],BALL_R,d),Z:GZ+.6,flying:false};}
/** Torras in slow motion: the run into the space (slow cadence), the left-foot tap, then he turns to the camera and celebrates */
const rT=(t:number)=>key(t,[[R_TAP-.9,.22],[R_TAP,STRIKE_CONTACT],[R_TAP+1.4,.85],[C2.later-.3,1]],linear);
const repT:Gen=t=>{
 const X=key(t,[[0,RS[0]],[R_TAP-.9,RPL[0]+.9,easeIn],[R_TAP,RPL[0],easeOut],[R_TAP+1.4,RPL[0]-.25,easeOut],[C2.later+1.2,RPL[0]+1.3,easeIO]]);
 const Z=key(t,[[0,RS[1]],[R_TAP-.9,RPL[1]-1.3,easeIn],[R_TAP,RPL[1],easeOut],[R_TAP+1.4,RPL[1]+.3,easeOut],[C2.later+1.2,RPL[1]-4.2,easeIO]]);
 let pose:Pose,yaw=yawTo(RPL[0]-RS[0],RPL[1]-RS[1]);
 if(t<R_TAP-1)pose=runCycle(t*runCadence(.9)*.4,{speed:.9});
 else{pose=blendPose(runCycle((R_TAP-1)*runCadence(.9)*.4,{speed:.9}),strike(rT(t),{foot:'l',power:.5}),sm(R_TAP-1,R_TAP-.8,t));yaw=lerp(yaw,RYAW,sm(R_TAP-1,R_TAP-.5,t));}
 if(t>C2.later-.4){const run=sm(C2.later-.4,C2.later+1.2,t)*(1-sm(C2.later+.9,C2.later+1.3,t));const u=sm(C2.later-.4,C2.later+.3,t,easeIO);pose=blendPose(blendPose(pose,celebrate((t-C2.later)*.9,{kind:'arms'}),u),celebrate(t*1.2,{kind:'run'}),run);yaw=lerp(RYAW,FACE_CAMERA+.25,u);}
 return{pose,yaw,X,Z};};
/** Alemao at the left edge: the low cross (slow motion) */
const AYR=yawTo(RTB[0]-RA[0],RTB[1]-RA[1]),ASR=toMine(strikeBall(AYR,'l',.6)),APR:[number,number]=[RA[0]-ASR[0],RA[1]-ASR[2]];
const repA:Gen=t=>({pose:strike(key(t,[[0,.3],[R_CROSS,STRIKE_CONTACT],[R_CROSS+1.6,.85],[C2.end,1]],linear),{foot:'l',power:.6}),yaw:AYR,X:APR[0],Z:APR[1]});
/** Iancu: across toward the cross, then down late to his left (+X) — the ball is past him */
const RDIVE=R_TAP+.2;
const repK:Gen=t=>{let pose=keeperSet(t*.5);if(t>=RDIVE)pose=blendPose(keeperSet(RDIVE*.5),keeperDive(sm(RDIVE,RDIVE+2,t,linear)*.95,{side:'l',height:.05}),sm(RDIVE,RDIVE+.2,t));
 return{pose,yaw:FACE_CAMERA+.15,X:-.9+.5*sm(R_CROSS,R_TAP,t,easeIO)+.6*sm(RDIVE+.2,RDIVE+1.4,t,easeOut),Z:GZ-.65};};
/** the man who loses him (chasing a yard behind, lunges too late) and a ball-watcher in the middle */
const repD=(i:number):Gen=>t=>{
 if(i===0){const lu=key(t,[[R_TAP-.5,0],[R_TAP+.5,.6],[R_TAP+2,1]],linear),X=lerp(RS[0]+.9,RPL[0]+1.2,sm(0,R_TAP,t,easeOut)),Z=lerp(RS[1]-.9,RPL[1]-1.1,sm(0,R_TAP,t,easeOut));
  return{pose:blendPose(runCycle(t*runCadence(.8)*.4,{speed:.8}),lunge(lu,{side:'l'}),sm(R_TAP-.6,R_TAP-.3,t)),yaw:yawTo(-.6,1),X,Z};}
 return{pose:blendPose(backpedal(.3+t*.2),stand(),sm(R_TAP,R_TAP+1,t)),yaw:yawTo(-1,-.5),X:-2.3+.4*sm(0,R_TAP,t),Z:GZ-4.4};};
const st2=(t:number):Stage=>({F:1500,eye:1.45,cx:1.4,cz:GZ-11.5+.5*sm(R_TAP,R_IN,t,easeIO)});
const CAM2=():Key[]=>[[0,-520,250,1.0],[R_CROSS+.4,-420,250,1.05],[C2.attacks,-80,240,1.1],[R_TAP-.2,30,210,1.3],[R_TAP+.3,60,190,1.35],[R_IN,80,180,1.3],[C2.later,90,250,1.0],[C2.later+1.2,170,170,.84],[C2.three,170,170,.84],[C2.end,160,180,.82]];
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(tt),hit=pulse(t,R_TAP,.4),net=pulse(t,R_IN,.6),cm=camAt(t,CAM2());
  cam(s,cm[0]+8*hit*Math.sin(t*90),cm[1]+5*hit*Math.cos(t*77)+4*net*Math.sin(t*60),cm[2]);
  const b=repBall(tt),goal=tt>=R_IN;
  arena(s,st,{t:tt,cheer:goal?1-.3*sm(C2.end-1,C2.end,tt):0,flash:pulse(tt,R_IN,1.2)+.5*pulse(tt,C2.later,1)+.5*pulse(tt,C2.rolls,1)+.8*pulse(tt,C2.win,1.4),
   bulge:.55*sm(R_IN-.2,R_IN,tt)*(1-.6*sm(R_IN+.4,R_IN+1.4,tt))+.12*settle(tt,R_IN,{amp:1,freq:3,decay:3}),bx:RT[0],by:RT[1],
   keeper:stg=>{athlete(s,stg,repK,tt,IANCU,{detail:'mid'});}});
  // "attacks the space": a yellow dashed ring on the spot the ball is going to, and his run drawn in toward it
  const sp=easeOutBack(sm(C2.attacks,C2.attacks+.35,tt))*(1-sm(R_TAP,R_TAP+.3,tt));
  if(sp>.02){floorDashRing(s,st,Y,RTB[0],RTB[1],.9,10,601,sp);floorArrow(s,st,Y,[RS[0]-.3,RS[1]+.6],[RPL[0]+.5,RPL[1]-.8],10,602,sm(C2.attacks,C2.attacks+.8,tt)*(1-sm(R_TAP,R_TAP+.3,tt)));}
  // the low ball's path (drawn as it rolls)
  if(tt>R_CROSS&&tt<R_IN+.6){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=repBall(lerp(R_CROSS,Math.min(tt,R_TAP),k/14));pts.push(proj(st,q.X,.02,q.Z));}dashed(s,Y,pts,9,95,{dash:40});}
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=b.flying?Math.atan2(-.1,.3):0;shadow(s,g[0],g[1],r*1.1,r*.3,96,b.flying?.3:.45);
   if(b.flying)speedLines(s,R,p[0],p[1],dir,{n:4,seed:604+Math.floor(tt*6),len:r*2.6,spread:r*.7,width:5});
   ball(s,p[0],p[1],r,97,{rot:tt*4,smear:b.flying?.4:0,dir});
   if(tt>=R_TAP&&tt<R_TAP+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:98,g:easeOut(sm(R_TAP,R_TAP+.3,tt))});};
  const its:{z:number;draw:()=>void}[]=[0,1].map(i=>{const g=repD(i);return{z:g(tt).Z,draw:()=>{athlete(s,st,g,tt,ROU(i+1),{detail:'mid'});}};});
  its.push({z:APR[1],draw:()=>athlete(s,st,repA,tt,ESP(2),{detail:'mid'})});
  const TT=repT(tt);its.push({z:TT.Z,draw:()=>{athlete(s,st,repT,tt,TORRAS,{detail:'high',smear:tt>R_TAP-.5&&tt<R_TAP+.4?.3:0});}},{z:b.Z,draw:drawBall});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=R_IN&&tt<R_IN+1.2){const p=proj(st,RT[0],RT[1],GZ+.4);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:99,g:easeOut(sm(R_IN,R_IN+.3,tt))*(1-sm(R_IN+.8,R_IN+1.2,tt))});}
  // three goal balls stamp above him: 1 (this one), 2 on "Later he" (19:14), 3 on "then rolls" (29:31); "Three goals" makes them jump
  {const hd=proj(st,TT.X,2.35,TT.Z),kk=kAt(st,TT.Z),rr=.2*kk,jump=pulse(tt,C2.three,1);
   [R_IN+.4,C2.later+.3,C2.rolls+.3].forEach((t1,i)=>{const g=easeOutBack(sm(t1,t1+.35,tt));if(g<=.02)return;const x=hd[0]+rr*4.2+i*rr*2.7,y=hd[1]+rr*2.5-rr*1.6*jump*Math.abs(Math.sin(tt*9+i));
    s.fill(Y,polyPath(blob(x,y,rr*1.45*g,rr*1.45*g,700+i,{amp:.05,n:18}),true),.8);ball(s,x,y,rr*g,710+i,{rot:i});});
   if(tt>=C2.three&&tt<C2.three+.8)sparkBurst(s,Y,hd[0]+rr*6.9,hd[1]+rr*2.5,rr*6,{n:12,seed:720,g:easeOut(sm(C2.three,C2.three+.4,tt))});}
  // the score bug: 0–1 after the tap; 2–4 (19:14) on "Later he"; 3–6 (29:31) on "then rolls"; 3–8 (40:00) on "Spain win"
  const later=tt>=C2.later,rolls=tt>=C2.rolls,win=tt>=C2.win;
  scoreBug(s,cm,{home:win||rolls?3:later?2:0,away:win?8:rolls?6:later?4:goal?1:0,clock:win?'40:00':rolls?'29:31':later?'19:14':'03:25',
   flip:Math.max(sm(C2.later,C2.later+.25,tt,linear)*(1-sm(C2.later+.25,C2.later+.3,tt)),sm(C2.rolls,C2.rolls+.25,tt,linear)*(1-sm(C2.rolls+.25,C2.rolls+.3,tt)),sm(C2.win,C2.win+.25,tt,linear)),
   flipHome:later&&!rolls?sm(C2.later,C2.later+.25,tt,linear):rolls&&!win?sm(C2.rolls,C2.rolls+.25,tt,linear):0,
   glow:pulse(tt,C2.later,1)+pulse(tt,C2.rolls,1)+pulse(tt,C2.win,1.6)},1,74);
  // "Spain win": red, yellow and paper confetti in front of the stands
  if(tt>=C2.win){const u=sm(C2.win,C2.win+2.5,tt,linear),top=proj(st,0,6,WALLZ)[1];confetti(s,[R,Y,'paper'],[-900,top-200+u*500,1800,420],26,Math.floor(tt*6),{size:16});}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2(tt),repT(tt),.12));},
 still:R_TAP+.3,
};

// ================= chapter 3 — HOW HE DOES IT (demonstration): from the right wing, straight at the space, beat one, shoot before the block =================
const C3={this:A(2,'This'),run:A(2,'Run'),space:A(2,'space in'),beat:A(2,'Beat'),shoot:A(2,'shoot'),block:A(2,'before'),end:AUTH[2].seconds};
const D0:[number,number]=[7.0,GZ-14.2],DW:[number,number]=[6.4,GZ-12.6],DTOUCH:[number,number]=[3.9,GZ-9.3],DSB0:[number,number]=[1.8,GZ-7.8],SPACE:[number,number]=[2.6,GZ-8.3];
const DT:V3=[-1.15,.42,GZ+.02];
const D_TOUCH=C3.beat+.2,D_HIT=C3.shoot+.3,D_IN=D_HIT+.5;
const DYAW=yawTo(DT[0]-DSB0[0],DT[2]-DSB0[1]),DSB=toMine(strikeBall(DYAW,'l')),DPL:[number,number]=[DSB0[0]-DSB[0],DSB0[1]-DSB[2]];
const dT=(t:number)=>key(t,[[D_HIT-.34,.22],[D_HIT,STRIKE_CONTACT],[D_HIT+.9,.85],[C3.end,1]],linear);
/** his path: easy dribble down the wing → the direct run (on "Run straight") → the touch inside past the defender → the plant → strike */
const demoT:Gen=t=>{
 const X=key(t,[[0,D0[0]],[C3.run,DW[0],easeIO],[D_TOUCH,DTOUCH[0]+.2,easeIn],[D_HIT-.34,DPL[0]+.45,easeIO],[D_HIT,DPL[0],easeOut],[D_HIT+1,DPL[0]-.3,easeOut]]);
 const Z=key(t,[[0,D0[1]],[C3.run,DW[1],easeIO],[D_TOUCH,DTOUCH[1]-.3,easeIn],[D_HIT-.34,DPL[1]-.45,easeIO],[D_HIT,DPL[1],easeOut],[D_HIT+1,DPL[1]+.3,easeOut]]);
 let pose:Pose,yaw=yawTo(DTOUCH[0]-DW[0],DTOUCH[1]-DW[1]);
 if(t<C3.run)pose=dribble(t*1.3,{foot:'l',speed:.2}),yaw=yawTo(-.35,1);
 else if(t<D_HIT-.4)pose=dribble(t*2.1,{foot:'l',speed:.8});
 else pose=blendPose(dribble((D_HIT-.4)*2.1,{foot:'l',speed:.8}),strike(dT(t),{foot:'l'}),sm(D_HIT-.4,D_HIT-.3,t));
 if(t>=C3.run-.4&&t<C3.run)yaw=lerp(yawTo(-.35,1),yaw,sm(C3.run-.4,C3.run,t));
 if(t>=D_TOUCH-.2&&t<D_HIT-.4)yaw=lerp(yawTo(DTOUCH[0]-DW[0],DTOUCH[1]-DW[1]),yawTo(DSB0[0]-DTOUCH[0],DSB0[1]-DTOUCH[1]),sm(D_TOUCH-.2,D_TOUCH+.2,t));
 if(t>=D_HIT-.4)yaw=lerp(yawTo(DSB0[0]-DTOUCH[0],DSB0[1]-DTOUCH[1]),DYAW,sm(D_HIT-.4,D_HIT-.2,t));
 return{pose,yaw,X,Z};};
function demoBall(t:number){
 const at=demoT(t),fy=at.yaw,foot=[at.X+Math.cos(fy)*.45,at.Z+Math.sin(fy)*.45];
 if(t<D_TOUCH)return{X:foot[0],Y:BALL_R,Z:foot[1],flying:false};
 if(t<D_HIT){const a=demoT(D_TOUCH),s0=[a.X+Math.cos(a.yaw)*.45,a.Z+Math.sin(a.yaw)*.45],u=sm(D_TOUCH,D_HIT-.2,t,easeOut);return{X:lerp(s0[0],DSB0[0],u),Y:BALL_R,Z:lerp(s0[1],DSB0[1],u),flying:false};}
 if(t<D_IN){const u=sm(D_HIT,D_IN,t,linear),p=flight([DSB0[0],BALL_R,DSB0[1]],DT,u,.6);return{X:p[0],Y:p[1],Z:p[2],flying:true};}
 const d=sm(D_IN+.2,D_IN+.7,t,easeIn);return{X:DT[0],Y:lerp(DT[1],BALL_R,d),Z:GZ+.6,flying:false};}
/** defender 1 steps out to meet him and lunges as the ball goes past; defender 2 (the block) comes across — a beat too late */
const DD1:[number,number]=[2.4,GZ-6.9],DD1b:[number,number]=[3.3,GZ-8.1],DD2:[number,number]=[-3.2,GZ-4.6],DD2b:[number,number]=[.3,GZ-6.2];
const demoD=(i:number):Gen=>t=>{
 if(i===0){const close=sm(C3.run,D_TOUCH,t,easeIO),lu=key(t,[[D_TOUCH-.1,0],[D_TOUCH+.35,.6],[D_TOUCH+1.4,1]],linear);
  return{pose:blendPose(backpedal(t*1.2),lunge(lu,{side:'r'}),sm(D_TOUCH-.15,D_TOUCH,t)),yaw:yawTo(1,-1.3),X:lerp(DD1[0],DD1b[0],close),Z:lerp(DD1[1],DD1b[1],close)};}
 const come=sm(C3.beat,D_HIT+.3,t,easeIn),lu=key(t,[[C3.block-.3,0],[C3.block+.25,.6],[C3.block+1.4,1]],linear);
 let pose=blendPose(stand(),runCycle(t*runCadence(.8),{speed:.8}),sm(C3.beat,C3.beat+.3,t));pose=blendPose(pose,lunge(lu,{side:'l'}),sm(C3.block-.35,C3.block-.2,t));
 return{pose,yaw:yawTo(1,-.5),X:lerp(DD2[0],DD2b[0],come),Z:lerp(DD2[1],DD2b[1],come)};};
/** the keeper edges across with him, then goes down late to his right (−X) — the ball is in */
const KD=D_HIT+.18;
const demoK:Gen=t=>{let pose=keeperSet(t*.9);if(t>=KD)pose=blendPose(keeperSet(KD*.9),keeperDive(sm(KD,D_IN+.8,t,linear)*.9,{side:'r',height:.15}),sm(KD,KD+.2,t));
 return{pose,yaw:FACE_CAMERA+.2,X:.1+.45*sm(C3.run,D_TOUCH,t,easeIO)-.8*sm(KD,D_IN,t,easeOut),Z:GZ-.65};};
const st3:Stage={F:1500,eye:2.3,cx:3.0,cz:GZ-19.5};
const CAM3:Key[]=[[0,560,300,.92],[C3.run,480,310,.95],[C3.space,250,330,.95],[C3.beat,110,300,1.12],[C3.shoot,10,270,1.28],[C3.block,-60,250,1.34],[C3.end,-50,255,1.3]];
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,cm=camAt(t,CAM3);cam(s,cm[0],cm[1],cm[2]);
  const b=demoBall(tt),goal=tt>=D_IN;
  arena(s,st,{t:tt,cheer:goal?.7*(1-sm(C3.end-1,C3.end,tt)):0,flash:pulse(tt,D_IN,1),
   bulge:.5*sm(D_IN-.2,D_IN,tt)*(1-.6*sm(D_IN+.4,D_IN+1.4,tt))+.1*settle(tt,D_IN,{amp:1,freq:3,decay:3}),bx:DT[0],by:DT[1],
   keeper:stg=>{athlete(s,stg,demoK,tt,DEMO_K,{detail:'mid'});}});
  const L=demoT(tt);
  // "Run straight": a yellow arrow from him straight at the space; "space in front": the space rings yellow
  floorArrow(s,st,Y,[DW[0]-.2,DW[1]+.5],[SPACE[0]+.5,SPACE[1]-.6],12,730,sm(C3.run,C3.run+.8,tt,easeOut)*(1-sm(D_TOUCH,D_TOUCH+.3,tt)));
  const spc=easeOutBack(sm(C3.space,C3.space+.35,tt))*(1-sm(D_HIT-.2,D_HIT+.1,tt));floorDashRing(s,st,Y,SPACE[0],SPACE[1],1.25,12,731,spc);
  if(spc>.02)s.fill(Y,polyPath(floorRing(st,SPACE[0],SPACE[1],1.15*spc,22),true),.22);
  // "Beat your defender": a red ring on the defender as the ball goes past him
  {const d=demoD(0)(tt),g=easeOutBack(sm(C3.beat,C3.beat+.3,tt))*(1-sm(D_HIT,D_HIT+.3,tt));floorDashRing(s,st,R,d.X,d.Z,.8,10,732,g);}
  // "before the block comes": the block's red ring arrives — after the ball has gone
  {const d=demoD(1)(tt),g=easeOutBack(sm(C3.block,C3.block+.3,tt))*(1-sm(C3.end-.8,C3.end-.3,tt));floorDashRing(s,st,R,d.X+.3,d.Z-.1,.8,10,733,g);}
  if(tt>D_HIT){const pts:Pt[]=[];for(let k=0;k<=16;k++){const q=demoBall(lerp(D_HIT,Math.min(tt,D_IN),k/16));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,734,{dash:40});if(goal)arrowHead(s,Y,pts,34,735);}
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(-.1,-1);shadow(s,g[0],g[1],r*1.1,r*.3,736,.45);
   if(b.flying)speedLines(s,R,p[0],p[1],dir,{n:5,seed:737+Math.floor(tt*6),len:r*3.2,spread:r*.8,width:5});
   ball(s,p[0],p[1],r,738,{rot:tt*6,smear:b.flying?.4:0,dir});if(tt>=D_HIT&&tt<D_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:739,g:easeOut(sm(D_HIT,D_HIT+.3,tt))});
   if(tt>=D_TOUCH&&tt<D_TOUCH+.3)sparkBurst(s,R,p[0],p[1],r*2,{n:8,seed:740,g:easeOut(sm(D_TOUCH,D_TOUCH+.25,tt))});};
  const its:{z:number;draw:()=>void}[]=[0,1].map(i=>{const g=demoD(i);return{z:g(tt).Z,draw:()=>athlete(s,st,g,tt,DEMO_D(i),{detail:'mid'})};});
  its.push({z:L.Z,draw:()=>athlete(s,st,demoT,tt,TORRAS_BIB,{detail:'high',smear:(tt>D_HIT-.3&&tt<D_HIT+.3)||(tt>D_TOUCH-.1&&tt<D_TOUCH+.2)?.2:0})},{z:!b.flying&&tt<D_HIT?L.Z-.01:b.Z,draw:drawBall});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=D_IN&&tt<D_IN+1){const p=proj(st,DT[0],DT[1],GZ+.4);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:741,g:easeOut(sm(D_IN,D_IN+.3,tt))*(1-sm(D_IN+.7,D_IN+1,tt))});}
  // the ball is in before the block arrives: a big yellow tick stamps beside the goal, with a navy misregistered echo
  const tick=easeOutBack(sm(Math.max(D_IN+.1,C3.block+.2),Math.max(D_IN+.45,C3.block+.55),tt));
  if(tick>.02){const c=proj(st,2.7,1.4,GZ),S=150*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:742,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:743,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:744,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:D_HIT+.4,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'jordi-torras-futsal-signature',format:'futsal',title:'Jordi Torras’s direct run',theme:'Attack the space in front of you and shoot before the block comes.',
 ageNote:'For players aged 7–12: the EURO 2012 goal and hat-trick are real; the last chapter is a demonstration of how he attacks from the wing.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball darts diagonally across the touch point (a direct run) with red speed lines and a yellow skid mark; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.6),bx=x-110+220*easeOut(u),by=y+60-120*easeOut(u);
  s.fill(K,polyPath(blob(bx,by+r*.95,r*.9,r*.22,seed+2,{n:16}),true),.3);
  if(u<1){const sk=ribbon([[x-120,y+60+r*.9],[bx-r*.7,by+r*.9+r*.3]],10*(1-u)+3,{seed,taper:.6,wobble:1});s.fill(Y,sk,1);speedLines(s,R,bx,by,Math.atan2(-120,220),{n:4,seed:seed+1,len:r*3,spread:r*.8,width:5});}
  ball(s,bx,by,r,seed,{rot:age*12,smear:u<1?.4*(1-u):0,dir:Math.atan2(-120,220)});
 },
};
export default film;
