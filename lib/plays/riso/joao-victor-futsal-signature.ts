/** João Victor — "the power shot from the back": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: João Victor Alves Sena (born 12 Jul 2000, São Paulo), better known in Brazil as NEGUINHO: Brazil's fixo (the last outfield
 *  defender), Corinthians 2019–21, Palma Futsal (Spain) 2021–25 (UEFA Futsal Champions League 2023–24 and 2024–25), Barcelona 2025–;
 *  FIFA Futsal World Cup winner 2024 and Copa América 2024 with Brazil. Card bio (lib/town/playerBios.json): "Brazilian fixo … won the
 *  2024 Futsal World Cup with Brazil, known for his powerful shot". Not to be confused with the older Neguinho (futsal player, born 1992),
 *  or with any football namesake. The card photo (lib/town/playerPhotos.json) is the same person's Wikipedia portrait.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the power shot from the back (centre, long) — not one match. No
 *  written source we could reach describes HOW any single goal of his was scored (Wikipedia's match boxes give scorer + minute only; the
 *  search engines served bot challenges), so the film follows the brief's honest FALLBACK. The real-match chapter is the biggest match in
 *  which he scored twice: the 2024 FIFA Futsal World Cup ROUND OF 16, Brazil 5–0 Costa Rica, 24 Sep 2024, Bukhara Universal Sports
 *  Complex, Bukhara (Uzbekistan), attendance 1,471 — Neguinho scored the 4th (35'09") and 5th (39'34") goals. It shows ONLY confirmed
 *  things: the arena, the two teams, him as Brazil's fixo, the celebrations with the board at 4–0 and 5–0. No goal, pass, shot or tackle of
 *  that match is staged (the goals happen off camera, in the whip-pan cuts). The shot itself lives in two clearly labelled demonstration
 *  chapters ("This is how he does it"; a yellow training top, neutral paper/navy defenders and keeper; no match claimed).
 *  (Match choice: no other futsal film uses the 2024 World Cup's knockout rounds; Nazari's film is also in Uzbekistan but is the 2010 AFC
 *  final in Tashkent. Brazil's 2024 final v Argentina is not used because we could not confirm that he played in it.)
 *  1  LIVE (broadcast camera high in the main stand, real time, with two whip-pan cuts): the teams in shape at a kick-off, João Victor the
 *     deepest Brazil player (a ring under him, a dashed "last line" on the floor); cut → his celebration with the board flipping 3–0 → 4–0
 *     (35:09); cut → his second celebration, the board 4–0 → 5–0 (39:34).
 *  2  HOW HE DOES IT (demonstration, real time, from behind his right shoulder): 12 m out in the middle, the ball at his feet; the two
 *     defenders drop off (they "stay back"), a yellow zone shows the space; he looks up (the dashed eye-line to the far corner), a ring
 *     marks where the standing foot goes, and he strikes through the ball: a rising drive inside the post, the keeper goes too late.
 *  3  YOUR TURN (the lesson, slow-motion replay of the demonstration from a second, lower angle): space → look up → shoot; a big tick.
 *     Lesson from the entry's `lesson`: "Shoot from distance when the defenders give you space."
 * Sources (written; curl, 5 s apart, a generic User-Agent; cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2024 FIFA Futsal World Cup" (raw, cached by an earlier film): round of 16, 24 Sep 2024, 17:30, Brazil 5–0 Costa Rica,
 *    Bukhara Universal Sports Complex, attendance 1,471, referee Juan José Cordero (Spain); goals Marcel 04'37", Felipe Valério 11'09",
 *    Leandro Lino 27'46", Neguinho 35'09" and 39'34". Also: Neguinho scored v Cuba (10'41", 10–0) and v Croatia (18'14", 8–1): 4 goals in
 *    the tournament; Brazil beat Argentina 2–1 in the final (6 Oct 2024, Humo Arena, Tashkent).
 *  - Wikipedia, "Neguinho (futsal player, born 2000)" (raw, wiki-neguinho-2000.txt): full name João Victor Alves Sena, born 12 Jul 2000,
 *    São Paulo, 1.73 m, defender; clubs; Brazil 2022–; honours incl. FIFA Futsal World Cup 2024, Copa América 2024.
 *  - ge.globo, "Conheça os jogadores que representam o Brasil na Copa do Mundo de Futsal" (12 Sep 2024): "Neguinho - Fixo … João Victor
 *    Alves Sena, conhecido como Neguinho" (Corinthians, Atlântico, Palma; the squad of 14).
 *  - Comitê Olímpico do Brasil, "Buenos Aires-2018" (https://www.cob.org.br/time-brasil/participacoes/3579-buenos-aires): the gold-medal
 *    boys' futsal team lists "João Victor Sena"; Lance! (16 Sep 2024) says Neguinho, Brazil's No. 5 at the 2024 World Cup, captained that
 *    2018 Youth Olympics team. Card bio only (Youth Olympic gold 2018); not used in the narration.
 *  - Wikipedia, "FC Barcelona (futsal)" (raw, cached): squad lists "João Victor" (Neguinho, born 2000) as a defender.
 *  - Two search-engine requests (DuckDuckGo, Bing) returned bot challenges / unrelated pages; no further fetching.
 * CONFIRMED: the match (round of 16), date, venue, city, attendance, the 5–0 score line and that HE scored 4–0 at 35:09 and 5–0 at 39:34;
 *  he plays fixo for Brazil; his height (1.73 m); Brazil went on to win the World Cup. The narration only states the match, the teams, his
 *  role and the two goals.
 * INFERRED (never named in the narration): the kits (Brazil yellow shirts / blue shorts / white socks as the listed home side; Costa Rica
 *  red shirts / blue shorts / white socks; Costa Rica's keeper in navy); which end; every position; where the celebrations happened and how;
 *  the look and place of the board; his hair (short) and shirt number (not shown); his shooting foot in the demonstration (right, the
 *  library default); the demonstration's spot (12 m, central — the card's params "center", "long") and target. No video was reviewed.
 * Technique (poses, chapters 2–3): head up before the strike to see the goal, standing foot planted beside the ball pointing at the target,
 *  body over the ball, laces through the middle of it, a full follow-through; the defenders "give space" by dropping off toward their goal.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the strike). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Brazil, lights, space zone, flight lines), red (Costa Rica, rings, arrows), blue (court, shorts), navy (key line, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2024 World Cup',text:'The 2024 Futsal World Cup, in Uzbekistan. Brazil play Costa Rica. João Victor is Brazil’s fixo, the last defender. Late in the game, he scores. Four nil! Then he scores again. Five nil!',tail:2.4,
  cues:['The 2024','in Uzbekistan','Brazil play','João Victor','fixo','last defender','Late in','he scores','Four nil','Then he','Five nil'],heads:{'The 2024':'World Cup 2024','fixo':'The fixo','Four nil':'4–0','Five nil':'5–0'}},
 {label:'How he does it',text:'His trademark is the power shot from the back. This is how he does it: the defenders stay back, so there is space. He looks up, plants his foot, and strikes right through the ball. Goal!',tail:2.2,
  cues:['His trademark','power shot','This is how','defenders stay','there is space','He looks','plants his','strikes right','Goal'],heads:{'power shot':'Power shot','Goal':''}},
 {label:'Your turn',text:'Your turn. When the defenders give you space, look up and shoot from distance!',tail:3,
  cues:['Your turn','defenders give','space','look up','shoot from'],heads:{'Your turn':'Space? Shoot!','shoot from':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/joao-victor-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/joao-victor-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/joao-victor-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('joao-victor: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('joao-victor: no cue '+w);return c.at;};
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

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_CAMERA=-Math.PI/2;
const SKIN_L:InkFill[]=[[Y,.8],[R,.3]],SKIN_M:InkFill[]=[[Y,.72],[R,.4]],SKIN_D:InkFill[]=[[Y,.5],[R,.4],[K,.25]];
const BUILD={height:1.73,bulk:1.04};
/** João Victor in Brazil's kit: yellow shirt, blue shorts, white socks (inferred), short dark hair, 1.73 m; no number (unverified) */
const JV:AthleteStyle={shirt:Y,shorts:B,socks:'paper',boots:K,skin:SKIN_D,hair:K,line:K,trim:B,number:null,hairStyle:'short',build:BUILD,seed:6};
/** the same man in the demonstrations: a yellow training top, navy shorts and socks (no match is claimed) */
const JV_TRAIN:AthleteStyle={...JV,shorts:K,socks:K,trim:K};
const BRA=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,skin:n%3===1?SKIN_D:n%3===2?SKIN_M:SKIN_L,hair:K,line:K,trim:B,hairStyle:n%2?'short':'bald',build:{height:1.72+hash(n,3)*.12},seed:30+n});
/** Costa Rica: red shirts, blue shorts, white socks (inferred) */
const CRC=(n:number):AthleteStyle=>({shirt:R,shorts:B,socks:'paper',boots:K,skin:n%2?SKIN_M:SKIN_L,hair:K,line:K,trim:'paper',hairStyle:n%3?'short':'curly',build:{height:1.7+hash(n,5)*.12},seed:20+n});
const CRC_GK:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:SKIN_M,hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:62};
/** the demonstration defenders and keeper: neutral paper/navy training kits */
const DEMO_D=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:K,boots:K,skin:n?SKIN_L:SKIN_M,hair:K,line:K,trim:K,hairStyle:n?'short':'curly',build:{height:1.78+.04*n,bulk:1.03},seed:77+n});
const DEMO_K:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:79};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.7],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact: just past the kicking toe along the foot (library coords, place at the origin) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT),BUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}
/** where the standing (left) foot lands at the plant, in our stage (for the "plants his foot" ring) */
function plantFoot(yaw:number,X:number,Z:number):[number,number]{const sk=solve(strike(.3),BUILD,placeAt(X,Z,yaw)),a=toMine(sk.lAn);return[a[0],a[2]];}

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
/** stepped navy rows, lit faces, yellow / red / blue shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.3)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.4)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.5)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Costa Rica's goal at X = +20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
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
 lines.addPath(polyPath(floorRing(st,0,10,.12,12),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st);o.keeper?.();sidePosts(s,st);
}
/** the goal at X = +20 seen side-on: the net runs back to +X */
function sideGoal(s:Sheet,st:Stage){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>proj(st,GOAL_X+lerp(Db,Dt,Yh/H),Yh,Z);
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

// ---- DEMO court facing the goal end (camera looks along +Z): goal centre (0, GZ), wall behind it ----
const GZ=11,WALLZ=13.4;
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void};
/** the court seen end-on: blue floor + run-off, paper lines (goal line, the D, the touchlines), boards, stands, the goal */
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0}=o;
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
 goalEnd(s,st,bulge,bx,by);o.keeper?.(st);postsEnd(s,st);
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
/** the board, flat to the camera, centred at sheet point c, k units per metre (6 m × 3 m): Brazil (yellow) left, Costa Rica (flag bands) right */
function scoreboard(s:Sheet,c:Pt,k:number,b:{home:number;away:number;clock:string;flip:number;glow:number},seed:number){
 const W=6*k,H=3*k,x0=c[0]-W/2,y0=c[1]-H/2,box=handCut([[x0,y0],[x0+W,y0],[x0+W,y0+H],[x0,y0+H]],seed,k*.05,k*.9);
 const cab=new Path2D();for(const u of[.18,.82])cab.addPath(ribbon([[x0+W*u,y0],[x0+W*u+(u-.5)*k*.6,y0-k*9]],Math.max(2,k*.04),{seed:seed+2,taper:0,wobble:.5}));s.fill(K,cab,.8);
 if(b.glow>.02)s.fill(Y,polyPath(blob(c[0],c[1],W*.62*(1+.08*b.glow),H*.75*(1+.1*b.glow),seed+3,{amp:.04,n:28}),true),.35*b.glow);
 const bp=polyPath(box,true);s.knockout(bp);s.fill(K,bp,.92);s.fill(Y,ribbon([...box,box[0]],k*.09,{seed:seed+4,close:true,wobble:.6}));
 const sw=k*.9,sh=k*.62,ly=y0+H*.2;
 const pr=polyPath(handCut([[x0+k*.35,ly],[x0+k*.35+sw,ly],[x0+k*.35+sw,ly+sh],[x0+k*.35,ly+sh]],seed+5,k*.02,k*.4),true);s.knockout(pr);s.fill(Y,pr);
 // Costa Rica's flag: blue, white, red (double), white, blue
 const ax=x0+W-k*.35-sw,ap=polyPath(handCut([[ax,ly],[ax+sw,ly],[ax+sw,ly+sh],[ax,ly+sh]],seed+6,k*.02,k*.4),true);s.knockout(ap);
 s.fill(B,rectPath(ax,ly,sw,sh/6));s.fill(B,rectPath(ax,ly+sh*5/6,sw,sh/6));s.fill(R,rectPath(ax,ly+sh/3,sw,sh/3));
 const dh=H*.36,num=new Path2D(),sy=1-.8*Math.sin(Math.PI*clamp(b.flip));
 digits(num,String(b.home),c[0]-k*1.35,ly-dh*.02,dh,seed+10,sy);digits(num,String(b.away),c[0]+k*.85,ly-dh*.02,dh,seed+20);
 num.addPath(ribbon([[c[0]-k*.32,ly+dh*.5],[c[0]+k*.32,ly+dh*.5]],dh*.13,{seed:seed+30,taper:0}));
 s.knockout(num);
 const clk=new Path2D(),ch=H*.2,cw=digits(new Path2D(),b.clock,0,0,ch,0);digits(clk,b.clock,c[0]-cw/2,y0+H*.7,ch,seed+40);s.knockout(clk);s.fill(Y,clk);
}
/** his chest (the passage enters his yellow shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}

// ================= chapter 1 — LIVE: the 2024 World Cup round of 16, Bukhara. Only confirmed things: the arena, the teams in shape, João
// Victor the fixo (the deepest Brazil player), then (cut) his celebration with the board 3–0 → 4–0 at 35:09, and (cut) 4–0 → 5–0 at 39:34.
// No goal, pass, shot or tackle of the match is staged: the goals happen off camera, inside the whip-pan cuts. =================
const C1={cup:A(0,'The 2024'),uzb:A(0,'in Uzbekistan'),bra:A(0,'Brazil play'),jv:A(0,'João'),fixo:A(0,'fixo'),last:A(0,'last defender'),late:A(0,'Late in'),scores:A(0,'he scores'),four:A(0,'Four nil'),then:A(0,'Then he'),five:A(0,'Five nil'),end:AUTH[0].seconds};
/** two whip pans (cuts in time): the teams in shape → his first celebration (35:09) → his second (39:34) */
const W0=C1.late-.1,W1=W0+.26,WM=(W0+W1)/2,V0=C1.then-.1,V1=V0+.26,VM=(V0+V1)/2;
/** the shape (Brazil attack +X): the ball on the centre spot with Brazil's pivot; João Victor the deepest, in the middle */
const JV0:[number,number]=[-7.4,10.4];
const SH_BRA:[number,number][]=[[-.6,9.6],[-3.4,4.2],[-3,15.8]];// pivot, right ala, left ala
const SH_CRC:[number,number][]=[[2.6,8.2],[2.9,12.6],[6.4,4.8],[6.8,15.4]];
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** celebration 1 (4–0): he runs toward the near corner, arms out; celebration 2 (5–0): arms up by the far side of the box */
const CEL1:[number,number]=[13.6,6.2],CEL1_FROM:[number,number]=[15.6,9.8],CEL2:[number,number]=[12.8,11.8];
const liveJ:Gen=T=>{
 if(T<WM)return{pose:idle(T,.2),yaw:0,X:JV0[0],Z:JV0[1]};
 if(T<VM){const u=sm(WM,C1.four+.4,T,easeOut);const X=lerp(CEL1_FROM[0],CEL1[0],u),Z=lerp(CEL1_FROM[1],CEL1[1],u);
  const pose=u<.97?celebrate((T-WM)*1.3,{kind:'run'}):blendPose(celebrate((T-WM)*1.3,{kind:'run'}),celebrate((T-WM)*1.1,{kind:'arms'}),sm(C1.four+.4,C1.four+.8,T));
  return{pose,yaw:u<.97?yawTo(CEL1[0]-CEL1_FROM[0],CEL1[1]-CEL1_FROM[1]):FACE_CAMERA+.3*Math.sin(T*1.4),X,Z};}
 return{pose:celebrate((T-VM)*1.1+.2,{kind:'arms'}),yaw:FACE_CAMERA-.25+.3*Math.sin(T*1.2),X:CEL2[0],Z:CEL2[1]};};
/** Brazil team-mates: in shape, then they run in to him and jump with him */
const liveBra=(i:number):Gen=>T=>{
 if(T<WM){const p=SH_BRA[i];return{pose:idle(T,i+.5),yaw:0,X:p[0],Z:p[1]};}
 const cel=T<VM?CEL1:CEL2,t0=T<VM?WM:VM,from:[number,number]=T<VM?[[17.2,12.4],[11.2,2.6],[9.6,11.6]][i] as [number,number]:[[16.8,8.4],[9.4,15.2],[8.8,8.8]][i] as [number,number];
 const tgt:[number,number]=[cel[0]+[1,-.9,.9][i],cel[1]+[.9,-.6,-.9][i]],go=sm(t0,t0+1.5,T,easeOut),X=lerp(from[0],tgt[0],go),Z=lerp(from[1],tgt[1],go);
 return{pose:go<.95?runCycle((T-t0)*runCadence(.8)+i*.3,{speed:.8}):celebrate((T-t0)*1.1+i*.4,{kind:'arms'}),yaw:go<.95?yawTo(tgt[0]-from[0],tgt[1]-from[1]):yawTo(cel[0]-X,cel[1]-Z),X,Z};};
/** Costa Rica: in shape, then heads down, walking back toward the halfway line */
const liveCrc=(i:number):Gen=>T=>{
 if(T<WM){const p=SH_CRC[i];return{pose:idle(T,i+.9),yaw:Math.PI,X:p[0],Z:p[1]};}
 const t0=T<VM?WM:VM,base:[number,number]=T<VM?[[17.4,7.6],[16.2,13.8],[12.4,16.4],[10.6,5]][i] as [number,number]:[[17.8,10.6],[15.2,6.4],[11.6,16.8],[10.2,4.2]][i] as [number,number];
 const w=(T-t0)*.35;
 return{pose:blendPose(runCycle((T-t0)*runCadence(0)+i*.25,{speed:0}),posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:10,rShA:10,lElb:24,rElb:24}),.55),yaw:Math.PI+[.2,-.3,.4,-.2][i],X:base[0]-w,Z:base[1]};};
const liveGK:Gen=T=>T<WM?{pose:keeperSet(T*1.1),yaw:Math.PI,X:19.2,Z:10}:{pose:posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:16,neckP:44,lShA:12,rShA:12,lElb:30,rElb:30}),yaw:Math.PI-.6,X:19.1,Z:T<VM?9.2:10.8};
const liveCam=(T:number)=>({x:key(T,mono([[0,-1.6],[C1.uzb,-1.8],[C1.bra,-2.2],[C1.jv,-4.4],[C1.fixo,-4.8],[C1.last,-4.6],[W0,-4.4],[W1,12.4],[C1.scores,12.6],[C1.four,12.8],[V0,12.8],[V1,13.4],[C1.five,13.4],[C1.end,13.2]]),easeInOutSine),
 zoom:key(T,mono([[0,.52],[C1.bra,.56],[C1.jv,.8],[C1.fixo,.86],[C1.last,.74],[W0,.74],[W1,.74],[C1.scores,.8],[C1.four,.78],[V0,.8],[V1,.84],[C1.five,.82],[C1.end,.86]]),easeInOutSine),
 y:key(T,mono([[0,1320],[C1.jv,1260],[C1.fixo,1250],[C1.last,1300],[W0,1300],[W1,1040],[C1.four,1020],[V1,1030],[C1.end,1020]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const phase=T<WM?0:T<VM?1:2;
 courtSide(s,st,T,{cheer:phase===0?.15:1,flash:phase===1?pulse(T,WM,1.2)+.5*pulse(T,C1.four,1):phase===2?pulse(T,VM,1.2)+.6*pulse(T,C1.five,1.2):.3*pulse(T,C1.cup,1.2),
  keeper:()=>{athlete(s,st,liveGK,T,CRC_GK,{detail:'low'});}});
 // the board over the court (seen from the main stand): 3–0 → 4–0 on "Four nil" (35:09), 4–0 → 5–0 on "Five nil" (39:34)
 if(phase>0){const bc=proj(st,c.x+1.2,2.6,BOARDS-1.5),kb=kAt(st,BOARDS-1.5)*.6,f=phase===1?C1.four:C1.five,home=phase===1?(T<f?3:4):(T<f?4:5);
  scoreboard(s,bc,kb,{home,away:0,clock:phase===1?'35:09':'39:34',flip:T>=f?sm(f,f+.25,T,linear):0,glow:pulse(T,f,1.4)},phase===1?611:621);}
 type It={z:number;draw:()=>void};const items:It[]=[];
 SH_CRC.forEach((_,i)=>{const g=liveCrc(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,CRC(i),{detail:'low'})});});
 SH_BRA.forEach((_,i)=>{const g=liveBra(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,BRA(i),{detail:'low'})});});
 const j=liveJ(T);
 items.push({z:j.Z-.02,draw:()=>athlete(s,st,liveJ,T,JV,{detail:'mid'})});
 // the ball on the centre spot while the teams are in shape (no play is shown)
 if(phase===0)items.push({z:10,draw:()=>{const p=proj(st,0,BALL_R,10.2),g=proj(st,0,0,10.2),r=Math.max(9,kAt(st,10.2)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45);ball(s,p[0],p[1],r,18);}});
 // "João Victor": a yellow+navy ring under him; "fixo, the last defender": a dashed red line across the court just behind him,
 //  every other outfield player in front of it, and a short arrow back toward Brazil's own goal
 if(phase===0){const g=easeOutBack(sm(C1.jv,C1.jv+.35,T))*(1-sm(W0-.3,W0,T));
  if(g>.02)items.push({z:j.Z+.9,draw:()=>{floorDashRing(s,st,K,j.X,j.Z,.95,20,50,g);floorDashRing(s,st,Y,j.X,j.Z,.95,12,51,g);}});
  const ln=sm(C1.last,C1.last+.6,T,easeOut)*(1-sm(W0-.3,W0,T));
  if(ln>.02)items.push({z:19.5,draw:()=>{const X=j.X-.9,pts:Pt[]=[proj(st,X,0,.6),proj(st,X,0,10),proj(st,X,0,19.4)];dashed(s,R,pts,12,52,{dash:46,progress:ln});
   if(ln>.9){const a=proj(st,X-.3,0,JV0[1]),e=proj(st,X-3,0,JV0[1]);const q=[a,L2(a,e,.5),e];dashed(s,R,q,12,53,{dash:40});arrowHead(s,R,q,40,54);}}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // the whip pans: yellow speed lines sweep across the frame (cuts in time)
 for(const[a0,a1] of[[W0,W1],[V0,V1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
 // "he scores": a yellow burst behind him as the celebration starts; "Five nil": another
 for(const f of[C1.scores,C1.five]){if(T>=f&&T<f+.8){const q=liveJ(T),p=proj(st,q.X,1.2,q.Z+.3);sparkBurst(s,Y,p[0],p[1],150,{n:12,seed:70+Math.round(f),g:easeOut(sm(f,f+.35,T))*(1-sm(f+.5,f+.8,T))});}}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveJ(tt),.14));},still:C1.fixo+.3};

// ================= the demonstration (chapters 2 and 3): 12 m out in the middle; the defenders drop off; head up; plant; strike =================
/** event times of one run of the demonstration; `rate` stretches the strike and the flight (slow motion) */
type DemoT={back0:number;back1:number;look:number;hit:number;rate:number};
/** the ball 12 m out, central (the card: "center", "long"); the target: rising, just inside the right-hand post (screen right) */
const DB:[number,number]=[.2,GZ-12],DT:V3=[1.12,.95,GZ-.02];
const DYAW=yawTo(DT[0]-DB[0],DT[2]-DB[1]);
const DSB=toMine(strikeBall(DYAW)),DPL:[number,number]=[DB[0]-DSB[0],DB[1]-DSB[2]];
const PLANT=plantFoot(DYAW,DPL[0],DPL[1]);
const FLIGHT=.5;
/** the two defenders: they start 8.8 m from goal and drop off to 6.2 m ("stay back") */
const DEFS:[number,number][]=[[-1.9,0],[2.1,.3]];
const DEF_Z0=GZ-8.8,DEF_Z1=GZ-6.2;
function makeDemo(T:DemoT){
 const r=T.rate,s0=T.hit-.9*r;
 const st=(t:number)=>key(t,[[s0,0],[T.hit-.5*r,.22],[T.hit,STRIKE_CONTACT],[T.hit+1.4*r,.85],[T.hit+2.4*r,1]],linear);
 /** head down on the ball, then "looks up" at the goal; then the strike (right foot) */
 const shooter:Gen=t=>{const X=DPL[0]+key(t,[[0,-.35],[s0,-.35],[T.hit,0,easeOut],[T.hit+1.6*r,.2]]),Z=DPL[1]+key(t,[[0,-1.1],[s0,-1.1],[T.hit,0,easeOut],[T.hit+1.6*r,.35]]);
  if(t<s0){const up=sm(T.look,T.look+.35,t,easeIO),b=.5+.5*Math.sin(t*2.2);
   return{pose:blendPose(posed({lHipF:14,rHipF:8,lKnee:22+4*b,rKnee:16+4*b,lean:18,neckP:38,lShA:22,rShA:20,lElb:32,rElb:30}),posed({lHipF:14,rHipF:8,lKnee:22+4*b,rKnee:16+4*b,lean:10,neckP:-8,lShA:22,rShA:20,lElb:32,rElb:30}),up),yaw:DYAW,X,Z};}
  return{pose:strike(st(t)),yaw:DYAW,X,Z};};
 const ballAt=(t:number):{X:number;Y:number;Z:number;flying:boolean}=>{
  if(t<T.hit)return{X:DB[0],Y:BALL_R,Z:DB[1],flying:false};
  const tin=T.hit+FLIGHT*r;
  if(t<tin){const p=arc3([DB[0],BALL_R,DB[1]],DT,.78,sm(T.hit,tin,t,linear));return{X:p[0],Y:p[1],Z:p[2],flying:true};}
  const d=sm(tin+.1*r,tin+.5*r,t,easeIn);return{X:DT[0],Y:lerp(DT[1],BALL_R,d),Z:GZ+.6,flying:false};};
 const defender=(i:number):Gen=>t=>{const d=DEFS[i],u=sm(T.back0,T.back1,t,easeIO),Z=lerp(DEF_Z0,DEF_Z1,u)+d[1];
  let pose=u>0&&u<1?backpedal(t*1.6+i*.4):blendPose(stand(),backpedal(.25+i*.3),.35);
  const lu=key(t,[[T.hit-.1*r,0],[T.hit+.35*r,.6],[T.hit+1.6*r,1]],linear);if(t>T.hit-.15*r)pose=blendPose(pose,lunge(lu,{side:i?'l':'r'}),sm(T.hit-.15*r,T.hit+.05*r,t));
  return{pose,yaw:yawTo(DB[0]-d[0],DB[1]-Z),X:d[0],Z};};
 /** the keeper: set; the rising drive is past him before he is down — he dives late to his left (screen right) */
 const KD=T.hit+.22*r;
 const keeper:Gen=t=>{let pose=keeperSet(t*.9);if(t>=KD)pose=blendPose(keeperSet(KD*.9),keeperDive(sm(KD,T.hit+1.2*r,t,linear)*.9,{side:'l',height:.5}),sm(KD,KD+.2*r,t));
  return{pose,yaw:FACE_CAMERA-.05,X:-.1+.45*sm(KD,T.hit+FLIGHT*r,t,easeOut),Z:GZ-.7};};
 return{shooter,ballAt,defender,keeper,tin:T.hit+FLIGHT*r,s0};
}
type Demo=ReturnType<typeof makeDemo>;
/** draw the demo world on stage st at time tt: arena + keeper, space zone, eye-line, plant ring, flight line, figures back to front, ball */
function demoFrame(s:Sheet,st:Stage,dm:Demo,T:DemoT,tt:number,o:{space:number;eye:number;plant:number;cheer:number;detail:'mid'|'high';seed:number}){
 const b=dm.ballAt(tt),goal=tt>=dm.tin;
 arena(s,st,{t:tt,cheer:goal?o.cheer:0,flash:pulse(tt,dm.tin,1),bulge:.5*sm(dm.tin-.15*T.rate,dm.tin,tt)*(1-.6*sm(dm.tin+.4*T.rate,dm.tin+1.4*T.rate,tt))+.1*settle(tt,dm.tin,{amp:1,freq:3,decay:3/T.rate}),bx:DT[0],by:DT[1],
  keeper:stg=>{athlete(s,stg,dm.keeper,tt,DEMO_K,{detail:'mid'});}});
 // "there is space": a yellow zone on the floor between him and the defenders (it grows as they drop off)
 if(o.space>.02){const dz=lerp(DEF_Z0,DEF_Z1,sm(T.back0,T.back1,tt,easeIO))-.8,q=floorQuad(st,-3.2,DB[1]+.9,3.2,dz),p=polyPath(q,true);s.knockout(p,.5*o.space);s.fill(Y,p,.55*o.space);
  const edge=[proj(st,-3.2,0,dz),proj(st,3.2,0,dz)];dashed(s,Y,edge,10,o.seed+1,{dash:40,progress:o.space});}
 // "looks up": a dashed eye-line from his head to the far corner
 if(o.eye>.02){const q=dm.shooter(tt),sk=solve(q.pose,BUILD,placeAt(q.X,q.Z,q.yaw)),h=toMine(sk.head),a=proj(st,h[0],h[1],h[2]),e=proj(st,DT[0],DT[1],GZ),pts=[a,L2(a,e,.5),e];dashed(s,R,pts,9,o.seed+2,{dash:36,progress:o.eye});if(o.eye>.9)arrowHead(s,R,pts,30,o.seed+3);}
 // "plants his foot": a red ring where the standing foot lands, beside the ball
 floorDashRing(s,st,R,PLANT[0],PLANT[1],.28,8,o.seed+4,o.plant);
 // the flight line (drawn as the ball goes): a rising drive
 if(tt>T.hit){const pts:Pt[]=[];for(let k=0;k<=16;k++){const q=dm.ballAt(lerp(T.hit,Math.min(tt,dm.tin),k/16));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,o.seed+5,{dash:40});if(goal)arrowHead(s,Y,pts,34,o.seed+6);}
 const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(.35,-.2);shadow(s,g[0],g[1],r*1.1,r*.3,o.seed+7,b.flying?.3:.45);
  if(b.flying)speedLines(s,R,p[0],p[1],dir,{n:5,seed:o.seed+8+Math.floor(tt*6),len:r*3.2,spread:r*.8,width:5});
  ball(s,p[0],p[1],r,o.seed+9,{rot:tt*6,smear:b.flying?.4:0,dir});if(tt>=T.hit&&tt<T.hit+.4*T.rate)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:o.seed+10,g:easeOut(sm(T.hit,T.hit+.3*T.rate,tt))});};
 const L=dm.shooter(tt);
 const its:{z:number;draw:()=>void}[]=DEFS.map((_,i)=>{const g=dm.defender(i);return{z:g(tt).Z,draw:()=>{athlete(s,st,g,tt,DEMO_D(i),{detail:'mid'});}};});
 its.push({z:L.Z,draw:()=>athlete(s,st,dm.shooter,tt,JV_TRAIN,{detail:o.detail,smear:tt>T.hit-.3*T.rate&&tt<T.hit+.3*T.rate?.2*T.rate:0})},{z:!b.flying&&tt<T.hit?L.Z-.01:b.Z,draw:drawBall});
 its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
 if(tt>=dm.tin&&tt<dm.tin+1){const p=proj(st,DT[0],DT[1],GZ+.4);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:o.seed+11,g:easeOut(sm(dm.tin,dm.tin+.3,tt))*(1-sm(dm.tin+.7,dm.tin+1,tt))});}
}
/** a big yellow tick with a navy misregistered echo, centred at sheet point c */
function tick(s:Sheet,c:Pt,g:number,seed:number){if(g<=.02)return;const S=150*g,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 const tp=ribbon(tk,S*.24,{seed,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:seed+2,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}

// ================= chapter 2 — HOW HE DOES IT (demonstration, real time, from behind his right shoulder) =================
const C2={trade:A(1,'His trademark'),power:A(1,'power shot'),how:A(1,'This is'),stay:A(1,'defenders stay'),space:A(1,'there is'),looks:A(1,'He looks'),plants:A(1,'plants'),strikes:A(1,'strikes'),goal:A(1,'Goal'),end:AUTH[1].seconds};
const T2:DemoT={back0:C2.stay,back1:C2.space+.3,look:C2.looks,hit:Math.max(C2.strikes+.5,C2.plants+.9),rate:1};
const demo2=makeDemo(T2);
const st2:Stage={F:1500,eye:2.3,cx:3.2,cz:GZ-19};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2;
  camPath(s,t,[[0,-420,220,.92],[C2.power,-560,300,1.15],[C2.how,-500,260,1],[C2.stay,-470,220,.95],[C2.space,-470,230,.97],[C2.looks,-540,230,1.1],[C2.plants,-560,300,1.18],[T2.hit,-500,250,1.05],[C2.goal,-380,180,1],[C2.end,-380,180,1.03]]);
  demoFrame(s,st,demo2,T2,tt,{space:sm(C2.space,C2.space+.4,tt)*(1-sm(C2.looks+.4,C2.looks+.8,tt)),eye:sm(C2.looks+.1,C2.looks+.6,tt,easeOut)*(1-sm(C2.plants+.1,C2.plants+.4,tt)),
   plant:easeOutBack(sm(C2.plants,C2.plants+.3,tt))*(1-sm(T2.hit+.3,T2.hit+.6,tt)),cheer:.7*(1-sm(C2.end-1,C2.end,tt)),detail:'high',seed:700});
  // "from the back": a yellow+navy ring under him at the start (he is the deepest player)
  {const q=demo2.shooter(tt),g=easeOutBack(sm(C2.power,C2.power+.35,tt))*(1-sm(C2.how+.2,C2.how+.5,tt));floorDashRing(s,st,K,q.X,q.Z+.3,.9,16,730,g);floorDashRing(s,st,Y,q.X,q.Z+.3,.9,10,731,g);}
  // "defenders stay back": red arrows under the defenders, pointing back toward their goal
  {const g=sm(C2.stay,C2.stay+.5,tt,easeOut)*(1-sm(C2.looks,C2.looks+.3,tt));if(g>.02)DEFS.forEach((d,i)=>{const a=proj(st,d[0],0,DEF_Z0+d[1]),e=proj(st,d[0],0,DEF_Z1+d[1]+.3),q=[a,L2(a,e,.5),e],pp=partial(q,g);if(pp.length>1){dashed(s,R,pp,10,740+i,{dash:30});if(g>.9)arrowHead(s,R,pp,30,742+i);}});}
  tick(s,proj(st,3,1.4,GZ),easeOutBack(sm(C2.goal,C2.goal+.35,tt)),750);
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,demo2.shooter(tt),.13));},
 still:T2.hit+.1,
};

// ================= chapter 3 — YOUR TURN (the lesson): the demonstration again in slow motion, from a second, lower angle =================
const C3={turn:A(2,'Your turn'),give:A(2,'defenders give'),space:A(2,'space'),look:A(2,'look up'),shoot:A(2,'shoot from'),end:AUTH[2].seconds};
const T3:DemoT={back0:C3.give,back1:C3.space+.4,look:C3.look,hit:C3.shoot+.35,rate:1.9};
const demo3=makeDemo(T3);
/** a lower camera on his right, nearer the ball: the strike fills the frame, the goal behind */
const st3:Stage={F:1500,eye:1.25,cx:2.4,cz:GZ-17.5};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  camPath(s,t,[[0,-480,130,.92],[C3.give,-470,110,.88],[C3.space,-460,110,.9],[C3.look,-640,140,1.1],[T3.hit,-620,160,1.1],[demo3.tin,-440,80,.92],[C3.end,-420,80,.95]]);
  demoFrame(s,st,demo3,T3,tt,{space:sm(C3.space-.1,C3.space+.3,tt)*(1-sm(T3.hit,T3.hit+.4,tt)),eye:sm(C3.look,C3.look+.5,tt,easeOut)*(1-sm(T3.hit-.3,T3.hit,tt)),
   plant:easeOutBack(sm(T3.hit-.6*T3.rate,T3.hit-.3*T3.rate,tt))*(1-sm(T3.hit+.3,T3.hit+.6,tt)),cheer:.8*(1-sm(C3.end-.8,C3.end,tt)),detail:'high',seed:800});
  tick(s,proj(st,3.2,2.6,GZ),easeOutBack(sm(demo3.tin+.1,demo3.tin+.45,tt)),850);
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demo3.shooter(tt),.13));},
 still:T3.hit+.1,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'joao-victor-futsal-signature',format:'futsal',title:'João Victor’s power shot',theme:'Shoot from distance when the defenders give you space.',
 ageNote:'For players aged 7–12: the 2024 World Cup match and his two goals are real; chapters 2 and 3 are a demonstration of his shot.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball is driven up and away from the touch point with red speed lines and a yellow flight line; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.6),bx=x-110+220*easeOut(u),by=y+40-80*easeOut(u);
  s.fill(K,polyPath(blob(bx,y+r*1.4,r*.9,r*.22,seed+2,{n:16}),true),.3);
  if(u<1){const sk=ribbon([[x-120,y+44],[bx-r*.8,by+r*.4]],10*(1-u)+3,{seed,taper:.6,wobble:1});s.fill(Y,sk,1);speedLines(s,R,bx,by,Math.atan2(-80,220),{n:4,seed:seed+1,len:r*3,spread:r*.8,width:5});}
  ball(s,bx,by,r,seed,{rot:age*12,smear:u<1?.4*(1-u):0,dir:Math.atan2(-80,220)});
 },
};
export default film;
