/** Lauren James — signature: the curler from the edge. Recreated from ONE real, well-documented moment: her goal for England v Denmark,
 * 2023 FIFA Women's World Cup, Group D, Sydney Football Stadium (Allianz Stadium), Sydney, Friday 28 July 2023, 18:30 local (a winter
 * night under the floodlights), England 1–0 Denmark, the 6th minute (FIFA's clock logs the shot in minute 5). An iconic-play riso film
 * (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN
 * accounts and FIFA's official shot data (the footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT (lib/town/iconicPlays.json: kind "signature", "the curler from the edge", right foot; lesson "Cut inside onto your
 * stronger foot, then curl the ball into the far corner"): it is her first World Cup goal, on her first World Cup start, and the best-
 * documented example of the trait. The Guardian says England's shape "allowed James to cut inside" from the left; BBC Sport calls it "a
 * superb strike from the edge of the box"; FIFA's match report plots it as a RIGHT-footed shot from just outside the D, left of centre,
 * into the FAR (right-hand) side of the goal: exactly the edge-of-the-box, cut-in, far-corner finish of her signature.
 *
 * SOURCES (read Sept 2026 with curl; cached in the film scratchpad src-cache/):
 *  - Wikipedia, "2023 FIFA Women's World Cup Group D" (date, 18:30 UTC+10, Sydney Football Stadium, 40,439, referee Tess Olofsson, James 6',
 *    line-ups and numbers: James 7 at left forward, Daly 9 at left-back, Toone 10, Russo 23, Kelly 18, Stanway 8; the kit boxes: England
 *    white shirts, blue shorts, white socks; Denmark all red) https://en.wikipedia.org/wiki/2023_FIFA_Women%27s_World_Cup_Group_D
 *  - Wikipedia, "Lauren James" (1.67 m; "scored the only goal in England's 1–0 victory over Denmark") https://en.wikipedia.org/wiki/Lauren_James
 *  - FIFA Training Centre post-match report, England 1–0 Denmark (report_131892.pdf): "5' 7 JAMES Lauren — On Target - Goal — Right Foot —
 *    Pass"; the shot map (from the edge of the D, about 19 m out and about 4 m left of centre); the goal-mouth plot (about 0.3–0.5 m inside
 *    the right-hand post, about 1 m up); Denmark's "Goal Prevention" page marks it a "Save Attempt" by keeper Lene Christensen (1).
 *    https://www.fifatrainingcentre.com/media/native/tournaments/womens-world-cup/2023/report_131892.pdf
 *  - The Guardian, Suzanne Wrack, "England close in on last 16 after James sinks Denmark but Walsh injury a blow", 28 Jul 2023: "With Daly
 *    driving forward from the left, it allowed James to cut inside ... Just six minutes in ... The ball was worked wide to Daly who fed James
 *    and the Chelsea player powered forward before lashing the ball past Lene Christensen into the far corner"; photo caption "Lauren James
 *    (right) races away after her sensational early strike as Ella Toone gives chase".
 *    https://www.theguardian.com/football/2023/jul/28/england-denmark-womens-world-cup-match-report
 *  - BBC Sport, Emma Sanders, "England 1-0 Denmark: Lauren James stars as England beat Denmark", 28 Jul 2023 ("a superb strike from the edge
 *    of the box just six minutes into her first World Cup start"; the stadium "dominated by Lionesses supporters")
 *    https://www.bbc.com/sport/football/66290755
 * CONFIRMED: Friday 28 July 2023, 18:30, Sydney Football Stadium, 40,439, a crowd dominated by England fans; the 6th minute; the ball worked
 *  wide to Rachel Daly (9, at left-back), who fed James (7, starting at left forward); James powered forward and struck with her RIGHT foot
 *  from the edge of the box (FIFA: just outside the D, left of centre) past Lene Christensen (1), who attempted a save, into the far
 *  corner (FIFA: the right-hand side, about 1 m up); she raced away to celebrate with Ella Toone (10) giving chase. Kits: England white
 *  shirts, blue shorts, white socks; Denmark all red.
 * INFERRED (illustrative): the exact spots where Daly passed and James received (the film carries the ball about 13 m diagonally inside,
 *  as "powered forward" and "cut inside" describe), the touch foot while she carried it (right), the ball's bend (a right-foot inside-of-the
 *  -boot curl, starting outside the far-post line and bending back; the accounts say "lashing", the title says "curler", FIFA's positions
 *  make a bend likely — the narration says "strikes" and "far corner", the word "curl" only in the lesson), the shot's speed (≈ 90 km/h),
 *  which end England attacked (drawn left to right under the main-stand camera), Christensen's kit colour (drawn yellow) and dive, every
 *  other player's position and movement (the Danish defender who backs off James is unnamed on purpose), the number colours, everyone's hair
 *  (James drawn with dark hair tied back), the celebration run's direction, the stadium's shape as drawn (steep, close, roofed stands with
 *  floodlights in the roof lip), the crowd's colours, banners and boards.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = live, the high main-stand camera in real time (the floodlit bowl → Daly's pass → James
 *  carries it in → the strike → the net); ch2 = the slow-motion replay LOW, ahead of James and to her left, as she carries it inside across
 *  the edge of the box onto her right foot (a red cut-in arrow on the grass, a yellow ring on her right boot); ch3 = the second replay angle
 *  from BEHIND THE GOAL by the far post: the strike bending past Christensen's dive into the far corner (a yellow trail), then James racing
 *  away with Toone chasing; ch4 = the lesson from high behind James: cut inside (red arrow) → stronger foot (ring) → look up (sightline) →
 *  open your body (hips arc) → curl it (the bending yellow path) into the far corner (lit up). Composed on the FULL sheet (never
 *  sheet.safe), 1.45:1 card window down to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts, women's builds
 *  and ponytails, `prev` secondary motion, motionSmear on the strike and the dive, `low` detail for small wide-shot figures and during
 *  passages. Handedness: the world is right-handed like athlete.ts (X toward Denmark's goal line at 105, Y up, +Z = the near touchline under
 *  the main-stand camera, the attackers' RIGHT), so James's right foot strikes with no mirrored projector; the far post of her shot is at
 *  Z = +3.66, which is Christensen's LEFT (she faces −X), so she dives side 'l'. Inks: yellow, red, blue, navy. Everything is keyed to cue
 *  times (withTiming swaps in the recorded word onsets); poses on twos, cameras on ones; all randomness seeded.
 *
 * LEAD: when public/plays/narration/lauren-james-signature/timing.json exists, add
 *   import timingJson from '../../../public/plays/narration/lauren-james-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming`. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,smoothPts,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,footballPanels,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,solve,runCycle,dribble,backpedal,strike,keeperSet,keeperDive,celebrate,stand,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` must be substrings in order; withTiming matches a cue by its FIRST word, in order,
 * so no cue starts with a word that also appears between it and the previous cue (hence 'drives forward', not 'James drives'). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Sydney, 2023, the Women’s World Cup: England against Denmark. Six minutes in, Rachel Daly finds Lauren James on the left. James drives forward... and scores!',tail:2.4,
  cues:['Sydney','England against','Six minutes','Rachel Daly','Lauren James','drives forward','and scores']},
 {label:'Watch again',text:'Watch again, slowly. James carries it inside, across the edge of the box, onto her right foot.',tail:1.4,
  cues:['Watch again','carries it','across the edge','right foot']},
 {label:'The far corner',text:'From behind the goal: she strikes it past Lene Christensen, right into the far corner. England lead one-nil!',tail:1.9,
  cues:['From behind','she strikes','past Lene','far corner','England lead']},
 {label:'Your turn',text:'Your turn: cut inside onto your stronger foot. Look up, open your body, and curl the ball into the far corner!',tail:2,
  cues:['Your turn','cut inside','stronger foot','Look up','open your body','curl the ball','far corner']},
];
/** VOICE: null until the lead voices the film (scripts/plays/kokoro-narrate.py lauren-james-signature writes timing.json). */
import timingJson from '../../../public/plays/narration/lauren-james-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (≈ Kokoro pace): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('lauren-james: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('lauren-james: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number,lift=0):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+lift*4*u*(1-u),lerp(a[2],b[2],u)];
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** world (x,y) on the CANVAS centre at z0 units per world unit; full-sheet framing, never sheet.safe */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
const depth=(c:Cam,P:V3)=>toCam(c,P)[2];
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
const addPoly=(path:Path2D,q:Pt[])=>{if(q.length>2)path.addPath(polyPath(q,true));};
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;

// ---------------------------------------------------------------- Sydney Football Stadium at night: steep, close, roofed stands
/** stand planes (a along, b up the rake 0..1): 0 the far side (z<0), 1 behind Denmark's goal (x>105), 2 the main stand (z>0, camera side),
 * 3 behind the other goal (x<0) */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-8,113,a),1.3+27*b,-39-28*b],
 (a,b)=>[111+26*b,1.3+24*b,lerp(-48,48,a)],
 (a,b)=>[lerp(113,-8,a),1.3+25*b,39+27*b],
 (a,b)=>[-6-26*b,1.3+24*b,lerp(48,-48,a)],
];
const STAND_COLS=[100,70,100,70],STAND_ROWS=14,WALK=.46;
/** St George banners on the stand fronts (England fans dominated) and Danish red-white ones: [stand, a, kind 0 = St George, 1 = Denmark] */
const FLAGS:[number,number,number][]=[[0,.3,0],[0,.46,0],[0,.6,1],[0,.74,0],[0,.88,0],[1,.25,0],[1,.55,0],[1,.8,1],[2,.2,0],[2,.5,0],[3,.4,0],[3,.7,1]];
/** which stands to print: skip a stand the camera sits in or behind */
const standsFor=(c:Cam)=>[c.C[2]>-37?0:-1,c.C[0]<109?1:-1,c.C[2]<37?2:-1,c.C[0]>-4?3:-1].filter(i=>i>=0);
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,tt=twos(t),which=standsFor(c);
 // a clear winter night in Sydney: deep navy over the paper, a faint floodlit haze low over the bowl
 s.field(K,.86,.5);
 const hz=pr(c,add3(c.C,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz)s.tone(Y,polyPath([[-1e4,hz[1]-600],[1e4,hz[1]-600],[1e4,hz[1]+80],[-1e4,hz[1]+80]],true),.12);
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(-.3,0),S(1.3,0),S(1.3,1),S(-.3,1)]));seg3(c,S(0,WALK),S(1,WALK),.6,walk);
  // the roof: a canopy from the back of the stand, sloping out over the seats to a lip high over the front rows
  addPoly(roof,polyP(c,[add3(S(-.3,1),[0,2,0]),add3(S(1.3,1),[0,2,0]),add3(S(1.3,.3),[0,22,0]),add3(S(-.3,.3),[0,22,0])]));
  seg3(c,add3(S(-.3,.3),[0,21.6,0]),add3(S(1.3,.3),[0,21.6,0]),.5,edge);}
 s.knockout(planes);s.tone(K,planes,.5);s.tone(B,planes,.2);s.knockout(walk,.45);
 // the crowd: mostly England white and red, a scatter of Danish red, some blue and yellow
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(Math.abs(b-WALK)<.04)continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,6);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,q=toCam(c,S(a,b));if(q[2]<8)continue;
   const p=scr(c,q);if(!inView(v,p))continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.58?0:h<.82?1:h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.fill(R,inks[1],.95);s.fill(B,inks[2],.85);s.fill(Y,inks[3],.9);
 s.knockout(roof);s.fill(K,roof,.95);s.knockout(edge,.6);
 // banners: St George (paper, red cross) and Denmark (red, white cross)
 const fl=new Path2D(),cr=new Path2D(),dk=new Path2D(),dkc=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.07),P(0,.07)]);if(q.length<3)continue;
  if(kind===0){fl.addPath(polyPath(q,true));addPoly(cr,polyP(c,[P(.43,.005),P(.57,.005),P(.57,.07),P(.43,.07)]));addPoly(cr,polyP(c,[P(0,.032),P(1,.032),P(1,.043),P(0,.043)]));}
  else{dk.addPath(polyPath(q,true));addPoly(dkc,polyP(c,[P(.3,.005),P(.4,.005),P(.4,.07),P(.3,.07)]));addPoly(dkc,polyP(c,[P(0,.032),P(1,.032),P(1,.043),P(0,.043)]));}}
 s.knockout(fl);s.fill(R,cr,.95);s.knockout(dk);s.fill(R,dk,.95);s.knockout(dkc);
 // floodlights in the roof lip with yellow haloes
 const lamp=new Path2D(),halo=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<8;k++){const u=(k+.5)/8,a=add3(S(u-.02,.3),[0,21.2,0]),b=add3(S(u+.02,.3),[0,21.2,0]),m:V3=[(a[0]+b[0])/2,a[1],(a[2]+b[2])/2];if(depth(c,m)<NEAR+2)continue;seg3(c,a,b,1.1,lamp);
  const g=pr(c,m);if(g&&inView(v,g,80)){const r=clamp(c.F*4.5/depth(c,m),8,140);halo.moveTo(g[0]+r,g[1]);halo.ellipse(g[0],g[1],r,r*.62,0,0,TAU);}}}
 s.knockout(halo,.22);s.tone(Y,halo,.4);s.knockout(lamp);s.fill(Y,lamp,.8);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash),T12=Math.floor(tt*12);for(let i=0;i<n;i++){const si=which[Math.floor(hash(i*17+T12*101,3)*which.length)];if(si===undefined)continue;const q=pr(c,STANDS[si](hash(i*29+T12*7,4),.1+.8*hash(i,T12)));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
/** the grass under the floodlights (yellow × blue), mowing stripes, boards, paper lines, the far goal and the corner flags */
function ground(s:Sheet,c:Cam){
 const sur=polyP(c,[[-8,0,-39],[113,0,-39],[113,0,39],[-8,0,39]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.8);s.tone(B,p,.75);}
 const g=polyP(c,[[-3,0,-37],[108,0,-37],[108,0,37],[-3,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]));s.tone(K,st,.12);
 // advertising boards: navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.9,0]),add3(a,[0,.9,0])]));
 board([-4,0,-38.2],[110,0,-38.2]);board([110.5,0,-36],[110.5,0,36]);board([-5.5,0,36],[-5.5,0,-36]);
 for(let k=0;k<18;k++){const x=-2+k*6.2;addPoly(pn,polyP(c,[[x,.25,-38.15],[x+3.4,.25,-38.15],[x+3.4,.65,-38.15],[x,.65,-38.15]]));}
 for(let k=0;k<11;k++){const z=-34+k*6.4;addPoly(pn,polyP(c,[[110.45,.25,z],[110.45,.25,z+3.4],[110.45,.65,z+3.4],[110.45,.65,z]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.85);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,12);circ(gx+d*11,0,.12,0,TAU,6);}
 circ(105,34,1,Math.PI,1.5*Math.PI,5);circ(105,-34,1,Math.PI/2,Math.PI,5);
 s.knockout(ln);
 goal3(s,c,0,-1);
 const pole=new Path2D(),flag=new Path2D();
 for(const z of [34,-34]){seg3(c,[105,0,z],[105,1.55,z],.05,pole);const a=pr(c,[105,1.55,z]),b=pr(c,[105,1.4,z-Math.sign(z)*.45]),e=pr(c,[105,1.2,z]);if(a&&b&&e)flag.addPath(polyPath([a,b,e],true));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep. net = paper haze strength; bulge = the net bellying where the ball hits */
const GOAL={x:105,z0:-3.66,z1:3.66,h:2.44};
function goal3(s:Sheet,c:Cam,X:number,d:number,net=.3,bulge?:{z:number;y:number;k:number}){
 const z0=-3.66,z1=3.66,H=2.44,bx=X+d*2;
 const bb=(z:number,y:number)=>bulge?bx+d*.55*bulge.k*Math.max(0,1-Math.hypot(z-bulge.z,(y-bulge.y)*1.3)/1.8):bx;
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[bx,1.9,z0],[bx,0,z0]],[[X,0,z1],[X,H,z1],[bx,1.9,z1],[bx,0,z1]],[[X,H,z0],[X,H,z1],[bx,1.9,z1],[bx,1.9,z0]],[[bx,0,z0],[bx,0,z1],[bx,1.9,z1],[bx,1.9,z0]]];
 const n=new Path2D();for(const P of planes)addPoly(n,polyP(c,P));
 s.knockout(n,net);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[bb(z,1.9),1.9,z],.025,mesh);for(let j=0;j<3;j++){const y0=1.9*(1-j/3),y1=1.9*(1-(j+1)/3);seg3(c,[bb(z,y0),y0,z],[bb(z,y1),y1,z],.025,mesh);}}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=lerp(z0,z1,i/4),zb=lerp(z0,z1,(i+1)/4);seg3(c,[bb(za,y),y,za],[bb(zb,y),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[bx,y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[bx,y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** women footballers: athletic builds, a touch slimmer through the shoulders */
const W=(h:number,o:{bulk?:number;thighs?:number}={})=>({height:h,bulk:o.bulk??.93,thighs:o.thighs??1.06,head:1.02});
/** England 28 July 2023 (Wikipedia kit box): white shirts, blue shorts, white socks; navy numbers (inferred) */
const ENG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:B,shorts:B,socks:'paper',boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'ponytail',line:K,shade:[K,.28],sleeves:'short',numberInk:K,build:W(1.68),seed:5,...o});
/** Lauren James: No. 7, 1.67 m (Wikipedia); dark hair tied back; quick, strong legs */
const JAMES:AthleteStyle=ENG({number:7,skin:SKIN_D,hair:[K,.95],hairStyle:'ponytail',build:W(1.67,{bulk:.94,thighs:1.12}),seed:7});
/** Rachel Daly: No. 9 (confirmed); fair ponytail (inferred) */
const DALY:AthleteStyle=ENG({number:9,hair:[Y,.85],build:W(1.67),seed:9});
/** Ella Toone: No. 10 (confirmed; she chases James in the celebration photo) */
const TOONE:AthleteStyle=ENG({number:10,hair:[Y,.55],build:W(1.63),seed:10});
/** Denmark 28 July 2023 (Wikipedia kit box): all red; white numbers (inferred) */
const DEN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,trim:'paper',shorts:R,socks:R,boots:K,skin:SKIN_L,hair:[Y,.8],hairStyle:'ponytail',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',build:W(1.7),seed:31,...o});
/** Lene Christensen: No. 1 (confirmed); keeper kit colour inferred (yellow), navy gloves */
const CHRISTENSEN:AthleteStyle={shirt:[Y,.95],trim:K,shorts:[K,.85],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[Y,.7],hairStyle:'ponytail',line:K,shade:[K,.3],sleeves:'long',gloves:[K,.85],number:1,numberInk:K,build:W(1.76,{bulk:.98}),seed:1};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete). prev = the pose one drawing earlier (secondary
 * motion: ponytail and hem trail); smear = a halftone echo + speed lines for fast moves. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;prevPlace?:Place;smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{prevPlace:o.prevPlace,threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev,prevPlace:o.prevPlace}:{});
}

// ---------------------------------------------------------------- the play (T = play seconds; T = 0 = Daly's pass)
const FIG=1.06;// figures 6 % over life size so they read in a small card window
/** the beats: James takes Daly's pass, carries it inside across the edge of the box, strikes with her right foot, the ball in the net */
const T_RECV=1.05,T_SHOT=3.55,T_GOAL=4.35;
type Role='james'|'gk'|'passer'|'toone'|'eng'|'den'|'mark';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];key?:boolean};
/** Positions: Hermite through keys [T, X, Z]. Only James, Daly, Christensen and Toone have beats in the accounts; everyone else is an
 * illustrative marker, unnamed. */
const ACTORS:Actor[]=[
 {name:'James',role:'james',style:JAMES,key:true,keys:[[-4,69.5,-19.5],[-2,72,-18.2],[-.6,74.2,-16.6],[.4,75.6,-15.7],[T_RECV,76.4,-15.1],[1.6,78.6,-13.4],[2.2,81.1,-10.6],[2.8,83.5,-7.9],[3.25,85,-6.2],[T_SHOT,85.7,-5.4],[3.9,86.4,-4.9],[4.6,87.6,-3.2],[5.6,88.9,.2],[7,89.8,5],[9,90.3,11]]},
 {name:'Christensen',role:'gk',style:CHRISTENSEN,key:true,keys:[[-4,102.6,-.2],[0,102.8,-1.2],[2,103.1,-1.5],[3.3,103.3,-.9],[9,103.3,-.9]]},
 {name:'Daly',role:'passer',style:DALY,key:true,keys:[[-4,63.5,-29.5],[-1.5,67.4,-28.6],[-.4,69.2,-28.1],[0,69.6,-28],[.6,70.3,-27.8],[3,75.5,-27],[6,81,-24],[9,84,-20]]},
 {name:'Toone',role:'toone',style:TOONE,key:true,keys:[[-4,76,-3],[0,79,-2.2],[2,82.2,-.6],[3.5,84.8,.4],[4.6,86.4,.6],[5.8,88.4,2.2],[7.2,89.2,6],[9,89.8,10]]},
 {name:'mark',role:'mark',style:DEN({seed:34,hair:[Y,.9]}),keys:[[-4,85.5,-18],[0,83.6,-16.4],[1.1,83,-15],[2,84.6,-12.4],[2.8,86.4,-10.2],[3.55,87.8,-8.9],[4.6,88.6,-8.2],[9,89,-7]]},
 {name:'den2',role:'den',style:DEN({seed:32,hair:[K,.7]}),keys:[[-4,93,-6],[0,93.6,-5.2],[2.5,95.2,-3.4],[4.2,96.4,-2.2],[9,96,-1.5]]},
 {name:'den3',role:'den',style:DEN({seed:33,hair:[Y,.7]}),keys:[[-4,92,3],[0,93,3.4],[2.5,94.8,3.8],[4.2,96,4],[9,95.6,4.2]]},
 {name:'den4',role:'den',style:DEN({seed:35,hair:[Y,.85]}),keys:[[-4,86,14],[0,87.5,13],[3,90.5,11.5],[9,92,9]]},
 {name:'den5',role:'den',style:DEN({seed:36,hair:[K,.6]}),keys:[[-4,80,-7.5],[0,81.5,-6.6],[2.2,83,-5.2],[3.6,84.6,-3.2],[9,86.2,-1.5]]},
 {name:'den6',role:'den',style:DEN({seed:37,hair:[Y,.6]}),keys:[[-4,79,-26],[0,80.5,-24.5],[3,83.5,-22.5],[9,86,-19]]},
 {name:'den7',role:'den',style:DEN({seed:38,hair:[K,.8]}),keys:[[-4,74,4],[0,76,3.6],[3,79.8,2.6],[9,82.4,3]]},
 {name:'russo',role:'eng',style:ENG({seed:43,hair:[Y,.6]}),keys:[[-4,92,-1],[0,92.8,-.6],[2.5,94.5,1.2],[4.3,95.6,2.2],[6,94.4,4.5],[9,92,8]]},
 {name:'kelly',role:'eng',style:ENG({seed:44,hair:[Y,.9]}),keys:[[-4,85,17],[0,86.5,16],[3,90,14],[5,90.5,12],[9,90.5,11]]},
 {name:'stanway',role:'eng',style:ENG({seed:45,hair:[Y,.7]}),keys:[[-4,66,-6],[0,69,-5.6],[3,74,-4.2],[6,79,-1],[9,84,4]]},
];
const JAMES_I=0,GK_I=1,PASS_I=2,TOONE_I=3,MARK_I=4;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase), built once at module load */
const T0=-4,T1=9,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],T:number)=>{const u=clamp((T-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,T:number):[number,number]=>[samp(TABLES[k].X,T),samp(TABLES[k].Z,T)];
const distOf=(k:number,T:number)=>samp(TABLES[k].D,T);
const velOf=(k:number,T:number):[number,number]=>{const a=posOf(k,T-.08),b=posOf(k,T+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---------------------------------------------------------------- poses
const RAD=Math.PI/180;
/** the far corner she aims at (FIFA's goal-mouth plot: about 0.4 m inside the right-hand post, about 1 m up) */
const TOP:V3=[105.1,1.05,3.2],NET:V3=[106.8,.9,2.95],REST:V3=[106.5,.11,2.6];
/** the strike: a full right-foot swing, contact at T_SHOT */
const SHOT=(T:number)=>strike(clamp((T-T_SHOT)/.95+STRIKE_CONTACT),{foot:'r',power:1});
/** her first touch off Daly's pass: a short right-foot touch across her body, inside */
const TOUCH=(T:number)=>strike(clamp((T-T_RECV)/.7+STRIKE_CONTACT),{foot:'r',power:.2});
/** facing: open her body to the far corner for the strike (the shot line + a little extra hip opening) */
const FACE_SHOT=yawOf(105-85.7,2.4+5.4)+6*RAD;
function jamesYaw(T:number):number{const v=velOf(JAMES_I,T),run=yawOf(v[0],v[1]);
 if(T<T_RECV-.6)return run;
 if(T<T_RECV+.3)return lerpA(run,yawOf(1,.45),sm(T_RECV-.6,T_RECV-.1,T));
 if(T<T_SHOT-.5)return lerpA(yawOf(1,.45),run,sm(T_RECV+.1,T_RECV+.4,T));
 if(T<T_SHOT+.5)return lerpA(run,FACE_SHOT,sm(T_SHOT-.5,T_SHOT-.25,T));
 return lerpA(FACE_SHOT,run,sm(T_SHOT+.5,T_SHOT+.95,T));}
/** Christensen's dive to her left (the far post), full stretch just as the ball passes beyond her glove */
const GK_DIVE=(T:number)=>keeperDive(clamp((T-(T_GOAL-.2))/.9+.55),{side:'l',height:.45});
function poseOf(k:number,T:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,T),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,T);
 const[jx,jz]=posOf(JAMES_I,T);
 let yaw=sp>.9?yawOf(v[0],v[1]):yawOf(jx-x,jz-z);
 if(a.role==='mark'||a.role==='den')yaw=yawOf(jx-x,jz-z);// defenders face the ball carrier
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(T*1.3):stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,T)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5);p=blendPose(idle,runCycle(distOf(k,T)/3.3,{speed:s}),clamp((sp-.5)/.9));}
 if(a.role==='mark'&&!(sp>.5&&along<-.35*sp)&&sp>.5)yaw=yawOf(v[0],v[1]);
 if(a.role==='passer'){yaw=lerpA(yaw,PASS_YAW,sm(-.9,-.3,T)*(1-sm(.8,1.5,T)));const u=(T+STRIKE_CONTACT*.9)/.9;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.5}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));}
 if(a.role==='james'){yaw=jamesYaw(T);
  // carrying it: the dribble gait (touches on the right foot) from the first touch to the strike
  const wd=sm(T_RECV+.1,T_RECV+.4,T)*(1-sm(T_SHOT-.6,T_SHOT-.4,T));if(wd>0)p=blendPose(p,dribble(distOf(k,T)/2.5,{foot:'r',speed:.9}),wd);
  const wt=sm(T_RECV-.35,T_RECV-.18,T)*(1-sm(T_RECV+.2,T_RECV+.38,T));if(wt>0)p=blendPose(p,TOUCH(T),wt);
  const ws=sm(T_SHOT-.55,T_SHOT-.35,T)*(1-sm(T_SHOT+.45,T_SHOT+.7,T));if(ws>0)p=blendPose(p,SHOT(T),ws);
  // she races away (arms out), then jumps with both arms up
  if(T>T_GOAL+.1){const wc=sm(T_GOAL+.1,T_GOAL+.5,T);p=blendPose(p,T<T_GOAL+3.2?celebrate(distOf(k,T)/3.3,{kind:'run'}):celebrate((T-T_GOAL-3.2)*1.1,{kind:'arms'}),wc);}}
 if(a.role==='toone'&&T>T_GOAL+.3){yaw=yawOf(jx-x,jz-z);if(sp<.6)p=blendPose(p,celebrate((T-T_GOAL)*1.1,{kind:'arms'}),sm(T_GOAL+.3,T_GOAL+.8,T));}
 if(a.role==='gk'){const b=ballAt(Math.min(T,T_SHOT));yaw=lerpA(Math.PI,yawOf(b[0]-x,b[2]-z),.6);if(T>T_GOAL-.75)p=blendPose(GK_DIVE(T),keeperSet(T*1.3),sm(T_GOAL+1.6,T_GOAL+2.6,T,easeInOutSine));}
 if(a.role==='eng'&&T>T_GOAL+.6)p=blendPose(p,celebrate((T-T_GOAL)*1.1+k*.3,{kind:'arms'}),sm(T_GOAL+.6,T_GOAL+1.1,T)*clamp(1-(sp-.8)/1.5));
 return{p,yaw};
}

// ---------------------------------------------------------------- the contacts, solved from the bodies; the ball
const PASS_YAW=yawOf(76.4-69.6,-15.1+28);
function skAt(k:number,T:number){const{p,yaw}=poseOf(k,T),[x,z]=posOf(k,T);return solve(p,ACTORS[k].style.build,{x,z,yaw},FIG);}
// ballAt is read by poseOf (the keeper's yaw) before the contacts exist: until solved the ball rests at Daly's feet
let BALL0:V3=[70,.11,-27.6],RECV_PT:V3=[76.8,.11,-14.9],SHOT_PT:V3=[86,.11,-5],SOLVED=false;
/** while she carries it: the ball rolls ahead of her, pushed on again at every right-foot touch (about every 0.6 s) */
function carry(T:number):V3{const[x,z]=posOf(JAMES_I,T),v=velOf(JAMES_I,T),l=Math.hypot(v[0],v[1])||1,ph=((T-T_RECV)/.62)%1,lead=.45+.55*Math.sin(Math.PI*clamp(ph))*(1-ph*.3);
 return[x+v[0]/l*lead+.12*(-v[1]/l),.11,z+v[1]/l*lead+.12*(v[0]/l)];}
/** the strike's line: from her boot to the far corner, bending (a right-foot inside curl bends to her left, so it starts out wide of the
 * straight line toward the far post and swings back in); rising to about 1 m */
const BEND=1.25;
function shotAt(u:number):V3{const b=lerp3(SHOT_PT,TOP,u),dx=TOP[0]-SHOT_PT[0],dz=TOP[2]-SHOT_PT[2],l=Math.hypot(dx,dz),k=BEND*4*u*(1-u);
 return[b[0]+(-dz/l)*k,b[1]+.45*4*u*(1-u),b[2]+(dx/l)*k];}
function ballAt(T:number):V3{
 if(T<0||!SOLVED)return BALL0;
 if(T<T_RECV)return lerp3(BALL0,RECV_PT,T/T_RECV);
 if(T<T_RECV+.35)return lerp3(RECV_PT,carry(T_RECV+.35),sm(T_RECV,T_RECV+.35,T,easeOut));
 if(T<T_SHOT-.4)return carry(T);
 if(T<T_SHOT)return lerp3(carry(T_SHOT-.4),SHOT_PT,sm(T_SHOT-.4,T_SHOT,T,u=>u*(2-u)));
 if(T<T_GOAL)return shotAt((T-T_SHOT)/(T_GOAL-T_SHOT));
 if(T<T_GOAL+.18)return lerp3(TOP,NET,(T-T_GOAL)/.18);
 if(T<T_GOAL+.75)return lerp3(NET,REST,sm(T_GOAL+.18,T_GOAL+.75,T,u=>u*u));
 return REST;
}
{const sp=skAt(PASS_I,0);BALL0=[sp.rToe[0],.11,sp.rToe[2]];
 const sr=skAt(JAMES_I,T_RECV);RECV_PT=[sr.rToe[0],.11,sr.rToe[2]];
 const s2=skAt(JAMES_I,T_SHOT);SHOT_PT=[s2.rToe[0],Math.max(.12,s2.rToe[1]),s2.rToe[2]];SOLVED=true;}

function ball(s:Sheet,x:number,y:number,r:number,rot:number){footballPanels(s,x,y,r,{rot,key:K,shadow:B,seed:3});}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={bg:Pt|null;br:number;james?:DrawResult;gk?:DrawResult;mark?:DrawResult};
function play(s:Sheet,c:Cam,v:View,T:number,Tp:number,Tprev:number,o:{minBall?:number;near?:number;hero?:boolean;after?:(r:PlayOut)=>void;ghost?:(r:PlayOut)=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,T),q=toCam(c,[x,.9,z]);if(q[2]<(o.near??3.5))return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(T),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 const sh=new Path2D();for(const e of list)if(e.h<380)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.14,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg){const hgt=b[1];sh.addPath(polyPath(blob(bground[0],bground[1],br*.9/(1+hgt*.3),br*.28/(1+hgt*.3),2,{amp:.05,n:12}),true));}s.tone(K,sh,.45);
 const out:PlayOut={bg,br};
 type It={d:number;draw:()=>void};const items:It[]=[];
 const behind=c.C[0]>GOAL.x+.5,bk=T>T_GOAL?Math.sin(Math.PI*clamp((T-T_GOAL)/.9)):0;
 items.push({d:behind?-1:depth(c,[106,1.2,0]),draw:()=>goal3(s,c,105,1,behind?.16:.3,bk>0?{z:NET[2],y:NET[1],k:bk}:undefined)});
 if(bg)items.push({d:bq[2],draw:()=>ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11)});
 for(const e of list)items.push({d:e.d,draw:()=>{
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,Tp),px=e.h*ppu,big=e.h>=260;
  // phone heat: low detail for small figures and extras; during a passage only James keeps 'mid'
  const detail=passing?(e.k===JAMES_I?'mid':'low'):px<50||(!a.key&&e.k!==MARK_I&&px<170)?'low':'auto';
  const fast=(e.k===JAMES_I&&T>T_SHOT-.25&&T<T_SHOT+.3)||(e.k===GK_I&&T>T_GOAL-.4&&T<T_GOAL+.3);
  const prv=big&&!passing?poseOf(e.k,Tprev):null;
  const r=drawPlayer(s,p,c,{...a.style,scale:FIG,shadow:e.h<380?false:undefined,detail},{x:e.x,z:e.z,yaw},prv?{prev:prv.p,prevPlace:{x:e.x,z:e.z,yaw:prv.yaw},smear:hero&&fast}:{});
  if(e.k===JAMES_I)out.james=r;if(e.k===GK_I)out.gk=r;if(e.k===MARK_I)out.mark=r;}});
 items.sort((p,q)=>q.d-p.d);
 o.ghost?.(out);
 for(const it of items)it.draw();
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe) */
function streaks(s:Sheet,v:View,amt:number,seed:number){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L,y],[x0+L,y]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks
function groundRing(s:Sheet,c:Cam,x:number,z:number,r:number,w:number,ink=Y){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*r,.01,z+Math.sin(i/36*TAU)*r]);if(q)pts.push(q);}
 if(pts.length<30)return;const rr=ribbon(pts,Math.max(5,c.F*.07/depth(c,[x,0,z])),{close:true,seed:7,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** the ball's path between play times a..b as a bold ribbon with an arrowhead (progress u) */
function flightArrow(s:Sheet,c:Cam,a:number,b:number,u:number,ink:string,wm=.12){if(u<=0)return;const pts:Pt[]=[];let d=10;
 for(let i=0;i<=18;i++){const q=toCam(c,ballAt(lerp(a,b,i/18)));if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<4)return;const line=partial(smoothPts(pts,false,6,2),u),wd=Math.max(7,c.F*wm/d);if(line.length<2)return;
 s.knockout(ribbon(line,wd*1.7,{seed:61,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(line,wd,{seed:61,taper:.1,wobble:.8}),.95);
 const e=line[line.length-1],p0=line[Math.max(0,line.length-3)];if(Math.hypot(e[0]-p0[0],e[1]-p0[1])>1)laneArrow(s,ink,p0,[e[0]+(e[0]-p0[0])*.02,e[1]+(e[1]-p0[1])*.02],wd,{seed:62,head:wd*3});}
/** her carry inside: a bold red arrow on the grass along her path between play times a..b */
function carryArrow(s:Sheet,c:Cam,a:number,b:number,w:number){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<=14;i++){const[x,z]=posOf(JAMES_I,lerp(a,b,i/14)),q=pr(c,[x,.01,z]);if(q)pts.push(q);}
 if(pts.length<5)return;const[mx,mz]=posOf(JAMES_I,(a+b)/2),d=depth(c,[mx,0,mz]),line=partial(smoothPts(pts,false,4,2),w);if(line.length<2)return;const wd=Math.max(5,c.F*.1/d);
 s.knockout(ribbon(line,wd*1.8,{seed:65,taper:.1,wobble:.6}),.8);s.fill(R,ribbon(line,wd,{seed:65,taper:.1,wobble:.6}),.92);laneArrow(s,R,line[Math.max(0,line.length-3)],line[line.length-1],wd,{seed:66,head:wd*2.8});}
function screenRing(s:Sheet,p:Pt|null,r:number,w:number,ink=Y){if(!p||w<=0)return;const pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([p[0]+Math.cos(a)*r*(1+.04*Math.sin(a*3)),p[1]+Math.sin(a)*r]);}
 const rr=ribbon(pts,Math.max(5,r*.16),{close:true,seed:17,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** a ring round her right boot ("onto her right foot" / "your stronger foot") */
function bootRing(s:Sheet,r:DrawResult|undefined,w:number){if(!r)return;const t=r.joints.rToe,a=r.joints.rAn,kn=r.joints.rKn;screenRing(s,[lerp(t[0],a[0],.5),lerp(t[1],a[1],.5)],Math.hypot(kn[0]-a[0],kn[1]-a[1])*.55+6,w);}
/** "look up": a dotted yellow sightline from her eyes to a point */
function sightline(s:Sheet,r:DrawResult|undefined,to:Pt|null,w:number){if(!r||!to||w<=0)return;const h=r.joints.face,n=r.joints.head,hs=Math.hypot(h[0]-n[0],h[1]-n[1])*2.2+6;
 const L=Math.hypot(to[0]-h[0],to[1]-h[1]);if(L<hs)return;const dots=new Path2D(),N=Math.max(3,Math.min(14,Math.floor(L/(hs*1.1))));
 for(let i=1;i<N;i++){const u=i/N;if(u>w)break;const x=lerp(h[0],to[0],u),y=lerp(h[1],to[1],u),rr=hs*.28;dots.addPath(polyPath(blob(x,y,rr,rr,i+5,{amp:.1,n:10}),true));}
 s.knockout(dots,.8);s.fill(Y,dots,.95);}
/** "open your body": a red arc swinging round her hips toward the far corner */
function hipArc(s:Sheet,r:DrawResult|undefined,w:number){if(!r||w<=0)return;const l=r.joints.lHip,rh=r.joints.rHip,cx=(l[0]+rh[0])/2,cy=(l[1]+rh[1])/2,sh=r.joints.neck,rad=Math.hypot(sh[0]-cx,sh[1]-cy)*.75+8;
 const pts:Pt[]=[];for(let i=0;i<=16;i++){const a=Math.PI*(.15+.95*i/16*w);pts.push([cx+Math.cos(a)*rad*1.2,cy+Math.sin(a)*rad*.45]);}
 const rr=ribbon(pts,Math.max(5,rad*.16),{seed:23,taper:.2,wobble:.6});s.knockout(rr,.85);s.fill(R,rr,.92);laneArrow(s,R,pts[pts.length-3],pts[pts.length-1],Math.max(5,rad*.16),{seed:24,head:Math.max(10,rad*.5)});}
/** the far corner lit up: a yellow frame just inside the far post */
function cornerFrame(s:Sheet,c:Cam,w:number){if(w<=0)return;const q=polyP(c,[[105,.3,2.2],[105,1.8,2.2],[105,1.8,3.62],[105,.3,3.62]]);if(q.length<4)return;
 const pts=smoothPts(q,true,4,1),rr=ribbon(pts,Math.max(5,c.F*.06/depth(c,[105,1,3])),{close:true,seed:19,taper:0,wobble:.8});s.knockout(rr,.85*w);s.fill(Y,rr,.95*w);s.tone(Y,polyPath(q,true),.35*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** real time, with the pass struck so the ball goes in just as "and scores" is said */
const kick1=()=>Math.max(CUE(0,'Rachel')-.2,CUE(0,'and scores')-T_GOAL+.15);
const tau1=(t:number)=>clamp(t-kick1(),T0,T1);
const CAM1:V3=[70,29,80];
function cam1(t:number):Cam{
 const T=tau1(t),S=SECS(0),six=CUE(0,'Six minutes');
 // open wide on the floodlit bowl, settle on Daly as she shapes to pass, then follow James and the ball into the box
 const wide:V3=[62,14,-50],pass:V3=[73,.5,-20],b=ballAt(T),bt:V3=[lerp(b[0],90,.3),.6,lerp(b[2],-4,.3)],fin:V3=[96,1,-1.5];
 const toPass=sm(1,six+.2,t,easeInOutSine),follow=sm(-.2,1.2,T,easeInOutSine),finish=sm(T_SHOT-1,T_SHOT+.2,T,easeInOutSine);
 let tg=lerp3(wide,pass,toPass);tg=lerp3(tg,bt,follow);tg=lerp3(tg,fin,finish);
 const F=key(t,mono([[0,2300],[six+.2,5600],[kick1()+.4,5400],[kick1()+T_RECV+.4,6800],[kick1()+T_SHOT,7600],[kick1()+T_GOAL+.8,6800],[S,6600]]),easeInOutSine);
 return look(CAM1,tg,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),T=tau1(t),sc=CUE(0,'and scores');
  stadium(s,c,v,t,{roar:sm(sc-.3,sc+.4,t)*(1-sm(SECS(0)-.6,SECS(0),t)*.4),flash:sm(sc-.2,sc+.3,t)*(1-sm(sc+2.2,sc+2.8,t))});
  ground(s,c);
  play(s,c,v,T,tau1(twos(t)),tau1(twos(t)-1/12),{minBall:7});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(JAMES_I,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.12),12);},
 still:CUE(0,'and scores')+.8,
};

// ---------------------------------------------------------------- 2 · slow replay, low, ahead of her and to her left: the carry inside
const tau2=(t:number)=>key(t,mono([[0,T_RECV-.35],[CUE(1,'carries'),T_RECV+.1],[CUE(1,'across'),2.25],[CUE(1,'right foot'),T_SHOT-.66],[SECS(1),T_SHOT-.42]]),linear);
function cam2(t:number):Cam{
 const S=SECS(1),T=tau2(t),swing=sm(0,S,t,easeInOutSine);
 // low, ahead of her and inside (toward the D), so she runs at the lens as she comes in from the left
 const C:V3=[lerp(92.5,91,swing),lerp(1.9,2.2,swing),lerp(-4.5,-1,swing)];
 const[jx,jz]=posOf(JAMES_I,T),b=ballAt(T);
 return look(C,[lerp(jx,b[0],.3),.95,lerp(jz,b[2],.3)],lerp(1650,1800,swing));
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),T=tau2(t),ca=CUE(1,'carries'),ac=CUE(1,'across'),rf=CUE(1,'right foot'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  play(s,c,v,T,tau2(twos(t)),tau2(twos(t)-1/12),{minBall:5,hero:true,near:2,ghost:()=>{
   // "carries it inside": her path in from the left, a red arrow on the grass
   carryArrow(s,c,T_RECV,T_SHOT-.1,sm(ca-.1,ac+.4,t,easeOut)*(1-sm(E-.9,E-.5,t)));},
   after:({james})=>{
    // "onto her right foot": a yellow ring round her right boot
    bootRing(s,james,sm(rf-.15,rf+.25,t,easeOutBack)*(1-sm(E-.7,E-.4,t)));}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),[x,z]=posOf(JAMES_I,tau2(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.18/q[2]),12);},
 still:CUE(1,'right foot')+.4,
};

// ---------------------------------------------------------------- 3 · slow replay from behind the goal by the far post: past Christensen, the far corner; she races away
const tau3=(t:number)=>{const sf=CUE(2,'she strikes'),pl=CUE(2,'past Lene'),fc=CUE(2,'far corner'),el=CUE(2,'England lead');
 return key(t,mono([[0,T_SHOT-.8],[sf+.3,T_SHOT+.02],[pl+.5,T_GOAL-.3],[fc+.3,T_GOAL+.1],[el,T_GOAL+.8],[SECS(2),T_GOAL+3.4]]),linear);};
const rise3=(t:number)=>sm(CUE(2,'England lead')-.6,CUE(2,'England lead')+.8,t,easeInOutSine);
function cam3(t:number):Cam{
 const T=tau3(t),up=rise3(t),pan=sm(CUE(2,'she strikes')-.2,CUE(2,'far corner')+.2,t,easeInOutSine);
 const C:V3=[111.5-1.5*up,2+2.4*up,6.8+1.5*up],b=ballAt(Math.min(T,T_GOAL)),[jx,jz]=posOf(JAMES_I,Math.min(T,T_SHOT+.2)),[kx,kz]=posOf(JAMES_I,T);
 // long lens on James as she strikes, panning with the ball to the far corner, then off the goal to her celebration
 const tg0:V3=[lerp(jx+.8,lerp(100,b[0],.4),pan),lerp(1,1.1,pan),lerp(jz,lerp(1.5,b[2],.4),pan)],tg1:V3=[kx,1.1,kz];
 return look(C,lerp3(tg0,tg1,up),lerp(lerp(3100,1900,pan),3300,up));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),T=tau3(t),sf=CUE(2,'she strikes'),pl=CUE(2,'past Lene'),fc=CUE(2,'far corner'),el=CUE(2,'England lead'),up=rise3(t);
  stadium(s,c,v,t,{roar:sm(fc,fc+.6,t),flash:sm(el-.3,el+.3,t)});
  ground(s,c);
  play(s,c,v,T,tau3(twos(t)),tau3(twos(t)-1/12),{minBall:5,hero:true,near:1.2,after:({james,gk})=>{
   // "she strikes it": a spark off her right boot at contact
   const age=T-T_SHOT;if(james&&age>-.03&&age<.35){const q=james.joints.rToe;sparkBurst(s,Y,q[0],q[1],c.F*.5/depth(c,SHOT_PT),{n:9,seed:91,g:easeOutBack(clamp((age+.03)/.08))*(1-clamp((age-.2)/.15)),width:Math.max(6,c.F*.04/depth(c,SHOT_PT))});}
   // "past Lene Christensen": a red ring round her reaching glove
   if(gk){const w=sm(pl+.2,pl+.6,t,easeOutBack)*(1-sm(fc+.6,fc+1.1,t)),hi=gk.joints.lHa[1]<gk.joints.rHa[1],hd=hi?gk.joints.lHa:gk.joints.rHa,sh=hi?gk.joints.lSh:gk.joints.rSh;screenRing(s,hd,Math.hypot(hd[0]-sh[0],hd[1]-sh[1])*.55+6,w,R);}
   // the strike's bending line printed as it flies (yellow), and the far corner lit
   flightArrow(s,c,T_SHOT,Math.max(T_SHOT+.01,Math.min(T,T_GOAL)),sm(sf,sf+.3,t)*(1-sm(el-.5,el-.1,t)),Y,.09);
   cornerFrame(s,c,sm(fc-.1,fc+.3,t,easeOutBack)*(1-sm(el-.4,el,t)));}});
  // "England lead one-nil!": red and white confetti over the celebration
  if(up>.2){const k=sm(el,el+.8,t),fall=(t-el)*260;for(const[sd,off] of [[7,0],[8,.5]] as [number,number][]){const y0=-v.hy*2.2+((fall+off*v.hy*2)%(v.hy*2.4));confetti(s,[R,'paper',B],[-v.hx,y0,v.hx*2,v.hy*1.6],Math.round(30*k),sd,{size:32,cov:.95});}}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(JAMES_I,tau3(t)),q=toCam(c,[x,1.1,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(10,c.F*.3/q[2]),12);},
 still:CUE(2,'far corner')+.3,
};

// ---------------------------------------------------------------- 4 · the lesson: high behind James, the goal at the top of the frame
const tau4=(t:number)=>{const ci=CUE(3,'cut inside'),sf=CUE(3,'stronger'),lu=CUE(3,'Look up'),ob=CUE(3,'open your'),cb=CUE(3,'curl the'),fc=CUE(3,'far corner');
 return key(t,mono([[0,T_RECV-.2],[ci,T_RECV],[ci+1.1,2.3],[sf+.5,T_SHOT-.6],[lu+.3,T_SHOT-.4],[ob+.4,T_SHOT-.12],[cb,T_SHOT],[fc+.4,T_GOAL+.05],[SECS(3),T_GOAL+.8]]),linear);};
function cam4(t:number):Cam{
 const push=sm(CUE(3,'cut inside')-.2,CUE(3,'Look up'),t,easeInOutSine),back=sm(CUE(3,'curl the')-.3,SECS(3),t,easeInOutSine);
 const C:V3=[71.5+4*push-1.5*back,7-1.4*push+1*back,-24+2.5*push-.8*back];
 const tg:V3=[88.5+2*push+3.5*back,1,-5+1.2*push+1.8*back];
 return look(C,tg,2300+500*push-350*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),T=tau4(t),ci=CUE(3,'cut inside'),sf=CUE(3,'stronger'),lu=CUE(3,'Look up'),ob=CUE(3,'open your'),cb=CUE(3,'curl the'),fc=CUE(3,'far corner'),E=SECS(3);
  stadium(s,c,v,t,{roar:sm(fc+.3,fc+.8,t)});
  ground(s,c);
  play(s,c,v,T,tau4(twos(t)),tau4(twos(t)-1/12),{minBall:6,near:3,hero:true,ghost:()=>{
   // "cut inside": her path in from the left, a bold red arrow on the grass
   carryArrow(s,c,T_RECV,T_SHOT-.1,sm(ci-.1,ci+.7,t,easeOut)*(1-sm(E-1,E-.6,t)));},
   after:({james})=>{
    bootRing(s,james,sm(sf-.1,sf+.3,t,easeOutBack)*(1-sm(lu+.2,lu+.5,t)));
    // "look up": her sightline to the far corner
    sightline(s,james,pr(c,[105,1,3.1]),sm(lu-.1,lu+.5,t)*(1-sm(cb+.2,cb+.6,t)));
    // "open your body": the hips swing round toward the far corner
    hipArc(s,james,sm(ob-.1,ob+.5,t,easeOut)*(1-sm(cb+.3,cb+.7,t)));
    // "curl the ball into the far corner": the bending path and the corner lit, a burst in the net
    flightArrow(s,c,T_SHOT,Math.max(T_SHOT+.01,Math.min(T,T_GOAL)),sm(cb-.1,cb+.3,t)*(1-sm(E-.7,E-.4,t)),Y,.12);
    cornerFrame(s,c,sm(fc-.2,fc+.2,t,easeOutBack)*(1-sm(E-.8,E-.5,t)));
    const age=T-T_GOAL;if(age>-.03&&age<.6){const q=pr(c,TOP);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.7/depth(c,TOP),{n:10,seed:93,g:easeOutBack(clamp((age+.03)/.1))*(1-clamp((age-.4)/.2)),width:Math.max(6,c.F*.05/depth(c,TOP))});}}});
 },
 still:CUE(3,'curl the')+.6,
};

const film:RisoStory={
 id:'lauren-james-signature',format:'11v11',title:'James’s curler from the edge',theme:'Cut inside onto your stronger foot, then curl the ball into the far corner',
 ageNote:'Women’s World Cup, England v Denmark, Sydney Football Stadium, 28 July 2023. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff4c3b',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a yellow spark and a little burst of red-and-white confetti where you tap. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const g=easeOutBack(clamp(age/.3))*(1-clamp((age-.5)/.3));if(g>0)sparkBurst(s,Y,x,y,110,{n:9,seed,g,width:14});
  if(age<.9){const u=easeOut(clamp(age/.6)),r=80+160*u;confetti(s,[R,'paper',B],[x-r,y-r*.8+120*age*age,r*2,r*1.4],10,seed+1,{size:18*(1-clamp((age-.6)/.3))+2,cov:.95});}},
};
export default film;
/** Solved contact points (pitch metres; X to Denmark's goal line at 105, Z across; the far post of her shot at Z = +3.66) — checked by the test. */
export const FACTS={BALL0,RECV_PT,SHOT_PT,TOP,GOAL,ballAt,T_RECV,T_SHOT,T_GOAL,BEND,
 jamesAt:(T:number)=>posOf(JAMES_I,T),dalyAt:(T:number)=>posOf(PASS_I,T),toone:(T:number)=>posOf(TOONE_I,T),
 keeperHands:(T:number)=>{const sk=skAt(GK_I,T);return[sk.lHa,sk.rHa];},
 jamesToes:(T:number)=>{const sk=skAt(JAMES_I,T);return{l:sk.lToe,r:sk.rToe};}};
