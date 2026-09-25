/** Douglas Junior — "the fixo's thunder shot": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHO: the card "Douglas Junior" (lib/town/playerAppearance.json country Kazakhstan; playerProfiles/playerBios: "Brazilian-born fixo who
 * became a Kazakhstan international and a Kairat Almaty idol, known for powerful shooting from the back") is Douglas Júnior da Silva
 * Negreiros (born 15 Oct 1988, Guamaré, Brazil; ERA-PACK Chrudim 2010–14, AFC Kairat from 2014; Kazakhstan international from 2015). The
 * sources agree on the country (Kazakhstan) and the club (Kairat), so no namesake mix-up.
 *
 * WHY THIS MOMENT: his iconicPlays.json entry is a signature (the fixo's thunder shot, right foot, long range, centre), not one match. The
 * written sources we could reach give his goals as scorer + minute only; none describes HOW a single Douglas goal was scored. So the film
 * follows the brief's honest fallback: it opens on a REAL, documented Douglas goal in the biggest match of his career, showing ONLY
 * confirmed things (the semi-final, the teams, Douglas as Kazakhstan's fixo, his celebration with the scoreboard at Portugal 1–2
 * Kazakhstan) — the goal itself is NOT staged — then says "This is how he does it" and shows the thunder shot in a separate, labelled
 * demonstration (training kit, neutral defender and keeper, no match claimed).
 *  1  LIVE (broadcast camera, main stand): FIFA Futsal World Cup Lithuania 2021, SEMI-FINAL, 30 September 2021, 20:00, Žalgiris Arena,
 *     Kaunas (attendance 2,052): Portugal 2–2 Kazakhstan a.e.t., Portugal won 4–3 on penalties. Goals: Pany 23', Nurgozhin 40', DOUGLAS JR.
 *     42' (extra time, Kazakhstan 2–1 ahead), Bruno Coelho 49'. The teams at kick-off (Douglas the deepest Kazakhstan outfield player, the
 *     last defender); whip pan (a cut in time) to his celebration with the arena scoreboard at 1–2. The film does NOT say Kazakhstan won;
 *     it says they led 2–1 (true). No goal, pass or tackle of the match is staged.
 *  2  HOW HE DOES IT (a demonstration, real time, side-on; Douglas in a paper training top, neutral navy defender, red-screen keeper):
 *     a lay-off rolls into his path from the side (arrow), he steps in from deep (speed lines), plants his LEFT foot beside the ball and
 *     strikes through the middle with the LACES of his RIGHT foot — a straight, fast shot from about 12 m, the defender's block too late.
 *  3  WATCH AGAIN (slow motion, reverse angle: low, behind and to the right of him, the goal ahead): head over the ball (ring at the head,
 *     sight line), standing foot beside it (a footprint), laces (ring at the boot), through the middle (a crosshair on the ball, the
 *     straight flight line), follow through (the kicking foot's arc).
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Hit through the middle of the ball for a straight, powerful shot."): he strikes again;
 *     three cards (plant, middle, follow through); a tick.
 * Sources (written; fetched with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2021 FIFA Futsal World Cup" (raw; wiki-2021-futsal-wc.txt, cached by an earlier film): the semi-final above (date, time,
 *    venue, attendance 2,052, referee, scorers and minutes, the shoot-out: Douglas Jr. missed Kazakhstan's first kick); Kazakhstan fourth
 *    (lost the third-place match 2–4 to Brazil); Bronze Ball: Douglas Júnior (the tournament's third-best player); Kazakhstan Fair Play
 *    Trophy; Douglas Jr. 4 goals (v Costa Rica 14', v Venezuela 5', v Thailand 4', v Portugal 42'). — https://en.wikipedia.org/wiki/2021_FIFA_Futsal_World_Cup
 *  - Wikipedia (pt), "Copa do Mundo de Futsal da FIFA de 2021" (raw; ptwiki-2021-futsal-wc.txt, cached): the same semi-final result, scorers
 *    and Bronze Ball.
 *  - Wikipedia, "Douglas Júnior" (raw; wiki-douglas-junior-futsal.txt): full name, born 15 Oct 1988 Guamaré (Brazil); 1.80 m; ABC 2009,
 *    ERA-PACK Chrudim 2010–14, AFC Kairat 2014–; Kazakhstan national team 2015–; Futsal Champions League runner-up 2018–19. — https://en.wikipedia.org/wiki/Douglas_J%C3%BAnior
 *  - FIFA (inside.fifa.com), "Higuita: We brought the whole of Kazakhstan to a halt" (29 Sep 2021): Higuita calls Douglas "Iron Man",
 *    "the heart of our team", "the best player in the world … He scores goals, creates goals, wins possession back …, is impossible to get
 *    past, takes corners, hits volleys".
 *  - FIFA (inside.fifa.com), "Matchday 11 review: Argentina, Brazil and Kazakhstan reach quarters": "the Kazakhs' traditional yellow kit";
 *    Douglas "moving the ball up the pitch while remaining rock solid in defence". Its gallery photo (Getty/FIFA, Angel Martinez, viewed):
 *    "Douglas of Kazakhstan scores their team's second goal … v Thailand … September 23, 2021" — ALL-YELLOW kit (shirt, shorts, socks) with
 *    sky-blue trim, number 14 in sky blue, short dark hair, white-and-pink boots, the ball struck with his RIGHT foot; a BLUE court with a
 *    purple surround and red/magenta boards in the Kaunas arena.
 *  - Not found (searches blocked, 6 requests used): any written description of HOW the 42nd-minute goal was scored, or the kits worn in
 *    the semi-final.
 * CONFIRMED: the match, date, venue, round, the scorers/minutes and final 2–2 (4–3 pens), that Douglas's goal made it 2–1 to Kazakhstan in
 *  extra time; Kazakhstan finished fourth; Douglas won the Bronze Ball; 1.80 m; right-footed shooting (photo); the tournament's blue court.
 *  The narration only states: semi-final 2021 in Kaunas, Kazakhstan v Portugal, Douglas the fixo (the last defender), he scores in extra
 *  time, Kazakhstan lead 2–1 — then a labelled demonstration.
 * INFERRED (not named in the narration): the semi-final kits (Kazakhstan all yellow, sky-blue trim, No. 14 — as in the Thailand photo;
 *  Portugal red shirts, navy shorts, red socks; Portugal's keeper blue); every position in chapter 1; which end; where he celebrated; the
 *  scoreboard's look; the crowd's colours (sparse — 2,052 in a big arena). Chapters 2–4 (the lay-off, the run-up, the 12 m range, the plant,
 *  the target) are a demonstration of the technique, never a claimed goal. No video was reviewed.
 * Technique (poses): a fixo steps onto a rolling ball from deep; head and chest over the ball, the standing (left) foot planted beside it
 *  pointing at the target, ankle locked, toe down, the laces meet the MIDDLE of the ball (not under it → no lift, no spin: straight and
 *  fast), then a long follow-through toward the target, landing on the kicking foot.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the strike). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across); each stage maps
 *  it with a proper rotation (no mirror), so the right foot stays the right foot. Our stages are LEFT-handed (X right, Z away), so
 *  `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through the
 *  cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (Kazakhstan kit, lights, diagrams), red (Portugal, boards, the purple surround with blue), blue (the court), navy (key line,
 *  stands). Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–300 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,runCycle,runCadence,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2021 semi-final',text:'The 2021 Futsal World Cup semi-final, in Kaunas. Kazakhstan play Portugal. Douglas is Kazakhstan’s fixo, the last defender. In extra time, he scores, and Kazakhstan lead two one!',tail:2.4,
  cues:['The 2021','in Kaunas','Kazakhstan play','Douglas is','fixo','last defender','In extra','he scores','Kazakhstan lead','two one'],heads:{'The 2021':'Semi-final 2021','In extra':'Extra time','two one':'2–1'}},
 {label:'How he does it',text:'Fixos defend, but Douglas can shoot from far out too. This is how he does it: the ball rolls to him, he steps in and strikes. Boom!',tail:2.2,
  cues:['Fixos defend','shoot from far','This is how','ball rolls','steps in','strikes','Boom'],heads:{'Fixos defend':'The fixo','This is how':'How he does it','Boom':''}},
 {label:'Watch again',text:'Watch again, slowly. Head over the ball, standing foot beside it, laces through the middle, and follow through!',tail:2.2,
  cues:['Watch again','Head over','standing foot','laces through','middle','follow through'],heads:{'Watch again':'Slow motion','follow through':''}},
 {label:'Your turn',text:'Your turn: hit through the middle of the ball for a straight, powerful shot!',tail:2.6,
  cues:['Your turn','hit through','middle of','straight','powerful shot'],heads:{'Your turn':'Through the middle','powerful shot':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/douglas-junior-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/douglas-junior-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/douglas-junior-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('douglas: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('douglas: no cue '+w);return c.at;};
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
/** a dashed hand-drawn line, knocked out to paper first so the ink prints clean on the court */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
/** a yellow dashed line cased in navy (reads on the blue court) */
function cased(s:Sheet,pts:Pt[],width:number,seed:number,o:{dash?:number;progress?:number}={}){dashed(s,K,pts,width*1.8,seed,{...o,ko:false,cov:.9});dashed(s,Y,pts,width,seed,{...o});}
function casedHead(s:Sheet,pts:Pt[],size:number,seed:number){arrowHead(s,K,pts,size*1.35,seed,.9);arrowHead(s,Y,pts,size,seed);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);void seed;}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a hand-drawn ring (outline only) round a sheet point */
function ringAt(s:Sheet,ink:string,c:Pt,r:number,w:number,seed:number,cov=1){if(r<=1)return;s.fill(ink,ribbon(blob(c[0],c[1],r,r*.86,seed,{n:22}),w,{seed:seed+1,close:true,wobble:1}),cov);}

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
const SKIN:InkFill[]=[[Y,.78],[R,.24]];
const BUILD={height:1.8,bulk:1.06};
/** Douglas (match kit, chapter 1): Kazakhstan all yellow, sky-blue trim and No. 14 (as in the FIFA photo v Thailand; the semi-final kit is
 * inferred), short dark hair, white boots, 1.80 m */
const DOUG:AthleteStyle={shirt:Y,shorts:Y,socks:Y,boots:'paper',skin:SKIN,hair:K,line:K,trim:B,number:14,numberInk:B,hairStyle:'short',build:BUILD,seed:14};
/** Douglas (demonstration, chapters 2–4): a paper training top, navy shorts, yellow socks — no match is claimed */
const DOUG_T:AthleteStyle={shirt:'paper',shorts:K,socks:Y,boots:'paper',skin:SKIN,hair:K,line:K,trim:Y,hairStyle:'short',build:BUILD,seed:14};
const KAZ=(n:number):AthleteStyle=>({shirt:Y,shorts:Y,socks:Y,boots:K,skin:[[Y,.78],[R,.22]],hair:K,line:K,trim:B,hairStyle:(['short','bald','short'] as const)[n%3],build:{height:1.72+hash(n,3)*.12},seed:20+n});
const POR=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.76],[R,.24]],hair:K,line:K,trim:Y,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const POR_GK:AthleteStyle={shirt:B,shorts:K,socks:B,boots:K,skin:[[Y,.76],[R,.22]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:61};
/** the demonstration players: a neutral navy-screen defender and a red-screen keeper, no team is claimed */
const DEMO_D:AthleteStyle={shirt:[K,.6],shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:'paper',hairStyle:'curly',build:{height:1.8,bulk:1.05},seed:77};
const DEMO_GK:AthleteStyle={shirt:[R,.6],shorts:K,socks:[R,.6],boots:K,skin:[[Y,.78],[R,.22]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'bald',build:{height:1.8},seed:78};
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

// ---------------- the arena: the blue court with its purple surround, the boards, a sparse crowd, a futsal goal ----------------
/** stepped navy rows, lit faces, yellow (Kazakhstan) and red (Portugal) shirts in a sparse crowd (2,052), flags; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),yel=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3);
   // a sparse crowd: empty seats in clumps, fuller low down
   if(hash(Math.floor((x+off)/(gap*5))+r*53,8)>.62-r*.03)continue;
   const jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.3)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 // flags: Kazakhstan (sky blue with a yellow sun) and Portugal (red with a yellow disc), waving
 const blues=new Path2D(),suns=new Path2D();
 for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  const cloth=polyPath([pole(0,0),pole(.5,0),pole(1,0),pole(1,1),pole(.5,1),pole(0,1)],true);s.knockout(cloth);
  if(f%2)blues.addPath(cloth);else reds.addPath(cloth);
  const c=pole(.5,.5);suns.addPath(polyPath(blob(c[0],c[1],fh*.2,fh*.2,90+f,{n:12}),true));}
 s.fill(B,blues);s.fill(Y,heads,.6);s.fill(R,reds);s.fill(Y,yel);s.fill(Y,suns);
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
/** the floor: purple surround (red + blue) everywhere, then the court (u 0..uMax, v −10..10) in plain blue; a soft sheen band */
function floor(s:Sheet,st:Stage,fr:Frame,top:number,uMax:number){
 const span=9000,all=rectPath(-span,top,span*2,span);s.fill(B,all,.78);
 const edge=(a:[number,number],b:[number,number],n=16):Pt[]=>{const o:Pt[]=[];for(let k=0;k<=n;k++){const u=k/n,[X,Z]=toStage(fr,lerp(a[0],b[0],u),lerp(a[1],b[1],u));o.push(proj(st,X,0,Math.max(Z,st.cz+.5)));}return o;};
 const court=[...edge([0,-10],[uMax,-10]),...edge([uMax,-10],[uMax,10]),...edge([uMax,10],[0,10]),...edge([0,10],[0,-10])];
 s.fill(R,all,.42);
 s.save();s.clip(polyPath(court,true));s.knockout(rectPath(-span,top,span*2,span));s.fill(B,rectPath(-span,top,span*2,span),.8);s.restore();
}

// ---- SIDE court from the broadcast position (chapters 1–2): the goal at X = −20, the near touchline Z = 0, the far boards Z = 21 ----
const BOARDS=21.2,FA:Frame={ox:-20,oz:10,rot:0};
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
type CourtOpt={cheer?:number;flash?:number;bulge?:number;bv?:number;by?:number;keeper?:()=>void};
function courtSide(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 floor(s,st,FA,wall,40);
 const lines=new Path2D();courtLines(st,FA,lines,40);
 lines.addPath(polyPath(floorStrip(st,[[0,0],[0,20]],.05),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 // the boards: red panels and magenta (red + blue screen) panels, as in the Kaunas photo
 const ads=new Path2D(),mag=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.2,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.8,0,BOARDS)[0];(i%2?mag:ads).rect(x0,wall-board*.86,x1-x0,board*.66);}
 s.knockout(ads);s.knockout(mag);s.fill(R,ads,.9);s.fill(R,mag,.7);s.fill(B,mag,.45);
 s.fill(Y,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)),.7);
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,FA,bulge,bv,by);o.keeper?.();goalPosts(s,st,FA);
}
// ---- END-ON court (chapters 3–4): the camera sits low behind and to the right of the shooter and looks along +Z at the goal
//      (goal centre X = 0, Z = GZ); the frame is turned so the local u axis runs back toward the camera ----
const GZ=11,WALLZ=13.6,FB:Frame={ox:0,oz:GZ,rot:-Math.PI/2+.25};
function arena(s:Sheet,st:Stage,t:number,o:CourtOpt={}){
 const{cheer=0,flash=0,bulge=0,bv=0,by=1}=o,wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 floor(s,st,FB,wall,20);
 const lines=new Path2D();courtLines(st,FB,lines,13.4);s.knockout(lines,.92);
 s.knockout(rectPath(-span,wall-span,span*2,span));
 s.fill(K,rectPath(-span,wall-board,span*2,board),.85);
 const ads=new Path2D(),mag=new Path2D();for(let i=-12;i<12;i++){const x0=proj(st,i*2.6+.2,0,WALLZ)[0],x1=proj(st,i*2.6+2.4,0,WALLZ)[0];(i%2?mag:ads).rect(x0,wall-board*.86,x1-x0,board*.66);}
 s.knockout(ads);s.knockout(mag);s.fill(R,ads,.9);s.fill(R,mag,.7);s.fill(B,mag,.45);
 s.fill(Y,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)),.7);
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,FB,bulge,bv,by);o.keeper?.();goalPosts(s,st,FB);
}

// ================= the thunder shot (local frame): run-up, plant, laces through the middle, follow-through =================
const P0:[number,number]=[12.2,-.35];// where he strikes from (local u, v): about 12 m out, just left of centre
const TGT:V3=[-.1,.78,-.95];// straight and hard: a metre off the floor, inside the post (local u, y, v)
const YAW_S=yawTo(TGT[0]-P0[0],TGT[2]-P0[1]);
const DIR:[number,number]=[Math.cos(YAW_S),Math.sin(YAW_S)];
/** where the ball sits at the right-foot strike's contact (local, relative to the stance) */
const SB:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD,{yaw:YAW_S}),toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[toe[0]+d[0]/l*.07,-(toe[2]+d[1]/l*.07)];})();
const SHOT:[number,number]=[P0[0]+SB[0],P0[1]+SB[1]];
/** the plant foot beside the ball at contact (local) */
const PLANT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD,{yaw:YAW_S}),a=sk.lAn,t=sk.lToe;return[P0[0]+lerp(a[0],t[0],.5),P0[1]-lerp(a[2],t[2],.5)];})();
const RUN=4.2;// metres of run-up
type ShotT={pass0:number;run0:number;hit:number;from:[number,number]};
type Shot={dg:LGen;def:LGen;gk:LGen;ball:(t:number)=>{u:number;y:number;v:number;flying:boolean;spin:number};inn:number;s0:number};
const STRIKE_RATE=1.45;// strike phase per second (plant .22 → contact .52 ≈ .2 s)
function makeShot(T:ShotT):Shot{
 const s0=T.hit-STRIKE_CONTACT/STRIKE_RATE,inn=T.hit+.42;
 const ready=(t:number)=>{const b=Math.sin(t*5.2)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:26+8*b,rKnee:24+8*b,lHipA:10,rHipA:10,lean:14,neckP:10,neckY:-24,lShA:20,rShA:20,lElb:40,rElb:40});};
 const dg:LGen=t=>{
  let pose:Pose,d=0;
  if(t<T.run0)pose=ready(t);
  else if(t<s0){const u=sm(T.run0,s0,t,linear),speed=lerp(.25,.75,u),ph=(t-T.run0)*runCadence(.5);
   pose=blendPose(runCycle(ph%1,{speed,stride:.9}),strike(0,{foot:'r'}),sm(s0-.16,s0,t,easeIO));
   pose=blendPose(ready(t),pose,sm(T.run0,T.run0+.25,t,easeIO));
   pose={...pose,neckP:pose.neckP+.35};d=-RUN*(1-easeIn(u)*.35-u*.65);}
  else{const st=Math.min(1,(t-s0)*STRIKE_RATE*(t>T.hit?.7:1)+(t>T.hit?(T.hit-s0)*STRIKE_RATE*.3:0));pose=strike(st,{foot:'r'});
   const c=sm(inn+.35,inn+.95,t,easeIO);if(c>0){pose=blendPose(pose,celebrate((t-inn-.35)*1.1,{kind:'arms'}),c);}
   d=.35*sm(T.hit,T.hit+.7,t,easeOut);}
  const c=sm(inn+.35,inn+.95,t,easeIO);
  return{pose,yaw:YAW_S+c*1.2,u:P0[0]+DIR[0]*d,v:P0[1]+DIR[1]*d};};
 // the defender: goal side, steps out on the lay-off and sticks a leg out — too late
 const D0:[number,number]=[7.4,1.5];
 const def:LGen=t=>{
  const out=sm(T.pass0,T.hit-.3,t,easeOut),lu=sm(T.hit-.35,T.hit+.15,t,linear);
  let pose=backpedal(t*1.3);if(lu>0)pose=blendPose(pose,lunge(Math.min(.62,lu*.62),{side:'r'}),sm(T.hit-.35,T.hit-.2,t,easeIO));
  const late=sm(T.hit+.3,T.hit+1,t,easeIO);if(late>0)pose=blendPose(pose,posed({lHipF:14,rHipF:14,lKnee:24,rKnee:24,lean:10,neckY:-70,neckP:-4,lShA:30,rShA:30,lElb:40,rElb:40}),late);
  return{pose,yaw:yawTo(P0[0]-D0[0],P0[1]-D0[1])-late*1.8,u:D0[0]+1.3*out,v:D0[1]-.25*out};};
 const gk:LGen=t=>{const d=sm(T.hit+.08,T.hit+.5,t,linear);let pose=keeperSet(t*1.3);if(d>0)pose=keeperDive(Math.min(.95,.3+d*.65),{side:'r'});return{pose,yaw:0,u:.62,v:.1};};
 const ballF=(t:number)=>{
  if(t<T.pass0)return{u:T.from[0],y:BALL_R,v:T.from[1],flying:false,spin:0};
  if(t<T.hit){const u=sm(T.pass0,T.hit,t,(x:number)=>1-(1-x)*(1-x)*.55-(1-x)*.45);return{u:lerp(T.from[0],SHOT[0],u),y:BALL_R,v:lerp(T.from[1],SHOT[1],u),flying:false,spin:u*9};}
  if(t<inn){const u=sm(T.hit,inn,t,linear);return{u:lerp(SHOT[0],TGT[0],u),y:lerp(BALL_R,TGT[1],u)+Math.sin(u*Math.PI)*.12,v:lerp(SHOT[1],TGT[2],u),flying:true,spin:10+u*6};}
  const d=sm(inn+.05,inn+.35,t,easeIn),bo=Math.abs(Math.sin(sm(inn+.35,inn+1.1,t)*Math.PI*2))*.1*(1-sm(inn+.35,inn+1.1,t));
  return{u:-.66,y:lerp(TGT[1],BALL_R,d)+bo,v:TGT[2]+.05,flying:false,spin:16};};
 return{dg,def,gk,ball:ballF,inn,s0};
}
/** a ball drawn on stage st through frame fr, with its floor shadow (a flying ball smears back along its flight from the shot) */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:{u:number;y:number;v:number;flying:boolean;spin:number},seed:number,min=9){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R),o=fp(st,fr,SHOT[0],SHOT[1],BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?.6:0,dir:Math.atan2(p[1]-o[1],p[0]-o[0])});return{p,r};
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** his chest (the passage enters his shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
/** a joint on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:'head'|'rToe'|'rAn'|'lAn'|'lToe'|'chest'|'pelvis'|'rKn'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];
/** a footprint (the plant foot's spot) on the floor, pointing along the aim */
function footprint(s:Sheet,st:Stage,fr:Frame,u:number,v:number,g:number,seed:number){if(g<=.02)return;const pts:Pt[]=[];for(let i=0;i<14;i++){const a=i/14*TAU,lu=Math.cos(a)*.16*g,lv=Math.sin(a)*.07*g*(Math.cos(a)>0?1.1:.9);pts.push(fp(st,fr,u+lu*DIR[0]-lv*DIR[1],v+lu*DIR[1]+lv*DIR[0]));}
 const p=polyPath(pts,true);s.knockout(p);s.fill(Y,p);s.fill(K,ribbon([...pts,pts[0]],5,{seed,close:true,wobble:.6}),.9);}
/** a crosshair on the ball: through its middle */
function crosshair(s:Sheet,c:Pt,r:number,g:number,seed:number){if(g<=.02)return;const rr=r*(1.5+.4*(1-g));ringAt(s,R,c,rr,Math.max(5,r*.16),seed);
 const h=new Path2D();h.addPath(ribbon([[c[0]-rr*1.35,c[1]],[c[0]-rr*.55,c[1]]],Math.max(4,r*.12),{seed:seed+2,taper:0}));h.addPath(ribbon([[c[0]+rr*.55,c[1]],[c[0]+rr*1.35,c[1]]],Math.max(4,r*.12),{seed:seed+3,taper:0}));
 h.addPath(ribbon([[c[0],c[1]-rr*1.35],[c[0],c[1]-rr*.55]],Math.max(4,r*.12),{seed:seed+4,taper:0}));h.addPath(ribbon([[c[0],c[1]+rr*.55],[c[0],c[1]+rr*1.35]],Math.max(4,r*.12),{seed:seed+5,taper:0}));s.fill(R,h,g);
 s.fill(R,polyPath(blob(c[0],c[1],r*.2,r*.2,seed+6,{n:10}),true),g);}

// ================= chapter 1 — LIVE: the 2021 semi-final in Kaunas. Only confirmed things: the arena, the teams at kick-off, Douglas the fixo
// (the deepest Kazakhstan outfield player), then (cut) the celebration of his extra-time goal with the scoreboard at Portugal 1–2 Kazakhstan.
// No goal, pass or tackle of the match is staged. =================
const C1={kaunas:A(0,'in Kaunas'),kaz:A(0,'Kazakhstan play'),dg:A(0,'Douglas'),fixo:A(0,'fixo'),last:A(0,'last defender'),extra:A(0,'In extra'),scores:A(0,'he scores'),lead:A(0,'Kazakhstan lead'),two:A(0,'two one'),end:AUTH[0].seconds};
/** one whip pan (a cut in time): kick-off → the celebration of his goal (42', extra time, 1–2) */
const W0=C1.extra-.1,W1=W0+.3,WM=(W0+W1)/2;
/** kick-off (local u from Portugal's goal; halfway = 20): Kazakhstan (attacking u → 0) in their half, Douglas the deepest outfield player */
const KO_KAZ:[number,number][]=[[27.2,.4],[20.9,.8],[23.4,-5.4],[23.1,5.6]];// Douglas (fixo), pivot, right ala, left ala
const KO_POR:[number,number][]=[[18.4,-2.2],[16.2,4.6],[16.4,-5],[13.2,.3]];
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** the celebration after his goal (1–2): Douglas runs off, arms out; team-mates run in to him */
const CEL0:[number,number]=[8.2,-.6],CEL:[number,number]=[10.8,-4.2];
const CEL_IN:[number,number][]=[[15.2,1.2],[17.8,-4.6],[19.6,4.2]];
function kickoffGen(i:number,team:'kaz'|'por'):LGen{const p=(team==='kaz'?KO_KAZ:KO_POR)[i];return t=>({pose:idle(t,i+(team==='kaz'?0:.37)),yaw:team==='kaz'?Math.PI:0,u:p[0],v:p[1]});}
const liveD:LGen=T=>{
 if(T<WM)return kickoffGen(0,'kaz')(T);
 const go=sm(WM,C1.lead,T,easeOut),u=lerp(CEL0[0],CEL[0],go),v=lerp(CEL0[1],CEL[1],go);
 const pose=go<.97?celebrate((T-WM)*1.2,{kind:'run'}):celebrate((T-C1.lead)*1.1,{kind:'arms'});
 return{pose,yaw:go<.97?yawTo(CEL[0]-CEL0[0],CEL[1]-CEL0[1]):-Math.PI/2-.3+.3*Math.sin((T-WM)*1.3),u,v};};
const liveKaz=(i:number):LGen=>T=>{// i = 0..2: pivot, right ala, left ala
 if(T<WM)return kickoffGen(i+1,'kaz')(T);
 const d=liveD(T),a=CEL_IN[i],go=sm(WM,C1.two+.3,T,easeOut),tgt:[number,number]=[d.u+[1,-.9,1.2][i],d.v+[-1,-.8,.9][i]],u=lerp(a[0],tgt[0],go),v=lerp(a[1],tgt[1],go);
 return{pose:go<.95?celebrate((T-WM)*1.2+i*.3,{kind:'run'}):celebrate((T-WM)*1.1+i*.4,{kind:'arms'}),yaw:yawTo(d.u-u,d.v-v),u,v};};
const liveKazGK:LGen=T=>({pose:idle(T,2.2),yaw:Math.PI,u:39.2,v:0});
const livePor=(i:number):LGen=>T=>{if(T<WM)return kickoffGen(i,'por')(T);
 const base=[[5.4,1.6],[7.2,3.8],[3.4,-1.2],[14.6,2.4]][i] as [number,number];
 return{pose:posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:22,neckP:44,lShA:10,rShA:10,lElb:24,rElb:24}),yaw:i%2?.7:-.5,u:base[0],v:base[1]};};
const liveGK:LGen=T=>T<WM?{pose:keeperSet(T*1.3),yaw:0,u:.7,v:0}:{pose:posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:30,neckP:50,lShA:12,rShA:12,lElb:30,rElb:30}),yaw:.4,u:.9,v:-.6};
const liveCam=(T:number)=>({x:key(T,mono([[0,-.5],[C1.kaz,.2],[C1.dg,3.4],[C1.fixo,4.6],[C1.last,4.2],[W0,4],[W1,-8.6],[C1.scores,-8.8],[C1.lead,-8.4],[C1.end,-8.2]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.kaz,.6],[C1.dg+.2,.88],[C1.fixo,.98],[C1.last,.82],[W0,.8],[W1,.84],[C1.scores,.92],[C1.two,1.02],[C1.end,1.08]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.dg+.2,1000],[C1.last,1020],[W1,990],[C1.two,960],[C1.end,950]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'0':[0,1,2,4,5,6],'1':[2,5],'2':[0,2,3,4,6]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
/** Portugal (team 1, red tab) 1 – 2 Kazakhstan (yellow tab) */
function scoreboard(s:Sheet,st:Stage,camX:number,score:string,g:number){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=H*.62,y=top-H+H*.19;
 const tabs=(ink:string,x:number)=>{const p=new Path2D();p.rect(x,top-H+H*.06,W*.16,H*.07);s.fill(ink,p);};tabs(R,cx-W*.38);tabs(Y,cx+W*.22);digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);
 const right=new Path2D();digit(right,score[2],cx+W*.3-h*.55,y,h);s.knockout(lit);s.knockout(right);s.fill(Y,lit);s.fill(Y,right);if(g>.02)s.fill(R,right,.45*g);
}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const phase=T<WM?0:1;
 courtSide(s,st,T,{cheer:phase===0?.1:.95,flash:phase===1?pulse(T,WM,1.2)+.6*pulse(T,C1.two,1.2):0,
  keeper:()=>{athlete(s,st,FA,liveGK,T,POR_GK,{detail:'low'});}});
 if(phase>0)scoreboard(s,st,c.x,'1-2',pulse(T,C1.two,1.4));
 const items:Item[]=[];
 KO_POR.forEach((_,i)=>{const g=livePor(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,POR(i),{detail:'low'})});});
 [0,1,2].forEach(i=>{const g=liveKaz(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,KAZ(i),{detail:'low'})});});
 if(phase===0)items.push({z:depth(FA,liveKazGK(T)),draw:()=>athlete(s,st,FA,liveKazGK,T,{...POR_GK,shirt:[R,.55],socks:[R,.55],seed:62},{detail:'low'})});
 items.push({z:depth(FA,liveD(T))-.02,draw:()=>athlete(s,st,FA,liveD,T,DOUG,{detail:'mid'})});
 if(phase===0)items.push({z:10,draw:()=>{drawBallL(s,st,FA,{u:20,y:BALL_R,v:0,flying:false,spin:0},18);}});
 // "fixo": a dashed ring under him; "last defender": a dashed line across the court at his depth — only the keeper behind him
 if(phase===0){const l=liveD(T),[X,Z]=toStage(FA,l.u,l.v),g=easeOutBack(sm(C1.fixo,C1.fixo+.35,T))*(1-sm(W0-.3,W0,T));if(g>.02)items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.15,22,50,g);floorDashRing(s,st,Y,X,Z,1.15,14,51,g);}});
  const ln=sm(C1.last,C1.last+.6,T,easeOut)*(1-sm(W0-.3,W0,T));if(ln>.02)items.push({z:21,draw:()=>{cased(s,[fp(st,FA,l.u+.9,-9.6),fp(st,FA,l.u+.9,0),fp(st,FA,l.u+.9,9.6)],14,52,{dash:60,progress:ln});}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // the whip pan: yellow speed lines sweep across the frame (a cut in time)
 if(Tc>=W0&&Tc<W1){const u=sm(W0,W1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,0,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
 // "he scores": a burst over his head as the scoreboard lights 1–2
 if(phase===1){const l=liveD(T),h=jointPt(st,FA,l,'head'),g=easeOut(sm(C1.scores,C1.scores+.3,T))*(1-sm(C1.scores+.9,C1.scores+1.3,T));if(g>.02)sparkBurst(s,Y,h[0],h[1]-40,160,{n:11,seed:70,g});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FA,liveD(tt),.14));},still:C1.last+.3};

// ================= chapter 2 — HOW HE DOES IT (demonstration, real time, side-on): the lay-off, the run-up, plant, laces, straight and fast =================
const C2={fixos:A(1,'Fixos'),far:A(1,'shoot from'),how:A(1,'This is'),rolls:A(1,'ball rolls'),steps:A(1,'steps in'),strikes:A(1,'strikes'),boom:A(1,'Boom'),end:AUTH[1].seconds};
const T2:ShotT={pass0:C2.rolls,run0:C2.steps-.3,hit:C2.strikes+.15,from:[15.4,-6.4]};
const shot2=makeShot(T2);
const st2:Stage={F:3400,eye:2.4,cx:-14,cz:-6};
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2,inn=shot2.inn,hit=pulse(t,T2.hit,.35);
  const dgX=(tt2:number)=>{const l=shot2.dg(tt2);return(toStage(FA,l.u,l.v)[0]-st.cx)*kAt(st,10);};
  camPath(s,t,[[0,dgX(0)-60,340,1.45],[C2.fixos+.3,dgX(0)-80,340,1.5],[C2.far,60,380,.62],[C2.how,420,370,.72],[C2.rolls,dgX(C2.rolls)-300,360,.95],[C2.steps,dgX(C2.steps)-220,350,1.08],[T2.hit,dgX(T2.hit)-520,360,.82],[inn,-900,360,.86],[C2.boom,-1150,340,1.12],[C2.boom+.7,-1100,340,1.1],[C2.end-.5,dgX(C2.end)-60,330,1.3],[C2.end,dgX(C2.end)-60,330,1.32]],[6*hit*Math.sin(t*80),0]);
  const goal=tt>=inn;
  courtSide(s,st,tt,{cheer:goal?.6:0,flash:pulse(tt,inn,1.2),bulge:.55*sm(inn-.1,inn,tt)*(1-.6*sm(inn+.3,inn+1.2,tt))+.1*settle(tt,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FA,shot2.gk,tt,DEMO_GK,{detail:'mid'});}});
  const d=shot2.dg(tt),[,DZ]=toStage(FA,d.u,d.v);
  // "Fixos defend": a dashed ring under him (the fixo); "shoot from far": the long dashed line from his spot to the goal
  const fx=easeOutBack(sm(C2.fixos,C2.fixos+.35,tt))*(1-sm(C2.far,C2.far+.3,tt));
  if(fx>.02){const[X,Z]=toStage(FA,d.u,d.v);floorDashRing(s,st,K,X,Z,.9,18,201,fx);floorDashRing(s,st,Y,X,Z,.9,11,202,fx);}
  const fa=sm(C2.far,C2.far+.7,tt,easeOut)*(1-sm(C2.rolls,C2.rolls+.3,tt));
  if(fa>.02){const pts=[fp(st,FA,P0[0]+.2,P0[1]),fp(st,FA,lerp(P0[0],1,.5),lerp(P0[1],TGT[2],.5)),fp(st,FA,1,TGT[2])];cased(s,pts,12,203,{dash:44,progress:fa});if(fa>.9)casedHead(s,pts,34,204);}
  // "the ball rolls to him": a dashed arrow along the lay-off's path; "he steps in": speed lines behind him
  const rl=sm(C2.rolls-.1,C2.rolls+.5,tt,easeOut)*(1-sm(T2.hit-.3,T2.hit,tt));
  if(rl>.02){const pts=[fp(st,FA,T2.from[0],T2.from[1]),fp(st,FA,lerp(T2.from[0],SHOT[0],.5)+.3,lerp(T2.from[1],SHOT[1],.5)),fp(st,FA,SHOT[0]+.2,SHOT[1]-.35)];cased(s,pts,10,205,{dash:34,progress:rl});if(rl>.9)casedHead(s,pts,30,206);}
  const sl=sm(C2.steps,C2.steps+.2,tt)*(1-sm(T2.hit-.05,T2.hit+.15,tt));
  if(sl>.02){const c=jointPt(st,FA,d,'pelvis'),dir=Math.atan2(fp(st,FA,0,0)[1]-fp(st,FA,DIR[0],DIR[1])[1],fp(st,FA,0,0)[0]-fp(st,FA,DIR[0],DIR[1])[0]);speedLines(s,Y,c[0]+Math.cos(dir)*60,c[1]-20,dir,{n:6,seed:208,len:220*sl,spread:150,width:10,cov:.85});}
  // the shot line (dashed yellow) as the ball goes: straight
  if(tt>T2.hit){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=shot2.ball(lerp(T2.hit,Math.min(tt,inn),k/10));pts.push(fp(st,FA,q.u,q.v,q.y));}cased(s,pts,10,207,{dash:36});}
  const b=shot2.ball(tt);
  const items:Item[]=[
   {z:depth(FA,shot2.def(tt)),draw:()=>athlete(s,st,FA,shot2.def,tt,DEMO_D,{detail:'mid'})},
   {z:DZ-.001,draw:()=>athlete(s,st,FA,shot2.dg,tt,DOUG_T,{detail:'high',smear:tt>T2.hit-.14&&tt<T2.hit+.18?.12:0})},
   {z:depth(FA,b)-(tt<T2.hit?.3:0),draw:()=>{drawBallL(s,st,FA,b,211);if(tt>=T2.hit&&tt<T2.hit+.35){const p=fp(st,FA,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],120,{n:9,seed:212,g:easeOut(sm(T2.hit,T2.hit+.25,tt))});}}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=inn&&tt<inn+1.2){const p=fp(st,FA,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],150,{n:12,seed:230,g:easeOut(sm(inn,inn+.3,tt))*(1-sm(inn+.8,inn+1.2,tt))});}
  const bm=easeOut(sm(C2.boom,C2.boom+.3,tt))*(1-sm(C2.boom+.8,C2.boom+1.2,tt));if(bm>.02&&C2.boom>inn+.1){const p=fp(st,FA,-.4,TGT[2],1.1);sparkBurst(s,R,p[0],p[1],220,{n:14,seed:231,g:bm});}
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2,FA,shot2.dg(tt),.13));},
 still:C2.rolls+.3,
};

// ================= chapter 3 — WATCH AGAIN (slow-motion replay, reverse angle: low, behind and right of him, the goal ahead) =================
const C3={watch:A(2,'Watch'),head:A(2,'Head over'),stand:A(2,'standing'),laces:A(2,'laces'),mid:A(2,'middle'),fol:A(2,'follow'),end:AUTH[2].seconds};
/** the replay re-uses the chapter 2 sequence, slowed and keyed to the words (sequence time = seq(t)) */
const seq3=(t:number)=>key(t,mono([[0,shot2.s0-.5],[C3.head,shot2.s0-.14],[C3.stand,shot2.s0+.15],[C3.laces,shot2.s0+.27],[C3.mid,T2.hit-.02],[C3.fol,T2.hit+.2],[C3.fol+1.2,shot2.inn+.3],[C3.end,shot2.inn+1.2]]),linear);
const g3=(g:LGen):LGen=>t=>g(seq3(t));
const dg3=g3(shot2.dg),def3=g3(shot2.def),gk3=g3(shot2.gk);
const P0B=toStage(FB,P0[0],P0[1]);
const st3:Stage={F:2100,eye:1.4,cx:P0B[0]+1.6,cz:P0B[1]-6.2};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,q=seq3(tt),inn=shot2.inn,hit=pulse(q,T2.hit,.4);
  camPath(s,t,[[0,-380,120,.9],[C3.head,-470,40,1.04],[C3.stand,-450,220,1.04],[C3.laces,-450,210,1.04],[C3.mid,-400,200,.96],[C3.fol,-300,120,.84],[C3.fol+1,-220,60,.84],[C3.end,-220,60,.86]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  const goal=q>=inn;
  arena(s,st,tt,{cheer:goal?.8:0,flash:goal?pulse(q,inn,1.2):0,bulge:.6*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q))+.1*settle(q,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FB,gk3,tt,DEMO_GK,{detail:'mid'});}});
  const d=dg3(tt),[,DZ]=toStage(FB,d.u,d.v),b=shot2.ball(q);
  // the straight flight line on "middle"
  if(q>T2.hit){const pts:Pt[]=[];for(let k=0;k<=10;k++){const bb=shot2.ball(lerp(T2.hit,Math.min(q,inn),k/10));pts.push(fp(st,FB,bb.u,bb.v,bb.y));}cased(s,pts,12,303,{dash:40});}
  const pf=easeOutBack(sm(C3.stand,C3.stand+.3,tt))*(1-sm(C3.fol,C3.fol+.4,tt));footprint(s,st,FB,PLANT[0],PLANT[1],pf,305);
  const items:Item[]=[
   {z:depth(FB,def3(tt)),draw:()=>athlete(s,st,FB,def3,tt,DEMO_D,{detail:'mid'})},
   {z:DZ-.001,draw:()=>athlete(s,st,FB,dg3,tt,DOUG_T,{detail:'high',smear:q>T2.hit-.2&&q<T2.hit+.25?.4:0})},
   {z:depth(FB,b)-(q<T2.hit?.3:0),draw:()=>{const{p,r}=drawBallL(s,st,FB,b,311,10);if(q>=T2.hit&&q<T2.hit+.35){sparkBurst(s,Y,p[0],p[1],120,{n:9,seed:312,g:easeOut(sm(T2.hit,T2.hit+.25,q))});}
    // "middle": a crosshair on the ball's middle, just before and at contact
    const cr=easeOutBack(sm(C3.mid-.35,C3.mid,tt))*(1-sm(C3.fol-.1,C3.fol+.2,tt));crosshair(s,p,r,cr,321);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "Head over the ball": a red ring round his head and a dashed sight line to the ball; "laces": a ring round the boot
  const ey=easeOutBack(sm(C3.head,C3.head+.35,tt))*(1-sm(C3.laces,C3.laces+.3,tt));
  if(ey>.02){const h=jointPt(st,FB,d,'head'),bp=fp(st,FB,b.u,b.v,b.y);ringAt(s,R,h,kAt(st,DZ)*.24*ey,10,331);dashed(s,R,[h,L2(h,bp,.5),bp],7,332,{dash:26,progress:ey});}
  const lc=easeOutBack(sm(C3.laces,C3.laces+.3,tt))*(1-sm(C3.mid+.1,C3.mid+.4,tt));if(lc>.02){const a=jointPt(st,FB,d,'rAn'),to=jointPt(st,FB,d,'rToe');ringAt(s,R,L2(a,to,.5),kAt(st,DZ)*.2*lc,10,333);}
  // "follow through": the kicking foot's arc
  const fo=sm(C3.fol,C3.fol+.6,tt,easeOut)*(1-sm(C3.end-.8,C3.end-.3,tt));
  if(fo>.02){const pts:Pt[]=[];for(let k=0;k<=10;k++){const ph=lerp(.42,.74,k/10),l={...d,pose:strike(ph,{foot:'r'})};pts.push(jointPt(st,FB,l,'rToe'));}cased(s,pts,11,334,{dash:30,progress:fo});if(fo>.9)casedHead(s,pts,30,335);}
  if(q>=inn&&q<inn+1.2){const p=fp(st,FB,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:330,g:easeOut(sm(inn,inn+.3,q))*(1-sm(inn+.8,inn+1.2,q))});}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,FB,dg3(tt),.13));},
 still:C3.laces+.25,
};

// ================= chapter 4 — YOUR TURN: he strikes again; three cards (plant, middle, follow through); a tick =================
const C4={your:A(3,'Your'),hit:A(3,'hit through'),mid:A(3,'middle of'),str:A(3,'straight'),pow:A(3,'powerful'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,shot2.s0-.6],[C4.hit,shot2.s0],[C4.mid,T2.hit],[C4.str,shot2.inn],[C4.end,shot2.inn+1.6]]),linear);
const g4=(g:LGen):LGen=>t=>g(seq4(t));
const dg4=g4(shot2.dg),def4=g4(shot2.def),gk4=g4(shot2.gk);
const st4:Stage={F:1700,eye:2,cx:P0B[0]+1.4,cz:P0B[1]-6.4};
const CARD_Y=760,CARD_W=175,CARDS:[number,number,'plant'|'middle'|'follow'][]=[[-420,C4.hit,'plant'],[0,C4.mid,'middle'],[420,C4.pow,'follow']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,q=seq4(tt),inn=shot2.inn;
  camPath(s,t,[[0,-200,140,.96],[C4.your+.4,-150,310,.92],[C4.str,-150,310,.92],[C4.pow+.4,-150,300,.92],[C4.end,-150,295,.93]]);
  const goal=q>=inn;
  arena(s,st,tt,{cheer:goal?.9*(1-sm(C4.end-1,C4.end,tt)):0,flash:goal?pulse(q,inn,1.2):0,bulge:.55*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q)),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FB,gk4,tt,DEMO_GK,{detail:'mid'});}});
  const d=dg4(tt),[,DZ]=toStage(FB,d.u,d.v),b=shot2.ball(q);
  if(q>T2.hit){const pts:Pt[]=[];for(let k=0;k<=10;k++){const bb=shot2.ball(lerp(T2.hit,Math.min(q,inn),k/10));pts.push(fp(st,FB,bb.u,bb.v,bb.y));}cased(s,pts,11,401,{dash:40});}
  const items:Item[]=[
   {z:depth(FB,def4(tt)),draw:()=>athlete(s,st,FB,def4,tt,DEMO_D,{detail:'mid'})},
   {z:DZ-.001,draw:()=>athlete(s,st,FB,dg4,tt,DOUG_T,{detail:'high',smear:q>T2.hit-.15&&q<T2.hit+.2?.2:0})},
   {z:depth(FB,b)-(q<T2.hit?.3:0),draw:()=>{drawBallL(s,st,FB,b,411,10);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Your turn"; each prints its step as it is said (plant, middle, follow through)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(B,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+150;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+(kind==='follow'?-30:10),y:gy+25,height:330*(.9+.1*on),azimuth:kind==='plant'?60:kind==='middle'?0:20,elevation:12,fov:18,at:[0,0,0]});
    const pose=strike(kind==='plant'?.24:kind==='middle'?STRIKE_CONTACT:.74,{foot:'r'});
    const csk=solve(pose,BUILD,{}),P=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    const tb:V3=[csk.rToe[0]+.08,BALL_R,csk.rToe[2]],bR=BALL_R*(fc.scale?fc.scale(tb):100);
    if(kind==='plant'){const pl:V3=[csk.lAn[0],0,csk.lAn[2]],p=P(pl);s.fill(Y,polyPath(blob(p[0],p[1],34*on,12*on,84,{n:14}),true));const bp=P([pl[0]+.25,BALL_R,pl[2]+.2]);ball(s,bp[0],bp[1],bR,81);}
    if(kind==='middle'){const p0=P(tb);ball(s,p0[0],p0[1],bR,82);crosshair(s,p0,bR,on,86);}
    if(kind==='follow'){const b0=P([csk.rToe[0]+.9,.6,csk.rToe[2]]),p1=P([csk.rToe[0]+2.4,.7,csk.rToe[2]]),pts:Pt[]=[P([csk.rToe[0]+.2,.4,csk.rToe[2]]),b0,p1];dashed(s,Y,pts,8,87,{dash:22});arrowHead(s,Y,pts,24,88);ball(s,p1[0],p1[1],bR*.9,83);}
    drawAthlete(s,pose,fc,{...DOUG_T,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    s.restore();});
   s.fill(K,frames);}
  // "powerful shot": a big tick (yellow over red, navy echo) stamps beside him
  const tick=easeOutBack(sm(C4.pow+.35,C4.pow+.7,tt));
  if(tick>.02){const g=fp(st,FB,d.u,d.v),h=kAt(st,DZ)*1.8,c:Pt=[g[0]+h*.62,g[1]-h*.8],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.mid+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'douglas-junior-futsal-signature',format:'futsal',title:'Douglas Junior’s thunder shot',theme:'Hit through the middle of the ball for a straight, powerful shot.',
 ageNote:'For players aged 7–12: the 2021 semi-final and Douglas’s goal are real; the shot is shown as a demonstration. Keep your head over the ball.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball; a boot-flash and a straight yellow shot streak fire out of it; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const go=sm(.1,.45,age,easeOut),bx=x+220*go;
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32*(1-go*.6));
  const st=sm(.1,.5,age,easeOut)*(1-sm(.8,1.2,age));if(st>.02){const pts:Pt[]=[[x-r*.4,y],[bx-r*.8,y]];s.fill(Y,ribbon(pts,r*.7*st,{seed,taper:.6,wobble:1}),1);s.fill(R,ribbon(pts.map(p=>[p[0],p[1]+6] as Pt),r*.2*st,{seed:seed+1,taper:.6,wobble:1}),.6);}
  ball(s,bx,y,r,seed,{rot:go*4,smear:go<1?.4*(1-go):0,dir:0});
  if(age<.3)sparkBurst(s,Y,x-r*.6,y,r*1.4,{n:8,seed:seed+3,g:easeOut(sm(0,.25,age))});
 },
};
export default film;
