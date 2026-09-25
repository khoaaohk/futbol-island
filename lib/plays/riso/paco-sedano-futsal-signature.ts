/** Paco Sedano — "the calm penalty stopper": a signature-move riso film (iconic plays, FUTSAL goleiro).
 *
 * WHY THIS MOMENT: Sedano's entry (lib/town/iconicPlays.json) is a signature — the calm penalty stopper, "Stay big on the line and wait for
 * the kicker to show you where it's going" — not one match. UEFA.com's report of the 2013/14 UEFA Futsal Cup semi-final describes a shoot-out
 * he won: Araz Naxçivan 4–4 FC Barcelona (a.e.t.), 24 April 2014, Sarhadchi Olympic Sport Complex, Baku — Barcelona won 4–2 on penalties,
 * "Torras hitting the winner after Araz's Fabiano and Davi, and Barcelona's Sergio Lozano, had efforts saved." So the film recreates Davi's
 * saved penalty (the second Araz kick Barcelona's keeper stopped) and then shows, as a labelled demonstration, how a keeper stays big and waits.
 *  1  LIVE (broadcast camera, main stand, real time): both teams on the centre line, 4–4 → penalties; the camera pans to the goal; Sedano,
 *     1.90 m, makes himself big on his line; Davi runs up and shoots; Sedano waits for the kick, goes, and pushes it wide of the post.
 *  2  REPLAY (slow motion, LOW CORNER CAMERA: knee height at the corner of the penalty area on the near side, looking diagonally across at the
 *     goal — a set-up no other goleiro film uses): big and still, waiting; he only moves at the kick; the save; then Torras's winning kick is
 *     reported as a headline (4–2 on pens) and Barça-coloured confetti falls. Torras's kick itself is NOT staged (other keeper, unknown corner).
 *  3  HOW TO STOP A PENALTY (demonstration in training kit, empty arena; HIGH THREE-QUARTER camera from the far side behind the kicker's
 *     left shoulder): stay big (the yellow screen shows how much goal he covers), stay on the line, wait (feet printed still), read the
 *     kicker's hips and standing foot (floor arrow to the corner), then go — a save to the other side; a tick.
 *  (Camera plan chosen to differ from the other goleiro films: Guitta — behind the shooter + through the back net; Plana — behind the shooter
 *   + net camera; Mammarella — behind the shooter + high broadcast; Luis Amado — goal-line + high end stand + facing him. This film uses a
 *   diagonal low corner camera and a high diagonal far-side camera, both generic yawed stages.)
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - UEFA.com, "Barcelona break Araz hearts in penalty drama", Patrick Hart, Thursday 24 April 2014 (uefa-futsalcup2014-sf-araz-barca.txt):
 *    https://www.uefa.com/uefafutsalchampionsleague/news/0257-0def6de168dc-218ce4d2499d-1000--barcelona-break-araz-hearts-in-penalty-drama/
 *    — "Araz Naxçivan 4-4 FC Barcelona (aet, Barcelona win 4-2 on pens)"; "FC Barcelona held their nerve in a penalty shoot-out";
 *    "Torras hitting the winner after Araz's Fabiano and Davi, and Barcelona's Sergio Lozano, had efforts saved"; "Paco Sedano denied Araz's
 *    Augusto" and "the Barça custodian" (Sedano was Barcelona's goalkeeper in the match); Amadeu's 4–4 deep into extra time; "a valiant home
 *    team", "the local fans", "noise and tension reaching unprecedented levels"; late-evening kick-off at the Sarhadchi Olympic Sport Complex.
 *  - Wikipedia, "2013–14 UEFA Futsal Cup" (raw; wiki-2013-14-uefa-futsal-cup.txt): semi-final 24 April 2014, 18:00, Araz Naxçivan 4–4 FC
 *    Barcelona a.e.t., Sarhadchi Olympic Center, Baku, referee Alessandro Malfer (ITA); pens 2–4: Araz — Fabiano ✗, Amadeu ✓, Rafael ✓,
 *    Davi ✗; Barcelona — Wilde ✓, Lin ✓, Saad ✓, Lozano ✗, Torras ✓. Final 26 April 2014: Dinamo 2–5 Barcelona a.e.t. (Sedano scored the 5th).
 *  - UEFA.com, "Barcelona dig deep to beat Dynamo in final thriller" (uefa-futsalcup2014-final.txt): Sedano in goal in the final two days later.
 *  - Wikipedia EN/ES, "Paco Sedano" (raw; wiki-paco-sedano.txt, eswiki-paco-sedano.txt): goalkeeper, born Madrid 1979, Barcelona 2007–2018,
 *    1.90 m, nickname "La Muralla Mostoleña"; world champion 2004, European champion 2005 and 2016; UEFA Futsal Cup 2012 and 2014; Futsal
 *    Awards best goalkeeper in the world 2017.
 * CONFIRMED: competition, round, date, city, arena, teams, 4–4 after extra time, the shoot-out, 4–2 to Barcelona, Davi's (and Fabiano's)
 *  penalty saved, Torras scoring the winner, Barcelona reaching the final, a home crowd, Sedano as Barcelona's goalkeeper in the match.
 *  Derived from the Wikipedia kick lists + the 2–4 score (only possible order): Barcelona kicked first, so Davi's save came with Barça 3–2 up
 *  and Torras's kick next won it (the narration only says "Then Torras scores").
 * INFERRED (not named in the narration): that Sedano (not a substitute keeper) faced the kicks — the report calls only him "the Barça
 *  custodian" and names no change, so this is near-certain but not quoted; HOW the kick was saved (a low dive to his left, a palm pushing it
 *  wide of the post) and the corner; Davi's right foot and run-up angle; the teams waiting on the centre line; kits — Barcelona blaugrana
 *  stripes, navy shorts; Araz white shirts, navy shorts; Sedano in a yellow long-sleeved top and navy long legs (the library has no
 *  trousers: navy shorts + navy socks); the court colour; which end. No video was reviewed. Chapter 3 is a coaching demonstration in
 *  training kit, not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike and the dive). Our stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z; the stage is a
 * yawed pinhole camera (position, eye height, heading) so the same court can be filmed from the main stand or diagonally. Davi strikes with
 * the right foot (inferred); the ball meets the solved leading palm of the dive at the frame the palm reaches the ball's line.
 * Timing: the SCRIPT's cues are estimated until the lead voices it; `authored()` maps each chapter's recorded clock through the cue anchors
 * back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Sedano's top, lights, "big" screen, arrows), red (Barça stripes, posts, prints), blue (court, Barça, training top), navy.
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; crowd heads batched into one path per ink; objects on twos, cameras on ones; seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,runCycle,runCadence,stand,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2014 semi-final shoot-out',text:'Baku, 2014, a UEFA Futsal Cup semi-final. Araz against Barcelona ends four all, so it goes to penalties. Barcelona’s keeper Paco Sedano stands tall on his line. Davi runs up, shoots, and Sedano saves it!',tail:2.4,
  cues:['Baku','Araz against','four all','penalties','keeper Paco','stands tall','Davi runs','shoots','saves it'],heads:{'Baku':'Baku 2014','four all':'4–4','penalties':'Penalties','saves it':'Saved!'}},
 {label:'Replay: the low corner camera',text:'Watch again. He stays big and still, and waits for the kick. Only then does he move. Then Torras scores, and Barcelona are in the final!',tail:2.4,
  cues:['Watch again','stays big','still','waits for','Only then','he move','Torras scores','Barcelona are','the final'],heads:{'Watch again':'Replay','Only then':'Wait…','Torras scores':'Torras: 4–2 on pens','the final':'Barça in the final'}},
 {label:'How to stop a penalty (demo)',text:'Try it like Paco: stay big on your line, and wait. The kicker’s hips and standing foot show you where the ball is going. Then go!',tail:2.8,
  cues:['Try it','stay big','your line','and wait','hips and','show you','ball is going','Then go'],heads:{'stay big':'Stay big','and wait':'Wait…','hips and':'Watch the hips','Then go':'Go!'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/paco-sedano-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/paco-sedano-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/paco-sedano-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('paco-sedano: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('paco-sedano: no cue '+w);return c.at;};
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

// ---------------- stage: a yawed pinhole camera over the court floor (metres → world units); X right, Y up, Z away ----------------
/** camera at (x, eye, z) looking along heading a (a = 0 looks along +Z; + turns toward +X) */
type Stage={F:number;eye:number;x:number;z:number;a:number};
const NEAR=.4;
/** world (X,Z) → [lateral, depth] in the camera's frame */
function view(st:Stage,X:number,Z:number):Pt{const dx=X-st.x,dz=Z-st.z,s=Math.sin(st.a),c=Math.cos(st.a);return[dx*c-dz*s,dx*s+dz*c];}
const depth=(st:Stage,X:number,Z:number)=>view(st,X,Z)[1];
const kAt=(st:Stage,X:number,Z:number)=>st.F/Math.max(NEAR,depth(st,X,Z));
const proj=(st:Stage,X:number,Yh:number,Z:number):Pt=>{const[l,d]=view(st,X,Z),k=st.F/Math.max(NEAR,d);return[l*k,(st.eye-Yh)*k];};
/** a stage aimed from (x,z) at (tx,tz) */
const aimed=(F:number,eye:number,x:number,z:number,tx:number,tz:number):Stage=>({F,eye,x,z,a:Math.atan2(tx-x,tz-z)});
/** a 3D polygon clipped to the near plane, projected */
function poly3(st:Stage,pts:V3[]):Pt[]{
 const v=pts.map(p=>{const q=view(st,p[0],p[2]);return[q[0],p[1],q[1]] as V3;}),out:V3[]=[],n=v.length,zn=NEAR+.05;
 for(let i=0;i<n;i++){const a=v[i],b=v[(i+1)%n],ia=a[2]>=zn,ib=b[2]>=zn;if(ia)out.push(a);
  if(ia!==ib){const u=(zn-a[2])/(b[2]-a[2]);out.push([lerp(a[0],b[0],u),lerp(a[1],b[1],u),zn]);}}
 return out.map(([l,y,d])=>{const k=st.F/d;return[l*k,(st.eye-y)*k] as Pt;});
}
const floorPoly=(st:Stage,pts:Pt[])=>poly3(st,pts.map(p=>[p[0],0,p[1]] as V3));
const BALL_R=.11;
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
const quad3=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};
type XZ=[number,number];
const unit=(dx:number,dz:number):XZ=>{const l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];};

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean over the court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function ringXZ(X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push([X+Math.cos(a)*r,Z+Math.sin(a)*r]);}return out;}
/** a floor polyline (X,Z) as painted strips (one clipped quad per segment) added to `into` */
function lineOn(into:Path2D,st:Stage,pts:Pt[],hw=.05){
 for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],[ux,uz]=unit(b[0]-a[0],b[1]-a[1]),nx=-uz*hw,nz=ux*hw,ex=ux*hw*.6,ez=uz*hw*.6;
  const q=floorPoly(st,[[a[0]+nx-ex,a[1]+nz-ez],[b[0]+nx+ex,b[1]+nz+ez],[b[0]-nx+ex,b[1]-nz+ez],[a[0]-nx-ex,a[1]-nz-ez]]);if(q.length>2)into.addPath(polyPath(q,true));}
}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorPoly(st,ringXZ(X,Z,r*g,26));if(q.length<3)return;const p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a boot print on the floor at (X,Z), turned to yaw (our stage) */
function bootPrint(st:Stage,X:number,Z:number,yaw:number,g:number):Path2D{const c=Math.cos(yaw),sn=Math.sin(yaw),q:Pt[]=[];
 for(let i=0;i<16;i++){const a=i/16*TAU,lx=Math.cos(a)*.15*g,lz=Math.sin(a)*.055*g*(Math.cos(a)>0?1.05:.85);q.push([X+lx*c-lz*sn,Z+lx*sn+lz*c]);}return polyPath(floorPoly(st,q),true);}
/** convex hull (monotone chain) */
function hull2(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo:Pt[]=[],up:Pt[]=[];for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
 for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.x,st.eye,-st.z] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],depth(st,p[0],Z)];},scale(p:V3){return kAt(st,p[0],-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0;
const SKIN:InkFill[]=[[Y,.86],[R,.3]];
/** Paco Sedano, 1.90 m (eswiki): a yellow keeper top, long sleeves, navy long legs, white gloves, short dark hair (kit inferred; no number) */
const KBUILD={height:1.9,bulk:1.05};
const SEDANO:AthleteStyle={shirt:Y,shorts:K,socks:K,boots:K,skin:SKIN,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:KBUILD,seed:1};
/** the demonstration (chapter 3): the same keeper in a blue training top (no match is claimed) */
const SEDANO_TRAIN:AthleteStyle={...SEDANO,shirt:B,trim:'paper',seed:2};
/** Barcelona: blaugrana stripes, navy shorts and socks (inferred) */
const BAR=(n:number):AthleteStyle=>({shirt:B,pattern:'stripes',patternInk:R,shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:Y,hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Araz Naxçivan: white shirts, navy shorts (inferred) */
const ARZ=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.84],[R,.28]],hair:K,line:K,trim:R,hairStyle:n%2?'short':'curly',build:{height:1.74+hash(n,3)*.1},seed:20+n});
/** Araz's keeper waits by the centre line in a red top (inferred) */
const ARZ_GK:AthleteStyle={...ARZ(7),shirt:R,shorts:R,socks:R,trim:K,gloves:'paper',sleeves:'long',seed:28};
const SBUILD={height:1.76,bulk:1.02};
const DAVI:AthleteStyle={...ARZ(1),hairStyle:'short',build:SBUILD,seed:29};
/** the demonstration kicker (chapter 3): a paper training bib over navy */
const DEMO_S:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:SBUILD,seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact (library coords, place at the origin, turned to yaw) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),SBUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}

// ---------------- the keeper's poses ----------------
/** "stay big": tall, feet a little wider than the hips, knees soft, arms out wide and low, palms open to the kicker */
const BIG=posed({lHipF:16,rHipF:16,lHipA:20,rHipA:20,lKnee:28,rKnee:28,lAnk:-4,rAnk:-4,lean:8,pitch:3,lShF:26,rShF:26,lShA:74,rShA:74,lElb:16,rElb:16,lShR:10,rShR:10,lHand:1,rHand:1,neckP:-4});
const bigBounce=(t:number)=>blendPose(BIG,keeperSet(t*1.1),.22);
/** a clenched-fist "come on" and both arms up */
const FIST=posed({lHipF:14,rHipF:14,lKnee:20,rKnee:20,lean:6,rShF:40,rShA:40,rElb:120,lShA:20,lElb:40,neckP:-10});
/** Davi's disappointment: both hands to his head */
const HANDS_HEAD=posed({lHipF:8,rHipF:8,lKnee:10,rKnee:10,lean:-6,lShF:120,rShF:120,lShA:50,rShA:50,lElb:140,rElb:140,neckP:-22});
/** arms-linked waiting stance on the centre line */
const LINKED=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:4,lShA:34,rShA:34,lShF:6,rShF:6,lElb:30,rElb:30,neckP:-4});

// ---------------- the court: a futsal court 40 × 20, Barcelona's goal (the shoot-out end) at X = −20 (inferred end) ----------------
const GOAL_X=-20,POST_N=8.5,POST_F=11.5,GH=2,SPOT:XZ=[-14,10],KX=GOAL_X+.2,KZ=10;
const AW={x0:-21.8,x1:21.8,z0:-1.8,z1:21.4};
type Wall={a:XZ;b:XZ;n:XZ};
const WALLS:Wall[]=[{a:[AW.x0,AW.z1],b:[AW.x1,AW.z1],n:[0,1]},{a:[AW.x0,AW.z0],b:[AW.x0,AW.z1],n:[-1,0]},{a:[AW.x1,AW.z0],b:[AW.x1,AW.z1],n:[1,0]},{a:[AW.x0,AW.z0],b:[AW.x1,AW.z0],n:[0,-1]}];
/** one bank of seats behind a wall: boards (ads, red rail), stepped rows, a crowd (heads + shirts), roof lights */
function standBank(s:Sheet,st:Stage,w:Wall,t:number,cheer:number,flash:number,crowd:boolean){
 const{a,b,n}=w,P=(p:XZ,out:number,Yh:number):V3=>[p[0]+n[0]*out,Yh,p[1]+n[1]*out],L=Math.hypot(b[0]-a[0],b[1]-a[1]),dir:XZ=[(b[0]-a[0])/L,(b[1]-a[1])/L];
 const along=(u:number):XZ=>[a[0]+dir[0]*u,a[1]+dir[1]*u];
 const bank=poly3(st,[P(a,0,1),P(b,0,1),P(b,13,11.5),P(a,13,11.5)]);if(bank.length<3)return;
 const bp=polyPath(bank,true);s.knockout(bp);s.fill(K,bp,.42);
 const rows=new Path2D();for(let r=0;r<11;r+=2){const q=poly3(st,[P(a,r*1.2,1+r*.9),P(b,r*1.2,1+r*.9),P(b,(r+.5)*1.2,1+(r+.5)*.9),P(a,(r+.5)*1.2,1+(r+.5)*.9)]);if(q.length>2)rows.addPath(polyPath(q,true));}s.fill(K,rows,crowd?.3:.14);
 if(crowd){const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),tw=Math.floor(t*12);
  for(let r=0;r<10;r++)for(let u=.4+(r%2)*.42;u<L;u+=.84){const p=along(u),base=P(p,(r+.35)*1.2,1+(r+.35)*.9),[l,d]=view(st,base[0],base[2]);if(d<5||Math.abs(l)>1.5*d)continue;
   const i=Math.round(u*10)*31+r*977+Math.round((a[0]+a[1])*7),hsh=hash(i,3),k=st.F/d,jump=cheer*.35*Math.abs(Math.sin(tw*.9+hsh*6)),hx=l*k+(hsh-.5)*.3*k,hy=(st.eye-base[1]-.5-jump)*k,rr=.16*k;
   heads.moveTo(hx+rr,hy);heads.arc(hx,hy,rr,0,TAU);const body=hash(i,4),bx=hx-rr*1.3,by=hy+rr*.9,bw=rr*2.6,bh=rr*1.8;
   if(body<.34)reds.rect(bx,by,bw,bh);else if(body<.46)yel.rect(bx,by,bw,bh);else if(body<.56)blues.rect(bx,by,bw,bh);}
  s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);}
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let u=3;u<L;u+=7){const p=P(along(u),12,13),[l,d]=view(st,p[0],p[2]);if(d<2)continue;const k=st.F/d,lx=l*k,ly=(st.eye-p[1])*k,rr=.5*k*(1+.5*flash);
  for(let j=0;j<3;j++)lights[j].addPath(polyPath(blob(lx,ly,rr*(1+(2-j)*.8),rr*(1+(2-j)*.8)*.7,40+Math.round(u)+j,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
 const bd=poly3(st,[P(a,0,0),P(b,0,0),P(b,0,1),P(a,0,1)]);if(bd.length>2){const bdp=polyPath(bd,true);s.knockout(bdp);s.fill(K,bdp,.8);}
 const ads=new Path2D();for(let u=.4;u<L-2;u+=3){const p0=along(u),p1=along(u+2.2),q=poly3(st,[P(p0,-.01,.22),P(p1,-.01,.22),P(p1,-.01,.76),P(p0,-.01,.76)]);if(q.length>2)ads.addPath(polyPath(q,true));}s.fill(Y,ads,.75);
 const rail=poly3(st,[P(a,-.01,.94),P(b,-.01,.94),P(b,-.01,1.04),P(a,-.01,1.04)]);if(rail.length>2)s.fill(R,polyPath(rail,true));
}
/** the arena: roof, the banks the camera looks at (far first), run-off, court, lines */
function arena(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;crowd?:boolean}={}){
 const{cheer=0,flash=0,crowd=true}=o,span=20000;
 s.fill(K,rectPath(-span,-span,span*2,span*2),.72);
 WALLS.filter(w=>(st.x-w.a[0])*w.n[0]+(st.z-w.a[1])*w.n[1]<0).map(w=>({w,d:depth(st,(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2)})).sort((p,q)=>q.d-p.d).forEach(({w})=>standBank(s,st,w,t,cheer,flash,crowd));
 const ro=floorPoly(st,[[AW.x0,AW.z0],[AW.x1,AW.z0],[AW.x1,AW.z1],[AW.x0,AW.z1]]);if(ro.length>2){const rp=polyPath(ro,true);s.knockout(rp);s.fill(B,rp,.6);s.fill(K,rp,.38);}
 const cz=floorPoly(st,[[-20,0],[20,0],[20,20],[-20,20]]);if(cz.length>2){const cp=polyPath(cz,true);s.knockout(cp,.25);s.fill(B,cp,.82);}
 const box=floorPoly(st,[[-20,6],[-12,6],[-12,14],[-20,14]]);if(box.length>2)s.fill(B,polyPath(box,true),.12);
 const lines=new Path2D();
 for(const seg of[[[-20,0],[20,0]],[[-20,20],[20,20]],[[-20,0],[-20,20]],[[20,0],[20,20]],[[0,0],[0,20]]] as Pt[][])lineOn(lines,st,seg);
 for(const gx of[-20,20]){const sg=gx<0?1:-1,arc:Pt[]=[];for(let k=0;k<=8;k++){const q=k/8*Math.PI/2;arc.push([gx+sg*6*Math.sin(q),POST_N-6*Math.cos(q)]);}
  for(let k=0;k<=8;k++){const q=Math.PI/2-k/8*Math.PI/2;arc.push([gx+sg*6*Math.sin(q),POST_F+6*Math.cos(q)]);}lineOn(lines,st,arc);
  for(const d of[6,10]){const q=floorPoly(st,ringXZ(gx+sg*d,10,.12,12));if(q.length>2)lines.addPath(polyPath(q,true));}}
 const cc=ringXZ(0,10,3,32);lineOn(lines,st,[...cc,cc[0]]);
 s.knockout(lines,.94);
}
/** the goal at X = −20: net (hull + mesh) behind whatever `inside` draws, then posts and bar (red bands) */
const gb=(Z:number,Yh:number):V3=>[GOAL_X-lerp(.95,.55,Yh/GH),Yh,Z];
function goalNet(s:Sheet,st:Stage){
 const P=(p:V3)=>proj(st,p[0],p[1],p[2]),corners:V3[]=[[GOAL_X,0,POST_N],[GOAL_X,GH,POST_N],[GOAL_X,GH,POST_F],[GOAL_X,0,POST_F],gb(POST_N,0),gb(POST_N,GH),gb(POST_F,GH),gb(POST_F,0)];
 const np=polyPath(hull2(corners.map(P)),true);s.knockout(np,.5);s.fill(K,np,.18);
 const mesh=new Path2D(),mv=(p:V3)=>{const q=P(p);mesh.moveTo(q[0],q[1]);},ln=(p:V3)=>{const q=P(p);mesh.lineTo(q[0],q[1]);};
 for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){mv(gb(Z,0));for(let Yh=.25;Yh<=GH+1e-6;Yh+=.25)ln(gb(Z,Yh));ln([GOAL_X,GH,Z]);}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.3){mv(gb(POST_N,Yh));for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3)ln(gb(Z,Yh));}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.4)for(const Z of[POST_N,POST_F]){mv([GOAL_X,Yh,Z]);ln(gb(Z,Yh));}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,GOAL_X,10)*.018),.55);
}
function goalFrame(s:Sheet,st:Stage){
 const P=(Yh:number,Z:number)=>proj(st,GOAL_X,Yh,Z),w=Math.max(5,kAt(st,GOAL_X,10)*.09),lw=Math.max(2.4,kAt(st,GOAL_X,10)*.014);
 const frame:Pt[]=[P(0,POST_N),P(GH,POST_N),P(GH,POST_F),P(0,POST_F)];
 s.fill(K,ribbon(frame,w+lw*2,{seed:3,taper:0,wobble:.3}),.95);s.knockout(ribbon(frame,w,{seed:3,taper:0,wobble:.3}));
 const bands=new Path2D(),seg=(y0:number,z0:number,y1:number,z1:number)=>bands.addPath(ribbon([P(y0,z0),P(y1,z1)],w,{seed:5,taper:0,wobble:.2}));
 for(let k=0;k<8;k+=2){seg(k/8*GH,POST_N,(k+1)/8*GH,POST_N);seg(k/8*GH,POST_F,(k+1)/8*GH,POST_F);}
 for(let k=0;k<12;k+=2)seg(GH,lerp(POST_N,POST_F,k/12),GH,lerp(POST_N,POST_F,(k+1)/12));
 s.fill(R,bands);
}

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;smear?:number;dir?:number}={}){
 const{rot=0,smear=0,dir=0}=o;let pts=blob(x,y,r,r,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);
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

// ---------------- a penalty: the kick, the keeper's wait and dive, the ball — one model for the live kick and the demo ----------------
type Pen={side:'l'|'r';HIT:V3;PLANT:XZ;START:XZ;YAW:number;D:number;D0:number;dS:number;run:number;ball:(d:number)=>{X:number;Y:number;Z:number;flying:boolean;spin:number};
 keeper:(d:number,pre:(d:number)=>Pose)=>Pose;kicker:(d:number,after:Pose)=>{pose:Pose;yaw:number;X:number;Z:number}};
/** side: which way the keeper goes ('l' = his left = far post, +Z); tz: where the ball crosses his line; run: run-up seconds */
function makePen(side:'l'|'r',tz:number,run:number,startOff:XZ):Pen{
 const D=.82,react=.02,DV=(u:number)=>keeperDive(u,{side,height:.18});
 const lead=(u:number):V3=>{const sk=solve(DV(u),KBUILD,placeAt(KX,KZ,FACE_RIGHT)),l=toMine(sk.lHa),r=toMine(sk.rHa);return side==='l'?(l[2]>r[2]?l:r):(l[2]<r[2]?l:r);};
 let uh=.55;for(let u=.25;u<=.7;u+=.005){const z=lead(u)[2];if(side==='l'?z>=tz:z<=tz){uh=u;break;}}
 const hp=lead(uh),HIT:V3=[hp[0]+.12,Math.max(.18,hp[1]),hp[2]];
 const YAW=yawTo(HIT[0]-SPOT[0],HIT[2]-SPOT[1]),SB=toMine(strikeBall(YAW)),PLANT:XZ=[SPOT[0]-SB[0],SPOT[1]-SB[2]];
 const START:XZ=[PLANT[0]+startOff[0],PLANT[1]+startOff[1]];
 const D0=-react,dS=D0+uh*D,sg=side==='l'?1:-1,mz=(z:number)=>10+sg*(z-10);
 const MID:V3=[GOAL_X-.25,HIT[1]+.55,mz(12.3)],END:V3=[GOAL_X-1.0,.3,mz(13.3)],REST:V3=[GOAL_X-1.5,BALL_R,mz(14.1)];
 const ball=(d:number)=>{
  if(d<0)return{X:SPOT[0],Y:BALL_R,Z:SPOT[1],flying:false,spin:0};
  if(d<dS){const u=d/dS;return{X:lerp(SPOT[0],HIT[0],u),Y:lerp(BALL_R,HIT[1],u)+Math.sin(u*Math.PI)*.08,Z:lerp(SPOT[1],HIT[2],u),flying:true,spin:u*20};}
  if(d<dS+.45){const q=quad3(HIT,MID,END,(d-dS)/.45);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:20+(d-dS)*60};}
  const u=sm(dS+.45,dS+1.4,d,easeOut),bo=Math.abs(Math.sin(u*Math.PI*2))*.25*(1-u);return{X:lerp(END[0],REST[0],u),Y:lerp(END[1],BALL_R,Math.min(1,u*2.5))+bo,Z:lerp(END[2],REST[2],u),flying:false,spin:47+u*8};};
 const DV1=DV(1),UP={...stand(),dz:DV1.dz} as Pose,UPFIST={...FIST,dz:DV1.dz} as Pose;
 const keeper=(d:number,pre:(d:number)=>Pose)=>{
  if(d<D0)return pre(d);const u=(d-D0)/D;
  if(u<1)return blendPose(pre(D0),DV(u),sm(0,.1,u));
  const land=D0+D;return keyPoses(d,[[land,DV1],[land+.45,DV1],[land+1.05,UP],[land+1.4,UPFIST]]);};
 const kicker=(d:number,after:Pose)=>{
  const t0=-.55,r0=t0-run;
  if(d<r0){const yaw=yawTo(SPOT[0]-START[0],SPOT[1]-START[1]);return{pose:blendPose(stand(),runCycle(d*.8,{speed:.05}),.15),yaw,X:START[0],Z:START[1]};}
  if(d<t0){const u=sm(r0,t0,d,linear),X=lerp(START[0],PLANT[0],u),Z=lerp(START[1],PLANT[1],u),yaw=lerp(yawTo(PLANT[0]-START[0],PLANT[1]-START[1]),YAW,sm(.6,1,u));
   return{pose:blendPose(runCycle((d-r0)*runCadence(.45),{speed:.45}),strike(.12,{foot:'r'}),sm(.8,1,u)),yaw,X,Z};}
  const stT=key(d,[[t0,.12],[0,STRIKE_CONTACT],[.55,1]],linear);
  const pose=d<.55?strike(stT,{foot:'r'}):blendPose(strike(1,{foot:'r'}),after,sm(.55,1.05,d,easeIO));
  return{pose,yaw:YAW,X:PLANT[0],Z:PLANT[1]};};
 return{side,HIT,PLANT,START,YAW,D,D0,dS,run,ball,keeper,kicker};
}
/** the screen direction the ball is travelling (for its smear) */
function ballDir(st:Stage,f:(t:number)=>{X:number;Y:number;Z:number},t:number){const a=f(t-.04),b=f(t),p=proj(st,a.X,a.Y,a.Z),q=proj(st,b.X,b.Y,b.Z);return Math.atan2(q[1]-p[1],q[0]-p[0]);}
/** Sedano's chest (the passage enters his top) */
function chestPts(st:Stage,pose:Pose,r=.1):Pt[]{const sk=solve(pose,KBUILD,placeAt(KX,KZ,FACE_RIGHT)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[0],ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
/** "stay big": the goal he covers — a yellow screen over the hull of his hands, head and feet */
function bigScreen(s:Sheet,st:Stage,pose:Pose,g:number,seed:number){
 if(g<=.02)return;const sk=solve(pose,KBUILD,placeAt(KX,KZ,FACE_RIGHT)),P=(j:V3)=>{const m=toMine(j);return proj(st,m[0],m[1],m[2]);};
 const pts=[sk.lHa,sk.rHa,sk.head,sk.lAn,sk.rAn,sk.lSh,sk.rSh].map(P),c=pts.reduce((a,p)=>[a[0]+p[0]/pts.length,a[1]+p[1]/pts.length] as Pt,[0,0] as Pt);
 const h=hull2(pts).map(p=>[c[0]+(p[0]-c[0])*(1.18*g),c[1]+(p[1]-c[1])*(1.18*g)] as Pt),hp=polyPath(smoothPts(h,true,6,2.5),true);
 s.knockout(hp,.35*g);s.fill(Y,hp,.5*g);s.fill(Y,ribbon([...h,h[0]],10,{seed,close:true,wobble:1,gaps:dashGaps(h,30)}),g);
}
/** "feet still": red boot prints stamped under his boots */
function prints(s:Sheet,st:Stage,pose:Pose,g:number){if(g<=.02)return;const sk=solve(pose,KBUILD,placeAt(KX,KZ,FACE_RIGHT)),l=toMine(sk.lAn),r=toMine(sk.rAn),pp=new Path2D();
 pp.addPath(bootPrint(st,l[0],l[2],FACE_RIGHT,1.3*g));pp.addPath(bootPrint(st,r[0],r[2],FACE_RIGHT,1.3*g));s.knockout(pp);s.fill(R,pp,.9);}

// ================= chapter 1 — LIVE: the centre line, 4–4, penalties; the pan to the goal; big; Davi's kick; saved =================
const C1={baku:A(0,'Baku'),araz:A(0,'Araz'),four:A(0,'four all'),pens:A(0,'penalties'),keeper:A(0,'keeper Paco'),tall:A(0,'stands tall'),davi:A(0,'Davi runs'),shoots:A(0,'shoots'),saves:A(0,'saves it'),end:AUTH[0].seconds};
/** the kick is timed so the save lands on "saves it"; the run-up starts on "Davi runs" */
const T_KICK=Math.max(C1.saves-.36,C1.davi+1.3);
const PEN1=makePen('l',11.0,clamp(T_KICK-.55-C1.davi-.05,.7,1.4),[3.1,-1.3]);
const T_SAVE1=T_KICK+PEN1.dS;
const liveBall=(T:number)=>PEN1.ball(T-T_KICK);
const preLive=(T:number)=>{const t=T+T_KICK;return blendPose(keeperSet(t*1.1),bigBounce(t),sm(C1.tall-.05,C1.tall+.4,t,easeIO));};
const liveK:Gen=T=>({pose:PEN1.keeper(T-T_KICK,d=>preLive(d)),yaw:FACE_RIGHT,X:KX,Z:KZ});
/** Davi: walks from the centre line to the start of his run-up, waits, runs, strikes right-footed, hands to his head */
const DAVI_W0:XZ=[-4.2,11.4];
const liveDavi:Gen=T=>{
 const walkEnd=C1.keeper;if(T<walkEnd){const u=sm(0,walkEnd,T,linear),X=lerp(DAVI_W0[0],PEN1.START[0],u),Z=lerp(DAVI_W0[1],PEN1.START[1],u);
  return{pose:blendPose(runCycle(T*runCadence(.22),{speed:.22}),stand(),sm(walkEnd-.4,walkEnd,T)),yaw:yawTo(PEN1.START[0]-DAVI_W0[0],PEN1.START[1]-DAVI_W0[1]),X,Z};}
 return PEN1.kicker(T-T_KICK,HANDS_HEAD);};
/** the teams on the centre line (Barça arms linked; Araz; Araz's keeper) — after the save Barça jump, Araz hold their heads */
const LINE:{X:number;Z:number;team:'b'|'a';n:number}[]=[{X:-1.6,Z:8.6,team:'b',n:0},{X:-.55,Z:8.6,team:'b',n:1},{X:.5,Z:8.6,team:'b',n:2},{X:1.55,Z:8.6,team:'b',n:3},
 {X:-1.1,Z:11.6,team:'a',n:0},{X:0,Z:11.6,team:'a',n:2},{X:1.1,Z:11.6,team:'a',n:3}];
const liveLine=(i:number):Gen=>T=>{const m=LINE[i],post=sm(T_SAVE1+.25,T_SAVE1+.6,T);let pose=blendPose(LINKED,stand(),.3+.2*Math.sin(T*1.3+i));
 if(m.team==='b')pose=blendPose(pose,celebrate(((T-T_SAVE1)*1.1+i*.23)%1,{kind:'arms'}),post);else pose=blendPose(pose,HANDS_HEAD,post*.8);
 return{pose,yaw:yawTo(-1,m.team==='b'?.25:-.25),X:m.X,Z:m.Z};};
const liveGK:Gen=T=>({pose:blendPose(stand(),HANDS_HEAD,.7*sm(T_SAVE1+.3,T_SAVE1+.8,T)),yaw:yawTo(-1,-.4),X:-3.2,Z:14.6});
const liveCam=(T:number)=>({x:key(T,mono([[0,-3.2],[C1.four,-3.8],[C1.pens,-5.5],[C1.keeper,-17.2],[C1.tall,-17.9],[C1.davi,-15.8],[T_KICK-.2,-16.2],[T_SAVE1+.3,-17.5],[C1.end,-17.3]]),easeInOutSine),
 zoom:key(T,mono([[0,.5],[C1.four,.62],[C1.pens,.58],[C1.keeper,.72],[C1.tall,.9],[C1.davi,.6],[T_KICK-.2,.68],[T_SAVE1+.4,.86],[C1.end,.84]]),easeInOutSine),
 y:key(T,mono([[0,1040],[C1.pens,1060],[C1.tall,1080],[C1.end,1090]]),easeInOutSine)});
const st1=(x:number):Stage=>({F:4500,eye:6,x,z:-13,a:0});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=st1(c.x),hit=pulse(Tc,T_SAVE1,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),crowdCheer=T<T_SAVE1?.18:.18+.2*(1-sm(T_SAVE1,T_SAVE1+1.5,T));
 arena(s,st,T,{cheer:crowdCheer,flash:.6*pulse(T,T_SAVE1,1.2)});
 goalNet(s,st);
 if(b.X<GOAL_X)ballOn(s,st,b.X,b.Y,b.Z,18,{rot:b.spin});
 // "keeper Paco": a yellow ring under Sedano; "stands tall": the "big" screen round him
 floorDashRing(s,st,Y,KX+.4,KZ,1.2,10,11,easeOutBack(sm(C1.keeper,C1.keeper+.35,T))*(1-sm(C1.davi-.2,C1.davi+.2,T)));
 bigScreen(s,st,liveK(T).pose,sm(C1.tall,C1.tall+.4,T,easeOut)*(1-sm(T_KICK-.3,T_KICK,T)),12);
 type It={z:number;draw:()=>void};const items:It[]=[];
 LINE.forEach((m,i)=>{const g=liveLine(i);items.push({z:depth(st,m.X,m.Z),draw:()=>athlete(s,st,g,T,m.team==='b'?BAR(m.n):ARZ(m.n+2),{detail:'low'})});});
 items.push({z:depth(st,-3.2,14.6),draw:()=>athlete(s,st,liveGK,T,ARZ_GK,{detail:'low'})});
 const dv=liveDavi(T);items.push({z:depth(st,dv.X,dv.Z),draw:()=>athlete(s,st,liveDavi,T,DAVI,{smear:T>T_KICK-.2&&T<T_KICK+.2?.1:0})});
 items.push({z:depth(st,KX,KZ),draw:()=>athlete(s,st,liveK,T,SEDANO,{smear:T>T_SAVE1-.25&&T<T_SAVE1+.2?.1:0})});
 if(b.X>=GOAL_X)items.push({z:depth(st,b.X,b.Z)-.05,draw:()=>{const r=ballOn(s,st,b.X,b.Y,b.Z,18,{rot:b.spin,smear:b.flying?.45:0,dir:ballDir(st,liveBall,T)});
  if(T>=T_SAVE1&&T<T_SAVE1+.35)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3.2,{n:10,seed:19,g:easeOut(sm(T_SAVE1,T_SAVE1+.25,T))});}});
 items.sort((p,q)=>q.z-p.z).forEach(it=>it.draw());
 goalFrame(s,st);
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(st1(liveCam(tc).x),liveK(tt).pose,.12));},still:T_SAVE1+.05};

// ================= chapter 2 — REPLAY: the low corner camera, slow motion; big and still; waits; moves only at the kick; Torras; the final =================
const C2={watch:A(1,'Watch'),big:A(1,'stays big'),still:A(1,'still'),waits:A(1,'waits'),only:A(1,'Only then'),move:A(1,'he move'),torras:A(1,'Torras'),barca:A(1,'Barcelona are'),fin:A(1,'the final'),end:AUTH[1].seconds};
/** replay clock → live time: the run-up in slow motion (≈ .45×), the kick lands on "Only then", the dive at ≈ .3×, then real time */
const R0=T_KICK-.55-PEN1.run*.55;
const rLive=(t:number)=>key(t,mono([[0,R0],[C2.only,T_KICK,linear],[Math.max(C2.move+.25,C2.only+.9),T_SAVE1,linear],[C2.torras,T_SAVE1+1.3,linear],[C2.end,T_SAVE1+1.3+(C2.end-C2.torras)*.9,linear]]),linear);
/** the camera: knee height at the near corner of the penalty area, looking diagonally across the goalmouth; it pans from the kicker to the keeper */
const st2=(t:number):Stage=>{const u=sm(C2.big-.2,C2.only+.6,t,easeIO),v=sm(C2.torras,C2.end,t,easeIO);
 return aimed(1800,.85+.45*v,-8.2-.6*v,5.6+.3*v,lerp(-16.2,-18.2,u),lerp(10.0,10.4,u));};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),T=rLive(tt),st=st2(tt),hit=pulse(t,C2.move,.45);
  const kx=proj(st,KX,0,KZ)[0];
  camPath(s,t,[[0,kx+260,40,1.2],[C2.big,kx+60,-10,1.5],[C2.still,kx+20,60,1.62],[C2.waits,kx+180,20,1.34],[C2.only,kx+160,20,1.3],[C2.move+.3,kx+60,10,1.46],[C2.torras,kx+80,0,1.3],[C2.end,kx+120,-20,1.18]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  const b=liveBall(T),kp=liveK(T),cheer=.1+.9*sm(C2.torras,C2.torras+.5,tt);
  arena(s,st,tt,{cheer,flash:.8*pulse(tt,C2.torras,1.4)});
  goalNet(s,st);
  if(b.X<GOAL_X)ballOn(s,st,b.X,b.Y,b.Z,97,{rot:b.spin*.4});
  // "stays big": the yellow screen; "still": boot prints; "waits for the kick": a dashed eye-line from him to the ball
  bigScreen(s,st,kp.pose,sm(C2.big,C2.big+.35,tt,easeOut)*(1-sm(C2.only-.1,C2.only+.2,tt)),92);
  prints(s,st,kp.pose,easeOutBack(sm(C2.still,C2.still+.3,tt))*(1-sm(C2.only,C2.only+.3,tt)));
  const eye=sm(C2.waits,C2.waits+.4,tt,easeOut)*(1-sm(C2.only+.1,C2.only+.4,tt));
  if(eye>.02){const sk=solve(kp.pose,KBUILD,placeAt(KX,KZ,FACE_RIGHT)),h=toMine(sk.head),a=proj(st,h[0],h[1],h[2]),c=proj(st,SPOT[0],BALL_R,SPOT[1]),m:Pt=[(a[0]+c[0])/2,(a[1]+c[1])/2-30];dashed(s,Y,[a,m,c],8,93,{dash:28,progress:eye});}
  // the flight and the push wide: dashed yellow line + arrow
  if(T>T_KICK){const pts:Pt[]=[];for(let k=0;k<=16;k++){const q=liveBall(lerp(T_KICK,Math.min(T,T_SAVE1+.5),k/16));pts.push(proj(st,q.X,q.Y,q.Z));}const fade=1-sm(C2.torras,C2.torras+.4,tt);if(fade>.02){dashed(s,Y,pts,9,95,{dash:36,cov:fade});if(T>T_SAVE1+.3)arrowHead(s,Y,pts,30,fade);}}
  type It={z:number;draw:()=>void};const items:It[]=[];
  const dv=liveDavi(T);items.push({z:depth(st,dv.X,dv.Z),draw:()=>athlete(s,st,liveDavi,T,DAVI,{detail:'mid',smear:T>T_KICK-.2&&T<T_KICK+.15?.07:0})});
  items.push({z:depth(st,KX,KZ),draw:()=>athlete(s,st,liveK,T,SEDANO,{detail:'high',smear:T>T_SAVE1-.2&&T<T_SAVE1+.2?.06:0})});
  if(b.X>=GOAL_X)items.push({z:depth(st,b.X,b.Z)-.05,draw:()=>{const r=ballOn(s,st,b.X,b.Y,b.Z,97,{min:10,rot:b.spin*.4,smear:b.flying?.3:0,dir:ballDir(st,liveBall,T)});
   if(T>=T_SAVE1&&T<T_SAVE1+.3)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3,{n:11,seed:98,g:easeOut(sm(T_SAVE1,T_SAVE1+.25,T))});}});
  items.sort((p,q)=>q.z-p.z).forEach(it=>it.draw());
  goalFrame(s,st);
  // "Torras scores … in the final": Barça-coloured confetti over the stands
  if(tt>=C2.torras){const u=sm(C2.torras,C2.torras+2.5,tt,linear),gx=proj(st,KX,0,KZ)[0];confetti(s,[R,B,Y],[gx-900,-640+u*380,2000,420],44,Math.floor(tt*6),{size:30});}
 },
 aperture(t0){const{tt}=clock(1,t0),T=rLive(tt);return aperture(chestPts(st2(tt),liveK(T).pose,.12));},
 still:C2.move+.2,
};

// ================= chapter 3 — HOW TO STOP A PENALTY (demonstration, training kit, empty arena; high diagonal camera from the far side) =================
const C3={tr:A(2,'Try'),big:A(2,'stay big'),line:A(2,'your line'),wait:A(2,'and wait'),hips:A(2,'hips'),show:A(2,'show you'),going:A(2,'ball is going'),go:A(2,'Then go'),end:AUTH[2].seconds};
/** the demo kick goes the other way (his right, the near post), right-footed, run-up from the kicker's left */
const PEN3=makePen('r',9.05,1.0,[3.0,-1.2]);
const PLANT_D=-.55+(.22-.12)/(STRIKE_CONTACT-.12)*.55;
/** demo clock: the run-up starts on "and wait", the plant lands on "hips", then almost a freeze while we read the hips, the kick on "Then go" */
const dClock=(t:number)=>key(t,mono([[0,-.55-PEN3.run-.6],[C3.wait,-.55-PEN3.run],[C3.hips,PLANT_D+.01],[C3.go-.05,PLANT_D+.1],[C3.go+.3,0],[C3.go+.3+PEN3.dS*1.4,PEN3.dS],[C3.end,PEN3.dS+(C3.end-C3.go-.3-PEN3.dS*1.4)*.85]]),linear);
const preDemo=(t:number)=>(d:number)=>{void d;return blendPose(stand(),bigBounce(t),sm(C3.big-.05,C3.big+.4,t,easeIO));};
const demoK=(t:number)=>PEN3.keeper(dClock(t),preDemo(t));
const demoS:Gen=t=>PEN3.kicker(dClock(t),stand());
const st3:Stage=aimed(1500,4.0,-10.2,15.9,-16.4,10.0);
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,d=dClock(tt),kp=demoK(tt);
  const kx=proj(st,KX,0,KZ)[0],ky=proj(st,KX,.95,KZ)[1],sx=proj(st,SPOT[0],0,SPOT[1])[0],sy=proj(st,SPOT[0],.9,SPOT[1])[1];
  camPath(s,t,[[0,kx,ky,1.5],[C3.big,kx,ky-10,1.75],[C3.line,kx,ky+30,1.66],[C3.wait,(kx+sx)/2,(ky+sy)/2,1.15],[C3.hips,(kx*.35+sx*.65),(ky*.35+sy*.65),1.3],[C3.show,(kx+sx)/2,(ky+sy)/2,1.15],[C3.go-.4,(kx*.55+sx*.45),(ky*.55+sy*.45),1.2],[C3.go+1.2,(kx*.8+sx*.2),(ky*.8+sy*.2),1.3],[C3.end,kx,ky,1.46]]);
  arena(s,st,tt,{crowd:false});
  goalNet(s,st);
  const b=PEN3.ball(d);if(b.X<GOAL_X)ballOn(s,st,b.X,b.Y,b.Z,337,{rot:b.spin*.4});
  // "stay big": the goal he covers; "your line": the goal line lit between the posts
  bigScreen(s,st,kp,sm(C3.big,C3.big+.4,tt,easeOut)*(1-sm(C3.go-.1,C3.go+.2,tt)),331);
  const gl=sm(C3.line,C3.line+.4,tt,easeOut)*(1-sm(C3.go,C3.go+.4,tt));
  if(gl>.02){const pts=[proj(st,GOAL_X+.08,0,POST_F+.6),proj(st,GOAL_X+.08,0,10),proj(st,GOAL_X+.08,0,POST_N-.6)];dashed(s,Y,pts,15,332,{dash:34,progress:gl});}
  // "and wait": feet printed still
  prints(s,st,kp,easeOutBack(sm(C3.wait,C3.wait+.3,tt))*(1-sm(C3.go,C3.go+.3,tt)));
  // "hips and standing foot": a ring at the standing foot; "show you": a floor arrow along his hips to the corner; "ball is going": the corner glows
  const ks=demoS(tt),ssk=solve(ks.pose,SBUILD,placeAt(ks.X,ks.Z,ks.yaw)),lf=toMine(ssk.lAn),pel=toMine(ssk.pelvis);
  floorDashRing(s,st,R,lf[0],lf[2],.42,10,333,easeOutBack(sm(C3.hips,C3.hips+.35,tt))*(1-sm(C3.go+.2,C3.go+.6,tt)));
  const ar=sm(C3.show,C3.show+.6,tt,easeOut)*(1-sm(C3.go+.3,C3.go+.7,tt));
  if(ar>.02){const a:Pt=[pel[0],pel[2]],c:Pt=[GOAL_X+.3,PEN3.HIT[2]],m:Pt=[(a[0]+c[0])/2,(a[1]+c[1])/2-.25];const pts=[a,m,c].map(p=>proj(st,p[0],0,p[1]));dashed(s,Y,pts,11,334,{dash:34,progress:ar});if(ar>.8)arrowHead(s,Y,pts,32,sm(.8,1,ar));}
  floorDashRing(s,st,Y,GOAL_X+.4,PEN3.HIT[2],.55,9,335,easeOutBack(sm(C3.going,C3.going+.35,tt))*(1-sm(C3.go+.3,C3.go+.7,tt)));
  const items:{z:number;draw:()=>void}[]=[
   {z:depth(st,ks.X,ks.Z),draw:()=>athlete(s,st,demoS,tt,DEMO_S,{detail:'mid',smear:d>-.15&&d<.15?.08:0})},
   {z:depth(st,KX,KZ),draw:()=>athlete(s,st,t2=>({pose:demoK(t2),yaw:FACE_RIGHT,X:KX,Z:KZ}),tt,SEDANO_TRAIN,{detail:'high',smear:d>PEN3.dS-.2&&d<PEN3.dS+.2?.06:0})},
  ];
  if(b.X>=GOAL_X)items.push({z:depth(st,b.X,b.Z)-.05,draw:()=>{const r=ballOn(s,st,b.X,b.Y,b.Z,337,{min:10,rot:b.spin*.4,smear:b.flying?.3:0,dir:ballDir(st,PEN3.ball,d)});
   if(d>=PEN3.dS&&d<PEN3.dS+.3)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3,{n:10,seed:338,g:easeOut(sm(PEN3.dS,PEN3.dS+.25,d))});}});
  items.sort((p,q)=>q.z-p.z).forEach(it=>it.draw());
  goalFrame(s,st);
  // the end: a big blue tick beside him (navy misregistered echo)
  const tick=easeOutBack(sm(C3.go+1.6,C3.go+1.95,tt));
  if(tick>.02){const g=proj(st,KX,0,KZ),h=kAt(st,KX,KZ)*1.9,c:Pt=[g[0]+h*.9,g[1]-h*.95],S=h*.34*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(B,ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1}));}
 },
 still:C3.show+.3,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'paco-sedano-futsal-signature',format:'futsal',title:'Paco Sedano’s calm penalty save',theme:'Stay big on your line and wait for the kicker to show you.',
 ageNote:'For players aged 7–12: the 2014 semi-final shoot-out save is real; how the save was made is our best reconstruction, and the last chapter is a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball flies in low and is pushed away by a glove (paper palm, navy rim); a yellow ring rings out. Reduced motion = at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.26),out=clamp((age-.26)/.4),bx=age<.26?lerp(x+170,x,easeOut(u)):x-90*easeOut(out),by=age<.26?lerp(y+20,y,easeOut(u)):y-110*easeOut(out);
  if(age>.26&&out<1)s.fill(Y,ribbon(blob(x,y,r*(1.2+1.6*out),r*(1.2+1.6*out),seed,{n:24}),8*(1-out)+2,{seed,close:true,wobble:1.2}),1);
  ball(s,bx,by,r,seed,{rot:age*6});
  const g=sm(.14,.26,age)*(1-sm(.7,1,age));if(g>.02){const gl=blob(x-r*1.1,y+r*.2,r*.5*g,r*.7*g,seed+2,{n:16});s.knockout(polyPath(gl,true));s.fill(K,ribbon(gl,5,{seed:seed+5,close:true,wobble:.6}),1);}
 },
};
export default film;
