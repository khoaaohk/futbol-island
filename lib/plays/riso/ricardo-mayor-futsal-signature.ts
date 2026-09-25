/** Ricardo Mayor — "the interception and quick counter": a signature-move riso film (iconic plays, FUTSAL fixo / ala-cierre).
 *
 * WHY THIS STRUCTURE: Ricardo Mayor's entry (lib/town/iconicPlays.json) is a signature — win the ball, counter fast — not one match. No
 * written source we could reach describes ONE dated Mayor interception (he has no Wikipedia page in en/es; UEFA's match report names the
 * goals, not interceptions), so the film follows the brief's fallback. The real-match chapter stages NO play: it shows only confirmed
 * things from a final Mayor won — the UEFA Futsal EURO 2026 final, Portugal 3–5 Spain, 7 Feb 2026, Arena Stožice, Ljubljana — the arena,
 * the 5–3 result and Spain's celebration with Mayor (no. 3, in the matchday squad as a substitute) among them. His move is then a
 * separate, clearly labelled DEMONSTRATION ("Watch how he does it") in training kit, no match claimed.
 *  1  LIVE (broadcast camera, main stand): the final is won; Spain's players and substitutes celebrate into a huddle, Portugal's
 *     heads drop, confetti; the camera finds Mayor, no. 3, jumping with them.
 *  2  HOW HE DOES IT (demonstration, training bibs): he guards the back, reads the pass, steps in front, cuts it out, looks up and
 *     passes forward fast to a running team-mate while the two attackers are caught up-court.
 *  3  THE LESSON (entry `lesson`: "After you win the ball, pass forward fast before they get back."): win it, pass forward, a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - UEFA.com, "Finale UEFA Futsal EURO 2026: Portogallo - Spagna 3-5" (7 Feb 2026; uefa-futsaleuro-2026-final-en.txt):
 *    https://www.uefa.com/futsaleuro/news/02a2-1fdf1b047fd6-346089e7ed31-1000--finale-uefa-futsal-euro-2026-portogallo-spagna-3-5/
 *    — Spain win 5–3 at the Arena Stožice, their eighth title; line-ups incl. "Spagna: … Chemi (GK), Cecilio, Ricardo Mayor …".
 *  - Wikipedia, "UEFA Futsal Euro 2026 final" (raw; wiki-futsal-euro-2026-final.txt): Portugal 3–5 Spain, 7 Feb 2026, attendance 8,126;
 *    line-ups with numbers: Spain DF 3 Ricardo Mayor (substitute); Portugal GK 12 Bernardo Paçó. https://en.wikipedia.org/wiki/UEFA_Futsal_Euro_2026_final
 *  - Wikipedia (es), "Selección de fútbol sala de España" (raw; eswiki-seleccion-futsal-espana.txt): Euro 2026 squad — dorsal 3 "Ricardo",
 *    ala-cierre, 25, ElPozo Murcia; kits: home red shirt / blue shorts / red socks, away all white.
 *    https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_sala_de_Espa%C3%B1a
 *  - Card data (lib/town/playerProfiles.json): "Spanish cierre from ElPozo Murcia's academy …", strengths "Cuts out passes", "Launches
 *    quick counters".
 * CONFIRMED: the match, date, venue, teams, the 5–3 Spain win (European champions), Mayor's shirt number 3 and his place in Spain's
 *  matchday squad (a substitute), his club and position; Bernardo Paçó's no. 12.
 * INFERRED (not named in the narration): kits that night — Portugal (first-named) in red / navy / red, Spain in the white change strip,
 *  Spain's keeper in yellow (as in the Dídac Plana film of the same final); the blue court; where each player stood at the final whistle
 *  and how they celebrated (a representative huddle); confetti; Mayor's height (1.78 m assumed) and short dark hair. No video was reviewed.
 *  Chapters 2–3 are a demonstration in training bibs (Mayor navy no. 3, attackers yellow bibs); no match, date or score is claimed.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the interception and the passes). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps
 * library z → −Z. Every ball contact is solved from the skeleton (`footAt`), so boot and ball always meet.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (lights, bibs, diagram lines), red (Portugal, the read pass line, confetti), blue (court), navy (key line, training tops).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,confetti,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill,type Build} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];headline?:{text:string;at:number};heads?:Record<string,string>}[]=[
 {label:'Live: the 2026 final',text:'The 2026 European final. Spain beat Portugal, five goals to three, and become champions of Europe! Ricardo Mayor, number three, celebrates with his team.',tail:2.6,
  cues:['The 2026','Spain beat','five goals','champions','Ricardo Mayor','number three','celebrates'],heads:{'The 2026':'Final 2026','five goals':'5–3','champions':'Champions','Ricardo Mayor':'Ricardo Mayor'}},
 {label:'How he does it',text:'He plays at the back, and wins the ball. Watch how he does it: he reads the pass, steps in front, and cuts it out. Then he looks up, and passes forward fast!',tail:2.0,
  cues:['He plays','wins the ball','Watch how','reads the pass','steps in front','cuts it out','looks up','passes forward'],heads:{'He plays':'How he does it','cuts it out':'Cut it out','passes forward':''}},
 {label:'Win it, go!',text:'So remember: after you win the ball, pass forward fast, before they get back!',tail:3.0,
  cues:['So remember','after you win','the ball','pass forward','fast','before they','get back'],heads:{'after you win':'Win it','pass forward':'Pass forward','get back':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/ricardo-mayor-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/ricardo-mayor-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/ricardo-mayor-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('ricardo-mayor: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('ricardo-mayor: no cue '+w);return c.at;};
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
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;goal?:boolean;centre?:number};
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
  lines.addPath(polyPath(floorRing(st,0,GZ-6,.12,12),true));lines.addPath(polyPath(floorRing(st,0,GZ-10,.12,12),true));}
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

// ---------------- kits ----------------
/** Mayor: no. 3 (Euro 2026 squad list); height not sourced (1.78 m assumed); short dark hair (card appearance data) */
const BUILD:Build={height:1.78,bulk:1};
const SKIN:InkFill[]=[[Y,.72],[R,.2]];
/** Spain in the white change strip (inferred) */
const ESP=(n:number):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',boots:K,skin:[[Y,.72],[R,.2]],hair:K,line:K,trim:R,hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:50+n});
/** Portugal red / navy / red (inferred), Bernardo Paçó (GK) no. 12 in a dark keeper kit (inferred) */
const POR=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.78],[R,.3]],hair:K,line:K,trim:Y,hairStyle:n%3===1?'curly':'short',build:{height:1.72+hash(n,3)*.12,bulk:.98},seed:30+n});
const BPACO:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.3]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',number:12,numberInk:Y,hairStyle:'short',build:{height:1.83},seed:62};
/** the demonstration (chapters 3–4): training kit, no team claimed — Mayor and his team-mate in navy tops, the attackers in yellow bibs */
const MAYOR:AthleteStyle={shirt:[K,.85],shorts:K,socks:'paper',boots:K,skin:SKIN,hair:K,line:K,trim:'paper',number:3,numberInk:'paper',hairStyle:'short',build:BUILD,seed:3};
const MATE:AthleteStyle={shirt:[K,.85],shorts:K,socks:'paper',boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:'paper',hairStyle:'curly',build:{height:1.74},seed:9};
const BIB=(n:number):AthleteStyle=>({shirt:[Y,.92],shorts:K,socks:K,boots:K,skin:n?[[Y,.8],[R,.3]]:[[Y,.62],[R,.2]],hair:K,line:K,trim:K,hairStyle:n?'curly':'short',build:{height:1.76+.05*n},seed:80+n});

/** where a ball touched by that foot sits: just past the toe along the foot, relative to the player's place (our floor coords) */
function footAt(pose:Pose,build:Build,yaw:number,foot:'l'|'r',fwd=.08):[number,number]{const sk=solve(pose,build,{yaw}),toe=toMine(foot==='l'?sk.lToe:sk.rToe),an=toMine(foot==='l'?sk.lAn:sk.rAn),dx=toe[0]-an[0],dz=toe[2]-an[2],l=Math.hypot(dx,dz)||1;return[toe[0]+dx/l*fwd,toe[2]+dz/l*fwd];}
const sub=(a:[number,number],b:[number,number]):[number,number]=>[a[0]-b[0],a[1]-b[1]];
const add=(a:[number,number],b:[number,number]):[number,number]=>[a[0]+b[0],a[1]+b[1]];
const L2v=(a:[number,number],b:[number,number],u:number):[number,number]=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
/** keyed floor path: [t,X,Z] keys → [X,Z] */
function path2(t:number,Kk:[number,number,number][],ease=easeIO):[number,number]{const ks=mono(Kk.map(k=>[k[0],k[1],k[2]] as Key));return[key(t,ks.map(k=>[k[0],k[1]] as Key),ease),key(t,ks.map(k=>[k[0],k[2]] as Key),ease)];}
/** a player's chest ring (the passage enters his shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},build:Build,r=.1):Pt[]{const sk=solve(a.pose,build,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
/** a short floor arrow (dashed + head) from (X,Z) along (dX,dZ) */
function floorArrow(s:Sheet,st:Stage,ink:string,X:number,Z:number,dX:number,dZ:number,len:number,w:number,seed:number,g:number){if(g<=.02)return;const pts:Pt[]=[];for(let k=0;k<=8;k++){const u=k/8*len*g;pts.push(proj(st,X+dX*u,0,Z+dZ*u));}dashed(s,ink,pts,w,seed,{dash:w*3.2});if(g>.6)arrowHead(s,ink,pts,w*2.8,seed+1);}
const kickPose=(k:number)=>blendPose(stand(),posed({lHipF:-10,rHipF:40,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,k*2));
const slump=()=>posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:16,neckP:44,lShA:12,rShA:12,lElb:30,rElb:30});

// ================= chapter 1 — LIVE: the 2026 final is won (5–3); Spain celebrate, Mayor (no. 3) among them. No play is staged. =================
const C1={beat:A(0,'Spain beat'),five:A(0,'five goals'),champ:A(0,'champions'),mayor:A(0,'Ricardo Mayor'),three:A(0,'number three'),cele:A(0,'celebrates'),end:AUTH[0].seconds};
/** Mayor in Spain's white change strip (inferred) with his squad number 3 */
const MAYOR_ESP:AthleteStyle={shirt:'paper',shorts:K,socks:'paper',boots:K,skin:SKIN,hair:K,line:K,trim:R,number:3,numberInk:K,hairStyle:'short',build:BUILD,seed:3};
/** Spain's keeper in a yellow top (inferred, as in the Dídac Plana film) */
const ESP_GK:AthleteStyle={shirt:Y,shorts:K,socks:K,boots:K,skin:[[Y,.72],[R,.2]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.79},seed:21};
const HUDDLE:[number,number]=[.6,9.2],M1:[number,number]=[1.4,5.8];
/** Spain: players on court + substitutes running on from the bench (near touchline), all converging on a jumping huddle */
const ESP_ON:[number,number,number][]=[[-3.2,7.4,0],[3.6,10.8,.3],[-1.6,12.4,.6],[4.4,6.6,.2],[-5.2,4.2,.8],[6.2,2.6,.45],[-3.8,1.8,.15]];
const esp1=(i:number):Gen=>T=>{const[x0,z0,ph]=ESP_ON[i],go=sm(.4+ph,3.2+ph,T,easeIO),a=(i*2.3)%TAU,hx=HUDDLE[0]+Math.cos(a)*(1.1+.3*(i%2)),hz=HUDDLE[1]+Math.sin(a)*.9;
 const X=lerp(x0,hx,go),Z=lerp(z0,hz,go),running=go>0&&go<1;
 let pose=celebrate(T*1.15+ph*3,{kind:'arms'});if(running)pose=blendPose(pose,celebrate(T*1.2+ph,{kind:'run'}),Math.sin(go*Math.PI));
 return{pose,yaw:running?yawTo(hx-x0,hz-z0):yawTo(HUDDLE[0]-X,HUDDLE[1]-Z+.01),X,Z};};
/** Mayor: arms up, jumping, back to the camera (the 3 shows), then he runs into the huddle on "celebrates" */
const mayor1:Gen=T=>{const go=sm(C1.cele,C1.cele+2.2,T,easeIO),X=lerp(M1[0],HUDDLE[0]+.4,go),Z=lerp(M1[1],HUDDLE[1]-1.1,go);
 let pose=celebrate(T*1.1,{kind:'arms'});if(go>0&&go<1)pose=blendPose(pose,celebrate(T*1.2,{kind:'run'}),Math.sin(go*Math.PI));
 return{pose,yaw:FACE_AWAY+.25*Math.sin(T*.7),X,Z};};
const gk1:Gen=T=>({pose:celebrate(T*1.05+.4,{kind:'arms'}),yaw:FACE_LEFT+.6,X:8.6,Z:9.8});
/** Portugal: heads down, hands on knees, spread around the court */
const POR_AT:[number,number,number][]=[[-5.8,7.6,.3],[-4.6,13.6,-.4],[6.4,13.0,2.6],[5.6,3.8,2.2]];
const por1=(i:number):Gen=>T=>{const[X,Z,yaw]=POR_AT[i];return{pose:blendPose(slump(),posed({lHipF:30,rHipF:30,lKnee:40,rKnee:40,lean:40,neckP:40,lShF:40,rShF:40,lElb:20,rElb:20}),i%2?.8:.2+.1*Math.sin(T)),yaw,X,Z};};
const porGk1:Gen=()=>({pose:posed({lHipF:10,rHipF:10,lKnee:90,rKnee:90,lean:20,neckP:50,lShF:30,rShF:30,lElb:60,rElb:60,air:0}),yaw:FACE_RIGHT,X:-17.6,Z:10.2});
const liveCam=(T:number)=>{const m=mayor1(T);return{
 x:key(T,mono([[0,0],[C1.five,-.4],[C1.mayor-.2,.4],[C1.three,m.X],[C1.cele+.4,m.X],[C1.end,m.X]]),easeInOutSine),
 zoom:key(T,mono([[0,.62],[C1.champ,.66],[C1.mayor,.95],[C1.three,1.22],[C1.cele+.5,1.1],[C1.end,1.05]]),easeInOutSine),
 y:key(T,mono([[0,1050],[C1.champ,1040],[C1.mayor,1070],[C1.three,1075],[C1.cele+.5,1060],[C1.end,1060]]),easeInOutSine)};};
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 courtSide(s,st,T,{cheer:1,flash:pulse(T,C1.champ,1.4)+.6*pulse(T,C1.cele,1.2)+.3*pulse(T,.1,1)});
 // "Ricardo Mayor": a yellow ring under him; the ball lies still where the game ended
 const m=mayor1(T);floorDashRing(s,st,Y,m.X,m.Z,.6,8,101,easeOutBack(sm(C1.mayor,C1.mayor+.4,T))*(1-sm(C1.cele+1,C1.cele+1.5,T)));
 const bp=proj(st,-2.6,BALL_R,14.6),br=Math.max(8,kAt(st,14.6)*BALL_R);shadow(s,bp[0],proj(st,-2.6,0,14.6)[1],br*1.15,br*.3,102,.45);ball(s,bp[0],bp[1],br,103);
 type It={z:number;draw:()=>void};const items:It[]=[];
 const far=c.zoom<.9;
 ESP_ON.forEach((_,i)=>{const g=esp1(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i),{detail:'low'})});});
 POR_AT.forEach((_,i)=>{const g=por1(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,POR(i),{detail:'low'})});});
 items.push({z:9.8,draw:()=>athlete(s,st,gk1,T,ESP_GK,{detail:'low'})});
 items.push({z:10.2,draw:()=>athlete(s,st,porGk1,T,BPACO,{detail:'low'})});
 items.push({z:m.Z,draw:()=>athlete(s,st,mayor1,T,MAYOR_ESP,{detail:far?'mid':'high'})});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // "champions": red, yellow and paper confetti falls across the arena
 if(T>=C1.champ-.1){const u=sm(C1.champ-.1,C1.end,T,linear),top=proj(st,0,7,BOARDS)[1];confetti(s,[R,Y,'paper'],[-2400,top-200+u*1500,4800,800],34,Math.floor(T*6),{size:20});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),mayor1(tt),BUILD,.12));},still:C1.three+.3};

// ================= chapter 2 — HOW HE DOES IT (demonstration, training bibs): read, step in front, cut it out, look up, pass forward =================
const C3={mayor:A(1,'He plays'),guards:A(1,'wins the ball'),watch:A(1,'Watch how'),reads:A(1,'reads'),steps:A(1,'steps'),cuts:A(1,'cuts'),looks:A(1,'looks'),passes:A(1,'passes'),end:AUTH[1].seconds};
/** the attackers (yellow bibs) come toward the camera; A passes across to B; Mayor (navy 3) guards goal-side of B */
const PA:[number,number]=[-2.62,8.2],PB:[number,number]=[2.9,7.6],IP=L2v(PA,PB,.64),IP2:[number,number]=[IP[0]-.12,IP[1]+.28];
const OA:[number,number]=[-3.0,8.6],OB:[number,number]=[3.3,7.9],M0:[number,number]=[1.3,4.9];
const RC:[number,number]=[-2.5,10.6],C0:[number,number]=[-3.8,3.9];
const T_P=C3.steps-.2,T_INT=C3.cuts+.1,T_PASS=C3.passes+.12,M_S0=T_PASS-.62,T_RC=T_PASS+.8;
const YAW_M=yawTo(-.35,1),YAW_P=yawTo(RC[0]-IP2[0],RC[1]-IP2[1]);
const MPL=sub(IP,footAt(lunge(.6,{side:'l'}),BUILD,YAW_M,'l')),MSP=sub(IP2,footAt(strike(STRIKE_CONTACT,{power:.7}),BUILD,YAW_P,'r'));
function demoBall(t:number):{X:number;Z:number;spin:number}{
 if(t<T_P)return{X:PA[0],Z:PA[1],spin:0};
 if(t<T_INT){const u=sm(T_P,T_INT,t,linear);const p=L2v(PA,IP,u);return{X:p[0],Z:p[1],spin:u*10};}
 if(t<T_PASS){const u=sm(T_INT,T_INT+.35,t,easeOut),p=L2v(IP,IP2,u);return{X:p[0],Z:p[1],spin:10+u*2};}
 const u=sm(T_PASS,T_RC,t,easeOut),p=L2v(IP2,RC,u);if(t<T_RC)return{X:p[0],Z:p[1],spin:12+u*14};
 const c=demoMate(t),w=sm(T_RC,T_RC+.3,t);return{X:lerp(RC[0],c.X+.35*Math.cos(c.yaw),w),Z:lerp(RC[1],c.Z+.35*Math.sin(c.yaw),w),spin:26+(t-T_RC)*8};
}
const demoMayor:Gen=t=>{
 const[X,Z]=path2(t,[[0,M0[0]+.25,M0[1]-.35],[C3.guards,M0[0],M0[1]],[C3.steps-.1,M0[0]-.05,M0[1]+.05],[T_INT,MPL[0],MPL[1]],[T_INT+.5,MPL[0]-.05,MPL[1]+.08],[M_S0,MSP[0]+.12,MSP[1]-.3],[T_PASS,MSP[0],MSP[1]],[T_PASS+.6,MSP[0]-.1,MSP[1]+.25],[C3.end,MSP[0]-.5,MSP[1]+1.4]]);
 // ready stance, a small guarding shuffle on "He guards", head turns to the ball on "reads"
 let pose=blendPose(stand(),backpedal(t*1.6),.35*sm(C3.guards,C3.guards+.3,t)*(1-sm(C3.watch,C3.watch+.3,t)));
 pose=blendPose(pose,posed({lHipF:22,rHipF:22,lKnee:34,rKnee:34,lean:18,pitch:4,neckP:6,neckY:30,lShA:24,rShA:24,lElb:40,rElb:40}),sm(C3.reads-.2,C3.reads+.2,t));
 let yaw=lerp(FACE_AWAY,yawTo(-.2,1),sm(C3.watch,C3.reads,t));
 const lu=key(t,[[C3.steps-.1,.12],[T_INT,.6],[T_INT+.5,.9]],linear);
 pose=blendPose(pose,lunge(lu,{side:'l'}),sm(C3.steps-.2,C3.steps,t));yaw=lerp(yaw,YAW_M,sm(C3.steps-.2,C3.steps+.2,t));
 // "looks up": stand tall over the ball, chin up, head toward the runner
 const up=posed({lHipF:14,rHipF:14,lKnee:20,rKnee:20,lean:4,neckP:-14,neckY:22,lShA:20,rShA:20,lElb:34,rElb:34});
 if(t>T_INT+.45){pose=blendPose(lunge(.9,{side:'l'}),up,sm(T_INT+.45,C3.looks+.1,t,easeIO));yaw=lerp(YAW_M,YAW_P,sm(C3.looks-.2,M_S0,t));}
 if(t>=M_S0){const stT=key(t,[[M_S0,.1],[M_S0+.3,.3],[T_PASS,STRIKE_CONTACT],[T_PASS+.6,.95]],linear);pose=blendPose(up,strike(stT,{power:.7}),sm(M_S0,M_S0+.15,t));yaw=YAW_P;}
 if(t>T_PASS+.6)pose=blendPose(strike(.95,{power:.7}),runCycle(t*runCadence(.5),{speed:.5}),sm(T_PASS+.6,T_PASS+1,t));
 return{pose,yaw,X,Z};
};
/** the team-mate: waits, then sprints forward into the space on "looks up", takes the pass */
function demoMate(t:number){
 const[X,Z]=path2(t,[[0,C0[0],C0[1]],[C3.looks-.6,C0[0],C0[1]],[T_RC,RC[0]+.1,RC[1]-.4],[C3.end+.5,RC[0]-.2,RC[1]+1.3]],linear);
 const go=sm(C3.looks-.6,C3.looks-.2,t);return{pose:blendPose(stand(),runCycle(t*runCadence(.9),{speed:.9}),go),yaw:lerp(FACE_AWAY+.2,yawTo(RC[0]-C0[0],RC[1]-C0[1]),go),X,Z};
}
/** attacker A: on the ball, shapes and passes across on "steps"; after the cut, turns and chases back — too late */
const demoA:Gen=t=>{const[X,Z]=path2(t,[[0,OA[0]+.3,OA[1]+.6],[C3.watch,OA[0],OA[1]],[T_PASS,OA[0]+.2,OA[1]-.1],[C3.end,OA[0]+.3,OA[1]+1.6]]);
 let pose=blendPose(runCycle(t*runCadence(.3),{speed:.3}),stand(),sm(C3.watch-.4,C3.watch,t));pose=blendPose(pose,kickPose(pulse(t,T_P-.05,.35)),sm(T_P-.3,T_P-.1,t)*(1-sm(T_P+.4,T_P+.7,t)));
 let yaw=yawTo(PB[0]-PA[0],PB[1]-PA[1]);if(t>T_PASS-.1){pose=blendPose(pose,runCycle(t*runCadence(.6),{speed:.6}),sm(T_PASS-.1,T_PASS+.3,t));yaw=lerp(yaw,FACE_AWAY,sm(T_PASS-.1,T_PASS+.4,t));}
 return{pose,yaw,X,Z};};
/** attacker B: waits for the pass, it never arrives (a late reach), then turns and chases */
const demoB:Gen=t=>{const[X,Z]=path2(t,[[0,OB[0]+.2,OB[1]+.4],[C3.watch,OB[0],OB[1]],[T_PASS,OB[0]-.3,OB[1]-.05],[C3.end,OB[0]-.6,OB[1]+1.5]]);
 let pose=stand();const lu=key(t,[[T_INT-.3,.1],[T_INT+.1,.55],[T_INT+.6,.8]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_INT-.35,T_INT-.15,t)*(1-sm(T_INT+.7,T_INT+1.1,t)));
 let yaw=yawTo(PA[0]-PB[0],PA[1]-PB[1]);if(t>T_PASS-.1){pose=blendPose(pose,runCycle(t*runCadence(.6)+.5,{speed:.6}),sm(T_PASS-.1,T_PASS+.3,t));yaw=lerp(yaw,FACE_AWAY-TAU,sm(T_PASS-.1,T_PASS+.4,t));}
 return{pose,yaw,X,Z};};
const st3:Stage={F:1500,eye:5,cx:0,cz:-4.5};
const f3=(X:number,Yh:number,Z:number,zoom:number,tt:number):Key=>{const p=proj(st3,X,Yh,Z);return[tt,p[0],p[1],zoom];};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st3;
  camPath(s,t,[f3(M0[0],1.1,M0[1],1.9,0),f3(M0[0],1.2,M0[1],2.05,C3.mayor+.8),f3(.9,.9,5.8,1.55,C3.guards+.3),f3(.1,.8,6.6,1.28,C3.watch+.2),f3(.4,.8,6.7,1.3,C3.cuts),f3(.3,.8,6.8,1.5,C3.cuts+.7),f3(-.6,.8,7.2,1.38,C3.passes),f3(-1.1,.8,7.9,1.32,C3.end)]);
  arena(s,st,{t:tt,goal:false,centre:6});
  const m=demoMayor(tt),a=demoA(tt),bb=demoB(tt),c=demoMate(tt),b=demoBall(tt);
  // "He plays": a yellow ring under him; "wins the ball": a red dashed zone in front of him (the space he protects)
  floorDashRing(s,st,Y,m.X,m.Z,.55,9,301,easeOutBack(sm(C3.mayor,C3.mayor+.35,tt))*(1-sm(C3.guards,C3.guards+.3,tt)));
  floorDashRing(s,st,R,M0[0]-.2,M0[1]+1.5,1.25,8,302,easeOutBack(sm(C3.guards,C3.guards+.4,tt))*(1-sm(C3.watch+.2,C3.watch+.6,tt)));
  // "Watch how": a yellow ring on the ball at A's feet
  floorDashRing(s,st,Y,PA[0],PA[1],.32,8,303,easeOutBack(sm(C3.watch,C3.watch+.3,tt))*(1-sm(C3.reads+.2,C3.reads+.5,tt)));
  // "reads the pass": the pass he expects (red dashed A → B); after the cut it stops short at the ball
  const rd=sm(C3.reads,C3.reads+.6,tt,easeOut)*(1-sm(C3.looks,C3.looks+.4,tt));
  if(rd>.02){const end=tt>T_INT?IP:PB,pts:Pt[]=[];for(let k=0;k<=10;k++){const q=L2v(PA,end,k/10);pts.push(proj(st,q[0],0,q[1]));}dashed(s,R,pts,9,304,{dash:30,progress:rd});if(rd>.9&&tt<T_INT)arrowHead(s,R,pts,28,305);}
  // "steps in front": a yellow arrow from where he stood to the line of the pass
  const sp=sm(C3.steps,C3.steps+.45,tt,easeOut)*(1-sm(C3.looks,C3.looks+.4,tt));
  if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=8;k++){const q=L2v([M0[0]-.1,M0[1]+.2],[IP[0]+.15,IP[1]-.4],k/8);pts.push(proj(st,q[0],0,q[1]));}dashed(s,Y,pts,10,306,{dash:30,progress:sp});if(sp>.9)arrowHead(s,Y,pts,30,307);}
  // "cuts it out": a red cross where the pass would have gone
  const cx=easeOutBack(sm(C3.cuts+.1,C3.cuts+.4,tt))*(1-sm(C3.looks,C3.looks+.4,tt));
  if(cx>.02){const p=proj(st,lerp(IP[0],PB[0],.55),0,lerp(IP[1],PB[1],.55)),S=44*cx,xs=new Path2D();xs.addPath(ribbon([[p[0]-S,p[1]-S*.6],[p[0]+S,p[1]+S*.6]],10,{seed:308,taper:.2,wobble:1}));xs.addPath(ribbon([[p[0]+S,p[1]-S*.6],[p[0]-S,p[1]+S*.6]],10,{seed:309,taper:.2,wobble:1}));s.knockout(xs);s.fill(R,xs);}
  // "looks up": a dashed yellow sight line from his head to the runner
  const lk=sm(C3.looks,C3.looks+.4,tt,easeOut)*(1-sm(T_PASS+.3,T_PASS+.7,tt));
  if(lk>.02){const sk=solve(m.pose,BUILD,placeAt(m.X,m.Z,m.yaw)),h=toMine(sk.head),hp=proj(st,h[0],h[1]+.15,h[2]),cp=proj(st,c.X,1.9,c.Z+.6),mid:Pt=[(hp[0]+cp[0])/2,Math.min(hp[1],cp[1])-60];const pts=smoothPts([hp,mid,cp],false,10);dashed(s,Y,pts,8,310,{dash:24,progress:lk});}
  // "passes forward": the pass line (dashed yellow, drawn as the ball goes) and the attackers' short chase arrows
  if(tt>T_PASS){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=demoBall(lerp(T_PASS,Math.min(tt,T_RC),k/10));pts.push(proj(st,q.X,0,q.Z));}dashed(s,Y,pts,12,311,{dash:36});if(tt>T_RC-.2&&tt<C3.end-.3)arrowHead(s,Y,pts,34,312);}
  const ch=easeOut(sm(T_PASS+.3,T_PASS+.8,tt));if(ch>.02){floorArrow(s,st,R,a.X,a.Z+.4,.1,1,1.8,12,313,ch);floorArrow(s,st,R,bb.X,bb.Z+.4,-.15,1,1.8,12,315,ch);}
  const bp=proj(st,b.X,BALL_R,b.Z),br=kAt(st,b.Z)*BALL_R,moving=(tt>T_P&&tt<T_INT)||(tt>T_PASS&&tt<T_RC);
  const items:{z:number;draw:()=>void}[]=[
   {z:a.Z,draw:()=>athlete(s,st,demoA,tt,BIB(0),{detail:'mid'})},
   {z:bb.Z,draw:()=>athlete(s,st,demoB,tt,BIB(1),{detail:'mid'})},
   {z:c.Z,draw:()=>athlete(s,st,demoMate,tt,MATE,{detail:'mid'})},
   {z:m.Z,draw:()=>athlete(s,st,demoMayor,tt,MAYOR,{detail:'high',smear:(tt>T_INT-.35&&tt<T_INT+.1)||(tt>T_PASS-.25&&tt<T_PASS+.25)?.18:0})},
   {z:b.Z-.05,draw:()=>{shadow(s,bp[0],proj(st,b.X,0,b.Z)[1],br*1.15,br*.3,316,.45);ball(s,bp[0],bp[1],br,317,{rot:b.spin,smear:moving?.35:0,dir:tt>T_PASS?Math.atan2(1,.8):Math.PI});
    if(tt>=T_INT&&tt<T_INT+.45)sparkBurst(s,Y,bp[0],bp[1],br*3,{n:9,seed:318,g:easeOut(sm(T_INT,T_INT+.3,tt))*(1-sm(T_INT+.3,T_INT+.45,tt))});}},
  ];
  items.sort((p,q)=>q.z-p.z).forEach(it=>it.draw());
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st3,demoMayor(tt),BUILD,.14));},
 still:T_INT+.1,
};

// ================= chapter 3 — THE LESSON: win it, pass forward fast, before they get back =================
const C4={after:A(2,'after you'),ball:A(2,'the ball'),pass:A(2,'pass forward'),fast:A(2,'fast'),before:A(2,'before'),back:A(2,'get back'),end:AUTH[2].seconds};
const P4:[number,number]=[-.35,3.3],YAW4=yawTo(.4,1),IP4=add(P4,footAt(lunge(.6),BUILD,YAW4,'r')),FWD:[number,number]=[-.9,12.4];
const YAWF=yawTo(FWD[0]-IP4[0],FWD[1]-IP4[1]),SP4=sub(IP4,footAt(strike(STRIKE_CONTACT),BUILD,YAWF,'r'));
const T4_IN=C4.after+.35,T4_P=C4.pass+.12,T4_F=T4_P+.7,SRC4:[number,number]=[3.6,5.6];
function lessonBall(t:number):{X:number;Z:number;flying:boolean}{
 if(t<T4_IN){const u=sm(0,T4_IN,t,easeOut);return{X:lerp(SRC4[0],IP4[0],u),Z:lerp(SRC4[1],IP4[1],u),flying:false};}
 if(t<T4_P)return{X:IP4[0],Z:IP4[1],flying:false};
 const u=sm(T4_P,T4_F,t,easeOut);return{X:lerp(IP4[0],FWD[0],u),Z:lerp(IP4[1],FWD[1],u),flying:t<T4_F};
}
const lessonMayor:Gen=t=>{
 const S0=T4_P-.62,[X,Z]=path2(t,[[0,P4[0]+.2,P4[1]-.2],[T4_IN,P4[0],P4[1]],[T4_IN+.5,P4[0],P4[1]],[S0,SP4[0]+.1,SP4[1]-.25],[T4_P,SP4[0],SP4[1]],[C4.end,SP4[0]-.2,SP4[1]+.6]]);
 const lu=key(t,[[0,.1],[T4_IN,.6],[T4_IN+.5,.9]],linear);let pose=lunge(lu),yaw=YAW4;
 const up=posed({lHipF:14,rHipF:14,lKnee:20,rKnee:20,lean:4,neckP:-12,neckY:-8,lShA:20,rShA:20,lElb:34,rElb:34});
 if(t>T4_IN+.4){pose=blendPose(lunge(.9),up,sm(T4_IN+.4,C4.ball+.3,t,easeIO));yaw=lerp(YAW4,YAWF,sm(C4.ball,S0,t));}
 if(t>=S0){const stT=key(t,[[S0,.1],[S0+.3,.3],[T4_P,STRIKE_CONTACT],[T4_P+.6,.95]],linear);pose=blendPose(up,strike(stT),sm(S0,S0+.15,t));yaw=YAWF;}
 if(t>T4_P+.7)pose=blendPose(strike(.95),celebrate((t-T4_P-.7)*1.1,{kind:'arms'}),sm(C4.back,C4.back+.4,t));
 return{pose,yaw,X,Z};
};
/** two attackers (yellow bibs) caught up-court: they turn and run back on "before they", far behind the ball */
const lessonOpp=(i:number):Gen=>t=>{const x0=i?-3.1:2.6,z0=i?6.4:5.9,go=sm(C4.before-.2,C4.before+.3,t),run=Math.max(0,t-C4.before)*2.6;
 const pose=blendPose(stand(),runCycle(t*runCadence(.8)+i*.5,{speed:.8}),go);return{pose,yaw:lerp(FACE_CAMERA+(i?.4:-.4),FACE_AWAY+(i?.15:-.15),sm(C4.before-.25,C4.before+.3,t,easeIO)),X:x0,Z:z0+run};};
const st4:Stage={F:1500,eye:2.4,cx:0,cz:-1.8};
const f4=(X:number,Yh:number,Z:number,zoom:number,tt:number):Key=>{const p=proj(st4,X,Yh,Z);return[tt,p[0],p[1],zoom];};
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st4;
  camPath(s,t,[f4(.4,1,4,1.35,0),f4(.1,1,3.8,1.5,C4.ball),f4(-.2,.9,5.8,1.15,C4.pass+.4),f4(-.4,.8,7.2,1.02,C4.before+.3),f4(-.3,.9,6,1.12,C4.end)]);
  arena(s,st,{t:tt,goal:false,centre:9,cheer:.8*pulse(tt,C4.back,1.4)});
  const b=lessonBall(tt),m=lessonMayor(tt);
  // "the ball": a yellow ring binds it to his foot
  floorDashRing(s,st,Y,b.X,b.Z,.34,9,401,easeOutBack(sm(C4.ball,C4.ball+.35,tt))*(1-sm(T4_P-.1,T4_P+.1,tt)));
  // "pass forward": the forward line; "fast": speed dashes behind the ball
  if(tt>T4_P){const pts:Pt[]=[];for(let k=0;k<=10;k++){const q=lessonBall(lerp(T4_P,Math.min(tt,T4_F),k/10));pts.push(proj(st,q.X,0,q.Z));}dashed(s,Y,pts,14,402,{dash:40});if(tt>T4_F-.2)arrowHead(s,Y,pts,40,403);}
  const fa=pulse(tt,C4.fast,.9);if(fa>.05){const p=proj(st,b.X,BALL_R,b.Z),r=kAt(st,b.Z)*BALL_R;sparkBurst(s,Y,p[0],p[1],r*4,{n:9,seed:404,g:Math.min(1,fa*1.4)});}
  // "before they get back": short red arrows on the two attackers
  const bt=easeOut(sm(C4.before,C4.before+.5,tt));
  const opp=[lessonOpp(0),lessonOpp(1)];
  if(bt>.02)opp.forEach((g,i)=>{const o=g(tt);floorArrow(s,st,R,o.X,o.Z+.35,0,1,1.8,12,405+i*2,bt);});
  const bp=proj(st,b.X,BALL_R,b.Z),br=kAt(st,b.Z)*BALL_R;
  const items:{z:number;draw:()=>void}[]=[
   ...opp.map((g,i)=>({z:g(tt).Z,draw:()=>athlete(s,st,g,tt,BIB(i),{detail:'mid'})})),
   {z:m.Z,draw:()=>athlete(s,st,lessonMayor,tt,MAYOR,{detail:'high',smear:(tt>T4_IN-.3&&tt<T4_IN+.1)||(tt>T4_P-.2&&tt<T4_P+.25)?.18:0})},
   {z:b.Z-.05,draw:()=>{shadow(s,bp[0],proj(st,b.X,0,b.Z)[1],br*1.15,br*.3,410,.45);ball(s,bp[0],bp[1],br,411,{rot:tt*4,smear:b.flying?.45:0,dir:Math.atan2(1,-.1)});}},
  ];
  items.sort((p,q)=>q.z-p.z).forEach(it=>it.draw());
  // "get back": a big yellow tick stamps beside him, with a navy misregistered echo
  const tick=easeOutBack(sm(C4.back+.1,C4.back+.45,tt));
  if(tick>.02){const g=proj(st,m.X,0,m.Z),h=kAt(st,m.Z)*1.78,c:Pt=[g[0]+h*.62,g[1]-h*.72],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:412,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:T4_P+.3,
};

const SCENES=[sc1,sc3,sc4];
const film:RisoStory={
 id:'ricardo-mayor-futsal-signature',format:'futsal',title:'Ricardo Mayor’s quick counter',theme:'Win the ball, then pass forward fast before they get back.',
 ageNote:'For players aged 7–12: the 2026 final and Spain’s win are real; Ricardo Mayor’s interception is shown as a demonstration.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in, a navy boot cuts it off (a red cross stamps on its path), then it shoots forward with a yellow dash. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const cut=sm(0,.3,age,easeOut),go=sm(.45,.8,age,easeIn),bx=x-120*(1-cut),by=y-160*go;
  if(age>.3&&age<.9){const u=clamp((age-.3)/.3),S=r*.9*easeOutBack(u),xs=new Path2D();xs.addPath(ribbon([[x+r*1.4-S,y-S*.6],[x+r*1.4+S,y+S*.6]],8,{seed,taper:.2,wobble:1}));xs.addPath(ribbon([[x+r*1.4+S,y-S*.6],[x+r*1.4-S,y+S*.6]],8,{seed:seed+1,taper:.2,wobble:1}));s.fill(R,xs,1-sm(.7,.9,age));}
  if(go>0)s.fill(Y,ribbon([[x,y],[x,by+r]],r*.5*(1-sm(.8,1,age)),{seed:seed+2,taper:.8,wobble:1}),1);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.8,r*.2,seed+3,{n:16}),true),.32*(1-go));
  ball(s,bx,by,r,seed,{rot:age*6});
 },
};
export default film;
