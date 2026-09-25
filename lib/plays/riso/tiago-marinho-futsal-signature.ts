/** Tiago Marinho — "the quick-reaction save": a signature-move riso film (iconic plays, FUTSAL goleiro).
 *
 * WHO: the card's "Tiago Marinho" (lib/town/playerAppearance.json country Brazil; playerBios: "Brazilian goleiro who won the World Cup in
 *  2008 and 2012, earning the 2008 Golden Glove, and was famous for his passes to Falcão") is Tiago de Melo Marinho ("Tiago", b. 9 Mar 1981,
 *  São Paulo; 1.73 m; Brazil 2005–2019; Jaraguá, Gazprom-Ugra, São José, Sorocaba, Corinthians …). Country and bio match — no namesake issue.
 * WHY THIS MOMENT: his entry (lib/town/iconicPlays.json) is a signature — the quick-reaction save, lesson "Keep your weight forward on your
 *  toes, ready to spring" — not one match. FIFA's written summary of the 2012 FIFA Futsal World Cup QUARTER-FINAL, Argentina 2–3 Brazil
 *  (a.e.t.), describes one Tiago save exactly: "With four minutes remaining, a brilliant Leandro Cuzzolino strike from distance forced Tiago
 *  into a fine acrobatic save". FIFA's play-by-play dates it: "36'03" A player from Argentina sees his effort hit the target. 36'04" The
 *  goalkeeper of Brazil pulls off a save." (score 2–2: Neto 32'42", Falcão 33'55"). So the film recreates that save.
 *  Match choice: no other futsal film uses this match (Falcão / Neto use the 2012 FINAL, Carlos Ortiz Spain–Russia QF, Márcio Forte the 3rd
 *  place match, Sergeev a group match, João Victor the 2024 final v Argentina).
 *  1  LIVE (broadcast camera, main stand, real time): Indoor Stadium Huamark, Bangkok, 14 Nov 2012, 16:00, attendance 3,007 (a big hall,
 *     mostly empty seats). Hanging scoreboard 2–2, the clock bar at 36 of 40. Argentina's corner (play-by-play 36'03" "Argentina swing in the
 *     corner") is played short to Cuzzolino (No. 7) far out; he strikes; Tiago (No. 2) leaps and palms it away; 36'04" saved.
 *  2  REPLAY — BALL-CAM (slow motion; the camera RIDES WITH THE SHOT, a few feet behind the ball, from Cuzzolino's boot to Tiago's glove —
 *     a set-up no other goleiro film uses: they use behind-the-shooter, net/behind-goal, goal-line, far-post floor, corner, reverse-touchline,
 *     end-gantry and orbiting cameras). A yellow "blink" ring fills while the ball flies; the save; then the camera rises: Brazil won 3–2
 *     after extra time (Falcão 44'42") and went on to be world champions (final v Spain, 18 Nov 2012).
 *  3  HOW HE DOES IT (demonstration, blue training top, empty arena, no match claimed; a PROFILE camera at kid height, square side-on to the
 *     keeper): weight forward, up on his toes, knees soft; then flat on his heels — the ball is past him before he moves ("too late"); rewind;
 *     on his toes again — he springs and saves. Lesson from the entry's `lesson`.
 * Sources (written; fetched with curl, cached in scratchpad/films/src-cache/):
 *  - FIFA.com match summary "Falcao stars as Brazil rally to eliminate Argentina" (archived 17 Nov 2012; fifa-2012-futsal-arg-bra-summary.txt):
 *    https://web.archive.org/web/20121117014016/http://www.fifa.com/futsalworldcup/matches/round=260741/match=300215855/summary.html
 *  - FIFA.com match report (same archive; fifa-2012-futsal-arg-bra-report.txt): Match 45, Quarter-finals, 14 November 2012, Bangkok / Indoor
 *    Stadium Huamark, 16:00, attendance 3007; referee Wenceslaos Aguilar (PAN); Argentina [1] Santiago Elías (GK)(C), [7] Leandro Cuzzolino …;
 *    Brazil [2] TIAGO (GK), [6] Gabriel, [8] Simi, [10] Fernandinho, [11] Neto …; goals Rescia 16'30", Borruto 17'07", Neto 32'42", Falcão
 *    33'55" & 44'42"; shots 31–82, possession 37–63%.
 *  - FIFA.com play-by-play (same archive; fifa-2012-futsal-arg-bra-playbyplay.txt): 36'03" corner + effort on target, 36'04" Brazil GK save,
 *    36'11" Argentina off target + Brazil time-out; 37'24"–37'25" a second Tiago save.
 *  - Wikipedia (pt), "Tiago de Melo Marinho" (raw; ptwiki-tiago-marinho-futsal.txt): birth, 1.73 m, Brazil 2005–2019, clubs, world champion
 *    2008 & 2012, 2008 Golden Glove; famous for his long passes to Falcão.
 *  - Wikipedia, "2012 FIFA Futsal World Cup" (raw, cached): Indoor Stadium Huamark capacity 12,000; QF Argentina 2–3 Brazil a.e.t. at Huamark.
 *  - FIFA.com summary of the final (fifa-2012-futsal-final-summary.txt): Brazil beat Spain 3–2 a.e.t. to retain the title.
 * CONFIRMED: match, date, venue, city, time, crowd size, teams, 2–2 at the time, "four minutes remaining" (36'03"–36'04"), the shooter
 *  Leandro Cuzzolino (No. 7), a strike from distance, a "fine acrobatic save" by Tiago (No. 2), an Argentina corner in the same second,
 *  Brazil winning 3–2 after extra time, Brazil world champions 2012.
 * INFERRED (not named in the narration): that the corner was played short to Cuzzolino; which corner/end; where he shot from (~10 m, right
 *  foot); where the shot went (top of the near post) and how Tiago saved it (a leap to his right, right palm, the ball pushed wide and back
 *  into play — no corner is listed after the save); every other player's position; kits — Brazil yellow shirts / blue shorts / white socks,
 *  Argentina sky-blue-and-white stripes / navy shorts, Tiago in a red long-sleeved keeper top with navy legs; the scoreboard's look; his
 *  short dark hair (playerAppearance). No video was reviewed. Chapter 3 is a coaching demonstration, not footage of a match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the strike and the leap). Our stages are LEFT-handed (X right, Z away), so `projector()` maps library z → −Z. The ball's
 *  contact point IS the solved position of Tiago's right palm in the dive pose, so glove and ball always meet. The ball-cam re-uses the same
 *  choreography through a rigid rotation W() of the court (shot direction → +Z), so chapter 2 is the same play from a new camera.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps the recorded clock back onto the authored
 *  choreography through the cue anchors.
 * Inks: yellow (Brazil, lights, blink ring), red (Tiago's top, posts, arrows), blue (court, Argentina stripes, training top), navy (key line).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; figures behind the ball-cam are culled; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,posed,blendPose,keyPoses,clampPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2012 quarter-final',text:'Bangkok, 2012, a Futsal World Cup quarter-final. Argentina against Brazil, two all, four minutes left. Leandro Cuzzolino shoots from far out. Tiago leaps. What a save!',tail:2.6,
  cues:['Bangkok','Argentina against','two all','four minutes','Leandro Cuzzolino','far out','Tiago leaps','What a save'],heads:{'Bangkok':'World Cup 2012','two all':'2–2','What a save':'Saved!'}},
 {label:'Replay: ride with the ball',text:'Ride with the ball. It gets there in a blink, so Tiago has to react fast. Brazil won three to two after extra time, and became world champions!',tail:2.4,
  cues:['Ride with','gets there','in a blink','Tiago has','react fast','Brazil won','three to two','world champions'],heads:{'react fast':'React fast','three to two':'Brazil 3–2 (a.e.t.)','world champions':'World champions'}},
 {label:'How he does it (demo)',text:'How he does it: weight forward, up on your toes, knees soft. Flat on your heels, you are too late. Keep your weight forward, on your toes, ready to spring!',tail:2.8,
  cues:['How he does it','weight forward','up on your toes','knees soft','Flat on','too late','Keep your weight','ready to spring'],heads:{'How he does it':'How he does it','too late':'Too late!','ready to spring':'Spring!'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/tiago-marinho-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/tiago-marinho-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/tiago-marinho-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('tiago-marinho: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('tiago-marinho: no cue '+w);return c.at;};
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
/** an open circular arc (screen space) for rings and gauges */
function arcPts(c:Pt,rx:number,ry:number,a0:number,a1:number,n=28):Pt[]{const o:Pt[]=[];for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);o.push([c[0]+Math.cos(a)*rx,c[1]+Math.sin(a)*ry]);}return o;}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):V3=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.84],[R,.3]];
/** Tiago: 1.73 m (ptwiki), short dark hair (playerAppearance); red long-sleeved keeper top, navy legs, paper gloves, No. 2 (kit inferred) */
const KBUILD={height:1.73,bulk:1.02};
const TIAGO:AthleteStyle={shirt:R,shorts:K,socks:K,boots:K,skin:SKIN,hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',number:2,numberInk:'paper',build:KBUILD,seed:2};
/** the demonstration keeper (chapter 3): a blue training top, no number (no match is claimed) */
const TIAGO_TRAIN:AthleteStyle={...TIAGO,shirt:B,trim:'paper',number:undefined,seed:3};
/** Brazil outfield: yellow shirts, blue shorts, white socks (inferred) */
const BRA=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,skin:[[Y,.84],[R,.34]],hair:K,line:K,trim:B,hairStyle:(['short','bald','curly','short'] as const)[n%4],build:{height:1.70+hash(n,4)*.12},seed:40+n});
/** Argentina: sky-blue-and-white stripes, navy shorts (inferred); Leandro Cuzzolino No. 7 */
const ARG=(n:number):AthleteStyle=>({shirt:'paper',pattern:'stripes',patternInk:[B,.55],shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:B,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,3)*.1},seed:20+n});
const SBUILD={height:1.74,bulk:1.02};
const CUZZ:AthleteStyle={...ARG(1),hairStyle:'short',number:7,numberInk:K,build:SBUILD,seed:29};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact (library coords, place at the origin, turned to yaw) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),SBUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}

// ---------------- the keeper's moves ----------------
const SET0=keeperSet(0);
function shuffle(ph:number):Pose{const o=.5+.5*Math.sin(ph*TAU);return{...SET0,lHipA:SET0.lHipA+.24*o,rHipA:SET0.rHipA+.24*(1-o),air:.02*Math.abs(Math.sin(ph*TAU))};}
/** the leap: a dive to his RIGHT, high (an "acrobatic save") */
const DIVE=(t:number)=>keeperDive(clamp(t),{side:'r',height:.72});
/** on his toes: the set with the heels lifted (ankles pointed) */
const TOES=clampPose({...keeperSet(.25),lAnk:.4,rAnk:.4});
/** flat on his heels: upright, weight back, toes up, knees nearly straight */
const HEELS=posed({lHipF:6,rHipF:6,lHipA:8,rHipA:8,lKnee:6,rKnee:6,lAnk:-14,rAnk:-14,lean:-8,pitch:-5,lShF:18,rShF:18,lShA:16,rShA:16,lElb:30,rElb:30,neckP:-6,lHand:1,rHand:1});
/** a clenched-fist "come on", then a clap */
const FIST=posed({lHipF:14,rHipF:14,lKnee:20,rKnee:20,lean:6,rShF:40,rShA:40,rElb:120,lShA:20,lElb:40,neckP:-10});
const CLAP=(t:number)=>{const o=.5+.5*Math.sin(t*TAU*2.2);return posed({lHipF:12,rHipF:12,lKnee:16,rKnee:16,lean:6,lShF:62,rShF:62,lShA:14+22*o,rShA:14+22*o,lElb:64,rElb:64,lShR:-30,rShR:-30,neckP:-4});};
const HANDS_HEAD=posed({lHipF:8,rHipF:8,lKnee:10,rKnee:10,lean:-6,lShF:120,rShF:120,lShA:50,rShA:50,lElb:140,rElb:140,neckP:-22});
/** the right palm (our coords) in pose p at (X,Z,yaw), nudged `out` metres toward (tx,tz) so the ball sits on the glove, not in it */
function palm3(p:Pose,X:number,Z:number,yaw:number,tx:number,tz:number,ty:number,out=.12):V3{const h=toMine(solve(p,KBUILD,placeAt(X,Z,yaw)).lHa),d=[tx-h[0],ty-h[1],tz-h[2]],l=Math.hypot(d[0],d[1],d[2])||1;return[h[0]+d[0]/l*out,h[1]+d[1]/l*out,h[2]+d[2]/l*out];}
function palm(p:Pose,X:number,Z:number,yaw:number,tx:number,tz:number,ty:number,out=.12):V3{const h=toMine(solve(p,KBUILD,placeAt(X,Z,yaw)).rHa),d=[tx-h[0],ty-h[1],tz-h[2]],l=Math.hypot(d[0],d[1],d[2])||1;return[h[0]+d[0]/l*out,h[1]+d[1]/l*out,h[2]+d[2]/l*out];}
/** after a dive: keep the pelvis where it landed while the pose blends back to standing (no sliding back) */
function recover(X:number,Z:number,yaw:number,to:Pose,u:number,dive=DIVE):{pose:Pose;X:number;Z:number}{
 const a=toMine(solve(dive(1),KBUILD,placeAt(X,Z,yaw)).pelvis),b=toMine(solve(to,KBUILD,placeAt(X,Z,yaw)).pelvis);
 return{pose:blendPose(dive(1),to,u),X:X+(a[0]-b[0])*u,Z:Z+(a[2]-b[2])*u};}

// ---------------- the ball ----------------
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
function ballOn(s:Sheet,st:Stage,X:number,Yh:number,Z:number,seed:number,o:{min?:number;rot?:number;smear?:number;dir?:number}={}){
 const p=proj(st,X,Yh,Z),g=proj(st,X,0,Z),r=Math.max(o.min??9,kAt(st,Z)*BALL_R);shadow(s,g[0],g[1],r*1.15*(1+Yh*.15),r*.3,seed+5,.45/(1+Yh));ball(s,p[0],p[1],r,seed,{rot:o.rot,smear:o.smear,dir:o.dir});return{p,r};
}

// ---------------- the arena ----------------
/** stepped navy rows and roof lights; `crowd` = share of seats filled (3,007 in a 12,000 hall ≈ .3); cheer lifts heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0,crowd=.3){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 if(crowd>0){const heads=new Path2D(),yel=new Path2D(),blues=new Path2D(),pap=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
  for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977;if(hash(i,5)>crowd*(r<5?1.5:.7))continue;const hsh=hash(i,3),body=hash(i,4),fan=body<.45,jump=cheer*(fan?1:.3)*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
    heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);(fan?yel:body<.62?blues:pap).rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
  s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(B,blues);s.knockout(pap,.8);}
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((scroll*kw*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}
/** boards along a far wall at depth Z (ads, a blue rail), then the stands above them */
function farWall(s:Sheet,st:Stage,Z:number,t:number,cheer:number,flash:number,crowd=.3){
 const span=9000,wall=proj(st,0,0,Z)[1],kw=kAt(st,Z),board=.95*kw;
 s.knockout(rectPath(-span,wall-span,span*2,span));s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-14;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,Z)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,Z)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(B,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx,crowd);
}

// ---- the LIVE world: the court seen from the main stand; Brazil's goal (Tiago's) at X = −20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=-20,POST_N=8.5,POST_F=11.5,GC:XZ=[GOAL_X,10];
/** the court's painted lines as floor polylines (world X,Z) */
function courtLines():Pt[][]{const arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X+6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}
 return[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]],arc,cc];}
const LINES=courtLines();
function court(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;crowd?:number;keeper?:()=>void;board?:()=>void}={}){
 const{cheer=0,flash=0,crowd=.3}=o,span=9000,wall=proj(st,0,0,BOARDS)[1];
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const cz=polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true);s.knockout(cz,.25);s.fill(B,cz,.82);
 s.fill(B,polyPath(floorQuad(st,-20,6,20,13),true),.12);
 const lines=new Path2D();for(const seg of LINES)lineOn(lines,st,seg);
 for(const X of[GOAL_X+6,GOAL_X+10])if(10>st.cz+1)lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 s.knockout(lines,.94);
 farWall(s,st,BOARDS,t,cheer,flash,crowd);
 o.board?.();
 sideGoal(s,st);o.keeper?.();sidePosts(s,st);
}
function sideGoal(s:Sheet,st:Stage){
 const H=2,Db=.95,Dt=.55,back=(Z:number,Yh:number):Pt=>proj(st,GOAL_X-lerp(Db,Dt,Yh/H),Yh,Z);
 const hull=[proj(st,GOAL_X,0,POST_N),proj(st,GOAL_X,H,POST_N),proj(st,GOAL_X,H,POST_F),back(POST_F,H),back(POST_F,0),back(POST_N,0),back(POST_N,H)];
 const np=polyPath(hull,true);s.knockout(np,.5);s.fill(K,np,.18);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.4)for(const Z of[POST_N,POST_F]){const a=proj(st,GOAL_X,Yh,Z),b=back(Z,Yh);mesh.moveTo(a[0],a[1]);mesh.lineTo(b[0],b[1]);}
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
/** 7-segment digits for the hanging scoreboard */
function digit(n:number,x:number,y:number,h:number):Pt[][]{const SEG:Record<number,string>={2:'abged',3:'abgcd'},w=h*.55,P:Record<string,Pt[]>={a:[[x,y],[x+w,y]],b:[[x+w,y],[x+w,y+h/2]],c:[[x+w,y+h/2],[x+w,y+h]],d:[[x,y+h],[x+w,y+h]],e:[[x,y+h/2],[x,y+h]],f:[[x,y],[x,y+h/2]],g:[[x,y+h/2],[x+w,y+h/2]]};return[...SEG[n]].map(c=>P[c]);}

// ================= chapter 1 — LIVE: 14 Nov 2012, 36:03; the short corner, Cuzzolino from distance, Tiago's leap =================
const C1={bkk:A(0,'Bangkok'),arg:A(0,'Argentina'),two:A(0,'two all'),four:A(0,'four'),leo:A(0,'Leandro'),far:A(0,'far out'),tiago:A(0,'Tiago'),save:A(0,'What'),end:AUTH[0].seconds};
/** the play (inferred): the corner at the far-left corner, rolled short and back to Cuzzolino ~10 m out; first-time right-foot strike */
const CORNER:XZ=[-19.7,19.7],SHOT:XZ=[-9.9,13.6],RECV:XZ=[-10.5,14.4];
const T_SAVE=C1.tiago+.32,T_HIT=T_SAVE-.46,P1=[T_HIT-1.75,T_HIT-.7],T_D0=T_HIT-.02;
const kpos=(p:XZ,d=1.05):XZ=>{const u=unit(p[0]-GC[0],p[1]-GC[1]);return[GC[0]+u[0]*d,GC[1]+u[1]*d];};
const K_CORNER=kpos(CORNER,.9),KS=kpos(SHOT,1.0),YK=yawTo(SHOT[0]-KS[0],SHOT[1]-KS[1]);
/** the dive phase at contact: the palm reaches the top of the near post side (≈ Z 8.9) — searched once */
const DC=(()=>{let best=1e9,bt=.55;for(let t=.36;t<=.62;t+=.01){const h=toMine(solve(DIVE(t),KBUILD,placeAt(KS[0],KS[1],YK)).rHa),e=Math.abs(h[2]-8.95)+Math.max(0,h[1]-1.9)*2;if(e<best){best=e;bt=t;}}return bt;})();
/** the ball meets his right palm (solved from the skeleton) */
const HAND=palm(DIVE(DC),KS[0],KS[1],YK,SHOT[0],SHOT[1],.8);
const YAW_SHOT=yawTo(HAND[0]-SHOT[0],HAND[2]-SHOT[1]);
const SB=toMine(strikeBall(YAW_SHOT)),PLANT:XZ=[SHOT[0]-SB[0],SHOT[1]-SB[2]];
/** off the palm: pushed wide of the near post and back into the court (no corner followed in the play-by-play) */
const DEFL_MID:V3=[-18.4,1.9,7.3],DEFL_END:V3=[-16.6,.2,5.6],REST:V3=[-14.6,BALL_R,4.1];
const T_OUT=T_SAVE+.5,T_REST=T_OUT+1.1;
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 if(T<P1[0])return{X:CORNER[0]+.25,Y:BALL_R,Z:CORNER[1]-.25,flying:false,spin:0};
 if(T<P1[1]){const u=sm(P1[0],P1[1],T,easeOut);return{X:lerp(CORNER[0]+.25,RECV[0],u),Y:BALL_R,Z:lerp(CORNER[1]-.25,RECV[1],u),flying:false,spin:u*10};}
 if(T<T_HIT){const u=sm(P1[1],T_HIT,T,linear);return{X:lerp(RECV[0],SHOT[0],u),Y:BALL_R,Z:lerp(RECV[1],SHOT[1],u),flying:false,spin:10+u*3};}
 if(T<T_SAVE){const u=sm(T_HIT,T_SAVE,T,linear);return{X:lerp(SHOT[0],HAND[0],u),Y:lerp(BALL_R,HAND[1],Math.sqrt(u))+.25*Math.sin(u*Math.PI),Z:lerp(SHOT[1],HAND[2],u),flying:true,spin:14+u*20};}
 if(T<T_OUT){const q=quad3(HAND,DEFL_MID,DEFL_END,sm(T_SAVE,T_OUT,T,linear));return{X:q[0],Y:q[1],Z:q[2],flying:true,spin:34};}
 const u=sm(T_OUT,T_REST,T,easeOut),bo=Math.abs(Math.sin(u*Math.PI*2))*.35*(1-u);return{X:lerp(DEFL_END[0],REST[0],u),Y:lerp(DEFL_END[1],BALL_R,Math.min(1,u*2.5))+bo,Z:lerp(DEFL_END[2],REST[2],u),flying:false,spin:34+u*10};
}
/** Tiago: tracks the ball on his line, set, then the leap on the strike; lands; gets up (pelvis held); a fist */
const liveK:Gen=T=>{
 if(T<T_D0){const b=liveBall(T),mv=T>P1[0]-.1&&T<P1[1]+.2;
  const u=sm(P1[0]-.1,P1[1]+.2,T,easeIO),Xs=lerp(K_CORNER[0],KS[0],u),Zs=lerp(K_CORNER[1],KS[1],u);
  return{pose:mv?blendPose(keeperSet(T*1.2),shuffle(T*2.6),.85):keeperSet(T*1.2),yaw:yawTo(b.X-Xs,b.Z-Zs),X:Xs,Z:Zs};}
 if(T<T_SAVE+.9){const d=T<T_SAVE?lerp(0,DC,sm(T_D0,T_SAVE,T,linear)):lerp(DC,1,sm(T_SAVE,T_SAVE+.62,T,easeOut));return{pose:DIVE(d),yaw:YK,X:KS[0],Z:KS[1]};}
 const u=sm(T_SAVE+.9,T_SAVE+1.7,T,easeIO),up=recover(KS[0],KS[1],YK,stand(),u);let pose=up.pose,yaw=YK;
 if(T>T_SAVE+1.7){pose=blendPose(stand(),FIST,sm(T_SAVE+1.7,T_SAVE+2,T,easeOutBack));yaw=lerp(YK,FACE_CAMERA+.8,sm(T_SAVE+1.7,T_SAVE+2.3,T,easeIO));}
 return{pose,yaw,X:up.X,Z:up.Z};};
/** Cuzzolino (Argentina No. 7): drifts off the box, opens to the corner, first-time right-foot strike, then hands to his head */
const S_T0=T_HIT-.55;
const liveCz:Gen=T=>{
 const stT=key(T,[[S_T0,.12],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,1]],linear);
 const X=key(T,mono([[0,-12.4],[P1[0],-11.6,easeIO],[S_T0,PLANT[0]-.4,easeIO],[T_HIT,PLANT[0],easeOut],[T_HIT+.5,PLANT[0]-.35,easeOut]]));
 const Z=key(T,mono([[0,15.6],[P1[0],15.0,easeIO],[S_T0,PLANT[1]+.35,easeIO],[T_HIT,PLANT[1],easeOut],[T_HIT+.5,PLANT[1]-.2,easeOut]]));
 let pose:Pose,yaw=yawTo(CORNER[0]-X,CORNER[1]-Z);
 if(T<S_T0)pose=T<P1[0]?blendPose(stand(),runCycle(T*runCadence(.2),{speed:.2}),.4):runCycle(T*runCadence(.35),{speed:.35});
 else if(T<T_SAVE+.4){pose=strike(stT,{foot:'r'});yaw=lerp(yaw,YAW_SHOT,sm(S_T0,S_T0+.25,T));}
 else{pose=blendPose(strike(1,{foot:'r'}),HANDS_HEAD,sm(T_SAVE+.4,T_SAVE+.9,T,easeIO));yaw=YAW_SHOT;}
 return{pose,yaw,X,Z};};
/** Argentina's corner taker and two in the box */
const ARG_POS:XZ[]=[[CORNER[0]+.55,CORNER[1]-.55],[-16.4,12.9],[-16.9,7.9]];
const liveArg=(i:number):Gen=>T=>{
 if(i===0){const kick=pulse(T,P1[0]-.06,.3),pose=blendPose(T<P1[0]?stand():blendPose(stand(),runCycle(T*runCadence(.3),{speed:.3}),sm(P1[0]+.3,P1[0]+.8,T)),posed({lHipF:-10,rHipF:44,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2));
  const X=key(T,[[0,ARG_POS[0][0]],[P1[0]+.3,ARG_POS[0][0]],[C1.end,-16.4,easeIO]]),Z=key(T,[[0,ARG_POS[0][1]],[P1[0]+.3,ARG_POS[0][1]],[C1.end,16.4,easeIO]]);
  return{pose,yaw:T<P1[0]+.3?yawTo(RECV[0]-CORNER[0],RECV[1]-CORNER[1]):yawTo(1,-.6),X,Z};}
 const[x0,z0]=ARG_POS[i];let pose=blendPose(stand(),backpedal(T*1.1+i),.4);if(T>T_SAVE+.2)pose=blendPose(pose,HANDS_HEAD,.5*sm(T_SAVE+.2,T_SAVE+.7,T));
 return{pose,yaw:yawTo(1,.1*(i-1.5)),X:x0+.3*Math.sin(T*.8+i),Z:z0+.25*Math.cos(T*.7+i)};};
/** Brazil (yellow): one on the corner, one closing Cuzzolino (a late lunge), two in the box; after the save they clap their keeper */
const BRA_POS:XZ[]=[[-17.6,17.4],[-12.6,12.2],[-17.3,11.9],[-17.7,8.8]];
const liveBra=(i:number):Gen=>T=>{
 let[X,Z]=BRA_POS[i];let pose=backpedal(T*1.4+i*.3),yaw=yawTo(SHOT[0]-X,SHOT[1]-Z);
 if(i===1){const u=sm(P1[0]+.2,T_HIT-.1,T,easeIO);X=lerp(X,SHOT[0]-1.1,u);Z=lerp(Z,SHOT[1]-.9,u);pose=u>0&&u<1?runCycle(T*runCadence(.6),{speed:.6}):pose;
  const lu=key(T,[[T_HIT-.25,0],[T_HIT+.1,.6],[T_HIT+.6,1]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_HIT-.3,T_HIT-.15,T));}
 const post=sm(T_SAVE+.8,T_SAVE+1.4,T);pose=blendPose(pose,CLAP(T+i*.2),post);
 const kp=liveK(T);return{pose,yaw:lerp(yaw,yawTo(kp.X-X,kp.Z-Z),post),X,Z};};
/** the hanging scoreboard above the far stands: ARG (blue bar) 2 : 2 BRA (yellow bar); the clock bar at 36 of 40 */
function scoreboard(s:Sheet,st:Stage,T:number){
 const tl=proj(st,-15.6,6.3,BOARDS+3),br=proj(st,-10.2,3.9,BOARDS+3),w=br[0]-tl[0],h=br[1]-tl[1];
 const panel=polyPath([[tl[0],tl[1]],[br[0],tl[1]],[br[0],br[1]],[tl[0],br[1]]],true);s.knockout(panel);s.fill(K,panel,.92);
 const hang=new Path2D();for(const u of[.2,.8]){hang.moveTo(tl[0]+w*u,tl[1]-h*.9);hang.lineTo(tl[0]+w*u,tl[1]);}s.stroke(K,hang,Math.max(2,h*.03),.8);
 s.fill(B,rectPath(tl[0]+w*.08,br[1]-h*.26,w*.34,h*.1));s.fill(Y,rectPath(tl[0]+w*.58,br[1]-h*.26,w*.34,h*.1));
 const dh=h*.46,y0=tl[1]+h*.12,segs=new Path2D();
 for(const x of[tl[0]+w*.18,tl[0]+w*.68])for(const sg of digit(2,x,y0,dh))segs.addPath(ribbon(sg,dh*.14,{seed:7+Math.round(x),taper:0,wobble:.4}));
 s.knockout(segs);s.fill(Y,segs);
 const tp=pulse(T,C1.two,1.1);if(tp>.02)s.fill(R,rectPath(tl[0]+w*.08,tl[1]+h*.06,w*.84,h*.6),.4*tp);
 s.fill(Y,ribbon([[tl[0]+w*.47,y0+dh*.5],[tl[0]+w*.53,y0+dh*.5]],dh*.1,{seed:5,taper:0}));
 const cy=br[1]-h*.1,cx0=tl[0]+w*.08,cw=w*.84;s.fill(K,rectPath(cx0,cy-h*.03,cw,h*.06),.5);s.fill(Y,rectPath(cx0,cy-h*.03,cw*.9,h*.06));
 const fp=pulse(T,C1.four,1.6);if(fp>.02)s.fill(R,rectPath(cx0+cw*.9,cy-h*.07,cw*.1,h*.14),fp);
}
const liveCam=(T:number)=>({x:key(T,mono([[0,-15.0],[P1[0],-14.8],[T_HIT,-15.8],[T_SAVE+.3,-16.8],[C1.end,-16.2]]),easeInOutSine),
 zoom:key(T,mono([[0,.6],[C1.two,.62],[P1[0],.68],[T_HIT,.84],[T_SAVE+.4,.92],[C1.end,.86]]),easeInOutSine),
 y:key(T,mono([[0,840],[C1.four,870],[P1[0],960],[T_HIT,1030],[C1.end,1035]]),easeInOutSine)});
const ST1=(x:number):Stage=>({F:4500,eye:6,cx:x,cz:-13});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=ST1(c.x),hit=pulse(Tc,T_SAVE,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T);
 court(s,st,T,{cheer:T>=T_SAVE?.9*(1-.4*sm(C1.end-1.2,C1.end,T)):.1,flash:.6*pulse(T,T_SAVE,1.2)+.4*pulse(T,C1.bkk,1),board:()=>scoreboard(s,st,T)});
 type It={z:number;draw:()=>void};const items:It[]=[];
 BRA_POS.forEach((_,i)=>{const g=liveBra(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,BRA(i),{detail:'low'})});});
 ARG_POS.forEach((_,i)=>{const g=liveArg(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ARG(i+2),{detail:'low'})});});
 items.push({z:liveCz(T).Z,draw:()=>athlete(s,st,liveCz,T,CUZZ,{smear:T>T_HIT-.2&&T<T_HIT+.2?.1:0})});
 items.push({z:liveK(T).Z,draw:()=>athlete(s,st,liveK,T,TIAGO,{smear:T>T_D0&&T<T_SAVE+.3?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R),q=liveBall(T-.05),pq=proj(st,q.X,q.Y,q.Z);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45/(1+b.Y));
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.45:0,dir:Math.atan2(p[1]-pq[1],p[0]-pq[0])});
  if(T>=T_SAVE&&T<T_SAVE+.35)sparkBurst(s,Y,p[0],p[1],r*3.2,{n:10,seed:19,g:easeOut(sm(T_SAVE,T_SAVE+.25,T))});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** Tiago's chest (the passage enters his top) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,KBUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(ST1(liveCam(tc).x),liveK(tt),.13));},still:T_SAVE+.05};

// ================= chapter 2 — REPLAY: the BALL-CAM rides with the shot (slow motion), the blink ring, the save; 3–2, world champions =================
const C2={ride:A(1,'Ride'),gets:A(1,'gets'),blink:A(1,'in a blink'),has:A(1,'Tiago has'),react:A(1,'react'),won:A(1,'Brazil won'),three:A(1,'three'),world:A(1,'world'),end:AUTH[1].seconds};
/** W(): a rigid rotation of the court so the shot travels along +Z (origin at the ball at the strike) */
const SD=unit(HAND[0]-SHOT[0],HAND[2]-SHOT[1]),ROT=Math.atan2(SD[1],SD[0])-Math.PI/2;
const W=(X:number,Z:number):XZ=>{const dx=X-SHOT[0],dz=Z-SHOT[1];return[dx*SD[1]-dz*SD[0],dx*SD[0]+dz*SD[1]];};
const inW=(g:Gen):Gen=>T=>{const a=g(T),[X,Z]=W(a.X,a.Z);return{pose:a.pose,yaw:a.yaw-ROT,X,Z};};
const K2=inW(liveK),CZ2=inW(liveCz),BR2=inW(liveBra(1)),AR2=[inW(liveArg(1)),inW(liveArg(2))],BX2=[inW(liveBra(2)),inW(liveBra(3))];
const ball2=(T:number)=>{const b=liveBall(T),[X,Z]=W(b.X,b.Z);return{...b,X,Z};};
const D2=W(HAND[0],HAND[2])[1];
/** replay clock → live time: slow from the wind-up through the flight (≈ .2×), then nearly real time */
const rLive=(t:number)=>key(t,mono([[0,T_HIT-.6],[C2.ride+.35,T_HIT,linear],[C2.react+.1,T_SAVE,linear],[C2.won-.1,T_SAVE+1.0,linear],[C2.end,T_SAVE+1.0+(C2.end-C2.won+.1)*.7,linear]]),linear);
/** the ball-cam: low behind/right of the ball, then riding ~1.7 m behind it, stopping ~3.4 m short of the keeper; after the save it rises */
function st2(tt:number):Stage{
 const T=rLive(tt),b=ball2(Math.max(T,T_HIT)),fly=sm(T_HIT,T_SAVE,T,linear),up=sm(C2.won-.3,C2.won+1.2,tt,easeIO);
 const cz=T<T_HIT?-2.3:Math.min(b.Z-1.7,D2-3.4);
 return{F:1150,eye:lerp(lerp(.85,b.Y+.28,sm(T_HIT-.3,T_HIT+.15,T,easeIO)),1.3,Math.max(sm(T_SAVE-.1,T_SAVE+.5,T),0))+.6*up,cx:lerp(.85,.15,fly),cz:cz-1.5*up};}
/** the goal and the end wall in the ball-cam's frame */
function goalW(s:Sheet,st:Stage){
 const P=(X:number,Yh:number,Z:number):Pt=>{const[x,z]=W(X,Z);return proj(st,x,Yh,z);};
 const H=2,back=(Z:number,Yh:number):Pt=>P(GOAL_X-lerp(.95,.55,Yh/H),Yh,Z);
 const hull=[P(GOAL_X,0,POST_N),P(GOAL_X,H,POST_N),P(GOAL_X,H,POST_F),P(GOAL_X,0,POST_F)];
 const bk=polyPath([back(POST_N,0),back(POST_N,H),back(POST_F,H),back(POST_F,0)],true);s.fill(K,bk,.22);
 const mesh=new Path2D();for(let Z=POST_N;Z<=POST_F+1e-6;Z+=.3){const a=back(Z,0);mesh.moveTo(a[0],a[1]);for(let Yh=.25;Yh<=H+1e-6;Yh+=.25){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}const c=P(GOAL_X,H,Z);mesh.lineTo(c[0],c[1]);}
 for(let Yh=0;Yh<=H+1e-6;Yh+=.3){const a=back(POST_N,Yh);mesh.moveTo(a[0],a[1]);for(let Z=POST_N+.3;Z<=POST_F+1e-6;Z+=.3){const b=back(Z,Yh);mesh.lineTo(b[0],b[1]);}}
 s.stroke(K,mesh,Math.max(1.4,kAt(st,W(GOAL_X,10)[1])*.014),.5);
 const w=.05,frame=new Path2D(),bands=new Path2D(),edge=new Path2D(),lw=Math.max(2,kAt(st,W(GOAL_X,10)[1])*.012);void hull;
 const bar=(a:[number,number],b:[number,number],steps:number,vert:boolean)=>{const Q=(Zz:number,Yh:number,d:number):Pt=>vert?P(GOAL_X,Yh,Zz+d):P(GOAL_X,Yh+d,Zz);
  const q=[Q(a[0],a[1],-w),Q(a[0],a[1],w),Q(b[0],b[1],w),Q(b[0],b[1],-w)];frame.addPath(polyPath(q,true));edge.addPath(ribbon([...q,q[0]],lw,{seed:3,taper:0,wobble:.4}));
  for(let k=0;k<steps;k+=2){const u0=k/steps,u1=(k+1)/steps,z0=lerp(a[0],b[0],u0),y0=lerp(a[1],b[1],u0),z1=lerp(a[0],b[0],u1),y1=lerp(a[1],b[1],u1);bands.addPath(polyPath([Q(z0,y0,-w),Q(z0,y0,w),Q(z1,y1,w),Q(z1,y1,-w)],true));}};
 bar([POST_N,0],[POST_N,H],8,true);bar([POST_F,0],[POST_F,H],8,true);bar([POST_N,H],[POST_F,H],12,false);
 s.knockout(frame);s.fill(R,bands);s.fill(K,edge,.9);
}
function ballCamCourt(s:Sheet,st:Stage,tt:number,cheer:number,flash:number){
 const span=9000,wz=W(GOAL_X-1.8,10)[1],wall=proj(st,0,0,wz)[1];
 s.fill(B,rectPath(-span,wall,span*2,span),.82);
 const run=polyPath([W(GOAL_X,-2),W(GOAL_X,22),W(GOAL_X-1.8,22),W(GOAL_X-1.8,-2)].map(([x,z])=>proj(st,x,0,Math.max(z,st.cz+.5))),true);s.fill(K,run,.3);
 const lines=new Path2D();for(const seg of LINES)lineOn(lines,st,seg.map(([x,z])=>W(x,z) as Pt));s.knockout(lines,.94);
 farWall(s,st,wz,tt,cheer,flash);
}
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),T=rLive(tt),st=st2(tt),hit=pulse(t,C2.react+.1,.45),cull=st.cz+.6;
  camPath(s,t,[[0,0,-60,1.0],[C2.ride+.3,0,-60,1.02],[C2.blink,0,-40,1.0],[C2.react,0,60,1.0],[C2.react+.6,-60,120,.98],[C2.won,-60,190,.96],[C2.end,-40,220,.92]],[8*hit*Math.sin(t*90),6*hit*Math.cos(t*77)]);
  ballCamCourt(s,st,tt,.2+.8*sm(C2.won,C2.won+.6,tt),.8*pulse(tt,C2.three,1.4));
  goalW(s,st);
  const b=ball2(T),kp=K2(T);
  type It={z:number;draw:()=>void};const items:It[]=[];
  const add=(g:Gen,style:AthleteStyle,detail:'low'|'mid'|'high',smear=0,near=0)=>{const z=g(T).Z;if(z>cull+near)items.push({z,draw:()=>athlete(s,st,g,T,style,{detail,smear})});};
  add(CZ2,CUZZ,'high',T>T_HIT-.2&&T<T_HIT+.15?.08:0,T>T_HIT+.05?1.6:0);add(BR2,BRA(1),'mid',0,2.6);AR2.forEach((g,i)=>add(g,ARG(i+3),'low'));BX2.forEach((g,i)=>add(g,BRA(i+2),'mid'));
  add(K2,TIAGO,'high',T>T_D0&&T<T_SAVE+.3?.07:0);
  if(b.Z>cull)items.push({z:b.Z-.05,draw:()=>{const r=ballOn(s,st,b.X,b.Y,b.Z,97,{min:10,rot:b.spin*.5,smear:b.flying&&T>T_SAVE?.3:0,dir:Math.PI});
   if(T>=T_SAVE&&T<T_SAVE+.3)sparkBurst(s,Y,r.p[0],r.p[1],Math.max(r.r*3,120),{n:12,seed:98,g:easeOut(sm(T_SAVE,T_SAVE+.25,T))});}});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "in a blink": a yellow ring round Tiago's head fills while the ball flies (his reaction window); it flashes red on "react fast"
  const ring=sm(C2.blink-.2,C2.blink+.2,tt)*(1-sm(C2.won-.4,C2.won,tt));
  if(ring>.02){const sk=solve(kp.pose,KBUILD,placeAt(kp.X,kp.Z,kp.yaw)),hd=toMine(sk.head),c=proj(st,hd[0],hd[1],hd[2]),rr=.42*kAt(st,hd[2]),fill=sm(T_HIT,T_SAVE,T,linear);
   s.fill(K,ribbon(arcPts(c,rr,rr,-Math.PI/2,Math.PI*1.5),rr*.16,{seed:201,taper:0,wobble:.6}),.35*ring);
   if(fill>.01)s.fill(pulse(tt,C2.react,1)>.3?R:Y,ribbon(arcPts(c,rr,rr,-Math.PI/2,-Math.PI/2+TAU*fill),rr*.22,{seed:202,taper:0,wobble:.6}),ring);}
  // the flight line behind the ball while riding
  if(T>T_HIT&&T<T_SAVE+.4){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=ball2(lerp(T_HIT,Math.min(T,T_SAVE),k/12));if(q.Z>cull+.3)pts.push(proj(st,q.X,q.Y,q.Z));}if(pts.length>2)dashed(s,Y,pts,12,205,{dash:44,cov:1-sm(T_SAVE,T_SAVE+.4,T)});}
  // "world champions": yellow, blue and paper confetti over the stands
  if(tt>=C2.won){const u=sm(C2.won,C2.won+2.5,tt,linear);confetti(s,[Y,B,'paper'],[-900,-700+u*420,1800,420],26,Math.floor(tt*6),{size:15});}
 },
 aperture(t0){const{tt}=clock(1,t0),T=rLive(tt);return aperture(chestPts(st2(tt),K2(T),.13));},
 still:C2.react+.15,
};

// ================= chapter 3 — HOW HE DOES IT (demonstration, training top, empty arena; a PROFILE camera at kid height) =================
const C3={how:A(2,'How'),weight:A(2,'weight'),toes:A(2,'up on'),knees:A(2,'knees'),flat:A(2,'Flat'),late:A(2,'too late'),keep:A(2,'Keep'),spring:A(2,'ready'),end:AUTH[2].seconds};
const KX3=GOAL_X+1.15,KZ3=10.4,Y3=-.95;
const DIVE3=(t:number)=>keeperDive(clamp(t),{side:'l',height:.62});
const st3:Stage={F:1850,eye:.95,cx:KX3+1.1,cz:KZ3-7.4};
/** the practice shots come from his front (+X, off frame): the "late" one beats him inside the near post; the "spring" one meets his palm */
const DC3=.5,B_FROM:V3=[KX3+5*Math.cos(Y3),.45,KZ3+5*Math.sin(Y3)];
const HAND3=palm3(DIVE3(DC3),KX3,KZ3,Y3,B_FROM[0],B_FROM[2],B_FROM[1]);
const NET3:V3=[GOAL_X-.5,1.25,11.2];
const L_HIT=C3.flat+.9,L_IN=C3.late+.05,S_HIT=C3.spring-.1,S_SAVE=C3.spring+.35;
function demoBall(t:number):{X:number;Y:number;Z:number;flying:boolean;show:boolean}{
 const fly=(a:V3,b:V3,u:number)=>({X:lerp(a[0],b[0],u),Y:lerp(a[1],b[1],u)+.35*Math.sin(u*Math.PI),Z:lerp(a[2],b[2],u)});
 if(t<L_HIT)return{X:B_FROM[0],Y:B_FROM[1],Z:B_FROM[2],flying:false,show:false};
 if(t<L_IN)return{...fly(B_FROM,NET3,sm(L_HIT,L_IN,t,linear)),flying:true,show:true};
 if(t<C3.keep-.2)return{X:NET3[0]-.2,Y:BALL_R+.5*(1-sm(L_IN,L_IN+.4,t)),Z:NET3[2],flying:false,show:true};
 if(t<S_HIT)return{X:B_FROM[0],Y:B_FROM[1],Z:B_FROM[2],flying:false,show:false};
 if(t<S_SAVE)return{...fly(B_FROM,HAND3,sm(S_HIT,S_SAVE,t,linear)),flying:true,show:true};
 const q=quad3(HAND3,[HAND3[0]+.4,2.9,HAND3[2]+1.4],[HAND3[0]+1.2,1.4,HAND3[2]+3.4],sm(S_SAVE,S_SAVE+.7,t,linear));return{X:q[0],Y:q[1],Z:q[2],flying:true,show:t<S_SAVE+.7};
}
/** the demonstration keeper: set → weight forward → toes → soft knees → flat on his heels → a late dive → rewind → toes → the spring */
const demoK:Gen=t=>{
 let pose:Pose=keeperSet(t*1.2),X=KX3,Z=KZ3;
 if(t>=C3.toes-.2&&t<C3.flat)pose=blendPose(keeperSet(t*1.2),TOES,.8*sm(C3.toes-.2,C3.toes+.2,t));
 if(t>=C3.flat&&t<L_IN-.25)pose=blendPose(TOES,HEELS,sm(C3.flat,C3.flat+.35,t,easeIO));
 const lateD=(u:number)=>DIVE3(u);
 if(t>=L_IN-.25&&t<C3.keep-.3)pose=blendPose(HEELS,lateD(sm(L_IN-.25,L_IN+.55,t,linear)*.95),Math.min(1,sm(L_IN-.25,L_IN-.1,t)*1.5));
 if(t>=C3.keep-.3&&t<C3.keep+.35){const u=sm(C3.keep-.3,C3.keep+.3,t,easeIO);pose=u<.8?lateD(.95*(1-u/.8)):blendPose(DIVE3(0),TOES,(u-.8)/.2);}
 if(t>=C3.keep+.35&&t<S_HIT-.05)pose=blendPose(TOES,keeperSet(t*1.4),.35);
 if(t>=S_HIT-.05){const d=t<S_SAVE?lerp(0,DC3,sm(S_HIT-.05,S_SAVE,t,linear)):lerp(DC3,1,sm(S_SAVE,S_SAVE+.6,t,easeOut));pose=DIVE3(d);
  if(t>S_SAVE+.9){const r=recover(KX3,KZ3,Y3,stand(),sm(S_SAVE+.9,S_SAVE+1.6,t,easeIO),DIVE3);pose=r.pose;X=r.X;Z=r.Z;}}
 return{pose,yaw:Y3,X,Z};};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  camPath(s,t,[[0,-200,-200,1.12],[C3.weight,-200,-220,1.2],[C3.toes,-230,-20,1.3],[C3.knees,-220,-100,1.24],[C3.flat,-180,-200,1.1],[C3.late,-100,-180,1.08],[C3.keep,-180,-200,1.14],[C3.spring,-100,-220,1.1],[C3.end,-80,-220,1.1]]);
  court(s,st,tt,{crowd:0,cheer:0,flash:.4*pulse(tt,S_SAVE,1)});
  const k=demoK(tt),sk=solve(k.pose,KBUILD,placeAt(k.X,k.Z,k.yaw)),J=(n:keyof typeof sk)=>{const v=toMine(sk[n] as V3);return proj(st,v[0],v[1],v[2]);};
  const g=proj(st,k.X,0,k.Z),kk=kAt(st,k.Z);
  // the keeper and the ball (ball behind or in front by depth)
  const b=demoBall(tt),bFront=b.Z<k.Z;
  const drawBall=()=>{if(!b.show)return;const r=ballOn(s,st,b.X,b.Y,b.Z,301,{min:12,rot:tt*6,smear:b.flying?.35:0,dir:Math.PI});
   if(tt>=S_SAVE&&tt<S_SAVE+.35)sparkBurst(s,Y,r.p[0],r.p[1],Math.max(120,r.r*3),{n:11,seed:302,g:easeOut(sm(S_SAVE,S_SAVE+.25,tt))});};
  if(!bFront)drawBall();
  athlete(s,st,demoK,tt,TIAGO_TRAIN,{detail:'high',smear:tt>S_HIT&&tt<S_SAVE+.3?.08:0});
  if(bFront)drawBall();
  // "weight forward": a yellow arrow from his chest pointing at the play + a dashed line from his head down over the balls of his feet
  const wf=sm(C3.weight,C3.weight+.35,tt,easeOut)*(1-sm(C3.flat-.1,C3.flat+.2,tt)),wk=sm(C3.keep,C3.keep+.35,tt,easeOut)*(1-sm(C3.spring-.3,C3.spring,tt)),wa=Math.max(wf,wk);
  if(wa>.02){const ch=J('chest'),hd=J('head'),toe=J('rToe'),an=J('rAn'),bf=L2(an,toe,.6);
   const cv=toMine(sk.chest),tip=proj(st,cv[0]+Math.cos(Y3)*.75*wa,cv[1],cv[2]+Math.sin(Y3)*.75*wa),pts:Pt[]=[ch,L2(ch,tip,.5),tip];dashed(s,Y,pts,kk*.05,311,{dash:kk*.2});arrowHead(s,Y,pts,kk*.16);
   dashed(s,K,[hd,L2(hd,bf,.5),bf],kk*.025,312,{dash:kk*.09,cov:.8*wa});}
  // "up on your toes": red ring at the lifted heel, yellow dot under the ball of the foot
  const tz=sm(C3.toes,C3.toes+.3,tt,easeOutBack)*(1-sm(C3.flat-.1,C3.flat+.2,tt));
  if(tz>.02){const he=J('rHeel'),toe=J('rToe'),an=J('rAn'),bf=L2(an,toe,.65);s.fill(R,ribbon(arcPts(he,kk*.13*tz,kk*.08*tz,0,TAU,20),kk*.025,{seed:321,close:true,wobble:.6}));
   const d=polyPath(blob(bf[0],g[1]+kk*.01,kk*.09*tz,kk*.035*tz,322,{n:14}),true);s.knockout(d);s.fill(Y,d,.95);}
  // "knees soft": a yellow bend arc at each knee
  const kn=sm(C3.knees,C3.knees+.3,tt,easeOutBack)*(1-sm(C3.flat-.1,C3.flat+.2,tt));
  if(kn>.02)for(const n of['lKn','rKn'] as const){const c=J(n);s.fill(Y,ribbon(arcPts(c,kk*.14*kn,kk*.14*kn,-Math.PI*.9,-Math.PI*.1,14),kk*.03,{seed:331+(n==='lKn'?0:1),taper:.3,wobble:.6}));}
  // "flat on your heels": navy heel bars flat on the floor; "too late": a red X beside him
  const fl=sm(C3.flat+.1,C3.flat+.4,tt)*(1-sm(C3.keep-.3,C3.keep,tt));
  if(fl>.02){const bar=ribbon([[g[0]-kk*.35,g[1]+kk*.03],[g[0]+kk*.3,g[1]+kk*.03]],kk*.04,{seed:341,taper:0,wobble:.5});s.fill(K,bar,.8*fl);}
  const lx=easeOutBack(sm(C3.late,C3.late+.3,tt))*(1-sm(C3.keep-.3,C3.keep,tt));
  if(lx>.02){const c:Pt=[g[0]+kk*1.2,g[1]-kk*1.5],S=kk*.4*lx;const x1=ribbon([[c[0]-S,c[1]-S],[c[0]+S,c[1]+S]],S*.28,{seed:351,taper:.2,wobble:1}),x2=ribbon([[c[0]+S,c[1]-S],[c[0]-S,c[1]+S]],S*.28,{seed:352,taper:.2,wobble:1});s.knockout(x1);s.knockout(x2);s.fill(R,x1);s.fill(R,x2);}
  // "Keep your weight": a rewind glyph (two yellow triangles) while the late dive plays backwards
  const rw=sm(C3.keep-.35,C3.keep-.2,tt)*(1-sm(C3.keep+.3,C3.keep+.5,tt));
  if(rw>.02){const c:Pt=[g[0]+kk*1.3,g[1]-kk*2.0],S=kk*.22*rw,tri=(x:number)=>polyPath([[x+S,c[1]-S],[x+S,c[1]+S],[x-S*.7,c[1]]],true);const p=new Path2D();p.addPath(tri(c[0]-S*.9));p.addPath(tri(c[0]+S*.8));s.knockout(p);s.fill(Y,p);}
  // "ready to spring": a red coil under him, released on the leap; then a blue tick
  const sp=sm(C3.spring-.5,C3.spring-.2,tt)*(1-sm(S_SAVE,S_SAVE+.3,tt));
  if(sp>.02){const pts:Pt[]=[];for(let i=0;i<=40;i++){const u=i/40;pts.push([g[0]-kk*.1+Math.sin(u*TAU*4)*kk*.12,g[1]+kk*.04-u*kk*.45*sp]);}s.fill(R,ribbon(pts,kk*.025,{seed:361,taper:.2,wobble:.4}),sp);}
  const tick=easeOutBack(sm(S_SAVE+1.2,S_SAVE+1.5,tt));
  if(tick>.02){const c:Pt=[g[0]+kk*1.2,g[1]-kk*1.9],S2=kk*.5*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S2,c[1]+q[1]*S2] as Pt);
   s.knockout(ribbon(tk,S2*.34,{seed:370,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S2*.24,{seed:371,taper:.2,wobble:1}),.5);s.fill(B,ribbon(tk,S2*.24,{seed:372,taper:.2,wobble:1}));}
 },
 still:C3.toes+.5,
};
function L2(a:Pt,b:Pt,u:number):Pt{return[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];}

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'tiago-marinho-futsal-signature',format:'futsal',title:'Tiago’s quick-reaction save',theme:'Keep your weight forward on your toes, ready to spring.',
 ageNote:'For players aged 7–12: Tiago’s save against Argentina at the 2012 Futsal World Cup is real; how he stands is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball zips in and a paper glove pops it away; a yellow ring rings out. Reduced motion = at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.22),hitX=x,hitY=y,bx=age<.22?lerp(x+180,hitX,easeOut(u)):lerp(hitX,x-120,easeOut(clamp((age-.22)/.4))),by=age<.22?lerp(y+40,hitY,easeOut(u)):lerp(hitY,y-140,easeOut(clamp((age-.22)/.4)));
  const ring=clamp((age-.22)/.5);if(age>.22&&ring<1)s.fill(Y,ribbon(blob(hitX,hitY,r*(1.2+1.6*ring),r*(1.2+1.6*ring),seed,{n:24}),8*(1-ring)+2,{seed,close:true,wobble:1.2}),1);
  ball(s,bx,by,r,seed,{rot:age*8});
  const gl=sm(.12,.24,age)*(1-sm(.6,.8,age));if(gl>.02){const p=blob(hitX-r*1.1,hitY+r*.2,r*.5*gl,r*.7*gl,seed+2,{n:16});s.knockout(polyPath(p,true));s.fill(K,ribbon(p,5,{seed:seed+5,close:true,wobble:.6}),1);}
 },
};
export default film;
