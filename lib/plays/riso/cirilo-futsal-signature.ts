/** Cirilo — "the hold-up and pass": a signature-move riso film (iconic plays, FUTSAL; Cirilo is a pivot).
 *
 * WHO: the card (lib/town/playerAppearance.json country "Brazil" — the flag of his birth; playerBios "Brazilian-born pivot who became a
 *  Russia international and won seven Russian Super League titles with Moscow clubs like Dinamo") is Cirilo Tadeus Cardoso Filho, "Cirilo"
 *  (Russian: Сирило; FIFA.com spells it "SIRILO"), born 20 Jan 1980 in São Paulo, 1.83 m, pivot: São Caetano, Ulbra, Joinville, Spartak,
 *  Dinamo Moskva 2004–17, MFK KPRF; naturalised, Russia 2006–14 (37 caps, 29 goals), shirt no. 11. Card country, bio and sources agree —
 *  no namesake / country mismatch.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — "the hold-up and pass", lesson "Keep the ball and wait for your
 *  teammates to join the attack" — not one match. No written source we could reach describes ONE dated Cirilo hold-up and lay-off, so the
 *  film follows the brief: the real-match chapters show only a Cirilo goal that UEFA.com describes in words, and the signature itself is a
 *  separate, clearly labelled demonstration in training bibs (no match claimed). The match is the UEFA Futsal EURO 2012 SEMI-FINAL,
 *  Croatia 2–4 Russia, 9 Feb 2012, 18:30 CET, Arena Zagreb, a competition-record 14,300 crowd. Cirilo scored Russia's second at 5:07:
 *  report — "Cirilo, from Aleksandr Fukin's threaded pass, beat Jukić first time in the sixth minute"; commentary (Paul Saffer) —
 *  "Aleksandr Fukin plays the ball in from the left and Cirilo turns the ball past Jukić. Efficient finishing from Russia."
 *  No other futsal film uses this match (Aicardo: the OTHER 2012 semi, Spain–Italy, same arena, 21:00; Sergio Lozano / Luis Amado: the
 *  EURO 2012 final, where Cirilo was sent off at 35:54; Carlos Ortiz: the 2012 World Cup quarter-final where "Sirilo" scored at 1'14"
 *  (score bug only); Sergeev: the 2012 World Cup group game v Guatemala; Robinho: EURO 2014 semi; Mammarella: EURO 2014 final).
 *  1  LIVE (broadcast camera, main stand, real time): Russia lead 0–1 (Prudnikov 0:35, not shown). 5:07 — Fukin threads the ball in from
 *     the left; Cirilo turns it first time past Jukić; 0–2.
 *  2  REPLAY (slow motion, low, behind Cirilo — the same choreography rotated): the pass in, the one-touch turn, the net; then the Russians
 *     celebrate and the board reads the result (Croatia 2–4 Russia, into the final).
 *  3  HOW HE DOES IT (a labelled demonstration in TRAINING bibs, quiet stands, no match claimed): back to goal, body between the ball and
 *     the defender; he holds it while two team-mates run up; he lays it off and the arriving team-mate shoots. From the entry's lesson.
 * Sources (written; 7 requests, 5 s apart, generic UA, cached in scratchpad/films/src-cache/):
 *  - UEFA.com match report "Ruthless Russia dash Croatia's final hopes", Wayne Harrison, Arena Zagreb, 9 Feb 2012 (archived):
 *    https://web.archive.org/web/2012/http://www.uefa.com/futsaleuro/season=2012/matches/round=2000148/match=2008817/postmatch/report/index.html
 *    — "Semi-finals - 09/02/2012 - 18:30CET - Arena Zagreb"; goals Prudnikov 0:35, Cirilo 5:07, Abramov 15:30, Pula 20:41, Marinović
 *    26:48, 36:32; "a competition record 14,300 crowd"; "Cirilo, from Aleksandr Fukin's threaded pass, beat Jukić first time in the sixth
 *    minute"; "Russia are through to the final … for the fourth time".
 *  - UEFA.com minute-by-minute commentary (same match, archived …/postmatch/commentary/index.html): "5:07 Cirilo (Russia) scores! …
 *    Aleksandr Fukin plsys [plays] the ball in from the left and Cirilo turns the ball past Jukić"; "5:30 … Croatia … call an early time-out".
 *  - UEFA.com photo gallery (same match): captions "Franko Jelovčić (Croatia) & Cirilo (Russia)", "Russia celebrate" (images not reachable).
 *  - UEFA.com "Cirilo's pivot guide" (6 Feb 2012): "The Russia and MFK Dinamo Moskva forward offers you a futsal masterclass … how to
 *    master the pivot position" (a video; only the blurb survives) — he is UEFA's own example of the pivot.
 *  - Wikipedia, "Cirilo (futsal player)" (raw): full name, born São Paulo 20 Jan 1980, 1.83 m, pivot, Dinamo 2004–17, Russia 2006–14.
 *  - Wikipedia, "UEFA Futsal Euro 2012" (raw, cached): semi-final 9 Feb 2012 18:30, Croatia 2–4 Russia, Arena Zagreb, att. 14,300.
 *  - UEFA.com EURO 2014 line-ups (cached): Russia no. 11 Cirilo (FIFA 2012 World Cup line-ups too: [11] SIRILO).
 * CONFIRMED: match, round, date, venue, record crowd, 0–1 before and 0–2 after, the 5:07 goal, Fukin's threaded pass from the LEFT, the
 *  FIRST-TIME finish that "turns" the ball past the keeper Ivo Jukić, the 2–4 result and Russia into the final.
 * INFERRED (not named in the narration): which end Russia attacked, every court position, the far-post side of the finish, the RIGHT foot
 *  (library default), the ball's height, the other players' movements; kits (Croatia red shirts / white shorts — their red-and-white
 *  checks simplified to red; Russia white shirts / blue shorts, as the other 2012 films infer; Jukić in a yellow keeper top); shirt no. 11
 *  at this EURO (taken from 2012 WC / EURO 2014). No video was reviewed. Chapter 3 is a demonstration of the signature, not match footage.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the turn, the lay-off and the shot). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps
 * library z → −Z. The replay reuses the LIVE generators through one rotation (live (X,Z) → replay (Z−10, GZ−(X+20)), yaw − 90°): a 1:1 replay.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: red (Croatia, run arrows), yellow (Jukić, lights, pass lines, rings), blue (court, Russia trim), navy (key line, run-off, stands).
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
 {label:'Live: the 2012 semi-final',text:'The 2012 Futsal Euro semi-final: Croatia against Russia, in Zagreb. In the sixth minute, Fukin threads the ball in from the left. Cirilo turns it first time past the keeper. Two nil!',tail:2.6,
  cues:['The 2012','Croatia against','in Zagreb','In the sixth','Fukin threads','from the left','Cirilo turns','past the keeper','Two nil'],
  heads:{'The 2012':'Euro semi-final 2012','Croatia against':'Croatia v Russia','in Zagreb':'Arena Zagreb','In the sixth':'5:07','Two nil':'0–2'}},
 {label:'Replay: one touch',text:'Watch again, in slow motion. One touch, and it’s in! Russia win four two and reach the final!',tail:2.4,
  cues:['Watch again','in slow motion','One touch','Russia win','reach the final'],heads:{'Watch again':'Replay','Russia win':'Croatia 2–4 Russia','reach the final':'Into the final'}},
 {label:'Hold it up',text:'How does a pivot hold it up? He keeps his body between the ball and the defender. He waits for his teammates. Then he lays it off! Keep the ball and wait for your teammates to join the attack.',tail:2.6,
  cues:['How does','He keeps','between the ball','He waits','Then he lays','Keep the ball'],heads:{'How does':'How he does it','Keep the ball':'Keep it, then lay it off'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/cirilo-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/cirilo-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/cirilo-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('cirilo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('cirilo: no cue '+w);return c.at;};
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
const SKIN:InkFill[]=[[Y,.84],[R,.32]];
const BUILD:Build={height:1.83,bulk:1.04};
/** Cirilo: Russia no. 11 (inferred for this EURO) — white shirt, blue shorts and trim (kit inferred), short dark hair, 1.83 m, a pivot's frame */
const CIRILO:AthleteStyle={shirt:'paper',shorts:B,socks:'paper',boots:K,skin:SKIN,hair:K,line:K,trim:B,number:11,numberInk:B,hairStyle:'short',build:BUILD,seed:11};
/** the demonstration: Cirilo in a yellow training bib (no match claimed) */
const CIRILO_TRAIN:AthleteStyle={...CIRILO,shirt:Y,shorts:K,socks:K,trim:K,number:undefined,seed:12};
/** Aleksandr Fukin, Russia (white; number not shown) */
const FUKIN:AthleteStyle={shirt:'paper',shorts:B,socks:'paper',boots:K,skin:[[Y,.72],[R,.2]],hair:K,line:K,trim:B,hairStyle:'short',build:{height:1.75},seed:13};
const RUS=(n:number):AthleteStyle=>({shirt:'paper',shorts:B,socks:'paper',boots:K,skin:[[Y,.74],[R,.22]],hair:K,line:K,trim:B,hairStyle:n%2?'bald':'short',build:{height:1.74+hash(n,4)*.1},seed:40+n});
/** Croatia (red shirts — the checks simplified — white shorts, blue socks; inferred) */
const CRO=(n:number):AthleteStyle=>({shirt:R,shorts:'paper',socks:B,boots:K,skin:[[Y,.7],[R,.2]],hair:K,line:K,trim:'paper',hairStyle:(['short','curly','bald','short'] as const)[n%4],build:{height:1.76+hash(n,3)*.12},seed:20+n});
/** Ivo Jukić, Croatia's keeper — a yellow keeper kit (inferred) */
const JUKIC:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.7],[R,.2]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.86},seed:62};
/** demonstration: neutral paper training tops (team-mates), a navy bib (defender), a red training keeper top */
const DEMO=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:n?'curly':'short',build:{height:1.76+.03*n},seed:77+n});
const DEMO_D:AthleteStyle={shirt:K,shorts:'paper',socks:K,boots:K,skin:[[Y,.76],[R,.24]],hair:K,line:K,trim:Y,hairStyle:'bald',build:{height:1.82,bulk:1.04},seed:81};
const DEMO_K:AthleteStyle={shirt:[R,.85],shorts:K,socks:[R,.85],boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:83};
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
/** stepped navy rows, lit faces, red / yellow / blue shirts in the crowd (a home crowd in red), roof lights; cheer lifts the heads */
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

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Croatia's goal at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void;under?:()=>void;quiet?:boolean}={}){
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
 if(o.quiet){const rows=new Path2D(),rowH=.55*kw;s.fill(K,rectPath(-span,wall-board-span,span*2,span),.62);for(let r=0;r<12;r+=2)rows.rect(-span,wall-board-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.35);}
 else stands(s,wall-board,kw,t,cheer,flash,st.cx);
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

// ================= chapter 1 — LIVE: EURO 2012 semi-final, 5:07 — Fukin threads it in from the left, Cirilo turns it first time, 0–2 =================
const C1={croatia:A(0,'Croatia against'),zagreb:A(0,'in Zagreb'),sixth:A(0,'In the sixth'),fukin:A(0,'Fukin'),left:A(0,'from the left'),turns:A(0,'Cirilo turns'),past:A(0,'past the keeper'),two:A(0,'Two nil'),end:AUTH[0].seconds};
/** the finish: first time (confirmed), right foot (inferred), from ≈5 m, turned toward the far post (inferred) */
const T_HIT=C1.turns+.42,T_IN=T_HIT+.3,PASS0=Math.max(C1.fukin+.45,T_HIT-1.35),POW=.5;
const SHOT:[number,number]=[-15.3,7.7],LOWC:V3=[GOAL_X+.08,.3,POST_F-.42];
const YAW_SHOT=yawTo(LOWC[0]-SHOT[0],LOWC[2]-SHOT[1]);
const SB=toeBall(strike(STRIKE_CONTACT,{power:POW}),BUILD,YAW_SHOT),PLANT:[number,number]=[SHOT[0]-SB[0],SHOT[1]-SB[2]];
/** Fukin: carries it along the near wing (Russia's LEFT, attacking −X), then threads it in to the pivot */
const PASS_FROM:[number,number]=[-10.4,3.0],FK_YAW=yawTo(SHOT[0]-PASS_FROM[0],SHOT[1]-PASS_FROM[1]);
const FB=toeBall(strike(STRIKE_CONTACT,{power:.4}),{height:1.75},FK_YAW),FPL:[number,number]=[PASS_FROM[0]-FB[0],PASS_FROM[1]-FB[2]];
const liveF:Gen=T=>{
 const X=key(T,[[0,FPL[0]+7.6],[PASS0-.4,FPL[0]+.35,easeOut],[PASS0,FPL[0]],[PASS0+.8,FPL[0]-.9,easeIO],[T_IN+.3,FPL[0]-2.0],[C1.end,PLANT[0]+2.6,easeIO]]);
 const Z=key(T,[[0,FPL[1]-.3],[PASS0-.4,FPL[1]-.05],[PASS0,FPL[1]],[PASS0+.8,FPL[1]+.5],[T_IN+.3,FPL[1]+1.2],[C1.end,3.6,easeIO]]);
 let pose:Pose,yaw=FACE_LEFT;
 const pT=key(T,[[PASS0-.4,.2],[PASS0,STRIKE_CONTACT],[PASS0+.55,.85]],linear);
 if(T<PASS0-.4)pose=dribble(T*1.5,{foot:'r',speed:.4});
 else if(T<PASS0+.55){pose=blendPose(dribble((PASS0-.4)*1.5,{foot:'r',speed:.4}),strike(pT,{power:.4}),sm(PASS0-.4,PASS0-.28,T));yaw=lerp(FACE_LEFT,FK_YAW,sm(PASS0-.5,PASS0-.2,T));}
 else if(T<T_IN+.3){pose=blendPose(strike(.85,{power:.4}),runCycle(T*runCadence(.45),{speed:.45}),sm(PASS0+.55,PASS0+.8,T));yaw=FK_YAW-.3;}
 else{pose=celebrate((T-T_IN)*1.1,{kind:'run'});yaw=yawTo(PLANT[0]+2.6-FPL[0],3.6-FPL[1]);}
 return{pose,yaw,X,Z};};
/** Cirilo live: the pivot, facing the passer with his back half to goal; a check step as the pass comes, then the first-time TURN and finish */
const C_START:[number,number]=[-13.9,6.3],LOOK_F=yawTo(PASS_FROM[0]-C_START[0],PASS_FROM[1]-C_START[1]);
const S_T0=T_HIT-.55,RUN0=PASS0-.1;
const liveC:Gen=T=>{
 const stT=key(T,[[S_T0,.14],[S_T0+.3,.26],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,1]],linear);
 const X=key(T,[[0,C_START[0]+.4],[RUN0,C_START[0],easeIO],[S_T0,PLANT[0]+.55,easeIO],[T_HIT,PLANT[0],easeOut],[T_HIT+.5,PLANT[0]-.3,easeOut],[C1.end,PLANT[0]+1.5,easeIO]]);
 const Z=key(T,[[0,C_START[1]-.3],[RUN0,C_START[1],easeIO],[S_T0,PLANT[1]-.35,easeIO],[T_HIT,PLANT[1],easeOut],[T_HIT+.5,PLANT[1]+.2,easeOut],[C1.end,4.6,easeIO]]);
 const check=blendPose(stand(),runCycle(Math.max(0,T-RUN0)*runCadence(.3),{speed:.3}),.5*sm(RUN0,RUN0+.3,T));
 let pose:Pose=blendPose(check,backpedal(T*.9),.3*(1-sm(RUN0,RUN0+.3,T))),yaw=LOOK_F;
 if(T>=S_T0&&T<T_HIT+.55){pose=blendPose(check,strike(stT,{power:POW}),sm(S_T0,S_T0+.12,T));yaw=lerp(LOOK_F,YAW_SHOT,sm(S_T0,T_HIT-.06,T,easeIO));}
 else if(T>=T_HIT+.55){const u=sm(T_HIT+.55,T_HIT+1.1,T,easeIO);pose=blendPose(strike(1,{power:POW}),celebrate((T-T_HIT-.55)*1.3,{kind:'run'}),u);yaw=lerp(YAW_SHOT,yawTo(.6,-1),u);}
 return{pose,yaw,X,Z};};
/** the ball: at Fukin's feet → threaded in, rolling (still quick when it reaches Cirilo) → turned first time toward the far post → in */
const PASS_EASE=(x:number)=>x*(1.3-.3*x);
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 if(T<PASS0-.4){const o=liveF(T);return{X:o.X-.5,Y:BALL_R,Z:o.Z+.12,flying:false,spin:T*6};}
 if(T<PASS0){const o=liveF(PASS0-.4),u=sm(PASS0-.4,PASS0-.1,T);return{X:lerp(o.X-.5,PASS_FROM[0],u),Y:BALL_R,Z:lerp(o.Z+.12,PASS_FROM[1],u),flying:false,spin:T*6};}
 if(T<T_HIT){const u=sm(PASS0,T_HIT,T,PASS_EASE);return{X:lerp(PASS_FROM[0],SHOT[0],u),Y:BALL_R,Z:lerp(PASS_FROM[1],SHOT[1],u),flying:false,spin:8+u*12};}
 if(T<T_IN){const u=sm(T_HIT,T_IN,T,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(SHOT[0],LOWC[0],.5),.42,lerp(SHOT[1],LOWC[2],.5)];
  return{X:a*SHOT[0]+b*M[0]+c*LOWC[0],Y:a*BALL_R+b*M[1]+c*LOWC[1],Z:a*SHOT[1]+b*M[2]+c*LOWC[2],flying:true,spin:20+u*40};}
 const d=sm(T_IN+.1,T_IN+.4,T,easeIn);
 return{X:GOAL_X-.6,Y:lerp(LOWC[1],BALL_R,d),Z:LOWC[2]+.1,flying:false,spin:60};
}
/** Croatia (red, defending −X, facing +X): 0 marks Cirilo from behind (goal side) and is turned by the one touch; 1 goes to Fukin */
type Mark={x:number[];z:number[];ph:number};
const CROATIA:Mark[]=[{x:[-16.2,-16.4,-16.9],z:[6.1,6.3,6.6],ph:.1},{x:[-8.4,-9.4,-11.4],z:[4.7,4.4,4.8],ph:.4},{x:[-7.2,-8.8,-10.8],z:[10.9,10.4,9.8],ph:.7},{x:[-12.0,-13.0,-14.2],z:[12.9,12.5,11.8],ph:.2}];
const croAt=(m:Mark,T:number):[number,number]=>{const u1=sm(0,PASS0,T),u2=sm(PASS0,T_HIT+.3,T);return[lerp(lerp(m.x[0],m.x[1],u1),m.x[2],u2),lerp(lerp(m.z[0],m.z[1],u1),m.z[2],u2)];};
const liveCro=(i:number):Gen=>T=>{const m=CROATIA[i],[X,Z]=croAt(m,T),post=sm(T_IN+.3,T_IN+1.3,T);let pose=backpedal(T*1.4+m.ph);
 if(i===0){const lu=key(T,[[T_HIT-.25,0],[T_HIT+.12,.6],[T_HIT+.6,1]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_HIT-.35,T_HIT-.2,T));}
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20}),post);
 const look=i===0?lerp(-.5,.4,sm(PASS0,T_HIT,T)):i===1?-.5:0;
 return{pose,yaw:FACE_RIGHT+look+(i%2?.2:-.2)*post,X,Z};};
/** Russia's other two (white): after the goal they run to Cirilo */
const RUS_POS:[number,number][]=[[-5.8,9.8],[-10.4,14.4]];
const liveRus=(i:number):Gen=>T=>{const[x0,z0]=RUS_POS[i],go=sm(T_IN+.25,C1.end,T,easeIO),f=liveC(C1.end);const X=lerp(x0-1.4*sm(0,PASS0,T),f.X+[1.3,-1.0][i],go),Z=lerp(z0,f.Z+[1.1,1.3][i],go);
 let pose=blendPose(stand(),runCycle(T*runCadence(.3)+i*.5,{speed:.3}),.6*(1-sm(PASS0,PASS0+.5,T)));
 if(go>0)pose=blendPose(pose,celebrate(T*1.1+i*.3,{kind:'run'}),sm(T_IN+.25,T_IN+.7,T));
 return{pose,yaw:go>0?yawTo(f.X-x0,f.Z-z0):FACE_LEFT+(i?.4:-.2),X,Z};};
/** Jukić: set, shading toward the pass, then a late dive toward the far post — beaten */
const DIVE0=T_HIT+.06;
const liveK:Gen=T=>{let pose=keeperSet(T*1.3);
 const b=liveBall(Math.min(T,T_HIT));
 if(T>=DIVE0){const u=sm(DIVE0,DIVE0+.9,T,linear)*.95;pose=blendPose(keeperSet(DIVE0*1.3),keeperDive(u,{side:'l',height:.12}),sm(DIVE0,DIVE0+.1,T));}
 const yaw=FACE_RIGHT-.3*sm(PASS0,T_HIT,T)*(1-sm(DIVE0,DIVE0+.25,T));
 return{pose,yaw,X:GOAL_X+.85,Z:clamp(lerp(10,b.Z,.3),8.9,10.6)+.35*sm(DIVE0+.05,DIVE0+.5,T,easeOut)};};
const liveCam=(T:number)=>({x:key(T,mono([[0,-4.6],[C1.sixth,-6.6],[PASS0,-9.8],[T_HIT-.4,-13.8],[T_HIT,-15.2],[T_IN,-16.0],[T_IN+.5,-16.0],[C1.end-1,-14.6],[C1.end,-14.2]]),easeInOutSine),
 zoom:key(T,mono([[0,.58],[C1.zagreb,.56],[C1.sixth,.6],[PASS0,.62],[T_HIT-.3,.64],[T_IN,.66],[T_IN+.9,.74],[C1.end,.86]]),easeInOutSine),
 y:key(T,mono([[0,1120],[C1.sixth,1150],[PASS0,1200],[T_HIT,1240],[T_IN+.4,1260],[C1.end,1360]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_HIT,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.12+.35*pulse(T,C1.zagreb,1.2),flash:pulse(T,T_IN,1.2)+.5*pulse(T,C1.zagreb,1),bulge:.5*sm(T_IN-.12,T_IN,T)*(1-.6*sm(T_IN+.2,T_IN+1.1,T))+.12*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:LOWC[2],by:LOWC[1],
  keeper:()=>{athlete(s,st,liveK,T,JUKIC,{detail:'low'});},
  under:()=>{
   // "Croatia against Russia": red rings on the reds, then yellow on the whites (a roll-call of the two teams)
   const cr=easeOutBack(sm(C1.croatia,C1.croatia+.3,T))*(1-sm(C1.zagreb-.1,C1.zagreb+.2,T)),ru=easeOutBack(sm(C1.croatia+.6,C1.croatia+.9,T))*(1-sm(C1.zagreb+.1,C1.zagreb+.4,T));
   if(cr>.02)CROATIA.forEach((_,i)=>{const g=liveCro(i)(T);floorDashRing(s,st,R,g.X,g.Z,.7,7,511+i,cr);});
   if(ru>.02){const f=liveF(T),cc=liveC(T);floorDashRing(s,st,Y,f.X,f.Z,.7,7,520,ru);floorDashRing(s,st,Y,cc.X,cc.Z,.7,7,521,ru);RUS_POS.forEach((_,i)=>{const e=liveRus(i)(T);floorDashRing(s,st,Y,e.X,e.Z,.7,7,522+i,ru);});}
   // "Fukin threads the ball in": the pass line draws ahead of the ball (yellow), from Fukin to Cirilo
   const pl=sm(C1.fukin,C1.fukin+.5,T,easeOut)*(1-sm(T_HIT,T_HIT+.3,T));if(pl>.02)floorArrow(s,st,Y,[PASS_FROM[0]-.3,PASS_FROM[1]+.2],[SHOT[0]+.35,SHOT[1]-.3],.1,530,pl,-.06);
   // "from the left": a yellow ring on Fukin, out on the near (left) wing
   const fl=easeOutBack(sm(C1.left,C1.left+.3,T))*(1-sm(T_HIT-.2,T_HIT+.2,T));if(fl>.02){const f=liveF(T);floorDashRing(s,st,Y,f.X,f.Z,.8,8,531,fl);}
   // "Cirilo turns": a red ring finds him and a red curved arrow shows the turn toward goal
   const cc=liveC(T),find=easeOutBack(sm(C1.turns,C1.turns+.3,T))*(1-sm(T_HIT+.3,T_HIT+.6,T));floorDashRing(s,st,R,cc.X,cc.Z,.85,8,532,find);
   const tu=sm(C1.turns,C1.turns+.45,T,easeOut)*(1-sm(T_HIT+.2,T_HIT+.5,T));if(tu>.02)floorArrow(s,st,R,[PLANT[0]+1.1,PLANT[1]-.6],[PLANT[0]-1.0,PLANT[1]+.9],.09,533,tu,.45);
   // "past the keeper": a yellow dashed ring on the floor where it went in
   const pk=easeOutBack(sm(C1.past,C1.past+.3,T))*(1-sm(C1.end-1,C1.end-.5,T));floorDashRing(s,st,Y,GOAL_X+.3,LOWC[2],.7,9,534,pk);
  }});
 // everyone back to front by depth (far side first); the ball slots in by its depth
 type It={z:number;draw:()=>void};const items:It[]=[];
 CROATIA.forEach((_,i)=>{const g=liveCro(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,CRO(i),{detail:'mid'})});});
 RUS_POS.forEach((_,i)=>{const g=liveRus(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,RUS(i),{detail:'low'})});});
 items.push({z:liveF(T).Z,draw:()=>athlete(s,st,liveF,T,FUKIN,{detail:'low'})});
 items.push({z:liveC(T).Z,draw:()=>athlete(s,st,liveC,T,CIRILO,{smear:T>T_HIT-.3&&T<T_HIT+.25?.12:0})});
 items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45);
  if(b.flying){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_HIT,T-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.5,{seed:17,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.5:0,dir:Math.PI-.6});
  if(T>=T_HIT&&T<T_HIT+.3)sparkBurst(s,Y,p[0],p[1],r*3,{n:9,seed:19,g:easeOut(sm(T_HIT,T_HIT+.25,T))});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** a figure's chest (the passage enters his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveC(tt),.12));},still:T_HIT+.05};

// ================= chapter 2 — REPLAY: slow motion, low, behind Cirilo: the pass in, the one-touch turn, the net; Russia into the final =================
const C2={watch:A(1,'Watch'),slow:A(1,'in slow'),one:A(1,'One touch'),win:A(1,'Russia win'),final:A(1,'reach the final'),end:AUTH[1].seconds};
/** the rotation: live (X,Z) → replay (Z − 10, GZ − (X − GOAL_X)); live yaw → yaw − 90° (a rotation, so feet stay feet) */
const rot=(X:number,Z:number):[number,number]=>[Z-10,GZ-(X-GOAL_X)];
const rotGen=(g:Gen):Gen=>t=>{const a=g(t),[X,Z]=rot(a.X,a.Z);return{pose:a.pose,yaw:a.yaw-Math.PI/2,X,Z};};
/** replay clock → live clock: the pass at about half speed, the touch and the ball into the net at a third; then near real time */
const R_HIT=C2.one+.15,R_IN=C2.one+.85;
const RL=(t:number)=>key(t,mono([[0,PASS0-.35],[R_HIT,T_HIT-.02],[R_IN,T_IN+.02],[C2.win,T_IN+.75],[C2.end,T_IN+.75+(C2.end-C2.win)*.8]]),linear);
const repC=rotGen(liveC),repF=rotGen(liveF),repK=rotGen(liveK),repCro=CROATIA.map((_,i)=>rotGen(liveCro(i))),repRus=RUS_POS.map((_,i)=>rotGen(liveRus(i)));
function repBall(t:number){const b=liveBall(RL(t)),[X,Z]=rot(b.X,b.Z);return{X,Y:b.Y,Z,flying:b.flying};}
const A_SHOT=rot(SHOT[0],SHOT[1]);
const st2:Stage={F:2200,eye:1.6,cx:A_SHOT[0]-.6,cz:A_SHOT[1]-8};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,T=RL(tt),hit=pulse(t,R_HIT,.4),net=pulse(t,R_IN,.6),goal=T>=T_IN;
  camPath(s,t,[[0,240,250,1.0],[C2.slow,210,250,1.06],[C2.one-.3,270,230,1.2],[R_HIT,360,215,1.3],[R_IN,560,195,1.42],[R_IN+.4,560,195,1.45],[C2.win,-160,290,.92],[C2.final+.4,-330,300,.86],[C2.end,-360,300,.86]],[8*hit*Math.sin(t*90),5*hit*Math.cos(t*77)+4*net*Math.sin(t*60)]);
  const b=repBall(tt);
  arena(s,st,{t:tt,cheer:goal?1-.35*sm(C2.end-1,C2.end,tt):.1,flash:pulse(tt,R_IN,1.2)+.7*pulse(tt,C2.final,1.4),bulge:.55*sm(R_IN-.2,R_IN,tt)*(1-.6*sm(R_IN+.4,R_IN+1.4,tt))+.12*settle(tt,R_IN,{amp:1,freq:3,decay:3}),bx:LOWC[2]-10,by:LOWC[1],
   keeper:stg=>{athlete(s,stg,repK,T,JUKIC,{detail:'mid'});}});
  // "in slow motion": the pass line (yellow dashes) drawn along the ball's path from the left
  const pl=sm(C2.slow,C2.slow+.4,tt,easeOut)*(1-sm(R_HIT+.3,R_HIT+.7,tt));
  if(pl>.02){const a=rot(PASS_FROM[0]-1.2,PASS_FROM[1]-1.2),c=rot(SHOT[0]+.25,SHOT[1]-.2);floorArrow(s,st,Y,a,c,.08,640,pl,.05);}
  // "One touch": a red ring snaps round the touch, then the flight line into the net
  const ot=easeOutBack(sm(C2.one,C2.one+.25,tt))*(1-sm(R_IN,R_IN+.4,tt));if(ot>.02)floorDashRing(s,st,R,A_SHOT[0],A_SHOT[1],.5,8,641,ot);
  if(tt>R_HIT&&T<T_IN+1){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=repBall(lerp(R_HIT,Math.min(tt,R_IN),k/14));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,10,642,{dash:40});}
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(-.1,-.35);shadow(s,g[0],g[1],r*1.1,r*.3,96,b.flying?.3:.45);
   if(b.flying)speedLines(s,R,p[0],p[1],dir,{n:5,seed:604+Math.floor(tt*6),len:r*3.5,spread:r*.8,width:5});
   ball(s,p[0],p[1],r,97,{rot:tt*5,smear:b.flying?.4:0,dir});
   if(tt>=R_HIT&&tt<R_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:98,g:easeOut(sm(R_HIT,R_HIT+.3,tt))});};
  const its:{z:number;draw:()=>void}[]=[];
  repCro.forEach((g,i)=>{const a=g(T);if(a.Z<st.cz+(i===0?2.5:5))return;its.push({z:a.Z,draw:()=>athlete(s,st,g,T,CRO(i),{detail:'mid'})});});
  const whites:[Gen,AthleteStyle,number][]=[[repC,CIRILO,0],[repF,FUKIN,1],[repRus[0],RUS(0),2],[repRus[1],RUS(1),3]];
  whites.forEach(([g,style,i])=>{const a=g(T);if(a.Z<st.cz+(i===0?2.5:5.5))return;its.push({z:a.Z,draw:()=>athlete(s,st,g,T,style,{detail:i===0?'high':'mid',smear:i===0&&T>T_HIT-.3&&T<T_HIT+.3?.25:0})});});
  its.push({z:b.Z,draw:drawBall});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=R_IN&&tt<R_IN+1.2){const p=proj(st,LOWC[2]-10,.34,GZ+.4);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:99,g:easeOut(sm(R_IN,R_IN+.3,tt))*(1-sm(R_IN+.8,R_IN+1.2,tt))});}
  // "reach the final": a big yellow tick stamps over the stands
  const tick=easeOutBack(sm(C2.final,C2.final+.35,tt));
  if(tick>.02){const c=proj(st,-2.6,3.2,GZ+.5),S=170*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:660,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:661,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:662,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 aperture(t0){const{tt}=clock(1,t0),b=repBall(tt),p=proj(st2,b.X,b.Y,b.Z),r=Math.max(10,kAt(st2,b.Z)*BALL_R)*1.1,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return aperture(q);},
 still:R_HIT+.4,
};

// ================= chapter 3 — HOW HE DOES IT (demonstration, training bibs): back to goal, shield, wait, lay it off, the runner shoots =================
const C3={how:A(2,'How does'),keeps:A(2,'He keeps'),between:A(2,'between'),waits:A(2,'He waits'),lays:A(2,'Then he lays'),lesson:A(2,'Keep the ball'),end:AUTH[2].seconds};
/** the demo, SIDE-ON (the broadcast side, lower and closer, quiet stands): the goal on the left at X = −20. The pivot (yellow bib) stands
 * 5 m out with his BACK to goal (facing +X); the defender is tight behind him (goal side); ball — pivot — defender in one line, so the
 * body between them reads at a glance. The pass comes in from the right; the runner arrives on the near side (toward the camera). */
const PIV:[number,number]=[-15.2,8.4],DEF0:[number,number]=[-16.15,8.55],PAS0:[number,number]=[-8.2,9.3],RUNB0:[number,number]=[-9.4,4.5];
const D_PASS=C3.how+.55,D_REC=D_PASS+.95,D_LAY=C3.lays+.25,D_SHOT=D_LAY+.7,D_GOAL=D_SHOT+.4;
/** the lay-off spot (the runner meets it first time) and his shot, low inside the near post (keeper's right) */
const LAY_PT:[number,number]=[-13.6,6.6],GOAL_T:V3=[GOAL_X,.36,POST_N+.55];
const B_YAW=yawTo(GOAL_T[0]-LAY_PT[0],GOAL_T[2]-LAY_PT[1]);
const BBt=toeBall(strike(STRIKE_CONTACT,{power:.8}),{height:1.79},B_YAW),B_PLANT:[number,number]=[LAY_PT[0]-BBt[0],LAY_PT[1]-BBt[2]];
const ph3=(t:number)=>t*3.1;
/** the hold: the pivot sways with the defender (always in the way), stilled for the lay-off; the sole rolls the ball */
const holdOn=(t:number)=>sm(D_REC,D_REC+.4,t)*(1-sm(D_LAY-.7,D_LAY-.35,t));
const sway=(t:number)=>.14*Math.sin(ph3(t)+.3)*holdOn(t);
const REC:[number,number]=[PIV[0]+.46,PIV[1]];
const HOLD=(t:number):[number,number]=>[PIV[0]+.36,PIV[1]+sway(t)-.1*Math.sin(ph3(t))*holdOn(t)];
const LAY_YAW=yawTo(LAY_PT[0]-HOLD(D_LAY)[0],LAY_PT[1]-HOLD(D_LAY)[1]);
const LB=toeBall(strike(STRIKE_CONTACT,{power:.25}),BUILD,LAY_YAW),L_BALL:[number,number]=[PIV[0]+LB[0],PIV[1]+LB[2]];
/** the shield: low, wide, bottom back into the defender, arms out behind to feel him; the right sole rolls the ball */
function shield(t:number):Pose{const s1=Math.sin(ph3(t));
 return posed({lHipF:20,rHipF:12+12*s1,lHipA:16,rHipA:14,lHipR:10,rHipR:8,lKnee:52,rKnee:36+16*Math.max(0,s1),lAnk:-4,rAnk:-16,lean:28,pitch:5,twist:7*s1,neckP:20,neckY:-12*s1,
  lShF:-26,rShF:-20,lShA:46,rShA:38,lElb:36,rElb:30,lHand:.7,rHand:.7});}
const demoC:Gen=t=>{
 let pose:Pose=blendPose(stand(),backpedal(t*.8),.25),yaw=FACE_RIGHT;
 // receive: right sole out to meet the pass
 const rc=sm(D_REC-.35,D_REC-.05,t);
 if(rc>0)pose=blendPose(pose,posed({lHipF:16,rHipF:30,lKnee:40,rKnee:24,rAnk:-24,lean:20,neckP:30,lShA:40,rShA:36,lShF:-10,rShF:-8,lElb:34,rElb:30}),rc);
 const sh=sm(D_REC+.05,D_REC+.35,t);
 if(sh>0)pose=blendPose(pose,shield(t),sh);
 if(t>=D_LAY-.45){const pT=key(t,[[D_LAY-.45,.2],[D_LAY,STRIKE_CONTACT],[D_LAY+.55,.9]],linear);pose=blendPose(pose,strike(pT,{power:.25}),sm(D_LAY-.45,D_LAY-.3,t));yaw=lerp(FACE_RIGHT,LAY_YAW,sm(D_LAY-.6,D_LAY-.25,t));}
 if(t>=D_LAY+.55){const u=sm(D_LAY+.55,D_LAY+.9,t);pose=blendPose(strike(.9,{power:.25}),stand(),u);yaw=lerp(LAY_YAW,yawTo(-1,-.4),u);}
 if(t>=D_GOAL+.1)pose=blendPose(pose,celebrate((t-D_GOAL)*1.2,{kind:'arms'}),sm(D_GOAL+.1,D_GOAL+.4,t));
 return{pose,yaw,X:PIV[0],Z:PIV[1]+sway(t)};};
/** the defender: tight behind him, leaning in; jabs round one side, then the other — the pivot's body is always in the way */
const demoD:Gen=t=>{
 let pose:Pose=posed({lHipF:30,rHipF:22,lHipA:14,rHipA:14,lKnee:46,rKnee:40,lean:24,pitch:4,neckP:24,lShF:34,rShF:24,lShA:22,rShA:26,lElb:44,rElb:38});
 const j1=key(t,[[C3.between,0],[C3.between+.35,.6],[C3.between+.9,1]],linear),j2=key(t,[[C3.waits+.3,0],[C3.waits+.65,.6],[C3.waits+1.2,1]],linear);
 pose=blendPose(pose,lunge(j1,{side:'r'}),.8*sm(C3.between-.1,C3.between+.1,t)*(1-sm(C3.between+.9,C3.between+1.3,t)));
 pose=blendPose(pose,lunge(j2,{side:'l'}),.8*sm(C3.waits+.2,C3.waits+.4,t)*(1-sm(C3.waits+1.2,C3.waits+1.6,t)));
 const turn=sm(D_LAY,D_LAY+.5,t);
 return{pose:blendPose(pose,backpedal(t*1.3),turn*.5),yaw:FACE_RIGHT+.3*Math.sin(ph3(t)+.3)*(1-turn)-.7*turn,X:DEF0[0]+.12*sm(D_REC,D_REC+.4,t)-.4*turn,Z:DEF0[1]+sway(t)*1.2-.5*turn};};
/** the passer: plays it into the pivot's feet from the right, then runs up in support (far side) */
const P_YAW=yawTo(REC[0]-PAS0[0],REC[1]-PAS0[1]);
const PBt=toeBall(strike(STRIKE_CONTACT,{power:.35}),{height:1.76},P_YAW),P_BALL:[number,number]=[PAS0[0]+PBt[0],PAS0[1]+PBt[2]];
const P_END:[number,number]=[-12.0,11.2];
const demoP:Gen=t=>{
 const pT=key(t,[[D_PASS-.4,.2],[D_PASS,STRIKE_CONTACT],[D_PASS+.55,.85]],linear),go=sm(C3.waits-.2,D_LAY,t,easeIO);
 let pose:Pose=dribble(t*1.2,{foot:'r',speed:.25}),yaw=P_YAW;
 if(t>=D_PASS-.4)pose=blendPose(pose,strike(pT,{power:.35}),sm(D_PASS-.4,D_PASS-.28,t));
 if(t>=D_PASS+.55)pose=blendPose(strike(.85,{power:.35}),stand(),sm(D_PASS+.55,D_PASS+.9,t));
 if(t>=C3.waits-.2&&t<D_LAY+.2){pose=blendPose(pose,runCycle(t*runCadence(.6),{speed:.6}),sm(C3.waits-.2,C3.waits,t));yaw=yawTo(P_END[0]-PAS0[0],P_END[1]-PAS0[1]);}
 if(t>=D_LAY+.2){pose=blendPose(runCycle(t*runCadence(.6),{speed:.6}),stand(),sm(D_LAY+.2,D_LAY+.5,t));yaw=FACE_LEFT;}
 if(t>=D_GOAL+.2)pose=blendPose(pose,celebrate((t-D_GOAL)*1.1+.3,{kind:'arms'}),sm(D_GOAL+.2,D_GOAL+.5,t));
 return{pose,yaw,X:lerp(PAS0[0],P_END[0],go),Z:lerp(PAS0[1],P_END[1],go)};};
/** the runner: waits on the near side, then (on "He waits") runs up to meet the lay-off and shoots first time */
const B_RUN0=C3.waits-.1,B_ST0=D_SHOT-.55;
const demoB:Gen=t=>{
 const stT=key(t,[[B_ST0,.14],[B_ST0+.3,.26],[D_SHOT,STRIKE_CONTACT],[D_SHOT+.55,1]],linear);
 const X=key(t,[[0,RUNB0[0]],[B_RUN0,RUNB0[0]-.3],[B_ST0,B_PLANT[0]+.6,easeIn],[D_SHOT,B_PLANT[0],easeOut],[D_SHOT+.6,B_PLANT[0]-.4,easeOut]]);
 const Z=key(t,[[0,RUNB0[1]],[B_RUN0,RUNB0[1]+.1],[B_ST0,B_PLANT[1]-.25,easeIn],[D_SHOT,B_PLANT[1],easeOut],[D_SHOT+.6,B_PLANT[1]+.2,easeOut]]);
 const ry=yawTo(B_PLANT[0]-RUNB0[0],B_PLANT[1]-RUNB0[1]);
 let pose:Pose=blendPose(stand(),runCycle(t*runCadence(.2),{speed:.2}),.5),yaw=yawTo(PIV[0]-RUNB0[0],PIV[1]-RUNB0[1]);
 if(t>=B_RUN0&&t<B_ST0){const sp=.5+.4*sm(B_RUN0,B_ST0,t);pose=blendPose(pose,runCycle((t-B_RUN0)*runCadence(sp)*1.1,{speed:sp}),sm(B_RUN0,B_RUN0+.3,t));yaw=ry;}
 else if(t>=B_ST0&&t<D_SHOT+.6){pose=blendPose(runCycle((B_ST0-B_RUN0)*runCadence(.9)*1.1,{speed:.9}),strike(stT,{power:.8}),sm(B_ST0,B_ST0+.12,t));yaw=lerp(ry,B_YAW,sm(B_ST0,B_ST0+.3,t));}
 else if(t>=D_SHOT+.6){pose=blendPose(strike(1,{power:.8}),celebrate((t-D_SHOT)*1.2,{kind:'arms'}),sm(D_SHOT+.6,D_SHOT+.9,t));yaw=lerp(B_YAW,yawTo(.3,-1),sm(D_SHOT+.6,D_SHOT+1.1,t));}
 return{pose,yaw,X,Z};};
/** the keeper (red training top, no match claimed): set, then a late dive toward his near post — too late */
const demoK:Gen=t=>{let pose=keeperSet(t*1.2);const d0=D_SHOT+.06;
 if(t>=d0)pose=blendPose(keeperSet(d0*1.2),keeperDive(sm(d0,d0+.9,t,linear)*.95,{side:'r',height:.1}),sm(d0,d0+.1,t));
 return{pose,yaw:FACE_RIGHT-.3*sm(D_LAY-.2,D_SHOT,t),X:GOAL_X+.8,Z:10-.5*sm(D_LAY,D_SHOT,t)-.5*sm(d0+.05,d0+.5,t,easeOut)};};
function demoBall(t:number):{X:number;Y:number;Z:number;moving:boolean;flying:boolean}{
 const g=(X:number,Z:number,moving=false)=>({X,Y:BALL_R,Z,moving,flying:false});
 if(t<D_PASS-.3){const p=demoP(t),f=[Math.cos(p.yaw),Math.sin(p.yaw)];return g(p.X+f[0]*.45,p.Z+f[1]*.45);}
 if(t<D_PASS){const p=demoP(D_PASS-.3),f=[Math.cos(p.yaw),Math.sin(p.yaw)],u=sm(D_PASS-.3,D_PASS-.05,t);return g(lerp(p.X+f[0]*.45,P_BALL[0],u),lerp(p.Z+f[1]*.45,P_BALL[1],u));}
 if(t<D_REC){const u=sm(D_PASS,D_REC,t,PASS_EASE);return g(lerp(P_BALL[0],REC[0],u),lerp(P_BALL[1],REC[1],u),true);}
 if(t<D_LAY-.3){const h=HOLD(t),u=sm(D_REC,D_REC+.25,t);return g(lerp(REC[0],h[0],u),lerp(REC[1],h[1],u));}
 if(t<D_LAY){const h=HOLD(D_LAY-.3),u=sm(D_LAY-.3,D_LAY-.05,t);return g(lerp(h[0],L_BALL[0],u),lerp(h[1],L_BALL[1],u));}
 if(t<D_SHOT){const u=sm(D_LAY,D_SHOT,t,PASS_EASE);return g(lerp(L_BALL[0],LAY_PT[0],u),lerp(L_BALL[1],LAY_PT[1],u),true);}
 if(t<D_GOAL){const u=sm(D_SHOT,D_GOAL,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(LAY_PT[0],GOAL_T[0],.5),.5,lerp(LAY_PT[1],GOAL_T[2],.5)];
  return{X:a*LAY_PT[0]+b*M[0]+c*GOAL_T[0],Y:a*BALL_R+b*M[1]+c*GOAL_T[1],Z:a*LAY_PT[1]+b*M[2]+c*GOAL_T[2],moving:true,flying:true};}
 const d=sm(D_GOAL+.1,D_GOAL+.4,t,easeIn);return{X:GOAL_X-.6,Y:lerp(GOAL_T[1],BALL_R,d),Z:GOAL_T[2]+.1,moving:false,flying:false};}
const st3:Stage={F:2600,eye:3.0,cx:-16.2,cz:-6};
/** a floor arc round (X,Z) from angle a0 to a1 (the shield behind the pivot) */
function floorArc(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,a0:number,a1:number,w:number,seed:number,g:number){if(g<=.02)return;const q:Pt[]=[];for(let k=0;k<=14;k++){const a=lerp(a0,a1,k/14);q.push(proj(st,X+Math.cos(a)*r*g,0,Z+Math.sin(a)*r*g));}dashed(s,ink,q,w,seed,{dash:w*3.2});}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  camPath(s,t,[[0,700,400,.92],[D_PASS+.4,560,400,.95],[C3.keeps,180,380,1.5],[C3.between+.4,170,380,1.55],[C3.waits,330,420,1.0],[C3.lays,0,420,1.02],[D_GOAL,-100,410,1.05],[C3.lesson,-40,420,1.05],[C3.end,-30,420,1.04]]);
  const b=demoBall(tt);
  courtSide(s,st,tt,{quiet:true,bulge:.5*sm(D_GOAL-.1,D_GOAL,tt)*(1-.6*sm(D_GOAL+.3,D_GOAL+1.2,tt))+.1*settle(tt,D_GOAL,{amp:1,freq:3,decay:3}),bz:GOAL_T[2],by:GOAL_T[1],
   keeper:()=>{athlete(s,st,demoK,tt,DEMO_K,{detail:'mid'});},
   under:()=>{
    // "How does a pivot hold it up?": a yellow ring on the pivot
    const hw=easeOutBack(sm(C3.how,C3.how+.3,tt))*(1-sm(C3.keeps-.2,C3.keeps+.1,tt));if(hw>.02){const c=demoC(tt);floorDashRing(s,st,Y,c.X,c.Z,.8,8,701,hw);}
    // "He keeps his body between": a red shield arc behind him (toward the defender) …
    const shd=sm(C3.keeps,C3.keeps+.4,tt,easeOut)*(1-sm(D_LAY-.4,D_LAY,tt));if(shd>.02){const c=demoC(tt);floorArc(s,st,R,c.X,c.Z,.7,Math.PI-1.25,Math.PI+1.25,9,702,shd);}
    // … "between the ball and the defender": the ball ringed yellow, the defender navy
    const bt=easeOutBack(sm(C3.between,C3.between+.3,tt))*(1-sm(C3.waits+.2,C3.waits+.5,tt));if(bt>.02){const d=demoD(tt);floorDashRing(s,st,Y,b.X,b.Z,.35,6,703,bt);floorDashRing(s,st,K,d.X,d.Z,.7,7,704,bt);}
    // "He waits for his teammates": red run arrows show the two team-mates arriving
    const rw=sm(C3.waits,C3.waits+.5,tt,easeOut)*(1-sm(D_LAY,D_LAY+.3,tt));
    if(rw>.02){floorArrow(s,st,R,[RUNB0[0]-.4,RUNB0[1]+.2],[B_PLANT[0]+.5,B_PLANT[1]-.3],.09,705,rw,.1);floorArrow(s,st,R,[PAS0[0]-.5,PAS0[1]+.3],[P_END[0]+.4,P_END[1]-.2],.09,706,rw,-.1);}
    // "Then he lays it off": the lay-off line (yellow) into the runner's path
    const ly=sm(C3.lays,C3.lays+.35,tt,easeOut)*(1-sm(D_SHOT+.2,D_SHOT+.5,tt));if(ly>.02)floorArrow(s,st,Y,[L_BALL[0]+.15,L_BALL[1]-.2],[LAY_PT[0]-.1,LAY_PT[1]+.2],.08,707,ly,.06);
    // "Keep the ball": the pivot ringed yellow again
    const kb=easeOutBack(sm(C3.lesson,C3.lesson+.3,tt));if(kb>.02){const c=demoC(tt);floorDashRing(s,st,Y,c.X,c.Z,.8,8,708,kb);}
   }});
  if(tt>D_SHOT&&tt<D_GOAL+.8){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=demoBall(lerp(D_SHOT,Math.min(tt,D_GOAL),k/12));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,8,709,{dash:30});}
  const its:{z:number;draw:()=>void}[]=[
   {z:demoD(tt).Z,draw:()=>athlete(s,st,demoD,tt,DEMO_D,{detail:'mid'})},
   {z:demoC(tt).Z-.01,draw:()=>athlete(s,st,demoC,tt,CIRILO_TRAIN,{detail:'high',smear:tt>D_LAY-.25&&tt<D_LAY+.2?.15:0})},
   {z:demoP(tt).Z,draw:()=>athlete(s,st,demoP,tt,DEMO(0),{detail:'mid'})},
   {z:demoB(tt).Z,draw:()=>athlete(s,st,demoB,tt,DEMO(1),{detail:'mid',smear:tt>D_SHOT-.25&&tt<D_SHOT+.2?.15:0})},
   {z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=b.flying?Math.atan2(.2,1):Math.atan2(0,-1);shadow(s,g[0],g[1],r*1.1,r*.3,710,.45);
    if(b.moving)speedLines(s,R,p[0],p[1],dir,{n:4,seed:711+Math.floor(tt*6),len:r*2.6,spread:r*.7,width:4});
    ball(s,p[0],p[1],r,712,{rot:tt*5,smear:b.moving?.3:0,dir});
    if(tt>=D_SHOT&&tt<D_SHOT+.4)sparkBurst(s,Y,p[0],p[1],r*3,{n:10,seed:713,g:easeOut(sm(D_SHOT,D_SHOT+.3,tt))});}},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=D_GOAL&&tt<D_GOAL+1.1){const p=proj(st,GOAL_X-.4,.4,GOAL_T[2]);sparkBurst(s,Y,p[0],p[1],90,{n:12,seed:714,g:easeOut(sm(D_GOAL,D_GOAL+.3,tt))*(1-sm(D_GOAL+.7,D_GOAL+1.1,tt))});}
  // "Keep the ball …": a big yellow tick stamps above the play and stays for the lesson
  const tick=easeOutBack(sm(C3.lesson+.4,C3.lesson+.75,tt));
  if(tick>.02){const c=proj(st,-13.6,3.0,12),S=140*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:715,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:716,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:717,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:D_REC+1.2,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'cirilo-futsal-signature',format:'futsal',title:'Cirilo holds it up',theme:'Keep the ball and wait for your teammates to join the attack.',
 ageNote:'For players aged 7–12: the 2012 EURO semi-final goal is real; the last chapter is a training demonstration of how a pivot holds the ball up.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in to the touch point and is HELD — it stops dead and a red shield arc wraps behind it; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.5),bx=x-110+110*easeOut(u);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.22,seed+2,{n:16}),true),.3);
  if(u<1)speedLines(s,R,bx,y,0,{n:4,seed:seed+1,len:r*2.6,spread:r*.8,width:5});
  else{const g=easeOut(clamp((age-.5)/.3)),arc:Pt[]=[];for(let k=0;k<=10;k++){const a=-1.1+2.2*k/10;arc.push([x+Math.cos(a)*r*1.7*g,y+Math.sin(a)*r*1.7*g]);}
   if(g>.05)s.fill(R,ribbon(arc,9*g+2,{seed:seed+3,taper:.2,wobble:1}));if(age<1)sparkBurst(s,Y,x,y,r*2.2,{n:8,seed:seed+4,g});}
  ball(s,bx,y,r,seed,{rot:age*10*(1-u*.8),smear:u<1?.35*(1-u):0,dir:0});
 },
};
export default film;
