/** Chemi — "the low split save": a signature-move riso film (iconic plays, FUTSAL goleiro).
 *
 * WHO: José Miguel Oliver Solano, "Chemi" (born 19 Feb 1996, Puerto de Mazarrón, Murcia), Spain goalkeeper for Jimbee Cartagena since
 * 2020 (card bio + es.wikipedia). Not to be confused with any namesake.
 * WHY THIS MOMENT: Chemi's entry (lib/town/iconicPlays.json) is a signature — the low split save — not one match. The best-documented Chemi
 * save we could reach in writing is in Jimbee Cartagena's FIRST league title: game 4 of the 2023–24 Primera División play-off final, Jimbee
 * Cartagena 5–2 ElPozo Murcia, 23 June 2024, at home in Cartagena's Palacio. The club's match report says, with ten minutes left and Jimbee
 * 2–0 up: "Respondió a la perfección Chemi, parando un disparo a bocajarro de Marlon" (Chemi answered perfectly, stopping a point-blank shot
 * from Marlon). A point-blank futsal shot is exactly when a keeper drops low and makes himself big, so the film recreates that save, and
 * then shows the split itself as a labelled demonstration (the report does NOT say which body shape he used).
 * (Match choice: the other goleiro films use international or Champions League finals — Guitta 2019 UCL final, Plana/Mayor/Pauleta the
 * 2026 Euro final, Luis Amado 2012 Euro final, Mammarella 2014 Euro final — so this film uses a Spanish league final.)
 *  1  LIVE (broadcast camera, main stand, real time): 2–0 on the arena scoreboard, ten minutes left; ElPozo play the ball in to Marlon,
 *     who takes a touch and shoots from point-blank range; Chemi drops low and blocks; the ball bounces away; Jimbee's players clap him.
 *  2  REPLAY (slow motion, REVERSE ANGLE: a low camera on the FAR touchline, beside the goal, looking back at the main stand — a set-up no
 *     other goleiro film uses): he drops, the ball hits him. Then the result: a 5–2 score graphic, confetti — the club's first league title.
 *  3  HOW HE DOES IT (a demonstration in training kit on a wooden training floor, no match claimed; slow motion; LOW FRONT THREE-QUARTER
 *     camera beside the shooter): a close, low shot; he drops one knee, slides the other leg wide along the floor; the ball hits the leg;
 *     the bottom strip of the goal lights up as covered.
 *  4  PRACTISE (lesson from the entry's `lesson`): a BALL'S-EYE camera on the floor facing the goal: the two low corners marked; he drops into
 *     the split, a corner is covered, a quick low ball hits his leg; two cards "knee down" · "leg out"; a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - Jimbee Cartagena club match report "El Jimbee conquista la Liga" (23 June 2024), archived by the Wayback Machine
 *    (jimbee-2024-final-g4.txt): https://web.archive.org/web/2024/https://jimbeecartagena.com/2024/06/23/cronica/
 *    — "El Jimbee es campeón de Liga tras vencer en el cuarto partido de play off al eterno rival, ElPozo Murcia"; "Tapó bien Chemi para no
 *    dejar pasar el cuero de Marlon" (first half); "Respondía Niyazov, que lograba plantarse ante Chemi, pero no superarle. Corría el
 *    veintitrés."; "Marcel dispuso de una ocasión que repelió la madera. Respondió a la perfección Chemi, parando un disparo a bocajarro de
 *    Marlon. Restaban diez para el final."; "El Palacio rugía"; goals 1-0 Bebe (25'), 2-0 Motta (27'), 2-1 Gadeia (35'), 3-1 Motta (40'),
 *    3-2 Tomaz o.g. (40'), 4-2 Waltinho (40'), 5-2 Lucão (40'); starting five "Chemi, Tomaz, Mellado, Lucão y Waltinho"; "El Jimbee levanta su
 *    primer título liguero y ya es equipo de Champions."
 *  - Wikipedia (es), "José Miguel Oliver Solano" (raw, Sep 2026; eswiki-chemi.txt): goalkeeper, Jimbee Cartagena since 14 July 2020; on
 *    23 June 2024 won the Primera División title beating ElPozo Murcia 3–1 in games in the final; Spain debut 10 April 2021.
 *  - Wikipedia (en), "UEFA Futsal Euro 2026 final" (cached): Chemi Oliver, Spain no. 1, Cartagena — the same player, checked, not used here.
 * CONFIRMED: the match (game 4 of the 2023–24 Primera División final), the date, Jimbee Cartagena v ElPozo Murcia at the Palacio in Cartagena
 *  (Jimbee at home), Chemi in Jimbee's starting five, 2–0 to Jimbee at the time (goals 25' and 27', the next at 35'), about ten minutes left,
 *  a point-blank shot from Marlon (ElPozo) stopped by Chemi, the roaring home crowd, the 5–2 final score, Jimbee's first league title.
 * INFERRED (not named in the narration): HOW the save was made (drawn as a low drop with the right leg sliding out, the ball striking his
 *  shin and bouncing away to the near side); where Marlon shot from (about 4 m out, right foot, after a touch) and the pass before it;
 *  every other player's position; which end; kits — Jimbee red shirts / white shorts / red socks, ElPozo white shirts / navy shorts /
 *  white socks, Chemi in a yellow keeper top with long sleeves and navy long legs (the athlete library has no trousers); the scoreboard's
 *  look and place; Chemi's build (1.83 m) and short dark hair. No video was reviewed.
 *  Chapters 3–4 are a coaching demonstration of the split save (training kit, a neutral shooter), not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike and the drop). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library
 * z → −Z. Marlon strikes with the right foot (inferred); the ball's contact point IS the solved point on Chemi's right shin in the split
 * pose, so leg and ball always meet. The reverse angle is the live world turned 180° about the vertical (X → −X, Z → 20 − Z, yaw + π): a
 * rotation, so handedness is kept.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Chemi's top, lights, diagram lines, wood), red (Jimbee, posts, arrows), blue (court, training top), navy (key line, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2024 league final',text:'The 2024 Spanish league final. Jimbee Cartagena lead ElPozo Murcia by two goals, ten minutes left. Marlon shoots from point-blank range. Chemi blocks it!',tail:2.4,
  cues:['The 2024','Jimbee Cartagena','by two goals','ten minutes','Marlon shoots','range','Chemi blocks'],heads:{'The 2024':'League final 2024','by two goals':'2–0','Chemi blocks':'Blocked!'}},
 {label:'Replay: the reverse angle',text:'Watch from the other side. Chemi makes himself big, and the ball hits him. Jimbee won five to two, their first league title!',tail:2.4,
  cues:['Watch from','other side','Chemi makes','ball hits','Jimbee won','five to two','first league'],heads:{'Chemi makes':'Big and low','five to two':'5–2','first league':'Champions!'}},
 {label:'How he does it (demo)',text:'How he does it: on a close, low shot, drop one knee and slide the other leg wide. The bottom of the goal is covered.',tail:2.2,
  cues:['How he does it','close','drop one knee','slide the other','leg wide','The bottom','covered'],heads:{'How he does it':'How he does it','drop one knee':'Knee down','leg wide':'Leg out','covered':'Low corners covered'}},
 {label:'Practise it',text:'Drop into a split to cover the low corners on quick futsal shots. Knee down, leg out!',tail:2.8,
  cues:['Drop into','low corners','quick futsal','Knee down','leg out'],heads:{'low corners':'Low corners','leg out':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/chemi-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/chemi-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/chemi-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('chemi: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('chemi: no cue '+w);return c.at;};
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
const quad3=(a:V3,m:V3,b:V3,u:number):V3=>{const p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*m[0]+r*b[0],p*a[1]+q*m[1]+r*b[1],p*a[2]+q*m[2]+r*b[2]];};
type XZ=[number,number];
const unit=(dx:number,dz:number):XZ=>{const l=Math.hypot(dx,dz)||1;return[dx/l,dz/l];};

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean over the court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a floor line (X,Z points) clipped to the part in front of the camera, added to `into` as painted strips */
function lineOn(into:Path2D,st:Stage,pts:Pt[],hw=.05){
 const zmin=st.cz+.5;let cur:Pt[]=[];const flush=()=>{if(cur.length>1)into.addPath(polyPath(floorStrip(st,cur,hw),true));cur=[];};
 for(let i=0;i<pts.length;i++){const p=pts[i],inP=p[1]>=zmin;
  if(i>0){const q=pts[i-1],inQ=q[1]>=zmin;if(inP!==inQ){const u=(zmin-q[1])/(p[1]-q[1]),c:Pt=[lerp(q[0],p[0],u),zmin];if(inQ){cur.push(c);flush();}else cur.push(c);}}
  if(inP)cur.push(p);}
 flush();
}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.86],[R,.3]];
/** Chemi: a yellow keeper top, long sleeves, navy long legs, white gloves, short dark hair (all inferred; no number drawn) */
const KBUILD={height:1.83,bulk:1.03};
const CHEMI:AthleteStyle={shirt:Y,shorts:K,socks:K,boots:K,skin:SKIN,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:KBUILD,seed:3};
/** the demonstration keeper (chapter 3): the same keeper in a blue training top (no match is claimed) */
const CHEMI_TRAIN:AthleteStyle={...CHEMI,shirt:B,trim:'paper',seed:4};
/** Jimbee Cartagena outfield: red shirts, white shorts, red socks (inferred) */
const JIM=(n:number):AthleteStyle=>({shirt:R,shorts:'paper',socks:R,boots:K,skin:[[Y,.8],[R,.22]],hair:K,line:K,trim:'paper',hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** ElPozo Murcia: white shirts, navy shorts, white socks (inferred); Marlon */
const POZO=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.84],[R,.3]],hair:K,line:K,trim:R,hairStyle:n%2?'short':'curly',build:{height:1.74+hash(n,3)*.1},seed:20+n});
const SBUILD={height:1.78,bulk:1.03};
const MARLON:AthleteStyle={...POZO(1),hairStyle:'short',build:SBUILD,seed:29};
/** the demonstration shooter (chapter 3): a paper training bib over navy */
const DEMO_S:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:SBUILD,seed:77};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact (library coords, place at the origin, turned to yaw) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),SBUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}

// ---------------- the keeper's moves: the set, the side-shuffle, the knee drop, THE LOW SPLIT ----------------
const SET0=keeperSet(0);
/** a side-shuffle step: the stance opens and closes (ph loops), weight low, hands up */
function shuffle(ph:number):Pose{const o=.5+.5*Math.sin(ph*TAU);return{...SET0,lHipA:SET0.lHipA+.24*o,rHipA:SET0.rHipA+.24*(1-o),air:.02*Math.abs(Math.sin(ph*TAU))};}
/** the knee drop (half-way): the LEFT knee goes to the floor, shin flat behind, the right leg still bent and starting to open */
const KNEE=posed({lHipF:8,lHipA:6,lKnee:118,lAnk:42,rHipF:52,rHipA:38,rKnee:78,rAnk:-4,lean:16,pitch:4,bend:6,lShF:34,rShF:30,lShA:44,rShA:50,lElb:34,rElb:30,lShR:10,rShR:10,lHand:1,rHand:1,neckP:6,neckY:-6});
/** THE LOW SPLIT: left knee and shin on the floor, the RIGHT leg straight out sideways along the floor, arms low and wide, eyes on the ball */
const SPLIT=posed({lHipF:6,lHipA:4,lKnee:122,lAnk:44,rHipF:10,rHipA:84,rKnee:4,rAnk:-12,lean:10,pitch:2,bend:14,roll:4,lShF:30,rShF:22,lShA:56,rShA:44,lElb:26,rElb:12,lShR:12,rShR:4,lHand:1,rHand:1,neckP:16,neckY:-16});
/** getting up again after the block */
const RISE=posed({lHipF:30,rHipF:44,lKnee:70,rKnee:60,rHipA:24,lean:22,pitch:4,lShA:30,rShA:30,lShF:30,rShF:30,lElb:40,rElb:40,lHand:1,rHand:1,neckP:-4});
/** a clenched-fist "come on", then a clap */
const FIST=posed({lHipF:14,rHipF:14,lKnee:20,rKnee:20,lean:6,rShF:40,rShA:40,rElb:120,lShA:20,lElb:40,neckP:-10});
const CLAP=(t:number)=>{const o=.5+.5*Math.sin(t*TAU*2.2);return posed({lHipF:12,rHipF:12,lKnee:16,rKnee:16,lean:6,lShF:62,rShF:62,lShA:14+22*o,rShA:14+22*o,lElb:64,rElb:64,lShR:-30,rShR:-30,neckP:-4});};
/** the point on the right shin the ball meets in a split (our coords), a little in front of the leg, never below ball radius */
function shinAt(pose:Pose,X:number,Z:number,yaw:number,u=.62):V3{const sk=solve(pose,KBUILD,placeAt(X,Z,yaw)),kn=toMine(sk.rKn),an=toMine(sk.rAn),f=[Math.cos(yaw),Math.sin(yaw)];
 return[lerp(kn[0],an[0],u)+f[0]*.12,Math.max(BALL_R+.03,lerp(kn[1],an[1],u)+.04),lerp(kn[2],an[2],u)+f[1]*.12];}
/** Marlon's frustration: both hands to his head */
const HANDS_HEAD=posed({lHipF:8,rHipF:8,lKnee:10,rKnee:10,lean:-6,lShF:120,rShF:120,lShA:50,rShA:50,lElb:140,rElb:140,neckP:-22});

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
function ballOn(s:Sheet,st:Stage,X:number,Yh:number,Z:number,seed:number,o:{min?:number;rot?:number;smear?:number;dir?:number}={}){
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15*(1+Yh*.15),r*.3,seed+5,.45/(1+Yh));ball(s,p[0],p[1],r,seed,{rot:o.rot,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces; a home crowd in Jimbee red and white ("El Palacio rugía"); roof lights; cheer lifts heads.
 * empty = a training hall: the rows without people (chapters 3–4). */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,empty=false){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 if(!empty){const heads=new Path2D(),whites=new Path2D(),reds=new Path2D(),yel=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
  for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
    heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.4)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.55)whites.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.6)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
  s.fill(Y,heads,.6);s.knockout(whites);s.fill(R,reds);s.fill(Y,yel);}
 const lights=[new Path2D(),new Path2D(),new Path2D()],off=scroll*kw;for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** boards along a far wall at depth Z (ads, a red rail), then the stands above them */
function farWall(s:Sheet,st:Stage,Z:number,t:number,cheer:number,flash:number,empty=false){
 const span=9000,wall=proj(st,0,0,Z)[1],kw=kAt(st,Z),board=.95*kw;
 s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-14;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,Z)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,Z)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(empty?K:Y,ads,empty?.4:.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx,empty);
}

// ---------------- the score: seven-segment digits (shared by the arena scoreboard and the replay's score graphic) ----------------
const SEG:number[][]=[[1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1],[0,1,1,0,0,1,1],[1,0,1,1,0,1,1]];// a b c d e f g for 0..5
function digit(p:Path2D,x:number,y:number,w:number,h:number,n:number){const t=w*.2,on=SEG[n]||SEG[0],hh=h/2;
 const bars:[number,number,number,number][]=[[x+t,y,w-2*t,t],[x+w-t,y+t*.5,t,hh-t*.5],[x+w-t,y+hh,t,hh-t*.5],[x+t,y+h-t,w-2*t,t],[x,y+hh,t,hh-t*.5],[x,y+t*.5,t,hh-t*.5],[x+t,y+hh-t/2,w-2*t,t]];
 bars.forEach((b,i)=>{if(on[i])p.rect(b[0],b[1],b[2],b[3]);});}
/** a navy score panel at (x,y) w×h: a Jimbee block (red) and an ElPozo block (paper, red rim), yellow digits a–b */
function scorePanel(s:Sheet,x:number,y:number,w:number,h:number,a:number,b:number,flash:number,seed:number){
 const box=polyPath(handCut([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],seed,Math.min(8,w*.01),Math.max(40,w*.2)),true);s.knockout(box);s.fill(K,box,.92);
 s.fill(R,rectPath(x+w*.05,y+h*.22,w*.14,h*.3));
 const pz=rectPath(x+w*.81,y+h*.22,w*.14,h*.3);s.knockout(pz);s.fill(R,ribbon([[x+w*.81,y+h*.22],[x+w*.95,y+h*.22],[x+w*.95,y+h*.52],[x+w*.81,y+h*.52],[x+w*.81,y+h*.22]],Math.max(2,h*.03),{seed:seed+1,taper:0,wobble:.3}));
 const dg=new Path2D(),dw=w*.12,dh=h*.62,dy=y+h*.19;digit(dg,x+w*.3,dy,dw,dh,a);dg.rect(x+w*.47,dy+dh*.45,w*.06,dh*.1);digit(dg,x+w*.58,dy,dw,dh,b);
 s.knockout(dg);s.fill(Y,dg,.75+.25*Math.min(1,flash));
 if(flash>.05)s.fill(Y,ribbon([[x-8,y-8],[x+w+8,y-8],[x+w+8,y+h+8],[x-8,y+h+8],[x-8,y-8]],10*flash,{seed:seed+2,taper:0,wobble:1}),Math.min(1,flash));
}

// ---- the LIVE world (chapters 1–2): the court seen from the main stand; Jimbee's goal (Chemi's) at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5,GC:XZ=[GOAL_X,10];
/** the court floor + lines + far boards/stands + ONE goal at X = gx (its net behind it); any camera that looks along +Z.
 * gx = −20 for the main-stand camera; +20 for the reverse angle (the live world turned 180°). */
function court(s:Sheet,st:Stage,t:number,o:{gx?:number;cheer?:number;flash?:number;board?:()=>void;keeper?:()=>void}={}){
 const{cheer=0,flash=0,gx=GOAL_X}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],sg=gx<0?1:-1;
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const cz=polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true);s.knockout(cz,.25);s.fill(B,cz,.82);
 s.fill(B,polyPath(floorQuad(st,Math.min(gx,gx+sg*6),6,Math.max(gx,gx+sg*6),14),true),.12);
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([gx+sg*6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([gx+sg*6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[gx,0],[gx,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lineOn(lines,st,seg);
 lineOn(lines,st,arc);for(const X of[gx+sg*6,gx+sg*10])if(10>st.cz+1)lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lineOn(lines,st,cc);
 s.knockout(lines,.94);
 farWall(s,st,BOARDS,t,cheer,flash);o.board?.();
 sideGoal(s,st,gx);o.keeper?.();sidePosts(s,st,gx);
}
function sideGoal(s:Sheet,st:Stage,gx:number){
 const H=2,Db=.95,Dt=.55,sg=gx<0?1:-1,back=(Z:number,Yh:number):Pt=>proj(st,gx-sg*lerp(Db,Dt,Yh/H),Yh,Z);
 const hull=[proj(st,gx,0,POST_N),proj(st,gx,H,POST_N),proj(st,gx,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0),back(POST_N,H)];
 const np=polyPath(hull,true);s.knockout(np,.5);s.fill(K,np,.18);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.4)for(const Z of[POST_N,POST_F]){const a=proj(st,gx,Yh,Z),b=back(Z,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,10)*.018),.6);
}
function sidePosts(s:Sheet,st:Stage,gx:number){
 const H=2,w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,10)*.012);
 const quad=(q:Pt[])=>{frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));};
 const post=(Z:number)=>{const P=(Yh:number,dx:number):Pt=>proj(st,gx+dx,Yh,Z);quad([P(0,-w),P(0,w),P(H,w),P(H,-w)]);for(let k=0;k<8;k+=2){const y0=k/8*H,y1=(k+1)/8*H;bands.addPath(polyPath([P(y0,-w),P(y0,w),P(y1,w),P(y1,-w)],true));}};
 // the far post first, the near post last (it is in front)
 post(POST_F);post(POST_N);
 const Bb=(Z:number,dy:number):Pt=>proj(st,gx,H+dy,Z);quad([Bb(POST_N,-w),Bb(POST_F,-w),Bb(POST_F,w),Bb(POST_N,w)]);
 for(let k=0;k<12;k+=2){const z0=lerp(POST_N,POST_F,k/12),z1=lerp(POST_N,POST_F,(k+1)/12);bands.addPath(polyPath([Bb(z0,-w),Bb(z1,-w),Bb(z1,w),Bb(z0,w)],true));}
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
/** the arena scoreboard: hangs above the far stand (look and place inferred); shows 2–0 (confirmed at the time) */
const SB_X=-8.5;
function scoreboard(s:Sheet,st:Stage,flash:number){
 const c=proj(st,SB_X,3.6,BOARDS),k=kAt(st,BOARDS),w=4.4*k,h=1.7*k,x=c[0]-w/2,y=c[1]-h/2;
 if(x>2600||x+w<-2600)return;
 const cab=new Path2D();cab.moveTo(x+w*.2,y);cab.lineTo(x+w*.2,y-3*k);cab.moveTo(x+w*.8,y);cab.lineTo(x+w*.8,y-3*k);s.stroke(K,cab,Math.max(2,k*.04),.8);
 scorePanel(s,x,y,w,h,2,0,flash,91);
}

// ================= chapter 1 — LIVE: 2–0, ten minutes left; the ball in to Marlon; a touch; point-blank; Chemi drops and blocks =================
const C1={start:A(0,'The 2024'),jim:A(0,'Jimbee'),two:A(0,'by two'),ten:A(0,'ten minutes'),marlon:A(0,'Marlon'),range:A(0,'range'),chemi:A(0,'Chemi'),end:AUTH[0].seconds};
/** the play (inferred): ElPozo's far-side wing slides it in to Marlon on the edge of the box → a touch inside → right foot, point-blank, low */
const A0:XZ=[-12.2,16.0],RECV:XZ=[-15.5,12.4],SHOT:XZ=[-16.5,11.3];
const P1=[C1.ten+.1,C1.marlon-.05],TOUCH=[C1.marlon+.25,C1.marlon+.85];
const T_HIT=C1.chemi-.22,T_SAVE=C1.chemi-.04,T_OUT=T_SAVE+.6,T_REST=T_OUT+1.1;
/** where the keeper stands for a ball at p: on the line from the middle of the goal to the ball, about a metre off his line */
const kpos=(p:XZ,d=1.0):XZ=>{const u=unit(p[0]-GC[0],p[1]-GC[1]);return[GC[0]+u[0]*d,GC[1]+u[1]*d];};
const KS=kpos(SHOT),YK=yawTo(SHOT[0]-KS[0],SHOT[1]-KS[1]);
/** the ball meets his right SHIN in the split (solved from the skeleton): his right side is toward the near post */
const SHIN=shinAt(SPLIT,KS[0],KS[1],YK);
/** off the shin: up a little and away to the near side, bouncing toward the near touchline (inferred) */
const DEFL_MID:V3=[SHIN[0]+1.2,.55,SHIN[2]-1.6],DEFL_END:V3=[SHIN[0]+2.6,BALL_R,SHIN[2]-3.4],REST:V3=[SHIN[0]+4.4,BALL_R,SHIN[2]-5.6];
const YAW_SHOT=yawTo(SHIN[0]-SHOT[0],SHIN[2]-SHOT[1]);
const SB=toMine(strikeBall(YAW_SHOT)),PLANT:XZ=[SHOT[0]-SB[0],SHOT[1]-SB[2]];
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 if(T<P1[0]){const w=.08*Math.sin(T*5);return{X:A0[0]-.4+w,Y:BALL_R,Z:A0[1]-.2,flying:false,spin:T*3};}
 if(T<P1[1]){const u=sm(P1[0],P1[1],T,easeOut);return{X:lerp(A0[0]-.4,RECV[0],u),Y:BALL_R,Z:lerp(A0[1]-.2,RECV[1],u),flying:false,spin:u*9};}
 if(T<TOUCH[0])return{X:RECV[0],Y:BALL_R,Z:RECV[1],flying:false,spin:9};
 if(T<T_HIT){const u=sm(TOUCH[0],TOUCH[1],T,easeOut);return{X:lerp(RECV[0],SHOT[0],u),Y:BALL_R,Z:lerp(RECV[1],SHOT[1],u),flying:false,spin:9+u*3};}
 if(T<T_SAVE){const u=sm(T_HIT,T_SAVE,T,linear);return{X:lerp(SHOT[0],SHIN[0],u),Y:lerp(BALL_R,SHIN[1],u),Z:lerp(SHOT[1],SHIN[2],u),flying:true,spin:20+u*20};}
 if(T<T_OUT){const q=quad3(SHIN,DEFL_MID,DEFL_END,sm(T_SAVE,T_OUT,T,linear));return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:40};}
 const u=sm(T_OUT,T_REST,T,easeOut),bo=Math.abs(Math.sin(u*Math.PI*2))*.25*(1-u);return{X:lerp(DEFL_END[0],REST[0],u),Y:BALL_R+bo,Z:lerp(DEFL_END[2],REST[2],u),flying:false,spin:40+u*10};
}
/** Chemi: moves with the pass and the touch, set before the strike, drops into the split (T_SAVE), holds, gets up, a fist, a clap */
const KA=kpos(A0),KR=kpos(RECV),K_SET=T_HIT-.35;
function keeperXZ(T:number):XZ{return[key(T,mono([[0,KA[0]],[P1[0],KA[0]],[P1[1]-.1,KR[0],easeIO],[TOUCH[0],KR[0]],[K_SET,KS[0],easeIO],[T_REST,KS[0]],[C1.end,KS[0]+.3,easeIO]])),
 key(T,mono([[0,KA[1]],[P1[0],KA[1]],[P1[1]-.1,KR[1],easeIO],[TOUCH[0],KR[1]],[K_SET,KS[1],easeIO],[T_REST,KS[1]],[C1.end,KS[1]-.2,easeIO]]))];}
const moving=(T:number)=>(T>P1[0]&&T<P1[1]-.1)||(T>TOUCH[0]&&T<K_SET);
const D0=T_SAVE-.2;
/** the whole save as a pose over live time (shared by the live and the replay) */
function keeperPose(T:number):Pose{
 if(T<D0){const set=T>=K_SET?keeperSet(K_SET*1.2):keeperSet(T*1.2);return moving(T)?blendPose(set,shuffle(T*2.6),.85):set;}
 if(T<T_SAVE+.55)return keyPoses(T,[[D0,keeperSet(K_SET*1.2)],[T_SAVE-.1,KNEE],[T_SAVE,SPLIT],[T_SAVE+.55,SPLIT]]);
 if(T<T_SAVE+1.4)return keyPoses(T,[[T_SAVE+.55,SPLIT],[T_SAVE+1.0,RISE],[T_SAVE+1.4,stand()]]);
 return stand();
}
const liveK:Gen=T=>{const[X,Z]=keeperXZ(T),bb=liveBall(Math.min(T,T_HIT));let yaw=T<T_SAVE?yawTo(bb.X-X,bb.Z-Z):YK;let pose=keeperPose(T);
 const cel=T_SAVE+1.45;if(T>cel){pose=blendPose(stand(),FIST,sm(cel,cel+.3,T,easeOutBack));pose=blendPose(pose,CLAP(T),sm(cel+1.0,cel+1.3,T));yaw=lerp(YK,FACE_CAMERA+.9,sm(cel,cel+.6,T,easeIO));}
 return{pose,yaw,X,Z};};
/** Marlon (ElPozo): drifts in → opens to receive → a touch inside → right-foot strike → both hands to his head */
const S_T0=T_HIT-.55;
const liveMa:Gen=T=>{
 const stT=key(T,[[S_T0,.12],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,1]],linear);
 const X=key(T,mono([[0,-13.4],[P1[0],-13.9,easeIO],[P1[1],RECV[0]+.5,easeIO],[TOUCH[1],PLANT[0]+.3,easeIO],[T_HIT,PLANT[0],easeOut],[T_HIT+.5,PLANT[0]-.25,easeOut],[C1.end,PLANT[0]+.5,easeIO]]));
 const Z=key(T,mono([[0,13.8],[P1[0],13.2,easeIO],[P1[1],RECV[1]+.25,easeIO],[TOUCH[1],PLANT[1]+.2,easeIO],[T_HIT,PLANT[1],easeOut],[T_HIT+.5,PLANT[1]-.2,easeOut],[C1.end,PLANT[1]+.3,easeIO]]));
 let pose:Pose,yaw=yawTo(A0[0]-X,A0[1]-Z);
 if(T<P1[1]-.3)pose=blendPose(runCycle(T*runCadence(.3),{speed:.3}),stand(),.3+.6*sm(P1[0],P1[1]-.3,T));
 else if(T<S_T0){pose=blendPose(dribble((T-P1[1])*1.4,{foot:'r',speed:.25}),posed({lHipF:26,lKnee:30,rKnee:24,lean:12,neckP:22,lShA:36,rShA:30,lElb:40,rElb:40}),sm(TOUCH[1],S_T0,T));yaw=lerp(yawTo(A0[0]-RECV[0],A0[1]-RECV[1]),YAW_SHOT,sm(P1[1]-.1,TOUCH[1],T));}
 else if(T<T_SAVE+.5){pose=strike(stT,{foot:'r'});yaw=YAW_SHOT;}
 else{pose=blendPose(strike(1,{foot:'r'}),HANDS_HEAD,sm(T_SAVE+.5,T_SAVE+1,T,easeIO));yaw=YAW_SHOT;}
 return{pose,yaw,X,Z};};
/** the rest of ElPozo (white): the far-side wing (the pass), a pivot on the near post, one at the top */
const POZO_POS:XZ[]=[A0,[-17.0,6.2],[-9.6,7.6]];
const livePozo=(i:number):Gen=>T=>{
 if(i===0){const kick=pulse(T,P1[0]-.08,.3),X=key(T,[[0,A0[0]],[P1[0],A0[0]],[C1.end,-13.8,easeIO]]),Z=key(T,[[0,A0[1]],[P1[0],A0[1]],[C1.end,14.6,easeIO]]);
  let pose=T<P1[0]?dribble(T*1.3,{foot:'r',speed:.15}):blendPose(runCycle(T*runCadence(.3),{speed:.3}),stand(),sm(C1.end-1.5,C1.end,T));pose=blendPose(pose,posed({lHipF:-10,rHipF:44,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2));
  if(T>T_SAVE+.3)pose=blendPose(pose,HANDS_HEAD,.55*sm(T_SAVE+.3,T_SAVE+.8,T));
  return{pose,yaw:T<P1[0]+.3?yawTo(RECV[0]-A0[0],RECV[1]-A0[1]):yawTo(-1,-.4),X,Z};}
 const[x0,z0]=POZO_POS[i];return{pose:blendPose(backpedal(T*1.1+i*.3),stand(),.5),yaw:i===1?FACE_RIGHT+.4:yawTo(-1,.2),X:x0+.3*Math.sin(T*.8+i),Z:z0+.4*sm(P1[0],T_HIT,T)*(i===1?1:-1)};};
/** Jimbee (red): a compact four that slide with the ball; the man on Marlon lunges too late; after the save they clap their keeper */
type Mark={x:number[];z:number[];ph:number};
const JIMBEE:Mark[]=[{x:[-13.0,-13.4,-13.6],z:[14.8,14.2,13.0],ph:.1},{x:[-14.0,-15.0,-15.3],z:[12.2,12.0,12.3],ph:.4},{x:[-17.2,-17.4,-17.3],z:[6.8,6.4,6.6],ph:.7},{x:[-10.6,-10.9,-11.2],z:[8.0,8.2,8.6],ph:.2}];
const jimAt=(m:Mark,T:number):XZ=>{const u1=sm(P1[0],P1[1]+.3,T),u2=sm(TOUCH[0],TOUCH[1]+.3,T);return[lerp(lerp(m.x[0],m.x[1],u1),m.x[2],u2),lerp(lerp(m.z[0],m.z[1],u1),m.z[2],u2)];};
const liveJim=(i:number):Gen=>T=>{const m=JIMBEE[i],[X,Z]=jimAt(m,T),post=sm(T_SAVE+1.2,T_SAVE+1.8,T);let pose=backpedal(T*1.4+m.ph);
 if(i===1){const lu=key(T,[[T_HIT-.3,0],[T_HIT+.1,.6],[T_HIT+.6,1]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_HIT-.4,T_HIT-.25,T));}
 pose=blendPose(pose,CLAP(T+i*.2),post);
 const face=i===1?yawTo(SHOT[0]-X,SHOT[1]-Z):yawTo(liveBall(T).X-X,liveBall(T).Z-Z);
 return{pose,yaw:lerp(face,yawTo(KS[0]-X,KS[1]-Z),post),X,Z};};
const liveCam=(T:number)=>({x:key(T,mono([[0,-9.2],[C1.two,-9.6],[C1.ten,-12.2],[P1[1],-14.2],[TOUCH[1],-16.0],[T_HIT,-17.9],[T_SAVE+.3,-18.5],[T_REST,-18.2],[C1.end,-17.6]]),easeInOutSine),
 zoom:key(T,mono([[0,.66],[C1.two,.7],[C1.ten,.68],[P1[1],.74],[T_HIT,1.02],[T_SAVE+.4,1.16],[T_SAVE+1.6,1.06],[C1.end,.92]]),easeInOutSine),
 y:key(T,mono([[0,900],[C1.two,905],[C1.ten,1010],[T_HIT,1045],[C1.end,1040]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st:Stage={F:4500,eye:6,cx:c.x,cz:-13},hit=pulse(Tc,T_SAVE,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T);
 court(s,st,T,{cheer:T>=T_SAVE?.9*(1-.4*sm(C1.end-1.2,C1.end,T)):.12+.5*pulse(T,C1.jim,1.4),flash:.6*pulse(T,T_SAVE,1.2),
  board:()=>scoreboard(s,st,pulse(T,C1.two,1.6)),
  keeper:()=>{if(b.X<GOAL_X){const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.4);ball(s,p[0],p[1],r,18,{rot:b.spin});}}});
 // "Marlon shoots": a yellow ring under Marlon as the ball comes to him
 const ma=liveMa(T),ring=sm(C1.marlon,C1.marlon+.3,T,easeOut)*(1-sm(T_HIT,T_HIT+.3,T));
 if(ring>.02)floorDashRing(s,st,Y,ma.X,ma.Z,.7,9,51,easeOutBack(ring));
 type It={z:number;draw:()=>void};const items:It[]=[];
 JIMBEE.forEach((_,i)=>{const g=liveJim(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,JIM(i),{detail:'low'})});});
 POZO_POS.forEach((_,i)=>{const g=livePozo(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,POZO(i+2),{detail:'low'})});});
 items.push({z:ma.Z,draw:()=>athlete(s,st,liveMa,T,MARLON,{smear:T>T_HIT-.2&&T<T_HIT+.2?.1:0})});
 items.push({z:liveK(T).Z,draw:()=>athlete(s,st,liveK,T,CHEMI,{smear:T>D0&&T<T_SAVE+.2?.1:0})});
 if(b.X>=GOAL_X)items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R),q=liveBall(T-.05),pq=proj(st,q.X,q.Y,q.Z);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45/(1+b.Y));
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.45:0,dir:Math.atan2(p[1]-pq[1],p[0]-pq[0])});
  if(T>=T_SAVE&&T<T_SAVE+.35)sparkBurst(s,Y,p[0],p[1],r*3.2,{n:10,seed:19,g:easeOut(sm(T_SAVE,T_SAVE+.25,T))});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** Chemi's chest (the passage enters his yellow top) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,KBUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts({F:4500,eye:6,cx:liveCam(tc).x,cz:-13},liveK(tt),.12));},still:T_SAVE+.1};

// ================= chapter 2 — REPLAY: the REVERSE ANGLE (low, far touchline, beside the goal), slow motion; then 5–2, the first title =================
const C2={watch:A(1,'Watch'),other:A(1,'other side'),chemi:A(1,'Chemi'),hits:A(1,'ball hits'),won:A(1,'Jimbee won'),five:A(1,'five to'),first:A(1,'first league'),end:AUTH[1].seconds};
/** the live world turned 180° about the vertical: X → −X, Z → 20 − Z, yaw + π (a rotation: handedness kept) */
const MIR=(g:Gen):Gen=>T=>{const a=g(T);return{pose:a.pose,yaw:a.yaw+Math.PI,X:-a.X,Z:TOUCH_FAR-a.Z};};
const mBall=(T:number)=>{const b=liveBall(T);return{...b,X:-b.X,Z:TOUCH_FAR-b.Z};};
const mK=MIR(liveK),mMa=MIR(liveMa),mJim1=MIR(liveJim(1));
/** replay clock → live time: slow from Marlon's touch, SUPER slow through the drop and the block, then back to real time */
const R0=TOUCH[0]+.1;
const rLive=(t:number)=>key(t,mono([[0,R0],[C2.chemi,D0-.02,linear],[C2.hits+.1,T_SAVE,linear],[C2.won-.2,T_SAVE+.45,linear],[C2.end,T_SAVE+.45+(C2.end-C2.won+.2)*.6,linear]]),linear);
/** the reverse-angle camera: low (1.5 m, a long lens) on the far touchline, a few metres out from the goal line, looking back at the main stand */
const st2=(t:number):Stage=>({F:2200-500*sm(C2.won-.3,C2.won+.9,t,easeIO),eye:1.5+.6*sm(C2.won-.3,C2.won+.9,t,easeIO),cx:16.2,cz:-.6});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),T=rLive(tt),st=st2(tt),hit=pulse(t,C2.hits+.1,.45);
  const kp=mK(T),kg=proj(st,kp.X,0,kp.Z),kx=kg[0];
  camPath(s,t,[[0,kx-330,-40,1.0],[C2.other,kx-300,-30,1.04],[C2.chemi,kx-170,10,1.18],[C2.hits-.2,kx-110,30,1.28],[C2.hits+.6,kx-140,20,1.2],[C2.won,kx-200,-20,1.0],[C2.end,kx-210,-30,.96]],[7*hit*Math.sin(t*90),5*hit*Math.cos(t*77)]);
  const b=mBall(T),cheer=sm(C2.won,C2.won+.6,tt);
  court(s,st,tt,{gx:-GOAL_X,cheer:.2+.8*cheer,flash:.8*pulse(tt,C2.first,1.4),keeper:()=>{if(b.X>-GOAL_X)ballOn(s,st,b.X,b.Y,b.Z,97,{rot:b.spin*.4});}});
  // "other side": the shooter picked out with a yellow ring; "Chemi makes himself big": a yellow halo that SPREADS low and wide as he drops
  const ma=mMa(T),ring=sm(C2.other,C2.other+.3,tt,easeOut)*(1-sm(C2.chemi,C2.chemi+.4,tt));
  if(ring>.02)floorDashRing(s,st,Y,ma.X,ma.Z,.6,9,201,easeOutBack(ring));
  const halo=sm(C2.chemi,C2.chemi+.4,tt,easeOut)*(1-sm(C2.won-.3,C2.won+.1,tt)),kk=kAt(st,kp.Z),drop=sm(D0,T_SAVE,T);
  if(halo>.02){const hh=kk*lerp(1.0,.55,drop),hw=kk*lerp(.5,1.15,drop),cy=kg[1]-hh*.85;s.fill(Y,ribbon(blob(kg[0]-hw*.15*drop,cy,hw*halo,hh*halo,202,{n:26}),8,{seed:203,close:true,wobble:1}),.9);}
  // "the ball hits him": the flight line from the strike into his shin, then the bounce away
  if(T>T_HIT){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=mBall(lerp(T_HIT,Math.min(T,T_OUT+.2),k/14));pts.push(proj(st,q.X,q.Y,q.Z));}const fade=1-sm(C2.won,C2.won+.4,tt);if(fade>.02){dashed(s,Y,pts,10,205,{dash:40,cov:fade});if(T>T_SAVE+.2)arrowHead(s,Y,pts,30,fade);}}
  type It={z:number;draw:()=>void};const items:It[]=[];
  items.push({z:mJim1(T).Z,draw:()=>athlete(s,st,mJim1,T,JIM(1),{detail:'mid'})});
  items.push({z:ma.Z,draw:()=>athlete(s,st,mMa,T,MARLON,{detail:'mid',smear:T>T_HIT-.2&&T<T_HIT+.2?.08:0})});
  items.push({z:kp.Z,draw:()=>athlete(s,st,mK,T,CHEMI,{detail:'high',smear:T>D0&&T<T_SAVE+.25?.06:0})});
  if(b.X<=-GOAL_X)items.push({z:b.Z-.05,draw:()=>{const r=ballOn(s,st,b.X,b.Y,b.Z,97,{min:10,rot:b.spin*.4,smear:b.flying?.3:0,dir:T<T_SAVE?Math.PI*.1:Math.PI*.9});
   if(T>=T_SAVE&&T<T_SAVE+.3)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3,{n:11,seed:98,g:easeOut(sm(T_SAVE,T_SAVE+.25,T))});}});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "Jimbee won": red, white and yellow confetti over the main stand
  if(tt>=C2.won){const u=sm(C2.won,C2.won+2.5,tt,linear),top=proj(st,0,4,BOARDS)[1];confetti(s,[R,Y,'paper'],[kx-1000,top-300+u*420,2000,420],28,Math.floor(tt*6),{size:15});}
  // "five to two": the full-time score graphic drops in (box coordinates: the camera re-centred on the composition box)
  const card=easeOutBack(sm(C2.five-.1,C2.five+.3,tt));
  if(card>.02){cam(s,0,0,1);const w=440,h=170,x=-w/2,y=-500+(1-card)*-300;scorePanel(s,x,y,w,h,5,2,pulse(tt,C2.five,1)+pulse(tt,C2.first,1.2),211);
   // "first league title": a yellow star on the card
   const st8=easeOutBack(sm(C2.first,C2.first+.35,tt));if(st8>.02){const cx=x+w+46,cy=y+h/2,q:Pt[]=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*TAU,rr=(i%2?26:62)*st8;q.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}const sp=polyPath(q,true);s.knockout(sp);s.fill(Y,sp);s.fill(K,ribbon([...q,q[0]],6,{seed:212,close:true,wobble:.6}),.9);}}
 },
 aperture(t0){const{tt}=clock(1,t0),T=rLive(tt),st=st2(tt),a=mK(T);return aperture(chestPts(st,a,.12));},
 still:C2.hits+.2,
};

// ================= chapter 3 — HOW HE DOES IT (demonstration, training kit, wooden training floor; low front three-quarter camera) =================
const C3={how:A(2,'How'),close:A(2,'close'),drop:A(2,'drop one'),slide:A(2,'slide'),wide:A(2,'leg wide'),bottom:A(2,'The bottom'),covered:A(2,'covered'),end:AUTH[2].seconds};
/** demo world: goal line Z = GZ3 (posts X = ±1.5), the camera in front of the goal, low, beside the shooter (slightly to the right) */
const GZ3=7;
const st3:Stage={F:1500,eye:1.25,cx:.6,cz:-2.2};
/** the keeper a metre off his line facing the camera; his right side is on OUR left, so the low shot goes to our left */
const K3:XZ=[0,GZ3-1.0],Y3=FACE_CAMERA;
const SHIN3=shinAt(SPLIT,K3[0],K3[1],Y3);
/** the shooter's ball spot (4 m out, a little to our right) */
const SP3:XZ=[1.9,GZ3-4.5];
const T3_HIT=C3.close+.1,T3_IN=C3.wide+.15,T3_OUT=T3_IN+.8;
const Y3S=yawTo(SHIN3[0]-SP3[0],SHIN3[2]-SP3[1]),SB3=toMine(strikeBall(Y3S)),PL3:XZ=[SP3[0]-SB3[0],SP3[1]-SB3[2]];
/** the ball: at the spot → struck at "close" → SLOW MOTION to his shin on "leg wide" → bounces away to our left */
function demoBall(t:number):{X:number;Y:number;Z:number;flying:boolean}{
 if(t<T3_HIT)return{X:SP3[0],Y:BALL_R,Z:SP3[1],flying:false};
 if(t<T3_IN){const u=sm(T3_HIT,T3_IN,t,linear);return{X:lerp(SP3[0],SHIN3[0],u),Y:lerp(BALL_R,SHIN3[1],u),Z:lerp(SP3[1],SHIN3[2],u),flying:true};}
 const u=sm(T3_IN,T3_OUT,t,easeOut),q=quad3(SHIN3,[SHIN3[0]-1.0,.6,SHIN3[2]-1.2],[SHIN3[0]-2.6,BALL_R,SHIN3[2]-2.4],u);return{X:q[0],Y:q[1],Z:q[2],flying:u<.9};
}
/** the keeper: set → knee down on "drop one knee" → right leg slides out on "slide the other" → full split at the contact → holds */
const demoK:Gen=t=>{const pose=t<C3.drop-.05?keeperSet(t*1.2):keyPoses(t,[[C3.drop-.05,keeperSet((C3.drop-.05)*1.2)],[C3.drop+.45,KNEE],[C3.slide+.1,KNEE],[T3_IN-.05,SPLIT],[C3.end,SPLIT]]);return{pose,yaw:Y3,X:K3[0],Z:K3[1]};};
/** the shooter (paper training bib): steps in, right-foot strike, watches */
const demoS:Gen=t=>{const stT=key(t,[[T3_HIT-.6,.1],[T3_HIT,STRIKE_CONTACT],[T3_HIT+.7,1]],linear);let pose=t<T3_HIT-.6?blendPose(stand(),dribble(t*.6,{foot:'r',speed:.1}),.4):strike(stT,{foot:'r'});pose=blendPose(pose,stand(),sm(T3_HIT+.8,T3_HIT+1.5,t,easeIO));
 return{pose,yaw:Y3S,X:PL3[0]+.35*sm(T3_HIT+.8,T3_HIT+1.5,t,easeIO),Z:PL3[1]};};
/** the wooden training floor (yellow + a red screen, board seams), goal line and D, an EMPTY hall behind */
function woodCourt(s:Sheet,st:Stage,GZ:number,t:number){
 const span=9000,wallZ=GZ+3.2,wall=proj(st,0,0,wallZ)[1];
 s.fill(Y,rectPath(-span,wall,span*2,span),.42);s.fill(R,rectPath(-span,wall,span*2,span),.14);
 const seams=new Path2D();for(let X=-12;X<=12;X+=.9)lineOn(seams,st,[[X,st.cz+.6],[X,wallZ]],.012);s.fill(R,seams,.35);
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([-1.5-6*Math.cos(a),GZ-6*Math.sin(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([1.5+6*Math.cos(a),GZ-6*Math.sin(a)]);}
 lineOn(lines,st,[[-12,GZ],[12,GZ]]);lineOn(lines,st,arc);s.knockout(lines,.95);s.fill(K,lines,.12);
 farWall(s,st,wallZ,t,0,0,true);
}
/** the goal from the front (net behind it), red-banded frame; `glow` lights the bottom strip (the part a split covers) */
function goalFront(s:Sheet,st:Stage,GZ:number,glow=0){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H));
 const out=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 const mesh=new Path2D();for(let X=Lx;X<=Rx+1e-6;X+=.3){const a=back(X,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(Lx,Yh);mesh.moveTo(a[0],a[1]);for(let X=Lx+.3;X<=Rx+1e-6;X+=.3){const b=back(X,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.6,kAt(st,GZ)*.018),.6);
 if(glow>.02){const qq=[proj(st,Lx,0,GZ+.02),proj(st,Rx,0,GZ+.02),proj(st,Rx,.55*glow,GZ+.02),proj(st,Lx,.55*glow,GZ+.02)],q=polyPath(qq,true);s.knockout(q,.5*glow);s.fill(Y,q,.85*glow);s.fill(R,ribbon([...qq,qq[0]],Math.max(4,kAt(st,GZ)*.03),{seed:311,taper:0,wobble:1,gaps:dashGaps(qq,kAt(st,GZ)*.14)}),glow);}
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D();
 const bar=(a:[number,number],b:[number,number],steps:number)=>{const P=(X:number,Yh:number,dx:number,dy:number)=>proj(st,X+dx,Yh+dy,GZ);const vert=a[0]===b[0];
  const q=vert?[P(a[0],a[1],-w,0),P(a[0],a[1],w,0),P(b[0],b[1],w,w),P(b[0],b[1],-w,w)]:[P(a[0],a[1],-w,w),P(b[0],b[1],w,w),P(b[0],b[1],w,-w),P(a[0],a[1],-w,-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],Math.max(2,kAt(st,GZ)*.012),{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,X0=lerp(a[0],b[0],u0),Y0=lerp(a[1],b[1],u0),X1=lerp(a[0],b[0],u1),Y1=lerp(a[1],b[1],u1);bands.addPath(polyPath(vert?[P(X0,Y0,-w,0),P(X0,Y0,w,0),P(X1,Y1,w,0),P(X1,Y1,-w,0)]:[P(X0,Y0,0,w),P(X1,Y1,0,w),P(X1,Y1,0,-w),P(X0,Y0,0,-w)],true));}};
 bar([Lx,0],[Lx,H],8);bar([Rx,0],[Rx,H],8);bar([Lx,H],[Rx,H],12);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
/** a tick (navy misregistered echo, blue core) at c, size S */
function tick(s:Sheet,c:Pt,S:number,seed:number){const tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed,taper:.2,wobble:1}),.5);s.fill(B,ribbon(tk,S*.24,{seed:seed+2,taper:.2,wobble:1}));}
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,hit=pulse(t,T3_IN,.4);
  camPath(s,t,[[0,0,40,1.0],[C3.close,-20,60,1.04],[C3.drop,-120,120,1.3],[C3.slide,-170,140,1.4],[C3.wide,-190,140,1.42],[C3.bottom,-120,90,1.26],[C3.end,-110,80,1.22]],[5*hit*Math.sin(t*90),4*hit*Math.cos(t*70)]);
  woodCourt(s,st,GZ3,tt);
  const glow=sm(C3.bottom,C3.bottom+.5,tt,easeOut);
  goalFront(s,st,GZ3,glow);
  const k=demoK(tt),b=demoBall(tt);
  // "drop one knee": a red dashed ring stamps where the knee lands; "slide the other": a red arrow along the floor to where the boot goes
  const sk=solve(k.pose,KBUILD,placeAt(k.X,k.Z,k.yaw)),kn=toMine(sk.lKn);
  floorDashRing(s,st,R,kn[0],kn[2],.26,7,301,easeOutBack(sm(C3.drop+.3,C3.drop+.6,tt))*(1-sm(C3.bottom,C3.bottom+.4,tt)));
  const arr=sm(C3.slide-.1,C3.slide+.4,tt,easeOut)*(1-sm(C3.bottom,C3.bottom+.4,tt));
  if(arr>.02){const fin=toMine(solve(SPLIT,KBUILD,placeAt(K3[0],K3[1],Y3)).rAn),a0:Pt=proj(st,K3[0]-.25,0,K3[1]),a1:Pt=proj(st,fin[0]-.1,0,fin[2]);const pts=[a0,L2(a0,a1,.5),a1];dashed(s,R,pts,9,302,{progress:arr,dash:26});if(arr>.8)arrowHead(s,R,pts,26);}
  // the ball's slow flight line
  if(tt>T3_HIT){const pts:Pt[]=[];for(let q=0;q<=10;q++){const bb=demoBall(lerp(T3_HIT,Math.min(tt,T3_IN),q/10));pts.push(proj(st,bb.X,bb.Y,bb.Z));}dashed(s,Y,pts,9,303,{dash:30,cov:1-sm(C3.bottom,C3.bottom+.5,tt)});}
  const items:{z:number;draw:()=>void}[]=[
   {z:k.Z,draw:()=>athlete(s,st,demoK,tt,CHEMI_TRAIN,{detail:'high',smear:tt>C3.drop&&tt<T3_IN+.1?.08:0})},
   {z:b.Z,draw:()=>{const r=ballOn(s,st,b.X,b.Y,b.Z,304,{min:10,rot:tt*3,smear:b.flying?.25:0,dir:Math.PI*.8});if(tt>=T3_IN&&tt<T3_IN+.4)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3,{n:10,seed:305,g:easeOut(sm(T3_IN,T3_IN+.25,tt))});}},
   {z:demoS(tt).Z,draw:()=>athlete(s,st,demoS,tt,DEMO_S,{detail:'mid',smear:tt>T3_HIT-.2&&tt<T3_HIT+.2?.1:0})},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "covered": a tick beside the goal
  const tk=easeOutBack(sm(C3.covered,C3.covered+.35,tt));
  if(tk>.02){const g=proj(st,-2.3,1.2,GZ3),S=kAt(st,GZ3)*.55*tk;tick(s,g,S,309);}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoK(tt),.13));},
 still:T3_IN+.1,
};

// ================= chapter 4 — PRACTISE: a ball's-eye camera on the floor; the low corners; the split covers them; two cards; a tick =================
const C4={drop:A(3,'Drop'),corners:A(3,'low corners'),quick:A(3,'quick'),knee:A(3,'Knee'),out:A(3,'leg out'),end:AUTH[3].seconds};
const GZ4=5.6;
const st4:Stage={F:1700,eye:.45,cx:0,cz:-1.2};
const K4:XZ=[0,GZ4-.9];
/** the split to his right (our left) on "Drop into"; a quick low ball into the leg on "quick futsal"; he holds the split */
const practiceK:Gen=t=>{const pose=t<C4.drop?keeperSet(t*1.2):keyPoses(t,[[C4.drop,keeperSet(C4.drop*1.2)],[C4.drop+.3,KNEE],[C4.drop+.55,SPLIT],[C4.end,SPLIT]]);return{pose,yaw:FACE_CAMERA,X:K4[0],Z:K4[1]};};
const SHIN4=shinAt(SPLIT,K4[0],K4[1],FACE_CAMERA);
const T4_IN=C4.quick+.45,T4_0=T4_IN-.35;
/** the two low-corner triangles on the goal face (X from the post inward, up to .6 m) */
function cornerTri(st:Stage,side:number,g:number):Pt[]{const px=side*1.5,ix=side*(1.5-1.0*g);return[proj(st,px,0,GZ4),proj(st,ix,0,GZ4),proj(st,px,.6*g,GZ4)];}
const CARD_Y=-330,CARD_W=120,CARDS:[number,number,'knee'|'out'][]=[[-560,C4.knee,'knee'],[560,C4.out,'out']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,hit=pulse(t,T4_IN,.4);
  camPath(s,t,[[0,0,-60,1.02],[C4.corners,0,-50,1.0],[C4.quick,0,-50,1.0],[C4.knee,0,-60,.98],[C4.end,0,-60,1.0]],[5*hit*Math.sin(t*90),4*hit*Math.cos(t*70)]);
  woodCourt(s,st,GZ4,tt);
  goalFront(s,st,GZ4,0);
  // the low corners: yellow triangles on "low corners"; the one his leg covers turns red (covered) once he is down
  const cg=easeOutBack(sm(C4.corners,C4.corners+.35,tt)),cov=sm(C4.drop+.5,C4.drop+.8,tt);
  if(cg>.02)for(const side of[-1,1]){const p=polyPath(cornerTri(st,side,cg),true);s.knockout(p,.5);s.fill(side<0&&cov>.5?R:Y,p,.85);}
  const kp=practiceK(tt);
  athlete(s,st,practiceK,tt,CHEMI,{detail:'high',smear:tt>C4.drop&&tt<C4.drop+.6?.06:0});
  // "quick futsal shots": a ball zips in low from the camera into his shin, then drops dead in front of him
  if(tt>T4_0){const u=sm(T4_0,T4_IN,tt,linear),back=sm(T4_IN,T4_IN+.6,tt,easeOut),X=tt<T4_IN?lerp(-.3,SHIN4[0],u):lerp(SHIN4[0],SHIN4[0]+.25,back),Z=tt<T4_IN?lerp(1.2,SHIN4[2],u):lerp(SHIN4[2],SHIN4[2]-.9,back),Yh=tt<T4_IN?lerp(BALL_R,SHIN4[1],u):BALL_R+Math.abs(Math.sin(back*Math.PI*2))*.12*(1-back);
   const r=ballOn(s,st,X,Yh,Z,407,{min:12,rot:tt*6,smear:tt<T4_IN?.4:0,dir:-Math.PI*.4});
   if(tt>=T4_IN&&tt<T4_IN+.4)sparkBurst(s,Y,r.p[0],r.p[1],r.r*3,{n:10,seed:408,g:easeOut(sm(T4_IN,T4_IN+.25,tt))});}
  // the two cards: knee down · leg out
  const cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];const ons=CARDS.map(([,t0c])=>sm(t0c-.1,t0c+.3,tt,easeOut));
  CARDS.forEach(([cx],i)=>{if(ons[i]<=.01)return;const dy=(1-ons[i])*-500;const q=handCut([[cx-CARD_W,CARD_Y-125+dy],[cx+CARD_W,CARD_Y-125+dy],[cx+CARD_W,CARD_Y+125+dy],[cx-CARD_W,CARD_Y+125+dy]],70+i,6,60);outline[i]=q;cards.addPath(polyPath(q,true));frames.addPath(ribbon(q,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
  if(ons.some(o=>o>.01)){s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,,kind],i)=>{if(ons[i]<=.01)return;const dy=(1-ons[i])*-500,gy=CARD_Y+dy+92;
    const fc=figureCam({x:cx,y:gy,height:205,azimuth:90,elevation:12,fov:18});
    s.save();s.clip(polyPath(outline[i],true));
    const pose=kind==='knee'?KNEE:SPLIT,sk=solve(pose,KBUILD,{});
    const P=(j:V3):Pt=>{const q=fc.project(j);return[q[0],q[1]];};
    if(kind==='knee'){const c=P(sk.lKn);floorPrint(s,c,301);}
    if(kind==='out'){const a0=P([sk.rHip[0],.02,sk.rHip[2]]),a1=P([sk.rToe[0],.02,sk.rToe[2]+.25]);const pts:Pt[]=[a0,L2(a0,a1,.5),a1];dashed(s,R,pts,7,85,{dash:18});arrowHead(s,R,pts,20);}
    drawAthlete(s,pose,fc,{...CHEMI,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "leg out": a big tick beside him
  const tk=easeOutBack(sm(C4.out+.4,C4.out+.75,tt));
  if(tk>.02){const g=proj(st,kp.X+1.9,1.0,kp.Z),S=kAt(st,kp.Z)*.5*tk;tick(s,g,S,409);}
 },
 still:C4.out+.6,
};
/** a red knee mark on the floor (in a card) */
function floorPrint(s:Sheet,c:Pt,seed:number){const p=polyPath(blob(c[0],c[1]+6,26,10,seed,{n:14}),true);s.knockout(p);s.fill(R,p,.85);}

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'chemi-futsal-signature',format:'futsal',title:'Chemi’s low split save',theme:'Drop low and wide: your leg covers the bottom of the goal.',
 ageNote:'For players aged 7–12: the point-blank save in the 2024 Spanish league final is real; the split is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in low and stops dead against a sliding navy boot sole; a yellow ring rings out. Reduced motion = at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.28),bx=lerp(x+170,x,easeOut(u)),stop=clamp((age-.28)/.5);
  if(age>.28&&stop<1)s.fill(Y,ribbon(blob(x,y,r*(1.2+1.6*stop),r*(1.2+1.6*stop),seed,{n:24}),8*(1-stop)+2,{seed,close:true,wobble:1.2}),1);
  const g=sm(.08,.28,age,easeOut);if(g>.02){const sx=x-r*1.05-(1-g)*120,sole=polyPath(blob(sx,y+r*.2,r*.32,r*.95,seed+2,{n:18}),true);s.knockout(sole);s.fill(K,sole,.9);}
  ball(s,bx,y,r,seed,{rot:age*6});
 },
};
export default film;
