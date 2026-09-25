/** Raúl Gómez — "the back-post tap-in": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Raúl Gómez del Olmo (b. 25 Oct 1995), a Spanish pivot / forward from Albacete ("el albaceteño", RFEF) of Inter FS (Movistar Inter),
 *  Spain No. 5 at the 2021 FIFA Futsal World Cup and No. 6 at the 2024 World Cup (Wikipedia squad lists: "FW", club Inter Movistar). This
 *  matches the card: lib/town/playerAppearance.json country "Spain"; playerBios "Spanish pivot from Albacete who has become a key player for
 *  Movistar Inter and has been called up to Spain's national team". Not the Real Madrid footballer Raúl (González) or any namesake.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature, the back-post tap-in, not one match. The Spanish federation's report
 *  of the 2021 FIFA Futsal World Cup ROUND OF 16 describes one of his goals in exactly that way: Spain 5–2 Czech Republic, 24 Sep 2021,
 *  Vilnius Arena (Avia Solutions Group Arena), Vilnius. Raúl Campos had just scored "apareciendo en el segundo palo" (arriving at the back
 *  post) from Adri's ball from the wing; then "En el minuto cinco, Raúl Gómez, en una jugada similar a la anterior, vio como Vahala detuvo
 *  el remate, pero el jugador de Inter FS se repuso en el rechace para firmar el segundo" — a similar move, the keeper Vahala saves his
 *  shot, he recovers and scores the rebound: 2–0. AS.com's live text logs it at 5': "¡¡¡EL SEGUNDO ES DE RAÚL GÓMEZ!!!". So the film
 *  RECREATES that goal (no fallback needed): ball across from the wing → he arrives at the back post → Vahala saves → he scores the rebound.
 *  (Match choice: no other futsal film uses the 2021 World Cup round of 16 / Spain v Czech Republic / Vilnius Arena — checked
 *  lib/plays/riso/*futsal*. His other big goal, 17 seconds into the EURO 2022 semi-final v Portugal, is Zicky Té's match, and no source
 *  describes how it was scored.)
 *  1  LIVE (broadcast camera high in the main stand, real time, Czech goal on the RIGHT): Spain 1–0 up. Spain move it from side to side; a
 *     team-mate carries it down the near wing; Raúl Gómez (red, No. 5) waits wide of the back post, then runs as the ball is played across;
 *     he meets it at the back post, Vahala blocks, the ball comes back out and Gómez taps the rebound in: 2–0. He runs off, arms out.
 *  2  REPLAY (slow motion, reverse angle, low BEHIND the Czech goal looking back up the court): he waits, then runs; ball and runner meet
 *     at the back post (the two paths drawn on the floor); the first shot is saved, the second goes in.
 *  3  YOUR TURN (lesson from the entry's `lesson`: "Arrive at the back post at the same time as the ball."): three cards (wait, run,
 *     arrive), then a training drill in neutral kit (no match claimed): a team-mate rolls it across, he times the run, both paths meet at
 *     a ring by the back post, tap-in, tick.
 * Sources (written; fetched with curl and cached in scratchpad/films/src-cache/):
 *  - RFEF (futsal.rfef.es), "Trabajada victoria de España ante la República Checa para obtener el pase a Cuartos de Final (5-2)",
 *    25/09/2021: https://futsal.rfef.es/noticia/trabajada-victoria-de-espana-ante-la-republica-checa-para-obtener-el-pase-a-cuartos-de-final-5-2/62221
 *    (rfef-2021-esp-cze.txt) — round of 16, "Vilnius Arena", "la pista azul de la FIFA" (the blue FIFA court), Campos's back-post goal
 *    from Adri's ball, Gómez's goal at minute 5 as quoted above, "el albaceteño", "el jugador de Inter FS"; the Czech side "el conjunto
 *    blanco" (white); Spain's keeper Jesús Herrero; Raya's goal, Adolfo's back-post goal set up by Gómez down the wing, 4–0 at half-time;
 *    Czech goals Resetar / Holý; Ortiz's fifth.
 *  - AS.com live text, 24 Sep 2021 (as-2021-esp-cze.txt): https://as.com/masdeporte/2021/09/24/polideportivo/1632492676_697792.html — 4'
 *    Campos (Adri "mete un buen balón al segundo palo"), 5' "EL SEGUNDO ES DE RAÚL GÓMEZ", 2–0; Spain's starting five Herrero, Ortiz, Adri,
 *    Adolfo, Campos (so Gómez came on in the rolling changes).
 *  - pt.wikipedia, "Copa do Mundo de Futsal da FIFA de 2021" (raw; ptwiki-2021-futsal-wc.txt): 24 Sep, 20:00, Spain 5–2 Czech Republic,
 *    Avia Solutions Group Arena, Vilnius; goals Campos 4, Gómez 5, Raya 13, Fernández 15, Ortiz 39 / Rešetár 23, Holý 32; referee Tomohiro
 *    Kozaki (Japan). en.wikipedia "2021 FIFA Futsal World Cup squads" (raw): Spain No. 5 Raúl Gómez, FW, b. 25 Oct 1995, Inter Movistar.
 *  - en.wikipedia "Raúl Gómez (futsal player)" and es.wikipedia "Raúl Gómez del Olmo": 404 (no article) — cached as .404.html.
 * CONFIRMED: competition, round, date, venue, both teams, the blue court, Czech in white, 1–0 before his goal, his goal at minute 5 making it
 *  2–0, the move (ball from the wing to the back post as in Campos's goal; Vahala saves his shot; he scores the rebound), Vahala in the
 *  Czech goal, Herrero in Spain's, Gómez Spain's No. 5 from Albacete / Inter FS.
 * INFERRED (never narrated): Spain in red shirts, navy shorts, red socks (Czech in white makes red very likely, but no source names Spain's
 *  kit); the keepers' colours (Vahala yellow, Herrero navy); which end; which wing the ball came from (the near one here) and who played it
 *  (left unnamed: the report only says "similar" to Adri's ball); every position and run; his feet (right foot first time, right-foot
 *  tap); the keeper's block with the right hand and the rebound's line; the celebration. No video was reviewed. Chapter 3 is a drill in
 *  training kit, not match footage.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the run and the strikes). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 *  z → −Z. The replay reuses the live choreography through a rotation `REV` (a proper rotation, so feet and hands keep their side).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (lights, diagrams, the keeper), red (Spain, rings), blue (the FIFA court), navy (key line, shorts, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 *  Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: World Cup 2021',text:'The 2021 Futsal World Cup, round of sixteen. Spain lead the Czech Republic. Raúl Gómez waits near the back post. The ball zips across, he shoots, saved! He follows it in. Two nil!',tail:2.4,
  cues:['The 2021','Spain lead','waits near','ball zips','he shoots','saved','follows it','Two nil'],heads:{'The 2021':'World Cup 2021','Spain lead':'1–0','Two nil':'2–0'}},
 {label:'Replay: the back post',text:'Watch again, in slow motion. He waits, then runs, so he meets the ball right at the back post. First shot saved, second shot in!',tail:1.8,
  cues:['Watch again','He waits','then runs','meets the ball','First shot','second shot'],heads:{'meets the ball':'Back post','second shot':'2–0'}},
 {label:'Your turn',text:'Your turn. Wait, then run. Arrive at the back post at the same time as the ball!',tail:2.6,
  cues:['Your turn','Wait','then run','Arrive at','same time'],heads:{'Wait':'Wait, run, arrive','same time':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/raul-gomez-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/raul-gomez-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/raul-gomez-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('raul-gomez: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('raul-gomez: no cue '+w);return c.at;};
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
/** court → camera-stage floor transforms. IDX: the live / drill stages see the court as it is (Czech goal at X = +20, main stand at Z < 0).
 *  REV: the replay camera sits BEHIND that goal looking back up the court: stage X = court Z − 10, stage Z = 20 − court X (a rotation). */
type Xf=(X:number,Z:number)=>[number,number];
const IDX:Xf=(X,Z)=>[X,Z];
const REV:Xf=(X,Z)=>[Z-10,20-X];
const REV_INV:Xf=(x,z)=>[20-z,x+10];
const P3=(st:Stage,xf:Xf,X:number,Yh:number,Z:number):Pt=>{const[a,b]=xf(X,Z);return proj(st,a,Yh,b);};
const depthOf=(xf:Xf,X:number,Z:number)=>xf(X,Z)[1];

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the floor */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number}={}){const{dash=width*4.5,cov=1,progress=1}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24,xf:Xf=IDX):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(P3(st,xf,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
/** a dashed floor ring at court (X,Z), seen through xf */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1,xf:Xf=IDX){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26,xf),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a court-floor polyline (court coords) through xf, as sheet points */
const floorLine=(st:Stage,xf:Xf,pts:Pt[]):Pt[]=>pts.map(q=>P3(st,xf,q[0],0,q[1]));

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. xf maps the court onto the stage. */
function projector(st:Stage,xf:Xf=IDX,inv:Xf=IDX):Projector{const e=inv(st.cx,st.cz);
 return{eye:[e[0],st.eye,-e[1]] as V3,project(p:V3){const[a,b]=xf(p[0],-p[2]),q=proj(st,a,p[1],b);return[q[0],q[1],b-st.cz];},scale(p:V3){return kAt(st,xf(p[0],-p[2])[1]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) on the court (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0;
const BUILD={height:1.8,bulk:1.04};
/** Raúl Gómez: Spain No. 5 (2021 squad list); kit inferred red / navy / red; short dark hair and stubble (playerAppearance) */
const GOMEZ:AthleteStyle={shirt:R,shorts:K,socks:R,boots:'paper',skin:[[Y,.84],[R,.24]],hair:K,line:K,trim:Y,hairStyle:'short',number:5,numberInk:Y,build:BUILD,seed:9};
/** Gómez in the drill: a plain red training top, no number, navy shorts and socks (no match kit, so no match is implied) */
const GOMEZ_T:AthleteStyle={...GOMEZ,shirt:[R,.95],number:null,shorts:K,socks:K,trim:Y};
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:Y,hairStyle:(['short','curly','bald'] as const)[n%3],build:{height:1.72+hash(n,3)*.12},seed:20+n});
/** the Czech Republic: "el conjunto blanco" (RFEF) — white shirts; navy shorts and white socks inferred */
const CZE=(n:number):AthleteStyle=>({shirt:'paper',shorts:[K,.85],socks:'paper',boots:K,skin:[[Y,.74],[R,.2]],hair:K,line:K,trim:[B,.9],hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.74+hash(n,4)*.12},seed:40+n});
/** Vahala (Czech keeper; yellow inferred) and Jesús Herrero (Spain's keeper; navy inferred) */
const VAHALA:AthleteStyle={shirt:[Y,.95],shorts:K,socks:[Y,.9],boots:K,skin:[[Y,.72],[R,.2]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.86},seed:61};
const HERRERO:AthleteStyle={shirt:[K,.7],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:62};
/** the drill's passer: a paper training bib, no team claimed */
const DRILL_P:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:R,hairStyle:'curly',build:{height:1.76},seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
type AOpt={detail?:'auto'|'low'|'mid'|'high';smear?:number;xf?:Xf;inv?:Xf};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:AOpt={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st,o.xf,o.inv),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at a strike's contact (court coords relative to the plant, place at the origin) */
function strikeBall(yaw:number,foot:'l'|'r'='r'):[number,number]{const sk=solve(strike(STRIKE_CONTACT,{foot}),BUILD,{yaw}),toe=foot==='r'?sk.rToe:sk.lToe,an=foot==='r'?sk.rAn:sk.lAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1,p=toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);return[p[0],p[2]];}
const plantFor=(ball:[number,number],yaw:number,foot:'l'|'r'='r'):[number,number]=>{const sb=strikeBall(yaw,foot);return[ball[0]-sb[0],ball[1]-sb[1]];};
/** a quick pass: a short kick blended over any pose */
const KICK=posed({lHipF:-10,rHipF:40,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30});

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
type BallS={X:number;Y:number;Z:number;flying:boolean;fast?:boolean;spin:number};
/** a court ball on a stage (through xf): ground shadow, optional yellow trail, the ball */
function drawBall(s:Sheet,st:Stage,xf:Xf,b:BallS,seed:number,o:{min?:number;trail?:Pt[];smear?:number;dir?:number}={}){
 const[a,z]=xf(b.X,b.Z),p=proj(st,a,b.Y,z),g=proj(st,a,0,z),r=Math.max(o.min??9,kAt(st,z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);
 if(o.trail&&o.trail.length>1){const trp=ribbon(o.trail,r*1.5,{seed:seed+7,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
 ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, red / blue / paper shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),blu=new Path2D(),reds=new Path2D(),pap=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3);
   if(hash(i,7)<.3)continue;// a thin World Cup crowd: empty seats
   const jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.22)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.34)blu.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)pap.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(B,blu);s.fill(R,reds);s.knockout(pap,.8);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the blue FIFA court (RFEF: "la pista azul de la FIFA"): a blue court on a darker blue-navy run-off, a faint sheen */
function floorBase(s:Sheet,st:Stage,wall:number,court:Pt[]){const span=9000;s.fill(B,rectPath(-span,wall,span*2,span),.85);s.fill(K,rectPath(-span,wall,span*2,span),.35);
 const c=polyPath(court,true);s.knockout(c,.35);s.fill(B,c,.8);s.fill(Y,c,.06);}

// ---- LIVE / DRILL court seen from the main stand side; the Czech goal at X = +20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GX=20,POST_N=8.5,POST_F=11.5,GH=2;
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 floorBase(s,st,wall,floorQuad(st,-20,0,20,TOUCH_FAR));
 // painted lines: touchlines, goal lines, halfway, the penalty area (6 m arcs from the posts), the 6 m and 10 m marks, the centre circle
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GX-6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GX-6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GX,0],[GX,TOUCH_FAR]],[[-GX,0],[-GX,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GX-6,GX-10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 // boards and the crowd on the far side
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st,bulge,bz,by);o.keeper?.();sidePosts(s,st);
}
/** the Czech goal (right end), net going +X; bulge pushes the back of the net outward round (bz, by) */
function sideGoal(s:Sheet,st:Stage,bulge:number,bz:number,by:number){
 const Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((Z-bz)**2+(Yh-by)**2)/.35);return proj(st,GX+lerp(Db,Dt,Yh/GH)+d,Yh,Z);};
 const hull=[proj(st,GX,0,POST_N),proj(st,GX,GH,POST_N),proj(st,GX,GH,POST_F),back(POST_F,GH),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=GH+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.4){const a=proj(st,GX,Yh,POST_N),b=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage){
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,GX+dx,Yh,Z);quad([P(0,-w),P(0,w),P(GH,w),P(GH,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*GH,y1=(k+1)/8*GH;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>proj(st,GX,GH+dy,Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---- REPLAY court from BEHIND the Czech goal (stage coords: goal line Z = 0, the court runs away to Z = 40, far wall behind it) ----
const WALL_R=41.6;
function endCourt(s:Sheet,st:Stage,t:number,cheer:number,flash:number){
 const wall=proj(st,0,0,WALL_R)[1],kw=kAt(st,WALL_R),span=9000;
 floorBase(s,st,wall,floorQuad(st,-10,0,10,40));
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([-1.5-6*Math.cos(a),6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([1.5+6*Math.cos(a),6*Math.sin(a)]);}
 for(const seg of[[[-10,0],[10,0]],[[-10,-2],[-10,40]],[[10,-2],[10,40]],[[-10,20],[10,20]],[[-10,40],[10,40]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const Z of[6,10])lines.addPath(polyPath(floorRing(st,0,Z,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,20+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALL_R)[0],x1=proj(st,i*2.4+1.9,0,WALL_R)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,0);
 // Spain's goal at the far end, small
 const fg=new Path2D();for(const q of[[proj(st,-1.5,0,40),proj(st,-1.5,GH,40),proj(st,1.5,GH,40),proj(st,1.5,0,40)]])fg.addPath(ribbon(q,Math.max(2.5,kAt(st,40)*.08),{seed:5,taper:0,wobble:.3}));s.knockout(fg);s.fill(R,fg,.8);
}
/** the near goal frame (Z = 0) seen from behind: red-banded posts and bar */
function nearPosts(s:Sheet,st:Stage){
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,0);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,0)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([-1.5,0],[-1.5,GH],8);bar([1.5,0],[1.5,GH],8);bar([-1.5,GH],[1.5,GH],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
/** the net between the camera and the goal: back plane (Z −.95 at the floor → −.55 at the bar height), roof and sides, as a foreground mesh */
function nearNet(s:Sheet,st:Stage,bulge:number,bx:number,by:number){
 const Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((X-bx)**2+(Yh-by)**2)/.35);return proj(st,X,Yh,-lerp(Db,Dt,Yh/GH)-d);};
 const mesh=new Path2D();
 for(let X=-1.5;X<=1.5+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=GH+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}const c=proj(st,X,GH,0);mesh.lineTo(c[0],c[1]);}
 for(let Yh=0;Yh<=GH+1e-6;Yh+=.3){const a=back(-1.5,Yh);mesh.moveTo(a[0],a[1]);for(let X=-1.2;X<=1.5+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const X of[-1.5,1.5])for(let Yh=0;Yh<=GH+1e-6;Yh+=.4){const a=proj(st,X,Yh,0),b=back(X,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 for(let u=.2;u<1;u+=.2){const a=proj(st,-1.5,GH,-Dt*u),b=proj(st,1.5,GH,-Dt*u);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(2,kAt(st,-.7)*.014),.5);
}

// ================= chapter 1 — LIVE: Vilnius 2021, 1–0 up; ball across, the back-post arrival, the save, the rebound: 2–0 =================
const C1={y21:A(0,'The 2021'),lead:A(0,'Spain lead'),waits:A(0,'waits near'),zips:A(0,'ball zips'),shoots:A(0,'he shoots'),saved:A(0,'saved'),follows:A(0,'follows it'),two:A(0,'Two nil'),end:AUTH[0].seconds};
/** key moments (live seconds): the cross, his run, the first shot, Vahala's block, the rebound tap, the net */
const T_S1=C1.saved-.3,T_SAVE=T_S1+.12,T_X=T_S1-1.2,T_RUN=T_X-.5,T_S2=C1.follows+.2,T_IN=T_S2+.26;
/** Spain's build-up (inferred): the ala (P2) → the fixo (F) → the near-wing player (W), who carries it to the corner of the box and plays it across */
const P2P:[number,number]=[8.2,14.4],F0:[number,number]=[5.6,7.2],WR:[number,number]=[12.2,2.5],C0:[number,number]=[16.2,2.0];
const T_A0=.7,T_A1=1.75,T_B0=T_X-3.1,T_B1=T_B0+1;
/** the back post: where the ball and Gómez meet (just outside the far post line, 1.9 m out) */
const M1:[number,number]=[18.1,11.9],WAIT:[number,number]=[13.2,16.4];
const YAW_X=yawTo(M1[0]-C0[0],M1[1]-C0[1]),PLANT_X=plantFor(C0,YAW_X);
/** his first-time shot aims low inside the far post; the rebound comes back out into the middle; the tap goes low inside the near post */
const TGT1:V3=[GX-.05,.3,10.9],REB:[number,number]=[18.35,10.15],TGT2:V3=[GX+.05,.28,9.2];
const YAW_1=yawTo(TGT1[0]-M1[0],TGT1[2]-M1[1]),PLANT1=plantFor(M1,YAW_1);
const YAW_2=yawTo(TGT2[0]-REB[0],TGT2[2]-REB[1]),PLANT2=plantFor(REB,YAW_2);
const T_REB=T_SAVE+.95;
/** Vahala: set at the near post for the cross → pushes across → dives to his right (the far post) and blocks with his hands */
const KZ0=9.3,KZ1=10.35,KX=GX-.72;
const liveK:Gen=T=>{let pose=keeperSet(T*1.3);const d=sm(T_S1-.32,T_S1+.5,T,linear);if(T>=T_S1-.32)pose=blendPose(pose,keeperDive(d*.95,{side:'r',height:.08}),sm(T_S1-.32,T_S1-.22,T));
 return{pose,yaw:FACE_LEFT+.18,X:KX,Z:lerp(KZ0,KZ1,sm(T_X+.1,T_S1-.3,T,easeIO))};};
/** the block point: his right hand at the save (clamped just off the floor) */
const BLOCK:V3=(()=>{const k=liveK(T_SAVE),sk=solve(k.pose,{height:1.86},placeAt(k.X,k.Z,k.yaw)),h=toMine(sk.rHa);return[h[0],Math.max(.2,h[1]),h[2]];})();
function liveBall(T:number):BallS{
 const roll=(a:[number,number],b:[number,number],t0:number,t1:number,e=easeOut,fast=false):BallS=>{const u=sm(t0,t1,T,e);return{X:lerp(a[0],b[0],u),Y:BALL_R,Z:lerp(a[1],b[1],u),flying:false,fast,spin:u*8};};
 const q=(a:V3|[number,number,number],b:V3,t0:number,t1:number,h:number,spin0:number):BallS=>{const u=sm(t0,t1,T,linear),M:V3=[lerp(a[0],b[0],.5),Math.max(a[1],b[1])+h,lerp(a[2],b[2],.5)],p=(1-u)*(1-u),m=2*u*(1-u),c=u*u;
  return{X:p*a[0]+m*M[0]+c*b[0],Y:p*a[1]+m*M[1]+c*b[1],Z:p*a[2]+m*M[2]+c*b[2],flying:true,spin:spin0+u*30};};
 const p2:[number,number]=[P2P[0]+.45,P2P[1]-.2],f0:[number,number]=[F0[0]+.45,F0[1]+.15],w0:[number,number]=[WR[0]+.4,WR[1]+.05];
 if(T<T_A0)return{X:p2[0],Y:BALL_R,Z:p2[1],flying:false,spin:0};
 if(T<T_A1)return roll(p2,f0,T_A0,T_A1);
 if(T<T_B0)return{...roll(f0,[f0[0]+.3,f0[1]-.2],T_A1,T_B0,easeIO),spin:T*2};
 if(T<T_B1)return roll([f0[0]+.3,f0[1]-.2],w0,T_B0,T_B1);
 // the carry to the corner of the box: touched every other stride
 if(T<T_X){const u=sm(T_B1+.1,T_X-.08,T,easeIO),touch=.12*Math.abs(Math.sin((T-T_B1)*6))*(1-sm(T_X-.4,T_X-.1,T));return{X:lerp(w0[0],C0[0],u)+touch,Y:BALL_R,Z:lerp(w0[1],C0[1],u),flying:false,spin:(T-T_B1)*10};}
 // across the box, low and quick, to the back post
 if(T<T_S1)return roll(C0,M1,T_X,T_S1,(u:number)=>1-(1-u)*(1-u)*.35-.65*(1-u),true);
 // the first shot → Vahala's hand
 if(T<T_SAVE)return q([M1[0],BALL_R,M1[1]],BLOCK,T_S1,T_SAVE,.08,10);
 // the rebound comes back out into the middle and slows
 if(T<T_S2){const u=sm(T_SAVE,T_REB,T,easeOut),bo=Math.abs(Math.sin(u*Math.PI*1.5))*.28*(1-u);return{X:lerp(BLOCK[0],REB[0],u),Y:lerp(BLOCK[1],BALL_R,sm(T_SAVE,T_SAVE+.2,T))+bo,Z:lerp(BLOCK[2],REB[1],u),flying:u<.4,spin:30+u*10};}
 // the tap in, low inside the near post
 if(T<T_IN)return q([REB[0],BALL_R,REB[1]],TGT2,T_S2,T_IN,.12,40);
 const d=sm(T_IN,T_IN+.3,T,easeOut);return{X:lerp(TGT2[0],GX+.62,d),Y:lerp(TGT2[1],BALL_R,sm(T_IN+.1,T_IN+.4,T)),Z:TGT2[2]-.1*d,flying:false,spin:50};
}
/** Raúl Gómez live: waits wide of the back post → runs in as the ball is played → first-time right foot at the back post → saved → steps
 *  across and taps the rebound in with the right foot → runs off, arms out */
const CEL_DIR=-2.2;
const liveG:Gen=T=>{
 let X:number,Z:number,pose:Pose,yaw:number;
 if(T<T_RUN){X=WAIT[0]+.35*Math.sin(T*.8);Z=WAIT[1]-.25*Math.sin(T*.55);yaw=yawTo(liveBall(T).X-X,liveBall(T).Z-Z);
  pose=blendPose(stand(),backpedal(T*1.1),.45+.2*Math.sin(T*1.3));}
 else if(T<T_S1+.5){const u=sm(T_RUN,T_S1,T,(v:number)=>v*v*(1.6-.6*v)),c:[number,number]=[lerp(WAIT[0],PLANT1[0],.62),lerp(WAIT[1],PLANT1[1],.3)];
  const a=(1-u)*(1-u),b=2*u*(1-u),cc=u*u;X=a*WAIT[0]+b*c[0]+cc*PLANT1[0];Z=a*WAIT[1]+b*c[1]+cc*PLANT1[1];
  const carry=sm(T_S1,T_S1+.5,T,easeOut)*.45;X+=Math.cos(YAW_1)*carry;Z+=Math.sin(YAW_1)*carry;
  const run=yawTo(PLANT1[0]-WAIT[0],PLANT1[1]-WAIT[1]);yaw=lerp(lerp(yawTo(C0[0]-WAIT[0],C0[1]-WAIT[1]),run,sm(T_RUN,T_RUN+.35,T)),YAW_1,sm(T_S1-.35,T_S1-.05,T,easeIO));
  const st=key(T,[[T_S1-.34,.12],[T_S1-.16,.26],[T_S1,STRIKE_CONTACT],[T_S1+.5,.86]],linear);
  pose=blendPose(runCycle((T-T_RUN)*runCadence(.95),{speed:.95}),strike(st,{foot:'r',power:.8}),sm(T_S1-.36,T_S1-.2,T));}
 else if(T<T_S2+.55){const f=liveG(T_S1+.499),u=sm(T_S1+.5,T_S2-.05,T,easeIO);X=lerp(f.X,PLANT2[0],u);Z=lerp(f.Z,PLANT2[1],u);
  yaw=lerp(f.yaw,YAW_2,sm(T_S1+.5,T_S2-.3,T,easeIO));
  const st=key(T,[[T_S2-.3,.14],[T_S2-.12,.28],[T_S2,STRIKE_CONTACT],[T_S2+.55,.9]],linear);
  pose=blendPose(blendPose(strike(.86,{foot:'r'}),runCycle((T-T_S1)*runCadence(.5),{speed:.5}),sm(T_S1+.5,T_S1+.8,T)),strike(st,{foot:'r',power:.45}),sm(T_S2-.34,T_S2-.18,T));}
 else{const f=liveG(T_S2+.549),run=T-T_S2-.55,u=sm(T_S2+.55,T_S2+1.1,T,easeIO);
  X=f.X+Math.cos(CEL_DIR)*run*2.8*u;Z=f.Z+Math.sin(CEL_DIR)*run*2.8*u;yaw=lerp(YAW_2,CEL_DIR,u);
  pose=blendPose(strike(.9,{foot:'r'}),celebrate(run*1.2,{kind:'run'}),u);}
 return{pose,yaw,X,Z};
};
/** a figure following a timed path: runs when moving, a ready shuffle when not */
type Path={p:[number,number][];t:number[]};
function pathAt(m:Path,T:number):[number,number]{let k=0;while(k<m.t.length-2&&T>m.t[k+1])k++;const u=sm(m.t[k],m.t[k+1],T,easeIO);return[lerp(m.p[k][0],m.p[k+1][0],u),lerp(m.p[k][1],m.p[k+1][1],u)];}
function mover(m:Path,T:number,i:number):{pose:Pose;X:number;Z:number;mv:number}{const[X,Z]=pathAt(m,T),v=pathAt(m,T+.1),mv=Math.hypot(v[0]-X,v[1]-Z)*10;
 const pose=mv>1.1?runCycle(T*runCadence(Math.min(1,mv/6))+i*.3,{speed:Math.min(1,mv/6)}):blendPose(stand(),backpedal(T*1.2+i*.2),.4);return{pose,X,Z,mv};}
/** Spain's other three: the wing player W (carries, crosses), the fixo F, the ala P2; after the goal they run to Gómez */
const CEL_AT=(()=>{const f=liveG(C1.end);return[f.X,f.Z] as [number,number];})();
const W_PATH:Path={p:[[10.4,3.2],[WR[0]-.3,WR[1]],PLANT_X,PLANT_X],t:[0,T_B1-.1,T_X-.05,T_X+.6]};
const liveW:Gen=T=>{
 let X:number,Z:number,pose:Pose,yaw:number;
 if(T<T_B1){const m=mover(W_PATH,T,0);X=m.X;Z=m.Z;pose=m.pose;yaw=yawTo(liveBall(T).X-X,liveBall(T).Z-Z);}
 else if(T<T_X-.36){const b=liveBall(T),dir=yawTo(C0[0]-WR[0],C0[1]-WR[1]);X=b.X-Math.cos(dir)*.5;Z=b.Z-Math.sin(dir)*.5;yaw=dir;pose=dribble((T-T_B1)*2,{foot:'r',speed:.6});}
 else if(T<T_X+.6){const b0=liveW(T_X-.361),u=sm(T_X-.36,T_X-.06,T,easeOut);X=lerp(b0.X,PLANT_X[0],u);Z=lerp(b0.Z,PLANT_X[1],u);yaw=lerp(b0.yaw,YAW_X,u);
  pose=blendPose(dribble((T_X-.36-T_B1)*2,{foot:'r',speed:.6}),strike(key(T,[[T_X-.36,.16],[T_X,STRIKE_CONTACT],[T_X+.6,.9]],linear),{foot:'r',power:.7}),sm(T_X-.36,T_X-.24,T));}
 else{const f=liveW(T_X+.599),go=sm(T_IN+.3,C1.end,T,easeIO);X=lerp(f.X,CEL_AT[0]-1.1,go);Z=lerp(f.Z,CEL_AT[1]+.7,go);yaw=go>0?yawTo(CEL_AT[0]-f.X,CEL_AT[1]-f.Z):f.yaw;
  pose=blendPose(strike(.9,{foot:'r'}),stand(),sm(T_X+.6,T_X+1,T));if(go>0)pose=blendPose(pose,celebrate(T*1.1,{kind:'run'}),sm(T_IN+.3,T_IN+.7,T));}
 return{pose,yaw,X,Z};
};
const OTHERS:{p:Path;kick:number;cel:[number,number]}[]=[
 {p:{p:[P2P,P2P,[10.4,15.6],[12.2,15.2]],t:[0,T_A0+.2,T_B1,T_S1]},kick:T_A0,cel:[-1.6,1.4]},// P2: passes, then drifts up the far side
 {p:{p:[[F0[0]-.3,F0[1]+.3],F0,[8.2,8.4],[10.2,9.4]],t:[0,T_A1,T_B0+.8,T_S1]},kick:T_B0,cel:[-2.2,-.4]},// F: receives, switches it wide, steps up
];
const liveO=(i:number):Gen=>T=>{const o=OTHERS[i],m=mover(o.p,T,i+1),go=sm(T_IN+.3,C1.end,T,easeIO);
 let pose=m.pose;const kick=pulse(T,o.kick-.05,.3);if(kick>0)pose=blendPose(pose,KICK,Math.min(1,kick*2));
 const X=lerp(m.X,CEL_AT[0]+o.cel[0],go),Z=lerp(m.Z,CEL_AT[1]+o.cel[1],go);
 if(go>0)pose=blendPose(pose,celebrate(T*1.1+i*.3,{kind:'run'}),sm(T_IN+.3,T_IN+.7,T));
 const b=liveBall(T);return{pose,yaw:go>0?yawTo(CEL_AT[0]-m.X,CEL_AT[1]-m.Z):yawTo(b.X-m.X,b.Z-m.Z),X,Z};};
/** the Czech Republic (white, defend +X): 0 goes out to the wing player and blocks too late, 1 guards the near post, 2 is drawn to the ball
 *  and loses Gómez behind him, 3 presses the fixo. Heads drop after the goal. */
const CZE_P:Path[]=[
 {p:[[12.6,4.6],[13.6,3.8],[15.6,3.3],[16.4,3.4]],t:[0,T_B1,T_X-.2,T_X+.4]},
 {p:[[15.6,7.6],[16.2,7.4],[17.4,8.2],[17.6,8.4]],t:[0,T_B1,T_X+.4,T_S1]},
 {p:[[14.8,12.6],[15.4,12.2],[16.4,10.0],[16.8,9.8]],t:[0,T_B1,T_X+.6,T_S1+.2]},
 {p:[[9.6,10.4],[7.6,8.6],[9.4,7.4],[11.8,8.8]],t:[0,T_A1+.3,T_B0+.4,T_S1]},
];
const liveC=(i:number):Gen=>T=>{const m=mover(CZE_P[i],T,i+5),b=liveBall(T),post=sm(T_IN+.3,T_IN+1.3,T);let pose=m.pose;
 if(i===0){const lu=key(T,[[T_X-.35,0],[T_X,.62],[T_X+.6,1]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_X-.45,T_X-.3,T));}
 if(i===2&&T>T_S1-.2&&T<T_S2+.4)pose=blendPose(pose,posed({lHipF:30,rHipF:-10,lKnee:30,lean:16,lShA:40,rShA:40,rElb:40,lElb:40,neckP:10,neckY:50}),.6*sm(T_S1-.2,T_S1,T));
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20}),post);
 return{pose,yaw:post>0?lerp(yawTo(b.X-m.X,b.Z-m.Z),FACE_LEFT,post*.6):yawTo(b.X-m.X,b.Z-m.Z),X:m.X,Z:m.Z};};
const liveH:Gen=T=>({pose:keeperSet(T*1.2),yaw:FACE_RIGHT,X:-18.4+2*sm(T_B0,T_X,T,easeIO),Z:10+.3*Math.sin(T*.4)});
const liveCam=(T:number)=>({x:key(T,mono([[0,8.2],[T_A1,8.6],[T_B0,9.8],[C1.waits+.4,11.6],[T_B1,12.2],[T_X,14.6],[T_S1,16.4],[T_IN,16.6],[T_IN+1,15.8],[C1.end,15.0]]),easeInOutSine),
 zoom:key(T,mono([[0,.64],[T_B0,.68],[C1.waits+.4,.8],[T_X,.84],[T_S1,1.02],[T_IN+.4,1.0],[C1.end,.94]]),easeInOutSine),
 y:key(T,mono([[0,1400],[T_X,1370],[T_S1,1310],[T_IN+.4,1320],[C1.end,1390]]),easeInOutSine)});
/** the main-stand broadcast camera: 17 m outside the near touchline, 8 m up */
const bst=(camX:number):Stage=>({F:4200,eye:8,cx:camX,cz:-17});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_S1,.3)+pulse(Tc,T_S2,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.12,flash:pulse(T,T_IN,1.2),bulge:.45*sm(T_IN-.1,T_IN,T)*(1-.6*sm(T_IN+.2,T_IN+1.1,T))+.1*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:TGT2[2],by:TGT2[1],
  keeper:()=>{athlete(s,st,liveK,T,VAHALA,{detail:'low'});}});
 // "waits near the back post": a yellow dashed ring round him, then a red ring on the back-post spot
 const wr=easeOutBack(sm(C1.waits,C1.waits+.35,T))*(1-sm(T_RUN+.2,T_RUN+.6,T));
 if(wr>.02){const g=liveG(T);floorDashRing(s,st,Y,g.X,g.Z,1.2,Math.max(9,kAt(st,g.Z)*.09),101,wr);}
 const pr=easeOutBack(sm(C1.waits+.5,C1.waits+.85,T))*(1-sm(T_S1-.1,T_S1+.3,T));
 if(pr>.02)floorDashRing(s,st,R,M1[0],M1[1],.8,Math.max(9,kAt(st,M1[1])*.09),102,pr);
 type It={z:number;draw:()=>void};const items:It[]=[];
 CZE_P.forEach((_,i)=>{const g=liveC(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,CZE(i),{detail:'low'})});});
 OTHERS.forEach((_,i)=>{const g=liveO(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i),{detail:'low'})});});
 items.push({z:liveW(T).Z,draw:()=>athlete(s,st,liveW,T,ESP(2),{detail:'low'})});
 items.push({z:liveH(T).Z,draw:()=>athlete(s,st,liveH,T,HERRERO,{detail:'low'})});
 items.push({z:liveG(T).Z,draw:()=>athlete(s,st,liveG,T,GOMEZ,{smear:(T>T_RUN&&T<T_S1+.2)||(T>T_S2-.2&&T<T_S2+.25)?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const tr:Pt[]=[];if(b.flying||b.fast){const t0=b.fast?T_X:T>=T_S2?T_S2:T_S1;for(let k=0;k<=8;k++){const q=liveBall(Math.max(t0,T-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}}
  drawBall(s,st,IDX,b,18,{trail:tr,smear:b.flying?.5:0,dir:Math.PI*.02});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** a figure's chest on a stage (the passage enters his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09,xf:Xf=IDX):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=P3(st,xf,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,depthOf(xf,ch[0],ch[2])),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveG(tt),.12));},still:T_S1+.03};

// ================= chapter 2 — REPLAY: slow motion, low, from BEHIND the Czech goal: wait, run, meet the ball, saved, the rebound in =================
const C2={watch:A(1,'Watch'),waits:A(1,'He waits'),runs:A(1,'then runs'),meets:A(1,'meets the ball'),first:A(1,'First shot'),second:A(1,'second shot'),end:AUTH[1].seconds};
/** replay seconds → live seconds: ≈0.3–0.9× slow motion (never faster than real time) */
const repT=(t:number)=>key(t,[[0,T_RUN-1.6],[C2.waits,T_RUN-.9],[C2.runs,T_RUN],[C2.meets+.35,T_S1],[C2.first+.25,T_SAVE+.15],[C2.second+.2,T_S2],[C2.second+1.1,T_IN+.25],[C2.end,T_IN+.25+(C2.end-C2.second-1.1)*.45]],linear);
/** the camera behind the goal, shifted toward the back post */
const stR:Stage={F:1500,eye:2.8,cx:1.2,cz:-6.4};
const RO={xf:REV,inv:REV_INV};
const RB=(q:[number,number],h=.9):Pt=>{const[a,b]=REV(q[0],q[1]);return proj(stR,a,h,b);};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),T=repT(tt),Tcam=repT(t),hit=pulse(Tcam,T_S1,.4)+pulse(Tcam,T_S2,.4),net=pulse(Tcam,T_IN,.6);
  const fW=RB(WAIT),fM=RB(M1),fC=RB(C0);
  camPath(s,t,[[0,fW[0]-40,fW[1]-30,1.55],[C2.waits,fW[0]-60,fW[1]-30,1.7],[C2.runs,lerp(fW[0],fM[0],.4),lerp(fW[1],fM[1],.4)-20,1.25],[C2.meets,lerp(fM[0],fC[0],.25),fM[1]-30,1.02],[C2.first,fM[0]-40,fM[1]-10,1.3],[C2.second,fM[0]-120,fM[1],1.2],[C2.second+1,fM[0]-160,fM[1]+20,1.05],[C2.end,fM[0]-160,fM[1]+10,1.08]],
   [8*hit*Math.sin(t*90),5*hit*Math.cos(t*77)+5*net*Math.sin(t*60)]);
  const b=liveBall(T),goal=T>=T_IN;
  endCourt(s,stR,T,goal?1-.3*sm(C2.end-1,C2.end,tt):.1,pulse(T,T_IN,1.2));
  // "He waits": a yellow ring on his waiting spot; "then runs": his run as a red dashed arrow; "meets the ball": the ball's path as a
  // yellow dashed arrow and a red ring where the two paths meet
  const wg=easeOutBack(sm(C2.waits,C2.waits+.35,tt))*(1-sm(C2.first,C2.first+.5,tt));
  if(wg>.02)floorDashRing(s,stR,Y,WAIT[0],WAIT[1],.85,Math.max(5,kAt(stR,depthOf(REV,WAIT[0],WAIT[1]))*.05),201,wg,REV);
  const fade=1-sm(C2.second,C2.second+.6,tt);
  if(tt>=C2.runs-.1&&fade>.02){const u=sm(C2.runs-.1,C2.meets+.2,tt,easeOut),c:[number,number]=[lerp(WAIT[0],PLANT1[0],.62),lerp(WAIT[1],PLANT1[1],.3)],pts:Pt[]=[];
   for(let k=0;k<=12;k++){const v=k/12,a=(1-v)*(1-v),bb=2*v*(1-v),cc=v*v;pts.push([a*WAIT[0]+bb*c[0]+cc*M1[0],a*WAIT[1]+bb*c[1]+cc*M1[1]]);}
   const fl=floorLine(stR,REV,pts);if(u>.02){dashed(s,R,fl,9,202,{dash:30,progress:u,cov:fade});if(u>.95)arrowHead(s,R,fl,26,203,fade);}}
  if(tt>=C2.meets-.5&&fade>.02){const u=sm(C2.meets-.5,C2.meets+.1,tt,easeOut),pts:Pt[]=[];for(let k=0;k<=10;k++)pts.push(L2(C0,M1,k/10));
   const fl=floorLine(stR,REV,pts);if(u>.02){dashed(s,Y,fl,9,204,{dash:30,progress:u,cov:fade});if(u>.95)arrowHead(s,Y,fl,26,205,fade);}}
  const mg=easeOutBack(sm(C2.meets,C2.meets+.35,tt))*fade;
  if(mg>.02)floorDashRing(s,stR,R,M1[0],M1[1],.7,Math.max(6,kAt(stR,depthOf(REV,M1[0],M1[1]))*.06),206,mg,REV);
  const its:{z:number;draw:()=>void}[]=[];
  CZE_P.forEach((_,i)=>{const g=liveC(i),p=g(T);its.push({z:depthOf(REV,p.X,p.Z),draw:()=>athlete(s,stR,g,T,CZE(i),{...RO,detail:i===2?'mid':'low'})});});
  OTHERS.forEach((_,i)=>{const g=liveO(i),p=g(T);its.push({z:depthOf(REV,p.X,p.Z),draw:()=>athlete(s,stR,g,T,ESP(i),{...RO,detail:'low'})});});
  {const p=liveW(T);its.push({z:depthOf(REV,p.X,p.Z),draw:()=>athlete(s,stR,liveW,T,ESP(2),{...RO,detail:'mid'})});}
  const gp=liveG(T);its.push({z:depthOf(REV,gp.X,gp.Z),draw:()=>athlete(s,stR,liveG,T,GOMEZ,{...RO,detail:'high',smear:(T>T_RUN+.2&&T<T_S1+.25)||(T>T_S2-.25&&T<T_S2+.3)?.14:0})});
  const kp=liveK(T);its.push({z:depthOf(REV,kp.X,kp.Z),draw:()=>athlete(s,stR,liveK,T,VAHALA,{...RO,detail:'high'})});
  const bz=depthOf(REV,b.X,b.Z),drawB=()=>{const tr:Pt[]=[];if(b.flying||b.fast){const s0=b.fast?T_X:T>=T_S2?T_S2:T_S1;for(let k=0;k<=8;k++){const q=liveBall(Math.max(s0,T-.12+k*.015)),[a,z]=REV(q.X,q.Z);tr.push(proj(stR,a,q.Y,z));}}
   const o=drawBall(s,stR,REV,b,97,{min:10,trail:tr,smear:b.flying?.3:0,dir:Math.PI*.5});
   for(const ts of[T_S1,T_S2])if(T>=ts&&T<ts+.2)sparkBurst(s,Y,o.p[0],o.p[1],o.r*2.6,{n:10,seed:98,g:easeOut(sm(ts,ts+.15,T))});
   if(T>=T_SAVE&&T<T_SAVE+.3)sparkBurst(s,R,o.p[0],o.p[1],o.r*3,{n:9,seed:96,g:easeOut(sm(T_SAVE,T_SAVE+.2,T))});};
  if(bz>=0)its.push({z:bz+(b.flying?0:-.2),draw:drawB});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  nearPosts(s,stR);
  if(bz<0)drawB();
  const[bxr]=REV(TGT2[0],TGT2[2]);
  nearNet(s,stR,.35*sm(T_IN-.05,T_IN+.05,T)*(1-.6*sm(T_IN+.2,T_IN+1,T))+.08*settle(T,T_IN,{amp:1,freq:3,decay:3}),bxr,TGT2[1]);
  if(T>=T_IN&&T<T_IN+.5){const[a,z]=REV(TGT2[0],TGT2[2]),p=proj(stR,a,TGT2[1],z);sparkBurst(s,Y,p[0],p[1],150,{n:12,seed:99,g:easeOut(sm(T_IN,T_IN+.2,T))*(1-sm(T_IN+.3,T_IN+.5,T))});}
  // "second shot in": red/paper confetti from the far stands for the 2–0
  if(tt>=C2.second+.3){const u=sm(C2.second+.3,C2.second+3,tt,linear),top=proj(stR,0,5,WALL_R)[1];confetti(s,[R,Y,'paper'],[-700,top-160+u*300,1400,300],22,Math.floor(tt*6),{size:12});}
 },
 aperture(t0){const{tt}=clock(1,t0),T=repT(tt),b=liveBall(T),[a,z]=REV(b.X,b.Z),p=proj(stR,a,b.Y,z),r=Math.max(10,kAt(stR,z)*BALL_R)*1.1,q:Pt[]=[];for(let i=0;i<12;i++){const an=i/12*TAU;q.push([p[0]+Math.cos(an)*r,p[1]+Math.sin(an)*r]);}return aperture(q);},
 still:C2.meets+.3,
};

// ================= chapter 3 — YOUR TURN: three cards (wait, run, arrive); a drill: the ball rolled across, the timed run, both meet at the ring =================
const C3={turn:A(2,'Your turn'),wait:A(2,'Wait'),run:A(2,'then run'),arrive:A(2,'Arrive at'),same:A(2,'same time'),end:AUTH[2].seconds};
/** the drill (training kit, no keeper): the passer on the FAR wing rolls it across; Gómez waits wide of the near post (the back post for
 *  this ball, and nearest the camera), then runs; left-foot finish */
const PS:[number,number]=[15.4,16.4],M3:[number,number]=[18.2,8.1],W3:[number,number]=[14.0,4.2],T3G:V3=[GX+.05,.28,9.9];
const T3M=C3.same+.1,T3X=T3M-1.45,T3R=Math.min(C3.run+.2,T3M-1.7),T3IN=T3M+.28;
const YAW_3=yawTo(T3G[0]-M3[0],T3G[2]-M3[1]),PLANT3=plantFor(M3,YAW_3,'l'),S3:[number,number]=[PS[0]+.4,PS[1]-.5],YAW_P=yawTo(M3[0]-S3[0],M3[1]-S3[1]),PLANT_P=plantFor(S3,YAW_P);
const drillG:Gen=t=>{
 let X:number,Z:number,pose:Pose,yaw:number;
 if(t<T3R){X=W3[0]+.25*Math.sin(t*.9);Z=W3[1];yaw=yawTo(PS[0]-X,PS[1]-Z);pose=blendPose(stand(),backpedal(t*1.1),.45+.2*Math.sin(t*1.4));}
 else if(t<T3M+.6){const u=sm(T3R,T3M,t,(v:number)=>v*v*(1.5-.5*v)),c:[number,number]=[lerp(W3[0],PLANT3[0],.6),lerp(W3[1],PLANT3[1],.3)],a=(1-u)*(1-u),b=2*u*(1-u),cc=u*u;
  X=a*W3[0]+b*c[0]+cc*PLANT3[0];Z=a*W3[1]+b*c[1]+cc*PLANT3[1];yaw=lerp(yawTo(PLANT3[0]-W3[0],PLANT3[1]-W3[1]),YAW_3,sm(T3M-.35,T3M-.05,t,easeIO));
  pose=blendPose(runCycle((t-T3R)*runCadence(.8),{speed:.8}),strike(key(t,[[T3M-.32,.14],[T3M,STRIKE_CONTACT],[T3M+.6,.88]],linear),{foot:'l',power:.5}),sm(T3M-.34,T3M-.2,t));}
 else{const f=drillG(T3M+.599),u=sm(T3M+.6,T3M+1,t,easeIO);X=f.X;Z=f.Z;yaw=lerp(YAW_3,-2.4,u);pose=blendPose(strike(.88,{foot:'l'}),celebrate((t-T3M-.6)*1.2,{kind:'arms'}),u);}
 return{pose,yaw,X,Z};
};
const drillP:Gen=t=>{let pose=blendPose(stand(),backpedal(t),.3);const st=key(t,[[T3X-.35,.14],[T3X,STRIKE_CONTACT],[T3X+.6,.88]],linear);
 if(t>T3X-.4)pose=blendPose(pose,strike(st,{foot:'r',power:.4}),sm(T3X-.4,T3X-.28,t));if(t>T3X+.7)pose=blendPose(pose,celebrate((t-T3X-.7)*1.1,{kind:'arms'}),sm(T3M+.3,T3M+.7,t));
 return{pose,yaw:YAW_P,X:PLANT_P[0],Z:PLANT_P[1]};};
function drillBall(t:number):BallS{const s0=S3;
 if(t<T3X)return{X:s0[0],Y:BALL_R,Z:s0[1],flying:false,spin:0};
 if(t<T3M){const u=sm(T3X,T3M,t,linear);return{X:lerp(s0[0],M3[0],u),Y:BALL_R,Z:lerp(s0[1],M3[1],u),flying:false,fast:true,spin:u*9};}
 if(t<T3IN){const u=sm(T3M,T3IN,t,linear);return{X:lerp(M3[0],T3G[0],u),Y:lerp(BALL_R,T3G[1],u),Z:lerp(M3[1],T3G[2],u),flying:true,spin:10+u*20};}
 const d=sm(T3IN,T3IN+.3,t,easeOut);return{X:lerp(T3G[0],GX+.6,d),Y:lerp(T3G[1],BALL_R,sm(T3IN+.1,T3IN+.4,t)),Z:T3G[2],flying:false,spin:30};}
/** a low camera off the near touchline, level with the box: nearer and lower than the live shot */
const st3:Stage={F:1500,eye:2.3,cx:16.4,cz:-5.2};
const CARD_Y=870,CARD_W=190,CARDS:[number,number,'wait'|'run'|'arrive'][]=[[-420,C3.wait,'wait'],[0,C3.run,'run'],[420,C3.run+.4,'arrive']];
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  const gM=proj(st,M3[0],1,M3[1]),gW=proj(st,W3[0],1,W3[1]);
  const gP=proj(st,PS[0],1,PS[1]),mid:Pt=[lerp(gP[0],gM[0],.5),lerp(gP[1],gM[1],.5)];
  camPath(s,t,[[0,lerp(gW[0],gM[0],.5),gM[1]+60,1.25],[C3.wait-.3,mid[0],gM[1]+190,.9],[C3.arrive+.1,mid[0],gM[1]+190,.9],[C3.arrive+.7,mid[0],mid[1]-20,1.25],[C3.same,lerp(mid[0],gM[0],.6),lerp(mid[1],gM[1],.7),1.65],[C3.end,gM[0]-40,gM[1]+10,1.9]]);
  const b=drillBall(tt),goal=tt>=T3IN;
  courtSide(s,st,tt,{cheer:goal?.5:0,flash:pulse(tt,T3IN,1.2),bulge:.4*sm(T3IN-.1,T3IN,tt)*(1-.6*sm(T3IN+.2,T3IN+1,tt)),bz:T3G[2],by:T3G[1]});
  // "Arrive at": the ball's path (yellow) and his run (red) draw toward a ring at the back post; "same time": the ring stamps when both land
  const ar=sm(C3.arrive+.35,C3.arrive+1.1,tt,easeOut);
  if(ar>.02){const bp:Pt[]=[];for(let k=0;k<=10;k++)bp.push(L2(S3,M3,k/10));const fb=floorLine(st,IDX,bp);dashed(s,Y,fb,10,301,{dash:32,progress:ar});if(ar>.95)arrowHead(s,Y,fb,28,302);
   const c:[number,number]=[lerp(W3[0],PLANT3[0],.6),lerp(W3[1],PLANT3[1],.3)],rp:Pt[]=[];for(let k=0;k<=12;k++){const v=k/12,a=(1-v)*(1-v),bb=2*v*(1-v),cc=v*v;rp.push([a*W3[0]+bb*c[0]+cc*M3[0],a*W3[1]+bb*c[1]+cc*M3[1]]);}
   const fr=floorLine(st,IDX,rp);dashed(s,R,fr,10,303,{dash:32,progress:ar});if(ar>.95)arrowHead(s,R,fr,28,304);}
  const rg=easeOutBack(sm(C3.arrive+.4,C3.arrive+.75,tt))*(1+.25*pulse(tt,T3M,.5));
  if(rg>.02)floorDashRing(s,st,R,M3[0],M3[1],.7,Math.max(6,kAt(st,M3[1])*.06),305,rg);
  const items:{z:number;draw:()=>void}[]=[
   {z:drillP(tt).Z,draw:()=>athlete(s,st,drillP,tt,DRILL_P,{detail:'mid'})},
   {z:drillG(tt).Z+.001,draw:()=>athlete(s,st,drillG,tt,GOMEZ_T,{detail:'high',smear:(tt>T3R&&tt<T3M+.2)?.12:0})},
   {z:b.Z-.02,draw:()=>{const tr:Pt[]=[];if(b.fast)for(let k=0;k<=8;k++){const q=drillBall(Math.max(T3X,tt-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}drawBall(s,st,IDX,b,311,{trail:tr,smear:b.flying?.35:0,dir:0});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=T3M&&tt<T3M+.35){const p=proj(st,M3[0],BALL_R,M3[1]);sparkBurst(s,Y,p[0],p[1],110,{n:10,seed:312,g:easeOut(sm(T3M,T3M+.2,tt))*(1-sm(T3M+.2,T3M+.35,tt))});}
  // the three cards rise on "Wait", each prints one step with a small figure; they drop before "Arrive at"
  const rise=sm(C3.wait-.25,C3.wait+.3,tt,easeOut),drop=sm(C3.arrive+.15,C3.arrive+.55,tt,easeIn);
  if(rise>.01&&drop<1){const dy=(1-rise)*700+drop*900,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   const cx0=mid[0];
   CARDS.forEach(([dx],i)=>{const cx=cx0+dx,q=handCut([[cx-CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y+230+dy],[cx-CARD_W,CARD_Y+230+dy]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.16);
   CARDS.forEach(([dx,t0c,kind],i)=>{const on=sm(t0c,t0c+.3,tt,easeOutBack);if(on<=.01)return;const cx=cx0+dx,gy=CARD_Y+dy+175;
    const fc=figureCam({x:cx+10,y:gy,height:380*(.9+.1*on),azimuth:kind==='arrive'?20:-60,elevation:14,fov:16,at:[0,0,0]});
    s.save();s.clip(polyPath(outline[i],true));
    const Pc=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    const pose=kind==='wait'?blendPose(stand(),backpedal(.3),.5):kind==='run'?runCycle(.3,{speed:.9}):strike(STRIKE_CONTACT,{foot:'l'});
    // the step's diagram: wait = a yellow ring round his feet, run = a red dashed arrow ahead, arrive = the ball arriving at his boot + a red ring
    if(kind==='wait'){const c=Pc([0,0,0]);s.fill(Y,ribbon(blob(c[0],c[1],95,30,80,{n:18}),8,{seed:84,close:true,wobble:1}),1);}
    if(kind==='run'){const pts:Pt[]=[Pc([.3,0,0]),Pc([1.1,0,0]),Pc([1.9,0,0])];dashed(s,R,pts,8,85,{dash:22});arrowHead(s,R,pts,24,86);}
    if(kind==='arrive'){const sb=strikeBall(0,'l'),a0=Pc([sb[0],BALL_R,-sb[1]]);s.fill(R,ribbon(blob(a0[0],a0[1]+6,60,20,87,{n:18}),7,{seed:88,close:true,wobble:1}),.9);ball(s,a0[0],a0[1],16,81);}
    drawAthlete(s,pose,fc,{...GOMEZ_T,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "same time": a big tick stamps beside him, with a navy misregistered echo
  const tick=easeOutBack(sm(T3M+.1,T3M+.45,tt));
  if(tick>.02){const f=drillG(tt),g=proj(st,f.X,0,f.Z),h=kAt(st,f.Z)*1.8,c:Pt=[g[0]-h*.5,g[1]-h*.85],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:T3M+.05,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'raul-gomez-futsal-signature',format:'futsal',title:'Raúl Gómez’s back-post tap-in',theme:'Arrive at the back post at the same time as the ball.',
 ageNote:'For players aged 7–12: the 2021 World Cup goal is real (from the match reports); the drill at the end is practice. Try it with a friend rolling the ball across.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in from the side and lands in a red back-post ring that stamps; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.6),sw=easeOut(u),bx=x-r*2.4*(1-sw);
  s.fill(R,ribbon(blob(x,y+r*.9,r*(1.1+.5*u),r*(.32+.2*u),seed+1,{n:24}),6*(1-u)+2,{seed:seed+1,close:true,wobble:1.2}),1);
  if(u<1)s.fill(Y,ribbon([[bx-r*2,y+r*.2],[bx-r*.8,y+r*.1],[bx,y]],10*(1-u)+2,{seed,taper:.8,wobble:1}),1);
  s.fill(K,polyPath(blob(bx,y+r*.95,r,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:-(1-sw)*6});
 },
};
export default film;
