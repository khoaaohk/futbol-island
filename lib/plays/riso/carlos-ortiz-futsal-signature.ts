/** Carlos Ortiz — "the long shot from the back": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Carlos Ortiz Jiménez ("Ortiz", born 3 Oct 1983, Madrid), Spanish cierre / fixo — Inter Movistar 2008–20, then ACCS Paris and FC
 *  Barcelona; Spain's most-capped player (215 caps, 2007–22), European champion 2007, 2010, 2012 and 2016, World Cup runner-up 2008 and 2012.
 *  Matches the card: country Spain (lib/town/playerAppearance.json) and bio "Spanish cierre and Movistar Inter legend …" (playerBios.json).
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the long shot from the back (centre, long) — not one match. No
 *  written source we could reach describes a dated LONG-RANGE Ortiz goal. The best-documented Ortiz goal in a big match is his equaliser in
 *  the 2012 FIFA Futsal World Cup QUARTER-FINAL, described in words by FIFA.com: "Spain, however, refused to panic and were level two minutes
 *  later when Ortiz toe-poked the ball beyond Gustavo and into the far corner of the net". So:
 *  1  LIVE (broadcast camera, main stand, real time): Spain v Russia, 14 Nov 2012, Nimibutr Stadium, Bangkok. Sirilo put Russia ahead at
 *     1'14" (NOT staged: only the TV score bug 0–1); Ortiz, not in the starting five, is on the court (his entry is shown as a substitution);
 *     3'18": his toe-poke beyond Gustavo into the far corner — 1–1; Fernandão (#5) and Aicardo (#3) congratulate him (FIFA photo caption).
 *  2  REPLAY (slow motion, low, from behind Ortiz): the poke, the ball past Gustavo into the far corner, the team-mates; then the hanging board:
 *     2–1 (Fernandão 13'13"), 3–1 (Lozano 18'47"), 3–2 (Alemão own goal 33'06") and the final whistle. Those goals are NOT staged — board only.
 *  3  HOW HE DOES IT (a demonstration, no match claimed; Ortiz in a plain blue training top, a neutral navy keeper): the card's move — from
 *     the fixo's spot at the back (14 m, centre) the shot stays low and skids along the floor under the keeper's hands. The lesson from the
 *     entry: "Keep your shot low so it can skid past the keeper."
 *  (Match choice: no other futsal film uses this match — Falcão / Lozano / Luis Amado / Mammarella / Robinho / Rivillos use finals and semis.)
 * Sources (written; 2 new requests, 5 s apart, + cache, all in scratchpad/films/src-cache/):
 *  - FIFA.com (archived 2012), "Spain to face Italy after edging Russia" (match summary): fifa-2012-futsal-qf-esp-rus-summary.txt — the quote
 *    above; Sirilo "with just a minute and 14 seconds on the clock"; Fernandão's goal; Lozano "3-1 up from close range" before the break;
 *    Eder Lima's shot parried "back into the net off the legs of Alemao". Photo caption: "Ortiz #2 of Spain is congratulated by team mates
 *    Fernandao #5 and Aicardo #3 after scoring a goal against Russia".
 *  - FIFA.com (archived) match report, web.archive.org/web/20121117234728/http://www.fifa.com/futsalworldcup/matches/round=260741/match=300215849/
 *    report.html (fifa-2012-futsal-qf-esp-rus-report.txt): Match 48, 14 November 2012, Bangkok / Nimibutr Stadium, 21:00, att. 3,100; Spain
 *    starters Juanjo (12), Aicardo (3), Fernandão (5), Kike (8, C), Alemão (14); ORTIZ [2] a used substitute; Russia Gustavo (12, GK),
 *    Prudnikov, Sergeev (C), Pula, Sirilo; goals ORTIZ 3'18", FERNANDAO 13'13", LOZANO 18'47", SIRILO 1'14", ALEMAO 33'06" OG.
 *  - Wikipedia, "2012 FIFA Futsal World Cup" (raw, cached): Spain 3–2 Russia, 14 Nov 2012, Nimibutr Stadium, attendance 3,100.
 *  - Spanish Wikipedia, "Carlos Ortiz Jiménez" (raw): birth, position cierre, clubs, titles.
 * CONFIRMED: match, date, venue, round, the teams, the score line (0–1 1'14" → 1–1 3'18" → 2–1 → 3–1 → 3–2), that Ortiz came on as a
 *  substitute and scored the equaliser with a TOE-POKE beyond keeper Gustavo into the FAR corner; Fernandão (#5) and Aicardo (#3)
 *  congratulated him; Ortiz's shirt number 2.
 * INFERRED (never named in the narration): the moment and place of his substitution (and that Alemão went off), the build-up and the pass
 *  (a team-mate on the far side), the spot of the poke (≈ 9 m out, near side of centre), which end, the ball's height, his foot (right, the
 *  library default), every other player's position, Gustavo's late dive; kits (Spain red shirts / navy shorts, Russia white / blue, Gustavo in
 *  yellow — as in the approved Lozano / Robinho films); Ortiz's height (1.80 m) and short dark hair (the card's appearance). The board's
 *  look and the TV score bug are drawn, not sourced. No video was reviewed. Chapter 3 is a demonstration, not footage of a match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the strike). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: red (Spain, rings), yellow (Gustavo, lights, flight / skid lines), blue (court, Russia shorts, training top), navy (key line, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈100–280 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2012 World Cup',text:'The 2012 Futsal World Cup quarter-final. Russia score first against Spain. Then Carlos Ortiz comes on. He pokes the ball with his toe, past the keeper, into the far corner. One all!',tail:2.8,
  cues:['The 2012','Russia score','Then Carlos','He pokes','past the','far corner','One all'],heads:{'The 2012':'World Cup 2012','Russia score':'0–1','Then Carlos':'Ortiz on','One all':'1–1'}},
 {label:'Replay: the toe-poke',text:'Watch again. A quick poke with the toe, and the keeper is beaten! His teammates rush to him. Spain win three two.',tail:2.6,
  cues:['Watch again','quick poke','keeper is','His teammates','Spain win','three two'],heads:{'Spain win':'2–1, 3–1','three two':'3–2'}},
 {label:'The long shot from the back',text:'How does a fixo score from the back? Ortiz shoots from far away. The ball skids along the floor, under the keeper’s hands. Keep your shot low, so it skids past the keeper!',tail:2.6,
  cues:['How does','from the back','Ortiz shoots','ball skids','under the','Keep your','skids past'],heads:{'from the back':'From the back','Keep your':'Keep it low'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/carlos-ortiz-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/carlos-ortiz-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/carlos-ortiz-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('ortiz: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('ortiz: no cue '+w);return c.at;};
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
/** a quadratic arc a → b through a raised midpoint (height h); u ∈ [0,1] */
function arc3(a:V3,b:V3,h:number,u:number):V3{const M:V3=[(a[0]+b[0])/2,h,(a[2]+b[2])/2],p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*M[0]+r*b[0],p*a[1]+q*M[1]+r*b[1],p*a[2]+q*M[2]+r*b[2]];}

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line; on the blue court it is knocked out to paper first so the ink prints clean (no overprint) */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,1);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a small dashed ring standing up in the air (facing the camera) round a world point: the deflection off the keeper's leg */
function airRing(s:Sheet,st:Stage,ink:string,X:number,Yh:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const c=proj(st,X,Yh,Z),rr=r*kAt(st,Z)*g,q:Pt[]=[];for(let i=0;i<22;i++){const a=i/22*TAU;q.push([c[0]+Math.cos(a)*rr,c[1]+Math.sin(a)*rr]);}const p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_CAMERA=-Math.PI/2;
const SKIN_L:InkFill[]=[[Y,.8],[R,.3]],SKIN_M:InkFill[]=[[Y,.72],[R,.4]],SKIN_D:InkFill[]=[[Y,.5],[R,.4],[K,.25]];
const BUILD={height:1.8,bulk:1.02};
/** Carlos Ortiz: Spain — red shirt, navy shorts, red socks (kit inferred), no. 2 (FIFA line-up), short dark hair, light skin (card); 1.80 m inferred */
const ORTIZ:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,number:2,numberInk:Y,hairStyle:'short',build:BUILD,seed:4};
/** Ortiz in the demonstration: a plain blue training top (no match, no team claimed) */
const ORTIZ_TR:AthleteStyle={...ORTIZ,shirt:B,shorts:K,socks:K,trim:'paper',number:null};
/** Spain team-mates (red — inferred); numbers from FIFA's line-up: Fernandão 5, Aicardo 3, Kike 8, Alemão 14 */
const ESP=(n:number,num?:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:n%3===1?SKIN_D:n%3===2?SKIN_M:SKIN_L,hair:K,line:K,trim:Y,number:num??null,numberInk:Y,hairStyle:(['short','bald','curly'] as const)[n%3],build:{height:1.72+hash(n,3)*.12},seed:30+n});
/** Russia (white shirts, blue shorts — inferred) */
const RUS=(n:number):AthleteStyle=>({shirt:'paper',shorts:B,socks:'paper',boots:K,skin:[[Y,.62],[R,.2]],hair:n%3?K:[Y,.9],line:K,trim:R,hairStyle:n%2?'short':'bald',build:{height:1.74+hash(n,3)*.12},seed:20+n});
/** Gustavo, Russia's keeper — a yellow keeper kit (inferred) */
const GUSTAVO:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.7],[R,.26]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:62};
/** the demonstration keeper: a neutral navy training kit (no team is claimed in chapter 3) */
const DEMO_K:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:78};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.7],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact: just past the kicking toe along the foot (library coords, place at the origin) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT),BUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}

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

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, red / yellow / blue shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.1)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.4)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.48)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Russia's goal at X = +20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true);s.knockout(court,.25);s.fill(B,court,.82);
 s.fill(B,polyPath(floorQuad(st,-20,6,20,13),true),.12);
 // painted lines: touchlines, goal line, halfway, the penalty area (6 m arcs from the posts), the 6 m and 10 m marks, the centre circle
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X-6,GOAL_X-10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st,bulge,bz,by);o.keeper?.();sidePosts(s,st);
}
/** the goal at X = +20 seen side-on: the net runs back to +X */
function sideGoal(s:Sheet,st:Stage,bulge:number,bz:number,by:number){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((Z-bz)**2+(Yh-by)**2)/.35);return proj(st,GOAL_X+lerp(Db,Dt,Yh/H)+d,Yh,Z);};
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
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;low?:number};
/** the court seen end-on: blue floor + run-off, paper lines (goal line, the D, the touchlines), boards, stands, the goal */
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0,low=0}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-10,-30,10,GZ),true);s.knockout(court,.25);s.fill(B,court,.82);
 const lines=new Path2D(),arcPts:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
 lines.addPath(polyPath(floorStrip(st,[[-10,GZ],[10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts,.05),true));
 lines.addPath(polyPath(floorRing(st,0,GZ-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,GZ-10,.12,12),true));
 lines.addPath(polyPath(floorStrip(st,[[-10,-30],[-10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,-30],[10,GZ]],.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalEnd(s,st,bulge,bx,by,low);o.keeper?.(st);postsEnd(s,st);
}
function goalEnd(s:Sheet,st:Stage,bulge:number,bx:number,by:number,low:number){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((X-bx)**2+(Yh-by)**2)/.35);return proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H)+d);};
 const out=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 // "a low shot": the bottom strip of the mouth (under the knee, 0–0.5 m) glows yellow — the hardest place for a keeper to reach
 if(low>.02)s.fill(Y,polyPath([proj(st,Lx,0,GZ),proj(st,Lx,.5,GZ),proj(st,Rx,.5,GZ),proj(st,Rx,0,GZ)],true),.55*low);
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
/** the board, flat to the camera, centred at sheet point c, k units per metre (6 m × 3 m): Spain (red-yellow-red) left, Russia (white-blue-red) right */
function scoreboard(s:Sheet,c:Pt,k:number,b:{home:number;away:number;clock:string;flip:number;glow:number;flipAway?:number},seed:number,cables=true){
 const W=6*k,H=3*k,x0=c[0]-W/2,y0=c[1]-H/2,box=handCut([[x0,y0],[x0+W,y0],[x0+W,y0+H],[x0,y0+H]],seed,k*.05,k*.9);
 if(cables){const cab=new Path2D();for(const u of[.18,.82])cab.addPath(ribbon([[x0+W*u,y0],[x0+W*u+(u-.5)*k*.6,y0-k*9]],Math.max(2,k*.04),{seed:seed+2,taper:0,wobble:.5}));s.fill(K,cab,.8);}
 if(b.glow>.02)s.fill(Y,polyPath(blob(c[0],c[1],W*.62*(1+.08*b.glow),H*.75*(1+.1*b.glow),seed+3,{amp:.04,n:28}),true),.35*b.glow);
 const bp=polyPath(box,true);s.knockout(bp);s.fill(K,bp,.92);s.fill(R,ribbon([...box,box[0]],k*.09,{seed:seed+4,close:true,wobble:.6}));
 const sw=k*.9,sh=k*.62,ly=y0+H*.2;
 const hx=x0+k*.35,pr=polyPath(handCut([[hx,ly],[hx+sw,ly],[hx+sw,ly+sh],[hx,ly+sh]],seed+5,k*.02,k*.4),true);s.knockout(pr);s.fill(R,pr);s.fill(Y,rectPath(hx,ly+sh*.25,sw,sh*.5));
 const ax=x0+W-k*.35-sw,ap=polyPath(handCut([[ax,ly],[ax+sw,ly],[ax+sw,ly+sh],[ax,ly+sh]],seed+6,k*.02,k*.4),true);s.knockout(ap);
 s.fill(B,rectPath(ax,ly+sh/3,sw,sh/3));s.fill(R,rectPath(ax,ly+sh*2/3,sw,sh/3));
 const dh=H*.36,num=new Path2D(),sy=1-.8*Math.sin(Math.PI*clamp(b.flip));
 digits(num,String(b.home),c[0]-k*1.35,ly-dh*.02,dh,seed+10,sy);digits(num,String(b.away),c[0]+k*.85,ly-dh*.02,dh,seed+20,1-.8*Math.sin(Math.PI*clamp(b.flipAway??0)));
 num.addPath(ribbon([[c[0]-k*.32,ly+dh*.5],[c[0]+k*.32,ly+dh*.5]],dh*.13,{seed:seed+30,taper:0}));
 s.knockout(num);
 const clk=new Path2D(),ch=H*.2,cw=digits(new Path2D(),b.clock,0,0,ch,0);digits(clk,b.clock,c[0]-cw/2,y0+H*.7,ch,seed+40);s.knockout(clk);s.fill(Y,clk);
}

// SCENES
/** a player's chest (the passage enters the shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
/** the TV score bug (top-left of the composition box, constant size on screen): Spain v Russia + the match clock */
function scoreBug(s:Sheet,camY:number,zoom:number,b:{home:number;away:number;clock:string;flip:number;flipAway?:number;glow:number},show:number){
 if(show<=.02)return;const k=62/zoom*easeOutBack(clamp(show)),c:Pt=[-(BOX_W/2-40)/zoom+3.3*k,camY-(BOX_H/2-40)/zoom+1.6*k];scoreboard(s,c,k,b,811,false);}
/** the toe-poke: a short, stabbing strike — no big back-swing (u = 0 set → .3 plant → STRIKE_CONTACT → .75 short follow-through) */
const poke=(u:number)=>{const p=strike(u);return u<STRIKE_CONTACT?blendPose(p,strike(STRIKE_CONTACT),.35*sm(.22,STRIKE_CONTACT,u)):blendPose(p,strike(STRIKE_CONTACT),.45);};

// ================= chapter 1 — LIVE: 2012 World Cup quarter-final, Spain v Russia; 0–1 (1'14"), Ortiz on, his toe-poke at 3'18" → 1–1 =================
const C1={first:A(0,'Russia score'),then:A(0,'Then Carlos'),pokes:A(0,'He pokes'),past:A(0,'past the'),far:A(0,'far corner'),one:A(0,'One all'),end:AUTH[0].seconds};
/** Ortiz meets the pass here (inferred spot: 9 m out, near side of centre); the ball goes low into the FAR corner (confirmed: "far corner") */
const KB:[number,number]=[11.2,7.2],NETP:V3=[20.55,.24,11.15],LINEP:V3=[20,.22,11.15];
const T_HIT=lerp(C1.pokes,C1.past,.55),T_LINE=T_HIT+.5,T_IN=T_LINE+.12,T_PASS=T_HIT-.8;
const YAW_SHOT=yawTo(LINEP[0]-KB[0],LINEP[2]-KB[1]);
const SB=toMine(strikeBall(YAW_SHOT)),PLANT:[number,number]=[KB[0]-SB[0],KB[1]-SB[2]];
/** the pass comes from a team-mate on the far side (inferred; the source does not describe the build-up) */
const PASSER:[number,number]=[13.4,14.6];
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 if(T<T_PASS){const w=sm(0,T_PASS,T,linear);return{X:lerp(8.6,PASSER[0]-.4,w),Y:BALL_R,Z:lerp(15.4,PASSER[1]-.2,w),flying:false,spin:T*8};}
 if(T<T_HIT){const u=sm(T_PASS,T_HIT,T,easeOut);return{X:lerp(PASSER[0]-.4,KB[0],u),Y:BALL_R,Z:lerp(PASSER[1]-.2,KB[1],u),flying:false,spin:T*20};}
 const K0:V3=[KB[0],BALL_R,KB[1]];
 if(T<T_LINE){const p=arc3(K0,LINEP,.2,sm(T_HIT,T_LINE,T,linear));return{X:p[0],Y:p[1],Z:p[2],flying:true,spin:(T-T_HIT)*60};}
 if(T<T_IN){const u=sm(T_LINE,T_IN,T,linear);return{X:lerp(LINEP[0],NETP[0],u),Y:lerp(LINEP[1],NETP[1],u),Z:NETP[2],flying:true,spin:40};}
 const d=sm(T_IN+.05,T_IN+.35,T,easeIn);return{X:NETP[0]+.1*d,Y:lerp(NETP[1],BALL_R,d),Z:NETP[2],flying:false,spin:50};
}
/** Ortiz: waits by the bench off the near touchline; on "Then Carlos" he runs on, up to the ball; the toe-poke; he wheels away to the near side */
const ON:[number,number]=[2.2,-1.3],CEL:[number,number]=[13.6,3.6];
const RUN0=C1.then-.1,ARR=T_HIT-.45;
const liveO:Gen=T=>{
 const run=sm(RUN0,ARR,T,easeIO),cel=sm(T_IN+.3,C1.end-.4,T,easeIO);
 const pre:[number,number]=[lerp(ON[0],PLANT[0]-1.2,run)+Math.sin(run*Math.PI)*-1.2,lerp(ON[1],PLANT[1]-.5,run)];
 const u=sm(ARR,T_HIT,T,easeOut);
 let X=lerp(pre[0],PLANT[0],u),Z=lerp(pre[1],PLANT[1],u);X=lerp(X,CEL[0],cel);Z=lerp(Z,CEL[1],cel);
 let pose:Pose,yaw=YAW_SHOT;
 if(T<RUN0){pose=blendPose(stand(),posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:4,neckP:4,lShA:12,rShA:12,lElb:20,rElb:20}),.5+.5*Math.sin(T*2.2));yaw=FACE_CAMERA+1.2;}
 else if(T<ARR){pose=runCycle(T*runCadence(.7),{speed:.7});yaw=yawTo(PLANT[0]-1.2-ON[0],PLANT[1]-.5-ON[1]);}
 else if(T<T_IN+.3){pose=poke(key(T,[[ARR,.1],[T_HIT-.2,.3],[T_HIT,STRIKE_CONTACT],[T_HIT+.45,.75]],linear));}
 else{const w=sm(T_IN+.3,T_IN+.8,T,easeIO);pose=blendPose(poke(.75),celebrate((T-T_IN-.3)*1.3,{kind:'run'}),w);yaw=lerp(YAW_SHOT,yawTo(CEL[0]-KB[0],CEL[1]-KB[1]),w);}
 return{pose,yaw,X,Z};
};
/** the team: Alemão (#14) comes off as Ortiz comes on (who went off is inferred); Fernandão (#5) and Aicardo (#3) run to Ortiz after the goal (FIFA photo) */
type Man={x:number;z:number;ph:number;num?:number};
const SPAIN:Man[]=[{x:15.8,z:12.6,ph:.3,num:5},{x:14.6,z:4.4,ph:.6,num:3},{x:PASSER[0],z:PASSER[1],ph:.9,num:8}];
const OFF:Man={x:5.2,z:5.2,ph:.1,num:14};
const liveEsp=(i:number):Gen=>T=>{const m=SPAIN[i],o=liveO(T),go=i<2?sm(T_IN+.35,C1.end-.2,T,easeIO):0,jig=.3*Math.sin(T*1.6+m.ph*6);
 let X=m.x+jig*.4,Z=m.z+jig*.3;if(i===2&&T<T_PASS){X=lerp(8.4,m.x,sm(0,T_PASS,T,linear));Z=lerp(15.6,m.z,sm(0,T_PASS,T,linear));}
 X=lerp(X,o.X+[.9,-.8][i]||0,go);Z=lerp(Z,o.Z+[.8,-.6][i]||0,go);
 let pose:Pose;
 if(i===2&&T<T_PASS)pose=runCycle(T*runCadence(.3),{speed:.3});
 else if(i===2&&T<T_PASS+.6)pose=strike(key(T,[[T_PASS-.3,.3],[T_PASS,STRIKE_CONTACT],[T_PASS+.6,.8]],linear),{power:.4});
 else pose=blendPose(runCycle(T*runCadence(.2)+m.ph,{speed:.2}),stand(),.55);
 if(go>0)pose=blendPose(pose,celebrate(T*1.2+i*.3,{kind:i?'arms':'run'}),sm(T_IN+.35,T_IN+.75,T));
 const yaw=go>0?yawTo(o.X-m.x,o.Z-m.z):i===2&&T<T_PASS+.6?yawTo(KB[0]-PASSER[0],KB[1]-PASSER[1]):yawTo(18-m.x,10-m.z);
 return{pose,yaw,X,Z};};
/** Alemão jogs off to the bench as Ortiz runs on */
const liveOff:Gen=T=>{const w=sm(RUN0-.2,ARR-.2,T,easeIO),X=lerp(OFF.x,ON[0]-1.2,w),Z=lerp(OFF.z,ON[1]-.2,w);
 const pose=w>0&&w<1?runCycle(T*runCadence(.3),{speed:.3}):blendPose(runCycle(T*runCadence(.15),{speed:.15}),stand(),w>=1?1:.5);
 return{pose,yaw:w>0&&w<1?yawTo(ON[0]-OFF.x,ON[1]-OFF.z):w>=1?FACE_CAMERA+1:yawTo(1,.4),X,Z};};
const RUSSIA:Man[]=[{x:13.6,z:8.4,ph:.1},{x:16.2,z:11.6,ph:.4},{x:12.4,z:12.8,ph:.7},{x:16.8,z:6.2,ph:.2}];
const liveRus=(i:number):Gen=>T=>{const m=RUSSIA[i],post=sm(T_IN+.3,T_IN+1.3,T),jig=.25*Math.sin(T*1.7+m.ph*6);let pose=backpedal(T*.9+m.ph);
 if(i===0){const lu=key(T,[[T_HIT-.15,0],[T_HIT+.2,.6],[T_HIT+.8,1]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_HIT-.2,T_HIT-.05,T));}
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20}),post);
 const b=liveBall(Math.min(T,T_HIT));return{pose,yaw:yawTo(b.X-m.x,b.Z-m.z)+.4*post*(i%2?1:-1),X:m.x+jig*.4,Z:m.z+jig*.3};};
/** Gustavo: set in the middle of his goal; the poke is quick — he goes down late to his right (the far post) and the ball is past him */
const GK:[number,number]=[19.25,10.05];
const liveK:Gen=T=>{const u=sm(T_HIT+.14,T_HIT+.95,T,linear);let pose=keeperSet(T*1.3);if(u>0)pose=blendPose(pose,keeperDive(u*.8,{side:'r',height:.1}),sm(0,.15,u));
 return{pose,yaw:FACE_LEFT+(T<T_PASS?-.35:0)*(1-sm(T_PASS,T_HIT,T))+.15,X:GK[0],Z:GK[1]};};
const liveCam=(T:number)=>({x:key(T,mono([[0,6.4],[C1.first,6.8],[C1.then,5.4],[RUN0+.8,8.6],[T_HIT,12.2],[T_IN,13.8],[T_IN+.9,14],[C1.end,13.6]]),easeInOutSine),
 zoom:key(T,mono([[0,.5],[C1.first,.52],[C1.then,.6],[ARR,.54],[T_HIT,.52],[T_IN,.54],[T_IN+.9,.62],[C1.end,.66]]),easeInOutSine),
 y:key(T,mono([[0,1260],[C1.first,1260],[C1.then,1600],[RUN0+.8,1520],[ARR,1300],[T_HIT,1260],[T_IN,1240],[C1.end,1300]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_HIT,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.15,flash:pulse(T,T_IN,1.2)+.4*pulse(T,C1.one,1),bulge:.45*sm(T_IN-.1,T_IN,T)*(1-.6*sm(T_IN+.2,T_IN+1.1,T))+.12*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:NETP[2],by:NETP[1],
  keeper:()=>{athlete(s,st,liveK,T,GUSTAVO,{detail:'low'});}});
 // "Then Carlos Ortiz comes on": a yellow dashed ring round him at the bench, then his run on (dashed yellow arrow)
 const on=easeOutBack(sm(C1.then-.2,C1.then+.2,T))*(1-sm(ARR,ARR+.3,T));
 if(on>.02){floorDashRing(s,st,Y,ON[0],ON[1],.7,9,501,on);const a=proj(st,ON[0]+.6,0,ON[1]+.8),e=proj(st,PLANT[0]-1.4,0,PLANT[1]-.6),m=proj(st,ON[0]+1,0,(ON[1]+PLANT[1])/2+.4),q=partial([a,m,e],sm(C1.then,RUN0+.8,T,easeOut));if(q.length>1){dashed(s,Y,q,9,502,{dash:36});arrowHead(s,Y,q,30,503);}}
 // "past the keeper": the flight line, dashed yellow, low over the floor into the far corner
 if(T>T_HIT){const tr:Pt[]=[];for(let k=0;k<=12;k++){const q=liveBall(lerp(T_HIT,Math.min(T,T_IN),k/12));tr.push(proj(st,q.X,q.Y,q.Z));}const g=1-sm(C1.one+.4,C1.one+1,T);if(g>.02)dashed(s,Y,tr,9,504,{dash:34,progress:1});}
 type It={z:number;draw:()=>void};const items:It[]=[];
 RUSSIA.forEach((_,i)=>{const g=liveRus(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,RUS(i),{detail:'low'})});});
 SPAIN.forEach((m,i)=>{const g=liveEsp(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i,m.num),{detail:'low'})});});
 items.push({z:liveOff(T).Z,draw:()=>athlete(s,st,liveOff,T,ESP(3,OFF.num),{detail:'low'})});
 items.push({z:liveO(T).Z,draw:()=>athlete(s,st,liveO,T,ORTIZ,{detail:'mid',smear:T>T_HIT-.2&&T<T_HIT+.2?.08:T>RUN0&&T<ARR?.06:0})});
 items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45);
  if(b.flying&&T<T_LINE)speedLines(s,Y,p[0],p[1],Math.PI+Math.atan2(-.1,1),{n:4,seed:505+Math.floor(T*6),len:r*3,spread:r*.7,width:4});
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.5:0,dir:0});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 if(T>=T_HIT&&T<T_HIT+.35){const p=proj(st,KB[0],BALL_R,KB[1]);sparkBurst(s,Y,p[0],p[1],70,{n:9,seed:506,g:easeOut(sm(T_HIT,T_HIT+.2,T))*(1-sm(T_HIT+.2,T_HIT+.35,T))});}
 // "into the far corner": a yellow ring stands in the far bottom corner of the net and stays until "One all"
 airRing(s,st,Y,LINEP[0]+.2,LINEP[1]+.1,LINEP[2],.45,9,507,easeOutBack(sm(Math.max(T_IN,C1.far-.1),Math.max(T_IN,C1.far-.1)+.3,T))*(1-sm(C1.one+.5,C1.one+.9,T)));
 // the TV score bug: 0–1 (1'14") from "Russia score first"; 1–1 (3'18") on the goal
 const g1=T_IN+.25;scoreBug(s,c.y,c.zoom,{home:T<g1?0:1,away:1,clock:T<g1?'01:14':'03:18',flip:sm(g1,g1+.25,T,linear),flipAway:sm(C1.first,C1.first+.25,T,linear),glow:pulse(T,C1.first,1)+pulse(T,g1,1.2)},sm(C1.first-.2,C1.first+.2,T));
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveO(tt),.12));},still:T_HIT+.05};

// ================= chapter 2 — REPLAY: slow motion, low, behind Ortiz; the poke into the far corner; team-mates; then the board 2–1, 3–1, 3–2 =================
const C2={watch:A(1,'Watch'),quick:A(1,'quick poke'),beaten:A(1,'keeper is'),mates:A(1,'His teammates'),win:A(1,'Spain win'),three:A(1,'three two'),end:AUTH[1].seconds};
/** the replay world = the live court seen end-on from behind Ortiz: live (X, Z) → (10 − Z, GZ − (20 − X)) */
const toEnd=(X:number,Z:number):[number,number]=>[10-Z,GZ-(20-X)];
const RB=toEnd(KB[0],KB[1]),RLINE:V3=[10-LINEP[2],.22,GZ],RNET:V3=[10-NETP[2],.24,GZ+.55],RPASS=toEnd(PASSER[0]-.4,PASSER[1]-.2);
const RYAW=yawTo(RLINE[0]-RB[0],RLINE[2]-RB[1]);
const RSB=toMine(strikeBall(RYAW)),RPL:[number,number]=[RB[0]-RSB[0],RB[1]-RSB[2]];
const R_HIT=C2.quick+.35,R_LINE=R_HIT+1.2,R_IN=R_LINE+.3,R_PASS=R_HIT-1.6;
const rT=(t:number)=>key(t,[[0,.08],[R_PASS,.1],[R_HIT-.7,.3],[R_HIT,STRIKE_CONTACT],[R_HIT+1.2,.75]],linear);
const R_CEL=R_IN+.4,RCEL:[number,number]=[RPL[0]+2.2,RPL[1]-1.2];
const repO:Gen=t=>{const c=sm(R_CEL,C2.win-.4,t,easeIO);
 const X=lerp(RPL[0]+key(t,[[0,-.5*Math.cos(RYAW)],[R_HIT,0,easeOut],[R_HIT+1.4,.15*Math.cos(RYAW)]]),RCEL[0],c),Z=lerp(RPL[1]+key(t,[[0,-.5*Math.sin(RYAW)],[R_HIT,0,easeOut],[R_HIT+1.4,.15*Math.sin(RYAW)]]),RCEL[1],c);
 const w=sm(R_CEL,R_CEL+.6,t,easeIO);const pose=w>0?blendPose(poke(.75),celebrate((t-R_CEL)*.9,{kind:'arms'}),w):poke(rT(t));
 return{pose,yaw:lerp(RYAW,FACE_CAMERA+.4,w),X,Z};};
function repBall(t:number):{X:number;Y:number;Z:number;flying:boolean}{
 if(t<R_PASS)return{X:RPASS[0],Y:BALL_R,Z:RPASS[1],flying:false};
 if(t<R_HIT){const u=sm(R_PASS,R_HIT,t,easeOut);return{X:lerp(RPASS[0],RB[0],u),Y:BALL_R,Z:lerp(RPASS[1],RB[1],u),flying:false};}
 if(t<R_LINE){const p=arc3([RB[0],BALL_R,RB[1]],RLINE,.2,sm(R_HIT,R_LINE,t,linear));return{X:p[0],Y:p[1],Z:p[2],flying:true};}
 if(t<R_IN){const u=sm(R_LINE,R_IN,t,linear);return{X:lerp(RLINE[0],RNET[0],u),Y:lerp(RLINE[1],RNET[1],u),Z:lerp(RLINE[2],RNET[2],u),flying:true};}
 const d=sm(R_IN+.1,R_IN+.6,t,easeIn);return{X:RNET[0],Y:lerp(RNET[1],BALL_R,d),Z:RNET[2],flying:false};}
/** Gustavo in the replay: set; he goes down to his right (screen left) too late — the ball is past him */
const RGK=toEnd(GK[0],GK[1]);
const repK:Gen=t=>{const u=sm(R_HIT+.35,R_HIT+2.6,t,linear);let pose=keeperSet(t*.5);if(u>0)pose=blendPose(pose,keeperDive(u*.8,{side:'r',height:.1}),sm(0,.12,u));
 return{pose,yaw:FACE_CAMERA-.08,X:RGK[0],Z:RGK[1]};};
/** a Russian defender between Ortiz and goal (lunges late) and one on the far side; Fernandão (#5) and Aicardo (#3) run in on "His teammates" */
const REPR:[number,number][]=[toEnd(RUSSIA[0].x,RUSSIA[0].z),toEnd(RUSSIA[1].x,RUSSIA[1].z)];
const repR=(k:number):Gen=>t=>{const m=REPR[k];let pose=blendPose(backpedal(.2+t*.25+k*.3),stand(),.4);
 if(k===0){const lu=key(t,[[R_HIT-.2,0],[R_HIT+.8,.6],[R_HIT+2.2,1]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(R_HIT-.4,R_HIT-.1,t));}
 const b=repBall(Math.min(t,R_HIT));return{pose,yaw:yawTo(b.X-m[0],b.Z-m[1]),X:m[0],Z:m[1]};};
const MATE0:[number,number][]=[[-5.2,GZ-4.6],[7.2,GZ-10.5]];
const repMate=(k:number):Gen=>t=>{const o=repO(t),u=sm(C2.mates-.3,C2.mates+.9,t,easeOut),to:[number,number]=[o.X+(k?1:-1)*.85,o.Z+(k?-.3:.5)];
 const X=lerp(MATE0[k][0],to[0],u),Z=lerp(MATE0[k][1],to[1],u);
 const pose=u<=0?blendPose(runCycle(t*runCadence(.1)+k*.5,{speed:.1}),stand(),.6):u<1?runCycle(t*runCadence(.8)*.6+k*.5,{speed:.8}):celebrate(t*.9+k*.4,{kind:'arms'});
 return{pose,yaw:u<1?yawTo(to[0]-MATE0[k][0],to[1]-MATE0[k][1]):yawTo(o.X-X,o.Z-Z),X,Z};};
const st2=(t:number):Stage=>({F:1500,eye:1.3,cx:RB[0]+.9-1.2*sm(R_HIT,R_IN,t,easeIO),cz:RB[1]-5+.8*sm(R_HIT,R_IN,t,easeIO)});
/** the board hangs over the goal end (X = 0, 7 m up, 3 m in front of the goal line) */
const BOARD2:V3=[0,7,GZ-3];
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(tt),hit=pulse(t,R_HIT,.4),net=pulse(t,R_IN,.6);
  const bc=proj(st,BOARD2[0],BOARD2[1],BOARD2[2]),kb=kAt(st,BOARD2[2]),oc=repO(tt),og=proj(st,oc.X,1.1,oc.Z);
  camPath(s,t,[[0,-120,130,1.05],[C2.quick,-160,150,1.15],[R_HIT,-170,150,1.12],[R_LINE,-300,240,1.2],[R_IN+.3,-330,230,1.35],[C2.beaten+.4,-330,230,1.35],
   [C2.mates,og[0]-100,og[1]-40,.95],[C2.mates+1.4,og[0]-100,og[1]-60,.95],[C2.win,bc[0]-60,bc[1]+300,.62],[C2.three,bc[0]-60,bc[1]+280,.68],[C2.end,bc[0]-60,bc[1]+300,.62]],[8*hit*Math.sin(t*90),5*hit*Math.cos(t*77)+4*net*Math.sin(t*60)]);
  const b=repBall(tt),goal=tt>=R_IN;
  arena(s,st,{t:tt,cheer:goal?1-.2*sm(C2.end-1,C2.end,tt):.1,flash:pulse(tt,R_IN,1.2)+.5*pulse(tt,C2.three,1.4)+.3*pulse(tt,C2.win,1),bulge:.5*sm(R_IN-.2,R_IN,tt)*(1-.6*sm(R_IN+.4,R_IN+1.4,tt))+.12*settle(tt,R_IN,{amp:1,freq:3,decay:3}),bx:RNET[0],by:RNET[1],
   keeper:stg=>{athlete(s,stg,repK,tt,GUSTAVO,{detail:'mid'});}});
  // "A quick poke with the toe": a yellow dashed ring round the ball at his toe, then the flight line (dashed yellow, drawn as the ball goes)
  floorDashRing(s,st,Y,RB[0],RB[1],.5,10,601,easeOutBack(sm(C2.quick-.1,C2.quick+.25,tt))*(1-sm(R_HIT+.4,R_HIT+.7,tt)));
  if(tt>R_HIT){const pts:Pt[]=[];for(let k=0;k<=18;k++){const q=repBall(lerp(R_HIT,Math.min(tt,R_IN),k/18));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,95,{dash:44});}
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(.02,.3);shadow(s,g[0],g[1],r*1.1,r*.3,96,b.flying?.3:.45);
   if(b.flying&&tt<R_LINE)speedLines(s,R,p[0],p[1],dir,{n:5,seed:604+Math.floor(tt*6),len:r*3.5,spread:r*.8,width:5});
   ball(s,p[0],p[1],r,97,{rot:tt*6,smear:b.flying?.4:0,dir});
   if(tt>=R_HIT&&tt<R_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:98,g:easeOut(sm(R_HIT,R_HIT+.3,tt))});};
  const its:{z:number;draw:()=>void}[]=REPR.map((m,k)=>{const g=repR(k);return{z:m[1],draw:()=>{athlete(s,st,g,tt,RUS(k),{detail:'mid'});}};});
  [0,1].forEach(k=>{const g=repMate(k);its.push({z:g(tt).Z,draw:()=>athlete(s,st,g,tt,ESP(k,SPAIN[k].num),{detail:'mid'})});});
  its.push({z:oc.Z,draw:()=>{athlete(s,st,repO,tt,ORTIZ,{detail:'high',smear:tt>R_HIT-.5&&tt<R_HIT+.4?.3:0});}},{z:!b.flying&&tt<R_HIT&&Math.hypot(b.X-RB[0],b.Z-RB[1])<.5?oc.Z-.01:b.Z,draw:drawBall});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "the keeper is beaten": red brackets round Gustavo as the ball passes him
  {const fr=easeOutBack(sm(C2.beaten-.1,C2.beaten+.25,tt))*(1-sm(C2.mates-.3,C2.mates,tt)),kg=proj(st,RLINE[0]+.9,0,GZ-.6),kk=kAt(st,GZ-.6);
   if(fr>.02){const h=1.7*kk,w=h*.6,hh=h*.5,cx=kg[0],cy=kg[1]-h*.45,Lb=h*.2*fr,br=new Path2D();
    for(const[sx,sy] of[[-1,-1],[1,-1],[1,1],[-1,1]] as Pt[]){const x=cx+sx*w,y=cy+sy*hh;br.addPath(ribbon([[x,y-sy*Lb],[x,y],[x-sx*Lb,y]],13,{seed:92+sx+sy*3,taper:0,wobble:.6}));}
    s.knockout(br);s.fill(R,br);}}
  if(tt>=R_IN&&tt<R_IN+1.2){const p=proj(st,RNET[0],RNET[1],GZ+.4);sparkBurst(s,Y,p[0],p[1],130,{n:12,seed:99,g:easeOut(sm(R_IN,R_IN+.3,tt))*(1-sm(R_IN+.8,R_IN+1.2,tt))});}
  // "Spain win three two" → the board: 2–1 (13'13"), 3–1 (18'47"), then 3–2 (33'06", an own goal) and the final whistle. Those goals are NOT staged.
  if(tt>=C2.win-.7){const f1=C2.win+.05,f2=C2.win+.6,f3=C2.three+.1,home=tt<f1?1:tt<f2?2:3,away=tt<f3?1:2,clk=tt<f1?'03:18':tt<f2?'13:13':tt<f3?'18:47':'40:00',last=tt>=f2?f2:tt>=f1?f1:-9;
   scoreboard(s,bc,kb,{home,away,clock:clk,flip:sm(last,last+.25,tt,linear),flipAway:sm(f3,f3+.25,tt,linear),glow:pulse(tt,f1,1)+pulse(tt,f2,1)+pulse(tt,f3,1.6)},611);}
 },
 aperture(t0){const{tt}=clock(1,t0),st=st2(tt),c=proj(st,BOARD2[0],BOARD2[1],BOARD2[2]),r=kAt(st,BOARD2[2])*.5,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r]);}return aperture(q);},
 still:R_LINE-.3,
};

// ================= chapter 3 — HOW HE DOES IT (a demonstration in training kit, no match claimed): the long, low shot from the back =================
const C3={how:A(2,'How does'),back:A(2,'from the back'),shoots:A(2,'Ortiz shoots'),skids:A(2,'ball skids'),under:A(2,'under the'),keep:A(2,'Keep your'),past:A(2,'skids past'),end:AUTH[2].seconds};
/** the card: centre, long — Ortiz 14 m out, the fixo's spot at the back; low along the floor, inside the left post (screen left) */
const DB:[number,number]=[.3,GZ-14],DT:V3=[-1.2,.13,GZ-.02];
const DYAW=yawTo(DT[0]-DB[0],DT[2]-DB[1]);
const DSB=toMine(strikeBall(DYAW)),DPL:[number,number]=[DB[0]-DSB[0],DB[1]-DSB[2]];
const D_HIT=lerp(C3.shoots,C3.skids,.45),D_IN=C3.skids+.35;
const dT=(t:number)=>key(t,[[D_HIT-.62,0],[D_HIT-.32,.22],[D_HIT,STRIKE_CONTACT],[D_HIT+1.4,.85],[C3.end,1]],linear);
const demoO:Gen=t=>{const X=DPL[0]+key(t,[[0,-.25],[D_HIT-.62,-.25],[D_HIT,0,easeOut],[D_HIT+1.6,.15]]),Z=DPL[1]+key(t,[[0,-.9],[D_HIT-.62,-.9],[D_HIT,0,easeOut],[D_HIT+1.6,.3]]);
 const pose=t<D_HIT-.62?blendPose(stand(),posed({lHipF:14,rHipF:8,lKnee:22,rKnee:16,lean:12,neckP:14,lShA:20,rShA:20,lElb:30,rElb:30}),.5+.5*Math.sin(t*2)):strike(dT(t));
 return{pose,yaw:DYAW,X,Z};};
/** the ball never leaves the floor: it skids (a tiny hop at the start, then flat) */
function demoBall(t:number){
 if(t<D_HIT)return{X:DB[0],Y:BALL_R,Z:DB[1],flying:false};
 if(t<D_IN){const u=sm(D_HIT,D_IN,t,linear);return{X:lerp(DB[0],DT[0],u),Y:BALL_R+.05*Math.sin(clamp(u*4)*Math.PI),Z:lerp(DB[1],DT[2],u),flying:true};}
 const d=sm(D_IN,D_IN+.3,t,easeOut);return{X:DT[0]-.05*d,Y:BALL_R,Z:GZ+.55*d,flying:false};}
/** the keeper: set with his hands at chest height; the low ball means all the way down — he only starts to drop, and it skids under his hands */
const KD=D_HIT+.3;
const demoK:Gen=t=>{let pose=keeperSet(t*.9);if(t>=KD)pose=blendPose(keeperSet(KD*.9),keeperDive(sm(KD,D_IN+.3,t,easeOut)*.34,{side:'r',height:0}),sm(KD,KD+.2,t));
 return{pose,yaw:FACE_CAMERA+.1,X:.1-.25*sm(KD,D_IN,t,easeOut),Z:GZ-.7};};
const st3:Stage={F:1500,eye:2.6,cx:2.6,cz:GZ-22};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  camPath(s,t,[[0,-300,300,.95],[C3.back,-250,340,.9],[C3.shoots,-250,320,.95],[D_HIT+.3,-300,220,1.2],[C3.skids,-220,160,1.5],[C3.under,-190,110,2.3],[C3.keep+.2,-190,115,2.1],[C3.past,-200,150,1.7],[C3.end,-210,160,1.6]]);
  const b=demoBall(tt),goal=tt>=D_IN;
  arena(s,st,{t:tt,cheer:goal?.6*(1-sm(C3.end-1,C3.end,tt)):0,flash:pulse(tt,D_IN,1),low:sm(C3.keep,C3.keep+.3,tt)*(1-sm(C3.end-.8,C3.end-.3,tt)),
   bulge:.45*sm(D_IN-.15,D_IN,tt)*(1-.6*sm(D_IN+.4,D_IN+1.4,tt))+.1*settle(tt,D_IN,{amp:1,freq:3,decay:3}),bx:DT[0],by:DT[1],
   keeper:stg=>{athlete(s,stg,demoK,tt,DEMO_K,{detail:'mid'});}});
  const kp=demoK(tt),kg=proj(st,kp.X,0,kp.Z),kk=kAt(st,kp.Z);
  // "from the back": a yellow dashed ring round Ortiz's feet and a navy dashed measure to the goal — a long way out
  {const g=easeOutBack(sm(C3.back-.1,C3.back+.3,tt))*(1-sm(D_HIT-.2,D_HIT,tt));if(g>.02){floorDashRing(s,st,Y,DB[0],DB[1]+.1,.9,10,701,g);
   const a=proj(st,DB[0]+1.4,0,DB[1]),e=proj(st,DB[0]+1.4,0,GZ-.3),q=partial([a,L2(a,e,.5),e],sm(C3.back,C3.back+.6,tt,easeOut));if(q.length>1){dashed(s,K,q,9,702,{dash:32});arrowHead(s,K,q,30,703);}}}
  // "The ball skids along the floor": the skid line on the floor, yellow, with short scuff ticks — it stays down
  if(tt>D_HIT){const pts:Pt[]=[],u=sm(D_HIT,D_IN,Math.min(tt,D_IN),linear);for(let k=0;k<=14;k++){const w=u*k/14;pts.push(proj(st,lerp(DB[0],DT[0],w),0,lerp(DB[1],DT[2],w)));}
   const g=1-.6*sm(C3.keep,C3.keep+.5,tt);if(pts.length>1&&g>.02){const p=ribbon(smoothPts(pts,false,6),8,{seed:704,taper:.3,wobble:1});s.knockout(p);s.fill(Y,p,g);}
   const sk=sm(C3.skids-.1,C3.skids+.4,tt);if(sk>.02){const tk=new Path2D();for(let k=1;k<6;k++){const w=u*k/6,X=lerp(DB[0],DT[0],w),Z=lerp(DB[1],DT[2],w),a=proj(st,X-.25,0,Z-.2),e=proj(st,X+.25,0,Z+.2);tk.addPath(ribbon([a,e],7*sk,{seed:705+k,taper:.4,wobble:.5}));}s.knockout(tk);s.fill(R,tk);}}
  // "under the keeper's hands": red brackets round his hands (high) and a yellow ring where the ball goes under them
  {const fr=easeOutBack(sm(C3.under-.1,C3.under+.25,tt))*(1-sm(C3.keep+.3,C3.keep+.6,tt));
   if(fr>.02){const h=1.8*kk,w=h*.5,hh=h*.3,cx=kg[0],cy=kg[1]-h*.72,Lb=h*.16*fr,br=new Path2D();
    for(const[sx,sy] of[[-1,-1],[1,-1],[1,1],[-1,1]] as Pt[]){const x=cx+sx*w,y=cy+sy*hh;br.addPath(ribbon([[x,y-sy*Lb],[x,y],[x-sx*Lb,y]],13,{seed:720+sx+sy*3,taper:0,wobble:.6}));}
    s.knockout(br);s.fill(R,br);floorDashRing(s,st,Y,DT[0]+.2,GZ-.6,.45,9,721,fr);}}
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(.05,-.1);shadow(s,g[0],g[1],r*1.1,r*.3,706,.45);
   if(b.flying)speedLines(s,R,p[0],p[1],dir,{n:5,seed:707+Math.floor(tt*6),len:r*3.2,spread:r*.8,width:5});
   ball(s,p[0],p[1],r,708,{rot:tt*6,smear:b.flying?.4:0,dir});if(tt>=D_HIT&&tt<D_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:709,g:easeOut(sm(D_HIT,D_HIT+.3,tt))});};
  const O=demoO(tt);
  const its:{z:number;draw:()=>void}[]=[{z:O.Z,draw:()=>athlete(s,st,demoO,tt,ORTIZ_TR,{detail:'high',smear:tt>D_HIT-.3&&tt<D_HIT+.3?.2:0})},
   {z:!b.flying&&tt<D_HIT?O.Z-.01:b.Z,draw:drawBall}];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=D_IN&&tt<D_IN+1){const p=proj(st,DT[0],DT[1],GZ+.4);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:710,g:easeOut(sm(D_IN,D_IN+.3,tt))*(1-sm(D_IN+.7,D_IN+1,tt))});}
  // "so it skids past the keeper": a big yellow tick stamps beside the goal, with a navy misregistered echo
  const tick=easeOutBack(sm(C3.past,C3.past+.35,tt));
  if(tick>.02){const c=proj(st,2.7,1.3,GZ),S=150*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:711,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:712,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:713,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoO(tt),.13));},
 still:D_HIT+.4,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'carlos-ortiz-futsal-signature',format:'futsal',title:'Carlos Ortiz’s shot from the back',theme:'Keep your shot low so it can skid past the keeper.',
 ageNote:'For players aged 7–12: the 2012 World Cup goal is real; the last chapter is a demonstration of how he shoots from the back.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball skids low across the touch point with red speed lines and a yellow skid mark; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.6),bx=x-120+240*easeOut(u);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.22,seed+2,{n:16}),true),.3);
  if(u<1){const sk=ribbon([[x-130,y+r*.9],[bx-r,y+r*.9]],10*(1-u)+3,{seed,taper:.6,wobble:1});s.fill(Y,sk,1);speedLines(s,R,bx,y,0,{n:4,seed:seed+1,len:r*3,spread:r*.8,width:5});}
  ball(s,bx,y,r,seed,{rot:age*12,smear:u<1?.4*(1-u):0,dir:0});
 },
};
export default film;
