/** Pany Varela — "the ala's 1v1 and finish": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHY THIS MOMENT: Pany Varela's entry (lib/town/iconicPlays.json) is a signature: the winger's 1v1 from the right and a quick finish.
 * It is not one match. His best-documented moment is the 2021 FIFA Futsal World Cup final, where he scored BOTH of Portugal's goals. The
 * written sources we could reach give the goal minutes but do not describe HOW either goal was scored (the FIFA round-up "Pany fires
 * Portugal to World Cup glory" is a dead link and is not archived). So the film follows the brief's honest fallback:
 *  1  LIVE (broadcast camera, main stand, real time, with broadcast cuts): the 2021 final, Portugal v Argentina, Žalgiris Arena, Kaunas,
 *     3 Oct 2021. It shows ONLY what is confirmed and never how a goal was scored: (A) the final underway, Portugal keeping the ball in
 *     midfield (generic passing, no attack on goal); CUT on "scores" to (B) Pany wheeling away in celebration, the ball already at rest in
 *     the net, teammates chasing him; CUT on "again" to (C) the arena scoreboard over halfway (1–0 → 2–0 → 2–1 on the cues), then the final
 *     whistle, Portugal celebrate, confetti. Narration: he scores Portugal's first goal (15'), then their second (28'), Argentina pull one back
 *     (Claudino, 28'), Portugal win 2–1 and are world champions for the first time.
 *  2  HOW HE DOES IT (slow motion, low, behind him; a demonstration with a neutral navy/paper defender and keeper, no match claimed): the
 *     1v1, he shows the defender the inside, the defender leans, he goes outside and shoots fast.
 *  3  PRACTISE (the entry's lesson "In a 1v1, fake one way and go the other, then shoot fast"): he repeats the fake-and-go round a cone;
 *     three cards (fake, go, shoot); a quick shot; a tick.
 * Sources (written; fetched once and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Pany Varela" (raw, fetched Sep 2026): Anilton César Varela da Silva, born 25 Feb 1989, Tarrafal, Cape Verde; 1.72 m;
 *    position winger (ala); Sporting CP 2016–24 (club no. 18); in 2021 "2 goals (the only ones in the match) in the final of the World Cup
 *    against Argentina"; also scored in Sporting's 2021 UEFA Futsal Champions League final win over Barcelona; World Cup Silver Ball 2021.
 *    https://en.wikipedia.org/wiki/Pany_Varela
 *  - Wikipedia, "2021 FIFA Futsal World Cup" (raw; en + pt): Final, 3 Oct 2021, 20:00, Žalgiris Arena, Kaunas; Argentina 1–2 Portugal;
 *    Pany 15', 28'; Claudino 28'; attendance 8,498; referee Nurdin Bukuev (KGZ). Portugal's first world title.
 *    https://en.wikipedia.org/wiki/2021_FIFA_Futsal_World_Cup
 *  - O Mirante, "Pany Varela: da formação no concelho de VFX até ao topo do mundo do futsal" (4 Oct 2021): he scored the two goals that
 *    decided the final, 2–1 against Argentina, on the afternoon/evening of Sunday 3 October. https://omirante.pt/desporto/2021-10-04-Pany-
 *    Varela-da-formacao-no-concelho-de-VFX-ate-ao-topo-do-mundo-do-futsal-15c8ee76
 *  - UEFA.com (pt), "Sporting sagra-se bicampeão da UEFA Futsal Champions League" (3 May 2021): his 2021 UCL-final goal was a rebound
 *    after Erick hit the post, so it is NOT a 1v1 and was not chosen. https://pt.uefa.com/uefafutsalchampionsleague/news/0269-1230a91089b2-
 *    967a77b97ecc-1000--sporting-sagra-se-bicampeao-da-uefa-futsal-champions-league/
 * CONFIRMED: match, date, venue, city, score line (1–0, 2–0, 2–1), both Portugal goals by Pany (15', 28'), Claudino's goal, Portugal
 *  world champions, Pany a winger (ala), 1.72 m, born in Cape Verde.
 * NOT DEPICTED (undocumented): how either goal was scored. INFERRED (never named in the narration): every player's position in chapter 1
 *  (generic midfield play, the celebration spot, the scoreboard's look and place); kits (Portugal red shirts / green shorts / red socks, as in the approved Ricardinho film;
 *  Argentina light-blue-and-white stripes, printed as a light navy screen with paper stripes, navy shorts; Argentina's keeper in a dark kit); his shirt number
 *  for Portugal (not printed); the wood-look court; the crowd. His hair is drawn short and dark. No video was reviewed.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the push-out and the strike). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 *  z → −Z. Live: Argentina's goal is at X = +20 (inferred end).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagram lines), red (Portugal shirt/socks, the defender's weight arrow), green (Portugal shorts, boards,
 *  the "go" arrow), navy (key line, Argentina stripes/shorts, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈150–300 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,handCut,crescent,confetti,dust} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2021 final',text:'The 2021 Futsal World Cup final in Kaunas. Portugal play Argentina. Pany Varela scores Portugal’s first goal! Later he scores again. Two to one, and Portugal are world champions!',tail:2.6,
  cues:['The 2021','in Kaunas','Portugal play','Pany Varela','scores Portugal','scores again','Two to one','world champions'],heads:{'The 2021':'Final 2021','in Kaunas':'Kaunas','scores Portugal':'1–0','scores again':'2–0','Two to one':'2–1','world champions':'Champions'}},
 {label:'How he does it',text:'His big weapon was the one against one. Watch how he does it. He shows the defender the inside, and the defender leans. Then he goes outside, and shoots fast!',tail:2.0,
  cues:['His big weapon','one against one','Watch how','shows the defender','defender leans','goes outside','shoots fast'],heads:{'one against one':'1 v 1','shoots fast':''}},
 {label:'Practise it',text:'Now you try. In a one against one, fake one way and go the other. Then shoot fast, before the defender gets back!',tail:2.4,
  cues:['Now you try','fake one way','go the other','Then shoot fast','defender gets back'],heads:{'fake one way':'Fake','go the other':'Go','Then shoot fast':'Shoot'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/pany-varela-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/pany-varela-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/pany-varela-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('pany: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('pany: no cue '+w);return c.at;};
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
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the wood */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);void seed;}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a floor arrow (X,Z points), dashed, drawn progressively, with a head */
function floorArrow(s:Sheet,st:Stage,ink:string,pts:Pt[],w:number,seed:number,u:number,head=38){if(u<=.02)return;const q=pts.map(p=>proj(st,p[0],0,p[1]));dashed(s,ink,q,w,seed,{dash:w*3.4,progress:u});if(u>.85)arrowHead(s,ink,partial(smoothPts(q,false,8),u),head,seed+1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
const SKIN_D:InkFill[]=[[R,.6],[K,.34]],SKIN_L:InkFill[]=[[Y,.86],[R,.26]],SKIN_M:InkFill[]=[[Y,.72],[R,.4]];
const BUILD={height:1.72,bulk:.98};
/** Pany Varela: Portugal red shirt / green shorts / red socks (kit inferred), short dark hair, 1.72 m (Wikipedia); number not printed */
const PANY:AthleteStyle={shirt:R,shorts:G,socks:R,boots:'paper',skin:SKIN_D,hair:K,line:K,trim:G,number:null,hairStyle:'short',build:BUILD,seed:18};
const POR=(n:number):AthleteStyle=>({shirt:R,shorts:G,socks:R,boots:K,skin:n%3===1?SKIN_M:SKIN_L,hair:K,line:K,trim:G,hairStyle:n%2?'short':'bald',build:{height:1.7+hash(n,3)*.12},seed:30+n});
/** Argentina: light-blue-and-white stripes (a light navy screen with paper stripes), navy shorts, white socks (inferred) */
const ARG=(n:number):AthleteStyle=>({shirt:[K,.3],pattern:'stripes',patternInk:'paper',shorts:K,socks:'paper',boots:K,skin:n%2?SKIN_M:SKIN_L,hair:K,line:K,trim:K,hairStyle:n%3?'short':'curly',build:{height:1.72+hash(n,4)*.1},seed:50+n});
const ARG_GK:AthleteStyle={shirt:[K,.7],shorts:K,socks:K,boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:61};
/** the demonstration defender and keeper: neutral training kit (no team is claimed in chapters 2–3) */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:SKIN_M,hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
const DEMO_GK:AthleteStyle={shirt:[Y,.9],shorts:K,socks:Y,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:78};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact: just past the kicking toe along the foot (our coords, place at the origin) */
function strikeBall(yaw:number):[number,number,number]{const sk=solve(strike(STRIKE_CONTACT),BUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}
/** the signature poses (library, facing +x, right = +z):
 *  FAKE = "show the inside": weight onto the left leg, shoulder dropped, hips and head turned to the left, right sole shaping over the ball;
 *  GO   = the push outside with the outside of the right foot, exploding to the right. */
const FAKE=posed({lHipF:14,lHipA:22,lKnee:40,lAnk:-6,rHipF:26,rHipA:-8,rKnee:36,rAnk:10,lean:18,bend:-14,roll:-8,twist:18,neckY:20,neckP:24,lShA:30,rShA:60,lElb:44,rElb:36,dz:-.16});
const GO=posed({rHipF:30,rHipA:14,rHipR:-22,rKnee:32,rAnk:14,lHipF:-18,lKnee:44,lean:26,pitch:6,bend:10,roll:8,twist:-16,lShA:44,rShA:50,lElb:60,rElb:40,neckP:20,neckY:-10,dz:.18});

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
function ballAt(s:Sheet,st:Stage,X:number,Yh:number,Z:number,seed:number,o:{min?:number;rot?:number;smear?:number;dir?:number}={}){
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,Yh>.4?.25:.45);ball(s,p[0],p[1],r,seed,{rot:o.rot,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, red and green shirts, a few Portugal flags, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),greens=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.24)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.36)greens.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  greens.addPath(polyPath([pole(0,0),pole(.4,0),pole(.4,1),pole(0,1)],true));reds.addPath(polyPath([pole(.4,0),pole(.7,0),pole(1,0),pole(1,1),pole(.7,1),pole(.4,1)],true));heads.addPath(circlePath(fx+.4*fw,fy+fh*.5+wv(.4),fh*.2));}
 s.fill(Y,heads,.6);s.fill(R,reds);s.fill(G,greens);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** boards: green with yellow ad panels and a navy cap (shared) */
function boards(s:Sheet,wall:number,board:number,x0s:number[],x1s:number[]){const span=9000;s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(G,rectPath(-span,wall-board,span*2,board));
 const ads=new Path2D();x0s.forEach((x0,i)=>ads.rect(x0,wall-board*.78,x1s[i]-x0,board*.52));s.fill(Y,ads,.6);s.fill(K,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Argentina's goal at X = +20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 // wood (yellow flat + red tint); planks run along the court, alternate strips tinted, butt joints staggered
 s.fill(Y,rectPath(-span,wall,span*2,span),.45);s.fill(R,rectPath(-span,wall,span*2,span),.32);
 const strips=new Path2D(),seams=new Path2D(),X0=st.cx-30,X1=st.cx+30;
 for(let k=0;k<46;k++){const z0=-1+k*.5,z1=z0+.5;const a=proj(st,X0,0,z0),b=proj(st,X1,0,z1);if(hash(k,5)>.55)strips.rect(a[0],b[1],b[0]-a[0],a[1]-b[1]);seams.moveTo(a[0],a[1]);seams.lineTo(proj(st,X1,0,z0)[0],a[1]);
  for(let x=Math.floor(X0/2.4)*2.4+hash(k,9)*2.4;x<X1;x+=2.4){const p=proj(st,x,0,z0),q=proj(st,x,0,z1);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.32);
 // run-off beyond the goal line: a navy screen
 s.fill(K,polyPath([proj(st,GOAL_X,0,-1.5),proj(st,GOAL_X+30,0,-1.5),proj(st,GOAL_X+30,0,BOARDS),proj(st,GOAL_X,0,BOARDS)],true),.3);
 // painted lines: touchlines, goal line, halfway, the penalty area (6 m arcs from the posts), the 6 m and 10 m marks, the centre circle
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[GOAL_X,0]],[[-20,TOUCH_FAR],[GOAL_X,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X-6,GOAL_X-10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 // boards and the crowd on the far side
 const board=.95*kw,x0s:number[]=[],x1s:number[]=[];for(let i=-12;i<14;i++){x0s.push(proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0]);x1s.push(proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0]);}
 boards(s,wall,board,x0s,x1s);
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st,bulge,bz,by);o.keeper?.();sidePosts(s,st);
}
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

// ---- DEMO court facing the goal end (camera looks along +Z): goal centre (0, GZ), wall behind it ----
const GZ=11,WALLZ=13.4;
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;goal?:boolean};
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0,goal:withGoal=true}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 const floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.45);s.fill(R,floor,.32);
 const strips=new Path2D(),seams=new Path2D(),near=st.cz+.35;
 for(let i=-40;i<40;i++){const X0=i*.5,X1=X0+.5;if(hash(i+40,5)>.55)strips.addPath(polyPath([proj(st,X0,0,near),proj(st,X1,0,near),proj(st,X1,0,WALLZ),proj(st,X0,0,WALLZ)],true));
  const a=proj(st,X0,0,near),b=proj(st,X0,0,WALLZ);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);
  for(let z=near+hash(i,9)*2.2;z<WALLZ;z+=2.2){const p=proj(st,X0,0,z),q=proj(st,X1,0,z);seams.moveTo(p[0],p[1]);seams.lineTo(q[0],q[1]);}}
 s.fill(R,strips,.1);s.stroke(K,seams,4,.32);
 const lines=new Path2D();
 if(withGoal){const arcPts:Pt[]=[];
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,GZ],[10,GZ]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts,.05),true));
  lines.addPath(polyPath(floorRing(st,0,GZ-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,GZ-10,.12,12),true));}
 else{const cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,7+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,[[-10,7],[10,7]],.05),true));lines.addPath(polyPath(floorStrip(st,cc,.05),true));}
 lines.addPath(polyPath(floorStrip(st,[[10,Math.max(-30,st.cz+.4)],[10,GZ]],.05),true));
 s.knockout(lines,.92);
 const x0s:number[]=[],x1s:number[]=[];for(let i=-12;i<12;i++){x0s.push(proj(st,i*2.4+.3,0,WALLZ)[0]);x1s.push(proj(st,i*2.4+1.9,0,WALLZ)[0]);}
 boards(s,wall,board,x0s,x1s);void span;
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
/** Pany's chest (the passage enters his red shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}

// ================= chapter 1 — LIVE: the 2021 final in Kaunas; play underway, CUT to Pany celebrating, the scoreboard, the final whistle =================
// Nothing here depicts HOW a goal was scored: shot A is Portugal keeping the ball in midfield (generic play, no shot), shot B cuts in after the
// goal (Pany wheeling away, the ball already at rest in the net), shot C is the arena scoreboard (1–0 → 2–0 → 2–1) and the final whistle.
const C1={start:A(0,'The 2021'),kaunas:A(0,'in Kaunas'),play:A(0,'Portugal play'),pany:A(0,'Pany'),scores:A(0,'scores Portugal'),again:A(0,'scores again'),two:A(0,'Two to'),champ:A(0,'world'),end:AUTH[0].seconds};
const S1=C1.scores-.05,S2=C1.again-.05;
/** the arena scoreboard hangs above the far stand at X = SB_X (the halfway line) */
const SB_X=0;
/** score shown at live time T (confirmed order: Pany 15' → 1–0, Pany 28' → 2–0, Claudino 28' → 2–1) */
const scoreAt=(T:number):[number,number]=>T<S1?[0,0]:T<S2?[1,0]:T<C1.two?[2,0]:[2,1];
const SEG:number[][]=[[1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1]];// a b c d e f g for 0..3
function digit(p:Path2D,x:number,y:number,w:number,h:number,n:number){const t=w*.2,on=SEG[n]||SEG[0],hh=h/2;
 const bars:[number,number,number,number][]=[[x+t,y,w-2*t,t],[x+w-t,y+t*.5,t,hh-t*.5],[x+w-t,y+hh,t,hh-t*.5],[x+t,y+h-t,w-2*t,t],[x,y+hh,t,hh-t*.5],[x,y+t*.5,t,hh-t*.5],[x+t,y+hh-t/2,w-2*t,t]];
 bars.forEach((b,i)=>{if(on[i])p.rect(b[0],b[1],b[2],b[3]);});}
/** the scoreboard: a navy box on two cables, a Portugal flag block (green/red) and an Argentina block (navy stripes), yellow LED digits */
function scoreboard(s:Sheet,st:Stage,T:number,flash:number){
 const c=proj(st,SB_X,2.8,BOARDS),k=kAt(st,BOARDS),w=4.4*k,h=1.7*k,x=c[0]-w/2,y=c[1]-h/2;
 if(x>2600||x+w<-2600)return;
 const cab=new Path2D();cab.moveTo(x+w*.2,y);cab.lineTo(x+w*.2,y-3*k);cab.moveTo(x+w*.8,y);cab.lineTo(x+w*.8,y-3*k);s.stroke(K,cab,Math.max(2,k*.04),.8);
 const box=rectPath(x,y,w,h);s.knockout(box);s.fill(K,box,.92);
 s.fill(G,rectPath(x+w*.05,y+h*.2,w*.08,h*.3));s.fill(R,rectPath(x+w*.13,y+h*.2,w*.08,h*.3));
 const arg=new Path2D();for(let i=0;i<3;i++)arg.rect(x+w*.79+i*w*.055,y+h*.2,w*.03,h*.3);s.knockout(rectPath(x+w*.79,y+h*.2,w*.16,h*.3),.6);s.fill(K,arg,.5);
 const[a,b]=scoreAt(T),dg=new Path2D(),dw=w*.12,dh=h*.62,dy=y+h*.19;digit(dg,x+w*.3,dy,dw,dh,a);dg.rect(x+w*.47,dy+dh*.45,w*.06,dh*.1);digit(dg,x+w*.58,dy,dw,dh,b);
 s.knockout(dg);s.fill(Y,dg,.75+.25*Math.min(1,flash));
 if(flash>.05)s.fill(Y,ribbon([[x-8,y-8],[x+w+8,y-8],[x+w+8,y+h+8],[x-8,y+h+8],[x-8,y-8]],10*flash,{seed:91,taper:0,wobble:1}),Math.min(1,flash));
}
// ---- shot A: the final underway; Portugal keep the ball in midfield (generic passing, no attack on goal is shown) ----
const PA:[number,number][]=[[-3.2,10.6],[1.8,15.4],[3.6,5.4],[-.6,4.2]];// Portugal (index 2 = Pany, on the near side)
const PASSES:[number,number,number][]=[[.5,0,1],[1.7,1,0],[2.9,0,3],[C1.play+.3,3,2],[C1.pany+.2,2,3]];// [t0, from, to]
function ballA(T:number):[number,number]{let at=PA[0],pos:[number,number]=[at[0]+.4,at[1]];
 for(const[t0,f,to] of PASSES){const a=PA[f],b=PA[to];if(T<t0)return pos;const u=sm(t0,t0+.95,T,easeOut);pos=[lerp(a[0]+.4,b[0]-.3,u),lerp(a[1],b[1],u)];void at;}
 return pos;}
const aPOR=(i:number):Gen=>T=>{const[x0,z0]=PA[i],drift=.35*Math.sin(T*.8+i*2),bx=ballA(T);
 const kick=Math.max(0,...PASSES.filter(p=>p[1]===i).map(p=>pulse(T,p[0]-.08,.3)));
 let pose=blendPose(runCycle(T*runCadence(.2)+i*.3,{speed:.2}),stand(),.6);pose=blendPose(pose,posed({lHipF:-10,rHipF:40,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2));
 return{pose,yaw:yawTo(bx[0]-x0,bx[1]-z0),X:x0+drift,Z:z0};};
const AR:[number,number][]=[[5.6,9.4],[5.0,14.0],[7.4,6.6],[9.8,11.2]];
const aARG=(i:number):Gen=>T=>{const[x0,z0]=AR[i],bx=ballA(T);return{pose:backpedal(T*1.2+i*.25),yaw:yawTo(bx[0]-x0-2,bx[1]-z0),X:x0+.25*(bx[0]-1),Z:lerp(z0,bx[1],.18)};};
// ---- shot B: after the first goal (cut in): Pany wheels away from Argentina's goal, arms out; teammates chase him; the ball at rest in the net ----
const B0:[number,number]=[16.2,7.2],B1:[number,number]=[12.8,3.4];
const bPany:Gen=T=>{const u=sm(S1,S1+1.6,T,easeOut),X=lerp(B0[0],B1[0],u),Z=lerp(B0[1],B1[1],u);
 let pose=celebrate((T-S1)*1.3,{kind:'run'});pose=blendPose(pose,celebrate((T-S1)*.9,{kind:'arms'}),sm(S1+1.5,S1+1.9,T));
 return{pose,yaw:u<.95?yawTo(B1[0]-B0[0],B1[1]-B0[1]):FACE_CAMERA+.4,X,Z};};
const bMate=(i:number):Gen=>T=>{const st:[number,number]=[[17.8,11.6],[14.6,12.8],[11.2,9.8]][i] as [number,number],end:[number,number]=[B1[0]+[1.0,-1.1,.1][i],B1[1]+[1.3,1.6,2.5][i]],u=sm(S1+.2,S1+2.0,T,easeIO);
 let pose=runCycle((T-S1)*runCadence(.8)+i*.3,{speed:.8});pose=blendPose(pose,celebrate((T-S1)*1.1+i*.2,{kind:'arms'}),sm(S1+1.9,S1+2.3,T));
 return{pose,yaw:u<.95?yawTo(end[0]-st[0],end[1]-st[1]):FACE_CAMERA,X:lerp(st[0],end[0],u),Z:lerp(st[1],end[1],u)};};
const HEAD_DOWN=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20});
const bArg=(i:number):Gen=>T=>({pose:blendPose(stand(),HEAD_DOWN,.8),yaw:FACE_LEFT+(i?.5:-.4),X:[17.6,15.2][i],Z:[8.6,10.8][i]});
const bKeeper:Gen=T=>({pose:blendPose(keeperSet(0),HEAD_DOWN,sm(S1,S1+.8,T)),yaw:FACE_LEFT+.6,X:GOAL_X-.6,Z:9.6});
// ---- shot C: the scoreboard over the halfway line (2–0, then 2–1), the final whistle, Portugal celebrate ----
const CP:[number,number][]=[[-1.2,5.2],[1.4,4.4],[-2.6,9.4],[2.8,10.6]];// Pany is index 1
const cPOR=(i:number):Gen=>T=>{const[x0,z0]=CP[i],end:[number,number]=[.2+[-.9,0,.8,-.2][i],5.4+[.6,0,.9,1.3][i]],u=sm(C1.champ,C1.champ+1.2,T,easeIO);
 let pose=blendPose(runCycle(T*runCadence(.25)+i*.4,{speed:.25}),stand(),.4);
 if(T>=C1.champ)pose=blendPose(runCycle((T-C1.champ)*runCadence(.8)+i*.3,{speed:.8}),celebrate((T-C1.champ)*1.1+i*.25,{kind:'arms'}),sm(C1.champ+1,C1.champ+1.4,T));
 return{pose,yaw:u>0&&u<.95?yawTo(end[0]-x0,end[1]-z0):i===1?FACE_CAMERA+.3:FACE_LEFT+.2*i,X:lerp(x0,end[0],u),Z:lerp(z0,end[1],u)};};
const cARG=(i:number):Gen=>T=>{const[x0,z0]=[[4.6,7.2],[6.2,12.4],[3.2,14.2]][i] as [number,number],cheer=i===0?sm(C1.two,C1.two+.3,T)*(1-sm(C1.two+1.4,C1.two+1.8,T)):0;
 let pose=blendPose(stand(),celebrate((T-C1.two)*1.2,{kind:'arms'}),cheer);pose=blendPose(pose,HEAD_DOWN,sm(C1.champ,C1.champ+.8,T));
 return{pose,yaw:FACE_LEFT-.3*i,X:x0,Z:z0};};
const shotOf=(T:number)=>T<S1?0:T<S2?1:2;
const liveCam=(T:number)=>{const sh=shotOf(T);
 if(sh===0){const b=ballA(T);return{x:lerp(.6,b[0],.5)+.3*sm(C1.pany-.3,S1,T),zoom:key(T,[[0,.58],[C1.kaunas,.6],[C1.pany,.72],[S1,.76]],easeInOutSine),y:1040};}
 if(sh===1)return{x:key(T,[[S1,15.4],[S2,14.0]],easeInOutSine),zoom:key(T,[[S1,.76],[S1+1.8,.86],[S2,.9]],easeInOutSine),y:1075};
 return{x:key(T,[[S2,1.2],[C1.champ,.9],[C1.end,.6]],easeInOutSine),zoom:key(T,[[S2,.72],[C1.two,.74],[C1.champ,.82],[C1.end,.96]],easeInOutSine),y:key(T,[[S2,960],[C1.champ,1000],[C1.end,1050]],easeInOutSine)};};
/** the athlete a live shot follows for the passage (Pany) */
const liveP:Gen=T=>{const sh=shotOf(T);return sh===0?aPOR(2)(T):sh===1?bPany(T):cPOR(1)(T);};
function live(s:Sheet,T:number,Tc:number){
 // cuts happen on the object clock so the picture and the shot always agree
 const sh=shotOf(T),c=liveCam(sh===shotOf(Tc)?Tc:T),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const cheer=sh===0?.12:sh===1?1:Math.min(1,.4+.5*pulse(T,S2,1.4)+.8*sm(C1.champ,C1.champ+.4,T));
 const flash=sh===1?pulse(T,S1,1.2):pulse(T,S2,1)+pulse(T,C1.two,1)+pulse(T,C1.champ,1.4);
 courtSide(s,st,T,{cheer,flash,bulge:sh===1?.08:0,bz:10,by:.2,keeper:sh===1?()=>{athlete(s,st,bKeeper,T,ARG_GK,{detail:'low'});}:undefined});
 scoreboard(s,st,T,sh===2?pulse(T,S2,.8)+pulse(T,C1.two,.8)+pulse(T,C1.champ,1.2):sh===0?0:0);
 type It={z:number;draw:()=>void};const items:It[]=[];
 const add=(g:Gen,style:AthleteStyle,d:'low'|'auto'='low')=>items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,style,{detail:d})});
 if(sh===0){PA.forEach((_,i)=>add(aPOR(i),i===2?PANY:POR(i),i===2?'auto':'low'));AR.forEach((_,i)=>add(aARG(i),ARG(i)));
  const b=ballA(T);items.push({z:b[1]-.05,draw:()=>{ballAt(s,st,b[0],BALL_R,b[1],18,{rot:b[0]*3});}});}
 else if(sh===1){add(bPany,PANY,'auto');[0,1,2].forEach(i=>add(bMate(i),POR(i)));[0,1].forEach(i=>add(bArg(i),ARG(i)));
  items.push({z:10.05,draw:()=>{ballAt(s,st,GOAL_X+.6,BALL_R,10,18,{min:7});}});}
 else{CP.forEach((_,i)=>add(cPOR(i),i===1?PANY:POR(i),i===1?'auto':'low'));[0,1,2].forEach(i=>add(cARG(i),ARG(i+4)));}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "world champions": paper, red and green confetti in front of the stands
 if(T>=C1.champ){const u=sm(C1.champ,C1.end,T,linear),top=proj(st,st.cx,5,BOARDS)[1],xl=proj(st,st.cx-12,0,BOARDS)[0],xr=proj(st,st.cx+12,0,BOARDS)[0];confetti(s,[R,G,'paper'],[xl,top-300+u*420,xr-xl,520],30,Math.floor(T*6),{size:18});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveP(tt),.12));},still:S1+1.4};

// ================= chapter 2 — HOW HE DOES IT (demonstration, slow motion, low behind him): 1v1, show the inside, the lean, go outside, shoot =================
const C2={weapon:A(1,'His big'),v1:A(1,'one against'),watch:A(1,'Watch'),shows:A(1,'shows'),leans:A(1,'defender leans'),out:A(1,'goes outside'),shoot:A(1,'shoots fast'),end:AUTH[1].seconds};
/** demo world: he attacks +Z on the right of the goal (+X); inside = −X, outside = +X; the near post is the right post (+1.5) */
const D_HOLD:[number,number]=[3.05,3.6],D_OUT:[number,number]=[4.25,6.1],D_NP:V3=[1.22,.32,GZ-.02],DEF0:[number,number]=[2.95,5.05];
const D_FAKE=C2.shows+.05,D_LEAN=C2.leans,D_GO=C2.out+.05,D_HIT=C2.shoot+.25,D_IN=D_HIT+.75,D_S0=D_HIT-1.0;
const D_YAW=yawTo(D_NP[0]-D_OUT[0],D_NP[2]-D_OUT[1]);
const DSB=strikeBall(D_YAW),D_PLANT:[number,number]=[D_OUT[0]-DSB[0],D_OUT[1]-DSB[2]];
/** his floor position (stance centre) and the ball */
const demoP:Gen=t=>{
 const stT=key(t,[[D_S0,0],[D_S0+.5,.22],[D_HIT,STRIKE_CONTACT],[D_HIT+1.2,.85],[C2.end,1]],linear);
 const X=key(t,mono([[0,3.5],[C2.watch,D_HOLD[0]+.02,easeOut],[D_FAKE,D_HOLD[0]],[D_FAKE+.7,D_HOLD[0]-.2,easeOut],[D_GO,D_HOLD[0]-.17],[D_S0,D_PLANT[0]+.12,easeOut],[D_HIT,D_PLANT[0],easeOut],[C2.end,D_PLANT[0]-.2]]));
 const Z=key(t,mono([[0,-2.2],[C2.watch,D_HOLD[1]-.62,easeOut],[D_FAKE,D_HOLD[1]-.55],[D_GO,D_HOLD[1]-.5],[D_S0,D_PLANT[1]-.5,easeOut],[D_HIT,D_PLANT[1],easeOut],[C2.end,D_PLANT[1]+.35]]));
 let pose:Pose,yaw=FACE_AWAY;
 if(t<D_FAKE-.45)pose=dribble(t*1.1,{foot:'r',speed:.25});
 else if(t<D_GO)pose=blendPose(dribble((D_FAKE-.45)*1.1,{foot:'r',speed:.25}),FAKE,sm(D_FAKE-.45,D_FAKE+.4,t,easeIO));
 else if(t<D_S0)pose=keyPoses(t,[[D_GO,FAKE],[D_GO+.55,GO],[D_S0,blendPose(GO,runCycle(.1,{speed:.7}),.6)]]);
 else pose=blendPose(blendPose(GO,runCycle(.1,{speed:.7}),.6),strike(stT),sm(D_S0,D_S0+.25,t));
 if(t>=D_GO&&t<D_S0)yaw=lerp(FACE_AWAY,FACE_AWAY-.45,sm(D_GO,D_GO+.5,t,easeIO));
 if(t>=D_S0)yaw=lerp(FACE_AWAY-.45,D_YAW,sm(D_S0,D_S0+.4,t,easeIO));
 return{pose,yaw,X,Z};
};
function demoBall(t:number):{X:number;Y:number;Z:number;flying:boolean}{
 if(t<D_FAKE-.3){const f=demoP(t),ph=((t*1.1)%1+1)%1;return{X:f.X+.1,Y:BALL_R,Z:f.Z+.45+.14*easeOut(ph),flying:false};}
 if(t<D_GO+.35){const f=demoP(D_FAKE-.3),x0=f.X+.1,z0=f.Z+.5;return{X:lerp(x0,D_HOLD[0]+.08,sm(D_FAKE-.3,D_FAKE,t)),Y:BALL_R,Z:lerp(z0,D_HOLD[1],sm(D_FAKE-.3,D_FAKE,t)),flying:false};}
 if(t<D_HIT){const u=sm(D_GO+.35,D_HIT-.3,t,easeOut);return{X:lerp(D_HOLD[0]+.08,D_OUT[0],u),Y:BALL_R,Z:lerp(D_HOLD[1],D_OUT[1],u),flying:false};}
 if(t<D_IN){const u=sm(D_HIT,D_IN,t,linear);return{X:lerp(D_OUT[0],D_NP[0],u),Y:BALL_R+(D_NP[1]-BALL_R)*u+.18*4*u*(1-u),Z:lerp(D_OUT[1],D_NP[2],u),flying:true};}
 const d=sm(D_IN+.2,D_IN+.8,t,easeIn);return{X:D_NP[0]-.1,Y:lerp(D_NP[1],BALL_R,d),Z:GZ+.6,flying:false};
}
/** the demo defender (faces the camera; his right = −X, the inside): sets, buys the fake and leans, turns too late */
const demoD:Gen=t=>{const lu=key(t,[[D_LEAN-.15,0],[D_LEAN+.45,.6],[D_GO+.9,.8],[D_S0+.5,1]],linear),turn=sm(D_GO+.7,D_HIT,t,easeIO);
 let pose=backpedal(t*.9);pose=blendPose(pose,stand(),sm(C2.watch,C2.watch+.4,t)*(1-sm(D_LEAN-.3,D_LEAN,t)));pose=blendPose(pose,lunge(lu,{side:'r'}),sm(D_LEAN-.3,D_LEAN,t));
 pose=blendPose(pose,runCycle((t-D_GO)*runCadence(.4),{speed:.4}),turn*.6);
 const X=DEF0[0]-.4*sm(D_LEAN-.1,D_LEAN+.6,t,easeOut)+.3*turn,Z=key(t,[[0,DEF0[1]+1.1],[C2.watch,DEF0[1],easeOut]])+.25*turn;
 return{pose,yaw:FACE_CAMERA-turn*1.1,X,Z};};
/** the demo keeper: set, dives low to his left (+X, the near post) too late */
const demoK:Gen=t=>{const u=sm(D_HIT+.2,D_HIT+1.2,t,linear);return{pose:u>0?keeperDive(u,{side:'l',height:.1}):keeperSet(t*1.1),yaw:FACE_CAMERA,X:.35,Z:GZ-.8};};
const st2=(t:number):Stage=>({F:1500,eye:1.55,cx:1.0,cz:-6.4+key(t,[[0,0],[C2.watch,1.8,easeIO],[D_GO,2.2],[D_HIT,3.4,easeIO]])});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(tt),hit=pulse(t,D_HIT,.4),net=pulse(t,D_IN,.6);
  const P=(X:number,Z:number)=>proj(st,X,0,Z);
  // the camera tracks between him and the ball (on ones, from the smooth clock), then widens to the goal for the shot
  const sc=st2(t),fc=demoP(t),bc=demoBall(Math.min(t,D_HIT)),wide=sm(D_HIT-.6,D_IN,t,easeIO),fx=lerp(lerp(fc.X,bc.X,.4),.9,wide*.8),fz=lerp(lerp(fc.Z,bc.Z,.4)+.4,GZ-2,wide*.7),fp=proj(sc,fx,.95,fz);
  const zm=key(t,[[0,1.45],[C2.v1,1.5],[C2.watch,1.75],[C2.shows,1.95],[C2.leans,1.95],[C2.out,1.85],[D_HIT,1.6],[D_IN+.3,1.55],[C2.end,1.5]]);
  cam(s,fp[0]+8*hit*Math.sin(t*90),fp[1]+5*hit*Math.cos(t*77)+4*net*Math.sin(t*60),zm);
  const b=demoBall(tt),goal=tt>=D_IN;
  arena(s,st,{t:tt,cheer:goal?1:0,flash:pulse(tt,D_IN,1.2),bulge:.5*sm(D_IN-.2,D_IN,tt)*(1-.6*sm(D_IN+.4,D_IN+1.4,tt))+.1*settle(tt,D_IN,{amp:1,freq:3,decay:3}),bx:D_NP[0],by:D_NP[1],
   keeper:stg=>{athlete(s,stg,demoK,tt,DEMO_GK,{detail:'mid'});}});
  const f=demoP(tt),d=demoD(tt);
  // "one against one": a yellow ring under him, a red ring under the defender, a dashed navy tie between them
  const v1=easeOutBack(sm(C2.v1,C2.v1+.35,tt))*(1-sm(C2.shows,C2.shows+.4,tt));
  if(v1>.02){floorDashRing(s,st,Y,f.X,f.Z,.55,9,201,v1);floorDashRing(s,st,R,d.X,d.Z,.55,9,202,v1);dashed(s,K,[P(f.X,f.Z+.6),P(d.X,d.Z-.6)],8,203,{dash:26,progress:v1});}
  // "shows the defender the inside": a yellow arrow to the inside (−X) that is only a promise (it fades); "defender leans": his red weight arrow
  const fk=sm(D_FAKE,D_FAKE+.5,tt,easeOut)*(1-sm(D_GO+.2,D_GO+.6,tt));
  floorArrow(s,st,Y,[[D_HOLD[0]-.1,D_HOLD[1]+.6],[D_HOLD[0]-.9,D_HOLD[1]+1.0],[D_HOLD[0]-1.6,D_HOLD[1]+1.2]],10,204,fk);
  const ln=sm(D_LEAN,D_LEAN+.5,tt,easeOut)*(1-sm(D_HIT,D_HIT+.4,tt));
  floorArrow(s,st,R,[[DEF0[0]-.1,DEF0[1]],[DEF0[0]-.8,DEF0[1]-.1],[DEF0[0]-1.4,DEF0[1]-.1]],12,206,ln,42);
  // "goes outside": the green path of the ball, round the far side of the defender
  const go=sm(D_GO,D_GO+.9,tt,easeOut)*(1-sm(D_IN+.5,D_IN+1,tt));
  floorArrow(s,st,G,[[D_HOLD[0]+.1,D_HOLD[1]+.1],[D_HOLD[0]+1.05,D_HOLD[1]+1.1],[D_OUT[0],D_OUT[1]-.1]],13,208,go,44);
  // "shoots fast": the flight line (dashed yellow) and a spark on the strike
  if(tt>D_HIT){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=demoBall(lerp(D_HIT,Math.min(tt,D_IN),k/14));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,210,{dash:40});}
  const its:{z:number;draw:()=>void}[]=[
   {z:d.Z,draw:()=>athlete(s,st,demoD,tt,DEMO_D,{detail:'high',smear:tt>D_LEAN-.1&&tt<D_LEAN+.4?.2:0})},
   {z:f.Z,draw:()=>athlete(s,st,demoP,tt,PANY,{detail:'high',smear:(tt>D_GO&&tt<D_GO+.6)||(tt>D_HIT-.4&&tt<D_HIT+.3)?.25:0})},
   {z:b.Z,draw:()=>{const r=ballAt(s,st,b.X,b.Y,b.Z,211,{min:10,rot:tt*5,smear:b.flying?.4:0,dir:Math.atan2(-.25,-1)});if(tt>=D_HIT&&tt<D_HIT+.4)sparkBurst(s,Y,r.p[0],r.p[1],r.r*2.6,{n:10,seed:212,g:easeOut(sm(D_HIT,D_HIT+.3,tt))});}},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=D_IN&&tt<D_IN+1.1){const p=proj(st,D_NP[0],D_NP[1]+.2,GZ+.4);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:213,g:easeOut(sm(D_IN,D_IN+.3,tt))*(1-sm(D_IN+.7,D_IN+1.1,tt))});}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2(tt),demoP(tt),.13));},
 still:D_GO+.5,
};

// ================= chapter 3 — PRACTISE: fake-and-go round a cone; three cards (fake, go, shoot); a quick shot; a tick =================
const C3={now:A(2,'Now'),fake:A(2,'fake one'),go:A(2,'go the'),shoot:A(2,'Then shoot'),back:A(2,'defender gets'),end:AUTH[2].seconds};
const P_HOME:[number,number]=[-.4,3.4],P_YAW=FACE_AWAY-.95,P_RIGHT:[number,number]=[Math.sin(P_YAW),-Math.cos(P_YAW)],P_FWD:[number,number]=[Math.cos(P_YAW),Math.sin(P_YAW)];
const CONE:[number,number]=[P_HOME[0]+P_FWD[0]*1.7,P_HOME[1]+P_FWD[1]*1.7];
const P_HIT=C3.shoot+.45;
/** Pany practising: a slow loop (dribble up → FAKE → GO → back), then on "shoot fast" a quick strike past the cone */
const practiceP:Gen=t=>{const loop=2.4,u=((t%loop)+loop)%loop;
 let pose=keyPoses(u,[[0,stand()],[.7,FAKE],[1.2,FAKE],[1.7,GO],[2.4,stand()]]);
 const shift=key(u,[[0,0],[.7,-.3],[1.2,-.3],[1.7,.45],[2.4,0]]);
 const stT=key(t,[[P_HIT-.5,0],[P_HIT,STRIKE_CONTACT],[P_HIT+.6,1]],linear),on=sm(P_HIT-.55,P_HIT-.4,t);
 if(on>0)pose=blendPose(pose,strike(stT),on);
 pose=blendPose(pose,celebrate((t-C3.back)*1.1,{kind:'arms'}),sm(C3.back+.3,C3.back+.7,t));
 const sh=shift*(1-on);
 return{pose,yaw:P_YAW,X:P_HOME[0]+P_RIGHT[0]*sh,Z:P_HOME[1]+P_RIGHT[1]*sh};};
const st3:Stage={F:1500,eye:2.4,cx:.3,cz:-2.4};
const CARD_Y=700,CARD_W=180,CARDS:[number,number,'fake'|'go'|'shoot'][]=[[-420,C3.fake,'fake'],[0,C3.go,'go'],[420,C3.shoot,'shoot']];
function cone(s:Sheet,st:Stage,X:number,Z:number){const k=kAt(st,Z),g=proj(st,X,0,Z),h=.32*k,w=.14*k;const c=polyPath([[g[0]-w,g[1]],[g[0]-w*.2,g[1]-h],[g[0]+w*.2,g[1]-h],[g[0]+w,g[1]]],true);
 shadow(s,g[0]+w*.3,g[1],w*1.3,w*.35,331,.35);s.knockout(c);s.fill(Y,c);s.fill(R,c,.55);s.knockout(rectPath(g[0]-w*.55,g[1]-h*.55,w*1.1,h*.14));s.fill(K,ribbon([[g[0]-w,g[1]],[g[0]-w*.2,g[1]-h],[g[0]+w*.2,g[1]-h],[g[0]+w,g[1]],[g[0]-w,g[1]]],4,{seed:332,taper:0,wobble:.4}));}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  camPath(s,t,[[0,60,300,1.2],[C3.fake-.4,40,360,1.1],[C3.fake+.2,20,560,.96],[C3.back-.3,20,560,.96],[C3.back+.4,50,330,1.22],[C3.end,60,320,1.26]]);
  arena(s,st,{t:tt,goal:false,cheer:.8*pulse(tt,C3.back+.2,1.4)});
  const f=practiceP(tt),sk=solve(f.pose,BUILD,placeAt(f.X,f.Z,f.yaw)),toe=toMine(sk.rToe);
  const shot=tt>=P_HIT,su=sm(P_HIT,P_HIT+.5,tt,easeOut);
  const bx=shot?toe[0]+(P_FWD[0]*3.2+P_RIGHT[0]*1.4)*su:lerp(f.X+P_FWD[0]*.4,toe[0]+P_FWD[0]*.08,.5),bz=shot?toe[2]+(P_FWD[1]*3.2+P_RIGHT[1]*1.4)*su:lerp(f.Z+P_FWD[1]*.4,toe[2]+P_FWD[1]*.08,.5);
  cone(s,st,CONE[0],CONE[1]);
  // "fake one way": a yellow arrow to his left; "go the other": a green arrow to his right; both fade before the shot
  const fk=sm(C3.fake,C3.fake+.4,tt,easeOut)*(1-sm(C3.shoot-.3,C3.shoot,tt)),gg=sm(C3.go,C3.go+.4,tt,easeOut)*(1-sm(C3.shoot-.3,C3.shoot,tt));
  const at=(f0:number,r0:number):Pt=>[P_HOME[0]+P_FWD[0]*f0+P_RIGHT[0]*r0,P_HOME[1]+P_FWD[1]*f0+P_RIGHT[1]*r0];
  floorArrow(s,st,Y,[at(.6,-.15),at(1.0,-.7),at(1.25,-1.15)],10,301,fk,34);
  floorArrow(s,st,G,[at(.6,.2),at(1.3,.8),at(2.3,1.0)],12,303,gg,38);
  if(!shot||su<1){const bp=proj(st,bx,BALL_R,bz),br=kAt(st,bz)*BALL_R;shadow(s,bp[0],proj(st,bx,0,bz)[1],br*1.15,br*.3,305,.45);ball(s,bp[0],bp[1],br,306,{rot:tt*3,smear:shot?.5:0,dir:Math.atan2(-1,-.8)});}
  athlete(s,st,practiceP,tt,PANY,{detail:'high',smear:tt>P_HIT-.2&&tt<P_HIT+.3?.2:0});
  // the three cards rise on "fake one way", each prints one step with a small figure; they drop before "defender gets back"
  const rise=sm(C3.fake-.3,C3.fake+.3,tt,easeOut),drop=sm(C3.back-.5,C3.back-.1,tt,easeIn);
  if(rise>.01&&drop<1){const dy=(1-rise)*700+drop*900,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const q=handCut([[cx-CARD_W,CARD_Y-220+dy],[cx+CARD_W,CARD_Y-220+dy],[cx+CARD_W,CARD_Y+220+dy],[cx-CARD_W,CARD_Y+220+dy]],70+i,7,60);outline.push(q);cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.16);
   CARDS.forEach(([cx,t0c,kind],i)=>{const on=sm(t0c,t0c+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+165;
    const fc=figureCam({x:cx+10,y:gy,height:380*(.9+.1*on),azimuth:-120,elevation:14,fov:16});
    s.save();s.clip(polyPath(outline[i],true));
    const pose=kind==='fake'?FAKE:kind==='go'?GO:strike(STRIKE_CONTACT),csk=solve(pose,BUILD,{});
    const Pc=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    const foot=csk.rToe,cb:V3=[foot[0]+.08,BALL_R,foot[2]],bb=Pc(cb),bR=BALL_R*(fc.scale?fc.scale(cb):100);
    // the move's diagram on the floor: fake = a yellow arrow to his left, go = a green arrow to his right, shoot = a red burst of speed
    if(kind==='fake'){const a0=Pc([.2,0,0]),a1=Pc([.3,0,-.75]);const pts:Pt[]=[a0,L2(a0,a1,.5),a1];dashed(s,Y,pts,8,85,{dash:22});arrowHead(s,Y,pts,24,86);}
    if(kind==='go'){const a0=Pc([.2,0,0]),a1=Pc([.6,0,.8]);const pts:Pt[]=[a0,L2(a0,a1,.5),a1];dashed(s,G,pts,8,87,{dash:22});arrowHead(s,G,pts,24,88);}
    if(kind==='shoot')sparkBurst(s,R,bb[0],bb[1],bR*3.4,{n:9,seed:89,g:1});
    shadow(s,bb[0],Pc([cb[0],0,cb[2]])[1],bR*1.1,bR*.3,89+i,.4);ball(s,bb[0],bb[1],Math.max(8,bR),81+i);
    drawAthlete(s,pose,fc,{...PANY,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "before the defender gets back": a big green tick stamps beside him, with a navy misregistered echo
  const tick=easeOutBack(sm(C3.back+.1,C3.back+.45,tt));
  if(tick>.02){const g=proj(st,f.X,0,f.Z),h=kAt(st,f.Z)*1.72,c:Pt=[g[0]+h*.62,g[1]-h*.72],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(G,tp);}
  if(tt>=P_HIT&&tt<P_HIT+.5){const p=proj(st,toe[0],.3,toe[2]);sparkBurst(s,Y,p[0],p[1],110,{n:9,seed:411,g:easeOut(sm(P_HIT,P_HIT+.25,tt))*(1-sm(P_HIT+.3,P_HIT+.5,tt))});dust(s,null,p[0],p[1]+30,50,8,{seed:412,size:8});}
 },
 still:C3.go+.6,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'pany-varela-futsal-signature',format:'futsal',title:'Pany Varela’s 1v1',theme:'Fake one way, go the other, then shoot fast.',
 ageNote:'For players aged 7–12: the 2021 World Cup final and his two goals are real; the 1v1 is shown as his trademark move, not a replay of those goals.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball jinks left (a yellow dash) then darts right (a green dash); reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.7),dx=u<.35?-60*easeOut(u/.35):-60+160*easeOut((u-.35)/.65);
  if(u>.1)s.fill(Y,ribbon([[x,y+r*1.2],[x-60*Math.min(1,u/.35),y+r*1.2]],8,{seed,taper:.3,wobble:1}),1-u*.6);
  if(u>.4)s.fill(G,ribbon([[x-60,y+r*1.4],[x+dx,y+r*1.4]],10,{seed:seed+1,taper:.3,wobble:1}),1-u*.4);
  s.fill(K,polyPath(blob(x+dx,y+r*.95,r*.9,r*.22,seed+2,{n:16}),true),.3);
  ball(s,x+dx,y,r,seed,{rot:age*6});
 },
};
export default film;
