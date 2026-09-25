/** Alex Merlim — "the ala's shot from distance": a signature-move riso film (iconic plays, FUTSAL; Merlim is an ala / winger).
 *
 * WHO: the card's Alex Merlim is Alex Rodrigo da Silva Merlim ("Babalu"), born 15 Jul 1986 in Dourados, Brazil; 1.71 m; an ala; Italy
 *  international since 2010 (naturalised); Sporting CP since 2015, shirt 29. That matches the card: country Italy (playerAppearance.json)
 *  and bio "Brazilian-born Italy international who became a Sporting CP star, winning the UEFA Futsal Champions League in 2019, 2021 and
 *  2026" (playerBios.json). Same man in every source (no namesake, no country mismatch).
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the ala's shot from distance — not one match. No written source
 *  we could reach describes ONE dated long-range Merlim goal in words (the Wikipedia pages list his goals as minutes only; the one Merlim
 *  goal described in words, v Spain in the 2012 World Cup semi-final, was a close-range flick, not a long shot). So the film follows the
 *  brief's honest FALLBACK: the real-match chapter shows only confirmed things from his most recent big final, and the shot itself is a
 *  separate, clearly labelled demonstration ("Here is how he shoots"), in a training bib in an empty arena, never staged inside that final.
 *  Match choice: the 2026 UEFA Futsal Champions League FINAL — Sporting CP 2–0 Palma Futsal, 10 May 2026, Vitrifrigo Arena ("Pesaro Futsal
 *  Arena"), Pesaro, ITALY — the final tournament was held in his adopted country, he STARTED it (UEFA line-up: #29, in the starting five) at
 *  39, and no other futsal film uses it (Guitta / Cardinal / Douglas Júnior use the 2019 final; Tomás Paçó the 2021 final; Pito / Ferrão /
 *  Dídac Plana and others 2022; the Italy films Mammarella / Aicardo / Kike Boned / Antonio Pérez use EURO 2014, EURO 2012, WC 2004, EURO 2026).
 *  1  LIVE (broadcast camera, main stand, real time) — CONFIRMED THINGS ONLY: the arena in Pesaro (a tricolour in the crowd), Merlim #29 on
 *     court for Sporting, the final whistle (the board's clock runs out), 2–0 (two green pips v an empty red ring), Sporting celebrate round
 *     him. No goal, shot or tackle is staged; the ball is in Palma's feet at midfield when the whistle goes.
 *  2  HOW HE DOES IT (demonstration; training bib #29, a neutral passer and keeper, empty stands; low behind him, real time): on the left,
 *     far out (beyond the 10 m mark), a square pass from the right; ONE touch forward to set it; a hard strike low into the far corner.
 *  3  REPLAY of the demonstration (slow motion, LOW BEHIND THE GOAL, pushed in on him through the keeper): the first touch pushes the ball
 *     forward, out of his feet (red floor arrow, yellow ring = space), his head comes up (red eye-line to the corner), then the laces strike
 *     (a ring on the boot), the keeper too late, the net.
 *  4  PRACTISE (lesson from the entry's `lesson`: "Take one touch to set yourself, then shoot with confidence"): a young player, a friend
 *     rolls the ball; a big "1" for the one touch, a ring for the set, the shot, the net, a tick.
 * Sources (written; ≤ 8 requests, 5 s apart, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Alex Merlim" (raw): full name, born 15 Jul 1986, Dourados, Brazil; 1.71 m; winger; Sporting CP since 2015, club number 29;
 *    Italy from 2010; Champions League 2018–19, 2020–21, 2025–26. — https://en.wikipedia.org/wiki/Alex_Merlim
 *  - Wikipédia (pt), "Alex Merlim" (raw): posição Ala, 1,71 m, número 29, Itália 2010–; foot field EMPTY. — https://pt.wikipedia.org/wiki/Alex_Merlim
 *  - Wiki Sporting, "Alex Merlim": "O Mágico"; joined Sporting 15 Jun 2015 from Luparense; 12 seasons, 470 games, 237 goals; three
 *    Champions Leagues; Euro champion with Italy 2014; third at the 2012 World Cup. — https://www.wikisporting.com/index.php?title=Alex_Merlim
 *  - Wikipedia, "2025–26 UEFA Futsal Champions League" (raw): final tournament in Pesaro, Italy; semi-final Jimbee Cartagena 3–3 Sporting
 *    (5–6 pens, Merlim scored his kick); FINAL 10 May 2026, Vitrifrigo Arena, Pesaro: Sporting CP 2–0 Palma Futsal (Diogo Santos 3'20",
 *    Alisson 35'51" o.g.), attendance 5,816. — https://en.wikipedia.org/wiki/2025%E2%80%9326_UEFA_Futsal_Champions_League
 *  - UEFA match data, match 2048150 (match.uefa.com/v5/matches/2048150 and /lineups; uefa-api-2048150-*.json): status FINISHED, 2–0,
 *    "Pesaro Futsal Arena", pitch 40 × 20, attendance 5,816; Sporting CP home, shirt colour green (#80ff00), starting five Bernardo Paçó
 *    (16, GK), Tomás Paçó (4), Diogo Santos (7), Wesley França (8), ALEX MERLIM (29); Palma shirt colour magenta (#ff00ff); Diogo Santos
 *    red card 18'09". — https://www.uefa.com/uefafutsalchampionsleague/match/2048150/
 *  - UEFA's events endpoint refused us (400); a DuckDuckGo search found no written description of any long-range Merlim goal.
 * CONFIRMED (the narration states only these): the 2026 European (UEFA Futsal Champions League) final, Pesaro in Italy, Merlim starting for
 *  Sporting, aged 39 (born Jul 1986), the whistle, Sporting beat Palma 2–0; his card role (ala), his shirt number 29, height 1.71 m.
 * INFERRED (never named in the narration): that Merlim was on court at the whistle and how the celebration looked (who ran where; the ball
 *  at midfield); the kits — Sporting green-and-white hoops / black (navy) shorts / green socks (UEFA gives green), Palma drawn in RED ink
 *  (UEFA gives magenta; the nearest ink on this sheet) with navy shorts; Bernardo Paçó in a yellow keeper kit; the wood-tone court; the
 *  board; the tricolour in the crowd; which goal was whose. His shooting foot is NOT confirmed by any source we could read: the demonstration
 *  uses the card's params (left side, long distance, LEFT foot) and the narration never names the foot. Chapters 2–4 are teaching
 *  DEMONSTRATIONS of his signature, not footage. No video was reviewed.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the touch and the strike). Our stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z. Merlim's
 *  strike is strike(t,{foot:'l'}); the ball sits exactly on the left toe at contact because the stance is SOLVED from it (strikeBall).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (lights, keeper, flight lines, "space"), red (Palma, rings, arrows, posts), green (Sporting hoops, bib), navy (key line,
 *  shorts, stands). Wood court = yellow + red screens.
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈150–280 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,touchPhase,runCycle,runCadence,stand,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Build,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphenated words such as "thirty-nine"). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2026 final',text:'The 2026 European futsal final, in Pesaro, Italy. Alex Merlim starts for Sporting, at thirty-nine! The whistle goes. Sporting beat Palma two nil, and Merlim celebrates.',tail:2.2,
  cues:['The 2026','in Pesaro','Alex Merlim','at thirty','The whistle','Sporting beat','two nil','Merlim celebrates'],heads:{'The 2026':'Final 2026','in Pesaro':'Pesaro, Italy','two nil':'2–0','Merlim celebrates':'Champions'}},
 {label:'How he does it',text:'Here is how he shoots from far out. The pass comes. One touch to set it, then bang! Goal!',tail:2,
  cues:['Here is how','far out','The pass','One touch','then bang','Goal'],heads:{'Here is how':'How he does it','One touch':'One touch','Goal':'Goal'}},
 {label:'Replay: one touch, then shoot',text:'Again, slowly. His first touch pushes the ball forward, out of his feet. His head comes up. Then he hits it hard, with his laces.',tail:2.2,
  cues:['Again','His first touch','pushes the ball','out of his feet','His head','Then he hits','with his laces'],heads:{'Again':'Replay','His first touch':'Touch to set','His head':'Head up','Then he hits':'Shoot'}},
 {label:'Practise it',text:'Now you try. Take one touch to set yourself, then shoot with confidence!',tail:2.6,
  cues:['Now you try','Take one','set yourself','then shoot','with confidence'],heads:{'Take one':'One touch','with confidence':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/merlim-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/merlim-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/merlim-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('merlim: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('merlim: no cue '+w);return c.at;};
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
type Ball3={X:number;Y:number;Z:number;flying:boolean;spin:number};
const bez=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};
const angLerp=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the wood court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a floor quad (X,Z corners) clipped to just in front of the camera */
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
/** a hand-drawn ring round a screen point (knocked out first); g grows it in */
function ring2(s:Sheet,ink:string,c:Pt,rx:number,ry:number,w:number,seed:number,g=1,cov=1){if(g<=.02)return;const p=ribbon(blob(c[0],c[1],rx*g,ry*g,seed,{n:22,amp:.06}),w,{seed:seed+1,close:true,wobble:1.1});s.knockout(p);s.fill(ink,p,cov);}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a floor arrow (X,Z points) as a dashed ribbon with a head */
function floorArrow(s:Sheet,st:Stage,ink:string,pts:[number,number][],w:number,seed:number,progress:number,head:number){if(progress<=.02)return;const sp=pts.map(p=>proj(st,p[0],.02,p[1]));dashed(s,ink,sp,w,seed,{dash:w*3.4,progress});if(progress>.9)arrowHead(s,ink,smoothPts(sp,false,8),head,seed+1);}
/** a big red tick with a navy misregistered echo, centred at c, size S */
function tick(s:Sheet,c:Pt,S:number,seed:number){const tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 const tp=ribbon(tk,S*.24,{seed,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:seed+2,taper:.2,wobble:1}),.5);s.fill(R,tp);s.fill(Y,tp,.25);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
/** facing (cos y, sin y) on our floor; the figure's LEFT hand side is (−sin y, cos y) */
const fwdOf=(y:number):[number,number]=>[Math.cos(y),Math.sin(y)],leftOf=(y:number):[number,number]=>[-Math.sin(y),Math.cos(y)];
const MBUILD:Build={height:1.71,bulk:1};
const SKIN_M:InkFill[]=[[Y,.8],[R,.3]];
/** Alex Merlim, Sporting CP #29 (UEFA line-up): green-and-white hoops, black (navy) shorts, green socks (kit inferred); 1.71 m; short dark hair */
const MERLIM:AthleteStyle={shirt:G,pattern:'hoops',patternInk:'paper',shorts:K,socks:G,boots:K,skin:SKIN_M,hair:K,line:K,trim:K,number:29,numberInk:K,hairStyle:'short',build:MBUILD,seed:29};
/** Merlim in the demonstration: a light-green training bib with his 29 (no match claimed) */
const MERLIM_BIB:AthleteStyle={...MERLIM,pattern:'plain',shirt:[G,.5],socks:K,seed:129};
/** Sporting team-mates (inferred kit as above) */
const SCP=(n:number):AthleteStyle=>({shirt:G,pattern:'hoops',patternInk:'paper',shorts:K,socks:G,boots:K,skin:n%3===2?[[Y,.6],[R,.4],[K,.2]]:[[Y,.84],[R,.24]],hair:K,line:K,trim:K,hairStyle:n%3===1?'bald':'short',build:{height:1.72+hash(n,3)*.12},seed:40+n});
/** Bernardo Paçó, Sporting's keeper (#16 in UEFA's line-up): a yellow long-sleeved keeper kit (inferred) */
const PACO:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.84],[R,.22]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:16};
/** Palma Futsal: UEFA's shirt colour is magenta — drawn in the sheet's red ink, navy shorts, red socks (inferred) */
const PAL=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:n%2?[[Y,.8],[R,.26]]:[[Y,.62],[R,.36],[K,.18]],hair:K,line:K,trim:'paper',hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:60+n});
const PBUILD:Build={height:1.78};
/** the demonstration passer and keeper: neutral paper / navy training kits (no team claimed) */
const PASSER:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.84],[R,.22]],hair:K,line:K,trim:K,hairStyle:'curly',build:PBUILD,seed:67};
const KBUILD:Build={height:1.82};
const DEMO_K:AthleteStyle={shirt:[K,.6],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:KBUILD,seed:78};
/** the practice kids (chapter 4): neutral training tops */
const KBUILD4:Build={height:1.45,bulk:.92};
const KID:AthleteStyle={shirt:[G,.5],shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.3]],hair:K,line:K,trim:K,hairStyle:'short',build:KBUILD4,seed:91};
const FRIEND:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.62],[R,.36],[K,.18]],hair:K,line:K,trim:R,hairStyle:'curly',build:{height:1.42,bulk:.92},seed:92};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at a strike's contact, relative to the stance place (our floor coords): just past the kicking toe */
function strikeBall(yaw:number,foot:'l'|'r',build:Build,power=1):V3{const sk=solve(strike(STRIKE_CONTACT,{foot,power}),build,{yaw}),toe=foot==='l'?sk.lToe:sk.rToe,an=foot==='l'?sk.lAn:sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}
/** a beaten keeper: set and bouncing → a late dive (to his LEFT) fires at t0, too late for the ball; the futsal-goal dive is shortened */
const dive=(u:number)=>{const p=keeperDive(u,{side:'l',height:.2});return{...p,dz:p.dz*.34,air:p.air*.7};};
function beatenKeeper(X:number,Z:number,yaw:number,t0:number):Gen{
 return t=>{let pose=keeperSet(Math.min(t,t0)*1.5);if(t>=t0)pose=blendPose(pose,dive(clamp((t-t0)/.9)),sm(t0,t0+.06,t));return{pose,yaw,X,Z};};
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
function ballOn(s:Sheet,st:Stage,b:Ball3,seed:number,o:{min?:number;smear?:number;dir?:number;trail?:(u:number)=>Ball3;t0?:number;t?:number}={}){
 const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(o.min??9,kAt(st,b.Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);
 if(b.flying&&o.trail&&o.t!==undefined&&o.t0!==undefined){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=o.trail(Math.max(o.t0,o.t-.18+k*.0225));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.4,{seed:seed+7,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
 let dir=o.dir??0;if(b.flying&&o.trail&&o.t!==undefined){const q=o.trail(o.t-.03),pq=proj(st,q.X,q.Y,q.Z);if(Math.hypot(p[0]-pq[0],p[1]-pq[1])>1)dir=Math.atan2(p[1]-pq[1],p[0]-pq[0]);}
 ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?(o.smear??.45):0,dir});return{p,r};
}

// ---------------- the arena: wood court, crowd (Sporting green, Palma red, an Italian tricolour), lights ----------------
/** stepped navy rows, lit faces; green and red shirts; cheer lifts the heads; `flag` = the tricolour's world X (live chapter only) */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,empty=false,flag?:{X:number;wave:number}){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 if(empty){s.fill(Y,rectPath(-span,top-15*rowH-kw*.6,span*2,kw*.5),.35);return;}
 const heads=new Path2D(),grn=new Path2D(),red=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.36)grn.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.5)red.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(G,grn);s.fill(R,red);
 if(flag){// the Italian tricolour held up in the crowd: green | paper | red, waving on "in Pesaro"
  const fx=(flag.X-scroll)*kw,fy=top-5.2*rowH,fw=3.2*kw,fh=1.9*kw,band=(u0:number,u1:number)=>{const q:Pt[]=[];const n=6;for(let k=0;k<=n;k++){const u=lerp(u0,u1,k/n),w=Math.sin(u*5+t*7)*flag.wave*fh*.12;q.push([fx+u*fw-fw/2,fy-fh/2+w]);}for(let k=n;k>=0;k--){const u=lerp(u0,u1,k/n),w=Math.sin(u*5+t*7)*flag.wave*fh*.12;q.push([fx+u*fw-fw/2,fy+fh/2+w]);}return polyPath(q,true);};
  const all=band(0,1);s.knockout(all);s.fill(G,band(0,1/3));s.fill(R,band(2/3,1));s.fill(K,ribbon([[fx-fw/2,fy-fh/2],[fx-fw/2,fy+fh*1.3]],Math.max(3,kw*.07),{seed:5,taper:0}),.8);}
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the wood court: a yellow + red screen floor with plank seams along `along` ('x' planks run across the screen, 'z' into it) */
function woodFloor(s:Sheet,st:Stage,wall:number,along:'x'|'z',zNear:number,zFar:number){
 const span=9000,floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.42);s.fill(R,floor,.3);
 const seams=new Path2D();
 if(along==='z'){for(let i=-24;i<=24;i++){const X=i*.6,a=proj(st,X,0,Math.max(zNear,st.cz+.4)),b=proj(st,X,0,zFar);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);}}
 else{for(let Z=Math.max(zNear,st.cz+.6);Z<zFar;Z+=Z<6?.6:1.2){const a=proj(st,-40,0,Z),b=proj(st,40,0,Z);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);}}
 s.stroke(K,seams,3,.28);
}
function boards(s:Sheet,st:Stage,wall:number,kw:number,step:number){const span=9000,board=.95*kw;s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();const base=Math.floor(st.cx/step)*step;for(let i=-14;i<14;i++){const x0=(base+i*step+.3-st.cx)*kw,x1=(base+i*step+step*.8-st.cx)*kw;ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(G,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));return wall-board;}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; a goal at X = +20 (Palma's, inferred) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;wave?:number;board?:(top:number,kw:number)=>void}={}){
 const{cheer=0,flash=0,wave=0}=o,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 woodFloor(s,st,wall,'x',0,BOARDS);
 const run=polyPath(floorQuad(st,-24,-3,24,0),true);s.fill(K,run,.3);
 // painted lines: touchlines, goal line, halfway, the penalty area (6 m arcs from the posts), the 6 m and 10 m marks, the centre circle
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X-6,GOAL_X-10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 const top=boards(s,st,wall,kw,3);stands(s,top,kw,t,cheer,flash,st.cx,false,{X:1.2,wave});o.board?.(top,kw);
 sideGoal(s,st);sidePosts(s,st);
}
function sideGoal(s:Sheet,st:Stage){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>proj(st,GOAL_X+lerp(Db,Dt,Yh/H),Yh,Z);
 const hull=[proj(st,GOAL_X,0,POST_N),proj(st,GOAL_X,H,POST_N),proj(st,GOAL_X,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
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

// ---- END-ON court (camera looks along ±Z): a goal at Z = gz with posts X = ±1.5; the net runs away from (dir +1) or toward (dir −1) the camera ----
function endGoalNet(s:Sheet,st:Stage,gz:number,o:{dir?:number;bulge?:number;bx?:number;by?:number}={}){
 const{dir=1,bulge=0,bx=0,by=.4}=o,Lx=-1.5,Rx=1.5,H=2,back=(X:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((X-bx)**2+(Yh-by)**2)/.35);return proj(st,X,Yh,gz+dir*(lerp(.95,.55,Yh/H)+d));};
 const out=[proj(st,Lx,0,gz),proj(st,Lx,H,gz),proj(st,Rx,H,gz),proj(st,Rx,0,gz),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,gz)*.018),.6);
}
function endPosts(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,gz);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,gz)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
/** the court seen end-on: wood floor, paper lines (a goal line + D at gz, the 6 m and 10 m marks), boards + stands at wallZ */
function endArena(s:Sheet,st:Stage,o:{t:number;wallZ:number;gz?:number;cheer?:number;flash?:number;empty?:boolean}){
 const{t,wallZ,gz,cheer=0,flash=0,empty=false}=o,wall=proj(st,0,0,wallZ)[1],kw=kAt(st,wallZ);
 woodFloor(s,st,wall,'z',st.cz+.4,wallZ);
 const out=new Path2D();out.addPath(polyPath(floorQuad(st,-40,-40,-10,wallZ),true));out.addPath(polyPath(floorQuad(st,10,-40,40,wallZ),true));s.fill(K,out,.3);
 const lines=new Path2D(),zEnd=Math.min(wallZ-1,40);
 lines.addPath(polyPath(floorStrip(st,[[-10,st.cz+.5],[-10,zEnd]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,st.cz+.5],[10,zEnd]],.05),true));
 if(gz!==undefined){const arcPts:Pt[]=[],d=gz>st.cz+8?-1:1;// the D opens toward the play
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),gz+d*6*Math.sin(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),gz+d*6*Math.sin(a)]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,Math.max(gz,st.cz+.5)],[10,Math.max(gz,st.cz+.5)]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts.filter(p=>p[1]>st.cz+.5),.05),true));
  for(const dd of[6,10])if(gz+d*dd>st.cz+3)lines.addPath(polyPath(floorRing(st,0,gz+d*dd,.12,12),true));}
 s.knockout(lines,.94);
 const top=boards(s,st,wall,kw,2.4);stands(s,top,kw,t,cheer,flash,st.cx,empty);
}

// ================= chapter 1 — LIVE: the 2026 final in Pesaro (confirmed things only): Merlim #29, the whistle, 2–0, Sporting celebrate round him =================
const C1={y26:A(0,'The 2026'),pes:A(0,'in Pesaro'),alex:A(0,'Alex Merlim'),age:A(0,'at thirty'),whistle:A(0,'The whistle'),beat:A(0,'Sporting beat'),two:A(0,'two nil'),cel:A(0,'Merlim celebrates'),end:AUTH[0].seconds};
const WH=C1.whistle+.15;
/** Merlim's spot on the court (the right half as we look; no attack is staged) and where the huddle ends */
const M0:[number,number]=[5.4,7.4],M1:[number,number]=[6.6,6.2];
/** the ball: with a Palma player near the halfway line; at the whistle it is let go and rolls to a stop */
function liveBall(T:number):Ball3{
 if(T<WH){const X=-1.8+1.1*sm(0,WH,T,linear);return{X:X+.12*Math.sin(T*6),Y:BALL_R,Z:9.6,flying:false,spin:T*5};}
 const u=sm(WH,WH+1.6,T,easeOut);return{X:-.7+1.5*u,Y:BALL_R,Z:9.6-.7*u,flying:false,spin:5+u*6};
}
/** Merlim: a light jog on his spot, eyes on the ball → arms up at the whistle → a few airplane steps → jumps with his team-mates */
const liveM:Gen=T=>{
 let pose=blendPose(stand(),runCycle(T*runCadence(.2),{speed:.2}),.55);
 pose=blendPose(pose,celebrate(0,{kind:'arms'}),sm(WH,WH+.35,T));
 const go=sm(C1.beat-.1,C1.cel,T,easeIO);
 if(T>C1.beat-.1&&T<C1.cel+.3)pose=blendPose(pose,celebrate((T-C1.beat)*1.3,{kind:'run'}),sm(C1.beat-.1,C1.beat+.2,T)*(1-sm(C1.cel,C1.cel+.3,T)));
 if(T>=C1.cel)pose=blendPose(pose,celebrate((T-C1.cel)*1.2,{kind:'arms'}),sm(C1.cel,C1.cel+.3,T));
 const yaw=T<WH?FACE_LEFT+.25:T<C1.beat?angLerp(FACE_LEFT+.25,FACE_CAMERA-.5,sm(WH,C1.beat,T)):T<C1.cel?angLerp(FACE_CAMERA-.5,yawTo(M1[0]-M0[0],M1[1]-M0[1]),sm(C1.beat,C1.beat+.3,T)):angLerp(yawTo(M1[0]-M0[0],M1[1]-M0[1]),FACE_CAMERA+.3,sm(C1.cel,C1.cel+.4,T));
 return{pose,yaw,X:lerp(M0[0],M1[0],go),Z:lerp(M0[1],M1[1],go)};};
/** Sporting team-mates: spread through the court at the whistle → arms up → run to Merlim → jump with him (the keeper comes from his goal) */
const SCP0:[number,number][]=[[1.6,12.8],[9.4,13.6],[2.2,4.6],[17.4,10]],SCPG:[number,number][]=[[-1.1,.9],[1.1,1.1],[-1.3,-.6],[1.4,-.4]];
const liveScp=(i:number):Gen=>T=>{const[x0,z0]=SCP0[i],[gx,gz]=SCPG[i],keeper=i===3,t0=WH+(keeper?.2:.45+i*.12),arrive=C1.cel+(keeper?.5:.2),go=sm(t0,arrive,T,easeIO),m=liveM(Math.min(T,arrive));
 const X=lerp(x0+(keeper?0:.4*sm(0,WH,T)),m.X+gx,go),Z=lerp(z0,m.Z+gz,go);
 let pose=keeper?keeperSet(T*1.3):blendPose(stand(),runCycle(T*runCadence(.2)+i*.3,{speed:.2}),T<WH?.6:0);
 pose=blendPose(pose,celebrate(0,{kind:'arms'}),sm(WH,WH+.3,T)*(1-sm(t0,t0+.3,T)));
 if(T>=t0&&T<arrive+.2)pose=blendPose(pose,keeper?runCycle((T-t0)*runCadence(.8),{speed:.8}):celebrate((T-t0)*1.4,{kind:'run'}),sm(t0,t0+.3,T)*(1-sm(arrive-.1,arrive+.2,T)));
 if(T>=arrive-.1)pose=blendPose(pose,celebrate((T-arrive)*1.2+i*.21,{kind:'arms'}),sm(arrive-.1,arrive+.2,T));
 const yaw=T<t0?(keeper?FACE_LEFT:FACE_LEFT+(i-1)*.3):go<.98?yawTo(m.X+gx-x0,m.Z+gz-z0):yawTo(-gx,-gz);
 return{pose,yaw,X,Z};};
/** Palma (red): in possession near halfway when the whistle goes; hands to heads, one crouches, heads drop */
const PAL0:[number,number][]=[[-2.1,9.3],[.8,14.2],[3.6,10.8],[-4.6,5.6]];
const DROP:Pose=posed({lHipF:58,rHipF:58,lKnee:70,rKnee:70,lean:44,neckP:40,lShF:40,rShF:40,lElb:20,rElb:20,lShA:10,rShA:10});
const livePal=(i:number):Gen=>T=>{const[x0,z0]=PAL0[i],d=sm(WH+.2,WH+1.1,T);
 let pose=i===0&&T<WH?runCycle(T*runCadence(.25),{speed:.25}):blendPose(stand(),runCycle(T*runCadence(.2)+i*.4,{speed:.2}),T<WH?.5:0);
 pose=blendPose(pose,i===2?DROP:posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:10,neckP:34,lShF:150,rShF:150,lShA:40,rShA:40,lElb:150,rElb:150}),d);
 const X=i===0?(T<WH?-2.1+1.1*sm(0,WH,T,linear):-1):x0+.3*sm(0,WH,T);
 return{pose,yaw:i===0?FACE_RIGHT:FACE_RIGHT+(i-1.5)*.3,X,Z:z0};};
/** the scoreboard hung over the far stands (no text: a clock bar that runs out at the whistle, two green pips v an empty red ring) */
function scoreboard(s:Sheet,st:Stage,T:number,top:number,kw:number){
 const cx=(5.6-st.cx)*kw,w=7.5*kw,h=2.3*kw,y=top-6.2*.55*kw,pn=polyPath([[cx-w/2,y-h/2],[cx+w/2,y-h/2],[cx+w/2,y+h/2],[cx-w/2,y+h/2]],true);
 s.knockout(pn);s.fill(K,pn,.92);
 const bw=w*.8*(T<WH?.12*(1-sm(0,WH,T,linear)):0);if(bw>1)s.fill(Y,rectPath(cx-w*.4,y+h*.24,bw,h*.12));
 const pp=pulse(T,C1.two,1.2),r=h*.16*(1+.35*pp),pip=(x:number)=>{s.knockout(circlePath(x,y-h*.08,r*1.25));s.fill(G,circlePath(x,y-h*.08,r));};
 pip(cx-w*.33);pip(cx-w*.18);
 const zero=ribbon(blob(cx+w*.26,y-h*.08,r*.9,r*.9,7,{n:16,amp:.03}),Math.max(2,r*.3),{seed:8,close:true,wobble:.4});s.knockout(zero);s.fill(R,zero);
 const sep=new Path2D();sep.rect(cx+w*.02,y-h*.3,w*.03,h*.44);s.fill(Y,sep,.5);
 if(T>=WH&&T<WH+.9){sparkBurst(s,Y,cx,y-h*.6,w*.55,{n:12,seed:111,g:easeOut(sm(WH,WH+.3,T))*(1-sm(WH+.5,WH+.9,T))});}
}
const liveCam=(T:number)=>({x:key(T,mono([[0,-1.4],[C1.pes,.8],[C1.alex,4.4],[WH,5],[C1.beat,5.6],[C1.cel,6.4],[C1.end,6.6]]),easeInOutSine),
 zoom:key(T,mono([[0,.54],[C1.pes,.56],[C1.alex,.72],[C1.age,.78],[WH,.66],[C1.beat,.68],[C1.cel,.9],[C1.end,.92]]),easeInOutSine),
 y:key(T,mono([[0,1010],[C1.pes,980],[C1.alex,1110],[WH,1100],[C1.cel,1150],[C1.end,1160]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const b=liveBall(T),joy=sm(WH,WH+.4,T);
 courtSide(s,st,T,{cheer:.1+.6*joy+.3*pulse(T,C1.cel,1.5),flash:pulse(T,WH,1)+.8*pulse(T,C1.cel,1.3),wave:.25+.9*pulse(T,C1.pes,1.6)+.6*joy,board:(top,kw)=>scoreboard(s,st,T,top,kw)});
 type It={z:number;draw:()=>void};const items:It[]=[];
 const m=liveM(T);
 items.push({z:m.Z,draw:()=>{
  // "Alex Merlim": a red ring picks him out (#29); again on "Merlim celebrates"
  const g=proj(st,m.X,0,m.Z),h=1.71*kAt(st,m.Z),ringG=easeOutBack(sm(C1.alex,C1.alex+.4,T))*(1-sm(C1.age+.9,C1.age+1.3,T))+easeOutBack(sm(C1.cel+.2,C1.cel+.6,T));
  ring2(s,R,[g[0],g[1]-h*.5],h*.44,h*.64,8,121,Math.min(1.1,ringG),1);
  athlete(s,st,liveM,T,MERLIM,{detail:T>C1.alex-.3?'auto':'low'});}});
 SCP0.forEach((_,i)=>{const g=liveScp(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,i===3?PACO:SCP(i),{detail:T>C1.two?'auto':'low'})});});
 PAL0.forEach((_,i)=>{const g=livePal(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,PAL(i),{detail:'low'})});});
 items.push({z:b.Z-.05,draw:()=>{ballOn(s,st,b,16,{});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** a figure's chest as an aperture polygon (the passage enters Merlim's shirt → the demonstration) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09,build:Build=MBUILD):Pt[]{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveM(tt),.16));},still:C1.cel+.4};

// ---- the demonstration geometry (chapters 2–3, one world turned two ways). Chapter 2's floor: the goal line at Z = GZ5 (posts X ±1.5);
// ---- Merlim on the LEFT (X < 0), 12.6 m out, a square pass from his right; one touch forward and inside, then the strike low into the far
// ---- corner (the keeper's left). Chapter 3 is the same world rotated 180° about the goal: X → −X, Z → GZ5 − Z.
const GZ5=13;
const RCV5:[number,number]=[-2.6,GZ5-12.6],SET5:[number,number]=[-2.15,GZ5-11.55],PAS5:[number,number]=[2.5,GZ5-9.9];
const TGT5:V3=[1.22,.3,GZ5+.05];
const unit=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};

// ================= chapter 2 — HOW HE DOES IT (demonstration; training bib, empty arena): real time, low behind him =================
const C2={how:A(1,'Here is'),far:A(1,'far out'),pass:A(1,'The pass'),one:A(1,'One touch'),bang:A(1,'then bang'),goal:A(1,'Goal'),end:AUTH[1].seconds};
const T5_PASS=C2.pass+.12,T5_TOUCH=Math.max(T5_PASS+.75,C2.one+.18),T5_SET=T5_TOUCH+.42,T5_HIT=Math.max(C2.bang+.12,T5_SET+.75),T5_IN=T5_HIT+.5;
const YAW_S5=yawTo(TGT5[0]-SET5[0],TGT5[2]-SET5[1]);
const SB5=strikeBall(YAW_S5,'l',MBUILD),PL5:[number,number]=[SET5[0]-SB5[0],SET5[1]-SB5[2]];
/** receiving: body open between the passer and the goal; stance so the LEFT foot meets the ball at RCV5 */
const YAW_R5=(()=>{const a=unit(PAS5[0]-RCV5[0],PAS5[1]-RCV5[1]),b=unit(TGT5[0]-RCV5[0],TGT5[2]-RCV5[1]);return yawTo(a[0]+b[0]*1.3,a[1]+b[1]*1.3);})();
const RP5:[number,number]=(()=>{const f=fwdOf(YAW_R5),l=leftOf(YAW_R5);return[RCV5[0]-f[0]*.42-l[0]*.12,RCV5[1]-f[1]*.42-l[1]*.12];})();
const FS5=fwdOf(YAW_S5);
function merlimGen(C:{how:number;touch:number;set:number;hit:number;goal:number;end:number},RP:[number,number],PL:[number,number],yawR:number,yawS:number,FS:[number,number]):Gen{
 const hitT=(t:number)=>key(t,[[C.set-.1,.04],[C.hit-.34,.22],[C.hit,STRIKE_CONTACT],[C.hit+.6,1]],linear);
 return t=>{
  // ready → a short step to meet the pass → the left-foot touch → the strike's run-up and contact → wheel away on "Goal"
  let pose=blendPose(stand(),runCycle(t*runCadence(.15),{speed:.15}),.35);
  const dph=key(t,[[C.touch-.4,touchPhase-.42],[C.touch,touchPhase],[C.touch+.4,touchPhase+.36]],linear);
  pose=blendPose(pose,dribble(dph,{foot:'l',speed:.3}),sm(C.touch-.45,C.touch-.2,t)*(1-sm(C.set-.15,C.set+.05,t)));
  pose=blendPose(pose,strike(hitT(t),{foot:'l'}),sm(C.set-.15,C.set+.05,t));
  if(t>C.goal-.1)pose=blendPose(pose,celebrate((t-C.goal)*1.2,{kind:'run'}),sm(C.goal-.1,C.goal+.3,t));
  const yaw=t<C.touch?yawR:angLerp(yawR,yawS,sm(C.touch,C.set+.1,t,easeIO));
  const ap=C.hit-.34,back:[number,number]=[PL[0]-FS[0]*.9,PL[1]-FS[1]*.9];
  const X=key(t,mono([[0,RP[0]],[C.touch-.4,RP[0]],[C.touch,RP[0]+.1*FS[0]],[C.set+.1,back[0],easeIO],[ap,PL[0],easeOut],[C.hit,PL[0]],[C.hit+.6,PL[0]+FS[0]*.5,easeOut],[C.end,PL[0]+FS[0]*1.9,easeIO]]));
  const Z=key(t,mono([[0,RP[1]],[C.touch-.4,RP[1]],[C.touch,RP[1]+.1*FS[1]],[C.set+.1,back[1],easeIO],[ap,PL[1],easeOut],[C.hit,PL[1]],[C.hit+.6,PL[1]+FS[1]*.5,easeOut],[C.end,PL[1]+FS[1]*1.9,easeIO]]));
  return{pose,yaw,X,Z};};
}
const m5=merlimGen({how:C2.how,touch:T5_TOUCH,set:T5_SET,hit:T5_HIT,goal:C2.goal,end:C2.end},RP5,PL5,YAW_R5,YAW_S5,FS5);
/** the passer (right foot, soft): the stance solved so his toe meets the ball at PAS5 */
const YAW_P5=yawTo(RCV5[0]-PAS5[0],RCV5[1]-PAS5[1]),SBP5=strikeBall(YAW_P5,'r',PBUILD,.35),PP5:[number,number]=[PAS5[0]-SBP5[0],PAS5[1]-SBP5[2]];
const passer5:Gen=t=>{const u=key(t,[[0,0],[T5_PASS-.5,.08],[T5_PASS,STRIKE_CONTACT],[T5_PASS+.5,.95],[T5_PASS+1,1]],linear);
 return{pose:blendPose(stand(),strike(u,{power:.35}),sm(T5_PASS-.6,T5_PASS-.4,t)),yaw:YAW_P5,X:PP5[0],Z:PP5[1]};};
const keep5=beatenKeeper(0,GZ5-.75,FACE_CAMERA,T5_HIT+.22);
function flight(a:[number,number],tgt:V3,u:number):V3{return bez([a[0],BALL_R,a[1]],[lerp(a[0],tgt[0],.5),.62,lerp(a[1],tgt[2],.5)],tgt,u);}
/** the ball: at the passer's feet → rolls to Merlim → the touch sets it → flies low into the far corner → drops in the net */
function ballPath(t:number,C:{pass:number;touch:number;set:number;hit:number;inn:number},PAS:[number,number],RCV:[number,number],SET:[number,number],TGT:V3,netDir:number,netD=.5):Ball3{
 if(t<C.pass)return{X:PAS[0],Y:BALL_R,Z:PAS[1],flying:false,spin:0};
 if(t<C.touch){const u=sm(C.pass,C.touch,t,linear),e=u*(1.15-.15*u);return{X:lerp(PAS[0],RCV[0],e),Y:BALL_R,Z:lerp(PAS[1],RCV[1],e),flying:false,spin:u*12};}
 if(t<C.hit){const u=sm(C.touch,C.set,t,easeOut);return{X:lerp(RCV[0],SET[0],u),Y:BALL_R,Z:lerp(RCV[1],SET[1],u),flying:false,spin:12+u*4};}
 if(t<C.inn){const q=flight(SET,TGT,sm(C.hit,C.inn,t,linear));return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:(t-C.hit)*40};}
 const d=sm(C.inn,C.inn+.35,t,easeIn),q=sm(C.inn,C.inn+.2,t,easeOut);
 return{X:TGT[0],Y:lerp(TGT[1],BALL_R,d),Z:TGT[2]+netDir*netD*q,flying:false,spin:20};
}
const ball5=(t:number)=>ballPath(t,{pass:T5_PASS,touch:T5_TOUCH,set:T5_SET,hit:T5_HIT,inn:T5_IN},PAS5,RCV5,SET5,TGT5,1);
const st5:Stage={F:1500,eye:1.25,cx:-.8,cz:SET5[1]-6.5};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st5,hit=pulse(t,T5_HIT,.4),net=pulse(tt,T5_IN,.7);
  camPath(s,t,[[0,-400,90,1.22],[C2.how,-420,70,1.28],[C2.far,-240,40,1.04],[C2.pass,0,60,1.02],[T5_TOUCH-.2,-400,90,1.3],[T5_SET+.3,-300,70,1.32],[T5_HIT,-230,50,1.3],[T5_IN,-60,10,1.2],[C2.goal,-100,20,1.22],[C2.end,-130,30,1.18]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*80)]);
  endArena(s,st,{t:tt,wallZ:GZ5+2.6,gz:GZ5,empty:true,flash:pulse(tt,T5_IN,1.2)});
  // "far out": the 10 m mark and the distance to goal, a yellow dashed floor line from him to the goal line
  const far=sm(C2.far,C2.far+.5,tt,easeOut)*(1-sm(C2.pass+.4,C2.pass+.9,tt));
  if(far>.02)floorArrow(s,st,Y,[[RCV5[0]+.3,RCV5[1]+.6],[lerp(RCV5[0],0,.5),lerp(RCV5[1],GZ5,.5)],[-.2,GZ5-.3]],12,501,far,34);
  const kk=keep5(tt),b=ball5(tt),mz=m5(tt).Z;
  const its:{z:number;draw:()=>void}[]=[
   {z:kk.Z,draw:()=>{endGoalNet(s,st,GZ5,{bulge:.4*net,bx:TGT5[0],by:TGT5[1]});athlete(s,st,keep5,tt,DEMO_K,{detail:'mid'});endPosts(s,st,GZ5);}},
   {z:passer5(tt).Z,draw:()=>athlete(s,st,passer5,tt,PASSER,{detail:'mid'})},
   {z:mz,draw:()=>{
     // "Here is how": a red ring picks out Merlim (#29 on his bib)
     const m=m5(tt),g=proj(st,m.X,0,m.Z),h=1.71*kAt(st,m.Z);ring2(s,R,[g[0],g[1]-h*.5],h*.4,h*.6,9,521,easeOutBack(sm(C2.how,C2.how+.4,tt))*(1-sm(C2.far,C2.far+.4,tt)),1);
     athlete(s,st,m5,tt,MERLIM_BIB,{detail:'high',smear:(tt>T5_TOUCH-.15&&tt<T5_TOUCH+.15)||(tt>T5_HIT-.25&&tt<T5_HIT+.2)?.12:0});}},
   {z:b.Z,draw:()=>{const{p,r}=ballOn(s,st,b,511,{min:10,trail:ball5,t0:T5_HIT,t:tt});if(tt>=T5_HIT&&tt<T5_HIT+.35)sparkBurst(s,Y,p[0],p[1],r*3,{n:10,seed:512,g:easeOut(sm(T5_HIT,T5_HIT+.25,tt))});}},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "One touch": a red ring on the ball as it is set
  const one=easeOutBack(sm(C2.one,C2.one+.35,tt))*(1-sm(T5_HIT-.3,T5_HIT,tt));if(one>.02){const p=proj(st,b.X,0,b.Z),k=kAt(st,b.Z);ring2(s,R,[p[0],p[1]-k*.1],k*.42,k*.24,8,531,one,1);}
  // "Goal!": the net stamp — a yellow burst in the corner
  if(tt>=T5_IN&&tt<T5_IN+.9){const p=proj(st,TGT5[0],TGT5[1],TGT5[2]);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:541,g:easeOut(sm(T5_IN,T5_IN+.3,tt))*(1-sm(T5_IN+.5,T5_IN+.9,tt))});}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st5,m5(tt),.2));},
 still:T5_HIT+.05,
};

// ================= chapter 3 — REPLAY of the demonstration: slow motion, LOW BEHIND THE GOAL, pushed in on him through the keeper =================
const C3={again:A(2,'Again'),first:A(2,'His first'),push:A(2,'pushes'),out:A(2,'out of'),head:A(2,'His head'),hits:A(2,'Then he hits'),laces:A(2,'with his laces'),end:AUTH[2].seconds};
/** chapter 2's world rotated 180° about the goal (X → −X, Z → GZ5 − Z): the goal line at Z = 0, the net toward the camera */
const rot3=(p:[number,number]):[number,number]=>[-p[0],GZ5-p[1]];
const RCV3=rot3(RCV5),SET3=rot3(SET5),PAS3=rot3(PAS5),TGT3:V3=[-TGT5[0],TGT5[1],-.05];
/** slow motion: the pass arrives on "His first touch", the touch rolls out on "pushes the ball", held on "out of his feet", head up on
 * "His head", contact on "Then he hits", the ball reaches the corner as "with his laces" lands */
const T3_TOUCH=C3.first+.35,T3_SET=Math.max(C3.out-.1,T3_TOUCH+1),T3_HIT=C3.hits+.35,T3_IN=Math.max(C3.laces+.4,T3_HIT+1.3),T3_PASS=T3_TOUCH-2.2;
const YAW_S3=yawTo(TGT3[0]-SET3[0],TGT3[2]-SET3[1]),SB3=strikeBall(YAW_S3,'l',MBUILD),PL3:[number,number]=[SET3[0]-SB3[0],SET3[1]-SB3[2]];
const YAW_R3=YAW_R5+Math.PI,RP3=rot3(RP5),FS3=fwdOf(YAW_S3);
const m3=merlimGen({how:0,touch:T3_TOUCH,set:T3_SET,hit:T3_HIT,goal:C3.end+5,end:C3.end+1},RP3,PL3,YAW_R3,YAW_S3,FS3);
/** the head comes up: between the set and the strike his neck lifts to look at the corner, then goes down again over the ball */
const m3h:Gen=t=>{const a=m3(t),up=sm(C3.head,C3.head+.4,t,easeOut)*(1-sm(T3_HIT-.45,T3_HIT-.2,t));return{...a,pose:{...a.pose,neckP:lerp(a.pose.neckP,-.25,up)}};};
const ball3=(t:number)=>ballPath(t,{pass:T3_PASS,touch:T3_TOUCH,set:T3_SET,hit:T3_HIT,inn:T3_IN},PAS3,RCV3,SET3,TGT3,-1,.2);
const keep3=beatenKeeper(0,.75,FACE_AWAY,T3_HIT+.55);
/** the passer, already through his pass (the replay starts with the ball rolling) */
const passer3:Gen=t=>({pose:blendPose(strike(.95,{power:.35}),stand(),sm(0,.8,t,easeIO)),yaw:yawTo(RCV3[0]-PAS3[0],RCV3[1]-PAS3[1]),X:PAS3[0]+.3,Z:PAS3[1]+.25});
/** the replay camera slides from outside the right post (the push-in on him) to behind the goal's centre as the ball comes in */
const st3At=(t:number):Stage=>({F:1500,eye:1.7,cx:lerp(3,-.2,sm(T3_HIT+.1,T3_IN,t,easeIO)),cz:-3.4});
const st3=st3At(0),st3End=st3At(1e3);
/** the back net between us and the play: a sparse navy mesh */
function backNet(s:Sheet,st:Stage,bulge:number){
 const net=new Path2D(),Zb=-.9,d=(X:number,Yh:number)=>bulge*Math.exp(-((X-TGT3[0])**2+(Yh-TGT3[1])**2)/.35);
 for(let X=-3;X<=3.01;X+=.28){const a=proj(st,X,-.2,Zb-d(X,0)),b=proj(st,X,2.6,Zb);net.moveTo(a[0],a[1]);for(let Yh=.2;Yh<=2.6;Yh+=.4){const q=proj(st,X,Yh,Zb-d(X,Yh));net.lineTo(q[0],q[1]);}net.lineTo(b[0],b[1]);}
 for(let Yh=0;Yh<=2.61;Yh+=.28){const a=proj(st,-3,Yh,Zb);net.moveTo(a[0],a[1]);for(let X=-2.6;X<=3.01;X+=.4){const q=proj(st,X,Yh,Zb-d(X,Yh));net.lineTo(q[0],q[1]);}}
 s.stroke(K,net,2.6,.34);
}
/** the replay camera: pushed in on Merlim (through the keeper) for the touch and the look, pulled back as the ball comes at us */
const cam3=(t:number):Key[]=>{const m=proj(st3,SET3[0],.9,SET3[1]);const c=proj(st3End,TGT3[0],.6,TGT3[2]);return[[0,m[0]-60,m[1]-20,2.3],[C3.first,m[0]-40,m[1],2.6],[C3.push,m[0]-10,m[1]+20,2.75],[C3.out,m[0],m[1]+20,2.8],[C3.head,m[0]-20,m[1]-20,2.7],[T3_HIT-.1,m[0]-20,m[1],2.6],[T3_HIT+.6,m[0]*.4,m[1]*.6,1.5],[T3_IN,c[0]*.55,c[1]*.7,1.12],[C3.end,c[0]*.55,c[1]*.7,1.1]];};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3At(tt),hit=pulse(t,T3_HIT,.5),net=pulse(tt,T3_IN,.9);
  camPath(s,t,cam3(t),[5*hit*Math.sin(t*90),4*hit*Math.cos(t*70)]);
  endArena(s,st,{t:tt,wallZ:41,gz:40,empty:true,flash:pulse(tt,T3_IN,1.3)});
  // our goal line, the D, the 6 m and 10 m marks (under the camera): the 10 m mark shows how far out he is
  const near=new Path2D(),arcPts:Pt[]=[];for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),6*Math.sin(a)]);}for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),6*Math.sin(a)]);}
  near.addPath(polyPath(floorStrip(st,[[-10,0],[10,0]],.05),true));near.addPath(polyPath(floorStrip(st,arcPts,.05),true));near.addPath(polyPath(floorRing(st,0,6,.12,12),true));near.addPath(polyPath(floorRing(st,0,10,.12,12),true));s.knockout(near,.94);
  const b=ball3(tt),m=m3h(tt),sk=solve(m.pose,MBUILD,placeAt(m.X,m.Z,m.yaw)),km=kAt(st,m.Z),foot=toMine(sk.lToe),fp=proj(st,foot[0],foot[1],foot[2]),head=toMine(sk.head),hp=proj(st,head[0],head[1]+.04,head[2]);
  // "pushes the ball forward": a red dashed floor arrow from where the pass arrived to where the touch sets it
  const push=sm(C3.push,C3.push+.7,tt,easeOut)*(1-.7*sm(T3_HIT,T3_HIT+.4,tt));
  floorArrow(s,st,R,[[RCV3[0],RCV3[1]],[lerp(RCV3[0],SET3[0],.5)+.08,lerp(RCV3[1],SET3[1],.5)],[SET3[0]+(SET3[0]-RCV3[0])*.15,SET3[1]+(SET3[1]-RCV3[1])*.15]],10,601,push,30);
  // "out of his feet": a yellow dashed floor ring round the set ball — space to swing the leg
  floorDashRing(s,st,Y,SET3[0],SET3[1],.55,9,611,easeOutBack(sm(C3.out,C3.out+.4,tt))*(1-sm(T3_HIT-.2,T3_HIT+.1,tt)));
  const kk=keep3(tt);
  const its:{z:number;draw:()=>void}[]=[
   {z:m.Z,draw:()=>{athlete(s,st,m3h,tt,MERLIM_BIB,{detail:'high',smear:(tt>T3_TOUCH-.3&&tt<T3_TOUCH+.3)||(tt>T3_HIT-.5&&tt<T3_HIT+.3)?.3:0});
     // "His first touch": a red ring round the ball as his boot meets it
     {const bp=proj(st,b.X,0,b.Z),kb=kAt(st,b.Z);ring2(s,R,[bp[0],bp[1]-.1*kb],.36*kb,.22*kb,8,621,easeOutBack(sm(C3.first,C3.first+.4,tt))*(1-sm(C3.push+.2,C3.push+.6,tt)),1);}
     // "with his laces": a red ring round the boot as it strikes through the ball
     ring2(s,R,[fp[0],fp[1]],.34*km,.24*km,8,631,easeOutBack(sm(C3.laces,C3.laces+.35,tt))*(1-sm(C3.end-.4,C3.end,tt)),1);}},
   {z:b.Z,draw:()=>{const{p,r}=ballOn(s,st,b,97,{min:10,trail:ball3,t0:T3_HIT,t:tt});if(tt>=T3_HIT&&tt<T3_HIT+.6)sparkBurst(s,Y,p[0],p[1],r*2.8,{n:10,seed:98,g:easeOut(sm(T3_HIT,T3_HIT+.4,tt))});}},
   {z:kk.Z,draw:()=>{athlete(s,st,keep3,tt,DEMO_K,{detail:'high',smear:tt>T3_HIT+.5&&tt<T3_IN?.25:0});}},
   {z:PAS3[1]+.25,draw:()=>athlete(s,st,passer3,tt,PASSER,{detail:'mid'})},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "His head comes up": a red dashed eye-line from his head to the far corner, and a ring on the corner
  const look=sm(C3.head,C3.head+.5,tt,easeOut)*(1-sm(T3_HIT-.2,T3_HIT+.2,tt));
  if(look>.02){const c=proj(st,TGT3[0],TGT3[1],0);dashed(s,R,[hp,[lerp(hp[0],c[0],.5),lerp(hp[1],c[1],.5)-40],c],9,641,{dash:32,progress:look});ring2(s,R,c,.42*kAt(st,0),.34*kAt(st,0),10,642,look,1);}
  if(tt>=T3_HIT-.05&&tt<T3_IN){const p=proj(st,b.X,b.Y,b.Z);speedLines(s,Y,p[0],p[1],Math.atan2(-1,.35),{n:5,seed:651,len:160,spread:120,width:7});}
  endPosts(s,st,0);backNet(s,st,.5*net);
  if(tt>=T3_IN&&tt<T3_IN+1){const p=proj(st,TGT3[0],TGT3[1],TGT3[2]);sparkBurst(s,Y,p[0],p[1],200,{n:12,seed:661,g:easeOut(sm(T3_IN,T3_IN+.3,tt))*(1-sm(T3_IN+.6,T3_IN+1,tt))});}
 },
 aperture(t0){const{tt}=clock(2,t0),b=ball3(tt),sa=st3At(tt),p=proj(sa,b.X,b.Y,b.Z),r=Math.max(10,kAt(sa,b.Z)*BALL_R)*1.4,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return aperture(q);},
 still:C3.head+.4,
};

// ================= chapter 4 — PRACTISE: a young player, a friend rolls the ball; one touch to set, then shoot; the net; a tick =================
const C4={now:A(3,'Now you'),one:A(3,'Take one'),set:A(3,'set yourself'),shoot:A(3,'then shoot'),conf:A(3,'with confidence'),end:AUTH[3].seconds};
const GZ4=9.2,RCV4:[number,number]=[-1.3,1.6],SET4:[number,number]=[-1.05,2.5],PAS4:[number,number]=[2.6,3.6],TGT4:V3=[-.85,.35,GZ4+.05];
const T4_TOUCH=C4.one+.3,T4_PASS=T4_TOUCH-1.1,T4_SET=T4_TOUCH+.4,T4_HIT=Math.max(C4.shoot+.2,T4_SET+.7),T4_IN=T4_HIT+.45;
const YAW_S4=yawTo(TGT4[0]-SET4[0],TGT4[2]-SET4[1]),SB4=strikeBall(YAW_S4,'r',KBUILD4),PL4:[number,number]=[SET4[0]-SB4[0],SET4[1]-SB4[2]];
const YAW_R4=(()=>{const a=unit(PAS4[0]-RCV4[0],PAS4[1]-RCV4[1]),b=unit(TGT4[0]-RCV4[0],TGT4[2]-RCV4[1]);return yawTo(a[0]+b[0]*1.4,a[1]+b[1]*1.4);})();
const RP4:[number,number]=(()=>{const f=fwdOf(YAW_R4),l=leftOf(YAW_R4);return[RCV4[0]-f[0]*.36+l[0]*.1,RCV4[1]-f[1]*.36+l[1]*.1];})();
const FS4=fwdOf(YAW_S4);
/** the kid: the same pattern with the RIGHT foot (touch and strike) — any foot works */
const kid4:Gen=t=>{
 let pose=blendPose(stand(),runCycle(t*runCadence(.15),{speed:.15}),.35);
 const dph=key(t,[[T4_TOUCH-.4,touchPhase-.42],[T4_TOUCH,touchPhase],[T4_TOUCH+.4,touchPhase+.36]],linear);
 pose=blendPose(pose,dribble(dph,{foot:'r',speed:.3}),sm(T4_TOUCH-.45,T4_TOUCH-.2,t)*(1-sm(T4_SET-.15,T4_SET+.05,t)));
 const u=key(t,[[T4_SET-.1,.04],[T4_HIT-.32,.22],[T4_HIT,STRIKE_CONTACT],[T4_HIT+.6,1]],linear);
 pose=blendPose(pose,strike(u),sm(T4_SET-.15,T4_SET+.05,t));
 if(t>T4_IN+.3)pose=blendPose(pose,celebrate((t-T4_IN-.3)*1.2,{kind:'arms'}),sm(T4_IN+.3,T4_IN+.6,t));
 const yaw=t<T4_TOUCH?YAW_R4:angLerp(YAW_R4,YAW_S4,sm(T4_TOUCH,T4_SET+.1,t,easeIO)),ap=T4_HIT-.32,back:[number,number]=[PL4[0]-FS4[0]*.75,PL4[1]-FS4[1]*.75];
 const X=key(t,mono([[0,RP4[0]],[T4_TOUCH-.4,RP4[0]],[T4_SET+.1,back[0],easeIO],[ap,PL4[0],easeOut],[T4_HIT,PL4[0]],[T4_HIT+.6,PL4[0]+FS4[0]*.4,easeOut]]));
 const Z=key(t,mono([[0,RP4[1]],[T4_TOUCH-.4,RP4[1]],[T4_SET+.1,back[1],easeIO],[ap,PL4[1],easeOut],[T4_HIT,PL4[1]],[T4_HIT+.6,PL4[1]+FS4[1]*.4,easeOut]]));
 return{pose,yaw,X,Z};};
/** the friend rolls the ball in with the inside of the right foot */
const YAW_P4=yawTo(RCV4[0]-PAS4[0],RCV4[1]-PAS4[1]),SBP4=strikeBall(YAW_P4,'r',{height:1.42,bulk:.92},.3),PP4:[number,number]=[PAS4[0]-SBP4[0],PAS4[1]-SBP4[2]];
const friend4:Gen=t=>{const u=key(t,[[0,0],[T4_PASS-.5,.08],[T4_PASS,STRIKE_CONTACT],[T4_PASS+.5,.95],[T4_PASS+1,1]],linear);
 let pose=blendPose(stand(),strike(u,{power:.3}),sm(T4_PASS-.6,T4_PASS-.4,t));if(t>T4_IN+.35)pose=blendPose(pose,celebrate((t-T4_IN-.35)*1.1+.3,{kind:'arms'}),sm(T4_IN+.35,T4_IN+.7,t));
 return{pose,yaw:YAW_P4,X:PP4[0],Z:PP4[1]};};
const ball4=(t:number)=>ballPath(t,{pass:T4_PASS,touch:T4_TOUCH,set:T4_SET,hit:T4_HIT,inn:T4_IN},PAS4,RCV4,SET4,TGT4,1);
const st4:Stage={F:1500,eye:1.5,cx:.2,cz:-3.4};
/** a big hand-drawn "1" standing on the floor beside the ball (red, with a navy misregistered echo) */
function one(s:Sheet,c:Pt,h:number,g:number){if(g<=.02)return;const S=h*g,p:Pt[]=[[c[0]-S*.18,c[1]-S*.72],[c[0]+S*.06,c[1]-S],[c[0]+S*.06,c[1]]],base:Pt[]=[[c[0]-S*.2,c[1]],[c[0]+S*.32,c[1]]];
 const a=ribbon(p,S*.16,{seed:701,taper:.1,wobble:1}),b2=ribbon(base,S*.14,{seed:702,taper:0,wobble:1});s.knockout(ribbon(p,S*.24,{seed:703,taper:0,wobble:1}));s.knockout(ribbon(base,S*.22,{seed:704,taper:0,wobble:1}));
 s.fill(K,ribbon(p.map(q=>[q[0]+6,q[1]+6] as Pt),S*.16,{seed:705,taper:.1,wobble:1}),.5);s.fill(R,a);s.fill(R,b2);}
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,net=pulse(tt,T4_IN,.7);
  camPath(s,t,[[0,-60,170,1.12],[C4.now,-40,160,1.16],[C4.one,-240,230,1.34],[C4.set,-230,230,1.38],[C4.shoot,-140,180,1.24],[T4_IN,0,120,1.14],[C4.end,20,130,1.12]]);
  endArena(s,st,{t:tt,wallZ:GZ4+2.6,gz:GZ4,empty:true,flash:pulse(tt,T4_IN,1.2)});
  const b=ball4(tt);
  endGoalNet(s,st,GZ4,{bulge:.4*net,bx:TGT4[0],by:TGT4[1]});endPosts(s,st,GZ4);
  // "set yourself": a yellow dashed floor ring round the set ball
  floorDashRing(s,st,Y,SET4[0],SET4[1],.5,9,711,easeOutBack(sm(C4.set,C4.set+.4,tt))*(1-sm(T4_HIT-.1,T4_HIT+.2,tt)));
  const its:{z:number;draw:()=>void}[]=[
   {z:kid4(tt).Z,draw:()=>athlete(s,st,kid4,tt,KID,{detail:'high',smear:(tt>T4_TOUCH-.15&&tt<T4_TOUCH+.15)||(tt>T4_HIT-.25&&tt<T4_HIT+.2)?.12:0})},
   {z:friend4(tt).Z,draw:()=>athlete(s,st,friend4,tt,FRIEND,{detail:'mid'})},
   {z:b.Z,draw:()=>{ballOn(s,st,b,721,{min:10,trail:ball4,t0:T4_HIT,t:tt});}},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "Take one touch": a big red "1" pops up beside the ball
  {const p=proj(st,SET4[0]-.75,0,SET4[1]+.2),h=.9*kAt(st,SET4[1]);one(s,p,h,easeOutBack(sm(C4.one,C4.one+.35,tt))*(1-sm(T4_HIT-.2,T4_HIT+.1,tt)));}
  if(tt>=T4_IN&&tt<T4_IN+.9){const p=proj(st,TGT4[0],TGT4[1],TGT4[2]);sparkBurst(s,Y,p[0],p[1],110,{n:11,seed:731,g:easeOut(sm(T4_IN,T4_IN+.3,tt))*(1-sm(T4_IN+.5,T4_IN+.9,tt))});}
  // "with confidence": a big tick stamps beside the goal
  const tk=easeOutBack(sm(C4.conf+.2,C4.conf+.55,tt));if(tk>.02){const g=proj(st,2.4,1.2,GZ4-.5);tick(s,g,150*tk,741);}
 },
 still:C4.set+.3,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'merlim-futsal-signature',format:'futsal',title:'Alex Merlim’s shot from distance',theme:'Take one touch to set yourself, then shoot with confidence.',
 ageNote:'For players aged 7–12: the 2026 European final in Pesaro and its 2–0 result are real; the shot shows how Merlim does it, not a filmed moment. Practise with a friend and a futsal ball.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball is struck from the touch point and flies away with a yellow trail; a red ring snaps; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=sm(0,.45,age,easeOut),bx=x+170*u,by=y-90*u;
  if(age<.4){const v=clamp(age/.4);ring2(s,R,[x,y],r*(1.1+1.4*v),r*(.9+1.2*v),8*(1-v)+2,seed,1,1);}
  if(u>.05&&u<.98){const tr=ribbon([[x,y],[lerp(x,bx,.6),lerp(y,by,.6)-10],[bx,by]],r*.9,{seed:seed+2,taper:.9,wobble:.6});s.knockout(tr,.8);s.fill(Y,tr,1-u);}
  ball(s,bx,by,r*(1-.35*u),seed,{rot:age*8});
 },
};
export default film;
