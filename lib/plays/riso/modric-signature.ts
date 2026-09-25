/** Modrić's signature — the outside-of-the-foot pass (the "trivela"). Real Madrid 2–3 Chelsea (aet, Real through 5–4 on aggregate),
 * UEFA Champions League quarter-final second leg, Estadio Santiago Bernabéu, Madrid, 12 April 2022 (21:00 local, a night match). An
 * iconic-play riso film (RisoStory, chapters mode) played by the card's picture window (components/CardFilmPlayer.tsx) or StoryFilmPlayer.
 * A 1:1 reconstruction of the 80th-minute assist for Rodrygo from WRITTEN accounts (the footage itself was not reviewed), printed as a riso sheet.
 *
 * WHY THIS MOMENT (lib/town/iconicPlays.json: kind "signature", "the outside-of-the-foot pass", lesson "The outside of your foot can bend a
 * pass around a defender"): it is the most famous and most precisely described outside-of-the-boot pass of his career — UEFA's report
 * calls it "a stunning outside-of-the-boot cross", the Guardian "a sumptuous outside-of-the-boot pass"; Jamie Carragher on the night: "He's
 * famous for the outside of the foot pass. And that is why"; Ally McCoist called it the "pass of the decade" (Wikipedia). His Argentina goal
 * in 2018 was a curled inside-foot shot, so it would not show the signature.
 *
 * SOURCES (fetched Sept 2026, cached under the session scratchpad films/src-cache/):
 *  - UEFA.com, "Real Madrid 2-3 Chelsea, aet (agg 5-4): Benzema takes hosts through after holders mount stunning comeback", 12 April 2022
 *    https://www.uefa.com/uefachampionsleague/news/0274-14e4d0f0f820-0ebe4b5ae427-1000--real-madrid-2-3-chelsea-aet-agg-5-4-benzema-takes-hosts-through/
 *    ("80': Rodrygo volleys in wonderful Modrić cross"; "Luka Modrić was the architect, producing a stunning outside-of-the-boot cross for
 *    substitute Rodrygo to volley in"; both line-ups and substitutions; Modrić's quote "We were dead until the goal that we scored")
 *  - The Guardian, Scott Murray, minute-by-minute, 12 April 2022
 *    https://www.theguardian.com/football/live/2022/apr/12/real-madrid-v-chelsea-champions-league-quarter-final-second-leg-live
 *    ("Kante over-elaborates down the Chelsea right. Marcelo intercepts. The ball is worked down the Real left for Modric, who loops a
 *    sensational outside-of-the-boot pass towards Rodrygo, who opens his body 12 yards from goal and sends a glorious sidefoot into the
 *    bottom right! Mendy no chance!")
 *  - The Guardian, David Hytner, match report, 12 April 2022
 *    https://www.theguardian.com/football/2022/apr/12/real-madrid-chelsea-champions-league-quarter-final-second-leg-match-report
 *    ("They dug out the equaliser when Luka Modric unfurled a sumptuous outside-of-the-boot pass for the substitute Rodrygo to volley home")
 *  - talkSPORT, Sam May, 12 April 2022  https://talksport.com/football/1085060/real-madrid-midfielder-modric-provides-outrageous-assist/
 *    ("Modric curled the ball with the outside of his right boot picking out Brazilian winger Rodrygo"; 36 years old, his 100th Champions
 *    League appearance)
 *  - CBS Sports, "Thierry Henry: Luka Modric Champions League assist ... 'absolutely perfect'" (Carragher: "The ball was stuck under his foot.
 *    He's famous for the outside of the foot pass")
 *  - Wikipedia, "Luka Modrić" (raw): the trivela as his trademark; the Rodrygo assist; man of the match; and "2021–22 UEFA Champions League
 *    knockout phase" (raw): date, 21:00 kick-off, Santiago Bernabéu, 2–3 aet, Rodrygo 80', Benzema 96', referee Szymon Marciniak.
 * CONFIRMED by those accounts: the match, date, ground, night kick-off and the 80th minute; Madrid 0–3 down on the night (3–4 on aggregate),
 * so they needed a goal; Kanté lost the ball down Chelsea's right, Marcelo (on at 78') intercepted, the ball went down Real's LEFT to Modrić;
 * he LOOPED the pass with the OUTSIDE of his RIGHT boot, CURLING it to Rodrygo (on at 78'); Rodrygo opened his body about 12 yards out and
 * side-footed a VOLLEY into the BOTTOM RIGHT; Mendy had no chance; the numbers on the pitch at 80' (Madrid: Courtois; Carvajal, Nacho,
 * Alaba, Marcelo; Modrić, Camavinga, Valverde; Rodrygo, Benzema, Vinícius Júnior — Chelsea: Mendy; James, Thiago Silva, Rüdiger, Alonso;
 * Kanté, Loftus-Cheek, Kovačić; Mount, Havertz, Werner).
 * INFERRED (illustrative): every exact position, path and timing; "worked down the left" drawn as ONE pass Marcelo → Modrić (Marcelo passing
 * with his left foot); where Modrić stood (outside the box, in the inside-left channel, ~27 m out) and his one settling touch; the pass
 * curling from left to right round and over Thiago Silva (drawn standing on the straight line) into the gap between Silva and Rüdiger;
 * Rodrygo's run from the right, his RIGHT-foot side-foot volley at knee height; Mendy's dive to his left; the direction of play on screen
 * (Madrid attacking left to right from the main-stand camera, so Real's left is the FAR touchline); the KITS worn that night (not stated in
 * any fetched source; drawn as the usual home v away colours: Real all white with navy trim, Chelsea royal blue shirts and shorts with white
 * socks; Mendy's goalkeeper kit drawn yellow; the referee in dark kit); hair and builds; who celebrated where. The narration names none of
 * the kit colours, the pass's exact spot or the celebration.
 * The stadium (not from a fetched source): the Bernabéu's steep, tall, near-rectangular stands close to the pitch with no running track,
 * three tiers under a roof edge with floodlight rails, a mostly white home crowd with phone lights.
 *
 * FRAMING (the TV broadcast, never top-down): ch1 = the high main-stand camera, near real time (Marcelo's interception → Modrić on the left
 * → the trivela → Rodrygo's volley → the net); ch2 = the slow-motion replay from a LOW camera behind Modrić's right shoulder (toes turned in,
 * the outside of the boot, the spin, the ball bending round the defence to Rodrygo); ch3 = a second replay angle from BEHIND THE GOAL
 * (Rodrygo opens his body, side-foots it into the bottom corner, the keeper beaten, the celebration); ch4 = the lesson: a raised camera behind
 * the passer (a defender on the straight line; the outside of the foot; the pass bends round him). Composed on the FULL sheet (world units =
 * sheet units centred on the canvas; never sheet.safe), kept in the central ~1000 units so it frames from the 1.45:1 card window down to square.
 * Figures: every body goes through ONE adapter, drawPlayer() → athlete.ts; small figures and every figure inside a passage print at `low`.
 * Handedness: the world is right-handed (x toward Chelsea's goal, y up, +z = the main-stand side = Madrid's RIGHT as they attack), athlete.ts's
 * own convention, so Modrić's RIGHT foot strikes without a mirrored projector; the outside of the right boot sends the ball away to the right
 * of where he faces and the spin bends it further right (+z). Inks: yellow, red, blue, navy.
 * Everything is keyed to cue times (withTiming swaps in the recorded word onsets), poses on twos, cameras on ones; all randomness seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,polyPath,ribbon,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,footballPanels,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,strike,volley,runCycle,dribble,stand,keeperSet,keeperDive,lunge,celebrate,posed,blendPose,clampPose,STRIKE_CONTACT,
 type Pose,type Camera,type AthleteStyle,type Place,type InkFill,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** The narration (script.json mirrors it). Cue `words` are the match keys for the voice's word onsets; their `at` and each chapter's
 * `seconds` are ESTIMATES (≈2.7 words/s + punctuation pauses) until the Kokoro voice exists. Once the lead has generated
 * public/plays/narration/modric-signature/timing.json, add
 *   import timingJson from '../../../public/plays/narration/modric-signature/timing.json';
 * and set VOICE to `timingJson as NarrationTiming` (one line; every scene re-times itself from the cues). */
const SCRIPT:{label:string;text:string;tail:number;cues:string[]}[]=[
 {label:'The pass, live',text:'Madrid, 2022. Real Madrid need a goal against Chelsea. Marcelo wins the ball for Luka Modrić, on the left... and he passes with the outside of his right boot! Rodrygo volleys... Goal!',tail:2.6,
  cues:['Madrid','Chelsea','Marcelo','Luka Modrić','outside of his right boot','Rodrygo','Goal']},
 {label:'Watch it again',text:'Watch again, slowly. Toes turned in, the outside of the boot spins the ball. See it bend around the defenders to Rodrygo.',tail:1.6,
  cues:['Watch again','Toes turned in','outside of the boot','spins the ball','See it bend','around the defenders','to Rodrygo']},
 {label:'Into the corner',text:'Rodrygo opens his body and side-foots it into the bottom corner. The keeper has no chance!',tail:2.2,
  cues:['Rodrygo','opens his body','side-foots','bottom corner','no chance']},
 {label:'Your turn',text:'Your turn: a defender in the way? The outside of your foot can bend a pass around a defender.',tail:2.4,
  cues:['Your turn','defender in the way','outside of your foot','bend a pass','around a defender']},
];
import timingJson from '../../../public/plays/narration/modric-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
/** provisional word onsets: .26 s + .025 s a letter per word, pauses after , . ! ? ... */
function estimate(text:string,cues:string[],tail:number){
 const words=[...text.matchAll(/\S+/g)],on:number[]=[];let t=.2;
 for(const m of words){on.push(t);const w=m[0];t+=.26+.025*w.replace(/[^a-z0-9]/gi,'').length;if(/[,;:]$/.test(w))t+=.22;if(/[.!?]$/.test(w))t+=.42;if(/\.\.\.$/.test(w))t+=.35;}
 let from=0;
 const cs=cues.map(c=>{const k=text.indexOf(c,from);if(k<0)throw new Error('modric: cue "'+c+'" not in the narration');from=k+c.length;const wi=words.findIndex(m=>(m.index??0)+m[0].length>k);return{at:+on[wi].toFixed(2),words:c};});
 return{seconds:+(t+tail).toFixed(2),cues:cs};
}
const CHAPTERS:Chapter[]=withTiming(SCRIPT.map(c=>{const e=estimate(c.text,c.cues,c.tail);return{label:c.label,narration:c.text,seconds:e.seconds,cues:e.cues};}),VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUE=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('modric: no cue '+w);return c.at;};
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
/** Pitch: Chelsea's goal line is x = 0 (Madrid attack +x), goal centre z = 0, +z = the main-stand side, the halfway line x = −52.5. */
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

// ---------------------------------------------------------------- the Bernabéu at night: steep, tall, near-rectangular stands tight to the pitch
const CXS=-52.5,NS=60,PE=.28;
/** a point on the stand ring: angle th round the pitch centre (0 = behind Chelsea's goal, +90° = the main stand), d metres out from the
 * ring's inner edge (a squarish superellipse ~6 m outside the lines), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CXS+(58.5+d)*Math.sign(c)*Math.pow(Math.abs(c),PE),y,(40.5+d)*Math.sign(s)*Math.pow(Math.abs(s),PE)];}
const SD0=1,SD1=34;
/** steep rake (~50°): three tiers climbing to ~42 m */
const RAKE=(b:number):[number,number]=>[SD0+(SD1-SD0)*b,1.4+40*b];
type Bowl={seg:V3[][];roof:V3[][];seats:{P:V3;h:number;away:boolean}[];lamps:[V3,V3][];tiers:[V3,V3][]};
const BOWL:Bowl=(()=>{const o:Bowl={seg:[],roof:[],seats:[],lamps:[],tiers:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,[d0,y0]=RAKE(0),[d1,y1]=RAKE(1);
  o.seg.push([rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)]);
  // the roof: a cantilevered band over the top tier, its front edge lit
  o.roof.push([rim(a,SD1-9,y1+2.6),rim(b,SD1-9,y1+2.6),rim(b,SD1+2,y1+4),rim(a,SD1+2,y1+4)]);
  if(i%2===0)o.lamps.push([rim(a,SD1-8.6,y1+2.3),rim(b,SD1-8.6,y1+2.3)]);
  // the tier fronts (between the three tiers)
  for(const f of[.34,.67]){const[d,y]=RAKE(f);o.tiers.push([rim(a,d,y),rim(b,d,y)]);}
  for(let r=0;r<9;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,11);if(h<.18)continue;const[d,y]=RAKE((r+.5)/9);
   // an away section high in one corner behind Chelsea's goal (inferred)
   const away=r>=6&&i>=NS-6;
   o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h,away});}}
 return o;})();
function stadium(s:Sheet,c:Cam,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o,v=view(s),tt=twos(t);
 // an April night in Madrid: a deep printed navy sky
 s.field(K,.74,.5);s.field(B,.24,.5);
 const bowl=new Path2D(),roof=new Path2D();
 for(const q of BOWL.seg){const r=quadP(c,q);if(r)addPoly(bowl,r);}
 for(const q of BOWL.roof){const r=quadP(c,q,10);if(r)addPoly(roof,r);}
 s.knockout(bowl);s.tone(B,bowl,.4);s.tone(K,bowl,.36);
 // the crowd: one mark per seat group, sized by distance; mostly white Madrid shirts, navy and blue, phone lights (yellow); the away
 // corner in Chelsea blue; the roar lifts them
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
 for(const q of BOWL.seats){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(Math.abs(p[0])>v.hx||Math.abs(p[1])>v.hy)continue;const z=clamp(c.F*.55/d[2],2.2,15),lift=roar>0&&!q.away?roar*z*1.3*Math.max(0,Math.sin(tt*10+q.h*TAU)):0;
  const ink=q.away?(q.h<.8?1:2):q.h<.55?0:q.h<.75?1:q.h<.94?2:3;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);}
 s.knockout(inks[0],.75);s.fill(B,inks[1],.6);s.fill(K,inks[2],.85);s.fill(Y,inks[3],.95);
 // tier fronts: pale bands that give the steep stands their three tiers
 const tf=new Path2D();for(const[a,b] of BOWL.tiers){if(toCam(c,a)[2]<14||toCam(c,b)[2]<14)continue;seg3(c,a,b,.9,tf,1);}s.knockout(tf,.6);s.tone(B,tf,.2);
 s.knockout(roof);s.fill(K,roof,.92);
 // floodlight rails along the roof's front edge: lit lamp strips with a glow
 const lamp=new Path2D(),glow=new Path2D();for(const[a,b] of BOWL.lamps){if(toCam(c,a)[2]<NEAR+4)continue;seg3(c,a,b,.9,lamp);seg3(c,a,b,3.4,glow);}
 s.tone(Y,glow,.35);s.knockout(lamp);s.fill(Y,lamp,.9);
 if(flash>0){const p=new Path2D(),n=Math.round(22*flash),T12=Math.floor(tt*12);for(let i=0;i<n;i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(Math.abs(g[0])>v.hx||Math.abs(g[1])>v.hy)continue;
  const z=9+13*flash;p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
// ---------------------------------------------------------------- grass, lines, boards, corner flags, the goal
const ringPts=(d:number,n=72):V3[]=>{const o:V3[]=[];for(let i=0;i<n;i++)o.push(rim(i/n*TAU,d,0));return o;};
const GRASS=ringPts(0);
function ground(s:Sheet,c:Cam,o:{bulge?:number}={}){
 const g=polyP(c,GRASS);if(g.length<3)return;const gp=polyPath(g,true);
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
/** the goal at x = 0: posts z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out low in the bottom right-hand corner (z +3) */
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
/** Real Madrid: all white, navy trim and numbers (inferred: the usual home kit; not stated by a fetched source) */
const real=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',boots:K,skin:SKIN_L,hair:K,line:K,trim:K,numberInk:K,hairStyle:'short',...o});
/** Chelsea: royal blue shirts and shorts, white socks, white numbers (inferred: the usual away-at-Madrid colours; not stated by a fetched source) */
const chelsea=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:'paper',boots:K,skin:SKIN_M,hair:K,line:K,trim:'paper',numberInk:'paper',hairStyle:'short',...o});
/** Modrić: 1.72 m, slight; long light-brown hair (drawn in a yellow screen) */
const MODRIC_B={height:1.72,bulk:.9};
const MODRIC_ST=real({number:10,build:MODRIC_B,hairStyle:'long',hair:[Y,.72],seed:10});
const RODRYGO_B={height:1.74,bulk:.94};
const RODRYGO_ST=real({number:21,build:RODRYGO_B,skin:SKIN_M,seed:21});
const MENDY_ST:AthleteStyle={shirt:[Y,.95],shorts:[Y,.95],socks:[Y,.95],boots:K,skin:SKIN_D,hair:K,line:K,trim:K,gloves:'paper',sleeves:'long',hairStyle:'short',number:16,numberInk:K,build:{height:1.94},seed:16};
const REF_ST:AthleteStyle={shirt:[K,.88],shorts:[K,.88],socks:[K,.88],boots:K,skin:SKIN_L,hair:K,line:K,hairStyle:'bald',build:{height:1.86},seed:30};

// ---------------------------------------------------------------- the pass geometry (τ = seconds after Modrić's contact)
/** where he strikes it: outside the box in the inside-left channel, ~27 m out (inferred); where Rodrygo meets it: 12 yards out (confirmed) */
const CX0=-26.6,CZ0=-17.5,C_BALL:V3=[CX0,.11,CZ0];
const V_XZ:[number,number]=[-10.9,1.3];
/** the straight chord from the ball to Rodrygo, and its left normal (the pass bows out to the LEFT of it and bends back right) */
const CH_L=Math.hypot(V_XZ[0]-CX0,V_XZ[1]-CZ0),CHD:[number,number]=[(V_XZ[0]-CX0)/CH_L,(V_XZ[1]-CZ0)/CH_L],CHN:[number,number]=[CHD[1],-CHD[0]];
const YAW_CH=yawTo(CX0,CZ0,V_XZ[0],V_XZ[1]);
/** the outside of the right boot: the ball leaves ~12° left of the chord and bends right, and he faces a further ~16° left of that
 * (the famous disguise: he looks one way and the ball goes the other) */
const YAW_M=YAW_CH+28*RAD;
/** the trivela: the ordinary strike with the toes turned IN and the leg swinging across, so the OUTSIDE of the right boot meets the ball */
const TRIV=(u:number):Pose=>{const p=strike(u,{foot:'r',power:.55}),w=Math.exp(-Math.pow((u-STRIKE_CONTACT)/.16,2));p.rHipR-=36*RAD*w;p.rHipA-=10*RAD*w;p.rAnk+=8*RAD*w;return clampPose(p);};
const SD=.95,S_ST=-STRIKE_CONTACT*SD;
const mStrike=(tau:number):Pose=>TRIV(clamp((tau-S_ST)/SD));
/** the outside of his right boot at contact, relative to his pelvis (solved once, FK) */
const OUTSIDE=(()=>{const sk=solve(mStrike(0),MODRIC_B,{x:0,z:0,yaw:YAW_M});return mix3(sk.rAn,sk.rToe,.45);})();
const P0:[number,number]=[CX0-OUTSIDE[0],CZ0-OUTSIDE[2]];
/** Rodrygo's volley: side-on, body opened, the inside of the right foot at knee height (inferred foot and height) */
const GOAL_PT:V3=[0,.35,2.95];
const YAW_R=yawTo(V_XZ[0],V_XZ[1],GOAL_PT[0],GOAL_PT[2])+22*RAD;
const OPEN:Partial<Pose>={rHipR:34,rAnk:-4,neckP:34};
const VD=.85,FLY_P=1.3,V_ST=FLY_P-.5*VD;
function rVolley(tau:number):Pose{const u=(tau-V_ST)/VD;return over(volley(clamp(u),{foot:'r',height:.3}),OPEN,bump(.25,.8,u));}
const RFOOT=(()=>{const sk=solve(rVolley(FLY_P),RODRYGO_B,{x:0,z:0,yaw:YAW_R});return mix3(sk.rAn,sk.rToe,.5);})();
const V_PT:V3=[V_XZ[0],Math.max(.2,RFOOT[1]+.06),V_XZ[1]];
const RP:[number,number]=[V_XZ[0]-RFOOT[0],V_XZ[1]-RFOOT[2]];

// ---------------------------------------------------------------- the build-up: Kanté loses it, Marcelo intercepts, the ball to Modrić
const T_INT=-3.6,T_MP=-2.9,T_RCV=-1.6,T_SET=-.8,FLY_S=.42,IN_NET=FLY_P+FLY_S+.1;
const MP_PT:V3=[-36.6,.11,-23.1],RCV:V3=[-28.3,.11,-18.3],SET_PT:V3=[-27.4,.11,-17.85];
const PASS_D:[number,number]=(()=>{const dx=RCV[0]-MP_PT[0],dz=RCV[2]-MP_PT[2],l=Math.hypot(dx,dz);return[dx/l,dz/l];})();
/** Marcelo's pelvis at his pass: the ball at his LEFT boot (left of facing = (dz,−dx)) */
const M_MP:[number,number]=[MP_PT[0]-PASS_D[0]*.45-PASS_D[1]*.18,MP_PT[2]-PASS_D[1]*.45+PASS_D[0]*.18];
/** the celebration: toward the main-stand corner (inferred) */
const CEL:[number,number]=[-5,21];

// ---------------------------------------------------------------- the players: keyframed tracks [τ, X, Z]
type Role='hero'|'real'|'chelsea'|'gk'|'ref';
type Actor={name:string;role:Role;st:AthleteStyle;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'Modrić',role:'hero',st:MODRIC_ST,key:true,keys:[[-8,-35,-14],[-4,-31.4,-16.6],[T_RCV,RCV[0]-.5,RCV[2]-.2],[T_SET,SET_PT[0]-.5,SET_PT[2]-.25],[0,...P0],[.5,P0[0]+.6,P0[1]+.35],[2.2,-24,-15.2],[5,-19,-9],[12,-15,-4]]},
 {name:'Rodrygo',role:'real',st:RODRYGO_ST,key:true,keys:[[-8,-32,11],[-4,-25.5,8.6],[0,-17.4,4.8],[.8,-13.6,2.8],[FLY_P,...RP],[FLY_P+.45,RP[0]+.7,RP[1]+.35],[3.2,-8,8.5],[5,-5.4,16.5],[6.2,CEL[0],CEL[1]],[12,CEL[0],CEL[1]]]},
 {name:'Marcelo',role:'real',st:real({number:12,skin:SKIN_M,hairStyle:'curly',build:{height:1.74,bulk:1.02},seed:12}),key:true,keys:[[-8,-44,-26],[-5,-40.6,-24.4],[T_INT,-37.9,-23],[T_MP,...M_MP],[-1,-34,-23.2],[3,-29,-23.5],[12,-22,-23]]},
 {name:'Vinícius',role:'real',st:real({number:20,skin:SKIN_D,build:{height:1.76},seed:20}),keys:[[-8,-24,-29],[0,-15,-26],[FLY_P,-13,-22.5],[4,-9,4],[7,CEL[0]-1.8,CEL[1]-1.2],[12,CEL[0]-1.8,CEL[1]-1.2]]},
 {name:'Benzema',role:'real',st:real({number:9,skin:SKIN_M,build:{height:1.85,bulk:1.05},seed:9}),keys:[[-8,-18,-1],[0,-11.2,-4.6],[FLY_P,-9.6,-3.8],[3,-8,5],[6.5,CEL[0]+1.4,CEL[1]-1],[12,CEL[0]+1.4,CEL[1]-1]]},
 {name:'Valverde',role:'real',st:real({number:15,build:{height:1.82},seed:15}),keys:[[-8,-32,20],[0,-21.5,14.5],[FLY_P,-18.6,12.4],[6.5,CEL[0]-.6,CEL[1]+1.5],[12,CEL[0]-.6,CEL[1]+1.5]]},
 {name:'Camavinga',role:'real',st:real({number:25,skin:SKIN_D,build:{height:1.82},seed:25}),keys:[[-8,-40,-6],[0,-32,-8],[12,-26,-4]]},
 {name:'Carvajal',role:'real',st:real({number:2,build:{height:1.73},seed:2}),keys:[[-8,-46,25],[0,-39,24],[12,-30,22]]},
 {name:'Kanté',role:'chelsea',st:chelsea({number:7,skin:SKIN_D,build:{height:1.68},seed:7}),key:true,keys:[[-8,-30,-19.8],[-5,-33.8,-21],[T_INT,-36.3,-22],[-2.6,-36.9,-21.8],[0,-33.5,-20.4],[3,-27.5,-17.5],[12,-23,-14]]},
 {name:'James',role:'chelsea',st:chelsea({number:24,skin:SKIN_D,build:{height:1.8,bulk:1.06},seed:24}),keys:[[-8,-22,-21],[0,-16.2,-23.6],[FLY_P,-14.6,-21.2],[12,-13,-19]]},
 {name:'Thiago Silva',role:'chelsea',st:chelsea({number:6,build:{height:1.83},seed:6}),key:true,keys:[[-8,-19,-7],[0,-14.7,-3.4],[.7,-14.3,-2.9],[FLY_P,-13.4,-2],[12,-12.8,-1.6]]},
 {name:'Rüdiger',role:'chelsea',st:chelsea({number:2,skin:SKIN_D,build:{height:1.9,bulk:1.06},seed:2}),key:true,keys:[[-8,-15,8],[0,-10.2,6.3],[FLY_P,-9.3,5],[12,-9,4.8]]},
 {name:'Alonso',role:'chelsea',st:chelsea({number:3,skin:SKIN_L,build:{height:1.88},seed:3}),keys:[[-8,-19,16],[0,-13.4,13],[12,-11,12]]},
 {name:'Kovačić',role:'chelsea',st:chelsea({number:8,skin:SKIN_L,build:{height:1.77},seed:8}),keys:[[-8,-28,-12],[0,-21.4,-9.2],[12,-16,-6]]},
 {name:'Loftus-Cheek',role:'chelsea',st:chelsea({number:12,skin:SKIN_D,build:{height:1.91},seed:12}),keys:[[-8,-28,3],[0,-21.8,.6],[FLY_P,-19.2,1],[12,-16,1]]},
 {name:'Mount',role:'chelsea',st:chelsea({number:19,skin:SKIN_L,build:{height:1.78},seed:19}),keys:[[-8,-33,9],[0,-27.5,5.5],[12,-22,4]]},
 {name:'Mendy',role:'gk',st:MENDY_ST,key:true,keys:[[-8,-3.2,-2],[-2,-1.9,-1.8],[0,-1.6,-1.2],[FLY_P,-1.3,.3],[12,-1.3,.3]]},
 {name:'Marciniak',role:'ref',st:REF_ST,keys:[[-8,-38,-4],[0,-31,-7],[12,-24,-4]]},
];
const IX=(n:string)=>ACTORS.findIndex(a=>a.name===n);
const HERO=0,RODRYGO=IX('Rodrygo'),MARCELO=IX('Marcelo'),KANTE=IX('Kanté'),SILVA=IX('Thiago Silva'),MENDY=IX('Mendy');
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-8,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const at3=(k:number,tau:number,y=0):V3=>{const[x,z]=posOf(k,tau);return[x,y,z];};

// ---------------------------------------------------------------- the ball: Kanté's carry, the interception, Marcelo's pass, the touch, the trivela, the volley, the net
const kanteBall=(tau:number):V3=>{const[x,z]=posOf(KANTE,tau);return[x-.55,.11,z-.12];};
const INT_PT=kanteBall(T_INT);
const roll=(a:V3,b:V3,u:number,dec=.3):V3=>{const e=u*(1+dec-dec*u);return mix3(a,b,e);};
/** the trivela: looped (apex ~3.3 m) and curling — it bows out to the left of the straight line and bends back right onto Rodrygo */
const BOW=3.4,LOFT=3.1;
const passE=(u:number)=>u*(1.14-.14*u);
function passAt(e:number):V3{const b=mix3(C_BALL,V_PT,e),w=Math.sin(Math.PI*Math.pow(e,.85))*BOW;return[b[0]+CHN[0]*w,b[1]+LOFT*4*e*(1-e),b[2]+CHN[1]*w];}
const NET_HIT:V3=[1.7,.34,3.2],REST:V3=[1.3,.11,2.8];
function ballAt(tau:number):V3{
 if(tau<T_INT)return kanteBall(tau);
 if(tau<T_MP)return roll(INT_PT,MP_PT,(tau-T_INT)/(T_MP-T_INT),.6);
 if(tau<T_RCV)return roll(MP_PT,RCV,(tau-T_MP)/(T_RCV-T_MP),.3);
 if(tau<T_SET)return roll(RCV,SET_PT,(tau-T_RCV)/(T_SET-T_RCV),.7);
 if(tau<0)return roll(SET_PT,C_BALL,(tau-T_SET)/-T_SET,.5);
 if(tau<FLY_P)return passAt(passE(tau/FLY_P));
 if(tau<FLY_P+FLY_S){const u=(tau-FLY_P)/FLY_S,b=mix3(V_PT,GOAL_PT,u);return[b[0],b[1]+.12*Math.sin(Math.PI*u),b[2]];}
 if(tau<IN_NET)return mix3(GOAL_PT,NET_HIT,easeOut((tau-FLY_P-FLY_S)/.1));
 const u=clamp((tau-IN_NET)/.5);return mix3(NET_HIT,REST,easeOut(u));
}
const spinAt=(tau:number)=>TAU*(tau<0?2.2*tau:tau<FLY_P?-5*tau:-5*FLY_P+7*(Math.min(tau,IN_NET)-FLY_P));
const bulgeAt=(tau:number)=>tau<IN_NET-.03?0:Math.exp(-(tau-IN_NET+.03)*2.4)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses
const READY=posed({lHipF:30,rHipF:26,lKnee:42,rKnee:38,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:24,rShA:24,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DESPAIR:Partial<Pose>={lShF:150,rShF:150,lShA:52,rShA:52,lElb:128,rElb:128,neckP:14,lean:6};
const JOY:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** Modrić's first touch: the right foot cushions Marcelo's pass, arms out, eyes down */
const CUSHION:Partial<Pose>={rHipF:30,rKnee:30,rAnk:6,rHipR:20,lKnee:30,lean:10,lShA:48,rShA:40,neckP:36};
/** head up before the pass: he looks at the run (the disguise comes from the body, not the eyes) */
const HEAD_UP:Partial<Pose>={neckP:-4,neckY:-26};
const inWin=(u:number)=>Math.min(sm(0,.12,u),1-sm(1,1.3,u));
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(Math.min(tau,IN_NET));
 let yaw=sp>.6?yawTo(0,0,v[0],v[1]):yawTo(x,z,b[0],b[2]);
 if(a.role==='gk')yaw=yawTo(x,z,b[0],b[2]);
 if(tau>IN_NET+1.4&&sp<.6&&k!==RODRYGO)yaw=yawTo(x,z,CEL[0],CEL[1]);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 const idle=a.role==='gk'?keeperSet(tau*1.4+k*.1):a.role==='chelsea'?READY:stand();
 let p:Pose;
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,runCycle(distOf(k,tau)/1.4,{speed:0}),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.6+1.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===KANTE){if(tau<T_INT&&sp>.5)p=blendPose(p,dribble(distOf(k,tau)/1.5,{foot:'r',speed:.4}),.7);
  const D=.8,u=(tau-(T_INT+.05-.6*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),w);yaw=lerpAng(yaw,yawTo(x,z,MP_PT[0],MP_PT[2]),w);}}
 if(k===MARCELO){const Di=.7,ui=(tau-(T_INT-.6*Di))/Di;if(ui>0&&ui<1.3){const w=inWin(ui)*.9;p=blendPose(p,lunge(Math.min(1,ui),{side:'l'}),w);yaw=lerpAng(yaw,yawTo(x,z,INT_PT[0],INT_PT[2]),w);}
  const D=.8,u=(tau-(T_MP-STRIKE_CONTACT*D))/D;if(u>0&&u<1.3){const w=inWin(u);p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.45}),w);yaw=lerpAng(yaw,Math.atan2(-PASS_D[1],PASS_D[0]),w);}}
 if(k===SILVA){// the ball loops over and round him: he turns his head and shoulders after it
  if(tau>.3){const w=sm(.3,.9,tau);p=over(p,{neckY:-60,twist:-30,neckP:-18},w);}}
 if(k===MENDY){const at=FLY_P+.36,dur=.95,u=(tau-(at-.55*dur))/dur;if(u>0){p=blendPose(p,keeperDive(Math.min(1,u),{side:'l',height:.1}),sm(0,.1,u));yaw=Math.PI;}}
 if(k===RODRYGO){
  const u=(tau-V_ST)/VD,w=Math.min(sm(-.1,.12,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,rVolley(tau),w);yaw=lerpAng(yaw,YAW_R,sm(-.3,.05,u));}
  if(tau>IN_NET+.3&&tau<5.8)p=blendPose(p,celebrate(distOf(k,tau)/4,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau));
  if(tau>5.6){p=blendPose(p,celebrate((tau-5.6)*.8,{kind:'arms'}),sm(5.6,6,tau));}
 }
 if(k===HERO){
  // the touch: the right foot cushions the pass, then a little settling push
  if(tau>T_RCV-.5&&tau<T_SET+.1)p=over(p,CUSHION,bump(T_RCV-.5,T_RCV+.5,tau)*.9);
  if(tau>T_RCV+.2&&tau<-.3)p=blendPose(p,dribble(distOf(k,tau)/1.6,{foot:'r',speed:.3}),bump(T_RCV+.2,-.3,tau)*.7);
  if(tau>T_SET&&tau<-.2)p=over(p,HEAD_UP,bump(T_SET,-.2,tau)*.8);
  const u=(tau-S_ST)/SD,w=Math.min(sm(-.1,.1,u),1-sm(1,1.35,u));
  if(w>0){p=blendPose(p,mStrike(tau),w);yaw=lerpAng(yaw,YAW_M,sm(-.3,.05,u));}
  if(tau>FLY_P+.4)p=over(p,JOY,sm(IN_NET+.2,IN_NET+.8,tau)*(sp<2?1:.4));
 }
 if(tau>IN_NET+.25&&k!==HERO&&k!==RODRYGO){const w=sm(IN_NET+.25,IN_NET+.8,tau);if(a.role==='real')p=over(p,JOY,w*(sp<2?1:.4));if(a.role==='chelsea')p=over(p,DESPAIR,w*.85);}
 return{p,yaw};
}

// ---------------------------------------------------------------- the ONE figure adapter (all bodies go through here → athlete.ts)
/** drawPlayer(sheet, pose, camera, style, place, prev?, smear?): athlete.ts figure; prev = the pose one drawn frame earlier (secondary
 * motion: hair/hem trail), smear = halftone echo + speed lines on fast limbs (the trivela, the volley). */
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
/** the ball's path from τa to τb as projected points */
function pathPts(c:Cam,ta:number,tb:number,n=24):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const p=pr(c,ballAt(lerp(ta,tb,i/n)));if(p)out.push(p);}return out;}

// ---------------------------------------------------------------- one frame of the world through a camera
type Env={minBall?:number;lines?:boolean;prevT?:number;smear?:boolean;hero?:'high'|'mid'};
/** everything on the pitch, depth-sorted (far first): positions at τ, poses on twos at τp (τpp = the drawing before), the ball at τ.
 * Heat: small figures print at `low` detail; inside a passage every figure is capped (the outgoing scene is zoomed past the camera). */
function play(s:Sheet,c:Cam,tau:number,tp:number,tpp:number,e:Env={}):{hero?:DrawResult;rod?:DrawResult}{
 const v=view(s),items:{d:number;draw:()=>void}[]=[],m=s.getTransform(),ppu=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr,passing=!!s._passage.pending;const out:{hero?:DrawResult;rod?:DrawResult}={};
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<1)return;const g=scr(c,q),h=c.F*1.8/q[2];if(Math.abs(g[0])>v.hx+h||g[1]<-v.hy-h||g[1]>v.hy+h)return;
  items.push({d:q[2],draw:()=>{const{p,yaw}=poseOf(k,tp),px=h*ppu,star=k===HERO||k===RODRYGO;
   const detail:AthleteStyle['detail']=passing?(star?'mid':'low'):px<50||(!a.key&&px<110)?'low':star&&e.hero==='mid'&&px>170?'mid':'auto';
   const big=px>=90&&!passing,prev=big?(()=>{const q2=poseOf(k,tpp),[px2,pz2]=posOf(k,tpp);return{pose:q2.p,place:{x:px2,z:pz2,yaw:q2.yaw}};})():undefined;
   const smearOn=!!e.smear&&big&&((k===HERO&&tp>-.4&&tp<.4)||(k===RODRYGO&&tp>FLY_P-.35&&tp<FLY_P+.35));
   const r=drawPlayer(s,p,c,{...a.st,detail},{x,z,yaw},prev,smearOn);if(k===HERO)out.hero=r;if(k===RODRYGO)out.rod=r;}});});
 const bq=toCam(c,ballAt(tau));if(bq[2]>=NEAR)items.push({d:bq[2],draw:()=>{drawBall(s,c,tau,{min:e.minBall,lines:e.lines,prev:e.prevT});}});
 items.sort((a,b)=>b.d-a.d).forEach(i=>i.draw());
 return out;
}

// ---------------------------------------------------------------- shot blending (camera plans keyed on cue times)
type Shot={P:V3;T:V3;fov:number};
const blendShot=(a:Shot,b:Shot,u:number):Shot=>u<=0?a:u>=1?b:{P:mix3(a.P,b.P,u),T:mix3(a.T,b.T,u),fov:Math.exp(lerp(Math.log(a.fov),Math.log(b.fov),u))};
function plan(t:number,steps:[number,number,(t:number)=>Shot][]):Cam{let cur=steps[0][2](t);for(let i=1;i<steps.length;i++){const[a,d,f]=steps[i];const u=sm(a,a+Math.max(.01,d),t,easeInOutSine);if(u>0)cur=blendShot(cur,f(t),u);}return cam3(cur.P,cur.T,cur.fov);}

// ---------------------------------------------------------------- teaching marks
/** the pass's path so far: a ribbon along the real curling flight from contact to τ */
function passPath(s:Sheet,c:Cam,tau:number,w:number,o:{ink?:string;from?:number;min?:number;to?:number}={}){if(w<=0||tau<=0)return;
 const{ink=Y,from=0,min=8,to=FLY_P}=o,pts=pathPts(c,from,Math.min(tau,to),28);if(pts.length<3)return;const wd=Math.max(min,kAt(c,ballAt(Math.min(tau,to)))*.14);
 s.knockout(ribbon(pts,wd*1.6,{seed:61,taper:.8,pressure:.2,wobble:0}),.5*w);s.fill(ink,ribbon(pts,wd,{seed:61,taper:.8,pressure:.2,wobble:0}),.92*w);}
/** the straight line a normal pass would take (dashed red), from the ball to Rodrygo: it runs straight into the defender */
function straightLine(s:Sheet,c:Cam,w:number){if(w<=.02)return;const a:V3=[CX0,.2,CZ0],b:V3=[V_XZ[0],.2,V_XZ[1]],pts:Pt[]=[];
 for(let i=0;i<=16;i++){const p=pr(c,mix3(a,b,i/16*w));if(p)pts.push(p);}if(pts.length<3)return;const wd=Math.max(5,kAt(c,mix3(a,b,.6))*.1);
 const gaps:[number,number][]=[];for(let i=0;i<8;i++)gaps.push([(i+.55)/8,(i+.85)/8]);
 s.knockout(ribbon(pts,wd*1.7,{seed:91,taper:0,wobble:.3}),.55*w);s.fill(R,ribbon(pts,wd,{seed:91,taper:0,wobble:.3,gaps}),.95*w);}
function ring(s:Sheet,c:Cam,P:V3,rad:number,w:number,ink=Y,seed=43){if(w<=0)return;const pts:Pt[]=[];for(let i=0;i<40;i++){const a=i/40*TAU,p=pr(c,[P[0]+Math.cos(a)*rad*(.7+.3*w),0,P[2]+Math.sin(a)*rad*(.7+.3*w)]);if(p)pts.push(p);}
 if(pts.length>30){const rr=ribbon(pts,Math.max(5,kAt(c,P)*.05),{close:true,seed,taper:0,wobble:1.2});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}}
/** a ring round the target in the goal mouth (screen space) */
function goalRing(s:Sheet,c:Cam,P:V3,w:number,ink=R,seed=77){if(w<=.02)return;const q=pr(c,P);if(!q)return;const r=Math.max(24,kAt(c,P)*.45)*(.7+.3*w),pts:Pt[]=[];for(let i=0;i<32;i++){const a=i/32*TAU;pts.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r*.8]);}
 const rr=ribbon(pts,Math.max(5,r*.14),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.85*w);s.fill(ink,rr,.95*w);}
/** a red ring round the OUTSIDE edge of the right boot (toe, ankle, pushed out to the little-toe side) */
function bootRing(s:Sheet,r:DrawResult|undefined,w:number,ink=R){if(!r||w<=.02)return;const toe=r.joints.rToe,an=r.joints.rAn,rr=Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.2*w+3,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2,pts:Pt[]=[];
 for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([cx+Math.cos(a)*rr*1.25,cy+Math.sin(a)*rr*.85]);}
 s.fill(ink,ribbon(pts,Math.max(3,rr*.2),{seed:82,close:true,taper:0,wobble:.8}),.95*w);}
/** "spins the ball": a curled arrow round the ball in screen space (the side-spin the outside of the boot puts on it) */
function spinArrow(s:Sheet,c:Cam,tau:number,w:number){if(w<=.02)return;const q=toCam(c,ballAt(tau));if(q[2]<NEAR)return;const g=scr(c,q),r=Math.max(26,c.F*.11/q[2])*1.9,pts:Pt[]=[];
 const a0=-.4*Math.PI,a1=a0+1.45*Math.PI*w;for(let i=0;i<=20;i++){const a=lerp(a0,a1,i/20);pts.push([g[0]+Math.cos(a)*r,g[1]+Math.sin(a)*r*.6]);}
 const e=pts[pts.length-1],f=pts[pts.length-2],ang=Math.atan2(e[1]-f[1],e[0]-f[0]),hd=Math.max(10,r*.28),ca=Math.cos(ang),sa=Math.sin(ang);
 const p=ribbon(pts,Math.max(4,r*.12),{seed:95,taper:.3,wobble:.6});p.addPath(polyPath([[e[0]+ca*hd*.5,e[1]+sa*hd*.5],[e[0]-ca*hd-sa*hd*.6,e[1]-sa*hd+ca*hd*.6],[e[0]-ca*hd+sa*hd*.6,e[1]-sa*hd-ca*hd*.6]],true));
 s.knockout(p,.85*w);s.fill(Y,p,.95*w);s.stroke(K,p,2,.7*w);}
/** a red cross over a point (the pass that would have been blocked) */
function cross(s:Sheet,c:Cam,P:V3,w:number){if(w<=.02)return;const q=pr(c,P);if(!q)return;const r=Math.max(20,kAt(c,P)*.5)*w,u=Math.max(4,r*.2);
 const p=ribbon([[q[0]-r,q[1]-r],[q[0]+r,q[1]+r]],u,{seed:97,taper:.1,wobble:.5});p.addPath(ribbon([[q[0]+r,q[1]-r],[q[0]-r,q[1]+r]],u,{seed:98,taper:.1,wobble:.5}));s.knockout(p,.8*w);s.fill(R,p,.95*w);}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** the interception on "Marcelo", Modrić's first touch on "Luka Modrić", the trivela as "outside of his right boot" lands, Rodrygo's volley
 * on "Rodrygo", the net on "Goal"; real time elsewhere */
const tau1=(t:number)=>{const mc=CUE(0,'Marcelo'),g=CUE(0,'Goal');const s0=Math.max(T0+.4,T_INT-(mc+.1)*.7);
 return key(t,mono([[0,s0],[mc+.1,T_INT],[CUE(0,'Luka Modrić')+.3,T_RCV],[CUE(0,'outside of his right boot')+.55,0],[CUE(0,'Rodrygo')+.2,FLY_P],[g+.05,IN_NET],[SECS(0)+1,IN_NET+SECS(0)+1-g]]),linear);};
const P1:V3=[-24,27,76];
function cam1(t:number):Cam{
 const tau=tau1(t),mp=at3(HERO,tau,1),b=ballAt(Math.min(tau,IN_NET)),g=CUE(0,'Goal'),tr=CUE(0,'outside of his right boot');
 return plan(t,[
  [0,0,()=>({P:P1,T:[-30,4,-14],fov:40})],
  [CUE(0,'Chelsea')-.2,1.2,()=>({P:P1,T:mix3(b,[-34,1,-20],.4),fov:13})],
  [CUE(0,'Luka Modrić')-.4,1,()=>({P:P1,T:mix3(mp,[-20,1,-8],.3),fov:13})],
  [tr+.2,1.1,()=>({P:P1,T:mix3(b,[-14,1,-4],.55),fov:17})],
  [CUE(0,'Rodrygo')-.3,.8,()=>({P:P1,T:[-7,1,.8],fov:11})],
  [g+.3,1.6,()=>({P:P1,T:add3(at3(RODRYGO,tau),[1,1,1]),fov:13})],
 ]);
}
const ch1:Scene={
 draw(s,t){
  frame(s);const c=cam1(t),tau=tau1(t),tt=twos(t),tp=tau1(tt),tpp=tau1(tt-1/12),g=CUE(0,'Goal');
  stadium(s,c,t,{roar:sm(g,g+.4,t),flash:sm(g,g+.25,t)*(1-sm(g+2.5,g+3.5,t))});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the curl, drawn on behind the ball as it flies, fading once Rodrygo meets it
  if(tau>0&&tau<FLY_P+.8)passPath(s,c,tau,.8*(1-sm(FLY_P+.2,FLY_P+.8,tau)),{min:5});
  play(s,c,tau,tp,tpp,{minBall:14,lines:true,prevT:tau1(t-.06),hero:'mid'});
  // the interception: a small spark where Marcelo's boot takes the ball off Kanté
  const age=tau-T_INT;if(age>-.05&&age<.35){const q=pr(c,add3(INT_PT,[0,.2,0]));if(q)sparkBurst(s,Y,q[0],q[1],Math.max(36,kAt(c,INT_PT)*.5),{n:7,seed:13,g:easeOutBack(clamp((age+.05)/.12))*(1-clamp((age-.2)/.15)),width:Math.max(4,kAt(c,INT_PT)*.05)});}
 },
 aperture(t){const c=cam1(t),P=ballAt(Math.min(tau1(t),IN_NET+.4)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch1.still=CUE(0,'Goal')+.3;

// ---------------------------------------------------------------- 2 · slow-motion replay, low behind Modrić's right shoulder
const tau2=(t:number)=>key(t,mono([[0,-1.3],[CUE(1,'Watch again'),-1.2],[CUE(1,'Toes turned in'),-.12],[CUE(1,'outside of the boot'),0],[CUE(1,'spins the ball'),.2],[CUE(1,'See it bend'),.45],[CUE(1,'around the defenders'),.8],[CUE(1,'to Rodrygo'),FLY_P-.08],[SECS(1),FLY_P+.3]]),linear);
/** behind him and off his right shoulder, so the outside of the right boot faces the lens */
const E2:V3=[CX0-CHD[0]*7.2-CHN[0]*3,1.45,CZ0-CHD[1]*7.2-CHN[1]*3];
function cam2(t:number):Cam{
 const tau=tau2(t),b=ballAt(Math.min(tau,FLY_P)),hp=at3(HERO,Math.min(tau,.3),.7),tb=CUE(1,'See it bend');
 return plan(t,[
  [0,0,()=>({P:E2,T:mix3(hp,C_BALL,.5),fov:34})],
  [CUE(1,'Toes turned in')-.3,.8,()=>({P:add3(E2,[CHD[0]*1.2,-.4,CHD[1]*1.2]),T:add3(C_BALL,[-CHD[0]*.6,.55,-CHD[1]*.6]),fov:26})],
  [CUE(1,'spins the ball')+.1,1,()=>({P:add3(E2,[0,.9,0]),T:mix3(b,[V_XZ[0],1,V_XZ[1]],.3),fov:40})],
  [tb+.4,1.4,()=>({P:add3(E2,[0,2.2,0]),T:mix3(b,[V_XZ[0],.8,V_XZ[1]],.55),fov:46})],
 ]);
}
const ch2:Scene={
 draw(s,t){
  frame(s);const c=cam2(t),tau=tau2(t),tt=twos(t),tp=tau2(tt),tpp=tau2(tt-1/12);
  const tT=CUE(1,'Toes turned in'),tO=CUE(1,'outside of the boot'),tS=CUE(1,'spins the ball'),tB=CUE(1,'See it bend'),tA=CUE(1,'around the defenders'),tR=CUE(1,'to Rodrygo');
  stadium(s,c,t);
  ground(s,c);
  // "around the defenders": a red ring under Thiago Silva, the man on the straight line
  ring(s,c,at3(SILVA,tau),.9,sm(tA-.15,tA+.3,t,easeOutBack)*(1-sm(SECS(1)-.9,SECS(1)-.5,t)),R,45);
  // "to Rodrygo": a yellow ring where he meets it
  ring(s,c,[V_XZ[0],0,V_XZ[1]],1,sm(tR-.2,tR+.3,t,easeOutBack),Y,46);
  // "see it bend": the curling path drawn on behind the ball
  passPath(s,c,tau,sm(tB-.3,tB+.2,t),{min:6});
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:12}).hero;
  // "toes turned in": a red ring round the outside of the right boot
  bootRing(s,hr,sm(tT-.12,tT+.25,t,easeOutBack)*(1-sm(tS+.1,tS+.5,t)));
  // "the outside of the boot": the spark at contact
  const sf=sm(tO-.1,tO+.25,t,easeOutBack)*(1-sm(tO+.6,tO+1,t));
  if(sf>.02){const p=pr(c,C_BALL);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(50,kAt(c,C_BALL)*.4)*sf,{n:9,seed:61,width:Math.max(5,kAt(c,C_BALL)*.04)});}
  // "spins the ball": a curled arrow round the flying ball
  spinArrow(s,c,tau,sm(tS-.1,tS+.5,t)*(1-sm(tB+.4,tB+.9,t)));
 },
 aperture(t){const c=cam2(t),P=ballAt(Math.min(tau2(t),FLY_P)),q=toCam(c,P),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(12,c.F*.11/q[2]*1.2),12);},
 still:0,
};
ch2.still=CUE(1,'outside of the boot')+.25;

// ---------------------------------------------------------------- 3 · the second replay angle, behind the goal: the volley, the corner, the celebration
const tau3=(t:number)=>{const tn=CUE(2,'no chance');return key(t,mono([[0,FLY_P-1],[CUE(2,'Rodrygo'),FLY_P-.7],[CUE(2,'opens his body'),FLY_P-.2],[CUE(2,'side-foots'),FLY_P],[CUE(2,'bottom corner'),IN_NET-.02],[tn,IN_NET+.5],[SECS(2)+1,IN_NET+.5+(SECS(2)+1-tn)*.9]]),linear);};
const E3:V3=[8,3.4,5.2];
function cam3v(t:number):Cam{
 const tau=tau3(t),b=ballAt(Math.min(tau,IN_NET)),rp=at3(RODRYGO,tau,1);
 return plan(t,[
  [0,0,()=>({P:E3,T:mix3([V_XZ[0],1.4,V_XZ[1]],b,.35),fov:32})],
  [CUE(2,'opens his body')-.3,.8,()=>({P:add3(E3,[-.8,-.3,-.6]),T:[V_XZ[0]+1,.8,V_XZ[1]],fov:24})],
  [CUE(2,'side-foots')+.2,.6,()=>({P:E3,T:[-4,.8,2],fov:30})],
  [CUE(2,'no chance')+.2,1.4,()=>({P:[3,2.4,15],T:add3(rp,[.5,0,.4]),fov:34})],
 ]);
}
const ch3:Scene={
 draw(s,t){
  frame(s);const c=cam3v(t),tau=tau3(t),tt=twos(t),tp=tau3(tt),tpp=tau3(tt-1/12),tb=CUE(2,'bottom corner'),tO=CUE(2,'opens his body'),tS=CUE(2,'side-foots'),tn=CUE(2,'no chance');
  stadium(s,c,t,{roar:sm(IN_NET,IN_NET+.4,tau),flash:sm(IN_NET,IN_NET+.3,tau)*.7+.3*sm(tn-.1,tn+.3,t)});
  ground(s,c,{bulge:bulgeAt(tau)});
  // the last of the curl coming in, then the shot's line into the corner
  if(tau<FLY_P+.1)passPath(s,c,tau,1-sm(FLY_P,FLY_P+.1,tau),{from:Math.max(0,tau-.7),min:7});
  // "opens his body": a yellow ring under him
  ring(s,c,at3(RODRYGO,Math.min(tau,FLY_P)),.9,sm(tO-.15,tO+.3,t,easeOutBack)*(1-sm(tS+.3,tS+.7,t)),Y,44);
  const r=play(s,c,tau,tp,tpp,{smear:true,minBall:12});
  // "side-foots": a spark at the inside of his right foot as he meets it
  const sf=sm(tS-.1,tS+.2,t,easeOutBack)*(1-sm(tS+.5,tS+.9,t));
  if(sf>.02){const p=pr(c,V_PT);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(44,kAt(c,V_PT)*.4)*sf,{n:9,seed:63,width:Math.max(5,kAt(c,V_PT)*.04)});}
  bootRing(s,r.rod,sm(tO,tO+.3,t)*(1-sm(tS+.2,tS+.5,t)),Y);
  // "bottom corner": a red ring round the corner as it goes in
  goalRing(s,c,GOAL_PT,sm(tb-.2,tb+.3,t,easeOutBack)*(1-sm(tb+.9,tb+1.4,t)));
  // "no chance!": a burst of paper and yellow over the celebration (the passage material into the lesson)
  const fb=sm(tn+.6,tn+1.1,t);if(fb>0){const q=pr(c,add3(at3(RODRYGO,tau),[0,3.2,0]));if(q)sparkBurst(s,Y,q[0],q[1],110+150*fb,{n:11,seed:9,g:easeOutBack(fb),width:14});}
 },
 aperture(t){const c=cam3v(t),q=pr(c,at3(RODRYGO,tau3(t),1.2))??[0,0];return apertureDisc(q[0],q[1],70,12);},
 still:0,
};
ch3.still=CUE(2,'bottom corner')+.2;

// ---------------------------------------------------------------- 4 · the lesson: a defender on the straight line → the outside of the foot → the pass bends round him
const tau4=(t:number)=>key(t,mono([[0,-1.5],[CUE(3,'Your turn'),-1.35],[CUE(3,'defender in the way'),-.75],[CUE(3,'outside of your foot'),0],[CUE(3,'bend a pass'),.5],[CUE(3,'around a defender'),FLY_P-.1],[SECS(3),FLY_P+.35]]),linear);
/** raised, behind the passer: the straight line, the defender on it and the bend all read at once */
const E4:V3=[CX0-CHD[0]*7+CHN[0]*-3.5,6.2,CZ0-CHD[1]*7+CHN[1]*-3.5];
const MID4:V3=[lerp(CX0,V_XZ[0],.55)+CHN[0]*1.6,.6,lerp(CZ0,V_XZ[1],.55)+CHN[1]*1.6];
function cam4v(t:number):Cam{
 return plan(t,[
  [0,0,()=>({P:add3(E4,[CHD[0]*2.5,-3,CHD[1]*2.5]),T:add3(C_BALL,[CHD[0]*2.5,.6,CHD[1]*2.5]),fov:32})],
  [CUE(3,'defender in the way')-.3,1,()=>({P:E4,T:MID4,fov:44})],
 ]);
}
const ch4:Scene={
 draw(s,t){
  frame(s);const c=cam4v(t),tau=tau4(t),tt=twos(t),tp=tau4(tt),tpp=tau4(tt-1/12);
  const tY=CUE(3,'Your turn'),tD=CUE(3,'defender in the way'),tO=CUE(3,'outside of your foot'),tB=CUE(3,'bend a pass'),tA=CUE(3,'around a defender'),E=SECS(3);
  stadium(s,c,t);
  ground(s,c);
  // 1 · your turn: a ring under the passer
  ring(s,c,at3(HERO,Math.min(tau,0)),.8,sm(tY-.15,tY+.35,t,easeOutBack)*(1-sm(tO,tO+.4,t)),Y,44);
  // 2 · a defender in the way: the straight line runs into him (dashed red), a red ring under him and a cross on the blocked line
  const dw=sm(tD-.1,tD+.6,t)*(1-sm(E-1,E-.6,t));straightLine(s,c,dw);ring(s,c,at3(SILVA,tau),1,dw,R,45);
  cross(s,c,add3(at3(SILVA,Math.min(tau,0)),[0,1.2,0]),sm(tD+.4,tD+.8,t,easeOutBack)*(1-sm(tB,tB+.4,t)));
  // 4 · bend a pass: the real curling path, drawn on behind the ball
  passPath(s,c,tau,sm(tB-.3,tB+.2,t)*(1-sm(E-.8,E-.4,t)),{min:8});
  // 5 · around a defender: the target ring where Rodrygo takes it
  ring(s,c,[V_XZ[0],0,V_XZ[1]],1.1,sm(tA-.2,tA+.3,t,easeOutBack)*(1-sm(E-.8,E-.4,t)),Y,46);
  const hr=play(s,c,tau,tp,tpp,{smear:true,minBall:13}).hero;
  // 3 · the outside of your foot: the ring round the outside of the boot, then the spark as it meets the ball
  bootRing(s,hr,sm(tO-.3,tO,t,easeOutBack)*(1-sm(tO+.4,tO+.8,t)));
  const sf=sm(tO-.05,tO+.2,t,easeOutBack)*(1-sm(tO+.5,tO+.9,t));if(sf>.02){const p=pr(c,C_BALL);if(p)sparkBurst(s,Y,p[0],p[1],Math.max(40,kAt(c,C_BALL)*.4)*sf,{n:8,seed:65,width:Math.max(4,kAt(c,C_BALL)*.04)});}
 },
 still:0,
};
ch4.still=CUE(3,'bend a pass')+.4;

const film:RisoStory={
 id:'modric-signature',format:'11v11',title:"Modrić's outside-of-the-foot pass",
 theme:'The trivela: the outside of your foot can bend a pass around a defender',
 ageNote:'Real Madrid v Chelsea, UEFA Champions League quarter-final, Santiago Bernabéu, Madrid, 12 April 2022 (Modrić\'s assist for Rodrygo, 80th minute). For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: an outside-of-the-foot pass — a yellow path that starts out left and bends back right, a ball riding it. Reduced motion: the still path. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),fade=age<=0?1:1-clamp((age-.55)/.25),r=rng(seed);
  const pts:Pt[]=[];for(let i=0;i<=16;i++){const k=i/16*u;pts.push([x+280*k,y-120*Math.sin(Math.PI*Math.pow(k,.85))+40*k]);}
  if(pts.length>2)s.fill(Y,ribbon(pts,14,{seed,taper:.8,pressure:.3,wobble:1}),.95*fade);
  const e=pts[pts.length-1];if(age>0&&age<.3)sparkBurst(s,Y,x,y,80,{n:7,seed,g:1-clamp(age/.3),width:10});
  footballPanels(s,e[0],e[1],30,{rot:age*16+r()*TAU,key:K,shadow:B,seed:5});
 },
};
export default film;
