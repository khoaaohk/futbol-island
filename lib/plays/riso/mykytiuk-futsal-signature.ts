/** Mykola Mykytiuk — "the defensive wall": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: Mykola Mykytiuk (Микола Микитюк), born 13 Sep 1996, Ukraine's futsal defender (card bio, lib/town/playerBios.json: "Ukrainian fixo
 *  who scored in the 2024 Futsal World Cup quarter-final win over Venezuela on Ukraine's run to a historic bronze medal"; card role fixo).
 *  Not the football namesake of the same surname.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — "the defensive wall" — not one match. No written source we could
 *  reach describes a single Mykytiuk block or tackle, and none describes HOW his World Cup goal was scored, so the film follows the brief's
 *  honest fallback: it opens on a REAL, documented match he scored in — Ukraine 9–4 Venezuela, the 2024 FIFA Futsal World Cup
 *  QUARTER-FINAL, 29 Sep 2024, Humo Arena, Tashkent — showing ONLY confirmed things (the arena, the two teams, the restart at 8–4, his
 *  celebration with the scoreboard at 9–4 after his 37'51" goal, the 9–4 final whistle, and Ukraine's later bronze). His goal itself is
 *  NOT staged. Then "This is how he defends" shows the wall in a separate, labelled demonstration in neutral training kit that is never
 *  passed off as that match. (No other futsal film uses Ukraine v Venezuela — checked by grep; the EURO 2026 France–Ukraine
 *  quarter-final is used by the Mouhoudine film.)
 *  1  LIVE (broadcast camera, main stand): the quarter-final in Tashkent, Ukraine (yellow) v Venezuela (burgundy, drawn in red ink); the
 *     restart after Ukraine's eighth goal (scoreboard 8–4), Mykytiuk the deepest Ukraine outfield player, ringed, No. 6; whip pan (a cut
 *     in time) to his celebration, the scoreboard ticking to 9–4 on "ninth goal"; whip pan to the final whistle, 9–4 ringed; on "bronze
 *     medal" a bronze medal stamps in (won a week later, 7–1 v France — stated as "on the way to").
 *  2  HOW HE DEFENDS (a demonstration, real time, side-on from the main stand, his own goal on the LEFT; neutral paper/navy attackers, a
 *     blue-bib keeper, Mykytiuk in a plain yellow training top — no match claimed): he stays close behind the pivot, goal-side; the pass
 *     is played into the pivot's feet; the pivot tries to turn one way — Mykytiuk slides across (the yellow wall moves with him) — tries
 *     the other way — blocked again; the ball slips off the pivot's foot and Mykytiuk pokes it away with his right foot and goes.
 *  3  WATCH AGAIN (slow-motion replay, reverse angle: knee-high, his goal on the RIGHT): stay close, slide across, keep him in front, poke.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Keep the attacker in front of you and don't let them turn."): he runs it again;
 *     three cards (stay close, slide across, poke it away); a tick.
 * Sources (written; fetched with curl once and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2024 FIFA Futsal World Cup" (raw, cached; wiki-2024-futsal-wc.txt): quarter-final 29 September 2024, 20:00, Humo Arena,
 *    Tashkent: Ukraine 9–4 Venezuela; Ukraine goals Abakshyn 04'13", 15'06", 17'14", Shoturma 13'56", Shved 19'37", Semenchenko 20'24",
 *    Sukhov 26'09", Cherniavskyi 31'34", Mykytiuk 37'51"; Venezuela goals M. Francia 05'12", Viamonte 15'41", Vidal 16'02", Morillo
 *    29'38"; attendance 3,209; referee Tarek Elkhataby. So Cherniavskyi's 31'34" made it 8–4 and Mykytiuk's 37'51" was the last goal, 9–4.
 *    Semi-final Ukraine 2–3 Brazil (2 Oct); third place Ukraine 7–1 France (6 Oct 2024, Humo Arena). https://en.wikipedia.org/wiki/2024_FIFA_Futsal_World_Cup
 *  - Wikipedia, "2024 FIFA Futsal World Cup squads" (raw, fetched Sep 2026; wiki-2024-futsal-wc-squads.txt): Ukraine No. 6 Mykola
 *    Mykytiuk, born 13 Sep 1996, Córdoba Futsal (Spain) — listed there as MF.
 *  - Ukrainian Wikipedia, "Микитюк Микола Миколайович" (raw, fetched Sep 2026; ukwiki-mykytiuk-1.txt): position захисник (defender);
 *    "played all 7 games [at the 2024 World Cup], scoring one goal in the quarter-final against Venezuela"; bronze medallist 2024;
 *    Honoured Master of Sport of Ukraine; later Ribera Navarra. https://uk.wikipedia.org/wiki/Микитюк_Микола_Миколайович
 * CONFIRMED: the match, date, venue, round, 9–4 result, the 8–4 score before his goal, his goal at 37'51" as the ninth, No. 6, defender,
 *  Ukraine's bronze at that World Cup. The narration only states these (plus the entry's signature, framed as "how he defends").
 * INFERRED (not named in the narration): both kits that night (Ukraine yellow shirts / blue shorts / yellow socks, Venezuela burgundy —
 *  drawn red — with navy shorts; not checked), the keepers' colours, the court colour (drawn blue), which end each team attacked, every
 *  position in chapter 1, where and how he celebrated, the scoreboard's look, his hair (drawn short and dark). No video was reviewed.
 *  Chapters 2–4 are a demonstration of the defensive wall, not a recreation of any match play (the right poking foot and the angles are
 *  chosen to read clearly).
 * Technique (poses): the defender stays goal-side and close (about an arm's length) behind the pivot, knees bent, low; when the pivot
 *  receives he does not dive in — he mirrors: every time the pivot's hips open to turn, he shuffles across to that side, so the pivot
 *  always has him in the way and must face back up the court; when the ball comes off the pivot's foot he jabs his near (right) foot
 *  through and pokes it away.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the shuffles and the poke). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across);
 *  each stage maps it with a proper rotation (no mirror), so the right foot stays the right foot. Our stages are LEFT-handed (X right,
 *  Z away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Ukraine, the training top, lights, the wall), red (Venezuela, the turn arrows, trim), blue (the court, Ukraine's shorts),
 *  navy (key line, stands). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card
 *  window 1.45:1 → square). Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,stand,runCycle,runCadence,dribble,lunge,keeperSet,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: World Cup 2024',text:'The 2024 Futsal World Cup quarter-final, in Tashkent. Ukraine play Venezuela. Defender Mykola Mykytiuk scores the ninth goal. Ukraine win nine four, on the way to a bronze medal!',tail:2.6,
  cues:['The 2024','in Tashkent','Ukraine play','Defender','Mykola','scores','ninth goal','Ukraine win','nine four','bronze medal'],
  heads:{'The 2024':'Quarter-final 2024','Defender':'Defender, No. 6','ninth goal':'9–4','nine four':'Semi-final!','bronze medal':'Bronze'}},
 {label:'How he defends',text:'This is how he defends: he stays close behind the pivot. The pass comes. The pivot tries to turn, but he slides across. Again, blocked! Then he pokes it away and goes!',tail:2.2,
  cues:['This is how','stays close','behind the pivot','The pass','tries to turn','slides across','Again','blocked','pokes','goes'],heads:{'This is how':'The wall','goes':''}},
 {label:'Watch again',text:'Watch again, slowly. Stay close, slide across, keep him in front, poke it away!',tail:2.2,
  cues:['Watch again','Stay close','slide across','keep him','poke it'],heads:{'Watch again':'Slow motion','poke it':''}},
 {label:'Your turn',text:'Your turn: keep the attacker in front of you, and don’t let them turn!',tail:2.8,
  cues:['Your turn','keep the attacker','in front','let them turn'],heads:{'Your turn':'Be the wall','let them turn':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/mykytiuk-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/mykytiuk-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/mykytiuk-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('mykytiuk: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue in chapter i whose words are w (exact match first, else the first that starts with w; throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words===w)??AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('mykytiuk: no cue '+w);return c.at;};
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
function casedHead(s:Sheet,pts:Pt[],size:number,seed:number){arrowHead(s,K,pts,size*1.35,seed,.9);arrowHead(s,Y,pts,size,seed);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
/** a red dashed line cased in paper (the pass lane) */
function redLane(s:Sheet,pts:Pt[],width:number,seed:number,o:{progress?:number;cov?:number}={}){dashed(s,R,pts,width,seed,{dash:width*3.6,progress:o.progress,cov:o.cov??1});}
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
/** his skin: a light screen (card appearance: light skin) */
const SKIN:InkFill[]=[[Y,.8],[R,.26]];
const BUILD={height:1.82,bulk:1.06};
/** Mykytiuk for Ukraine (kit INFERRED): yellow shirt, blue shorts, yellow socks; No. 6 (CONFIRMED) in blue; short dark hair (inferred) */
const MYK:AthleteStyle={shirt:Y,shorts:B,socks:Y,boots:K,skin:SKIN,hair:K,line:K,trim:B,hairStyle:'short',number:6,numberInk:B,build:BUILD,seed:9};
/** Mykytiuk in the demonstration and lesson: a plain yellow training top and navy shorts (no national kit, so no match is implied) */
const MYK_T:AthleteStyle={...MYK,shirt:[Y,.95],shorts:K,socks:K,trim:K,boots:'paper',number:null};
/** Ukraine team-mates (kit inferred) */
const UKR=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:Y,boots:K,skin:[[[Y,.8],[R,.24]],[[Y,.74],[R,.28]],[[Y,.78],[R,.22]]][n%3] as InkFill[],hair:K,line:K,trim:B,hairStyle:(['short','balding','curly'] as const)[n%3],build:{height:1.74+hash(n,3)*.12},seed:20+n});
/** Venezuela (kit inferred): burgundy drawn as red shirts, navy shorts, red socks */
const VEN=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[[Y,.7],[R,.3]],[[Y,.56],[R,.34],[K,.12]]][n%2] as InkFill[],hair:K,line:K,trim:'paper',hairStyle:n%3?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const VEN_GK:AthleteStyle={shirt:[B,.85],shorts:K,socks:K,boots:K,skin:[[Y,.72],[R,.28]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:61};
/** the demonstration attackers and keeper: neutral training kit (no team is claimed in chapters 2–4) */
const DEMO_P:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:R,hairStyle:'curly',build:{height:1.76},seed:77};
const DEMO_V:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.5],[R,.34],[K,.12]],hair:K,line:K,trim:R,hairStyle:'bald',build:{height:1.84,bulk:1.1},seed:79};
const DEMO_K:AthleteStyle={shirt:[B,.6],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:78};
/** THE adapter: draw one athlete from a local generator at time t on stage st / frame fr (prev = one drawn frame earlier; smear = motion echo) */
function athlete(s:Sheet,st:Stage,fr:Frame,gen:LGen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const pl=(l:Loc)=>{const[X,Z]=toStage(fr,l.u,l.v);return placeAt(X,Z,l.yaw+fr.rot);};
 const a=gen(t),b=gen(t-1/12),cm=projector(st);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl(a),{prevPlace:pl(c),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl(a),{prev:b.pose,prevPlace:pl(b)});
}
/** a skeleton in the local frame: joints come back as [u, height, v] */
function jointsL(l:Loc){const sk=solve(l.pose,BUILD,{x:l.u,z:-l.v,yaw:l.yaw}),J=(j:V3):[number,number,number]=>[j[0],j[1],-j[2]];return{sk,J};}

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

// ---------------- the arena: blue court (inferred), stands with Ukraine and Venezuela flags, futsal goal ----------------
/** stepped navy rows, lit faces, yellow / blue / red shirts, Ukraine (blue over yellow) and Venezuela (yellow-blue-red) flags, roof lights */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),yel=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3);if(hash(i,8)<.22)continue;const jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.2)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.34)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.42)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  if(f%3===2){yel.addPath(band(0,1/3));blues.addPath(band(1/3,2/3));reds.addPath(band(2/3,1));}
  else{blues.addPath(band(0,.5));yel.addPath(band(.5,1));}}
 s.fill(Y,heads,.6);s.knockout(yel);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal goal (3 m × 2 m) on any frame: net halftone + mesh; posts red/paper bands */
function goalNet(s:Sheet,st:Stage,fr:Frame){
 const H=2,Db=.95,Dt=.55,P=(u:number,Yh:number,v:number):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,Yh,Z);};
 const back=(v:number,Yh:number):Pt=>P(-lerp(Db,Dt,Yh/H),Yh,v);
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

// ---- SIDE court from the main stand: the halfway line at X = 0, the near touchline Z = 0, the far boards Z = 21; the goal on frame fr ----
const BOARDS=21;
/** chapter 1 + 2: the goal at X = −20 (left); chapter 3 + 4: the SAME local court turned 180° (the goal at X = +20, right) */
const FA:Frame={ox:-20,oz:10,rot:0},FR:Frame={ox:20,oz:10,rot:Math.PI};
type CourtOpt={cheer?:number;flash?:number;keeper?:()=>void};
function courtSide(s:Sheet,st:Stage,fr:Frame,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 // the blue sports floor (UEFA photo): a flat blue screen, a darker navy run-off band beyond the touchlines, a faint seeded mottle
 s.fill(B,rectPath(-span,wall,span*2,span),.34);
 const run=new Path2D(),a0=proj(st,st.cx-40,0,20.4),a1=proj(st,st.cx+40,0,BOARDS);run.rect(a0[0],a1[1],a1[0]-a0[0],a0[1]-a1[1]);
 const n0=proj(st,st.cx-40,0,Math.max(st.cz+.6,-1)),n1=proj(st,st.cx+40,0,-.4);if(n1[1]<n0[1])run.rect(n0[0],n1[1],n1[0]-n0[0],n0[1]-n1[1]);s.fill(K,run,.28);
 const mot=new Path2D();for(let k=0;k<40;k++){const x=st.cx-24+hash(k,11)*48,z=Math.max(st.cz+1,0)+hash(k,12)*20,p=proj(st,x,0,z),r=kAt(st,z)*(.6+hash(k,13)*1.2);mot.addPath(polyPath(blob(p[0],p[1],r*2.2,r*.5,300+k,{amp:.2,n:10}),true));}s.fill(B,mot,.12);
 const lines=new Path2D();courtLines(st,fr,lines,40);
 lines.addPath(polyPath(floorStrip(st,[[0,0],[0,20]],.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,fr);o.keeper?.();goalPosts(s,st,fr);
}

// ================= the wall (local frame, his OWN goal at u = 0): poses, Mykytiuk, the passer, the pivot, the ball, the keeper =================
/** CLOSE: the defender's stance tight behind the pivot — low, knees bent, weight forward on the balls of his feet, the left forearm
 * lightly up at the pivot's back (feeling where he is, not pushing), eyes over the pivot's shoulder on the ball */
const CLOSE=(b:number)=>posed({lHipF:30,rHipF:22,lKnee:48+6*b,rKnee:42+6*b,lAnk:-6,rAnk:-6,lHipA:16,rHipA:16,lHipR:10,rHipR:10,lean:24,pitch:4,neckP:-8,
 lShF:46,lShA:22,lElb:70,rShA:32,rShF:6,rElb:44,twist:4,air:.015*b});
/** SHUFFLE: a side-step (the feet split wide then close); s = 0..1 through one step */
const SHUFFLE=(s:number,b:number)=>{const w=Math.sin(Math.PI*s);return posed({lHipF:26,rHipF:20,lKnee:46+10*w,rKnee:44+10*w,lAnk:-4,rAnk:-4,lHipA:16+20*w,rHipA:16+20*w,lHipR:12,rHipR:12,lean:24,pitch:4,neckP:-8,
 lShF:40,lShA:28,lElb:66,rShA:40,rShF:6,rElb:44,air:.03*w+.01*b});};
const PA0:[number,number]=[15.6,-3.2];// the passer (paper kit), out on the near side
const VB:[number,number]=[9.6,.8];// the pivot (paper kit), back to goal
const YAW_P0=Math.atan2(PA0[1]-VB[1],PA0[0]-VB[0]);// the pivot facing the passer
const YAW_PA=Math.atan2(VB[1]-PA0[1],VB[0]-PA0[0]);
const PASS_POW=.45,FRONT=.42;
/** the ball at the passer's right boot at the strike's contact (local) */
const PB0:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:PASS_POW}),BUILD,{yaw:YAW_PA}),toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[PA0[0]+toe[0]+d[0]/l*.08,PA0[1]-(toe[2]+d[1]/l*.08)];})();
/** where the ball slips off the pivot's foot on his second turn, and his lunge that meets it with the right toe (facing up the court) */
const ICP:[number,number]=[VB[0]-.12,VB[1]-1];
const YAW_I=.05;
const M2:[number,number]=(()=>{const sk=solve(lunge(.6,{side:'r'}),BUILD,{yaw:YAW_I}),toe=sk.rToe;return[ICP[0]-toe[0],ICP[1]+toe[2]];})();
/** where he stands: an arm's length goal-side of the pivot; after the first slide, across to the pivot's left */
const M0:[number,number]=[VB[0]-.9,VB[1]],M1:[number,number]=[VB[0]-.95,VB[1]+.55];
/** after the poke he goes forward past the pivot's right side */
const GO:[number,number]=(()=>{const d=[.8,-.6],l=Math.hypot(d[0],d[1]);return[d[0]/l,d[1]/l];})();
const YAW_GO=Math.atan2(GO[1],GO[0]);
const goDist=(x:number)=>x<=0?0:4.2*x-4.2*.45*(1-Math.exp(-x/.45));
/** the turns the pivot wants (red arrows): round the defender towards the goal, first on his left (+v), then on his right (−v) */
const TURN1:[number,number][]=[[VB[0]+.25,VB[1]+.45],[VB[0]-.1,VB[1]+1.25],[VB[0]-.9,VB[1]+1.6],[VB[0]-2.1,VB[1]+1.5]];
const TURN2:[number,number][]=[[VB[0]+.15,VB[1]-.45],[VB[0]-.15,VB[1]-1.3],[VB[0]-1,VB[1]-1.65],[VB[0]-2.2,VB[1]-1.55]];
type WallT={hit:number;recv:number;t1:number;s1:number;t2:number;s2:number;poke:number};
type BallS={u:number;y:number;v:number;moving:boolean;spin:number};
type Wall={myk:LGen;passer:LGen;pivot:LGen;gk:LGen;ball:(t:number)=>BallS};
function lerpAng(a:number,b:number,u:number){let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;}
function makeWall(T:WallT):Wall{
 // ---- the pivot: back to goal; receives; opens his hips to turn left, is blocked, re-faces; tries right, the ball slips; turns to chase
 const pYaw=(t:number)=>t<T.t1?YAW_P0:t<T.poke+.1?YAW_P0+key(t,mono([[T.t1,0],[T.s1+.15,1.05],[T.s1+.6,.2],[T.t2,.1],[T.s2+.3,-1.2],[T.poke+.1,-1.25]]),easeIO):
  lerpAng(YAW_P0-1.25,YAW_GO,sm(T.poke+.1,T.poke+.6,t,easeIO));
 const pShift=(t:number)=>t<T.t1?0:key(t,mono([[T.t1,0],[T.s1+.15,.28],[T.s1+.6,.12],[T.t2,.1],[T.s2+.3,-.2],[T.poke,-.22]]),easeIO);
 const pPos=(t:number):[number,number]=>{const v=VB[1]+pShift(t);if(t<T.poke+.35)return[VB[0],v];const d=goDist(t-T.poke-.35)*.7;return[VB[0]+GO[0]*d,v+GO[1]*d];};
 const front=(t:number):[number,number]=>{const p=pPos(t),y=pYaw(t);return[p[0]+Math.cos(y)*FRONT,p[1]+Math.sin(y)*FRONT];};
 const pivot:LGen=t=>{
  const b=Math.sin(t*5)*.5+.5,[u,v]=pPos(t),yaw=pYaw(t);
  // waiting: knees bent, the left arm back feeling for the defender, the right arm out calling for it
  let pose=posed({lHipF:18,rHipF:22,lKnee:28+6*b,rKnee:30+6*b,lHipA:14,rHipA:14,lean:16,neckP:8,lShF:-34,lShA:26,lElb:40,rShF:36,rShA:42,rElb:30});
  // receiving: the right sole out to stop it
  pose=blendPose(pose,posed({lHipF:14,rHipF:34,lKnee:34,rKnee:30,rAnk:-16,lHipA:12,rHipA:18,lean:18,neckP:30,lShF:-30,lShA:36,lElb:44,rShA:40,rElb:40}),sm(T.recv-.35,T.recv,t,easeIO)*(1-sm(T.recv+.25,T.recv+.6,t,easeIO)));
  // the turns: hips open, a short dribble touch, head over the shoulder looking for the goal
  const turning=Math.max(sm(T.t1,T.t1+.2,t)*(1-sm(T.s1+.6,T.s1+.8,t)),sm(T.t2,T.t2+.2,t)*(1-sm(T.poke+.1,T.poke+.3,t)));
  if(turning>0)pose=blendPose(pose,{...dribble((t-T.t1)*2.2,{foot:'r',speed:.3}),neckY:(t<T.t2?.5:-.5)},turning);
  // too late: he spins and chases
  const ch=sm(T.poke+.1,T.poke+.5,t,easeIO);if(ch>0)pose=blendPose(pose,runCycle((t-T.poke)*runCadence(.7),{speed:.7}),ch);
  return{pose,yaw,u,v};};
 // ---- Mykytiuk: close behind; mirrors each turn with a shuffle; pokes with the right foot; goes
 const mPos=(t:number):[number,number]=>{
  if(t<T.s1)return M0;
  if(t<T.t2+.05){const p=sm(T.s1,T.s1+.4,t,easeIO);return[lerp(M0[0],M1[0],p),lerp(M0[1],M1[1],p)];}
  if(t<T.poke+.15){const p=sm(T.s2,T.s2+.45,t,easeIO);return[lerp(M1[0],M2[0],p),lerp(M1[1],M2[1],p)];}
  const d=goDist(t-T.poke-.15);return[M2[0]+GO[0]*d,M2[1]+GO[1]*d];};
 const myk:LGen=t=>{
  const b=Math.sin(t*5.4)*.5+.5,[u,v]=mPos(t);let pose=CLOSE(b);
  const sh1=sm(T.s1,T.s1+.4,t),sh2=sm(T.s2,T.s2+.45,t);
  if(sh1>0&&sh1<1)pose=blendPose(pose,SHUFFLE(sh1,b),Math.sin(Math.PI*sh1));
  if(sh2>0&&sh2<1)pose=blendPose(pose,SHUFFLE((sh2*2)%1,b),Math.sin(Math.PI*sh2));
  // the poke: a jab with the right foot, full reach on the ball, then away with it
  const lk=sm(T.poke-.3,T.poke-.05,t,easeIO);
  if(lk>0)pose=blendPose(pose,lunge(key(t,[[T.poke-.3,.3],[T.poke,.6],[T.poke+.3,1]],linear),{side:'r'}),lk);
  const go=sm(T.poke+.2,T.poke+.55,t,easeIO);if(go>0)pose=blendPose(pose,dribble((t-T.poke)*runCadence(.8)*1.1,{foot:'r',speed:.8}),go);
  // eyes and chest on the pivot / the ball, square to the play; facing up the court for the poke; then the way he goes
  const bl=front(t),look=Math.atan2(bl[1]-v,bl[0]-u);
  let yaw=lerpAng(0,look,.35);yaw=lerpAng(yaw,YAW_I,sm(T.poke-.35,T.poke-.1,t,easeIO));yaw=lerpAng(yaw,YAW_GO,sm(T.poke+.15,T.poke+.5,t,easeIO));
  return{pose,yaw,u,v};};
 const strikeS=(t:number)=>key(t,[[T.hit-.5,.18],[T.hit,STRIKE_CONTACT],[T.hit+.5,.84],[T.hit+1.1,.98]],linear);
 const passer:LGen=t=>{
  let pose=blendPose(stand(),posed({lHipF:14,rHipF:20,lKnee:24,rKnee:30,lean:14,neckP:18,lShA:22,rShA:22,lElb:34,rElb:34}),.6);
  if(t>T.hit-.55)pose=blendPose(pose,strike(strikeS(t),{foot:'r',power:PASS_POW}),sm(T.hit-.55,T.hit-.4,t,easeIO)*(1-sm(T.hit+1.1,T.hit+1.5,t,easeIO)));
  const late=sm(T.poke+.2,T.poke+.8,t,easeIO);// hands to his head
  if(late>0)pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:-4,neckP:-10,lShF:120,rShF:120,lShA:40,rShA:40,lElb:120,rElb:120}),late);
  return{pose,yaw:YAW_PA,u:PA0[0],v:PA0[1]};};
 const gk:LGen=t=>({pose:keeperSet(t*1.3),yaw:Math.atan2(VB[1],VB[0])*.4,u:.7,v:0});
 const BT=front(T.recv);
 const ballF=(t:number):BallS=>{
  if(t<T.hit)return{u:PB0[0],y:BALL_R,v:PB0[1],moving:false,spin:0};
  if(t<T.recv){const p=sm(T.hit,T.recv,t,x=>x*(1.15-.15*x));return{u:lerp(PB0[0],BT[0],p),y:BALL_R,v:lerp(PB0[1],BT[1],p),moving:true,spin:p*12};}
  const slip=Math.max(T.s2+.45,T.poke-.5);
  if(t<slip){const f=front(t);return{u:f[0],y:BALL_R,v:f[1],moving:t>T.t1,spin:12+(t-T.recv)*4};}
  if(t<T.poke){const f=front(slip),p=sm(slip,T.poke,t,easeOut);return{u:lerp(f[0],ICP[0],p),y:BALL_R,v:lerp(f[1],ICP[1],p),moving:true,spin:16+p*4};}
  // poked: it jumps forward off his toe, then he carries it on his right foot, half a metre ahead
  const w=sm(T.poke+.15,T.poke+.55,t,easeIO),[mu,mv]=mPos(t),ph=((t-T.poke)*runCadence(.8)*1.1)%1,lead=.5+.16*Math.sin(ph*TAU),
   jab=sm(T.poke,T.poke+.3,t,easeOut)*1.1,loose:[number,number]=[ICP[0]+GO[0]*jab,ICP[1]+GO[1]*jab],
   foot:[number,number]=[mu+GO[0]*lead+Math.sin(YAW_GO)*.12,mv+GO[1]*lead-Math.cos(YAW_GO)*.12];
  return{u:lerp(loose[0],foot[0],w),y:BALL_R,v:lerp(loose[1],foot[1],w),moving:true,spin:20+(t-T.poke)*12};};
 return{myk,passer,pivot,gk,ball:ballF};
}
/** a ball drawn on stage st through frame fr, with its floor shadow */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:BallS,seed:number,min=9,dir=0){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.moving?.25:0,dir});return{p,r};
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** screen direction of the ball's travel (for the smear) */
function ballDir(st:Stage,fr:Frame,W:Wall,t:number){const a=W.ball(t-.05),b=W.ball(t),p=fp(st,fr,a.u,a.v),q=fp(st,fr,b.u,b.v);return Math.atan2(q[1]-p[1],q[0]-p[0]);}
/** Mykytiuk's chest (the passage enters his shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
/** a joint of a player on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:'head'|'face'|'pelvis'|'rToe'|'chest'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];
/** THE WALL: a yellow line (cased in navy) across the floor just behind the pivot at the defender's feet — it slides when he slides */
function wallLine(s:Sheet,st:Stage,fr:Frame,l:Loc,g:number,seed:number,w=13){if(g<=.02)return;const u=l.u+.25,h=1.6;cased(s,[fp(st,fr,u,l.v-h),fp(st,fr,u,l.v),fp(st,fr,u,l.v+h)],w,seed,{dash:w*3.2,progress:g});}
/** a red turn arrow (the way the pivot wants to go); cut = how far it gets before the wall stops it */
function turnArrow(s:Sheet,st:Stage,fr:Frame,pts:[number,number][],g:number,seed:number,w=12){if(g<=.02)return;const q=smoothPts(pts.map(([u,v])=>fp(st,fr,u,v)),false,8),line=partial(q,g);redLane(s,line,w,seed);if(g>.25)arrowHead(s,R,line,w*2.8,seed+1);}

// ================= chapter 1 — LIVE: the 2024 quarter-final in Tashkent. Only confirmed things: the arena, the teams at the restart after
// Ukraine's eighth goal (8–4), Mykytiuk (No. 6) as Ukraine's deepest outfield player, then (cut) his celebration as the scoreboard goes
// to 9–4, and (cut) the 9–4 final whistle. His goal is NOT staged. Local u = metres from VENEZUELA's goal (Ukraine attack towards u = 0). ==========
const C1={tash:A(0,'in Tashkent'),ukr:A(0,'Ukraine play'),def:A(0,'Defender'),myk:A(0,'Mykola'),scores:A(0,'scores'),ninth:A(0,'ninth goal'),win:A(0,'Ukraine win'),nf:A(0,'nine four'),bronze:A(0,'bronze medal'),end:AUTH[0].seconds};
/** two whip pans (cuts in time): the 8–4 restart → his celebration (37'51", 9–4) → the final whistle (9–4) */
const W0=C1.scores-.14,W1=W0+.26,WM=(W0+W1)/2,V0=C1.win-.14,V1=V0+.26,VM=(V0+V1)/2;
/** the restart: Venezuela kick off (after conceding), Ukraine in their half, Mykytiuk the deepest outfield player */
const KO_UKR:[number,number][]=[[27.4,.4],[23.6,-4.2],[23.1,5.4],[21.2,.9]];// Mykytiuk, right ala, left ala, pivot
const KO_VEN:[number,number][]=[[19.55,.35],[16.2,4.6],[16.4,-5],[13.2,.3]];// the kicker by the ball, alas, fixo
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** his celebration (spot inferred): near the Venezuela box; the final whistle: Ukraine in a knot in the middle */
const CEL:[number,number]=[10.2,-2.6],FIN:[number,number]=[17.2,.6];
function kickoffGen(i:number,team:'ukr'|'ven'):LGen{const p=(team==='ukr'?KO_UKR:KO_VEN)[i];return t=>({pose:idle(t,i+(team==='ukr'?0:.37)),yaw:team==='ukr'?Math.PI:0,u:p[0],v:p[1]});}
const phaseOf=(T:number)=>T<WM?0:T<VM?1:2;
const liveM:LGen=T=>{const ph=phaseOf(T);
 if(ph===0)return kickoffGen(0,'ukr')(T);
 if(ph===1){const run=sm(WM,WM+.9,T,easeOut);return{pose:run<1?blendPose(celebrate((T-WM)*1.3,{kind:'run'}),celebrate((T-WM)*1.1,{kind:'arms'}),sm(WM+.6,WM+.9,T)):celebrate((T-WM)*1.1,{kind:'arms'}),yaw:-Math.PI/2+.5+.3*Math.sin((T-WM)*1.4),u:CEL[0]+(1-run)*2.2,v:CEL[1]+(1-run)*1.2};}
 return{pose:celebrate((T-VM)*1.1+.3,{kind:'arms'}),yaw:-Math.PI/2-.35,u:FIN[0]+.3,v:FIN[1]-1.2};};
const liveUkr=(i:number):LGen=>T=>{// i = 0..2: right ala, left ala, pivot
 const ph=phaseOf(T);
 if(ph===0)return kickoffGen(i+1,'ukr')(T);
 if(ph===1){const from:[number,number]=([[15.2,1.8],[16.6,-6.2],[20.4,.8]] as [number,number][])[i];
  const go=sm(WM,WM+1.5,T,easeOut),tgt:[number,number]=[CEL[0]+[.9,-.8,1.2][i],CEL[1]+[-.9,.9,.8][i]],u=lerp(from[0],tgt[0],go),v=lerp(from[1],tgt[1],go);
  return{pose:go<.95?celebrate((T-WM)*1.2+i*.3,{kind:'run'}):celebrate((T-WM)*1.1+i*.4,{kind:'arms'}),yaw:Math.atan2(CEL[1]-v,CEL[0]-u),u,v};}
 const spot:[number,number][]=[[FIN[0]-.9,FIN[1]+1.1],[FIN[0]+.8,FIN[1]+1.2],[FIN[0]-.6,FIN[1]-.2]];
 return{pose:celebrate((T-VM)*1.1+i*.37,{kind:'arms'}),yaw:-Math.PI/2+[.3,-.2,.5][i],u:spot[i][0],v:spot[i][1]};};
/** Venezuela after the goal and at the final whistle: heads down, hands on hips */
const DOWN=posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:30,rShA:30,lShF:-20,rShF:-20,lElb:110,rElb:110});
const liveVen=(i:number):LGen=>T=>{const ph=phaseOf(T);if(ph===0)return kickoffGen(i,'ven')(T);
 const base=(ph===1?[[5.4,3.6],[6.4,-6.2],[3.2,-.9],[13.4,5.8]]:[[22.2,5.8],[24.4,-6.6],[26.2,2.2],[20.6,7.4]])[i] as [number,number];
 return{pose:DOWN,yaw:ph<2?(i%2?.7:-.5):Math.PI*.8,u:base[0],v:base[1]};};
const liveGK:LGen=T=>T<WM?{pose:keeperSet(T*1.3),yaw:0,u:.7,v:0}:{pose:DOWN,yaw:.4,u:.8,v:-.4};
const liveCam=(T:number)=>({x:key(T,mono([[0,0],[C1.ukr,.8],[C1.def,6.4],[C1.myk,6.6],[W0,6.8],[W1,-9.2],[V0,-8.8],[V1,-3.2],[C1.end,-3]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.ukr,.6],[C1.def+.2,.88],[C1.myk+.3,.96],[W0,.9],[W1,.9],[C1.ninth,.94],[V0,.94],[V1,.96],[C1.end,1.02]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.def+.2,1000],[C1.myk,1020],[W1,990],[V0,990],[V1,960],[C1.end,950]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'4':[1,2,3,5],'8':[0,1,2,3,4,5,6],'9':[0,1,2,3,5,6]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** the arena scoreboard: Ukraine left (blue-over-yellow tab), Venezuela right (red tab); ring = a yellow ring round Ukraine's score; flash = the new digit */
function scoreboard(s:Sheet,st:Stage,camX:number,score:string,ring=0,flash=0){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=H*.62,y=top-H+H*.19;
 const tab=(ink:string,x:number,y0:number,hh:number)=>{const p=new Path2D();p.rect(x,y0,W*.16,hh);s.fill(ink,p);};
 tab(B,cx-W*.38,top-H+H*.05,H*.045);tab(Y,cx-W*.38,top-H+H*.095,H*.045);tab(R,cx+W*.22,top-H+H*.06,H*.07);
 digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,score[2],cx+W*.3-h*.55,y,h);s.knockout(lit);s.fill(Y,lit);
 if(flash>.02){const p=new Path2D();digit(p,score[0],cx-W*.3,y,h);s.fill(R,p,flash*.8);}
 if(ring>.02){const c:Pt=[cx-W*.3+h*.27,y+h*.5],rr=h*.72*ring;s.fill(Y,ribbon(blob(c[0],c[1],rr,rr*1.1,151,{n:20}),Math.max(5,h*.09),{seed:152,close:true,wobble:1.2}),1);}
 return{cx,W,H,top};
}
/** a bronze medal stamp (yellow + red screens make bronze on the paper) on a blue-and-yellow ribbon, with a big 3 */
function medal(s:Sheet,x:number,y:number,r:number,g:number){
 if(g<=.02)return;const R0=r*g,rib1=polyPath([[x-R0*.9,y-R0*2.6],[x-R0*.2,y-R0*2.6],[x+R0*.25,y-R0*.8],[x-R0*.45,y-R0*.8]],true),rib2=polyPath([[x+R0*.9,y-R0*2.6],[x+R0*.2,y-R0*2.6],[x-R0*.25,y-R0*.8],[x+R0*.45,y-R0*.8]],true);
 s.knockout(rib1);s.knockout(rib2);s.fill(B,rib1);s.fill(Y,rib2);
 const disc=polyPath(blob(x,y,R0,R0,171,{amp:.02,n:30}),true);s.knockout(disc);s.fill(Y,disc,.85);s.fill(R,disc,.5);s.fill(K,disc,.12);
 s.fill(K,ribbon(blob(x,y,R0,R0,171,{amp:.02,n:30}),Math.max(4,R0*.08),{seed:172,close:true,wobble:.6}),.9);
 const three=new Path2D(),h=R0*1.05;const SEG3=[0,2,3,5,6],w=h*.55,t=h*.14,x0=x-w/2,y0=y-h/2,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];
 for(const k of SEG3){const[a,b,c,d]=segs[k];three.rect(x0+a,y0+b,c,d);}s.knockout(three);s.fill(K,three,.85);
}
const ST1=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=ST1(c.x),ph=phaseOf(T);
 cam(s,0,c.y,c.zoom);
 courtSide(s,st,FA,T,{cheer:ph===0?.15:ph===1?.9*sm(C1.ninth-.3,C1.ninth+.2,T)+.3:1,flash:ph===1?pulse(T,C1.ninth,1.2):ph===2?pulse(T,VM,1.2)+.6*pulse(T,C1.nf,1.2):0,
  keeper:()=>{athlete(s,st,FA,liveGK,T,VEN_GK,{detail:'low'});}});
 const nine=ph===2||(ph===1&&T>=C1.ninth);
 const sb=scoreboard(s,st,c.x,nine?'9-4':'8-4',ph===2?easeOutBack(sm(C1.nf+.1,C1.nf+.5,T)):0,ph===1?pulse(T,C1.ninth,.8):0);
 const items:Item[]=[];
 KO_VEN.forEach((_,i)=>{const g=liveVen(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,VEN(i),{detail:'low'})});});
 [0,1,2].forEach(i=>{const g=liveUkr(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,UKR(i),{detail:'low'})});});
 items.push({z:depth(FA,liveM(T))-.02,draw:()=>athlete(s,st,FA,liveM,T,MYK,{detail:'mid'})});
 // the ball on the centre spot at the restart
 if(ph===0)items.push({z:10,draw:()=>{drawBallL(s,st,FA,{u:20,y:BALL_R,v:0,moving:false,spin:0},18);}});
 // "Defender": a red dashed ring under him; "Mykola": a yellow line across the court at his feet (the last line before the keeper)
 if(ph===0){const l=liveM(T),[X,Z]=toStage(FA,l.u,l.v),g=easeOutBack(sm(C1.def,C1.def+.35,T))*(1-sm(W0-.3,W0,T));if(g>.02)items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.15,22,50,g);floorDashRing(s,st,R,X,Z,1.15,14,51,g);}});
  const ln=sm(C1.myk,C1.myk+.6,T,easeOut)*(1-sm(W0-.3,W0,T));if(ln>.02)items.push({z:20.5,draw:()=>{const pts=[fp(st,FA,l.u+.9,-9.6),fp(st,FA,l.u+.9,0),fp(st,FA,l.u+.9,9.6)];cased(s,pts,14,52,{dash:46,progress:ln});}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "ninth goal": a spark over his head as the scoreboard ticks
 if(ph===1&&T>=C1.ninth&&T<C1.ninth+.6){const h=jointPt(st,FA,liveM(T),'head');sparkBurst(s,Y,h[0],h[1]-60,150,{n:12,seed:61,g:easeOut(sm(C1.ninth,C1.ninth+.35,T))});}
 // "bronze medal": the medal stamps in beside the scoreboard
 if(ph===2)medal(s,sb.cx-sb.W*.95,sb.top-sb.H*.5,sb.H*.62,easeOutBack(sm(C1.bronze,C1.bronze+.45,T)));
 // the whip pans: yellow speed lines sweep across the frame (cuts in time)
 for(const[a0,a1] of[[W0,W1],[V0,V1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(ST1(liveCam(tc).x),FA,liveM(tt),.14));},still:C1.def+.3};

// ================= chapter 2 — HOW HE DEFENDS (demonstration, real time, side-on, his goal on the LEFT): close, mirror, mirror, poke, go =================
const C2={how:A(1,'This is how'),close:A(1,'stays close'),behind:A(1,'behind the pivot'),pass:A(1,'The pass'),turn:A(1,'tries to turn'),slides:A(1,'slides across'),again:A(1,'Again'),blocked:A(1,'blocked'),pokes:A(1,'pokes'),goes:A(1,'goes'),end:AUTH[1].seconds};
const T2:WallT={hit:C2.pass+.12,recv:C2.pass+.7,t1:C2.turn,s1:C2.slides-.25,t2:C2.again-.05,s2:C2.blocked-.35,poke:C2.pokes+.08};
const wall=makeWall(T2);
const ST2:Stage={F:5200,eye:4.2,cx:-9.5,cz:-14};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=ST2,hit=pulse(t,T2.poke,.35);
  camPath(s,t,[[0,-180,640,1.02],[C2.how,-200,650,1.08],[C2.close,-220,650,1.3],[C2.behind,-220,650,1.34],[C2.pass,20,620,.92],[T2.recv+.2,-160,640,1.2],[C2.turn,-190,650,1.32],[C2.blocked,-200,650,1.34],[C2.pokes,-170,650,1.3],[C2.goes,60,640,1.1],[C2.end,200,640,1.04]],[5*hit*Math.sin(t*80),0]);
  courtSide(s,st,FA,tt,{cheer:.05+.4*sm(T2.poke,T2.poke+.5,tt),flash:pulse(tt,T2.poke,1),keeper:()=>{athlete(s,st,FA,wall.gk,tt,DEMO_K,{detail:'mid'});}});
  const M=wall.myk(tt),V=wall.pivot(tt),[MX,MZ]=toStage(FA,M.u,M.v);
  // "This is how he defends": a red dashed ring under him
  const rg=easeOutBack(sm(C2.how,C2.how+.35,tt))*(1-sm(C2.close-.1,C2.close+.3,tt));
  if(rg>.02){floorDashRing(s,st,K,MX,MZ,1,20,210,rg);floorDashRing(s,st,R,MX,MZ,1,12,211,rg);}
  // "stays close": a short yellow bracket from his feet to the pivot's (an arm's length)
  const cl=sm(C2.close,C2.close+.4,tt,easeOut)*(1-sm(C2.pass,C2.pass+.4,tt));
  if(cl>.02)cased(s,[fp(st,FA,M.u,M.v-.05),fp(st,FA,lerp(M.u,V.u,.5),M.v-.05),fp(st,FA,V.u,V.v-.05)],10,212,{dash:24,progress:cl});
  // "The pass": the lane from the passer to the pivot's feet lights up red
  const ln=sm(C2.pass-.1,C2.pass+.4,tt,easeOut)*(1-sm(T2.recv+.2,T2.recv+.6,tt));
  if(ln>.02){const b0=wall.ball(T2.recv);redLane(s,[fp(st,FA,PB0[0],PB0[1]),fp(st,FA,lerp(PB0[0],b0.u,.5),lerp(PB0[1],b0.v,.5)),fp(st,FA,b0.u,b0.v)],12,215,{progress:ln});}
  // "tries to turn" / "Again": the red turn arrows — each is stopped where the wall is ("slides across", "blocked")
  const a1=sm(C2.turn,C2.turn+.45,tt,easeOut)*(1-sm(C2.slides+.1,C2.slides+.35,tt))*.62;
  turnArrow(s,st,FA,TURN1,a1,216);
  const a2=sm(C2.again-.05,C2.again+.4,tt,easeOut)*(1-sm(C2.blocked+.2,C2.blocked+.45,tt))*.62;
  turnArrow(s,st,FA,TURN2,a2,218);
  // THE WALL: from "behind the pivot" until the poke, the yellow line across at his feet, sliding with him
  const wl=sm(C2.behind,C2.behind+.5,tt,easeOut)*(1-sm(T2.poke,T2.poke+.3,tt));
  const b=wall.ball(tt),bd=ballDir(st,FA,wall,tt);
  const moving=(tt>T2.s1&&tt<T2.s1+.4)||(tt>T2.s2&&tt<T2.s2+.45);
  const fast=moving?.1:(tt>T2.poke-.3&&tt<T2.poke+.1)?.12:0;
  const items:Item[]=[
   {z:depth(FA,wall.passer(tt)),draw:()=>athlete(s,st,FA,wall.passer,tt,DEMO_P,{detail:'mid'})},
   {z:depth(FA,V),draw:()=>athlete(s,st,FA,wall.pivot,tt,DEMO_V,{detail:'high'})},
   {z:MZ-.001,draw:()=>athlete(s,st,FA,wall.myk,tt,MYK_T,{detail:'high',smear:fast})},
   {z:depth(FA,b)-.02,draw:()=>{drawBallL(s,st,FA,b,221,9,bd);if(tt>=T2.poke&&tt<T2.poke+.4){const p=fp(st,FA,ICP[0],ICP[1],.2);sparkBurst(s,Y,p[0],p[1],120,{n:10,seed:222,g:easeOut(sm(T2.poke,T2.poke+.25,tt))});}}},
   {z:MZ+.4,draw:()=>wallLine(s,st,FA,M,wl,213,13)},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the blocks: a spark where each turn arrow meets the wall
  for(const[tb,pts,sd] of[[C2.slides+.1,TURN1,231],[C2.blocked,TURN2,233]] as [number,[number,number][],number][])if(tt>=tb&&tt<tb+.45){const p=fp(st,FA,pts[1][0],pts[1][1],.5);sparkBurst(s,R,p[0],p[1],110,{n:9,seed:sd,g:easeOut(sm(tb,tb+.3,tt))});}
  // "goes": a yellow arrow ahead of him into the space
  const ga=sm(C2.goes-.1,C2.goes+.4,tt,easeOut);
  if(ga>.02){const pts=[fp(st,FA,M.u+GO[0]*.9,M.v+GO[1]*.9),fp(st,FA,M.u+GO[0]*2.4,M.v+GO[1]*2.4),fp(st,FA,M.u+GO[0]*3.9,M.v+GO[1]*3.9)];cased(s,pts,13,218,{dash:44,progress:ga});if(ga>.9)casedHead(s,pts,40,219);}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(ST2,FA,wall.myk(tt),.13));},
 still:C2.behind+.5,
};

// ================= chapter 3 — WATCH AGAIN (slow-motion replay, reverse angle: knee-high, the same court turned round, his goal on the RIGHT) =================
const C3={watch:A(2,'Watch again'),stay:A(2,'Stay close'),slide:A(2,'slide across'),keep:A(2,'keep him'),poke:A(2,'poke it'),end:AUTH[2].seconds};
/** the replay re-uses the chapter 2 sequence, slowed and keyed to the words (sequence time = seq3(t)) */
const seq3=(t:number)=>key(t,mono([[0,T2.t1-.1],[C3.stay,T2.s1-.3],[C3.slide,T2.s1+.3],[C3.keep,T2.s2+.1],[C3.poke,T2.poke],[C3.end,T2.poke+1.1]]),linear);
const g3=(g:LGen):LGen=>t=>g(seq3(t));
const myk3=g3(wall.myk),pas3=g3(wall.passer),piv3=g3(wall.pivot),gk3=g3(wall.gk);
const ST3:Stage={F:2100,eye:1.05,cx:10.6,cz:-.5};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=ST3,q=seq3(tt),hit=pulse(q,T2.poke,.4);
  camPath(s,t,[[0,120,20,1.08],[C3.stay,60,10,1.2],[C3.slide,20,10,1.28],[C3.keep,0,10,1.34],[C3.poke,20,0,1.4],[C3.end,-260,20,1.12]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  courtSide(s,st,FR,tt,{cheer:.1+.5*sm(T2.poke,T2.poke+.6,q),flash:pulse(q,T2.poke,1.2),keeper:()=>{athlete(s,st,FR,gk3,tt,DEMO_K,{detail:'low'});}});
  const M=myk3(tt),[,MZ]=toStage(FR,M.u,M.v);
  const a1=sm(T2.t1,T2.t1+.45,q,easeOut)*(1-sm(T2.s1+.4,T2.s1+.7,q))*.62;turnArrow(s,st,FR,TURN1,a1,301,13);
  const a2=sm(T2.t2-.05,T2.t2+.4,q,easeOut)*(1-sm(T2.s2+.5,T2.s2+.8,q))*.62;turnArrow(s,st,FR,TURN2,a2,303,13);
  const wl=sm(C3.stay,C3.stay+.4,tt,easeOut)*(1-sm(T2.poke,T2.poke+.3,q));
  const b=wall.ball(q),bd=(()=>{const a=wall.ball(q-.05),p=fp(st,FR,a.u,a.v),r=fp(st,FR,b.u,b.v);return Math.atan2(r[1]-p[1],r[0]-p[0]);})();
  const moving=(q>T2.s1&&q<T2.s1+.4)||(q>T2.s2&&q<T2.s2+.45);
  const fast=moving?.25:(q>T2.poke-.3&&q<T2.poke+.1)?.22:0;
  const items:Item[]=[
   {z:depth(FR,pas3(tt)),draw:()=>athlete(s,st,FR,pas3,tt,DEMO_P,{detail:'mid'})},
   {z:depth(FR,piv3(tt)),draw:()=>athlete(s,st,FR,piv3,tt,DEMO_V,{detail:'high'})},
   {z:MZ-.001,draw:()=>athlete(s,st,FR,myk3,tt,MYK_T,{detail:'high',smear:fast})},
   {z:depth(FR,b)-.02,draw:()=>{drawBallL(s,st,FR,b,311,10,bd);if(q>=T2.poke&&q<T2.poke+.4){const p=fp(st,FR,ICP[0],ICP[1],.2);sparkBurst(s,Y,p[0],p[1],140,{n:11,seed:312,g:easeOut(sm(T2.poke,T2.poke+.3,q))});}}},
   {z:MZ-.5,draw:()=>wallLine(s,st,FR,M,wl,302,15)},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "poke it": a red ring round his right boot as it meets the ball
  const bt=easeOutBack(sm(C3.poke-.05,C3.poke+.3,tt))*(1-sm(C3.poke+.35,C3.poke+.6,tt));
  if(bt>.02){const tp=jointPt(st,FR,M,'rToe'),r=kAt(st,MZ)*.36*bt;s.fill(R,ribbon(blob(tp[0],tp[1],r,r*.75,321,{n:22}),10,{seed:322,close:true,wobble:1}),1);}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(ST3,FR,myk3(tt),.13));},
 still:C3.keep+.2,
};

// ================= chapter 4 — YOUR TURN: he runs it again; three cards (stay close, slide across, poke it away); a tick =================
const C4={your:A(3,'Your turn'),keep:A(3,'keep the attacker'),front:A(3,'in front'),turn:A(3,'let them turn'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T2.hit-.4],[C4.keep,T2.recv+.2],[C4.front,T2.s1+.2],[C4.turn,T2.s2+.3],[C4.end,T2.poke+1.6]]),linear);
const g4=(g:LGen):LGen=>t=>g(seq4(t));
const myk4=g4(wall.myk),pas4=g4(wall.passer),piv4=g4(wall.pivot),gk4=g4(wall.gk);
const ST4:Stage={F:2000,eye:1.9,cx:10.8,cz:-2};
const CARD_Y=660,CARD_W=175,CARDS:[number,number,'close'|'slide'|'poke'][]=[[-420,C4.keep,'close'],[0,C4.front,'slide'],[420,C4.turn,'poke']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=ST4,q=seq4(tt);
  camPath(s,t,[[0,-80,40,.98],[C4.your+.4,-40,300,.86],[C4.front,-20,300,.86],[C4.turn+.4,-140,290,.86],[C4.end,-300,290,.87]]);
  courtSide(s,st,FR,tt,{cheer:.1+.7*sm(T2.poke,T2.poke+.6,q)*(1-sm(C4.end-1,C4.end,tt)),flash:pulse(q,T2.poke,1.2),keeper:()=>{athlete(s,st,FR,gk4,tt,DEMO_K,{detail:'low'});}});
  const M=myk4(tt),[,MZ]=toStage(FR,M.u,M.v);
  const wl=sm(C4.keep,C4.keep+.5,tt,easeOut)*(1-sm(T2.poke,T2.poke+.3,q));
  const b=wall.ball(q);
  const items:Item[]=[
   {z:depth(FR,pas4(tt)),draw:()=>athlete(s,st,FR,pas4,tt,DEMO_P,{detail:'mid'})},
   {z:depth(FR,piv4(tt)),draw:()=>athlete(s,st,FR,piv4,tt,DEMO_V,{detail:'mid'})},
   {z:MZ-.001,draw:()=>athlete(s,st,FR,myk4,tt,MYK_T,{detail:'mid',smear:q>T2.poke-.3&&q<T2.poke+.05?.2:0})},
   {z:depth(FR,b)-.02,draw:()=>{drawBallL(s,st,FR,b,411,10);}},
   {z:MZ-.5,draw:()=>wallLine(s,st,FR,M,wl,401,13)},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Your turn"; each prints its step as it is said (stay close, slide across, poke it away)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+150;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+(kind==='poke'?-40:10),y:gy+25,height:330*(.9+.1*on),azimuth:kind==='close'?0:kind==='slide'?90:40,elevation:14,fov:18,at:[0,0,0]});
    const pose=kind==='close'?CLOSE(.5):kind==='slide'?SHUFFLE(.5,.5):lunge(.6,{side:'r'});
    const csk=solve(pose,BUILD,{}),Pp=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    // close = the attacker's back (a red dashed post) an arm's length in front; slide = a yellow two-way arrow under his feet; poke = the ball on the right boot
    if(kind==='close'){const a=Pp([.95,0,0]),h=Pp([.95,1.5,0]);dashed(s,R,[a,L2(a,h,.5),h],9,85,{dash:22});const w0=Pp([.25,0,-.5]),w1=Pp([.25,0,.5]);dashed(s,Y,[w0,L2(w0,w1,.5),w1],10,86,{dash:20});}
    if(kind==='slide'){const a=Pp([0,0,-.9]),c2=Pp([0,0,.9]),pts:Pt[]=[a,L2(a,c2,.5),c2];dashed(s,Y,pts,8,88,{dash:22});arrowHead(s,Y,pts,24,89);arrowHead(s,Y,pts.slice().reverse(),24,90);}
    drawAthlete(s,pose,fc,{...MYK_T,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    if(kind==='poke'){const tb:V3=[csk.rToe[0]+.1,BALL_R,csk.rToe[2]],p0=Pp(tb),bR=BALL_R*(fc.scale?fc.scale(tb):100);ball(s,p0[0],p0[1],bR,81+i);s.fill(R,ribbon(blob(p0[0],p0[1],bR*2.2,bR*1.8,90,{n:18}),6,{seed:93,close:true,wobble:1}),1);}
    s.restore();});
   s.fill(K,frames);}
  // "let them turn": a big tick (yellow over red, navy echo) stamps beside him after the poke
  const tick=easeOutBack(sm(T2.poke+.25,T2.poke+.7,q));
  if(tick>.02){const g=fp(st,FR,M.u,M.v),h=kAt(st,MZ)*1.8,c:Pt=[g[0]-h*.7,g[1]-h*.85],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.front+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'mykytiuk-futsal-signature',format:'futsal',title:'Mykola Mykytiuk: the defensive wall',theme:'Keep the attacker in front of you and don’t let them turn.',
 ageNote:'For players aged 7–12: the 2024 World Cup quarter-final, his goal for 9–4 and Ukraine’s bronze are real; the wall is shown as a demonstration. Stay close, don’t dive in.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in; a yellow wall springs up across its path and it stops against it; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const roll=sm(0,.4,age,easeOut),bx=x-160*(1-roll);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:(1-roll)*6});
  const wl=sm(.15,.4,age,easeOutBack)*(1-sm(.9,1.2,age));if(wl>.02){const pts:Pt[]=[[x+r*1.3,y+r*1.2],[x+r*1.3,y+r*1.2-r*2.6*wl]];s.fill(K,ribbon(pts,20,{seed:seed+5,taper:0,wobble:1}),.9);s.fill(Y,ribbon(pts,12,{seed,taper:0,wobble:1}),1);}
 },
};
export default film;
