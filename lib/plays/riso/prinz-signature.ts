/** Birgit Prinz — "Signature: the powerful shot on the turn". Germany 1–0 Brazil (final score 2–0), 2007 FIFA Women's World Cup final,
 * Hongkou Football Stadium, Shanghai, Sunday 30 September 2007 (20:00 local kick-off), the 52nd minute. An iconic-play riso film
 * (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction of the goal
 * from WRITTEN accounts (the broadcast footage was not reviewed; no photograph of the goal was available), rendered as a riso print.
 *
 * WHY THIS MOMENT (kind:"signature"): Prinz's entry in lib/town/iconicPlays.json is a trait, "the powerful shot on the turn", with the
 * lesson "Shield the ball with your body, turn, then shoot with power." Her goal in the 2007 final is the best-documented goal of her
 * career (FIFA's own technical report describes it move by move) and it is exactly that sequence: shield → turn → first-time strike.
 * HONESTY NOTE: in this goal the shielding and the turn were done by her Frankfurt strike partner Sandra Smisek (the pair were known as
 * "Keks und Krümel"); Prinz struck it first time. The narration says so plainly and never claims Prinz did the turn herself.
 *
 * SOURCES (read Sept 2026 with curl, cached in the film scratchpad src-cache/):
 *  - FIFA, "FIFA Women's World Cup China 2007 – Report and Statistics" (technical report), The Final, p. 33 (EN), p. 36–37 (FR/ES/DE):
 *    "In the 52nd minute, Stegemann (2) played a long pass along the ground into the penalty area to Smisek who shielded the ball from a
 *    close defender, turned and played a perfect low pass to Prinz (9). A seasoned match winner, Prinz did not pass up the chance and
 *    stroked the ball past Andreia (1) first time and the Brazilian goalkeeper could not react fast enough to save." (DE: Smisek "den Ball
 *    vor ihrer Gegenspielerin abschirmte, sie mit einer Körpertäuschung aussteigen liess und perfekt auf ... Prinz (9) ablegte"; ES: Prinz
 *    "colocó el esférico ... [por] un costado de la portera Andreia"). Also the line-ups and the Germany 4-2-3-1 with "Prinz (9) played
 *    behind Smisek (8)"; Brazil's three-at-the-back with a libero. https://web.archive.org/web/20130402070402/http://www.fifa.com/mm/
 *    document/affederation/technicaldevp/72/72/89/fwwc%5fchina07%5freport%5fneu%5f081010.pdf
 *  - Wikipedia, "2007 FIFA Women's World Cup final" (30 September 2007, 20:00 CST, Hongkou, 31,000, referee Tammy Ogston; Prinz 52',
 *    Laudehr 86'; line-ups and numbers: Stegemann 2, Smisek 8, Prinz 9 (captain), Andreia 1, Aline 3, Tânia 4, Renata Costa 5; kit boxes:
 *    Germany white shirts, black shorts, white socks; Brazil yellow shirts, blue shorts, blue socks) https://en.wikipedia.org/wiki/2007_FIFA_Women%27s_World_Cup_final
 *  - The Guardian (staff and agencies), "Germany win World Cup", 30 Sep 2007 ("Prinz opened the scoring ... shortly after the interval by
 *    getting just enough purchase on Sandra Smisek's cross to turn the ball past Andreia"; Germany the first team to retain the title)
 *    https://www.theguardian.com/football/2007/sep/30/newsstory.sport6
 *  - Wikipedia EN + DE, "Birgit Prinz" (1.79 m striker; captain; Smisek and Prinz the Frankfurt strike pair "Keks und Krümel"; 14 World Cup
 *    goals; Silver Ball 2007) https://en.wikipedia.org/wiki/Birgit_Prinz · https://de.wikipedia.org/wiki/Birgit_Prinz
 *  - lib/plays/riso/angerer-marta-2007.ts (same match, read-only): the Hongkou bowl at night, the kits and inks, the women's builds.
 * CONFIRMED: date, venue, evening kick-off, crowd, referee; the 52nd minute, 0–0 before it; right-back Stegemann's long pass along the
 *  ground into the box; Smisek shields it from a close defender, feints, turns and lays a low pass to Prinz; Prinz strikes it FIRST TIME
 *  past Andreia, who cannot react in time; Germany won 2–0 (Laudehr 86'). Kits: Germany white / black / white; Brazil yellow / blue / blue.
 * INFERRED (illustrative, not narrated): which end (drawn so that, from the main stand, Brazil's goal is on the LEFT — consistent with the
 *  angerer-marta-2007 film where Germany defend the right-hand goal in the same half) and therefore that Stegemann's flank is the FAR
 *  touchline; every position and distance (the pass ≈ 27 m from ≈ 40 m out; Smisek receives ≈ 14.5 m out right of centre; Prinz strikes
 *  ≈ 12.3 m out, just left of centre); which defender was tight on Smisek (drawn Renata Costa, 5) and the other players' spots; Prinz's
 *  kicking foot (drawn RIGHT, her stronger foot) and the side of the goal (drawn low into the corner to Andreia's right — the Guardian's
 *  "turn the ball past" read as a redirected, placed finish); Andreia's late, short dive; keeper kit colours (Andreia drawn navy — the
 *  other film draws Angerer red); hair colours; the celebrations; Hongkou's look, the crowd, every camera position and the replay speed.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the bowl → Stegemann's long pass → Smisek
 * shields, turns, lays it off → Prinz first time → goal, the crowd flashes); ch2 = the slow-motion replay LOW from the edge of the box
 * behind Prinz's run (the shield: Smisek's back to the defender; the feint and turn; the lay-off; the strike before Andreia can move; a
 * riso trail on the ball); ch3 = the second replay angle from BEHIND THE GOAL by the right post (the ball comes at the camera past
 * Andreia into the net; then the celebration); ch4 = the lesson: shield the ball with your body (a yellow shield arc between the defender
 * and the ball) → turn (a curved arrow round Smisek) → shoot with power (a red power arrow along the strike, a burst at the boot).
 * Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window
 * down to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev`
 * secondary motion so the ponytails swing, motionSmear on the strike and the dive); women's builds (1.64–1.79 m, slimmer bulk) with
 * ponytails; small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is right-handed
 * (x toward Brazil's goal, y up), athlete.ts's own convention, so Prinz's RIGHT boot strikes with no mirrored projector; the cameras sit on
 * the −z side (the main stand). Andreia faces −x, so her RIGHT is −z (keeperDive side 'r'). Inks: yellow, red, blue, navy. Everything is
 * keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded.
 * Budget ≈ 180–340 plate ops per frame (wide shot: 13 low-detail figures). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,celebrate,lunge,backpedal,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/prinz-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/prinz-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues).
 * NB withTiming matches a cue by its FIRST word only, in order — so no cue starts with a word that also appears between it and the previous
 * cue's first word. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:"Shanghai, 2007: the World Cup final, Germany against Brazil. Stegemann's long pass finds Sandra Smisek. She shields, turns... Birgit Prinz shoots first time. Goal!",tail:2.6,
  cues:['Shanghai','Germany against',"Stegemann's",'finds','She shields','turns','Birgit Prinz','shoots','Goal']},
 {label:'Watch it again',text:'Watch it again, slowly. Smisek keeps her body between the defender and the ball. She turns and slides it across. Prinz strikes before the keeper can move!',tail:1.6,
  cues:['Watch it again','Smisek keeps','body between','She turns','slides','Prinz strikes','before']},
 {label:'Past the keeper',text:'From behind the goal: past Andreia, and in! Germany went on to win two-nil.',tail:1.8,
  cues:['From behind','past Andreia','and in','Germany went','two-nil']},
 {label:'The secret',text:'The secret? Shield the ball with your body. Turn. Then shoot with power, like Birgit Prinz!',tail:1.8,
  cues:['The secret','Shield','body','Turn','Then shoot','power']},
];
import timingJson from '../../../public/plays/narration/prinz-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('prinz: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('prinz: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const DEG=Math.PI/180;
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
/** a local offset (forward f, right r) of a figure with this yaw, in world x/z (athlete.ts: Ry(yaw)) */
const rotY=(yaw:number,f:number,r:number):[number,number]=>{const c=Math.cos(yaw),s=Math.sin(yaw);return[c*f+s*r,-s*f+c*r];};
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Brazil's goal line is x = 0 (Germany attack +x), the goal centre z = 0; the main stand (every camera) is on the −z side. */
type Cam=Camera;
const NEAR=.4;
function toCam(c:Cam,P:V3):V3{const d:V3=[P[0]-c.eye[0],P[1]-c.eye[1],P[2]-c.eye[2]];return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.center[0]+c.F*q[0]/q[2],c.center[1]-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const kAt=(c:Cam,P:V3)=>c.F/Math.max(NEAR,toCam(c,P)[2]);
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- Hongkou Football Stadium at night (the same bowl as angerer-marta-2007)
/** stand planes (a along, b up the rake 0..1): 0 the main stand (z<0, behind the cameras), 1 behind Brazil's goal, 2 the far side (z>0), 3 the other end */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-114,10,a),1.2+24*b,-39-27*b],
 (a,b)=>[6+27*b,1.2+25*b,lerp(-54,54,a)],
 (a,b)=>[lerp(10,-114,a),1.2+28*b,39+30*b],
 (a,b)=>[-111-27*b,1.2+25*b,lerp(54,-54,a)],
];
const STAND_COLS=[104,72,104,72],STAND_ROWS=16,WALKS=[[.48],[.48],[.48],[.48]];
/** flags on the stand fronts: [stand, a, kind 0 = Germany (navy | red | yellow bands), 1 = Brazil (yellow, a blue disc), 2 = China (red, a yellow star)] */
const FLAGS:[number,number,number][]=[[2,.3,0],[2,.46,1],[2,.6,2],[2,.76,0],[1,.2,1],[1,.42,0],[1,.64,2],[1,.84,1],[0,.14,0],[0,.32,1],[3,.3,2],[3,.62,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // an autumn night in Shanghai: a deep navy print over the paper, a faint floodlit haze over the bowl
 s.field(K,.86,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-700],[1e4,hz[1]-700],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true),.14);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i],q=polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]);addPoly(planes,q);for(const b of WALKS[i])seg3(c,S(0,b),S(1,b),.7,walk);
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.8),[0,10.5,0]),add3(S(0,.8),[0,10.5,0])]));
  seg3(c,add3(S(0,.8),[0,10.3,0]),add3(S(1,.8),[0,10.3,0]),.45,edge);}
 s.knockout(planes);s.tone(K,planes,.55);s.tone(B,planes,.24);s.knockout(walk,.5);
 // the crowd: a mostly Chinese crowd in red, Brazil yellow, Germany white, a scatter of blue; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS[si].some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.45?0:h<.72?1:h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.knockout(inks[2],.8);s.fill(Y,inks[2],.95);s.fill(B,inks[3],.85);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.7);
 // flags: Germany navy-red-yellow bands; Brazil yellow with a blue disc; China red with a yellow star
 const red=new Path2D(),gold=new Path2D(),navy=new Path2D(),blue=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.07),P(0,.07)]);if(q.length<3)continue;
  if(kind===0){addPoly(navy,polyP(c,[P(0,.049),P(1,.049),P(1,.07),P(0,.07)]));addPoly(red,polyP(c,[P(0,.027),P(1,.027),P(1,.049),P(0,.049)]));addPoly(gold,polyP(c,[P(0,.005),P(1,.005),P(1,.027),P(0,.027)]));}
  else if(kind===1){gold.addPath(polyPath(q,true));addPoly(blue,polyP(c,[P(.36,.025),P(.64,.025),P(.64,.05),P(.36,.05)]));}
  else{red.addPath(polyPath(q,true));addPoly(gold,polyP(c,[P(.12,.05),P(.3,.05),P(.3,.062),P(.12,.062)]));}}
 s.knockout(red);s.knockout(gold);s.knockout(navy);s.fill(R,red,.95);s.fill(Y,gold,.95);s.fill(K,navy,.95);s.fill(B,blue,.95);
 // floodlights along the roof lip with yellow haloes
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.8),[0,9.6,0]),b=add3(S(u+.025,.8),[0,9.6,0]),m=mix3(a,b,.5);if(toCam(c,m)[2]<NEAR+2)continue;seg3(c,a,b,1.1,lamp);
  const g=pr(c,m);if(g){const r=clamp(kAt(c,m)*4.5,8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
// ---------------------------------------------------------------- grass under the floodlights, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{goal?:boolean}={}){
 const g=polyP(c,[[-112,0,-42],[9,0,-42],[9,0,42],[-112,0,42]]);if(g.length<3)return;const gp=polyPath(g,true);
 // green = yellow under a blue screen
 s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.52);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(B,st,.18);
 // advertising boards: navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([4.5,0,-37],[4.5,0,37]);board([-109,0,-37],[4.5,0,-37]);board([-109,0,37],[4.5,0,37]);
 for(let k=0;k<12;k++){const z=-35+k*6.1;addPoly(pn,polyP(c,[[4.4,.25,z],[4.4,.25,z+3.3],[4.4,.68,z+3.3],[4.4,.68,z]]));}
 for(const zz of[-36.9,36.9])for(let k=0;k<18;k++){const x=-107+k*6.3;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 {const d:V3[]=[];for(let i=0;i<12;i++){const a=i/12*TAU;d.push([-11+Math.cos(a)*.15,0,Math.sin(a)*.15]);}addPoly(ln,polyP(c,d));}
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
 if(o.goal!==false)goal3(s,c);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; `bulge` pushes the back of the net out where the ball hit it */
function goal3(s:Sheet,c:Cam,bulge=0){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=-2.9,back=(y:number,z:number)=>X+2+bulge*.45*Math.max(0,1-Math.hypot((z-bz)/1.6,(y-.4)/.9));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(1.9,z0),1.9,z0],[back(0,z0),0,z0]],[[X,0,z1],[X,H,z1],[back(1.9,z1),1.9,z1],[back(0,z1),0,z1]],
  [[X,H,z0],[X,H,z1],[back(1.9,z1),1.9,z1],[back(1.9,z0),1.9,z0]],[[back(0,z0),0,z0],[back(0,z1),0,z1],[back(1.9,z1),1.9,z1],[back(1.9,z0),1.9,z0]]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(1.9,z),1.9,z],.022,mesh,.7);
  for(let j=0;j<3;j++){const y0=1.9*(1-j/3),y1=1.9*(1-(j+1)/3);seg3(c,[back(y0,z),y0,z],[back(y1,z),y1,z],.022,mesh,.7);}}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)for(let h=0;h<2;h++){const za=lerp(zs[i],zs[i+1],h/2),zb=lerp(zs[i],zs[i+1],(h+1)/2);seg3(c,[back(y,za),y,za],[back(y,zb),y,zb],.022,mesh,.7);}
  seg3(c,[X,y*H/1.9,z0],[back(y,z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(y,z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.32],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** women footballers: slimmer athletic builds (the Marta / Angerer films' WOMAN build) */
const W_BUILD=(height:number,bulk=.88):Build=>({height,bulk,thighs:1.02,head:1.03});
/** Germany: white shirts, black shorts (navy ink), white socks, black numbers */
const ger=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:[K,.92],socks:'paper',boots:K,skin:SKIN_L,hair:[Y,.7],line:K,trim:K,numberInk:K,hairStyle:'ponytail',shade:[K,.26],build:W_BUILD(1.7),...o});
/** Brazil: yellow shirts, blue shorts and socks, blue numbers */
const bra=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[B,.92],socks:[B,.92],boots:K,skin:SKIN_M,hair:[K,.9],line:K,trim:B,numberInk:B,hairStyle:'ponytail',shade:[K,.26],build:W_BUILD(1.66),...o});
/** Birgit Prinz: 1.79 m, the captain, number 9; a strong athletic build; dark-blonde ponytail (hair colour inferred) */
const PRINZ_B=W_BUILD(1.79,.95);
const PRINZ_ST=ger({number:9,hair:[R,.5],build:PRINZ_B,seed:9});
/** Sandra Smisek: number 8 (build and hair inferred) */
const SMI_B=W_BUILD(1.71,.92);
const SMI_ST=ger({number:8,hair:[Y,.75],build:SMI_B,seed:8});
/** Kerstin Stegemann: right-back, number 2 */
const STEG_B=W_BUILD(1.68,.9);
const STEG_ST=ger({number:2,hair:[K,.7],build:STEG_B,seed:2});
/** Renata Costa (5), the defender tight on Smisek (which defender it was is inferred) */
const REN_B=W_BUILD(1.72,.92);
const REN_ST=bra({number:5,skin:SKIN_D,hair:[K,.95],build:REN_B,seed:5});
/** Andreia (1): keeper kit drawn navy with long sleeves and light gloves (colour inferred), dark ponytail */
const AND_B=W_BUILD(1.72,.92);
const AND_ST:AthleteStyle={shirt:[K,.8],shorts:[K,.9],socks:[K,.8],boots:K,skin:SKIN_M,hair:[K,.95],line:K,trim:[Y,.9],gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:'paper',shade:[K,.3],build:AND_B,seed:1};
/** referee Tammy Ogston (kit colour inferred: black) */
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[Y,.6],line:K,trim:'paper',hairStyle:'ponytail',build:W_BUILD(1.68),seed:30};

// ---------------------------------------------------------------- the move on one clock τ (seconds; τ = 0 is Prinz's strike)
const T_PASS=-3.0,T_RECV=-1.22,T_LAY=-.5,T_G=.6;
/** Smisek: comes short from S0 to S_R, back to goal, facing the passer; shields, feints left, turns right, lays it across */
const S0:[number,number]=[-12.4,3.7],S_R:[number,number]=[-14.6,2.6],T_S0=-3.3;
/** where Stegemann strikes the long pass (≈ 40 m out on the far, right-hand flank for Germany) */
const B_P:V3=[-40.5,.11,15.4];
const YAW_R=yawTo(S_R[0],S_R[1],B_P[0],B_P[2]);
/** the feint (left) and the turn (right, clockwise seen from above) to face the lay-off */
const B_SHOT:V3=[-12.3,.11,-1.55];
const YAW_LAY=yawTo(S_R[0],S_R[1],B_SHOT[0],B_SHOT[2])+.25;
const SMI_LAY=.28;
/** Smisek's local toe offset at the lay-off contact (forward, right), solved once */
const L_LAY:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:SMI_LAY}),SMI_B,{x:0,z:0,yaw:0});return[sk.rToe[0]+.1,sk.rToe[2]];})();
const L_HOLD:[number,number]=[.42,.12];
function smiYaw(tau:number){
 if(tau<T_RECV-.15)return YAW_R;
 const feint=YAW_R+22*DEG*Math.sin(Math.PI*clamp((tau-(T_RECV-.05))/.5))*(tau<-.85?1:0);
 if(tau<-.85)return feint;
 return lerpAng(YAW_R,YAW_LAY,sm(-.85,T_LAY-.12,tau,easeInOutSine));
}
function smiPlace(tau:number):Place{
 let x:number,z:number;
 if(tau<T_S0){x=S0[0];z=S0[1];}
 else if(tau<T_RECV-.08){const u=easeOut(clamp((tau-T_S0)/(T_RECV-.08-T_S0)));x=lerp(S0[0],S_R[0],u);z=lerp(S0[1],S_R[1],u);}
 else{const u=sm(-.9,T_LAY,tau);x=S_R[0]+.28*u;z=S_R[1]-.12*u;}
 return{x,z,yaw:smiYaw(tau)};
}
/** the ball at Smisek's feet, in her local frame: the controlling touch, held away from the defender, then dragged round onto her right foot */
function smiBall(tau:number):V3{
 const pl=smiPlace(tau),u=sm(T_LAY-.28,T_LAY,tau),f=lerp(L_HOLD[0],L_LAY[0],u),r=lerp(L_HOLD[1],L_LAY[1],u),[dx,dz]=rotY(pl.yaw??0,f,r);
 return[(pl.x??0)+dx,.11,(pl.z??0)+dz];
}
const RECV_B=smiBall(T_RECV),LAY_B=smiBall(T_LAY);
const PASS_L=Math.hypot(RECV_B[0]-B_P[0],RECV_B[2]-B_P[2]),DIRP:[number,number]=[(RECV_B[0]-B_P[0])/PASS_L,(RECV_B[2]-B_P[2])/PASS_L];
const YAW_P=yawTo(0,0,DIRP[0],DIRP[1]);

// ---------------------------------------------------------------- Stegemann: carries it up the right, the long pass along the ground, jogs on
const STEG_POW=.85,STEG_SD=.8,STEG_V=2.3;
const PCS:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:STEG_POW}),STEG_B,{x:0,z:0,yaw:YAW_P});return[B_P[0]-DIRP[0]*.1-sk.rToe[0],B_P[2]-DIRP[1]*.1-sk.rToe[2]];})();
function stegPlace(tau:number):Place{
 if(tau<T_PASS){const g=(tau-T_PASS)*STEG_V;return{x:PCS[0]+DIRP[0]*g,z:PCS[1]+DIRP[1]*g,yaw:YAW_P};}
 const g=.55*(1-Math.pow(1-clamp((tau-T_PASS)/.6),2)),j=Math.max(0,tau-T_PASS-.7)*2.4,yaw=lerpAng(YAW_P,0,sm(T_PASS+.5,T_PASS+1.2,tau));
 return{x:PCS[0]+DIRP[0]*g+j,z:PCS[1]+DIRP[1]*g,yaw};
}
function stegPose(tau:number):Pose{
 const us=STRIKE_CONTACT+(tau-T_PASS)/STEG_SD;
 let p=dribble((tau-T_PASS)*STEG_V/1.5,{foot:'r',speed:.5});
 p=blendPose(p,strike(clamp(us),{foot:'r',power:STEG_POW}),sm(T_PASS-.34,T_PASS-.2,tau));
 if(tau>T_PASS+.55)p=blendPose(p,runCycle(Math.max(0,tau-T_PASS-.7)*2.4/2.6,{speed:.5}),sm(T_PASS+.55,T_PASS+.9,tau));
 return p;
}

// ---------------------------------------------------------------- Prinz: the run from behind, the first-time RIGHT-foot strike, away to celebrate
const G_T:V3=[0,.3,-2.72];
const DSN=Math.hypot(G_T[0]-B_SHOT[0],G_T[2]-B_SHOT[2]),DS:[number,number]=[(G_T[0]-B_SHOT[0])/DSN,(G_T[2]-B_SHOT[2])/DSN];
const YAW_S=yawTo(0,0,DS[0],DS[1]);
const P_POW=.9,SD=.9,RUN_END=-STRIKE_CONTACT*SD,STRIKE_L=1.3,T_P0=-4.6;
const PCP:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:P_POW}),PRINZ_B,{x:0,z:0,yaw:YAW_S});return[B_SHOT[0]-DS[0]*.1-sk.rToe[0],B_SHOT[2]-DS[1]*.1-sk.rToe[2]];})();
const pPos=(g:number):[number,number]=>[PCP[0]+DS[0]*g,PCP[1]+DS[1]*g];
const P_A=pPos(-STRIKE_L),P_0:[number,number]=[-25.2,-8.6];
const RUN_D=Math.hypot(P_A[0]-P_0[0],P_A[1]-P_0[1]);
/** her run from deep, accelerating (u → distance fraction) */
const runF=(tau:number)=>{const u=clamp((tau-T_P0)/(RUN_END-T_P0));return .6*u+.4*u*u;};
const YAW_RUN=yawTo(P_0[0],P_0[1],P_A[0],P_A[1]);
function prinzPlace(tau:number):Place{
 if(tau<RUN_END){const f=runF(tau);return{x:lerp(P_0[0],P_A[0],f),z:lerp(P_0[1],P_A[1],f),yaw:lerpAng(YAW_RUN,YAW_S,sm(RUN_END-.9,RUN_END,tau))};}
 let g:number;
 if(tau<0){const v=(tau-RUN_END)/-RUN_END;g=-STRIKE_L+STRIKE_L*(.6*v+.4*(1-(1-v)*(1-v)));}
 else g=1.1*(1-Math.pow(1-clamp(tau/1),2));
 const[x,z]=pPos(g);
 // away to celebrate: a few strides toward the corner of the box
 const w=Math.max(0,tau-1.05),cx=x+Math.min(w,1.6)*2.6*.5,cz=z-Math.min(w,1.6)*2.6*.85;
 return{x:cx,z:cz,yaw:lerpAng(YAW_S,yawTo(0,0,.5,-.85),sm(.9,1.3,tau))};
}
/** run phase: .5 = left foot down at RUN_END, so she plants the LEFT and strikes with the RIGHT */
const runPh=(tau:number)=>.5+(runF(tau)-1)*RUN_D/2.9;
function prinzPose(tau:number,it=0):Pose{
 if(tau<RUN_END){const f=runF(tau);return runCycle(runPh(tau),{speed:.45+.45*f});}
 const us=STRIKE_CONTACT+tau/SD;
 let p=blendPose(runCycle(runPh(RUN_END)+(tau-RUN_END)*1.6,{speed:.9}),strike(Math.min(1,us),{foot:'r',power:P_POW}),sm(RUN_END,RUN_END+.12,tau));
 if(tau>1)p=blendPose(p,celebrate(it*1.1,{kind:'run'}),sm(1,1.35,tau));
 return p;
}

// ---------------------------------------------------------------- Andreia: set, shuffles across, the late short dive to her right, beaten
const AND_X=-.8,T_KD=.24,KD_S=.95;
function andPlace(tau:number):Place{
 const bz=tau<0?(tau<T_LAY?RECV_B[2]:lerp(LAY_B[2],B_SHOT[2],clamp((tau-T_LAY)/-T_LAY))):B_SHOT[2];
 const z=clamp(bz*.28,-1,1),x=AND_X-.35*sm(-1,0,tau);
 return{x,z,yaw:yawTo(x,z,tau<T_LAY?RECV_B[0]:B_SHOT[0],tau<T_LAY?RECV_B[2]:B_SHOT[2])};
}
function andPose(tau:number,it=0):Pose{
 let p=keeperSet(it*1.2);
 if(tau>T_KD){const u=clamp((tau-T_KD)/KD_S);p=blendPose(p,keeperDive(u,{side:'r',height:.12}),sm(T_KD,T_KD+.06,tau));}
 return p;
}

// ---------------------------------------------------------------- Renata Costa: tight behind Smisek, bites on the feint, turned, chases
const REN_OFF:[number,number]=[-.82,-.18];
function renPlace(tau:number):Place{
 const pl=smiPlace(Math.min(tau,T_RECV)),[dx,dz]=rotY(YAW_R,REN_OFF[0],REN_OFF[1]);
 let x=(pl.x??0)+dx,z=(pl.z??0)+dz;
 // the feint pulls her a step to her left (Smisek's left), then she turns and chases the lay-off
 const f=sm(T_RECV,-.8,tau)*(1-sm(-.6,-.2,tau)*.4),[fx,fz]=rotY(YAW_R,0,-.45);x+=fx*f;z+=fz*f;
 const ch=Math.max(0,tau+.35);x+=ch*2.2*.4;z+=-ch*2.2*.9;
 const yaw=tau<-.5?YAW_R+Math.PI:lerpAng(YAW_R+Math.PI,yawTo(x,z,B_SHOT[0],B_SHOT[2]),sm(-.5,-.2,tau));
 return{x,z,yaw};
}
function renPose(tau:number,it=0):Pose{
 let p=backpedal(it*1.4);
 p=blendPose(p,lunge(clamp((tau+1.05)/.55),{side:'l'}),sm(-1.1,-1,tau)*(1-sm(-.55,-.35,tau)));
 if(tau>-.4)p=blendPose(p,runCycle((tau+.4)*1.9,{speed:.8}),sm(-.4,-.25,tau));
 if(tau>T_G+.4)p=blendPose(p,SLUMP,sm(T_G+.4,T_G+1,tau));
 return p;
}

// ---------------------------------------------------------------- the ball
function ballAt(tau:number):V3{
 if(tau<T_PASS){const g=Math.min(0,tau-T_PASS+.25)*STEG_V;return[B_P[0]+DIRP[0]*g,.11,B_P[2]+DIRP[1]*g];}
 if(tau<T_RECV){const u=(tau-T_PASS)/(T_RECV-T_PASS),e=u*(1.3-.3*u);return[lerp(B_P[0],RECV_B[0],e),.11,lerp(B_P[2],RECV_B[2],e)];}
 if(tau<T_LAY)return smiBall(tau);
 if(tau<0){const u=(tau-T_LAY)/-T_LAY,e=u*(1.15-.15*u);return[lerp(LAY_B[0],B_SHOT[0],e),.11,lerp(LAY_B[2],B_SHOT[2],e)];}
 if(tau<T_G){const u=tau/T_G;return[lerp(B_SHOT[0],G_T[0],u),lerp(B_SHOT[1],G_T[1],u)+.12*Math.sin(Math.PI*u),lerp(B_SHOT[2],G_T[2],u)];}
 // into the side netting, dropping in the back of the net
 const u=clamp((tau-T_G)/.4),e=easeOut(u),d=clamp((tau-T_G-.4)/.5);
 return[lerp(G_T[0],1.62,e)-.1*d,Math.max(.11,lerp(G_T[1],.36,e)-.25*d*d),lerp(G_T[2],-3.02,e)];
}
const spinAt=(tau:number)=>tau<T_PASS?TAU*1.5*tau:tau<T_RECV?TAU*3*(tau-T_PASS):tau<0?TAU*2*tau:TAU*6*Math.min(tau,T_G)+TAU*Math.max(0,Math.min(tau,T_G+1)-T_G);
const netBulge=(tau:number)=>sm(T_G+.1,T_G+.35,tau)*(1-sm(T_G+.6,T_G+1.3,tau));

// ---------------------------------------------------------------- Smisek's pose: comes short, the shield, the feint, the turn, the lay-off
/** the shield: low, wide, leaning back into the defender, arms out to feel her, eyes on the ball */
const SHIELD=posed({lHipF:36,rHipF:26,lHipA:20,rHipA:18,lKnee:52,rKnee:44,lAnk:-4,rAnk:-4,lean:16,pitch:-5,neckP:30,lShA:62,rShA:48,lShF:-22,rShF:6,lElb:44,rElb:52,lShR:-10,rShR:-10});
const HIPS=posed({lShA:30,rShA:30,lShF:-24,rShF:-24,lElb:96,rElb:96,lShR:-40,rShR:-40,lHipF:8,rHipF:8,lKnee:12,rKnee:12,lean:6,neckP:2});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const HANDS_HEAD=posed({lShA:150,rShA:150,lShF:36,rShF:36,lElb:138,rElb:138,lShR:30,rShR:30,neckP:14,lean:10,lHipF:6,rHipF:10,lKnee:12,rKnee:14,lHand:1,rHand:1});
function smiPose(tau:number,it=0):Pose{
 if(tau<T_S0)return blendPose(stand(),HIPS,.2);
 let p=runCycle((tau-T_S0)*1.9,{speed:.55});
 // the controlling touch, then the shield
 p=blendPose(p,SHIELD,sm(T_RECV-.2,T_RECV+.1,tau));
 // the feint: shoulders and head dip to her left
 const fe=Math.sin(Math.PI*clamp((tau-(T_RECV-.05))/.5))*(tau<-.7?1:0);if(fe>0){p.bend-=14*DEG*fe;p.twist+=18*DEG*fe;p.neckY+=20*DEG*fe;p.roll-=6*DEG*fe;}
 // the turn: quick stepping feet as she spins
 const tu=sm(-.9,-.8,tau)*(1-sm(T_LAY-.2,T_LAY-.12,tau));if(tu>0)p=blendPose(p,dribble((tau+.9)*3.2,{foot:'r',speed:.2}),tu*.55);
 // the lay-off: a short right-foot pass
 const us=STRIKE_CONTACT+(tau-T_LAY)/.55;if(tau>T_LAY-.16)p=blendPose(p,strike(clamp(us),{foot:'r',power:SMI_LAY}),sm(T_LAY-.16,T_LAY-.08,tau)*(1-sm(T_LAY+.35,T_LAY+.6,tau)*.7));
 if(tau>T_G+.2)p=blendPose(p,celebrate(it*.9+.3,{kind:'arms'}),sm(T_G+.2,T_G+.6,tau));
 return p;
}
const smiPlaceFinal=(tau:number):Place=>{const pl=smiPlace(tau);if(tau>T_LAY+.2)pl.yaw=lerpAng(pl.yaw??0,yawTo(pl.x??0,pl.z??0,B_SHOT[0],B_SHOT[2]),sm(T_LAY+.2,T_LAY+.6,tau));return pl;};

// ---------------------------------------------------------------- everyone else: drifting with the play, then the reactions
type Role='ref'|'bra'|'ger';
type Actor={name:string;role:Role;st:AthleteStyle;x:number;z:number;vx:number;vz:number;phase:number};
const ACTORS:Actor[]=[{name:'Ogston',role:'ref',st:{...REF_ST,detail:'low'},x:-27,z:-10.5,vx:2.4,vz:.5,phase:.6}];
{// positions at τ = 0 and a running velocity (m/s); all inferred from the report's shape (Germany 4-2-3-1, Brazil three at the back)
 const grs:[number,number,number,number,number][]=[[18,-17.5,9.8,3.4,-1],[7,-21.5,-14.5,3,1.1],[10,-27,-1.2,2.4,0],[14,-35.5,5.5,1.6,0],[6,-44,-17,1.2,0]];
 const brs:[number,number,number,number,number][]=[[3,-10.4,.9,-.5,-1.2],[4,-11,-7.4,.4,1.6],[2,-15.8,12.8,1.5,-.8],[8,-19.2,4.1,2.5,-.6],[9,-19.6,-10.6,2.2,.6],[7,-25,9.2,2.2,-.5],[20,-24.2,-3.4,2.6,.3],[10,-38.5,-6,1.2,0]];
 grs.forEach(([n,x,z,vx,vz],i)=>ACTORS.push({name:'Germany '+n,role:'ger',st:ger({number:n,hair:i%2===0?[Y,.7]:[K,.75],build:W_BUILD(1.66+.03*(i%3),.9),seed:50+i,detail:'low'}),x,z,vx,vz,phase:i*.31}));
 brs.forEach(([n,x,z,vx,vz],i)=>ACTORS.push({name:'Brazil '+n,role:'bra',st:bra({number:n,skin:i%3===1?SKIN_D:SKIN_M,hair:[K,.9],hairStyle:i%3===2?'curly':'ponytail',build:W_BUILD(1.62+.03*(i%3),.88),seed:40+i,detail:'low'}),x,z,vx,vz,phase:i*.23}));}
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const run=clamp(tau,-7,T_G+.2),x=a.x+a.vx*run,z=a.z+a.vz*run,sp=Math.hypot(a.vx,a.vz),b=ballAt(Math.min(tau,T_G));
 const moving=tau<T_G+.2,dist=sp*(run+7);
 let p=moving?runCycle(dist/2.7+a.phase,{speed:clamp(sp/5)}):blendPose(stand(),HIPS,.3);
 let yaw=moving&&sp>.3?yawTo(0,0,a.vx,a.vz):yawTo(x,z,b[0],b[2]);
 if(moving&&sp>.3)yaw=lerpAng(yaw,yawTo(x,z,b[0],b[2]),.35);
 const done=sm(T_G+.2,T_G+.8,tau);
 if(done>0){p=blendPose(runCycle(dist/2.7+a.phase,{speed:clamp(sp/5)}),a.role==='ger'?celebrate(it*.9+a.phase,{kind:'arms'}):a.role==='bra'?(a.phase*10%2<1?HANDS_HEAD:SLUMP):stand(),done);yaw=yawTo(x,z,B_SHOT[0],B_SHOT[2]);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the strike, the turn, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.15,.1,.5));
 if(o.lines&&o.prev!==undefined&&(tau>T_PASS&&tau<T_RECV||tau>0&&tau<T_G+.2)){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:3,seed:7,len:Math.min(200,d*1.2),spread:r*.8,width:Math.max(2.5,r*.16),cov:.75});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the flown path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=20):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';crowd?:boolean};
type Hero={st:AthleteStyle;place:(t:number)=>Place;pose:(t:number,it:number)=>Pose;smear?:(t:number)=>boolean};
const HEROES:Hero[]=[
 {st:PRINZ_ST,place:prinzPlace,pose:prinzPose,smear:t=>t>RUN_END-.1&&t<.35},
 {st:SMI_ST,place:smiPlaceFinal,pose:smiPose,smear:t=>t>-.85&&t<T_LAY+.2},
 {st:REN_ST,place:renPlace,pose:renPose},
 {st:AND_ST,place:andPlace,pose:andPose,smear:t=>t>T_KD&&t<T_G+.2},
 {st:STEG_ST,place:stegPlace,pose:stegPose,smear:t=>t>T_PASS-.3&&t<T_PASS+.3},
];
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(hero&&e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 for(const h of HEROES){const pl=h.place(tp),d=visible(pl);if(d<0)continue;
  items.push({d,draw:()=>{const pose=h.pose(tp,e.it),prev={pose:h.pose(tpPrev,e.it-1/12),place:h.place(tpPrev)};drawPlayer(s,pose,c,detailFor(h.st,d,true),pl,prev,!!e.smear&&!!h.smear&&h.smear(tp));}});}
 if(e.crowd)for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;
  items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);drawPlayer(s,cur.pose,c,detailFor(a.st,d,false),cur.place,prev);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.2,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const pxz=(pl:Place,y=1):V3=>[pl.x??0,y,pl.z??0];
/** a smoothed follow target for the ball (a camera operator lags the ball a little) */
const followBall=(tau:number):V3=>{const a=ballAt(tau-.25),b=ballAt(tau);return[lerp(a[0],b[0],.6),.9,lerp(a[2],b[2],.6)];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** the strike on "shoots"; never less than 3 s after "Stegemann's" (the pass) so the move plays at its real speed */
const tS1=()=>Math.max(CUE(0,'shoots')+.1,CUE(0,"Stegemann's")+.1-T_PASS);
const tau1=(t:number)=>t-tS1();
const P1:V3=[-30,20,-58];
function cam1(t:number):Cam{
 const t0=tS1();
 return plan(t,[
  [0,0,()=>({P:P1,T:[-30,2,4],fov:44})],
  [CUE(0,'Germany against')-.2,1.4,()=>({P:P1,T:[-30,1,6],fov:24})],
  [t0+T_PASS-.6,.9,t=>({P:P1,T:mix3(followBall(tau1(t)),[-18,1,3],.45),fov:15})],
  [t0+T_RECV-.3,.8,()=>({P:P1,T:[-14.2,1,2],fov:7.2})],
  [t0+T_LAY-.1,.6,()=>({P:P1,T:[-8.8,1,-.6],fov:11})],
  [t0+T_G+.5,1.3,t=>({P:P1,T:pxz(prinzPlace(tau1(t))),fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tG=tS1()+T_G,tGl=CUE(0,'Goal');
  stadium(s,c,t,[1,2,3],{roar:sm(tG,tG+.4,t),flash:sm(tGl-.1,tGl+.3,t)*(1-sm(tGl+2.2,tGl+3.2,t))});
  ground(s,c,{goal:false});goal3(s,c,netBulge(tau));
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lines:true,prevT:tau-.06,hero:'mid',crowd:true});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:7,
};

// ---------------------------------------------------------------- 2 · the slow-motion replay, low from the edge of the box: shield, turn, lay-off, strike
const tau2=(t:number)=>key(t,mono([[0,-1.75],[CUE(1,'Smisek keeps'),T_RECV+.05],[CUE(1,'body between'),-1.0],[CUE(1,'She turns'),-.82],[CUE(1,'slides'),T_LAY+.02],[CUE(1,'Prinz strikes'),-.1],[CUE(1,'before'),.12],[SECS(1),T_G+.3]]),linear);
/** the reverse angle (a replay camera across the pitch), side-on to Smisek and her marker, clear of Prinz's run */
const E2:V3=[-9.2,1.7,14.2];
function cam2(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E2,T:[-16,1,3],fov:20})],
  [CUE(1,'Smisek keeps')-.3,1,()=>({P:add3(E2,[-1,-.1,-2.5]),T:[-14.4,.85,2.3],fov:14})],
  [CUE(1,'She turns')-.2,1,()=>({P:add3(E2,[-.5,-.1,-2.5]),T:[-13.6,.8,.6],fov:20})],
  [CUE(1,'Prinz strikes')-.6,1.1,()=>({P:[-8.2,4.4,7.6],T:[-11,.5,-1.6],fov:33})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  stadium(s,c,t,[1,2,3],{roar:sm(T_G,T_G+.4,tau)});
  ground(s,c,{goal:false});goal3(s,c,netBulge(tau));
  // the replay trail: the lay-off and the strike so far (under the players)
  if(tau>T_LAY&&tau<T_G+.5){const ta=Math.max(T_LAY,tau-.6),pts=pathPts(c,ta,Math.min(tau,T_G),16),fade=1-sm(T_G,T_G+.5,tau);if(pts.length>2){const w=Math.max(8,kAt(c,ballAt(Math.min(tau,T_G)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,crowd:true});
  // the strike: a yellow burst at the boot
  const hit=sm(-.02,.06,tau)*(1-sm(.25,.55,tau));if(hit>0){const q=pr(c,B_SHOT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,B_SHOT)*.45)*easeOutBack(hit),{n:9,seed:23,width:Math.max(5,kAt(c,B_SHOT)*.04)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(t)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:6.5,
};

// ---------------------------------------------------------------- 3 · the reverse angle from behind the goal: past Andreia and in, then the celebration
const tau3=(t:number)=>key(t,mono([[0,-.35],[CUE(2,'past Andreia'),.36],[CUE(2,'and in'),T_G+.08],[CUE(2,'Germany went'),T_G+.9],[SECS(2),T_G+.9+(SECS(2)-CUE(2,'Germany went'))*.9]]),linear);
const E3:V3=[4.2,1.05,-6.4];
function cam3v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:E3,T:[-9,.6,-.4],fov:32})],
  [CUE(2,'past Andreia')-.2,.8,()=>({P:add3(E3,[-.3,-.1,.2]),T:[-2.2,.6,-1.4],fov:25})],
  [CUE(2,'Germany went')-.3,1.3,t=>({P:add3(E3,[.6,1.2,-.3]),T:add3(pxz(prinzPlace(tau3(t)),1.1),[2,0,0]),fov:34})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tG=CUE(2,'and in');
  stadium(s,c,t,[0,2,3],{roar:.3+.7*sm(T_G,T_G+.4,tau),flash:.8*sm(tG-.1,tG+.3,t)});
  ground(s,c,{goal:false});
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:10,crowd:true});
  // from behind, the net is between the camera and the play
  goal3(s,c,netBulge(tau));
  const rp=sm(tG-.1,tG+.35,t)*(1-sm(tG+1.1,tG+1.6,t));
  if(rp>.02){const P:V3=[.2,.35,-2.8],q=pr(c,P);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(50,kAt(c,P)*.6)*easeOutBack(clamp(rp)),{n:10,seed:29,width:Math.max(5,kAt(c,P)*.04),cov:clamp(rp)});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,pxz(prinzPlace(tau3(t)),1.1))??[0,0];return apertureDisc(q[0],q[1],60,12);},
 still:2.2,
};

// ---------------------------------------------------------------- 4 · the lesson: shield with your body → turn → shoot with power
const tau4=(t:number)=>key(t,mono([[0,-1.5],[CUE(3,'Shield'),-1.2],[CUE(3,'body'),-1.02],[CUE(3,'Turn'),-.9],[CUE(3,'Then shoot'),-.55],[CUE(3,'power'),.02],[SECS(3),T_G+.2]]),linear);
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:[-11.2,1.8,9.4],T:[-14.3,.8,2.3],fov:30})],
  [CUE(3,'Turn')-.2,.9,()=>({P:[-11.8,3,8.2],T:[-14.2,.5,2.2],fov:34})],
  [CUE(3,'Then shoot')-.25,1,()=>({P:[-9.8,4.8,7.6],T:[-9.4,.4,-1.8],fov:40})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a ring round a 3D point on the ground */
function ring3(s:Sheet,c:Cam,at:V3,r:number,w:number,ink:string,cov:number,seed=43){
 const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[at[0]+Math.cos(a)*r,at[1],at[2]+Math.sin(a)*r]);if(p)pts.push(p);}
 if(pts.length<28)return;const rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:.8});s.knockout(rr,.9*cov);s.fill(ink,rr,.95*cov);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tSh=CUE(3,'Shield'),tB=CUE(3,'body'),tT=CUE(3,'Turn'),tS=CUE(3,'Then shoot'),tP=CUE(3,'power');
  stadium(s,c,t,[1,2,3],{});
  ground(s,c,{goal:false});goal3(s,c,netBulge(tau));
  // 1 · shield: a ring round the ball on the grass
  const sh=sm(tSh-.15,tSh+.45,t,easeOutBack)*(1-sm(tT+.3,tT+.8,t));
  if(sh>.02){const bb=ballAt(tp);ring3(s,c,[bb[0],.02,bb[2]],.42,Math.max(6,kAt(c,bb)*.03),Y,clamp(sh),41);}
  // 2 · turn: a curved arrow on the grass round Smisek, from facing the passer round to the lay-off
  const tu=sm(tT-.1,tT+.6,t)*(1-sm(tS+.2,tS+.6,t));
  if(tu>.02){const pl=smiPlace(-.9),pts:V3[]=[];const a0=YAW_R,a1=YAW_LAY,d=wrap(a1-a0);for(let i=0;i<=14;i++){const a=a0+d*i/14*clamp(tu),[dx,dz]=rotY(a,.95,0);pts.push([(pl.x??0)+dx,.03,(pl.z??0)+dz]);}arrow3(s,c,pts,Math.max(5,kAt(c,pts[0])*.035),Y,.9*clamp(tu));}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,crowd:true});
  // body: a yellow shield arc on Smisek's back, between the defender and the ball
  const bd=sm(tB-.1,tB+.4,t,easeOutBack)*(1-sm(tT+.1,tT+.5,t));
  if(bd>.02){const pl=smiPlace(tp),yaw=pl.yaw??0,pts:Pt[]=[];for(let i=0;i<=12;i++){const a=(i/12-.5)*1.9,[dx,dz]=rotY(yaw+Math.PI+a,.42,0),q=pr(c,[(pl.x??0)+dx,.95+.25*Math.cos(a*1.4),(pl.z??0)+dz]);if(q)pts.push(q);}
   if(pts.length>6){const rb=ribbon(pts,Math.max(10,kAt(c,pxz(pl))*.11)*clamp(bd),{seed:17,taper:.4,wobble:.8});s.knockout(rb,.9);s.fill(Y,rb,.95);s.stroke(K,rb,2,.8);}}
  // 3 · shoot with power: a red arrow along the strike, and a burst at the boot
  const pw=sm(tS-.1,tS+.5,t)*(1-sm(SECS(3)-.6,SECS(3)-.1,t)*.4);
  if(pw>.02){const pts:V3[]=[];for(let i=0;i<=10;i++){const u=i/10*clamp(pw);pts.push([lerp(B_SHOT[0],G_T[0],u),.35+.1*Math.sin(Math.PI*u),lerp(B_SHOT[2],G_T[2],u)]);}arrow3(s,c,pts,Math.max(13,kAt(c,B_SHOT)*.12),R,.95);}
  const bu=sm(tP-.05,tP+.35,t)*(1-sm(tP+.8,tP+1.3,t));if(bu>0){const q=pr(c,B_SHOT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,B_SHOT)*.7)*easeOutBack(bu),{n:10,seed:61,width:Math.max(6,kAt(c,B_SHOT)*.05)});}
 },
 still:5.2,
};

const film:RisoStory={
 id:'prinz-signature',format:'11v11',title:'Prinz scores in the final',
 theme:'Finishing: shield the ball with your body, turn, then shoot with power — first time',
 ageNote:'Germany 2–0 Brazil, 2007 FIFA Women\'s World Cup final, Hongkou Stadium, Shanghai, 30 September 2007 (52nd minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a first-time strike — a ball flies off with speed lines and a yellow burst. Reduced motion: the still pose. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.4)),fade=age<=0?1:1-clamp((age-.6)/.25),r=rng(seed);
  if(age>0&&age<.4)sparkBurst(s,Y,x,y,80,{n:8,seed,g:1-clamp(age/.4),width:9,cov:fade});
  const bx=x+60*u,by=y-18*u;if(u>.1)speedLines(s,K,bx,by,Math.atan2(-18,60),{n:3,seed,len:70*u,spread:18,width:4,cov:.8*fade});
  footballPanels(s,bx,by,22,{rot:r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
