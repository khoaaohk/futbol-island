/** Stefano Mammarella — "the big-tournament save": a signature riso film (iconic plays, FUTSAL, goleiro).
 *
 * WHY THIS MOMENT: Mammarella's entry (lib/town/iconicPlays.json) is a signature — the big-tournament save — not one match. UEFA's written
 * report of the UEFA Futsal EURO 2014 final describes ONE of his saves in words, so the film recreates that save:
 *  1  LIVE (broadcast camera, main stand, real time): the final, 8 Feb 2014, Italy 3–1 Russia, Sportpaleis, Antwerp. Italy lead 2–1 (Murilo
 *     13:50). At 18:38 Eder Lima (Russia #8), whose 9:33 equaliser was "a brilliant turn and diagonal shot", tries it again; "Eder Lima
 *     nearly repeated his first equaliser, but Stefano Mammarella tipped over" (UEFA report; commentary: 18:38 effort, 18:39 save).
 *  2  REPLAY (slow motion, low, behind the shooter): the diagonal shot, the fingertips, the ball up and over the bar. "After the corner"
 *     (Abramov, 18:40), "Humberto Honorio sent Daniel Giasson clear" — 3–1 at 18:56, and Italy are European champions.
 *  3  HOW A GOLEIRO ORGANISES (a demonstration, no match claimed): from the broadcast side, higher: he sees the whole court, talks, sends one
 *     defender to press and one to cover, and keeps all four in front of him.
 *  4  PRACTISE (lesson from the entry's `lesson`: "Talk to your defenders and keep them organised in front of you"): on his line, facing us:
 *     talk, point, set — three cards — then the big save.
 * Sources (written; fetched once and cached in scratchpad/films/src-cache/):
 *  - UEFA.com match report, Paul Saffer, "Italy beat Russia to win UEFA Futsal EURO 2014" (8 Feb 2014), archived:
 *    https://web.archive.org/web/2014/http://www.uefa.com/futsaleuro/season=2014/matches/round=2000402/match=2013809/postmatch/report/index.html
 *    — goals 6:02 Gabriel Lima, 9:33 Eder Lima ("brilliant turn and diagonal shot"), 13:50 Murilo, 18:56 Giasson; "Eder Lima nearly repeated
 *    his first equaliser, but Stefano Mammarella tipped over. And after the corner, Humberto Honorio sent Daniel Giasson clear to slip the ball
 *    past Gustavo for Italy's third."; later "Robinho did sting the palms of Mammarella"; line-ups: 1 Mammarella (GK), 8 Eder Lima, 13 Giasson,
 *    6 Honorio, 9 Abramov, 12 Gustavo (GK); Italy captain Gabriel Lima; sell-out crowd at the Sportpaleis.
 *  - UEFA.com minute-by-minute commentary of the same match (archived 28 Feb 2014): "18:38 Eder Lima (Russia) has an effort on goal. 18:39
 *    Mammarella (Italy) makes a save. 18:40 Abramov (Russia) delivers the corner. … 18:56 Giasson (Italy) scores! Daniel Giasson breaks".
 *    https://web.archive.org/web/20140228102302/http://www.uefa.com/futsaleuro/season=2014/matches/round=2000402/match=2013809/postmatch/commentary/index.html
 *  - UEFA.com photo captions of the final (Sportsfile): Mammarella celebrates with the trophy; "Italy captain Gabriel Lima lifts the trophy".
 *  - Wikipedia, "UEFA Futsal Euro 2014" (raw): final 8 Feb 2014 20:30, Sportpaleis Antwerp, Italy 3–1 Russia, attendance 11,552.
 *  - Wikipedia, "Stefano Mammarella" (raw): goalkeeper, 1.77 m, Acqua e Sapone; Futsal EURO 2014 winner; FIFA Futsal World Cup 2012 best
 *    goalkeeper (Golden Glove, also in wiki "2012 FIFA Futsal World Cup").
 * CONFIRMED: match, date, venue, score before (2–1) and after (3–1), minute 18:38–18:39, shooter Eder Lima (#8) trying "a turn and diagonal
 *  shot" again, Mammarella (#1) tipping it over the bar, the corner that followed, Giasson's break for 3–1 at 18:56, Italy champions.
 * INFERRED (not named in the narration): kits — Italy blue shirts / white shorts / blue socks, Russia white shirts / navy shorts,
 *  Mammarella in a red keeper kit with long sleeves; the wooden court colour; which goal, which top corner (the near post from the camera),
 *  the dive side (his right) and tipping hand (the top glove), Eder Lima's shooting foot (LEFT, from the card's `foot` param in
 *  iconicPlays.json, matching the Eder Lima film), where everyone else stood, the pass before the turn;
 *  Mammarella's hair (short). No video was reviewed. Mammarella was NOT captain in this final (Gabriel Lima was): no armband is drawn.
 *  Chapters 3–4 are a coaching demonstration of how a goleiro organises the four in front of him, not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike and the dive). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 * z → −Z. Eder Lima cushions, dribbles and strikes with the LEFT foot (foot:'l'; the ball sits at the solved left toe at contact, as in
 * the Eder Lima film); Mammarella dives to his right (keeperDive side 'r') and the ball meets his top glove — the ball's target IS the
 * solved glove position, so hand and ball always meet.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wooden court, lights, diagram lines), red (Mammarella's kit, goal bands, press arrow), blue (Italy, run-off, shield),
 * navy (key line, Russia shorts, stands). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet
 * (card window 1.45:1 → square). Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a
 * frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,keeperTip,celebrate,posed,blendPose,keyPoses,mirrorPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2014 final',text:'The 2014 Futsal Euro final. Italy lead Russia, two to one. Eder Lima turns and shoots for the top corner. Mammarella flies up and tips it over the bar!',tail:2.2,
  cues:['The 2014','Italy lead','two to one','Eder Lima','turns','shoots','top corner','Mammarella','flies up','tips it over'],heads:{'The 2014':'Euro final 2014','two to one':'2–1','tips it over':'Saved!'}},
 {label:'Replay: the fingertips',text:'Watch again. His fingertips push the ball up and over. From that corner, Italy break and score. Three to one. Champions!',tail:2.2,
  cues:['Watch again','His fingertips','up and over','From that corner','Italy break','Three to one','Champions'],heads:{'Three to one':'3–1','Champions':'Champions'}},
 {label:'How a goleiro organises',text:'A goleiro sees the whole court. So talk! Tell one defender to press, one to cover, and keep all four in front of you.',tail:2.2,
  cues:['A goleiro','whole court','So talk','Tell one','press','one to cover','keep all four'],heads:{'So talk':'Talk!','keep all four':'Four in front'}},
 {label:'Practise it',text:'Talk to your defenders and keep them organised. Then you’re ready for the big save!',tail:2.6,
  cues:['Talk to','your defenders','keep them organised','ready for','big save'],heads:{'keep them organised':'Organised','big save':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/mammarella-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/mammarella-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/mammarella-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('mammarella: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('mammarella: no cue '+w);return c.at;};
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

/** pose keys with increasing times (cues can crowd after re-timing) */
function monoP(Kk:[number,Pose][],gap=.05):[number,Pose][]{const o:[number,Pose][]=[];for(const k of Kk){const t=o.length?Math.max(k[0],o[o.length-1][0]+gap):k[0];o.push([t,k[1]]);}return o;}

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
const quad3=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean over the court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);void seed;}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** floor path (X,Z pairs) → screen points */
const fp=(st:Stage,pts:[number,number][]):Pt[]=>pts.map(p=>proj(st,p[0],0,p[1]));

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.86],[R,.3]];
/** Mammarella: Italy #1 (UEFA line-up), 1.77 m (Wikipedia); a red keeper kit, long sleeves, white gloves, short dark hair (all inferred) */
const BUILD_K={height:1.77,bulk:1.02};
const MAMMA:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:SKIN,hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',number:1,numberInk:'paper',hairStyle:'short',build:BUILD_K,seed:1};
/** Italy outfield: blue shirts, white shorts, blue socks (inferred) */
const ITA=(n:number):AthleteStyle=>({shirt:B,shorts:'paper',socks:B,boots:K,skin:[[Y,.84],[R,.28]],hair:K,line:K,trim:'paper',hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.72+hash(n,3)*.12},seed:20+n});
/** Russia: white shirts, navy shorts (inferred); Eder Lima #8 */
const RUS=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:R,hairStyle:n%2?'short':'bald',build:{height:1.74+hash(n,4)*.1},seed:40+n});
const EDER:AthleteStyle={...RUS(0),number:8,numberInk:R,hairStyle:'short',build:{height:1.78,bulk:1.04},seed:48};
const BUILD_S={height:1.78,bulk:1.04};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** Eder Lima's LEFT-foot strike (card param, as in his own film) */
const strikeL=(t:number)=>strike(t,{foot:'l'});
/** where the ball sits at the left-foot strike's contact: just past the left toe (library coords, place at the origin, turned to yaw) */
function strikeBall(yaw:number):V3{const sk=solve(strikeL(STRIKE_CONTACT),BUILD_S,{yaw}),toe=sk.lToe,an=sk.lAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}
/** the dive (to his right, top-corner height); the ball meets his TOP glove (the left, uppermost as he rolls onto his right side)
 * at .45, while he is still rising, before full extension */
const DIVE_H=1,DIVE_TIP=.45;
const dive=(u:number)=>keeperDive(u,{side:'r',height:DIVE_H});
/** the top glove at the tip, in OUR coords, for a keeper at (0,0) turned to yaw */
function gloveAt(yaw:number):V3{const sk=solve(dive(DIVE_TIP),BUILD_K,placeAt(0,0,yaw));return toMine(sk.lHa);}

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;smear?:number;dir?:number}={}){
 const{rot=0,smear=0,dir=0}=o;let pts=blob(x,y,r,r,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);s.fill(K,crescent(x,y,r*1.02,[-.42,-.45]),.2);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);
function ballOn(s:Sheet,st:Stage,X:number,Yh:number,Z:number,seed:number,o:{min?:number;rot?:number;smear?:number;dir?:number;sh?:number}={}){
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15*(1+Yh*.15),r*.3,seed+5,(o.sh??.45)/(1+Yh));ball(s,p[0],p[1],r,seed,{rot:o.rot,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, blue / yellow / red shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.3)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.4)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.5)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the wooden court: a warm yellow floor with long plank strips (a few tinted) and paper lines */
function woodFloor(s:Sheet,st:Stage,x0:number,z0:number,x1:number,z1:number,alongX:boolean){
 const court=polyPath(floorQuad(st,x0,z0,x1,z1),true);s.knockout(court);s.fill(Y,court,.62);s.fill(R,court,.1);
 const planks=new Path2D();
 if(alongX){for(let z=Math.ceil(z0/.9)*.9;z<z1;z+=1.8)planks.addPath(polyPath(floorQuad(st,x0,z,x1,z+.9),true));}
 else{for(let x=Math.ceil(x0/.9)*.9;x<x1;x+=1.8)planks.addPath(polyPath(floorQuad(st,x,z0,x+.9,z1),true));}
 s.fill(Y,planks,.22);
}

// ---- LIVE / DEMO court from the broadcast position: camera outside the near touchline; Italy's goal at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number,eye=6,cz=-13,F=4500):Stage=>({F,eye,cx:camX,cz});
type SideOpt={cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void;under?:()=>void};
function courtSide(s:Sheet,st:Stage,t:number,o:SideOpt={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.3);
 woodFloor(s,st,-20,0,20,TOUCH_FAR,true);
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X+6,GOAL_X+10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(B,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 o.under?.();
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
function sidePosts(s:Sheet,st:Stage,shiver=0){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,GOAL_X+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>proj(st,GOAL_X,H+dy+shiver*Math.sin((Z-POST_N)/3*Math.PI),Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ---- REPLAY / PRACTISE court facing the goal end (camera looks along +Z): goal centre (0, GZ), wall behind it ----
const GZ=11,WALLZ=13.4;
type ArenaOpt={cheer?:number;flash?:number;t?:number;keeper?:(st:Stage)=>void;behind?:(st:Stage)=>void;shiver?:number};
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,t=0,shiver=0}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.3);
 woodFloor(s,st,-10,-30,10,GZ,false);
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
 s.fill(B,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 o.behind?.(st);goalEnd(s,st);o.keeper?.(st);postsEnd(s,st,shiver);
}
function goalEnd(s:Sheet,st:Stage){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H));
 const out=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(const X of[Lx,Rx])for(let Yh=0;Yh<=H+1e-6;Yh+=.4){const a=proj(st,X,Yh,GZ),b=back(X,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,GZ)*.018),.6);
}
function postsEnd(s:Sheet,st:Stage,shiver=0){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number,wob:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy+wob*Math.sin((X-Lx)/3*Math.PI),GZ);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];
  if(!vert&&wob!==0){const pts:Pt[]=[];for(let k=0;k<=12;k++){const X=lerp(a[0],b[0],k/12);pts.push(P(X,H,0,w));}for(let k=12;k>=0;k--){const X=lerp(a[0],b[0],k/12);pts.push(P(X,H,0,-w));}frame.addPath(polyPath(pts,true));edge.addPath(ribbon([...pts,pts[0]],Math.max(2,kAt(st,GZ)*.012),{seed:3,taper:0,wobble:.4}));}
  else{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,GZ)*.012),{seed:3,taper:0,wobble:.4}));}
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8,0);bar([Rx,0],[Rx,H],8,0);bar([Lx,H],[Rx,H],12,shiver);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}

// ================= chapter 1 — LIVE: the 2014 final, 18:38; Eder Lima turns and shoots, Mammarella tips it over =================
const C1={y:A(0,'The 2014'),lead:A(0,'Italy lead'),two:A(0,'two to'),eder:A(0,'Eder'),turns:A(0,'turns'),shoots:A(0,'shoots'),top:A(0,'top corner'),mam:A(0,'Mammarella'),flies:A(0,'flies'),tips:A(0,'tips it'),end:AUTH[0].seconds};
/** the shot: contact on "shoots"; ≈25 m/s → about .38 s to his glove at the near-post top corner */
const T_HIT=C1.shoots+.1,T_TIP=T_HIT+.38,T_LAND=T_TIP+.85;
const GL1=gloveAt(FACE_RIGHT);
/** the glove at full stretch: just inside the near post, under the bar; the keeper's set spot is solved back from it */
const TIP1:V3=[GOAL_X+.42,Math.min(1.95,GL1[1]),POST_N+.3];
const K1:[number,number]=[TIP1[0]-GL1[0],TIP1[2]-GL1[2]];
const SHOT:[number,number]=[-11.3,11.7];
const YAW_SHOT=yawTo(TIP1[0]-SHOT[0],TIP1[2]-SHOT[1]);
const SB=toMine(strikeBall(YAW_SHOT)),PLANT:[number,number]=[SHOT[0]-SB[0],SHOT[1]-SB[2]];
/** over the bar: up off the glove, over the crossbar, down behind the goal */
const OVER:V3=[GOAL_X-.45,2.75,POST_N+.3],DROP:V3=[GOAL_X-2.1,BALL_R,POST_N-.4];
/** build-up (inferred): the far wide man → Abramov (near side) → Eder Lima, back to goal at the top of the D */
const WIDE:[number,number]=[-9.2,16.6],ABR:[number,number]=[-5.9,6.3],RECV:[number,number]=[-10.5,12.15];
const P1=[.55,1.45],P2=[C1.two+.25,C1.eder+.02];
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 const roll=(a:[number,number],b:[number,number],t0:number,t1:number)=>{const u=sm(t0,t1,T,easeOut);return{X:lerp(a[0],b[0],u),Y:BALL_R,Z:lerp(a[1],b[1],u),flying:false,spin:u*8};};
 if(T<P1[0])return{X:WIDE[0]+.4,Y:BALL_R,Z:WIDE[1]-.3,flying:false,spin:0};
 if(T<P2[0])return roll([WIDE[0]+.4,WIDE[1]-.3],[ABR[0]-.4,ABR[1]+.2],P1[0],P1[1]);
 if(T<P2[1]+.02)return roll([ABR[0]-.4,ABR[1]+.2],RECV,P2[0],P2[1]);
 if(T<T_HIT){const u=sm(P2[1]+.1,T_HIT-.3,T,easeIO),a=Math.PI*.5*u;return{X:lerp(RECV[0],SHOT[0],u)+Math.sin(a*2)*.25,Y:BALL_R,Z:lerp(RECV[1],SHOT[1],u)-Math.sin(a*2)*.2,flying:false,spin:8+u*6};}
 if(T<T_TIP){const u=sm(T_HIT,T_TIP,T,linear),M:V3=[lerp(SHOT[0],TIP1[0],.5),TIP1[1]*.72+.1,lerp(SHOT[1],TIP1[2],.5)],p=quad3([SHOT[0],BALL_R,SHOT[1]],M,TIP1,u);return{X:p[0],Y:p[1],Z:p[2],flying:true,spin:20+u*40};}
 if(T<T_TIP+.75){const u=sm(T_TIP,T_TIP+.75,T,linear),p=quad3(TIP1,OVER,DROP,u);return{X:p[0],Y:p[1],Z:p[2],flying:true,spin:60+u*20};}
 const u=sm(T_TIP+.75,T_TIP+1.6,T,easeOut),bo=Math.abs(Math.sin(u*Math.PI*2))*.35*(1-u);return{X:DROP[0]-1.1*u,Y:BALL_R+bo,Z:DROP[2]-.4*u,flying:false,spin:80+u*10};
}
/** Eder Lima: comes short → back to goal for the pass → cushions it → turns (past the camera side) → left-foot strike → hands to head */
const S_T0=T_HIT-.62;
const liveE:Gen=T=>{
 const stT=key(T,[[S_T0,0],[S_T0+.3,.22],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,1]],linear);
 const X=key(T,[[0,-9.4],[P2[0]-.3,-9.9,easeIO],[P2[1],RECV[0]+.45],[S_T0,PLANT[0]+.5,easeIO],[T_HIT,PLANT[0],easeOut],[T_HIT+.5,PLANT[0]-.3,easeOut],[C1.end,PLANT[0]-.5,easeIO]]);
 const Z=key(T,[[0,13.8],[P2[0]-.3,12.6,easeIO],[P2[1],RECV[1]+.1],[S_T0,PLANT[1]+.2,easeIO],[T_HIT,PLANT[1],easeOut],[T_HIT+.5,PLANT[1]-.15,easeOut],[C1.end,PLANT[1]-.3,easeIO]]);
 const faceABR=yawTo(ABR[0]-RECV[0],ABR[1]-RECV[1]);let pose:Pose,yaw=faceABR;
 if(T<P2[0]-.3)pose=runCycle(T*runCadence(.3),{speed:.3});
 else if(T<P2[1]+.08)pose=blendPose(stand(),mirrorPose(posed({rHipF:30,rKnee:32,rAnk:-6,lKnee:24,lean:16,neckP:26,lShA:36,rShA:30,lElb:40,rElb:40})),sm(P2[0],P2[1],T));
 else if(T<S_T0)pose=dribble((T-P2[1])*1.7+.2,{foot:'l',speed:.25});
 else if(T<T_HIT+.55)pose=blendPose(dribble((S_T0-P2[1])*1.7+.2,{foot:'l',speed:.25}),strikeL(stT),sm(S_T0,S_T0+.12,T));
 else{const u=sm(T_HIT+.55,T_TIP+.7,T,easeIO);pose=blendPose(strikeL(1),posed({lHipF:10,rHipF:14,lKnee:14,rKnee:16,lean:-8,neckP:-24,lShF:150,rShF:150,lShA:30,rShA:30,lElb:120,rElb:120}),u);}
 // the turn: from facing the passer to facing the near post, turning through the camera side (his right)
 if(T>=P2[1]+.08&&T<T_HIT+.55){let d=YAW_SHOT-faceABR;while(d>0)d-=TAU;while(d<-TAU)d+=TAU;yaw=faceABR+d*sm(P2[1]+.08,S_T0+.2,T,easeIO);}
 else if(T>=T_HIT+.55){let d=YAW_SHOT-faceABR;while(d>0)d-=TAU;yaw=faceABR+d;}
 return{pose,yaw,X,Z};
};
/** Mammarella live: set on his line, shuffles across with the ball, loads and dives to his right; lands; up on his knees */
const kSet:[number,number]=[K1[0],10.1];
const liveK:Gen=T=>{
 const Zs=lerp(kSet[1],K1[1],sm(P2[0],S_T0,T,easeIO)),u=key(T,[[T_HIT-.14,0],[T_HIT,.18],[T_TIP,DIVE_TIP],[T_LAND,1]],linear);
 let pose=keeperSet(T*1.3),X=K1[0],Z=Zs;
 pose=blendPose(pose,posed({lHipF:44,rHipF:44,lHipA:16,rHipA:16,lKnee:52,rKnee:52,lean:18,lShF:40,rShF:40,lShA:30,rShA:30,lElb:60,rElb:60,lHand:1,rHand:1}),sm(S_T0-.1,T_HIT-.14,T)*(1-sm(T_HIT-.14,T_HIT,T)));
 if(T>=T_HIT-.14)pose=dive(u);
 if(T>T_LAND+.3){const g=sm(T_LAND+.3,C1.end-.3,T,easeIO);pose=blendPose(pose,posed({lHipF:30,rHipF:80,lKnee:110,rKnee:90,lean:10,lShF:40,rShF:120,lShA:30,rShA:40,lElb:40,rElb:30,rHand:1,neckP:-10}),g);X=K1[0]+.2*g;Z=K1[1]-1.4*g;}
 return{pose,yaw:FACE_RIGHT,X,Z};
};
/** Italy (blue): D1 goal-side of Eder Lima (blocks late), D2 near post side, D3 far side, D4 presses Abramov */
const ITA_POS:[number,number][]=[[-12.3,12.4],[-14.4,7.6],[-14.0,15.6],[-7.4,7.9]];
const liveI=(i:number):Gen=>T=>{const[x0,z0]=ITA_POS[i],shift=sm(P2[0],P2[1]+.5,T,easeIO);
 const X=x0+(i===3?-1.6:i===0?.3:-.4)*shift,Z=z0+(i===3?1.2:i===0?-.35:-.2)*shift;let pose=backpedal(T*1.4+i*.3);
 if(i===0){const lu=key(T,[[T_HIT-.4,0],[T_HIT+.05,.6],[T_HIT+.6,1]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_HIT-.5,T_HIT-.35,T));}
 const saved=sm(T_TIP+.3,T_TIP+1.2,T);pose=blendPose(pose,posed({lHipF:8,rHipF:8,lKnee:12,rKnee:12,lean:4,lShF:60,rShF:60,lShA:40,rShA:40,lElb:80,rElb:80,neckP:-10}),saved*.8);
 const face=i===3?yawTo(ABR[0]-x0,ABR[1]-z0):FACE_RIGHT+(i===1?.3:i===2?-.3:0);
 return{pose,yaw:lerp(face,FACE_LEFT-.4,saved*.6),X,Z};};
/** Russia (white): the wide man, Abramov, the pivot at the far post; Eder Lima drawn with liveE */
const RUS_POS:[number,number][]=[WIDE,ABR,[-15.6,13.6]];
const liveR=(i:number):Gen=>T=>{const[x0,z0]=RUS_POS[i],kick=i===0?pulse(T,P1[0]-.05,.3):i===1?pulse(T,P2[0]-.05,.3):0;
 let pose=blendPose(stand(),posed({lHipF:-10,rHipF:40,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2));
 const drift=sm(P2[1],T_HIT,T,easeIO),X=x0-(i===2?0:1.4*drift),Z=z0-(i===2?.6*drift:0);
 if(i===2)pose=blendPose(backpedal(T*1.2),posed({lHipF:20,rHipF:20,lKnee:30,rKnee:30,lean:14,lShA:30,rShA:30}),.4);
 const face=i===0?yawTo(ABR[0]-x0,ABR[1]-z0):i===1?yawTo(RECV[0]-x0,RECV[1]-z0):FACE_RIGHT;
 return{pose,yaw:face,X,Z};};
const liveCam=(T:number)=>({x:key(T,mono([[0,-10.8],[P1[1],-10.4],[P2[1],-11.8],[S_T0,-13.6],[T_HIT,-14.8],[T_TIP,-15.8],[T_TIP+.6,-16.4],[C1.mam,-16.6],[C1.end,-16.4]]),easeInOutSine),
 zoom:key(T,mono([[0,.62],[P2[1],.66],[S_T0,.72],[T_TIP,.74],[C1.mam,.9],[C1.tips,.96],[C1.end,.92]]),easeInOutSine),
 y:key(T,mono([[0,1040],[S_T0,1030],[T_TIP,1010],[C1.mam,1000],[C1.end,1000]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),tip=pulse(Tc,T_TIP,.4);
 cam(s,0,c.y+3*tip*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),saved=T>=T_TIP;
 courtSide(s,st,T,{cheer:saved?.9*sm(T_TIP,T_TIP+.4,T)+.1:.1,flash:pulse(T,T_TIP,1)+.6*pulse(T,C1.tips,1.2),
  keeper:()=>{athlete(s,st,liveK,T,MAMMA,{detail:'low',smear:T>T_HIT&&T<T_TIP+.1?.1:0});}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 ITA_POS.forEach((_,i)=>{const g=liveI(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ITA(i),{detail:'low'})});});
 RUS_POS.forEach((_,i)=>{const g=liveR(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,RUS(i+1),{detail:'low'})});});
 items.push({z:liveE(T).Z,draw:()=>athlete(s,st,liveE,T,EDER,{smear:T>T_HIT-.2&&T<T_HIT+.25?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45/(1+b.Y));
  if(b.flying&&T<T_TIP+.4){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_HIT,T-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.4,{seed:17,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.4:0,dir:Math.PI*.95});
  if(T>=T_TIP&&T<T_TIP+.4){const q=proj(st,TIP1[0],TIP1[1],TIP1[2]);sparkBurst(s,Y,q[0],q[1],60,{n:9,seed:19,g:easeOut(sm(T_TIP,T_TIP+.25,T))});}}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** Mammarella's chest (the passage enters his red shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD_K,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveK(tt),.16));},still:T_TIP+.02};

// ================= chapter 2 — REPLAY: slow motion, low, behind the shooter: the diagonal shot, the fingertips, over; 3–1, champions =================
const C2={watch:A(1,'Watch'),fing:A(1,'His finger'),over:A(1,'up and'),corner:A(1,'From that'),brk:A(1,'Italy break'),three:A(1,'Three'),champ:A(1,'Champ'),end:AUTH[1].seconds};
/** replay world = the live shot seen end-on: he is 2.1 m right of the goal centre, 9.4 m out; the glove is at the near (left) top corner */
const GL2=gloveAt(FACE_CAMERA);
const RT:V3=[-1.08,Math.min(1.95,GL2[1]),GZ-.4];
const K2:[number,number]=[RT[0]-GL2[0],RT[2]-GL2[2]];
const RB:[number,number]=[2.1,GZ-9.4];
const RYAW=yawTo(RT[0]-RB[0],RT[2]-RB[1]);
const RSB=toMine(strikeBall(RYAW)),RPL:[number,number]=[RB[0]-RSB[0],RB[1]-RSB[2]];
const R_HIT=C2.watch+1.05,R_TIP=Math.max(R_HIT+1.2,C2.fing+.45),R_LAND=R_TIP+1.6;
const ROVER:V3=[RT[0]-.15,2.8,GZ+.35],RDROP:V3=[RT[0]-.3,BALL_R,GZ+1.7];
const rT=(t:number)=>key(t,[[0,.06],[R_HIT-.9,.3],[R_HIT,STRIKE_CONTACT],[R_HIT+1.6,.8],[C2.brk,1]],linear);
const repE:Gen=t=>{let pose=strikeL(rT(t));const X=RPL[0]+key(t,[[0,.3],[R_HIT,0,easeOut],[R_HIT+1.8,-.15]]),Z=RPL[1]+key(t,[[0,-.55],[R_HIT,0,easeOut],[R_HIT+1.8,.25]]);
 pose=blendPose(pose,posed({lHipF:10,rHipF:14,lKnee:14,rKnee:16,lean:-8,neckP:-24,lShF:150,rShF:150,lShA:30,rShA:30,lElb:120,rElb:120}),sm(R_TIP+.4,R_TIP+1.4,t,easeIO));
 return{pose,yaw:RYAW,X,Z};};
function repBall(t:number){
 if(t<R_HIT)return{X:RB[0],Y:BALL_R,Z:RB[1],flying:false};
 if(t<R_TIP){const u=sm(R_HIT,R_TIP,t,linear),M:V3=[lerp(RB[0],RT[0],.5),RT[1]*.72+.1,lerp(RB[1],RT[2],.5)],p=quad3([RB[0],BALL_R,RB[1]],M,RT,u);return{X:p[0],Y:p[1],Z:p[2],flying:true};}
 const u=sm(R_TIP,R_TIP+1.5,t,linear);if(u<1){const p=quad3(RT,ROVER,RDROP,u);return{X:p[0],Y:p[1],Z:p[2],flying:true};}
 return{X:RDROP[0],Y:RDROP[1],Z:RDROP[2],flying:false};}
/** Mammarella in the replay: set, loads as the ball comes, full stretch on "His fingertips", lands; up and celebrating on "Champions" */
const repK:Gen=t=>{const u=key(t,[[R_HIT-.35,0],[R_HIT+.2,.2],[R_TIP,DIVE_TIP],[R_LAND,1]],linear);let pose=t<R_HIT-.35?keeperSet(t*.5):dive(u),X=K2[0],Z=K2[1];
 const up=sm(C2.champ-.6,C2.champ+.2,t,easeIO);if(up>0){pose=blendPose(pose,celebrate((t-C2.champ)*1.1,{kind:'arms'}),up);X=lerp(K2[0],K2[0]-1.6,up);Z=lerp(K2[1],K2[1]-.6,up);}
 return{pose,yaw:FACE_CAMERA+.15*up,X,Z};};
/** the Italian defender who blocks late (D1) and the Russian pivot at the far post */
const repD:Gen=t=>({pose:blendPose(backpedal(.2),lunge(key(t,[[R_HIT-1,0],[R_HIT+.3,.6],[R_HIT+2,1]],linear),{side:'r'}),sm(R_HIT-1.1,R_HIT-.8,t)),yaw:FACE_CAMERA-.5,X:RB[0]+.9,Z:RB[1]+2.6});
const repP:Gen=t=>({pose:blendPose(backpedal(t*.4),stand(),.5),yaw:FACE_CAMERA-.6,X:2.6,Z:GZ-3.4});
/** the replay camera rides with the shooter's plant (the left-foot contact puts him ≈.3 m right of the right-foot solve), so he keeps
 * the same foreground framing over his left shoulder */
const st2=(t:number):Stage=>({F:1500,eye:1.45,cx:RPL[0]-1.12,cz:RPL[1]-4.32+.8*sm(R_HIT,R_TIP,t,easeIO)});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(tt),hit=pulse(t,R_HIT,.4),tip=pulse(t,R_TIP,.6);
  const kp=proj(st,RT[0],RT[1],RT[2]);
  camPath(s,t,[[0,-240,210,1.3],[R_HIT-.6,-230,230,1.38],[R_HIT,-200,230,1.34],[R_HIT+.6,-80,160,1.2],[C2.fing-.2,kp[0]*.8,kp[1]*.9+60,1.6],[R_TIP,kp[0]*.8,kp[1]*.9+40,1.75],[C2.over+.4,kp[0]*.7,kp[1]*.8+10,1.7],[C2.corner,-40,150,1.2],[C2.brk+.3,0,260,1.05],[C2.champ,-60,160,1.15],[C2.end,-70,160,1.18]],[8*hit*Math.sin(t*90)+10*tip*Math.sin(t*70),5*hit*Math.cos(t*77)+6*tip*Math.cos(t*60)]);
  const b=repBall(tt),behind=b.Z>GZ+.05;
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.1,r*.3,96,.45/(1+b.Y));ball(s,p[0],p[1],r,97,{rot:tt*6,smear:b.flying?.35:0,dir:Math.atan2(.3,1)});
   if(tt>=R_HIT&&tt<R_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:98,g:easeOut(sm(R_HIT,R_HIT+.3,tt))});};
  arena(s,st,{t:tt,cheer:tt>R_TIP?.7*sm(R_TIP,R_TIP+.5,tt)+.3*pulse(tt,C2.champ,2)+.2:0,flash:pulse(tt,R_TIP,1)+.7*pulse(tt,C2.three,1.2)+.7*pulse(tt,C2.champ,1.4),shiver:.05*settle(tt,R_TIP+.3,{amp:1,freq:5,decay:4}),
   behind:()=>{if(behind)drawBall();},
   keeper:stg=>{
    // "His fingertips": a yellow ring round the glove and the ball; "up and over": the dashed yellow arc over the bar
    const on=easeOutBack(sm(C2.fing,C2.fing+.35,tt))*(1-sm(C2.corner,C2.corner+.4,tt));
    if(on>.02){const q=proj(stg,RT[0],RT[1],RT[2]),rr=kAt(stg,RT[2])*.42*on;s.fill(Y,ribbon(blob(q[0],q[1],rr,rr*.9,91,{n:24}),9,{seed:94,close:true,wobble:1}),1);}
    athlete(s,stg,repK,tt,MAMMA,{detail:'high',smear:tt>R_HIT+.2&&tt<R_TIP+.2?.25:0});
    if(tt>=R_TIP-.05&&tt<R_TIP+.8){const q=proj(stg,RT[0],RT[1],RT[2]);sparkBurst(s,Y,q[0],q[1],110,{n:12,seed:99,g:easeOut(sm(R_TIP-.05,R_TIP+.3,tt))*(1-sm(R_TIP+.5,R_TIP+.8,tt))});}
   }});
  if(tt>R_HIT){const pts:Pt[]=[];for(let k=0;k<=18;k++){const q=repBall(lerp(R_HIT,Math.min(tt,R_TIP),k/18));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,10,95,{dash:40,cov:.9*(1-sm(C2.corner,C2.corner+.5,tt))});}
  if(tt>C2.over-.1){const u=sm(C2.over-.1,C2.over+.6,tt,easeOut)*(1-sm(C2.corner,C2.corner+.5,tt)),pts:Pt[]=[];for(let k=0;k<=14;k++){const q=quad3(RT,ROVER,RDROP,k/14*.72);pts.push(proj(st,q[0],q[1]+.12,q[2]));}if(u>.02){dashed(s,Y,pts,12,301,{dash:36,progress:u});if(u>.9)arrowHead(s,Y,pts,36,302);}}
  const its:{z:number;draw:()=>void}[]=[{z:repD(tt).Z,draw:()=>athlete(s,st,repD,tt,ITA(0),{detail:'mid'})},{z:repP(tt).Z,draw:()=>athlete(s,st,repP,tt,RUS(3),{detail:'mid'})},
   {z:repE(tt).Z,draw:()=>athlete(s,st,repE,tt,EDER,{detail:'high',smear:tt>R_HIT-.5&&tt<R_HIT+.4?.3:0})}];
  if(!behind)its.push({z:b.Z<repE(tt).Z+.4&&!b.flying?repE(tt).Z+.01:b.Z,draw:drawBall});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "Italy break": a blue break arrow races back up the court toward us (the counter after the corner: Honorio → Giasson)
  if(tt>=C2.brk-.1){const u=sm(C2.brk-.1,C2.brk+.7,tt,easeOut)*(1-sm(C2.champ,C2.champ+.5,tt));if(u>.02){const pts=fp(st,[[-3.6,GZ-1.6],[-1.2,GZ-3.4],[2,GZ-5],[4.6,GZ-5.8]]);dashed(s,B,pts,22,303,{dash:60,progress:u});if(u>.9)arrowHead(s,B,pts,60,304);
   const e=proj(st,4.6,.5,GZ-5.8);speedLines(s,B,e[0],e[1],Math.PI*.05,{n:5,seed:305,len:200*u,spread:120});}}
  // "Champions": blue, yellow and paper confetti in front of the stands
  if(tt>=C2.champ-.2){const u=sm(C2.champ-.2,C2.champ+2.5,tt,linear),top=proj(st,0,6,WALLZ)[1];confetti(s,[B,Y,'paper'],[-900,top-200+u*520,1800,420],26,Math.floor(tt*6),{size:16});}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2(tt),repK(tt),.15));},
 still:R_TIP+.05,
};

// ================= chapter 3 — HOW A GOLEIRO ORGANISES (demonstration): sees, talks, press, cover, four in front =================
const C3={gol:A(2,'A goleiro'),court:A(2,'whole court'),talk:A(2,'So talk'),tell:A(2,'Tell one'),press:A(2,'press'),cover:A(2,'one to cover'),four:A(2,'keep all four'),end:AUTH[2].seconds};
/** higher broadcast camera over Italy's half; the ball carrier (white) at the halfway side, Italy's four between him and the goal */
const st3:Stage={F:2400,eye:9.5,cx:-12.6,cz:-4.5};
const DK:[number,number]=[GOAL_X+.8,10];
const CARRIER=(t:number):[number,number]=>[lerp(-5.2,-7.4,sm(0,C3.four+.8,t,easeIO)),lerp(12.6,11.2,sm(0,C3.four+.8,t,easeIO))];
/** the four: start loose and flat; D1 presses the ball, D2 covers behind him, D3/D4 tuck in — a diamond between ball and goal */
const DEF_A:[number,number][]=[[-11.8,15.4],[-12.4,6.6],[-15.2,13.8],[-9.6,9.2]];
const DEF_B:[number,number][]=[[-8.9,11.5],[-11.4,9.4],[-12.8,14.1],[-15.0,10.6]];
const DEF_T=(i:number)=>i===0?[C3.press,C3.press+1.1]:i===1?[C3.cover,C3.cover+1]:[C3.four-.1,C3.four+.9];
const demoDef=(i:number):Gen=>t=>{const[t0,t1]=DEF_T(i),u=sm(t0,t1,t,easeIO),a=DEF_A[i],b=DEF_B[i],X=lerp(a[0],b[0],u),Z=lerp(a[1],b[1],u),moving=sm(t0,t0+.15,t)*(1-sm(t1-.15,t1,t));
 const cr=CARRIER(t),face=yawTo(cr[0]-X,cr[1]-Z),run=yawTo(b[0]-a[0],b[1]-a[1]);let pose=blendPose(backpedal(t*1.2+i*.3),runCycle(t*runCadence(.6)+i*.25,{speed:.6}),moving);
 if(i===0)pose=blendPose(pose,lunge(.3,{side:'r'}),sm(t1-.1,t1+.3,t)*.6);
 return{pose,yaw:moving>.5?run:face,X,Z};};
const RUS3:[number,number][]=[[-8.4,16.8],[-10.4,4.4],[-4.2,7.6]];
const demoR=(i:number):Gen=>t=>{const[x,z]=RUS3[i],cr=CARRIER(t);return{pose:blendPose(stand(),runCycle(t*runCadence(.2)+i*.3,{speed:.2}),.35),yaw:yawTo(cr[0]-x,cr[1]-z)+(i===1?.8:0),X:x-.6*sm(0,C3.end,t),Z:z};};
const demoC:Gen=t=>{const[X,Z]=CARRIER(t);return{pose:dribble(t*1.1,{foot:'r',speed:.2}),yaw:FACE_LEFT+.1,X,Z};};
/** the goleiro's gestures: set → looks round → hands cupped to shout → points at D1 → points at D2 → both arms out, "four in front" */
const TALK=posed({lHipF:14,rHipF:14,lKnee:22,rKnee:22,lean:4,lShF:112,rShF:112,lShA:36,rShA:36,lElb:138,rElb:138,lHand:1,rHand:1,neckP:-16});
const POINT=posed({lHipF:14,rHipF:18,lKnee:24,rKnee:24,lean:8,rShF:92,rShA:14,rElb:6,rHand:1,lShF:26,lShA:24,lElb:44,neckY:-10,twist:-8});
const SPREAD=posed({lHipF:30,rHipF:30,lHipA:14,rHipA:14,lKnee:40,rKnee:40,lean:12,lShF:60,rShF:60,lShA:70,rShA:70,lElb:18,rElb:18,lHand:1,rHand:1,neckP:-8});
const demoK:Gen=t=>{
 const set=keeperSet(t*1.1);
 const pose=keyPoses(t,monoP([[0,set],[C3.court-.1,set],[C3.talk-.15,TALK],[C3.tell-.2,TALK],[C3.tell+.2,POINT],[C3.cover-.2,POINT],[C3.cover+.15,mirrorPose(POINT)],[C3.four-.2,mirrorPose(POINT)],[C3.four+.25,SPREAD],[C3.end,SPREAD]]));
 const cr=CARRIER(t),toBall=yawTo(cr[0]-DK[0],cr[1]-DK[1]);
 const look=t<C3.tell?toBall+.5*Math.sin(sm(C3.gol,C3.talk,t)*TAU):t<C3.cover?yawTo(DEF_B[0][0]-DK[0],DEF_B[0][1]-DK[1])+.4:t<C3.four?yawTo(DEF_B[1][0]-DK[0],DEF_B[1][1]-DK[1])-.6:toBall;
 return{pose,yaw:look,X:DK[0],Z:DK[1]};
};
/** talk: red sound arcs spreading from his head toward the court (screen right: he faces +X) */
function talkArcs(s:Sheet,st:Stage,t:number,t0:number,seed:number){const u=t-t0;if(u<0||u>1.4)return;const o=proj(st,DK[0]+.25,1.62,DK[1]),k=kAt(st,DK[1])*1.3,p=new Path2D();
 for(let j=0;j<3;j++){const g=(u*1.6+j/3)%1,r=(.45+g*2)*k,fade=(1-g)*(1-sm(1,1.4,u));if(fade<.1)continue;const pts:Pt[]=[];for(let a=-.6;a<=.61;a+=.12)pts.push([o[0]+Math.cos(a)*r,o[1]+Math.sin(a)*r*.6]);p.addPath(ribbon(pts,Math.max(5,10*fade),{seed:seed+j,taper:.3,wobble:1}));}
 s.knockout(p);s.fill(R,p);}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  const ko=proj(st,DK[0],1,DK[1]);
  camPath(s,t,[[0,ko[0]+1000,ko[1]+40,.68],[C3.court,ko[0]+1040,ko[1]+30,.64],[C3.talk-.1,ko[0]+420,ko[1]+10,1.05],[C3.tell,ko[0]+620,ko[1]+20,.86],[C3.press+.4,ko[0]+960,ko[1]+40,.68],[C3.cover+.4,ko[0]+920,ko[1]+40,.7],[C3.four+.3,ko[0]+880,ko[1]+50,.72],[C3.end,ko[0]+860,ko[1]+50,.74]]);
  courtSide(s,st,tt,{cheer:.05,
   under:()=>{
    // "keep all four": the shield — a blue screen from the four to the goal, the navy dashed diamond linking them
    const g=easeOutBack(sm(C3.four+.3,C3.four+.8,tt));
    if(g>.02){const dia=[0,2,3,1].map(i=>{const d=demoDef(i)(tt);return[d.X,d.Z] as [number,number];});
     const shield=polyPath(fp(st,[dia[0],dia[1],[GOAL_X,POST_F+.4],[GOAL_X,POST_N-.4],dia[3]]),true);s.fill(B,shield,.2*Math.min(1,g));
     dashed(s,K,fp(st,[...dia,dia[0]]),9,321,{dash:30,progress:Math.min(1,g)});}
   },
   keeper:()=>{athlete(s,st,demoK,tt,MAMMA,{detail:'mid'});}});
  // "whole court": a navy dashed sight fan from the goleiro to the ball and the far side
  const fan=sm(C3.court-.1,C3.court+.4,tt,easeOut)*(1-sm(C3.talk,C3.talk+.4,tt));
  if(fan>.02){const cr=CARRIER(tt);for(const[j,end] of([[0,cr],[1,[-9,18.4]],[2,[-9.5,2.2]]] as [number,[number,number]][]))dashed(s,K,fp(st,[DK,end]),10,330+j,{dash:34,progress:fan,cov:.85});}
  // "press": the red arrow for D1; "one to cover": the navy arrow for D2
  const arrow=(i:number,ink:string,seed:number,t0:number)=>{const u=sm(t0-.05,t0+.6,tt,easeOut)*(1-sm(C3.four+.1,C3.four+.5,tt));if(u<=.02)return;const pts=fp(st,[DEF_A[i],L2(DEF_A[i],DEF_B[i],.5) as [number,number],DEF_B[i]]);dashed(s,ink,pts,12,seed,{dash:32,progress:u});if(u>.9)arrowHead(s,ink,pts,34,seed+1);};
  arrow(0,R,340,C3.press);arrow(1,K,342,C3.cover);
  // the players back to front
  type It={z:number;draw:()=>void};const items:It[]=[];
  DEF_A.forEach((_,i)=>{const g=demoDef(i);items.push({z:g(tt).Z,draw:()=>athlete(s,st,g,tt,ITA(i),{detail:'low'})});});
  RUS3.forEach((_,i)=>{const g=demoR(i);items.push({z:g(tt).Z,draw:()=>athlete(s,st,g,tt,RUS(i+1),{detail:'low'})});});
  items.push({z:demoC(tt).Z,draw:()=>athlete(s,st,demoC,tt,RUS(5),{detail:'low'})});
  const cr=CARRIER(tt),bx=cr[0]-.45,bz=cr[1]+.05;items.push({z:bz-.05,draw:()=>{ballOn(s,st,bx,BALL_R,bz,350,{min:8,rot:tt*4});}});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "So talk!": sound arcs toward the court (twice), then with each point
  talkArcs(s,st,tt,C3.talk,360);talkArcs(s,st,tt,C3.talk+.7,363);talkArcs(s,st,tt,C3.tell+.1,366);talkArcs(s,st,tt,C3.cover+.1,369);
  // rings: D1 (red) on "Tell one", D2 (yellow) on "one to cover"
  const d1=demoDef(0)(tt),d2=demoDef(1)(tt);
  floorDashRing(s,st,R,d1.X,d1.Z,.7,10,371,easeOutBack(sm(C3.tell,C3.tell+.3,tt))*(1-sm(C3.press+.8,C3.press+1.1,tt)));
  floorDashRing(s,st,K,d2.X,d2.Z,.7,10,372,easeOutBack(sm(C3.cover-.1,C3.cover+.2,tt))*(1-sm(C3.cover+1,C3.cover+1.3,tt)));
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoK(tt),.3));},
 still:C3.four+1,
};

// ================= chapter 4 — PRACTISE: on his line, facing us: talk, point, set (three cards); the big save =================
const C4={talk:A(3,'Talk to'),defs:A(3,'your def'),org:A(3,'keep them'),ready:A(3,'ready'),save:A(3,'big save'),end:AUTH[3].seconds};
const st4:Stage={F:1500,eye:2.3,cx:0,cz:-1.6};
const PK:[number,number]=[0,GZ-1.6];
const practiceK:Gen=t=>{
 const set=keeperSet(t*1.4);
 let pose=keyPoses(t,monoP([[0,set],[C4.talk-.3,set],[C4.talk,TALK],[C4.defs-.1,TALK],[C4.defs+.2,POINT],[C4.defs+.7,POINT],[C4.defs+.95,mirrorPose(POINT)],[C4.org-.1,mirrorPose(POINT)],[C4.org+.3,SPREAD],[C4.ready-.4,SPREAD],[C4.ready,set]]));
 const tipU=key(t,[[C4.save-.1,0],[C4.save+.45,.62],[C4.save+1.2,1]],linear);if(t>C4.save-.1)pose=keeperTip(tipU,{hand:'r'});
 if(t>C4.save+1.3)pose=blendPose(pose,celebrate((t-C4.save-1.3)*1.1,{kind:'arms'}),sm(C4.save+1.3,C4.save+1.7,t));
 const look=t>C4.defs&&t<C4.org?(t<C4.defs+.8?.35:-.35):0;
 return{pose,yaw:FACE_CAMERA+look*.6,X:PK[0],Z:PK[1]};};
/** the tip-over's glove (palm over the bar) at .62, solved: the practice ball meets it */
const TIP4:V3=(()=>{const sk=solve(keeperTip(.62,{hand:'r'}),BUILD_K,placeAt(PK[0],PK[1],FACE_CAMERA)),h=toMine(sk.rHa);return[h[0],h[1]+.08,h[2]];})();
const CARD_Y=720,CARD_W=190,CARDS:[number,number,string][]=[[-420,C4.org+.05,'talk'],[0,C4.org+.45,'point'],[420,C4.org+.85,'set']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  camPath(s,t,[[0,0,300,1.1],[C4.talk,0,260,1.3],[C4.defs+.2,0,300,1.12],[C4.org,0,600,.98],[C4.ready-.3,0,600,.98],[C4.ready+.3,0,300,1.12],[C4.save+.3,0,240,1.1],[C4.end,0,280,1.14]]);
  // "big save": a ball from us, up to his glove and over the bar
  const bu=sm(C4.save-.2,C4.save+.45,tt,linear),bo=sm(C4.save+.45,C4.save+1.4,tt,linear);
  const PT=TIP4,P0:V3=[-.4,1.3,PK[1]-4.2],PO:V3=[.4,2.9,GZ+.4];
  const bp:V3=bu<1?quad3(P0,[.4,2.1,PK[1]-3],PT,bu):quad3(PT,PO,[.45,BALL_R,GZ+1.4],bo);
  arena(s,st,{t:tt,cheer:.8*pulse(tt,C4.save+.5,1.6),flash:pulse(tt,C4.save+.45,1),shiver:.05*settle(tt,C4.save+.6,{amp:1,freq:5,decay:4}),
   behind:stg=>{if(tt>C4.save-.2&&bp[2]>GZ+.05)ballOn(s,stg,bp[0],bp[1],bp[2],403,{rot:tt*6});},
   keeper:stg=>{
    // "your defenders": two blue dashed arrows fan out left and right from him (the defenders in front of him)
    const f=sm(C4.defs,C4.defs+.5,tt,easeOut)*(1-sm(C4.org-.2,C4.org+.1,tt));
    if(f>.02)for(const sx of[-1,1]){const pts=fp(stg,[[PK[0]+sx*.6,PK[1]-.6],[PK[0]+sx*2.4,PK[1]-2.4],[PK[0]+sx*3.6,PK[1]-4.6]]);dashed(s,B,pts,11,410+sx,{dash:32,progress:f});if(f>.9)arrowHead(s,B,pts,34,412+sx);}
    athlete(s,stg,practiceK,tt,MAMMA,{detail:'high',smear:tt>C4.save&&tt<C4.save+.6?.2:0});
   }});
  if(tt>C4.save-.2&&bp[2]<=GZ+.05){ballOn(s,st,bp[0],bp[1],bp[2],403,{rot:tt*6,smear:.3,dir:-Math.PI/2});}
  if(tt>=C4.save+.4&&tt<C4.save+1){const q=proj(st,PT[0],PT[1],PT[2]);sparkBurst(s,Y,q[0],q[1],120,{n:12,seed:414,g:easeOut(sm(C4.save+.4,C4.save+.7,tt))*(1-sm(C4.save+.75,C4.save+1,tt))});}
  // "Talk to": sound arcs from his mouth
  if(tt>C4.talk-.1&&tt<C4.defs+.2){const u=tt-C4.talk+.1,o=proj(st,PK[0],1.62,PK[1]-.2),k=kAt(st,PK[1]),p=new Path2D();
   for(let j=0;j<3;j++){const g=(u*1.5+j/3)%1,r=(.35+g*.9)*k,fade=1-g;if(fade<.1)continue;const pts:Pt[]=[];for(let a=.35;a<=2.8;a+=.2)pts.push([o[0]+Math.cos(a)*r,o[1]+Math.sin(a)*r*.7]);p.addPath(ribbon(pts,Math.max(6,11*fade),{seed:420+j,taper:.3,wobble:1}));}
   s.knockout(p);s.fill(Y,p);}
  // the three cards rise on "keep them organised"; each prints one habit with a small figure; they drop on "ready for"
  const rise=sm(C4.org-.2,C4.org+.4,tt,easeOut),drop=sm(C4.ready-.4,C4.ready,tt,easeIn);
  if(rise>.01&&drop<1){const dy=(1-rise)*700+drop*900,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const q=handCut([[cx-CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y-230+dy],[cx+CARD_W,CARD_Y+230+dy],[cx-CARD_W,CARD_Y+230+dy]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(B,cards,.16);
   CARDS.forEach(([cx,t0c,kind],i)=>{const on=sm(t0c,t0c+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+175;
    const fc=figureCam({x:cx,y:gy,height:360*(.9+.1*on),azimuth:kind==='point'?50:65,elevation:12,fov:16});
    s.save();s.clip(polyPath(outline[i],true));
    const pose=kind==='talk'?TALK:kind==='point'?POINT:keeperSet(.25),csk=solve(pose,BUILD_K,{}),Pc=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    // the habit's diagram: talk = yellow arcs from the mouth, point = a red dashed line from the hand, set = a navy base under the feet
    if(kind==='talk'){const m=Pc(csk.face),p=new Path2D();for(let j=0;j<3;j++){const r=40+j*34,pts:Pt[]=[];for(let a=-.6;a<=.6;a+=.15)pts.push([m[0]+Math.cos(a)*r,m[1]+Math.sin(a)*r]);p.addPath(ribbon(pts,8,{seed:80+j,taper:.3,wobble:1}));}s.fill(Y,p);}
    if(kind==='point'){const h=Pc(csk.rHa),e=Pc([csk.rHa[0]+(csk.rHa[0]-csk.rSh[0])*3,csk.rHa[1]+(csk.rHa[1]-csk.rSh[1])*3,csk.rHa[2]+(csk.rHa[2]-csk.rSh[2])*3]);const pts:Pt[]=[h,L2(h,e,.5),e];dashed(s,R,pts,8,85,{dash:22});arrowHead(s,R,pts,24,86);}
    if(kind==='set'){const a=Pc([csk.lToe[0],0,csk.lToe[2]]),b=Pc([csk.rToe[0],0,csk.rToe[2]]);s.fill(K,polyPath(blob((a[0]+b[0])/2,(a[1]+b[1])/2+6,Math.abs(a[0]-b[0])*.7+40,14,87,{n:18}),true),.5);}
    drawAthlete(s,pose,fc,{...MAMMA,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "big save": a big blue tick stamps beside him, with a navy misregistered echo
  const tick=easeOutBack(sm(C4.save+1.1,C4.save+1.45,tt));
  if(tick>.02){const g=proj(st,PK[0],0,PK[1]),h=kAt(st,PK[1])*1.77,c:Pt=[g[0]+h*.7,g[1]-h*.8],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(B,tp);}
 },
 still:C4.org+1.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'mammarella-futsal-signature',format:'futsal',title:'Mammarella’s big-tournament save',theme:'Talk to your defenders, keep them in front of you, and be ready for the big save.',
 ageNote:'For players aged 7–12: the 2014 Futsal EURO final save is real; the organising is shown as a demonstration. Practise talking to your team.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball pops up, a white glove tips it over, rings ripple out; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const up=sm(0,.3,age,easeOut),over=sm(.3,.7,age,easeIn),by=y-160*up+120*over,bx=x+40*over;
  const u=clamp((age-.28)/.5);if(age>.28&&u<1){s.fill(Y,ribbon(blob(x,y-160,r*(1+2*u),r*(.7+1.2*u),seed,{n:24}),8*(1-u)+2,{seed,close:true,wobble:1.2}),1);}
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.8,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,by,r,seed,{rot:age*5});
  const g=sm(.18,.3,age)*(1-sm(.45,.7,age));if(g>.02){const glove=blob(x-10,y-160-r-30+20*(1-g),r*.55,r*.75,seed+3,{n:18});s.knockout(polyPath(glove,true));s.fill(K,ribbon([...glove,glove[0]],6,{seed:seed+4,close:true,wobble:1}),g);}
 },
};
export default film;
