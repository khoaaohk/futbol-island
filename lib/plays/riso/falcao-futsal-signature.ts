/** Falcão — "the Pelé of futsal's dribble": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHY THIS MOMENT: Falcão's entry (lib/town/iconicPlays.json) is a signature — the sole-of-the-foot dribble — not one match. No written
 * source we could reach describes ONE dated sole-dribble (the FIFA match reports describe his goals, not his tricks), so the film follows
 * the brief's honest fallback: it opens on a REAL, documented Falcão moment in a real match, then says "Here's how he did it" and shows the
 * trick as a demonstration that is never passed off as that match.
 *  1  LIVE (broadcast camera, main stand, real time): FIFA Futsal World Cup final, 18 Nov 2012, Spain 2–3 Brazil (a.e.t.), Indoor Stadium
 *     Huamark, Bangkok. Brazil, 1–2 down, play with five outfield players; the space opens and Falcão (on as a substitute) hits a ferocious
 *     long-range LEFT-FOOT shot into the top corner at 36'18" — 2–2. Juanjo, Spain's keeper, "didn't even move".
 *  2  REPLAY (slow motion, low, behind the shooter): the left-foot strike, the ball flying past the motionless keeper into the top corner;
 *     2–2, and Brazil go on to win (Neto, 49'41").
 *  3  HOW HE DID IT (a demonstration, no match claimed; neutral navy/paper defender): step on the ball with the sole, roll it across, the
 *     defender follows, drag it back and go the other way.
 *  4  PRACTISE (lesson from the entry's `lesson`: "Use the sole of your foot to keep the ball close and fool defenders"): Falcão rolls the
 *     ball slowly under his sole; three cards (step, roll, drag); a tick.
 * Sources (written; fetched once and cached in scratchpad/films/src-cache/):
 *  - FIFA.com match summary "Brazil retain crown in dramatic final" (18 Nov 2012, archived 22 Nov 2012):
 *    https://web.archive.org/web/20121122001356/http://www.fifa.com/futsalworldcup/matches/round=255929/match=300215859/summary.html
 *    — "a stunning equalising goal from Falcao"; "taking advantage of space provided by his team moving to five outfield players –
 *    unleashing a ferocious long-range shot that was destined for the top corner from the moment it left his left boot. Juanjo didn't even
 *    move."; Neto's winner 19 seconds from the end.
 *  - FIFA.com match report, Spain v Brazil, Match 52 (archived 29 Nov 2012): goal times (Neto 24'11" & 49'41", Torras 29'55", Aicardo
 *    30'56", Falcao 36'18"), Brazil #12 FALCAO (a substitute), Spain #12 JUANJO (GK), attendance 5,685, Huamark, Bangkok.
 *    https://web.archive.org/web/20121129010803/http://www.fifa.com/futsalworldcup/matches/round=255927/match=300215859/report.html
 *  - Wikipedia, "Falcão (futsal player)" (raw, fetched Sep 2026): a winger; "flashy and potent dribbling skills and a powerful and accurate
 *    left foot"; 1.77 m; Golden Ball 2004 & 2008; world champion 2008 and 2012. — https://en.wikipedia.org/wiki/Falc%C3%A3o_(futsal_player)
 *  - World Soccer, "Falcao, the 'Pelé of futsal'" (3 May 2014): famous "to dribble and beat players"; audacious skills.
 *    https://www.worldsoccer.com/world-soccer-latest/falcao-pele-futsal-351602
 *  - Wikipedia, "2012 FIFA Futsal World Cup" (raw): final 18 Nov 2012, 19:30, Spain 2–3 Brazil a.e.t.
 * CONFIRMED: match, date, venue, score line (1–2 → 2–2 → 3–2 a.e.t.), minute 36'18", Brazil in a five-outfield power play, a long-range
 *  left-foot shot, top corner, the keeper not moving, shirt numbers 12 (Falcão) and 12 (Juanjo), Falcão left-footed, a substitute.
 * INFERRED (not named in the narration): kits — Brazil yellow shirts / blue shorts / white socks, Spain red shirts / navy shorts / red
 *  socks, Juanjo in a dark kit; the blue court; which goal and which top corner (the far post, from the left of centre, about 11 m out);
 *  the passes before the shot and every other player's position; Falcão's hair (short). No video was reviewed.
 *  Chapters 3–4 are a demonstration of the sole roll + drag back (how the trick is done), not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike and the drag). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 * z → −Z; the strike and the sole moves use the LEFT foot (foot:'l' / mirrored poses), Falcão's foot.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Brazil shirts, lights), red (Spain, diagram rings), blue (court, Brazil shorts), navy (key line, run-off, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,celebrate,posed,blendPose,keyPoses,mirrorPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];headline?:{text:string;at:number};heads?:Record<string,string>}[]=[
 {label:'Live: the 2012 final',text:'The 2012 Futsal World Cup final. Brazil are losing to Spain, two to one. Falcão finds space far out, and hits it with his left foot. Top corner!',tail:2.6,
  cues:['The 2012','Brazil are losing','two to one','Falcão','far out','hits it','left foot','Top corner'],heads:{'The 2012':'Final 2012','two to one':'1–2','Top corner':'2–2'}},
 {label:'Replay: the left foot',text:'Watch again. The keeper doesn’t even move! Two all, and Brazil go on to win!',tail:1.8,
  cues:['Watch again','The keeper','even move','Two all','Brazil go on'],heads:{'Two all':'2–2','Brazil go on':'Champions'}},
 {label:'How he did it',text:'His famous trick was the sole of his foot. Here’s how he did it: step on the ball, roll it across, and the defender follows. Drag it back, and he’s gone!',tail:1.9,
  cues:['His famous trick','sole of his foot','Here’s how','step on the ball','roll it across','defender follows','Drag it back','he’s gone'],heads:{'sole of his foot':'The sole','he’s gone':''}},
 {label:'Practise it',text:'Practise it slowly. Use your sole to keep the ball close, and fool defenders!',tail:2.6,
  cues:['Practise it slowly','Use your sole','keep the ball close','fool defenders'],heads:{'Use your sole':'Sole control','fool defenders':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/falcao-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/falcao-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/falcao-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('falcao: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('falcao: no cue '+w);return c.at;};
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
/** dashes: gaps list for a ribbon so it prints as a dashed diagram line */
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line; on the blue court it is knocked out to paper first so the ink prints clean (no overprint) */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a floor quad (X,Z corners) clipped to just in front of the camera */
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
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.86],[R,.3]];
const BUILD={height:1.77,bulk:.97};
/** Falcão: Brazil #12 (FIFA line-up) — yellow shirt, blue shorts, white socks (kit inferred), short dark hair, 1.77 m, left-footed */
const FALCAO:AthleteStyle={shirt:Y,shorts:B,socks:'paper',boots:K,skin:SKIN,hair:K,line:K,trim:B,number:12,numberInk:B,hairStyle:'short',build:BUILD,seed:12};
const BRA=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,skin:[[Y,.8],[R,.28]],hair:K,line:K,trim:B,hairStyle:n%2?'short':'bald',build:{height:1.7+hash(n,3)*.14},seed:20+n});
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.7],[R,.18]],hair:K,line:K,trim:Y,hairStyle:'short',build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Juanjo, Spain #12 (GK) — a dark keeper kit (inferred) */
const JUANJO:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.7],[R,.18]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',number:12,numberInk:Y,hairStyle:'short',build:{height:1.8},seed:62};
/** the demonstration defender: a neutral paper/navy training kit (no team is claimed in chapters 3–4) */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the left-foot strike's contact: just past the kicking toe along the foot (library coords, place at the origin) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),BUILD,{yaw}),toe=sk.lToe,an=sk.lAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}

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
/** a ball on the floor of stage st at (X,Yh,Z): ground shadow + the ball */
function ballAt(s:Sheet,st:Stage,X:number,Yh:number,Z:number,seed:number,o:{min?:number;rot?:number;smear?:number;dir?:number}={}){
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,.45);ball(s,p[0],p[1],r,seed,{rot:o.rot,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, yellow / red / blue shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.22)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.34)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Spain's goal at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 // run-off (navy over blue) and the blue court; a faint sheen band across the middle of the court
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
 sideGoal(s,st,bulge,bz,by);o.keeper?.();sidePosts(s,st);
}
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
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;goal?:boolean;centre?:number};
/** the court seen end-on: blue floor + run-off, paper lines (goal line and D, or the halfway line + centre circle), boards, stands, the goal */
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0,goal:withGoal=true,centre}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const lineZ=centre??GZ,court=polyPath(floorQuad(st,-10,-30,10,lineZ+ (withGoal?0:10)),true);s.knockout(court,.25);s.fill(B,court,.82);
 const lines=new Path2D();
 if(withGoal){const arcPts:Pt[]=[];
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,GZ],[10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts,.05),true));
  lines.addPath(polyPath(floorRing(st,0,GZ-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,GZ-10,.12,12),true));}
 else if(centre!==undefined){const cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,centre+Math.sin(a)*3]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,centre],[10,centre]],.05),true));lines.addPath(polyPath(floorStrip(st,cc,.05),true));lines.addPath(polyPath(floorRing(st,0,centre,.14,12),true));}
 lines.addPath(polyPath(floorStrip(st,[[-10,-30],[-10,lineZ+(withGoal?0:10)]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,-30],[10,lineZ+(withGoal?0:10)]],.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 if(withGoal){goalEnd(s,st,bulge,bx,by);o.keeper?.(st);postsEnd(s,st);}
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

// ================= chapter 1 — LIVE: the 2012 final, 36'18"; Brazil's power play, Falcão's left foot, top corner =================
const C1={losing:A(0,'Brazil are'),twoOne:A(0,'two to'),fal:A(0,'Falc'),far:A(0,'far out'),hits:A(0,'hits'),left:A(0,'left foot'),top:A(0,'Top corner'),end:AUTH[0].seconds};
/** the shot: contact on "left foot"; ≈24 m/s → about half a second to the top corner at the far post */
const T_HIT=C1.left+.12,T_IN=T_HIT+.46;
const SHOT:[number,number]=[-9.35,7.35],TOPC:V3=[GOAL_X+.12,1.78,POST_F-.28];
const YAW_SHOT=yawTo(TOPC[0]-SHOT[0],TOPC[2]-SHOT[1]);
const SB=toMine(strikeBall(YAW_SHOT)),PLANT:[number,number]=[SHOT[0]-SB[0],SHOT[1]-SB[2]];
/** passes: the deep player → the far wing → back → Falcão (inferred build-up, rolling on the floor) */
const DEEP:[number,number]=[-4.4,11.2],WING:[number,number]=[-12.6,17.2],RECV:[number,number]=[-8.55,6.95];
const P1=[.7,1.6],P2=[C1.losing+.4,C1.losing+1.3],P3=[C1.fal-.45,C1.fal+.35];
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 const roll=(a:[number,number],b:[number,number],t0:number,t1:number)=>{const u=sm(t0,t1,T,easeOut);return{X:lerp(a[0],b[0],u),Y:BALL_R,Z:lerp(a[1],b[1],u),flying:false,spin:u*8};};
 if(T<P1[0])return{X:DEEP[0]-.45,Y:BALL_R,Z:DEEP[1],flying:false,spin:0};
 if(T<P2[0])return roll([DEEP[0]-.45,DEEP[1]],[WING[0]+.4,WING[1]-.3],P1[0],P1[1]);
 if(T<P3[0])return roll([WING[0]+.4,WING[1]-.3],[DEEP[0]-.5,DEEP[1]-.2],P2[0],P2[1]);
 if(T<P3[1]+.02)return roll([DEEP[0]-.5,DEEP[1]-.2],RECV,P3[0],P3[1]);
 if(T<T_HIT){const u=sm(P3[1]+.1,T_HIT-.35,T,easeOut);return{X:lerp(RECV[0]-.3,SHOT[0],u),Y:BALL_R,Z:lerp(RECV[1],SHOT[1],u),flying:false,spin:8+u*6};}
 if(T<T_IN){const u=sm(T_HIT,T_IN,T,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(SHOT[0],TOPC[0],.5),1.45,lerp(SHOT[1],TOPC[2],.5)];
  return{X:a*SHOT[0]+b*M[0]+c*TOPC[0],Y:a*BALL_R+b*M[1]+c*TOPC[1],Z:a*SHOT[1]+b*M[2]+c*TOPC[2],flying:true,spin:20+u*40};}
 const d=sm(T_IN+.12,T_IN+.5,T,easeIn),bo=Math.abs(Math.sin(sm(T_IN+.5,T_IN+1.3,T)*Math.PI*2))*.12*(1-sm(T_IN+.5,T_IN+1.3,T));
 return{X:GOAL_X-.55,Y:lerp(TOPC[1],BALL_R,d)+bo,Z:TOPC[2]-.1,flying:false,spin:60};
}
/** Falcão live: drifts into the space → opens up for the pass → cushions it → two short touches with the left → left-foot strike → wheels away */
const S_T0=T_HIT-.62,touchStart=.2;
const liveF:Gen=T=>{
 const stT=key(T,[[S_T0,0],[S_T0+.3,.22],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,1]],linear);
 let X=key(T,[[0,-7.1],[P3[0]-.4,-8.3,easeIO],[P3[1],RECV[0]+.45],[S_T0,PLANT[0]+.55,easeIO],[T_HIT,PLANT[0],easeOut],[T_HIT+.5,PLANT[0]-.35,easeOut],[C1.end,-6.4,easeIO]]);
 let Z=key(T,[[0,4.4],[P3[0]-.4,6.2,easeIO],[P3[1],RECV[1]-.2],[S_T0,PLANT[1]-.25,easeIO],[T_HIT,PLANT[1],easeOut],[T_HIT+.5,PLANT[1]+.2,easeOut],[C1.end,3.2,easeIO]]);
 let pose:Pose,yaw=FACE_LEFT;
 if(T<P3[0]-.4)pose=blendPose(runCycle(T*runCadence(.25),{speed:.25}),stand(),sm(P3[0]-1.2,P3[0]-.4,T));
 else if(T<P3[1]+.1){pose=blendPose(stand(),mirrorPose(posed({rHipF:30,rKnee:30,rAnk:-6,rHipR:30,lKnee:24,lean:14,neckP:24,neckY:-30,lShA:36,rShA:30,lElb:40,rElb:40})),sm(P3[0],P3[1],T));yaw=lerp(FACE_LEFT,FACE_LEFT-.7,sm(P3[0]-.4,P3[1]-.1,T))+.7*sm(P3[1],P3[1]+.3,T);}
 else if(T<S_T0)pose=dribble((T-P3[1])*1.6+touchStart,{foot:'l',speed:.3});
 else if(T<T_HIT+.55)pose=blendPose(dribble((S_T0-P3[1])*1.6+touchStart,{foot:'l',speed:.3}),strike(stT,{foot:'l'}),sm(S_T0,S_T0+.12,T));
 else{const u=sm(T_HIT+.55,T_HIT+1.1,T,easeIO);pose=blendPose(strike(1,{foot:'l'}),celebrate((T-T_HIT-.55)*1.3,{kind:'run'}),u);yaw=lerp(FACE_LEFT,yawTo(1,-.9)+TAU,u);}
 if(T>=S_T0&&T<T_HIT+.55)yaw=lerp(FACE_LEFT,YAW_SHOT,sm(S_T0,S_T0+.3,T));
 return{pose,yaw,X,Z};
};
/** Spain (red, faces +X): a compact box that shifts with the ball; the top man steps out and lunges too late; heads drop after the goal */
type Mark={x:number[];z:number[];ph:number};
const SPAIN:Mark[]=[{x:[-11.6,-11.9,-11.1],z:[10.4,12.6,8.6],ph:.1},{x:[-14.6,-14.9,-14.5],z:[5.2,6.2,5.6],ph:.4},{x:[-14.4,-14.4,-14.6],z:[14.6,15.2,13.4],ph:.7},{x:[-17.4,-17.4,-17.3],z:[11.3,11.8,11.0],ph:.2}];
const spainAt=(m:Mark,T:number):[number,number]=>{const u1=sm(P1[0],P2[0],T),u2=sm(P2[0],P3[1]+.6,T);return[lerp(lerp(m.x[0],m.x[1],u1),m.x[2],u2),lerp(lerp(m.z[0],m.z[1],u1),m.z[2],u2)];};
const liveSpain=(i:number):Gen=>T=>{const m=SPAIN[i],[X,Z]=spainAt(m,T),post=sm(T_IN+.3,T_IN+1.3,T);let pose=backpedal(T*1.4+m.ph);
 if(i===0){const lu=key(T,[[T_HIT-.35,0],[T_HIT+.05,.6],[T_HIT+.6,1]],linear);pose=blendPose(pose,lunge(lu,{side:'r'}),sm(T_HIT-.45,T_HIT-.3,T));}
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20}),post);
 return{pose,yaw:lerp(FACE_RIGHT,FACE_RIGHT+.4*(i%2?1:-1),post),X:X-(i===0?.9*sm(P3[1],T_HIT-.3,T):0),Z:Z-(i===0?.55*sm(P3[1],T_HIT-.3,T):0)};};
/** Brazil's other four (yellow): the deep man, the two wings, the pivot on the D; after the goal they run to Falcão */
const BRA_POS:[number,number][]=[DEEP,WING,[-13.6,3.3],[-16.6,12.4]];
const liveBra=(i:number):Gen=>T=>{const[x0,z0]=BRA_POS[i],go=sm(T_IN+.25,C1.end,T,easeIO),f=liveF(C1.end);const X=lerp(x0,f.X+[1.4,-1.2,.2,-1.6][i],go),Z=lerp(z0,f.Z+[.9,1.4,-1,.4][i],go);
 const kick=i===0?Math.max(pulse(T,P1[0]-.05,.3),pulse(T,P3[0]-.05,.3)):i===1?pulse(T,P2[0]-.05,.3):0;
 let pose=blendPose(stand(),posed({lHipF:-10,rHipF:40,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2));
 if(go>0)pose=blendPose(pose,celebrate(T*1.1+i*.3,{kind:'run'}),sm(T_IN+.25,T_IN+.7,T));
 const face=i===0?(T<P2[1]?yawTo(WING[0]-DEEP[0],WING[1]-DEEP[1]):yawTo(RECV[0]-DEEP[0],RECV[1]-DEEP[1])):i===1?yawTo(DEEP[0]-WING[0],DEEP[1]-WING[1]):i===3?FACE_RIGHT:FACE_LEFT+.3;
 return{pose,yaw:go>0?yawTo(f.X-x0,f.Z-z0):face,X,Z};};
/** Juanjo: set on his line and he does not move as it flies past (FIFA: "Juanjo didn't even move"); after it, his head drops */
const liveK:Gen=T=>{const frozen=T>=T_HIT-.2;let pose=keeperSet(frozen?(T_HIT-.2)*1.3:T*1.3);pose=blendPose(pose,posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:14,neckP:44,neckY:30,lShA:12,rShA:12,lElb:30,rElb:30}),sm(T_IN+.8,T_IN+1.8,T));
 return{pose,yaw:FACE_RIGHT,X:GOAL_X+.75,Z:lerp(10.2,9.9,sm(P3[0],P3[1],T))};};
const liveCam=(T:number)=>({x:key(T,mono([[0,-10.6],[P1[1],-12.2],[P2[1],-10.8],[P3[1],-11.2],[C1.far,-11.8],[S_T0,-13.8],[T_HIT,-14.6],[T_IN,-15.4],[T_IN+.4,-15.9],[T_IN+1.2,-15.2],[C1.end-1,-11.2],[C1.end,-10.6]]),easeInOutSine),
 zoom:key(T,mono([[0,.6],[P2[1],.6],[C1.far,.72],[S_T0,.7],[T_HIT,.64],[T_IN,.64],[T_IN+.9,.7],[C1.end,.9]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.far,1040],[T_HIT,1030],[T_IN,1010],[C1.end,1040]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_HIT,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.1,flash:pulse(T,T_IN,1.2),bulge:.5*sm(T_IN-.12,T_IN,T)*(1-.6*sm(T_IN+.2,T_IN+1.1,T))+.12*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:TOPC[2],by:TOPC[1],
  keeper:()=>{athlete(s,st,liveK,T,JUANJO,{detail:'low'});}});
 // everyone back to front by depth (far side first); the ball slots in by its depth
 type It={z:number;draw:()=>void};const items:It[]=[];
 SPAIN.forEach((_,i)=>{const g=liveSpain(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i),{detail:'low'})});});
 BRA_POS.forEach((_,i)=>{const g=liveBra(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,BRA(i),{detail:'low'})});});
 items.push({z:liveF(T).Z,draw:()=>athlete(s,st,liveF,T,FALCAO,{smear:T>T_HIT-.2&&T<T_HIT+.25?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45);
  if(b.flying){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_HIT,T-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.5,{seed:17,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.5:0,dir:Math.PI*.95});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** Falcão's chest in the live take (the passage enters his yellow shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveF(tt),.12));},still:C1.left+.1};

// ================= chapter 2 — REPLAY: slow motion, low, behind the shooter: the left foot, the frozen keeper, 2–2 =================
const C2={watch:A(1,'Watch'),keeper:A(1,'The keeper'),move:A(1,'even move'),two:A(1,'Two all'),win:A(1,'Brazil go on'),end:AUTH[1].seconds};
/** replay world = the live shot seen end-on: the goal line 10.9 m ahead; he is 2.6 m left of centre; the ball goes top corner, right */
const RB:[number,number]=[-2.62,GZ-10.9],RT:V3=[1.22,1.78,GZ-.02];
const RYAW=yawTo(RT[0]-RB[0],RT[2]-RB[1]);
const RSB=toMine(strikeBall(RYAW)),RPL:[number,number]=[RB[0]-RSB[0],RB[1]-RSB[2]];
const R_HIT=C2.watch+1.35,R_IN=C2.move+.7;
const rT=(t:number)=>key(t,[[0,.06],[R_HIT-.9,.3],[R_HIT,STRIKE_CONTACT],[R_HIT+1.6,.8],[C2.win,1]],linear);
const repF:Gen=t=>{let pose=strike(rT(t),{foot:'l'}),yaw=RYAW,X=RPL[0]+key(t,[[0,-.35],[R_HIT,0,easeOut],[R_HIT+1.8,.2]]),Z=RPL[1]+key(t,[[0,-.55],[R_HIT,0,easeOut],[R_HIT+1.8,.25]]);
 if(t>C2.win-.2){const u=sm(C2.win-.2,C2.win+.5,t,easeIO);pose=blendPose(pose,celebrate((t-C2.win)*1.2,{kind:'arms'}),u);yaw=lerp(RYAW,FACE_CAMERA+.5,u);}
 return{pose,yaw,X,Z};};
function repBall(t:number){if(t<R_HIT)return{X:RB[0],Y:BALL_R,Z:RB[1],flying:false};
 if(t<R_IN){const u=Math.pow(sm(R_HIT,R_IN,t,linear),.9),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(RB[0],RT[0],.5),1.5,lerp(RB[1],RT[2],.5)];return{X:a*RB[0]+b*M[0]+c*RT[0],Y:a*BALL_R+b*M[1]+c*RT[1],Z:a*RB[1]+b*M[2]+c*RT[2],flying:true};}
 const d=sm(R_IN+.3,R_IN+1.2,t,easeIn);return{X:RT[0],Y:lerp(RT[1],BALL_R,d),Z:GZ+.55,flying:false};}
const repK:Gen=t=>({pose:blendPose(keeperSet((T_HIT-.2)*1.3),posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:14,neckP:44,neckY:-30,lShA:12,rShA:12,lElb:30,rElb:30}),sm(R_IN+.9,R_IN+2,t)),yaw:FACE_CAMERA,X:-.25,Z:GZ-.75});
/** two red shirts between him and the goal (the late block and the far-post man) */
const repD=(i:number):Gen=>t=>{const base=i?{X:2.3,Z:GZ-4.6}:{X:-3.55,Z:RB[1]+2.2};const lu=key(t,[[R_HIT-1,0],[R_HIT+.3,.6],[R_HIT+2,1]],linear);
 return{pose:i?blendPose(backpedal(.3),stand(),sm(R_HIT,R_HIT+1,t)):blendPose(backpedal(.2),lunge(lu,{side:'l'}),sm(R_HIT-1.1,R_HIT-.8,t)),yaw:FACE_CAMERA+(i?-.3:.35),X:base.X,Z:base.Z};};
const st2=(t:number):Stage=>({F:1500,eye:1.5,cx:-1.2,cz:RB[1]-5+.4*sm(R_HIT,R_IN,t,easeIO)});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(tt),hit=pulse(t,R_HIT,.4),net=pulse(t,R_IN,.6);
  camPath(s,t,[[0,-330,230,1.35],[R_HIT-.6,-330,250,1.45],[R_HIT,-300,240,1.4],[R_HIT+.6,-120,170,1.2],[C2.move,40,90,1.5],[R_IN,90,60,1.75],[C2.two+.2,90,60,1.8],[C2.win,-60,140,1.2],[C2.end,-80,150,1.15]],[8*hit*Math.sin(t*90),5*hit*Math.cos(t*77)+4*net*Math.sin(t*60)]);
  const b=repBall(tt),goal=tt>=R_IN;
  arena(s,st,{t:tt,cheer:goal?1-.3*sm(C2.end-1,C2.end,tt):0,flash:pulse(tt,R_IN,1.2)+.6*pulse(tt,C2.win,1.4),bulge:.55*sm(R_IN-.2,R_IN,tt)*(1-.6*sm(R_IN+.4,R_IN+1.4,tt))+.12*settle(tt,R_IN,{amp:1,freq:3,decay:3}),bx:RT[0],by:RT[1],
   keeper:stg=>{
    // "The keeper": a yellow halo round him; "doesn't even move": red freeze brackets hold still around him
    const kp=repK(tt),g=proj(stg,kp.X,0,kp.Z),h=1.8*kAt(stg,kp.Z),on=sm(C2.keeper,C2.keeper+.35,tt,easeOut)*(1-sm(C2.win,C2.win+.5,tt));
    if(on>.02)s.fill(Y,ribbon(blob(g[0],g[1]-h*.5,h*.4*on,h*.58*on,91,{n:24}),8,{seed:94,close:true,wobble:1}),.9);
    athlete(s,stg,repK,tt,JUANJO,{detail:'mid'});
    const fr=easeOutBack(sm(C2.move,C2.move+.3,tt))*(1-sm(C2.win,C2.win+.5,tt));
    if(fr>.02){const w=h*.36,hh=h*.56,cx=g[0],cy=g[1]-h*.5,L=h*.14*fr,br=new Path2D();
     for(const[sx,sy] of[[-1,-1],[1,-1],[1,1],[-1,1]] as Pt[]){const x=cx+sx*w,y=cy+sy*hh;br.addPath(ribbon([[x-sx*0,y+(-sy)*L],[x,y],[x-sx*L,y]],7,{seed:92+sx+sy*3,taper:0,wobble:.6}));}
     s.fill(R,br);}
   }});
  // the flight line (dashed yellow, drawn as the ball goes) and the ball
  if(tt>R_HIT){const pts:Pt[]=[];for(let k=0;k<=18;k++){const q=repBall(lerp(R_HIT,Math.min(tt,R_IN),k/18));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,95,{dash:44});}
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.1,r*.3,96,b.flying?.25:.45);ball(s,p[0],p[1],r,97,{rot:tt*6,smear:b.flying?.4:0,dir:Math.atan2(-.4,-1)});
   if(tt>=R_HIT&&tt<R_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:98,g:easeOut(sm(R_HIT,R_HIT+.3,tt))});};
  const its:{z:number;draw:()=>void}[]=repDs.map(([g,i])=>({z:g(tt).Z,draw:()=>{athlete(s,st,g,tt,ESP(i),{detail:'mid'});}}));
  its.push({z:repF(tt).Z,draw:()=>{athlete(s,st,repF,tt,FALCAO,{detail:'high',smear:tt>R_HIT-.5&&tt<R_HIT+.4?.3:0});}},{z:b.Z<repF(tt).Z+.4&&!b.flying?repF(tt).Z+.01:b.Z,draw:drawBall});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=R_IN&&tt<R_IN+1.2){const p=proj(st,RT[0],RT[1],GZ+.4);sparkBurst(s,Y,p[0],p[1],130,{n:12,seed:99,g:easeOut(sm(R_IN,R_IN+.3,tt))*(1-sm(R_IN+.8,R_IN+1.2,tt))});}
  // "Brazil go on to win": yellow and blue confetti falls in front of the stands
  if(tt>=C2.win){const u=sm(C2.win,C2.win+2.5,tt,linear),top=proj(st,0,6,WALLZ)[1];confetti(s,[Y,B,'paper'],[-900,top-200+u*500,1800,420],26,Math.floor(tt*6),{size:16});}
 },
 aperture(t0){const{tt}=clock(1,t0),st=st2(tt),b=repBall(tt),p=proj(st,b.X,b.Y,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R)*1.1,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return aperture(q);},
 still:C2.move+.2,
};
const repDs:[Gen,number][]=[[repD(1),1],[repD(0),0]];

// ================= chapter 3 — HOW HE DID IT (demonstration): step, roll across, the defender follows, drag back, gone =================
const C3={trick:A(2,'His famous'),sole:A(2,'sole of'),how:A(2,'Here'),step:A(2,'step on'),roll:A(2,'roll it'),follows:A(2,'defender'),drag:A(2,'Drag'),gone:A(2,'he’s gone'),end:AUTH[2].seconds};
/** the demo on the centre circle: he comes toward the camera-left; the roll goes to HIS right (screen-left and up), the escape to his left */
const DF:[number,number]=[-.8,-.6],DR:[number,number]=[DF[1],-DF[0]];// forward, and his right-hand side ([fz, −fx] in our left-handed floor)
const YAW_D=yawTo(DF[0],DF[1]);
const ESC:[number,number]=(()=>{const x=DF[0]-.95*DR[0],z=DF[1]-.95*DR[1],l=Math.hypot(x,z);return[x/l,z/l];})();
const HOME:[number,number]=[1.2,4.4];// where the step happens (the ball)
/** sole poses (library, left foot on the ball): STEP = the sole flat on top; ROLL = the same sole carried across his body; DRAG = pulled back */
const STEP=posed({lHipF:55,lKnee:55,lAnk:0,lHipA:4,rHipF:14,rKnee:34,lean:14,pitch:2,neckP:34,lShA:44,rShA:38,lElb:40,rElb:44,twist:-6});
const ROLL=posed({lHipF:52,lKnee:56,lAnk:0,lHipA:-24,lHipR:-8,rHipF:18,rKnee:36,rHipA:14,lean:14,bend:8,roll:4,neckP:34,lShA:56,rShA:32,lElb:40,rElb:50,twist:14});
const DRAG=posed({lHipF:36,lKnee:78,lAnk:4,lHipA:10,rHipF:10,rKnee:40,lean:18,bend:-6,neckP:30,lShA:40,rShA:58,lElb:40,rElb:36,twist:-18});
/** the demo timeline (authored seconds) */
const D={in0:0,stepA:C3.sole+.05,up:C3.how+.2,stepB:C3.step+.1,roll0:C3.roll+.05,roll1:C3.roll+1.05,lunge:C3.follows+.05,drag0:C3.drag+.05,drag1:C3.drag+.7,go:C3.drag+.95,end:C3.end};
/** his floor position (the stance centre) */
function fPos(t:number):[number,number]{
 const back=(k:number):[number,number]=>[HOME[0]-DF[0]*k,HOME[1]-DF[1]*k];
 const a=back(3.2),b=back(.42),rolled:[number,number]=[b[0]+DR[0]*.46,b[1]+DR[1]*.46],dragged:[number,number]=[rolled[0]-DF[0]*.18,rolled[1]-DF[1]*.18];
 if(t<D.stepA){const u=sm(0,D.stepA,t,easeOut);return[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];}
 if(t<D.roll0)return b;
 if(t<D.roll1){const u=sm(D.roll0,D.roll1,t,easeIO);return[lerp(b[0],rolled[0],u),lerp(b[1],rolled[1],u)];}
 if(t<D.drag0)return rolled;
 if(t<D.go){const u=sm(D.drag0,D.go,t,easeIO);return[lerp(rolled[0],dragged[0],u),lerp(rolled[1],dragged[1],u)];}
 const u=t-D.go,dist=Math.min(2.4,u<.3?u*u*3:.27+(u-.3)*3.4);return[dragged[0]+ESC[0]*dist,dragged[1]+ESC[1]*dist];
}
const demoF:Gen=t=>{
 const[X,Z]=fPos(t);let pose:Pose,yaw=YAW_D;
 const dri=(ph:number)=>dribble(ph,{foot:'l',speed:.22});
 if(t<D.stepA-.35)pose=dri(t*1.5+.2);
 else if(t<D.up)pose=blendPose(dri((D.stepA-.35)*1.5+.2),STEP,sm(D.stepA-.35,D.stepA,t,easeIO));
 else if(t<D.stepB-.4)pose=blendPose(STEP,stand(),sm(D.up,D.up+.35,t,easeIO)*(1-.0));
 else if(t<D.roll0)pose=blendPose(stand(),STEP,sm(D.stepB-.4,D.stepB,t,easeIO));
 else if(t<D.drag0)pose=keyPoses(t,[[D.roll0,STEP],[D.roll1-.25,ROLL],[D.roll1+.3,blendPose(ROLL,STEP,.35)],[D.drag0,blendPose(ROLL,STEP,.35)]]);
 else if(t<D.go)pose=keyPoses(t,[[D.drag0,blendPose(ROLL,STEP,.35)],[D.drag1,DRAG],[D.go,blendPose(DRAG,runCycle(.55,{speed:.6}),.5)]]);
 else{pose=blendPose(DRAG,runCycle((t-D.go)*runCadence(.7)+.55,{speed:.7}),sm(D.go,D.go+.25,t));yaw=lerp(YAW_D,yawTo(ESC[0],ESC[1]),sm(D.drag1,D.go+.3,t,easeIO));}
 if(t>=D.drag0&&t<D.go)yaw=lerp(YAW_D,yawTo(ESC[0],ESC[1]),sm(D.drag1-.1,D.go+.3,t,easeIO));
 return{pose:mirrorFix(pose),yaw,X,Z};
};
/** the STEP/ROLL/DRAG poses are authored for the LEFT foot directly (l* channels), so no mirroring is needed */
const mirrorFix=(p:Pose)=>p;
/** the sole's ball point: under the middle of the sole (step / roll) or under the forefoot (drag); library skeleton → our floor */
function soleBall(t:number):[number,number]{const a=demoF(t),sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),toe=toMine(sk.lToe),heel=toMine(sk.lHeel),w=t>=D.drag0?.82:.62;return[lerp(heel[0],toe[0],w),lerp(heel[2],toe[2],w)];}
/** the ball in the demo: rolled ahead while he dribbles, under the sole from the step to the end of the drag, then pushed into the space */
function demoBall(t:number):{X:number;Z:number;spin:number}{
 const lead=(tt:number,k:number)=>{const[X,Z]=fPos(tt);return[X+DF[0]*k,Z+DF[1]*k] as [number,number];};
 const soleOn=(t>=D.stepA-.12&&t<D.up+.1)||(t>=D.stepB-.12&&t<D.go);
 if(t<D.stepA-.12){const ph=((t*1.5+.2)%1+1)%1,k=.36+.14*easeOut(ph);const[X,Z]=lead(t,k),s0=soleBall(D.stepA),w=sm(D.stepA-.5,D.stepA-.12,t);return{X:lerp(X,s0[0],w),Z:lerp(Z,s0[1],w),spin:t*9};}
 if(soleOn){const[X,Z]=soleBall(t);return{X,Z,spin:t*4};}
 if(t<D.stepB-.12){const[X,Z]=soleBall(D.up+.1);return{X,Z,spin:0};}
 const u=t-D.go,[x0,z0]=soleBall(D.go-.001),[fx,fz]=fPos(t),w=sm(0,.35,u),kick=.55+.12*Math.abs(Math.sin(u*5));return{X:lerp(x0+ESC[0]*u*1.2,fx+ESC[0]*kick,w),Z:lerp(z0+ESC[1]*u*1.2,fz+ESC[1]*kick,w),spin:u*12};
}
/** the demo defender: faces him, sets, follows the roll (lunges to HIS OWN left, toward the ball), is left stranded as he goes the other way */
const DEF0:[number,number]=[HOME[0]+DF[0]*1.55+DR[0]*.1,HOME[1]+DF[1]*1.55+DR[1]*.1];
const demoD:Gen=t=>{const lu=key(t,[[D.lunge-.1,0],[D.lunge+.35,.6],[D.lunge+1.6,.75],[C3.gone+1,1]],linear),shift=.35*sm(D.roll0+.2,D.lunge+.3,t,easeIO);
 let pose=backpedal(t*1.1);pose=blendPose(pose,stand(),sm(D.stepA-.5,D.stepA,t)*(1-sm(D.roll0,D.roll0+.3,t)));pose=blendPose(pose,lunge(lu,{side:'l'}),sm(D.lunge-.2,D.lunge,t));
 const back=t<D.stepA?.9*(1-sm(0,D.stepA,t,easeOut)):0,turn=sm(C3.gone,C3.gone+.8,t,easeIO);
 pose=blendPose(pose,posed({...{neckY:40},lHipF:40,rHipF:30,lKnee:60,rKnee:40,lean:24,lShA:40,rShA:40,lElb:50,rElb:50}),turn*.5);
 return{pose,yaw:yawTo(-DF[0],-DF[1])+turn*.6,X:DEF0[0]+DF[0]*back+DR[0]*shift,Z:DEF0[1]+DF[1]*back+DR[1]*shift};};
const soleOnBall=(t:number)=>(t>=D.stepA-.12&&t<D.up+.1)||(t>=D.stepB-.12&&t<D.go);
const st3:Stage={F:1500,eye:3.1,cx:.2,cz:-2.6};
function soleRing(s:Sheet,st:Stage,t:number,g:number,ink:string,seed:number){if(g<=.02)return;const b=demoBall(t);floorDashRing(s,st,ink,b.X,b.Z,.3,9,seed,g);}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  const f=demoF(tt),fg=proj(st,f.X,0,f.Z),fg0=proj(st,HOME[0],.8,HOME[1]),pe=fPos(C3.end),fgE=proj(st,pe[0],.8,pe[1]);
  camPath(s,t,[[0,120,470,1.1],[C3.sole,fg0[0]-60,fg0[1]-120,1.7],[C3.how-.1,fg0[0]-80,fg0[1]-140,1.6],[C3.step,fg0[0]-120,fg0[1]-150,1.7],[C3.roll,fg0[0]-160,fg0[1]-150,1.62],[C3.follows,fg0[0]-200,fg0[1]-150,1.5],[C3.drag,fg0[0]-200,fg0[1]-150,1.55],[C3.gone,fgE[0]-120,fgE[1]-60,1.2],[C3.end,fgE[0]-120,fgE[1]-40,1.2]]);
  arena(s,st,{t:tt,goal:false,centre:5.2});
  const b=demoBall(tt),bp=proj(st,b.X,BALL_R,b.Z),br=kAt(st,b.Z)*BALL_R;
  // "sole of his foot": a red ring round ball and boot; "step on the ball": a yellow ring stamps; "roll it across": the yellow dashed path;
  // "defender follows": a red arrow shows his weight going the wrong way; "Drag it back": the navy drag arrow; "he's gone": the blue escape arrow
  soleRing(s,st,tt,easeOutBack(sm(C3.sole,C3.sole+.35,tt))*(1-sm(C3.how,C3.how+.4,tt)),R,301);
  soleRing(s,st,tt,easeOutBack(sm(D.stepB-.1,D.stepB+.25,tt))*(1-sm(D.roll0+.1,D.roll0+.4,tt)),Y,302);
  if(tt>=D.roll0){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=demoBall(lerp(D.roll0,Math.min(tt,D.roll1+.2),k/12));pts.push(proj(st,q.X,0,q.Z));}dashed(s,Y,pts,12,303,{dash:36});if(tt>D.roll1-.1&&tt<D.drag0+.2)arrowHead(s,Y,pts,34,304);}
  if(tt>=D.drag0){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=demoBall(lerp(D.drag0,Math.min(tt,D.go),k/10));pts.push(proj(st,q.X,0,q.Z));}if(pts.length>1){dashed(s,R,pts,11,305,{dash:30});}}
  if(tt>=D.lunge){const u=sm(D.lunge,D.lunge+.6,tt,easeOut)*(1-sm(C3.gone,C3.gone+.4,tt)),d0=demoD(D.lunge-.2),a=proj(st,d0.X+DR[0]*.2,0,d0.Z+DR[1]*.2),c=proj(st,d0.X+DR[0]*1.3,0,d0.Z+DR[1]*1.3),pts=[a,L2(a,c,.5),c];
   if(u>.02){const q=partial(pts,u),rp=ribbon(q,13,{seed:306,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(u>.5)arrowHead(s,R,q,34,307);}}
  if(tt>=C3.gone-.3){const u=sm(C3.gone-.3,C3.gone+.6,tt,easeOut),[x0,z0]=fPos(D.go),pts:Pt[]=[];for(let k=0;k<=10;k++)pts.push(proj(st,x0+ESC[0]*(.3+2.1*k/10),0,z0+ESC[1]*(.3+2.1*k/10)));dashed(s,Y,pts,16,308,{dash:44,progress:u});if(u>.9)arrowHead(s,Y,pts,44,309);}
  // the figures back to front; the ball goes in right after the one it is in front of
  const d=demoD(tt);const items:{z:number;draw:()=>void}[]=[
   {z:d.Z,draw:()=>athlete(s,st,demoD,tt,DEMO_D,{detail:'high'})},
   {z:f.Z+.001,draw:()=>athlete(s,st,demoF,tt,FALCAO,{detail:'high',smear:(tt>D.roll0&&tt<D.roll1)||(tt>D.drag0&&tt<D.go+.2)?.18:0})},
   {z:soleOnBall(tt)?f.Z+.01:b.Z+.25,draw:()=>{shadow(s,bp[0],proj(st,b.X,0,b.Z)[1],br*1.15,br*.3,310,.45);ball(s,bp[0],bp[1],br,311,{rot:b.spin});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "he's gone": a spark where he breaks past
  if(tt>=D.go&&tt<D.go+.6){const p=proj(st,b.X,.4,b.Z);sparkBurst(s,Y,p[0],p[1],120,{n:9,seed:312,g:easeOut(sm(D.go,D.go+.3,tt))*(1-sm(D.go+.35,D.go+.6,tt))});}
  void fg;
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoF(tt),.13));},
 still:D.roll1,
};

// ================= chapter 4 — PRACTISE: slow sole rolls; three cards (step, roll, drag); keep it close; fool defenders =================
const C4={slow:A(3,'Practise'),sole:A(3,'Use your'),close:A(3,'keep the'),fool:A(3,'fool'),end:AUTH[3].seconds};
const P_HOME:[number,number]=[.1,3.9],P_YAW=FACE_CAMERA+.55,P_RIGHT:[number,number]=[Math.sin(P_YAW),-Math.cos(P_YAW)];
/** Falcão practising: step → roll across → roll back → step (loops, slow), then a drag back and away on "fool defenders" */
const practiceF:Gen=t=>{const loop=2.4,u=((t%loop)+loop)%loop,roll=keyPoses(u,[[0,STEP],[.8,ROLL],[1.3,ROLL],[2.0,STEP],[2.4,STEP]]);
 const shift=.36*key(u,[[0,0],[.8,1],[1.3,1],[2.0,0],[2.4,0]]);let pose=roll;const dr=sm(C4.fool,C4.fool+.6,t,easeIO);pose=blendPose(pose,DRAG,dr*(1-sm(C4.fool+.9,C4.fool+1.3,t)));
 pose=blendPose(pose,celebrate((t-C4.fool-1.3)*1.1,{kind:'arms'}),sm(C4.fool+1.2,C4.fool+1.6,t));
 return{pose,yaw:P_YAW,X:P_HOME[0]+P_RIGHT[0]*shift,Z:P_HOME[1]+P_RIGHT[1]*shift};};
const st4:Stage={F:1500,eye:2.6,cx:0,cz:-1.2};
const CARD_Y=720,CARD_W=190,CARDS:[number,number,string][]=[[-420,C4.sole+.2,'step'],[0,C4.sole+.75,'roll'],[420,C4.close-.1,'drag']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  camPath(s,t,[[0,80,380,1.15],[C4.sole-.4,60,420,1.1],[C4.sole+.3,40,640,.98],[C4.fool-.3,40,650,.98],[C4.fool+.4,70,420,1.2],[C4.end,80,400,1.26]]);
  arena(s,st,{t:tt,goal:false,centre:7,cheer:.8*pulse(tt,C4.fool+1.2,1.4)});
  const f=practiceF(tt),sk=solve(f.pose,BUILD,placeAt(f.X,f.Z,f.yaw)),toe=toMine(sk.lToe),heel=toMine(sk.lHeel),w=tt>C4.fool?.8:.62,bx=lerp(heel[0],toe[0],w),bz=lerp(heel[2],toe[2],w);
  const away=sm(C4.fool+.5,C4.fool+1.2,tt,easeOut),BX=bx+.9*away,BZ=bz+.25*away;
  // "keep the ball close": a tight yellow ring binds the ball to the sole
  const close=easeOutBack(sm(C4.close,C4.close+.35,tt))*(1-sm(C4.fool-.2,C4.fool,tt));
  if(close>.02)floorDashRing(s,st,Y,BX,BZ,.34,9,401,close);
  const bp=proj(st,BX,BALL_R,BZ),br=kAt(st,BZ)*BALL_R;
  shadow(s,bp[0],proj(st,BX,0,BZ)[1],br*1.15,br*.3,402,.45);ball(s,bp[0],bp[1],br,403,{rot:tt*3});
  athlete(s,st,practiceF,tt,FALCAO,{detail:'high'});
  // the three cards rise on "Use your sole", each prints one step with a small figure; they drop before "fool defenders"
  const rise=sm(C4.sole-.2,C4.sole+.4,tt,easeOut),drop=sm(C4.fool-.5,C4.fool-.1,tt,easeIn);
  if(rise>.01&&drop<1){const dy=(1-rise)*700+drop*900,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const q=handCut([[cx-CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y+230+dy],[cx-CARD_W,CARD_Y+230+dy]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(B,cards,.16);
   CARDS.forEach(([cx,t0c,kind],i)=>{const on=sm(t0c,t0c+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+175;
    const fc=figureCam({x:cx+10,y:gy,height:400*(.9+.1*on),azimuth:-150,elevation:16,fov:16,at:[.2,0,0]});
    s.save();s.clip(polyPath(outline[i],true));
    const pose=kind==='step'?STEP:kind==='roll'?ROLL:DRAG,csk=solve(pose,BUILD,{}),ct=csk.lToe,ch=csk.lHeel,cw=kind==='drag'?.82:.62,cb:V3=[lerp(ch[0],ct[0],cw),BALL_R,lerp(ch[2],ct[2],cw)];
    const bb=fc.project(cb),bR=BALL_R*(fc.scale?fc.scale(cb):100),Pc=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    // the move's diagram under the ball: step = a red sole mark, roll = a yellow arrow across, drag = a navy arrow back
    if(kind==='step')s.fill(R,polyPath(blob(bb[0],bb[1]+bR*.9,bR*1.9,bR*.55,80,{n:18}),true),.55);
    if(kind==='roll'){const a0=Pc([cb[0],0,cb[2]-.5]),a1=Pc([cb[0],0,cb[2]+.05]);const pts:Pt[]=[a0,L2(a0,a1,.5),a1];dashed(s,Y,pts,8,85,{dash:22});arrowHead(s,Y,pts,24,86);}
    if(kind==='drag'){const a0=Pc([cb[0]+.45,0,cb[2]]),a1=Pc([cb[0]-.05,0,cb[2]]);const pts:Pt[]=[a0,L2(a0,a1,.5),a1];dashed(s,K,pts,8,87,{dash:22});arrowHead(s,K,pts,24,88);}
    shadow(s,bb[0],Pc([cb[0],0,cb[2]])[1],bR*1.1,bR*.3,89+i,.4);ball(s,bb[0],bb[1],bR,81+i);
    drawAthlete(s,pose,fc,{...FALCAO,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    if(close>.02){const c=Pc([cb[0],0,cb[2]]);s.fill(Y,ribbon(blob(c[0],c[1]-bR*.8,bR*1.9*close,bR*1.5*close,90+i,{n:20}),7,{seed:93+i,close:true,wobble:1}),1);}
    s.restore();});
   s.fill(K,frames);}
  // "fool defenders": a big blue tick stamps beside him, with a navy misregistered echo and a yellow burst
  const tick=easeOutBack(sm(C4.fool+.2,C4.fool+.55,tt));
  if(tick>.02){const g=proj(st,f.X,0,f.Z),h=kAt(st,f.Z)*1.77,c:Pt=[g[0]+h*.62,g[1]-h*.72],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.close+.3,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'falcao-futsal-signature',format:'futsal',title:'Falcão’s sole of the foot',theme:'Keep the ball under your sole, then fool the defender.',
 ageNote:'For players aged 7–12: the 2012 World Cup final goal is real; the sole trick is shown as a demonstration. Practise it slowly.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball drops, a sole (navy boot print) taps it down, rings squeak out; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const fall=sm(0,.25,age,easeIn),by=y-150*(1-fall),u=clamp((age-.25)/.5);
  if(age>.25&&u<1){s.fill(Y,ribbon(blob(x,y+r*.9,r*(1+2*u),r*(.3+.6*u),seed,{n:24}),8*(1-u)+2,{seed,close:true,wobble:1.2}),1);s.fill(B,ribbon(blob(x,y+r*.9,r*(.6+1.3*u),r*(.2+.4*u),seed+1,{n:24}),6*(1-u)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(x,y+r*.95,r*(.7+.3*fall),r*.2,seed+2,{n:16}),true),.32);
  ball(s,x,by,r,seed,{rot:age*4});
  const tap=sm(.2,.3,age)*(1-sm(.45,.7,age));if(tap>.02){const sole=blob(x+4,by-r-10+18*(1-tap),r*1.1,r*.34,seed+3,{n:18});s.fill(K,polyPath(sole,true),.85*tap);}
 },
};
export default film;
