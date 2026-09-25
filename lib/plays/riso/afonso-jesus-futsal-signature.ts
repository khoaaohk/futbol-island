/** Afonso Jesus — "the last-man block": a signature-move riso film (iconic plays, FUTSAL; Afonso is a fixo, the last defender).
 *
 * WHO: Afonso José Maria Basto de Jesus (b. 6 Jan 1998, Lisbon; 1.76 m), a futsal DEFENDER (fixo) raised at Sporting CP (youth 2011–16,
 *  first team 2015–16) who has played for Benfica since 2016; Portugal: world champion 2021, European champion 2022, Finalissima 2022
 *  (card bio: "Portuguese fixo raised at Sporting who became a Benfica mainstay"). He has not played for Barcelona.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the last-man block — not one match. No written source we could
 *  reach describes ONE dated Afonso block (UEFA's match page is a script shell; Wikipedia and UEFA's match data give goals, cards and
 *  line-ups, not blocks), so the film follows the brief's honest FALLBACK: the real-match chapters show ONLY confirmed things from a real,
 *  documented big match of his, and the block itself is a separate, clearly labelled demonstration ("Watch how he does it", training
 *  kit, no crowd), never staged inside that match.
 *  The match: UEFA Futsal EURO 2022 QUARTER-FINAL, 31 Jan 2022, Ziggo Dome, Amsterdam: Portugal 3–2 Finland — the fixo scored TWICE
 *  (3'38", 14'47"). It is used by no other futsal film (Zicky Té: the semi-final; André Coelho: the final; Edu: the 2022 Finalissima final,
 *  where Afonso scored the equaliser — left to Edu's film; Pany Varela: the 2021 World Cup final; the EURO 2026 final/SF/QF by others).
 *  1  LIVE (broadcast camera, main stand, real time): the camera is up on the hanging board: 0–0 → 1–0 (Afonso 3'38") → 1–1 (Hosio 9'30")
 *     → 2–1 (Afonso 14'47"). Then it tilts down to the court: Afonso runs off celebrating, team-mates chase him, Finland's heads drop.
 *     No goal is staged and no ball is shown. The crowd is thin (UEFA: attendance 554).
 *  2  FULL TIME (a closer, lower TV angle): the board prints 3–2 at 40:00 (Autio 26'54", Miguel Ângelo 29'14"); the Portugal group jumps,
 *     Afonso (#4) front; Portugal are into the semi-final and went on to win EURO 2022 (a cup STAMP, not a trophy scene — the cup was
 *     lifted after the final on 6 Feb, not at this match).
 *  3  HOW HE DOES IT (demonstration; no match claimed; Afonso in a red training top, the attacker in a yellow bib, a navy-kitted keeper, no
 *     crowd): an attacker runs at goal; Afonso is the last defender (a red "last line" across the court); he stays on his feet (yellow ring),
 *     slides across into the line of the shot (red dashed line ball → goal), arms tucked behind his back, and the shot hits his body.
 *  4  PRACTISE (lesson from the entry's `lesson`: "Stay on your feet and block the shot with your body."): three cards (stay, line, block)
 *     and a tick, over the same demonstration.
 * Sources (written; fetched once with curl, generic UA, 5 s apart, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Afonso Jesus" (raw, Sep 2026; wiki-afonso-jesus.txt): full name, born 6 Jan 1998 in Lisbon, 1.76 m, defender, Benfica #4;
 *    youth AD Marista, Sporting CP 2011–16; Sporting 2015–16, Benfica 2016–; honours incl. World Cup 2021, EURO 2022, Finalissima 2022.
 *    — https://en.wikipedia.org/wiki/Afonso_Jesus
 *  - Wikipedia, "UEFA Futsal Euro 2022" (raw, cached wiki-futsal-euro-2022.txt): QF 31 Jan 2022, Ziggo Dome, Amsterdam, Portugal 3–2
 *    Finland; goals Afonso Jesus 3'38" and 14'47", Miguel Ângelo 29'14"; Finland Hosio 9'30", Autio 26'54"; attendance 554; Portugal
 *    beat Russia 4–2 in the final. — https://en.wikipedia.org/wiki/UEFA_Futsal_Euro_2022
 *  - UEFA match data for match 2034396 (match.uefa.com/v5/matches/2034396/lineups and /events; uefa-api-2034396-*.json): Portugal the
 *    home side with shirt colour GREEN (#00FF00; for comparison the same feed gives Portugal RED in the final, match 2034402), Finland
 *    WHITE (#FFFFFF); Afonso Jesus #4, on the bench at kick-off (futsal's rolling subs — he scored at 3'38"); the same goal times and
 *    running score; his yellow card at 22'51" (not shown). — https://www.uefa.com/futsaleuro/match/2034396--portugal-vs-finland/
 *  - UEFA.com match page 2034396 was fetched but carries no report text (script-rendered).
 * CONFIRMED: competition, round, date, venue, attendance (a thin crowd), the score line (1–0 → 1–1 → 2–1 → 2–2 → 3–2) and the goal times,
 *  Afonso's two goals and his shirt number (4), Portugal in green shirts and Finland in white, Portugal's EURO 2022 title a week later;
 *  that he is a fixo/defender, 1.76 m, Lisbon-born, Sporting-raised, at Benfica. The teaching point is the card's own lesson.
 * INFERRED (never named in the narration): Portugal's shorts and socks (drawn navy / green) and Finland's (navy / white); Finland's keeper
 *  in yellow; the court colour (a slate-blue screen), the board's look and where it hangs; where on the court the celebration happens and
 *  who is where; Afonso's short dark hair and stubble (lib/town/playerAppearance.json); HOW the goals were scored is unknown and
 *  deliberately not shown. Chapters 3–4 demonstrate the last-man block (how a fixo does it), not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the slide across and the strike). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps
 * library z → −Z (as in the approved Zicky Té film).
 * Timing: the SCRIPT's cues are estimated until the lead voices it; `authored()` maps each chapter's recorded clock through the cue
 * anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (lights, bib, rings, ball flight), red (diagram lines, the training top, posts), GREEN (Portugal's shirts that day — the
 *  plate that replaces blue, as in the Guitta / Cardinal films), navy (key line, court screen, stands, shorts).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; a sparse crowd; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All
 * randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,keeperSet,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the Euro 2022 quarter-final',text:'Euro 2022, the quarter-final against Finland. Afonso Jesus, Portugal’s fixo, scores early. Finland equalise, then Afonso scores again! Two one!',tail:3,
  cues:['Euro 2022','against Finland','Afonso Jesus','scores early','Finland equalise','then Afonso','Two one'],heads:{'Euro 2022':'Quarter-final 2022','scores early':'1–0','Finland equalise':'1–1','Two one':'2–1'}},
 {label:'Into the semi-final',text:'Final whistle: three two! Portugal are into the semi-final, and they go on to win Euro 2022!',tail:2.2,
  cues:['Final whistle','three two','Portugal are','into the','they go on','win Euro'],heads:{'three two':'3–2','into the':'Semi-final','win Euro':'Champions'}},
 {label:'How he does it',text:'His card move is the last-man block. Watch how he does it. An attacker runs at goal, and Afonso is the last defender. He stays on his feet, gets his body in line, and blocks the shot!',tail:2,
  cues:['His card move','Watch how','An attacker','Afonso is','He stays','gets his body','blocks the shot'],heads:{'His card move':'Last-man block','blocks the shot':''}},
 {label:'Practise it',text:'Your turn: stay on your feet, get in line, and block it with your body!',tail:2.8,
  cues:['Your turn','stay on','get in line','block it'],heads:{'Your turn':'Stay, line, block','block it':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/afonso-jesus-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/afonso-jesus-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/afonso-jesus-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('afonso: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('afonso: no cue '+w);return c.at;};
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
/** a dashed hand-drawn line; on the court it is knocked out to paper first so the ink prints clean (no overprint) */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
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
const FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
/** Afonso: 1.76 m, Lisbon-born (Wikipedia); short dark hair, stubble, light skin (playerAppearance.json). Match: Portugal GREEN shirt #4
 * (UEFA match data), shorts navy and socks green (inferred). Demonstration: a red training top, no number (no match claimed). */
const SKIN_A:InkFill[]=[[Y,.38],[R,.22]];
const BUILD={height:1.76,bulk:1.04};
const AFONSO:AthleteStyle={shirt:G,shorts:K,socks:G,boots:K,skin:SKIN_A,hair:K,line:K,trim:'paper',number:4,numberInk:'paper',hairStyle:'short',build:BUILD,seed:4};
const AFONSO_T:AthleteStyle={...AFONSO,shirt:R,socks:K,number:null,seed:5};
const SKINS:InkFill[][]=[[[Y,.42],[R,.28]],[[Y,.35],[R,.2]],[[Y,.46],[R,.36],[K,.14]],[[Y,.4],[R,.24]]];
const POR=(n:number):AthleteStyle=>({shirt:G,shorts:K,socks:G,boots:K,skin:SKINS[n%4],hair:K,line:K,trim:'paper',hairStyle:n%3?'short':'bald',build:{height:1.7+hash(n,3)*.14},seed:20+n});
/** Finland: white shirts (UEFA match data), navy shorts, white socks (inferred) */
const FIN=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.3],[R,.18]],hair:n%2?[Y,.9]:K,line:K,trim:K,hairStyle:n%2?'short':'curly',build:{height:1.74+hash(n,4)*.12},seed:40+n});
/** Finland's keeper — yellow (inferred) */
const FIN_GK:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.3],[R,.18]],hair:[Y,.9],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:62};
/** the demonstration attacker (yellow training bib) and keeper (navy) — neutral, no team claimed in chapters 3–4 */
const DEMO_A:AthleteStyle={shirt:[Y,.9],shorts:K,socks:K,boots:K,skin:SKINS[2],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.78,bulk:1.02},seed:77};
const DEMO_K:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:SKINS[1],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:78};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact (library coords, place at the origin) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),{height:1.78},{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}
/** the fixo's poses (library): READY = low, square, on the balls of the feet; BLOCK = upright and square on his feet, knees soft, both arms
 * tucked BEHIND his back (no handball), chin down, eyes on the ball; HIT = the ball strikes his thigh — squash, a flinch, shoulders turn */
const READY=posed({lHipF:26,rHipF:26,lKnee:46,rKnee:46,lHipA:14,rHipA:14,lAnk:-8,rAnk:-8,lean:18,pitch:6,neckP:4,lShA:24,rShA:24,lShF:10,rShF:10,lElb:52,rElb:52});
const BLOCK=posed({lHipF:16,rHipF:16,lKnee:26,rKnee:26,lHipA:12,rHipA:12,lAnk:-4,rAnk:-4,lean:10,pitch:3,neckP:18,lShF:-38,rShF:-38,lShA:12,rShA:12,lElb:74,rElb:74});
const HIT=posed({lHipF:12,rHipF:22,lKnee:34,rKnee:30,lHipA:12,rHipA:14,lean:22,pitch:-4,twist:-18,neckP:30,neckY:-20,lShF:-44,rShF:-30,lShA:18,rShA:22,lElb:80,rElb:66,squash:-.06});

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

// ---------------- the arena: the stands (shared); `fans` = share of seats taken (554 on the night: a thin crowd; 0 = training) ----------------
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,fans=.16){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 // empty seats: small paper seat-backs in rows (they read as an arena with room to spare)
 const seats=new Path2D(),heads=new Path2D(),grn=new Path2D(),reds=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3);
   if(hash(i,7)>fans){if(r%2===0)seats.rect(x-rowH*.18,y-rowH*.05,rowH*.36,rowH*.16);continue;}
   const jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.45)grn.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.6)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else seats.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.knockout(seats,.5);s.fill(Y,heads,.6);s.fill(G,grn);s.fill(R,reds);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the court floor: slate (a navy screen, colour inferred) with a lighter sheen band; run-off darker */
function floor(s:Sheet,court:Path2D,runoff:Path2D,sheen?:Path2D){s.fill(K,runoff,.78);s.knockout(court,.25);s.fill(K,court,.46);if(sheen)s.knockout(sheen,.1);}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Finland's goal at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 floor(s,polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true),rectPath(-span,wall,span*2,span),polyPath(floorQuad(st,-20,6,20,13),true));
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X+6,GOAL_X+10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(G,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx,.16);
 sideGoal(s,st);o.keeper?.();sidePosts(s,st);
}
function sideGoal(s:Sheet,st:Stage){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>proj(st,GOAL_X-lerp(Db,Dt,Yh/H),Yh,Z);
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

// ---- END-ON court (camera looks along +Z): goal centre (0, GZ), wall behind it ----
const GZ=11,WALLZ=13.4;
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;goal?:boolean;centre?:number;fans?:number};
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0,goal:withGoal=true,centre,fans=.16}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 const lineZ=centre??GZ;floor(s,polyPath(floorQuad(st,-10,-30,10,lineZ+(withGoal?0:10)),true),rectPath(-span,wall,span*2,span));
 const lines=new Path2D();
 if(withGoal){const arcPts:Pt[]=[];
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,GZ],[10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts,.05),true));
  lines.addPath(polyPath(floorRing(st,0,GZ-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,GZ-10,.12,12),true));}
 else if(centre!==undefined){const cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,centre+Math.sin(a)*3]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,centre],[10,centre]],.05),true));lines.addPath(polyPath(floorStrip(st,cc,.05),true));lines.addPath(polyPath(floorRing(st,0,centre,.14,12),true));}
 lines.addPath(polyPath(floorStrip(st,[[-10,-30],[-10,lineZ+(withGoal?0:10)]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,-30],[10,lineZ+(withGoal?0:10)]],.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(G,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx,fans);
 if(withGoal){goalEnd(s,st,bulge,bx,by);o.keeper?.(st);postsEnd(s,st);}
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

// ---------------- the hanging scoreboard (a riso seven-segment board; score + match clock) ----------------
const SEG:Record<string,number[]>={'0':[1,1,1,1,1,1,0],'1':[0,1,1,0,0,0,0],'2':[1,1,0,1,1,0,1],'3':[1,1,1,1,0,0,1],'4':[0,1,1,0,0,1,1],'5':[1,0,1,1,0,1,1],'6':[1,0,1,1,1,1,1],'7':[1,1,1,0,0,0,0],'8':[1,1,1,1,1,1,1],'9':[1,1,1,1,0,1,1]};
const SEGL:[Pt,Pt][]=[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[1,2]],[[0,2],[1,2]],[[0,1],[0,2]],[[0,0],[0,1]],[[0,1],[1,1]]];
function digits(path:Path2D,str:string,x:number,y:number,h:number,seed:number,sy=1):number{
 const w=h*.5,gap=h*.26,lw=h*.13;let cx=x;
 for(const ch of str){
  if(ch===':'){for(const dy of[.6,1.4])path.addPath(polyPath(blob(cx+lw*.6,y+dy*h/2,lw*.62,lw*.62,seed+dy*7,{n:10}),true));cx+=lw*1.2+gap;continue;}
  const on=SEG[ch];if(!on){cx+=w+gap;continue;}
  if(ch==='1')cx-=w*.55;
  on.forEach((v,i)=>{if(!v)return;const[a,b]=SEGL[i],p:Pt[]=[[cx+a[0]*w,y+h/2+(a[1]-1)*h/2*sy],[cx+b[0]*w,y+h/2+(b[1]-1)*h/2*sy]];path.addPath(ribbon(p,lw,{seed:seed+i,taper:0,wobble:.4}));});
  cx+=w+gap;}
 return cx-x-gap;
}
type Board={home:number;away:number;clock:string;flip:number;glow:number;blank?:boolean};
/** the board, flat to the camera, centred at sheet point c, k units per metre (6 m × 3 m); Portugal green swatch, Finland's white-and-navy cross */
function scoreboard(s:Sheet,c:Pt,k:number,b:Board,seed:number){
 const W=6*k,H=3*k,x0=c[0]-W/2,y0=c[1]-H/2,box=handCut([[x0,y0],[x0+W,y0],[x0+W,y0+H],[x0,y0+H]],seed,k*.05,k*.9);
 const cab=new Path2D();for(const u of[.18,.82])cab.addPath(ribbon([[x0+W*u,y0],[x0+W*u+(u-.5)*k*.6,y0-k*9]],Math.max(2,k*.04),{seed:seed+2,taper:0,wobble:.5}));s.fill(K,cab,.8);
 if(b.glow>.02)s.fill(Y,polyPath(blob(c[0],c[1],W*.62*(1+.08*b.glow),H*.75*(1+.1*b.glow),seed+3,{amp:.04,n:28}),true),.35*b.glow);
 const bp=polyPath(box,true);s.knockout(bp);s.fill(K,bp,.92);s.fill(G,ribbon([...box,box[0]],k*.09,{seed:seed+4,close:true,wobble:.6}));
 const sw=k*.9,sh=k*.62,ly=y0+H*.2;
 const pr=polyPath(handCut([[x0+k*.35,ly],[x0+k*.35+sw,ly],[x0+k*.35+sw,ly+sh],[x0+k*.35,ly+sh]],seed+5,k*.02,k*.4),true);s.knockout(pr);s.fill(G,pr);
 const ax=x0+W-k*.35-sw,ap=polyPath(handCut([[ax,ly],[ax+sw,ly],[ax+sw,ly+sh],[ax,ly+sh]],seed+6,k*.02,k*.4),true);s.knockout(ap);
 {const cr=new Path2D();cr.rect(ax+sw*.3,ly,sw*.16,sh);cr.rect(ax,ly+sh*.42,sw,sh*.16);s.fill(K,cr,.9);}
 if(b.blank)return;
 const dh=H*.36,num=new Path2D(),sy=1-.8*Math.sin(Math.PI*clamp(b.flip));
 digits(num,String(b.home),c[0]-k*1.35,ly-dh*.02,dh,seed+10,sy);digits(num,String(b.away),c[0]+k*.85,ly-dh*.02,dh,seed+20);
 num.addPath(ribbon([[c[0]-k*.32,ly+dh*.5],[c[0]+k*.32,ly+dh*.5]],dh*.13,{seed:seed+30,taper:0}));
 s.knockout(num);
 const clk=new Path2D(),ch=H*.2,cw=digits(new Path2D(),b.clock,0,0,ch,0);digits(clk,b.clock,c[0]-cw/2,y0+H*.7,ch,seed+40);s.knockout(clk);s.fill(Y,clk);
}
const mmss=(sec:number)=>{const m=Math.floor(sec/60),ss=Math.floor(sec%60);return`${m}:${ss<10?'0':''}${ss}`;};
/** a red ring stamped round a board score */
function boardRing(s:Sheet,c:Pt,kb:number,g:number,seed:number,dx:number){if(g<=.02)return;const q=blob(c[0]+dx*kb,c[1]-kb*.55,kb*.75*Math.min(1,g),kb*.62*Math.min(1,g),seed,{n:22});const rp=ribbon([...q,q[0]],kb*.1,{seed:seed+1,close:true,wobble:1});s.knockout(rp);s.fill(R,rp);}

// ================= chapter 1 — LIVE: EURO 2022 quarter-final (confirmed things only: the board, the arena, the celebration) =================
const C1={euro:A(0,'Euro 2022'),fin:A(0,'against Finland'),afonso:A(0,'Afonso Jesus'),early:A(0,'scores early'),eq:A(0,'Finland equalise'),then:A(0,'then Afonso'),two:A(0,'Two one'),end:AUTH[0].seconds};
/** the board over the centre of the court (X = 0, 11 m up); goal times from Wikipedia + UEFA's match data */
const BOARD_AT:V3=[0,11,10];
const F1=C1.early+.05,F2=C1.eq+.05,F3=C1.then+.55;
function board1(T:number):Board{
 const home=T<F1?0:T<F3?1:2,away=T<F2?0:1;
 const clock=T<F1?lerp(3*60+24,3*60+38,sm(C1.afonso,F1,T,linear)):T<F2?3*60+38:T<C1.then?lerp(9*60+30,9*60+34,sm(F2,C1.then,T,linear)):T<F3?lerp(14*60+36,14*60+47,sm(C1.then,F3,T,linear)):14*60+47;
 const last=T>=F3?F3:T>=F2?F2:T>=F1?F1:-9;
 return{home,away,clock:mmss(clock),flip:sm(last,last+.25,T,linear),glow:pulse(T,F3,1.6)+.6*pulse(T,F1,1.2)};
}
/** after the second goal: Afonso runs off toward the near touchline, arms out; team-mates chase him; Finland's heads drop (positions inferred) */
const RUN0:[number,number]=[-12.6,8.2],RUN1:[number,number]=[-8.8,2.8];
const ZT=F3;
const liveA:Gen=T=>{const u=sm(ZT,ZT+2.6,T,easeOut),X=lerp(RUN0[0],RUN1[0],u),Z=lerp(RUN0[1],RUN1[1],u);
 let pose=celebrate((T-ZT)*1.3,{kind:'run'});pose=blendPose(pose,celebrate((T-ZT)*1.1,{kind:'arms'}),sm(ZT+2.2,ZT+2.8,T));
 return{pose,yaw:yawTo(RUN1[0]-RUN0[0],RUN1[1]-RUN0[1])+lerp(0,.9,sm(ZT+2.2,ZT+2.9,T)),X,Z};};
const MATES:[number,number][]=[[-5.4,11.8],[-15,14.6],[-4.8,5.4]];
const liveMate=(i:number):Gen=>T=>{const[x0,z0]=MATES[i],go=sm(ZT+.1+.2*i,ZT+2.8,T,easeIO),f=liveA(ZT+2.8),tx=f.X+[1.1,-1.0,.9][i],tz=f.Z+[.9,1.1,-.5][i];
 const X=lerp(x0,tx,go),Z=lerp(z0,tz,go);const pose=blendPose(runCycle(T*runCadence(.9)+i*.3,{speed:.9}),celebrate(T*1.1+i*.3,{kind:'arms'}),sm(ZT+2.6,ZT+3,T));
 return{pose,yaw:go<.98?yawTo(tx-x0,tz-z0):FACE_CAMERA,X,Z};};
const FINS:[number,number][]=[[-15.4,11.4],[-13.2,6.0],[-11.4,13.8],[-16.6,7.6]];
const down=(i:number)=>posed({lHipF:6+i*3,rHipF:6,lKnee:10,rKnee:10+i*4,lean:20,neckP:44,lShA:10,rShA:10,lElb:20,rElb:20,twist:i*6});
const liveFin=(i:number):Gen=>T=>({pose:blendPose(backpedal(.2+i*.2),down(i),sm(ZT,ZT+1,T)),yaw:FACE_RIGHT+[.4,-.3,.5,-.2][i],X:FINS[i][0],Z:FINS[i][1]});
const liveK:Gen=T=>({pose:blendPose(keeperSet(.2),posed({lHipF:70,rHipF:70,lKnee:110,rKnee:110,lean:30,neckP:40,lShA:14,rShA:14,lElb:40,rElb:40}),sm(ZT,ZT+1.2,T)),yaw:FACE_RIGHT+.2,X:GOAL_X+.8,Z:9.6});
/** the camera: up on the board and the thin crowd for the score, then it tilts down onto the court for the celebration */
const liveCam=(T:number)=>({x:key(T,mono([[0,0],[C1.then,0],[ZT+.5,0],[ZT+1.7,-8.6],[C1.end,-9.4]]),easeInOutSine),
 zoom:key(T,mono([[0,.5],[C1.fin,.56],[C1.early,.74],[C1.eq,.84],[C1.then,.9],[ZT+.5,.86],[ZT+1.7,.84],[C1.end,1.0]]),easeInOutSine),
 y:key(T,mono([[0,-170],[C1.fin,-280],[C1.early,-560],[C1.eq,-680],[C1.then,-720],[ZT+.5,-680],[ZT+1.7,1250],[C1.end,1300]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),g=pulse(Tc,ZT+.05,.35);
 cam(s,0,c.y+3*g*Math.sin(Tc*80),c.zoom);
 const cheer=T<ZT?.08+.6*pulse(T,F1,1.2):1-.35*sm(C1.end-1.5,C1.end,T);
 courtSide(s,st,T,{cheer,flash:pulse(T,ZT,1.2)+.5*pulse(T,F1,1),keeper:()=>{athlete(s,st,liveK,T,FIN_GK,{detail:'low'});}});
 const bc=proj(st,BOARD_AT[0],BOARD_AT[1],BOARD_AT[2]),kb=kAt(st,BOARD_AT[2]);scoreboard(s,bc,kb,board1(T),501);
 // "scores early" / "scores again": a red ring stamps round Portugal's score; "Finland equalise": a navy ring round Finland's
 boardRing(s,bc,kb,easeOutBack(sm(F1,F1+.35,T))*(1-sm(C1.eq-.3,C1.eq,T))+easeOutBack(sm(ZT+.05,ZT+.4,T))*(1-sm(ZT+1.2,ZT+1.5,T)),502,-1.1);
 {const g2=easeOutBack(sm(F2,F2+.35,T))*(1-sm(C1.then-.2,C1.then+.1,T));if(g2>.02){const q=blob(bc[0]+kb*1.1,bc[1]-kb*.55,kb*.75*Math.min(1,g2),kb*.62*Math.min(1,g2),505,{n:22});const rp=ribbon([...q,q[0]],kb*.08,{seed:506,close:true,wobble:1,gaps:dashGaps(q,kb*.3)});s.knockout(rp);s.fill(Y,rp);}}
 if(T>=ZT&&T<ZT+.9)sparkBurst(s,Y,bc[0],bc[1],kb*4,{n:12,seed:504,g:easeOut(sm(ZT,ZT+.3,T))*(1-sm(ZT+.5,ZT+.9,T))});
 if(T<ZT-.2)return;// the court below is out of shot until the tilt
 const items:{z:number;draw:()=>void}[]=[];
 FINS.forEach((_,i)=>{const gg=liveFin(i);items.push({z:gg(T).Z,draw:()=>athlete(s,st,gg,T,FIN(i),{detail:'low'})});});
 MATES.forEach((_,i)=>{const gg=liveMate(i);items.push({z:gg(T).Z,draw:()=>athlete(s,st,gg,T,POR(i),{detail:'low'})});});
 items.push({z:liveA(T).Z,draw:()=>athlete(s,st,liveA,T,AFONSO,{smear:T<ZT+1.5?.1:0})});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "Two one": a red dashed ring stamps round his feet — the fixo who scored twice
 const rg=easeOutBack(sm(C1.two,C1.two+.35,T));if(rg>.02){const a=liveA(T);floorDashRing(s,st,R,a.X,a.Z,.8,8,507,rg);}
}
/** a chest point in a take (the passage enters his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveA(tt),.12));},still:C1.two+.6};

// ================= chapter 2 — FULL TIME (TV, closer and lower): 3–2, into the semi-final; the EURO title a week later as a stamp =================
const C2={whistle:A(1,'Final whistle'),three:A(1,'three two'),por:A(1,'Portugal are'),into:A(1,'into the'),go:A(1,'they go on'),win:A(1,'win Euro'),end:AUTH[1].seconds};
/** the Portugal group on the court at full time (positions inferred); Afonso front left */
const TEAM:[number,number,number][]=[[-1.05,4.7,0],[0,4.9,1],[1.05,4.7,2],[.62,3.85,3]];
const AP:[number,number]=[-.6,3.7];
const jump=(t:number,ph:number)=>{const p=celebrate(t*1.05+ph,{kind:'arms'});p.neckP=Math.max(p.neckP,-.12);return p;};
const teamGen=(i:number):Gen=>t=>{const[X,Z,ph]=TEAM[i];return{pose:blendPose(stand(),jump(t,ph*.23),sm(C2.three-.3,C2.three+.2,t)),yaw:FACE_CAMERA+[.25,0,-.25,-.15][i],X,Z};};
const champA:Gen=t=>({pose:blendPose(stand(),jump(t,.61),sm(C2.three-.3,C2.three+.2,t)),yaw:FACE_CAMERA+.2,X:AP[0],Z:AP[1]});
const st2:Stage={F:1500,eye:2.5,cx:0,cz:-3};
const BOARD2:V3=[0,9.5,13];
/** a stamped cup badge (a print mark, not a trophy scene): paper bowl on a stem, navy key line, a yellow disc behind */
function cupStamp(s:Sheet,c:Pt,k:number,g:number,seed:number){
 if(g<=.02)return;const r=k*.55*g;s.fill(K,polyPath(blob(c[0]+7,c[1]+7,r,r,seed,{n:24}),true),.45);const disc=polyPath(blob(c[0],c[1],r,r,seed+1,{n:24}),true);s.knockout(disc);s.fill(Y,disc);
 const h=r*1.05,w=r*.5,cy=c[1]+h*.5,bowl:Pt[]=[[c[0]-w,cy-h],[c[0]+w,cy-h],[c[0]+w*.8,cy-h*.55],[c[0]+w*.22,cy-h*.32],[c[0]+w*.14,cy-h*.12],[c[0]+w*.5,cy],[c[0]-w*.5,cy],[c[0]-w*.14,cy-h*.12],[c[0]-w*.22,cy-h*.32],[c[0]-w*.8,cy-h*.55]];
 const q=smoothPts(bowl,true,6,2),p=polyPath(q,true);s.knockout(p);s.fill(K,ribbon([...q,q[0]],Math.max(3,r*.06),{seed:seed+2,close:true,wobble:.6}));
 for(const sx of[-1,1])s.fill(K,ribbon([[c[0]+sx*w*.9,cy-h*.92],[c[0]+sx*w*1.35,cy-h*.78],[c[0]+sx*w*.95,cy-h*.58]],Math.max(3,r*.05),{seed:seed+3+sx,taper:0,wobble:.4}));
}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,bc=proj(st,BOARD2[0],BOARD2[1],BOARD2[2]),kb=kAt(st,BOARD2[2]),grp=proj(st,0,1.2,4.3);
  camPath(s,t,[[0,bc[0],bc[1]+120,1.05],[C2.three+.4,bc[0],bc[1]+100,1.12],[C2.por-.1,bc[0],bc[1]+160,1.05],[C2.into+.3,grp[0],grp[1]-60,1.5],[C2.go,grp[0]-40,grp[1]-90,1.45],[C2.win+.3,grp[0]-40,grp[1]-140,1.4],[C2.end,grp[0]-50,grp[1]-140,1.44]]);
  arena(s,st,{t:tt,goal:false,centre:9,cheer:sm(C2.three-.2,C2.three+.2,tt),flash:pulse(tt,C2.three,1.4)+.4*pulse(tt,C2.win,1.2),fans:.16});
  // "Final whistle": the board prints the final score, 3–2, at 40:00
  const lit=sm(C2.whistle,C2.whistle+.3,tt);scoreboard(s,bc,kb,{home:3,away:2,clock:'40:00',flip:lit,glow:pulse(tt,C2.three,1.4),blank:lit<.5},601);
  boardRing(s,bc,kb,easeOutBack(sm(C2.three,C2.three+.35,tt))*(1-sm(C2.por,C2.por+.3,tt)),602,-1.1);
  // "into the semi-final": a red ring stamps round his feet
  const ar=champA(tt),rg=easeOutBack(sm(C2.into,C2.into+.35,tt));if(rg>.02)floorDashRing(s,st,R,ar.X,ar.Z,.6,9,603,rg);
  const its:{z:number;draw:()=>void}[]=TEAM.map((p,i)=>({z:p[1],draw:()=>{athlete(s,st,teamGen(i),tt,POR(i+4),{detail:'mid'});}}));
  its.push({z:AP[1],draw:()=>{athlete(s,st,champA,tt,AFONSO,{detail:'high'});}});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "win Euro 2022": confetti and a stamped cup badge (the title was won in the final a week later — a mark, not this match)
  if(tt>=C2.win){const u=sm(C2.win,C2.win+2.2,tt,linear),top=proj(st,0,5,WALLZ)[1];confetti(s,[G,Y,R,'paper'],[-900,top-200+u*500,1800,420],24,Math.floor(tt*6),{size:16});}
  const sk=solve(ar.pose,BUILD,placeAt(ar.X,ar.Z,ar.yaw)),hd=toMine(sk.head),hp=proj(st,hd[0]+1.5,hd[1]+1.2,hd[2]);
  cupStamp(s,hp,kAt(st,hd[2]),easeOutBack(sm(C2.win,C2.win+.4,tt)),604);
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,champA(tt),.13));},
 still:C2.win+.5,
};

// ================= the demonstration (chapters 3–4): an attacker runs at goal; the last man stays up, gets in line, blocks with his body =================
type TL={go:number;last:number;stay:number;step0:number;step1:number;hit:number};
const TGT:V3=[-.85,.45,GZ];
const A0:[number,number]=[2.3,.5],A1:[number,number]=[1.05,3.4];
const YAW_SH=yawTo(TGT[0]-A1[0],TGT[2]-A1[1]);
const SB=toMine(strikeBall(YAW_SH)),BS:[number,number]=[A1[0]+SB[0],A1[1]+SB[2]];
const SDIR=(()=>{const dx=TGT[0]-BS[0],dz=TGT[2]-BS[1],l=Math.hypot(dx,dz);return[dx/l,dz/l] as [number,number];})();
/** where he blocks: 1.9 m down the shot line from the ball; he starts deeper and to the left, then slides across onto the line */
const D1:[number,number]=[BS[0]+SDIR[0]*1.9,BS[1]+SDIR[1]*1.9],D0:[number,number]=[-.9,6.9];
const IMP:V3=[D1[0]-SDIR[0]*.22,.55,D1[1]-SDIR[1]*.22],REB:V3=[3.4,BALL_R,2.2],FLY=.14;
const GK:[number,number]=[-.1,GZ-.6];
function demo(L:TL){
 const imp=L.hit+FLY;
 const att:Gen=t=>{
  const runEnd=L.hit-.5,u=sm(L.go,runEnd,t,easeIO),dir=yawTo(A1[0]-A0[0],A1[1]-A0[1]);
  if(t<runEnd)return{pose:t<L.go?blendPose(stand(),dribble(t*.8,{foot:'r',speed:.2}),.5):dribble((t-L.go)*runCadence(.55),{foot:'r',speed:.55}),yaw:lerp(dir,YAW_SH,sm(runEnd-.4,runEnd,t)),X:lerp(A0[0],A1[0],u),Z:lerp(A0[1],A1[1],u)};
  const st=key(t,[[runEnd,0],[L.hit,STRIKE_CONTACT],[L.hit+.7,1]],linear);return{pose:strike(st,{foot:'r'}),yaw:YAW_SH,X:A1[0],Z:A1[1]};};
 const afo:Gen=t=>{
  const face=(X:number,Z:number)=>{const a=att(t);return yawTo(a.X-X,a.Z-Z);};
  if(t<L.step0){const X=D0[0]+.18*Math.sin(t*1.6),Z=D0[1]-.5*sm(L.go,L.step0,t,easeIO);return{pose:blendPose(backpedal(t*1.1),READY,.55+.2*sm(L.stay,L.stay+.4,t)),yaw:face(X,Z),X,Z};}
  if(t<L.step1){const u=sm(L.step0,L.step1,t,easeIO),X=lerp(D0[0],D1[0],u),Z=lerp(D0[1]-.5,D1[1],u);return{pose:blendPose(backpedal(t*2.6),READY,.35),yaw:face(X,Z),X,Z};}
  const set=sm(L.step1,Math.min(L.step1+.35,L.hit),t),hitP=sm(imp,imp+.08,t)*(1-sm(imp+.45,imp+1.2,t));
  let pose=blendPose(READY,BLOCK,set);pose=blendPose(pose,HIT,hitP);return{pose,yaw:face(D1[0],D1[1]),X:D1[0],Z:D1[1]};};
 const kp:Gen=t=>({pose:blendPose(keeperSet(t*1.3),posed({lHipF:60,rHipF:60,lKnee:80,rKnee:80,lHipA:20,rHipA:20,lean:24,lShA:34,rShA:34,lElb:30,rElb:30,lHand:1,rHand:1}),sm(L.hit-.4,L.hit,t)),yaw:yawTo(BS[0]-GK[0],BS[1]-GK[1]),X:GK[0],Z:GK[1]});
 /** the ball: at his feet on the run, to the strike spot, fired down the shot line into Afonso's thigh, then away off his body */
 const ballAt=(t:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}=>{
  const runEnd=L.hit-.5,a=att(Math.min(t,runEnd)),dx=Math.cos(a.yaw),dz=Math.sin(a.yaw),bob=.12*Math.abs(Math.sin((t-L.go)*runCadence(.55)*Math.PI));
  if(t<runEnd)return{X:a.X+dx*(.42+bob),Y:BALL_R,Z:a.Z+dz*(.42+bob),flying:false,spin:t*9};
  if(t<L.hit){const u=sm(runEnd,L.hit,t,easeOut),x0=a.X+dx*.42,z0=a.Z+dz*.42;return{X:lerp(x0,BS[0],u),Y:BALL_R,Z:lerp(z0,BS[1],u),flying:false,spin:t*9};}
  if(t<imp){const u=sm(L.hit,imp,t,linear);return{X:lerp(BS[0],IMP[0],u),Y:lerp(BALL_R,IMP[1],u),Z:lerp(BS[1],IMP[2],u),flying:true,spin:20+u*10};}
  const u=sm(imp,imp+.8,t,easeOut),h=.9*4*u*(1-u);return{X:lerp(IMP[0],REB[0],u),Y:Math.max(BALL_R,lerp(IMP[1],REB[1],u)+h),Z:lerp(IMP[2],REB[2],u),flying:u<.95,spin:30+u*20};};
 return{att,afo,kp,ball:ballAt,imp};
}
/** the demo scene: the court end-on, no crowd (training), the figures, the ball, the cue diagrams */
function demoScene(s:Sheet,st:Stage,tt:number,D:ReturnType<typeof demo>,L:TL,c:{card?:number;last?:number;stay:number;line:number;block:number},detail:'mid'|'high'){
 const b=D.ball(tt),a=D.afo(tt);
 arena(s,st,{t:tt,fans:0,keeper:()=>athlete(s,st,D.kp,tt,DEMO_K,{detail:'mid'})});
 // "the last defender": a red dashed line across the court at his depth — nobody else between the attacker and the keeper
 if(c.last!==undefined){const g=sm(c.last,c.last+.6,tt,easeOut)*(1-sm(c.stay+.6,c.stay+1,tt));if(g>.02){const Z=a.Z;dashed(s,R,[proj(st,-9.6,0,Z),proj(st,0,0,Z),proj(st,9.6,0,Z)],10,301,{dash:34,progress:g});}}
 // "His card move": a red ring stamps round him
 if(c.card!==undefined){const g=easeOutBack(sm(c.card,c.card+.35,tt))*(1-sm((c.last??c.card+2)-.2,(c.last??c.card+2)+.2,tt));floorDashRing(s,st,R,a.X,a.Z,.7,9,302,g);}
 // "stays on his feet": a yellow ring round his planted feet
 {const g=easeOutBack(sm(c.stay,c.stay+.35,tt))*(1-sm(c.block+.8,c.block+1.3,tt));floorDashRing(s,st,Y,a.X,a.Z,.5,8,303,g);}
 // "in line": the red dashed shot line, ball → goal; his slide across onto it (a yellow arrow)
 {const g=sm(c.line-.2,c.line+.4,tt,easeOut)*(1-sm(c.block+.6,c.block+1.1,tt));if(g>.02){const pts:Pt[]=[];for(let k=0;k<=10;k++)pts.push(proj(st,lerp(BS[0],TGT[0],k/10),0,lerp(BS[1],TGT[2],k/10)));dashed(s,R,pts,11,304,{dash:36,progress:g});}
  const g2=sm(L.step0,L.step0+.3,tt,easeOut)*(1-sm(L.step1+.5,L.step1+.9,tt));if(g2>.02){const pts=[proj(st,D0[0],0,D0[1]-.5),proj(st,lerp(D0[0],D1[0],.5),0,lerp(D0[1]-.5,D1[1],.5)-.15),proj(st,D1[0],0,D1[1])];dashed(s,Y,pts,11,305,{dash:30,progress:g2});if(g2>.9)arrowHead(s,Y,pts,30,306);}}
 // the attacker's run (navy dashed, behind him)
 if(tt>L.go&&tt<L.hit+.4){const pts:Pt[]=[];for(let k=0;k<=8;k++){const q=D.att(lerp(L.go,Math.min(tt,L.hit-.5),k/8));pts.push(proj(st,q.X,0,q.Z));}dashed(s,K,pts,8,307,{dash:26,cov:.7});}
 // the shot and the rebound (yellow flight line)
 if(tt>L.hit){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=D.ball(lerp(L.hit,Math.min(tt,D.imp+.5),k/12));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,10,308,{dash:34});}
 const items:{z:number;draw:()=>void}[]=[
  {z:D.att(tt).Z,draw:()=>athlete(s,st,D.att,tt,DEMO_A,{detail,smear:tt>L.hit-.2&&tt<L.hit+.2?.16:0})},
  {z:a.Z,draw:()=>athlete(s,st,D.afo,tt,AFONSO_T,{detail,smear:tt>L.step0&&tt<L.step1?.14:0})},
  {z:b.flying&&tt>=D.imp?b.Z-.01:b.Z,draw:()=>{const bp=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),br=kAt(st,b.Z)*BALL_R;shadow(s,g[0],g[1],br*1.15,br*.3,313,b.flying?.3:.45);ball(s,bp[0],bp[1],br,314,{rot:b.spin,smear:b.flying?.3:0,dir:Math.atan2(bp[1]-g[1]+1,1)});}},
 ];
 items.sort((p,q)=>q.z-p.z).forEach(it=>it.draw());
 // the block: a yellow burst where the ball meets his thigh
 if(tt>=D.imp&&tt<D.imp+.8){const p=proj(st,IMP[0],IMP[1],IMP[2]);sparkBurst(s,Y,p[0],p[1],kAt(st,IMP[2])*.9,{n:11,seed:315,g:easeOut(sm(D.imp,D.imp+.2,tt))*(1-sm(D.imp+.45,D.imp+.8,tt))});}
}

// ================= chapter 3 — HOW HE DOES IT (demonstration) =================
const C3={card:A(2,'His card'),watch:A(2,'Watch how'),att:A(2,'An attacker'),last:A(2,'Afonso is'),stays:A(2,'He stays'),body:A(2,'gets his body'),block:A(2,'blocks the'),end:AUTH[2].seconds};
const TL3:TL={go:C3.att,last:C3.last,stay:C3.stays,step0:C3.body-.15,step1:C3.body+.55,hit:C3.block-.02};
const DEMO3=demo(TL3);
/** high and off to the right of the attacker's run, so the shot line and the fixo on it read clear of the attacker */
const st3:Stage={F:1500,eye:4.4,cx:5.6,cz:-5.2};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,d0=proj(st,D0[0],1,D0[1]),d1=proj(st,D1[0],.9,D1[1]),a1=proj(st,A1[0],.9,A1[1]),mid=L2(d1,a1,.4);
  camPath(s,t,[[0,d0[0]+40,d0[1]-30,1.9],[C3.watch,d0[0]+20,d0[1]-10,2.1],[C3.att,L2(d0,a1,.5)[0],L2(d0,a1,.5)[1],1.45],[C3.last,L2(d0,a1,.4)[0],L2(d0,a1,.4)[1]+20,1.5],[C3.body,mid[0],mid[1]+10,1.6],[C3.block,mid[0],mid[1],1.72],[C3.end,mid[0],mid[1],1.78]],
   [0,4*pulse(t,DEMO3.imp,.3)*Math.sin(t*70)]);
  demoScene(s,st,tt,DEMO3,TL3,{card:C3.card,last:C3.last,stay:C3.stays,line:C3.body,block:C3.block},'high');
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,DEMO3.afo(tt),.13));},
 still:C3.block+.4,
};

// ================= chapter 4 — PRACTISE: stay on your feet, get in line, block it; three cards; a tick =================
const C4={turn:A(3,'Your turn'),stay:A(3,'stay on'),line:A(3,'get in line'),block:A(3,'block it'),end:AUTH[3].seconds};
const TL4:TL={go:-2.6,last:-9,stay:C4.stay,step0:C4.line-.1,step1:C4.line+.5,hit:C4.block+.05};
const DEMO4=demo(TL4);
const st4:Stage={F:1500,eye:4,cx:5.2,cz:-4.2};
const CARD_W=150,CARD_H=165;
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,d1=proj(st,D1[0],.9,D1[1]),a1=proj(st,A1[0],.9,A1[1]),fc=L2(d1,a1,.4);
  camPath(s,t,[[0,fc[0],fc[1]+40,1.3],[C4.stay,fc[0],fc[1]+190,1.1],[C4.end,fc[0],fc[1]+190,1.1]]);
  demoScene(s,st,tt,DEMO4,TL4,{stay:C4.stay,line:C4.line,block:C4.block},'mid');
  // three cards rise on "Your turn": STAY (square on his feet), LINE (on the shot line), BLOCK (the ball off his body) — each prints on its word
  const rise=sm(C4.turn,C4.turn+.6,tt,easeOut);
  if(rise>.01){const cy=fc[1]+190+335+(1-rise)*600,xs=[fc[0]-360,fc[0],fc[0]+360],on=[C4.stay,C4.line,C4.block],cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   xs.forEach((cx,i)=>{const q=handCut([[cx-CARD_W,cy-CARD_H],[cx+CARD_W,cy-CARD_H],[cx+CARD_W,cy+CARD_H],[cx-CARD_W,cy+CARD_H]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(G,cards,.14);
   xs.forEach((cx,i)=>{const u=sm(on[i],on[i]+.3,tt,easeOutBack);if(u<=.01)return;const gy=cy+CARD_H-34;
    const fcam=figureCam({x:cx,y:gy,height:300*(.9+.1*u),azimuth:120,elevation:12,fov:16});
    const Pc=(j:V3):Pt=>{const q=fcam.project(j);return[q[0],q[1]];};
    s.save();s.clip(polyPath(outline[i],true));
    const pose=i===0?BLOCK:i===1?BLOCK:HIT;
    // stay = a yellow ring round the planted feet; line = a red dashed shot line through him; block = the ball bouncing off his thigh
    if(i===0){const q:Pt[]=[];for(let k=0;k<=20;k++){const a=k/20*TAU;q.push(Pc([Math.cos(a)*.6,0,Math.sin(a)*.6]));}dashed(s,Y,q,10,84,{dash:20});}
    drawAthlete(s,pose,fcam,{...AFONSO_T,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    if(i===1){const pts:Pt[]=[[cx-CARD_W+14,gy-70],[cx,gy-92],[cx+CARD_W-14,gy-114]];dashed(s,R,pts,9,85,{dash:24});arrowHead(s,R,pts,24,86);}
    if(i===2){const bc:V3=[.55,.5,.25],bb=Pc(bc),bR=BALL_R*(fcam.scale?fcam.scale(bc):100);const pts:Pt[]=[Pc([.3,.55,.1]),Pc([1.2,.9,.4]),Pc([2,.4,.9])];dashed(s,Y,pts,7,87,{dash:18});sparkBurst(s,Y,bb[0],bb[1],bR*3,{n:9,seed:88,g:.8});ball(s,bb[0],bb[1],bR,89);}
    s.restore();});
   s.fill(K,frames);}
  // "block it": a big green tick stamps over the BLOCK card, with a navy misregistered echo
  const tick=easeOutBack(sm(C4.block+.35,C4.block+.7,tt));
  if(tick>.02){const c:Pt=[fc[0]+500,fc[1]+190+200],S=150*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(G,tp);}
 },
 still:C4.block+.4,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'afonso-jesus-futsal-signature',format:'futsal',title:'Afonso Jesus’s last-man block',theme:'Stay on your feet and block the shot with your body.',
 ageNote:'For players aged 7–12: his two goals in the EURO 2022 quarter-final are real (how they were scored is not described in our sources); the last-man block is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball flies in and bounces off a navy "body" bar with a yellow burst; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.3),back=sm(.3,.8,age,easeOut),bx=x-160*(1-u)+90*back,by=y-60*back*(1-back)*4+10*back;
  const wall=sm(0,.15,age)*(1-sm(.9,1.2,age));if(wall>.02)s.fill(K,polyPath(blob(x+r*1.3,y,r*.28,r*1.6*wall,seed+2,{n:14}),true),.85);
  if(age>=.3&&age<.7)sparkBurst(s,Y,x+r*.8,y,r*2,{n:9,seed:seed+3,g:easeOut(sm(.3,.4,age))*(1-sm(.5,.7,age))});
  ball(s,bx,by,r,seed,{rot:age*6});
 },
};
export default film;
