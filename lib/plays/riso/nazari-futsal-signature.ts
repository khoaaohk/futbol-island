/** Mostafa Nazari — "the brave block": a signature riso film (iconic plays, FUTSAL, goleiro).
 *
 * WHO: Mostafa Nazari (born 11 Dec 1982, Tehran), Iran's futsal goalkeeper 2004–2018 (card bio: "Iranian goleiro who was named the world's
 * best futsal goalkeeper in 2010 and won Asian titles with Iran"). Not to be confused with any football namesake.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the brave block — not one match, and NO written source we could
 * read describes a particular save of his. So this is FALLBACK MODE (BRIEF.md): the real-match chapter shows only confirmed things from the
 * big match of his best year — the 2010 AFC Futsal Championship FINAL, 30 May 2010, Uzbekistan Sports Complex, Tashkent: Uzbekistan 3–8
 * Iran (Iran champions of Asia; Nazari in Iran's squad, shirt number 12) — and the block itself is a clearly labelled demonstration.
 * No save, goal or pass is staged inside the named match.
 * (Moment choice: no other futsal film uses an AFC match. Camera plan chosen to differ from the other goleiro films — Paçó: main stand /
 * courtside / floor-level off the far post / front-on; Plana: behind the shooter / net camera; Amado: goal-line / high end-stand; Guitta:
 * behind the shooter / through the back net; Mammarella: behind the shooter / high side. Here: a high main-stand camera that CRANES DOWN
 * to the celebration, an ORBITING slow-motion camera that swings from the front to a pure side-on profile at the moment of the block, and
 * a HIGH CORNER camera for the practice.)
 *  1  LIVE (broadcast camera, high in the main stand, real time) — CONFIRMED THINGS ONLY: the Tashkent final ends; the hanging scoreboard
 *     reads UZB 3 – 8 IRI; Iran celebrate; the Uzbek players drop their heads; the camera cranes down to Iran's goal where Nazari (#12)
 *     jumps, turns to the crowd with his number to the camera, and his team-mates mob him. Later that year (Futsalplanet's UMBRO Futsal
 *     Awards 2010) he was named the best goalkeeper in the world.
 *  2  HOW HE BLOCKS (DEMONSTRATION, slow motion, an ORBITING camera; a neutral shooter in a training bib, no match claimed): a shot from
 *     close, too close to dive; he steps across INTO THE LINE of the ball (a yellow floor line from the ball to the middle of the goal),
 *     drops onto one knee and makes a wall — arms wide, chest square — and the ball thumps into his chest and drops at his knees. The
 *     camera ends side-on so a child sees his body right behind the ball's path.
 *  3  PRACTISE (lesson from the entry's `lesson`: "Be brave and get your body behind the ball"): a high corner camera; a young keeper and a
 *     friend; a brave fist pump, the ball's line on the floor, she steps onto it, the pass thumps into her body, a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Mostafa Nazari" (raw, wiki-mostafa-nazari.txt): born 11 December 1982, Tehran; goalkeeper; Iran 2004–2018; AFC Futsal
 *    Championship gold 2008, 2010 (Tashkent), 2016, 2018; "Nazari was selected as the best futsal goalkeeper in the world in 2010."
 *    https://en.wikipedia.org/wiki/Mostafa_Nazari
 *  - Wikipedia, "2010 AFC Futsal Championship" (raw, wiki-2010-afc-futsal.txt): Tashkent, 23–30 May 2010; FINAL 30 May 2010, 18:00,
 *    Uzbekistan 3–8 Iran (Irsaliev 2', Elibaev 5' 22'; Asghari 5', Raeisi 12' 24', Taheri 19', Daneshvar 22' 31', Hassanzadeh 25' 27'),
 *    Uzbekistan Sports Complex, attendance 3,500, referee Kazuya Isokawa; Iran's winning squad lists Mostafa Nazari; coach Hossein Shams;
 *    MVP and top scorer Mohammad Taheri. https://en.wikipedia.org/wiki/2010_AFC_Futsal_Championship
 *  - Futsalplanet.com, "UMBRO Futsal Awards 2010 - Best Goalkeeper of the World" (Luca Ranocchiari, 1 Jun 2011; via web.archive.org,
 *    futsalplanet-umbro-2010-gk.txt): "clap your hands for Mostafa Nazari, winner of the Best Goalkeeper of the World category"; the
 *    "human wall" defending Foolad Mahan's goal; "There were doubts on Iran, travelling to Tashkent without their star Vahid Shamsaee …
 *    But they were reckoning without … the outstanding number 12 shirt weared by Nazari."; Tiago (Brazil): "um grande goleiro".
 *  - (The archived AFC match report page came back empty, so line-ups, minutes played and kits are not confirmed.)
 * CONFIRMED: the final, its date, city, arena and 3–8 score, Uzbekistan as hosts, Iran champions; Nazari in Iran's squad for Tashkent and
 *  wearing number 12 there; Futsalplanet's praise of his Tashkent tournament; best goalkeeper in the world 2010 (Futsalplanet UMBRO award).
 * INFERRED (not named in the narration): that Nazari was on the court at the final whistle; which goal was Iran's; every player position;
 *  the celebration (Nazari jumping, turning to the crowd, being mobbed); kits — Iran red shirts / paper shorts / red socks, Uzbekistan
 *  white (paper) shirts / navy shorts, Nazari a navy long-sleeved keeper kit with a paper 12; the wood-look court; the hanging scoreboard;
 *  his short dark hair (playerAppearance.json). No video was reviewed. Chapters 2–3 are a coaching demonstration, not footage of a match;
 *  the half-kneeling "wall" block is a standard futsal goalkeeping technique shown to teach the card's lesson.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on fast moves). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library z → −Z. The
 * stage camera can TURN (yaw) for the orbit and corner shots: floor polygons are clipped against the near plane in camera space, and the
 * hall's boards/stands are a cylinder round the camera so they stay level while it orbits. The ball's target is his solved chest (plus a
 * ball's width in front), so ball and body always meet. Shooters strike with the right foot.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, the ball's line), red (Iran shirts, posts), green (boards, the practice keeper, the tick), navy (key
 * line, Nazari's kit, stands). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card
 * window 1.45:1 → square). Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,keeperSet,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill,type Build} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2010 Asian final',text:'Tashkent, twenty ten: the Asian Futsal Championship final. Iran beat the hosts, Uzbekistan, eight to three! In goal, number twelve: Mostafa Nazari. That year, he was named the best futsal goalkeeper in the world.',tail:2.2,
  cues:['Tashkent','Asian Futsal','Iran beat','Uzbekistan','eight to three','In goal','number twelve','Mostafa','That year','best futsal'],
  heads:{'Asian Futsal':'Asian final 2010','eight to three':'3–8','number twelve':'No. 12','best futsal':'World’s best keeper'}},
 {label:'How he blocks (demo)',text:'How he blocks: the shot comes from close, so there is no time to dive. He steps across into the line of the ball, drops low and makes a wall. Chest behind it. Blocked!',tail:2.2,
  cues:['How he blocks','from close','no time','steps across','line of the ball','drops low','makes a wall','Chest','Blocked'],
  heads:{'How he blocks':'How he blocks (demo)','line of the ball':'Get in line','makes a wall':'Make a wall','Blocked':'Blocked!'}},
 {label:'Practise it',text:'Practise with a friend. Be brave, and get your body behind the ball!',tail:2.6,
  cues:['Practise with','Be brave','get your body','behind the ball'],heads:{'Be brave':'Be brave','behind the ball':'Body behind it'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/nazari-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/nazari-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/nazari-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('nazari: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('nazari: no cue '+w);return c.at;};
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
/** pose keys with increasing times (cues can crowd after re-timing) */
function monoP(Kk:[number,Pose][],gap=.05):[number,Pose][]{const o:[number,Pose][]=[];for(const k of Kk){const t=o.length?Math.max(k[0],o[o.length-1][0]+gap):k[0];o.push([t,k[1]]);}return o;}

// ---------------- camera: centre a 1566×1080 composition box on the canvas (card window or full screen) ----------------
const BOX_W=1566,BOX_H=1080;
function cam(s:Sheet,x:number,y:number,zoom:number,rot=0){
 const base=Math.min(s.W/BOX_W,s.H/BOX_H),S=zoom*base*s.arrival,c=Math.cos(rot),sn=Math.sin(rot),dx=(s.W/2-s.cx)/S,dy=(s.H/2-s.cy)/S;
 s.camera(x-(c*dx+sn*dy),y-(-sn*dx+c*dy),zoom*base/Math.max(.01,s.fit),rot);
}
function camPath(s:Sheet,t:number,K0:Key[],shake:Pt=[0,0]){const v=key(t,padKeys(mono(K0),[0,0,1,0]),easeInOutSine,true);cam(s,(v[0]||0)+shake[0],(v[1]||0)+shake[1],Number.isFinite(v[2])?v[2]:1,Number.isFinite(v[3])?v[3]:0);}

// ---------------- stage: a level perspective camera over the court floor (metres); X right, Y up, Z away; it may turn (yaw) ----------------
/** camera at (cx, eye, cz) looking along (−sin yaw, cos yaw) on the floor; yaw 0 looks along +Z */
type Stage={F:number;eye:number;cx:number;cz:number;yaw?:number};
/** world floor point → camera [right, depth] */
function toCam(st:Stage,X:number,Z:number):[number,number]{const a=st.yaw||0,c=Math.cos(a),sn=Math.sin(a),dx=X-st.cx,dz=Z-st.cz;return[dx*c+dz*sn,-dx*sn+dz*c];}
const proj=(st:Stage,X:number,Yh:number,Z:number):Pt=>{const q=toCam(st,X,Z),k=st.F/Math.max(.25,q[1]);return[q[0]*k,(st.eye-Yh)*k];};
const kAt=(st:Stage,X:number,Z:number)=>st.F/Math.max(.25,toCam(st,X,Z)[1]);
const depth=(st:Stage,X:number,Z:number)=>toCam(st,X,Z)[1];
/** an orbiting stage: the camera circles the floor point P at radius Rr; a = 0 in front (looking +Z), a = 90° from +X looking −X */
const orbit=(P:[number,number],Rr:number,a:number,eye:number,F:number):Stage=>({F,eye,cx:P[0]+Rr*Math.sin(a),cz:P[1]-Rr*Math.cos(a),yaw:a});
const BALL_R=.11;
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
const lin3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const quad3=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};
const D2R=Math.PI/180;

// ---------------- geometry helpers ----------------
/** a floor polygon (X,Z) → screen, clipped against the near plane in camera space (safe when the camera stands on the court) */
function floorPoly(st:Stage,pts:[number,number][],near=.4):Pt[]{
 const c=pts.map(p=>toCam(st,p[0],p[1])),o:[number,number][]=[];
 for(let i=0;i<c.length;i++){const a=c[i],b=c[(i+1)%c.length],ai=a[1]>=near,bi=b[1]>=near;if(ai)o.push(a);if(ai!==bi){const u=(near-a[1])/(b[1]-a[1]);o.push([a[0]+(b[0]-a[0])*u,near]);}}
 return o.map(q=>[q[0]*st.F/q[1],st.eye*st.F/q[1]] as Pt);
}
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean over the court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number}={}){const{dash=width*4.5,cov=1,progress=1}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
const ringXZ=(X:number,Z:number,r:number,n=24):[number,number][]=>{const o:[number,number][]=[];for(let i=0;i<n;i++){const a=i/n*TAU;o.push([X+Math.cos(a)*r,Z+Math.sin(a)*r]);}return o;};
/** a thin floor strip along a polyline (court lines) */
function stripXZ(pts:[number,number][],hw:number):[number,number][]{const L:[number,number][]=[],Rr:[number,number][]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push([pts[i][0]+nx,pts[i][1]+nz]);Rr.push([pts[i][0]-nx,pts[i][1]-nz]);}return[...L,...Rr.reverse()];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorPoly(st,ringXZ(X,Z,r*g,26));if(q.length<3)return;const p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a big tick: green stroke, navy misregistered echo */
function tickMark(s:Sheet,c:Pt,S:number,seed:number){const tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed,taper:.2,wobble:1}),.5);s.fill(G,ribbon(tk,S*.24,{seed:seed+2,taper:.2,wobble:1}));}
function hull2(pts:Pt[]):Pt[]{const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo:Pt[]=[],up:Pt[]=[];
 for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],depth(st,p[0],Z)];},scale(p:V3){return kAt(st,p[0],-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
const SKIN_L:InkFill[]=[[Y,.86],[R,.26]],SKIN_M:InkFill[]=[[Y,.72],[R,.4]],SKIN_D:InkFill[]=[[R,.6],[K,.34]];
/** Mostafa Nazari: Iran #12 (Futsalplanet: "the outstanding number 12 shirt" in Tashkent); height 5 ft 10 = 1.78 m (Wikipedia);
 * navy long-sleeved keeper kit with a paper number (inferred); short dark hair (playerAppearance.json) */
const BUILD_K:Build={height:1.78,bulk:1.04};
const NAZ:AthleteStyle={shirt:K,shorts:K,socks:K,boots:K,skin:SKIN_M,hair:K,line:K,trim:G,gloves:'paper',sleeves:'long',number:12,numberInk:'paper',hairStyle:'short',build:BUILD_K,seed:12};
/** Iran outfield (inferred): red shirts, paper shorts, red socks */
const IRI=(n:number):AthleteStyle=>({shirt:R,shorts:'paper',socks:R,boots:K,skin:n%3===1?SKIN_L:SKIN_M,hair:K,line:K,trim:G,hairStyle:(['short','bald','short','curly'] as const)[n%4],build:{height:1.72+hash(n,3)*.1},seed:20+n});
/** Uzbekistan outfield (inferred): white (paper) shirts, navy shorts, paper socks */
const UZB=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:n%2?SKIN_L:SKIN_M,hair:K,line:K,trim:G,hairStyle:(['short','curly','bald','short'] as const)[n%4],build:{height:1.73+hash(n,5)*.1},seed:40+n});
/** the demonstration shooter: a neutral red training bib over paper (no team is claimed) */
const BUILD_S:Build={height:1.76,bulk:1.02};
const DEMO_S:AthleteStyle={shirt:[R,.85],shorts:K,socks:'paper',boots:K,skin:SKIN_D,hair:K,line:K,trim:'paper',hairStyle:'curly',build:BUILD_S,seed:77};
/** the practice pair: a young keeper (green, gloves, ponytail) and her friend (yellow bib) */
const BUILD_YOU:Build={height:1.42,bulk:.94},BUILD_FR:Build={height:1.45,bulk:.95};
const YOU:AthleteStyle={shirt:G,shorts:K,socks:G,boots:K,skin:SKIN_L,hair:[R,.9],line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'ponytail',build:BUILD_YOU,seed:81};
const FRIEND:AthleteStyle={shirt:[Y,.9],shorts:K,socks:'paper',boots:K,skin:SKIN_D,hair:K,line:K,trim:K,hairStyle:'short',build:BUILD_FR,seed:79};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at a right-foot strike's contact (our coords, a shooter of `build` at the origin turned to yaw) */
function strikeBall(yaw:number,build:Build):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),build,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}

/** THE WALL (library: facing +x, right = +z): the brave block for a shot from close. Down onto the LEFT knee (shin flat behind), the RIGHT
 * foot planted wide in front, chest tall and square to the ball, arms low and wide, hands open, eyes on the ball. */
const WALL=posed({lHipF:4,lHipA:10,lKnee:108,lAnk:40,rHipF:70,rHipA:26,rHipR:14,rKnee:84,rAnk:-6,lean:8,pitch:2,neckP:10,
 lShF:30,rShF:30,lShA:56,rShA:56,lElb:26,rElb:26,lShR:20,rShR:20,lHand:1,rHand:1,squash:.04});
/** the ball thumps in: arms close round it, chin tucked, a little give */
const HUG_BALL=posed({lHipF:6,lHipA:10,lKnee:110,lAnk:40,rHipF:74,rHipA:24,rHipR:14,rKnee:90,rAnk:-6,lean:26,pitch:4,neckP:34,
 lShF:62,rShF:62,lShA:18,rShA:18,lElb:112,rElb:112,lShR:40,rShR:40,lHand:.8,rHand:.8,squash:-.05});
/** side-shuffle steps (feet apart / together), low and balanced */
const SHUF_A=posed({lHipF:48,rHipF:48,lHipA:30,rHipA:30,lKnee:64,rKnee:64,lAnk:-6,rAnk:-6,lean:22,pitch:6,lShF:44,rShF:44,lShA:40,rShA:40,lElb:60,rElb:60,lHand:1,rHand:1,neckP:-10});
const SHUF_B=posed({lHipF:52,rHipF:52,lHipA:10,rHipA:10,lKnee:60,rKnee:60,lAnk:-6,rAnk:-6,lean:20,pitch:6,lShF:44,rShF:44,lShA:36,rShA:36,lElb:62,rElb:62,lHand:1,rHand:1,neckP:-10,air:.03});
const shuffle=(ph:number)=>blendPose(SHUF_A,SHUF_B,.5-.5*Math.cos(ph*TAU));
/** wall(u): 0 set → .45 wall (knee down) → .75 ball in, arms closing → 1 held */
const wall=(u:number):Pose=>keyPoses(clamp(u),[[0,keeperSet(0)],[.45,WALL],[.7,WALL],[1,HUG_BALL]]);
/** a fist pump, up off the knee */
const PUMP=posed({lHipF:14,rHipF:18,lKnee:24,rKnee:26,lean:6,rShF:60,rShA:40,rElb:130,lShF:-10,lShA:20,lElb:40,neckP:-12,rHand:0});
/** the target: his solved chest, a ball's width toward the ball (so they meet at the shirt) */
function chestAt(X:number,Z:number,yaw:number,pose:Pose,build:Build):V3{const sk=solve(pose,build,placeAt(X,Z,yaw)),c=toMine(sk.chest),f=[Math.cos(yaw),Math.sin(yaw)];return[c[0]+f[0]*(BALL_R+.1),c[1]-.08,c[2]+f[1]*(BALL_R+.1)];}
/** a figure's chest ring (the passage enters his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},build:Build,r=.09):Pt[]{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[0],ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}

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
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,X,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15*(1+Yh*.15),r*.3,seed+5,.45/(1+Yh));ball(s,p[0],p[1],r,seed,{rot:o.rot,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena (shared): stands, wood court, boards ----------------
/** stepped navy rows, lit faces, red / green / paper shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,crowd=1){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),greens=new Path2D(),whites=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3);if(hash(i,9)>crowd)continue;const jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.18)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.3)greens.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)whites.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.knockout(whites,.85);s.fill(R,reds);s.fill(G,greens);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the wooden court: a warm yellow floor with long plank strips (a few tinted) */
function woodFloor(s:Sheet,st:Stage,x0:number,z0:number,x1:number,z1:number,alongX:boolean){
 const court=polyPath(floorPoly(st,[[x0,z0],[x1,z0],[x1,z1],[x0,z1]]),true);s.knockout(court);s.fill(Y,court,.62);s.fill(R,court,.1);
 const planks=new Path2D();
 if(alongX){for(let z=Math.ceil(z0/.9)*.9;z<z1;z+=1.8){const q=floorPoly(st,[[x0,z],[x1,z],[x1,z+.9],[x0,z+.9]]);if(q.length>2)planks.addPath(polyPath(q,true));}}
 else{for(let x=Math.ceil(x0/.9)*.9;x<x1;x+=1.8){const q=floorPoly(st,[[x,z0],[x+.9,z0],[x+.9,z1],[x,z1]]);if(q.length>2)planks.addPath(polyPath(q,true));}}
 s.fill(Y,planks,.22);
}
/** navy boards with yellow ad panels and a green cap */
function boards(s:Sheet,wall:number,board:number,x0s:number[],x1s:number[]){const span=9000;s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();x0s.forEach((x0,i)=>ads.rect(x0,wall-board*.78,x1s[i]-x0,board*.52));s.fill(Y,ads,.75);s.fill(G,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));}
const lineP=(st:Stage,path:Path2D,pts:[number,number][])=>{const q=floorPoly(st,stripXZ(pts,.05));if(q.length>2)path.addPath(polyPath(q,true));};

// ---- LIVE court from the main-stand side: camera outside the near touchline; Iran's goal at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
type SideOpt={cheer?:number;flash?:number;keeper?:()=>void;board?:()=>void};
function courtSide(s:Sheet,st:Stage,t:number,o:SideOpt={}){
 const{cheer=0,flash=0}=o,span=9000,wall=proj(st,st.cx,0,BOARDS)[1],kw=kAt(st,st.cx,BOARDS);
 s.fill(G,rectPath(-span,wall,span*2,span),.5);s.fill(K,rectPath(-span,wall,span*2,span),.3);
 woodFloor(s,st,-20,0,20,TOUCH_FAR,true);
 const lines=new Path2D(),arc:[number,number][]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as [number,number][][])lineP(st,lines,seg);
 lineP(st,lines,arc);for(const X of[GOAL_X+6,GOAL_X+10])lines.addPath(polyPath(floorPoly(st,ringXZ(X,10,.12,12)),true));
 const cc:[number,number][]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lineP(st,lines,cc);
 s.knockout(lines,.94);
 const board=.95*kw,x0s:number[]=[],x1s:number[]=[];for(let i=-12;i<14;i++){x0s.push(proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0]);x1s.push(proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0]);}
 boards(s,wall,board,x0s,x1s);
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 o.board?.();
 sideGoal(s,st);o.keeper?.();sidePosts(s,st);
}
function sideGoal(s:Sheet,st:Stage){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>proj(st,GOAL_X-lerp(Db,Dt,Yh/H),Yh,Z);
 const hull=[proj(st,GOAL_X,0,POST_N),proj(st,GOAL_X,H,POST_N),proj(st,GOAL_X,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,GOAL_X,Yh,POST_N),b=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,GOAL_X,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,GOAL_X,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,GOAL_X+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>proj(st,GOAL_X,H+dy,Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
/** the hanging arena scoreboard: UZB 3 – 8 IRI (hosts first-named, as the match listing), flags as ink blocks */
const SEG:number[][]=[[1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1],[0,1,1,0,0,1,1],[1,0,1,1,0,1,1],[1,0,1,1,1,1,1],[1,1,1,0,0,0,0],[1,1,1,1,1,1,1],[1,1,1,1,0,1,1]];
function digit(p:Path2D,x:number,y:number,w:number,h:number,n:number){const t=w*.2,on=SEG[n]||SEG[0],hh=h/2;
 const bars:[number,number,number,number][]=[[x+t,y,w-2*t,t],[x+w-t,y+t*.5,t,hh-t*.5],[x+w-t,y+hh,t,hh-t*.5],[x+t,y+h-t,w-2*t,t],[x,y+hh,t,hh-t*.5],[x,y+t*.5,t,hh-t*.5],[x+t,y+hh-t/2,w-2*t,t]];
 bars.forEach((b,i)=>{if(on[i])p.rect(b[0],b[1],b[2],b[3]);});}
function scoreboard(s:Sheet,st:Stage,X:number,flash:number){
 const c=proj(st,X,4.4,BOARDS-1),k=kAt(st,X,BOARDS-1),w=4.4*k,h=1.7*k,x=c[0]-w/2,y=c[1]-h/2;
 const cab=new Path2D();cab.moveTo(x+w*.2,y);cab.lineTo(x+w*.2,y-4*k);cab.moveTo(x+w*.8,y);cab.lineTo(x+w*.8,y-4*k);s.stroke(K,cab,Math.max(2,k*.04),.8);
 const box=rectPath(x,y,w,h);s.knockout(box);s.fill(K,box,.92);
 // Uzbekistan (navy-blue / paper / green bands) and Iran (green / paper / red bands)
 const fl=(x0:number,top:string,bot:string)=>{const fw=w*.16,fh=h*.33,fy=y+h*.2;s.knockout(rectPath(x0,fy,fw,fh));s.fill(top,rectPath(x0,fy,fw,fh/3));s.fill(bot,rectPath(x0,fy+fh*2/3,fw,fh/3));};
 fl(x+w*.04,K,G);fl(x+w*.8,G,R);
 const dg=new Path2D(),dw=w*.12,dh=h*.62,dy=y+h*.19;digit(dg,x+w*.3,dy,dw,dh,3);dg.rect(x+w*.47,dy+dh*.45,w*.06,dh*.1);digit(dg,x+w*.58,dy,dw,dh,8);
 s.knockout(dg);s.fill(Y,dg,.75+.25*Math.min(1,flash));
 if(flash>.05)s.fill(Y,ribbon([[x-8,y-8],[x+w+8,y-8],[x+w+8,y+h+8],[x-8,y+h+8],[x-8,y-8]],10*flash,{seed:91,taper:0,wobble:1}),Math.min(1,flash));
}

// ---- the training HALL for the demonstration and practice (the camera may orbit): goal centre (0, GZ); boards are a cylinder round the camera ----
const GZ=11,HALL_R=16;
type HallOpt={cheer?:number;flash?:number;t?:number;crowd?:number;floor?:()=>void;mouth?:()=>void};
function hall(s:Sheet,st:Stage,o:HallOpt={}){
 const{cheer=0,flash=0,t=0,crowd=.35}=o,span=9000,kw=st.F/HALL_R,wall=st.eye*kw,board=.95*kw,scroll=(st.yaw||0)*HALL_R;
 s.fill(G,rectPath(-span,wall,span*2,span),.5);s.fill(K,rectPath(-span,wall,span*2,span),.3);
 woodFloor(s,st,-10,GZ-22,10,GZ+2.2,false);
 const lines=new Path2D(),arcPts:[number,number][]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
 lineP(st,lines,[[-10,GZ],[10,GZ]]);lineP(st,lines,arcPts);lineP(st,lines,[[-10,GZ-22],[-10,GZ]]);lineP(st,lines,[[10,GZ-22],[10,GZ]]);
 for(const Z of[GZ-6,GZ-10]){const q=floorPoly(st,ringXZ(0,Z,.12,12));if(q.length>2)lines.addPath(polyPath(q,true));}
 s.knockout(lines,.94);
 o.floor?.();
 const x0s:number[]=[],x1s:number[]=[],pitch=2.4*kw,off=((scroll*kw)%pitch+pitch)%pitch;for(let i=-14;i<14;i++){x0s.push(i*pitch-off+.3*kw);x1s.push(i*pitch-off+1.9*kw);}
 boards(s,wall,board,x0s,x1s);
 stands(s,wall-board,kw,t,cheer,flash,scroll,crowd);
 goalNet(s,st);o.mouth?.();
}
/** the goal at the far end: net hull (convex hull of the frame and back, any camera angle) and mesh */
function goalNet(s:Sheet,st:Stage){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H));
 const pts=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const np=polyPath(hull2(pts),true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const X of[Lx,Rx])for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,X,Yh,GZ),b=back(X,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,0,GZ)*.018),.6);
}
function goalPosts(s:Sheet,st:Stage){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,0,GZ)*.012);
 const P=(X:number,Yh:number,dx:number,dz:number)=>proj(st,X+dx,Yh,GZ+dz);
 const box=(q:Pt[])=>{const h=hull2(q);frame.addPath(polyPath(h,true));edge.addPath(ribbon([...h,h[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const seg=(X0:number,Y0:number,X1:number,Y1:number)=>[P(X0,Y0,-w,-w),P(X0,Y0,w,-w),P(X0,Y0,w,w),P(X0,Y0,-w,w),P(X1,Y1,-w,-w),P(X1,Y1,w,-w),P(X1,Y1,w,w),P(X1,Y1,-w,w)];
 for(const X of[Lx,Rx]){box(seg(X,0,X,H+w));for(let k=0;k<8;k+=2)bands.addPath(polyPath(hull2(seg(X,k/8*H,X,(k+1)/8*H)),true));}
 box(seg(Lx,H,Rx,H));for(let k=0;k<12;k+=2)bands.addPath(polyPath(hull2(seg(lerp(Lx,Rx,k/12),H,lerp(Lx,Rx,(k+1)/12),H)),true));
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ================= chapter 1 — LIVE: Tashkent 2010, the final whistle (CONFIRMED THINGS ONLY), the camera cranes down to Nazari =================
const C1={tash:A(0,'Tashkent'),afc:A(0,'Asian'),beat:A(0,'Iran beat'),uzb:A(0,'Uzbekistan'),score:A(0,'eight'),goal:A(0,'In goal'),twelve:A(0,'number'),mos:A(0,'Mostafa'),year:A(0,'That year'),best:A(0,'best'),end:AUTH[0].seconds};
const WHISTLE=C1.beat;
/** the high main-stand broadcast camera (6 m up, outside the near touchline) — the crane lowers it toward the celebration */
const liveStage=(x:number,eye:number):Stage=>({F:4500,eye,cx:x,cz:-13});
/** Nazari: set near his goal; at the whistle he leaps, runs out, turns his back (the 12) to the crowd, arms up; team-mates mob him */
const NZ0:[number,number]=[-18.4,10.2],NZ1:[number,number]=[-16.4,8.8];
const NZ_RUN0=WHISTLE+.35,NZ_RUN1=C1.goal+.1;
const naz1:Gen=T=>{
 const u=sm(NZ_RUN0,NZ_RUN1,T,easeIO),X=lerp(NZ0[0],NZ1[0],u),Z=lerp(NZ0[1],NZ1[1],u);
 let pose=keeperSet(T*1.1),yaw=yawTo(-8-X,8-Z);
 if(T>=WHISTLE){const j=sm(WHISTLE,WHISTLE+.2,T);pose=blendPose(pose,celebrate((T-WHISTLE)*1.25,{kind:'arms'}),j);}
 if(u>0&&u<1){pose=blendPose(pose,celebrate((T-NZ_RUN0)*1.6,{kind:'run'}),Math.min(1,u*4,(1-u)*4));yaw=yawTo(NZ1[0]-NZ0[0],NZ1[1]-NZ0[1]);}
 if(T>=NZ_RUN1-.15){const a=sm(NZ_RUN1-.15,C1.twelve+.1,T,easeIO);yaw=lerp(yaw,FACE_AWAY+.25,a);pose=blendPose(pose,celebrate((T-NZ_RUN1)*1.1,{kind:'arms'}),a);}
 const hug=sm(C1.mos+.25,C1.mos+.6,T);if(hug>0){pose=blendPose(pose,posed({lHipF:14,rHipF:16,lKnee:20,rKnee:22,lean:8,neckP:-14,lShF:40,rShF:40,lShA:84,rShA:84,lElb:36,rElb:36,lHand:1,rHand:1,air:.04*(.5+.5*Math.sin((T-C1.mos)*TAU*1.6))}),hug);yaw=lerp(yaw,FACE_CAMERA+.4,hug);}
 return{pose,yaw,X,Z};};
/** Iran's four (red): spread out as the clock runs down; arms up at the whistle, then they sprint to their keeper */
const I0:[number,number][]=[[-5.6,9.2],[-9.4,14.2],[-11.6,5.2],[-3.4,4.6]];
const MOB:[number,number][]=[[-15.6,8.2],[-16.9,9.9],[-15.5,9.7],[-17.4,8.1]];
const iri=(i:number):Gen=>T=>{
 const[x0,z0]=I0[i],[x1,z1]=MOB[i],go0=C1.goal-.3+i*.12,go1=C1.mos+.2+i*.08,u=sm(go0,go1,T,easeIO);
 let pose=blendPose(stand(),runCycle(T*runCadence(.25)+i*.3,{speed:.25}),.55),yaw=i===0?FACE_LEFT+.6:yawTo(-8-x0,9-z0);
 if(i===0&&T<WHISTLE)pose=dribble(T*.9,{foot:'r',speed:.25});
 if(T>=WHISTLE){const j=sm(WHISTLE,WHISTLE+.2,T);pose=blendPose(pose,celebrate((T-WHISTLE)*1.2+i*.27,{kind:'arms'}),j);yaw=lerp(yaw,FACE_CAMERA+(i-1.5)*.4,j);}
 if(u>0&&u<1){pose=runCycle(T*runCadence(.95)+i*.25,{speed:.95});yaw=yawTo(x1-x0,z1-z0);}
 if(u>=1){pose=posed({lHipF:14,rHipF:16,lKnee:20,rKnee:22,lean:22,neckP:6,lShF:100,rShF:100,lShA:24,rShA:24,lElb:70,rElb:70,air:.04*(.5+.5*Math.sin((T-go1)*TAU*1.6+i))});yaw=yawTo(NZ1[0]-x1,NZ1[1]-z1);}
 return{pose,yaw,X:lerp(x0,x1,u)+(i===0&&T<WHISTLE?T*.25:0),Z:lerp(z0,z1,u)};};
/** Uzbekistan's four (paper): jog in to press; heads drop at the whistle */
const U0:[number,number][]=[[-3.2,11.2],[-8.2,7.2],[-7.4,12.6],[-1.2,6.4]];
const HEAD_DOWN=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20});
const HANDS_KNEES=posed({lHipF:50,rHipF:50,lKnee:30,rKnee:30,lean:40,neckP:10,lShF:70,rShF:70,lShA:10,rShA:10,lElb:10,rElb:10});
const HANDS_HEAD=posed({lHipF:8,rHipF:8,lKnee:12,rKnee:12,lean:-6,neckP:-14,lShF:150,rShF:150,lShA:40,rShA:40,lElb:140,rElb:140});
const uzb=(i:number):Gen=>T=>{const[x0,z0]=U0[i],b=ballAt(T);let pose=blendPose(backpedal(T*1.3+i*.3),stand(),.3);
 const d=sm(C1.uzb-.1,C1.uzb+.6,T);if(T>=WHISTLE)pose=blendPose(stand(),[HEAD_DOWN,HANDS_KNEES,HANDS_HEAD,HEAD_DOWN][i],Math.max(sm(WHISTLE,WHISTLE+.5,T)*.4,d));
 return{pose,yaw:T<WHISTLE?yawTo(b[0]-x0,b[1]-z0):FACE_LEFT+[.5,-.3,.9,-.7][i],X:x0-(T<WHISTLE?T*.15:WHISTLE*.15),Z:z0};};
/** the ball: at Iran's player's feet while the clock runs down, then left rolling to a stop */
function ballAt(T:number):[number,number]{const p=iri(0)(Math.min(T,WHISTLE)),ph=((Math.min(T,WHISTLE)*.9)%1+1)%1;const bx=p.X-.42+.08*Math.sin(ph*TAU),bz=p.Z-.1;
 if(T<WHISTLE)return[bx,bz];const u=sm(WHISTLE,WHISTLE+1.6,T,easeOut);return[bx-.9*u,bz-.3*u];}
const liveCam=(T:number)=>({x:key(T,mono([[0,-12.8],[C1.beat,-12.9],[C1.score,-12.9],[C1.goal,-13.8],[C1.twelve,-15.4],[C1.mos,-15.9],[C1.end,-16.1]]),easeInOutSine),
 eye:key(T,mono([[0,6],[C1.goal,6],[C1.mos,4.4],[C1.end,3.8]]),easeInOutSine),
 zoom:key(T,mono([[0,.5],[C1.score,.52],[C1.goal,.68],[C1.twelve,.95],[C1.mos,1.1],[C1.year,1.18],[C1.end,1.24]]),easeInOutSine),
 y:key(T,mono([[0,950],[C1.score,930],[C1.goal,1020],[C1.twelve,1020],[C1.mos,760],[C1.end,640]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=liveStage(c.x,c.eye);
 cam(s,0,c.y,c.zoom);
 const whistle=pulse(T,WHISTLE,1.2),sc=pulse(T,C1.score,1.3);
 courtSide(s,st,T,{cheer:T<WHISTLE?.15:.4+.6*sm(WHISTLE,WHISTLE+.4,T),flash:whistle+.5*sc+.8*pulse(T,C1.best,1.4),board:()=>{if(T<C1.mos)scoreboard(s,st,-9.6,sc);}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 const add=(g:Gen,style:AthleteStyle,d:'low'|'auto'='low')=>{const a=g(T);items.push({z:depth(st,a.X,a.Z),draw:()=>athlete(s,st,g,T,style,{detail:d})});};
 const close=c.zoom>.8;
 add(naz1,NAZ,close?'auto':'low');
 I0.forEach((_,i)=>add(iri(i),IRI(i),close?'auto':'low'));
 // once the crane has swung to Iran's goal the Uzbek players and the ball are out of shot: skip them (phone heat)
 const b=ballAt(T);if(T<C1.twelve+.3){U0.forEach((_,i)=>add(uzb(i),UZB(i)));items.push({z:depth(st,b[0],b[1])+.02,draw:()=>ballOn(s,st,b[0],BALL_R,b[1],17,{rot:T*4})});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "number twelve": a yellow dashed ring under Nazari; "best futsal": a burst over him and a red ring round the huddle
 const nz=naz1(T),g=easeOutBack(sm(C1.twelve,C1.twelve+.35,T))*(1-sm(C1.mos+.2,C1.mos+.6,T));floorDashRing(s,st,Y,nz.X,nz.Z,.8,10,71,g);
 const bs=sm(C1.best,C1.best+.35,T);if(bs>0){const q=proj(st,nz.X,2.45,nz.Z);sparkBurst(s,Y,q[0],q[1],170,{n:16,seed:73,g:easeOut(bs)*(1-sm(C1.best+1.4,C1.best+2,T))});
  const ring=floorPoly(st,ringXZ(NZ1[0]-.3,NZ1[1]+.3,1.9*easeOutBack(bs),28));if(ring.length>2){const p=ribbon([...ring,ring[0]],12,{seed:74,close:true,wobble:1});s.knockout(p);s.fill(R,p);}}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t),c=liveCam(tc);return aperture(chestPts(liveStage(c.x,c.eye),naz1(tt),BUILD_K,.16));},still:C1.mos+.8};

// ================= chapter 2 — HOW HE BLOCKS (demonstration, slow motion, an orbiting camera: front three-quarter → side-on profile) =================
const C2={how:A(1,'How'),close:A(1,'from close'),time:A(1,'no time'),step:A(1,'steps'),line:A(1,'line'),drop:A(1,'drops'),wall:A(1,'makes'),chest:A(1,'Chest'),blk:A(1,'Blocked'),end:AUTH[1].seconds};
/** the shooter strikes at SH (right foot) from close, slightly left of centre; the keeper starts OFF the ball's line and steps across onto it */
const SH:[number,number]=[-.9,GZ-3.9],K_OFF:[number,number]=[.8,GZ-1.2];
/** his spot: on the line from the ball to the middle of the goal, 1.25 m off the goal line */
const K_ON:[number,number]=[SH[0]*1.25/Math.abs(SH[1]-GZ),GZ-1.25];
const K_YAW2=yawTo(SH[0]-K_ON[0],SH[1]-K_ON[1]);
const D_STEP0=C2.step-.05,D_STEP1=C2.line+.35,D_DROP=C2.drop,D_HIT=C2.wall+.25,D_IN=Math.max(D_HIT+1.1,C2.chest+.05);
const CT2=chestAt(K_ON[0],K_ON[1],K_YAW2,WALL,BUILD_K);
const YAW_S2=yawTo(CT2[0]-SH[0],CT2[2]-SH[1]);
const SB2=strikeBall(YAW_S2,BUILD_S),PL2:[number,number]=[SH[0]-SB2[0],SH[1]-SB2[2]];
/** where the blocked ball drops: just in front of his knees */
const DROP2:V3=[CT2[0]+Math.cos(K_YAW2)*.35,BALL_R,CT2[2]+Math.sin(K_YAW2)*.35];
const demoS:Gen=t=>{
 const S0=D_HIT-.95,stT=key(t,[[S0,.1],[S0+.45,.24],[D_HIT,STRIKE_CONTACT],[D_HIT+1.2,.85],[C2.end,1]],linear);
 const X=key(t,mono([[0,PL2[0]-.2],[S0,PL2[0]-.08,easeOut],[D_HIT,PL2[0],easeOut],[C2.end,PL2[0]+.1]])),Z=key(t,mono([[0,PL2[1]-.9],[S0,PL2[1]-.35,easeOut],[D_HIT,PL2[1],easeOut],[C2.end,PL2[1]+.25]]));
 const pose=t<S0?dribble(t*.75,{foot:'r',speed:.3}):blendPose(dribble(S0*.75,{foot:'r',speed:.3}),strike(stT,{foot:'r'}),sm(S0,S0+.2,t));
 return{pose,yaw:lerp(yawTo(.2,1),YAW_S2,sm(S0-.7,S0,t,easeIO)),X,Z};};
function demoBall(t:number):{X:number;Y:number;Z:number;flying:boolean}{
 const S0=D_HIT-.95;
 if(t<S0){const f=demoS(t),ph=((t*.75)%1+1)%1;return{X:f.X+.1+.06*easeOut(ph),Y:BALL_R,Z:f.Z+.48+.1*easeOut(ph),flying:false};}
 if(t<D_HIT){const f=demoS(S0),u=sm(S0,S0+.4,t,easeOut);return{X:lerp(f.X+.12,SH[0],u),Y:BALL_R,Z:lerp(f.Z+.55,SH[1],u),flying:false};}
 if(t<D_IN){const u=sm(D_HIT,D_IN,t,linear);return{X:lerp(SH[0],CT2[0],u),Y:lerp(BALL_R,CT2[1],u)+.12*Math.sin(u*Math.PI),Z:lerp(SH[1],CT2[2],u),flying:true};}
 const u=sm(D_IN,D_IN+.55,t,easeOut),p=quad3(CT2,[lerp(CT2[0],DROP2[0],.6),CT2[1]*.7,lerp(CT2[2],DROP2[2],.6)],DROP2,u),bnc=u>=1?.08*Math.abs(Math.sin((t-D_IN-.55)*9))*Math.exp(-(t-D_IN-.55)*3):0;
 return{X:p[0],Y:p[1]+bnc,Z:p[2],flying:u<1};
}
/** the keeper: set off the line → side-shuffle onto it → drops onto one knee (the wall) → the ball in, arms close round it */
const demoK:Gen=t=>{
 const u=sm(D_STEP0,D_STEP1,t,easeIO),X=lerp(K_OFF[0],K_ON[0],u),Z=lerp(K_OFF[1],K_ON[1],u);
 let pose=keeperSet(t*.7);
 if(u>0&&u<1)pose=blendPose(pose,shuffle(u*2.5),Math.min(1,u*5,(1-u)*5));
 const w=key(t,[[D_DROP-.1,0],[D_DROP+.45,.45],[D_IN-.05,.7],[D_IN+.35,1]],linear);if(t>D_DROP-.1)pose=blendPose(pose,wall(w),sm(D_DROP-.1,D_DROP+.1,t));
 const yaw=lerp(yawTo(SH[0]-K_OFF[0],SH[1]-K_OFF[1]),K_YAW2,u);
 return{pose,yaw,X,Z};};
/** the orbit: pivot between shooter and keeper; front three-quarter (a = 26°) → side-on (a = 90°) by the time the ball arrives */
const PIV2:[number,number]=[-.25,GZ-2.55];
const orb2=(t:number)=>({a:key(t,mono([[0,30],[C2.time,34],[D_STEP1,46],[C2.wall,68],[D_IN,90],[C2.end,93]]),easeInOutSine)*D2R,r:key(t,mono([[0,5.4],[C2.drop,5.1],[D_IN,4.8],[C2.end,4.7]]),easeInOutSine)});
const st2=(t:number)=>{const o=orb2(t);return orbit(PIV2,o.r,o.a,1.2,1500);};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(t),hit=pulse(t,D_IN,.5);
  camPath(s,t,[[0,-150,130,1.0],[C2.close,-120,130,1.02],[C2.step,20,120,1.06],[C2.drop,40,140,1.1],[C2.wall,40,150,1.08],[C2.chest,60,150,1.14],[C2.blk,60,150,1.16],[C2.end,60,150,1.14]],[7*hit*Math.sin(t*90),5*hit*Math.cos(t*77)]);
  const b=demoBall(tt),k=demoK(tt),sk=solve(k.pose,BUILD_K,placeAt(k.X,k.Z,k.yaw));
  hall(s,st,{t:tt,crowd:.25,cheer:.6*pulse(tt,D_IN,1.6),flash:pulse(tt,D_IN,1.2),
   floor:()=>{
    // "line of the ball": a yellow dashed floor line from the ball to the middle of the goal (he steps ONTO it)
    const ln=sm(C2.line-.1,C2.line+.45,tt,easeOut)*(1-sm(C2.blk+.6,C2.blk+1.1,tt));
    if(ln>.02){const pts=[proj(st,SH[0],0,SH[1]),proj(st,lerp(SH[0],0,.5),0,lerp(SH[1],GZ,.5)),proj(st,0,0,GZ)];dashed(s,K,pts,12,150,{dash:28,progress:ln});if(ln>.9)arrowHead(s,K,pts,32);}
    // "steps across": a green dashed floor arrow from where he was to his spot on the line
    const sa=sm(C2.step,C2.step+.4,tt,easeOut)*(1-sm(C2.drop,C2.drop+.4,tt));
    if(sa>.02){const pts=[proj(st,K_OFF[0],0,K_OFF[1]),proj(st,lerp(K_OFF[0],K_ON[0],.5),0,lerp(K_OFF[1],K_ON[1],.5)-.1),proj(st,K_ON[0]+.1,0,K_ON[1])];dashed(s,G,pts,11,152,{dash:26,progress:sa});if(sa>.9)arrowHead(s,G,pts,30);}
   }});
  // "from close": a red dashed line from the ball to his feet with end bars; "no time": it pulses
  const cl=sm(C2.close,C2.close+.4,tt,easeOut)*(1-sm(C2.step-.1,C2.step+.3,tt)),pz=1+.25*pulse(tt,C2.time,.8);
  if(cl>.02){const bb=demoBall(tt),kk=demoK(tt),pts=[proj(st,bb.X,0,bb.Z),proj(st,kk.X,0,kk.Z-.3)];dashed(s,R,pts,11*pz,160,{dash:26,progress:cl});
   for(const e of[[bb.X,bb.Z],[kk.X,kk.Z-.3]] as [number,number][]){const q=proj(st,e[0],0,e[1]),w=kAt(st,e[0],e[1])*.22*cl*pz;s.fill(R,ribbon([[q[0]-w,q[1]],[q[0]+w,q[1]]],10,{seed:161,taper:0}),1);}}
  type It={z:number;draw:()=>void};const its:It[]=[];
  its.push({z:depth(st,k.X,k.Z),draw:()=>{
   // "makes a wall": a yellow dashed outline round his whole body
   const g=easeOutBack(sm(C2.wall,C2.wall+.35,tt))*(1-sm(C2.chest+.1,C2.chest+.5,tt));
   if(g>.02){const hd=toMine(sk.head),pl=toMine(sk.pelvis),c=proj(st,pl[0],(hd[1]+.2)/2,pl[2]),h=kAt(st,pl[0],pl[2])*(hd[1]+.3)*.62*g,pts=blob(c[0],c[1],h*.95,h,141,{n:28,amp:.03});
    const p=ribbon([...pts,pts[0]],10,{seed:142,close:true,wobble:1,gaps:dashGaps(pts,30)});s.knockout(p);s.fill(G,p);}
   athlete(s,st,demoK,tt,NAZ,{detail:'high',smear:tt>D_STEP0&&tt<D_DROP+.3?.18:0});}});
  its.push({z:depth(st,demoS(tt).X,demoS(tt).Z),draw:()=>athlete(s,st,demoS,tt,DEMO_S,{detail:'high',smear:tt>D_HIT-.4&&tt<D_HIT+.3?.3:0})});
  its.push({z:depth(st,b.X,b.Z)-(b.flying?0:.02),draw:()=>{
   if(b.flying&&tt<D_IN){const tr:Pt[]=[];for(let k2=0;k2<=10;k2++){const q=demoBall(Math.max(D_HIT,tt-.35+k2*.035));tr.push(proj(st,q.X,q.Y,q.Z));}const r=kAt(st,b.X,b.Z)*BALL_R,trp=ribbon(tr,r*1.3,{seed:170,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp);}
   ballOn(s,st,b.X,b.Y,b.Z,171,{rot:tt*5,smear:b.flying&&tt<D_IN?.3:0,dir:0});
   if(tt>=D_IN&&tt<D_IN+.7){const q=proj(st,CT2[0],CT2[1],CT2[2]);sparkBurst(s,Y,q[0],q[1],130,{n:12,seed:172,g:easeOut(sm(D_IN,D_IN+.3,tt))*(1-sm(D_IN+.45,D_IN+.7,tt))});}}});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  goalPosts(s,st);
  // "Blocked": a green tick beside him
  const tk=easeOutBack(sm(C2.blk+.15,C2.blk+.5,tt));
  if(tk>.02){const g=proj(st,K_ON[0],0,K_ON[1]),h=kAt(st,K_ON[0],K_ON[1])*1.5;tickMark(s,[g[0]-h*.1,g[1]-h*1.35],h*.32*tk,209);}
 },
 aperture(t0){const{tt,tc}=clock(1,t0);return aperture(chestPts(st2(tc),demoK(tt),BUILD_K,.15));},
 still:D_IN+.1,
};

// ================= chapter 3 — PRACTISE: a high corner camera; be brave, step onto the ball's line, the pass thumps into her body, a tick =================
const C3={prac:A(2,'Practise'),brave:A(2,'Be brave'),body:A(2,'get your'),behind:A(2,'behind the'),end:AUTH[2].seconds};
const FR:[number,number]=[.9,GZ-4.1],Y_OFF:[number,number]=[-.75,GZ-1.1];
const Y_ON:[number,number]=[FR[0]*(1.1/Math.abs(FR[1]-GZ)),GZ-1.1];
const Y_YAW=yawTo(FR[0]-Y_ON[0],FR[1]-Y_ON[1]);
/** she stands big (a star, knees soft) for her friend's firm pass: the target is her solved tummy */
const BIG=posed({lHipF:22,rHipF:22,lHipA:22,rHipA:22,lKnee:34,rKnee:34,lAnk:-4,rAnk:-4,lean:14,pitch:4,lShF:30,rShF:30,lShA:62,rShA:62,lElb:18,rElb:18,lHand:1,rHand:1,neckP:6});
const CT3=((): V3=>{const c=chestAt(Y_ON[0],Y_ON[1],Y_YAW,BIG,BUILD_YOU);return[c[0],c[1]-.18,c[2]];})();
const YAW_F=yawTo(CT3[0]-FR[0],CT3[2]-FR[1]);
const FB=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD_FR,{yaw:YAW_F}),toe=toMine(sk.rToe);return[FR[0]+toe[0]+.06,FR[1]+toe[2]] as [number,number];})();
const P_STEP0=C3.body,P_STEP1=C3.body+.55,P_HIT=C3.behind-.05,P_IN=P_HIT+.4;
const you:Gen=t=>{
 const u=sm(P_STEP0,P_STEP1,t,easeIO),X=lerp(Y_OFF[0],Y_ON[0],u),Z=lerp(Y_OFF[1],Y_ON[1],u);
 let pose=keeperSet(t*1.2);
 const br=sm(C3.brave-.05,C3.brave+.25,t)*(1-sm(C3.body-.3,C3.body,t));if(br>0)pose=blendPose(pose,PUMP,br);
 if(u>0&&u<1)pose=blendPose(pose,shuffle(u*2),Math.min(1,u*5,(1-u)*5));
 const bg=sm(P_STEP1-.1,P_HIT-.05,t);if(bg>0)pose=blendPose(pose,BIG,bg);
 const hg=sm(P_IN-.05,P_IN+.3,t);if(hg>0)pose=blendPose(pose,posed({lHipF:30,rHipF:30,lHipA:18,rHipA:18,lKnee:40,rKnee:40,lean:34,neckP:30,lShF:70,rShF:70,lShA:16,rShA:16,lElb:110,rElb:110,lShR:40,rShR:40,lHand:.8,rHand:.8}),hg);
 const up=sm(C3.end-1.4,C3.end-.9,t,easeIO);if(up>0)pose=blendPose(pose,PUMP,up);
 return{pose,yaw:lerp(yawTo(FR[0]-Y_OFF[0],FR[1]-Y_OFF[1]),Y_YAW,u),X,Z};};
const friend:Gen=t=>{const stT=key(t,[[P_HIT-.5,.1],[P_HIT,STRIKE_CONTACT],[P_HIT+.6,1]],linear);
 const pose=t<P_HIT-.5?blendPose(stand(),dribble(t*.9,{foot:'r',speed:.1}),.6):strike(stT,{foot:'r'});
 return{pose,yaw:YAW_F,X:FR[0],Z:FR[1]};};
function pBall(t:number):V3{
 if(t<P_HIT)return[FB[0],BALL_R,FB[1]];
 if(t<P_IN){const u=sm(P_HIT,P_IN,t,linear);return[lerp(FB[0],CT3[0],u),lerp(BALL_R,CT3[1],u),lerp(FB[1],CT3[2],u)];}
 const u=sm(P_IN,P_IN+.5,t,easeOut),dr:V3=[CT3[0]+Math.cos(Y_YAW)*.3,BALL_R,CT3[2]+Math.sin(Y_YAW)*.3];return lin3(CT3,dr,u).map((v,i)=>i===1?v+.1*Math.sin(u*Math.PI):v) as V3;
}
/** the high corner camera (off to her left, 3.4 m up, looking across the goal mouth) */
const PIV3:[number,number]=[.2,GZ-2.5];
const st3=(t:number)=>orbit(PIV3,5.6,key(t,mono([[0,-52],[C3.end,-44]]),easeInOutSine)*D2R,3.4,1700);
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3(t);
  camPath(s,t,[[0,0,720,1.08],[C3.brave,-40,700,1.16],[C3.body,0,730,1.12],[C3.behind,10,750,1.16],[C3.end,10,740,1.2]]);
  const bp=pBall(tt),yk=you(tt);
  hall(s,st,{t:tt,crowd:.2,cheer:.6*pulse(tt,P_IN,1.6),flash:pulse(tt,P_IN,1),
   floor:()=>{
    // "get your body": the ball's line on the floor (friend's ball → middle of the goal); she steps onto it
    const ln=sm(C3.body-.1,C3.body+.4,tt,easeOut);
    if(ln>.02){const pts=[proj(st,FB[0],0,FB[1]),proj(st,lerp(FB[0],0,.5),0,lerp(FB[1],GZ,.5)),proj(st,0,0,GZ)];dashed(s,K,pts,12,180,{dash:26,progress:ln});if(ln>.9)arrowHead(s,K,pts,30);}
    // "Be brave": a yellow dashed ring under her
    const br=easeOutBack(sm(C3.brave,C3.brave+.35,tt))*(1-sm(C3.body,C3.body+.4,tt));floorDashRing(s,st,R,yk.X,yk.Z,.6,10,181,br);
   }});
  const its:{z:number;draw:()=>void}[]=[
   {z:depth(st,yk.X,yk.Z),draw:()=>athlete(s,st,you,tt,YOU,{detail:'high',smear:tt>P_STEP0&&tt<P_STEP1?.15:0})},
   {z:depth(st,FR[0],FR[1]),draw:()=>athlete(s,st,friend,tt,FRIEND,{detail:'high',smear:tt>P_HIT-.2&&tt<P_HIT+.2?.2:0})},
   {z:depth(st,bp[0],bp[2])-.02,draw:()=>{ballOn(s,st,bp[0],bp[1],bp[2],190,{rot:tt*6,smear:tt>P_HIT&&tt<P_IN?.3:0,dir:0});
    if(tt>=P_IN&&tt<P_IN+.6){const q=proj(st,CT3[0],CT3[1],CT3[2]);sparkBurst(s,Y,q[0],q[1],100,{n:12,seed:191,g:easeOut(sm(P_IN,P_IN+.3,tt))*(1-sm(P_IN+.4,P_IN+.6,tt))});}}}];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  goalPosts(s,st);
  // "behind the ball": a big green tick stamps beside her
  const tk=easeOutBack(sm(P_IN+.2,P_IN+.55,tt));
  if(tk>.02){const g=proj(st,Y_ON[0],0,Y_ON[1]),h=kAt(st,Y_ON[0],Y_ON[1])*1.5;tickMark(s,[g[0]+h*.8,g[1]-h*1.05],h*.34*tk,409);}
 },
 still:P_IN+.6,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'nazari-futsal-signature',format:'futsal',title:'Mostafa Nazari’s brave block',theme:'Be brave and get your body behind the ball.',
 ageNote:'For players aged 7–12: the 2010 Asian final result and his world award are real; the block is shown as a demonstration. Practise it with a friend and a soft ball.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball flies in and thumps into a navy "wall" shape, which ripples; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const inU=sm(0,.25,age,easeOut),bx=x-140+140*inU,by=y-20*(1-inU);
  const g=sm(.05,.2,age)*(1-sm(.55,.8,age));if(g>.02){const w=polyPath(blob(x+r*1.25,y,r*.55*g+4,r*1.4*g+4,seed+3,{n:18,amp:.06}),true);s.knockout(w);s.fill(K,w,.85*g);}
  const u=clamp((age-.25)/.5);if(age>.25&&u<1){s.fill(Y,ribbon(blob(x+r*.9,y,r*(.6+1.6*u),r*(1+1.6*u),seed,{n:24}),8*(1-u)+2,{seed,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.8,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx-(age>.25?20*easeOut(u):0),by,r,seed,{rot:age*5});
 },
};
export default film;
