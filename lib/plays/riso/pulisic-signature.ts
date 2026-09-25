/** Christian Pulisic — "Signature: attacking the defender head-on". Premier League, Burnley 2–4 Chelsea, Turf Moor, Burnley, Saturday
 * 26 October 2019 (kick-off 5.30pm): the 21st-minute opener, his first goal for Chelsea (the first of a "perfect" hat-trick). An iconic-play
 * riso film (RisoStory, chapters mode): a 1:1 reconstruction from written accounts (the footage was not reviewed), printed as a riso sheet.
 * WHY THIS MOMENT: the signature is running straight at defenders so THEY have to decide and he gets to react. In this goal he attacked
 *  two Burnley defenders in turn — he caught Matt Lowton in possession and went straight on, then ran at James Tarkowski, who pushed him
 *  wide, and he darted past him and scored. Two defenders beaten, a finish from inside the box (the entry's template: left side, beaten 2).
 *  The lesson (iconicPlays.json): "Run straight at defenders; they have to decide, and you get to react."
 *
 * SOURCES (read Sept 2026 as raw pages, cached in the session scratchpad films/src-cache/):
 *  - The Guardian, Richard Jolly, "Christian Pulisic's hat-trick fires Chelsea to seventh consecutive victory" (26 Oct 2019)
 *    https://www.theguardian.com/football/2019/oct/26/burnley-chelsea-premier-league-match-report
 *    ("His opener was all of his own making ... He caught Matt Lowton dawdling in possession and surged away. He had the skill to dart past
 *    James Tarkowski and his angled shot went through Ben Mee's legs"; "scored with his left foot, his right and his head")
 *  - The Guardian, Rob Smyth, "Burnley 2-4 Chelsea: Premier League – as it happened" (26 Oct 2019), pages 1 and 2
 *    https://www.theguardian.com/football/live/2019/oct/26/burnley-v-chelsea-premier-league-live
 *    ("GOAL! Burnley 0-1 Chelsea (Pulisic 21)"; "It was a bad mistake from Lowton, who was caught in two minds and lost the ball to Pulisic
 *    just past the halfway line. He scurried into the penalty area, and although Tarkowski seemed to have pushed him wide, Pulisic managed
 *    to thread a low left-footed shot back across goal and into the corner"; "Burnley, in claret and blue, kick off from left to right as
 *    we watch. Chelsea are in white"; a reader: "Chelsea are playing in white shirts and shorts with blue socks"; team news (4-4-2 Pope;
 *    Lowton, Tarkowski, Mee, Pieters; Hendrick, Cork, Westwood, McNeil; Rodriguez, Barnes — 4-3-3 Arrizabalaga; Azpilicueta, Zouma,
 *    Tomori, Alonso; Kovacic, Jorginho, Mount; Willian, Abraham, Pulisic); referee Michael Oliver; "Kick off is at 5.30pm"; "wet conditions")
 *  - NBC Sports / Yahoo Sports, Nicholas Mendola, "Pulisic bags hat trick as Chelsea doubles up Burnley" (26 Oct 2019, web.archive.org copy)
 *    ("seizing on a bad touch from Matthew Lowton and dribbling James Tarkowski before rolling a low shot across goal past Nick Pope. A
 *    quality strike to beat two quality players"; "He let out a primal scream in celebration"; his second came "cooking Tarkowski to his
 *    other side")
 *  - Wikipedia, "Christian Pulisic" (first Chelsea goals 26 Oct 2019, a perfect hat-trick at Burnley, youngest hat-trick scorer in
 *    Chelsea's history; height 1.78 m) and "2019–20 Burnley F.C. season" (kit template: claret body, sky-blue sleeves, white shorts).
 * CONFIRMED by those accounts: match, date, venue, score, 21st minute, 0–1; a 5.30pm kick-off in late October (the goal ≈ 5.51pm: dusk,
 *  floodlights) on a wet evening; Lowton lost the ball to Pulisic just past halfway (caught in two minds / a bad touch); Pulisic went
 *  straight on into the box; Tarkowski confronted him and pushed him wide; Pulisic dribbled (darted) past Tarkowski; a LOW, LEFT-FOOTED
 *  shot back ACROSS goal into the corner, through Ben Mee's legs, past Nick Pope; a primal scream to celebrate. KITS: Chelsea in white
 *  shirts and shorts with blue socks; Burnley in claret and (sky) blue — claret body, sky-blue sleeves, white shorts. Line-ups (Pulisic
 *  on the left of Chelsea's front three, so opposite Burnley's right-back Lowton), referee Michael Oliver. First half: Burnley kicked off
 *  left to right as TV watched, so Chelsea attack RIGHT TO LEFT on the broadcast.
 * WIDELY KNOWN, NOT RE-READ THIS SESSION: Pulisic wore 22 in 2019–20 (Willian had 10); his short light-brown hair.
 * INFERRED (illustrative): every position and timing in metres and seconds (≈ 38 m from the steal to the shot in ≈ 7 s); the exact spot
 *  of the steal (drawn in Burnley's half, near the near touchline side of centre, as Chelsea attack on Pulisic's left flank = the side under
 *  the main camera); how he took it (drawn: pressing Lowton head-on and nicking the ball off his toe, then past him on the inside); which
 *  way he went past Tarkowski (drawn: Tarkowski showing him outside, a feint in, then the dart outside him — "pushed him wide"); which
 *  foot he dribbled with (drawn: left; never narrated); the corner of the finish (drawn: the far post, low, Pope diving to his left);
 *  Pope's goalkeeper kit colours (yellow, navy shorts); Mee's spot (drawn sliding across on the ball's line); the other players' positions;
 *  the ball design; the referee's dark kit; Turf Moor drawn as four close single-tier roofed stands with claret seats and the away fans
 *  (Chelsea blue) behind one goal; the camera placements; the celebration run to the near corner.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe): 1 = the high main-stand camera, near real
 *  time, panning with the ball under the floodlights; 2 = slow-motion replay from a low touchline camera, side-on to the duel: a red arrow
 *  straight at Tarkowski (head on), two yellow option lanes at the defender (he has to decide), the inside lane blocked and the outside lit
 *  (he pushes him wide), a spark where Pulisic reacts and the red path of the dart; 3 = replay from behind the goal: the left-foot shot,
 *  a yellow line of the ball back across goal, a ring at Mee's legs, past Pope, then a swing round to the scream; 4 = the lesson from low
 *  behind Pulisic, over his shoulder, running at Tarkowski (the same marks). All figures are the shared riso athlete (athlete.ts), routed
 *  through ONE adapter, drawPlayer() (which also prints Burnley's claret and sky-blue sleeves). Scenes read only (t, c); every action keys
 *  off cue times, so the recorded voice (withTiming) re-times the film; every random value is seeded. Budget ≈ 200–320 plate ops. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,dribble,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`pulisic film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead runs scripts/plays/kokoro-narrate.py pulisic-signature (writes timing.json next to script.json). Then
 * replace this null with `import timingJson from '../../../public/plays/narration/pulisic-signature/timing.json'` and pass
 * `timingJson as NarrationTiming`: withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself. */
import timingJson from '../../../public/plays/narration/pulisic-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('The goal, live','Burnley versus Chelsea, 2019. Christian Pulisic steals the ball and runs straight at the defence. Tarkowski steps up. Pulisic darts past, into the box... goal!',
  ['Burnley versus Chelsea','Christian Pulisic','steals the ball','runs straight at','Tarkowski steps up','Pulisic darts past','into the box','goal']),
 prov('Slow motion','Slow motion: he attacks Tarkowski head on. The defender has to decide, so he pushes him wide. Pulisic reacts and darts past.',
  ['Slow motion','he attacks','Tarkowski head on','The defender','has to decide','pushes him wide','Pulisic reacts','darts past']),
 prov('The finish','Then a low shot with his left foot, across goal, through Ben Mee\'s legs, past Nick Pope!',
  ['Then a low shot','his left foot','across goal','through Ben','past Nick Pope']),
 prov('Your turn','Your turn: run straight at defenders. They have to decide, then you react and go past.',
  ['Your turn','run straight','defenders','They have to decide','you react','go past']),
],VOICE);
/** onset of the cue whose words start with w in chapter i */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('pulisic: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (Chelsea attack −X this half: Burnley's goal line at X = 0, on the
 * LEFT of the broadcast), Y up, Z across (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing −X has
 * its LEFT side at +Z, so Chelsea's left winger works the near side. */
type Cam=Projector&{C:V3;F:number;f:V3;r:V3;u:V3};
const NEAR=.4;
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const nrm3=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const cross3=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
/** a camera at C looking at T with focal length F (sheet units); +screen x = cross(forward, up) */
function look(C:V3,T:V3,F:number):Cam{const f=nrm3(sub3(T,C)),r=nrm3(cross3(f,[0,1,0])),u=cross3(r,f);
 return{C,F,f,r,u,eye:C,
  project(p:V3):[number,number,number]{const d=sub3(p,C),z=Math.max(NEAR,dot3(d,f));return[F*dot3(d,r)/z,-F*dot3(d,u)/z,z];},
  scale(p:V3){return F/Math.max(NEAR,dot3(sub3(p,C),f));}};}
function toCam(c:Cam,P:V3):V3{const d=sub3(P,c.C);return[dot3(d,c.r),dot3(d,c.u),dot3(d,c.f)];}
const scr=(c:Cam,q:V3):Pt=>[c.F*q[0]/q[2],-c.F*q[1]/q[2]];
function pr(c:Cam,P:V3):Pt|null{const q=toCam(c,P);return q[2]<NEAR?null:scr(c,q);}
/** project a polygon, clipped against the near plane */
function polyP(c:Cam,pts:V3[]):Pt[]{const q=pts.map(p=>toCam(c,p)),out:V3[]=[];
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],ia=a[2]>=NEAR,ib=b[2]>=NEAR;if(ia)out.push(a);if(ia!==ib){const k=(NEAR-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,NEAR]);}}
 return out.map(p=>scr(c,p));}
/** a 3D segment as a projected quad (near-clipped); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(1.1,c.F*wm/qa[2]/2),wb=Math.max(1.1,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const inView=(v:View,p:Pt,m=0)=>Math.abs(p[0])<v.hx+m&&Math.abs(p[1])<v.hy+m;
/** a projected quad only when it is comfortably in front of the camera */
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- Turf Moor at dusk: four close single-tier roofed stands, floodlights
const CX=52.5,NS=64;
/** a point on the (nearly rectangular) stand ring: angle th round the pitch centre, d metres out from the inner edge, height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(56+d)*Math.sign(c)*Math.pow(Math.abs(c),.14),y,(38+d)*Math.sign(s)*Math.pow(Math.abs(s),.14)];}
const TIER=(b:number):[number,number]=>[1.5+24*b,1.2+13*b];
type Ring={tier:V3[][];roof:V3[][];fascia:V3[][];lamps:V3[];seats:{P:V3;h:number;away:boolean}[]};
const RING:Ring=(()=>{const o:Ring={tier:[],roof:[],fascia:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=TIER(0),[d1,y1]=TIER(1);
  o.tier.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  o.roof.push([rim(a,21,19.2),rim(b,21,19.2),rim(b,34,18),rim(a,34,18)]);
  o.fascia.push([rim(a,21,18.2),rim(b,21,18.2),rim(b,21,19.4),rim(a,21,19.4)]);
  if(i%2===0)o.lamps.push(rim(a+.5/NS*TAU,21,17.9));
  // the Chelsea fans: a block behind the goal Chelsea defend this half (+X end; inferred)
  const away=(i>=62||i<=2);
  for(let r=0;r<9;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,19);if(h<.14)continue;
   const[d,y]=TIER((r+.5)/9);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,away});}}
 return o;})();
/** everything behind the pitch: a Lancashire dusk sky, the claret stands, the crowd (roar lifts the seat marks), the floodlight row */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number}={}){
 const{roar=0}=o;
 // late October, ≈ 5.50pm: the last light, a deep blue-navy sky
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.5);s.tone(K,rectPath(-1e4,-1e4,2e4,2e4),.42);
 const tier=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};add(RING.tier[i],tier);add(RING.roof[i],roof);add(RING.fascia[i],fas);}
 // claret seats (red × navy)
 s.knockout(tier);s.tone(R,tier,.62);s.tone(K,tier,.4);
 // the crowd: one mark per seat group, sized by distance; faces (paper), claret, dark coats, the Chelsea-blue away block
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of RING.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,13),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.away?(q.h<.4?0:q.h<.85?2:3):q.h<.36?0:q.h<.7?1:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.6);s.fill(R,inks[1],.85);s.fill(B,inks[2],.9);s.fill(K,inks[3],.8);
 s.knockout(roof);s.tone(K,roof,.8);s.tone(B,roof,.3);
 s.knockout(fas);s.fill(K,fas,.6);
 // the floodlight row under the roof edge: bright yellow lamps
 const lp=new Path2D();let n=0;for(const L of RING.lamps){const d=toCam(c,L);if(d[2]<14)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*1.1/d[2],3,22);lp.rect(p[0]-z,p[1]-z*.4,z*2,z*.8);n++;}
 if(n){s.knockout(lp);s.fill(Y,lp,.95);}
}
/** the surround, wet grass (yellow × blue) under lights with mowing stripes, LED boards, paper lines, both goals (the Burnley goal at
 * X = 0 drawn later when it is in front of the players, i.e. from the camera behind it) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;ballY?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-9,0,-40],[114,0,-40],[114,0,40],[-9,0,40]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.fill(Y,p,.7);s.tone(B,p,.85);s.tone(K,p,.3);}
 const g=polyP(c,[[-5,0,-37],[110,0,-37],[110,0,37],[-5,0,37]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.86);s.tone(K,gp,.06);
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-37],[(k+1)*5.25,0,-37],[(k+1)*5.25,0,37],[k*5.25,0,37]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 // LED boards: far touchline and behind both goals, navy with paper and blue panels
 const bd=new Path2D(),pn=new Path2D(),pb=new Path2D();
 for(const q of [polyP(c,[[-4,0,-36.5],[109,0,-36.5],[109,.9,-36.5],[-4,.9,-36.5]]),polyP(c,[[108,0,-36],[108,0,36],[108,.9,36],[108,.9,-36]]),polyP(c,[[-3,0,36],[-3,0,-36],[-3,.9,-36],[-3,.9,36]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.25,-36.45],[x+3.4,.25,-36.45],[x+3.4,.65,-36.45],[x,.65,-36.45]]);if(q.length>2)(k%2?pb:pn).addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-34+k*6.4,q=polyP(c,[[-2.95,.25,z],[-2.95,.25,z+3.4],[-2.95,.65,z+3.4],[-2.95,.65,z]]);if(q.length>2)(k%2?pb:pn).addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(K,bd,.92);s.knockout(pn,.85);s.fill(B,pb,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,105,1,0,0,1);
 if(!o.goalLater)goal3(s,c,0,-1,o.bulge??0,o.ballZ??-3,o.ballY??.3);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep (direction d); bulge pushes the back out around (ballZ, ballY) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number,by:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y=1)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2))*Math.exp(-Math.pow((y-by)/1.4,2)));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],[back(z1,1.9),1.9,z1],...zs.slice(1,-1).reverse().map(z=>[back(z,1.9),1.9,z] as V3),[back(z0,1.9),1.9,z0]],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes){const q=polyP(c,P);if(q.length>2)net.addPath(polyPath(q,true));}
 s.knockout(net,.3);
 const mesh=new Path2D();
 for(let i=0;i<=12;i++){const z=lerp(z0,z1,i/12);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.025,mesh);for(let j=0;j<3;j++){const ya=1.9*(1-j/3),yb=1.9*(1-(j+1)/3);seg3(c,[back(z,ya),ya,z],[back(z,yb),yb,z],.025,mesh);}}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<4;i++){const za=zs[i],zb=zs[i+1];seg3(c,[back(za,y),y,za],[back(zb,y),y,zb],.025,mesh);}seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.025,mesh);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.025,mesh);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+d*2*u,H-.54*u,z0],[X+d*2*u,H-.54*u,z1],.025,mesh);}
 s.fill(K,mesh,.75);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.19,fo);seg3(c,[X,0,z1],[X,H,z1],.19,fo);seg3(c,[X,H,z0],[X,H,z1],.19,fo);s.stroke(K,fo,2.5,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- kits (athlete styles)
const SKIN_L:InkFill[]=[[Y,.3],[R,.2]];
const SKIN_T:InkFill[]=[[Y,.4],[R,.3],[K,.08]];
const SKIN_D:InkFill[]=[[R,.42],[K,.5]];
/** Chelsea 2019–20 change kit (confirmed: white shirts and shorts, blue socks); blue numbers and trim (inferred) */
const CHE=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:B,boots:K,trim:B,skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:B,seed:3,...o});
/** Christian Pulisic: number 22, 1.78 m, slim and quick, short light-brown hair */
const PULISIC_STYLE=CHE({number:22,build:{height:1.78,bulk:.95,thighs:1.05},hair:[K,.6],seed:22});
/** Burnley 2019–20 home (confirmed: claret and blue): a claret body (red, deepened with navy by the adapter), sky-blue sleeves (printed by
 * the adapter), white shorts, white socks with claret tops (tops inferred) */
const BUR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:'paper',socks:'paper',boots:K,trim:[B,.6],skin:SKIN_L,hair:K,hairStyle:'short',line:K,numberInk:'paper',shade:[K,.45],seed:5,...o});
/** Nick Pope: goalkeeper kit colours inferred (yellow shirt, navy shorts) */
const POPE:AthleteStyle={shirt:[Y,.95],shorts:[K,.85],socks:[Y,.95],boots:K,skin:SKIN_L,hair:[K,.7],hairStyle:'short',line:K,gloves:'paper',sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.91},seed:51};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN_L,hair:[K,.5],hairStyle:'bald',line:K,seed:12};
const CLARET=new WeakSet<AthleteStyle>();
const bur=(o:Partial<AthleteStyle>={})=>{const st=BUR(o);CLARET.add(st);return st;};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose one drawing earlier (secondary motion: hair and hem trail); smear = a halftone echo + speed lines for fast limbs.
 * Burnley's claret and sky blue: the athlete prints one shirt ink, so after the body the adapter overprints navy on the torso (red × navy
 * = claret) and prints the upper arms sky blue (only the arms on the camera side of the chest, so a sleeve never prints over the torso it
 * is behind). */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:Pose;smear?:boolean;claret?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev,pose,camera,style,place,{threshold:10});
 const r=drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev}:{});
 if(o.claret&&r.detail!=='low'&&r.heightPx>40){const sk=r.sk,J=r.joints,dc=camera.project(sk.chest)[2],w=Math.hypot(J.head[0]-J.neck[0],J.head[1]-J.neck[1])*.62+1.5;
  const mid=(a:Pt,b:Pt,u:number):Pt=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)];
  const tor=[mid(J.lSh,J.lHip,.08),mid(J.rSh,J.rHip,.08),mid(J.rHip,J.rSh,.12),mid(J.lHip,J.lSh,.12)];
  s.tone(K,ribbon([mid(tor[0],tor[1],.5),mid(tor[3],tor[2],.5)],Math.hypot(tor[0][0]-tor[1][0],tor[0][1]-tor[1][1])*.8+w*.4,{taper:0,wobble:.3,seed:9}),.38);
  const p=new Path2D();let n=0;
  for(const [sh,el] of [['lSh','lEl'],['rSh','rEl']] as const){if(camera.project(sk[sh])[2]>dc+.06)continue;const a=J[sh],b=J[el];
   p.addPath(ribbon([mid(a,b,-.08),mid(a,b,.62)],w,{taper:0,wobble:.3,seed:7}));n++;}
  if(n){s.knockout(p,.95);s.tone(B,p,.55);}}
 return r;
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after the steal)
type Role='pulisic'|'bur'|'gk'|'che'|'ref';
/** a keyed move: lunge (full reach at `at`), a keeper dive (full stretch at `at`) */
type Move={kind:'lunge'|'dive';at:number;dur:number;side:'l'|'r'};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The Burnley players named in the accounts get the beats the accounts give
 * them (Lowton losing the ball, Tarkowski stepping up and pushing him wide, Mee's legs, Pope); where exactly each stood is inferred. */
const SHOT=7.1,IN_NET=SHOT+.72;
const ACTORS:Actor[]=[
 {name:'Pulisic',role:'pulisic',style:PULISIC_STYLE,key:true,keys:[[-3,59,15.2],[-2,57.2,16.6],[-1,54.2,18.4],[-.4,51.6,19.4],[0,50.05,19.75],[.4,48.9,19.45],[.9,46.7,19.1],[1.5,43.3,18.6],[2.2,39.2,17.6],[3,34.4,16.3],[3.8,29.6,15],[4.5,25.4,13.8],[5,22.4,12.8],[5.3,20.7,12.1],[5.55,19.5,11.7],[5.85,18.1,12.3],[6.2,16.5,13.2],[6.6,14.6,13.3],[7,12.9,12.9],[7.4,11.8,12.9],[8.2,10.6,14.8],[9.5,9.2,19],[11,7.8,23.5],[13,6.6,27],[16,6,28]]},
 {name:'Lowton',role:'bur',style:bur({seed:2,number:2}),key:true,engage:[-1.2,.3],moves:[{kind:'lunge',at:.05,dur:.7,side:'l'}],keys:[[-3,44.2,22.2],[-1.5,46.6,21.4],[-.5,48.3,21],[0,48.9,20.9],[.4,49.1,21.2],[.9,48.6,21.5],[1.6,46.2,20.9],[2.6,41.2,19.6],[4,33.6,17.4],[5.5,25.6,15.2],[7,18,14.4],[8.5,13.6,15],[16,12,16]]},
 {name:'Tarkowski',role:'bur',style:bur({seed:5,number:5,build:{height:1.85,bulk:1.08}}),key:true,engage:[3.6,6],moves:[{kind:'lunge',at:5.8,dur:.8,side:'r'}],keys:[[-3,27,3.5],[0,27.5,5.5],[2,27,8],[3.5,24.6,9.6],[4.5,22.3,10.5],[5.2,20.5,10.9],[5.6,19.7,11.1],[6.2,19.1,11.4],[6.9,17.2,11.8],[7.6,14.6,11.8],[9,12,12.4],[16,11,13]]},
 {name:'Mee',role:'bur',style:bur({seed:6,number:6}),key:true,keys:[[-3,24,-4],[2,22,-1],[4,17,2],[5.5,12.6,4.6],[6.5,9.8,6.2],[7,8.6,7],[7.3,8.1,7.3],[8,7.9,7.2],[16,7.6,6.6]]},
 {name:'Pope',role:'gk',style:POPE,key:true,moves:[{kind:'dive',at:SHOT+.6,dur:.85,side:'l'}],keys:[[-3,4,.8],[3,3,2.6],[5.5,2.1,4.4],[6.8,1.7,5.2],[7.1,1.6,5.3],[16,1.6,5.3]]},
 {name:'Pieters',role:'bur',style:bur({seed:23,build:{height:1.84}}),keys:[[-3,24,-17],[4,15,-10],[8,9,-5],[16,8,-4]]},
 {name:'Hendrick',role:'bur',style:bur({seed:13,skin:SKIN_L}),keys:[[-3,44,10],[3,36,9],[8,22,7],[16,16,6]]},
 {name:'Cork',role:'bur',style:bur({seed:4}),keys:[[-3,46,1],[3,38,2],[8,24,1],[16,18,0]]},
 {name:'Westwood',role:'bur',style:bur({seed:18}),keys:[[-3,47,-8],[3,40,-6],[8,27,-4],[16,20,-3]]},
 {name:'McNeil',role:'bur',style:bur({seed:11}),keys:[[-3,48,-20],[3,42,-17],[8,32,-12],[16,26,-10]]},
 {name:'Barnes',role:'bur',style:bur({seed:10}),keys:[[-3,56,4],[6,48,3],[16,40,2]]},
 {name:'Rodriguez',role:'bur',style:bur({seed:19}),keys:[[-3,58,-6],[6,50,-5],[16,42,-4]]},
 {name:'Abraham',role:'che',style:CHE({seed:9,skin:SKIN_D,build:{height:1.9}}),keys:[[-3,30,1],[2,29,2],[4.5,22,4],[6.5,14,3],[8,10,2],[11,9,14],[16,8,24]]},
 {name:'Willian',role:'che',style:CHE({seed:10,skin:SKIN_T}),keys:[[-3,34,-20],[4,26,-15],[7.5,17,-10],[16,12,-6]]},
 {name:'Mount',role:'che',style:CHE({seed:19}),keys:[[-3,50,-4],[3,42,-1],[7,30,2],[16,20,8]]},
 {name:'Alonso',role:'che',style:CHE({seed:3}),keys:[[-3,64,26],[3,52,24],[8,38,22],[16,26,22]]},
 {name:'Kovacic',role:'che',style:CHE({seed:17}),keys:[[-3,60,8],[8,48,6],[16,40,6]]},
 {name:'Jorginho',role:'che',style:CHE({seed:5}),keys:[[-3,66,-6],[8,56,-4],[16,48,-2]]},
 {name:'referee',role:'ref',style:REF,keys:[[-3,56,-4],[6,40,-2],[12,28,2],[16,24,4]]},
];
const PU=0,LOW_I=1,TARK=2,MEE=3,POPE_I=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-3,T1=16,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Lowton's dawdle, the steal, left-foot touches, the shot
/** his dribble stride: one left-foot touch per cycle of CYC metres (the touch lands at the gait's touchPhase) */
const CYC=2.3;
/** the touches: every stride, plus the forced beats — the steal, the knock past Lowton, the feint in and the dart out past Tarkowski */
const TOUCHES:number[]=(()=>{const forced=[0,.4,5.3,5.72,6.15],out:number[]=[];let prev=distOf(PU,0)/CYC-touchPhase;
 for(let tau=DT;tau<SHOT-.3;tau+=DT){const ph=distOf(PU,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&forced.every(f=>Math.abs(f-tau)>.22)&&(!out.length||tau-out[out.length-1]>.22))out.push(tau);prev=ph;}
 return[...out,...forced].sort((a,b)=>a-b).concat([SHOT]);})();
function yawPU(tau:number):number{const v=velOf(PU,tau);return Math.hypot(v[0],v[1])>.4?yawOf(v[0],v[1]):Math.PI;}
/** his forward and left directions on the ground (x, z) */
const fwdL=(tau:number):[Pt,Pt]=>{const y=yawPU(tau);return[[Math.cos(y),-Math.sin(y)],[-Math.sin(y),-Math.cos(y)]];};
/** ball spot for the left foot: ahead and a touch to his left */
const footAt=(tau:number):[number,number]=>{const p=posOf(PU,tau),[f,l]=fwdL(tau);return[p[0]+f[0]*.5+l[0]*.14,p[1]+f[1]*.5+l[1]*.14];};
const TP=TOUCHES.map(footAt);
const S0=TP[TP.length-1];
/** the far corner, low: over the line at z ≈ −3.1, then into the side netting */
const NET:V3=[-1.55,.24,-3.15],REST:V3=[-1.8,.11,-2.5];
/** Lowton's ball before the steal: at his toe, ahead of him as he dawdles upfield */
const lowBall=(tau:number):[number,number]=>{const p=posOf(LOW_I,tau);return[p[0]+.55,p[1]-.5];};
function ballAt(tau:number):V3{
 if(tau<-.25){const b=lowBall(tau);return[b[0],.11,b[1]];}
 if(tau<0){const a=lowBall(-.25),u=(tau+.25)/.25;return[lerp(a[0],TP[0][0],u),.11,lerp(a[1],TP[0][1],u)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(S0[0],NET[0],u),.11+(NET[1]-.11)*u*u+.08*Math.sin(Math.PI*u),lerp(S0[1],NET[2],u)];}
 const u=clamp((tau-IN_NET)/.5),e=1-(1-u)*(1-u);return[lerp(NET[0],REST[0],e),lerp(NET[1],REST[1],e)+.2*Math.sin(Math.PI*clamp(u*1.6))*(1-u),lerp(NET[2],REST[2],e)];
}
/** Mee on the ball's line: his last keys are laid on the shot line (so the ball really goes through his legs); his table is rebuilt */
{const zOn=(x:number)=>S0[1]+(NET[2]-S0[1])*(S0[0]-x)/(S0[0]-NET[0]),a=ACTORS[MEE];
 a.keys=[[-3,24,-4],[2,22,-1],[4,17,2],[5.5,12.6,zOn(12.6)-2.4],[6.5,9.8,zOn(9.8)-.9],[7,8.6,zOn(8.6)-.15],[7.3,8.2,zOn(8.2)],[8,8,zOn(8.2)-.1],[16,7.7,zOn(8.2)-.6]];
 const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}TABLES[MEE]={X,Z,D};}
/** when the ball passes Mee (X = his X at the shot) */
const MEE_T=SHOT+(IN_NET-SHOT)*clamp((S0[0]-posOf(MEE,SHOT+.2)[0])/(S0[0]-NET[0]));
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the head-on run: chest up, eyes on the defender, arms loose and wide for balance */
const ATTACK:Partial<Pose>={lean:14,neckP:-4,lShA:30,rShA:30,squash:-.02};
/** the cut: body dropped and tilted into the turn, the far arm out */
const CUT=(dir:number):Partial<Pose>=>({roll:10*dir,bend:12*dir,lean:24,lKnee:58,rKnee:54,lShA:dir>0?30:74,rShA:dir>0?74:30,neckY:10*dir,squash:-.05});
/** Mee's block: legs wide, knees bent (the ball goes through them) */
const SPLIT:Partial<Pose>={lHipA:28,rHipA:28,lKnee:44,rKnee:44,lHipF:30,rHipF:30,lean:22,lShA:40,rShA:40,lElb:30,rElb:30,neckP:18,squash:-.05};
/** Lowton caught in two minds: upright, a half-turn of the head, arms out */
const DITHER:Partial<Pose>={lean:6,neckP:10,neckY:20,lShA:30,rShA:30,lKnee:20,rKnee:20};
/** the primal scream: fists clenched, chest out, head back */
const SCREAM:Partial<Pose>={lShA:70,rShA:70,lShF:10,rShF:10,lElb:100,rElb:100,lHand:0,rHand:0,lean:-14,neckP:-34,lKnee:30,rKnee:30,lHipF:22,rHipF:22};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(PU,tau),b=ballAt(tau);
 let yaw=sp>.4?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),.8*Math.min(sm(a.engage[0],a.engage[0]+.4,tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk'&&tau>2)yaw=yawOf(b[0]-x,b[2]-z);
 if(k===MEE&&tau>5.5)yaw=yawOf(b[0]-x,b[2]-z);
 if(k===PU)yaw=yawPU(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='bur'?READY:stand();
 if(k===PU){// quick dribbling strides (left foot), long and fast once he is away
  const s=clamp((sp-2)/4.5),dr=dribble(distOf(PU,tau)/CYC,{foot:'l',speed:.5+.45*s});p=blendPose(idle,dr,clamp((sp-.3)/.8));}
 else if(k===LOW_I&&tau<.3)p=over(blendPose(stand(),dribble(distOf(k,tau)/1.9,{foot:'r',speed:.25}),clamp((sp-.3)/.8)),DITHER,sm(-1.4,-.6,tau));
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/3.4,{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0)p=keeperDive(Math.min(1,u),{side:mv.side,height:.06});}
 if(k===MEE)p=over(p,SPLIT,bump(SHOT-.6,SHOT+1.2,tau));
 if(k===PU){
  p=over(p,ATTACK,bump(.8,5.1,tau));
  p=over(p,CUT(1),bump(5.05,5.6,tau));p=over(p,CUT(-1),bump(5.5,6.3,tau));
  const D=.8,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.7}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>IN_NET+.4)p=blendPose(p,celebrate(tau*.85,{kind:'run'}),sm(IN_NET+.4,IN_NET+.9,tau)*(1-sm(11.6,12.2,tau)));
  if(tau>11.6){p=over(p,SCREAM,sm(11.6,12.2,tau));yaw=lerpA(yaw,yawOf(1,-.6),sm(11.6,12.2,tau));}
 }
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: plain white with navy panel marks (design inferred)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.45);
 const pan=new Path2D();for(let i=0;i<3;i++){const a=rot+i/3*TAU,cx=x+Math.cos(a)*r*.55,cy=y+Math.sin(a)*r*.55;pan.addPath(polyPath(blob(cx,cy,r*.28,r*.16,i+5,{amp:.1,n:10,rot:a}),true));}
 s.fill(K,pan,.9);s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult;joints:Map<number,DrawResult>};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;nearCull?:number;after?:(r:PlayOut)=>void;under?:()=>void}={}):PlayOut{
 const{minBall=6,hero=false,nearCull=1.2}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<(k===PU?1.2:nearCull))return;const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (floodlit: soft, short); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0],e.g[1],e.h*.16,e.h*.04,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.36);
 o.under?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 const joints=new Map<number,DrawResult>();
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only the hero keeps 'mid'
  const detail=passing?(e.k===PU?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},{...(big&&(e.k===PU||e.h>520)&&!passing?{prev:poseOf(e.k,tauPrev).p,smear:hero&&e.k===PU}:{}),claret:CLARET.has(a.style)});
  joints.set(e.k,r);if(e.k===PU)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR,joints};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ribbon of ground points (metres) projected, with a paper halo */
function groundRibbon(s:Sheet,c:Cam,P:[number,number][],ink:string,wm:number,w:number,seed:number,arrow=false){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(const [x,z] of P){const q=toCam(c,[x,0,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}
 if(pts.length<2)return;const wd=Math.max(4,c.F*wm/d);
 s.knockout(ribbon(pts,wd*1.7,{seed,taper:.1,wobble:.8}),.8*w);
 if(arrow&&pts.length>=2){const a=pts[pts.length-2],b=pts[pts.length-1];s.fill(ink,ribbon(pts.slice(0,-1),wd,{seed,taper:.1,wobble:.8}),.95*w);laneArrow(s,ink,a,b,wd,{seed:seed+1,head:wd*3});}
 else s.fill(ink,ribbon(pts,wd,{seed,taper:.1,wobble:.8}),.95*w);}
/** "head on": a red arrow on the grass from Pulisic straight at Tarkowski (grows with w) */
function headOnArrow(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const m=posOf(PU,tau),t=posOf(TARK,tau),dx=t[0]-m[0],dz=t[1]-m[1],l=Math.hypot(dx,dz)||1,L=Math.max(.5,(l-1.2)*clamp(w));
 const P:[number,number][]=[];for(let i=0;i<=6;i++){const u=.9/l+(L/l)*i/6;P.push([m[0]+dx*u,m[1]+dz*u]);}groundRibbon(s,c,P,R,.16,1,71,true);}
/** "has to decide": two yellow option lanes forking round Tarkowski — inside (−Z, his left) and outside (+Z, his right). pick 0..1 closes
 * the inside lane (a navy bar: he pushes him wide) and lights the outside one red. */
function forkMark(s:Sheet,c:Cam,tau:number,w:number,pick:number){if(w<=0)return;const t=posOf(TARK,tau),m=posOf(PU,tau),sx=Math.sign(t[0]-m[0])||-1,start:[number,number]=[t[0]-sx*2.2,t[1]];
 for(const side of [-1,1]){const P:[number,number][]=[];for(let i=0;i<=8;i++){const u=i/8*clamp(w*1.2);P.push([start[0]+sx*u*4.4,t[1]+side*(.35+1.6*Math.sin(Math.PI*Math.min(1,u*1.15)*.75))]);}
  const out=side>0,ink=out&&pick>.4?R:Y,alpha=out?1:1-.55*pick;groundRibbon(s,c,P,ink,.11,alpha,out?81:83,true);}
 if(pick>0)groundRibbon(s,c,[[t[0]+sx*.7,t[1]-.2],[t[0]+sx*.9,t[1]-2.2*pick]],K,.22,pick,85);}
/** a red arrow on the grass along his real path over [t0, t1] (grows with w) */
function pathArrow(s:Sheet,c:Cam,t0:number,t1:number,w:number){if(w<=0)return;const P:[number,number][]=[];const n=Math.max(3,Math.round(16*clamp(w)));
 for(let i=0;i<=n;i++){const tau=t0+(t1-t0)*clamp(w)*i/n;P.push(posOf(PU,tau));}groundRibbon(s,c,P,R,.13,1,61,true);}
/** "back across goal": the yellow line of the shot on the grass, from his foot toward the far corner (grows with w) */
function shotLine(s:Sheet,c:Cam,w:number){if(w<=0)return;const P:[number,number][]=[];for(let i=0;i<=10;i++){const u=i/10*clamp(w);P.push([lerp(S0[0],NET[0]+1.2,u),lerp(S0[1],NET[2]+.25,u)]);}groundRibbon(s,c,P,Y,.1,1,91,true);}
/** a yellow ring round the ball */
function ballRing(s:Sheet,bg:Pt|null,br:number,w:number){if(!bg||w<=0)return;const r=br*(1.9+.4*(1-w)),pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([bg[0]+Math.cos(a)*r,bg[1]+Math.sin(a)*r*.8]);}
 const rr=ribbon(pts,Math.max(3,br*.35),{close:true,seed:43,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(Y,rr,.95*w);}
/** a ring on the grass round a player's feet */
function footRing(s:Sheet,c:Cam,k:number,tau:number,ink:string,w:number,rad=.8){if(w<=0)return;const m=posOf(k,tau),pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[m[0]+Math.cos(i/36*TAU)*rad*w,0,m[1]+Math.sin(i/36*TAU)*rad*.8*w]);if(q)pts.push(q);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(3,c.F*.06/toCam(c,[m[0],0,m[1]])[2]),{close:true,seed:7+k,taper:0,wobble:1});s.knockout(rr,.9);s.fill(ink,rr,.95*w);}}
/** speed lines streaming off him (the dart) */
function burstLines(s:Sheet,c:Cam,tau:number,w:number){if(w<=0)return;const m=posOf(PU,tau),v=velOf(PU,tau),l=Math.hypot(v[0],v[1])||1,q=pr(c,[m[0],1,m[1]]),q2=pr(c,[m[0]+v[0]/l,1,m[1]+v[1]/l]);if(!q||!q2)return;
 const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),z=c.F/toCam(c,[m[0],1,m[1]])[2],p=new Path2D();
 for(let k=0;k<3;k++){const oy=z*(-.6+k*.5);p.addPath(ribbon([[q[0]-Math.cos(dir)*z*(.8+k*.2),q[1]+oy-Math.sin(dir)*z*(.8+k*.2)],[q[0]-Math.cos(dir)*z*(1.9+k*.4),q[1]+oy-Math.sin(dir)*z*(1.9+k*.4)]],z*.05,{seed:9+k,taper:.9,wobble:.5}));}
 s.fill(K,p,.6*w);}
/** a spark at a joint of a drawn figure */
function sparkAt(s:Sheet,r:DrawResult|undefined,j:'rToe'|'lToe'|'pelvis'|'head',ink:string,age:number,seed:number){if(!r||age<-.15||age>.6)return;const p=r.joints[j];
 sparkBurst(s,ink,p[0],p[1],r.heightPx*.32,{n:8,seed,g:easeOutBack(clamp((age+.15)/.2))*(1-clamp((age-.35)/.25)),width:8});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the run between them plays at ~0.8–1.4× real time; the pre-roll is Lowton's dawdle) */
const tau1=(t:number)=>{const g=CUEW(0,'steals'),G=CUEW(0,'goal');return key(t,[[0,Math.max(T0,-g-.2)],[g,0],[CUEW(0,'runs straight'),1.6],[CUEW(0,'Tarkowski steps'),4.3],[CUEW(0,'Pulisic darts'),5.5],[CUEW(0,'into the box'),6.3],[G,IN_NET-.05],[SECS(0)+1,IN_NET-.05+SECS(0)+1-G]],linear);};
const CAM1:V3=[52.5,21,66];
function cam1(t:number):Cam{
 const g=CUEW(0,'steals'),G=CUEW(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 const open:V3=[50,4,6],m=posOf(PU,tau),cel:V3=[m[0]+1,1.1,m[1]];
 const toBall=sm(0,g-.1,t,easeInOutSine),toD=sm(G+.4,G+1.4,t,easeInOutSine);
 const tb:V3=[lerp(open[0],bt[0]-2,toBall),lerp(open[1],1.5,toBall),lerp(open[2],lerp(bt[2],4,.12),toBall)],T=lerp3(tb,cel,toD);
 const F=key(t,[[0,1500],[g-.2,4000],[CUEW(0,'runs straight'),4100],[CUEW(0,'Tarkowski steps'),4400],[G,4400],[G+1.4,5400],[S,5600]],easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2],ballY:NET[1]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(PU,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera side-on to the duel with Tarkowski
const tau2=(t:number)=>key(t,[[0,2.4],[CUEW(1,'he attacks'),3.2],[CUEW(1,'Tarkowski head'),3.8],[CUEW(1,'The defender'),4.35],[CUEW(1,'has to decide'),4.6],[CUEW(1,'pushes him wide'),5.05],[CUEW(1,'Pulisic reacts'),5.4],[CUEW(1,'darts past'),5.75],[SECS(1),6.6]],linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(PU,tau),tk=posOf(TARK,tau),open=1-sm(0,1.4,t,easeInOutSine),back=sm(CUEW(1,'darts')-.4,SECS(1),t,easeInOutSine);
 const mid:[number,number]=[lerp(m[0],tk[0],.45),lerp(m[1],tk[1],.45)];
 const C:V3=[mid[0]+1.5-2*back,1.5+.4*open+.5*back,mid[1]+10.5+3*open+1.5*back],T:V3=[mid[0]-.4-1.5*back,.85,mid[1]-.5];
 return look(C,T,2500-300*open-250*back);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ha=CUEW(1,'he attacks'),th=CUEW(1,'Tarkowski head'),hd=CUEW(1,'has to decide'),pw=CUEW(1,'pushes'),pr_=CUEW(1,'Pulisic reacts'),dp=CUEW(1,'darts'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const fade=1-sm(E-1,E-.5,t);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,under:()=>{
   headOnArrow(s,c,tau,sm(ha-.1,th+.4,t,easeOut)*(1-sm(hd-.3,hd,t)));
   forkMark(s,c,tau,sm(hd-.2,hd+.4,t,easeOut)*(1-sm(dp-.1,dp+.3,t)),sm(pw-.1,pw+.4,t));
   footRing(s,c,TARK,tau,Y,sm(CUEW(1,'The defender')-.1,CUEW(1,'The defender')+.3,t,easeOutBack)*(1-sm(pw-.1,pw+.3,t)),1.1);
   pathArrow(s,c,5.2,6.4,sm(dp-.1,dp+.8,t,easeOut)*fade);},
   after:({hero,joints})=>{
   // "Pulisic reacts": a yellow spark off his left boot as he darts; Tarkowski's lunge meets only air
   sparkAt(s,hero,'lToe',Y,tau-5.72,83);
   sparkAt(s,joints.get(TARK),'rToe',R,tau-5.85,91);
   burstLines(s,c,tau,sm(dp,dp+.3,t)*fade);}});
  streaks(s,v,1-sm(0,.5,t),21);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:3.2,
};

// ---------------------------------------------------------------- 3 · replay from behind the goal: the left-foot shot, through Mee's legs, past Pope, the scream
const tau3=(t:number)=>{const g=CUEW(2,'past Nick');return key(t,[[0,6.1],[CUEW(2,'Then a low'),6.55],[CUEW(2,'his left foot'),SHOT-.02],[CUEW(2,'across goal'),SHOT+.12],[CUEW(2,'through Ben'),MEE_T+.02],[g,IN_NET+.1],[g+.9,IN_NET+.7],[SECS(2),12.6]],linear);};
const swing3=(t:number)=>{const a=CUEW(2,'past Nick');return sm(a+.5,SECS(2)-.6,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),m=smooth(PU,Math.min(tau,SHOT+.3)),u=swing3(t),e=sm(SHOT-.2,IN_NET,tau,easeInOutSine),cel=smooth(PU,tau);
 const C0:V3=[-11,3.6,2.2],T0:V3=[lerp(m[0],3,e*.6),lerp(.9,.6,e),lerp(m[1]*.9,4,e*.6)];
 const C1:V3=[cel[0]-7,1.9,cel[1]-5],T1:V3=[cel[0]+.4,1.2,cel[1]+.6];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,sm(0,.45,u)),lerp(3900+300*e,3000,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),g=CUEW(2,'past Nick'),u=swing3(t),lf=CUEW(2,'his left'),ba=CUEW(2,'across goal'),tb=CUEW(2,'through Ben');
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau)});
  ground(s,c,{goalLater:u<.5});
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,under:()=>{
   shotLine(s,c,sm(ba-.15,ba+.5,t,easeOut)*(1-sm(g+.3,g+.8,t)));
   footRing(s,c,MEE,tau,R,sm(tb-.15,tb+.25,t,easeOutBack)*(1-sm(g+.2,g+.6,t)),1);},
   after:({hero,bg,br})=>{
   ballRing(s,bg,br,sm(lf-.1,lf+.3,t,easeOutBack)*(1-sm(ba+.2,ba+.5,t)));
   sparkAt(s,hero,'lToe',Y,tau-SHOT,95);
   // the primal scream: a burst round his head
   if(hero&&tau>11.9){const h=hero.joints.head;sparkBurst(s,Y,h[0],h[1],hero.heightPx*.35,{n:10,seed:97,g:easeOutBack(clamp((tau-11.9)/.3)),width:10});}}});
  if(u<.5)goal3(s,c,0,-1,bulgeAt(tau),NET[2],NET[1]);
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(PU,tau3(t)),q=toCam(c,[x,1.2,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 4 · the lesson: low behind Pulisic, over his shoulder, running at Tarkowski
const tau4=(t:number)=>key(t,[[0,2.6],[CUEW(3,'run straight'),3.3],[CUEW(3,'defenders'),3.9],[CUEW(3,'They have'),4.5],[CUEW(3,'you react'),5.2],[CUEW(3,'go past'),5.75],[SECS(3),6.9]],linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(PU,tau),v=velOf(PU,tau),l=Math.hypot(v[0],v[1])||1,back=sm(CUEW(3,'go past')-.3,SECS(3),t,easeInOutSine);
 const dx=v[0]/l,dz=v[1]/l;
 const C:V3=[m[0]-dx*4.2+.6,1.9+.6*back,m[1]-dz*4.2+2.2+1.5*back],T:V3=[m[0]+dx*4,.75,m[1]+dz*4-.5];
 return look(C,T,2150-200*back);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),rs=CUEW(3,'run straight'),th=CUEW(3,'They have'),yg=CUEW(3,'you react'),gp=CUEW(3,'go past'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,nearCull:5.5,under:()=>{
   headOnArrow(s,c,tau,sm(rs-.1,rs+.6,t,easeOut)*(1-sm(th-.2,th+.1,t)));
   footRing(s,c,TARK,tau,Y,sm(CUEW(3,'defenders')-.1,CUEW(3,'defenders')+.3,t,easeOutBack)*(1-sm(yg-.1,yg+.3,t)),1.1);
   forkMark(s,c,tau,sm(th-.1,th+.4,t,easeOut)*(1-sm(gp,gp+.4,t)),sm(yg-.2,yg+.3,t));
   pathArrow(s,c,5.2,6.6,sm(gp-.1,gp+.7,t,easeOut)*(1-sm(E-.9,E-.5,t)));},
   after:({hero})=>{
   sparkAt(s,hero,'lToe',Y,tau-5.72,84);
   burstLines(s,c,tau,sm(gp,gp+.3,t)*(1-sm(E-.9,E-.4,t)));}});
 },
 still:4.2,
};

const film:RisoStory={
 id:'pulisic-signature',format:'11v11',title:'Pulisic Runs at Burnley',theme:'Run straight at defenders: they have to decide, and you get to react',
 ageNote:'Premier League, Burnley v Chelsea, Turf Moor, 26 October 2019. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a kick of wet turf — grass bits thrown up, a yellow touch spark. Reduced motion: the static spark. */
 touch(s,x,y,age,seed){if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}spray(s,x,y,age,seed,2.2);if(age<.35)sparkBurst(s,Y,x,y-20,110,{n:7,seed:seed+1,g:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:15});},
};
/** turf spray: green bits thrown from a point, ballistic, 0..1 s */
function spray(s:Sheet,x:number,y:number,age:number,seed:number,size=1){
 if(age<0||age>1)return;const r=rng(seed),a=new Path2D(),b=new Path2D(),u=easeOut(clamp(age/.7)),fl=Math.sin(Math.min(1,age/.8)*Math.PI);
 for(let i=0;i<14;i++){const ang=-Math.PI/2+(r()-.5)*2.2,d=(40+r()*170)*u*size,px=x+Math.cos(ang)*d,py=y+Math.sin(ang)*d*.5-fl*(30+r()*70)*size,z=(6+r()*9)*size,q:Pt[]=[[px-z,py-z*.4],[px+z*.6,py-z*.6],[px+z,py+z*.3],[px-z*.4,py+z*.5]];(i%3?a:b).addPath(polyPath(q,true));}
 const fade=1-clamp((age-.6)/.4);s.fill(K,b,.5*fade);s.fill(Y,a,.9*fade);s.tone(B,a,.6*fade);
}
export default film;
