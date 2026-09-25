/** Michael Owen v Argentina, World Cup round of 16, Stade Geoffroy-Guichard, Saint-Étienne, 30 June 1998 (2–2 a.e.t., Argentina won 4–3 on
 * penalties): Owen's solo goal in the 16th minute that made it 2–1 to England. He was 18. An iconic-play riso film (RisoStory, chapters mode):
 * a 1:1 reconstruction from written accounts (we cannot watch the footage), printed as a riso sheet.
 *
 * SOURCES (read Sept 2026; the web-search budget was spent, so the Wikipedia pages were read directly and the rest is noted below):
 *  - Wikipedia, "1998 FIFA World Cup knockout stage" (Argentina vs England: line-ups and shirt numbers, 21:00 CEST kick-off, attendance
 *    30,600, referee Kim Milton Nielsen (Denmark), "Argentina decided to use their change kit, feeling that it had granted them luck in the
 *    1986 World Cup quarter-final", all four goals in the first half; it cites FIFA match 8779 and the France 98 match report)
 *    https://en.wikipedia.org/wiki/1998_FIFA_World_Cup_knockout_stage
 *  - Wikipedia, "Michael Owen" ("In the 16th minute, Owen gave England a 2–1 lead with a sensational individual goal. After beating defenders
 *    Ayala and José Chamot, he struck the ball past goalkeeper Carlos Roa"; "ran from the halfway line"; 18 years old; voted England's
 *    third-greatest goal in 2013)  https://en.wikipedia.org/wiki/Michael_Owen
 *  - Wikipedia, "Argentina–England football rivalry" (the 1998 section: "one of England's greatest ever goals")
 *  - Wikipedia, "Stade Geoffroy-Guichard" ("English style": four separate stands, no corner stands; renovated for 1998 with new floodlights on
 *    each of the four stands and a re-laid pitch; 30 June 1998 21:00 Argentina 2–2 (4–3 p) England)
 *  - Wikipedia, "Argentina national football team kits" (the away kits "have been in dark blue shades"; Adidas supplied 1990–1998);
 *    "José Chamot" (Argentina's starting left-back / left-sided defender in 1998); "Carlos Roa"; "Paul Scholes" (England no. 16 in 1998).
 *  - The user's brief (Sept 2026) for the beats: Beckham's pass just inside the Argentina half, past Chamot and Ayala at speed, shot across Roa
 *    into the far top corner, Scholes running alongside.
 * CONFIRMED by the pages read: 30 June 1998, Stade Geoffroy-Guichard, Saint-Étienne, 21:00 kick-off, 30,600 people, referee Kim Milton Nielsen;
 *  Batistuta pen 5' (1–0), Shearer pen 9' (1–1), Owen 16' (2–1), Zanetti 45+1' (2–2); Owen no. 20, 18 years old, a solo run from the halfway
 *  line past Ayala (no. 2) and Chamot (no. 3), shot past Roa (no. 1); Beckham no. 7, Scholes no. 16, Shearer no. 9 (captain); Argentina's line
 *  of three at the back was Vivas (14), Ayala, Chamot; Argentina played in their CHANGE kit (not the sky-blue and white stripes), and their
 *  change kits are dark blue — so England wore their white home shirts; the ground's four separate stands with open corners and roof
 *  floodlights.
 * FROM THE BRIEF / WIDELY REPORTED BUT NOT RE-READ THIS SESSION: Beckham's pass, received just inside the Argentina half; Chamot beaten first,
 *  then Ayala; the shot across Roa into the far top corner with the right foot; Scholes running alongside (he is often quoted joking that Owen
 *  "nicked" his chance); the first touch with the outside of the right boot; England's navy shorts and white socks with red trim; the 1998
 *  Adidas "Tricolore" ball (white with blue triads and red accents).
 * INFERRED (illustrative): every position, speed and timing in metres and seconds between those beats; the side of the pitch (right of centre
 *  in England's attack, so the run is on the camera side); how many touches (the film knocks the ball ahead once per sprint stride); which
 *  side of each defender he went (outside, to his right); Chamot's lunge and Ayala backing off before his late lunge; Roa's late dive; where
 *  the other players stand and which are shown; Argentina's black shorts and dark socks; Roa's yellow jersey; the referee's black kit; the
 *  evening light (sunset in Saint-Étienne is about 21:35 in late June, so the 16th minute is dusk under the floodlights); the stands' tiers,
 *  roofs and hills beyond the open corners; the crowd colours and flags (England fans' St George crosses, Argentina's sky-blue and white);
 *  the boards; the celebration run; the camera placements and lenses.
 *
 * FRAMING (the TV broadcast, full-sheet card window 1.45:1 down to square, never sheet.safe; never top-down): 1 = the high main-stand camera,
 * live, near real time, panning with the ball (Beckham's pass → the goal); 2 = TV slow-motion replay from a low touchline camera running with
 * Owen (the first touch pushes the ball into space, the sprint, Ayala backing away); 3 = the replay from behind Owen's shoulder (Scholes
 * alongside, the shot across Roa into the far top corner, the celebration); 4 = the lesson from a low side-on camera on the run at Ayala (the
 * space ahead, full speed, the ball out in front). Every figure is the shared riso athlete (lib/plays/riso/athlete.ts), routed through ONE
 * adapter, drawPlayer(). The play is ONE simulation on a clock τ (seconds; τ = 0 Owen's first touch). Scenes read only (t); every action keys
 * off cue times, so the recorded voice (VOICE → withTiming) re-times the film; every random value is seeded. Inks: yellow, red, blue, navy. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {TAU,twos,sm,key,clamp,lerp,rng,hash,blob,polyPath,ribbon,rectPath,easeOut,easeOutBack,easeInOutSine,linear,type Pt} from '../../paths/riso/motion';
import {sparkBurst,laneArrow,glowDisc} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,runCycle,backpedal,lunge,strike,keeperSet,keeperDive,celebrate,stand,posed,blendPose,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type InkFill,type Place,type Projector,type V3,type DrawResult} from './athlete';

// ---------------------------------------------------------------- narration + timing
/** Provisional cue onsets (≈3 words/s plus pauses: about the 2.4 words/s the Kokoro clips average once the tails are counted), replaced by the measured Kokoro onsets once timing.json exists. `seconds`
 * includes the silent tail that carries the .65 s passage. Cue words must stay substrings of the text (script.json mirrors it). */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/3+(/[.!?]$/.test(w)?.32:/[,;:]$/.test(w)?.14:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9é]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`owen film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: the lead runs scripts/plays/kokoro-narrate.py owen-argentina-1998, which writes timing.json next to script.json. Then replace this
 * null with `import timingJson from '../../../public/plays/narration/owen-argentina-1998/timing.json'` and pass `timingJson as NarrationTiming`:
 * withTiming swaps in the clips, chapter lengths and word onsets and the whole film re-times itself.
 * (tests/play-film-owen-argentina-1998.cjs fails until this is wired once timing.json exists.) */
import timingJson from '../../../public/plays/narration/owen-argentina-1998/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('The goal, live','Saint-Étienne, 1998. England, in white, play Argentina. Beckham passes to eighteen-year-old Michael Owen. He knocks it past one defender, races past another, and shoots... goal!',
  ['Saint-Étienne','England, in white','play Argentina','Beckham passes','Michael Owen','He knocks it','past one defender','races past another','and shoots','goal']),
 prov('Watch again','Watch again, slowly. His first touch pushes the ball ahead, into space. Then he runs at full speed, and the defender has to back away.',
  ['Watch again','His first touch','pushes the ball ahead','into space','full speed','the defender','back away']),
 prov('Top corner','Paul Scholes runs alongside, but Owen shoots across the keeper, into the far top corner! England lead two to one!',
  ['Paul Scholes','runs alongside','Owen shoots','across the keeper','far top corner','England lead']),
 prov('Your turn','Your turn: when you have space, run at defenders at full speed, with the ball out in front of you.',
  ['Your turn','when you have space','run at defenders','full speed','the ball out in front']),
],VOICE);
/** onset of the cue whose words start with w in chapter i (throws on a typo, so a retime can never silently desync) */
const CUEW=(i:number,w:string)=>{const c=CHAPTERS[i].cues.find(q=>q.words.startsWith(w));if(!c)throw new Error('owen: cue '+w);return c.at;};
const SECS=(i:number)=>CHAPTERS[i].seconds;
/** keys forced to increase in time (a retime can never reorder a τ map) */
const mono=(K:number[][]):number[][]=>{let prev=-1e9;return K.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});};

// ---------------------------------------------------------------- inks, small helpers
const Y='yellow',R='red',B='blue',K='navy';
const lerp3=(a:V3,b:V3,u:number):V3=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpA=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
/** heading of a ground direction as an athlete yaw (yaw 0 faces +X, + turns left toward −Z) */
const yawOf=(dx:number,dz:number)=>Math.atan2(-dz,dx);
/** a smooth bump 0 → 1 → 0 over [a, b] */
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** The film plays inside the player card's picture window (~1566 × 1080 units): world (x,y) on the CANVAS centre at z0 units per world unit
 * (the engine's arrival scale is kept, so passages and seams behave exactly as in the stories). Full-sheet framing, never sheet.safe. */
function cam(s:Sheet,x:number,y:number,z0:number,r=0){const z=z0*Math.min(1,Math.pow(s.W/1566,.75)),k=z*s.arrival;s.camera(x-(s.W/2-s.cx)/k,y-(s.H/2-s.cy)/k,z/s.fit,r);return z;}
type View={hx:number;hy:number};
const view=(s:Sheet,z:number):View=>({hx:s.W/(2*z*.68)+60,hy:s.H/(2*z*.68)+60});
const frame=(s:Sheet)=>view(s,cam(s,0,0,1));

// ---------------------------------------------------------------- the TV camera: a right-handed 3D projection of the pitch
/** Pitch metres (right-handed, like athlete.ts): X along the length (England attack +X, Argentina's goal line at 105), Y up, Z across
 * (0 = the middle, +34 = the near touchline under the main-stand camera). A figure facing +X has its right side at +Z. */
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
/** a projected quad only when it is comfortably in front of the camera (cameras sit inside the ground: near stand parts are culled) */
function quadP(c:Cam,q:V3[],minDepth=14):Pt[]|null{let lo=Infinity;for(const p of q)lo=Math.min(lo,toCam(c,p)[2]);if(lo<minDepth)return null;return q.map(p=>scr(c,toCam(c,p)));}

// ---------------------------------------------------------------- Geoffroy-Guichard: four separate "English-style" stands, open corners, roof floodlights
/** a stand maps (a along 0..1, d metres back from the pitch edge, y) → world. Sides are two-tier with a balcony fascia; the ends one tall tier. */
type StandDef={at:(a:number,d:number,y:number)=>V3;two:boolean;cols:number};
const STANDS:StandDef[]=[
 {at:(a,d,y)=>[lerp(-1,106,a),y,-(38+d)],two:true,cols:42},// far side (across from the TV camera)
 {at:(a,d,y)=>[111+d,y,lerp(-31,31,a)],two:false,cols:22},// behind Argentina's goal (the end Owen attacks)
 {at:(a,d,y)=>[-6-d,y,lerp(31,-31,a)],two:false,cols:22},// behind England's goal
 {at:(a,d,y)=>[lerp(106,-1,a),y,38+d],two:true,cols:42},// near side, the main stand under the camera (mostly culled)
];
/** tier profiles: [d0, y0, d1, y1] */
const LOW2=[0,1.4,19,12.5],FAS2=[19,12.5,20,15.2],UP2=[20,15.2,33,26],ROOF2=[-3,29.5,36,31.5];
const LOW1=[0,1.4,26,17.5],ROOF1=[-2,21.5,28,23.5];
const tierQ=(S:StandDef,p:number[],a0=0,a1=1):V3[]=>[S.at(a0,p[0],p[1]),S.at(a1,p[0],p[1]),S.at(a1,p[2],p[3]),S.at(a0,p[2],p[3])];
type Seat={P:V3;h:number};
const SEATS:Seat[]=(()=>{const o:Seat[]=[];STANDS.forEach((S,si)=>{const tiers=S.two?[[LOW2,8],[UP2,6]]:[[LOW1,10]];
 for(const [p,rows] of tiers as [number[],number][])for(let r=0;r<rows;r++)for(let i=0;i<S.cols;i++)for(let k=0;k<2;k++){const h=hash(si*9173+i*977+r*31+k*7+(p===UP2?5000:0),13);if(h<.2)continue;
  const v=(r+.5)/rows,a=(i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/2)/S.cols;o.push({P:S.at(a,lerp(p[0],p[2],v),lerp(p[1],p[3],v)+.4),h});}});return o;})();
/** flags hung on the balcony fronts and the end walls: 0 = St George (England fans), 1 = Argentina (sky blue / white / sky blue) */
const FLAGS:{s:number;a:number;w:number;kind:0|1}[]=[{s:0,a:.12,w:.05,kind:0},{s:0,a:.24,w:.04,kind:1},{s:0,a:.38,w:.055,kind:0},{s:0,a:.55,w:.045,kind:0},{s:0,a:.68,w:.05,kind:1},{s:0,a:.84,w:.05,kind:0},
 {s:1,a:.16,w:.07,kind:1},{s:1,a:.56,w:.06,kind:0},{s:1,a:.8,w:.07,kind:0},{s:2,a:.3,w:.07,kind:0},{s:2,a:.7,w:.07,kind:1}];
/** the evening sky (dusk under the floodlights), the hills beyond the open corners, the four stands, the crowd, flags, lamps */
function stadium(s:Sheet,c:Cam,v:View,t:number,o:{roar?:number;flash?:number}={}){
 const{roar=0,flash=0}=o;
 // dusk: a blue field, warmer low in the sky (yellow + a red screen near the horizon)
 s.tone(B,rectPath(-1e4,-1e4,2e4,2e4),.42);
 const hz=(()=>{const q=pr(c,[c.C[0]+c.f[0]*3000,0,c.C[2]+c.f[2]*3000]);return q?q[1]:0;})();
 s.tone(Y,rectPath(-1e4,hz-700,2e4,1e4),.3);s.tone(R,rectPath(-1e4,hz-380,2e4,1e4),.14);
 // hills round Saint-Étienne, seen through the open corners (far away, a navy screen)
 const hill=new Path2D();{const pts:Pt[]=[];for(let i=0;i<=48;i++){const a=i/48*TAU,R0=420,x=52.5+Math.cos(a)*R0,z=Math.sin(a)*R0,y=38+22*Math.sin(a*3+1)+12*Math.sin(a*7);const q=pr(c,[x,y,z]);if(q)pts.push(q);}
  if(pts.length>2){const g=pr(c,[52.5+c.f[0]*400,-50,c.f[2]*400]);pts.sort((p,q)=>p[0]-q[0]);const base=(g?.[1]??hz)+2000;hill.addPath(polyPath([[pts[0][0],base],...pts,[pts[pts.length-1][0],base]],true));}}
 s.tone(K,hill,.5);s.tone(B,hill,.3);
 // stands: concrete tiers (blue × navy), balcony fascia, roof slabs (the plexiglass roofs: a light navy screen), crowd marks
 const low=new Path2D(),up=new Path2D(),fas=new Path2D(),roof=new Path2D(),back=new Path2D();
 const add=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};
 STANDS.forEach(S=>{for(let j=0;j<6;j++){const a0=j/6,a1=(j+1)/6;
  if(S.two){add(tierQ(S,LOW2,a0,a1),low);add(tierQ(S,FAS2,a0,a1),fas);add(tierQ(S,UP2,a0,a1),up);add(tierQ(S,ROOF2,a0,a1),roof);add([S.at(a0,33,26),S.at(a1,33,26),S.at(a1,36,31.5),S.at(a0,36,31.5)],back);}
  else{add(tierQ(S,LOW1,a0,a1),low);add(tierQ(S,ROOF1,a0,a1),roof);add([S.at(a0,26,17.5),S.at(a1,26,17.5),S.at(a1,28,23.5),S.at(a0,28,23.5)],back);}}});
 s.knockout(low);s.tone(B,low,.36);s.tone(K,low,.2);
 s.knockout(up);s.tone(B,up,.42);s.tone(K,up,.34);s.fill(K,back,.8);
 // the crowd: white shirts (paper), England red, Argentina sky blue, a few yellow, navy coats; roar lifts the marks
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of SEATS){const d=toCam(c,q.P);if(d[2]<14)continue;const p=scr(c,d);if(!inView(v,p))continue;const z=clamp(c.F*.5/d[2],2,12),lift=roar>0?roar*z*1.3*Math.max(0,Math.sin(t*11+q.h*TAU)):0;
  const ink=q.h<.5?0:q.h<.66?1:q.h<.8?2:q.h<.87?3:4;inks[ink].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.75);s.fill(R,inks[1],.9);s.tone(B,inks[2],.7);s.fill(Y,inks[3],.9);s.fill(K,inks[4],.8);}
 s.knockout(fas);s.fill(K,fas,.7);
 // flags on the balcony fronts / end walls
 const fw=new Path2D(),fr=new Path2D(),fb=new Path2D();
 for(const F of FLAGS){const S=STANDS[F.s],[d0,y0,d1,y1]=S.two?[19.2,12.7,19.2,15]:[.2,1.5,.2,3.3],q=(u:number,w:number):V3=>S.at(F.a+u*F.w,lerp(d0,d1,w),lerp(y0,y1,w)),Q=(u0:number,u1:number,w0:number,w1:number)=>quadP(c,[q(u0,w0),q(u1,w0),q(u1,w1),q(u0,w1)],10);
  const all=Q(0,1,0,1);if(!all||!inView(v,all[0],200))continue;fw.addPath(polyPath(all,true));
  if(F.kind===0){const a=Q(.43,.57,0,1),b=Q(0,1,.38,.62);if(a)fr.addPath(polyPath(a,true));if(b)fr.addPath(polyPath(b,true));}
  else{const a=Q(0,1,0,.33),b=Q(0,1,.67,1);if(a)fb.addPath(polyPath(a,true));if(b)fb.addPath(polyPath(b,true));}}
 s.knockout(fw);s.fill(R,fr,.95);s.tone(B,fb,.55);
 s.knockout(roof);s.tone(K,roof,.55);s.tone(B,roof,.3);
 // floodlights along the roof fronts (new for 1998): a paper lamp strip and warm glow discs
 const lamps=new Path2D();const glows:[Pt,number][]=[];
 STANDS.forEach((S,si)=>{const pf=S.two?ROOF2:ROOF1;const n=S.two?5:3;for(let i=0;i<n;i++){const a=(i+.5)/n,P=S.at(a,pf[0]+.3,pf[1]-.4),d=toCam(c,P);if(d[2]<20)continue;const g=scr(c,d);if(!inView(v,g,200))continue;
  const w=c.F*3.2/d[2],h=c.F*.9/d[2];lamps.rect(g[0]-w/2,g[1]-h/2,w,h);glows.push([g,Math.max(8,c.F*2.2/d[2])]);void si;}});
 s.knockout(lamps);s.fill(Y,lamps,.95);for(const [g,r] of glows)glowDisc(s,Y,g[0],g[1],r,{steps:3,glow:1,seed:Math.round(g[0])});
 if(flash>0){const p=new Path2D(),T12=Math.floor(t*12);for(let i=0;i<14;i++){const q=SEATS[Math.floor(hash(i*17+T12*101,3)*SEATS.length)],d=toCam(c,q.P);if(d[2]<14)continue;const g=scr(c,d);if(!inView(v,g))continue;const z=8+14*flash*hash(i,T12);
  p.addPath(polyPath([[g[0]-z,g[1]],[g[0],g[1]-z*.35],[g[0]+z,g[1]],[g[0],g[1]+z*.35]],true));p.addPath(polyPath([[g[0],g[1]-z],[g[0]+z*.3,g[1]],[g[0],g[1]+z],[g[0]-z*.3,g[1]]],true));}s.knockout(p);s.fill(Y,p,.95);}
}
/** the running track-less surround, grass (yellow × blue) with mowing stripes, boards, paper lines, both goals (the far goal drawn later from
 * the camera behind Owen, so the net sits in front of the keeper) */
function ground(s:Sheet,c:Cam,o:{bulge?:number;ballZ?:number;ballY?:number;goalLater?:boolean}={}){
 const sur=polyP(c,[[-6,0,-38],[111,0,-38],[111,0,38],[-6,0,38]]);if(sur.length>2){const p=polyPath(sur,true);s.knockout(p);s.tone(K,p,.3);s.tone(B,p,.2);}
 const g=polyP(c,[[-4,0,-36.5],[109,0,-36.5],[109,0,36.5],[-4,0,36.5]]);if(g.length<3)return;const gp=polyPath(g,true);
 s.knockout(gp);s.fill(Y,gp,.95);s.tone(B,gp,.86);
 // the re-laid 1998 pitch: crisp mowing in squares (stripes across the length and a fainter cross-cut)
 const st=new Path2D();for(let k=0;k<20;k+=2){const q=polyP(c,[[k*5.25,0,-36.5],[(k+1)*5.25,0,-36.5],[(k+1)*5.25,0,36.5],[k*5.25,0,36.5]]);if(q.length>2)st.addPath(polyPath(q,true));}s.tone(K,st,.12);
 // boards: far touchline and behind both goals — navy with paper and yellow panels
 const bd=new Path2D(),pn=new Path2D(),py=new Path2D();
 for(const q of [polyP(c,[[-4,0,-35.5],[109,0,-35.5],[109,.9,-35.5],[-4,.9,-35.5]]),polyP(c,[[108,0,-34],[108,0,34],[108,.9,34],[108,.9,-34]]),polyP(c,[[-3,0,34],[-3,0,-34],[-3,.9,-34],[-3,.9,34]])])if(q.length>2)bd.addPath(polyPath(q,true));
 for(let k=0;k<18;k++){const x=-2+k*6.2,q=polyP(c,[[x,.22,-35.45],[x+3.6,.22,-35.45],[x+3.6,.68,-35.45],[x,.68,-35.45]]);if(q.length>2)(k%3?pn:py).addPath(polyPath(q,true));}
 for(let k=0;k<11;k++){const z=-33+k*6.2,q=polyP(c,[[107.95,.22,z],[107.95,.22,z+3.6],[107.95,.68,z+3.6],[107.95,.68,z]]);if(q.length>2)(k%3?pn:py).addPath(polyPath(q,true));}
 s.knockout(bd);s.fill(K,bd,.9);s.knockout(pn,.85);s.knockout(py);s.fill(Y,py,.95);
 const ln=new Path2D(),L=(a:V3,b:V3)=>seg3(c,a,b,.13,ln);
 for(let k=0;k<8;k++){L([k*13.125,0,-34],[(k+1)*13.125,0,-34]);L([k*13.125,0,34],[(k+1)*13.125,0,34]);}
 for(let k=0;k<4;k++){const z0=-34+k*17,z1=z0+17;L([105,0,z0],[105,0,z1]);L([0,0,z0],[0,0,z1]);L([52.5,0,z0],[52.5,0,z1]);}
 const circ=(cx:number,cz:number,r:number,a0=0,a1=TAU,n=28)=>{for(let i=0;i<n;i++){const u0=a0+(a1-a0)*i/n,u1=a0+(a1-a0)*(i+1)/n;L([cx+Math.cos(u0)*r,0,cz+Math.sin(u0)*r],[cx+Math.cos(u1)*r,0,cz+Math.sin(u1)*r]);}};
 circ(52.5,0,9.15);circ(52.5,0,.1,0,TAU,6);
 for(const [gx,d] of [[105,-1],[0,1]] as [number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;L([gx,0,-20.16],[bx,0,-20.16]);L([bx,0,-20.16],[bx,0,20.16]);L([bx,0,20.16],[gx,0,20.16]);L([gx,0,-9.16],[sx,0,-9.16]);L([sx,0,-9.16],[sx,0,9.16]);L([sx,0,9.16],[gx,0,9.16]);
  const a=Math.acos(5.5/9.15);circ(gx+d*11,0,9.15,d<0?Math.PI-a:-a,d<0?Math.PI+a:a,10);circ(gx+d*11,0,.08,0,TAU,6);}
 s.knockout(ln);
 goal3(s,c,0,-1,0,0,1);
 if(!o.goalLater)goal3(s,c,105,1,o.bulge??0,o.ballZ??0,o.ballY??1);
}
/** a goal at X: posts at z ±3.66, bar 2.44, net 2 m deep; bulge pushes the back out around (ballZ, ballY) */
function goal3(s:Sheet,c:Cam,X:number,d:number,bulge:number,bz:number,by:number){
 const z0=-3.66,z1=3.66,H=2.44,back=(z:number,y:number)=>X+d*(2+bulge*.8*Math.exp(-Math.pow((z-bz)/1.8,2)-Math.pow((y-by)/1.3,2)));
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
const SKIN:InkFill[]=[[R,.75],[Y,.2]];
const SKIN_TAN:InkFill[]=[[R,.78],[Y,.3]];
/** England 1998: white shirts (paper) with red trim, navy shorts, white socks; Owen's number 20 in navy */
const ENG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',trim:R,shorts:[K,.88],socks:'paper',boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,numberInk:K,seed:5,...o});
const OWEN_ST=ENG({number:20,hair:K,hairStyle:'short',build:{height:1.73,bulk:.94,thighs:1.08},seed:20});
/** Argentina 1998: the dark-blue change kit (blue shirt, paper number), black shorts and dark socks inferred */
const ARG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,trim:'paper',shorts:K,socks:[K,.85],boots:K,skin:SKIN_TAN,hair:K,hairStyle:'short',line:K,numberInk:'paper',seed:3,...o});
/** Carlos Roa: yellow keeper's jersey (inferred), navy shorts */
const ROA_ST:AthleteStyle={shirt:Y,shorts:K,socks:Y,boots:K,skin:SKIN_TAN,hair:K,hairStyle:'long',line:K,gloves:[K,.5],sleeves:'long',trim:K,number:1,numberInk:K,build:{height:1.84},seed:51};
const REF_ST:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],boots:K,skin:SKIN,hair:[K,.7],hairStyle:'balding',line:K,trim:'paper',build:{height:1.84},seed:12};

/** THE ADAPTER — every figure in this film is drawn here (the shared riso athlete: fluid FK body, kit inks, halftone shade, key line).
 * prev = the pose and place one drawing earlier (secondary motion: hair and hem trail); smear = the halftone echo + speed arcs of the sprint. */
function drawPlayer(s:Sheet,pose:Pose,camera:Projector,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.smear&&o.prev)motionSmear(s,o.prev.pose,pose,camera,style,place,{prevPlace:o.prev.place,threshold:10});
 return drawAthlete(s,pose,camera,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ---------------------------------------------------------------- the players: keyframed tracks (τ = seconds after Owen's first touch)
type Role='owen'|'eng'|'arg'|'gk'|'ref';
type Move={kind:'lunge'|'dive';at:number;dur:number;side:'l'|'r';height?:number};
type Actor={name:string;role:Role;style:AthleteStyle;keys:number[][];moves?:Move[];engage?:[number,number];key?:boolean};
const SHOT=4.95;
/** Positions are Hermite-interpolated between keys [τ, X, Z]. The players the accounts name get the beats they give them. */
const ACTORS:Actor[]=[
 {name:'Owen',role:'owen',style:OWEN_ST,key:true,keys:[[-4,58.8,13.8],[-2.6,57.3,12.2],[-1.3,55.8,10.1],[-.45,55,9.1],[0,54.7,8.8],[.35,55.4,9.1],[.8,57.6,9.9],[1.3,60.9,10.6],[1.9,65.3,11.1],[2.5,69.8,11.3],[3,73.9,11.4],[3.5,78,11],[4,81.9,10],[4.5,85.5,8.9],[SHOT,88.3,8.2],[5.35,90.4,7.9],[6,92.6,8.8],[7,94.6,12.2],[8.5,95.6,17],[10,95.2,21],[12,94.4,24]]},
 {name:'Chamot',role:'arg',style:ARG({number:3,build:{height:1.85},seed:33}),key:true,engage:[-1.5,.6],moves:[{kind:'lunge',at:.3,dur:.8,side:'l'}],keys:[[-4,62.5,6],[-1.6,59.3,7],[-.5,57.4,7.6],[0,56.6,7.9],[.3,56.2,8.2],[.8,56.5,8.6],[1.4,58.2,9.2],[2.5,63.6,9.8],[4,71.2,9.6],[5.5,79.4,8.6],[12,86,8]]},
 {name:'Ayala',role:'arg',style:ARG({number:2,build:{height:1.77,bulk:1.04},seed:34}),key:true,engage:[.4,3.4],moves:[{kind:'lunge',at:3.25,dur:.8,side:'l'}],keys:[[-4,76.5,3],[-1,74.6,5],[0,74.1,5.7],[1,74.4,7],[2,75.5,8.4],[2.6,76.5,9.2],[3.1,77.3,9.7],[3.5,78,9.9],[4,80.6,9.6],[5,85.4,8.6],[6,89,8.2],[12,92,8]]},
 {name:'Vivas',role:'arg',style:ARG({number:14,seed:35}),keys:[[-4,80,-9],[2,83,-6],[4,88,-4.5],[SHOT,90.6,-4],[7,93,-2],[12,95,0]]},
 {name:'Roa',role:'gk',style:ROA_ST,key:true,moves:[{kind:'dive',at:SHOT+.5,dur:.9,side:'r',height:.85}],keys:[[-4,103.4,0],[2,103,1],[4,102.2,2.2],[SHOT,101.9,2.6],[12,101.9,2.6]]},
 {name:'Scholes',role:'eng',style:ENG({number:16,hair:[Y,.8],seed:36,build:{height:1.7}}),key:true,keys:[[-4,50,-1.5],[0,59,-.8],[1.5,67.2,1],[3,75.8,2.6],[4.5,85.6,3.6],[SHOT,88.6,3.8],[5.6,90.4,5],[7,93.3,10.6],[8.5,94.8,16],[12,94.6,22]]},
 {name:'Shearer',role:'eng',style:ENG({number:9,seed:37,build:{height:1.83,bulk:1.06}}),keys:[[-4,66,-11],[2,76.5,-9.5],[SHOT,91.5,-7],[7,94.4,5],[12,95.4,19]]},
 {name:'Beckham',role:'eng',style:ENG({number:7,hair:[Y,.9],hairStyle:'long',seed:38}),keys:[[-4,43.6,2.6],[-1.6,45.4,3.5],[-.9,45.9,3.8],[.5,47.5,4.4],[3,53,5.6],[12,64,7]]},
 {name:'Ince',role:'eng',style:ENG({number:4,hairStyle:'bald',seed:39,skin:[[R,.8],[Y,.35],[K,.1]]}),keys:[[-4,42,-6],[12,58,-3]]},
 {name:'Anderton',role:'eng',style:ENG({number:14,seed:40}),keys:[[-4,60,-25],[12,84,-21]]},
 {name:'Le Saux',role:'eng',style:ENG({number:3,hair:[Y,.8],seed:41}),keys:[[-4,38,-22],[12,54,-18]]},
 {name:'Simeone',role:'arg',style:ARG({number:8,hairStyle:'long',seed:42}),keys:[[-4,48.5,7.5],[0,50,7.2],[3,57,8],[12,70,7]]},
 {name:'Zanetti',role:'arg',style:ARG({number:22,seed:43}),keys:[[-4,53,21],[3,58,19],[12,74,15]]},
 {name:'Almeyda',role:'arg',style:ARG({number:5,hairStyle:'long',seed:44}),keys:[[-4,47,-4],[12,63,-2]]},
 {name:'Verón',role:'arg',style:ARG({number:11,hairStyle:'bald',seed:45}),keys:[[-4,51,-15],[12,67,-9]]},
 {name:'Ortega',role:'arg',style:ARG({number:10,seed:46}),keys:[[-4,41,12],[12,49,10]]},
 {name:'referee',role:'ref',style:REF_ST,keys:[[-4,58,-7],[4,76,-3.5],[12,87,-2]]},
];
const OWEN=0,CHAMOT=1,AYALA=2,ROA=4,SCHOLES=5,BECKHAM=7;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and gait phase (stride length grows with speed: jog ≈ 2.4 m per cycle, sprint ≈ 4.6 m) — built once */
const T0=-4,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],P:number[]=[],D:number[]=[];let ph=0,d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i){const dd=Math.hypot(x-px,z-pz),sp=dd/DT;ph+=dd/(2.2+2.4*clamp(sp/8));d+=dd;}X.push(x);Z.push(z);P.push(ph);D.push(d);px=x;pz=z;}return{X,Z,P,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const smooth=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau),b=posOf(k,tau-.3),d=posOf(k,tau-.6);return[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];};

// ---------------------------------------------------------------- the ball: Beckham's pass, the flick, one long knock per sprint stride, the shot
/** Owen's gait phase, aligned so his RIGHT foot reaches forward (runCycle phase ≈ .93) exactly at the first touch; every later stride's
 * reach is a knock-on with the same foot. */
const TOUCH_PH=.93;
const owenPhase=(tau:number)=>samp(TABLES[OWEN].P,tau)-samp(TABLES[OWEN].P,0)+TOUCH_PH;
const PASS=-.9,IN_NET=SHOT+.55;
/** the knock-ons: each sprint stride's right-foot reach after the flick, until the shot's approach */
const TOUCHES:number[]=(()=>{const out:number[]=[0];let prev=owenPhase(.4)-TOUCH_PH;
 for(let tau=.4;tau<SHOT-.5;tau+=DT){const ph=owenPhase(tau)-TOUCH_PH;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.45)out.push(tau);prev=ph;}
 return[...out,SHOT];})();
/** Owen's heading: facing Beckham's pass as it arrives, turning onto the run with the flick (the half-turn), then his run */
function yawOwen(tau:number):number{const m=posOf(OWEN,tau),b=posOf(BECKHAM,PASS),face=yawOf(b[0]-m[0],b[1]-m[1]),v=velOf(OWEN,tau),head=Math.hypot(v[0],v[1])>.5?yawOf(v[0],v[1]):face;
 if(tau<.45)return lerpA(face,yawOf(1,.25),sm(-.3,.45,tau,easeInOutSine));return head;}
const fwdR=(tau:number):[Pt,Pt]=>{const y=yawOwen(tau);return[[Math.cos(y),-Math.sin(y)],[Math.sin(y),Math.cos(y)]];};
/** the ball spot for his right boot: ahead and a touch to his right */
const footAt=(tau:number):[number,number]=>{const p=posOf(OWEN,tau),[f,r]=fwdR(tau);return[p[0]+f[0]*.5+r[0]*.13,p[1]+f[1]*.5+r[1]*.13];};
const TP=TOUCHES.map(footAt);
/** the far top corner (Roa's right, Owen's left) */
const NET:V3=[105.25,2.12,-3.05],REST:V3=[106.2,.11,-2.7];
function ballAt(tau:number):V3{
 if(tau<PASS){const x=posOf(BECKHAM,tau),v=velOf(BECKHAM,tau),l=Math.hypot(v[0],v[1])||1,tap=.35+.2*Math.abs(Math.sin(tau*5));return[x[0]+v[0]/l*tap,.11,x[1]+v[1]/l*tap];}
 if(tau<0){const x=ballAt(PASS-.0001),u=(tau-PASS)/-PASS,e=1-Math.pow(1-u,1.4);return[lerp(x[0],TP[0][0],e),.11,lerp(x[2],TP[0][1],e)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1])k++;const u=(tau-TOUCHES[k])/(TOUCHES[k+1]-TOUCHES[k]),e=1-Math.pow(1-u,3);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 const s0=TP[TP.length-1];
 if(tau<IN_NET){const u=(tau-SHOT)/(IN_NET-SHOT);return[lerp(s0[0],NET[0],u),lerp(.11,NET[1],u)+.45*Math.sin(Math.PI*u),lerp(s0[1],NET[2],u)];}
 // caught by the net, then drops to the grass inside the goal with a small bounce
 const e=tau-IN_NET,u=clamp(e/.6),fall=Math.max(.11,NET[1]-4.9*Math.max(0,e-.12)*Math.max(0,e-.12)),hop=e>.8?.14*Math.abs(Math.sin((e-.8)*8))*Math.exp(-(e-.8)*4):0;
 return[lerp(NET[0],REST[0],easeOut(u)),fall+hop,lerp(NET[2],REST[2],u)];
}
const bulgeAt=(tau:number)=>tau<IN_NET?0:Math.exp(-(tau-IN_NET)*2.2)*(1+.3*Math.sin((tau-IN_NET)*14));

// ---------------------------------------------------------------- poses (angles in degrees via posed; the athlete clamps to real range of motion)
const RAD=Math.PI/180;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** the first touch: half-turned, the outside of the right boot flicks the ball on (toes turned in, ankle locked), arms out for the turn */
const FLICK:Partial<Pose>={rHipF:34,rKnee:36,rAnk:24,rHipR:-34,rHipA:-6,lKnee:40,lHipF:16,lean:18,twist:-14,lShA:58,rShA:40,lElb:34,rElb:44,neckP:28,squash:-.04};
/** a knock-on at full speed: the right boot pushes through the ball, ankle firm, eyes down for an instant */
const KNOCK:Partial<Pose>={rAnk:30,rHipR:10,neckP:24};
/** the whole pose of actor k at τ, with its yaw */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),m=posOf(OWEN,tau),b=ballAt(tau);
 let yaw=sp>.45?yawOf(v[0],v[1]):yawOf(b[0]-x,b[2]-z);
 if(a.engage&&tau>a.engage[0]-.4&&tau<a.engage[1]+.4)yaw=lerpA(yaw,yawOf(m[0]-x,m[1]-z),Math.min(sm(a.engage[0]-.4,a.engage[0],tau),1-sm(a.engage[1],a.engage[1]+.4,tau)));
 if(a.role==='gk')yaw=yawOf(b[0]-x,b[2]-z);
 if(k===OWEN)yaw=yawOwen(tau);
 const fx=Math.cos(yaw),fz=-Math.sin(yaw),along=v[0]*fx+v[1]*fz;
 let p:Pose;
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='arg'?READY:stand();
 if(k===OWEN){// the sprint: a full runCycle at speed (high knees, big arm drive), right-foot knock-ons on the stride's reach
  const s=clamp((sp-2)/5),run=runCycle(owenPhase(tau),{speed:.35+.65*s});p=blendPose(idle,run,clamp((sp-.3)/1.2));
  p=over(p,FLICK,bump(-.3,.3,tau));
  for(const T of TOUCHES)if(T>0&&T<SHOT)p=over(p,KNOCK,bump(T-.14,T+.14,tau));
  const D=.85,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.5)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.85}),Math.min(sm(0,.14,u),1-sm(1.05,1.5,u)));
  if(tau>IN_NET+.3)p=blendPose(p,celebrate(tau*.9,{kind:'run'}),sm(IN_NET+.3,IN_NET+.8,tau));
 }
 else if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(samp(TABLES[k].D,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(samp(TABLES[k].P,tau),{speed:s}),clamp((sp-.5)/.9));}
 for(const mv of a.moves??[]){const t0=mv.at-(mv.kind==='dive'?.55:.6)*mv.dur,u=(tau-t0)/mv.dur;
  if(mv.kind==='lunge'&&u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:mv.side}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));
  if(mv.kind==='dive'&&u>0){p=keeperDive(Math.min(1,u),{side:mv.side,height:mv.height??.5});yaw=yawOf(-1,0);}}
 if(k===SCHOLES&&tau>SHOT-.6&&tau<SHOT+.4)p=over(p,{lShA:60,rShA:30,neckP:18,neckY:-20},bump(SHOT-.6,SHOT+.4,tau));// Scholes arrives, ready to shoot too
 if(k===SCHOLES&&tau>IN_NET+.2)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(IN_NET+.2,IN_NET+.7,tau));
 if(k===BECKHAM&&tau>PASS-.45&&tau<PASS+.5){const u=clamp((tau-(PASS-.4))/.8);p=blendPose(p,strike(.25+u*.55,{foot:'r',power:.35}),bump(PASS-.45,PASS+.5,tau));}
 return{p,yaw};
}

// ---------------------------------------------------------------- the ball print: the 1998 "Tricolore" (paper, blue triads with red accents)
function ball(s:Sheet,x:number,y:number,r:number,rot:number){
 const pts=blob(x,y,r,r,3,{amp:.02,n:32}),disc=polyPath(pts,true);s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,(()=>{const p=new Path2D();p.arc(x,y,r*1.05,0,TAU);p.moveTo(x-r*.28+r*1.2,y-r*.3);p.arc(x-r*.28,y-r*.3,r*1.2,0,TAU,true);return p;})(),.4);
 const pan=new Path2D(),acc=new Path2D(),tri=(cx:number,cy:number,pr:number,a0:number,into:Path2D)=>{const q:Pt[]=[];for(let i=0;i<3;i++){const a=a0+i/3*TAU,b=a+TAU/6;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr],[cx+Math.cos(b)*pr*.42,cy+Math.sin(b)*pr*.42]);}into.addPath(polyPath(q,true));};
 tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.34,rot,pan);
 for(let i=0;i<5;i++){const a=rot+Math.PI/5+i/5*TAU;tri(x+Math.cos(a)*r*.86,y+Math.sin(a)*r*.86,r*.3,a,pan);}
 s.fill(B,pan,.95);
 if(r>9){tri(x+Math.cos(rot)*r*.15,y+Math.sin(rot)*r*.15,r*.14,rot,acc);s.fill(R,acc,.95);}
 s.restore();
 s.fill(K,ribbon(pts,Math.max(2.5,r*.08),{seed:4,close:true,pressure:.4,wobble:r*.015}),.95);
 if(r>14)s.knockout(polyPath(blob(x-r*.42,y-r*.44,r*.14,r*.09,5,{amp:.05,n:10}),true));
}

// ---------------------------------------------------------------- drawing the match through a camera
type CastE={k:number;x:number;z:number;g:Pt;h:number;d:number};
type PlayOut={list:CastE[];bg:Pt|null;br:number;hero?:DrawResult};
/** everything on the pitch at τ (positions on ones, poses on twos at τp; τprev = the drawing before, for secondary motion) */
function play(s:Sheet,c:Cam,v:View,tau:number,tauP:number,tauPrev:number,o:{minBall?:number;hero?:boolean;after?:(r:PlayOut)=>void;before?:()=>void}={}):PlayOut{
 const{minBall=6,hero=false}=o;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!s._passage.pending;
 const list:CastE[]=[];
 ACTORS.forEach((_,k)=>{const[x,z]=posOf(k,tau),q=toCam(c,[x,.9,z]);if(q[2]<3)return;/* a player brushing the lens would print as a cropped blob */const g=scr(c,toCam(c,[x,0,z])),h=c.F*1.85/q[2];if(!inView(v,g,h*1.2)&&!inView(v,[g[0],g[1]-h],h))return;list.push({k,x,z,g,h,d:q[2]});});
 const b=ballAt(tau),bq=toCam(c,b),bg=bq[2]>=NEAR?scr(c,bq):null,br=bg?Math.max(minBall,c.F*.11/bq[2]):0,bground=pr(c,[b[0],0,b[2]]);
 // small ground shadows batched in one op (long-ish: low evening light plus floodlights); big figures cast their own through the athlete
 const sh=new Path2D();for(const e of list)if(e.h<420)sh.addPath(polyPath(blob(e.g[0]+e.h*.04,e.g[1],e.h*.16,e.h*.035,ACTORS[e.k].style.seed??1,{amp:.05,n:14}),true));
 if(bground&&bg)sh.addPath(polyPath(blob(bground[0],bground[1],br*.8,br*.25,2,{amp:.05,n:12}),true));s.tone(K,sh,.42);
 o.before?.();
 list.sort((p,q)=>q.d-p.d);
 const drawBall=()=>{if(bg)ball(s,bg[0],bg[1],br,Math.hypot(b[0],b[2])/.11);};
 let ballDone=!list.length||bq[2]>=list[0].d,heroR:DrawResult|undefined;if(ballDone)drawBall();
 for(const e of list){if(!ballDone&&bq[2]>=e.d){drawBall();ballDone=true;}
  const a=ACTORS[e.k],{p,yaw}=poseOf(e.k,tauP),px=e.h*ppu,big=e.h>=300;
  // phone heat: low detail for small figures and extras; during a passage only Owen keeps 'mid'
  const detail=passing?(e.k===OWEN?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
  let prev:{pose:Pose;place:Place}|undefined;
  if(big&&(e.k===OWEN||e.h>520)&&!passing){const q=poseOf(e.k,tauPrev),[qx,qz]=posOf(e.k,tauPrev);prev={pose:q.p,place:{x:qx,z:qz,yaw:q.yaw}};}
  const r=drawPlayer(s,p,c,{...a.style,shadow:e.h<420?false:undefined,detail},{x:e.x,z:e.z,yaw},{prev,smear:hero&&e.k===OWEN&&!!prev});
  if(e.k===OWEN)heroR=r;}
 if(!ballDone)drawBall();
 const out={list,bg,br,hero:heroR};
 o.after?.(out);
 return out;
}
/** a broadcast speed streak (the replay wipe / the camera dragged by the sprint): long halftone strokes across the frame */
function streaks(s:Sheet,v:View,amt:number,seed:number,dir=0){if(amt<=.02)return;const p=new Path2D(),r=rng(seed);
 for(let i=0;i<16;i++){const y=(r()-.5)*2*v.hy,x0=(r()-.5)*2*v.hx,L=v.hx*(.6+r()*.9);p.addPath(ribbon([[x0-L*Math.cos(dir),y-L*Math.sin(dir)],[x0+L*Math.cos(dir),y+L*Math.sin(dir)]],12+r()*30,{seed:seed+i,taper:.8,wobble:1.5}));}
 s.tone(K,p,.55*amt);s.knockout(p,.35*amt);}

// ---------------------------------------------------------------- teaching marks, shared by the replays and the lesson
/** a ring on the grass round a ground point (metres), ribbon width in metres */
function groundRing(s:Sheet,c:Cam,x:number,z:number,rx:number,rz:number,wm:number,ink:string,w:number,seed=7){if(w<=0)return;
 const pts:Pt[]=[];for(let i=0;i<36;i++){const q=pr(c,[x+Math.cos(i/36*TAU)*rx,0,z+Math.sin(i/36*TAU)*rz]);if(q)pts.push(q);}if(pts.length<30)return;
 const q=toCam(c,[x,0,z]);if(q[2]<NEAR)return;const rr=ribbon(pts,Math.max(5,c.F*wm/q[2]),{close:true,seed,taper:0,wobble:1});s.knockout(rr,.9*w);s.fill(ink,rr,.95*w);}
/** an arrow on the grass along ground points (metres) */
function groundArrow(s:Sheet,c:Cam,pts3:[number,number][],wm:number,ink:string,w:number,seed=61){if(w<=0)return;
 const pts:Pt[]=[];let d=1;for(const [x,z] of pts3){const q=toCam(c,[x,.02,z]);if(q[2]<1)continue;pts.push(scr(c,q));d=q[2];}if(pts.length<2)return;
 const n=Math.max(2,Math.round(pts.length*clamp(w))),seg=pts.slice(0,n),wd=c.F*wm/d;
 s.knockout(ribbon(seg,wd*1.7,{seed,taper:.1,wobble:.8}),.8);s.fill(ink,ribbon(seg,wd,{seed,taper:.1,wobble:.8}),.95);
 const a=seg[seg.length-2],b=seg[seg.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.01,b[1]+(b[1]-a[1])*.01],wd,{seed:seed+1,head:wd*3});}
/** the space in front of him: a yellow lane on the grass from the ball toward the goal (grows with w) */
function spaceLane(s:Sheet,c:Cam,tau:number,w:number,len=9){if(w<=0)return;const b=ballAt(tau),v=velOf(OWEN,tau),l=Math.hypot(v[0],v[1])||1,dx=v[0]/l,dz=v[1]/l,nx=-dz,nz=dx,L=len*easeOut(clamp(w)),W=2.1;
 const q=polyP(c,[[b[0]+nx*W*.6,.01,b[2]+nz*W*.6],[b[0]+dx*L+nx*W,.01,b[2]+dz*L+nz*W],[b[0]+dx*L-nx*W,.01,b[2]+dz*L-nz*W],[b[0]-nx*W*.6,.01,b[2]-nz*W*.6]]);
 if(q.length<3)return;const p=polyPath(q,true);s.knockout(p,.35*w);s.tone(Y,p,.7*w);}
/** "ball out in front": a dashed tether from his right boot to the ball, and a ring on the ball */
function tether(s:Sheet,hero:DrawResult|undefined,bg:Pt|null,br:number,w:number){if(!hero||!bg||w<=0)return;const toe=hero.joints.rToe;
 const gaps:[number,number][]=[];for(let x=.08;x<1;x+=.16)gaps.push([x,x+.08]);const rb=ribbon([toe,bg],Math.max(4,br*.28),{seed:81,taper:0,wobble:.6,gaps});s.knockout(rb,.8*w);s.fill(Y,rb,.95*w);
 const pts:Pt[]=[];for(let i=0;i<26;i++){const a=i/26*TAU;pts.push([bg[0]+Math.cos(a)*br*1.7,bg[1]+Math.sin(a)*br*1.7]);}s.fill(Y,ribbon(pts,Math.max(4,br*.3),{seed:82,close:true,taper:0,wobble:.8}),.95*w);}
/** speed lines streaming off a runner, drawn in screen space behind him */
function runLines(s:Sheet,c:Cam,x:number,z:number,w:number,seed=9){if(w<=0)return;const q=pr(c,[x,1,z]),q2=pr(c,[x+1,1,z]);if(!q||!q2)return;const dir=Math.atan2(q2[1]-q[1],q2[0]-q[0]),zz=c.F/Math.max(1,toCam(c,[x,1,z])[2]);
 for(let k=0;k<3;k++){const oy=zz*(-.55+k*.45),a:Pt=[q[0]-Math.cos(dir)*zz*(.7+k*.2),q[1]+oy],b:Pt=[q[0]-Math.cos(dir)*zz*(1.9+k*.45),q[1]+oy];s.fill(K,ribbon([a,b],zz*.05,{seed:seed+k,taper:.9,wobble:.5}),.6*w);}}

// ---------------------------------------------------------------- 1 · live: the high main-stand camera, near real time
/** τ from chapter-1 time, keyed to the cue words (the move between "Beckham passes" and "goal" plays at ~0.8–1.4× real time) */
const tau1=(t:number)=>{const bp=CUEW(0,'Beckham passes'),G=CUEW(0,'goal');return key(t,mono([[0,Math.max(T0,PASS-bp-.1)],[bp,PASS],[CUEW(0,'Michael Owen'),-.05],[CUEW(0,'He knocks'),.35],[CUEW(0,'past one'),1.1],[CUEW(0,'races past'),3.1],[CUEW(0,'and shoots'),SHOT-.15],[G,IN_NET-.05],[SECS(0)+1,IN_NET-.05+SECS(0)+1-G]]),linear);};
const CAM1:V3=[60,25,74];
function cam1(t:number):Cam{
 const bp=CUEW(0,'Beckham passes'),G=CUEW(0,'goal'),S=SECS(0),tau=tau1(t);
 const bs=(u:number):V3=>{const b=ballAt(u);return[b[0],0,b[2]];},b0=bs(tau),b1=bs(tau-.35),b2=bs(tau-.7),bt:V3=[(b0[0]+b1[0]+b2[0])/3,0,(b0[2]+b1[2]+b2[2])/3];
 // opens wide on the ground and the crowd, finds the ball as Beckham passes, leads the sprint a little, settles on the celebration
 const open:V3=[62,7,-14],m=posOf(OWEN,tau),cel:V3=[m[0]-1.5,1.1,m[1]];
 const toBall=sm(0,bp-.1,t,easeInOutSine),toO=sm(G+.4,G+1.4,t,easeInOutSine),lead=sm(CUEW(0,'He knocks'),CUEW(0,'races past'),t)*(1-sm(CUEW(0,'and shoots')-.3,G,t));
 const tb:V3=[lerp(open[0],bt[0]+3.5*lead,toBall),lerp(open[1],2.3,toBall),lerp(open[2],lerp(bt[2],0,.25),toBall)],T=lerp3(tb,cel,toO);
 const F=key(t,mono([[0,1650],[bp-.2,4400],[CUEW(0,'He knocks'),4700],[CUEW(0,'races past'),5000],[CUEW(0,'and shoots'),5500],[G,5900],[G+1.4,6700],[S,7000]]),easeInOutSine);
 return look(CAM1,T,F);
}
const ch1:Scene={
 draw(s,t){
  const v=frame(s),c=cam1(t),tau=tau1(t),tp=tau1(twos(t)),G=CUEW(0,'goal');
  stadium(s,c,v,t,{roar:sm(G+.1,G+.6,t),flash:sm(G+.2,G+.45,t)});
  ground(s,c,{bulge:bulgeAt(tau),ballZ:NET[2],ballY:NET[1]});
  play(s,c,v,tau,tp,tau1(twos(t)-1/12),{minBall:9});
 },
 aperture(t){const c=cam1(t),[x,z]=posOf(OWEN,tau1(t)),q=toCam(c,[x,1,z]),g=scr(c,q),h=c.F*1.65/q[2];return apertureDisc(g[0],g[1]-h*.1,Math.max(6,h*.09),12);},
 still:9.5,
};

// ---------------------------------------------------------------- 2 · slow replay, low touchline camera running with him: the touch into space, full speed, Ayala backs off
const tau2=(t:number)=>key(t,mono([[0,-.75],[CUEW(1,'His first'),-.12],[CUEW(1,'pushes'),.2],[CUEW(1,'into space'),.8],[CUEW(1,'full speed'),1.55],[CUEW(1,'the defender'),2.35],[CUEW(1,'back away'),2.85],[SECS(1),3.75]]),linear);
function cam2(t:number):Cam{
 const tau=tau2(t),m=smooth(OWEN,tau),open=1-sm(0,1.2,t,easeInOutSine),push=sm(CUEW(1,'His first')-.3,CUEW(1,'pushes'),t,easeInOutSine)*(1-sm(CUEW(1,'into space')-.1,CUEW(1,'into space')+.6,t));
 // on "full speed" the camera is dragged: it falls a beat behind and Owen pulls ahead in the frame; on "the defender" it widens to show Ayala
 const drag=sm(CUEW(1,'full speed')-.2,CUEW(1,'full speed')+.4,t,easeInOutSine)*(1-sm(CUEW(1,'the defender')-.2,CUEW(1,'the defender')+.5,t,easeInOutSine)),wide=sm(CUEW(1,'the defender')-.3,CUEW(1,'back away')+.3,t,easeInOutSine);
 const C:V3=[m[0]-2.2-2.5*drag-1.2*wide+1.5*open,1.35+.35*open+.4*wide,m[1]+9.2+3*open-2.4*push+4.6*wide],T:V3=[m[0]+1.6+1.6*drag+4.4*wide,.85-.15*push,m[1]-.4-.6*wide];
 return look(C,T,2700+650*push-300*wide-350*open);
}
const ch2:Scene={
 draw(s,t){
  const v=frame(s),c=cam2(t),tau=tau2(t),tp=tau2(twos(t)),ft=CUEW(1,'His first'),pu=CUEW(1,'pushes'),is=CUEW(1,'into space'),fs=CUEW(1,'full speed'),de=CUEW(1,'the defender'),ba=CUEW(1,'back away'),E=SECS(1);
  stadium(s,c,v,t);
  ground(s,c);
  const endFade=1-sm(E-1,E-.65,t);
  play(s,c,v,tau,tp,tau2(twos(t)-1/12),{minBall:5,hero:true,before:()=>{
   // "pushes the ball ahead": a yellow arrow on the grass from his boot along the ball's path (the flick past Chamot)
   const pw=sm(pu-.2,pu+.4,t,easeOut)*(1-sm(fs-.2,fs+.2,t));if(pw>0){const pts:[number,number][]=[];for(let i=0;i<=10;i++){const b=ballAt(lerp(0,TOUCHES[1],i/10));pts.push([b[0],b[2]]);}groundArrow(s,c,pts,.16,Y,pw,61);}
   // "into space": the empty lane in front of him lights up
   spaceLane(s,c,tau,sm(is-.2,is+.5,t,easeOutBack)*(1-sm(de-.3,de+.2,t))*endFade,10);
   // "the defender": a red ring under Ayala; "back away": a red arrow on the grass pointing back toward his own goal
   const[ax,az]=posOf(AYALA,tau);groundRing(s,c,ax,az,.8,.8,.1,R,sm(de-.15,de+.3,t,easeOutBack)*endFade,17);
   groundArrow(s,c,[[ax-.4,az],[ax+.8,az],[ax+2,az],[ax+3.2,az]],.14,R,sm(ba-.15,ba+.45,t,easeOut)*endFade,71);}
  ,after:({hero,bg})=>{
   // "His first touch": a yellow spark on the outside of his right boot
   const age=t-ft;if(hero&&age>-.15&&age<.55&&bg)sparkBurst(s,Y,bg[0],bg[1],c.F*.5/Math.max(1,toCam(c,ballAt(tau))[2]),{n:8,seed:83,g:easeOutBack(clamp((age+.15)/.2))*(1-clamp((age-.3)/.25)),width:9});
   // "full speed": speed lines stream off him
   const[ox,oz]=posOf(OWEN,tau);runLines(s,c,ox,oz,sm(fs-.1,fs+.35,t)*(1-sm(de+.2,de+.6,t)),9);}});
  // the replay wipe as the chapter opens; the camera dragged by the sprint
  streaks(s,v,1-sm(0,.5,t),21);streaks(s,v,.6*bump(fs-.2,fs+.9,t),27,.02);
 },
 aperture(t){const c=cam2(t),b=ballAt(tau2(t)),q=toCam(c,b),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.1/q[2]),12);},
 still:4.6,
};

// ---------------------------------------------------------------- 3 · replay from behind Owen's shoulder: Scholes alongside, the shot across Roa, the far top corner
const tau3=(t:number)=>{const el=CUEW(2,'England lead');return key(t,mono([[0,3.55],[CUEW(2,'runs alongside'),4.25],[CUEW(2,'Owen shoots'),SHOT-.1],[CUEW(2,'across the keeper'),SHOT+.22],[CUEW(2,'far top corner'),IN_NET+.05],[el,IN_NET+.7],[SECS(2),IN_NET+.7+(SECS(2)-el)*.8]]),linear);};
const swing3=(t:number)=>{const a=CUEW(2,'England lead');return sm(a-.3,a+.9,t,easeInOutSine);};
function cam3(t:number):Cam{
 const tau=tau3(t),u=swing3(t),m=smooth(OWEN,Math.min(tau,SHOT)),e=sm(SHOT-.2,IN_NET,tau,easeInOutSine),cel=smooth(OWEN,tau);
 // behind Owen, between him and Scholes (Ayala, beaten on the outside, trails off to the right): Scholes on the left of frame, the goal and Roa ahead; on the shot it holds and turns to the far top corner
 const C0:V3=[m[0]-10.5,3,m[1]-2.6],T0:V3=lerp3([m[0]+7,1.1,m[1]-1.2],[104,1.6,-.2],e);
 const C1:V3=[cel[0]+5.5,2.6,cel[1]+7.5],T1:V3=[cel[0]-.5,1.1,cel[1]-.5];
 return look(lerp3(C0,C1,u),lerp3(T0,T1,u),lerp(2250+600*e,2500,u));
}
const ch3:Scene={
 draw(s,t){
  const v=frame(s),c=cam3(t),tau=tau3(t),tp=tau3(twos(t)),ps=CUEW(2,'Paul Scholes'),ra=CUEW(2,'runs alongside'),os=CUEW(2,'Owen shoots'),ak=CUEW(2,'across the keeper'),fc=CUEW(2,'far top corner'),el=CUEW(2,'England lead'),u=swing3(t),E=SECS(2);
  stadium(s,c,v,t,{roar:sm(IN_NET,IN_NET+.3,tau),flash:sm(el-.2,el+.3,t)*(1-sm(E-1.2,E-.6,t))});
  ground(s,c,{goalLater:u<.5});
  const hide=1-sm(el-.4,el,t);
  play(s,c,v,tau,tp,tau3(twos(t)-1/12),{minBall:5,hero:true,before:()=>{
   // "Paul Scholes": a yellow ring under his teammate; "runs alongside": two lanes side by side on the grass
   const[sx,sz]=posOf(SCHOLES,tau),[ox,oz]=posOf(OWEN,tau);groundRing(s,c,sx,sz,.8,.8,.1,Y,sm(ps-.1,ps+.35,t,easeOutBack)*(1-sm(os-.3,os,t)),27);
   const lw=sm(ra-.1,ra+.5,t,easeOut)*(1-sm(os-.3,os,t));if(lw>0){groundArrow(s,c,[[sx-3,sz],[sx-1,sz],[sx+1.2,sz]],.12,Y,lw,91);groundArrow(s,c,[[ox-3,oz],[ox-1,oz],[ox+1.2,oz]],.12,Y,lw,93);}}
  ,after:({hero})=>{
   // "Owen shoots": the strike spark at the boot
   const age=tp-SHOT;if(hero&&age>-.05&&age<.3){const b=ballAt(SHOT),q=pr(c,b);if(q)sparkBurst(s,Y,q[0],q[1],c.F*.9/Math.max(1,toCam(c,b)[2]),{n:10,seed:58,g:1-sm(.12,.3,age),width:12});}
   // "across the keeper": the dotted flight of the ball across Roa
   const fw=sm(ak-.4,ak,t)*hide;if(fw>0&&tau>SHOT){const dots=new Path2D();for(let i=0;i<=18;i++){const tt=SHOT+(Math.min(tau,IN_NET)-SHOT)*i/18,q=pr(c,ballAt(tt));if(!q)continue;const r=Math.max(4,c.F*.05/Math.max(1,toCam(c,ballAt(tt))[2]));dots.moveTo(q[0]+r,q[1]);dots.arc(q[0],q[1],r,0,TAU);}s.fill(K,dots,.7*fw);}
  }});
  if(u<.5)goal3(s,c,105,1,bulgeAt(tau),NET[2],NET[1]);
  // "far top corner": a yellow target square in the corner of the goal frame, pulsing as the ball arrives
  const tw=sm(fc-.6,fc,t,easeOutBack)*hide;if(tw>0){const q=polyP(c,[[105,1.55,-3.55],[105,2.36,-3.55],[105,2.36,-2.5],[105,1.55,-2.5]]);if(q.length>2){const p=polyPath(q,true),pulse=1+.25*bump(fc,fc+.5,t);s.fill(Y,ribbon([...q,q[0]],Math.max(5,8*pulse),{seed:5,taper:0,wobble:.8}),.95*tw);s.tone(Y,p,.3*tw);}}
  streaks(s,v,1-sm(0,.45,t),33);
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(OWEN,tau3(t)),q=toCam(c,[x,1.25,z]),g=scr(c,q);return apertureDisc(g[0],g[1],Math.max(8,c.F*.16/q[2]),12);},
 still:4.2,
};

// ---------------------------------------------------------------- 4 · the lesson: a low side-on camera on the run at Ayala (space, full speed, ball out in front)
const tau4=(t:number)=>key(t,mono([[0,.95],[CUEW(3,'when you'),1.2],[CUEW(3,'run at'),1.75],[CUEW(3,'full speed'),2.2],[CUEW(3,'the ball out'),2.6],[SECS(3),3.35]]),linear);
function cam4(t:number):Cam{
 const tau=tau4(t),m=smooth(OWEN,tau),ra=sm(CUEW(3,'run at')-.3,CUEW(3,'run at')+.5,t,easeInOutSine),bo=sm(CUEW(3,'the ball out')-.3,CUEW(3,'the ball out')+.4,t,easeInOutSine)*(1-sm(SECS(3)-1.2,SECS(3),t,easeInOutSine));
 const C:V3=[m[0]+1.6+2.6*ra-1.6*bo,1.15+.5*ra-.3*bo,m[1]+8.2+4*ra-3*bo],T:V3=[m[0]+1.8+3.8*ra-2*bo,.8-.1*bo,m[1]-.3];
 return look(C,T,2350-300*ra+550*bo);
}
const ch4:Scene={
 draw(s,t){
  const v=frame(s),c=cam4(t),tau=tau4(t),tp=tau4(twos(t)),yt=CUEW(3,'Your turn'),wy=CUEW(3,'when you'),ra=CUEW(3,'run at'),fs=CUEW(3,'full speed'),bo=CUEW(3,'the ball out'),E=SECS(3);
  stadium(s,c,v,t);
  ground(s,c);
  const[ox,oz]=posOf(OWEN,tau),[ax,az]=posOf(AYALA,tau);
  play(s,c,v,tau,tp,tau4(twos(t)-1/12),{minBall:5,hero:true,before:()=>{
   // "Your turn": a yellow ring lands under Owen; "when you have space": the empty lane ahead opens
   groundRing(s,c,ox,oz,.9,.9,.1,Y,sm(yt-.1,yt+.35,t,easeOutBack)*(1-sm(wy+.4,wy+.8,t)),37);
   spaceLane(s,c,tau,sm(wy-.1,wy+.6,t,easeOutBack)*(1-sm(E-1,E-.5,t)),8);
   // "run at defenders": a red arrow on the grass straight at Ayala (who has to back off)
   groundArrow(s,c,[[ox+.6,oz],[lerp(ox,ax,.5),lerp(oz,az,.5)],[ax-.9,az]],.14,R,sm(ra-.1,ra+.5,t,easeOut)*(1-sm(bo-.1,bo+.3,t)),41);}
  ,after:({hero,bg,br})=>{
   runLines(s,c,ox,oz,sm(fs-.1,fs+.35,t)*(1-sm(E-1,E-.5,t)),19);
   // "the ball out in front of you": a ring on the ball and a dashed tether back to the boot that just knocked it
   tether(s,hero,bg,br,sm(bo-.1,bo+.35,t,easeOutBack)*(1-sm(E-.8,E-.3,t)));}});
 },
 still:5,
};

const film:RisoStory={
 id:'owen-argentina-1998',format:'11v11',title:"Owen's solo goal v Argentina",theme:'Running with the ball: in space, run at defenders at full speed with the ball out in front',
 ageNote:'World Cup round of 16, Argentina v England, Stade Geoffroy-Guichard, Saint-Étienne, 30 June 1998. Owen was 18.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.45},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(film,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a floodlight flare — a warm glow pops at the point and a paper streak whips off it like a sprint. Reduced motion: the still glow. */
 touch(s,x,y,age,seed){
  const g=age<=0?1:easeOutBack(clamp(age/.2))*(1-clamp((age-.45)/.35));if(g<=0)return;
  glowDisc(s,Y,x,y,70*g,{steps:3,glow:1,seed});
  if(age>0&&age<.7){const r=rng(seed),d=r()*TAU,L=180*easeOut(clamp(age/.4));for(let k=0;k<3;k++){const oy=(k-1)*22;s.fill(R,ribbon([[x+Math.cos(d)*20,y+Math.sin(d)*20+oy],[x+Math.cos(d)*(20+L),y+Math.sin(d)*(20+L)+oy]],10,{seed:seed+k,taper:.9,wobble:.5}),.9*(1-clamp(age/.7)));}}
  if(age<.35)sparkBurst(s,Y,x,y,110,{n:8,seed:seed+1,g:age<=0?1:easeOutBack(clamp(age/.15))*(1-clamp((age-.2)/.15)),width:14});
 },
};
export default film;
