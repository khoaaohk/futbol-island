/** Iconic-play film · Nuno Mendes, "Signature: the flying left-back overlap" — shown in one real, sourced moment: Portugal 2–2 Spain
 * (Portugal won 5–3 on penalties), UEFA Nations League final, Sunday 8 June 2025, 21:00 CEST, Munich Football Arena (Allianz Arena):
 * PORTUGAL'S SECOND GOAL, 61st minute — Nuno Mendes darts up the left past Lamine Yamal, his cross takes a deflection, loops up and drops
 * behind Marc Cucurella, and Cristiano Ronaldo holds Cucurella off to volley in from close range. 2–2.
 *
 * WHY THIS MOMENT: Mendes's entry in lib/town/iconicPlays.json is a signature (a trait: the flying left-back overlap, template overlap_run,
 * side left; lesson "Run past your winger on the outside to give them an easy pass"), not one goal. His Wikipedia profile describes exactly
 * that player: "offensive capabilities, speed … a left-sided attacking full-back … excellent crossing ability". This assist is the
 * best-documented moment of the trait in his biggest international match — he was named Player of the Match (UEFA) — and three written
 * accounts describe the same run: UEFA "darting past Yamal before his deflected cross found Ronaldo"; the Guardian "When Mendes escaped
 * Lamine Yamal and his cross took a deflection, looping up and dropping behind Marc Cucurella"; BBC Sport "Ronaldo … shrugged off Marc
 * Cucurella to reach Mendes' deflected cross and hook a volley in from close range". No account says who passed to him or that he went
 * round a team-mate, so the OVERLAP itself (the winger on the ball, Mendes sprinting past him on the outside, the pass into his path) is
 * drawn as the signature — marked INFERRED below — and the narration only states the sourced run, cross, deflection and finish; the
 * overlap is taught in the lesson chapter.
 *
 * A riso print of one 3D choreography in pitch metres (X along the pitch, Portugal attack +X toward Spain's goal at X=105; Z across,
 * 0..68, the LEFT of Portugal's attack at high Z; Y up) seen through TV cameras — 1 live, the high main camera on the side of Mendes's
 * touchline (Portugal attack screen-left; his run, the cross, the loop, the volley in real time); 2 a TV slow-motion replay from a low
 * camera by the corner flag ahead of him (the sprint down the outside, Yamal left behind, head up, the cross); 3 a second replay from a
 * raised camera beside Spain's goal (the deflection, the loop dropping behind Cucurella, Ronaldo holding him off, the volley, in); 4 the
 * lesson (the only chapter with teaching marks: the winger on the ball, the sprint past on the outside, the easy pass). No overlays in the
 * footage.
 *
 * SOURCES (fetched 23 Sep 2026 with curl, cached in scratchpad/films/src-cache/):
 *  - Wikipedia, "2025 UEFA Nations League final" (8 June 2025, Munich Football Arena, attendance 65,852, referee Sandro Schärer; "Cristiano
 *    Ronaldo equalised in the 61st minute with a right foot volley finish after a deflected cross from Nuno Mendes from the left fell to him
 *    from close range"; Mendes Player of the Match; kit boxes: Portugal RED shirts (DC0109), DARK GREEN shorts (2B4E48), RED socks; Spain
 *    the 2024 away kit, pale lime-yellow (F1FF91) shirts, shorts and socks; line-ups: Mendes 25 (LB), Ronaldo 7 (c), Cucurella 24 (LB),
 *    Yamal 19 (RF), Unai Simón 23 (GK); Francisco Conceição and João Neves off at 46' for Rúben Neves and Nélson Semedo)
 *    https://en.wikipedia.org/wiki/2025_UEFA_Nations_League_final  [wiki-2025-unl-final.txt]
 *  - UEFA.com match report (Mark Pettit, 8 June 2025): "Nuno Mendes was at the heart of the action once more, darting past Yamal before his
 *    deflected cross found Ronaldo, who held off Marc Cucurella to volley in from close range"; Mendes "well shackled" Yamal all night
 *    https://www.uefa.com/uefanationsleague/news/029a-1df446a2d81d-0bc47d9324a5-1000/  [uefa-por-esp-unl-2025.txt]
 *  - The Guardian (8 June 2025), "Portugal sink Spain in penalty shootout to win Nations League crown": "When Mendes escaped Lamine Yamal
 *    and his cross took a deflection, looping up and dropping behind Marc Cucurella, there he was again to volley in from close range"
 *    https://www.theguardian.com/football/2025/jun/08/portugal-sink-spain-in-penalty-shootout-to-win-nations-league-crown
 *    [guardian-por-esp-unl-2025.txt]
 *  - BBC Sport live report (8 June 2025): "Ronaldo … shrugged off Marc Cucurella to reach Mendes' deflected cross and hook a volley in from
 *    close range"; Yamal "largely marked out of the game by Portugal full-back Mendes"
 *    https://www.bbc.com/sport/football/live/cvgqzyl24j4t  [bbc-live-por-esp-unl-2025.txt]
 *  - Wikipedia, "Nuno Mendes (footballer, born 2002)" (1.80 m; left-sided attacking full-back; speed; crossing)  [wiki-nuno-mendes.txt]
 * CONFIRMED: the match, date, venue, night kick-off, the 61st minute, 2–2, Portugal's win on penalties; Mendes on the left, darting past /
 *  escaping Yamal; his cross from the left; the deflection; the ball looping up and dropping behind Cucurella; Ronaldo holding Cucurella off
 *  and volleying (right foot) from close range; numbers 25 / 7 / 19 / 24 / 23; kits per Wikipedia's kit boxes.
 * INFERRED (illustration, not in the accounts): the OVERLAP build-up — an unnamed Portugal winger on the ball, Mendes sprinting past him on
 *  the outside, the winger's pass into his path (his foot drawn left) and Mendes's two touches; the foot of the cross (drawn LEFT — he is a
 *  left-footer — never narrated); WHO deflected it (an unnamed Spain defender blocking with his right boot, no number); the loop's height
 *  and landing spot; every position, path and timing; which end Portugal attacked in the second half (+X here); Ronaldo's body shape for
 *  the volley and where it went in; Unai Simón's position and dive and his kit (neutral grey); numbers ink colours; hair and skin tones;
 *  crowd colours and the arena as drawn (stylised). The narration names no foot, no passer and no deflecting player.
 *
 * Figures are the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE adapter, drawPlayer(). The camera frames the whole
 * sheet (never sheet.safe) for card windows from 1.45:1 to square. Actions are timed from the chapter cues, so the recorded voice
 * (withTiming) re-times the drawing. Scenes read only their local time t. Every random value is seeded. Heat: small wide-shot figures and all
 * but the heroes print at 'low'; the crowd is four batched plates; ≈ 150–320 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,clamp,lerp,hash,keyPath,easeOut,easeOutBack,easeInOutSine,linear,blob,polyPath,ribbon,type Pt} from '../../paths/riso/motion';
import {dust,sparkBurst,footballPanels} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,blendPose,clampPose,posed,runCycle,dribble,stand,strike,volley,lunge,keeperSet,keeperDive,backpedal,celebrate,keyPoses,STRIKE_CONTACT,
 type Pose,type Place,type AthleteStyle,type InkFill,type Projector} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Narration and cue words. Cue `at` and chapter `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice
 * exists. Scenes read cues by index (Q(i)[k]) — keep the counts [5,5,4,4]. Every cue starts with a plain word (no contraction, no accent,
 * no hyphen). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The final',text:'Munich, 2025: the Nations League final, Portugal against Spain. Nuno Mendes flies up the left wing, right past Lamine Yamal. He crosses… and Cristiano Ronaldo volleys it in!',tail:2.2,
  cues:['Munich','Nuno Mendes flies','right past','He crosses','Cristiano Ronaldo volleys']},
 {label:'The replay',text:'Watch again, slowly. Nuno sprints down the outside, and Yamal cannot keep up. He looks up and whips in a cross.',tail:1.9,
  cues:['Watch again','sprints down','Yamal cannot','looks up','whips in']},
 {label:'The finish',text:'It flicks off a defender and drops behind Cucurella. Ronaldo holds him off and volleys it in. Two–two! Portugal won the final on penalties!',tail:1.6,
  cues:['flicks off','drops behind','Ronaldo holds','volleys it in']},
 {label:'The lesson',text:'Remember Nuno: sprint past your winger on the outside, and they have an easy pass!',tail:2.8,
  cues:['Remember','sprint past your winger','on the outside','easy pass']},
];
/** provisional word onsets: .2 s + .021 s a letter per word, pauses after , . ! ? … */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.021*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/…$/.test(w))t+=.45;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('nuno-mendes: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py nuno-mendes-signature, which writes timing.json next to script.json. Then replace
 * this null with `import timingJson from '../../../public/plays/narration/nuno-mendes-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/nuno-mendes-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** Cue onsets of chapter i (seconds). */
const Q=(i:number)=>CHAPTERS[i].cues.map(c=>c.at);
const SECS=(i:number)=>CHAPTERS[i].seconds;

const K='navy',Y='yellow',R='red',G='green';
/** Piecewise-linear map from chapter time to play time (anchors kept increasing). */
function warp(t:number,A:[number,number][]){const a:[number,number][]=[];for(const p of A)if(!a.length||(p[0]>a[a.length-1][0]+.05&&p[1]>=a[a.length-1][1]))a.push(p);
 if(t<=a[0][0])return a[0][1];for(let i=1;i<a.length;i++)if(t<=a[i][0])return a[i-1][1]+(a[i][1]-a[i-1][1])*(t-a[i-1][0])/(a[i][0]-a[i-1][0]);const n=a.length-1;return a[n][1]+(t-a[n][0])*(n?(a[n][1]-a[n-1][1])/(a[n][0]-a[n-1][0]):1);}
/** Consistent winding so overlapping parts of one shape union cleanly under the nonzero rule. */
function orient(p:Pt[]):Pt[]{let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a<0?p.slice().reverse():p;}
const shape=(p:Pt[])=>polyPath(orient(p),true);

// ---------------------------------------------------------------- camera: the whole frame
/** Screen (x,y) → the centre of the canvas; ~1500 × 1030 units visible (the card window is 1.45:1 to square). Full sheet, never the safe box. */
function frame(s:Sheet,x=0,y=0,z=1){const base=z*Math.min(s.W/1500,s.H/1030),a=Math.round(s.arrival*1e6)/1e6,k=base*a,q=(v:number)=>Math.round(v*1e4)/1e4;s.camera(q(x-(s.W/2-s.cx)/k),q(y-(s.H/2-s.cy)/k),base/s.fit,0);}
/** half the visible extents (sheet units) with margin for the passage preview */
const VIEW={hx:1500/(2*.68)+120,hy:1030/(2*.68)+120};

// ---------------------------------------------------------------- 3D: pitch metres → screen through a TV camera
type V3=[number,number,number];
type Cam={pos:V3;yaw:number;tilt:number;F:number};
function camAt(pos:V3,target:V3,F:number):Cam{const dx=target[0]-pos[0],dz=target[2]-pos[2];return{pos,yaw:Math.atan2(dx,dz),tilt:Math.atan2(pos[1]-target[1],Math.hypot(dx,dz)),F};}
/** camera space: [right, up, depth] */
function toCam(v:V3,c:Cam):V3{const dx=v[0]-c.pos[0],dy=v[1]-c.pos[1],dz=v[2]-c.pos[2],cy=Math.cos(c.yaw),sy=Math.sin(c.yaw),x1=dx*cy-dz*sy,z1=dx*sy+dz*cy,ct=Math.cos(c.tilt),st=Math.sin(c.tilt);return[x1,dy*ct+z1*st,z1*ct-dy*st];}
/** screen x, y and scale (units per metre); scale ≤ 0 means behind the camera */
function P3(v:V3,c:Cam):[number,number,number]{const q=toCam(v,c);if(q[2]<.3)return[0,0,0];const k=c.F/q[2];return[q[0]*k,-q[1]*k,k];}
const NEAR=.6;
function projPoly(pts:V3[],c:Cam):Pt[]{const cs=pts.map(p=>toCam(p,c)),out:V3[]=[];
 for(let i=0;i<cs.length;i++){const a=cs[i],b=cs[(i+1)%cs.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const u=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,NEAR]);}}
 return out.map(q=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]]);}
function addPoly(p:Path2D,pts:V3[],c:Cam){const q=projPoly(pts,c);if(q.length>2)p.addPath(shape(q));}
function groundLine(p:Path2D,a:[number,number],b:[number,number],c:Cam,w=.13){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;addPoly(p,[[a[0]+nx,.01,a[1]+nz],[b[0]+nx,.01,b[1]+nz],[b[0]-nx,.01,b[1]-nz],[a[0]-nx,.01,a[1]-nz]],c);}
function groundArc(p:Path2D,cx:number,cz:number,r:number,a0:number,a1:number,c:Cam,n=16){for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;groundLine(p,[cx+Math.cos(u0)*r,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,cz+Math.sin(u1)*r],c,Math.max(.13,r*.02));}}
/** a 3D bar a → b as a projected quad of width w metres (at least minW units), clipped to the near plane */
function bar3(p:Path2D,a:V3,b:V3,w:number,c:Cam,minW=1.2){let qa=toCam(a,c),qb=toCam(b,c);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(u:V3,v:V3):V3=>{const k=(NEAR-u[2])/(v[2]-u[2]);return[u[0]+(v[0]-u[0])*k,u[1]+(v[1]-u[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A:Pt=[c.F*qa[0]/qa[2],-c.F*qa[1]/qa[2]],Bp:Pt=[c.F*qb[0]/qb[2],-c.F*qb[1]/qb[2]],wa=Math.max(minW,c.F*w/qa[2]/2),wb=Math.max(minW,c.F*w/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 p.moveTo(A[0]+nx*wa,A[1]+ny*wa);p.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);p.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);p.lineTo(A[0]-nx*wa,A[1]-ny*wa);p.closePath();}
const onScreen=(q:[number,number,number])=>q[2]>0&&Math.abs(q[0])<2600&&Math.abs(q[1])<2200;
/** a ground point (pitch x,z) on screen */
const G2=(x:number,z:number,c:Cam,y=0):Pt=>{const q=P3([x,y,z],c);return[q[0],q[1]];};
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];

// ---------------------------------------------------------------- the Munich arena at night: a steep closed bowl, three tiers, the roof ring
/** stand planes (a along, b up the rake 0..1): 0 the stand on Mendes's touchline (+Z, the main-camera side), 1 behind Spain's goal (+X),
 * 2 the far side (−Z), 3 behind Portugal's goal (−X). Closed corners join them. Steep and tall (three stacked tiers), close to the pitch. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-10,115,a),1.2+30*b,74+26*b],
 (a,b)=>[113+24*b,1.2+29*b,lerp(76,-8,a)],
 (a,b)=>[lerp(115,-10,a),1.2+30*b,-6-26*b],
 (a,b)=>[-8-24*b,1.2+29*b,lerp(-8,76,a)],
];
/** corner joins: [stand, its end a, next stand, its end a] */
const CORNERS:[number,number,number,number][]=[[0,1,1,0],[1,1,2,0],[2,1,3,0],[3,1,0,0]];
const STAND_COLS=[92,64,92,64],STAND_ROWS=13,TIER=[.34,.67];
/** crowd colours (inferred): Portugal red and green round most of the ground, Spain's red and yellow in one end */
const spainAt=(si:number,a:number)=>si===3?.55:si===2&&a>.75?.3:.08;
function stadium(s:Sheet,c:Cam,which:number[]){
 // a June night: a navy sky, a floodlit haze low down
 s.field(K,.55,.5);
 const hz=P3([c.pos[0]+Math.sin(c.yaw)*1e4,c.pos[1],c.pos[2]+Math.cos(c.yaw)*1e4],c);
 if(hz[2]>0)[.06,.1,.14].forEach((d,i)=>s.tone(Y,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,[S(0,0),S(1,0),S(1,1),S(0,1)],c);for(const b of TIER)bar3(tier,S(0,b),S(1,b),1.1,c);
  addPoly(roof,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.74),[0,11,0]),add3(S(0,.74),[0,11,0])],c);
  bar3(edge,add3(S(0,.74),[0,10.8,0]),add3(S(1,.74),[0,10.8,0]),.5,c);}
 for(const[i,ai,j,aj]of CORNERS){if(!which.includes(i)||!which.includes(j))continue;const A=STANDS[i],Bs=STANDS[j];
  addPoly(planes,[A(ai,0),Bs(aj,0),Bs(aj,1),A(ai,1)],c);
  addPoly(roof,[add3(A(ai,1),[0,1.5,0]),add3(Bs(aj,1),[0,1.5,0]),add3(Bs(aj,.74),[0,11,0]),add3(A(ai,.74),[0,11,0])],c);}
 s.knockout(planes);s.tone(K,planes,.42);s.tone(G,planes,.16);s.knockout(tier,.8);
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(TIER.some(w=>Math.abs(b-w)<.035))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,q=toCam(S(a,b),c);if(q[2]<NEAR)continue;
   const p:Pt=[c.F*q[0]/q[2],-c.F*q[1]/q[2]];if(Math.abs(p[0])>VIEW.hx||Math.abs(p[1])>VIEW.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18);
   const hb=hash(i*7+j*53+si*3,21),ink=hb<spainAt(si,a)?(h<.6?1:3):h<.55?1:h<.8?2:0;inks[ink].rect(p[0]-z/2,p[1]-z*.7,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(G,inks[2],.95);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.tone(K,roof,.35);s.knockout(edge,.8);
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<8;k++){const u=(k+.5)/8,a=add3(S(u-.022,.74),[0,10,0]),b=add3(S(u+.022,.74),[0,10,0]);if(toCam(a,c)[2]<NEAR+2)continue;bar3(lamp,a,b,1,c);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 ground(s,c);
}
/** the grass (mown stripes), the advertising boards, the painted lines and the corner flags */
function ground(s:Sheet,c:Cam){
 const grass=new Path2D();addPoly(grass,[[-8,0,-6],[113,0,-6],[113,0,74],[-8,0,74]],c);s.knockout(grass);s.fill(G,grass,.88);s.tone(Y,grass,.3);s.tone(K,grass,.12);
 const stripes=new Path2D();for(let i=0;i<20;i+=2)addPoly(stripes,[[i*5.25,0,0],[(i+1)*5.25,0,0],[(i+1)*5.25,0,68],[i*5.25,0,68]],c);s.tone(K,stripes,.13);
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])],c);
 board([-4.5,0,-3.5],[-4.5,0,71.5]);board([109.5,0,-3.5],[109.5,0,71.5]);board([-4.5,0,71.5],[109.5,0,71.5]);board([-4.5,0,-3.5],[109.5,0,-3.5]);
 for(let k=0;k<18;k++){const x=-2+k*6.2;for(const z of[-3.45,71.45])addPoly(pn,[[x,.25,z],[x+3.3,.25,z],[x+3.3,.68,z],[x,.68,z]],c);}
 for(let k=0;k<11;k++){const z=-1+k*6.6;for(const x of[-4.45,109.45])addPoly(pn,[[x,.25,z],[x,.25,z+3.4],[x,.68,z+3.4],[x,.68,z]],c);}
 s.knockout(bd);s.fill(K,bd,.8);s.fill(G,bd,.4);s.knockout(pn,.85);
 const ln=new Path2D();
 groundLine(ln,[0,0],[105,0],c);groundLine(ln,[0,68],[105,68],c);groundLine(ln,[105,0],[105,68],c);groundLine(ln,[0,0],[0,68],c);groundLine(ln,[52.5,0],[52.5,68],c);
 groundArc(ln,52.5,34,9.15,0,TAU,c,24);
 for(const[gx,dir]of[[105,-1],[0,1]]as[number,number][]){groundLine(ln,[gx,13.84],[gx+dir*16.5,13.84],c);groundLine(ln,[gx+dir*16.5,13.84],[gx+dir*16.5,54.16],c);groundLine(ln,[gx+dir*16.5,54.16],[gx,54.16],c);
  groundLine(ln,[gx,24.84],[gx+dir*5.5,24.84],c);groundLine(ln,[gx+dir*5.5,24.84],[gx+dir*5.5,43.16],c);groundLine(ln,[gx+dir*5.5,43.16],[gx,43.16],c);
  const a0=dir>0?-.93:Math.PI-.93;groundArc(ln,gx+dir*11,34,9.15,a0,a0+1.86,c,10);{const d:V3[]=[];for(let i=0;i<10;i++){const a=i/10*TAU;d.push([gx+dir*11+Math.cos(a)*.14,.01,34+Math.sin(a)*.14]);}addPoly(ln,d,c);}}
 s.knockout(ln,.92);
 for(const[x,z]of[[0,0],[0,68],[105,0],[105,68]]as[number,number][]){const a=P3([x,0,z],c),b=P3([x,1.5,z],c);if(a[2]<=0||b[2]<=0||!onScreen(a))continue;const f=P3([x,1.42,z+(z?-.5:.5)],c),g=P3([x,1.15,z],c);
  s.fill(K,ribbon([[a[0],a[1]],[b[0],b[1]]],Math.max(3,.05*a[2]),{seed:3,taper:0,wobble:.4}));const fl=shape([[b[0],b[1]],[f[0],f[1]],[g[0],g[1]]]);s.knockout(fl);s.fill(Y,fl);}
}
/** A goal at line gx whose net runs out by dir (Spain's: gx 105, dir +1): white posts and bar, a net (paper haze + navy mesh). */
function goal(s:Sheet,c:Cam,gx:number,dir:number,bulge=0){
 const z0=30.34,z1=37.66,h=2.44,bx=gx+dir*(2+bulge),bh=2.0,net=new Path2D();
 addPoly(net,[[gx,0,z0],[bx,0,z0],[bx,bh,z0],[gx,h,z0]],c);addPoly(net,[[gx,0,z1],[bx,0,z1],[bx,bh,z1],[gx,h,z1]],c);
 addPoly(net,[[bx,0,z0],[bx,0,z1],[bx,bh,z1],[bx,bh,z0]],c);addPoly(net,[[gx,h,z0],[gx,h,z1],[bx,bh,z1],[bx,bh,z0]],c);
 s.knockout(net,.32);
 const k0=P3([gx,1,34],c)[2],sp=Math.max(.36,34/Math.max(1,k0));
 if(k0>8){const mesh=new Path2D(),seg=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);if(p[2]<=0||q[2]<=0)return;mesh.moveTo(p[0],p[1]);mesh.lineTo(q[0],q[1]);};
  for(let z=z0;z<=z1+.01;z+=sp){seg([bx,0,z],[bx,bh,z]);seg([gx,h,z],[bx,bh,z]);}
  for(let y=0;y<=bh+.01;y+=sp){seg([bx,y,z0],[bx,y,z1]);for(const z of[z0,z1])seg([gx,y*h/bh,z],[bx,y,z]);}
  for(let x=0;x<=2.01;x+=sp)for(const z of[z0,z1])seg([gx+dir*x,0,z],[gx+dir*x,lerp(h,bh,x/2),z]);
  s.stroke(K,mesh,Math.max(1.5,.012*k0),.45);}
 const post=(a:V3,b:V3)=>{const p=P3(a,c),q=P3(b,c);return ribbon([[p[0],p[1]],[q[0],q[1]]],Math.max(4,.12*(p[2]+q[2])/2),{seed:9,taper:0,wobble:.4,pressure:.1});};
 const fr=new Path2D();fr.addPath(post([gx,0,z0],[gx,h,z0]));fr.addPath(post([gx,0,z1],[gx,h,z1]));fr.addPath(post([gx,h,z0-.06],[gx,h,z1+.06]));
 s.knockout(fr);s.stroke(K,fr,Math.max(2.5,.02*k0),.95);
}

// ---------------------------------------------------------------- figures: the shared athlete library, through ONE adapter
/** athlete.ts is right-handed (y up); this film's pitch (X along, Z across, Y up) is left-handed, so the projector negates z both ways —
 * that keeps every player's RIGHT boot on his right (Mendes's crossing LEFT boot on his left). */
function proj(c:Cam):Projector{const my=(p:V3):V3=>[p[0],p[1],-p[2]];
 return{eye:[c.pos[0],c.pos[1],-c.pos[2]],project(p){const q=toCam(my(p),c),d=Math.max(.05,q[2]);return[c.F*q[0]/d,-c.F*q[1]/d,d];},scale(p){return c.F/Math.max(.05,toCam(my(p),c)[2]);}};}
const toMy=(p:V3):V3=>[p[0],p[1],-p[2]];
/** a place on the pitch (my metres) facing heading h (my x,z) */
const placeOf=(x:number,z:number,h:[number,number]):Place=>({x,z:-z,yaw:Math.atan2(h[1],h[0])});
/** THE adapter: every body in the film is printed here. */
function drawPlayer(s:Sheet,pose:Pose,c:Cam,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}){
 const pc=proj(c);
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,pc,style,place,{prevPlace:o.prevPlace,ink:[K,.35]});
 return drawAthlete(s,pose,pc,style,place,{prev:o.prev,prevPlace:o.prevPlace});
}
// skin: one flat screen + at most one light screen (athlete.ts guidance)
const LIGHT:InkFill[]=[[Y,.32],[R,.2]],TAN:InkFill[]=[[Y,.42],[R,.3]],MID:InkFill[]=[[Y,.45],[R,.36],[K,.1]],DARK:InkFill[]=[[R,.45],[Y,.5],[K,.24]];
const FIG=1.1;// figures 10 % over life size so they read in a small card window
/** Portugal (Wikipedia kit box, home): red shirts, dark green shorts, red socks; green trim; paper numbers (inferred). */
const por=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],trim:G,shorts:[G,.95],socks:[R,.95],boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',scale:FIG,...o});
/** Spain (Wikipedia kit box: the 2024 away kit): pale lime-yellow shirts, shorts and socks (a yellow screen); green trim, navy numbers (inferred). */
const esp=(skin:InkFill[],o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.72],trim:G,shorts:[Y,.72],socks:[Y,.72],boots:K,skin,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,scale:FIG,...o});
/** Nuno Mendes: number 25, 1.80 m */
const MENDES:AthleteStyle=por(DARK,{number:25,seed:25,build:{height:1.8,bulk:.96}});
/** Cristiano Ronaldo: number 7, captain */
const RONALDO:AthleteStyle=por(TAN,{number:7,seed:7,build:{height:1.87,bulk:1.04}});
/** the Portugal winger on the ball (unnamed, no number: INFERRED) */
const WINGER:AthleteStyle=por(LIGHT,{seed:20,build:{height:1.73,bulk:.94}});
/** Lamine Yamal: number 19, slim */
const YAMAL:AthleteStyle=esp(DARK,{number:19,seed:19,hair:[K,.92],build:{height:1.8,bulk:.86,thighs:.94}});
/** Marc Cucurella: number 24, his long curly hair */
const CUCU:AthleteStyle=esp(LIGHT,{number:24,seed:24,hairStyle:'curly',hair:[K,.8],build:{height:1.72,bulk:.95}});
/** the Spain defender the cross flicks off (unnamed, no number: INFERRED) */
const BLOCKER:AthleteStyle=esp(TAN,{seed:14,build:{height:1.84,bulk:1}});
/** Unai Simón: Spain's keeper, number 23 (kit inferred: neutral grey) */
const KEEPER:AthleteStyle={shirt:[K,.4],shorts:[K,.6],socks:[K,.4],boots:K,skin:LIGHT,hair:[K,.8],hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',gloves:'paper',number:23,numberInk:'paper',scale:FIG,seed:23,build:{height:1.9,bulk:1}};
type St={pose:Pose;place:Place};

// ---------------------------------------------------------------- the play (pitch metres; play seconds T, T=0 = Mendes's cross)
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
const add2=(a:[number,number],b:[number,number],k=1):[number,number]=>[a[0]+b[0]*k,a[1]+b[1]*k];
const midSole=(a:V3,b:V3):V3=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
type Track={id:string;style:AthleteStyle;keys:number[][]};
const trackAt=(k:number[][],T:number):[number,number]=>{const v=keyPath(T,k,linear);return[v[0],v[1]];};
function velAt(k:number[][],T:number):[number,number]{const a=trackAt(k,T-.06),b=trackAt(k,T+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];}
/** Stride phase from the distance run (sampled; pure). */
function strideAt(k:number[][],T:number){let d=0,p=trackAt(k,-9.2);for(let t=-9;t<T+.2;t+=.2){const q=trackAt(k,Math.min(t,T));d+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return d/.9;}
/** where a solved boot would put the ball: a place so that `foot`'s mid-sole lands on target (x,z) for pose at heading h */
function placeFor(pose:Pose,build:AthleteStyle['build'],h:[number,number],target:[number,number],foot:'l'|'r',ahead=.12):[number,number]{
 const sk=solve(pose,build,placeOf(0,0,h),FIG),f=toMy(foot==='l'?midSole(sk.lToe,sk.lHeel):midSole(sk.rToe,sk.rHeel));return[target[0]-f[0]-h[0]*ahead,target[1]-f[2]-h[1]*ahead];}
const footY=(pose:Pose,build:AthleteStyle['build'],h:[number,number],foot:'l'|'r')=>{const sk=solve(pose,build,placeOf(0,0,h),FIG),f=foot==='l'?midSole(sk.lToe,sk.lHeel):midSole(sk.rToe,sk.rHeel);return f[1];};

/** Mendes's cross: LEFT boot (inferred), from the left touchline toward the box; it hits the blocker's boot 2.8 m out */
const CROSS_DUR=.8,S_START=-STRIKE_CONTACT*CROSS_DUR;
const LB:[number,number]=[88.6,64.4];
const C_D=nrm2(97.5-LB[0],45-LB[1]);
const S_H=nrm2(C_D[0]+.55,C_D[1]);
const S_AT=placeFor(strike(STRIKE_CONTACT,{foot:'l',power:.8}),MENDES.build,S_H,LB,'l');
/** his run: from deep, up the outside past the winger and away from Yamal, two touches, the cross */
const MK=[[-9,50,62.6],[-7.4,55,63],[-6,59.5,63.5],[-4.6,65,64.4],[-3.2,74.2,65.3],[-2,82,65.7],[-1.1,85.7,65.4],[S_START,...S_AT]];
/** dribble phase (one cycle ≈ 3.4 m) */
const phaseAt=(T:number)=>strideAt(MK,T)*.9/3.4;
const T_POS0=-2.1,T_POS1=S_START-.3;

/** the blocker: his right boot meets the cross at DF (lunge full reach .6) */
const DF_TARGET:[number,number]=add2(LB,C_D,2.8);
const BL_H=nrm2(LB[0]-DF_TARGET[0]-.9,LB[1]-DF_TARGET[1]+.3);
const LU_DUR=.75,T_DF=.17,LU_START=T_DF-.6*LU_DUR;
const BL_AT=placeFor(lunge(.6,{side:'r'}),BLOCKER.build,BL_H,DF_TARGET,'r',.05);
const DF:V3=[DF_TARGET[0],Math.max(.2,footY(lunge(.6,{side:'r'}),BLOCKER.build,BL_H,'r')+.12),DF_TARGET[1]];

/** Ronaldo's volley: right boot (confirmed), just inside the six-yard box, the ball dropping from his left (the crosser's side) */
const VOL_DUR=.8,VOL_C=.5,T_V=T_DF+1.72,V_START=T_V-VOL_C*VOL_DUR;
const VP_TARGET:[number,number]=[99.4,33.3];
const R_H=nrm2(.62,.78);
const R_AT=placeFor(volley(VOL_C,{foot:'r',height:.5}),RONALDO.build,R_H,VP_TARGET,'r',.1);
const VP:V3=[VP_TARGET[0],Math.max(.3,footY(volley(VOL_C,{foot:'r',height:.5}),RONALDO.build,R_H,'r')+.11),VP_TARGET[1]];
const LOOP_H=4.8;
const GL:V3=[105,.95,32.4],NB:V3=[106.7,.6,32.2];
const T_GOAL=T_V+.3;
/** Simón: at his near post for the cross, beaten by the volley to his left */
const GK_AT:[number,number]=[103.7,36.9];

/** the winger's pass into Mendes's path: LEFT boot along the grass (inferred) */
const FEED_DUR=.8,FEED_TRAVEL=.85;
const FEED_BALL:[number,number]=[79.9,60.4];

const TRACKS:Track[]=[
 {id:'mendes',style:MENDES,keys:MK},
 {id:'winger',style:WINGER,keys:[[-9,75.5,60],[-7.4,77,60.2],[-5.6,78.4,60.1],[-4.4,79.1,59.9],[-2,81.5,58],[0,86,52.5],[2,91,47]]},
 {id:'yamal',style:YAMAL,keys:[[-9,50,61.6],[-7.4,55.2,62],[-6,59.6,62.4],[-4.6,64.6,63],[-3.2,71,63.6],[-2,76.2,63.9],[-1,80.2,63.5],[0,83.3,62.8],[1.5,86.2,60.8],[4,88,58]]},
 {id:'blocker',style:BLOCKER,keys:[[-9,82,60],[-7.4,82.6,60.2],[-4.4,83.4,60.3],[-2.8,84,60.6],[-1.4,87.2,61.6],[LU_START,...BL_AT],[3,...BL_AT]]},
 {id:'ronaldo',style:RONALDO,keys:[[-9,85,40.5],[-7.4,86.5,40.2],[-4.5,90,40.4],[-2,94,39.2],[0,96.7,36.6],[1.1,98.3,34.6],[V_START,...R_AT],[T_V+3,...R_AT]]},
 {id:'cucurella',style:CUCU,keys:[[-9,89,34.5],[-7.4,90,34.8],[-4.5,92.5,36.4],[-2,95,37.6],[0,97.4,37.6],[1.1,98.7,36.2],[T_V,99.6,35.3],[T_V+3,99.8,35]]},
 // everyone else (positions illustrative, no numbers printed)
 {id:'p-mid',style:por(TAN,{seed:8}),keys:[[-9,70,46],[-7.4,72,46],[-4,78,45],[0,86,44.5],[T_V,89,43.5],[5,90,43]]},
 {id:'p-mid2',style:por(LIGHT,{seed:23}),keys:[[-9,62,52],[-7.4,64,52.5],[-4,68,53],[0,73,54],[5,76,54]]},
 {id:'e-cb1',style:esp(LIGHT,{seed:3}),keys:[[-9,90,45],[-7.4,91,45],[-4,93,45.2],[0,96,44.2],[T_V,98.3,41.5],[5,99,41]]},
 {id:'e-cb2',style:esp(TAN,{seed:12}),keys:[[-9,91,28],[-7.4,92,28.2],[-4,94,28.6],[0,96.6,28.4],[T_V,98.4,28.8],[5,99,29]]},
 {id:'e-mid',style:esp(LIGHT,{seed:18}),keys:[[-9,76,52],[-7.4,77.5,52],[-4,81,52.5],[0,86,50],[T_V,90,47],[5,91,46]]},
 {id:'e-mid2',style:esp(MID,{seed:8}),keys:[[-9,70,40],[-7.4,72,40.5],[-4,76,41],[0,82,41.5],[5,86,41]]},
];
const TR=(id:string)=>TRACKS.find(t=>t.id===id)!;
const yawTo=(a:[number,number],b:[number,number],u:number):[number,number]=>{const aa=Math.atan2(a[1],a[0]);let bb=Math.atan2(b[1],b[0]);while(bb-aa>Math.PI)bb-=TAU;while(bb-aa<-Math.PI)bb+=TAU;const y=lerp(aa,bb,clamp(u));return[Math.cos(y),Math.sin(y)];};
/** running / jogging / standing along a track; faces its run, or the ball when (nearly) still, or a fixed heading */
function runState(k:number[][],T:number,face?:[number,number]):St{
 const p=trackAt(k,T),v=velAt(k,T),sp=Math.hypot(v[0],v[1]);let h:[number,number];
 if(face)h=face;else if(sp>.8)h=[v[0]/sp,v[1]/sp];else{const b=ballAt(T);h=nrm2(b[0]-p[0],b[2]-p[1]);}
 const run=runCycle(strideAt(k,T)*.9/4.3,{speed:clamp((sp-2)/6)});
 return{pose:blendPose(stand(),run,clamp((sp-.5)/1.8)),place:placeOf(p[0],p[1],h)};
}
/** head (and a little shoulder) turned toward a point. Right-handed yaw: + turns left. */
function lookAt(st:St,b:[number,number],w=1):Pose{const x=st.place.x!,z=-st.place.z!,want=Math.atan2(b[1]-z,b[0]-x),rel=Math.atan2(Math.sin(want-st.place.yaw!),Math.cos(want-st.place.yaw!));
 const p={...st.pose};p.neckY+=clamp(rel,-1.4,1.4)*.75*w;p.twist+=clamp(rel,-1.4,1.4)*.25*w;p.neckP+=.25*w;return clampPose(p);}
function lookAtBall(st:St,T:number,w=1):Pose{const b=ballAt(T);return lookAt(st,[b[0],b[2]],w);}

/** Mendes: the sprint from deep (eyes on the winger and the ball), the pass into his path, two touches on his left boot, head up, the cross */
function mendesState(T:number):St{
 if(T<S_START){
  const v=velAt(MK,T),sp=Math.hypot(v[0],v[1]),at=trackAt(MK,T);
  const h=yawTo(sp>.8?[v[0]/sp,v[1]/sp]:[1,0],S_H,sm(S_START-.5,S_START,T));
  const st=runState(MK,T,h),w=sm(T_POS0-.3,T_POS0,T)*(1-sm(T_POS1+.05,S_START,T))*.7;
  let pose=blendPose(st.pose,dribble(phaseAt(T),{foot:'l',speed:.85}),w);
  // before the ball: he watches the winger on the ball; once he has it: head up, then a look into the box
  const wg=trackAt(TR('winger').keys,T),pre=1-sm(T_POS0-.6,T_POS0-.1,T);
  if(pre>0)pose=lookAt({pose,place:placeOf(at[0],at[1],h)},wg,.8*pre);
  const box=sm(-1.25,-.85,T)*(1-sm(-.6,-.42,T));
  if(box>0)pose=lookAt({pose,place:placeOf(at[0],at[1],h)},[97,40],.9*box);
  if(box>0)pose={...pose,neckP:pose.neckP-.35*box};
  return{pose:clampPose(pose),place:placeOf(at[0],at[1],h)};}
 const u=clamp((T-S_START)/CROSS_DUR),sp=placeOf(S_AT[0],S_AT[1],S_H);
 if(u<1)return{pose:strike(u,{foot:'l',power:.8}),place:sp};
 const pose=keyPoses(clamp((T-S_START-CROSS_DUR)/.7),[[0,strike(1,{foot:'l',power:.8})],[1,stand()]]);
 return{pose:lookAtBall({pose,place:sp},T,.7),place:sp};
}
/** the touches: every crossing of a (left-boot) touch phase while he has the ball; the ball is at that boot at that instant */
type Touch={T:number;at:V3};
let TOUCHES:Touch[]|null=null;
function touches():Touch[]{
 if(TOUCHES)return TOUCHES;const out:Touch[]=[];let prev=phaseAt(T_POS0);
 for(let T=T_POS0+1/240;T<=T_POS1;T+=1/240){const P=phaseAt(T),c=Math.floor(P+.28)-.03;
  if(prev<c&&P>=c){const st=mendesState(T),sk=solve(st.pose,MENDES.build,st.place,FIG),m=toMy(midSole(sk.lToe,sk.lHeel)),hd:[number,number]=[Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)];
   out.push({T,at:[m[0]+hd[0]*.12,.11,m[2]+hd[1]*.12]});}
  prev=P;}
 TOUCHES=out;return out;}
/** the winger's pass: contact FEED_TRAVEL s before Mendes's first touch */
const T_FEED=()=>touches()[0].T-FEED_TRAVEL;
function feedHeading():[number,number]{const t0=touches()[0].at;return nrm2(t0[0]-FEED_BALL[0],t0[2]-FEED_BALL[1]);}
function wingerState(T:number):St{
 const FS=T_FEED()-STRIKE_CONTACT*FEED_DUR,H=feedHeading(),AT=placeFor(strike(STRIKE_CONTACT,{foot:'l',power:.55}),WINGER.build,H,FEED_BALL,'l');
 if(T<FS){const st=runState(TR('winger').keys,T,[1,.05]);const pose=blendPose(st.pose,dribble(strideAt(TR('winger').keys,T)*.9/3.4,{foot:'l',speed:.35}),.55);
  const k=sm(FS-.5,FS,T);return{pose:lookAt({pose,place:st.place},trackAt(MK,T),.55),place:placeOf(lerp(st.place.x!,AT[0],k),lerp(-st.place.z!,AT[1],k),yawTo([1,.05],H,k))};}
 const u=clamp((T-FS)/FEED_DUR),place=placeOf(AT[0],AT[1],H);
 if(u<1)return{pose:strike(u,{foot:'l',power:.55}),place};
 const pose=keyPoses(clamp((T-FS-FEED_DUR)/.6),[[0,strike(1,{foot:'l',power:.55})],[1,stand()]]);
 if(T<FS+FEED_DUR+.6)return{pose:lookAtBall({pose,place},T,.7),place};
 const r=runState(TR('winger').keys,T),g=sm(FS+FEED_DUR+.6,FS+FEED_DUR+1.8,T);
 return{pose:blendPose(pose,r.pose,sm(FS+FEED_DUR+.6,FS+FEED_DUR+1.1,T)),place:placeOf(lerp(AT[0],r.place.x!,g),lerp(AT[1],-r.place.z!,g),[Math.cos(r.place.yaw!),Math.sin(r.place.yaw!)])};
}

/** The ball at play time T: at the winger's feet, his pass into Mendes's path, Mendes's left-boot touches, the cross (left boot, inferred),
 * the flick off the blocker's boot, the loop dropping behind Cucurella, Ronaldo's right-foot volley, in. */
function ballAt(T:number):V3{
 const tc=touches(),tf=T_FEED(),FS=tf-STRIKE_CONTACT*FEED_DUR,fb:V3=[FEED_BALL[0],.11,FEED_BALL[1]];
 if(T<FS){const st=runState(TR('winger').keys,T,[1,.05]),h:[number,number]=[Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],k=.55+.3*Math.max(0,Math.sin(T*TAU/.8));return[st.place.x!+h[0]*k+.15,.11,-st.place.z!+h[1]*k+.2];}
 if(T<tf){const st=runState(TR('winger').keys,FS,[1,.05]),h:[number,number]=[Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],a:V3=[st.place.x!+h[0]*.55+.15,.11,-st.place.z!+h[1]*.55+.2];return lerp3(a,fb,sm(FS,tf,T,easeInOutSine));}
 if(T<tc[0].T){const u=clamp((T-tf)/(tc[0].T-tf));return lerp3(fb,tc[0].at,u*(1.12-.12*u));}
 for(let i=0;i+1<tc.length;i++)if(T<tc[i+1].T)return lerp3(tc[i].at,tc[i+1].at,sm(tc[i].T,tc[i+1].T,T,easeOut));
 const lb:V3=[LB[0],.11,LB[1]];
 if(T<0){const l=tc[tc.length-1];return lerp3(l.at,lb,sm(l.T,-.06,T,easeOut));}
 if(T<T_DF)return lerp3(lb,DF,clamp(T/T_DF));
 if(T<T_V){// the deflection: it loops up high and drops behind Cucurella
  const u=clamp((T-T_DF)/(T_V-T_DF));return[lerp(DF[0],VP[0],u),lerp(DF[1],VP[1],u)+4*LOOP_H*u*(1-u),lerp(DF[2],VP[2],u)];}
 if(T<T_GOAL)return lerp3(VP,GL,clamp((T-T_V)/(T_GOAL-T_V)));
 if(T<T_GOAL+.14)return lerp3(GL,NB,clamp((T-T_GOAL)/.14));
 const u=sm(T_GOAL+.14,T_GOAL+.6,T,easeOut);return[NB[0]-.3*u,lerp(NB[1],.11,u),NB[2]];
}

// ---------------------------------------------------------------- the players at play time T
function yamalState(T:number):St{
 const k=TR('yamal').keys,st=runState(k,T);
 // after the cross he pulls up, turned to watch it
 const stop=sm(.1,.8,T);const pose=stop>0?blendPose(st.pose,stand(),stop*.6):st.pose;
 return{pose:lookAt({pose,place:st.place},T<0?trackAt(MK,T):[ballAt(T)[0],ballAt(T)[2]],.6),place:st.place};
}
function blockerState(T:number):St{
 const k=TR('blocker').keys;
 if(T<LU_START){const p=trackAt(k,T),m=T<-2.8?trackAt(TR('winger').keys,T):trackAt(MK,T),h=nrm2(m[0]-p[0],m[1]-p[1]),st=runState(k,T,h);
  const pose=blendPose(st.pose,backpedal(T*1.6),.45*(T<-2.8?1:.6));return{pose:lookAtBall({pose,place:st.place},T,.6),place:st.place};}
 const place=placeOf(BL_AT[0],BL_AT[1],BL_H),u=clamp((T-LU_START)/LU_DUR);
 const pose=u<1?lunge(u,{side:'r'}):blendPose(lunge(1,{side:'r'}),stand(),sm(LU_START+LU_DUR,LU_START+LU_DUR+.8,T));
 return{pose:T>T_DF+.2?lookAtBall({pose,place},T,.7):pose,place};
}
/** Ronaldo: drifting to the far post, his left arm out to hold Cucurella off, the right-foot volley, then away pointing at his chest */
function ronaldoState(T:number):St{
 const k=TR('ronaldo').keys;
 if(T<V_START){const st=runState(k,T),hold=sm(.4,1.3,T);let pose=lookAtBall(st,T,.8);
  if(hold>0)pose=clampPose({...pose,lShA:pose.lShA+1.1*hold,lShF:pose.lShF+.3*hold,lElb:pose.lElb*(1-.5*hold),twist:pose.twist+.2*hold});
  const h=yawTo([Math.cos(st.place.yaw!),Math.sin(st.place.yaw!)],R_H,sm(V_START-.5,V_START,T));
  return{pose,place:placeOf(st.place.x!,-st.place.z!,h)};}
 const u=clamp((T-V_START)/VOL_DUR),place=placeOf(R_AT[0],R_AT[1],R_H);
 if(u<1)return{pose:volley(u,{foot:'r',height:.5}),place};
 if(T<T_GOAL+.5)return{pose:lookAtBall({pose:keyPoses(clamp((T-V_START-VOL_DUR)/.4),[[0,volley(1,{foot:'r',height:.5})],[1,stand()]]),place},T,.8),place};
 // away to celebrate, pointing at his chest (Guardian)
 const c=clamp((T-T_GOAL-.5)/3),H=nrm2(-.6,1),w=sm(T_GOAL+.5,T_GOAL+1,T),run=celebrate((T-T_GOAL)*1.2,{kind:'run'});
 const point=clampPose({...run,lShA:.3,rShA:.3,lShF:.9,rShF:.9,lElb:2.3,rElb:2.3,neckP:-.2});
 return{pose:blendPose(stand(),point,w),place:placeOf(R_AT[0]+H[0]*8*c*c,R_AT[1]+H[1]*8*c*c,H)};
}
function cucuState(T:number):St{
 const k=TR('cucurella').keys,st=runState(k,T);let pose=lookAtBall(st,T,.8);
 // he looks up at the loop, then is held off: leaning into Ronaldo, a step behind the play
 const up=sm(T_DF+.2,T_DF+.8,T)*(1-sm(T_V,T_V+.6,T));if(up>0)pose=clampPose({...pose,neckP:pose.neckP-.6*up,lShA:pose.lShA+.5*up,rShA:pose.rShA+.3*up});
 return{pose,place:st.place};
}
function keeperState(T:number):St{const b=ballAt(T),face=nrm2(b[0]-GK_AT[0],b[2]-GK_AT[1]);
 const shift=sm(T_DF+.3,T_V,T),at:[number,number]=[GK_AT[0],lerp(GK_AT[1],35.6,shift)];
 const place=placeOf(at[0],at[1],T<T_V?face:nrm2(VP[0]-at[0],VP[2]-at[1]));
 if(T<T_V+.04)return{pose:keeperSet(T*1.3),place};
 return{pose:keeperDive(clamp((T-T_V-.04)/.95),{side:'l',height:.3}),place};}
function stateOf(id:string,T:number):St{
 if(id==='mendes')return mendesState(T);if(id==='winger')return wingerState(T);if(id==='yamal')return yamalState(T);if(id==='blocker')return blockerState(T);
 if(id==='ronaldo')return ronaldoState(T);if(id==='cucurella')return cucuState(T);if(id==='keeper')return keeperState(T);
 const st=runState(TR(id).keys,T);return{pose:lookAtBall(st,T,.5),place:st.place};
}
type Item={depth:number;draw:()=>void};
/** Everything at play time T through camera c: the arena, then players, keeper, ball and goals in depth order (far first).
 * detail 'low' for wide shots and for everyone but the heroes. */
function drawPlay(s:Sheet,T:number,c:Cam,o:{ballScale?:number;only?:string[];wide?:boolean;stands?:number[];heroes?:string[]}={}){
 if(o.stands)stadium(s,c,o.stands);
 const heroes=o.heroes??['mendes','winger','yamal','blocker'];
 const items:Item[]=[],ids=[...TRACKS.map(t=>t.id),'keeper'].filter(id=>!o.only||o.only.includes(id));
 for(const id of ids){const st=stateOf(id,T),g=P3([st.place.x!,0,-st.place.z!],c);if(!onScreen(g)||toCam([st.place.x!,1,-st.place.z!],c)[2]<3)continue;
  const style=id==='keeper'?KEEPER:TR(id).style,hero=heroes.includes(id)&&!o.wide,sty={...style,detail:hero?'auto' as const:'low' as const};
  const fast=(id==='mendes'&&(Math.abs(T)<.25||(T>-4.6&&T<-2)))||(id==='ronaldo'&&Math.abs(T-T_V)<.25)||(id==='blocker'&&Math.abs(T-T_DF)<.2);
  items.push({depth:1/g[2],draw:()=>{const pr=stateOf(id,T-1/12);drawPlayer(s,st.pose,c,sty,st.place,{prev:pr.pose,prevPlace:pr.place,smear:fast&&hero});}});}
 if(!o.only||o.only.includes('ball')){const bp=ballAt(T),bq=P3(bp,c);if(onScreen(bq)){const r=Math.max(4,.11*(o.ballScale??2)*bq[2]),g=P3([bp[0],0,bp[2]],c);
  items.push({depth:1/bq[2]-(Math.abs(T)<.3||Math.abs(T-T_V)<.3||Math.abs(T-T_DF)<.2?.002:0),draw:()=>{const h=Math.max(0,g[1]-bq[1]);if(onScreen(g))s.tone(K,shape(blob(g[0],g[1],r*1.15/(1+h/300),r*.35/(1+h/300),4,{n:14})),h>8?.32:.6);footballPanels(s,bq[0],bq[1],r,{rot:-T*7,key:K,shadow:G,seed:3});}});}}
 const bulge=.35*sm(T_GOAL,T_GOAL+.14,T)*(1-sm(T_GOAL+.3,T_GOAL+1,T));
 for(const[gx,dir]of[[0,-1],[105,1]]as[number,number][]){const gq=P3([gx+dir,1.2,34],c);if(gq[2]>0&&onScreen(gq))items.push({depth:1/gq[2],draw:()=>goal(s,c,gx,dir,gx>0?bulge:0)});}
 items.sort((a,b)=>b.depth-a.depth);for(const it of items)it.draw();
}

// ---------------------------------------------------------------- chapters
/** 1 · live: the high main camera on Mendes's side of the ground (Portugal attack screen-left), following the ball: the run, the cross,
 * the loop, the volley, in real time. */
const MAIN_CAM:V3=[60,30,132];
const t1=(t:number)=>{const q=Q(0),S=SECS(0);return warp(t,[[0,-8.2],[q[1],-5.6],[q[2],-3.4],[q[3],-.3],[q[4],T_DF+.75],[S,T_GOAL+2]]);};
const cam1=(t:number)=>{const T=t1(t),b=ballAt(Math.min(T,T_GOAL)),m=trackAt(MK,Math.min(T,S_START));
 const wide=sm(-.4,T_DF+.6,T,easeInOutSine),tx=clamp(lerp(lerp(b[0],m[0],.5)+4,lerp(b[0],96,.4)+1,wide),40,99),tz=lerp(lerp(b[2],58,.3),lerp(b[2],44,.45),wide);
 const F=lerp(8200,5600,wide)*lerp(1,1.14,sm(T_V-.3,T_GOAL+.8,T,easeInOutSine));
 return camAt(MAIN_CAM,[tx,0,tz],F);};
const ch1:Scene={
 draw(s,t){frame(s);drawPlay(s,t1(twos(t)),cam1(t),{wide:true,stands:[1,2,3]});frame(s);},
 aperture(t){const p=P3(ballAt(t1(twos(t))),cam1(t));return apertureDisc(p[0],p[1],Math.max(6,.25*p[2]),12);},
 get still(){return Q(0)[3]+.3;},
};
/** 2 · TV slow-motion replay from a low camera by the corner flag ahead of him: the sprint down the outside, Yamal left behind, the pass
 * into his path, head up, the cross. */
const LOW_CAM:V3=[101,1.6,70.4];
const t2=(t:number)=>{const q=Q(1),S=SECS(1);return warp(t,[[0,-5],[q[1],-4.4],[q[2],-2.9],[q[3],-1.15],[q[4],S_START+.12],[S,.75]]);};
const cam2=(t:number)=>{const T=t2(t),m=trackAt(MK,Math.min(T,S_START)),y=trackAt(TR('yamal').keys,T),after=sm(-.2,.6,T,easeInOutSine),
 tgt:[number,number]=[lerp(lerp(m[0],y[0],.3),m[0]+4,after),lerp(lerp(m[1],y[1],.3),m[1]-6,after)],F=lerp(2000,2500,sm(-5,-1,T,easeInOutSine))*lerp(1,.85,after);
 return camAt(LOW_CAM,[tgt[0],1,tgt[1]],F);};
const ch2:Scene={
 draw(s,t){frame(s);drawPlay(s,t2(twos(t)),cam2(t),{ballScale:1.6,stands:[2,3]});frame(s);},
 aperture(t){const p=P3(ballAt(t2(twos(t))),cam2(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(1)[4]+.5;},
};
/** 3 · the second replay, from a raised camera beside Spain's goal on the far side: the flick, the loop dropping behind Cucurella,
 * Ronaldo holding him off, the volley, in. */
const UP_CAM:V3=[109.6,3.4,20];
const t3=(t:number)=>{const q=Q(2),S=SECS(2);return warp(t,[[0,-.35],[q[0],T_DF-.05],[q[1],T_V-.55],[q[2],T_V-.22],[q[3],T_GOAL+.15],[S,T_GOAL+2.2]]);};
const cam3=(t:number)=>{const T=t3(t),b=ballAt(Math.min(T,T_GOAL)),near=sm(T_DF+.4,T_V-.3,T,easeInOutSine),fin=sm(T_V,T_GOAL+.4,T,easeInOutSine),
 tx=lerp(lerp(94,b[0],.5),99.5,near),tz=lerp(lerp(52,b[2],.5),lerp(34.5,33.5,fin),near),F=lerp(2300,3000,near)*lerp(1,.92,fin);
 return camAt(UP_CAM,[tx,1,tz],F);};
const ch3:Scene={
 draw(s,t){frame(s);drawPlay(s,t3(twos(t)),cam3(t),{ballScale:1.6,stands:[0,2,3],heroes:['ronaldo','cucurella','keeper','blocker','e-cb2']});frame(s);},
 aperture(t){const p=P3(ballAt(t3(twos(t))),cam3(t));return apertureDisc(p[0],p[1],Math.max(8,.2*p[2]),12);},
 get still(){return Q(2)[3]+.5;},
};
/** 4 · the lesson plate: the overlap again from a raised camera behind the play, outside the touchline, with bold yellow teaching marks —
 * a ring round Nuno ("Remember Nuno"), his sprint past the winger ("sprint past your winger"), the outside lane ("on the outside"), and the
 * easy pass into his path ("easy pass"). */
const t4=(t:number)=>{const q=Q(3),S=SECS(3);return warp(t,[[0,-5.6],[q[1],-5],[q[2],-3.9],[q[3],T_FEED()-.35],[S,touches()[0].T+.5]]);};
const cam4=(t:number)=>{const T=t4(twos(t)),m=trackAt(MK,T),wg=trackAt(TR('winger').keys,T),cx=lerp(m[0],wg[0],.45);return camAt([cx-17,9.5,m[1]+10],[cx+3,.6,(m[1]+wg[1])/2-.5],2500);};
/** a bold yellow teaching stroke (navy edge, paper knockout, yellow) */
function mark(s:Sheet,p:Path2D){s.stroke(K,p,5,.9);s.knockout(p);s.fill(Y,p,.95);}
/** a bold teaching arrow a → b (drawn to `u`), one path: shaft + head */
function arrow(s:Sheet,a:Pt,b:Pt,w:number,seed:number,u=1){if(u<=.01)return;const e:Pt=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],an=Math.atan2(e[1]-a[1],e[0]-a[0]),hl=w*2.4,L=Math.hypot(e[0]-a[0],e[1]-a[1]);
 const back:Pt=[e[0]-Math.cos(an)*Math.min(hl*.8,L*.5),e[1]-Math.sin(an)*Math.min(hl*.8,L*.5)],p=new Path2D();p.addPath(ribbon([a,back],w,{seed,taper:0,wobble:.8}));
 p.addPath(shape([[e[0],e[1]],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a curved teaching arrow along ground points (pitch x,z), drawn to `u` */
function groundArrow(s:Sheet,pts:[number,number][],c:Cam,w:number,seed:number,u=1){if(u<=.01)return;const n=Math.max(2,Math.round(pts.length*u)),sc=pts.slice(0,n).map(p=>G2(p[0],p[1],c));
 if(sc.length<2)return;const last=sc[sc.length-1],prev=sc[sc.length-2],p=new Path2D();p.addPath(ribbon(sc.slice(0,-1).concat([[lerp(prev[0],last[0],.3),lerp(prev[1],last[1],.3)]]),w,{seed,taper:0,wobble:.8}));
 const an=Math.atan2(last[1]-prev[1],last[0]-prev[0]),hl=w*2.4,back:Pt=[last[0]-Math.cos(an)*hl*.8,last[1]-Math.sin(an)*hl*.8];
 p.addPath(shape([[last[0]+Math.cos(an)*hl*.3,last[1]+Math.sin(an)*hl*.3],[back[0]+Math.cos(an+1.57)*hl*.55,back[1]+Math.sin(an+1.57)*hl*.55],[back[0]+Math.cos(an-1.57)*hl*.55,back[1]+Math.sin(an-1.57)*hl*.55]]));mark(s,p);}
/** a ring on the grass round (x,z), radius r (ground metres) */
function groundRing(s:Sheet,x:number,z:number,r:number,c:Cam){const out:Pt[]=[],inn:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU;out.push(G2(x+Math.cos(a)*r,z+Math.sin(a)*r,c));inn.push(G2(x+Math.cos(a)*r*.72,z+Math.sin(a)*r*.72,c));}
 const ring=new Path2D();ring.addPath(polyPath(out,true));ring.addPath(polyPath(inn.reverse(),true));mark(s,ring);}
const ch4:Scene={
 draw(s,t){
  const q=Q(3),T=t4(twos(t)),c=cam4(t),S=SECS(3);frame(s);
  stadium(s,c,[1,2]);
  const m=trackAt(MK,T),wg=trackAt(TR('winger').keys,T);
  // "Remember Nuno": a yellow ring on the grass round him (printed under the figures)
  const hal=sm(.1,.5,t,easeOutBack)*(1-sm(q[1]+.2,q[1]+.6,t));
  if(hal>.01)groundRing(s,m[0],m[1],1.2*hal,c);
  // "on the outside": his lane, curving round the outside of the winger (between him and the touchline) and on up the line
  const run=sm(q[2],q[2]+.9,t,easeInOutSine),fade=1-sm(S-.7,S-.3,t),w=Math.max(9,.14*P3([wg[0],0,wg[1]],c)[2]);
  if(run>.01&&fade>.01){const a=trackAt(MK,-5),pts:[number,number][]=[];for(let i=0;i<=10;i++){const u=i/10,x=lerp(a[0]+1.5,wg[0]+8,u),z=a[1]+.4+Math.sin(u*Math.PI)*.9+u*.8;pts.push([x,z]);}groundArrow(s,pts,c,w*fade,41,run);}
  // "your winger": the winger on the ball, ringed
  const out=sm(q[1],q[1]+.5,t,easeOutBack)*(1-sm(q[2]+.4,q[2]+.8,t));
  if(out>.01)groundRing(s,wg[0],wg[1],1.1*out,c);
  drawPlay(s,T,c,{ballScale:1.5,only:['mendes','winger','yamal','blocker','ball']});
  // "easy pass": the arrow from the winger's ball into the space ahead of Nuno, then a burst where it meets his boot
  const pass=sm(q[3]-.2,q[3]+.4,t,easeInOutSine)*fade;
  if(pass>.01){const t0=touches()[0].at,a=G2(FEED_BALL[0]+.6,FEED_BALL[1]+.8,c),b=G2(t0[0],t0[2]-.6,c);arrow(s,a,b,w*.9,42,pass);}
  const stamp=sm(q[3]+.8,q[3]+1.1,t,easeOutBack)*(1-sm(S-.9,S-.4,t));
  if(stamp>.002){const t0=touches()[0].at,bp=P3([t0[0],.3,t0[2]],c);sparkBurst(s,Y,bp[0],bp[1],.9*bp[2],{n:10,seed:61,g:clamp(stamp),width:.07*bp[2]});}
  frame(s);
 },
 get still(){return Q(3)[3]+.9;},
};

const SCENES:Scene[]=[ch1,ch2,ch3,ch4];
const film:RisoStory={
 id:'nuno-mendes-signature',format:'11v11',title:'Nuno Mendes: the overlap',theme:'Run past your winger on the outside to give them an easy pass',
 ageNote:'Portugal v Spain · Nations League final, 8 June 2025 · Munich, Germany',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#e8392f',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,SCENES);},
 /** Touch: a little floodlight spark and a spray of grass flecks where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3)):1;if(g<=0)return;
  sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age>0)dust(s,null,x,y+14,30+110*easeOut(clamp(age/.6)),12,{seed:seed+1,size:10,cov:.9*(1-clamp(age/.8))});
 },
};
export default film;
/** Solved contact points (pitch metres; Portugal attack +X, Z across, their left at high Z) — checked by tests/play-film-nuno-mendes-signature.cjs. */
const feet=(st:St,build:AthleteStyle['build'])=>{const sk=solve(st.pose,build,st.place,FIG);return{l:toMy(midSole(sk.lToe,sk.lHeel)),r:toMy(midSole(sk.rToe,sk.rHeel)),pelvisY:sk.pelvis[1]};};
const at2=(st:St)=>[st.place.x!,-st.place.z!] as [number,number];
export const FACTS={LB,DF,VP,GL,T_DF,T_V,T_GOAL,S_START,ballAt,touches,feedBall:FEED_BALL,T_FEED,
 mendesFeet:(T:number)=>feet(mendesState(T),MENDES.build),
 wingerFeet:(T:number)=>feet(wingerState(T),WINGER.build),
 blockerFeet:(T:number)=>feet(blockerState(T),BLOCKER.build),
 ronaldoFeet:(T:number)=>feet(ronaldoState(T),RONALDO.build),
 mendesAt:(T:number)=>at2(mendesState(T)),wingerAt:(T:number)=>at2(wingerState(T)),yamalAt:(T:number)=>at2(yamalState(T)),
 ronaldoAt:(T:number)=>at2(ronaldoState(T)),cucuAt:(T:number)=>at2(cucuState(T)),keeperAt:()=>GK_AT};
