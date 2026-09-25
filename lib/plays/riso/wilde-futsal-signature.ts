/** Wilde (futsal) — "the power pivot turn": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: the card's "Wilde" is Wilde Gomes da Silva (born 14 April 1981, Orós, Ceará, Brazil; 1.73 m), the Brazilian futsal PIVOT of
 *  MRA Navarra, ElPozo Murcia (2005–2010), FC Barcelona (2010–2016), Dinamo Moskva and Sparta Praha; FIFA Futsal World Cup winner 2008 and
 *  2012, UEFA Futsal Cup winner 2011/12 and 2013/14. Card: playerProfiles.json "Brazilian pivot and 2× World Cup winner (2008, 2012);
 *  multiple Spanish league titles as a powerful target player", strengths "Strong back-to-goal play"; playerAppearance.json country Brazil;
 *  highlight clips "FCB Futsal: Wilde vs El Pozo Murcia". Same player on every count — no mismatch.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the power pivot turn — not one match. No written source we could
 *  reach describes one dated Wilde turn, so the film follows the brief's honest FALLBACK. Chapter 1 is a REAL, documented match and shows
 *  only confirmed things: the 2012 UEFA Futsal Cup final, Sunday 29 April 2012, Pavelló Barris Nord, Lleida: MFK Dinamo Moskva 1–3
 *  FC Barcelona — Barça's first UEFA Futsal Cup. Wilde "shot them ahead in the second minute" and was named man of the match (and player of
 *  the tournament, 3 goals). No other futsal film uses this final (Gabriel/Paco Sedano: the 2014 finals in Baku; Jordi Torras: EURO 2012).
 *  1  LIVE (broadcast camera, main stand, real time), CONFIRMED THINGS ONLY: the teams lined up at the kick-off, board 0–0, a packed arena;
 *     whip pan (a cut in time) to just after his goal — the ball already in the Dinamo net, the board 1–0, Wilde celebrating with team-mates
 *     running in (HOW he scored is not shown: the report says only that Lin made it and Wilde shot); whip pan to the end: 3–1, a team-mate
 *     lifts the cup, Wilde beside him with a man-of-the-match star.
 *  2  HOW HE DOES IT (a demonstration, real time, side-on from the main stand, the goal on the LEFT, training tops and a neutral light-blue
 *     bib defender, no match claimed): back to goal, a team-mate passes in; he takes it on the sole of his right foot, sinks low with a wide
 *     base and leans back into the defender; his left arm feels where the defender is; when the defender leans onto his left shoulder, he
 *     spins the other way (to his right) with the ball on his right sole, and shoots with his right foot past the keeper.
 *  3  WATCH AGAIN (slow-motion replay, reverse three-quarter angle, knee-high): low, strong, turn.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Be strong with your back to goal and don't let the defender push you off."): he runs it
 *     again; three cards (back to goal, stay strong, turn); a tick.
 * Sources (written; fetched with curl, cached in scratchpad/films/src-cache/):
 *  - UEFA.com, "Futsal crown fits Barcelona nicely", Paul Saffer, Monday 30 April 2012 (uefa-futsalcup2012-crown-fits.txt): Barcelona beat
 *    2007 winners MFK Dinamo Moskva 3-1 in the final in Lleida's "packed out" 5,000-seat Pavelló Barris Nord; "masterful in the final from
 *    the moment man of the match Wilde shot them ahead in the second minute, a goal made by Lin who was to make it 2-0 not long after the
 *    break"; Rakhimov pulled one back with three minutes left; Torras walked the ball into the empty goal (Dinamo's Tatù as flying keeper)
 *    after Ari kept the ball in; coach Marc Carmona: "The fans helped us win the cup."
 *    https://www.uefa.com/uefafutsalchampionsleague/news/0257-0def040c6dca-f047189ce69f-1000--futsal-crown-fits-barcelona-nicely/
 *  - UEFA.com match page "Dynamo vs Barça", UEFA Futsal Champions League 2011/12 (uefa-futsalcup2012-final-match.txt): the fixture and the
 *    related articles (above). https://www.uefa.com/uefafutsalchampionsleague/match/2010222--dynamo-vs-barca/
 *  - Wikipedia, "2011–12 UEFA Futsal Cup" (raw; wiki-2011-12-uefa-futsal-cup.txt): final 29 April 2012, 19:30, Pavelló Barris Nord, Lleida,
 *    MFK Dinamo Moskva 1–3 FC Barcelona; goals Wilde 1', Lin 23', Jordi Torras 38' / Rakhimov 36'; attendance 5,517; top scorer and player
 *    of the tournament Wilde (3). (Wikipedia lists the goal at 1', UEFA's report "in the second minute" — the narration follows UEFA.)
 *  - Wikipedia, "Wilde (futsal player)" (raw; wiki-wilde-futsal.txt): Wilde Gomes da Silva, born 14 April 1981, Orós; 1.73 m; Pivot; clubs
 *    as above; honours: World Cups 2008 and 2012, UEFA Futsal Cup 2011/12 and 2013/14, two LNFS best-pivot and top-scorer awards.
 *  - Wikipedia, "2012 FIFA Futsal World Cup" / "2008 FIFA Futsal World Cup final round" (raw, cached by earlier films): Wilde in Brazil's
 *    winning squads (checked, not used on screen).
 * CONFIRMED: the competition, final, date, city/venue, the packed arena, Barça 3–1 Dinamo, Wilde's goal giving Barça the lead in the second
 *  minute (made by Lin), Wilde man of the match, Wilde Brazilian and a pivot. The narration states only these.
 * INFERRED (never named in the narration): kits — Barça blue-and-garnet stripes (navy/red), navy shorts and socks; Dinamo in white shirts
 *  with blue shorts and trim; Dinamo's keeper in yellow; the wood-look court; which end Barça attacked; where everyone stood; where he
 *  celebrated (drawn about 7 m out); who lifted the cup (an unnamed team-mate); the board's look and which side shows Barça; his hair (short,
 *  dark), skin and build (sturdy). No video was reviewed. Chapters 2–4 are a demonstration of a pivot's back-to-goal turn (which way he
 *  turns, his right foot and the angles are chosen to read clearly), not a recreation of any match play.
 * Technique (poses): back to goal, show for the ball and take it on the sole; sink — knees bent, a wide base, bottom back into the defender,
 *  chest over the ball — so he cannot be pushed off it; a hand/forearm back to FEEL where the defender is (never a push or hold); when the
 *  defender commits to one shoulder, spin the other way, dragging the ball round with the sole, and shoot early.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the spin and the shot). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across;
 *  +v is the left of a player facing +u); each stage maps it with a proper rotation (no mirror), so the right foot stays the right foot. Our
 *  stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagrams), red (Barça garnet, arrows), blue (Dinamo, the demo bib), navy (key line, Barça blue, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,stand,clampPose,runCycle,strike,STRIKE_CONTACT,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2012 final',text:'The 2012 UEFA Futsal Cup final, in Lleida. In the second minute, Wilde, from Brazil, shoots Barcelona ahead against Dinamo Moscow! Barça win three one, and Wilde is man of the match.',tail:2.4,
  cues:['The 2012','in Lleida','In the second','Wilde','from Brazil','shoots','ahead','against Dinamo','Barça win','three one','man of the match'],heads:{'The 2012':'Final 2012','ahead':'Barça 1–0','three one':'Barça 3–1','man of the match':'Man of the match'}},
 {label:'How he does it',text:'Wilde played pivot, up front. This is his power turn: back to goal, he takes the ball. He sinks low and leans into the defender. He feels where the defender is, then turns and shoots!',tail:2.2,
  cues:['Wilde played','up front','This is','power turn','back to goal','takes the ball','sinks low','leans into','feels where','then turns','shoots'],heads:{'This is':'The power pivot turn','shoots':''}},
 {label:'Watch again',text:'Watch again, slowly. Low, strong, turn!',tail:2.6,
  cues:['Watch again','Low','strong','turn'],heads:{'Watch again':'Slow motion','turn':''}},
 {label:'Your turn',text:'Your turn: back to goal, stay strong, don’t get pushed off, then turn!',tail:2.6,
  cues:['Your turn','back to goal','stay strong','pushed off','then turn'],heads:{'Your turn':'Strong, then turn','then turn':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/wilde-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/wilde-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/wilde-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('wilde-futsal: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('wilde-futsal: no cue '+w);return c.at;};
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
const SKIN:InkFill[]=[[Y,.66],[R,.4],[K,.12]];
/** Wilde: 1.73 m (Wikipedia), a sturdy target-man build */
const BUILD={height:1.73,bulk:1.16,thighs:1.1};
/** Wilde in the final: Barcelona — blue-and-garnet stripes (navy/red), navy shorts and socks (kit inferred), short dark hair */
const WILDE:AthleteStyle={shirt:K,pattern:'stripes',patternInk:R,shorts:K,socks:K,boots:'paper',skin:SKIN,hair:K,line:K,trim:Y,hairStyle:'short',build:BUILD,seed:13};
/** Wilde in the demonstration (chapters 2–4): a plain navy training top with garnet trim — no match is claimed */
const WILDE_TR:AthleteStyle={...WILDE,pattern:'plain',trim:R,socks:R};
const BAR=(n:number):AthleteStyle=>({shirt:K,pattern:'stripes',patternInk:R,shorts:K,socks:K,boots:K,skin:[[[Y,.78],[R,.24]],[[Y,.7],[R,.3]],[[Y,.8],[R,.2]],[[Y,.74],[R,.28]]][n%4] as InkFill[],hair:K,line:K,trim:Y,hairStyle:(['curly','bald','short','short'] as const)[n%4],build:{height:1.7+hash(n,3)*.14},seed:20+n});
/** Dinamo (change strip inferred): white shirts, blue shorts and trim, white socks */
const DYN=(n:number):AthleteStyle=>({shirt:'paper',shorts:B,socks:'paper',boots:K,skin:[[Y,.74],[R,.2]],hair:K,line:K,trim:B,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const DYN_GK:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.74],[R,.2]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:61};
/** the demonstration team-mate (passer, training top) and the defender (a neutral light-blue bib) — no team is claimed */
const DEMO_P:AthleteStyle={shirt:K,shorts:K,socks:R,boots:K,skin:[[Y,.8],[R,.24]],hair:K,line:K,trim:R,hairStyle:'curly',build:{height:1.74},seed:71};
const DEMO_D:AthleteStyle={shirt:[B,.45],shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'bald',build:{height:1.8,bulk:1.08},seed:77};
const DEMO_GK:AthleteStyle={shirt:[K,.55],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.22]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:78};
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

// ---------------- the arena: wood court, stands (Barça garnet, Dinamo blue), futsal goal ----------------
/** stepped navy rows, lit faces, garnet and blue shirts, blaugrana and white-and-blue flags, roof lights; cheer lifts the heads;
 * crowd = the share of seats taken (the final drew 5,517 to the 5,000-seat hall — packed; mostly Barça fans in Lleida) */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,crowd=.55){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),blues=new Path2D(),whites=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977;if(hash(i,8)>crowd)continue;const hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.34)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.39)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 // flags: Barça (garnet stripes on the navy) and, fewer, Dinamo (a blue band on white), waving
 for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const band=(v0:number,v1:number)=>polyPath([pole(0,v0),pole(.5,v0),pole(1,v0),pole(1,v1),pole(.5,v1),pole(0,v1)],true);
  if(f%3===1){whites.addPath(band(0,1));blues.addPath(band(.34,.66));}
  else for(let k=0;k<4;k+=2)reds.addPath(polyPath([pole(k/4,0),pole(k/4+.25,0),pole(k/4+.25,1),pole(k/4,1)],true));}
 s.fill(Y,heads,.6);s.knockout(whites);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** a futsal goal (3 m × 2 m) on any frame: net halftone + mesh bulging round (bu, by, bv); posts red/paper bands */
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
 /** a bar from a to b (u, y, v): a screen-space quad as wide as the bar at its depth, banded red/paper */
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
/** the court's painted lines in the local frame: goal line, the D (6 m quarter circles from the posts), 6 m and 10 m spots */
function courtLines(st:Stage,fr:Frame,lines:Path2D,uMax:number){
 const S=(pts:Pt[])=>pts.map(([u,v])=>toStage(fr,u,v) as Pt),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([6*Math.sin(a),-1.5-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([6*Math.sin(a),1.5+6*Math.cos(a)]);}
 lines.addPath(polyPath(floorStrip(st,S([[0,-10],[0,10]]),.05),true));lines.addPath(polyPath(floorStrip(st,S(arc),.05),true));
 for(const u of[6,10]){const[X,Z]=toStage(fr,u,0);lines.addPath(polyPath(floorRing(st,X,Z,.12,12),true));}
 for(const v of[-10,10])lines.addPath(polyPath(floorStrip(st,S([[0,v],[uMax,v]]),.05),true));
}


// ---- SIDE court from the broadcast position (chapters 1–2): the goal at X = −20, the near touchline Z = 0, the far boards Z = 21 ----
const TOUCH_FAR=20,BOARDS=21,FA:Frame={ox:-20,oz:10,rot:0};
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
type CourtOpt={cheer?:number;flash?:number;bulge?:number;bv?:number;by?:number;crowd?:number;keeper?:()=>void};
function courtSide(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(Y,rectPath(-span,wall,span*2,span),.45);s.fill(R,rectPath(-span,wall,span*2,span),.3);
 // planks run along the court (horizontal on screen), alternate strips tinted, butt joints staggered
 const strips=new Path2D(),seams=new Path2D(),X0=st.cx-30,X1=st.cx+30,z00=Math.max(-1,st.cz+.6);
 for(let k=0;k<46;k++){const z0=z00+k*.5,z1=z0+.5;if(z0>BOARDS)break;const a=proj(st,X0,0,z0),b=proj(st,X1,0,z1);if(hash(k,5)>.55)strips.rect(a[0],b[1],b[0]-a[0],a[1]-b[1]);seams.moveTo(a[0],a[1]);seams.lineTo(proj(st,X1,0,z0)[0],a[1]);
  for(let x=Math.floor(X0/2.4)*2.4+hash(k,9)*2.4;x<X1;x+=2.4){const p=proj(st,x,0,z0),q=proj(st,x,0,z1);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,FA,lines,40);
 lines.addPath(polyPath(floorStrip(st,[[0,0],[0,TOUCH_FAR]],.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx,o.crowd);
 goalNet(s,st,FA,bulge,bv,by);o.keeper?.();goalPosts(s,st,FA);
}
// ---- END-ON court (chapters 3–4): the camera looks along +Z toward his goal (centre X = 0, Z = GZ); the frame is turned 57° so the duel runs
//      across the frame at three-quarters: the defender nearer the camera, Wilde beyond him, the goal behind on the right ----
const GZ=11,WALLZ=13.6,FB:Frame={ox:0,oz:GZ,rot:-Math.PI/2-1};
function arena(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 const floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.45);s.fill(R,floor,.3);
 const strips=new Path2D(),seams=new Path2D(),near=st.cz+.35;
 for(let i=-40;i<40;i++){const X0=i*.5,X1=X0+.5;if(hash(i+40,5)>.55)strips.addPath(polyPath([proj(st,X0,0,near),proj(st,X1,0,near),proj(st,X1,0,WALLZ),proj(st,X0,0,WALLZ)],true));
  const a=proj(st,X0,0,near),b=proj(st,X0,0,WALLZ);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);
  for(let z=near+hash(i,9)*2.2;z<WALLZ;z+=2.2){const p=proj(st,X0,0,z),q=proj(st,X1,0,z);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.3);
 const lines=new Path2D();courtLines(st,FB,lines,Math.max(1,GZ-near));s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.4+.3,0,WALLZ)[0],x1=proj(st,i*2.4+1.9,0,WALLZ)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx,o.crowd);
 goalNet(s,st,FB,bulge,bv,by);o.keeper?.();goalPosts(s,st,FB);
}
/** a ball drawn on stage st through frame fr, with its floor shadow */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:BallL,seed:number,min=9){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,.45);ball(s,p[0],p[1],r,seed,{rot:b.spin});return{p,r};
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** the player's chest (the passage enters his striped shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
/** a joint of a player on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:'lKn'|'rKn'|'pelvis'|'head'|'rToe'|'rAn'|'chest'|'lHa'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];
/** the diagrams shared by chapters 2–4: the closing arrow, the low bracket, knee rings, the sight line, the "no" to the trick, the tick */
function lowBracket(s:Sheet,st:Stage,fr:Frame,l:Loc,g:number,seed:number){const pe=jointPt(st,fr,l,'pelvis'),gr=fp(st,fr,l.u,l.v),Z=depth(fr,l),w=kAt(st,Z)*.72*g,pts:Pt[]=[[gr[0]-w,gr[1]],[gr[0]-w,pe[1]],[gr[0]+w,pe[1]],[gr[0]+w,gr[1]]];cased(s,pts,16,seed,{dash:40});}
function kneeRings(s:Sheet,st:Stage,fr:Frame,l:Loc,g:number,seed:number){const Z=depth(fr,l),r=kAt(st,Z)*.16*g;for(const[k,n] of[['lKn',0],['rKn',1]] as const){const p=jointPt(st,fr,l,k);s.fill(R,ribbon(blob(p[0],p[1],r,r*.85,seed+n,{n:18}),8,{seed:seed+2+n,close:true,wobble:1}),1);}}
function sightLine(s:Sheet,st:Stage,fr:Frame,l:Loc,b:BallL,g:number,seed:number){const h=jointPt(st,fr,l,'head'),bp=fp(st,fr,b.u,b.v,b.y),Z=depth(fr,b),r=kAt(st,Z)*.26*(.6+.4*g);dashed(s,Y,[h,L2(h,bp,.5),bp],7,seed,{dash:22,progress:g});if(g>.6)s.fill(Y,ribbon(blob(bp[0],bp[1],r,r,seed+1,{n:18}),7,{seed:seed+2,close:true,wobble:.8}),1);}
function noCross(s:Sheet,st:Stage,fr:Frame,l:Loc,g:number,seed:number){const p=jointPt(st,fr,l,'rToe'),Z=depth(fr,l),r=kAt(st,Z)*.28*g,a:Pt[]=[[p[0]-r,p[1]-r*1.6],[p[0]+r,p[1]+r*.2]],b:Pt[]=[[p[0]+r,p[1]-r*1.6],[p[0]-r,p[1]+r*.2]];for(const q of[a,b]){const rb=ribbon(q,9,{seed,taper:.2,wobble:1});s.knockout(rb);s.fill(R,rb);}}
function tickAt(s:Sheet,c:Pt,S:number,seed:number){if(S<1)return;const tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
 const tp=ribbon(tk,S*.24,{seed,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:seed-1,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}

// ================= the power pivot turn (local frame: the goal he attacks at u = 0; he starts with his back to it, facing +u) =================
const cp=(d:Partial<Pose>)=>clampPose(posed(d));
/** ready: on the balls of the feet, a little bounce */
const ready=(t:number)=>{const b=Math.sin(t*5.2)*.5+.5;return cp({lHipF:16,rHipF:16,lKnee:28+6*b,rKnee:26+6*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:22,rShA:22,lElb:40,rElb:40});};
/** RECEIVE: the right sole comes onto the ball (toe up), the standing knee soft, arms out, eyes on the ball */
const RECV=cp({rHipF:34,rKnee:34,rAnk:-26,rHipA:6,lHipF:18,lKnee:44,lAnk:-8,lHipA:12,lean:22,neckP:30,lShA:40,rShA:46,lElb:40,rElb:44,squash:-.02});
/** SHIELD: back to goal — a wide base, knees well bent, bottom back into the defender, chest over the ball, arms wide */
const SHIELD_D:Partial<Pose>={lHipF:44,rHipF:40,lKnee:82,rKnee:76,lAnk:-12,rAnk:-12,lHipA:24,rHipA:24,lHipR:12,rHipR:10,lean:28,pitch:-4,dx:-.06,neckP:24,lShF:-26,lShA:42,lElb:30,rShF:10,rShA:48,rElb:52,squash:-.05};
const SHIELD=cp(SHIELD_D);
/** FEEL: the left forearm reaches back onto the defender (feeling, not holding), the head turns to look over the left shoulder */
const FEEL=cp({...SHIELD_D,lShF:-58,lShA:30,lElb:16,lHand:1,neckY:40,neckP:12,twist:10});
/** TURN: mid-spin to his right — the left (standing) knee bent, the right leg out and round with the ball on its sole, leaning into the turn */
const TURN=cp({lHipF:26,lKnee:62,lAnk:-10,lHipA:10,rHipF:24,rHipA:34,rHipR:-18,rKnee:52,rAnk:-8,lean:26,roll:-12,twist:-24,neckY:-34,neckP:16,lShA:66,lElb:40,rShA:44,rElb:62,squash:-.03});
/** the defender: tight behind him, knees bent, a forearm on his back */
const PRESS=cp({lHipF:34,rHipF:28,lKnee:64,rKnee:58,lHipA:16,rHipA:16,lean:30,pitch:4,neckP:10,rShF:62,rShA:12,rElb:26,rHand:1,lShF:40,lShA:30,lElb:40,lHand:1});
/** the defender after the turn: caught on the wrong side, arms out, looking back */
const CHECKED=cp({lHipF:30,rHipF:-8,lKnee:44,rKnee:34,lean:18,neckP:6,neckY:-40,lShA:56,rShA:62,lElb:30,rElb:34,twist:-14});
const WU=8.6,WV=0,DU=7.74,DV=.06,PU=15.2,PV=-1.1;
/** the target: low inside the far (left-of-keeper) post */
const GOAL_T={u:-.3,v:1.05,y:.5},FL=.3,PASS_D=.9;
/** his final facing (shooting at the far post from about (7.9, −.8)); the spin goes clockwise (to his right) from 0 */
const FY=Math.atan2(GOAL_T.v+.8,GOAL_T.u-7.9)-TAU;
type TurnT={pass:number;recv:number;low:number;feel:number;turn:number;turned:number;shot:number};
type BallL={u:number;y:number;v:number;spin:number};
type Move={wil:LGen;def:LGen;pas:LGen;gk:LGen;ball:(t:number)=>BallL;T:TurnT;RP:[number,number];PB0:[number,number];CB:[number,number]};
/** keyPoses needs increasing times */
function monoP(keys:[number,Pose][],gap=.05):[number,Pose][]{const o:[number,Pose][]=[];for(const[t,p] of keys){const tt=o.length?Math.max(t,o[o.length-1][0]+gap):t;o.push([tt,p]);}return o;}
const fwd=(l:Loc,d:number):[number,number]=>[Math.cos(l.yaw)*d,Math.sin(l.yaw)*d];
/** the ball point at a player's right sole/instep (local u, v), d metres ahead along his facing */
function sole(gen:LGen,t:number,d:number):[number,number]{const l=gen(t),{sk,J}=jointsL(l),an=J(sk.rAn),to=J(sk.rToe),f=fwd(l,d);return[lerp(an[0],to[0],.6)+f[0],lerp(an[2],to[2],.6)+f[1]];}
function makeMove(T:TurnT):Move{
 const jost=(t:number)=>Math.sin(t*7.3)*.035*sm(T.low,T.low+.3,t)*(1-sm(T.turn-.1,T.turn+.05,t));
 const wil:LGen=t=>{
  if(t<T.turn){const pose=t<T.recv-.4?ready(t):keyPoses(t,monoP([[T.recv-.4,ready(T.recv-.4)],[T.recv,RECV],[T.low+.3,SHIELD],[T.feel,SHIELD],[T.feel+.4,FEEL],[T.turn,FEEL]]));
   return{pose,yaw:0,u:WU-jost(t),v:WV};}
  if(t<T.turned){const k=sm(T.turn,T.turned,t,easeIO),pose=keyPoses(t,monoP([[T.turn,FEEL],[lerp(T.turn,T.turned,.5),TURN],[T.turned,strike(.24,{foot:'r'})]]));
   return{pose,yaw:FY*k,u:WU-.35*k,v:WV-.8*k};}
  const a=Math.min(1,(t-T.turned)/(T.shot-T.turned)),st=t<T.shot?lerp(.24,STRIKE_CONTACT,a):Math.min(.95,STRIKE_CONTACT+(t-T.shot)*.55);
  return{pose:strike(st,{foot:'r',power:1}),yaw:FY,u:WU-.35-.25*a,v:WV-.8};};
 const def:LGen=t=>{
  if(t<T.recv-.3)return{pose:ready(t+.4),yaw:0,u:DU,v:DV};
  const lean=.34*sm(T.feel,T.feel+.6,t,easeIO);
  if(t<T.turn)return{pose:keyPoses(t,monoP([[T.recv-.3,ready(T.recv-.3)],[T.recv+.1,PRESS],[T.turn,PRESS]])),yaw:0,u:DU-jost(t)*.9,v:DV+lean};
  const lt=Math.min(1,(t-T.turn)/.9),w=sm(T.turned+.2,T.turned+.7,t,easeIO);
  return{pose:blendPose(lunge(lt,{side:'l'}),CHECKED,w),yaw:-2.3*w,u:DU,v:DV+.34};};
 const s0=T.pass-STRIKE_CONTACT*PASS_D,PY=Math.atan2(WV-.12-PV,WU+.5-PU);
 const pas:LGen=t=>{
  if(t<s0)return{pose:ready(t+1.1),yaw:PY,u:PU,v:PV};
  if(t<s0+PASS_D)return{pose:strike((t-s0)/PASS_D,{foot:'r',power:.45}),yaw:PY,u:PU,v:PV};
  return{pose:blendPose(strike(1,{foot:'r',power:.45}),ready(t+1.1),sm(s0+PASS_D,s0+PASS_D+.5,t,easeIO)),yaw:PY,u:PU,v:PV};};
 const gk:LGen=t=>t<T.shot-.02?{pose:keeperSet(t*1.3),yaw:0,u:.6,v:0}:{pose:keeperDive(Math.min(.92,(t-T.shot+.02)/.8),{side:'l',height:.3}),yaw:0,u:.6,v:0};
 /** the drag: the sole rolls the ball round his right side as he spins, so it ends in front of him, toward the goal */
 const arcBall=(t:number):[number,number]=>{const l=wil(t),a=l.yaw-.35;return[l.u+.55*Math.cos(a),l.v+.55*Math.sin(a)];};
 const RP=sole(wil,T.recv,.06),PB0=sole(pas,T.pass,.12),CB=sole(wil,T.shot,.1),TD=arcBall(T.turned);
 const ball=(t:number):BallL=>{
  if(t<T.pass)return{u:PB0[0],v:PB0[1],y:BALL_R,spin:0};
  if(t<T.recv){const x=(t-T.pass)/(T.recv-T.pass),e=1-(1-x)**1.35;return{u:lerp(PB0[0],RP[0],e),v:lerp(PB0[1],RP[1],e),y:BALL_R,spin:-e*60};}
  if(t<T.turn){const w=sm(T.recv,T.recv+.25,t,easeIO),p=sole(wil,t,.13);return{u:lerp(RP[0],p[0],w),v:lerp(RP[1],p[1],w),y:BALL_R,spin:-60};}
  if(t<T.turned){const a=arcBall(t),h=sole(wil,T.turn,.13),w=sm(T.turn,T.turn+.15,t,easeIO);return{u:lerp(h[0],a[0],w),v:lerp(h[1],a[1],w),y:BALL_R,spin:-60+(t-T.turn)*14};}
  if(t<T.shot){const a=sm(T.turned,T.shot,t,easeIO);return{u:lerp(TD[0],CB[0],a),v:lerp(TD[1],CB[1],a),y:BALL_R,spin:-53+a*3};}
  if(t<T.shot+FL){const a=(t-T.shot)/FL;return{u:lerp(CB[0],GOAL_T.u,a),v:lerp(CB[1],GOAL_T.v,a),y:lerp(BALL_R,GOAL_T.y,a)+.18*Math.sin(Math.PI*a),spin:-50-a*30};}
  const a=sm(T.shot+FL,T.shot+FL+.5,t,easeOut);return{u:lerp(GOAL_T.u,-.72,a),v:GOAL_T.v,y:lerp(GOAL_T.y,BALL_R,a),spin:-80};};
 return{wil,def,pas,gk,ball,T,RP,PB0,CB};
}
/** the ball is in the net once it has crossed the line */
const inNet=(mv:Move,t:number)=>t>=mv.T.shot+FL;

// ================= chapter 1 — LIVE: the 2012 UEFA Futsal Cup final in Lleida. Only confirmed things: the kick-off at 0–0 in a packed arena,
// then (cut) the moment after Wilde's second-minute goal — ball in the net, board 1–0 — then (cut) 3–1, the cup, man of the match. =================
const C1={yr:A(0,'The 2012'),lleida:A(0,'in Lleida'),second:A(0,'In the second'),wilde:A(0,'Wilde'),brazil:A(0,'from Brazil'),shoots:A(0,'shoots'),ahead:A(0,'ahead'),dyn:A(0,'against'),win:A(0,'Barça win'),three:A(0,'three one'),mom:A(0,'man of'),end:AUTH[0].seconds};
/** two whip pans (cuts in time): the kick-off → just after his goal (1–0) → the final whistle and the cup (3–1) */
const W0=C1.second-.12,W1=W0+.26,WM=(W0+W1)/2,V0=C1.win-.14,V1=V0+.26,VM=(V0+V1)/2;
/** the kick-off (local u from the Dinamo goal; halfway = 20): Barça (attacking u → 0) in their half; Wilde, the pivot, nearest halfway (spots inferred) */
const KO_BAR:[number,number][]=[[21.3,1.6],[23.4,-4.6],[23.8,5],[27.6,.3]];// Wilde, then three team-mates
const KO_DYN:[number,number][]=[[18.4,-2.2],[16.2,4.6],[16.4,-5],[13.2,.3]];
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return cp({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** just after his goal: Wilde about 7 m out (inferred), arms up; team-mates run in to him */
const CEL:[number,number]=[6.8,-2.4];
const CEL_IN:[number,number][]=[[13.4,-4.4],[15.8,2.6],[19.6,-.6]];
/** the cup (3–1): the team in a knot, a team-mate lifts it, Wilde beside him */
const TRO:[number,number]=[12.4,.2];
function kickoffGen(i:number,team:'bar'|'dyn'):LGen{const p=(team==='bar'?KO_BAR:KO_DYN)[i];return t=>({pose:idle(t,i+(team==='bar'?0:.37)),yaw:team==='bar'?Math.PI:0,u:p[0],v:p[1]});}
const liveW:LGen=T=>{
 if(T<WM)return kickoffGen(0,'bar')(T);
 if(T<VM){const c=celebrate((T-WM)*1.1,{kind:'arms'});return{pose:c,yaw:-Math.PI/2+.4*Math.sin((T-WM)*1.4),u:CEL[0],v:CEL[1]};}
 return{pose:celebrate((T-VM)*1.1+.3,{kind:'arms'}),yaw:-Math.PI/2-.35,u:TRO[0]+.5,v:TRO[1]-1.2};};
const liveBar=(i:number):LGen=>T=>{// i = 0..2: the three team-mates
 if(T<WM)return kickoffGen(i+1,'bar')(T);
 if(T<VM){const a=CEL_IN[i],go=sm(WM,VM-.8,T,easeOut),tgt:[number,number]=[CEL[0]+[.9,-.8,1.1][i],CEL[1]+[-.9,.8,.9][i]],u=lerp(a[0],tgt[0],go),v=lerp(a[1],tgt[1],go);
  return{pose:go<.95?celebrate((T-WM)*1.2+i*.3,{kind:'run'}):celebrate((T-WM)*1.1+i*.4,{kind:'arms'}),yaw:yawTo(CEL[0]-u,CEL[1]-v),u,v};}
 const spot:[number,number][]=[[TRO[0]-.9,TRO[1]+1.1],[TRO[0]+.7,TRO[1]+1.3],[TRO[0]-.6,TRO[1]-1.9]];
 return{pose:celebrate((T-VM)*1.1+i*.37,{kind:'arms'}),yaw:-Math.PI/2+[.3,-.2,.5][i],u:spot[i][0],v:spot[i][1]};};
/** the team-mate who lifts the cup (not identified) */
const LIFT=cp({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:-6,neckP:-30,lShF:170,rShF:170,lShA:14,rShA:14,lElb:22,rElb:22,lHand:.3,rHand:.3});
const lifter:LGen=T=>({pose:blendPose(stand(),LIFT,sm(VM,VM+.7,T,easeOutBack)),yaw:-Math.PI/2,u:TRO[0],v:TRO[1]});
const SAD=cp({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:10,rShA:10,lElb:24,rElb:24});
const DYN_AFTER:[number,number][][]=[[[3.8,3.2],[5.6,-5],[2.4,-1.6],[9.4,5.6]],[[20.2,5.8],[22.4,-6.6],[24.2,2.2],[18.6,7.4]]];
const liveDyn=(i:number):LGen=>T=>{if(T<WM)return kickoffGen(i,'dyn')(T);
 const base=DYN_AFTER[T<VM?0:1][i];return{pose:SAD,yaw:T<VM?(i%2?2.6:-2.4):Math.PI*.8,u:base[0],v:base[1]};};
/** the Dinamo keeper: set at the kick-off; after the goal, turned to look at the ball in his net */
const liveGK:LGen=T=>T<WM?{pose:keeperSet(T*1.3),yaw:0,u:.7,v:0}:{pose:SAD,yaw:Math.PI-.9,u:1.7,v:-1.4};
const liveCam=(T:number)=>({x:key(T,mono([[0,-.5],[C1.lleida,0],[W0,.3],[W1,-15.6],[C1.dyn,-15.3],[V0,-15.1],[V1,-7.6],[C1.end,-7.4]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.lleida,.6],[W0,.63],[W1,.66],[C1.shoots,.7],[C1.dyn,.62],[V0,.6],[V1,1.05],[C1.mom,1.12],[C1.end,1.14]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.lleida,1040],[W1,1020],[C1.dyn,1010],[V0,1000],[V1,940],[C1.end,920]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'0':[0,1,2,4,5,6],'1':[2,5],'3':[0,2,3,5,6]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** the board (look and sides inferred): Barça (garnet tab) left, Dinamo (blue tab) right; glow flashes the digits when the score changes */
function scoreboard(s:Sheet,st:Stage,camX:number,score:string,glow=0){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=H*.62,y=top-H+H*.19;
 const tabs=(ink:string,x:number)=>{const p=new Path2D();p.rect(x,top-H+H*.06,W*.16,H*.07);s.fill(ink,p);};tabs(R,cx-W*.38);tabs(B,cx+W*.22);digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,score[2],cx+W*.3-h*.55,y,h);
 if(glow>.05){s.knockout(lit,glow);}s.fill(Y,lit);
}
/** the cup: paper with a navy key line and yellow glints, held between the lifter's hands */
function trophy(s:Sheet,st:Stage,l:Loc){const{sk,J}=jointsL(l),a=J(sk.lHa),b=J(sk.rHa),m=[(a[0]+b[0])/2,(a[1]+b[1])/2+.12,(a[2]+b[2])/2],[X,Z]=toStage(FA,m[0],m[2]),p=proj(st,X,m[1],Z),k=kAt(st,Z);
 const cup:Pt[]=[[-.2,-.5],[.2,-.5],[.16,-.28],[.05,-.2],[.05,-.06],[.13,0],[-.13,0],[-.05,-.06],[-.05,-.2],[-.16,-.28]].map(([x,y])=>[p[0]+x*k,p[1]+y*k] as Pt);
 const path=polyPath(smoothPts(cup,true,6,2),true);s.knockout(path);s.fill(K,ribbon([...smoothPts(cup,true,6,2),cup[0]],Math.max(3,k*.02),{seed:141,close:true,wobble:.5}));
 s.fill(Y,polyPath(blob(p[0]-.08*k,p[1]-.4*k,.03*k,.07*k,142,{n:10}),true));}
/** a five-point star (man of the match), knocked out then printed yellow over a navy shadow */
function star(s:Sheet,c:Pt,r:number,seed:number,rot=0){if(r<2)return;const q:Pt[]=[];for(let i=0;i<10;i++){const a=rot-Math.PI/2+i/10*TAU,rr=i%2?r*.45:r;q.push([c[0]+Math.cos(a)*rr,c[1]+Math.sin(a)*rr]);}
 const p=polyPath(q,true);s.fill(K,polyPath(q.map(v=>[v[0]+r*.12,v[1]+r*.12] as Pt),true),.55);s.knockout(p);s.fill(Y,p);s.fill(R,ribbon([...q,q[0]],Math.max(3,r*.06),{seed,close:true,wobble:.6}),.8);}
/** the ball resting in the Dinamo net after his goal (behind the line, low) */
const NET_BALL:BallL={u:-.5,y:BALL_R,v:-.8,spin:1};
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const phase=T<WM?0:T<VM?1:2;
 courtSide(s,st,T,{cheer:phase===0?.25+.3*pulse(T,C1.lleida,1.2):phase===1?.9:1,flash:phase===1?pulse(T,WM,1.2)+.5*pulse(T,C1.ahead,1):phase===2?pulse(T,VM,1.2)+.6*pulse(T,C1.three,1.2):0,crowd:.93,
  bulge:phase===1?.28*(1-sm(WM,WM+1.4,T))+.08*settle(T,WM,{amp:1,freq:3,decay:3}):0,bv:NET_BALL.v,by:.5,
  keeper:()=>{athlete(s,st,FA,liveGK,T,DYN_GK,{detail:'low'});if(phase===1)drawBallL(s,st,FA,NET_BALL,17,13);}});
 scoreboard(s,st,c.x,phase===0?'0-0':phase===1?'1-0':'3-1',phase===0?0:phase===1?pulse(T,C1.ahead,.8):pulse(T,C1.three,.8));
 const items:Item[]=[];
 KO_DYN.forEach((_,i)=>{const g=liveDyn(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,DYN(i),{detail:'low'})});});
 [0,1,2].forEach(i=>{const g=liveBar(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,BAR(i),{detail:'low'})});});
 if(phase===2)items.push({z:depth(FA,lifter(T)),draw:()=>{athlete(s,st,FA,lifter,T,BAR(3),{detail:'mid'});trophy(s,st,lifter(T));}});
 items.push({z:depth(FA,liveW(T))-.02,draw:()=>athlete(s,st,FA,liveW,T,WILDE,{detail:'mid'})});
 if(phase===0)items.push({z:10,draw:()=>{drawBallL(s,st,FA,{u:20,y:BALL_R,v:0,spin:0},18);}});
 // phase 0: "in Lleida" a red ring under each Barça player (the home crowd's team), blue under Dinamo; they fade at the whip pan
 if(phase===0){const gb=easeOutBack(sm(C1.lleida,C1.lleida+.35,T))*(1-sm(W0-.4,W0,T)),gd=easeOutBack(sm(C1.lleida+.5,C1.lleida+.85,T))*(1-sm(W0-.4,W0,T));
  if(gb>.02)KO_BAR.forEach((p,i)=>{const[X,Z]=toStage(FA,p[0],p[1]);items.push({z:Z+.9,draw:()=>floorDashRing(s,st,R,X,Z,.9,12,50+i,gb)});});
  if(gd>.02)KO_DYN.forEach((p,i)=>{const[X,Z]=toStage(FA,p[0],p[1]);items.push({z:Z+.9,draw:()=>floorDashRing(s,st,B,X,Z,.9,12,60+i,gd)});});}
 // phase 1: "Wilde" a red dashed ring under him; "against Dinamo" blue rings under the Dinamo players
 if(phase===1){const l=liveW(T),[X,Z]=toStage(FA,l.u,l.v),g=easeOutBack(sm(C1.wilde,C1.wilde+.35,T))*(1-sm(V0-.3,V0,T));if(g>.02)items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.15,22,70,g);floorDashRing(s,st,R,X,Z,1.15,14,71,g);}});
  const gd=easeOutBack(sm(C1.dyn,C1.dyn+.35,T))*(1-sm(V0-.3,V0,T));if(gd>.02)DYN_AFTER[0].forEach((p,i)=>{const[Xd,Zd]=toStage(FA,p[0],p[1]);items.push({z:Zd+.9,draw:()=>floorDashRing(s,st,B,Xd,Zd,.9,12,80+i,gd)});});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // phase 1: the ball in the Dinamo net, ringed yellow (it is small on the wide shot) from "shoots" to "against"
 if(phase===1){const g=easeOutBack(sm(C1.shoots,C1.shoots+.4,T))*(1-sm(C1.dyn+.2,C1.dyn+.7,T));if(g>.02){const[X,Z]=toStage(FA,NET_BALL.u,NET_BALL.v),p=proj(st,X,NET_BALL.y,Z),r=kAt(st,Z)*.42*g;s.fill(Y,ribbon(blob(p[0],p[1],r,r*.9,75,{n:20}),10,{seed:76,close:true,wobble:1}),1);s.fill(K,ribbon(blob(p[0]+5,p[1]+5,r,r*.9,75,{n:20}),4,{seed:77,close:true,wobble:1}),.6);}}
 // phase 2: "man of the match" a star over Wilde's head
 if(phase===2){const g=easeOutBack(sm(C1.mom,C1.mom+.45,T));if(g>.02){const h=jointPt(st,FA,liveW(T),'head'),k=kAt(st,depth(FA,liveW(T)));star(s,[h[0],h[1]-k*.62],k*.3*g,91,.15*Math.sin(T*2));}}
 // the whip pans: yellow speed lines sweep across the frame (cuts in time)
 for(const[a0,a1] of[[W0,W1],[V0,V1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
 // the trophy night: confetti in Barça colours
 if(phase===2){const u=sm(VM,VM+3,T,linear),top=proj(st,c.x,4,BOARDS)[1],x0=proj(st,c.x-9,0,10)[0],x1=proj(st,c.x+9,0,10)[0];confetti(s,[R,K,Y,'paper'],[x0,top-200+u*500,x1-x0,420],26,Math.floor(T*6),{size:16});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FA,liveW(tt),.14));},still:C1.shoots+.4};

// ================= the demonstration scene shared by chapters 2–4 =================
type Cues={ring?:[number,number];back?:[number,number];pass?:[number,number];low?:[number,number];lean?:[number,number];feel?:[number,number];turn?:[number,number];tick?:number};
const on=(tt:number,w:[number,number]|undefined,dur=.35)=>w?easeOutBack(sm(w[0],w[0]+dur,tt))*(1-sm(w[1]-.3,w[1],tt)):0;
/** a solid hand-drawn line, knocked out first */
function solid(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,cov=1){const p=ribbon(smoothPts(pts,false,8),width,{seed,pressure:.3,taper:.2,wobble:1.2});if(cov>=1)s.knockout(p);s.fill(ink,p,cov);}
/** "leans into": a red arrow from the small of his back into the defender (he pushes back with his body, never his hands) */
function pushArrow(s:Sheet,st:Stage,fr:Frame,l:Loc,g:number,seed:number){const{sk,J}=jointsL(l),pe=J(sk.pelvis),f=fwd(l,1),a:[number,number]=[pe[0]-f[0]*.18,pe[2]-f[1]*.18],b:[number,number]=[pe[0]-f[0]*(.18+.62*g),pe[2]-f[1]*(.18+.62*g)];
 const pts=[fp(st,fr,a[0],a[1],pe[1]),fp(st,fr,(a[0]+b[0])/2,(a[1]+b[1])/2,pe[1]+.03),fp(st,fr,b[0],b[1],pe[1])];solid(s,K,pts,30,seed,.9);solid(s,R,pts,18,seed);if(g>.6){arrowHead(s,K,pts,56,seed+2,.9);arrowHead(s,R,pts,44,seed+1);}}
/** "feels where": a yellow ring on his left hand (on the defender's side) */
function feelRing(s:Sheet,st:Stage,fr:Frame,l:Loc,g:number,seed:number){const p=jointPt(st,fr,l,'lHa'),r=kAt(st,depth(fr,l))*.24*g;s.fill(K,ribbon(blob(p[0]+4,p[1]+4,r,r*.9,seed,{n:18}),14,{seed:seed+1,close:true,wobble:1}),.6);s.fill(Y,ribbon(blob(p[0],p[1],r,r*.9,seed,{n:18}),12,{seed:seed+2,close:true,wobble:1}),1);}
/** "turns": a curved floor arrow round his spot, clockwise (to his right), ending toward the goal */
function turnArc(s:Sheet,st:Stage,fr:Frame,g:number,seed:number){const cu=WU-.2,cv=WV-.4,Rr=1.3,pts:Pt[]=[];for(let k=0;k<=14;k++){const a=.2+(FY-.2)*k/14;pts.push(fp(st,fr,cu+Rr*Math.cos(a),cv+Rr*Math.sin(a)));}cased(s,pts,18,seed,{dash:50,progress:g});if(g>.9)casedHead(s,pts,50,seed+1);}
function moveScene(s:Sheet,st:Stage,fr:Frame,mv:Move,tt:number,q:number,cu:Cues,o:{detail:'mid'|'high';smear:number;arena:'side'|'end';passer:boolean}){
 const T=mv.T,w=mv.wil(q),d=mv.def(q),b=mv.ball(q),net=inNet(mv,q),hit=q>=T.shot+FL?pulse(q,T.shot+FL,.5):0;
 const courtO:CourtOpt={cheer:.15*hit,flash:hit,crowd:.25,bulge:net?.3*(1-sm(T.shot+FL,T.shot+FL+1.4,q))+.06*settle(q,T.shot+FL,{amp:1,freq:3,decay:3}):0,bv:GOAL_T.v,by:GOAL_T.y,
  keeper:()=>{athlete(s,st,fr,mv.gk,q,DEMO_GK,{detail:'low'});if(net){const r=drawBallL(s,st,fr,b,311,9),g=easeOutBack(sm(T.shot+FL,T.shot+FL+.3,q))*(1-sm(T.shot+FL+1.2,T.shot+FL+1.6,q));if(g>.02){const rr=r.r*2.4*g;s.fill(K,ribbon(blob(r.p[0]+4,r.p[1]+4,rr,rr*.9,315,{n:18}),6,{seed:316,close:true,wobble:1}),.6);s.fill(Y,ribbon(blob(r.p[0],r.p[1],rr,rr*.9,315,{n:18}),9,{seed:317,close:true,wobble:1}),1);}}}};
 if(o.arena==='side')courtSide(s,st,tt,courtO);else arena(s,st,tt,courtO);
 // "back to goal": a dashed arrow from his heels back to the goal; "takes the ball": the pass line from the team-mate
 const gb=on(tt,cu.back);if(gb>.02){const pts=[fp(st,fr,w.u-.55,w.v),fp(st,fr,(w.u-.55)*.5,w.v+.1),fp(st,fr,.5,.1)];cased(s,pts,22,301,{dash:64,progress:Math.min(1,gb)});if(gb>.9)casedHead(s,pts,54,302);}
 const gp=on(tt,cu.pass,.5);if(gp>.02){const pts=[fp(st,fr,mv.PB0[0],mv.PB0[1]),fp(st,fr,(mv.PB0[0]+mv.RP[0])/2,(mv.PB0[1]+mv.RP[1])/2-.15),fp(st,fr,mv.RP[0],mv.RP[1])];cased(s,pts,13,303,{dash:44,progress:Math.min(1,gp)});}
 const tg=on(tt,cu.turn,.5);if(tg>.02)turnArc(s,st,fr,Math.min(1,tg),305);
 const pl=on(tt,cu.ring);if(pl>.02){const[X,Z]=toStage(fr,w.u,w.v);floorDashRing(s,st,K,X,Z,1,20,306,pl);floorDashRing(s,st,R,X,Z,1,12,307,pl);}
 const items:Item[]=[
  {z:depth(fr,d),draw:()=>athlete(s,st,fr,mv.def,q,DEMO_D,{detail:o.detail})},
  {z:depth(fr,w)-.001,draw:()=>athlete(s,st,fr,mv.wil,q,WILDE_TR,{detail:o.detail,smear:(q>T.turn&&q<T.turned)||(q>T.shot-.12&&q<T.shot+.15)?o.smear:0})},
 ];
 if(o.passer){const p=mv.pas(q);items.push({z:depth(fr,p),draw:()=>athlete(s,st,fr,mv.pas,q,DEMO_P,{detail:o.detail==='high'?'mid':'low'})});}
 if(!net)items.push({z:depth(fr,b)-.002,draw:()=>{const r=drawBallL(s,st,fr,b,311,9);if(q>=T.shot&&q<T.shot+FL){const dir=Math.atan2(fp(st,fr,GOAL_T.u,GOAL_T.v,GOAL_T.y)[1]-r.p[1],fp(st,fr,GOAL_T.u,GOAL_T.v,GOAL_T.y)[0]-r.p[0]);speedLines(s,Y,r.p[0],r.p[1],dir+Math.PI,{n:5,seed:312,len:r.r*5,spread:r.r*1.4,width:Math.max(5,r.r*.3),cov:.9});}
  if(q>=T.shot&&q<T.shot+.3){sparkBurst(s,Y,r.p[0],r.p[1],r.r*3.2,{n:9,seed:313,g:easeOut(sm(T.shot,T.shot+.25,q))});}}});
 items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
 const lo=on(tt,cu.low);if(lo>.02)lowBracket(s,st,fr,w,Math.min(1.1,lo),321);
 const pu=on(tt,cu.lean,.45);if(pu>.02)pushArrow(s,st,fr,w,Math.min(1,pu),331);
 const fe=on(tt,cu.feel);if(fe>.02)feelRing(s,st,fr,w,Math.min(1.1,fe),341);
 if(cu.tick!==undefined){const tk=easeOutBack(sm(cu.tick,cu.tick+.35,tt));if(tk>.02){const g=fp(st,fr,w.u,w.v),h=kAt(st,depth(fr,w))*1.8;tickAt(s,[g[0]-h*.55,g[1]-h*.95],h*.3*tk,409);}}
}

// ================= chapter 2 — HOW HE DOES IT (demonstration, real time, side-on): back to goal, take it, sink, lean, feel, turn, shoot =================
const C2={wilde:A(1,'Wilde played'),up:A(1,'up front'),how:A(1,'This is'),power:A(1,'power turn'),back:A(1,'back to goal'),takes:A(1,'takes the'),sinks:A(1,'sinks'),leans:A(1,'leans'),feels:A(1,'feels'),turns:A(1,'then turns'),shoots:A(1,'shoots'),end:AUTH[1].seconds};
const T2:TurnT=(()=>{const turn=C2.turns+.05,turned=turn+.55;return{pass:C2.takes-.45,recv:C2.takes+.4,low:C2.sinks,feel:C2.feels+.1,turn,turned,shot:Math.max(turned+.35,C2.shoots+.12)};})();
const mv=makeMove(T2);
const st2:Stage={F:3000,eye:2.4,cx:-12,cz:-.6};
const sx2=(u:number)=>fp(st2,FA,u,0)[0];
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),T=T2,hit=pulse(tt,T.shot,.35);
  // the camera (u = the court point it centres on): on Wilde; wide to show the goal behind him; the pass; tight on the duel; the shot
  const v=key(t,padKeys(mono([[0,WU+.2,440,1.2],[C2.up,WU,440,1.24],[C2.how,WU-1,420,.9],[C2.back,4.6,380,.44],[C2.takes-.9,5.4,380,.44],[C2.takes-.2,11.4,390,.5],[T.recv+.3,WU+1.2,420,.8],[C2.sinks+.3,WU-.3,450,1.14],[C2.feels+.4,WU-.4,460,1.2],[T.turn+.2,WU-.8,450,1.02],[T.shot,4.4,400,.52],[C2.end,4.2,400,.5]]),[0,0,1]),easeInOutSine,true);
  cam(s,sx2(v[0])+5*hit*Math.sin(t*80),v[1],v[2]);
  moveScene(s,st2,FA,mv,tt,tt,{ring:[C2.wilde,C2.how],back:[C2.back,C2.takes+.2],pass:[T.pass-.45,T.recv+.9],low:[C2.sinks,T.turn-.1],lean:[C2.leans,T.turn-.1],feel:[C2.feels,T.turn+.2],turn:[C2.turns-.1,T.shot+.9],tick:T.shot+FL+.5},{detail:'high',smear:.12,arena:'side',passer:true});
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,FA,mv.wil(tt),.13));},
 still:C2.leans+.3,
};
// ================= chapter 3 — WATCH AGAIN (slow-motion replay, reverse three-quarter angle, knee-high) =================
const C3={watch:A(2,'Watch'),low:A(2,'Low'),strong:A(2,'strong'),turn:A(2,'turn'),end:AUTH[2].seconds};
const seq3=(t:number)=>key(t,mono([[0,T2.recv-.3],[C3.low,T2.low+.25],[C3.strong,T2.feel+.1],[C3.turn,T2.turn+.05],[C3.turn+1.6,T2.shot+.25],[C3.end,T2.shot+1.3]]),linear);
const PB=toStage(FB,WU-.2,WV-.3);
const st3:Stage={F:1500,eye:1.1,cx:PB[0]-1.5,cz:PB[1]-5.6};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),q=seq3(tt),hit=pulse(q,T2.shot,.4);
  camPath(s,t,[[0,430,110,.9],[C3.low,440,130,1],[C3.strong,450,140,1.05],[C3.turn,520,130,.96],[C3.turn+1.2,760,110,.76],[C3.end,790,110,.76]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  moveScene(s,st3,FB,mv,tt,q,{low:[C3.low,C3.turn],lean:[C3.strong,C3.turn+.2],turn:[C3.turn,C3.end+1],tick:C3.turn+1.6},{detail:'high',smear:.4,arena:'end',passer:false});
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,FB,mv.wil(seq3(tt)),.13));},
 still:C3.strong+.3,
};

// ================= chapter 4 — YOUR TURN: he runs it again; three cards (back to goal, stay strong, turn); a tick =================
const C4={your:A(3,'Your'),back:A(3,'back to'),strong:A(3,'stay strong'),pushed:A(3,'pushed'),then:A(3,'then turn'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T2.recv-1],[C4.back,T2.recv],[C4.strong,T2.low+.3],[C4.pushed,T2.feel+.3],[C4.then,T2.turn],[C4.end,T2.shot+1.2]]),linear);
const st4:Stage={F:1500,eye:1.7,cx:PB[0]-1.3,cz:PB[1]-7.2};
const CARD_Y=760,CARD_W=175,CARD_X=215,CARDS:[number,number,'back'|'strong'|'turn'][]=[[CARD_X-420,C4.back,'back'],[CARD_X,C4.strong,'strong'],[CARD_X+420,C4.then-.1,'turn']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),q=seq4(tt);
  camPath(s,t,[[0,200,170,1.05],[C4.your+.4,220,340,.94],[C4.strong,220,340,.94],[C4.then+.4,200,335,.94],[C4.end,190,330,.95]]);
  moveScene(s,st4,FB,mv,tt,q,{tick:C4.end-.9},{detail:'mid',smear:.15,arena:'end',passer:false});
  // the three cards rise on "Your turn"; each prints its step as it is said
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const g=sm(tc0,tc0+.3,tt,easeOutBack);if(g<=.01)return;const gy=CARD_Y+dy+118;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+(kind==='back'?50:kind==='turn'?-10:0),y:gy+25,height:330*(.9+.1*g),azimuth:kind==='back'?0:kind==='strong'?40:70,elevation:14,fov:18});
    const pose=kind==='turn'?TURN:SHIELD;
    const csk=solve(pose,BUILD,{}),P=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    // back = a dashed arrow behind him to the goal; strong = the low bracket and a push-back arrow; turn = a curved arrow round him
    if(kind==='back'){const pts:Pt[]=[P([-.35,.05,0]),P([-1,.05,0]),P([-1.7,.05,0])];cased(s,pts,11,85,{dash:30});casedHead(s,pts,26,86);}
    if(kind==='turn'){const pts:Pt[]=[];for(let k=0;k<=12;k++){const a=.3+(FY+.3)*k/12;pts.push(P([Math.cos(a)*.8,.05,-Math.sin(a)*.8]));}cased(s,pts,11,88,{dash:30});casedHead(s,pts,26,89);}
    drawAthlete(s,pose,fc,{...WILDE_TR,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    const an=csk.rAn,to=csk.rToe,bp:V3=[lerp(an[0],to[0],.6)+.12,BALL_R,lerp(an[2],to[2],.6)],bpp=P(bp),bR=BALL_R*(fc.scale?fc.scale(bp):100);ball(s,bpp[0],bpp[1],bR,81+i);
    if(kind==='strong'){const pe=P(csk.pelvis),gd=P([0,0,0]),w=70;cased(s,[[gd[0]-w,gd[1]],[gd[0]-w,pe[1]],[gd[0]+w,pe[1]],[gd[0]+w,gd[1]]],7,87,{dash:20});const pb=P([csk.pelvis[0]-.2,csk.pelvis[1],csk.pelvis[2]]),pc=P([csk.pelvis[0]-.75,csk.pelvis[1],csk.pelvis[2]]);solid(s,R,[pb,pc],9,90);arrowHead(s,R,[pb,pc],24,91);}
    s.restore();});
   s.fill(K,frames);}
 },
 still:C4.strong+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'wilde-futsal-signature',format:'futsal',title:'Wilde’s power pivot turn',theme:'Be strong with your back to goal, then turn.',
 ageNote:'For players aged 7–12: the 2012 final and Wilde’s early goal are real; the turn is shown as a demonstration. Lean with your body, never push or hold with your hands.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball with a yellow arrow spinning round it (the turn); reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;s.fill(K,polyPath(blob(x,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);ball(s,x,y,r,seed,{rot:age*3});if(age<=0)return;
  const g=sm(0,.45,age,easeOut)*(1-sm(.9,1.2,age));if(g<=.02)return;const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=-.4-k/14*Math.PI*1.5*g;pts.push([x+Math.cos(a)*r*1.6,y+Math.sin(a)*r*1.1]);}
  const p=ribbon(pts,12,{seed,taper:.2,wobble:1});s.knockout(p);s.fill(Y,p);if(g>.9)arrowHead(s,Y,pts,26,seed+1);
 },
};
export default film;
