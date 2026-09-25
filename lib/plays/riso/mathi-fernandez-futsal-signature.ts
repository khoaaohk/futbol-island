/** Mathi Fernández — "the fast-reaction save": a signature riso film (iconic plays, FUTSAL, goleiro).
 *
 * WHO: Mathías "Mathi" Fernández, Uruguay's futsal goleiro (born 5 Oct 1993, Montevideo; Peñarol since 2014; Uruguay international since
 * 2016; Futsal Planet's best goalkeeper in the world for 2025). The card's country (lib/town/playerAppearance.json) is Uruguay and its bio
 * names the 2025 Copa Libertadores with Peñarol, so this is that player (an earlier Spain country flag was a card error, fixed by the lead).
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the fast-reaction save — not one match. El País (Uruguay) match
 * report of the 2025 CONMEBOL Libertadores Futsal FINAL describes, in words, the save that shows it: "Promediando el segundo tiempo le tapó
 * un zurdazo muy potente al arquero de Magnus, Andre Pereira" (midway through the second half he stopped a very powerful LEFT-FOOTED shot
 * from Magnus's goalkeeper, Andre Pereira). So chapter 1 recreates THAT save, and chapter 2 the other thing the report credits to him in
 * the final: his hand throw that set up Franco Duque's 3–1. HOW he stopped the shot (hands, parry) is not in the sources, so the narration
 * of the real match says only "stops it", and the technique is taught in a clearly labelled demonstration (chapter 3).
 * (Match choice: no other film uses a South American club match; the goleiro films use UEFA/FIFA/AFC finals or a Spanish league final.)
 * CAMERA PLAN (chosen to differ from the other goleiro films — Guitta/Plana/Mammarella: behind the shooter, net camera, high side;
 *  Amado: goal-line, high end stand; Sedano: low corner, high far-side diagonal; Paçó: courtside, floor off the far post, front-on;
 *  Chemi / Edu / Feixas / Nazari: gantry end-on, reverse tracking, elevated touchline, POV, orbit, crane):
 *  1  LIVE (broadcast camera, high in the main stand, real time): Peñarol lead 1–0 (the first-half own goal). Magnus's goalkeeper Andre
 *     Pereira carries it up past halfway and hits a left-foot rocket; Mathi, set with his hands ready, stops it (hands — inferred); a
 *     Peñarol defender clears.
 *  2  THE WINNING THROW (a BALL'S-EYE CHASE CAMERA that starts behind Mathi and flies with the ball — used by no other film): late on,
 *     2–1; Magnus attack with a goalkeeper-player; Mathi throws to Franco Duque, who lifts it over the last defender into the empty goal;
 *     3–1 on the scoreboard; champions.
 *  3  HOW HE REACTS (demonstration, slow motion, a LOCKED-OFF SIDE-ON PROFILE camera at hand height; neutral training kit, no match
 *     claimed): hands up in front, knees soft; the short path from ready hands to the ball versus the long path from dropped hands. Saved.
 *  4  PRACTISE (lesson from the entry's `lesson`: "Keep your hands ready in front of you so you can react in a flash"): a kid keeper, a
 *     friend's throw, the "ready window" in front of the chest, the catch, a tick; low camera in front of the goal, the thrower off to the side.
 * Sources (written; fetched with curl once and cached in scratchpad/films/src-cache/):
 *  - El País (Uruguay), Ovación, "¡Hicieron historia! Peñarol le ganó al Magnus de Brasil y es campeón de la Copa Libertadores de futsal"
 *    (1 Jun 2025; elpais-penarol-magnus-2025.html/.txt):
 *    https://www.elpais.com.uy/ovacion/multideportivo/hicieron-historia-penarol-le-gano-al-magnus-de-brasil-y-es-campeon-de-la-copa-libertadores-de-futsal
 *    — "le ganó 3-1 al multicampeón brasileño Magnus Sorocaba"; "El primer gol del Carbonero fue en contra y los restantes los marcaron
 *    Nicolás Ordoqui, de penal, y Franco Duque"; a second Peñarol goal (Zapponi) was ruled out by Video Support; "Promediando el segundo
 *    tiempo le tapó un zurdazo muy potente al arquero de Magnus, Andre Pereira, y otro remate a Joao de Moraes"; with seven minutes left a
 *    red card for Magnus, then Ordoqui's penalty (2–0); "Magnus fue con todo y arquero-jugador"; Leandro Lino (#10) made it 2–1 "al primer
 *    palo de Mathías Fernández"; "El arquero Fernández habilitó con un saque de manos a Franco Duque y el juvenil de 20 años definió por
 *    arriba del último defensor rival y el arco libre"; photo (Conmebol) of Leandro Lino v Nicolás Tumkiewicz = the kits worn that day.
 *  - Search-result summaries (ddg-penarol-magnus-final-2025.txt) of CONMEBOL.com ("Peñarol conquista la CONMEBOL Libertadores Futsal por
 *    primera vez": 3-1 v Magnus Futsal, "COP Arena de la ciudad de Luque - Paraguay"; final "este domingo 01 de junio"), GZH (3 a 1, Luque,
 *    Sunday 1 June) and es.wikipedia (tournament 25 May–1 Jun 2025, COP Arena, Luque).
 *  - alzirafs.com, "Mathi Fernández, nuevo portero del Family Cash Alzira" (alzirafs-fichaje-mathi.txt): Uruguayan, born 5 Oct 1993 in
 *    Montevideo, Peñarol since 2014, Uruguay international since 2016, Libertadores 2025 won v Magnus, Futsal Planet best goalkeeper.
 * CONFIRMED: the final, 1 June 2025, COP Arena, Luque (Paraguay); Peñarol 3–1 Magnus; goal order (own goal 1st half → Ordoqui pen → Lino
 *  → Duque), so 1–0 midway through the second half and 2–1 before Duque's goal; the save of Andre Pereira's powerful left-foot shot midway
 *  through the second half; Magnus playing a goalkeeper-player at the end; Mathi's hand throw to Duque, Duque (20) finishing over the last
 *  defender into the empty goal; KITS from the match photo: Magnus all yellow (black trim), Peñarol all black (yellow numbers/trim); the
 *  blue court with a wood-coloured surround.
 * INFERRED (never named in the narration): HOW he stopped the shot (both hands up in front, a parry — the technique his card is about);
 *  where Pereira shot from (just inside Peñarol's half) and how he got there; every player's position; which end Peñarol defended; the
 *  rebound and the clearance; the goalkeeper kits (Mathi red, Pereira and Magnus's goalkeeper-player white); Mathi's throw style
 *  (overarm), where Duque received it and his chipping foot (right); the celebration; shirt numbers (left off, except none are claimed);
 *  heights (unsourced). No video was reviewed. Chapters 3–4 are a coaching demonstration, not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike, the throw and the reaction). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()`
 * maps library z → −Z. Pereira strikes with his LEFT foot (sourced "zurdazo"); the ball's target IS the solved midpoint of Mathi's hands
 * (handsAt), so gloves and ball always meet.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Magnus, surround, lights, diagram lines), red (Mathi's kit, posts, the "too slow" path), blue (the court), navy (Peñarol's
 * black, key line, stands). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card
 * window 1.45:1 → square). Phone heat: 4 plates; wide-shot figures 'low'; figures behind the chase camera culled; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill,type Build} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2025 final',text:'Copa Libertadores final, 2025. Peñarol lead Magnus, one to nothing. Magnus goalkeeper Andre Pereira strikes a left-foot rocket. Mathi Fernández stops it!',tail:2.2,
  cues:['Copa Libertadores','Peñarol lead','one to nothing','Magnus goalkeeper','Andre Pereira','strikes a left','rocket','Mathi','stops it'],heads:{'Copa Libertadores':'Libertadores final 2025','one to nothing':'1–0','strikes a left':'Left-foot rocket','stops it':'Stopped!'}},
 {label:'The winning throw',text:'Late on, Peñarol lead two to one. Mathi throws to Franco Duque, who lifts it over the last defender into the empty goal. Three to one. Champions!',tail:2.4,
  cues:['Late on','two to one','Mathi throws','Franco Duque','lifts it','last defender','empty goal','Three to one','Champions'],heads:{'two to one':'2–1','Mathi throws':'The throw','empty goal':'Empty goal','Three to one':'3–1','Champions':'Champions!'}},
 {label:'How he reacts (demo)',text:'This is how he reacts. Hands up in front, knees soft. The ball flies in, and his hands are already there. Saved!',tail:2.2,
  cues:['This is how','Hands up','in front','knees soft','The ball','already there','Saved'],heads:{'This is how':'How he reacts (demo)','Hands up':'Hands up','already there':'Already there','Saved':'Saved!'}},
 {label:'Practise it',text:'Your turn. Keep your hands ready in front of you, so you can react in a flash!',tail:2.6,
  cues:['Your turn','Keep your hands','ready','in front','react','flash'],heads:{'ready':'Hands ready','react':'React in a flash'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/mathi-fernandez-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/mathi-fernandez-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/mathi-fernandez-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('mathi: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('mathi: no cue '+w);return c.at;};
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

// ---------------- stage: a perspective camera over the court floor (metres → world units); X right, Y up, Z away ----------------
type Stage={F:number;eye:number;cx:number;cz:number};
const proj=(st:Stage,X:number,Yh:number,Z:number):Pt=>{const k=st.F/Math.max(.25,Z-st.cz);return[(X-st.cx)*k,(st.eye-Yh)*k];};
const kAt=(st:Stage,Z:number)=>st.F/Math.max(.25,Z-st.cz);
const BALL_R=.11;
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);
const lin3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const quad3=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};
/** a throw / chip arc from a to b whose top is `peak` metres above the straight line */
const arc3=(a:V3,b:V3,peak:number,u:number):V3=>{const m:V3=[(a[0]+b[0])/2,(a[1]+b[1])/2+2*peak,(a[2]+b[2])/2];return quad3(a,m,b,u);};

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean over the court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,Math.max(st.cz+.4,pts[i][1]+nz)));Rr.push(proj(st,pts[i][0]-nx,0,Math.max(st.cz+.4,pts[i][1]-nz)));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a dashed ring in the air (screen-space circle around a 3D point) */
function airRing(s:Sheet,st:Stage,ink:string,p:V3,r:number,w:number,seed:number,g=1){if(g<=.02)return;const c=proj(st,p[0],p[1],p[2]),rr=r*kAt(st,p[2])*g,q=blob(c[0],c[1],rr,rr,seed,{n:24,amp:.03}),path=ribbon([...q,q[0]],w,{seed:seed+1,close:true,wobble:1,gaps:dashGaps(q,w*3.2)});s.knockout(path);s.fill(ink,path);}
/** a big tick: blue stroke, navy misregistered echo */
function tickMark(s:Sheet,c:Pt,S:number,seed:number){const tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed,taper:.2,wobble:1}),.5);s.fill(B,ribbon(tk,S*.24,{seed:seed+2,taper:.2,wobble:1}));}
/** a lightning flash: a zig-zag bolt (reaction) */
function bolt(s:Sheet,c:Pt,S:number,seed:number,g=1){if(g<=.02)return;const q:Pt[]=[[-.1,-.6],[.12,-.1],[-.08,-.05],[.1,.6]].map(p=>[c[0]+p[0]*S*g,c[1]+p[1]*S*g] as Pt),p=ribbon(q,S*.13*g,{seed,taper:.5,wobble:.6});s.knockout(p);s.fill(Y,p);s.fill(R,ribbon(q.map(v=>[v[0]+4,v[1]+4] as Pt),S*.05*g,{seed:seed+1,taper:.6}),.8);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2,FACE_AWAY=Math.PI/2;
const SKIN_L:InkFill[]=[[Y,.86],[R,.26]],SKIN_M:InkFill[]=[[Y,.72],[R,.4]],SKIN_D:InkFill[]=[[R,.6],[K,.34]];
/** Mathi Fernández: light skin, short dark hair (playerAppearance); red long-sleeved keeper kit, navy shorts (INFERRED); no number
 * (unsourced); height unsourced (1.82 m drawn) */
const BUILD_K:Build={height:1.82,bulk:1.03};
const MATHI:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:BUILD_K,seed:12};
/** Peñarol (match photo): all black — navy ink here — with yellow trim */
const PEN=(n:number):AthleteStyle=>({shirt:K,shorts:K,socks:K,boots:K,skin:n%3===1?SKIN_M:n%3===2?SKIN_D:SKIN_L,hair:K,line:K,trim:Y,shade:[K,.2],hairStyle:(['short','curly','short','bald'] as const)[n%4],build:{height:1.7+hash(n,3)*.12},seed:30+n});
/** Franco Duque, 20 (El País); build/hair inferred */
const DUQUE:AthleteStyle={...PEN(0),hairStyle:'short',skin:SKIN_L,build:{height:1.76,bulk:.98},seed:21};
/** Magnus (match photo): all yellow, black (navy) trim */
const MAG=(n:number):AthleteStyle=>({shirt:Y,shorts:Y,socks:Y,boots:K,skin:n%3===0?SKIN_M:n%3===1?SKIN_L:SKIN_D,hair:K,line:K,trim:K,hairStyle:(['short','curly','bald','short'] as const)[n%4],build:{height:1.72+hash(n,4)*.12},seed:50+n});
/** Andre Pereira, Magnus goalkeeper: white long-sleeved keeper shirt, navy shorts (INFERRED kit) */
const BUILD_S:Build={height:1.84,bulk:1.04};
const PEREIRA:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,trim:R,gloves:[Y,.9],sleeves:'long',hairStyle:'short',build:BUILD_S,seed:61};
/** Magnus's goalkeeper-player at the end (who it was is not sourced): the same white keeper shirt */
const MAG_GKP:AthleteStyle={...PEREIRA,skin:SKIN_L,hairStyle:'curly',seed:62};
/** the demonstration shooter and the practice pair: neutral training kit (no team is claimed) */
const DEMO_S:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:SKIN_M,hair:K,line:K,trim:R,hairStyle:'curly',build:{height:1.78,bulk:1.02},seed:77};
const KID:AthleteStyle={shirt:[R,.7],shorts:K,socks:[R,.7],boots:K,skin:SKIN_M,hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.42,bulk:.95},seed:78};
const FRIEND:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:SKIN_D,hair:K,line:K,trim:B,hairStyle:'curly',build:{height:1.45,bulk:.95},seed:79};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at a strike's contact (our coords, a shooter at the origin turned to yaw) */
function strikeBall(yaw:number,foot:'l'|'r',build:Build):V3{const sk=solve(strike(STRIKE_CONTACT,{foot}),build,{yaw}),toe=foot==='l'?sk.lToe:sk.rToe,an=foot==='l'?sk.lAn:sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}

/** READY: the goleiro's set with the hands UP in front of the chest, palms open, knees soft, on the toes (library: facing +x) */
const READY=posed({lHipF:44,rHipF:44,lHipA:14,rHipA:14,lKnee:52,rKnee:52,lAnk:-6,rAnk:-6,lean:16,pitch:6,lShF:66,rShF:66,lShA:20,rShA:20,lElb:64,rElb:64,lShR:18,rShR:18,lHand:1,rHand:1,neckP:-12,air:.02});
/** REACT: the hands snap forward to the ball at face height (short, fast path), a small spring off the toes */
const REACT=posed({lHipF:36,rHipF:36,lHipA:16,rHipA:16,lKnee:42,rKnee:42,lAnk:10,rAnk:10,lean:8,pitch:3,lShF:112,rShF:112,lShA:14,rShA:14,lElb:20,rElb:20,lShR:10,rShR:10,lHand:1,rHand:1,neckP:-16,air:.06,squash:.05});
/** RECOIL: the parry pushes up and away, head up following the ball */
const RECOIL=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:0,pitch:-5,lShF:140,rShF:136,lShA:22,rShA:24,lElb:26,rElb:30,lHand:1,rHand:1,neckP:-30});
/** HANDS DOWN (ghost for the demo): hands by the hips — the long, slow path */
const DOWN=posed({lHipF:30,rHipF:30,lKnee:34,rKnee:34,lean:8,lShF:8,rShF:8,lShA:16,rShA:16,lElb:14,rElb:14,lHand:1,rHand:1,neckP:-8});
/** CATCH: hands forward at chest height, fingers up (W shape) */
const CATCH=posed({lHipF:36,rHipF:36,lHipA:14,rHipA:14,lKnee:40,rKnee:40,lean:12,lShF:86,rShF:86,lShA:12,rShA:12,lElb:36,rElb:36,lShR:26,rShR:26,lHand:1,rHand:1,neckP:-8});
/** HUG: the ball pulled into the chest */
const HUGB=posed({lHipF:28,rHipF:28,lKnee:30,rKnee:30,lean:18,lShF:46,rShF:46,lShA:12,rShA:12,lElb:118,rElb:118,lShR:36,rShR:36,lHand:.8,rHand:.8,neckP:10});
/** throw (right arm, overarm): hold at the chest → wind-up → release → follow-through */
const HOLD=posed({lHipF:12,rHipF:12,lKnee:18,rKnee:18,lean:6,lShF:56,rShF:56,lShA:10,rShA:10,lElb:96,rElb:96,lShR:30,rShR:30,neckP:-6,lHand:.8,rHand:.8});
const T_WIND=posed({lHipF:34,rHipF:-12,lKnee:22,rKnee:26,lean:-6,pitch:-3,twist:-34,rShF:150,rShA:38,rElb:104,rShR:40,lShF:72,lShA:18,lElb:22,neckP:-8,rHand:.7,lHand:1});
const T_REL=posed({lHipF:42,rHipF:-22,lKnee:30,rKnee:18,lean:20,twist:24,rShF:156,rShA:12,rElb:8,lShF:18,lShA:30,lElb:60,neckP:-6,rHand:1,lHand:.8,squash:.05});
const T_FOL=posed({lHipF:46,rHipF:-6,lKnee:38,rKnee:40,lean:36,twist:30,rShF:64,rShA:12,rElb:22,lShF:-18,lShA:30,lElb:40,neckP:-10,rHand:1,lHand:.8});
/** throw(u): 0 hold → .45 wind → .6 RELEASE → .85 follow-through → 1 recover */
const THROW_REL=.6;
const throwPose=(u:number):Pose=>keyPoses(clamp(u),[[0,HOLD],[.45,T_WIND],[THROW_REL,T_REL],[.85,T_FOL],[1,blendPose(T_FOL,stand(),.6)]]);
/** in our coords: a point in front of the midpoint of both hands (ball on the palms) */
function handsAt(a:{pose:Pose;yaw:number;X:number;Z:number},build:Build,fwd=.1):V3{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),m=toMine(lin3(sk.lHa,sk.rHa,.5));return[m[0]+Math.cos(a.yaw)*fwd,m[1],m[2]+Math.sin(a.yaw)*fwd];}
const handOf=(a:{pose:Pose;yaw:number;X:number;Z:number},build:Build,h:'l'|'r'):V3=>{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw));return toMine(h==='l'?sk.lHa:sk.rHa);};
/** a figure's chest ring (the passage enters his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},build:Build,r=.09):Pt[]{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}

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
/** a yellow speed trail behind a flying ball (samples of its own path) */
function trail(s:Sheet,st:Stage,path:(t:number)=>V3,t:number,t0:number,len:number,w:number,seed:number){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=path(Math.max(t0,t-len+k*len/8));if(q[2]<st.cz+.5)continue;tr.push(proj(st,q[0],q[1],q[2]));}if(tr.length<2)return;const p=ribbon(tr,w,{seed,taper:.9,wobble:.6});s.knockout(p,.8);s.fill(Y,p);}

// ---------------- the arena (shared): stands, the blue court on a wood surround ----------------
/** stepped navy rows, lit faces, yellow / navy / red / blue shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.3)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.4)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.5)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the court: a wood-coloured surround (yellow + a red screen) and the BLUE playing area (match photo) */
function courtFloor(s:Sheet,st:Stage,run:[number,number,number,number],court:[number,number,number,number]){
 const sur=polyPath(floorQuad(st,run[0],run[1],run[2],run[3]),true);s.knockout(sur);s.fill(Y,sur,.5);s.fill(R,sur,.14);
 const c=polyPath(floorQuad(st,court[0],court[1],court[2],court[3]),true);s.knockout(c);s.fill(B,c,.78);
}
/** navy boards with yellow ad panels and a blue cap */
function boards(s:Sheet,wall:number,board:number,x0s:number[],x1s:number[]){const span=9000;s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();x0s.forEach((x0,i)=>ads.rect(x0,wall-board*.78,x1s[i]-x0,board*.52));s.fill(Y,ads,.75);s.fill(B,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));}

// ---- SIDE court (chapters 1 and 3), from the main-stand side: camera outside the near touchline; Peñarol's goal at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.6,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number,eye=6,cz=-13,F=4500):Stage=>({F,eye,cx:camX,cz});
type SideOpt={cheer?:number;flash?:number;keeper?:()=>void;board?:()=>void};
function courtSide(s:Sheet,st:Stage,t:number,o:SideOpt={}){
 const{cheer=0,flash=0}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.4);s.fill(R,rectPath(-span,wall,span*2,span),.12);
 courtFloor(s,st,[-26,-3,26,BOARDS],[-20,0,20,TOUCH_FAR]);
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[20,0],[20,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X+6,GOAL_X+10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
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

// ---- END court (chapters 2 and 4): the camera looks along +Z at the goal at Z = gz, wall behind it ----
type EndOpt={cheer?:number;flash?:number;t?:number;keeper?:(st:Stage)=>void;behind?:(st:Stage)=>void;mouth?:(st:Stage)=>void};
function endCourt(s:Sheet,st:Stage,gz:number,o:EndOpt={}){
 const{cheer=0,flash=0,t=0}=o,wz=gz+2.4;
 const wall=proj(st,0,0,wz)[1],kw=kAt(st,wz),board=.95*kw,span=6000;
 s.fill(Y,rectPath(-span,wall,span*2,span),.4);s.fill(R,rectPath(-span,wall,span*2,span),.12);
 courtFloor(s,st,[-14,gz-46,14,wz],[-10,gz-40,10,gz]);
 const lines=new Path2D(),arcPts:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),gz-6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),gz-6*Math.sin(a)]);}
 lines.addPath(polyPath(floorStrip(st,[[-10,gz],[10,gz]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts,.05),true));
 lines.addPath(polyPath(floorRing(st,0,gz-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,gz-10,.12,12),true));
 for(const X of[-10,10])lines.addPath(polyPath(floorStrip(st,[[X,Math.max(gz-40,st.cz+.4)],[X,gz]],.05),true));
 if(gz-20>st.cz+.5){lines.addPath(polyPath(floorStrip(st,[[-10,gz-20],[10,gz-20]],.05),true));const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,gz-20+Math.sin(a)*3]);}if(gz-23>st.cz+.5)lines.addPath(polyPath(floorStrip(st,cc,.05),true));}
 s.knockout(lines,.94);
 const x0s:number[]=[],x1s:number[]=[];for(let i=-12;i<12;i++){x0s.push(proj(st,i*2.4+.3,0,wz)[0]);x1s.push(proj(st,i*2.4+1.9,0,wz)[0]);}
 boards(s,wall,board,x0s,x1s);void span;
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 o.behind?.(st);goalEnd(s,st,gz);o.mouth?.(st);o.keeper?.(st);postsEnd(s,st,gz);
}
function goalEnd(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,gz+lerp(Db,Dt,Yh/H));
 const out=[proj(st,Lx,0,gz),proj(st,Lx,H,gz),proj(st,Rx,H,gz),proj(st,Rx,0,gz),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const X of[Lx,Rx])for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,X,Yh,gz),b=back(X,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,gz)*.018),.6);
}
function postsEnd(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,gz);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,gz)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ================= chapter 1 — LIVE: the 2025 final, midway through the 2nd half, 1–0; Pereira's left-foot rocket; Mathi stops it =================
const C1={copa:A(0,'Copa'),lead:A(0,'Peñarol lead'),one:A(0,'one to'),gk:A(0,'Magnus goal'),per:A(0,'Andre'),strikes:A(0,'strikes'),rocket:A(0,'rocket'),mathi:A(0,'Mathi'),stops:A(0,'stops'),end:AUTH[0].seconds};
/** Mathi (inferred spot): a step off his line, central, facing the shooter */
const KP:[number,number]=[-18.8,9.9];
/** where Pereira shoots from (inferred: just inside Peñarol's half, left of centre from the main stand) */
const SP:[number,number]=[-3.8,8.6];
const K_YAW=yawTo(SP[0]-KP[0],SP[1]-KP[1]);
const T_HIT=C1.rocket-.05,T_SAVE=Math.max(T_HIT+.5,C1.mathi-.05);
/** the save: hands meet the ball at face height, a touch to his right (the ball's target IS his solved hands) */
const reactAt=(u:number)=>keyPoses(clamp(u),[[0,READY],[.55,REACT],[1,RECOIL]]);
const CT1=(()=>{const h=handsAt({pose:REACT,yaw:K_YAW,X:KP[0],Z:KP[1]},BUILD_K,.12);return h;})();
const YAW_SHOT=yawTo(CT1[0]-SP[0],CT1[2]-SP[1]);
const SB=strikeBall(YAW_SHOT,'l',BUILD_S),PLANT:[number,number]=[SP[0]-SB[0],SP[1]-SB[2]];
/** Pereira's run: from his own half, dribbling with his left foot, into the strike */
const PR0:[number,number]=[7.5,11.2],PR1:[number,number]=[PLANT[0]+.7,PLANT[1]+.15];
const T_SET=T_HIT-.5;
const pereira:Gen=T=>{
 const u=sm(0,T_SET,T,easeIO),X0=lerp(PR0[0],PR1[0],u),Z0=lerp(PR0[1],PR1[1],u),v=sm(T_SET,T_HIT,T,easeOut);
 const X=T<T_SET?X0:lerp(PR1[0],PLANT[0],v)-.35*sm(T_HIT,T_HIT+.6,T,easeOut),Z=T<T_SET?Z0:lerp(PR1[1],PLANT[1],v);
 const stT=key(T,[[T_SET,.14],[T_HIT,STRIKE_CONTACT],[T_HIT+.6,1]],linear);
 let pose=dribble(T*1.6,{foot:'l',speed:.55});
 if(T>T_SET-.1)pose=blendPose(pose,strike(stT,{foot:'l',power:1}),sm(T_SET-.1,T_SET+.05,T));
 if(T>T_HIT+.7)pose=blendPose(pose,blendPose(stand(),backpedal(T*1.1),.5),sm(T_HIT+.7,T_HIT+1.2,T));
 return{pose,yaw:T<T_SET-.3?FACE_LEFT-.08:lerp(FACE_LEFT-.08,YAW_SHOT,sm(T_SET-.3,T_SET,T,easeIO)),X,Z};};
/** after the save: up and out off his gloves toward the near side, a bounce, cleared by a Peñarol defender */
const OUT1:V3=[-15.6,BALL_R,6.4];
const T_CLR=T_SAVE+1.15;
function liveBall(T:number):V3{
 if(T<T_SET){const p=pereira(T),ph=((T*1.6)%1+1)%1;return[p.X-.5-.12*easeOut(ph),BALL_R,p.Z+.1];}
 if(T<T_HIT){const p0=pereira(T_SET),u=sm(T_SET,T_HIT,T,easeOut);return[lerp(p0.X-.5,SP[0],u),BALL_R,lerp(p0.Z+.1,SP[1],u)];}
 if(T<T_SAVE){const u=sm(T_HIT,T_SAVE,T,linear);return arc3([SP[0],BALL_R,SP[1]],CT1,.25,u);}
 if(T<T_SAVE+.8){const u=sm(T_SAVE,T_SAVE+.8,T,linear);return arc3(CT1,OUT1,1.1,u);}
 if(T<T_CLR){const u=sm(T_SAVE+.8,T_CLR,T,easeOut);return[lerp(OUT1[0],OUT1[0]+.5,u),BALL_R+.35*Math.sin(u*Math.PI)*(1-u),lerp(OUT1[2],OUT1[2]-.3,u)];}
 const u=sm(T_CLR,T_CLR+1.4,T,easeOut);return arc3([OUT1[0]+.5,BALL_R,OUT1[2]-.3],[-6.5,BALL_R,-1.5],.9,u);
}
/** Mathi live: set, shuffles with the ball, hands up READY as Pereira lines up, the reaction (hands to the ball), recoil, then a clap */
const liveK:Gen=T=>{
 const b=liveBall(Math.min(T,T_HIT)),Z=KP[1]+(b[2]-10)*.06,X=KP[0];
 let pose=keeperSet(T*1.3);
 pose=blendPose(pose,READY,sm(T_SET-.4,T_SET,T));
 if(T>T_HIT-.02){const u=key(T,[[T_HIT-.02,0],[T_SAVE,.55],[T_SAVE+.35,1]],linear);pose=reactAt(u);}
 const back=sm(T_SAVE+.9,T_SAVE+1.5,T,easeIO);if(back>0)pose=blendPose(pose,posed({lHipF:14,rHipF:14,lKnee:18,rKnee:18,lean:4,lShF:70,rShF:70,lShA:30,rShA:30,lElb:100,rElb:100,neckP:-18,lHand:1,rHand:1}),back);
 const bb=liveBall(T),yaw=T<T_SAVE?yawTo(bb[0]-X,bb[2]-Z):K_YAW;
 return{pose,yaw,X,Z};};
/** Peñarol's four: P0 steps out to Pereira late, P1 middle, P2 near side (clears), P3 on the pivot at the far post */
const PO:[number,number][]=[[-6.2,6.2],[-10.8,11.8],[-12.6,4.8],[-15.6,13.2]];
const livePEN=(i:number):Gen=>T=>{const[x0,z0]=PO[i],bl=liveBall(T);let X=x0,Z=z0,pose=backpedal(T*1.4+i*.3),yaw=yawTo(bl[0]-x0,bl[2]-z0);
 if(i===0){const c=sm(T_SET-.8,T_HIT,T,easeIO);X=lerp(x0,SP[0]-1.6,c*.8);Z=lerp(z0,SP[1]-1.9,c*.8);pose=blendPose(pose,lunge(key(T,[[T_HIT-.35,0],[T_HIT,.6],[T_HIT+.5,1]],linear),{side:'r'}),sm(T_HIT-.45,T_HIT-.3,T));}
 if(i===2){const c=sm(T_SAVE+.2,T_CLR,T,easeIO),tgt:[number,number]=[OUT1[0]+.9,OUT1[2]-.6];X=lerp(x0,tgt[0],c);Z=lerp(z0,tgt[1],c);if(c>0&&c<1)pose=runCycle(T*runCadence(.8),{speed:.8});
  if(T>T_CLR-.3)pose=blendPose(runCycle(T*runCadence(.4),{speed:.4}),strike(key(T,[[T_CLR-.3,.3],[T_CLR,STRIKE_CONTACT],[T_CLR+.5,1]],linear),{foot:'r'}),.85);
  if(T>T_SAVE+.2)yaw=T<T_CLR?yawTo(OUT1[0]-x0,OUT1[2]-z0):yawTo(1,-.5);}
 return{pose,yaw,X,Z};};
const MAG_POS:[number,number][]=[[-11.8,15.6],[-15.4,11.8],[-9.6,5.2],[1.8,15.2]];// far wing, pivot, near wing, the trailer
const liveMAG=(i:number):Gen=>T=>{const[x0,z0]=MAG_POS[i],bl=liveBall(T);const drift=i===3?-2.2*sm(0,T_HIT,T,easeIO):-.8*sm(0,T_HIT,T);
 let pose=blendPose(stand(),runCycle(T*runCadence(.3)+i*.4,{speed:.3}),.5);
 pose=blendPose(pose,posed({lHipF:10,rHipF:14,lKnee:14,rKnee:16,lean:-6,neckP:-20,lShF:150,rShF:150,lShA:30,rShA:30,lElb:120,rElb:120}),sm(T_SAVE+.1,T_SAVE+.6,T)*(i===1?.9:.5));
 return{pose,yaw:yawTo(bl[0]-x0,bl[2]-z0),X:x0+drift,Z:z0};};
const liveCam=(T:number)=>({x:key(T,mono([[0,4.6],[C1.gk,1.2],[T_SET,-4.4],[T_HIT+.15,-10.4],[T_SAVE,-15.6],[T_SAVE+.8,-16.4],[C1.end,-16.3]]),easeInOutSine),
 zoom:key(T,mono([[0,.72],[C1.gk,.74],[T_SET,.72],[T_HIT+.1,.72],[T_SAVE,.92],[C1.stops,1.0],[C1.end,.95]]),easeInOutSine),
 y:key(T,mono([[0,1060],[T_HIT,1045],[T_SAVE,1010],[C1.end,1015]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_SAVE,.4);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),saved=T>=T_SAVE;
 courtSide(s,st,T,{cheer:saved?.9*sm(T_SAVE,T_SAVE+.4,T)+.1:.1,flash:pulse(T,T_SAVE,1)+.6*pulse(T,C1.stops,1.2),
  keeper:()=>{athlete(s,st,liveK,T,MATHI,{detail:'low',smear:T>T_HIT&&T<T_SAVE+.2?.08:0});}});
 // "Magnus goalkeeper": a yellow dashed ring under Pereira (a goalkeeper out in the court)
 const gr=easeOutBack(sm(C1.gk,C1.gk+.3,T))*(1-sm(T_SET,T_SET+.4,T));
 if(gr>.02){const g=pereira(T);floorDashRing(s,st,Y,g.X,g.Z,.9,10,71,gr);}
 type It={z:number;draw:()=>void};const items:It[]=[];
 const add=(g:Gen,style:AthleteStyle,o:{detail?:'low'|'auto';smear?:number}={})=>items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,style,{detail:o.detail??'low',smear:o.smear})});
 PO.forEach((_,i)=>add(livePEN(i),PEN(i+1)));
 MAG_POS.forEach((_,i)=>add(liveMAG(i),MAG(i+1)));
 add(pereira,PEREIRA,{detail:'auto',smear:T>T_HIT-.2&&T<T_HIT+.25?.1:0});
 items.push({z:b[2]-.05,draw:()=>{const p=proj(st,b[0],b[1],b[2]),g=proj(st,b[0],0,b[2]),r=Math.max(9,kAt(st,b[2])*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45/(1+b[1]));
  if(T>T_HIT&&T<T_SAVE+.25)trail(s,st,liveBall,T,T_HIT,.22,r*1.5,17);
  ball(s,p[0],p[1],r,18,{rot:T*14,smear:T>T_HIT&&T<T_SAVE?.45:0,dir:Math.PI*.98});
  if(T>=T_SAVE&&T<T_SAVE+.4){const q=proj(st,CT1[0],CT1[1],CT1[2]);sparkBurst(s,Y,q[0],q[1],60,{n:9,seed:19,g:easeOut(sm(T_SAVE,T_SAVE+.25,T))});}}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveK(tt),BUILD_K,.16));},still:T_SAVE+.05};

// ================= chapter 2 — THE WINNING THROW (ball's-eye chase camera): 2–1; Mathi throws to Duque; over the last defender; 3–1; champions =================
/** long-axis world: X across (−10..10), Z along the court; Peñarol's goal at Z = −20 (behind the camera), Magnus's EMPTY goal at Z = +20 */
const C2={late:A(1,'Late'),two:A(1,'two to'),thr:A(1,'Mathi throws'),duq:A(1,'Franco'),lifts:A(1,'lifts'),last:A(1,'last'),empty:A(1,'empty'),three:A(1,'Three'),champ:A(1,'Champions'),end:AUTH[1].seconds};
const GZ2=20;
const M2:[number,number]=[.9,-17.2];
const R2:[number,number]=[-2.9,-3.2];
const T_THR=C2.thr+.35,T_REC=T_THR+1.0,T_CHIP=Math.max(T_REC+1.2,C2.last-.5),T_GOAL=T_CHIP+1.45;
const M2_YAW=yawTo(R2[0]-M2[0],R2[1]+1.2-M2[1]);
const mathi2:Gen=t=>{
 const u=key(t,[[T_THR-.65,0],[T_THR,THROW_REL],[T_THR+.7,1]],linear);
 let pose=t<T_THR-.65?blendPose(HOLD,stand(),.25+.1*Math.sin(t*3)):throwPose(u);
 if(t>T_THR+.8)pose=blendPose(pose,celebrate(t*.9,{kind:'arms'}),sm(C2.three,C2.three+.4,t)*.8);
 return{pose,yaw:M2_YAW,X:M2[0],Z:M2[1]+.9*sm(T_THR-.6,T_THR,t,easeOut)};};
const RELP:V3=handOf(mathi2(T_THR),BUILD_K,'r');
/** Duque (inferred path): drifts up the left, the throw leads him, two touches forward, the chip with his right foot */
const CH:[number,number]=[-2.2,.6];
const G_IN:V3=[.35,1.3,GZ2+.05],NET:V3=[.45,BALL_R,GZ2+.75];
const YAW_CHIP=yawTo(G_IN[0]-CH[0],G_IN[2]-CH[1]);
const SB2=strikeBall(YAW_CHIP,'r',{height:1.76,bulk:.98}),PL2:[number,number]=[CH[0]-SB2[0],CH[1]-SB2[2]];
const CEL:[number,number]=[3.6,15.2];
const duque:Gen=t=>{
 const X=key(t,mono([[0,-4.2],[T_THR,-3.6,easeIO],[T_REC,R2[0]-.2,easeOut],[T_CHIP-.35,PL2[0]+.1,easeIO],[T_CHIP,PL2[0],easeOut],[T_GOAL,PL2[0]+1.2,easeIO],[C2.end,CEL[0]]]));
 const Z=key(t,mono([[0,-8.6],[T_THR,-6.8,easeIO],[T_REC,R2[1]-.5,easeOut],[T_CHIP-.35,PL2[1]-.5,easeIO],[T_CHIP,PL2[1],easeOut],[T_GOAL,PL2[1]+3.2,easeIO],[C2.end,CEL[1]]]));
 let pose:Pose;
 if(t<T_REC-.2)pose=runCycle(t*runCadence(.55),{speed:.55});
 else if(t<T_CHIP-.5)pose=dribble(t*1.5,{foot:'r',speed:.5});
 else if(t<T_CHIP+.6)pose=blendPose(dribble((T_CHIP-.5)*1.5,{foot:'r',speed:.5}),strike(key(t,[[T_CHIP-.5,.12],[T_CHIP,STRIKE_CONTACT],[T_CHIP+.6,.95]],linear),{foot:'r',power:.6}),sm(T_CHIP-.5,T_CHIP-.35,t));
 else pose=blendPose(strike(.95,{foot:'r'}),celebrate(t*1.2,{kind:'run'}),sm(T_CHIP+.6,T_GOAL,t));
 const run=yawTo(CEL[0]-PL2[0],CEL[1]-PL2[1]);
 return{pose,yaw:t<T_REC-.3?FACE_AWAY-.15:t<T_CHIP+.6?lerp(FACE_AWAY-.1,YAW_CHIP,sm(T_REC,T_CHIP-.3,t,easeIO)):lerp(YAW_CHIP,run,sm(T_CHIP+.6,T_GOAL,t,easeIO)),X,Z};};
function ball2(t:number):V3{
 if(t<T_THR){const m=mathi2(t),u=sm(T_THR-.45,T_THR,t);return u<=0?handsAt(m,BUILD_K,.14):lin3(handsAt(m,BUILD_K,.14),handOf(m,BUILD_K,'r'),Math.min(1,u*2));}
 const REC:V3=[R2[0]+.25,BALL_R,R2[1]+.6];
 if(t<T_REC)return arc3(RELP,REC,1.3,sm(T_THR,T_REC,t,linear));
 if(t<T_CHIP){const u=sm(T_REC,T_CHIP,t,linear),ph=clamp((u-.15)/.85);return[lerp(REC[0],CH[0],ph),BALL_R+.05*Math.abs(Math.sin(u*9)),lerp(REC[2],CH[1],easeOut(ph))];}
 if(t<T_GOAL)return arc3([CH[0],BALL_R,CH[1]],G_IN,2.4,sm(T_CHIP,T_GOAL,t,linear));
 const u=sm(T_GOAL,T_GOAL+.6,t,easeOut);return[lerp(G_IN[0],NET[0],u),lerp(G_IN[1],NET[1],u)+.25*Math.sin(u*Math.PI)*(1-u),lerp(G_IN[2],NET[2],u)];
}
/** the last Magnus defender steps up, jumps with an arm up as the chip goes over, then hands on head */
const LD:[number,number]=[-.9,5.4];
const REACH=posed({air:.34,lHipF:20,rHipF:40,lKnee:40,rKnee:70,lAnk:40,rAnk:40,lean:-8,pitch:-6,rShF:176,rShA:20,rElb:8,lShF:60,lShA:40,lElb:40,neckP:-40,rHand:1});
const HEADS=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:-4,neckP:-20,lShF:150,rShF:150,lShA:40,rShA:40,lElb:130,rElb:130});
const lastD:Gen=t=>{const X=key(t,mono([[0,LD[0]+.4],[T_REC,LD[0]],[T_CHIP,LD[0]-.3],[T_GOAL,LD[0]-.2]]),easeIO),Z=key(t,mono([[0,LD[1]+1.6],[T_REC,LD[1]+.6],[T_CHIP,LD[1]],[T_GOAL,LD[1]+.6]]),easeIO);
 let pose=backpedal(t*1.4);pose=blendPose(pose,REACH,sm(T_CHIP+.05,T_CHIP+.3,t)*(1-sm(T_CHIP+.7,T_CHIP+1,t)));pose=blendPose(pose,HEADS,sm(T_GOAL,T_GOAL+.5,t));
 const b=ball2(t);return{pose,yaw:t<T_GOAL?yawTo(b[0]-X,b[2]-Z):FACE_AWAY,X,Z};};
/** Magnus's four attackers + the goalkeeper-player, caught upfield, sprint back; Peñarol's others run forward */
const UP:[number,number,number][]=[[-5.4,-11.2,1],[4.8,-10.2,2],[1.2,-12.2,3],[-7.2,-8.4,4]];// x, z, style index
const GKP:[number,number]=[3.4,-8.6];
const chaser=(x0:number,z0:number,i:number):Gen=>t=>{const go=sm(T_THR-.1,T_THR+.5,t),Z=z0+go*Math.min(12,6.2*Math.max(0,t-T_THR)),X=x0*(1-.25*go);
 const pose=go<.05?blendPose(stand(),backpedal(t*1.2+i),.4):runCycle(t*runCadence(.9)+i*.3,{speed:.9});
 return{pose:blendPose(pose,HEADS,sm(T_GOAL+.3,T_GOAL+.9,t)),yaw:go<.3?yawTo(M2[0]-x0,M2[1]-z0):FACE_AWAY,X,Z};};
const PEN2:[number,number][]=[[5.2,-6.2],[-7.2,-12.2]];
const mate=(x0:number,z0:number,i:number):Gen=>t=>{const go=sm(T_THR,T_THR+.4,t),Z=z0+go*Math.min(14,6.6*Math.max(0,t-T_THR)),X=x0*(1-.2*go);
 const pose=blendPose(go<.05?blendPose(stand(),runCycle(t*runCadence(.3),{speed:.3}),.4):runCycle(t*runCadence(.95)+i*.5,{speed:.95}),celebrate(t*1.1+i*.3,{kind:'arms'}),sm(T_GOAL+.2,T_GOAL+.6,t));
 return{pose,yaw:FACE_AWAY,X,Z};};
const GENS2:{g:Gen;style:AthleteStyle}[]=[
 ...UP.map(([x,z,n],i)=>({g:chaser(x,z,i),style:MAG(n)})),{g:chaser(GKP[0],GKP[1],7),style:MAG_GKP},
 ...PEN2.map(([x,z],i)=>({g:mate(x,z,i),style:PEN(i+5)})),{g:lastD,style:MAG(6)}];
/** the chase camera: keyed through the throw, the receive, the chip and into the goal, then a crane up for the celebration */
const cam2=(t:number)=>{
 const cz=key(t,mono([[0,-22.4],[T_THR-.25,-22.2],[T_REC,-10.4],[T_CHIP-.1,-8.4],[T_CHIP+.9,-1.6],[T_GOAL+.2,9.6],[C2.three,10.8],[C2.champ,7.2],[C2.end,6.8]]),easeInOutSine);
 const eye=key(t,mono([[0,2.0],[T_THR,2.1],[T_REC,2.3],[T_CHIP+.6,3.2],[T_GOAL,2.3],[C2.champ,3.0],[C2.end,3.2]]),easeInOutSine);
 const cx=key(t,mono([[0,1.4],[T_THR,1.1],[T_REC,-1.8],[T_CHIP,-1.6],[T_GOAL,.3],[C2.champ,1.6],[C2.end,2.0]]),easeInOutSine);
 const zoom=key(t,mono([[0,1.0],[T_THR,1.0],[T_REC,1.02],[T_GOAL,1.05],[C2.champ,1.0],[C2.end,1.04]]),easeInOutSine);
 return{st:{F:1500,eye,cx,cz} as Stage,zoom};};
/** the arena scoreboard hung over the far wall: PEÑAROL (navy / yellow) 3 – 1 MAGNUS (yellow) */
const SEG:number[][]=[[1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1],[0,1,1,0,0,1,1]];
function digit(p:Path2D,x:number,y:number,w:number,h:number,n:number){const t=w*.2,on=SEG[n]||SEG[0],hh=h/2;
 const bars:[number,number,number,number][]=[[x+t,y,w-2*t,t],[x+w-t,y+t*.5,t,hh-t*.5],[x+w-t,y+hh,t,hh-t*.5],[x+t,y+h-t,w-2*t,t],[x,y+hh,t,hh-t*.5],[x,y+t*.5,t,hh-t*.5],[x+t,y+hh-t/2,w-2*t,t]];
 bars.forEach((b,i)=>{if(on[i])p.rect(b[0],b[1],b[2],b[3]);});}
function scoreboard(s:Sheet,st:Stage,X:number,Z:number,Yh:number,home:number,away:number,flash:number){
 if(Z<st.cz+1)return;const c=proj(st,X,Yh,Z),k=kAt(st,Z),w=4.4*k,h=1.7*k,x=c[0]-w/2,y=c[1]-h/2;
 const cab=new Path2D();cab.moveTo(x+w*.2,y);cab.lineTo(x+w*.2,y-4*k);cab.moveTo(x+w*.8,y);cab.lineTo(x+w*.8,y-4*k);s.stroke(K,cab,Math.max(2,k*.04),.8);
 const box=rectPath(x,y,w,h);s.knockout(box);s.fill(K,box,.92);
 s.knockout(rectPath(x+w*.04,y+h*.2,w*.18,h*.3));s.fill(K,rectPath(x+w*.04,y+h*.2,w*.18,h*.3),.9);s.fill(Y,rectPath(x+w*.04,y+h*.3,w*.18,h*.1));
 s.knockout(rectPath(x+w*.78,y+h*.2,w*.18,h*.3));s.fill(Y,rectPath(x+w*.78,y+h*.2,w*.18,h*.3));
 const dg=new Path2D(),dw=w*.12,dh=h*.62,dy=y+h*.19;digit(dg,x+w*.3,dy,dw,dh,home);dg.rect(x+w*.47,dy+dh*.45,w*.06,dh*.1);digit(dg,x+w*.58,dy,dw,dh,away);
 s.knockout(dg);s.fill(Y,dg,.75+.25*Math.min(1,flash));
 if(flash>.05)s.fill(Y,ribbon([[x-8,y-8],[x+w+8,y-8],[x+w+8,y+h+8],[x-8,y+h+8],[x-8,y-8]],10*flash,{seed:91,taper:0,wobble:1}),Math.min(1,flash));
}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),{st,zoom}=cam2(t),goal=pulse(tt,T_GOAL,1.4);
  const bt=ball2(t),fw=sm(T_CHIP,T_CHIP+.35,t)*(1-sm(T_GOAL-.3,T_GOAL+.3,t)),l0=proj(st,st.cx,1.05,st.cz+9),lb=bt[2]>st.cz+1?proj(st,bt[0],bt[1]*.8+.3,bt[2]):l0,look:Pt=[lerp(l0[0],lb[0],fw*.6),lerp(l0[1],lb[1],fw*.85)];cam(s,look[0],look[1],zoom,0);
  const b=ball2(tt),score=tt<T_GOAL?[2,1]:[3,1];
  endCourt(s,st,GZ2,{t:tt,cheer:.2+.8*sm(T_GOAL,T_GOAL+.4,tt),flash:goal+.6*pulse(tt,C2.champ,1.4),
   behind:stg=>scoreboard(s,stg,0,GZ2+2.2,5.6,score[0],score[1],pulse(tt,C2.two,1)+pulse(tt,C2.three,1.2)),
   mouth:stg=>{// "empty goal": a yellow dashed frame in the open goal mouth
    const e=sm(C2.empty-.3,C2.empty,tt,easeOut)*(1-sm(C2.three,C2.three+.4,tt));
    if(e>.02){const q=[proj(stg,-1.4,.08,GZ2),proj(stg,1.4,.08,GZ2),proj(stg,1.4,1.9,GZ2),proj(stg,-1.4,1.9,GZ2)];dashed(s,Y,[...q,q[0]],10,201,{dash:26,progress:e});}}});
  type It={z:number;draw:()=>void};const items:It[]=[];
  const add=(g:Gen,style:AthleteStyle,smear=0,near=2.6)=>{const a=g(tt);if(a.Z<st.cz+near)return;const k=kAt(st,a.Z);items.push({z:a.Z,draw:()=>athlete(s,st,g,tt,style,{detail:k<70?'low':'auto',smear})});};
  add(mathi2,MATHI,tt>T_THR-.2&&tt<T_THR+.2?.1:0,1.1);add(duque,DUQUE,tt>T_CHIP-.2&&tt<T_CHIP+.2?.12:0);GENS2.forEach(x=>add(x.g,x.style));
  if(b[2]>st.cz+.6)items.push({z:b[2]-.02,draw:()=>{const flying=(tt>T_THR&&tt<T_REC)||(tt>T_CHIP&&tt<T_GOAL);
   if(flying)trail(s,st,ball2,tt,tt<T_REC?T_THR:T_CHIP,.3,kAt(st,b[2])*BALL_R*1.3,211);
   ballOn(s,st,b[0],b[1],b[2],212,{rot:tt*9,smear:flying?.25:0,dir:-Math.PI/2});}});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "Mathi throws": a yellow dashed arrow from his hand toward Duque; "last defender": a red dashed ring under the defender
  const ta=sm(C2.thr,C2.thr+.35,tt,easeOut)*(1-sm(T_THR+.3,T_THR+.7,tt));
  if(ta>.02&&M2[1]>st.cz+1){const d=duque(T_REC),pts=[proj(st,RELP[0],RELP[1]+.2,RELP[2]),proj(st,lerp(RELP[0],d.X,.5),2.4,lerp(RELP[2],d.Z,.5)),proj(st,d.X,.4,d.Z)];dashed(s,Y,pts,10,220,{dash:28,progress:ta});if(ta>.9)arrowHead(s,Y,pts,30);}
  const lr=easeOutBack(sm(C2.last-.2,C2.last+.15,tt))*(1-sm(T_GOAL,T_GOAL+.3,tt));if(lr>.02){const l=lastD(tt);if(l.Z>st.cz+1)floorDashRing(s,st,R,l.X,l.Z,.7,10,221,lr);}
  if(tt>=T_GOAL&&tt<T_GOAL+.9){const q=proj(st,G_IN[0],G_IN[1],G_IN[2]);sparkBurst(s,Y,q[0],q[1],150,{n:12,seed:222,g:easeOut(sm(T_GOAL,T_GOAL+.35,tt))*(1-sm(T_GOAL+.6,T_GOAL+.9,tt))});}
  // "Champions": yellow and navy confetti falls
  const cf=sm(C2.champ-.2,C2.champ+.3,tt);if(cf>0){const p=new Path2D(),q=new Path2D();for(let i=0;i<46;i++){const x=(hash(i,5)-.5)*2400+look[0],y0=look[1]-700+(hash(i,6)*1400+((tt-C2.champ)*260*(0.7+hash(i,7)*.6)))%1400,w=10+hash(i,8)*10,a=tt*3+i;
    const r=rotPts([[-w,-w*.4],[w,-w*.4],[w,w*.4],[-w,w*.4]],a).map(v=>[v[0]+x,v[1]+y0] as Pt);(i%2?p:q).addPath(polyPath(r,true));}s.fill(Y,p,cf);s.fill(K,q,cf*.9);}
 },
 aperture(t0){const{tt,tc}=clock(1,t0);return aperture(chestPts(cam2(tc).st,duque(tt),{height:1.76},.14));},
 still:T_GOAL+.35,
};

// ================= chapter 3 — HOW HE REACTS (demonstration, slow motion, locked-off side-on profile at hand height) =================
const C3={how:A(2,'This is'),up:A(2,'Hands up'),front:A(2,'in front'),knees:A(2,'knees'),ball:A(2,'The ball'),there:A(2,'already'),saved:A(2,'Saved'),end:AUTH[2].seconds};
const KD:[number,number]=[-18.9,10],SH3:[number,number]=[-14.9,9.5];
const KD_YAW=yawTo(SH3[0]-KD[0],SH3[1]-KD[1]);
const CT3=handsAt({pose:REACT,yaw:KD_YAW,X:KD[0],Z:KD[1]},BUILD_K,.12);
const HANDS_READY=handsAt({pose:READY,yaw:KD_YAW,X:KD[0],Z:KD[1]},BUILD_K,.06),HANDS_DOWN=handsAt({pose:DOWN,yaw:KD_YAW,X:KD[0],Z:KD[1]},BUILD_K,.04);
const YAW3=yawTo(CT3[0]-SH3[0],CT3[2]-SH3[1]);
const SB3=strikeBall(YAW3,'r',DEMO_S.build as Build),PL3:[number,number]=[SH3[0]-SB3[0],SH3[1]-SB3[2]];
const D_HIT=C3.ball+.3,D_SAVE=Math.max(D_HIT+1.0,C3.there+.25);
const st3:Stage={F:1400,eye:1.2,cx:-16.9,cz:4.3};
const demoS:Gen=t=>{const S0=D_HIT-1.0,stT=key(t,[[S0,.1],[S0+.45,.24],[D_HIT,STRIKE_CONTACT],[D_HIT+1.3,.85],[C3.end,1]],linear);
 const X=key(t,mono([[0,PL3[0]+1.2],[S0,PL3[0]+.25,easeOut],[D_HIT,PL3[0],easeOut],[C3.end,PL3[0]-.2]])),Z=key(t,mono([[0,PL3[1]],[C3.end,PL3[1]]]));
 const pose=t<S0?dribble(t*.8,{foot:'r',speed:.3}):blendPose(dribble(S0*.8,{foot:'r',speed:.3}),strike(stT,{foot:'r'}),sm(S0,S0+.2,t));
 return{pose,yaw:YAW3,X,Z};};
function demoBall(t:number):V3{
 const S0=D_HIT-1.0;
 if(t<S0){const f=demoS(t),ph=((t*.8)%1+1)%1;return[f.X-.45-.1*easeOut(ph),BALL_R,f.Z+.05];}
 if(t<D_HIT){const f=demoS(S0),u=sm(S0,S0+.45,t,easeOut);return[lerp(f.X-.5,SH3[0],u),BALL_R,lerp(f.Z+.05,SH3[1],u)];}
 if(t<D_SAVE)return arc3([SH3[0],BALL_R,SH3[1]],CT3,.15,sm(D_HIT,D_SAVE,t,linear));
 return arc3(CT3,[-17.4,BALL_R,8.4],.9,sm(D_SAVE,D_SAVE+1.2,t,linear));
}
/** the keeper: set → hands UP in front (on "Hands up") → knees softer → the reaction on the shot (hands already there) → recoil */
const demoK:Gen=t=>{
 let pose=keyPoses(t,monoP([[0,keeperSet(0)],[C3.up-.1,blendPose(keeperSet(0),DOWN,.4)],[C3.up+.35,READY],[D_HIT,READY]]));
 pose=blendPose(pose,{...pose,lKnee:pose.lKnee+.15,rKnee:pose.rKnee+.15},sm(C3.knees,C3.knees+.3,t)*(1-sm(D_HIT,D_HIT+.3,t)));
 if(t>D_HIT+.35){const u=key(t,[[D_HIT+.35,0],[D_SAVE,.55],[D_SAVE+.6,1]],linear);pose=reactAt(u);}
 return{pose,yaw:KD_YAW,X:KD[0],Z:KD[1]};};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,hit=pulse(t,D_SAVE,.5);
  const kc=proj(st,-16.9,1.0,10);
  camPath(s,t,[[0,kc[0]+60,kc[1],1.02],[C3.up,kc[0]-80,kc[1]-40,1.14],[C3.knees,kc[0]-80,kc[1]+20,1.12],[C3.ball,kc[0]+40,kc[1],1.04],[C3.there,kc[0]-60,kc[1]-30,1.12],[C3.end,kc[0]-60,kc[1]-20,1.1]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  const b=demoBall(tt),k=demoK(tt),sk=solve(k.pose,BUILD_K,placeAt(k.X,k.Z,k.yaw));
  courtSide(s,st,tt,{cheer:.5*pulse(tt,D_SAVE,1.6),flash:pulse(tt,D_SAVE,1.2),keeper:()=>{
   athlete(s,st,demoK,tt,MATHI,{detail:'high',smear:tt>D_HIT+.3&&tt<D_SAVE+.1?.18:0});
   // "Hands up … in front": a yellow dashed ring round the ready hands, an arrow from his chest out to them
   const hu=easeOutBack(sm(C3.up,C3.up+.35,tt))*(1-sm(C3.ball,C3.ball+.3,tt));
   airRing(s,st,Y,handsAt(k,BUILD_K,.04),.24,9,230,hu);
   const fr=sm(C3.front,C3.front+.4,tt,easeOut)*(1-sm(C3.ball,C3.ball+.3,tt));
   if(fr>.02){const ch=toMine(sk.chest),h=handsAt(k,BUILD_K,.1),pts=[proj(st,ch[0],ch[1],ch[2]),proj(st,h[0]+.25*Math.cos(KD_YAW),h[1],h[2]+.25*Math.sin(KD_YAW))];dashed(s,Y,pts,9,231,{dash:22,progress:fr});if(fr>.9)arrowHead(s,Y,pts,26);}
   // "knees soft": red dashed rings on both knees
   const kn=easeOutBack(sm(C3.knees,C3.knees+.3,tt))*(1-sm(C3.ball,C3.ball+.3,tt));
   for(const j of[sk.lKn,sk.rKn])airRing(s,st,R,toMine(j),.13,7,232,kn);
   // "already there": the SHORT yellow path (ready hands → ball) against the LONG red path (dropped hands → ball)
   const al=sm(C3.there-.2,C3.there+.3,tt,easeOut)*(1-sm(C3.saved+.3,C3.saved+.8,tt));
   if(al>.02){const lp=[proj(st,HANDS_DOWN[0],HANDS_DOWN[1],HANDS_DOWN[2]),proj(st,lerp(HANDS_DOWN[0],CT3[0],.5)-.25,lerp(HANDS_DOWN[1],CT3[1],.5),CT3[2]),proj(st,CT3[0],CT3[1],CT3[2])];
    dashed(s,R,lp,8,233,{dash:18,progress:al,cov:.9});
    const sp=[proj(st,HANDS_READY[0],HANDS_READY[1],HANDS_READY[2]),proj(st,CT3[0],CT3[1],CT3[2])];dashed(s,Y,sp,12,234,{dash:20,progress:al});if(al>.9)arrowHead(s,Y,sp,26);}
  }});
  const its:{z:number;draw:()=>void}[]=[{z:demoS(tt).Z,draw:()=>athlete(s,st,demoS,tt,DEMO_S,{detail:'high',smear:tt>D_HIT-.4&&tt<D_HIT+.3?.3:0})}];
  its.push({z:b[2]-.3,draw:()=>{const fl=tt>D_HIT&&tt<D_SAVE;if(fl)trail(s,st,demoBall,tt,D_HIT,.45,kAt(st,b[2])*BALL_R*1.3,240);
   ballOn(s,st,b[0],b[1],b[2],241,{rot:tt*4,smear:fl?.25:0,dir:Math.PI});
   if(tt>=D_SAVE&&tt<D_SAVE+.7){const q=proj(st,CT3[0],CT3[1],CT3[2]);sparkBurst(s,Y,q[0],q[1],120,{n:12,seed:242,g:easeOut(sm(D_SAVE,D_SAVE+.3,tt))*(1-sm(D_SAVE+.45,D_SAVE+.7,tt))});}}});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  const tk=easeOutBack(sm(C3.saved+.1,C3.saved+.45,tt));if(tk>.02){const g=proj(st,KD[0]+1.6,2.3,KD[1]);tickMark(s,g,kAt(st,KD[1])*.55*tk,243);}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoK(tt),BUILD_K,.15));},
 still:D_SAVE+.05,
};

// ================= chapter 4 — PRACTISE: a kid keeper, hands ready in front, a friend's throw, the catch in a flash, a tick =================
const C4={turn:A(3,'Your'),keep:A(3,'Keep'),ready:A(3,'ready'),front:A(3,'in front'),react:A(3,'react'),flash:A(3,'flash'),end:AUTH[3].seconds};
const GZ4=11;
const st4:Stage={F:1400,eye:1.0,cx:.2,cz:GZ4-7.9};
const PK:[number,number]=[.5,GZ4-1.0],FR:[number,number]=[-3.0,GZ4-2.6];
const PK_YAW=yawTo(FR[0]-PK[0],FR[1]-PK[1]);
const KBUILD:Build={height:1.42,bulk:.95},FBUILD:Build={height:1.45,bulk:.95};
const FR_YAW=yawTo(PK[0]-FR[0],PK[1]-FR[1]);
const P_CATCH=C4.flash+.05,P_THR=P_CATCH-.5;
const friend:Gen=t=>{const u=key(t,[[P_THR-.55,0],[P_THR,THROW_REL],[P_THR+.6,1]],linear);
 const pose=t<P_THR-.55?blendPose(HOLD,stand(),.3):throwPose(u);return{pose,yaw:FR_YAW,X:FR[0],Z:FR[1]};};
const FRELP:V3=handOf(friend(P_THR),FBUILD,'r');
const practiceK:Gen=t=>{
 let pose=keyPoses(t,monoP([[0,keeperSet(0)],[C4.ready-.1,blendPose(keeperSet(0),DOWN,.5)],[C4.ready+.3,READY],[P_CATCH-.3,READY],[P_CATCH,CATCH],[P_CATCH+.45,HUGB]]));
 if(t<C4.ready-.1)pose=blendPose(keeperSet(t*1.2),DOWN,.5*sm(0,C4.ready-.1,t));
 return{pose,yaw:PK_YAW,X:PK[0],Z:PK[1]};};
const CT4=handsAt({pose:CATCH,yaw:PK_YAW,X:PK[0],Z:PK[1]},KBUILD,.1);
function pBall(t:number):V3{
 if(t<P_THR){const f=friend(t),u=sm(P_THR-.4,P_THR,t);return u<=0?handsAt(f,FBUILD,.14):lin3(handsAt(f,FBUILD,.14),handOf(f,FBUILD,'r'),Math.min(1,u*2));}
 if(t<P_CATCH)return arc3(FRELP,CT4,.25,sm(P_THR,P_CATCH,t,linear));
 const k=practiceK(t);return handsAt(k,KBUILD,lerp(.1,.16,sm(P_CATCH,P_CATCH+.45,t)));
}
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  const kc=proj(st,-1.0,.9,GZ4-1.8);
  camPath(s,t,[[0,kc[0]-90,kc[1]-40,1.2],[C4.keep,kc[0]-60,kc[1]-30,1.24],[C4.ready,kc[0]-20,kc[1]-40,1.3],[C4.react,kc[0]-90,kc[1]-20,1.24],[C4.flash,kc[0]-40,kc[1]-40,1.3],[C4.end,kc[0]-40,kc[1]-30,1.32]]);
  const bp=pBall(tt),k=practiceK(tt);
  endCourt(s,st,GZ4,{t:tt,cheer:.6*pulse(tt,P_CATCH,1.6),flash:pulse(tt,P_CATCH,1),
   keeper:stg=>{
    // "hands ready … in front": a yellow dashed window in front of his chest; an arrow from the chest into it
    const w=easeOutBack(sm(C4.ready,C4.ready+.35,tt))*(1-sm(P_CATCH+.3,P_CATCH+.7,tt));
    if(w>.02){const h=handsAt(k,KBUILD,.14),c=proj(stg,h[0],h[1],h[2]),sz=kAt(stg,h[2])*.34*w,q:Pt[]=[[c[0]-sz,c[1]-sz*.8],[c[0]+sz,c[1]-sz*.8],[c[0]+sz,c[1]+sz*.8],[c[0]-sz,c[1]+sz*.8]];dashed(s,Y,[...q,q[0]],9,250,{dash:22});}
    athlete(s,stg,practiceK,tt,KID,{detail:'high',smear:tt>P_CATCH-.2&&tt<P_CATCH+.1?.15:0});
   }});
  const its:{z:number;draw:()=>void}[]=[{z:FR[1],draw:()=>athlete(s,st,friend,tt,FRIEND,{detail:'high',smear:tt>P_THR-.15&&tt<P_THR+.15?.15:0})},
   {z:tt<P_CATCH?bp[2]:PK[1]-.3,draw:()=>{const fl=tt>P_THR&&tt<P_CATCH;if(fl)trail(s,st,pBall,tt,P_THR,.25,kAt(st,bp[2])*BALL_R*1.2,260);ballOn(s,st,bp[0],bp[1],bp[2],261,{rot:tt*6,smear:fl?.2:0,dir:-Math.PI/2});}}];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "in front": arrow from chest to the window
  const fr=sm(C4.front,C4.front+.4,tt,easeOut)*(1-sm(C4.react+.1,C4.react+.5,tt));
  if(fr>.02){const sk=solve(k.pose,KBUILD,placeAt(k.X,k.Z,k.yaw)),ch=toMine(sk.chest),h=handsAt(k,KBUILD,.4),pts=[proj(st,ch[0],ch[1],ch[2]),proj(st,h[0],h[1],h[2])];dashed(s,Y,pts,9,262,{dash:20,progress:fr});if(fr>.9)arrowHead(s,Y,pts,26);}
  // "flash": a lightning bolt beside the catch, then a tick
  const fl=easeOutBack(sm(P_CATCH,P_CATCH+.25,tt))*(1-sm(P_CATCH+.9,P_CATCH+1.3,tt));if(fl>.02){const q=proj(st,CT4[0]-.55,CT4[1]+.35,CT4[2]);bolt(s,q,kAt(st,CT4[2])*.5,263,fl);}
  const tk=easeOutBack(sm(P_CATCH+.6,P_CATCH+.95,tt));if(tk>.02){const g=proj(st,PK[0]+1.1,1.9,PK[1]);tickMark(s,g,kAt(st,PK[1])*.42*tk,264);}
 },
 still:P_CATCH+.5,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'mathi-fernandez-futsal-signature',format:'futsal',title:'Mathi Fernández’s fast-reaction save',theme:'Keep your hands ready in front of you so you can react in a flash.',
 ageNote:'For players aged 7–12: the 2025 Copa Libertadores final save and winning throw are real; the reaction technique is shown as a demonstration. Practise it with a friend.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball flies in, two gloves snap up in front of it, a flash; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const inU=sm(0,.3,age,easeOut),bx=x-160+160*inU,by=y+20-20*inU;
  const g=sm(.15,.3,age)*(1-sm(.7,.95,age));
  if(g>.02)for(const side of[-1,1]){const gl=blob(x+side*r*.75,y-r*.1,r*.42*g,r*.55*g,seed+(side>0?3:4),{n:18,amp:.08}),p=polyPath(gl,true);s.knockout(p);s.fill(R,p,.35);s.fill(K,ribbon([...gl,gl[0]],5,{seed:seed+5,close:true,wobble:.6}));}
  const u=clamp((age-.3)/.5);if(age>.3&&u<1){s.fill(Y,ribbon(blob(x,y,r*(1+2*u),r*(.7+1.2*u),seed,{n:24}),8*(1-u)+2,{seed,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(bx,y+r*1.1,r*.8,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,by,r,seed,{rot:age*5});
 },
};
export default film;
