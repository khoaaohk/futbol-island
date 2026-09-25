/** Iconic play film: Marc Cucurella, signature: defend, then join the attack. His assist for the winner of the UEFA Euro 2024 final,
 * Spain 2–1 England, Olympiastadion, Berlin, Sunday 14 July 2024 (21:00 CEST, night): Oyarzabal 86', from Cucurella's low cross.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/cucurella-signature/script.json. The lead voices it later with local Kokoro. Until then every
 * chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/cucurella-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/cucurella-signature/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * WHY THIS MOMENT (lib/town/iconicPlays.json: kind "signature", "defend, then join the attack", template overlap_run, side left, lesson
 * "Defend first, then join the attack when your winger has the ball"): the best-documented attacking moment of his career — Spain's LEFT-BACK
 * up in the attack on the left of England's box in the 86th minute of a European final, receiving from Oyarzabal and crossing low for the
 * winner. Written sources describe exactly that (short pass to Cucurella, Oyarzabal's run into the box, a low cross from the left past
 * Walker, a close-range finish before Pickford), so the live and replay chapters show only that. They do NOT describe how he got forward
 * (an overlap, or who the winger was), so his earlier run up the left is drawn but never narrated as an overlap, and the "defend first,
 * then overlap when your winger has the ball" part lives in the duotone lesson drill (ch4), which is plainly a demonstration, not the match.
 *
 * SOURCES (fetched Sept 2026 with curl + a generic UA, cached under the session scratchpad films/src-cache/; the footage was not reviewed):
 *  - Wikipedia, "UEFA Euro 2024 final" (raw; cache wiki-euro2024-final.txt): 14 July 2024, 21:00 CEST, Olympiastadion Berlin; Williams
 *    47', Palmer 73', Oyarzabal 86'; "In the 86th minute, Oyarzabal passed short to Cucurella and ran into the box, outpacing his marker as
 *    Cucurella crossed the ball back from the left and Oyarzabal scored reaching the ball with his right foot before Pickford; after a check
 *    for offside ... the goal stood"; Oyarzabal on for Morata 68', Palmer on for Mainoo 70', Watkins for Kane 61'; line-ups and shirt numbers
 *    (Cucurella LB 24, Oyarzabal 21; Walker 2, Guéhi 6, Stones 5, Pickford 1); kits from UEFA's line-up sheet: Spain red shirts, blue shorts,
 *    red socks; England white shirts, navy-blue shorts, white socks. https://en.wikipedia.org/wiki/UEFA_Euro_2024_final
 *  - The Guardian match report, David Hytner, 14 July 2024 (cache guardian-esp-eng-2024-final-report.txt): "the substitute Mikel Oyarzabal
 *    turned in Marc Cucurella's cross in the 86th minute"; "It was another super goal, Cucurella driving a low cross past Walker, Oyarzabal
 *    escaping Guéhi and converting from close range. There was no offside flag."
 *    https://www.theguardian.com/football/article/2024/jul/14/spain-england-euro-2024-final-european-championship-football
 *  - The Guardian live blog, 14 July 2024 (cache guardian-esp-eng-2024-final-live*.txt): second-half teams, "Spain 2-1 England" at full
 *    time; "the expressive hair of Nico Williams and Marc Cucurella ... flowing into moves down the Spanish left".
 *  - Wikipedia, "Marc Cucurella" (raw; cache wiki-marc-cucurella.txt): left-back / left wing-back, height 1.73 m, Chelsea 2022–, Euro 2024
 *    winner and Team of the Tournament. Wikipedia, "Mikel Oyarzabal" (raw; cache wiki-mikel-oyarzabal.txt): scored in the 86th minute of the
 *    final for the 2–1 win; height 1.81 m. https://en.wikipedia.org/wiki/Marc_Cucurella  https://en.wikipedia.org/wiki/Mikel_Oyarzabal
 * CONFIRMED by those accounts: the match, date, ground, 1–1 until the 86th minute (Palmer 73'), the winner 86', final score 2–1; Oyarzabal
 *  (a substitute, 21) passed short to Cucurella (24) and ran into the box; Cucurella crossed LOW from the LEFT, past Walker; Oyarzabal
 *  escaped Guéhi and scored from close range with his RIGHT foot, reaching the ball before Pickford; Cucurella's long curly hair; KITS: Spain
 *  red / dark-blue shorts / red socks, England white / navy shorts / white socks.
 * INFERRED / ILLUSTRATIVE: every position, speed and timing in metres and seconds (the cross from about the left corner of the box, the
 *  finish ≈ 5 m out, left of centre); that Cucurella crossed with his LEFT foot (he is a left-back/left-footer; the narration never says
 *  which foot) and took a touch before crossing; Oyarzabal's pass with his right foot; where the ball crossed the line (low, right of
 *  centre) and Pickford's late step and dive to his left; Walker's stretching block; where Williams, Olmo, Yamal, Stones, Rice, Shaw, Saka,
 *  Palmer, Bellingham, Foden and Watkins stood; how and from where Cucurella got forward (drawn as a run up the left, never called an
 *  overlap); Pickford's keeper kit (printed yellow; not named); Spain's yellow numbers and trim; England's navy trim; Spain attacking
 *  left-to-right on the main camera (so Cucurella's left flank is the FAR side); the celebration (Oyarzabal away toward the left touchline,
 *  Cucurella chasing him); the Olympiastadion drawn as a sunken oval bowl with the blue running track and a roof ring open over the
 *  Marathon Gate end, under a night sky; crowd colours; camera placements and lenses; no referee drawn; no VAR/offside graphic.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): ONE simulation on a real clock τ (seconds,
 * τ = 0 Cucurella's cross leaves his boot): ch1 = the high main-stand camera, live (the left-back up in attack, Oyarzabal's short pass and
 * run, the low cross, the finish, the net); ch2 = the slow-motion replay, low from behind Cucurella (a different camera plan from the
 * Williams/Yamal films: the view along his cross — past Walker, Oyarzabal escaping Guéhi, getting there first); ch3 = the replay from behind
 * the LEFT post, raised (past Pickford, then the celebration and the win); ch4 = a duotone lesson on its own small clock (defend first, then
 * when your winger has the ball run forward and join the attack). Seams are forward passages into the ball. Contact reads the solved
 * skeleton's toes (Cucurella's LEFT, Oyarzabal's RIGHT), so ball and boot always meet.
 * Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Framing: world centred on the CANVAS centre (never sheet.safe) with a
 * lens that widens for a square window. Inks: yellow (light, grass with blue, Spain trim), red (Spain, skin), blue (track, grass, sky), navy
 * (key line, shorts). Poses on twos, cameras on ones; all randomness is seeded. Budget ≈ 150–260 plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent,confetti} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,blendPose,runCycle,stand,strike,dribble,backpedal,lunge,celebrate,keeperSet,keeperDive,STRIKE_CONTACT,
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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`cucurella film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py cucurella-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/cucurella-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Berlin, live','Berlin, 2024, the Euro final. Spain, in red, and England are level with four minutes left. Left-back Marc Cucurella has joined the attack. Oyarzabal passes to him and runs into the box. Cucurella crosses it low... Oyarzabal scores! Goal!',
  ['Berlin','Spain, in red','England','Marc Cucurella','joined the attack','Oyarzabal passes','runs into the box','crosses it low','Oyarzabal scores','Goal']),
 prov('Watch again','Watch again, slowly. Cucurella drives it low, past Walker. Oyarzabal escapes his defender and gets there first.',
  ['Watch again','slowly','Cucurella drives','past Walker','Oyarzabal escapes','his defender','gets there first']),
 prov('Behind the goal','From behind the goal: past Pickford! Spain win the final, two-one.',
  ['From behind','past Pickford','Spain win','the final']),
 prov('Your turn','Your turn: defend first. Then, when your winger has the ball, run forward and join the attack.',
  ['Your turn','defend first','your winger','run forward','join the attack']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`cucurella film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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
 // a partly cloudy night over Berlin (kick-off 21:00, the winner about 22:40): deep navy-blue sky
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
/** Cucurella: 24, 1.73 m, his long dark curls (the card's appearance: curly) */
const CUCU:Kit=ESP(24,{skin:SKIN_L,hair:[K,.85],hairStyle:'curly',build:{height:1.73,bulk:.88,thighs:.96,head:1.02},seed:24});
const OYAR:Kit=ESP(21,{skin:SKIN_L,hair:[K,.9],build:{height:1.81,bulk:.92},seed:21});
const WALKER:Kit=ENG(2,{skin:SKIN_D,hairStyle:'bald',build:{height:1.83,bulk:1.02},seed:72});
const GUEHI:Kit=ENG(6,{skin:SKIN_D,build:{height:1.82,bulk:1},seed:76});
const PICKFORD:Kit={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],trim:K,boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'short',gloves:[B,.8],line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:K,build:{height:1.85},seed:1};
/** duotone versions for the lesson chapter (navy + yellow only): lead = the left-back and his winger (navy), the opponent in yellow */
const duo=(st:Kit,lead=false):Kit=>({...st,shirt:lead?[K,.45]:[Y,.6],shorts:lead?'paper':[K,.32],socks:lead?'paper':[Y,.6],trim:lead?'paper':K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[K,.9]:K,shade:[K,.2],numberInk:lead?'paper':K});

/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}):DrawResult{
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Cucurella's cross leaves his left boot) =================
const CB:Build=CUCU.build!,OB:Build=OYAR.build!;
/** CROSS0 where Cucurella crosses (about the left corner of the box); FIN where Oyarzabal meets it (≈ 5 m out, left of centre);
 * GIN where it crosses the line (low, right of centre); PASSA where Oyarzabal's short pass leaves his boot */
const CROSS0:[number,number]=[-16.2,-19.2],FIN:[number,number]=[-5.2,-1.1],GIN:V3=[0,.3,1.9],NET_HIT:V3=[1.9,.34,2.1],PASSA:[number,number]=[-22.4,-12.6];
const T_P=-1.7,T_R=-.7,CONTACT=1.05,TF=.4,T_GOAL=CONTACT+TF;
/** Cucurella's left-foot cross: the body opened a little left of the cross line; his left toe meets the ball at CROSS0 */
const CY=YAW(FIN[0]-CROSS0[0],FIN[1]-CROSS0[1])+16*D2R;
const CROSS_SK=solve(strike(STRIKE_CONTACT,{foot:'l',power:.7}),CB,{yaw:CY});
const CP:[number,number]=[CROSS0[0]-CROSS_SK.lToe[0],CROSS0[1]-CROSS_SK.lToe[2]];
/** Oyarzabal's right-foot finish from close range: body toward the goal; his right toe meets the ball at FIN */
const OY_YAW=YAW(GIN[0]-FIN[0],GIN[2]-FIN[1])-6*D2R;
const FIN_SK=solve(strike(STRIKE_CONTACT,{foot:'r',power:.4}),OB,{yaw:OY_YAW});
const OP:[number,number]=[FIN[0]-FIN_SK.rToe[0],FIN[1]-FIN_SK.rToe[2]];
/** Oyarzabal's short pass out to the left with his right foot (body turned right of the pass line) */
const RCV_AIM:[number,number]=[CP[0]-2.6,CP[1]-.6];
const PY=YAW(RCV_AIM[0]-PASSA[0],RCV_AIM[1]-PASSA[1])-16*D2R;
const PASS_SK=solve(strike(STRIKE_CONTACT,{foot:'r',power:.35}),OB,{yaw:PY});
const OYP:[number,number]=[PASSA[0]-PASS_SK.rToe[0],PASSA[1]-PASS_SK.rToe[2]];

type Role='hero'|'esp'|'eng'|'gk';
type Actor={name:string;role:Role;style:Kit;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 // Cucurella: up the left from deep (drawn, not narrated as an overlap), takes Oyarzabal's pass, crosses, then chases the scorer
 {name:'Cucurella',role:'hero',style:CUCU,key:true,keys:[[-10,-45,-24.6],[-8,-41,-24.8],[-6,-35.5,-24.2],[-4,-30,-23.2],[-2.4,-25,-21.8],[T_R,CP[0]-3.2,CP[1]-.7],[0,CP[0],CP[1]],[.5,CP[0]+1.4,CP[1]+.5],[T_GOAL+.6,CP[0]+2.6,CP[1]+1],[T_GOAL+2.2,-11.2,-19.2],[T_GOAL+3.8,-7.6,-20.6],[T_GOAL+5,-6.6,-21.3],[T_GOAL+7,-6.4,-21.6]]},
 // Oyarzabal: on the ball left of centre, the short pass out left, the run into the box past Guéhi, the finish, away to celebrate
 {name:'Oyarzabal',role:'esp',style:OYAR,key:true,keys:[[-10,-29.5,-6.4],[-7,-27.4,-8],[-4,-24.8,-10.4],[T_P-.5,OYP[0]-.6,OYP[1]+.5],[T_P,OYP[0],OYP[1]],[T_P+.5,OYP[0]+1.5,OYP[1]+1],[-.4,-17.4,-8.6],[.3,-11.8,-5],[CONTACT,OP[0],OP[1]],[CONTACT+.45,OP[0]+1.2,OP[1]-.8],[T_GOAL+.8,-4.4,-4.6],[T_GOAL+2.2,-4.8,-11],[T_GOAL+3.6,-5.2,-17.4],[T_GOAL+5,-5.5,-20.8],[T_GOAL+7,-5.6,-21.9]]},
 {name:'Walker',role:'eng',style:WALKER,key:true,keys:[[-10,-17.6,-13.6],[-4,-15.8,-14.6],[-1.2,-14.8,-15.4],[0,-14.3,-15.9],[.6,-13.8,-15.3],[3,-11.4,-12.4],[7,-10.4,-10.6]]},
 {name:'Pickford',role:'gk',style:PICKFORD,key:true,keys:[[-10,-3.2,-1],[-2,-3,-1.8],[0,-2.9,-2.2],[.6,-2.7,-1.6],[CONTACT,-2.5,-1.3],[8,-2.5,-1.3]]},
 {name:'Guéhi',role:'eng',style:GUEHI,key:true,keys:[[-10,-21.8,-4.4],[-4,-20.2,-7.4],[T_P,-19.2,-9.8],[-.4,-15.4,-6.8],[.3,-11.2,-3.9],[CONTACT,-6.9,-.2],[T_GOAL,-5.9,.2],[T_GOAL+2,-6.4,.6],[8,-6.6,.6]]},
 {name:'Stones',role:'eng',style:ENG(5,{hair:[K,.8],build:{height:1.88}}),keys:[[-10,-9.4,3.6],[-2,-8.4,2.8],[1,-7,1.6],[4,-6.6,1.2]]},
 {name:'Saka',role:'eng',style:ENG(7,{skin:SKIN_D}),keys:[[-10,-35,-16.6],[-4,-28,-19],[-1,-22.6,-18.6],[1,-19.8,-17.6],[4,-17.4,-16.2]]},
 {name:'Rice',role:'eng',style:ENG(4,{build:{height:1.85}}),keys:[[-10,-24.4,-2.6],[-3,-19.6,-4.4],[0,-15.6,-5.4],[3,-13.2,-4.8],[6,-12.4,-4]]},
 {name:'Shaw',role:'eng',style:ENG(3,{hair:[K,.7]}),keys:[[-10,-14.4,10.6],[-3,-11.8,8],[0,-9.8,5.4],[3,-8.6,4],[6,-8.2,3.5]]},
 {name:'Williams',role:'esp',style:ESP(17,{skin:SKIN_D,hair:[K,.92],hairStyle:'curly'}),keys:[[-10,-22.6,-1],[-3,-17.4,-3.6],[0,-14.2,-6.2],[3,-12.2,-5.6],[6,-10.6,-6.4]]},
 {name:'Olmo',role:'esp',style:ESP(10,{skin:SKIN_L}),keys:[[-10,-24,4],[-3,-18.2,4.4],[0,-12.8,3.6],[3,-10,3],[6,-9.2,2.6]]},
 {name:'Yamal',role:'esp',style:ESP(19,{skin:SKIN_D,hair:[K,.92]}),keys:[[-10,-24,19.6],[-3,-17.4,14],[0,-12,9.4],[3,-9.8,7],[6,-9.2,6]]},
 {name:'Palmer',role:'eng',style:ENG(24,{}),keys:[[-10,-30,6],[-3,-26,4],[0,-23.2,2],[4,-20.4,1]]},
 {name:'Bellingham',role:'eng',style:ENG(10,{skin:SKIN_D}),keys:[[-10,-35,-2],[-3,-31,-3.6],[0,-28.4,-5],[4,-24.6,-5]]},
 {name:'Fabián',role:'esp',style:ESP(8,{hair:[K,.85]}),keys:[[-10,-37,-5.6],[-3,-31,-7.6],[0,-27.6,-8.6],[4,-24.6,-8]]},
 {name:'Foden',role:'eng',style:ENG(11,{}),keys:[[-10,-32,12],[-3,-28.4,10],[4,-25.4,8]]},
 {name:'Zubimendi',role:'esp',style:ESP(18,{hair:[K,.85]}),keys:[[-10,-45,0],[-3,-40,-2],[4,-36,-2]]},
 {name:'Watkins',role:'eng',style:ENG(19,{skin:SKIN_D}),keys:[[-10,-46,2],[-3,-43.4,1],[4,-40.4,0]]},
];
const CUC=0,OY=1,WAL=2,GK=3,GUE=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
type Tab={X:number[];Z:number[];D:number[];t0:number};
const DT=.02;
function tables(list:number[][][],T0:number,T1:number):Tab[]{return list.map(keys=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D,t0:T0};});}
const TABLES=tables(ACTORS.map(a=>a.keys),-10,12);
const samp=(tb:Tab,arr:number[],tau:number)=>{const u=clamp((tau-tb.t0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posIn=(tb:Tab[],k:number,tau:number):[number,number]=>[samp(tb[k],tb[k].X,tau),samp(tb[k],tb[k].Z,tau)];
const distIn=(tb:Tab[],k:number,tau:number)=>samp(tb[k],tb[k].D,tau);
const velIn=(tb:Tab[],k:number,tau:number):[number,number]=>{const a=posIn(tb,k,tau-.08),b=posIn(tb,k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};
const posOf=(k:number,tau:number)=>posIn(TABLES,k,tau),distOf=(k:number,tau:number)=>distIn(TABLES,k,tau),velOf=(k:number,tau:number)=>velIn(TABLES,k,tau);

// ---- the ball: Oyarzabal's feet → the short pass out left → Cucurella's touch → the low cross → Oyarzabal's right foot → the net ----
const fwdIn=(tb:Tab[],k:number,tau:number,d=.5):[number,number]=>{const p=posIn(tb,k,tau),v=velIn(tb,k,tau),sp=Math.hypot(v[0],v[1])||1;return[p[0]+v[0]/sp*d,p[1]+v[1]/sp*d];};
const fwdBall=(k:number,tau:number,d=.5)=>fwdIn(TABLES,k,tau,d);
/** where the pass reaches Cucurella: just ahead of him at T_R */
const RCV=fwdBall(CUC,T_R,.55);
function ballAt(tau:number):V3{
 if(tau<T_P){const f=fwdBall(OY,tau,.5+.14*Math.abs(Math.sin(tau*4.4))),w=sm(T_P-.45,T_P,tau);return[lerp(f[0],PASSA[0],w),.11,lerp(f[1],PASSA[1],w)];}
 if(tau<T_R){const u=(tau-T_P)/(T_R-T_P),e=1.25*u-.25*u*u;return[lerp(PASSA[0],RCV[0],e),.11,lerp(PASSA[1],RCV[1],e)];}
 if(tau<0){const f=fwdBall(CUC,tau,.55+.1*Math.sin((tau-T_R)*9)),w=sm(-.4,0,tau);return[lerp(f[0],CROSS0[0],w),.11,lerp(f[1],CROSS0[1],w)];}
 if(tau<CONTACT){const u=tau/CONTACT,e=1.15*u-.15*u*u;return[lerp(CROSS0[0],FIN[0],e),.11+.2*Math.sin(Math.PI*Math.min(1,u*1.25)),lerp(CROSS0[1],FIN[1],e)];}
 const s=tau-CONTACT;if(s<TF){const u=s/TF;return[lerp(FIN[0],GIN[0],u),lerp(.11,GIN[1],u)+.1*Math.sin(Math.PI*u),lerp(FIN[1],GIN[2],u)];}
 const e=s-TF;if(e<.12)return mix3(GIN,NET_HIT,easeOut(e/.12));
 const d=clamp((e-.12)/.5);return[lerp(NET_HIT[0],1.7,d),Math.max(.11,NET_HIT[1]*(1-d)+.11*d)+.05*Math.abs(Math.sin(d*9))*(1-d),lerp(NET_HIT[2],2.6,d)];
}

// ---- poses ----
const RAD=D2R;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:18,pitch:4,lShA:28,rShA:28,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-4});
const ARMS_UP:Partial<Pose>={lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1};
/** the stretch for the ball: lean in, reach long with the right leg */
const STRETCH:Partial<Pose>={lean:26,rHipF:78,rKnee:8,lKnee:52,rAnk:18};
const SD=.6,S_START=-STRIKE_CONTACT*SD,PD=.6,P_START=T_P-STRIKE_CONTACT*PD,FD=.5,F_START=CONTACT-STRIKE_CONTACT*FD;
/** Walker's block: a lunge toward the side the cross passes him (his left or right, from the geometry) */
const WALK_SIDE:'l'|'r'=(()=>{const w=posOf(WAL,0),c=posOf(CUC,0),f=[c[0]-w[0],c[1]-w[1]],l=Math.hypot(f[0],f[1])||1,rt=[-f[1]/l,f[0]/l],b=[lerp(CROSS0[0],FIN[0],.12)-w[0],lerp(CROSS0[1],FIN[1],.12)-w[1]];return b[0]*rt[0]+b[1]*rt[1]>0?'r':'l';})();
function poseOf(k:number,tau:number):{pose:Pose;place:Place}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau),toBall=YAW(b[0]-x,b[2]-z);
 let yaw=sp>.6?YAW(v[0],v[1]):toBall,p:Pose;
 if(a.role==='hero'){
  if(tau<T_GOAL+.3){
   if(tau>T_R-.1&&tau<-.35){const dr=dribble(distOf(k,tau)/1.9,{foot:'l',speed:.6});p=blendPose(READY,dr,clamp(sp/.9));}
   else p=blendPose(idle(tau,1),runCycle(distOf(k,tau)/3.2,{speed:clamp((sp-1.8)/5.5)}),clamp(sp/1.2));
   if(tau<T_R&&tau>T_P-.4)p=over(p,{neckY:-30,twist:-6},bump(T_P-.4,T_R,tau));
   const u=(tau-S_START)/SD;if(u>-.3&&u<1.6){yaw=lerpAng(yaw,CY,sm(-.3,.15,u));p=blendPose(p,strike(clamp(u),{foot:'l',power:.7}),Math.min(sm(-.25,.1,u),1-sm(1.05,1.6,u)));}}
  else{p=blendPose(READY,celebrate(distOf(k,tau)/3.4,{kind:'run'}),sm(T_GOAL+.3,T_GOAL+.9,tau));if(tau>T_GOAL+4.6){p=celebrate((tau-T_GOAL-4.6)*.8,{kind:'arms'});yaw=YAW(1,-.3);}}
 }else if(a.role==='gk'){
  yaw=YAW(b[0]-x,b[2]-z);const q=keeperSet(tau*1.5),u=(tau-(CONTACT+.04))/.8;
  p=u>0?keeperDive(Math.min(1,u),{side:'l',height:.1}):q;if(u>0)yaw=Math.PI;
 }else if(k===OY){
  if(tau<P_START-.05){const dr=dribble(distOf(k,tau)/1.9,{foot:'r',speed:.4+.35*clamp(sp/5)});p=blendPose(READY,dr,clamp(sp/.9));}
  else if(tau<T_GOAL+.3)p=blendPose(READY,runCycle(distOf(k,tau)/3.4,{speed:clamp((sp-1.8)/5.5)}),clamp(sp/1.2));
  else p=blendPose(READY,celebrate(distOf(k,tau)/3.4,{kind:'run'}),sm(T_GOAL+.3,T_GOAL+.9,tau));
  if(tau>T_GOAL+4.4){p=celebrate((tau-T_GOAL-4.4)*.8,{kind:'arms'});yaw=YAW(-1,-.2);}
  const u=(tau-P_START)/PD;if(u>-.2&&u<1.4){yaw=lerpAng(yaw,PY,sm(-.2,.2,u));p=blendPose(p,strike(clamp(u),{foot:'r',power:.35}),Math.min(sm(-.15,.1,u),1-sm(.95,1.4,u)));}
  const f=(tau-F_START)/FD;if(f>-.3&&f<1.6){yaw=lerpAng(yaw,OY_YAW,sm(-.3,.15,f));p=blendPose(p,strike(clamp(f),{foot:'r',power:.4}),Math.min(sm(-.25,.1,f),1-sm(1.05,1.6,f)));p=over(p,STRETCH,.55*bump(.2,1.2,f));}
 }else{
  const eng=a.role==='eng',along=v[0]*Math.cos(toBall)-v[1]*Math.sin(toBall);
  if(eng&&sp>.4&&sp<4&&along<0){p=blendPose(READY,backpedal(distOf(k,tau)/1.1),clamp((sp-.4)/.8));yaw=toBall;}
  else{const s=clamp((sp-1.5)/5.5);p=blendPose(eng?READY:idle(tau,k),runCycle(distOf(k,tau)/3.3+k*.37,{speed:s}),clamp((sp-.3)/.9));if(sp<.6)yaw=toBall;}
  // Walker faces Cucurella and stretches for the cross as it goes past him
  if(k===WAL){const c=posOf(CUC,tau);if(tau<.8)yaw=YAW(c[0]-x,c[1]-z);const u=(tau+.35)/.9;if(u>0&&u<1.4)p=blendPose(p,lunge(clamp(u),{side:WALK_SIDE}),Math.min(sm(0,.25,u),1-sm(1,1.4,u)));}
  // Guéhi watches the ball, then turns his head to Oyarzabal going past him
  if(k===GUE){const o=posOf(OY,tau);yaw=lerpAng(sp>.6?YAW(v[0],v[1]):toBall,YAW(o[0]-x,o[1]-z),.5*sm(-1,0,tau));}
  if(a.role==='esp'&&tau>T_GOAL+.5)p=over(p,ARMS_UP,sm(T_GOAL+.5,T_GOAL+1,tau)*.6);
 }
 return{pose:p,place:{x,z,yaw}};
}

type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `heroes` draw with motion smear + secondary motion; `cap` limits figure detail (passages),
 * small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;heroes?:number[];glow?:number;cap?:boolean}){
 const ball=ballAt(tau),items:Item[]=[],ppu=pxPer(s),hs=o.heroes??[];
 ACTORS.forEach((a,k)=>{const st=poseOf(k,tp),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(a.key?1:2.5))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu,mine=k===CUC||k===OY;if(o.cap&&!mine&&hPx<30)return;const detail:Detail|undefined=hPx<55||(!a.key&&hPx<100)||(o.cap&&!mine&&hPx<150)?'low':o.cap?'mid':undefined;
  const hero=hs.includes(k)&&!o.cap;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,a.style,st.place,{prev:hero?poseOf(k,tp-1/12):undefined,smear:hero,detail})});});
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  whiteBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball};}
/** ground ring round a player (team rings, highlights) */
function ringAt(path:Path2D,c:Camera,k:number,tp:number,g:number,r=.9){const p=posOf(k,tp),q=groundRing(c,p[0],p[1],r*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}));}
/** speed lines trailing a running player */
function burstLines(s:Sheet,c:Camera,k:number,tp:number,amt:number,seed:number,len=150){if(amt<=.02)return;const p=posOf(k,tp),v=velOf(k,tp),g:V3=[p[0],1,p[1]];if(depthOf(c,g)<NEAR+1)return;const a=P(c,g),b=P(c,[p[0]-v[0]*.12,1,p[1]-v[1]*.12]);
 speedLines(s,K,a[0],a[1],Math.atan2(a[1]-b[1],a[0]-b[0]),{n:6,seed,len:len*amt,width:7,cov:.8*amt});}
/** a run drawn ahead on the grass: actor k's path between τ a and b, revealed by w */
function runArrow(s:Sheet,c:Camera,k:number,a:number,b:number,w:number,wm=.1){if(w<=.02)return;const pts:[number,number][]=[];for(let i=0;i<=12;i++)pts.push(posOf(k,lerp(a,a+(b-a)*w,i/12)));groundArrow(s,c,pts,wm);}
/** a dashed yellow line on the grass from a to b, revealed by w */
function dashLine(s:Sheet,c:Camera,a0:[number,number],b0:[number,number],w:number,cov=.9){if(w<=.02)return;const A:V3=[a0[0],.03,a0[1]],E=mix3(A,[b0[0],.03,b0[1]],w);if(depthOf(c,A)<NEAR+.5||depthOf(c,E)<NEAR+.5)return;const gaps:[number,number][]=[];for(let u=.08;u<1;u+=.14)gaps.push([u,u+.06]);
 s.fill(Y,ribbon([P(c,A),P(c,E)],Math.max(5,.1*kAt(c,E)),{taper:0,wobble:.4,gaps}),cov);}
function spark(s:Sheet,c:Camera,at:[number,number],t0:number,tp:number,size:number,seed:number){if(tp<t0||tp>=t0+.25)return;const p=P(c,[at[0],.15,at[1]]);if(depthOf(c,[at[0],.15,at[1]])<NEAR+.5)return;sparkBurst(s,Y,p[0],p[1],size*(.6+.4*sm(t0,t0+.1,tp,easeOut)),{n:10,seed,g:1-sm(t0+.1,t0+.25,tp),width:10});}
/** the ball's path as navy dots between τ a and b (it stays low) */
function ballDots(s:Sheet,c:Camera,a:number,b:number,cov=.6){if(b<=a)return;const dots=new Path2D();for(let i=0;i<=16;i++){const p=ballAt(a+(b-a)*i/16);if(depthOf(c,p)<NEAR+.5)continue;const pp=P(c,p),r=clamp(.045*kAt(c,p),3,14);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);}s.fill(K,dots,cov);}
/** a yellow ring on a solved toe (the boot that meets the ball) */
function toeRing(s:Sheet,c:Camera,k:number,tp:number,foot:'l'|'r',w:number,bd:Build){if(w<=.02)return;const st=poseOf(k,tp),sk=solve(st.pose,bd,st.place),t=foot==='l'?sk.lToe:sk.rToe;if(depthOf(c,t)<NEAR+.5)return;const p=P(c,t),r=.32*kAt(c,t)*w;yRing(s,p[0],p[1],r,Math.max(4,.035*kAt(c,t)));}

// ================= chapter 1 (live): the high main-stand camera; the left-back up in attack, the pass, the run, the low cross, the finish =================
const ch1q=()=>({be:T(0,'Berlin'),sp:T(0,'Spain, in red'),en:T(0,'England'),mc:T(0,'Marc Cucurella'),ja:T(0,'joined the attack'),op:T(0,'Oyarzabal passes'),rb:T(0,'runs into the box'),cl:T(0,'crosses it low'),os:T(0,'Oyarzabal scores'),g:T(0,'Goal'),end:SEC(0)});
/** τ keyed to the words: a pre-roll with Cucurella running up the left, the play near real time between the cues */
const tau1=(t:number)=>{const q=ch1q();return key(t,mono([[0,-9.8],[q.mc,-6.6],[q.ja,-5.2],[q.op,T_P-.3],[q.rb,T_P+.5],[q.cl,-.1],[q.os,CONTACT-.1],[q.g,T_GOAL+.4],[q.end,T_GOAL+.4+(q.end-q.g)*.9]]),x=>x);};
const BCAM:V3=[-28,17,44];
function ch1Look(tau:number):V3{const b=ballAt(Math.min(tau,T_GOAL+.1)),cu=posOf(CUC,tau),oy=posOf(OY,tau);
 const onBall:V3=[b[0]+1,1,b[2]],pair:V3=[(b[0]+cu[0])/2+1.5,1,(b[2]+cu[1])/2],three:V3=[(cu[0]+oy[0]+FIN[0])/3+1,1,(cu[1]+oy[1]+FIN[1])/3];
 if(tau<T_P-.6)return mix3(onBall,pair,sm(-9,-6,tau,easeInOutSine));
 if(tau<CONTACT)return mix3(pair,three,sm(T_P-.6,0,tau,easeInOutSine));
 if(tau<T_GOAL+.8)return mix3(three,[-3.5,1.2,-1],sm(CONTACT-.2,T_GOAL+.2,tau,easeInOutSine));
 return mix3([-3.5,1.2,-1],[oy[0],1.2,oy[1]],sm(T_GOAL+.8,T_GOAL+2.4,tau,easeInOutSine));}
function ch1Cam(t:number){const q=ch1q(),tau=tau1(t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const wide:V3=[-34,4,-14],look=mix3(wide,av(ch1Look),sm(q.sp-.4,q.en,t,easeInOutSine));
 const F=key(t,mono([[0,1700],[q.sp,2300],[q.mc,3600],[q.ja,3000],[q.op,3500],[q.rb,3300],[q.cl,3500],[q.os,3900],[q.g,4100],[q.end,4400]]),easeInOutSine);return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const q=ch1q(),tt=twos(t),c=ch1Cam(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // team rings: red for Spain on "Spain, in red", navy for England on "England"; yellow for Cucurella on his name, then Oyarzabal
  const ra=sm(q.sp,q.sp+.3,tt,easeOutBack)*(1-sm(q.en+.2,q.en+.8,tt)),re=sm(q.en,q.en+.3,tt,easeOutBack)*(1-sm(q.mc,q.mc+.6,tt)),ry=sm(q.mc,q.mc+.3,tt,easeOutBack)*(1-sm(q.op,q.op+.5,tt)),ro=sm(q.op,q.op+.3,tt,easeOutBack)*(1-sm(q.cl,q.cl+.4,tt));
  if(ra>.02||re>.02||ry>.02||ro>.02){const pa=new Path2D(),pe=new Path2D(),py=new Path2D();
   ACTORS.forEach((a,k)=>{if((a.role==='esp'||a.role==='hero')&&ra>.02)ringAt(pa,c,k,tp,ra);if((a.role==='eng'||a.role==='gk')&&re>.02)ringAt(pe,c,k,tp,re);});
   if(ry>.02)ringAt(py,c,CUC,tp,ry*1.25);if(ro>.02)ringAt(py,c,OY,tp,ro*1.2);
   if(ra>.02)s.fill(R,pa,.95);if(re>.02)s.fill(K,pe,.9);if(ry>.02||ro>.02)yInk(s,py,.95);}
  // "joined the attack": the left-back's run up the left, drawn on the grass from deep to where the pass will find him
  runArrow(s,c,CUC,-9.5,T_R,sm(q.ja-.1,q.ja+.8,tt,easeOut)*(1-sm(q.rb,q.rb+.5,tt)),.12);
  // "Oyarzabal passes": the short pass out to the left, dashed
  dashLine(s,c,PASSA,RCV,sm(q.op-.1,q.op+.4,tt)*(1-sm(q.cl,q.cl+.4,tt)));
  // "runs into the box": his run to where the cross will arrive
  runArrow(s,c,OY,Math.max(T_P,Math.min(tp,.2)),CONTACT,sm(q.rb-.1,q.rb+.6,tt,easeOut)*(1-sm(q.os,q.os+.4,tt)),.1);
  // "crosses it low": the cross line across the box
  dashLine(s,c,CROSS0,FIN,sm(q.cl-.2,q.cl+.3,tt)*(1-sm(q.os+.2,q.os+.7,tt)));
  drawWorld(s,c,tau,tp,{ballMin:11,cap:t>q.end-.7});
  burstLines(s,c,OY,tp,sm(q.rb,q.rb+.3,tt)*(1-sm(q.cl+.3,q.os,tt)),31,120);
  spark(s,c,CROSS0,0,tp,80,9);spark(s,c,FIN,CONTACT,tp,100,11);},
 aperture(t){const c=ch1Cam(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:10,
};

// ================= chapter 2 (TV replay, slow motion, low from behind Cucurella): the cross past Walker, Oyarzabal escapes Guéhi, gets there first =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),cd:T(1,'Cucurella drives'),pw:T(1,'past Walker'),oe:T(1,'Oyarzabal escapes'),hd:T(1,'his defender'),tf:T(1,'gets there first'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,-2.3],[q.sl,-1.8],[q.cd,-.25],[q.pw,.2],[q.oe,.5],[q.hd,.72],[q.tf,CONTACT-.04],[q.end,T_GOAL+.3]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),cu=posOf(CUC,Math.min(tau,.1)),b=ballAt(Math.min(tau,T_GOAL)),fol=sm(q.cd,q.tf,t,easeInOutSine),fin=sm(q.tf-.2,q.end,t,easeInOutSine);
 // a low camera behind Cucurella's left shoulder, looking along his cross; it swings with the ball across the box
 const pos:V3=mix3([cu[0]-7.5,1.6,cu[1]-4.6],[FIN[0]-14,3.6,FIN[1]-2],fol*.85);
 const look=mix3(mix3([cu[0]+7,1,cu[1]+5],[b[0],.7,b[2]],fol),[FIN[0]+1.5,.8,FIN[1]+1],fin*.7);
 const F=key(t,mono([[0,2500],[q.sl,2600],[q.cd,2800],[q.pw,2400],[q.oe,2300],[q.hd,2400],[q.tf,2700],[q.end,2900]]),easeInOutSine);return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt),goalIn=tau-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.1+.8*sm(0,.4,goalIn),flash:.05+sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "Cucurella drives … low": the ball's path stays on the grass, dotted behind it
  if(tp>0)ballDots(s,c,0,Math.min(tp,CONTACT),.55*(1-sm(q.tf+.4,q.tf+1,tt)));
  // "his defender": a navy tether from Guéhi to Oyarzabal that stretches as Oyarzabal escapes; Guéhi ringed yellow
  const hd=sm(q.hd-.1,q.hd+.4,tt,easeOutBack)*(1-sm(q.tf+.2,q.tf+.7,tt));if(hd>.02){const g=posOf(GUE,tp),o=posOf(OY,tp),A:V3=[g[0],.9,g[1]],Bv:V3=[o[0],.9,o[1]],gaps:[number,number][]=[];for(let u=.06;u<1;u+=.16)gaps.push([u,u+.07]);
   if(depthOf(c,A)>NEAR+1&&depthOf(c,Bv)>NEAR+1)s.fill(K,ribbon([P(c,A),P(c,Bv)],Math.max(4,.05*kAt(c,A)),{taper:0,wobble:.4,gaps}),.85*hd);
   const pr=new Path2D();ringAt(pr,c,GUE,tp,hd,1);yInk(s,pr,.95);}
  // "past Walker": Walker ringed as the cross goes by his stretching leg
  const pw=sm(q.pw-.1,q.pw+.3,tt,easeOutBack)*(1-sm(q.oe+.2,q.oe+.7,tt));if(pw>.02){const pr=new Path2D();ringAt(pr,c,WAL,tp,pw,1);yInk(s,pr,.95);}
  // "Oyarzabal escapes": his run to the ball drawn ahead of him
  runArrow(s,c,OY,Math.max(-.2,Math.min(tp,CONTACT-.1)),CONTACT,sm(q.oe-.1,q.oe+.4,tt,easeOut)*(1-sm(q.tf,q.tf+.4,tt)),.09);
  const w=drawWorld(s,c,tau,tp,{ballMin:15,heroes:[CUC,OY],glow:sm(q.w,q.w+.4,tt)*(1-sm(q.sl,q.cd,tt)),cap:t>q.end-.7||t<.6});
  burstLines(s,c,OY,tp,sm(q.oe-.1,q.oe+.3,tt)*(1-sm(q.tf,q.tf+.3,tt)),33,170);
  // "Cucurella drives": a yellow ring on the left boot as it meets the ball; "gets there first": the ring on Oyarzabal's right boot
  toeRing(s,c,CUC,tp,'l',sm(q.cd-.15,q.cd+.2,tt,easeOutBack)*(1-sm(q.pw+.2,q.pw+.6,tt)),CB);
  toeRing(s,c,OY,tp,'r',sm(q.tf-.15,q.tf+.2,tt,easeOutBack)*(1-sm(q.end-.6,q.end-.2,tt)),OB);
  spark(s,c,CROSS0,0,tp,110,12);spark(s,c,FIN,CONTACT,tp,120,14);
  if(tp>=.05&&tp<T_GOAL+.1&&depthOf(c,w.ball)>NEAR+.5){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:15,len:120,width:6,cov:.75});}},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t));if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[x,y]=P(c,p),r=Math.max(16,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5,
};

// ================= chapter 3 (replay from behind the LEFT post, raised): past Pickford, then the celebration — Spain win the final =================
const ch3q=()=>({fb:T(2,'From behind'),pp:T(2,'past Pickford'),sw:T(2,'Spain win'),fi:T(2,'the final'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,-.5],[q.fb+.6,.25],[q.pp,T_GOAL-.1],[q.sw,T_GOAL+1.6],[q.fi,T_GOAL+2.8],[q.end,T_GOAL+5]]),x=>x);};
const GCAM:V3=[6.2,3.1,-6.8];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.min(tau,T_GOAL-.02)),o=posOf(OY,tau),cu=posOf(CUC,tau);
 const toBall=sm(0,q.pp,t,easeInOutSine),toCel=sm(q.pp+.4,q.fi,t,easeInOutSine);
 const look0:V3=[(CROSS0[0]+FIN[0])/2,.4,(CROSS0[1]+FIN[1])/2],look1:V3=[b[0]-.5,clamp(b[1],.6,2),b[2]],look2:V3=[(o[0]+cu[0])/2,1.2,(o[1]+cu[1])/2];
 const look=mix3(mix3(look0,look1,toBall*.75),look2,toCel);
 const pos:V3=add(GCAM,[-1.5*toCel,.8*toCel,-3*toCel]),F=key(t,mono([[0,3000],[q.pp,2400],[q.pp+.8,2200],[q.sw,2400],[q.fi,2700],[q.end,3000]]));return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.pp;
  const shake=t>=hitT?7*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.12+1.1*sm(0,.5,goalIn),flash:.1+1.4*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  if(tp>0&&tp<T_GOAL+.4)ballDots(s,c,Math.max(0,tp-1.2),Math.min(tp,T_GOAL));
  // "past Pickford": his reach on the grass — the glove's furthest point — and the ball beyond it
  const reach=sm(q.pp,q.pp+.35,tt,easeOutBack)*(1-sm(q.sw,q.sw+.5,tt));
  // "Spain win": red rings under every Spain player as the arms go up
  const sw=sm(q.sw,q.sw+.3,tt,easeOutBack)*(1-sm(q.end-.8,q.end-.3,tt));if(sw>.02){const pr=new Path2D();ACTORS.forEach((a,k)=>{if(a.role==='esp'||a.role==='hero')ringAt(pr,c,k,tp,sw,1);});s.fill(R,pr,.95);}
  const w=drawWorld(s,c,tau,tp,{ballMin:13,heroes:t>q.sw?[CUC,OY]:[OY],cap:t>q.end-.7||t<.6});
  if(reach>.02){const g=posOf(GK,tp),a=P(c,[g[0],.04,g[1]+.4]),b=P(c,[g[0],.04,lerp(g[1]+.4,1.5,reach)]),k=kAt(c,[g[0],0,.5]),gaps:[number,number][]=[];for(let u=.1;u<1;u+=.25)gaps.push([u,u+.1]);
   yInk(s,ribbon([a,b],Math.max(6,.06*k),{taper:0,wobble:0,gaps}),.9*reach);}
  if(tp>CONTACT&&tp<T_GOAL+.1&&depthOf(c,w.ball)>NEAR+.6){const a=P(c,ballAt(tp-.06)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:21,len:130,width:7,cov:.8});}
  // "the final": red and yellow confetti over the pair, and a star burst over Cucurella
  const fi=sm(q.fi,q.fi+.4,tt);if(fi>.02){const o=posOf(OY,tp),cu=posOf(CUC,tp),h:V3=[(o[0]+cu[0])/2,3,(o[1]+cu[1])/2];if(depthOf(c,h)>NEAR+1){const p=P(c,h),sz=Math.min(s.W,s.H)*.45;
   confetti(s,[R,Y,'paper'],[p[0]-sz,p[1]-sz*.6+sz*.5*(tt-q.fi),sz*2,sz*1.2],Math.round(26*fi),61+Math.floor(tt*6),{size:14});
   const hc:V3=[cu[0],2.4,cu[1]];if(depthOf(c,hc)>NEAR+1){const pc=P(c,hc);sparkBurst(s,Y,pc[0],pc[1],(40+.5*kAt(c,hc))*easeOutBack(clamp((tt-q.fi)/.4)),{n:8,seed:44,g:1-clamp((tt-q.fi-.3)/.8),width:8});}}}},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),[x,z]=posOf(CUC,tau),p:V3=[x,1.1,z];if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[px,py]=P(c,p);return apertureDisc(px,py,Math.max(20,.2*kAt(c,p)),12);},
 still:4.4,
};

// ================= chapter 4 (duotone lesson, its own small clock u): defend first; when your winger has the ball, run forward and join the attack =================
/** the lesson drill (illustrative, not the match): the left-back stops an attacker and pokes the ball to his winger, then runs past the
 * winger up the outside (the overlap), and the winger slides it into his run. Attack is toward +x. */
const TK=1.5,TW=2.4,TPW=4.3,TLR=5.1;
const L_ACT:{style:Kit;lead:boolean;keys:number[][]}[]=[
 {style:CUCU,lead:true,keys:[[-1,-39.8,-24],[0,-40.1,-24],[.8,-40.9,-24],[TK,-40.5,-24.1],[1.9,-40.6,-24],[2.5,-40.2,-24.4],[3.2,-37.6,-25.6],[3.9,-33.8,-26.6],[4.6,-29.6,-27],[TLR,-26.2,-26.9],[6.1,-22,-26.4],[7.6,-18.6,-26]]},
 {style:ESP(11,{hair:[K,.85]}),lead:true,keys:[[-1,-37,-15.4],[0,-37.4,-15.6],[1.4,-38.4,-16.4],[TW,-38.6,-16.9],[3.1,-36.4,-17.2],[3.8,-33.2,-17.4],[TPW,-31.2,-17.6],[5,-28.8,-17.4],[6.3,-25.4,-17],[7.6,-23.4,-16.6]]},
 {style:ENG(7,{}),lead:false,keys:[[-1,-31,-24.2],[0,-33.6,-24.2],[.8,-36.5,-24.1],[TK,-39,-24],[1.9,-39.5,-23.9],[2.6,-39.3,-23.3],[3.4,-38.6,-23],[4.6,-37.4,-23.6],[7.6,-35.6,-24]]},
];
const L_TAB=tables(L_ACT.map(a=>a.keys),-1,8);
/** the tackle: the left-back's left toe meets the ball at TKB and pokes it infield to the winger's feet */
const TK_YAW=YAW(1,.9);
const TK_SK=solve(strike(STRIKE_CONTACT,{foot:'l',power:.3}),CB,{yaw:TK_YAW});
const TKB:[number,number]=[posIn(L_TAB,0,TK)[0]+TK_SK.lToe[0],posIn(L_TAB,0,TK)[1]+TK_SK.lToe[2]];
const WRB=fwdIn(L_TAB,1,TW,.5),LRB=fwdIn(L_TAB,0,TLR,.55);
function lBall(u:number):V3{
 if(u<TK){const f=fwdIn(L_TAB,2,u,.5+.12*Math.abs(Math.sin(u*5))),w=sm(TK-.35,TK,u);return[lerp(f[0],TKB[0],w),.11,lerp(f[1],TKB[1],w)];}
 if(u<TW){const e=easeOut((u-TK)/(TW-TK));return[lerp(TKB[0],WRB[0],e),.11,lerp(TKB[1],WRB[1],e)];}
 if(u<TPW){const f=fwdIn(L_TAB,1,u,.5+.1*Math.abs(Math.sin(u*5))),w=sm(TW,TW+.25,u);return[lerp(WRB[0],f[0],w),.11,lerp(WRB[1],f[1],w)];}
 if(u<TLR){const P0=fwdIn(L_TAB,1,TPW,.5),e=1.2*((u-TPW)/(TLR-TPW))-.2*((u-TPW)/(TLR-TPW))**2;return[lerp(P0[0],LRB[0],e),.11,lerp(P0[1],LRB[1],e)];}
 const f=fwdIn(L_TAB,0,u,.55),w=sm(TLR,TLR+.25,u);return[lerp(LRB[0],f[0],w),.11,lerp(LRB[1],f[1],w)];}
const KD=.5,K_START=TK-STRIKE_CONTACT*KD,WD=.5,W_START=TPW-STRIKE_CONTACT*WD;
function lessonPose(k:number,u:number):{pose:Pose;place:Place}{
 const v=velIn(L_TAB,k,u),sp=Math.hypot(v[0],v[1]),[x,z]=posIn(L_TAB,k,u),b=lBall(u),tb=YAW(b[0]-x,b[2]-z);let yaw=sp>.6?YAW(v[0],v[1]):tb,p:Pose;
 const run=(ph:number)=>blendPose(READY,runCycle(distIn(L_TAB,k,u)/ph,{speed:clamp((sp-1.6)/5)}),clamp(sp/1.2));
 if(k===0){
  if(u<TK-.3){p=blendPose(READY,backpedal(distIn(L_TAB,k,u)/1.1),clamp(sp/.6));yaw=YAW(1,0);}
  else p=run(3.3);
  const w=(u-K_START)/KD;if(w>-.2&&w<1.4){yaw=lerpAng(yaw,TK_YAW,sm(-.2,.15,w));p=blendPose(p,strike(clamp(w),{foot:'l',power:.3}),Math.min(sm(-.15,.1,w),1-sm(.9,1.4,w)));}
 }else if(k===1){
  p=u>TW-.1&&u<TPW-.2?blendPose(READY,dribble(distIn(L_TAB,k,u)/1.9,{foot:'r',speed:.55}),clamp(sp/.9)):run(3.3);if(sp<.6)yaw=tb;
  const w=(u-W_START)/WD;const aim=YAW(LRB[0]-x,LRB[1]-z)-14*D2R;if(w>-.2&&w<1.4){yaw=lerpAng(yaw,aim,sm(-.2,.15,w));p=blendPose(p,strike(clamp(w),{foot:'r',power:.3}),Math.min(sm(-.15,.1,w),1-sm(.9,1.4,w)));}
 }else{
  if(u<TK-.2){p=blendPose(READY,dribble(distIn(L_TAB,k,u)/1.9,{foot:'r',speed:.5}),clamp(sp/.9));}
  else{p=sp>.5?run(3.3):READY;yaw=lerpAng(YAW(-1,0),tb,sm(TK,TK+.8,u));}
 }
 return{pose:p,place:{x,z,yaw}};}
const ch4q=()=>({yt:T(3,'Your turn'),df:T(3,'defend first'),yw:T(3,'your winger'),rf:T(3,'run forward'),ja:T(3,'join the attack'),end:SEC(3)});
const tau4=(t:number)=>{const q=ch4q();return key(t,mono([[0,-.6],[q.yt,-.3],[q.df,TK-.35],[q.yw,TW+.1],[q.rf,3.2],[q.ja,TPW+.1],[q.end,6.6]]),x=>x);};
/** the lesson camera: raised three-quarter from the infield side, tracking the three players and the ball */
const LCAM=(t:number)=>{const q=ch4q(),u=tau4(t),mid=(w:number):[number,number]=>{const l=posIn(L_TAB,0,w),g=posIn(L_TAB,1,w),b=lBall(w);return[(2*l[0]+g[0]+b[0])/4,(2*l[1]+g[1]+b[2])/4];};
 const a=mid(u),b2=mid(u-.4),m:[number,number]=[(a[0]+b2[0])/2,(a[1]+b2[1])/2],F=key(t,mono([[0,2000],[q.yt+.4,2400],[q.df,2700],[q.yw,2300],[q.rf,2200],[q.end,2300]]),easeInOutSine);
 return cam([m[0]-2.5,4.6,m[1]+11],[m[0]+.5,.4,m[1]-.5],F);};
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),u=tau4(t),up=tau4(tt);frame(s);
  // the stage: a navy print, the ground as stepped yellow light round the drill, the touchline in paper
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-70,0,-34],[4,0,-34],[4,0,20],[-70,0,20]]));s.tone(K,floor,.2);
  const pool=(x:number,z:number,r:number)=>{const g=groundRing(c,x,z,r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(-33,-22,11),.2);s.tone(Y,pool(-32,-22,6),.2);
  const tl=new Path2D();groundLine(tl,c,[-70,-34],[4,-34],.14);s.knockout(tl,.8);
  // "Your turn": a ring round the left-back
  const yt=sm(q.yt,q.yt+.4,tt,easeOutBack)*(1-sm(q.df+.4,q.df+.9,tt));if(yt>.02){const p=posIn(L_TAB,0,up),g=groundRing(c,p[0],p[1],yt,28);if(g.length>2)yInk(s,ribbon(g,Math.max(5,.12*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}),.95);}
  // "defend first": a yellow ring on the attacker he stops
  const df=sm(q.df-.1,q.df+.3,tt,easeOutBack)*(1-sm(q.yw,q.yw+.4,tt));if(df>.02){const pr=new Path2D(),p=posIn(L_TAB,2,up),g=groundRing(c,p[0],p[1],df,28);if(g.length>2)pr.addPath(ribbon(g,Math.max(5,.12*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}));s.fill(Y,pr,.95);}
  // "your winger": a ring round the winger, now on the ball
  const yw=sm(q.yw-.1,q.yw+.3,tt,easeOutBack)*(1-sm(q.ja+.3,q.ja+.8,tt));if(yw>.02){const p=posIn(L_TAB,1,up),g=groundRing(c,p[0],p[1],yw*1.1,28);if(g.length>2)yInk(s,ribbon(g,Math.max(5,.12*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}),.95);}
  // "run forward": the left-back's run up the outside, past his winger, drawn ahead of him
  const rf=sm(q.rf-.2,q.rf+.5,tt,easeOut)*(1-sm(q.end-.7,q.end-.3,tt));if(rf>.02){const pts:[number,number][]=[],t0=Math.max(TW,up);for(let i=0;i<=12;i++)pts.push(posIn(L_TAB,0,lerp(t0,t0+(6.6-t0)*rf,i/12)));if(6.6-t0>.2)groundArrow(s,c,pts,.1);}
  // "join the attack": the winger's pass into the run, dashed
  const ja=sm(q.ja-.2,q.ja+.3,tt)*(1-sm(q.end-.6,q.end-.2,tt));if(ja>.02){const A=fwdIn(L_TAB,1,TPW,.5);dashLine(s,c,A,LRB,ja,.8);}
  // figures (duotone) and the ball, depth sorted
  const items:Item[]=[];L_ACT.forEach((a,k)=>{const st=lessonPose(k,up),g:V3=[st.place.x??0,0,st.place.z??0];if(depthOf(c,g)<1)return;const hero=k===0;
   items.push({depth:depthOf(c,g),draw:()=>drawPlayer(s,st.pose,c,duo(a.style,a.lead),st.place,{prev:hero?lessonPose(k,up-1/12):undefined,smear:hero&&up>TW+.6})});});
  const ball=lBall(u);items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const q2=P(c,ball),r=Math.max(13,BALL_R*kAt(c,ball));ballShadow(s,c,ball);whiteBall(s,q2[0],q2[1],r,u*9,{duo:true});}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  // speed lines off him on the run forward
  const sl=sm(q.rf,q.rf+.3,tt)*(1-sm(q.end-.6,q.end-.2,tt));if(sl>.02){const p=posIn(L_TAB,0,up),v=velIn(L_TAB,0,up),g:V3=[p[0],1,p[1]];if(depthOf(c,g)>NEAR+1&&Math.hypot(v[0],v[1])>1){const a=P(c,g),b=P(c,[p[0]-v[0]*.12,1,p[1]-v[1]*.12]);speedLines(s,Y,a[0],a[1],Math.atan2(a[1]-b[1],a[0]-b[0]),{n:6,seed:52,len:170*sl,width:8,cov:.9*sl});}}
  if(up>=TK&&up<TK+.25){const p=P(c,[TKB[0],.15,TKB[1]]);sparkBurst(s,Y,p[0],p[1],90,{n:9,seed:41,g:1-sm(TK+.1,TK+.25,up),width:10});}},
 still:5.5,
};

const story:RisoStory={
 id:'cucurella-signature',format:'11v11',title:'Cucurella joins the attack',
 theme:'Defend first, then join the attack when your winger has the ball.',
 ageNote:'UEFA Euro 2024 final, Spain 2–1 England, Berlin, 14 July 2024: the left-back crosses for the winner. For players of every age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a low cross — the ball skims away from the point along the grass with speed lines behind it. */
 touch(s,x,y,age,seed){
  const u=age<=0?0:clamp(age/.7),e=easeOut(u),bx=x+e*300,by=y+e*60;
  if(u>.02)speedLines(s,Y,bx-40,by,Math.atan2(60,300),{n:6,seed,len:60+220*e,width:10,cov:.9});
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,110,{n:8,seed,g:1-clamp(age/.3),width:11});
  whiteBall(s,bx,by,48,age*14+hash(seed,3)*TAU);
 },
};
export default story;
