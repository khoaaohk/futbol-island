/** Abby Wambach's equaliser — USA 2–2 Brazil (USA win 5–3 on penalties), FIFA Women's World Cup quarter-final, 10 July 2011,
 * Rudolf-Harbig-Stadion, Dresden. An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the goal from WRITTEN accounts (the footage itself was not
 * reviewed), rendered as a riso print.
 *
 * SOURCES (Sept 2026; the build session had one web search and no page fetches, so the facts below come from that search's summaries of
 * these pages plus the brief; anything not in them is listed as INFERRED):
 *  - FIFA, "A goal for the ages" (10 July 2011 retrospective) https://inside.fifa.com/news/10-july-2011-goal-for-the-ages
 *  - FIFA, "Memorable moment: Wambach's historic header" https://inside.fifa.com/news/memorable-moment-wambach-s-historic-header-2907918
 *  - FIFA, "When Wambach's head broke Brazil's hearts"
 *    https://inside.fifa.com/tournaments/womens/womensworldcup/germany2011/news/when-wambach-s-head-broke-brazil-s-hearts-2849203
 *  - Stars and Stripes FC, "Throwback Thursday: Wambach brings the USWNT back from the brink" (2018)
 *    https://www.starsandstripesfc.com/uswnt-news/2018/8/9/17669256/throwback-thursday-usa-uswnt-womens-world-cupabby-wambach-goal-brazil-quarterfinals
 *  - ESPN espnW, "Abby Wambach's 2011 header heard round the world"
 *    https://www.espn.com/espnw/news-commentary/2015worldcup/story/_/id/13075090/abby-wambach-2011-header-heard-round-world
 *  - the18, "Abby Wambach's goal vs Brazil in 2011 was the best in U.S. history"
 *    https://the18.com/en/soccer-entertainment/abby-wambach-goal-vs-brazil-2011-womens-world-cup
 *  - Al Jazeera, "'Hands' Solo tips US into semi-finals" (10 July 2011) https://www.aljazeera.com/amp/sports/2011/7/10/hands-solo-tips-us-into-semi-finals
 *  - CBS Boston, "Wambach, Solo key dramatic US win over Brazil"; Fox Sports, "US wins over Brazil in thrilling shootout"
 *  - FIFA, official Tactical Line-up sheet, match #28 Brazil - USA, 10 JUL 2011, Dresden / Rudolf-Harbig-Stadion (PDF; read Sept 2026):
 *    "Brazil (BRA) Shirt: yellow Shorts: white Socks: white"; "USA (USA) Shirt: black Shorts: black Socks: black"; 1 ANDREIA GK; 1 Hope SOLO
 *  - The New York Times, Solo's comeback (2011; read Sept 2026): "Solo dived to her right and punched the ball away"
 * CONFIRMED by those accounts (and the brief): quarter-final, 10 July 2011, Dresden; the USA were 2–1 down deep in stoppage time of extra
 * time; the 122nd minute; Megan Rapinoe hit a deep LEFT-footed cross (her weaker foot) from the LEFT flank to the back / far post; Wambach
 * "settled at the edge of the six-yard box", out-jumped Brazil's goalkeeper Andréia and headed it into the net; 2–2; the USA won the
 * shootout 5–3 and Hope Solo saved one Brazil penalty; voted the best goal in Women's World Cup history (2015 poll); Wambach wore 20,
 * Rapinoe 15; the kits, from FIFA's line-up sheet: the USA all BLACK (shirts, shorts, socks — printed in the darkest ink, solid navy,
 * with paper numbers and trim), Brazil in yellow shirts with WHITE shorts and socks; on the shootout save Solo dived to her RIGHT (NYT).
 * INFERRED (illustrative reconstruction): every position, run and timing in metres and seconds (the cross from ≈ 38 m out on the left
 * wing, ≈ 44 m of flight, ≈ 1.85 s, apex ≈ 5.5 m; the header ≈ 5.7 m from goal at the far post, down into the middle of the net); the
 * build-up (Carli Lloyd's pass out to Rapinoe, Rapinoe's touch before the cross); Andréia coming off her line and leaping short; which
 * touchline the main camera was on (drawn: Rapinoe's side, the USA attacking right → left); every other player shown and where (the
 * USA are drawn with ten: Rachel Buehler had been sent off — recalled, not in the search summaries); Lloyd's 10 and Alex Morgan's 13;
 * hair (Wambach's short cut, the ponytails); both keepers' kit colours (not on the sheet: Andréia red; Solo red with navy trim, as the
 * Solo film prints her — it has to differ from the black USA strip and Brazil's yellow); the numbers' and trim inks; the shootout staging
 * (which end, the Brazil taker, the height of the save and where the parry went); Wambach's celebration run; the evening light, the yellow-and-navy seats,
 * the crowd colours and flags; the TV camera positions and lenses.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (Lloyd → Rapinoe on the left wing → the long
 * left-footed cross → Wambach's header → the net → she runs off); ch2 = the TV slow-motion REPLAY from a low camera beside the goal, looking
 * back up at her face (the run, the jump over the keeper, the forehead, the net), with a replay trail on the cross; ch3 = live, the penalty
 * shootout from high behind the taker (Hope Solo dives to her right and saves; the crowd erupts); ch4 = the lesson: a close, very slow replay
 * of the header with teaching marks (a last-minute clock, lit footprints of the run, the take-off spark, the ball ring, the forehead glow and
 * the arrow into the net). Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), so it frames from
 * the 1.45:1 card window down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for the ponytails and hems, motionSmear on the cross, the header, the dive). Women footballers: per-player builds
 * (height, slimmer bulk) and hair (ponytails; Wambach's short crop). Handedness: the world is right-handed (x toward Brazil's goal, y up,
 * +z = the USA's right), exactly athlete.ts's convention, so Rapinoe's strike({foot:'l'}) is her LEFT foot without a mirrored projector;
 * header() is symmetric, and Wambach's glancing redirect is a neck/shoulder turn to her right, toward the goal.
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. Heat: small figures print at 'low', every figure inside a passage is capped; ≈ 150–320 plate ops a frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,header,lunge,posed,keyPoses,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The last minute',text:'Dresden, 2011. The USA are losing to Brazil, and extra time is almost over. Megan Rapinoe crosses with her left foot... Abby Wambach heads it in! Two-all!',tail:2.2,
  cues:['Dresden','The USA are losing','extra time','Megan Rapinoe','crosses','left foot','Abby Wambach','heads it in','Two-all']},
 {label:'Watch it again',text:'Watch again, slowly. Wambach times her run to the far post, jumps above the keeper, and meets the ball with her forehead.',tail:1.5,
  cues:['Watch again','times her run','far post','jumps above','the keeper','meets the ball','forehead']},
 {label:'Penalties',text:'Now, penalties! Hope Solo dives and saves one, and the USA win the shootout!',tail:2.1,
  cues:['Now','penalties','Hope Solo','dives','saves one','the USA win']},
 {label:'Never give up',text:'Never give up, even in the last minute! Time your run, jump, and meet the ball with your forehead.',tail:1.9,
  cues:['Never give up','last minute','Time your run','jump','meet the ball','forehead']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/wambach-header-2011/timing.json, add
 *   import timingJson from '../../../public/plays/narration/wambach-header-2011/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/wambach-header-2011/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('wambach: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('wambach: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub3=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts: 0 faces +x, + turns left) facing the ground direction (dx,dz) */
const yawTo=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const nrm2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: Brazil's goal line is x = 0 (the USA attack +x), goal centre z = 0, +z = the USA's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- the Rudolf-Harbig-Stadion: a closed bowl, one steep tier on four sides, one roof
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z), 1 behind Brazil's goal (+x), 2 the main stand (−z, the camera side),
 * 3 the other end. Closed corners: the side stands run past the goal lines. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-124,20,a),1.4+22*b,41+30*b],
 (a,b)=>[8+28*b,1.4+20*b,lerp(-62,62,a)],
 (a,b)=>[lerp(20,-124,a),1.4+22*b,-41-30*b],
 (a,b)=>[-113-28*b,1.4+20*b,lerp(62,-62,a)],
];
const STAND_COLS=[104,72,104,72],STAND_ROWS=13,AISLES=[[.5],[.5],[.5],[.5]];
/** flags on the stand fronts: [stand, a, 0 = USA | 1 = Brazil] */
const FLAGS:[number,number,number][]=[[0,.3,0],[0,.46,1],[0,.58,0],[0,.72,0],[0,.84,1],[1,.18,0],[1,.36,1],[1,.62,0],[1,.8,0],[2,.2,0],[2,.34,1],[3,.4,0],[3,.62,1]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a July evening in Dresden: a pale blue screen, a warm band low down
 s.field(B,.17,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){const band=polyPath([[-1e4,hz[1]-520],[1e4,hz[1]-520],[1e4,hz[1]+60],[-1e4,hz[1]+60]],true);s.tone(Y,band,.22);s.tone(R,band,.07);}
 const planes=new Path2D(),aisle=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of AISLES[i])seg3(c,S(0,b),S(1,b),.6,aisle);
  // the one continuous roof: a dark overhang over the top rows, a paper fascia along its lip
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.7),[0,10.5,0]),add3(S(0,.7),[0,10.5,0])]));
  seg3(c,add3(S(0,.7),[0,10.3,0]),add3(S(1,.7),[0,10.3,0]),.45,edge);}
 // yellow-and-navy seats under the crowd
 s.knockout(planes);s.tone(Y,planes,.55);s.tone(K,planes,.3);s.knockout(aisle,.85);
 // the crowd: seeded dots (white, USA red, navy, Brazil yellow), sized by distance; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(AISLES[si].some(w=>Math.abs(b-w)<.045))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,11);if(h<.26)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=h<.6?0:h<.78?1:h<.9?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.7);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.9);s.knockout(edge,.8);
 // flags on the stand fronts: the Stars and Stripes (paper, red stripes, a navy canton) and Brazil's (green = yellow × blue, a yellow
 // rhombus, a blue globe)
 const fl=new Path2D(),stripe=new Path2D(),canton=new Path2D(),green=new Path2D(),globe=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.03,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.08),P(0,.08)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===0){for(let k=0;k<3;k++){const b0=.005+(.075*(2*k+1))/7,b1=b0+.075/7;addPoly(stripe,polyP(c,[P(0,b0),P(1,b0),P(1,b1),P(0,b1)]));}addPoly(canton,polyP(c,[P(0,.045),P(.42,.045),P(.42,.08),P(0,.08)]));}
  else{// the green field with the rhombus cut out (reversed winding = a hole under the nonzero rule)
   const outer=q,rh=polyP(c,[P(.5,.013),P(.92,.0425),P(.5,.072),P(.08,.0425)]);if(rh.length>2){const g=new Path2D(polyPath(outer,true));g.addPath(polyPath(rh.slice().reverse(),true));green.addPath(g);}
   addPoly(globe,polyP(c,[P(.4,.03),P(.6,.03),P(.6,.055),P(.4,.055)]));}}
 s.knockout(fl);s.fill(R,stripe,.95);s.fill(K,canton,.95);s.fill(Y,green,.95);s.fill(B,green,.9);s.fill(B,globe,.95);
 // floodlights along the roof lip
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<6;k++){const u=(k+.5)/6,a=add3(S(u-.03,.7),[0,9.6,0]),b=add3(S(u+.03,.7),[0,9.6,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,.9,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.7);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
/** boards: the advertising-board ink (red; the shootout prints them blue so Solo's red keeper kit stays readable in front of them) */
function ground(s:Sheet,c:Cam,boards:string=R){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.78);
 // mowing stripes along the pitch (Dresden cuts them across the width), every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // advertising boards: red (blue in the shootout) with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(boards,bd,.9);s.fill(K,bd,.2);s.knockout(pn,.85);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.12,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.12,0,0],[-10.88,0,0],.24,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
}
/** Brazil's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around z = bz */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-1.8,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles) — women footballers
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** the USA all in black (FIFA line-up sheet) — the darkest ink, solid navy — with paper numbers and trim (as the Solo film prints them) */
const usa=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[K,.95],shorts:[K,.95],socks:[K,.95],boots:K,skin:SKIN_L,hair:[K,.75],line:K,trim:'paper',numberInk:'paper',hairStyle:'ponytail',build:{height:1.7,bulk:.88},...o});
/** Brazil: yellow shirts, white shorts, white socks (FIFA line-up sheet); blue numbers and trim */
const brazil=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:'paper',socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,trim:[B,.9],numberInk:[B,.9],hairStyle:'ponytail',build:{height:1.68,bulk:.88},...o});
const B_WAM:Build={height:1.8,bulk:.95,thighs:1.06},B_RAP:Build={height:1.68,bulk:.88},B_LLO:Build={height:1.73,bulk:.92},B_AND:Build={height:1.72,bulk:.92},B_SOLO:Build={height:1.75,bulk:.95};
const WAM_ST=usa({number:20,hairStyle:'short',hair:[Y,.9],build:B_WAM,seed:20});
const RAP_ST=usa({number:15,hair:[Y,.95],build:B_RAP,seed:15});
const LLO_ST=usa({number:10,hair:[K,.6],build:B_LLO,seed:10});
const AND_ST:AthleteStyle={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:'paper',build:B_AND,seed:31};
/** Hope Solo's keeper kit: inferred, red with navy trim and number — exactly the Solo film's print (clear of the black USA and the yellow) */
const SOLO_ST:AthleteStyle={shirt:[R,.92],shorts:[R,.92],socks:[R,.92],boots:K,skin:SKIN_L,hair:[K,.5],line:K,trim:[K,.85],gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:[K,.9],build:B_SOLO,seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Rapinoe's cross)
const BALL_R=.11;
/** the cross: struck ≈ 38 m out on the left wing; flies TF s to Wambach's forehead; her header reaches the goal line TG */
const TF=1.85,TG=TF+.3,TPASS=-3.0,TRECV=-1.8;
/** Wambach's header spot (her pelvis) at the edge of the six-yard box, at the far post; she faces the near touchline, the goal on her right */
const HP:[number,number]=[-5.7,2.8],YAW_W=yawTo(.08,-1);
/** Wambach's header pose: header() with a glancing turn of the head and shoulders to her right (toward the goal) through contact */
function wamHeader(u:number):Pose{const p=header(clamp(u));p.air*=1.45;/* she out-jumps the keeper (the accounts' point) */const w=Math.sin(Math.PI*clamp((u-.36)/.34));p.neckY-=.15*w;p.twist-=.1*w;p.neckP+=.3*w;p.lean-=.0*w;return p;}
/** contact on the header clock: mid-snap, eyes open, forehead driving through the ball (not the generator's chin-down follow-through) */
const CU=.47;
const HD=1.0,TJ=TF-CU*HD;
/** her forehead at contact (solved from the skeleton): the ball's centre is one radius in front of it */
const HEAD_PT:V3=(()=>{const sk=solve(wamHeader(CU),B_WAM,{x:HP[0],z:HP[1],yaw:YAW_W}),hd=sk.head,fc=sk.face,d=sub3(fc,hd),l=Math.hypot(d[0],d[1],d[2])||1;return[fc[0]+d[0]/l*(BALL_R+.02),fc[1]+d[1]/l*(BALL_R+.02)+.02,fc[2]+d[2]/l*(BALL_R+.02)] as V3;})();
/** the cross point (ball on the grass) and its ground direction */
const P0:V3=[-38.2,BALL_R,-26.2];
const DC=nrm2(HEAD_PT[0]-P0[0],HEAD_PT[2]-P0[2]),YAW_R=yawTo(DC[0],DC[1]);
/** where Rapinoe's pelvis stands at contact so her LEFT boot meets the back of the ball (solved once, FK) */
const PCR:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),B_RAP,{x:0,z:0,yaw:YAW_R});return[P0[0]-DC[0]*.12-sk.lToe[0],P0[2]-DC[1]*.12-sk.lToe[2]];})();
/** Rapinoe receives Lloyd's pass here and knocks it forward into her stride */
const RECV:V3=[-41.8,BALL_R,-27.4];
/** where the header crosses the goal line: low and central, past Andréia, who is stranded off her line */
const GOAL_PT:V3=[0,.8,-1.1],NET_HIT:V3=[1.6,.55,-1.3],REST:V3=[1.2,BALL_R,-1.05];
const ballistic=(A:V3,Bp:V3,d:number):V3=>[(Bp[0]-A[0])/d,(Bp[1]-A[1]+4.905*d*d)/d,(Bp[2]-A[2])/d];
const fly=(A:V3,V:V3,t:number):V3=>[A[0]+V[0]*t,A[1]+V[1]*t-4.905*t*t,A[2]+V[2]*t];
const V_CROSS=ballistic(P0,HEAD_PT,TF),V_HEAD=ballistic(HEAD_PT,GOAL_PT,TG-TF);

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='wam'|'rap'|'llo'|'gk'|'mark'|'close'|'run';
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean};
const T0=-9,T1=12,DT=.02;
const rp=(u:number):[number,number]=>[PCR[0]+DC[0]*u,PCR[1]+DC[1]*u];
const ACTORS:Actor[]=[
 {name:'Abby Wambach',role:'wam',hero:true,style:WAM_ST,keys:[[T0,-18,10.5],[-5,-13.6,8.2],[-2,-9.8,5.8],[0,-7.6,4.4],[1.0,-6.1,3.2],[TJ-.35,HP[0],HP[1]],[TF+.5,HP[0],HP[1]],[TF+1.3,-5.4,1.4],[TF+3.4,-4.4,-8],[TF+6.5,-3,-22],[T1,-2.4,-26]]},
 {name:'Megan Rapinoe',role:'rap',hero:true,style:RAP_ST,keys:[[T0,-49,-31],[-5,-45.5,-29.6],[TRECV,RECV[0]-.75,RECV[2]-.2],[-.55,...rp(-1.5)],[0,...rp(0)],[.7,...rp(.9)],[3,...rp(4)],[T1,...rp(9)]]},
 {name:'Carli Lloyd',role:'llo',hero:true,style:LLO_ST,keys:[[T0,-58,-2],[-5,-52.4,-6.2],[TPASS,-49.3,-9.2],[-1,-47,-11],[3,-43,-9.5],[T1,-36,-6]]},
 {name:'Andréia',role:'gk',hero:true,style:AND_ST,keys:[[T0,-1,-.4],[-2,-1.2,-.9],[0,-1.4,-.6],[.9,-2.2,-.1],[TF-.5,-3.3,.55],[TF,-3.5,.7],[TF+1.4,-3.6,.8],[T1,-3.4,.4]]},
 {name:'Brazil centre-back',role:'mark',style:brazil({number:3,build:{height:1.74,bulk:.94},seed:43}),keys:[[T0,-16,7],[-4,-12.5,6.6],[0,-9.2,5.4],[TF-.6,-7.1,4.3],[TF,-6.9,4.1],[T1,-6.2,3.6]]},
 {name:'Brazil centre-back 2',role:'run',style:brazil({build:{height:1.72},skin:SKIN_D,seed:44}),keys:[[T0,-17,-3],[-4,-13.8,-3.4],[0,-10.8,-2.6],[TF,-8.6,-.6],[T1,-7.6,.2]]},
 {name:'Brazil full-back',role:'close',style:brazil({build:{height:1.66},seed:45}),keys:[[T0,-40,-16],[-4,-38.6,-19.5],[TRECV,-38.2,-21.8],[0,-36.9,-24.1],[1.2,-36.6,-24.4],[T1,-33,-20]]},
 {name:'Brazil midfielder',role:'run',style:brazil({number:10,skin:SKIN_D,build:{height:1.62,bulk:.9},seed:46}),keys:[[T0,-52,1],[-4,-48.5,-3],[0,-45.6,-8],[4,-42,-9],[T1,-36,-8]]},
 {name:'Brazil midfielder 2',role:'run',style:brazil({build:{height:1.7},seed:47}),keys:[[T0,-33,8],[-4,-28,6],[0,-24,4],[4,-19,3],[T1,-14,2]]},
 {name:'Brazil defender',role:'run',style:brazil({build:{height:1.68},skin:SKIN_D,seed:48}),keys:[[T0,-22,-12],[-4,-19,-11],[0,-15.5,-9],[4,-12,-6],[T1,-10,-5]]},
 {name:'Alex Morgan',role:'run',style:usa({number:13,hair:[K,.7],build:{height:1.7,bulk:.86},seed:13}),keys:[[T0,-24,-1],[-4,-18.5,-2.6],[0,-13.6,-2.4],[TF,-9.6,-1.6],[TF+1,-8.6,-1.2],[T1,-6,-5]]},
 {name:'USA midfielder',role:'run',style:usa({hair:[R,.5],seed:61}),keys:[[T0,-40,8],[-4,-35,5],[0,-30.5,3],[4,-24,1],[T1,-18,-3]]},
 {name:'USA defender',role:'run',style:usa({hair:[K,.7],seed:62,skin:SKIN_M}),keys:[[T0,-62,4],[-4,-57,-1],[0,-54,-4],[T1,-44,-6]]},
];
const WAM=0,RAP=1,LLO=2,GK=3,MARK=4;
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 // a held key (same spot twice) keeps zero speed at its ends
 const still=(a:number[],b:number[])=>Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<1e-6;
 const f=(j:number)=>{const m1=still(k1,k2)||still(k0,k1)?0:(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=still(k1,k2)||still(k2,k3)?0:(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (drives the gait phase) — built once */
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.06),b=posOf(k,tau+.06);return[(b[0]-a[0])/.12,(b[1]-a[1])/.12];};

// ---------------------------------------------------------------- the ball
/** at Lloyd's feet (a touch ahead of her run) → her pass out to the left → Rapinoe's touch forward → the cross → the header → the net */
function ahead(k:number,tau:number,lead:number):V3{const p=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/l*lead,BALL_R,p[1]+v[1]/l*lead];}
let _pass:V3|null=null;const PASS0=()=>_pass??(_pass=ahead(LLO,TPASS,.5));
function ballAt(tau:number):V3{
 if(tau<TPASS)return ahead(LLO,tau,.42+.12*Math.abs(Math.sin(distOf(LLO,tau)*1.6)));
 if(tau<TRECV)return mix3(PASS0(),RECV,sm(TPASS,TRECV,tau,u=>u*(1.3-.3*u)));
 if(tau<-.3)return mix3(RECV,P0,sm(TRECV,-.3,tau,easeOut));
 if(tau<=0)return P0;
 if(tau<TF)return fly(P0,V_CROSS,tau);
 if(tau<TG)return fly(HEAD_PT,V_HEAD,tau-TF);
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.5),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.64)*9))*Math.exp(-(tau-TG-.64)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?distOf(LLO,Math.min(tau,TPASS))*3:tau<TF?tau*TAU*4:TF*TAU*4-(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp(sp/7.5),ph=distOf(k,tau)/(2.3+2.1*q)+k*.37;
 const run=runCycle(ph,{speed:q});if(sp>1.4)return run;
 const idle=blendPose(stand(),posed({lHipF:24,rHipF:18,lKnee:30,rKnee:26,lean:14,pitch:4,neckP:-10,lShA:18,rShA:16,lElb:40,rElb:36,rAnk:-6,lAnk:-6}),.5+.5*Math.sin(tau*1.7+k));
 return blendPose(idle,run,clamp((sp-.25)/1.15));
}
/** face along the run when moving, else toward the ball (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target?:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),b=target??ballAt(tau),tx=b[0]-p[0],tz=b[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
/** Andréia's leap off her line: arms thrown up, a beat early and short */
const GK_LEAP:[number,Pose][]=[
 [0,posed({lHipF:50,rHipF:54,lKnee:74,rKnee:78,lAnk:-14,rAnk:-14,lean:20,pitch:6,lShF:-30,rShF:-30,lShA:24,rShA:24,lElb:40,rElb:40,neckP:-24})],
 [.28,posed({air:.1,lHipF:6,rHipF:26,lKnee:10,rKnee:70,lAnk:46,rAnk:30,lean:2,lShF:120,rShF:128,lShA:30,rShA:28,lElb:30,rElb:26,neckP:-34,lHand:1,rHand:1})],
 [.5,posed({air:.5,lHipF:-6,rHipF:62,lKnee:40,rKnee:92,lAnk:44,rAnk:40,lean:-8,pitch:-4,lShF:168,rShF:176,lShA:20,rShA:16,lElb:12,rElb:8,neckP:-40,lHand:1,rHand:1})],
 [.78,posed({air:.16,lHipF:20,rHipF:40,lKnee:40,rKnee:60,lean:4,lShF:120,rShF:112,lShA:36,rShA:36,lElb:30,rElb:34,neckP:-20,neckY:-40,lHand:1,rHand:1})],
 [1,posed({lHipF:46,rHipF:42,lKnee:62,rKnee:58,lAnk:-10,rAnk:-10,lean:18,lShF:30,rShF:30,lShA:30,rShA:30,lElb:44,rElb:44,neckP:4,neckY:-50})],
];
const DEJECT=posed({lHipF:26,rHipF:26,lKnee:30,rKnee:30,lean:30,pitch:6,neckP:34,lShA:14,rShA:14,lShF:20,rShF:20,lElb:24,rElb:24});
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=faceYaw(k,tau);
 switch(a.role){
  case 'wam':{
   // eyes on the ball as it comes over; she settles facing the near touchline (the goal on her right), gathers, jumps, heads, lands
   if(tau>TJ-.3&&tau<TJ+HD+.6){const u=(tau-TJ)/HD,hp=wamHeader(u);pose=blendPose(pose,hp,sm(TJ-.3,TJ,tau)*(1-sm(TJ+HD,TJ+HD+.6,tau)));}
   if(tau>TJ+HD){const run=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,run,sm(TJ+HD+.1,TJ+HD+.8,tau));}
   const w=sm(TF-1.5,TF-.8,tau)*(1-sm(TF+.55,TF+1.1,tau));yaw=w>=1?YAW_W:lerpAng(faceYaw(k,tau),YAW_W,w);break;}
  case 'rap':{const w=win(tau,-.55,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'l'}),w);
   yaw=lerpAng(yaw,YAW_R,sm(-1.1,-.5,tau)*(1-sm(.9,1.6,tau)));
   if(tau>1.4)yaw=lerpAng(yaw,faceYaw(k,tau,[HEAD_PT[0],0,HEAD_PT[2]]),sm(1.4,1.9,tau));break;}
  case 'llo':{const w=win(tau,TPASS-.5,TPASS+.55,.2),pd=nrm2(RECV[0]-PASS0()[0],RECV[2]-PASS0()[2]);if(w>0)pose=blendPose(pose,strike(clamp((tau-TPASS)/1.0+STRIKE_CONTACT),{power:.55}),w);
   yaw=lerpAng(yaw,yawTo(pd[0],pd[1]),sm(TPASS-.9,TPASS-.4,tau)*(1-sm(TPASS+.6,TPASS+1.2,tau)));break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,sm(.6,1.1,tau)*(1-sm(TF-.85,TF-.65,tau)));
   const L0=TF-.55;if(tau>L0-.25){const lp=keyPoses(clamp((tau-L0)/1.0),GK_LEAP);pose=blendPose(pose,lp,sm(L0-.25,L0,tau));}
   if(tau>TG+.6)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.6,tau));
   yaw=faceYaw(k,Math.min(tau,TF-.2));if(tau>TF)yaw=lerpAng(yaw,yawTo(1,-.3),sm(TF+.1,TF+.7,tau));break;}
  case 'mark':{// beaten: a late, lower jump behind Wambach, then hands on head
   if(tau>TF-.6&&tau<TF+1){const hp=header(clamp((tau-(TF-.45))/1.0));hp.air*=.45;pose=blendPose(pose,hp,sm(TF-.6,TF-.4,tau)*(1-sm(TF+.6,TF+1,tau)));}
   if(tau>TF+.9)pose=blendPose(pose,DEJECT,sm(TF+.9,TF+1.6,tau));yaw=faceYaw(k,Math.min(tau,TF));break;}
  case 'close':{const w=win(tau,-.5,.6,.2);if(w>0)pose=blendPose(pose,lunge(clamp((tau+.5)/.9),{side:'l'}),w);break;}
  default:if(tau>TG+.5&&a.style.shirt===Y)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);break;
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the cross, the header, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.hero?'mid':'low'}:(!f.hero&&px<120)||px<44?{...f.style,detail:'low'}:f.style;
  items.push({d:q[2],draw:()=>{drawPlayer(s,f.st.pose,c,style,f.st.place,f.prev,!!f.smear&&!passing);}});}
 let out:{g:Pt;r:number}|null=null;
 if(ball){const bq=toCam(c,ball.P);if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{const r=drawBall(s,c,ball.P,ball.rot,ball);if(r)out={g:r.g,r:r.r};}});}
 if(goal){const gq=toCam(c,[1,1.2,0]);items.push({d:Math.max(NEAR,gq[2]),draw:()=>goal3(s,c,goal.bulge,goal.bz)});}
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return{ball:out};
}
/** the pitch at play time τ (poses on twos): every actor (prev = one drawn frame earlier), the ball, the goal */
function play(s:Sheet,c:Cam,tau:number,tauPrev:number,o:{smear?:boolean;min?:number;lines?:boolean;prevBall?:number;only?:number[]}={}){
 const figs:Fig[]=ACTORS.flatMap((a,k)=>o.only&&!o.only.includes(k)?[]:[k]).map(k=>{const a=ACTORS[k];const st=stateOf(k,tau);const hero=!!a.hero;return{st,prev:hero?stateOf(k,tauPrev):undefined,style:a.style,hero,
  smear:o.smear&&((k===WAM&&tau>TJ&&tau<TF+.3)||(k===RAP&&tau>-.25&&tau<.35)||(k===GK&&tau>TF-.45&&tau<TF+.1))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const gnd=(P:V3,y=0):V3=>[P[0],y,P[2]];
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: real time (×≈1), anchored so the cross is struck on "left foot" and her forehead meets it on "Abby Wambach" */
function tau1(t:number){const tX=CUE(0,'left foot')-.05,tH=CUE(0,'Abby Wambach')+.45,k=clamp(TF/Math.max(.5,tH-tX),.85,1.15);return Math.max(T0+.5,(t-tX)*k);}
const P1:V3=[-30,19,-62];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-40,0,-6],fov:30})],
  [CUE(0,'The USA')-.2,1.4,()=>({P:P1,T:add3(mix3(gnd(b),at(LLO,tau,0),.5),[0,1,0]),fov:9})],
  [CUE(0,'extra time')-.1,1.4,()=>({P:P1,T:add3(mix3(gnd(b),at(RAP,tau,0),.5),[0,1,0]),fov:9})],
  [CUE(0,'Megan')-.3,.9,()=>({P:P1,T:add3(at(RAP,tau,0),[1,1,0]),fov:6.2})],
  [CUE(0,'left foot')-.25,1.1,()=>({P:P1,T:mix3(add3(gnd(b),[0,1.4+.35*b[1],0]),[HP[0],1.6,HP[1]],.45*sm(0,TF,tau)),fov:lerp(10,15,sm(-.1,.6,tau))})],
  [CUE(0,'Abby')-.45,.8,()=>({P:P1,T:[HP[0]+1.1,1.5,HP[1]-1],fov:5.6})],
  [CUE(0,'heads it in')+.3,1.5,()=>{const w=at(WAM,tau,1.2);return{P:P1,T:mix3(w,[-1.5,1.2,-1],.35),fov:10};}],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tA=CUE(0,'Two-all'),tN=CUE(0,'Abby')+.8;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tA-.2,tA+.3,t)*(1-sm(tA+2.2,tA+3,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:19,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Abby')+.5;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low beside the goal, looking up at her face
const tau2=(t:number)=>key(t,mono([[0,.15],[CUE(1,'times her run'),.55],[CUE(1,'far post'),1.05],[CUE(1,'jumps above'),TJ+.1],[CUE(1,'the keeper'),TF-.12],[CUE(1,'meets the ball'),TF-.02],[CUE(1,'forehead'),TF+.06],[SECS(1)-.2,TG+.55]]),linear);
const E2:V3=[3.4,1.35,-9.6];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(tau),w=at(WAM,tau,1.3);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(mix3(b,[HP[0],1.6,HP[1]],.55),[-8,2,0],.2),fov:32})],
  [CUE(1,'times her run')-.2,1.2,()=>({P:E2,T:mix3(w,b,.12),fov:15})],
  [CUE(1,'far post')-.2,.8,()=>({P:E2,T:mix3(w,[HP[0],1.4,HP[1]],.5),fov:13})],
  [CUE(1,'jumps above')-.3,1,()=>({P:add3(E2,[0,.2,.4]),T:mix3([HP[0],1.8,HP[1]],[-3.5,1.6,.7],.35),fov:15})],
  [CUE(1,'meets the ball')-.3,.8,()=>({P:add3(E2,[0,.3,.6]),T:[HEAD_PT[0]+.3,HEAD_PT[1]-.1,HEAD_PT[2]-.2],fov:9})],
  [CUE(1,'forehead')+.25,1.3,()=>({P:add3(E2,[0,.3,.6]),T:mix3([HEAD_PT[0],1.5,HEAD_PT[2]],[1,1,-1],.5),fov:17})],
 ]);
}
/** the replay trail: the cross's path so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.9),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tp=tau2(tt-1/12);
  stadium(s,c,t,[0,1,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  trail(s,c,tau,1-sm(TG+.1,TG+.55,tau));
  const r=play(s,c,tau,tp,{smear:true,min:10});
  // the touch: a spark on her forehead at contact
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],r.ball.r*4.5,{n:9,seed:17,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:r.ball.r*.5});
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'forehead');},
};

// ---------------------------------------------------------------- 3 · live: the shootout — Hope Solo dives to her right and saves
/** σ = seconds from the Brazil taker's kick. Solo on her line facing the field (−x), so her RIGHT is −z (keeperDive side 'r'), the
 * main-stand side; the right-footed taker's run-up from the left of the ball, the shot across her body to her left = Solo's right. */
const SPOT:V3=[-11,BALL_R,0],SOLO_P:[number,number]=[-.35,0],SOLO_YAW=Math.PI;
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'r',height:.28}),T_DIVE=-.12,DIVE_L=1.15,T_HAND=T_DIVE+.55*DIVE_L;
/** Solo's right glove at full stretch (solved): the ball meets it and is pushed wide of her right-hand post */
const HAND_S:V3=(()=>{const sk=solve(DIVE(.55),B_SOLO,{x:SOLO_P[0],z:SOLO_P[1],yaw:SOLO_YAW});return add3(sk.rHa,[-.12,.02,0]);})();
const PEN_OUT:V3=[-2.6,BALL_R,-7.4],PEN_REST:V3=[-4.2,BALL_R,-9.6];
const PEN_DIR=nrm2(HAND_S[0]-SPOT[0],HAND_S[2]-SPOT[2]),PEN_YAW=yawTo(PEN_DIR[0],PEN_DIR[1]);
const TAKER_ST=brazil({number:3,build:{height:1.66,bulk:.9},skin:SKIN_D,seed:73});
const PC_T:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT),TAKER_ST.build,{x:0,z:0,yaw:PEN_YAW});return[SPOT[0]-PEN_DIR[0]*.12-sk.rToe[0],SPOT[2]-PEN_DIR[1]*.12-sk.rToe[2]];})();
const V_PEN=ballistic(SPOT,HAND_S,T_HAND),V_PARRY=ballistic(HAND_S,PEN_OUT,.55);
function penBall(sg:number):V3{
 if(sg<=0)return SPOT;if(sg<T_HAND)return fly(SPOT,V_PEN,sg);if(sg<T_HAND+.55)return fly(HAND_S,V_PARRY,sg-T_HAND);
 const u=clamp((sg-T_HAND-.55)/1.2,0,1),e=easeOut(u);return[lerp(PEN_OUT[0],PEN_REST[0],e),BALL_R+.25*Math.abs(Math.sin(u*Math.PI*2))*(1-u),lerp(PEN_OUT[2],PEN_REST[2],e)];
}
const SOLO_UP=posed({lHipF:8,rHipF:4,lKnee:12,rKnee:10,lShA:150,rShA:150,lShF:16,rShF:16,lElb:12,rElb:12,lHand:1,rHand:1,neckP:-26,lean:-8});
function soloState(sg:number):State{
 let pose=keeperSet(sg*1.4),place:Place={x:SOLO_P[0],z:SOLO_P[1],yaw:SOLO_YAW};
 if(sg>T_DIVE-.2){pose=blendPose(pose,DIVE((sg-T_DIVE)/DIVE_L),sm(T_DIVE-.2,T_DIVE,sg));}
 const dz=DIVE(1).dz,up=sm(1.6,2.4,sg,easeInOutSine);
 if(up>0){pose=blendPose(pose,stand(),up);place={...place,z:SOLO_P[1]-dz*up};}
 if(sg>2.3){pose=blendPose(pose,celebrate(sg-2.3,{kind:'arms'}),sm(2.3,2.7,sg));const b=blendPose(pose,SOLO_UP,.35);pose=b;}
 return{pose,place};
}
function takerState(sg:number):State{
 const g=sg<-1.35?-3.4:sg<-.55?lerp(-3.4,-1.5,sm(-1.35,-.55,sg,u=>u*u*(3-2*u))):sg<0?lerp(-1.5,0,(sg+.55)/.55):.8*(1-Math.pow(1-clamp(sg/.7),2));
 const x=PC_T[0]+PEN_DIR[0]*g,z=PC_T[1]+PEN_DIR[1]*g;
 let pose=blendPose(stand(),posed({lHipF:-10,rHipF:14,lKnee:14,rKnee:22,lean:12,neckP:16,lShA:20,rShA:20,lElb:30,rElb:30}),.6);
 if(sg>-1.4)pose=blendPose(pose,runCycle((g+3.4)/2.2,{speed:.45}),sm(-1.4,-1.2,sg));
 if(sg>-.6)pose=blendPose(pose,strike(clamp(sg/1.0+STRIKE_CONTACT)),sm(-.6,-.5,sg));
 if(sg>1.2)pose=blendPose(pose,DEJECT,sm(1.2,2,sg));
 return{pose,place:{x,z,yaw:sg>1.3?lerpAng(PEN_YAW,yawTo(-1,-.4),sm(1.3,2.4,sg)):PEN_YAW}};
}
const sig3=(t:number)=>key(t,mono([[0,-3.6],[CUE(2,'penalties'),-2.2],[CUE(2,'Hope Solo')+.1,-.5],[CUE(2,'dives'),T_DIVE+.05],[CUE(2,'saves one'),T_HAND+.02],[CUE(2,'the USA win'),1.9],[SECS(2),3.4]]),linear);
const E3:V3=[-27,5.2,-4.2];
function cam3v(t:number):Cam{
 const sg=sig3(t),tW=CUE(2,'the USA win');
 return plan(t,[
  [0,0,()=>({P:E3,T:[-6,.9,.2],fov:24})],
  [CUE(2,'penalties')-.2,1.2,()=>({P:E3,T:[-5.5,.8,.4],fov:19})],
  [CUE(2,'dives')-.4,.7,()=>({P:E3,T:[-2.4,1,-1.3],fov:12})],
  [tW-.3,1.4,()=>{const p=soloState(sg).place;return{P:add3(E3,[2,1,0]),T:[(p.x??0)-.5,2.2,(p.z??0)+.2],fov:15};}],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),sg=sig3(tt),sp=sig3(tt-1/12),tW=CUE(2,'the USA win');
  stadium(s,c,t,[0,1,2],{roar:sm(tW-.1,tW+.5,t),flash:sm(tW,tW+.3,t)});
  ground(s,c,B);
  const fast=sg>T_DIVE&&sg<T_HAND+.2;
  const figs:Fig[]=[{st:soloState(sg),prev:soloState(sp),style:SOLO_ST,hero:true,smear:fast},{st:takerState(sg),prev:takerState(sp),style:TAKER_ST,hero:true,smear:sg>-.2&&sg<.3}];
  const r=drawScene(s,c,figs,{P:penBall(sg),rot:sg*TAU*3,min:16,lines:sg>0&&sg<T_HAND+.4,prevP:penBall(sig3(t-.06))},{bulge:0,bz:0});
  // the save: a burst off Solo's glove
  const hit=(sg-T_HAND)/.4;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(60,r.ball.r*5),{n:10,seed:29,g:easeOutBack(clamp(hit*3))*(1-clamp((hit-.55)/.45)),width:Math.max(7,r.ball.r*.55)});
 },
 aperture(t){const c=cam3v(t),p=soloState(sig3(twos(t))),sk=solve(p.pose,B_SOLO,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'saves one')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson: a close, very slow replay of the header with teaching marks
const tau4=(t:number)=>key(t,mono([[0,.35],[CUE(3,'last minute'),.6],[CUE(3,'Time your run'),.75],[CUE(3,'jump'),TJ+.12],[CUE(3,'meet the ball'),TF-.1],[CUE(3,'forehead'),TF+.02],[SECS(3),TG+.45]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(WAM,tau,1.2);
 return plan(t,[
  [0,0,()=>({P:[-9.8,1.7,-6.8],T:[-6.4,2.1,2],fov:40})],
  [CUE(3,'Time your run')-.2,1.2,()=>({P:[-9.4,1.4,-5.8],T:mix3(w,[HP[0],1,HP[1]],.4),fov:30})],
  [CUE(3,'jump')-.2,.8,()=>({P:[-8.8,1.4,-5],T:[HP[0],1.7,HP[1]],fov:24})],
  [CUE(3,'meet the ball')-.2,.9,()=>({P:[-8.6,1.8,-4.4],T:[HEAD_PT[0]+.25,HEAD_PT[1]-.25,HEAD_PT[2]-.3],fov:15})],
  [CUE(3,'forehead')+.3,1.4,()=>({P:[-9,1.8,-4.8],T:mix3(HEAD_PT,[0,1,-1],.45),fov:28})],
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
/** "the last minute": a stadium clock face (no numbers) printed in the top corner of the frame, its red hand sweeping up to the top */
function clockFace(s:Sheet,g:number,sweep:number){
 if(g<=0)return;const x=-lerp(270,330,1-g)-120,y=-300,r=120*easeOutBack(clamp(g)),face=polyPath(blob(x,y,r,r,5,{amp:.03,n:32}),true);
 s.knockout(face);s.stroke(K,face,6,.9);s.tone(Y,face,.3);
 const ticks=new Path2D();for(let i=0;i<12;i++){const a=i/12*TAU-Math.PI/2,a0:Pt=[x+Math.cos(a)*r*.78,y+Math.sin(a)*r*.78],a1:Pt=[x+Math.cos(a)*r*.92,y+Math.sin(a)*r*.92];ticks.addPath(ribbon([a0,a1],i%3?5:9,{seed:i,taper:0,wobble:0}));}s.fill(K,ticks,.9);
 // the last slice before the top (the final minute) printed red; the hand sweeps into it
 const sl=new Path2D();sl.moveTo(x,y);for(let i=0;i<=8;i++){const a=-Math.PI/2-TAU/12+i/8*TAU/12;sl.lineTo(x+Math.cos(a)*r*.74,y+Math.sin(a)*r*.74);}sl.closePath();s.fill(R,sl,.7);
 const ha=-Math.PI/2-TAU/12*(1-sweep)-.9*(1-g);s.fill(K,ribbon([[x,y],[x+Math.cos(ha)*r*.8,y+Math.sin(ha)*r*.8]],10,{seed:3,taper:.6,wobble:0}),.95);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tp=tau4(tt-1/12);
  const tN=CUE(3,'Never'),tL=CUE(3,'last minute'),tR=CUE(3,'Time your run'),tJp=CUE(3,'jump'),tM=CUE(3,'meet the ball'),tF=CUE(3,'forehead');
  stadium(s,c,t,[0,1],{roar:.35+.5*sm(tN,tN+.6,t)*(1-sm(tL+1,tL+2,t))+.6*sm(tF+.2,tF+.8,t)});
  ground(s,c);
  // "Time your run": her run's footprints light up in order as she arrives at the far post; the cross's path arrives at the same spot
  const run=sm(tR-.2,tR+.3,t)*(1-sm(tM+.2,tM+.8,t));
  if(run>0){const dim=new Path2D(),lit=new Path2D();for(let k=0;k<9;k++){const Tk=-1.2+k*((TJ-.2+1.2)/8),[x,z]=posOf(WAM,Tk),v=velOf(WAM,Tk),n=nrm2(-v[1],v[0]),side=k%2?.14:-.14,pts:Pt[]=[];
    for(let i=0;i<12;i++){const a=i/12*TAU,p=pr(c,[x+n[0]*side+Math.cos(a)*.16,.01,z+n[1]*side+Math.sin(a)*.1]);if(p)pts.push(p);}(Tk<=tau+.02?lit:dim).addPath(polyPath(pts,true));}
   s.knockout(dim,.75*run);s.stroke(K,lit,5,.9*run);s.knockout(lit);s.fill(Y,lit,.95*run);
   const X=pr(c,[HP[0],.01,HP[1]]);if(X){const rr=kAt(c,[HP[0],0,HP[1]])*.5,ring=polyPath(blob(X[0],X[1],rr,rr*.32,7,{n:20}),true);s.stroke(R,ring,Math.max(5,rr*.14),.95*run);}
   const pts:Pt[]=[];for(let i=0;i<=24;i++){const p=pr(c,fly(P0,V_CROSS,lerp(TF*.45,TF,i/24)));if(p)pts.push(p);}
   if(pts.length>2){const gaps:[number,number][]=[];for(let i=0;i<10;i++)gaps.push([(i+.62)/10,(i+.98)/10]);const d=ribbon(partial(pts,sm(tR,tR+1.2,t)),Math.max(7,kAt(c,HEAD_PT)*.06),{seed:21,taper:.2,wobble:.6,gaps});s.knockout(d,.8*run);s.fill(Y,d,.95*run);}}
  const r=play(s,c,tau,tp,{smear:true,min:12,only:[WAM,GK,MARK]});
  // "Never give up": a burst over the stand; "the last minute": the clock
  const ng=sm(tN,tN+.35,t)*(1-sm(tN+1.2,tN+1.7,t));if(ng>0){const q=pr(c,at(WAM,tau,3.2));if(q)sparkBurst(s,Y,q[0],q[1],220*ng,{n:12,seed:9,g:easeOutBack(ng),width:18});}
  clockFace(s,sm(tL-.25,tL+.25,t)*(1-sm(tR+.4,tR+.9,t)),sm(tL,tL+1.1,t,easeInOutSine));
  // "jump": a spark under her take-off, an up arrow beside her
  const jp=sm(tJp-.1,tJp+.3,t)*(1-sm(tM,tM+.4,t));
  if(jp>0){const q=pr(c,[HP[0],.05,HP[1]]);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(70,kAt(c,[HP[0],0,HP[1]])*.7)*jp,{n:9,seed:41,g:easeOutBack(jp),width:12});
   const side:V3=[HP[0]-.9,0,HP[1]-.6];arrow3(s,c,[add3(side,[0,.4,0]),add3(side,[0,.4+.8*jp,0]),add3(side,[0,.4+1.6*jp,0])],Math.max(9,kAt(c,side)*.09),R,.95*jp);}
  // "meet the ball": a ring on the ball as it drops in
  const mb=sm(tM-.15,tM+.25,t)*(1-sm(tF+.3,tF+.8,t));
  if(mb>0&&r.ball){const g=r.ball.g,rr=r.ball.r*1.9,ring:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;ring.push([g[0]+Math.cos(a)*rr,g[1]+Math.sin(a)*rr]);}const rp_=ribbon(ring,Math.max(5,r.ball.r*.28),{seed:8,close:true,wobble:.8,pressure:.2});s.knockout(rp_,.9*mb);s.fill(Y,rp_,.95*mb);}
  // "forehead": her forehead glows at contact and the ball's path is printed into the net
  const fh=sm(tF-.15,tF+.25,t,easeOutBack);
  if(fh>0){const st=stateOf(WAM,tau),sk=solve(st.pose,B_WAM,st.place),hd=sk.head,fc=sk.face,fp=add3(hd,mul3(sub3(fc,hd),1.05)),q=pr(c,add3(fp,[0,.05,0]));
   if(q){const rr=kAt(c,fp)*.07*clamp(fh,0,1.2),glow=polyPath(blob(q[0],q[1],rr,rr*.8,11,{amp:.06,n:16}),true);s.knockout(glow,.8*(1-sm(tF+1.6,tF+2.2,t)));s.fill(Y,glow,.9*(1-sm(tF+1.6,tF+2.2,t)));}
   const arr=sm(tF+.1,tF+1,t,easeInOutSine);if(arr>0){const pts:V3[]=[];for(let i=0;i<=8;i++)pts.push(fly(HEAD_PT,V_HEAD,(TG-TF)*arr*i/8));pts.push(mix3(GOAL_PT,NET_HIT,.4*arr));arrow3(s,c,pts,Math.max(9,kAt(c,HEAD_PT)*.05),Y,.95);}}
 },
 get still(){return CUE(3,'forehead')+.3;},
};
const mul3=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];

const film:RisoStory={
 id:'wambach-header-2011',format:'11v11',title:"Wambach's last-second header",
 theme:'Never give up: time your run, jump, and meet the ball with your forehead',
 ageNote:'USA 2–2 Brazil (USA won 5–3 on penalties), Women’s World Cup quarter-final, Dresden, 10 July 2011. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a little header — a ball drops in on a dashed arc, a yellow spark where it is met, and it flies off. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  const u=clamp(age/.35),out=clamp((age-.35)/.4),fade=1-clamp((age-.6)/.2);
  const bx=age<.35?x-170*(1-u):x+220*easeOut(out),by=age<.35?y-120*(1-u)*(1-u)-10:y+40*out-60*Math.sin(out*Math.PI);
  if(age>.3&&age<.65)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp((age-.3)/.12))*(1-clamp((age-.5)/.15)),width:14});
  if(fade>0)footballPanels(s,bx,by,30,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
/** Solved contact points (pitch metres; Brazil's goal line x = 0, +z = the USA's right) — checked by tests/play-film-wambach-header-2011.cjs. */
export const FACTS={P0,HEAD_PT,HP,GOAL_PT,TF,TG,ballAt,HAND_S,SPOT,SOLO_P,penBall,T_HAND,crossFoot:'l' as const,diveSide:'r' as const,
 kits:{usa:usa(),brazil:brazil(),solo:SOLO_ST,wambach:WAM_ST,rapinoe:RAP_ST},
 rapinoeContact:()=>{const st=stateOf(RAP,0),sk=solve(st.pose,B_RAP,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 wambachAt:(tau:number)=>{const st=stateOf(WAM,tau),sk=solve(st.pose,B_WAM,st.place);return{head:sk.head,face:sk.face,air:st.pose.air,rToe:sk.rToe};},
 andreiaAt:(tau:number)=>{const st=stateOf(GK,tau),sk=solve(st.pose,B_AND,st.place);return{lHa:sk.lHa,rHa:sk.rHa,pelvis:sk.pelvis};}};
