/** Vander Carioca — "the veteran pivot's lay-off": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: the card is Brazil (playerAppearance country) — Vander dos Santos Ferreira, "Vander Carioca" (b. 22 Jun 1976, Rio de Janeiro),
 * a right-footed pivô, Brazil 1998–2004 (Copa América 1998 + 1999, World Cups 2000 + 2004), still playing for Corinthians at 42 when
 * he retired on 17 Dec 2018. NAMESAKE WARNING: the "VANDER" who captained Brazil at the 1996 World Cup (and the "Vander" who scored at
 * 35' in the 2000 final, which en-wiki links to "Vander Iacovino") is at least partly another player, and both finals are already used
 * (manoel-tobias 1996, javi-rodriguez 2000) — so this film uses a match where the FIFA line-up has exactly one Vander and pt-wiki confirms
 * Vander Carioca's medal: the 2004 third-place match.
 * WHY THIS MOMENT: his iconic-plays entry is a signature (the pivot's lay-off), not one match. No written source we could reach describes
 * ONE dated lay-off of his (FIFA's archive lists goal times, not how they were made), so the film follows the brief's honest fallback: a
 * REAL, documented match with him in Brazil's team where NO play is staged, then "This is the move on his card" as a demonstration.
 *  1  LIVE (broadcast camera, main stand): FIFA Futsal World Championship Chinese Taipei 2004, third-place match, 5 Dec 2004, Brazil 7–4
 *     Argentina (HT 6–1), NTU Gymnasium, Taipei (3,500). Vander is Brazil's #14. FALLBACK RULE: NO goal or pass is staged — the chapter
 *     shows the teams set for a restart (ball on the centre spot, nobody touching it), him marked with a ring, the scoreboard (6–1 at
 *     half-time → 7–4 at the final whistle) while the camera is up, then Brazil celebrating bronze with him in the middle.
 *  2  THE MOVE ON HIS CARD (a demonstration, no match claimed; slow motion, low behind the play; teammate in a yellow training bib,
 *     neutral paper/navy defender and keeper): back to goal, the pass comes in, he holds off the defender, lays it back first time, and
 *     his teammate shoots.
 *  3  THE LESSON (entry `lesson`: "Smart passing lets you play for years; let the ball do the work"): side view — his pass races a
 *     dribbler across the court and arrives first; the dribbler is out of breath; "42" stamps (he played until he was 42).
 * Sources (written; ≤ 5 s apart, cached in scratchpad/films/src-cache/):
 *  - Wikipedia PT, "Vander Carioca" (raw, Sep 2026; ptwiki-vander-carioca.txt): full name, b. 22/6/1976 Rio, pivô, pé destro, 1.75 m,
 *    Brazil 1998–2004, Copa América 1998/1999 gold, World Cup 2000 silver + 2004 bronze, clubs incl. Playas de Castellón, Norilsk Nickel,
 *    Corinthians; retired 17 Dec 2018 aged 42 (ref: globoesporte "Aos 42 anos, pivô Vander Carioca anuncia aposentadoria").
 *  - FIFA.com match page, Third place Brazil – Argentina 7:4 (6:1), archived 19 Jul 2019 (fifa-2004-futsal-3rd-bra-arg.*):
 *    https://web.archive.org/web/20190719042910/https://www.fifa.com/tournaments/archive/futsalworldcup/chinesetaipei2004/matches/round=82510500/match=82510039/index.html
 *    — match 39, 05 Dec 2004, Taipei City / National Taiwan University (NTU), 14:00, 3,500; referee Pedro Galán (ESP); Brazil [2] FRANKLIN
 *    (GK), [10] FININHO (C), [12] FALCAO, [3] SCHUMACHER … [14] * VANDER (the only Vander; not a substitute "S"); coach Fernando Leite;
 *    Argentina [1] GUISANDE (GK), [5] Carlos SANCHEZ (C), [4] GIUSTOZZI; goals Falcão 1'01" 6'02" 12'04", Sánchez 9'03", Schumacher
 *    17'05", Euler 18'06", Índio 19'07" (6–1 at half-time), Sánchez 23'09", Giustozzi 29'10" 30'11", Schumacher 36'13" (7–4).
 *  - Wikipedia EN, "2004 FIFA Futsal World Championship" (raw; wiki-2004-futsal-wc.txt): third place Brazil 7–4 Argentina, 5 Dec 2004,
 *    14:00, NTU Gymnasium, 3,500, referee Pedro Galán; Brazil lost the semi-final to Spain on penalties; Spain beat Italy 2–1 in the final.
 * CONFIRMED: the match, date, venue, crowd, 6–1 at half-time, 7–4 final score, Brazil third (bronze), Vander #14 in Brazil's team, his
 *  position (pivot), right foot, career to age 42.
 * NOT SHOWN (unknown): whether or when he was on court, any play of his in this match (he did not score). INFERRED (not named in the
 *  narration): kits — Brazil yellow shirts / blue shorts / white socks, Argentina white-and-sky-blue stripes / navy shorts; the scoreboard's
 *  look (a rendering device); every position, the restart, where Brazil celebrate; his short dark hair. The lay-off in chapters 2–3 is a
 *  demonstration, not footage; the narration only calls it "the move on his card".
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the passes and the shot). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 * z → −Z; every kick is the RIGHT foot (rToe). The lay-off is authored here (`layOff`): a short cock of the right leg with the toes turned
 * out, the INSIDE of the foot meets the ball at LAY_CONTACT and pushes it across his body, a short follow-through.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Brazil shirts, lights, pass lines), red (the defender's push, the tired dribbler, brackets), blue (court, Brazil shorts,
 * Argentina stripes), navy (key line, run-off, stands). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it
 * on the FULL sheet (card window 1.45:1 → square). Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,dribble,runCycle,runCadence,stand,backpedal,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,clampPose,strike,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: third place, 2004',text:'Taipei, 2004, the Futsal World Cup, the match for third place. Pivot Vander Carioca wears number fourteen. At half-time, Brazil lead Argentina six to one. Final whistle: seven to four! Brazil win bronze.',tail:2.4,
  cues:['Taipei','third place','Pivot Vander','number fourteen','At half','six to one','Final whistle','seven to four','Brazil win bronze'],heads:{'third place':'Third place 2004','number fourteen':'#14','six to one':'Half-time 6–1','seven to four':'7–4','Brazil win bronze':'Bronze'}},
 {label:'The move on his card',text:'This is the move on his card: the lay-off. Watch it slowly. His back is to goal. The pass comes in. He holds off the defender. One touch sets it back. His teammate shoots. Goal!',tail:2.1,
  cues:['This is the move','the lay','Watch it slowly','His back','The pass comes','holds off','One touch','sets it back','His teammate','Goal'],heads:{'the lay':'The lay-off','holds off':'Hold them off','One touch':'One touch','Goal':''}},
 {label:'Let the ball work',text:'Let the ball do the work! A pass beats any runner, and saves your legs. Vander played until he was forty-two.',tail:2.6,
  cues:['Let the ball','do the work','A pass beats','any runner','saves your legs','Vander played','until he was'],heads:{'do the work':'Let the ball work','saves your legs':'Save your legs','until he was':'Played to 42'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/vander-carioca-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/vander-carioca-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/vander-carioca-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('vander-carioca: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('vander-carioca: no cue '+w);return c.at;};
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
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.8],[R,.36]];
const BUILD={height:1.75,bulk:1};
/** Vander Carioca: Brazil #14 (FIFA line-up) — yellow shirt, blue shorts, white socks (kit inferred), short dark hair (inferred), right foot (pt-wiki) */
const VANDER:AthleteStyle={shirt:Y,shorts:B,socks:'paper',boots:K,skin:SKIN,hair:K,line:K,trim:B,number:14,numberInk:B,hairStyle:'short',build:BUILD,seed:14};
const BRA=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,skin:[[Y,.8],[R,.28]],hair:K,line:K,trim:B,hairStyle:n%2?'short':'curly',build:{height:1.7+hash(n,3)*.12},seed:20+n});
/** Argentina: white-and-sky-blue stripes, navy shorts (inferred) */
const ARG=(n:number):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:[B,.5],shorts:K,socks:'paper',boots:K,skin:[[Y,.7],[R,.2]],hair:K,line:K,trim:B,hairStyle:n%3?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Guisande, Argentina #1 (GK) — a dark keeper kit (inferred) */
const ARG_K:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.7],[R,.18]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',number:1,numberInk:Y,hairStyle:'short',build:{height:1.8},seed:61};
/** the demonstration players: a teammate in a yellow training bib; neutral paper/navy defender and keeper (no team or match is claimed) */
const MATE:AthleteStyle={shirt:[Y,.55],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:K,hairStyle:'curly',build:BUILD,seed:31};
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'short',build:{height:1.82,bulk:1.06},seed:77};
const DEMO_K:AthleteStyle={shirt:[B,.55],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.2]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:79};
const DRIB:AthleteStyle={shirt:[R,.5],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.3]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.74},seed:88};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}

/** where the ball sits at a kick's contact: just past the right toe along the foot (library coords, place at the origin, facing yaw) */
function contactBall(pose:Pose,yaw:number):V3{const sk=solve(pose,BUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.1,BALL_R,toe[2]+d[2]/l*.1];}
/** the right toe of a pose placed at (X,Z,yaw), in our floor coords */
function rToeAt(pose:Pose,X:number,Z:number,yaw:number):[number,number,number]{return toMine(solve(pose,BUILD,placeAt(X,Z,yaw)).rToe);}
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

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Argentina's goal at X = −20 (inferred end) ----
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
 const nearZ=Math.max(-30,st.cz+.6);// clip the touchlines in front of the camera (a line through the camera plane smears across the frame)
 lines.addPath(polyPath(floorStrip(st,[[-10,nearZ],[-10,lineZ+(withGoal?0:10)]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,nearZ],[10,lineZ+(withGoal?0:10)]],.05),true));
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

const SEGS:Record<string,number[][]>={a:[[0,0],[1,0]],b:[[1,0],[1,1]],c:[[1,1],[1,2]],d:[[0,2],[1,2]],e:[[0,1],[0,2]],f:[[0,0],[0,1]],g:[[0,1],[1,1]]};
const DIGITS:Record<string,string>={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abfgcd','-':'g'};
function glyphs(str:string,x0:number,y0:number,gw:number,path:Path2D){const th=gw*.3;[...str].forEach((ch,ci)=>{const ox=x0+ci*gw*1.6;
 if(ch===':'){path.rect(ox+gw*.25,y0+gw*.45,th,th);path.rect(ox+gw*.25,y0+gw*1.3,th,th);return;}
 for(const sg of DIGITS[ch]??''){const[[a0,b0],[a1,b1]]=SEGS[sg],x=ox+Math.min(a0,a1)*gw-th/2,y=y0+Math.min(b0,b1)*gw-th/2,w=a0===a1?th:gw+th,h=b0===b1?th:gw+th;path.rect(x,y,w,h);}});}


// ================= chapter 1 — LIVE: Taipei 2004, third place; him marked as #14; the scoreboard 6–1 (half-time) → 7–4 (full time); bronze =================
// Fallback rule: no play of his in this match is documented (he did not score), so NO pass, shot or goal is staged. The broadcast camera
// shows only confirmed things: the teams on court with the ball on the centre spot (nobody touching it), him marked, the scoreboard
// while the camera is up (6–1 at half-time, then 7–4 at the final whistle), and Brazil celebrating third place with him among them.
const C1={tai:A(0,'Taipei'),third:A(0,'third'),piv:A(0,'Pivot'),num:A(0,'number'),half:A(0,'At half'),six:A(0,'six to'),fin:A(0,'Final'),sev:A(0,'seven'),win:A(0,'Brazil win'),end:AUTH[0].seconds};
/** the camera is up on the scoreboard from UP1 to DOWN0 (players are moved off-camera meanwhile); the board flips at the final whistle */
const UP0=C1.half-.3,UP1=C1.half+.7,T_FLIP=C1.fin+.25,DOWN0=C1.sev+.05,DOWN1=C1.sev+.85;
const SPOT:[number,number]=[0,10];
/** where Brazil celebrate (inferred) */
const CEL:[number,number]=[1.6,9.4];
/** Vander: just inside Brazil's half by the centre circle (inferred) → (off-camera) → arms up in the middle of the celebration */
const F0:[number,number]=[1.2,11.1];
const offCam=(T:number)=>sm(UP1,DOWN0,T,easeIO);
const liveF:Gen=T=>{const u=offCam(T),X=lerp(F0[0],CEL[0],u),Z=lerp(F0[1],CEL[1],u);
 let pose=blendPose(stand(),posed({lHipF:16,rHipF:10,lKnee:26,rKnee:22,lean:12,neckP:24,lShA:22,rShA:22,lElb:36,rElb:36}),.5+.5*Math.sin(T*2.1));
 pose=blendPose(pose,celebrate((T-DOWN0)*1.05,{kind:'arms'}),sm(DOWN0-.2,DOWN0,T));
 // "number fourteen": he turns his back to the camera (the number shows), then back to face the play
 const back=sm(C1.num-.3,C1.num+.2,T,easeIO)*(1-sm(UP0+.1,UP0+.5,T,easeIO));
 return{pose,yaw:u>0?lerp(FACE_LEFT,FACE_CAMERA+.25,sm(DOWN0-.4,DOWN0,T)):lerp(FACE_LEFT,FACE_AWAY-.08,back),X,Z};};
/** Brazil's other four (yellow) in their half, then round him */
const BRA_A:[number,number][]=[[3.6,6.4],[4.4,14.2],[8.2,10.2],[3.4,16.4]];
const BRA_C:[number,number][]=[[1.05,.55],[-1.1,.8],[.5,-1],[-.75,-.95]];
const liveBra=(i:number):Gen=>T=>{const g=offCam(T),X=lerp(BRA_A[i][0],CEL[0]+BRA_C[i][0],g),Z=lerp(BRA_A[i][1],CEL[1]+BRA_C[i][1],g);
 let pose=blendPose(stand(),posed({lHipF:14,rHipF:10,lKnee:24,rKnee:22,lean:12,neckP:20,lShA:20,rShA:20,lElb:36,rElb:36}),.5+.5*Math.sin(T*2+i));
 pose=blendPose(pose,i%2?celebrate((T-DOWN0)*1.1+i*.25,{kind:'arms'}):celebrate((T-DOWN0)*1.1+i*.3,{kind:'run'}),sm(DOWN0-.2,DOWN0,T));
 const hug=yawTo(-BRA_C[i][0],-BRA_C[i][1]);
 return{pose,yaw:g>0?lerp(FACE_LEFT,hug,sm(DOWN0-.4,DOWN0,T)):FACE_LEFT,X,Z};};
/** Argentina (stripes) in their half, set outside the circle; afterwards walking away, heads down, hands on hips */
const ARG_A:[number,number][]=[[-3.6,7.2],[-3.4,13.1],[-6.8,10.1],[-9.4,12.6]];
const ARG_C:[number,number][]=[[-8.4,5.4],[-9.8,13.6],[-11.6,9],[-13.4,11.8]];
const liveArg=(i:number):Gen=>T=>{const g=offCam(T),post=sm(DOWN0-.3,DOWN0,T);
 const X=lerp(ARG_A[i][0],ARG_C[i][0],g),Z=lerp(ARG_A[i][1],ARG_C[i][1],g);
 let pose=blendPose(backpedal(T*.5+i*.3),stand(),.6+.4*Math.sin(T*1.7+i));
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:24,rShA:24,lElb:100,rElb:100,lShF:-20,rShF:-20}),post);
 return{pose,yaw:lerp(FACE_RIGHT,FACE_LEFT+.5*(i%2?1:-1),post),X,Z};};
/** Guisande: set on his line (mostly off-frame in this wide shot) */
const liveK:Gen=T=>({pose:blendPose(keeperSet(T*1.3),posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:16,neckP:42,lShA:12,rShA:12,lElb:30,rElb:30}),sm(DOWN0-.3,DOWN0,T)),yaw:FACE_RIGHT,X:GOAL_X+.85,Z:10.05});
/** the centre-hung scoreboard (a rendering device; the arena's real board is not documented): over the halfway line, 8.4 m up (above the wide shot, even in a square card) */
const BOARD:V3=[0,8.4,10];
function scoreboard(s:Sheet,st:Stage,T:number){
 const c=proj(st,BOARD[0],BOARD[1],BOARD[2]),k=kAt(st,BOARD[2]),w=4.2*k,h=2.3*k,x=c[0]-w/2,y=c[1]-h/2,ft=T>=T_FLIP,flip=easeOutBack(sm(T_FLIP,T_FLIP+.3,T)),fl=pulse(T,T_FLIP,.9);
 const cables=new Path2D();for(const dx of[-.35,.35]){cables.addPath(ribbon([[c[0]+dx*w,y-6*k],[c[0]+dx*w,y]],Math.max(3,k*.04),{seed:520+dx*10,taper:0,wobble:.3}));}s.fill(K,cables,.8);
 const box=polyPath(handCut([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],501,4,40),true);s.knockout(box);s.fill(K,box,.95);
 // team chips: Brazil yellow left, Argentina paper/blue right
 const cy=rectPath(x+w*.06,y+h*.12,w*.14,h*.3),cr=rectPath(x+w*.8,y+h*.12,w*.14,h*.3);s.knockout(cy);s.knockout(cr);s.fill(Y,cy);s.fill(B,rectPath(x+w*.8,y+h*.12,w*.14,h*.1),.8);s.fill(B,rectPath(x+w*.8,y+h*.32,w*.14,h*.1),.8);
 const gw=h*.17,sc=new Path2D(),drop=ft?(1-flip)*gw*.8:0;
 glyphs(ft?'7':'6',x+w*.3,y+h*.1-drop,gw,sc);glyphs('-',x+w*.3+gw*1.6,y+h*.1,gw,sc);glyphs(ft?'4':'1',x+w*.3+gw*3.2,y+h*.1-drop,gw,sc);
 s.knockout(sc);s.fill(Y,sc,.95);
 // clock 0:00 (end of a half) and the period: 1 at half-time, 2 at full time
 const ck=new Path2D(),cw=h*.1;glyphs('0:00',c[0]-cw*3.1,y+h*.6,cw,ck);glyphs(ft?'2':'1',x+w*.86,y+h*.6,cw,ck);s.knockout(ck);s.fill(R,ck,.9);
 if(fl>.02)sparkBurst(s,Y,c[0],y+h*.28,w*.4,{n:12,seed:530,g:easeOut(sm(T_FLIP,T_FLIP+.3,T))*(1-sm(T_FLIP+.6,T_FLIP+1,T))});
}
const liveCam=(T:number)=>({x:key(T,mono([[0,1.5],[C1.piv-.2,1.2],[C1.num,F0[0]],[UP0-.3,F0[0]],[UP0,F0[0]*.5],[UP1,0],[DOWN0,0],[DOWN1,CEL[0]],[C1.end,CEL[0]]]),easeInOutSine),
 zoom:key(T,mono([[0,.6],[C1.piv,.7],[C1.num,1.55],[UP0-.3,1.5],[UP1,.8],[T_FLIP,.86],[DOWN0,.84],[DOWN1,.74],[C1.win,.76],[C1.end,.9]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.piv,1040],[C1.num,930],[UP0-.3,930],[UP0,900],[UP1,-270],[DOWN0,-290],[DOWN1,1030],[C1.end,1020]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const bronze=sm(C1.win,C1.win+.3,T);
 courtSide(s,st,T,{cheer:T>=T_FLIP?1-.3*sm(C1.end-1.5,C1.end,T):.15,flash:pulse(T,T_FLIP,1.2)+.8*pulse(T,C1.win,1.4),keeper:()=>{athlete(s,st,liveK,T,ARG_K,{detail:'low'});}});
 scoreboard(s,st,T);
 // "Pivot Vander Carioca": a yellow dashed ring under him
 const ring=easeOutBack(sm(C1.piv,C1.piv+.35,T))*(1-sm(UP0-.3,UP0,T));
 if(ring>.02){const f=liveF(T);floorDashRing(s,st,Y,f.X,f.Z,.6,11,121,ring);}
 type It={z:number;draw:()=>void};const items:It[]=[];
 ARG_A.forEach((_,i)=>{const g=liveArg(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ARG(i),{detail:'low'})});});
 BRA_A.forEach((_,i)=>{const g=liveBra(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,BRA(i),{detail:'low'})});});
 items.push({z:liveF(T).Z-.01,draw:()=>athlete(s,st,liveF,T,VANDER,{detail:T>C1.piv&&T<UP1?"high":"auto"})});
 // the ball waits on the centre spot (hidden once the camera is up on the scoreboard)
 if(T<UP1){const p=proj(st,SPOT[0],BALL_R,SPOT[1]),r=Math.max(9,kAt(st,SPOT[1])*BALL_R);items.push({z:SPOT[1]-.3,draw:()=>{shadow(s,p[0],p[1]+r*.9,r*1.1,r*.3,16,.45);ball(s,p[0],p[1],r,18);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "Brazil win bronze": red, yellow and paper confetti (bronze) over the celebration
 if(bronze>0){const f=liveF(T),g=proj(st,f.X,0,f.Z),u=sm(C1.win,C1.win+3,T,linear);confetti(s,[R,Y,'paper'],[g[0]-1100,g[1]-900+u*500,2200,520],28,Math.floor(T*6),{size:16});}
}
/** a figure's chest ring on stage st (the passage enters his yellow shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveF(tt),.12));},still:T_FLIP+.4};

// ================= chapter 2 — THE MOVE ON HIS CARD (demonstration, slow motion, low behind the play): back to goal, hold off, lay it back =================
const C2={move:A(1,'This is'),lay:A(1,'the lay'),watch:A(1,'Watch'),back:A(1,'His back'),pass:A(1,'The pass'),holds:A(1,'holds'),one:A(1,'One touch'),sets:A(1,'sets'),mate:A(1,'His team'),goal:A(1,'Goal'),end:AUTH[1].seconds};
/** the replay camera: low, behind his teammate on the right, looking up the court at the goal (he is centre-left, the goal behind him) */
const st2:Stage={F:1500,eye:1.9,cx:2.2,cz:-2.5};
/** THE LAY-OFF (right foot, inside): a short cock with the toes turned out → the inside of the foot meets the ball at LAY_CONTACT and
 * pushes it across his body (to his left) → a short follow-through → set. He stays low and wide, arms out to keep the defender off. */
const LAY_CONTACT=.5;
const LAY_KEYS:[number,Pose][]=[
 [0,posed({lHipF:26,rHipF:20,lKnee:48,rKnee:44,lHipA:18,rHipA:14,lean:22,pitch:5,lShA:66,rShA:60,lShF:-24,rShF:-20,lElb:34,rElb:34,neckP:38})],
 [.32,posed({lHipF:24,lKnee:50,lHipA:16,rHipF:-4,rKnee:58,rAnk:6,rHipA:20,rHipR:38,lean:20,pitch:4,lShA:70,rShA:52,lShF:-26,rShF:-10,lElb:30,rElb:40,neckP:42,twist:-6})],
 [LAY_CONTACT,posed({lHipF:22,lKnee:46,lHipA:14,rHipF:22,rKnee:18,rAnk:-8,rHipA:-12,rHipR:44,lean:20,pitch:5,lShA:72,rShA:48,lShF:-26,rShF:4,lElb:30,rElb:44,neckP:44,twist:8})],
 [.75,posed({lHipF:22,lKnee:44,lHipA:14,rHipF:26,rKnee:22,rAnk:-4,rHipA:-18,rHipR:40,lean:18,pitch:4,lShA:64,rShA:44,lShF:-20,rShF:8,lElb:34,rElb:46,neckP:36,twist:10})],
 [1,posed({lHipF:22,rHipF:16,lKnee:40,rKnee:34,lHipA:14,rHipA:10,lean:16,pitch:4,lShA:50,rShA:44,lElb:40,rElb:40,neckP:24})],
];
function layOff(t:number):Pose{return clampPose(keyPoses(t,LAY_KEYS));}
/** the INSIDE of the right foot: the ball sits beside the arch, on the left of the right foot (library coords) */
function insideBall(pose:Pose,yaw:number):V3{const sk=solve(pose,BUILD,{yaw}),toe=sk.rToe,an=sk.rAn,m:V3=[(toe[0]+an[0])/2,0,(toe[2]+an[2])/2],d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1,nx=-d[1]/l,nz=d[0]/l;
 const lf=sk.lAn,side=(lf[0]-m[0])*nx+(lf[2]-m[2])*nz>0?1:-1;return[m[0]+nx*side*(BALL_R+.05),BALL_R,m[2]+nz*side*(BALL_R+.05)];}
const VP:[number,number]=[.35,5.6],DP:[number,number]=[.8,6.25];
const LB=toMine(insideBall(layOff(LAY_CONTACT),FACE_CAMERA)),RB:[number,number]=[VP[0]+LB[0],VP[1]+LB[2]];
/** the lay-off goes back to the spot where his teammate shoots first time at the far post */
const LS:[number,number]=[2.2,3.6],TG2:V3=[-1.05,.3,GZ+.02];
const YAW_S=yawTo(TG2[0]-LS[0],TG2[2]-LS[1]),SB=toMine(contactBall(strike(STRIKE_CONTACT),YAW_S)),TPL:[number,number]=[LS[0]-SB[0],LS[1]-SB[2]];
/** the teammate's pass into his feet from the right */
const B0:[number,number]=[3.9,2],YAW_P=yawTo(RB[0]-B0[0],RB[1]-B0[1]),PB=toMine(contactBall(strike(STRIKE_CONTACT,{power:.35}),YAW_P)),TP0:[number,number]=[B0[0]-PB[0],B0[1]-PB[2]];
/** slow motion: the pass on "The pass comes", arriving as he "holds off"; the lay-off on "One touch"; the shot on "His teammate" */
const T_PASS=C2.pass+.3,T_RCV=Math.max(T_PASS+1.1,C2.holds-.1),T_LAY=C2.one+.3,T_SHOT=Math.max(T_LAY+1,C2.mate+.45),T_IN2=Math.max(T_SHOT+1,C2.goal-.05);
function demoBall(t:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 const at=(a:[number,number],b:[number,number],u:number,sp:number)=>({X:lerp(a[0],b[0],u),Y:BALL_R,Z:lerp(a[1],b[1],u),flying:false,spin:sp});
 if(t<T_PASS)return at(B0,B0,0,0);
 if(t<T_RCV){const u=sm(T_PASS,T_RCV,t,easeOut);return at(B0,RB,u,u*8);}
 if(t<T_LAY)return at(RB,RB,0,8);
 if(t<T_SHOT){const u=sm(T_LAY,T_SHOT,t,easeOut);return at(RB,LS,u,8+u*7);}
 if(t<T_IN2){const u=sm(T_SHOT,T_IN2,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(LS[0],TG2[0],.5),.55,lerp(LS[1],TG2[2],.5)];
  return{X:a*LS[0]+b*M[0]+c*TG2[0],Y:a*BALL_R+b*M[1]+c*TG2[1],Z:a*LS[1]+b*M[2]+c*TG2[2],flying:true,spin:15+u*20};}
 const d=sm(T_IN2+.1,T_IN2+.7,t,easeIn);return{X:TG2[0],Y:lerp(TG2[1],BALL_R,d),Z:GZ+.6,flying:false,spin:35};
}
/** Vander: back to goal (facing the camera), low and wide; shields as the pass arrives; the lay-off; rolls off to face the goal; arms up */
const SHIELD=(t:number)=>posed({lHipF:26,rHipF:20,lKnee:48+4*Math.sin(t*5),rKnee:44,lHipA:18,rHipA:14,lean:22,pitch:5,bend:5*Math.sin(t*2.6),lShA:66,rShA:60,lShF:-24,rShF:-20,lElb:34,rElb:34,neckP:38});
const READY=posed({lHipF:18,rHipF:14,lKnee:30,rKnee:28,lHipA:8,rHipA:8,lean:14,pitch:3,lShA:30,rShA:30,lShF:-6,rShF:-6,lElb:40,rElb:40,neckP:26});
const demoV:Gen=t=>{
 let pose=blendPose(READY,SHIELD(t),sm(T_RCV-.9,T_RCV-.2,t,easeIO));
 pose=blendPose(pose,layOff(key(t,[[T_LAY-.4,0],[T_LAY,LAY_CONTACT],[T_LAY+.6,1]],linear)),sm(T_LAY-.45,T_LAY-.3,t));
 const roll=sm(T_LAY+.6,T_SHOT+.2,t,easeIO);
 if(roll>0)pose=blendPose(pose,runCycle((t-T_LAY)*runCadence(.2)*.5,{speed:.2}),roll*(1-sm(C2.goal-.2,C2.goal+.2,t)));
 const cel=sm(C2.goal-.1,C2.goal+.5,t,easeIO);if(cel>0)pose=blendPose(pose,celebrate((t-C2.goal)*1.1,{kind:'arms'}),cel);
 return{pose,yaw:lerp(FACE_CAMERA,FACE_AWAY+.5,roll),X:VP[0]-.35*roll,Z:VP[1]+.25*roll};};
/** the defender: tight behind him, pushing into his back; after the lay-off he turns to chase the ball, too late */
const PUSH=(t:number)=>posed({lHipF:34,rHipF:-4,lKnee:46,rKnee:30,lHipA:8,rHipA:8,lean:26,pitch:6,lShF:64+6*Math.sin(t*5),rShF:60,lShA:20,rShA:22,lElb:42,rElb:46,neckP:22});
const demoD:Gen=t=>{const turn=sm(T_LAY+.15,T_LAY+.9,t,easeIO);
 let pose=blendPose(blendPose(backpedal(t*.6),stand(),.4),PUSH(t),sm(T_PASS,T_RCV-.2,t,easeIO));
 pose=blendPose(pose,runCycle((t-T_LAY)*runCadence(.3)*.5,{speed:.3}),turn);
 return{pose,yaw:lerp(FACE_CAMERA,yawTo(LS[0]-DP[0],LS[1]-DP[1]),turn),X:DP[0]+.2*sm(T_LAY+.3,T_SHOT+.3,t,easeIO),Z:DP[1]-.35*sm(T_LAY+.3,T_SHOT+.3,t,easeIO)};};
/** his teammate: passes in from the right, jogs up to the lay-off spot, and strikes it first time (right foot) */
const demoT:Gen=t=>{
 const run=sm(T_PASS+.5,T_SHOT-.55,t,easeIO),X=lerp(TP0[0],TPL[0],run),Z=lerp(TP0[1],TPL[1],run);
 let pose=blendPose(stand(),posed({lHipF:16,rHipF:10,lKnee:26,rKnee:22,lean:12,neckP:30,lShA:22,rShA:22,lElb:36,rElb:36}),.5+.5*Math.sin(t*2.3));
 pose=blendPose(pose,strike(key(t,[[T_PASS-.6,.2],[T_PASS,STRIKE_CONTACT],[T_PASS+.5,.86]],linear),{power:.35}),sm(T_PASS-.65,T_PASS-.5,t)*(1-sm(T_PASS+.4,T_PASS+.6,t)));
 if(t>T_PASS+.45&&t<T_SHOT-.55)pose=blendPose(pose,runCycle((t-T_PASS)*runCadence(.35)*.5,{speed:.35}),sm(T_PASS+.45,T_PASS+.7,t)*(1-sm(T_SHOT-.75,T_SHOT-.55,t)));
 pose=blendPose(pose,strike(key(t,[[T_SHOT-.55,.22],[T_SHOT,STRIKE_CONTACT],[T_SHOT+.7,.95]],linear)),sm(T_SHOT-.62,T_SHOT-.5,t));
 const cel=sm(C2.goal,C2.goal+.6,t,easeIO);if(cel>0)pose=blendPose(pose,celebrate((t-C2.goal)*1.1+.3,{kind:'run'}),cel);
 const yRun=yawTo(TPL[0]-TP0[0],TPL[1]-TP0[1]);
 return{pose,yaw:t<T_PASS+.45?YAW_P:t<T_SHOT-.55?lerp(YAW_P,yRun,sm(T_PASS+.45,T_PASS+.8,t)):lerp(yRun,YAW_S,sm(T_SHOT-.55,T_SHOT-.35,t)),X,Z};};
/** the keeper: set, sliding across to the ball side as the lay-off goes back; dives late to his right (screen-left) */
const KP0:[number,number]=[.1,GZ-.85];
const demoK:Gen=t=>{const sh=sm(T_LAY,T_SHOT,t,easeIO),du=key(t,[[T_SHOT+.3,0],[T_IN2+.1,.5],[T_IN2+1.2,.92]],linear);
 const pose=blendPose(keeperSet(t*.6),keeperDive(du,{side:'r',height:.15}),sm(T_SHOT+.25,T_SHOT+.4,t));
 return{pose,yaw:FACE_CAMERA,X:KP0[0]+.45*sh,Z:KP0[1]};};
/** a yellow floor arc behind him (between him and the defender): "holds off" — his body is the shield */
function shieldArc(s:Sheet,st:Stage,X:number,Z:number,g:number){if(g<=.02)return;const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=Math.PI*(.12+.76*k/14);pts.push([X+Math.cos(a)*.62*g,Z+Math.sin(a)*.5]);}
 const p=polyPath(floorStrip(st,pts,.07),true);s.knockout(p);s.fill(Y,p);}
/** camera aims (world points on st2) + zoom per cue */
const CAM2:[number,number,number,number,number][]=[[0,2.6,.6,3.2,.95],[C2.lay,.4,1,5.6,1.5],[C2.watch,2.6,.6,3.2,.95],[C2.back,.35,1,6.4,1.3],[C2.pass,2.4,.6,3.4,1.0],[C2.holds,.4,1,5.8,1.55],[C2.one,1.6,.7,4.4,1.15],[C2.mate,2,.7,4.2,1.05],[C2.goal,-.2,.9,9.5,1.35],[C2.end,.6,.9,8,1.1]];
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,hit=pulse(t,T_SHOT,.4),net=pulse(t,T_IN2,.6);
  camPath(s,t,CAM2.map(([tk,X,Yh,Z,zm])=>{const p=proj(st,X,Yh,Z);return[tk,p[0],p[1],zm] as Key;}),[5*hit*Math.sin(t*90),3*hit*Math.cos(t*77)+4*net*Math.sin(t*60)]);
  const b=demoBall(tt),goal=tt>=T_IN2;
  arena(s,st,{t:tt,cheer:goal?1-.3*sm(C2.end-1,C2.end,tt):0,flash:pulse(tt,T_IN2,1.2),bulge:.5*sm(T_IN2-.2,T_IN2,tt)*(1-.6*sm(T_IN2+.4,T_IN2+1.4,tt))+.1*settle(tt,T_IN2,{amp:1,freq:3,decay:3}),bx:TG2[0],by:TG2[1],
   keeper:stg=>{athlete(s,stg,demoK,tt,DEMO_K,{detail:'mid'});}});
  const v=demoV(tt),d=demoD(tt),m=demoT(tt);
  // "the lay-off": a yellow dashed ring under him
  const ringG=easeOutBack(sm(C2.lay,C2.lay+.35,tt))*(1-sm(C2.watch,C2.watch+.4,tt));
  if(ringG>.02)floorDashRing(s,st,Y,v.X,v.Z,.6,10,221,ringG);
  // "His back is to goal": a dashed arrow from his back to the goal (the way he is NOT facing)
  const bk=sm(C2.back,C2.back+.6,tt,easeOut)*(1-sm(C2.pass+.3,C2.pass+.8,tt));
  if(bk>.02){const pts=[proj(st,VP[0],0,VP[1]+1.2),proj(st,VP[0]-.1,0,VP[1]+3),proj(st,0,0,GZ-1.2)];dashed(s,Y,pts,11,222,{dash:32,progress:bk});if(bk>.9)arrowHead(s,Y,pts,30,223);}
  // "The pass comes in": the ball's dashed path into his feet
  if(tt>=T_PASS&&tt<T_LAY+.3){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=demoBall(lerp(T_PASS,Math.min(tt,T_RCV),k/10));pts.push(proj(st,q.X,0,q.Z));}const fade=1-sm(T_LAY-.2,T_LAY+.3,tt);if(fade>.05){dashed(s,Y,pts,11,224,{dash:30,cov:fade});if(tt>T_RCV-.2)arrowHead(s,Y,pts,30,225,fade);}}
  const hold=sm(C2.holds-.1,C2.holds+.4,tt,easeOut)*(1-sm(T_LAY,T_LAY+.4,tt));
  // the players and the ball by depth (the shield arc sits on the floor between him and the defender)
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.1,r*.3,228,b.flying?.3:.45);
   const moving=(tt>T_PASS&&tt<T_RCV)||(tt>T_LAY&&tt<T_SHOT)||b.flying,prevB=demoBall(tt-.12),pp=proj(st,prevB.X,prevB.Y,prevB.Z),dir=Math.atan2(pp[1]-p[1],pp[0]-p[0]);
   if(b.flying&&tt<T_IN2-.1)speedLines(s,Y,p[0],p[1],dir,{n:4,seed:229,len:r*3,spread:r*1.3,width:5});
   ball(s,p[0],p[1],r,230,{rot:b.spin,smear:moving?.3:0,dir:dir+Math.PI});
   if(tt>=T_LAY&&tt<T_LAY+.5)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:231,g:easeOut(sm(T_LAY,T_LAY+.3,tt))*(1-sm(T_LAY+.3,T_LAY+.5,tt))});
   if(tt>=T_SHOT&&tt<T_SHOT+.5)sparkBurst(s,Y,p[0],p[1],r*2.8,{n:10,seed:232,g:easeOut(sm(T_SHOT,T_SHOT+.3,tt))*(1-sm(T_SHOT+.3,T_SHOT+.5,tt))});};
  const its:{z:number;draw:()=>void}[]=[
   {z:d.Z,draw:()=>athlete(s,st,demoD,tt,DEMO_D,{detail:'high',smear:tt>T_LAY+.2&&tt<T_LAY+.8?.2:0})},
   {z:v.Z+.3,draw:()=>shieldArc(s,st,v.X,v.Z,hold)},
   {z:v.Z,draw:()=>athlete(s,st,demoV,tt,VANDER,{detail:'high',smear:tt>T_LAY-.2&&tt<T_LAY+.3?.2:0})},
   {z:m.Z,draw:()=>athlete(s,st,demoT,tt,MATE,{detail:'high',smear:(tt>T_PASS-.2&&tt<T_PASS+.3)||(tt>T_SHOT-.3&&tt<T_SHOT+.3)?.22:0})},
   {z:!b.flying&&tt>=T_PASS&&tt<T_SHOT&&Math.abs(b.Z-v.Z)<.6?v.Z-.02:b.Z,draw:drawBall},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "holds off the defender": the push (red arrow into his back) and his shield (yellow arc)
  if(hold>.02){const a=proj(st,DP[0]+.45,1.35,DP[1]+.25),c=proj(st,VP[0]+.15,1.2,VP[1]+.1),pts=partial([a,L2(a,c,.5),c],hold),rp=ribbon(pts,12,{seed:226,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(hold>.6)arrowHead(s,R,pts,28,227);}
  // "One touch sets it back": the lay-off's dashed path, then "His teammate shoots": the flight line to the far post
  if(tt>=T_LAY&&tt<T_IN2+.6){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=demoBall(lerp(T_LAY,Math.min(tt,T_SHOT),k/10));pts.push(proj(st,q.X,0,q.Z));}const fade=1-sm(T_IN2,T_IN2+.6,tt);if(fade>.05){dashed(s,Y,pts,11,233,{dash:30,cov:fade});if(tt>T_SHOT-.2)arrowHead(s,Y,pts,30,234,fade);}}
  if(tt>T_SHOT){const pts:Pt[]=[];for(let k=0;k<=16;k++){const q=demoBall(lerp(T_SHOT,Math.min(tt,T_IN2),k/16));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,10,235,{dash:36});}
  // "His teammate": a yellow ring under the shooter as the ball arrives
  const mg=easeOutBack(sm(C2.mate-.1,C2.mate+.25,tt))*(1-sm(T_SHOT+.3,T_SHOT+.7,tt));
  if(mg>.02)floorDashRing(s,st,Y,LS[0],LS[1],.5,9,236,mg);
  if(tt>=T_IN2&&tt<T_IN2+1.2){const p=proj(st,TG2[0],TG2[1]+.3,GZ+.4);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:237,g:easeOut(sm(T_IN2,T_IN2+.3,tt))*(1-sm(T_IN2+.8,T_IN2+1.2,tt))});}
 },
 aperture(t0){const{tt}=clock(1,t0),st=st2,b=demoBall(tt),p=proj(st,b.X,b.Y,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R)*1.1,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return aperture(q);},
 still:T_LAY+.15,
};

// ================= chapter 3 — LET THE BALL DO THE WORK: side view; his pass races a dribbler across the court; the dribbler tires; "42" =================
const C3={let:A(2,'Let the'),work:A(2,'do the'),pass:A(2,'A pass'),runner:A(2,'any runner'),legs:A(2,'saves'),played:A(2,'Vander played'),until:A(2,'until'),end:AUTH[2].seconds};
const st3:Stage={F:2000,eye:2.6,cx:0,cz:-6};
/** the pass lane (near) and the dribbler's lane (far), both left → right */
const PB1:[number,number]=[-3.5,5],PB2:[number,number]=[3.5,5],DR0:[number,number]=[-3.7,7.3];
const YAW3=FACE_RIGHT,SB3=toMine(contactBall(strike(STRIKE_CONTACT,{power:.55}),YAW3)),PL3:[number,number]=[PB1[0]-SB3[0],PB1[1]-SB3[2]];
const T_P3=C3.pass+.15,T_ARR3=T_P3+.62,T_GO=T_P3-.35,T_STOP=C3.legs+.25;
/** the dribbler's X: jogs with the ball at ~1.6 m/s, slows and stops, out of breath, about halfway */
const drX=(t:number)=>{const run=(tt:number)=>DR0[0]+1.6*Math.max(0,tt-T_GO);if(t<=T_STOP-.5)return run(t);const a=run(T_STOP-.5),v=1.6;const u=Math.min(t,T_STOP+.3)-(T_STOP-.5);return a+v*u-v/(2*.8)*u*u;};
function passBall(t:number):{X:number;Y:number;Z:number;flying:boolean}{
 if(t<T_P3)return{X:PB1[0],Y:BALL_R,Z:PB1[1],flying:false};
 if(t<T_ARR3){const u=sm(T_P3,T_ARR3,t,linear);return{X:lerp(PB1[0],PB2[0],u),Y:BALL_R,Z:PB1[1],flying:true};}
 return{X:PB2[0],Y:BALL_R,Z:PB2[1],flying:false};}
const tryV:Gen=t=>{let pose=blendPose(stand(),posed({lHipF:16,rHipF:10,lKnee:26,rKnee:22,lean:12,neckP:30,lShA:22,rShA:22,lElb:36,rElb:36}),.5+.5*Math.sin(t*2.4));
 pose=blendPose(pose,strike(key(t,[[T_P3-.55,.2],[T_P3,STRIKE_CONTACT],[T_P3+.6,.92]],linear),{power:.55}),sm(T_P3-.6,T_P3-.45,t)*(1-sm(T_P3+.7,T_P3+1.1,t)));
 const cel=sm(C3.played,C3.played+.5,t,easeIO);if(cel>0)pose=blendPose(pose,celebrate((t-C3.played)*1.1,{kind:'arms'}),cel);
 return{pose,yaw:lerp(YAW3,FACE_CAMERA+.4,cel),X:PL3[0],Z:PL3[1]};};
/** his teammate at the far end of the pass: set, then the ball arrives at his foot */
const tryM:Gen=t=>{const trap=pulse(t,T_ARR3-.1,.8);
 const pose=blendPose(blendPose(stand(),posed({lHipF:16,rHipF:10,lKnee:26,rKnee:22,lean:12,neckP:30,lShA:22,rShA:22,lElb:36,rElb:36}),.5+.5*Math.sin(t*2.2+1)),posed({lHipF:14,lKnee:30,rHipF:30,rKnee:20,rAnk:-14,rHipR:30,lean:14,neckP:40,lShA:40,rShA:30,lElb:30,rElb:40}),trap);
 return{pose,yaw:FACE_LEFT,X:PB2[0]+.45,Z:PB2[1]+.18};};
/** the dribbler: jogs with the ball, then stops, hands on his knees */
const tryD:Gen=t=>{const tired=sm(T_STOP-.2,T_STOP+.4,t,easeIO),heave=Math.sin(t*6)*.5+.5;
 let pose=t<T_GO?blendPose(stand(),dribble(.1,{foot:'r',speed:.4}),.3):dribble((t-T_GO)*runCadence(.4)*.95,{foot:'r',speed:.4});
 pose=blendPose(pose,posed({lHipF:44,rHipF:40,lKnee:46+4*heave,rKnee:42+4*heave,lHipA:10,rHipA:10,lean:48+5*heave,pitch:10,lShF:52,rShF:52,lShA:14,rShA:14,lElb:16,rElb:16,neckP:-14}),tired);
 return{pose,yaw:FACE_RIGHT,X:drX(t),Z:DR0[1]};};
const drBallX=(t:number)=>Math.min(drX(t)+.55,drX(T_STOP+.3)+.9);
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  const aim=(X:number,Yh:number,Z:number)=>proj(st,X,Yh,Z);
  camPath(s,t,[[0,...aim(-3.6,1,5.8),1.5],[C3.let+.6,...aim(-3.4,1,5.8),1.45],[C3.work+.3,...aim(0,1,6),1.0],[C3.runner+.3,...aim(0,1,6),1.0],[C3.legs+.2,...aim(-.3,1,7.3),1.45],[C3.played,...aim(-3,1.2,5.6),1.3],[C3.until,...aim(-2.4,1.8,6.2),1.12],[C3.end,...aim(-2.4,1.8,6.2),1.18]] as Key[]);
  courtSide(s,st,tt,{cheer:tt>=C3.until?.8:.1,flash:pulse(tt,C3.until+.2,1.2)});
  const b=passBall(tt);
  // "do the work": a dashed yellow preview of the pass (drawn left → right), then the ball follows it
  const pre=sm(C3.work,C3.work+.8,tt,easeOut)*(1-sm(T_ARR3,T_ARR3+.4,tt));
  if(pre>.02){const pts=[aim(PB1[0]+.4,0,PB1[1]),aim(0,0,PB1[1]),aim(PB2[0]-.4,0,PB2[1])];dashed(s,Y,pts,13,321,{dash:34,progress:pre});if(pre>.95)arrowHead(s,Y,pts,32,322);}
  // "any runner": the dribbler's progress, a red dashed line with an arrow — only halfway
  if(tt>T_GO+.3){const x1=drX(tt),pts=[aim(DR0[0]+.3,0,DR0[1]+.35),aim((DR0[0]+x1)/2,0,DR0[1]+.35),aim(x1-.2,0,DR0[1]+.35)],fade=1-sm(C3.played,C3.played+.6,tt);if(fade>.05&&x1-DR0[0]>1){dashed(s,R,pts,11,323,{dash:30,cov:fade});arrowHead(s,R,pts,26,324,fade);}}
  // the players and balls by depth
  const v=tryV(tt),m=tryM(tt),d=tryD(tt);
  const drawPass=()=>{const p=aim(b.X,b.Y,b.Z),g=aim(b.X,0,b.Z),r=kAt(st,b.Z)*BALL_R;shadow(s,g[0],g[1],r*1.1,r*.3,325,.45);
   if(b.flying){const tr:Pt[]=[];for(let k=0;k<=6;k++){const q=passBall(Math.max(T_P3,tt-.18+k*.03));tr.push(aim(q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.3,{seed:326,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);speedLines(s,Y,p[0],p[1],Math.PI,{n:4,seed:327,len:r*3,spread:r*1.2,width:5});}
   ball(s,p[0],p[1],r,328,{rot:tt*6,smear:b.flying?.4:0,dir:0});
   if(tt>=T_P3&&tt<T_P3+.35)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:9,seed:329,g:easeOut(sm(T_P3,T_P3+.2,tt))*(1-sm(T_P3+.2,T_P3+.35,tt))});};
  const drawDrib=()=>{const X=drBallX(tt),p=aim(X,BALL_R,DR0[1]-.1),g=aim(X,0,DR0[1]-.1),r=kAt(st,DR0[1])*BALL_R;shadow(s,g[0],g[1],r*1.1,r*.3,330,.45);ball(s,p[0],p[1],r,331,{rot:tt*3});};
  const its:{z:number;draw:()=>void}[]=[
   {z:d.Z,draw:()=>athlete(s,st,tryD,tt,DRIB,{detail:'mid'})},{z:DR0[1]-.12,draw:drawDrib},
   {z:v.Z,draw:()=>athlete(s,st,tryV,tt,VANDER,{detail:'high',smear:tt>T_P3-.2&&tt<T_P3+.2?.14:0})},
   {z:m.Z,draw:()=>athlete(s,st,tryM,tt,MATE,{detail:'mid'})},
   {z:b.Z-.05,draw:drawPass},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "any runner": the pass is already there — a tick stamps over his teammate
  const tick=easeOutBack(sm(T_ARR3,T_ARR3+.35,tt))*(1-sm(C3.played,C3.played+.4,tt));
  if(tick>.02){const c=aim(PB2[0]+.4,2.35,PB2[1]),S=90*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:332,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:333,taper:.1,wobble:1}));s.fill(Y,tp);}
  // "saves your legs": red drops of sweat over the tired dribbler
  const sw=sm(C3.legs,C3.legs+.3,tt)*(1-sm(C3.played+.2,C3.played+.6,tt));
  if(sw>.02){const hp=aim(drX(tt)+.2,1.95,DR0[1]),drops=new Path2D(),kk=kAt(st,DR0[1]);for(let i=0;i<3;i++){const ph=((tt*1.3+i/3)%1),x=hp[0]+(i-1)*.28*kk,y=hp[1]-.1*kk+ph*.5*kk;drops.addPath(polyPath(blob(x,y,.05*kk,.08*kk,340+i,{amp:.05,n:12}),true));}s.knockout(drops);s.fill(R,drops,sw);}
  // "until he was forty-two": a 42 stamps on a navy board over the court
  const st42=easeOutBack(sm(C3.until+.1,C3.until+.5,tt));
  if(st42>.02){const c=aim(-1.6,3,7),kk=kAt(st,7),w=2.2*kk*st42,h=1.5*kk*st42,box=polyPath(handCut([[c[0]-w/2,c[1]-h/2],[c[0]+w/2,c[1]-h/2],[c[0]+w/2,c[1]+h/2],[c[0]-w/2,c[1]+h/2]],351,4,30),true);
   s.knockout(box);s.fill(K,box,.95);const gw=h*.36,g=new Path2D();glyphs('42',c[0]-gw*1.3,c[1]-gw,gw,g);s.knockout(g);s.fill(Y,g);
   if(st42<1.2)sparkBurst(s,Y,c[0],c[1],w*.9,{n:12,seed:352,g:easeOut(sm(C3.until+.1,C3.until+.4,tt))*(1-sm(C3.until+.5,C3.until+.9,tt))});}
 },
 still:C3.until+.8,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'vander-carioca-futsal-signature',format:'futsal',title:'Vander Carioca’s lay-off',theme:'Back to goal, hold off the defender, and lay it back first time: let the ball do the work.',
 ageNote:'For players aged 7–12: the 2004 World Cup third-place match, the score and his number are real; the lay-off is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball drops, a navy boot taps it on (a lay-off), a yellow streak and rings pop out; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const fall=sm(0,.25,age,easeIn),by=y-150*(1-fall),u=clamp((age-.3)/.45),kick=sm(.3,.55,age,easeOut),bx=x+60*kick;
  if(age>.3&&u<1){s.fill(Y,ribbon(blob(x,y+r*.9,r*(1+2*u),r*(.3+.6*u),seed,{n:24}),8*(1-u)+2,{seed,close:true,wobble:1.2}),1);s.fill(B,ribbon(blob(x,y+r*.9,r*(.6+1.3*u),r*(.2+.4*u),seed+1,{n:24}),6*(1-u)+2,{seed:seed+1,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(bx,y+r*.95,r*(.7+.3*fall),r*.2,seed+2,{n:16}),true),.32);
  if(kick>.05&&kick<.95)speedLines(s,Y,bx-r,by,Math.PI,{n:3,seed:seed+4,len:r*1.4,spread:r*.8,width:5});
  ball(s,bx,by,r,seed,{rot:age*4});
  const jab=sm(.2,.3,age)*(1-sm(.4,.65,age));if(jab>.02){const tip:Pt=[x-r-4+10*jab,by+r*.2],boot=polyPath([[tip[0],tip[1]],[tip[0]-r*1.3,tip[1]-r*.45],[tip[0]-r*1.5,tip[1]+r*.25],[tip[0]-r*.2,tip[1]+r*.3]],true);s.fill(K,boot,.9*jab);}
 },
};
export default film;
