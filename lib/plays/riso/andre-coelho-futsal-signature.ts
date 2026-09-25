/** André Coelho — "the fixo's long-range strike": a signature-move riso film (iconic plays, FUTSAL).
 *
 * WHY THIS MOMENT: Coelho's entry (lib/town/iconicPlays.json) is a signature — the fixo's hard, low strike from distance — not one match.
 * The best-documented Coelho strike we could reach in writing is his EQUALISER in the UEFA Futsal EURO 2022 FINAL: UEFA.com's report says
 * "André Coelho's driven kick-in deflected in off the leg of the luckless Putilov" (Russia's keeper) — a hard strike from the touchline that
 * the keeper could not hold, exactly the signature (and the lesson: a hard, low ball is the hardest to save). The film recreates THAT goal.
 * It does not overlap the other futsal films (Zicky Té: the EURO 2022 semi v Spain, with the final only as a 4–2 board; Pany Varela: the
 * 2021 World Cup final; Lozano / Luis Amado: EURO 2012; Mammarella: EURO 2014; Pito / Ferrão / Dídac Plana: the 2022 Champions League final).
 *  1  LIVE (broadcast camera, main stand, real time): UEFA Futsal EURO 2022 final, 6 Feb 2022, Ziggo Dome, Amsterdam, Portugal v Russia.
 *     Russia lead 2–1 (Sokolov 9'49", Afanasyev 12'45"; Tomás Paçó 18'39"). 26'45": Portugal kick-in; Coelho drives it at goal; it hits
 *     Putilov's leg and goes in — 2–2.
 *  2  REPLAY (slow motion, low, from behind the kick-in): the ball on the line, the hard hit, the deflection off the keeper's leg, the net.
 *     Then the camera lifts to the hanging board: 3–2 (Coelho again, 31'16"), 4–2 (Pany, 39'59"), Portugal champions of Europe. The
 *     3–2 and 4–2 goals are NOT staged — only the board and the confetti.
 *  3  THE LESSON (a demonstration, no match claimed; neutral paper/navy defender and keeper): a keeper's hands are high, so a low ball makes
 *     him get all the way down, and legs get in the way. From the entry's `lesson`: "Strike low and hard; in futsal a low shot is hardest to
 *     save." Coelho strikes low and hard from 11 m, central, right foot (the card's params).
 * Sources (written; ≤ 8 requests, 5 s apart, cached in scratchpad/films/src-cache/):
 *  - UEFA.com, "UEFA Futsal EURO final highlights: Portugal beat Russia to retain title with comeback" (Sunday 6 Feb 2022):
 *    https://www.uefa.com/futsaleuro/news/0272-1461d5781457-636d190825b6-1000--uefa-futsal-euro-final-highlights-portugal-beat-russia-to-r/
 *    — Sokolov's opener "under the unsighted André Sousa"; Afanasyev's second from Antoshkin's ball; "Tomás Paço caught out Dmitri Putilov
 *    with a low shot after a Bruno Coelho kick-in" (before the break); "Russia started the second half strongly, Nando hitting the post";
 *    "André Coelho's driven kick-in deflected in off the leg of the luckless Putilov"; "André Coelho made it 3-2 as he got to the far post
 *    and turned the ball in after Miguel Ângelo had sent a low cross from the left"; Pany "dribbled the ball into an empty net in the
 *    closing seconds"; Portugal retain the title, 4-2.
 *  - Wikipedia, "UEFA Futsal Euro 2022" (raw): final 6 Feb 2022, 17:30, Ziggo Dome, Amsterdam, Portugal 4–2 Russia; goals Sokolov 9'49",
 *    Afanasyev 12'45", Tomás Paçó 18'39", André Coelho 26'45" and 31'16", Pany Varela 39'59"; attendance 1,250.
 *  - Wikipedia, "André Coelho" (raw): André Henriques Nunes Coelho, born 30 Oct 1993, Viseu; 1.84 m; defender/universal; Benfica 2017–20,
 *    Barcelona 2020–24, Benfica 2024–; European champion 2018 and 2022, world champion 2021.
 *  - UEFA.com match page 2034402 (Portugal v Russia) was fetched: script-rendered, no report text (only the news links used above).
 * CONFIRMED: match, date, venue, the score line (1–2 → 2–2 at 26'45" → 3–2 at 31'16" → 4–2 at 39'59"), that the equaliser came from
 *  Coelho's DRIVEN KICK-IN, that it deflected in off the LEG of Russia's keeper Dmitri Putilov, that Coelho scored again (3–2), that Portugal
 *  won 4–2 and retained the title; Coelho's height (1.84 m). (Futsal law: a goal cannot be scored directly from a kick-in — this one counts
 *  because it touched the keeper. Not narrated.)
 * INFERRED (never named in the narration): the kick-in's spot (near touchline, ≈ 8 m from Russia's goal line), which end, the near post,
 *  the exact height of the ball (a leg-height drive), Coelho's right foot for this strike (the card's `foot`), every other player's
 *  position, the keeper's blocking pose; the kits (Portugal red shirts / green shorts drawn blue / red socks as the listed home side, as in
 *  the approved Zicky Té film; Russia white shirts / blue shorts; Putilov in yellow); Coelho's short dark hair; his shirt number (not
 *  shown); the board's look and place. No video was reviewed. Chapter 3 is a demonstration of the lesson, not footage of a match.
 * Players: the shared athlete library (./athlete.ts) through ONE adapter `athlete()` → drawAthlete (prev → hem/hair follow-through,
 * motionSmear on the strike). Our stages are LEFT-handed (X right, Z away from the camera), so `projector()` maps library z → −Z; the
 * strike uses the RIGHT foot (the library default).
 * Timing: the SCRIPT's cues are estimated (≈2.7 words/s) until the lead voices it; `authored()` maps each chapter's recorded clock through
 * the cue anchors back onto the authored choreography, so every action stays on its word after withTiming() moves the cues.
 * Inks: red (Portugal, rings), yellow (Putilov, lights, flight lines), blue (court, shorts), navy (key line, run-off, stands).
 * Composition: every scene is authored in a 1566×1080-unit box and cam() centres it on the FULL sheet (card window 1.45:1 → square).
 * Phone heat: 4 plates; wide-shot figures 'low'; objects on twos, cameras on ones; ≈120–260 plate ops a frame. All randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {aperture} from '../../paths/riso/passage';
import {twos,sm,key,padKeys,linear,settle,clamp,lerp,hash,blob,polyPath,ribbon,smoothPts,partial,rotPts,rectPath,easeOut,easeIn,easeIO,easeOutBack,easeInOutSine,TAU,type Key,type Pt} from '../../paths/riso/motion';
import {sparkBurst,speedLines,handCut,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,strike,runCycle,runCadence,stand,backpedal,lunge,keeperSet,keeperDive,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Projector,type Place,type V3,type InkFill} from './athlete';

const Y='yellow',R='red',B='blue',K='navy';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; `at` and `seconds` are estimates. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[];heads?:Record<string,string>}[]=[
 {label:'Live: the 2022 final',text:'The 2022 Futsal Euro final. Russia lead two one. Then Portugal get a kick-in. André Coelho drives it hard at goal. It hits the keeper’s leg and goes in. Two all!',tail:2.6,
  cues:['The 2022','Russia lead','Then Portugal','Coelho drives','It hits','Two all'],heads:{'The 2022':'Euro final 2022','Russia lead':'1–2','Then Portugal':'Kick-in','Two all':'2–2'}},
 {label:'Replay: the driven kick-in',text:'Watch again. The ball sits on the line, and he hits it hard. The keeper cannot stop it! Later he scores again, and Portugal win four two. Champions of Europe!',tail:2.4,
  cues:['Watch again','ball sits','hits it hard','keeper cannot','Later he','Portugal win','Champions'],heads:{'Later he':'3–2','Portugal win':'4–2','Champions':'Champions'}},
 {label:'Strike low and hard',text:'In futsal, a low shot is the hardest to save. The keeper must get down fast, and legs get in the way. So strike it low and hard!',tail:2.6,
  cues:['In futsal','low shot','hardest','keeper must','get down','legs get','So strike','low and hard'],heads:{'low shot':'Low shot','low and hard':'Low and hard'}},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/andre-coelho-futsal-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/andre-coelho-futsal-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/andre-coelho-futsal-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , ; : . ! ? */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('coelho: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** the authored clock: what the choreography was written against (the estimates, never re-timed) */
const AUTH=SCRIPT.map(c=>estimate(c.text,c.cues,c.tail));
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map((c,i)=>{const e=AUTH[i];return{label:c.label,narration:c.text,seconds:e.seconds,
 cues:e.cues.map(q=>c.heads&&c.heads[q.words]!==undefined?{...q,headline:c.heads[q.words]}:q)};}),VOICE);
/** authored onset of the cue whose words start with w in chapter i (throws on a typo) */
const A=(i:number,w:string)=>{const c=AUTH[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('coelho: no cue '+w);return c.at;};
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
/** a quadratic arc a → b through a raised midpoint (height h); u ∈ [0,1] */
function arc3(a:V3,b:V3,h:number,u:number):V3{const M:V3=[(a[0]+b[0])/2,h,(a[2]+b[2])/2],p=(1-u)*(1-u),q=2*u*(1-u),r=u*u;return[p*a[0]+q*M[0]+r*b[0],p*a[1]+q*M[1]+r*b[1],p*a[2]+q*M[2]+r*b[2]];}

// ---------------- geometry helpers ----------------
function dashGaps(pts:Pt[],dash:number):[number,number][]{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const n=Math.max(1,Math.floor(L/dash)),g:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;g.push([u,u+.45/n]);}return g;}
/** a dashed hand-drawn line; on the blue court it is knocked out to paper first so the ink prints clean (no overprint) */
function dashed(s:Sheet,ink:string,pts:Pt[],width:number,seed:number,o:{dash?:number;progress?:number;ko?:boolean}={}){const{dash=width*4.5,progress=1,ko=true}=o;const line=progress>=1?smoothPts(pts,false,8):partial(smoothPts(pts,false,8),progress);if(line.length<2)return;const p=ribbon(line,width,{seed,pressure:.3,taper:.2,wobble:1.2,gaps:dashGaps(line,dash)});if(ko)s.knockout(p);s.fill(ink,p,1);}
function arrowHead(s:Sheet,ink:string,pts:Pt[],size:number,seed:number,cov=1){if(pts.length<2)return;const a=pts[pts.length-1],b=pts[Math.max(0,pts.length-3)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]);const q=rotPts([[size*.35,0],[-size*.75,-size*.62],[-size*.45,0],[-size*.75,size*.62]],ang).map(p=>[p[0]+a[0],p[1]+a[1]] as Pt),path=polyPath(q,true);s.knockout(path);s.fill(ink,path,cov);}
function floorRing(st:Stage,X:number,Z:number,r:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;out.push(proj(st,X+Math.cos(a)*r,0,Z+Math.sin(a)*r));}return out;}
function floorStrip(st:Stage,pts:Pt[],hw:number):Pt[]{const L:Pt[]=[],Rr:Pt[]=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*hw,nz=dx/l*hw;L.push(proj(st,pts[i][0]+nx,0,pts[i][1]+nz));Rr.push(proj(st,pts[i][0]-nx,0,pts[i][1]-nz));}return[...L,...Rr.reverse()];}
function floorQuad(st:Stage,x0:number,z0:number,x1:number,z1:number):Pt[]{const za=Math.max(z0,st.cz+.4),zb=Math.max(z1,st.cz+.45);return[proj(st,x0,0,za),proj(st,x1,0,za),proj(st,x1,0,zb),proj(st,x0,0,zb)];}
/** a dashed ring on the floor round (X,Z) */
function floorDashRing(s:Sheet,st:Stage,ink:string,X:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const q=floorRing(st,X,Z,r*g,26),p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3.4)});s.knockout(p);s.fill(ink,p,1);}
/** a small dashed ring standing up in the air (facing the camera) round a world point: the deflection off the keeper's leg */
function airRing(s:Sheet,st:Stage,ink:string,X:number,Yh:number,Z:number,r:number,w:number,seed:number,g=1){if(g<=.02)return;const c=proj(st,X,Yh,Z),rr=r*kAt(st,Z)*g,q:Pt[]=[];for(let i=0;i<22;i++){const a=i/22*TAU;q.push([c[0]+Math.cos(a)*rr,c[1]+Math.sin(a)*rr]);}const p=ribbon([...q,q[0]],w,{seed,close:true,wobble:1,gaps:dashGaps(q,w*3)});s.knockout(p);s.fill(ink,p,1);}

// ---------------- players: the shared athlete library ----------------
/** Our stages are LEFT-handed (X right, Z away, Y up); the library is right-handed: library z = −Z. */
function projector(st:Stage):Projector{return{eye:[st.cx,st.eye,-st.cz] as V3,project(p:V3){const Z=-p[2],q=proj(st,p[0],p[1],Z);return[q[0],q[1],Z-st.cz];},scale(p:V3){return kAt(st,-p[2]);}};}
const placeAt=(X:number,Z:number,yaw:number):Place=>({x:X,z:-Z,yaw});
const toMine=(p:V3):[number,number,number]=>[p[0],p[1],-p[2]];
/** yaw that faces the floor direction (dX,dZ) in our stage (library yaw 0 faces +X; + turns toward +Z here) */
const yawTo=(dX:number,dZ:number)=>Math.atan2(dZ,dX);
const FACE_LEFT=Math.PI,FACE_CAMERA=-Math.PI/2;
const SKIN_L:InkFill[]=[[Y,.8],[R,.3]],SKIN_M:InkFill[]=[[Y,.72],[R,.4]],SKIN_D:InkFill[]=[[Y,.5],[R,.4],[K,.25]];
const BUILD={height:1.84,bulk:1.02};
/** André Coelho: Portugal — red shirt, green shorts (drawn blue), red socks (kit inferred), short dark hair, 1.84 m; no number (unverified) */
const COELHO:AthleteStyle={shirt:R,shorts:B,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',number:null,hairStyle:'short',build:BUILD,seed:4};
const POR=(n:number):AthleteStyle=>({shirt:R,shorts:B,socks:R,boots:K,skin:n%3===1?SKIN_D:n%3===2?SKIN_M:SKIN_L,hair:K,line:K,trim:'paper',hairStyle:n%2?'short':'bald',build:{height:1.72+hash(n,3)*.12},seed:30+n});
/** Russia (white shirts, blue shorts — inferred) */
const RUS=(n:number):AthleteStyle=>({shirt:'paper',shorts:B,socks:'paper',boots:K,skin:[[Y,.62],[R,.2]],hair:n%3?K:[Y,.9],line:K,trim:R,hairStyle:n%2?'short':'bald',build:{height:1.74+hash(n,3)*.12},seed:20+n});
/** Dmitri Putilov, Russia's keeper — a yellow keeper kit (inferred) */
const PUTILOV:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:[[Y,.7],[R,.26]],hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.84},seed:62};
/** the demonstration defender and keeper: neutral paper/navy training kits (no team is claimed in chapter 3) */
const DEMO_D:AthleteStyle={shirt:'paper',shorts:K,socks:K,boots:K,skin:SKIN_M,hair:K,line:K,trim:K,hairStyle:'curly',build:{height:1.8,bulk:1.04},seed:77};
const DEMO_K:AthleteStyle={shirt:[K,.62],shorts:K,socks:K,boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,gloves:'paper',sleeves:'long',hairStyle:'short',build:{height:1.82},seed:78};
type Gen=(t:number)=>{pose:Pose;yaw:number;X:number;Z:number};
/** THE adapter: draw one athlete from a generator at time t (prev = one drawn frame earlier → hair/hem follow-through); smear = motion echo */
function athlete(s:Sheet,st:Stage,gen:Gen,t:number,style:AthleteStyle,o:{detail?:'auto'|'low'|'mid'|'high';smear?:number}={}){
 const a=gen(t),b=gen(t-1/12),cm=projector(st),pl=placeAt(a.X,a.Z,a.yaw),pp=placeAt(b.X,b.Z,b.yaw);
 if(o.smear){const c=gen(t-o.smear);motionSmear(s,c.pose,a.pose,cm,style,pl,{prevPlace:placeAt(c.X,c.Z,c.yaw),ink:[R,.6],threshold:5});}
 return drawAthlete(s,a.pose,cm,{...style,detail:o.detail??'auto'},pl,{prev:b.pose,prevPlace:pp});
}
/** where the ball sits at the right-foot strike's contact: just past the kicking toe along the foot (library coords, place at the origin) */
function strikeBall(yaw:number):V3{const sk=solve(strike(STRIKE_CONTACT),BUILD,{yaw}),toe=sk.rToe,an=sk.rAn,d:V3=[toe[0]-an[0],0,toe[2]-an[2]],l=Math.hypot(d[0],d[2])||1;return[toe[0]+d[0]/l*.08,BALL_R,toe[2]+d[2]/l*.08];}
/** the keeper's block: from the set position, the LEFT leg jabs out toward the ball (the ball comes from his left) */
const block=(t:number,u:number)=>blendPose(keeperSet(t),lunge(.6*u+.05,{side:'l'}),clamp(u*1.6));

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
   heads.moveTo(hx+rowH*.2,hy-rowH*.18);heads.arc(hx,hy-rowH*.18,rowH*.2,0,TAU);const body=hash(i,4);if(body<.1)yel.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.4)reds.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);else if(body<.48)blues.rect(hx-rowH*.26,hy,rowH*.52,rowH*.34);}}
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
type ArenaOpt={cheer?:number;flash?:number;bulge?:number;bx?:number;by?:number;t?:number;keeper?:(st:Stage)=>void;low?:number};
/** the court seen end-on: blue floor + run-off, paper lines (goal line, the D, the touchlines), boards, stands, the goal */
function arena(s:Sheet,st:Stage,o:ArenaOpt={}){
 const{cheer=0,flash=0,bulge=0,bx=0,by=1,t=0,low=0}=o;
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
 goalEnd(s,st,bulge,bx,by,low);o.keeper?.(st);postsEnd(s,st);
}
function goalEnd(s:Sheet,st:Stage,bulge:number,bx:number,by:number,low:number){
 const Lx=-1.5,Rx=1.5,H=2,Db=.95,Dt=.55,back=(X:number,Yh:number):Pt=>{const d=bulge*Math.exp(-((X-bx)**2+(Yh-by)**2)/.35);return proj(st,X,Yh,GZ+lerp(Db,Dt,Yh/H)+d);};
 const out=[proj(st,Lx,0,GZ),proj(st,Lx,H,GZ),proj(st,Rx,H,GZ),proj(st,Rx,0,GZ),back(Rx,0),back(Rx,H),back(Lx,H),back(Lx,0)];
 const hull=[out[0],out[1],out[6],out[5],out[2],out[3],out[4],out[7]];
 s.knockout(polyPath(hull,true),.6);s.fill(K,polyPath(hull,true),.2);
 // "a low shot": the bottom strip of the mouth (under the knee, 0–0.5 m) glows yellow — the hardest place for a keeper to reach
 if(low>.02)s.fill(Y,polyPath([proj(st,Lx,0,GZ),proj(st,Lx,.5,GZ),proj(st,Rx,.5,GZ),proj(st,Rx,0,GZ)],true),.55*low);
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

// ---------------- the hanging scoreboard (a riso seven-segment board; score + match clock) ----------------
const SEG:Record<string,number[]>={'0':[1,1,1,1,1,1,0],'1':[0,1,1,0,0,0,0],'2':[1,1,0,1,1,0,1],'3':[1,1,1,1,0,0,1],'4':[0,1,1,0,0,1,1],'5':[1,0,1,1,0,1,1],'6':[1,0,1,1,1,1,1],'7':[1,1,1,0,0,0,0],'8':[1,1,1,1,1,1,1],'9':[1,1,1,1,0,1,1]};
const SEGL:[Pt,Pt][]=[[[0,0],[1,0]],[[1,0],[1,1]],[[1,1],[1,2]],[[0,2],[1,2]],[[0,1],[0,2]],[[0,0],[0,1]],[[0,1],[1,1]]];
/** digits (and ':') as ribbons into `path`; h = digit height, sy squashes a flipping digit; returns the width used */
function digits(path:Path2D,str:string,x:number,y:number,h:number,seed:number,sy=1):number{
 const w=h*.5,gap=h*.26,lw=h*.13;let cx=x;
 for(const ch of str){
  if(ch===':'){for(const dy of[.6,1.4])path.addPath(polyPath(blob(cx+lw*.6,y+dy*h/2,lw*.62,lw*.62,seed+dy*7,{n:10}),true));cx+=lw*1.2+gap;continue;}
  const on=SEG[ch];if(!on){cx+=w+gap;continue;}
  if(ch==='1')cx-=w*.55;
  on.forEach((v,i)=>{if(!v)return;const[a,b]=SEGL[i],p:Pt[]=[[cx+a[0]*w,y+h/2+(a[1]-1)*h/2*sy],[cx+b[0]*w,y+h/2+(b[1]-1)*h/2*sy]];path.addPath(ribbon(p,lw,{seed:seed+i,taper:0,wobble:.4}));});
  cx+=w+gap;}
 return cx-x-gap;
}
/** the board, flat to the camera, centred at sheet point c, k units per metre (6 m × 3 m): Portugal (red) left, Russia (flag bands) right */
function scoreboard(s:Sheet,c:Pt,k:number,b:{home:number;away:number;clock:string;flip:number;glow:number},seed:number){
 const W=6*k,H=3*k,x0=c[0]-W/2,y0=c[1]-H/2,box=handCut([[x0,y0],[x0+W,y0],[x0+W,y0+H],[x0,y0+H]],seed,k*.05,k*.9);
 const cab=new Path2D();for(const u of[.18,.82])cab.addPath(ribbon([[x0+W*u,y0],[x0+W*u+(u-.5)*k*.6,y0-k*9]],Math.max(2,k*.04),{seed:seed+2,taper:0,wobble:.5}));s.fill(K,cab,.8);
 if(b.glow>.02)s.fill(Y,polyPath(blob(c[0],c[1],W*.62*(1+.08*b.glow),H*.75*(1+.1*b.glow),seed+3,{amp:.04,n:28}),true),.35*b.glow);
 const bp=polyPath(box,true);s.knockout(bp);s.fill(K,bp,.92);s.fill(R,ribbon([...box,box[0]],k*.09,{seed:seed+4,close:true,wobble:.6}));
 const sw=k*.9,sh=k*.62,ly=y0+H*.2;
 const pr=polyPath(handCut([[x0+k*.35,ly],[x0+k*.35+sw,ly],[x0+k*.35+sw,ly+sh],[x0+k*.35,ly+sh]],seed+5,k*.02,k*.4),true);s.knockout(pr);s.fill(R,pr);
 const ax=x0+W-k*.35-sw,ap=polyPath(handCut([[ax,ly],[ax+sw,ly],[ax+sw,ly+sh],[ax,ly+sh]],seed+6,k*.02,k*.4),true);s.knockout(ap);
 s.fill(B,rectPath(ax,ly+sh/3,sw,sh/3));s.fill(R,rectPath(ax,ly+sh*2/3,sw,sh/3));
 const dh=H*.36,num=new Path2D(),sy=1-.8*Math.sin(Math.PI*clamp(b.flip));
 digits(num,String(b.home),c[0]-k*1.35,ly-dh*.02,dh,seed+10,sy);digits(num,String(b.away),c[0]+k*.85,ly-dh*.02,dh,seed+20);
 num.addPath(ribbon([[c[0]-k*.32,ly+dh*.5],[c[0]+k*.32,ly+dh*.5]],dh*.13,{seed:seed+30,taper:0}));
 s.knockout(num);
 const clk=new Path2D(),ch=H*.2,cw=digits(new Path2D(),b.clock,0,0,ch,0);digits(clk,b.clock,c[0]-cw/2,y0+H*.7,ch,seed+40);s.knockout(clk);s.fill(Y,clk);
}

// ================= chapter 1 — LIVE: the EURO 2022 final, 26'45": the driven kick-in, off Putilov's leg, 2–2 =================
const C1={russia:A(0,'Russia lead'),then:A(0,'Then Portugal'),drives:A(0,'Coelho drives'),hits:A(0,'It hits'),two:A(0,'Two all'),end:AUTH[0].seconds};
/** the kick-in spot on the near touchline, 8 m from Russia's goal line (inferred); the ball meets Putilov's left shin by the near post */
const KB:[number,number]=[12.2,.05],DEF:V3=[19.28,.3,8.98],NETP:V3=[20.55,.34,8.9];
const T_HIT=lerp(C1.drives,C1.hits,.6),T_DEF=T_HIT+.46,T_IN=T_DEF+.24;
const YAW_SHOT=yawTo(DEF[0]-KB[0],DEF[2]-KB[1]);
const SB=toMine(strikeBall(YAW_SHOT)),PLANT:[number,number]=[KB[0]-SB[0],KB[1]-SB[2]];
const DIRX=Math.cos(YAW_SHOT),DIRZ=Math.sin(YAW_SHOT),BACK:[number,number]=[PLANT[0]-DIRX*1.5,PLANT[1]-DIRZ*1.5];
function liveBall(T:number):{X:number;Y:number;Z:number;flying:boolean;spin:number}{
 if(T<T_HIT)return{X:KB[0],Y:BALL_R,Z:KB[1],flying:false,spin:0};
 const K0:V3=[KB[0],BALL_R,KB[1]];
 if(T<T_DEF){const p=arc3(K0,DEF,.36,sm(T_HIT,T_DEF,T,linear));return{X:p[0],Y:p[1],Z:p[2],flying:true,spin:(T-T_HIT)*60};}
 if(T<T_IN){const u=sm(T_DEF,T_IN,T,linear);return{X:lerp(DEF[0],NETP[0],u),Y:lerp(DEF[1],NETP[1],u)+.1*Math.sin(u*Math.PI),Z:lerp(DEF[2],NETP[2],u),flying:true,spin:30+u*20};}
 const d=sm(T_IN+.05,T_IN+.35,T,easeIn);
 return{X:NETP[0]+.1*d,Y:lerp(NETP[1],BALL_R,d),Z:NETP[2],flying:false,spin:50};
}
/** Coelho live: walks in from outside the line, stands over the ball, two steps back; on "drives" the right-foot strike; wheels away on 2–2 */
const S_T0=T_HIT-.62;
const liveC:Gen=T=>{
 const stT=key(T,[[S_T0,0],[S_T0+.3,.22],[T_HIT,STRIKE_CONTACT],[T_HIT+.55,1]],linear);
 const cel=sm(T_IN+.35,C1.end,T,easeIO);
 const X=key(T,[[0,BACK[0]-2.6],[C1.then-.3,BACK[0]+.4,easeIO],[C1.drives-.2,BACK[0],easeIO],[S_T0,BACK[0],linear],[T_HIT,PLANT[0],easeOut],[T_HIT+.5,PLANT[0]+.5,easeOut],[T_IN+.35,PLANT[0]+.6]])+3.2*cel;
 const Z=key(T,[[0,BACK[1]-.4],[C1.then-.3,BACK[1]+.3,easeIO],[C1.drives-.2,BACK[1],easeIO],[S_T0,BACK[1],linear],[T_HIT,PLANT[1],easeOut],[T_HIT+.5,PLANT[1]+.4,easeOut],[T_IN+.35,PLANT[1]+.5]])+1.6*cel;
 let pose:Pose,yaw=YAW_SHOT;
 if(T<C1.then-.3){pose=runCycle(T*runCadence(.1),{speed:.1});yaw=yawTo(1,.3);}
 else if(T<S_T0){pose=blendPose(runCycle((C1.then-.3)*runCadence(.1),{speed:.1}),posed({lHipF:14,rHipF:8,lKnee:20,rKnee:14,lean:14,neckP:20,lShA:22,rShA:18,lElb:30,rElb:30}),sm(C1.then-.3,C1.then+.2,T));yaw=lerp(yawTo(1,.3),YAW_SHOT,sm(C1.then-.3,C1.then+.4,T));}
 else if(T<T_IN+.35)pose=strike(stT);
 else{const u=sm(T_IN+.35,T_IN+.9,T,easeIO);pose=blendPose(strike(1),celebrate((T-T_IN-.35)*1.3,{kind:'run'}),u);yaw=lerp(YAW_SHOT,yawTo(1,.5),u);}
 return{pose,yaw,X,Z};
};
/** the box at the kick-in: Russia (white, facing the ball) and Portugal (red) jostle; the ball flies through; heads drop / Portugal run */
type Man={x:number;z:number;ph:number};
const RUSSIA:Man[]=[{x:16.7,z:6.6,ph:.1},{x:17.6,z:10.4,ph:.4},{x:15.0,z:11.0,ph:.7},{x:13.4,z:8.2,ph:.2}];
const PORTUGAL:Man[]=[{x:15.4,z:7.5,ph:.3},{x:17.0,z:12.6,ph:.6},{x:12.6,z:13.2,ph:.9}];
const liveRus=(i:number):Gen=>T=>{const m=RUSSIA[i],post=sm(T_IN+.3,T_IN+1.3,T),jig=.25*Math.sin(T*1.7+m.ph*6);let pose=backpedal(T*.9+m.ph);
 if(i===0){const lu=key(T,[[T_HIT-.1,0],[T_HIT+.25,.6],[T_HIT+.8,1]],linear);pose=blendPose(pose,lunge(lu,{side:'r'}),sm(T_HIT-.15,T_HIT,T));}
 pose=blendPose(pose,posed({lHipF:6,rHipF:6,lKnee:10,rKnee:10,lean:18,neckP:40,lShA:10,rShA:10,lElb:20,rElb:20}),post);
 return{pose,yaw:yawTo(KB[0]-m.x,KB[1]-m.z)+.4*post*(i%2?1:-1),X:m.x+jig*.4,Z:m.z+jig*.3};};
const livePor=(i:number):Gen=>T=>{const m=PORTUGAL[i],f=liveC(C1.end),go=sm(T_IN+.3,C1.end,T,easeIO),jig=.25*Math.sin(T*1.9+m.ph*6);
 const X=lerp(m.x+jig*.4,f.X+[-1.3,1.1,-.6][i],go),Z=lerp(m.z,f.Z+[.9,1.2,2][i],go);
 let pose=blendPose(runCycle(T*runCadence(.15)+m.ph,{speed:.15}),stand(),.6);
 if(go>0)pose=blendPose(pose,celebrate(T*1.1+i*.3,{kind:'run'}),sm(T_IN+.3,T_IN+.7,T));
 return{pose,yaw:go>0?yawTo(f.X-m.x,f.Z-m.z):yawTo(19-m.x,10-m.z),X,Z};};
/** Putilov: set at the near post; the ball is on him fast — the left leg jabs out, it hits his shin and goes in; he turns to look */
const KP:[number,number]=[19.3,9.35];
const liveK:Gen=T=>{const u=sm(T_HIT+.08,T_DEF,T,easeOut);let pose=block(T*1.3,u);
 const look=sm(T_IN,T_IN+.6,T);pose=blendPose(pose,posed({lHipF:10,rHipF:10,lKnee:16,rKnee:16,lean:12,neckP:30,neckY:40,lShA:20,rShA:20,lElb:30,rElb:30}),look*.8);
 return{pose,yaw:yawTo(KB[0]-KP[0],KB[1]-KP[1])*.35+FACE_LEFT*.65+look*.9,X:KP[0],Z:KP[1]};};
const liveCam=(T:number)=>({x:key(T,mono([[0,12.4],[C1.then,12.8],[C1.drives,13.2],[T_HIT,13.8],[T_IN,14.6],[T_IN+.8,14.8],[C1.end,14.8]]),easeInOutSine),
 zoom:key(T,mono([[0,.5],[C1.russia,.52],[C1.then,.6],[C1.drives,.6],[T_HIT,.52],[T_IN,.54],[T_IN+.9,.64],[C1.end,.7]]),easeInOutSine),
 y:key(T,mono([[0,1380],[C1.then,1480],[C1.drives,1480],[T_HIT,1360],[T_IN,1300],[C1.end,1500]]),easeInOutSine)});
function live(s:Sheet,T:number,Tc:number){
 const c=liveCam(Tc),st=bst(c.x),hit=pulse(Tc,T_HIT,.35);
 cam(s,0,c.y+3*hit*Math.sin(Tc*80),c.zoom);
 const b=liveBall(T),goal=T>=T_IN;
 courtSide(s,st,T,{cheer:goal?1-.4*sm(C1.end-1.5,C1.end,T):.15,flash:pulse(T,T_IN,1.2)+.4*pulse(T,C1.two,1),bulge:.45*sm(T_IN-.1,T_IN,T)*(1-.6*sm(T_IN+.2,T_IN+1.1,T))+.12*settle(T,T_IN,{amp:1,freq:3,decay:3}),bz:NETP[2],by:NETP[1],
  keeper:()=>{athlete(s,st,liveK,T,PUTILOV,{detail:'low'});}});
 // "Then Portugal get a kick-in": a red dashed ring round the ball on the touchline, a short red arrow toward goal
 const ki=easeOutBack(sm(C1.then,C1.then+.35,T))*(1-sm(T_HIT-.1,T_HIT+.1,T));floorDashRing(s,st,R,KB[0],KB[1]+.1,.7,9,501,ki);
 if(ki>.02){const a=proj(st,KB[0]+.9*DIRX,0,KB[1]+.9*DIRZ),e=proj(st,KB[0]+2.8*DIRX,0,KB[1]+2.8*DIRZ),q=partial([a,L2(a,e,.5),e],sm(C1.then+.2,C1.then+.7,T,easeOut));if(q.length>1){dashed(s,R,q,10,502,{dash:40});arrowHead(s,R,q,34,503);}}
 // "It hits the keeper's leg": a yellow ring stands round the contact point by his shin, and stays until 2–2
 const hr=easeOutBack(sm(Math.max(T_DEF,C1.hits-.15),Math.max(T_DEF,C1.hits-.15)+.3,T))*(1-sm(C1.two+.6,C1.two+1,T));
 // everyone back to front by depth (far side first); the ball slots in by its depth
 type It={z:number;draw:()=>void};const items:It[]=[];
 RUSSIA.forEach((_,i)=>{const g=liveRus(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,RUS(i),{detail:'low'})});});
 PORTUGAL.forEach((_,i)=>{const g=livePor(i);items.push({z:g(T).Z,draw:()=>athlete(s,st,g,T,POR(i),{detail:'low'})});});
 items.push({z:liveC(T).Z,draw:()=>athlete(s,st,liveC,T,COELHO,{detail:'mid',smear:T>T_HIT-.2&&T<T_HIT+.25?.1:0})});
 items.push({z:b.Z-.05,draw:()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(9,kAt(st,b.Z)*BALL_R);shadow(s,g[0],g[1],r*1.15,r*.3,16,.45);
  if(b.flying){const tr:Pt[]=[];for(let k=0;k<=8;k++){const q=liveBall(Math.max(T_HIT,T-.2+k*.025));tr.push(proj(st,q.X,q.Y,q.Z));}const trp=ribbon(tr,r*1.5,{seed:17,taper:.9,wobble:.6});s.knockout(trp,.8);s.fill(Y,trp,1);}
  ball(s,p[0],p[1],r,18,{rot:b.spin,smear:b.flying?.5:0,dir:Math.atan2(-.1,1)});}});
 items.sort((a,b2)=>b2.z-a.z).forEach(it=>it.draw());
 if(T>=T_DEF&&T<T_DEF+.5){const p=proj(st,DEF[0],DEF[1],DEF[2]);sparkBurst(s,Y,p[0],p[1],90,{n:10,seed:505,g:easeOut(sm(T_DEF,T_DEF+.25,T))*(1-sm(T_DEF+.3,T_DEF+.5,T))});}
 airRing(s,st,Y,DEF[0],DEF[1]+.1,DEF[2],.55,9,506,hr);
}
/** Coelho's chest (the passage enters his red shirt) */
function chestPts(st:Stage,a:{pose:Pose;yaw:number;X:number;Z:number},r=.09):Pt[]{const sk=solve(a.pose,BUILD,placeAt(a.X,a.Z,a.yaw)),ch=toMine(sk.chest),p=proj(st,ch[0],ch[1]-.05,ch[2]),rad=r*kAt(st,ch[2]),q:Pt[]=[];for(let i=0;i<12;i++){const ang=i/12*TAU;q.push([p[0]+Math.cos(ang)*rad,p[1]+Math.sin(ang)*rad]);}return q;}
const sc1:Scene={draw(s,t){const{tt,tc}=clock(0,t);live(s,tt,tc);},aperture(t){const{tt,tc}=clock(0,t);return aperture(chestPts(bst(liveCam(tc).x),liveC(tt),.12));},still:T_HIT+.05};

// ================= chapter 2 — REPLAY: slow motion, low, behind the kick-in; the leg; then the board: 3–2, 4–2, champions =================
const C2={watch:A(1,'Watch'),sits:A(1,'ball sits'),hits:A(1,'hits it'),keeper:A(1,'keeper cannot'),later:A(1,'Later'),win:A(1,'Portugal win'),champ:A(1,'Champions'),end:AUTH[1].seconds};
/** replay world = the live kick-in seen end-on: the ball on the right touchline (X = 10), 8 m out; Putilov by the right (near) post */
const RB:[number,number]=[9.95,GZ-8],RDEF:V3=[1.12,.3,GZ-.62],RNET:V3=[1.22,.34,GZ+.45];
const RYAW=yawTo(RDEF[0]-RB[0],RDEF[2]-RB[1]);
const RSB=toMine(strikeBall(RYAW)),RPL:[number,number]=[RB[0]-RSB[0],RB[1]-RSB[2]];
const R_HIT=C2.hits+.2,R_DEF=R_HIT+1.1,R_IN=R_DEF+.55;
const rT=(t:number)=>key(t,[[0,.06],[R_HIT-.9,.26],[R_HIT,STRIKE_CONTACT],[R_HIT+1.6,.8],[C2.later,1]],linear);
const repC:Gen=t=>({pose:strike(rT(t)),yaw:RYAW,X:RPL[0]+key(t,[[0,.7*Math.cos(RYAW+Math.PI)],[R_HIT,0,easeOut],[R_HIT+1.8,-.3]]),Z:RPL[1]+key(t,[[0,.7*Math.sin(RYAW+Math.PI)],[R_HIT,0,easeOut],[R_HIT+1.8,.1]])});
function repBall(t:number):{X:number;Y:number;Z:number;flying:boolean}{if(t<R_HIT)return{X:RB[0],Y:BALL_R,Z:RB[1],flying:false};
 if(t<R_DEF){const p=arc3([RB[0],BALL_R,RB[1]],RDEF,.38,sm(R_HIT,R_DEF,t,linear));return{X:p[0],Y:p[1],Z:p[2],flying:true};}
 if(t<R_IN){const u=sm(R_DEF,R_IN,t,linear);return{X:lerp(RDEF[0],RNET[0],u),Y:lerp(RDEF[1],RNET[1],u)+.08*Math.sin(u*Math.PI),Z:lerp(RDEF[2],RNET[2],u),flying:true};}
 const d=sm(R_IN+.1,R_IN+.6,t,easeIn);return{X:RNET[0],Y:lerp(RNET[1],BALL_R,d),Z:RNET[2],flying:false};}
/** Putilov in the replay: set by the near post; the left leg jabs out late — the ball hits it and squirts in */
const repK:Gen=t=>{const u=sm(R_HIT+.3,R_DEF,t,easeOut),look=sm(R_IN,R_IN+1.2,t);let pose=block(t*.5,u);
 pose=blendPose(pose,posed({lHipF:10,rHipF:10,lKnee:16,rKnee:16,lean:12,neckP:30,neckY:50,lShA:20,rShA:20,lElb:30,rElb:30}),look*.8);
 return{pose,yaw:FACE_CAMERA+.45+look*.8,X:.75,Z:GZ-.75};};
/** two white shirts and a red one between the line and the goal (the ball flies past them) */
const REPM:{X:number;Z:number;ink:'rus'|'por';i:number}[]=[{X:5.0,Z:GZ-2.9,ink:'rus',i:0},{X:3.6,Z:GZ-2.2,ink:'por',i:1},{X:-.9,Z:GZ-2.4,ink:'rus',i:1}];
const repM=(k:number):Gen=>t=>{const m=REPM[k];let pose=blendPose(backpedal(.2+t*.25+k*.3),stand(),.4);
 if(k===0){const lu=key(t,[[R_HIT-.2,0],[R_HIT+.6,.6],[R_HIT+2,1]],linear);pose=blendPose(pose,lunge(lu,{side:'r'}),sm(R_HIT-.3,R_HIT,t));}
 return{pose,yaw:yawTo(RB[0]-m.X,RB[1]-m.Z),X:m.X,Z:m.Z};};
const st2=(t:number):Stage=>({F:1500,eye:1.4,cx:7.2-.8*sm(R_HIT,R_IN,t,easeIO),cz:RB[1]-5.2+.6*sm(R_HIT,R_IN,t,easeIO)});
/** the board hangs over the goal end (X = 0, 7 m up, 3 m in front of the goal line) */
const BOARD2:V3=[0,7,GZ-3];
const sc2:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(1,t0),st=st2(tt),hit=pulse(t,R_HIT,.4),net=pulse(t,R_IN,.6);
  const bc=proj(st,BOARD2[0],BOARD2[1],BOARD2[2]),kb=kAt(st,BOARD2[2]);
  camPath(s,t,[[0,560,320,1.25],[C2.sits,640,380,1.4],[R_HIT,560,340,1.3],[R_HIT+.7,150,240,1.08],[R_DEF,-190,200,1.3],[R_IN+.4,-210,200,1.45],[C2.keeper+.3,-210,190,1.45],
   [C2.later,bc[0]-60,bc[1]+300,.62],[C2.win,bc[0]-60,bc[1]+260,.7],[C2.champ,bc[0]-60,bc[1]+300,.62],[C2.end,bc[0]-60,bc[1]+310,.6]],[8*hit*Math.sin(t*90),5*hit*Math.cos(t*77)+4*net*Math.sin(t*60)]);
  const b=repBall(tt),goal=tt>=R_IN;
  arena(s,st,{t:tt,cheer:goal?1-.2*sm(C2.end-1,C2.end,tt):0,flash:pulse(tt,R_IN,1.2)+.6*pulse(tt,C2.champ,1.4)+.4*pulse(tt,C2.win,1),bulge:.5*sm(R_IN-.2,R_IN,tt)*(1-.6*sm(R_IN+.4,R_IN+1.4,tt))+.12*settle(tt,R_IN,{amp:1,freq:3,decay:3}),bx:RNET[0],by:RNET[1],
   keeper:stg=>{athlete(s,stg,repK,tt,PUTILOV,{detail:'mid'});}});
  // "The ball sits on the line": a red dashed ring round the ball, on the paper touchline
  floorDashRing(s,st,R,RB[0],RB[1],.55,10,601,easeOutBack(sm(C2.sits,C2.sits+.35,tt))*(1-sm(R_HIT-.1,R_HIT+.1,tt)));
  // "he hits it hard": the flight line (dashed yellow, drawn as the ball goes) with red speed lines behind the ball
  if(tt>R_HIT){const pts:Pt[]=[];for(let k=0;k<=18;k++){const q=repBall(lerp(R_HIT,Math.min(tt,R_IN),k/18));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,95,{dash:44});}
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(-.02,1)+Math.PI;shadow(s,g[0],g[1],r*1.1,r*.3,96,b.flying?.3:.45);
   if(b.flying&&tt<R_DEF)speedLines(s,R,p[0],p[1],dir,{n:5,seed:604+Math.floor(tt*6),len:r*3.5,spread:r*.8,width:5});
   ball(s,p[0],p[1],r,97,{rot:tt*6,smear:b.flying?.5:0,dir});
   if(tt>=R_HIT&&tt<R_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:98,g:easeOut(sm(R_HIT,R_HIT+.3,tt))});};
  const its:{z:number;draw:()=>void}[]=REPM.map((m,k)=>{const g=repM(k);return{z:m.Z,draw:()=>{athlete(s,st,g,tt,m.ink==='rus'?RUS(m.i):POR(m.i),{detail:'mid'});}};});
  its.push({z:repC(tt).Z,draw:()=>{athlete(s,st,repC,tt,COELHO,{detail:'high',smear:tt>R_HIT-.5&&tt<R_HIT+.4?.3:0});}},{z:!b.flying&&tt<R_HIT?repC(tt).Z-.01:b.Z,draw:drawBall});
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  // the deflection: a yellow burst on his shin, then "the keeper cannot stop it": the yellow ring stays on the spot
  if(tt>=R_DEF&&tt<R_DEF+.7){const p=proj(st,RDEF[0],RDEF[1],RDEF[2]);sparkBurst(s,Y,p[0],p[1],110,{n:12,seed:607,g:easeOut(sm(R_DEF,R_DEF+.3,tt))*(1-sm(R_DEF+.4,R_DEF+.7,tt))});}
  airRing(s,st,Y,RDEF[0],RDEF[1]+.1,RDEF[2],.42,10,608,easeOutBack(sm(Math.max(R_DEF,C2.keeper-.1),Math.max(R_DEF,C2.keeper-.1)+.3,tt))*(1-sm(C2.later-.3,C2.later,tt)));
  if(tt>=R_IN&&tt<R_IN+1.2){const p=proj(st,RNET[0],RNET[1],GZ+.4);sparkBurst(s,Y,p[0],p[1],130,{n:12,seed:99,g:easeOut(sm(R_IN,R_IN+.3,tt))*(1-sm(R_IN+.8,R_IN+1.2,tt))});}
  // "Later he scores again" → the board: 3–2 at 31:16; "Portugal win four two" → 4–2 at 39:59 (goals not staged: board only)
  if(tt>=C2.later-.6){const f1=C2.later+.1,f2=C2.win+.1,home=tt<f1?2:tt<f2?3:4,clk=tt<f1?'26:45':tt<f2?'31:16':'39:59',last=tt>=f2?f2:tt>=f1?f1:-9;
   scoreboard(s,bc,kb,{home,away:2,clock:clk,flip:sm(last,last+.25,tt,linear),glow:pulse(tt,f1,1.4)+pulse(tt,f2,1.6)},611);}
  // "Champions of Europe": red, yellow and paper confetti falls in front of the stands
  if(tt>=C2.champ){const u=sm(C2.champ,C2.champ+2.5,tt,linear),top=bc[1]-kb*3;confetti(s,[R,Y,'paper'],[bc[0]-1100,top+u*700,2200,520],26,Math.floor(tt*6),{size:16});}
 },
 aperture(t0){const{tt}=clock(1,t0),st=st2(tt),c=proj(st,BOARD2[0],BOARD2[1],BOARD2[2]),r=kAt(st,BOARD2[2])*.5,q:Pt[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;q.push([c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r]);}return aperture(q);},
 still:R_DEF+.05,
};

// ================= chapter 3 — THE LESSON (demonstration): hands are high → a low ball makes the keeper get down; legs get in the way =================
const C3={futsal:A(2,'In futsal'),low:A(2,'low shot'),hard:A(2,'hardest'),must:A(2,'keeper must'),down:A(2,'get down'),legs:A(2,'legs get'),so:A(2,'So strike'),lh:A(2,'low and hard'),end:AUTH[2].seconds};
/** the demo: Coelho central, 11 m out (the card: centre, long, right foot); low and hard, just inside the left post (screen left) */
const DB:[number,number]=[.3,GZ-11],DT:V3=[-1.15,.2,GZ-.02];
const DYAW=yawTo(DT[0]-DB[0],DT[2]-DB[1]);
const DSB=toMine(strikeBall(DYAW)),DPL:[number,number]=[DB[0]-DSB[0],DB[1]-DSB[2]];
const D_HIT=C3.so+.4,D_IN=Math.max(D_HIT+.55,C3.lh+.05);
const dT=(t:number)=>key(t,[[D_HIT-.62,0],[D_HIT-.32,.22],[D_HIT,STRIKE_CONTACT],[D_HIT+1.4,.85],[C3.end,1]],linear);
const demoC:Gen=t=>{const X=DPL[0]+key(t,[[0,-.25],[D_HIT-.62,-.25],[D_HIT,0,easeOut],[D_HIT+1.6,.15]]),Z=DPL[1]+key(t,[[0,-.9],[D_HIT-.62,-.9],[D_HIT,0,easeOut],[D_HIT+1.6,.3]]);
 const pose=t<D_HIT-.62?blendPose(stand(),posed({lHipF:14,rHipF:8,lKnee:22,rKnee:16,lean:12,neckP:14,lShA:20,rShA:20,lElb:30,rElb:30}),.5+.5*Math.sin(t*2)):strike(dT(t));
 return{pose,yaw:DYAW,X,Z};};
function demoBall(t:number){
 if(t<D_HIT)return{X:DB[0],Y:BALL_R,Z:DB[1],flying:false};
 if(t<D_IN){const p=arc3([DB[0],BALL_R,DB[1]],DT,.26,sm(D_HIT,D_IN,t,linear));return{X:p[0],Y:p[1],Z:p[2],flying:true};}
 const d=sm(D_IN+.2,D_IN+.7,t,easeIn);return{X:DT[0],Y:lerp(DT[1],BALL_R,d),Z:GZ+.6,flying:false};}
/** the defender between ball and goal: on "legs get in the way" his legs screen the keeper; on the strike he jabs too late */
const DD:[number,number]=[-.6,GZ-6.4];
const demoD:Gen=t=>{const lu=key(t,[[D_HIT-.2,0],[D_HIT+.4,.6],[D_HIT+2,1]],linear);
 return{pose:blendPose(backpedal(t*1.1),lunge(lu,{side:'l'}),sm(D_HIT-.3,D_HIT-.1,t)),yaw:yawTo(DB[0]-DD[0],DB[1]-DD[1]),X:DD[0],Z:DD[1]};};
/** the keeper: set with his hands high; the low ball means all the way down — he goes late, the ball is under him */
const KD=D_HIT+.25;
const demoK:Gen=t=>{let pose=keeperSet(t*.9);if(t>=KD)pose=blendPose(keeperSet(KD*.9),keeperDive(sm(KD,D_IN+.9,t,linear)*.9,{side:'r',height:0}),sm(KD,KD+.2,t));
 return{pose,yaw:FACE_CAMERA+.1,X:.15-.5*sm(KD,D_IN,t,easeOut),Z:GZ-.7};};
const st3:Stage={F:1500,eye:2.4,cx:3,cz:GZ-19};
const sc3:Scene={
 draw(s,t0){
  const{tt,tc:t}=clock(2,t0),st=st3;
  camPath(s,t,[[0,-360,250,1.05],[C3.low,-260,140,1.5],[C3.hard,-250,130,1.6],[C3.must,-250,130,1.6],[C3.legs,-320,200,1.3],[C3.so,-380,250,1.1],[C3.lh,-290,190,1.3],[C3.end,-290,200,1.25]]);
  const b=demoBall(tt),goal=tt>=D_IN;
  arena(s,st,{t:tt,cheer:goal?.7*(1-sm(C3.end-1,C3.end,tt)):0,flash:pulse(tt,D_IN,1),low:sm(C3.low,C3.low+.3,tt)*(1-sm(C3.must,C3.must+.3,tt))+sm(C3.so,C3.so+.3,tt)*(1-sm(C3.end-.8,C3.end-.3,tt)),
   bulge:.5*sm(D_IN-.2,D_IN,tt)*(1-.6*sm(D_IN+.4,D_IN+1.4,tt))+.1*settle(tt,D_IN,{amp:1,freq:3,decay:3}),bx:DT[0],by:DT[1],
   keeper:stg=>{athlete(s,stg,demoK,tt,DEMO_K,{detail:'mid'});}});
  const kp=demoK(tt),kg=proj(st,kp.X,0,kp.Z),kk=kAt(st,kp.Z);
  // "hardest to save": red brackets round the keeper — his hands wait at chest height
  {const fr=easeOutBack(sm(C3.hard,C3.hard+.3,tt))*(1-sm(C3.down+.3,C3.down+.6,tt));
   if(fr>.02){const h=1.8*kk,w=h*.42,hh=h*.58,cx=kg[0],cy=kg[1]-h*.5,Lb=h*.2*fr,br=new Path2D();
    for(const[sx,sy] of[[-1,-1],[1,-1],[1,1],[-1,1]] as Pt[]){const x=cx+sx*w,y=cy+sy*hh;br.addPath(ribbon([[x,y-sy*Lb],[x,y],[x-sx*Lb,y]],13,{seed:92+sx+sy*3,taper:0,wobble:.6}));}
    s.knockout(br);s.fill(R,br);}}
  // "The keeper must get down fast": a yellow arrow drops from his hands to the floor — the long way down
  {const g=sm(C3.down-.1,C3.down+.5,tt,easeOut)*(1-sm(C3.legs+.2,C3.legs+.5,tt));
   if(g>.02){const a=proj(st,kp.X+.5,1.25,kp.Z-.2),e=proj(st,kp.X+.5,.15,kp.Z-.2),q=[a,L2(a,e,.5),e],pp=partial(q,g);if(pp.length>1){dashed(s,Y,pp,12,720,{dash:34});arrowHead(s,Y,pp,38,721);}}}
  // "legs get in the way": red dashed rings round the defender's feet and the keeper's feet — the ball may skid off them
  {const g=easeOutBack(sm(C3.legs,C3.legs+.35,tt))*(1-sm(C3.so,C3.so+.3,tt));floorDashRing(s,st,R,DD[0],DD[1],.6,10,722,g);floorDashRing(s,st,R,kp.X,kp.Z,.55,9,723,g);}
  // the flight line (drawn as the ball goes), low along the floor
  if(tt>D_HIT){const pts:Pt[]=[];for(let k=0;k<=16;k++){const q=demoBall(lerp(D_HIT,Math.min(tt,D_IN),k/16));pts.push(proj(st,q.X,q.Y,q.Z));}dashed(s,Y,pts,11,703,{dash:40});if(goal)arrowHead(s,Y,pts,34,704);}
  const drawBall=()=>{const p=proj(st,b.X,b.Y,b.Z),g=proj(st,b.X,0,b.Z),r=Math.max(10,kAt(st,b.Z)*BALL_R),dir=Math.atan2(.05,-.1);shadow(s,g[0],g[1],r*1.1,r*.3,705,.45);
   if(b.flying)speedLines(s,R,p[0],p[1],dir,{n:5,seed:706+Math.floor(tt*6),len:r*3.2,spread:r*.8,width:5});
   ball(s,p[0],p[1],r,707,{rot:tt*6,smear:b.flying?.4:0,dir});if(tt>=D_HIT&&tt<D_HIT+.4)sparkBurst(s,Y,p[0],p[1],r*2.6,{n:10,seed:708,g:easeOut(sm(D_HIT,D_HIT+.3,tt))});};
  const L=demoC(tt);
  const its:{z:number;draw:()=>void}[]=[{z:DD[1],draw:()=>athlete(s,st,demoD,tt,DEMO_D,{detail:'mid'})},{z:L.Z,draw:()=>athlete(s,st,demoC,tt,COELHO,{detail:'high',smear:tt>D_HIT-.3&&tt<D_HIT+.3?.2:0})},
   {z:!b.flying&&tt<D_HIT?L.Z-.01:b.Z,draw:drawBall}];
  its.sort((a,c)=>c.z-a.z).forEach(it=>it.draw());
  if(tt>=D_IN&&tt<D_IN+1){const p=proj(st,DT[0],DT[1],GZ+.4);sparkBurst(s,Y,p[0],p[1],120,{n:12,seed:709,g:easeOut(sm(D_IN,D_IN+.3,tt))*(1-sm(D_IN+.7,D_IN+1,tt))});}
  // "low and hard": a big yellow tick stamps beside the goal, with a navy misregistered echo
  const tick=easeOutBack(sm(D_IN+.1,D_IN+.45,tt));
  if(tick>.02){const c=proj(st,2.6,1.3,GZ),S=150*tick,tk:Pt[]=[[-.5,0],[-.15,.38],[.55,-.5]].map(q=>[c[0]+q[0]*S,c[1]+q[1]*S] as Pt);
   const tp=ribbon(tk,S*.24,{seed:710,taper:.2,wobble:1});s.knockout(ribbon(tk,S*.34,{seed:711,taper:.1,wobble:1}));s.fill(K,ribbon(tk.map(q=>[q[0]+7,q[1]+7] as Pt),S*.24,{seed:712,taper:.2,wobble:1}),.5);s.fill(Y,tp);s.fill(R,tp,.25);}
 },
 aperture(t0){const{tt}=clock(2,t0);return aperture(chestPts(st3,demoC(tt),.13));},
 still:D_HIT+.3,
};

const SCENES=[sc1,sc2,sc3];
const film:RisoStory={
 id:'andre-coelho-futsal-signature',format:'futsal',title:'André Coelho’s driven strike',theme:'Strike low and hard: in futsal a low shot is the hardest to save.',
 ageNote:'For players aged 7–12: the 2022 EURO final goal is real; the last chapter is a demonstration of the lesson.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a mini futsal ball is driven low across the touch point with red speed lines and a yellow skid mark; reduced motion = the ball at rest. */
 touch(s,x,y,age,seed){
  const r=44;if(age<=0){ball(s,x,y,r,seed);return;}
  const u=clamp(age/.6),bx=x-120+240*easeOut(u);
  s.fill(K,polyPath(blob(bx,y+r*.95,r*.9,r*.22,seed+2,{n:16}),true),.3);
  if(u<1){const sk=ribbon([[x-130,y+r*.9],[bx-r,y+r*.9]],10*(1-u)+3,{seed,taper:.6,wobble:1});s.fill(Y,sk,1);speedLines(s,R,bx,y,0,{n:4,seed:seed+1,len:r*3,spread:r*.8,width:5});}
  ball(s,bx,y,r,seed,{rot:age*12,smear:u<1?.4*(1-u):0,dir:0});
 },
};
export default film;
