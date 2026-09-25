/** Robinho (futsal) — "the Brazilian step-over": a signature-move riso film (iconic plays, FUTSAL, ala).
 *
 * WHO: the FUTSAL Robinho — Edelson Robson dos Santos, born in Brazil in 1983, a winger (ala) who played for RUSSIA (72 caps), Gazprom-Ugra
 * and Benfica — not the Brazil football forward Robson de Souza. The card bio (lib/town/playerBios.json) says the same.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the Brazilian step-over, from the right — not one match. No written
 * source we could reach describes a dated step-over of his. His best-documented moment is his extra-time WINNER in the UEFA Futsal EURO 2014
 * semi-final, Russia 4–3 Spain (a.e.t.), Sportpaleis, Antwerp, 6 Feb 2014 — the goal that ended Spain's nine-year reign as European champions.
 * UEFA's report says HOW it was scored in one line ("Eder Lima sent Robinho free and he made no mistake"), so that goal is recreated as
 * described; the step-over is NOT staged inside that match. It lives in a separate, clearly labelled demonstration ("the move on his card",
 * training kit, neutral defender), never passed off as that semi-final. It is a Russia match, so it does not overlap the other futsal films
 * (the 2014 FINAL is Mammarella's film; the 2016 final is Rivillos's; the 2012 final is Luis Amado's / Sergio Lozano's).
 *  1  LIVE (broadcast camera, high on the main-stand side, real time): 3–3 in extra time, 48:54 on the clock (66 seconds left). Eder Lima
 *     (Russia #8) plays the pass that sends Robinho (#10) free; Robinho finishes past Rafa (Spain #1). The scoreboard turns 3–3 → 4–3.
 *  2  REPLAY (slow motion, low, behind Robinho): the pass into space, the calm finish; he celebrates with Nikolai Pereverzev (#3, captain).
 *  3  THE MOVE ON HIS CARD (a demonstration, no match claimed; lower broadcast side, closer; Robinho in a blue training top, a neutral
 *     navy-bib defender): on the right, he dribbles at the defender, his RIGHT foot circles over the ball from inside to outside (selling a run
 *     down the line), the defender leans that way, and he takes the ball the other way — inside — with the outside of his LEFT foot.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Step over the ball to make the defender lean the wrong way."): the same move from behind
 *     him; three cards (step over, the lean, go the other way); a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - UEFA.com match report, Paul Saffer, "Russia in final as Spain reign ends" (6 Feb 2014), archived 9 Apr 2014:
 *    https://web.archive.org/web/20140409221703/http://www.uefa.com/futsaleuro/season=2014/matches/round=2000400/match=2013139/postmatch/report/index.html
 *    — Sportpaleis, Antwerp, 06/02/2014 20:30; Russia 4–3 Spain aet; goals Pola 16:11, Sergeev 22:20, Lyskov 26:03 (from "a Robinho corner"),
 *    Rafael Usín 26:22, Fukin 26:43, Miguelín 37:57 (as flying keeper, "with two minutes left"), Robinho 48:54; "Spain's bid for a fifth
 *    straight title ended with Robinho's goal late in extra time"; "Robinho's goal 66 seconds from the end of extra time"; "just when it seemed
 *    a shoot-out was needed, Eder Lima sent Robinho free and he made no mistake." Line-ups: Russia 12 Gustavo (GK), 3 Pereverzev (C),
 *    8 Eder Lima, 10 Robinho …; Spain 1 Rafa (GK) … Coaches Sergei Skorovich / José Venancio López.  (cache: uefa-futsal-euro2014-sf-rus-esp-report.*)
 *  - UEFA.com quotes, "Robinho leads Russia celebrations after classic" (7 Feb 2014): Robinho — "It's a beautiful moment … No, I'm not a
 *    hero. All of us are heroes … I just converted my chance."; "one of futsal's greatest games".  (cache: …-quotes.*)
 *  - UEFA.com photo captions (Sportsfile / Getty): "Robinho of Russia scores his team's winning goal"; "Robinho (R) of Russia celebrates with
 *    team-mate Nikolai Pereverzev after scoring his team's winning goal"; "Russia players celebrate".  (cache: …-photos.*)
 *  - Wikipedia, "UEFA Futsal Euro 2014" (raw): semi-final 6 Feb 2014 20:30, Sportpaleis, Russia 4–3 (a.e.t.) Spain, Robinho 49', attendance
 *    8,152; Russia then lost the final 3–1 to Italy.  (cache: wiki-futsal-euro2014.txt)
 *  - Wikipedia, "Robinho (futsal player)" (raw): Edelson Robson dos Santos, b. 28 Jan 1983, Brazil; 1.65 m; winger; Russia 2009–, 72 caps;
 *    Gazprom-Ugra 2006–16, Benfica 2017–22; Euro 2014 and 2016 runner-up, 2016 World Cup runner-up.  (cache: wiki-robinho-futsal.txt)
 *  - UEFA.com commentary of the Futsal EURO 2016 final calls him "the hero of the 2014 semi-final".  (cache: uefa-futsaleuro2016-final-commentary.txt)
 * CONFIRMED: match, date, venue, 3–3 after normal time, extra time, the minute (48:54, 66 s left), Eder Lima's pass sending Robinho free,
 *  Robinho scoring the winner, 4–3, Spain's keeper Rafa, Russia's shirt numbers (#8 Eder Lima, #10 Robinho, #3 Pereverzev), Robinho
 *  celebrating with Pereverzev, Russia into the final. Robinho a winger, 1.65 m. The narration only states these.
 * INFERRED (not named in the narration): kits — Russia white shirts / blue shorts, Spain red shirts / navy shorts, Rafa in a yellow keeper kit;
 *  which end and which side the goal came from (the right, to fit his card), the pass's path, Robinho's shooting foot (right) and the
 *  corner (low, far post), where every other player stood, the wood-look court and the scoreboard's look. No video was reviewed.
 *  Chapters 3–4 are a coaching demonstration of the step-over, not footage of any particular match; the side (right) and feet follow the card.
 * Technique (poses): the step-over is authored from the figure library's figo-signature stepover (a right-leg circle over the ball, the hip
 *  opening outward, the body dipping that way); the exit is a touch with the outside of the left foot, then an acceleration away.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the step-over, the exit and the shot). Choreography lives in one LOCAL court frame (u = metres out from the goal line,
 *  v = across; facing the goal, +v is the attacker's RIGHT); each stage maps it with a proper rotation (no mirror), so the right foot stays the
 *  right foot. Our stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through the
 *  cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagrams), red (Spain, arrows), blue (Russia shorts/trim, training top), navy (key line, stands, shorts).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,stand,runCycle,runCadence,dribble,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill,type Build} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2014 semi-final',text:'The 2014 Futsal Euro semi-final. Russia against Spain, three all, in extra time. Just over a minute left! Eder Lima sends Robinho free, and he makes no mistake. Russia win, four three!',tail:2.4,
  cues:['The 2014','Russia against','three all','extra time','Just over','Eder Lima','sends Robinho','makes no','Russia win','four three'],heads:{'The 2014':'Euro 2014 semi-final','three all':'3–3','Just over':'66 seconds left','four three':'4–3'}},
 {label:'Replay: calm in front of goal',text:'Watch again, slowly. The pass finds Robinho in space. He stays calm and scores. Russia are into the final!',tail:2.2,
  cues:['Watch again','The pass','in space','stays calm','scores','Russia are','final'],heads:{'Watch again':'Slow motion','final':'Into the final'}},
 {label:'The move on his card',text:'Now the move on his card: the Brazilian step-over. His foot circles over the ball, the defender leans, and Robinho goes the other way!',tail:2.4,
  cues:['Now the move','his card','Brazilian','His foot','circles over','the defender','leans','and Robinho','other way'],heads:{'Now the move':'How he does it','Brazilian':'The step-over','other way':''}},
 {label:'Your turn',text:'Your turn: step over the ball to make the defender lean the wrong way!',tail:2.8,
  cues:['Your turn','step over','the ball','make the defender','wrong way'],heads:{'Your turn':'Step over, then go','wrong way':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/robinho-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/robinho-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/robinho-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('robinho: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('robinho: no cue '+w);return c.at;};
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
const bump=(a:number,b:number,t:number)=>Math.min(sm(a,a+.12,t),1-sm(b-.12,b,t));

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the wood */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
/** a yellow dashed line cased in navy (reads on the yellow wood) */
function cased(s:Sheet,pts:Pt[],width:number,seed:number,o:{dash?:number;progress?:number}={}){dashed(s,K,pts,width*1.8,seed,{...o,ko:false,cov:.9});dashed(s,Y,pts,width,seed,{...o});}
function casedHead(s:Sheet,pts:Pt[],size:number,seed:number){arrowHead(s,K,pts,size*1.35,seed,.9);arrowHead(s,Y,pts,size,seed);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
/** a solid red arrow (the defender's lean, the exit) */
function redArrow(s:Sheet,pts:Pt[],w:number,seed:number,progress:number){const q=partial(smoothPts(pts,false,6),progress);if(q.length<2)return;const rp=ribbon(q,w,{seed,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(progress>.6)arrowHead(s,R,q,w*2.6,seed+1);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- the LOCAL court frame: u = metres out from the goal line (0 = the line), v = across (0 = the goal's centre) ----------------
/** a stage frame: where the goal centre sits on the stage floor and the rotation (a proper rotation, never a mirror) */
type Frame={ox:number;oz:number;rot:number};
const toStage=(fr:Frame,u:number,v:number):[number,number]=>{const c=Math.cos(fr.rot),sn=Math.sin(fr.rot);return[fr.ox+u*c-v*sn,fr.oz+u*sn+v*c];};
type Loc={pose:Pose;yaw:number;u:number;v:number};
type LGen=(t:number)=>Loc;

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
/** yaw that faces the floor direction (du,dv) (library yaw 0 faces +u; + turns toward +v) */
const yawTo=(du:number,dv:number)=>Math.atan2(dv,du);
const RB_BUILD:Build={height:1.65,bulk:.96};
const SKIN_R:InkFill[]=[[Y,.7],[R,.2]];
/** Robinho in the semi-final: Russia — white shirt, blue trim and shorts (kit inferred), #10, short dark hair, 1.65 m */
const ROBINHO:AthleteStyle={shirt:'paper',shorts:B,socks:'paper',boots:K,skin:SKIN_R,hair:K,line:K,trim:B,hairStyle:'short',number:10,numberInk:B,build:RB_BUILD,seed:9};
/** Robinho in the demonstration: a blue training top, navy shorts (no match claimed) */
const ROBINHO_TR:AthleteStyle={shirt:B,shorts:K,socks:K,boots:K,skin:SKIN_R,hair:K,line:K,trim:Y,hairStyle:'short',build:RB_BUILD,seed:9};
const RUS=(n:number,num?:number):AthleteStyle=>({shirt:'paper',shorts:B,socks:'paper',boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:B,hairStyle:(['short','bald','curly'] as const)[n%3],number:num,numberInk:B,build:{height:1.72+hash(n,3)*.12},seed:20+n});
const EDER:AthleteStyle={...RUS(1,8),skin:[[Y,.72],[R,.2]],hairStyle:'bald',build:{height:1.8,bulk:1.06},seed:31};
const PERE:AthleteStyle={...RUS(2,3),hairStyle:'short',build:{height:1.78},seed:32};
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.24]],hair:K,line:K,trim:Y,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const RAFA:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.8],[R,.24]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:K,build:{height:1.8},seed:61};
/** the demonstration defender: a neutral navy bib over paper, no team is claimed */
const DEMO_D:AthleteStyle={shirt:[K,.6],shorts:'paper',socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:Y,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
/** THE adapter: draw one athlete from a local generator at time t on stage st / frame fr (prev = one drawn frame earlier; smear = motion echo) */
function athlete(s:Sheet,st:Stage,fr:Frame,gen:LGen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const pl=(l:Loc)=>{const[X,Z]=toStage(fr,l.u,l.v);return placeAt(X,Z,l.yaw+fr.rot);};
 const a=gen(t),b=gen(t-1/12),cm=projector(st);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl(a),{prevPlace:pl(c),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl(a),{prev:b.pose,prevPlace:pl(b)});
}
/** a skeleton in the local frame: joints come back as [u, height, v] */
function jointsL(l:Loc,build:Build=RB_BUILD){const sk=solve(l.pose,build,{x:l.u,z:-l.v,yaw:l.yaw}),J=(j:V3):[number,number,number]=>[j[0],j[1],-j[2]];return{sk,J};}

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
type BallS={u:number;y:number;v:number;flying:boolean;spin:number};
/** a ball drawn on stage st through frame fr, with its floor shadow (a flying ball smears back along its flight from `from`) */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:BallS,seed:number,min=9,from?:[number,number]){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R);let dir=0;
 if(b.flying&&from){const o=fp(st,fr,from[0],from[1],BALL_R);dir=Math.atan2(p[1]-o[1],p[0]-o[0]);}
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?.45:0,dir});return{p,r};
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};

// ---------------- the arena: wood court, stands (Russia and Spain), futsal goal ----------------
/** stepped navy rows, lit faces, red and blue shirts, Russian and Spanish flags, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,flags=true){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),yel=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.24)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.4)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 // flags: Russia (white-blue-red bands) and Spain (red-yellow-red), waving
 for(let f=0;f<(flags?6:0);f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  if(f%2){s.knockout(band(0,1/3));blues.addPath(band(1/3,2/3));reds.addPath(band(2/3,1));}
  else{reds.addPath(band(0,.25));yel.addPath(band(.25,.75));reds.addPath(band(.75,1));}}
 s.fill(Y,heads,.6);s.fill(R,reds);s.fill(B,blues);s.fill(Y,yel);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal goal (3 m × 2 m) on any frame: net halftone + mesh bulging round (bv, by) */
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
/** convex hull of a few points (goal quads seen from any angle stay clean) */
function convex(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo:Pt[]=[],up:Pt[]=[];
 for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}
/** the court's painted lines in the local frame: goal line, the D (6 m quarter circles from the posts), 6 m and 10 m spots, touchlines */
function courtLines(st:Stage,fr:Frame,lines:Path2D,uMax:number){
 const S=(pts:Pt[])=>pts.map(([u,v])=>toStage(fr,u,v) as Pt),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([6*Math.sin(a),-1.5-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([6*Math.sin(a),1.5+6*Math.cos(a)]);}
 lines.addPath(polyPath(floorStrip(st,S([[0,-10],[0,10]]),.05),true));lines.addPath(polyPath(floorStrip(st,S(arc),.05),true));
 for(const u of[6,10]){const[X,Z]=toStage(fr,u,0);lines.addPath(polyPath(floorRing(st,X,Z,.12,12),true));}
 for(const v of[-10,10])lines.addPath(polyPath(floorStrip(st,S([[0,v],[uMax,v]]),.05),true));
}

// ---- SIDE court from the broadcast position (chapters 1 and 3): the goal at X = +20 (Russia attack left → right), the near touchline Z = 0,
//      the far boards Z = 21. FA turns the local frame by π, so +v (the attacker's right) is the NEAR side: Robinho's wing is closest to us ----
const TOUCH_FAR=20,BOARDS=21,FA:Frame={ox:20,oz:10,rot:Math.PI};
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
type CourtOpt={cheer?:number;flash?:number;bulge?:number;bv?:number;by?:number;keeper?:()=>void;flags?:boolean};
function courtSide(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.45);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 const strips=new Path2D(),seams=new Path2D(),X0=st.cx-30,X1=st.cx+30,z00=Math.max(-1,st.cz+.6);
 for(let k=0;k<52;k++){const z0=z00+k*.5,z1=z0+.5;if(z0>BOARDS)break;const a=proj(st,X0,0,z0),b=proj(st,X1,0,z1);if(hash(k,5)>.55)strips.rect(a[0],b[1],b[0]-a[0],a[1]-b[1]);seams.moveTo(a[0],a[1]);seams.lineTo(proj(st,X1,0,z0)[0],a[1]);
  for(let x=Math.floor(X0/2.4)*2.4+hash(k,9)*2.4;x<X1;x+=2.4){const p=proj(st,x,0,z0),q=proj(st,x,0,z1);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,FA,lines,40);
 lines.addPath(polyPath(floorStrip(st,[[0,0],[0,TOUCH_FAR]],.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,FA,bulge,bv,by);o.keeper?.();goalPosts(s,st,FA);
}
// ---- END-ON court (chapters 2 and 4): the camera looks along +Z at the goal (centre X = 0, Z = GZ); the frame is turned so the camera sits
//      behind the attacker, a little off his right shoulder ----
const GZ=11,WALLZ=13.6,FB:Frame={ox:0,oz:GZ,rot:-Math.PI/2-.24};
function arena(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1,flags=true}=o,wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 const floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.45);s.fill(R,floor,.3);
 const strips=new Path2D(),seams=new Path2D(),near=st.cz+.35;
 for(let i=-40;i<40;i++){const X0=i*.5,X1=X0+.5;if(hash(i+40,5)>.55)strips.addPath(polyPath([proj(st,X0,0,near),proj(st,X1,0,near),proj(st,X1,0,WALLZ),proj(st,X0,0,WALLZ)],true));
  const a=proj(st,X0,0,near),b=proj(st,X0,0,WALLZ);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);
  for(let z=near+hash(i,9)*2.2;z<WALLZ;z+=2.2){const p=proj(st,X0,0,z),q=proj(st,X1,0,z);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,FB,lines,Math.max(1,GZ-near+4));s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx,flags);
 goalNet(s,st,FB,bulge,bv,by);o.keeper?.();goalPosts(s,st,FB);
}
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'3':[0,2,3,5,6],'4':[1,2,3,5]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** the arena scoreboard above the far boards: Russia (blue tab) left, Spain (red tab) right; flash = the new goal lights up */
function scoreboard(s:Sheet,st:Stage,camX:number,score:string,flash=0){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX-2.6,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=H*.62,y=top-H+H*.19;
 const tabs=(ink:string,x:number)=>{const p=new Path2D();p.rect(x,top-H+H*.06,W*.16,H*.07);s.fill(ink,p);};tabs(B,cx-W*.38);tabs(R,cx+W*.22);digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,score[2],cx+W*.3-h*.55,y,h);s.fill(Y,lit);
 if(flash>.02){const g=new Path2D();digit(g,score[0],cx-W*.3,y,h);s.fill(R,g,.5*flash);}
}

// ================= THE GOAL (chapters 1–2; local frame, Spain's goal at u = 0): Eder Lima's pass sends Robinho free; he makes no mistake =================
const C1={e2014:A(0,'The 2014'),rus:A(0,'Russia against'),three:A(0,'three all'),extra:A(0,'extra time'),just:A(0,'Just over'),eder:A(0,'Eder'),sends:A(0,'sends'),makes:A(0,'makes'),win:A(0,'Russia win'),four:A(0,'four three'),end:AUTH[0].seconds};
/** the goal's clock (ch1 authored seconds; the replay re-samples it) */
const G=(()=>{const pass=C1.sends+.12,recv=pass+.78,hit=Math.max(recv+.62,C1.makes+.1),inn=hit+.34;return{pass,recv,hit,inn};})();
const RS:[number,number]=[7.4,3.3];// where the pass meets Robinho (in space, right of centre)
const TGT:V3=[-.1,.28,-1.12];// low, inside the far post (local u, y, v)
const SP:[number,number]=[6.1,2.75];// his shooting stance (pelvis) — right foot
const YAW_S=yawTo(TGT[0]-SP[0],TGT[2]-SP[1]);
/** where the ball sits at the right-foot strike's contact (local, relative to the stance) */
const SB:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),RB_BUILD,{yaw:YAW_S}),toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[toe[0]+d[0]/l*.08,-(toe[2]+d[1]/l*.08)];})();
const SHOT:[number,number]=[SP[0]+SB[0],SP[1]+SB[1]];
const EDER_P:[number,number]=[14.4,-1.2];// Eder Lima as he plays the pass
const R0:[number,number]=[12.6,5.4];// Robinho as the move starts (wide right)
const RUN_END:[number,number]=[RS[0]+.5,RS[1]+.26];// his body as the ball arrives
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** Robinho through the goal: drift, sprint into space, a touch, the right-foot finish, then away to celebrate */
const robGoal:LGen=t=>{
 const{pass,recv,hit,inn}=G;
 if(t<pass-.25){const d=sm(0,pass,t,linear);return{pose:blendPose(idle(t,.2),runCycle(t*runCadence(.2),{speed:.2}),.6),yaw:yawTo(-1,-.3),u:R0[0]+1.4*(1-d),v:R0[1]+.2*(1-d)};}
 if(t<recv){const u=sm(pass-.25,recv,t,easeIn),dist=u*Math.hypot(RUN_END[0]-R0[0],RUN_END[1]-R0[1]);return{pose:runCycle(dist/2.1,{speed:.9}),yaw:yawTo(RUN_END[0]-R0[0],RUN_END[1]-R0[1]),u:lerp(R0[0],RUN_END[0],u),v:lerp(R0[1],RUN_END[1],u)};}
 if(t<inn+.35){const s=key(t,[[recv,.05],[hit,STRIKE_CONTACT],[hit+.5,.82],[hit+1,.95]],linear),w=sm(recv,hit-.2,t,easeIO);
  return{pose:strike(s,{foot:'r'}),yaw:lerp(yawTo(RUN_END[0]-R0[0],RUN_END[1]-R0[1]),YAW_S,sm(recv,hit-.25,t,easeIO)),u:lerp(RUN_END[0],SP[0],w)-.3*sm(hit,hit+.7,t,easeOut),v:lerp(RUN_END[1],SP[1],w)};}
 // away to the near corner, arms out, then both arms up
 const c=sm(inn+.35,inn+2.6,t,easeOut),u=lerp(SP[0]-.3,3.2,c),v=lerp(SP[1],6.3,c);
 return{pose:blendPose(strike(.95,{foot:'r'}),t<inn+2.4?celebrate((t-inn)*1.2,{kind:'run'}):celebrate((t-inn)*1.1,{kind:'arms'}),sm(inn+.35,inn+.7,t,easeIO)),yaw:c<.97?yawTo(3.2-SP[0],6.3-SP[1]):-Math.PI*.55,u,v};
};
/** Eder Lima: the ball at his feet in the centre, a few dribble steps, then the pass (right foot) into space */
const EDER_PP=EDER_P;
const PASS_YAW=yawTo(RS[0]-EDER_PP[0],RS[1]-EDER_PP[1]);
const ederGen:LGen=t=>{
 const{pass,inn}=G,t0=pass-.4;
 if(t<t0){const d=sm(0,t0,t,linear);return{pose:dribble(t*1.6,{foot:'r',speed:.25}),yaw:yawTo(-1,-.1),u:EDER_PP[0]+2.2*(1-d)+.35,v:EDER_PP[1]+.2*(1-d)};}
 if(t<inn+.6){const s=key(t,[[t0,.12],[pass,STRIKE_CONTACT],[pass+.6,.85],[pass+1.4,.95]],linear);return{pose:strike(s,{foot:'r',power:.55}),yaw:PASS_YAW,u:EDER_PP[0]+.35,v:EDER_PP[1]};}
 const c=sm(inn+.6,inn+2.8,t,easeOut),u=lerp(EDER_PP[0]+.35,4.7,c),v=lerp(EDER_PP[1],5.2,c);
 return{pose:c<.95?celebrate((t-inn)*1.2+.3,{kind:'run'}):celebrate((t-inn)*1.1+.2,{kind:'arms'}),yaw:yawTo(4.7-EDER_PP[0],5.2-EDER_PP[1]),u,v};
};
/** the ball on Eder Lima's feet (in front of his right foot) */
const PASS_FROM:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.55}),{height:1.8,bulk:1.06},{yaw:PASS_YAW}),toe=sk.rToe;return[EDER_PP[0]+.35+toe[0]+Math.cos(PASS_YAW)*.08,EDER_PP[1]-toe[2]+Math.sin(PASS_YAW)*.08];})();
const ballGoal=(t:number):BallS=>{
 const{pass,recv,hit,inn}=G,t0=pass-.4;
 if(t<t0){const d=sm(0,t0,t,linear),ph=(t*1.6)%1,ahead=.35+.25*Math.sin(ph*TAU);return{u:PASS_FROM[0]+2.2*(1-d)-ahead+.3,v:PASS_FROM[1]+.2*(1-d),y:BALL_R,flying:false,spin:t*8};}
 if(t<pass){const u=sm(t0,pass,t,easeIO);return{u:lerp(PASS_FROM[0]-.05,PASS_FROM[0],u),v:PASS_FROM[1],y:BALL_R,flying:false,spin:t*8};}
 if(t<recv){const u=sm(pass,recv,t,easeOut);return{u:lerp(PASS_FROM[0],RS[0],u),v:lerp(PASS_FROM[1],RS[1],u),y:BALL_R,flying:false,spin:8+u*14};}
 if(t<hit){const u=sm(recv,hit,t,easeOut);return{u:lerp(RS[0],SHOT[0],u),v:lerp(RS[1],SHOT[1],u),y:BALL_R,flying:false,spin:22+u*6};}
 if(t<inn){const u=sm(hit,inn,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M=[lerp(SHOT[0],TGT[0],.5),.34,lerp(SHOT[1],TGT[2],.5)];
  return{u:a*SHOT[0]+b*M[0]+c*TGT[0],y:a*BALL_R+b*M[1]+c*TGT[1],v:a*SHOT[1]+b*M[2]+c*TGT[2],flying:true,spin:30+u*30};}
 const d=sm(inn+.05,inn+.35,t,easeIn),bo=Math.abs(Math.sin(sm(inn+.35,inn+1.1,t)*Math.PI*2))*.1*(1-sm(inn+.35,inn+1.1,t));
 return{u:-.6,y:lerp(TGT[1],BALL_R,d)+bo,v:TGT[2]+.08,flying:false,spin:60};
};
/** Rafa: set, steps out to narrow the angle as the pass goes, dives to his right (the far post) at the shot — beaten */
const rafaGen:LGen=t=>{
 const{pass,hit}=G,out=sm(pass+.1,hit-.15,t,easeIO),u=lerp(.7,1.9,out),v=lerp(.1,1.3,out),yaw=lerp(0,yawTo(SHOT[0]-1.9,SHOT[1]-1.3),out);
 const d=sm(hit+.04,hit+.6,t,linear);let pose=keeperSet(t*1.3);if(d>0)pose=keeperDive(Math.min(.95,.25+d*.7),{side:'r'});
 return{pose,yaw,u,v};
};
/** the Spain four (red): one on Eder Lima, the one Robinho runs off (he turns and chases), two across */
const ESP_P:[number,number][]=[[12.6,-1.8],[9.8,2.4],[8.6,-4.4],[16.2,4.8]];
const espGen=(i:number):LGen=>t=>{
 const{pass,recv,hit,inn}=G,p=ESP_P[i];
 if(i===1){// the defender Robinho runs past: backpedal, then turn and chase (too late)
  const ch=sm(pass+.1,hit,t,easeIn),u=lerp(p[0],SP[0]+1.5,ch),v=lerp(p[1],SP[1]-.5,ch);
  const pose=ch<.02?backpedal(t*1.1):runCycle(t*runCadence(.8),{speed:.8});return{pose,yaw:ch<.02?0:yawTo(SP[0]-p[0],SP[1]-.5-p[1]),u,v};}
 if(i===0){const f=sm(0,pass,t,linear);return{pose:t<recv?backpedal(t*1.2):stand(),yaw:yawTo(EDER_PP[0]-p[0],EDER_PP[1]-p[1]),u:lerp(p[0]+1.4,p[0],f),v:p[1]};}
 const f=sm(pass,inn,t,easeIO),u=lerp(p[0],p[0]-1.6,f),v=lerp(p[1],p[1]+.8,f);
 return{pose:t>pass&&t<inn?runCycle(t*runCadence(.5),{speed:.5}):t>=inn?blendPose(stand(),posed({lean:30,neckP:40,lShF:-10,rShF:-10}),sm(inn,inn+.6,t)):idle(t,i*.4),yaw:yawTo(-1,.2),u,v};
};
/** the other Russians: Pereverzev (#3, captain) deep, one on the left; both join the celebration */
const rusGen=(i:number):LGen=>t=>{
 const{pass,inn}=G,p:[number,number]=i===0?[19.4,1.4]:[11.2,-6.2];
 if(t<inn+.3){const f=sm(pass,inn,t,easeIO);return{pose:t>pass?runCycle(t*runCadence(.5)+i*.3,{speed:.5}):idle(t,i*.6),yaw:yawTo(-1,0),u:p[0]-f*2.2,v:p[1]};}
 const c=sm(inn+.3,inn+3.4,t,easeOut),tg:[number,number]=i===0?[4,7.1]:[2.5,5.5],s:[number,number]=[p[0]-2.2,p[1]];
 return{pose:c<.95?runCycle(t*runCadence(1)+i*.3,{speed:1}):celebrate((t-inn)*1.1+i*.3,{kind:'arms'}),yaw:yawTo(tg[0]-s[0],tg[1]-s[1]),u:lerp(s[0],tg[0],c),v:lerp(s[1],tg[1],c)};
};
const RUS_STY=[PERE,RUS(4)];
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];
/** the chest of a figure (the passage enters the shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1,build:Build=RB_BUILD):Pt[]{const{sk,J}=jointsL(l,build),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
function jointPt(st:Stage,fr:Frame,l:Loc,name:'lHa'|'rHa'|'chest'|'pelvis'|'rToe'|'lToe'|'head'|'rKn'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};

// ================= chapter 1 — LIVE: the semi-final, 3–3 in extra time, 66 seconds left; the pass, the run, the finish; 4–3 =================
const liveCam=(T:number)=>({x:key(T,mono([[0,6.2],[C1.rus,6.8],[C1.just,8.2],[C1.eder,8.8],[G.pass,11.4],[G.recv,14.4],[G.hit,16],[G.inn+.4,16.3],[C1.four,16.2],[C1.end,16.2]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.rus,.6],[C1.just,.66],[C1.eder,.72],[G.pass,.72],[G.hit,.74],[G.inn+.5,.8],[C1.four,.84],[C1.end,.86]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.eder,1040],[G.hit,1060],[G.inn+.5,1080],[C1.four,1070],[C1.end,1080]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),{pass,hit,inn}=G;
 cam(s,0,c.y,c.zoom);
 const goal=T>=inn;
 courtSide(s,st,T,{cheer:goal?1:.12,flash:goal?pulse(T,inn,1.3)+.5*pulse(T,C1.four,1.2):0,bulge:.55*sm(inn-.1,inn,T)*(1-.6*sm(inn+.3,inn+1.3,T))+.1*settle(T,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
  keeper:()=>{athlete(s,st,FA,rafaGen,T,RAFA,{detail:'low'});}});
 scoreboard(s,st,c.x,goal?'4-3':'3-3',goal?pulse(T,inn,1.4):0);
 const items:Item[]=[];
 ESP_P.forEach((_,i)=>{const g=espGen(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,ESP(i),{detail:'low'})});});
 [0,1].forEach(i=>{const g=rusGen(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,RUS_STY[i],{detail:'low'})});});
 items.push({z:depth(FA,ederGen(T)),draw:()=>athlete(s,st,FA,ederGen,T,EDER,{detail:'low'})});
 items.push({z:depth(FA,robGoal(T))-.02,draw:()=>athlete(s,st,FA,robGoal,T,ROBINHO,{detail:'mid',smear:T>hit-.12&&T<hit+.2?.12:0})});
 const b=ballGoal(T);items.push({z:depth(FA,b)-.01,draw:()=>{drawBallL(s,st,FA,b,18,9,SHOT);if(T>=hit&&T<hit+.3){const p=fp(st,FA,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],90,{n:9,seed:19,g:easeOut(sm(hit,hit+.25,T))});}}});
 // "Robinho": a red dashed ring under him before the pass; "sends": the pass line (cased yellow) as it is played
 const rl=robGoal(T),[RX,RZ]=toStage(FA,rl.u,rl.v),ring=easeOutBack(sm(C1.eder-.1,C1.eder+.3,T))*(1-sm(pass+.3,pass+.7,T));
 if(ring>.02)items.push({z:RZ+.9,draw:()=>{floorDashRing(s,st,K,RX,RZ,1.1,20,50,ring);floorDashRing(s,st,R,RX,RZ,1.1,12,51,ring);}});
 const pl=sm(pass-.05,pass+.45,T,easeOut)*(1-sm(hit+.2,hit+.7,T));
 if(pl>.02)items.push({z:10.5,draw:()=>{const pts=[fp(st,FA,PASS_FROM[0],PASS_FROM[1]),fp(st,FA,lerp(PASS_FROM[0],RS[0],.5),lerp(PASS_FROM[1],RS[1],.5)+.35),fp(st,FA,RS[0],RS[1])];cased(s,pts,14,52,{dash:44,progress:pl});if(pl>.9)casedHead(s,pts,40,53);}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 if(T>=inn&&T<inn+1.2){const p=fp(st,FA,TGT[0]-.3,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],150,{n:12,seed:30,g:easeOut(sm(inn,inn+.3,T))*(1-sm(inn+.8,inn+1.2,T))});}
 // the Russia night: confetti in white, blue and red once it is 4–3 and "Russia win"
 if(T>C1.win-.2){const u=sm(C1.win-.2,C1.win+3,T,linear),top=proj(st,c.x,4,BOARDS)[1],x0=proj(st,c.x-9,0,10)[0],x1=proj(st,c.x+9,0,10)[0];confetti(s,[B,R,'paper',Y],[x0,top-200+u*520,x1-x0,420],22,Math.floor(T*6),{size:15});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FA,robGoal(tt),.16));},still:G.recv};

// ================= chapter 2 — REPLAY (slow motion, low, behind Robinho): the pass into space, calm, the finish, Pereverzev =================
const C2={watch:A(1,'Watch'),pass:A(1,'The pass'),space:A(1,'in space'),calm:A(1,'stays calm'),scores:A(1,'scores'),rus:A(1,'Russia are'),fin:A(1,'final'),end:AUTH[1].seconds};
/** replay sequence time (in the goal's clock) at replay time t */
const seq2=(t:number)=>key(t,mono([[0,G.pass-.9],[C2.pass,G.pass-.05],[C2.space,G.recv-.1],[C2.calm,G.hit-.3],[C2.scores,G.hit+.05],[C2.scores+1.2,G.inn+.4],[C2.rus,G.inn+.9],[C2.end,G.inn+3.9]]),linear);
const r2=(g:LGen):LGen=>t=>g(seq2(t));
const rob2=r2(robGoal),eder2=r2(ederGen),rafa2=r2(rafaGen);
/** the replay camera trails him, low, 4 m behind (it stops following at the shot, so the finish and the net stay framed) */
const st2At=(q:number):Stage=>{const r=robGoal(Math.min(q,G.hit-.1)),[X,Z]=toStage(FB,r.u,r.v);return{F:1500,eye:1.55,cx:X+1.5,cz:Z-4.4};};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),q=seq2(tt),st=st2At(q),{pass,hit,inn}=G,hp=pulse(q,hit,.4);
  camPath(s,t,[[0,-60,60,.9],[C2.pass,-40,60,.9],[C2.space,0,70,.98],[C2.calm,20,80,1.04],[C2.scores,0,60,.96],[C2.scores+1.2,80,60,.9],[C2.rus,330,60,.84],[C2.end,420,70,.84]],[6*hp*Math.sin(t*90),4*hp*Math.cos(t*77)]);
  const goal=q>=inn;
  arena(s,st,tt,{cheer:goal?.9:.1,flash:goal?pulse(q,inn,1.2):0,bulge:.55*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q))+.1*settle(q,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FB,rafa2,tt,RAFA,{detail:'mid'});}});
  const rob=rob2(tt),[,RZ]=toStage(FB,rob.u,rob.v);
  // "The pass": the pass line; "in space": a yellow dashed ring of space round the receive point; the shot line on "scores"
  const pl=sm(C2.pass-.05,C2.pass+.6,tt,easeOut)*(1-sm(C2.calm,C2.calm+.5,tt));
  if(pl>.02){const pts=[fp(st,FB,PASS_FROM[0],PASS_FROM[1]),fp(st,FB,lerp(PASS_FROM[0],RS[0],.5),lerp(PASS_FROM[1],RS[1],.5)+.35),fp(st,FB,RS[0],RS[1])];cased(s,pts,14,252,{dash:46,progress:pl});if(pl>.9)casedHead(s,pts,40,253);}
  const sp=easeOutBack(sm(C2.space,C2.space+.4,tt))*(1-sm(C2.scores,C2.scores+.4,tt));
  if(sp>.02){const[X,Z]=toStage(FB,RS[0],RS[1]);floorDashRing(s,st,K,X,Z,1.7,22,260,sp);floorDashRing(s,st,Y,X,Z,1.7,13,261,sp);}
  if(q>hit){const pts:Pt[]=[];for(let k=0;k<=14;k++){const bb=ballGoal(lerp(hit,Math.min(q,inn),k/14));pts.push(fp(st,FB,bb.u,bb.v,bb.y));}cased(s,pts,12,263,{dash:40});}
  const b=ballGoal(q);
  const items:Item[]=[
   {z:depth(FB,eder2(tt)),draw:()=>athlete(s,st,FB,eder2,tt,EDER,{detail:'mid'})},
   {z:depth(FB,espGen(1)(q)),draw:()=>athlete(s,st,FB,r2(espGen(1)),tt,ESP(1),{detail:'mid'})},
   {z:depth(FB,espGen(2)(q)),draw:()=>athlete(s,st,FB,r2(espGen(2)),tt,ESP(2),{detail:'low'})},
   {z:RZ-.001,draw:()=>athlete(s,st,FB,rob2,tt,ROBINHO,{detail:'high',smear:q>hit-.2&&q<hit+.2?.4:0})},
   {z:depth(FB,b)-.01,draw:()=>{drawBallL(s,st,FB,b,311,10,SHOT);if(q>=hit&&q<hit+.35){const p=fp(st,FB,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],120,{n:9,seed:312,g:easeOut(sm(hit,hit+.25,q))});}}},
  ];
  if(q>inn+.3)items.push({z:depth(FB,rusGen(0)(q)),draw:()=>athlete(s,st,FB,r2(rusGen(0)),tt,PERE,{detail:'mid'})});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "stays calm": a yellow ring on his standing foot / eyes on the ball (a cased bracket from head to ball)
  const cl=sm(C2.calm,C2.calm+.35,tt,easeOut)*(1-sm(C2.scores+.2,C2.scores+.6,tt));
  if(cl>.02){const h=jointPt(st,FB,rob,'head'),bp=fp(st,FB,b.u,b.v,b.y);cased(s,[h,L2(h,bp,.5),bp],10,270,{dash:26,progress:cl});}
  if(q>=inn&&q<inn+1.2){const p=fp(st,FB,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:330,g:easeOut(sm(inn,inn+.3,q))*(1-sm(inn+.8,inn+1.2,q))});}
  void pass;
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2At(seq2(tt)),FB,rob2(tt),.14));},
 still:C2.calm+.2,
};

// ================= the step-over (chapters 3–4, a demonstration; local frame): dribble in on the right, circle the right foot over the ball
// (inside → outside, selling the run down the line), the defender leans that way, the outside of the LEFT foot takes it inside, away =================
/** the step-over: the RIGHT leg circles over the ball and the body dips right (from the figo-signature stepover, right-leg version) */
function stepover(u:number):Pose{return keyPoses(u,[
 [0,posed({lHipF:12,lKnee:30,rHipF:14,rKnee:32,lean:16,pitch:5,neckP:28,lShA:26,rShA:24,lElb:44,rElb:44})],
 [.35,posed({lKnee:40,lHipF:12,rHipF:40,rHipA:-12,rKnee:74,rAnk:22,rHipR:-10,bend:-8,roll:-4,lean:18,pitch:5,lShA:40,rShA:30,lElb:40,rElb:44,neckP:32})],
 [.62,posed({lKnee:46,lHipF:10,rHipF:30,rHipA:36,rKnee:54,rHipR:28,bend:18,roll:9,lean:15,lShA:30,rShA:66,lElb:50,rElb:30,neckP:26,twist:12,squash:-.04})],
 [1,posed({lKnee:44,lHipF:8,rHipF:8,rHipA:26,rKnee:38,bend:10,roll:6,lean:14,lShA:30,rShA:52,lElb:50,rElb:36,neckP:22,squash:-.05})],
]);}
/** the exit: the outside of the LEFT foot pushes the ball inside (to his left), the body drops and drives off the right foot */
const PUSH=posed({lHipF:34,lKnee:30,lHipA:-16,lHipR:-26,lAnk:12,rHipF:-8,rKnee:44,rHipA:6,lean:24,pitch:6,bend:-12,roll:-5,twist:-12,lShA:42,rShA:34,lShF:-10,rShF:24,lElb:40,rElb:52,neckP:26,neckY:18,squash:-.05});
const SO_BALL:[number,number]=[9.3,5.1];// the ball at the step-over (right side of the court)
const SO_STAND:[number,number]=[SO_BALL[0]+.42,SO_BALL[1]-.04];// his pelvis over it
const EXIT:[number,number]=[6.9,3.0];// where the push sends the ball (inside, toward goal)
const D_DEF:[number,number]=[7.7,5.0];// the defender, goal side
type SoT={in0:number;set:number;so0:number;so1:number;lean:number;push:number;away:number};
type SO={rob:LGen;def:LGen;ball:(t:number)=>BallS;T:SoT};
function makeStepover(T:SoT):SO{
 const IN0:[number,number]=[15.2,5.3],soDur=T.so1-T.so0;
 const dir=yawTo(SO_STAND[0]-IN0[0],SO_STAND[1]-IN0[1]),exitYaw=yawTo(EXIT[0]-SO_STAND[0],EXIT[1]-SO_STAND[1]);
 const rob:LGen=t=>{
  if(t<T.set){const u=sm(T.in0,T.set,t,easeOut);return{pose:dribble(t*1.7,{foot:'r',speed:.35}),yaw:dir,u:lerp(IN0[0],SO_STAND[0],u),v:lerp(IN0[1],SO_STAND[1],u)};}
  if(t<T.so1+.05){const u=clamp01((t-T.so0)/soDur);const pose=t<T.so0?blendPose(dribble(t*1.7,{foot:'r',speed:.35}),stepover(0),sm(T.set,T.so0,t,easeIO)):stepover(u);
   return{pose,yaw:lerp(dir,Math.PI,.5),u:SO_STAND[0],v:SO_STAND[1]+.12*Math.sin(Math.min(1,u)*Math.PI)};}
  if(t<T.push+.3){const w=sm(T.so1+.05,T.push,t,easeIO);return{pose:blendPose(stepover(1),PUSH,w),yaw:lerp(Math.PI,exitYaw,w),u:SO_STAND[0]-.1*w,v:SO_STAND[1]-.12*w};}
  const u=sm(T.push+.3,T.away+.8,t,easeIn),d=u*Math.hypot(EXIT[0]-1.8-SO_STAND[0],EXIT[1]-.6-SO_STAND[1]);
  return{pose:blendPose(PUSH,runCycle(d/1.9,{speed:.85}),sm(T.push+.3,T.push+.55,t,easeIO)),yaw:exitYaw,u:lerp(SO_STAND[0]-.1,EXIT[0]-1.8,u),v:lerp(SO_STAND[1]-.12,EXIT[1]-.6,u)};
 };
 const def:LGen=t=>{
  const close=sm(T.in0,T.set,t,easeOut),lu=key(t,[[T.lean-.05,0],[T.lean+.4,.58],[T.push+.3,.64],[T.push+1,.8]],linear);
  let pose=blendPose(backpedal(t*1.3),lunge(lu,{side:'l'}),sm(T.lean-.1,T.lean+.2,t,easeIO));
  const late=sm(T.push+.2,T.push+1,t,easeIO);if(late>0)pose=blendPose(pose,posed({lHipF:36,rHipF:18,lKnee:52,rKnee:44,lean:22,neckY:-46,lShA:40,rShA:36,lElb:50,rElb:50,twist:-24}),late*.7);
  const shift=.42*sm(T.lean,T.lean+.4,t,easeIO);
  return{pose,yaw:-late*.9,u:D_DEF[0]+1.2*(1-close),v:D_DEF[1]+shift};
 };
 const ballF=(t:number):BallS=>{
  if(t<T.set){const u=sm(T.in0,T.set,t,easeOut),ph=(t*1.7)%1,ahead=.42+.16*Math.sin(ph*TAU),bu=lerp(IN0[0],SO_STAND[0],u),bv=lerp(IN0[1],SO_STAND[1],u);return{u:bu+Math.cos(dir)*ahead,v:bv+Math.sin(dir)*ahead,y:BALL_R,flying:false,spin:t*9};}
  if(t<T.push){const s0=sm(T.set-.25,T.set,T.set),bu=lerp(IN0[0],SO_STAND[0],1)+Math.cos(dir)*.42,bv=SO_STAND[1]+Math.sin(dir)*.42;const w=sm(T.set,T.set+.3,t,easeOut);void s0;return{u:lerp(bu,SO_BALL[0],w),v:lerp(bv,SO_BALL[1],w),y:BALL_R,flying:false,spin:9};}
  // pushed inside, then kept ~0.55 m ahead of him as he runs (a touch every stride)
  const r=rob(Math.max(t,T.push+.35)),ahead:[number,number]=[r.u+Math.cos(exitYaw)*(.55+.12*Math.sin(t*9)),r.v+Math.sin(exitYaw)*(.55+.12*Math.sin(t*9))],w=sm(T.push,T.push+.35,t,easeOut);
  return{u:lerp(SO_BALL[0],ahead[0],w),v:lerp(SO_BALL[1],ahead[1],w),y:BALL_R,flying:false,spin:9+t*10};
 };
 return{rob,def,ball:ballF,T};
}
const clamp01=(x:number)=>Math.max(0,Math.min(1,x));

// ================= chapter 3 — THE MOVE ON HIS CARD (demonstration, real time, lower broadcast side, closer) =================
const C3={now:A(2,'Now'),card:A(2,'his card'),bra:A(2,'Brazilian'),foot:A(2,'His foot'),circ:A(2,'circles'),def:A(2,'the defender'),leans:A(2,'leans'),rob:A(2,'and Robinho'),other:A(2,'other way'),end:AUTH[2].seconds};
const T3:SoT={in0:C3.card-.4,set:C3.foot-.15,so0:C3.foot+.05,so1:C3.circ+.75,lean:C3.leans-.25,push:C3.rob+.1,away:C3.other+1.2};
const so3=makeStepover(T3);
/** the demonstration court, seen from IN FRONT of him (the goal behind the camera): FC turns the local frame by +π/2, so u runs away from
 * the camera and his right (+v) is on the screen's left, as when you face someone. Only the touchline, the halfway line and a quiet arena. */
const FC:Frame={ox:5,oz:-2,rot:Math.PI/2},WALL_C=19.5;
function demoCourt(s:Sheet,st:Stage,t:number){
 const wall=proj(st,0,0,WALL_C)[1],kw=kAt(st,WALL_C),board=.95*kw,span=6000,near=st.cz+.35;
 const floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.45);s.fill(R,floor,.3);
 const strips=new Path2D(),seams=new Path2D();
 for(let i=-30;i<30;i++){const X0=i*.5,X1=X0+.5;if(hash(i+40,5)>.55)strips.addPath(polyPath([proj(st,X0,0,near),proj(st,X1,0,near),proj(st,X1,0,WALL_C),proj(st,X0,0,WALL_C)],true));
  const a=proj(st,X0,0,near),b=proj(st,X0,0,WALL_C);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);
  for(let z=near+hash(i,9)*2.2;z<WALL_C;z+=2.2){const p=proj(st,X0,0,z),q=proj(st,X1,0,z);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D(),S=(pts:Pt[])=>pts.map(([u,v])=>toStage(FC,u,v) as Pt);
 lines.addPath(polyPath(floorStrip(st,S([[Math.max(0,near-FC.oz+.2),10],[WALL_C-FC.oz-1,10]]),.05),true));
 lines.addPath(polyPath(floorStrip(st,S([[20,10],[20,-10]]),.05),true));
 const[X10,Z10]=toStage(FC,10,0);lines.addPath(polyPath(floorRing(st,X10,Z10,.12,12),true));
 s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALL_C)[0],x1=proj(st,i*2.4+1.9,0,WALL_C)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,0,0,st.cx,false);
}
const st3:Stage={F:3000,eye:1.8,cx:5.6,cz:-2.4};
/** keep the pair (him, the defender) centred: the screen x of their midpoint, smoothed by the generators' own smoothness */
const mid3=(t:number)=>{const r=so3.rob(t),d=so3.def(t),[X1,Z1]=toStage(FC,r.u,r.v),[X2,Z2]=toStage(FC,d.u,d.v);return proj(st3,(X1+X2)/2,.9,(Z1+Z2)/2);};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,T=so3.T,m=mid3(tt),z=key(t,mono([[0,1],[C3.card,1.08],[C3.foot,1.42],[C3.circ,1.5],[C3.leans,1.4],[C3.rob,1.22],[C3.other+.6,1.06],[C3.end,1.02]]),easeInOutSine);
  cam(s,m[0],m[1]+60,z);
  demoCourt(s,st,tt);
  const rob=so3.rob(tt),df=so3.def(tt),b=so3.ball(tt),[,RZ]=toStage(FC,rob.u,rob.v);
  // "Brazilian step-over": a yellow dashed circle arc round the ball (the foot's path), drawn as he circles; "leans": a red arrow for the lean;
  // "other way": a cased yellow arrow for his exit, inside
  const arc=sm(C3.bra,C3.bra+.5,tt,easeOut)*(1-sm(C3.foot-.1,C3.foot+.2,tt))+sm(T.so0,T.so0+.4,tt,easeOut)*(1-sm(T.push,T.push+.4,tt));
  if(arc>.02){const pts:Pt[]=[];for(let k=0;k<=16;k++){const a=Math.PI*.95-k/16*Math.PI*1.6;pts.push(fp(st,FC,SO_BALL[0]+Math.cos(a)*.6,SO_BALL[1]+Math.sin(a)*.66,.2+.26*Math.sin(k/16*Math.PI)));}cased(s,pts,13,301,{dash:30,progress:Math.min(1,arc)});if(arc>.9)casedHead(s,pts,32,302);}
  const la=sm(C3.leans,C3.leans+.5,tt,easeOut)*(1-sm(C3.other+.6,C3.other+1,tt));
  if(la>.02)redArrow(s,[fp(st,FC,D_DEF[0],D_DEF[1]+.1,1.2),fp(st,FC,D_DEF[0]-.05,D_DEF[1]+.9,1.1),fp(st,FC,D_DEF[0]-.1,D_DEF[1]+1.7,1)],12,305,la);
  const ex=sm(C3.rob,C3.rob+.6,tt,easeOut)*(1-sm(C3.end-.8,C3.end-.4,tt));
  if(ex>.02){const pts=[fp(st,FC,SO_BALL[0]-.1,SO_BALL[1]-.3),fp(st,FC,lerp(SO_BALL[0],EXIT[0],.5),SO_BALL[1]-1.3),fp(st,FC,EXIT[0]-1.2,EXIT[1]-.4)];cased(s,pts,14,307,{dash:40,progress:ex});if(ex>.9)casedHead(s,pts,40,308);}
  const items:Item[]=[
   {z:depth(FC,df),draw:()=>athlete(s,st,FC,so3.def,tt,DEMO_D,{detail:'high'})},
   {z:RZ-.001,draw:()=>athlete(s,st,FC,so3.rob,tt,ROBINHO_TR,{detail:'high',smear:(tt>T.so0+.1&&tt<T.so1)||(tt>T.push-.1&&tt<T.push+.3)?.16:0})},
   {z:depth(FC,b)-.01,draw:()=>{drawBallL(s,st,FC,b,211);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "His foot": a red ring on the right boot while it circles
  const ft=easeOutBack(sm(C3.foot,C3.foot+.3,tt))*(1-sm(T.so1-.1,T.so1+.2,tt));
  if(ft>.02){const p=jointPt(st,FC,rob,'rToe'),r=kAt(st,RZ)*.2*ft;s.fill(R,ribbon(blob(p[0],p[1],r,r*.8,321,{n:20}),8,{seed:322,close:true,wobble:1}),1);}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,FC,so3.rob(tt),.14));},
 still:C3.circ+.25,
};

// ================= chapter 4 — YOUR TURN: the move again from behind him; three cards (step over, the lean, go the other way); a tick =================
const C4={your:A(3,'Your'),step:A(3,'step over'),ball:A(3,'the ball'),make:A(3,'make the'),wrong:A(3,'wrong way'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T3.in0+.2],[C4.step,T3.so0],[C4.ball,T3.so0+.45],[C4.make,T3.lean],[C4.wrong,T3.push],[C4.end,T3.away+.6]]),linear);
const g4=(g:LGen):LGen=>t=>g(seq4(t));
const rob4=g4(so3.rob),def4=g4(so3.def);
const SOB=toStage(FB,SO_STAND[0]+2.2,SO_STAND[1]+.5);
const st4:Stage={F:1500,eye:1.7,cx:SOB[0]-.3,cz:SOB[1]-3.4};
const CARD_Y=560,CARD_W=128,CARD_H=140,CARDS:[number,number,'step'|'lean'|'go'][]=[[-330,C4.step,'step'],[0,C4.make,'lean'],[330,C4.wrong,'go']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,q=seq4(tt);
  camPath(s,t,[[0,-40,160,1.3],[C4.your+.4,-20,250,1.1],[C4.wrong,0,250,1.1],[C4.end,20,245,1.12]]);
  arena(s,st,tt,{cheer:0,flash:0,flags:false});
  const rob=rob4(tt),[,RZ]=toStage(FB,rob.u,rob.v),b=so3.ball(q);
  const items:Item[]=[
   {z:depth(FB,def4(tt)),draw:()=>athlete(s,st,FB,def4,tt,DEMO_D,{detail:'mid'})},
   {z:RZ-.001,draw:()=>athlete(s,st,FB,rob4,tt,ROBINHO_TR,{detail:'high',smear:q>T3.so0+.1&&q<T3.so1?.2:0})},
   {z:depth(FB,b)-.01,draw:()=>{drawBallL(s,st,FB,b,411,10);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Your turn"; each prints its step as it is said
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-CARD_H+dy],[cx+CARD_W,CARD_Y-CARD_H+dy],[cx+CARD_W,CARD_Y+CARD_H+dy],[cx-CARD_W,CARD_Y+CARD_H+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+CARD_H-38;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+10,y:gy+25,height:250*(.9+.1*on),azimuth:kind==='lean'?60:-40,elevation:14,fov:18,at:[0,0,0]});
    const P=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    if(kind==='step'){const pose=stepover(.62),csk=solve(pose,RB_BUILD,{}),bb:V3=[.42,BALL_R,0];ball(s,...P(bb),BALL_R*(fc.scale?fc.scale(bb):100),81);
     const pts:Pt[]=[];for(let k=0;k<=10;k++){const a=Math.PI*.9-k/10*Math.PI*1.5;pts.push(P([.42+Math.cos(a)*.3,.25+.15*Math.sin(k/10*Math.PI),Math.sin(a)*.34]));}dashed(s,Y,pts,8,85,{dash:22});arrowHead(s,Y,pts,22,86);
     drawAthlete(s,pose,fc,{...ROBINHO_TR,detail:'mid',shadow:[K,.2]},{},{prev:pose});void csk;}
    if(kind==='lean'){const pose=lunge(.6,{side:'l'});drawAthlete(s,pose,fc,{...DEMO_D,detail:'mid',shadow:[K,.2]},{},{prev:pose});const a=P([0,1.1,-.1]),c=P([0,1,-.9]);const q2=[a,L2(a,c,.5),c];const rp=ribbon(q2,8,{seed:87,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);arrowHead(s,R,q2,22,88);}
    if(kind==='go'){const pose=PUSH;drawAthlete(s,pose,fc,{...ROBINHO_TR,detail:'mid',shadow:[K,.2]},{},{prev:pose});const csk=solve(pose,RB_BUILD,{}),tb:V3=[csk.lToe[0]+.1,BALL_R,csk.lToe[2]-.05],p0=P(tb),p1=P([tb[0]+.9,BALL_R,tb[2]-.9]),pts:Pt[]=[p0,L2(p0,p1,.5),p1];dashed(s,Y,pts,8,89,{dash:22});arrowHead(s,Y,pts,24,90);ball(s,p0[0],p0[1],BALL_R*(fc.scale?fc.scale(tb):100),91);}
    s.restore();});
   s.fill(K,frames);}
  // "wrong way": a big tick (yellow over red, navy echo) stamps beside him as he goes
  const tick=easeOutBack(sm(C4.wrong+.4,C4.wrong+.75,tt));
  if(tick>.02){const g=fp(st,FB,rob.u,rob.v),h=kAt(st,RZ)*1.8,c:Pt=[g[0]-h*.7,g[1]-h*.85],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
  void bump;
 },
 still:C4.make+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'robinho-futsal-signature',format:'futsal',title:'Robinho’s Brazilian step-over',theme:'Step over the ball to make the defender lean the wrong way.',
 ageNote:'For players aged 7–12: the 2014 semi-final and Robinho’s winning goal are real; the step-over is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball; a dashed yellow foot-circle loops over it, then a red flick goes the other way; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;s.fill(K,polyPath(blob(x,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);ball(s,x,y,r,seed);if(age<=0)return;
  const sp=sm(0,.45,age,easeOut)*(1-sm(.75,1,age));if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=Math.PI*.9-k/14*Math.PI*1.7*sp;pts.push([x+Math.cos(a)*r*1.7,y-r*.3+Math.sin(a)*r*1.1]);}s.fill(Y,ribbon(pts,10,{seed,taper:.3,wobble:1}),1);}
  const go=sm(.4,.8,age,easeOut)*(1-sm(.9,1.2,age));if(go>.02){const pts:Pt[]=[[x-r*.6,y+r*.3],[x-r*(.6+1.6*go),y+r*.5]];s.fill(R,ribbon(pts,9,{seed:seed+3,taper:.4,wobble:1}),1);}
 },
};
export default film;
