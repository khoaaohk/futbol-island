/** Neto — "the hard-working last defender": a signature-move riso film (iconic plays, FUTSAL; Neto is a fixo).
 *
 * WHO: the card's "Neto" is the Brazilian FUTSAL fixo Dovenir Domingues Neto (born 5 Sep 1981, Uberlândia; 1.78 m; a defender; Golden
 * Ball at the 2012 FIFA Futsal World Cup) — the bio in lib/town/playerBios.json ("Brazilian fixo who scored the extra-time winner in the
 * 2012 World Cup final vs Spain") and playerAppearance.json country "Brazil" both match him. Not the football goalkeeper Neto.
 *
 * WHY THIS MOMENT: Neto's entry (lib/town/iconicPlays.json) is a signature — "the hard-working last defender", lesson "Always get back
 * behind the ball when your team loses it." The best-documented Neto moment in writing is his WINNER in the 2012 World Cup final, 19
 * seconds from the end of extra time — the play of a tireless fixo ("that was the last bit of energy I had!"). FIFA.com describes it
 * step by step, so chapters 1–2 recreate it. No written source describes ONE dated Neto recovery run, so the defending itself is a
 * separate, clearly labelled demonstration ("This is how he defends"; training bibs, no opponent named), never staged inside that final.
 * (Falcão's film uses the same final for Falcão's 36'18" equaliser; this film shows only Neto's 49'41" winner — a different moment.)
 *  1  LIVE (broadcast camera, main stand, real time): FIFA Futsal World Cup final, 18 Nov 2012, Indoor Stadium Huamark, Bangkok, Spain
 *     2–3 Brazil a.e.t. It is 2–2 in the second period of extra time. On the halfway line Neto flicks the ball over his marker's challenge,
 *     races down the wing and rifles a low LEFT-FOOT shot into the far corner at 49'41" — 19 seconds from the end. 3–2.
 *  2  REPLAY (slow motion, low, pitch-side): the flick over the tackle and away; whip pan to the celebration — Brazil are champions.
 *  3  HOW HE DEFENDS (a demonstration, no match claimed; paper/navy training bibs): his team loses the ball upfield, he sprints back
 *     first, gets between the ball and his goal, and stops the attack.
 *  4  YOUR TURN (lesson from the entry's `lesson`): the attacker's-eye view — he runs back behind the ball, between it and the goal.
 * Sources (written; fetched with curl, ≤ 8 requests, cached in scratchpad/films/src-cache/):
 *  - FIFA.com match summary "Brazil retain crown in dramatic final" (18 Nov 2012, archived 22 Nov 2012; fifa-2012-futsal-final-summary.txt):
 *    https://web.archive.org/web/20121122001356/http://www.fifa.com/futsalworldcup/matches/round=255929/match=300215859/summary.html
 *    — "Neto's winner coming just 19 second from the end"; "another stunning goal - scored with just 19 seconds remaining - won the
 *    trophy for Brazil. This time, it was Neto who took the spotlight, flicking the ball over his marker's challenge on the halfway line,
 *    racing down the win[g] and rifling a low left-foot shot into the far corner."
 *  - FIFA.com match report, Spain v Brazil, Match 52 (fifa-2012-futsal-final-report.txt): 18 November 2012, 19:30, Bangkok / Indoor
 *    Stadium Huamark, attendance 5,685; 2:3 a.e.t. (2:2, 0:0); NETO 24'11" and 49'41"; Brazil [11] NETO in the starting five;
 *    Spain [12] JUANJO (GK) in goal.
 *  - FIFA.com "Falcao, Neto savour Brazil's glory day" (18 Nov 2012, archived 20 Nov 2012; fifa-2012-futsal-falcao-neto-savour.txt):
 *    Neto won the adidas Golden Ball and scored "A Seleção's last-gasp winner"; "Honestly, that was the last bit of energy I had! I think
 *    that both teams were already mentally preparing for penalty kicks"; after the goal he saw his wife in the crowd and ran to celebrate.
 *  - Wikipedia, "Neto (futsal player)" (raw, fetched Sep 2026; wiki-neto-futsal.txt): Dovenir Domingues Neto, 1.78 m, defender (futsal
 *    defenders), World Cup Golden Ball 2012, Best Fixo of the Brazilian league 2011, Copa América 2011.
 *  - Wikipedia, "2012 FIFA Futsal World Cup" (raw; wiki-2012-futsal-wc.txt): final Spain 2–3 Brazil a.e.t., Neto 25' and 50'.
 * CONFIRMED: match, date, venue, 2–2 → 3–2 in extra time, 19 seconds left (49'41"), the flick over his marker's challenge ON THE
 *  HALFWAY LINE, the run down the wing, a LOW LEFT-FOOT shot into the FAR corner, Neto #11 in Brazil's starting five, Juanjo #12 in
 *  Spain's goal, Neto a fixo/defender, 1.78 m, his "last bit of energy", Brazil world champions.
 * INFERRED (not named in the narration): kits (Brazil yellow shirts / blue shorts / white socks, Spain red / navy / red, Juanjo dark —
 *  matching the Falcão film of the same final); which end and which wing (here the near-side wing, attacking screen-left, so the far
 *  corner is the far post); the marker's exact challenge (a lunging leg), the keeper's late dive and every other player's position; the
 *  celebration towards the near-side crowd; Neto's hair (a dark buzz cut, from playerAppearance.json). No video was reviewed.
 *  Chapters 3–4 are a demonstration of a fixo's recovery run (from his role and the entry's lesson), not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the flick, the sprint and the strike). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()`
 * maps library z → −Z; the flick and the strike use the LEFT foot (foot:'l'), as FIFA.com records for the shot.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Brazil shirts, lights, run lines), red (Spain, danger lines), blue (court, Brazil shorts), navy (key line, run-off, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–300 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2012 final',text:'The 2012 Futsal World Cup final. Extra time, two all, nineteen seconds left! Neto, Brazil’s last defender, flicks it over his man, races down the wing, and shoots low with his left foot. Far corner!',tail:2.6,
  cues:['The 2012','Extra time','two all','nineteen seconds','Neto','last defender','flicks it','races down','shoots low','left foot','Far corner'],
  heads:{'The 2012':'Final 2012','Extra time':'Extra time','two all':'2–2','nineteen seconds':'0:19 left','Far corner':'3–2'}},
 {label:'Replay: over the tackle',text:'Watch again. He lifts it over the tackle, and he’s away! Three two. Brazil are world champions!',tail:2.2,
  cues:['Watch again','lifts it','over the tackle','away','Three two','Brazil are'],heads:{'Three two':'3–2','Brazil are':'Champions'}},
 {label:'How he defends',text:'This is how he defends: when his team loses the ball, he sprints back, gets between the ball and the goal, and stops it.',tail:1.9,
  cues:['This is how','his team loses','sprints back','gets between','and the goal','stops it'],heads:{'This is how':'How he defends','stops it':''}},
 {label:'Your turn',text:'Your turn! When your team loses the ball, always get back behind it.',tail:2.6,
  cues:['Your turn','When your team','loses the ball','always get back','behind it'],heads:{'Your turn':'Your turn','behind it':'Get back!'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/neto-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/neto-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/neto-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;

// ---------------- kits ----------------
const SKIN:InkFill[]=[[R,.32],[Y,.6],[K,.1]];
const BUILD={height:1.78,bulk:1};
/** Neto: Brazil #11 (FIFA line-up) — yellow shirt, blue shorts, white socks (kit inferred), dark buzz cut, 1.78 m */
const NETO:AthleteStyle={shirt:Y,shorts:B,socks:'paper',boots:K,skin:SKIN,hair:[K,.8],line:K,trim:B,number:11,numberInk:B,hairStyle:'short',build:BUILD,seed:11};
const BRA=(n:number):AthleteStyle=>({shirt:Y,shorts:B,socks:'paper',boots:K,skin:[[Y,.8],[R,.28]],hair:K,line:K,trim:B,hairStyle:n%2?'short':'bald',build:{height:1.7+hash(n,3)*.14},seed:20+n});
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.7],[R,.18]],hair:K,line:K,trim:Y,hairStyle:'short',build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Juanjo, Spain #12 (GK) — a dark keeper kit (inferred) */
const JUANJO:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.7],[R,.18]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',number:12,numberInk:Y,hairStyle:'short',build:{height:1.8},seed:62};
/** the demonstration (chapters 3–4): neutral paper/navy training bibs for the attackers, a plain dark keeper; no team is claimed */
const DEMO_A:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
const DEMO_K:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.7],[R,.2]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'bald',build:{height:1.82},seed:78};
const MATE:AthleteStyle={...BRA(3),number:undefined};

/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('neto: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('neto: no cue '+w);return c.at;};
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
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[Y,.75],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the left-foot strike's contact: just past the kicking toe along the foot (library coords, place at the origin) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),BUILD,{yaw}),toe=sk.lToe,an=sk.lAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}

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
type ArenaOpt={tenMark?:boolean;cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;goal?:boolean;centre?:number};
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
  lines.addPath(polyPath(floorRing(st,0,GZ-6,.12,12),true));if(o.tenMark!==false)lines.addPath(polyPath(floorRing(st,0,GZ-10,.12,12),true));}
 else if(centre!==undefined){const cc:Pt[]=[];for(let k=0;k<=36;k++){const a=k/36*TAU;cc.push([Math.cos(a)*3,centre+Math.sin(a)*3]);}
  lines.addPath(polyPath(floorStrip(st,[[-10,centre],[10,centre]],.05),true));lines.addPath(polyPath(floorStrip(st,cc,.05),true));lines.addPath(polyPath(floorRing(st,0,centre,.14,12),true));}
 lines.addPath(polyPath(floorStrip(st,[[-10,-30],[-10,lineZ+(withGoal?0:10)]],.05),true));lines.addPath(polyPath(floorStrip(st,[[10,-30],[10,lineZ+(withGoal?0:10)]],.05),true));
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

// ---------------- the flick over the challenge (shared by the live take and the replay; s = slow-motion factor) ----------------
/** FLICK: the left foot scoops under the ball, toe up; HOP: he hurdles the marker's leg; the run takes over at u = .6 (live seconds) */
const FLICK=posed({lHipF:36,lKnee:30,lAnk:-26,lHipR:-6,rHipF:8,rKnee:32,lean:10,pitch:2,neckP:30,lShA:46,rShA:40,lElb:40,rElb:44,twist:-4});
const HOP=posed({air:.3,lHipF:58,lKnee:86,lAnk:10,rHipF:-12,rKnee:74,rAnk:30,lean:18,pitch:6,neckP:14,lShA:66,rShA:54,lShF:34,rShF:-24,lElb:60,rElb:56});
const LAND=posed({lHipF:30,lKnee:44,rHipF:-8,rKnee:40,lean:20,pitch:6,neckP:20,lShA:40,rShA:40,lShF:-20,rShF:30,lElb:70,rElb:70});
type Flick={XF:number;Z0:number;tF:number;s:number;v:number};
const HOP_X=1.95,HOP_Z=.62,FLY=.62,LAND_X=2.35,LAND_Z=.42;
const toeCache=new Map<string,[number,number,number]>();
function flickToe(c:Flick):[number,number,number]{const k=c.XF+','+c.Z0;let v=toeCache.get(k);if(!v){const sk=solve(FLICK,BUILD,placeAt(c.XF,c.Z0,FACE_LEFT)),t=toMine(sk.lToe),a=toMine(sk.lAn),dx=t[0]-a[0],dz=t[2]-a[2],l=Math.hypot(dx,dz)||1;v=[t[0]+dx/l*.06,BALL_R,t[2]+dz/l*.06];toeCache.set(k,v);}return v;}
/** Neto from the approach to the landing (valid while u = (t − tF)/s ≤ .6) */
function flickNeto(c:Flick,t:number){
 const{XF,Z0,tF,s,v}=c;
 if(t<tF){let pose=dribble(t*1.5/s+.1,{foot:'l',speed:.25});pose=blendPose(pose,FLICK,sm(tF-.32*s,tF,t,easeIO));return{pose,yaw:FACE_LEFT,X:XF+v*(tF-t),Z:Z0};}
 const u=(t-tF)/s,pose=keyPoses(u,[[0,FLICK],[.24,HOP],[.46,LAND],[.6,runCycle(.05,{speed:.75})]]);
 return{pose,yaw:FACE_LEFT-.18*Math.sin(Math.PI*sm(0,.6,u)),X:XF-HOP_X*sm(0,.6,u,linear),Z:Z0-HOP_Z*sm(0,.5,u,easeIO)};
}
/** the ball: rolled ahead in the dribble, onto the toe, lifted over the leg (peak ≈ .75 m), lands ahead of him */
function flickBall(c:Flick,t:number,netoX:number):{X:number;Y:number;Z:number;flying:boolean}{
 const{XF,Z0,tF,s}=c,toe=flickToe(c);
 if(t<tF){const ph=((t*1.5/s+.1)%1+1)%1,X=netoX-.5-.14*easeOut(ph),w=sm(tF-.3*s,tF-.05*s,t,easeIO);return{X:lerp(X,toe[0],w),Y:BALL_R,Z:lerp(Z0-.1,toe[2],w),flying:false};}
 const w=clamp((t-tF)/s/FLY);return{X:lerp(toe[0],XF-LAND_X,w),Y:BALL_R+.72*4*w*(1-w),Z:lerp(toe[2],Z0-LAND_Z,w),flying:w<1};
}
/** the marker (Spain, red): closes him down, lunges the right leg at the ball; the ball and Neto go over it */
function flickMarker(c:Flick,t:number){
 const{XF,Z0,tF,s}=c,lu=key(t,[[tF-.42*s,0],[tF+.02*s,.6],[tF+.5*s,.8],[tF+1.3*s,1]],linear);
 const pose=blendPose(backpedal(t*1.1/s),lunge(lu,{side:'r'}),sm(tF-.55*s,tF-.4*s,t));
 return{pose,yaw:FACE_RIGHT,X:XF-1.2+.45*(1-sm(0,tF-.4*s,t,easeOut)),Z:Z0+.4};
}

// ================= chapter 1 — LIVE: the 2012 final, 49'41"; the flick on the halfway line, the run, the low left foot, far corner =================
const C1={extra:A(0,'Extra'),nine:A(0,'nineteen'),neto:A(0,'Neto'),last:A(0,'last'),flick:A(0,'flicks'),races:A(0,'races'),shoots:A(0,'shoots'),left:A(0,'left foot'),far:A(0,'Far'),end:AUTH[0].seconds};
const LF:Flick={XF:.2,Z0:3.9,tF:C1.flick+.12,s:1,v:.3};
const T_L=LF.tF+.6,T_HIT=C1.left+.1,S_T0=T_HIT-.62;
/** the shot: from the near-side wing (inferred), low into the far corner (the far post); ≈ 20 m/s */
const SHOT:[number,number]=[-13.9,3.5],TGT:V3=[GOAL_X+.05,.24,POST_F-.32];
const YAW_SHOT=yawTo(TGT[0]-SHOT[0],TGT[2]-SHOT[1]);
const SB=toMine(strikeBall(YAW_SHOT)),PLANT:[number,number]=[SHOT[0]-SB[0],SHOT[1]-SB[2]];
const T_IN=T_HIT+Math.hypot(TGT[0]-SHOT[0],TGT[2]-SHOT[1])/20;
const LAND_P:[number,number]=[LF.XF-HOP_X,LF.Z0-HOP_Z],RUN_END:[number,number]=[PLANT[0]+.55,PLANT[1]];
const RUN_D:[number,number]=(()=>{const x=RUN_END[0]-LAND_P[0],z=RUN_END[1]-LAND_P[1],l=Math.hypot(x,z);return[x/l,z/l];})();
/** the run down the wing: a slight bow toward the near touchline */
function runPos(T:number):[number,number]{const u=sm(T_L,S_T0,T,linear),e=u<.12?u*u/.24:u-.06,uu=e/.94;return[lerp(LAND_P[0],RUN_END[0],uu),lerp(LAND_P[1],RUN_END[1],uu)-.9*Math.sin(Math.PI*uu)];}
const liveN:Gen=T=>{
 if(T<T_L)return flickNeto(LF,T);
 let pose:Pose,yaw=FACE_LEFT,X:number,Z:number;
 if(T<S_T0){[X,Z]=runPos(T);const a=runPos(T-.05);yaw=yawTo(X-a[0],Z-a[1]);pose=blendPose(runCycle(.05,{speed:.75}),dribble((T-T_L)*2.3+.1,{foot:'l',speed:.9}),sm(T_L,T_L+.25,T));}
 else if(T<T_HIT+.55){const stT=key(T,[[S_T0,0],[S_T0+.3,.22],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,1]],linear);pose=blendPose(dribble((S_T0-T_L)*2.3+.1,{foot:'l',speed:.9}),strike(stT,{foot:'l'}),sm(S_T0,S_T0+.12,T));
  X=key(T,[[S_T0,RUN_END[0]],[T_HIT,PLANT[0],easeOut],[T_HIT+.55,PLANT[0]-.4,easeOut]]);Z=key(T,[[S_T0,RUN_END[1]],[T_HIT,PLANT[1],easeOut],[T_HIT+.55,PLANT[1]+.2,easeOut]]);yaw=lerp(FACE_LEFT,YAW_SHOT,sm(S_T0,S_T0+.3,T));}
 else{const u=sm(T_HIT+.55,T_HIT+1.1,T,easeIO),go=sm(T_HIT+.7,C1.end,T,easeIO);pose=blendPose(strike(1,{foot:'l'}),celebrate((T-T_HIT-.55)*1.3,{kind:'run'}),u);
  X=lerp(PLANT[0]-.4,PLANT[0]+2.2,go);Z=lerp(PLANT[1]+.2,1.1,go);yaw=lerp(YAW_SHOT,yawTo(1,-1.1),u);}
 return{pose,yaw,X,Z};
};
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 if(T<T_L+.02){const b=flickBall(LF,T,liveN(T).X);return{...b,spin:T*8};}
 if(T<T_HIT){const n=liveN(Math.min(T,S_T0-.001)),ph=(((T-T_L)*2.3+.1)%1+1)%1,lead=.62+.22*easeOut(ph),ax=n.X+RUN_D[0]*lead,az=n.Z+RUN_D[1]*lead;
  const land=flickBall(LF,T_L+.02,0),w0=sm(T_L,T_L+.3,T),w=sm(S_T0-.3,T_HIT-.3,T,easeIO);
  return{X:lerp(lerp(land.X,ax,w0),SHOT[0],w),Y:BALL_R,Z:lerp(lerp(land.Z,az,w0),SHOT[1],w),flying:false,spin:T*14};}
 if(T<T_IN){const u=sm(T_HIT,T_IN,T,linear);return{X:lerp(SHOT[0],TGT[0],u),Y:BALL_R+(TGT[1]-BALL_R)*u+.1*Math.sin(Math.PI*u),Z:lerp(SHOT[1],TGT[2],u),flying:true,spin:20+u*40};}
 const d=sm(T_IN,T_IN+.25,T,easeOut),bo=Math.abs(Math.sin(sm(T_IN+.25,T_IN+1,T)*Math.PI*2))*.08*(1-sm(T_IN+.25,T_IN+1,T));
 return{X:lerp(TGT[0],GOAL_X-.7,d),Y:lerp(TGT[1],BALL_R,d)+bo,Z:TGT[2]-.05,flying:false,spin:60};
}
/** Spain (red): the marker (lunges, then turns and chases), two covering defenders, the pivot upfield */
const liveM:Gen=T=>{if(T<LF.tF+.8)return flickMarker(LF,T);const f=flickMarker(LF,LF.tF+.8),u=sm(LF.tF+.8,LF.tF+1.4,T,easeIO),n=liveN(Math.min(T,T_HIT)),tx=Math.max(n.X+2.6,f.X-12);
 const X=lerp(f.X,tx,sm(LF.tF+.8,T_HIT+.4,T,easeIO)),Z=lerp(f.Z,n.Z+1.9,sm(LF.tF+.8,T_HIT,T));
 return{pose:blendPose(f.pose,runCycle((T-LF.tF)*runCadence(.8),{speed:.8}),u*(1-sm(T_IN+.2,T_IN+.9,T))),yaw:lerp(FACE_RIGHT,FACE_LEFT,u),X,Z};};
type Mover={a:[number,number];b:[number,number];ph:number};
const SPAIN:Mover[]=[{a:[-5.6,7.4],b:[-11.6,6.1],ph:.2},{a:[-8.8,12.6],b:[-15.4,11.2],ph:.6},{a:[5.4,13.2],b:[1.2,12.2],ph:.4}];
const liveSpain=(i:number):Gen=>T=>{const m=SPAIN[i],u=sm(C1.neto-.4,T_HIT-.1,T,easeIO),post=sm(T_IN+.3,T_IN+1.3,T);let pose=backpedal(T*1.4+m.ph);
 if(i===0){const lu=key(T,[[T_HIT-.4,0],[T_HIT+.02,.6],[T_HIT+.6,1]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_HIT-.5,T_HIT-.35,T));}
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20}),post);
 return{pose,yaw:i===2?FACE_LEFT:FACE_RIGHT,X:lerp(m.a[0],m.b[0],u),Z:lerp(m.a[1],m.b[1],u)};};
/** Brazil's other four (yellow): they push up with him; after the goal they run to Neto */
const BRA_P:Mover[]=[{a:[4.2,9.2],b:[-6.4,9.6],ph:0},{a:[7.4,15.2],b:[-2.8,15.4],ph:.3},{a:[-8.6,13.8],b:[-14.6,14.2],ph:.6},{a:[9.8,6.2],b:[3.4,6.8],ph:.8}];
const liveBra=(i:number):Gen=>T=>{const m=BRA_P[i],u=sm(LF.tF,T_HIT,T,easeIO),go=sm(T_IN+.25,C1.end,T,easeIO),n=liveN(C1.end);
 const X0=lerp(m.a[0],m.b[0],u),Z0=lerp(m.a[1],m.b[1],u),X=lerp(X0,n.X+[1.3,-1.1,.3,1.9][i],go),Z=lerp(Z0,n.Z+[.9,1.5,2.2,.4][i],go);
 let pose=u>0&&u<1?runCycle(T*runCadence(.6)+m.ph,{speed:.6}):stand();if(go>0)pose=blendPose(pose,celebrate(T*1.1+i*.3,{kind:'run'}),sm(T_IN+.25,T_IN+.7,T));
 return{pose,yaw:go>0?yawTo(n.X-X0,n.Z-Z0):FACE_LEFT,X,Z};};
/** Juanjo: covers the near post as Neto comes down the wing, then a late dive toward the far post that does not reach it (inferred) */
const liveK:Gen=T=>{const dv=key(T,[[T_HIT-.04,0],[T_IN,.55],[T_IN+.7,.92]],linear),on=sm(T_HIT-.06,T_HIT+.02,T);let pose=blendPose(keeperSet(T*1.3),keeperDive(dv,{side:'l'}),on);
 pose=blendPose(pose,posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:14,neckP:44,lShA:12,rShA:12,lElb:30,rElb:30}),sm(T_IN+1.2,T_IN+2,T));
 return{pose,yaw:FACE_RIGHT,X:GOAL_X+.8,Z:lerp(10,9.1,sm(LF.tF,T_HIT-.3,T,easeIO))};};
const liveCam=(T:number)=>({x:key(T,mono([[0,2.2],[C1.neto,1],[LF.tF,-.4],[T_L+.6,-3.4],[S_T0,-10.8],[T_HIT,-12.2],[T_IN,-13.6],[T_IN+1.2,-13.2],[C1.end,-12.2]]),easeInOutSine),
 zoom:key(T,mono([[0,.6],[C1.neto,.7],[LF.tF+.3,.74],[S_T0,.68],[T_HIT,.64],[T_IN+.9,.7],[C1.end,.84]]),easeInOutSine),
 y:key(T,mono([[0,1180],[C1.neto,1330],[S_T0,1300],[T_IN,1180],[C1.end,1420]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_HIT,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.3*sm(C1.end-1.5,C1.end,T):.15,flash:pulse(T,T_IN,1.2),bulge:.5*sm(T_IN-.1,T_IN,T)*(1-.6*sm(T_IN+.2,T_IN+1.1,T))+.12*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:TGT[2],by:TGT[1],
  keeper:()=>{athlete(s,st,liveK,T,JUANJO,{detail:'low'});}});
 type It={z:number;draw:()=>void};const items:It[]=[];
 SPAIN.forEach((_,i)=>{const g=liveSpain(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i),{detail:'low'})});});
 items.push({z:liveM(T).Z,draw:()=>athlete(s,st,liveM,T,ESP(5),{detail:'low'})});
 BRA_P.forEach((_,i)=>{const g=liveBra(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,BRA(i),{detail:'low'})});});
 const fast=(T>LF.tF-.1&&T<LF.tF+.4)||(T>T_HIT-.2&&T<T_HIT+.25);
 items.push({z:liveN(T).Z,draw:()=>athlete(s,st,liveN,T,NETO,{smear:fast?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45);
  if(b.flying&&T>T_HIT){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_HIT,T-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.5,{seed:17,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying&&T>T_HIT?.5:0,dir:Math.atan2(-(TGT[2]-SHOT[1])*.2,-1)});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "Neto": a yellow ring under him; "last defender": it stays on while he is the deepest Brazil outfield player
 const ring=easeOutBack(sm(C1.neto,C1.neto+.35,T))*(1-sm(LF.tF-.2,LF.tF+.1,T));if(ring>.02){const n=liveN(T);floorDashRing(s,st,Y,n.X,n.Z,1.05,12,121,ring);}
 // "races down the wing": speed lines trail him
 if(T>C1.races&&T<S_T0){const n=liveN(T),p=proj(st,n.X,1.1,n.Z);speedLines(s,Y,p[0]+60,p[1],0,{n:5,seed:130+Math.floor(T*6),len:150,spread:70,width:7,cov:.9});}
 if(goal&&T<T_IN+1){const p=proj(st,TGT[0],.4,TGT[2]);sparkBurst(s,Y,p[0],p[1],110,{n:11,seed:141,g:easeOut(sm(T_IN,T_IN+.3,T))*(1-sm(T_IN+.6,T_IN+1,T))});}
}
/** Neto's chest in a take (the passage enters his yellow shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveN(tt),.14));},still:LF.tF+.3};

// ================= chapter 2 — REPLAY: slow motion, low and pitch-side: over the tackle, away; whip pan to the champions =================
const C2={watch:A(1,'Watch'),lifts:A(1,'lifts'),over:A(1,'over the'),away:A(1,'away'),three:A(1,'Three'),bra:A(1,'Brazil are'),end:AUTH[1].seconds};
const RF:Flick={XF:0,Z0:3.4,tF:C2.lifts+.3,s:2.5,v:.5};
const R_L=RF.tF+.6*RF.s,R_SW=C2.three+.12;// landing; the swap under the whip pan
const repN:Gen=t=>{
 if(t>=R_SW){const u=sm(R_SW,R_SW+.4,t,easeOut);return{pose:blendPose(celebrate(.1,{kind:'run'}),celebrate((t-R_SW)*1.05,{kind:'arms'}),u),yaw:FACE_CAMERA+.35,X:-14.3,Z:2.9};}
 if(t<R_L)return flickNeto(RF,t);
 const u=t-R_L;return{pose:blendPose(runCycle(.05,{speed:.75}),runCycle(.05+u*runCadence(.8)/2.2,{speed:.8}),sm(0,.4,u)),yaw:FACE_LEFT,X:RF.XF-HOP_X-u*1.5-.3*u*u,Z:RF.Z0-HOP_Z};
};
function repBall(t:number){if(t<R_L+.02)return flickBall(RF,t,repN(t).X);const n=repN(Math.min(t,R_SW-.001)),land=flickBall(RF,R_L+.02,0),w=sm(R_L,R_L+.5,t),ph=(((t-R_L)*1.2)%1+1)%1;
 return{X:lerp(land.X,n.X-.7-.2*easeOut(ph),w),Y:BALL_R,Z:lerp(land.Z,n.Z-.05,w),flying:false};}
const repM:Gen=t=>flickMarker(RF,t);
const repMate=(i:number):Gen=>t=>{const u=t-R_SW,a:[number,number]=i?[-17.6,5.2]:[-10.6,6.4],b:[number,number]=i?[-15.2,3.3]:[-13.4,3.6],w=sm(0,1.1,u,easeOut);
 return{pose:w<1?runCycle(u*runCadence(.8)+i*.4,{speed:.8}):celebrate(u*1.05+.3*i,{kind:'arms'}),yaw:yawTo(b[0]-a[0],b[1]-a[1]),X:lerp(a[0],b[0],w),Z:lerp(a[1],b[1],w)};};
const repCx=(t:number)=>key(t,mono([[0,.9],[RF.tF,-.4],[R_L,-1.4],[C2.away+.5,-3.3],[C2.three-.08,-3.8],[C2.three+.36,-14.2],[C2.end,-14.1]]),easeInOutSine);
const st2=(t:number):Stage=>({F:1500,eye:1.15,cx:repCx(t),cz:-2.5});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(tt),whip=sm(C2.three-.1,C2.three+.1,t)*(1-sm(C2.three+.3,C2.three+.5,t));
  camPath(s,t,[[0,-20,60,1.75],[RF.tF,-60,40,1.95],[C2.over,-100,30,1.95],[C2.away+.4,-200,60,1.7],[C2.three,-160,70,1.55],[C2.three+.5,0,40,1.45],[C2.bra,0,30,1.5],[C2.end,0,50,1.44]]);
  const cele=tt>=R_SW;
  arena0(s,st,tt,cele?1-.3*sm(C2.end-1,C2.end,tt):.2,pulse(tt,R_SW,1.2)+.6*pulse(tt,C2.bra,1.4));
  const items:{z:number;draw:()=>void}[]=[];
  if(!cele){
   items.push({z:repM(tt).Z,draw:()=>athlete(s,st,repM,tt,ESP(5),{detail:'high',smear:tt>RF.tF-.4&&tt<RF.tF+.6?.25:0})});
   const b=repBall(tt);items.push({z:b.Z-.02,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.1,r*.3,96,b.flying?.25:.45);ball(s,p[0],p[1],r,97,{rot:tt*3});}});
  }else{[0,1].forEach(i=>{const g=repMate(i);items.push({z:g(tt).Z,draw:()=>athlete(s,st,g,tt,BRA(i+1),{detail:'mid'})});});}
  items.push({z:repN(tt).Z,draw:()=>athlete(s,st,repN,tt,NETO,{detail:'high',smear:!cele&&tt>RF.tF-.3&&tt<R_L?.3:0})});
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(!cele){
   // "lifts it": a yellow ring round the ball on the toe; "over the tackle": the dashed arc of the ball and a red ring on the lunging boot
   const b=repBall(tt),bp=proj(st,b.X,b.Y,b.Z),br=kAt(st,b.Z)*BALL_R,lift=easeOutBack(sm(C2.lifts,C2.lifts+.3,tt))*(1-sm(C2.over+.3,C2.over+.7,tt));
   if(lift>.02)s.fill(Y,ribbon(blob(bp[0],bp[1],br*2.1*lift,br*2.1*lift,201,{n:22}),8,{seed:202,close:true,wobble:1}),1);
   if(tt>RF.tF&&tt<C2.away+.3){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=flickBall(RF,lerp(RF.tF,Math.min(tt,RF.tF+FLY*RF.s),k/14),0);pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,9,203,{dash:28});}
   const tk=easeOutBack(sm(C2.over,C2.over+.3,tt))*(1-sm(C2.away,C2.away+.4,tt));
   if(tk>.02){const m=repM(tt),sk=solve(m.pose,{height:1.76},placeAt(m.X,m.Z,m.yaw)),f=toMine(sk.rToe),p=proj(st,f[0],f[1],f[2]),rr=kAt(st,f[2])*.3*tk;const rp=ribbon(blob(p[0],p[1],rr,rr*.7,204,{n:20}),8,{seed:205,close:true,wobble:1});s.knockout(rp);s.fill(R,rp,1);}
   // "away": a yellow arrow on the floor ahead of him
   if(tt>C2.away-.1){const u=sm(C2.away-.1,C2.away+.5,tt,easeOut),n=repN(Math.min(tt,R_SW-.01)),pts:Pt[]=[];for(let k=0;k<=8;k++)pts.push(proj(st,n.X-.7-2*k/8,0,n.Z+.3));dashed(s,Y,pts,13,206,{dash:40,progress:u});if(u>.9)arrowHead(s,Y,pts,38,207);}
  }else{
   if(tt<R_SW+1.4){const n=repN(tt),p=proj(st,n.X,1.4,n.Z);sparkBurst(s,Y,p[0],p[1],260,{n:12,seed:208,g:easeOut(sm(R_SW,R_SW+.35,tt))*(1-sm(R_SW+.9,R_SW+1.4,tt))});}
   if(tt>=C2.bra-.2){const u=sm(C2.bra-.2,C2.bra+2.4,tt,linear),top=proj(st,-14,5,BOARDS)[1];confetti(s,[Y,B,'paper'],[-900,top-150+u*520,1800,420],26,Math.floor(tt*6),{size:16});}
  }
  // the whip pan: yellow speed streaks across the frame
  if(whip>.05)speedLines(s,Y,0,40,Math.PI,{n:9,seed:210+Math.floor(tt*12),len:700*whip,spread:420,width:12,cov:.85});
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2(tt),repN(tt),.12));},
 still:RF.tF+.55*RF.s,
};
/** the pitch-side low view uses the side court (goal at X = −20 far off to the left) */
function arena0(s:Sheet,st:Stage,t:number,cheer:number,flash:number){courtSide(s,st,t,{cheer,flash});}

// ================= chapter 3 — HOW HE DEFENDS (demonstration): the ball is lost upfield, he sprints back first, goal-side, stops it =================
const C3={how:A(2,'This is'),loses:A(2,'his team'),sprints:A(2,'sprints'),between:A(2,'gets between'),goal:A(2,'and the goal'),stops:A(2,'stops'),end:AUTH[2].seconds};
/** his goal is at X = −20 here (the side court); upfield is +X. The team-mate carries it up, the attacker steals it and runs at goal. */
const T_ST=C3.loses+.35,T_GO=T_ST+.2,T_AR=Math.max(C3.between+.2,T_GO+1.9),T_POKE=C3.stops+.1;
const N0:[number,number]=[3.9,13.4],NB:[number,number]=[-9.9,10.1],A0:[number,number]=[2.4,9.1],A_STOP:[number,number]=[-8.35,9.7];
/** the attacker: presses, steals it, turns for goal and dribbles at it; slows as Neto stands in the way; the poke takes it off him */
function atkPos(t:number):[number,number]{if(t<T_ST)return[A0[0]-.25*sm(0,T_ST,t),A0[1]];const u=sm(T_ST+.25,T_POKE,t,linear),e=Math.pow(u,.9);return[lerp(A0[0]-.25,A_STOP[0],e),lerp(A0[1],A_STOP[1],e)];}
const demoA:Gen=t=>{const[X,Z]=atkPos(t);let pose:Pose,yaw=FACE_LEFT;
 if(t<T_ST+.25){const lu=key(t,[[T_ST-.35,0],[T_ST,.6],[T_ST+.25,.9]],linear);pose=blendPose(backpedal(t*1.1),lunge(lu,{side:'l'}),sm(T_ST-.45,T_ST-.3,t));}
 else if(t<T_POKE){pose=blendPose(lunge(.9,{side:'l'}),dribble((t-T_ST)*1.7,{foot:'r',speed:.55}),sm(T_ST+.25,T_ST+.5,t));}
 else{const u=sm(T_POKE,T_POKE+.5,t,easeOut);pose=blendPose(dribble((T_POKE-T_ST)*1.7,{foot:'r',speed:.55}),posed({lHipF:30,rHipF:-10,lKnee:40,rKnee:30,lean:-6,pitch:-4,neckP:-10,neckY:40,lShA:50,rShA:50,lElb:40,rElb:40}),u);yaw=lerp(FACE_LEFT,FACE_LEFT+.9,u);}
 return{pose,yaw,X,Z};};
/** the team-mate: carries it up (+X), loses it, turns and jogs back */
const demoT:Gen=t=>{const X=lerp(.4,1.35,sm(0,T_ST,t,easeOut))-1.4*sm(T_ST+.5,C3.end,t,easeIO),Z=9.2;const turn=sm(T_ST+.2,T_ST+.9,t,easeIO);
 const pose=t<T_ST?dribble(t*1.5,{foot:'r',speed:.3}):blendPose(posed({lHipF:10,rHipF:-10,lKnee:30,rKnee:20,lean:-4,neckP:-10,lShA:30,rShA:30,lElb:30,rElb:30}),runCycle((t-T_ST)*runCadence(.4),{speed:.4}),turn);
 return{pose,yaw:lerp(FACE_RIGHT,FACE_LEFT,turn),X,Z};};
/** Neto's recovery run: from upfield (+X, far side) round the inside to goal-side of the ball, then a low ready stance facing it */
function netoRun(t:number):[number,number]{const u=sm(T_GO,T_AR,t,linear),e=u<.15?u*u/.3:u>.85?1-(1-u)*(1-u)/.3:u,E=(e-(.15/2))/(1-.15);const uu=clamp(E);
 const cx=lerp(N0[0],NB[0],uu),cz=lerp(N0[1],NB[1],uu)+1.2*Math.sin(Math.PI*uu);return[cx,cz];}
const demoN:Gen=t=>{let pose:Pose,yaw:number,X:number,Z:number;
 if(t<T_GO){[X,Z]=N0;pose=blendPose(stand(),posed({lHipF:14,rHipF:14,lKnee:22,rKnee:22,lean:10,neckP:6,lShA:18,rShA:18,lElb:34,rElb:34}),.5);yaw=yawTo(A0[0]-N0[0],A0[1]-N0[1]);}
 else if(t<T_AR){[X,Z]=netoRun(t);const a=netoRun(t-.05);yaw=yawTo(X-a[0],Z-a[1]);pose=blendPose(stand(),runCycle((t-T_GO)*runCadence(1),{speed:1}),sm(T_GO,T_GO+.2,t));if(t<T_GO+.25)yaw=lerp(yawTo(A0[0]-N0[0],A0[1]-N0[1]),yaw,sm(T_GO,T_GO+.25,t,easeIO));}
 else if(t<T_POKE-.35){[X,Z]=NB;const u=sm(T_AR,T_AR+.45,t,easeIO);pose=blendPose(runCycle((T_AR-T_GO)*runCadence(1),{speed:1}),backpedal((t-T_AR)*1.2),u);const a=netoRun(T_AR-.05);yaw=lerp(yawTo(NB[0]-a[0],NB[1]-a[1]),FACE_RIGHT,u);X=NB[0]-.35*u;}
 else{X=NB[0]-.35;Z=NB[1];const lu=key(t,[[T_POKE-.35,0],[T_POKE,.6],[T_POKE+.8,1]],linear);pose=blendPose(backpedal((t-T_AR)*1.2),lunge(lu,{side:'l'}),sm(T_POKE-.35,T_POKE-.2,t));yaw=FACE_RIGHT;
  pose=blendPose(pose,posed({lHipF:20,rHipF:20,lKnee:30,rKnee:30,lean:6,neckP:-6,lShA:40,rShA:40,lElb:40,rElb:40}),sm(T_POKE+.9,T_POKE+1.4,t));}
 return{pose,yaw,X,Z};};
/** the ball: on the team-mate's foot, stolen, on the attacker's right foot at goal, poked away toward the far touchline */
function demoBall(t:number):{X:number;Z:number;spin:number}{
 if(t<T_ST){const tm=demoT(t),ph=((t*1.5)%1+1)%1;return{X:tm.X+.45+.12*easeOut(ph),Z:tm.Z-.05,spin:t*6};}
 const[ax,az]=atkPos(Math.min(t,T_POKE)),ph=(((t-T_ST)*1.7)%1+1)%1,lead=.5+.14*easeOut(ph),w=sm(T_ST,T_ST+.4,t);
 const tm=demoT(T_ST),fromX=tm.X+.5,fromZ=tm.Z-.05,X=lerp(fromX,ax-lead,w),Z=lerp(fromZ,az+.1,w);
 if(t<T_POKE)return{X,Z,spin:t*8};
 const u=t-T_POKE,d=Math.min(4.2,u*4.5-u*u*.9);return{X:A_STOP[0]-.55+d*.55,Z:A_STOP[1]+.1+d*.8,spin:t*16};
}
const dst=(cx:number):Stage=>({F:3000,eye:5,cx,cz:-9});
const demoK:Gen=t=>({pose:keeperSet(t*1.2),yaw:FACE_RIGHT,X:GOAL_X+.9,Z:10+.4*Math.sin(t*.7)});
const d3cx=(t:number)=>{const n=demoN(t),b=demoBall(Math.min(t,T_POKE));return .5*(n.X+b.X);};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),cx=d3cx(t),st=dst(cx);
  cam(s,0,key(t,mono([[0,640],[T_AR,650],[C3.end,660]]),easeInOutSine),key(t,mono([[0,1.7],[T_GO+.4,1.3],[T_AR,1.12],[C3.goal+.3,1.12],[C3.stops,1.4],[C3.end,1.6]]),easeInOutSine));
  courtSide(s,st,tt,{cheer:0,keeper:()=>{athlete(s,st,demoK,tt,DEMO_K,{detail:'low'});}});
  const b=demoBall(tt),bp=proj(st,b.X,BALL_R,b.Z),br=Math.max(8,kAt(st,b.Z)*BALL_R);
  // "his team loses": a red ring where the ball is lost; "sprints back": his run line (yellow dashes, drawn as he runs)
  const lost=easeOutBack(sm(C3.loses,C3.loses+.35,tt))*(1-sm(C3.sprints,C3.sprints+.5,tt));if(lost>.02)floorDashRing(s,st,R,b.X,b.Z,.7,11,301,lost);
  if(tt>T_GO){const pts:Pt[]=[];for(let k=0;k<=16;k++){const q=netoRun(lerp(T_GO,Math.min(tt,T_AR),k/16));pts.push(proj(st,q[0],0,q[1]));}const fade=1-sm(C3.stops-.2,C3.stops+.3,tt);if(fade>.02){dashed(s,Y,pts,13,302,{dash:40});if(tt>T_AR-.3)arrowHead(s,Y,pts,38,303);}}
  // "gets between": the red danger line from the ball to the middle of the goal — he stands ON it; "and the goal": the goal mouth rings
  const on=sm(C3.between,C3.between+.4,tt,easeOut)*(1-sm(T_POKE+.3,T_POKE+.8,tt));
  if(on>.02){const bb=demoBall(Math.min(tt,T_POKE)),Xe=Math.max(GOAL_X,NB[0]-3.2),ue=(bb.X-Xe)/Math.max(.01,bb.X-GOAL_X),pts:Pt[]=[];for(let k=0;k<=10;k++)pts.push(proj(st,lerp(bb.X,GOAL_X,ue*k/10),0,lerp(bb.Z,10,ue*k/10)));dashed(s,R,pts,13,304,{dash:36,progress:on});
   const ga=sm(C3.goal,C3.goal+.3,tt)*(1-sm(T_POKE+.3,T_POKE+.8,tt));if(ga>.02)arrowHead(s,R,pts,44*ga,305);}
    const nr=Math.max(easeOutBack(sm(C3.how+.2,C3.how+.55,tt))*(1-sm(C3.loses,C3.loses+.4,tt)),easeOutBack(sm(C3.between+.1,C3.between+.45,tt))*(1-sm(C3.end-.6,C3.end-.2,tt)));const n=demoN(tt);if(nr>.02)floorDashRing(s,st,Y,n.X,n.Z,.65,11,306,nr);
  const items:{z:number;draw:()=>void}[]=[
   {z:demoT(tt).Z,draw:()=>athlete(s,st,demoT,tt,MATE,{detail:'mid'})},
   {z:demoA(tt).Z,draw:()=>athlete(s,st,demoA,tt,DEMO_A,{detail:'mid'})},
   {z:n.Z,draw:()=>athlete(s,st,demoN,tt,NETO,{detail:'mid',smear:tt>T_GO+.2&&tt<T_AR?.12:(tt>T_POKE-.2&&tt<T_POKE+.2?.15:0)})},
   {z:b.Z-.05,draw:()=>{shadow(s,bp[0],proj(st,b.X,0,b.Z)[1],br*1.15,br*.3,310,.45);ball(s,bp[0],bp[1],br,311,{rot:b.spin});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "sprints back": speed lines; "stops it": a spark at the poke and a blue tick beside him
  if(tt>T_GO+.3&&tt<T_AR-.1){const p=proj(st,n.X,1.1,n.Z);speedLines(s,Y,p[0]+40,p[1],-.1,{n:5,seed:320+Math.floor(tt*6),len:130,spread:60,width:7,cov:.9});}
  if(tt>=T_POKE&&tt<T_POKE+.6){const p=proj(st,A_STOP[0]-.5,.3,A_STOP[1]+.1);sparkBurst(s,Y,p[0],p[1],90,{n:9,seed:321,g:easeOut(sm(T_POKE,T_POKE+.3,tt))*(1-sm(T_POKE+.35,T_POKE+.6,tt))});}
  tick(s,st,n,easeOutBack(sm(T_POKE+.4,T_POKE+.75,tt)),330);
 },
 aperture(t0){const{tt,tc}=clock(2,t0);return aperture(chestPts(dst(d3cx(tc)),demoN(tt),.13));},
 still:T_AR+.3,
};
/** a big blue tick stamped beside a figure, with a navy misregistered echo */
function tick(s:Sheet,st:Stage,f:{X:number;Z:number},g:number,seed:number){if(g<=.02)return;const p=proj(st,f.X,0,f.Z),h=kAt(st,f.Z)*1.78,c:Pt=[p[0]+h*.55,p[1]-h*.95],S=h*.32*g,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
 const tp=ribbon(tk,S*.24,{seed,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:seed+1,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:seed+2,taper:.2,wobble:1}),.5);s.fill(B,tp);}

// ================= chapter 4 — YOUR TURN: the attacker's-eye view; he gets back behind the ball, between it and the goal =================
const C4={your:A(3,'Your'),when:A(3,'When'),loses:A(3,'loses'),always:A(3,'always'),behind:A(3,'behind'),end:AUTH[3].seconds};
const st4:Stage={F:1500,eye:2.3,cx:-2.3,cz:-2.4};
const P_A:[number,number]=[1.5,1.9],P_N0:[number,number]=[-1.6,.8],P_NB:[number,number]=[.72,6.9];
const T4_GO=C4.always-.05,T4_AR=Math.max(C4.behind-.05,T4_GO+1.3);
const lessonA:Gen=t=>{const z=P_A[1]+.9*sm(0,C4.behind,t,easeOut),slow=sm(T4_AR-.3,T4_AR+.4,t);return{pose:blendPose(dribble(t*1.3,{foot:'r',speed:.35}),stand(),slow),yaw:FACE_AWAY,X:P_A[0],Z:z};};
function lessonRun(t:number):[number,number]{const u=sm(T4_GO,T4_AR,t,easeIO);return[lerp(P_N0[0],P_NB[0],u)-.55*Math.sin(Math.PI*u),lerp(P_N0[1],P_NB[1],u)];}
const lessonN:Gen=t=>{const[X,Z]=lessonRun(t);let pose:Pose,yaw:number;
 if(t<T4_GO){pose=blendPose(stand(),backpedal(t*.8),.35);yaw=FACE_AWAY+.35;}
 else if(t<T4_AR){const a=lessonRun(t-.05);yaw=yawTo(X-a[0],Z-a[1]);pose=blendPose(stand(),runCycle((t-T4_GO)*runCadence(.95),{speed:.95}),sm(T4_GO,T4_GO+.2,t));}
 else{const u=sm(T4_AR,T4_AR+.5,t,easeIO);pose=blendPose(runCycle((T4_AR-T4_GO)*runCadence(.95),{speed:.95}),backpedal((t-T4_AR)*1.1),u);const a=lessonRun(T4_AR-.05);yaw=lerp(yawTo(P_NB[0]-a[0],P_NB[1]-a[1]),FACE_CAMERA,u);}
 return{pose,yaw,X,Z};};
const lessonBall=(t:number)=>{const a=lessonA(t),ph=((t*1.3)%1+1)%1;return{X:a.X-.08,Z:a.Z+.48+.12*easeOut(ph)*(1-sm(T4_AR-.3,T4_AR+.4,t))};};
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4;
  camPath(s,t,[[0,600,560,.95],[C4.loses+.3,620,540,.98],[C4.always,620,480,1],[T4_AR,700,360,1.16],[C4.end,700,340,1.22]]);
  arena(s,st,{t:tt,cheer:.6*pulse(tt,C4.behind+.3,1.4),tenMark:false});
  const b=lessonBall(tt),bp=proj(st,b.X,BALL_R,b.Z),br=kAt(st,b.Z)*BALL_R;
  // "loses the ball": a red ring round the ball (the other team has it); "always get back": his run line; "behind it": the ball-to-goal
  // line runs through him, a yellow ring round his feet and a blue tick
  const lost=easeOutBack(sm(C4.loses,C4.loses+.35,tt))*(1-sm(C4.always+.3,C4.always+.7,tt));if(lost>.02)floorDashRing(s,st,R,b.X,b.Z,.55,12,401,lost);
  if(tt>T4_GO){const pts:Pt[]=[];for(let k=0;k<=12;k++){const q=lessonRun(lerp(T4_GO,Math.min(tt,T4_AR),k/12));pts.push(proj(st,q[0],0,q[1]));}dashed(s,Y,pts,14,402,{dash:40});if(tt>T4_AR-.3)arrowHead(s,Y,pts,34,403);}
  const on=sm(C4.behind-.1,C4.behind+.35,tt,easeOut);if(on>.02){const pts:Pt[]=[];for(let k=0;k<=10;k++)pts.push(proj(st,lerp(b.X,0,k/10),0,lerp(b.Z,GZ,k/10)));dashed(s,R,pts,14,404,{dash:38,progress:on});}
  const n=lessonN(tt),nr=easeOutBack(sm(C4.behind,C4.behind+.35,tt));if(nr>.02)floorDashRing(s,st,Y,n.X,n.Z,.6,9,405,nr);
  const items:{z:number;draw:()=>void}[]=[
   {z:n.Z,draw:()=>athlete(s,st,lessonN,tt,NETO,{detail:'high',smear:tt>T4_GO+.2&&tt<T4_AR?.1:0})},
   {z:lessonA(tt).Z,draw:()=>athlete(s,st,lessonA,tt,DEMO_A,{detail:'high'})},
   {z:b.Z,draw:()=>{shadow(s,bp[0],proj(st,b.X,0,b.Z)[1],br*1.15,br*.3,410,.45);ball(s,bp[0],bp[1],br,411,{rot:tt*3});}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  tick(s,st,n,easeOutBack(sm(C4.behind+.35,C4.behind+.7,tt)),420);
 },
 still:C4.behind+.8,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'neto-futsal-signature',format:'futsal',title:'Neto, the last defender',theme:'When your team loses the ball, get back behind it.',
 ageNote:'For players aged 7–12: the 2012 World Cup final winner is real; the defending is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball drops and a yellow run-back arrow sweeps round behind it; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const fall=sm(0,.25,age,easeIn),by=y-150*(1-fall),u=clamp((age-.2)/.5);
  s.fill(K,polyPath(blob(x,y+r*.95,r*(.7+.3*fall),r*.2,seed+2,{n:16}),true),.32);
  if(u>0&&u<1){const pts:Pt[]=[];for(let k=0;k<=10;k++){const a=Math.PI*(.15+1.1*k/10*easeOut(u));pts.push([x+Math.cos(a)*r*2.2,y-r*.2+Math.sin(a)*r*1.3]);}const p=ribbon(pts,9*(1-u)+3,{seed,taper:.3,wobble:1});s.fill(Y,p,1);}
  ball(s,x,by,r,seed,{rot:age*4});
 },
};
export default film;
