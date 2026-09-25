/** Bernardo Paçó — "the futsal block save": a signature riso film (iconic plays, FUTSAL, goleiro).
 *
 * WHY THIS MOMENT: Paçó's entry (lib/town/iconicPlays.json) is a signature — the block save — not one match. UEFA's minute-by-minute
 * commentary of the UEFA Futsal EURO 2026 SEMI-FINAL (France 1–4 Portugal, 4 Feb 2026, Arena Stožice, Ljubljana) logs him saving close-range
 * efforts while France chased the game with a flying goalkeeper — "38'00'' Mouhoudine (France) has an effort on goal. 38'01'' Bernardo Paçó
 * (Portugal) makes a save." — and he was then named goalkeeper of UEFA's Team of the Tournament. So chapter 1 recreates THAT logged save.
 * (Moment choice: the Dídac Plana film already uses the 2026 final, and Guitta / Mammarella use other finals; this is a different match and
 * a different camera plan.) The written sources do NOT say HOW he saved it, so the block technique is taught separately in a clearly
 * labelled demonstration (chapter 3), and the narration of the real match says only "saves".
 *  1  LIVE (broadcast camera, main stand, real time): the semi-final, Portugal lead 4–1 (Gueddoura own goal 34'07'', from Paçó's assist).
 *     France push up with their flying goalkeeper Guirio as an extra attacker (UEFA: "Ouassini Guirio is France's flying goalkeeper"); the
 *     ball goes wide and in to Mouhoudine, who shoots from close; Paçó saves (staged as a low block — inferred).
 *  2  FULL TIME (a lower courtside camera, CONFIRMED THINGS ONLY): "Portugal joy at full-time"; 1–4 on the arena scoreboard; Portugal are in
 *     the final; his twin brother Tomás Paçó (#3) is UEFA's Player of the Match. No play is staged.
 *  3  HOW HE BLOCKS (demonstration, slow motion, a floor-level camera off the far post — a set-up no other goleiro film uses; neutral
 *     training-bib shooter, no match claimed): too close to dive, so he stays big, arms wide, and one leg shoots out along the floor. Blocked.
 *  4  PRACTISE (lesson from the entry's `lesson`: "In futsal, stay big and use your legs to block close shots"): kid-height, front-on: the
 *     open gaps in the goal light up, he makes himself big (the high gaps close), his leg closes the low gap, a friend's shot is blocked, a tick.
 * Sources (written; fetched with curl once and cached in scratchpad/films/src-cache/):
 *  - UEFA.com match centre, "France vs Portugal", UEFA Futsal EURO 2026 semi-final (live commentary, fetched Sep 2026;
 *    uefa-futsaleuro2026-sf-fra-por.html / -commentary.txt): https://www.uefa.com/futsaleuro/match/2046726--france-vs-portugal/
 *    — "34'07'' Gueddoura (France) scores an own goal." "34'08'' Assist by Bernardo Paçó (Portugal)"; "Bernardo Paçó can't quite join his
 *    twin brother on the scoresheet but he has an assist!"; "Ouassini Guirio is France's flying goalkeeper."; "35'01'' Guirio (France) has an
 *    effort on goal. 35'02'' Bernardo Paçó (Portugal) makes a save."; "35'42'' Gueddoura … 35'43'' Bernardo Paçó (Portugal) makes a save.";
 *    "38'00'' Mouhoudine (France) has an effort on goal. 38'01'' Bernardo Paçó (Portugal) makes a save."; "Portugal joy at full-time.";
 *    "Tomás Paçó has been named Player of the Match by the UEFA Technical Observer Group."; Tomás: "My brother made a mistake but after
 *    reacted in the best way possible and was amazing."
 *  - Wikipedia, "UEFA Futsal Euro 2026" (raw): semi-final 4 Feb 2026, 20:30, France 1–4 Portugal (Touré 5'55"; D. Santos 17'36", T. Paçó
 *    18'43", Erick 28'13", Gueddoura o.g. 34'07"), Arena Stožice, Ljubljana, attendance 3,173; Portugal squad: 12 GK Bernardo Paçó (born
 *    19 Apr 2000, Sporting), 3 Tomás Paçó (born 19 Apr 2000, Sporting); Team of the Tournament goalkeeper: Bernardo Paçó.
 *    https://en.wikipedia.org/wiki/UEFA_Futsal_Euro_2026
 *  - UEFA.com (it), "Finale UEFA Futsal EURO 2026: Portogallo - Spagna 3-5" (read to check the final: Paçó started it; that match is
 *    used by the Plana film and is not used here).
 * CONFIRMED: match, date, venue, the 4–1 score from 34'07'' (so 4–1 at 38'), France's flying goalkeeper Guirio, Mouhoudine's effort at
 *  38'00'' and Paçó's save at 38'01'', the 1–4 final score, Portugal into the final, "Portugal joy at full-time", the twins (Bernardo #12
 *  GK, Tomás #3), Tomás Player of the Match, Bernardo in UEFA's Team of the Tournament.
 * INFERRED (not named in the narration): HOW the 38'01'' save was made (a low block with the right leg — the technique his card is about),
 *  where every player stood and the passes before the shot, Mouhoudine's shooting foot (right) and position; which goal was Portugal's;
 *  kits — Portugal red shirts / green shorts / red socks (as in the approved Ricardinho and Pany films), France navy shirts / white shorts /
 *  red socks, Guirio in a yellow flying-keeper shirt, Paçó in a green long-sleeved keeper kit with navy shorts; the wood-look court; the
 *  hanging scoreboard; the twins hugging at full time (UEFA only says "Portugal joy"); both twins' short dark hair. Paçó's height is not
 *  sourced (drawn 1.80 m). No video was reviewed. Chapters 3–4 are a coaching demonstration, not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike and the leg shooting out). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps
 * library z → −Z. Shooters strike with the right foot; the block is the keeper's RIGHT leg (BLOCK below, authored with posed()); the ball's
 * target IS the solved right shin at full stretch (shinAt), so leg and ball always meet.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagram lines), red (Portugal shirts, posts, the "too close" line), green (Paçó's kit, Portugal shorts,
 * boards), navy (key line, France, stands). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL
 * sheet (card window 1.45:1 → square). Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill,type Build} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2026 semi-final',text:'Futsal Euro semi-final, 2026. Portugal lead France, four to one. France push up with an extra attacker. Mouhoudine shoots from close. Bernardo Paçó saves!',tail:2.2,
  cues:['Futsal Euro','Portugal lead','four to one','France push','extra attacker','Mouhoudine','shoots','Bernardo','saves'],heads:{'Futsal Euro':'Euro semi-final 2026','four to one':'4–1','extra attacker':'5 v 4','saves':'Saved!'}},
 {label:'Full time',text:'Full time. Portugal win four to one and reach the final. His twin brother, Tomás, was Player of the Match!',tail:2.2,
  cues:['Full time','Portugal win','reach the final','His twin','brother','Player of'],heads:{'Full time':'Full time','reach the final':'Into the final','Player of':'Player of the Match'}},
 {label:'How he blocks (demo)',text:'This is how he blocks. The shot is too close to dive, so he stays big: arms wide, and one leg shoots out along the floor. Blocked!',tail:2.2,
  cues:['This is how','too close','stays big','arms wide','one leg','along the floor','Blocked'],heads:{'This is how':'How he blocks (demo)','stays big':'Stay big','Blocked':'Blocked!'}},
 {label:'Practise it',text:'Practise with a friend. In futsal, stay big and use your legs to block close shots!',tail:2.6,
  cues:['Practise with','In futsal','stay big','use your legs','close shots'],heads:{'stay big':'Stay big','use your legs':'Use your legs'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/bernardo-paco-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/bernardo-paco-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/bernardo-paco-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('paco: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('paco: no cue '+w);return c.at;};
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
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
const lin3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const quad3=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean over the court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** floor path (X,Z pairs) → screen points */
const fp=(st:Stage,pts:[number,number][]):Pt[]=>pts.map(p=>proj(st,p[0],0,p[1]));
/** a big blue-free tick: green stroke, navy misregistered echo */
function tickMark(s:Sheet,c:Pt,S:number,seed:number){const tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed,taper:.2,wobble:1}),.5);s.fill(G,ribbon(tk,S*.24,{seed:seed+2,taper:.2,wobble:1}));}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
const SKIN_L:InkFill[]=[[Y,.86],[R,.26]],SKIN_M:InkFill[]=[[Y,.72],[R,.4]],SKIN_D:InkFill[]=[[R,.6],[K,.34]];
/** Bernardo Paçó: Portugal #12 (Wikipedia squad list); height unsourced (1.80 m drawn); green long-sleeved keeper kit, navy shorts (inferred) */
const BUILD_K:Build={height:1.8,bulk:1.03};
const PACO:AthleteStyle={shirt:G,shorts:K,socks:G,boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',number:12,numberInk:'paper',hairStyle:'short',build:BUILD_K,seed:12};
/** Portugal outfield: red shirts, green shorts, red socks (inferred, as in the approved Portugal films); Tomás Paçó #3 (his twin) */
const POR=(n:number):AthleteStyle=>({shirt:R,shorts:G,socks:R,boots:K,skin:n%3===1?SKIN_M:n%3===2?SKIN_D:SKIN_L,hair:K,line:K,trim:G,hairStyle:n%2?'short':'bald',build:{height:1.7+hash(n,3)*.12},seed:30+n});
const TOMAS:AthleteStyle={...POR(0),number:3,numberInk:'paper',hairStyle:'short',skin:SKIN_L,build:{height:1.8,bulk:1.02},seed:3};
/** France: navy shirts, white shorts, red socks (inferred); Guirio the flying goalkeeper in a yellow shirt (inferred) */
const FRA=(n:number):AthleteStyle=>({shirt:K,shorts:'paper',socks:R,boots:K,skin:n%3===0?SKIN_D:n%3===1?SKIN_M:SKIN_L,hair:K,line:'navy',trim:'paper',hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.72+hash(n,4)*.12},seed:50+n});
const GUIRIO:AthleteStyle={...FRA(7),shirt:[Y,.95],trim:K,sleeves:'long',hairStyle:'short',seed:61};
const BUILD_S:Build={height:1.78,bulk:1.02};
const MOUH:AthleteStyle={...FRA(4),hairStyle:'short',skin:SKIN_D,build:BUILD_S,seed:64};
/** the demonstration shooter and the practice friend: neutral training kit (no team is claimed) */
const DEMO_S:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:SKIN_M,hair:K,line:K,trim:R,hairStyle:'curly',build:BUILD_S,seed:77};
const FRIEND:AthleteStyle={shirt:[Y,.9],shorts:K,socks:'paper',boots:K,skin:SKIN_D,hair:K,line:K,trim:K,hairStyle:'short',build:{height:1.45,bulk:.95},seed:79};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact (our coords, a shooter at the origin turned to yaw) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD_S,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}

/** THE BLOCK (library: facing +x, right = +z). From the set: load low, then drop onto the LEFT knee while the RIGHT leg shoots out long
 * and low along the floor toward the post, chest tall, arms wide and hands open — the body made as big as possible for a shot from close. */
const LOAD=posed({lHipF:58,rHipF:58,lHipA:20,rHipA:20,lKnee:78,rKnee:78,lAnk:-8,rAnk:-8,lean:22,pitch:8,lShF:40,rShF:40,lShA:48,rShA:48,lElb:50,rElb:50,lHand:1,rHand:1,neckP:-10,squash:-.08});
const BLOCK=posed({lHipF:8,lHipA:6,lKnee:112,lAnk:40,rHipF:14,rHipA:84,rHipR:34,rKnee:4,rAnk:-14,lean:10,bend:-12,roll:14,twist:4,neckP:6,neckY:-8,
 lShF:30,rShF:26,lShA:82,rShA:62,lElb:20,rElb:14,lHand:1,rHand:1,squash:.06});
/** stand big (star): tall, feet wide, knees soft, arms out and a little up */
const BIG=posed({lHipF:22,rHipF:22,lHipA:24,rHipA:24,lKnee:30,rKnee:30,lAnk:-4,rAnk:-4,lean:12,pitch:4,lShF:28,rShF:28,lShA:74,rShA:74,lElb:14,rElb:14,lHand:1,rHand:1,neckP:-8});
/** block(u): 0 set → .25 load → .6 full block (contact) → 1 held */
const block=(u:number):Pose=>keyPoses(clamp(u),[[0,keeperSet(0)],[.25,LOAD],[.6,BLOCK],[1,BLOCK]]);
/** get up after a block: back on both feet, a fist pump */
const PUMP=posed({lHipF:14,rHipF:18,lKnee:24,rKnee:26,lean:6,rShF:60,rShA:40,rElb:130,lShF:-10,lShA:20,lElb:40,neckP:-12,rHand:0});
/** the shin the ball meets (60% from knee to ankle), in OUR coords, for a keeper at (X,Z) turned to yaw, at full block */
function shinAt(X:number,Z:number,yaw:number):V3{const sk=solve(BLOCK,BUILD_K,placeAt(X,Z,yaw)),p=lin3(sk.rKn,sk.rAn,.6);return toMine([p[0],Math.max(BALL_R+.03,p[1]),p[2]]);}
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

// ---------------- the arena (shared): stands, wood court ----------------
/** stepped navy rows, lit faces, red / green / yellow shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),greens=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.26)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.38)greens.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(G,greens);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the wooden court: a warm yellow floor with long plank strips (a few tinted) */
function woodFloor(s:Sheet,st:Stage,x0:number,z0:number,x1:number,z1:number,alongX:boolean){
 const court=polyPath(floorQuad(st,x0,z0,x1,z1),true);s.knockout(court);s.fill(Y,court,.62);s.fill(R,court,.1);
 const planks=new Path2D();
 if(alongX){for(let z=Math.ceil(z0/.9)*.9;z<z1;z+=1.8)planks.addPath(polyPath(floorQuad(st,x0,z,x1,z+.9),true));}
 else{for(let x=Math.ceil(x0/.9)*.9;x<x1;x+=1.8)planks.addPath(polyPath(floorQuad(st,x,z0,x+.9,z1),true));}
 s.fill(Y,planks,.22);
}
/** navy boards with yellow ad panels and a green cap */
function boards(s:Sheet,wall:number,board:number,x0s:number[],x1s:number[]){const span=9000;s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();x0s.forEach((x0,i)=>ads.rect(x0,wall-board*.78,x1s[i]-x0,board*.52));s.fill(Y,ads,.75);s.fill(G,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));}

// ---- LIVE / FULL-TIME court from the main-stand side: camera outside the near touchline; Portugal's goal at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number,eye=6,cz=-13,F=4500):Stage=>({F,eye,cx:camX,cz});
type SideOpt={cheer?:number;flash?:number;keeper?:()=>void;board?:()=>void};
function courtSide(s:Sheet,st:Stage,t:number,o:SideOpt={}){
 const{cheer=0,flash=0}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(G,rectPath(-span,wall,span*2,span),.5);s.fill(K,rectPath(-span,wall,span*2,span),.3);
 woodFloor(s,st,-20,0,20,TOUCH_FAR,true);
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
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

// ---- DEMO / PRACTISE court facing the goal end (camera looks along +Z): goal centre (0, GZ), wall behind it ----
const GZ=11,WALLZ=13.4;
type ArenaOpt={cheer?:number;flash?:number;t?:number;keeper?:(st:Stage)=>void;behind?:(st:Stage)=>void;mouth?:(st:Stage)=>void};
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,t=0}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 s.fill(G,rectPath(-span,wall,span*2,span),.5);s.fill(K,rectPath(-span,wall,span*2,span),.3);
 woodFloor(s,st,-10,-30,10,GZ,false);
 const lines=new Path2D(),arcPts:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
 lines.addPath(polyPath(floorStrip(st,[[-10,GZ],[10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts,.05),true));
 lines.addPath(polyPath(floorRing(st,0,GZ-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,GZ-10,.12,12),true));
 lines.addPath(polyPath(floorStrip(st,[[-10,Math.max(-30,st.cz+.4)],[-10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,Math.max(-30,st.cz+.4)],[10,GZ]],.05),true));
 s.knockout(lines,.94);
 const x0s:number[]=[],x1s:number[]=[];for(let i=-12;i<12;i++){x0s.push(proj(st,i*2.4+.3,0,WALLZ)[0]);x1s.push(proj(st,i*2.4+1.9,0,WALLZ)[0]);}
 boards(s,wall,board,x0s,x1s);void span;
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 o.behind?.(st);goalEnd(s,st);o.mouth?.(st);o.keeper?.(st);postsEnd(s,st);
}
function goalEnd(s:Sheet,st:Stage){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H));
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

// ================= chapter 1 — LIVE: the 2026 semi-final, 38'; France's flying goalkeeper, Mouhoudine shoots from close, Paçó saves =================
const C1={eu:A(0,'Futsal'),lead:A(0,'Portugal lead'),four:A(0,'four to'),push:A(0,'France push'),extra:A(0,'extra'),mou:A(0,'Mouhoudine'),shoots:A(0,'shoots'),ber:A(0,'Bernardo'),saves:A(0,'saves'),end:AUTH[0].seconds};
/** France (all inferred positions): Guirio the flying keeper carries it up from halfway, then out to the near wing (F1), in to Mouhoudine */
const G0:[number,number]=[-2.4,10.8],G1:[number,number]=[-8.8,10.2];
const F1P:[number,number]=[-11.4,3.8],RECV:[number,number]=[-14.4,7.2],M0:[number,number]=[-12.6,6.4];
const P1a=C1.extra+.1,P1b=P1a+.7,P2a=Math.max(P1b+.45,C1.shoots-.1),P2b=P2a+.42,T_HIT=Math.max(P2b+.38,C1.ber-.45),T_BLK=T_HIT+.22;
/** Paçó: set a step off his near post; faces the shooter; his right shin is where the ball is stopped */
const KP:[number,number]=[-18.9,9.3],K_YAW=yawTo(RECV[0]-KP[0],RECV[1]-KP[1]);
const CT1=shinAt(KP[0],KP[1],K_YAW);
const YAW_SHOT=yawTo(CT1[0]-RECV[0],CT1[2]-RECV[1]);
const SB=strikeBall(YAW_SHOT),PLANT:[number,number]=[RECV[0]-SB[0],RECV[1]-SB[2]];
/** after the block the ball spins off toward the near touchline, a Portugal defender scoops it away */
const OUT1:V3=[-16.6,BALL_R,3.9];
const guirio:Gen=T=>{const u=sm(0,P1a,T,easeIO),X=lerp(G0[0],G1[0],u),Z=lerp(G0[1],G1[1],u);
 let pose=T<P1a-.1?dribble(T*1.5,{foot:'r',speed:.45}):blendPose(dribble(1.5*(P1a-.1),{foot:'r',speed:.45}),strike(key(T,[[P1a-.1,.3],[P1a,STRIKE_CONTACT],[P1a+.5,.9]],linear),{foot:'r',power:.4}),sm(P1a-.2,P1a-.1,T));
 if(T>P1a+.5)pose=blendPose(pose,backpedal((T-P1a)*1.2),sm(P1a+.5,P1a+.9,T));
 const toF1=yawTo(F1P[0]-G1[0],F1P[1]-G1[1]);return{pose,yaw:T<P1a-.5?FACE_LEFT:lerp(FACE_LEFT,toF1,sm(P1a-.5,P1a-.15,T)),X,Z};};
const guiBall=(T:number):[number,number]=>{const g=guirio(T);return[g.X-.45,g.Z-.05];};
const f1:Gen=T=>{const kick=pulse(T,P2a-.05,.3),toM=yawTo(RECV[0]-F1P[0],RECV[1]-F1P[1]),toG=yawTo(G1[0]-F1P[0],G1[1]-F1P[1]);
 let pose=blendPose(runCycle(T*runCadence(.25),{speed:.25}),stand(),.5);pose=blendPose(pose,posed({lHipF:-10,rHipF:40,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2));
 return{pose,yaw:T<P1b+.1?toG:toM,X:F1P[0],Z:F1P[1]};};
const mouh:Gen=T=>{
 const S0=T_HIT-.5,stT=key(T,[[S0,.12],[S0+.2,.24],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,1]],linear);
 const X=key(T,mono([[0,M0[0]],[P2a,M0[0]-.5,easeIO],[P2b,PLANT[0]+.35,easeOut],[T_HIT,PLANT[0],easeOut],[T_HIT+.6,PLANT[0]-.4,easeOut],[C1.end,PLANT[0]-.5]]));
 const Z=key(T,mono([[0,M0[1]],[P2a,M0[1]+.2,easeIO],[P2b,PLANT[1]-.1,easeOut],[T_HIT,PLANT[1],easeOut],[T_HIT+.6,PLANT[1]+.2,easeOut],[C1.end,PLANT[1]+.3]]));
 let pose:Pose;
 if(T<P2a)pose=blendPose(runCycle(T*runCadence(.35),{speed:.35}),stand(),.35);
 else if(T<S0)pose=runCycle(T*runCadence(.6),{speed:.6});
 else if(T<T_HIT+.55)pose=blendPose(runCycle(S0*runCadence(.6),{speed:.6}),strike(stT,{foot:'r'}),sm(S0,S0+.12,T));
 else{const u=sm(T_HIT+.55,T_BLK+.9,T,easeIO);pose=blendPose(strike(1,{foot:'r'}),posed({lHipF:10,rHipF:14,lKnee:14,rKnee:16,lean:-8,neckP:-24,lShF:150,rShF:150,lShA:30,rShA:30,lElb:120,rElb:120}),u);}
 const toF1=yawTo(F1P[0]-M0[0],F1P[1]-M0[1]);
 return{pose,yaw:T<P2b-.1?toF1:lerp(toF1,YAW_SHOT,sm(P2b-.1,T_HIT-.3,T,easeIO)),X,Z};};
/** Paçó live: set, shuffles with the ball to his near post, loads, the block on the shot, then up with a fist pump */
const liveK:Gen=T=>{
 const X=key(T,mono([[0,-18.7],[P1b,-18.8,easeIO],[P2b,KP[0],easeIO]])),Z=key(T,mono([[0,10.2],[P1a,9.8,easeIO],[P2b,KP[1],easeIO]]));
 const u=key(T,[[T_HIT-.16,0],[T_HIT,.3],[T_BLK,.6],[T_BLK+.5,1]],linear);
 let pose=keeperSet(T*1.3);if(T>=T_HIT-.16)pose=block(u);
 const up=sm(T_BLK+.9,T_BLK+1.5,T,easeIO);if(up>0)pose=blendPose(pose,PUMP,up);
 const toBall=T<P1b?yawTo(guiBall(T)[0]-X,guiBall(T)[1]-Z):T<P2a+.2?yawTo(F1P[0]-X,F1P[1]-Z):K_YAW;
 return{pose,yaw:toBall,X,Z};};
/** Portugal's four: P0 on the ball side (closes Mouhoudine late), P1 middle, P2 near side deep (clears), P3 Tomás on the pivot */
const PO:[number,number][]=[[-12.2,5.6],[-12.6,11.8],[-16.1,4.6],[-16.6,13.2]];
const livePOR=(i:number):Gen=>T=>{const[x0,z0]=PO[i],bl=liveBall(T);let X=x0,Z=z0,pose=backpedal(T*1.4+i*.3),yaw=yawTo(bl.X-x0,bl.Z-z0);
 if(i===0){const c=sm(P2a,T_HIT,T,easeIO);X=lerp(x0,RECV[0]+.9,c*.7);Z=lerp(z0,RECV[1]-.6,c*.7);pose=blendPose(pose,lunge(key(T,[[T_HIT-.35,0],[T_HIT,.6],[T_HIT+.5,1]],linear),{side:'l'}),sm(T_HIT-.45,T_HIT-.3,T));}
 if(i===2){const c=sm(T_BLK+.2,T_BLK+1.1,T,easeIO);X=lerp(x0,OUT1[0]+.7,c);Z=lerp(z0,OUT1[2]-.2,c);if(c>0&&c<1)pose=runCycle(T*runCadence(.8),{speed:.8});
  if(T>T_BLK+1.05)pose=blendPose(runCycle(T*runCadence(.4),{speed:.4}),strike(key(T,[[T_BLK+1.05,.3],[T_BLK+1.3,STRIKE_CONTACT],[T_BLK+1.8,1]],linear),{foot:'r'}),.8);}
 const saved=sm(T_BLK+.3,T_BLK+1,T);if(i!==2)pose=blendPose(pose,posed({lHipF:8,rHipF:8,lKnee:12,rKnee:12,lean:4,lShF:60,rShF:60,lShA:40,rShA:40,lElb:80,rElb:80,neckP:-10}),saved*.7);
 return{pose,yaw,X,Z};};
const FRA_POS:[number,number][]=[[-12.0,16.0],[-17.2,12.4]];// far wing, pivot at the far post
const liveFRA=(i:number):Gen=>T=>{const[x0,z0]=FRA_POS[i],bl=liveBall(T);let pose=blendPose(stand(),runCycle(T*runCadence(.2)+i*.4,{speed:.2}),.4);
 pose=blendPose(pose,posed({lHipF:10,rHipF:14,lKnee:14,rKnee:16,lean:-6,neckP:-20,lShF:150,rShF:150,lShA:30,rShA:30,lElb:120,rElb:120}),sm(T_BLK+.2,T_BLK+.8,T)*.9);
 return{pose,yaw:yawTo(bl.X-x0,bl.Z-z0),X:x0-.6*sm(0,T_HIT,T),Z:z0};};
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 const roll=(a:[number,number],b:[number,number],t0:number,t1:number)=>{const u=sm(t0,t1,T,easeOut);return{X:lerp(a[0],b[0],u),Y:BALL_R,Z:lerp(a[1],b[1],u),flying:false,spin:u*8};};
 if(T<P1a){const g=guiBall(T);return{X:g[0],Y:BALL_R,Z:g[1],flying:false,spin:T*6};}
 const gb=guiBall(P1a),f1b:[number,number]=[F1P[0]-.35,F1P[1]+.3];
 if(T<P2a)return roll(gb,f1b,P1a,P1b);
 if(T<T_HIT)return roll(f1b,RECV,P2a,P2b);
 if(T<T_BLK){const u=sm(T_HIT,T_BLK,T,linear);return{X:lerp(RECV[0],CT1[0],u),Y:lerp(BALL_R,CT1[1],u),Z:lerp(RECV[1],CT1[2],u),flying:true,spin:20+u*30};}
 if(T<T_BLK+.75){const u=sm(T_BLK,T_BLK+.75,T,linear),p=quad3(CT1,[lerp(CT1[0],OUT1[0],.5),.7,lerp(CT1[2],OUT1[2],.5)],OUT1,u);return{X:p[0],Y:p[1],Z:p[2],flying:true,spin:50+u*20};}
 if(T<T_BLK+1.3){const u=sm(T_BLK+.75,T_BLK+1.3,T,easeOut);return{X:lerp(OUT1[0],OUT1[0]+.5,u),Y:BALL_R,Z:lerp(OUT1[2],OUT1[2]-.4,u),flying:false,spin:70+u*4};}
 const u=sm(T_BLK+1.3,T_BLK+2.2,T,easeOut);return{X:lerp(OUT1[0]+.5,-7,u),Y:BALL_R,Z:lerp(OUT1[2]-.4,6.5,u),flying:false,spin:74+u*20};
}
const liveCam=(T:number)=>({x:key(T,mono([[0,-6.8],[C1.extra,-9.2],[P1b,-11.6],[P2b,-14.2],[T_HIT,-15.6],[T_BLK+.4,-16.9],[C1.saves,-17.1],[C1.end,-16.8]]),easeInOutSine),
 zoom:key(T,mono([[0,.6],[C1.extra,.62],[P2a,.68],[T_HIT,.74],[C1.ber,.9],[C1.saves,.96],[C1.end,.9]]),easeInOutSine),
 y:key(T,mono([[0,1040],[T_HIT,1030],[C1.ber,1010],[C1.end,1010]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_BLK,.4);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),saved=T>=T_BLK;
 courtSide(s,st,T,{cheer:saved?.9*sm(T_BLK,T_BLK+.4,T)+.1:.1,flash:pulse(T,T_BLK,1)+.6*pulse(T,C1.saves,1.2),
  keeper:()=>{athlete(s,st,liveK,T,PACO,{detail:'low',smear:T>T_HIT-.1&&T<T_BLK+.15?.1:0});}});
 // "extra attacker": a yellow dashed ring under Guirio (five France players against four)
 const ex=easeOutBack(sm(C1.extra,C1.extra+.3,T))*(1-sm(P1b+.3,P1b+.7,T));
 if(ex>.02){const g=guirio(T);floorDashRing(s,st,Y,g.X,g.Z,.8,10,71,ex);}
 type It={z:number;draw:()=>void};const items:It[]=[];
 const add=(g:Gen,style:AthleteStyle,o:{detail?:'low'|'auto';smear?:number}={})=>items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,style,{detail:o.detail??'low',smear:o.smear})});
 PO.forEach((_,i)=>add(livePOR(i),i===3?TOMAS:POR(i+1)));
 FRA_POS.forEach((_,i)=>add(liveFRA(i),FRA(i+1)));
 add(guirio,GUIRIO);add(f1,FRA(3));add(mouh,MOUH,{detail:'auto',smear:T>T_HIT-.2&&T<T_HIT+.25?.1:0});
 items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45/(1+b.Y));
  if(b.flying&&T<T_BLK+.3){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_HIT,T-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.4,{seed:17,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.4:0,dir:Math.PI*.95});
  if(T>=T_BLK&&T<T_BLK+.4){const q=proj(st,CT1[0],CT1[1],CT1[2]);sparkBurst(s,Y,q[0],q[1],60,{n:9,seed:19,g:easeOut(sm(T_BLK,T_BLK+.25,T))});}}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveK(tt),BUILD_K,.16));},still:T_BLK+.05};

// ================= chapter 2 — FULL TIME (confirmed things only): Portugal joy, 1–4 on the scoreboard, into the final; the twins; Tomás Player of the Match =================
const C2={ft:A(1,'Full time'),win:A(1,'Portugal win'),fin:A(1,'reach'),twin:A(1,'His twin'),bro:A(1,'brother'),potm:A(1,'Player of'),end:AUTH[1].seconds};
/** a lower courtside camera (the bench side), nearer the play than the main-stand camera */
const st2=(x:number):Stage=>({F:3000,eye:2.4,cx:x,cz:-6.5});
/** the arena scoreboard over halfway: FRANCE 1 – 4 PORTUGAL (France first-named) */
const SEG:number[][]=[[1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1],[0,1,1,0,0,1,1]];
function digit(p:Path2D,x:number,y:number,w:number,h:number,n:number){const t=w*.2,on=SEG[n]||SEG[0],hh=h/2;
 const bars:[number,number,number,number][]=[[x+t,y,w-2*t,t],[x+w-t,y+t*.5,t,hh-t*.5],[x+w-t,y+hh,t,hh-t*.5],[x+t,y+h-t,w-2*t,t],[x,y+hh,t,hh-t*.5],[x,y+t*.5,t,hh-t*.5],[x+t,y+hh-t/2,w-2*t,t]];
 bars.forEach((b,i)=>{if(on[i])p.rect(b[0],b[1],b[2],b[3]);});}
function scoreboard(s:Sheet,st:Stage,X:number,flash:number){
 const c=proj(st,X,4.4,BOARDS-1),k=kAt(st,BOARDS-1),w=4.4*k,h=1.7*k,x=c[0]-w/2,y=c[1]-h/2;
 const cab=new Path2D();cab.moveTo(x+w*.2,y);cab.lineTo(x+w*.2,y-4*k);cab.moveTo(x+w*.8,y);cab.lineTo(x+w*.8,y-4*k);s.stroke(K,cab,Math.max(2,k*.04),.8);
 const box=rectPath(x,y,w,h);s.knockout(box);s.fill(K,box,.92);
 // France tricolour block (navy / paper / red) and Portugal block (green / red)
 s.knockout(rectPath(x+w*.04,y+h*.2,w*.18,h*.3));s.fill(K,rectPath(x+w*.04,y+h*.2,w*.06,h*.3),.8);s.fill(R,rectPath(x+w*.16,y+h*.2,w*.06,h*.3));
 s.fill(G,rectPath(x+w*.78,y+h*.2,w*.07,h*.3));s.fill(R,rectPath(x+w*.85,y+h*.2,w*.11,h*.3));
 const dg=new Path2D(),dw=w*.12,dh=h*.62,dy=y+h*.19;digit(dg,x+w*.3,dy,dw,dh,1);dg.rect(x+w*.47,dy+dh*.45,w*.06,dh*.1);digit(dg,x+w*.58,dy,dw,dh,4);
 s.knockout(dg);s.fill(Y,dg,.75+.25*Math.min(1,flash));
 if(flash>.05)s.fill(Y,ribbon([[x-8,y-8],[x+w+8,y-8],[x+w+8,y+h+8],[x-8,y+h+8],[x-8,y-8]],10*flash,{seed:91,taper:0,wobble:1}),Math.min(1,flash));
}
/** the twins meet and hug (inferred detail of "Portugal joy"): Bernardo from his goal, Tomás from the court */
const HUG_P:[number,number]=[-8.2,6.4];
const HUG=posed({lHipF:12,rHipF:16,lKnee:18,rKnee:22,lean:16,neckP:14,lShF:96,rShF:96,lShA:26,rShA:26,lElb:78,rElb:78,lHand:1,rHand:1});
const POINT=posed({lHipF:14,rHipF:18,lKnee:24,rKnee:24,lean:6,rShF:94,rShA:12,rElb:8,rHand:1,lShF:30,lShA:24,lElb:44,neckY:8,neckP:-4});
const twin=(who:'b'|'t'):Gen=>t=>{
 const from:[number,number]=who==='b'?[-15.2,8.8]:[-3.6,4.6],to:[number,number]=who==='b'?[HUG_P[0]-.34,HUG_P[1]]:[HUG_P[0]+.34,HUG_P[1]];
 const u=sm(C2.ft+.2,C2.twin-.1,t,easeIO),X=lerp(from[0],to[0],u),Z=lerp(from[1],to[1],u),run=yawTo(to[0]-from[0],to[1]-from[1]);
 let pose=t<C2.ft?(who==='b'?keeperSet(t*1.2):blendPose(stand(),backpedal(t*1.1),.4)):runCycle(t*runCadence(.85)+(who==='b'?0:.5),{speed:.85});
 const hug=sm(C2.twin-.35,C2.twin+.05,t)*(1-sm(C2.potm-.25,C2.potm+.1,t));
 const bounce=.5+.5*Math.sin((t-C2.twin)*TAU*1.6);pose=blendPose(pose,{...HUG,air:.04*bounce},hug);
 const face=who==='b'?FACE_RIGHT:FACE_LEFT;let yaw=u<.95?run:face;
 let dx=0,dz=0;
 if(t>C2.potm-.25){const a=sm(C2.potm-.25,C2.potm+.2,t,easeIO);
  if(who==='t'){pose=blendPose(pose,celebrate((t-C2.potm)*1.1,{kind:'arms'}),a);dx=.7*a;dz=-.5*a;yaw=lerp(face,FACE_CAMERA,a);}
  else{pose=blendPose(pose,POINT,a);dx=-.3*a;yaw=lerp(face,FACE_RIGHT-.35,a);}}
 return{pose,yaw,X:X+dx,Z:Z+dz};};
const JOY:[number,number][]=[[-11.6,9.6],[-5.2,9.8],[-12.8,5.2]];
const joyPOR=(i:number):Gen=>t=>{const[x,z]=JOY[i];const go=sm(C2.ft,C2.ft+.3,t);let pose=blendPose(blendPose(stand(),backpedal(t*1.1+i),.4),celebrate((t-C2.ft)*1.1+i*.3,{kind:i===1?'run':'arms'}),go);
 return{pose,yaw:i===1?FACE_LEFT+.3+(t-C2.ft)*.4*go:FACE_CAMERA+.4*(i-1),X:x+(i===1?-1.2*sm(C2.ft,C2.end,t,easeIO):0),Z:z};};
const SAD:[number,number][]=[[-2.2,12.2],[-.4,8.6],[-14.2,13.6],[1.6,14.8]];
const HEAD_DOWN=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20});
const HANDS_KNEES=posed({lHipF:50,rHipF:50,lKnee:30,rKnee:30,lean:40,neckP:10,lShF:70,rShF:70,lShA:10,rShA:10,lElb:10,rElb:10});
const sadFRA=(i:number):Gen=>t=>({pose:blendPose(blendPose(stand(),backpedal(t*.8+i),.3),i===1?HANDS_KNEES:HEAD_DOWN,sm(C2.ft,C2.ft+.8,t)),yaw:FACE_LEFT+[.6,-.3,.9,-.8][i],X:SAD[i][0],Z:SAD[i][1]});
const ftCam=(t:number)=>({x:key(t,mono([[0,-6.4],[C2.win,-6.2],[C2.twin,-7.8],[C2.potm,-7.6],[C2.end,-7.4]]),easeInOutSine),
 zoom:key(t,mono([[0,.78],[C2.fin,.8],[C2.twin,1.05],[C2.bro,1.15],[C2.potm,1.08],[C2.end,1.12]]),easeInOutSine),
 y:key(t,mono([[0,300],[C2.fin,260],[C2.twin,380],[C2.end,390]]),easeInOutSine)});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),c=ftCam(t),st=st2(c.x);
  cam(s,0,c.y,c.zoom);
  const whistle=pulse(tt,C2.ft,1.2),win=pulse(tt,C2.win,1),fin=pulse(tt,C2.fin,1.2);
  courtSide(s,st,tt,{cheer:Math.min(1,.3+sm(C2.ft,C2.ft+.3,tt)*.7),flash:whistle+.6*win+.5*pulse(tt,C2.potm,1.2),board:()=>scoreboard(s,st,-4.4,win+fin)});
  type It={z:number;draw:()=>void};const items:It[]=[];
  const add=(g:Gen,style:AthleteStyle,d:'low'|'mid'|'auto'='low')=>items.push({z:g(tt).Z,draw:()=>athlete(s,st,g,tt,style,{detail:d})});
  add(twin('b'),PACO,'auto');add(twin('t'),TOMAS,'auto');
  JOY.forEach((_,i)=>add(joyPOR(i),POR(i+5)));SAD.forEach((_,i)=>add(sadFRA(i),i===3?GUIRIO:FRA(i+10)));
  items.push({z:13.5,draw:()=>ballOn(s,st,-1.2,BALL_R,13.5,120,{min:7})});
  items.sort((a,b)=>b.z-a.z).forEach(it=>it.draw());
  // "His twin": a green dashed ring round the pair; "Player of the Match": a yellow ring under Tomás and a burst
  const g=easeOutBack(sm(C2.twin,C2.twin+.35,tt))*(1-sm(C2.potm-.2,C2.potm+.2,tt));floorDashRing(s,st,G,HUG_P[0],HUG_P[1],1.1,10,131,g);
  const tm=twin('t')(tt),p=easeOutBack(sm(C2.potm,C2.potm+.35,tt));floorDashRing(s,st,Y,tm.X,tm.Z,.7,10,132,p);
  if(tt>=C2.potm&&tt<C2.potm+.9){const q=proj(st,tm.X,2.25,tm.Z);sparkBurst(s,Y,q[0],q[1],90,{n:12,seed:133,g:easeOut(sm(C2.potm,C2.potm+.35,tt))*(1-sm(C2.potm+.6,C2.potm+.9,tt))});}
 },
 aperture(t0){const{tt,tc}=clock(1,t0);return aperture(chestPts(st2(ftCam(tc).x),twin('b')(tt),BUILD_K,.14));},
 still:C2.twin+.4,
};

// ================= chapter 3 — HOW HE BLOCKS (demonstration, slow motion, floor-level camera off the far post) =================
const C3={how:A(2,'This is'),close:A(2,'too close'),big:A(2,'stays big'),arms:A(2,'arms wide'),leg:A(2,'one leg'),floor:A(2,'along the'),blk:A(2,'Blocked'),end:AUTH[2].seconds};
/** demo world: the shooter comes in from the LEFT (−X) and shoots low for the near post (−X); the keeper's right leg (−X side as he faces
 * the shooter) shoots out along the floor. The camera sits on the floor out to the right, beyond the far post. */
const KD:[number,number]=[-.2,GZ-1.15],SH3:[number,number]=[-1.7,GZ-4.9];
const KD_YAW=yawTo(SH3[0]-KD[0],SH3[1]-KD[1]);
const CT3=shinAt(KD[0],KD[1],KD_YAW);
const YAW3=yawTo(CT3[0]-SH3[0],CT3[2]-SH3[1]);
const SB3=strikeBall(YAW3),PL3:[number,number]=[SH3[0]-SB3[0],SH3[1]-SB3[2]];
const D_HIT=C3.leg-.15,D_BLK=Math.max(D_HIT+.9,C3.blk-.08);
const OUT3:V3=[-3.2,BALL_R,GZ-2.2];
const st3=(t:number):Stage=>({F:1500,eye:.6,cx:2.2-.3*sm(0,D_BLK,t,easeIO),cz:GZ-12.4+.8*sm(C3.how,D_HIT,t,easeIO)});
const demoS:Gen=t=>{
 const S0=D_HIT-.9,stT=key(t,[[S0,.1],[S0+.4,.24],[D_HIT,STRIKE_CONTACT],[D_HIT+1.2,.85],[C3.end,1]],linear);
 const X=key(t,mono([[0,PL3[0]-1.1],[S0,PL3[0]-.25,easeOut],[D_HIT,PL3[0],easeOut],[C3.end,PL3[0]+.2]])),Z=key(t,mono([[0,PL3[1]-2.4],[S0,PL3[1]-.5,easeOut],[D_HIT,PL3[1],easeOut],[C3.end,PL3[1]+.3]]));
 const pose=t<S0?dribble(t*.8,{foot:'r',speed:.3}):blendPose(dribble(S0*.8,{foot:'r',speed:.3}),strike(stT,{foot:'r'}),sm(S0,S0+.2,t));
 return{pose,yaw:lerp(yawTo(.35,1),YAW3,sm(S0-.6,S0,t,easeIO)),X,Z};};
function demoBall(t:number):{X:number;Y:number;Z:number;flying:boolean}{
 const S0=D_HIT-.9;
 if(t<S0){const f=demoS(t),ph=((t*.8)%1+1)%1;return{X:f.X+.12+.1*easeOut(ph),Y:BALL_R,Z:f.Z+.45+.1*easeOut(ph),flying:false};}
 if(t<D_HIT){const f=demoS(S0),u=sm(S0,S0+.35,t,easeOut);return{X:lerp(f.X+.2,SH3[0],u),Y:BALL_R,Z:lerp(f.Z+.5,SH3[1],u),flying:false};}
 if(t<D_BLK){const u=sm(D_HIT,D_BLK,t,linear);return{X:lerp(SH3[0],CT3[0],u),Y:lerp(BALL_R,CT3[1],u),Z:lerp(SH3[1],CT3[2],u),flying:true};}
 const u=sm(D_BLK,D_BLK+1.3,t,easeOut),p=quad3(CT3,[lerp(CT3[0],OUT3[0],.5),.6,lerp(CT3[2],OUT3[2],.5)],OUT3,u);return{X:p[0],Y:p[1],Z:p[2],flying:u<1};
}
/** the keeper: set → big (on "stays big") → arms wider → the block on the shot (full on "along the floor") → held */
const demoK:Gen=t=>{
 const set=keeperSet(t*.7);
 let pose=keyPoses(t,monoP([[0,set],[C3.big-.15,set],[C3.big+.35,BIG],[D_HIT-.25,BIG]]));
 const u=key(t,[[D_HIT-.25,0],[D_HIT+.25,.3],[D_BLK,.6],[D_BLK+.8,1]],linear);if(t>D_HIT-.25)pose=blendPose(BIG,block(u),sm(D_HIT-.25,D_HIT,t));
 return{pose,yaw:KD_YAW,X:KD[0],Z:KD[1]};};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3(tt),blk=pulse(t,D_BLK,.5);
  const kc=proj(st3(t),-.9,.8,GZ-2.8);
  camPath(s,t,[[0,kc[0]-120,kc[1]+10,1.3],[C3.close,kc[0]-40,kc[1]+20,1.34],[C3.big,kc[0]+170,kc[1]-10,1.75],[C3.arms,kc[0]+180,kc[1]-10,1.8],[C3.leg,kc[0]+40,kc[1]+20,1.42],[C3.floor,kc[0]+170,kc[1]+10,1.85],[C3.blk,kc[0]+170,kc[1]+10,1.9],[C3.end,kc[0]+130,kc[1],1.7]],[8*blk*Math.sin(t*90),5*blk*Math.cos(t*77)]);
  const b=demoBall(tt),k=demoK(tt),sk=solve(k.pose,BUILD_K,placeAt(k.X,k.Z,k.yaw));
  arena(s,st,{t:tt,cheer:.6*pulse(tt,D_BLK,1.6),flash:pulse(tt,D_BLK,1.2),
   keeper:stg=>{
    // "stays big": a yellow dashed outline round his whole body
    const g=easeOutBack(sm(C3.big,C3.big+.35,tt))*(1-sm(C3.leg,C3.leg+.4,tt));
    if(g>.02){const hd=toMine(sk.head),pl=toMine(sk.pelvis),c=proj(stg,pl[0],(hd[1]+.25)/2,pl[2]),h=kAt(stg,pl[2])*(hd[1]+.3)*.62*g,pts=blob(c[0],c[1],h*.82,h,141,{n:28,amp:.03});
     const p=ribbon([...pts,pts[0]],9,{seed:142,close:true,wobble:1,gaps:dashGaps(pts,30)});s.knockout(p);s.fill(Y,p);}
    athlete(s,stg,demoK,tt,PACO,{detail:'high',smear:tt>D_HIT&&tt<D_BLK+.1?.22:0});
    // "arms wide": yellow arrows out from both gloves
    const a=sm(C3.arms,C3.arms+.4,tt,easeOut)*(1-sm(C3.leg+.3,C3.leg+.7,tt));
    if(a>.02)for(const hand of[sk.lHa,sk.rHa]){const h=toMine(hand),pl=toMine(sk.pelvis),dx=h[0]-pl[0],dz=h[2]-pl[2],l=Math.hypot(dx,dz)||1,e:V3=[h[0]+dx/l*.7,h[1]+.12,h[2]+dz/l*.7],pts=[proj(stg,h[0],h[1],h[2]),proj(stg,(h[0]+e[0])/2,(h[1]+e[1])/2+.05,(h[2]+e[2])/2),proj(stg,e[0],e[1],e[2])];
     dashed(s,Y,pts,10,150,{dash:26,progress:a});if(a>.9)arrowHead(s,Y,pts,30);}
    // "along the floor": a green dashed floor arrow from under him along the leg to the foot
    const f=sm(C3.floor-.1,C3.floor+.5,tt,easeOut)*(1-sm(C3.blk+.5,C3.blk+1,tt));
    if(f>.02){const pl=toMine(sk.pelvis),ft=toMine(sk.rAn),pts=fp(stg,[[pl[0],pl[2]],[lerp(pl[0],ft[0],.5),lerp(pl[2],ft[2],.5)],[ft[0]+(ft[0]-pl[0])*.25,ft[2]+(ft[2]-pl[2])*.25]]);dashed(s,G,pts,12,152,{dash:30,progress:f});if(f>.9)arrowHead(s,G,pts,34);}
   }});
  // "too close": a red dashed line from the ball to his feet with end bars — no time to dive
  const cl=sm(C3.close,C3.close+.4,tt,easeOut)*(1-sm(C3.big+.2,C3.big+.6,tt));
  if(cl>.02){const bb=demoBall(tt),pts=fp(st,[[bb.X,bb.Z],[KD[0],KD[1]-.3]]);dashed(s,R,pts,11,160,{dash:26,progress:cl});
   for(const e of[[bb.X,bb.Z],[KD[0],KD[1]-.3]] as [number,number][]){const q=proj(st,e[0],0,e[1]),w=kAt(st,e[1])*.25*cl;s.fill(R,ribbon([[q[0]-w,q[1]],[q[0]+w,q[1]]],10,{seed:161,taper:0}),1);}}
  type It={z:number;draw:()=>void};const its:It[]=[{z:demoS(tt).Z,draw:()=>athlete(s,st,demoS,tt,DEMO_S,{detail:'high',smear:tt>D_HIT-.4&&tt<D_HIT+.3?.3:0})}];
  its.push({z:b.flying?b.Z:Math.min(b.Z,demoS(tt).Z+.01),draw:()=>{if(b.flying&&tt<D_BLK){const tr:Pt[]=[];for(let k2=0;k2<=10;k2++){const q=demoBall(Math.max(D_HIT,tt-.35+k2*.035));tr.push(proj(st,q.X,q.Y,q.Z));}const r=kAt(st,b.Z)*BALL_R,trp=ribbon(tr,r*1.3,{seed:170,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp);}
   ballOn(s,st,b.X,b.Y,b.Z,171,{rot:tt*5,smear:b.flying?.3:0,dir:Math.atan2(-.2,1)});
   if(tt>=D_BLK&&tt<D_BLK+.7){const q=proj(st,CT3[0],CT3[1],CT3[2]);sparkBurst(s,Y,q[0],q[1],130,{n:12,seed:172,g:easeOut(sm(D_BLK,D_BLK+.3,tt))*(1-sm(D_BLK+.45,D_BLK+.7,tt))});}}});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3(tt),demoK(tt),BUILD_K,.15));},
 still:D_BLK+.05,
};

// ================= chapter 4 — PRACTISE: kid-height, front-on: the gaps in the goal, stay big, legs close the low gap, a friend's shot, a tick =================
const C4={prac:A(3,'Practise'),fut:A(3,'In futsal'),big:A(3,'stay big'),legs:A(3,'use your'),close:A(3,'close shots'),end:AUTH[3].seconds};
const st4:Stage={F:1450,eye:1.1,cx:.5,cz:GZ-8.6};
const PK:[number,number]=[0,GZ-1.1],FR:[number,number]=[-.9,GZ-4.6];
const PK_YAW=yawTo(FR[0]-PK[0],FR[1]-PK[1]);
const CT4=shinAt(PK[0],PK[1],PK_YAW);
const YAW4=yawTo(CT4[0]-FR[0],CT4[2]-FR[1]);
const FB=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),FRIEND.build,{yaw:YAW4}),toe=toMine(sk.rToe);return[FR[0]+toe[0]+.06,FR[1]+toe[2]] as [number,number];})();
const P_HIT=C4.legs+.2,P_BLK=P_HIT+.32;
const practiceK:Gen=t=>{
 const set=keeperSet(t*1.3);
 let pose=keyPoses(t,monoP([[0,set],[C4.big-.2,set],[C4.big+.25,BIG],[P_HIT-.2,BIG]]));
 const u=key(t,[[P_HIT-.15,0],[P_HIT+.05,.3],[P_BLK,.6],[P_BLK+.5,1]],linear);if(t>P_HIT-.15)pose=blendPose(BIG,block(u),sm(P_HIT-.15,P_HIT,t));
 const up=sm(C4.close+.6,C4.close+1.1,t,easeIO);if(up>0)pose=blendPose(pose,PUMP,up);
 return{pose,yaw:PK_YAW,X:PK[0],Z:PK[1]};};
const friend:Gen=t=>{const stT=key(t,[[P_HIT-.5,.1],[P_HIT,STRIKE_CONTACT],[P_HIT+.6,1]],linear);
 const pose=t<P_HIT-.5?blendPose(stand(),dribble(t*.9,{foot:'r',speed:.1}),.6):strike(stT,{foot:'r'});
 return{pose,yaw:YAW4,X:FR[0],Z:FR[1]};};
function pBall(t:number):V3{
 if(t<P_HIT)return[FB[0],BALL_R,FB[1]];
 if(t<P_BLK){const u=sm(P_HIT,P_BLK,t,linear);return[lerp(FB[0],CT4[0],u),lerp(BALL_R,CT4[1],u),lerp(FB[1],CT4[2],u)];}
 const u=sm(P_BLK,P_BLK+.9,t,easeOut);return quad3(CT4,[CT4[0]-.9,.5,CT4[2]-1],[CT4[0]-2.2,BALL_R,CT4[2]-2.6],u);
}
/** the gaps in the goal mouth (goal plane Z = GZ): top corners, low corners; how open each is at time t */
const GAPS:[number,number,number,number][]=[[-1.5,1.25,-.75,2],[.75,1.25,1.5,2],[-1.5,0,-.55,.7],[.55,0,1.5,.7]];
function gapOpen(t:number,i:number){const on=sm(C4.fut,C4.fut+.4,t,easeOut),big=sm(C4.big,C4.big+.45,t,easeIO),legU=sm(P_HIT-.1,P_BLK,t,easeIO);
 const shut=i<2?big*.85:i===2?Math.max(.15*big,legU):.15*big+.35*legU;return on*(1-shut)*(1-sm(C4.close+.8,C4.close+1.3,t));}
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  camPath(s,t,[[0,60,120,1.12],[C4.fut,40,40,1.2],[C4.big,40,40,1.22],[C4.legs,20,120,1.18],[C4.close,20,120,1.2],[C4.end,30,110,1.24]]);
  const bp=pBall(tt);
  arena(s,st,{t:tt,cheer:.7*pulse(tt,P_BLK,1.6),flash:pulse(tt,P_BLK,1),
   mouth:stg=>{
    // the open gaps glow yellow, then close as he makes himself big and his leg goes out
    GAPS.forEach((g,i)=>{const o=gapOpen(tt,i);if(o<.03)return;const q=[proj(stg,g[0],g[1],GZ),proj(stg,g[2],g[1],GZ),proj(stg,g[2],g[3],GZ),proj(stg,g[0],g[3],GZ)],c=L2(q[0],q[2],.5),sc=.55+.45*o,qq=q.map(p=>L2(c,p,sc)),path=polyPath(qq,true);
     s.knockout(path,.7*o);s.fill(Y,path,.85*o);s.fill(K,ribbon([...qq,qq[0]],7,{seed:180+i,close:true,wobble:1,gaps:dashGaps(qq,24)}),o);});
   },
   keeper:stg=>{athlete(s,stg,practiceK,tt,PACO,{detail:'high',smear:tt>P_HIT&&tt<P_BLK+.1?.2:0});}});
  const its:{z:number;draw:()=>void}[]=[{z:FR[1],draw:()=>athlete(s,st,friend,tt,FRIEND,{detail:'high',smear:tt>P_HIT-.2&&tt<P_HIT+.2?.2:0})},
   {z:bp[2]<FR[1]+.3&&tt<P_HIT?FR[1]-.01:bp[2],draw:()=>{ballOn(s,st,bp[0],bp[1],bp[2],190,{rot:tt*6,smear:tt>P_HIT&&tt<P_BLK?.3:0,dir:0});
    if(tt>=P_BLK&&tt<P_BLK+.6){const q=proj(st,CT4[0],CT4[1],CT4[2]);sparkBurst(s,Y,q[0],q[1],110,{n:12,seed:191,g:easeOut(sm(P_BLK,P_BLK+.3,tt))*(1-sm(P_BLK+.4,P_BLK+.6,tt))});}}}];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "close shots": a big green tick stamps beside him
  const tk=easeOutBack(sm(C4.close+.2,C4.close+.55,tt));
  if(tk>.02){const g=proj(st,PK[0],0,PK[1]),h=kAt(st,PK[1])*1.8;tickMark(s,[g[0]+h*.75,g[1]-h*.85],h*.3*tk,409);}
 },
 still:C4.big+.6,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'bernardo-paco-futsal-signature',format:'futsal',title:'Bernardo Paçó’s block save',theme:'In futsal, stay big and use your legs to block close shots.',
 ageNote:'For players aged 7–12: the Futsal EURO 2026 semi-final save and the full-time scenes are real; the block technique is shown as a demonstration. Practise it with a friend.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in, a green shin slides out and blocks it, rings ripple; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const inU=sm(0,.25,age,easeOut),outU=sm(.25,.7,age,easeOut),bx=x-120+120*inU-90*outU,by=y-70*Math.sin(outU*Math.PI)*.8;
  const g=sm(.1,.25,age)*(1-sm(.5,.8,age));if(g>.02){const leg=ribbon([[x+140,y+r*.7],[x+40,y+r*.6],[x+r*.9,y+r*.55]],26*g,{seed:seed+3,taper:.3,wobble:1});s.knockout(leg);s.fill(G,leg,g);}
  const u=clamp((age-.25)/.5);if(age>.25&&u<1){s.fill(Y,ribbon(blob(x,y,r*(1+2*u),r*(.7+1.2*u),seed,{n:24}),8*(1-u)+2,{seed,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.8,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,by,r,seed,{rot:age*5});
 },
};
export default film;
