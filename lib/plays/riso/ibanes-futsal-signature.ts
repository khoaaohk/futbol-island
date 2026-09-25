/** Daniel Ibañes — "the close-control turn": a signature-move riso film (iconic plays, FUTSAL; the card calls him an ala).
 *
 * WHO: the card's Daniel Ibañes is Daniel Ibañes Caetano, known as "Daniel" (born 6 Jul 1976 in Brazil — en.wikipedia says São Paulo,
 *  es.wikipedia Sorocaba), a naturalised SPANISH futsal ala: Caja Segovia 1996–2002, Inter Movistar 2002–2010, 108–117 caps for Spain,
 *  world champion 2000, World Cup runner-up 2008, four European titles; twice voted the Spanish league's best right ala (98/99, 01/02).
 *  Card bio (lib/town/playerBios.json): "Brazilian-born Spain star who scored in the 2000 World Cup final win over Brazil and won many titles
 *  with Inter Movistar"; country Spain (playerAppearance.json). Sources match the card's country, bio and club — no namesake problem.
 *  (At the 2000 World Cup his club was Caja Segovia; the film never names a club.)
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — "the close-control turn", lesson "Drag the ball back with your
 *  sole to escape a defender" — not one match. No written source we could reach describes ONE dated drag-back turn of his, so the film
 *  follows the brief's honest FALLBACK: the real-match chapter shows only confirmed things, and the move is a labelled demonstration.
 *  The match: 2000 FIFA Futsal World Championship SEMI-FINAL, 1 December 2000, Domo Polideportivo (CDAG), Guatemala City, attendance
 *  7,128: SPAIN 3–2 RUSSIA (1–1 at half time). Daniel (Spain no. 14) scored twice — 2–1 at 23:03 and the WINNER at 39:05, with 55 seconds
 *  left on the countdown — after Verizhnikov had made it 2–2 at 38:04. Spain then beat Brazil 4–3 in the final (3 Dec 2000) for their
 *  first world title. (Match choice: no other futsal film uses this semi-final; the 2000 FINAL — Javi Rodríguez's two late penalties —
 *  is left to his film; Kike's film uses 2004, Schumacher's 2008, Falcão's 2012, Manoel Tobias's 1996.)
 *  1  LIVE (broadcast camera, main stand, real time), CONFIRMED THINGS ONLY: the second half about to start at 1–1 (the half-time score),
 *     no. 14 ringed; whip pan (a cut in time) to just after his 23:03 goal — ball in the Russia net, board 2–1, Daniel wheeling away,
 *     team-mates running in (HOW the goal was scored is NOT shown); whip pan to just after Russia's 38:04 equaliser — board 2–2, Russia
 *     running back, a 0:55 countdown chip; whip pan to just after his 39:05 winner — ball in the net, board 3–2, Daniel's knee slide;
 *     confetti for the world title that followed (the final is only named in the narration and headline, not shown).
 *  2  HOW HE DOES IT (a demonstration, slowed to the narration, side-on from the main stand; Daniel in a plain red training top, a neutral
 *     paper-shirt defender; no match claimed): the defender rushes in; Daniel stops the ball under his sole, drags it back just before the
 *     defender's stab arrives, the stab finds nothing, and he turns away into space with the ball.
 *  3  YOUR TURN (the same move from a low reverse angle, in front of him; lesson from the entry's `lesson`): 1 step on it, 2 pull it back,
 *     3 turn away — numbered chips, the drag arrow, the escape path, a tick.
 * Sources (written; fetched with curl, ≤ 8 requests, cached in scratchpad/films/src-cache/):
 *  - FIFA.com (web.archive.org copy, 1 Jul 2013), FIFA Futsal World Championship Guatemala 2000, Semi-finals, Spain – Russia 3:2 (1:1)
 *    (fifa-2000-futsal-sf-esp-rus.txt): match 37, 01 December 2000, Guatemala City / Domo Polideportivo, 16:00, attendance 7128; referee
 *    SALINAS RAMIREZ Francisco (PAR); Spain [1] JESUS (GK)(C), [7] JAVI RODRIGUEZ, [9] JAVI SANCHEZ, [10] PAULO ROBERTO, [14] DANIEL, subs
 *    incl. [8] KIKE, [12] LUIS AMADO; Russia [1] Oleg DENISOV (GK), [4] Alexander VERIZHNIKOV (C), [2] Konstantin EREMENKO …; events
 *    VERIZHNIKOV 2'01", PAULO ROBERTO 15'02", DANIEL 23'03", VERIZHNIKOV 38'04", DANIEL 39'05" (countdown 0'55").
 *    https://web.archive.org/web/20130701080122/http://www.fifa.com/tournaments/archive/futsalworldcup/guatemala2000/matches/round=4145/match=21516/index.html
 *  - Wikipedia, "2000 FIFA Futsal World Championship" (raw; wiki-2000-futsal-wc.txt) and es "Copa Mundial de fútbol sala de la FIFA 2000"
 *    (eswiki-copa-mundial-futsal-2000.txt): semi-final 1 Dec 2000, Spain 3–2 Russia (1:1 at half time, es), Daniel 23:03 + 39:05; final
 *    3 Dec 2000 Spain 4–3 Brazil (Daniel 2' pen.); Spain's first title, ending Brazil's run of three; Daniel 10 goals, Bronze Ball.
 *  - Wikipedia, "Daniel Ibañes" (en, raw; wiki-daniel-ibanes.txt) and "Daniel Ibañes Caetano" (es, raw; eswiki-daniel-ibanes.txt): as WHO.
 * CONFIRMED (the only things the narration states): the city, the year, the tournament, semi-final, Spain v Russia, Daniel's goal to 2–1,
 *  Russia's equaliser (2–2), his second goal with fifty-five seconds left (3–2), Spain world champions (they won the final).
 * INFERRED (never named in the narration): the kits (Spain red shirts / blue shorts; Russia white shirts / blue shorts; Denisov in a
 *  yellow keeper kit) — the 2000 strips are unverified; the look of the arena, the wood floor, the board and the crowd; which end each team
 *  attacked; every player's position; where and how Daniel celebrated (a run with arms out, then a knee slide); his hair (short, dark) and
 *  build (1.75 m); which foot he uses for the drag-back (the LEFT sole is drawn). No video was reviewed. Chapters 2–3 are a demonstration of
 *  the card's move (the classic sole drag-back and turn), not a recreation of any match play.
 * Technique (poses; the drag-back poses follow the approved Puskás drag-back film): dribbling in, he stops the ball under the LEFT sole
 *  (toes up, weight on a bent right leg, arms out); as the defender commits he rolls it back under his body, hips sinking; the defender's
 *  stab arrives at the spot the ball has just left; he swivels to his LEFT (away from the defender) and pushes the ball into space.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the drag, the stab and the knee slide). Choreography lives in LOCAL court frames (u = metres out from the Russia goal
 *  line, v = across; +v is the left of a player facing +u); each stage maps it with a proper rotation (never a mirror), so the left sole
 *  stays the left sole. Our stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues. The move is
 *  authored once on its own clock τ (τ = 0: the sole lands on the ball) and each chapter maps its cues onto τ.
 * Inks: yellow (wood court, lights, diagrams), red (Spain, arrows), blue (shorts, flags), navy (key line, stands, board).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈150–300 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,clampPose,runCycle,runCadence,dribble,backpedal,lunge,celebrate,posed,blendPose,keyPoses,
 type Pose,type Build,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: Guatemala 2000',text:'Guatemala City, 2000. The Futsal World Cup semi final: Spain against Russia. Daniel scores. Two one! Russia equalise. With fifty five seconds left, Daniel scores again! Three two, and Spain go on to become world champions.',tail:2.4,
  cues:['Guatemala City','The Futsal','Spain against','Daniel scores','Two one','Russia equalise','With fifty','scores again','Three two','Spain go on','world champions'],
  heads:{'Guatemala City':'World Cup 2000','Spain against':'Semi-final','Two one':'2–1','Russia equalise':'2–2','With fifty':'0:55 left','Three two':'3–2','world champions':'Champions'}},
 {label:'How he does it',text:'How does Daniel escape a defender? Watch how he does it. The defender rushes in. Daniel puts his sole on the ball and drags it back. The defender misses, and Daniel turns away.',tail:2.4,
  cues:['How does','Watch how','The defender rushes','his sole','drags it back','The defender misses','turns away'],heads:{'How does':'How he does it','his sole':'Sole on it','drags it back':'Drag it back','The defender misses':'Missed','turns away':'Turn away'}},
 {label:'Your turn',text:'Your turn. When a defender gets close, step on the ball, pull it back with your sole, and turn away.',tail:2.8,
  cues:['Your turn','defender gets','step on','pull it back','turn away'],heads:{'Your turn':'Your turn','step on':'Step on it','pull it back':'Pull it back','turn away':'Turn away'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/ibanes-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/ibanes-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/ibanes-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('ibanes: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('ibanes: no cue '+w);return c.at;};
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
const L2=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
const pulse=(t:number,t0:number,len=1)=>t<t0?0:Math.min(1,(t-t0)*10)*Math.exp(-(t-t0)*2.4/len);

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the wood */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
/** a yellow dashed line cased in navy (reads on the yellow wood) */
function cased(s:Sheet,pts:Pt[],width:number,seed:number,o:{dash?:number;progress?:number}={}){dashed(s,K,pts,width*1.8,seed,{...o,ko:false,cov:.9});dashed(s,Y,pts,width,seed,{...o});}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function casedHead(s:Sheet,pts:Pt[],size:number,seed:number){arrowHead(s,K,pts,size*1.35,seed,.9);arrowHead(s,Y,pts,size,seed);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a hand-drawn ring (navy echo under a coloured ring) round a sheet point */
function inkRing(s:Sheet,ink:string,p:Pt,r:number,w:number,seed:number){if(r<2)return;s.fill(K,ribbon(blob(p[0]+5,p[1]+5,r,r*.92,seed,{n:20}),w*.6,{seed:seed+1,close:true,wobble:1}),.6);const q=ribbon(blob(p[0],p[1],r,r*.92,seed,{n:20}),w,{seed:seed+2,close:true,wobble:1});s.knockout(q);s.fill(ink,q,1);}

// ---------------- the LOCAL court frame: u = metres out from the Russia goal line (0 = the line), v = across (0 = the goal's centre) ----------------
/** a stage frame: where the goal centre sits on the stage floor and the rotation (a proper rotation, never a mirror) */
type Frame={ox:number;oz:number;rot:number};
const toStage=(fr:Frame,u:number,v:number):[number,number]=>{const c=Math.cos(fr.rot),sn=Math.sin(fr.rot);return[fr.ox+u*c-v*sn,fr.oz+u*sn+v*c];};
type Loc={pose:Pose;yaw:number;u:number;v:number};
type LGen=(t:number)=>Loc;
type P2=[number,number];

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
/** yaw that faces the floor direction (du,dv) (library yaw 0 faces +u; + turns toward +v, i.e. to the player's left) */
const yawTo=(du:number,dv:number)=>Math.atan2(dv,du);
const SKIN:InkFill[]=[[Y,.74],[R,.3],[K,.04]];
const BUILD={height:1.75,bulk:1};
/** Daniel: Spain no. 14 (FIFA line-up) — red shirt, blue shorts, red socks (kit inferred), short dark hair (card), 1.75 m (inferred) */
const DANIEL:AthleteStyle={shirt:R,shorts:B,socks:R,boots:K,skin:SKIN,hair:K,line:K,trim:Y,number:14,numberInk:Y,hairStyle:'short',build:BUILD,seed:14};
/** the demonstration (chapters 2–3): Daniel in a plain red training top, navy shorts and socks — no match kit, no number */
const DANIEL_TRAIN:AthleteStyle={...DANIEL,shorts:K,socks:K,number:null,seed:15};
/** Spain team-mates (red / blue, inferred) */
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:B,socks:R,boots:K,skin:[[[Y,.78],[R,.24]],[[Y,.66],[R,.34],[K,.06]],[[Y,.8],[R,.2]]][n%3] as InkFill[],hair:K,line:K,trim:Y,number:null,hairStyle:(['short','balding','curly'] as const)[n%3],build:{height:1.72+hash(n,3)*.1},seed:30+n});
/** Russia (inferred): white shirts, blue shorts, white socks */
const RUS=(n:number):AthleteStyle=>({shirt:'paper',shorts:B,socks:'paper',boots:K,skin:[[Y,.62],[R,.2]],hair:n%3?K:[Y,.9],line:K,trim:R,hairStyle:n%2?'short':'bald',build:{height:1.74+hash(n,3)*.12},seed:20+n});
/** Oleg Denisov, Russia's keeper (no. 1, FIFA line-up): a yellow keeper kit (inferred) */
const RUS_GK:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.66],[R,.2]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:61};
/** the demonstration defender: a neutral paper training shirt, navy shorts — no team is claimed */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
/** THE adapter: draw one athlete from a local generator at time t on stage st / frame fr (prev = one drawn frame earlier; smear = motion echo) */
function athlete(s:Sheet,st:Stage,fr:Frame,gen:LGen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number;dt?:number}={}){
 const pl=(l:Loc)=>{const[X,Z]=toStage(fr,l.u,l.v);return placeAt(X,Z,l.yaw+fr.rot);};
 const a=gen(t),b=gen(t-(o.dt??1/12)),cm=projector(st);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl(a),{prevPlace:pl(c),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl(a),{prev:b.pose,prevPlace:pl(b)});
}
/** a skeleton in the local frame: joints come back as [u, height, v] */
function jointsL(l:Loc,build:Build=BUILD){const sk=solve(l.pose,build,{x:l.u,z:-l.v,yaw:l.yaw}),J=(j:V3):[number,number,number]=>[j[0],j[1],-j[2]];return{sk,J};}

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;smear?:number;dir?:number}={}){
 const{rot=0,smear=0,dir=0}=o;let pts=blob(x,y,r,r,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);s.fill(K,rectPath(x-r*.1,y-r*1.2,r*1.4,r*2.4),.18);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);
type BallL={u:number;y:number;v:number;spin:number};
/** a ball drawn on stage st through frame fr, with its floor shadow */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:BallL,seed:number,min=9){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,.45);ball(s,p[0],p[1],r,seed,{rot:b.spin});return{p,r};
}

// ---------------- the arena: wood court, stands (Spain and Russia flags), futsal goal ----------------
/** stepped navy rows, lit faces, red and blue shirts, Spanish (red-yellow-red) and Russian (white-blue-red) flags, roof lights;
 * cheer lifts the heads; crowd = the share of seats taken (7,128 came to the semi-final) */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,crowd=.72){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),yels=new Path2D(),whites=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977;if(hash(i,8)>crowd)continue;const hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.22)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.36)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)yels.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 // flags: Spain (red, yellow, red bands) and Russia (white, blue, red bands), waving
 for(let f=0;f<4;f++){const fx=-2000+f*1100+hash(f,6)*300-((off*.3)%1100),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  if(f%2){whites.addPath(band(0,.34));blues.addPath(band(.34,.67));reds.addPath(band(.67,1));}
  else{reds.addPath(band(0,.25));yels.addPath(band(.25,.75));reds.addPath(band(.75,1));}}
 s.fill(Y,heads,.6);s.knockout(whites);s.fill(R,reds);s.fill(B,blues);s.fill(Y,yels);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** convex hull of a few points (goal quads seen from any angle stay clean) */
function convex(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo:Pt[]=[],up:Pt[]=[];
 for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}
/** a futsal goal (3 m × 2 m) on any frame: net halftone + mesh bulging round (bv, by); posts red/paper bands */
function goalNet(s:Sheet,st:Stage,fr:Frame,bulge:number,bv:number,by:number){
 const H=2,Db=.95,Dt=.55,P=(u:number,Yh:number,v:number):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,Yh,Z);};
 const back=(v:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((v-bv)**2+(Yh-by)**2)/.35);return P(-lerp(Db,Dt,Yh/H)-d,Yh,v);};
 const pts=[P(0,0,-1.5),P(0,H,-1.5),P(0,H,1.5),P(0,0,1.5),back(1.5,0),back(1.5,H),back(-1.5,H),back(-1.5,0)];
 const hull=polyPath(convex(pts),true);s.knockout(hull,.6);s.fill(K,hull,.2);
 const mesh=new Path2D();for(let v=-1.5;v<=1.5+1e-6;v+=.3){const a=back(v,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(v,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(-1.5,Yh);mesh.moveTo(a[0],a[1]);for(let v=-1.2;v<=1.5+1e-6;v+=.3){const b=back(v,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const v of[-1.5,1.5])for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=P(0,Yh,v),b=back(v,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 const Zc=toStage(fr,0,0)[1];s.stroke(K,mesh,Math.max(1.6,kAt(st,Zc)*.018),.6);
}
function goalPosts(s:Sheet,st:Stage,fr:Frame){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),P=(u:number,Yh:number,v:number):[Pt,number]=>{const[X,Z]=toStage(fr,u,v);return[proj(st,X,Yh,Z),kAt(st,Z)];};
 const Zc=toStage(fr,0,0)[1],lw=Math.max(2,kAt(st,Zc)*.012);
 const bar=(a:V3,b:V3,n:number)=>{const seg=(u0:number,u1:number):Pt[]=>{const[p0,k0]=P(lerp(a[0],b[0],u0),lerp(a[1],b[1],u0),lerp(a[2],b[2],u0)),[p1,k1]=P(lerp(a[0],b[0],u1),lerp(a[1],b[1],u1),lerp(a[2],b[2],u1));
   const dx=p1[0]-p0[0],dy=p1[1]-p0[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;return[[p0[0]+nx*w*k0,p0[1]+ny*w*k0],[p1[0]+nx*w*k1,p1[1]+ny*w*k1],[p1[0]-nx*w*k1,p1[1]-ny*w*k1],[p0[0]-nx*w*k0,p0[1]-ny*w*k0]];};
  const q=seg(-.02,1.02);frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<n;k+=2)bands.addPath(polyPath(seg(k/n,(k+1)/n),true));};
 bar([0,0,-1.5],[0,H,-1.5],8);bar([0,0,1.5],[0,H,1.5],8);bar([0,H,-1.5],[0,H,1.5],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
/** a local polyline → stage floor points, densified; points behind (or too near) the camera are dropped */
function localLine(st:Stage,fr:Frame,pts:P2[],step=.5):Pt[]{const out:P2[]=[pts[0]];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));for(let k=1;k<=n;k++)out.push([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n)]);}
 return out.map(([u,v])=>toStage(fr,u,v) as Pt).filter(p=>p[1]>st.cz+1.2);}
/** the court's painted lines in the local frame ('full': goal line, the D, the 6 m and 10 m spots, touchlines, halfway, centre circle;
 * 'mid': halfway and the centre circle only) */
function courtLines(st:Stage,fr:Frame,lines:Path2D,kind:'full'|'mid'){
 const add=(pts:P2[])=>{const q=localLine(st,fr,pts);if(q.length>=2)lines.addPath(polyPath(floorStrip(st,q,.05),true));};
 if(kind==='full'){const arc:P2[]=[];
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([6*Math.sin(a),-1.5-6*Math.cos(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([6*Math.sin(a),1.5+6*Math.cos(a)]);}
  add([[0,-10],[0,10]]);add(arc);add([[0,-10],[40,-10]]);add([[0,10],[40,10]]);
  for(const u of[6,10]){const[X,Z]=toStage(fr,u,0);if(Z>st.cz+1.2)lines.addPath(polyPath(floorRing(st,X,Z,.12,12),true));}}
 add([[20,-10],[20,10]]);
 const cc:P2[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([20+Math.cos(a)*3,Math.sin(a)*3]);}add(cc);
}
const BOARDS=21;
type CourtOpt={cheer?:number;flash?:number;bulge?:number;bv?:number;by?:number;crowd?:number;keeper?:()=>void;goal?:boolean;lines?:'full'|'mid'};
/** the court: wood planks (running along X), the painted lines through the frame, the boards and ads, the stands, the goal */
function courtSide(s:Sheet,st:Stage,t:number,fr:Frame,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1,goal=true,lines:lk='full'}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.45);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 const strips=new Path2D(),seams=new Path2D(),X0=st.cx-30,X1=st.cx+30,z00=Math.max(-1,st.cz+.6);
 for(let k=0;k<46;k++){const z0=z00+k*.5,z1=z0+.5;if(z0>BOARDS)break;const a=proj(st,X0,0,z0),b=proj(st,X1,0,z1);if(hash(k,5)>.55)strips.rect(a[0],b[1],b[0]-a[0],a[1]-b[1]);seams.moveTo(a[0],a[1]);seams.lineTo(proj(st,X1,0,z0)[0],a[1]);
  for(let x=Math.floor(X0/2.4)*2.4+hash(k,9)*2.4;x<X1;x+=2.4){const p=proj(st,x,0,z0),q=proj(st,x,0,z1);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,fr,lines,lk);s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx,o.crowd);
 if(goal)goalNet(s,st,fr,bulge,bv,by);o.keeper?.();if(goal)goalPosts(s,st,fr);
}

// ---------------- helpers shared by the chapters ----------------
const cp=(d:Partial<Pose>)=>clampPose(posed(d));
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
type JName='pelvis'|'chest'|'head'|'lToe'|'lAn'|'lHeel'|'rToe'|'rAn';
/** a joint of a player on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:JName,build:Build=BUILD):Pt{const{sk,J}=jointsL(l,build),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
/** the player's chest (the passage enters his red shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
function tickAt(s:Sheet,c:Pt,S:number,seed:number){if(S<1)return;const tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
 const tp=ribbon(tk,S*.24,{seed,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:seed-1,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
function crossAt(s:Sheet,c:Pt,r:number,seed:number){if(r<2)return;for(const q of[[[c[0]-r,c[1]-r],[c[0]+r,c[1]+r]],[[c[0]+r,c[1]-r],[c[0]-r,c[1]+r]]] as Pt[][]){const rb=ribbon(q,Math.max(6,r*.28),{seed,taper:.2,wobble:1});s.knockout(rb);s.fill(R,rb);}}

// ---------------- seven-segment digits (the arena board, the clock chips, the step numbers) ----------------
const SEG:Record<string,number[]>={'0':[0,1,2,4,5,6],'1':[2,5],'2':[0,2,3,4,6],'3':[0,2,3,5,6],'4':[1,2,3,5],'5':[0,1,3,5,6],'6':[0,1,3,4,5,6],'7':[0,2,5],'8':[0,1,2,3,4,5,6],'9':[0,1,2,3,5,6]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** width of a seven-segment string */
const segW=(str:string,h:number)=>[...str].reduce((a,c)=>a+(c===':'?h*.3:c==='-'?h*.5:h*.55)+h*.2,-h*.2);
function segText(p:Path2D,str:string,x:number,y:number,h:number){let cx=x;for(const c of str){if(c===':'){p.rect(cx+h*.08,y+h*.25,h*.14,h*.14);p.rect(cx+h*.08,y+h*.62,h*.14,h*.14);cx+=h*.3+h*.2;}else if(c==='-'){p.rect(cx,y+h*.45,h*.5,h*.12);cx+=h*.5+h*.2;}else{digit(p,c,cx,y,h);cx+=h*.55+h*.2;}}}
/** a panel with yellow digits (glow knocks the digits to paper for a flash); box ink navy by default */
function segPanel(s:Sheet,cx:number,top:number,str:string,h:number,seed:number,glow=0,o:{tabs?:[string,string];box?:string}={}){
 const W=segW(str,h)+h*1.4,H=h*1.5,box=polyPath(handCut([[cx-W/2,top],[cx+W/2,top],[cx+W/2,top+H],[cx-W/2,top+H]],seed,3,80),true);s.knockout(box);s.fill(o.box??K,box);
 if(o.tabs){const p1=new Path2D(),p2=new Path2D();p1.rect(cx-W/2+h*.2,top+h*.08,W*.16,h*.1);p2.rect(cx+W/2-h*.2-W*.16,top+h*.08,W*.16,h*.1);if(o.tabs[0]==='paper')s.knockout(p1);else s.fill(o.tabs[0],p1);if(o.tabs[1]==='paper')s.knockout(p2);else s.fill(o.tabs[1],p2);}
 const lit=new Path2D();segText(lit,str,cx-segW(str,h)/2,top+h*.3,h);s.knockout(lit);s.fill(Y,lit,1-.75*Math.min(1,glow));return{W,H};
}

// ================= chapter 1 — LIVE: Spain 3–2 Russia, 2000 World Cup semi-final, Guatemala City. Only confirmed things: the second half
// about to start at 1–1; (cut) just after his 23:03 goal, 2–1; (cut) just after Russia's 38:04 equaliser, 2–2, 0:55 left; (cut) just after
// his 39:05 winner, 3–2; confetti for the world title. The Russia goal is at X = −20 (stage), the near touchline Z = 0. =================
const FA:Frame={ox:-20,oz:10,rot:0};
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
const C1={gc:A(0,'Guatemala'),fut:A(0,'The Futsal'),spain:A(0,'Spain against'),sc:A(0,'Daniel scores'),two:A(0,'Two one'),eq:A(0,'Russia equalise'),ff:A(0,'With fifty'),again:A(0,'scores again'),three:A(0,'Three two'),go:A(0,'Spain go'),champ:A(0,'world champions'),end:AUTH[0].seconds};
/** three whip pans (cuts in time): second half at 1–1 → just after 23:03 (2–1) → just after 38:04 (2–2) → just after 39:05 (3–2) */
const W0=C1.sc-.12,W1=W0+.26,WM=(W0+W1)/2,V0=C1.eq-.14,V1=V0+.26,VM=(V0+V1)/2,X0=C1.again-.14,X1=X0+.26,XM=(X0+X1)/2;
const phaseOf=(T:number)=>T<WM?0:T<VM?1:T<XM?2:3;
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return cp({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
const SAD=cp({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:10,rShA:10,lElb:24,rElb:24});
const walkSad=(t:number,ph:number)=>blendPose(runCycle(t*.9+ph,{speed:0,stride:.5}),SAD,.55);
/** second half about to start (1–1): Spain (attacking −u) around the centre spot, Daniel wide on the far side (spots inferred) */
const KO_D:P2=[22.6,4.4],KO_ESP:P2[]=[[20.4,.4],[22.9,-3.9],[26.4,.6]],KO_RUS:P2[]=[[17.1,-2.7],[17.2,3.3],[14.6,.2],[16.7,.9]];
/** just after 23:03: Daniel wheels away toward the near corner, arms out; team-mates run in */
const CEL0:P2=[7.4,-.9],CEL1:P2=[4.9,-6.4];
/** just after 39:05: the knee slide toward the near touchline (ends ≈ 2.5 m on) */
const SL0:P2=[6.6,-1.6],DEND:P2=[6.6,-4.0];
const NET1:BallL={u:-.5,y:BALL_R,v:.7,spin:1},NET2:BallL={u:-.5,y:BALL_R,v:-.8,spin:2};
const liveD:LGen=T=>{
 const ph=phaseOf(T);
 if(ph===0)return{pose:idle(T,.2),yaw:Math.PI,u:KO_D[0],v:KO_D[1]};
 if(ph===1){const go=sm(WM,WM+2.2,T,easeOut),stop=sm(WM+1.9,WM+2.5,T);
  return{pose:blendPose(celebrate((T-WM)*1.2,{kind:'run'}),celebrate((T-WM)*1.1,{kind:'arms'}),stop),yaw:lerp(yawTo(CEL1[0]-CEL0[0],CEL1[1]-CEL0[1]),-Math.PI/2,stop),u:lerp(CEL0[0],CEL1[0],go),v:lerp(CEL0[1],CEL1[1],go)};}
 if(ph===2){const w=sm(VM,XM,T,linear);return{pose:walkSad(T,.3),yaw:Math.PI*.92,u:lerp(24.2,22.8,w),v:lerp(5.6,4.6,w)};}
 const k=sm(XM,XM+1.6,T,linear);return{pose:celebrate(.08+.92*k,{kind:'kneeSlide'}),yaw:-Math.PI/2,u:SL0[0],v:SL0[1]};};
/** Spain team-mates (0 takes the restarts) */
const liveM=(i:number):LGen=>T=>{
 const ph=phaseOf(T);
 if(ph===0){const p=KO_ESP[i];return{pose:idle(T,.5+i*.3),yaw:Math.PI,u:p[0],v:p[1]};}
 if(ph===2){const p=([[20.4,.4],[23.2,-3.6],[26,.8]] as P2[])[i];return{pose:i===0?idle(T,.4):SAD,yaw:Math.PI+(i-1)*.3,u:p[0],v:p[1]};}
 const t0=ph===1?WM:XM,a=(ph===1?[[12.4,2.6],[15.6,-2.6],[19.2,1.4]]:[[11,1.5],[14.5,-1.2],[17.5,2.5]])[i] as P2,end=ph===1?CEL1:DEND,
  tg:P2=[end[0]+[1,-.9,.2][i],end[1]+[.8,.9,1.6][i]],go=sm(t0,t0+2.6+.3*i,T,easeOut),u=lerp(a[0],tg[0],go),v=lerp(a[1],tg[1],go);
 return{pose:blendPose(celebrate((T-t0)*1.2+i*.3,{kind:'run'}),celebrate((T-t0)*1.1+i*.4,{kind:'arms'}),sm(.85,1,go)),yaw:go<.9?yawTo(tg[0]-a[0],tg[1]-a[1]):-Math.PI/2+[.3,-.3,.1][i],u,v};};
/** Russia's outfield four: set for the restart; heads down after each Daniel goal; after the equaliser they run back celebrating */
const liveR=(i:number):LGen=>T=>{
 const ph=phaseOf(T);
 if(ph===0){const p=KO_RUS[i];return{pose:idle(T,.1+i*.27),yaw:0,u:p[0],v:p[1]};}
 if(ph===2){const a=([[30.5,3.2],[31.5,-2.2],[32.4,.8],[29.4,-4.8]] as P2[])[i],b=([[17.3,3.2],[17.2,-2.7],[14.8,.3],[16.9,-5]] as P2[])[i],go=sm(VM,VM+3.2+.2*i,T,easeOut);
  return{pose:blendPose(celebrate((T-VM)*1.2+i*.25,{kind:'run'}),idle(T,i*.3),sm(.9,1,go)),yaw:go<.92?Math.PI:0,u:lerp(a[0],b[0],go),v:lerp(a[1],b[1],go)};}
 const p=(ph===1?[[3.4,2.9],[6.2,-3.4],[2.2,-1.8],[10.4,4.2]]:[[2.6,1.9],[5.2,3.0],[1.7,-2.6],[9.8,-.4]])[i] as P2;
 return{pose:SAD,yaw:[2.6,-2.3,2.2,-2.8][i],u:p[0],v:p[1]};};
/** Denisov: turned to the ball in his net after each Daniel goal (drawn only then) */
const liveGK:LGen=T=>phaseOf(T)===1?{pose:SAD,yaw:Math.PI-.9,u:1.4,v:1.2}:{pose:SAD,yaw:Math.PI+.8,u:1.1,v:-1.6};
const liveCam=(T:number)=>({x:key(T,mono([[0,-.2],[C1.fut,1.4],[C1.spain,2.4],[W0,2.6],[W1,-16],[C1.two,-15.8],[V0,-15.7],[V1,3.6],[C1.ff,2.8],[X0,2.7],[X1,-15.9],[C1.three,-15.6],[C1.end,-15.3]]),easeInOutSine),
 zoom:key(T,mono([[0,.6],[C1.fut,.64],[C1.spain,.78],[W0,.8],[W1,.74],[C1.two,.8],[V0,.8],[V1,.66],[C1.ff,.74],[X0,.74],[X1,.76],[C1.three,.84],[C1.champ,.72],[C1.end,.7]]),easeInOutSine),
 y:key(T,mono([[0,1050],[C1.spain,1020],[W0,1010],[W1,1000],[C1.two,990],[V0,990],[V1,1010],[X0,1000],[X1,990],[C1.champ,960],[C1.end,950]]),easeInOutSine)});
/** the arena board above the far boards: Spain (red tab) left, Russia (paper tab) right */
function scoreboard(s:Sheet,st:Stage,camX:number,score:string,glow=0){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],h=1.1*kw;
 const p=segPanel(s,cx,top-h*1.5,score,h,131,glow,{tabs:[R,'paper']});
 return{cx,top:top-h*1.5,h,W:p.W};
}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const ph=phaseOf(T),net=ph===1?NET1:ph===3?NET2:null,t0=ph===1?WM:ph===3?XM:0;
 courtSide(s,st,T,FA,{cheer:ph===0?.15:ph===2?.25:.9,flash:ph===1?pulse(T,WM,1.2)+.4*pulse(T,C1.two,1):ph===3?pulse(T,XM,1.2)+.5*pulse(T,C1.three,1.2)+.5*pulse(T,C1.champ,1.4):ph===2?.3*pulse(T,VM,1):0,crowd:.72,
  bulge:net?.28*(1-sm(t0,t0+1.4,T))+.08*settle(T,t0,{amp:1,freq:3,decay:3}):0,bv:net?net.v:0,by:.5,
  keeper:()=>{if(net){athlete(s,st,FA,liveGK,T,RUS_GK,{detail:'low'});drawBallL(s,st,FA,net,17,13);}}});
 const sb=scoreboard(s,st,c.x,['1-1','2-1','2-2','3-2'][ph],ph===1?pulse(T,C1.two,.8):ph===2?pulse(T,VM+.1,.8):ph===3?pulse(T,C1.three,.8):0);
 // the clock chips left of the board: 23:03 · 38:04 then "0:55 left" (ringed red) · 39:05
 const chip=(str:string,g:number,glow:number,seed:number)=>{if(g<=.02)return null;const hh=sb.h*.8*g,x=sb.cx-sb.W/2-segW(str,hh)/2-hh*1.4,y=sb.top+sb.h*.3;segPanel(s,x,y,str,hh,seed,glow);return{x,y,hh};};
 if(ph===1)chip('23:03',easeOutBack(sm(C1.two,C1.two+.35,T)),pulse(T,C1.two+.1,.6),151);
 if(ph===2){if(T<C1.ff)chip('38:04',easeOutBack(sm(VM+.2,VM+.55,T)),0,152);
  else{const q=chip('0:55',easeOutBack(sm(C1.ff,C1.ff+.35,T)),pulse(T,C1.ff+.1,.5)+.5*pulse(T,C1.ff+.9,.5),153);if(q){const w=segW('0:55',q.hh)+q.hh*1.4;inkRing(s,R,[q.x,q.y+q.hh*.75],w*.62,Math.max(8,q.hh*.14),154);}}}
 if(ph===3)chip('39:05',easeOutBack(sm(XM+.2,XM+.55,T)),pulse(T,C1.three+.1,.6),155);
 const items:Item[]=[];
 [0,1,2,3].forEach(i=>{const g=liveR(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,RUS(i),{detail:'low'})});});
 [0,1,2].forEach(i=>{const g=liveM(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,ESP(i),{detail:'low'})});});
 items.push({z:depth(FA,liveD(T))-.02,draw:()=>athlete(s,st,FA,liveD,T,DANIEL,{detail:'mid',smear:ph===3&&T<XM+1.2?.12:0})});
 if(ph===0||ph===2)items.push({z:10,draw:()=>{drawBallL(s,st,FA,{u:20,y:BALL_R,v:0,spin:0},18);}});
 // "Spain against Russia": a red ring under no. 14 (Daniel) and a "14" chip over his head
 const ringD=ph===0?easeOutBack(sm(C1.spain,C1.spain+.35,T)):ph===2?easeOutBack(sm(C1.ff,C1.ff+.35,T)):0;
 if(ringD>.02){const l=liveD(T),[X,Z]=toStage(FA,l.u,l.v);items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.15,22,70,ringD);floorDashRing(s,st,R,X,Z,1.15,14,71,ringD);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 if(ph===0){const g=easeOutBack(sm(C1.spain+.15,C1.spain+.5,T));if(g>.02){const l=liveD(T),h=jointPt(st,FA,l,'head'),kk=kAt(st,depth(FA,l));segPanel(s,h[0],h[1]-kk*.95,'14',kk*.6*g,160,0,{box:R});}}
 // the ball in the net, ringed yellow (it is small on the wide shot)
 if(net){const g=easeOutBack(sm(t0+.1,t0+.5,T))*(1-sm(t0+2.2,t0+2.7,T));if(g>.02){const[X,Z]=toStage(FA,net.u,net.v),p=proj(st,X,net.y,Z);inkRing(s,Y,p,kAt(st,Z)*.42*g,10,75);}}
 // "world champions": red, yellow and paper confetti over the court
 if(ph===3&&T>=C1.champ-.2){const top=proj(st,c.x,0,BOARDS)[1]-.95*kAt(st,BOARDS),u=sm(C1.champ-.2,C1.champ+3,T,linear),x0=proj(st,c.x-6,0,10)[0],x1=proj(st,c.x+6,0,10)[0];confetti(s,[R,Y,'paper'],[x0,top-120+u*560,x1-x0,620],40,Math.floor(T*6),{size:64});}
 // the whip pans: yellow speed lines sweep across the frame (cuts in time)
 for(const[a0,a1] of[[W0,W1],[V0,V1],[X0,X1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FA,liveD(tt),.14));},still:C1.two+.4};

// ================= THE MOVE (chapters 2–3), authored once on its own clock τ (seconds; τ = 0: the left sole lands on the ball) =================
// Local frame as chapter 1: Daniel attacks toward −u (yaw π); his LEFT side is −v. The defender comes out at him facing +u.
/** the sole on the ball: left leg forward, toes up so the sole sits on top of the ball, weight on a bent right leg, arms out */
const SOLE=posed({lHipF:36,lKnee:30,lAnk:-24,lHipA:6,rHipF:12,rKnee:40,rAnk:-4,lean:14,pitch:4,lShA:52,rShA:40,lShF:6,rShF:14,lElb:40,rElb:44,neckP:34,squash:-.04});
const HOLD=posed({lHipF:33,lKnee:34,lAnk:-22,lHipA:6,rHipF:10,rKnee:46,lean:12,pitch:3,lShA:60,rShA:46,lElb:36,rElb:40,neckP:24,neckY:14,twist:-6,squash:-.05});
/** the drag: the left sole rolls the ball back under him, hips sink, he starts to swivel away from the stab */
const DRAGM=posed({lHipF:8,lKnee:54,lAnk:-10,lHipA:4,rHipF:18,rKnee:44,lean:18,pitch:5,twist:12,bend:-6,lShA:70,rShA:34,rShF:22,lElb:30,rElb:44,neckP:38,squash:-.07});
const DRAGE=posed({lHipF:-16,lKnee:66,lAnk:12,rHipF:20,rKnee:36,lean:20,pitch:4,twist:16,bend:-8,lShA:62,rShA:38,rShF:24,lElb:34,rElb:44,neckP:34,squash:-.03});
const RU=13;// Daniel's root when the sole lands (13 m out, in line with the goal)
const TOUCH_IN=-.45,DRAG0=.22,DRAG1=.56,REACH=.62,TURN0=.72,TURN1=1.15;
/** the escape heading: he swivels to his LEFT, away from the stab (yaw π → π + 2.3: toward +u and −v) */
const HEAD=Math.PI+2.3,HD:P2=[Math.cos(HEAD),Math.sin(HEAD)];
const danRoot=(τ:number):P2=>{
 if(τ<0)return[key(τ,[[-3.6,RU+4.6,linear],[-.5,RU+.6],[0,RU]]),0];
 const back=.22*sm(DRAG0,DRAG1,τ,easeIO),d=τ<TURN0?0:key(τ,[[TURN0,0,easeIn],[TURN1,.4,linear],[4,.4+2.1*(4-TURN1)]]);
 return[RU+back+HD[0]*d,HD[1]*d];};
const danAt:LGen=τ=>{
 const[u,v]=danRoot(τ),ph=(τ+4)*runCadence(.35)*1.4;let pose:Pose;
 if(τ<TOUCH_IN)pose=dribble(ph,{foot:'l',speed:.35});
 else if(τ<0)pose=blendPose(dribble(ph,{foot:'l',speed:.35}),SOLE,sm(TOUCH_IN,-.02,τ,easeIO));
 else if(τ<TURN0)pose=keyPoses(τ,[[0,SOLE],[.12,HOLD],[DRAG0+.12,DRAGM],[DRAG1,DRAGE],[TURN0,DRAGE]]);
 else pose=blendPose(DRAGE,dribble((τ-TURN0)*runCadence(.6)*1.4,{foot:'l',speed:.6}),sm(TURN0,TURN1,τ,easeIO));
 const yaw=Math.PI+.35*sm(DRAG0,DRAG1,τ,easeIO)+(HEAD-Math.PI-.35)*sm(TURN0,TURN1,τ,easeIO);
 return{pose,yaw,u,v};};
/** the left boot's ground spot (60 % toe, 40 % heel) — the ball sits there through the sole and the drag */
function soleSpot(l:Loc):P2{const{sk,J}=jointsL(l),to=J(sk.lToe),he=J(sk.lHeel);return[to[0]*.6+he[0]*.4,to[2]*.6+he[2]*.4];}
let _sole0:P2|null=null,_held:P2|null=null;
const SOLE0=()=>_sole0??=soleSpot(danAt(0));
const HELD=()=>_held??=soleSpot(danAt(DRAG1));
/** the ball ahead of him while he dribbles in (a touch to his left, rolling on a little between touches) */
function aheadAt(τ:number):P2{const d=danAt(τ),f:P2=[Math.cos(d.yaw),Math.sin(d.yaw)],ah=.58+.12*(.5+.5*Math.sin((τ+4)*TAU*1.3));return[d.u+f[0]*ah,d.v+f[1]*ah-.08];}
function ballAt(τ:number):BallL{
 if(τ<TOUCH_IN){const[u,v]=aheadAt(τ);return{u,y:BALL_R,v,spin:-u*9};}
 if(τ<0){const a=aheadAt(TOUCH_IN),b=SOLE0(),w=sm(TOUCH_IN,0,τ,easeOut);return{u:lerp(a[0],b[0],w),y:BALL_R,v:lerp(a[1],b[1],w),spin:-lerp(a[0],b[0],w)*9};}
 if(τ<DRAG1){const[u,v]=soleSpot(danAt(τ));return{u,y:BALL_R,v,spin:-u*9};}
 const h=HELD(),roll=.14*sm(DRAG1,TURN0+.15,τ,easeOut),hu=h[0]+roll,hv=h[1];
 if(τ<TURN0+.1)return{u:hu,y:BALL_R,v:hv,spin:-hu*9};
 const d=danAt(τ),f:P2=[Math.cos(d.yaw),Math.sin(d.yaw)],ah=.62+.1*(.5+.5*Math.sin((τ-TURN0)*TAU*1.5)),w=sm(TURN0+.1,TURN1+.1,τ,easeIO),u=lerp(hu,d.u+f[0]*ah,w),v=lerp(hv,d.v+f[1]*ah,w);
 return{u,y:BALL_R,v,spin:-hu*9+(τ-TURN0)*14};}
/** the defender: set, then rushes out; his stab (right foot, full reach at REACH) lands exactly where the ball WAS — it has just gone */
const LUNGE0=REACH-.7;
const REACH_TOE:P2=(()=>{const{sk,J}=jointsL({pose:lunge(.6,{side:'r'}),yaw:0,u:0,v:0},{height:1.8}),to=J(sk.rToe);return[to[0],to[2]];})();
const DEF_R:P2=(()=>{const b=SOLE0();return[b[0]-REACH_TOE[0]+.08,b[1]-REACH_TOE[1]];})();
const DEF0:P2=[RU-7.2,DEF_R[1]+.4];
const defAt:LGen=τ=>{
 let u=key(τ,[[-1.5,DEF0[0],easeIn],[LUNGE0,DEF_R[0],easeOut],[REACH+.5,DEF_R[0]+.3]]),v=lerp(DEF0[1],DEF_R[1],sm(-1.5,LUNGE0,τ,easeIO)),yaw=0,pose:Pose;
 if(τ<-1.5)pose=backpedal(τ*1.1);
 else if(τ<LUNGE0)pose=blendPose(runCycle((τ+1.5)*runCadence(.7),{speed:.7}),backpedal(0),sm(LUNGE0-.3,LUNGE0,τ,easeIO)*.5);
 else pose=lunge(key(τ,[[LUNGE0,0],[REACH,.6],[REACH+1,1]],linear),{side:'r'});
 if(τ>REACH+1){const w=sm(REACH+1,REACH+1.6,τ,easeIO),d=danAt(τ);yaw=lerp(0,yawTo(d.u-u,d.v-v),w);pose=blendPose(pose,runCycle((τ-REACH-1)*runCadence(.4),{speed:.4}),w);const go=.9*Math.max(0,τ-REACH-1.3);u+=Math.cos(yaw)*go;v+=Math.sin(yaw)*go;}
 return{pose,yaw,u,v};};
type Teach={rush:number;sole:number;drag:number;miss:number;turn:number;end:number};
/** the teaching marks (on the floor before the figures): the defender's rush (red), the drag back (yellow), the escape path (yellow) */
function floorMarks(s:Sheet,st:Stage,fr:Frame,t:number,c:Teach){
 // the defender's rush: a red dashed arrow from where he starts to where he stabs
 const rg=sm(c.rush,c.rush+.9,t,easeOut)*(1-sm(c.drag,c.drag+.5,t));
 if(rg>.02){const a=fp(st,fr,DEF0[0]+.4,DEF0[1]),b=fp(st,fr,DEF_R[0]-.3,DEF_R[1]),pts=[a,L2(a,b,.5),b],q=partial(pts,rg);if(q.length>1){dashed(s,R,q,12,801,{dash:40});if(rg>.95)arrowHead(s,R,q,34,802);}}
 // "drags it back": the ball's short roll back under him (cased yellow), from the sole spot to where it stops
 const dg=sm(c.drag,c.drag+.6,t,easeOut)*(1-sm(c.turn+.3,c.turn+.8,t));
 if(dg>.02){const a=SOLE0(),h=HELD(),pts=[fp(st,fr,a[0]-.15,a[1]),fp(st,fr,lerp(a[0],h[0]+.5,.5),a[1]),fp(st,fr,h[0]+.5,h[1])];cased(s,pts,16,803,{dash:30,progress:dg});if(dg>.95)casedHead(s,pts,40,804);}
 // "turns away": the escape path along his new heading, drawn as he goes
 const eg=sm(c.turn,c.turn+1.1,t,easeOut)*(1-sm(c.end-.6,c.end-.2,t));
 if(eg>.02){const r0=danRoot(TURN0),pts:Pt[]=[];for(let k=0;k<=6;k++){const d=.3+k*.55;pts.push(fp(st,fr,r0[0]+HD[0]*d,r0[1]+HD[1]*d));}cased(s,pts,17,805,{dash:40,progress:eg});if(eg>.95)casedHead(s,pts,46,806);}
}
/** the marks on top: "his sole" (a yellow ring round the left boot on the ball) and "misses" (a red cross where the stab lands) */
function topMarks(s:Sheet,st:Stage,fr:Frame,t:number,τ:number,c:Teach){
 const sg=easeOutBack(sm(c.sole,c.sole+.35,t))*(1-sm(c.drag+.4,c.drag+.8,t));
 if(sg>.02){const d=danAt(τ),a=jointPt(st,fr,d,'lToe'),b=jointPt(st,fr,d,'lAn'),kk=kAt(st,depth(fr,d));inkRing(s,Y,L2(a,b,.4),kk*.3*sg,Math.max(7,kk*.045),811);}
 const mg=easeOutBack(sm(c.miss,c.miss+.3,t))*(1-sm(c.turn+.4,c.turn+.8,t));
 if(mg>.02){const b=SOLE0(),p=fp(st,fr,b[0],b[1],.1),kk=kAt(st,depth(fr,{u:b[0],v:b[1]}));crossAt(s,p,kk*.2*mg,812);}
}
function moveItems(s:Sheet,st:Stage,fr:Frame,τ:number,dt:number,detail:'mid'|'high'):Item[]{
 const d=danAt(τ),e=defAt(τ),b=ballAt(τ);
 const bz=depth(fr,b),dz=depth(fr,d);
 return[{z:depth(fr,e),draw:()=>athlete(s,st,fr,defAt,τ,DEMO_D,{detail,dt,smear:τ>LUNGE0+.2&&τ<REACH+.2?.12:0})},
  {z:dz,draw:()=>athlete(s,st,fr,danAt,τ,DANIEL_TRAIN,{detail:'high',dt,smear:τ>DRAG0&&τ<DRAG1+.1||τ>TURN0&&τ<TURN1?.1:0})},
  // under the sole the ball prints before his boot (it is under it); otherwise by depth
  {z:τ>=-.1&&τ<DRAG1+.05?dz+.02:bz,draw:()=>{drawBallL(s,st,fr,b,907,10);}}];
}

// ================= chapter 2 — HOW HE DOES IT (demonstration, side-on from the main stand, slowed to the narration) =================
const C2={how:A(1,'How does'),watch:A(1,'Watch how'),rush:A(1,'The defender rushes'),sole:A(1,'his sole'),drag:A(1,'drags it'),miss:A(1,'The defender misses'),turn:A(1,'turns away'),end:AUTH[1].seconds};
const tau2=(t:number)=>key(t,mono([[0,-3.5],[C2.rush,-1.5],[C2.sole+.15,0],[C2.drag+.1,DRAG0],[C2.miss+.1,REACH],[C2.turn,TURN0],[C2.end,TURN0+2.3]]),linear);
const T2:Teach={rush:C2.rush,sole:C2.sole,drag:C2.drag,miss:C2.miss,turn:C2.turn,end:C2.end};
const st2:Stage={F:3000,eye:3.4,cx:-7,cz:-2.5};
/** the camera follows the pair (weighted to Daniel) on ones */
function followCam(s:Sheet,st:Stage,fr:Frame,τ:number,zoom:number,dy:number,wD:number,dx=0){const d=danAt(τ),e=defAt(τ),u=lerp(e.u,d.u,wD),v=lerp(e.v,d.v,wD),p=fp(st,fr,u,v,1);cam(s,p[0]+dx,p[1]+dy,zoom);}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),τ=tau2(tt),st=st2;
  followCam(s,st,FA,tau2(t),key(t,mono([[0,1.15],[C2.rush,1.2],[C2.sole,1.5],[C2.drag,1.62],[C2.miss,1.56],[C2.turn,1.32],[C2.end,1.18]]),easeInOutSine),key(t,mono([[0,20],[C2.sole,45],[C2.turn,30],[C2.end,20]]),easeInOutSine),key(t,mono([[0,1],[C2.rush,1],[C2.sole-.3,.62]]),easeInOutSine));
  courtSide(s,st,tt,FA,{cheer:.08,crowd:.35,goal:false});
  floorMarks(s,st,FA,tt,T2);
  moveItems(s,st,FA,τ,(tau2(tt)-tau2(tt-1/12))||1/12,'mid').sort((a,b)=>b.z-a.z).forEach(it=>it.draw());
  topMarks(s,st,FA,tt,τ,T2);
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,FA,danAt(tau2(tt)),.13));},
 still:C2.drag+.3,
};

// ================= chapter 3 — YOUR TURN (the same move from a low reverse angle in front of him; the lesson in three steps) =================
const C3={your:A(2,'Your turn'),close:A(2,'defender gets'),step:A(2,'step on'),pull:A(2,'pull it'),turn:A(2,'turn away'),end:AUTH[2].seconds};
const tau3=(t:number)=>key(t,mono([[0,-2.4],[C3.close,-1.3],[C3.step+.15,0],[C3.pull+.1,DRAG0],[C3.pull+.9,REACH],[C3.turn,TURN0],[C3.end,TURN0+1.9]]),linear);
const T3:Teach={rush:C3.close,sole:C3.step,drag:C3.pull,miss:C3.pull+.8,turn:C3.turn,end:C3.end};
/** frame: +u points away and to the right of the camera, so Daniel comes toward us and to the left with his left sole on the near side;
 * the defender (start ≈ 5 m nearer the camera) runs away from us into the stab */
const R3=Math.PI/2-1.1;
const FR3:Frame={ox:-RU*Math.cos(R3),oz:8-RU*Math.sin(R3),rot:R3};
const st3:Stage={F:2200,eye:1.8,cx:0,cz:-1};
/** the three step chips (1 · 2 · 3) printed near the move, each with its cue */
function stepChips(s:Sheet,st:Stage,fr:Frame,t:number){
 const b0=SOLE0(),h=HELD(),r0=danRoot(TURN0),spots:[number,number,number][]=[[b0[0]-.5,b0[1]-.7,C3.step],[h[0]+.7,h[1]-.9,C3.pull],[r0[0]+HD[0]*2.6,r0[1]+HD[1]*2.6-.4,C3.turn]];
 spots.forEach(([u,v,at],i)=>{const g=easeOutBack(sm(at,at+.35,t));if(g<=.02)return;const p=fp(st,fr,u,v,1.9),kk=kAt(st,depth(fr,{u,v}));segPanel(s,p[0],p[1],String(i+1),kk*.32*g,170+i,pulse(t,at+.1,.6),{box:i===1?R:K});});
}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),τ=tau3(tt),st=st3;
  followCam(s,st,FR3,tau3(t),key(t,mono([[0,1.2],[C3.close,1.28],[C3.step,1.5],[C3.pull,1.56],[C3.turn,1.34],[C3.end,1.22]]),easeInOutSine),key(t,mono([[0,40],[C3.step,60],[C3.turn,40],[C3.end,30]]),easeInOutSine),key(t,mono([[0,.85],[C3.close,.72]]),easeInOutSine),key(t,mono([[0,0],[C3.turn,60],[C3.end,120]]),easeInOutSine));
  courtSide(s,st,tt,FR3,{cheer:.1+.5*pulse(tt,C3.turn+1,1.4),crowd:.35,goal:false,lines:'mid'});
  floorMarks(s,st,FR3,tt,T3);
  moveItems(s,st,FR3,τ,(tau3(tt)-tau3(tt-1/12))||1/12,'high').sort((a,b)=>b.z-a.z).forEach(it=>it.draw());
  topMarks(s,st,FR3,tt,τ,{...T3,miss:1e9});
  stepChips(s,st,FR3,tt);
  // the tick: he got away
  const tk=easeOutBack(sm(C3.turn+1.1,C3.turn+1.45,tt));if(tk>.02){const r0=danRoot(TURN0),p=fp(st,FR3,r0[0]+HD[0]*3.6,r0[1]+HD[1]*3.6,1.2);tickAt(s,p,150*tk,820);}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,FR3,danAt(tau3(tt)),.13));},
 still:C3.pull+.4,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'ibanes-futsal-signature',format:'futsal',title:'Daniel’s close-control turn',theme:'Drag the ball back with your sole to escape a defender.',
 ageNote:'For players aged 7–12: the 2000 World Cup semi-final, Daniel’s two goals and Spain’s world title are real; the drag-back turn is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a navy sole lands on a mini futsal ball and drags it back; a yellow dashed trail shows the roll. Reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.7),back=easeOut(sm(.2,.7,u,linear)),bx=x+90*back;
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.22,seed+2,{n:16}),true),.3);
  if(back>.02){const tr=ribbon([[x-r*.2,y+r*.9],[bx-r*.6,y+r*.9]],8,{seed,taper:.4,wobble:1,gaps:[[.3,.45],[.6,.75]]});s.knockout(tr);s.fill(Y,tr);}
  ball(s,bx,y,r,seed,{rot:-back*5});
  const on=sm(0,.18,u,easeOut)*(1-sm(.75,1,u,easeIn));if(on>.02){const sx=bx-r*.1,sy=y-r*.95-(1-on)*60,sole=polyPath(blob(sx,sy,r*1.05,r*.32,seed+3,{n:18}),true);s.knockout(sole);s.fill(K,sole,.9);s.fill(R,polyPath(blob(sx+r*.2,sy-r*.5,r*.7,r*.35,seed+4,{n:14}),true),.9);}
 },
};
export default film;
