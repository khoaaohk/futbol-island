/** Javi Rodríguez — "the sharp ala 1v1": a signature-move riso film (iconic plays, FUTSAL; Javi is an ala / winger).
 *
 * WHO: Javier Rodríguez Nebreda (born 26 Mar 1974, Barcelona / Santa Coloma de Gramenet), SPAIN (matches the card's flag in
 * playerAppearance.json and the card bio: "scored two late penalties in the 2000 World Cup final win over Brazil, then won the World Cup
 * again in 2004"). Winger (en-wiki) / ala-pívot (es-wiki); Playas de Castellón 1997–2006, FC Barcelona 2006–12; Spain's most-capped player
 * and record scorer (99 goals); 2005 Futsal Planet world player of the year. Not the Mexican shooter or any footballer of the same name.
 *
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the sharp ala 1v1, lesson "Change your speed suddenly to lose your
 * defender" — not one match. No written source we could reach describes ONE of his 1v1 dribbles, so the film follows the brief's FALLBACK:
 * the real-match chapters show ONLY confirmed things from his best-documented night — the 2000 FIFA Futsal World Championship final, where
 * his two late goals turned 2–3 into 4–3 — and never stage a goal, a penalty kick, a pass or a tackle of that match. The 1v1 itself is a
 * separate, clearly labelled demonstration ("Watch how he does it", a neutral yellow training-bib defender, an empty net), never passed
 * off as that final. (No other futsal film uses this final: Luis Amado's and Sergeev's only mention Guatemala in passing.)
 *  1  LIVE (broadcast camera, main stand, real time): the final, 3 Dec 2000, Domo Polideportivo de la CDAG, Guatemala City, 7,568 fans.
 *     The camera is up on the hanging board: Brazil lead 2–3 (Vander 35'); the board flips 3–3, then 4–3 (Javi Rodríguez, both penalties per
 *     en-wiki). It tilts down to the court: Javi runs off celebrating, team-mates chase him, Brazil's heads drop. No goal or kick is shown.
 *  2  CHAMPIONS (a closer, lower TV angle): the buzzer, board 4–3 at 40:00; Spain are world champions for the first time; three yellow
 *     stars for Brazil's three titles in a row before (1989, 1992, 1996) stamp and fade. The cup is drawn generically; nobody is claimed as
 *     lifting it.
 *  3  HOW HE DOES IT (demonstration, no match claimed; LOW camera on the near touchline, tracking him): on the left wing he dribbles
 *     slowly, the defender backs off and relaxes (stands up, flat-footed), then BOOM — a sudden burst inside past him and a right-foot shot
 *     across into the far corner of an empty net.
 *  4  PRACTISE (the entry's lesson): the same move from a higher, wider angle with its speed drawn on the floor — short yellow dashes for
 *     slow, a long red arrow for fast — and three cards (slow, fast, shoot) and a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2000 FIFA Futsal World Championship" (raw; wiki-2000-futsal-wc.txt): final 3 December 2000, 16:00, Spain 4–3 Brazil,
 *    goals Daniel 2' (pen.), Javi Sánchez 20', Javi Rodríguez 36' (pen.) & 39' (pen.); Anderson 18', Manoel Tobías 30', Vander 35';
 *    Domo Polideportivo de la CDAG; attendance 7,568; referee Ivan Novak (Croatia). Spain "ended a streak of three straight championships
 *    by Brazil" and were the first nation other than the South Americans to win it. — https://en.wikipedia.org/wiki/2000_FIFA_Futsal_World_Championship
 *  - Wikipedia (ES), "Copa Mundial de fútbol sala de la FIFA 2000" (raw; eswiki-copa-mundial-futsal-2000.txt): the same final, 4–3 (2–1 at
 *    half-time), 3 Dec 2000, 18:30, Domo Polideportivo, Guatemala, 7,568, Ivan Novak; but it lists J. Rodríguez 39' and 39' (no "pen."). The
 *    two sources disagree on his first minute, so the film shows NO match clock during the comeback, only the score line.
 *  - Wikipedia, "Javi Rodríguez (futsal player)" (raw; wiki-javi-rodriguez-futsal.txt) and (ES) "Javi Rodríguez Nebreda"
 *    (eswiki-javi-rodriguez.txt): identity, position, clubs, caps/goals, titles (World Cup 2000 and 2004, four Euros), 2005 award, captain
 *    of Spain later in his career.
 * CONFIRMED: competition, date, city, venue, attendance, the teams, the score line 2–3 → 3–3 → 4–3 with Javi scoring the last two goals
 *  late (after Vander's 35'), both listed as penalties by en-wiki, the 4–3 final result, Spain's first world title, Brazil's three titles in
 *  a row before; Javi's country, position (ala / winger) and height (1.78 m).
 * INFERRED (never named in the narration): the kits (Spain red shirts / blue shorts / navy socks as the listed home side; Brazil yellow shirts
 *  / blue shorts / white socks; Brazil's keeper in paper and navy), the board's look and where it hangs, which goal Brazil defended, where
 *  the celebration happens and who is where; Javi's dark short hair; his shirt number (not shown); the cup's shape. HOW his goals were scored
 *  (who took what kick, which foot, which corner) is not described in our sources and is deliberately not shown; the minute of his first
 *  goal is disputed (36' v 39'), and only en-wiki marks them as penalties, so the narration says only that he scores. Chapters 3–4 demonstrate the change-of-speed 1v1 of an ala (right foot, cutting inside from the left wing),
 *  not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the burst and the strike). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 * z → −Z (facing −X, his right side is the far side, +Z: the cut inside onto the right foot goes away from the camera).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: red (Spain, fast arrow, rings), yellow (Brazil, lights, bib, slow dashes, flight), blue (court, shorts), navy (key line, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2000 World Cup final',text:'World Cup final, 2000. Brazil lead Spain three two, with five minutes left. Then Javi scores. Three all! And another! Four three to Spain!',tail:3,
  cues:['World Cup','Brazil lead','five minutes','Javi scores','Three all','another','Four three'],heads:{'World Cup':'Final 2000','Brazil lead':'2–3','Three all':'3–3','Four three':'4–3'}},
 {label:'World champions',text:'The buzzer goes. Spain are world champions for the first time! Brazil had won the three World Cups before.',tail:2.2,
  cues:['The buzzer','Spain are','first time','Brazil had','three World'],heads:{'Spain are':'Champions','three World':''}},
 {label:'How he does it',text:'Javi was a sharp ala, a winger, brilliant one against one. Watch how he does it: he dribbles slowly, the defender relaxes, then boom! He explodes past him and shoots!',tail:2,
  cues:['Javi was','sharp ala','Watch how','dribbles slowly','defender relaxes','then boom','explodes past','shoots'],heads:{'sharp ala':'The ala 1v1','then boom':'Change speed!','shoots':''}},
 {label:'Practise it',text:'Your turn: go slow, then change speed suddenly, and lose your defender!',tail:2.8,
  cues:['Your turn','go slow','change speed','lose your'],heads:{'Your turn':'Slow, then fast','lose your':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/javi-rodriguez-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/javi-rodriguez-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/javi-rodriguez-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('javi: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('javi: no cue '+w);return c.at;};
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
/** a dashed hand-drawn line; on the blue court it is knocked out to paper first so the ink prints clean (no overprint) */
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
const FACE_RIGHT=0,FACE_LEFT=Math.PI,FACE_CAMERA=-Math.PI/2;
/** Javi: 1.78 m, a winger (Wikipedia); dark short hair (inferred); Spain red shirt / blue shorts / navy socks (inferred); no number shown */
const SKIN_J:InkFill[]=[[Y,.42],[R,.3],[K,.06]];
const BUILD={height:1.78,bulk:1};
const JAVI:AthleteStyle={shirt:R,shorts:B,socks:K,boots:K,skin:SKIN_J,hair:K,line:K,trim:'paper',hairStyle:'short',build:BUILD,seed:9};
const SKINS:InkFill[][]=[[[Y,.42],[R,.28]],[[Y,.35],[R,.2]],[[Y,.46],[R,.36],[K,.14]],[[Y,.4],[R,.24]]];
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:B,socks:K,boots:K,skin:SKINS[n%4],hair:K,line:K,trim:'paper',hairStyle:n%3?'short':'curly',build:{height:1.7+hash(n,3)*.14},seed:20+n});
/** Brazil: yellow shirts, blue shorts, white socks (inferred) */
const BRA=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,skin:SKINS[(n+2)%4],hair:K,line:K,trim:B,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Brazil's keeper — paper and navy (inferred) */
const BRA_GK:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:SKINS[1],hair:K,line:K,trim:K,gloves:Y,sleeves:'long',hairStyle:'short',build:{height:1.8},seed:62};
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
/** the ala's poses (library, facing +x): SLOWED = almost stopped, right foot on top of the ball's front, weight back, eyes on the defender;
 * DEF_RELAX = the defender standing up tall, flat-footed (the moment he relaxes) */
const SLOWED=posed({lHipF:16,lKnee:30,rHipF:30,rKnee:26,rAnk:-8,lean:10,pitch:2,neckP:6,neckY:4,lShA:28,rShA:24,lElb:40,rElb:44,lShF:-10,rShF:14});
const DEF_RELAX=posed({lHipF:6,rHipF:4,lKnee:8,rKnee:8,lAnk:-2,rAnk:-2,lean:2,pitch:0,neckP:4,lShA:10,rShA:12,lElb:18,rElb:22,lHipA:6,rHipA:6});

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;sx?:number;sy?:number;smear?:number;dir?:number}={}){
 const{rot=0,sx=1,sy=1,smear=0,dir=0}=o;let pts=blob(x,y,r*sx,r*sy,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);s.fill(K,polyPath(blob(x+r*.35,y+r*.4,r*.9,r*.8,seed+7,{n:18}),true),.2);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr*sx,cy+Math.sin(a)*pr*sy]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88*sx,y+Math.sin(a)*r*.88*sy,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);

// ---------------- the arena: the stands (shared) ----------------
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.22)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.38)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.46)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}

// ---- the court seen from the near touchline (camera looks along +Z); the goal at X = −20 (inferred end); posts at Z 8.5 / 11.5 ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true);s.knockout(court,.25);s.fill(B,court,.82);
 s.fill(B,polyPath(floorQuad(st,-20,6,20,13),true),.12);
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X+6,GOAL_X+10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
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

// ---- the court seen end-on across the halfway line (chapter 2): blue floor, halfway line + centre circle, boards, stands ----
const WALLZ=13.4;
function arenaEnd(s:Sheet,st:Stage,o:{cheer?:number;flash?:number;t?:number;centre:number}){
 const{cheer=0,flash=0,t=0,centre}=o,wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-10,-30,10,centre+10),true);s.knockout(court,.25);s.fill(B,court,.82);
 const lines=new Path2D(),cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,centre+Math.sin(a)*3]);}
 lines.addPath(polyPath(floorStrip(st,[[-10,centre],[10,centre]],.05),true));lines.addPath(polyPath(floorStrip(st,cc,.05),true));lines.addPath(polyPath(floorRing(st,0,centre,.14,12),true));
 for(const X of[-10,10])lines.addPath(polyPath(floorStrip(st,[[X,-30],[X,centre+10]],.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
}

// ---------------- the hanging scoreboard (a riso seven-segment board; score + optional clock) ----------------
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
/** clock '' = no clock (the minute of Javi's first goal is disputed between our sources, so the comeback is shown by the score alone) */
type Board={home:number;away:number;clock:string;flip:number;glow:number;blank?:boolean};
/** the board, flat to the camera, centred at sheet point c, k units per metre (6 m × 3 m); Spain (home) red swatch, Brazil yellow/blue */
function scoreboard(s:Sheet,c:Pt,k:number,b:Board,seed:number){
 const W=6*k,H=3*k,x0=c[0]-W/2,y0=c[1]-H/2,box=handCut([[x0,y0],[x0+W,y0],[x0+W,y0+H],[x0,y0+H]],seed,k*.05,k*.9);
 const cab=new Path2D();for(const u of[.18,.82])cab.addPath(ribbon([[x0+W*u,y0],[x0+W*u+(u-.5)*k*.6,y0-k*9]],Math.max(2,k*.04),{seed:seed+2,taper:0,wobble:.5}));s.fill(K,cab,.8);
 if(b.glow>.02)s.fill(Y,polyPath(blob(c[0],c[1],W*.62*(1+.08*b.glow),H*.75*(1+.1*b.glow),seed+3,{amp:.04,n:28}),true),.35*b.glow);
 const bp=polyPath(box,true);s.knockout(bp);s.fill(K,bp,.92);s.fill(R,ribbon([...box,box[0]],k*.09,{seed:seed+4,close:true,wobble:.6}));
 const sw=k*.9,sh=k*.62,ly=y0+H*.2;
 const pr=polyPath(handCut([[x0+k*.35,ly],[x0+k*.35+sw,ly],[x0+k*.35+sw,ly+sh],[x0+k*.35,ly+sh]],seed+5,k*.02,k*.4),true);s.knockout(pr);s.fill(R,pr);
 const ax=x0+W-k*.35-sw,ap=polyPath(handCut([[ax,ly],[ax+sw,ly],[ax+sw,ly+sh],[ax,ly+sh]],seed+6,k*.02,k*.4),true);s.knockout(ap);s.fill(Y,ap);s.fill(B,rectPath(ax,ly+sh*.4,sw,sh*.2));
 if(b.blank)return;
 const dh=H*.36,num=new Path2D(),sy=1-.8*Math.sin(Math.PI*clamp(b.flip));
 digits(num,String(b.home),c[0]-k*1.35,ly-dh*.02,dh,seed+10,sy);digits(num,String(b.away),c[0]+k*.85,ly-dh*.02,dh,seed+20);
 num.addPath(ribbon([[c[0]-k*.32,ly+dh*.5],[c[0]+k*.32,ly+dh*.5]],dh*.13,{seed:seed+30,taper:0}));
 s.knockout(num);
 if(b.clock){const clk=new Path2D(),ch=H*.2,cw=digits(new Path2D(),b.clock,0,0,ch,0);digits(clk,b.clock,c[0]-cw/2,y0+H*.7,ch,seed+40);s.knockout(clk);s.fill(Y,clk);}
 else{const dots=new Path2D();for(let i=-2;i<=2;i++)dots.addPath(polyPath(blob(c[0]+i*k*.34,y0+H*.8,k*.07,k*.07,seed+50+i,{n:10}),true));s.fill(Y,dots,.55);}
}

// ================= chapter 1 — LIVE: the 2000 final (confirmed things only: the board, the arena, the celebration) =================
const C1={wc:A(0,'World Cup'),lead:A(0,'Brazil lead'),five:A(0,'five minutes'),scores:A(0,'Javi scores'),all:A(0,'Three all'),another:A(0,'another'),four:A(0,'Four three'),end:AUTH[0].seconds};
/** the board over the centre of the court (X = 0, 11 m up, above the halfway line) */
const BOARD_AT:V3=[0,11,10];
const F1=C1.all-.05,F2=C1.another+.05;
function board1(T:number):Board{
 const home=T<F1?2:T<F2?3:4,last=T>=F2?F2:T>=F1?F1:-9;
 return{home,away:3,clock:'',flip:sm(last,last+.25,T,linear),glow:pulse(T,F2,1.6)+.6*pulse(T,F1,1),blank:T<C1.lead};
}
/** after the fourth goal: Javi runs off toward the near touchline, arms out; team-mates chase him; Brazil's heads drop (positions inferred) */
const RUN0:[number,number]=[-12.6,8.4],RUN1:[number,number]=[-8.8,2.6];
const ZT=F2;
const liveJ:Gen=T=>{const u=sm(ZT,ZT+2.6,T,easeOut),X=lerp(RUN0[0],RUN1[0],u),Z=lerp(RUN0[1],RUN1[1],u);
 let pose=celebrate((T-ZT)*1.3,{kind:'run'});pose=blendPose(pose,celebrate((T-ZT)*1.1,{kind:'arms'}),sm(ZT+2.2,ZT+2.8,T));
 return{pose,yaw:yawTo(RUN1[0]-RUN0[0],RUN1[1]-RUN0[1])+lerp(0,.9,sm(ZT+2.2,ZT+2.9,T)),X,Z};};
const MATES:[number,number][]=[[-5.4,11.4],[-15.0,14.6],[-4.8,5.0]];
const liveMate=(i:number):Gen=>T=>{const[x0,z0]=MATES[i],go=sm(ZT+.1+.2*i,ZT+2.8,T,easeIO),f=liveJ(ZT+2.8),tx=f.X+[1.1,-1.0,.9][i],tz=f.Z+[.9,1.1,-.5][i];
 const X=lerp(x0,tx,go),Z=lerp(z0,tz,go);const pose=blendPose(runCycle(T*runCadence(.9)+i*.3,{speed:.9}),celebrate(T*1.1+i*.3,{kind:'arms'}),sm(ZT+2.6,ZT+3,T));
 return{pose,yaw:go<.98?yawTo(tx-x0,tz-z0):FACE_CAMERA,X,Z};};
const BRAZIL:[number,number][]=[[-15.4,11.0],[-13.2,5.6],[-11.0,13.8],[-16.6,7.6]];
const down=(i:number)=>posed({lHipF:6+i*3,rHipF:6,lKnee:10,rKnee:10+i*4,lean:20,neckP:44,lShA:10,rShA:10,lElb:20,rElb:20,twist:i*6});
const liveBra=(i:number):Gen=>T=>({pose:blendPose(backpedal(.2+i*.2),down(i),sm(ZT,ZT+1,T)),yaw:FACE_RIGHT+[.4,-.3,.5,-.2][i],X:BRAZIL[i][0],Z:BRAZIL[i][1]});
const liveK:Gen=T=>({pose:blendPose(keeperSet(.2),posed({lHipF:70,rHipF:70,lKnee:110,rKnee:110,lean:30,neckP:40,lShA:14,rShA:14,lElb:40,rElb:40}),sm(ZT,ZT+1.2,T)),yaw:FACE_RIGHT+.2,X:GOAL_X+.8,Z:9.6});
/** the camera: the arena first, then up on the board for the comeback, then it tilts down onto the court for the celebration */
const liveCam=(T:number)=>({x:key(T,mono([[0,0],[C1.four,0],[ZT+.5,0],[ZT+1.7,-8.4],[C1.end,-9.2]]),easeInOutSine),
 zoom:key(T,mono([[0,.5],[C1.lead,.62],[C1.five,.8],[C1.scores,.9],[ZT+.5,.88],[ZT+1.7,.84],[C1.end,1.0]]),easeInOutSine),
 y:key(T,mono([[0,-170],[C1.lead,-420],[C1.five,-640],[C1.scores,-720],[ZT+.5,-690],[ZT+1.7,1250],[C1.end,1300]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),g=pulse(Tc,ZT+.05,.35)+.6*pulse(Tc,F1,.3);
 cam(s,0,c.y+3*g*Math.sin(Tc*80),c.zoom);
 const cheer=T<F1?.12+.2*sm(C1.scores,F1,T):T<ZT?.75:1-.35*sm(C1.end-1.5,C1.end,T);
 courtSide(s,st,T,{cheer,flash:pulse(T,ZT,1.2)+.6*pulse(T,F1,1),keeper:()=>{athlete(s,st,liveK,T,BRA_GK,{detail:'low'});}});
 const bc=proj(st,BOARD_AT[0],BOARD_AT[1],BOARD_AT[2]),kb=kAt(st,BOARD_AT[2]);scoreboard(s,bc,kb,board1(T),501);
 // "Brazil lead": a yellow ring round Brazil's 3; "Three all" / "another": a red ring stamps round Spain's score
 const yr=easeOutBack(sm(C1.lead+.1,C1.lead+.45,T))*(1-sm(C1.scores-.2,C1.scores+.1,T));
 if(yr>.02){const q=blob(bc[0]+kb*1.12,bc[1]-kb*.55,kb*.75*Math.min(1,yr),kb*.62*Math.min(1,yr),505,{n:22});const rp=ribbon([...q,q[0]],kb*.1,{seed:506,close:true,wobble:1});s.knockout(rp);s.fill(Y,rp);}
 const ring=easeOutBack(sm(F1,F1+.35,T))*(1-sm(F2-.3,F2,T))+easeOutBack(sm(F2,F2+.35,T))*(1-sm(F2+1.2,F2+1.5,T));
 if(ring>.02){const q=blob(bc[0]-kb*1.1,bc[1]-kb*.55,kb*.75*Math.min(1,ring),kb*.62*Math.min(1,ring),502,{n:22});const rp=ribbon([...q,q[0]],kb*.1,{seed:503,close:true,wobble:1});s.knockout(rp);s.fill(R,rp);}
 for(const f of[F1,F2])if(T>=f&&T<f+.9)sparkBurst(s,Y,bc[0],bc[1],kb*4,{n:12,seed:504+f,g:easeOut(sm(f,f+.3,T))*(1-sm(f+.5,f+.9,T))});
 if(T<ZT-.2)return;// the court below is out of shot until the tilt
 type It={z:number;draw:()=>void};const items:It[]=[];
 BRAZIL.forEach((_,i)=>{const gg=liveBra(i);items.push({z:gg(T).Z,draw:()=>athlete(s,st,gg,T,BRA(i),{detail:'low'})});});
 MATES.forEach((_,i)=>{const gg=liveMate(i);items.push({z:gg(T).Z,draw:()=>athlete(s,st,gg,T,ESP(i),{detail:'low'})});});
 items.push({z:liveJ(T).Z,draw:()=>athlete(s,st,liveJ,T,JAVI,{smear:T<ZT+1.5?.1:0})});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** Javi's chest in a take (the passage enters his red shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveJ(tt),.12));},still:C1.four+.6};

// ================= chapter 2 — CHAMPIONS (TV, closer and lower): the buzzer, 4–3, first world title; Brazil's three before =================
const C2={buzz:A(1,'The buzzer'),spain:A(1,'Spain are'),first:A(1,'first time'),brazil:A(1,'Brazil had'),three:A(1,'three World'),end:AUTH[1].seconds};
const TEAM:[number,number,number][]=[[-1.05,4.7,0],[0,4.9,1],[1.05,4.7,2],[.62,3.85,3]];
const JP:[number,number]=[-.6,3.7];
const jump=(t:number,ph:number)=>{const p=celebrate(t*1.05+ph,{kind:'arms'});p.neckP=Math.max(p.neckP,-.12);return p;};
const teamGen=(i:number):Gen=>t=>{const[X,Z,ph]=TEAM[i];return{pose:blendPose(stand(),jump(t,ph*.23),sm(C2.spain-.6,C2.spain,t)),yaw:FACE_CAMERA+[.25,0,-.25,-.15][i],X,Z};};
const champJ:Gen=t=>({pose:blendPose(stand(),jump(t,.61),sm(C2.spain-.6,C2.spain,t)),yaw:FACE_CAMERA+.2,X:JP[0],Z:JP[1]});
const st2:Stage={F:1500,eye:2.5,cx:0,cz:-3};
const BOARD2:V3=[0,9.5,13];
function cup(s:Sheet,c:Pt,k:number,seed:number){
 const h=.62*k,w=.3*k,bowl:Pt[]=[[c[0]-w,c[1]-h],[c[0]+w,c[1]-h],[c[0]+w*.8,c[1]-h*.55],[c[0]+w*.22,c[1]-h*.32],[c[0]+w*.14,c[1]-h*.12],[c[0]+w*.5,c[1]],[c[0]-w*.5,c[1]],[c[0]-w*.14,c[1]-h*.12],[c[0]-w*.22,c[1]-h*.32],[c[0]-w*.8,c[1]-h*.55]];
 const q=smoothPts(bowl,true,6,2),p=polyPath(q,true);s.knockout(p);s.fill(Y,p,.18);s.fill(K,ribbon([...q,q[0]],Math.max(3,k*.02),{seed,close:true,wobble:.6}));
 s.knockout(polyPath(blob(c[0]-w*.45,c[1]-h*.78,w*.14,h*.12,seed+1,{n:10}),true));
 for(const sx of[-1,1]){const hq=ribbon([[c[0]+sx*w*.9,c[1]-h*.92],[c[0]+sx*w*1.35,c[1]-h*.78],[c[0]+sx*w*.95,c[1]-h*.58]],Math.max(3,k*.025),{seed:seed+2+sx,taper:0,wobble:.4});s.fill(K,hq);}
}
function star(cx:number,cy:number,r:number,rot=0):Pt[]{const q:Pt[]=[];for(let i=0;i<10;i++){const a=rot-Math.PI/2+i/10*TAU,rr=i%2?r*.45:r;q.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}return q;}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,bc=proj(st,BOARD2[0],BOARD2[1],BOARD2[2]),kb=kAt(st,BOARD2[2]),grp=proj(st,0,1.2,4.3);
  camPath(s,t,[[0,bc[0],bc[1]+120,1.05],[C2.buzz+.5,bc[0],bc[1]+100,1.12],[C2.spain-.2,bc[0],bc[1]+160,1.05],[C2.spain+.9,grp[0],grp[1]-60,1.5],[C2.brazil-.3,grp[0]-40,grp[1]-50,1.58],[C2.brazil+.5,lerp(grp[0],bc[0],.5),lerp(grp[1],bc[1],.5)+30,.9],[C2.end,lerp(grp[0],bc[0],.5),lerp(grp[1],bc[1],.5)+30,.88]]);
  arenaEnd(s,st,{t:tt,centre:9,cheer:.2+.8*sm(C2.buzz,C2.buzz+.4,tt),flash:pulse(tt,C2.buzz,1.2)+.8*pulse(tt,C2.spain,1.4)});
  // "The buzzer": the board prints the final score, 4–3, full time (40:00)
  const lit=sm(C2.buzz,C2.buzz+.3,tt);scoreboard(s,bc,kb,{home:4,away:3,clock:'40:00',flip:lit,glow:pulse(tt,C2.buzz+.15,1.4),blank:lit<.5},601);
  if(tt>=C2.buzz&&tt<C2.buzz+.8)sparkBurst(s,Y,bc[0],bc[1],kb*4,{n:12,seed:607,g:easeOut(sm(C2.buzz,C2.buzz+.3,tt))*(1-sm(C2.buzz+.4,C2.buzz+.8,tt))});
  // "Spain are world champions": confetti in front of the stands
  if(tt>=C2.spain){const u=sm(C2.spain,C2.spain+2.5,tt,linear),top=proj(st,0,6,WALLZ)[1];confetti(s,[R,Y,'paper'],[-900,top-200+u*500,1800,420],26,Math.floor(tt*6),{size:16});}
  // "first time": a red ring stamps round Spain's 4 on the board
  const fr=easeOutBack(sm(C2.first,C2.first+.35,tt))*(1-sm(C2.brazil-.2,C2.brazil+.1,tt));
  if(fr>.02){const q=blob(bc[0]-kb*1.1,bc[1]-kb*.55,kb*.75*Math.min(1,fr),kb*.62*Math.min(1,fr),602,{n:22});const rp=ribbon([...q,q[0]],kb*.1,{seed:603,close:true,wobble:1});s.knockout(rp);s.fill(R,rp);}
  // "Brazil had won the three World Cups before": three yellow stars stamp under the board, then fade (the streak is over)
  if(tt>=C2.brazil){const fade=1-.75*sm(C2.three+1,C2.end-.9,tt);
   for(let i=0;i<3;i++){const g=easeOutBack(sm(C2.three-.2+i*.25,C2.three+.15+i*.25,tt));if(g<=.02)continue;const cx=bc[0]+kb*(i-1)*1.05,cy=bc[1]+kb*2.1,r=kb*.42*g,q=star(cx,cy,r,.12*Math.sin(tt*2+i));
    s.fill(K,polyPath(star(cx+5,cy+5,r),true),.45*fade);const sp=polyPath(q,true);s.knockout(sp);s.fill(Y,sp,fade);s.fill(K,ribbon([...q,q[0]],4,{seed:610+i,close:true,wobble:.8}),.85*fade);}}
  const its:{z:number;draw:()=>void}[]=TEAM.map((p,i)=>({z:p[1],draw:()=>{const gg=teamGen(i),a=athlete(s,st,gg,tt,ESP(i+4),{detail:'mid'});
   if(i===1){const l=a.joints.lHa,r=a.joints.rHa,up=sm(C2.spain-.6,C2.spain,tt);const c:Pt=[lerp(l[0],r[0],.5),lerp(l[1],r[1],.5)+lerp(80,-10,up)];cup(s,c,kAt(st,p[1]),604);}}}));
  its.push({z:JP[1],draw:()=>{athlete(s,st,champJ,tt,JAVI,{detail:'high'});}});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "Spain are world champions": a red dashed ring round Javi's feet
  const zr=champJ(tt),rg=easeOutBack(sm(C2.spain+.3,C2.spain+.65,tt))*(1-sm(C2.brazil-.3,C2.brazil,tt));if(rg>.02)floorDashRing(s,st,R,zr.X,zr.Z,.6,9,605,rg);
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,champJ(tt),.13));},
 still:C2.first+.5,
};

// ================= the demonstration (chapters 3–4): left wing, slow dribble, the defender relaxes, BOOM, burst inside, shoot =================
type TL={t0:number;stop:number;relax:number;burst:number;hit:number};
/** seconds the shot takes to reach the net */
const FLIGHT=.36;
/** the ala starts on the left wing near the near touchline, attacking the goal at X = −20 (facing −X his left is the near side) */
const P0:[number,number]=[-1.6,2.2],P1:[number,number]=[-6.2,2.3],D0:[number,number]=[-9.4,2.6],D1:[number,number]=[-10.3,2.6];
/** the shot: from inside the left of the area, right foot, across into the far corner (Z 11.0, low) */
const TGT:V3=[GOAL_X-.02,.5,11.0],BSD:[number,number]=[-14.5,6.8];
const YAW_SH=yawTo(TGT[0]-BSD[0],TGT[2]-BSD[1]);
const DSB=toMine(strikeBall(YAW_SH)),DPL:[number,number]=[BSD[0]-DSB[0],BSD[1]-DSB[2]];
const RUN_YAW=yawTo(DPL[0]-P1[0],DPL[1]-P1[1]);
function demo(L:TL){
 const DRIB=1.45;// dribble strides a second while slow
 const jPos=(t:number):[number,number]=>{if(t<L.burst){const u=sm(L.t0,L.stop,t,q=>1-Math.pow(1-q,1.6));return[lerp(P0[0],P1[0],u),lerp(P0[1],P1[1],u)];}
  const q=clamp((t-L.burst)/(L.hit-L.burst)),u=1-Math.pow(1-q,1.7);if(t<=L.hit)return[lerp(P1[0],DPL[0],u),lerp(P1[1],DPL[1],u)];
  const d=sm(L.hit,L.hit+.7,t,easeOut)*.5;return[DPL[0]+Math.cos(YAW_SH)*d,DPL[1]+Math.sin(YAW_SH)*d];};
 const javi:Gen=t=>{
  const[X,Z]=jPos(t);let pose:Pose,yaw=FACE_LEFT;
  if(t<L.burst){pose=dribble(t*DRIB,{foot:'r',speed:.25});pose=blendPose(pose,SLOWED,sm(L.stop-.45,L.stop,t));
   if(t>L.stop)pose=blendPose(pose,posed({lHipF:14,lKnee:34,rHipF:30,rKnee:28,rAnk:-8,lean:14,pitch:3,neckP:8,neckY:-12,lShA:34,rShA:22,lElb:40,rElb:44,twist:-8,bend:5}),.5+.5*Math.sin((t-L.stop)*4.2));}
  else if(t<L.hit-.34){const sp=lerp(.5,1,sm(L.burst,L.burst+.3,t,easeOut));pose=runCycle((t-L.burst)*runCadence(1)*1.25+.1,{speed:sp});pose=blendPose(SLOWED,pose,sm(L.burst-.02,L.burst+.12,t,easeOut));yaw=lerp(FACE_LEFT,RUN_YAW,sm(L.burst,L.burst+.25,t));}
  else{const stt=key(t,[[L.hit-.34,.14],[L.hit,STRIKE_CONTACT],[L.hit+.6,1]],linear);pose=blendPose(runCycle((L.hit-.34-L.burst)*runCadence(1)*1.25+.1,{speed:1}),strike(stt,{foot:'r'}),sm(L.hit-.34,L.hit-.22,t));yaw=lerp(RUN_YAW,YAW_SH,sm(L.hit-.34,L.hit-.12,t));
   pose=blendPose(pose,celebrate((t-L.hit-.8)*1.2,{kind:'arms'}),sm(L.hit+.8,L.hit+1.2,t));}
  return{pose,yaw,X,Z};};
 /** the ball: ahead of his right foot while he dribbles (touched every stride), at his toes when he slows, then the big push past the
  * defender, rolling to the strike spot BSD, and the shot to TGT */
 const toeBall=(t:number):[number,number]=>{const a=javi(t),sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),toe=toMine(sk.rToe),heel=toMine(sk.rHeel);return[lerp(heel[0],toe[0],1.55),lerp(heel[2],toe[2],1.55)];};
 const ballAt=(t:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}=>{
  if(t<L.burst){const[X,Z]=jPos(t),ph=((t*DRIB-.97)%1+1)%1,run=1-sm(L.stop-.6,L.stop,t),off=.42+.38*run*Math.sin(Math.PI*Math.min(1,ph*1.2));
   const free:[number,number]=[X-off,Z+.14],at=toeBall(Math.min(t,L.stop+.01)),w=sm(L.stop-.45,L.stop,t);return{X:lerp(free[0],at[0],w),Y:BALL_R,Z:lerp(free[1],at[1],w),flying:false,spin:(X-P0[0])*-9};}
  if(t<L.hit){const q=clamp((t-L.burst)/(L.hit-L.burst)),u=1-Math.pow(1-q,2.8),s0=toeBall(L.burst-.01);return{X:lerp(s0[0],BSD[0],u),Y:BALL_R,Z:lerp(s0[1],BSD[1],u),flying:false,spin:30+u*40};}
  if(t<L.hit+FLIGHT){const u=sm(L.hit,L.hit+FLIGHT,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(BSD[0],TGT[0],.5),.55,lerp(BSD[1],TGT[2],.5)];return{X:a*BSD[0]+b*M[0]+c*TGT[0],Y:a*BALL_R+b*M[1]+c*TGT[1],Z:a*BSD[1]+b*M[2]+c*TGT[2],flying:true,spin:80+u*30};}
  const d=sm(L.hit+FLIGHT,L.hit+FLIGHT+.5,t,easeOut);return{X:GOAL_X-.25-.5*d,Y:lerp(TGT[1],BALL_R,d),Z:TGT[2],flying:false,spin:110};};
 /** the defender (neutral bib): backs off facing the ala → stands up tall and flat-footed ("relaxes") → reacts late (a jab too late),
  * turns and chases, always behind */
 const CHASE:[number,number]=[DPL[0]+1.5,DPL[1]-1.2];
 const def:Gen=t=>{const react=L.burst+.28;
  if(t<react){const u=sm(L.t0,L.relax,t,easeOut),X=lerp(D0[0],D1[0],u),Z=D0[1];let pose=blendPose(backpedal(t*1.1),DEF_RELAX,sm(L.relax-.1,L.relax+.4,t));
   pose=blendPose(pose,lunge(sm(react-.2,react,t)*.6,{side:'l'}),sm(react-.22,react,t));return{pose,yaw:FACE_RIGHT+.05*Math.sin(t),X,Z};}
  const u=sm(react,L.hit+.35,t,q=>q*q*(3-2*q)),X=lerp(D1[0],CHASE[0],u),Z=lerp(D0[1],CHASE[1],u);
  let pose=blendPose(lunge(.6,{side:'l'}),runCycle((t-react)*runCadence(.8)*1.1,{speed:.8}),sm(react,react+.25,t));
  pose=blendPose(pose,stand(),sm(L.hit+.3,L.hit+.8,t));
  return{pose,yaw:lerp(FACE_RIGHT,yawTo(CHASE[0]-D1[0],CHASE[1]-D0[1]),sm(react,react+.35,t)),X,Z};};
 return{javi,def,ball:ballAt,jPos};
}
type Demo=ReturnType<typeof demo>;
/** the demo figures + ball, back to front */
function demoFigures(s:Sheet,st:Stage,tt:number,D:Demo,L:TL,detail:'low'|'mid'|'high'){
 const b=D.ball(tt),j=D.javi(tt),d=D.def(tt);
 const items:{z:number;draw:()=>void}[]=[
  {z:d.Z,draw:()=>athlete(s,st,D.def,tt,DEMO_D,{detail})},
  {z:j.Z+.001,draw:()=>athlete(s,st,D.javi,tt,JAVI,{detail,smear:(tt>L.burst&&tt<L.burst+.55)||(tt>L.hit-.2&&tt<L.hit+.2)?.16:0})},
  {z:b.flying?b.Z:b.Z-.05,draw:()=>{const bp=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),br=Math.max(6,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],br*1.15,br*.3,313,b.flying?.3:.45);ball(s,bp[0],bp[1],br,314,{rot:b.spin,smear:b.flying?.35:0,dir:Math.atan2(-.2,-1)});}},
 ];
 items.sort((a,c2)=>c2.z-a.z).forEach(it=>it.draw());
 if(tt>=L.hit+FLIGHT&&tt<L.hit+1.2){const p=proj(st,GOAL_X-.3,TGT[1]+.3,TGT[2]);sparkBurst(s,Y,p[0],p[1],Math.max(60,kAt(st,TGT[2])*.9),{n:10,seed:315,g:easeOut(sm(L.hit+.36,L.hit+.62,tt))*(1-sm(L.hit+.85,L.hit+1.2,tt))});}
}
/** bulge of the net once the ball arrives */
const netBulge=(tt:number,L:TL)=>.5*sm(L.hit+.26,L.hit+.36,tt)*(1-.6*sm(L.hit+.7,L.hit+1.6,tt))+.12*settle(tt,L.hit+.36,{amp:1,freq:3,decay:3});
/** the path he has run so far (floor points), from t0 to t */
function trail(st:Stage,D:Demo,a:number,b:number,n=14):Pt[]{const o:Pt[]=[];for(let k=0;k<=n;k++){const[X,Z]=D.jPos(lerp(a,b,k/n));o.push(proj(st,X,0,Z));}return o;}

// ================= chapter 3 — HOW HE DOES IT (low camera on the near touchline, tracking him) =================
const C3={javi:A(2,'Javi was'),ala:A(2,'sharp ala'),watch:A(2,'Watch how'),slow:A(2,'dribbles slowly'),relax:A(2,'defender relaxes'),boom:A(2,'then boom'),past:A(2,'explodes past'),shoots:A(2,'shoots'),end:AUTH[2].seconds};
const TL3:TL={t0:0,stop:C3.relax+.15,relax:C3.relax+.1,burst:C3.boom+.25,hit:C3.shoots+.05};
const DEMO3=demo(TL3);
/** the stage follows him along the wing (cx tracks his X, lagging a little), then swings to the goal for the shot */
const st3At=(t:number):Stage=>{const jx=DEMO3.jPos(t-.15)[0],dx=DEMO3.def(t-.15).X,pair=sm(C3.watch-.6,C3.watch+.8,t)*(1-sm(TL3.burst+.2,TL3.burst+.9,t)),cx=lerp(lerp(jx-1.2,(jx+dx)/2,pair),GOAL_X+4.2,sm(TL3.hit-.5,TL3.hit+.4,t));return{F:1900,eye:1.75,cx,cz:-7.4};};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3At(tt),L=TL3,D=DEMO3,j=D.javi(tt),jp=proj(st,j.X,.95,j.Z);
  const shake=pulse(t,L.burst,.25)*6;
  cam(s,lerp(jp[0]*.5*(1-sm(C3.watch-.6,C3.watch+.8,tt)*(1-sm(L.burst+.2,L.burst+.9,tt))),0,sm(L.hit-.5,L.hit+.4,t))+shake*Math.sin(t*90),lerp(jp[1]-10,proj(st,GOAL_X+4,.9,6)[1]-10,sm(L.hit-.5,L.hit+.4,t)),key(t,mono([[0,1.55],[C3.watch-.6,1.55],[C3.watch+.8,1.2],[C3.relax,1.25],[L.burst,1.25],[L.burst+.9,1.4],[L.hit-.3,1.4],[C3.end,1.36]]),easeInOutSine));
  courtSide(s,st,tt,{cheer:.35*pulse(tt,L.hit+.36,1.4),bulge:netBulge(tt,L),bz:TGT[2],by:TGT[1]});
  // "sharp ala": the wing — a red dashed lane along the near touchline, arrowed toward the goal
  {const g=sm(C3.ala-.1,C3.ala+.5,tt,easeOut)*(1-sm(C3.slow-.2,C3.slow+.2,tt));if(g>.02){const pts:Pt[]=[];for(let k=0;k<=10;k++)pts.push(proj(st,lerp(j.X+3,j.X-7,k/10),0,1.1));dashed(s,R,pts,11,321,{dash:38,progress:g});if(g>.9)arrowHead(s,R,pts,32,322);}}
  // "dribbles slowly": short yellow dashes behind him (slow)
  {const g=sm(C3.slow,C3.slow+.3,tt)*(1-sm(C3.end-1.2,C3.end-.7,tt));if(g>.02&&tt>L.t0+.1){dashed(s,Y,trail(st,D,L.t0,Math.min(tt,L.burst)),9,323,{dash:16,cov:g});}}
  // "defender relaxes": a blue ring round his flat feet
  {const d=D.def(tt),g=easeOutBack(sm(C3.relax+.1,C3.relax+.45,tt))*(1-sm(L.burst,L.burst+.3,tt));if(g>.02)floorDashRing(s,st,B,d.X,d.Z,.55,8,324,g);}
  // "then boom" → "explodes past": a long red arrow grows along his burst
  if(tt>L.burst){const e=Math.min(tt,L.hit-.1),pts=trail(st,D,L.burst,e,12),fade=1-sm(C3.end-1.2,C3.end-.7,tt);if(pts.length>1&&fade>.02){const rp=ribbon(smoothPts(pts,false,8),14,{seed:325,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp,fade);if(tt>L.burst+.25)arrowHead(s,R,pts,38,326,fade);}}
  // "shoots": the flight line
  if(tt>L.hit){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=D.ball(lerp(L.hit,Math.min(tt,L.hit+.36),k/14));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,10,327,{dash:36});}
  demoFigures(s,st,tt,D,L,'high');
  // the BOOM: a yellow burst at his feet and speed lines behind him
  if(tt>=L.burst-.02&&tt<L.burst+.7){const g=easeOut(sm(L.burst-.02,L.burst+.2,tt))*(1-sm(L.burst+.35,L.burst+.7,tt)),fp=proj(st,j.X,.3,j.Z);{const kz=kAt(st,j.Z)*.75;const sb=new Path2D();for(let i=0;i<9;i++){const a=-Math.PI*(.1+.8*i/8),r0=kz*.35,r1=kz*(.55+.3*g);sb.addPath(ribbon([[fp[0]+Math.cos(a)*r0,fp[1]+Math.sin(a)*r0*.6],[fp[0]+Math.cos(a)*r1,fp[1]+Math.sin(a)*r1*.6]],7*g+2,{seed:330+i,taper:.5,wobble:.6}));}s.knockout(sb);s.fill(R,sb,g);}
   speedLines(s,K,fp[0]+kAt(st,j.Z)*.8,fp[1]-kAt(st,j.Z)*.6,0,{n:5,seed:329,len:kAt(st,j.Z)*1.4,spread:kAt(st,j.Z)*1.2,width:6,cov:.7*g});}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3At(tt),DEMO3.javi(tt),.13));},
 still:C3.relax+.3,
};

// ================= chapter 4 — PRACTISE: slow, then fast; three cards; a tick (higher, wider camera) =================
const C4={turn:A(3,'Your turn'),slow:A(3,'go slow'),change:A(3,'change speed'),lose:A(3,'lose your'),end:AUTH[3].seconds};
const TL4:TL={t0:C4.turn-.3,stop:C4.change-.15,relax:C4.slow+.8,burst:C4.change+.1,hit:C4.lose+.5};
const DEMO4=demo(TL4);
const st4:Stage={F:1250,eye:4.2,cx:-10.4,cz:-9};
const CARD_W=150,CARD_H=165;
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,L=TL4,D=DEMO4,mid=proj(st,-10.4,.8,4.2);
  camPath(s,t,[[0,mid[0],mid[1]+30,1.25],[C4.slow,mid[0],mid[1]+170,1.08],[C4.end,mid[0],mid[1]+170,1.08]]);
  courtSide(s,st,tt,{cheer:.3*pulse(tt,L.hit+.36,1.4),bulge:netBulge(tt,L),bz:TGT[2],by:TGT[1]});
  // the speed drawn on the floor: short yellow dashes (slow), then a long red arrow (fast)
  if(tt>L.t0+.1)dashed(s,Y,trail(st,D,L.t0,Math.min(tt,L.burst)),8,421,{dash:14});
  if(tt>L.burst){const pts=trail(st,D,L.burst,Math.min(tt,L.hit-.1),12),rp=ribbon(smoothPts(pts,false,8),12,{seed:422,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(tt>L.burst+.25)arrowHead(s,R,pts,32,423);}
  if(tt>L.hit){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=D.ball(lerp(L.hit,Math.min(tt,L.hit+.36),k/12));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,8,424,{dash:26});}
  demoFigures(s,st,tt,D,L,'mid');
  // three cards rise on "Your turn": SLOW (dribble), FAST (sprint), SHOOT — each prints its figure on its word
  const rise=sm(C4.turn,C4.turn+.6,tt,easeOut);
  if(rise>.01){const cy=mid[1]+170+335+(1-rise)*600,xs=[mid[0]-360,mid[0],mid[0]+360],on=[C4.slow,C4.change,C4.lose],cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   xs.forEach((cx,i)=>{const q=handCut([[cx-CARD_W,cy-CARD_H],[cx+CARD_W,cy-CARD_H],[cx+CARD_W,cy+CARD_H],[cx-CARD_W,cy+CARD_H]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(B,cards,.16);
   xs.forEach((cx,i)=>{const u=sm(on[i],on[i]+.3,tt,easeOutBack);if(u<=.01)return;const gy=cy+CARD_H-28;
    const fcam=figureCam({x:cx+10,y:gy,height:330*(.9+.1*u),azimuth:-150,elevation:12,fov:16,at:[.2,0,0]});
    s.save();s.clip(polyPath(outline[i],true));
    const pose=i===0?dribble(.9,{foot:'r',speed:.25}):i===1?runCycle(.72,{speed:1}):strike(STRIKE_CONTACT,{foot:'r'}),sk=solve(pose,BUILD,{}),toe=sk.rToe,heel=sk.rHeel,w=i===2?1.25:1.9,cb:V3=[lerp(heel[0],toe[0],w),BALL_R,lerp(heel[2],toe[2],w)];
    const Pc=(p:V3):Pt=>{const q=fcam.project(p);return[q[0],q[1]];},bb=Pc(cb),bR=BALL_R*(fcam.scale?fcam.scale(cb):100);
    // the card's diagram: slow = short yellow dashes; fast = a long red arrow + speed lines; shoot = a yellow flight line
    if(i===0){const pts=[Pc([-1.4,0,0]),Pc([-.7,0,0]),Pc([-.1,0,0])];dashed(s,Y,pts,7,84,{dash:10});}
    if(i===1){const pts=[Pc([-1.9,0,0]),Pc([-.9,0,0]),Pc([.9,0,0])];const rp=ribbon(pts,9,{seed:85,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);arrowHead(s,R,pts,22,86);speedLines(s,K,Pc([-.5,1.1,0])[0],Pc([-.5,1.1,0])[1],Math.PI,{n:4,seed:87,len:60,spread:80,width:4,cov:.6});}
    if(i===2){const a0=Pc([cb[0]+.15,.1,cb[2]]),a1=Pc([cb[0]+1.4,.5,cb[2]]);const pts:Pt[]=[a0,L2(a0,a1,.5),a1];dashed(s,Y,pts,8,88,{dash:22});arrowHead(s,Y,pts,24,89);}
    if(i!==1){shadow(s,bb[0],Pc([cb[0],0,cb[2]])[1],bR*1.1,bR*.3,90+i,.4);ball(s,bb[0],bb[1],bR,81+i);}
    drawAthlete(s,pose,fcam,{...JAVI,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "lose your defender": a big blue tick stamps, with a navy misregistered echo
  const tick=easeOutBack(sm(L.hit+.4,L.hit+.75,tt));
  if(tick>.02){const c:Pt=[mid[0]+520,mid[1]+170+190],S=150*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(B,tp);}
 },
 still:C4.change+.3,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'javi-rodriguez-futsal-signature',format:'futsal',title:'Javi Rodríguez’s sharp ala 1v1',theme:'Change your speed suddenly to lose your defender.',
 ageNote:'For players aged 7–12: the 2000 World Cup final comeback is real (how his two goals were scored is not shown); the 1v1 is a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls slowly (short yellow dashes), then shoots away (a long red streak); reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const slow=sm(0,.35,age,linear)*40,fast=sm(.35,.75,age,easeIn)*260,bx=x+slow+fast;
  if(age<1.1){const pts:Pt[]=[[x-30,y+r*.9],[x+slow,y+r*.9]];dashed(s,Y,pts,8,seed+1,{dash:14,cov:1-sm(.8,1.1,age)});
   if(age>.35){const rp=ribbon([[x+40,y],[bx-r,y]],14*(1-sm(.8,1.1,age))+2,{seed:seed+2,taper:.3,wobble:1});s.knockout(rp);s.fill(R,rp);}}
  ball(s,bx,y,r,seed,{rot:age*6,smear:age>.35&&age<.75?.4:0,dir:0});
 },
};
export default film;
