/** Cardinal — "the pivot at the back post": a signature-move riso film (iconic plays, FUTSAL; Cardinal is a pivot).
 *
 * WHO: the card's Cardinal is the Portuguese FUTSAL pivot Fernando Alberto dos Santos Cardinal (born 26 Jun 1985, Porto; 1.82 m), of
 *  Sporting CP, Inter FS and ElPozo Murcia (lib/town/playerBios.json) — not a football player of that name, and not a Benfica player.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the pivot at the back post, "Keep moving between defenders so you
 *  are free when the pass comes" — not one match. No written source we could reach describes HOW any single Cardinal goal was scored
 *  (Wikipedia and UEFA list scorers and minutes only; UEFA's match pages are script-rendered shells), so the film follows the brief's
 *  honest FALLBACK: the real-match chapter shows ONLY confirmed things from a real, documented Cardinal goal in a big match, and the move
 *  itself is a separate, clearly labelled demonstration ("Here is how he does it", training tops and bibs, an empty arena).
 *  The match: the 2018–19 UEFA Futsal Champions League SEMI-FINAL, Sporting CP 5–3 Inter FS, 26 April 2019, Almaty Arena, Almaty
 *  (attendance 6,700) — against the club he had played for from 2013 to 2016. Goals: Pedro Cary o.g. 5:16 (0–1), Deo 5:25, Dieguinho 23:41,
 *  29:34, 35:57, Bebe 37:00, CARDINAL 39:38 (5–2), Gadeia 39:41 (5–3). No other futsal film uses this match (Guitta's film uses the final
 *  two days later, Sporting 2–1 Kairat).
 *  1  LIVE (broadcast camera, main stand, real time) — CONFIRMED THINGS ONLY: the arena, the hanging scoreboard at 4–2 in the last minute,
 *     the goal happens OFF CAMERA while the camera is on the board (it flips to 5–2), then the camera tilts down: the ball already in the
 *     net, Cardinal already wheeling away, his team-mates chasing him, Inter's heads dropping. No pass, run or finish of that match is shown.
 *  2  HOW HE DOES IT (demonstration, not the match; broadcast camera, real time; green training tops, yellow bibs, red keeper): the pivot
 *     keeps moving — checks toward the ball, drifts back between the two defenders — and, as the ala on the far side reaches the end line
 *     and rolls the ball across, he slips behind them to the back post and taps it in.
 *  3  REPLAY of the demonstration (slow motion, HIGH BEHIND THE GOAL, a gantry camera looking through the back net): the defenders' eyes on the ball, the
 *     blind side behind them, his curved run into it, "Free!", one touch.
 *  4  PRACTISE (lesson from the entry's `lesson`, rephrased): the same move from a high coach's view behind the play: his moving path drawn
 *     on the floor, the defenders ringed, the free space at the back post, the pass and a tick.
 * Sources (written; fetched once and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Fernando Cardinal" (raw, fetched Sep 2026): Fernando Alberto dos Santos Cardinal, born 26 Jun 1985, Porto; 1.82 m;
 *    position Pivot; Sporting CP shirt number 7 (infobox as of Aug 2018); clubs incl. Sporting CP 2009–11 and 2017–, Inter FS 2013–16,
 *    ElPozo Murcia 2016–17; Portugal 2008–, 120 caps, 87 goals; honours: UEFA Futsal Champions League 2018–19.
 *    — https://en.wikipedia.org/wiki/Fernando_Cardinal
 *  - Wikipedia, "2018–19 UEFA Futsal Champions League" (raw): semi-final 26 Apr 2019, Almaty Arena, Sporting CP 5–3 Inter FS, the goal list
 *    above, attendance 6,700, referees Marc Birkett and Kamil Çetin; final 28 Apr 2019 Sporting CP 2–1 Kairat.
 *    — https://en.wikipedia.org/wiki/2018%E2%80%9319_UEFA_Futsal_Champions_League
 *  - UEFA.com, "UEFA Futsal Champions League final preview: Barça vs Sporting" (2022): Cardinal was "involved" in the 2019 final win
 *    against Kairat in Almaty and "missed last year's tournament injured" (2021). Background.
 *  - UEFA.com (PT) 2021 final report and Maisfutebol's Zicky Té profile (2021): "o experiente Cardinal", a Sporting reference at pivot
 *    alongside Ricardinho, João Matos and Pany. Background for the pivot role.
 *  - Wikipedia, "2012 FIFA Futsal World Cup" / "UEFA Futsal Euro 2014" (raw): his tournament goals and all-star selections. Checked, not used.
 * CONFIRMED: the competition, round, date, venue, city, attendance, the score (4–2 before his goal, 5–2 after it at 39:38, 5–3 final), that
 *  Cardinal scored it for Sporting, his position (pivot), height, birthplace and clubs.
 * INFERRED (never named in the narration): kits — Sporting green-and-white hoops / black (navy) shorts / green socks with Cardinal's #7
 *  (his infobox number as of Aug 2018), Inter in a white change kit with navy shorts; which goal Sporting attacked; where on the court the
 *  celebration happened and who ran where; the scoreboard's look; whether Inter's keeper was in goal at 39:38 (late in games, trailing
 *  sides often use a flying goalkeeper), so NO Inter keeper is drawn near the goal; his hair (short, dark, as on his card). HOW the 39:38
 *  goal was scored is unknown and is not shown. Chapters 2–4 demonstrate the back-post movement (right-foot tap-in, left-side pass,
 *  defenders and keeper in training bibs) — a teaching demonstration, not footage of a particular match. No video was reviewed.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the dart and the tap). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 *  z → −Z. The demonstration is authored ONCE in the side (broadcast) frame; the replay and the lesson show the same choreography through a
 *  rotation of the floor (view(): a rigid turn, so feet, runs and the tap-in stay consistent; yaw follows).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood, lights, bibs, eye-lines), red (the run, the free space, keeper, post bands), green (Sporting hoops, training tops),
 *  navy (key line, shorts, stands, defender rings). Same ink set as the approved Guitta (Sporting, Almaty) film.
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈150–300 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2019 semi-final',text:'Almaty, 2019, the European futsal semi-final. Sporting lead Inter four to two, with seconds left. Then Cardinal scores! Five two!',tail:2.4,
  cues:['Almaty','the European','Sporting lead','four to two','with seconds','Then Cardinal','scores','Five two'],heads:{'Almaty':'Semi-final 2019','four to two':'4–2','Then Cardinal':'Goal!','Five two':'5–2'}},
 {label:'How he does it',text:'Here is how he does it. He keeps moving between the defenders. The pass comes across the box, and he arrives at the back post. Goal!',tail:2,
  cues:['Here is how','keeps moving','between the','The pass comes','arrives at','back post','Goal'],heads:{'Here is how':'How he does it','back post':'Back post','Goal':''}},
 {label:'Replay: the blind side',text:'Again, slowly. The defenders watch the ball. Cardinal slips behind them to the back post, where nobody is looking. Free! One touch, and in.',tail:2,
  cues:['Again','The defenders watch','Cardinal slips','back post','nobody','Free','One touch'],heads:{'Again':'Replay','nobody':'Blind side','Free':'Free!'}},
 {label:'Practise it',text:'Your turn: keep moving between defenders, so you are free when the pass comes!',tail:2.6,
  cues:['Your turn','keep moving','between defenders','free when','pass comes'],heads:{'Your turn':'Keep moving','pass comes':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/cardinal-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/cardinal-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/cardinal-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('cardinal: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('cardinal: no cue '+w);return c.at;};
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
const ringPts=(p:Pt,r:number):Pt[]=>{const q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return q;};

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
/** a dashed ring painted on the floor round (X,Z); g grows it */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g:number){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,30);dashed(s,ink,[...q,q[0]],w,seed,{dash:w*3.4});}
/** a floor path (list of floor points) drawn as a dashed line with an arrow; progress grows it */
function floorArrow(s:Sheet,st:Stage,ink:string,pts:[number,number][],w:number,seed:number,g:number,head=true){if(g<=.02)return;const sp=pts.filter(p=>p[1]>st.cz+.5).map(p=>proj(st,p[0],0,p[1]));if(sp.length<2)return;dashed(s,ink,sp,w,seed,{dash:w*3.2,progress:g});if(head&&g>.92)arrowHead(s,ink,sp,w*3.2,seed+1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
/** Cardinal: 1.82 m (Wikipedia), a strong pivot build; short dark hair (card) */
const CBUILD={height:1.82,bulk:1.06};
/** Cardinal in the live take: Sporting green-and-white hoops, #7 (infobox, Aug 2018), black (navy) shorts, green socks (kit inferred) */
const CARD:AthleteStyle={shirt:G,pattern:'hoops',patternInk:'paper',number:7,numberInk:'paper',shorts:K,socks:G,boots:K,skin:[[Y,.84],[R,.24]],hair:K,line:K,trim:K,hairStyle:'short',build:CBUILD,seed:17};
/** Cardinal in the demonstration: a plain green training top, no number (no team or match claimed) */
const CARD_TR:AthleteStyle={shirt:G,shorts:K,socks:K,boots:K,skin:[[Y,.84],[R,.24]],hair:K,line:K,trim:K,number:null,hairStyle:'short',build:CBUILD,seed:17};
/** Sporting CP team-mates: green-and-white hoops, navy shorts, green socks (inferred) */
const SCP=(n:number):AthleteStyle=>({shirt:G,pattern:'hoops',patternInk:'paper',shorts:K,socks:G,boots:K,skin:[[Y,.84],[R,.24]],hair:K,line:K,trim:K,hairStyle:n%3===1?'bald':'short',build:{height:1.72+hash(n,3)*.12},seed:40+n});
/** Inter FS: a white change kit with navy shorts (inferred; not named in the narration) */
const INT=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.82],[R,.26]],hair:K,line:K,trim:[K,.6],hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,5)*.12},seed:60+n});
/** the demonstration ala (the passer): a green training top, no number */
const ABUILD={height:1.74};
const ALA:AthleteStyle={shirt:G,shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.3]],hair:K,line:K,trim:K,number:null,hairStyle:'curly',build:ABUILD,seed:23};
/** defenders in yellow training bibs (no team) */
const BIB=(n:number):AthleteStyle=>({shirt:Y,shorts:K,socks:K,boots:K,skin:[[Y,.82],[R,.24]],hair:K,line:K,trim:K,number:null,hairStyle:n===1?'bald':'short',build:{height:1.76+.04*n},seed:70+n});
/** the demonstration keeper: red long-sleeved top, paper gloves */
const GKS:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.82],[R,.26]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',number:null,hairStyle:'short',build:{height:1.8},seed:81};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at a strike's contact (our floor coords, relative to the stance place) */
function strikeBall(yaw:number,foot:'l'|'r',power:number,build:{height:number}):V3{const sk=solve(strike(STRIKE_CONTACT,{foot,power}),build,{yaw}),toe=foot==='r'?sk.rToe:sk.lToe,an=foot==='r'?sk.rAn:sk.lAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}
/** a figure's chest in stage st (the passages enter his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09,build:{height:number}=CBUILD):Pt[]{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]);return ringPts(p,r*kAt(st,ch[2]));}
function headAt(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},build:{height:number}):Pt{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),h=toMine(sk.head);return proj(st,h[0],h[1]+.04,h[2]);}

// ---------------- views: the demonstration is authored in the side frame; the replay and lesson see it through a rigid floor turn ----------------
/** o = origin (side frame), f = forward unit (side frame) → view X' = along the right vector (fz,−fx), Z' = along f */
type View={ox:number;oz:number;fx:number;fz:number};
const vPt=(v:View,X:number,Z:number):[number,number]=>[(X-v.ox)*v.fz-(Z-v.oz)*v.fx,(X-v.ox)*v.fx+(Z-v.oz)*v.fz];
const vYaw=(v:View,yaw:number)=>yaw-Math.atan2(v.fz,v.fx)+Math.PI/2;
const vGen=(v:View,g:Gen):Gen=>t=>{const a=g(t),[X,Z]=vPt(v,a.X,a.Z);return{pose:a.pose,yaw:vYaw(v,a.yaw),X,Z};};
const vBall=(v:View,b:Ball3):Ball3=>{const[X,Z]=vPt(v,b.X,b.Z);return{...b,X,Z};};

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
 if(o.trail&&o.t!==undefined&&o.t0!==undefined&&o.t>o.t0){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=o.trail(Math.max(o.t0,o.t-.18+k*.0225));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.4,{seed:seed+7,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
 ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?(o.smear??.45):(o.smear??0),dir:o.dir??0});return{p,r};
}

// ---------------- the arena: wood court, crowd, lights ----------------
/** stepped navy rows, lit faces; green (Sporting) and paper shirts in the crowd; cheer lifts the heads; empty = training (no crowd) */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,empty=false){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 if(empty){s.fill(Y,rectPath(-span,top-15*rowH-kw*.6,span*2,kw*.5),.35);return;}
 const heads=new Path2D(),grn=new Path2D(),wht=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3400,x1=3400,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.3)grn.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.42)wht.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(G,grn);s.knockout(wht,.8);
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

// ---- SIDE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; the attacked goal at X = +20 ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;empty?:boolean;inGoal?:()=>void;board?:(top:number,kw:number)=>void;glow?:()=>void}={}){
 const{cheer=0,flash=0}=o,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
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
 o.glow?.();
 const top=boards(s,st,wall,kw,3);stands(s,top,kw,t,cheer,flash,st.cx,o.empty);o.board?.(top,kw);
 sideGoal(s,st);o.inGoal?.();sidePosts(s,st);
}
function sideGoal(s:Sheet,st:Stage){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>proj(st,GOAL_X+lerp(Db,Dt,Yh/H),Yh,Z);
 const hull=[proj(st,GOAL_X,0,POST_N),proj(st,GOAL_X,H,POST_N),proj(st,GOAL_X,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0)];
 const np=polyPath(hull,true);s.knockout(np,.6);s.fill(K,np,.2);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage,glow=0){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,GOAL_X+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>proj(st,GOAL_X,H+dy,Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
 if(glow>.02){const P=(Yh:number):Pt=>proj(st,GOAL_X,Yh,POST_N);sparkBurst(s,Y,P(1)[0],P(1)[1],kAt(st,POST_N)*1.3,{n:10,seed:88,g:glow});}
}

// ---- END-ON court (camera looks along +Z): a goal at Z = gz with posts X = ±1.5, net going away ----
function endGoalNet(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,gz+lerp(.95,.55,Yh/H));
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
/** the court seen end-on: wood floor, paper lines (a goal line + D at gz, optional halfway line + circle), boards + stands at wallZ */
function endArena(s:Sheet,st:Stage,o:{t:number;wallZ:number;gz?:number;half?:number;flash?:number;glow?:()=>void}){
 const{t,wallZ,gz,half,flash=0}=o,wall=proj(st,0,0,wallZ)[1],kw=kAt(st,wallZ);
 woodFloor(s,st,wall,'z',st.cz+.4,wallZ);
 const out=new Path2D();out.addPath(polyPath(floorQuad(st,-40,-40,-10,wallZ),true));out.addPath(polyPath(floorQuad(st,10,-40,40,wallZ),true));s.fill(K,out,.3);
 const lines=new Path2D(),zEnd=Math.min(wallZ-1,40);
 lines.addPath(polyPath(floorStrip(st,[[-10,st.cz+.5],[-10,zEnd]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,st.cz+.5],[10,zEnd]],.05),true));
 if(gz!==undefined){const arcPts:Pt[]=[],d=gz>st.cz+8?-1:1;// the D opens toward the play
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),gz+d*6*Math.sin(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),gz+d*6*Math.sin(a)]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,Math.max(gz,st.cz+.5)],[10,Math.max(gz,st.cz+.5)]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts.filter(p=>p[1]>st.cz+.5),.05),true));
  lines.addPath(polyPath(floorRing(st,0,gz+d*6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,gz+d*10,.12,12),true));}
 if(half!==undefined){const cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,half+Math.sin(a)*3]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,half],[10,half]],.05),true));lines.addPath(polyPath(floorStrip(st,cc,.05),true));}
 s.knockout(lines,.94);
 o.glow?.();
 const top=boards(s,st,wall,kw,2.4);stands(s,top,kw,t,0,flash,st.cx,true);
}

// ================= chapter 1 — LIVE: the 2019 semi-final (confirmed things only): the board at 4–2, the goal OFF camera, 5–2, the celebration =================
const C1={alm:A(0,'Almaty'),eur:A(0,'the European'),lead:A(0,'Sporting lead'),four:A(0,'four to'),secs:A(0,'with seconds'),then:A(0,'Then Cardinal'),scores:A(0,'scores'),five:A(0,'Five two'),end:AUTH[0].seconds};
/** the goal happens while the camera is on the scoreboard; the board flips a beat later */
const T_G=C1.then-.3,FLIP=T_G+.14;
const NET:V3=[GOAL_X+.62,BALL_R,10.35];
/** the ball: already in Inter's net (dropped in at T_G, a small settle) */
function liveBall(T:number):Ball3{const d=sm(T_G,T_G+.3,T,easeIn),b=Math.abs(Math.sin(sm(T_G+.3,T_G+1.1,T)*TAU))*.08*(1-sm(T_G+.3,T_G+1.1,T));return{X:NET[0],Y:lerp(.45,BALL_R,d)+b,Z:NET[2],flying:false,spin:T*2};}
/** Cardinal: already wheeling away from the goal (airplane arms) toward the near side; jumps with his team-mates on "Five two" */
const CEL0:[number,number]=[18.6,9.1],CEL1:[number,number]=[14.9,4.3];
const liveC:Gen=T=>{const u=sm(T_G,C1.five+.2,T,easeOut),X=lerp(CEL0[0],CEL1[0],u),Z=lerp(CEL0[1],CEL1[1],u),slow=sm(C1.five-.1,C1.five+.4,T);
 let pose=blendPose(celebrate((T-T_G)*1.25,{kind:'run'}),celebrate((T-C1.five)*1.15,{kind:'arms'}),slow);
 // before the (off-camera) goal he is just a figure in the box, jogging: nothing of the goal is staged
 if(T<T_G+.15)pose=blendPose(blendPose(stand(),runCycle(T*runCadence(.2),{speed:.2}),.5),pose,sm(T_G,T_G+.15,T));
 return{pose,yaw:lerp(yawTo(CEL1[0]-CEL0[0],CEL1[1]-CEL0[1]),FACE_CAMERA,sm(C1.five-.2,C1.five+.4,T)),X,Z};};
/** Sporting's three other court players: run from where they were to Cardinal and jump with him */
const SCP0:[number,number][]=[[15.2,13.4],[11.0,9.2],[17.4,15.2]],SCPG:[number,number][]=[[1.0,.9],[-1.1,.4],[.3,1.6]];
const liveScp=(i:number):Gen=>T=>{const[x0,z0]=SCP0[i],[gx,gz]=SCPG[i],t0=T_G+.3+i*.15,go=sm(t0,C1.five+.3,T,easeIO),c=liveC(Math.min(T,C1.five+.3));
 const X=lerp(x0,c.X+gx,go),Z=lerp(z0,c.Z+gz,go);
 let pose=blendPose(stand(),celebrate((T-t0)*1.3+i*.3,{kind:'run'}),sm(t0-.1,t0+.25,T));
 if(T>=C1.five-.1)pose=blendPose(pose,celebrate((T-C1.five)*1.2+i*.21,{kind:'arms'}),sm(C1.five-.1,C1.five+.35,T));
 const yaw=go<1?yawTo(c.X+gx-x0,c.Z+gz-z0):yawTo(-gx,-gz);
 return{pose,yaw,X,Z};};
/** Inter (white): standing round their box as the goal goes in; hands to heads, one crouches, heads drop */
const INT0:[number,number,number][]=[[19.1,12.0,.1],[17.2,7.4,.5],[16.0,11.6,.8],[12.8,13.0,.3]];
const DROP:Pose=posed({lHipF:58,rHipF:58,lKnee:70,rKnee:70,lean:44,neckP:40,lShF:40,rShF:40,lElb:20,rElb:20,lShA:10,rShA:10});
const HANDS:Pose=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:10,neckP:34,lShF:150,rShF:150,lShA:40,rShA:40,lElb:150,rElb:150});
const liveInt=(i:number):Gen=>T=>{const[X,Z,ph]=INT0[i],d=sm(T_G+.3,T_G+1.3,T);
 const pose=blendPose(blendPose(stand(),backpedal(T*.8+ph),.3),i===1?DROP:HANDS,d);
 return{pose,yaw:FACE_RIGHT+(ph-.45)*1.4+.5*d*(i%2?1:-1),X,Z};};
/** 7-segment digits for the arena scoreboard */
const SEG:Record<number,string>={2:'abged',4:'fgbc',5:'afgcd'};
function digit(n:number,x:number,y:number,h:number):Pt[][]{const w=h*.55,P:Record<string,Pt[]>={a:[[x,y],[x+w,y]],b:[[x+w,y],[x+w,y+h/2]],c:[[x+w,y+h/2],[x+w,y+h]],d:[[x,y+h],[x+w,y+h]],e:[[x,y+h/2],[x,y+h]],f:[[x,y],[x,y+h/2]],g:[[x,y+h/2],[x+w,y+h/2]]};return[...SEG[n]].map(c=>P[c]);}
/** the scoreboard hung above the far stands: Sporting (green bar) | Inter (paper bar); a clock bar nearly run out (39:xx of 40) */
function scoreboard(s:Sheet,st:Stage,T:number){
 const tl=proj(st,10,9.6,BOARDS+3),br=proj(st,18,5.0,BOARDS+3),w=br[0]-tl[0],h=br[1]-tl[1],flip=T>=FLIP,fl=pulse(T,FLIP,1.2);
 const panel=polyPath([[tl[0],tl[1]],[br[0],tl[1]],[br[0],br[1]],[tl[0],br[1]]],true);s.knockout(panel);s.fill(K,panel,.92);
 const hang=new Path2D();for(const u of[.2,.8]){hang.moveTo(tl[0]+w*u,tl[1]-h*.9);hang.lineTo(tl[0]+w*u,tl[1]);}s.stroke(K,hang,Math.max(2,h*.03),.8);
 // team bars: "Sporting lead" pulses the green one
 const lp=pulse(T,C1.lead,1.1);s.fill(G,rectPath(tl[0]+w*.08,br[1]-h*(.26+.04*lp),w*.34,h*(.1+.04*lp)));const ib=rectPath(tl[0]+w*.58,br[1]-h*.26,w*.34,h*.1);s.knockout(ib,.95);
 const dh=h*.46,y0=tl[1]+h*.12,segs=new Path2D();
 for(const[n,x] of[[flip?5:4,tl[0]+w*.18],[2,tl[0]+w*.68]] as [number,number][])for(const sg of digit(n,x,y0,dh))segs.addPath(ribbon(sg,dh*.14,{seed:n*7+Math.round(x),taper:0,wobble:.4}));
 s.knockout(segs);s.fill(Y,segs);
 // "four to two": the digits flash red; the flip flashes the home side
 const fp=pulse(T,C1.four,1.1);if(fp>.02)s.fill(R,rectPath(tl[0]+w*.08,tl[1]+h*.06,w*.84,h*.6),.4*fp);
 if(fl>.02)s.fill(R,rectPath(tl[0]+w*.08,tl[1]+h*.06,w*.36,h*.6),.55*fl);
 const dash=ribbon([[tl[0]+w*.47,y0+dh*.5],[tl[0]+w*.53,y0+dh*.5]],dh*.1,{seed:5,taper:0});s.fill(Y,dash);
 // the clock bar: 39 of 40 minutes gone; "with seconds left" pulses its last sliver red
 const cy=br[1]-h*.1,cx0=tl[0]+w*.08,cw=w*.84;s.fill(K,rectPath(cx0,cy-h*.03,cw,h*.06),.5);s.fill(Y,rectPath(cx0,cy-h*.03,cw*(T<FLIP?.985:.992),h*.06));
 const sp=pulse(T,C1.secs,1.4);if(sp>.02){s.fill(R,rectPath(cx0+cw*.955,cy-h*.07,cw*.045,h*.14),sp);ring2(s,R,[cx0+cw*.98,cy],h*.18,h*.14,Math.max(3,h*.03),131,easeOutBack(clamp(sp*1.4)),sp);}
 if(T>=FLIP&&T<FLIP+.9)sparkBurst(s,Y,tl[0]+w*.26,tl[1]-h*.1,w*.4,{n:12,seed:111,g:easeOut(sm(FLIP,FLIP+.3,T))*(1-sm(FLIP+.5,FLIP+.9,T))});
}
const liveCam=(T:number)=>({x:key(T,mono([[0,11.6],[C1.lead,13.2],[C1.then,14.1],[C1.scores+.5,15.4],[C1.five,15.3],[C1.end,15.3]]),easeInOutSine),
 zoom:key(T,mono([[0,.64],[C1.eur,.72],[C1.four,.8],[C1.secs,.8],[C1.then,.76],[C1.scores+.5,.84],[C1.five,.92],[C1.end,1.0]]),easeInOutSine),
 y:key(T,mono([[0,-120],[C1.eur,-170],[C1.four,-180],[C1.secs,-130],[C1.then,-110],[C1.scores+.5,1170],[C1.five,1170],[C1.end,1180]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const goal=T>=T_G;
 courtSide(s,st,T,{cheer:goal?1-.35*sm(C1.end-1.5,C1.end,T):.25+.2*pulse(T,C1.alm,1.5),flash:pulse(T,C1.alm,1.4)+pulse(T,T_G+.1,1.4)+.6*pulse(T,C1.five,1.2),board:()=>scoreboard(s,st,T),
  inGoal:()=>{if(goal)ballOn(s,st,liveBall(T),18,{min:8});}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 INT0.forEach((_,i)=>{const g=liveInt(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,INT(i),{detail:'low'})});});
 SCP0.forEach((_,i)=>{const g=liveScp(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,SCP(i),{detail:T>C1.scores?'auto':'low'})});});
 items.push({z:liveC(T).Z,draw:()=>{
  // "scores": a red ring picks Cardinal out as the camera arrives
  const a=liveC(T),g=proj(st,a.X,0,a.Z),h=1.82*kAt(st,a.Z);ring2(s,R,[g[0],g[1]-h*.5],h*.44,h*.64,8,121,easeOutBack(sm(C1.scores+.2,C1.scores+.6,T))*(1-sm(C1.five+.4,C1.five+.9,T)),1);
  athlete(s,st,liveC,T,CARD,{smear:T>T_G&&T<C1.five?.1:0});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "Five two": green + paper confetti in the stands' air
 if(T>=C1.five){const u=sm(C1.five,C1.five+2.4,T,linear),top=proj(st,0,4,BOARDS)[1];confetti(s,[G,'paper',Y],[-900,top-500+u*520,1800,420],22,Math.floor(T*6),{size:14});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveC(tt),.13));},still:C1.five+.5};

// ================= the DEMONSTRATION (authored once in the side frame, on chapter 2's authored clock) =================
const C2={here:A(1,'Here is'),keeps:A(1,'keeps'),between:A(1,'between'),pass:A(1,'The pass'),arrive:A(1,'arrives'),back:A(1,'back post'),goal:A(1,'Goal'),end:AUTH[1].seconds};
/** the pass: from the far side of the box (1.45 m off the end line) along the floor across the goal mouth, 1.7 m out, to the back post (the near post here) */
const PB0:[number,number]=[18.55,15.0],BP:[number,number]=[18.3,7.7];
const T_P=C2.arrive-.55,T_TAP=C2.back-.05,T_GOAL=T_TAP+.3,T_D=T_P-.45,S_T0=T_P-.55;
const IN:V3=[GOAL_X+.55,.2,9.05];
const YAW_P=yawTo(BP[0]-PB0[0],BP[1]-PB0[1]),SBp=strikeBall(YAW_P,'r',.45,ABUILD),PLANT_P:[number,number]=[PB0[0]-SBp[0],PB0[1]-SBp[2]];
const YAW_T=yawTo(IN[0]-BP[0],IN[2]-BP[1]),SBt=strikeBall(YAW_T,'r',.28,CBUILD),PLANT_T:[number,number]=[BP[0]-SBt[0],BP[1]-SBt[2]];
/** the ala: dribbles down the far side to the end line, rolls it across with the right foot, then watches */
const aPos=(t:number):[number,number]=>[key(t,mono([[0,10.6],[C2.keeps,12.4],[C2.pass,15.2],[S_T0,PLANT_P[0]-.3,easeOut],[T_P,PLANT_P[0],easeOut],[C2.end,PLANT_P[0]+.4,easeIO]])),
 key(t,mono([[0,16.4],[C2.pass,16.1],[S_T0,PLANT_P[1]+.2,easeOut],[T_P,PLANT_P[1],easeOut],[C2.end,PLANT_P[1]-.5,easeIO]]))];
const alaG:Gen=t=>{const[X,Z]=aPos(t),stT=key(t,[[S_T0,0],[S_T0+.25,.22],[T_P,STRIKE_CONTACT],[T_P+.55,1]],linear);let pose:Pose,yaw=FACE_RIGHT-.08;
 if(t<S_T0)pose=dribble(t*lerp(1.3,1.9,sm(C2.keeps,C2.pass,t)),{speed:lerp(.3,.6,sm(C2.keeps,C2.pass,t))});
 else if(t<T_P+.6){pose=blendPose(dribble(S_T0*1.9,{speed:.6}),strike(stT,{power:.45}),sm(S_T0,S_T0+.12,t));yaw=lerp(FACE_RIGHT-.08,YAW_P,sm(S_T0-.15,S_T0+.3,t,easeIO));}
 else{pose=blendPose(strike(1,{power:.45}),t>T_GOAL?celebrate((t-T_GOAL)*1.2,{kind:'arms'}):stand(),sm(T_P+.6,T_P+1.1,t,easeIO));yaw=YAW_P;}
 return{pose,yaw,X,Z};};
/** Cardinal's floor path: checks toward the ball, drifts back between the two defenders, then darts behind them to the back post */
const CK:Key[]=mono([[0,14.4,11.4],[C2.here+1.0,14.5,11.6],[C2.keeps+.2,15.3,13.4],[C2.between+.7,15.6,11.0],[C2.pass+.4,15.2,12.0],[T_D,15.7,11.4],[T_D+.85,17.3,10.0,easeIn],[T_TAP,PLANT_T[0],PLANT_T[1],easeOut],[T_TAP+.6,PLANT_T[0]+.35,PLANT_T[1]+.1,easeOut],[C2.end,PLANT_T[0]-.4,PLANT_T[1]-1.2,easeIO]]);
const cPos=(t:number):[number,number]=>{const v=key(t,CK,easeIO,true);return[v[0],v[1]];};
const cardG:Gen=t=>{
 const[X,Z]=cPos(t),[pX,pZ]=cPos(t-.12),v=Math.hypot(X-pX,Z-pZ)/.12,sp=clamp(v/6.5),stT=key(t,[[T_TAP-.3,.22],[T_TAP,STRIKE_CONTACT],[T_TAP+.5,1]],linear);
 let pose=blendPose(blendPose(stand(),backpedal(t*1.3),.3),runCycle(t*runCadence(sp)+.2,{speed:sp}),clamp(v/1.2));
 let yaw=v>.5?yawTo(X-pX,Z-pZ):yawTo(PB0[0]-X,PB0[1]-Z);
 if(t>T_TAP-.3&&t<T_TAP+.7){pose=blendPose(pose,strike(stT,{power:.28}),sm(T_TAP-.3,T_TAP-.18,t));yaw=lerp(yawTo(PLANT_T[0]-17.3,PLANT_T[1]-10.0),YAW_T,sm(T_TAP-.35,T_TAP-.12,t));}
 else if(t>=T_TAP+.7){pose=blendPose(strike(1,{power:.28}),celebrate((t-C2.goal)*1.15,{kind:'arms'}),sm(T_TAP+.7,Math.max(T_TAP+.9,C2.goal),t));yaw=lerp(YAW_T,FACE_CAMERA,sm(T_TAP+.7,C2.goal+.3,t));}
 return{pose,yaw,X,Z};};
/** the ball: at the ala's right foot on the dribble, set for the pass, across along the floor, tapped in, in the net */
function demoBall(t:number):Ball3{
 if(t<S_T0){const[X,Z]=aPos(t),ph=((t*lerp(1.3,1.9,sm(C2.keeps,C2.pass,t)))%1+1)%1,k=.5+.12*Math.sin(ph*TAU);return{X:X+k,Y:BALL_R,Z:Z-.14,flying:false,spin:t*9};}
 if(t<T_P){const[X0,Z0]=aPos(S_T0),u=sm(S_T0,T_P-.15,t,easeOut);return{X:lerp(X0+.5,PB0[0],u),Y:BALL_R,Z:lerp(Z0-.14,PB0[1],u),flying:false,spin:t*9};}
 if(t<T_TAP){const s0=sm(T_P,T_TAP,t,linear),u=1-Math.pow(1-s0,1.3);return{X:lerp(PB0[0],BP[0],u),Y:BALL_R,Z:lerp(PB0[1],BP[1],u),flying:false,spin:12+u*24};}
 if(t<T_GOAL){const u=sm(T_TAP,T_GOAL,t,linear);return{X:lerp(BP[0],IN[0],u),Y:lerp(BALL_R,IN[1],u),Z:lerp(BP[1],IN[2],u),flying:true,spin:36+u*20};}
 const d=sm(T_GOAL+.05,T_GOAL+.35,t,easeIn);return{X:IN[0]+.1*d,Y:lerp(IN[1],BALL_R,d),Z:IN[2],flying:false,spin:56};
}
/** defender 0 (bib): goal-side of the ala down the far side; stabs at the pass and misses */
const d0:Gen=t=>{const[ax,az]=aPos(t),X=Math.min(19.4,ax+1.05),Z=az-1.0;const lu=key(t,[[T_P-.3,0],[T_P+.05,.6],[T_P+.7,.9]],linear);
 let pose=backpedal(t*lerp(1.2,2,sm(C2.keeps,C2.pass,t)));pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_P-.4,T_P-.25,t));
 pose=blendPose(pose,posed({lHipF:14,rHipF:14,lKnee:24,rKnee:24,lean:14,neckP:20,neckY:-60,lShA:16,rShA:16,lElb:30,rElb:30}),sm(T_P+.8,T_P+1.4,t));
 return{pose,yaw:yawTo(ax-X,az-Z),X,Z};};
/** defender 1 (bib): marks Cardinal goal-side while he moves; from the dart on, his eyes are on the ball and he reacts late */
const d1Pos=(t:number):[number,number]=>{const tt=Math.min(t,T_D),[cx,cz]=cPos(tt-.35);const late=sm(T_TAP-.35,T_TAP+.5,t,easeIO);return[cx+1.05+.55*late,cz+.25-.9*late];};
const d1:Gen=t=>{const[X,Z]=d1Pos(t),[cx,cz]=cPos(t),b=demoBall(t);let pose=blendPose(backpedal(t*1.6+.3),stand(),t>T_D?.5:0);
 pose=blendPose(pose,lunge(key(t,[[T_TAP-.3,0],[T_TAP+.1,.6],[T_TAP+.8,.9]],linear),{side:'r'}),sm(T_TAP-.35,T_TAP-.2,t));
 const watch=sm(T_D-.2,T_D+.3,t);return{pose,yaw:lerp(yawTo(cx-X,cz-Z),yawTo(b.X-X,b.Z-Z),watch),X,Z};};
/** defender 2 (bib): guards the space in front of the near post, then drifts toward the ball as it comes across (ball-watching) */
const d2Pos=(t:number):[number,number]=>{const u=sm(C2.pass,T_P+.5,t,easeIO);return[lerp(16.5,16.3,u),lerp(8.9,10.1,u)];};
const d2:Gen=t=>{const[X,Z]=d2Pos(t),b=demoBall(t);let pose=blendPose(backpedal(t*1.1+.6),stand(),.45);
 pose=blendPose(pose,lunge(key(t,[[T_TAP-.1,0],[T_TAP+.3,.55],[T_TAP+.9,.85]],linear),{side:'r'}),sm(T_TAP-.15,T_TAP,t));
 return{pose,yaw:yawTo(b.X-X,b.Z-Z),X,Z};};
/** the keeper: covers the near-ball post as the ala comes down; the ball goes across in front of him and his late shuffle can't reach it */
const GKP:[number,number]=[19.5,10.75];
const gkG:Gen=t=>{const late=sm(T_P+.3,T_TAP+.2,t,easeIO);let pose=keeperSet(t*1.3);
 pose=blendPose(pose,lunge(key(t,[[T_P+.3,0],[T_TAP,.6],[T_TAP+.7,.85]],linear),{side:'l'}),sm(T_P+.25,T_P+.45,t)*.85);
 return{pose,yaw:FACE_LEFT+.35*sm(C2.keeps,T_P,t)-.45*late,X:GKP[0]-.1*late,Z:lerp(GKP[1]-.5,GKP[1]+.35,sm(C2.keeps,T_P,t))-.9*late};};
/** every figure of the demonstration, with its style and detail (the ala is drawn 'mid') */
const DEMO:{g:Gen;style:AthleteStyle;build:{height:number};hero?:boolean}[]=[{g:alaG,style:ALA,build:ABUILD},{g:d0,style:BIB(0),build:{height:1.76}},{g:d1,style:BIB(1),build:{height:1.8}},{g:d2,style:BIB(2),build:{height:1.84}},{g:cardG,style:CARD_TR,build:CBUILD,hero:true}];

// ================= chapter 2 — HOW HE DOES IT (demonstration, broadcast camera, real time, empty arena) =================
const demoCam=(t:number)=>({x:key(t,mono([[0,15.2],[C2.keeps,15.6],[C2.pass,16.4],[T_P,17.0],[T_TAP,17.8],[C2.goal,18.2],[C2.end,18.2]]),easeInOutSine),
 zoom:key(t,mono([[0,1.06],[C2.here+.6,1.14],[C2.keeps,1.1],[C2.between,1.18],[C2.pass,1.1],[T_P,1.14],[T_TAP,1.3],[C2.goal,1.36],[C2.end,1.3]]),easeInOutSine),
 y:key(t,mono([[0,960],[C2.keeps,970],[C2.between,990],[C2.pass,980],[T_P,1000],[T_TAP,1060],[C2.end,1060]]),easeInOutSine)});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc}=clock(1,t0),c=demoCam(tc),st=bst(c.x),tap=pulse(tc,T_TAP,.35);
  cam(s,0,c.y+3*tap*Math.sin(tc*80),c.zoom);
  const b=demoBall(tt),goal=tt>=T_GOAL;
  courtSide(s,st,tt,{empty:true,flash:pulse(tt,T_GOAL,1.2)+.6*pulse(tt,C2.goal,1),
   glow:()=>{
    // "keeps moving": his path so far, a red dashed trail on the floor (from the cue until the dart)
    const tr=sm(C2.keeps,C2.keeps+.3,tt)*(1-sm(T_TAP+.3,T_TAP+1,tt));if(tr>.02&&tt>C2.keeps+.1){const pts:[number,number][]=[];for(let k=0;k<=14;k++)pts.push(cPos(lerp(C2.keeps,Math.min(tt,T_D),k/14)));floorArrow(s,st,R,pts,11,201,tr,false);}
    // "between the defenders": navy dashed rings round both defenders, a yellow gap bar between them
    const bw=easeOutBack(sm(C2.between,C2.between+.4,tt))*(1-sm(T_P,T_P+.5,tt));if(bw>.02){const[x1,z1]=d1Pos(tt),[x2,z2]=d2Pos(tt);floorDashRing(s,st,K,x1,z1,.75,10,211,bw);floorDashRing(s,st,K,x2,z2,.75,10,213,bw);
     const gp=[proj(st,lerp(x1,x2,.2),0,lerp(z1,z2,.2)),proj(st,lerp(x1,x2,.8),0,lerp(z1,z2,.8))];const gb=ribbon(gp,13,{seed:215,taper:.1,wobble:1});s.knockout(gb);s.fill(Y,gb,bw);}
    // "The pass comes": the pass route, dashed navy across the goal mouth
    const pr=sm(C2.pass,C2.pass+.7,tt,easeOut)*(1-sm(T_GOAL+.4,C2.end,tt)*.7);if(pr>.02){const pts:[number,number][]=[];for(let k=0;k<=10;k++){const u=k/10;pts.push([lerp(PB0[0],BP[0],u),lerp(PB0[1],BP[1],u)]);}floorArrow(s,st,K,pts,12,221,pr);}
    // "arrives at": his dart, a red dashed arrow from where he is to the back post
    const ar=sm(T_D-.1,T_D+.5,tt,easeOut)*(1-sm(T_GOAL+.4,C2.end,tt)*.7);if(ar>.02){const pts:[number,number][]=[];for(let k=0;k<=10;k++)pts.push(cPos(lerp(T_D,T_TAP,k/10)));floorArrow(s,st,R,pts,13,231,ar);}
    // "back post": a big red ring stamps on the floor at the back post
    floorDashRing(s,st,R,BP[0],BP[1],.95,13,241,easeOutBack(sm(C2.back,C2.back+.35,tt))*(1-sm(C2.end-.8,C2.end,tt)*.5));
   },
   inGoal:()=>{athlete(s,st,gkG,tt,GKS,{detail:'mid'});if(goal)ballOn(s,st,b,218,{min:9});}});
  type It={z:number;draw:()=>void};const items:It[]=[];
  for(const f of DEMO)items.push({z:f.g(tt).Z,draw:()=>{
   if(f.hero){const a=f.g(tt),g=proj(st,a.X,0,a.Z),h=1.82*kAt(st,a.Z);ring2(s,R,[g[0],g[1]-h*.5],h*.42,h*.62,8,251,easeOutBack(sm(C2.here+.3,C2.here+.7,tt))*(1-sm(C2.keeps,C2.keeps+.4,tt)),1);}
   athlete(s,st,f.g,tt,f.style,{detail:'mid',smear:f.hero&&((tt>T_D&&tt<T_TAP-.2)||(tt>T_TAP-.2&&tt<T_TAP+.2))?.1:0});}});
  if(!goal)items.push({z:b.Z-.05,draw:()=>{const r=ballOn(s,st,b,218,{min:9,smear:tt>T_P&&tt<T_TAP?.3:0,dir:Math.atan2(1,-.1)});if(tt>=T_TAP&&tt<T_TAP+.35)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3,{n:9,seed:219,g:easeOut(sm(T_TAP,T_TAP+.25,tt))});}});
  items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
  // "Goal!": a red ring stamps round the ball in the net
  const gr=easeOutBack(sm(C2.goal,C2.goal+.4,tt));if(gr>.02){const p=proj(st,IN[0]+.1,.3,IN[2]),k2=kAt(st,IN[2]);ring2(s,R,p,.8*k2,.6*k2,9,261,gr,1);sparkBurst(s,Y,p[0],p[1],k2*1.6,{n:12,seed:262,g:easeOut(sm(C2.goal,C2.goal+.3,tt))*(1-sm(C2.goal+.6,C2.goal+1,tt))});}
 },
 aperture(t0){const{tt,tc}=clock(1,t0),st=bst(demoCam(tc).x);return aperture(chestPts(st,cardG(tt),.14));},
 still:T_TAP-.25,
};

// ================= chapter 3 — REPLAY: slow motion, HIGH BEHIND THE GOAL through the back net: eyes on the ball, the blind side, free =================
const C3={again:A(2,'Again'),watch:A(2,'The defenders'),slips:A(2,'Cardinal slips'),back:A(2,'back post'),nobody:A(2,'nobody'),free:A(2,'Free'),touch:A(2,'One touch'),end:AUTH[2].seconds};
/** replay clock → demonstration clock (slow motion, ≈0.25–0.4×) */
const rDemo=(t:number)=>key(t,mono([[0,T_D-1.1],[C3.watch,T_D-.35],[C3.slips,T_D+.3],[C3.back,T_P+.55],[C3.nobody,T_P+.95],[C3.free,T_TAP-.2],[C3.touch,T_TAP],[C3.touch+.9,T_GOAL+.1],[C3.end,T_GOAL+.9]]),linear);
/** the view from behind the goal: side (X,Z) → (Z−10, 20−X); the back post (side Z = 8.5) is screen LEFT */
const VB:View={ox:GOAL_X,oz:10,fx:-1,fz:0};
const st3:Stage={F:1500,eye:4.6,cx:-.3,cz:-7.5};
const E3=DEMO.map(f=>({...f,g:vGen(VB,f.g)})),GK3=vGen(VB,gkG);
/** the back net between us and the play: a sparse navy mesh; posts and bar at Z = 0 print over it */
function backNet(s:Sheet,st:Stage){
 const net=new Path2D(),Zb=-.9;
 for(let X=-3;X<=3.01;X+=.28){const a=proj(st,X,-.2,Zb),b=proj(st,X,2.6,Zb);net.moveTo(a[0],a[1]);net.lineTo(b[0],b[1]);}
 for(let Yh=0;Yh<=2.61;Yh+=.28){const a=proj(st,-3,Yh,Zb),b=proj(st,3,Yh,Zb);net.moveTo(a[0],a[1]);net.lineTo(b[0],b[1]);}
 s.stroke(K,net,2.4,.22);
}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc}=clock(2,t0),d=rDemo(tt),dc=rDemo(tc),st=st3,tap=pulse(tc,C3.touch,.4);
  const cc=vPt(VB,...cPos(dc)),ccx=proj(st,cc[0],1,cc[1])[0];
  camPath(s,tc,[[0,Math.min(300,ccx*.6),580,1.34],[C3.watch,Math.min(260,ccx*.6),600,1.4],[C3.slips,ccx*.5,620,1.44],[C3.back,ccx*.5,650,1.52],[C3.free,ccx*.5,670,1.58],[C3.touch,ccx*.45,670,1.6],[C3.end,ccx*.4,650,1.48]],[5*tap*Math.sin(tc*90),4*tap*Math.cos(tc*77)]);
  const b=vBall(VB,demoBall(d)),goal=d>=T_GOAL,bpv=vPt(VB,BP[0],BP[1]);
  endArena(s,st,{t:d,wallZ:41,gz:40,half:20,flash:pulse(d,T_GOAL,1.2),glow:()=>{
   // the goal line and D at our end (under the camera)
   const near=new Path2D(),arcPts:Pt[]=[];for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),6*Math.sin(a)]);}for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),6*Math.sin(a)]);}
   near.addPath(polyPath(floorStrip(st,[[-10,0],[10,0]],.05),true));near.addPath(polyPath(floorStrip(st,arcPts,.05),true));near.addPath(polyPath(floorRing(st,0,6,.12,12),true));s.knockout(near,.94);
   // "nobody is looking": the blind side — a red screen wedge on the floor behind the defenders, toward the back post
   const bl=sm(C3.nobody-.2,C3.nobody+.4,tt,easeOut)*(1-sm(C3.touch+.3,C3.touch+1,tt));
   if(bl>.02){const[a1,b1]=vPt(VB,...d1Pos(d)),[a2,b2]=vPt(VB,...d2Pos(d)),q=[proj(st,a2-.3,0,b2-.2),proj(st,a1-.2,0,b1-.3),proj(st,-.8,0,.3),proj(st,-3.2,0,.25),proj(st,-3.4,0,Math.max(.3,b2-1))];const sq=smoothPts(q,true,6),wp=polyPath(sq,true);s.knockout(wp,.45*bl);s.fill(R,wp,.4*bl);dashed(s,R,[...sq,sq[0]],8,309,{dash:26,cov:bl});}
   // "Cardinal slips": his curved run, a red dashed arrow on the floor (from the dart to the back post)
   const sl=sm(C3.slips,C3.slips+.9,tt,easeOut)*(1-sm(C3.touch+.5,C3.end,tt)*.6);if(sl>.02){const pts:[number,number][]=[];for(let k=0;k<=12;k++)pts.push(vPt(VB,...cPos(lerp(T_D,T_TAP,k/12))));floorArrow(s,st,R,pts,12,301,sl);}
   // "back post": a ring stamps at the back post
   floorDashRing(s,st,K,bpv[0],bpv[1],.7,11,303,easeOutBack(sm(C3.back,C3.back+.35,tt))*(1-sm(C3.end-.8,C3.end,tt)*.5));
   // the pass line (dashed navy, drawn as the ball goes)
   if(d>T_P){const pts:[number,number][]=[];for(let k=0;k<=14;k++){const q=vBall(VB,demoBall(lerp(T_P,Math.min(d,T_TAP),k/14)));pts.push([q.X,q.Z]);}floorArrow(s,st,K,pts,10,305,1,false);}
  }});
  type It={z:number;draw:()=>void};const items:It[]=[];
  const heads:Pt[]=[];
  E3.forEach((f,i)=>{const a=f.g(d);if(i===2||i===3)heads.push(headAt(st,a,f.build));// d1 and d2
   items.push({z:a.Z,draw:()=>{athlete(s,st,f.g,d,f.style,{detail:f.hero?'high':'mid',smear:f.hero&&d>T_D&&d<T_TAP+.2?.25:0});
    if(f.hero&&d>T_D+.2&&d<T_TAP){const g=proj(st,a.X,1,a.Z);speedLines(s,Y,g[0]+90,g[1],0,{n:5,seed:307,len:170*sm(T_D+.2,T_D+.6,d),spread:200,width:8});}}});});
  items.push({z:GK3(d).Z,draw:()=>athlete(s,st,GK3,d,GKS,{detail:'mid'})});
  items.push({z:b.Z-.05,draw:()=>{const r=ballOn(s,st,b,97,{min:10,smear:d>T_P&&d<T_TAP?.25:0,dir:0});if(d>=T_TAP&&d<T_TAP+.4)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3,{n:10,seed:98,g:easeOut(sm(T_TAP,T_TAP+.3,d))});}});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "The defenders watch the ball": yellow dashed eye-lines from both defenders' heads to the ball (they stay on it through "nobody")
  const look=sm(C3.watch,C3.watch+.5,tt,easeOut)*(1-sm(C3.touch,C3.touch+.4,tt));
  if(look>.02){const bp=proj(st,b.X,b.Y,b.Z);heads.forEach((h,i)=>dashed(s,K,[h,[lerp(h[0],bp[0],.5),lerp(h[1],bp[1],.5)-30],bp],9+3*pulse(tt,C3.nobody,1),311+i,{dash:30,progress:look}));}
  // "Free!": a red ring stamps round him
  const fr=easeOutBack(sm(C3.free,C3.free+.35,tt))*(1-sm(C3.touch+.6,C3.touch+1.1,tt));if(fr>.02){const a=E3[4].g(d),g=proj(st,a.X,0,a.Z),h=1.82*kAt(st,a.Z);ring2(s,R,[g[0],g[1]-h*.5],h*.45,h*.62,10,321,fr,1);}
  if(goal){const p=proj(st,b.X,b.Y+.2,b.Z);sparkBurst(s,Y,p[0],p[1],150,{n:12,seed:323,g:easeOut(sm(T_GOAL,T_GOAL+.3,d))*(1-sm(T_GOAL+.6,T_GOAL+1,d))});}
  endPosts(s,st,0);backNet(s,st);
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,E3[4].g(rDemo(tt)),.2));},
 still:C3.free+.2,
};

// ================= chapter 4 — PRACTISE: a high coach's view from behind the play: keep moving, between defenders, free when the pass comes =================
const C4={turn:A(3,'Your turn'),keep:A(3,'keep'),between:A(3,'between'),free:A(3,'free when'),pass:A(3,'pass comes'),end:AUTH[3].seconds};
/** practise clock → demonstration clock (about real time) */
const pDemo=(t:number)=>key(t,mono([[0,C2.keeps-.5],[C4.keep,C2.keeps+.2],[C4.between,C2.pass-.2],[C4.free,T_D+.9],[C4.pass,T_TAP],[C4.end,T_GOAL+1.6]]),linear);
/** the view from behind the play, looking at the goal: side (X,Z) → (10−Z, X−6); the back post (side Z = 8.5) is screen RIGHT */
const VF:View={ox:6,oz:10,fx:1,fz:0},GZ4=GOAL_X-6;
const st4:Stage={F:1500,eye:5.2,cx:-1.2,cz:.5};
const E4=DEMO.map(f=>({...f,g:vGen(VF,f.g)})),GK4=vGen(VF,gkG);
const sc4:Scene={
 draw(s,t0){
  const{tt,tc}=clock(3,t0),d=pDemo(tt),st=st4;
  camPath(s,tc,[[0,-140,540,1.3],[C4.keep,-100,550,1.34],[C4.between,-30,560,1.42],[C4.free,80,580,1.46],[C4.pass,130,580,1.46],[C4.end,110,570,1.36]]);
  const b=vBall(VF,demoBall(d)),goal=d>=T_GOAL,bpv=vPt(VF,BP[0],BP[1]);
  endArena(s,st,{t:d,wallZ:GZ4+1.6,gz:GZ4,flash:pulse(d,T_GOAL,1.2),glow:()=>{
   // "keep moving": his whole moving path (check, drift back, dart), a red dashed line drawn on the floor ahead of him
   const kp=sm(C4.keep,C4.keep+1.2,tt,easeOut);if(kp>.02){const pts:[number,number][]=[];for(let k=0;k<=26;k++)pts.push(vPt(VF,...cPos(lerp(C2.keeps,T_TAP,k/26))));floorArrow(s,st,R,pts,12,401,kp);}
   // "between defenders": navy dashed rings round the two defenders around him
   const bw=easeOutBack(sm(C4.between,C4.between+.4,tt))*(1-sm(C4.pass+.4,C4.end,tt)*.6);if(bw>.02){const p1=vPt(VF,...d1Pos(d)),p2=vPt(VF,...d2Pos(d));floorDashRing(s,st,K,p1[0],p1[1],.8,11,403,bw);floorDashRing(s,st,K,p2[0],p2[1],.8,11,405,bw);}
   // "free when": the free space at the back post, a red screen disc and a red ring
   const fr=easeOutBack(sm(C4.free,C4.free+.4,tt));if(fr>.02){const q=floorRing(st,bpv[0],bpv[1],1.2*fr,24);s.fill(R,polyPath(q,true),.3);floorDashRing(s,st,R,bpv[0],bpv[1],1.2,13,407,fr);}
   // "pass comes": the pass line across the goal mouth
   const pc=sm(C4.pass-.9,C4.pass,tt,easeOut);if(pc>.02){const pts:[number,number][]=[];for(let k=0;k<=10;k++){const u=k/10;pts.push(vPt(VF,lerp(PB0[0],BP[0],u),lerp(PB0[1],BP[1],u)));}floorArrow(s,st,K,pts,12,409,pc);}
  }});
  endGoalNet(s,st,GZ4);athlete(s,st,GK4,d,GKS,{detail:'mid'});if(goal)ballOn(s,st,b,411,{min:9});endPosts(s,st,GZ4);
  type It={z:number;draw:()=>void};const items:It[]=[];
  for(const f of E4){const a=f.g(d);items.push({z:a.Z,draw:()=>{
   if(f.hero){const g=proj(st,a.X,0,a.Z),h=1.82*kAt(st,a.Z);ring2(s,R,[g[0],g[1]-h*.5],h*.42,h*.62,8,413,easeOutBack(sm(C4.turn+.2,C4.turn+.6,tt))*(1-sm(C4.keep+.6,C4.keep+1,tt)),1);}
   athlete(s,st,f.g,d,f.style,{detail:f.hero?'high':'mid',smear:f.hero&&d>T_D&&d<T_TAP+.2?.1:0});}});}
  if(!goal)items.push({z:b.Z-.05,draw:()=>{ballOn(s,st,b,415,{min:9});}});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the tap-in: a big red tick stamps beside the back post, with a navy misregistered echo
  const tick=easeOutBack(sm(T_GOAL+.2,T_GOAL+.55,d));
  if(tick>.02){const g=proj(st,bpv[0],0,bpv[1]),h=kAt(st,bpv[1])*1.8,c:Pt=[g[0]+h*.9,g[1]-h*1.05],S=h*.4*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:419,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:420,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:418,taper:.2,wobble:1}),.5);s.fill(R,tp);}
 },
 still:C4.free+.5,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'cardinal-futsal-signature',format:'futsal',title:'Cardinal at the back post',theme:'Keep moving between defenders so you are free when the pass comes.',
 ageNote:'For players aged 7–12: the 2019 semi-final and its 5–2 goal are real; the back-post run is shown as a demonstration, not a filmed moment. Practise it with friends.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in along a dashed line and stops in a red back-post ring; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=42;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.45),bx=x+150*(1-easeOut(u)),g=clamp((age-.35)/.4);
  const line=ribbon([[x+170,y+r*.9],[x,y+r*.9]],7,{seed,taper:.2,wobble:1,gaps:dashGaps([[x+170,y],[x,y]],28)});s.fill(K,line,1-g*.6);
  if(g>0&&g<1)s.fill(R,ribbon(blob(x,y+r*.9,r*(.8+1.5*g),r*(.3+.45*g),seed+1,{n:24}),7*(1-g)+2,{seed:seed+1,close:true,wobble:1.2}),1);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:u*6});
 },
};
export default film;
