/** Mario Rivillos — "the curled shot from the wing": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHY THIS MOMENT: Rivillos's entry (lib/town/iconicPlays.json) is a signature, the left-foot curled shot from the right wing, not one
 * match. No written source we could reach describes ONE dated curled goal from the wing (the UEFA and Wikipedia pages list his goals but do
 * not describe how they went in). So the film follows the brief's fallback. It opens on a REAL, documented Rivillos goal that written
 * sources DO describe, a long-range chip in the UEFA Futsal EURO 2016 final. Then a clearly labelled demonstration ("How he did it") shows
 * the curled shot in TRAINING KIT, and it is never passed off as that match.
 *  1  LIVE (broadcast camera, high on the main-stand side, real time): UEFA Futsal EURO 2016 final, 13 Feb 2016, Arena Belgrade (Kombank
 *     Arena), Russia 3–7 Spain. At 35'37" Spain lead 6–2 and Rivillos (Spain #4) "chips in" from distance: 7–2, a record-breaking 128th goal
 *     of the finals.
 *  2  REPLAY (slow motion, LOW at court level on the near side, tracking the ball's arc side-on): the soft, high chip dropping in; Spain win
 *     the final 7–3 (Milovanov's back-heel 39'45" is not shown).
 *  3  HOW HE DID IT (a demonstration in training kit, no match claimed; neutral defender and keeper): start on the right wing, cut inside
 *     onto the left foot, curl it round the keeper to the far post (slow motion flight, camera high behind the shooter's right shoulder).
 *  4  PRACTISE (lesson from the entry's `lesson`: "Cut in and shoot for the far post; keepers find it hard to reach."): the same move at a
 *     high coach's-eye angle (not top-down) with the cut-in arrow, the far-post target and the keeper's reach drawn on the court.
 * SOURCES (written; fetched once, 5 s apart, cached in scratchpad/films/src-cache/):
 *  - UEFA.com match report "Spain hit seven for seventh UEFA Futsal EURO title" by Paul Saffer, 13 Feb 2016 (archived 16 Feb 2016):
 *    https://web.archive.org/web/20160216202645/http://www.uefa.com/futsaleuro/season=2016/matches/round=2000607/match=2018946/postmatch/report/index.html
 *    (goal times; Rivillos 16:10 and 35:37; "Miguelín and Rivillos both registered from distance"; line-ups with Rivillos #4, Gustavo
 *    Russia GK #12, Paco Sedano Spain GK #1; Arena Belgrade; the Golden Shoe shared by Miguelín and Rivillos).
 *  - UEFA.com minute-by-minute commentary, same match (archived 19 Feb 2016): "35:37 Mario Rivillos (Spain) scores! Mario Rivillos chips
 *    in a record-breaking 128th goal of these finals"; 35:15 Rivillos effort, 35:16 Gustavo save (Russia's keeper on court 21 s before).
 *    https://web.archive.org/web/20160219141728/http://www.uefa.com/futsaleuro/season=2016/matches/round=2000607/match=2018946/postmatch/commentary/index.html
 *  - Wikipedia "UEFA Futsal Euro 2016" (raw): final 13 Feb 2016, Belgrade Arena, Russia 3–7 Spain, attendance 8,350; Rivillos joint top
 *    scorer (6 goals) and in the all-star squad. https://en.wikipedia.org/wiki/UEFA_Futsal_Euro_2016
 *  - Wikipedia "Mario Rivillos" (en + es, raw): Spanish ala, born 1989 in Torrejón de Ardoz; Inter Movistar 2012–17, Barcelona 2017–20;
 *    nickname "Super Mario"; EURO 2016 winner. https://en.wikipedia.org/wiki/Mario_Rivillos · https://es.wikipedia.org/wiki/Mario_Rivillos
 *  - The card entry (lib/town/iconicPlays.json): the curled shot from the right, edge of the area, LEFT foot; the lesson.
 * CONFIRMED: the match, date, venue (Arena Belgrade), final score 7–3, the score 6–2 before his goal (Miguelín 34:51) and 7–2 after it, the
 *  minute 35:37, that it was a chip ("chips in") from distance, his number 4, Russia's keeper Gustavo #12 on court 21 s before, Spain's
 *  keeper Paco Sedano #1, the final whistle and Spain's seventh title.
 * INFERRED (not named in the narration): the kits (Spain red shirts / blue shorts / red socks, Russia white, the keepers' colours), the
 *  court colour, which end, where on the court he shot from (about 19 m out, near-side of centre) and how he got the ball (the take opens
 *  with him already on it, no tackle or pass shown), every other player's position, Gustavo a few metres off his line, the chip's height
 *  and the foot (the LEFT, from the card entry), his hair (short, dark). No video was reviewed. Chapters 3–4 are a demonstration of the
 *  card's signature move (cut in from the right, left-foot curl to the far post), in training kit, not footage of any match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `drawPlayer()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strikes). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library z → −Z; both
 * strikes use the LEFT foot (foot:'l').
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (lights, diagram lines, the training bib), red (Spain, rings), blue (court, Spain shorts), navy (key line, run-off, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square);
 * never sheet.safe. Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈130–220 plate ops a frame, up to ≈380 on passage frames. Seeded. */
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
 {label:'Live: the 2016 final',text:'The 2016 Futsal Euro final, in Belgrade. Spain lead Russia six to two. Mario Rivillos has the ball far out, and chips it in. Seven!',tail:2.4,
  cues:['The 2016','Belgrade','Spain lead','six to two','Mario Rivillos','far out','chips it','Seven'],heads:{'The 2016':'Euro final 2016','six to two':'6–2','Seven':'7–2'}},
 {label:'Replay: the chip',text:'Watch again. A soft, high chip from far out. Spain win the final, seven to three!',tail:2,
  cues:['Watch again','soft','high chip','far out','Spain win','seven to three'],heads:{'Spain win':'Champions','seven to three':'7–3'}},
 {label:'How he did it',text:'His trademark: the curled shot. How he did it: start on the right wing, cut inside onto the left foot, and curl it round the keeper to the far post.',tail:1.9,
  cues:['His trademark','How he did it','right wing','cut inside','left foot','curl it','the keeper','far post'],heads:{'His trademark':'The curler','far post':''}},
 {label:'Practise it',text:'Practise it! Cut in, and shoot for the far post. Keepers find it hard to reach!',tail:2.6,
  cues:['Practise it','Cut in','shoot for','far post','Keepers find','hard to reach'],heads:{'Cut in':'Cut in','far post':'Far post'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/rivillos-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/rivillos-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/rivillos-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('rivillos: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('rivillos: no cue '+w);return c.at;};
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
const BUILD={height:1.76,bulk:.98};
/** Rivillos: Spain #4 (UEFA line-up); red shirt, blue shorts, red socks (kit inferred); short dark hair (inferred); left foot (card entry) */
const RIV:AthleteStyle={shirt:R,shorts:B,socks:R,boots:K,skin:SKIN,hair:K,line:K,trim:Y,number:4,numberInk:'paper',hairStyle:'short',build:BUILD,seed:4};
/** Rivillos in the demonstration chapters: a training bib (yellow) over navy, no match kit, no number */
const RIV_TRAIN:AthleteStyle={shirt:Y,shorts:K,socks:K,boots:K,skin:SKIN,hair:K,line:K,trim:R,number:null,hairStyle:'short',build:BUILD,seed:4};
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:B,socks:R,boots:K,skin:[[Y,.72],[R,.18]],hair:K,line:K,trim:Y,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const RUS=(n:number):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:[[Y,.8],[R,.24]],hair:K,line:K,trim:R,hairStyle:n%3?'short':'bald',build:{height:1.74+hash(n,3)*.12},seed:20+n});
/** Gustavo, Russia #12 (GK) — keeper kit colour inferred */
const GUSTAVO:AthleteStyle={shirt:[B,.55],shorts:K,socks:K,boots:K,skin:[[Y,.7],[R,.24]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',number:12,numberInk:'paper',hairStyle:'short',build:{height:1.8},seed:62};
/** Paco Sedano, Spain #1 (GK) — keeper kit colour inferred */
const SEDANO:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.72],[R,.2]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',number:1,numberInk:Y,hairStyle:'balding',build:{height:1.8},seed:61};
/** the demonstration defender and keeper: neutral training kits (no team is claimed in chapters 3–4) */
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
/** where the ball sits at the left-foot strike's contact (our floor coords, place at the origin) */
function strikeBall(yaw:number):[number,number,number]{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),BUILD,{yaw}),toe=sk.lToe,an=sk.lAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}
/** a player's chest ring (the passage enters the shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.1):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}

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

// ---- SIDE court (chapters 1–2): the camera outside the near touchline; Spain's goal at X = −20, Russia's goal at X = +20 (ends inferred) ----
const TOUCH_FAR=20,BOARDS=21.2,POST_N=8.5,POST_F=11.5,RUS_GOAL=20,ESP_GOAL=-20;
/** the side court: run-off, blue court, lines at both ends, boards + crowd, both goals; `keeper` draws a keeper between net and posts */
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true);s.knockout(court,.25);s.fill(B,court,.82);
 s.fill(B,polyPath(floorQuad(st,-20,6,20,13),true),.12);
 const lines=new Path2D();
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[-20,0],[-20,TOUCH_FAR]],[[20,0],[20,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 for(const gx of[ESP_GOAL,RUS_GOAL]){const dir=gx<0?1:-1,arc:Pt[]=[];
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([gx+dir*6*Math.sin(a),POST_N-6*Math.cos(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([gx+dir*6*Math.sin(a),POST_F+6*Math.cos(a)]);}
  lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const d of[6,10])lines.addPath(polyPath(floorRing(st,gx+dir*d,10,.12,12),true));}
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st,ESP_GOAL,0,10,1);sideGoal(s,st,RUS_GOAL,bulge,bz,by);o.keeper?.();sidePosts(s,st,ESP_GOAL);sidePosts(s,st,RUS_GOAL);
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

// ================= chapter 1 — LIVE: EURO 2016 final, 35'37"; 6–2 up, Rivillos far out, the chip, 7–2 =================
const C1={belg:A(0,'Belgrade'),lead:A(0,'Spain lead'),six:A(0,'six to'),riv:A(0,'Mario'),far:A(0,'far out'),chip:A(0,'chips it'),seven:A(0,'Seven'),end:AUTH[0].seconds};
/** the chip: contact just after "chips it"; the ball drops in on "Seven" (≈19 m, a soft high lob) */
const T_HIT=C1.chip+.1,T_IN=Math.max(T_HIT+1.15,C1.seven+.05);
/** the shooting spot (the ball at contact) and the landing point just inside the goal (inferred: near-side of centre, ≈19 m out) */
const SHOT:[number,number]=[1.2,7.6],DROP:V3=[RUS_GOAL+.35,1.05,10.3];
const YAW_SHOT=yawTo(DROP[0]-SHOT[0],DROP[2]-SHOT[1]);
const SB=strikeBall(YAW_SHOT),PLANT:[number,number]=[SHOT[0]-SB[0],SHOT[1]-SB[2]];
/** he is already on the ball when the take starts (how he got it is not documented): a few touches forward, then the chip */
const RUN0:[number,number]=[-6.4,6.1],S_T0=T_HIT-.62;
const rivPos=(T:number):[number,number]=>{const u=sm(0,S_T0,T,t=>t);return[lerp(RUN0[0],PLANT[0]-.35,easeIO(u)*.3+u*.7),lerp(RUN0[1],PLANT[1]-.1,u)];};
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 if(T<S_T0){const[x,z]=rivPos(T),ph=((T*1.7)%1+1)%1,lead=.42+.22*easeOut(ph),dirX=Math.cos(yawTo(PLANT[0]-RUN0[0],PLANT[1]-RUN0[1])),dirZ=Math.sin(yawTo(PLANT[0]-RUN0[0],PLANT[1]-RUN0[1]));return{X:x+dirX*lead,Y:BALL_R,Z:z+dirZ*lead,flying:false,spin:T*9};}
 if(T<T_HIT){const[x,z]=rivPos(S_T0),u=sm(S_T0,T_HIT-.2,T,easeOut),d=yawTo(PLANT[0]-RUN0[0],PLANT[1]-RUN0[1]);return{X:lerp(x+Math.cos(d)*.5,SHOT[0],u),Y:BALL_R,Z:lerp(z+Math.sin(d)*.5,SHOT[1],u),flying:false,spin:9*S_T0+u*3};}
 if(T<T_IN){const u=sm(T_HIT,T_IN,T,linear);return{X:lerp(SHOT[0],DROP[0],u),Y:qb(BALL_R,7.2,DROP[1],u),Z:lerp(SHOT[1],DROP[2],u),flying:true,spin:20+u*18};}
 const d=sm(T_IN,T_IN+.3,T,easeIn),bo=Math.abs(Math.sin(sm(T_IN+.3,T_IN+1.2,T)*Math.PI*2))*.14*(1-sm(T_IN+.3,T_IN+1.2,T));
 return{X:lerp(DROP[0],RUS_GOAL+.7,d),Y:lerp(DROP[1],BALL_R,d)+bo,Z:DROP[2],flying:false,spin:40};
}
/** Rivillos live: dribbles forward (left foot), looks up, the left-foot chip, then wheels away to the near side */
const liveRiv:Gen=T=>{
 const stT=key(T,[[S_T0,0],[S_T0+.3,.22],[T_HIT,STRIKE_CONTACT],[T_HIT+.6,1]],linear),runYaw=yawTo(PLANT[0]-RUN0[0],PLANT[1]-RUN0[1]);
 let[X,Z]=T<S_T0?rivPos(T):[lerp(rivPos(S_T0)[0],PLANT[0],sm(S_T0,T_HIT,T,easeOut)),lerp(rivPos(S_T0)[1],PLANT[1],sm(S_T0,T_HIT,T,easeOut))] as [number,number];
 let pose:Pose,yaw=runYaw;
 if(T<S_T0)pose=dribble(T*1.7,{foot:'l',speed:.55});
 else if(T<T_HIT+.6){pose=blendPose(dribble(S_T0*1.7,{foot:'l',speed:.55}),strike(stT,{foot:'l',power:.7}),sm(S_T0,S_T0+.12,T));yaw=lerp(runYaw,YAW_SHOT,sm(S_T0,S_T0+.3,T));}
 else{const u=sm(T_HIT+.6,T_HIT+1.1,T,easeIO),g=T-T_HIT-.6;pose=blendPose(strike(1,{foot:'l',power:.7}),celebrate(g*1.2,{kind:'run'}),u);yaw=lerp(YAW_SHOT,yawTo(1,-1.1),u);X=PLANT[0]+Math.max(0,g)*2.6*.67;Z=PLANT[1]-Math.max(0,g)*2.6*.74;Z=Math.max(1.2,Z);}
 return{pose,yaw,X,Z};
};
/** Russia (white): four outfield players chasing back toward their own goal (+X) — positions inferred; heads drop after the goal */
type Mark={x0:number;z0:number;vx:number;vz:number;ph:number};
const RUS_M:Mark[]=[{x0:-1.2,z0:11.6,vx:.85,vz:-.15,ph:.1},{x0:-9.2,z0:11.8,vx:2.4,vz:-.3,ph:.5},{x0:-13,z0:2.2,vx:2,vz:.05,ph:.8},{x0:-4.6,z0:15.6,vx:1.6,vz:-.4,ph:.3}];
const liveRus=(i:number):Gen=>T=>{const m=RUS_M[i],stop=Math.min(T,T_IN+.3),X=m.x0+m.vx*stop,Z=m.z0+m.vz*stop,post=sm(T_IN+.3,T_IN+1.3,T);
 let pose=runCycle(T*runCadence(.5)+m.ph,{speed:.5});pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20}),post);
 return{pose,yaw:post>.5?yawTo(DROP[0]-X,DROP[2]-Z):yawTo(m.vx,m.vz),X,Z};};
/** Gustavo: set a few metres off his line (inferred), backpedals as the chip goes up, a late stretch, then a look back at the net */
const liveGK:Gen=T=>{const back=sm(T_HIT,T_IN,T,easeIn),X=lerp(RUS_GOAL-3.2,RUS_GOAL-.9,back),Z=lerp(9.6,10,back);
 let pose=keeperSet(T*1.3);pose=blendPose(pose,backpedal(T*1.6),sm(T_HIT,T_HIT+.25,T)*(1-sm(T_IN-.45,T_IN-.3,T)));
 pose=blendPose(pose,posed({lHipF:30,rHipF:-10,lKnee:30,rKnee:20,lean:-14,neckP:-40,lShF:170,rShF:150,lElb:10,rElb:20,air:.18}),sm(T_IN-.45,T_IN-.2,T)*(1-sm(T_IN+.3,T_IN+.8,T)));
 pose=blendPose(pose,posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:14,neckP:44,neckY:60,lShA:12,rShA:12,lElb:30,rElb:30}),sm(T_IN+.6,T_IN+1.5,T));
 return{pose,yaw:FACE_LEFT,X,Z};};
/** Spain's other three (red) and Paco Sedano: steady, then they run to Rivillos after the goal */
const ESP_POS:[number,number][]=[[-8.6,14.4],[-3.4,2.8],[-13.6,9.2]];
const liveEsp=(i:number):Gen=>T=>{const[x0,z0]=ESP_POS[i],go=sm(T_IN+.2,C1.end,T,easeIO),f=liveRiv(C1.end);const drift=Math.min(T,T_IN)*[.9,1.6,1.1][i];
 const X=lerp(x0+drift,f.X+[1.2,-1.1,-1.6][i],go),Z=lerp(z0,f.Z+[1.1,.6,.3][i],go);
 let pose=blendPose(runCycle(T*runCadence(.3)+i*.3,{speed:.3}),stand(),.3);if(go>0)pose=blendPose(pose,celebrate(T*1.1+i*.3,{kind:'run'}),sm(T_IN+.2,T_IN+.6,T));
 return{pose,yaw:go>0?yawTo(f.X-x0,f.Z-z0):FACE_RIGHT,X,Z};};
const liveSedano:Gen=T=>({pose:blendPose(stand(),celebrate(T*1.1,{kind:'arms'}),sm(T_IN+.3,T_IN+.8,T)),yaw:FACE_RIGHT,X:ESP_GOAL+1.4,Z:10});
const liveCam=(T:number)=>({x:key(T,mono([[0,-4.6],[C1.riv,-3.4],[S_T0,-1.2],[T_HIT,1.2],[lerp(T_HIT,T_IN,.5),9],[T_IN,15.6],[T_IN+.8,16],[C1.end-.6,11],[C1.end,9.5]]),easeInOutSine),
 zoom:key(T,mono([[0,.58],[C1.lead,.6],[C1.riv,.7],[S_T0,.66],[T_HIT,.56],[lerp(T_HIT,T_IN,.5),.52],[T_IN,.62],[T_IN+.9,.66],[C1.end,.6]]),easeInOutSine),
 y:key(T,mono([[0,1040],[S_T0,1030],[lerp(T_HIT,T_IN,.5),900],[T_IN,1010],[C1.end,1030]]),easeInOutSine)});
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_HIT,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.12,flash:pulse(T,T_IN,1.2),bulge:.5*sm(T_IN-.1,T_IN+.1,T)*(1-.6*sm(T_IN+.3,T_IN+1.2,T))+.12*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:DROP[2],by:DROP[1],
  keeper:()=>{drawPlayer(s,st,liveSedano,T,SEDANO,{detail:'low'});}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 RUS_M.forEach((_,i)=>{const g=liveRus(i);items.push({z:g(T).Z,draw:()=>drawPlayer(s,st,g,T,RUS(i),{detail:'low'})});});
 ESP_POS.forEach((_,i)=>{const g=liveEsp(i);items.push({z:g(T).Z,draw:()=>drawPlayer(s,st,g,T,ESP(i),{detail:'low'})});});
 items.push({z:liveGK(T).Z,draw:()=>drawPlayer(s,st,liveGK,T,GUSTAVO,{detail:'low'})});
 items.push({z:liveRiv(T).Z,draw:()=>drawPlayer(s,st,liveRiv,T,RIV,{smear:T>T_HIT-.2&&T<T_HIT+.25?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const tr:Pt[]=[];if(b.flying)for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_HIT,T-.3+k*.0375));tr.push(proj(st,q.X,q.Y,q.Z));}
  ballOn(s,st,b.X,b.Y,b.Z,18,{rot:b.spin,trail:tr,smear:b.flying?.4:0,dir:Math.PI*1.1});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveRiv(tt),.12));},still:C1.chip+.3};

// ================= chapter 2 — REPLAY: slow motion, low at court level on the near side, tracking the arc =================
const C2={watch:A(1,'Watch'),soft:A(1,'soft'),high:A(1,'high chip'),far:A(1,'far out'),win:A(1,'Spain win'),seven:A(1,'seven to'),end:AUTH[1].seconds};
/** replay clock → live clock: the wind-up, contact on "soft", the ball over the top on "high chip", in the net just before "Spain win" */
const repT=(t:number)=>key(t,[[0,S_T0-.25],[C2.soft+.05,T_HIT],[C2.high+.3,lerp(T_HIT,T_IN,.5)],[C2.win-.25,T_IN],[C2.end,T_IN+1.4]],linear);
const st2=(cx:number):Stage=>({F:2400,eye:1.4,cx,cz:-4.2});
/** the replay camera tracks the ball: x on the ball, y part-way between the floor and the ball, so the players stay in the frame */
const repCam=(t:number)=>{const T=repT(t),b=liveBall(T),cx=key(t,mono([[0,PLANT[0]+.6],[C2.soft,SHOT[0]+.6],[C2.win-.25,DROP[0]-1.6],[C2.end,DROP[0]-2.2]]),easeInOutSine),
 track=sm(C2.soft-.2,C2.soft+.4,t,easeIO)*(1-sm(C2.win-.6,C2.win,t,easeIO)),bx=lerp(cx,b.X,track*.8),st=st2(bx),by=proj(st,b.X,b.Y,b.Z)[1];
 return{x:bx,y:lerp(-60,lerp(-60,by,.5),track),zoom:key(t,mono([[0,1.05],[C2.soft,1],[C2.high,.8],[C2.far,.84],[C2.win-.2,.95],[C2.end,.9]]),easeInOutSine)};};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),T=repT(tt),c=repCam(t),st=st2(c.x),net=pulse(T,T_IN,.6),hit=pulse(T,T_HIT,.4);
  cam(s,0,c.y+5*hit*Math.sin(t*90)+4*net*Math.sin(t*60),c.zoom);
  const b=liveBall(T),goal=T>=T_IN;
  courtSide(s,st,T,{cheer:goal?1:.1,flash:pulse(tt,C2.win,1.4)+pulse(T,T_IN,1),bulge:.5*sm(T_IN-.1,T_IN+.1,T)*(1-.6*sm(T_IN+.3,T_IN+1.2,T))+.12*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:DROP[2],by:DROP[1]});
  // "soft": a yellow ring pops round the ball at contact; "high chip": the dashed arc draws behind the ball; "far out": a red floor line
  // measures the distance from his spot to the goal line
  if(tt>=C2.soft-.1){const g=easeOutBack(sm(C2.soft-.1,C2.soft+.25,tt))*(1-sm(C2.high-.3,C2.high,tt));if(g>.02){const p=proj(st,SHOT[0],.25,SHOT[1]);s.fill(Y,ribbon(blob(p[0],p[1],90*g,70*g,201,{n:22}),9,{seed:202,close:true,wobble:1}),1);}}
  if(T>T_HIT){const pts:Pt[]=[];for(let k=0;k<=20;k++){const q=liveBall(lerp(T_HIT,Math.min(T,T_IN),k/20));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,10,203,{dash:40});}
  if(tt>=C2.far-.1){const u=sm(C2.far-.1,C2.far+.6,tt,easeOut)*(1-sm(C2.win,C2.win+.4,tt));if(u>.02){const pts:Pt[]=[];for(let k=0;k<=10;k++)pts.push(proj(st,lerp(SHOT[0],RUS_GOAL,k/10),0,SHOT[1]-.6));dashed(s,R,pts,12,204,{dash:46,progress:u});if(u>.9){arrowHead(s,R,pts,36,205);arrowHead(s,R,[pts[2],pts[1],pts[0]],36,206);}}}
  type It={z:number;draw:()=>void};const items:It[]=[];
  items.push({z:liveGK(T).Z,draw:()=>drawPlayer(s,st,liveGK,T,GUSTAVO,{detail:'mid'})});
  [0,1].forEach(i=>{const g=liveRus(i);items.push({z:g(T).Z,draw:()=>drawPlayer(s,st,g,T,RUS(i),{detail:'mid'})});});
  items.push({z:liveRiv(T).Z,draw:()=>drawPlayer(s,st,liveRiv,T,RIV,{detail:'high',smear:T>T_HIT-.3&&T<T_HIT+.2?.2:0})});
  items.push({z:b.Z-.05,draw:()=>{ballOn(s,st,b.X,b.Y,b.Z,97,{rot:tt*5,smear:b.flying?.3:0,dir:Math.PI*1.1});if(T>=T_HIT&&T<T_HIT+.3){const p=proj(st,b.X,b.Y,b.Z);sparkBurst(s,Y,p[0],p[1],80,{n:9,seed:98,g:easeOut(sm(T_HIT,T_HIT+.25,T))});}}});
  items.sort((a,c2)=>c2.z-a.z).forEach(it=>it.draw());
  if(T>=T_IN&&T<T_IN+1){const p=proj(st,DROP[0],DROP[1],DROP[2]);sparkBurst(s,Y,p[0],p[1],150,{n:12,seed:99,g:easeOut(sm(T_IN,T_IN+.3,T))*(1-sm(T_IN+.6,T_IN+1,T))});}
  // "Spain win": red and yellow confetti falls in front of the stands
  if(tt>=C2.win){const u=sm(C2.win,C2.win+2.4,tt,linear),top=proj(st,c.x,6,BOARDS)[1];confetti(s,[R,Y,'paper'],[-900,top-200+u*500,1800,420],26,Math.floor(tt*6),{size:16});}
 },
 aperture(t0){const{tt}=clock(1,t0),T=repT(tt),st=st2(repCam(t0).x),b=liveBall(T),p=proj(st,b.X,b.Y,b.Z),r=Math.max(12,kAt(st,b.Z)*BALL_R)*1.2,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return aperture(q);},
 still:C2.soft+.1,
};

// ================= the DEMONSTRATION (chapters 3–4): right wing → cut inside → left-foot curl to the far post =================
/** canonical demo seconds (real speed): wing 0–1.2, cut inside 1.2–2.5, set 2.5–2.9, contact DC, in the net DIN, then away */
const DC=3.1,DIN=4.1;
const W0:[number,number]=[6.9,GZ-11.2],W1:[number,number]=[6.5,GZ-9.8],CUT:[number,number]=[3.5,GZ-7.4];
const D_SHOT:[number,number]=[2.95,GZ-6.95],D_FAR:V3=[-1.12,1.55,GZ+.02];
/** the curl: launched wide of the far post (a control point bowed out to the left), bending back in */
const D_CTRL:[number,number]=[-.55,GZ-4.1];
const D_YAW=yawTo(D_CTRL[0]-D_SHOT[0],D_CTRL[1]-D_SHOT[1]);
const DSB=strikeBall(D_YAW),D_PLANT:[number,number]=[D_SHOT[0]-DSB[0],D_SHOT[1]-DSB[2]];
function dPos(d:number):[number,number]{
 if(d<1.2){const u=sm(0,1.2,d,linear);return[lerp(W0[0],W1[0],u),lerp(W0[1],W1[1],u)];}
 if(d<2.5){const u=sm(1.2,2.5,d,easeIO);return[qb(W1[0],CUT[0]+1.2,CUT[0],u),qb(W1[1],GZ-7.9,CUT[1],u)];}
 if(d<DC+.6){const u=sm(2.5,DC,d,easeOut);return[lerp(CUT[0],D_PLANT[0],u),lerp(CUT[1],D_PLANT[1],u)];}
 const g=d-DC-.6;return[D_PLANT[0]+g*1.6,D_PLANT[1]+g*.4];
}
const dYawRun=(d:number)=>{const a=dPos(Math.max(0,d-.12)),b=dPos(d+.12);return yawTo(b[0]-a[0],b[1]-a[1]);};
const demoRiv:Gen=d=>{
 const[X,Z]=dPos(d);let pose:Pose,yaw=dYawRun(Math.min(d,2.45));
 if(d<2.55)pose=dribble(d*1.8,{foot:'l',speed:d<1.2?.45:.35});
 else if(d<DC+.6){const stT=key(d,[[2.55,.05],[2.8,.22],[DC,STRIKE_CONTACT],[DC+.6,1]],linear);pose=blendPose(dribble(2.55*1.8,{foot:'l',speed:.35}),strike(stT,{foot:'l'}),sm(2.55,2.7,d));yaw=lerp(dYawRun(2.45),D_YAW,sm(2.55,2.85,d,easeIO));}
 else{const u=sm(DC+.6,DC+1.1,d,easeIO);pose=blendPose(strike(1,{foot:'l'}),celebrate((d-DC-.6)*1.2,{kind:'arms'}),u);yaw=lerp(D_YAW,FACE_CAMERA+.4,u);}
 return{pose,yaw,X,Z};
};
function demoBall(d:number):{X:number;Y:number;Z:number;flying:boolean}{
 if(d<2.55){const[x,z]=dPos(d),yw=dYawRun(Math.min(d,2.45)),ph=((d*1.8)%1+1)%1,lead=.38+.18*easeOut(ph);return{X:x+Math.cos(yw)*lead,Y:BALL_R,Z:z+Math.sin(yw)*lead,flying:false};}
 if(d<DC){const[x,z]=dPos(2.55),yw=dYawRun(2.45),u=sm(2.55,DC-.15,d,easeOut);return{X:lerp(x+Math.cos(yw)*.45,D_SHOT[0],u),Y:BALL_R,Z:lerp(z+Math.sin(yw)*.45,D_SHOT[1],u),flying:false};}
 if(d<DIN){const u=sm(DC,DIN,d,linear);return{X:qb(D_SHOT[0],D_CTRL[0],D_FAR[0],u),Y:qb(BALL_R,2.05,D_FAR[1],u),Z:qb(D_SHOT[1],D_CTRL[1],D_FAR[2],u),flying:true};}
 const u=sm(DIN,DIN+.35,d,easeIn);return{X:D_FAR[0]+.05,Y:lerp(D_FAR[1],BALL_R,u)+Math.abs(Math.sin(sm(DIN+.35,DIN+1.2,d)*Math.PI))*.1*(1-sm(DIN+.35,DIN+1.2,d)),Z:GZ+.55*u+.02,flying:false};
}
/** the demo defender: shows him the line, backpedals as he cuts in, a late block toward the ball */
const demoDef:Gen=d=>{const[bx,bz]=dPos(Math.min(d,2.6)),X=bx-.7-.3*sm(1.2,2.5,d),Z=bz+2.1+.5*sm(1.2,2.5,d);const lu=key(d,[[DC-.35,0],[DC+.05,.6],[DC+1.2,.8]],linear);
 let pose=backpedal(d*1.3);pose=blendPose(pose,lunge(lu,{side:'r'}),sm(DC-.45,DC-.3,d));
 return{pose,yaw:yawTo(bx-X,bz-Z),X,Z};};
/** the demo keeper: set near the middle of his goal, moves across a touch, dives to his right (screen-left) late and can't reach */
const demoGK:Gen=d=>{const dv=.62*sm(DC+.4,DIN+.1,d,linear)+.3*sm(DIN+.1,DIN+.9,d);let pose=keeperSet(d*1.3);pose=blendPose(pose,keeperDive(dv,{side:'r',height:.2}),sm(DC+.2,DC+.35,d));
 return{pose,yaw:FACE_CAMERA+.25,X:lerp(.75,.6,sm(1.2,2.8,d))+.1*sm(DC+.3,DIN,d),Z:GZ-.75};};
/** the far post target and the flight line (floor + air), shared by chapters 3–4 */
function flightLine(s:Sheet,st:Stage,d:number,w:number,seed:number){if(d<=DC)return;const pts:Pt[]=[];for(let k=0;k<=18;k++){const q=demoBall(lerp(DC,Math.min(d,DIN),k/18));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,w,seed,{dash:w*4});}
/** draw the demo players and ball back to front on stage st at demo time d */
function demoCast(s:Sheet,st:Stage,d:number,detail:'mid'|'high'){
 const b=demoBall(d),items:{z:number;draw:()=>void}[]=[
  {z:demoDef(d).Z,draw:()=>drawPlayer(s,st,demoDef,d,DEMO_D,{detail:'mid'})},
  {z:demoRiv(d).Z+.001,draw:()=>drawPlayer(s,st,demoRiv,d,RIV_TRAIN,{detail,smear:d>DC-.3&&d<DC+.2?.2:0})},
  {z:b.flying||d>=DIN?b.Z:demoRiv(d).Z-.3,draw:()=>{ballOn(s,st,b.X,b.Y,b.Z,311,{rot:d*7,smear:b.flying?.3:0,dir:Math.PI*.8});if(d>=DC&&d<DC+.3){const p=proj(st,b.X,b.Y,b.Z);sparkBurst(s,Y,p[0],p[1],90,{n:9,seed:312,g:easeOut(sm(DC,DC+.25,d))});}}},
 ];
 items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
 if(d>=DIN&&d<DIN+.9){const p=proj(st,D_FAR[0],D_FAR[1],GZ+.3);sparkBurst(s,Y,p[0],p[1],110,{n:11,seed:313,g:easeOut(sm(DIN,DIN+.3,d))*(1-sm(DIN+.5,DIN+.9,d))});}
}
const netOf=(d:number)=>.5*sm(DIN-.08,DIN+.08,d)*(1-.6*sm(DIN+.3,DIN+1.2,d))+.1*settle(d,DIN,{amp:1,freq:3,decay:3});

// ================= chapter 3 — HOW HE DID IT (demonstration, training kit): right wing, cut inside, left foot, curl, far post =================
const C3={mark:A(2,'His trademark'),how:A(2,'How he'),wing:A(2,'right wing'),cut:A(2,'cut inside'),left:A(2,'left foot'),curl:A(2,'curl it'),keeper:A(2,'the keeper'),far:A(2,'far post'),end:AUTH[2].seconds};
/** chapter time → demo time: waiting on the wing, the cut on "cut inside", set on "left foot", contact on "curl it", in on "far post" (slow) */
const d3=(t:number)=>key(t,[[0,0],[C3.wing,.9],[C3.cut,1.25],[C3.left+.2,2.55],[C3.curl+.05,DC],[C3.far+.2,DIN],[C3.end,DIN+1.4]],linear);
const st3:Stage={F:1500,eye:3.8,cx:3,cz:GZ-16.5};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,d=d3(tt),dc=d3(t),rp=dPos(dc),rg=proj(st,rp[0],.9,rp[1]);
  camPath(s,t,[[0,rg[0]-40,rg[1]-160,1.45],[C3.how,rg[0]-60,rg[1]-150,1.35],[C3.cut,rg[0]-160,rg[1]-110,1.12],[C3.curl,-150,rg[1]-170,1.08],[C3.keeper,-280,proj(st,0,.8,GZ)[1]+90,1.3],[C3.far,-330,proj(st,0,.8,GZ)[1]+70,1.4],[C3.end,-300,proj(st,0,.8,GZ)[1]+60,1.3]]);
  arena(s,st,{t:tt,cheer:.4*pulse(d,DIN,1.5),flash:pulse(d,DIN,1),bulge:netOf(d),bx:D_FAR[0],by:D_FAR[1],keeper:stg=>{drawPlayer(s,stg,demoGK,d,DEMO_K,{detail:'mid'});}});
  // "right wing": a yellow ring on the wing; "cut inside": his dashed yellow route arrow; "left foot": a red ring round the left boot and ball;
  // "curl it": the dashed flight line; "the keeper": a red dashed arc = his reach; "far post": a yellow target ring on the far post
  const wing=easeOutBack(sm(C3.wing,C3.wing+.35,tt))*(1-sm(C3.cut+.4,C3.cut+.8,tt));if(wing>.02)floorDashRing(s,st,Y,W1[0],W1[1],.9,10,321,wing);
  if(tt>=C3.cut-.1){const u=sm(C3.cut-.1,C3.cut+.7,tt,easeOut)*(1-sm(C3.far,C3.far+.5,tt));if(u>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=dPos(lerp(1.2,2.9,k/12));pts.push(proj(st,q[0],0,q[1]));}dashed(s,Y,pts,12,322,{dash:40,progress:u});if(u>.9)arrowHead(s,Y,pts,36,323);}}
  const lf=easeOutBack(sm(C3.left,C3.left+.3,tt))*(1-sm(C3.curl+.2,C3.curl+.5,tt));if(lf>.02){const b=demoBall(d);floorDashRing(s,st,R,b.X,b.Z,.42,10,324,lf);}
  const kr=sm(C3.keeper,C3.keeper+.4,tt,easeOut)*(1-sm(C3.end-.9,C3.end-.6,tt));if(kr>.02){const q=floorRing(st,.35,GZ-.6,1.55,16,Math.PI*1.02,Math.PI*1.98),p=ribbon(partial(q,kr),9,{seed:325,wobble:1,gaps:dashGaps(q,30)});s.knockout(p);s.fill(R,p);}
  const fp=easeOutBack(sm(C3.far,C3.far+.35,tt));if(fp>.02){const p=proj(st,-1.5,1,GZ),r=kAt(st,GZ)*.55*fp;s.fill(Y,ribbon(blob(p[0],p[1],r,r*1.8,326,{n:22}),9,{seed:327,close:true,wobble:1}),1);}
  flightLine(s,st,d,11,328);
  demoCast(s,st,d,'high');
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoRiv(d3(tt)),.13));},
 still:C3.cut+.4,
};

// ================= chapter 4 — PRACTISE: the lesson on the court (coach's-eye, high behind; not top-down) =================
const C4={prac:A(3,'Practise'),cut:A(3,'Cut in'),shoot:A(3,'shoot for'),far:A(3,'far post'),keep:A(3,'Keepers'),hard:A(3,'hard to'),end:AUTH[3].seconds};
const d4=(t:number)=>key(t,[[0,.3],[C4.cut,1.2],[C4.shoot+.1,DC],[C4.hard+.1,DIN],[C4.end,DIN+1.3]],linear);
const st4:Stage={F:1500,eye:7.2,cx:2,cz:GZ-19};
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,d=d4(tt),mid=proj(st,2.2,0,GZ-5.5);
  camPath(s,t,[[0,mid[0]+80,mid[1]-120,1.35],[C4.cut,mid[0]+40,mid[1]-150,1.2],[C4.far,mid[0]-40,mid[1]-190,1.12],[C4.hard,mid[0]-60,mid[1]-200,1.16],[C4.end,mid[0]-40,mid[1]-190,1.12]]);
  arena(s,st,{t:tt,cheer:.8*pulse(tt,C4.hard+.2,1.4),flash:pulse(d,DIN,1),bulge:netOf(d),bx:D_FAR[0],by:D_FAR[1],keeper:stg=>{drawPlayer(s,stg,demoGK,d,DEMO_K,{detail:'mid'});}});
  // "Cut in": the yellow route arrow; "shoot for" + "far post": the target ring at the far post and the dashed line to it;
  // "Keepers find": the keeper's reach as a red dashed arc that stops short of the far post; "hard to reach": the big tick
  if(tt>=C4.cut-.1){const u=sm(C4.cut-.1,C4.cut+.6,tt,easeOut);const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=dPos(lerp(1.2,2.9,k/12));pts.push(proj(st,q[0],0,q[1]));}dashed(s,Y,pts,13,401,{dash:40,progress:u});if(u>.9)arrowHead(s,Y,pts,40,402);}
  const fp=easeOutBack(sm(C4.far,C4.far+.35,tt));if(fp>.02){floorDashRing(s,st,Y,-1.2,GZ-.35,.55,11,403,fp);const p=proj(st,-1.5,1,GZ),r=kAt(st,GZ)*.5*fp;s.fill(Y,ribbon(blob(p[0],p[1],r,r*1.8,404,{n:22}),9,{seed:405,close:true,wobble:1}),1);}
  const kr=sm(C4.keep,C4.keep+.5,tt,easeOut);if(kr>.02){const q=floorRing(st,.35,GZ-.6,1.5,16,Math.PI*1.02,Math.PI*1.98),p=ribbon(partial(q,kr),10,{seed:406,wobble:1,gaps:dashGaps(q,30)});s.knockout(p);s.fill(R,p);}
  flightLine(s,st,d,12,407);
  demoCast(s,st,d,'mid');
  const tick=easeOutBack(sm(C4.hard+.3,C4.hard+.65,tt));
  if(tick>.02){const c:Pt=[proj(st,-1.2,0,GZ)[0]-230,proj(st,0,2.6,GZ)[1]-40],S=150*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.far+.3,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'rivillos-futsal-signature',format:'futsal',title:'Rivillos’s curled shot',theme:'Cut in from the wing and curl it to the far post.',
 ageNote:'For players aged 7–12: the chip in the 2016 Futsal Euro final is real; the curled shot is shown as a demonstration in training kit.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball curls in a yellow arc and lands with a red ring; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.5),pts:Pt[]=[];for(let k=0;k<=10;k++){const v=k/10*u;pts.push([x-120+240*v-90*Math.sin(v*Math.PI),y-60*Math.sin(v*Math.PI)]);}
  if(pts.length>1&&age<.9){const p=ribbon(pts,9*(1-sm(.5,.9,age)),{seed,taper:.8,wobble:1});s.fill(Y,p,1);}
  const q=pts[pts.length-1];if(age>.5){const g=clamp((age-.5)/.4);s.fill(R,ribbon(blob(q[0],q[1]+r*.9,r*(1+1.5*g),r*(.3+.4*g),seed+1,{n:24}),6*(1-g)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  ball(s,q[0],q[1],r,seed,{rot:age*6});
 },
};
void FACE_AWAY;void rectPath;void easeIn;
export default film;
