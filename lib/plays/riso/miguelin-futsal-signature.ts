/** Miguelín — "the clever wing pass": a signature-move riso film (iconic plays, FUTSAL; Miguelín is an ala).
 *
 * WHO: the card "Miguelín" (lib/town/playerAppearance.json country "Spain"; playerBios: "Spanish ala from Mallorca who spent a decade at
 *  ElPozo Murcia … European champion with Spain"; strengths "Clever wing passes", "Reads teammates' runs") is Miguel Sayago Martí (born
 *  9 May 1985, Palma de Mallorca), ala / pivot of ElPozo Murcia 2011–21 and Spain No. 11, UEFA Futsal EURO 2012 and 2016 winner and the
 *  EURO 2016 Golden Player. Sources agree on the country and the club; no namesake (not a football player called Miguelín).
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the clever wing pass — not one match. No written source we could
 *  reach describes ONE dated Miguelín assist (UEFA's commentary names his assists only as a Golden Shoe count), so the film follows the brief's
 *  fallback. Chapters 1–2 recreate a REAL Miguelín goal that UEFA's minute-by-minute commentary DOES describe, in a match no other futsal film
 *  uses (Rivillos's film uses the EURO 2016 final; Sergio Lozano's and Luis Amado's the EURO 2012 final): Spain's EURO 2016 opener,
 *  Spain 5–2 Hungary, 2 Feb 2016, Arena Belgrade. At 28:44, with Spain 3–1 up, "Miguelín produces a smashing finish from Alex's cut-back"
 *  (4–1). It shows the other half of a wing pass — arriving on time for it — and he was named the tournament's Golden Player, with "goals and
 *  assists aplenty". Chapters 3–4 are a clearly labelled demonstration ("How he does it") in TRAINING KIT of the card's signature: on the
 *  LEFT wing (card params side:left), look up before the ball arrives, spot the run, and pass inside first time. It is never passed off as
 *  that match.
 *  1  LIVE (broadcast camera, high on the main-stand side, real time): Spain 3–1 Hungary, 28:44. Alex (Spain #9) takes the ball to the byline
 *     on the near side and cuts it back; Miguelín (Spain #11) arrives and smashes it in first time: 4–1.
 *  2  REPLAY (slow motion, LOW at court level on the near side): the cut-back and the first-time finish; Spain win 5–2; later he is named the
 *     EURO's best player (Golden Player).
 *  3  HOW HE DOES IT (demonstration, training kit, neutral defender and keeper, camera high behind the play): the fixo plays it up the left
 *     wing; while the ball travels Miguelín looks up (a yellow look-line to the runner); the ball arrives and he slides it inside first time
 *     for the runner to score.
 *  4  PRACTISE (the lesson, from the entry's `lesson`: "Look up before the ball arrives so you know your next pass."): the same move from a
 *     high coach's-eye angle (not top-down) with the look-line, the runner's arrow and a tick.
 * SOURCES (written; fetched once, 5 s apart, generic User-Agent, cached in scratchpad/films/src-cache/):
 *  - UEFA.com minute-by-minute commentary, Spain 5-2 Hungary, Futsal EURO 2016 group B, 2 Feb 2016 (archived 25 Mar 2016):
 *    https://web.archive.org/web/20160325062023/http://www.uefa.com/futsaleuro/season=2016/matches/round=2000603/match=2018432/postmatch/commentary/index.html
 *    "28:44 Miguelín (Spain) scores! Miguelín produces a smashing finish from Alex's cut-back." Goals 7:03 Németh (o.g., "turns in Bebe's low
 *    centre"), 14:17 Bebe, 19:34 Miguelín ("a neat angled finish … after Bebe got his second assist"), 23:35 Dróth (free-kick), 28:44 Miguelín,
 *    35:13 Andresito, 37:08 Dróth. Line-ups: Spain 1 Paco Sedano (GK), 9 Alex, 11 Miguelín …; Hungary 12 Tóth (GK) …
 *  - Wikipedia "UEFA Futsal Euro 2016" (raw): Spain 5–2 Hungary, 2 Feb 2016, 21:00, Belgrade Arena, attendance 5,100; Miguelín Golden Player
 *    and joint top scorer (6 goals, 4 assists). https://en.wikipedia.org/wiki/UEFA_Futsal_Euro_2016
 *  - UEFA.com "Golden Player 2016: Miguelín" by Paul Saffer (archived 11 May 2017):
 *    https://web.archive.org/web/20170511005321/http://www.uefa.com/futsaleuro/history/season=2016/goldenplayer/index.html
 *    ("the white-haired 30-year-old … led his side whenever he was on the pitch, contributing goals and assists aplenty"; "starting with a 5-2
 *    defeat of Hungary in which Miguelín netted twice").
 *  - Wikipedia "Miguelín" (raw): Miguel Sayago Martí, born 9 May 1985, Palma de Mallorca; Ala; ElPozo Murcia 2011–21.
 *    https://en.wikipedia.org/wiki/Miguel%C3%ADn
 *  - The card entry (lib/town/iconicPlays.json): "Signature: the clever wing pass", template through_ball_assist, side left; the lesson.
 * CONFIRMED: the match, date, venue, the score 3–1 before the goal and 4–1 after it, the minute 28:44, that Alex cut the ball back and Miguelín
 *  finished it ("smashing finish"), the final score 5–2, the numbers (Miguelín 11, Alex 9, Sedano 1, Tóth 12), Miguelín's white hair (UEFA:
 *  "white-haired"), that he was the EURO 2016 Golden Player.
 * INFERRED (not named in the narration): the kits (Spain red shirts / blue shorts / red socks; Hungary white; the keepers' colours), the
 *  court colour, which end Spain attacked, which flank Alex went down (the near side here), where Miguelín shot from (≈ 6 m out, central), that
 *  it was first time and with his right foot, where the ball went in, every other player's position and the keeper's movement. No video was
 *  reviewed. Chapters 3–4 are a demonstration of the card's signature (the left-wing pass, played with the left foot), not footage of any match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `drawPlayer()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the strikes). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (lights, diagram lines, the training bib), red (Spain, rings), blue (court, Spain shorts), navy (key line, run-off, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square);
 * never sheet.safe. Phone heat: 4 plates; wide-shot figures 'low'; ≈130–260 plate ops a frame, more on passage frames. Seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';


// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: Spain v Hungary',text:'Futsal Euro 2016, in Belgrade. Spain lead Hungary three to one. Alex cuts the ball back, and Miguelín smashes it in. Four to one!',tail:2.1,
  cues:['Futsal Euro','Belgrade','Spain lead','three to one','Alex cuts','ball back','smashes it','Four to one'],heads:{'Futsal Euro':'Euro 2016','three to one':'3–1','Four to one':'4–1'}},
 {label:'Replay: first time',text:'Watch again. He arrives on time and hits it first time. Spain win five to two. Later, Miguelín is named best player of the Euro!',tail:2.0,
  cues:['Watch again','arrives on','hits it','first time','Spain win','five to two','Later','best player'],heads:{'five to two':'5–2','best player':'Golden Player'}},
 {label:'How he does it',text:'His trademark: the clever wing pass. How he does it: on the left wing, look up before the ball arrives. Spot the run, and slide it inside!',tail:2.1,
  cues:['His trademark','clever wing','How he','left wing','look up','ball arrives','Spot the','slide it'],heads:{'His trademark':'The wing pass','left wing':''}},
 {label:'Practise it',text:'Practise it! Look up before the ball arrives, so you know your next pass.',tail:2.5,
  cues:['Practise it','Look up','ball arrives','know your','next pass'],heads:{'Look up':'Look up','next pass':'Next pass'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/miguelin-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/miguelin-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/miguelin-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('miguelin: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('miguelin: no cue '+w);return c.at;};
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
const qb=(a:number,m:number,b:number,u:number)=>(1-u)*(1-u)*a+2*u*(1-u)*m+u*u*b;

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the blue court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);void seed;}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24,a0=0,a1=TAU):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/(a1-a0>=TAU-1e-6?n:n-1);out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.84],[R,.3]];
const BUILD={height:1.74,bulk:.98};
/** Miguelín: Spain #11 (UEFA line-up); red shirt, blue shorts, red socks (kit inferred); white hair (UEFA: "the white-haired 30-year-old") */
const MIG:AthleteStyle={shirt:R,shorts:B,socks:R,boots:K,skin:SKIN,hair:'paper',line:K,trim:Y,number:11,numberInk:'paper',hairStyle:'short',build:BUILD,seed:11};
/** Miguelín in the demonstration chapters: a training bib (yellow) over navy, no match kit, no number */
const MIG_TRAIN:AthleteStyle={shirt:Y,shorts:K,socks:K,boots:K,skin:SKIN,hair:'paper',line:K,trim:R,number:null,hairStyle:'short',build:BUILD,seed:11};
/** Alex, Spain #9 (UEFA line-up) — kit inferred as above */
const ALEX:AthleteStyle={shirt:R,shorts:B,socks:R,boots:K,skin:[[Y,.8],[R,.24]],hair:K,line:K,trim:Y,number:9,numberInk:'paper',hairStyle:'short',build:{height:1.78},seed:9};
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:B,socks:R,boots:K,skin:[[Y,.72],[R,.18]],hair:K,line:K,trim:Y,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Hungary: white (inferred) */
const HUN=(n:number):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:[[Y,.8],[R,.24]],hair:K,line:K,trim:R,hairStyle:n%3?'short':'curly',build:{height:1.74+hash(n,3)*.12},seed:20+n});
/** Tóth, Hungary #12 (GK) — keeper kit colour inferred */
const TOTH:AthleteStyle={shirt:[B,.55],shorts:K,socks:K,boots:K,skin:[[Y,.72],[R,.24]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',number:12,numberInk:'paper',hairStyle:'short',build:{height:1.84},seed:62};
/** Paco Sedano, Spain #1 (GK) — keeper kit colour inferred */
const SEDANO:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.72],[R,.2]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',number:1,numberInk:Y,hairStyle:'balding',build:{height:1.8},seed:61};
/** the demonstration: team-mates in the same yellow bibs, a neutral defender and keeper (no team is claimed in chapters 3–4) */
const DEMO_FIXO:AthleteStyle={shirt:Y,shorts:K,socks:K,boots:K,skin:[[Y,.72],[R,.2]],hair:K,line:K,trim:R,number:null,hairStyle:'curly',build:{height:1.8},seed:71};
const DEMO_RUN:AthleteStyle={shirt:Y,shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:R,number:null,hairStyle:'short',build:{height:1.76},seed:72};
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
const DEMO_K:AthleteStyle={shirt:[K,.5],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.22]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:78};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t on stage st (prev = one drawn frame earlier → hair/hem follow-through);
 * smear = motion echo behind fast limbs */
function drawPlayer(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at a strike's contact (our floor coords, place at the origin), for the given foot */
function strikeBall(yaw:number,foot:'l'|'r',power=1):[number,number,number]{const sk=solve(strike(STRIKE_CONTACT,{foot,power}),BUILD,{yaw}),toe=foot==='l'?sk.lToe:sk.rToe,an=foot==='l'?sk.lAn:sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}
/** a player's chest ring (the passage enters the shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.1):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
/** turn a pose's head (degrees, + = left) and a touch of the shoulders with it: the scan */
const lookTurn=(p:Pose,deg:number):Pose=>({...p,neckY:p.neckY+deg*Math.PI/180,twist:p.twist+deg*.25*Math.PI/180,neckP:p.neckP-Math.abs(deg)*.25*Math.PI/180});


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
/** the ball on stage st at (X,Yh,Z) with its floor shadow; an optional yellow trail of earlier positions */
function ballOn(s:Sheet,st:Stage,X:number,Yh:number,Z:number,seed:number,o:{min?:number;rot?:number;smear?:number;dir?:number;trail?:Pt[]}={}){
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15*(1+Yh*.12),r*.3,seed+5,Yh>.5?.22:.45);
 if(o.trail&&o.trail.length>1){const trp=ribbon(o.trail,r*1.4,{seed:seed+7,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
 ball(s,p[0],p[1],r,seed,{rot:o.rot,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, red / yellow / blue shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.1)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.3)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.4)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}

// ---- SIDE court (chapters 1–2): the camera outside the near touchline; Spain's goal at X = −20, Hungary's goal at X = +20 (ends inferred) ----
const TOUCH_FAR=20,BOARDS=21.2,POST_N=8.5,POST_F=11.5,HUN_GOAL=20,ESP_GOAL=-20;
/** the side court: run-off, blue court, lines at both ends, boards + crowd, both goals; `keeper` draws a keeper between net and posts */
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true);s.knockout(court,.25);s.fill(B,court,.82);
 s.fill(B,polyPath(floorQuad(st,-20,6,20,13),true),.12);
 const lines=new Path2D();
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[-20,0],[-20,TOUCH_FAR]],[[20,0],[20,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 for(const gx of[ESP_GOAL,HUN_GOAL]){const dir=gx<0?1:-1,arc:Pt[]=[];
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([gx+dir*6*Math.sin(a),POST_N-6*Math.cos(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([gx+dir*6*Math.sin(a),POST_F+6*Math.cos(a)]);}
  lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const d of[6,10])lines.addPath(polyPath(floorRing(st,gx+dir*d,10,.12,12),true));}
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st,ESP_GOAL,0,10,1);sideGoal(s,st,HUN_GOAL,bulge,bz,by);o.keeper?.();sidePosts(s,st,ESP_GOAL);sidePosts(s,st,HUN_GOAL);
}
/** a goal seen side-on at goal line gx; the net runs away from the court (−X for the left goal, +X for the right) */
function sideGoal(s:Sheet,st:Stage,gx:number,bulge:number,bz:number,by:number){
 const H=2,Db=.95,Dt=.55,out=gx<0?-1:1,back=(Z:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((Z-bz)**2+(Yh-by)**2)/.35);return proj(st,gx+out*(lerp(Db,Dt,Yh/H)+d),Yh,Z);};
 if(Math.abs(proj(st,gx,0,10)[0])>5200)return;
 const hull=[proj(st,gx,0,POST_N),proj(st,gx,H,POST_N),proj(st,gx,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,gx,Yh,POST_N),b=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage,gx:number){
 if(Math.abs(proj(st,gx,0,10)[0])>5200)return;
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,gx+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>proj(st,gx,H+dy,Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---- END court (chapters 3–4, the demonstration): the camera looks along +Z at the goal (centre (0, GZ)), the wall behind it ----
const GZ=11,WALLZ=13.4;
function arena(s:Sheet,st:Stage,o:{cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void}={}){
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

// ================= chapter 1 — LIVE: EURO 2016, Spain 3–1 Hungary, 28'44"; Alex's cut-back, Miguelín's first-time smash, 4–1 =================
const C1={euro:A(0,'Futsal'),belg:A(0,'Belgrade'),lead:A(0,'Spain lead'),three:A(0,'three'),alex:A(0,'Alex'),back:A(0,'ball back'),smash:A(0,'smashes'),four:A(0,'Four'),end:AUTH[0].seconds};
/** the cut-back leaves Alex's boot on "ball back"; Miguelín hits it first time on "smashes"; in the net before "Four to one" */
const T_CB=C1.back+.08,T_HIT=Math.max(T_CB+.72,C1.smash+.12),T_IN=Math.min(T_HIT+.3,C1.four-.15);
/** Alex's dribble: from his own half down the NEAR flank to the byline beside the near post (flank inferred) */
const A0:[number,number]=[-1.5,4.4],AM:[number,number]=[9.5,2.6],CB_BALL:[number,number]=[18.05,6.5];
const YAW_CB=yawTo(-4.3,3.5),CBB=strikeBall(YAW_CB,'r',.45),A1:[number,number]=[CB_BALL[0]-CBB[0],CB_BALL[1]-CBB[2]];
const A_T1=T_CB-.34;
const alexPath=(T:number):[number,number]=>{const u=sm(0,A_T1,T,t=>t);return[qb(A0[0],AM[0],A1[0]-.5,u),qb(A0[1],AM[1],A1[1]-.25,u)];};
/** Miguelín's first-time finish ≈ 6 m out, central (spot inferred); the ball goes in inside the far post, knee height (inferred) */
const SHOT:[number,number]=[14.1,10.05],TGT:V3=[HUN_GOAL+.25,.72,10.95];
const YAW_SHOT=yawTo(TGT[0]-SHOT[0],TGT[2]-SHOT[1]),SB=strikeBall(YAW_SHOT,'r'),PLANT:[number,number]=[SHOT[0]-SB[0],SHOT[1]-SB[2]];
const M0:[number,number]=[1.8,12.2],MJ:[number,number]=[9.2,12.6],M_T1=T_CB-.9;
const migRun=(T:number):[number,number]=>{if(T<M_T1){const u=sm(0,M_T1,T,t=>t);return[lerp(M0[0],MJ[0],u),lerp(M0[1],MJ[1],u)];}const u=sm(M_T1,T_HIT,T,t=>t*(1.25-.25*t));return[lerp(MJ[0],PLANT[0],u),lerp(MJ[1],PLANT[1],u)];};
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 if(T<A_T1){const[x,z]=alexPath(T),a=alexPath(Math.max(0,T-.1)),b=alexPath(T+.1),yw=yawTo(b[0]-a[0],b[1]-a[1]),ph=((T*1.9)%1+1)%1,lead=.42+.2*easeOut(ph);return{X:x+Math.cos(yw)*lead,Y:BALL_R,Z:z+Math.sin(yw)*lead,flying:false,spin:T*9};}
 if(T<T_CB){const[x,z]=alexPath(A_T1),a=alexPath(A_T1-.1),yw=yawTo(x-a[0],z-a[1]),u=sm(A_T1,T_CB-.05,T,easeOut);return{X:lerp(x+Math.cos(yw)*.55,CB_BALL[0],u),Y:BALL_R,Z:lerp(z+Math.sin(yw)*.55,CB_BALL[1],u),flying:false,spin:A_T1*9+u*2};}
 if(T<T_HIT){const u=sm(T_CB,T_HIT,T,t=>t*(1.3-.3*t));return{X:lerp(CB_BALL[0],SHOT[0],u),Y:BALL_R,Z:lerp(CB_BALL[1],SHOT[1],u),flying:false,spin:20+u*9};}
 if(T<T_IN){const u=sm(T_HIT,T_IN,T,linear);return{X:lerp(SHOT[0],TGT[0],u),Y:lerp(BALL_R,TGT[1],u)+.25*Math.sin(u*Math.PI),Z:lerp(SHOT[1],TGT[2],u),flying:true,spin:30+u*20};}
 const d=sm(T_IN,T_IN+.25,T,easeOut),bo=Math.abs(Math.sin(sm(T_IN+.3,T_IN+1.2,T)*Math.PI*2))*.12*(1-sm(T_IN+.3,T_IN+1.2,T));
 return{X:lerp(TGT[0],HUN_GOAL+.8,d),Y:lerp(TGT[1],BALL_R,sm(T_IN+.15,T_IN+.45,T,easeIn))+bo,Z:TGT[2]+.1*d,flying:false,spin:50};
}
/** Alex (#9): dribbles down the near flank, stops at the byline and cuts it back (right foot, inferred), then runs to Miguelín */
const liveAlex:Gen=T=>{
 const cbT=key(T,[[A_T1,.1],[T_CB-.12,.36],[T_CB,STRIKE_CONTACT],[T_CB+.45,1]],linear),[x0,z0]=alexPath(Math.min(T,A_T1)),a=alexPath(Math.max(0,Math.min(T,A_T1)-.1)),b=alexPath(Math.min(T,A_T1)+.1),runYaw=yawTo(b[0]-a[0],b[1]-a[1]);
 let X=x0,Z=z0,pose:Pose,yaw=runYaw;
 if(T<A_T1)pose=dribble(T*1.9,{foot:'r',speed:.7});
 else if(T<T_CB+.5){const u=sm(A_T1,T_CB-.1,T,easeIO);X=lerp(x0,A1[0],u);Z=lerp(z0,A1[1],u);pose=blendPose(dribble(A_T1*1.9,{foot:'r',speed:.7}),strike(cbT,{foot:'r',power:.45}),sm(A_T1,A_T1+.12,T));yaw=lerp(runYaw,YAW_CB,sm(A_T1,T_CB-.12,T,easeIO));}
 else{const g=T-T_CB-.5,m=liveMig(T),u=sm(T_IN,T_IN+1.5,T,easeIO);X=lerp(A1[0],m.X+.9,u);Z=lerp(A1[1],m.Z-.8,u);pose=blendPose(strike(1,{foot:'r',power:.45}),T>T_IN?celebrate(g*1.1,{kind:'run'}):stand(),sm(T_CB+.5,T_CB+.9,T));yaw=T>T_IN?yawTo(m.X-A1[0],m.Z-A1[1]):YAW_CB;}
 return{pose,yaw,X,Z};
};
/** Miguelín (#11): drifts in from the far side, times his run, first-time right-foot smash (inferred foot), wheels away to the near corner */
const CELEB:[number,number]=[17.2,2.2];
const liveMig:Gen=T=>{
 const stT=key(T,[[T_HIT-.42,.12],[T_HIT-.2,.36],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,1]],linear),[x,z]=migRun(Math.min(T,T_HIT)),a=migRun(Math.max(0,Math.min(T,T_HIT)-.1)),b=migRun(Math.min(T,T_HIT)+.1),runYaw=yawTo(b[0]-a[0],b[1]-a[1]);
 let X=x,Z=z,pose:Pose,yaw=runYaw;
 const sp=T<M_T1?.35:.85;
 if(T<T_HIT-.42)pose=runCycle(T*runCadence(sp)+.2,{speed:sp});
 else if(T<T_HIT+.6){pose=blendPose(runCycle((T_HIT-.42)*runCadence(.85)+.2,{speed:.85}),strike(stT,{foot:'r'}),sm(T_HIT-.42,T_HIT-.3,T));yaw=lerp(runYaw,YAW_SHOT,sm(T_HIT-.42,T_HIT-.15,T,easeIO));}
 else{const g=T-T_HIT-.6,u=sm(T_HIT+.6,T_HIT+1.1,T,easeIO),v=sm(T_HIT+.6,T_HIT+3,T,t=>t*(2-t));X=lerp(PLANT[0],CELEB[0],v);Z=lerp(PLANT[1],CELEB[1],v);pose=blendPose(strike(1,{foot:'r'}),celebrate(g*1.2,{kind:'run'}),u);yaw=lerp(YAW_SHOT,yawTo(CELEB[0]-PLANT[0],CELEB[1]-PLANT[1]),u);}
 return{pose,yaw,X,Z};
};
/** Hungary (white; positions inferred): one chases Alex, one covers the middle and lunges too late, one tracks Miguelín a step behind, one high */
const liveHun=(i:number):Gen=>T=>{
 const post=sm(T_IN+.2,T_IN+1.2,T);let X:number,Z:number,pose:Pose,yaw:number;
 if(i===0){const a=liveAlex(Math.min(T,T_CB+.2)),lag=alexPath(Math.max(0,Math.min(T,A_T1)-.55));X=lerp(lag[0],a.X,.35)-1.1;Z=lerp(lag[1],a.Z,.35)+1.2;pose=runCycle(T*runCadence(.7)+.4,{speed:.7*(1-sm(T_CB,T_CB+.6,T))});yaw=yawTo(a.X-X,a.Z-Z);}
 else if(i===1){const u=sm(T_CB,T_HIT,T,easeIO);X=lerp(17.4,16.9,u);Z=lerp(12.2,12.7,u);pose=blendPose(backpedal(T*1.3),lunge(sm(T_HIT-.35,T_HIT+.3,T),{side:'l'}),sm(T_HIT-.45,T_HIT-.3,T));yaw=yawTo(CB_BALL[0]-X,CB_BALL[1]-Z);}
 else if(i===2){const m=migRun(Math.min(T,T_HIT));X=m[0]-2.3;Z=m[1]+1.3;pose=runCycle(T*runCadence(.75)+.7,{speed:.75});yaw=yawTo(1,-.2);}
 else{X=4.5+Math.min(T,T_IN)*.55;Z=7.4;pose=runCycle(T*runCadence(.4)+.1,{speed:.4});yaw=FACE_RIGHT;}
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20}),post);
 return{pose,yaw,X,Z};};
/** Tóth (#12): at the near post for Alex, shuffles across on the cut-back, dives to his right, too late */
const liveGK:Gen=T=>{const across=sm(T_CB,T_HIT,T,easeIO),X=HUN_GOAL-lerp(.75,1.05,across),Z=lerp(8.95,9.7,across);
 let pose=keeperSet(T*1.3);pose=blendPose(pose,keeperDive(sm(T_HIT-.05,T_IN+.7,T,linear)*.9,{side:'r',height:.2}),sm(T_HIT-.1,T_HIT+.05,T));
 return{pose,yaw:yawTo(-1,.25*(1-across)),X,Z};};
/** Spain's other two (red) and Paco Sedano: steady, then they run to Miguelín after the goal */
const ESP_POS:[number,number][]=[[-3.6,13.2],[-7.2,5.6]];
const liveEsp=(i:number):Gen=>T=>{const[x0,z0]=ESP_POS[i],drift=Math.min(T,T_IN)*[1.1,.9][i],go=sm(T_IN+.3,C1.end,T,easeIO),f=liveMig(C1.end);
 const X=lerp(x0+drift,f.X-[1.4,2.2][i],go),Z=lerp(z0,f.Z+[1.2,.2][i],go);
 let pose=runCycle(T*runCadence(.35)+i*.3,{speed:.35});if(go>0)pose=blendPose(pose,celebrate(T*1.1+i*.3,{kind:'run'}),sm(T_IN+.3,T_IN+.7,T));
 return{pose,yaw:go>0?yawTo(f.X-x0,f.Z-z0):FACE_RIGHT,X,Z};};
const liveSedano:Gen=T=>({pose:blendPose(keeperSet(T*1.2),celebrate(T*1.1,{kind:'arms'}),sm(T_IN+.3,T_IN+.8,T)),yaw:FACE_RIGHT,X:ESP_GOAL+1.3,Z:10});
const liveCam=(T:number)=>({x:lerp(alexPath(Math.min(T,A_T1))[0]-.8,16.3,sm(A_T1-1.2,T_HIT+.1,T,easeIO)),
 zoom:key(T,mono([[0,.6],[C1.alex,.62],[A_T1,.7],[T_HIT,.72],[T_IN+.6,.7],[C1.end,.66]]),easeInOutSine),
 y:key(T,mono([[0,1040],[T_HIT,1010],[C1.end,1030]]),easeInOutSine)});
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_HIT,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.12,flash:pulse(T,T_IN,1.2),bulge:netBulge(T),bz:TGT[2],by:TGT[1],
  keeper:()=>{drawPlayer(s,st,liveSedano,T,SEDANO,{detail:'low'});}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 [0,1,2,3].forEach(i=>{const g=liveHun(i);items.push({z:g(T).Z,draw:()=>drawPlayer(s,st,g,T,HUN(i),{detail:'low'})});});
 ESP_POS.forEach((_,i)=>{const g=liveEsp(i);items.push({z:g(T).Z,draw:()=>drawPlayer(s,st,g,T,ESP(i),{detail:'low'})});});
 items.push({z:liveGK(T).Z,draw:()=>drawPlayer(s,st,liveGK,T,TOTH,{detail:'low'})});
 items.push({z:liveAlex(T).Z,draw:()=>drawPlayer(s,st,liveAlex,T,ALEX,{detail:'low'})});
 items.push({z:liveMig(T).Z,draw:()=>drawPlayer(s,st,liveMig,T,MIG,{smear:T>T_HIT-.2&&T<T_HIT+.25?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const tr:Pt[]=[];if(b.flying)for(let k=0;k<=6;k++){const q=liveBall(Math.max(T_HIT,T-.15+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}
  ballOn(s,st,b.X,b.Y,b.Z,18,{rot:b.spin,trail:tr,smear:b.flying?.45:0,dir:-.1});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
const netBulge=(T:number)=>.5*sm(T_IN-.08,T_IN+.08,T)*(1-.6*sm(T_IN+.3,T_IN+1.2,T))+.12*settle(T,T_IN,{amp:1,freq:3,decay:3});
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveMig(tt),.12));},still:C1.smash+.2};

// ================= chapter 2 — REPLAY: slow motion, low at court level on the near side =================
const C2={watch:A(1,'Watch'),arr:A(1,'arrives on'),hits:A(1,'hits it'),first:A(1,'first time'),win:A(1,'Spain win'),five:A(1,'five to'),later:A(1,'Later'),best:A(1,'best player'),end:AUTH[1].seconds};
/** replay clock → live clock: the cut-back on "arrives on", contact on "hits it", in the net on "first time", then the celebration */
const repT=(t:number)=>key(t,[[0,T_CB-1.1],[C2.arr+.1,T_CB+.15],[C2.hits+.12,T_HIT],[C2.first+.3,T_IN],[C2.win,T_IN+.7],[C2.end,T_IN+3.1]],linear);
const st2=(cx:number):Stage=>({F:2600,eye:1.5,cx,cz:-6});
const repCam=(t:number)=>{const T=repT(t),m=liveMig(T),b=liveBall(T),foc=T<T_IN?lerp(m.X,b.X,.45):m.X;
 return{x:key(t,mono([[0,17.3],[C2.arr,16.4],[C2.hits,14.9],[C2.first+.3,16.2],[C2.win,16.4],[C2.later,foc],[C2.end,foc]]),easeInOutSine),
  y:key(t,mono([[0,110],[C2.hits,120],[C2.first,100],[C2.later,60],[C2.best,30],[C2.end,30]]),easeInOutSine),
  zoom:key(t,mono([[0,1.45],[C2.arr,1.6],[C2.hits,1.75],[C2.first,1.5],[C2.win,1.3],[C2.later,1.35],[C2.best,1.5],[C2.end,1.45]]),easeInOutSine)};};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),T=repT(tt),c=repCam(t),st=st2(c.x),net=pulse(T,T_IN,.6),hit=pulse(T,T_HIT,.4);
  cam(s,0,c.y+5*hit*Math.sin(t*90)+4*net*Math.sin(t*60),c.zoom);
  const b=liveBall(T),goal=T>=T_IN;
  courtSide(s,st,T,{cheer:goal?1:.1,flash:pulse(tt,C2.win,1.4)+pulse(T,T_IN,1),bulge:netBulge(T),bz:TGT[2],by:TGT[1],keeper:()=>{}});
  // "arrives on": a yellow ring on the spot he runs into; the cut-back draws as a dashed yellow line behind the ball;
  // "hits it": sparks at contact; "first time": the red dashed shot line; "Spain win": confetti; "best player": a yellow star-burst round him
  const ring=easeOutBack(sm(C2.arr-.1,C2.arr+.3,tt))*(1-sm(C2.first+.2,C2.first+.6,tt));if(ring>.02)floorDashRing(s,st,Y,SHOT[0],SHOT[1],.8,10,211,ring);
  if(T>T_CB){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=liveBall(lerp(T_CB,Math.min(T,T_HIT),k/10));pts.push(proj(st,q.X,.02,q.Z));}dashed(s,Y,pts,10,212,{dash:36});if(T>=T_HIT)arrowHead(s,Y,pts,30,213);}
  if(T>T_HIT&&tt<C2.later){const pts:Pt[]=[];for(let k=0;k<=8;k++){const q=liveBall(lerp(T_HIT,Math.min(T,T_IN),k/8));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,R,pts,11,214,{dash:40});}
  type It={z:number;draw:()=>void};const items:It[]=[];
  items.push({z:liveGK(T).Z,draw:()=>drawPlayer(s,st,liveGK,T,TOTH,{detail:'mid'})});
  [1,2].forEach(i=>{const g=liveHun(i);items.push({z:g(T).Z,draw:()=>drawPlayer(s,st,g,T,HUN(i),{detail:'mid'})});});
  items.push({z:liveAlex(T).Z,draw:()=>drawPlayer(s,st,liveAlex,T,ALEX,{detail:'mid'})});
  items.push({z:liveMig(T).Z,draw:()=>drawPlayer(s,st,liveMig,T,MIG,{detail:'high',smear:T>T_HIT-.3&&T<T_HIT+.2?.2:0})});
  items.push({z:b.Z-.05,draw:()=>{ballOn(s,st,b.X,b.Y,b.Z,97,{rot:tt*5,smear:b.flying?.3:0,dir:-.1});if(T>=T_HIT&&T<T_HIT+.3){const p=proj(st,b.X,b.Y,b.Z);sparkBurst(s,Y,p[0],p[1],80,{n:9,seed:98,g:easeOut(sm(T_HIT,T_HIT+.25,T))});}}});
  items.sort((a,c2)=>c2.z-a.z).forEach(it=>it.draw());
  if(T>=T_IN&&T<T_IN+1){const p=proj(st,TGT[0],TGT[1],TGT[2]);sparkBurst(s,Y,p[0],p[1],150,{n:12,seed:99,g:easeOut(sm(T_IN,T_IN+.3,T))*(1-sm(T_IN+.6,T_IN+1,T))});}
  if(tt>=C2.win){const u=sm(C2.win,C2.win+2.4,tt,linear),top=proj(st,c.x,6,BOARDS)[1];confetti(s,[R,Y,'paper'],[-900,top-200+u*500,1800,420],26,Math.floor(tt*6),{size:16});}
  if(tt>=C2.best-.1){const g=easeOutBack(sm(C2.best-.1,C2.best+.4,tt)),m=liveMig(T),p=proj(st,m.X,2.05,m.Z);sparkBurst(s,Y,p[0],p[1]-30,260*g,{n:16,seed:215,g:.55+.45*g,width:16});}
 },
 aperture(t0){const{tt,tc}=clock(1,t0);return aperture(chestPts(st2(repCam(tc).x),liveMig(repT(tt)),.13));},
 still:C2.hits+.1,
};

// ================= the DEMONSTRATION (chapters 3–4): left wing → look up while the ball travels → first-time pass inside → the runner scores =================
/** canonical demo seconds (real speed): fixo's pass PC, Miguelín's first-time pass DC, the runner's finish RC, in the net DIN */
const PC=.5,DC=1.75,RC=DC+.95,DIN=RC+.3;
const F_BALL:[number,number]=[-1.6,GZ-13.2],RCV:[number,number]=[-7,GZ-9],PT:[number,number]=[.35,GZ-3.7],G_T:V3=[.95,.42,GZ+.02];
const F_YAW=yawTo(RCV[0]-F_BALL[0],RCV[1]-F_BALL[1]),FB=strikeBall(F_YAW,'r',.45),F_PLANT:[number,number]=[F_BALL[0]-FB[0],F_BALL[1]-FB[2]];
const P_YAW=yawTo(PT[0]-RCV[0],PT[1]-RCV[1]),PB=strikeBall(P_YAW,'l',.4),M_PLANT:[number,number]=[RCV[0]-PB[0],RCV[1]-PB[2]];
const R_YAW=yawTo(G_T[0]-PT[0],G_T[2]-PT[1]),RB=strikeBall(R_YAW,'r',.55),R_PLANT:[number,number]=[PT[0]-RB[0],PT[1]-RB[2]];
const DM0:[number,number]=[-8.3,GZ-12],DR0:[number,number]=[1.8,GZ-11.4],DR_MID:[number,number]=[2,GZ-7.2];
/** the look: while the ball travels to him he turns his head to the runner (screen right), then back to the ball */
const LOOK0=PC+.1,LOOK1=DC-.35;
const lookW=(d:number)=>sm(LOOK0,LOOK0+.25,d,easeIO)*(1-sm(LOOK1,LOOK1+.2,d,easeIO));
const demoFixo:Gen=d=>{const stT=key(d,[[0,.12],[PC-.2,.34],[PC,STRIKE_CONTACT],[PC+.55,1]],linear);let pose=blendPose(stand(),strike(stT,{foot:'r',power:.45}),sm(-.1,.1,d));
 if(d>PC+.55)pose=blendPose(strike(1,{foot:'r',power:.45}),runCycle((d-PC)*runCadence(.3),{speed:.3}),sm(PC+.55,PC+.9,d));
 const g=Math.max(0,d-PC-.6);return{pose,yaw:lerp(F_YAW,yawTo(.7,1),sm(PC+.55,PC+.9,d)),X:F_PLANT[0]+g*.6,Z:F_PLANT[1]+g*.8};};
const migDemoPos=(d:number):[number,number]=>{if(d<DC){const u=sm(0,DC,d,t=>t*(1.2-.2*t));return[lerp(DM0[0],M_PLANT[0],u),lerp(DM0[1],M_PLANT[1],u)];}const g=d-DC-.45;return g>0?[M_PLANT[0]+g*.9,M_PLANT[1]+g*2.4]:M_PLANT;};
const demoMig:Gen=d=>{
 const[X,Z]=migDemoPos(d),runYaw=yawTo(M_PLANT[0]-DM0[0],M_PLANT[1]-DM0[1]),stT=key(d,[[DC-.38,.14],[DC-.18,.36],[DC,STRIKE_CONTACT],[DC+.45,1]],linear);
 let pose:Pose,yaw=runYaw;
 if(d<DC-.38)pose=runCycle(d*runCadence(.45)+.3,{speed:.45});
 else if(d<DC+.45){pose=blendPose(runCycle((DC-.38)*runCadence(.45)+.3,{speed:.45}),strike(stT,{foot:'l',power:.4}),sm(DC-.38,DC-.26,d));yaw=lerp(runYaw,P_YAW,sm(DC-.38,DC-.12,d,easeIO));}
 else{const u=sm(DC+.45,DC+.8,d,easeIO);pose=blendPose(strike(1,{foot:'l',power:.4}),runCycle((d-DC)*runCadence(.4),{speed:.4}),u);yaw=lerp(P_YAW,yawTo(.9,2.4),u);if(d>DIN)pose=blendPose(pose,celebrate((d-DIN)*1.2,{kind:'arms'}),sm(DIN,DIN+.3,d));}
 const w=lookW(d);if(w>0)pose=lookTurn(pose,-72*w);
 return{pose,yaw,X,Z};
};
const runPos=(d:number):[number,number]=>{if(d<RC){const u=sm(0,RC,d,t=>t*(.8+.2*t));return[qb(DR0[0],DR_MID[0],R_PLANT[0],u),qb(DR0[1],DR_MID[1],R_PLANT[1],u)];}return R_PLANT;};
const demoRun:Gen=d=>{
 const[X,Z]=runPos(d),a=runPos(Math.max(0,Math.min(d,RC-.4)-.1)),b=runPos(Math.min(d,RC-.4)+.1),runYaw=yawTo(b[0]-a[0],b[1]-a[1]),stT=key(d,[[RC-.36,.14],[RC-.16,.36],[RC,STRIKE_CONTACT],[RC+.5,1]],linear);
 let pose:Pose,yaw=runYaw;
 if(d<RC-.36)pose=runCycle(d*runCadence(.7)+.6,{speed:.7});
 else if(d<RC+.55){pose=blendPose(runCycle((RC-.36)*runCadence(.7)+.6,{speed:.7}),strike(stT,{foot:'r',power:.55}),sm(RC-.36,RC-.24,d));yaw=lerp(runYaw,R_YAW,sm(RC-.36,RC-.12,d,easeIO));}
 else{const u=sm(RC+.55,RC+.9,d,easeIO);pose=blendPose(strike(1,{foot:'r',power:.55}),celebrate((d-RC)*1.2,{kind:'arms'}),u);yaw=lerp(R_YAW,FACE_CAMERA-.6,u);}
 return{pose,yaw,X,Z};
};
function demoBall(d:number):{X:number;Y:number;Z:number;flying:boolean}{
 if(d<PC)return{X:F_BALL[0],Y:BALL_R,Z:F_BALL[1],flying:false};
 if(d<DC){const u=sm(PC,DC,d,t=>t*(1.25-.25*t));return{X:lerp(F_BALL[0],RCV[0],u),Y:BALL_R,Z:lerp(F_BALL[1],RCV[1],u),flying:false};}
 if(d<RC){const u=sm(DC,RC,d,t=>t*(1.2-.2*t));return{X:lerp(RCV[0],PT[0],u),Y:BALL_R,Z:lerp(RCV[1],PT[1],u),flying:false};}
 if(d<DIN){const u=sm(RC,DIN,d,linear);return{X:lerp(PT[0],G_T[0],u),Y:lerp(BALL_R,G_T[1],u),Z:lerp(PT[1],G_T[2],u),flying:true};}
 const u=sm(DIN,DIN+.3,d,easeIn);return{X:G_T[0],Y:lerp(G_T[1],BALL_R,u)+Math.abs(Math.sin(sm(DIN+.3,DIN+1.1,d)*Math.PI))*.08*(1-sm(DIN+.3,DIN+1.1,d)),Z:GZ+.5*u+.02,flying:false};
}
/** the demo defender marks Miguelín, jabs at the pass a moment too late */
const demoDef:Gen=d=>{const[mx,mz]=migDemoPos(Math.min(d,DC)),X=mx+1.6,Z=mz+2.4;const lu=key(d,[[DC-.1,0],[DC+.3,.6],[DC+1.3,.85]],linear);
 let pose=backpedal(d*1.2);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(DC-.2,DC-.05,d));
 return{pose,yaw:yawTo(mx-X,mz-Z),X,Z};};
/** the demo keeper: cheats toward the near post while the ball is on the wing, shuffles across on the pass, dives too late */
const demoGK:Gen=d=>{const across=sm(DC,RC,d,easeIO),dv=sm(RC-.05,DIN+.6,d,linear)*.85;let pose=keeperSet(d*1.3);pose=blendPose(pose,keeperDive(dv,{side:'l',height:.1}),sm(RC-.1,RC+.05,d));
 return{pose,yaw:FACE_CAMERA-.35*(1-across),X:lerp(-.75,.1,across),Z:GZ-.7};};
/** the look-line: a dashed yellow line from his eyes to the runner, and a ring on the runner */
function lookLine(s:Sheet,st:Stage,d:number,g:number,w:number,seed:number){if(g<=.02)return;const m=demoMig(d),r=demoRun(d),a=proj(st,m.X,1.62,m.Z),b=proj(st,r.X,1.3,r.Z);
 dashed(s,Y,[a,L2(a,b,.5),b],w,seed,{dash:w*3.6,progress:g});if(g>.9){const rr=kAt(st,r.Z)*.55;s.fill(Y,ribbon(blob(b[0],b[1],rr,rr,seed+1,{n:20}),w*.8,{seed:seed+2,close:true,wobble:1}),1);}}
/** the runner's run (floor arrow) */
function runArrow(s:Sheet,st:Stage,g:number,w:number,seed:number){if(g<=.02)return;const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=runPos(lerp(DC-.3,RC,k/12));pts.push(proj(st,q[0],0,q[1]));}dashed(s,Y,pts,w,seed,{dash:w*3.4,progress:g});if(g>.9)arrowHead(s,Y,pts,w*3.2,seed+1);}
/** the pass line (floor), drawn as the ball travels */
function passLine(s:Sheet,st:Stage,d:number,w:number,seed:number){if(d<=DC)return;const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=demoBall(lerp(DC,Math.min(d,RC),k/12));pts.push(proj(st,q.X,.02,q.Z));}dashed(s,R,pts,w,seed,{dash:w*3.6});if(d>=RC)arrowHead(s,R,pts,w*3,seed+1);}
/** draw the demo players and ball back to front on stage st at demo time d */
function demoCast(s:Sheet,st:Stage,d:number,detail:'mid'|'high'){
 const b=demoBall(d),items:{z:number;draw:()=>void}[]=[
  {z:demoFixo(d).Z,draw:()=>drawPlayer(s,st,demoFixo,d,DEMO_FIXO,{detail:'mid'})},
  {z:demoDef(d).Z,draw:()=>drawPlayer(s,st,demoDef,d,DEMO_D,{detail:'mid'})},
  {z:demoRun(d).Z,draw:()=>drawPlayer(s,st,demoRun,d,DEMO_RUN,{detail:'mid',smear:d>RC-.25&&d<RC+.2?.15:0})},
  {z:demoMig(d).Z+.001,draw:()=>drawPlayer(s,st,demoMig,d,MIG_TRAIN,{detail,smear:d>DC-.25&&d<DC+.2?.15:0})},
  {z:b.Z-.02,draw:()=>{ballOn(s,st,b.X,b.Y,b.Z,311,{rot:d*7,smear:b.flying?.3:0,dir:-Math.PI/2});if(d>=DC&&d<DC+.3){const p=proj(st,b.X,b.Y,b.Z);sparkBurst(s,Y,p[0],p[1],80,{n:9,seed:312,g:easeOut(sm(DC,DC+.25,d))});}}},
 ];
 items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
 if(d>=DIN&&d<DIN+.9){const p=proj(st,G_T[0],G_T[1],GZ+.3);sparkBurst(s,Y,p[0],p[1],110,{n:11,seed:313,g:easeOut(sm(DIN,DIN+.3,d))*(1-sm(DIN+.5,DIN+.9,d))});}
}
const netOf=(d:number)=>.5*sm(DIN-.08,DIN+.08,d)*(1-.6*sm(DIN+.3,DIN+1.2,d))+.1*settle(d,DIN,{amp:1,freq:3,decay:3});

// ================= chapter 3 — HOW HE DOES IT (demonstration, training kit): left wing, look up, the ball arrives, spot the run, slide it inside =================
const C3={mark:A(2,'His trademark'),clever:A(2,'clever'),how:A(2,'How he'),left:A(2,'left wing'),look:A(2,'look up'),arr:A(2,'ball arrives'),spot:A(2,'Spot the'),slide:A(2,'slide it'),end:AUTH[2].seconds};
/** chapter time → demo time: a slow build-up, the fixo's pass on "left wing", the look on "look up", the ball nearly there on "ball arrives",
 * held (slow) while the run is drawn on "Spot the run", the first-time pass on "slide it", the goal at the end */
const d3=(t:number)=>key(t,[[0,0],[C3.left,PC-.12],[C3.left+.4,PC+.05],[C3.look+.3,LOOK0+.35],[C3.arr+.3,DC-.2],[C3.spot+.5,DC-.1],[C3.slide+.12,DC+.02],[C3.end-.5,DIN+.5],[C3.end,DIN+.8]],linear);
const st3:Stage={F:1800,eye:5,cx:-3,cz:GZ-26};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,d=d3(tt),dc=d3(t),M=demoMig(dc),Rn=demoRun(dc),Fx=demoFixo(dc),mg=proj(st,M.X,.9,M.Z),rg=proj(st,Rn.X,.9,Rn.Z),fg=proj(st,Fx.X,.9,Fx.Z),gg=proj(st,0,.9,GZ-1.5);
  const P=(a:Pt,b:Pt,u:number,z:number):[number,number,number]=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),z];
  camPath(s,t,[[0,...P(mg,fg,.55,1.45)],[C3.how,...P(mg,fg,.45,1.45)],[C3.look,...P(mg,rg,.5,1.2)],[C3.spot,...P(mg,rg,.5,1.18)],[C3.slide,...P(mg,gg,.5,1.15)],[C3.end,...P(rg,gg,.4,1.4)]]);
  arena(s,st,{t:tt,cheer:.4*pulse(d,DIN,1.5),flash:pulse(d,DIN,1),bulge:netOf(d),bx:G_T[0],by:G_T[1],keeper:stg=>{drawPlayer(s,stg,demoGK,d,DEMO_K,{detail:'mid'});}});
  // "clever wing": a yellow ring on his receiving spot on the wing; "left wing": the fixo's pass line; "look up": the look-line to the runner;
  // "ball arrives": a red ring round the ball at his feet; "Spot the": the runner's arrow; "slide it": the red pass line
  const wing=easeOutBack(sm(C3.clever,C3.clever+.35,tt))*(1-sm(C3.arr+.2,C3.arr+.6,tt));if(wing>.02)floorDashRing(s,st,Y,RCV[0],RCV[1],.9,10,321,wing);
  if(d>PC&&d<DC+.3){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=demoBall(lerp(PC,Math.min(d,DC),k/10));pts.push(proj(st,q.X,.02,q.Z));}dashed(s,Y,pts,9,322,{dash:32,cov:.8});}
  lookLine(s,st,d,sm(C3.look-.05,C3.look+.35,tt,easeOut)*(1-sm(C3.slide,C3.slide+.3,tt)),11,323);
  const ar=easeOutBack(sm(C3.arr+.1,C3.arr+.4,tt))*(1-sm(C3.slide,C3.slide+.3,tt));if(ar>.02){const b=demoBall(d);floorDashRing(s,st,R,b.X,b.Z,.45,10,324,ar);}
  runArrow(s,st,sm(C3.spot-.05,C3.spot+.6,tt,easeOut),11,325);
  passLine(s,st,d,11,327);
  demoCast(s,st,d,'high');
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoMig(d3(tt)),.13));},
 still:C3.look+.4,
};

// ================= chapter 4 — PRACTISE: the lesson on the court (coach's-eye, high behind; not top-down) =================
const C4={prac:A(3,'Practise'),look:A(3,'Look up'),arr:A(3,'ball arrives'),know:A(3,'know your'),next:A(3,'next pass'),end:AUTH[3].seconds};
const d4=(t:number)=>key(t,[[0,.05],[C4.look,PC+.1],[C4.arr+.3,DC-.12],[C4.know+.3,DC-.05],[C4.next+.1,DC+.03],[C4.end-.4,DIN+.5],[C4.end,DIN+.8]],linear);
const st4:Stage={F:1800,eye:10.5,cx:-2.5,cz:GZ-27};
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,d=d4(tt),mid=proj(st,-3,0,GZ-7.5);
  camPath(s,t,[[0,mid[0]-10,mid[1]-10,1.4],[C4.look,mid[0]+20,mid[1]-40,1.32],[C4.next,mid[0]+90,mid[1]-90,1.26],[C4.end,mid[0]+110,mid[1]-110,1.26]]);
  arena(s,st,{t:tt,cheer:.8*pulse(tt,C4.end-.9,1.4),flash:pulse(d,DIN,1),bulge:netOf(d),bx:G_T[0],by:G_T[1],keeper:stg=>{drawPlayer(s,stg,demoGK,d,DEMO_K,{detail:'mid'});}});
  // "Look up": the look-line; "ball arrives": the red ring at his feet; "know your": the runner's arrow; "next pass": the pass line + a big tick
  lookLine(s,st,d,sm(C4.look-.05,C4.look+.35,tt,easeOut)*(1-sm(C4.next+.3,C4.next+.6,tt)),12,401);
  const ar=easeOutBack(sm(C4.arr,C4.arr+.3,tt))*(1-sm(C4.next+.2,C4.next+.5,tt));if(ar>.02){const b=demoBall(d);floorDashRing(s,st,R,b.X,b.Z,.45,11,402,ar);}
  runArrow(s,st,sm(C4.know-.05,C4.know+.5,tt,easeOut),12,403);
  passLine(s,st,d,12,405);
  demoCast(s,st,d,'mid');
  const tick=easeOutBack(sm(C4.next+.6,C4.next+.95,tt));
  if(tick>.02){const c:Pt=[proj(st,5.5,0,GZ-6)[0],proj(st,0,2.6,GZ)[1]-30],S=150*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.know+.3,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'miguelin-futsal-signature',format:'futsal',title:'Miguelín’s clever wing pass',theme:'Look up before the ball arrives, so you know your next pass.',
 ageNote:'For players aged 7–12: the goal against Hungary at Futsal Euro 2016 is real; the wing pass is shown as a demonstration in training kit.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in along a dashed yellow pass line and stops in a red ring; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.5),pts:Pt[]=[];for(let k=0;k<=10;k++){const v=k/10*u;pts.push([x-150+150*v,y+40-40*v]);}
  if(pts.length>1&&age<.9){const p=ribbon(pts,9*(1-sm(.5,.9,age)),{seed,taper:.8,wobble:1,gaps:dashGaps(pts,30)});s.fill(Y,p,1);}
  const q=pts[pts.length-1];if(age>.5){const g=clamp((age-.5)/.4);s.fill(R,ribbon(blob(q[0],q[1]+r*.9,r*(1+1.5*g),r*(.3+.4*g),seed+1,{n:24}),6*(1-g)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  ball(s,q[0],q[1],r,seed,{rot:age*6});
 },
};
void FACE_AWAY;void FACE_LEFT;void rectPath;void easeIn;void rotPts;void polyPath;
export default film;
