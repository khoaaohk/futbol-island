/** Gustavo Lobo — "the commanding goleiro": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Gustavo Lobo Paradeda ("Gustavo", also "Juruna"; born 1979 in Pelotas, Brazil; 1.80 m), a futsal GOALKEEPER — Ulbra, Carlos Barbosa
 *  2001–03, AFC Kairat 2004–09, Sibiryak Novosibirsk 2009–12, MFK Dinamo Moskva 2012–18; a naturalised Russian, Russia international
 *  2011–16 (59 caps, 2 goals). The card matches him: lib/town/playerAppearance.json country "Brazil" (his birth country) and
 *  lib/town/playerBios.json "Brazilian-born goleiro who starred for Kairat and Dinamo Moscow, played for Russia …". Same man in every
 *  source (en.wikipedia "Gustavo Paradeda"; FIFA line-up "12 GUSTAVO (GK)" for Russia) — no country mismatch, no namesake.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — "the commanding goleiro" (lesson: "Shout clear instructions so
 *  your teammates know where to be") — not one match. No written source we could reach describes him organising his defence in one dated
 *  moment, so the film follows the brief's honest route: a REAL, documented Gustavo moment in a real match, then a clearly labelled
 *  demonstration of the signature. The real moment is his own GOAL in the 2016 FIFA Futsal World Cup QUARTER-FINAL, Russia 6–2 Spain,
 *  24 Sep 2016, Coliseo el Pueblo, Cali (Colombia), 18:00: at 38'21" Spain were attacking with a flying keeper and FIFA.com's report says
 *  "while the extra body provided by the flying keeper allowed them pressure, the tired European champions were bereft of ideas and
 *  Gustavo's strike from the opposite end sealed it". A goleiro who sees the whole court — the thing that makes him the team's voice —
 *  spots the empty goal. (Match choice: no other futsal film uses this match — Eder Lima's uses the 2016 FINAL, Carlos Ortiz's the 2012
 *  quarter-final v Spain; the camera plan below is used by no other goleiro film.)
 *  1  LIVE (broadcast camera, main stand, real time; a PANNING wide shot that runs the whole 40 m court with the ball): Russia 5–2 up;
 *     Spain keep the ball round Russia's area with a flying keeper (5 v 4); the ball comes to Gustavo; on "goal is empty" the camera
 *     WHIPS down his yellow sight line to Spain's empty goal and back; from his own end he strikes the length of the court into it: 6–2.
 *  2  REPLAY — THE EMPTY-NET CAMERA (slow motion; a low camera INSIDE Spain's empty goal, looking back up the court — the posts and the
 *     crossbar frame the shot): far away Gustavo strikes; the ball travels the whole court toward the lens and into the net.
 *  3  HOW HE COMMANDS (a demonstration, no match claimed; KEEPER'S-EYE: over his right shoulder, standing in his goal; Gustavo in a plain
 *     yellow training top, his four in blue bibs, the attackers in paper tops): he sees the whole court and talks — "Left!" (one defender
 *     slides across), "Mark him!" (one picks up a runner), "Step up!" (the four push up together).
 *  4  YOUR TURN (lesson from the entry's `lesson`; DEFENDER'S-EYE: the camera is a teammate at head height, facing the goleiro): he shouts
 *     and points, two spots light on the floor, "you" and your teammate run to them; both spots fill: everyone in place.
 * Sources (written; 4 new requests, 5 s apart, + cache, all in scratchpad/films/src-cache/):
 *  - FIFA.com (archived 31 Jan 2017) match centre, …/futsalworldcup/matches/round=276098/match=300357675/index.html
 *    (fifa-2016-futsal-qf-rus-esp.txt): "Coliseo el Pueblo Cali (COL) 24 Sep 2016 - 18:00 Local time Quarter-finals Russia RUS Spain ESP
 *    Full-time FT 6-2"; scorers "CHISHKALA 2'20", 14'52" EDER LIMA 18'41", 30'10" FERNANDAO 26'59" OG GUSTAVO 38'21"" / "RIVILLOS 2'33"
 *    MIGUELÍN 5'42""; line-ups "12 GUSTAVO (GK)" v "1 P. SEDANO (GK)"; statistics "Saves 13 / 7"; MatchCast "38'59'' The goalkeeper of
 *    Russia pulls off a save", "39'26''…", "40'01''…"; referee Gean Telles (BRA).
 *  - FIFA.com match report "Eder, Chishkala help Russia see off Spain" (25 Sep 2016; fifa-2016-futsal-qf-rus-esp-report.txt): the quote
 *    above; "Miguelin's driven free-kick had them ahead, despite goalkeeper Gustavo's best efforts".
 *  - Wikipedia, "2016 FIFA Futsal World Cup" (raw, cached: wiki-2016-futsal-wc.txt): Russia 6–2 Spain, 24 Sep 2016, Coliseo El Pueblo, Cali,
 *    attendance 3,009; "Gustavo 39'" (rounded minute).
 *  - Wikipedia, "Gustavo Paradeda" (raw; wiki-gustavo-lobo.txt): name, birth, height, position, clubs, Russia 2011–16.
 * CONFIRMED: match, round, date, kick-off, venue, attendance, the result 6–2, the score 5–2 before his goal (Eder Lima 30'10" was the fifth)
 *  and 6–2 after it, the minute 38'21", that Spain were playing with a flying keeper, that Gustavo scored with a STRIKE FROM THE OPPOSITE END
 *  (his own end), his shirt number 12 and height; that he made 13 saves in the match.
 * INFERRED (never named in the narration): how the ball reached him (drawn: a low Spanish shot he gathers), where on the court he struck it
 *  (≈ 3 m off his line, centre), his foot (right, the library default), the ball's path (a driven strike that lands near halfway and runs
 *  on), which end each team attacked, every other player's position, the flying keeper's shirt and the kits (Russia all red — their kit in
 *  the final per Wikipedia; Spain white shirts / navy shorts as the change strip; Gustavo a yellow keeper kit; the flying keeper a blue
 *  keeper-style shirt), his short dark hair (card appearance). The TV numbers are headlines, not a drawn scoreboard. No video was reviewed.
 *  Chapters 3 and 4 are demonstrations of the signature and the lesson, not footage of a match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the strike). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library z → −Z; the
 *  strike uses the RIGHT foot (foot:'r'); the ball sits at the solved right toe at contact.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: red (Russia, rings, "mark"), yellow (Gustavo, lights, shouts, flight line), blue (court, bibs, flying keeper), navy (key line, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; crowd heads bounded to the visible span. Seeded only. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,runCycle,runCadence,stand,backpedal,keeperSet,keeperScoop,celebrate,posed,blendPose,keyPoses,mirrorPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: Cali 2016',text:'The 2016 Futsal World Cup quarter-final, in Cali. Russia lead Spain five two. Spain attack with a flying keeper, so their goal is empty. Gustavo, Russia’s goleiro, strikes from his own end. Goal! Six two!',tail:2.2,
  cues:['The 2016','Russia lead','five two','Spain attack','flying keeper','goal is empty','Gustavo','strikes','own end','Goal','Six two'],heads:{'The 2016':'World Cup quarter-final 2016','five two':'5–2','flying keeper':'Flying keeper','goal is empty':'Empty goal','Goal':'6–2'}},
 {label:'Replay: from the empty goal',text:'Watch again, from inside the empty goal. The ball travels the whole court, all the way in!',tail:2.2,
  cues:['Watch again','inside the','The ball','whole court','all the way'],heads:{'inside the':'Inside the empty goal','all the way':'6–2'}},
 {label:'How he commands',text:'How does a goleiro command? He sees the whole court, so he talks. Left! Mark him! Step up! Short, loud words move his team.',tail:2.4,
  cues:['How does','whole court','so he talks','Left','Mark him','Step up','Short','his team'],heads:{'Left':'Left!','Mark him':'Mark him!','Step up':'Step up!','Short':'Short and loud'}},
 {label:'Your turn',text:'Your turn. Shout clear instructions, so your teammates know where to be.',tail:2.6,
  cues:['Your turn','Shout clear','your teammates','where to be'],heads:{'Shout clear':'Clear and loud','where to be':'Everyone in place'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/gustavo-lobo-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/gustavo-lobo-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/gustavo-lobo-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('gustavo-lobo: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('gustavo-lobo: no cue '+w);return c.at;};
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
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
const bez=(a:V3,m:V3,c:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*c[0],p*a[1]+q*m[1]+r*c[1],p*a[2]+q*m[2]+r*c[2]];};
const fp=(st:Stage,pts:[number,number][]):Pt[]=>pts.map(p=>proj(st,p[0],0,p[1]));

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line; knocked out to paper first so the ink prints clean (no overprint) */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
/** a solid hand-drawn arrow (knocked out first) along pts, drawn up to `progress` */
function arrow(s:Sheet,ink:string,pts:Pt[],w:number,seed:number,progress=1){const q=partial(smoothPts(pts,false,8),clamp(progress));if(q.length<2)return;const rp=ribbon(q,w,{seed,taper:.2,wobble:1});s.knockout(rp);s.fill(ink,rp);arrowHead(s,ink,q,w*2.8,seed+1);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a filled floor spot (a lit disc) — the "where to be" marker */
function floorSpot(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,cov:number,seed:number){if(cov<=.02)return;const p=polyPath(floorRing(st,X,Z,r,22),true);s.knockout(p,.9);s.fill(ink,p,cov);void seed;}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2,FACE_AWAY=Math.PI/2;
const SKIN_G:InkFill[]=[[Y,.62],[K,.26]];
const BUILD_G={height:1.8,bulk:1.04};
/** Gustavo: Russia no. 12 (FIFA line-up), 1.80 m (Wikipedia); a yellow keeper kit with long sleeves (inferred), short dark hair (card) */
const GUS:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:SKIN_G,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',number:12,numberInk:K,hairStyle:'short',build:BUILD_G,seed:12};
/** the demonstration Gustavo: the same man in a plain yellow training top (no number, no badge) */
const GUS_T:AthleteStyle={...GUS,number:undefined,shorts:[K,.8],socks:K,seed:13};
/** Russia: all red (their kit in the final per Wikipedia; this match inferred) */
const RUS=(n:number):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:n%2?[[Y,.8],[R,.26]]:[[Y,.72],[R,.2]],hair:n%3?K:[Y,.9],line:K,trim:'paper',numberInk:'paper',hairStyle:n%2?'short':'bald',build:{height:1.74+hash(n,3)*.12},seed:20+n});
/** Spain: white shirts, navy shorts (change strip, inferred) */
const ESP=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.78],[R,.28]],hair:n%2?K:[K,.8],line:K,trim:R,numberInk:R,hairStyle:n%3?'short':'curly',build:{height:1.72+hash(n,5)*.12},seed:40+n});
/** Spain's flying keeper: an outfield player in a blue keeper-style shirt (inferred) */
const FLY:AthleteStyle={shirt:B,shorts:K,socks:B,boots:K,skin:[[Y,.8],[R,.24]],hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8},seed:49};
/** the demonstration: his four in blue bibs over paper; the attackers in paper tops and navy shorts (no team claimed) */
const BIB=(n:number):AthleteStyle=>({shirt:[B,.85],shorts:K,socks:K,boots:K,skin:n%2?[[Y,.8],[R,.26]]:[[Y,.7],[K,.22]],hair:n%3?K:[R,.8],line:K,trim:'paper',hairStyle:n%2?'short':'curly',build:{height:1.66+hash(n,7)*.14},seed:60+n});
const OPP=(n:number):AthleteStyle=>({shirt:'paper',shorts:[K,.7],socks:'paper',boots:K,skin:[[Y,.74],[R,.24]],hair:K,line:K,trim:K,hairStyle:n%2?'curly':'short',build:{height:1.7+hash(n,9)*.12},seed:80+n});
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number;dt?:number}={}){
 const dt=o.dt??1/12,a=gen(t),b=gen(t-dt),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[R,.6],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** the RIGHT-foot strike: where the ball sits at contact — just past the kicking toe along the foot (library coords, place at the origin) */
const strikeR=(t:number)=>strike(t,{foot:'r'});
function strikeBall(yaw:number):V3{const sk=solve(strikeR(STRIKE_CONTACT),BUILD_G,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}
/** stance point so that the ball at `ball` meets his right toe when he strikes toward `target` */
function plantFor(ball:[number,number],target:V3){const yaw=yawTo(target[0]-ball[0],target[2]-ball[1]),sb=toMine(strikeBall(yaw));return{yaw,P:[ball[0]-sb[0],ball[1]-sb[2]] as [number,number]};}
/** where his two hands meet (the held ball), in our coords */
function handsAt(g:Gen,t:number):V3{const a=g(t),sk=solve(a.pose,BUILD_G,placeAt(a.X,a.Z,a.yaw)),l=toMine(sk.lHa),r=toMine(sk.rHa);return[(l[0]+r[0])/2,(l[1]+r[1])/2+.04,(l[2]+r[2])/2];}
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09,build=BUILD_G):Pt[]{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const discPts=(c:Pt,r:number):Pt[]=>{const q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r]);}return q;};

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
/** mag > 1: the camera is zoomed in that far — print the ball at its on-screen size (panels, rim) instead of a tiny ring */
function ballAt(s:Sheet,st:Stage,X:number,Yh:number,Z:number,seed:number,o:{rot?:number;smear?:number;dir?:number;min?:number;mag?:number}={}){
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,Z)*BALL_R),m=Math.max(1,o.mag??1);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,Yh>.5?.25:.45);
 if(m>1){s.save();s.translate(p[0],p[1]);s.scale(1/m);ball(s,0,0,r*m,seed,{rot:o.rot??0,smear:o.smear??0,dir:o.dir??0});s.restore();}else ball(s,p[0],p[1],r,seed,{rot:o.rot??0,smear:o.smear??0,dir:o.dir??0});return{p,r};}

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, red / white / yellow shirts in the crowd, roof lights; cheer lifts the heads; heads only over the span we can see */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),whites=new Path2D(),gap=.62*kw,off=scroll*kw,xr=Math.min(4800,Math.max(700,64*kw)),tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=-xr-((off%gap)+gap)%gap+(r%2)*gap*.5;x<xr;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.14)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.3)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.42)whites.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.knockout(whites,.9);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
function boardsAndStands(s:Sheet,wall:number,kw:number,t:number,cheer:number,flash:number,scroll:number,adX:(i:number)=>[number,number]){
 const span=9000;s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-14;i<16;i++){const[x0,x1]=adX(i);ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,scroll);
}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; the whole court X −20 … +20 ----
// Russia's goal (Gustavo) at X = −20 (left), Spain's goal at X = +20 (right) — ends inferred.
const TOUCH_FAR=20,BOARDS=21.2,HALF=20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=.5}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-HALF,0,HALF,TOUCH_FAR),true);s.knockout(court,.25);s.fill(B,court,.82);
 // painted lines: touchlines, both goal lines, halfway, both penalty areas, the marks, the centre circle
 const lines=new Path2D();
 for(const seg of[[[-HALF,0],[HALF,0]],[[-HALF,TOUCH_FAR],[HALF,TOUCH_FAR]],[[HALF,0],[HALF,TOUCH_FAR]],[[-HALF,0],[-HALF,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 for(const sg of[1,-1]){const G=sg*HALF,arc:Pt[]=[];for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([G-sg*6*Math.sin(a),POST_N-6*Math.cos(a)]);}for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([G-sg*6*Math.sin(a),POST_F+6*Math.cos(a)]);}
  lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const d of[6,10])lines.addPath(polyPath(floorRing(st,G-sg*d,10,.12,12),true));}
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 boardsAndStands(s,wall,kw,t,cheer,flash,st.cx,i=>{const b=Math.floor(st.cx/3)*3+i*3;return[proj(st,b+.3,0,BOARDS)[0],proj(st,b+2.4,0,BOARDS)[0]];});
 sideGoal(s,st,-1,0,10,.5);sideGoal(s,st,1,bulge,bz,by);sidePosts(s,st,-1);sidePosts(s,st,1);
}
/** a goal seen side-on at X = sg·20: the net runs back away from the court */
function sideGoal(s:Sheet,st:Stage,sg:number,bulge:number,bz:number,by:number){
 const G=sg*HALF,H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((Z-bz)**2+(Yh-by)**2)/.35);return proj(st,G+sg*(lerp(Db,Dt,Yh/H)+d),Yh,Z);};
 const hull=[proj(st,G,0,POST_N),proj(st,G,H,POST_N),proj(st,G,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage,sg:number){
 const G=sg*HALF,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,G+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>proj(st,G,H+dy,Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---- END-ON court (camera looks along +Z up the court): the near goal line at Z = 0, the far goal line at Z = gz; lines at both ends ----
type ArenaOpt={cheer?:number;flash?:number;t?:number;gz?:number;far?:(st:Stage)=>void};
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,t=0,gz=40}=o,WALLZ=gz+2.4;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),span=6000;
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-10,-2,10,gz),true);s.knockout(court,.25);s.fill(B,court,.82);
 const lines=new Path2D(),arcAt=(Z0:number,sg:number)=>{const q:Pt[]=[];for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;q.push([-1.5-6*Math.cos(a),Z0+sg*6*Math.sin(a)]);}for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;q.push([1.5+6*Math.cos(a),Z0+sg*6*Math.sin(a)]);}return q;};
 const seg=(a:[number,number],b:[number,number])=>{if(Math.max(a[1],b[1])<st.cz+.5)return;lines.addPath(polyPath(floorStrip(st,[[a[0],Math.max(a[1],st.cz+.5)],[b[0],Math.max(b[1],st.cz+.5)]],.05),true));};
 seg([-10,gz],[10,gz]);seg([-10,-2],[-10,gz]);seg([10,-2],[10,gz]);
 if(gz>=30){seg([-10,0],[10,0]);seg([-10,gz/2],[10,gz/2]);const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,gz/2+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
  const near=arcAt(0,1).filter(p=>p[1]>st.cz+.5);if(near.length>1)lines.addPath(polyPath(floorStrip(st,near,.05),true));}
 lines.addPath(polyPath(floorStrip(st,arcAt(gz,-1),.05),true));lines.addPath(polyPath(floorRing(st,0,gz-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,gz-10,.12,12),true));
 s.knockout(lines,.94);
 boardsAndStands(s,wall,kw,t,cheer,flash,st.cx,i=>[proj(st,i*2.4+.3,0,WALLZ)[0],proj(st,i*2.4+1.9,0,WALLZ)[0]]);
 goalEnd(s,st,gz);o.far?.(st);postsEnd(s,st,gz);
}
function goalEnd(s:Sheet,st:Stage,GZ:number){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H));
 const out=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 if(kAt(st,GZ)<40)return;
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,GZ)*.018),.6);
}
function postsEnd(s:Sheet,st:Stage,GZ:number){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,GZ);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,GZ)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
/** a shout: a yellow jagged burst by his mouth, three red sound arcs opening toward the target, and a yellow dashed call line to it */
function shout(s:Sheet,from:Pt,to:Pt,t:number,t0:number,scale:number,seed:number,o:{line?:boolean}={}){
 const u=t-t0;if(u<0||u>1.5)return;const ang=Math.atan2(to[1]-from[1],to[0]-from[0]),fade=1-sm(1.1,1.5,u),g=easeOutBack(sm(0,.22,u))*fade;
 if(g>.02){const c:Pt=[from[0]+Math.cos(ang)*scale*.55,from[1]+Math.sin(ang)*scale*.55],q:Pt[]=[];for(let i=0;i<14;i++){const a=i/14*TAU,r=scale*(i%2?.2:.36)*g;q.push([c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r*.8]);}
  const p=polyPath(q,true);s.knockout(p);s.fill(Y,p);s.fill(R,ribbon([...q,q[0]],Math.max(3,scale*.025),{seed,close:true,wobble:.6}),.9);}
 const arcs=new Path2D();for(let j=0;j<3;j++){const gg=(u*1.4+j/3)%1,r=scale*(.7+gg*1.1),f=(1-gg)*fade;if(f<.12)continue;const pts:Pt[]=[];for(let a=-.5;a<=.51;a+=.1)pts.push([from[0]+Math.cos(ang+a)*r,from[1]+Math.sin(ang+a)*r]);arcs.addPath(ribbon(pts,Math.max(4,scale*.05*f),{seed:seed+j+1,taper:.3,wobble:1}));}
 s.knockout(arcs);s.fill(R,arcs);
 if(o.line){const lp=sm(.05,.45,u,easeOut);const a:Pt=[from[0]+Math.cos(ang)*scale*1.2,from[1]+Math.sin(ang)*scale*1.2];if(fade>.1)dashed(s,Y,[a,L2(a,to,.5),to],Math.max(6,scale*.05),seed+9,{dash:scale*.3,progress:lp*fade});}
}
/** a big yellow tick with a navy misregistered echo */
function tick(s:Sheet,c:Pt,S:number,seed:number){if(S<2)return;const tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 const tp=ribbon(tk,S*.24,{seed,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:seed+2,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}

// ================= chapter 1 — LIVE: the 2016 quarter-final, 38'21"; the flying keeper, the empty goal, the strike from his own end =================
const C1={lead:A(0,'Russia lead'),five:A(0,'five two'),att:A(0,'Spain attack'),fly:A(0,'flying keeper'),empty:A(0,'goal is empty'),gus:A(0,'Gustavo'),strikes:A(0,'strikes'),own:A(0,'own end'),goal:A(0,'Goal'),six:A(0,'Six two'),end:AUTH[0].seconds};
/** Spain's five round Russia's area (FLY = the flying keeper at the top), Russia's four in front of Gustavo (all positions inferred) */
const ESP_P:[number,number][]=[[-6.6,12.9],[-10.6,3.6],[-10.2,16.6],[-14.6,4.9],[-15.0,15.1]];
const RUS_P:[number,number][]=[[-12.6,7.4],[-12.4,12.9],[-16.2,6.8],[-16.4,13.4]];
const GK0:[number,number]=[-19.25,10];
/** the passes: FLY → 2 → FLY → 1 → FLY → 1, then 1 shoots low at Gustavo (drawn; inferred) */
const PASS_SEQ=[0,2,0,1,0,1];
const T_SH=C1.fly+.5,T_CATCH=T_SH+.5;
const PASS_T=(()=>{const n=PASS_SEQ.length-1,t0=.5,t1=T_SH-.9,o:[number,number][]=[];for(let i=0;i<n;i++){const a=lerp(t0,t1,i/n),d=Math.min(.75,(t1-t0)/n*.55);o.push([a+((t1-t0)/n-d),a+(t1-t0)/n]);}return o;})();
const feet=(i:number):[number,number]=>{const p=ESP_P[i];return[p[0]-.42,p[1]-.12];};
const GATHER:V3=[-18.75,.16,9.8];
/** the strike: ≈ 3 m off his line, centre, right foot, into the empty goal (all placement inferred) */
const BS:[number,number]=[-17.0,10.1],TGT:V3=[20.1,BALL_R,10.35];
const LIVE=plantFor(BS,TGT);
const T_UP=T_CATCH+1.0,T_DROP=Math.max(T_UP+.4,C1.gus+.05),T_HIT=Math.max(T_DROP+1,C1.strikes+.3),T_S0=T_HIT-.55,T_IN=Math.max(T_HIT+1.5,C1.goal-.08),T_L=lerp(T_HIT,T_IN,.55);
const LAND:[number,number]=[lerp(BS[0],TGT[0],.52),lerp(BS[1],TGT[2],.52)];
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number;held?:boolean}{
 if(T<PASS_T[0][0]){const f=feet(PASS_SEQ[0]);return{X:f[0],Y:BALL_R,Z:f[1],flying:false,spin:0};}
 for(let i=0;i<PASS_T.length;i++){const[a,b]=PASS_T[i],f0=feet(PASS_SEQ[i]),f1=feet(PASS_SEQ[i+1]);
  if(T<a)return{X:f0[0],Y:BALL_R,Z:f0[1],flying:false,spin:0};
  if(T<b){const u=sm(a,b,T,easeOut);return{X:lerp(f0[0],f1[0],u),Y:BALL_R,Z:lerp(f0[1],f1[1],u),flying:false,spin:u*8};}}
 const sh=feet(1);
 if(T<T_SH){return{X:sh[0],Y:BALL_R,Z:sh[1],flying:false,spin:0};}
 if(T<T_CATCH){const u=sm(T_SH,T_CATCH,T,linear);return{X:lerp(sh[0],GATHER[0],u),Y:lerp(BALL_R,GATHER[1],u),Z:lerp(sh[1],GATHER[2],u),flying:true,spin:u*10};}
 if(T<T_DROP){const h=handsAt(liveG,T);return{X:h[0],Y:h[1],Z:h[2],flying:false,spin:0,held:true};}
 if(T<T_DROP+.35){const h=handsAt(liveG,T_DROP),u=sm(T_DROP,T_DROP+.35,T,easeIn);return{X:lerp(h[0],BS[0],u),Y:lerp(h[1],BALL_R,u),Z:lerp(h[2],BS[1],u),flying:false,spin:0};}
 if(T<T_HIT)return{X:BS[0],Y:BALL_R,Z:BS[1],flying:false,spin:0};
 if(T<T_L){const u=sm(T_HIT,T_L,T,linear),p=bez([BS[0],BALL_R,BS[1]],[lerp(BS[0],LAND[0],.5),3.1,lerp(BS[1],LAND[1],.5)],[LAND[0],BALL_R,LAND[1]],u);return{X:p[0],Y:p[1],Z:p[2],flying:true,spin:u*40};}
 if(T<T_IN){const u=sm(T_L,T_IN,T,t=>t*(1.3-.3*t));return{X:lerp(LAND[0],TGT[0],u),Y:BALL_R+.05*Math.abs(Math.sin(u*9))*(1-u),Z:lerp(LAND[1],TGT[2],u),flying:true,spin:40+u*30};}
 const d=sm(T_IN,T_IN+.5,T,easeOut);return{X:TGT[0]+.7*d,Y:BALL_R,Z:TGT[2]+.05*d,flying:false,spin:70};
}
/** the hold: ball tucked at the chest after the gather */
const HOLD=posed({lHipF:12,rHipF:12,lKnee:16,rKnee:16,lean:10,neckP:6,lShF:42,rShF:42,lShA:18,rShA:18,lElb:112,rElb:112,lShR:40,rShR:40,lHand:.7,rHand:.7});
/** Gustavo live: set → the low gather → up, a few steps out → drops the ball → the right-foot strike → runs out, arms up */
const liveG:Gen=T=>{
 const bz=T<T_SH?liveBall(T).Z:9.8;
 const X=key(T,mono([[0,GK0[0]],[T_CATCH+.4,GK0[0]],[T_DROP-.1,LIVE.P[0]-.6,easeIO],[T_S0,LIVE.P[0]-.6],[T_HIT,LIVE.P[0],easeIn],[T_HIT+.5,LIVE.P[0]+.6,easeOut],[C1.end,LIVE.P[0]+4.5,easeIO]]));
 const Z=T<T_CATCH?lerp(GK0[1],bz,.25):key(T,mono([[T_CATCH,9.9],[T_DROP-.1,LIVE.P[1]-.1,easeIO],[T_S0,LIVE.P[1]-.1],[T_HIT,LIVE.P[1],easeIn],[C1.end,LIVE.P[1]+.4]]));
 let pose:Pose,yaw=FACE_RIGHT;
 if(T<T_SH-.1){pose=keeperSet(T*1.2);const b=liveBall(T);yaw=yawTo(b.X-X,b.Z-Z)*.6;}
 else if(T<T_CATCH+.5){pose=keeperScoop(sm(T_SH-.1,T_CATCH+.5,T,linear));yaw=yawTo(GATHER[0]+2-X,GATHER[2]-Z)*.4;}
 else if(T<T_DROP){pose=blendPose(keeperScoop(1),HOLD,sm(T_CATCH+.5,T_UP,T,easeIO));const walk=sm(T_UP,T_DROP-.1,T)*(1-sm(T_DROP-.3,T_DROP-.1,T));if(walk>0)pose=blendPose(pose,runCycle((T-T_UP)*runCadence(.25),{speed:.25}),walk*.5);}
 else if(T<T_S0){pose=blendPose(HOLD,stand(),sm(T_DROP,T_DROP+.3,T));yaw=LIVE.yaw;}
 else if(T<T_HIT+.55){const stT=key(T,[[T_S0,.12],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,.95]],linear);pose=blendPose(stand(),strikeR(stT),sm(T_S0,T_S0+.12,T));yaw=LIVE.yaw;}
 else{const u=sm(T_HIT+.55,T_HIT+1,T,easeIO);pose=blendPose(strikeR(.95),runCycle((T-T_HIT)*runCadence(.55),{speed:.55}),u);yaw=LIVE.yaw;
  if(T>T_IN)pose=blendPose(pose,celebrate((T-T_IN)*1.1,{kind:'arms'}),sm(T_IN,T_IN+.4,T));}
 return{pose,yaw,X,Z};
};
/** Spain: keep the ball (each faces it); after the strike all five turn and chase back toward their empty goal (+X) */
const liveE=(i:number):Gen=>T=>{const p=ESP_P[i],b=liveBall(Math.min(T,T_HIT)),chase=sm(T_HIT+.15+i*.07,T_HIT+.6+i*.07,T);
 const sway=.25*Math.sin(T*1.3+i*2);let X=p[0]+sway*.4,Z=p[1]+sway;
 const run=Math.max(0,T-T_HIT-.15-i*.07),sp=i===0?6.2:5.2;X+=run>0?sp*run*chase-.5*sp*Math.min(run,.45)*chase:0;
 let pose=blendPose(stand(),posed({lean:14,lShA:18,rShA:18,lElb:34,rElb:34,lHipF:16,rHipF:12,lKnee:26,rKnee:22,neckP:-2}),.5+.3*Math.sin(T*2+i));
 const f=feet(i),hasBall=Math.hypot(b.X-f[0],b.Z-f[1])<.3&&T<T_SH;if(hasBall)pose=blendPose(pose,posed({lean:22,neckP:30,lHipF:20,rHipF:4,lKnee:30,rKnee:20,lShA:26,rShA:26,lElb:40,rElb:40}),.7);
 if(i===1&&T>T_SH-.5&&T<T_SH+.5)pose=blendPose(pose,strike(sm(T_SH-.45,T_SH+.3,T,linear)*.9,{foot:'r'}),sm(T_SH-.5,T_SH-.35,T)*(1-sm(T_SH+.3,T_SH+.5,T)));
 if(chase>0)pose=blendPose(pose,runCycle(run*runCadence(.9)+i*.2,{speed:.9}),chase);
 const yaw=chase>.5?FACE_RIGHT:yawTo(b.X-X,b.Z-Z);return{pose,yaw,X,Z};};
/** Russia's four: goal-side, facing the ball; arms up when it goes in */
const liveR=(i:number):Gen=>T=>{const p=RUS_P[i],b=liveBall(Math.min(T,T_HIT)),goal=sm(T_IN,T_IN+.4,T);
 const X=p[0]+.35*Math.sin(T*1.1+i)+ (T>T_HIT?1.4*sm(T_HIT,T_IN,T,easeIO):0),Z=p[1]+(b.Z-10)*.18;
 let pose=blendPose(backpedal(T*1.1+i*.3),stand(),.4);pose=blendPose(pose,celebrate((T-T_IN)*1.1+i*.23,{kind:'arms'}),goal);
 return{pose,yaw:T>T_HIT+.3?FACE_RIGHT:yawTo(b.X-X,b.Z-Z),X,Z};};
const liveCam=(T:number)=>({x:key(T,mono([[0,-10.8],[C1.five,-10.6],[C1.fly,-12.4],[T_CATCH+.3,-14.6],[C1.empty-.15,-14.2],[C1.empty+.4,15.6],[C1.gus-.35,15.8],[C1.gus+.25,-15.2],[T_S0,-14.6],[T_HIT+.35,-9],[T_L,6],[T_IN,16.2],[C1.six,15.8],[C1.end,15.4]]),easeInOutSine),
 zoom:key(T,mono([[0,.58],[C1.five,.58],[C1.fly,.6],[T_CATCH+.3,.62],[C1.empty-.15,.6],[C1.empty+.4,.56],[C1.gus-.35,.58],[C1.gus+.25,.64],[T_S0,.62],[T_HIT+.35,.48],[T_L,.46],[T_IN,.54],[C1.six,.58],[C1.end,.6]]),easeInOutSine),
 y:key(T,mono([[0,1090],[C1.gus+.25,1090],[T_IN,1080],[C1.end,1090]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_HIT,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.15+.2*pulse(T,C1.five,1.2),flash:pulse(T,T_IN,1.2),bulge:.55*sm(T_IN-.12,T_IN+.05,T)*(1-.6*sm(T_IN+.3,T_IN+1.2,T))+.12*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:TGT[2],by:.4});
 // "goal is empty": a yellow dashed box in Spain's empty goal mouth, pulsing; "flying keeper": a blue ring on him
 const eg=easeOutBack(sm(C1.empty,C1.empty+.35,T))*(1-sm(T_IN+.4,T_IN+.9,T));
 if(eg>.02){const pts=[proj(st,HALF,0,POST_N-.3),proj(st,HALF,2.3*eg,POST_N-.3),proj(st,HALF,2.3*eg,POST_F+.3),proj(st,HALF,0,POST_F+.3)];dashed(s,Y,[...pts,pts[0]],16,501,{dash:44});}
 const fk=liveE(0)(T);floorDashRing(s,st,B,fk.X,fk.Z,.85,12,502,easeOutBack(sm(C1.fly,C1.fly+.35,T))*(1-sm(C1.empty+.5,C1.empty+.9,T)));
 // "goal is empty": his sight line runs down the court to the empty goal; the whip pan rides it
 {const sl=sm(C1.empty-.2,C1.empty+.45,T,easeIO)*(1-sm(C1.gus+.4,C1.gus+.9,T));if(sl>.02){const g=liveG(T),pts:Pt[]=[];for(let k=0;k<=20;k++)pts.push(proj(st,lerp(g.X+.6,HALF-.4,k/20),0,lerp(g.Z,10,k/20)));dashed(s,Y,pts,16,507,{dash:60,progress:sl});if(sl>.97)arrowHead(s,Y,pts,54,508);}}
 // "Spain attack": navy dashed pass lines stay on the floor for the passes just made
 {const on=sm(C1.att,C1.att+.3,T)*(1-sm(T_SH,T_SH+.4,T));if(on>.02)PASS_T.forEach(([a],i)=>{if(T<a)return;const f0=feet(PASS_SEQ[i]),f1=feet(PASS_SEQ[i+1]);dashed(s,K,fp(st,[f0,f1]),10,510+i,{dash:30,progress:sm(a,a+.5,T),cov:.8*on});});}
 // "Gustavo": a red ring finds him
 const G=liveG(T);floorDashRing(s,st,R,G.X,G.Z,.8,12,505,easeOutBack(sm(C1.gus,C1.gus+.35,T))*(1-sm(T_S0,T_S0+.3,T)));
 // "own end": the ball's path so far, a yellow line from his spot, then an arrow head at the goal
 if(T>T_HIT){const pts:Pt[]=[];for(let k=0;k<=24;k++){const q=liveBall(lerp(T_HIT,Math.min(T,T_IN),k/24));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,14,506,{dash:44,cov:1-sm(C1.six,C1.end,T)*.6});}
 type It={z:number;draw:()=>void};const items:It[]=[];
 ESP_P.forEach((_,i)=>{const g=liveE(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,i===0?FLY:ESP(i),{detail:'low'})});});
 RUS_P.forEach((_,i)=>{const g=liveR(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,RUS(i),{detail:'low'})});});
 items.push({z:G.Z,draw:()=>athlete(s,st,liveG,T,GUS,{detail:'low',smear:T>T_HIT-.2&&T<T_HIT+.25?.1:0})});
 items.push({z:b.held?G.Z-.3:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);if(!b.held)shadow(s,g[0],g[1],r*1.15,r*.3,16,.45);
  if(b.flying&&T>T_HIT){speedLines(s,R,p[0],p[1],Math.PI,{n:4,seed:17+Math.floor(T*6),len:r*4,spread:r*.7,width:5});}
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.5:0,dir:0});
  if(T>=T_HIT&&T<T_HIT+.35)sparkBurst(s,Y,p[0],p[1],r*3,{n:9,seed:19,g:easeOut(sm(T_HIT,T_HIT+.3,T))});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 if(T>=T_IN&&T<T_IN+1.2){const p=proj(st,HALF+.4,.6,TGT[2]);sparkBurst(s,Y,p[0],p[1],160,{n:12,seed:520,g:easeOut(sm(T_IN,T_IN+.3,T))*(1-sm(T_IN+.8,T_IN+1.2,T))});}
 // "Six two": red and yellow confetti over the Russian end of the crowd
 if(T>=C1.six){const u=sm(C1.six,C1.six+2.5,T,linear),top=proj(st,0,6,BOARDS)[1];confetti(s,[R,Y,'paper'],[-2400,top-300+u*900,4800,600],26,Math.floor(T*6),{size:30});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},
 aperture(t){const{tt,tc}=clock(0,t),st=bst(liveCam(tc).x),b=liveBall(tt);return aperture(discPts(proj(st,b.X,b.Y,b.Z),Math.max(40,kAt(st,b.Z)*.5)));},still:T_HIT+.05};

// ================= chapter 2 — REPLAY: the EMPTY-NET CAMERA — low, inside Spain's goal, looking back up the court; slow motion =================
const C2={watch:A(1,'Watch again'),inside:A(1,'inside the'),ball:A(1,'The ball'),court:A(1,'whole court'),all:A(1,'all the way'),end:AUTH[1].seconds};
/** the same match world turned round: live (X, Z) → replay (X′ = Z − 10, Z′ = 20 − X): Spain's goal line at Z′ = 0, Russia's at Z′ = 40 */
const rot2=(g:Gen):Gen=>t=>{const a=g(t);return{pose:a.pose,yaw:a.yaw-Math.PI/2,X:a.Z-10,Z:HALF-a.X};};
const R_HIT=C2.ball+.15,R_IN=C2.all+.35,SLOW=(T_IN-T_HIT)/(R_IN-R_HIT);
/** replay time → live time (slow motion throughout: it starts ≈ 1 s of live time before the strike) */
const T1=(t:number)=>T_HIT+(t-R_HIT)*SLOW;
const st2:Stage={F:350,eye:1.0,cx:.25,cz:-.72};
const b2=(t:number)=>{const b=liveBall(T1(t));return{X:b.Z-10,Y:b.Y,Z:HALF-b.X,flying:b.flying,spin:b.spin};};
/** the camera: a long lens on Gustavo far away, pulling wide as the ball comes at us; the goal frame ends round the shot */
function cam2(t:number):[number,number,number]{
 const b=b2(t),p=proj(st2,b.X,b.Y,b.Z),G=rot2(liveG)(T1(t)),g=proj(st2,G.X,1,G.Z);
 const u=t<R_HIT?0:clamp(1-(b.Z-.5)/(HALF-BS[0]-.5)),z=t<R_HIT?20:lerp(20,.9,Math.pow(u,.6)),w=sm(.25,.95,u);
 const cx=lerp(t<R_HIT?g[0]:lerp(g[0],p[0],sm(R_HIT,R_HIT+.4,t)),0,w),cy=lerp(t<R_HIT?g[1]:lerp(g[1],p[1],sm(R_HIT,R_HIT+.4,t)),-20,w);
 // after the goal the lens finds him again, far away, arms up
 const back=sm(R_IN+.5,R_IN+1.7,t,easeIO);
 return[lerp(cx,g[0],back),lerp(cy,g[1]-3,back),lerp(z,13,back)];
}
/** Spain's empty goal round the lens: posts at the frame edges, the crossbar across the top, side and roof netting beside us */
function nearGoal(s:Sheet,st:Stage,t:number,bulge:number){
 const H=2,Lx=-1.5,Rx=1.5,w=.06,zs=Math.max(0,st.cz+.3)-0.001;void t;
 const mesh=new Path2D();
 for(const X of[Lx,Rx]){for(let Yh=0;Yh<=H+1e-6;Yh+=.25){const a=proj(st,X,Yh,0),b=proj(st,X,Yh,st.cz+.3);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
  for(let z=0;z>=st.cz+.3;z-=.12){const a=proj(st,X,0,z),b=proj(st,X,H,z);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}}
 for(let X=Lx;X<=Rx+1e-6;X+=.25){const a=proj(st,X,H,0),b=proj(st,X,H+.02,st.cz+.3);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 const sway=bulge*18;s.save();s.translate(0,sway);s.stroke(K,mesh,5,.45);s.restore();void zs;
 const frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(q:Pt[],n:number,vert:boolean)=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],6,{seed:31,taper:0,wobble:.6}));
  for(let k=0;k<n;k+=2){const u0=k/n,u1=(k+1)/n,P=(u:number,side:number):Pt=>vert?L2(L2(q[0],q[3],u),L2(q[1],q[2],u),side):L2(L2(q[0],q[1],u),L2(q[3],q[2],u),side);bands.addPath(polyPath([P(u0,0),P(u0,1),P(u1,1),P(u1,0)],true));}};
 for(const X of[Lx,Rx])bar([proj(st,X-w,0,0),proj(st,X+w,0,0),proj(st,X+w,H,0),proj(st,X-w,H,0)],10,true);
 bar([proj(st,Lx,H+w,0),proj(st,Rx,H+w,0),proj(st,Rx,H-w,0),proj(st,Lx,H-w,0)],14,false);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,net=pulse(t,R_IN,.6),hit=pulse(t,R_HIT,.4);
  const[cx,cy,z]=cam2(t);cam(s,cx+4*net*Math.sin(t*70)/z,cy+3*hit*Math.sin(t*90)/z,z);
  const b=b2(tt),T=T1(tt),goal=tt>=R_IN;
  arena(s,st,{t:tt,gz:40,cheer:goal?.9:.2,flash:pulse(tt,R_IN,1.2)});
  // "whole court": a yellow dashed measuring line along the floor from his spot to the goal line under us, ticks at halfway
  const mc=sm(C2.court,C2.court+.9,tt,easeOut)*(1-sm(C2.all+.2,C2.all+.6,tt));
  if(mc>.02){const X0=BS[1]-10+.9,pts:Pt[]=[];for(let k=0;k<=16;k++)pts.push(proj(st,X0,0,lerp(HALF-BS[0],.4,k/16)));dashed(s,Y,pts,14,601,{dash:40,progress:mc});
   const tk=new Path2D();const h=proj(st,X0-.5,0,HALF),h2=proj(st,X0+.5,0,HALF);tk.addPath(ribbon([h,h2],10,{seed:602,taper:0,wobble:.5}));s.knockout(tk);s.fill(Y,tk,mc);}
  // "The ball": a red ring round it at his feet before the strike
  floorDashRing(s,st,R,BS[1]-10,HALF-BS[0],.4,1.5,603,easeOutBack(sm(C2.ball-.3,C2.ball,tt))*(1-sm(R_HIT+.3,R_HIT+.7,tt)));
  // the flight line, drawn as the ball comes
  if(tt>R_HIT){const pts:Pt[]=[];for(let k=0;k<=22;k++){const q=b2(lerp(R_HIT,Math.min(tt,R_IN),k/22));pts.push(proj(st,q.X,q.Y,Math.max(q.Z,.3)));}{const[,,zz]=cam2(tt);dashed(s,Y,pts,16/zz,604,{dash:60/zz});}}
  type It={z:number;draw:()=>void};const items:It[]=[];
  ESP_P.forEach((_,i)=>{const g=rot2(liveE(i));items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,i===0?FLY:ESP(i),{dt:SLOW/12})});});
  RUS_P.forEach((_,i)=>{const g=rot2(liveR(i));items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,RUS(i),{dt:SLOW/12})});});
  const G2=rot2(liveG);items.push({z:G2(T).Z,draw:()=>athlete(s,st,G2,T,GUS,{dt:SLOW/12})});
  if(b.Z>.05)items.push({z:b.Z-.05,draw:()=>{const r=ballAt(s,st,b.X,b.Y,b.Z,605,{rot:b.spin,min:34/z,mag:z});
   // a yellow dashed ring rides with the ball so young eyes can follow it down the court
   if(tt>R_HIT-.3){const rr=r.r+60/z,q:Pt[]=[];for(let i=0;i<20;i++){const a2=i/20*TAU+tt*2;q.push([r.p[0]+Math.cos(a2)*rr,r.p[1]+Math.sin(a2)*rr]);}const rp=ribbon([...q,q[0]],13/z,{seed:609,close:true,wobble:.6,gaps:dashGaps(q,30/z)});s.knockout(rp);s.fill(Y,rp);}}});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  const bulge=sm(R_IN-.05,R_IN+.1,tt)*(1-sm(R_IN+.3,R_IN+1.1,tt));
  nearGoal(s,st,tt,bulge);
  // the ball arrives past the posts into the net beside the lens (drawn over the frame)
  if(b.Z<=.05&&tt<R_IN+1.2){const p=proj(st,b.X,b.Y+.1,.15),r=kAt(st,.15)*BALL_R*(1-.3*sm(R_IN,R_IN+1,tt));ball(s,p[0],p[1],r,607,{rot:tt*3});}
  if(tt>=R_IN&&tt<R_IN+1.2){const p=proj(st,b.X,.5,.3);sparkBurst(s,Y,p[0],p[1],260,{n:12,seed:608,g:easeOut(sm(R_IN,R_IN+.3,tt))*(1-sm(R_IN+.8,R_IN+1.2,tt))});}
  if(tt>=R_IN+.3){const u=sm(R_IN+.3,R_IN+2.6,tt,linear);confetti(s,[R,Y,'paper'],[-700,-600+u*900,1400,500],22,Math.floor(tt*6),{size:18});}
 },
 aperture(t0){const{tt}=clock(1,t0),T=T1(tt),G2=rot2(liveG);return aperture(chestPts(st2,G2(T),.35));},
 still:R_HIT+.9,
};

// ================= chapter 3 — HOW HE COMMANDS (demonstration): the KEEPER'S-EYE camera over his right shoulder =================
const C3={how:A(2,'How does'),court:A(2,'whole court'),talks:A(2,'so he talks'),left:A(2,'Left'),mark:A(2,'Mark him'),up:A(2,'Step up'),short:A(2,'Short'),team:A(2,'his team'),end:AUTH[2].seconds};
const st3:Stage={F:1400,eye:2.05,cx:1.0,cz:-1.6};
const GK3:[number,number]=[0,1.25];
/** his four (blue bibs): L = left, M = the marker, F1/F2 the front pair; the attackers (paper): the carrier, a runner into the left channel, a free man right */
const D_A:[number,number][]=[[-2.6,6.2],[2.8,6.8],[-1.1,10.6],[1.8,11.4]];
const D_B:[number,number][]=[[-4.8,7.0],[4.2,9.0],[-1.3,12.8],[1.9,13.6]];
const D_UP=2.2;
const carrier3=(t:number):[number,number]=>[lerp(.6,-.2,sm(0,C3.end,t,easeIO)),lerp(17.5,16.4,sm(0,C3.end,t,easeIO))];
const runnerL=(t:number):[number,number]=>[lerp(-3.6,-6.2,sm(C3.left-1.2,C3.left+.8,t,easeIO)),lerp(12.5,9.2,sm(C3.left-1.2,C3.left+.8,t,easeIO))];
const freeR=(t:number):[number,number]=>[lerp(6.4,5.2,sm(C3.mark-1,C3.mark+1,t,easeIO)),lerp(12.8,10.6,sm(C3.mark-1,C3.mark+1,t,easeIO))];
const dMove=(i:number,t:number):[number,number]=>{const a=D_A[i],b=D_B[i];let u=0;if(i===0)u=sm(C3.left+.1,C3.left+.9,t,easeIO);else if(i===1)u=sm(C3.mark+.1,C3.mark+1,t,easeIO);
 const up=sm(C3.up+.1,C3.up+1.1,t,easeIO)*D_UP*(i===1?.3:1);return[lerp(a[0],i<2?b[0]:a[0],u),lerp(a[1],i<2?b[1]:a[1],u)+up];};
const demoD=(i:number):Gen=>t=>{const[X,Z]=dMove(i,t),[X0,Z0]=dMove(i,t-.15),v=Math.hypot(X-X0,Z-Z0)/.15,moving=clamp(v/2.5),cr=carrier3(t);
 const pose=blendPose(blendPose(stand(),backpedal(t*1.2+i*.3),.5),runCycle(t*runCadence(.6)+i*.25,{speed:.6}),moving);
 return{pose,yaw:moving>.5?yawTo(X-X0,Z-Z0):yawTo(cr[0]-X,cr[1]-Z),X,Z};};
const demoO=(i:number):Gen=>t=>{const p=i===0?carrier3(t):i===1?runnerL(t):freeR(t),q=i===0?carrier3(t-.15):i===1?runnerL(t-.15):freeR(t-.15),v=Math.hypot(p[0]-q[0],p[1]-q[1])/.15,m=clamp(v/2.5);
 const pose=blendPose(stand(),runCycle(t*runCadence(.6)+i*.4,{speed:.6}),i===0?.35:m);return{pose,yaw:m>.4?yawTo(p[0]-q[0],p[1]-q[1]):FACE_CAMERA,X:p[0],Z:p[1]};};
/** his gestures: set → looks round → hands cupped (talk) → left arm points left → right arm points right → both arms push forward → cupped */
const TALK=posed({lHipF:14,rHipF:14,lKnee:22,rKnee:22,lean:4,lShF:112,rShF:112,lShA:36,rShA:36,lElb:138,rElb:138,lHand:1,rHand:1,neckP:-16});
const POINT_R=posed({lHipF:14,rHipF:18,lKnee:24,rKnee:24,lean:8,rShF:80,rShA:40,rElb:6,rHand:1,lShF:26,lShA:24,lElb:44,neckY:-14,twist:-12});
const POINT_L=mirrorPose(POINT_R);
const PUSH=posed({lHipF:30,rHipF:30,lHipA:10,rHipA:10,lKnee:40,rKnee:40,lean:14,lShF:96,rShF:96,lShA:16,rShA:16,lElb:12,rElb:12,lHand:1,rHand:1,neckP:-6});
const demoG:Gen=t=>{const set=keeperSet(t*1.1);
 const pose=keyPoses(t,monoP([[0,set],[C3.talks-.2,set],[C3.talks+.1,TALK],[C3.left-.2,TALK],[C3.left+.1,POINT_L],[C3.mark-.2,POINT_L],[C3.mark+.1,POINT_R],[C3.up-.2,POINT_R],[C3.up+.15,PUSH],[C3.short-.2,PUSH],[C3.short+.1,TALK],[C3.team,TALK],[C3.team+.4,set],[C3.end,set]]));
 const look=t<C3.court?0:t<C3.talks?.55*Math.sin(sm(C3.court,C3.talks,t)*TAU):t<C3.left?0:t<C3.mark?.45:t<C3.up?-.45:0;
 return{pose,yaw:FACE_AWAY+look,X:GK3[0]+.15*Math.sin(t*1.1),Z:GK3[1]};};
const headAt=(st:Stage,g:Gen,t:number):Pt=>{const a=g(t),sk=solve(a.pose,BUILD_G,placeAt(a.X,a.Z,a.yaw)),h=toMine(sk.head);return proj(st,h[0],h[1]+.05,h[2]);};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  camPath(s,t,[[0,-80,160,1.0],[C3.court,-20,140,.94],[C3.talks,-200,180,1.04],[C3.left,-320,190,1.0],[C3.mark,120,190,1.0],[C3.up,-40,150,.94],[C3.short,-180,180,1.02],[C3.team,-60,160,.95],[C3.end,-60,160,.95]]);
  arena(s,st,{t:tt,gz:40,cheer:0,flash:0});
  const D=D_A.map((_,i)=>demoD(i)(tt));
  // "whole court": a navy dashed sight fan from him across the court
  const fan=sm(C3.court-.1,C3.court+.5,tt,easeOut)*(1-sm(C3.talks+.2,C3.talks+.6,tt));
  if(fan>.02){const h=proj(st,GK3[0],0,GK3[1]+.6);for(const[j,end] of([[0,[-8.5,18]],[1,carrier3(tt)],[2,[8.5,18]]] as [number,[number,number]][])){const e=proj(st,end[0],0,end[1]);dashed(s,K,[h,L2(h,e,.5),e],12,700+j,{dash:34,progress:fan,cov:.85});}}
  // "Left!": a blue arrow sends L across to the left channel (the runner's lane lit red)
  const la=sm(C3.left,C3.left+.6,tt,easeOut)*(1-sm(C3.up,C3.up+.3,tt));
  if(la>.02){arrow(s,B,fp(st,[D_A[0],L2(D_A[0],D_B[0],.5) as [number,number],D_B[0]]),13,710,la);const r1=runnerL(tt);floorDashRing(s,st,R,r1[0],r1[1],.7,10,712,la);}
  // "Mark him!": a red dashed tether ties M to the free man
  const mk=sm(C3.mark,C3.mark+.5,tt,easeOut)*(1-sm(C3.team+.2,C3.team+.6,tt));
  if(mk>.02){const f=freeR(tt),m=D[1];dashed(s,R,fp(st,[[m.X,m.Z],[f[0],f[1]]]),12,720,{dash:26,progress:mk});floorDashRing(s,st,R,f[0],f[1],.7,10,722,mk);}
  // "Step up!": four blue arrows push the line up the court together
  const up=sm(C3.up,C3.up+.5,tt,easeOut)*(1-sm(C3.short+.4,C3.short+.8,tt));
  if(up>.02)D_A.forEach((_,i)=>{if(i===1)return;const b=dMove(i,C3.up),e:[number,number]=[b[0],b[1]+D_UP];arrow(s,B,fp(st,[[b[0],b[1]+.4],[e[0],e[1]-.2]]),11,730+i,up);});
  // "his team": the four ringed in blue and joined by a navy dashed line — one unit
  const tm=easeOutBack(sm(C3.team,C3.team+.4,tt));
  if(tm>.02){const ord=[0,2,3,1].map(i=>[D[i].X,D[i].Z] as [number,number]);dashed(s,K,fp(st,ord),10,740,{dash:28,progress:Math.min(1,tm)});D.forEach((d,i)=>floorDashRing(s,st,B,d.X,d.Z,.7,10,742+i,tm));}
  type It={z:number;draw:()=>void};const items:It[]=[];
  D.forEach((d,i)=>{items.push({z:d.Z,draw:()=>athlete(s,st,demoD(i),tt,BIB(i),{detail:'mid'})});});
  for(let i=0;i<3;i++){const g=demoO(i),o=g(tt);items.push({z:o.Z,draw:()=>athlete(s,st,g,tt,OPP(i),{detail:'mid'})});}
  const cr=carrier3(tt);items.push({z:cr[1]-.3,draw:()=>{ballAt(s,st,cr[0]-.1,BALL_R,cr[1]-.45,750,{rot:tt*3});}});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  athlete(s,st,demoG,tt,GUS_T,{detail:'high'});
  // the shouts, from his mouth toward each target
  const h=headAt(st,demoG,tt),toP=(p:[number,number]):Pt=>proj(st,p[0],1.2,p[1]);
  shout(s,h,[h[0],h[1]-400],tt,C3.talks,300,760);
  shout(s,h,toP([D[0].X,D[0].Z]),tt,C3.left,300,770,{line:true});
  shout(s,h,toP([D[1].X,D[1].Z]),tt,C3.mark,300,780,{line:true});
  shout(s,h,toP([0,10]),tt,C3.up,320,790);
  for(let k=0;k<3;k++)shout(s,h,toP([[-4,10],[0,12],[4,10]][k] as [number,number]),tt,C3.short+k*.3,240,800+k*10);
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(discPts(headAt(st3,demoG,tt),150));},
 still:C3.mark+1,
};

// ================= chapter 4 — YOUR TURN: the DEFENDER'S-EYE camera — you are a teammate, facing your goleiro =================
const C4={turn:A(3,'Your turn'),shout:A(3,'Shout clear'),mates:A(3,'your teammates'),where:A(3,'where to be'),end:AUTH[3].seconds};
const GZ4=11,K4:[number,number]=[0,GZ4-1.2];
const SPOT_YOU:[number,number]=[1.9,6.3],SPOT_MATE:[number,number]=[-1.9,7.9],MATE0:[number,number]=[-.7,5.6];
const st4=(t:number):Stage=>{const u=sm(C4.mates,C4.mates+1.4,t,easeIO);return{F:1000,eye:1.62,cx:lerp(.5,1.35,u),cz:lerp(1.5,2.8,u)};};
const k4:Gen=t=>{const set=keeperSet(t*1.3);
 let pose=keyPoses(t,monoP([[0,set],[C4.shout-.25,set],[C4.shout+.05,TALK],[C4.shout+.7,TALK],[C4.shout+1.0,POINT_L],[C4.mates-.1,POINT_L],[C4.mates+.2,POINT_R],[C4.where-.3,POINT_R],[C4.where,set]]));
 if(t>C4.where+.3)pose=blendPose(pose,celebrate((t-C4.where-.3)*1.1,{kind:'arms'}),sm(C4.where+.3,C4.where+.7,t));
 return{pose,yaw:FACE_CAMERA,X:K4[0],Z:K4[1]};};
const mate4:Gen=t=>{const u=sm(C4.mates+.1,C4.mates+1.3,t,easeIO),X=lerp(MATE0[0],SPOT_MATE[0],u),Z=lerp(MATE0[1],SPOT_MATE[1],u),mv=sm(C4.mates+.1,C4.mates+.3,t)*(1-sm(C4.mates+1.1,C4.mates+1.3,t));
 const pose=blendPose(blendPose(stand(),backpedal(t),.3),runCycle(t*runCadence(.6),{speed:.6}),mv);return{pose,yaw:mv>.4?yawTo(SPOT_MATE[0]-MATE0[0],SPOT_MATE[1]-MATE0[1]):FACE_AWAY+.3,X,Z};};
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4(t),bob=.02*Math.sin(t*9)*sm(C4.mates,C4.mates+.2,t)*(1-sm(C4.mates+1.2,C4.mates+1.4,t));
  st.eye+=bob;
  camPath(s,t,[[0,100,170,1.3],[C4.shout,40,120,1.42],[C4.mates,0,170,1.25],[C4.where,-150,220,1.12],[C4.end,-150,220,1.14]]);
  arena(s,st,{t:tt,gz:GZ4,cheer:.6*pulse(tt,C4.where+.2,2),flash:pulse(tt,C4.where+.2,1)});
  // the two spots: dashed rings on "Shout clear", filling on "where to be"
  const ring=easeOutBack(sm(C4.shout+.4,C4.shout+.8,tt)),fill=sm(C4.where,C4.where+.4,tt,easeOut);
  floorDashRing(s,st,Y,SPOT_YOU[0],SPOT_YOU[1],.7,12,901,ring);floorDashRing(s,st,Y,SPOT_MATE[0],SPOT_MATE[1],.7,12,902,ring);
  floorSpot(s,st,Y,SPOT_YOU[0],SPOT_YOU[1],.62,.8*fill,903);floorSpot(s,st,Y,SPOT_MATE[0],SPOT_MATE[1],.62,.8*fill,904);
  // "your teammates": arrows to the spots
  const ar=sm(C4.mates-.1,C4.mates+.5,tt,easeOut)*(1-sm(C4.where,C4.where+.3,tt));
  if(ar>.02){arrow(s,B,fp(st,[[MATE0[0]-.2,MATE0[1]+.3],[SPOT_MATE[0]+.4,SPOT_MATE[1]-.2]]),12,910,ar);}
  athlete(s,st,k4,tt,GUS_T,{detail:'high'});
  const m=mate4(tt);if(m.Z>st.cz+.6)athlete(s,st,mate4,tt,BIB(1),{detail:'high'});
  const kh=headAt(st,k4,tt),sp=(p:[number,number]):Pt=>proj(st,p[0],.2,p[1]);
  shout(s,kh,[kh[0],kh[1]-300],tt,C4.shout,210,920);
  shout(s,kh,sp(SPOT_MATE),tt,C4.shout+1.0,210,930,{line:true});
  shout(s,kh,sp(SPOT_YOU),tt,C4.mates+.2,210,940,{line:true});
  // "where to be": a big tick beside the goal
  const tk=easeOutBack(sm(C4.where+.3,C4.where+.7,tt));if(tk>.02){const c=proj(st,-2.8,2.6,GZ4);tick(s,c,150*tk,950);}
 },
 aperture(t0){const{tt,tc}=clock(3,t0);return aperture(discPts(headAt(st4(tc),k4,tt),120));},
 still:C4.where+.8,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'gustavo-lobo-futsal-signature',format:'futsal',title:'Gustavo Lobo, the commanding goleiro',theme:'Shout clear instructions so your teammates know where to be.',
 ageNote:'For players aged 7–12: the 2016 World Cup quarter-final goal is real; chapters 3 and 4 are demonstrations of the lesson.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a yellow shout-burst pops at the touch point with red sound arcs; reduced motion = the burst at rest. */
 touch(s,x,y,age,seed){
  const u=age<=0?.3:clamp(age/.8);shout(s,[x-60,y+20],[x+200,y-40],u*1.2,0,150,seed);
 },
};
export default film;
