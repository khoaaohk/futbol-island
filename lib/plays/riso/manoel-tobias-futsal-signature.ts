/** Manoel Tobias — "the 1v1 and toe-poke finish": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHY THIS MOMENT: Manoel Tobias's entry (lib/town/iconicPlays.json) is a signature — the 1v1 and the toe-poke, from the right, in the
 * box — not one match. No written source we could reach describes ONE dated toe-poke goal of his (older futsal is thinly covered; the
 * FIFA archive lists goal times, not how they were scored), so the film follows the brief's honest fallback: it opens on a REAL,
 * documented Manoel Tobias moment, then says "This is the move on his card" and shows the 1v1 + toe-poke as a demonstration that is
 * never passed off as that match.
 *  1  LIVE (broadcast camera, main stand, real time): FIFA Futsal World Championship final, 8 Dec 1996, Brazil 6–4 Spain (HT 3–1),
 *     Palau Sant Jordi, Barcelona (15,500). Spain's captain Vicentin makes it 5–4 at 39'09" (0'51" left); Manoel Tobias (#5) scores
 *     Brazil's sixth at 39'10" (0'50" left). Brazil are world champions again; he is the tournament's top scorer (14 goals) and best
 *     player (adidas Golden Ball + Golden Shoe). FALLBACK RULE: how the goal was scored is undocumented, so NO goal is staged — the
 *     chapter shows Spain jogging back after their 5–4, Brazil set for the kick-off, then the camera tilts up to the scoreboard
 *     (5–4, 0:51 → 6–4, 0:50) while the goal happens, and tilts down to the celebration and the champions' confetti.
 *  2  THE MOVE ON HIS CARD (a demonstration, no match claimed; slow motion, low, behind him; neutral navy/paper defender and keeper):
 *     he takes on the defender from the right, slips the ball inside past the lunge, and toe-pokes it low before the keeper is set.
 *  3  TRY IT (lesson from the entry's `lesson`: "A quick toe-poke shot surprises the keeper before they are ready"): side view — the big
 *     instep backswing (red, crossed out) vs the toe-poke's short swing (yellow); the poke beats a keeper still bouncing on his toes.
 * Sources (written; fetched once, ≤ 5 s apart, cached in scratchpad/films/src-cache/):
 *  - FIFA.com match page, Final Brazil – Spain 6:4 (3:1), archived 1 Jul 2013 (fifa-1996-futsal-final.*):
 *    https://web.archive.org/web/20130701051900/http://www.fifa.com/tournaments/archive/futsalworldcup/spain1996/matches/round=7196/match=33522/index.html
 *    — 08 Dec 1996, Barcelona / Palau Sant Jordi, 13:00, 15,500; referee Perry Gautier (BEL); Brazil [5] MANOEL TOBIAS in the starting
 *    five, [1] SERGINHO (GK), [12] VANDER (C); Spain [1] JESUS (GK), [5] VICENTIN (C); events: Danilo 8'01", Choco 16'02", Pato 16'03",
 *    Marcio 18'04", Serginho o.g. 21'05", Danilo 23'06", Vicentin 26'07", Vander 37'08", Vicentin 39'09" (0'51"),
 *    MANOEL TOBIAS 39'10" (0'50"). (A further Vicentin entry at 33'11" is not a goal — the score and the Wikipedia box show four.)
 *  - FIFA.com tournament overview "Spain 1996: Brazil make it a hat-trick" (archived 13 Aug 2013; fifa-1996-futsal-overview.*): Brazil
 *    beat hosts Spain 6-4 before 15,500; "a magnificent quartet in Serginho, Manoel (the tournament's top scorer), Fininho and Vander";
 *    adidas Golden Ball and Golden Shoe: MANOEL TOBIAS.
 *  - Wikipedia, "1996 FIFA Futsal World Championship" (raw, Sep 2026): the final box (same times, HT 3–1, Palau Sant Jordi, 15,500).
 *  - Wikipedia EN + PT, "Manoel Tobias" (raw, Sep 2026): Manoel Tobias da Cruz Júnior, b. 1971 Salgueiro; Brazil 1992–2004, 302 caps /
 *    278 goals; world champion 1992 and 1996 (runner-up 2000, third 2004 — NOT 2008: he had left the national team); Golden Ball 1996 &
 *    2000, top scorer 1996 (14) & 2000 (19); FIFA world player of the year 2000–02. EN lists him as a defender, PT as a fixo.
 * CONFIRMED: match, date, venue, crowd, final score 6–4, 5–4 with 0'51" left after Vicentin's goal, Manoel Tobias's goal at 39'10" as
 *  Brazil's sixth and last, his shirt number 5, Spain's keeper Jesús (#1), Brazil champions, his 14 goals / Golden Ball.
 * NOT SHOWN (unknown): HOW his goal was scored — the record gives one second of clock between Spain's 5–4 and his 6–4 (39'09" →
 *  39'10"), which suggests a strike straight after Brazil's kick-off, but that may be a timing quirk and no video or written description
 *  was reviewed, so the camera is on the scoreboard. INFERRED (not named in the narration): the centre-hung scoreboard's look (a
 *  rendering device), where Brazil celebrate, every player's position, which end each team attacks; kits — Brazil yellow shirts / blue shorts / white socks, Spain red
 *  shirts / navy shorts / navy socks, Jesús in a dark kit; the court colour; Manoel Tobias's right foot, 1.72 m and short dark hair.
 *  The card's move (1v1 from the right + toe-poke in the box) is shown in chapters 2–3 as a demonstration, not as footage of a match; no
 *  source we reached confirms it as his favourite finish, so the narration only calls it "the move on his card".
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike, the cut and the poke). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps
 * library z → −Z; every kick is the RIGHT foot (rToe). The toe-poke is authored here (`toePoke`): a short backswing, the ankle locked
 * with the toe leading (not pointed like an instep strike), contact at TOE_CONTACT, a short follow-through.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Brazil shirts, lights, the toe-poke line), red (Spain, the crossed-out big swing, freeze brackets), blue (court, Brazil
 * shorts), navy (key line, run-off, stands). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the
 * FULL sheet (card window 1.45:1 → square). Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; all seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,clampPose,strike,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 1996 final',text:'Barcelona, 1996, the Futsal World Cup final. Brazil lead Spain five to four, with less than a minute left. Then Manoel Tobias scores. Six to four! Brazil are world champions.',tail:2.4,
  cues:['Barcelona','Brazil lead','five to four','less than a minute','Then Manoel','Six to four','Brazil are world'],heads:{'Barcelona':'Final 1996','five to four':'5–4','less than a minute':'0:51 left','Six to four':'6–4','Brazil are world':'Champions'}},
 {label:'The move on his card',text:'This is the move on his card: the one v one, and the toe-poke. Watch it slowly. He takes on the defender, and slips past. Then he pokes it with his toe, before the keeper is ready. Goal!',tail:2.1,
  cues:['This is the move','one v one','and the toe-poke','Watch it slowly','He takes on','slips past','Then he pokes','with his toe','before the keeper','Goal'],heads:{'one v one':'1 v 1','and the toe-poke':'Toe-poke','Goal':''}},
 {label:'Try it',text:'Try it! A toe-poke has no big swing, so it is quick. It surprises the keeper before they are ready.',tail:2.6,
  cues:['Try it','no big swing','so it is quick','It surprises','before they are ready'],heads:{'no big swing':'No big swing','before they are ready':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/manoel-tobias-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/manoel-tobias-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/manoel-tobias-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('manoel-tobias: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('manoel-tobias: no cue '+w);return c.at;};
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
const SKIN:InkFill[]=[[Y,.84],[R,.32]];
const BUILD={height:1.72,bulk:.97};
/** Manoel Tobias: Brazil #5 (FIFA line-up) — yellow shirt, blue shorts, white socks (kit inferred), short dark hair (inferred), right foot (inferred) */
const TOBIAS:AthleteStyle={shirt:Y,shorts:B,socks:'paper',boots:K,skin:SKIN,hair:K,line:K,trim:B,number:5,numberInk:B,hairStyle:'short',build:BUILD,seed:5};
const BRA=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,skin:[[Y,.8],[R,.28]],hair:K,line:K,trim:B,hairStyle:n%2?'short':'curly',build:{height:1.7+hash(n,3)*.12},seed:20+n});
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:K,boots:K,skin:[[Y,.7],[R,.18]],hair:K,line:K,trim:Y,hairStyle:n%3?'short':'balding',build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Jesús, Spain #1 (GK) — a dark keeper kit (inferred) */
const JESUS:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.7],[R,.18]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',number:1,numberInk:Y,hairStyle:'short',build:{height:1.8},seed:61};
/** the demonstration players: neutral paper/navy training kits (no team or match is claimed in chapters 2–3) */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
const DEMO_K:AthleteStyle={shirt:[B,.55],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.2]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:79};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** THE TOE-POKE (right foot): set → a SHORT backswing (the knee barely folds) → contact with the toe leading and the ankle locked
 * (rAnk ≈ 0, not pointed like an instep strike) → a short punch through → recover. Contact at TOE_CONTACT. */
const TOE_CONTACT=.5;
const TOE_KEYS:[number,Pose][]=[
 [0,posed({lHipF:22,lKnee:30,rHipF:-4,rKnee:40,rAnk:10,lean:14,pitch:4,lShA:30,rShA:30,lElb:50,rElb:50,neckP:30})],
 [.3,posed({lHipF:24,lKnee:36,lAnk:-6,rHipF:-16,rKnee:74,rAnk:8,lShA:52,lShF:18,rShA:36,rShF:-22,lElb:40,rElb:44,lean:16,neckP:38,twist:6,yaw:-4})],
 [TOE_CONTACT,posed({lHipF:20,lKnee:38,lAnk:4,rHipF:34,rKnee:10,rAnk:-6,lShA:60,lShF:-12,rShA:38,rShF:26,lElb:34,rElb:46,lean:18,neckP:40,pitch:5,yaw:4})],
 [.7,posed({lHipF:12,lKnee:30,lAnk:16,rHipF:42,rKnee:16,rAnk:-4,lShA:50,lShF:-6,rShA:32,rShF:18,lElb:36,rElb:48,lean:12,neckP:26,yaw:6})],
 [1,posed({lHipF:14,lKnee:24,rHipF:12,rKnee:24,lShA:24,rShA:24,lElb:40,rElb:40,lean:8,neckP:10})],
];
function toePoke(t:number):Pose{return clampPose(keyPoses(t,TOE_KEYS));}
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

// ================= chapter 1 — LIVE: the 1996 final, 5–4 with 0'51" left; the scoreboard turns to 6–4; Brazil celebrate; champions =================
// Fallback rule: HOW his goal was scored is not documented, so no goal is staged. The broadcast camera shows only confirmed things: Spain
// jogging back after their 5–4, Brazil set for the kick-off (they conceded, so they restart), the scoreboard (5–4, 0:51 → 6–4, 0:50), the
// celebration, the champions. The camera is on the scoreboard while the goal happens.
const C1={bar:A(0,'Barcelona'),lead:A(0,'Brazil lead'),ff:A(0,'five to'),min:A(0,'less than'),tob:A(0,'Then Manoel'),six:A(0,'Six to'),champs:A(0,'Brazil are world'),end:AUTH[0].seconds};
/** the score flips on "scores"; the players are off-camera (under the scoreboard shot) from UP0 to DOWN1 */
const T_FLIP=C1.tob+.95,UP0=C1.min-.3,UP1=C1.min+.7,DOWN0=C1.six-.35,DOWN1=C1.six+.55;
const SPOT:[number,number]=[0,10];
/** where Brazil celebrate (inferred: just inside Spain's half — no claim about where the goal was scored) */
const CEL:[number,number]=[-5.6,9.4];
/** Manoel Tobias: in Brazil's half for the kick-off → (off-camera) → arms up in the middle of the celebration */
const F0:[number,number]=[2.3,12.3];
const offCam=(T:number)=>sm(UP1,DOWN0,T,easeIO);
const liveF:Gen=T=>{const u=offCam(T),X=lerp(lerp(F0[0]+1.3,F0[0],sm(0,C1.min,T,easeIO)),CEL[0],u),Z=lerp(lerp(F0[1]+.7,F0[1],sm(0,C1.min,T,easeIO)),CEL[1],u);
 let pose=blendPose(runCycle(T*runCadence(.15),{speed:.15}),stand(),sm(C1.min-.8,C1.min,T));
 pose=blendPose(pose,celebrate((T-DOWN0)*1.05,{kind:'arms'}),sm(DOWN0-.2,DOWN0,T));
 return{pose,yaw:u>0?lerp(FACE_LEFT,FACE_CAMERA+.25,sm(DOWN0-.4,DOWN0,T)):FACE_LEFT,X,Z};};
/** Brazil's other four (yellow): #0 on the centre spot for the kick-off, the rest in place; then round him */
const BRA_A:[number,number][]=[[1.6,9.2],[5.2,6.8],[6.4,13.2],[9.5,9.8]],BRA_B:[number,number][]=[[.42,10.12],[3.4,5.6],[4.4,14.6],[7.2,10.1]];
const BRA_C:[number,number][]=[[1.05,.55],[-1.1,.8],[.5,-1],[-.75,-.95]];
const liveBra=(i:number):Gen=>T=>{const u=sm(0,C1.min,T,easeIO),g=offCam(T);
 const x0=lerp(BRA_A[i][0],BRA_B[i][0],u),z0=lerp(BRA_A[i][1],BRA_B[i][1],u),X=lerp(x0,CEL[0]+BRA_C[i][0],g),Z=lerp(z0,CEL[1]+BRA_C[i][1],g);
 let pose=blendPose(runCycle(T*runCadence(.15)+i*.3,{speed:.15}),stand(),sm(C1.min-.6,C1.min,T));
 pose=blendPose(pose,i%2?celebrate((T-DOWN0)*1.1+i*.25,{kind:'arms'}):celebrate((T-DOWN0)*1.1+i*.3,{kind:'run'}),sm(DOWN0-.2,DOWN0,T));
 const home=u<1?yawTo(BRA_B[i][0]-BRA_A[i][0],BRA_B[i][1]-BRA_A[i][1]):FACE_LEFT,hug=yawTo(-BRA_C[i][0],-BRA_C[i][1]);
 return{pose,yaw:g>0?lerp(home,hug,sm(DOWN0-.4,DOWN0,T)):home,X,Z};};
/** Spain (red): jog back from their 5–4 into their own half, set outside the circle; afterwards heads down, hands on hips */
const ESP_A:[number,number][]=[[6.2,6.2],[7.6,13.4],[4.6,9.4],[3.9,15.4]],ESP_B:[number,number][]=[[-3.3,6.3],[-3.2,13.9],[-5.6,9.6],[-8.6,12.3]];
const ESP_C:[number,number][]=[[-8.4,5.4],[-9.8,13.6],[-11.6,9],[-13.4,11.8]];
const liveSpain=(i:number):Gen=>T=>{const u=sm(0,C1.min+.3,T,easeIO),g=offCam(T),post=sm(DOWN0-.3,DOWN0,T);
 const X=lerp(lerp(ESP_A[i][0],ESP_B[i][0],u),ESP_C[i][0],g),Z=lerp(lerp(ESP_A[i][1],ESP_B[i][1],u),ESP_C[i][1],g);
 let pose=u<1?blendPose(celebrate(T*1.1+i*.25,{kind:'run'}),runCycle(T*runCadence(.35)+i*.2,{speed:.35}),sm(.3,1.2,T)):backpedal(T*1.2+i*.3);
 pose=blendPose(pose,backpedal(T*1.2+i*.3),sm(C1.min,C1.min+.4,T));
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:24,rShA:24,lElb:100,rElb:100,lShF:-20,rShF:-20}),post);
 const yaw=u<1?FACE_LEFT:lerp(FACE_LEFT,FACE_RIGHT+(i%2?.3:-.3),sm(C1.min+.3,C1.min+.9,T));
 return{pose,yaw:lerp(yaw,FACE_LEFT+.5*(i%2?1:-1),post),X,Z};};
/** Jesús: set on his line (mostly off-frame in this wide shot) */
const liveK:Gen=T=>({pose:blendPose(keeperSet(T*1.3),posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:16,neckP:42,lShA:12,rShA:12,lElb:30,rElb:30}),sm(DOWN0-.3,DOWN0,T)),yaw:FACE_RIGHT,X:GOAL_X+.85,Z:10.05});
/** the centre-hung scoreboard (a rendering device; the arena's real board is not documented): over the halfway line, 6.6 m up */
const BOARD:V3=[0,6.6,10];
const SEGS:Record<string,number[][]>={a:[[0,0],[1,0]],b:[[1,0],[1,1]],c:[[1,1],[1,2]],d:[[0,2],[1,2]],e:[[0,1],[0,2]],f:[[0,0],[0,1]],g:[[0,1],[1,1]]};
const DIGITS:Record<string,string>={'0':'abcdef','1':'bc','2':'abged','3':'abgcd','4':'fgbc','5':'afgcd','6':'afgedc','7':'abc','8':'abcdefg','9':'abfgcd','-':'g'};
function glyphs(str:string,x0:number,y0:number,gw:number,path:Path2D){const th=gw*.3;[...str].forEach((ch,ci)=>{const ox=x0+ci*gw*1.6;
 if(ch===':'){path.rect(ox+gw*.25,y0+gw*.45,th,th);path.rect(ox+gw*.25,y0+gw*1.3,th,th);return;}
 for(const sg of DIGITS[ch]??''){const[[a0,b0],[a1,b1]]=SEGS[sg],x=ox+Math.min(a0,a1)*gw-th/2,y=y0+Math.min(b0,b1)*gw-th/2,w=a0===a1?th:gw+th,h=b0===b1?th:gw+th;path.rect(x,y,w,h);}});}
function scoreboard(s:Sheet,st:Stage,T:number){
 const c=proj(st,BOARD[0],BOARD[1],BOARD[2]),k=kAt(st,BOARD[2]),w=4.2*k,h=2.3*k,x=c[0]-w/2,y=c[1]-h/2,flip=easeOutBack(sm(T_FLIP,T_FLIP+.3,T)),fl=pulse(T,T_FLIP,.9);
 const cables=new Path2D();for(const dx of[-.35,.35]){cables.addPath(ribbon([[c[0]+dx*w,y-6*k],[c[0]+dx*w,y]],Math.max(3,k*.04),{seed:520+dx*10,taper:0,wobble:.3}));}s.fill(K,cables,.8);
 const box=polyPath(handCut([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],501,4,40),true);s.knockout(box);s.fill(K,box,.95);
 // team chips: Brazil yellow left, Spain red right
 const cy=rectPath(x+w*.06,y+h*.12,w*.14,h*.3),cr=rectPath(x+w*.8,y+h*.12,w*.14,h*.3);s.knockout(cy);s.knockout(cr);s.fill(Y,cy);s.fill(R,cr);
 const gw=h*.17,sc=new Path2D(),lead=T<T_FLIP?'5':'6';
 const sy=y+h*.1-(T>=T_FLIP?(1-flip)*gw*.8:0);glyphs(lead,x+w*.3,sy,gw,sc);glyphs('-',x+w*.3+gw*1.6,y+h*.1,gw,sc);glyphs('4',x+w*.3+gw*3.2,y+h*.1,gw,sc);
 s.knockout(sc);s.fill(Y,sc,.95);
 const ck=new Path2D(),cw=h*.1;glyphs(T<T_FLIP?'0:51':'0:50',c[0]-cw*3.1,y+h*.6,cw,ck);s.knockout(ck);s.fill(R,ck,.9);
 if(fl>.02)sparkBurst(s,Y,x+w*.3+gw*.5,y+h*.28,w*.28,{n:12,seed:530,g:easeOut(sm(T_FLIP,T_FLIP+.3,T))*(1-sm(T_FLIP+.6,T_FLIP+1,T))});
}
const liveCam=(T:number)=>({x:key(T,mono([[0,2],[C1.lead,1],[C1.min,.2],[UP1,0],[DOWN0,0],[DOWN1,CEL[0]+.2],[C1.end,CEL[0]]]),easeInOutSine),
 zoom:key(T,mono([[0,.62],[UP0,.66],[UP1,.8],[T_FLIP,.86],[DOWN0,.84],[DOWN1,.72],[C1.champs,.74],[C1.end,.9]]),easeInOutSine),
 y:key(T,mono([[0,1060],[UP0,1050],[UP1,80],[DOWN0,60],[DOWN1,1030],[C1.end,1040]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const champs=sm(C1.champs,C1.champs+.3,T);
 courtSide(s,st,T,{cheer:T>=T_FLIP?1-.3*sm(C1.end-1.5,C1.end,T):.15,flash:pulse(T,T_FLIP,1.2)+.8*pulse(T,C1.champs,1.4),keeper:()=>{athlete(s,st,liveK,T,JESUS,{detail:'low'});}});
 scoreboard(s,st,T);
 type It={z:number;draw:()=>void};const items:It[]=[];
 ESP_A.forEach((_,i)=>{const g=liveSpain(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i),{detail:'low'})});});
 BRA_A.forEach((_,i)=>{const g=liveBra(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,BRA(i),{detail:'low'})});});
 items.push({z:liveF(T).Z-.01,draw:()=>athlete(s,st,liveF,T,TOBIAS)});
 // the ball waits on the centre spot for the kick-off (hidden once the camera is up on the scoreboard)
 if(T<UP1){const p=proj(st,SPOT[0],BALL_R,SPOT[1]),r=Math.max(9,kAt(st,SPOT[1])*BALL_R);items.push({z:SPOT[1]-.3,draw:()=>{shadow(s,p[0],p[1]+r*.9,r*1.1,r*.3,16,.45);ball(s,p[0],p[1],r,18);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "world champions": yellow, blue and paper confetti over the celebration
 if(champs>0){const f=liveF(T),g=proj(st,f.X,0,f.Z),u=sm(C1.champs,C1.champs+3,T,linear);confetti(s,[Y,B,'paper'],[g[0]-1100,g[1]-900+u*500,2200,520],28,Math.floor(T*6),{size:16});}
}
/** a figure's chest ring on stage st (the passage enters his yellow shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveF(tt),.12));},still:T_FLIP+.4};

// ================= chapter 2 — THE MOVE ON HIS CARD (demonstration, slow motion, low behind him): 1v1 from the right, slip, toe-poke =================
const C2={move:A(1,'This is'),one:A(1,'one v'),toe:A(1,'and the toe'),watch:A(1,'Watch'),takes:A(1,'He takes'),slip:A(1,'slips'),pokes:A(1,'Then he'),with:A(1,'with his'),before:A(1,'before the'),goal:A(1,'Goal'),end:AUTH[1].seconds};
/** the replay camera: low, behind-LEFT of him (so he never hides the keeper), looking up the court at the goal */
const st2:Stage={F:1500,eye:2,cx:-1.5,cz:-3.2};
/** slow motion: the poke lands on "with his toe"; the ball crawls past the unset keeper and hits the net on "Goal" */
const T_POKE=C2.with+.35,T_IN2=Math.max(T_POKE+1.4,C2.goal-.1),SL0=C2.slip-.4,SL1=C2.slip+.55;
const B0:[number,number]=[3.7,1.75],B1:[number,number]=[2.85,3.95],B2:[number,number]=[1.42,5.6],BP:[number,number]=[1.22,5.98];
const TG2:V3=[-1.1,.24,GZ+.02];
const YAW_P=yawTo(TG2[0]-BP[0],TG2[2]-BP[1]);
const PB=toMine(contactBall(toePoke(TOE_CONTACT),YAW_P)),PPL:[number,number]=[BP[0]-PB[0],BP[1]-PB[2]];
const DEF:[number,number]=[2.78,5.05],KP0:[number,number]=[.15,GZ-.85];
function demoBall(t:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 const at=(a:[number,number],b:[number,number],u:number,sp:number)=>({X:lerp(a[0],b[0],u),Y:BALL_R,Z:lerp(a[1],b[1],u),flying:false,spin:sp});
 if(t<C2.watch)return at(B0,B0,0,0);
 if(t<SL0){const u=sm(C2.watch,SL0,t,linear);return at(B0,B1,u+.035*Math.sin(u*TAU*3),u*6);}
 if(t<SL1)return at(B1,B2,sm(SL0,SL1,t,easeOut),6+sm(SL0,SL1,t)*5);
 if(t<T_POKE)return at(B2,BP,sm(SL1,T_POKE-.05,t,easeOut),11+sm(SL1,T_POKE,t)*2);
 if(t<T_IN2){const u=sm(T_POKE,T_IN2,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(BP[0],TG2[0],.5),.42,lerp(BP[1],TG2[2],.5)];
  return{X:a*BP[0]+b*M[0]+c*TG2[0],Y:a*BALL_R+b*M[1]+c*TG2[1],Z:a*BP[1]+b*M[2]+c*TG2[2],flying:true,spin:13+u*20};}
 const d=sm(T_IN2+.1,T_IN2+.7,t,easeIn);return{X:TG2[0],Y:lerp(TG2[1],BALL_R,d),Z:GZ+.6,flying:false,spin:33};
}
/** the cut: inside of the right foot drags the ball across his body to the left, past the lunge */
const CUT=posed({rHipF:26,rKnee:28,rAnk:-6,rHipA:-18,rHipR:34,lHipF:20,lKnee:44,lAnk:-4,lean:18,bend:-10,twist:-14,lShA:62,rShA:42,lElb:40,rElb:44,neckP:34});
const dirP=(()=>{const x=BP[0]-B2[0],z=BP[1]-B2[1],l=Math.hypot(x,z);return[x/l,z/l] as [number,number];})();
const TPATH:[number,number,number][]=[[0,B0[0]+.2,B0[1]-.56],[C2.watch,B0[0]+.2,B0[1]-.56],[SL0,B1[0]+.2,B1[1]-.5],[C2.slip+.1,2.5,4.1],[SL1,1.98,4.72],[T_POKE-.75,PPL[0]-dirP[0]*.3,PPL[1]-dirP[1]*.3],[T_POKE,PPL[0],PPL[1]],[T_POKE+.9,PPL[0]+.12,PPL[1]+.28],[C2.end,PPL[0]+.12,PPL[1]+.28]];
const demoF:Gen=t=>{
 const X=key(t,TPATH.map(k=>[k[0],k[1]] as Key),linear),Z=key(t,TPATH.map(k=>[k[0],k[2]] as Key),linear);
 const tp=key(t,[[T_POKE-.75,0],[T_POKE,TOE_CONTACT],[T_POKE+1,1]],linear);
 const dri=(tt:number)=>dribble((tt-C2.watch)*.9+.2,{foot:'r',speed:.3});
 let pose:Pose,yaw=yawTo(B1[0]-B0[0],B1[1]-B0[1]);
 if(t<C2.watch)pose=blendPose(stand(),posed({lHipF:16,rHipF:8,lKnee:24,rKnee:20,lean:12,neckP:30,lShA:22,rShA:22,lElb:36,rElb:36}),.5+.5*Math.sin(t*2.2));
 else if(t<SL0)pose=blendPose(stand(),dri(t),sm(C2.watch,C2.watch+.3,t));
 else if(t<SL1){pose=keyPoses(t,[[SL0,dri(SL0)],[C2.slip+.08,CUT],[SL1,runCycle(.1,{speed:.45})]]);yaw=lerp(yaw,yawTo(-.8,1),sm(SL0,SL1,t,easeIO));}
 else if(t<T_POKE-.75){pose=runCycle(.1+(t-SL1)*runCadence(.45)*.45,{speed:.45});yaw=yawTo(dirP[0],dirP[1]);}
 else{pose=blendPose(runCycle(.1+(T_POKE-.75-SL1)*runCadence(.45)*.45,{speed:.45}),toePoke(tp),sm(T_POKE-.75,T_POKE-.6,t));yaw=lerp(yawTo(dirP[0],dirP[1]),YAW_P,sm(T_POKE-.75,T_POKE-.45,t));}
 if(t>C2.goal-.1){const u=sm(C2.goal-.1,C2.goal+.5,t,easeIO);pose=blendPose(pose,celebrate((t-C2.goal)*1.1,{kind:'arms'}),u);yaw=lerp(YAW_P,FACE_CAMERA+.6,u);}
 return{pose,yaw,X,Z};
};
/** the defender: faces him, shuffles back, lunges to his right (screen-left) at the slip — too late; turns to watch */
const demoD:Gen=t=>{const f=demoF(t),lu=key(t,[[SL0-.1,0],[C2.slip+.35,.6],[SL1+1.3,.85]],linear),turn=sm(T_POKE,T_POKE+1.2,t,easeIO);
 let pose=blendPose(backpedal(t*.7),lunge(lu,{side:'r'}),sm(SL0-.2,SL0,t));pose=blendPose(pose,posed({lHipF:20,rHipF:30,lKnee:40,rKnee:40,lean:14,neckY:20,lShA:30,rShA:30,lElb:40,rElb:40}),turn*.6);
 const back=.3*sm(C2.takes,SL0,t,easeIO);
 return{pose,yaw:lerp(yawTo(f.X-DEF[0],f.Z-DEF[1]),FACE_AWAY-.4,turn),X:DEF[0]-.05*back,Z:DEF[1]+back};};
/** the keeper: set, then shuffling across to the ball side (mid-step, NOT set) as the poke comes; dives late to his right */
const SHUFFLE=posed({lHipF:36,rHipF:40,lKnee:56,rKnee:62,lHipA:26,rHipA:6,lAnk:10,air:.06,lean:22,lShA:40,rShA:40,lShF:30,rShF:30,lElb:50,rElb:50,lHand:1,rHand:1,neckP:10});
const demoK:Gen=t=>{const sh=sm(SL1-.3,T_POKE+.3,t,easeIO),step=Math.abs(Math.sin(sm(SL1-.3,T_POKE+.3,t)*Math.PI*2)),du=key(t,[[T_POKE+.6,0],[T_IN2+.1,.5],[T_IN2+1.2,.92]],linear);
 let pose=blendPose(keeperSet(t*.6),SHUFFLE,step*(1-sm(T_POKE+.3,T_POKE+.6,t))+.35*sm(T_POKE,T_POKE+.3,t));
 pose=blendPose(pose,keeperDive(du,{side:'r',height:.1}),sm(T_POKE+.55,T_POKE+.7,t));
 return{pose,yaw:FACE_CAMERA,X:KP0[0]+.48*sh,Z:KP0[1]};};
function toeHalo(s:Sheet,st:Stage,t:number,g:number,seed:number){if(g<=.02)return;const f=demoF(t),toe=rToeAt(f.pose,f.X,f.Z,f.yaw),p=proj(st,toe[0],toe[1]+.03,toe[2]),r=.2*kAt(st,toe[2])*g;s.fill(Y,ribbon(blob(p[0],p[1],r*1.25,r,seed,{n:22}),9,{seed:seed+1,close:true,wobble:1}),1);}
/** camera aims (world points on st2) + zoom per cue */
const CAM2:[number,number,number,number,number][]=[[0,1.9,.9,5.5,.8],[C2.one,3.1,.9,3.4,.92],[C2.toe,3.8,.4,1.6,1.1],[C2.watch,3.2,.9,3.2,.92],[C2.takes,2.8,.9,4.2,1.0],[C2.slip,2.0,.9,5.0,1.08],[C2.with,1.0,.8,6.8,1.15],[C2.before,.3,.9,8.5,1.3],[C2.goal,-.4,.9,10,1.45],[C2.end,0,.9,8.5,1.25]];
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,hit=pulse(t,T_POKE,.4),net=pulse(t,T_IN2,.6);
  camPath(s,t,CAM2.map(([tk,X,Yh,Z,zm])=>{const p=proj(st,X,Yh,Z);return[tk,p[0],p[1],zm] as Key;}),[5*hit*Math.sin(t*90),3*hit*Math.cos(t*77)+4*net*Math.sin(t*60)]);
  const b=demoBall(tt),goal=tt>=T_IN2;
  arena(s,st,{t:tt,cheer:goal?1-.3*sm(C2.end-1,C2.end,tt):0,flash:pulse(tt,T_IN2,1.2),bulge:.5*sm(T_IN2-.2,T_IN2,tt)*(1-.6*sm(T_IN2+.4,T_IN2+1.4,tt))+.1*settle(tt,T_IN2,{amp:1,freq:3,decay:3}),bx:TG2[0],by:TG2[1],
   keeper:stg=>{
    // "before the keeper is ready": a yellow halo round him and red brackets — he is mid-step, not set
    const kp=demoK(tt),g=proj(stg,kp.X,0,kp.Z),h=1.8*kAt(stg,kp.Z),on=sm(C2.before,C2.before+.35,tt,easeOut)*(1-sm(C2.goal+.2,C2.goal+.7,tt));
    if(on>.02)s.fill(Y,ribbon(blob(g[0],g[1]-h*.5,h*.42*on,h*.6*on,91,{n:24}),8,{seed:94,close:true,wobble:1}),.9);
    athlete(s,stg,demoK,tt,DEMO_K,{detail:'mid'});
    const fr=easeOutBack(sm(C2.before+.1,C2.before+.4,tt))*(1-sm(C2.goal+.2,C2.goal+.7,tt));
    if(fr>.02){const w=h*.38,hh=h*.58,cx=g[0],cy=g[1]-h*.5,L=h*.14*fr,br=new Path2D();
     for(const[sx,sy] of[[-1,-1],[1,-1],[1,1],[-1,1]] as Pt[]){const x=cx+sx*w,y=cy+sy*hh;br.addPath(ribbon([[x,y-sy*L],[x,y],[x-sx*L,y]],7,{seed:92+sx+sy*3,taper:0,wobble:.6}));}
     s.fill(R,br);}
   }});
  // "one v one": a yellow ring under him, a red ring under the defender, a dashed link between them
  const oneG=easeOutBack(sm(C2.one,C2.one+.35,tt))*(1-sm(C2.watch,C2.watch+.4,tt));
  if(oneG>.02){const f=demoF(tt),d=demoD(tt);floorDashRing(s,st,Y,f.X,f.Z,.55,10,201,oneG);floorDashRing(s,st,R,d.X,d.Z,.55,10,202,oneG);
   dashed(s,Y,[proj(st,f.X-.1,0,f.Z+.5),proj(st,(f.X+d.X)/2,0,(f.Z+d.Z)/2),proj(st,d.X+.05,0,d.Z-.5)],9,203,{dash:30,progress:oneG});}
  // "and the toe-poke": a halo round his right toe
  // "He takes on the defender": a dashed run arrow at the defender
  if(tt>=C2.takes-.1&&tt<SL1){const u=sm(C2.takes-.1,C2.takes+.6,tt,easeOut)*(1-sm(C2.slip,SL1,tt)),pts=[proj(st,B0[0],0,B0[1]+.3),proj(st,(B0[0]+B1[0])/2,0,(B0[1]+B1[1])/2+.2),proj(st,B1[0]+.05,0,B1[1]+.45)];if(u>.02){dashed(s,Y,pts,11,205,{dash:34,progress:u});if(u>.9)arrowHead(s,Y,pts,30,206);}}
  // "slips past": the ball's dashed path inside, and a red arrow for the lunge going the wrong way
  if(tt>=SL0&&tt<T_IN2+.5){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=demoBall(lerp(SL0,Math.min(tt,SL1),k/10));pts.push(proj(st,q.X,0,q.Z));}const fade=1-sm(T_POKE,T_POKE+.6,tt);if(fade>.05){dashed(s,Y,pts,11,207,{dash:30,cov:fade});if(tt>SL1-.2)arrowHead(s,Y,pts,30,208,fade);}}
  if(tt>=C2.slip-.1){const u=sm(C2.slip-.1,C2.slip+.5,tt,easeOut)*(1-sm(T_POKE-.3,T_POKE+.2,tt)),a=proj(st,DEF[0]-.2,0,DEF[1]-.1),c=proj(st,DEF[0]-1.2,0,DEF[1]-.35),pts=[a,L2(a,c,.5),c];
   if(u>.02){const q=partial(pts,u),rp=ribbon(q,12,{seed:209,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(u>.5)arrowHead(s,R,q,30,210);}}
  // the flight line (dashed yellow, drawn as the ball goes) and the ball
  if(tt>T_POKE){const pts:Pt[]=[];for(let k=0;k<=16;k++){const q=demoBall(lerp(T_POKE,Math.min(tt,T_IN2),k/16));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,10,211,{dash:36});}
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.1,r*.3,212,b.flying?.3:.45);
   if(b.flying&&tt<T_IN2-.1){const a=proj(st,BP[0],BALL_R,BP[1]);speedLines(s,Y,p[0],p[1],Math.atan2(a[1]-p[1],a[0]-p[0]),{n:4,seed:213,len:r*3,spread:r*1.3,width:5});}
   ball(s,p[0],p[1],r,214,{rot:b.spin,smear:b.flying?.35:0,dir:Math.atan2(proj(st,BP[0],0,BP[1])[1]-p[1],proj(st,BP[0],0,BP[1])[0]-p[0])});
   if(tt>=T_POKE&&tt<T_POKE+.5)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:215,g:easeOut(sm(T_POKE,T_POKE+.35,tt))*(1-sm(T_POKE+.35,T_POKE+.5,tt))});};
  const f=demoF(tt),d=demoD(tt);
  const its:{z:number;draw:()=>void}[]=[
   {z:d.Z,draw:()=>athlete(s,st,demoD,tt,DEMO_D,{detail:'high',smear:tt>SL0&&tt<C2.slip+.5?.2:0})},
   {z:f.Z,draw:()=>athlete(s,st,demoF,tt,TOBIAS,{detail:'high',smear:(tt>SL0&&tt<SL1)||(tt>T_POKE-.3&&tt<T_POKE+.3)?.22:0})},
   {z:!b.flying&&tt<T_POKE&&b.Z<f.Z+.45?f.Z+.01:b.Z,draw:drawBall},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  toeHalo(s,st,tt,easeOutBack(sm(C2.toe,C2.toe+.35,tt))*(1-sm(C2.watch-.2,C2.watch+.2,tt)),204);
  if(tt>=T_IN2&&tt<T_IN2+1.2){const p=proj(st,TG2[0],TG2[1]+.3,GZ+.4);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:216,g:easeOut(sm(T_IN2,T_IN2+.3,tt))*(1-sm(T_IN2+.8,T_IN2+1.2,tt))});}
 },
 aperture(t0){const{tt}=clock(1,t0),st=st2,b=demoBall(tt),p=proj(st,b.X,b.Y,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R)*1.1,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return aperture(q);},
 still:T_POKE+.2,
};

// ================= chapter 3 — TRY IT: side view; the big swing crossed out, the short toe-poke swing; the poke beats the keeper =================
const C3={try:A(2,'Try'),swing:A(2,'no big'),quick:A(2,'so it'),surp:A(2,'It surprises'),ready:A(2,'before they'),end:AUTH[2].seconds};
const st3:Stage={F:2400,eye:1.1,cx:-15.4,cz:-1.2};
const BALL3:[number,number]=[-14.7,8.3],TG3:V3=[GOAL_X+.2,.3,9.75];
const YAW3=yawTo(TG3[0]-BALL3[0],TG3[2]-BALL3[1]);
const PB3=toMine(contactBall(toePoke(TOE_CONTACT),YAW3)),PL3:[number,number]=[BALL3[0]-PB3[0],BALL3[1]-PB3[2]];
const T_P3=C3.surp+.12,T_IN3=T_P3+.36;
const tp3=(t:number)=>key(t,[[T_P3-.42,0],[T_P3,TOE_CONTACT],[T_P3+.4,.78],[T_P3+1.1,1]],linear);
const tryF:Gen=t=>{let pose=blendPose(stand(),posed({lHipF:16,rHipF:10,lKnee:26,rKnee:22,lean:12,neckP:30,lShA:22,rShA:22,lElb:36,rElb:36}),.5+.5*Math.sin(t*2.4));
 pose=blendPose(pose,toePoke(tp3(t)),sm(C3.quick,T_P3-.42,t,easeIO));
 const cel=sm(C3.ready+.2,C3.ready+.7,t,easeIO);if(cel>0)pose=blendPose(pose,celebrate((t-C3.ready)*1.1,{kind:'arms'}),cel);
 return{pose,yaw:lerp(YAW3,FACE_CAMERA+.4,cel),X:PL3[0],Z:PL3[1]};};
function tryBall(t:number):{X:number;Y:number;Z:number;flying:boolean}{
 if(t<T_P3)return{X:BALL3[0],Y:BALL_R,Z:BALL3[1],flying:false};
 if(t<T_IN3){const u=sm(T_P3,T_IN3,t,linear);return{X:lerp(BALL3[0],TG3[0],u),Y:lerp(BALL_R,TG3[1],u)+.12*Math.sin(u*Math.PI),Z:lerp(BALL3[1],TG3[2],u),flying:true};}
 const d=sm(T_IN3+.1,T_IN3+.5,t,easeIn);return{X:GOAL_X-.6,Y:lerp(TG3[1],BALL_R,d),Z:TG3[2],flying:false};}
/** the keeper: bouncing on his toes (not set) as the poke comes; dives after it has gone */
const tryK:Gen=t=>{const du=key(t,[[T_IN3-.04,0],[T_IN3+.45,.5],[T_IN3+1.1,.9]],linear);
 return{pose:blendPose(keeperSet(t*1.4),keeperDive(du,{side:'r',height:.1}),sm(T_IN3-.06,T_IN3+.06,t)),yaw:FACE_RIGHT,X:GOAL_X+.8,Z:10.05};};
/** the toe path of a kick drawn as a floor-to-air arc (world → sheet), for the swing comparison */
function toeArc(st:Stage,gen:(u:number)=>Pose,u0:number,u1:number,n=12):Pt[]{const pts:Pt[]=[];for(let k=0;k<=n;k++){const p=rToeAt(gen(lerp(u0,u1,k/n)),PL3[0],PL3[1],YAW3);pts.push(proj(st,p[0],p[1],p[2]));}return pts;}
const BIG=toeArc(st3,u=>strike(u),.22,.62,16),SHORT=toeArc(st3,u=>toePoke(u),.28,.56);
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  camPath(s,t,[[0,240,60,1.25],[C3.swing,220,30,1.45],[C3.quick,200,40,1.4],[C3.surp-.35,-400,70,.96],[T_IN3+.3,-540,90,1.04],[C3.ready,-580,90,1.1],[C3.end,-560,90,1.08]]);
  const b=tryBall(tt),goal=tt>=T_IN3;
  courtSide(s,st,tt,{cheer:goal?.9*(1-.4*sm(C3.end-1,C3.end,tt)):.1,flash:pulse(tt,T_IN3,1.2),bulge:.45*sm(T_IN3-.1,T_IN3,tt)*(1-.6*sm(T_IN3+.3,T_IN3+1.2,tt))+.1*settle(tt,T_IN3,{amp:1,freq:3,decay:3}),bz:TG3[2],by:TG3[1],
   keeper:()=>{
    athlete(s,st,tryK,tt,DEMO_K,{detail:'mid'});
    const k=tryK(tt);
    // "It surprises the keeper": a burst over his head as it goes past
    if(tt>=T_IN3-.05&&tt<T_IN3+.7){const hp=proj(st,k.X,2.1,k.Z);sparkBurst(s,R,hp[0],hp[1],70,{n:8,seed:393,g:easeOut(sm(T_IN3-.05,T_IN3+.25,tt))*(1-sm(T_IN3+.4,T_IN3+.7,tt))});}
   }});
  // "no big swing": the instep strike's long toe path (red, dashed) — then a red cross through it
  const big=sm(C3.swing,C3.swing+.6,tt,easeOut)*(1-sm(C3.surp-.5,C3.surp-.2,tt));
  if(big>.02){dashed(s,R,BIG,15,301,{dash:34,progress:big});if(big>.95)arrowHead(s,R,BIG,34,302);
   const x=easeOutBack(sm(C3.swing+.75,C3.swing+1.05,tt));if(x>.02){const m=BIG[Math.floor(BIG.length/2)],S=70*x;for(const[a,c] of[[[-1,-1],[1,1]],[[1,-1],[-1,1]]] as Pt[][]){const rp=ribbon([[m[0]+a[0]*S,m[1]+a[1]*S],[m[0]+c[0]*S,m[1]+c[1]*S]],14,{seed:303+a[0],taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);}}}
  // "so it is quick": the toe-poke's short path (yellow)
  const sh=sm(C3.quick,C3.quick+.4,tt,easeOut)*(1-sm(C3.ready,C3.ready+.4,tt));
  if(sh>.02){dashed(s,Y,SHORT,16,304,{dash:26,progress:sh});if(sh>.95)arrowHead(s,Y,SHORT,34,305);}
  // the players and the ball by depth
  const f=tryF(tt),bp=proj(st,b.X,b.Y,b.Z),bg=proj(st,b.X,0,b.Z),br=kAt(st,b.Z)*BALL_R;
  const drawBall=()=>{shadow(s,bg[0],bg[1],br*1.1,br*.3,306,.45);
   if(b.flying){const tr:Pt[]=[];for(let k=0;k<=6;k++){const q=tryBall(Math.max(T_P3,tt-.15+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,br*1.4,{seed:307,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
   ball(s,bp[0],bp[1],br,308,{rot:tt*4,smear:b.flying?.45:0,dir:0});
   if(tt>=T_P3&&tt<T_P3+.35)sparkBurst(s,Y,bp[0],bp[1],br*2.6,{n:9,seed:309,g:easeOut(sm(T_P3,T_P3+.2,tt))*(1-sm(T_P3+.2,T_P3+.35,tt))});};
  const its=[{z:f.Z,draw:()=>athlete(s,st,tryF,tt,TOBIAS,{detail:'high',smear:tt>T_P3-.2&&tt<T_P3+.2?.12:0})},{z:b.flying||goal?b.Z:f.Z-.01,draw:drawBall}];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "before they are ready": a big tick stamps beside the net
  const tick=easeOutBack(sm(C3.ready+.25,C3.ready+.6,tt));
  if(tick>.02){const h=kAt(st,9.4)*1.72,c:Pt=proj(st,GOAL_X+2.2,2.3,9.4),S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:T_IN3+.4,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'manoel-tobias-futsal-signature',format:'futsal',title:'Manoel Tobias’s toe-poke',theme:'Beat your defender, then toe-poke it before the keeper is ready.',
 ageNote:'For players aged 7–12: the 1996 World Cup final and his goal are real; the 1v1 and toe-poke are shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball drops, a navy boot toe jabs it, a yellow streak and rings pop out; reduced motion = the ball at rest. */
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
