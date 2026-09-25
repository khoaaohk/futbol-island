/** Iconic play film: Nico Williams, signature: the burst of speed on the wing. The opening goal of the UEFA Euro 2024 final, Spain 2–1
 * England, Olympiastadion, Berlin, Sunday 14 July 2024 (21:00 CEST, "partly cloudy night"): Williams 47'.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/nico-williams-signature/script.json. The lead voices it later with local Kokoro. Until then every
 * chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/nico-williams-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/nico-williams-signature/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * WHY THIS MOMENT (lib/town/iconicPlays.json: kind "signature", "the burst of speed on the wing", from the left, lesson "Knock the ball past
 * the defender and win the race with your speed"): it is the best-documented moment of his career — the opening goal of a European final,
 * scored after a sprint in from the LEFT wing into space, and it made him the final's Player of the Match. Written sources describe the run
 * and the finish, not a knock-past, so the live and replay chapters show only what happened (the burst into space, winning the race to the
 * ball), and the lesson chapter is a duotone diagram of the entry's lesson (knock it past, win the race), not a claim about this goal.
 *
 * SOURCES (fetched Sept 2026 with curl + a generic UA, cached under the session scratchpad films/src-cache/; the footage was not reviewed):
 *  - Wikipedia, "UEFA Euro 2024 final" (raw; cache wiki-euro2024-final.txt): 14 July 2024, 21:00 CEST, Olympiastadion Berlin, 65,600,
 *    referee François Letexier; Williams 47', Palmer 73', Oyarzabal 86'; "Yamal got behind Shaw before moving inside and advancing; he
 *    crossed low to an on-running Williams, who scored in the 47th minute with a low shot to the right corner"; "Olmo had made a more
 *    central run, which opened space for Williams"; Rodri off at half-time for Zubimendi; Player of the Match Nico Williams; line-ups and
 *    shirt numbers; kits from UEFA's line-up sheet: Spain red shirts, blue shorts, red socks; England white shirts, navy-blue shorts, white
 *    socks. https://en.wikipedia.org/wiki/UEFA_Euro_2024_final
 *  - The Guardian live blog, Rob Smyth / Will Unwin, 14 July 2024 (cache guardian-esp-eng-2024-final-live-p47.txt): "Lamine Yamal got behind
 *    Shaw for the first time and shuffled infield, hugging the ball on his left foot ... Eventually guided the ball across the area to the
 *    unmarked Williams, who calmly swept it past Pickford on the run ... Dani Olmo, whose off-the-ball run distracted Walker and meant
 *    Williams had just enough space to score"; "The flying wingers combine"; the second-half teams (Spain 4-2-3-1 with Williams on the left;
 *    England with Walker, Stones, Guéhi, Shaw, Mainoo, Rice, Saka, Foden, Bellingham, Kane)
 *    https://www.theguardian.com/football/live/2024/jul/14/spain-v-england-euro-2024-final-live-score-updates
 *  - Wikipedia, "Nico Williams" (raw; cache wiki-nico-williams.txt): "a low left-footed shot following a pass from fellow winger Lamine
 *    Yamal"; "recognised for his speed and dribbling skills"; his Euro 2024 goals (Georgia 30 June, England 14 July, shirt 17).
 *    https://en.wikipedia.org/wiki/Nico_Williams
 * CONFIRMED by those accounts: the match, date, ground, kick-off, the 47th minute (just after half-time), 1–0; Yamal beat Shaw on the RIGHT,
 *  came inside with the ball on his left foot and passed low across the area; Williams, unmarked, arriving on the run from the left, scored
 *  with a LOW LEFT-FOOTED shot into the RIGHT-hand corner past Pickford; Olmo's central run drew Walker; Williams was Player of the Match;
 *  shirts: Williams 17, Yamal 19, Olmo 10, Morata 7, Fabián 8, Zubimendi 18, Cucurella 24, Carvajal 2; Pickford 1, Walker 2, Shaw 3, Rice 4,
 *  Stones 5, Guéhi 6, Saka 7, Kane 9, Bellingham 10, Foden 11, Mainoo 26; KITS: Spain red / dark-blue shorts / red socks, England white /
 *  navy shorts / white socks.
 * INFERRED / ILLUSTRATIVE: every position, speed and timing in metres and seconds (Williams sprinting ≈ 8 m/s from ≈ 45 m out, the shot from
 *  ≈ 14 m, left of the penalty spot); that he struck it first time (sources say "on the run"; the narration says only that); Yamal's pass
 *  with the LEFT foot (sources: the ball on his left foot); Pickford's low dive to his left; where Saka, Rice, Mainoo, Stones, Guéhi and the
 *  others stood; Pickford's keeper kit (printed yellow; not named); Spain's yellow numbers and trim; England's navy trim; hair styles (Williams
 *  drawn with curly hair); Spain attacking left-to-right on the main camera (so Yamal's right flank is the near side and Williams' left flank
 *  the far side); the celebration (a run toward the far touchline); the Olympiastadion drawn as a sunken oval bowl with the blue running
 *  track and a roof ring open over the Marathon Gate end, under a night sky; crowd colours; camera placements and lenses; no referee drawn.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): ONE simulation on a real clock τ (seconds,
 * τ = 0 Yamal's pass leaves his boot): ch1 = the high main-stand camera, live (Yamal beats Shaw, the sprint in from the left wing, the pass
 * across, the finish on the run, the net); ch2 = the slow-motion replay, low from behind Williams' run (Olmo pulls Walker away, the burst into
 * the space, the left foot, the far corner); ch3 = the replay from behind the goal (past Pickford, then the celebration: Player of the Match);
 * ch4 = a duotone lesson on its own small clock (knock the ball past the defender, win the race). Seams are forward passages into the ball.
 * Contact reads the solved skeleton's LEFT toe, so the ball and the boot always meet (the pass and the shot).
 * Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Framing: world centred on the CANVAS centre (never sheet.safe) with a
 * lens that widens for a square window. Inks: yellow (light, grass with blue, Spain trim), red (Spain, skin), blue (track, grass, sky), navy
 * (key line, shorts). Poses on twos, cameras on ones; all randomness is seeded. Budget ≈ 150–260 plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,blendPose,runCycle,stand,strike,dribble,backpedal,celebrate,keeperSet,keeperDive,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type DrawResult,type Detail} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame() (aperture() reuses the last value) */
let LENS=1;
/** Frame the FULL sheet: world (0,0) on the canvas centre (card window 1.45:1 … square), ignoring safe. dx,dy = camera shake (units). */
function frame(s:Sheet,dx=0,dy=0){const S=s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,1/s.fit,0);LENS=Math.pow(Math.min(1,s.W/1620),.6);}
const pxPer=(s:Sheet)=>{const m=s.getTransform();return Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))/s.dpr;};

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`nico film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py nico-williams-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/nico-williams-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Berlin, live','Berlin, 2024, the Euro final. Spain, in red, play England. Lamine Yamal gets behind his man on the right. Nico Williams bursts from the left wing. Yamal slides it across... Nico sweeps it in on the run! Goal!',
  ['Berlin','Spain, in red','England','Lamine Yamal','on the right','Nico Williams bursts','from the left wing','Yamal slides','sweeps it in','on the run','Goal']),
 prov('Watch again','Watch again, slowly. Olmo runs inside, pulling a defender away. Nico sprints into the space and hits it low, left foot, into the far corner.',
  ['Watch again','slowly','Olmo runs inside','pulling a defender away','Nico sprints','the space','left foot','far corner']),
 prov('Behind the goal','From behind the goal: past Pickford! Nico was player of the match.',
  ['From behind','past Pickford','Nico was','player of the match']),
 prov('Your turn','Your turn: knock the ball past the defender, and win the race with your speed.',
  ['Your turn','knock the ball','past the defender','win the race','your speed']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`nico film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; goal line x = 0, net toward +x, pitch to x = −105) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
/** a camera from position, look point and focal length F (sheet units; widened by LENS for a square window) */
const cam=(pos:V3,look:V3,F:number):Camera=>makeCamera({pos,target:look,fov:2*Math.atan(540/(F*LENS))/D2R,size:1080});
const NEAR=.3;
const depthOf=(c:Camera,p:V3)=>dot(sub(p,c.eye),c.f);
const P=(c:Camera,p:V3):Pt=>{const q=c.project(p);return[q[0],q[1]];};
const kAt=(c:Camera,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
function clipPoly(c:Camera,pts:V3[]):Pt[]{const out:Pt[]=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],da=depthOf(c,a)-NEAR,db=depthOf(c,b)-NEAR;if(da>=0)out.push(P(c,a));if(da*db<0)out.push(P(c,mix3(a,b,da/(da-db))));}return out;}
function addPoly(path:Path2D,q:Pt[]){if(q.length<3)return;let A=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];A+=a[0]*b[1]-b[0]*a[1];}const r=A<0?q.slice().reverse():q;path.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)path.lineTo(r[i][0],r[i][1]);path.closePath();}
/** a stand quad only when it is comfortably in front of the camera (a camera inside the bowl culls the stand behind it) */
function quadIn(path:Path2D,c:Camera,q:V3[],minD=4){for(const p of q)if(depthOf(c,p)<minD)return;addPoly(path,q.map(p=>P(c,p)));}
function groundLine(path:Path2D,c:Camera,a:[number,number],b:[number,number],w=.12){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
function groundRing(c:Camera,x:number,z:number,r:number,n=28):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p:V3=[x+Math.cos(a)*r,.02,z+Math.sin(a)*r];if(depthOf(c,p)<NEAR)return[];o.push(P(c,p));}return o;}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));

/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** an arrow head at the end of a projected polyline */
function head(pts:Pt[],w:number):Path2D{const e=pts[pts.length-1],d=pts[pts.length-2],a=Math.atan2(e[1]-d[1],e[0]-d[0]);return polyPath([[e[0]+Math.cos(a)*w*2.2,e[1]+Math.sin(a)*w*2.2],[e[0]+Math.cos(a+2.4)*w*1.7,e[1]+Math.sin(a+2.4)*w*1.7],[e[0]+Math.cos(a-2.4)*w*1.7,e[1]+Math.sin(a-2.4)*w*1.7]],true);}
/** a ground arrow along world points (projected, clipped), yellow; returns nothing when off-camera */
function groundArrow(s:Sheet,c:Camera,pts3:[number,number][],wm:number,cov=.95,gaps?:[number,number][]){const pts:Pt[]=[];for(const[x,z] of pts3){const p:V3=[x,.03,z];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
 if(pts.length<2)return;const m=pts3[pts3.length>>1],w=Math.max(6,wm*kAt(c,[m[0],0,m[1]]));yInk(s,ribbon(pts,w,{taper:.1,wobble:.8,gaps}),cov);yInk(s,head(pts,w),cov);}

// ================= Berlin: the Olympiastadion — a sunken oval bowl, the blue running track, the roof ring open over the Marathon Gate =================
/** The running track is a stadium oval round the pitch (x −105 … 0): straights at z = ±R, bends centred on x = −91 and x = −14.
 * oval(u, r): a point at perimeter parameter u ∈ [0,1) with its outward normal [x, z]. */
const OV={c0:-91,c1:-14,R:40,W:8.5};
function oval(u:number,r:number):{p:[number,number];n:[number,number]}{
 const L=OV.c1-OV.c0,Pm=2*L+TAU*r,d=((u%1)+1)%1*Pm;
 if(d<L)return{p:[OV.c0+d,-r],n:[0,-1]};
 if(d<L+Math.PI*r){const a=-Math.PI/2+(d-L)/r;return{p:[OV.c1+Math.cos(a)*r,Math.sin(a)*r],n:[Math.cos(a),Math.sin(a)]};}
 if(d<2*L+Math.PI*r){const e=d-L-Math.PI*r;return{p:[OV.c1-e,r],n:[0,1]};}
 const a=Math.PI/2+(d-2*L-Math.PI*r)/r;return{p:[OV.c0+Math.cos(a)*r,Math.sin(a)*r],n:[Math.cos(a),Math.sin(a)]};}
const R0=OV.R+OV.W,NS=56;
const onBowl=(u:number,d:number,y:number):V3=>{const o=oval(u,R0);return[o.p[0]+o.n[0]*d,y,o.p[1]+o.n[1]*d];};
/** the Marathon Gate: the gap in the upper ring and the roof at the far (west) end */
const GATE=(u:number)=>{const L=OV.c1-OV.c0,Pm=2*L+TAU*R0,m=(2*L+1.5*Math.PI*R0)/Pm;return Math.abs(u-m)<.024;};
type Bowl={low:V3[][];up:V3[][];rim:V3[][];roof:V3[][];track:V3[][];seats:{P:V3;h:number;ph:number}[];lamps:V3[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],rim:[],roof:[],track:[],seats:[],lamps:[]};
 for(let i=0;i<NS;i++){const a=i/NS,b=(i+1)/NS,gate=GATE((a+b)/2);
  const Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[onBowl(a,d0,y0),onBowl(b,d0,y0),onBowl(b,d1,y1),onBowl(a,d1,y1)];
  o.low.push(Q(0,1,22,11.5));
  if(!gate){o.up.push(Q(24,13.5,42,27));o.rim.push(Q(22,11.5,24,13.5));o.roof.push(Q(16,33.5,52,31));o.lamps.push(onBowl((a+b)/2,17,33.2));}
  const ti=oval(a,OV.R),tj=oval(b,OV.R),to=oval(a,R0),tq=oval(b,R0);o.track.push([[ti.p[0],0,ti.p[1]],[tj.p[0],0,tj.p[1]],[tq.p[0],0,tq.p[1]],[to.p[0],0,to.p[1]]]);
  for(const [d0,y0,d1,y1,rows,off] of [[0,1,22,11.5,7,0],[24,13.5,42,27,6,5000]] as number[][]){if(gate&&off)continue;for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7+off,11);if(h<.14)continue;
   const u=(r+.5)/rows;o.seats.push({P:onBowl((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS,lerp(d0,d1,u),lerp(y0,y1,u)+.4),h,ph:hash(i*7+r*3+k,9)*TAU});}}}
 return o;})();
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,big=polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,Bnd],[-Bnd,Bnd]],true);
 // a partly cloudy night over Berlin (kick-off 21:00, the goal about 22:05): deep navy-blue sky
 s.field(B,.5,.6);s.tone(K,big,.5);
 const low=new Path2D(),up=new Path2D(),rim=new Path2D(),roof=new Path2D(),edge=new Path2D(),lamps=new Path2D();
 for(const q of BOWL.low)quadIn(low,c,q);for(const q of BOWL.up)quadIn(up,c,q);for(const q of BOWL.rim)quadIn(rim,c,q);
 for(const q of BOWL.roof){quadIn(roof,c,q,6);if(depthOf(c,q[0])>6&&depthOf(c,q[1])>6){const a=P(c,q[0]),b=P(c,q[1]),w=Math.max(2,.5*kAt(c,q[0]));edge.addPath(ribbon([a,b],w,{taper:0,pressure:0,wobble:.3}));}}
 for(const p of BOWL.lamps){if(depthOf(c,p)<6)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),3,14);lamps.rect(x-sz,y-sz*.35,sz*2,sz*.7);}
 s.knockout(low);s.tone(K,low,.4);s.tone(B,low,.28);s.knockout(up);s.tone(K,up,.46);s.tone(B,up,.22);
 // the crowd: Spain red and yellow, England white with red and navy
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let seen=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<4)continue;const k=kAt(c,q.P),z=clamp(.5*k,2.5,14),[x,y]=P(c,q.P);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;const lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.ph)):0;
  inks[q.h<.46?0:q.h<.6?1:q.h<.88?2:3].rect(x-z/2,y-z*.7-lift,z,z*1.25);seen++;}
 if(seen){s.fill(R,inks[0],.88);s.fill(Y,inks[1],.9);s.knockout(inks[2],.8);s.fill(K,inks[3],.75);}
 s.knockout(rim);s.fill(K,rim,.8);
 s.knockout(roof);s.tone(B,roof,.22);s.tone(K,roof,.12);s.fill(K,edge,.85);s.knockout(lamps,.95);s.fill(Y,lamps,.25);
 if(flash>0){const fp=new Path2D(),T12=Math.floor(tt*12);let n=0;for(let i=0;i<Math.round(22*flash);i++){const q=BOWL.seats[Math.floor(hash(i*17+T12*101,3)*BOWL.seats.length)];if(depthOf(c,q.P)<6)continue;const[x,y]=P(c,q.P),sz=clamp(.9*kAt(c,q.P),7,22);
  fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // the blue running track, then the grass inside it (yellow × blue = green), mowing stripes
 const tr=new Path2D();for(const q of BOWL.track)addPoly(tr,clipPoly(c,q));s.knockout(tr);s.fill(B,tr,.8);s.tone(K,tr,.14);
 const inner:V3[]=[];for(let i=0;i<48;i++){const q=oval(i/48,OV.R);inner.push([q.p[0],0,q.p[1]]);}
 const gp=new Path2D();addPoly(gp,clipPoly(c,inner));s.knockout(gp);yInk(s,gp,.88);s.tone(B,gp,.62);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 // LED boards along the far touchline and behind the goal
 const bB=new Path2D(),bP=new Path2D();for(let x=-104;x<4;x+=8)addPoly((Math.round(x/8)&1)?bB:bP,clipPoly(c,[[x,0,-36.5],[x+7.6,0,-36.5],[x+7.6,.9,-36.5],[x,.9,-36.5]]));
 for(let z=-24;z<24;z+=8)addPoly((Math.round(z/8)&1)?bB:bP,clipPoly(c,[[5,0,z],[5,0,z+7.6],[5,.9,z+7.6],[5,.9,z]]));
 s.knockout(bB);s.knockout(bP);s.fill(K,bB,.9);s.fill(R,bP,.7);
 // paper lines: touchlines, goal line, halfway, the box, the six-yard box, the D, the spot
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.13);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 goal(s,c,o.net);
}
/** the goal at x = 0: posts, bar, a box net; `net` displaces the mesh for the ripple */
function goal(s:Sheet,c:Camera,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3)=>net?net(p):p,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(back,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,clamp(.03*kAt(c,[0,1,0]),2,9),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the ball (2024: white with navy panels and a red accent — design illustrative) =================
const BALL_R=.11;
function whiteBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);if(duo)s.fill(Y,disc,.2);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
 const pan=new Path2D(),acc=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3;pan.addPath(ribbon([[Math.cos(a)*r*.15,Math.sin(a)*r*.15],[Math.cos(a+.7)*r*.6,Math.sin(a+.7)*r*.6],[Math.cos(a+1.3)*r*1.05,Math.sin(a+1.3)*r*1.05]],Math.max(2,r*.2),{taper:.4,wobble:0}));}
 const aa=spin*.8+1;acc.addPath(ribbon([[Math.cos(aa)*r*.2,Math.sin(aa)*r*.2],[Math.cos(aa+.9)*r*.5,Math.sin(aa+.9)*r*.5]],Math.max(2,r*.14),{taper:.6,wobble:0}));
 s.fill(K,pan,.9);if(!duo)s.fill(R,acc,.95);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (14 July 2024) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.32],[R,.2]],SKIN_M:AthleteStyle['skin']=[[Y,.42],[R,.3],[B,.1]],SKIN_D:AthleteStyle['skin']=[[R,.42],[Y,.5],[K,.22]];
type Kit=AthleteStyle;
/** Spain: red shirts, dark-blue shorts, red socks (confirmed); yellow numbers and trim (inferred) */
const ESP=(n:number,o:Partial<Kit>={}):Kit=>({shirt:R,shorts:[K,.9],socks:R,trim:Y,boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:Y,seed:40+n,...o});
/** England: white shirts, navy shorts, white socks (confirmed); navy trim and numbers (inferred) */
const ENG=(n:number,o:Partial<Kit>={}):Kit=>({shirt:'paper',shorts:[K,.9],socks:'paper',trim:K,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:70+n,...o});
const NICO:Kit=ESP(17,{skin:SKIN_D,hair:[K,.92],hairStyle:'curly',build:{height:1.81,bulk:.9,thighs:1,head:1},seed:17});
const YAMAL:Kit=ESP(19,{skin:SKIN_D,hair:[K,.92],build:{height:1.8,bulk:.86,thighs:.94,head:1.02},seed:19});
const WALKER:Kit=ENG(2,{skin:SKIN_D,hairStyle:'bald',build:{height:1.83,bulk:1.02},seed:72});
const PICKFORD:Kit={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],trim:K,boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'short',gloves:[B,.8],line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:K,build:{height:1.85},seed:1};
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:Kit,lead=false):Kit=>({...st,shirt:lead?[K,.45]:[Y,.6],shorts:lead?'paper':[K,.32],socks:lead?'paper':[Y,.6],trim:lead?'paper':K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[K,.9]:K,shade:[K,.2],numberInk:lead?'paper':K});

/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}):DrawResult{
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Yamal's pass leaves his left boot) =================
const NB:Build=NICO.build!,YB:Build=YAMAL.build!;
/** PASS0 where Yamal passes; SHOT where Williams meets it (≈ 14 m out, left of the spot); GIN where it crosses the line, low, right corner */
const PASS0:[number,number]=[-17.6,10.6],SHOT:[number,number]=[-13.4,-6.4],GIN:V3=[0,.26,3.02],NET_HIT:V3=[1.9,.3,3.0];
const CONTACT=1.12,TF=.62,T_GOAL=CONTACT+TF;
/** Yamal's left-foot pass: the body faces the pass line; the left toe meets the ball at PASS0 */
const PY=YAW(SHOT[0]-PASS0[0],SHOT[1]-PASS0[1])+18*D2R;
const PASS_SK=solve(strike(STRIKE_CONTACT,{foot:'l',power:.4}),YB,{yaw:PY});
const YP:[number,number]=[PASS0[0]-PASS_SK.lToe[0],PASS0[1]-PASS_SK.lToe[2]];
/** Williams' left-foot finish on the run: body toward the right corner; the left toe meets the ball at SHOT */
const NS_YAW=YAW(GIN[0]-SHOT[0],GIN[2]-SHOT[1])-8*D2R;
const SHOT_SK=solve(strike(STRIKE_CONTACT,{foot:'l',power:.75}),NB,{yaw:NS_YAW});
const NP:[number,number]=[SHOT[0]-SHOT_SK.lToe[0],SHOT[1]-SHOT_SK.lToe[2]];

type Role='hero'|'esp'|'eng'|'gk';
type Actor={name:string;role:Role;style:Kit;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 // Williams: a jog on the far (left) wing, then the burst — ≈ 8 m/s over the last 20 m — onto the pass, then away to celebrate
 {name:'Williams',role:'hero',style:NICO,key:true,keys:[[-10,-50,-27.5],[-6,-46,-27.4],[-4,-41.5,-26.2],[-2.4,-34.5,-23.2],[-1.2,-27.2,-18.8],[0,-20.8,-13.9],[.6,-17.2,-10.8],[CONTACT,NP[0],NP[1]],[CONTACT+.5,NP[0]+3.2,NP[1]+1.2],[T_GOAL+.6,-8.6,-7.4],[T_GOAL+1.6,-7.6,-12.5],[T_GOAL+2.8,-6.5,-19.5],[T_GOAL+4,-5.5,-25],[T_GOAL+6,-5,-27]]},
 // Yamal: on the ball on the right, behind Shaw, inside, the pass across
 {name:'Yamal',role:'esp',style:YAMAL,key:true,keys:[[-10,-35,25.5],[-7,-31.5,26],[-5,-27.6,25],[-3.4,-24.3,22.4],[-1.8,-21.2,17.6],[-.6,YP[0]-.9,YP[1]+1.9],[0,YP[0],YP[1]],[.8,YP[0]+1.6,YP[1]-.4],[3,-12,8],[6,-9,5]]},
 {name:'Walker',role:'eng',style:WALKER,key:true,keys:[[-10,-24,-12],[-4,-20.5,-9.8],[-2,-18,-7.4],[-.6,-15.8,-4.6],[.4,-14.6,-3.4],[CONTACT,-14.2,-4.4],[T_GOAL,-13.6,-5.6],[6,-12,-6]]},
 {name:'Pickford',role:'gk',style:PICKFORD,key:true,keys:[[-10,-3,1.2],[-2,-2.4,1.8],[0,-1.8,.6],[CONTACT,-1.5,-.9],[8,-1.5,-.9]]},
 {name:'Olmo',role:'esp',style:ESP(10,{skin:SKIN_L}),keys:[[-10,-34,2],[-5,-29,1.5],[-3,-23.5,1],[-1,-18,.6],[.6,-13.8,1.8],[CONTACT,-12.2,2.6],[3,-9,3],[6,-8,3]]},
 {name:'Shaw',role:'eng',style:ENG(3,{hair:[K,.7]}),keys:[[-10,-32,23.5],[-7,-29,24.5],[-5,-27,24.5],[-3.4,-25.8,23.4],[-1.8,-23.6,19.8],[0,-20.8,14.6],[1.2,-18.6,11.6],[4,-16,9]]},
 {name:'Morata',role:'esp',style:ESP(7,{hair:[K,.8]}),keys:[[-10,-18,4.5],[-3,-12.5,5],[0,-9.6,4.6],[3,-7.5,4],[6,-7,4]]},
 {name:'Stones',role:'eng',style:ENG(5,{hair:[K,.8],build:{height:1.88}}),keys:[[-10,-19,3],[-3,-13.8,3.6],[0,-10.8,4.8],[3,-9.2,4.4],[6,-9,4]]},
 {name:'Guéhi',role:'eng',style:ENG(6,{skin:SKIN_D}),keys:[[-10,-19,-2],[-3,-13.6,.4],[0,-10.6,1.6],[3,-9.4,1],[6,-9,1]]},
 {name:'Rice',role:'eng',style:ENG(4,{build:{height:1.85}}),keys:[[-10,-29,6],[-3,-22.5,6.8],[0,-19,7.2],[3,-16.8,5.6],[6,-16,5]]},
 {name:'Mainoo',role:'eng',style:ENG(26,{skin:SKIN_D}),keys:[[-10,-30,-4],[-3,-24,-3],[0,-20.6,-2.2],[3,-18,-3],[6,-17,-3]]},
 {name:'Saka',role:'eng',style:ENG(7,{skin:SKIN_D}),keys:[[-10,-40,-19],[-3,-33,-18],[0,-28.5,-15.4],[3,-22,-11.5],[6,-20,-10]]},
 {name:'Fabián',role:'esp',style:ESP(8,{hair:[K,.85]}),keys:[[-10,-42,6],[-3,-36,5],[0,-32,4],[4,-28,3]]},
 {name:'Zubimendi',role:'esp',style:ESP(18,{hair:[K,.85]}),keys:[[-10,-48,-2],[-3,-43,-1],[4,-38,0]]},
 {name:'Cucurella',role:'esp',style:ESP(24,{hairStyle:'long',hair:[K,.75]}),keys:[[-10,-50,-20],[-3,-45,-22],[4,-40,-22]]},
 {name:'Carvajal',role:'esp',style:ESP(2,{hair:[K,.85]}),keys:[[-10,-50,20],[-3,-45,21],[4,-40,20]]},
 {name:'Bellingham',role:'eng',style:ENG(10,{skin:SKIN_D}),keys:[[-10,-38,4],[-3,-35,2],[4,-30,1]]},
 {name:'Foden',role:'eng',style:ENG(11,{}),keys:[[-10,-42,12],[-3,-38,10],[4,-33,8]]},
 {name:'Kane',role:'eng',style:ENG(9,{}),keys:[[-10,-48,6],[-3,-46,4],[4,-42,2]]},
];
const NICO_K=0,YAM=1,WAL=2,GK=3,OLM=4,SHAW=5;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
type Tab={X:number[];Z:number[];D:number[];t0:number};
function tables(list:number[][][],T0:number,T1:number):Tab[]{return list.map(keys=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D,t0:T0};});}
const DT=.02;
const TABLES=tables(ACTORS.map(a=>a.keys),-10,12);
const samp=(tb:Tab,arr:number[],tau:number)=>{const u=clamp((tau-tb.t0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posIn=(tb:Tab[],k:number,tau:number):[number,number]=>[samp(tb[k],tb[k].X,tau),samp(tb[k],tb[k].Z,tau)];
const distIn=(tb:Tab[],k:number,tau:number)=>samp(tb[k],tb[k].D,tau);
const velIn=(tb:Tab[],k:number,tau:number):[number,number]=>{const a=posIn(tb,k,tau-.08),b=posIn(tb,k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const posOf=(k:number,tau:number)=>posIn(TABLES,k,tau),distOf=(k:number,tau:number)=>distIn(TABLES,k,tau),velOf=(k:number,tau:number)=>velIn(TABLES,k,tau);

// ---- the ball: at Yamal's feet → the low pass across → Williams' left foot → low into the right corner → the net ----
const fwdBall=(k:number,tau:number,d=.5):[number,number]=>{const p=posOf(k,tau),v=velOf(k,tau),sp=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/sp*d,p[1]+v[1]/sp*d];};
function ballAt(tau:number):V3{
 if(tau<0){const f=fwdBall(YAM,tau,.5+.14*Math.abs(Math.sin(tau*4.6))),w=sm(-.45,0,tau);return[lerp(f[0],PASS0[0],w),.11,lerp(f[1],PASS0[1],w)];}
 if(tau<CONTACT){const u=tau/CONTACT,e=1.3*u-.3*u*u;return[lerp(PASS0[0],SHOT[0],e),.11,lerp(PASS0[1],SHOT[1],e)];}
 const s=tau-CONTACT;if(s<TF){const u=s/TF;return[lerp(SHOT[0],GIN[0],u),lerp(.11,GIN[1],u)+.32*Math.sin(Math.PI*u),lerp(SHOT[1],GIN[2],u)];}
 const e=s-TF;if(e<.12)return mix3(GIN,NET_HIT,easeOut(e/.12));
 const d=clamp((e-.12)/.5);return[lerp(NET_HIT[0],1.7,d),Math.max(.11,NET_HIT[1]*(1-d)+.11*d)+.05*Math.abs(Math.sin(d*9))*(1-d),lerp(NET_HIT[2],2.7,d)];
}

// ---- poses ----
const RAD=D2R;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:18,pitch:4,lShA:28,rShA:28,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-4});
/** the look across: head turned right toward Yamal while he sprints */
const LOOK:Partial<Pose>={neckY:-38,twist:-8};
const SD=.62,S_START=CONTACT-STRIKE_CONTACT*SD,PD=.7,P_START=-STRIKE_CONTACT*PD;
function poseOf(k:number,tau:number):{pose:Pose;place:Place}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau),toBall=YAW(b[0]-x,b[2]-z);
 let yaw=sp>.6?YAW(v[0],v[1]):toBall,p:Pose;
 if(a.role==='hero'){
  if(tau<T_GOAL+.25){p=blendPose(idle(tau,1),runCycle(distOf(k,tau)/3.3,{speed:clamp((sp-2)/6)}),clamp(sp/1.2));
   p=over(p,LOOK,sm(-3,-2,tau)*(1-sm(-.1,.5,tau)));
   const u=(tau-S_START)/SD;if(u>-.25){yaw=lerpAng(yaw,NS_YAW,sm(-.25,.2,u));p=blendPose(p,strike(clamp(u),{foot:'l',power:.75}),Math.min(sm(-.2,.1,u),1-sm(1.05,1.6,u)));}}
  else if(tau<T_GOAL+4.2){p=blendPose(READY,celebrate(distOf(k,tau)/3.4,{kind:'run'}),sm(T_GOAL+.25,T_GOAL+.8,tau));}
  else{p=celebrate((tau-T_GOAL-4.2)*.8,{kind:'arms'});yaw=YAW(0,1);}
 }else if(a.role==='gk'){
  yaw=YAW(b[0]-x,b[2]-z);const q=keeperSet(tau*1.5),u=(tau-(CONTACT-.08))/.8;
  p=u>0?keeperDive(Math.min(1,u),{side:'l',height:.1}):q;if(u>0)yaw=Math.PI;
 }else if(k===YAM){
  if(tau<0-PD*STRIKE_CONTACT-.05){const dr=dribble(distOf(k,tau)/1.9,{foot:'l',speed:.45+.35*clamp(sp/5)});p=blendPose(READY,dr,clamp(sp/.9));}
  else{p=blendPose(READY,runCycle(distOf(k,tau)/3.2,{speed:clamp((sp-1.5)/5)}),clamp(sp/1.2));}
  const u=(tau-P_START)/PD;if(u>-.2&&u<1.5){yaw=lerpAng(yaw,PY,sm(-.2,.2,u));p=blendPose(p,strike(clamp(u),{foot:'l',power:.4}),Math.min(sm(-.15,.1,u),1-sm(1,1.5,u)));}
  if(tau>T_GOAL+.6)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(T_GOAL+.6,T_GOAL+1.1,tau));
 }else{
  const eng=a.role==='eng',along=v[0]*Math.cos(toBall)-v[1]*Math.sin(toBall);
  if(eng&&sp>.4&&sp<4&&along<0){p=blendPose(READY,backpedal(distOf(k,tau)/1.1),clamp((sp-.4)/.8));yaw=toBall;}
  else{const s=clamp((sp-1.5)/5.5);p=blendPose(eng?READY:idle(tau,k),runCycle(distOf(k,tau)/3.3+k*.37,{speed:s}),clamp((sp-.3)/.9));if(sp<.6)yaw=toBall;}
  // Walker turns his head to Olmo's run, then snaps round to Williams too late
  if(k===WAL){const o=posOf(OLM,tau),n=posOf(NICO_K,tau);yaw=tau<CONTACT-.3?YAW(o[0]-x,o[1]-z):lerpAng(YAW(o[0]-x,o[1]-z),YAW(n[0]-x,n[1]-z),sm(CONTACT-.3,CONTACT+.2,tau));}
  if(a.role==='esp'&&tau>T_GOAL+.5)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(T_GOAL+.5,T_GOAL+1,tau)*(k===OLM?1:.6));
 }
 return{pose:p,place:{x,z,yaw}};
}

type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Williams with motion smear + secondary motion; `cap` limits figure detail
 * (passages), small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean}){
 const ball=ballAt(tau),items:Item[]=[],ppu=pxPer(s);
 ACTORS.forEach((a,k)=>{const st=poseOf(k,tp),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(k===NICO_K?1:2.5))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&k!==NICO_K&&hPx<30)return;const detail:Detail|undefined=hPx<55||(!a.key&&hPx<100)||(o.cap&&k!==NICO_K&&hPx<150)?'low':o.cap?'mid':undefined;
  const hero=k===NICO_K&&!!o.hero&&!o.cap;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,a.style,st.place,{prev:hero?poseOf(k,tp-1/12):undefined,smear:hero,detail})});});
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  whiteBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball};}
/** ground ring round a player (team rings, highlights) */
function ringAt(path:Path2D,c:Camera,k:number,tp:number,g:number,r=.9){const p=posOf(k,tp),q=groundRing(c,p[0],p[1],r*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}));}
/** speed lines trailing a running player (the burst) */
function burstLines(s:Sheet,c:Camera,k:number,tp:number,amt:number,seed:number,len=150){if(amt<=.02)return;const p=posOf(k,tp),v=velOf(k,tp),g:V3=[p[0],1,p[1]];if(depthOf(c,g)<NEAR+1)return;const a=P(c,g),b=P(c,[p[0]-v[0]*.12,1,p[1]-v[1]*.12]);
 speedLines(s,K,a[0],a[1],Math.atan2(a[1]-b[1],a[0]-b[0]),{n:6,seed,len:len*amt,width:7,cov:.8*amt});}
/** "far corner": a yellow corner bracket in the angle of the right-hand post (z = +3.66) and the ground */
function cornerBracket(s:Sheet,c:Camera,w:number){if(w<=.02)return;const C0:V3=[0,0,3.66];if(depthOf(c,C0)<NEAR+.3)return;const k=kAt(c,C0),a=P(c,[0,.9*w,3.66]),m=P(c,C0),b=P(c,[0,0,3.66-.9*w]);yInk(s,ribbon([a,m,b],Math.max(7,.14*k),{taper:.1,wobble:1}),.95);}
function shotSpark(s:Sheet,c:Camera,tp:number,size:number,seed:number){if(tp<CONTACT||tp>=CONTACT+.25)return;const p=P(c,[SHOT[0],.15,SHOT[1]]);sparkBurst(s,Y,p[0],p[1],size*(.6+.4*sm(CONTACT,CONTACT+.1,tp,easeOut)),{n:10,seed,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:10});}

// ================= chapter 1 (live): the high main-stand camera; Yamal beats Shaw, Williams bursts in, the pass across, the finish =================
const ch1q=()=>({be:T(0,'Berlin'),sp:T(0,'Spain, in red'),en:T(0,'England'),ly:T(0,'Lamine Yamal'),ri:T(0,'on the right'),nb:T(0,'Nico Williams bursts'),lw:T(0,'from the left wing'),ys:T(0,'Yamal slides'),sw:T(0,'sweeps it in'),or:T(0,'on the run'),g:T(0,'Goal'),end:SEC(0)});
/** τ keyed to the words: a pre-roll with Yamal on the ball, the play near real time between the cues */
const tau1=(t:number)=>{const q=ch1q();return key(t,mono([[0,-9.5],[q.ly,-6.2],[q.ri,-4.4],[q.nb,-2.6],[q.lw,-1.2],[q.ys,0],[q.sw,CONTACT-.2],[q.or,CONTACT+.3],[q.g,T_GOAL+.5],[q.end,T_GOAL+.5+(q.end-q.g)*.9]]),x=>x);};
const BCAM:V3=[-30,17,44];
function ch1Look(tau:number):V3{const b=ballAt(Math.min(tau,T_GOAL+.1)),n=posOf(NICO_K,tau);
 const mid:V3=[(b[0]+n[0])/2+1,1,(b[2]+n[1])/2],onN:V3=mix3([b[0]+1,1,b[2]],[n[0]+2,1,n[1]],.72);
 if(tau<-3.2)return[b[0]+1,1,b[2]];
 if(tau<-1.2)return mix3([b[0]+1,1,b[2]],onN,sm(-3.2,-2.2,tau,easeInOutSine));
 if(tau<CONTACT)return mix3(onN,mid,sm(-1.2,-.1,tau,easeInOutSine));
 if(tau<T_GOAL+.6)return mix3([(b[0]+n[0])/2+1,1,(b[2]+n[1])/2],[-4,1.2,-1],sm(CONTACT,T_GOAL,tau)*.8);
 return mix3([-4,1.2,-1],[n[0],1.2,n[1]],sm(T_GOAL+.6,T_GOAL+2,tau,easeInOutSine));}
function ch1Cam(t:number){const q=ch1q(),tau=tau1(t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const wide:V3=[-36,4,-20],look=mix3(wide,av(ch1Look),sm(q.sp-.4,q.en,t,easeInOutSine));
 const F=key(t,mono([[0,1700],[q.sp,2300],[q.ly,2900],[q.ri,3000],[q.nb,3100],[q.ys,3000],[q.sw,3700],[q.g,3900],[q.end,4300]]),easeInOutSine);return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const q=ch1q(),tt=twos(t),c=ch1Cam(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // team rings: red for Spain on "Spain, in red", navy for England on "England"; yellow for Yamal and then for Williams
  const ra=sm(q.sp,q.sp+.3,tt,easeOutBack)*(1-sm(q.en+.2,q.en+.8,tt)),re=sm(q.en,q.en+.3,tt,easeOutBack)*(1-sm(q.ly,q.ly+.6,tt)),ry=sm(q.ly,q.ly+.3,tt,easeOutBack)*(1-sm(q.nb,q.nb+.5,tt)),rn=sm(q.nb,q.nb+.3,tt,easeOutBack)*(1-sm(q.sw,q.sw+.4,tt));
  if(ra>.02||re>.02||ry>.02||rn>.02){const pa=new Path2D(),pe=new Path2D(),py=new Path2D();
   ACTORS.forEach((a,k)=>{if((a.role==='esp'||a.role==='hero')&&ra>.02)ringAt(pa,c,k,tp,ra);if((a.role==='eng'||a.role==='gk')&&re>.02)ringAt(pe,c,k,tp,re);});
   if(ry>.02)ringAt(py,c,YAM,tp,ry*1.2);if(rn>.02)ringAt(py,c,NICO_K,tp,rn*1.2);
   if(ra>.02)s.fill(R,pa,.95);if(re>.02)s.fill(K,pe,.9);if(ry>.02||rn>.02)yInk(s,py,.95);}
  // "on the right": a yellow arrow along Yamal's carry behind Shaw
  const rr=sm(q.ri-.1,q.ri+.5,tt,easeOut)*(1-sm(q.nb+.2,q.nb+.7,tt));if(rr>.02){const pts:[number,number][]=[];for(let i=0;i<=10;i++){const p=posOf(YAM,lerp(-5.5,-5.5+5.3*rr,i/10));pts.push([p[0]+.4,p[1]-.6]);}groundArrow(s,c,pts,.1);}
  // "from the left wing": his run drawn ahead of him on the grass, from the wing to where the ball will come
  const lw=sm(q.lw-.1,q.lw+.6,tt,easeOut)*(1-sm(q.or,q.or+.5,tt));if(lw>.02){const pts:[number,number][]=[],t0=Math.max(-2.4,tp);for(let i=0;i<=12;i++){const p=posOf(NICO_K,lerp(t0,t0+(CONTACT-t0)*lw,i/12));pts.push(p);}groundArrow(s,c,pts,.1);}
  // "Yamal slides": the pass line across the area, dashed
  const ys=sm(q.ys-.2,q.ys+.4,tt)*(1-sm(q.or,q.or+.5,tt));if(ys>.02){const a=P(c,[PASS0[0],.03,PASS0[1]]),e=mix3([PASS0[0],.03,PASS0[1]],[SHOT[0],.03,SHOT[1]],ys),b=P(c,e),gaps:[number,number][]=[];for(let u=.08;u<1;u+=.14)gaps.push([u,u+.06]);s.fill(Y,ribbon([a,b],Math.max(5,.1*kAt(c,e)),{taper:0,wobble:.4,gaps}),.9);}
  drawWorld(s,c,tau,tp,{ballMin:11,cap:t>q.end-.7});
  burstLines(s,c,NICO_K,tp,sm(q.nb,q.nb+.3,tt)*(1-sm(q.ys+.3,q.sw,tt)),31,140);
  shotSpark(s,c,tp,100,11);},
 aperture(t){const c=ch1Cam(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:10,
};

// ================= chapter 2 (TV replay, slow motion, low from behind Williams' run): Olmo pulls Walker away, the burst into the space, the left foot =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),ol:T(1,'Olmo runs inside'),pd:T(1,'pulling a defender away'),ns:T(1,'Nico sprints'),sp:T(1,'the space'),lf:T(1,'left foot'),fc:T(1,'far corner'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,-3.4],[q.sl,-3],[q.ol,-2.3],[q.pd,-1.2],[q.ns,-.3],[q.sp,.35],[q.lf,CONTACT-.02],[q.fc,T_GOAL-.1],[q.end,T_GOAL+.35]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),n=posOf(NICO_K,Math.min(tau,CONTACT)),b=ballAt(tau),push=sm(q.ns,q.lf,t,easeInOutSine),fin=sm(q.lf,q.fc,t,easeInOutSine);
 // a low reverse-angle camera trailing the run from behind his left shoulder, drifting in as he reaches the ball
 const pos:V3=[n[0]-8.5+2*push,1.7+.3*push,n[1]-6.5+1.2*push];
 const look=mix3(mix3([n[0]+9,1,n[1]+8],[SHOT[0]+2,.8,SHOT[1]+2],push),[b[0],.6,b[2]],fin*.6);
 const F=key(t,mono([[0,2300],[q.ol,2100],[q.pd,2200],[q.ns,2500],[q.sp,2700],[q.lf,2900],[q.fc,2400],[q.end,2500]]));return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt),goalIn=tau-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.1+.8*sm(0,.4,goalIn),flash:.05+sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "Olmo runs inside": his run as a navy-edged yellow arrow; "pulls a defender away": a navy tether from Walker to Olmo, Walker ringed
  const ol=sm(q.ol-.1,q.ol+.6,tt,easeOut)*(1-sm(q.sp,q.sp+.5,tt));if(ol>.02){const pts:[number,number][]=[];for(let i=0;i<=10;i++)pts.push(posOf(OLM,lerp(Math.max(-2.6,tp),Math.max(-2.6,tp)+2.2*ol,i/10)));groundArrow(s,c,pts,.08);
   const pr=new Path2D();ringAt(pr,c,OLM,tp,ol,1);s.fill(R,pr,.95);}
  const pd=sm(q.pd-.1,q.pd+.4,tt,easeOutBack)*(1-sm(q.lf,q.lf+.5,tt));if(pd>.02){const w=posOf(WAL,tp),o=posOf(OLM,tp),a=P(c,[w[0],.9,w[1]]),b=P(c,[o[0],.9,o[1]]),gaps:[number,number][]=[];for(let u=.06;u<1;u+=.16)gaps.push([u,u+.07]);
   if(depthOf(c,[w[0],1,w[1]])>NEAR+1&&depthOf(c,[o[0],1,o[1]])>NEAR+1)s.fill(K,ribbon([a,b],Math.max(4,.05*kAt(c,[w[0],1,w[1]])),{taper:0,wobble:.4,gaps}),.85*pd);
   const pr=new Path2D();ringAt(pr,c,WAL,tp,pd,1);yInk(s,pr,.95);}
  // "the space": a pale yellow patch on the grass where the ball and Williams will meet
  const spc=sm(q.sp-.2,q.sp+.4,tt)*(1-sm(q.lf-.5,q.lf,tt));if(spc>.02){const g=groundRing(c,SHOT[0],SHOT[1],1.5*spc,30);if(g.length>2){const p=polyPath(g,true);s.knockout(p,.5*spc);s.tone(Y,p,.6*spc);}}
  const w=drawWorld(s,c,tau,tp,{ballMin:16,hero:true,glow:sm(q.w,q.w+.4,tt)*(1-sm(q.sl,q.ol,tt)),cap:t>q.end-.7||t<.6});
  // "Nico sprints": speed lines off his back and a burst arrow ahead
  burstLines(s,c,NICO_K,tp,sm(q.ns-.1,q.ns+.3,tt)*(1-sm(q.lf,q.lf+.3,tt)),33,190);
  // "left foot": a yellow ring on the left boot as it meets the ball
  const lf=sm(q.lf-.15,q.lf+.2,tt,easeOutBack)*(1-sm(q.fc,q.fc+.4,tt));if(lf>.02){const st=poseOf(NICO_K,tp),sk=solve(st.pose,NB,st.place),p=P(c,sk.lToe),r=.32*kAt(c,sk.lToe)*lf;if(depthOf(c,sk.lToe)>NEAR+.5)yRing(s,p[0],p[1],r,Math.max(4,.035*kAt(c,sk.lToe)));}
  shotSpark(s,c,tp,130,14);
  if(tp>=CONTACT&&tp<T_GOAL+.1&&depthOf(c,w.ball)>NEAR+.5){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:15,len:140,width:6,cov:.8});}
  cornerBracket(s,c,sm(q.fc-.1,q.fc+.3,tt,easeOutBack));},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t));if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[x,y]=P(c,p),r=Math.max(16,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5,
};

// ================= chapter 3 (replay from behind the goal): the low shot past Pickford, then Williams away to celebrate =================
const ch3q=()=>({fb:T(2,'From behind'),pp:T(2,'past Pickford'),nw:T(2,'Nico was'),pm:T(2,'player of the match'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,CONTACT-.55],[q.fb+.8,CONTACT+.05],[q.pp,T_GOAL-.1],[q.nw,T_GOAL+1],[q.pm,T_GOAL+2.4],[q.end,T_GOAL+4.6]]),x=>x);};
const GCAM:V3=[7,2.1,6.5];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.min(tau,T_GOAL-.02)),n=posOf(NICO_K,tau);
 const toBall=sm(0,q.pp,t,easeInOutSine),toHero=sm(q.nw-.4,q.pm,t,easeInOutSine);
 const look0:V3=[SHOT[0]+2,1,SHOT[1]+2],look1:V3=[b[0],clamp(b[1],.6,2),b[2]],look2:V3=[n[0],1.1,n[1]];
 const look=mix3(mix3(look0,look1,toBall*.7),look2,toHero);
 const pos:V3=add(GCAM,[-2*toHero,1.4*toHero,-4*toHero]),F=key(t,mono([[0,2600],[q.pp,2100],[q.pp+.8,2000],[q.nw,2300],[q.pm,3000],[q.end,3300]]));return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.pp;
  const shake=t>=hitT?7*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.12+1.1*sm(0,.5,goalIn),flash:.1+1.4*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // the ball's path, dotted, while it skims in low
  if(tp>CONTACT&&tp<T_GOAL+.3){const dots=new Path2D();for(let i=0;i<=16;i++){const t2=CONTACT+(Math.min(tp,T_GOAL)-CONTACT)*i/16,p=ballAt(t2);if(depthOf(c,p)<NEAR+.5)continue;const pp=P(c,p),r=clamp(.045*kAt(c,p),3,14);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);}s.fill(K,dots,.6);}
  // "past Pickford": his reach on the grass — the glove's furthest point — and the ball beyond it
  const reach=sm(q.pp,q.pp+.35,tt,easeOutBack)*(1-sm(q.nw,q.nw+.5,tt));
  const w=drawWorld(s,c,tau,tp,{ballMin:13,hero:t>q.nw,cap:t>q.end-.7||t<.6});
  if(reach>.02){const g=posOf(GK,tp),a=P(c,[g[0],.04,g[1]+.4]),b=P(c,[g[0],.04,lerp(g[1]+.4,2.6,reach)]),k=kAt(c,[g[0],0,1.5]),gaps:[number,number][]=[];for(let u=.1;u<1;u+=.25)gaps.push([u,u+.1]);
   yInk(s,ribbon([a,b],Math.max(6,.06*k),{taper:0,wobble:0,gaps}),.9*reach);}
  if(tp>CONTACT+.2&&tp<T_GOAL+.1&&depthOf(c,w.ball)>NEAR+.6){const a=P(c,ballAt(tp-.06)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:21,len:150,width:7,cov:.8});}
  // "player of the match": a yellow ring round him as he celebrates, then a star burst
  const pm=sm(q.pm,q.pm+.35,tt,easeOutBack);if(pm>.02){const pr=new Path2D();ringAt(pr,c,NICO_K,tp,pm,1.3);yInk(s,pr,.95);
   const n=posOf(NICO_K,tp),h:V3=[n[0],2.5,n[1]];if(depthOf(c,h)>NEAR+1){const p=P(c,h);sparkBurst(s,Y,p[0],p[1],(40+.5*kAt(c,h))*easeOutBack(clamp((tt-q.pm)/.4)),{n:8,seed:44,g:1-clamp((tt-q.pm-.3)/.8),width:8});}}},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),[x,z]=posOf(NICO_K,tau),p:V3=[x,1.1,z];if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[px,py]=P(c,p);return apertureDisc(px,py,Math.max(20,.2*kAt(c,p)),12);},
 still:4.4,
};

// ================= chapter 4 (duotone lesson, its own small clock u): knock the ball past the defender, win the race with your speed =================
/** the lesson drill (illustrative, not the match): Williams runs at a defender down the wing, knocks it past his outside, and wins the race */
const KT=1.6,KB:[number,number]=[-23.2,-18.4],KE:[number,number]=[-13.6,-22.2];
const L_ACT:{style:Kit;keys:number[][]}[]=[
 {style:NICO,keys:[[-1,-33,-18.2],[0,-30.5,-18.3],[1,-26.5,-18.4],[KT,KB[0]-.75,KB[1]+.1],[2.1,-21.6,-20.6],[2.8,-18.4,-22.1],[3.5,-14.8,-22.4],[4.6,-11,-22.6],[6,-9.5,-22.6]]},
 {style:WALKER,keys:[[-1,-19.2,-18.4],[0,-19.4,-18.4],[1,-20.2,-18.4],[KT,-20.6,-18.3],[2.2,-20.2,-19.6],[3,-18.6,-21],[3.8,-16.4,-21.6],[4.6,-14,-21.8],[6,-12.8,-21.8]]},
];
const L_TAB=tables(L_ACT.map(a=>a.keys),-1,7);
const L_BALL_KEYS=(u:number):V3=>{
 if(u<KT){const p=posIn(L_TAB,0,u),v=velIn(L_TAB,0,u),sp=Math.hypot(v[0],v[1])||1,d=.5+.12*Math.abs(Math.sin(u*5)),w=sm(KT-.3,KT,u);return[lerp(p[0]+v[0]/sp*d,KB[0],w),.11,lerp(p[1]+v[1]/sp*d,KB[1],w)];}
 const s=clamp((u-KT)/2.1),e=1-(1-s)*(1-s);if(u<KT+2.1)return[lerp(KB[0],KE[0],e),.11,lerp(KB[1],KE[1],e)];
 const p=posIn(L_TAB,0,u),v=velIn(L_TAB,0,u),sp=Math.hypot(v[0],v[1])||1;const w=sm(KT+2.1,KT+2.6,u);return[lerp(KE[0],p[0]+v[0]/sp*.5,w),.11,lerp(KE[1],p[1]+v[1]/sp*.5,w)];};
const KD=.55,K_START=KT-STRIKE_CONTACT*KD;
function lessonPose(k:number,u:number):{pose:Pose;place:Place}{
 const v=velIn(L_TAB,k,u),sp=Math.hypot(v[0],v[1]),[x,z]=posIn(L_TAB,k,u),b=L_BALL_KEYS(u);let yaw=sp>.6?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z),p:Pose;
 if(k===0){p=u<KT-.6?blendPose(READY,dribble(distIn(L_TAB,k,u)/1.9,{foot:'l',speed:.6}),clamp(sp/.9)):blendPose(READY,runCycle(distIn(L_TAB,k,u)/3.4,{speed:clamp((sp-2)/5)}),clamp(sp/1.2));
  const w=(u-K_START)/KD;if(w>-.2&&w<1.4)p=blendPose(p,strike(clamp(w),{foot:'l',power:.3}),Math.min(sm(-.15,.1,w),1-sm(.9,1.4,w)));}
 else{const along=v[0]*Math.cos(YAW(b[0]-x,b[2]-z))-v[1]*Math.sin(YAW(b[0]-x,b[2]-z));
  if(u<KT+.2&&sp<4&&along<.3){p=blendPose(READY,backpedal(distIn(L_TAB,k,u)/1.1),clamp((sp-.2)/.6));yaw=YAW(-1,0);}else p=blendPose(READY,runCycle(distIn(L_TAB,k,u)/3.3,{speed:clamp((sp-1.5)/5)}),clamp(sp/1.2));}
 return{pose:p,place:{x,z,yaw}};}
const ch4q=()=>({yt:T(3,'Your turn'),kb:T(3,'knock the ball'),pd:T(3,'past the defender'),wr:T(3,'win the race'),ys:T(3,'your speed'),end:SEC(3)});
const tau4=(t:number)=>{const q=ch4q();return key(t,mono([[0,.2],[q.yt,.45],[q.kb,KT-.25],[q.pd,KT+.35],[q.wr,KT+1.1],[q.ys,KT+2],[q.end,KT+2.9]]),x=>x);};
/** the lesson camera: low three-quarter from the pitch side of the duel, tracking the midpoint of Williams, the defender and the ball */
const LCAM=(t:number)=>{const q=ch4q(),u=tau4(t),mid=(w:number):[number,number]=>{const n=posIn(L_TAB,0,w),d=posIn(L_TAB,1,w),b=L_BALL_KEYS(w);return[(n[0]+d[0]+b[0])/3,(n[1]+d[1]+b[2])/3];};
 const a=mid(u),b2=mid(u-.3),m:[number,number]=[(a[0]+b2[0])/2,(a[1]+b2[1])/2],F=key(t,mono([[0,1550],[q.yt+.4,1750],[q.kb,2400],[q.wr,2300],[q.end,2200]]),easeInOutSine);
 return cam([m[0]-1.5,4.2,m[1]+10],[m[0]+.5,.5,m[1]],F);};
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),u=tau4(t),up=tau4(tt);frame(s);
  // the stage: a navy print, the ground as stepped yellow light round the duel, the touchline in paper
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-34],[4,0,-34],[4,0,20],[-60,0,20]]));s.tone(K,floor,.2);
  const pool=(x:number,z:number,r:number)=>{const g=groundRing(c,x,z,r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(-20,-20,8),.2);s.tone(Y,pool(-19,-20.5,4.4),.2);
  const tl=new Path2D();groundLine(tl,c,[-60,-34],[4,-34],.14);s.knockout(tl,.8);
  // "Your turn": a ring round the ball at his feet
  const yt=sm(q.yt,q.yt+.4,tt,easeOutBack)*(1-sm(q.kb,q.kb+.4,tt));if(yt>.02){const b=L_BALL_KEYS(up),g=groundRing(c,b[0],b[2],.55*yt,24);if(g.length>2)yInk(s,ribbon(g,Math.max(5,.07*kAt(c,b)),{close:true,taper:0,wobble:.6}),.95);}
  // "knock the ball": the ball's path past the defender's outside drawn ahead of it
  const kb=sm(q.kb-.2,q.kb+.5,tt,easeOut)*(1-sm(q.ys+.3,q.ys+.8,tt));if(kb>.02){const pts:[number,number][]=[];for(let i=0;i<=10;i++){const e=i/10*kb;pts.push([lerp(KB[0],KE[0],e),lerp(KB[1],KE[1],e)]);}groundArrow(s,c,pts,.1);}
  // "past the defender": a ring on the defender, who has to turn
  const pd=sm(q.pd-.1,q.pd+.3,tt,easeOutBack)*(1-sm(q.wr+.4,q.wr+1,tt));if(pd>.02){const pr=new Path2D(),p=posIn(L_TAB,1,up),g=groundRing(c,p[0],p[1],pd,28);if(g.length>2)pr.addPath(ribbon(g,Math.max(5,.12*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}));s.fill(Y,pr,.95);}
  // "win the race": two lanes to the ball — his (yellow, around the defender) and the defender's (navy dashes, turning late)
  const wr=sm(q.wr-.2,q.wr+.4,tt)*(1-sm(q.end-.8,q.end-.3,tt));if(wr>.02){const a:[number,number][]=[],d:[number,number][]=[];for(let i=0;i<=10;i++){a.push(posIn(L_TAB,0,lerp(Math.max(KT,up),KT+2,i/10*wr+ (1-wr)*0)));d.push(posIn(L_TAB,1,lerp(Math.max(KT,up),KT+2,i/10*wr)));}
   groundArrow(s,c,a,.09);const dp=d.map(([x,z])=>P(c,[x,.03,z]) as Pt),gaps:[number,number][]=[];for(let x=.1;x<1;x+=.2)gaps.push([x,x+.1]);if(dp.length>1)s.fill(Y,ribbon(dp,Math.max(4,.05*kAt(c,[d[5][0],0,d[5][1]])),{taper:0,wobble:.3,gaps}),.6*wr);}
  // figures (duotone) and the ball, depth sorted
  const items:Item[]=[];L_ACT.forEach((a,k)=>{const st=lessonPose(k,up),g:V3=[st.place.x??0,0,st.place.z??0];if(depthOf(c,g)<1)return;const hero=k===0;
   items.push({depth:depthOf(c,g),draw:()=>drawPlayer(s,st.pose,c,duo(a.style,hero),st.place,{prev:hero?lessonPose(k,up-1/12):undefined,smear:hero&&up>KT})});});
  const ball=L_BALL_KEYS(u);items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const q2=P(c,ball),r=Math.max(13,BALL_R*kAt(c,ball));ballShadow(s,c,ball);whiteBall(s,q2[0],q2[1],r,u*9,{duo:true});}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  // "your speed": speed lines off him as he wins the race
  const ys=sm(q.ys-.1,q.ys+.3,tt)*(1-sm(q.end-.6,q.end-.2,tt));if(ys>.02){const p=posIn(L_TAB,0,up),v=velIn(L_TAB,0,up),g:V3=[p[0],1,p[1]];if(depthOf(c,g)>NEAR+1){const a=P(c,g),b=P(c,[p[0]-v[0]*.12,1,p[1]-v[1]*.12]);speedLines(s,Y,a[0],a[1],Math.atan2(a[1]-b[1],a[0]-b[0]),{n:6,seed:52,len:190*ys,width:8,cov:.9*ys});}}
  if(up>=KT&&up<KT+.25){const p=P(c,[KB[0],.15,KB[1]]);sparkBurst(s,Y,p[0],p[1],90,{n:9,seed:41,g:1-sm(KT+.1,KT+.25,up),width:10});}},
 still:5.5,
};

const story:RisoStory={
 id:'nico-williams-signature',format:'11v11',title:"Nico Williams' burst",
 theme:'Knock the ball past the defender and win the race with your speed.',
 ageNote:'UEFA Euro 2024 final, Spain 2–1 England, Berlin, 14 July 2024: the opening goal. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a burst — the ball shoots away from the point with speed lines behind it. */
 touch(s,x,y,age,seed){
  const u=age<=0?0:clamp(age/.7),e=easeOut(u),bx=x+e*300,by=y-e*40;
  if(u>.02)speedLines(s,Y,bx-40,by,0,{n:6,seed,len:60+220*e,width:10,cov:.9});
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,110,{n:8,seed,g:1-clamp(age/.3),width:11});
  whiteBall(s,bx,by,48,age*14+hash(seed,3)*TAU);
 },
};
export default story;
