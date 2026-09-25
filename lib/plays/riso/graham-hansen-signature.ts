/** Caroline Graham Hansen — signature: the dribble from the right wing. Recreated from ONE real, well-documented moment: her mazy run
 * from the right and pass for Salma Paralluelo in the 6th minute of the 2024 UEFA Women's Champions League final, Barcelona 2–0 Lyon
 * (0–0 at the time), San Mamés Stadium, Bilbao, Saturday 25 May 2024 — the chance Christiane Endler saved.
 * An iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (CardFilmPlayer) or StoryFilmPlayer. A 1:1
 * reconstruction from WRITTEN accounts (the footage itself was not reviewed), rendered as a riso print.
 *
 * WHY THIS MOMENT (iconicPlays.json: kind "signature", "the dribble from the right wing", params side right / beaten 2 / foot right;
 * lesson "Slow down to tempt the defender, then burst past with a quick touch"): her own goal in a Champions League final (2021 v Chelsea)
 * was a tap-in from Lieke Martens's cut-back, so it does not show the dribble. In the 2024 final UEFA's report opens with exactly her
 * signature — "Caroline Graham Hansen set up Salma Paralluelo early on following a mazy run" — and the Guardian's live blog called her
 * "the catalyst of every Barcelona attack … causing numerous problems for Lyon on the right. She is absolutely unstoppable today." It is
 * a created chance, not a goal, and the narration says so honestly ("Endler saves!").
 *
 * SOURCES (read Sept 2026; fetched with curl, cached in the film scratchpad src-cache/):
 *  - UEFA.com final report, "Barcelona 2-0 Lyon" (key moments "6' Endler denies Paralluelo"; "Caroline Graham Hansen set up Salma
 *    Paralluelo early on following a mazy run, only for the Spanish forward's effort to be well saved by Lyon goalkeeper Christiane
 *    Endler"; the line-ups)  https://www.uefa.com/womenschampionsleague/news/028d-1af9862331e9-90fcbcd9c8ba-1000/
 *  - The Guardian live blog (Emillia Hawkins), "Barcelona v Lyon: Women's Champions League final – as it happened", 25 May 2024 (5 min:
 *    Bronze's tackle on Cascarino in the Barcelona box; 6 min: "Barcelona head straight down to the other end as Hansen carries the ball
 *    into the box. She sends a pass to Paralluelo, who goes for goal, but it's an easy save for Endler."; 52 min: Bronze's "partnership with
 *    Hansen on the right"; half-time: "causing numerous problems for Lyon on the right"; photo caption "Olympique Lyonnais' Selma Bacha in
 *    action with FC Barcelona's Caroline Graham Hansen"; 75 min: "She bursts inside from the right … Bacha slides in")
 *    https://www.theguardian.com/football/live/2024/may/25/barcelona-v-lyon-womens-champions-league-final-live
 *  - Wikipedia, "2024 UEFA Women's Champions League final" (date, San Mamés, Bilbao, 50,827; "Salma Paralluelo's shot in the 6th minute
 *    was easily saved by Christiane Endler"; line-ups and shirt numbers; the kit templates worn that day: Barcelona home blaugrana stripes
 *    with blue shorts; Lyon all white with gold socks)  https://en.wikipedia.org/wiki/2024_UEFA_Women%27s_Champions_League_final
 *  - Wikipedia, "Caroline Graham Hansen" (style of play: "most known for her dribbling ability, one-on-one challenges"; the 2021 final goal
 *    "a tap-in from a Martens assist")  https://en.wikipedia.org/wiki/Caroline_Graham_Hansen
 * CONFIRMED by those accounts: 6th minute, 0–0; a Barcelona break straight after a Lyon attack; Graham Hansen (No. 10, Barcelona's right
 * forward) on a mazy run, carrying the ball into the box; her pass to Paralluelo (No. 7); Paralluelo goes for goal; an easy save by Endler
 * (No. 1). Her usual opponent on that wing all match: Lyon's left-back Selma Bacha (No. 4). Lyon's back four: Carpenter 12, Renard 3,
 * Gilles 21, Bacha 4; Barcelona's front three Graham Hansen 10, Paralluelo 7, Caldentey 9, with Bronze 15 behind her and Bonmatí 14 in
 * midfield. KITS: Barcelona home — blaugrana stripes (red with blue stripes here), blue shorts, claret-red socks; Lyon all white, gold socks.
 * INFERRED (illustrative): every exact position, run and timing in metres and seconds; that the full-back she ran at and beat was Bacha
 * (her direct opponent that day — the narration says only "the full-back"); the slow-down, the defender's lunge and the quick inside touch
 * past her (the sources say "mazy run" and "carries the ball into the box"; the move is her signature as the entry describes it); the
 * centre-back (Gilles) stepping across; that she was on the ball with her RIGHT foot and passed with it; Bonmatí's pass out to her;
 * Bronze's overlap; Paralluelo's first-time, right-footed, low shot and where she struck it from; Endler's gather (a low scoop) and her
 * kit colour (yellow here, as in the approved Alexia film of the same final); Graham Hansen's hair (dark blonde, tied back, printed as a
 * yellow screen); which end Barcelona attacked in the first half (the main-stand camera films Barcelona attacking to the RIGHT with the
 * right wing on the NEAR touchline); San Mamés's shape (steep rectangular stands under a white roof, the stadium model shared with the
 * approved Alexia film); the light, the crowd colours, the camera positions.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera in REAL TIME, panning with the ball: Bonmatí finds her on
 * the right → she carries it at the full-back → slows, beats her → into the box → the pass → Paralluelo's shot → Endler saves; ch2 =
 * slow-motion replay, LOW from the touchline beside the duel: she slows right down (a yellow ring, her run's speed lines fading), almost
 * stopping; the defender leans in (a red ring and a red lunge arrow); freeze-frame as the tackle comes; ch3 = the second replay angle from
 * BEHIND her: one quick touch (a yellow arrow for the ball) past the lunging leg, the burst of speed (her yellow trail), the defender left
 * behind (the red ring falls away), into the box (the box lines light up yellow); ch4 = the lesson, a high three-quarter view: slow down
 * (yellow ring) → tempt the defender (red) → burst past (trail) → with a quick touch (arrow). Composed on the FULL sheet (world units =
 * sheet units centred on the canvas; never sheet.safe), framing from the 1.45:1 card window down to square. Figures: every body goes
 * through ONE adapter, drawPlayer() → athlete.ts (continuous silhouettes, FK skeleton, `prev` secondary motion so the ponytails swing,
 * motionSmear on the burst, the lunge and the shot); women's builds (1.57–1.87 m, slimmer bulk) with ponytails; small wide-shot figures
 * and every figure inside a passage print at `low` detail. Handedness: the world is right-handed (x toward the goal Lyon defend, y up,
 * +z = the attackers' right, the right wing), athlete.ts's own convention, so her RIGHT foot is the right foot.
 * Inks: yellow, red, blue, navy. Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on
 * ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,runCycle,stand,dribble,keeperSet,keeperScoop,backpedal,lunge,posed,blendPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES until the Kokoro voice exists. LEAD: once scripts/plays/kokoro-narrate.py has written
 * public/plays/narration/graham-hansen-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/graham-hansen-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The dribble, live',text:'Bilbao, the 2024 Champions League final, six minutes in. Barcelona break against Lyon. Caroline Graham Hansen carries the ball down the right wing, runs at the full-back, dances into the box and sets up Salma Paralluelo. Endler saves!',tail:2.2,
  cues:['Bilbao','Barcelona break','Caroline','down the right','runs at','dances into','sets up','Endler saves']},
 {label:'Slow down',text:'Watch again. She slows right down, almost stopping. The defender leans in to win the ball.',tail:1,
  cues:['Watch again','slows right','almost stopping','The defender','win the ball']},
 {label:'Then burst',text:'Then one quick touch, and a burst of speed. She is gone, into the box!',tail:1.6,
  cues:['Then one','quick touch','burst of speed','She is gone','into the box']},
 {label:'The secret',text:'The secret? Slow down to tempt the defender, then burst past with a quick touch.',tail:2,
  cues:['The secret','Slow down','tempt the','burst past','quick touch']},
];
import timingJson from '../../../public/plays/narration/graham-hansen-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets (calibrated on the approved films' Kokoro timings, ≈ .32 s a word): .2 s + .02 s a letter, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.2+.02*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.2;if(/[.!?]$/.test(w))t+=.36;if(/\.\.\.$/.test(w))t+=.3;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('graham-hansen: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('graham-hansen: no cue '+w);return c.at;};
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
/** Pitch: the goal line Lyon defend is x = 0 (Barcelona attack +x), goal centre z = 0, +z = the attackers' right (the right wing, the
 * NEAR touchline for the main-stand camera, which sits at +z looking toward −z, so +x runs to screen right); halfway x = −52.5. */
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
 (a,b)=>[lerp(-111,6,a),1.3+27*b,41+21*b],   // 0 the main stand (+z), behind the broadcast camera
 (a,b)=>[8+18*b,1.3+25*b,lerp(-40,40,a)],     // 1 behind the goal Barcelona attack (+x)
 (a,b)=>[lerp(6,-111,a),1.3+27*b,-41-21*b],  // 2 the far side (−z), facing the broadcast camera
 (a,b)=>[-113-18*b,1.3+25*b,lerp(40,-40,a)],  // 3 the other end
];
/** the roof's inner edge, reaching out over the front rows */
const roofIn=(S:(a:number,b:number)=>V3,a:number):V3=>{const p=S(a,.72),q=S(a,1);return[p[0]+(p[0]-q[0])*.25,q[1]+5,p[2]+(p[2]-q[2])*.25];};
const STAND_COLS=[118,86,118,86],STAND_ROWS=15,WALKS=[.44],NSEG=8;
/** banners on the stand fronts: [stand, a, kind 0 = blaugrana (red | blue | red), 1 = senyera (yellow with red bars)] */
const FLAGS:[number,number,number][]=[[2,.22,0],[2,.4,1],[2,.58,0],[2,.76,1],[1,.25,0],[1,.45,1],[1,.62,0],[1,.8,0],[3,.2,0],[3,.78,1],[0,.35,0],[0,.62,1]];
/** is this seat inside Lyon's pocket of white (stand 3, the middle)? */
const lyonPocket=(si:number,a:number)=>si===3&&a>.4&&a<.6;
function stadium(s:Sheet,c:Cam,t:number,which:number[],o:{roar?:number}={}){
 const{roar=0}=o,v=view(s),tt=twos(t);
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
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
/** the penalty box, lit up in yellow by `lit` (0..1) */
function ground(s:Sheet,c:Cam,o:{lit?:number}={}){
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
 const lit=o.lit??0;
 if(lit>.02){const bx=new Path2D();for(const[a,b] of[[[0,0,20.16],[-16.5,0,20.16]],[[-16.5,0,20.16],[-16.5,0,-20.16]],[[-16.5,0,-20.16],[0,0,-20.16]]] as [V3,V3][])seg3(c,a,b,.42,bx,2.5);s.fill(Y,bx,.95*lit);}
 const pole=new Path2D(),flag=new Path2D();for(const z of[-34,34]){seg3(c,[0,0,z],[0,1.55,z],.05,pole);addPoly(flag,polyP(c,[[0,1.55,z],[0,1.2,z],[-.45,1.38,z]]));}
 s.fill(K,pole,.9);s.knockout(flag);s.fill(Y,flag,.95);
 goal3(s,c);
}
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep (no goal in this film: the net never bulges) */
function goal3(s:Sheet,c:Cam){
 const X=0,z0=-3.66,z1=3.66,H=2.44,back=X+2;
 const planes:V3[][]=[[[X,0,z0],[X,H,z0],[back,1.9,z0],[back,0,z0]],[[X,0,z1],[X,H,z1],[back,1.9,z1],[back,0,z1]],
  [[X,H,z0],[X,H,z1],[back,1.9,z1],[back,1.9,z0]],[[back,0,z0],[back,0,z1],[back,1.9,z1],[back,1.9,z0]]];
 const net=new Path2D();for(const P of planes)addPoly(net,polyP(c,P));
 s.knockout(net,.3);s.tone(K,net,.12);
 const mesh=new Path2D();
 for(let i=0;i<=14;i++){const z=lerp(z0,z1,i/14);seg3(c,[X,H,z],[back,1.9,z],.022,mesh,.7);seg3(c,[back,1.9,z],[back,0,z],.022,mesh,.7);}
 for(let j=0;j<=5;j++){const y=1.9*j/6;seg3(c,[back,y,z0],[back,y,z1],.022,mesh,.7);if(j>0){seg3(c,[X,y*H/1.9,z0],[back,y,z0],.022,mesh,.7);seg3(c,[X,y*H/1.9,z1],[back,y,z1],.022,mesh,.7);}}
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
const CGH_B=W_BUILD(1.75,.95);
/** Caroline Graham Hansen, No. 10: dark-blonde hair tied back (a yellow screen with a touch of red), navy boots */
const CGH_ST=barca({number:10,hair:[Y,.82],build:CGH_B,seed:10});
const PARA_B=W_BUILD(1.7,.94);
const PARA_ST=barca({number:7,skin:SKIN_D,hair:K,build:PARA_B,seed:7});
const ENDLER_B=W_BUILD(1.82,.98);
const ENDLER_ST:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:SKIN_L,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'ponytail',number:1,numberInk:K,build:ENDLER_B,seed:1};

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
const T_MIN=-15,T_MAX=8,DT=.02;
function distTable(p:Path){const out:number[]=[0];let q=pathAt(p,T_MIN);for(let t=T_MIN+DT;t<=T_MAX+1e-9;t+=DT){const r=pathAt(p,t);out.push(out[out.length-1]+Math.hypot(r[0]-q[0],r[1]-q[1]));q=r;}return out;}
const distAt=(tab:number[],tau:number)=>{const f=(clamp(tau,T_MIN,T_MAX)-T_MIN)/DT,i=Math.min(tab.length-2,Math.floor(f));return lerp(tab[i],tab[i+1],f-i);};
const speedAt=(p:Path,tau:number)=>{const a=pathAt(p,tau-.06),b=pathAt(p,tau+.06);return Math.hypot(b[0]-a[0],b[1]-a[1])/.12;};
/** metres per full run cycle (two strides) */
const CYCLE_M=3.9;

// ---------------------------------------------------------------- the play on one clock τ (seconds; τ = 0 is Graham Hansen's pass)
/** Bonmatí's pass out to the right (τ −12.2 → −10.6); the slow-down; the lunge; the quick touch; the pass; the shot; the save */
const T_BP=-12.2,T_RCV=-10.6,T_LUNGE=-4.45,T_TOUCH=-4.05,T_COLLECT=-3.15,T_SHOT=.55,T_SAVE=1;
/** Graham Hansen: carries it at pace down the right, slows right down in front of the full-back (almost stopping), one quick touch
 * inside past the lunge, bursts diagonally into the box, the pass, then she pulls up */
const CGH_PATH:Path=[[-15,-58,30.4],[-12.5,-54.6,29.6],[T_RCV,-51.4,28.6],[-9,-44.6,28.1],[-7.5,-37.2,27.8],[-6.2,-31,27.6],[-5.3,-27.9,27.4],[-4.6,-26.5,27.2],[-4.2,-26,27.05],
 [-3.8,-25,26.5],[-3.2,-22.4,24.6],[-2.5,-18.9,21.6],[-1.8,-15.7,18.4],[-1.1,-12.8,15.4],[-.5,-10.8,13],[0,-9.7,11.7],[.6,-8.9,10.9],[1.5,-8.5,10.5],[3,-8.3,10.2],[5,-8.2,10]];
const CGH_TAB=distTable(CGH_PATH);
const cghXZ=(tau:number):V3=>{const p=pathAt(CGH_PATH,tau);return[p[0],0,p[1]];};
/** the ball at her feet while she carries it: on her right foot's side, further ahead the faster she runs, bobbing with each touch */
function cghCarry(tau:number):V3{
 const[x,z]=pathAt(CGH_PATH,tau),b=pathAt(CGH_PATH,tau+.15),l=Math.hypot(b[0]-x,b[1]-z),sp=speedAt(CGH_PATH,tau);
 const hx=l>.02?(b[0]-x)/l:1,hz=l>.02?(b[1]-z)/l:0,ph=distAt(CGH_TAB,tau)/CYCLE_M,push=(.34+.5*clamp(sp/6.5))*(.72+.45*Math.abs(Math.sin(Math.PI*ph*2)));
 return[x+hx*push-hz*.1,.11,z+hz*push+hx*.1];
}
const TOUCH_A=cghCarry(T_TOUCH),TOUCH_B=cghCarry(T_COLLECT),PASS_A=cghCarry(0);

// ---------------------------------------------------------------- Endler, and Paralluelo's shot at her
const ENDLER_PATH:Path=[[-15,-7,-.6],[-8,-5.2,.8],[-3,-3.2,2.4],[-.6,-2.5,3],[0,-2.4,2.6],[.5,-2.3,1.4],[.85,-2.1,.7],[1.3,-2,.5],[4,-1.9,.4]];
/** Endler: set, shuffling across to cover the near post; a low scoop on one knee to gather the shot (τ .6 → 1.4) */
function endlerPose(tau:number,it:number,ph:number,sp:number):Pose{
 let kp=blendPose(keeperSet(it*1.3),backpedal(ph*1.6),sm(.3,1,sp)*.5);
 const u=clamp((tau-.62)/.8);if(tau>.62)kp=blendPose(kp,keeperScoop(u),sm(.62,.75,tau));
 return kp;
}
const endlerPlace=(tau:number):Place=>{const[x,z]=pathAt(ENDLER_PATH,tau);return{x,z,yaw:yawTo(x,z,S_BALL_XZ[0],S_BALL_XZ[1])};};
/** where Paralluelo meets the pass: first time, ≈ 11 m out, just left of centre (inferred) */
const S_BALL:V3=[-10.9,.11,-.9];
const S_BALL_XZ:[number,number]=[S_BALL[0],S_BALL[2]];
/** the gather point: between Endler's gloves at the scoop */
const handsAt=(tau:number):V3=>{const pl=endlerPlace(tau),sk=solve(endlerPose(tau,0,0,0),ENDLER_B,pl);return[(sk.lHa[0]+sk.rHa[0])/2,Math.max(.11,(sk.lHa[1]+sk.rHa[1])/2),(sk.lHa[2]+sk.rHa[2])/2];};
const SAVE_PT:V3=handsAt(T_SAVE);
/** her right-foot strike direction and her pelvis at contact so the RIGHT boot meets the ball (solved once through the skeleton) */
const KDIR:[number,number]=(()=>{const a=Math.atan2(SAVE_PT[2]-S_BALL[2],SAVE_PT[0]-S_BALL[0])+.3;return[Math.cos(a),Math.sin(a)];})();
const YAW_K=yawTo(0,0,KDIR[0],KDIR[1]);
const PK:[number,number]=(()=>{const sk=solve(strike(STRIKE_CONTACT,{foot:'r'}),PARA_B,{x:0,z:0,yaw:YAW_K});const tx=S_BALL[0]-KDIR[0]*.1,tz=S_BALL[2]-KDIR[1]*.1;return[tx-sk.rToe[0],tz-sk.rToe[2]];})();
const PARA_PATH:Path=[[-15,-62,3],[-10,-47,4.6],[-6,-32,3.4],[-3,-21.4,1.6],[-1.2,-16.4,.4],[0,PK[0]-KDIR[0]*3.4,PK[1]-KDIR[1]*3.4],[T_SHOT,PK[0],PK[1]],[1.1,PK[0]+KDIR[0]*1.7,PK[1]+KDIR[1]*1.7],[2.2,-8.2,-.6],[5,-8,-.4]];
const PARA_TAB=distTable(PARA_PATH);

// ---------------------------------------------------------------- Graham Hansen's body
const PULL_UP=posed({lHipF:22,rHipF:30,lKnee:30,rKnee:36,lean:18,pitch:4,neckP:-10,lShA:26,rShA:30,lShF:10,rShF:-6,lElb:50,rElb:60});
function cghPose(tau:number):Pose{
 const sp=speedAt(CGH_PATH,tau),ph=distAt(CGH_TAB,tau)/CYCLE_M;
 let p=blendPose(stand(),runCycle(ph,{speed:clamp((sp-1.5)/5.5)}),sm(.5,2,sp));
 // on the ball: quick touches with her right foot, head over it (less so at full burst)
 const onBall=sm(T_RCV,T_RCV+.3,tau)*(1-sm(-.45,-.25,tau));
 if(onBall>0)p=blendPose(p,dribble(ph,{foot:'r',speed:clamp(sp/7)}),onBall*(.9-.35*sm(4.5,6.5,sp)));
 // the slow-down: low and coiled, weight back, the ball under her, a shoulder dip toward the touchline (the bait)
 const coil=sm(-5.6,-4.9,tau)*(1-sm(-4.1,-3.8,tau));
 if(coil>0){p.lean+=10*DEG*coil;p.lKnee+=16*DEG*coil;p.rKnee+=16*DEG*coil;p.bend+=-12*DEG*coil*Math.sin(Math.PI*clamp((tau+5)/1.1));p.neckP+=8*DEG*coil;}
 // the quick touch: the right boot pushes the ball inside and forward past the lunge, then the burst (lean into it)
 const tp=sm(T_TOUCH-.18,T_TOUCH,tau)*(1-sm(T_TOUCH,T_TOUCH+.2,tau));
 if(tp>0){p.rHipF+=34*DEG*tp;p.rHipA+=-14*DEG*tp;p.rKnee+=-10*DEG*tp;p.rHipR+=28*DEG*tp;}
 const burst=sm(-4,-3.6,tau)*(1-sm(-1.2,-.6,tau));p.pitch+=6*DEG*burst;p.lean+=6*DEG*burst;
 // the pass: a right-footed pass across the box
 const us=STRIKE_CONTACT+tau/.7;
 if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot:'r',power:.45}),w);}
 if(tau>.6)p=blendPose(p,PULL_UP,sm(.6,1.4,tau)*clamp(1-sp/3));
 // scanning: head up toward the box as she bursts in, then she watches the shot
 p.neckY+=-20*DEG*sm(-2.2,-1.6,tau)*(1-sm(-.6,-.3,tau));
 return p;
}
function cghPlace(tau:number):Place{
 const[x,z]=pathAt(CGH_PATH,tau),sp=speedAt(CGH_PATH,tau),a=pathAt(CGH_PATH,tau+.12);
 let yaw=yawTo(x,z,a[0],a[1]);if(sp<1.2)yaw=lerpAng(yawTo(x,z,x+1,z),yaw,sp/1.2);
 // the pass: open up toward Paralluelo; then turn to watch the shot and the save
 const w=sm(-.35,-.1,tau)*(1-sm(.45,.8,tau));yaw=lerpAng(yaw,yawTo(x,z,S_BALL[0],S_BALL[2])+.5,w);
 if(tau>.6)yaw=lerpAng(yaw,yawTo(x,z,SAVE_PT[0],SAVE_PT[2]),sm(.6,1.2,tau));
 return{x,z,yaw};
}

// ---------------------------------------------------------------- everyone else
type Role='run'|'def'|'keeper'|'carrier'|'full'|'para';
type Actor={name:string;role:Role;st:AthleteStyle;path:Path;phase:number;barca:boolean;
 /** a carrier dribbles with this foot between these τ, then passes: [from, to (the pass contact), foot, power, target] */carry?:[number,number,'l'|'r',number,V3]};
const RCV_PT:V3=cghCarry(T_RCV);
const ACTORS:Actor[]=[
 {name:'Bonmati',role:'carrier',barca:true,st:barca({number:14,build:W_BUILD(1.62,.9),seed:14}),
  path:[[-15,-64,9.6],[T_BP,-58.8,11.2],[-10,-54,9.6],[-6,-43,6.6],[-2,-31,4.4],[2,-22,3.4],[5,-17,3]],phase:.5,carry:[-15,T_BP,'r',.8,RCV_PT]},
 {name:'Paralluelo',role:'para',barca:true,st:PARA_ST,path:PARA_PATH,phase:.2},
 {name:'Bronze',role:'run',barca:true,st:barca({number:15,build:W_BUILD(1.72,.98),seed:15}),path:[[-15,-68,24],[-10,-58,26.6],[-6,-45,29.6],[-3,-34,31],[0,-24,30.4],[3,-17,28],[5,-15,27]],phase:.35},
 {name:'Caldentey',role:'run',barca:true,st:barca({number:9,build:W_BUILD(1.6,.9),seed:9}),path:[[-15,-54,-22],[-9,-42,-20],[-4,-29,-15.6],[0,-19,-11],[3,-14,-8.4],[5,-12.4,-7.6]],phase:.75},
 {name:'Bacha',role:'full',barca:false,st:lyon({number:4,build:W_BUILD(1.63,.9),seed:4}),
  path:[[-15,-24,19],[-10,-24.6,22.4],[-7,-23.8,24.6],[-5.6,-23.2,25.8],[T_LUNGE,-23.3,26.3],[-3.9,-23.3,26.4],[-3.3,-23.1,26.1],[-2.6,-22.1,25],[-1.8,-19.8,22.6],[-.8,-16.6,19.4],[0,-14.4,17.2],[1.5,-11.4,14],[4,-10.2,12.6]],phase:.9},
 {name:'Gilles',role:'def',barca:false,st:lyon({number:21,build:W_BUILD(1.83,1),skin:SKIN_M,hair:K,seed:21}),path:[[-15,-21,7],[-8,-18,8.6],[-4,-14.6,9.4],[-2,-12,9.4],[-.8,-9.8,9.4],[0,-8.6,9.3],[1.2,-7.8,8.8],[4,-7.4,8.4]],phase:.6},
 {name:'Renard',role:'def',barca:false,st:lyon({number:3,build:W_BUILD(1.87,1),skin:SKIN_D,hair:K,seed:3}),path:[[-15,-22,-5],[-8,-18,-2.6],[-4,-13.4,-.6],[-1.5,-10,1.2],[0,-8.6,2],[.5,-8.4,1.2],[1.2,-8.5,.6],[4,-8.2,.4]],phase:.1},
 {name:'Carpenter',role:'def',barca:false,st:lyon({number:12,build:W_BUILD(1.57,.92),seed:12}),path:[[-15,-30,-23],[-8,-25,-19],[-3,-18,-14.6],[0,-14.6,-11.4],[3,-12,-8.6],[5,-11,-8]],phase:.2},
 {name:'Horan',role:'run',barca:false,st:lyon({number:26,build:W_BUILD(1.75,1),seed:26}),path:[[-15,-46,-2],[-9,-42,3],[-4,-32,6.4],[0,-23,7.6],[3,-17,7],[5,-15,6.6]],phase:.4},
 {name:'Egurrola',role:'run',barca:false,st:lyon({number:13,build:W_BUILD(1.78,.96),seed:13}),path:[[-15,-40,12],[-9,-38.6,17],[-5,-33,20.6],[-2,-25,19.6],[1,-18,16.4],[4,-14,14]],phase:.65},
 {name:'Endler',role:'keeper',barca:false,st:ENDLER_ST,path:ENDLER_PATH,phase:0},
];
const READY=posed({lHipF:24,rHipF:18,lKnee:34,rKnee:30,lHipA:10,rHipA:10,lean:16,pitch:3,lShA:20,rShA:20,lShF:10,rShF:14,lElb:44,rElb:40,neckP:-4});
const TABS=new Map<Path,number[]>();
function distTableCached(p:Path){let t=TABS.get(p);if(!t){t=p===PARA_PATH?PARA_TAB:distTable(p);TABS.set(p,t);}return t;}
/** where a carrier's ball sits: just ahead of her boots along her run */
function carryBall(a:Actor,tau:number):V3{const[x,z]=pathAt(a.path,tau),b=pathAt(a.path,tau+.12),l=Math.hypot(b[0]-x,b[1]-z)||1,ph=distAt(distTableCached(a.path),tau)/CYCLE_M,push=.55+.35*Math.abs(Math.sin(Math.PI*ph));return[x+(b[0]-x)/l*push,.11,z+(b[1]-z)/l*push];}
/** one actor's pose + place at τ (it = idle clock) */
function actorAt(a:Actor,tau:number,it:number):{pose:Pose;place:Place}{
 const[x,z]=pathAt(a.path,tau),sp=speedAt(a.path,tau),ahead=pathAt(a.path,tau+.1),ball=ballAt(tau);
 const toBall=yawTo(x,z,ball[0],ball[2]),heading=yawTo(x,z,ahead[0],ahead[1]);let yaw=lerpAng(toBall,heading,sm(1.2,3,sp));
 const ph=distAt(distTableCached(a.path),tau)/CYCLE_M+a.phase,br=Math.sin(it*2.1+a.phase*TAU);
 let p=blendPose(blendPose(READY,stand(),.35+.15*br),runCycle(ph,{speed:clamp((sp-1)/5.5)}),sm(.5,2,sp));
 if(a.role==='keeper')return{pose:endlerPose(tau,it,ph,sp),place:endlerPlace(tau)};
 if(a.role==='para'){
  // Paralluelo: a run through the middle, then a first-time RIGHT-footed shot at the pass
  const us=STRIKE_CONTACT+(tau-T_SHOT)/.75;
  if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.9,1,us));p=blendPose(p,strike(us,{foot:'r',power:.85}),w);}
  const w=sm(T_SHOT-.4,T_SHOT-.2,tau)*(1-sm(T_SHOT+.5,T_SHOT+.9,tau));yaw=lerpAng(yaw,YAW_K,w);
  if(tau>T_SHOT+.6){p=blendPose(p,PULL_UP,sm(T_SHOT+.6,T_SHOT+1.2,tau));yaw=lerpAng(yaw,yawTo(x,z,SAVE_PT[0],SAVE_PT[2]),sm(T_SHOT+.6,T_SHOT+1.2,tau));}
  return{pose:p,place:{x,z,yaw}};
 }
 if(a.carry){const[c0,c1,foot,power,tgt]=a.carry;
  if(tau>=c0&&tau<c1){const w=sm(c0,c0+.3,tau)*(1-sm(c1-.45,c1-.25,tau));p=blendPose(p,dribble(ph,{foot,speed:clamp(sp/7)}),w*.85);}
  const us=STRIKE_CONTACT+(tau-c1)/.8;
  if(us>.05&&us<1){const w=sm(.05,.2,us)*(1-sm(.85,1,us));p=blendPose(p,strike(us,{foot,power}),w);yaw=lerpAng(yaw,yawTo(x,z,tgt[0],tgt[2]),w);}}
 if(a.role==='full'){
  // Bacha: backing off, facing the ball, low; tempted in by the slow-down, she lunges toward the ball (to her left, the touchline side
  // Graham Hansen dipped toward); the touch goes the other way; she turns and chases, a step behind
  const back=blendPose(READY,backpedal(ph*1.4),sm(.4,1.2,sp)),face=1-sm(-2.9,-2.5,tau);
  p=blendPose(p,back,face);yaw=lerpAng(yaw,toBall,face);
  const u=(tau-T_LUNGE)/1.05;
  if(u>0&&u<1){const w=sm(0,.12,u)*(1-sm(.8,1,u));p=blendPose(p,lunge(u,{side:'l'}),w);yaw=lerpAng(yaw,yawTo(x,z,TOUCH_A[0],TOUCH_A[2]+.6),w);}
 }
 if(a.role==='def'){
  // backing off toward goal, facing the ball, shuffling
  const back=blendPose(READY,backpedal(ph*1.4),sm(.4,1.2,sp));p=blendPose(back,p,sm(3.5,5.5,sp));yaw=lerpAng(toBall,yaw,sm(3.5,5.5,sp));
 }
 return{pose:p,place:{x,z,yaw}};
}

// ---------------------------------------------------------------- the ball
const BONMATI=ACTORS[0];
const BP_BALL:V3=carryBall(BONMATI,T_BP);
const T_ARR=T_SHOT;
function ballAt(tau:number):V3{
 if(tau<T_BP)return carryBall(BONMATI,tau);
 if(tau<T_RCV){const u=(tau-T_BP)/(T_RCV-T_BP);return mix3(BP_BALL,RCV_PT,u*(1.3-.3*u));}
 if(tau<T_TOUCH)return cghCarry(tau);
 // the quick touch: pushed inside past the lunge into space, rolling out as she bursts onto it
 if(tau<T_COLLECT){const u=(tau-T_TOUCH)/(T_COLLECT-T_TOUCH),p=mix3(TOUCH_A,TOUCH_B,easeOut(u));return mix3(p,cghCarry(tau),sm(.75,1,u));}
 if(tau<0)return cghCarry(tau);
 // the pass across the box (≈ 13 m), met first time
 if(tau<T_ARR){const u=tau/T_ARR;return mix3(PASS_A,S_BALL,u*(1.2-.2*u));}
 // the low shot, straight at Endler; gathered
 if(tau<T_SAVE){const u=(tau-T_ARR)/(T_SAVE-T_ARR),p=mix3(S_BALL,SAVE_PT,u);p[1]=lerp(.11,SAVE_PT[1],u*u);return p;}
 return handsAt(tau);
}
const spinAt=(tau:number)=>tau<=0?TAU*1.6*(tau-T_MIN):tau<T_SAVE?TAU*1.6*-T_MIN+TAU*4*tau:TAU*1.6*-T_MIN+TAU*4*T_SAVE;

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: ponytails and hems trail), smear = halftone echo + speed lines on fast limbs (the burst, the lunge, the shot). */
function drawPlayer(s:Sheet,pose:Pose,camera:Cam,style:AthleteStyle,place:Place,prev?:{pose:Pose;place:Place},smear=false){
 if(smear&&prev)motionSmear(s,prev.pose,pose,camera,style,place,{prevPlace:prev.place,ink:[K,.3],threshold:9});
 return drawAthlete(s,pose,camera,style,place,prev?{prev:prev.pose,prevPlace:prev.place}:{});
}

// ---------------------------------------------------------------- the ball on screen
function drawBall(s:Sheet,c:Cam,tau:number,o:{min?:number;lines?:boolean;prev?:number}={}){
 const P=ballAt(tau),q=toCam(c,P);if(q[2]<NEAR)return null;const g=scr(c,q),r=Math.max(o.min??18,c.F*.11/q[2]);
 const sh:Pt[]=[];const rad=.16+P[1]*.05;for(let i=0;i<14;i++){const a=i/14*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*1.3,0,P[2]+Math.sin(a)*rad]);if(p)sh.push(p);}
 if(sh.length>8)s.tone(K,polyPath(sh,true),clamp(.5-P[1]*.12,.1,.5));
 if(o.lines&&o.prev!==undefined&&((tau>T_BP&&tau<T_RCV)||(tau>T_TOUCH&&tau<T_COLLECT)||(tau>0&&tau<T_SAVE))){const a=pr(c,ballAt(o.prev));if(a){const d=Math.hypot(g[0]-a[0],g[1]-a[1]);if(d>r*.8)speedLines(s,Y,g[0],g[1],Math.atan2(g[1]-a[1],g[0]-a[0]),{n:4,seed:7,len:Math.min(280,d*1.5),spread:r*.9,width:Math.max(2.5,r*.18),cov:.85});}}
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
 {const pl=cghPlace(tp),d=visible(pl);if(d>0)items.push({d,draw:()=>{const pose=cghPose(tp),prev={pose:cghPose(tpPrev),place:cghPlace(tpPrev)};
  drawPlayer(s,pose,c,detailFor(CGH_ST,d,true),pl,prev,!!e.smear&&((tp>-4.1&&tp<-1)||(tp>-.1&&tp<.4)));}});}
 for(const a of ACTORS){const cur=actorAt(a,tp,e.it),d=visible(cur.place);if(d<0)continue;items.push({d,draw:()=>{const prev=actorAt(a,tpPrev,e.it-1/12);
  const fast=a.role==='full'?tp>T_LUNGE&&tp<-3.4:a.role==='para'?tp>T_SHOT-.15&&tp<T_SHOT+.3:a.role==='keeper'?tp>.6&&tp<1.1:false;
  drawPlayer(s,cur.pose,c,detailFor(a.st,d,a.role==='full'||a.role==='para'||a.role==='keeper'),cur.place,prev,!!e.smear&&fast);}});}
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2]-.3,draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}
/** a broadcast pan: the ball's recent path averaged (the operator lags a touch), nudged toward the goal */
function panTarget(tau:number):V3{let x=0,y=0,z=0;for(let i=0;i<5;i++){const p=ballAt(tau-i*.1);x+=p[0];y+=Math.min(1.4,p[1]);z+=p[2];}return[x/5+3,(y/5)*.6+.6,z/5];}
/** smoothed ground point under Graham Hansen (cameras ride this) */
const kxz=(tau:number):V3=>{let x=0,z=0;for(let i=-2;i<=2;i++){const p=pathAt(CGH_PATH,tau+i*.12);x+=p[0];z+=p[1];}return[x/5,0,z/5];};

/** her run between two moments, traced on the grass (a riso replay trail under the players); dashed = the slow part */
function runTrail(s:Sheet,c:Cam,t0:number,t1:number,fade:number,wm=.34,dashed=false){
 if(t1<=t0+.05||fade<=.02)return;const pts:Pt[]=[];for(let i=0;i<=28;i++){const tau=lerp(t0,t1,i/28),p=pathAt(CGH_PATH,tau),q=pr(c,[p[0],.02,p[1]]);if(q)pts.push(q);}
 if(pts.length<3)return;const w=Math.max(9,kAt(c,cghXZ(t1))*wm),gaps:[number,number][]=[];if(dashed)for(let i=0;i<7;i++)gaps.push([(i+.5)/7,(i+.85)/7]);
 s.knockout(ribbon(pts,w*1.5,{taper:.8,pressure:.2,wobble:0,gaps}),.45*fade);s.fill(Y,ribbon(pts,w,{taper:.8,pressure:.2,wobble:0,gaps}),.9*fade);}
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
/** the quick touch: a yellow arrow for the ball, from her boot past the lunge into space (u = how much is drawn) */
function touchArrow(s:Sheet,c:Cam,u:number,cov=.95){if(u<=.02)return;const a:V3=[TOUCH_A[0],.03,TOUCH_A[2]],b:V3=[TOUCH_B[0],.03,TOUCH_B[2]],e=mix3(a,b,u);
 arrow3(s,c,[a,mix3(a,e,.5),e],Math.max(7,kAt(c,e)*.16),Y,cov);}
/** the defender's lunge: a red arrow from her toward where the ball was (the bait) */
function lungeArrow(s:Sheet,c:Cam,u:number){if(u<=.02)return;const[x,z]=pathAt(ACTORS[4].path,T_LUNGE),a:V3=[x,.03,z],b:V3=[TOUCH_A[0]+.3,.03,TOUCH_A[2]+.7],e=mix3(a,b,u);
 arrow3(s,c,[a,mix3(a,e,.5),e],Math.max(6,kAt(c,e)*.13),R,.95);}
/** "almost stopping": short brake ticks across her path behind her (the speed draining out) */
function brakeTicks(s:Sheet,c:Cam,u:number){if(u<=.02)return;const p=new Path2D();
 for(let i=0;i<4;i++){const tau=-5.9+i*.38,[x,z]=pathAt(CGH_PATH,tau),a=pathAt(CGH_PATH,tau+.1),l=Math.hypot(a[0]-x,a[1]-z)||1,nx=-(a[1]-z)/l,nz=(a[0]-x)/l,h=.55*(1-i*.18)*u;
  seg3(c,[x-nx*h,.02,z-nz*h],[x+nx*h,.02,z+nz*h],.16,p,2);}
 s.knockout(p,.8);s.fill(Y,p,.95*u);}
/** the save: a small burst at Endler's gloves */
function saveSpark(s:Sheet,c:Cam,tau:number){const k=sm(T_SAVE-.04,T_SAVE+.02,tau)*(1-sm(T_SAVE+.12,T_SAVE+.4,tau));if(k<=0)return;const q=pr(c,SAVE_PT);if(q)sparkBurst(s,Y,q[0],q[1],Math.max(30,kAt(c,SAVE_PT)*.45)*k,{n:8,seed:44,width:Math.max(4,kAt(c,SAVE_PT)*.05)});}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, real time, panning with the ball
/** near real time (the key mapping stays within a few per cent of 1 : 1 for the estimate; the voice retimes it) */
const tau1=(t:number)=>{const e=CUE(0,'Endler');return key(t,mono([[0,-13.6],[CUE(0,'runs at'),-5.2],[CUE(0,'dances'),-3.3],[CUE(0,'sets up'),-.7],[e,T_SAVE-.1],[SECS(0),T_SAVE-.1+(SECS(0)-e)]]),linear);};
const P1:V3=[-30,19,60];
function cam1(t:number):Cam{
 const tau=tau1(t);
 return plan(t,[
  [0,0,()=>({P:P1,T:[-52,4,14],fov:28})],
  [CUE(0,'Barcelona break')-.3,1.6,()=>({P:P1,T:panTarget(tau),fov:13.5})],
  [CUE(0,'Caroline')-.3,1.2,()=>({P:P1,T:add3(kxz(tau),[2,1,-1.5]),fov:11})],
  [CUE(0,'runs at')-.3,1,()=>({P:P1,T:add3(kxz(tau),[1.5,.9,-1]),fov:10})],
  [CUE(0,'dances')-.2,1,()=>({P:P1,T:mix3(panTarget(tau),add3(kxz(tau),[0,.9,0]),.6),fov:11})],
  [CUE(0,'sets up')-.4,1,()=>({P:P1,T:mix3(panTarget(tau),[-6,1,3],.4),fov:12})],
  [CUE(0,'Endler')+.4,1.4,()=>({P:P1,T:[-4,1,2.4],fov:9})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12);
  stadium(s,c,t,[2,1,3],{roar:sm(-4.1,-3.6,tau)*(1-sm(-2.4,-1.6,tau))*.6});
  ground(s,c);
  play(s,c,tau,tp,tpp,{it:tt,minBall:12,lines:true,prevT:tau1(t-.06),hero:'mid',smear:true});
  saveSpark(s,c,tau);
 },
 aperture(t){const c=cam1(t),q=pr(c,add3(kxz(tau1(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],80,12);},
 still:9.2,
};

// ---------------------------------------------------------------- 2 · slow-motion replay, low from the touchline: the slow-down and the bait
const tau2=(t:number)=>key(t,mono([[0,-7.3],[CUE(1,'slows right'),-6.1],[CUE(1,'almost'),-4.95],[CUE(1,'The defender'),-4.5],[CUE(1,'win the'),-4.14],[SECS(1),-4.07]]),linear);
/** the duel's midpoint (cameras ride this) */
const duel=(tau:number):V3=>{const a=kxz(tau),[x,z]=pathAt(ACTORS[4].path,tau);return[(a[0]+x)/2,0,(a[2]+z)/2];};
function cam2(t:number):Cam{
 const tau=tau2(t),k=kxz(tau),d=duel(tau);
 return plan(t,[
  [0,0,()=>({P:add3(k,[-5,1.9,9.5]),T:add3(k,[4,.9,-1]),fov:40})],
  [CUE(1,'slows right')-.2,1.6,()=>({P:add3(d,[-1.5,1.5,8.6]),T:add3(d,[.2,.9,-.8]),fov:36})],
  [CUE(1,'The defender')-.3,1.2,()=>({P:add3(d,[1.5,1.2,6.8]),T:add3(d,[0,.85,-.2]),fov:36})],
  [CUE(1,'win the')-.1,.9,()=>({P:add3(d,[1.2,1,5.6]),T:add3(d,[-.2,.7,0]),fov:34})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12),tS=CUE(1,'slows right'),tA=CUE(1,'almost'),tD=CUE(1,'The defender'),tW=CUE(1,'win the');
  stadium(s,c,t,[2,3]);
  ground(s,c);
  // slows right down: her run (dashed as the speed drains), a yellow ring where she brakes; almost stopping: brake ticks
  runTrail(s,c,-7.3,Math.min(tau,-4.3),sm(tS-.2,tS+.4,t),.3,true);
  groundRing(s,c,cghXZ(-4.3),.9,sm(tS-.1,tS+.5,t,easeOutBack),Y,31);
  brakeTicks(s,c,sm(tA-.1,tA+.5,t));
  // the defender leans in: a red ring under her and her lunge drawn in red toward the ball; to win the ball: the ball ringed
  {const[x,z]=pathAt(ACTORS[4].path,tau);groundRing(s,c,[x,0,z],.8,sm(tD-.15,tD+.4,t,easeOutBack),R,37);}
  lungeArrow(s,c,sm(tD,tD+.6,t,easeOut));
  groundRing(s,c,ballAt(tau),.45,sm(tW-.1,tW+.35,t,easeOutBack),Y,41);
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:11,lines:true,prevT:tau2(t-.06),only:60});
 },
 aperture(t){const c=cam2(t),q=pr(c,add3(kxz(tau2(t)),[0,1.1,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · second replay from behind her: the quick touch, the burst, gone, into the box
const tau3=(t:number)=>key(t,mono([[0,-4.2],[CUE(2,'Then one'),-4.16],[CUE(2,'quick touch')+.1,-4.02],[CUE(2,'burst'),-3.55],[CUE(2,'She is'),-2.75],[CUE(2,'into the'),-1.85],[SECS(2),-.7]]),linear);
function cam3v(t:number):Cam{
 const tau=tau3(t),k=kxz(tau);
 return plan(t,[
  [0,0,()=>({P:add3(k,[-4.2,2.4,6.2]),T:add3(k,[4.6,.7,-3.4]),fov:42})],
  [CUE(2,'burst')-.2,1.1,()=>({P:add3(k,[-7.4,2.8,4.6]),T:add3(k,[6.5,.6,-6]),fov:46})],
  [CUE(2,'She is')-.2,1.2,()=>({P:add3(k,[-9,3.6,5.2]),T:add3(k,[6,.3,-7]),fov:50})],
  [CUE(2,'into the')-.3,1.2,()=>({P:add3(k,[-8.6,3.6,4.6]),T:add3(k,[8,.3,-8.2]),fov:50})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tQ=CUE(2,'quick touch'),tB=CUE(2,'burst'),tG=CUE(2,'She is'),tI=CUE(2,'into the');
  stadium(s,c,t,[1,2],{roar:sm(tB,tB+.5,t)*.7});
  ground(s,c,{lit:sm(tI-.1,tI+.5,t)});
  // one quick touch: the ball's path past the lunge in yellow; the burst: her trail; gone: the defender's red ring left behind, fading
  touchArrow(s,c,sm(tQ-.1,tQ+.45,t,easeOut),.95*(1-sm(tI,tI+.8,t)*.6));
  runTrail(s,c,-4.05,Math.min(tau,-.8),sm(tB-.2,tB+.4,t),.32);
  {const[x,z]=pathAt(ACTORS[4].path,-3.6),u=sm(tG-.15,tG+.4,t,easeOutBack)*(1-sm(tI+.4,tI+1.1,t));groundRing(s,c,[x,0,z],.85,u,R,57);}
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:12,lines:true,prevT:tau3(t-.06),only:55});
 },
 aperture(t){const c=cam3v(t),q=pr(c,add3(kxz(tau3(t)),[0,1.2,0]))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:1.2,
};

// ---------------------------------------------------------------- 4 · the lesson: slow down → tempt the defender → burst past with a quick touch
const tau4=(t:number)=>{const a=CUE(3,'Slow down'),b=CUE(3,'tempt'),c=CUE(3,'burst past'),d=CUE(3,'quick touch');
 return key(t,mono([[0,-6.7],[a,-5.9],[b+.2,-4.6],[c+.2,-4.0],[d+.3,-3.2],[SECS(3),-1.5]]),linear);};
function cam4v(t:number):Cam{
 const tau=tau4(t),k=kxz(tau);
 return plan(t,[
  [0,0,()=>({P:[-36,7.5,37],T:[-25.5,.5,25.5],fov:27})],
  [CUE(3,'tempt')-.2,1.4,()=>({P:[-33.5,6.5,35.5],T:mix3([-24,.5,25.5],k,.3),fov:25})],
  [CUE(3,'burst past')-.2,1.4,()=>({P:[-32,7.5,34.5],T:mix3([-21.5,.4,23],k,.45),fov:34})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tS=CUE(3,'Slow down'),tT=CUE(3,'tempt'),tB=CUE(3,'burst past'),tQ=CUE(3,'quick touch');
  stadium(s,c,t,[2,3]);
  ground(s,c);
  // 1 · slow down: the dashed trail and a yellow ring where she brakes; 2 · tempt the defender: the red ring and her lunge
  runTrail(s,c,-6.7,Math.min(tau,-4.3),sm(tS-.2,tS+.4,t),.5,true);
  groundRing(s,c,cghXZ(-4.3),1.6,sm(tS-.1,tS+.45,t,easeOutBack),Y,61);
  {const[x,z]=pathAt(ACTORS[4].path,Math.min(tau,T_LUNGE));groundRing(s,c,[x,0,z],1.4,sm(tT-.1,tT+.4,t,easeOutBack),R,63);}
  lungeArrow(s,c,sm(tT+.1,tT+.7,t,easeOut));
  // 3 · burst past: the solid trail; 4 · with a quick touch: the ball's yellow arrow
  runTrail(s,c,-4.05,Math.min(tau,-1.6),sm(tB-.2,tB+.4,t),.5);
  touchArrow(s,c,sm(tQ-.1,tQ+.45,t,easeOut));
  play(s,c,tau,tp,tpp,{it:tt,smear:true,minBall:13,only:70});
 },
 still:9,
};

const film:RisoStory={
 id:'graham-hansen-signature',format:'11v11',title:"Graham Hansen's dribble from the right",
 theme:'Beat the full-back one-on-one: slow down to tempt the defender into a tackle, then burst past with one quick touch',
 ageNote:'Barcelona v Lyon, 2024 UEFA Women’s Champions League final, San Mamés, Bilbao, 25 May 2024 (6′, 0–0; Barcelona won 2–0). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: slow, then burst — a dashed yellow run that brakes at the tap, a red jab from the side, then a solid yellow streak bursts away with the ball. Reduced motion: the still streaks. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.3)),fade=age<=0?1:1-clamp((age-.6)/.3),r=rng(seed);
  const slow:Pt[]=[],fast:Pt[]=[];for(let i=0;i<=10;i++){const k=i/10;slow.push([x-170+170*k*u,y+10-10*k*u]);}
  const b=age<=0?1:easeOut(clamp((age-.2)/.3));for(let i=0;i<=10;i++){const k=i/10*b;fast.push([x+190*k,y-70*k]);}
  const gaps:[number,number][]=[];for(let i=0;i<5;i++)gaps.push([(i+.5)/5,(i+.85)/5]);
  s.fill(Y,ribbon(slow,10,{seed,taper:.6,pressure:.3,wobble:1,gaps}),.9*fade);
  if(age<=0||age>.08)s.fill(R,ribbon([[x+40,y+90],[x+18,y+40]],9,{seed:seed+1,taper:.9,pressure:.3,wobble:1}),.9*fade);
  if(b>.02)s.fill(Y,ribbon(fast,13,{seed:seed+2,taper:.9,pressure:.3,wobble:1}),.95*fade);
  footballPanels(s,x+190*b+10,y-70*b,22,{rot:age*9+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
