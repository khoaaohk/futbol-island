/** Marcio Forte — "the long pass to the pivot": a signature-move riso film (iconic plays, FUTSAL; Forte is a fixo).
 *
 * WHO: Márcio Vinícius Forte (born 23 Apr 1977, Londrina, Brazil), a Brazilian-born ITALY futsal international who played at the back
 *  ("Cierre", i.e. fixo) for Lazio, Perugia and Montesilvano (en.wikipedia). The card bio ("Brazilian-born fixo who became an Italy
 *  international and captain, and played club futsal for Lazio") matches; lib/town/playerAppearance.json gives country "Brazil" — his
 *  birth country, the same man (not a namesake). NOTE for the lead: the flag shows Brazil but he played for Italy; the narration says both.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the long pass to the pivot — not one match. No written source we
 *  could reach describes ONE dated Forte pass (FIFA's reports name the scorers and the passers of the goals, and he is not one of them), so
 *  the film follows the brief's honest FALLBACK: the real-match chapter shows only confirmed things from a real, documented match he played
 *  as ITALY'S CAPTAIN — the 2012 FIFA Futsal World Cup match for third place, Italy 3–0 Colombia, 18 Nov 2012, 17:00, Indoor Stadium
 *  Huamark, Bangkok (5,685) — and the pass itself is a separate, clearly labelled demonstration ("This is how he plays") in training bibs
 *  in an empty arena, never staged inside that match. (No other futsal film uses this match; Falcão's uses the final played later that day.)
 *  1  LIVE (broadcast camera, main stand, real time) — CONFIRMED THINGS ONLY: the arena, Italy's captain No. 3 (the armband ringed), the last
 *     seconds and the final whistle, the scoreboard at 3–0, Italy's players run to their captain, the bronze medal. No goal is staged: the
 *     ball is simply with Colombia at midfield when the whistle goes.
 *  2  THIS IS HOW HE PLAYS (demonstration; neutral training bibs, empty stands; behind the fixo, looking up the court): the fixo is the last
 *     defender; he looks up, finds the pivot far away, and one long lofted pass flies over the three pressing defenders to the pivot's feet.
 *  3  REPLAY of the demonstration (slow motion, LOW SIDE-ON from the touchline): the ball over defender 1, 2, 3 (each ticked off), onto the
 *     pivot's sole; he controls it, turns, and scores.
 *  4  PRACTISE (lesson from the entry's `lesson`: "A long, accurate pass to the pivot can skip the whole defence"): seen from behind the
 *     friend who plays pivot, Forte looks up and chips a long pass over three cones onto a target ring at the friend's feet; a tick.
 * Sources (written; fetched once, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Marcio Forte" (raw, fetched Sep 2026): born 23 Apr 1977, Londrina, Brazil; position Cierre; Lazio 2002–04, Perugia 2004–06,
 *    Montesilvano 2006–11, Lazio 2011–; Italy national futsal team. — https://en.wikipedia.org/wiki/Marcio_Forte
 *  - FIFA.com match report, Match 51, match for third place (archived 23 Nov 2012): Italy 3:0 (0:0) Colombia, 18 November 2012, Bangkok /
 *    Indoor Stadium Huamark, 17:00, attendance 5685; Italy line-up "[3] * Marcio FORTE (C)" (starting five, captain); goals Romano 27'53",
 *    Fortino 32'32" and 39'57"; Colombia keeper Lozano sent off (31'50").
 *    https://web.archive.org/web/20121123201916/http://www.fifa.com/futsalworldcup/matches/round=255927/match=300215819/report.html
 *  - FIFA.com match summary "Italy beat Colombia to bag bronze" (archived Nov 2012): "Italy have finished third at Thailand 2012 after a
 *    3-0 win over Colombia in the bronze-medal match"; photo captions "Miguel Sierra of Colombia challenges Marcio Forte of Italy",
 *    "Alejandro Serna of Colombia is challenged by Marcio Forte of Italy". The lead photo shows Italy No. 3 "Forte" celebrating with
 *    No. 4 and No. 11 "Saad" in blue shirts with white collars and white shorts; the Sierra photo shows Colombia in yellow shirts and dark
 *    blue shorts. https://web.archive.org/web/2012/http://www.fifa.com/futsalworldcup/matches/round=255927/match=300215819/summary.html
 *  - Wikipedia, "2012 FIFA Futsal World Cup" (raw): the third-place match, Italy 3–0 Colombia, Indoor Stadium Huamark; Italy third.
 *  - lib/town/playerBios.json / playerProfiles.json: "Long passes to the pivot", "Calm under pressure", "Tough defending".
 * CONFIRMED: the match, date, venue, city, attendance, the 3–0 result and Italy's bronze; Forte starting as Italy's captain wearing 3;
 *  Italy blue shirts / white shorts, Colombia yellow shirts / dark blue shorts; Forte's short dark hair; born in Brazil; a fixo.
 * INFERRED (not named in the narration): the armband's arm and colour (drawn yellow on the left arm); socks (Italy blue, Colombia yellow);
 *  which goal Italy defended; who was on court at the whistle besides Forte (drawn: 4, 11, 8) and everyone's positions; the ball with
 *  Colombia at midfield in the last seconds; the celebration's choreography; the blue court. Chapters 2–4 are teaching DEMONSTRATIONS of
 *  his signature, not footage: the right-footed lofted pass, the distances, the pivot's control, turn and goal are chosen to show the
 *  lesson. No video was reviewed.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hair/hem follow-through,
 *  motionSmear on the pass and the shot). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 *  z → −Z. The demonstration is authored ONCE in end-on court coordinates; the side-on replay rotates it a quarter turn (X' = Z,
 *  Z' = 10 − X, yaw' = yaw − 90°), a proper rotation, so every foot stays the same foot. The passes are RIGHT-footed (library default).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: blue (Italy, the court, training tops), yellow (Colombia, lights, the ball's flight, the armband), red (bibs, rings, posts),
 *  navy (key line, stands, shorts). The Brazil flag badge is yellow + blue overprinted (green).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈150–280 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,handCut,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,mirrorPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word that is not repeated between it and the cue before (Kokoro matches the FIRST word, in order). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: bronze in Bangkok',text:'Bangkok, 2012, the Futsal World Cup. Italy’s captain is number three, Marcio Forte, born in Brazil. The whistle goes! Italy beat Colombia three nil and win the bronze medal.',tail:2.2,
  cues:['Bangkok','Futsal World Cup','captain is','Marcio Forte','born in Brazil','The whistle','Italy beat','three nil','bronze medal'],heads:{'Bangkok':'2012','captain is':'Captain','three nil':'3–0','bronze medal':'Bronze'}},
 {label:'How he plays',text:'This is how he plays. Forte is the fixo, the last defender. He looks up and finds the pivot, far away. One long pass skips the whole defence!',tail:2.2,
  cues:['This is how','Forte is the fixo','last defender','He looks up','finds the pivot','far away','One long pass','whole defence'],heads:{'This is how':'How he plays','Forte is the fixo':'Fixo','finds the pivot':'Pivot','whole defence':'Skipped'}},
 {label:'Replay: over the defence',text:'Slowly now. Over three defenders, to the pivot’s feet. He controls it, turns and scores!',tail:2.2,
  cues:['Slowly now','Over three','defenders','to the pivot','He controls','turns','scores'],heads:{'Slowly now':'Replay','scores':'Goal'}},
 {label:'Practise it',text:'Try it! Look up first. A long, accurate pass to the pivot can skip the whole defence.',tail:2.6,
  cues:['Try it','Look up first','A long','accurate pass','to the pivot','skip the whole'],heads:{'Look up first':'Look up','skip the whole':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/marcio-forte-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/marcio-forte-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/marcio-forte-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('forte: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('forte: no cue '+w);return c.at;};
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
type Ball3={X:number;Y:number;Z:number;flying:boolean;spin:number};
const bez=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};

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
/** a hand-drawn ring round a screen point (knocked out first); g grows it in */
function ring2(s:Sheet,ink:string,c:Pt,rx:number,ry:number,w:number,seed:number,g=1,cov=1){if(g<=.02)return;const p=ribbon(blob(c[0],c[1],rx*g,ry*g,seed,{n:22,amp:.06}),w,{seed:seed+1,close:true,wobble:1.1});s.knockout(p);s.fill(ink,p,cov);}
/** a stamped tick (blue with a navy misregistered echo) at c, size S */
function tick(s:Sheet,c:Pt,S:number,seed:number,ink=B){if(S<2)return;const tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+S*.05,q[1]+S*.05] as Pt),S*.24,{seed,taper:.2,wobble:1}),.5);s.fill(ink,ribbon(tk,S*.24,{seed:seed+2,taper:.2,wobble:1}));}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
type At={pose:Pose;yaw:number;X:number;Z:number};
type Gen=(t:number)=>At;
/** the side-on replay: a quarter turn of the end-on demonstration court (X' = Z, Z' = ZOFF − X, yaw' = yaw − 90°) */
const ZOFF=10;
const sideOf=(a:At):At=>({pose:a.pose,yaw:a.yaw-Math.PI/2,X:a.Z,Z:ZOFF-a.X});
const sideGen=(g:Gen):Gen=>t=>sideOf(g(t));
const sideBall=(b:Ball3):Ball3=>({...b,X:b.Z,Z:ZOFF-b.X});
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** a figure's joint on the sheet */
function jointAt(st:Stage,a:At,j:'head'|'chest'|'lSh'|'lEl'|'rSh'|'pelvis',build:{height?:number}){const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),p=toMine(sk[j]);return{p:proj(st,p[0],p[1],p[2]),Z:p[2]};}

const SKIN:InkFill[]=[[Y,.82],[R,.26]];
const FBUILD={height:1.8,bulk:1.02},PBUILD={height:1.82,bulk:1.06};
/** Marcio Forte, Italy No. 3 and captain (FIFA line-up): blue shirt with white collar, white shorts (FIFA photo), blue socks (inferred);
 * short dark hair (photo); height not verified (1.80 drawn) */
const FORTE:AthleteStyle={shirt:B,shorts:'paper',socks:B,boots:K,skin:SKIN,hair:K,line:K,trim:'paper',number:3,numberInk:'paper',hairStyle:'short',build:FBUILD,seed:3};
const ITA=(n:number):AthleteStyle=>({shirt:B,shorts:'paper',socks:B,boots:K,skin:[[Y,.8],[R,.28]],hair:K,line:K,trim:'paper',number:n,numberInk:'paper',hairStyle:n===11?'bald':'short',build:{height:1.72+hash(n,3)*.12},seed:20+n});
/** Colombia: yellow shirts, dark blue (navy) shorts (FIFA photo), yellow socks (inferred) */
const COL=(n:number):AthleteStyle=>({shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.72],[R,.34]],hair:K,line:K,trim:K,hairStyle:n%2?'short':'curly',build:{height:1.7+hash(n,4)*.12},seed:40+n});
/** the demonstration (chapters 2–3): Forte and the pivot in light-blue training tops, the defenders in red bibs, a yellow-shirted keeper — no
 * team, no match is claimed */
const FORTE_T:AthleteStyle={...FORTE,shirt:'paper',shorts:K,socks:K,trim:B,numberInk:B};
const PIVOT_T:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.34]],hair:K,line:K,trim:B,number:null,hairStyle:'curly',build:PBUILD,seed:9};
const BIB=(n:number):AthleteStyle=>({shirt:[R,.62],shorts:K,socks:K,boots:K,skin:[[Y,.84],[R,.22]],hair:K,line:K,trim:K,number:null,hairStyle:n%2?'short':'bald',build:{height:1.74+hash(n,5)*.1},seed:60+n});
const KEEPER_T:AthleteStyle={shirt:[Y,.75],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',number:null,hairStyle:'short',build:{height:1.84},seed:71};
/** the practice friend (chapter 4): a neutral paper/navy training kit */
const FRIEND:AthleteStyle={shirt:[Y,.8],shorts:K,socks:K,boots:K,skin:[[Y,.84],[R,.22]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.6,bulk:.95},seed:77};
/** where the ball sits at the right-foot strike's contact (our floor coords, relative to the stance place) */
function strikeBall(yaw:number,build:{height?:number}):V3{const sk=solve(strike(STRIKE_CONTACT),build,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}
/** the sole trap (right foot flat on top of the ball) and the ball point under that sole */
const TRAP=mirrorPose(posed({lHipF:52,lKnee:55,lAnk:0,lHipA:4,rHipF:14,rKnee:34,lean:16,pitch:2,neckP:34,lShA:44,rShA:38,lElb:40,rElb:44,twist:-6}));
function solePt(a:At,build:{height?:number}):[number,number]{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),toe=toMine(sk.rToe),heel=toMine(sk.rHeel);return[lerp(heel[0],toe[0],.62),lerp(heel[2],toe[2],.62)];}
/** a standing figure that looks down at the ball (neckP +) or up the court (neckP −) */
const LOOK=(neck:number)=>posed({lHipF:12,rHipF:12,lKnee:20,rKnee:20,lAnk:-4,rAnk:-4,lean:10,pitch:3,neckP:neck,lShA:16,rShA:16,lElb:32,rElb:32});
/** a pressing defender: low, arms out, weight forward */
const PRESS=posed({lHipF:30,rHipF:10,lKnee:44,rKnee:36,lean:22,neckP:10,lShA:40,rShA:40,lElb:34,rElb:34,rHipA:12,lHipA:8});
/** watching the ball fly over: up on the toes, head back, one arm half up */
const WATCH=posed({lHipF:6,rHipF:10,lKnee:14,rKnee:20,lAnk:18,rAnk:18,lean:-4,neckP:-40,lShA:30,rShA:22,lShF:60,lElb:50,rElb:30});

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
/** a ball on stage st: ground shadow, an optional yellow trail (flight), the ball */
function ballOn(s:Sheet,st:Stage,b:Ball3,seed:number,o:{min?:number;smear?:number;dir?:number;trail?:(u:number)=>Ball3;t0?:number;t?:number;span?:number}={}){
 const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(o.min??9,kAt(st,b.Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);
 if(b.flying&&o.trail&&o.t!==undefined&&o.t0!==undefined){const sp=o.span??.18,tr:Pt[]=[];for(let k=0;k<=8;k++){const q=o.trail(Math.max(o.t0,o.t-sp+k*sp/8));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.4,{seed:seed+7,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
 ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?(o.smear??.4):0,dir:o.dir??0});return{p,r};
}

// ---------------- the arena: stands (full or empty), boards, the blue court ----------------
/** stepped navy rows; full = lit faces, blue / yellow shirts, roof lights; empty = bare rows and a few work lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,empty=false){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const off=scroll*kw;
 if(empty){const seats=new Path2D();for(let r=1;r<12;r+=2)for(let i=-30;i<30;i++){const x=i*.9*kw-((off%(.9*kw))+.9*kw)%(.9*kw);seats.rect(x,top-(r+.8)*rowH,.5*kw,rowH*.22);}s.fill(R,seats,.35);
  const wl=new Path2D();for(let i=-3;i<=3;i++){const lx=i*9*kw-((off*.5)%(9*kw));wl.addPath(polyPath(blob(lx,top-15*rowH,kw*.9,kw*.6,60+i,{amp:.05,n:16}),true));}s.fill(Y,wl,.55);return;}
 const heads=new Path2D(),yel=new Path2D(),blues=new Path2D(),reds=new Path2D(),gap=.62*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.2)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.36)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(B,blues);s.fill(R,reds,.8);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
function boards(s:Sheet,wall:number,kw:number,camX:number,step:number){const span=9000,board=.95*kw;s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D(),base=Math.floor(camX/step)*step;for(let i=-14;i<14;i++){const x0=(base+i*step+.3-camX)*kw,x1=(base+i*step+step*.8-camX)*kw;ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));return wall-board;}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up (the 2012 World Cup: Huamark, Bangkok) ----
const TOUCH_FAR=20,BOARDS=21.2;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;board?:(top:number,kw:number,wall:number)=>void}={}){
 const{cheer=0,flash=0}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true);s.knockout(court,.35);s.fill(B,court,.42);
 s.fill(B,polyPath(floorQuad(st,-20,6,20,13),true),.08);
 const lines=new Path2D();
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]],[[-20,0],[-20,TOUCH_FAR]],[[20,0],[20,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 for(const X of[-14,-10,10,14])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 // the penalty-area arcs (6 m from the posts) at both ends
 for(const sg of[-1,1]){const arc:Pt[]=[];for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([sg*(20-6*Math.sin(a)),8.5-6*Math.cos(a)]);}for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([sg*(20-6*Math.sin(a)),11.5+6*Math.cos(a)]);}lines.addPath(polyPath(floorStrip(st,arc,.05),true));}
 s.knockout(lines,.94);
 const top=boards(s,wall,kw,st.cx,3);stands(s,top,kw,t,cheer,flash,st.cx);o.board?.(top,kw,wall);
}

// ---- END-ON demonstration court (camera looks along +Z): blue floor, lines, the far goal at gz, boards + stands at wallZ ----
function endArena(s:Sheet,st:Stage,o:{t:number;wallZ:number;gz?:number;half?:number;empty?:boolean;cheer?:number;bulge?:number;bx?:number;by?:number;behindGoal?:()=>void}){
 const{t,wallZ,gz,half,empty=true,cheer=0}=o,span=6000,wall=proj(st,0,0,wallZ)[1],kw=kAt(st,wallZ);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const zEnd=gz??wallZ-1,court=polyPath(floorQuad(st,-10,-40,10,zEnd),true);s.knockout(court,.35);s.fill(B,court,.42);
 const lines=new Path2D();
 lines.addPath(polyPath(floorStrip(st,[[-10,st.cz+.5],[-10,zEnd]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,st.cz+.5],[10,zEnd]],.05),true));
 if(gz!==undefined){const arcPts:Pt[]=[];
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),gz-6*Math.sin(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),gz-6*Math.sin(a)]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,gz],[10,gz]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts,.05),true));
  lines.addPath(polyPath(floorRing(st,0,gz-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,gz-10,.12,12),true));}
 if(half!==undefined&&half>st.cz+.6){const cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,half+Math.sin(a)*3]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,half],[10,half]],.05),true));lines.addPath(polyPath(floorStrip(st,cc.filter(p=>p[1]>st.cz+.5),.05),true));}
 s.knockout(lines,.94);
 const top=boards(s,wall,kw,st.cx,2.4);stands(s,top,kw,t,cheer,0,st.cx,empty);
 if(gz!==undefined){goalEnd(s,st,gz,o.bulge??0,o.bx??0,o.by??1);o.behindGoal?.();postsEnd(s,st,gz);}
}
function goalEnd(s:Sheet,st:Stage,gz:number,bulge:number,bx:number,by:number){
 const Lx=-1.5,Rx=1.5,H=2,back=(X:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((X-bx)**2+(Yh-by)**2)/.35);return proj(st,X,Yh,gz+lerp(.95,.55,Yh/H)+d);};
 const out=[proj(st,Lx,0,gz),proj(st,Lx,H,gz),proj(st,Rx,H,gz),proj(st,Rx,0,gz),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.4,kAt(st,gz)*.018),.6);
}
function postsEnd(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,gz);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,gz)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
// ---- SIDE-ON replay court (camera at the near touchline, low): the length runs along X', the far goal at X' = GX ----
const GX=24;
function sideArena(s:Sheet,st:Stage,t:number,o:{bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-16,0,GX,TOUCH_FAR),true);s.knockout(court,.35);s.fill(B,court,.42);
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GX-6*Math.sin(a),8.5-6*Math.cos(a)]);}for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GX-6*Math.sin(a),11.5+6*Math.cos(a)]);}
 for(const seg of[[[-16,0],[GX,0]],[[-16,TOUCH_FAR],[GX,TOUCH_FAR]],[[GX,0],[GX,TOUCH_FAR]],[[4,0],[4,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg.map(p=>[p[0],Math.max(p[1],st.cz+.6)] as Pt),.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GX-6,GX-10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([4+Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 const top=boards(s,wall,kw,st.cx,3);stands(s,top,kw,t,0,0,st.cx,true);
 // the far goal, seen from the side: net behind the line, the keeper, then the posts
 const H=2,PN=8.5,PF=11.5,bulge=o.bulge??0,bz=o.bz??10,by=o.by??1,back=(Z:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((Z-bz)**2+(Yh-by)**2)/.35);return proj(st,GX+lerp(.95,.55,Yh/H)+d,Yh,Z);};
 const hull=[proj(st,GX,0,PN),proj(st,GX,H,PN),proj(st,GX,H,PF),back(PF,H),back(PF,0),back(PN,0)],np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=PN;Z<=PF+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(PN,Yh);mesh.moveTo(a[0],a[1]);for(let Z=PN+.3;Z<=PF+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
 o.keeper?.();
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 for(const Z of[PF,PN]){const P=(Yh:number,dx:number):Pt=>proj(st,GX+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}}
 const Bb=(Z:number,dy:number):Pt=>proj(st,GX,H+dy,Z);quad([Bb(PN,-w),Bb(PF,-w),Bb(PF,w),Bb(PN,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(PN,PF,k/12),z1=lerp(PN,PF,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ================= chapter 1 — LIVE (confirmed things only): Bangkok 2012, Italy's captain No. 3, the whistle, 3–0, bronze =================
const C1={bkk:A(0,'Bangkok'),wc:A(0,'Futsal'),cap:A(0,'captain'),name:A(0,'Marcio'),born:A(0,'born'),whistle:A(0,'The whistle'),beat:A(0,'Italy beat'),three:A(0,'three nil'),bronze:A(0,'bronze'),end:AUTH[0].seconds};
const WH=C1.whistle+.1;
/** Forte deep in Italy's half (the fixo); Italy defend the left goal (inferred) */
const F0:[number,number]=[-5.6,9.2];
/** the ball: Colombia keep it at midfield in the last seconds (no attack is staged); at the whistle it is let go and rolls to a stop */
function liveBall(T:number):Ball3{
 if(T<WH){const u=(Math.sin(T*1.3)+1)/2;return{X:lerp(1.2,.2,u),Y:BALL_R,Z:lerp(8.6,11.4,u),flying:false,spin:T*5};}
 const u=sm(WH,WH+1.6,T,easeOut),a=liveBall(WH-.001);return{X:a.X+1.3*u,Y:BALL_R,Z:a.Z-.5*u,flying:false,spin:5+u*6};
}
/** Forte: set, watching the ball (a small shuffle with it) → turns a little (number to camera) on his name → arms up at the whistle →
 * team-mates arrive → jumps with them */
const liveF:Gen=T=>{
 const b=liveBall(Math.min(T,WH)),look=yawTo(b.X-F0[0],b.Z-F0[1]);
 let pose=blendPose(stand(),backpedal(T*.9),.35*(1-sm(WH-.3,WH,T)));
 // from "captain" to his birthplace he turns to organise the team behind him: back three-quarters to the camera (No. 3 and the armband show)
 let yaw=lerp(look,2.45,Math.sin(Math.PI*sm(C1.cap-.4,WH-.2,T)));
 pose=blendPose(pose,celebrate(0,{kind:'arms'}),sm(WH,WH+.3,T));
 if(T>=C1.beat+.5)pose=blendPose(pose,celebrate((T-C1.beat-.5)*1.2,{kind:'arms'}),sm(C1.beat+.5,C1.beat+.8,T));
 if(T>WH)yaw=lerp(look,FACE_CAMERA+.35,sm(WH,WH+.8,T,easeIO));
 const Z=F0[1]+.4*Math.sin(T*.8)*(1-sm(WH,WH+.5,T)),X=F0[0]+.6*sm(0,WH,T,easeIO);
 return{pose,yaw,X,Z};
};
/** Italy's other three on court (blue; numbers 4 and 11 from the FIFA photo, 8 inferred): spread out → arms up → run to the captain → jump */
const ITA_N=[4,11,8],ITA0:[number,number][]=[[-1.8,5.2],[1.8,14.6],[-2.6,12.8]],ITA_G:[number,number][]=[[1.1,-.9],[-1.1,1.1],[1.2,1.2]];
const liveIta=(i:number):Gen=>T=>{const[x0,z0]=ITA0[i],[gx,gz]=ITA_G[i],t0=C1.beat+i*.1,go=sm(t0,C1.beat+1.3,T,easeIO),f=liveF(Math.min(T,C1.beat+1.3));
 const X=lerp(x0,f.X+gx,go),Z=lerp(z0,f.Z+gz,go);
 let pose=blendPose(stand(),backpedal(T*1.1+i*.3),.5*(1-sm(WH-.3,WH,T)));
 pose=blendPose(pose,celebrate(0,{kind:'arms'}),sm(WH,WH+.3,T)*(1-sm(t0,t0+.3,T)));
 if(T>=t0&&T<C1.beat+1.5)pose=blendPose(pose,celebrate((T-t0)*1.4,{kind:'run'}),sm(t0,t0+.3,T)*(1-sm(C1.beat+1.2,C1.beat+1.5,T)));
 if(T>=C1.beat+1.2)pose=blendPose(pose,celebrate((T-C1.beat)*1.2+i*.23,{kind:'arms'}),sm(C1.beat+1.2,C1.beat+1.5,T));
 const b=liveBall(Math.min(T,WH)),yaw=T<t0?yawTo(b.X-x0,b.Z-z0):go<1?yawTo(f.X+gx-x0,f.Z+gz-z0):yawTo(-gx,-gz);
 return{pose,yaw,X,Z};};
/** Colombia (yellow): two in possession at midfield, two covering; at the whistle hands to heads, one crouches, heads drop */
const COL0:[number,number][]=[[1.9,9.6],[.4,12.2],[5.6,6.4],[5.2,15.4]];
const DROP:Pose=posed({lHipF:58,rHipF:58,lKnee:70,rKnee:70,lean:44,neckP:40,lShF:40,rShF:40,lElb:20,rElb:20,lShA:10,rShA:10});
const HANDS:Pose=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:10,neckP:34,lShF:150,rShF:150,lShA:40,rShA:40,lElb:150,rElb:150});
const liveCol=(i:number):Gen=>T=>{const[x0,z0]=COL0[i],d=sm(WH+.2,WH+1.1,T),b=liveBall(Math.min(T,WH));
 const near=i<2?(i===0?[b.X+.55,b.Z-.3]:[b.X+.2,b.Z+1.4]):[x0,z0];
 let pose=blendPose(stand(),runCycle(T*runCadence(.2)+i*.4,{speed:.2}),T<WH?.55:0);
 pose=blendPose(pose,i===2?DROP:HANDS,d);
 const X=lerp(x0,near[0],i<2?.8:0),Z=lerp(z0,near[1],i<2?.8:0);
 return{pose,yaw:yawTo(b.X-X+(i<2?-1:0),b.Z-Z)+(T>WH?.3*d:0),X,Z};};
const SEG:Record<string,number[]>={'0':[0,1,2,4,5,6],'3':[0,2,3,5,6]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** the arena scoreboard above the far boards: Italy (blue tab) 3 – 0 Colombia (yellow tab); a yellow clock bar runs out at the whistle */
function scoreboard(s:Sheet,st:Stage,T:number,top:number,kw:number){
 const cx=proj(st,st.cx+2.2,0,BOARDS)[0],W=4.6*kw,H=1.9*kw,y0=top-.4*kw-H,box=polyPath(handCut([[cx-W/2,y0],[cx+W/2,y0],[cx+W/2,y0+H],[cx-W/2,y0+H]],131,3,80),true);
 s.knockout(box);s.fill(K,box);
 const pop=pulse(T,C1.three,.8),lit=new Path2D(),h=H*.52*(1+.16*pop),y=y0+H*.2-H*.52*.08*pop;
 const tab=(ink:string,x:number)=>{const p=new Path2D();p.rect(x,y0+H*.06,W*.16,H*.07);s.fill(ink,p);};tab(B,cx-W*.38);tab(Y,cx+W*.22);
 digit(lit,'3',cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,'0',cx+W*.3-h*.55,y,h);s.knockout(lit);s.fill(Y,lit);
 const bw=W*.76*(T<WH?.12*(1-sm(0,WH,T,linear)):0);if(bw>1)s.fill(R,rectPath(cx-W*.38,y0+H*.84,bw,H*.07));
 const rg=easeOutBack(sm(C1.three,C1.three+.4,T))*(1-sm(C1.bronze+.2,C1.bronze+.6,T));
 if(rg>.02)ring2(s,R,[cx,y+h*.5],W*.46,h*.8,Math.max(5,h*.09),151,rg);
 if(T>=WH&&T<WH+.9)sparkBurst(s,Y,cx,y0-H*.1,W*.5,{n:12,seed:111,g:easeOut(sm(WH,WH+.3,T))*(1-sm(WH+.5,WH+.9,T))});
}
/** the captain's armband on his LEFT upper arm (drawn yellow; arm and colour inferred), only when that arm faces the camera */
function armband(s:Sheet,st:Stage,a:At){
 const sh=jointAt(st,a,'lSh',FBUILD),el=jointAt(st,a,'lEl',FBUILD),rs=jointAt(st,a,'rSh',FBUILD);if(sh.Z>rs.Z+.08)return;
 const m=L2(sh.p,el.p,.4),d=Math.atan2(el.p[1]-sh.p[1],el.p[0]-sh.p[0])+Math.PI/2,k=kAt(st,sh.Z),hw=.07*k,q:Pt[]=[[m[0]-Math.cos(d)*hw,m[1]-Math.sin(d)*hw],[m[0]+Math.cos(d)*hw,m[1]+Math.sin(d)*hw]];
 s.knockout(ribbon(q,Math.max(4,.075*k),{seed:170,taper:0,wobble:.4}));s.fill(Y,ribbon(q,Math.max(3,.06*k),{seed:171,taper:0,wobble:.4}),1);
}
/** "born in Brazil": a little flag badge (yellow + blue overprint = green field, yellow diamond, blue disc) */
function flagBadge(s:Sheet,c:Pt,S:number,seed:number){if(S<3)return;const w=S,h=S*.7,q=handCut([[c[0]-w,c[1]-h],[c[0]+w,c[1]-h],[c[0]+w,c[1]+h],[c[0]-w,c[1]+h]],seed,S*.04,S*.6),f=polyPath(q,true);
 s.knockout(f);s.fill(Y,f,.9);s.fill(B,f,.75);const dm=polyPath([[c[0]-w*.82,c[1]],[c[0],c[1]-h*.8],[c[0]+w*.82,c[1]],[c[0],c[1]+h*.8]],true);s.knockout(dm);s.fill(Y,dm);
 const dc=circlePath(c[0],c[1],h*.42);s.fill(B,dc);s.fill(K,ribbon([...q,q[0]],Math.max(3,S*.06),{seed:seed+1,close:true,wobble:.8}),.9);}
/** the bronze medal: an orange-bronze disc (yellow + red screens) on a blue ribbon */
function medal(s:Sheet,c:Pt,S:number,seed:number,rot=0){if(S<3)return;const rb=new Path2D();rb.addPath(polyPath([[c[0]-S*.55,c[1]-S*2.1],[c[0]-S*.1,c[1]-S*2.1],[c[0]+S*.05,c[1]-S*.8],[c[0]-S*.35,c[1]-S*.8]],true));rb.addPath(polyPath([[c[0]+S*.1,c[1]-S*2.1],[c[0]+S*.55,c[1]-S*2.1],[c[0]+S*.35,c[1]-S*.8],[c[0]-S*.05,c[1]-S*.8]],true));
 s.knockout(rb);s.fill(B,rb);const d=polyPath(blob(c[0],c[1],S,S,seed,{amp:.03,n:28}),true);s.knockout(d);s.fill(Y,d,.85);s.fill(R,d,.55);s.fill(K,crescentish(c,S,rot),.25);
 s.fill(K,ribbon(blob(c[0],c[1],S*.72,S*.72,seed+1,{n:22,amp:.03}),Math.max(3,S*.07),{seed:seed+2,close:true,wobble:.6}),.7);s.fill(K,ribbon(blob(c[0],c[1],S,S,seed,{amp:.03,n:28}),Math.max(3,S*.08),{seed:seed+3,close:true,wobble:.6}));
 s.knockout(polyPath(blob(c[0]-S*.38,c[1]-S*.42,S*.16,S*.1,seed+4,{n:12}),true));}
const crescentish=(c:Pt,S:number,rot:number)=>{const p=new Path2D();p.arc(c[0],c[1],S,rot,rot+Math.PI);p.closePath();return p;};
const liveCam=(T:number)=>({x:key(T,mono([[0,3.6],[C1.wc,1.2],[C1.cap,-4.4],[C1.born,-4.8],[WH,-3.8],[C1.beat+1,-4.2],[C1.three,-3.2],[C1.bronze,-4],[C1.end,-4.2]]),easeInOutSine),
 zoom:key(T,mono([[0,.58],[C1.wc,.62],[C1.cap,1.45],[C1.name,1.6],[C1.born+.5,1.5],[WH,1.0],[C1.beat+1,1.15],[C1.three,.9],[C1.bronze,1.15],[C1.end,1.25]]),easeInOutSine),
 y:key(T,mono([[0,1000],[C1.wc,1010],[C1.cap,1040],[C1.born,1010],[WH,1000],[C1.beat+1,1020],[C1.three,930],[C1.bronze,960],[C1.end,990]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const joy=sm(WH,WH+.4,T);
 courtSide(s,st,T,{cheer:.12+.6*joy+.3*pulse(T,C1.bronze,1.5),flash:pulse(T,WH,1)+.8*pulse(T,C1.bronze,1.3),board:(top,kw)=>scoreboard(s,st,T,top,kw)});
 const f=liveF(T),fg=proj(st,f.X,0,f.Z),fh=1.8*kAt(st,f.Z);
 // "captain": a yellow dashed ring under Forte (fades once the team arrives)
 floorDashRing(s,st,Y,f.X,f.Z,.85,7,301,easeOutBack(sm(C1.cap,C1.cap+.4,T))*(1-sm(C1.beat+.6,C1.beat+1.1,T)));
 type It={z:number;draw:()=>void};const items:It[]=[];
 COL0.forEach((_,i)=>{const g=liveCol(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,COL(i),{detail:'low'})});});
 ITA0.forEach((_,i)=>{const g=liveIta(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ITA(ITA_N[i]),{detail:T>C1.beat?'auto':'low'})});});
 items.push({z:f.Z,draw:()=>{athlete(s,st,liveF,T,FORTE,{});armband(s,st,f);}});
 const b=liveBall(T);items.push({z:b.Z-.05,draw:()=>{ballOn(s,st,b,18,{min:8});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "captain is": a red ring round the armband; "born in Brazil": the flag badge by his head
 const sh=jointAt(st,f,'lSh',FBUILD),hd=jointAt(st,f,'head',FBUILD),ar=easeOutBack(sm(C1.cap+.1,C1.cap+.5,T))*(1-sm(C1.name+.4,C1.name+.8,T));
 const el=jointAt(st,f,'lEl',FBUILD);ring2(s,R,L2(sh.p,el.p,.4),fh*.11,fh*.11,Math.max(4,fh*.025),161,ar);
 const fb=easeOutBack(sm(C1.born,C1.born+.35,T))*(1-sm(WH-.3,WH,T));flagBadge(s,[hd.p[0]+fh*.34,hd.p[1]-fh*.14],fh*.13*fb,171);
 // "bronze medal": the medal pops over the huddle, confetti falls in front of the stands
 const md=easeOutBack(sm(C1.bronze,C1.bronze+.45,T));if(md>.02)medal(s,[fg[0],hd.p[1]-fh*.42],fh*.14*md,181,T*.6);
 if(T>=C1.bronze){const u=sm(C1.bronze,C1.bronze+2.5,T,linear),top=proj(st,0,7,BOARDS)[1];confetti(s,[B,Y,'paper'],[fg[0]-700,top-200+u*500,1400,420],22,Math.floor(T*6),{size:14});}
}
const chestPts=(st:Stage,a:At,build:{height?:number},r=.1):Pt[]=>{const c=jointAt(st,a,'chest',build),rad=r*kAt(st,c.Z),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([c.p[0]+Math.cos(ang)*rad,c.p[1]+Math.sin(ang)*rad]);}return q;};
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveF(tt),FBUILD,.13));},still:C1.cap+.6};

// ================= the DEMONSTRATION (chapters 2–3), authored once in end-on court coordinates, on "play time" P (P = 0 at the pass) =================
/** Forte (the fixo) deep in his half; the pivot 16 m ahead with his back to goal; three pressing defenders between; a marker behind the
 * pivot; a keeper in the far goal (goal line at Z = 24, the halfway line at Z = 4) */
const GZ=24,HALF=4;
const F_BALL:[number,number]=[-5.2,.25],PIV:[number,number]=[1.9,16.2],PYAW=yawTo(F_BALL[0]-PIV[0],F_BALL[1]-PIV[1]);
const LAND=solePt({pose:TRAP,yaw:PYAW,X:PIV[0],Z:PIV[1]},PBUILD);
const YAW_P=yawTo(LAND[0]-F_BALL[0],LAND[1]-F_BALL[1]);
const SB=strikeBall(YAW_P,FBUILD),PLANT:[number,number]=[F_BALL[0]-SB[0],F_BALL[1]-SB[2]];
const FLIGHT=1.0,PEAK=2.75;
const PASS_MID:V3=[lerp(F_BALL[0],LAND[0],.5),(PEAK-BALL_R*.5)*2,lerp(F_BALL[1],LAND[1],.5)];
/** the pivot's turn (P 1.35–1.9), his shot (contact P_SHOT) into the far-post low corner, the keeper beaten */
const TURN0=1.35,TURN1=1.95,P_SHOT=2.35,P_IN=2.62,GT:V3=[-1.08,.45,GZ+.05];
const turnYaw=(P:number)=>lerp(PYAW,PYAW-Math.PI,sm(TURN0,TURN1,P,easeIO));
const pivotTurn=(P:number):At=>({pose:blendPose(TRAP,blendPose(TRAP,stand(),.3),Math.sin(Math.PI*sm(TURN0,TURN1,P))),yaw:turnYaw(P),X:PIV[0],Z:PIV[1]});
const B1=solePt(pivotTurn(TURN1),PBUILD);
const YAW_S=yawTo(GT[0]-B1[0],GT[2]-B1[1]),SB2=strikeBall(YAW_S,PBUILD),PLANT2:[number,number]=[B1[0]-SB2[0],B1[1]-SB2[2]];
function demoBall(P:number):Ball3{
 if(P<0)return{X:F_BALL[0],Y:BALL_R,Z:F_BALL[1],flying:false,spin:0};
 if(P<FLIGHT){const u=Math.pow(P/FLIGHT,.94),q=bez([F_BALL[0],BALL_R,F_BALL[1]],PASS_MID,[LAND[0],BALL_R,LAND[1]],u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:P*18};}
 if(P<TURN0){const d=Math.abs(Math.sin(sm(FLIGHT,FLIGHT+.12,P)*Math.PI))*.05;return{X:LAND[0],Y:BALL_R+d,Z:LAND[1],flying:false,spin:18};}
 if(P<P_SHOT){const[x,z]=P<TURN1?solePt(pivotTurn(P),PBUILD):B1;return{X:x,Y:BALL_R,Z:z,flying:false,spin:18+P*4};}
 if(P<P_IN){const u=sm(P_SHOT,P_IN,P,linear),q=bez([B1[0],BALL_R,B1[1]],[lerp(B1[0],GT[0],.5),.5,lerp(B1[1],GT[2],.5)],GT,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:40+u*30};}
 const d=sm(P_IN+.1,P_IN+.5,P,easeIn);return{X:GT[0],Y:lerp(GT[1],BALL_R,d),Z:GZ+.6,flying:false,spin:70};
}
/** Forte: ball at his feet, head down → head up on "He looks up" (P_LOOK) → the right-foot lofted pass (P = 0) → watches it land */
const demoF=(P_LOOK:number):Gen=>P=>{
 const stT=key(P,[[-.62,0],[-.3,.22],[0,STRIKE_CONTACT],[.6,1]],linear),fwd:[number,number]=[Math.cos(YAW_P),Math.sin(YAW_P)];
 let pose=blendPose(LOOK(30),LOOK(-12),sm(P_LOOK,P_LOOK+.35,P,easeIO));
 if(P>-.7)pose=blendPose(pose,strike(stT,{power:.8}),sm(-.7,-.55,P));
 if(P>.6)pose=blendPose(strike(1,{power:.8}),LOOK(-4),sm(.6,1.1,P,easeIO));
 const back=.55*(1-sm(-.62,0,P,easeOut));
 return{pose,yaw:YAW_P,X:PLANT[0]-fwd[0]*back+fwd[0]*.25*sm(.2,.9,P),Z:PLANT[1]-fwd[1]*back+fwd[1]*.25*sm(.2,.9,P)};
};
/** the pivot: back to goal, calls for it (an arm out), traps it with the sole, rolls it round as he turns, steps in and shoots, celebrates */
const demoP:Gen=P=>{
 let pose=blendPose(stand(),posed({lHipF:14,rHipF:18,lKnee:28,rKnee:30,lean:14,neckP:4,lShA:70,lShF:40,rShA:18,lElb:20,rElb:40}),Math.sin(Math.PI*sm(-1.6,.4,P))*.9);
 let yaw=PYAW,X=PIV[0],Z=PIV[1];
 if(P>.55&&P<TURN0)pose=blendPose(pose,TRAP,sm(.55,FLIGHT-.02,P,easeIO));
 else if(P>=TURN0&&P<TURN1){const a=pivotTurn(P);pose=a.pose;yaw=a.yaw;}
 else if(P>=TURN1){const stT=key(P,[[TURN1,.2],[P_SHOT,STRIKE_CONTACT],[P_SHOT+.5,1]],linear),u=sm(TURN1,TURN1+.25,P,easeIO);
  pose=blendPose(TRAP,strike(stT),sm(TURN1,TURN1+.12,P));yaw=YAW_S;X=lerp(PIV[0],PLANT2[0],u);Z=lerp(PIV[1],PLANT2[1],u);
  if(P>P_IN+.2)pose=blendPose(pose,celebrate((P-P_IN-.2)*1.2,{kind:'arms'}),sm(P_IN+.2,P_IN+.6,P));}
 return{pose,yaw,X,Z};
};
/** the three pressing defenders (red bibs): step up toward the ball → the pass goes over → up on their toes, heads back, watching it */
const DEF:{p:[number,number];over:number;ph:number}[]=[{p:[-3.0,3.9],over:.18,ph:.1},{p:[-3.0,8.6],over:.47,ph:.5},{p:[-1.3,11.3],over:.7,ph:.8}];
const demoD=(i:number):Gen=>P=>{const d=DEF[i],b=demoBall(Math.min(P,FLIGHT)),step=i===0?.8*sm(-1.8,-.1,P,easeIO):.3*sm(-1.5,0,P,easeIO);
 let pose=blendPose(backpedal(P*1.2+d.ph),PRESS,i===0?.8:.45);
 if(i===0)pose=blendPose(pose,lunge(key(P,[[-.35,0],[.05,.6],[.6,.8]],linear),{side:'r'}),sm(-.45,-.3,P)*(1-sm(.5,.9,P)));
 const w=sm(d.over-.25,d.over+.1,P);pose=blendPose(pose,WATCH,w);
 const toBall=yawTo(b.X-d.p[0],b.Z-d.p[1]),yaw=P<d.over?yawTo(F_BALL[0]-d.p[0],F_BALL[1]-d.p[1]):lerp(yawTo(F_BALL[0]-d.p[0],F_BALL[1]-d.p[1]),toBall,sm(d.over-.1,d.over+.4,P,easeIO));
 return{pose,yaw,X:d.p[0],Z:d.p[1]-step};};
/** the marker, goal-side of the pivot: watches, then lunges too late as the pivot turns away */
const MK:[number,number]=[2.9,17.3];
const demoM:Gen=P=>{let pose=blendPose(backpedal(P*1.1+.3),PRESS,.5);pose=blendPose(pose,lunge(key(P,[[TURN0+.1,0],[TURN1,.6],[P_SHOT+.3,.8]],linear),{side:'l'}),sm(TURN0,TURN0+.2,P));
 return{pose,yaw:yawTo(PIV[0]-MK[0],PIV[1]-MK[1]),X:MK[0]-.3*sm(TURN0,TURN1,P),Z:MK[1]};};
/** the keeper: set on his line; a late dive toward the far-post corner */
const demoK:Gen=P=>{let pose=keeperSet(P*1.3);const u=sm(P_SHOT+.02,P_IN+.3,P);if(u>0)pose=blendPose(pose,((q)=>({...q,dz:q.dz*.35,air:q.air*.7}))(keeperDive(u*.9,{side:'l',height:.2})),sm(P_SHOT+.02,P_SHOT+.08,P));
 return{pose,yaw:FACE_CAMERA,X:0,Z:GZ-.7};};
const DEMO_GENS=(P_LOOK:number):[Gen,AthleteStyle,string][]=>[[demoF(P_LOOK),FORTE_T,'f'],[demoP,PIVOT_T,'p'],[demoD(0),BIB(1),'d'],[demoD(1),BIB(2),'d'],[demoD(2),BIB(3),'d'],[demoM,BIB(4),'m']];

// ================= chapter 2 — THIS IS HOW HE PLAYS (demonstration, end-on behind the fixo, real time) =================
const C2={how:A(1,'This is'),fixo:A(1,'Forte is'),last:A(1,'last'),looks:A(1,'He looks'),finds:A(1,'finds'),far:A(1,'far away'),pass:A(1,'One long'),whole:A(1,'whole'),end:AUTH[1].seconds};
const T2HIT=C2.pass+.12;
/** the whole defence skipped: P held at the control (the turn and the goal belong to the replay) */
const P2=(t:number)=>Math.min(t-T2HIT,TURN0-.05);
const P2_LOOK=C2.looks+.05-T2HIT;
const st2:Stage={F:1500,eye:4.4,cx:-4.2,cz:-7};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,P=P2(tt);
  const fp=proj(st,PLANT[0],1.2,PLANT[1]),pp=proj(st,PIV[0],1.1,PIV[1]);
  const mid:Pt=[(fp[0]+pp[0])/2,(fp[1]+pp[1])/2+40];
  camPath(s,t,[[0,fp[0]+30,fp[1]+30,1.85],[C2.fixo,fp[0]+40,fp[1]+40,1.75],[C2.last,fp[0]+120,fp[1]+60,1.3],[C2.looks,mid[0],mid[1],.98],[C2.finds,pp[0]-10,pp[1]+20,2.2],[C2.far-.35,pp[0]-20,pp[1]+30,2.05],[C2.far,mid[0],mid[1],.96],[C2.pass,mid[0]-20,mid[1]+10,.96],[C2.pass+.6,mid[0]+60,mid[1]-60,1.05],[C2.whole,pp[0]-90,pp[1]+80,1.4],[C2.end,pp[0]-30,pp[1]+40,2.1]]);
  const b=demoBall(P);
  endArena(s,st,{t:tt,wallZ:GZ+2.6,gz:GZ,half:HALF,empty:true,behindGoal:()=>athlete(s,st,demoK,P,KEEPER_T,{detail:'low'})});
  // "last defender": a dashed paper-knocked red line across the court at the fixo's depth — nobody behind him but the keeper
  const ld=sm(C2.last,C2.last+.5,tt,easeOut)*(1-sm(C2.looks+.4,C2.looks+.8,tt));
  if(ld>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++)pts.push(proj(st,lerp(-9.5,9.5,k/12),0,PLANT[1]-.3));dashed(s,R,pts,15,201,{dash:52,progress:ld});}
  // "Forte is the fixo": a yellow dashed ring under him
  floorDashRing(s,st,Y,PLANT[0],PLANT[1],.8,9,202,easeOutBack(sm(C2.fixo,C2.fixo+.4,tt))*(1-sm(C2.looks,C2.looks+.4,tt)));
  // "finds the pivot": a red ring on the floor round the pivot; "far away": the distance, a navy dashed floor line with end ticks
  floorDashRing(s,st,R,PIV[0],PIV[1],1.0,11,203,easeOutBack(sm(C2.finds,C2.finds+.4,tt))*(1-sm(C2.whole+.4,C2.whole+.8,tt)));
  const fa=sm(C2.far,C2.far+.6,tt,easeOut)*(1-sm(C2.pass-.1,C2.pass+.2,tt));
  if(fa>.02){const pts:Pt[]=[];for(let k=0;k<=14;k++)pts.push(proj(st,lerp(F_BALL[0]+1.3,PIV[0]+1.3,k/14),0,lerp(F_BALL[1],PIV[1],k/14)));dashed(s,K,pts,8,204,{dash:30,progress:fa});if(fa>.95)arrowHead(s,K,pts,26,205);}
  // "He looks up": the yellow eye-line from his head to the pivot
  const eye=sm(C2.looks+.1,C2.looks+.6,tt,easeOut)*(1-sm(C2.pass-.2,C2.pass,tt));
  if(eye>.02){const hd=jointAt(st,demoF(P2_LOOK)(P),'head',FBUILD).p,pts:Pt[]=[hd,L2(hd,pp,.5),[pp[0],pp[1]-30]];dashed(s,Y,pts,7,206,{dash:26,progress:eye});}
  // the flight: dashed yellow as it goes
  if(P>0){const pts:Pt[]=[];const P1=Math.min(P,FLIGHT);for(let k=0;k<=18;k++){const q=demoBall(P1*k/18);pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,10,207,{dash:40});}
  // figures back to front, the ball by depth
  const items:{z:number;draw:()=>void}[]=[];
  DEMO_GENS(P2_LOOK).forEach(([g,sty,kind],i)=>{const a=g(P);items.push({z:a.Z,draw:()=>{athlete(s,st,g,P,sty,{detail:kind==='f'?'high':'auto',smear:kind==='f'&&P>-.25&&P<.25?.12:0});
   // "whole defence": each skipped defender gets a blue tick over his head
   if(kind==='d'&&tt>C2.whole-.2){const d=DEF[i-2],hd=jointAt(st,a,'head',{height:1.8}).p,S=kAt(st,a.Z)*.5*easeOutBack(sm(C2.whole-.2+(i-2)*.15,C2.whole+.15+(i-2)*.15,tt));tick(s,[hd[0],hd[1]-S*.9],S,220+i);void d;}}});});
  items.push({z:b.Z-.02,draw:()=>ballOn(s,st,b,208,{min:8,trail:demoBall,t0:0,t:P,dir:-Math.PI/2})});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(P>=FLIGHT&&P<FLIGHT+.5){const q=proj(st,LAND[0],.2,LAND[1]);sparkBurst(s,Y,q[0],q[1],70,{n:9,seed:209,g:easeOut(sm(FLIGHT,FLIGHT+.3,P))*(1-sm(FLIGHT+.3,FLIGHT+.5,P))});}
 },
 aperture(t0){const{tt}=clock(1,t0),st=st2,P=P2(tt);return aperture(chestPts(st,demoP(P),PBUILD,.14));},
 still:C2.whole+.4,
};

// ================= chapter 3 — REPLAY (slow motion, low side-on from the touchline): over 1, 2, 3; control, turn, goal =================
const C3={slow:A(2,'Slowly'),over:A(2,'Over three'),defs:A(2,'defenders'),feet:A(2,'to the pivot'),ctrl:A(2,'He controls'),turns:A(2,'turns'),scores:A(2,'scores'),end:AUTH[2].seconds};
/** replay time → play time: slow through the flight, a touch quicker for the control and the turn, the goal on "scores" */
const P3=(t:number)=>key(t,[[0,-.75],[C3.over,.02],[C3.defs+.3,.55],[C3.feet+.4,.9],[C3.ctrl,FLIGHT+.12],[C3.ctrl+.6,TURN0-.05],[C3.turns+.3,TURN1+.1],[C3.scores,P_IN-.08],[C3.end,P_IN+1.3]],linear);
const P3_LOOK=-2;
const st3=(cx:number):Stage=>({F:1500,eye:1.9,cx,cz:-2.5});
const sideK=sideGen(demoK);
/** the replay camera rides with the ball through the flight (a little ahead of it), then drifts to the goal for the shot */
function camX3(P:number){const b=demoBall(clamp(P,0,FLIGHT)).Z+.6;return P<FLIGHT?lerp(PLANT[1]+2.2,b,sm(-.4,.1,P,easeIO)):lerp(LAND[1]+1.4,GX-3.9,sm(TURN1,P_IN,P,easeIO));}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),P=P3(tt),Pc=P3(t),st=st3(camX3(Pc)),b=sideBall(demoBall(P)),net=pulse(P,P_IN,.8);
  camPath(s,t,[[0,-80,130,1.9],[C3.over,-20,70,1.75],[C3.feet,20,120,1.85],[C3.ctrl,20,150,2.1],[C3.turns,20,150,1.8],[C3.scores,40,110,1.08],[C3.end,40,120,1.15]],[0,4*net*Math.sin(t*60)]);
  sideArena(s,st,tt,{bulge:.5*sm(P_IN-.08,P_IN,P)*(1-.6*sm(P_IN+.2,P_IN+1,P)),bz:ZOFF-GT[0],by:GT[1],keeper:()=>athlete(s,st,sideK,P,KEEPER_T,{detail:'mid'})});
  // the flight line (dashed yellow, drawn as the ball goes)
  if(P>0){const pts:Pt[]=[];const P1=Math.min(P,FLIGHT);for(let k=0;k<=18;k++){const q=sideBall(demoBall(P1*k/18));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,10,301,{dash:40});}
  const items:{z:number;draw:()=>void}[]=[];
  DEMO_GENS(P3_LOOK).forEach(([g0,sty,kind],i)=>{const g=sideGen(g0),a=g(P);items.push({z:a.Z,draw:()=>{athlete(s,st,g,P,sty,{detail:kind==='f'||kind==='p'?'high':'auto',smear:(kind==='f'&&P>-.25&&P<.25)||(kind==='p'&&P>P_SHOT-.25&&P<P_SHOT+.2)?.12:0});
   // "Over three defenders": as the ball passes over each one, a numbered stamp (1, 2, 3 as blue pips) and a tick
   if(kind==='d'){const d=DEF[i-2],on=sm(d.over,d.over+.15,P);if(on>.02&&tt<C3.ctrl+.4){const hd=jointAt(st,a,'head',{height:1.8}).p,S=kAt(st,a.Z)*.42*easeOutBack(on);tick(s,[hd[0],hd[1]-S*1.05],S,320+i);
     const pips=new Path2D();for(let k=0;k<=i-2;k++)pips.addPath(circlePath(hd[0]-S*.5+k*S*.42,hd[1]-S*1.9,S*.13));s.knockout(pips);s.fill(R,pips);}}}});});
  items.push({z:b.Z-.02,draw:()=>ballOn(s,st,b,302,{min:9,trail:(u:number)=>sideBall(demoBall(u)),t0:P<FLIGHT?0:P_SHOT,t:P,span:P<FLIGHT?.12:.08,dir:Math.PI})});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "to the pivot's feet": a yellow ring stamps round the ball under his sole; "turns": a curved navy arrow round him
  const lp=P>=FLIGHT?b:sideBall({X:LAND[0],Y:0,Z:LAND[1],flying:false,spin:0}),lg=proj(st,lp.X,0,lp.Z);
  ring2(s,Y,[lg[0],lg[1]-kAt(st,lp.Z)*.1],kAt(st,lp.Z)*.42,kAt(st,lp.Z)*.2,8,303,easeOutBack(sm(C3.feet+.15,C3.feet+.5,tt))*(1-sm(C3.turns,C3.turns+.3,tt)));
  const tu=sm(C3.turns-.1,C3.turns+.5,tt,easeOut)*(1-sm(C3.scores-.2,C3.scores+.1,tt));
  if(tu>.02){const c=sideBall({X:PIV[0],Y:0,Z:PIV[1],flying:false,spin:0}),pts:Pt[]=[];for(let k=0;k<=14;k++){const a=Math.PI*(.15+1.1*k/14);pts.push(proj(st,c.X+Math.cos(a)*.9,.05,c.Z+Math.sin(a)*.6));}const q=partial(pts,tu);if(q.length>1){dashed(s,K,q,9,304,{dash:30});if(tu>.9)arrowHead(s,K,q,28,305);}}
  if(P>=P_IN&&P<P_IN+1.2){const q=proj(st,GX+.5,GT[1],ZOFF-GT[0]);sparkBurst(s,Y,q[0],q[1],110,{n:12,seed:306,g:easeOut(sm(P_IN,P_IN+.3,P))*(1-sm(P_IN+.8,P_IN+1.2,P))});}
 },
 aperture(t0){const{tt}=clock(2,t0),P=P3(tt),st=st3(camX3(P3(t0))),b=sideBall(demoBall(P)),p=proj(st,b.X,b.Y,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R)*1.1,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return aperture(q);},
 still:C3.defs+.3,
};

// ================= chapter 4 — PRACTISE: from behind the friend (the pivot), Forte looks up and chips it over three cones onto the target =================
const C4={tr:A(3,'Try'),look:A(3,'Look up'),long:A(3,'A long'),acc:A(3,'accurate'),piv:A(3,'to the pivot'),skip:A(3,'skip'),end:AUTH[3].seconds};
/** Forte far (Z = 15) facing the camera; the friend near (Z = 1.4) with his back to us; three cones between */
const Q_BALL:[number,number]=[-1.9,15.4],FR:[number,number]=[1.9,2.4],FRYAW=yawTo(-1.9-1.9,15.4-2.4);
const Q_LAND=solePt({pose:TRAP,yaw:FRYAW,X:FR[0],Z:FR[1]},{height:1.6});
const Q_YAW=yawTo(Q_LAND[0]-Q_BALL[0],Q_LAND[1]-Q_BALL[1]),QSB=strikeBall(Q_YAW,FBUILD),QPL:[number,number]=[Q_BALL[0]-QSB[0],Q_BALL[1]-QSB[2]];
const CONES:[number,number][]=[[-.3,12.1],[.9,8.9],[.3,5.8]];
const Q_HIT=C4.long+.25,Q_FL=1.05,Q_IN=Q_HIT+Q_FL;
function practiceBall(t:number):Ball3{
 if(t<Q_HIT)return{X:Q_BALL[0],Y:BALL_R,Z:Q_BALL[1],flying:false,spin:0};
 if(t<Q_IN){const u=Math.pow(sm(Q_HIT,Q_IN,t,linear),.94),q=bez([Q_BALL[0],BALL_R,Q_BALL[1]],[lerp(Q_BALL[0],Q_LAND[0],.5),4.6,lerp(Q_BALL[1],Q_LAND[1],.5)],[Q_LAND[0],BALL_R,Q_LAND[1]],u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:u*16};}
 return{X:Q_LAND[0],Y:BALL_R+Math.abs(Math.sin(sm(Q_IN,Q_IN+.12,t)*Math.PI))*.04,Z:Q_LAND[1],flying:false,spin:16};
}
const practiceF:Gen=t=>{const stT=key(t,[[Q_HIT-.62,0],[Q_HIT-.3,.22],[Q_HIT,STRIKE_CONTACT],[Q_HIT+.6,1]],linear),fwd:[number,number]=[Math.cos(Q_YAW),Math.sin(Q_YAW)];
 let pose=blendPose(LOOK(30),LOOK(-12),sm(C4.look,C4.look+.35,t,easeIO));
 if(t>Q_HIT-.7)pose=blendPose(pose,strike(stT,{power:.8}),sm(Q_HIT-.7,Q_HIT-.55,t));
 if(t>Q_HIT+.6)pose=blendPose(strike(1,{power:.8}),celebrate((t-Q_IN-.3)*1.1,{kind:'arms'}),sm(C4.skip,C4.skip+.4,t,easeIO));
 const back=.55*(1-sm(Q_HIT-.62,Q_HIT,t,easeOut));return{pose,yaw:Q_YAW,X:QPL[0]-fwd[0]*back,Z:QPL[1]-fwd[1]*back};};
const practiceR:Gen=t=>{let pose=blendPose(stand(),posed({lHipF:14,rHipF:18,lKnee:28,rKnee:30,lean:14,neckP:4,lShA:70,lShF:40,rShA:70,rShF:40,lElb:20,rElb:20}),Math.sin(Math.PI*sm(C4.tr,C4.long,t))*.9);
 pose=blendPose(pose,TRAP,sm(Q_IN-.45,Q_IN-.02,t,easeIO));return{pose,yaw:FRYAW,X:FR[0],Z:FR[1]};};
function cone(s:Sheet,st:Stage,X:number,Z:number,seed:number){const k=kAt(st,Z),b=proj(st,X,0,Z),tp=proj(st,X,.34,Z),w=.14*k;const c=polyPath([[b[0]-w,b[1]],[tp[0]-w*.18,tp[1]],[tp[0]+w*.18,tp[1]],[b[0]+w,b[1]]],true);
 shadow(s,b[0]+w*.3,b[1],w*1.3,w*.3,seed,.4);s.knockout(c);s.fill(R,c);s.fill(Y,c,.35);s.fill(K,ribbon([[b[0]-w,b[1]],[tp[0]-w*.18,tp[1]],[tp[0]+w*.18,tp[1]],[b[0]+w,b[1]]],Math.max(2.5,k*.015),{seed:seed+1,close:true,wobble:.5}),.9);}
const st4:Stage={F:1500,eye:3.2,cx:.2,cz:-4.5};
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,b=practiceBall(tt);
  const fp=proj(st,QPL[0],1.2,QPL[1]);
  const rp=proj(st,FR[0],.9,FR[1]),mid:Pt=[(fp[0]+rp[0])/2,(fp[1]+rp[1])/2];
  camPath(s,t,[[0,mid[0],mid[1]+60,1.0],[C4.look,fp[0]+40,fp[1]+30,1.9],[C4.long,mid[0]-40,mid[1]-40,1.1],[C4.acc,mid[0],mid[1],1.0],[C4.piv,rp[0]-160,rp[1]-60,1.3],[C4.skip,mid[0],mid[1],1.0],[C4.end,mid[0],mid[1],1.05]]);
  endArena(s,st,{t:tt,wallZ:21,half:18,empty:true});
  // "accurate": the target ring on the floor at the friend's feet (yellow dashed), stamped red when the ball lands in it
  const tg=easeOutBack(sm(C4.acc-.2,C4.acc+.2,tt));floorDashRing(s,st,tt>Q_IN?R:Y,Q_LAND[0],Q_LAND[1],.55,9,401,tg);
  // "Look up first": the eye-line from Forte's head toward the friend
  const eye=sm(C4.look+.1,C4.look+.6,tt,easeOut)*(1-sm(C4.long,C4.long+.3,tt));
  if(eye>.02){const hd=jointAt(st,practiceF(tt),'head',FBUILD).p,fr=proj(st,FR[0],1.5,FR[1]),pts:Pt[]=[hd,L2(hd,fr,.5),fr];dashed(s,Y,pts,8,402,{dash:28,progress:eye});}
  if(tt>Q_HIT){const pts:Pt[]=[];const t1=Math.min(tt,Q_IN);for(let k=0;k<=18;k++){const q=practiceBall(lerp(Q_HIT,t1,k/18));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,403,{dash:44});}
  const items:{z:number;draw:()=>void}[]=[];
  CONES.forEach(([x,z],i)=>items.push({z,draw:()=>{cone(s,st,x,z,410+i*3);
   // "skip the whole defence": a tick over every cone
   const on=easeOutBack(sm(C4.skip+i*.15,C4.skip+.35+i*.15,tt));if(on>.02){const p=proj(st,x,.9,z),S=kAt(st,z)*.45*on;tick(s,p,S,420+i);}}}));
  items.push({z:QPL[1],draw:()=>athlete(s,st,practiceF,tt,FORTE_T,{detail:'mid',smear:tt>Q_HIT-.25&&tt<Q_HIT+.25?.12:0})});
  items.push({z:FR[1],draw:()=>athlete(s,st,practiceR,tt,FRIEND,{detail:'high'})});
  items.push({z:b.Z-.02,draw:()=>ballOn(s,st,b,430,{min:9,trail:practiceBall,t0:Q_HIT,t:tt,span:.25,dir:-Math.PI/2})});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the big tick beside the friend when the ball lands
  const tk=easeOutBack(sm(Q_IN+.1,Q_IN+.45,tt));if(tk>.02){const g=proj(st,FR[0],0,FR[1]),h=kAt(st,FR[1])*1.6;tick(s,[g[0]+h*.62,g[1]-h*.7],h*.3*tk,440);}
 },
 still:C4.skip+.4,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'marcio-forte-futsal-signature',format:'futsal',title:'Marcio Forte’s long pass',theme:'Look up, then skip the defence with one long pass to the pivot.',
 ageNote:'For players aged 7–12: Italy’s 3–0 bronze win in 2012, with Forte as captain, is real; the long pass is shown as a demonstration in training bibs.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball is chipped up in a yellow arc and drops onto a red target ring; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=40;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.6),bx=x-90+180*u,by=y-170*Math.sin(Math.PI*u),land=clamp((age-.6)/.4);
  const arc:Pt[]=[];for(let k=0;k<=10;k++){const v=u*k/10;arc.push([x-90+180*v,y-170*Math.sin(Math.PI*v)]);}if(arc.length>1)dashed(s,Y,arc,8,seed+4,{dash:26});
  if(land>0)s.fill(R,ribbon(blob(x+90,y+r*.9,r*(1+1.4*land),r*(.3+.4*land),seed+1,{n:22}),7*(1-land)+2,{seed:seed+2,close:true,wobble:1.2}),1);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.8,r*.2,seed+3,{n:16}),true),.3);
  ball(s,bx,by,r,seed,{rot:age*6});
 },
};
export default film;
