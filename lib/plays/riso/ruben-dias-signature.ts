/** Rúben Dias's signature, the brave block — Manchester City 1–0 Inter, UEFA Champions League final, Atatürk Olympic Stadium, Istanbul,
 * Saturday 10 June 2023 (22:00 local, a night final under floodlights). An iconic-play riso film (RisoStory, chapters mode) played by the
 * card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the 88th-minute scramble in City's
 * goalmouth from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives Rúben Dias a signature ("the brave block": get your body in the way, arms behind you),
 * not one match. The best-documented instance in the written sources is this one: City 1–0 up in the final, two minutes from the end,
 * Inter's best chance of the night falls loose a couple of yards from City's goal and Dias throws his head and body in the way, twisting
 * so that the ball goes out for a corner instead of into his own net. City held on and won their first European Cup.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad films/src-cache/; no new fetches were needed):
 *  - The Guardian, Barry Glendenning, live, 10 June 2023 (guardian-mci-int-2023-live), "88 min: It's an ASTONISHING save from Ederson, who
 *    somehow shuffles across his line to save a Lukaku header from point-blank range with his knee. Brozovic's cross from the right was
 *    headed across the face of goal by Gosens and Ederson somehow parried it. The ball broke to Dias, who did extremely well to steer the
 *    ball out for a corner with his header, contorting his body to avoid putting the ball into his own net." Also "64 min: Ruben Dias gets
 *    an important header away" and the line-up changes (Walker on for Stones 82'; Lukaku on 56', Gosens 76', Bellanova 76', Mkhitaryan and
 *    D'Ambrosio 84').  https://www.theguardian.com/football/live/2023/jun/10/manchester-city-v-inter-champions-league-final-2023-live-score-updates
 *  - Inter.it, "Rodri's goal sinks an excellent Inter: City win the Champions League", 10 June 2023 (inter-mci-int-2023): "A minute before
 *    stoppage time, Brozovic's perfect cross was brilliantly laid off by Gosens for Lukaku, whose header somehow found Ederson's knee from
 *    two yards out"; both line-ups with numbers (Dias 3; Lukaku 90, Gosens 8, Brozović 77, Lautaro 10, Dimarco 32, Bellanova 12,
 *    Mkhitaryan 22, Barella 23, Acerbi 15, D'Ambrosio 33).  https://www.inter.it/en/news/manchester-city-inter-champions-league-final-2023
 *  - Wikipedia, "2023 UEFA Champions League final" (raw, wiki-2023-ucl-final): date, ground, 1–0 (Rodri 68'); "a close-range header in the
 *    89th minute, which Ederson blocked with his legs"; City's back three Akanji–Dias–Aké; the kit templates (City sky blue shirts, white
 *    shorts, sky blue socks; Inter blue-and-black stripes, black shorts, black socks).  https://en.wikipedia.org/wiki/2023_UEFA_Champions_League_final
 *  - Kits, stadium and pitch drawing re-used from the approved lib/plays/riso/rodri-final-2023.ts (same match, same night).
 * CONFIRMED by those accounts: the match, date, ground and score (City leading 1–0 at the time); the 88th/89th minute ("a minute before
 * stoppage time"); Brozović's cross FROM THE RIGHT; Gosens heading it back ACROSS THE FACE OF GOAL, laid off for Lukaku; Lukaku's HEADER
 * from about two yards; Ederson shuffling across his line and saving it with his KNEE / legs; the ball BREAKING TO DIAS; Dias HEADING it
 * OUT FOR A CORNER, CONTORTING HIS BODY to avoid putting it into his own net. Kits: City sky blue / white / sky blue; Inter blue-and-black
 * stripes, black (printed navy) shorts and socks. Numbers: Dias 3, Ederson 31, Akanji 25, Aké 6, Walker 2, Rodri 16, Bernardo 20,
 * Gündoğan 8, Foden 47, Grealish 10, Haaland 9; Lukaku 90, Gosens 8, Brozović 77, Lautaro 10, Dimarco 32, Bellanova 12, Barella 23.
 * INFERRED (illustrative): every exact position and timing; the direction of play on screen (Inter attacking left to right toward City's
 * goal from the main-stand camera, which puts Brozović's right wing on the NEAR, main-stand side); Brozović crossing with his right foot
 * from wide of the box; Gosens at the far post; Lukaku a couple of yards out, central; WHICH knee (drawn: Ederson's right); the loop of the
 * rebound; Dias arriving near the post nearer the camera, facing his own goal-line, twisting his neck and shoulders to his right so the
 * ball glances wide of the post; a small jump; his arms held back (the lesson's point, not a documented detail); Ederson's kit (drawn red,
 * never named), the referee's dark kit; who else is in the box and where. The stadium (not from a fetched source): a big oval bowl with a
 * running track (drawn red tartan) round the pitch, open to the night sky, with a crescent roof and arch over the main stand.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (the cross, Gosens back across goal,
 * Lukaku's header, Ederson's knee, the loose ball, Dias's header out, the corner); ch2 = the slow-motion replay from a LOW camera on the
 * near side of the six-yard box (the knee, the loop, the twist, the ball steered wide of his own goal); ch3 = a second replay angle from
 * BEHIND THE GOAL (the header flies past the post toward the camera; out for a corner; City hold on); ch4 = the lesson, low beside the
 * post, beside and behind the goal-line, seeing him side-on (be brave, body in the way of the shot, arms behind you). Composed on the FULL sheet (world units = sheet units centred on the
 * canvas; never sheet.safe), kept in the central ~1000 units so it frames from the 1.45:1 card window down to square (a narrower window
 * widens the lens a little).
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts; small figures and every figure inside a passage print at `low`.
 * Handedness: the world is right-handed (x toward City's goal line, y up, +z = the main-stand side = an Inter attacker's right),
 * athlete.ts's own convention, so Brozović's RIGHT foot crosses without a mirrored projector. Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,keeperSet,header,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets (every cue starts with a plain word:
 * Kokoro splits contractions and hyphens); their `at` and each chapter's `seconds` are ESTIMATES until the Kokoro voice exists. Once the
 * lead has generated public/plays/narration/ruben-dias-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/ruben-dias-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The brave block, live',text:'Istanbul, 2023, the Champions League final. City lead Inter. Gosens heads the cross back, Lukaku heads from two yards... saved by Ederson! The ball breaks loose, and Rúben Dias heads it away. Corner!',tail:2,
  cues:['Istanbul','City lead','Gosens heads','Lukaku','two yards','saved','breaks loose','Dias heads','Corner']},
 {label:'Watch again',text:"Watch again. It bounces off Ederson's knee to Dias. He twists his whole body and steers it wide of his own goal.",tail:1.6,
  cues:['Watch again','bounces','knee','twists','steers it wide','own goal']},
 {label:'Behind the goal',text:'Out for a corner! City held on and won their first Champions League.',tail:2,
  cues:['Out for','corner','City held','first Champions']},
 {label:'Your turn',text:'Your turn: be brave. Get your body in the way of the shot, and keep your arms behind you.',tail:2.2,
  cues:['Your turn','be brave','body in the way','the shot','arms behind']},
];
import timingJson from '../../../public/plays/narration/ruben-dias-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('dias: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('dias: no cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** key() needs increasing times: push each key at least `gap` after the previous one (real voice timings can crowd authored offsets) */
function mono(K:[number,number][],gap=.05):[number,number][]{const o:[number,number][]=[];for(const[t,v] of K)o.push([o.length?Math.max(t,o[o.length-1][0]+gap):t,v]);return o;}

// ---------------------------------------------------------------- inks, vectors
const Y='yellow',R='red',B='blue',K='navy';
const add3=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mix3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const dot3=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const wrap=(a:number)=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};
const lerpAng=(a:number,b:number,u:number)=>a+wrap(b-a)*u;
/** yaw (athlete.ts convention: 0 faces +x, + turns left) that faces from (x,z) toward (x2,z2) */
const yawTo=(x:number,z:number,x2:number,z2:number)=>Math.atan2(-(z2-z),x2-x);
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const bump=(a:number,b:number,t:number)=>Math.sin(Math.PI*clamp((t-a)/(b-a)));
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame(), read by every camera (also aperture()) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
/** half the visible extents with margin for the .68 passage preview */
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: City's goal line is x = 0 (Inter attack +x), goal centre z = 0, +z = the main-stand side, the halfway line x = −52.5. */
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
/** a projected quad only when it is comfortably in front of the camera (near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}
/** a 3D segment as a projected quad (clipped to the near plane); width in metres */
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- the Atatürk at night: an oval bowl round a running track, a crescent roof and arch over the main stand
const CXS=-52.5,NS=56,PE=.55;
/** a point on the oval: angle th round the pitch centre (0 = behind Inter's goal, +90° = the main stand), d metres out from the track's
 * inner edge (a rounded-rectangle superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CXS+(58.5+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD0=12,SD1=54;
const RAKE=(b:number):[number,number]=>[SD0+(SD1-SD0)*b,1.6+27*b];
/** how much of the crescent roof covers the stand at angle th (the main stand, +z; deepest in the middle) */
const roofW=(th:number)=>clamp((Math.sin(th)-.3)/.7);
type Bowl={seg:V3[][];roof:V3[][];seats:{P:V3;h:number}[];lamps:[V3,V3][];arch:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],roof:[],seats:[],lamps:[],arch:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  const wa=roofW(a),wb=roofW(b);
  if(wa>0||wb>0){const fa=lerp(SD1-4,20,Math.sqrt(wa)),fb=lerp(SD1-4,20,Math.sqrt(wb));o.roof.push([rim(a,fa,33+3*wa),rim(b,fb,33+3*wb),rim(b,SD1+2,31),rim(a,SD1+2,31)]);
   if(i%2===0)o.lamps.push([rim(a,fa+.5,32.6+3*wa),rim(b,fb+.5,32.6+3*wb)]);}
  else if(i%3===0)o.lamps.push([rim(a,SD1,30),rim((a+b)/2,SD1,30)]);
  for(let r=0;r<8;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.2)continue;const[d,y]=RAKE((r+.5)/8);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 for(let j=0;j<=24;j++){const th=lerp(.2*Math.PI,.8*Math.PI,j/24),w=Math.sin(Math.PI*j/24);o.arch.push(rim(th,36,34+18*w));}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // a June night over the Bosphorus: a deep printed navy sky, a little blue glow near the rim
 s.field(K,.72,.5);s.field(B,.28,.5);
 const bowl=new Path2D(),roof=new Path2D();
 for(const q of BOWL.seg){const r=quadP(c,q);if(r)addPoly(bowl,r);}
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 s.knockout(bowl);s.tone(B,bowl,.42);s.tone(K,bowl,.34);
 // the crowd: one mark per seat group, sized by distance; sky-blue and white City, blue-and-black Inter, phone lights (yellow); roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.h<.42?0:q.h<.7?1:q.h<.93?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.72);s.fill(B,inks[1],.6);s.fill(K,inks[2],.85);s.fill(Y,inks[3],.95);
 s.knockout(roof);s.fill(K,roof,.9);
 // the arch over the main-stand roof (white steel, catching the floodlights)
 const ar=new Path2D();for(let j=0;j+1<BOWL.arch.length;j++)seg3(c,BOWL.arch[j],BOWL.arch[j+1],1.4,ar,1.5);s.knockout(ar,.85);
 // floodlight rails: lit lamp strips with a glow
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+4)continue;seg3(c,a,b,.9,lamp);seg3(c,a,b,3.4,glow);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash),T12=Math.floor(tt*12);for(let i=0;i<n;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;
  const z=9+13*flash;p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- the track, grass, lines, boards, corner flags, the goal
const ringPts=(d:number,n=64):V3[]=>{const o:V3[]=[];for(let i=0;i<n;i++)o.push(rim(i/n*TAU,d,0));return o;};
const TRACK_OUT=ringPts(9.5),TRACK_IN=ringPts(0),LANES=[1.2,2.4,3.6,4.8,6,7.2,8.4].map(d=>ringPts(d,48));
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 // the running track (red tartan, floodlit), its lane lines, then the grass inside it
 const tr=polyP(c,TRACK_OUT);if(tr.length>2){const p=polyPath(tr,true);s.knockout(p);s.fill(R,p,.72);s.tone(K,p,.2);}
 const ln0=new Path2D();for(const L of LANES)for(let i=0;i<L.length;i++){const a=L[i],b=L[(i+1)%L.length];if(toCam(c,a)[2]<NEAR&&toCam(c,b)[2]<NEAR)continue;seg3(c,a,b,.06,ln0,.6);}s.knockout(ln0,.5);
 const g=polyP(c,TRACK_IN);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.8);
 // mowing stripes across the width, every 5.5 m
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.5,0,-34],[-(k+1)*5.5,0,-34],[-(k+1)*5.5,0,34],[-k*5.5,0,34]]));s.tone(K,st,.14);
 // advertising boards behind the goal and along both touchlines: navy with paper panels (generic)
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([4.2,0,-30],[4.2,0,30]);board([-110,0,-37.5],[3,0,-37.5]);board([-110,0,37.5],[3,0,37.5]);
 for(let k=0;k<9;k++){const z=-28+k*6.4;addPoly(pn,polyP(c,[[4.1,.25,z],[4.1,.25,z+3.3],[4.1,.68,z+3.3],[4.1,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-108+k*6.4;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(B,pn,.45);
 // painted lines
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.1,0,0],[-10.9,0,0],.22,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out low in the right-hand corner (z +3) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=3,back=(z:number,y=0)=>X+2+bulge*.7*Math.exp(-Math.pow((z-bz)/1.5,2))*(y<1?1:.35);
 const zs=[z0,-1.8,0,1.8,3,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,2),1.9,z0],[back(z0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,2),1.9,z1],[back(z1),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,2),1.9,z] as V3)],
  [...zs.map(z=>[back(z),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,2),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.32);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,2),1.9,z],.022,mesh,.7);seg3(c,[back(z,2),1.9,z],[back(z),0,z],.022,mesh,.7);}
 for(let j=1;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.fill(K,mesh,.7);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[R,.42],[Y,.5],[K,.2]];
/** City: sky blue shirts, white shorts, sky blue socks (confirmed); navy numbers and trim (inferred) */
const SKY:InkFill=[B,.5];
const city=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:SKY,shorts:'paper',socks:SKY,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
/** Inter: blue-and-black stripes, black shorts and socks (confirmed; black prints navy); white numbers (inferred) */
const inter=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,pattern:'stripes',patternInk:K,shorts:K,socks:K,boots:K,skin:SKIN_M,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
const DIAS_B={height:1.87,bulk:1.06};
const DIAS_ST=city({number:3,build:DIAS_B,skin:[[Y,.4],[R,.24]],seed:3});
const LUKAKU_B={height:1.91,bulk:1.2},GOSENS_B={height:1.84},BROZ_B={height:1.81},ED_B={height:1.88};
/** Ederson's kit that night is not in the sources: drawn red and never named */
const ED_ST:AthleteStyle={shirt:[R,.9],shorts:[R,.9],socks:[R,.9],boots:K,skin:SKIN_M,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:31,numberInk:K,build:ED_B,seed:31};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,hairStyle:'bald',build:{height:1.86},seed:30};

// ---------------------------------------------------------------- the scramble geometry (τ = seconds after Dias's header)
/** the cross (Brozović, right foot, from the right), Gosens's header back across goal, Lukaku's header, Ederson's knee */
const T_CR=-3.3,T_G=-2.05,T_L=-1.45,T_K=-1.3,T_OUT=.4,T_B1=.75,T_REST=1.6;
const CR:V3=[-19.5,.11,18.5];
/** pelvis spots at the moment of each touch (inferred) */
const GP:[number,number]=[-3.7,-3.9],LP:[number,number]=[-2.7,.8],EDP:[number,number]=[-.75,.15],P_D0:[number,number]=[-1.55,3.25];
/** Dias faces his own goal-line, a little toward the middle; the header glances off to his right, wide of the post */
const YAW_D=yawTo(P_D0[0],P_D0[1],.4,.8);
const YAW_B=yawTo(CR[0],CR[2],GP[0],GP[1]);
/** Brozović's pelvis at the cross: his right instep on the ball (solved once, FK) */
const BP:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r',power:.8}),BROZ_B,{x:0,z:0,yaw:YAW_B}),t=mix3(sk.rAn,sk.rToe,.5);return[CR[0]-t[0],CR[2]-t[2]];})();
/** the contorted header: header() with the neck and shoulders twisted to his right, a side-bend, a small jump, ARMS HELD BEHIND HIM */
const CONTORT:Partial<Pose>={twist:-32,neckY:-40,bend:16,roll:8,lShF:-50,rShF:-50,lShA:24,rShA:24,lElb:22,rElb:22,air:.16};
const DD=.95,D_ST=-.52*DD;
const diasMove=(tau:number):Pose=>over(header(clamp((tau-D_ST)/DD)),CONTORT,bump(-.55,.45,tau));
/** Ederson's knee save: the right knee driven across, hands low and wide (facing out of his goal, −x) */
const KNEE_BLOCK=posed({rHipF:50,rHipA:-8,rHipR:-12,rKnee:74,lHipF:30,lHipA:26,lKnee:54,lAnk:-4,rAnk:10,lean:26,pitch:6,lShA:60,rShA:60,lShF:30,rShF:30,lElb:30,rElb:30,lHand:1,rHand:1,neckP:16});

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'city'|'inter'|'gk'|'ref';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'Dias',role:'hero',st:DIAS_ST,key:true,keys:[[-7,-9.5,1.4],[-3.3,-7.4,1.6],[-2,-4.8,2.2],[-1.3,-3,2.85],[-.55,-2,3.15],[0,...P_D0],[.5,-1.25,3.35],[1.4,-1.05,3.45],[12,-1,3.5]]},
 {name:'Lukaku',role:'inter',st:inter({number:90,skin:SKIN_D,build:LUKAKU_B,seed:90}),key:true,keys:[[-7,-13,-1],[-3.3,-9,.3],[-2.2,-5,.75],[T_L,...LP],[-.8,-2.2,.6],[1,-2.4,.4],[12,-2.6,.3]]},
 {name:'Gosens',role:'inter',st:inter({number:8,build:GOSENS_B,seed:8}),key:true,keys:[[-7,-12,-9],[-3.3,-8.2,-6.4],[-2.6,-5.2,-4.6],[T_G,...GP],[-1,-3.1,-3.5],[12,-3.3,-3.2]]},
 {name:'Brozović',role:'inter',st:inter({number:77,build:BROZ_B,seed:77}),key:true,keys:[[-7,-27,15.5],[-4.4,BP[0]-3.4,BP[1]-1.2],[T_CR,...BP],[-2.2,BP[0]+1.2,BP[1]-.3],[12,BP[0]+3,BP[1]-1]]},
 {name:'Lautaro',role:'inter',st:inter({number:10,build:{height:1.74},seed:10}),keys:[[-7,-14,4],[-3.3,-10,5.2],[-1.4,-5.6,4.8],[0,-4.8,4.3],[12,-4.6,4]]},
 {name:'Dimarco',role:'inter',st:inter({number:32,build:{height:1.75},seed:32}),keys:[[-7,-18,-16],[-3,-13,-12],[0,-9.5,-9],[12,-9,-8]]},
 {name:'Bellanova',role:'inter',st:inter({number:12,build:{height:1.77},seed:12}),keys:[[-7,-21,25],[0,-15.5,23.5],[12,-14.5,22.5]]},
 {name:'Barella',role:'inter',st:inter({number:23,build:{height:1.72},seed:23}),keys:[[-7,-23,2],[0,-17,1.5],[12,-16,1]]},
 {name:'Mkhitaryan',role:'inter',st:inter({number:22,build:{height:1.78},seed:22}),keys:[[-7,-25,-6],[0,-19.5,-5],[12,-18.5,-4]]},
 {name:'Ederson',role:'gk',st:ED_ST,key:true,keys:[[-7,-2.6,1],[-3.3,-1.2,2.2],[-2.3,-1.05,-.9],[-1.75,-.95,-1.3],[T_K,...EDP],[-.6,-.8,.45],[1,-1.1,.9],[12,-1.2,1]]},
 {name:'Akanji',role:'city',st:city({number:25,skin:SKIN_D,build:{height:1.87},seed:25}),key:true,keys:[[-7,-10,-6],[-3.3,-7.2,-5.2],[-2,-4.8,-4.4],[0,-3.5,-2.7],[12,-3.2,-2.3]]},
 {name:'Aké',role:'city',st:city({number:6,skin:SKIN_D,build:{height:1.8},seed:6}),keys:[[-7,-12,6],[-3.3,-9.4,5.6],[-1,-7,4.6],[0,-6.4,4.2],[12,-6,4]]},
 {name:'Walker',role:'city',st:city({number:2,skin:SKIN_D,build:{height:1.83},seed:2}),keys:[[-7,-15,20.5],[-3.3,-16.6,17.4],[-2,-15.4,15.8],[12,-12.5,13.5]]},
 {name:'Rodri',role:'city',st:city({number:16,build:{height:1.9,bulk:1.02},seed:16}),keys:[[-7,-13,2.2],[-3.3,-11,1.6],[0,-7,.6],[12,-6.6,.9]]},
 {name:'Bernardo Silva',role:'city',st:city({number:20,build:{height:1.73},seed:20}),keys:[[-7,-19,10],[0,-12.5,7.5],[12,-11.5,6.5]]},
 {name:'Gündoğan',role:'city',st:city({number:8,build:{height:1.8},seed:88}),keys:[[-7,-17,-4],[0,-11.5,-3],[12,-10.5,-2.5]]},
 {name:'Foden',role:'city',st:city({number:47,build:{height:1.71},seed:47}),keys:[[-7,-25,11],[0,-20.5,9],[12,-19.5,8]]},
 {name:'Haaland',role:'city',st:city({number:9,hair:[Y,.8],hairStyle:'ponytail',build:{height:1.95,bulk:1.1},seed:9}),keys:[[-7,-31,1],[12,-26,1]]},
 {name:'Marciniak',role:'ref',st:REF_ST,keys:[[-7,-24,-9],[0,-18.5,-6.5],[12,-15.5,-5]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const HERO=0,LUKAKU=IX('Lukaku'),GOSENS=IX('Gosens'),BROZ=IX('Brozović'),ED=IX('Ederson'),AKANJI=IX('Akanji');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-7,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const at3=(k:number,tau:number,y=0):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- Ederson (independent of the ball, so his knee can be solved first)
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
/** set position with a side-shuffle while he moves across; the knee block around T_K; he faces out of his goal (−x) throughout */
function edPose(tau:number):Pose{
 const v=velOf(ED,tau),sp=Math.hypot(v[0],v[1]),ph=distOf(ED,tau)/1.1;
 let p=over(keeperSet(tau*1.6),{lHipA:16+14*Math.sin(TAU*ph),rHipA:16-14*Math.sin(TAU*ph),air:.05*Math.abs(Math.sin(TAU*ph))},clamp((sp-.4)/1.2));
 p=blendPose(p,KNEE_BLOCK,Math.min(sm(T_K-.3,T_K-.05,tau),1-sm(T_K+.35,T_K+.8,tau)));
 return p;
}
const ED_YAW=Math.PI;
/** where Lukaku's header meets Ederson's right knee (just in front of it) */
const KNEE:V3=(()=>{const sk=solve(edPose(T_K),ED_B,{x:EDP[0],z:EDP[1],yaw:ED_YAW});return add3(sk.rKn,[-.14,0,0]);})();
/** Lukaku heads down at the knee; Gosens heads back across to Lukaku; both solved at the header contact */
const YAW_L=yawTo(LP[0],LP[1],KNEE[0],KNEE[2]);
const headPt=(b:{height?:number},x:number,z:number,yaw:number,pose:Pose,fwd=.16):V3=>{const sk=solve(pose,b,{x,z,yaw});return add3(sk.head,[Math.cos(yaw)*fwd,.02,-Math.sin(yaw)*fwd]);};
const L_HEAD=headPt(LUKAKU_B,LP[0],LP[1],YAW_L,header(.52));
const YAW_G=yawTo(GP[0],GP[1],L_HEAD[0],L_HEAD[2]);
const G_HEAD=headPt(GOSENS_B,GP[0],GP[1],YAW_G,header(.52));
/** the ball meets Dias's forehead, on the side the rebound comes from */
const C_BALL:V3=(()=>{const sk=solve(diasMove(0),DIAS_B,{x:P_D0[0],z:P_D0[1],yaw:YAW_D}),H=sk.head,dx=KNEE[0]-H[0],dz=KNEE[2]-H[2],l=Math.hypot(dx,dz)||1;return[H[0]+dx/l*.2,H[1]+.03,H[2]+dz/l*.2];})();
/** out over the goal-line wide of the near post, a bounce by the boards, rest */
const OUT:V3=[1.4,.75,7.6],B1:V3=[3.1,.11,10.2],REST:V3=[3.8,.11,11.6];
/** where the header crosses the goal-line (x = 0): outside the post, so a corner */
const XING:V3=mix3(C_BALL,OUT,-C_BALL[0]/(OUT[0]-C_BALL[0]));

// ---------------------------------------------------------------- the ball
const lob=(a:V3,b:V3,u:number,h:number):V3=>{const p=mix3(a,b,u);return[p[0],p[1]+4*h*u*(1-u),p[2]];};
function ballAt(tau:number):V3{
 if(tau<T_CR){const[x,z]=posOf(BROZ,tau),yw=YAW_B;return[x+Math.cos(yw)*.45,.11,z-Math.sin(yw)*.45];}
 if(tau<T_G)return lob(CR,G_HEAD,(tau-T_CR)/(T_G-T_CR),3.2);
 if(tau<T_L)return lob(G_HEAD,L_HEAD,(tau-T_G)/(T_L-T_G),.45);
 if(tau<T_K)return mix3(L_HEAD,KNEE,(tau-T_L)/(T_K-T_L));
 if(tau<0){const t=tau-T_K,p=mix3(KNEE,C_BALL,t/-T_K);return[p[0],p[1]+4.905*t*(-T_K-t),p[2]];}
 if(tau<T_OUT)return lob(C_BALL,OUT,tau/T_OUT,.15);
 if(tau<T_B1)return lob(OUT,B1,(tau-T_OUT)/(T_B1-T_OUT),.1);
 return mix3(B1,REST,easeOut(clamp((tau-T_B1)/(T_REST-T_B1))));
}
const spinAt=(tau:number)=>TAU*(tau<T_CR?1.5*tau:3*tau);

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** hands on heads (Inter) after the chance goes */
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
/** eyes up on the looping ball */
const LOOK_UP:Partial<Pose>={neckP:-34,lean:6};
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,T_REST));
 if(k===ED){const yaw=ED_YAW;return{p:over(edPose(tau),{neckY:clamp(Math.atan2(b[2]-z,-(b[0]-x))*-.6,-1,1)/RAD,neckP:tau>T_K+.1&&tau<.6?-26:0},.8),yaw};}
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='inter'||a.role==='city'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===BROZ){const D=.8,u=(tau-(T_CR-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.8}),w);yaw=lerpAng(yaw,YAW_B,w);}}
 if(k===GOSENS){const D=.9,u=(tau-(T_G-.52*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,header(Math.min(1,u)),w);yaw=lerpAng(yaw,YAW_G,w);}}
 if(k===LUKAKU){const D=.9,u=(tau-(T_L-.52*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,header(Math.min(1,u)),w);yaw=lerpAng(yaw,YAW_L,w);}
  if(tau>T_K+.2&&tau<-.1)p=over(p,LOOK_UP,bump(T_K+.2,-.1,tau));}
 if(k===AKANJI&&tau>T_G-.5&&tau<T_G+.5)p=over(p,{lShA:30,rShA:30,neckP:-30,air:.2},bump(T_G-.5,T_G+.5,tau)*.8);
 if(k===HERO){
  // eyes on the loop, then the twisting header (yaw locked to his line), landing and turning to watch it go out
  if(tau>T_K&&tau<D_ST+.1)p=over(p,LOOK_UP,sm(T_K,T_K+.3,tau));
  const u=(tau-D_ST)/DD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,diasMove(tau),w);yaw=lerpAng(yaw,YAW_D,sm(-.4,-.02,u));}
  if(u>=1.35)yaw=lerpAng(YAW_D,yawTo(x,z,XING[0],XING[2]),sm(1.35,2,u));
 }
 if(tau>.5&&(k===LUKAKU||k===GOSENS))p=over(p,DESPAIR,sm(.5,1,tau)*.8);
 return{p,yaw};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the twist). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false):DrawResult{
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball print
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<4)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>T_CR&&tau<T_B1){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the ball's real path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={minBall?:number;lines?:boolean;prevT?:number;smear?:boolean;hero?:'high'|'mid'};
/** everything on the pitch, depth-sorted (far first): positions at τ, poses on twos at τp (τpp = the drawing before), the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,e:Env={}):DrawResult|undefined{
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;let heroR:DrawResult|undefined;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1)return;const g=scr(c,q),h=c.F*1.8/q[2];if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
  items.push({d:q[2],draw:()=>{const{p,yaw}=poseOf(k,tp),px=h*ppu,hero=k===HERO;
   const detail:AthleteStyle['detail']=passing?(hero?'mid':'low'):px<50||(!a.key&&px<110)?'low':hero&&e.hero==='mid'&&px>170?'mid':'auto';
   const big=px>=90&&!passing,prev=big?(()=>{const q2=poseOf(k,tpp),[px2,pz2]=posOf(k,tpp);return{pose:q2.p,place:{x:px2,z:pz2,yaw:q2.yaw}};})():undefined;
   const r=drawPlayer(s,p,c,{...a.st,detail},{x,z,yaw},prev,!!e.smear&&(hero||k===LUKAKU)&&big&&((hero&&tp>-.45&&tp<.35)||(!hero&&tp>T_L-.3&&tp<T_L+.2)));if(hero)heroR=r;}});});
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return heroR;
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}

// ---------------------------------------------------------------- teaching marks
/** the ball's path from τa to τb as a ribbon */
function trail(s:Sheet,c:Cam,ta:number,tb:number,w:number,o:{ink?:string;min?:number;seed?:number}={}){if(w<=0||tb<=ta)return;
 const{ink=Y,min=7,seed=61}=o,pts=pathPts(c,ta,tb,24);if(pts.length<3)return;const wd=Math.max(min,kAt(c,ballAt(tb))*.12);
 s.knockout(ribbon(pts,wd*1.6,{seed,taper:.8,pressure:.2,wobble:0}),.5*w);s.fill(ink,ribbon(pts,wd,{seed,taper:.8,pressure:.2,wobble:0}),.92*w);}
function ring(s:Sheet,c:Cam,P:V3,rad:number,w:number,ink=Y,seed=43){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*(.7+.3*w),0,P[2]+Math.sin(a)*rad*(.7+.3*w)]);if(p)pts.push(p);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(5,kAt(c,P)*.05),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
/** a screen-space ring round a projected point (the knee, the hands) */
function dotRing(s:Sheet,q:Pt|null,r:number,w:number,ink=R,seed=77){if(!q||w<=.02)return;const rr0=r*(.7+.3*w),pts:Pt[]=[];for(let i=0;i<28;i++){const a=i/28*TAU;pts.push([q[0]+Math.cos(a)*rr0,q[1]+Math.sin(a)*rr0*.85]);}
 const rr=ribbon(pts,Math.max(4,rr0*.16),{close:true,seed,taper:0,wobble:.8});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** "he twists": a curved arrow round his shoulders, turning to his right (drawn on as w grows) */
function twistArrow(s:Sheet,c:Cam,r:DrawResult|undefined,w:number){if(!r||w<=.02)return;const C=r.sk.chest,a0=YAW_D+1.9,pts:V3[]=[];
 for(let i=0;i<=10;i++){const a=a0-2.4*w*i/10;pts.push([C[0]+Math.cos(a)*.62,C[1]+.12,C[2]-Math.sin(a)*.62]);}
 arrow3(s,c,pts,Math.max(6,kAt(c,C)*.07),Y,.95);}
/** the danger: a red dashed line from the loose ball into the middle of his own net, and a red crossed ring over it */
function ownGoal(s:Sheet,c:Cam,w:number){if(w<=.02)return;const a=pr(c,C_BALL),b=pr(c,[1,.9,.6]);if(!a||!b)return;const e:Pt=[lerp(a[0],b[0],w),lerp(a[1],b[1],w)],u=Math.max(4,kAt(c,C_BALL)*.05);
 s.fill(R,ribbon([a,e],u,{seed:91,taper:0,wobble:.4,gaps:[[.15,.25],[.4,.5],[.65,.75]]}),.9*w);
 const q=pr(c,[.2,1.2,.4]);if(!q)return;const r=Math.max(22,kAt(c,[.2,1.2,.4])*.55)*w,pts:Pt[]=[];for(let i=0;i<30;i++){const t=i/30*TAU;pts.push([q[0]+Math.cos(t)*r,q[1]+Math.sin(t)*r]);}
 const p=ribbon(pts,Math.max(4,r*.14),{close:true,seed:88,taper:0,wobble:.8});p.addPath(ribbon([[q[0]-r*.7,q[1]+r*.7],[q[0]+r*.7,q[1]-r*.7]],Math.max(4,r*.14),{seed:89,taper:.1,wobble:.5}));
 s.knockout(p,.85*w);s.fill(R,p,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** the cross on "City lead", Gosens's header on "Gosens heads", Lukaku's on "Lukaku", the knee on "saved", the loose ball on "breaks
 * loose", Dias's header on "Dias heads", the ball over the line on "Corner"; real time elsewhere */
const tau1=(t:number)=>{const cl=CUE(0,'City lead'),co=CUE(0,'Corner');const s0=Math.max(T0+.4,T_CR-.5-cl);
 return key(t,mono([[0,s0],[cl,T_CR-.5],[CUE(0,'Gosens heads'),T_G],[CUE(0,'Lukaku')+.1,T_L],[CUE(0,'saved')+.05,T_K+.05],[CUE(0,'breaks loose'),-.7],[CUE(0,'Dias heads')+.15,0],[co,.42],[SECS(0)+1,.42+(SECS(0)+1-co)*.9]]),linear);};
const P1:V3=[-16,24,72];
function cam1(t:number):Cam{
 const tau=tau1(t),b=ballAt(Math.min(tau,T_B1)),dp=at3(HERO,tau,1);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-12,1,8],fov:17})],
  [CUE(0,'City lead')-.3,1,()=>({P:P1,T:mix3(b,[-6,1,3],.5),fov:12})],
  [CUE(0,'Gosens heads')-.3,1,()=>({P:P1,T:mix3(b,[-2,1,1],.5),fov:8.5})],
  [CUE(0,'breaks loose')-.3,.9,()=>({P:P1,T:mix3(dp,[-1,1.2,2],.5),fov:7})],
  [CUE(0,'Corner')-.2,1.2,()=>({P:P1,T:[-.3,1,4.4],fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),co=CUE(0,'Corner'),sv=CUE(0,'saved');
  stadium(s,c,t,{roar:sm(sv,sv+.4,t)*(1-sm(sv+1.2,sv+2,t))+sm(co,co+.4,t)*.6,flash:sm(co,co+.25,t)*(1-sm(co+1.5,co+2.5,t))*.6});
  ground(s,c);
  play(s,c,tau,tp,tpp,{minBall:13,lines:true,prevT:tau1(t-.06),hero:'mid'});
  // the knee and Dias's head: small sparks as the ball changes direction
  for(const[T0s,P,seed,ink] of [[T_K,KNEE,13,Y],[0,C_BALL,14,Y]] as [number,V3,number,string][]){const age=tau-T0s;if(age>-.05&&age<.35){const q=pr(c,P);if(q)sparkBurst(s,ink,q[0],q[1],Math.max(40,kAt(c,P)*.5),{n:7,seed,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.2)/.15)),width:Math.max(4,kAt(c,P)*.05)});}}
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),T_B1)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'Dias heads')+.25;

// ---------------------------------------------------------------- 2 · slow-motion replay, low on the near side of the six-yard box
const tau2=(t:number)=>key(t,mono([[0,-1.85],[CUE(1,'Watch again'),-1.75],[CUE(1,'bounces'),T_K-.03],[CUE(1,'knee'),T_K+.1],[CUE(1,'twists'),-.18],[CUE(1,'steers'),0],[CUE(1,'own goal'),.3],[SECS(1),.55]]),linear);
const E2:V3=[-8.5,1.45,10.5];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,T_B1)),dp=at3(HERO,Math.min(tau,.3),1.3);
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(L_HEAD,KNEE,.5),fov:30})],
  [CUE(1,'bounces')-.2,.9,()=>({P:add3(E2,[1,-.1,-1]),T:mix3(KNEE,b,.4),fov:25})],
  [CUE(1,'twists')-.4,1,()=>({P:add3(E2,[2.2,-.1,-2.6]),T:mix3(dp,C_BALL,.4),fov:19})],
  [CUE(1,'steers')+.1,1.1,()=>({P:add3(E2,[2.6,.2,-2.4]),T:mix3(C_BALL,[0,1,3],.6),fov:27})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tB=CUE(1,'bounces'),tK=CUE(1,'knee'),tT=CUE(1,'twists'),tS=CUE(1,'steers'),tO=CUE(1,'own goal'),E=SECS(1);
  stadium(s,c,t,{roar:sm(-.2,.3,tau)*.5});
  ground(s,c);
  // "bounces off the knee": the loop of the rebound drawn as it flies, fading once he has headed it
  if(tau>T_K)trail(s,c,T_K,Math.min(tau,0),sm(tB,tB+.3,t)*(1-sm(tS+.3,tS+.8,t)),{min:6});
  // "steers it wide": the header's path, past the post
  if(tau>0)trail(s,c,0,Math.min(tau,T_OUT),sm(tS-.05,tS+.3,t),{min:7,seed:62});
  // "his own goal": where it would have gone — a red dashed line into the net, crossed out
  ownGoal(s,c,sm(tO-.15,tO+.3,t,easeOutBack)*(1-sm(E-.6,E-.2,t)));
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  // "knee": a red ring round Ederson's knee as the ball hits it
  const kn=sm(tK-.15,tK+.2,t,easeOutBack)*(1-sm(tT-.3,tT,t));dotRing(s,pr(c,KNEE),Math.max(22,kAt(c,KNEE)*.35),kn,R,77);
  // "twists": the curved arrow round his shoulders
  twistArrow(s,c,hr,sm(tT-.1,tT+.5,t)*(1-sm(tO-.1,tO+.2,t)));
  // the contact: a spark off his head
  const sf=sm(tS-.1,tS+.2,t,easeOutBack)*(1-sm(tS+.5,tS+.9,t));
  if(sf>.02){const p=pr(c,C_BALL);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,C_BALL)*.4)*sf,{n:9,seed:61,width:Math.max(5,kAt(c,C_BALL)*.04)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(Math.min(tau2(t),T_B1)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch2.still=CUE(1,'steers')+.1;

// ---------------------------------------------------------------- 3 · the second replay angle, behind the goal: past the post, out for a corner, City hold on
const tau3=(t:number)=>{const ch=CUE(2,'City held');return key(t,mono([[0,-.75],[CUE(2,'Out for'),.12],[CUE(2,'corner'),.6],[ch,1.6],[SECS(2)+1,1.6+(SECS(2)+1-ch)*.8]]),linear);};
const E3:V3=[7.5,2.3,-2.8];
function cam3v(t:number):Cam{
 const tau=tau3(t),dp=at3(HERO,tau,1.1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(dp,C_BALL,.5),fov:26})],
  [CUE(2,'Out for')-.1,.8,()=>({P:E3,T:mix3(XING,dp,.4),fov:28})],
  [CUE(2,'City held')-.3,1.4,()=>({P:add3(E3,[.5,1.2,1.5]),T:[-2.2,1,1.8],fov:34})],
  [CUE(2,'first Champions')-.3,1.3,()=>({P:add3(E3,[.3,.9,2.2]),T:add3(dp,[0,.2,0]),fov:24})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tO=CUE(2,'Out for'),tc=CUE(2,'corner'),tf=CUE(2,'first Champions');
  stadium(s,c,t,{roar:sm(tc,tc+.4,t)*.6,flash:.35*sm(tf-.1,tf+.3,t)});
  ground(s,c);
  if(tau>0)trail(s,c,0,Math.min(tau,T_B1),sm(tO-.3,tO+.1,t)*(1-sm(tc+1,tc+1.6,t)),{min:8,seed:63});
  // "corner": a yellow ring on the goal-line where it went out, outside the post
  ring(s,c,[XING[0],0,XING[2]],.9,sm(tc-.15,tc+.3,t,easeOutBack)*(1-sm(tc+1.2,tc+1.7,t)),Y,45);
  play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  // "first Champions League": a burst of yellow over Dias (the passage material into the lesson)
  const fb=sm(tf-.05,tf+.35,t);if(fb>0){const q=pr(c,at3(HERO,tau,3.2));if(q)sparkBurst(s,Y,q[0],q[1],110+150*fb,{n:11,seed:9,g:easeOutBack(fb),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'Out for')+.3;

// ---------------------------------------------------------------- 4 · the lesson: be brave → body in the way of the shot → arms behind you
const tau4=(t:number)=>key(t,mono([[0,-1.7],[CUE(3,'be brave'),-1.3],[CUE(3,'body in the way'),-.75],[CUE(3,'the shot'),-.4],[CUE(3,'arms behind'),-.06],[SECS(3),.05]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),dp=at3(HERO,tau,1.1);
 return plan(t,[
  [0,0,()=>({P:[6.5,2.2,11.5],T:mix3(dp,[-1.5,1,.5],.4),fov:34})],
  [CUE(3,'body in the way')-.3,1,()=>({P:[5,1.7,9.6],T:mix3(dp,C_BALL,.3),fov:25})],
  [CUE(3,'arms behind')-.3,1,()=>({P:[4,1.5,8.4],T:add3(dp,[0,.15,0]),fov:19})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tBr=CUE(3,'be brave'),tW=CUE(3,'body in the way'),tS=CUE(3,'the shot'),tA=CUE(3,'arms behind'),E=SECS(3);
  stadium(s,c,t);
  ground(s,c);
  // 1 · be brave: a ring under Dias, between the ball and his goal
  ring(s,c,at3(HERO,tau),.8,sm(tBr-.15,tBr+.35,t,easeOutBack)*(1-sm(E-1,E-.6,t)),Y,44);
  // 3 · the shot: a red arrow from the loose ball toward the middle of his goal, stopped at his body
  const sh=sm(tS-.1,tS+.5,t)*(1-sm(E-.8,E-.4,t));
  if(sh>.02){const a=ballAt(Math.max(tau,T_K+.3)),goal:V3=[0,.9,.3],hd=at3(HERO,tau,1.3),pts:V3[]=[];const stop=clamp(Math.hypot(hd[0]-a[0],hd[2]-a[2])/Math.hypot(goal[0]-a[0],goal[2]-a[2])+.05);
   for(let i=0;i<=8;i++)pts.push(mix3(a,goal,stop*sh*i/8));arrow3(s,c,pts,Math.max(6,kAt(c,a)*.06),R,.9);}
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:14});
  // 2 · body in the way: a yellow outline glow round his chest and head, the wall between ball and goal
  const bw=sm(tW-.15,tW+.35,t,easeOutBack)*(1-sm(E-.9,E-.5,t));
  if(hr&&bw>.02){const H=hr.joints.head,Ch=hr.joints.chest;dotRing(s,[(H[0]+Ch[0])/2,(H[1]+Ch[1])/2],Math.hypot(H[0]-Ch[0],H[1]-Ch[1])*1.25,bw,Y,46);}
  // 4 · arms behind you: yellow rings on both hands, held back
  const ab=sm(tA-.12,tA+.3,t,easeOutBack);
  if(hr&&ab>.02)for(const[j,seed] of [['lHa',47],['rHa',48]] as const){dotRing(s,hr.joints[j],Math.max(18,kAt(c,hr.sk[j])*.2),ab,Y,seed);}
 },
 still:0,
};
ch4.still=CUE(3,'arms behind')+.25;

const film:RisoStory={
 id:'ruben-dias-signature',format:'11v11',title:"Rúben Dias's brave block",
 theme:'The brave block: get your body in the way of the shot and keep your arms behind you',
 ageNote:'Manchester City 1–0 Inter, UEFA Champions League final, Atatürk Olympic Stadium, Istanbul, 10 June 2023 (88th minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a block — a ball flies in from the left, hits a yellow wall at the point and glances away. Reduced motion: the still wall. */
 touch(s,x,y,age,seed){
  const fade=age<=0?1:1-clamp((age-.6)/.25),r=rng(seed),u=age<=0?1:clamp(age/.55);
  const wall=ribbon([[x,y-70],[x+6,y],[x,y+70]],18,{seed,taper:.3,pressure:.3,wobble:1});s.knockout(wall,.9*fade);s.fill(Y,wall,.95*fade);
  const bx=u<.5?x-220+200*u*2:x-20+160*(u-.5)*2,by=u<.5?y+20*(1-u*2):y-150*(u-.5)*2;
  if(age>0&&Math.abs(u-.5)<.12)sparkBurst(s,Y,x-10,y,80,{n:7,seed,g:1-Math.abs(u-.5)/.12,width:10});
  footballPanels(s,bx,by,28,{rot:age*14+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
