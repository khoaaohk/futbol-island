/** Zicky Té — "the pivot hold-up and turn": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHY THIS MOMENT: Zicky Té's entry (lib/town/iconicPlays.json) is a signature, the pivot's hold-up and turn, not one match. No written
 * source we could reach describes HOW any single Zicky goal was scored, so the film follows the brief's fallback rule: the real-match
 * chapters show ONLY confirmed things (the arena, the scoreboard, the celebration, the trophy) and never stage the goal; the move itself is
 * a separate, clearly labelled demonstration ("Here's how he does it", neutral training bib). His Euro 2022 semi-final double (the
 * equaliser and the late winner v Spain), as the tournament's player and a pivot, is the best-documented Zicky moment we could confirm.
 *  1  LIVE (broadcast camera, main stand, real time): UEFA Futsal EURO 2022 semi-final, 4 Feb 2022, Portugal 3–2 Spain, Ziggo Dome,
 *     Amsterdam. The camera is up on the hanging board: Spain lead 0–2 (Raúl Gómez 0'17", Chino 12'35"); Bruno Coelho (pen., 28'56") and
 *     Zicky (31'10") make it 2–2; the clock runs to 38'41" and the board flips to 3–2 (Zicky). Then it tilts down to the court: Zicky runs
 *     off celebrating, team-mates chase him, Spain's heads drop. No goal is staged and no ball is shown.
 *  2  CHAMPIONS (a closer, lower TV angle): the final two days later, 6 Feb 2022, Portugal 4–2 Russia (board 4–2, full time); the Portugal
 *     group jumps with the cup; Zicky is the player of the tournament (UEFA Golden Player) — a star stamps over him.
 *  3  HOW HE DOES IT (a demonstration, no match claimed; the defender wears a neutral yellow training bib): back to goal, sit low with the
 *     sole on the ball, hold the defender off with the arm, feel him lean one way, spin the other way, shoot.
 *  4  PRACTISE (lesson from the entry's `lesson`: "With your back to goal, hold off the defender, then spin and shoot."): three cards
 *     (hold, spin, shoot) and a tick, over the same demonstration.
 * Sources (written; fetched once and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "UEFA Futsal Euro 2022" (raw, fetched Sep 2026): semi-final 4 Feb 2022, 20:00, Ziggo Dome, Amsterdam, Portugal 3–2 Spain;
 *    goals Raúl Gómez 0'17", Chino 12'35", Bruno Coelho 28'56" (pen.), Zicky Té 31'10" and 38'41"; final 6 Feb 2022 Portugal 4–2 Russia;
 *    player of the tournament (Golden Player): Zicky Té. — https://en.wikipedia.org/wiki/UEFA_Futsal_Euro_2022
 *  - Wikipedia, "Zicky Té" (raw): Izaquel Gomes Té, born 1 Sep 2001 in Bissau; 1.85 m; position PIVOT; Sporting CP; world champion 2021,
 *    European champion 2022. — https://en.wikipedia.org/wiki/Zicky_T%C3%A9
 *  - UEFA.com (PT), "Sporting sagra-se bicampeão da UEFA Futsal Champions League" (3 May 2021): key player Zicky Té, "o seu papel de pivot",
 *    began Sporting's comeback in the 2021 final v Barça (the goal itself is not described). Background for the pivot role.
 *  - Maisfutebol, "Zicky: o menino da Guiné que foi do rinque ao Sporting e à Seleção" (2021): a pivot from the Bafatá rink in Loures;
 *    youngest scorer in the Portuguese league at 17. Background only.
 *  - UEFA.com match page 2034399 (Portugal v Spain) was fetched but carries no report text (script-rendered).
 * CONFIRMED: competition, round, date, venue, the score line (0–2 → 1–2 → 2–2 → 3–2) and every goal time on the board, the final two
 *  days later (Portugal 4–2 Russia), Zicky's player-of-the-tournament award, his position (pivot) and height (1.85 m).
 * INFERRED (never named in the narration): the kits (Portugal red shirts / green shorts drawn blue / red socks as the listed home side;
 *  Spain white shirts / navy shorts; Spain's keeper in yellow); the board's look and where it hangs; where on the court the celebration
 *  happens and who is where; the cup's shape (drawn generically) and who lifts it (not claimed); Zicky's short hair; his shirt number (not
 *  shown). HOW the goals were scored is unknown and deliberately not shown. Chapters 3–4 demonstrate the hold-up and turn (how a pivot does
 *  it, right foot), not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike and the spin). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 * z → −Z (verified: facing +X his left is the far side; facing the camera his left is screen right).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: red (Portugal, diagram rings), yellow (lights, bib, flight lines), blue (court, Portugal shorts), navy (key line, run-off, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,celebrate,posed,blendPose,keyPoses,mirrorPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';


const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];headline?:{text:string;at:number};heads?:Record<string,string>}[]=[
 {label:'Live: the Euro 2022 semi-final',text:'Euro 2022 semi-final. Portugal were two down to Spain, but Zicky made it two all. One minute to go, and Zicky scores again! Three two!',tail:3,
  cues:['Euro 2022','Portugal were','two down','Zicky made','One minute','Zicky scores','Three two'],heads:{'Euro 2022':'Semi-final 2022','two down':'0–2','Zicky made':'2–2','Three two':'3–2'}},
 {label:'Champions of Europe',text:'Two days later, Portugal beat Russia in the final. Champions of Europe! And Zicky is player of the tournament.',tail:2.2,
  cues:['Two days later','beat Russia','Champions of Europe','Zicky is','player of the'],heads:{'beat Russia':'4–2','Champions of Europe':'Champions','player of the':'Top player'}},
 {label:'How he does it',text:'His trademark is the hold-up and turn. Here’s how he does it: back to goal, he sits low and holds off the defender. He feels him lean, spins, and shoots!',tail:2,
  cues:['His trademark','how he does it','back to goal','sits low','holds off','feels him lean','spins','shoots'],heads:{'His trademark':'Hold-up + turn','shoots':''}},
 {label:'Practise it',text:'Your turn: back to goal, hold off the defender, spin and shoot!',tail:2.8,
  cues:['Your turn','back to goal','hold off','spin and','shoot'],heads:{'Your turn':'Hold, spin, shoot','shoot':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/zicky-te-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/zicky-te-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/zicky-te-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('zicky: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('zicky: no cue '+w);return c.at;};
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
/** dashes: gaps list for a ribbon so it prints as a dashed diagram line */
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line; on the blue court it is knocked out to paper first so the ink prints clean (no overprint) */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a floor quad (X,Z corners) clipped to just in front of the camera */
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}


// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_RIGHT=0,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
/** Zicky: born in Bissau, 1.85 m, a pivot (Wikipedia). Portugal red shirt / shorts (green, drawn blue) / red socks — kit inferred; short
 * hair inferred; no shirt number shown (not confirmed for this match); right foot inferred. */
const SKIN_Z:InkFill[]=[[R,.46],[Y,.6],[K,.28]];
const BUILD={height:1.85,bulk:1.06};
const ZICKY:AthleteStyle={shirt:R,shorts:B,socks:R,boots:K,skin:SKIN_Z,hair:K,line:K,trim:'paper',hairStyle:'short',build:BUILD,seed:6};
const SKINS:InkFill[][]=[[[Y,.42],[R,.28]],[[Y,.35],[R,.2]],[[Y,.46],[R,.36],[K,.14]],[[Y,.4],[R,.24]]];
const POR=(n:number):AthleteStyle=>({shirt:R,shorts:B,socks:R,boots:K,skin:SKINS[n%4],hair:K,line:K,trim:'paper',hairStyle:n%3?'short':'bald',build:{height:1.7+hash(n,3)*.14},seed:20+n});
/** Spain: white shirts, navy shorts (inferred change strip — Portugal were the listed home side) */
const ESP=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:SKINS[(n+1)%4],hair:K,line:K,trim:R,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Spain's keeper — yellow (inferred) */
const ESP_GK:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:SKINS[1],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:62};
/** the demonstration defender: a neutral yellow training bib (no team is claimed in chapters 3–4) */
const DEMO_D:AthleteStyle={shirt:[Y,.9],shorts:K,socks:K,boots:K,skin:[[Y,.4],[R,.24]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact: just past the kicking toe along the foot (library coords, place at the origin) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}
/** the pivot's poses (library, facing +x): HOLD = sit low, right sole on the ball, left arm back into the defender, head over the left
 * shoulder; FEEL = the same, leaning into him; SPIN = pivoting on the left foot, the right sole dragging the ball round */
const HOLD=posed({lHipF:34,rHipF:50,rKnee:74,rAnk:0,lKnee:72,lHipA:20,rHipA:10,lean:30,pitch:6,neckP:10,neckY:26,lShF:-34,lShA:56,lElb:16,rShA:34,rElb:52,twist:10});
const FEEL=posed({lHipF:34,rHipF:48,rKnee:76,rAnk:0,lKnee:76,lHipA:22,rHipA:10,lean:32,pitch:8,bend:-6,neckP:8,neckY:38,lShF:-44,lShA:64,lElb:10,rShA:38,rElb:56,twist:16});
const SPIN=posed({lHipF:14,lKnee:44,rHipF:34,rKnee:66,rHipA:26,rHipR:10,lean:18,twist:-26,bend:6,neckY:-30,lShA:66,rShA:48,lElb:46,rElb:40});

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
/** a ball on the floor of stage st at (X,Yh,Z): ground shadow + the ball */
function ballAt(s:Sheet,st:Stage,X:number,Yh:number,Z:number,seed:number,o:{min?:number;rot?:number;smear?:number;dir?:number}={}){
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,.45);ball(s,p[0],p[1],r,seed,{rot:o.rot,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, yellow / red / blue shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.22)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.34)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Spain's goal at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 // run-off (navy over blue) and the blue court; a faint sheen band across the middle of the court
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
 // boards and the crowd on the far side
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st,bulge,bz,by);o.keeper?.();sidePosts(s,st);
}
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
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;goal?:boolean;centre?:number};
/** the court seen end-on: blue floor + run-off, paper lines (goal line and D, or the halfway line + centre circle), boards, stands, the goal */
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0,goal:withGoal=true,centre}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const lineZ=centre??GZ,court=polyPath(floorQuad(st,-10,-30,10,lineZ+ (withGoal?0:10)),true);s.knockout(court,.25);s.fill(B,court,.82);
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
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
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
/** digits (and ':') as ribbons into `path`; h = digit height, sy squashes a flipping digit; returns the width used */
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
type Board={home:number;away:number;clock:string;flip:number;glow:number;awayInk:'spain'|'russia';blank?:boolean};
/** the board, flat to the camera, centred at sheet point c, k units per metre (6 m × 3 m) */
function scoreboard(s:Sheet,c:Pt,k:number,b:Board,seed:number){
 const W=6*k,H=3*k,x0=c[0]-W/2,y0=c[1]-H/2,box=handCut([[x0,y0],[x0+W,y0],[x0+W,y0+H],[x0,y0+H]],seed,k*.05,k*.9);
 // the rig cables up into the roof, the lit halo when a goal goes in
 const cab=new Path2D();for(const u of[.18,.82])cab.addPath(ribbon([[x0+W*u,y0],[x0+W*u+(u-.5)*k*.6,y0-k*9]],Math.max(2,k*.04),{seed:seed+2,taper:0,wobble:.5}));s.fill(K,cab,.8);
 if(b.glow>.02)s.fill(Y,polyPath(blob(c[0],c[1],W*.62*(1+.08*b.glow),H*.75*(1+.1*b.glow),seed+3,{amp:.04,n:28}),true),.35*b.glow);
 const bp=polyPath(box,true);s.knockout(bp);s.fill(K,bp,.92);s.fill(R,ribbon([...box,box[0]],k*.09,{seed:seed+4,close:true,wobble:.6}));
 // team swatches: Portugal red; Spain paper; Russia paper / blue / red bands
 const sw=k*.9,sh=k*.62,ly=y0+H*.2;
 const pr=polyPath(handCut([[x0+k*.35,ly],[x0+k*.35+sw,ly],[x0+k*.35+sw,ly+sh],[x0+k*.35,ly+sh]],seed+5,k*.02,k*.4),true);s.knockout(pr);s.fill(R,pr);
 const ax=x0+W-k*.35-sw,ap=polyPath(handCut([[ax,ly],[ax+sw,ly],[ax+sw,ly+sh],[ax,ly+sh]],seed+6,k*.02,k*.4),true);s.knockout(ap);
 if(b.awayInk==='russia'){s.fill(B,rectPath(ax,ly+sh/3,sw,sh/3));s.fill(R,rectPath(ax,ly+sh*2/3,sw,sh/3));}
 // the score (paper digits) with a dash; the flipping digit squashes; the clock (yellow) underneath
 if(b.blank)return;
 const dh=H*.36,num=new Path2D(),sy=1-.8*Math.sin(Math.PI*clamp(b.flip));
 digits(num,String(b.home),c[0]-k*1.35,ly-dh*.02,dh,seed+10,sy);digits(num,String(b.away),c[0]+k*.85,ly-dh*.02,dh,seed+20);
 num.addPath(ribbon([[c[0]-k*.32,ly+dh*.5],[c[0]+k*.32,ly+dh*.5]],dh*.13,{seed:seed+30,taper:0}));
 s.knockout(num);
 const clk=new Path2D(),ch=H*.2,cw=digits(new Path2D(),b.clock,0,0,ch,0);digits(clk,b.clock,c[0]-cw/2,y0+H*.7,ch,seed+40);s.knockout(clk);s.fill(Y,clk);
}
const mmss=(sec:number)=>{const m=Math.floor(sec/60),ss=Math.floor(sec%60);return`${m}:${ss<10?'0':''}${ss}`;};

// ================= chapter 1 — LIVE: Euro 2022 semi-final (confirmed things only: the board, the arena, the celebration) =================
const C1={por:A(0,'Portugal'),down:A(0,'two down'),made:A(0,'Zicky made'),minute:A(0,'One minute'),scores:A(0,'Zicky scores'),three:A(0,'Three'),end:AUTH[0].seconds};
/** the board over the centre of the court (X = 0, 11 m up, above the halfway line); goal times from the Wikipedia line-up box */
const BOARD_AT:V3=[0,11,10];
function board1(T:number):Board{
 const f1=C1.made+.05,f2=C1.made+.75,f3=C1.scores+.05;
 const home=T<f1?0:T<f2?1:T<f3?2:3,clock=T<f1?12*60+35:T<f2?28*60+56:T<C1.minute?31*60+10:lerp(38*60+29,38*60+41,sm(C1.minute,f3,T,linear));
 const last=T>=f3?f3:T>=f2?f2:T>=f1?f1:-9;
 return{home,away:2,clock:mmss(clock),flip:sm(last,last+.25,T,linear),glow:pulse(T,f3,1.6),awayInk:'spain'};
}
/** after the winner: Zicky runs off toward the near touchline, arms out; team-mates chase him; Spain's heads drop (positions inferred) */
const RUN0:[number,number]=[-12.4,8.6],RUN1:[number,number]=[-8.6,2.6];
const ZT=C1.scores;
const liveZ:Gen=T=>{const u=sm(ZT,ZT+2.6,T,easeOut),X=lerp(RUN0[0],RUN1[0],u),Z=lerp(RUN0[1],RUN1[1],u);
 let pose=celebrate((T-ZT)*1.3,{kind:'run'});pose=blendPose(pose,celebrate((T-ZT)*1.1,{kind:'arms'}),sm(ZT+2.2,ZT+2.8,T));
 return{pose,yaw:yawTo(RUN1[0]-RUN0[0],RUN1[1]-RUN0[1])+lerp(0,.9,sm(ZT+2.2,ZT+2.9,T)),X,Z};};
const MATES:[number,number][]=[[-5.2,11.6],[-14.8,14.8],[-4.6,5.2]];
const liveMate=(i:number):Gen=>T=>{const[x0,z0]=MATES[i],go=sm(ZT+.1+.2*i,ZT+2.8,T,easeIO),f=liveZ(ZT+2.8),tx=f.X+[1.1,-1.0,.9][i],tz=f.Z+[.9,1.1,-.5][i];
 const X=lerp(x0,tx,go),Z=lerp(z0,tz,go);let pose=blendPose(runCycle(T*runCadence(.9)+i*.3,{speed:.9}),celebrate(T*1.1+i*.3,{kind:'arms'}),sm(ZT+2.6,ZT+3,T));
 return{pose,yaw:go<.98?yawTo(tx-x0,tz-z0):FACE_CAMERA,X,Z};};
const SPAIN:[number,number][]=[[-15.2,11.2],[-13.4,5.8],[-11.2,13.6],[-16.4,7.8]];
const down=(i:number)=>posed({lHipF:6+i*3,rHipF:6,lKnee:10,rKnee:10+i*4,lean:20,neckP:44,lShA:10,rShA:10,lElb:20,rElb:20,twist:i*6});
const liveSpain=(i:number):Gen=>T=>({pose:blendPose(backpedal(.2+i*.2),down(i),sm(ZT,ZT+1,T)),yaw:FACE_RIGHT+[.4,-.3,.5,-.2][i],X:SPAIN[i][0],Z:SPAIN[i][1]});
/** Spain's keeper on his line, crouched, head down */
const liveK:Gen=T=>({pose:blendPose(keeperSet(.2),posed({lHipF:70,rHipF:70,lKnee:110,rKnee:110,lean:30,neckP:40,lShA:14,rShA:14,lElb:40,rElb:40}),sm(ZT,ZT+1.2,T)),yaw:FACE_RIGHT+.2,X:GOAL_X+.8,Z:9.6});
/** the camera: up on the board and the crowd for the score, then it tilts down onto the court for the celebration */
const liveCam=(T:number)=>({x:key(T,mono([[0,0],[C1.minute,0],[ZT+.5,0],[ZT+1.7,-8.4],[C1.end,-9.2]]),easeInOutSine),
 zoom:key(T,mono([[0,.5],[C1.down,.56],[C1.made,.74],[C1.minute,.9],[ZT+.5,.86],[ZT+1.7,.84],[C1.end,1.0]]),easeInOutSine),
 y:key(T,mono([[0,-170],[C1.down,-260],[C1.made,-560],[C1.minute,-720],[ZT+.5,-680],[ZT+1.7,1250],[C1.end,1300]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),g=pulse(Tc,ZT+.05,.35);
 cam(s,0,c.y+3*g*Math.sin(Tc*80),c.zoom);
 const cheer=T<ZT?.08+.25*sm(C1.minute,ZT,T):1-.35*sm(C1.end-1.5,C1.end,T);
 courtSide(s,st,T,{cheer,flash:pulse(T,ZT,1.2)+.5*pulse(T,C1.made+.75,1),keeper:()=>{athlete(s,st,liveK,T,ESP_GK,{detail:'low'});}});
 const bc=proj(st,BOARD_AT[0],BOARD_AT[1],BOARD_AT[2]);scoreboard(s,bc,kAt(st,BOARD_AT[2]),board1(T),501);
 // "Zicky made it two all" / "Zicky scores again": a red ring stamps round the home score on the board
 const kb=kAt(st,BOARD_AT[2]),ring=easeOutBack(sm(C1.made+.75,C1.made+1.1,T))*(1-sm(C1.minute-.3,C1.minute,T))+easeOutBack(sm(ZT+.05,ZT+.4,T))*(1-sm(ZT+1.2,ZT+1.5,T));
 if(ring>.02){const q=blob(bc[0]-kb*1.1,bc[1]-kb*.55,kb*.75*Math.min(1,ring),kb*.62*Math.min(1,ring),502,{n:22});const rp=ribbon([...q,q[0]],kb*.1,{seed:503,close:true,wobble:1});s.knockout(rp);s.fill(R,rp);}
 if(T>=ZT&&T<ZT+.9)sparkBurst(s,Y,bc[0],bc[1],kb*4,{n:12,seed:504,g:easeOut(sm(ZT,ZT+.3,T))*(1-sm(ZT+.5,ZT+.9,T))});
 if(T<ZT-.2)return;// the court below is out of shot until the tilt
 type It={z:number;draw:()=>void};const items:It[]=[];
 SPAIN.forEach((_,i)=>{const gg=liveSpain(i);items.push({z:gg(T).Z,draw:()=>athlete(s,st,gg,T,ESP(i),{detail:'low'})});});
 MATES.forEach((_,i)=>{const gg=liveMate(i);items.push({z:gg(T).Z,draw:()=>athlete(s,st,gg,T,POR(i),{detail:'low'})});});
 items.push({z:liveZ(T).Z,draw:()=>athlete(s,st,liveZ,T,ZICKY,{smear:T<ZT+1.5?.1:0})});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** Zicky's chest in a take (the passage enters his red shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveZ(tt),.12));},still:C1.three+.6};

// ================= chapter 2 — CHAMPIONS (TV, closer and lower): the final, 4–2 v Russia; the trophy; player of the tournament =================
const C2={later:A(1,'Two days'),russia:A(1,'beat Russia'),champs:A(1,'Champions'),zicky:A(1,'Zicky is'),best:A(1,'player of'),end:AUTH[1].seconds};
/** the Portugal group on the court with the cup (who lifts it is not claimed; the cup is drawn generically); Zicky front left */
const TEAM:[number,number,number][]=[[-1.05,4.7,0],[0,4.9,1],[1.05,4.7,2],[.62,3.85,3]];
const ZP:[number,number]=[-.6,3.7];
/** the arms-up jump, head kept level so the faces read to the TV camera */
const jump=(t:number,ph:number)=>{const p=celebrate(t*1.05+ph,{kind:'arms'});p.neckP=Math.max(p.neckP,-.12);return p;};
const teamGen=(i:number):Gen=>t=>{const[X,Z,ph]=TEAM[i];return{pose:blendPose(stand(),jump(t,ph*.23),sm(C2.champs-.6,C2.champs,t)),yaw:FACE_CAMERA+[.25,0,-.25,-.15][i],X,Z};};
const champZ:Gen=t=>({pose:blendPose(stand(),jump(t,.61),sm(C2.champs-.6,C2.champs,t)),yaw:FACE_CAMERA+.2,X:ZP[0],Z:ZP[1]});
const st2:Stage={F:1500,eye:2.5,cx:0,cz:-3};
const BOARD2:V3=[0,9.5,13];
/** the cup: a paper bowl on a stem, navy key line, a yellow glint */
function cup(s:Sheet,c:Pt,k:number,seed:number){
 const h=.62*k,w=.3*k,bowl:Pt[]=[[c[0]-w,c[1]-h],[c[0]+w,c[1]-h],[c[0]+w*.8,c[1]-h*.55],[c[0]+w*.22,c[1]-h*.32],[c[0]+w*.14,c[1]-h*.12],[c[0]+w*.5,c[1]],[c[0]-w*.5,c[1]],[c[0]-w*.14,c[1]-h*.12],[c[0]-w*.22,c[1]-h*.32],[c[0]-w*.8,c[1]-h*.55]];
 const q=smoothPts(bowl,true,6,2),p=polyPath(q,true);s.knockout(p);s.fill(Y,p,.18);s.fill(K,ribbon([...q,q[0]],Math.max(3,k*.02),{seed,close:true,wobble:.6}));
 s.knockout(polyPath(blob(c[0]-w*.45,c[1]-h*.78,w*.14,h*.12,seed+1,{n:10}),true));
 for(const sx of[-1,1]){const hq=ribbon([[c[0]+sx*w*.9,c[1]-h*.92],[c[0]+sx*w*1.35,c[1]-h*.78],[c[0]+sx*w*.95,c[1]-h*.58]],Math.max(3,k*.025),{seed:seed+2+sx,taper:0,wobble:.4});s.fill(K,hq);}
}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,bc=proj(st,BOARD2[0],BOARD2[1],BOARD2[2]),kb=kAt(st,BOARD2[2]),grp=proj(st,0,1.2,4.3);
  camPath(s,t,[[0,bc[0],bc[1]+120,1.05],[C2.russia+.4,bc[0],bc[1]+100,1.12],[C2.champs-.2,bc[0],bc[1]+160,1.05],[C2.champs+.9,grp[0],grp[1]-60,1.5],[C2.zicky,grp[0]-50,grp[1]-50,1.62],[C2.end,grp[0]-70,grp[1]-60,1.66]]);
  arena(s,st,{t:tt,goal:false,centre:9,cheer:sm(C2.champs-.4,C2.champs,tt),flash:pulse(tt,C2.champs,1.4)+.4*pulse(tt,C2.best,1.2)});
  // "beat Russia": the board prints the final score, 4–2 (Wikipedia), full time
  const lit=sm(C2.russia,C2.russia+.3,tt);scoreboard(s,bc,kb,{home:4,away:2,clock:'40:00',flip:lit,glow:pulse(tt,C2.russia+.15,1.4),awayInk:'russia',blank:lit<.5},601);
  // "Champions of Europe": confetti in front of the stands
  if(tt>=C2.champs){const u=sm(C2.champs,C2.champs+2.5,tt,linear),top=proj(st,0,6,WALLZ)[1];confetti(s,[R,Y,'paper'],[-900,top-200+u*500,1800,420],26,Math.floor(tt*6),{size:16});}
  // "Zicky is": a red ring stamps round his feet
  const zr=champZ(tt),rg=easeOutBack(sm(C2.zicky,C2.zicky+.35,tt));if(rg>.02)floorDashRing(s,st,R,zr.X,zr.Z,.6,9,602,rg);
  const its:{z:number;draw:()=>void}[]=TEAM.map((p,i)=>({z:p[1],draw:()=>{const gg=teamGen(i),a=athlete(s,st,gg,tt,POR(i+4),{detail:'mid'});
   if(i===1){const l=a.joints.lHa,r=a.joints.rHa,up=sm(C2.champs-.6,C2.champs,tt);const c:Pt=[lerp(l[0],r[0],.5),lerp(l[1],r[1],.5)+lerp(80,-10,up)];cup(s,c,kAt(st,p[1]),603);}}}));
  its.push({z:ZP[1],draw:()=>{athlete(s,st,champZ,tt,ZICKY,{detail:'high'});}});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "player of the tournament": a yellow star stamps over his head, with a navy misregistered echo
  const sg=easeOutBack(sm(C2.best,C2.best+.4,tt));
  if(sg>.02){const sk=solve(zr.pose,BUILD,placeAt(zr.X,zr.Z,zr.yaw)),hd=toMine(sk.head),hp=proj(st,hd[0],hd[1]+.55,hd[2]),r=kAt(st,hd[2])*.3*sg,q=star(hp[0],hp[1],r,.1*Math.sin(tt*3));
   s.fill(K,polyPath(star(hp[0]+6,hp[1]+6,r),true),.5);const sp=polyPath(q,true);s.knockout(sp);s.fill(Y,sp);s.fill(K,ribbon([...q,q[0]],5,{seed:604,close:true,wobble:.8}),.9);}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,champZ(tt),.13));},
 still:C2.best+.5,
};
/** a five-point star (the "top player" stamp) */
function star(cx:number,cy:number,r:number,rot=0):Pt[]{const q:Pt[]=[];for(let i=0;i<10;i++){const a=rot-Math.PI/2+i/10*TAU,rr=i%2?r*.45:r;q.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}return q;}

// ================= the demonstration (chapters 3–4): back to goal, sit low, hold off, feel the lean, spin, shoot =================
type TL={pass0:number;pass1:number;low:number;hold:number;lean:number;sp0:number;sp1:number;hit:number};
/** the pivot spot, 6.4 m out; the defender presses on his back (between him and the goal), a little to his left (+X) */
const Z0:[number,number]=[0,GZ-6.4],DPOS:[number,number]=[Z0[0]+.42,Z0[1]+.62];
const PASS_FROM:[number,number]=[-1.6,Z0[1]-7.5],TGT:V3=[-1.02,.42,GZ-.02];
/** the spin: he turns to his RIGHT (the −X side, away from the lean) and comes out on the defender's other shoulder, facing goal */
const SPIN_END:[number,number]=[Z0[0]-.62,Z0[1]+.34];
const DSH=(()=>{const dx=TGT[0]-SPIN_END[0],dz=TGT[2]-SPIN_END[1],l=Math.hypot(dx,dz);return[dx/l,dz/l] as [number,number];})();
const BSD:[number,number]=[SPIN_END[0]+DSH[0]*.55,SPIN_END[1]+DSH[1]*.55];
const YAW_SH=yawTo(TGT[0]-BSD[0],TGT[2]-BSD[1]),YAW_END=YAW_SH-TAU;// −π/2 → −π (facing −X) → the goal: a turn to his right
const DSB=toMine(strikeBall(YAW_SH)),DPL:[number,number]=[BSD[0]-DSB[0],BSD[1]-DSB[2]];
function demo(L:TL){
 const zick:Gen=t=>{
  let pose:Pose,yaw=FACE_CAMERA+.06*Math.sin(t*1.7),X=Z0[0]+.04*Math.sin(t*2.3),Z=Z0[1]+.03*Math.sin(t*1.9);
  if(t<L.pass1-.4)pose=blendPose(stand(),HOLD,.45+.15*Math.sin(t*2.2));
  else if(t<L.low)pose=blendPose(blendPose(stand(),HOLD,.45+.15*Math.sin(t*2.2)),HOLD,sm(L.pass1-.4,L.low,t));
  else if(t<L.hold)pose=HOLD;
  else if(t<L.sp0)pose=blendPose(HOLD,FEEL,sm(L.hold,Math.min(L.sp0,L.hold+.45),t));
  else if(t<L.sp1){const mid=lerp(L.sp0,L.sp1,.5);pose=keyPoses(t,[[L.sp0,FEEL],[mid,SPIN],[L.sp1,strike(.18,{foot:'r'})]]);const u=sm(L.sp0,L.sp1,t,easeIO);yaw=lerp(FACE_CAMERA,YAW_END,u);X=lerp(Z0[0],SPIN_END[0],u);Z=lerp(Z0[1],SPIN_END[1],u);}
  else{const st=key(t,[[L.sp1,.18],[L.hit,STRIKE_CONTACT],[L.hit+.6,1]],linear),u=sm(L.sp1,L.hit,t,easeOut);pose=strike(st,{foot:'r'});yaw=YAW_END;X=lerp(SPIN_END[0],DPL[0],u)+.25*DSH[0]*sm(L.hit,L.hit+.6,t);Z=lerp(SPIN_END[1],DPL[1],u)+.25*DSH[1]*sm(L.hit,L.hit+.6,t);
   pose=blendPose(pose,celebrate((t-L.hit-.7)*1.2,{kind:'arms'}),sm(L.hit+.7,L.hit+1.1,t));}
  return{pose,yaw,X,Z};};
 /** the ball under the right sole (w along heel → toe) */
 const sole=(t:number,w=.62):[number,number]=>{const a=zick(t),sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),toe=toMine(sk.rToe),heel=toMine(sk.rHeel);return[lerp(heel[0],toe[0],w),lerp(heel[2],toe[2],w)];};
 const arrive=sole(L.low),fl=.42;
 const ballAt=(t:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}=>{
  if(t<L.pass0)return{X:PASS_FROM[0],Y:BALL_R,Z:PASS_FROM[1],flying:false,spin:0};
  if(t<L.pass1){const u=sm(L.pass0,L.pass1,t,easeOut);return{X:lerp(PASS_FROM[0],arrive[0],u),Y:BALL_R,Z:lerp(PASS_FROM[1],arrive[1],u),flying:false,spin:u*14};}
  if(t<L.low)return{X:arrive[0],Y:BALL_R,Z:arrive[1],flying:false,spin:14};
  if(t<L.sp1-.12){const w=lerp(.62,.84,sm(L.sp0,L.sp0+.15,t)),[X,Z]=sole(t,w);return{X,Z,Y:BALL_R,flying:false,spin:14+Math.max(0,t-L.sp0)*8};}
  if(t<L.hit){const[x0,z0]=sole(L.sp1-.12,.84),u=sm(L.sp1-.12,L.sp1+.12,t);return{X:lerp(x0,BSD[0],u),Y:BALL_R,Z:lerp(z0,BSD[1],u),flying:false,spin:20};}
  if(t<L.hit+fl){const u=sm(L.hit,L.hit+fl,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(BSD[0],TGT[0],.5),.75,lerp(BSD[1],TGT[2],.5)];return{X:a*BSD[0]+b*M[0]+c*TGT[0],Y:a*BALL_R+b*M[1]+c*TGT[1],Z:a*BSD[1]+b*M[2]+c*TGT[2],flying:true,spin:30+u*30};}
  const d=sm(L.hit+fl,L.hit+fl+.5,t,easeOut);return{X:TGT[0],Y:lerp(TGT[1],BALL_R,d),Z:GZ+.2+.5*d,flying:false,spin:60};};
 /** the defender: chest on his back, arms on him → leans round his LEFT side (+X) → the spin leaves him; he turns to watch */
 const PRESS=posed({lHipF:30,rHipF:36,lKnee:50,rKnee:54,lean:24,lShF:52,rShF:44,lShA:20,rShA:22,lElb:34,rElb:40,neckP:10});
 const def:Gen=t=>{const lu=key(t,[[L.lean-.15,0],[L.lean+.35,.6],[L.sp1+.4,.75],[L.hit+1,1]],linear);
  let pose=blendPose(backpedal(t*.9),PRESS,.8);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(L.lean-.25,L.lean,t));
  const turn=sm(L.sp1,L.hit+.4,t,easeIO);pose=blendPose(pose,posed({lHipF:30,rHipF:26,lKnee:44,rKnee:40,lean:16,neckP:6,lShA:30,rShA:30,lElb:40,rElb:40}),turn*.6);
  return{pose,yaw:FACE_CAMERA+turn*1.9,X:DPOS[0]+.22*sm(L.lean-.2,L.lean+.4,t),Z:DPOS[1]};};
 return{zick,def,ball:ballAt};
}
/** floor arc round (X,Z): angles a0 → a1 (radians, 0 = +X, + toward +Z), radius r */
function floorArc(st:Stage,X:number,Z:number,r:number,a0:number,a1:number,n=18):Pt[]{const o:Pt[]=[];for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);o.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return o;}
/** the demo scene: the court end-on, the two figures, the ball, the cue diagrams */
function demoScene(s:Sheet,st:Stage,tt:number,D:ReturnType<typeof demo>,L:TL,c:{trade?:number;how?:number;back:number;low?:number;holds:number;feels?:number;spins:number;shoots:number},detail:'mid'|'high'){
 const b=D.ball(tt),net=tt>=L.hit+.42;
 arena(s,st,{t:tt,cheer:.35*pulse(tt,L.hit+.42,1.4),bulge:.5*sm(L.hit+.3,L.hit+.42,tt)*(1-.6*sm(L.hit+.7,L.hit+1.6,tt))+.12*settle(tt,L.hit+.42,{amp:1,freq:3,decay:3}),bx:TGT[0],by:TGT[1]});
 const z=D.zick(tt),d=D.def(tt);
 // "His trademark": a yellow turn arrow circles him on the floor (the hold-up and turn, in one sign)
 if(c.trade!==undefined&&c.how!==undefined){const g=sm(c.trade,c.trade+.6,tt,easeOut)*(1-sm(c.how+.2,c.how+.6,tt));if(g>.02){const pts=floorArc(st,z.X,z.Z,.95,-Math.PI/2,-Math.PI/2-1.6*Math.PI*g);dashed(s,Y,pts,12,301,{dash:34});if(g>.9)arrowHead(s,Y,pts,34,302);}}
 // the pass in (navy dashed, as it rolls)
 if(tt>L.pass0&&tt<L.low+.6&&L.pass0>0){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=D.ball(lerp(L.pass0,Math.min(tt,L.pass1),k/10));pts.push(proj(st,q.X,0,q.Z));}dashed(s,K,pts,9,303,{dash:28,cov:.8});}
 // "back to goal": a red dashed line from his heels to the goal behind him
 {const g=sm(c.back,c.back+.5,tt,easeOut)*(1-sm(c.holds+.4,c.holds+.8,tt));if(g>.02){const pts:Pt[]=[];for(let k=0;k<=8;k++)pts.push(proj(st,lerp(z.X-.15,-.2,k/8),0,lerp(z.Z+.3,GZ-.5,k/8)));dashed(s,R,pts,11,304,{dash:36,progress:g});if(g>.9)arrowHead(s,R,pts,32,305);}}
 // "sits low": a blue ring round his feet (the wide, low base)
 if(c.low!==undefined){const g=easeOutBack(sm(c.low,c.low+.35,tt))*(1-sm(c.spins-.3,c.spins,tt));if(g>.02)floorDashRing(s,st,B,z.X,z.Z,.55,8,306,g);}
 // "holds off": a yellow shield arc on the defender's side, between the two of them
 {const g=sm(c.holds,c.holds+.4,tt,easeOut)*(1-sm(c.spins,c.spins+.3,tt));if(g>.02){const a0=Math.atan2(d.Z-z.Z,d.X-z.X),pts=floorArc(st,z.X,z.Z,.42,a0-.95*g,a0+.95*g,12),rp=ribbon(pts,15,{seed:307,taper:.3,wobble:1});s.knockout(rp);s.fill(Y,rp);}}
 // "feels him lean": a red arrow shows the defender's weight going round the left side
 if(c.feels!==undefined){const g=sm(c.feels+.1,c.feels+.6,tt,easeOut)*(1-sm(c.shoots,c.shoots+.4,tt));if(g>.02){const a=proj(st,DPOS[0]+.1,0,DPOS[1]-.05),e=proj(st,DPOS[0]+1.3,0,DPOS[1]-.45),pts=partial([a,L2(a,e,.5),e],g),rp=ribbon(pts,12,{seed:308,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(g>.6)arrowHead(s,R,pts,30,309);}}
 // "spins": the yellow turn arrow, the other way (to his right, round the defender's other shoulder)
 {const g=sm(c.spins-.1,c.spins+.45,tt,easeOut)*(1-sm(c.shoots+.2,c.shoots+.6,tt));if(g>.02){const pts=floorArc(st,Z0[0]-.2,Z0[1]+.1,.8,-Math.PI/2,-Math.PI/2-Math.PI*1.15*g);dashed(s,Y,pts,13,310,{dash:34});if(g>.9)arrowHead(s,Y,pts,36,311);}}
 // "shoots": the flight line
 if(tt>L.hit){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=D.ball(lerp(L.hit,Math.min(tt,L.hit+.42),k/14));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,312,{dash:40});}
 // figures back to front; the ball goes in right after the one it is in front of
 const items:{z:number;draw:()=>void}[]=[
  {z:d.Z,draw:()=>athlete(s,st,D.def,tt,DEMO_D,{detail})},
  {z:z.Z+.001,draw:()=>athlete(s,st,D.zick,tt,ZICKY,{detail,smear:(tt>L.sp0&&tt<L.sp1)||(tt>L.hit-.2&&tt<L.hit+.2)?.18:0})},
  {z:b.flying?b.Z:(tt<L.pass1?b.Z:z.Z-.3),draw:()=>{const bp=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),br=kAt(st,b.Z)*BALL_R;shadow(s,g[0],g[1],br*1.15,br*.3,313,b.flying?.3:.45);ball(s,bp[0],bp[1],br,314,{rot:b.spin,smear:b.flying?.35:0,dir:Math.atan2(.3,.2)});}},
 ];
 items.sort((a,c2)=>c2.z-a.z).forEach(it=>it.draw());
 if(net&&tt<L.hit+1.2){const p=proj(st,TGT[0],TGT[1]+.3,GZ+.3);sparkBurst(s,Y,p[0],p[1],120,{n:10,seed:315,g:easeOut(sm(L.hit+.42,L.hit+.7,tt))*(1-sm(L.hit+.9,L.hit+1.2,tt))});}
}

// ================= chapter 3 — HOW HE DOES IT =================
const C3={trade:A(2,'His trademark'),how:A(2,'how he'),back:A(2,'back to'),low:A(2,'sits low'),holds:A(2,'holds off'),feels:A(2,'feels'),spins:A(2,'spins'),shoots:A(2,'shoots'),end:AUTH[2].seconds};
const TL3:TL={pass0:C3.back-.5,pass1:C3.back+.8,low:C3.low,hold:C3.holds,lean:C3.feels+.2,sp0:C3.spins-.1,sp1:C3.spins+.55,hit:C3.shoots+.1};
const DEMO3=demo(TL3);
const st3:Stage={F:1500,eye:2.3,cx:2.8,cz:Z0[1]-7.4};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,f0=proj(st,Z0[0],1.0,Z0[1]),g=proj(st,-.4,1.1,GZ),mid=L2(f0,g,.45);
  camPath(s,t,[[0,f0[0]+60,f0[1]-40,1.7],[C3.how,f0[0]+40,f0[1]-20,1.9],[C3.back,f0[0]+10,f0[1]+10,2.15],[C3.feels,f0[0]+10,f0[1]+10,2.25],[C3.spins+.3,L2(f0,mid,.6)[0],L2(f0,mid,.6)[1],1.8],[C3.shoots+.3,mid[0],mid[1]-10,1.68],[C3.end,mid[0],mid[1]-10,1.64]]);
  demoScene(s,st,tt,DEMO3,TL3,C3,'high');
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,DEMO3.zick(tt),.13));},
 still:C3.holds+.3,
};

// ================= chapter 4 — PRACTISE: back to goal, hold off, spin and shoot; three cards; a tick =================
const C4={turn:A(3,'Your turn'),back:A(3,'back to'),hold:A(3,'hold off'),spin:A(3,'spin and'),shoot:A(3,'shoot'),end:AUTH[3].seconds};
const TL4:TL={pass0:-3,pass1:-2.5,low:-2,hold:C4.hold,lean:C4.hold+.55,sp0:C4.spin-.05,sp1:C4.spin+.42,hit:C4.shoot+.08};
const DEMO4=demo(TL4);
const st4:Stage={F:1500,eye:1.9,cx:2.2,cz:Z0[1]-6.2};
const CARD_W=150,CARD_H=165;
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,f0=proj(st,Z0[0],.9,Z0[1]),g=proj(st,-.4,1,GZ),fc=L2(f0,g,.3);
  camPath(s,t,[[0,fc[0],fc[1]+40,1.35],[C4.back,fc[0],fc[1]+190,1.12],[C4.end,fc[0],fc[1]+190,1.12]]);
  demoScene(s,st,tt,DEMO4,TL4,{back:C4.back,holds:C4.hold,spins:C4.spin,shoots:C4.shoot},'mid');
  // three cards rise on "Your turn": HOLD, SPIN, SHOOT — each prints its figure on its word
  const rise=sm(C4.turn,C4.turn+.6,tt,easeOut);
  if(rise>.01){const cy=fc[1]+190+335+(1-rise)*600,xs=[fc[0]-360,fc[0],fc[0]+360],on=[C4.back,C4.spin,C4.shoot],cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   xs.forEach((cx,i)=>{const q=handCut([[cx-CARD_W,cy-CARD_H],[cx+CARD_W,cy-CARD_H],[cx+CARD_W,cy+CARD_H],[cx-CARD_W,cy+CARD_H]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(B,cards,.16);
   xs.forEach((cx,i)=>{const u=sm(on[i],on[i]+.3,tt,easeOutBack);if(u<=.01)return;const gy=cy+CARD_H-28;
    const fcam=figureCam({x:cx+10,y:gy,height:350*(.9+.1*u),azimuth:i===2?-130:-150,elevation:14,fov:16,at:[.2,0,0]});
    s.save();s.clip(polyPath(outline[i],true));
    const pose=i===0?HOLD:i===1?SPIN:strike(STRIKE_CONTACT,{foot:'r'}),sk=solve(pose,BUILD,{}),toe=sk.rToe,heel=sk.rHeel,w=i===2?1.25:.62,cb:V3=[lerp(heel[0],toe[0],w),BALL_R,lerp(heel[2],toe[2],w)];
    const bb=fcam.project(cb),bR=BALL_R*(fcam.scale?fcam.scale(cb):100),Pc=(j:V3):Pt=>{const q=fcam.project(j);return[q[0],q[1]];};
    // the move's diagram: hold = a yellow shield arc behind him, spin = a yellow turn arrow, shoot = a red arrow to goal
    if(i===0){const pts:Pt[]=[];for(let k=0;k<=10;k++){const a=Math.PI*.6+k/10*Math.PI*.8;pts.push(Pc([Math.cos(a)*.55,0,Math.sin(a)*.55]));}s.fill(Y,ribbon(pts,10,{seed:84,taper:.3,wobble:1}));}
    if(i===1){const pts:Pt[]=[];for(let k=0;k<=12;k++){const a=-Math.PI*.2-k/12*Math.PI*1.3;pts.push(Pc([Math.cos(a)*.6,0,Math.sin(a)*.6]));}dashed(s,Y,pts,8,85,{dash:20});arrowHead(s,Y,pts,22,86);}
    if(i===2){const a0=Pc([cb[0]+.15,0,cb[2]]),a1=Pc([cb[0]+1.2,0,cb[2]]);const pts:Pt[]=[a0,L2(a0,a1,.5),a1];dashed(s,R,pts,8,87,{dash:22});arrowHead(s,R,pts,24,88);}
    shadow(s,bb[0],Pc([cb[0],0,cb[2]])[1],bR*1.1,bR*.3,89+i,.4);ball(s,bb[0],bb[1],bR,81+i);
    drawAthlete(s,pose,fcam,{...ZICKY,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "shoot": a big blue tick stamps over the SHOOT card, with a navy misregistered echo
  const tick=easeOutBack(sm(C4.shoot+.35,C4.shoot+.7,tt));
  if(tick>.02){const c:Pt=[fc[0]+500,fc[1]+190+200],S=150*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(B,tp);}
 },
 still:C4.hold+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'zicky-te-futsal-signature',format:'futsal',title:'Zicky Té’s hold-up and turn',theme:'With your back to goal, hold off the defender, then spin and shoot.',
 ageNote:'For players aged 7–12: the Euro 2022 semi-final winner is real (how it was scored is not described in our sources); the hold-up and turn is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball drops under a navy sole print, then a yellow turn arrow swings round it; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const fall=sm(0,.25,age,easeIn),by=y-150*(1-fall),u=clamp((age-.25)/.6);
  s.fill(K,polyPath(blob(x,y+r*.95,r*(.7+.3*fall),r*.2,seed+2,{n:16}),true),.32);
  if(age>.25&&u<1){const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=-Math.PI/2+k/14*Math.PI*1.4*u;pts.push([x+Math.cos(a)*r*2,y+r*.4+Math.sin(a)*r*.8]);}const rp=ribbon(pts,9*(1-u)+3,{seed,taper:.3,wobble:1});s.knockout(rp);s.fill(Y,rp);if(u>.3)arrowHead(s,Y,pts,24*(1-u)+10,seed+1);}
  ball(s,x,by,r,seed,{rot:age*4});
  const tap=sm(.2,.3,age)*(1-sm(.45,.7,age));if(tap>.02){const sole=blob(x+4,by-r-10+18*(1-tap),r*1.1,r*.34,seed+3,{n:18});s.fill(K,polyPath(sole,true),.85*tap);}
 },
};
export default film;
