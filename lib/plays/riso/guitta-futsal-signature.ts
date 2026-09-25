/** Guitta — "the lightning-reflex save": a signature-move riso film (iconic plays, FUTSAL; Guitta is a goleiro).
 *
 * WHY THIS MOMENT: Guitta's entry (lib/town/iconicPlays.json) is a signature — the lightning-reflex save — not one match. No written source
 * we could reach describes ONE dated Guitta save (the reports we found name him only for goals conceded, an own goal and a post-match quote),
 * so the film follows the brief's honest FALLBACK: the real-match chapter shows only confirmed things from a real, documented Guitta match —
 * the 2019 UEFA Futsal Champions League final, Sporting CP 2–1 Kairat, Almaty Arena, 28 April 2019, with Guitta in Sporting's squad — and the
 * save itself is a separate, clearly labelled demonstration ("Here is how he did it"), in training kits in an empty arena, never staged
 * inside that final.
 *  1  LIVE (broadcast camera, main stand, real time) — CONFIRMED THINGS ONLY: the arena and its crowd, the final whistle (the scoreboard's
 *     clock runs out), 2–1 (two green pips v one yellow), Sporting's players run to their goalkeeper and celebrate. No goal, save or tackle
 *     is staged; the ball is simply in Kairat's feet at midfield when the whistle goes.
 *  2  HOW HE DID IT (demonstration; a neutral training shooter, empty stands; low, behind the shooter's right shoulder, real time): a quick
 *     close-range right-foot shot; his hand flies out and parries it past the near post.
 *  3  REPLAY of the demonstration (slow motion, LOW BEHIND THE GOAL through the back net — a set-up no other film uses): his eyes on the
 *     shooter's foot (red eye-line + ring), "not his body" (torso struck out in navy), the hips point to the far post (navy floor arrow) but
 *     the foot sends it to the near post (red arrow), he is already moving, saved.
 *  4  PRACTISE (lesson from the entry's `lesson`: "Watch the shooter's foot, not their body, to react quicker"): Guitta in a goal, a friend
 *     shoots; eye-line to the kicking foot, the body struck out, a quick save, a tick.
 * Sources (written; fetched once, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "Guitta" (raw, fetched Sep 2026): Thiago Mendes Rocha, born 11 Jun 1987, goalkeeper, 1.77 m; Sporting CP 2018–2023;
 *    Brazil from 2011; World Cup 2012 and 2024; Futsal Planet best goalkeeper 2021. — https://en.wikipedia.org/wiki/Guitta
 *  - Wikipédia (pt), "Guitta" (raw): pé direito (right-footed); Sporting CP honours incl. UEFA Futsal Champions League 2018–19 and 2020–21.
 *    — https://pt.wikipedia.org/wiki/Guitta
 *  - Wikipedia, "2018–19 UEFA Futsal Champions League" (raw): final 28 Apr 2019, Almaty Arena, Sporting CP 2–1 Kairat (Cavinato 21:17,
 *    Merlim 26:49; Douglas Júnior 37:39), attendance 11,973. — https://en.wikipedia.org/wiki/2018%E2%80%9319_UEFA_Futsal_Champions_League
 *  - UEFA.com, "UEFA Futsal Champions League final preview: Barça vs Sporting" (2022): "Guitta, Erik, Merlim, Cavinato, João Matos also
 *    were involved in the 2019 final win against Kairat in Almaty"; Bernardo Paço named as Sporting's back-up keeper.
 *    https://www.uefa.com/uefafutsalchampionsleague/news/0274-1508967f3eb0-868f26ee5f41-1000--uefa-futsal-champions-league-final-preview-barca-vs-sporti/
 *  - FIFA.com Lithuania 2021 round-of-16 review ("an uncharacteristic mistake from Guitta") and UEFA.com 2022 final report (Guitta beaten
 *    by Lozano's chip; his quote) — read, NOT used as the moment (both show him conceding).
 * CONFIRMED: the match (2019 UEFA Futsal Champions League final), date, venue, city, the 2–1 result (Sporting won the title), Guitta
 *  involved for Sporting, his height, right foot, clubs, national team and award; the futsal court (40×20 m, 3×2 m goals, 5 v 5).
 * INFERRED (not named in the narration): that Guitta started the final (UEFA lists him as "involved"; he was first choice and Bernardo
 *  Paço the back-up) and was in goal at the whistle; how the last seconds and the celebration looked (who ran where, the ball at midfield);
 *  kits — Sporting green-and-white hoops / black (navy) shorts / green socks, Kairat yellow shirts / black (navy) shorts / yellow socks, Guitta
 *  in a red long-sleeved keeper kit with no number (his Sporting number is unverified); the wood-tone court; the hanging scoreboard; which
 *  goal was Sporting's; Guitta's hair (short, dark). Chapters 2–4 are teaching DEMONSTRATIONS of his signature, not footage: the shot
 *  (right foot, from his right, hips to the far post, ball to the near post) and the one-handed parry are chosen to show the lesson.
 *  No video was reviewed.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the strike and the dive). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 *  z → −Z. The shooter strikes with the RIGHT foot (library default); the ball meets Guitta's gloves because the save point is SOLVED from
 *  keeperDive at full stretch (gloveAt), and the strike ball from the kicking toe (strikeBall).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 *  the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Kairat, crowd, lights, ball trail), red (Guitta's kit and "watch the foot" diagrams, the posts), green (Sporting hoops),
 *  navy (key line, shorts, stands, "not the body" marks). Wood court = yellow + red screens.
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈150–280 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,circlePath,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions / possessives such as "shooter’s"). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2019 final',text:'The 2019 European futsal final, in Almaty. The whistle goes! Sporting beat Kairat two to one, and their goalkeeper Guitta celebrates.',tail:2.2,
  cues:['The 2019','in Almaty','The whistle','Sporting beat','two to one','their goalkeeper','celebrates'],heads:{'The 2019':'Final 2019','two to one':'2–1','celebrates':'Champions'}},
 {label:'How he did it',text:'Here is how he did it. A quick shot from close range, and his hand flies out. Saved!',tail:1.9,
  cues:['Here is how','A quick shot','hand flies','Saved'],heads:{'Here is how':'How he did it','Saved':'Saved'}},
 {label:'Replay: watch the foot',text:'Again, slowly. Guitta watches the shooter’s foot, not his body. The hips point one way, but the foot sends it the other. He is already moving. Saved!',tail:2,
  cues:['Again','Guitta watches','not his body','The hips point','but the foot sends','already moving','Saved'],heads:{'Again':'Replay','The hips point':'Hips: far post','but the foot sends':'Foot: near post','Saved':'Watch the foot'}},
 {label:'Practise it',text:'Try it with a friend. Watch the shooter’s foot, not their body, to react quicker!',tail:2.6,
  cues:['Try it','Watch the','not their body','react quicker'],heads:{'Watch the':'Eyes on the foot','react quicker':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/guitta-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/guitta-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/guitta-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('guitta: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('guitta: no cue '+w);return c.at;};
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
type Ball3={X:number;Y:number;Z:number;flying:boolean;spin:number};
const bez=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the wood court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a floor quad (X,Z corners) clipped to just in front of the camera */
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
/** a hand-drawn ring round a screen point (knocked out first); g grows it in */
function ring2(s:Sheet,ink:string,c:Pt,rx:number,ry:number,w:number,seed:number,g=1,cov=1){if(g<=.02)return;const p=ribbon(blob(c[0],c[1],rx*g,ry*g,seed,{n:22,amp:.06}),w,{seed:seed+1,close:true,wobble:1.1});s.knockout(p);s.fill(ink,p,cov);}
/** "not this": a navy dashed ellipse with a slash through it (the body the keeper must NOT watch) */
function notThis(s:Sheet,c:Pt,rx:number,ry:number,w:number,seed:number,g:number){if(g<=.02)return;const q=blob(c[0],c[1],rx,ry,seed,{n:26,amp:.05});
 const ring=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.2)});s.knockout(ring);s.fill(K,ring,.9);
 const a:Pt=[c[0]-rx*.72,c[1]+ry*.72],b:Pt=[c[0]+rx*.72,c[1]-ry*.72],sl=partial([a,[lerp(a[0],b[0],.5),lerp(a[1],b[1],.5)],b],g),sp=ribbon(sl,w*1.3,{seed:seed+3,taper:.2,wobble:1});if(sl.length>1){s.knockout(sp);s.fill(K,sp);}}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_AWAY=Math.PI/2,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.88],[R,.2]];
const GBUILD={height:1.77,bulk:1};
/** Guitta, Sporting CP goalkeeper: 1.77 m (Wikipedia); red long-sleeved keeper kit, paper gloves, no number (kit inferred) */
const GUITTA:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.8],[R,.3]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',number:null,hairStyle:'short',build:GBUILD,seed:31};
/** Sporting CP: green-and-white hoops, black (navy) shorts, green socks (inferred) */
const SCP=(n:number):AthleteStyle=>({shirt:G,pattern:'hoops',patternInk:'paper',shorts:K,socks:G,boots:K,skin:[[Y,.84],[R,.24]],hair:K,line:K,trim:K,hairStyle:n%3===1?'bald':'short',build:{height:1.72+hash(n,3)*.12},seed:40+n});
/** Kairat: yellow shirts, black (navy) shorts, yellow socks (inferred) */
const KAI=(n:number):AthleteStyle=>({shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:60+n});
const SBUILD={height:1.78};
/** the demonstration shooter (chapters 2–3): a neutral navy-screen training bib — no team is claimed */
const SHOOTER:AthleteStyle={shirt:[K,.45],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'short',build:SBUILD,seed:67};
/** the practice friend: a neutral paper/navy training kit (no team claimed in chapter 4) */
const FRIEND:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.84],[R,.22]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.6,bulk:.95},seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number;build?:{height?:number}}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact (our floor coords, relative to the stance place) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT),SBUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return toMine([toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08]);}
/** the dive the saves use: to Guitta's right, mid height; full stretch at DIVE_FULL */
const DIVE_H=.38,DIVE_FULL=.55;
/** a futsal goal is 3 m wide: the full-size dive's sideways travel is cut to a third, so the palms stop just inside the post (a quick
 * collapse-and-reach, the futsal keeper's reflex save) */
const dive=(u:number)=>{const p=keeperDive(u,{side:'r',height:DIVE_H});return{...p,dz:p.dz*.32,air:p.air*.75};};
/** the save point: between his gloves at full stretch (solved, so the ball meets the palms) */
function gloveAt(X:number,Z:number,yaw:number):V3{const sk=solve(dive(DIVE_FULL),GBUILD,placeAt(X,Z,yaw)),a=toMine(sk.lHa),b=toMine(sk.rHa);return[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];}
/** a saving keeper: set and bouncing → the dive fires at t0 → full stretch at tS (the save) → lands → gets up and claps */
function keeperGen(X:number,Z:number,yaw:number,t0:number,tS:number,o:{shuffle?:(t:number)=>number;up?:number}={}):Gen{
 return t=>{const dz=o.shuffle?o.shuffle(Math.min(t,t0)):0;let pose=keeperSet(Math.min(t,t0)*1.5);
  if(t>=t0){const d=t<tS?DIVE_FULL*easeOut(clamp((t-t0)/(tS-t0))):lerp(DIVE_FULL,1,sm(tS,tS+.75,t,easeOut));pose=blendPose(pose,dive(d),sm(t0,t0+.05,t));}
  if(o.up!==undefined&&t>o.up){const u=sm(o.up,o.up+.6,t,easeIO);pose=blendPose(pose,celebrate((t-o.up)*1.1,{kind:'arms'}),u);}
  const upShift=o.up!==undefined&&t>o.up?sm(o.up,o.up+.6,t):0,side=[Math.cos(yaw+Math.PI/2),Math.sin(yaw+Math.PI/2)];// his right-hand side on our floor
  return{pose,yaw,X:X-side[0]*dz+side[0]*2.1*upShift,Z:Z-side[1]*dz+side[1]*2.1*upShift};};
}

// ---------------- the ball: paper sphere, navy panels, navy shade, rim, glint ----------------
function ball(s:Sheet,x:number,y:number,r:number,seed:number,o:{rot?:number;smear?:number;dir?:number}={}){
 const{rot=0,smear=0,dir=0}=o;let pts=blob(x,y,r,r,seed,{amp:.025,n:36});
 if(smear>0){const dx=Math.cos(dir),dy=Math.sin(dir);pts=pts.map(p=>{const back=-((p[0]-x)*dx+(p[1]-y)*dy);return back>0?[p[0]-dx*smear*back/r,p[1]-dy*smear*back/r] as Pt:p;});}
 const disc=polyPath(pts,true);s.knockout(disc);
 if(r<14){s.fill(K,ribbon(pts,Math.max(3,r*.2),{seed:seed+1,close:true,wobble:.5}));return;}
 s.save();s.clip(disc);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 pan.addPath(pent(x,y,r*.33,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(x+Math.cos(a)*r*.88,y+Math.sin(a)*r*.88,r*.3,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(4,r*.075),{seed:seed+1,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(x-r*.4,y-r*.42,r*.13,r*.09,seed+2,{amp:.05,n:12}),true));
}
const shadow=(s:Sheet,x:number,y:number,rx:number,ry:number,seed:number,cov=.32)=>s.fill(K,polyPath(blob(x,y,rx,ry,seed,{amp:.05,n:20}),true),cov);
function ballOn(s:Sheet,st:Stage,b:Ball3,seed:number,o:{min?:number;smear?:number;dir?:number;trail?:(u:number)=>Ball3;t0?:number;t?:number}={}){
 const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(o.min??9,kAt(st,b.Z)*BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);
 if(b.flying&&o.trail&&o.t!==undefined&&o.t0!==undefined){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=o.trail(Math.max(o.t0,o.t-.18+k*.0225));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.4,{seed:seed+7,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
 ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?(o.smear??.45):0,dir:o.dir??0});return{p,r};
}

// ---------------- the arena: wood court, crowd (Kairat's yellow home end), lights ----------------
/** stepped navy rows, lit faces; mostly yellow shirts (the Almaty crowd), some green; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,empty=false){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 if(empty){s.fill(Y,rectPath(-span,top-15*rowH-kw*.6,span*2,kw*.5),.35);return;}
 const heads=new Path2D(),yel=new Path2D(),grn=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.42)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.5)grn.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(G,grn);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** the wood court: a yellow + red screen floor with plank seams along `along` ('x' planks run across the screen, 'z' into it) */
function woodFloor(s:Sheet,st:Stage,wall:number,along:'x'|'z',zNear:number,zFar:number){
 const span=9000,floor=rectPath(-span,wall,span*2,span);s.fill(Y,floor,.42);s.fill(R,floor,.3);
 const seams=new Path2D();
 if(along==='z'){for(let i=-24;i<=24;i++){const X=i*.6,a=proj(st,X,0,Math.max(zNear,st.cz+.4)),b=proj(st,X,0,zFar);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);}}
 else{for(let Z=Math.max(zNear,st.cz+.6);Z<zFar;Z+=Z<6?.6:1.2){const a=proj(st,-40,0,Z),b=proj(st,40,0,Z);seams.moveTo(a[0],a[1]);seams.lineTo(b[0],b[1]);}}
 s.stroke(K,seams,3,.28);
}
function boards(s:Sheet,st:Stage,wall:number,kw:number,step:number){const span=9000,board=.95*kw;s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();const base=Math.floor(st.cx/step)*step;for(let i=-14;i<14;i++){const x0=(base+i*step+.3-st.cx)*kw,x1=(base+i*step+step*.8-st.cx)*kw;ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.7);
 s.fill(G,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));return wall-board;}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Sporting's goal at X = +20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;keeper?:()=>void;board?:(top:number,kw:number)=>void}={}){
 const{cheer=0,flash=0}=o,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 woodFloor(s,st,wall,'x',0,BOARDS);
 const run=polyPath(floorQuad(st,-24,-3,24,0),true);s.fill(K,run,.3);
 // painted lines: touchlines, goal line, halfway, the penalty area (6 m arcs from the posts), the 6 m and 10 m marks, the centre circle
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X-6,GOAL_X-10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 const top=boards(s,st,wall,kw,3);stands(s,top,kw,t,cheer,flash,st.cx);o.board?.(top,kw);
 sideGoal(s,st);o.keeper?.();sidePosts(s,st);
}
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

// ---- END-ON court (camera looks along +Z): a goal at Z = gz with posts X = ±1.5, net going away (dir +1) or toward the camera (dir −1) ----
function endGoalNet(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,gz+lerp(.95,.55,Yh/H));
 const out=[proj(st,Lx,0,gz),proj(st,Lx,H,gz),proj(st,Rx,H,gz),proj(st,Rx,0,gz),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,gz)*.018),.6);
}
function endPosts(s:Sheet,st:Stage,gz:number){
 const Lx=-1.5,Rx=1.5,H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,gz);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,gz)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
/** the court seen end-on: wood floor, paper lines (a goal line + D at gz, optional halfway line + circle), boards + stands at wallZ */
function endArena(s:Sheet,st:Stage,o:{t:number;wallZ:number;gz?:number;half?:number;cheer?:number;flash?:number;empty?:boolean}){
 const{t,wallZ,gz,half,cheer=0,flash=0,empty=false}=o,wall=proj(st,0,0,wallZ)[1],kw=kAt(st,wallZ);
 woodFloor(s,st,wall,'z',st.cz+.4,wallZ);
 const out=new Path2D();out.addPath(polyPath(floorQuad(st,-40,-40,-10,wallZ),true));out.addPath(polyPath(floorQuad(st,10,-40,40,wallZ),true));s.fill(K,out,.3);
 const lines=new Path2D(),zEnd=Math.min(wallZ-1,40);
 lines.addPath(polyPath(floorStrip(st,[[-10,st.cz+.5],[-10,zEnd]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,st.cz+.5],[10,zEnd]],.05),true));
 if(gz!==undefined){const arcPts:Pt[]=[],d=gz>st.cz+8?-1:1;// the D opens toward the play
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),gz+d*6*Math.sin(a)]);}
  for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),gz+d*6*Math.sin(a)]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,Math.max(gz,st.cz+.5)],[10,Math.max(gz,st.cz+.5)]],.05),true));lines.addPath(polyPath(floorStrip(st,arcPts.filter(p=>p[1]>st.cz+.5),.05),true));
  lines.addPath(polyPath(floorRing(st,0,gz+d*6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,gz+d*10,.12,12),true));}
 if(half!==undefined){const cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,half+Math.sin(a)*3]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,half],[10,half]],.05),true));lines.addPath(polyPath(floorStrip(st,cc,.05),true));}
 s.knockout(lines,.94);
 const top=boards(s,st,wall,kw,2.4);stands(s,top,kw,t,cheer,flash,st.cx,empty);
}

// ================= chapter 1 — LIVE: the 2019 final (confirmed things only): the arena, the final whistle, 2–1, Sporting celebrate with Guitta =================
const C1={y19:A(0,'The 2019'),alm:A(0,'in Almaty'),whistle:A(0,'The whistle'),beat:A(0,'Sporting beat'),two:A(0,'two to'),gk:A(0,'their goal'),cel:A(0,'celebrates'),end:AUTH[0].seconds};
const KX=18.9,KZ=10.05,WH=C1.whistle+.1;
/** the ball: with a Kairat player in midfield (no attack is staged); at the whistle it is let go and rolls to a stop */
function liveBall(T:number):Ball3{
 if(T<WH){const X=-1.4+.9*sm(0,WH,T,linear);return{X:X+.12*Math.sin(T*6),Y:BALL_R,Z:9.4,flying:false,spin:T*5};}
 const u=sm(WH,WH+1.6,T,easeOut);return{X:-.5+1.6*u,Y:BALL_R,Z:9.4-.8*u,flying:false,spin:5+u*6};
}
/** Guitta: set in his goal while play is far away → arms up at the whistle → a few steps out → jumps with his team-mates on "celebrates" */
const liveK:Gen=T=>{let pose=keeperSet(T*1.3);
 pose=blendPose(pose,celebrate(0,{kind:'arms'}),sm(WH,WH+.35,T));
 const walk=sm(C1.beat,C1.gk,T,easeIO);if(T>C1.beat&&T<C1.gk+.2)pose=blendPose(pose,runCycle(T*runCadence(.35),{speed:.35}),Math.sin(Math.PI*walk)*.9);
 if(T>=C1.gk)pose=blendPose(pose,celebrate((T-C1.gk)*1.2,{kind:'arms'}),sm(C1.gk,C1.gk+.3,T));
 return{pose,yaw:FACE_LEFT+(T>C1.gk?-.6*sm(C1.gk,C1.gk+.5,T):0),X:KX-1.6*walk,Z:KZ};};
/** Sporting (green hoops): spread through the court at the whistle → arms up → sprint to Guitta → jump with him */
const SCP0:[number,number][]=[[4.8,6.4],[2.6,12.4],[7.6,15.4],[.8,8.6]],SCPG:[number,number][]=[[-1.1,-1.2],[-1.3,1.3],[.1,2],[-2.2,.2]];
const liveScp=(i:number):Gen=>T=>{const[x0,z0]=SCP0[i],[gx,gz]=SCPG[i],t0=WH+.45+i*.12,go=sm(t0,C1.gk+.3,T,easeIO),k=liveK(Math.min(T,C1.gk+.3));
 const X=lerp(x0+.4*sm(0,WH,T),k.X+gx,go),Z=lerp(z0,k.Z+gz,go);
 let pose=blendPose(stand(),runCycle(T*runCadence(.2)+i*.3,{speed:.2}),T<WH?.6:0);
 pose=blendPose(pose,celebrate(0,{kind:'arms'}),sm(WH,WH+.3,T)*(1-sm(t0,t0+.3,T)));
 if(T>=t0&&T<C1.gk+.4)pose=blendPose(pose,celebrate((T-t0)*1.4,{kind:'run'}),sm(t0,t0+.3,T)*(1-sm(C1.gk+.1,C1.gk+.4,T)));
 if(T>=C1.gk+.1)pose=blendPose(pose,celebrate((T-C1.gk)*1.2+i*.21,{kind:'arms'}),sm(C1.gk+.1,C1.gk+.4,T));
 const yaw=T<t0?FACE_LEFT:go<1?yawTo(k.X+gx-x0,k.Z+gz-z0):yawTo(k.X-(k.X+gx),k.Z-(k.Z+gz));
 return{pose,yaw,X,Z};};
/** Kairat (yellow): in possession at midfield when the whistle goes; hands to heads, one crouches, heads drop */
const KAI0:[number,number][]=[[-1.9,9.1],[1.2,13.8],[3.2,5.0],[-4.6,11.8]];
const DROP:Pose=posed({lHipF:58,rHipF:58,lKnee:70,rKnee:70,lean:44,neckP:40,lShF:40,rShF:40,lElb:20,rElb:20,lShA:10,rShA:10});
const liveKai=(i:number):Gen=>T=>{const[x0,z0]=KAI0[i],d=sm(WH+.2,WH+1.1,T);
 let pose=i===0&&T<WH?runCycle(T*runCadence(.25),{speed:.25}):blendPose(stand(),runCycle(T*runCadence(.2)+i*.4,{speed:.2}),T<WH?.5:0);
 pose=blendPose(pose,i===2?DROP:posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:10,neckP:34,lShF:150,rShF:150,lShA:40,rShA:40,lElb:150,rElb:150}),d);
 const X=i===0?(T<WH?-1.9+.9*sm(0,WH,T,linear):-1):x0+.3*sm(0,WH,T);
 return{pose,yaw:i===0?FACE_RIGHT:FACE_RIGHT+(i-1.5)*.3,X,Z:z0};};
/** the scoreboard hung over the far stands (no text: a clock bar that runs out at the whistle, two green pips v one yellow) */
function scoreboard(s:Sheet,st:Stage,T:number,top:number,kw:number){
 const cx=(7-st.cx)*kw,w=7.5*kw,h=2.3*kw,y=top-6.2*.55*kw,pn=polyPath([[cx-w/2,y-h/2],[cx+w/2,y-h/2],[cx+w/2,y+h/2],[cx-w/2,y+h/2]],true);
 s.knockout(pn);s.fill(K,pn,.92);
 const bw=w*.8*(T<WH?.14*(1-sm(0,WH,T,linear)):0);if(bw>1)s.fill(Y,rectPath(cx-w*.4,y+h*.24,bw,h*.12));
 const pp=pulse(T,C1.two,1.2),pip=(x:number,ink:string)=>{const r=h*.16*(1+.35*pp);s.knockout(circlePath(x,y-h*.08,r*1.25));s.fill(ink,circlePath(x,y-h*.08,r));};
 pip(cx-w*.33,G);pip(cx-w*.18,G);pip(cx+w*.26,Y);
 const sep=new Path2D();sep.rect(cx+w*.02,y-h*.3,w*.03,h*.44);s.fill(Y,sep,.5);
 if(T>=WH&&T<WH+.9){sparkBurst(s,Y,cx,y-h*.6,w*.55,{n:12,seed:111,g:easeOut(sm(WH,WH+.3,T))*(1-sm(WH+.5,WH+.9,T))});}
}
const liveCam=(T:number)=>({x:key(T,mono([[0,-3],[C1.alm,1.5],[WH,3.6],[C1.beat,8.4],[C1.two,12.2],[C1.gk,15.2],[C1.end,15.6]]),easeInOutSine),
 zoom:key(T,mono([[0,.54],[C1.alm,.56],[WH,.58],[C1.beat,.62],[C1.gk,.78],[C1.cel,.86],[C1.end,.84]]),easeInOutSine),
 y:key(T,mono([[0,1020],[C1.alm,1060],[C1.gk,1070],[C1.end,1080]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const b=liveBall(T),joy=sm(WH,WH+.4,T);
 courtSide(s,st,T,{cheer:.1+.6*joy+.3*pulse(T,C1.cel,1.5),flash:pulse(T,WH,1)+.8*pulse(T,C1.cel,1.3),board:(top,kw)=>scoreboard(s,st,T,top,kw),
  keeper:()=>{const k=liveK(T),g=proj(st,k.X,0,k.Z),h=1.77*kAt(st,k.Z);
   // "their goalkeeper": a red ring picks him out
   ring2(s,R,[g[0],g[1]-h*.5],h*.42,h*.62,8,121,easeOutBack(sm(C1.gk,C1.gk+.4,T))*(1-sm(C1.cel+.6,C1.cel+1.1,T)),1);
   athlete(s,st,liveK,T,GUITTA,{});}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 SCP0.forEach((_,i)=>{const g=liveScp(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,SCP(i),{detail:T>C1.two?'auto':'low'})});});
 KAI0.forEach((_,i)=>{const g=liveKai(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,KAI(i),{detail:'low'})});});
 items.push({z:b.Z-.05,draw:()=>{ballOn(s,st,b,16,{});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** Guitta's chest in the live take (the passage enters his red shirt → the demonstration in goal) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09,build=GBUILD):Pt[]{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveK(tt),.16));},still:C1.cel+.3};

// ---- the demonstration geometry (chapters 2–3): a close-range right-foot shot from the keeper's right, hips to the far post, the ball
// ---- to the near post; SHOT = where the ball sits relative to his goal: 5.7 m out, 2.85 m to his right
const OUT_D=5.7,SIDE_D=2.85;

// ================= chapter 2 — HOW HE DID IT (demonstration, training kits, empty arena): real time, low behind the shooter's right shoulder =================
const C2={how:A(1,'Here is'),quick:A(1,'A quick'),hand:A(1,'hand flies'),saved:A(1,'Saved'),end:AUTH[1].seconds};
/** this world: goal line Z = 7.4, posts X ±1.5; Guitta faces the camera (his right = screen LEFT = the near post) */
const GZ3=7.4,G3:[number,number]=[0,GZ3-.75],RB3:[number,number]=[-SIDE_D,GZ3-OUT_D];
const SAVE3=gloveAt(G3[0],G3[1],FACE_CAMERA);
const FAR3:[number,number]=[1.3,GZ3],YAW3=yawTo(FAR3[0]-RB3[0],FAR3[1]-RB3[1])+.25;
const SB3=strikeBall(YAW3),PL3:[number,number]=[RB3[0]-SB3[0],RB3[1]-SB3[2]];
/** real time: the run-up on "A quick shot", contact .32 s before "hand flies", the palm .28 s later (≈ 20 m/s) */
const S3_HIT=C2.hand-.32,S3_SAVE=S3_HIT+.28;
const s3T=(t:number)=>key(t,[[0,0],[C2.quick,.02],[S3_HIT-.35,.22],[S3_HIT,STRIKE_CONTACT],[S3_HIT+.5,1]],linear);
const shoot3:Gen=t=>{let pose=strike(s3T(t));if(t<C2.quick+.3)pose=blendPose(blendPose(stand(),runCycle(t*runCadence(.2),{speed:.2}),sm(C2.how,C2.quick,t)),pose,sm(C2.quick,C2.quick+.3,t));
 return{pose,yaw:YAW3,X:PL3[0]+key(t,[[0,-.9],[C2.quick,-.8],[S3_HIT-.35,0,easeOut]]),Z:PL3[1]+key(t,[[0,-1.3],[C2.quick,-1.1],[S3_HIT-.35,0,easeOut]])};};
const keep3=keeperGen(G3[0],G3[1],FACE_CAMERA,S3_HIT-.05,S3_SAVE,{up:C2.saved+.5});
const OUT3:V3=[-2.6,1.2,GZ3+.6];
function ball3(t:number):Ball3{
 if(t<S3_HIT){const u=sm(C2.quick,S3_HIT-.4,t,easeOut);return{X:lerp(RB3[0]-.5,RB3[0],u),Y:BALL_R,Z:lerp(RB3[1]-.9,RB3[1],u),flying:false,spin:u*6};}
 if(t<S3_SAVE){const u=sm(S3_HIT,S3_SAVE,t,linear),q=bez([RB3[0],BALL_R,RB3[1]],[lerp(RB3[0],SAVE3[0],.5),SAVE3[1]*.9+.25,lerp(RB3[1],SAVE3[2],.5)],SAVE3,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:u*10};}
 const u=sm(S3_SAVE,S3_SAVE+.7,t,easeOut),q=bez(SAVE3,[lerp(SAVE3[0],OUT3[0],.5),SAVE3[1]+.5,lerp(SAVE3[2],OUT3[2],.5)],OUT3,u);return{X:q[0],Y:q[1],Z:q[2],flying:u<1,spin:10+u*8};
}
const st3:Stage={F:1500,eye:1.15,cx:RB3[0]+1.5,cz:RB3[1]-5.6};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st3,hit=pulse(t,S3_SAVE,.4);
  camPath(s,t,[[0,-60,20,.98],[C2.how,-20,0,1.04],[C2.quick,-150,40,1.06],[S3_HIT,-100,30,1.16],[S3_SAVE+.1,20,0,1.3],[C2.saved,60,0,1.32],[C2.end,40,10,1.22]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*80)]);
  endArena(s,st,{t:tt,wallZ:GZ3+2.6,gz:GZ3,empty:true});
  const kk=keep3(tt),b=ball3(tt),kz=kAt(st,kk.Z);
  const its:{z:number;draw:()=>void}[]=[
   {z:kk.Z,draw:()=>{endGoalNet(s,st,GZ3);
     // "Here is how he did it": a red ring picks out the goalkeeper
     const g=proj(st,G3[0],0,G3[1]);ring2(s,R,[g[0],g[1]-kz*.9],kz*.62,kz*1.02,9,221,easeOutBack(sm(C2.how,C2.how+.4,tt))*(1-sm(C2.quick,C2.quick+.4,tt)),1);
     athlete(s,st,keep3,tt,GUITTA,{detail:'mid',smear:tt>S3_HIT&&tt<S3_SAVE+.2?.12:0});endPosts(s,st,GZ3);
     if(tt>=S3_SAVE&&tt<S3_SAVE+.8){const p=proj(st,SAVE3[0],SAVE3[1],SAVE3[2]);sparkBurst(s,Y,p[0],p[1],110,{n:11,seed:305,g:easeOut(sm(S3_SAVE,S3_SAVE+.25,tt))*(1-sm(S3_SAVE+.45,S3_SAVE+.8,tt))});}}},
   {z:shoot3(tt).Z,draw:()=>athlete(s,st,shoot3,tt,SHOOTER,{detail:'high',smear:tt>S3_HIT-.25&&tt<S3_HIT+.2?.12:0})},
   {z:b.Z,draw:()=>{ballOn(s,st,b,311,{min:10,trail:ball3,t0:S3_HIT,t:tt,dir:Math.atan2(.3,1)});}},
  ];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "Saved!": a red ring stamps round his gloves where the ball was stopped
  const sv=easeOutBack(sm(C2.saved,C2.saved+.4,tt));if(sv>.02){const p=proj(st,SAVE3[0],SAVE3[1],SAVE3[2]),k2=kAt(st,SAVE3[2]);ring2(s,R,p,.5*k2,.45*k2,9,308,sv,1);}
 },
 aperture(t0){const{tt}=clock(1,t0),st=st3,b=ball3(tt),p=proj(st,b.X,b.Y,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R)*1.3,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return aperture(q);},
 still:S3_SAVE+.05,
};

// ================= chapter 3 — REPLAY of the demonstration: slow motion, low BEHIND THE GOAL through the back net: the foot, not the body =================
const C3={again:A(2,'Again'),watch:A(2,'Guitta watches'),body:A(2,'not his'),hips:A(2,'The hips'),sends:A(2,'but the foot'),moving:A(2,'already'),saved:A(2,'Saved'),end:AUTH[2].seconds};
/** replay world: the goal line at Z = 0 (posts X ±1.5), Guitta 0.75 m out facing +Z (his right = screen right); the shooter 5.7 m out,
 * 2.85 m to his right — the same demonstration turned end-on */
const G2:[number,number]=[0,.75],RB2:[number,number]=[SIDE_D,OUT_D];
const SAVE2=gloveAt(G2[0],G2[1],FACE_AWAY);
const FAR2:[number,number]=[-1.3,0],YAW2=yawTo(FAR2[0]-RB2[0],FAR2[1]-RB2[1])-.25;
const SB2=strikeBall(YAW2),PL2:[number,number]=[RB2[0]-SB2[0],RB2[1]-SB2[2]];
/** slow motion: the plant on "not his body", held through "The hips point", contact on "but the foot sends", the palm on "Saved" */
const R_HIT=C3.moving-.7,R_SAVE=Math.max(R_HIT+.9,C3.saved+.05);
const rT=(t:number)=>key(t,[[0,.04],[C3.body,.2],[C3.hips,.28],[C3.sends,.33],[R_HIT-.7,.42],[R_HIT,STRIKE_CONTACT],[R_HIT+1.6,.78],[C3.end,.9]],linear);
const repS:Gen=t=>({pose:strike(rT(t)),yaw:YAW2,X:PL2[0]+key(t,[[0,.4],[C3.body,.06,easeOut],[C3.sends,0]]),Z:PL2[1]+key(t,[[0,.6],[C3.body,.1,easeOut],[C3.sends,0]])});
const repK=keeperGen(G2[0],G2[1],FACE_AWAY,R_HIT-.05,R_SAVE,{up:C3.end-.35});
const OUT2:V3=[2.6,1.3,-.6];
function repBall(t:number):Ball3{
 if(t<R_HIT)return{X:RB2[0],Y:BALL_R,Z:RB2[1],flying:false,spin:0};
 if(t<R_SAVE){const u=sm(R_HIT,R_SAVE,t,linear),q=bez([RB2[0],BALL_R,RB2[1]],[lerp(RB2[0],SAVE2[0],.5),SAVE2[1]*.9+.25,lerp(RB2[1],SAVE2[2],.5)],SAVE2,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:u*6};}
 const u=sm(R_SAVE,R_SAVE+1.4,t,easeOut),q=bez(SAVE2,[lerp(SAVE2[0],OUT2[0],.5),SAVE2[1]+.5,lerp(SAVE2[2],OUT2[2],.5)],OUT2,u);return{X:q[0],Y:q[1],Z:q[2],flying:u<1,spin:6+u*8};
}
const st2:Stage={F:1500,eye:1.3,cx:-.8,cz:-3.3};
/** the back net between us and the play: a sparse navy mesh; posts and bar at Z = 0 print over him */
function backNet(s:Sheet,st:Stage){
 const net=new Path2D(),Zb=-.9;
 for(let X=-3;X<=3.01;X+=.28){const a=proj(st,X,-.2,Zb),b=proj(st,X,2.6,Zb);net.moveTo(a[0],a[1]);net.lineTo(b[0],b[1]);}
 for(let Yh=0;Yh<=2.61;Yh+=.28){const a=proj(st,-3,Yh,Zb),b=proj(st,3,Yh,Zb);net.moveTo(a[0],a[1]);net.lineTo(b[0],b[1]);}
 s.stroke(K,net,2.6,.34);
}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st2,hit=pulse(t,R_HIT,.4),sv=pulse(t,R_SAVE,.6);
  camPath(s,t,[[0,420,80,.9],[C3.watch,440,60,.95],[C3.body,560,40,1.02],[C3.hips,440,90,.94],[C3.sends,520,80,.98],[R_HIT+.3,500,40,.98],[R_SAVE,640,0,1.08],[C3.end,560,30,.98]],[6*hit*Math.sin(t*90),5*sv*Math.cos(t*70)]);
  const b=repBall(tt);
  endArena(s,st,{t:tt,wallZ:41,gz:40,half:20,empty:true,flash:pulse(tt,R_SAVE,1.3)});
  // the goal line and D at our end (under the camera)
  const near=new Path2D(),arcPts:Pt[]=[];for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arcPts.push([-1.5-6*Math.cos(a),6*Math.sin(a)]);}for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arcPts.push([1.5+6*Math.cos(a),6*Math.sin(a)]);}
  near.addPath(polyPath(floorStrip(st,[[-10,0],[10,0]],.05),true));near.addPath(polyPath(floorStrip(st,arcPts,.05),true));near.addPath(polyPath(floorRing(st,0,6,.12,12),true));s.knockout(near,.94);
  const sS=repS(tt),skS=solve(sS.pose,SBUILD,placeAt(sS.X,sS.Z,sS.yaw)),foot=toMine(skS.rToe),fp=proj(st,foot[0],foot[1],foot[2]),chest=toMine(skS.chest),cp=proj(st,chest[0],chest[1],chest[2]),pel=toMine(skS.pelvis),ks=kAt(st,sS.Z);
  const k=repK(tt),skK=solve(k.pose,GBUILD,placeAt(k.X,k.Z,k.yaw)),head=toMine(skK.head),hp=proj(st,head[0],head[1]+.05,head[2]);
  // "Guitta watches the shooter's foot": a red dashed eye-line from his head to the kicking foot, a red ring round the boot
  const look=sm(C3.watch,C3.watch+.5,tt,easeOut)*(1-sm(R_HIT+.3,R_HIT+.7,tt));
  // "not his body": the torso struck out in navy
  const nb=sm(C3.body,C3.body+.4,tt,easeOut)*(1-sm(C3.hips+.6,C3.hips+1,tt));
  // "The hips point one way": a navy dashed arrow on the floor from his hips to the far post; "but the foot sends it the other": a red one to the near post
  const hipsOn=sm(C3.hips,C3.hips+.6,tt,easeOut)*(1-.6*sm(C3.saved,C3.saved+.5,tt)),footOn=sm(C3.sends,C3.sends+.5,tt,easeOut)*(1-.6*sm(C3.saved,C3.saved+.5,tt));
  if(hipsOn>.02){const a=proj(st,pel[0],.02,pel[2]),c=proj(st,FAR2[0]+.1,.02,FAR2[1]+.4),pts:Pt[]=[a,[lerp(a[0],c[0],.5),lerp(a[1],c[1],.5)+12],c];dashed(s,K,pts,11,301,{dash:36,progress:hipsOn});if(hipsOn>.9)arrowHead(s,K,pts,34,302);}
  if(footOn>.02){const a=proj(st,RB2[0],.02,RB2[1]),c=proj(st,1.3,.02,.4),pts:Pt[]=[a,[lerp(a[0],c[0],.5),lerp(a[1],c[1],.5)+14],c];dashed(s,R,pts,13,303,{dash:36,progress:footOn});if(footOn>.9)arrowHead(s,R,pts,38,304);}
  const its:{z:number;draw:()=>void}[]=[
   {z:sS.Z,draw:()=>{athlete(s,st,repS,tt,SHOOTER,{detail:'high',smear:tt>R_HIT-.5&&tt<R_HIT+.3?.3:0});
     if(nb>.02)notThis(s,[cp[0],cp[1]+.05*ks],.42*ks,.5*ks,8,201,nb);
     ring2(s,R,[fp[0],fp[1]-.03*ks],.28*ks,.2*ks,9,203,easeOutBack(sm(C3.watch+.2,C3.watch+.6,tt))*(1-sm(R_HIT+.4,R_HIT+.8,tt)),1);}},
   {z:b.Z,draw:()=>{const{p,r}=ballOn(s,st,b,97,{min:10,dir:Math.atan2(-.2,-1)});if(tt>=R_HIT&&tt<R_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:98,g:easeOut(sm(R_HIT,R_HIT+.3,tt))});}},
   {z:k.Z,draw:()=>{athlete(s,st,repK,tt,GUITTA,{detail:'high',smear:tt>R_HIT&&tt<R_SAVE+.3?.25:0});
     if(tt>=C3.moving&&tt<R_SAVE+.2){const g=proj(st,k.X,1,k.Z);speedLines(s,Y,g[0]-120,g[1],0,{n:5,seed:205,len:180*sm(C3.moving,C3.moving+.3,tt),spread:220,width:8});}}},
  ];
  if(look>.02)dashed(s,R,[hp,[lerp(hp[0],fp[0],.5),lerp(hp[1],fp[1],.5)-30],fp],10,206,{dash:34,progress:look});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=R_SAVE&&tt<R_SAVE+1){const p=proj(st,SAVE2[0],SAVE2[1],SAVE2[2]);sparkBurst(s,Y,p[0],p[1],170,{n:12,seed:207,g:easeOut(sm(R_SAVE,R_SAVE+.3,tt))*(1-sm(R_SAVE+.6,R_SAVE+1,tt))});}
  endPosts(s,st,0);backNet(s,st);
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st2,repK(tt),.2));},
 still:C3.sends+.2,
};

// ================= chapter 4 — PRACTISE: Guitta in a goal, a friend shoots; eyes on the kicking foot, not the body; a quick save; a tick =================
const C4={try:A(3,'Try'),watch:A(3,'Watch'),body:A(3,'not their'),react:A(3,'react'),end:AUTH[3].seconds};
const GZ4=6.2,G4:[number,number]=[0,GZ4-.7];
const SAVE4=gloveAt(G4[0],G4[1],FACE_CAMERA);
const RB4:[number,number]=[1.9,1.4],YAW4=yawTo(-1.2-RB4[0],GZ4-RB4[1])+.2,SB4=strikeBall(YAW4),PL4:[number,number]=[RB4[0]-SB4[0],RB4[1]-SB4[2]];
const F_HIT=C4.react+.1,F_SAVE=F_HIT+.3;
const friend:Gen=t=>{const stT=key(t,[[0,0],[C4.try+.4,.1],[C4.watch,.2],[C4.body+.3,.3],[F_HIT-.2,.4],[F_HIT,STRIKE_CONTACT],[F_HIT+.6,.85],[C4.end,1]],linear);
 let pose=strike(stT);if(t<C4.try+.4)pose=blendPose(runCycle(t*runCadence(.3),{speed:.3}),pose,sm(0,C4.try+.4,t));
 return{pose,yaw:YAW4,X:PL4[0]+key(t,[[0,.6],[C4.try+.4,.1,easeOut],[F_HIT,0]]),Z:PL4[1]+key(t,[[0,-1.6],[C4.try+.4,-.2,easeOut],[F_HIT,0]])};};
const keep4=keeperGen(G4[0],G4[1],FACE_CAMERA,F_HIT-.03,F_SAVE,{up:F_SAVE+1.1});
const OUT4:V3=[-2.7,1.3,GZ4+.4];
function ball4(t:number):Ball3{
 if(t<F_HIT)return{X:RB4[0],Y:BALL_R,Z:RB4[1],flying:false,spin:0};
 if(t<F_SAVE){const u=sm(F_HIT,F_SAVE,t,linear),q=bez([RB4[0],BALL_R,RB4[1]],[lerp(RB4[0],SAVE4[0],.5),SAVE4[1]*.9+.2,lerp(RB4[1],SAVE4[2],.5)],SAVE4,u);return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:u*10};}
 const u=sm(F_SAVE,F_SAVE+.9,t,easeOut),q=bez(SAVE4,[lerp(SAVE4[0],OUT4[0],.5),SAVE4[1]+.5,lerp(SAVE4[2],OUT4[2],.5)],OUT4,u);return{X:q[0],Y:q[1],Z:q[2],flying:u<1,spin:10+u*8};
}
const st4:Stage={F:1500,eye:1.6,cx:.5,cz:-2.4};
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  camPath(s,t,[[0,60,60,.92],[C4.watch,90,40,.98],[C4.body,140,60,1.02],[C4.react,80,30,.96],[F_SAVE+.5,20,20,1.02],[C4.end,40,30,.98]]);
  endArena(s,st,{t:tt,wallZ:GZ4+2.6,gz:GZ4,empty:true,flash:pulse(tt,F_SAVE,1.2)});
  const f=friend(tt),sk=solve(f.pose,{height:1.6,bulk:.95},placeAt(f.X,f.Z,f.yaw)),foot=toMine(sk.rToe),chest=toMine(sk.chest),kf=kAt(st,f.Z);
  const fp=proj(st,foot[0],foot[1],foot[2]),cp=proj(st,chest[0],chest[1],chest[2]);
  const k=keep4(tt),skK=solve(k.pose,GBUILD,placeAt(k.X,k.Z,k.yaw)),head=toMine(skK.head),hp=proj(st,head[0],head[1]+.02,head[2]);
  const look=sm(C4.watch,C4.watch+.5,tt,easeOut)*(1-sm(F_HIT+.1,F_HIT+.4,tt)),nb=sm(C4.body,C4.body+.4,tt,easeOut)*(1-sm(F_HIT,F_HIT+.3,tt));
  endGoalNet(s,st,GZ4);athlete(s,st,keep4,tt,GUITTA,{detail:'high',smear:tt>F_HIT&&tt<F_SAVE+.25?.14:0});endPosts(s,st,GZ4);
  if(tt>=F_SAVE&&tt<F_SAVE+.8){const p=proj(st,SAVE4[0],SAVE4[1],SAVE4[2]);sparkBurst(s,Y,p[0],p[1],120,{n:10,seed:401,g:easeOut(sm(F_SAVE,F_SAVE+.3,tt))*(1-sm(F_SAVE+.5,F_SAVE+.8,tt))});}
  if(look>.02)dashed(s,R,[hp,[lerp(hp[0],fp[0],.5),lerp(hp[1],fp[1],.5)-40],fp],12,402,{dash:38,progress:look});
  const b=ball4(tt),front=b.Z<f.Z;
  if(!front)ballOn(s,st,b,405,{min:10,trail:ball4,t0:F_HIT,t:tt});
  athlete(s,st,friend,tt,FRIEND,{detail:'high',smear:tt>F_HIT-.3&&tt<F_HIT+.2?.2:0});
  if(front)ballOn(s,st,b,405,{min:10,trail:ball4,t0:F_HIT,t:tt});
  if(nb>.02)notThis(s,cp,.4*kf,.46*kf,9,403,nb);
  ring2(s,R,[fp[0],fp[1]-.03*kf],.26*kf,.18*kf,9,404,easeOutBack(sm(C4.watch+.3,C4.watch+.7,tt))*(1-sm(F_HIT+.2,F_HIT+.5,tt)),1);
  // "react quicker": a big red tick stamps beside Guitta, with a navy misregistered echo
  const tick=easeOutBack(sm(F_SAVE+.25,F_SAVE+.6,tt));
  if(tick>.02){const g=proj(st,G4[0],0,G4[1]),h=kAt(st,G4[1])*1.77,c:Pt=[g[0]+h*.7,g[1]-h*.95],S=h*.34*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(R,tp);s.fill(Y,tp,.25);}
 },
 still:C4.body+.4,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'guitta-futsal-signature',format:'futsal',title:'Guitta’s lightning-reflex save',theme:'Watch the shooter’s foot, not their body, and react quicker.',
 ageNote:'For players aged 7–12: the 2019 European final and its 2–1 result are real; the save shows how Guitta did it, not a filmed moment. Practise with a friend and a soft ball.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball flies in, a paper glove (navy rim) pops out and parries it, a red ring snaps; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.25),bx=x-160*(1-u),by=y+40*(1-u),pop=sm(.18,.28,age,easeOutBack)*(1-sm(.5,.75,age));
  if(age>.25){const v=clamp((age-.25)/.5);ring2(s,R,[x,y],r*(1.2+1.6*v),r*(1+1.3*v),8*(1-v)+2,seed,1,1);}
  const off=age>.25?sm(.25,.7,age,easeOut):0;ball(s,bx+off*60,by-off*120,r,seed,{rot:age*6});
  if(pop>.02){const g=blob(x+r*.9,y-r*.2,r*.6*pop,r*.75*pop,seed+3,{n:18});s.knockout(polyPath(g,true));s.fill(K,ribbon(g,6,{seed:seed+4,close:true,wobble:.8}));}
 },
};
export default film;
