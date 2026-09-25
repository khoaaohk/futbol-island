/** Rodri v Inter — Manchester City 1–0 Inter, UEFA Champions League final, Atatürk Olympic Stadium, Istanbul, 10 June 2023 (22:00 local,
 * a night final under floodlights). An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window
 * (components/CardFilmPlayer.tsx) or StoryFilmPlayer. A 1:1 reconstruction of the 68th-minute winner from WRITTEN accounts (the footage
 * itself was not reviewed), printed as a riso sheet.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad films/src-cache/):
 *  - Wikipedia, "2023 UEFA Champions League final" (raw): date, ground, 1–0, Rodri 68', man of the match; "a side-footed finish to the
 *    right of the net after a pulled-back pass from Bernardo Silva on the right to the edge of the penalty area"; both line-ups with
 *    numbers; the kit templates (City sky blue shirts, white shorts, sky blue socks; Inter blue-and-black stripes, black shorts, black
 *    socks); referee Szymon Marciniak  https://en.wikipedia.org/wiki/2023_UEFA_Champions_League_final
 *  - The Guardian, David Hytner, "Rodri breaks Internazionale resistance to seal Manchester City's treble glory", 10 June 2023
 *    https://www.theguardian.com/football/2023/jun/10/rodri-breaks-internazionale-resistance-to-seal-manchester-citys-treble-glory
 *    ("Akanji opened up Inter with a pass up the inside right for Silva, whose pull-back deflected and rolled into the path of Rodri")
 *  - The Guardian, Barry Glendenning, live, 10 June 2023  https://www.theguardian.com/football/live/2023/jun/10/manchester-city-v-inter-champions-league-final-2023-live-score-updates
 *    ("Akanji ... played the ball to Bernardo Silva on the byline, to the right of the Inter goal. His pull-back ... Rodri sent the ball
 *    fizzing past Bastoni and Onana"; "from the edge of the area, threads an unstoppable shot into the bottom corner"; photo caption
 *    "Rodri slides on his knees as he celebrates")
 *  - Inter.it, "Rodri's goal sinks an excellent Inter: City win the Champions League", 10 June 2023  https://www.inter.it/en/news/manchester-city-inter-champions-league-final-2023
 *    ("Akanji played a ball through for Bernardo into the box, whose cross deflected off Acerbi and fell to Rodri on the edge of the box,
 *    who coolly placed it past Onana into the back of the net"; line-ups)
 *  - Search-result summaries (DuckDuckGo): "a powerful right-footed shot" (YouTube description), "bend the ball into the bottom corner"
 *    (SportBible), "Bernardo Silva's cut-back deflected out to the edge of the box and Rodri was there, running onto it" (Evening Standard)
 *  - Wikipedia, "Rodri": height 1.90 m, defensive midfielder.
 * CONFIRMED by those accounts: the date, ground, score and 68th minute; Akanji's pass up the inside right into the box for Bernardo Silva;
 * Bernardo on the byline to the right of the Inter goal; his pull-back deflected off Acerbi and rolled out to the edge of the box; Rodri
 * ran onto it and hit it FIRST TIME with his RIGHT foot, a SIDE-FOOTED, placed finish LOW into the BOTTOM corner to the RIGHT of the net
 * (his view), past Bastoni and Onana; he celebrated with a knee slide; it was City's first European Cup. Kits: City sky blue shirts, white
 * shorts, sky blue socks; Inter blue-and-black stripes, black (printed navy) shorts and socks. Numbers: Rodri 16, Bernardo 20, Akanji 25,
 * Haaland 9, Foden 47, Gündoğan 8, Grealish 10, Stones 5; Onana 24, Acerbi 15, Bastoni 95, Darmian 36, Dimarco 32, Barella 23,
 * Brozović 77, Çalhanoğlu 20, Dumfries 2.
 * INFERRED (illustrative): every exact position and timing; the direction of play on screen (City attacking left to right from the
 * main-stand camera, which puts Bernardo on the NEAR touchline side); Bernardo pulling back with his LEFT foot; the deflection off
 * Acerbi's outstretched right boot; Rodri about a metre outside the area, just right of centre; the ball's slight curl (drawn as a low,
 * gently bending ball that swings back in); Bastoni's late block and Onana's dive to his left; Onana's kit (drawn yellow), the referee's
 * dark kit, City's navy numbers; the other players' spots; where Rodri ran and slid (toward the main-stand corner) and who piled on.
 * The stadium (not from a fetched source): a big oval bowl with a running track (drawn red tartan) round the pitch, open to the night sky,
 * with a crescent roof and arch over the main stand; the floodlight rails; the crowd colours (sky blue, blue-black, white, phone lights).
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (Akanji → Bernardo on the byline → the
 * deflected pull-back → Rodri arrives → the bottom corner → the knee slide); ch2 = the slow-motion replay from a LOW camera behind Rodri's
 * right shoulder (he waits outside the box, then arrives late; a compact swing; the open side-foot; a low shot); ch3 = a second replay angle
 * from BEHIND THE GOAL (the ball threads past Bastoni and Onana into the corner) running on into the knee slide; ch4 = the lesson: a
 * camera beside the D (the late run, the edge of the box, head still, place it into the corner, don't blast it). Composed on the FULL
 * sheet (world units = sheet units centred on the canvas; never sheet.safe), kept in the central ~1000 units so it frames from the 1.45:1
 * card window down to square (a narrower window widens the lens a little).
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts; small figures and every figure inside a passage print at `low`.
 * Handedness: the world is right-handed (x toward Inter's goal, y up, +z = the main-stand side = Rodri's right as he attacks), athlete.ts's
 * own convention, so his RIGHT foot strikes without a mirrored projector and Onana's left (facing −x) is +z. Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,dribble,stand,keeperSet,keeperDive,lunge,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/rodri-final-2023/timing.json, add
 *   import timingJson from '../../../public/plays/narration/rodri-final-2023/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The goal, live',text:'Istanbul, 2023. Champions League final: Manchester City against Inter. Akanji finds Bernardo Silva. His pull-back hits a defender and rolls to Rodri, arriving at the edge of the box... Goal!',tail:2.6,
  cues:['Istanbul','Champions League final','Manchester City','Akanji','Bernardo Silva','pull-back','hits a defender','Rodri','edge of the box','Goal']},
 {label:'Watch it again',text:'Watch again, slowly. Rodri waits outside the box, then arrives late. No big swing: he opens his foot and side-foots it low.',tail:1.6,
  cues:['Watch again','waits outside','arrives late','No big swing','opens his foot','side-foots it low']},
 {label:'Bottom corner',text:'Past Bastoni, past André Onana, into the bottom corner! That goal won City their first Champions League.',tail:2.2,
  cues:['Past Bastoni','André Onana','bottom corner','That goal','first Champions League']},
 {label:'Your turn',text:"Your turn: holding midfielders, arrive late at the edge of the box. Stay calm, and place it. Don't blast it.",tail:2.2,
  cues:['Your turn','holding midfielders','arrive late','edge of the box','Stay calm','place it',"Don't blast"]},
];
import timingJson from '../../../public/plays/narration/rodri-final-2023/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('rodri: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('rodri: no cue '+w);return c.at;};
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
/** Pitch: Inter's goal line is x = 0 (City attack +x), goal centre z = 0, +z = the main-stand side, the halfway line x = −52.5. */
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
const RODRI_B={height:1.9,bulk:1.02};
const RODRI_ST=city({number:16,build:RODRI_B,seed:16});
const ONANA_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_D,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'bald',number:24,numberInk:K,build:{height:1.9},seed:24};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,hairStyle:'bald',build:{height:1.86},seed:30};

// ---------------------------------------------------------------- the strike geometry (τ = seconds after Rodri's contact)
/** where the ball is met: about a metre outside the area, just right of centre (inferred); low into the bottom right-hand corner */
const CX0=-17.4,CZ0=1.2;
const GOAL_PT:V3=[0,.3,3.05];
const YAW_S=yawTo(CX0,CZ0,GOAL_PT[0],GOAL_PT[2]);
/** "no big swing: he opens his foot": hip turned out so the inside of the right foot faces the target, body over the ball, head down */
const SIDEFOOT:Partial<Pose>={rHipR:42,rAnk:-6,lean:24,pitch:7,neckP:34,lKnee:40,lHipF:22,lShA:72,rShA:40};
const SD=.95,S_ST=-STRIKE_CONTACT*SD;
function sStrike(tau:number):Pose{const u=(tau-S_ST)/SD;return over(strike(clamp(u),{foot:'r',power:.5}),SIDEFOOT,bump(-.45,.32,tau));}
/** the inside of his right foot at contact, relative to his pelvis (solved once, FK) */
const INSTEP=(()=>{const sk=solve(sStrike(0),RODRI_B,{x:0,z:0,yaw:YAW_S});return mix3(sk.rAn,sk.rToe,.42);})();
const C_BALL:V3=[CX0,.11,CZ0];
const P0:[number,number]=[CX0-INSTEP[0],CZ0-INSTEP[2]];

// ---------------------------------------------------------------- the build-up: Akanji → Bernardo on the byline → the pull-back off Acerbi
const T_AK=-4.7,T_RCV=-3,T_MID=-2.35,T_PB=-1.7,T_DEF=-1.42,FLY=.8,IN_NET=FLY+.1;
const RCV:V3=[-5.6,.11,14.3],MID:V3=[-3.1,.11,12.7],PB:V3=[-1.2,.11,11],DEF:V3=[-4.6,.11,7.2];
/** Bernardo's pelvis at the pull-back: ball at his left boot, facing the pass line */
const PBD:[number,number]=(()=>{const dx=DEF[0]-PB[0],dz=DEF[2]-PB[2],l=Math.hypot(dx,dz);return[dx/l,dz/l];})();
const B_PB:[number,number]=[PB[0]-PBD[0]*.45+PBD[1]*.15,PB[2]-PBD[1]*.45-PBD[0]*.15];
/** Rodri's slide: where it starts and the heading (toward the main-stand corner) */
const SL=2.6,SL_DUR=1.3,SL_A:[number,number]=[-12.9,7.8],SL_B:[number,number]=[-12,9.2];
const SLIDE_YAW=yawTo(SL_A[0],SL_A[1],SL_B[0],SL_B[1]);
const HUG:[number,number]=[SL_B[0]+1.5,SL_B[1]+2.1];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'city'|'inter'|'gk'|'ref';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
const Rr=(dx:number,dz:number)=>[P0[0]+dx,P0[1]+dz];
const ACTORS:Actor[]=[
 {name:'Rodri',role:'hero',st:RODRI_ST,key:true,keys:[[-7,...Rr(-16,-6)],[-4,...Rr(-11,-4.4)],[-2,...Rr(-6.2,-2.3)],[-1,...Rr(-3.1,-1.1)],[-.4,...Rr(-1.1,-.35)],[0,...P0],[.35,...Rr(.6,.15)],[1.2,...Rr(2.6,2.1)],[2.1,SL_A[0]-.9,SL_A[1]-1.3],[SL,...SL_A],[12,...SL_A]]},
 {name:'Bernardo Silva',role:'city',st:city({number:20,build:{height:1.73},seed:20}),key:true,keys:[[-7,-14,19.5],[-4.7,-10,17.2],[-3,-6.1,14.7],[-2.35,-3.7,13.2],[T_PB,...B_PB],[-1,-1.1,10.6],[0,-2.1,10.2],[1,-2.9,10],[3,-6.8,10.6],[6,HUG[0]+1.4,HUG[1]+.3],[12,HUG[0]+1.5,HUG[1]+.4]]},
 {name:'Akanji',role:'city',st:city({number:25,skin:SKIN_D,build:{height:1.87},seed:25}),keys:[[-7,-34,9.5],[T_AK,-31.6,11.2],[-3,-30.2,11.5],[0,-27,10.5],[12,-22,9]]},
 {name:'Haaland',role:'city',st:city({number:9,hair:[Y,.8],hairStyle:'ponytail',build:{height:1.95,bulk:1.1},seed:9}),key:true,keys:[[-7,-9,-3.2],[-2,-7,-1.6],[0,-6.4,-.9],[1.5,-6,-.5],[5,-9,8],[8,HUG[0]-.6,HUG[1]-1.2],[12,HUG[0]-.6,HUG[1]-1.2]]},
 {name:'Foden',role:'city',st:city({number:47,build:{height:1.71},seed:47}),keys:[[-7,-20,-6.5],[-2,-13.6,-5.6],[0,-12.6,-5.2],[3,-12,2],[6,HUG[0]-1.4,HUG[1]+.8],[12,HUG[0]-1.4,HUG[1]+.8]]},
 {name:'Gündoğan',role:'city',st:city({number:8,build:{height:1.8},seed:8}),keys:[[-7,-18,10.5],[-2,-12.8,8.8],[0,-12,8.3],[3,-11.2,10.2],[6,HUG[0]+.2,HUG[1]+1.5],[12,HUG[0]+.2,HUG[1]+1.5]]},
 {name:'Grealish',role:'city',st:city({number:10,build:{height:1.8},seed:10}),keys:[[-7,-16,-22],[0,-13,-18],[4,-12,0],[8,HUG[0]-2.2,HUG[1]-.2],[12,HUG[0]-2.2,HUG[1]-.2]]},
 {name:'Stones',role:'city',st:city({number:5,build:{height:1.88},seed:5}),keys:[[-7,-28,2],[0,-25,3],[12,-20,5]]},
 {name:'Acerbi',role:'inter',st:inter({number:15,hairStyle:'balding',build:{height:1.92},seed:15}),key:true,keys:[[-7,-7.4,4.2],[-3,-6,5.8],[-1.9,-4.6,6.2],[T_DEF,-4.3,6.35],[0,-4.9,6.2],[3,-5.6,5.6],[12,-5.8,5.4]]},
 {name:'Bastoni',role:'inter',st:inter({number:95,build:{height:1.9},seed:95}),key:true,keys:[[-7,-10.5,1.8],[-2,-9.2,3.1],[0,-8.7,3.75],[.4,-8.6,3.8],[3,-8.2,3.6],[12,-8,3.4]]},
 {name:'Darmian',role:'inter',st:inter({number:36,build:{height:1.82},seed:36}),keys:[[-7,-7.2,-4.4],[-2,-5.6,-2.4],[0,-5.1,-1.7],[12,-5,-1]]},
 {name:'Dimarco',role:'inter',st:inter({number:32,build:{height:1.75},seed:32}),keys:[[-7,-10,19.5],[-3,-7.4,16.2],[T_PB,-2.9,12.6],[0,-3.6,10.8],[12,-4.2,10]]},
 {name:'Barella',role:'inter',st:inter({number:23,build:{height:1.72},seed:23}),key:true,keys:[[-7,-20,6.5],[-2,-15.8,4.6],[0,-14.6,3.3],[.6,-14.4,3.1],[12,-14,3]]},
 {name:'Brozović',role:'inter',st:inter({number:77,build:{height:1.81},seed:77}),keys:[[-7,-23,-2.5],[-2,-18.6,-1.9],[0,-15.9,-1.4],[12,-15,-1]]},
 {name:'Çalhanoğlu',role:'inter',st:inter({number:20,build:{height:1.78},seed:20}),keys:[[-7,-25,-10],[0,-19.8,-6.8],[12,-18,-6]]},
 {name:'Dumfries',role:'inter',st:inter({number:2,skin:SKIN_D,build:{height:1.88},seed:2}),keys:[[-7,-14,-24],[0,-10.5,-15.5],[12,-9,-13]]},
 {name:'Onana',role:'gk',st:ONANA_ST,key:true,keys:[[-7,-1.8,1.6],[-2.4,-1.4,3.2],[-1.4,-1.3,2.4],[0,-1.1,.9],[12,-1.1,.9]]},
 {name:'Marciniak',role:'ref',st:REF_ST,keys:[[-7,-31,-8],[0,-25,-5.5],[12,-20,-3]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const HERO=0,BERNARDO=IX('Bernardo Silva'),AKANJI=IX('Akanji'),ACERBI=IX('Acerbi'),BASTONI=IX('Bastoni'),DIMARCO=IX('Dimarco'),ONANA=IX('Onana');
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

// ---------------------------------------------------------------- the ball: the pass, the carry, the pull-back, the deflection, the side-foot, the net
const AKB:V3=(()=>{const[x,z]=posOf(AKANJI,T_AK);return[x+.5,.11,z+.1];})();
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return mix3(a,b,e);};
/** the side-foot: low and fizzing, a gentle curl that swings back in to the corner (bend inferred) */
const flightE=(u:number)=>u*(1.15-.15*u);
const flight=(e:number):V3=>{const b=mix3(C_BALL,GOAL_PT,e);return[b[0],b[1]+.1*Math.sin(Math.PI*e),b[2]+.35*Math.sin(Math.PI*e)];};
const NET_HIT:V3=[1.7,.32,3.25],REST:V3=[1.3,.11,2.9];
function ballAt(tau:number):V3{
 if(tau<T_AK){const[x,z]=posOf(AKANJI,tau);return[x+.5,.11,z+.1];}
 if(tau<T_RCV)return roll(AKB,RCV,(tau-T_AK)/(T_RCV-T_AK),.25);
 if(tau<T_MID)return roll(RCV,MID,(tau-T_RCV)/(T_MID-T_RCV),.5);
 if(tau<T_PB)return roll(MID,PB,(tau-T_MID)/(T_PB-T_MID),.5);
 if(tau<T_DEF)return mix3(PB,DEF,(tau-T_PB)/(T_DEF-T_PB));
 if(tau<0)return roll(DEF,C_BALL,(tau-T_DEF)/-T_DEF,.3);
 if(tau<FLY)return flight(flightE(tau/FLY));
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY)/(IN_NET-FLY)));
 const u=clamp((tau-IN_NET)/.5);return mix3(NET_HIT,REST,easeOut(u));
}
const spinAt=(tau:number)=>TAU*(tau<0?2.5*tau:6*Math.min(tau,IN_NET)+1.5*Math.max(0,tau-IN_NET));
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** hands on heads (Inter) and arms up (City) after the goal */
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** "stay calm": head still and down over the ball as it rolls in, arms out for balance */
const CALM:Partial<Pose>={neckP:30,lean:18,lShA:40,rShA:30};
/** a keyed library move blended in around its own window: u = (τ − start)/dur */
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET));
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 if(a.role==='gk')yaw=yawTo(x,z,b[0],b[2]);
 if(tau>IN_NET+1.4&&sp<.6&&k!==HERO)yaw=yawTo(x,z,SL_B[0],SL_B[1]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4+k*.1):a.role==='inter'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===AKANJI){const D=.8,u=(tau-(T_AK-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.55}),w);yaw=lerpAng(yaw,yawTo(x,z,RCV[0],RCV[2]),w);}}
 if(k===BERNARDO){
  if(tau>T_RCV-.2&&tau<T_PB-.3)p=blendPose(p,dribble(distOf(k,tau)/1.6,{foot:'l',speed:.6}),clamp((sp-.5)/.8)*bump(T_RCV-.2,T_PB-.3,tau));
  const D=.75,u=(tau-(T_PB-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.35}),w);yaw=lerpAng(yaw,yawTo(PB[0],PB[2],DEF[0],DEF[2]),w);}}
 if(k===ACERBI){const D=.8,u=(tau-(T_DEF-.6*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),w);yaw=lerpAng(yaw,yawTo(x,z,PB[0],PB[2]),w);}}
 if(k===DIMARCO){const D=.8,u=(tau-(T_PB+.05-.6*D))/D;if(u>0&&u<1.3){const w=inWin(u)*.8;p=blendPose(p,lunge(Math.min(1,u),{side:'l'}),w);}}
 if(k===BASTONI){const D=.75,u=(tau-(.3-.6*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),w);yaw=lerpAng(yaw,yawTo(x,z,CX0,CZ0),w);}}
 if(k===ONANA){const at=.62,dur=.95,u=(tau-(at-.55*dur))/dur;if(u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:'l',height:.08}),sm(0,.1,u));yaw=Math.PI;}}
 if(k===HERO){
  // arriving: eyes on the rolling ball; then the calm side-foot
  if(tau<0)p=over(p,CALM,sm(-1.2,-.4,tau)*.8);
  const u=(tau-S_ST)/SD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,sStrike(tau),w);yaw=lerpAng(yaw,YAW_S,sm(-.3,.05,u));}
  if(tau>IN_NET+.3&&tau<SL+.1)p=blendPose(p,celebrate(distOf(k,tau)/4,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau));
  if(tau>SL-.1){const us=(tau-SL)/SL_DUR;p=blendPose(p,celebrate(clamp(us),{kind:'kneeSlide'}),sm(-.08,.06,us));yaw=SLIDE_YAW;}
 }
 if(tau>IN_NET+.25&&k!==HERO){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='city')p=over(p,JOY,w*(sp<2?1:.4));if(a.role==='inter')p=over(p,DESPAIR,w*.85);}
 return{p,yaw};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the strike, the slide). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false):DrawResult{
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball print
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.1,.1,.5));
 if(o.lines&&o.prev!==undefined&&tau>-.1&&tau<IN_NET){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,K,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(260,d*1.4),spread:r*.9,width:Math.max(2.5,r*.18),cov:.8});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}
/** the rolled / flown path from τa to τb as projected points */
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
   const r=drawPlayer(s,p,c,{...a.st,detail},{x,z,yaw},prev,!!e.smear&&hero&&big&&((tp>-.4&&tp<.4)||(tp>SL-.2&&tp<SL+1.1)));if(hero)heroR=r;}});});
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return heroR;
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}

// ---------------------------------------------------------------- teaching marks
/** the shot's path so far: a ribbon along the real flight from contact to τ */
function shotPath(s:Sheet,c:Cam,tau:number,w:number,o:{ink?:string;from?:number;min?:number}={}){if(w<=0||tau<=0)return;
 const{ink=Y,from=0,min=8}=o,pts=pathPts(c,from,Math.min(tau,FLY+.001),24);if(pts.length<3)return;const wd=Math.max(min,kAt(c,ballAt(Math.min(tau,FLY)))*.14);
 s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.8,pressure:.2,wobble:0}),.5*w);s.fill(ink,ribbon(pts,wd,{seed:61,taper:.8,pressure:.2,wobble:0}),.92*w);}
/** "stay calm": a yellow dashed plumb line from his head straight down to the ball */
function plumb(s:Sheet,c:Cam,r:DrawResult|undefined,w:number){if(!r||w<=0)return;
 const H=r.sk.head,a=pr(c,[H[0],H[1]+.14,H[2]]),b=pr(c,[H[0],0,H[2]]);if(!a||!b)return;const u=Math.max(3,c.F*.045/toCam(c,H)[2]),e:Pt=[a[0]+(b[0]-a[0])*w,a[1]+(b[1]-a[1])*w];
 s.knockout(ribbon([a,e],u*1.7,{seed:71,taper:0,wobble:.5}),.8*w);s.fill(Y,ribbon([a,e],u*.85,{seed:71,taper:0,wobble:.5,gaps:[[.2,.28],[.46,.54],[.72,.8]]}),.95*w);}
function ring(s:Sheet,c:Cam,P:V3,rad:number,w:number,ink=Y,seed=43){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*(.7+.3*w),0,P[2]+Math.sin(a)*rad*(.7+.3*w)]);if(p)pts.push(p);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(5,kAt(c,P)*.05),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** "arrive late": his real run on the grass from τa to contact, drawn out as an arrow */
function runArrow(s:Sheet,c:Cam,ta:number,w:number,ink=Y){if(w<=.02)return;const pts:V3[]=[];const tb=lerp(ta,-.12,w);for(let i=0;i<=10;i++)pts.push(at3(HERO,lerp(ta,tb,i/10),.04));arrow3(s,c,pts,Math.max(8,kAt(c,pts[pts.length-1])*.16),ink,.95);}
/** "the edge of the box": the 18-yard line and the D printed yellow */
function edgeOfBox(s:Sheet,c:Cam,w:number){if(w<=.02)return;const p=new Path2D(),u=w;
 seg3(c,[-16.5,.01,-8*u],[-16.5,.01,8*u],.5,p,2);const a=Math.acos(5.5/9.15);for(let i=0;i<14;i++){const u0=Math.PI-a+2*a*i/14,u1=Math.PI-a+2*a*(i+1)/14;seg3(c,[-11+Math.cos(u0)*9.15,.01,Math.sin(u0)*9.15],[-11+Math.cos(u1)*9.15,.01,Math.sin(u1)*9.15],.5,p,2);}
 s.knockout(p,.85*w);s.fill(Y,p,.95*w);}
/** a ring round the target in the goal mouth (screen space) */
function goalRing(s:Sheet,c:Cam,P:V3,w:number,ink=R,seed=77){if(w<=.02)return;const q=pr(c,P);if(!q)return;const r=Math.max(24,kAt(c,P)*.45)*(.7+.3*w),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.8]);}
 const rr=ribbon(pts,Math.max(5,r*.14),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** Akanji's pass on "Akanji", Bernardo's first touch on "Bernardo Silva", the pull-back on "pull-back", the deflection on "hits a
 * defender", the strike as "edge of the box" lands, the net on "Goal"; real time elsewhere */
const tau1=(t:number)=>{const ak=CUE(0,'Akanji'),g=CUE(0,'Goal');const s0=Math.max(T0+.4,T_AK-(ak-.1));
 return key(t,mono([[0,s0],[ak-.1,T_AK],[CUE(0,'Bernardo Silva')+.25,T_RCV],[CUE(0,'pull-back'),T_PB],[CUE(0,'hits a defender')+.1,T_DEF],[CUE(0,'edge of the box')+.35,0],[g+.05,IN_NET],[SECS(0)+1,IN_NET+SECS(0)+1-g]]),linear);};
const P1:V3=[-30,24,72];
function cam1(t:number):Cam{
 const tau=tau1(t),bp=at3(BERNARDO,tau,1),rp=at3(HERO,tau,1),b=ballAt(Math.min(tau,IN_NET)),g=CUE(0,'Goal');
 return plan(t,[
  [0,0,()=>({P:P1,T:[-30,3,-26],fov:36})],
  [CUE(0,'Akanji')-.4,1,()=>({P:P1,T:mix3(b,bp,.45),fov:15})],
  [CUE(0,'Bernardo Silva')-.2,.9,()=>({P:P1,T:mix3(bp,[-6,1,6],.3),fov:11})],
  [CUE(0,'hits a defender')-.2,.9,()=>({P:P1,T:mix3(rp,DEF,.45),fov:12})],
  [CUE(0,'edge of the box')-.2,.8,()=>({P:P1,T:[-9,1,2.2],fov:13})],
  [g+.25,1.6,()=>({P:P1,T:[-1.4,.9,2.6],fov:8})],
  [g+1.8,1.4,()=>({P:P1,T:add3(rp,[.8,0,0]),fov:10})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal');
  stadium(s,c,t,{roar:sm(g,g+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.5,g+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid'});
  // the deflection: a small spark off Acerbi's boot as the pull-back changes direction
  const age=tau-T_DEF;if(age>-.05&&age<.35){const q=pr(c,add3(DEF,[0,.2,0]));if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,DEF)*.5),{n:7,seed:13,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.2)/.15)),width:Math.max(4,kAt(c,DEF)*.05)});}
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET+.4)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'Goal')+.3;

// ---------------------------------------------------------------- 2 · slow-motion replay, low behind Rodri's right shoulder
const tau2=(t:number)=>key(t,mono([[0,-3.8],[CUE(1,'Watch again'),-3.6],[CUE(1,'waits outside'),-2.7],[CUE(1,'arrives late'),-1.35],[CUE(1,'No big swing'),-.38],[CUE(1,'opens his foot'),-.12],[CUE(1,'side-foots'),0],[SECS(1),.95]]),linear);
const E2:V3=[P0[0]-6.8,1.45,P0[1]+4.6];
/** the compact swing: the right toe's real arc through the side-foot (backswing → contact → a short follow-through) */
const SWING:V3[]=(()=>{const o:V3[]=[];for(let i=0;i<=12;i++){const tau=lerp(-.28,.14,i/12),sk=solve(sStrike(tau),RODRI_B,{x:P0[0],z:P0[1],yaw:YAW_S});o.push(sk.rToe as V3);}return o;})();
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY)),hp=at3(HERO,Math.min(tau,.3),.9);
 return plan(t,[
  [0,0,()=>({P:add3(E2,[-3,.4,1]),T:mix3(hp,[-6,1,8],.4),fov:42})],
  [CUE(1,'arrives late')-.3,1,()=>({P:add3(E2,[-1,0,.4]),T:mix3(hp,b,.45),fov:32})],
  [CUE(1,'No big swing')-.3,.8,()=>({P:add3(E2,[2.6,-.4,-1.3]),T:add3(hp,[.7,-.15,-.1]),fov:27})],
  [CUE(1,'side-foots')+.15,1.4,()=>({P:add3(E2,[2.4,.3,-1.4]),T:mix3(add3(C_BALL,[5,.6,.8]),b,.55),fov:30})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tW=CUE(1,'waits outside'),tA=CUE(1,'arrives late'),tN=CUE(1,'No big swing'),tO=CUE(1,'opens his foot'),tS=CUE(1,'side-foots');
  stadium(s,c,t,{roar:sm(.4,.9,tau)});
  ground(s,c);
  // "waits outside the box": the 18-yard line lights up and a ring holds under his feet (outside it)
  const wo=sm(tW-.15,tW+.35,t)*(1-sm(tA+.2,tA+.6,t));edgeOfBox(s,c,wo*.8);ring(s,c,at3(HERO,tau),.7,wo,Y,44);
  // "arrives late": his run into the space drawn as an arrow on the grass
  runArrow(s,c,-2.6,sm(tA-.1,tA+.9,t)*(1-sm(tN+.1,tN+.5,t)));
  // the rolling ball's trail from the deflection
  if(tau>T_DEF&&tau<.05){const pts=pathPts(c,Math.max(T_DEF,tau-.7),Math.min(tau,0),12);if(pts.length>2)s.fill(Y,ribbon(pts,Math.max(5,kAt(c,ballAt(tau))*.08),{taper:.9,pressure:.2,wobble:0}),.5);}
  // "no big swing": the toe's short, compact arc
  const ns=sm(tN-.1,tN+.4,t)*(1-sm(tS+.4,tS+.9,t));
  if(ns>.02){const q=SWING.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length>3){const w=Math.max(5,kAt(c,C_BALL)*.05);s.knockout(ribbon(q,w*1.8,{seed:17,taper:.4,wobble:.4}),.7*ns);s.fill(Y,ribbon(q,w,{seed:17,taper:.4,wobble:.4}),.95*ns);}}
  shotPath(s,c,tau,1-sm(.9,1,tau),{min:7});
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  // "opens his foot": a red ring round the inside of the right boot
  const of=sm(tO-.12,tO+.25,t,easeOutBack)*(1-sm(tS+.3,tS+.7,t));
  if(hr&&of>.02){const toe=hr.joints.rToe,an=hr.joints.rAn,r=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.2*of+3,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*r*1.25,cy+Math.sin(a)*r*.85]);}
   s.fill(R,ribbon(pts,Math.max(3,r*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*of);}
  // "side-foots it low": the spark at contact
  const sf=sm(tS-.1,tS+.25,t,easeOutBack)*(1-sm(tS+.6,tS+1,t));
  if(sf>.02){const p=pr(c,C_BALL);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,C_BALL)*.4)*sf,{n:9,seed:61,width:Math.max(5,kAt(c,C_BALL)*.04)});}
 },
 aperture(t){const c=cam2(t),P=ballAt(Math.min(tau2(t),FLY)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch2.still=CUE(1,'opens his foot')+.2;

// ---------------------------------------------------------------- 3 · the second replay angle, behind the goal, running on into the knee slide
const tau3=(t:number)=>{const tg=CUE(2,'That goal');return key(t,mono([[0,-.35],[CUE(2,'Past Bastoni'),.25],[CUE(2,'André Onana'),.6],[CUE(2,'bottom corner'),IN_NET],[tg,IN_NET+1.3],[CUE(2,'first Champions'),SL+.55],[SECS(2)+1,SL+.55+(SECS(2)+1-CUE(2,'first Champions'))*.9]]),linear);};
const E3:V3=[9,2.3,-3.2];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,IN_NET)),hp=at3(HERO,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([-17,1,1],b,.3),fov:30})],
  [CUE(2,'Past Bastoni')-.2,.8,()=>({P:E3,T:mix3([-8,.9,2.5],b,.5),fov:28})],
  [CUE(2,'André Onana')-.2,.6,()=>({P:add3(E3,[-.6,-.3,.4]),T:[-1.2,.7,2],fov:24})],
  [CUE(2,'bottom corner')+.35,1.5,()=>({P:[1.5,2.3,15],T:add3(hp,[.5,0,.3]),fov:30})],
  [CUE(2,'first Champions')-.3,1.3,()=>({P:[.5,2,14.5],T:add3(hp,[1,.1,.6]),fov:22})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tb=CUE(2,'bottom corner'),tf=CUE(2,'first Champions');
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)*.7+.3*sm(tf-.1,tf+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  if(tau>.02&&tau<IN_NET+.7){const fade=1-sm(FLY+.1,IN_NET+.7,tau);shotPath(s,c,tau,fade,{from:Math.max(0,tau-.6),min:8});}
  play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  // "past Bastoni": the block arrives too late — a spark where his boot meets only air
  const pb=t-CUE(2,'Past Bastoni');if(pb>-.1&&pb<.6){const[bx,bz]=posOf(BASTONI,.3),P:V3=[bx+.2,.2,bz-.9],q=pr(c,P);if(q)sparkBurst(s,R,q[0],q[1],Math.max(40,kAt(c,P)*.5),{n:8,seed:83,g:easeOutBack(clamp((pb+.1)/.2))*(1-clamp((pb-.35)/.25)),width:Math.max(5,kAt(c,P)*.05)});}
  // "bottom corner": a red ring round the corner as it goes in
  goalRing(s,c,GOAL_PT,sm(tb-.2,tb+.3,t,easeOutBack)*(1-sm(tb+.9,tb+1.4,t)));
  // "first Champions League!": a burst of paper and yellow over the slide (the passage material into the lesson)
  const fb=sm(tf-.05,tf+.35,t);if(fb>0){const q=pr(c,[SL_B[0]+1,3.8,SL_B[1]+1]);if(q)sparkBurst(s,Y,q[0],q[1],110+150*fb,{n:11,seed:9,g:easeOutBack(fb),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(HERO,tau3(t),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'bottom corner')+.2;

// ---------------------------------------------------------------- 4 · the lesson: hold deep → arrive late at the edge of the box → calm → place it, don't blast it
const tau4=(t:number)=>key(t,mono([[0,-5.6],[CUE(3,'holding'),-5],[CUE(3,'arrive late'),-2.6],[CUE(3,'edge of the box'),-1],[CUE(3,'Stay calm'),-.3],[CUE(3,'place it'),.05],[CUE(3,"Don't blast"),.55],[SECS(3),IN_NET+.4]]),linear);
function cam4v(t:number):Cam{
 const tau=tau4(t),hp=at3(HERO,tau,.9);
 return plan(t,[
  [0,0,()=>({P:[CX0-10,6.5,CZ0-17],T:mix3(hp,[CX0,.5,CZ0],.5),fov:46})],
  [CUE(3,'edge of the box')-.3,.9,()=>({P:[CX0-3,3.2,CZ0-9.5],T:add3(C_BALL,[.5,.6,.5]),fov:34})],
  [CUE(3,'Stay calm')+.3,1.3,()=>({P:[CX0-5.5,3.6,CZ0-.4],T:[-3,.6,2.2],fov:30})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tH=CUE(3,'holding'),tA=CUE(3,'arrive late'),tE=CUE(3,'edge of the box'),tC=CUE(3,'Stay calm'),tP=CUE(3,'place it'),tD=CUE(3,"Don't blast"),E=SECS(3);
  stadium(s,c,t);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · holding midfielder: a ring under him, deep, while the ball is out wide
  ring(s,c,at3(HERO,tau),.8,sm(tH-.15,tH+.35,t,easeOutBack)*(1-sm(tA-.2,tA+.2,t)),Y,44);
  // 2 · arrive late: his run into the space, drawn on as he makes it
  runArrow(s,c,-4.2,sm(tA-.1,tE+.2,t)*(1-sm(tP-.2,tP+.2,t)));
  // 3 · the edge of the box
  edgeOfBox(s,c,sm(tE-.15,tE+.4,t)*(1-sm(E-1.2,E-.8,t)));
  // 5 · place it: the low path into the corner, a ring on the target
  const pl=sm(tP-.1,tP+.5,t);if(pl>.02)shotPath(s,c,tau,pl,{min:9,ink:Y});
  goalRing(s,c,GOAL_PT,pl*(1-sm(E-.9,E-.5,t)),Y,78);
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:14});
  // 4 · stay calm: head still, the plumb line from his head to the ball
  plumb(s,c,hr,sm(tC-.2,tC+.3,t,easeOutBack)*(1-sm(tP+.2,tP+.6,t)));
  // 6 · don't blast it: a red struck-through ring over the top of the bar (the ball that flies over)
  const nb=sm(tD-.12,tD+.3,t,easeOutBack)*(1-sm(E-.8,E-.4,t));
  if(nb>.02){const P:V3=[0,3.6,1.2],q=pr(c,P);if(q){const r=Math.max(22,kAt(c,P)*.4)*nb,pts:Pt[]=[];for(let i=0;i<30;i++){const a=i/30*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}
   const p=ribbon(pts,Math.max(4,r*.16),{close:true,seed:88,taper:0,wobble:.8});p.addPath(ribbon([[q[0]-r*.7,q[1]+r*.7],[q[0]+r*.7,q[1]-r*.7]],Math.max(4,r*.16),{seed:89,taper:.1,wobble:.5}));
   s.knockout(p,.9*nb);s.fill(R,p,.95*nb);footballPanels(s,q[0],q[1],r*.34,{rot:0,key:K,shadow:B,seed:5});}}
 },
 still:0,
};
ch4.still=CUE(3,'Stay calm')+.25;

const film:RisoStory={
 id:'rodri-final-2023',format:'11v11',title:"Rodri's Champions League winner",
 theme:'Arriving late: holding midfielders arrive at the edge of the box, stay calm and place it, not blast it',
 ageNote:'Manchester City 1–0 Inter, UEFA Champions League final, Atatürk Olympic Stadium, Istanbul, 10 June 2023. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a calm side-foot — a low yellow path rolling out from the point with a ball skimming along it. Reduced motion: the still path. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+300*k,y-40*Math.sin(Math.PI*k)+10*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,80,{n:7,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*16+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
