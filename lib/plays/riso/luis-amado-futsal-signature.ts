/** Luis Amado — "the rock-steady save": a signature-move riso film (iconic plays, FUTSAL goleiro).
 *
 * WHY THIS MOMENT: Amado's entry (lib/town/iconicPlays.json) is a signature — the rock-steady save, "Be in the right place early and saves
 * become easier" — not one match. UEFA's minute-by-minute commentary of the UEFA Futsal EURO 2012 final describes ONE save that is exactly
 * that: a point-blank shot that he did not have to dive for, because he was already there. So the film recreates that save:
 *  1  LIVE (broadcast camera, main stand, real time): the final, 11 Feb 2012, Russia 1–3 Spain (a.e.t.), Arena Zagreb. 0–0 in the second half.
 *     "30:31 Abramov (Russia) has an effort on goal. 30:32 Luis Amado (Spain) makes a save. — Point-blank from Amado, to Sergei Abramov's
 *     frustration." "30:33 Prudnikov (Russia) takes the corner." Amado moves with every pass, is set before the shot, and the ball hits him.
 *  2  REPLAY (slow motion, GOAL-LINE camera: low, on the goal line outside the near post, looking along the line): set before the shot, feet
 *     still, the ball hits him and flies past the near post for the corner. Spain went on to win 3–1 after extra time.
 *  3  HOW HE DOES IT (a demonstration in training kit, no match claimed; HIGH END-STAND camera behind the goal): the ball moves, he moves with
 *     it; he stands on the line between the ball and the middle of his goal (the triangle to the posts), so the shot comes to him.
 *  4  PRACTISE (lesson from the entry's `lesson`): facing him on his line — watch, move first, set — three cards; an easy catch; a tick.
 *  (Camera plan chosen to differ from the other goleiro films: no behind-the-shooter replay, no net camera.)
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - UEFA.com minute-by-minute commentary, Russia v Spain, UEFA Futsal EURO 2012 final (Paul Saffer, Arena Zagreb), archived 26 Nov 2012
 *    (uefa-futsaleuro2012-final-commentary.txt):
 *    https://web.archive.org/web/20121126185911/http://www.uefa.com/futsaleuro/season=2012/matches/round=2000150/match=2008820/postmatch/commentary/index.html
 *    — the 30:31–30:33 lines quoted above; "Amado having a busy final"; "Russia begin in attacking mood despite the crowd throwing their
 *    weight behind Spain"; 33:15 Pula "smashes the ball low past Amado"; 50:00 "Amado's clearance flies in as the buzzer goes"; Spain's
 *    fourth title in a row, sixth overall.
 *  - UEFA.com match report "Spain champions again" (12 Feb 2012; uefa-futsaleuro2012-final-report.txt): Russia 1–3 Spain after extra time,
 *    Arena Zagreb, 11/02/2012 21:00 CET; Pula 33:15, Lozano 39:26 & 47:58, Luis Amado 50:00; "Spain captain Amado − featuring in his sixth
 *    showpiece"; Amado parried a Cirilo snapshot; "Amado's palms were warmed again by Cirilo".
 *    http://www.uefa.com/futsaleuro/season=2012/matches/round=2000150/match=2008820/postmatch/report/index.html
 *  - Wikipedia, "Luis Amado (futsal player)" (raw, fetched Sep 2026; wiki-luis-amado-futsal.txt): goalkeeper, born 1976, Inter Movistar,
 *    134–135 caps; world champion 2000 (Guatemala) and 2004 (Chinese Taipei); five UEFA Futsal Championships incl. 2012.
 *  - Wikipedia, "2000 FIFA Futsal World Championship" / "2004 …" (raw): finals Spain 4–3 Brazil (3 Dec 2000) and Spain 2–1 Italy
 *    (5 Dec 2004) — checked; neither page (nor anything reachable) describes an Amado save in words, so those finals are not used.
 *  - Wikipedia, "UEFA Futsal Euro 2012" (raw, cached): Arena Zagreb, 15,024 seats.
 * CONFIRMED: match, date, venue, Russia v Spain, 0–0 at the time (first goal 33:15), minute 30:31–30:32, shooter Sergei Abramov, a point-blank
 *  effort saved by Luis Amado, Abramov's frustration, a Russia corner right after (30:33), Amado Spain's captain, the crowd behind Spain,
 *  Spain winning 3–1 after extra time.
 * INFERRED (not named in the narration): how the save was made (set, square, the ball striking his hands/chest and flying past the near post
 *  for the corner); where Abramov shot from (about 4 m out, right foot) and the passes before it; every other player's position; kits —
 *  Spain red shirts / navy shorts / red socks, Russia white shirts / navy shorts / white socks, Amado in a yellow keeper top with long
 *  sleeves and navy long legs (the athlete library has no trousers: navy shorts + navy socks); no captain's armband (the library has none);
 *  the blue court; which end; Amado's short dark hair and shirt number (not drawn). No video was reviewed.
 *  Chapters 3–4 are a coaching demonstration of positioning (training kit in chapter 3), not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike and the block). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 * z → −Z. Abramov strikes with the right foot (inferred); the ball's contact point IS the solved midpoint of Amado's palms in the block pose,
 * so hands and ball always meet.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Amado's top, lights, diagram lines), red (Spain, posts, arrows), blue (court, training top), navy (key line, run-off, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2012 final',text:'The 2012 Futsal Euro final: Russia against Spain, no goals yet. Sergei Abramov shoots from close range, but Luis Amado is already there. Saved!',tail:2.4,
  cues:['The 2012','Russia against','no goals','Sergei Abramov','close range','Luis Amado','already there','Saved'],heads:{'The 2012':'Euro final 2012','no goals':'0–0','Saved':'Saved!'}},
 {label:'Replay: the goal-line camera',text:'Watch again. Set before the shot, feet still. The ball hits him, out for a corner. Spain went on to win, three to one!',tail:2.2,
  cues:['Watch again','Set before','feet still','ball hits him','out for a corner','Spain went on','three to one'],heads:{'feet still':'Set early','three to one':'Spain 3–1'}},
 {label:'How he does it (demo)',text:'How he does it: move while the ball moves, and stand between the ball and the middle of your goal. Then the shot comes to you.',tail:2.2,
  cues:['How he does it','move while','stand between','middle of your goal','Then the shot','comes to you'],heads:{'How he does it':'How he does it','middle of your goal':'On the line'}},
 {label:'Practise it',text:'Be in the right place early, and saves become easier. Move first, then set!',tail:2.8,
  cues:['Be in','place early','saves become','Move first','then set'],heads:{'place early':'Early!','then set':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/luis-amado-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/luis-amado-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/luis-amado-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('luis-amado: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('luis-amado: no cue '+w);return c.at;};
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
const quad3=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};
type XZ=[number,number];
const unit=(dx:number,dz:number):XZ=>{const l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];};

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
/** a boot print on the floor at (X,Z), turned to yaw (our stage) */
function bootPrint(st:Stage,X:number,Z:number,yaw:number,g:number,seed:number):Path2D{const c=Math.cos(yaw),sn=Math.sin(yaw),q:Pt[]=[];
 for(let i=0;i<16;i++){const a=i/16*TAU,lx=Math.cos(a)*.15*g,lz=Math.sin(a)*.055*g*(Math.cos(a)>0?1.05:.85);q.push(proj(st,X+lx*c-lz*sn,0,Z+lx*sn+lz*c));}void seed;return polyPath(q,true);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.86],[R,.3]];
/** Luis Amado: a yellow keeper top, long sleeves, navy long legs, white gloves, short dark hair (all inferred; no number drawn) */
const KBUILD={height:1.82,bulk:1.04};
const AMADO:AthleteStyle={shirt:Y,shorts:K,socks:K,boots:K,skin:SKIN,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:KBUILD,seed:1};
/** the demonstration keeper (chapter 3): the same keeper in a blue training top (no match is claimed) */
const AMADO_TRAIN:AthleteStyle={...AMADO,shirt:B,trim:'paper',seed:2};
/** Spain outfield: red shirts, navy shorts, red socks (inferred) */
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:Y,hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Russia: white shirts, navy shorts (inferred); Sergei Abramov */
const RUS=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.84],[R,.28]],hair:K,line:K,trim:R,hairStyle:n%2?'short':'bald',build:{height:1.74+hash(n,3)*.1},seed:20+n});
const SBUILD={height:1.78,bulk:1.02};
const ABRAMOV:AthleteStyle={...RUS(1),hairStyle:'short',build:SBUILD,seed:29};
/** the demonstration shooter (chapters 3): a paper training bib over navy */
const DEMO_S:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.78},seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact (library coords, place at the origin, turned to yaw) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),SBUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}

// ---------------- the keeper's moves: the set, the side-shuffle, the rock-steady block, the chest catch ----------------
const SET0=keeperSet(0);
/** a side-shuffle step: the stance opens and closes (ph loops), weight low, hands up — the keeper keeps his set while he moves */
function shuffle(ph:number):Pose{const o=.5+.5*Math.sin(ph*TAU);return{...SET0,lHipA:SET0.lHipA+.24*o,rHipA:SET0.rHipA+.24*(1-o),air:.02*Math.abs(Math.sin(ph*TAU))};}
/** the block: wide, low and still, both palms forward at chest height — the ball comes to him */
const BLOCK=posed({lHipF:44,rHipF:44,lHipA:24,rHipA:24,lKnee:50,rKnee:50,lAnk:-4,rAnk:-4,lean:14,pitch:4,lShF:68,rShF:68,lShA:20,rShA:20,lElb:26,rElb:26,lShR:6,rShR:6,lHand:1,rHand:1,neckP:-8});
/** the recoil: the ball has gone off his palms, arms thrown up and out, weight still on both feet */
const RECOIL=posed({lHipF:36,rHipF:36,lHipA:22,rHipA:22,lKnee:40,rKnee:40,lean:4,pitch:-2,lShF:96,rShF:84,lShA:36,rShA:30,lElb:16,rElb:20,lHand:1,rHand:1,neckP:-16});
/** a clenched-fist "come on" to his team (captain), then a clap */
const FIST=posed({lHipF:14,rHipF:14,lKnee:20,rKnee:20,lean:6,rShF:40,rShA:40,rElb:120,lShA:20,lElb:40,neckP:-10});
const CLAP=(t:number)=>{const o=.5+.5*Math.sin(t*TAU*2.2);return posed({lHipF:12,rHipF:12,lKnee:16,rKnee:16,lean:6,lShF:62,rShF:62,lShA:14+22*o,rShA:14+22*o,lElb:64,rElb:64,lShR:-30,rShR:-30,neckP:-4});};
/** a chest catch: the ball arrives in the W of his hands, then is gathered in */
const CATCH=posed({lHipF:30,rHipF:30,lHipA:16,rHipA:16,lKnee:36,rKnee:36,lean:18,pitch:4,lShF:50,rShF:50,lShA:6,rShA:6,lElb:96,rElb:96,lShR:-20,rShR:-20,lHand:1,rHand:1,neckP:6});
/** the ball point in front of the palms at the block (our coords) for a keeper at (X,Z) turned to yaw */
function palmsAt(pose:Pose,X:number,Z:number,yaw:number):V3{const sk=solve(pose,KBUILD,placeAt(X,Z,yaw)),l=toMine(sk.lHa),r=toMine(sk.rHa),f=[Math.cos(yaw),Math.sin(yaw)];return[(l[0]+r[0])/2+f[0]*.13,(l[1]+r[1])/2,(l[2]+r[2])/2+f[1]*.13];}
/** Abramov's frustration: both hands to his head */
const HANDS_HEAD=posed({lHipF:8,rHipF:8,lKnee:10,rKnee:10,lean:-6,lShF:120,rShF:120,lShA:50,rShA:50,lElb:140,rElb:140,neckP:-22});

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
/** stepped navy rows, lit faces; the crowd is behind Spain (UEFA commentary): mostly red and yellow shirts; roof lights; cheer lifts heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.32)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.5)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
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

// ---- the LIVE world (chapters 1–2): the court seen from the main stand; Spain's goal (Amado's) at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5,GC:XZ=[GOAL_X,10];
/** the court floor + lines + far boards/stands, the goal; any camera that looks along +Z (broadcast or goal-line) */
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
 sideGoal(s,st);o.keeper?.();sidePosts(s,st);
}
function sideGoal(s:Sheet,st:Stage){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>proj(st,GOAL_X-lerp(Db,Dt,Yh/H),Yh,Z);
 const hull=[proj(st,GOAL_X,0,POST_N),proj(st,GOAL_X,H,POST_N),proj(st,GOAL_X,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0),back(POST_N,H)];
 const np=polyPath(hull,true);s.knockout(np,.5);s.fill(K,np,.18);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.4)for(const Z of[POST_N,POST_F]){const a=proj(st,GOAL_X,Yh,Z),b=back(Z,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
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

// ================= chapter 1 — LIVE: the 2012 final, 30:31; Russia's passes, Amado moves with them, Abramov point-blank, saved =================
const C1={russia:A(0,'Russia'),none:A(0,'no goals'),abr:A(0,'Sergei'),close:A(0,'close'),amado:A(0,'Luis'),there:A(0,'already'),saved:A(0,'Saved'),end:AUTH[0].seconds};
/** the play (inferred): the near-side man → across to the far wing → the wing slides it into Abramov, 4 m out → point-blank, right foot */
const A0:XZ=[-10.6,5.2],BW:XZ=[-12.1,16.1],B2:XZ=[-12.8,15.3],RECV:XZ=[-15.45,12.5],SHOT:XZ=[-15.75,12.3];
const P1=[C1.russia+.05,C1.russia+1.15],P2=[C1.abr-.35,C1.abr+.3];
const T_HIT=Math.max(C1.close+.05,P2[1]+.5),T_SAVE=T_HIT+.2,T_OUT=T_SAVE+.55,T_REST=T_OUT+.9;
/** where the keeper stands for a ball at p: on the line from the middle of the goal to the ball, a metre off his line */
const kpos=(p:XZ,d=1.05):XZ=>{const u=unit(p[0]-GC[0],p[1]-GC[1]);return[GC[0]+u[0]*d,GC[1]+u[1]*d];};
const KS=kpos(SHOT),YK=yawTo(SHOT[0]-KS[0],SHOT[1]-KS[1]);
/** the ball meets the MIDDLE of his palms at the block (solved from the skeleton) */
const HANDS=palmsAt(BLOCK,KS[0],KS[1],YK);
/** off the palms, up and past the near post, over the goal line for the corner (Russia's corner, 30:33) */
const DEFL_MID:V3=[GOAL_X+.1,2.05,7.5],DEFL_END:V3=[GOAL_X-1.1,.6,6.1],REST:V3=[GOAL_X-2.0,BALL_R,5.3];
const YAW_SHOT=yawTo(HANDS[0]-SHOT[0],HANDS[2]-SHOT[1]);
const SB=toMine(strikeBall(YAW_SHOT)),PLANT:XZ=[SHOT[0]-SB[0],SHOT[1]-SB[2]];
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 const roll=(a:XZ,b:XZ,t0:number,t1:number)=>{const u=sm(t0,t1,T,easeOut);return{X:lerp(a[0],b[0],u),Y:BALL_R,Z:lerp(a[1],b[1],u),flying:false,spin:u*8};};
 if(T<P1[0]){const w=.08*Math.sin(T*5);return{X:A0[0]-.42+w,Y:BALL_R,Z:A0[1]+.1,flying:false,spin:T*3};}
 if(T<P1[1]+.05)return roll([A0[0]-.42,A0[1]+.1],[BW[0]+.35,BW[1]-.35],P1[0],P1[1]);
 if(T<P2[0]){const u=sm(P1[1]+.1,P2[0]-.05,T,easeIO);return{X:lerp(BW[0]+.35,B2[0]-.42,u),Y:BALL_R,Z:lerp(BW[1]-.35,B2[1]-.28,u),flying:false,spin:8+u*6};}
 if(T<P2[1]+.02)return roll([B2[0]-.42,B2[1]-.28],RECV,P2[0],P2[1]);
 if(T<T_HIT){const u=sm(P2[1],T_HIT-.12,T,easeOut);return{X:lerp(RECV[0],SHOT[0],u),Y:BALL_R,Z:lerp(RECV[1],SHOT[1],u),flying:false,spin:14+u*4};}
 if(T<T_SAVE){const u=sm(T_HIT,T_SAVE,T,linear);return{X:lerp(SHOT[0],HANDS[0],u),Y:lerp(BALL_R,HANDS[1],u*u),Z:lerp(SHOT[1],HANDS[2],u),flying:true,spin:20+u*20};}
 if(T<T_OUT){const q=quad3(HANDS,DEFL_MID,DEFL_END,sm(T_SAVE,T_OUT,T,linear));return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:40};}
 const u=sm(T_OUT,T_REST,T,easeOut),bo=Math.abs(Math.sin(u*Math.PI*2))*.3*(1-u);return{X:lerp(DEFL_END[0],REST[0],u),Y:lerp(DEFL_END[1],BALL_R,Math.min(1,u*2.5))+bo,Z:lerp(DEFL_END[2],REST[2],u),flying:false,spin:40+u*10};
}
/** Amado: moves with every pass and ARRIVES before each ball does (early), sets still, blocks, recoil, back to set, a fist, a clap */
const KA=kpos(A0),KB=kpos(B2),K_SET=P2[1]-.2;
function keeperXZ(T:number):XZ{return[key(T,mono([[0,KA[0]],[P1[0],KA[0]],[P1[1]-.25,KB[0],easeIO],[P2[0],KB[0]],[K_SET,KS[0],easeIO],[T_REST,KS[0]],[C1.end,KS[0]+.35,easeIO]])),
 key(T,mono([[0,KA[1]],[P1[0],KA[1]],[P1[1]-.25,KB[1],easeIO],[P2[0],KB[1]],[K_SET,KS[1],easeIO],[T_REST,KS[1]],[C1.end,KS[1]-.2,easeIO]]))];}
const moving=(T:number)=>(T>P1[0]&&T<P1[1]-.2)||(T>P2[0]&&T<K_SET);
const liveK:Gen=T=>{const[X,Z]=keeperXZ(T),bb=liveBall(Math.min(T,T_HIT));let yaw=T<T_SAVE?yawTo(bb.X-X,bb.Z-Z):YK;let pose:Pose;
 if(T<T_HIT-.12){const set=T>=K_SET?keeperSet((K_SET)*1.2):keeperSet(T*1.2);pose=moving(T)?blendPose(set,shuffle(T*2.6),.85):set;}
 else if(T<T_SAVE+.3)pose=keyPoses(T,[[T_HIT-.12,keeperSet(K_SET*1.2)],[T_SAVE,BLOCK],[T_SAVE+.3,RECOIL]]);
 else if(T<C1.saved)pose=keyPoses(T,[[T_SAVE+.3,RECOIL],[T_SAVE+.8,SET0],[Math.max(T_SAVE+.85,C1.saved-.05),stand()]]);
 else{pose=blendPose(stand(),FIST,sm(C1.saved,C1.saved+.3,T,easeOutBack));pose=blendPose(pose,CLAP(T),sm(C1.saved+1.1,C1.saved+1.4,T));yaw=lerp(YK,FACE_CAMERA+.9,sm(C1.saved,C1.saved+.6,T,easeIO));}
 return{pose,yaw,X,Z};};
/** Abramov (Russia): drifts in from the far side → opens to receive → cushions it → right-foot strike → both hands to his head */
const S_T0=T_HIT-.55;
const liveAb:Gen=T=>{
 const stT=key(T,[[S_T0,.12],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,1]],linear);
 const X=key(T,mono([[0,-13.3],[P2[0]-.3,-14.2,easeIO],[P2[1],PLANT[0]+.5,easeIO],[T_HIT,PLANT[0],easeOut],[T_HIT+.5,PLANT[0]-.3,easeOut],[C1.end,PLANT[0]+.4,easeIO]]));
 const Z=key(T,mono([[0,14.4],[P2[0]-.3,13.8,easeIO],[P2[1],PLANT[1]+.3,easeIO],[T_HIT,PLANT[1],easeOut],[T_HIT+.5,PLANT[1]-.2,easeOut],[C1.end,PLANT[1]+.2,easeIO]]));
 let pose:Pose,yaw=yawTo(-1,-.35);
 if(T<P2[0]-.3)pose=blendPose(runCycle(T*runCadence(.3),{speed:.3}),stand(),sm(P2[0]-1,P2[0]-.3,T));
 else if(T<S_T0){pose=blendPose(runCycle(T*runCadence(.4),{speed:.4}),posed({lHipF:26,lKnee:30,rKnee:24,lean:12,neckP:22,lShA:36,rShA:30,lElb:40,rElb:40}),sm(P2[1]-.25,S_T0,T));yaw=lerp(yawTo(-1,-.35),yawTo(B2[0]-RECV[0],B2[1]-RECV[1]),sm(P2[0]-.3,P2[1]-.1,T));}
 else if(T<T_SAVE+.5){pose=strike(stT,{foot:'r'});yaw=lerp(yawTo(B2[0]-RECV[0],B2[1]-RECV[1]),YAW_SHOT,sm(S_T0,S_T0+.25,T));}
 else{pose=blendPose(strike(1,{foot:'r'}),HANDS_HEAD,sm(T_SAVE+.5,T_SAVE+1,T,easeIO));yaw=YAW_SHOT;}
 return{pose,yaw,X,Z};};
/** the rest of Russia (white): the near-side man (first pass), the far wing (second pass), the pivot on the near post */
const RUS_POS:XZ[]=[A0,BW,[-16.2,4.4]];
const liveRus=(i:number):Gen=>T=>{
 if(i===0){const kick=pulse(T,P1[0]-.08,.3),X=key(T,[[0,A0[0]],[P1[0],A0[0]],[C1.end,-12.6,easeIO]]),Z=key(T,[[0,A0[1]],[P1[0],A0[1]],[C1.end,7.4,easeIO]]);
  let pose=T<P1[0]?dribble(T*1.3,{foot:'r',speed:.15}):blendPose(runCycle(T*runCadence(.3),{speed:.3}),stand(),sm(C1.end-1.5,C1.end,T));pose=blendPose(pose,posed({lHipF:-10,rHipF:44,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2));
  return{pose,yaw:T<P1[0]+.3?yawTo(BW[0]-A0[0],BW[1]-A0[1]):yawTo(-1,.4),X,Z};}
 if(i===1){const kick=pulse(T,P2[0]-.08,.3),X=key(T,mono([[0,BW[0]+.8],[P1[1]-.2,BW[0],easeIO],[P2[0],B2[0],easeIO],[C1.end,B2[0]-1.2,easeIO]])),Z=key(T,mono([[0,BW[1]+.4],[P1[1]-.2,BW[1],easeIO],[P2[0],B2[1],easeIO],[C1.end,B2[1]-.6,easeIO]]));
  let pose=T<P1[1]-.2?blendPose(stand(),runCycle(T*runCadence(.3),{speed:.3}),.6):T<P2[0]?dribble((T-P1[1])*1.4+.2,{foot:'r',speed:.2}):stand();pose=blendPose(pose,posed({lHipF:-10,rHipF:40,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2));
  if(T>T_SAVE+.3)pose=blendPose(pose,HANDS_HEAD,.6*sm(T_SAVE+.3,T_SAVE+.8,T));
  return{pose,yaw:T<P2[0]+.3?yawTo(RECV[0]-B2[0],RECV[1]-B2[1]):FACE_LEFT,X,Z};}
 const[x0,z0]=RUS_POS[2];return{pose:blendPose(backpedal(T*1.1),stand(),.5),yaw:FACE_RIGHT+.3,X:x0+.3*Math.sin(T*.8),Z:z0+.4*sm(P2[0],T_HIT,T)};};
/** Spain (red): a compact four that slide with the ball; the man on Abramov lunges too late; after the save they clap their keeper */
type Mark={x:number[];z:number[];ph:number};
const SPAIN:Mark[]=[{x:[-12.8,-13.2,-13.6],z:[6.6,13.2,14.4],ph:.1},{x:[-14.2,-14.8,-16.4],z:[12.2,13.6,13.35],ph:.4},{x:[-16.9,-17.0,-17.1],z:[5.1,5.3,5.2],ph:.7},{x:[-13.4,-13.0,-12.6],z:[9.6,10.6,10.9],ph:.2}];
const spainAt=(m:Mark,T:number):XZ=>{const u1=sm(P1[0],P1[1]+.3,T),u2=sm(P2[0],P2[1]+.3,T);return[lerp(lerp(m.x[0],m.x[1],u1),m.x[2],u2),lerp(lerp(m.z[0],m.z[1],u1),m.z[2],u2)];};
const liveSpain=(i:number):Gen=>T=>{const m=SPAIN[i],[X,Z]=spainAt(m,T),post=sm(C1.saved+.2,C1.saved+.8,T);let pose=backpedal(T*1.4+m.ph);
 if(i===1){const lu=key(T,[[T_HIT-.3,0],[T_HIT+.1,.6],[T_HIT+.6,1]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_HIT-.4,T_HIT-.25,T));}
 pose=blendPose(pose,CLAP(T+i*.2),post);
 const face=i===1?yawTo(SHOT[0]-X,SHOT[1]-Z):FACE_RIGHT+(i===2?.4:-.2);
 return{pose,yaw:lerp(face,yawTo(KS[0]-X,KS[1]-Z),post),X,Z};};
const liveCam=(T:number)=>({x:key(T,mono([[0,-13.6],[P1[1],-14.4],[P2[0],-15.2],[T_HIT,-18.0],[T_SAVE+.3,-18.9],[T_REST,-19.1],[C1.end,-18.2]]),easeInOutSine),
 zoom:key(T,mono([[0,.66],[P1[1],.68],[P2[0],.74],[T_HIT,.92],[T_SAVE+.4,.96],[C1.saved+.2,.92],[C1.end,.84]]),easeInOutSine),
 y:key(T,mono([[0,1050],[P2[0],1045],[T_HIT,1035],[C1.end,1040]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st:Stage={F:4500,eye:6,cx:c.x,cz:-13},hit=pulse(Tc,T_SAVE,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T);
 court(s,st,T,{cheer:T>=T_SAVE?.9*(1-.4*sm(C1.end-1.2,C1.end,T)):.12,flash:.6*pulse(T,T_SAVE,1.2),
  keeper:()=>{if(b.X<GOAL_X){const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.4);ball(s,p[0],p[1],r,18,{rot:b.spin});}}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 SPAIN.forEach((_,i)=>{const g=liveSpain(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i),{detail:'low'})});});
 RUS_POS.forEach((_,i)=>{const g=liveRus(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,RUS(i+2),{detail:'low'})});});
 items.push({z:liveAb(T).Z,draw:()=>athlete(s,st,liveAb,T,ABRAMOV,{smear:T>T_HIT-.2&&T<T_HIT+.2?.1:0})});
 items.push({z:liveK(T).Z,draw:()=>athlete(s,st,liveK,T,AMADO,{smear:T>T_SAVE-.05&&T<T_SAVE+.3?.1:0})});
 if(b.X>=GOAL_X)items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45/(1+b.Y));
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.45:0,dir:Math.atan2(p[1]-proj(st,liveBall(T-.05).X,liveBall(T-.05).Y,liveBall(T-.05).Z)[1],p[0]-proj(st,liveBall(T-.05).X,liveBall(T-.05).Y,liveBall(T-.05).Z)[0])});
  if(T>=T_SAVE&&T<T_SAVE+.35)sparkBurst(s,Y,p[0],p[1],r*3.2,{n:10,seed:19,g:easeOut(sm(T_SAVE,T_SAVE+.25,T))});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** Amado's chest (the passage enters his yellow top) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,KBUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts({F:4500,eye:6,cx:liveCam(tc).x,cz:-13},liveK(tt),.12));},still:T_SAVE+.05};

// ================= chapter 2 — REPLAY: the goal-line camera, slow motion; set early, feet still, the ball hits him, the corner; 3–1 =================
const C2={watch:A(1,'Watch'),set:A(1,'Set before'),feet:A(1,'feet still'),hits:A(1,'ball hits'),corner:A(1,'out for'),went:A(1,'Spain went'),three:A(1,'three to'),end:AUTH[1].seconds};
/** replay clock → live time: slow motion (≈ .35×) from Abramov receiving to the ball over the line, then real time */
const R0=Math.max(K_SET-.9,P2[0]+.1);
const rLive=(t:number)=>key(t,mono([[0,R0],[C2.hits+.1,T_SAVE,linear],[C2.corner+.7,T_OUT+.05,linear],[C2.end,T_OUT+.05+(C2.end-C2.corner-.7)*.8,linear]]),linear);
/** the goal-line camera: low (1.25 m), just outside the near post on the goal-line extension, looking along the line */
const st2=(t:number):Stage=>({F:1500,eye:1.25+.35*sm(C2.went-.3,C2.went+.8,t,easeIO),cx:-21.35,cz:3.1-1.4*sm(C2.went-.3,C2.went+.8,t,easeIO)});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),T=rLive(tt),st=st2(tt),hit=pulse(t,C2.hits+.1,.45);
  const kp=liveK(T),kg=proj(st,kp.X,0,kp.Z),kx=kg[0];
  camPath(s,t,[[0,kx+200,-40,1.02],[C2.set,kx+110,-60,1.22],[C2.feet,kx+30,40,1.3],[C2.hits-.2,kx+140,-40,1.18],[C2.corner,kx-60,-70,1.08],[C2.went,kx+120,60,.95],[C2.end,kx+140,70,.92]],[7*hit*Math.sin(t*90),5*hit*Math.cos(t*77)]);
  const b=liveBall(T),goalCheer=sm(C2.went,C2.went+.6,tt);
  court(s,st,tt,{cheer:.2+.8*goalCheer,flash:.8*pulse(tt,C2.three,1.4),keeper:()=>{if(b.X<GOAL_X){ballOn(s,st,b.X,b.Y,b.Z,97,{rot:b.spin*.4});}}});
  // "set before the shot": a yellow halo round him; "feet still": two red boot prints stamp under his boots and stay
  const halo=sm(C2.set,C2.set+.35,tt,easeOut)*(1-sm(C2.hits-.1,C2.hits+.2,tt)),h=1.82*kAt(st,kp.Z);
  if(halo>.02)s.fill(Y,ribbon(blob(kg[0],kg[1]-h*.5,h*.42*halo,h*.6*halo,91,{n:24}),8,{seed:94,close:true,wobble:1}),.9);
  const prints=easeOutBack(sm(C2.feet,C2.feet+.3,tt))*(1-sm(C2.went-.2,C2.went+.3,tt));
  if(prints>.02){const sk=solve(kp.pose,KBUILD,placeAt(kp.X,kp.Z,kp.yaw)),l=toMine(sk.lAn),r=toMine(sk.rAn),pp=new Path2D();pp.addPath(bootPrint(st,l[0],l[2],kp.yaw,1.25*prints,1));pp.addPath(bootPrint(st,r[0],r[2],kp.yaw,1.25*prints,2));s.knockout(pp);s.fill(R,pp,.9);}
  // "flies out for a corner": the deflection's dashed flight line and arrow, past the near post
  if(T>T_SAVE){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=liveBall(lerp(T_SAVE,Math.min(T,T_OUT+.3),k/14));pts.push(proj(st,q.X,q.Y,q.Z));}const fade=1-sm(C2.went,C2.went+.4,tt);if(fade>.02){dashed(s,Y,pts,10,95,{dash:40,cov:fade});if(T>T_OUT-.1)arrowHead(s,Y,pts,32,fade);}}
  type It={z:number;draw:()=>void};const items:It[]=[];
  SPAIN.forEach((_,i)=>{if(i!==1)return;const g=liveSpain(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i),{detail:'mid'})});});
  items.push({z:liveAb(T).Z,draw:()=>athlete(s,st,liveAb,T,ABRAMOV,{detail:'mid',smear:T>T_HIT-.2&&T<T_HIT+.2?.08:0})});
  items.push({z:kp.Z,draw:()=>athlete(s,st,liveK,T,AMADO,{detail:'high',smear:T>T_SAVE-.03&&T<T_SAVE+.3?.08:0})});
  if(b.X>=GOAL_X)items.push({z:b.Z-.05,draw:()=>{const r=ballOn(s,st,b.X,b.Y,b.Z,97,{min:10,rot:b.spin*.4,smear:b.flying?.3:0,dir:b.Z<HANDS[2]?Math.PI*.8:0});
   if(T>=T_SAVE&&T<T_SAVE+.3)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3,{n:11,seed:98,g:easeOut(sm(T_SAVE,T_SAVE+.25,T))});}});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "Spain went on to win": red, yellow and paper confetti over the stands
  if(tt>=C2.went){const u=sm(C2.went,C2.went+2.5,tt,linear),top=proj(st,0,4,BOARDS)[1];confetti(s,[R,Y,'paper'],[kx-900,top-300+u*420,1800,420],26,Math.floor(tt*6),{size:15});}
 },
 aperture(t0){const{tt}=clock(1,t0),T=rLive(tt),st=st2(tt),a=liveK(T);return aperture(chestPts(st,a,.12));},
 still:C2.hits+.15,
};

// ================= chapter 3 — HOW HE DOES IT (demonstration, training kit; high end-stand camera behind the goal) =================
const C3={how:A(2,'How'),move:A(2,'move while'),between:A(2,'stand between'),middle:A(2,'middle'),shot:A(2,'Then the'),comes:A(2,'comes to'),end:AUTH[2].seconds};
/** demo world: goal line Z = 0 (posts X = ±1.5), the court runs away from the camera; the camera is high in the end stand */
const st3:Stage={F:1500,eye:6.4,cx:0,cz:-9};
const G3:XZ=[0,0];
const kpos3=(p:XZ,d=1.05):XZ=>{const u=unit(p[0]-G3[0],p[1]-G3[1]);return[u[0]*d,u[1]*d];};
/** the attacker's ball path: carried across the top of the D from his left to his right, then a touch inside and the shot */
const D3={s0:0,go:C3.move-.1,arrive:C3.between-.05,shot:C3.shot+.25};
const SP1:XZ=[-5.1,5.6],SP2:XZ=[3.4,6.4],SP3:XZ=[2.3,5.2];
function demoBallXZ(t:number):XZ{
 if(t<D3.go)return SP1;
 if(t<D3.arrive){const u=sm(D3.go,D3.arrive,t,easeIO),m:XZ=[-.6,7.4],a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*SP1[0]+b*m[0]+c*SP2[0],a*SP1[1]+b*m[1]+c*SP2[1]];}
 if(t<D3.shot-.4)return SP2;
 const u=sm(D3.shot-.4,D3.shot-.1,t,easeOut);return[lerp(SP2[0],SP3[0],u),lerp(SP2[1],SP3[1],u)];
}
const K3S=kpos3(SP3),Y3=yawTo(SP3[0]-K3S[0],SP3[1]-K3S[1]),CATCH3=palmsAt(CATCH,K3S[0],K3S[1],Y3);
const T3_HIT=D3.shot,T3_IN=T3_HIT+.42;
function demoBall(t:number):{X:number;Y:number;Z:number;flying:boolean}{
 if(t<T3_HIT){const[X,Z]=demoBallXZ(t);return{X,Y:BALL_R,Z,flying:false};}
 if(t<T3_IN){const u=sm(T3_HIT,T3_IN,t,linear);return{X:lerp(SP3[0],CATCH3[0],u),Y:lerp(BALL_R,CATCH3[1],Math.sqrt(u)),Z:lerp(SP3[1],CATCH3[2],u),flying:true};}
 const sk=solve(demoK(t).pose,KBUILD,placeAt(K3S[0],K3S[1],Y3)),l=toMine(sk.lHa),r=toMine(sk.rHa);return{X:(l[0]+r[0])/2+Math.cos(Y3)*.1,Y:(l[1]+r[1])/2,Z:(l[2]+r[2])/2+Math.sin(Y3)*.1,flying:false};
}
/** the keeper follows the ball's line every step (a little ahead of it: he arrives first), sets, and the shot comes into his hands */
const demoK:Gen=t=>{const lead=demoBallXZ(Math.min(t+.35,T3_HIT)),[X,Z]=t<T3_HIT-.2?kpos3(lead):K3S,bxz=demoBallXZ(Math.min(t,T3_HIT));
 const mv=t>D3.go-.1&&t<D3.arrive+.1||(t>D3.shot-.6&&t<T3_HIT-.25);let pose=mv?blendPose(keeperSet(t*1.2),shuffle(t*2.8),.85):keeperSet(t*1.2);
 if(t>=T3_HIT-.25)pose=keyPoses(t,[[T3_HIT-.25,keeperSet(0)],[T3_IN,CATCH],[T3_IN+.5,blendPose(CATCH,posed({lHipF:12,rHipF:12,lKnee:16,rKnee:16,lean:6,lShF:40,rShF:40,lShA:6,rShA:6,lElb:120,rElb:120,lShR:-30,rShR:-30,neckP:10}),.8)]]);
 return{pose,yaw:t<T3_HIT?yawTo(bxz[0]-X,bxz[1]-Z):Y3,X,Z};};
/** the attacker (paper training bib): carries the ball across, cuts inside, strikes right-footed at the keeper */
const Y3S=yawTo(CATCH3[0]-SP3[0],CATCH3[2]-SP3[1]),SB3=toMine(strikeBall(Y3S)),PL3:XZ=[SP3[0]-SB3[0],SP3[1]-SB3[2]];
const demoS:Gen=t=>{const bxz=demoBallXZ(Math.min(t,T3_HIT-.05)),dir=unit(bxz[0]-demoBallXZ(Math.max(0,t-.2))[0],bxz[1]-demoBallXZ(Math.max(0,t-.2))[1]);
 if(t<D3.shot-.55){const moving=t>D3.go&&t<D3.arrive||t>D3.shot-.4;const pose=moving?dribble(t*1.5,{foot:'r',speed:.3}):blendPose(stand(),dribble(t*.6,{foot:'r',speed:.1}),.4);
  const face=moving&&Math.hypot(dir[0],dir[1])>.5?yawTo(dir[0],dir[1]):yawTo(-bxz[0],-bxz[1]);return{pose,yaw:face,X:bxz[0]+.42*Math.cos(face+Math.PI),Z:bxz[1]+.42*Math.sin(face+Math.PI)};}
 const stT=key(t,[[D3.shot-.55,.1],[T3_HIT,STRIKE_CONTACT],[T3_HIT+.6,1]],linear);return{pose:strike(stT,{foot:'r'}),yaw:Y3S,X:PL3[0],Z:PL3[1]};};
function demoCourt(s:Sheet,st:Stage,t:number){
 const span=9000,wallZ=41.5,wall=proj(st,0,0,wallZ)[1];
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const cz=polyPath(floorQuad(st,-10,0,10,40),true);s.knockout(cz,.25);s.fill(B,cz,.82);
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([-1.5-6*Math.cos(a),6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([1.5+6*Math.cos(a),6*Math.sin(a)]);}
 for(const seg of[[[-10,0],[10,0]],[[-10,0],[-10,40]],[[10,0],[10,40]],[[-10,20],[10,20]],[[-10,40],[10,40]]] as Pt[][])lineOn(lines,st,seg);
 lineOn(lines,st,arc);lines.addPath(polyPath(floorRing(st,0,6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,20+Math.sin(a)*3]);}lineOn(lines,st,cc);
 s.knockout(lines,.94);
 farWall(s,st,wallZ,t,0,0);
}
/** the goal seen from behind and above: posts + bar (red bands), the net as a light mesh printed OVER the keeper (we look through it) */
function goalFromBehind(s:Sheet,st:Stage){
 const H=2,Db=.95,Dt=.55,Lx=-1.5,Rx=1.5,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,-lerp(Db,Dt,Yh/H));
 const mesh=new Path2D();
 for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}const c=proj(st,X,H,0);mesh.lineTo(c[0],c[1]);}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const X of[Lx,Rx])for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,X,Yh,0),b=back(X,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 const floorNet=polyPath([proj(st,Lx,0,0),proj(st,Rx,0,0),back(Rx,0),back(Lx,0)],true);s.fill(K,floorNet,.14);
 s.stroke(K,mesh,Math.max(1.4,kAt(st,0)*.014),.45);
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,0)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 for(const X of[Lx,Rx]){const P=(Yh:number,dx:number):Pt=>proj(st,X+dx,Yh,0);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2)bands.addPath(polyPath([P(k/8*H,-w),P(k/8*H,w),P((k+1)/8*H,w),P((k+1)/8*H,-w)],true));}
 const Bb=(X:number,dy:number):Pt=>proj(st,X,H+dy,0);quad([Bb(Lx,-w),Bb(Rx,-w),Bb(Rx,w),Bb(Lx,w)]);
 for(let k=0;k<12;k+=2){const x0=lerp(Lx,Rx,k/12),x1=lerp(Lx,Rx,(k+1)/12);bands.addPath(polyPath([Bb(x0,-w),Bb(x1,-w),Bb(x1,w),Bb(x0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  camPath(s,t,[[0,-160,760,1.12],[C3.move,-90,780,1.2],[C3.between,40,790,1.28],[C3.middle,60,795,1.3],[C3.shot,90,800,1.34],[C3.comes,60,815,1.42],[C3.end,40,820,1.42]]);
  demoCourt(s,st,tt);
  const bxz=demoBallXZ(Math.min(tt,T3_HIT)),k=demoK(tt);
  // "stand between the ball and the middle of your goal": the triangle ball → posts (yellow screen) and the middle line (navy dashes)
  const tri=sm(C3.between,C3.between+.45,tt,easeOut)*(1-sm(C3.comes+.2,C3.comes+.7,tt));
  if(tri>.02){const b0=proj(st,bxz[0],0,bxz[1]),p1=proj(st,-1.5,0,0),p2=proj(st,1.5,0,0),tp=polyPath([b0,L2(b0,p1,tri),L2(b0,p2,tri)],true);s.knockout(tp,.5*tri);s.fill(Y,tp,.55*tri);
   const e=new Path2D();e.addPath(ribbon([b0,L2(b0,p1,tri)],7,{seed:331,taper:0,wobble:.8}));e.addPath(ribbon([b0,L2(b0,p2,tri)],7,{seed:332,taper:0,wobble:.8}));s.fill(Y,e);}
  const mid=sm(C3.middle,C3.middle+.5,tt,easeOut)*(1-sm(C3.comes+.2,C3.comes+.7,tt));
  if(mid>.02){const pts=[proj(st,bxz[0],0,bxz[1]),proj(st,bxz[0]*.5,0,bxz[1]*.5),proj(st,0,0,0)];dashed(s,K,pts,10,333,{dash:34,progress:mid});
   floorDashRing(s,st,R,k.X,k.Z,.42,8,334,easeOutBack(sm(C3.middle+.2,C3.middle+.55,tt)));}
  // "move while the ball moves": his path along the arc (red dashes + arrow) drawn as he shuffles
  const mvA=sm(C3.move,C3.move+.3,tt)*(1-sm(C3.middle,C3.middle+.4,tt));
  if(mvA>.02){const pts:Pt[]=[];for(let q=0;q<=12;q++){const p=kpos3(demoBallXZ(Math.min(lerp(D3.go,Math.min(tt+.35,D3.arrive),q/12),T3_HIT)));pts.push(proj(st,p[0],0,p[1]));}dashed(s,R,pts,9,335,{dash:26,cov:mvA});arrowHead(s,R,pts,26,mvA);}
  // "the shot comes to you": the flight line into his hands
  if(tt>T3_HIT){const pts:Pt[]=[];for(let q=0;q<=10;q++){const b=demoBall(lerp(T3_HIT,Math.min(tt,T3_IN),q/10));pts.push(proj(st,b.X,b.Y,b.Z));}dashed(s,Y,pts,9,336,{dash:30,cov:1-sm(C3.end-1,C3.end-.4,tt)});}
  const b=demoBall(tt);
  const items:{z:number;draw:()=>void}[]=[
   {z:demoS(tt).Z,draw:()=>athlete(s,st,demoS,tt,DEMO_S,{detail:'mid',smear:tt>T3_HIT-.2&&tt<T3_HIT+.2?.1:0})},
   {z:k.Z,draw:()=>athlete(s,st,demoK,tt,AMADO_TRAIN,{detail:'high'})},
   {z:tt<T3_IN?b.Z+(b.flying?0:.02):k.Z-.3,draw:()=>{ballOn(s,st,b.X,b.Y,b.Z,337,{min:10,rot:tt*5,smear:b.flying?.3:0,dir:-Math.PI/2});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=T3_IN&&tt<T3_IN+.5){const p=proj(st,b.X,b.Y,b.Z);sparkBurst(s,Y,p[0],p[1],90,{n:9,seed:338,g:easeOut(sm(T3_IN,T3_IN+.25,tt))*(1-sm(T3_IN+.3,T3_IN+.5,tt))});}
  goalFromBehind(s,st);
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoK(tt),.13));},
 still:C3.middle+.6,
};

// ================= chapter 4 — PRACTISE: facing him on his line; watch, move first, set; three cards; an easy catch; a tick =================
const C4={be:A(3,'Be in'),early:A(3,'place early'),saves:A(3,'saves'),move:A(3,'Move'),set:A(3,'then set'),end:AUTH[3].seconds};
const GZ=11,WALLZ=13.4;
const st4:Stage={F:1500,eye:1.4,cx:0,cz:4};
/** three ball spots on an arc about 3 m out (a coach's drill): the ball lights up at one spot after another, he gets there first */
const SPOTS:XZ[]=[[-1.4,GZ-2.7],[0,GZ-2.9],[1.4,GZ-2.7]];
const GC4:XZ=[0,GZ];
const kpos4=(p:XZ):XZ=>{const u=unit(p[0]-GC4[0],p[1]-GC4[1]);return[GC4[0]+u[0]*.95,GC4[1]+u[1]*.95];};
const lit=(t:number)=>t<C4.early?0:t<C4.move?1:2;
const practiceK:Gen=t=>{const[X0,Z0]=kpos4(SPOTS[0]),[X1,Z1]=kpos4(SPOTS[1]),[X2,Z2]=kpos4(SPOTS[2]);
 const X=key(t,mono([[0,X0],[C4.early-.3,X0],[C4.early+.2,X1,easeIO],[C4.move-.15,X1],[C4.move+.35,X2,easeIO]])),Z=key(t,mono([[0,Z0],[C4.early-.3,Z0],[C4.early+.2,Z1,easeIO],[C4.move-.15,Z1],[C4.move+.35,Z2,easeIO]]));
 const mv=(t>C4.early-.3&&t<C4.early+.2)||(t>C4.move-.15&&t<C4.move+.35);let pose=mv?blendPose(keeperSet(t*1.2),shuffle(t*2.8),.85):keeperSet(t>C4.set?C4.set*1.2:t*1.2);
 const catchT=C4.set+.55;if(t>catchT-.3)pose=keyPoses(t,[[catchT-.3,pose],[catchT,CATCH],[catchT+.6,blendPose(CATCH,stand(),.4)]]);
 const s=SPOTS[lit(t)];return{pose,yaw:yawTo(s[0]-X,s[1]-Z),X,Z};};
const CARD_Y=-335,CARD_W=120,CARDS:[number,number,string][]=[[-400,C4.be+.1,'watch'],[0,C4.move,'move'],[400,C4.set,'set']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  camPath(s,t,[[0,0,30,1.02],[C4.early,0,20,1.0],[C4.saves,0,10,.98],[C4.move,0,10,.98],[C4.set+.4,0,20,1.02],[C4.end,0,30,1.06]]);
  // the court facing the goal end: floor, paper lines (goal line and D), the far boards and stands, the goal
  const span=6000,wall=proj(st,0,0,WALLZ)[1];
  s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
  const cz=polyPath(floorQuad(st,-10,-30,10,GZ),true);s.knockout(cz,.25);s.fill(B,cz,.82);
  const lines=new Path2D(),arcPts:Pt[]=[];
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
  lineOn(lines,st,[[-10,GZ],[10,GZ]]);lineOn(lines,st,arcPts);s.knockout(lines,.94);
  farWall(s,st,WALLZ,tt,.25*pulse(tt,C4.set+.55,1.2),0);
  goalEnd(s,st);
  // the three spots; the lit one gets a yellow ring; "Move first": a red arrow from where he was to where he goes
  const lt=lit(tt),spots=new Path2D();SPOTS.forEach(([X,Z])=>spots.addPath(polyPath(floorRing(st,X,Z,.16,14),true)));s.knockout(spots);s.fill(R,spots,.5);
  floorDashRing(s,st,Y,SPOTS[lt][0],SPOTS[lt][1],.38,8,401+lt,easeOutBack(sm([0,C4.early,C4.move][lt],[0,C4.early,C4.move][lt]+.3,tt)));
  const arr=sm(C4.move-.2,C4.move+.3,tt,easeOut)*(1-sm(C4.set+.2,C4.set+.6,tt));
  if(arr>.02){const a=kpos4(SPOTS[1]),b=kpos4(SPOTS[2]),pts=[proj(st,a[0],0,a[1]-.1),proj(st,(a[0]+b[0])/2,0,(a[1]+b[1])/2-.35),proj(st,b[0],0,b[1]-.1)];dashed(s,R,pts,10,405,{progress:arr,dash:30});if(arr>.8)arrowHead(s,R,pts,30);}
  // "then set": red boot prints stamp under his boots
  const kp=practiceK(tt),pr=easeOutBack(sm(C4.set,C4.set+.3,tt));
  if(pr>.02){const sk=solve(kp.pose,KBUILD,placeAt(kp.X,kp.Z,kp.yaw)),l=toMine(sk.lAn),r=toMine(sk.rAn),pp=new Path2D();pp.addPath(bootPrint(st,l[0],l[2],kp.yaw,1.2*pr,1));pp.addPath(bootPrint(st,r[0],r[2],kp.yaw,1.2*pr,2));s.knockout(pp);s.fill(R,pp,.9);}
  // the ball: rolled in from the lit spot straight into his hands on "then set" (the easy save)
  const catchT=C4.set+.55,sp=SPOTS[2],cp=palmsAt(CATCH,kp.X,kp.Z,kp.yaw);let bx=sp[0],by=BALL_R,bz=sp[1];
  if(tt>catchT-.45&&tt<catchT){const u=sm(catchT-.45,catchT,tt,linear);bx=lerp(sp[0],cp[0],u);by=lerp(BALL_R,cp[1],Math.sqrt(u));bz=lerp(sp[1],cp[2],u);}
  else if(tt>=catchT){const sk=solve(kp.pose,KBUILD,placeAt(kp.X,kp.Z,kp.yaw)),l=toMine(sk.lHa),r=toMine(sk.rHa);bx=(l[0]+r[0])/2+Math.cos(kp.yaw)*.1;by=(l[1]+r[1])/2;bz=(l[2]+r[2])/2+Math.sin(kp.yaw)*.1;}
  const show=tt>=C4.move+.35;
  if(show&&bz>kp.Z-.2)ballOn(s,st,bx,by,bz,407,{rot:tt*4});
  athlete(s,st,practiceK,tt,AMADO,{detail:'high'});
  if(show&&bz<=kp.Z-.2)ballOn(s,st,bx,by,bz,407,{rot:tt*4});
  // the three cards: watch the ball · move first · set your feet
  const cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];const ons=CARDS.map(([,t0c])=>sm(t0c-.1,t0c+.3,tt,easeOut));
  CARDS.forEach(([cx],i)=>{if(ons[i]<=.01)return;const dy=(1-ons[i])*-500;const q=handCut([[cx-CARD_W,CARD_Y-125+dy],[cx+CARD_W,CARD_Y-125+dy],[cx+CARD_W,CARD_Y+125+dy],[cx-CARD_W,CARD_Y+125+dy]],70+i,6,60);outline[i]=q;cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
  if(ons.some(o=>o>.01)){s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,,kind],i)=>{if(ons[i]<=.01)return;const dy=(1-ons[i])*-500,gy=CARD_Y+dy+98;
    const fc=figureCam({x:cx+(kind==='move'?-30:0),y:gy,height:180,azimuth:70,elevation:12,fov:18});
    s.save();s.clip(polyPath(outline[i],true));
    const pose=kind==='move'?shuffle(.25):kind==='set'?SET0:keeperSet(.3);
    const P=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    if(kind==='watch'){const e=P([0,1.62,0]),bpt=P([2.2,.3,-.6]);dashed(s,K,[e,L2(e,bpt,.5),bpt],6,81,{dash:18});ball(s,bpt[0],bpt[1],17,82);}
    if(kind==='move'){const a0=P([0,.02,.55]),a1=P([0,.02,-.75]);const pts:Pt[]=[a0,L2(a0,a1,.5),a1];dashed(s,R,pts,8,85,{dash:20});arrowHead(s,R,pts,22);}
    if(kind==='set'){const sk=solve(pose,KBUILD,{}),pp=new Path2D();for(const j of[sk.lAn,sk.rAn]){const c=P([j[0],0,j[2]]);pp.addPath(polyPath(blob(c[0],c[1]+4,26,9,86,{n:14}),true));}s.fill(R,pp,.85);}
    drawAthlete(s,pose,fc,{...AMADO,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "then set": a big blue tick beside him (navy misregistered echo, yellow core)
  const tick=easeOutBack(sm(C4.set+.8,C4.set+1.15,tt));
  if(tick>.02){const g=proj(st,kp.X,0,kp.Z),h=kAt(st,kp.Z)*1.82,c:Pt=[g[0]+h*.62,g[1]-h*.72],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(B,tp);}
 },
 still:C4.set+.9,
};
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

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'luis-amado-futsal-signature',format:'futsal',title:'Luis Amado’s rock-steady save',theme:'Be in the right place early, and the save comes to you.',
 ageNote:'For players aged 7–12: the point-blank save in the 2012 Futsal Euro final is real; how he stands is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball flies in and stops dead in two gloves (paper palms, navy rims); a yellow ring rings out. Reduced motion = at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.28),bx=lerp(x+170,x,easeOut(u)),by=lerp(y-60,y,easeOut(u)),stop=clamp((age-.28)/.5);
  if(age>.28&&stop<1)s.fill(Y,ribbon(blob(x,y,r*(1.2+1.6*stop),r*(1.2+1.6*stop),seed,{n:24}),8*(1-stop)+2,{seed,close:true,wobble:1.2}),1);
  ball(s,bx,by,r,seed,{rot:age*6});
  const g=sm(.18,.3,age);if(g>.02)for(const sx of[-1,1]){const gl=polyPath(blob(x+sx*r*.95,y+r*.1,r*.42*g,r*.6*g,seed+2+sx,{n:16}),true);s.knockout(gl);s.fill(K,ribbon(blob(x+sx*r*.95,y+r*.1,r*.42*g,r*.6*g,seed+2+sx,{n:16}),5,{seed:seed+5,close:true,wobble:.6}),1);}
 },
};
export default film;
