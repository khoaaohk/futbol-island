/** Ferrão — "the unstoppable pivot turn": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHY THIS MOMENT: Ferrão's entry (lib/town/iconicPlays.json) is a signature (the pivot's hold-up and turn), not one match. The written
 * sources we could reach give his goals as scorer + minute only; none describes HOW a single Ferrão goal was scored. So the film follows the
 * brief's honest fallback: it opens on a REAL, documented Ferrão goal in a real final, showing ONLY confirmed things (the arena, the teams,
 * Ferrão as the pivot, the celebration with the scoreboard at 3–0, the 4–0 trophy) — no goal, pass or tackle of that match is staged — then
 * says "This is how he does it" and shows the turn in a separate, labelled demonstration that is never passed off as that match.
 *  1  LIVE (broadcast camera, main stand): UEFA Futsal Champions League final, 1 May 2022, Arena Riga (Latvia), Barcelona 4–0 Sporting CP.
 *     The teams at kick-off (Ferrão, the pivot, Barça's furthest player forward); whip pan (a cut in time) to the celebration of his goal at
 *     20:27 with the arena scoreboard at 3–0; whip pan to the final whistle: 4–0, a team-mate lifts the cup, confetti.
 *  2  HOW HE DID IT (a demonstration, real time; neutral paper/navy defender and keeper, no match claimed): back to goal, the pass in, he
 *     holds the defender off with his arm and body, feels the defender lean to one side, spins the other way (over his right shoulder) and
 *     shoots low inside the near post.
 *  3  WATCH AGAIN (slow-motion replay of the demonstration, reverse angle: low, from in front of him with the goal behind): arm out, stay
 *     low, turn, finish — ghost limbs, a spin arc and the shot line.
 *  4  YOUR TURN (lesson from the entry's `lesson`: "Hold the defender off with your arm and body, then turn and finish."): he runs it again;
 *     three cards (arm, turn, finish); a tick.
 * Sources (written; fetched once with curl and cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2021–22 UEFA Futsal Champions League" (raw, fetched Sep 2026): final 1 May 2022, 18:00, Arena Riga, Barcelona 4–0 Sporting
 *    CP; goals Lozano 15:19, Pito 18:35, Ferrão 20:27, Dídac Plana 38:19; attendance 8,442; Barcelona's fourth title; Ferrão also scored
 *    (30:23) in the 5–4 a.e.t. semi-final v Benfica. — https://en.wikipedia.org/wiki/2021%E2%80%9322_UEFA_Futsal_Champions_League
 *  - Wikipedia, "Ferrão" (raw): Carlos Vagner Gularte Filho, born 1990, Chapecó; position PIVOT; 1.80 m; Barcelona 2014–2024; UEFA Futsal
 *    Champions League 2019–20 and 2021–22; Best Player in the World 2019, 2020, 2021; FIFA Futsal World Cup 2024. — https://en.wikipedia.org/wiki/Ferr%C3%A3o
 *  - Wikipedia (pt), "Ferrão (jogador de futsal)" (API extract): plays as pivô for Brazil; world's best player 2019–21 (Futsal Awards).
 *  - Wikipedia, "2021 FIFA Futsal World Cup" (raw, cached by an earlier film): Ferrão Golden Shoe, 9 goals.
 *  - UEFA.com match page 2034717 (Barça v Sporting CP, 2021/22) fetched: a JS shell, no goal description.
 * CONFIRMED: the match, date, venue, final score 4–0, Ferrão's goal at 20:27 making it 3–0 (the third goal), Ferrão a pivot at Barcelona,
 *  1.80 m. The narration only states these.
 * INFERRED (not named in the narration): kits — Barça blue-and-garnet stripes (navy/red ink), navy shorts and socks; Sporting green-and-
 *  white hoops, dark shorts, green socks; Sporting's keeper in yellow; the wood-look court; which end; every position in chapter 1;
 *  Ferrão's shooting foot (right) and turn side in the demonstration; his hair (short) and shirt number (not shown); the kick-off positions, where the celebration happened, who lifted the cup (an
 *  unnamed team-mate) and the scoreboard's look. No video was reviewed. Chapters 2–4 are a demonstration of the pivot turn.
 * Technique (poses): the pivot sits low with a wide base, knees bent, weight forward; the arm nearest the defender is bent and held back
 *  against him (feel, don't push); the ball is stopped with the sole of the foot away from the defender; when the defender leans to one
 *  side the pivot spins over the other shoulder on his standing foot and shoots early, low, before the keeper can set.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 *  motionSmear on the spin and the strike). Choreography lives in one LOCAL court frame (u = metres out from the goal line, v = across);
 *  each stage maps it with a proper rotation (no mirror), so the right foot stays the right foot. Our stages are LEFT-handed (X right, Z
 *  away), so `projector()` maps library z → −Z.
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through the
 *  cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: yellow (wood court, lights, diagrams), red (Barça garnet stripes, arrows), green (Sporting hoops), navy (key line, Barça blue, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,figureCam,strike,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',G='green',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates.
 * Every cue starts with a plain word (Kokoro splits contractions and hyphens). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2022 final',text:'The 2022 Futsal Champions League final, in Riga. Barcelona play Sporting. Ferrão is Barça’s pivot, the player up front. He scores the third goal, and Barça win four nil!',tail:2.4,
  cues:['The 2022','in Riga','Barcelona play','Ferrão','pivot','player up front','He scores','third goal','Barça win','four nil'],heads:{'The 2022':'Final 2022','third goal':'3–0','four nil':'4–0'}},
 {label:'How he does it',text:'Pivots play with their back to goal. This is how he does it: he holds the defender off with his arm and body. He feels where the defender leans, spins the other way and shoots!',tail:2.2,
  cues:['Pivots play','back to goal','This is how','holds the defender','arm and body','feels where','defender leans','spins the other','shoots'],heads:{'back to goal':'The pivot','shoots':''}},
 {label:'Watch again',text:'Watch again, slowly. Arm out, stay low, turn and finish!',tail:2.2,
  cues:['Watch again','Arm out','stay low','turn and','finish'],heads:{'Watch again':'Slow motion','finish':''}},
 {label:'Your turn',text:'Your turn: hold the defender off with your arm and body, then turn and finish!',tail:2.6,
  cues:['Your turn','hold the defender','arm and body','then turn','finish'],heads:{'Your turn':'Hold, turn, finish','finish':''}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/ferrao-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/ferrao-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/ferrao-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('ferrao: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('ferrao: no cue '+w);return c.at;};
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
const SKIN:InkFill[]=[[Y,.8],[R,.3]];
const BUILD={height:1.8,bulk:1.08};
/** Ferrão: Barcelona — blue-and-garnet stripes (navy/red), navy shorts and socks (kit inferred), short dark hair, 1.80 m, a strong pivot */
const FERRAO:AthleteStyle={shirt:K,pattern:'stripes',patternInk:R,shorts:K,socks:K,boots:'paper',skin:SKIN,hair:K,line:K,trim:Y,hairStyle:'short',build:BUILD,seed:9};
const BAR=(n:number):AthleteStyle=>({shirt:K,pattern:'stripes',patternInk:R,shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.24]],hair:K,line:K,trim:Y,hairStyle:(['short','bald','curly'] as const)[n%3],build:{height:1.7+hash(n,3)*.14},seed:20+n});
const SPO=(n:number):AthleteStyle=>({shirt:G,pattern:'hoops',patternInk:'paper',shorts:K,socks:G,boots:K,skin:[[Y,.74],[R,.2]],hair:K,line:K,trim:'paper',hairStyle:n%2?'short':'curly',build:{height:1.72+hash(n,4)*.12},seed:40+n});
const SPO_GK:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.74],[R,.2]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:61};
/** the demonstration players (chapters 2–4): a neutral paper/navy training kit, no team is claimed */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.82,bulk:1.05},seed:77};
const DEMO_GK:AthleteStyle={shirt:[K,.55],shorts:K,socks:K,boots:K,skin:[[Y,.78],[R,.22]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'bald',build:{height:1.8},seed:78};
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

// ---------------- the arena: wood court, stands (Barça blue/garnet and Sporting green), futsal goal ----------------
/** stepped navy rows, lit faces, garnet and green shirts, blaugrana and green-and-white flags, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),reds=new Path2D(),greens=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.26)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.4)greens.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 // flags: Barça (garnet stripes on the navy) and Sporting (green hoops on paper), waving
 for(let f=0;f<6;f++){const fx=-2400+f*960+hash(f,6)*300-((off*.3)%960),fy=top-(2+hash(f,7)*6)*rowH-cheer*rowH*1.5,fw=2.1*kw,fh=1.3*kw,wv=(u:number)=>Math.sin(u*4+t*6+f)*fh*.12,pole=(u:number,v:number):Pt=>[fx+u*fw,fy+v*fh+wv(u)];
  if(f%2){s.knockout(polyPath([pole(0,0),pole(.5,0),pole(1,0),pole(1,1),pole(.5,1),pole(0,1)],true));for(let k=0;k<3;k++)greens.addPath(polyPath([pole(0,k/3),pole(.5,k/3),pole(1,k/3),pole(1,k/3+.17),pole(.5,k/3+.17),pole(0,k/3+.17)],true));}
  else for(let k=0;k<4;k+=2)reds.addPath(polyPath([pole(k/4,0),pole(k/4+.25,0),pole(k/4+.25,1),pole(k/4,1)],true));}
 s.fill(Y,heads,.6);s.fill(R,reds);s.fill(G,greens);
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
type CourtOpt={cheer?:number;flash?:number;bulge?:number;bv?:number;by?:number;keeper?:()=>void};
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
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,FA,bulge,bv,by);o.keeper?.();goalPosts(s,st,FA);
}
// ---- END-ON court (chapters 3–4): the camera looks along +Z at the goal (centre X = 0, Z = GZ); the frame is turned 29° so the camera sits
//      off the pivot's LEFT front (his holding arm, the defender's lean) with the goal behind him ----
const GZ=11,WALLZ=13.6,FB:Frame={ox:0,oz:GZ,rot:-Math.PI/2-.5};
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
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalNet(s,st,FB,bulge,bv,by);o.keeper?.();goalPosts(s,st,FB);
}

// ================= the pivot turn (local frame): poses, the pivot, the defender, the ball, the keeper =================
/** HOLD: low wide base, weight forward, the LEFT arm bent and held back against the defender, the head turned to feel him */
const HOLD=posed({lHipF:26,rHipF:24,lKnee:46,rKnee:44,lAnk:-8,rAnk:-8,lHipA:14,rHipA:14,lHipR:10,rHipR:10,lean:24,pitch:4,neckP:12,neckY:42,
 lShF:-50,lShA:36,lShR:12,lElb:34,rShF:30,rShA:42,rElb:60,twist:14,squash:-.04});
/** RECV: the same hold, the RIGHT sole up and flat on the ball (the foot away from the defender) */
const RECV=posed({lHipF:22,rHipF:48,lKnee:50,rKnee:56,lAnk:-6,rAnk:-4,lHipA:12,rHipA:-2,lHipR:10,lean:24,pitch:4,neckP:14,neckY:48,
 lShF:-52,lShA:38,lShR:12,lElb:34,rShF:28,rShA:46,rElb:58,twist:16,squash:-.05});
/** TURN: spinning over the right shoulder on the left foot, the right leg swinging round with the ball, arms out for balance */
const TURN=posed({lHipF:30,lKnee:52,lHipA:6,lAnk:-4,rHipF:34,rKnee:70,rHipA:30,rHipR:22,rAnk:10,lean:24,bend:-10,twist:-28,roll:-6,neckY:-38,neckP:16,
 lShF:14,lShA:64,lElb:40,rShF:-12,rShA:60,rElb:46,squash:-.06});
/** the defender pressing: chest to his back, forearms on him */
const PRESS=posed({lHipF:30,rHipF:12,lKnee:42,rKnee:36,lAnk:-6,lean:24,neckP:16,lShF:60,rShF:52,lShA:16,rShA:14,lElb:52,rElb:46});
const P0:[number,number]=[5.6,.3];// the pivot's stance (local)
const D0:[number,number]=[4.92,.44];// the defender, goal side of him
const TGT:V3=[-.1,.34,-1.12];// low, inside the post on the pivot's right (local u, y, v)
const YAW_S=yawTo(TGT[0]-P0[0],TGT[2]-P0[1]);// facing the goal after a RIGHT spin (yaw goes down from 0)
/** where the ball sits at the right-foot strike's contact (local, relative to the stance) */
const SB:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),BUILD,{yaw:YAW_S}),toe=sk.rToe,an=sk.rAn,d=[toe[0]-an[0],toe[2]-an[2]],l=Math.hypot(d[0],d[1])||1;return[toe[0]+d[0]/l*.08,-(toe[2]+d[1]/l*.08)];})();
const SHOT:[number,number]=[P0[0]+SB[0],P0[1]+SB[1]];
type TurnT={pass0:number;pass1:number;hold:number;lean:number;turn0:number;turn1:number;hit:number;from:[number,number]};
type Turn={piv:LGen;def:LGen;gk:LGen;ball:(t:number)=>{u:number;y:number;v:number;flying:boolean;spin:number};inn:number};
function makeTurn(T:TurnT):Turn{
 const inn=T.hit+.3;
 const strikeT=(t:number)=>key(t,[[T.turn1,.26],[T.hit,STRIKE_CONTACT],[T.hit+.5,.82],[T.hit+1.1,.95]],linear);
 const piv:LGen=t=>{
  let pose:Pose,yaw=0;const bob=Math.sin(t*5.2)*.5+.5;
  const ready=posed({lHipF:18,rHipF:18,lKnee:32+6*bob,rKnee:30+6*bob,lHipA:10,rHipA:10,lean:16,neckP:8,neckY:20,lShA:22,rShA:22,lElb:40,rElb:40});
  if(t<T.hold-.4)pose=ready;
  else if(t<T.pass1-.25)pose=blendPose(ready,HOLD,sm(T.hold-.4,T.hold,t,easeIO));
  else if(t<T.turn0)pose=blendPose(HOLD,RECV,sm(T.pass1-.25,T.pass1,t,easeIO));
  else if(t<T.turn1){pose=keyPoses(t,[[T.turn0,RECV],[lerp(T.turn0,T.turn1,.5),TURN],[T.turn1,strike(.26,{foot:'r'})]]);yaw=lerp(0,YAW_S,sm(T.turn0,T.turn1,t,easeIO));}
  else{pose=strike(strikeT(t),{foot:'r'});yaw=YAW_S;const c=sm(inn+.4,inn+.9,t,easeIO);if(c>0){pose=blendPose(pose,celebrate((t-inn-.4)*1.1,{kind:'arms'}),c);yaw=lerp(YAW_S,YAW_S+1.9,c);}}
  // hold pressure: tiny rocking into the defender while he holds
  const push=t>T.hold&&t<T.turn0?.03*Math.sin(t*7):0;
  const fwd=t>T.hit?.25*sm(T.hit,T.hit+.6,t,easeOut):0;
  return{pose,yaw,u:P0[0]+push-fwd,v:P0[1]};};
 const def:LGen=t=>{
  const close=sm(0,T.hold,t,easeOut),lu=Number.isFinite(T.lean)?key(t,[[T.lean-.05,0],[T.lean+.45,.55],[T.turn1,.62],[T.turn1+.9,.85]],linear):0;
  let pose=blendPose(backpedal(t*1.2),PRESS,sm(T.hold-.6,T.hold,t,easeIO));
  if(Number.isFinite(T.lean))pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T.lean-.1,T.lean+.2,t,easeIO));
  const late=sm(T.turn1-.1,T.turn1+.7,t,easeIO);
  if(late>0)pose=blendPose(pose,posed({lHipF:40,rHipF:20,lKnee:56,rKnee:44,lean:22,neckY:-50,lShA:40,rShA:36,lElb:50,rElb:50,twist:-20}),late*.7);
  const shift=Number.isFinite(T.lean)?.36*sm(T.lean,T.lean+.4,t,easeIO):0;
  return{pose,yaw:-late*1.3,u:D0[0]-.9*(1-close),v:D0[1]+shift};};
 const gk:LGen=t=>{const d=sm(T.hit+.02,T.hit+.55,t,linear);let pose=keeperSet(t*1.3);if(d>0)pose=keeperDive(Math.min(.95,.3+d*.65),{side:'r'});
  pose=blendPose(pose,posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:14,neckP:44,lShA:12,rShA:12,lElb:30,rElb:30}),0);return{pose,yaw:0,u:.62,v:.08};};
 // the ball
 const soleAt=(t:number):[number,number]=>{const{sk,J}=jointsL(piv(t)),toe=J(sk.rToe),heel=J(sk.rHeel);return[lerp(heel[0],toe[0],.66),lerp(heel[2],toe[2],.66)];};
 let RB:[number,number]|null=null;
 const ballF=(t:number)=>{
  if(!RB)RB=soleAt(T.pass1);
  if(t<T.pass0)return{u:T.from[0],y:BALL_R,v:T.from[1],flying:false,spin:0};
  if(t<T.pass1){const u=sm(T.pass0,T.pass1,t,easeOut);return{u:lerp(T.from[0],RB[0],u),y:BALL_R,v:lerp(T.from[1],RB[1],u),flying:false,spin:u*10};}
  if(t<T.turn0){const[u,v]=soleAt(t);return{u,y:BALL_R,v,flying:false,spin:10};}
  if(t<T.hit){const w=sm(T.turn0,T.turn1,t,easeIO),[u,v]=soleAt(Math.min(t,T.turn1-.001));return{u:lerp(u,SHOT[0],w),y:BALL_R,v:lerp(v,SHOT[1],w),flying:false,spin:10+w*6};}
  if(t<inn){const u=sm(T.hit,inn,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M=[lerp(SHOT[0],TGT[0],.5),.42,lerp(SHOT[1],TGT[2],.5)];
   return{u:a*SHOT[0]+b*M[0]+c*TGT[0],y:a*BALL_R+b*M[1]+c*TGT[1],v:a*SHOT[1]+b*M[2]+c*TGT[2],flying:true,spin:20+u*30};}
  const d=sm(inn+.05,inn+.35,t,easeIn),bo=Math.abs(Math.sin(sm(inn+.35,inn+1.1,t)*Math.PI*2))*.1*(1-sm(inn+.35,inn+1.1,t));
  return{u:-.62,y:lerp(TGT[1],BALL_R,d)+bo,v:TGT[2]+.05,flying:false,spin:50};};
 return{piv,def,gk,ball:ballF,inn};
}
/** a ball drawn on stage st through frame fr, with its floor shadow (a flying ball smears back along its flight from the shot) */
function drawBallL(s:Sheet,st:Stage,fr:Frame,b:{u:number;y:number;v:number;flying:boolean;spin:number},seed:number,min=9){
 const[X,Z]=toStage(fr,b.u,b.v),p=proj(st,X,b.y,Z),g=proj(st,X,0,Z),r=Math.max(min,kAt(st,Z)*BALL_R),o=fp(st,fr,SHOT[0],SHOT[1],BALL_R);
 shadow(s,g[0],g[1],r*1.15,r*.3,seed+5,b.flying?.25:.45);ball(s,p[0],p[1],r,seed,{rot:b.spin,smear:b.flying?.45:0,dir:Math.atan2(p[1]-o[1],p[0]-o[0])});return{p,r};
}
/** a local floor point on a stage */
const fp=(st:Stage,fr:Frame,u:number,v:number,y=0):Pt=>{const[X,Z]=toStage(fr,u,v);return proj(st,X,y,Z);};
/** the pivot's chest (the passage enters his striped shirt) */
function chestPts(st:Stage,fr:Frame,l:Loc,r=.1):Pt[]{const{sk,J}=jointsL(l),ch=J(sk.chest),[X,Z]=toStage(fr,ch[0],ch[2]),p=proj(st,X,ch[1]-.05,Z),rad=r*kAt(st,Z),q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*rad,p[1]+Math.sin(a)*rad]);}return q;}
/** the joint of the pivot on the sheet */
function jointPt(st:Stage,fr:Frame,l:Loc,name:'lEl'|'lHa'|'lSh'|'chest'|'pelvis'|'rToe'|'head'):Pt{const{sk,J}=jointsL(l),j=J(sk[name]),[X,Z]=toStage(fr,j[0],j[2]);return proj(st,X,j[1],Z);}
type Item={z:number;draw:()=>void};
const depth=(fr:Frame,l:{u:number;v:number})=>toStage(fr,l.u,l.v)[1];

// ================= chapter 1 — LIVE: the 2022 final in Riga. Only confirmed things: the arena, the teams at kick-off, Ferrão the pivot,
// then (cut) the celebration with the scoreboard at 3–0, and (cut) the 4–0 trophy lift. No goal, pass or tackle of the match is staged. =================
const C1={riga:A(0,'in Riga'),bar:A(0,'Barcelona'),fer:A(0,'Ferrão'),piv:A(0,'pivot'),front:A(0,'player up'),scores:A(0,'He scores'),third:A(0,'third'),win:A(0,'Barça win'),nil:A(0,'four nil'),end:AUTH[0].seconds};
/** two whip pans (cuts in time): kick-off → his goal's celebration (20:27, 3–0) → the final whistle and the trophy (4–0) */
const W0=C1.scores-.12,W1=W0+.26,WM=(W0+W1)/2,V0=C1.win-.14,V1=V0+.26,VM=(V0+V1)/2;
/** kick-off (local u from Sporting's goal; halfway = 20): Barça (attacking u → 0) in their half, Ferrão the furthest forward at the centre */
const KO_BAR:[number,number][]=[[20.9,.7],[23.4,-5.4],[23.1,5.6],[27.6,.4]];// Ferrão, right ala, left ala, fixo
const KO_SPO:[number,number][]=[[18.4,-2.2],[16.2,4.6],[16.4,-5],[13.2,.3]];
const idle=(t:number,ph:number)=>{const b=Math.sin(t*5+ph*6)*.5+.5;return posed({lHipF:16,rHipF:16,lKnee:24+8*b,rKnee:22+8*b,lHipA:10,rHipA:10,lean:12,neckP:6,lShA:18,rShA:18,lElb:36,rElb:36,air:.02*b});};
/** the celebration after his goal (3–0): Ferrão arms up; team-mates run in to him */
const CEL:[number,number]=[9.2,-2.6];
const CEL_IN:[number,number][]=[[14.6,1.8],[15.8,-6.2],[21,.8]];
/** the trophy (4–0): the team in a knot, a team-mate lifts the cup, Ferrão beside him */
const TRO:[number,number]=[12.4,.2];
function kickoffGen(i:number,team:'bar'|'spo'):LGen{const p=(team==='bar'?KO_BAR:KO_SPO)[i];return t=>({pose:idle(t,i+(team==='bar'?0:.37)),yaw:team==='bar'?Math.PI:0,u:p[0],v:p[1]});}
const liveF:LGen=T=>{
 if(T<WM)return kickoffGen(0,'bar')(T);
 if(T<VM){const c=celebrate((T-WM)*1.1,{kind:'arms'});return{pose:c,yaw:-Math.PI/2+.4*Math.sin((T-WM)*1.4),u:CEL[0],v:CEL[1]};}
 return{pose:celebrate((T-VM)*1.1+.3,{kind:'arms'}),yaw:-Math.PI/2-.35,u:TRO[0]+.4,v:TRO[1]-1.15};};
const liveBar=(i:number):LGen=>T=>{// i = 0..2: right ala, left ala, fixo
 if(T<WM)return kickoffGen(i+1,'bar')(T);
 if(T<VM){const a=CEL_IN[i],go=sm(WM,VM-.6,T,easeOut),tgt:[number,number]=[CEL[0]+[.9,-.8,1.1][i],CEL[1]+[-.9,.8,.9][i]],u=lerp(a[0],tgt[0],go),v=lerp(a[1],tgt[1],go);
  return{pose:go<.95?celebrate((T-WM)*1.2+i*.3,{kind:'run'}):celebrate((T-WM)*1.1+i*.4,{kind:'arms'}),yaw:yawTo(CEL[0]-u,CEL[1]-v),u,v};}
 const spot:[number,number][]=[[TRO[0]-.9,TRO[1]+1.1],[TRO[0]+.7,TRO[1]+1.3],[TRO[0]-.6,TRO[1]-1.9]];
 return{pose:celebrate((T-VM)*1.1+i*.37,{kind:'arms'}),yaw:-Math.PI/2+[.3,-.2,.5][i],u:spot[i][0],v:spot[i][1]};};
/** the team-mate who lifts the cup (not identified) */
const LIFT=posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:-6,neckP:-30,lShF:170,rShF:170,lShA:14,rShA:14,lElb:22,rElb:22,lHand:.3,rHand:.3});
const lifter:LGen=T=>({pose:blendPose(stand(),LIFT,sm(VM,VM+.7,T,easeOutBack)),yaw:-Math.PI/2,u:TRO[0],v:TRO[1]});
const liveSpo=(i:number):LGen=>T=>{if(T<WM)return kickoffGen(i,'spo')(T);
 const base:[number,number]=T<VM?[[5.2,3.6],[6.4,-6.2],[3.2,-.9],[12.4,5.8]][i] as [number,number]:[[20.2,5.8],[22.4,-6.6],[24.2,2.2],[18.6,7.4]][i] as [number,number];
 return{pose:posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:18,neckP:44,lShA:10,rShA:10,lElb:24,rElb:24}),yaw:T<VM?(i%2?.7:-.5):Math.PI*.8,u:base[0],v:base[1]};};
const liveGK:LGen=T=>T<WM?{pose:keeperSet(T*1.3),yaw:0,u:.7,v:0}:{pose:posed({lHipF:8,rHipF:8,lKnee:14,rKnee:14,lean:16,neckP:44,lShA:12,rShA:12,lElb:30,rElb:30}),yaw:.4,u:.8,v:-.4};
const liveCam=(T:number)=>({x:key(T,mono([[0,-.5],[C1.bar,0],[C1.fer,.4],[C1.front,-.8],[W0,-1.6],[W1,-10.6],[C1.third,-10.8],[V0,-10.9],[V1,-8],[C1.end,-7.9]]),easeInOutSine),
 zoom:key(T,mono([[0,.56],[C1.bar,.58],[C1.fer+.2,.86],[C1.piv,.95],[C1.front,.9],[W0,.9],[W1,.86],[C1.third,.92],[V0,.94],[V1,1.05],[C1.end,1.12]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.fer+.2,1000],[C1.front,1010],[W1,990],[V0,990],[V1,940],[C1.end,930]]),easeInOutSine)});
/** seven-segment digits on the arena scoreboard */
const SEG:Record<string,number[]>={'0':[0,1,2,4,5,6],'3':[0,2,3,5,6],'4':[1,2,3,5]};
function digit(p:Path2D,ch:string,x:number,y:number,h:number){const w=h*.55,t=h*.13,segs:[number,number,number,number][]=[[0,0,w,t],[0,0,t,h/2],[w-t,0,t,h/2],[0,h/2-t/2,w,t],[0,h/2,t,h/2],[w-t,h/2,t,h/2],[0,h-t,w,t]];for(const k of SEG[ch]??[]){const[a,b,c,d]=segs[k];p.rect(x+a,y+b,c,d);}}
function scoreboard(s:Sheet,st:Stage,camX:number,score:string){
 const kw=kAt(st,BOARDS),wall=proj(st,0,0,BOARDS)[1],top=wall-.95*kw-.55*kw*.25,cx=proj(st,camX+3.2,0,BOARDS)[0],W=4.6*kw,H=1.8*kw;
 const box=polyPath(handCut([[cx-W/2,top-H],[cx+W/2,top-H],[cx+W/2,top],[cx-W/2,top]],131,3,80),true);s.knockout(box);s.fill(K,box);
 const lit=new Path2D(),h=H*.62,y=top-H+H*.19;// Barça left (garnet tab), Sporting right (green tab)
 const tabs=(ink:string,x:number)=>{const p=new Path2D();p.rect(x,top-H+H*.06,W*.16,H*.07);s.fill(ink,p);};tabs(R,cx-W*.38);tabs(G,cx+W*.22);digit(lit,score[0],cx-W*.3,y,h);lit.rect(cx-h*.18,y+h*.45,h*.36,h*.12);digit(lit,score[2],cx+W*.3-h*.55,y,h);s.fill(Y,lit);
}
/** the cup: paper with a navy key line and yellow glints, held between the lifter's hands */
function trophy(s:Sheet,st:Stage,l:Loc){const{sk,J}=jointsL(l),a=J(sk.lHa),b=J(sk.rHa),m=[(a[0]+b[0])/2,(a[1]+b[1])/2+.12,(a[2]+b[2])/2],[X,Z]=toStage(FA,m[0],m[2]),p=proj(st,X,m[1],Z),k=kAt(st,Z);
 const cup:Pt[]=[[-.2,-.5],[.2,-.5],[.16,-.28],[.05,-.2],[.05,-.06],[.13,0],[-.13,0],[-.05,-.06],[-.05,-.2],[-.16,-.28]].map(([x,y])=>[p[0]+x*k,p[1]+y*k] as Pt);
 const path=polyPath(smoothPts(cup,true,6,2),true);s.knockout(path);s.fill(K,ribbon([...smoothPts(cup,true,6,2),cup[0]],Math.max(3,k*.02),{seed:141,close:true,wobble:.5}));
 s.fill(Y,polyPath(blob(p[0]-.08*k,p[1]-.4*k,.03*k,.07*k,142,{n:10}),true));}
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x);
 cam(s,0,c.y,c.zoom);
 const phase=T<WM?0:T<VM?1:2;
 courtSide(s,st,T,{cheer:phase===0?.1:phase===1?.9:1,flash:phase===1?pulse(T,WM,1.2):phase===2?pulse(T,VM,1.2)+.6*pulse(T,C1.nil,1.2):0,
  keeper:()=>{athlete(s,st,FA,liveGK,T,SPO_GK,{detail:'low'});}});
 if(phase>0)scoreboard(s,st,c.x,phase===1?'3-0':'4-0');
 const items:Item[]=[];
 KO_SPO.forEach((_,i)=>{const g=liveSpo(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,SPO(i),{detail:'low'})});});
 [0,1,2].forEach(i=>{const g=liveBar(i);items.push({z:depth(FA,g(T)),draw:()=>athlete(s,st,FA,g,T,BAR(i),{detail:'low'})});});
 if(phase===2)items.push({z:depth(FA,lifter(T)),draw:()=>{athlete(s,st,FA,lifter,T,BAR(3),{detail:'mid'});trophy(s,st,lifter(T));}});
 items.push({z:depth(FA,liveF(T))-.02,draw:()=>athlete(s,st,FA,liveF,T,FERRAO,{detail:'mid'})});
 // the ball on the centre spot at kick-off
 if(phase===0)items.push({z:10,draw:()=>{drawBallL(s,st,FA,{u:20,y:BALL_R,v:0,flying:false,spin:0},18);}});
 // "pivot": a red dashed ring under him; "player up front": an arrow from him toward Sporting's goal (he is Barça's furthest player forward)
 if(phase===0){const l=liveF(T),[X,Z]=toStage(FA,l.u,l.v),g=easeOutBack(sm(C1.piv,C1.piv+.35,T))*(1-sm(W0-.3,W0,T));if(g>.02)items.push({z:Z+.9,draw:()=>{floorDashRing(s,st,K,X,Z,1.15,22,50,g);floorDashRing(s,st,R,X,Z,1.15,14,51,g);}});
  const ar=sm(C1.front,C1.front+.5,T,easeOut)*(1-sm(W0-.3,W0,T));if(ar>.02)items.push({z:Z+.8,draw:()=>{const pts=[fp(st,FA,l.u-.9,l.v),fp(st,FA,l.u-2.6,l.v-.1),fp(st,FA,l.u-4.4,l.v)];cased(s,pts,16,52,{dash:50,progress:ar});if(ar>.9)casedHead(s,pts,46,53);}});}
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 // the whip pans: yellow speed lines sweep across the frame (cuts in time)
 for(const[a0,a1] of[[W0,W1],[V0,V1]]as[number,number][])if(Tc>=a0&&Tc<a1){const u=sm(a0,a1,Tc),a=Math.sin(u*Math.PI);const c2=proj(st,c.x,1,10);for(let k=0;k<3;k++)speedLines(s,Y,c2[0]+(k-1)*420,c2[1]-300+k*300,Math.PI,{n:9,seed:60+k,len:900*a+200,spread:260,width:14,cov:.85});}
 // the trophy night: confetti in Barça colours
 if(phase===2){const u=sm(VM,VM+3,T,linear),top=proj(st,c.x,4,BOARDS)[1],x0=proj(st,c.x-9,0,10)[0],x1=proj(st,c.x+9,0,10)[0];confetti(s,[R,K,Y,'paper'],[x0,top-200+u*500,x1-x0,420],26,Math.floor(T*6),{size:16});}
}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),FA,liveF(tt),.14));},still:C1.front+.3};

// ================= chapter 2 — HOW HE DID IT (demonstration, real time, side-on): hold, feel, spin, shoot =================
const C2={pivots:A(1,'Pivots'),back:A(1,'back to'),how:A(1,'This is'),holds:A(1,'holds'),arm:A(1,'arm and'),feels:A(1,'feels'),leans:A(1,'defender leans'),spins:A(1,'spins'),shoots:A(1,'shoots'),end:AUTH[1].seconds};
const T2:TurnT={pass0:C2.holds-.1,pass1:C2.arm+.2,hold:C2.holds+.1,lean:C2.leans,turn0:C2.spins+.05,turn1:C2.spins+.62,hit:Math.max(C2.spins+.84,C2.shoots),from:[11.5,-5.2]};
const turn2=makeTurn(T2);
const st2=(_t:number):Stage=>({F:3000,eye:2.6,cx:-17.2,cz:-.4});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(tt),inn=turn2.inn,hit=pulse(t,T2.hit,.35);
  camPath(s,t,[[0,120,420,.62],[C2.back,60,440,.64],[C2.how,420,380,.86],[C2.holds,640,340,1.1],[C2.arm,700,330,1.25],[C2.leans,690,330,1.22],[C2.spins,560,350,.98],[T2.hit,160,400,.7],[inn+.6,40,420,.64],[C2.end,60,420,.66]],[5*hit*Math.sin(t*80),0]);
  const goal=tt>=inn;
  courtSide(s,st,tt,{cheer:goal?.6:0,flash:pulse(tt,inn,1.2),bulge:.5*sm(inn-.1,inn,tt)*(1-.6*sm(inn+.3,inn+1.2,tt))+.1*settle(tt,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FA,turn2.gk,tt,DEMO_GK,{detail:'mid'});}});
  const piv=turn2.piv(tt),df=turn2.def(tt),[PX,PZ]=toStage(FA,piv.u,piv.v);
  // "back to goal": a dashed yellow arrow from his back to the goal; "spins the other way": a yellow spin arc on the floor (to his right)
  const bk=easeOut(sm(C2.back,C2.back+.6,tt))*(1-sm(C2.holds-.2,C2.holds+.2,tt));
  if(bk>.02){const pts=[fp(st,FA,piv.u-.8,piv.v-.6),fp(st,FA,piv.u-2.6,piv.v-.8),fp(st,FA,1.2,-.4)];cased(s,pts,12,201,{dash:40,progress:bk});if(bk>.9)casedHead(s,pts,36,202);}
  const sp=sm(C2.spins-.1,C2.spins+.4,tt,easeOut)*(1-sm(T2.hit+.3,T2.hit+.8,tt));
  if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=-.3-k/14*2.6;pts.push(fp(st,FA,P0[0]+Math.cos(a)*1.45,P0[1]+Math.sin(a)*1.45));}cased(s,pts,12,203,{dash:34,progress:sp});if(sp>.9)casedHead(s,pts,32,204);}
  // "defender leans": a red arrow from the defender toward his lean (the far side)
  const la=sm(C2.leans,C2.leans+.5,tt,easeOut)*(1-sm(T2.hit,T2.hit+.5,tt));
  if(la>.02){const pts=[fp(st,FA,D0[0],D0[1]+.3),fp(st,FA,D0[0]-.1,D0[1]+1),fp(st,FA,D0[0]-.2,D0[1]+1.8)];const q=partial(pts,la),rp=ribbon(q,12,{seed:205,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);if(la>.6)arrowHead(s,R,q,30,206);}
  // the shot line (dashed yellow) as the ball goes
  if(tt>T2.hit){const pts:Pt[]=[];for(let k=0;k<=14;k++){const q=turn2.ball(lerp(T2.hit,Math.min(tt,inn),k/14));pts.push(fp(st,FA,q.u,q.v,q.y));}cased(s,pts,10,207,{dash:36});}
  const b=turn2.ball(tt);
  const items:Item[]=[
   {z:depth(FA,df),draw:()=>athlete(s,st,FA,turn2.def,tt,DEMO_D,{detail:'high'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FA,turn2.piv,tt,FERRAO,{detail:'high',smear:(tt>T2.turn0&&tt<T2.turn1+.05)||(tt>T2.hit-.15&&tt<T2.hit+.2)?.14:0})},
   {z:tt<T2.hit&&tt>=T2.pass1?PZ-.01:depth(FA,b),draw:()=>{drawBallL(s,st,FA,b,211);if(tt>=T2.hit&&tt<T2.hit+.35){const p=fp(st,FA,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],110,{n:9,seed:212,g:easeOut(sm(T2.hit,T2.hit+.25,tt))});}}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "holds the defender off with his arm": a red ring round the arm; "and body": a yellow bracket along his back; "feels where": a pulse ring at the hand
  if(tt>=C2.holds&&tt<T2.turn0+.1){const e=jointPt(st,FA,piv,'lEl'),h=jointPt(st,FA,piv,'lHa'),g=easeOutBack(sm(C2.holds,C2.holds+.35,tt))*(1-sm(T2.turn0-.2,T2.turn0+.1,tt)),c:Pt=[(e[0]+h[0])/2,(e[1]+h[1])/2],r=kAt(st,PZ)*.34*g;
   if(g>.02)s.fill(R,ribbon(blob(c[0],c[1],r,r*.8,221,{n:22}),9,{seed:222,close:true,wobble:1}),1);
   const bd=sm(C2.arm+.25,C2.arm+.7,tt,easeOut)*(1-sm(T2.turn0-.2,T2.turn0+.1,tt));if(bd>.02){const sh=jointPt(st,FA,piv,'lSh'),pe=jointPt(st,FA,piv,'pelvis'),o=kAt(st,PZ)*.28,pts:Pt[]=[[sh[0]-o,sh[1]-o*.3],[L2(sh,pe,.5)[0]-o*1.2,L2(sh,pe,.5)[1]],[pe[0]-o,pe[1]+o*.3]];cased(s,pts,10,223,{dash:28,progress:bd});}
   const fe=pulse(tt,C2.feels+.1,.8);if(fe>.05)for(let k=0;k<2;k++){const rr=kAt(st,PZ)*(.14+.22*k+.2*(1-fe));s.fill(Y,ribbon(blob(h[0],h[1],rr,rr,224+k,{n:18}),6,{seed:226+k,close:true,wobble:.8}),fe);}}
  if(tt>=inn&&tt<inn+1.2){const p=fp(st,FA,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],140,{n:12,seed:230,g:easeOut(sm(inn,inn+.3,tt))*(1-sm(inn+.8,inn+1.2,tt))});}
  void PX;
 },
 aperture(t0){const{tt}=clock(1,t0);return aperture(chestPts(st2(tt),FA,turn2.piv(tt),.13));},
 still:C2.arm+.3,
};
// ================= chapter 3 — WATCH AGAIN (slow-motion replay, reverse angle: low, in front of him, the goal behind) =================
const C3={watch:A(2,'Watch'),arm:A(2,'Arm out'),low:A(2,'stay low'),turn:A(2,'turn and'),fin:A(2,'finish'),end:AUTH[2].seconds};
/** the replay re-uses the chapter 2 sequence, slowed and keyed to the words (sequence time = seq(t)) */
const seq3=(t:number)=>key(t,mono([[0,T2.hold-.5],[C3.arm,T2.pass1-.1],[C3.low,T2.lean+.2],[C3.turn,T2.turn0],[C3.fin,T2.hit+.02],[C3.fin+1.1,turn2.inn+.35],[C3.end,turn2.inn+1.4]]),linear);
const g3=(g:LGen):LGen=>t=>g(seq3(t));
const piv3=g3(turn2.piv),def3=g3(turn2.def),gk3=g3(turn2.gk);
const P0B=toStage(FB,P0[0],P0[1]);
const st3:Stage={F:1500,eye:1.25,cx:P0B[0]+1.2,cz:P0B[1]-4.6};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3,q=seq3(tt),inn=turn2.inn,hit=pulse(q,T2.hit,.4);
  camPath(s,t,[[0,-120,110,1.02],[C3.arm,-220,90,1.2],[C3.low,-200,180,1.12],[C3.turn,-160,120,1.05],[C3.fin,-40,90,.94],[C3.fin+1,40,70,1],[C3.end,40,70,1.02]],[6*hit*Math.sin(t*90),4*hit*Math.cos(t*77)]);
  const goal=q>=inn;
  arena(s,st,tt,{cheer:goal?.8:0,flash:goal?pulse(q,inn,1.2):0,bulge:.55*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q))+.1*settle(q,inn,{amp:1,freq:3,decay:3}),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FB,gk3,tt,DEMO_GK,{detail:'mid'});}});
  const piv=piv3(tt),[,PZ]=toStage(FB,piv.u,piv.v);
  // the spin arc (yellow) on "turn and"; the shot line on "finish"
  const sp=sm(C3.turn-.1,C3.turn+.5,tt,easeOut)*(1-sm(C3.fin+.8,C3.fin+1.3,tt));
  if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=14;k++){const a=-.3-k/14*2.6;pts.push(fp(st,FB,P0[0]+Math.cos(a)*1.05,P0[1]+Math.sin(a)*1.05));}cased(s,pts,13,301,{dash:36,progress:sp});if(sp>.9)casedHead(s,pts,36,302);}
  if(q>T2.hit){const pts:Pt[]=[];for(let k=0;k<=14;k++){const bb=turn2.ball(lerp(T2.hit,Math.min(q,inn),k/14));pts.push(fp(st,FB,bb.u,bb.v,bb.y));}cased(s,pts,12,303,{dash:40});}
  // ghost limbs through the slow spin: two faint earlier frames of him
  const b=turn2.ball(q);
  const items:Item[]=[
   {z:depth(FB,def3(tt)),draw:()=>athlete(s,st,FB,def3,tt,DEMO_D,{detail:'mid'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FB,piv3,tt,FERRAO,{detail:'high',smear:(q>T2.turn0&&q<T2.turn1+.1)||(q>T2.hit-.2&&q<T2.hit+.2)?.5:0})},
   {z:q<T2.hit&&q>=T2.pass1?PZ-.01:depth(FB,b),draw:()=>{drawBallL(s,st,FB,b,311,10);if(q>=T2.hit&&q<T2.hit+.35){const p=fp(st,FB,SHOT[0],SHOT[1],.2);sparkBurst(s,Y,p[0],p[1],120,{n:9,seed:312,g:easeOut(sm(T2.hit,T2.hit+.25,q))});}}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // "Arm out": the red ring on his arm; "stay low": a yellow bracket from hip to knee height (low base) at his feet
  const ar=easeOutBack(sm(C3.arm,C3.arm+.35,tt))*(1-sm(C3.turn-.2,C3.turn+.1,tt));
  if(ar>.02){const e=jointPt(st,FB,piv,'lEl'),h=jointPt(st,FB,piv,'lHa'),c:Pt=[(e[0]+h[0])/2,(e[1]+h[1])/2],r=kAt(st,PZ)*.3*ar;s.fill(R,ribbon(blob(c[0],c[1],r,r*.85,321,{n:22}),10,{seed:322,close:true,wobble:1}),1);}
  const lo=easeOutBack(sm(C3.low,C3.low+.35,tt))*(1-sm(C3.turn,C3.turn+.3,tt));
  if(lo>.02){const pe=jointPt(st,FB,piv,'pelvis'),g=fp(st,FB,piv.u,piv.v),w=kAt(st,PZ)*.75*lo,pts:Pt[]=[[g[0]-w,g[1]],[g[0]-w,pe[1]],[g[0]+w,pe[1]],[g[0]+w,g[1]]];cased(s,pts,10,323,{dash:26});}
  if(q>=inn&&q<inn+1.2){const p=fp(st,FB,TGT[0]-.2,TGT[2],TGT[1]);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:330,g:easeOut(sm(inn,inn+.3,q))*(1-sm(inn+.8,inn+1.2,q))});}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,FB,piv3(tt),.13));},
 still:C3.turn+.25,
};

// ================= chapter 4 — YOUR TURN: he runs the move again; three cards (arm, turn, finish); a tick =================
const C4={your:A(3,'Your'),hold:A(3,'hold the'),arm:A(3,'arm and'),turn:A(3,'then turn'),fin:A(3,'finish'),end:AUTH[3].seconds};
const seq4=(t:number)=>key(t,mono([[0,T2.hold-.6],[C4.hold,T2.hold+.1],[C4.arm,T2.pass1+.1],[C4.turn,T2.turn0],[C4.fin,T2.hit+.02],[C4.end,turn2.inn+1.5]]),linear);
const g4=(g:LGen):LGen=>t=>g(seq4(t));
const piv4=g4(turn2.piv),def4=g4(turn2.def),gk4=g4(turn2.gk);
const st4:Stage={F:1500,eye:1.6,cx:P0B[0]+1.3,cz:P0B[1]-6.2};
const CARD_Y=760,CARD_W=175,CARDS:[number,number,'arm'|'turn'|'finish'][]=[[-420,C4.arm-.1,'arm'],[0,C4.turn,'turn'],[420,C4.fin,'finish']];
const sc4:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(3,t0),st=st4,q=seq4(tt),inn=turn2.inn;
  camPath(s,t,[[0,-80,160,1.05],[C4.your+.4,0,350,.92],[C4.turn,0,350,.92],[C4.fin+.4,0,340,.92],[C4.end,0,335,.93]]);
  const goal=q>=inn;
  arena(s,st,tt,{cheer:goal?.9*(1-sm(C4.end-1,C4.end,tt)):0,flash:goal?pulse(q,inn,1.2):0,bulge:.5*sm(inn-.1,inn,q)*(1-.6*sm(inn+.4,inn+1.4,q)),bv:TGT[2],by:TGT[1],
   keeper:()=>{athlete(s,st,FB,gk4,tt,DEMO_GK,{detail:'mid'});}});
  const piv=piv4(tt),[,PZ]=toStage(FB,piv.u,piv.v),b=turn2.ball(q);
  const items:Item[]=[
   {z:depth(FB,def4(tt)),draw:()=>athlete(s,st,FB,def4,tt,DEMO_D,{detail:'mid'})},
   {z:PZ-.001,draw:()=>athlete(s,st,FB,piv4,tt,FERRAO,{detail:'high',smear:q>T2.turn0&&q<T2.turn1+.05?.2:0})},
   {z:q<T2.hit&&q>=T2.pass1?PZ-.01:depth(FB,b),draw:()=>{drawBallL(s,st,FB,b,411,10);}},
  ];
  items.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the three cards rise on "Your turn"; each prints its step as it is said (arm, turn, finish)
  const rise=sm(C4.your,C4.your+.6,tt,easeOut);
  if(rise>.01){const dy=(1-rise)*700,cards=new Path2D(),frames=new Path2D(),outline:Pt[][]=[];
   CARDS.forEach(([cx],i)=>{const qq=handCut([[cx-CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y-190+dy],[cx+CARD_W,CARD_Y+190+dy],[cx-CARD_W,CARD_Y+190+dy]],70+i,7,60);outline.push(qq);cards.addPath(polyPath(qq,true));frames.addPath(ribbon(qq,7,{seed:73+i,close:true,wobble:1.2,pressure:.5}));});
   s.knockout(cards);s.fill(Y,cards,.14);
   CARDS.forEach(([cx,tc0,kind],i)=>{const on=sm(tc0,tc0+.3,tt,easeOutBack);if(on<=.01)return;const gy=CARD_Y+dy+150;
    s.save();s.clip(polyPath(outline[i],true));
    const fc=figureCam({x:cx+10,y:gy+25,height:360*(.9+.1*on),azimuth:kind==='arm'?-90:kind==='turn'?20:80,elevation:14,fov:18,at:[0,0,0]});
    const pose=kind==='arm'?RECV:kind==='turn'?TURN:strike(STRIKE_CONTACT,{foot:'r'});
    // the step's diagram: arm = a red ring round the arm; turn = a yellow spin arc; finish = a yellow shot arrow
    const csk=solve(pose,BUILD,{}),P=(j:V3):Pt=>{const p=fc.project(j);return[p[0],p[1]];};
    if(kind==='turn'){const pts:Pt[]=[];for(let k=0;k<=10;k++){const a=k/10*2.4;pts.push(P([Math.cos(a)*.7,0,Math.sin(a)*.7]));}dashed(s,Y,pts,8,85,{dash:22});arrowHead(s,Y,pts,22,86);}
    if(kind==='finish'){const tb:V3=[csk.rToe[0]+.12,BALL_R,csk.rToe[2]],p0=P(tb),p1=P([tb[0]+1.6,.3,tb[2]]),pts:Pt[]=[p0,L2(p0,p1,.5),p1];dashed(s,Y,pts,8,87,{dash:22});arrowHead(s,Y,pts,24,88);const bR=BALL_R*(fc.scale?fc.scale(tb):100);ball(s,p0[0],p0[1],bR,81+i);}
    drawAthlete(s,pose,fc,{...FERRAO,detail:'mid',shadow:[K,.2]},{},{prev:pose});
    if(kind==='arm'){const e=P(csk.lEl),h=P(csk.lHa),c:Pt=[(e[0]+h[0])/2,(e[1]+h[1])/2];s.fill(R,ribbon(blob(c[0],c[1],34*on,28*on,90+i,{n:18}),6,{seed:93+i,close:true,wobble:1}),1);}
    s.restore();});
   s.fill(K,frames);}
  // "finish": a big blue-less tick (yellow over red, navy echo) stamps beside him
  const tick=easeOutBack(sm(C4.fin+.35,C4.fin+.7,tt));
  if(tick>.02){const g=fp(st,FB,piv.u,piv.v),h=kAt(st,PZ)*1.8,c:Pt=[g[0]+h*.62,g[1]-h*.8],S=h*.3*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(p=>[c[0]+p[0]*S,c[1]+p[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:409,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:410,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(p=>[p[0]+7,p[1]+7] as Pt),S*.24,{seed:408,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 still:C4.turn+.2,
};

const SCENES=[sc1,sc2,sc3,sc4];
const film:RisoStory={
 id:'ferrao-futsal-signature',format:'futsal',title:'Ferrão’s pivot turn',theme:'Hold the defender off with your arm and body, then turn and finish.',
 ageNote:'For players aged 7–12: the 2022 final and Ferrão’s goal are real; the turn is shown as a demonstration. Use your arm to feel, not to push.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball rolls in and stops under a sole; a curved spin arrow flicks round it; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=46;if(age<=0){ball(s,x,y,r,seed);return;}
  const roll=sm(0,.3,age,easeOut),bx=x+140*(1-roll);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.2,seed+2,{n:16}),true),.32);
  ball(s,bx,y,r,seed,{rot:(1-roll)*6});
  const sp=sm(.3,.7,age,easeOut)*(1-sm(.9,1.2,age));if(sp>.02){const pts:Pt[]=[];for(let k=0;k<=12;k++){const a=-.4-k/12*3.4*sp;pts.push([x+Math.cos(a)*r*1.9,y+Math.sin(a)*r*1.2]);}s.fill(Y,ribbon(pts,10,{seed,taper:.3,wobble:1}),1);s.fill(R,ribbon(pts.map(p=>[p[0]+4,p[1]+4] as Pt),4,{seed:seed+1,taper:.3,wobble:1}),.6);}
 },
};
export default film;
