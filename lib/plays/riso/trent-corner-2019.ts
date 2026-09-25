/** Trent Alexander-Arnold's quick corner — "Corner taken quickly... Origi!" Liverpool 4–0 Barcelona (4–3 on aggregate), UEFA Champions
 * League semi-final second leg, Anfield, Liverpool, 7 May 2019. An iconic-play riso film (RisoStory, chapters mode) played by the card's
 * picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction from WRITTEN accounts (the footage itself was not
 * reviewed), rendered as a riso print.
 *
 * SOURCES (Sept 2026, read as raw pages; cached under the build scratchpad films/src-cache/):
 *  - The Guardian, Daniel Taylor, "Liverpool stage sensational comeback to beat Barcelona and reach final" (7 May 2019)
 *    https://www.theguardian.com/football/2019/may/07/liverpool-barcelona-champions-league-semi-final-second-leg-match-report
 *  - The Guardian minute-by-minute, "Liverpool v Barcelona: Champions League semi-final second leg – live!" (7 May 2019)
 *    https://www.theguardian.com/football/live/2019/may/07/liverpool-v-barcelona-champions-league-semi-final-second-leg-live
 *  - The Independent, Simon Hughes, "The ball boy who helped Liverpool complete a Champions League miracle" (9 May 2019)
 *    https://www.independent.co.uk/sport/football/european/liverpool-fc-barcelona-champions-league-2019-divock-origi-goal-ball-boy-ucl-video-a8904461.html
 *  - Wikipedia (raw wikitext): "2018–19 UEFA Champions League knockout phase" (match box), "Trent Alexander-Arnold" (playing style; his
 *    number 66), "Oakley Cannonier" (the ball boy)
 * CONFIRMED by those accounts: 7 May 2019, Anfield, kick-off 21:00 CEST (20:00 local) under the floodlights; Liverpool 4–0 (Origi 7', 79';
 * Wijnaldum 54', 56'), 4–3 on aggregate after losing 3–0 in the first leg, so at 3–0 the tie was level; the goal came in the 79th minute
 * ("with 11 minutes to go"); ball boy Oakley Cannonier, 14, fed Alexander-Arnold the ball quickly (Klopp's staff had told the ball boys to
 * return the ball to Liverpool's players as fast as possible because Barcelona were slow to set up); Alexander-Arnold won the corner, shaped
 * to take it, then WALKED AWAY from the ball as Xherdan Shaqiri ambled over; Barcelona's players switched off / had their backs turned /
 * "fidgeted amongst themselves"; he noticed, went back and quickly played a LOW, accurate cross to Divock Origi, UNMARKED on the edge of the
 * six-yard box ("left all alone in the Barcelona box"), who swept / clipped it past Marc-André ter Stegen; Liverpool wore all red, Barcelona
 * fluorescent yellow ("a blur of fluorescent yellow followed by a clutch of players wearing all red"); Alexander-Arnold wore 66.
 * INFERRED (illustrative reconstruction): which corner (drawn: Liverpool's right, the +z flag, at the Kop end — he is the right-back and
 * right-footed; the side is not stated in the sources and is never narrated); every position, run and timing in metres and seconds (the
 * ball boy's underarm feed, where Trent walked, the few seconds he walked away, his short run back, a ≈32 m cross in ≈1.45 s with one skip,
 * Origi first time with his RIGHT foot, the ball high into the net to ter Stegen's right, ter Stegen organising his defenders then a late
 * dive); where the Barcelona players stood and which way each faced (drawn unnamed, facing away from the corner); the other Liverpool players
 * (unnamed); Shaqiri's and Origi's numbers (23, 27) and every kit detail beyond "all red" / "fluorescent yellow" (Barcelona drawn all yellow
 * with blue trim, ter Stegen in blue, the ball boy in a navy tracksuit); the celebrations; Anfield's stands (the Kop drawn as one great single
 * tier behind the goal, the Main Stand on the camera side), seat and crowd colours, flags, the TV camera positions and lenses.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME (the ball boy's feed, Trent places the ball and
 * walks away, spins back, the corner, Origi, the net, the Kop erupts); ch2 = the TV slow-motion REPLAY from low behind the corner flag, so
 * the Barcelona players' turned backs face us, Trent's look up (a glance line to Origi) and the low cross (a replay trail); ch3 = a second
 * REPLAY angle, high behind the goal: the finish comes at the camera past ter Stegen, then the celebrations; ch4 = the lesson, a close, very
 * slow replay with teaching marks (Origi's switched-on ring, the set-piece ring, Trent's look and scan fan, red arrows showing where the
 * Barcelona players are facing, the quick pass arrow). Composed on the FULL sheet (world units = sheet units centred on the canvas,
 * never sheet.safe), so it frames from the 1.45:1 card window down to square (a narrower window widens the lens a little).
 * FIGURES: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, full range of motion, `prev`
 * secondary motion for hems, motionSmear on the corner, the finish and the dive). Handedness: the world is right-handed (x toward Barcelona's
 * goal, y up, +z = Liverpool's right), exactly athlete.ts's convention, so strike({foot:'r'}) is the RIGHT foot for both Trent and Origi.
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. Heat: small figures print at 'low', at most 4 non-hero figures at full detail, every figure inside a passage
 * is capped. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,partial,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,keeperDive,celebrate,posed,blendPose,keyPoses,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type Build} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'Corner taken quickly',text:'Anfield, 2019, the Champions League semi-final. Liverpool and Barcelona are level. Trent Alexander-Arnold walks away from a corner... then spins back. Corner taken quickly... Origi! Goal!',tail:2.4,
  cues:['Anfield','Champions League','Liverpool and Barcelona','Trent','walks away','spins back','Corner taken','Origi','Goal']},
 {label:'Watch it again',text:"Watch again, slowly. The Barcelona players have turned their backs. They're not ready! Trent looks up, spots Divock Origi all alone, and whips it in low.",tail:1.7,
  cues:['Watch again','turned their backs',"not ready",'Trent looks up','spots','all alone','whips it in low']},
 {label:'Behind the goal',text:'From behind the goal: Origi sweeps it in before anyone can react. Liverpool are in the final!',tail:2.4,
  cues:['From behind','Origi sweeps','before anyone','Liverpool are in the final']},
 {label:'Stay switched on',text:"Stay switched on at every set piece! Look up, scan, and when the other team isn't ready, play it quickly.",tail:1.9,
  cues:['Stay switched on','set piece','Look up','scan','other team','play it quickly']},
];
/** Kokoro timing: null until the lead voices the film. After scripts/plays/kokoro-narrate.py writes
 * public/plays/narration/trent-corner-2019/timing.json, add
 *   import timingJson from '../../../public/plays/narration/trent-corner-2019/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
import timingJson from '../../../public/plays/narration/trent-corner-2019/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('trent: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('trent: no cue '+w);return c.at;};
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
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*clamp(u);
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
/** Pitch: Barcelona's goal line is x = 0 (Liverpool attack +x), goal centre z = 0, +z = Liverpool's right; touchlines z = ±34, halfway x = −52.5. */
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

// ---------------------------------------------------------------- Anfield at night: the Kop behind the goal, two side stands, the Anfield Road end
/** stand planes (a along, b up the rake 0..1): 0 the far side (+z, two tiers), 1 the Kop behind Barcelona's goal (+x: one great single
 * tier), 2 the Main Stand (−z, the camera side, three tiers), 3 the Anfield Road end (−x). The corners are left open (night sky). */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-114,8,a),1.4+23*b,41+30*b],
 (a,b)=>[9+36*b,1.4+31*b,lerp(-40,40,a)],
 (a,b)=>[lerp(8,-114,a),1.4+33*b,-41-37*b],
 (a,b)=>[-114-25*b,1.4+18*b,lerp(38,-38,a)],
];
const STAND_COLS=[100,76,100,64],STAND_ROWS=[13,16,15,10],TIERS=[[.5],[],[.36,.7],[]];
/** flags and banners along the stand fronts: [stand, a, b, 0 = red flag | 1 = red-and-paper halves | 2 = a long red banner] */
const FLAGS:[number,number,number,number][]=[[1,.12,.3,0],[1,.26,.55,1],[1,.4,.2,0],[1,.52,.62,2],[1,.66,.35,0],[1,.8,.5,1],[1,.9,.25,0],[0,.62,.1,2],[0,.8,.55,0],[0,.9,.2,1],[3,.5,.3,0]];
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a May night on Merseyside: a navy sky, a floodlit blue haze low down
 s.field(K,.55,.5);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){[.12,.2,.3].forEach((d,i)=>s.tone(B,polyPath([[-1e4,hz[1]+120-i*160],[1e4,hz[1]+120-i*160],[1e4,hz[1]-190-i*160],[-1e4,hz[1]-190-i*160]],true),d));}
 const planes=new Path2D(),tier=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(const i of which){const S=STANDS[i];addPoly(planes,polyP(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));for(const b of TIERS[i])seg3(c,S(0,b),S(1,b),1.2,tier);
  // a dark roof overhang over the top rows, a paper fascia along its lip
  addPoly(roof,polyP(c,[add3(S(0,1),[0,1.5,0]),add3(S(1,1),[0,1.5,0]),add3(S(1,.7),[0,12,0]),add3(S(0,.7),[0,12,0])]));
  seg3(c,add3(S(0,.7),[0,11.8,0]),add3(S(1,.7),[0,11.8,0]),.5,edge);}
 // red seats under the crowd, the paper tier fascias
 s.knockout(planes);s.tone(R,planes,.66);s.tone(K,planes,.3);s.knockout(tier,.8);
 // the crowd: seeded marks sized by distance (Liverpool red, white, navy; Barcelona's yellow in a far corner of the Anfield Road end); the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si],rows=STAND_ROWS[si];for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(TIERS[si].some(w=>Math.abs(b-w)<.04))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.22)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const away=si===3&&a<.26;const ink=away?(h<.5?3:0):h<.4?1:h<.72?0:h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.75);s.fill(R,inks[1],.95);s.fill(K,inks[2],.9);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.92);s.knockout(edge,.8);
 // flags and banners
 const fl=new Path2D(),half=new Path2D();
 for(const[si,a,b0,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=kind===2?.1:.028,hb=kind===2?.04:.07,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,b0),P(1,b0),P(1,b0+hb),P(0,b0+hb)]);if(q.length<3)continue;fl.addPath(polyPath(q,true));
  if(kind===1)addPoly(half,polyP(c,[P(.5,b0),P(1,b0),P(1,b0+hb),P(.5,b0+hb)]));}
 s.knockout(fl);s.fill(R,fl,.95);s.knockout(half,.9);
 // floodlights along the roof lips
 const lamp=new Path2D();for(const i of which){const S=STANDS[i];for(let k=0;k<7;k++){const u=(k+.5)/7,a=add3(S(u-.025,.7),[0,11,0]),b=add3(S(u+.025,.7),[0,11,0]);if(toCam(c,a)[2]<NEAR+2)continue;seg3(c,a,b,1,lamp);}}
 s.knockout(lamp);s.fill(Y,lamp,.75);
 if(flash>0){const p=new Path2D(),n=Math.round(24*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=9+13*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags
function ground(s:Sheet,c:Cam){
 const g=polyP(c,[[-118,0,-46],[14,0,-46],[14,0,46],[-118,0,46]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 // mowing stripes across the pitch, every 5.25 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.13);
 // advertising boards: red with paper panels (no lettering)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([6,0,-38],[6,0,38]);board([-110,0,-38],[6,0,-38]);board([-110,0,38],[6,0,38]);
 for(let k=0;k<12;k++){const z=-36+k*6.2;addPoly(pn,polyP(c,[[5.9,.25,z],[5.9,.25,z+3.3],[5.9,.68,z+3.3],[5.9,.68,z]]));}
 for(const zz of[-37.9,37.9])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(R,bd,.85);s.fill(K,bd,.3);s.knockout(pn,.85);
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
 s.fill(K,pole,.9);s.knockout(flag);s.fill(R,flag,.95);
}
/** Barcelona's goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep with a sloping roof; bulge pushes the back out around (bz, by) */
function goal3(s:Sheet,c:Cam,bulge:number,bz:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=(z:number)=>X+2+bulge*.75*Math.exp(-Math.pow((z-bz)/1.6,2));
 const zs=[z0,-2.6,-1.3,0,1.8,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.1);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z),1.9,z],.022,mesh,.7);seg3(c,[back(z),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i]),y,zs[i]],[back(zs[i+1]),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.3],[B,.1]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.22]];
/** Liverpool: all red (confirmed), paper trim and numbers (inferred) */
const lfc=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',build:{height:1.8,bulk:1},...o});
/** Barcelona: fluorescent yellow (confirmed); all yellow with blue trim (inferred) */
const fcb=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:Y,shorts:Y,socks:Y,boots:K,skin:SKIN_L,hair:K,line:K,trim:[B,.9],hairStyle:'short',build:{height:1.8,bulk:1},...o});
const B_TAA:Build={height:1.8,bulk:.95},B_ORI:Build={height:1.85,bulk:1.02,thighs:1.04},B_SHA:Build={height:1.69,bulk:1.1,thighs:1.16},B_TER:Build={height:1.87,bulk:.98},B_BOY:Build={height:1.63,bulk:.84,head:1.04};
const TAA_ST=lfc({number:66,skin:SKIN_M,build:B_TAA,seed:66});
const ORI_ST=lfc({number:27,skin:SKIN_D,build:B_ORI,seed:27});
const SHA_ST=lfc({number:23,hair:[K,.85],build:B_SHA,seed:23});
const TER_ST:AthleteStyle={shirt:[B,.95],shorts:[B,.95],socks:[B,.95],boots:K,skin:SKIN_L,hair:[Y,.7],line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:1,numberInk:'paper',build:B_TER,seed:1};
const BOY_ST:AthleteStyle={shirt:[K,.8],shorts:[K,.8],socks:[K,.8],boots:K,skin:SKIN_M,hair:K,line:K,trim:[Y,.9],sleeves:'long',hairStyle:'short',build:B_BOY,seed:14};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Trent's corner)
const BALL_R=.11,GRAV=9.81;
/** the low cross reaches Origi's boot at TF; his finish reaches the goal line TSH later */
const TF=1.45,TSH=.3,TG=TF+TSH;
/** the finish: first time, RIGHT foot, lifted high into the net to ter Stegen's right (−z) — all inferred */
const GOAL_PT:V3=[0,1.78,-1.25],NET_HIT:V3=[1.6,1.35,-1.45],REST:V3=[1.15,BALL_R,-1.2];
/** where Origi meets it: his pelvis at contact, just off the edge of the six-yard box, a little to the near-post side */
const ORI_P:[number,number]=[-6.15,1.55];
const DS=nrm2(GOAL_PT[0]-ORI_P[0],GOAL_PT[2]-ORI_P[1]),YAW_O=yawTo(DS[0],DS[1]);
/** the ball at contact: one radius in front of his right toe at strike()'s contact (solved once, FK) */
const C_BALL:V3=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.6}),B_ORI,{x:ORI_P[0],z:ORI_P[1],yaw:YAW_O});return[sk.rToe[0]+DS[0]*.12,Math.max(BALL_R,sk.rToe[1]+.05),sk.rToe[2]+DS[1]*.12];})();
/** the corner spot (ball in the quadrant at the +z corner flag) */
const P0:V3=[-.45,BALL_R,33.55];
/** the cross's ground path: a quadratic curve bowed toward the goal line (it curls away from goal off a right foot) */
const QC:[number,number]=[(P0[0]+C_BALL[0])/2+1.7,(P0[2]+C_BALL[2])/2];
const bez=(u:number):[number,number]=>{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*P0[0]+b*QC[0]+c*C_BALL[0],a*P0[2]+b*QC[1]+c*C_BALL[2]];};
/** Trent strikes along the cross's launch direction */
const DC=nrm2(QC[0]-P0[0],QC[1]-P0[2]),YAW_T=yawTo(DC[0],DC[1]);
/** where Trent's pelvis stands at contact so his RIGHT boot meets the back of the ball (solved once, FK) */
const PCT:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.8}),B_TAA,{x:0,z:0,yaw:YAW_T});return[P0[0]-DC[0]*.12-sk.rToe[0],P0[2]-DC[1]*.12-sk.rToe[2]];})();
const LEFT_T:[number,number]=[DC[1],-DC[0]];
const tp=(u:number):[number,number]=>[PCT[0]+DC[0]*u,PCT[1]+DC[1]*u];
/** the run back: from up the touchline, behind the ball and to its left (a right-footer's angle) */
const RUN0:[number,number]=[PCT[0]-DC[0]*2.6+LEFT_T[0]*1.5,PCT[1]-DC[1]*2.6+LEFT_T[1]*1.5];
/** the ball boy's feed (underarm, inferred) and Trent placing the ball in the quadrant */
const T_TOSS=-8.9,T_CATCH=-8.35,T_PLACE=-6.55;

// ---------------------------------------------------------------- tracks: [τ, x, z], Hermite-interpolated (all illustrative, see header)
type Role='taa'|'ori'|'sha'|'gk'|'boy'|'lfc'|'fcb';
/** look = the yaw a Barcelona player faces while switched off; react = how late (s after the corner) he turns to the ball */
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];hero?:boolean;look?:number;react?:number};
const T0=-11,T1=12,DT=.02;
const WALK:[number,number]=[-4.3,36.35];
const ACTORS:Actor[]=[
 {name:'Trent Alexander-Arnold',role:'taa',hero:true,style:TAA_ST,keys:[[T0,1.5,35.6],[T_CATCH-.3,1.35,35.45],[T_CATCH+.2,1.2,35.3],[-7.3,.45,34.75],[T_PLACE,.1,34.45],[-6.1,-.25,34.6],[-5.2,-1.35,35.2],[-3.7,-2.95,35.95],[-2.5,WALK[0],WALK[1]],[-1.95,WALK[0]+.05,WALK[1]+.02],[-1.1,...RUN0],[-.45,...tp(-1.3)],[0,...tp(0)],[.6,...tp(.8)],[TG+.4,...tp(1.6)],[TG+2.2,-3.6,30.5],[T1,-8,24]]},
 {name:'Divock Origi',role:'ori',hero:true,style:ORI_ST,keys:[[T0,-7.6,3.4],[-5,-7.2,3],[-2,-6.9,2.55],[-1,-6.8,2.3],[TF-1,ORI_P[0]-DS[0]*.8,ORI_P[1]-DS[1]*.8],[TF-.3,ORI_P[0]-DS[0]*.2,ORI_P[1]-DS[1]*.2],[TF,...ORI_P],[TF+.45,ORI_P[0]+DS[0]*.5,ORI_P[1]+DS[1]*.5],[TG+1.2,-4.2,5],[TG+3.2,-3,13],[T1,-2,22]]},
 {name:'Marc-André ter Stegen',role:'gk',hero:true,style:TER_ST,keys:[[T0,-1.3,2.4],[-4,-1.5,3],[-1,-1.4,3.35],[.4,-1.3,3.3],[TF-.2,-1,2.7],[TF+.1,-.95,2.6],[T1,-.95,2.6]]},
 {name:'Xherdan Shaqiri',role:'sha',hero:true,style:SHA_ST,keys:[[T0,-14.2,25.4],[-7,-12.2,27.4],[-4,-9.8,29.4],[-1.5,-7.6,30.9],[0,-6.9,31.3],[1,-6.8,31.2],[TG+1,-6.6,30.4],[T1,-7.5,26]]},
 {name:'ball boy (Oakley Cannonier)',role:'boy',hero:true,style:BOY_ST,keys:[[T0,4.5,36.3],[T1,4.5,36.3]]},
 // Barcelona, switched off: backs to the corner, talking, walking back (drawn unnamed)
 {name:'Barcelona 1',role:'fcb',style:fcb({seed:41,build:{height:1.9}}),look:yawTo(-1,-.3),react:.35,keys:[[T0,-3.4,5.6],[-3,-3.6,5.2],[0,-3.8,5],[T1,-3.6,4]]},
 {name:'Barcelona 2',role:'fcb',style:fcb({seed:42,skin:SKIN_M}),look:yawTo(-.9,-.35),react:.6,keys:[[T0,-8.1,-1.2],[-3,-7.9,-.8],[0,-7.7,-.6],[T1,-6.8,-.2]]},
 {name:'Barcelona 3',role:'fcb',style:fcb({seed:43,build:{height:1.84}}),look:yawTo(.3,-1),react:.8,keys:[[T0,-10.8,3.4],[-3,-10.5,2.9],[0,-10.4,2.6],[T1,-9,2]]},
 {name:'Barcelona 4',role:'fcb',style:fcb({seed:44}),look:yawTo(1,-.5),react:.5,keys:[[T0,-10.6,9.6],[-3,-9.3,8.2],[0,-8.6,7.4],[T1,-6.5,5]]},
 {name:'Barcelona 5',role:'fcb',style:fcb({seed:45,skin:SKIN_D,build:{height:1.86}}),look:yawTo(1,-.4),react:.9,keys:[[T0,-13.8,-3.8],[-3,-13.6,-3.5],[0,-13.4,-3.3],[T1,-11,-2]]},
 {name:'Barcelona 6',role:'fcb',style:fcb({seed:46}),look:yawTo(-1,.1),react:.7,keys:[[T0,-16.6,7.2],[-3,-16.3,6.8],[0,-16.1,6.6],[T1,-13,5]]},
 {name:'Barcelona 7',role:'fcb',style:fcb({seed:47,hairStyle:'long'}),look:yawTo(-.6,-1),react:.55,keys:[[T0,-3.2,-4.8],[-3,-3.3,-4.4],[0,-3.4,-4.2],[T1,-2.8,-3]]},
 {name:'Barcelona 8',role:'fcb',style:fcb({seed:48}),look:yawTo(-1,-.6),react:1,keys:[[T0,-17.5,15.5],[-3,-19.6,13.4],[0,-20.8,12.2],[T1,-19,10]]},
 {name:'Barcelona 9',role:'fcb',style:fcb({seed:49,build:{height:1.7}}),look:yawTo(-.2,-1),react:.4,keys:[[T0,-9.6,16.8],[-3,-10.4,13.6],[0,-10.8,12.3],[T1,-10,9]]},
 // Liverpool's other players in and around the box (drawn unnamed)
 {name:'Liverpool 1',role:'lfc',style:lfc({seed:61,skin:SKIN_M,build:{height:1.93,bulk:1.06}}),keys:[[T0,-9.4,-3.2],[-3,-9.1,-2.8],[0,-8.9,-2.6],[TF,-8,-2],[TG+1.2,-6.4,1.2],[T1,-4,10]]},
 {name:'Liverpool 2',role:'lfc',style:lfc({seed:62}),keys:[[T0,-12.9,4.8],[-3,-12.6,4.4],[0,-12.4,4.2],[TF,-11.2,3.6],[TG+1.2,-8.2,4.2],[T1,-5,12]]},
 {name:'Liverpool 3',role:'lfc',style:lfc({seed:63,skin:SKIN_D}),keys:[[T0,-18.5,-7.5],[-3,-18,-7],[0,-17.8,-6.8],[TF,-16.4,-5.6],[TG+1.4,-12,-1],[T1,-7,8]]},
];
const TAA=0,ORI=1,GK=2,SHA=3,BOY=4;
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
/** the cross: along the bowed ground path, decelerating a little; one low hop, a skip, and a smaller hop up to Origi's boot */
const UB=.6,H1=.72,H2=.2;
function crossAt(tau:number):V3{const x=clamp(tau/TF),u=x*(1.2-.2*x),[gx,gz]=bez(u);
 let y:number;if(u<UB){const v=u/UB;y=BALL_R+H1*4*v*(1-v);}else{const v=(u-UB)/(1-UB);y=lerp(BALL_R,C_BALL[1],v)+H2*4*v*(1-v);}
 return[gx,y,gz];}
/** the ball in someone's hands (ball boy or Trent): between the palms */
function handBall(k:number,tau:number):V3{const st=stateOf(k,tau),sk=solve(st.pose,ACTORS[k].style.build,st.place);return[(sk.lHa[0]+sk.rHa[0])/2,(sk.lHa[1]+sk.rHa[1])/2,(sk.lHa[2]+sk.rHa[2])/2];}
function ballAt(tau:number):V3{
 if(tau<T_TOSS)return handBall(BOY,tau);
 if(tau<T_CATCH){const u=(tau-T_TOSS)/(T_CATCH-T_TOSS),b=handBall(TAA,T_CATCH),a=handBall(BOY,T_TOSS);return[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+1.1*4*u*(1-u),lerp(a[2],b[2],u)];}
 if(tau<T_PLACE-.15)return handBall(TAA,tau);
 if(tau<T_PLACE){const u=easeOut((tau-(T_PLACE-.15))/.15),h=handBall(TAA,T_PLACE-.15);return mix3(h,P0,u);}
 if(tau<=0)return P0;
 if(tau<TF)return crossAt(tau);
 if(tau<TG){const v=(tau-TF)/TSH,p=mix3(C_BALL,GOAL_PT,v);p[1]+=.25*Math.sin(Math.PI*v);return p;}
 if(tau<TG+.14)return mix3(GOAL_PT,NET_HIT,easeOut((tau-TG)/.14));
 const u=clamp((tau-TG-.14)/.55),b=u>=1?.1*Math.abs(Math.sin((tau-TG-.69)*9))*Math.exp(-(tau-TG-.69)*3.5):0;
 return[lerp(NET_HIT[0],REST[0],u),Math.max(BALL_R,lerp(NET_HIT[1],BALL_R,u*u))+b,lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?0:tau<TF?tau*TAU*5:TF*TAU*5+(tau-TF)*TAU*3;
const bulgeAt=(tau:number)=>tau<TG+.08?0:Math.exp(-(tau-TG-.08)*2.4)*(1+.3*Math.sin((tau-TG)*14));

// ---------------------------------------------------------------- poses from the tracks
function loco(k:number,tau:number):Pose{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),q=clamp((sp-1.6)/5.5),ph=distOf(k,tau)/(1.5+2.9*q+.4*clamp(sp/1.6))+k*.37;
 const run=runCycle(ph,{speed:q,stride:lerp(.6,1,clamp(sp/3))});
 // walking pace: the run cycle damped (no flight, arms low)
 const walk=blendPose(stand(),runCycle(ph,{speed:0,stride:.55}),.62);walk.air=0;
 const mover=sp<2.2?blendPose(walk,run,clamp((sp-1.4)/.8)):run;
 // standing about at a set piece: knees soft, a small sway
 const idle=blendPose(stand(),posed({lHipF:20,rHipF:16,lKnee:24,rKnee:22,lean:10,pitch:3,neckP:-6,lShA:20,rShA:18,lElb:34,rElb:30}),.5+.5*Math.sin(tau*1.5+k));
 return blendPose(idle,mover,clamp((sp-.2)/.7));
}
/** face along the run when moving, else toward the target (blended, so turns are continuous) */
function faceYaw(k:number,tau:number,target:V3):number{
 const v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),p=posOf(k,tau),tx=target[0]-p[0],tz=target[2]-p[1],tl=Math.hypot(tx,tz)||1,w=clamp((sp-.6)/1.6);
 return yawTo(lerp(tx/tl,v[0]/(sp||1),w),lerp(tz/tl,v[1]/(sp||1),w));
}
const win=(t:number,a:number,b:number,e=.15)=>sm(a,a+e,t)*(1-sm(b-e,b,t));
const RAD=Math.PI/180;
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const HOLD:Partial<Pose>={lShF:52,rShF:52,lShA:6,rShA:6,lShR:-24,rShR:-24,lElb:96,rElb:96,lHand:.9,rHand:.9,neckP:12};
const CATCH:Partial<Pose>={lShF:78,rShF:78,lShA:14,rShA:14,lElb:36,rElb:36,lHand:1,rHand:1,neckP:-10,lean:6};
const PLACE:Partial<Pose>={lHipF:72,rHipF:36,lKnee:96,rKnee:58,lean:42,pitch:10,neckP:34,lShF:74,rShF:70,lShA:10,rShA:10,lElb:26,rElb:26,lHand:1,rHand:1};
const DEJECT=posed({lHipF:22,rHipF:22,lKnee:24,rKnee:24,lean:26,pitch:6,neckP:30,lShA:40,rShA:40,lShF:150,rShF:150,lElb:128,rElb:128});
/** switched off: chatting (one arm out, pointing) or hands on hips */
const CHAT:Partial<Pose>={rShF:64,rShA:34,rElb:30,rHand:1,lShA:26,lElb:40,neckY:10};
const HIPS:Partial<Pose>={lShA:42,rShA:42,lShF:-6,rShF:-6,lElb:112,rElb:112,lShR:-40,rShR:-40};
/** ter Stegen organising: pointing up the pitch, shouting */
const ORGANISE:Partial<Pose>={rShF:140,rShA:26,rElb:14,rHand:1,lShA:32,lElb:60,neckP:-14};
/** the ball boy's two-handed underarm feed: ready (ball at the chest) → swing back → release (.42 of 1.2 s = T_TOSS) → follow-through → stand */
const BOY_KEYS:[number,Pose][]=[
 [0,posed({...HOLD,lKnee:34,rKnee:30,lHipF:26,rHipF:22,lean:12})],
 [.25,posed({lShF:-24,rShF:-24,lShA:8,rShA:8,lElb:16,rElb:16,lShR:-20,rShR:-20,lKnee:40,rKnee:44,lHipF:30,rHipF:34,lean:24,neckP:-8,lHand:.9,rHand:.9})],
 [.42,posed({lShF:62,rShF:62,lShA:8,rShA:8,lElb:10,rElb:10,lShR:-20,rShR:-20,lKnee:18,rKnee:22,lHipF:10,rHipF:14,lean:8,neckP:-14,lHand:1,rHand:1})],
 [.62,posed({lShF:84,rShF:84,lShA:12,rShA:12,lElb:12,rElb:12,lKnee:12,rKnee:14,lHipF:4,rHipF:8,lean:2,neckP:-12,lHand:1,rHand:1})],
 [1,stand()],
];
/** ter Stegen: a late dive to his right (−z for a keeper facing −x), reaching high */
const T_DIVE=TF+.03,DIVE_L=.9;
type State={pose:Pose;place:Place};
function stateOf(k:number,tau:number):State{
 const a=ACTORS[k],[x,z]=posOf(k,tau);let pose=loco(k,tau),yaw=0;
 switch(a.role){
  case 'taa':{
   // waits for the feed, catches, carries the ball to the quadrant, places it, walks away along the touchline, looks back, runs back, strikes
   if(tau<T_CATCH+.2){yaw=faceYaw(k,tau,[4.5,0,36.3]);pose=over(pose,CATCH,sm(T_CATCH-.6,T_CATCH-.25,tau));}
   else if(tau<T_PLACE+.25){yaw=faceYaw(k,tau,P0);}
   else if(tau<-2.2){const v=velOf(k,tau);yaw=Math.hypot(v[0],v[1])>.3?yawTo(v[0],v[1]):yawTo(-1,.3);}
   else if(tau<-1.95){yaw=yawTo(-1,.3);}
   else{yaw=faceYaw(k,tau,P0);}
   if(tau>T_CATCH-.3&&tau<T_PLACE)pose=over(pose,HOLD,sm(T_CATCH-.25,T_CATCH+.05,tau)*(1-sm(T_PLACE-.5,T_PLACE-.3,tau)));
   pose=over(pose,PLACE,win(tau,T_PLACE-.55,T_PLACE+.35,.3));
   // the look back over his right shoulder into the box (he "noticed what was going on"), then the turn
   const look=win(tau,-2.75,-1.9,.3);if(look>0){pose=over(pose,{neckY:-70,twist:-26,neckP:-4},look);}
   const turn=sm(-2.05,-1.55,tau,easeInOutSine);if(turn>0&&tau<-.8)yaw=lerpAng(yawTo(-1,.3),faceYaw(k,tau,P0),turn);
   // the strike: a short quick run and a whipped RIGHT-foot delivery
   const w=win(tau,-.5,.85,.2);if(w>0)pose=blendPose(pose,strike(clamp(tau/1.0+STRIKE_CONTACT),{foot:'r',power:.8}),w);
   yaw=lerpAng(yaw,YAW_T,sm(-.9,-.4,tau)*(1-sm(.85,1.4,tau)));
   if(tau>1.4&&tau<TG+.2)yaw=lerpAng(yaw,faceYaw(k,tau,C_BALL),sm(1.2,1.6,tau));
   if(tau>TG+.2){const j=celebrate((tau-TG)*1.2,{kind:'arms'});pose=blendPose(pose,j,sm(TG+.2,TG+.6,tau)*(1-sm(TG+1.9,TG+2.4,tau)));const r=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,r,sm(TG+1.9,TG+2.4,tau));yaw=tau<TG+1.9?faceYaw(k,TG+.2,C_BALL):yaw;}
   break;}
  case 'ori':{
   // alert and ready, facing the corner; he moves onto it and sweeps it in first time with his right foot
   yaw=faceYaw(k,tau,P0);
   const ready=posed({lHipF:30,rHipF:28,lKnee:36,rKnee:34,lHipA:8,rHipA:8,lean:14,pitch:4,lShA:24,rShA:24,lElb:44,rElb:44,neckP:-4});
   if(tau<TF-1.1)pose=blendPose(pose,ready,.7);
   if(tau>-.2&&tau<TF)yaw=faceYaw(k,tau,ballAt(tau));
   const w=win(tau,TF-.5,TF+.85,.2);if(w>0){pose=blendPose(pose,strike(clamp((tau-TF)/.9+STRIKE_CONTACT),{foot:'r',power:.6}),w);}
   yaw=lerpAng(yaw,YAW_O,sm(TF-.7,TF-.35,tau)*(1-sm(TF+.8,TF+1.2,tau)));
   if(tau>TG+.3){const r=celebrate(distOf(k,tau)/4.2,{kind:'run'});pose=blendPose(pose,r,sm(TG+.3,TG+.9,tau));}
   break;}
  case 'gk':{const set=keeperSet(tau*1.3);pose=blendPose(set,pose,clamp((Math.hypot(...velOf(k,tau))-.3)/.8));
   yaw=yawTo(-1,.15);pose=over(pose,ORGANISE,win(tau,-6,.35,.4));
   const ball=ballAt(Math.max(tau,.01));if(tau>.2)yaw=lerpAng(yaw,faceYaw(k,tau,ball),sm(.2,.6,tau));
   if(tau>T_DIVE-.15){pose=blendPose(pose,keeperDive(clamp((tau-T_DIVE)/DIVE_L),{side:'r',height:.8}),sm(T_DIVE-.15,T_DIVE,tau));yaw=faceYaw(k,T_DIVE,C_BALL);}
   if(tau>TG+1.6)pose=blendPose(pose,DEJECT,sm(TG+1.9,TG+2.6,tau)*.6);
   break;}
  case 'sha':{yaw=faceYaw(k,tau,P0);if(tau>0)yaw=faceYaw(k,tau,ballAt(Math.min(tau,TG)));
   if(tau>TG+.3){const j=celebrate((tau-TG)*1.1,{kind:'arms'});pose=blendPose(pose,j,sm(TG+.3,TG+.8,tau)*.85);}
   break;}
  case 'boy':{const[tx,tz]=posOf(TAA,T_CATCH);yaw=yawTo(tx-x,tz-z);
   // ready by the boards with the ball, the two-handed underarm feed (release at T_TOSS), then he stands and watches
   pose=keyPoses(clamp((tau-(T_TOSS-.5))/1.2),BOY_KEYS);
   if(tau>T_TOSS+1.5)yaw=lerpAng(yaw,yawTo(-6-x,4-z),sm(T_TOSS+1.5,T_TOSS+2.5,tau));
   break;}
  case 'fcb':{
   // switched off: facing away from the corner, chatting or hands on hips; they turn to the ball only after it is struck, too late
   const rt=a.react??.5;yaw=a.look??0;pose=over(pose,k%2?CHAT:HIPS,1-sm(rt-.1,rt+.25,tau));
   if(tau>rt)yaw=lerpAng(yaw,faceYaw(k,tau,ballAt(Math.min(tau,TG))),sm(rt,rt+.45,tau));
   if(tau>rt-.2&&tau<rt+.6)pose=over(pose,{neckY:30*(k%2?1:-1)},win(tau,rt-.2,rt+.6,.2));
   if(tau>TG+.5)pose=blendPose(pose,DEJECT,sm(TG+.8,TG+1.8,tau)*.8);
   break;}
  case 'lfc':{yaw=faceYaw(k,tau,tau<-.2?P0:ballAt(Math.min(tau,TG)));
   if(tau>TG+.3){const j=celebrate(distOf(k,tau)/4.2+k*.3,{kind:'arms'});pose=blendPose(pose,j,sm(TG+.4,TG+1,tau)*.7);}
   break;}
 }
 return{pose,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair and the shirt hem trail), smear = halftone echo + speed lines on fast limbs (the corner, the finish, the dive). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:State,smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball + the scene assembly
function drawBall(s:Sheet,c:Cam,P:V3,rot:number,o:{min?:number;prevP?:V3|null;lines?:boolean}={}){
 const q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??12,c.F*BALL_R/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05&&P[2]<34.5)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.08,.5));
 if(o.lines&&o.prevP){const a=pr(c,o.prevP);if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot,key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
type Item={d:number;draw:()=>void};
const FULL_CAP=4;
type Fig={st:State;prev?:State;style:AthleteStyle;hero:boolean;smear?:boolean};
/** depth-sorts figures, the ball and the goal (far first). Heat: small figures print at `low`; inside a passage every figure is capped. */
function drawScene(s:Sheet,c:Cam,figs:Fig[],ball:{P:V3;rot:number;min?:number;prevP?:V3|null;lines?:boolean}|null,goal:{bulge:number;bz:number}|null):{ball:{g:Pt;r:number}|null}{
 const v=view(s),items:Item[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 // heat cap: at most FULL_CAP big non-hero figures print at full detail (the nearest); the rest print 'low'
 const near=figs.filter(f=>!f.hero).map(f=>toCam(c,[f.st.place.x??0,.9,f.st.place.z??0])[2]).filter(d=>d>=1).sort((a,b)=>a-b),dCap=near.length>FULL_CAP?near[FULL_CAP-1]:1e9;
 for(const f of figs){const q=toCam(c,[f.st.place.x??0,.9,f.st.place.z??0]);if(q[2]<1)continue;const g=scr(c,q),k=c.F/q[2]*1.8;if(Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k)continue;
  const px=k*ppu,style:AthleteStyle=passing?{...f.style,detail:f.hero?'mid':'low'}:(!f.hero&&(px<120||q[2]>dCap))||px<44?{...f.style,detail:'low'}:f.style;
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
  smear:o.smear&&((k===TAA&&tau>-.25&&tau<.35)||(k===ORI&&tau>TF-.25&&tau<TF+.3)||(k===GK&&tau>T_DIVE+.1&&tau<T_DIVE+.7))};});
 return drawScene(s,c,figs,{P:ballAt(tau),rot:spinAt(tau),min:o.min,lines:o.lines,prevP:o.prevBall!==undefined?ballAt(o.prevBall):null},{bulge:bulgeAt(tau),bz:REST[2]});
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
/** steps: [start, duration, shot]; each step eases in over the previous result */
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
const at=(k:number,tau:number,y=1):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};
const ORI3:V3=[ORI_P[0],1,ORI_P[1]];
/** the replays open after the feed: the ball boy stays out of them (he would stand in front of the low corner cameras) */
const NO_BOY=ACTORS.map((_,k)=>k).filter(k=>k!==BOY);

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time
/** τ from chapter time: the feed and the walk-away under the opening words, then ≈ real time from the corner to the net */
function tau1(t:number){const tC=CUE(0,'Corner taken')-.05,tO=CUE(0,'Origi')+.15,k=clamp(TF/Math.max(.5,tO-tC),.85,1.2);
 if(t>=tC)return(t-tC)*k;
 return key(t,mono([[0,-10.2],[CUE(0,'Liverpool and'),-9.2],[CUE(0,'Trent'),-7.4],[CUE(0,'walks away'),-5.8],[CUE(0,'spins back'),-2.1],[tC,0]]),linear);}
const P1:V3=[-24,22,-64];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-7,0,17],fov:17})],
  [CUE(0,'Liverpool and')-.3,1.4,()=>({P:P1,T:mix3(at(TAA,tau,1),[1.5,1,35],.4),fov:4.2})],
  [CUE(0,'walks away')-.2,1,()=>({P:P1,T:mix3(at(TAA,tau,1),P0,.35),fov:4.6})],
  [CUE(0,'spins back')-.1,1.1,()=>({P:P1,T:mix3(at(TAA,tau,1),[-6,1,14],.45),fov:10})],
  [CUE(0,'Corner taken')+.05,.9,()=>({P:P1,T:mix3([b[0],1.2,b[2]],ORI3,.35+.4*sm(0,TF,tau)),fov:lerp(9,6.5,sm(0,TF,tau))})],
  [CUE(0,'Origi')-.1,.7,()=>({P:P1,T:mix3(ORI3,[0,1.3,-.5],.45),fov:4.8})],
  [CUE(0,'Goal')+.35,1.6,()=>({P:P1,T:mix3(at(ORI,tau,1.2),at(TAA,tau,1.2),.35),fov:8})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tt=twos(t),tau=tau1(tt),tp=tau1(tt-1/12),tG=CUE(0,'Goal'),tN=CUE(0,'Origi')+.25;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.5,t),flash:sm(tG-.2,tG+.3,t)*(1-sm(tG+2,tG+2.8,t))});
  ground(s,c);
  play(s,c,tau,tp,{min:16,lines:true,prevBall:tau1(t-.06)});
 },
 aperture(t){const c=cam1(t),P=ballAt(tau1(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(0,'Corner taken')+.3;},
};

// ---------------------------------------------------------------- 2 · the slow-motion replay from low behind the corner flag: their backs, his look, the low cross
const tau2=(t:number)=>key(t,mono([[0,-3.7],[CUE(1,'turned their'),-3.3],[CUE(1,'not ready'),-2.95],[CUE(1,'Trent looks'),-2.6],[CUE(1,'spots'),-2.25],[CUE(1,'all alone'),-1.9],[CUE(1,'whips'),-.1],[SECS(1)-.2,TF+.3]]),linear);
const E2:V3=[-2.2,2.3,44.5];
function cam2(t:number):Cam{
 const tau=tau2(t),w=at(TAA,tau,1.5),b=ballAt(tau);
 return plan(t,[
  [0,0,()=>({P:E2,T:[-7,.8,9],fov:16})],
  [CUE(1,'turned their')-.2,1.2,()=>({P:E2,T:[-8.5,1,4.5],fov:8.5})],
  [CUE(1,'Trent looks')-.3,.9,()=>({P:add3(E2,[-1.2,-.3,-1]),T:mix3(w,[-6,1,10],.25),fov:9})],
  [CUE(1,'spots')-.1,.9,()=>({P:add3(E2,[-1.2,-.3,-1]),T:mix3(w,ORI3,.6),fov:11})],
  [CUE(1,'whips')-.6,.8,()=>({P:E2,T:mix3([b[0],.9,b[2]],ORI3,.3),fov:14})],
  [CUE(1,'whips')+.5,1.2,()=>({P:E2,T:mix3([b[0],.9,b[2]],ORI3,.75),fov:7.5})],
 ]);
}
/** the replay trail: the cross's path so far, a fading yellow ribbon (printed under the players) */
function trail(s:Sheet,c:Cam,tau:number,fade:number){
 if(fade<=0||tau<=0)return;const pts:Pt[]=[];const a=Math.max(0,tau-.8),b=Math.min(tau,TG);for(let i=0;i<=22;i++){const p=pr(c,ballAt(lerp(a,b,i/22)));if(p)pts.push(p);}
 if(pts.length<3)return;const w=Math.max(8,kAt(c,ballAt(Math.min(tau,TG)))*.16);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);
}
/** his glance: a dashed yellow line from Trent's eyes to Origi (grows with u) */
function glance(s:Sheet,c:Cam,tau:number,u:number,cov=1){
 if(u<=0)return;const st=stateOf(TAA,tau),sk=solve(st.pose,B_TAA,st.place),a=sk.head,[ox,oz]=posOf(ORI,tau),b:V3=[ox,1.6,oz],pts:Pt[]=[];
 for(let i=0;i<=24;i++){const p=pr(c,mix3(a,b,i/24));if(p)pts.push(p);}if(pts.length<3)return;
 const gaps:[number,number][]=[];for(let i=0;i<14;i++)gaps.push([(i+.6)/14,(i+.95)/14]);
 const w=Math.max(7,kAt(c,a)*.06),line=ribbon(partial(pts,u),w,{seed:31,taper:.1,wobble:.5,gaps});s.knockout(line,.85*cov);s.fill(Y,line,.95*cov);
}
function groundRing(s:Sheet,c:Cam,P:V3,rad:number,ink:string,a:number){
 const X=pr(c,[P[0],.01,P[2]]);if(!X||a<=0)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const u=i/24*TAU,p=pr(c,[P[0]+Math.cos(u)*rad,.01,P[2]+Math.sin(u)*rad]);if(p)pts.push(p);}
 if(pts.length<8)return;const w=Math.max(5,kAt(c,P)*.07),band=ribbon(pts,w*1.5,{close:true,seed:5,taper:0,wobble:.6}),core=ribbon(pts,w,{close:true,seed:5,taper:0,wobble:.6});s.fill(K,band,.7*a);s.knockout(core,a);s.fill(ink,core,.95*a);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tt=twos(t),tau=tau2(tt),tpv=tau2(tt-1/12),tS=CUE(1,'spots'),tA=CUE(1,'all alone'),tL=CUE(1,'Trent looks'),tW=CUE(1,'whips');
  stadium(s,c,t,[2,3],{roar:sm(TG,TG+.4,tau),flash:sm(TG+.05,TG+.3,tau)});
  ground(s,c);
  groundRing(s,c,[ORI_P[0],0,ORI_P[1]],1.7,Y,sm(tA-.15,tA+.3,t)*(1-sm(tW+.4,tW+.9,t)));
  trail(s,c,tau,1-sm(TG+.1,TG+.55,tau));
  play(s,c,tau,tpv,{smear:true,min:9,only:NO_BOY});
  glance(s,c,tau,sm(tL,tS+.2,t,easeOut),1-sm(tW-.3,tW,t));
 },
 aperture(t){const c=cam2(t),P=ballAt(tau2(twos(t))),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(14,c.F*BALL_R/q[2]*1.3),12);},
 get still(){return CUE(1,'spots')+.2;},
};

// ---------------------------------------------------------------- 3 · a second replay: high behind the goal, the finish comes at the camera
const tau3=(t:number)=>key(t,mono([[0,TF-1.1],[CUE(2,'Origi sweeps'),TF-.02],[CUE(2,'before anyone'),TG+.3],[CUE(2,'Liverpool are'),TG+1.6],[SECS(2),TG+4.4]]),linear);
const E3:V3=[15,6.8,-8.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),o=at(ORI,tau,1.1),w=at(TAA,tau,1.1);
 return plan(t,[
  [0,0,()=>({P:E3,T:[-7,1,6],fov:26})],
  [CUE(2,'Origi sweeps')-.4,.8,()=>({P:E3,T:[-5,1.1,1.5],fov:19})],
  [CUE(2,'before anyone')-.1,1.1,()=>({P:E3,T:[-4,1,2],fov:25})],
  [CUE(2,'Liverpool are')-.3,1.8,()=>({P:[14,6,-6],T:mix3(o,w,.15),fov:17})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tt=twos(t),tau=tau3(tt),tpv=tau3(tt-1/12),tF=CUE(2,'Liverpool are');
  stadium(s,c,t,[0,2,3],{roar:sm(TG,TG+.4,tau),flash:Math.max(sm(TG+.05,TG+.3,tau)*(1-sm(TG+1.4,TG+2,tau)),sm(tF-.1,tF+.3,t))});
  ground(s,c);
  const r=play(s,c,tau,tpv,{smear:true,min:10,lines:true,prevBall:tau3(t-.06)});
  // the replay graphic: the finish's path printed over the net so the ball reads through the mesh
  const hf=sm(TF-.05,TF+.05,tau)*(1-sm(TG+.3,TG+.8,tau));if(hf>0){const pts:Pt[]=[];for(let i=0;i<=16;i++){const p=pr(c,ballAt(lerp(TF,Math.min(tau,TG),i/16)));if(p)pts.push(p);}
   if(pts.length>2){const w=Math.max(6,kAt(c,C_BALL)*.12);s.stroke(K,ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),3,.8*hf);s.knockout(ribbon(pts,w*1.3,{taper:.9,pressure:.2,wobble:0}),hf);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.95*hf);}}
  const hit=(tau-TF)/.18;if(hit>0&&hit<1&&r.ball)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(50,r.ball.r*4.5),{n:9,seed:23,g:easeOutBack(clamp(hit*2))*(1-clamp((hit-.5)*2)),width:Math.max(6,r.ball.r*.5)});
 },
 aperture(t){const c=cam3v(t),p=stateOf(ORI,tau3(twos(t))),sk=solve(p.pose,B_ORI,p.place),q=pr(c,sk.chest)??[0,0];return apertureDisc(q[0],q[1],60,12);},
 get still(){return CUE(2,'before anyone')+.2;},
};

// ---------------------------------------------------------------- 4 · the lesson: a close, very slow replay with teaching marks
const tau4=(t:number)=>key(t,mono([[0,-3.8],[CUE(3,'set piece'),-3.3],[CUE(3,'Look up'),-2.7],[CUE(3,'scan'),-2.35],[CUE(3,'other team'),-2.05],[CUE(3,'play it'),-.25],[SECS(3),TF+.15]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),w=at(TAA,tau,1.5),b=ballAt(tau),BOX:V3=[2.5,4.4,19.5];
 return plan(t,[
  [0,0,()=>({P:BOX,T:[-7.2,.9,2.6],fov:19})],
  [CUE(3,'set piece')-.25,.9,()=>({P:[4.5,3.1,44],T:[-.9,.4,33.4],fov:13})],
  [CUE(3,'Look up')-.3,.9,()=>({P:[-1.4,3,44.2],T:mix3(w,[-6,1,10],.3),fov:14})],
  [CUE(3,'scan')-.1,.8,()=>({P:[-1.4,3.4,44.8],T:mix3(w,ORI3,.55),fov:19})],
  [CUE(3,'other team')-.3,1,()=>({P:BOX,T:[-8,.8,3.6],fov:22})],
  [CUE(3,'play it')-.25,1.1,()=>({P:[5,7.5,41],T:mix3([b[0],.8,b[2]],ORI3,.45),fov:24})],
 ]);
}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov*.95);s.stroke(K,p,Math.max(2,w*.12),.85*cov);
}
/** "scan": a pale fan swept from Trent's head across the box (his field of view as he looks round) */
function scanFan(s:Sheet,c:Cam,tau:number,sweep:number,cov:number){
 if(cov<=0)return;const st=stateOf(TAA,tau),sk=solve(st.pose,B_TAA,st.place),h=sk.head,a0=Math.atan2(-2-h[2],-20-h[0]),a1=Math.atan2(4-h[2],-2-h[0]),am=lerp(a0,a1,sweep),half=.14;
 const P=(a:number):V3=>[h[0]+Math.cos(a)*38,0,h[2]+Math.sin(a)*38];const pts:Pt[]=[];const e=pr(c,h);if(!e)return;pts.push(e);
 for(let i=0;i<=8;i++){const p=pr(c,P(am-half+2*half*i/8));if(p)pts.push(p);}if(pts.length<4)return;
 const fan=polyPath(pts,true);s.knockout(fan,.4*cov);s.tone(Y,fan,.55*cov);s.stroke(Y,fan,5,.9*cov);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tt=twos(t),tau=tau4(tt),tpv=tau4(tt-1/12);
  const tO=CUE(3,'Stay switched'),tSP=CUE(3,'set piece'),tL=CUE(3,'Look up'),tSc=CUE(3,'scan'),tT=CUE(3,'other team'),tQ=CUE(3,'play it'),E=SECS(3);
  stadium(s,c,t,[2,3],{roar:.3+.5*sm(tQ+.6,tQ+1.2,t)});
  ground(s,c);
  // "Stay switched on": Origi's yellow ring — the one player tuned in
  groundRing(s,c,at(ORI,tau,0),1.1,Y,sm(tO-.1,tO+.35,t)*(1-sm(E-.8,E-.3,t)));
  // "set piece": a red ring round the ball in the quadrant
  groundRing(s,c,P0,.9,R,sm(tSP-.15,tSP+.3,t)*(1-sm(tL+.4,tL+.9,t)));
  // "the other team isn't ready": red arrows on the grass showing where each Barcelona player is facing — away from the ball
  const ar=sm(tT-.15,tT+.35,t)*(1-sm(tQ+.3,tQ+.8,t));
  if(ar>0)ACTORS.forEach((a,k)=>{if(a.role!=='fcb')return;const st=stateOf(k,tau),[x,z]=posOf(k,tau),y=st.place.yaw??0,d:[number,number]=[Math.cos(y),-Math.sin(y)],L=1.9*ar;
   arrow3(s,c,[[x+d[0]*.4,.02,z+d[1]*.4],[x+d[0]*(.4+L*.5),.02,z+d[1]*(.4+L*.5)],[x+d[0]*(.4+L),.02,z+d[1]*(.4+L)]],Math.max(5,kAt(c,[x,0,z])*.1),R,ar);});
  // "play it quickly": the pass arrow from the quadrant to Origi, drawn fast
  const pq=sm(tQ-.1,tQ+.5,t,easeOut)*(1-sm(E-.5,E-.1,t));
  if(pq>0){const pts:V3[]=[];for(let i=0;i<=12;i++){const u=i/12*pq,[gx,gz]=bez(u);pts.push([gx,.05,gz]);}arrow3(s,c,pts,Math.max(13,kAt(c,C_BALL)*.13),Y,1);}
  scanFan(s,c,tau,sm(tSc-.1,tT-.35,t,easeInOutSine),sm(tSc-.15,tSc+.2,t)*(1-sm(tT-.5,tT-.3,t)));
  const r=play(s,c,tau,tpv,{smear:true,min:10,lines:true,prevBall:tau4(t-.06),only:NO_BOY});
  // "Look up": his glance to Origi
  glance(s,c,tau,sm(tL-.1,tL+.6,t,easeOut),1-sm(tT-.5,tT-.3,t));
  // "Stay switched on": a spark over Origi's head
  const so=sm(tO,tO+.35,t)*(1-sm(tO+1.1,tO+1.6,t));if(so>0){const q=pr(c,at(ORI,tau,2.4));if(q)sparkBurst(s,Y,q[0],q[1],Math.max(60,kAt(c,ORI3)*.9)*so,{n:10,seed:9,g:easeOutBack(so),width:12});}
  if(r.ball&&tau>0&&tau<TF){const q=(tau)/.2;if(q<1)sparkBurst(s,Y,r.ball.g[0],r.ball.g[1],Math.max(40,r.ball.r*4),{n:8,seed:19,g:easeOutBack(clamp(q*2))*(1-clamp((q-.5)*2)),width:8});}
 },
 get still(){return CUE(3,'other team')+.3;},
};

const film:RisoStory={
 id:'trent-corner-2019',format:'11v11',title:"Trent's quick corner",
 theme:'Stay switched on at set pieces: scan, and when the other team is not ready, play it quickly',
 ageNote:'Liverpool 4–0 Barcelona (4–3 on aggregate), Champions League semi-final, Anfield, 7 May 2019. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a quick low pass — a spark where it is struck, the ball skims away with speed lines. Reduced motion: the spark. */
 touch(s,x,y,age,seed){
  const r=rng(seed);if(age<=0){sparkBurst(s,Y,x,y,90,{n:8,seed,width:12});return;}
  if(age<.3)sparkBurst(s,Y,x,y,110,{n:9,seed:seed+1,g:easeOutBack(clamp(age/.12))*(1-clamp((age-.15)/.15)),width:14});
  const u=easeOut(clamp(age/.7)),fade=1-clamp((age-.6)/.25),bx=x-260*u,by=y+40*u-60*Math.sin(Math.PI*clamp(age/.7))*.4;
  if(fade>0){speedLines(s,K,bx,by,0,{n:3,seed:seed+2,len:120*fade,spread:26,width:5,cov:.8*fade});footballPanels(s,bx,by,28,{rot:age*16+r()*TAU,key:K,shadow:B,seed:5});}
 },
};
export default film;
/** Solved contact points (pitch metres; Barcelona's goal line x = 0, +z = Liverpool's right) — checked by tests/play-film-trent-corner-2019.cjs. */
export const FACTS={P0,C_BALL,GOAL_PT,TF,TG,ballAt,cornerFoot:'r' as const,finishFoot:'r' as const,
 trentContact:()=>{const st=stateOf(TAA,0),sk=solve(st.pose,B_TAA,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 origiContact:()=>{const st=stateOf(ORI,TF),sk=solve(st.pose,B_ORI,st.place);return{lToe:sk.lToe,rToe:sk.rToe};},
 barcaFacing:(tau:number)=>ACTORS.flatMap((a,k)=>{if(a.role!=='fcb')return[];const st=stateOf(k,tau);return[{yaw:st.place.yaw??0,x:st.place.x??0,z:st.place.z??0}];})};
