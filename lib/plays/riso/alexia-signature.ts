/** Alexia Putellas — signature: the late run into the box. Recreated from ONE real, well-documented moment: her stoppage-time goal in the
 * 2024 UEFA Women's Champions League final, Barcelona 2–0 Lyon, San Mamés Stadium, Bilbao, Saturday 25 May 2024 (goal 90+5' / 90+6').
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1
 * reconstruction from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT (iconicPlays.json: kind "signature", "the late run into the box"; lesson "Time your run from midfield so you arrive
 * just as the ball does"): the Guardian live blog describes the goal as exactly that move — "Batlle breaks forward before setting the ball
 * to Pina on the left. Putellas makes a run into the box, receives the pass from Pina before firing it home!" — a midfielder arriving late
 * in the box from deep, on the biggest stage, three minutes after coming on.
 *
 * SOURCES (read Sept 2026; fetched with curl, cached in the film scratchpad src-cache/):
 *  - Wikipedia, "2024 UEFA Women's Champions League final" (date, San Mamés, Bilbao, 50,827, partly cloudy 21 °C, Bonmatí 63', Putellas
 *    90+5', line-ups and numbers, Putellas on for Walsh 90+2', Pina on for Caldentey 90+2', Batlle on for Rolfö 66', her 94th-minute
 *    recovery from Dumornay in her own box, the kit templates worn that day: Barcelona home blaugrana stripes with blue shorts; Lyon all
 *    white with gold socks)  https://en.wikipedia.org/wiki/2024_UEFA_Women%27s_Champions_League_final
 *  - The Guardian live blog (Emillia Hawkins), "Barcelona v Lyon: Women's Champions League final – as it happened", 25 May 2024 (90+2'
 *    she comes on and takes the captain's armband; 90+4' the tackle on Dumornay; 90+7' entry quoted above; "GOAL! Barcelona 2-0 Lyon
 *    (Putellas, 90+6)"; the photo caption "celebrates … with Aitana Bonmati and Claudia Pina")
 *    https://www.theguardian.com/football/live/2024/may/25/barcelona-v-lyon-womens-champions-league-final-live
 *  - The Guardian, Suzanne Wrack, "Bonmatí and Putellas fire Barcelona to Champions League glory against Lyon" ("added the second three
 *    minutes after coming on deep into added time", "powering in")
 *    https://www.theguardian.com/football/article/2024/may/25/barcelona-lyon-womens-champions-league-final-match-report
 *  - The Independent, Jamie Braidwood, 25 May 2024 ("As Putellas crashed a left-footed shot high into the net, it wasn't just the stand
 *    behind the goal that erupted"; the stadium ~90 % Barcelona fans "apart from the pocket of white behind one goal")
 *    https://www.independent.co.uk/sport/football/barcelona-lyon-womens-champions-league-putellas-bonmati-b2551562.html
 *  - UEFA.com final report, "Barcelona 2-0 Lyon" ("substitute Putellas put the gloss on the victory with a wonderful crashing finish")
 *    https://www.uefa.com/womenschampionsleague/news/028d-1af9862331e9-90fcbcd9c8ba-1000/
 * CONFIRMED by those accounts: Barcelona 1–0 up in stoppage time; Putellas (No. 11) on as a substitute three minutes earlier; Ona Batlle
 * (22) breaks forward and sets the ball to Clàudia Pina (6) on the LEFT; Putellas runs into the box, receives Pina's pass and fires a
 * LEFT-FOOTED shot HIGH into the net; a "crashing", "powering" finish; the stand behind that goal full of Barcelona fans erupts; Lyon's
 * fans a pocket of white behind one goal; she tore her shirt off to celebrate (not shown); Bonmatí (14) and Pina celebrate with her.
 * Players on the pitch at 90+5' shown here: Barcelona — Batlle 22, Pina 6, Putellas 11, Bonmatí 14, Graham Hansen 10, Brugts 24;
 * Lyon — Endler 1, Carpenter 12, Renard 3, Bacha 4, Horan 26. KITS: Barcelona home — blaugrana stripes (red with blue stripes here), blue
 * shorts, claret-red socks; Lyon all white, gold socks.
 * INFERRED (illustrative): every exact position, run and timing in metres and seconds; Batlle's carry and passing foot (right); Pina's
 * short carry and passing foot (left) and where she passed from; Putellas's start point "in midfield" and the exact line and pace of her
 * run; that she struck it first time (the sources say only "receives … before firing it home"); the strike point (≈11 m out, just left of
 * centre) and the exact spot the ball hit the roof of the net; which Lyon defenders were nearest (shown by number, not named); Endler's
 * kit colour (yellow here) and her late dive; Barcelona's yellow numbers; Putellas's hair (tied back, light brown printed as a yellow
 * screen); which end Barcelona attacked (the main-stand camera films with Barcelona attacking to the right, so the left wing is the near
 * side); San Mamés's shape (steep rectangular stands close to the pitch under a white roof — general knowledge of the venue, not from the
 * fetched pages); the evening light; the crowd colours; the camera positions; the celebration run.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME, panning with the ball: Batlle breaks forward
 * → finds Pina on the left → Putellas runs from midfield into the box → Pina's pass → the left-footed strike high into the net → the
 * celebration; ch2 = slow-motion replay from BEHIND and then BESIDE her, low: she starts in midfield (a yellow ring on the grass), holds her
 * run, then bursts forward the moment Pina gets the ball (a red ring on Pina, her yellow run trail growing); ch3 = the second replay angle
 * from BEHIND THE GOAL: the pass (a red line) and her run (a yellow line) converge on one spot (a yellow ring) — she arrives just as the
 * ball does — and she crashes it high into the net toward the camera; ch4 = the lesson: time your run from midfield → arrive just as the
 * ball does. Composed on the FULL sheet (world units = sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card
 * window down to square. Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton,
 * `prev` secondary motion so the ponytails swing, motionSmear on the sprint and the strike); women's builds (1.62–1.87 m, slimmer bulk)
 * with ponytails; small wide-shot figures and every figure inside a passage print at `low` detail. Handedness: the world is right-handed
 * (x toward the goal Lyon defend, y up, +z = the attackers' right), athlete.ts's own convention, so Putellas's LEFT foot is the left foot.
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,dribble,keeperSet,keeperDive,backpedal,celebrate,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/alexia-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/alexia-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The late run, live',text:'Bilbao, the 2024 Champions League final, in stoppage time. Barcelona lead Lyon one-nil. Ona Batlle breaks forward and finds Clàudia Pina on the left. Alexia Putellas, on for just three minutes, runs into the box. Pina passes. Goal!',tail:2.6,
  cues:['Bilbao','Barcelona lead','Ona Batlle','Clàudia Pina','Alexia Putellas','runs into','Pina passes','Goal']},
 {label:'Timing the run',text:'Watch again. Alexia starts in midfield, then bursts forward as Pina gets the ball.',tail:1.3,
  cues:['Watch again','starts in midfield','bursts forward','Pina gets the ball']},
 {label:'Just in time',text:'She arrives just as the ball does, and crashes it high into the net with her left foot!',tail:1.8,
  cues:['She arrives','just as the ball','crashes it','left foot']},
 {label:'The secret',text:'The secret? Time your run from midfield, so you arrive just as the ball does.',tail:2,
  cues:['The secret','Time your run','from midfield','arrive just','the ball does']},
];
import timingJson from '../../../public/plays/narration/alexia-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('alexia: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('alexia: no cue '+w);return c.at;};
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
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre at 1 unit per sheet unit (the passage arrival scale still multiplies in). */
function frame(s:Sheet){const S=s.arrival;s.camera((s.cx-s.W/2)/S,(s.cy-s.H/2)/S,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const view=(s:Sheet)=>({hx:s.W/(2*.68)+120,hy:s.H/(2*.68)+120});

// ---------------------------------------------------------------- 3D: projection through an athlete.ts Camera (right-handed metres, y up)
/** Pitch: the goal line Lyon defend is x = 0 (Barcelona attack +x), goal centre z = 0, +z = the attackers' right; halfway x = −52.5. */
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
function seg3(c:Cam,a:V3,b:V3,wm:number,out:Path2D,minW=1.1){let qa=toCam(c,a),qb=toCam(c,b);if(qa[2]<NEAR&&qb[2]<NEAR)return;
 const cut=(p:V3,q:V3):V3=>{const k=(NEAR-p[2])/(q[2]-p[2]);return[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,NEAR];};if(qa[2]<NEAR)qa=cut(qa,qb);else if(qb[2]<NEAR)qb=cut(qb,qa);
 const A=scr(c,qa),Bp=scr(c,qb),wa=Math.max(minW,c.F*wm/qa[2]/2),wb=Math.max(minW,c.F*wm/qb[2]/2),dx=Bp[0]-A[0],dy=Bp[1]-A[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 out.moveTo(A[0]+nx*wa,A[1]+ny*wa);out.lineTo(Bp[0]+nx*wb,Bp[1]+ny*wb);out.lineTo(Bp[0]-nx*wb,Bp[1]-ny*wb);out.lineTo(A[0]-nx*wa,A[1]-ny*wa);out.closePath();}
const cam3=(pos:V3,target:V3,fov:number)=>makeCamera({pos,target,fov,size:1080*LENS});

// ---------------------------------------------------------------- San Mamés: four steep rectangular stands close to the pitch under a white roof
/** each stand: a = along it 0..1, b = up the rake 0..1 (front row → back row) */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-111,6,a),1.3+27*b,41+21*b],   // 0 the far side (+z)
 (a,b)=>[8+18*b,1.3+25*b,lerp(-40,40,a)],     // 1 behind the goal Barcelona attack (+x): the Barcelona end
 (a,b)=>[lerp(6,-111,a),1.3+27*b,-41-21*b],  // 2 the camera side (−z)
 (a,b)=>[-113-18*b,1.3+25*b,lerp(40,-40,a)],  // 3 the other end (Lyon's pocket of white sits here)
];
/** the roof's inner edge, reaching out over the front rows */
const roofIn=(S:(a:number,b:number)=>V3,a:number):V3=>{const p=S(a,.72),q=S(a,1);return[p[0]+(p[0]-q[0])*.25,q[1]+5,p[2]+(p[2]-q[2])*.25];};
const STAND_COLS=[118,86,118,86],STAND_ROWS=15,WALKS=[.44],NSEG=8;
/** banners on the stand fronts: [stand, a, kind 0 = blaugrana (red | blue | red), 1 = senyera (yellow with red bars)] */
const FLAGS:[number,number,number][]=[[0,.22,0],[0,.4,1],[0,.58,0],[0,.76,1],[1,.25,0],[1,.45,1],[1,.62,0],[1,.8,0],[3,.2,0],[3,.78,1],[2,.35,0],[2,.62,1]];
/** is this seat inside Lyon's pocket of white (stand 3, the middle)? */
const lyonPocket=(si:number,a:number)=>si===3&&a>.4&&a<.6;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // an early-summer evening: a blue sky screen, deeper up high, a few white clouds knocked out of it
 s.field(B,.3,.55);
 const hz=pr(c,add3(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]));
 if(hz){const Bd=4000;s.tone(B,polyPath([[-Bd,-Bd],[Bd,-Bd],[Bd,hz[1]-700],[-Bd,hz[1]-620]],true),.3);
  const cl=new Path2D(),r=rng(2024);for(let i=0;i<5;i++){const x=(r()-.5)*2600,y=hz[1]-560-r()*520,w=260+r()*380;
   cl.addPath(polyPath(Array.from({length:18},(_,k)=>{const a=k/18*TAU;return[x+Math.cos(a)*w,y+Math.sin(a)*w*.12*(1+.4*Math.sin(a*3+i))] as Pt;}),true));}s.knockout(cl,.75);}
 const planes=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D(),rib=new Path2D();
 for(const i of which){const S=STANDS[i];for(let k=0;k<NSEG;k++){const a0=k/NSEG,a1=(k+1)/NSEG;addPoly(planes,polyP(c,[S(a0,0),S(a1,0),S(a1,1),S(a0,1)]));
  for(const b of WALKS)seg3(c,S(a0,b),S(a1,b),.6,walk);
  addPoly(roof,polyP(c,[add3(S(a0,1),[0,1.2,0]),add3(S(a1,1),[0,1.2,0]),roofIn(S,a1),roofIn(S,a0)]));
  seg3(c,roofIn(S,a0),roofIn(S,a1),.5,edge);
  // the white roof's lattice ribs (San Mamés's signature white structure), one per segment
  seg3(c,add3(S(a0,1),[0,1.2,0]),roofIn(S,a0),.28,rib);}}
 s.knockout(planes);s.tone(B,planes,.42);s.tone(K,planes,.24);s.knockout(walk,.5);
 // the crowd: Barcelona red and blue (with yellow senyeres) everywhere but Lyon's pocket of white; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const si of which){const S=STANDS[si],cols=STAND_COLS[si];for(let j=0;j<STAND_ROWS;j++){const b=(j+.5)/STAND_ROWS;if(WALKS.some(w=>Math.abs(b-w)<.045))continue;
  for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,9);if(h<.28)continue;const a=(i+.5+(hash(i+j*31,8)-.5)*.6)/cols,P=S(a,b),q=toCam(c,P);if(q[2]<NEAR)continue;
   const p=scr(c,q);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.6/q[2],2.4,18),barca=!lyonPocket(si,a),lift=roar>0&&barca?roar*z*1.3*Math.max(0,Math.sin(tt*10+h*TAU)):0;
   const ink=!barca?(h<.85?4:3):h<.55?0:h<.8?1:h<.88?2:h<.95?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}}}
 s.knockout(inks[0],.8);s.fill(R,inks[0],.92);s.knockout(inks[1],.8);s.fill(B,inks[1],.92);s.fill(Y,inks[2],.95);s.fill(K,inks[3],.85);s.knockout(inks[4],.85);
 // the roof: white (paper with a light screen), ribs knocked out, a navy lip
 s.knockout(roof);s.tone(B,roof,.14);s.knockout(rib,.8);s.fill(K,edge,.9);
 // banners: blaugrana and senyeres
 const red=new Path2D(),blu=new Path2D(),yel=new Path2D(),bars=new Path2D();
 for(const[si,a,kind] of FLAGS){if(!which.includes(si))continue;const S=STANDS[si],w=.04,P=(u:number,b:number)=>S(a+u*w,b);
  const q=polyP(c,[P(0,.005),P(1,.005),P(1,.075),P(0,.075)]);if(q.length<3)continue;
  if(kind===0){red.addPath(polyPath(q,true));addPoly(blu,polyP(c,[P(.34,.005),P(.66,.005),P(.66,.075),P(.34,.075)]));}
  else{yel.addPath(polyPath(q,true));for(const u of[.2,.45,.7])addPoly(bars,polyP(c,[P(u,.005),P(u+.1,.005),P(u+.1,.075),P(u,.075)]));}}
 s.knockout(red);s.knockout(yel);s.fill(R,red,.95);s.fill(B,blu,.95);s.fill(Y,yel,.95);s.fill(R,bars,.95);
 if(flash>0){const p=new Path2D(),n=Math.round(20*flash);for(let i=0;i<n;i++){const r1=hash(i*17+Math.floor(tt*12)*101,3),r2=hash(i*29+Math.floor(tt*12)*7,4),si=which[Math.floor(r1*which.length)],q=pr(c,STANDS[si](r2,.1+.8*hash(i,Math.floor(tt*12))));if(!q)continue;
  const z=8+11*flash;p.addPath(polyPath([[q[0]-z,q[1]],[q[0],q[1]-z*.35],[q[0]+z,q[1]],[q[0],q[1]+z*.35]],true));p.addPath(polyPath([[q[0],q[1]-z],[q[0]+z*.3,q[1]],[q[0],q[1]+z],[q[0]-z*.3,q[1]]],true));}s.knockout(p);s.fill(Y,p,.6);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,[[7.5,0,-40.5],[7.5,0,40.5],[-112.5,0,40.5],[-112.5,0,-40.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.92);s.tone(B,gp,.62);
 // mowing stripes across the pitch
 const st=new Path2D();for(let k=0;k<20;k+=2)addPoly(st,polyP(c,[[-k*5.25,0,-34],[-(k+1)*5.25,0,-34],[-(k+1)*5.25,0,34],[-k*5.25,0,34]]));s.tone(K,st,.12);
 // advertising boards: navy with yellow panels
 const bd=new Path2D(),pn=new Path2D(),board=(a:V3,b:V3)=>addPoly(bd,polyP(c,[a,b,add3(b,[0,.95,0]),add3(a,[0,.95,0])]));
 board([5,0,-37.5],[5,0,37.5]);board([-110,0,-37.5],[5,0,-37.5]);board([-110,0,37.5],[5,0,37.5]);
 for(let k=0;k<12;k++){const z=-35.5+k*6.1;addPoly(pn,polyP(c,[[4.9,.25,z],[4.9,.25,z+3.3],[4.9,.68,z+3.3],[4.9,.68,z]]));}
 for(const zz of[-37.4,37.4])for(let k=0;k<18;k++){const x=-107+k*6.3;addPoly(pn,polyP(c,[[x,.25,zz],[x+3.4,.25,zz],[x+3.4,.68,zz],[x,.68,zz]]));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.fill(Y,pn,.9);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([-k*13.125,0,-34],[-(k+1)*13.125,0,-34]);L([-k*13.125,0,34],[-(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){L([0,0,-34+k*17],[0,0,-34+(k+1)*17]);L([-52.5,0,-34+k*17],[-52.5,0,-34+(k+1)*17]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(-52.5,0,9.15);
 L([0,0,-20.16],[-16.5,0,-20.16]);L([-16.5,0,-20.16],[-16.5,0,20.16]);L([-16.5,0,20.16],[0,0,20.16]);
 L([0,0,-9.16],[-5.5,0,-9.16]);L([-5.5,0,-9.16],[-5.5,0,9.16]);L([-5.5,0,9.16],[0,0,9.16]);
 {const a=Math.acos(5.5/9.15);circ(-11,0,9.15,Math.PI-a,Math.PI+a,12);}
 seg3(c,[-11.1,0,0],[-10.9,0,0],.22,ln);seg3(c,[-52.6,0,0],[-52.4,0,0],.22,ln);
 circ(0,-34,1,Math.PI/2,Math.PI,4);circ(0,34,1,Math.PI,Math.PI*1.5,4);
 s.knockout(ln);
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c,o.bulge??0);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out HIGH where the ball crashed in (z ≈ 1.3) */
function goal3(s:Sheet,c:Cam,bulge:number){
 const X=0,z0=-3.66,z1=3.66,H=2.44,bz=1.3,back=(z:number,y:number)=>X+2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.5,2))*(.25+.75*y/1.9);
 const zs=[z0,-1.8,0,1.3,2.6,z1];
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back(z0,1.9),1.9,z0],[back(z0,0),0,z0]],[[X,0,z1],[X,H,z1],[back(z1,1.9),1.9,z1],[back(z1,0),0,z1]],
  [[X,H,z0],[X,H,z1],...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)],
  [...zs.map(z=>[back(z,0),0,z] as V3),...zs.slice().reverse().map(z=>[back(z,1.9),1.9,z] as V3)]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back(z,1.9),1.9,z],.022,mesh,.7);seg3(c,[back(z,1.9),1.9,z],[back(z,0),0,z],.022,mesh,.7);}
 for(let j=0;j<=5;j++){const y=1.9*j/6;for(let i=0;i<zs.length-1;i++)seg3(c,[back(zs[i],y),y,zs[i]],[back(zs[i+1],y),y,zs[i+1]],.022,mesh,.7);if(j>0){seg3(c,[X,y*H/1.9,z0],[back(z0,y),y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back(z1,y),y,z1],.022,mesh,.7);}}
 for(let j=1;j<4;j++){const u=j/4;seg3(c,[X+2*u,H-.54*u,z0],[X+2*u,H-.54*u,z1],.022,mesh,.7);}
 s.knockout(mesh,.8);
 const fr=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.12,fr);seg3(c,[X,0,z1],[X,H,z1],.12,fr);seg3(c,[X,H,z0-.06],[X,H,z1+.06],.12,fr);
 const fo=new Path2D();seg3(c,[X,0,z0],[X,H,z0],.2,fo);seg3(c,[X,0,z1],[X,H,z1],.2,fo);seg3(c,[X,H,z0-.04],[X,H,z1+.04],.2,fo);
 s.fill(K,fo,.9);s.knockout(fr);
}

// ---------------------------------------------------------------- the cast: kits (athlete.ts styles)
const SKIN_L:InkFill[]=[[Y,.35],[R,.2]],SKIN_M:InkFill[]=[[Y,.42],[R,.28],[B,.08]],SKIN_D:InkFill[]=[[Y,.46],[R,.36],[K,.2]];
/** women's footballers: a lighter frame than the default 1.8 m build, just as athletic */
const W_BUILD=(height:number,bulk=.9)=>({height,bulk,head:.97});
/** Barcelona home 2023-24: blaugrana stripes (red shirt, blue stripes), blue shorts, claret-red socks; yellow numbers (inferred) */
const barca=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:B,shorts:B,socks:R,boots:K,skin:SKIN_L,hair:K,line:K,trim:Y,numberInk:Y,hairStyle:'ponytail',build:W_BUILD(1.68),...o});
/** Lyon all in white (paper), gold socks (yellow); red trim and navy numbers (inferred) */
const lyon=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:Y,boots:K,skin:SKIN_L,hair:[Y,.85],line:K,trim:R,numberInk:K,hairStyle:'ponytail',build:W_BUILD(1.7),shade:[B,.3],...o});
const ALEXIA_B=W_BUILD(1.73,.95);
/** Alexia Putellas, No. 11: light-brown hair tied back (a yellow screen), navy boots */
const ALEXIA_ST=barca({number:11,hair:[Y,.72],build:ALEXIA_B,seed:11});
const ENDLER_ST:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:K,build:W_BUILD(1.82,.98),seed:1};

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Putellas's strike)
/** the strike: first time, ≈11 m out, just left of centre; LEFT foot, high into the roof of the net (inferred spot) */
const S_BALL:V3=[-11.2,.11,-4.6];
const GOAL_PT:V3=[0,2.06,1.25];
/** the approach for a LEFT-footed strike: the run comes in a little to the right of the line of the shot */
const KDIR:[number,number]=(()=>{const a=Math.atan2(GOAL_PT[2]-S_BALL[2],GOAL_PT[0]-S_BALL[0])-.36;return[Math.cos(a),Math.sin(a)];})();
const YAW_K=yawTo(0,0,KDIR[0],KDIR[1]);
const KSD=.72;
/** her pelvis at contact so her LEFT boot meets the ball (solved once through the skeleton) */
const PK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'l'}),ALEXIA_B,{x:0,z:0,yaw:YAW_K});const tx=S_BALL[0]-KDIR[0]*.1,tz=S_BALL[2]-KDIR[1]*.1;return[tx-sk.lToe[0],tz-sk.lToe[2]];})();
/** Batlle breaks forward and sets it to Pina; Pina's short carry; her pass into the box */
const T_BP=-5.3,T_PR=-4.45,T_PASS=-1.05;
/** the shot: ≈11.9 m in .42 s, rising into the roof of the net; the net; the drop */
const T_GOAL=.42,NET_HIT:V3=[1.75,1.92,1.3],T_NET=T_GOAL+.14,REST:V3=[1.2,.11,1];
const shotAt=(u:number):V3=>{const p=mix3(S_BALL,GOAL_PT,u);p[1]=lerp(S_BALL[1],GOAL_PT[1],u*(.55+.45*u))+.35*Math.sin(Math.PI*u);return p;};

// ---------------------------------------------------------------- movement: time-keyed paths (C¹ Hermite) with a cumulative-distance table for the stride phase
type Path=[number,number,number][];// [τ, x, z]
function pathAt(p:Path,tau:number):[number,number]{
 const n=p.length;if(tau<=p[0][0])return[p[0][1],p[0][2]];if(tau>=p[n-1][0])return[p[n-1][1],p[n-1][2]];
 let i=0;while(i<n-2&&tau>=p[i+1][0])i++;
 const a=p[i],b=p[i+1],h=b[0]-a[0],u=(tau-a[0])/h,u2=u*u,u3=u2*u;
 const tan=(j:number,k:1|2)=>{if(j<=0||j>=n-1)return 0;return(p[j+1][k]-p[j-1][k])/(p[j+1][0]-p[j-1][0]);};
 const f=(k:1|2)=>(2*u3-3*u2+1)*a[k]+(u3-2*u2+u)*h*tan(i,k)+(-2*u3+3*u2)*b[k]+(u3-u2)*h*tan(i+1,k);
 return[f(1),f(2)];
}
const T_MIN=-14,T_MAX=10,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
/** metres per full run cycle (two strides) */
const CYCLE_M=3.9;

// ---------------------------------------------------------------- Putellas: in midfield, holding her run, then the burst into the box, the strike, the celebration
/** a jog through midfield while Batlle carries it; the burst the moment the ball goes to Pina; flat out into the box to meet the pass */
const ALEXIA_PATH:Path=[[-14,-61,-1.4],[-10,-54.4,-2.4],[-7,-49.6,-3],[-5.3,-47.2,-3.3],[T_PR,-45.6,-3.5],[-3.2,-39.4,-4],[-2,-31.4,-4.4],[-1,-23.8,-4.6],
 [-.4,PK[0]-KDIR[0]*4.2,PK[1]-KDIR[1]*4.2],[0,PK[0],PK[1]],[.5,PK[0]+KDIR[0]*2.3,PK[1]+KDIR[1]*2.3],
 // the celebration: she wheels away toward the corner and the Barcelona fans behind the goal
 [1.7,-6.4,-11.4],[3,-4.6,-17.6],[4.5,-3.4,-23.6],[6,-3.2,-28],[7.6,-4,-30.2]];
const ALEXIA_TAB=distTable(ALEXIA_PATH);
const alexiaXZ=(tau:number):V3=>{const p=pathAt(ALEXIA_PATH,tau);return[p[0],0,p[1]];};
const ARMS_OUT=posed({lShA:104,rShA:100,lShF:10,rShF:14,lElb:14,rElb:18,lHand:1,rHand:1,neckP:-28,lean:-6,pitch:-3,lHipF:14,rHipF:-2,lKnee:18,rKnee:22,lHipA:8,rHipA:8});
function alexiaPose(tau:number):Pose{
 const sp=speedAt(ALEXIA_PATH,tau),ph=distAt(ALEXIA_TAB,tau)/CYCLE_M;
 let p=blendPose(stand(),runCycle(ph,{speed:clamp((sp-1.5)/5.5)}),sm(.5,2,sp));
 // scanning: head up and turned toward the ball while she jogs, then eyes on the pass, then down over the ball
 p.neckY+=-26*DEG*sm(-9,-8,tau)*(1-sm(-4.8,-4.2,tau));
 p.neckP+=16*DEG*sm(-.7,-.35,tau)*(1-sm(.2,.5,tau));
 // the strike (LEFT foot, first time) and its follow-through
 const us=STRIKE_CONTACT+tau/KSD;
 if(us>.05){const w=sm(.05,.2,us)*(tau<1?1:1-sm(1,1.4,tau));p=blendPose(p,strike(clamp(us,0,1),{foot:'l',power:1}),w);}
 // then the celebration run, arms out
 if(tau>.5){const s=distAt(ALEXIA_TAB,tau);let c=celebrate(s/4.2,{kind:'run'});if(tau>6)c=blendPose(c,ARMS_OUT,clamp(1-sp/3)*sm(6,7,tau));p=blendPose(p,c,sm(.5,1.1,tau));}
 return p;
}
function alexiaPlace(tau:number):Place{
 const[x,z]=pathAt(ALEXIA_PATH,tau),sp=speedAt(ALEXIA_PATH,tau),a=pathAt(ALEXIA_PATH,tau+.1);
 let yaw=yawTo(x,z,a[0],a[1]);if(sp<1)yaw=yawTo(x,z,0,0);
 const w=sm(-.5,-.25,tau)*(1-sm(.45,.85,tau));yaw=lerpAng(yaw,YAW_K,w);
 if(tau>6)yaw=lerpAng(yaw,yawTo(x,z,30,-50),clamp(1-sp/2.5)*sm(6,7,tau));
 return{x,z,yaw};
}

// ---------------------------------------------------------------- everyone else
type Role='run'|'def'|'keeper'|'carrier';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;barca:boolean;
 /** a carrier dribbles with this foot between these τ, then passes: [from, to (the pass contact), foot, power, target] */carry?:[number,number,'l'|'r',number,V3]};
const PINA_RCV:V3=[-27.4,.11,-26.2];
const ACTORS:Actor[]=[
 {name:'Batlle',role:'carrier',barca:true,st:barca({number:22,build:W_BUILD(1.65,.92),seed:22}),
  path:[[-14,-68,-21],[-10,-60.4,-20.4],[-7,-52.6,-20],[T_BP,-48.2,-20.6],[-3.5,-44.6,-21.6],[0,-38,-22],[4,-32,-21]],phase:.3,carry:[-14,T_BP,'r',.7,PINA_RCV]},
 {name:'Pina',role:'carrier',barca:true,st:barca({number:6,build:W_BUILD(1.62,.92),skin:SKIN_M,seed:6}),
  path:[[-14,-34,-30.5],[-8,-31,-29],[T_PR,PINA_RCV[0]-.7,PINA_RCV[2]-.2],[-3.2,-24.2,-24.6],[-2,-21.4,-22.6],[T_PASS,-19.6,-21.4],[0,-18.4,-20.6],[3,-13,-16]],phase:.7,carry:[T_PR,T_PASS,'l',.9,S_BALL]},
 {name:'Bonmati',role:'run',barca:true,st:barca({number:14,build:W_BUILD(1.62,.9),seed:14}),path:[[-14,-66,6],[-8,-56,4.4],[-3,-42,1.6],[0,-31,-.4],[3,-18,-4],[6,-10,-8]],phase:.5},
 {name:'Brugts',role:'run',barca:true,st:barca({number:24,build:W_BUILD(1.72,.95),seed:24}),path:[[-14,-40,4],[-8,-33,3],[-3,-21,2.2],[0,-12.6,2.6],[4,-9,.6]],phase:.15},
 {name:'Graham Hansen',role:'run',barca:true,st:barca({number:10,build:W_BUILD(1.75,.95),seed:10}),path:[[-14,-42,20],[-8,-36,18.5],[-3,-24,15.4],[0,-16,12.4],[4,-12,8]],phase:.85},
 {name:'Carpenter',role:'def',barca:false,st:lyon({number:12,build:W_BUILD(1.57,.92),seed:12}),path:[[-14,-30,-24],[-8,-30.5,-25.4],[-5,-29.4,-24.8],[-3,-24,-22.4],[-1,-19.2,-19.4],[1,-16.4,-17],[4,-13,-14]],phase:.2},
 {name:'Renard',role:'def',barca:false,st:lyon({number:3,build:W_BUILD(1.87,1),skin:SKIN_D,hair:K,seed:3}),path:[[-14,-30,-3],[-8,-27,-2.4],[-4,-21,-1.8],[-1.5,-15.4,-1.4],[0,-13,-1.1],[1,-11.4,-1.4],[4,-8.6,-1.6]],phase:.6},
 {name:'Bacha',role:'def',barca:false,st:lyon({number:4,build:W_BUILD(1.63,.9),seed:4}),path:[[-14,-30,12],[-8,-27,9],[-4,-20,6.2],[-1,-14.4,4.4],[0,-12.6,3.8],[4,-9,2.6]],phase:.9},
 {name:'Horan',role:'def',barca:false,st:lyon({number:26,build:W_BUILD(1.75,1),seed:26}),path:[[-14,-44,-5],[-8,-42,-6.4],[-5,-40.6,-6.8],[-3,-34.4,-6.6],[-1.5,-24,-6.8],[0,-17.4,-6.2],[1.5,-12.4,-5.2],[4,-10,-5]],phase:.4},
 {name:'Endler',role:'keeper',barca:false,st:ENDLER_ST,path:[[-14,-7,-.4],[-6,-4.2,-1.4],[-3,-2.4,-2.2],[-1,-1.8,-2.2],[0,-1.7,-1.9],[4,-1.4,-.8]],phase:0},
];
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const SLUMP=posed({lHipF:30,rHipF:30,lKnee:36,rKnee:36,lean:34,pitch:6,neckP:30,lShA:14,rShA:14,lShF:24,rShF:24,lElb:20,rElb:20});
const TABS=new Map<Path,number[]>();
function distTableCached(p:Path){let t=TABS.get(p);if(!t){t=distTable(p);TABS.set(p,t);}return t;}
/** where a carrier's ball sits: just ahead of her boots along her run */
function carryBall(a:Actor,tau:number):V3{const[x,z]=pathAt(a.path,tau),b=pathAt(a.path,tau+.12),l=Math.hypot(b[0]-x,b[1]-z)||1,ph=distAt(distTableCached(a.path),tau)/CYCLE_M,push=.55+.35*Math.abs(Math.sin(Math.PI*ph));return[x+(b[0]-x)/l*push,.11,z+(b[1]-z)/l*push];}
/** one actor's pose + place at τ (it = idle clock). Barcelona celebrate after the goal; Lyon's heads drop. */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(distTableCached(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 if(a.role==='keeper'){
  // Endler shuffles across to cover the pass, set; the shot crashes high past her — a late dive to her left
  let kp=blendPose(keeperSet(it*1.3),backpedal(ph*1.6),sm(.3,1,sp)*.5);
  if(tau>.06){const u=clamp((tau-.06)/1.1);kp=blendPose(kp,keeperDive(u*.8,{side:'l',height:.85}),sm(.06,.2,tau)*(1-sm(2.6,3.2,tau)));}
  if(tau>2.6)kp=blendPose(kp,SLUMP,sm(2.6,3.2,tau)*.6);
  return{pose:kp,place:{x,z,yaw:tau<.1?toBall:lerpAng(toBall,yawTo(x,z,S_BALL[0],S_BALL[2]),sm(.1,.3,tau))}};
 }
 if(a.carry){const[c0,c1,foot,power,tgt]=a.carry;
  // on the ball: short quick touches with her carrying foot, head over it
  if(tau>=c0&&tau<c1){const w=sm(c0,c0+.3,tau)*(1-sm(c1-.45,c1-.25,tau));p=blendPose(p,dribble(ph,{foot,speed:clamp(sp/7)}),w*.85);}
  const us=STRIKE_CONTACT+(tau-c1)/.8;
  if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot,power}),w);yaw=lerpAng(yaw,yawTo(x,z,tgt[0],tgt[2]),w);}}
 if(a.role==='def'){
  // backing off toward goal, facing the ball, shuffling; Horan chases Putellas's run
  if(a.name!=='Horan'){const back=blendPose(READY,backpedal(ph*1.4),sm(.4,1.2,sp));p=blendPose(back,p,sm(3.5,5.5,sp));yaw=lerpAng(toBall,yaw,sm(3.5,5.5,sp));}
 }
 if(tau>T_NET+.2&&sp<1.6){if(a.barca)p=blendPose(p,celebrate(it*.9+a.phase,{kind:'arms'}),sm(T_NET+.2,T_NET+.7,tau)*.9);else p=blendPose(p,SLUMP,sm(T_NET+.2,T_NET+.9,tau)*.6);}
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ball
const BATLLE=ACTORS[0],PINA=ACTORS[1];
const BP_BALL:V3=carryBall(BATLLE,T_BP),PP_BALL:V3=carryBall(PINA,T_PASS);
function ballAt(tau:number):V3{
 if(tau<T_BP)return carryBall(BATLLE,tau);
 if(tau<T_PR){const u=(tau-T_BP)/(T_PR-T_BP);return mix3(BP_BALL,PINA_RCV,u*(1.3-.3*u));}
 if(tau<T_PASS){const k=sm(T_PR,T_PR+.35,tau);return mix3(PINA_RCV,carryBall(PINA,tau),k);}
 if(tau<0){const u=(tau-T_PASS)/(0-T_PASS);return mix3(PP_BALL,S_BALL,u*(1.25-.25*u));}
 if(tau<T_GOAL)return shotAt(tau/T_GOAL);
 if(tau<T_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-T_GOAL)/(T_NET-T_GOAL)));
 const u=clamp((tau-T_NET)/.7);return[lerp(NET_HIT[0],REST[0],u),.11+(NET_HIT[1]-.11)*(1-u)*(1-u)+.12*(1-u)*Math.abs(Math.sin(u*8)),lerp(NET_HIT[2],REST[2],u)];
}
const spinAt=(tau:number)=>tau<=0?TAU*1.3*(tau-T_MIN):TAU*1.3*-T_MIN+TAU*4*Math.min(tau,T_NET)+TAU*.8*Math.max(0,tau-T_NET);
const bulgeAt=(tau:number)=>tau<T_NET-.03?0:.9*Math.exp(-(tau-T_NET+.03)*2.6)*(1+.3*Math.sin((tau-T_NET)*14));

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the sprint, the strike). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball on screen
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8&&P[0]<.05)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&((tau>0&&tau<T_NET)||(tau>T_PASS&&tau<0)||(tau>T_BP&&tau<T_PR))){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,Y,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(280,d*1.5),spread:r*.9,width:Math.max(2.5,r*.18),cov:.85});}}
 footballPanels(s,g[0],g[1],r,{rot:spinAt(tau),key:K,shadow:B,seed:5});
 return{g,r,d:q[2]};
}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={it:number;smear?:boolean;minBall?:number;lines?:boolean;prevT?:number;hero?:'high'|'mid';only?:number};
/** everything on the pitch, depth-sorted (far first): the players at τp (poses on twos), their previous drawn pose, the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped. `only` skips figures farther than that (m). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpPrev:number,e:Env){
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;
 const visible=(pl:Place,h=1.8)=>{const q=toCam(c,[pl.x??0,.9,pl.z??0]);if(q[2]<1)return -1;if(e.only&&q[2]>e.only)return -1;const g=scr(c,q),k=c.F/q[2]*h;return Math.abs(g[0])>v.hx+k||g[1]<-v.hy-k||g[1]>v.hy+k?-1:q[2];};
 const detailFor=(st:AthleteStyle,d:number,hero:boolean):AthleteStyle=>{const px=c.F*1.8/d*ppu;if(passing)return{...st,detail:hero?'mid':'low'};if(px<(hero?50:120))return{...st,detail:'low'};if(e.hero==='mid'&&px>170)return{...st,detail:'mid'};return st;};
 {const pl=alexiaPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=alexiaPose(tp),prev={pose:alexiaPose(tpPrev),place:alexiaPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(ALEXIA_ST,d,true),pl,prev,!!e.smear&&((tp>-4.4&&tp<.6)||(tp>1&&tp<5)));}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='keeper'||a.name==='Pina'),cur.place,prev,!!e.smear&&a.role==='keeper'&&tp>-.05&&tp<1);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch), nudged toward the goal */
function panTarget(tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(tau-i*.1);x+=p[0];y+=Math.min(1.4,p[1]);z+=p[2];}return[x/5+3,(y/5)*.6+.6,z/5];}
/** smoothed ground point under Putellas (cameras ride this) */
const kxz=(tau:number):V3=>{let x=0,z=0;for(let i=-2;i<=2;i++){const p=pathAt(ALEXIA_PATH,tau+i*.12);x+=p[0];z+=p[1];}return[x/5,0,z/5];};

/** her run so far, traced on the grass (a riso replay trail under the players) */
function runTrail(s:Sheet,c:Cam,t0:number,t1:number,fade:number,wm=.34){
 if(t1<=t0+.05||fade<=.02)return;const pts:Pt[]=[];for(let i=0;i<=28;i++){const tau=lerp(t0,t1,i/28),p=pathAt(ALEXIA_PATH,tau),q=pr(c,[p[0],.02,p[1]]);if(q)pts.push(q);}
 if(pts.length<3)return;const w=Math.max(9,kAt(c,alexiaXZ(t1))*wm);s.knockout(ribbon(pts,w*1.5,{taper:.8,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.8,pressure:.2,wobble:0}),.9*fade);}
/** a projected arrow (shaft + head) along 3D points, in one ink */
function arrow3(s:Sheet,c:Cam,pts:V3[],w:number,ink:string,cov=1,dashed=false){
 const q=pts.map(p=>pr(c,p)).filter((p):p is Pt=>!!p);if(q.length<2)return;
 const e=q[q.length-1],f=q[q.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),ca=Math.cos(ang),sa=Math.sin(ang),hd=w*2.6;
 const shaft=q.slice(0,-1).concat([[e[0]-ca*hd*.7,e[1]-sa*hd*.7]]);
 const gaps:[number,number][]=[];if(dashed)for(let i=0;i<6;i++)gaps.push([(i+.55)/6,(i+.9)/6]);
 const p=ribbon(shaft,w,{taper:.2,pressure:.2,wobble:.8,gaps});p.addPath(polyPath([[e[0]+ca*hd*.3,e[1]+sa*hd*.3],[e[0]-ca*hd-sa*hd*.62,e[1]-sa*hd+ca*hd*.62],[e[0]-ca*hd+sa*hd*.62,e[1]-sa*hd-ca*hd*.62]],true));
 s.knockout(p);s.fill(ink,p,cov);s.stroke(K,p,Math.max(2,w*.12),.85);
}
/** a ring on the grass around a ground point (radius in metres), drawn as a projected ellipse */
function groundRing(s:Sheet,c:Cam,P:V3,rm:number,u:number,ink:string,seed:number){if(u<=.02)return;const pts:Pt[]=[];for(let i=0;i<36;i++){const a=i/36*TAU,q=pr(c,[P[0]+Math.cos(a)*rm*(.7+.3*u),.02,P[2]+Math.sin(a)*rm*(.7+.3*u)]);if(q)pts.push(q);}if(pts.length<10)return;
 const w=Math.max(5,kAt(c,P)*.07),rr=ribbon(pts,w,{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*u);s.fill(ink,rr,.95*u);}
/** Pina's pass: a red arrow on the grass from her boot to the meeting spot, growing as the ball travels (u = how much is drawn) */
function passArrow(s:Sheet,c:Cam,u:number,cov=.95){if(u<=.02)return;const a:V3=[PP_BALL[0],.03,PP_BALL[2]],b:V3=[S_BALL[0]-.7,.03,S_BALL[2]-.35],e=mix3(a,b,u);
 arrow3(s,c,[a,mix3(a,e,.5),e],Math.max(7,kAt(c,e)*.17),R,cov);}
/** the shot so far: a yellow trail from her boot, rising into the roof of the net */
function shotTrail(s:Sheet,c:Cam,tau:number,fade:number){if(tau<=0||fade<=.02)return;const pts:Pt[]=[];const n=16,te=Math.min(tau,T_NET);
 for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(0,te,i/n)));if(p)pts.push(p);}if(pts.length<3)return;
 const w=Math.max(8,kAt(c,ballAt(Math.min(tau,T_GOAL)))*.12);s.knockout(ribbon(pts,w*1.5,{taper:.9,pressure:.2,wobble:0}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.9,pressure:.2,wobble:0}),.9*fade);}
/** the crash into the roof of the net */
function netSpark(s:Sheet,c:Cam,tau:number){const k=sm(T_NET-.04,T_NET+.02,tau)*(1-sm(T_NET+.12,T_NET+.36,tau));if(k<=0)return;const q=pr(c,NET_HIT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(36,kAt(c,NET_HIT)*.55)*k,{n:9,seed:44,width:Math.max(4,kAt(c,NET_HIT)*.05)});}
/** the strike: a burst at her boot */
function strikeSpark(s:Sheet,c:Cam,tau:number){const hit=sm(-.02,.04,tau)*(1-sm(.1,.28,tau));if(hit<=0)return;const q=pr(c,S_BALL);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(40,kAt(c,S_BALL)*.6)*hit,{n:9,seed:11,width:Math.max(5,kAt(c,S_BALL)*.05)});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, panning with the ball
/** real time; the strike lands just before "Goal!" */
const tS1=()=>CUE(0,'Goal')-.5;
const tau1=(t:number)=>t-tS1();
const P1:V3=[-34,19,-57];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-52,5,6],fov:30})],
  [CUE(0,'Barcelona lead')-.3,1.8,()=>({P:P1,T:panTarget(tau),fov:12.5})],
  [CUE(0,'Alexia')-.4,1.1,()=>({P:P1,T:mix3(panTarget(tau),add3(kxz(tau),[0,.6,0]),.8),fov:14})],
  [CUE(0,'runs into')-.3,1,()=>({P:P1,T:mix3(panTarget(tau),[-14,1,-8],.3),fov:10.5})],
  [tS1()-.5,.7,()=>({P:P1,T:mix3(panTarget(tau),[-5,1.2,-2],.55),fov:9.5})],
  [tS1()+T_NET+.5,1.6,()=>({P:P1,T:add3(kxz(tau),[0,1,0]),fov:7.5})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),tN=tS1()+T_NET;
  stadium(s,c,t,[0,1,3],{roar:sm(tN,tN+.4,t),flash:sm(tN,tN+.25,t)*(1-sm(tN+2.5,tN+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
  netSpark(s,c,tau);
 },
 aperture(t){const c=cam1(t),q=pr(c,add3(kxz(tau1(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:10.5,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low, from behind her and then beside her: midfield, the wait, the burst
const tau2=(t:number)=>key(t,mono([[0,-8.2],[CUE(1,'starts in'),-7.4],[CUE(1,'bursts'),-4.9],[CUE(1,'Pina gets'),-4.3],[SECS(1),-2.6]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),k=kxz(tau);
 return plan(t,[
  [0,0,()=>({P:add3(k,[-11,3.6,5.5]),T:add3(k,[9,.5,-9]),fov:38})],
  [CUE(1,'starts in')+.2,1.4,()=>({P:add3(k,[-9,3.2,5]),T:add3(k,[12,.6,-11]),fov:40})],
  [CUE(1,'bursts')-.2,1.2,()=>({P:add3(k,[3.5,1.8,10.5]),T:add3(k,[.5,.9,-1]),fov:38})],
  [CUE(1,'Pina gets')+.2,1.4,()=>({P:add3(k,[-2,2.2,11]),T:add3(k,[5.5,.8,-10]),fov:42})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),tM=CUE(1,'starts in'),tB=CUE(1,'bursts'),tP=CUE(1,'Pina gets');
  stadium(s,c,t,[0,1,3]);
  ground(s,c);
  // midfield: a yellow ring where she starts; the burst: her run traced on the grass; Pina gets the ball: a red ring on her
  groundRing(s,c,alexiaXZ(-7.4),1.1,sm(tM-.1,tM+.5,t,easeOutBack),Y,31);
  runTrail(s,c,-7.4,Math.min(tau,-.5),sm(tB-.2,tB+.5,t));
  {const u=sm(tP-.15,tP+.4,t,easeOutBack);if(u>.02){const[x,z]=pathAt(PINA.path,Math.min(tau,-3.6));groundRing(s,c,[x,0,z],1.1,u,R,37);}}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06),only:70});
 },
 aperture(t){const c=cam2(t),q=pr(c,add3(kxz(tau2(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:4.2,
};

// ---------------------------------------------------------------- 3 · second replay from behind the goal: the pass and the run meet; the crash into the net; then live
const tau3=(t:number)=>{const a=CUE(2,'She arrives'),j=CUE(2,'just as'),c=CUE(2,'crashes'),f=CUE(2,'left foot');
 return key(t,mono([[0,-2.4],[a+.3,-1.6],[j+.3,-.5],[c,-.02],[c+.5,.18],[f,T_NET+.05],[SECS(2),T_NET+.05+(SECS(2)-f)]]),linear);};
const E3:V3=[6.5,3.4,-9.5];
function cam3v(t:number):Cam{
 const tau=tau3(t),k=add3(kxz(tau),[0,1.1,0]);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3(k,[-14,1,-10],.35),fov:26})],
  [CUE(2,'just as')-.3,.9,()=>({P:E3,T:mix3(k,S_BALL,.5),fov:24})],
  [CUE(2,'crashes')-.1,.5,()=>({P:E3,T:mix3([-8,1.2,-3.4],GOAL_PT,.35),fov:30})],
  [CUE(2,'left foot')+.3,1.4,()=>({P:add3(E3,[.3,.3,-1]),T:k,fov:18})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tA=CUE(2,'She arrives'),tJ=CUE(2,'just as'),tF=CUE(2,'left foot');
  stadium(s,c,t,[3,2,0],{roar:sm(tF,tF+.4,t),flash:sm(tF,tF+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the run (yellow) and the pass (red) converge on one spot, ringed yellow, the moment they meet
  const fadeLines=1-sm(T_NET+.3,T_NET+1,tau);
  runTrail(s,c,-3,Math.min(tau,-.35),sm(tA-.1,tA+.5,t)*fadeLines,.3);
  passArrow(s,c,clamp((tau-T_PASS)/(0-T_PASS))*sm(tA,tA+.3,t),.95*fadeLines);
  groundRing(s,c,S_BALL,.9,sm(tJ-.1,tJ+.45,t,easeOutBack)*fadeLines,Y,53);
  shotTrail(s,c,tau,1-sm(T_NET+.2,T_NET+1,tau));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,lines:true,prevT:tau3(t-.06),only:60});
  strikeSpark(s,c,tau);netSpark(s,c,tau);
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(kxz(tau3(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:1.6,
};

// ---------------------------------------------------------------- 4 · the lesson: time your run from midfield → arrive just as the ball does
const tau4=(t:number)=>{const r=CUE(3,'Time your'),m=CUE(3,'from mid'),a=CUE(3,'arrive'),b=CUE(3,'the ball does');
 return key(t,mono([[0,-8],[r,-7.4],[m+.3,-4.6],[a,-1.4],[b,-.2],[b+.6,.1],[SECS(3),T_NET+.1]]),linear);};
function cam4v(t:number):Cam{
 const tau=tau4(t),k=kxz(tau);
 return plan(t,[
  [0,0,()=>({P:[-30,14,-37],T:[-30,0,-4],fov:50})],
  [CUE(3,'from mid')-.2,1.4,()=>({P:[-29,13,-36],T:mix3([-30,0,-5],k,.25),fov:48})],
  [CUE(3,'arrive')-.3,1.2,()=>({P:add3(S_BALL,[-17,10,-1]),T:add3(S_BALL,[3,.3,-4]),fov:40})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tR=CUE(3,'Time your'),tM=CUE(3,'from mid'),tA=CUE(3,'arrive'),tB=CUE(3,'the ball does');
  stadium(s,c,t,[0,1,3]);
  ground(s,c,{bulge:bulgeAt(tau)});
  // 1 · time your run: her run traced on the grass; 2 · from midfield: a yellow ring where she started
  runTrail(s,c,-7.4,Math.min(tau,-.35),sm(tR-.2,tR+.4,t),.55);
  groundRing(s,c,alexiaXZ(-7.4),2.2,sm(tM-.1,tM+.45,t,easeOutBack),Y,61);
  // 3 · arrive just…: the meeting spot ringed yellow; 4 · …as the ball does: Pina's pass drawn in red into the same ring
  groundRing(s,c,S_BALL,1.8,sm(tA-.1,tA+.4,t,easeOutBack),Y,67);
  passArrow(s,c,sm(tB-.2,tB+.5,t,easeOut));
  shotTrail(s,c,tau,sm(tB,tB+.3,t));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13,only:60});
  netSpark(s,c,tau);
 },
 still:9,
};

const film:RisoStory={
 id:'alexia-signature',format:'11v11',title:"Alexia's late run into the box",
 theme:'Time your run: start from midfield and arrive in the box just as the ball does, so no defender can pick you up in time',
 ageNote:'Barcelona 2–0 Lyon, 2024 UEFA Women’s Champions League final, San Mamés, Bilbao, 25 May 2024 (90+5′). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a late arrival — a yellow run streak and a red pass streak meet on the tap, then the ball crashes up and away. Reduced motion: the still streaks. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.4)),fade=age<=0?1:1-clamp((age-.55)/.3),r=rng(seed);
  const run:Pt[]=[],pass:Pt[]=[];for(let i=0;i<=10;i++){const k=i/10*u;run.push([x-200+200*k,y+30-30*k]);pass.push([x-120+120*k,y-150+150*k]);}
  s.fill(Y,ribbon(run,12,{seed,taper:.9,pressure:.3,wobble:1}),.95*fade);s.fill(R,ribbon(pass,9,{seed:seed+1,taper:.9,pressure:.3,wobble:1}),.9*fade);
  const up=age<=0?1:easeOut(clamp((age-.25)/.35));
  if(age>.2&&age<.5)sparkBurst(s,Y,x,y,60,{n:8,seed,g:1-clamp((age-.2)/.3),width:9});
  footballPanels(s,x+160*up,y-120*up,24,{rot:age*9+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
