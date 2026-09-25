/** Edu — "the quick throw to start an attack": a signature-move riso film (iconic plays, FUTSAL; Edu is a goleiro).
 *
 * WHO: the card's Edu is the FUTSAL goalkeeper Edu Sousa — Eduardo Filipe Sousa Veiga (b. 19 Aug 1996, Mirandela, Portugal; 1.90 m), who
 *  moved to Eibar aged 12 and has played all his club futsal in SPAIN (Debabarrena, Zierbena, Osasuna Magna, Viña Albali Valdepeñas 2019–23,
 *  ElPozo Murcia 2023–): "played in Spain's top league" (lib/town/playerBios.json). He plays for PORTUGAL (from 2019). Not the Brazilian
 *  footballers called Edu, nor Azerbaijan's futsal Edu (Eduardo Mello Borges, an outfield scorer). NOTE for the lead: lib/town/
 *  playerAppearance.json gives him country "Spain" — his national team is Portugal (his CLUB is in Spain).
 * WHY THIS MOMENT: Edu's entry (lib/town/iconicPlays.json) is a signature — the quick throw to start an attack — not one match. No written
 *  source we could reach describes ONE dated Edu throw (UEFA's match pages are script shells; the reports we found name goals and penalties,
 *  not goalkeeper throws), so the film follows the brief's honest FALLBACK: the real-match chapter shows only confirmed things from a real,
 *  documented match whose champion squad Edu was part of, and the throw itself is a separate, clearly labelled demonstration ("This is how
 *  he does it", training bibs, an empty arena), never staged inside that match.
 *  1  LIVE (a HIGH END-ON camera on the gantry behind one goal — no other goleiro film uses it; real time): the 2022 Futsal Finalissima
 *     final, 18 Sep 2022, Estadio Mary Terán de Weiss (Parque Roca), Buenos Aires: Spain 1–1 Portugal after extra time, Portugal win the
 *     shoot-out 4–2. CONFIRMED THINGS ONLY: the arena, the centre-hung scoreboard (1–1; the shoot-out row fills to Spain 2 of 4, Portugal
 *     4 of 4), Portugal's players rushing together to celebrate, Edu among them. No goal, penalty, save or throw is staged; nobody is shown
 *     in goal, and where Edu stood during the shoot-out is never shown (he runs in from out of shot).
 *  2  HOW HE DOES IT (demonstration; LOW, at floor level just outside his right post, looking up the court; real time): a shot, Edu catches
 *     it at his chest, looks up, and throws overarm, fast and flat, to a free teammate on the far wing, who runs onto it — a counter.
 *  3  REPLAY of the demonstration (slow motion; SIDE-ON from the touchline on the free teammate's wing, the camera trucking along with the throw): one teammate is
 *     marked (navy ring + a defender tight on him), the other is free (red ring, Edu's red eye-line to him); the throw is flat and lands IN
 *     FRONT of him (red floor target), so he never stops running (speed lines); two red arrows v one navy defender: two against one.
 *  4  PRACTISE (lesson from the entry's `lesson`: "After a save, throw it fast to a free teammate to start a counter"; high behind the
 *     young keeper's goal, off to one side): a friend shoots, the keeper catches, spots the free friend (red ring), throws in front of him, a tick.
 * Sources (written; fetched once, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Edu Sousa" (raw, Sep 2026): Eduardo Filipe Sousa Veiga, born 19 Aug 1996 in Mirandela; goalkeeper, 1.90 m; clubs above;
 *    Portugal from 2019; "being part of the UEFA Euro 2022 and Finalissima champion squads"; honours: UEFA Futsal Euro 2022, Futsal
 *    Finalissima 2022; runner-up Futsal Euro 2026. — https://en.wikipedia.org/wiki/Edu_Sousa
 *  - Wikipedia, "2022 Futsal Finalissima" (raw): 15–18 Sep 2022, Estadio Mary Terán de Weiss, Buenos Aires; final 18 Sep 2022, 16:45,
 *    Spain 1–1 Portugal (a.e.t.; Mellado 19'11", Afonso Jesus 27'18"); penalties 2–4 (Spain: Lozano scored, Chino missed, Mellado scored,
 *    Raúl Campos missed; Portugal: Bruno Coelho, André Coelho, Pany Varela, Tomás Paçó all scored). — https://en.wikipedia.org/wiki/2022_Futsal_Finalissima
 *  - Wikipedia (es), "Finalissima de Futsal 2022" (raw): the same final; Spain's two misses marked "atajado" (saved) — WHICH Portugal
 *    keeper saved them is not stated, so no save is shown. — https://es.wikipedia.org/wiki/Finalissima_de_Futsal_2022
 *  - Mais Futebol, "Edu Sousa, o jovem guardião português que brilha no futsal espanhol" (27 Jul 2020, archived): moved to Eibar at 12;
 *    Valdepeñas reached the Spanish Cup and league finals in 2019–20 (lost to Barcelona and Inter Movistar), his first Portugal call-up,
 *    elected the Spanish league's best goalkeeper of the season. (Those finals' scores/dates are not in the article, so they are not used.)
 *    https://maisfutebol.iol.pt/mais-longe-e-mais-alto/valdepenas/edu-sousa-o-jovem-guardiao-portugues-que-brilha-no-futsal-espanhol
 *  - Wikipedia, "UEFA Futsal Euro 2026 final" (raw, cached): Edu (#1, ElPozo Murcia) on Portugal's bench — that final is already used by
 *    the Dídac Plana, Ricardo Mayor and Pauleta films, so it is not used here.
 * CONFIRMED: the match, date, venue, city, the 1–1 after extra time, the 4–2 shoot-out (Spain 2 of 4, Portugal 4 of 4), Portugal as
 *  champions, Edu in Portugal's champion squad; that he is a goalkeeper, 1.90 m, Portuguese, playing his club futsal in Spain; the futsal
 *  court (40×20 m, 3×2 m goals, 5 v 5). The film's teaching point (a fast throw after a save to a free teammate) is the card's own lesson.
 * INFERRED (never named in the narration): that Edu was on the court for the celebration (he was in the squad; whether he played in the final
 *  is unconfirmed, so he is never shown in goal or playing); kits — Portugal red shirts / green shorts / red socks, Spain in a white (paper)
 *  change kit with navy shorts, Edu in a yellow long-sleeved keeper top with no number; the crowd's colours; the centre-hung scoreboard's
 *  look (its 1–1 and 2–4 readings are confirmed); who ran where. Edu's throwing arm is unverified (the demonstration uses the right arm).
 *  Chapters 2–4 are teaching DEMONSTRATIONS of his signature with training bibs, not footage of a particular match. No video was reviewed.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the shot, the throw and the sprint). Our stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z.
 *  The demonstration is authored ONCE in "play space" (the chapter-2 stage: X across the court, Z up the court from Edu's goal line) and
 *  chapter 3 views the same play through a rotation (sideGen), so the throwing arm and the runners never mirror between angles.
 *  The throw is an authored overarm move (throwPose, release at THROW_REL) and the ball leaves the solved right hand at release.
 * Timing: cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through the cue
 *  anchors back onto the authored choreography.
 * Inks: yellow (Edu's keeper top, crowd, lights, ball trail), red (Portugal shirts, the red training bibs, teaching marks, posts), green
 *  (Portugal shorts, board trim), navy (key line, Spain shorts, the opponents' bibs, stands, "marked" marks). Wood court = yellow + red screens.
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; plate ops kept near the bible budget. Seeded randomness. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,runCycle,runCadence,stand,backpedal,keeperSet,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Every cue starts with a plain word (Kokoro splits contractions). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2022 Finalissima',text:'The 2022 futsal Finalissima, in Buenos Aires. Spain and Portugal draw one all. Penalties! Portugal win four to two, and goalkeeper Edu celebrates.',tail:2.2,
  cues:['The 2022','in Buenos','Spain and','draw one all','Penalties','Portugal win','four to two','goalkeeper Edu','celebrates'],heads:{'The 2022':'Finalissima 2022','draw one all':'1–1','four to two':'4–2 on penalties','celebrates':'Champions'}},
 {label:'How he does it',text:'This is how he does it. Edu catches the shot, looks up, and throws it fast to a teammate. Counter!',tail:2,
  cues:['This is how','Edu catches','looks up','throws it fast','to a teammate','Counter'],heads:{'This is how':'How he does it','Counter':'Counter!'}},
 {label:'Replay: find the free player',text:'Again, slowly. One teammate is marked, but this one is free. Edu throws it flat, in front of him, so he never stops running. Two against one!',tail:2,
  cues:['Again','One teammate','but this one','Edu throws','in front','never stops','Two against'],heads:{'Again':'Replay','One teammate':'Marked','but this one':'Free','in front':'In front of him','Two against':'2 v 1'}},
 {label:'Practise it',text:'Try it with a friend. After a save, throw it fast to a free teammate to start a counter!',tail:2.6,
  cues:['Try it','After a save','throw it fast','a free teammate','start a counter'],heads:{'After a save':'After a save','throw it fast':'Throw it fast','start a counter':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/edu-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/edu-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/edu-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('edu: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('edu: no cue '+w);return c.at;};
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
/** a dashed navy ring (the "marked" mark) */
function dashRing(s:Sheet,ink:string,c:Pt,rx:number,ry:number,w:number,seed:number,g:number){if(g<=.02)return;const q=blob(c[0],c[1],rx*g,ry*g,seed,{n:26,amp:.05});const p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.2)});s.knockout(p);s.fill(ink,p,.95);}
/** a red floor target: two rings and a dot, stamped where the throw lands */
function floorTarget(s:Sheet,st:Stage,X:number,Z:number,g:number,seed:number){if(g<=.02)return;const a=floorRing(st,X,Z,.9*g,26),b=floorRing(st,X,Z,.45*g,20);
 const p1=ribbon([...a,a[0]],Math.max(5,kAt(st,Z)*.1),{seed,close:true,wobble:.8}),p2=ribbon([...b,b[0]],Math.max(4,kAt(st,Z)*.08),{seed:seed+1,close:true,wobble:.8});
 s.knockout(p1);s.knockout(p2);s.fill(R,p1);s.fill(R,p2);s.fill(R,polyPath(floorRing(st,X,Z,.14*g,12),true));}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
const EBUILD={height:1.9,bulk:1.02};
/** Edu: 1.90 m (Wikipedia); a yellow long-sleeved keeper top, navy shorts, paper gloves, no number (kit inferred); short dark hair, stubble */
const EDU:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.84],[R,.24]],hair:K,line:K,trim:R,gloves:'paper',sleeves:'long',number:null,hairStyle:'short',build:EBUILD,seed:21};
/** Portugal: red shirts, green shorts, red socks (inferred) */
const POR=(n:number):AthleteStyle=>({shirt:R,shorts:G,socks:R,boots:K,skin:[[Y,.82],[R,.26]],hair:K,line:K,trim:G,hairStyle:n%3===2?'curly':n%4===1?'bald':'short',build:{height:1.72+hash(n,3)*.12},seed:40+n});
/** Spain: a white (paper) change kit, navy shorts (inferred) */
const ESP=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.82],[R,.24]],hair:K,line:K,trim:R,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:60+n});
/** the demonstration: Edu's team in red training bibs (no numbers), the opponents in navy-screen bibs — no team is claimed */
const MATE=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:K,boots:K,skin:[[Y,.84],[R,.22]],hair:K,line:K,trim:'paper',hairStyle:n?'curly':'short',build:{height:1.74+n*.04},seed:80+n});
const OPP=(n:number):AthleteStyle=>({shirt:[K,.45],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.28]],hair:K,line:K,trim:K,hairStyle:n===1?'bald':'short',build:{height:1.76+n*.03},seed:90+n});
const SBUILD={height:1.78};
/** the practice kids (chapter 4): a young keeper and two friends in plain training tops */
const KBUILD={height:1.46,bulk:.94};
const KID_GK:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.86],[R,.2]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',number:null,hairStyle:'curly',build:KBUILD,seed:111};
const KID=(n:number):AthleteStyle=>({shirt:n?R:'paper',shorts:K,socks:n?R:K,boots:K,skin:[[Y,.82],[R,.26]],hair:K,line:K,trim:K,hairStyle:n?'ponytail':'short',build:{height:1.42+n*.05,bulk:.92},seed:120+n});
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact (our floor coords, relative to the stance place) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT),SBUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}
/** a joint of a generator's pose, in our stage coords */
function jointAt(gen:Gen,t:number,build:{height?:number;bulk?:number},j:'lHa'|'rHa'|'chest'|'head'|'rToe'|'pelvis'):V3{const a=gen(t),sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw));return toMine(sk[j]);}
const handsMid=(gen:Gen,t:number,build:{height?:number;bulk?:number}):V3=>{const a=gen(t),sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),l=toMine(sk.lHa),r=toMine(sk.rHa),c=toMine(sk.chest);
 // the ball sits between the palms, a little in front of them (toward the chest-forward direction)
 const f:V3=[(l[0]+r[0])/2-c[0],0,(l[2]+r[2])/2-c[2]],fl=Math.hypot(f[0],f[2])||1;return[(l[0]+r[0])/2+f[0]/fl*.07,(l[1]+r[1])/2,(l[2]+r[2])/2+f[2]/fl*.07];};

// ---------------- the keeper's moves: a chest catch and an overarm throw (authored with the library's keyPoses) ----------------
/** chest catch: set → arms reach, palms open (.42 = the ball arrives) → the ball tucked into the chest (1) */
const CATCH_AT=.42;
function catchPose(c:number):Pose{return keyPoses(clamp(c),[
 [0,keeperSet(0)],
 [CATCH_AT,posed({lHipF:40,rHipF:40,lHipA:14,rHipA:14,lKnee:46,rKnee:46,lAnk:-4,rAnk:-4,lean:14,pitch:5,lShF:80,rShF:80,lShA:16,rShA:16,lElb:36,rElb:36,lShR:30,rShR:30,lHand:1,rHand:1,neckP:12})],
 [.7,posed({lHipF:34,rHipF:34,lHipA:12,rHipA:12,lKnee:44,rKnee:44,lean:24,pitch:4,lShF:56,rShF:56,lShA:12,rShA:12,lElb:100,rElb:100,lShR:40,rShR:40,lHand:.8,rHand:.8,neckP:24,squash:-.04})],
 [1,posed({lHipF:22,rHipF:22,lKnee:30,rKnee:30,lean:14,pitch:2,lShF:46,rShF:46,lShA:12,rShA:12,lElb:112,rElb:112,lShR:40,rShR:40,lHand:.7,rHand:.7,neckP:6})],
]);}
/** overarm throw with the RIGHT arm: hold (0) → step and cock the arm, the left arm points at the target (.3) → whip, RELEASE (.55)
 * → follow-through across the body (.78) → recover (1). */
const THROW_REL=.55;
function throwPose(t:number):Pose{return keyPoses(clamp(t),[
 [0,posed({lHipF:22,rHipF:22,lKnee:30,rKnee:30,lean:14,pitch:2,lShF:46,rShF:46,lShA:12,rShA:12,lElb:112,rElb:112,lShR:40,rShR:40,lHand:.7,rHand:.7,neckP:-6})],
 [.3,posed({yaw:-22,twist:-36,lean:-4,bend:-8,lHipF:34,lKnee:14,lAnk:-6,rHipF:-16,rKnee:34,rAnk:20,lShF:86,lShA:22,lElb:12,lHand:1,rShF:-8,rShA:100,rElb:98,rShR:78,rHand:.8,neckY:32,neckP:-8,dx:-.08,squash:-.04})],
 [THROW_REL,posed({yaw:8,twist:24,lean:18,lHipF:42,lKnee:26,rHipF:-26,rKnee:36,rAnk:40,lShF:-14,lShA:34,lElb:70,rShF:158,rShA:32,rElb:14,rShR:20,rHand:1,neckY:0,neckP:6,dx:.2,squash:.05})],
 [.78,posed({yaw:18,twist:30,lean:34,lHipF:46,lKnee:38,rHipF:-2,rKnee:70,rAnk:40,lShF:-30,lShA:30,lElb:60,rShF:52,rShA:18,rElb:24,neckP:14,dx:.38})],
 [1,posed({yaw:10,twist:10,lean:16,lHipF:24,lKnee:28,rHipF:18,rKnee:34,lShA:24,rShA:24,lElb:40,rElb:40,neckP:4,dx:.46})],
]);}

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
function ballOn(s:Sheet,st:Stage,b:Ball3,seed:number,o:{min?:number;smear?:number;dir?:number;trail?:(u:number)=>Ball3;t0?:number;t?:number;map?:(b:Ball3)=>Ball3}={}){
 const M=o.map??((q:Ball3)=>q),bb=M(b),p=proj(st,bb.X,bb.Y,bb.Z),g=proj(st,bb.X,0,bb.Z),r=Math.max(o.min??9,kAt(st,bb.Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,bb.flying?.25:.45);
 if(bb.flying&&o.trail&&o.t!==undefined&&o.t0!==undefined){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=M(o.trail(Math.max(o.t0,o.t-.18+k*.0225)));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.4,{seed:seed+7,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
 let dir=o.dir??0;if(bb.flying&&o.trail&&o.t!==undefined){const q=M(o.trail(o.t-.05)),pq=proj(st,q.X,q.Y,q.Z);if(Math.hypot(p[0]-pq[0],p[1]-pq[1])>1)dir=Math.atan2(p[1]-pq[1],p[0]-pq[0]);}
 ball(s,p[0],p[1],r,seed,{rot:bb.spin,smear:bb.flying?(o.smear??.45):0,dir});return{p,r};
}

// ---------------- the arena: wood court, crowd, lights ----------------
/** stepped navy rows, lit faces; a mixed crowd (yellow, red and some green shirts); cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,empty=false){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 if(empty){s.fill(Y,rectPath(-span,top-15*rowH-kw*.6,span*2,kw*.5),.35);return;}
 const heads=new Path2D(),yel=new Path2D(),red=new Path2D(),grn=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.28)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)red.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.5)grn.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,red,.85);s.fill(G,grn);
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

// ---- END-ON court (camera looks along +Z): goals at Z = gz with posts X = ±1.5 ----
/** a goal whose net goes AWAY from the camera (the far goal) */
function endGoalNet(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,gz+lerp(.95,.55,Yh/H));
 const out=[proj(st,Lx,0,gz),proj(st,Lx,H,gz),proj(st,Rx,H,gz),proj(st,Rx,0,gz),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,gz)*.018),.6);
}
/** a goal whose net comes TOWARD the camera (the keeper's own goal, seen from behind / beside it): back and side panels of mesh */
function nearGoalNet(s:Sheet,st:Stage,gz:number){
 const H=2,D=.9,Lx=-1.5,Rx=1.5,mesh=new Path2D(),bk=(X:number,Yh:number):Pt=>proj(st,X,Yh,gz-lerp(D,.5,Yh/H));
  for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=bk(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=bk(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=bk(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=bk(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const X of[Lx,Rx])for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=proj(st,X,Yh,gz),b=bk(X,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,gz)*.014),.5);
}
function endPosts(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,gz);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,gz)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
/** the court seen end-on: wood floor, paper lines (goal lines + D at each gz, halfway line + circle), boards + stands at wallZ */
function endArena(s:Sheet,st:Stage,o:{t:number;wallZ:number;goals:number[];half?:number;cheer?:number;flash?:number;empty?:boolean;scoreboard?:(top:number,kw:number)=>void}){
 const{t,wallZ,goals,half,cheer=0,flash=0,empty=false}=o,wall=proj(st,0,0,wallZ)[1],kw=kAt(st,wallZ);
 woodFloor(s,st,wall,'z',st.cz+.4,wallZ);
 const out=new Path2D();out.addPath(polyPath(floorQuad(st,-40,-40,-10,wallZ),true));out.addPath(polyPath(floorQuad(st,10,-40,40,wallZ),true));s.fill(K,out,.3);
 const lines=new Path2D(),zEnd=Math.min(wallZ-1,40);
 lines.addPath(polyPath(floorStrip(st,[[-10,st.cz+.5],[-10,zEnd]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,st.cz+.5],[10,zEnd]],.05),true));
 for(const gz of goals){const arcPts:Pt[]=[],d=gz>20?-1:1;// the D opens toward the play
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),gz+d*6*Math.sin(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),gz+d*6*Math.sin(a)]);}
  if(gz>st.cz+.5)lines.addPath(polyPath(floorStrip(st,[[-10,gz],[10,gz]],.05),true));const vis=arcPts.filter(p=>p[1]>st.cz+.5);if(vis.length>1)lines.addPath(polyPath(floorStrip(st,vis,.05),true));
  for(const m of[6,10]){const z=gz+d*m;if(z>st.cz+.5)lines.addPath(polyPath(floorRing(st,0,z,.12,12),true));}}
 if(half!==undefined){const cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,half+Math.sin(a)*3]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,half],[10,half]],.05),true));lines.addPath(polyPath(floorStrip(st,cc,.05),true));}
 s.knockout(lines,.94);
 const top=boards(s,st,wall,kw,2.4);stands(s,top,kw,t,cheer,flash,st.cx,empty);o.scoreboard?.(top,kw);
}

// ---- SIDE-ON court (camera outside the near touchline, looking across): X along the court (goals at X = ±20), Z across (0 near → 20 far) ----
const TOUCH_FAR=20,BOARDS=21.2;
function sideCourt(s:Sheet,st:Stage,t:number,o:{empty?:boolean;flash?:number}={}){
 const wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 woodFloor(s,st,wall,'x',0,BOARDS);
 s.fill(K,polyPath(floorQuad(st,-40,-3,40,0),true),.3);
 const lines=new Path2D();
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[-20,0],[-20,TOUCH_FAR]],[[20,0],[20,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 for(const gx of[-20,20]){const d=gx<0?1:-1,arc:Pt[]=[];
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([gx+d*6*Math.sin(a),8.5-6*Math.cos(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([gx+d*6*Math.sin(a),11.5+6*Math.cos(a)]);}
  lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const m of[6,10])lines.addPath(polyPath(floorRing(st,gx+d*m,10,.12,12),true));}
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 const top=boards(s,st,wall,kw,3);stands(s,top,kw,t,0,o.flash??0,st.cx,o.empty);
}
/** a side-on goal at X = gx (net going outward, away from the court) */
function sideGoal(s:Sheet,st:Stage,gx:number){
 const H=2,dir=gx<0?-1:1,back=(Z:number,Yh:number):Pt=>proj(st,gx+dir*lerp(.95,.55,Yh/H),Yh,Z);
 const hull=[proj(st,gx,0,8.5),proj(st,gx,H,8.5),proj(st,gx,H,11.5),back(11.5,H),back(11.5,0),back(8.5,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=8.5;Z<=11.5+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(8.5,Yh);mesh.moveTo(a[0],a[1]);for(let Z=8.8;Z<=11.5+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage,gx:number){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,gx+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(11.5);post(8.5);
 const Bb=(Z:number,dy:number):Pt=>proj(st,gx,H+dy,Z);quad([Bb(8.5,-w),Bb(11.5,-w),Bb(11.5,w),Bb(8.5,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(8.5,11.5,k/12),z1=lerp(8.5,11.5,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ================= chapter 1 — LIVE: the 2022 Finalissima final (confirmed things only), from the high end-on gantry =================
const C1={y22:A(0,'The 2022'),ba:A(0,'in Buenos'),sp:A(0,'Spain and'),draw:A(0,'draw one'),pens:A(0,'Penalties'),win:A(0,'Portugal win'),four:A(0,'four to'),gk:A(0,'goalkeeper'),cel:A(0,'celebrates'),end:AUTH[0].seconds};
/** the gantry: 5.5 m up, 6 m behind the near goal line, looking along the court (the far goal at Z = 40, halfway at Z = 20) */
const st1:Stage={F:1500,eye:5.5,cx:0,cz:-6};
/** the huddle Portugal form after the shoot-out (inferred: centre of our half); Edu comes in from out of shot, lands at its front */
const HUD:[number,number]=[0,12];
const POR0:[number,number][]=[[-5.5,20.6],[-2.6,20.4],[.4,20.6],[3.2,20.4],[6,20.6],[8.4,21.4],[-8.2,21.2]];
const PORG:[number,number][]=[[-1.3,.6],[.1,1.3],[1.4,.5],[-2,-.2],[2.1,-.4],[.9,2.2],[-.8,2.3]];
const E0:[number,number]=[-11.5,14.6],EG:[number,number]=[HUD[0]+.1,HUD[1]-1.5];
const T_RUN=C1.win+.15;
/** Portugal (red): from out near the halfway line they sprint in on "Portugal win", jump together on "celebrates" */
const liveP=(i:number):Gen=>T=>{const[x0,z0]=POR0[i],[gx,gz]=PORG[i],t0=T_RUN+i*.07,arr=C1.four+.5+i*.08,go=sm(t0,arr,T,easeIO);
 const X=lerp(x0,HUD[0]+gx,go),Z=lerp(z0,HUD[1]+gz,go);
 let pose=blendPose(stand(),runCycle(T*runCadence(.2)+i*.3,{speed:.2}),.25);
 if(T>=t0)pose=blendPose(pose,celebrate((T-t0)*1.5+i*.13,{kind:'run'}),sm(t0,t0+.25,T)*(1-sm(arr-.2,arr+.1,T)));
 if(T>=arr-.2)pose=blendPose(pose,celebrate((T-arr)*1.15+i*.17,{kind:'arms'}),sm(arr-.2,arr+.15,T));
 const yaw=T<t0?FACE_CAMERA:go<.97?yawTo(HUD[0]+gx-x0,HUD[1]+gz-z0):yawTo(-gx,-gz);
 return{pose,yaw,X,Z};};
/** Edu: runs in from the left (out of shot at first), arms up, jumps with them — ringed on "goalkeeper Edu" */
const liveE:Gen=T=>{const t0=T_RUN+.1,arr=C1.gk+.1,go=sm(t0,arr,T,easeIO),X=lerp(E0[0],EG[0],go),Z=lerp(E0[1],EG[1],go);
 let pose=runCycle(T*runCadence(.3),{speed:.3});if(T>=t0)pose=blendPose(pose,celebrate((T-t0)*1.5,{kind:'run'}),sm(t0,t0+.25,T)*(1-sm(arr-.2,arr+.1,T)));
 if(T>=arr-.2)pose=blendPose(pose,celebrate((T-arr)*1.15,{kind:'arms'}),sm(arr-.2,arr+.15,T));
 return{pose,yaw:go<.97?yawTo(EG[0]-E0[0],EG[1]-E0[1]):FACE_CAMERA+.25,X,Z};};
/** Spain (white): standing near the halfway line; on "Portugal win" hands go to heads, one crouches */
const ESP0:[number,number][]=[[-4,22.8],[-1.2,23.4],[1.8,22.9],[4.6,23.3],[7,23.9]];
const DROP:Pose=posed({lHipF:58,rHipF:58,lKnee:70,rKnee:70,lean:44,neckP:40,lShF:40,rShF:40,lElb:20,rElb:20,lShA:10,rShA:10});
const HEADS:Pose=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:10,neckP:34,lShF:150,rShF:150,lShA:40,rShA:40,lElb:150,rElb:150});
const liveS=(i:number):Gen=>T=>{const[x0,z0]=ESP0[i],d=sm(C1.win+.1,C1.win+.9,T);
 const pose=blendPose(blendPose(stand(),runCycle(T*runCadence(.1)+i*.4,{speed:.1}),.2),i===2?DROP:HEADS,d);
 return{pose,yaw:FACE_CAMERA+(i-2)*.25+(i===2?0:.8*d*(i%2?1:-1)),X:x0,Z:z0};};
/** the centre-hung scoreboard (no text): 1–1 (one navy pip for Spain, one red for Portugal); on "Penalties" the shoot-out row fills —
 * Spain ● ○ ● ○ (2 of 4), Portugal ● ● ● ● (4 of 4, the last on "Portugal win") */
function scoreboard(s:Sheet,T:number){
 const st=st1,c=proj(st,0,8.6,22),kk=kAt(st,22),w=8.4*kk,h=3.4*kk,x=c[0],y=c[1];
 const cable=new Path2D();cable.rect(x-w*.3,y-h*2.2,4,h*1.7);cable.rect(x+w*.3,y-h*2.2,4,h*1.7);s.fill(K,cable,.8);
 const pn=polyPath([[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2],[x-w/2,y+h/2]],true);s.knockout(pn);s.fill(K,pn,.94);
 s.fill(G,rectPath(x-w/2,y+h/2-h*.08,w,h*.08));
 const tie=pulse(T,C1.draw,1.3),pip=(px:number,py:number,r:number,ink:string,full:boolean)=>{s.knockout(circlePath(px,py,r*1.3));if(ink==='paper'){s.fill(Y,circlePath(px,py,r*1.3),.35);if(full)s.knockout(circlePath(px,py,r));else s.fill(K,circlePath(px,py,r*.9),.6);}else if(full)s.fill(ink,circlePath(px,py,r));else s.fill(ink,ribbon(blob(px,py,r*.8,r*.8,7,{n:16,amp:.02}),r*.3,{seed:5,close:true}),.9);};
 // the 1–1: one pip a side, a yellow dash between
 const r1=h*.13*(1+.3*tie);pip(x-w*.22,y-h*.18,r1,'paper',true);pip(x+w*.22,y-h*.18,r1,R,true);s.fill(Y,rectPath(x-w*.05,y-h*.23,w*.1,h*.06),.8);
 // the shoot-out row
 const pens=sm(C1.pens,C1.pens+.3,T,easeOut);if(pens>.02){const r2=h*.1*(1+.25*pulse(T,C1.four,1.1));
  const esp=[true,false,true,false];for(let k=0;k<4;k++){const on=T>C1.pens+.25+k*.34;if(on)pip(x-w*.44+k*w*.085,y+h*.2,r2,'paper',esp[k]);}
  for(let k=0;k<4;k++){const at=k<3?C1.pens+.42+k*.34:C1.win;if(T>at){const p=pulse(T,at,.6);pip(x+w*.19+k*w*.085,y+h*.2,r2*(1+.5*p),R,true);}}}
 const win=pulse(T,C1.win,1.2);if(win>.02)sparkBurst(s,Y,x+w*.32,y,w*.5,{n:12,seed:151,g:easeOut(sm(C1.win,C1.win+.3,T))*(1-sm(C1.win+.7,C1.win+1.2,T))});
}
/** the gantry camera: starts tilted up on the scoreboard and the crowd, tilts down and pushes in on the huddle on "Portugal win" */
const liveCam=(T:number)=>({x:key(T,mono([[0,0],[C1.win,0],[C1.gk,-20],[C1.end,-10]]),easeInOutSine),
 y:key(T,mono([[0,-120],[C1.ba,-140],[C1.pens,-100],[C1.win,-40],[C1.four+.3,330],[C1.gk,380],[C1.end,390]]),easeInOutSine),
 zoom:key(T,mono([[0,1.1],[C1.ba,1.14],[C1.pens,1.3],[C1.win,1.28],[C1.four+.3,1.6],[C1.gk,1.9],[C1.cel,1.95],[C1.end,1.92]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=st1;cam(s,c.x,c.y,c.zoom);
 const joy=sm(C1.win,C1.win+.4,T);
 endArena(s,st,{t:T,wallZ:41.5,goals:[40],half:20,cheer:.15+.6*joy+.3*pulse(T,C1.cel,1.5),flash:pulse(T,C1.win,1)+.8*pulse(T,C1.cel,1.3)+.5*pulse(T,C1.ba,1)});
 endGoalNet(s,st,40);endPosts(s,st,40);
 type It={z:number;draw:()=>void};const items:It[]=[];
 ESP0.forEach((_,i)=>{const g=liveS(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i),{detail:'low'})});});
 POR0.forEach((_,i)=>{const g=liveP(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,POR(i),{detail:T>C1.gk?'auto':'low'})});});
 items.push({z:liveE(T).Z,draw:()=>{const e=liveE(T),g=proj(st,e.X,0,e.Z),h=1.9*kAt(st,e.Z);athlete(s,st,liveE,T,EDU,{detail:T>C1.gk?'auto':'low'});
  // "goalkeeper Edu": a red ring picks him out
  ring2(s,R,[g[0],g[1]-h*.5],h*.44,h*.64,7,121,easeOutBack(sm(C1.gk,C1.gk+.4,T))*(1-sm(C1.end-.9,C1.end-.4,T)),1);}});
 items.sort((a,b)=>b.z-a.z).forEach(it=>it.draw());
 scoreboard(s,T);
 if(T>C1.cel){const g=proj(st,HUD[0],2.6,HUD[1]);sparkBurst(s,Y,g[0],g[1],260,{n:14,seed:171,g:easeOut(sm(C1.cel,C1.cel+.35,T))*(1-sm(C1.cel+.8,C1.cel+1.4,T))});}
}
/** a circle of points round a joint of a figure (the passage aperture) */
function jointDisc(st:Stage,gen:Gen,t:number,build:{height?:number;bulk?:number},r:number,j:'chest'|'head'='chest'):Pt[]{const p3=jointAt(gen,t,build,j),p=proj(st,p3[0],p3[1]-.04,p3[2]),rad=r*kAt(st,p3[2]),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt}=clock(0,t);return aperture(jointDisc(st1,liveE,tt,EBUILD,.2));},still:C1.gk+.5};

// ================= the demonstration play, authored once in PLAY SPACE (= the chapter-2 stage): X across the court, Z up the court from =================
// ================= Edu's goal line (Z = 0, posts X = ±1.5). Play time p is in seconds of real time. ====================================================
const P_SHOT=.9,P_CATCH=1.24,P_LOOK=1.62,P_WIND=1.92,THROW_DUR=.86,P_REL=P_WIND+THROW_REL*THROW_DUR,P_LAND=P_REL+.98,P_CTRL=P_LAND+.2,P_END=6.2;
const EDU_AT:[number,number]=[0,1.25];
/** the free teammate B on the far (left) wing; the marked teammate A with defender D1 tight on him; the last defender D2; the shooter S */
const bX=(p:number)=>key(p,[[0,-7.2],[P_CTRL,-6.9],[P_END,-4.8]],linear),bZ=(p:number)=>key(p,[[0,9.2],[P_CATCH,9.3],[P_REL,11.4],[P_CTRL,18.9],[P_END,34]],linear);
const LAND:V3=[-6.95,BALL_R,bZ(P_LAND)+1.05];
/** throw direction: from Edu toward the landing point */
const THROW_YAW=yawTo(LAND[0]-EDU_AT[0],LAND[2]-EDU_AT[1]);
const eduGen:Gen=p=>{let pose=keeperSet(p*1.3),yaw=FACE_AWAY;
 if(p>P_CATCH-.34){const c=(p-(P_CATCH-.34))/(.34/CATCH_AT);pose=catchPose(c);}
 // "looks up": head up and toward the free teammate
 if(p>P_CATCH+.2&&p<P_WIND+.1){const u=sm(P_CATCH+.2,P_LOOK,p);pose={...pose,neckP:pose.neckP-.5*u,neckY:.55*u};}
 if(p>=P_WIND){const t=(p-P_WIND)/THROW_DUR;pose=blendPose(pose,throwPose(t),sm(P_WIND,P_WIND+.08,p));yaw=lerp(FACE_AWAY,THROW_YAW,sm(P_WIND-.2,P_WIND+.15,p));}
 let X=EDU_AT[0],Z=EDU_AT[1];
 // after the throw he steps up out of his goal, watching the counter
 if(p>P_WIND+THROW_DUR){const u=p-(P_WIND+THROW_DUR),w=sm(0,.4,u);pose=blendPose(throwPose(1),runCycle(u*runCadence(.25),{speed:.25}),w*(1-sm(1.6,2.2,u)));if(u>1.6)pose=blendPose(pose,stand(),sm(1.6,2.2,u));
  const d=.46+1.6*sm(0,2.2,u,easeOut);X+=Math.cos(THROW_YAW)*d;Z+=Math.sin(THROW_YAW)*d;yaw=lerp(THROW_YAW,FACE_AWAY,sm(0,1.2,u));pose={...pose,dx:0};}
 return{pose,yaw,X,Z};};
/** the shooter (navy bib): approach, right-foot shot at P_SHOT, then stands watching; turns and jogs back after the throw */
const S_AT:[number,number]=[-2.3,7.9],S_YAW=yawTo(EDU_AT[0]+.1-S_AT[0],EDU_AT[1]+.3-S_AT[1])+.12;
const SB=strikeBall(S_YAW),S_PL:[number,number]=[S_AT[0]-SB[0],S_AT[1]-SB[2]];
const sT=(p:number)=>key(p,[[0,.02],[P_SHOT-.4,.26],[P_SHOT,STRIKE_CONTACT],[P_SHOT+.6,1]],linear);
const shooterGen:Gen=p=>{let pose=strike(sT(p)),yaw=S_YAW,X=S_PL[0],Z=S_PL[1];
 if(p<.3)pose=blendPose(runCycle(p*runCadence(.3),{speed:.3}),pose,sm(0,.3,p));
 X+=key(p,[[0,-.5],[P_SHOT-.4,0,easeOut]]);Z+=key(p,[[0,-1],[P_SHOT-.4,0,easeOut]]);
 if(p>P_REL){const u=p-P_REL;pose=blendPose(pose,runCycle(u*runCadence(.35),{speed:.35}),sm(0,.5,u));yaw=lerp(S_YAW,FACE_AWAY,sm(0,.6,u));Z+=2.1*Math.max(0,u-.3);X-=.3*Math.max(0,u-.3);}
 return{pose,yaw,X,Z};};
const A0:[number,number]=[3,11.2];
const mateA:Gen=p=>{const go=p>P_REL-.1,u=p-(P_REL-.1);let pose=blendPose(stand(),runCycle(p*runCadence(.15),{speed:.15}),.35),yaw=FACE_CAMERA+.2,X=A0[0],Z=A0[1];
 if(go){pose=blendPose(pose,runCycle(u*runCadence(.9)+.2,{speed:.9}),sm(0,.3,u));yaw=lerp(FACE_CAMERA+.2,FACE_AWAY-.12,sm(0,.35,u));Z+=key(u,[[0,0],[.5,.9],[P_END,5.4*(P_END-.6)]],linear);X-=.12*Math.max(0,u-.3);}
 return{pose,yaw,X,Z};};
const D1gen:Gen=p=>{const u=p-(P_REL+.15);let pose=blendPose(backpedal(p*1.6),stand(),.3),yaw=FACE_AWAY,X=A0[0]+.35,Z=A0[1]-.75+.08*Math.sin(p*3);
 if(u>0){pose=blendPose(pose,runCycle(u*runCadence(.75),{speed:.75}),sm(0,.35,u));Z+=key(u,[[0,0],[.6,.6],[P_END,4.6*(P_END-.9)]],linear);X-=.1*u;}
 return{pose,yaw,X,Z};};
const bGen:Gen=p=>{let pose=blendPose(stand(),runCycle(p*runCadence(.2),{speed:.2}),.5),yaw=FACE_CAMERA+.5;
 if(p>P_CATCH-.05){const u=p-(P_CATCH-.05);pose=blendPose(pose,runCycle(u*runCadence(.9),{speed:.92}),sm(0,.3,u));yaw=lerp(FACE_CAMERA+.5,FACE_AWAY+.05,sm(0,.35,u));}
 return{pose,yaw,X:bX(p),Z:bZ(p)};};
const D2gen:Gen=p=>{const X=key(p,[[0,.4],[P_LAND,-2.2],[P_END,-3.4]],easeIO),Z=key(p,[[0,24.2],[P_LAND,24.6],[P_END,30.5]],easeIO);
 return{pose:backpedal(p*2.2),yaw:yawTo(bX(p)-X,bZ(p)-Z),X,Z};};
/** the ball, play space */
function playBall(p:number):Ball3{
 const sb:V3=[S_AT[0],BALL_R,S_AT[1]];
 if(p<P_SHOT){const u=sm(0,P_SHOT-.3,p,easeOut);return{X:lerp(sb[0]-.5,sb[0],u),Y:BALL_R,Z:lerp(sb[2]-1,sb[2],u),flying:false,spin:u*5};}
 const catchAt=handsMid(eduGen,P_CATCH,EBUILD);
 if(p<P_CATCH){const u=sm(P_SHOT,P_CATCH,p,linear),q=bez(sb,[lerp(sb[0],catchAt[0],.5),catchAt[1]*.8+.25,lerp(sb[2],catchAt[2],.5)],catchAt,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:u*8};}
 const relAt=P_REL,wind=P_WIND+.2*THROW_DUR;
 if(p<relAt){const hm=handsMid(eduGen,p,EBUILD),rh=jointAt(eduGen,p,EBUILD,'rHa'),w=sm(P_WIND,wind,p);return{X:lerp(hm[0],rh[0],w),Y:lerp(hm[1],rh[1]+.06,w),Z:lerp(hm[2],rh[2],w),flying:false,spin:0};}
 const rel=jointAt(eduGen,relAt,EBUILD,'rHa');rel[1]+=.06;
 if(p<P_LAND){const u=sm(relAt,P_LAND,p,linear),q=bez(rel,[lerp(rel[0],LAND[0],.5),Math.max(rel[1],1.55)+.35,lerp(rel[2],LAND[2],.5)],LAND,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:u*14};}
 // a low skip off the floor into B's stride, then at his feet as he runs
 if(p<P_CTRL){const u=sm(P_LAND,P_CTRL,p,linear);return{X:lerp(LAND[0],bX(P_CTRL)+.15,u),Y:BALL_R+.18*Math.sin(Math.PI*u),Z:lerp(LAND[2],bZ(P_CTRL)+.55,u),flying:true,spin:14+u*3};}
 const lead=.55+.2*Math.abs(Math.sin((p-P_CTRL)*4.5));return{X:bX(p)+.15,Y:BALL_R,Z:bZ(p)+lead,flying:false,spin:(p-P_CTRL)*18};
}

// ================= chapter 2 — HOW HE DOES IT: LOW IN THE CORNER behind Edu's goal line, looking diagonally up the court (real time) =================
const C2={how:A(1,'This is'),catches:A(1,'Edu catches'),looks:A(1,'looks up'),throws:A(1,'throws it'),mate:A(1,'to a'),counter:A(1,'Counter'),end:AUTH[1].seconds};
/** chapter clock → play time: the catch on "Edu catches", the release just after "throws it fast", the landing on "to a teammate" */
const p2=(t:number)=>key(t,mono([[0,0],[C2.catches,P_CATCH],[C2.looks,P_LOOK],[C2.throws+.25,P_REL],[C2.mate+.25,P_LAND],[C2.end,P_LAND+(C2.end-C2.mate-.25)*1.05]]),linear);
/** the corner camera: stands at play (6.5, −2.5) — beside and behind Edu's goal — aimed at play (−1.5, 7). Play space → this stage is a
 * pure rotation (right = (fz, −fx), forward = (fx, fz)), so the throwing arm and the runners keep their sides. */
const CC:[number,number]=[6.5,-2.5],CF:[number,number]=(()=>{const d=[-1.5-CC[0],7-CC[1]],l=Math.hypot(d[0],d[1]);return[d[0]/l,d[1]/l] as [number,number];})();
const rot2=(X:number,Z:number):[number,number]=>{const x=X-CC[0],z=Z-CC[1];return[x*CF[1]-z*CF[0],x*CF[0]+z*CF[1]];};
const rot2Yaw=(y:number)=>{const c=Math.cos(y),s=Math.sin(y);return Math.atan2(c*CF[0]+s*CF[1],c*CF[1]-s*CF[0]);};
const cornerGen=(g:Gen):Gen=>t=>{const a=g(t),q=rot2(a.X,a.Z);return{pose:a.pose,yaw:rot2Yaw(a.yaw),X:q[0],Z:q[1]};};
const cornerBall=(b:Ball3):Ball3=>{const q=rot2(b.X,b.Z);return{...b,X:q[0],Z:q[1]};};
const st2:Stage={F:1300,eye:2.6,cx:0,cz:0};
/** a play-space floor polyline → stage points, dropping what is behind the camera */
function playLine(st:Stage,pts:Pt[],n=24):Pt[][]{const out:Pt[][]=[];let cur:Pt[]=[];for(let i=0;i<pts.length-1;i++)for(let k=0;k<n;k++){const u=k/n,q=rot2(lerp(pts[i][0],pts[i+1][0],u),lerp(pts[i][1],pts[i+1][1],u));if(q[1]>st.cz+.6)cur.push(q);else if(cur.length){out.push(cur);cur=[];}}
 const q=rot2(pts[pts.length-1][0],pts[pts.length-1][1]);if(q[1]>st.cz+.6)cur.push(q);if(cur.length>1)out.push(cur);return out;}
/** the court seen from the corner: wood, paper lines (in play space, rotated), boards and empty stands far away */
function cornerCourt(s:Sheet,st:Stage,t:number,flash:number){
 const wallZ=46,wall=proj(st,0,0,wallZ)[1],kw=kAt(st,wallZ);
 woodFloor(s,st,wall,'z',st.cz+.4,wallZ);
 const lines=new Path2D(),add=(pts:Pt[])=>{for(const seg of playLine(st,pts))lines.addPath(polyPath(floorStrip(st,seg,.05),true));};
 add([[-10,0],[10,0]]);add([[-10,0],[-10,40]]);add([[10,0],[10,40]]);add([[-10,20],[10,20]]);
 const arc:Pt[]=[];for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([-1.5-6*Math.cos(a),6*Math.sin(a)]);}for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([1.5+6*Math.cos(a),6*Math.sin(a)]);}add(arc);
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,20+Math.sin(a)*3]);}add(cc);
 for(const Z of[6,10]){const q=rot2(0,Z);lines.addPath(polyPath(floorRing(st,q[0],q[1],.12,12),true));}
 s.knockout(lines,.94);
 const top=boards(s,st,wall,kw,2.4);stands(s,top,kw,t,0,flash,0,true);
}
/** Edu's goal from the corner: a sparse navy net going back from the goal line, then (after the players) the red-and-white frame */
const G3=(st:Stage,X:number,Yh:number,Z:number):Pt=>{const q=rot2(X,Z);return proj(st,q[0],Yh,q[1]);};
function cornerNet(s:Sheet,st:Stage){const m=new Path2D(),bk=(X:number,Yh:number)=>G3(st,X,Yh,-lerp(.9,.5,Yh/2));
 for(let X=-1.5;X<=1.51;X+=.3){const a=bk(X,0);m.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=2.01;Yh+=.25){const b=bk(X,Yh);m.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=2.01;Yh+=.3){const a=bk(-1.5,Yh);m.moveTo(a[0],a[1]);const b=bk(1.5,Yh);m.lineTo(b[0],b[1]);}
 for(const X of[-1.5,1.5])for(let Yh=0;Yh<=2.01;Yh+=.3){const a=G3(st,X,Yh,0),b=bk(X,Yh);m.moveTo(a[0],a[1]);m.lineTo(b[0],b[1]);}
 const roof=new Path2D();for(let X=-1.5;X<=1.51;X+=.3){const a=G3(st,X,2,0),b=bk(X,2);roof.moveTo(a[0],a[1]);roof.lineTo(b[0],b[1]);}m.addPath(roof);
 s.stroke(K,m,2.2,.45);}
function cornerPosts(s:Sheet,st:Stage){const bars:[Pt,Pt][]=[[G3(st,-1.5,0,0),G3(st,-1.5,2,0)],[G3(st,1.5,0,0),G3(st,1.5,2,0)],[G3(st,-1.5,2,0),G3(st,1.5,2,0)]],w=Math.max(6,.1*kAt(st,rot2(1.5,0)[1]));
 const frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 for(const[a,b] of bars){const pts:Pt[]=[a,b];frame.addPath(ribbon(pts,w,{seed:5,taper:0,wobble:.3}));edge.addPath(ribbon(pts,w*1.35,{seed:6,taper:0,wobble:.3}));
  for(let k=0;k<8;k+=2){const u0=k/8,u1=(k+1)/8;bands.addPath(ribbon([[lerp(a[0],b[0],u0),lerp(a[1],b[1],u0)],[lerp(a[0],b[0],u1),lerp(a[1],b[1],u1)]],w,{seed:7+k,taper:0,wobble:.2}));}}
 s.knockout(edge);s.fill(K,edge,.9);s.knockout(frame);s.fill(R,bands);}
const E2=cornerGen(eduGen),B2=cornerGen(bGen),A2=cornerGen(mateA),D12=cornerGen(D1gen),D22=cornerGen(D2gen),S2=cornerGen(shooterGen);
const sc2:Scene={
 draw(s,t0){
  const{tt,tc}=clock(1,t0),st=st2,p=p2(tt),pc=p2(tc),shot=pulse(pc,P_CATCH,.4),rel=pulse(pc,P_REL,.5);
  // the camera holds Edu through the catch and the throw, then follows the ball out to the runner and pushes in on him
  const v=key(tc,padKeys(mono([[0,-260,250,1.04],[C2.how,-280,250,1.1],[C2.catches,-300,260,1.2],[C2.looks,-240,220,1.1],[C2.throws,-200,210,1.12],[C2.end,-200,210,1.12]]),[0,0,1,0]),easeInOutSine,true);
  const fw=sm(C2.throws+.2,C2.mate+.5,tc,easeInOutSine),bq=cornerBall(playBall(Math.min(pc,P_CTRL))),rq=B2(pc),tq=proj(st,lerp(bq.X,rq.X,sm(P_REL,P_CTRL,pc)),.9,lerp(bq.Z,rq.Z,sm(P_REL,P_CTRL,pc)));
  cam(s,lerp(v[0],tq[0]+40,fw)+5*shot*Math.sin(tc*90),lerp(v[1],tq[1]+15,fw)+4*(shot+rel)*Math.cos(tc*80),lerp(v[2],3.1,fw));
  cornerCourt(s,st,tt,.6*pulse(pc,P_REL,1));
  cornerNet(s,st);
  const b=playBall(p),bc=cornerBall(b),its:{z:number;draw:()=>void}[]=[
   {z:D22(p).Z,draw:()=>athlete(s,st,D22,p,OPP(2),{detail:'auto'})},
   {z:D12(p).Z,draw:()=>athlete(s,st,D12,p,OPP(1),{detail:'auto'})},
   {z:A2(p).Z,draw:()=>athlete(s,st,A2,p,MATE(1),{detail:'auto',smear:p>P_REL+.2?.1:0})},
   {z:B2(p).Z,draw:()=>athlete(s,st,B2,p,MATE(0),{detail:'auto',smear:p>P_CATCH+.3?.1:0})},
   {z:S2(p).Z,draw:()=>athlete(s,st,S2,p,OPP(0),{detail:'auto',smear:p>P_SHOT-.25&&p<P_SHOT+.2?.12:0})},
   {z:E2(p).Z,draw:()=>{const e=E2(p),g=proj(st,e.X,0,e.Z),kz=kAt(st,e.Z);
     // "This is how he does it": a red ring picks out Edu
     ring2(s,R,[g[0],g[1]-kz*.95],kz*.6,kz*1.08,9,221,easeOutBack(sm(C2.how,C2.how+.4,tt))*(1-sm(C2.catches-.3,C2.catches+.1,tt)),1);
     athlete(s,st,E2,p,EDU,{detail:'high',smear:p>P_WIND+.1&&p<P_REL+.25?.1:0});}},
   {z:bc.Z-.02,draw:()=>{ballOn(s,st,b,311,{min:9,map:cornerBall,trail:playBall,t0:p<P_REL?P_SHOT:P_REL,t:p});if(p>=P_CATCH&&p<P_CATCH+.35){const q=proj(st,bc.X,bc.Y,bc.Z);sparkBurst(s,Y,q[0],q[1],90,{n:9,seed:305,g:easeOut(sm(P_CATCH,P_CATCH+.2,p))*(1-sm(P_CATCH+.2,P_CATCH+.35,p))});}}},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  cornerPosts(s,st);
  // "looks up": a red dashed eye-line from Edu's head up the court to the free teammate
  const look=sm(C2.looks,C2.looks+.4,tt,easeOut)*(1-sm(C2.throws+.3,C2.throws+.7,tt));
  if(look>.02){const h=jointAt(E2,p,EBUILD,'head'),hp=proj(st,h[0],h[1]+.05,h[2]),bb=B2(p),tp=proj(st,bb.X,1.5,bb.Z);dashed(s,R,[hp,[lerp(hp[0],tp[0],.5),lerp(hp[1],tp[1],.5)-40],tp],10,231,{dash:34,progress:look});}
  // "Counter!": a red arrow up the court ahead of the runner, yellow speed lines behind him
  const cnt=sm(C2.counter,C2.counter+.5,tt,easeOut);
  if(cnt>.02){const bb=bGen(p),a=G3(st,bb.X+.2,.02,bb.Z+1.2),c=G3(st,bb.X+1.6,.02,bb.Z+8),pts:Pt[]=[a,[lerp(a[0],c[0],.5)+8,lerp(a[1],c[1],.5)],c];dashed(s,R,pts,10,241,{dash:30,progress:cnt});if(cnt>.9)arrowHead(s,R,pts,30,242);
   const g=G3(st,bb.X,1,bb.Z),g2=G3(st,bb.X,1,bb.Z-2);speedLines(s,Y,g[0],g[1],Math.atan2(g[1]-g2[1],g[0]-g2[0]),{n:5,seed:243,len:90*cnt,spread:36,width:6});}
 },
 aperture(t0){const{tt}=clock(1,t0),p=p2(tt),b=cornerBall(playBall(p)),st=st2,q=proj(st,b.X,b.Y,b.Z),r=Math.max(12,kAt(st,b.Z)*BALL_R)*1.5,pts:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}return aperture(pts);},
 still:C2.looks+.3,
};

// ================= chapter 3 — REPLAY: slow motion, SIDE-ON from the touchline on the free teammate's wing, the camera trucking with the throw =================
const C3={again:A(2,'Again'),one:A(2,'One teammate'),but:A(2,'but this'),throws:A(2,'Edu throws'),front:A(2,'in front'),never:A(2,'never stops'),two:A(2,'Two against'),end:AUTH[2].seconds};
/** play space → side stage: (X, Z) → (20 − Z, X + 10), a 90° turn, so nobody mirrors; yaw + π/2 (Edu's goal on the right) */
const sideGen=(g:Gen):Gen=>t=>{const a=g(t);return{pose:a.pose,yaw:a.yaw+Math.PI/2,X:20-a.Z,Z:a.X+10};};
const sideBall=(b:Ball3):Ball3=>({...b,X:20-b.Z,Z:b.X+10});
/** chapter clock → play time (slow): the catch just before "One teammate", the release on "Edu throws", the landing on "never stops" */
const p3=(t:number)=>key(t,mono([[0,P_CATCH-.3],[C3.one,P_CATCH+.3],[C3.but,P_LOOK+.05],[C3.throws,P_WIND+.2],[C3.throws+.9,P_REL+.06],[C3.front+.4,P_REL+.6],[C3.never+.1,P_CTRL],[C3.two,P_CTRL+.45],[C3.end,P_CTRL+1.9]]),linear);
const E3=sideGen(eduGen),B3=sideGen(bGen),A3=sideGen(mateA),D13=sideGen(D1gen),D23=sideGen(D2gen),S3=sideGen(shooterGen);
const st3=(cx:number):Stage=>({F:1700,eye:3.4,cx,cz:-8.5});
const cam3x=(t:number)=>key(t,mono([[0,18],[C3.one,12.5],[C3.but,12.8],[C3.throws,15.4],[C3.front,8],[C3.never,2],[C3.two,-2.5],[C3.end,-9]]),easeInOutSine);
const sc3:Scene={
 draw(s,t0){
  const{tt,tc}=clock(2,t0),p=p3(tt),st=st3(cam3x(tc));
  camPath(s,tc,[[0,40,230,2],[C3.one,-60,200,1.25],[C3.but,-40,300,1.2],[C3.throws,-20,300,1.08],[C3.front,0,300,1.12],[C3.never,20,340,1.3],[C3.two,0,320,1.1],[C3.end,0,330,1.14]]);
  sideCourt(s,st,tt,{empty:true});sideGoal(s,st,20);
  const b=playBall(p),bs=sideBall(b);
  // "in front of him": a red floor target where the throw lands, ahead of the runner
  const tg=easeOutBack(sm(C3.front,C3.front+.45,tt))*(1-sm(C3.two,C3.two+.5,tt));if(tg>.02){floorTarget(s,st,20-LAND[2],LAND[0]+10,tg,251);}
  // "Edu throws it flat": the red dashed flight line, drawn ahead of the ball
  const fl=sm(C3.throws+.2,C3.front,tt,easeOut)*(1-sm(C3.never+.4,C3.never+.9,tt));
  if(fl>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=playBall(lerp(P_REL,P_LAND,k/12)),r=sideBall(q);pts.push(proj(st,r.X,r.Y,r.Z));}dashed(s,R,pts,9,252,{dash:30,progress:fl});}
  // "Two against one": two red arrows (runner + A) up the court, a navy ring round the last defender
  const two=sm(C3.two,C3.two+.5,tt,easeOut);
  if(two>.02){for(const[g,seed] of[[B3,261],[A3,263]] as [Gen,number][]){const a=g(p),s0=proj(st,a.X-.8,.02,a.Z),s1=proj(st,a.X-5.5,.02,a.Z+(seed===261?1.2:-.6)),pts:Pt[]=[s0,[lerp(s0[0],s1[0],.5),lerp(s0[1],s1[1],.5)+8],s1];dashed(s,R,pts,11,seed,{dash:30,progress:two});if(two>.9)arrowHead(s,R,pts,32,seed+1);}}
  const its:{z:number;draw:()=>void}[]=[];
  const add=(g:Gen,style:AthleteStyle,z:number,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={})=>its.push({z,draw:()=>athlete(s,st,g,p,style,o)});
  add(D23,OPP(2),D23(p).Z,{detail:'auto'});add(D13,OPP(1),D13(p).Z);add(A3,MATE(1),A3(p).Z);add(B3,MATE(0),B3(p).Z,{smear:p>P_CATCH+.3?.05:0});add(S3,OPP(0),S3(p).Z);
  its.push({z:E3(p).Z,draw:()=>athlete(s,st,E3,p,EDU,{detail:'high',smear:p>P_WIND+.1&&p<P_REL+.3?.07:0})});
  its.push({z:bs.Z-.03,draw:()=>{ballOn(s,st,b,97,{min:10,map:sideBall,trail:playBall,t0:P_REL,t:p});}});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  sidePosts(s,st,20);
  // "One teammate is marked": a navy ring round A and the defender tight on him
  const mk=easeOutBack(sm(C3.one,C3.one+.4,tt))*(1-sm(C3.throws+.6,C3.throws+1.1,tt));
  if(mk>.02){const a=A3(p),d=D13(p),m=proj(st,(a.X+d.X)/2,.95,(a.Z+d.Z)/2),kk=kAt(st,(a.Z+d.Z)/2);ring2(s,K,m,1.35*kk,1.15*kk,9,271,mk,.95);}
  // "but this one is free": a red ring round B and Edu's red eye-line to him
  const fr=easeOutBack(sm(C3.but,C3.but+.4,tt))*(1-sm(C3.front+.4,C3.front+.9,tt));
  if(fr>.02){const bb=B3(p),g=proj(st,bb.X,.95,bb.Z),kk=kAt(st,bb.Z);ring2(s,R,g,.75*kk,1.15*kk,8,281,fr,1);
   const h=jointAt(E3,p,EBUILD,'head'),hp=proj(st,h[0],h[1]+.05,h[2]),tp=proj(st,bb.X,1.6,bb.Z);dashed(s,R,[hp,[lerp(hp[0],tp[0],.5),lerp(hp[1],tp[1],.5)-50],tp],10,283,{dash:32,progress:clamp(fr)});}
  // "never stops running": yellow speed lines behind the runner as the ball arrives at his feet
  const ns=sm(C3.never,C3.never+.3,tt)*(1-sm(C3.two+.6,C3.two+1,tt));if(ns>.02){const bb=B3(p),g=proj(st,bb.X,1,bb.Z);speedLines(s,Y,g[0]+40,g[1],Math.PI,{n:6,seed:291,len:170*ns,spread:70,width:8});}
  // "Two against one": the last defender ringed in navy
  if(two>.02){const d=D23(p),g=proj(st,d.X,.95,d.Z),kk=kAt(st,d.Z);dashRing(s,K,g,.7*kk,1.1*kk,8,295,easeOutBack(clamp(two)));}
 },
 aperture(t0){const{tt,tc}=clock(2,t0),p=p3(tt),st=st3(cam3x(tc)),b=sideBall(playBall(p)),q=proj(st,b.X,b.Y,b.Z),r=Math.max(12,kAt(st,b.Z)*BALL_R)*1.5,pts:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}return aperture(pts);},
 still:C3.but+.3,
};

// ================= chapter 4 — PRACTISE: elevated, over the young keeper's shoulder; a friend shoots, a catch, a fast throw to the free friend, a tick =================
const C4={try:A(3,'Try'),save:A(3,'After a'),fast:A(3,'throw it'),free:A(3,'a free'),start:A(3,'start a'),end:AUTH[3].seconds};
const st4:Stage={F:1300,eye:3,cx:-1.2,cz:-3.8};
const K_AT:[number,number]=[0,1];
/** play clock for the practice: the shot on "After a save", the release on "throw it fast", the landing on "start a counter" */
const Q_SHOT=C4.save+.15,Q_CATCH=Q_SHOT+.36,Q_WIND=C4.fast-.05,Q_DUR=.8,Q_REL=Q_WIND+THROW_REL*Q_DUR,Q_LAND=C4.start-.15;
const F2X=(t:number)=>key(t,[[0,-3.8],[C4.end,-3.4]],linear),F2Z=(t:number)=>key(t,[[0,4.6],[Q_REL-.3,4.8],[Q_LAND,6.9],[C4.end,9.6]],linear);
const LAND4:V3=[-3.62,BALL_R,F2Z(Q_LAND)+.6];
const Y4=yawTo(LAND4[0]-K_AT[0],LAND4[2]-K_AT[1]);
const kidK:Gen=t=>{let pose=keeperSet(t*1.3),yaw=FACE_AWAY;
 if(t>Q_CATCH-.3)pose=catchPose((t-(Q_CATCH-.3))/(.3/CATCH_AT));
 if(t>Q_CATCH+.2&&t<Q_WIND+.1){const u=sm(Q_CATCH+.2,Q_WIND-.1,t);pose={...pose,neckP:pose.neckP-.4*u,neckY:.5*u};}
 if(t>=Q_WIND){pose=blendPose(pose,throwPose((t-Q_WIND)/Q_DUR),sm(Q_WIND,Q_WIND+.08,t));yaw=lerp(FACE_AWAY,Y4,sm(Q_WIND-.2,Q_WIND+.15,t));}
 if(t>Q_WIND+Q_DUR){pose=blendPose(throwPose(1),celebrate((t-Q_WIND-Q_DUR)*1.1,{kind:'arms'}),sm(C4.start+.3,C4.start+.7,t));}
 return{pose,yaw,X:K_AT[0],Z:K_AT[1]};};
const F1_AT:[number,number]=[1.6,4.9],F1_YAW=yawTo(K_AT[0]-F1_AT[0],K_AT[1]+.3-F1_AT[1])+.1;
const F1B=(()=>{const sk=solve(strike(STRIKE_CONTACT),{height:1.42,bulk:.92},{yaw:F1_YAW}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.07,BALL_R,toe[2]+d[2]/l*.07]);})();
const F1_PL:[number,number]=[F1_AT[0]-F1B[0],F1_AT[1]-F1B[2]];
const friend1:Gen=t=>{const st=key(t,[[0,0],[C4.try+.3,.1],[Q_SHOT-.35,.26],[Q_SHOT,STRIKE_CONTACT],[Q_SHOT+.6,1]],linear);let pose=strike(st);if(t<C4.try+.3)pose=blendPose(stand(),pose,sm(0,C4.try+.3,t));
 return{pose,yaw:F1_YAW,X:F1_PL[0]+key(t,[[0,.4],[Q_SHOT-.35,0,easeOut]]),Z:F1_PL[1]+key(t,[[0,.8],[Q_SHOT-.35,0,easeOut]])};};
const friend2:Gen=t=>{let pose=blendPose(stand(),runCycle(t*runCadence(.15),{speed:.15}),.4),yaw=FACE_CAMERA+.4;
 if(t>Q_REL-.3){const u=t-(Q_REL-.3);pose=blendPose(pose,runCycle(u*runCadence(.7),{speed:.7}),sm(0,.3,u));yaw=lerp(FACE_CAMERA+.4,FACE_AWAY+.05,sm(0,.35,u));}
 return{pose,yaw,X:F2X(t),Z:F2Z(t)};};
function ball4(t:number):Ball3{
 const sb:V3=[F1_AT[0],BALL_R,F1_AT[1]];
 if(t<Q_SHOT)return{X:sb[0],Y:BALL_R,Z:sb[2],flying:false,spin:0};
 const ca=handsMid(kidK,Q_CATCH,KBUILD);
 if(t<Q_CATCH){const u=sm(Q_SHOT,Q_CATCH,t,linear),q=bez(sb,[lerp(sb[0],ca[0],.5),ca[1]*.8+.2,lerp(sb[2],ca[2],.5)],ca,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:u*8};}
 if(t<Q_REL){const hm=handsMid(kidK,t,KBUILD),rh=jointAt(kidK,t,KBUILD,'rHa'),w=sm(Q_WIND,Q_WIND+.2*Q_DUR,t);return{X:lerp(hm[0],rh[0],w),Y:lerp(hm[1],rh[1]+.05,w),Z:lerp(hm[2],rh[2],w),flying:false,spin:0};}
 const rel=jointAt(kidK,Q_REL,KBUILD,'rHa');rel[1]+=.05;
 if(t<Q_LAND){const u=sm(Q_REL,Q_LAND,t,linear),q=bez(rel,[lerp(rel[0],LAND4[0],.5),Math.max(rel[1],1.2)+.3,lerp(rel[2],LAND4[2],.5)],LAND4,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:u*12};}
 const u=t-Q_LAND,ctl=sm(0,.25,u);return{X:lerp(LAND4[0],F2X(t)+.12,ctl),Y:BALL_R,Z:lerp(LAND4[2],F2Z(t)+.5,ctl),flying:false,spin:u*12};
}
const sc4:Scene={
 draw(s,t0){
  const{tt,tc}=clock(3,t0),st=st4;
  camPath(s,tc,[[0,-20,460,1.08],[C4.save,40,480,1.14],[C4.fast,-60,440,1.08],[C4.free,-160,380,1.22],[C4.start,-200,370,1.28],[C4.end,-190,370,1.26]]);
  endArena(s,st,{t:tt,wallZ:22,goals:[0],empty:true,flash:pulse(tt,Q_REL,1.2)});
  nearGoalNet(s,st,0);
  const b=ball4(tt),its:{z:number;draw:()=>void}[]=[
   {z:friend2(tt).Z,draw:()=>athlete(s,st,friend2,tt,KID(1),{detail:'auto',smear:tt>Q_REL?.12:0})},
   {z:friend1(tt).Z,draw:()=>athlete(s,st,friend1,tt,KID(0),{detail:'auto',smear:tt>Q_SHOT-.25&&tt<Q_SHOT+.2?.12:0})},
   {z:K_AT[1],draw:()=>athlete(s,st,kidK,tt,KID_GK,{detail:'high',smear:tt>Q_WIND+.1&&tt<Q_REL+.2?.12:0})},
   {z:b.Z-.02,draw:()=>{ballOn(s,st,b,405,{min:10,trail:ball4,t0:tt<Q_REL?Q_SHOT:Q_REL,t:tt});}},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  endPosts(s,st,0);
  // "a free teammate": a red ring round the free friend + the keeper's eye-line; "throw it fast": the red target in front of him
  const fr=easeOutBack(sm(C4.free,C4.free+.4,tt))*(1-sm(C4.end-.8,C4.end-.3,tt)),f=friend2(tt),g=proj(st,f.X,.75,f.Z),kf=kAt(st,f.Z);
  ring2(s,R,g,.6*kf,.95*kf,8,411,fr,1);
  const tg=easeOutBack(sm(C4.fast,C4.fast+.4,tt))*(1-sm(C4.start+.2,C4.start+.6,tt));if(tg>.02)floorTarget(s,st,LAND4[0],LAND4[2],tg*.8,413);
  // "start a counter": a red arrow up the court from the friend, and a big red tick beside the keeper
  const go=sm(C4.start,C4.start+.5,tt,easeOut);if(go>.02){const a=proj(st,f.X+.2,.02,f.Z+.9),c=proj(st,f.X+1.2,.02,f.Z+6),pts:Pt[]=[a,[lerp(a[0],c[0],.5)+10,lerp(a[1],c[1],.5)],c];dashed(s,R,pts,10,415,{dash:30,progress:go});if(go>.9)arrowHead(s,R,pts,30,416);}
  const tick=easeOutBack(sm(C4.start+.35,C4.start+.7,tt));
  if(tick>.02){const gk=proj(st,K_AT[0],0,K_AT[1]),h=kAt(st,K_AT[1])*1.46,c:Pt=[gk[0]-h*.95,gk[1]-h*.75],S=h*.36*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:419,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:420,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:418,taper:.2,wobble:1}),.5);s.fill(R,tp);s.fill(Y,tp,.25);}
 },
 still:C4.free+.4,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'edu-futsal-signature',format:'futsal',title:'Edu’s quick throw',theme:'After a save, throw it fast to a free teammate to start a counter.',
 ageNote:'For players aged 7–12: the 2022 Finalissima final and its result are real; the throw shows how Edu does it, not a filmed moment. Practise with a friend and a soft ball.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball is caught by a paper glove, then flung away up-right with a red dashed arc; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const grab=sm(0,.12,age,easeOutBack)*(1-sm(.3,.4,age)),fly=sm(.3,.8,age,easeOut),bx=x+fly*170,by=y-fly*120+fly*fly*60;
  if(age>.3){const pts:Pt[]=[[x,y],[x+85,y-110],[x+170,y-60]];dashed(s,R,pts,7,seed,{dash:22,progress:fly});}
  ball(s,bx,by,r*(1-.3*fly),seed,{rot:age*8});
  if(grab>.02){const g=blob(x-r*.2,y+r*.5,r*.9*grab,r*.55*grab,seed+3,{n:18});s.knockout(polyPath(g,true));s.fill(K,ribbon(g,6,{seed:seed+4,close:true,wobble:.8}));}
 },
};
export default film;
