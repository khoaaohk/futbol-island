/** Sergio Lozano — "the powerful ala strike": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHY THIS MOMENT: Lozano's entry (lib/town/iconicPlays.json) is a signature — the powerful strike of an ala (winger) — not one match.
 * The best-documented strike we could reach is his extra-time WINNER in the UEFA Futsal EURO 2012 final: UEFA.com's report credits
 * "Lozano's shooting prowess" and "a firm strike just as penalties loomed". It is a Spain match (not Barcelona), so it does not overlap the
 * Barcelona futsal films (Ferrão, Pito, Dídac Plana: the 2022 Futsal Champions League final) or Falcão's 2012 World Cup final film.
 *  1  LIVE (broadcast camera, main stand, real time): UEFA Futsal EURO 2012 final, 11 Feb 2012, Arena Zagreb, Russia 1–3 Spain (a.e.t.).
 *     Russia led (Pula 33:15) until Lozano's deflected drive 34 seconds from time (39:26) — 1–1. In the second period of extra time Lozano
 *     finds a yard of space and hits "a firm strike" (47:58) — 2–1.
 *  2  REPLAY (slow motion, low, behind the shooter): the yard of space, the firm strike, the net; 2–1, and Spain are champions
 *     (Luis Amado's clearance into the empty net at 50:00 made it 3–1; not shown).
 *  3  THE LESSON (a demonstration, no match claimed; neutral navy/paper defender and keeper): the futsal goal is small and the keeper is
 *     close, so with a yard of space shoot straight away — hard and low, past the keeper's feet. From the entry's `lesson`:
 *     "When you get a yard of space, shoot hard and low."
 * Sources (written; fetched once, ≤ 8 requests, cached in scratchpad/films/src-cache/):
 *  - UEFA.com match report "Lozano inspires Spain to final defeat of Russia", Wayne Harrison, Arena Zagreb, 11 Feb 2012 (archived 13 Feb 2012):
 *    https://web.archive.org/web/20120213083201/http://www.uefa.com:80/futsaleuro/season=2012/matches/round=2000150/match=2008820/postmatch/report/index.html
 *    — "Two goals from Sergio Lozano, his first cancelling out Pula's effort 34 seconds from time"; "Lozano's deflected drive dashed their
 *    hopes"; "In the second period of extra time, Lozano's shooting prowess broke Russian hearts again"; "Lozano, the top scorer in the
 *    Spanish league, got it with a firm strike just as penalties loomed"; "With Sergeev on as a flying goalkeeper, a shot into an unguarded
 *    net as the buzzer went" (Luis Amado); goal times Pula 33:15, Lozano 39:26 and 47:58, Luis Amado 50:00; Cirilo sent off 35:54; Russia's
 *    keeper Gustavo; Spain captain and keeper Luis Amado; earlier "Sergio Lozano fire wide with time and space".
 *  - Wikipedia, "UEFA Futsal Euro 2012" (raw): final 11 Feb 2012, 21:00, Russia 1–3 Spain a.e.t., Arena Zagreb, attendance 7,500.
 *  - Wikipedia, "Sergio Lozano (futsal player)" (raw): Spanish ala, Barcelona (no. 9), 1.81 m, born Madrid 1988; Euro 2012 winner; four
 *    UEFA Futsal Cups with Barcelona.
 *  - FIFA.com 2012 Futsal World Cup match summaries (Spain v Morocco, v Russia, v Italy; archived) — context: Lozano's "curling right-foot
 *    shot", "an unstoppable drive into the roof of the net", "shoot low beyond Mammarella"; Spain's no. 9 LOZANO in FIFA's 2012 line-ups.
 * CONFIRMED: match, date, venue, attendance, the score line (0–1 → 1–1 at 39:26 → 2–1 at 47:58 in the second period of extra time → 3–1),
 *  a "firm strike", Lozano right-footed (FIFA 2012: "curling right-foot shot"), Russia's keeper Gustavo, 5 v 5 at the time of the winner
 *  (Cirilo's red card was 12 minutes earlier; the two-minute penalty had long expired), Spain won the title.
 * INFERRED (not named in the narration): that the winner was right-footed, from the right wing, from about 12 m, low to the far post;
 *  the pass before it and every other player's position; the kits (Spain red shirts / navy shorts / red socks; Russia white shirts / blue
 *  shorts; Gustavo in yellow); Lozano's shirt number 9 at this EURO (it was 9 at the 2012 World Cup); which goal; his short dark hair.
 *  No video was reviewed. Chapter 3 is a demonstration of the lesson, not footage of a particular match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library z → −Z; the
 * strike uses the RIGHT foot (the library default).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: red (Spain, rings), yellow (Gustavo, lights, flight lines), blue (court, Russia shorts), navy (key line, run-off, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,dribble,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2012 final',text:'The 2012 Futsal Euro final. Russia lead, until Lozano scores with seconds left. One all! Now it is extra time. He finds a yard of space and strikes it firmly. Goal!',tail:2.6,
  cues:['The 2012','Russia lead','until Lozano','One all','Now it is','yard of space','strikes it','Goal'],heads:{'The 2012':'Euro final 2012','Russia lead':'0–1','One all':'1–1','Now it is':'Extra time','Goal':'2–1'}},
 {label:'Replay: the firm strike',text:'Watch again. He needs only a yard of space. Then bang, a firm strike! Two one, and Spain are champions of Europe!',tail:2,
  cues:['Watch again','only a yard','bang','firm strike','Two one','Spain are champions'],heads:{'Two one':'2–1','Spain are champions':'Champions'}},
 {label:'Shoot hard and low',text:'In futsal, the goal is small and the keeper is close. So when you get a yard of space, shoot straight away. Hard and low, past the keeper’s feet!',tail:2.6,
  cues:['In futsal','goal is small','keeper is close','yard of space','shoot straight','Hard and low','past the'],heads:{'yard of space':'A yard of space','Hard and low':'Hard and low'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/sergio-lozano-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/sergio-lozano-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/sergio-lozano-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('lozano: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('lozano: no cue '+w);return c.at;};
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
/** a dashed hand-drawn line; on the blue court it is knocked out to paper first so the ink prints clean (no overprint) */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;cov?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,cov=1,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,cov);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
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
const FACE_LEFT=Math.PI,FACE_RIGHT=0,FACE_CAMERA=-Math.PI/2;
const SKIN:InkFill[]=[[Y,.8],[R,.3]];
const BUILD={height:1.81,bulk:1};
/** Sergio Lozano: Spain (no. 9 inferred) — red shirt, navy shorts, red socks (kit inferred), short dark hair, 1.81 m, right-footed */
const LOZANO:AthleteStyle={shirt:R,shorts:K,socks:R,boots:K,skin:SKIN,hair:K,line:K,trim:Y,number:9,numberInk:Y,hairStyle:'short',build:BUILD,seed:9};
const ESP=(n:number):AthleteStyle=>({shirt:R,shorts:K,socks:R,boots:K,skin:[[Y,.72],[R,.22]],hair:K,line:K,trim:Y,hairStyle:n%2?'short':'balding',build:{height:1.72+hash(n,4)*.12},seed:40+n});
/** Russia (white shirts, blue shorts — inferred) */
const RUS=(n:number):AthleteStyle=>({shirt:'paper',shorts:B,socks:'paper',boots:K,skin:[[Y,.62],[R,.2]],hair:n%3?K:[Y,.9],line:K,trim:R,hairStyle:n%2?'short':'bald',build:{height:1.74+hash(n,3)*.12},seed:20+n});
/** Gustavo, Russia's keeper — a yellow keeper kit (inferred) */
const GUSTAVO:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.7],[R,.26]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.78},seed:62};
/** the demonstration defender and keeper: neutral paper/navy training kits (no team is claimed in chapter 3) */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:[[Y,.8],[R,.26]],hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
const DEMO_K:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:[[Y,.7],[R,.2]],hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.8},seed:78};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[R,.6],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact: just past the kicking toe along the foot (library coords, place at the origin) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT),BUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}

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

// ---------------- the arena: the stands (shared) ----------------
/** stepped navy rows, lit faces, red / yellow / blue shirts in the crowd, roof lights; cheer lifts the heads */
function stands(s:Sheet,top:number,kw:number,t:number,cheer:number,flash:number,scroll=0){
 const span=9000,rowH=.55*kw,rows=new Path2D();s.fill(K,rectPath(-span,top-span,span*2,span),.45);
 for(let r=0;r<12;r+=2)rows.rect(-span,top-(r+1)*rowH,span*2,rowH*.55);s.fill(K,rows,.6);s.fill(K,rectPath(-span,top-13*rowH-span,span*2,span),.75);
 const heads=new Path2D(),yel=new Path2D(),reds=new Path2D(),blues=new Path2D(),gap=.62*kw,off=scroll*kw,x0=-3200,x1=3200,tw=Math.floor(t*12);
 for(let r=0;r<11;r++){const y=top-(r+.55)*rowH;for(let x=x0-((off%gap)+gap)%gap+(r%2)*gap*.5;x<x1;x+=gap){const i=Math.round((x+off)/gap)*31+r*977,hsh=hash(i,3),jump=cheer*rowH*.55*Math.abs(Math.sin(tw*.9+hsh*6)),hx=x+(hsh-.5)*gap*.4,hy=y-jump;
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.12)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.34)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.44)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
 s.fill(Y,heads,.6);s.fill(Y,yel);s.fill(R,reds);s.fill(B,blues);
 const lights=[new Path2D(),new Path2D(),new Path2D()];for(let i=-4;i<=4;i++){const lx=i*6*kw-((off*.5)%(6*kw)),ly=top-15*rowH,rr=1.1*kw*(1+.5*flash);for(let k=0;k<3;k++)lights[k].addPath(polyPath(blob(lx,ly,rr*(1+(2-k)*.8),rr*(1+(2-k)*.8)*.7,40+i*3+k,{amp:.05,n:18}),true));}
 s.fill(Y,lights[0],.2);s.fill(Y,lights[1],.45);s.fill(Y,lights[2]);
}

// ---- LIVE court from the broadcast position: camera 13 m outside the near touchline, 6 m up; Russia's goal at X = +20 (inferred end) ----
const TOUCH_FAR=20,BOARDS=21.2,GOAL_X=20,POST_N=8.5,POST_F=11.5;
const bst=(camX:number):Stage=>({F:4500,eye:6,cx:camX,cz:-13});
function courtSide(s:Sheet,st:Stage,t:number,o:{cheer?:number;flash?:number;bulge?:number;bz?:number;by?:number;keeper?:()=>void}={}){
 const{cheer=0,flash=0,bulge=0,bz=10,by=1}=o,span=9000,wall=proj(st,0,0,BOARDS)[1],kw=kAt(st,BOARDS);
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-20,0,20,TOUCH_FAR),true);s.knockout(court,.25);s.fill(B,court,.82);
 s.fill(B,polyPath(floorQuad(st,-20,6,20,13),true),.12);
 // painted lines: touchlines, goal line, halfway, the penalty area (6 m arcs from the posts), the 6 m and 10 m marks, the centre circle
 const lines=new Path2D(),arc:Pt[]=[];
 for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_N-6*Math.cos(a)]);}
 for(let k=0;k<=8;k++){const a=Math.PI/2-k/8*Math.PI/2;arc.push([GOAL_X-6*Math.sin(a),POST_F+6*Math.cos(a)]);}
 for(const seg of[[[-20,0],[20,0]],[[-20,TOUCH_FAR],[20,TOUCH_FAR]],[[GOAL_X,0],[GOAL_X,TOUCH_FAR]],[[0,0],[0,TOUCH_FAR]]] as Pt[][])lines.addPath(polyPath(floorStrip(st,seg,.05),true));
 lines.addPath(polyPath(floorStrip(st,arc,.05),true));for(const X of[GOAL_X-6,GOAL_X-10])lines.addPath(polyPath(floorRing(st,X,10,.12,12),true));
 const cc:Pt[]=[];for(let k=0;k<=32;k++){const a=k/32*TAU;cc.push([Math.cos(a)*3,10+Math.sin(a)*3]);}lines.addPath(polyPath(floorStrip(st,cc,.05),true));
 s.knockout(lines,.94);
 s.knockout(rectPath(-span,wall-span,span*2,span));const board=.95*kw;s.fill(K,rectPath(-span,wall-board,span*2,board),.8);
 const ads=new Path2D();for(let i=-12;i<14;i++){const x0=proj(st,Math.floor(st.cx/3)*3+i*3+.3,0,BOARDS)[0],x1=proj(st,Math.floor(st.cx/3)*3+i*3+2.4,0,BOARDS)[0];ads.rect(x0,wall-board*.78,x1-x0,board*.52);}s.fill(Y,ads,.75);
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 sideGoal(s,st,bulge,bz,by);o.keeper?.();sidePosts(s,st);
}
/** the goal at X = +20 seen side-on: the net runs back to +X */
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

// ---- REPLAY / DEMO court facing the goal end (camera looks along +Z): goal centre (0, GZ), wall behind it ----
const GZ=11,WALLZ=13.4;
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;glow?:number};
/** the court seen end-on: blue floor + run-off, paper lines (goal line and the D), boards, stands, the goal */
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0,glow=0}=o;
 const wall=proj(st,0,0,WALLZ)[1],kw=kAt(st,WALLZ),board=.95*kw,span=6000;
 s.fill(B,rectPath(-span,wall,span*2,span),.6);s.fill(K,rectPath(-span,wall,span*2,span),.38);
 const court=polyPath(floorQuad(st,-10,-30,10,GZ),true);s.knockout(court,.25);s.fill(B,court,.82);
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
 s.fill(R,rectPath(-span,wall-board-5,span*2,Math.max(6,board*.08)));
 stands(s,wall-board,kw,t,cheer,flash,st.cx);
 goalEnd(s,st,bulge,bx,by,glow);o.keeper?.(st);postsEnd(s,st);
}
function goalEnd(s:Sheet,st:Stage,bulge:number,bx:number,by:number,glow:number){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((X-bx)**2+(Yh-by)**2)/.35);return proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H)+d);};
 const out=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 // "the goal is small": the mouth glows yellow (only 3 × 2 m)
 if(glow>.02)s.fill(Y,polyPath([out[0],out[1],out[2],out[3]],true),.45*glow);
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

// ================= chapter 1 — LIVE: the EURO 2012 final, extra time, 47:58; a yard of space on the right, a firm strike =================
const C1={russia:A(0,'Russia lead'),until:A(0,'until'),one:A(0,'One all'),now:A(0,'Now it'),yard:A(0,'yard of'),strikes:A(0,'strikes'),goal:A(0,'Goal'),end:AUTH[0].seconds};
/** the shot: contact just after "strikes"; ≈26 m/s → about half a second, low, to the far post */
const T_HIT=C1.strikes+.5,T_IN=T_HIT+.52;
const SHOT:[number,number]=[8.5,4.4],LOWC:V3=[GOAL_X-.1,.26,POST_F-.32];
const YAW_SHOT=yawTo(LOWC[0]-SHOT[0],LOWC[2]-SHOT[1]);
const SB=toMine(strikeBall(YAW_SHOT)),PLANT:[number,number]=[SHOT[0]-SB[0],SHOT[1]-SB[2]];
/** passes: the deep man → the far wing → back → Lozano on the right (inferred build-up, rolling on the floor) */
const DEEP:[number,number]=[1.8,9.6],WING:[number,number]=[7.2,16.4],RECV:[number,number]=[6.9,4.0];
const P1=[.7,1.6],P2=[C1.until+.2,C1.until+1.1],P3=[C1.now-.1,C1.now+.7];
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 const roll=(a:[number,number],b:[number,number],t0:number,t1:number)=>{const u=sm(t0,t1,T,easeOut);return{X:lerp(a[0],b[0],u),Y:BALL_R,Z:lerp(a[1],b[1],u),flying:false,spin:u*8};};
 if(T<P1[0])return{X:DEEP[0]+.45,Y:BALL_R,Z:DEEP[1],flying:false,spin:0};
 if(T<P2[0])return roll([DEEP[0]+.45,DEEP[1]],[WING[0]-.4,WING[1]-.3],P1[0],P1[1]);
 if(T<P3[0])return roll([WING[0]-.4,WING[1]-.3],[DEEP[0]+.5,DEEP[1]-.2],P2[0],P2[1]);
 if(T<P3[1]+.02)return roll([DEEP[0]+.5,DEEP[1]-.2],RECV,P3[0],P3[1]);
 if(T<T_HIT){const u=sm(P3[1]+.1,T_HIT-.35,T,easeOut);return{X:lerp(RECV[0]+.3,SHOT[0],u),Y:BALL_R,Z:lerp(RECV[1],SHOT[1],u),flying:false,spin:8+u*6};}
 if(T<T_IN){const u=sm(T_HIT,T_IN,T,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(SHOT[0],LOWC[0],.5),.42,lerp(SHOT[1],LOWC[2],.5)];
  return{X:a*SHOT[0]+b*M[0]+c*LOWC[0],Y:a*BALL_R+b*M[1]+c*LOWC[1],Z:a*SHOT[1]+b*M[2]+c*LOWC[2],flying:true,spin:20+u*40};}
 const d=sm(T_IN+.1,T_IN+.4,T,easeIn);
 return{X:GOAL_X+.6,Y:lerp(LOWC[1],BALL_R,d),Z:LOWC[2]-.15,flying:false,spin:60};
}
/** Lozano live: drifts wide right → opens up for the pass → cushions it → touches inside for a yard of space → right-foot strike → wheels away */
const S_T0=T_HIT-.62,touchStart=.2;
const liveL:Gen=T=>{
 const stT=key(T,[[S_T0,0],[S_T0+.3,.22],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,1]],linear);
 const X=key(T,[[0,5.2],[P3[0]-.4,6.2,easeIO],[P3[1],RECV[0]-.45],[S_T0,PLANT[0]-.55,easeIO],[T_HIT,PLANT[0],easeOut],[T_HIT+.5,PLANT[0]+.35,easeOut],[C1.end,PLANT[0]+2.6,easeIO]]);
 const Z=key(T,[[0,5.8],[P3[0]-.4,4.6,easeIO],[P3[1],RECV[1]+.2],[S_T0,PLANT[1]+.2,easeIO],[T_HIT,PLANT[1],easeOut],[T_HIT+.5,PLANT[1]-.2,easeOut],[C1.end,2.1,easeIO]]);
 let pose:Pose,yaw=FACE_RIGHT;
 if(T<P3[0]-.4)pose=blendPose(runCycle(T*runCadence(.25),{speed:.25}),stand(),sm(P3[0]-1.2,P3[0]-.4,T));
 else if(T<P3[1]+.1){pose=blendPose(stand(),posed({rHipF:30,rKnee:30,rAnk:-6,rHipR:30,lKnee:24,lean:14,neckP:24,neckY:30,lShA:36,rShA:30,lElb:40,rElb:40}),sm(P3[0],P3[1],T));yaw=lerp(FACE_RIGHT,FACE_RIGHT+2.2,sm(P3[0]-.4,P3[1]-.1,T))-2.2*sm(P3[1],P3[1]+.4,T);}
 else if(T<S_T0)pose=dribble((T-P3[1])*1.6+touchStart,{foot:'r',speed:.3});
 else if(T<T_HIT+.55)pose=blendPose(dribble((S_T0-P3[1])*1.6+touchStart,{foot:'r',speed:.3}),strike(stT),sm(S_T0,S_T0+.12,T));
 else{const u=sm(T_HIT+.55,T_HIT+1.1,T,easeIO);pose=blendPose(strike(1),celebrate((T-T_HIT-.55)*1.3,{kind:'run'}),u);yaw=lerp(YAW_SHOT,yawTo(.8,-1),u);}
 if(T>=S_T0&&T<T_HIT+.55)yaw=lerp(FACE_RIGHT,YAW_SHOT,sm(S_T0,S_T0+.3,T));
 if(T>=P3[1]+.1&&T<S_T0)yaw=FACE_RIGHT+.2;
 return{pose,yaw,X,Z};
};
/** Russia (white, faces −X): a compact box that shifts with the ball; the marker (0) steps out and lunges a yard too late; heads drop */
type Mark={x:number[];z:number[];ph:number};
const RUSSIA:Mark[]=[{x:[10.8,11.4,10.6],z:[6.2,6.6,5.3],ph:.1},{x:[11.8,12.6,13.0],z:[11.2,13.4,10.2],ph:.4},{x:[14.8,14.4,15.4],z:[15.4,15.8,13.8],ph:.7},{x:[16.6,16.8,16.4],z:[8.6,9.4,8.0],ph:.2}];
const russiaAt=(m:Mark,T:number):[number,number]=>{const u1=sm(P1[0],P2[0],T),u2=sm(P2[0],P3[1]+.6,T);return[lerp(lerp(m.x[0],m.x[1],u1),m.x[2],u2),lerp(lerp(m.z[0],m.z[1],u1),m.z[2],u2)];};
const liveRus=(i:number):Gen=>T=>{const m=RUSSIA[i],[X,Z]=russiaAt(m,T),post=sm(T_IN+.3,T_IN+1.3,T);let pose=backpedal(T*1.4+m.ph);
 if(i===0){const lu=key(T,[[T_HIT-.35,0],[T_HIT+.05,.6],[T_HIT+.6,1]],linear);pose=blendPose(pose,lunge(lu,{side:'l'}),sm(T_HIT-.45,T_HIT-.3,T));}
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20}),post);
 const step=i===0?sm(P3[1],T_HIT-.3,T):0;
 return{pose,yaw:lerp(FACE_LEFT,FACE_LEFT+.4*(i%2?1:-1),post)+(i===0?-.35*step:0),X:X-.45*step,Z:Z-.1*step};};
/** Spain's other three (red): the deep man, the far wing, the pivot on the far post; after the goal they run to Lozano */
const ESP_POS:[number,number][]=[DEEP,WING,[15.6,13.2]];
const liveEsp=(i:number):Gen=>T=>{const[x0,z0]=ESP_POS[i],go=sm(T_IN+.25,C1.end,T,easeIO),f=liveL(C1.end);const X=lerp(x0,f.X+[-1.4,-1.2,1.2][i],go),Z=lerp(z0,f.Z+[.9,1.5,.8][i],go);
 const kick=i===0?Math.max(pulse(T,P1[0]-.05,.3),pulse(T,P3[0]-.05,.3)):i===1?pulse(T,P2[0]-.05,.3):0;
 let pose=blendPose(stand(),posed({lHipF:-10,rHipF:40,rKnee:20,rAnk:30,lKnee:20,lean:10,lShA:40,rShA:30}),Math.min(1,kick*2));
 if(go>0)pose=blendPose(pose,celebrate(T*1.1+i*.3,{kind:'run'}),sm(T_IN+.25,T_IN+.7,T));
 const face=i===0?(T<P2[1]?yawTo(WING[0]-DEEP[0],WING[1]-DEEP[1]):yawTo(RECV[0]-DEEP[0],RECV[1]-DEEP[1])):i===1?yawTo(DEEP[0]-WING[0],DEEP[1]-WING[1]):FACE_LEFT+.3;
 return{pose,yaw:go>0?yawTo(f.X-x0,f.Z-z0):face,X,Z};};
/** Gustavo: set near his near post (the ball is on the right), then a late low dive toward the far post */
const DIVE0=T_HIT+.06;
const liveK:Gen=T=>{let pose=keeperSet(T*1.3),yaw=FACE_LEFT;
 if(T>=DIVE0){const u=sm(DIVE0,DIVE0+.9,T,linear)*.95;pose=blendPose(keeperSet(DIVE0*1.3),keeperDive(u,{side:'r',height:.05}),sm(DIVE0,DIVE0+.1,T));}
 return{pose,yaw,X:GOAL_X-.8,Z:lerp(10.0,9.3,sm(P3[0],P3[1]+.8,T))+.9*sm(DIVE0+.1,DIVE0+.6,T,easeOut)};};
const liveCam=(T:number)=>({x:key(T,mono([[0,5.4],[P1[1],6.6],[P2[1],5.8],[P3[1],7.8],[C1.yard,9.4],[S_T0,11.2],[T_HIT,12.3],[T_IN,12.9],[T_IN+.4,13.1],[T_IN+1.2,12.6],[C1.end-1,11.6],[C1.end,11.4]]),easeInOutSine),
 zoom:key(T,mono([[0,.6],[P2[1],.6],[C1.yard,.66],[S_T0,.56],[T_HIT,.5],[T_IN,.5],[T_IN+.9,.62],[C1.end,.8]]),easeInOutSine),
 y:key(T,mono([[0,1060],[C1.yard,1060],[T_HIT,1050],[T_IN,1030],[C1.end,1070]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_HIT,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.1+.5*pulse(T,C1.one,1.2),flash:pulse(T,T_IN,1.2)+.5*pulse(T,C1.one,1),bulge:.5*sm(T_IN-.12,T_IN,T)*(1-.6*sm(T_IN+.2,T_IN+1.1,T))+.12*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:LOWC[2],by:LOWC[1],
  keeper:()=>{athlete(s,st,liveK,T,GUSTAVO,{detail:'low'});}});
 // "until Lozano": a red ring finds him; "a yard of space": a yellow dashed ring round him, the marker kept outside it
 const L=liveL(T);
 const find=easeOutBack(sm(C1.until,C1.until+.35,T))*(1-sm(C1.one,C1.one+.4,T));floorDashRing(s,st,R,L.X,L.Z,.75,6,501,find);
 const yard=easeOutBack(sm(C1.yard,C1.yard+.35,T))*(1-sm(T_HIT-.1,T_HIT+.15,T));floorDashRing(s,st,Y,L.X,L.Z,1,11,502,yard);
 // everyone back to front by depth (far side first); the ball slots in by its depth
 type It={z:number;draw:()=>void};const items:It[]=[];
 RUSSIA.forEach((_,i)=>{const g=liveRus(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,RUS(i),{detail:'low'})});});
 ESP_POS.forEach((_,i)=>{const g=liveEsp(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,ESP(i),{detail:'low'})});});
 items.push({z:L.Z,draw:()=>athlete(s,st,liveL,T,LOZANO,{smear:T>T_HIT-.2&&T<T_HIT+.25?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45);
  if(b.flying){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_HIT,T-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.5,{seed:17,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.5:0,dir:Math.atan2(-.15,1)});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
}
/** Lozano's chest (the passage enters his red shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveL(tt),.12));},still:T_HIT+.05};

// ================= chapter 2 — REPLAY: slow motion, low, behind the shooter: the yard of space, bang, the firm strike, 2–1 =================
const C2={watch:A(1,'Watch'),only:A(1,'only a'),bang:A(1,'bang'),firm:A(1,'firm'),two:A(1,'Two one'),champ:A(1,'Spain are'),end:AUTH[1].seconds};
/** replay world = the live shot seen end-on: the goal line 11.8 m ahead; he is 3.1 m right of centre; the ball goes low to the far post (screen left) */
const RB:[number,number]=[3.1,GZ-11.8],RT:V3=[-1.22,.26,GZ-.02];
const RYAW=yawTo(RT[0]-RB[0],RT[2]-RB[1]);
const RSB=toMine(strikeBall(RYAW)),RPL:[number,number]=[RB[0]-RSB[0],RB[1]-RSB[2]];
const R_HIT=C2.bang+.15,R_IN=R_HIT+1.35;
const rT=(t:number)=>key(t,[[0,.06],[R_HIT-.9,.3],[R_HIT,STRIKE_CONTACT],[R_HIT+1.6,.8],[C2.champ,1]],linear);
const repL:Gen=t=>{let pose=strike(rT(t)),yaw=RYAW;const X=RPL[0]+key(t,[[0,.35],[R_HIT,0,easeOut],[R_HIT+1.8,-.2]]),Z=RPL[1]+key(t,[[0,-.55],[R_HIT,0,easeOut],[R_HIT+1.8,.25]]);
 if(t>C2.champ-.2){const u=sm(C2.champ-.2,C2.champ+.5,t,easeIO);pose=blendPose(pose,celebrate((t-C2.champ)*1.2,{kind:'arms'}),u);yaw=lerp(RYAW,FACE_CAMERA-.5,u);}
 return{pose,yaw,X,Z};};
function repBall(t:number){if(t<R_HIT)return{X:RB[0],Y:BALL_R,Z:RB[1],flying:false};
 if(t<R_IN){const u=sm(R_HIT,R_IN,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(RB[0],RT[0],.5),.44,lerp(RB[1],RT[2],.5)];return{X:a*RB[0]+b*M[0]+c*RT[0],Y:a*BALL_R+b*M[1]+c*RT[1],Z:a*RB[1]+b*M[2]+c*RT[2],flying:true};}
 const d=sm(R_IN+.2,R_IN+.8,t,easeIn);return{X:RT[0],Y:lerp(RT[1],BALL_R,d),Z:GZ+.6,flying:false};}
/** Gustavo in the replay: set, then the late low dive to his right (screen left) — the ball is past his hands */
const RDIVE=R_HIT+.35;
const repK:Gen=t=>{let pose=keeperSet(t*.5);if(t>=RDIVE)pose=blendPose(keeperSet(RDIVE*.5),keeperDive(sm(RDIVE,RDIVE+2.2,t,linear)*.95,{side:'r',height:.05}),sm(RDIVE,RDIVE+.2,t));
 return{pose,yaw:FACE_CAMERA,X:.35-.7*sm(RDIVE+.2,RDIVE+1.4,t,easeOut),Z:GZ-.75};};
/** the marker a yard away (lunges too late) and a white shirt on the far side */
const REPD:{X:number;Z:number}[]=[{X:RB[0]-1.1,Z:RB[1]+2.3},{X:-2.6,Z:GZ-4.4}];
const repD=(i:number):Gen=>t=>{const base=REPD[i];const lu=key(t,[[R_HIT-.6,0],[R_HIT+.5,.6],[R_HIT+2,1]],linear);
 return{pose:i?blendPose(backpedal(.3),stand(),sm(R_HIT,R_HIT+1,t)):blendPose(backpedal(.2+t*.3),lunge(lu,{side:'r'}),sm(R_HIT-.7,R_HIT-.4,t)),yaw:FACE_CAMERA+(i?.3:-.4),X:base.X,Z:base.Z};};
const st2=(t:number):Stage=>({F:1500,eye:1.5,cx:1.3,cz:RB[1]-5+.4*sm(R_HIT,R_IN,t,easeIO)});
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(tt),hit=pulse(t,R_HIT,.4),net=pulse(t,R_IN,.6);
  camPath(s,t,[[0,330,230,1.35],[C2.only-.2,320,250,1.45],[R_HIT,300,240,1.4],[R_HIT+.6,120,200,1.2],[R_IN-.3,-60,150,1.4],[R_IN,-90,140,1.6],[C2.two+.2,-90,140,1.65],[C2.champ,40,170,1.2],[C2.end,60,180,1.15]],[8*hit*Math.sin(t*90),5*hit*Math.cos(t*77)+4*net*Math.sin(t*60)]);
  const b=repBall(tt),goal=tt>=R_IN;
  arena(s,st,{t:tt,cheer:goal?1-.3*sm(C2.end-1,C2.end,tt):0,flash:pulse(tt,R_IN,1.2)+.6*pulse(tt,C2.champ,1.4),bulge:.55*sm(R_IN-.2,R_IN,tt)*(1-.6*sm(R_IN+.4,R_IN+1.4,tt))+.12*settle(tt,R_IN,{amp:1,freq:3,decay:3}),bx:RT[0],by:RT[1],
   keeper:stg=>{athlete(s,stg,repK,tt,GUSTAVO,{detail:'mid'});}});
  // "only a yard": a yellow dashed ring between him and the marker, with a short red reach arrow that stops short
  const yard=easeOutBack(sm(C2.only,C2.only+.35,tt))*(1-sm(R_HIT+.2,R_HIT+.6,tt));
  if(yard>.02){floorDashRing(s,st,Y,RPL[0]+.1,RPL[1],1,10,601,yard);
   const d=REPD[0],a=proj(st,d.X+.3,0,d.Z-.2),c=proj(st,d.X+.75,0,d.Z-.55);const pts=[a,L2(a,c,.5),c],q=partial(pts,sm(C2.only+.2,C2.only+.7,tt,easeOut));if(q.length>1){const rp=ribbon(q,11,{seed:602,taper:.2,wobble:1});s.knockout(rp);s.fill(R,rp);arrowHead(s,R,q,30,603);}}
  // "firm strike": the flight line (dashed yellow, drawn as the ball goes) with speed lines behind the ball
  if(tt>R_HIT){const pts:Pt[]=[];for(let k=0;k<=18;k++){const q=repBall(lerp(R_HIT,Math.min(tt,R_IN),k/18));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,95,{dash:44});}
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(-.08,-1);shadow(s,g[0],g[1],r*1.1,r*.3,96,b.flying?.3:.45);
   if(b.flying&&tt>C2.firm-.1)speedLines(s,R,p[0],p[1],dir,{n:5,seed:604+Math.floor(tt*6),len:r*3.5,spread:r*.8,width:5});
   ball(s,p[0],p[1],r,97,{rot:tt*6,smear:b.flying?.5:0,dir});
   if(tt>=R_HIT&&tt<R_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:98,g:easeOut(sm(R_HIT,R_HIT+.3,tt))});};
  const its:{z:number;draw:()=>void}[]=[1,0].map(i=>{const g=repD(i);return{z:g(tt).Z,draw:()=>{athlete(s,st,g,tt,RUS(i),{detail:'mid'});}};});
  its.push({z:repL(tt).Z,draw:()=>{athlete(s,st,repL,tt,LOZANO,{detail:'high',smear:tt>R_HIT-.5&&tt<R_HIT+.4?.3:0});}},{z:b.Z<repL(tt).Z+.4&&!b.flying?repL(tt).Z+.01:b.Z,draw:drawBall});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=R_IN&&tt<R_IN+1.2){const p=proj(st,RT[0],RT[1],GZ+.4);sparkBurst(s,Y,p[0],p[1],130,{n:12,seed:99,g:easeOut(sm(R_IN,R_IN+.3,tt))*(1-sm(R_IN+.8,R_IN+1.2,tt))});}
  // "Spain are champions": red and yellow confetti falls in front of the stands
  if(tt>=C2.champ){const u=sm(C2.champ,C2.champ+2.5,tt,linear),top=proj(st,0,6,WALLZ)[1];confetti(s,[R,Y,'paper'],[-900,top-200+u*500,1800,420],26,Math.floor(tt*6),{size:16});}
 },
 aperture(t0){const{tt}=clock(1,t0),st=st2(tt),b=repBall(tt),p=proj(st,b.X,b.Y,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R)*1.1,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);}return aperture(q);},
 still:R_HIT+.5,
};

// ================= chapter 3 — THE LESSON (demonstration): small goal, close keeper; a yard of space → shoot at once, hard and low =================
const C3={futsal:A(2,'In futsal'),small:A(2,'goal is'),close:A(2,'keeper is'),yard:A(2,'yard of'),shoot:A(2,'shoot'),hard:A(2,'Hard'),past:A(2,'past'),end:AUTH[2].seconds};
/** the demo: he receives on the right, 9 m out, touches it out of the defender's reach, strikes low to the far post (screen left) */
const DB0:[number,number]=[4.6,GZ-10.2],DB1:[number,number]=[3.2,GZ-8.9],DT:V3=[-1.2,.24,GZ-.02];
const DYAW=yawTo(DT[0]-DB1[0],DT[2]-DB1[1]);
const DSB=toMine(strikeBall(DYAW)),DPL:[number,number]=[DB1[0]-DSB[0],DB1[1]-DSB[2]];
const D_HIT=C3.shoot+.45,D_IN=C3.past+.35;
/** his stance centre: jog in, the touch inside (on "a yard of space"), the plant, then follow through and away */
const dT=(t:number)=>key(t,[[D_HIT-.62,0],[D_HIT-.32,.22],[D_HIT,STRIKE_CONTACT],[D_HIT+1.4,.85],[C3.end,1]],linear);
const demoL:Gen=t=>{const X=key(t,[[0,DB0[0]+1.4],[C3.yard,DB0[0]-.35,easeOut],[D_HIT-.62,DPL[0]+.5,easeIO],[D_HIT,DPL[0],easeOut],[D_HIT+1.6,DPL[0]-.3]]),Z=key(t,[[0,DB0[1]-1.2],[C3.yard,DB0[1]-.3,easeOut],[D_HIT-.62,DPL[1]-.3,easeIO],[D_HIT,DPL[1],easeOut],[D_HIT+1.6,DPL[1]+.3]]);
 let pose:Pose,yaw=yawTo(-.55,1);
 if(t<C3.yard-.4)pose=runCycle(t*runCadence(.3),{speed:.3});
 else if(t<D_HIT-.62)pose=blendPose(runCycle((C3.yard-.4)*runCadence(.3),{speed:.3}),dribble((t-C3.yard)*1.6+.2,{foot:'r',speed:.3}),sm(C3.yard-.4,C3.yard,t));
 else pose=blendPose(dribble((D_HIT-.62-C3.yard)*1.6+.2,{foot:'r',speed:.3}),strike(dT(t)),sm(D_HIT-.62,D_HIT-.5,t));
 if(t>=D_HIT-.62)yaw=lerp(yawTo(-.55,1),DYAW,sm(D_HIT-.62,D_HIT-.3,t));
 return{pose,yaw,X,Z};};
function demoBall(t:number){
 if(t<C3.yard)return{X:DB0[0]+.2,Y:BALL_R,Z:DB0[1]+.15,flying:false};
 if(t<D_HIT){const u=sm(C3.yard,D_HIT-.4,t,easeOut);return{X:lerp(DB0[0]+.2,DB1[0],u),Y:BALL_R,Z:lerp(DB0[1]+.15,DB1[1],u),flying:false};}
 if(t<D_IN){const u=sm(D_HIT,D_IN,t,linear),a=(1-u)*(1-u),b=2*u*(1-u),c=u*u,M:V3=[lerp(DB1[0],DT[0],.5),.4,lerp(DB1[1],DT[2],.5)];return{X:a*DB1[0]+b*M[0]+c*DT[0],Y:a*BALL_R+b*M[1]+c*DT[1],Z:a*DB1[1]+b*M[2]+c*DT[2],flying:true};}
 const d=sm(D_IN+.2,D_IN+.7,t,easeIn);return{X:DT[0],Y:lerp(DT[1],BALL_R,d),Z:GZ+.6,flying:false};}
/** the defender closes but stays a yard off; lunges too late */
const DD:[number,number]=[1.9,GZ-7.6];
const demoD:Gen=t=>{const lu=key(t,[[D_HIT-.3,0],[D_HIT+.5,.6],[D_HIT+2,1]],linear),close=sm(C3.futsal,C3.yard+.3,t,easeIO);
 return{pose:blendPose(backpedal(t*1.2),lunge(lu,{side:'r'}),sm(D_HIT-.4,D_HIT-.25,t)),yaw:yawTo(1.2,-1),X:DD[0]-.6+.6*close,Z:DD[1]+.8-.8*close};};
/** the keeper steps off his line (close), then goes down late — the low ball beats his hands, past his feet */
const KD=D_HIT+.45;
const demoK:Gen=t=>{let pose=keeperSet(t*.9);if(t>=KD)pose=blendPose(keeperSet(KD*.9),keeperDive(sm(KD,D_IN+.8,t,linear)*.9,{side:'r',height:0}),sm(KD,KD+.2,t));
 return{pose,yaw:FACE_CAMERA+.25,X:.4-.5*sm(KD,D_IN,t,easeOut),Z:GZ-.6-.9*sm(C3.close,C3.close+.6,t,easeIO)};};
const st3:Stage={F:1500,eye:2.3,cx:1.2,cz:GZ-16};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  camPath(s,t,[[0,-40,120,1.05],[C3.small-.2,-120,40,1.3],[C3.close,-120,60,1.3],[C3.yard,140,260,1.2],[C3.shoot,120,250,1.18],[C3.hard,-10,170,1.1],[C3.past,-110,120,1.3],[C3.end,-70,150,1.2]]);
  const b=demoBall(tt),goal=tt>=D_IN;
  arena(s,st,{t:tt,cheer:goal?.7*(1-sm(C3.end-1,C3.end,tt)):0,flash:pulse(tt,D_IN,1),glow:sm(C3.small,C3.small+.3,tt)*(1-sm(C3.close+.4,C3.close+.8,tt)),
   bulge:.5*sm(D_IN-.2,D_IN,tt)*(1-.6*sm(D_IN+.4,D_IN+1.4,tt))+.1*settle(tt,D_IN,{amp:1,freq:3,decay:3}),bx:DT[0],by:DT[1],
   keeper:stg=>{athlete(s,stg,demoK,tt,DEMO_K,{detail:'mid'});}});
  // "the keeper is close": red brackets snap round him as he steps out (knocked out first so they print clean over the net)
  {const kp=demoK(tt),g=proj(st,kp.X,0,kp.Z),h=1.8*kAt(st,kp.Z),fr=easeOutBack(sm(C3.close,C3.close+.3,tt))*(1-sm(C3.yard,C3.yard+.4,tt));
   if(fr>.02){const w=h*.42,hh=h*.58,cx=g[0],cy=g[1]-h*.5,Lb=h*.2*fr,br=new Path2D();
    for(const[sx,sy] of[[-1,-1],[1,-1],[1,1],[-1,1]] as Pt[]){const x=cx+sx*w,y=cy+sy*hh;br.addPath(ribbon([[x,y-sy*Lb],[x,y],[x-sx*Lb,y]],13,{seed:92+sx+sy*3,taper:0,wobble:.6}));}
    s.knockout(br);s.fill(R,br);floorDashRing(s,st,R,kp.X,kp.Z,.75,10,703,fr);}}
  // "Hard and low": a red dashed band at knee height across the goal — under it is where keepers find it hardest
  {const lo=sm(C3.hard,C3.hard+.4,tt,easeOut)*(1-sm(C3.end-.8,C3.end-.3,tt));
   if(lo>.02){const a=proj(st,-1.55,.5,GZ-.05),c=proj(st,-1.55+3.1*lo,.5,GZ-.05);dashed(s,R,[a,L2(a,c,.5),c],20,701,{dash:34});}}
  // "a yard of space": the yellow ring round him and the ball, the defender kept outside it
  const L=demoL(tt),yard=easeOutBack(sm(C3.yard,C3.yard+.35,tt))*(1-sm(D_HIT,D_HIT+.3,tt));
  floorDashRing(s,st,Y,L.X-.1,L.Z+.2,.95,10,702,yard);
  // the flight line (drawn as the ball goes), low along the floor
  if(tt>D_HIT){const pts:Pt[]=[];for(let k=0;k<=16;k++){const q=demoBall(lerp(D_HIT,Math.min(tt,D_IN),k/16));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,703,{dash:40});if(goal)arrowHead(s,Y,pts,34,704);}
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(-.05,-1);shadow(s,g[0],g[1],r*1.1,r*.3,705,.45);
   if(b.flying&&tt>C3.hard-.1)speedLines(s,R,p[0],p[1],dir,{n:5,seed:706+Math.floor(tt*6),len:r*3.2,spread:r*.8,width:5});
   ball(s,p[0],p[1],r,707,{rot:tt*6,smear:b.flying?.4:0,dir});if(tt>=D_HIT&&tt<D_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:708,g:easeOut(sm(D_HIT,D_HIT+.3,tt))});};
  const its:{z:number;draw:()=>void}[]=[{z:demoD(tt).Z,draw:()=>athlete(s,st,demoD,tt,DEMO_D,{detail:'mid'})},{z:L.Z,draw:()=>athlete(s,st,demoL,tt,LOZANO,{detail:'high',smear:tt>D_HIT-.3&&tt<D_HIT+.3?.2:0})},
   {z:!b.flying&&tt<D_HIT?L.Z-.01:b.Z,draw:drawBall}];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=D_IN&&tt<D_IN+1){const p=proj(st,DT[0],DT[1],GZ+.4);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:709,g:easeOut(sm(D_IN,D_IN+.3,tt))*(1-sm(D_IN+.7,D_IN+1,tt))});}
  // "past the keeper's feet": a big yellow tick stamps beside the goal, with a navy misregistered echo
  const tick=easeOutBack(sm(D_IN+.1,D_IN+.45,tt));
  if(tick>.02){const c=proj(st,2.6,1.3,GZ),S=150*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:710,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:711,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:712,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoL(tt),.13));},
 still:D_HIT+.6,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'sergio-lozano-futsal-signature',format:'futsal',title:'Sergio Lozano’s firm strike',theme:'With a yard of space, shoot hard and low.',
 ageNote:'For players aged 7–12: the 2012 EURO final winner is real; the last chapter is a demonstration of the lesson.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball is struck low across the touch point with red speed lines and a yellow skid mark; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.6),bx=x-120+240*easeOut(u);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.22,seed+2,{n:16}),true),.3);
  if(u<1){const sk=ribbon([[x-130,y+r*.9],[bx-r,y+r*.9]],10*(1-u)+3,{seed,taper:.6,wobble:1});s.fill(Y,sk,1);speedLines(s,R,bx,y,0,{n:4,seed:seed+1,len:r*3,spread:r*.8,width:5});}
  ball(s,bx,y,r,seed,{rot:age*12,smear:u<1?.4*(1-u):0,dir:0});
 },
};
export default film;
