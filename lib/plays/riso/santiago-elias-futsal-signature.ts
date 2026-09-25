/** Santiago Elías — "the low reflex save": a signature-move riso film (iconic plays, FUTSAL goleiro).
 *
 * WHO: the card's Santiago Elías (lib/town/playerAppearance.json country "Argentina"; playerBios: "Argentine goleiro who played at the 2008
 *  and 2012 Futsal World Cups and was named the world's best futsal goalkeeper for 2009") is Argentina's goalkeeper and captain at the 2012
 *  FIFA Futsal World Cup (FIFA line-up: "[1] * Santiago ELIAS (GK)(C)"), Futsalplanet's Best Goalkeeper of the World 2009 (then of Napoli
 *  Vesevo / Pinocho & Argentina). Country and bio agree — no mismatch, no namesake.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the low reflex save, "Get down quickly to stop low shots near your
 *  feet" — not one match. FIFA.com's report of the 2012 FIFA Futsal World Cup QUARTER-FINAL, Argentina 2–3 Brazil (a.e.t.), 14 Nov 2012,
 *  Indoor Stadium Huamark, Bangkok, describes ONE Elías moment in words, and it is exactly that reflex: "They had a great one with just four
 *  minutes gone. Fernandinho went clean through but saw his effort superbly saved by Santiago Elias, who reacted instinctively to block
 *  Gabriel's header from the rebound." FIFA's play-by-play logs it as two saves in the same second: "3'40" A player from Brazil sees his
 *  effort hit the target ×2 · 3'41" The goalkeeper of Argentina pulls off a save ×2". So the film recreates that double save.
 *  (Match choice: no other futsal film uses this quarter-final — the other Argentina films use the 2016 final (Eder Lima), the 2021 final
 *  (Pany Varela) and the 2024 semi v France (Gauna); Falcão's and Neto's use the 2012 FINAL, Carlos Ortiz's the Spain–Russia quarter-final.)
 *  1  LIVE (broadcast camera, main stand, real time): 0–0; a Brazil through ball, Fernandinho clean through, Elías off his line and DOWN —
 *     save one; the ball pops up, Gabriel heads the rebound, Elías, still low, blocks it — save two; an Argentina defender clears.
 *  2  REPLAY (slow motion from a CROSSBAR CAMERA — on top of the goal, behind and above Elías, looking out down the court with the red bar
 *     across the bottom of the frame; no other goleiro film uses it): the low drop to the shot, the rebound, the header, the block.
 *  3  HOW HE DOES IT (a demonstration in training kit, no match claimed; a FLOOR-LEVEL PROFILE camera, square to the shot, so you see how low
 *     he goes): knees bent, on his toes, hands low; a low shot at his feet; he snaps down and makes a wall.
 *  4  PRACTISE (lesson from the entry's `lesson`): kid-height, facing him: toes · hands low · get down — three cards; a low ball; a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/ by an earlier film; nothing new fetched):
 *  - FIFA.com match summary "Falcao stars as Brazil rally to eliminate Argentina", Argentina 2:3 a.e.t. (2:2, 2:0) Brazil, Match 45,
 *    Quarter-finals, archived 17 Nov 2012 (fifa-2012-futsal-arg-bra-summary.txt):
 *    https://web.archive.org/web/20121117014016/http://www.fifa.com/futsalworldcup/matches/round=260741/match=300215855/summary.html
 *    — the Fernandinho / Gabriel double save quoted above; "Elias nevertheless continued to frustrate them"; the woodwork from a 13th-minute
 *    Neto free-kick; Rescia and Borruto score within a minute; Brazil level late (Neto, Falcão) and Falcão wins it in extra time.
 *  - FIFA.com match report (fifa-2012-futsal-arg-bra-report.txt), archived 17 Nov 2012:
 *    https://web.archive.org/web/20121117014010/http://www.fifa.com/futsalworldcup/matches/round=260741/match=300215855/report.html
 *    — 14 November 2012, 16:00, Bangkok / Indoor Stadium Huamark, attendance 3,007; Argentina starting five: [1] Santiago ELIAS (GK)(C),
 *    [6] Rescia, [7] Cuzzolino, [8] Garcias, [9] Borruto; Brazil: [2] Tiago (GK), [6] Gabriel, [8] Simi, [10] Fernandinho, [11] Neto; goals
 *    Rescia 16'30", Borruto 17'07", Neto 32'42", Falcão 33'55" & 44'42"; shots 31 v 82; possession 37% v 63%.
 *  - FIFA.com play-by-play (fifa-2012-futsal-arg-bra-playbyplay.txt), archived 17 Nov 2012:
 *    https://web.archive.org/web/20121117002129/http://www.fifa.com/futsalworldcup/matches/round=260741/match=300215855/playbyplay.html
 *    — 3'40" two Brazil efforts on target, 3'41" two saves by Argentina's goalkeeper.
 *  - Futsalplanet.com, "UMBRO Futsal Awards 2010 — Best Goalkeeper of the World" (futsalplanet-umbro-2010-gk.txt): winners list,
 *    "2009 -> Santiago Elias (Napoli Vesevo/Pinocho & Argentina)".
 * CONFIRMED: the match (2012 World Cup quarter-final, Argentina v Brazil, 14 Nov 2012, Bangkok), 0–0 at the time (first goal 16'30"), about
 *  four minutes played (3'40"–3'41"), Fernandinho clean through, his effort saved by Elías, the rebound, Gabriel's header, Elías's instinctive
 *  block — two saves in one second; Elías Argentina's No. 1 and captain; Brazil won 3–2 after extra time (not narrated).
 * INFERRED (never named in the narration): HOW both saves were made (a low drop to his left for the shot, the ball popping up off his glove;
 *  the header blocked with both hands from his knees) — the card calls his signature "the low reflex save", the source says only "superbly
 *  saved" and "reacted instinctively to block"; where Fernandinho ran and shot from (the near half-space, right foot), who passed to him, the
 *  rebound's flight, where Gabriel arrived from, the clearance and every other player's position; which end; kits — Argentina light-blue and
 *  white stripes (a blue screen with paper stripes), navy shorts, white socks; Brazil yellow shirts, blue shorts, white socks; Elías in a red
 *  long-sleeved keeper top, navy long legs (navy shorts + navy socks: the library has no trousers), No. 1 on his back, no captain's armband
 *  (the library has none); the court colour. No video was reviewed.
 *  Chapters 3–4 are a coaching demonstration of the low save (training kit), not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike, the drop and the header). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps
 * library z → −Z. The crossbar camera is the same world turned a quarter turn (W2C: a proper rotation, so feet and hands keep their sides).
 * Every contact is SOLVED from the skeleton: the shot meets Elías's left glove in the drop pose, the rebound meets Gabriel's forehead at the
 * header's contact, and the header meets his right glove in the kneeling block.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens).
 * Inks: yellow (Brazil, lights, flight lines), red (Elías's top, posts, arrows), blue (court, Argentina, training top), navy (key line, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,keeperSet,header,posed,blendPose,keyPoses,mirrorPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';
const ID='santiago-elias-futsal-signature';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2012 World Cup',text:'The 2012 Futsal World Cup quarter-final: Argentina against Brazil, no goals yet. Fernandinho races clean through, but Santiago Elías gets down fast. Two saves in one second!',tail:2.4,
  cues:['The 2012','Argentina against','no goals','Fernandinho races','clean through','Santiago','gets down','Two saves','one second'],heads:{'The 2012':'World Cup 2012','no goals':'0–0','Two saves':'Double save!'}},
 {label:'Replay: the crossbar camera',text:'Watch again from the crossbar. Low and quick, he drops to stop Fernandinho. Gabriel heads the rebound, and he blocks that too!',tail:2.2,
  cues:['Watch again','from the crossbar','Low and quick','drops to stop','Gabriel heads','blocks that'],heads:{'Watch again':'Replay','blocks that':'Two saves!'}},
 {label:'How he does it (demo)',text:'How he does it: knees bent, on his toes, hands low. A shot fizzes at his feet, and he snaps down like a wall.',tail:2.2,
  cues:['How he does it','knees bent','on his toes','hands low','A shot','snaps down','like a wall'],heads:{'How he does it':'How he does it'}},
 {label:'Practise it',text:'Get down quickly to stop low shots near your feet. Hands down, save!',tail:2.8,
  cues:['Get down','stop low','near your feet','Hands down','save'],heads:{'Hands down':'Get down fast!','save':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/santiago-elias-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/santiago-elias-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/santiago-elias-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error(ID+': cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error(ID+': no cue '+w);return c.at;};
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
/** pitch (optional, radians): the camera tilts DOWN by that much (the crossbar camera); 0 = the level broadcast/demo cameras */
type Stage={F:number;eye:number;cx:number;cz:number;pitch?:number};
const depthOf=(st:Stage,Yh:number,Z:number)=>{const a=st.pitch??0;return a?(Z-st.cz)*Math.cos(a)+(st.eye-Yh)*Math.sin(a):Z-st.cz;};
const proj=(st:Stage,X:number,Yh:number,Z:number):Pt=>{const a=st.pitch??0,k=st.F/Math.max(.25,depthOf(st,Yh,Z));return[(X-st.cx)*k,a?((st.eye-Yh)*Math.cos(a)-(Z-st.cz)*Math.sin(a))*k:(st.eye-Yh)*k];};
const kAt=(st:Stage,Z:number,Yh=.9)=>st.F/Math.max(.25,depthOf(st,Yh,Z));
const BALL_R=.11;
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
const quad3=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};
type XZ=[number,number];
const unit=(dx:number,dz:number):XZ=>{const l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];};
/** the crossbar camera's world: the live world turned a quarter turn — goal line at z' = 0, the court runs away from the camera (x' = 10 − Z, z' = X + 20) */
const W2C=(X:number,Z:number):XZ=>[10-Z,X+20];

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean over the court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a floor line (X,Z points) clipped to the part in front of the camera, added to `into` as painted strips */
function lineOn(into:Path2D,st:Stage,pts:Pt[],hw=.05){
 const zmin=st.cz+.5;let cur:Pt[]=[];const flush=()=>{if(cur.length>1)into.addPath(polyPath(floorStrip(st,cur,hw),true));cur=[];};
 for(let i=0;i<pts.length;i++){const p=pts[i],inP=p[1]>=zmin;
  if(i>0){const q=pts[i-1],inQ=q[1]>=zmin;if(inP!==inQ){const u=(zmin-q[1])/(p[1]-q[1]),c:Pt=[lerp(q[0],p[0],u),zmin];if(inQ){cur.push(c);flush();}else cur.push(c);}}
  if(inP)cur.push(p);}
 flush();
}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],depthOf(st,p[1],Z)];},scale(p:V3){return kAt(st,-p[2],p[1]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.84],[R,.28]];
/** Santiago Elías: red long-sleeved keeper top, navy long legs, white gloves, No. 1, short dark hair, stubble (appearance file; kit inferred) */
const KBUILD={height:1.84,bulk:1.03};
const ELIAS:AthleteStyle={shirt:R,shorts:K,socks:K,boots:K,skin:SKIN,hair:K,line:K,trim:'paper',gloves:'paper',sleeves:'long',hairStyle:'short',build:KBUILD,number:1,numberInk:'paper',seed:1};
/** the demonstration keeper (chapters 3–4): the same keeper in a blue training top (no match is claimed) */
const ELIAS_TRAIN:AthleteStyle={...ELIAS,shirt:B,number:undefined,seed:2};
/** Argentina outfield: light-blue and white stripes (a blue screen + paper stripes), navy shorts, white socks (inferred) */
const ARG=(n:number):AthleteStyle=>({shirt:[B,.5],pattern:'stripes',patternInk:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.24]],hair:K,line:K,trim:K,hairStyle:(['short','curly','short','bald'] as const)[n%4],build:{height:1.73+hash(n,4)*.1},seed:40+n});
/** Brazil: yellow shirts, blue shorts, white socks (inferred) */
const BRA=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,skin:n%2?[[Y,.85],[R,.4]]:[[Y,.8],[R,.26]],hair:K,line:K,trim:B,hairStyle:n%2?'short':'bald',build:{height:1.72+hash(n,3)*.1},seed:20+n});
const FBUILD={height:1.74,bulk:1};
const FERN:AthleteStyle={...BRA(1),hairStyle:'short',build:FBUILD,seed:29};
const GBUILD={height:1.76,bulk:1.02};
const GAB:AthleteStyle={...BRA(2),hairStyle:'bald',build:GBUILD,seed:31};
/** the demonstration shooter (chapter 3): a paper training bib over navy */
const DEMO_S:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.78},seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** the crossbar camera sees the same player a quarter turn round */
const rotGen=(g:Gen):Gen=>t=>{const a=g(t),[x,z]=W2C(a.X,a.Z);return{pose:a.pose,yaw:a.yaw+Math.PI/2,X:x,Z:z};};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen0:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number;rot?:boolean}={}){
 const gen=o.rot?rotGen(gen0):gen0,a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact (library coords, place at the origin, turned to yaw) */
function strikeBall(yaw:number,build:{height:number;bulk?:number}=FBUILD):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),build,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}

// ---------------- the keeper's moves: the set, the shuffle, the LOW DROP, the kneeling block ----------------
const SET0=keeperSet(0);
function shuffle(ph:number):Pose{const o=.5+.5*Math.sin(ph*TAU);return{...SET0,lHipA:SET0.lHipA+.24*o,rHipA:SET0.rHipA+.24*(1-o),air:.02*Math.abs(Math.sin(ph*TAU))};}
/** a low set: knees deeper, hands LOW and open beside the shins */
const LOW_SET=posed({lHipF:62,rHipF:62,lHipA:18,rHipA:18,lKnee:80,rKnee:80,lAnk:-10,rAnk:-10,lean:30,pitch:10,lShF:24,rShF:24,lShA:22,rShA:22,lElb:22,rElb:22,lShR:20,rShR:20,lHand:1,rHand:1,neckP:-4});
/** THE LOW REFLEX DROP (to his left): the left leg shoots out along the floor, the right knee drops to the floor, the left glove goes down
 *  to the ball beside the left foot, the body leans over it — a wall of leg, glove and body close to the ground */
const DROP=posed({dz:-.3,lHipA:84,lHipF:10,lHipR:18,lKnee:4,lAnk:12,rHipF:12,rHipA:8,rKnee:128,rAnk:44,lean:30,bend:-22,roll:-14,pitch:6,
 lShF:26,lShA:40,lElb:6,lShR:10,rShF:58,rShA:26,rElb:34,rShR:20,lHand:1,rHand:1,neckP:28,neckY:20});
/** the same drop to his RIGHT (chapters 3–4) */
const DROP_R=mirrorPose(DROP);
/** still low, up onto both knees: the body leans to his right and the right glove goes out and down to the header — blocked from the floor */
const KNEEL_BLOCK=posed({dz:-.3,lHipF:4,rHipF:4,lHipA:10,rHipA:14,lKnee:116,rKnee:116,lAnk:40,rAnk:40,lean:16,bend:16,pitch:2,lShF:40,rShF:34,lShA:30,rShA:50,lElb:24,rElb:8,lShR:-10,rShR:-10,lHand:1,rHand:1,neckP:18,neckY:-24});
/** a clenched-fist "come on" to his team (captain) */
const FIST=posed({lHipF:14,rHipF:14,lKnee:20,rKnee:20,lean:6,rShF:40,rShA:40,rElb:120,lShA:20,lElb:40,neckP:-10});
const HANDS_HEAD=posed({lHipF:8,rHipF:8,lKnee:10,rKnee:10,lean:-6,lShF:120,rShF:120,lShA:50,rShA:50,lElb:140,rElb:140,neckP:-22});
/** a glove point (our coords) for a keeper pose at (X,Z) turned to yaw: 'l', 'r' or the middle of both, pushed a ball-radius forward */
function gloveAt(pose:Pose,X:number,Z:number,yaw:number,which:'l'|'r'|'m'):V3{const sk=solve(pose,KBUILD,placeAt(X,Z,yaw)),l=toMine(sk.lHa),r=toMine(sk.rHa),g=which==='l'?l:which==='r'?r:[(l[0]+r[0])/2,(l[1]+r[1])/2,(l[2]+r[2])/2] as V3,f=[Math.cos(yaw),Math.sin(yaw)];
 return[g[0]+f[0]*.11,Math.max(BALL_R,g[1]),g[2]+f[1]*.11];}

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;smear?:number;dir?:number}={}){
 const{rot=0,smear=0,dir=0}=o;let pts=blob(x,y,r,r,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);s.fill(K,crescent(x,y,r*1.02,[-.42,-.45]),.2);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);
function ballOn(s:Sheet,st:Stage,X:number,Yh:number,Z:number,seed:number,o:{min?:number;rot?:number;smear?:number;dir?:number}={}){
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15*(1+Yh*.15),r*.3,seed+5,.45/(1+Yh));ball(s,p[0],p[1],r,seed,{rot:o.rot,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces; a Bangkok crowd of 3,007 (FIFA): mixed shirts, a few yellow and blue; roof lights; cheer lifts heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3);if(hash(i,7)<.3)continue;const jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.2)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.36)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** boards along a far wall at depth Z (ads, a red rail), then the stands above them */
function farWall(s:Sheet,st:Stage,Z:number,t:number,cheer:number,flash:number){
 const span=9000,wall=proj(st,0,0,Z)[1],kw=kAt(st,Z),board=.95*kw;
 s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-14;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,Z)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,Z)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
}

// ---- the LIVE world (chapters 1–2): the court seen from the main stand; Argentina's goal (Elías's) at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5,GC:XZ=[GOAL_X,10];
function court(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0}=o,span=9000,wall=proj(st,0,0,BOARDS)[1];
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const cz=polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true);s.knockout(cz,.25);s.fill(B,cz,.82);
 s.fill(B,polyPath(floorQuad(st,-20,6,20,13),true),.12);
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lineOn(lines,st,seg);
 lineOn(lines,st,arc);for(const X of[GOAL_X+6,GOAL_X+10])if(10>st.cz+1)lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lineOn(lines,st,cc);
 s.knockout(lines,.94);
 farWall(s,st,BOARDS,t,cheer,flash);
 sideGoal(s,st,GOAL_X,POST_N,POST_F,-1);o.keeper?.();sidePosts(s,st,GOAL_X,POST_N,POST_F);
}
/** a goal seen from the side: mouth on the line X = gx between Z = zn..zf, net going toward dir·X (−1: to the left) */
function sideGoal(s:Sheet,st:Stage,gx:number,zn:number,zf:number,dir:number){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>proj(st,gx+dir*lerp(Db,Dt,Yh/H),Yh,Z);
 const hull=[proj(st,gx,0,zn),proj(st,gx,H,zn),proj(st,gx,H,zf),back(zf,H),back(zf,0),back(zn,0),back(zn,H)];
 const np=polyPath(hull,true);s.knockout(np,.5);s.fill(K,np,.18);
 const mesh=new Path2D();for(let Z=zn;Z<=zf+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(zn,Yh);mesh.moveTo(a[0],a[1]);for(let Z=zn+.3;Z<=zf+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.4)for(const Z of[zn,zf]){const a=proj(st,gx,Yh,Z),b=back(Z,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,(zn+zf)/2)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage,gx:number,zn:number,zf:number,only?:'n'|'f'){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,(zn+zf)/2)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,gx+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 if(only!=='n')post(zf);
 if(only==='f'){s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);return;}
 post(zn);
 if(!only){const Bb=(Z:number,dy:number):Pt=>proj(st,gx,H+dy,Z);quad([Bb(zn,-w),Bb(zf,-w),Bb(zf,w),Bb(zn,w)]);
  for(let k=0;k<12;k+=2){const z0=lerp(zn,zf,k/12),z1=lerp(zn,zf,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ================= chapter 1 — LIVE: 0–0, about four minutes in; Fernandinho clean through; the low save; Gabriel's header; the block =================
const C1={arg:A(0,'Argentina'),none:A(0,'no goals'),fern:A(0,'Fernandinho'),through:A(0,'clean'),santi:A(0,'Santiago'),down:A(0,'gets down'),two:A(0,'Two'),one:A(0,'one second'),end:AUTH[0].seconds};
/** the play (inferred): Brazil pass it across midfield → a through ball into Fernandinho's run → he races clean through down the near
 *  half-space and shoots low for the far post; the ball pops up off Elías's glove, Gabriel arrives from the far side and heads it back down */
const B3:XZ=[1.2,13.2],PASSER:XZ=[-3.4,4.6],RUN0:XZ=[-7.6,6.9],SHOTB:XZ=[-15.3,8.7];
const P0=[.9,1.9],TP=C1.through-.95,TR=C1.through-.05;
const T_S1=C1.down+.05,T_P1=T_S1+.24,T_H=T_P1+.7,T_P2=T_H+.22,T_CLR=T_P2+1.05;
const kpos=(p:XZ,d:number):XZ=>{const u=unit(p[0]-GC[0],p[1]-GC[1]);return[GC[0]+u[0]*d,GC[1]+u[1]*d];};
/** Elías comes off his line (1.3 m) square to the shot */
const KS=kpos(SHOTB,1.35),YK=yawTo(SHOTB[0]-KS[0],SHOTB[1]-KS[1]);
/** save one: the ball meets his LEFT glove in the drop (solved) — low, beside his left foot */
const HAND1=gloveAt(DROP,KS[0],KS[1],YK,'l');
/** save two: the header meets his RIGHT glove in the kneeling block (solved) */
const PALMS2=gloveAt(KNEEL_BLOCK,KS[0],KS[1],YK,'r');
/** Gabriel: the rebound meets his forehead at the header's contact; his place is solved from where the ball must be */
const HB:XZ=[-16.55,11.7],YG=yawTo(PALMS2[0]-HB[0],PALMS2[2]-HB[1]);
const GHEAD=(()=>{const sk=solve(header(.52),GBUILD,{yaw:YG}),h=toMine(sk.head);return[h[0]+Math.cos(YG)*.14,h[1]+.02,h[2]+Math.sin(YG)*.14] as V3;})();
const GP:XZ=[HB[0]-GHEAD[0],HB[1]-GHEAD[2]],HEADPT:V3=[HB[0],GHEAD[1],HB[1]];
/** after the block the ball squirts out to the near side; Borruto-side defender (unnamed) clears it upfield */
const LOOSE:XZ=[-16.2,6.3],YAW_SHOT=yawTo(HAND1[0]-SHOTB[0],HAND1[2]-SHOTB[1]);
const SB=toMine(strikeBall(YAW_SHOT)),PLANT:XZ=[SHOTB[0]-SB[0],SHOTB[1]-SB[2]];
const YAW_CLR=yawTo(1,-.25),SBC=toMine(strikeBall(YAW_CLR,{height:1.78,bulk:1})),PLANT_C:XZ=[LOOSE[0]-SBC[0],LOOSE[1]-SBC[2]];
type BallS={X:number;Y:number;Z:number;flying:boolean;spin:number};
function liveBall(T:number):BallS{
 const roll=(a:XZ,b:XZ,t0:number,t1:number,sp=0):BallS=>{const u=sm(t0,t1,T,easeOut);return{X:lerp(a[0],b[0],u),Y:BALL_R,Z:lerp(a[1],b[1],u),flying:false,spin:sp+u*8};};
 if(T<P0[0])return{X:B3[0]-.4+.06*Math.sin(T*5),Y:BALL_R,Z:B3[1]-.1,flying:false,spin:T*3};
 if(T<P0[1])return roll([B3[0]-.4,B3[1]-.1],[PASSER[0]+.3,PASSER[1]+.35],P0[0],P0[1]);
 if(T<TP){const u=sm(P0[1],TP,T,easeIO);return{X:lerp(PASSER[0]+.3,PASSER[0]-.45,u),Y:BALL_R,Z:lerp(PASSER[1]+.35,PASSER[1]+.25,u),flying:false,spin:8+u*4};}
 if(T<TR)return roll([PASSER[0]-.45,PASSER[1]+.25],RUN0,TP,TR,12);
 if(T<T_S1){const u=sm(TR,T_S1-.02,T,linear),w=.12*Math.sin((T-TR)*9);return{X:lerp(RUN0[0],SHOTB[0],u),Y:BALL_R,Z:lerp(RUN0[1],SHOTB[1],u)+w*(1-u),flying:false,spin:20+u*30};}
 if(T<T_P1){const u=sm(T_S1,T_P1,T,linear);return{X:lerp(SHOTB[0],HAND1[0],u),Y:lerp(BALL_R,HAND1[1],u),Z:lerp(SHOTB[1],HAND1[2],u),flying:true,spin:50+u*20};}
 if(T<T_H){const u=sm(T_P1,T_H,T,linear),m:V3=[(HAND1[0]+HEADPT[0])/2+.2,3.0,(HAND1[2]+HEADPT[2])/2+.1],q=quad3(HAND1,m,HEADPT,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:70+u*10};}
 if(T<T_P2){const u=sm(T_H,T_P2,T,linear);return{X:lerp(HEADPT[0],PALMS2[0],u),Y:lerp(HEADPT[1],PALMS2[1],u),Z:lerp(HEADPT[2],PALMS2[2],u),flying:true,spin:80+u*10};}
 if(T<T_CLR){const u=sm(T_P2,T_CLR,T,easeOut),bo=Math.abs(Math.sin(u*Math.PI*2.2))*.45*(1-u);return{X:lerp(PALMS2[0],LOOSE[0],u),Y:lerp(PALMS2[1],BALL_R,Math.min(1,u*3))+bo,Z:lerp(PALMS2[2],LOOSE[1],u),flying:false,spin:90+u*10};}
 const u=sm(T_CLR,T_CLR+1.4,T,linear),q=quad3([LOOSE[0],BALL_R,LOOSE[1]],[-6,5,3.5],[4,.6,1.5],u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:100+u*20};
}
/** Elías: on his line, off it as Fernandinho breaks through (arrives set), DOWN low for save one, up onto his knees for save two, then up, a fist */
const KA=kpos([-8,10],.7),K_OUT=C1.santi-.3;
function keeperXZ(T:number):XZ{return[key(T,mono([[0,KA[0]],[K_OUT,KA[0]],[T_S1-.12,KS[0],easeIO]])),key(T,mono([[0,KA[1]],[K_OUT,KA[1]],[T_S1-.12,KS[1],easeIO]]))];}
const liveK:Gen=T=>{const[X,Z]=keeperXZ(T),bb=liveBall(Math.min(T,T_S1));let yaw=T<T_S1?yawTo(bb.X-X,bb.Z-Z):YK;let pose:Pose;
 if(T<T_S1-.1){const set=keeperSet(T*1.3);pose=T>K_OUT&&T<T_S1-.14?blendPose(set,shuffle(T*2.8),.8):blendPose(set,LOW_SET,sm(T_S1-.9,T_S1-.2,T));}
 else if(T<T_P2+.5)pose=keyPoses(T,[[T_S1-.1,LOW_SET],[T_P1,DROP],[T_P1+.22,DROP],[T_P2,KNEEL_BLOCK],[T_P2+.5,KNEEL_BLOCK]]);
 else if(T<C1.two+.2)pose=keyPoses(T,[[T_P2+.5,KNEEL_BLOCK],[Math.max(T_P2+.9,C1.two-.2),stand()],[Math.max(T_P2+.95,C1.two+.2),stand()]]);
 else{pose=blendPose(stand(),FIST,sm(C1.two+.2,C1.two+.5,T,easeOutBack));yaw=lerp(YK,FACE_CAMERA+.8,sm(C1.two+.2,C1.two+.8,T,easeIO));}
 return{pose,yaw,X,Z};};
/** Fernandinho (Brazil): the run onto the through ball, races with it, right-foot strike low for the far post; hands to his head */
const S_T0=T_S1-.45;
const liveF:Gen=T=>{
 const RUNS:XZ=[-4.6,10.4],YR=yawTo(SHOTB[0]-RUN0[0],SHOTB[1]-RUN0[1]);
 const X=key(T,mono([[0,RUNS[0]],[C1.fern-.9,RUNS[0]],[TR,RUN0[0]+.5,easeIO],[S_T0,PLANT[0]+.9],[T_S1,PLANT[0],easeOut],[T_S1+.5,PLANT[0]-.35,easeOut],[C1.end,PLANT[0]+.3,easeIO]]));
 const Z=key(T,mono([[0,RUNS[1]],[C1.fern-.9,RUNS[1]],[TR,RUN0[1]+.05,easeIO],[S_T0,PLANT[1]-.2],[T_S1,PLANT[1],easeOut],[T_S1+.5,PLANT[1]+.1,easeOut],[C1.end,PLANT[1]-.2,easeIO]]));
 let pose:Pose,yaw=YR;
 if(T<C1.fern-.9){pose=blendPose(stand(),runCycle(T*runCadence(.3),{speed:.3}),.5);yaw=yawTo(-1,-.3);}
 else if(T<TR){pose=runCycle(T*runCadence(.95),{speed:.95});yaw=yawTo(RUN0[0]-RUNS[0],RUN0[1]-RUNS[1]);}
 else if(T<S_T0)pose=dribble(T*2.3,{foot:'r',speed:.9});
 else if(T<T_S1+.6){pose=strike(key(T,[[S_T0,.12],[T_S1,STRIKE_CONTACT],[T_S1+.6,1]],linear),{foot:'r'});yaw=lerp(YR,YAW_SHOT,sm(S_T0,S_T0+.25,T));}
 else{pose=blendPose(strike(1,{foot:'r'}),HANDS_HEAD,sm(T_S1+.6,T_S1+1.1,T,easeIO));yaw=YAW_SHOT;}
 return{pose,yaw,X,Z};};
/** Gabriel (Brazil): arrives from the far side, jumps and heads the rebound down at goal, lands; hands to his head */
const G_T0=T_H-.55;
const liveG:Gen=T=>{
 const G0:XZ=[-9.8,15.4];
 const X=key(T,mono([[0,G0[0]],[C1.through,G0[0]-.8],[G_T0,GP[0],easeIO],[C1.end,GP[0]+.6,easeIO]])),Z=key(T,mono([[0,G0[1]],[C1.through,G0[1]-.3],[G_T0,GP[1],easeIO],[C1.end,GP[1]+.4,easeIO]]));
 let pose:Pose,yaw=yawTo(GP[0]-G0[0],GP[1]-G0[1]);
 if(T<C1.through)pose=blendPose(stand(),runCycle(T*runCadence(.3),{speed:.3}),.6);
 else if(T<G_T0)pose=runCycle(T*runCadence(.85),{speed:.85});
 else if(T<T_H+.6){pose=header(key(T,[[G_T0,0],[T_H,.52],[T_H+.6,1]],linear));yaw=lerp(yaw,YG,sm(G_T0,G_T0+.2,T));}
 else{pose=blendPose(header(1),HANDS_HEAD,sm(T_H+.6,T_H+1.1,T,easeIO));yaw=YG;}
 return{pose,yaw,X,Z};};
/** the other two Brazil players: B3 (first pass), the passer (the through ball); both drift forward after */
const liveB=(i:number):Gen=>T=>{
 if(i===0){const kick=pulse(T,P0[0]-.08,.3),X=key(T,[[0,B3[0]],[P0[0]+.2,B3[0]],[C1.end,-3.5,easeIO]]),Z=key(T,[[0,B3[1]],[P0[0]+.2,B3[1]],[C1.end,12.4,easeIO]]);
  let pose=T<P0[0]?dribble(T*1.3,{foot:'r',speed:.15}):blendPose(runCycle(T*runCadence(.4),{speed:.4}),stand(),sm(C1.end-1.5,C1.end,T));pose=blendPose(pose,posed({lHipF:-10,rHipF:44,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2));
  return{pose,yaw:T<P0[0]+.3?yawTo(PASSER[0]-B3[0],PASSER[1]-B3[1]):yawTo(-1,-.2),X,Z};}
 const kick=pulse(T,TP-.08,.3),X=key(T,mono([[0,PASSER[0]+.7],[P0[1]-.2,PASSER[0],easeIO],[TP+.2,PASSER[0]-.4,easeIO],[C1.end,-7.2,easeIO]])),Z=key(T,mono([[0,PASSER[1]+.5],[P0[1]-.2,PASSER[1],easeIO],[TP+.2,PASSER[1],easeIO],[C1.end,4.8,easeIO]]));
 let pose=T<P0[1]-.2?blendPose(stand(),runCycle(T*runCadence(.3),{speed:.3}),.6):T<TP+.1?dribble((T-P0[1])*1.4+.2,{foot:'r',speed:.2}):blendPose(runCycle(T*runCadence(.5),{speed:.5}),stand(),sm(C1.end-1.2,C1.end,T));
 pose=blendPose(pose,posed({lHipF:-10,rHipF:40,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2));
 return{pose,yaw:T<TP+.3?yawTo(RUN0[0]-PASSER[0],RUN0[1]-PASSER[1]):FACE_LEFT,X,Z};};
/** Argentina (stripes): one chases Fernandinho from behind (he is clean through), one tracks Gabriel, one covers the near side and CLEARS
 *  the loose ball after the block, one screens the passer; after the clearance they clap their keeper */
const liveA=(i:number):Gen=>T=>{
 const post=sm(C1.two+.1,C1.two+.7,T);
 if(i===0){const f=liveF(Math.min(T,T_S1)),X=f.X+lerp(4.6,3.6,sm(TR,T_S1,T)),Z=f.Z+.7;const run=T>C1.fern-.9&&T<T_S1+.6;let pose=run?runCycle(T*runCadence(.9),{speed:.9}):blendPose(stand(),backpedal(T*1.2),.5);
  if(T>=T_S1+.6)pose=blendPose(runCycle(T*runCadence(.3),{speed:.3}),stand(),sm(T_S1+.6,T_S1+1.4,T));
  return{pose,yaw:run?yawTo(-1,-.12):FACE_LEFT,X:T<T_S1+.6?X:X-.8*sm(T_S1+.6,T_S1+1.4,T),Z};}
 if(i===1){const g=liveG(Math.min(T,G_T0)),X=g.X+2.3,Z=g.Z+1.3,run=T>C1.through&&T<G_T0;let pose=run?runCycle(T*runCadence(.8),{speed:.8}):backpedal(T*1.1+.3);pose=blendPose(pose,stand(),post);return{pose,yaw:run?yawTo(-1,-.4):FACE_LEFT+.3,X,Z};}
 if(i===2){const X=key(T,mono([[0,-10.5],[TR,-12.4,easeIO],[T_P2,-14.2,easeIO],[T_CLR-.45,PLANT_C[0],easeIO],[T_CLR+.5,PLANT_C[0]+.3,easeOut],[C1.end,PLANT_C[0]+1.4,easeIO]])),Z=key(T,mono([[0,5.2],[TR,5.6],[T_P2,5.4,easeIO],[T_CLR-.45,PLANT_C[1],easeIO],[C1.end,PLANT_C[1]+.2]]));
  let pose:Pose=T<T_P2?backpedal(T*1.4):T<T_CLR-.45?runCycle(T*runCadence(.8),{speed:.8}):T<T_CLR+.6?strike(key(T,[[T_CLR-.45,.12],[T_CLR,STRIKE_CONTACT],[T_CLR+.6,1]],linear),{foot:'r'}):blendPose(strike(1,{foot:'r'}),stand(),sm(T_CLR+.6,T_CLR+1.2,T));
  pose=blendPose(pose,stand(),post*.5);return{pose,yaw:T<T_P2?FACE_RIGHT+.2:T<T_CLR-.45?yawTo(LOOSE[0]-X,LOOSE[1]-Z):YAW_CLR,X,Z};}
 const X=key(T,mono([[0,-1.2],[TP,-2.6,easeIO],[C1.end,-8.6,easeIO]])),Z=key(T,mono([[0,6.2],[TP,5.8],[C1.end,5.2,easeIO]]));
 return{pose:T<TP?backpedal(T*1.3):blendPose(runCycle(T*runCadence(.5),{speed:.5}),stand(),sm(C1.end-1.2,C1.end,T)),yaw:T<TP?FACE_RIGHT:FACE_LEFT,X,Z};};
const liveCam=(T:number)=>({x:key(T,mono([[0,-2.2],[P0[1],-3.6],[TP,-6.2],[TR,-9.4],[T_S1,-16.0],[T_P2,-16.6],[T_CLR+.4,-15.8],[C1.end,-16.0]]),easeInOutSine),
 zoom:key(T,mono([[0,.6],[TP,.64],[TR,.7],[T_S1,.88],[T_P2,.96],[C1.two+.4,.9],[C1.end,.84]]),easeInOutSine),
 y:key(T,mono([[0,1050],[T_S1,1030],[C1.end,1040]]),easeInOutSine)});
function drawBall(s:Sheet,st:Stage,b:BallS,prev:BallS,seed:number,min=9){
 const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),q=proj(st,prev.X,prev.Y,prev.Z),r=Math.max(min,kAt(st,b.Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15*(1+b.Y*.15),r*.3,seed+5,.45/(1+b.Y));ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?.45:0,dir:Math.atan2(p[1]-q[1],p[0]-q[0])});return{p,r};
}
/** the two save sparks, pinned where the ball met the gloves (at points p1 = save one, p2 = save two, already projected) */
function saveSparks(s:Sheet,T:number,p1:Pt,p2:Pt,r:number,seed:number){for(const[t0,sd,p]of[[T_P1,0,p1],[T_P2,7,p2]] as [number,number,Pt][])if(T>=t0&&T<t0+.35)sparkBurst(s,Y,p[0],p[1],r*3.2,{n:10,seed:seed+sd,g:easeOut(sm(t0,t0+.25,T))});}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st:Stage={F:4500,eye:6,cx:c.x,cz:-13},hit=Math.max(pulse(Tc,T_P1,.3),pulse(Tc,T_P2,.3));
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),bp=liveBall(T-.05);
 court(s,st,T,{cheer:T>=T_P1?.8*(1-.4*sm(C1.end-1.2,C1.end,T)):.1,flash:.6*Math.max(pulse(T,T_P1,1),pulse(T,T_P2,1.2))});
 // "Santiago Elías": a red ring under him as he comes off his line; "clean through": Fernandinho's run, a yellow dashed arrow
 const kp=liveK(T),ring=easeOutBack(sm(C1.santi,C1.santi+.35,T))*(1-sm(C1.two+.4,C1.two+1,T));
 floorDashRing(s,st,R,kp.X,kp.Z,.75,10,61,ring);
 const run=sm(C1.through-.05,C1.through+.4,T,easeOut)*(1-sm(T_S1-.2,T_S1+.2,T));
 if(run>.02){const pts=[proj(st,RUN0[0],0,RUN0[1]),proj(st,(RUN0[0]+SHOTB[0])/2,0,(RUN0[1]+SHOTB[1])/2-.4),proj(st,SHOTB[0]+.6,0,SHOTB[1])];dashed(s,Y,pts,11,62,{progress:run,dash:36});if(run>.8)arrowHead(s,Y,pts,34);}
 type It={z:number;draw:()=>void};const items:It[]=[];
 for(let i=0;i<4;i++){const g=liveA(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ARG(i),{detail:'low'})});}
 for(let i=0;i<2;i++){const g=liveB(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,BRA(i+3),{detail:'low'})});}
 items.push({z:liveF(T).Z,draw:()=>athlete(s,st,liveF,T,FERN,{detail:'low',smear:T>T_S1-.2&&T<T_S1+.2?.1:0})});
 items.push({z:liveG(T).Z,draw:()=>athlete(s,st,liveG,T,GAB,{detail:'low',smear:T>T_H-.2&&T<T_H+.15?.1:0})});
 items.push({z:kp.Z,draw:()=>athlete(s,st,liveK,T,ELIAS,{detail:'mid',smear:(T>T_S1&&T<T_P1+.15)||(T>T_H&&T<T_P2+.15)?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const r=drawBall(s,st,b,bp,18);saveSparks(s,T,proj(st,HAND1[0],HAND1[1],HAND1[2]),proj(st,PALMS2[0],PALMS2[1],PALMS2[2]),r.r,19);}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** Elías's chest (the passage enters his red top); rot = seen from the crossbar camera */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09,rot=false):Pt[]{const g=rot?rotGen(()=>a)(0):a,sk=solve(g.pose,KBUILD,placeAt(g.X,g.Z,g.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts({F:4500,eye:6,cx:liveCam(tc).x,cz:-13},liveK(tt),.13));},still:T_P2+.05};

// ================= chapter 2 — REPLAY: the CROSSBAR CAMERA, slow motion; the low drop, the rebound, the header, the block =================
const C2={watch:A(1,'Watch'),bar:A(1,'from the'),low:A(1,'Low and'),drops:A(1,'drops'),gab:A(1,'Gabriel'),blocks:A(1,'blocks'),end:AUTH[1].seconds};
/** replay clock → live time: slow motion, slowest through the two saves */
const R0=T_S1-1.25;
const rLive=(t:number)=>key(t,mono([[0,R0],[C2.drops+.3,T_P1,linear],[C2.gab+.35,T_H,linear],[C2.blocks+.1,T_P2,linear],[C2.end,T_P2+(C2.end-C2.blocks-.1)*.45,linear]]),linear);
/** the camera sits on top of the goal, just behind the crossbar, looking straight out down the court */
const st2=(t:number):Stage=>({F:800,eye:2.9,cx:0,cz:-.45,pitch:.49+.03*sm(C2.low,C2.drops+.4,t,easeIO)});
/** the court from the goal: goal line z' = 0 (posts x' = ±1.5), halfway z' = 20, the far end z' = 40, the far wall behind it */
function courtFromGoal(s:Sheet,st:Stage,t:number,cheer:number,flash:number){
 const span=9000,wallZ=41.6,wall=proj(st,0,0,wallZ)[1];
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const cz=polyPath(floorQuad(st,-10,0,10,40),true);s.knockout(cz,.25);s.fill(B,cz,.82);
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([-1.5-6*Math.cos(a),6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([1.5+6*Math.cos(a),6*Math.sin(a)]);}
 for(const seg of[[[-10,0],[10,0]],[[-10,0],[-10,40]],[[10,0],[10,40]],[[-10,20],[10,20]],[[-10,40],[10,40]]] as Pt[][])lineOn(lines,st,seg);
 lineOn(lines,st,arc);lines.addPath(polyPath(floorRing(st,0,6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,20+Math.sin(a)*3]);}lineOn(lines,st,cc);
 s.knockout(lines,.94);
 farWall(s,st,wallZ,t,cheer,flash);
}
/** the crossbar under the lens: seen from just behind and above it — its top face and back face as one banded red-and-paper strip across
 *  the bottom of the frame (the posts fall away out of shot) */
function crossbarFrame(s:Sheet,st:Stage){
 const H=2,w=.05,L=1.6,P=(X:number,Yh:number,Z:number)=>proj(st,X,Yh,Z),seg=(x0:number,x1:number):Pt[]=>[P(x0,H+w,w),P(x1,H+w,w),P(x1,H-w,-w),P(x0,H-w,-w)];
 const q=seg(-L,L),bar=polyPath(q,true),bands=new Path2D();
 for(let k=0;k<16;k+=2)bands.addPath(polyPath(seg(lerp(-L,L,k/16),lerp(-L,L,(k+1)/16)),true));
 const edge=ribbon([...q,q[0]],6,{seed:11,taper:0,wobble:.5}),ridge=ribbon([P(-L,H+w,-w),P(L,H+w,-w)],3,{seed:13,taper:0,wobble:.4});
 s.knockout(bar);s.fill(R,bands);s.fill(K,bar,.1);s.fill(K,ridge,.5);s.fill(K,edge,.95);
}
const cw=(v:V3):V3=>{const[x,z]=W2C(v[0],v[2]);return[x,v[1],z];};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),T=rLive(tt),st=st2(tt),hit=Math.max(pulse(T,T_P1,.2),pulse(T,T_P2,.2));
  camPath(s,t,[[0,-40,40,.98],[C2.bar,-20,50,1.0],[C2.low,0,90,1.05],[C2.drops+.3,20,110,1.1],[C2.gab,-60,40,1.0],[C2.blocks,0,110,1.1],[C2.end,0,90,1.05]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  courtFromGoal(s,st,tt,.15+.7*sm(C2.blocks,C2.blocks+.5,tt),.7*pulse(tt,C2.blocks+.1,1.3));
  const kp=rotGen(liveK)(T);
  // "Low and quick": a yellow screen on the floor, the low zone at his feet the shot is heading for
  const low=sm(C2.low,C2.low+.4,tt,easeOut)*(1-sm(C2.gab,C2.gab+.4,tt));
  if(low>.02){const h=cw(HAND1);floorDashRing(s,st,Y,h[0],h[2],.42,9,70,easeOutBack(low));}
  // the shot's line along the floor (yellow dashes) and the rebound's arc up to Gabriel (red dashes)
  const path=(t0:number,t1:number,n:number)=>{const pts:Pt[]=[];for(let k=0;k<=n;k++){const q=liveBall(lerp(t0,t1,k/n)),c=cw([q.X,q.Y,q.Z]);pts.push(proj(st,c[0],c[1],c[2]));}return pts;};
  const fadeA=1-sm(C2.gab+.3,C2.gab+.8,tt);if(T>T_S1&&fadeA>.02)dashed(s,Y,path(T_S1,Math.min(T,T_P1),10),9,71,{dash:28,cov:fadeA});
  const fadeB=1-sm(C2.end-1,C2.end-.4,tt);if(T>T_P1&&fadeB>.02){const pts=path(T_P1,Math.min(T,T_H),14);dashed(s,R,pts,9,72,{dash:28,cov:fadeB});if(T>=T_H-.02)arrowHead(s,R,pts,26,fadeB);}
  // "drops to stop": a red arrow down beside him (the body goes DOWN, fast)
  const dn=sm(C2.drops-.1,C2.drops+.3,tt,easeOut)*(1-sm(C2.gab,C2.gab+.4,tt));
  if(dn>.02){const g=proj(st,kp.X+.8,0,kp.Z),top:Pt=[g[0],g[1]-kAt(st,kp.Z)*1.2],pts:Pt[]=[top,[g[0]+6,lerp(top[1],g[1]-30,.5)],[g[0],g[1]-30]];dashed(s,R,pts,14,73,{progress:dn,dash:40});if(dn>.85)arrowHead(s,R,pts,44);}
  const b=liveBall(T),bp=liveBall(T-.03),bc=cw([b.X,b.Y,b.Z]),bpc=cw([bp.X,bp.Y,bp.Z]);
  type It={z:number;draw:()=>void};const items:It[]=[];
  items.push({z:rotGen(liveF)(T).Z,draw:()=>athlete(s,st,liveF,T,FERN,{rot:true,detail:'mid',smear:T>T_S1-.15&&T<T_S1+.15?.08:0})});
  items.push({z:rotGen(liveG)(T).Z,draw:()=>athlete(s,st,liveG,T,GAB,{rot:true,detail:'mid',smear:T>T_H-.15&&T<T_H+.12?.08:0})});
  for(const i of[0,1,2]){const g=liveA(i);items.push({z:rotGen(g)(T).Z,draw:()=>athlete(s,st,g,T,ARG(i),{rot:true,detail:'mid'})});}
  items.push({z:kp.Z,draw:()=>athlete(s,st,liveK,T,ELIAS,{rot:true,detail:'high',smear:(T>T_S1&&T<T_P1+.1)||(T>T_H+.05&&T<T_P2+.1)?.06:0})});
  items.push({z:bc[2]-.05,draw:()=>{const r=drawBall(s,st,{...b,X:bc[0],Z:bc[2]},{...bp,X:bpc[0],Z:bpc[2]},97,12),h1=cw(HAND1),h2=cw(PALMS2);saveSparks(s,T,proj(st,h1[0],h1[1],h1[2]),proj(st,h2[0],h2[1],h2[2]),r.r,98);
   if(T>=T_P2&&tt<C2.end-.6){const g=easeOutBack(sm(T_P2,T_P2+.15,T));if(g>.02)s.fill(Y,ribbon(blob(r.p[0],r.p[1],r.r*2.6*g,r.r*2.6*g,99,{n:22}),8,{seed:99,close:true,wobble:1}),.95);}}});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  crossbarFrame(s,st);
 },
 aperture(t0){const{tt}=clock(1,t0),T=rLive(tt),st=st2(tt);return aperture(chestPts(st,liveK(T),.13,true));},
 still:C2.blocks+.25,
};

// ================= chapter 3 — HOW HE DOES IT (demonstration, training kit; a floor-level PROFILE camera square to the shot) =================
const C3={how:A(2,'How'),knees:A(2,'knees'),toes:A(2,'on his'),hands:A(2,'hands'),shot:A(2,'A shot'),snaps:A(2,'snaps'),wall:A(2,'like a'),end:AUTH[2].seconds};
/** demo world: the goal mouth on X = −2.3 (posts Z = 5 and 8), the keeper a metre off it, the shooter 4.6 m out; camera low at the side */
const st3:Stage={F:1700,eye:.7,cx:.35,cz:0};
const GX3=-2.3,KP3:XZ=[-1.15,6.5],SP3:XZ=[2.3,6.5];
/** 'A shot': the shooter pushes the ball out of his feet and comes in; he strikes on 'he', and the ball meets the glove on 'snaps down' */
const T3S=C3.snaps-.3,T3P=C3.snaps-.04,T3IN=C3.shot;
/** the low shot goes at his RIGHT foot (toward the camera) and meets his right glove in the drop */
const HAND3=gloveAt(DROP_R,KP3[0],KP3[1],FACE_RIGHT,'r');
const Y3S=yawTo(HAND3[0]-SP3[0],HAND3[2]-SP3[1]),SB3=toMine(strikeBall(Y3S,{height:1.78,bulk:1})),PL3:XZ=[SP3[0]-SB3[0],SP3[1]-SB3[2]];
const OUT3:V3=[1.6,BALL_R,4.6];
function demoBall(t:number):BallS{
 if(t<T3S){const u=sm(T3IN,T3S-.25,t,easeOut);return{X:SP3[0]+1.5*(1-u),Y:BALL_R,Z:SP3[1],flying:false,spin:u*12};}
 if(t<T3P){const u=sm(T3S,T3P,t,linear);return{X:lerp(SP3[0],HAND3[0],u),Y:lerp(BALL_R,HAND3[1],u),Z:lerp(SP3[1],HAND3[2],u),flying:true,spin:u*30};}
 const u=sm(T3P,T3P+1.1,t,easeOut),bo=Math.abs(Math.sin(u*Math.PI*2))*.3*(1-u);return{X:lerp(HAND3[0],OUT3[0],u),Y:lerp(HAND3[1],BALL_R,Math.min(1,u*3))+bo,Z:lerp(HAND3[2],OUT3[2],u),flying:false,spin:30+u*10};
}
/** stand → knees bent (the set) → bouncing on his toes → hands low → the snap DOWN to his right as the shot comes → hold the wall */
const demoK:Gen=t=>{let pose:Pose=blendPose(stand(),keeperSet(0),sm(C3.knees-.1,C3.knees+.35,t,easeIO));
 if(t>C3.toes-.1)pose=blendPose(pose,keeperSet(t*1.8),sm(C3.toes-.1,C3.toes+.2,t));
 if(t>C3.hands-.1)pose=blendPose(pose,LOW_SET,sm(C3.hands-.1,C3.hands+.35,t,easeIO));
 if(t>T3S-.02)pose=keyPoses(t,[[T3S-.02,LOW_SET],[T3P,DROP_R],[T3P+1.4,DROP_R]]);
 return{pose,yaw:FACE_RIGHT,X:KP3[0],Z:KP3[1]};};
const demoS:Gen=t=>{if(t<T3S-.5){const u=sm(T3IN,T3S-.5,t,easeIO),mv=t>T3IN&&t<T3S-.5;return{pose:mv?dribble(t*1.6,{foot:'r',speed:.35}):blendPose(stand(),dribble(t*.6,{foot:'r',speed:.1}),.4),yaw:FACE_LEFT,X:SP3[0]+1.95-1.5*u,Z:SP3[1]};}
 const stT=key(t,[[T3S-.5,.1],[T3S,STRIKE_CONTACT],[T3S+.6,1]],linear),blend=sm(T3S-.5,T3S-.35,t);
 return{pose:strike(stT,{foot:'r'}),yaw:Y3S,X:lerp(SP3[0]+.45,PL3[0],blend),Z:lerp(SP3[1],PL3[1],blend)};};
function demoFloor(s:Sheet,st:Stage,t:number){
 const span=9000,wallZ=19,wall=proj(st,0,0,wallZ)[1];
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const cz=polyPath(floorQuad(st,-12,1.5,14,wallZ),true);s.knockout(cz,.25);s.fill(B,cz,.82);
 // wooden-floor boards: faint navy seams running away from us
 const seams=new Path2D();for(let X=-10;X<=12;X+=1.2)lineOn(seams,st,[[X,1.6],[X,wallZ]],.012);s.fill(K,seams,.18);
 const lines=new Path2D();lineOn(lines,st,[[GX3,1.6],[GX3,wallZ]]);const arc:Pt[]=[];for(let k=0;k<=16;k++){const a=-Math.PI/2+k/16*Math.PI;arc.push([GX3+6*Math.cos(a),6.5+1.5*Math.sign(Math.sin(a))+6*Math.sin(a)]);}lineOn(lines,st,arc);
 s.knockout(lines,.94);
 // an empty training hall: a plain navy wall, a rail and a row of high windows (no crowd — nothing is claimed)
 const top=wall-kAt(st,wallZ)*.95;s.knockout(rectPath(-span,top-span,span*2,span+(wall-top)));s.fill(K,rectPath(-span,top-span,span*2,span+(wall-top)),.62);
 s.fill(R,rectPath(-span,top-6,span*2,10));const win=new Path2D();for(let i=-6;i<=6;i++){const x=proj(st,i*3.2,0,wallZ)[0];win.rect(x-40,top-300,80,120);}s.fill(Y,win,.55);void t;
}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,hit=pulse(tt,T3P,.35);
  camPath(s,t,[[0,-60,-20,1.04],[C3.knees,-170,10,1.2],[C3.toes,-190,40,1.24],[C3.hands,-180,20,1.2],[C3.shot,-30,-10,1.02],[C3.snaps,-60,10,1.04],[C3.wall,-150,30,1.14],[C3.end,-140,30,1.12]],[5*hit*Math.sin(t*90),4*hit*Math.cos(t*80)]);
  demoFloor(s,st,tt);
  sideGoal(s,st,GX3,5,8,-1);sidePosts(s,st,GX3,5,8,'f');
  const k=demoK(tt),sk=solve(k.pose,KBUILD,placeAt(k.X,k.Z,k.yaw)),J=(v:V3):Pt=>{const m=toMine(v);return proj(st,m[0],m[1],m[2]);};
  // "like a wall": a yellow screen behind him from his outstretched boot to his glove, head and knee — nothing low gets through
  const wall=sm(C3.wall-.1,C3.wall+.35,tt,easeOut);
  if(wall>.02){const pts=[J(sk.rToe),J(sk.rHa),J(sk.lHa),J(sk.head),J(sk.lKn),J(sk.lToe),J(sk.rKn)],x0=Math.min(...pts.map(p=>p[0]))-40,x1=Math.max(...pts.map(p=>p[0]))+40,
   y1=Math.max(...pts.map(p=>p[1]))+14,y0=lerp(y1,Math.min(...pts.map(p=>p[1]))-50,easeOutBack(wall)),panel=rectPath(x0,y0,x1-x0,y1-y0),bricks=new Path2D(),bh=(y1-y0)/3;
   for(let r=1;r<3;r++)bricks.addPath(ribbon([[x0,y1-r*bh],[x1,y1-r*bh]],5,{seed:350+r,taper:0,wobble:.8}));
   for(let r=0;r<3;r++)for(let c=0;c<4;c++){const x=lerp(x0,x1,(c+(r%2?.5:.25))/4),yb=y1-r*bh;bricks.addPath(ribbon([[x,yb],[x,yb-bh]],5,{seed:360+r*4+c,taper:0,wobble:.6}));}
   s.knockout(panel,.5);s.fill(Y,panel,.72);s.fill(K,bricks,.35);s.fill(K,ribbon([[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]],6,{seed:349,taper:0,wobble:1}),.7);}
  // the ball's floor line (yellow dashes)
  if(tt>T3S){const pts:Pt[]=[];for(let q=0;q<=8;q++){const b=demoBall(lerp(T3S,Math.min(tt,T3P),q/8));pts.push(proj(st,b.X,b.Y,b.Z));}dashed(s,Y,pts,8,341,{dash:26,cov:1-sm(C3.end-1,C3.end-.4,tt)});}
  const b=demoBall(tt),bp=demoBall(tt-.04);
  const items:{z:number;draw:()=>void}[]=[
   {z:demoS(tt).Z,draw:()=>athlete(s,st,demoS,tt,DEMO_S,{detail:'mid',smear:tt>T3S-.2&&tt<T3S+.2?.1:0})},
   {z:k.Z,draw:()=>athlete(s,st,demoK,tt,ELIAS_TRAIN,{detail:'high',smear:tt>T3S&&tt<T3P+.12?.08:0})},
   {z:b.Z-.02,draw:()=>{const r=drawBall(s,st,b,bp,337,10);if(tt>=T3P&&tt<T3P+.35)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3,{n:9,seed:338,g:easeOut(sm(T3P,T3P+.25,tt))});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  sidePosts(s,st,GX3,5,8,'n');
  // "knees bent": red arcs at both knees; "on his toes": yellow lift marks under his heels; "hands low": yellow rings at his gloves
  const kn=sm(C3.knees,C3.knees+.3,tt,easeOut)*(1-sm(C3.shot,C3.shot+.3,tt));
  if(kn>.02){const arcs=new Path2D();for(const j of[sk.lKn,sk.rKn]){const p=J(j),rr=34*kn;arcs.addPath(ribbon([[p[0]-rr,p[1]-rr*.2],[p[0],p[1]-rr*1.05],[p[0]+rr,p[1]-rr*.2]],11,{seed:342,taper:.3,wobble:1}));}s.knockout(arcs);s.fill(R,arcs);}
  const to=sm(C3.toes,C3.toes+.3,tt,easeOut)*(1-sm(C3.shot,C3.shot+.3,tt));
  if(to>.02){const lift=new Path2D();for(const j of[sk.lHeel,sk.rHeel]){const p=J(j);lift.addPath(ribbon([[p[0]-4,p[1]+26],[p[0]-4,p[1]+8]],6,{seed:343,taper:.4,wobble:.6}));lift.addPath(ribbon([[p[0]+10,p[1]+26],[p[0]+10,p[1]+10]],6,{seed:344,taper:.4,wobble:.6}));}s.fill(Y,lift,to);}
  const hl=sm(C3.hands,C3.hands+.3,tt,easeOut)*(1-sm(C3.snaps,C3.snaps+.3,tt));
  if(hl>.02)for(const j of[sk.lHa,sk.rHa]){const p=J(j);s.fill(Y,ribbon(blob(p[0],p[1],30*hl,30*hl,345,{n:18}),6,{seed:346,close:true,wobble:1}),.95);}
  // "snaps down": a big red arrow straight down beside him
  const dn=sm(C3.snaps-.15,C3.snaps+.25,tt,easeOut)*(1-sm(C3.wall+.4,C3.wall+.9,tt));
  if(dn>.02){const g=proj(st,KP3[0]-.1,0,KP3[1]+.9),pts:Pt[]=[[g[0]-150,g[1]-430],[g[0]-146,g[1]-270],[g[0]-150,g[1]-90]];dashed(s,R,pts,15,347,{progress:dn,dash:44});if(dn>.85)arrowHead(s,R,pts,46);}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoK(tt),.13));},
 still:C3.wall+.5,
};

// ================= chapter 4 — PRACTISE: kid-height, facing him; toes · hands low · get down; a low ball at his feet; a tick =================
const C4={get:A(3,'Get down'),stop:A(3,'stop low'),near:A(3,'near'),hands:A(3,'Hands'),save:A(3,'save'),end:AUTH[3].seconds};
const GZ=11,WALLZ=13.4;
const st4:Stage={F:1500,eye:1.25,cx:0,cz:4};
const KP4:XZ=[0,GZ-.95],Y4=FACE_CAMERA;
/** a low ball rolled from a friend (off camera) at his right foot; it meets his right glove in the drop */
const HAND4=gloveAt(DROP_R,KP4[0],KP4[1],Y4,'r'),BALL4:XZ=[-.6,GZ-5.2],T4R=C4.near+.1,T4P=Math.max(C4.hands+.12,T4R+.5);
const practiceK:Gen=t=>{let pose=keeperSet(t*1.6);
 if(t>C4.stop-.1)pose=blendPose(pose,LOW_SET,sm(C4.stop-.1,C4.stop+.3,t,easeIO));
 if(t>T4P-.28)pose=keyPoses(t,[[T4P-.28,LOW_SET],[T4P,DROP_R],[T4P+.9,DROP_R],[T4P+1.5,blendPose(DROP_R,KNEEL_BLOCK,.6)]]);
 return{pose,yaw:Y4,X:KP4[0],Z:KP4[1]};};
function practiceBall(t:number):BallS{
 if(t<T4R)return{X:BALL4[0],Y:BALL_R,Z:BALL4[1],flying:false,spin:0};
 if(t<T4P){const u=sm(T4R,T4P,t,linear);return{X:lerp(BALL4[0],HAND4[0],u),Y:lerp(BALL_R,HAND4[1],u),Z:lerp(BALL4[1],HAND4[2],u),flying:false,spin:u*12};}
 const sk=solve(practiceK(t).pose,KBUILD,placeAt(KP4[0],KP4[1],Y4)),h=toMine(sk.rHa);return{X:h[0]+Math.cos(Y4)*.1,Y:Math.max(BALL_R,h[1]),Z:h[2]+Math.sin(Y4)*.1,flying:false,spin:12};
}
const CARD_Y=-335,CARD_W=120,CARDS:[number,number,'toes'|'hands'|'down'][]=[[-400,C4.get+.1,'toes'],[0,C4.stop,'hands'],[400,C4.hands,'down']];
function goalEnd(s:Sheet,st:Stage){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H));
 const out=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,GZ)*.018),.6);
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,GZ);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,GZ)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,hit=pulse(tt,T4P,.35);
  camPath(s,t,[[0,0,40,1.02],[C4.stop,0,70,1.06],[C4.near,0,90,1.1],[C4.hands,0,110,1.14],[C4.save+.3,0,100,1.1],[C4.end,0,80,1.06]],[5*hit*Math.sin(t*90),4*hit*Math.cos(t*80)]);
  const span=6000,wall=proj(st,0,0,WALLZ)[1];
  s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
  const cz=polyPath(floorQuad(st,-10,-30,10,GZ),true);s.knockout(cz,.25);s.fill(B,cz,.82);
  const lines=new Path2D(),arcPts:Pt[]=[];
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
  lineOn(lines,st,[[-10,GZ],[10,GZ]]);lineOn(lines,st,arcPts);s.knockout(lines,.94);
  farWall(s,st,WALLZ,tt,.25*pulse(tt,T4P,1.2),0);
  goalEnd(s,st);
  // "near your feet": a yellow dashed ring round his boots — the low zone
  const kp=practiceK(tt),zone=easeOutBack(sm(C4.near-.1,C4.near+.3,tt))*(1-sm(C4.save+.3,C4.save+.8,tt));
  floorDashRing(s,st,Y,KP4[0],KP4[1],.95,8,401,zone);
  // the low ball's line (red dashes) as it rolls in
  if(tt>T4R){const pts:Pt[]=[];for(let q=0;q<=8;q++){const b=practiceBall(lerp(T4R,Math.min(tt,T4P),q/8));pts.push(proj(st,b.X,b.Y,b.Z));}dashed(s,R,pts,9,402,{dash:26,cov:1-sm(C4.end-1,C4.end-.4,tt)});}
  const b=practiceBall(tt),bp=practiceBall(tt-.04),ballFirst=b.Z>kp.Z-.25;
  if(ballFirst)drawBall(s,st,b,bp,407,10);
  athlete(s,st,practiceK,tt,ELIAS_TRAIN,{detail:'high',smear:tt>T4P-.28&&tt<T4P+.1?.08:0});
  if(!ballFirst)drawBall(s,st,b,bp,407,10);
  if(tt>=T4P&&tt<T4P+.35){const p=proj(st,b.X,b.Y,b.Z);sparkBurst(s,Y,p[0],p[1],80,{n:9,seed:408,g:easeOut(sm(T4P,T4P+.25,tt))});}
  // the three cards: on your toes · hands low · get down
  const cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];const ons=CARDS.map(([,t0c])=>sm(t0c-.1,t0c+.3,tt,easeOut));
  CARDS.forEach(([cx],i)=>{if(ons[i]<=.01)return;const dy=(1-ons[i])*-500;const q=handCut([[cx-CARD_W,CARD_Y-125+dy],[cx+CARD_W,CARD_Y-125+dy],[cx+CARD_W,CARD_Y+125+dy],[cx-CARD_W,CARD_Y+125+dy]],70+i,6,60);outline[i]=q;cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
  if(ons.some(o=>o>.01)){s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,,kind],i)=>{if(ons[i]<=.01)return;const dy=(1-ons[i])*-500,gy=CARD_Y+dy+98;
    const fc=figureCam({x:cx,y:gy,height:kind==='down'?200:180,azimuth:70,elevation:12,fov:18});
    s.save();s.clip(polyPath(outline[i],true));
    const pose=kind==='toes'?keeperSet(.3):kind==='hands'?LOW_SET:DROP_R;
    const P=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    const sk=solve(pose,KBUILD,{});
    if(kind==='toes'){const pp=new Path2D();for(const j of[sk.lToe,sk.rToe]){const c=P([j[0],0,j[2]]);pp.addPath(ribbon([[c[0],c[1]+22],[c[0],c[1]+4]],6,{seed:81,taper:.4}));}s.fill(R,pp);}
    if(kind==='hands'){for(const j of[sk.lHa,sk.rHa]){const c=P(j);s.fill(Y,ribbon(blob(c[0],c[1],18,18,82,{n:14}),5,{seed:83,close:true}),1);}}
    if(kind==='down'){const c=P([0,1.4,.9]),e=P([0,.2,.9]);const pts:Pt[]=[c,[c[0]+3,(c[1]+e[1])/2],e];dashed(s,R,pts,8,85,{dash:20});arrowHead(s,R,pts,22);}
    drawAthlete(s,pose,fc,{...ELIAS_TRAIN,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "save": a big blue tick beside him (navy misregistered echo)
  const tick=easeOutBack(sm(C4.save+.2,C4.save+.55,tt));
  if(tick>.02){const g=proj(st,kp.X,0,kp.Z),h=kAt(st,kp.Z)*1.84,c:Pt=[g[0]+h*.72,g[1]-h*.62],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(B,tp);}
  if(tt>=C4.save+.4){const u=sm(C4.save+.4,C4.save+2.4,tt,linear),top=proj(st,0,3.2,WALLZ)[1];confetti(s,[R,Y,'paper'],[-800,top-200+u*380,1600,380],18,Math.floor(tt*6),{size:14});}
 },
 still:C4.save+.7,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:ID,format:'futsal',title:'Santiago Elías’s low reflex save',theme:'Get down quickly to stop low shots near your feet.',
 ageNote:'For players aged 7–12: the double save against Brazil at the 2012 Futsal World Cup is real (FIFA’s match report); how he gets down is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball skids in low and stops dead against a glove on the floor; a yellow ring rings out. Reduced motion = at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.28),bx=lerp(x+170,x,easeOut(u)),stop=clamp((age-.28)/.5);
  if(age>.28&&stop<1)s.fill(Y,ribbon(blob(x,y,r*(1.2+1.6*stop),r*(1.2+1.6*stop),seed,{n:24}),8*(1-stop)+2,{seed,close:true,wobble:1.2}),1);
  ball(s,bx,y,r,seed,{rot:age*6});
  const g=sm(.18,.3,age);if(g>.02){const gl=polyPath(blob(x-r*1.05,y+r*.25,r*.45*g,r*.62*g,seed+2,{n:16}),true);s.knockout(gl);s.fill(K,ribbon(blob(x-r*1.05,y+r*.25,r*.45*g,r*.62*g,seed+2,{n:16}),5,{seed:seed+5,close:true,wobble:.6}),1);}
 },
};
export default film;
