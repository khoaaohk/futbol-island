/** Eder Lima — "the pivot's thunderous shot": a signature-move riso film (iconic plays, FUTSAL, pivot).
 *
 * WHY THIS MOMENT: Eder Lima's entry (lib/town/iconicPlays.json) is a signature — the pivot's thunderous shot — not one match. The 2016 FIFA
 * Futsal World Cup final is the biggest match he played in that is not already used by another futsal film (Mammarella's film uses the EURO
 * 2014 final, Sergio Lozano's and Luis Amado's the EURO 2012 final). FIFA's official match report and MatchCast confirm his hat-trick in that
 * final, and that his third goal was a SECOND PENALTY (the futsal free shot from the 10 m mark, with no wall) — a pure shooting moment:
 *  1  LIVE (broadcast camera, main stand, real time): the final, 1 Oct 2016, 14:30, Coliseo el Pueblo, Cali, Russia 4–5 Argentina. Argentina
 *     lead 5–3 (Lyskov made it 3–5 at 38:56). At 39:40 "Argentina concede a free-kick following a challenge on a player from Russia" — a
 *     second penalty — and at 39:41 "EDER LIMA (Russia) successfully converts the second penalty!" — 4–5, his third goal of the final.
 *  2  REPLAY (slow motion, low, behind the shooter): no wall, only the keeper (Nicolás Sarmiento, Argentina #1); the swing, the strike, the net;
 *     4–5. At 40:00 "A player from Argentina rattles the crossbar", then the final whistle: Argentina are world champions for the first time.
 *  3  HOW A PIVOT SHOOTS (a demonstration, no match claimed; neutral paper/navy defender and keeper): back to goal just outside the area, he
 *     feels the defender lean, turns the other way and shoots hard and low. UEFA described his EURO 2014 final goal as "a brilliant turn and
 *     diagonal shot". Lesson from the entry's `lesson`: "Turn and shoot hard and low from just outside the area."
 * Sources (written; ≤ 8 requests, 5 s apart, cached in scratchpad/films/src-cache/):
 *  - FIFA.com match centre, Russia v Argentina, FIFA Futsal World Cup Colombia 2016 final (archived 4 Oct 2016):
 *    https://web.archive.org/web/20161004140432/http://www.fifa.com:80/futsalworldcup/matches/round=276094/match=300357638/index.html
 *    — "Coliseo el Pueblo Cali (COL) 01 Oct 2016 - 14:30"; "Russia 4-5 Argentina"; scorers "EDER LIMA 15'23", 21'18", 39'41" 2PG",
 *    "LYSKOV 38'56"", "A. VAPORAKI 15'49"", "CUZZOLINO 19'34" 2PG", "BRANDI 21'35", 22'33"", "C. VAPORAKI 38'19""; MatchCast: "38'56'' LYSKOV
 *    (Russia) scores!!", "39'40'' Argentina concede a free-kick following a challenge on a player from Russia", "39'41'' EDER LIMA (Russia)
 *    successfully converts the second penalty!", "40'00'' So close! A player from Argentina rattles the crossbar", "The final whistle sounds";
 *    line-ups "8 EDER LIMA", "12 GUSTAVO (GK)", "1 SARMIENTO (GK)", "6 WILHELM (C)"; summary "Argentina claim maiden futsal crown".
 *  - FIFA.com official match report (archived 16 Nov 2016, …/report.html): "Final Russia - Argentina 4:5 (1:2)", attendance 8559, referee
 *    Fernando Gutiérrez Lumbreras (ESP); "EDER LIMA (RUS) 39'41" Penalty goal".
 *  - Wikipedia, "2016 FIFA Futsal World Cup" (raw): final 1 Oct 2016, Coliseo El Pueblo, Cali, attendance 8,559; kits in the final (Russia all
 *    red; Argentina sky-blue/white striped shirts, white shorts and socks); awards: Eder Lima Silver Shoe (10 goals) and Silver Ball.
 *  - Wikipedia, "Éder Lima (futsal player)" (raw): Éder Fermino Lima, born São Paulo 1984, pivot, 1.84 m, Russia national team 2009–2022.
 *  - UEFA.com EURO 2014 final report (cached, Mammarella film): "Eder Lima levelled … with a brilliant turn and diagonal shot" (for chapter 3).
 * CONFIRMED: match, date, kick-off, venue, attendance, score before (3–5) and after (4–5), the foul at 39:40 and the second-penalty goal at 39:41
 *  (a free shot from the 10 m mark: no wall, the keeper at least 5 m from the ball, everyone else behind the ball — Laws of the Game), his
 *  hat-trick in the final, his shirt number 8, Argentina's keeper Sarmiento (#1), the crossbar at 40:00, Argentina champions; kits per Wikipedia.
 * INFERRED (not named in the narration): his shooting foot (LEFT, from the card's `foot` param — the Mammarella film drew him right-footed; neither
 *  is verified), how hard, where the kick went (about 1.2 m up, the keeper's right, far post from the camera) and the keeper's dive; which goal;
 *  Sarmiento's keeper kit (yellow) and position (≈4 m off his line); where the other eight stood behind the ball; his run to fetch the ball;
 *  his short dark hair; the court colour. No video was reviewed. Chapter 3 is a demonstration of the lesson, not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library z → −Z; the
 * strikes use the LEFT foot (foot:'l'); the ball sits at the solved left toe at contact.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: red (Russia, rings), yellow (Sarmiento, lights, flight lines), blue (court, Argentina stripes), navy (key line, run-off, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–300 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2016 final',text:'The 2016 Futsal World Cup final, in Cali. Argentina lead Russia five three, with seconds left. Then Russia win a second penalty: a free shot from ten metres. Eder Lima strikes it like thunder. Goal! His third of the final.',tail:2.4,
  cues:['The 2016','Argentina lead','seconds left','second penalty','ten metres','Eder Lima','like thunder','Goal','His third'],heads:{'The 2016':'World Cup final 2016','Argentina lead':'3–5','second penalty':'Second penalty','Goal':'4–5','His third':'Hat-trick'}},
 {label:'Replay: no wall',text:'Watch again. No wall, only the keeper. One big swing, and bang! Five four! But time runs out, and Argentina are champions.',tail:2.2,
  cues:['Watch again','No wall','only the keeper','One big swing','bang','Five four','But time','Argentina are'],heads:{'Five four':'4–5','Argentina are':'Argentina champions'}},
 {label:'Turn and shoot',text:'Watch how a pivot does it. Back to goal, feel the defender lean. Then turn, and shoot hard and low from just outside the area!',tail:2.6,
  cues:['Watch how','Back to goal','defender lean','Then turn','shoot hard','just outside'],heads:{'Back to goal':'Back to goal','Then turn':'Turn','shoot hard':'Hard and low'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/eder-lima-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/eder-lima-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/eder-lima-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('eder-lima: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('eder-lima: no cue '+w);return c.at;};
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
const bez=(a:V3,m:V3,c:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*c[0],p*a[1]+q*m[1]+r*c[1],p*a[2]+q*m[2]+r*c[2]];};

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line; on the blue court it is knocked out to paper first so the ink prints clean (no overprint) */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
/** a solid hand-drawn arrow (knocked out first) along pts, drawn up to `progress` */
function arrow(s:Sheet,ink:string,pts:Pt[],w:number,seed:number,progress=1){const q=partial(smoothPts(pts,false,8),clamp(progress));if(q.length<2)return;const rp=ribbon(q,w,{seed,taper:.2,wobble:1});s.knockout(rp);s.fill(ink,rp);arrowHead(s,ink,q,w*2.8,seed+1);}
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
const SKIN:InkFill[]=[[Y,.62],[K,.26]];
const BUILD={height:1.84,bulk:1.06};
/** Eder Lima: Russia no. 8 (FIFA line-up) — all red (Wikipedia kit table), 1.84 m, short dark hair (inferred), left foot (card param, inferred) */
const EDER:AthleteStyle={shirt:R,shorts:R,socks:R,boots:K,skin:SKIN,hair:K,line:K,trim:'paper',number:8,numberInk:'paper',hairStyle:'short',build:BUILD,seed:8};
const RUS=(n:number):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:n%2?[[Y,.8],[R,.26]]:[[Y,.72],[R,.2]],hair:n%3?K:[Y,.9],line:K,trim:'paper',numberInk:'paper',hairStyle:n%2?'short':'bald',build:{height:1.74+hash(n,3)*.12},seed:20+n});
/** Argentina: sky-blue and white stripes, white shorts and socks (Wikipedia kit table for the final) */
const ARG=(n:number):AthleteStyle=>({shirt:[B,.55],pattern:'stripes',patternInk:'paper',shorts:'paper',socks:'paper',boots:K,skin:[[Y,.78],[R,.24]],hair:n%2?K:[K,.8],line:K,trim:K,numberInk:K,hairStyle:n%3?'short':'curly',build:{height:1.72+hash(n,5)*.12},seed:40+n});
/** Sarmiento, Argentina's keeper (#1) — a yellow keeper kit (inferred) */
const SARMIENTO:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',number:1,numberInk:K,hairStyle:'short',build:{height:1.8},seed:62};
/** the demonstration defender and keeper: neutral paper/navy training kits (no team is claimed in chapter 3) */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
const DEMO_K:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.7],[R,.2]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:78};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[R,.6],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** the LEFT-foot strike: where the ball sits at contact — just past the kicking toe along the foot (library coords, place at the origin) */
const strikeL=(t:number)=>strike(t,{foot:'l'});
function strikeBall(yaw:number):V3{const sk=solve(strikeL(STRIKE_CONTACT),BUILD,{yaw}),toe=sk.lToe,an=sk.lAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}
/** stance point so that the ball at `ball` meets his left toe when he strikes toward `target` */
function plantFor(ball:[number,number],target:V3){const yaw=yawTo(target[0]-ball[0],target[2]-ball[1]),sb=toMine(strikeBall(yaw));return{yaw,P:[ball[0]-sb[0],ball[1]-sb[2]] as [number,number]};}

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
/** stepped navy rows, lit faces, red / sky-blue / yellow shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.14)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.26)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues,.6);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Argentina's goal at X = +20 (inferred end) ----
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
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;area?:number};
/** the court seen end-on: blue floor + run-off, paper lines (goal line, the 6 m area, the 6 m and 10 m marks), boards, stands, the goal.
 *  area > 0 lights the penalty-area line in yellow ("just outside the area"). */
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0,area=0}=o;
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
 if(area>.02)dashed(s,Y,arcPts.map(p=>proj(st,p[0],0,p[1])),12,811,{dash:40,progress:area});
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
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
/** red corner brackets that snap round a figure standing at (X,Z) */
function brackets(s:Sheet,st:Stage,X:number,Z:number,fr:number,seed:number){
 if(fr<=.02)return;const g=proj(st,X,0,Z),h=1.8*kAt(st,Z),w=h*.42,hh=h*.58,cx=g[0],cy=g[1]-h*.5,Lb=h*.2*fr,br=new Path2D();
 for(const[sx,sy] of[[-1,-1],[1,-1],[1,1],[-1,1]] as Pt[]){const x=cx+sx*w,y=cy+sy*hh;br.addPath(ribbon([[x,y-sy*Lb],[x,y],[x-sx*Lb,y]],13,{seed:seed+sx+sy*3,taper:0,wobble:.6}));}
 s.knockout(br);s.fill(R,br);
}

// ================= chapter 1 — LIVE: the 2016 World Cup final, 39:41; the second penalty from the 10 m mark =================
const C1={arg:A(0,'Argentina lead'),secs:A(0,'seconds left'),pen:A(0,'second penalty'),ten:A(0,'ten metres'),eder:A(0,'Eder Lima'),thunder:A(0,'like thunder'),goal:A(0,'Goal'),third:A(0,'His third'),end:AUTH[0].seconds};
/** the 10 m mark (second-penalty mark) and the kick: about 1.2 m up, the keeper's right (the far post from the camera) — placement inferred */
const MARK:[number,number]=[GOAL_X-10,10],TGT:V3=[GOAL_X-.08,1.25,POST_F-.3];
const T_HIT=C1.thunder+.28,T_IN=T_HIT+.42;
const LIVE=plantFor(MARK,TGT),RUN=2.6,DIRX=Math.cos(LIVE.yaw),DIRZ=Math.sin(LIVE.yaw);
const START:[number,number]=[LIVE.P[0]-DIRX*RUN,LIVE.P[1]-DIRZ*RUN];
const S_T0=T_HIT-.95,WALK=3.4;
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 if(T<T_HIT)return{X:MARK[0],Y:BALL_R,Z:MARK[1],flying:false,spin:0};
 if(T<T_IN){const u=sm(T_HIT,T_IN,T,linear),p=bez([MARK[0],BALL_R,MARK[1]],[lerp(MARK[0],TGT[0],.5),1.3,lerp(MARK[1],TGT[2],.5)],TGT,u);return{X:p[0],Y:p[1],Z:p[2],flying:true,spin:20+u*40};}
 const d=sm(T_IN+.1,T_IN+.45,T,easeIn);
 return{X:GOAL_X+.6,Y:lerp(TGT[1],BALL_R,d),Z:TGT[2]+.1,flying:false,spin:60};
}
/** Eder Lima live: sets the ball on the mark → walks back to his run-up → waits → runs in → left-foot strike → runs on to fetch the ball */
const liveE:Gen=T=>{
 const X=key(T,mono([[0,MARK[0]-.7],[.9,MARK[0]-.7],[WALK,START[0],easeIO],[S_T0,START[0]],[T_HIT,LIVE.P[0],easeIn],[T_HIT+.5,LIVE.P[0]+.5,easeOut],[C1.end,GOAL_X-1.4,easeIO]]));
 const Z=key(T,mono([[0,MARK[1]-.1],[.9,MARK[1]-.1],[WALK,START[1],easeIO],[S_T0,START[1]],[T_HIT,LIVE.P[1],easeIn],[T_HIT+.5,LIVE.P[1]+.2*DIRZ,easeOut],[C1.end,9.4,easeIO]]));
 let pose:Pose,yaw=LIVE.yaw;
 if(T<.9){pose=posed({lHipF:50,rHipF:30,lKnee:80,rKnee:60,lean:46,neckP:30,lShF:60,rShF:60,lElb:20,rElb:20});}
 else if(T<WALK){pose=blendPose(posed({lHipF:50,rHipF:30,lKnee:80,rKnee:60,lean:46,neckP:30,lShF:60,rShF:60,lElb:20,rElb:20}),backpedal((T-.9)*1.4),sm(.9,1.3,T));}
 else if(T<S_T0){pose=blendPose(backpedal((WALK-.9)*1.4),stand(),sm(WALK,WALK+.4,T));pose=blendPose(pose,posed({lean:10,neckP:-4,lShA:20,rShA:20,lElb:30,rElb:30,lHipF:14,rHipF:8,lKnee:20,rKnee:16}),.4+.2*Math.sin(T*3));}
 else if(T<T_HIT+.55){const stT=key(T,[[S_T0,0],[S_T0+.45,.22],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,.95]],linear);pose=blendPose(stand(),strikeL(stT),sm(S_T0,S_T0+.12,T));}
 else{const u=sm(T_HIT+.55,T_HIT+1,T,easeIO);pose=blendPose(strikeL(.95),runCycle((T-T_HIT)*runCadence(.7),{speed:.7}),u);pose=blendPose(pose,stand(),sm(C1.end-.9,C1.end-.2,T));}
 if(T>T_HIT+.55)yaw=lerp(LIVE.yaw,yawTo(GOAL_X-1.4-LIVE.P[0],9.4-LIVE.P[1]),sm(T_HIT+.55,T_HIT+1,T));
 return{pose,yaw,X,Z};
};
/** the eight others stand behind the line of the ball, at least 5 m away (the law); Russia's lift their arms at the goal, Argentina's drop heads */
const LINE:{X:number;Z:number;rus:boolean}[]=[{X:4.6,Z:4.2,rus:false},{X:4.2,Z:6.4,rus:true},{X:4.8,Z:14.8,rus:false},{X:4.4,Z:16.6,rus:true},{X:3.6,Z:12.6,rus:true},{X:3.9,Z:18.2,rus:false},{X:3.4,Z:2.8,rus:false}];
const liveLine=(i:number):Gen=>T=>{const m=LINE[i],goal=sm(T_IN+.1,T_IN+.5,T),toBall=yawTo(MARK[0]-m.X+6,MARK[1]-m.Z);
 let pose=blendPose(stand(),posed({lean:12,lShA:18,rShA:18,lElb:30,rElb:30,lHipF:10,rHipF:10,lKnee:18,rKnee:18,neckP:-6}),.5+.3*Math.sin(T*2+i));
 if(m.rus)pose=blendPose(pose,celebrate((T-T_IN)*1.1+i*.2,{kind:'arms'}),goal*(1-sm(T_IN+1.8,T_IN+2.4,T)));
 else pose=blendPose(pose,posed({lShA:40,rShA:40,lShF:150,rShF:150,lElb:120,rElb:120,neckP:30,lean:14,lHipF:6,rHipF:6,lKnee:10,rKnee:10}),goal);
 return{pose,yaw:toBall,X:m.X+(m.rus?.9*sm(T_IN+1.8,C1.end,T,easeIO):0),Z:m.Z};};
/** Sarmiento: set ≈4 m off his line (≥ 5 m from the ball), then a dive to his right — the ball is past him (dive side inferred) */
const DIVE0=T_HIT+.03;
const liveK:Gen=T=>{let pose=keeperSet(T*1.3);
 if(T>=DIVE0){const u=sm(DIVE0,DIVE0+.9,T,linear)*.95;pose=blendPose(keeperSet(DIVE0*1.3),keeperDive(u,{side:'r',height:0}),sm(DIVE0,DIVE0+.1,T));}
 return{pose,yaw:FACE_LEFT,X:GOAL_X-4-.4*sm(C1.pen,C1.ten,T,easeIO),Z:10+.8*sm(DIVE0+.1,DIVE0+.6,T,easeOut)};};
const liveCam=(T:number)=>({x:key(T,mono([[0,8.4],[C1.arg,9.6],[C1.pen,12.6],[C1.ten,13.8],[C1.eder,13.5],[S_T0,13.8],[T_HIT,14.6],[T_IN,15.4],[T_IN+.6,15.6],[C1.third,15.2],[C1.end,15]]),easeInOutSine),
 zoom:key(T,mono([[0,.48],[C1.arg,.5],[C1.pen,.52],[C1.ten,.48],[C1.eder,.55],[S_T0,.57],[T_HIT,.56],[T_IN,.58],[T_IN+.9,.62],[C1.end,.66]]),easeInOutSine),
 y:key(T,mono([[0,870],[C1.pen,870],[T_HIT,860],[T_IN,850],[C1.end,880]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_HIT,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.15+.3*pulse(T,C1.pen,1.2),flash:pulse(T,T_IN,1.2)+.4*pulse(T,C1.pen,1),bulge:.5*sm(T_IN-.12,T_IN,T)*(1-.6*sm(T_IN+.2,T_IN+1.1,T))+.12*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:TGT[2],by:TGT[1],
  keeper:()=>{athlete(s,st,liveK,T,SARMIENTO,{detail:'low'});}});
 // "second penalty": a yellow dashed ring pops round the 10 m mark; "ten metres": a yellow measuring line from the mark to the goal line
 const ring=easeOutBack(sm(C1.pen,C1.pen+.35,T))*(1-sm(T_HIT-.2,T_HIT+.1,T));floorDashRing(s,st,Y,MARK[0],MARK[1],.8,12,501,ring);
 const meas=sm(C1.ten,C1.ten+.8,T,easeOut)*(1-sm(C1.eder+.4,C1.eder+.9,T));
 if(meas>.02){const pts:Pt[]=[];for(let k=0;k<=10;k++)pts.push(proj(st,MARK[0]+k,0,MARK[1]+.9));dashed(s,Y,pts,16,502,{dash:44,progress:meas});
  const ticks=new Path2D();for(let k=0;k<=10;k+=5){if(k/10>meas)break;const a=proj(st,MARK[0]+k,0,MARK[1]+.6),e=proj(st,MARK[0]+k,0,MARK[1]+1.2);ticks.addPath(ribbon([a,e],13,{seed:503+k,taper:0,wobble:.5}));}s.knockout(ticks);s.fill(Y,ticks);
  if(meas>.97)arrowHead(s,Y,pts,46,504);}
 // "Eder Lima": a red ring finds him
 const E=liveE(T),find=easeOutBack(sm(C1.eder,C1.eder+.35,T))*(1-sm(S_T0+.2,S_T0+.5,T));floorDashRing(s,st,R,E.X,E.Z,.75,11,505,find);
 // everyone back to front by depth (far side first); the ball slots in by its depth
 type It={z:number;draw:()=>void};const items:It[]=[];
 LINE.forEach((m,i)=>{const g=liveLine(i);items.push({z:m.Z,draw:()=>athlete(s,st,g,T,m.rus?RUS(i):ARG(i),{detail:'low'})});});
 items.push({z:E.Z,draw:()=>athlete(s,st,liveE,T,EDER,{smear:T>T_HIT-.2&&T<T_HIT+.25?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45);
  if(b.flying){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_HIT,T-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.5,{seed:17,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.5:0,dir:Math.atan2(-.1,1)});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "His third": three balls stamp above him, one after another (his hat-trick in the final)
 if(T>=C1.third-.05){const top=proj(st,E.X,3.1,E.Z),r=Math.max(16,kAt(st,E.Z)*.34);for(let k=0;k<3;k++){const g=easeOutBack(sm(C1.third+k*.22,C1.third+k*.22+.3,T));if(g<.02)continue;ball(s,top[0]+(k-1)*r*2.5,top[1]-r*(k===1?.6:0),r*g,520+k,{rot:k});}}
}
/** Eder's chest (the passage enters his red shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveE(tt),.12));},still:T_HIT+.05};

// ================= chapter 2 — REPLAY: slow motion, low, behind the shooter: no wall, only the keeper; the swing; bang; 4–5 =================
const C2={watch:A(1,'Watch'),wall:A(1,'No wall'),keeper:A(1,'only the'),swing:A(1,'One big'),bang:A(1,'bang'),five:A(1,'Five four'),time:A(1,'But time'),champ:A(1,'Argentina are'),end:AUTH[1].seconds};
/** replay world = the live kick seen end-on: the mark 10 m out on the centre line; the ball flies to screen left (the live far post) */
const RB:[number,number]=[0,GZ-10],RT:V3=[-1.2,1.25,GZ-.02];
const REP=plantFor(RB,RT),RUNR=2.4,RDX=Math.cos(REP.yaw),RDZ=Math.sin(REP.yaw);
const R_HIT=C2.bang,R_IN=R_HIT+.75;
const R_S0=C2.swing-.9;
const rT=(t:number)=>key(t,[[R_S0,0],[C2.swing,.22],[C2.swing+.45,.4],[R_HIT,STRIKE_CONTACT],[R_HIT+1.6,.8],[C2.time,.95]],linear);
const repE:Gen=t=>{const X=key(t,mono([[0,REP.P[0]-RDX*RUNR],[R_S0,REP.P[0]-RDX*RUNR],[R_HIT,REP.P[0],easeIn],[R_HIT+1.8,REP.P[0]+.3,easeOut],[C2.end,REP.P[0]+1.2,easeIO]])),
  Z=key(t,mono([[0,REP.P[1]-RDZ*RUNR],[R_S0,REP.P[1]-RDZ*RUNR],[R_HIT,REP.P[1],easeIn],[R_HIT+1.8,REP.P[1]+.4,easeOut],[C2.end,REP.P[1]+2.4,easeIO]]));
 let pose=t<R_S0?blendPose(stand(),posed({lean:12,neckP:-6,lShA:22,rShA:22,lElb:30,rElb:30,lHipF:12,rHipF:10,lKnee:22,rKnee:18}),.6+.2*Math.sin(t*2.5)):blendPose(stand(),strikeL(rT(t)),sm(R_S0,R_S0+.15,t)),yaw=REP.yaw;
 if(t>C2.time-.3){const u=sm(C2.time-.3,C2.time+.5,t,easeIO);pose=blendPose(pose,runCycle((t-C2.time)*runCadence(.6),{speed:.6}),u);yaw=lerp(REP.yaw,yawTo(.3,1),u);}
 return{pose,yaw,X,Z};};
function repBall(t:number){if(t<R_HIT)return{X:RB[0],Y:BALL_R,Z:RB[1],flying:false};
 if(t<R_IN){const u=sm(R_HIT,R_IN,t,linear),p=bez([RB[0],BALL_R,RB[1]],[lerp(RB[0],RT[0],.5),1.3,lerp(RB[1],RT[2],.5)],RT,u);return{X:p[0],Y:p[1],Z:p[2],flying:true};}
 const d=sm(R_IN+.2,R_IN+.8,t,easeIn);return{X:RT[0],Y:lerp(RT[1],BALL_R,d),Z:GZ+.6,flying:false};}
/** Sarmiento in the replay: ≈4 m off his line, set; the late dive to his right (screen left) — the ball is past his hands */
const KZ=GZ-3.2,RDIVE=R_HIT+.3;
const repK:Gen=t=>{let pose=keeperSet(t*.5);if(t>=RDIVE)pose=blendPose(keeperSet(RDIVE*.5),keeperDive(sm(RDIVE,RDIVE+2.2,t,linear)*.95,{side:'r',height:0}),sm(RDIVE,RDIVE+.2,t));
 return{pose,yaw:FACE_CAMERA,X:.05-.3*sm(RDIVE+.2,RDIVE+1.4,t,easeOut),Z:KZ};};
const st2=(t:number):Stage=>({F:1500,eye:1.6,cx:-1.3,cz:RB[1]-7.2+.6*sm(R_HIT,R_IN,t,easeIO)});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(tt),hit=pulse(t,R_HIT,.4),net=pulse(t,R_IN,.6);
  camPath(s,t,[[0,300,210,1.3],[C2.wall-.2,200,160,1.25],[C2.keeper,60,80,1.4],[C2.swing,240,220,1.35],[R_HIT,220,220,1.35],[R_HIT+.6,120,180,1.25],[R_IN-.3,20,120,1.45],[R_IN,10,110,1.6],[C2.five+.3,10,110,1.62],[C2.time,120,160,1.3],[C2.end,100,170,1.2]],[8*hit*Math.sin(t*90),5*hit*Math.cos(t*77)+4*net*Math.sin(t*60)]);
  const b=repBall(tt),goal=tt>=R_IN;
  arena(s,st,{t:tt,cheer:goal?.8*(1-.3*sm(C2.champ,C2.end,tt)):.1,flash:pulse(tt,R_IN,1.2)+.6*pulse(tt,C2.champ,1.4),bulge:.55*sm(R_IN-.2,R_IN,tt)*(1-.6*sm(R_IN+.4,R_IN+1.4,tt))+.12*settle(tt,R_IN,{amp:1,freq:3,decay:3}),bx:RT[0],by:RT[1],
   keeper:stg=>{athlete(s,stg,repK,tt,SARMIENTO,{detail:'mid'});}});
  // "No wall": a red dashed line where a wall would stand (5 m from the ball), struck through with a red cross
  const nw=sm(C2.wall,C2.wall+.5,tt,easeOut)*(1-sm(C2.keeper-.1,C2.keeper+.3,tt));
  if(nw>.02){const zW=RB[1]+5,pts=[proj(st,-3,0,zW),proj(st,-1.9,0,zW),proj(st,-.8,0,zW)];dashed(s,R,pts,14,601,{dash:36,progress:nw});
   const x=easeOutBack(sm(C2.wall+.35,C2.wall+.65,tt));if(x>.02){const c=proj(st,-1.9,.7,zW),S=170*x,cr=new Path2D();cr.addPath(ribbon([[c[0]-S*.5,c[1]-S*.5],[c[0]+S*.5,c[1]+S*.5]],22,{seed:602,taper:.1,wobble:1}));cr.addPath(ribbon([[c[0]+S*.5,c[1]-S*.5],[c[0]-S*.5,c[1]+S*.5]],22,{seed:603,taper:.1,wobble:1}));s.knockout(cr);s.fill(R,cr);}}
  // "only the keeper": red brackets snap round Sarmiento
  {const kp=repK(tt);brackets(s,st,kp.X,kp.Z,easeOutBack(sm(C2.keeper,C2.keeper+.3,tt))*(1-sm(C2.swing,C2.swing+.4,tt)),604);}
  // the flight line (dashed yellow, drawn as the ball goes)
  if(tt>R_HIT){const pts:Pt[]=[];for(let k=0;k<=18;k++){const q=repBall(lerp(R_HIT,Math.min(tt,R_IN),k/18));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,95,{dash:44});}
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(-.1,-1);shadow(s,g[0],g[1],r*1.1,r*.3,96,b.flying?.3:.45);
   if(b.flying)speedLines(s,R,p[0],p[1],dir,{n:5,seed:605+Math.floor(tt*6),len:r*3.5,spread:r*.8,width:5});
   ball(s,p[0],p[1],r,97,{rot:tt*6,smear:b.flying?.5:0,dir});
   if(tt>=R_HIT&&tt<R_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.8,{n:10,seed:98,g:easeOut(sm(R_HIT,R_HIT+.3,tt))});};
  // "One big swing": a yellow swoosh arcs behind his kicking leg on the backswing
  const E=repE(tt),sw=sm(C2.swing,C2.swing+.4,tt)*(1-sm(R_HIT,R_HIT+.2,tt));
  if(sw>.02){const c=proj(st,E.X-.35,.5,E.Z-.1),rr=.9*kAt(st,E.Z),pts:Pt[]=[];for(let k=0;k<=10;k++){const a=Math.PI*.15+k/10*Math.PI*.8;pts.push([c[0]-Math.cos(a)*rr*.7,c[1]+Math.sin(a)*rr*-.6]);}const rp=ribbon(partial(pts,sw),14,{seed:606,taper:.7,wobble:1});s.knockout(rp);s.fill(Y,rp);}
  const its:{z:number;draw:()=>void}[]=[{z:E.Z,draw:()=>{athlete(s,st,repE,tt,EDER,{detail:'high',smear:tt>R_HIT-.5&&tt<R_HIT+.4?.3:0});}},{z:b.Z<E.Z+.4&&!b.flying?E.Z+.01:b.Z,draw:drawBall}];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=R_IN&&tt<R_IN+1.2){const p=proj(st,RT[0],RT[1],GZ+.4);sparkBurst(s,Y,p[0],p[1],130,{n:12,seed:99,g:easeOut(sm(R_IN,R_IN+.3,tt))*(1-sm(R_IN+.8,R_IN+1.2,tt))});}
  // "But time runs out": a clock disc drains red to nothing above the goal
  const tm=sm(C2.time-.1,C2.time+.3,tt,easeOut)*(1-sm(C2.champ+.6,C2.champ+1,tt));
  if(tm>.02){const c=proj(st,-2.6,2.9,GZ),rr=70*tm,left=1-sm(C2.time+.2,C2.champ,tt,linear),face=polyPath(blob(c[0],c[1],rr,rr,607,{amp:.02,n:24}),true);s.knockout(face);s.fill(K,ribbon(blob(c[0],c[1],rr,rr,607,{amp:.02,n:24}),9,{seed:608,close:true,wobble:.5}));
   if(left>.01){const w=new Path2D();w.moveTo(c[0],c[1]);w.arc(c[0],c[1],rr*.82,-Math.PI/2,-Math.PI/2+left*TAU);w.closePath();s.fill(R,w);}}
  // "Argentina are champions": sky-blue, white and yellow confetti falls in front of the stands
  if(tt>=C2.champ){const u=sm(C2.champ,C2.champ+2.5,tt,linear),top=proj(st,0,6,WALLZ)[1];confetti(s,[B,Y,'paper'],[-900,top-60+u*700,1800,420],26,Math.floor(tt*6),{size:16});}
 },
 aperture(t0){const{tt}=clock(1,t0),st=st2(tt);return aperture(chestPts(st,repE(tt),.13));},
 still:R_HIT+.5,
};

// ================= chapter 3 — HOW A PIVOT SHOOTS (demonstration): back to goal, feel the lean, turn the other way, hard and low =================
const C3={watch:A(2,'Watch how'),back:A(2,'Back to'),lean:A(2,'defender'),turn:A(2,'Then turn'),shoot:A(2,'shoot'),outside:A(2,'just outside'),end:AUTH[2].seconds};
/** the demo: he posts up 8.2 m out, back to goal; the pass rolls in from us; the defender leans to screen left, he turns right and strikes */
const EP:[number,number]=[-.35,GZ-8.3],DB1:[number,number]=[1.05,GZ-7.7],DT:V3=[-1.2,.24,GZ-.02];
const DEM=plantFor(DB1,DT),TURN=((DEM.yaw-FACE_CAMERA)%TAU+TAU)%TAU;
const PASS0:[number,number]=[2.4,GZ-12.9],RECV:[number,number]=[EP[0]+.05,EP[1]-.5];
const PASS=[.35,C3.back-.05],D_HIT=C3.shoot+.3,D_IN=D_HIT+.5;
const dT=(t:number)=>key(t,[[D_HIT-.55,.12],[D_HIT-.3,.22],[D_HIT,STRIKE_CONTACT],[D_HIT+1.4,.85],[C3.end,1]],linear);
/** post-up: knees bent, seat back into the defender, the right arm reaching back to feel him */
const POST=posed({lHipF:34,rHipF:28,lKnee:52,rKnee:48,lHipA:14,rHipA:14,lean:24,pitch:2,neckP:10,neckY:-12,rShF:-40,rShA:30,rElb:30,lShA:30,lShF:20,lElb:60});
const demoE:Gen=t=>{
 const X=key(t,mono([[0,EP[0]],[C3.turn,EP[0]],[C3.turn+.5,DEM.P[0]-.25,easeIO],[D_HIT,DEM.P[0],easeOut],[D_HIT+1.6,DEM.P[0]+.2]])),Z=key(t,mono([[0,EP[1]],[C3.turn,EP[1]],[C3.turn+.5,DEM.P[1]-.35,easeIO],[D_HIT,DEM.P[1],easeOut],[D_HIT+1.6,DEM.P[1]+.4]]));
 let pose:Pose,yaw=FACE_CAMERA;
 if(t<C3.turn){pose=blendPose(stand(),POST,sm(.1,C3.back,t));pose=blendPose(pose,posed({...{lHipF:30,rHipF:44,lKnee:50,rKnee:40,rAnk:10,lean:30,neckP:30,rShF:-30,rShA:30,rElb:30,lShA:34,lElb:60}}),pulse(t,PASS[1]-.1,.5));}
 else if(t<D_HIT-.55){const u=sm(C3.turn,D_HIT-.55,t,easeIO);pose=blendPose(POST,dribble(.2+u*.8,{foot:'l',speed:.4}),sm(C3.turn,C3.turn+.15,t));yaw=FACE_CAMERA+u*TURN;}
 else{pose=blendPose(dribble(1,{foot:'l',speed:.4}),strikeL(dT(t)),sm(D_HIT-.55,D_HIT-.42,t));yaw=FACE_CAMERA+TURN;}
 return{pose,yaw,X,Z};};
/** the turn goes the long way round, screen right (FACE_CAMERA → FACE_RIGHT → toward the goal) */
function demoBall(t:number){
 if(t<PASS[0])return{X:PASS0[0],Y:BALL_R,Z:PASS0[1],flying:false};
 if(t<PASS[1]){const u=sm(PASS[0],PASS[1],t,easeOut);return{X:lerp(PASS0[0],RECV[0],u),Y:BALL_R,Z:lerp(PASS0[1],RECV[1],u),flying:false};}
 if(t<C3.turn)return{X:RECV[0],Y:BALL_R,Z:RECV[1],flying:false};
 if(t<D_HIT){const u=sm(C3.turn,D_HIT-.35,t,easeOut),a=Math.PI*u;return{X:lerp(RECV[0],DB1[0],u)+Math.sin(a)*.35,Y:BALL_R,Z:lerp(RECV[1],DB1[1],u),flying:false};}
 if(t<D_IN){const u=sm(D_HIT,D_IN,t,linear),p=bez([DB1[0],BALL_R,DB1[1]],[lerp(DB1[0],DT[0],.5),.38,lerp(DB1[1],DT[2],.5)],DT,u);return{X:p[0],Y:p[1],Z:p[2],flying:true};}
 const d=sm(D_IN+.2,D_IN+.7,t,easeIn);return{X:DT[0],Y:lerp(DT[1],BALL_R,d),Z:GZ+.6,flying:false};}
/** the defender: tight behind him, goal side; on "lean" he leans to screen left (his right), so the turn to screen right is open */
const DDp:[number,number]=[-.95,GZ-7.4];
const demoD:Gen=t=>{const lean=sm(C3.lean-.1,C3.lean+.4,t,easeIO),lu=key(t,[[C3.lean-.1,0],[C3.lean+.4,.45],[C3.turn+.3,.6],[D_HIT+.5,1]],linear);
 let pose=blendPose(backpedal(.25+.05*Math.sin(t*2)),lunge(lu,{side:'r'}),lean);
 return{pose,yaw:FACE_CAMERA+.15,X:DDp[0]-.25*lean,Z:DDp[1]};};
/** the keeper steps off his line, then goes down late — the low ball beats his hands, past his feet */
const KD=D_HIT+.2;
const demoK:Gen=t=>{let pose=keeperSet(t*.9);if(t>=KD)pose=blendPose(keeperSet(KD*.9),keeperDive(sm(KD,D_IN+.8,t,linear)*.9,{side:'r',height:0}),sm(KD,KD+.2,t));
 return{pose,yaw:FACE_CAMERA+.2,X:.3-.5*sm(KD,D_IN,t,easeOut),Z:GZ-.9};};
const st3:Stage={F:1500,eye:2.2,cx:.5,cz:GZ-13.6};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  camPath(s,t,[[0,60,260,1.05],[C3.back-.3,20,300,1.35],[C3.lean,-70,300,1.35],[C3.turn,60,280,1.3],[C3.shoot,40,230,1.15],[D_IN,-60,150,1.15],[C3.outside,-20,210,1.05],[C3.end,-20,210,1.02]]);
  const b=demoBall(tt),goal=tt>=D_IN;
  arena(s,st,{t:tt,cheer:goal?.7*(1-sm(C3.end-1,C3.end,tt)):0,flash:pulse(tt,D_IN,1),area:sm(C3.outside,C3.outside+.7,tt,easeOut),
   bulge:.5*sm(D_IN-.2,D_IN,tt)*(1-.6*sm(D_IN+.4,D_IN+1.4,tt))+.1*settle(tt,D_IN,{amp:1,freq:3,decay:3}),bx:DT[0],by:DT[1],
   keeper:stg=>{athlete(s,stg,demoK,tt,DEMO_K,{detail:'mid'});}});
  const E=demoE(tt),D=demoD(tt);
  // "Back to goal": a red dashed ring round him and a short red arrow from his back to the defender (he feels where he is)
  const bk=easeOutBack(sm(C3.back,C3.back+.35,tt))*(1-sm(C3.turn,C3.turn+.3,tt));
  if(bk>.02){floorDashRing(s,st,R,E.X,E.Z,.75,10,701,bk);const a=proj(st,E.X,1.1,E.Z+.2),c=proj(st,D.X,1.1,D.Z-.05);arrow(s,R,[a,L2(a,c,.5),c],9,702,sm(C3.back+.2,C3.back+.6,tt,easeOut));}
  // "defender lean": a red arrow shows his weight going to screen left
  const ln=sm(C3.lean,C3.lean+.4,tt,easeOut)*(1-sm(C3.turn+.4,C3.turn+.7,tt));
  if(ln>.02){const a=proj(st,D.X+.2,0,D.Z+.5),c=proj(st,D.X-1.6,0,D.Z+.5);arrow(s,R,[a,L2(a,c,.5),c],12,703,ln);}
  // "Then turn": a yellow curl on the floor round to the open side, screen right
  const tn=sm(C3.turn,C3.turn+.5,tt,easeOut)*(1-sm(D_IN+.3,D_IN+.8,tt));
  if(tn>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const a=-Math.PI/2+k/12*Math.PI*.8;pts.push(proj(st,EP[0]+.2+Math.cos(a)*.9,0,EP[1]+.3+Math.sin(a)*.9));}arrow(s,Y,pts,10,704,tn);}
  // the flight line (drawn as the ball goes), low along the floor; "hard and low": a red dashed band at knee height across the goal
  {const lo=sm(C3.shoot,C3.shoot+.4,tt,easeOut)*(1-sm(C3.outside+.2,C3.outside+.6,tt));if(lo>.02){const a=proj(st,-1.55,.5,GZ-.05),c=proj(st,-1.55+3.1*lo,.5,GZ-.05);dashed(s,R,[a,L2(a,c,.5),c],18,705,{dash:32});}}
  if(tt>D_HIT){const pts:Pt[]=[];for(let k=0;k<=16;k++){const q=demoBall(lerp(D_HIT,Math.min(tt,D_IN),k/16));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,706,{dash:40});if(goal)arrowHead(s,Y,pts,34,707);}
  // "just outside the area": the shot spot ring, outside the lit 6 m line
  floorDashRing(s,st,Y,DB1[0],DB1[1],.55,10,708,easeOutBack(sm(C3.outside+.2,C3.outside+.55,tt)));
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(-.05,-1);shadow(s,g[0],g[1],r*1.1,r*.3,709,.45);
   if(b.flying)speedLines(s,R,p[0],p[1],dir,{n:5,seed:710+Math.floor(tt*6),len:r*3.2,spread:r*.8,width:5});
   ball(s,p[0],p[1],r,711,{rot:tt*6,smear:b.flying?.4:0,dir});if(tt>=D_HIT&&tt<D_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:712,g:easeOut(sm(D_HIT,D_HIT+.3,tt))});};
  const its:{z:number;draw:()=>void}[]=[{z:D.Z,draw:()=>athlete(s,st,demoD,tt,DEMO_D,{detail:'mid'})},{z:E.Z,draw:()=>athlete(s,st,demoE,tt,EDER,{detail:'high',smear:tt>D_HIT-.3&&tt<D_HIT+.3?.2:0})},
   {z:b.flying?b.Z:Math.min(b.Z,E.Z-.01),draw:drawBall}];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=D_IN&&tt<D_IN+1){const p=proj(st,DT[0],DT[1],GZ+.4);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:713,g:easeOut(sm(D_IN,D_IN+.3,tt))*(1-sm(D_IN+.7,D_IN+1,tt))});}
  // a big yellow tick stamps beside the goal, with a navy misregistered echo
  const tick=easeOutBack(sm(D_IN+.1,D_IN+.45,tt));
  if(tick>.02){const c=proj(st,-2.9,2.9,GZ),S=140*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:714,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:715,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:716,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoE(tt),.13));},
 still:D_HIT+.6,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'eder-lima-futsal-signature',format:'futsal',title:'Eder Lima’s thunder shot',theme:'Turn and shoot hard and low from just outside the area.',
 ageNote:'For players aged 7–12: the 2016 World Cup final goal is real; the last chapter is a demonstration of the lesson.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball is struck hard across the touch point with red speed lines and a yellow skid mark; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.5),bx=x-130+260*easeOut(u);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.22,seed+2,{n:16}),true),.3);
  if(u<1){const sk=ribbon([[x-140,y+r*.9],[bx-r,y+r*.9]],10*(1-u)+3,{seed,taper:.6,wobble:1});s.fill(Y,sk,1);speedLines(s,R,bx,y,0,{n:5,seed:seed+1,len:r*3.4,spread:r*.8,width:5});}
  ball(s,bx,y,r,seed,{rot:age*14,smear:u<1?.45*(1-u):0,dir:0});
 },
};
export default film;
