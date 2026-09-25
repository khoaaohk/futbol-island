/** Iconic-play film (signature): "set and strike". Phil Foden's opener: Manchester City 3–1 West Ham United, Premier League, final day
 * (matchday 38), Etihad Stadium, Manchester, Sunday 19 May 2024 (16:00 BST). The goal came 79 seconds in (Guardian live blog; the report says
 * 76 seconds) and made it 1–0. City won 3–1 and became the first English club to win four league titles in a row.
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives Foden a signature, not a match ("Signature: set and strike", long_range_goal, centre,
 * edge of the box, left foot; lesson "Take one touch to set the ball, then strike low before the keeper is ready"). This goal is that exact
 * pattern, the best-documented example of it: one touch "across his body" to set the ball on the edge of the area, then a left-foot strike
 * before the keeper could react ("Areola had no chance"). It came on the day the title was decided. The Guardian says "We have seen that goal a few times this season".
 * HONESTY NOTE: the real shot was a RISING drive into the far top corner, not a low one. Chapters 1–3 show it exactly as written. The
 * lesson's "strike it low" is shown only in chapter 4, a clearly separate "your turn" demonstration: a training pitch, no crowd, training
 * bibs, no named players. No invented shot is staged inside the real match.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/foden-signature/script.json. The voice is generated later by the lead (local Kokoro). Until then
 * every chapter runs on provisional cue times (≈2.6 words/s, see prov()); every action time is read from cue onsets and chapter seconds,
 * so once timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/foden-signature/timing.json exists, replace `null` in `const VOICE` below with the timing
 *   import timingJson from '../../../public/plays/narration/foden-signature/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026 with curl, generic UA; cached under the session scratchpad films/src-cache/; written accounts only, the footage was not reviewed):
 *  - The Guardian, Rob Smyth, "Manchester City 3-1 West Ham: City win Premier League – as it happened", 19 May 2024 (page 1 +
 *    the early page): 1 min "City are kicking from left to right as we watch"; 2 min "City have started with Doku on the left, Foden
 *    in central midfield and Bernardo Silva on the right. West Ham's formation is 5-3-1-1 with Kudus behind Antonio and Paqueta in
 *    central midfield"; "Bernardo Silva set the goal up with a square pass 20 yards from goal. Foden took it beautifully across his
 *    body, losing Ward-Prowse in the process, and arrowed a rising drive into the far corner with his left foot. Areola had no chance";
 *    "The player of the year scores a banger after 79 seconds!"; the line-ups (City: Ortega; Walker, Dias, Akanji, Gvardiol; Rodri;
 *    De Bruyne, Bernardo; Foden, Haaland, Doku. West Ham: Areola; Coufal, Zouma, Mavropanos, Cresswell, Emerson; Soucek, Ward-Prowse;
 *    Kudus, Paqueta; Antonio); referee John Brooks. https://www.theguardian.com/football/live/2024/may/19/manchester-city-v-west-ham-premier-league-final-day-live
 *    (cache: guardian-mci-whu-2024-live.txt, guardian-mci-whu-2024-live-p2.txt)
 *  - The Guardian, David Hytner, "Manchester City beat West Ham to win fourth Premier League title in a row", 19 May 2024: "Maybe score
 *    after 76 seconds, too"; "Foden's opener was a stunning statement ... a feint on the edge of the area followed by a vicious blast into
 *    the far top corner. We have seen that goal a few times this season"; Foden scored the first two, Rodri the third; Kudus's overhead
 *    kick for 2–1; City four in a row. https://www.theguardian.com/football/article/2024/may/19/manchester-city-beat-west-ham-to-win-fourth-premier-league-title-in-a-row
 *    (cache: guardian-mci-whu-2024-report.txt)
 *  - Wikipedia, "2023–24 Manchester City F.C. season" (raw): the title sealed on the final day with a 3–1 home win over West Ham, Foden
 *    scoring twice (citing BBC Sport). (cache: wiki-2023-24-mancity-season.txt)
 *  - Also read, not used: The Guardian, "Brentford 1-3 Manchester City" (5 Feb 2024, Foden hat-trick). Its goals were described in too
 *    little detail to recreate. (cache: guardian-bre-mci-2024-report.txt)
 * CONFIRMED by those accounts: the match, date, ground, the result and the title; the goal after 76–79 seconds; Bernardo Silva's SQUARE
 *  pass about 20 yards from goal, with Bernardo playing on the right; Foden playing centrally that day; ONE touch across his body that lost
 *  Ward-Prowse (a "feint on the edge of the area"); then a LEFT-foot rising drive into the FAR TOP corner; the keeper Areola, beaten.
 *  City attacked left to right on the TV picture. West Ham lined up 5-3-1-1. The line-ups and the referee are also confirmed.
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds (Foden receives ~21 m out, just right of centre, and
 *  strikes from ~20 m); how Bernardo got the ball and which foot he passed with (drawn: his left); exactly where Ward-Prowse came from;
 *  WHICH post is "far" (drawn: the post nearer the main-stand camera, since the touch took the ball toward the far side). The narration only says
 *  "top corner". Also inferred: Areola's late dive; the celebration run; every other player's spot; the squad numbers (from general knowledge,
 *  not the fetched pages). KITS: City at home in their sky-blue shirts, white shorts and sky-blue socks (the 2023–24 home strip, never in doubt
 *  at the Etihad). West Ham's strip THAT DAY is NOT confirmed by the sources: drawn as their claret home shirts, white shorts and white socks,
 *  and never named in the narration. Also inferred: the keepers' colours (Areola yellow, Ortega navy), the referee's black, the sunny sky, the
 *  crowd's colours and the Etihad's shape as drawn (a two-tier bowl, a roof held up by masts outside the stands, LED boards).
 *  Chapter 4 (the low strike past a keeper who is still getting set) is a DEMONSTRATION on a training pitch, not match footage.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock
 * τ (seconds, τ = 0 Foden's first touch): ch1 = the high main-stand broadcast camera, near real time (the ground, Bernardo carrying it
 * on the right, the square pass, one touch, bang, top corner); ch2 = the TV slow-motion replay, low behind him on the pass side (the touch
 * across his body, away from Ward-Prowse, the ball set, the left foot); ch3 = the reverse angle from behind the net (the keeper beaten,
 * the celebration); ch4 = the lesson, a training-pitch demonstration of the same touch-and-strike, the shot kept low.
 * Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Inks: yellow (grass with blue, teaching marks), red (West Ham's
 * claret with navy, skin, arrows), blue (grass, City's sky blue, the sky), navy (key line, stands, roof, masts).
 * Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,runCycle,dribble,stand,strike,lunge,backpedal,celebrate,keeperSet,keeperDive,solve,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9é]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`foden film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/foden-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Set and strike','The Etihad, final day. Win, and Manchester City are champions. Two minutes in, Bernardo Silva squares it to Phil Foden, in sky blue. One touch, then bang! Top corner!',
  ['The Etihad','Win','Two minutes','Bernardo Silva','squares it','Phil Foden','in sky blue','One touch','bang','Top corner']),
 prov('Across his body','Watch again. His first touch takes it across his body, away from the defender, set for his left foot.',
  ['Watch again','His first touch','across his body','away from the defender','set for','left foot']),
 prov('No time','The keeper has no time to get set. City won the league that day!',
  ['The keeper','no time','get set','City won','the league']),
 prov('Your turn','Your turn: one touch to set the ball, then strike it low and quick, before the keeper is ready!',
  ['Your turn','one touch','set the ball','strike it low','quick','before the keeper','is ready']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`foden film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; West Ham's goal is at x = 0, the pitch runs to x = −105;
// the main-stand camera sits at +z, so City attack left → right on screen, as on the broadcast) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
const cam=(pos:V3,look:V3,F:number):Camera=>makeCamera({pos,target:look,fov:2*Math.atan(540/F)/D2R,size:1080});
const NEAR=.3;
const depthOf=(c:Camera,p:V3)=>dot(sub(p,c.eye),c.f);
const P=(c:Camera,p:V3):Pt=>{const q=c.project(p);return[q[0],q[1]];};
const kAt=(c:Camera,p:V3)=>c.F/Math.max(NEAR,depthOf(c,p));
function clipPoly(c:Camera,pts:V3[]):Pt[]{const out:Pt[]=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],da=depthOf(c,a)-NEAR,db=depthOf(c,b)-NEAR;if(da>=0)out.push(P(c,a));if(da*db<0)out.push(P(c,mix3(a,b,da/(da-db))));}return out;}
function addPoly(path:Path2D,q:Pt[]){if(q.length<3)return;let A=0;for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];A+=a[0]*b[1]-b[0]*a[1];}const r=A<0?q.slice().reverse():q;path.moveTo(r[0][0],r[0][1]);for(let i=1;i<r.length;i++)path.lineTo(r[i][0],r[i][1]);path.closePath();}
function groundLine(path:Path2D,c:Camera,a:[number,number],b:[number,number],w=.12){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const wrapA=(a:number)=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;};
const lerpAng=(a:number,b:number,u:number)=>a+wrapA(b-a)*clamp(u);
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));
/** a projected quad only when it is comfortably in front of the camera (cameras sit inside the bowl: near stand parts are culled) */
function quadP(c:Camera,q:V3[],minD=16):Pt[]|null{for(const p of q)if(depthOf(c,p)<minD)return null;return q.map(p=>P(c,p));}

// ================= the Etihad Stadium, a sunny May afternoon: a two-tier bowl, the roof hung from masts outside the stands =================
const CX=-52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the inner rim (a rounded-rectangle superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(62+d)*Math.sign(c)*Math.pow(Math.abs(c),.42),y,(44+d)*Math.sign(s)*Math.pow(Math.abs(s),.42)];}
const LOW=(b:number):[number,number]=>[1.5+17.5*b,1.2+9*b],UPT=(b:number):[number,number]=>[21+15*b,12.6+11*b];
type Bowl={low:V3[][];up:V3[][];boxes:V3[][];roof:V3[][];fascia:V3[][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],up:[],boxes:[],roof:[],fascia:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const[l0,h0]=LOW(0),[l1,h1]=LOW(1),[u0,g0]=UPT(0),[u1,g1]=UPT(1);o.low.push(Q(l0,h0,l1,h1));o.up.push(Q(u0,g0,u1,g1));o.boxes.push(Q(l1,h1,u0,g0));
  o.roof.push(Q(17,28,40,30.5));o.fascia.push(Q(17,26.6,17,28.1));
  for(let r=0;r<8;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,29);if(h<.1)continue;const[d,y]=LOW((r+.5)/8);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}
  for(let r=0;r<6;r++)for(let k=0;k<3;k++){const h=hash(i*733+r*37+k*11,31);if(h<.12)continue;const[d,y]=UPT((r+.5)/6);o.seats.push({P:rim((i+(k+.5+(hash(i+r*17+k,6)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
/** the masts: twelve round the outside of the bowl, leaning out, with stay cables down to the roof's front edge */
const MASTS=Array.from({length:12},(_,i)=>{const th=(i+.5)/12*TAU;return{th,base:rim(th,41,24),top:rim(th,45,47)};});
type Crowd={t:number;cheer?:number;flash?:number;masts?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // a clear, sunny afternoon: a pale blue sky, deeper overhead
 s.field(B,.12,.5);
 const hz=P(c,[c.eye[0]+c.f[0]*1e4,c.eye[1],c.eye[2]+c.f[2]*1e4])[1];
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-460],[-Bnd,hz-420]],true),.22);
 masts(s,c,o.masts??0);
 const low=new Path2D(),up=new Path2D(),box=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.up[i],up);ad(BOWL.boxes[i],box);ad(BOWL.low[i],low);ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(up);s.tone(B,up,.45);s.tone(K,up,.2);
 s.knockout(box);s.fill(K,box,.78);
 s.knockout(low);s.tone(B,low,.45);s.tone(K,low,.2);
 // the crowd: one mark per seat group (sky-blue shirts, white, dark, a few claret away fans), bobbing when they cheer
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<16)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.52?0:q.h<.72?1:q.h<.9?2:3].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.fill(B,inks[0],.85);s.knockout(inks[1],.8);s.fill(K,inks[2],.8);s.fill(R,inks[3],.85);}
 // the roof: dark underside, a pale fascia along its front edge
 s.knockout(roof);s.fill(K,roof,.85);
 s.knockout(fas);s.tone(K,fas,.25);
 // phone flashes round the ground after the goal
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const q=BOWL.seats[Math.floor(r()*BOWL.seats.length)];const d=depthOf(c,q.P);if(d<16)continue;const[x,y]=P(c,q.P),sz=clamp(c.F*1/d,8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
}
/** the Etihad's masts and stay cables above the roof line; `glow` rings them in yellow */
function masts(s:Sheet,c:Camera,glow=0){
 const m=new Path2D(),cb=new Path2D();let n=0,wg=0;
 for(const q of MASTS){if(depthOf(c,q.base)<30||depthOf(c,q.top)<30)continue;const a=P(c,q.base),b=P(c,q.top),k=kAt(c,q.base);if(Math.abs(a[0])>s.W*1.3&&Math.abs(b[0])>s.W*1.3)continue;
  const w=Math.max(2,.9*k);m.addPath(ribbon([a,b],w,{taper:.3,wobble:0}));wg=Math.max(wg,w);
  for(const dt of[-.13,0,.13]){const f=rim(q.th+dt,17,28);if(depthOf(c,f)<16)continue;const pf=P(c,f);cb.moveTo(b[0],b[1]);cb.lineTo(pf[0],pf[1]);}n++;}
 if(!n)return;s.stroke(K,cb,Math.max(1.2,wg*.18),.7);s.knockout(m);s.tone(K,m,.35);s.stroke(K,m,Math.max(1.5,wg*.25),.8);
 if(glow>.02)s.stroke(Y,m,Math.max(6,wg*1.6),.95*glow);
}
/** the pitch: a grass apron with LED boards, the striped grass (yellow × blue), paper lines, both goals */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3;boards?:boolean}={}){
 const ap=new Path2D();addPoly(ap,clipPoly(c,Array.from({length:NS},(_,i)=>rim(i/NS*TAU,-.6,0))));s.knockout(ap);s.fill(Y,ap,.7);s.tone(B,ap,.7);s.tone(K,ap,.22);
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-109,0,-37],[4,0,-37],[4,0,37],[-109,0,37]]));s.knockout(gp);s.fill(Y,gp,.8);s.tone(B,gp,.66);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{let prev:[number,number]|null=null;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,p:[number,number]=[cx+Math.cos(a)*r,cz+Math.sin(a)*r];if(prev)Ln(prev,p);prev=p;}};
 arc(-52.5,0,9.15,0,TAU,24);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)arc(gx-11,0,9.15,Math.PI-a,Math.PI+a,8);else arc(gx+11,0,9.15,-a,a,8);
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.95);
 // the LED advertising boards round the pitch (plain navy panels with a sky-blue band; no brands)
 if(o.boards!==false){const bd=new Path2D(),band=new Path2D(),seg=(a:[number,number],b:[number,number])=>{const q=quadP(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],.9,b[1]],[a[0],.9,a[1]]],6);if(q)bd.addPath(polyPath(q,true));const r=quadP(c,[[a[0],.35,a[1]],[b[0],.35,b[1]],[b[0],.6,b[1]],[a[0],.6,a[1]]],6);if(r)band.addPath(polyPath(r,true));};
  for(let x=-104;x<0;x+=8){seg([x,-38],[x+8,-38]);seg([x,38],[x+8,38]);}for(let z=-30;z<30;z+=8){if(Math.abs(z+4)<6)continue;seg([5,z],[5,z+8]);seg([-110,z],[-110,z+8]);}
  s.knockout(bd);s.fill(K,bd,.82);s.fill(B,band,.7);}
 goal(s,c,-105,-1);
 goal(s,c,0,1,o.net);
}
/** a modern goal on the line x = X, net 2 m deep toward dir: round posts, a box net; `net` displaces the mesh (ripple) */
function goal(s:Sheet,c:Camera,X:number,dir:number,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3):V3=>{const q=net?net(p):p;return[X+dir*q[0],q[1],q[2]];},vol=new Path2D(),mesh=new Path2D();
 const backF=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(backF,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.18);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[X,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a0:V3,b0:V3,w0=.12)=>{const a:V3=[X+dir*a0[0],a0[1],a0[2]],b:V3=[X+dir*b0[0],b0[1],b0[2]];if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.05);bar([Dp,0,W],[Dp,H,W],.05);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.6*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};
/** the lesson's training pitch (no stands, no crowd): open sky, a tree line behind the goal and down one side */
function trainingGround(s:Sheet,c:Camera){
 s.field(B,.12,.5);
 const Bnd=Math.max(s.W,s.H)*1.5,hz=P(c,[c.eye[0]+c.f[0]*1e4,c.eye[1],c.eye[2]+c.f[2]*1e4])[1];
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-460],[-Bnd,hz-420]],true),.2);
 const trees=new Path2D(),row=(a:[number,number],b:[number,number],n:number,seed:number)=>{const top:V3[]=[],base:V3[]=[];for(let i=0;i<=n;i++){const u=i/n,x=lerp(a[0],b[0],u),z=lerp(a[1],b[1],u),h=8+5*hash(i,seed)+2*Math.sin(i*1.7+seed);top.push([x,h,z]);base.push([x,0,z]);}
  const q=clipPoly(c,[...base,...top.reverse()]);addPoly(trees,q);};
 row([30,-70],[30,70],28,3);row([-120,-48],[30,-48],30,5);row([-120,48],[30,48],30,7);
 s.knockout(trees);s.fill(K,trees,.5);s.tone(B,trees,.45);s.tone(Y,trees,.25);
}

// ================= the 2023–24 ball (white, blue and navy panel marks) =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,crescent(0,0,r*1.02,[-.4,-.45]),.3);
 const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
 s.stroke(B,seams,Math.max(1.6,r*.12),.85);
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (19 May 2024) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[R,.2],[Y,.45]],SKIN_M:AthleteStyle['skin']=[[R,.28],[Y,.55],[K,.06]],SKIN_D:AthleteStyle['skin']=[[R,.42],[Y,.5],[K,.34]];
const SKY:AthleteStyle['shirt']=[B,.45];
/** Manchester City at home: sky-blue shirts, white shorts, sky-blue socks */
const MCI=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:SKY,shorts:'paper',socks:SKY,boots:K,trim:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],numberInk:K,...o});
/** West Ham (INFERRED, not confirmed for that day): claret shirts (red under a navy shade), white shorts, white socks */
const WHU=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[R,.95],shorts:'paper',socks:'paper',boots:K,trim:[B,.6],skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.5],numberInk:'paper',...o});
/** Foden: No. 47, 1.71 m, short dark hair, left-footed */
const FODEN:AthleteStyle=MCI({number:47,hair:[K,.75],build:{height:1.71,bulk:.96},seed:47});
const AREOLA:AthleteStyle={shirt:[Y,.9],shorts:[Y,.9],socks:[Y,.9],boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,sleeves:'long',gloves:'paper',shade:[K,.26],number:23,numberInk:K,build:{height:1.95},seed:23};
const ORTEGA:AthleteStyle={shirt:[K,.8],shorts:[K,.8],socks:[K,.8],boots:K,skin:SKIN_L,hair:K,line:K,sleeves:'long',gloves:'paper',shade:[K,.26],number:18,numberInk:'paper',build:{height:1.86},seed:18};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'short',line:K,sleeves:'short',seed:33};
/** the lesson demonstration (not the match): a player in a yellow training bib, a keeper in a red training top */
const TRAIN:AthleteStyle={shirt:[Y,.95],shorts:K,socks:'paper',boots:K,trim:K,skin:SKIN_L,hair:[K,.75],hairStyle:'short',line:K,shade:[K,.26],number:null,build:{height:1.71,bulk:.96},seed:47};
const TRAIN_GK:AthleteStyle={shirt:[R,.9],shorts:K,socks:[R,.9],boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,sleeves:'long',gloves:'paper',shade:[K,.3],number:null,build:{height:1.9},seed:23};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Foden's first touch) =================
type TK=[number,number,number];// τ, x, z
type Role='fo'|'mci'|'whu'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
const PASS=-1.0,SHOT=.62;
/** Positions are Hermite-interpolated between keys (all illustrative, see INFERRED). City attack toward x = 0. */
const ACTORS:Actor[]=[
 {name:'Foden',role:'fo',style:FODEN,key:true,keys:[[-7,-30,5.4],[-4,-27,4.2],[-2.5,-24.8,3],[-1.2,-22.6,2],[-.5,-21.6,1.5],[0,-21,1.2],[.3,-20.6,.8],[SHOT,-20.1,.4],[.9,-19.7,.35],[1.4,-19,.8],[2.2,-17.6,2.4],[3.5,-15.8,4.6],[5,-13.2,6.4],[7,-10,8],[10,-7.5,9]]},
 {name:'Areola',role:'gk',style:AREOLA,key:true,keys:[[-7,-1.8,-.9],[-2,-1.5,.6],[0,-1.4,.35],[SHOT,-1.3,.25],[10,-1.3,.25]]},
 {name:'Ward-Prowse',role:'whu',style:WHU({number:7,seed:71}),key:true,keys:[[-7,-12.6,6.4],[-3,-15,4.5],[-1.2,-16.9,3.3],[0,-18.1,2.7],[.3,-18.5,2.3],[.8,-18.7,1.9],[1.5,-18.3,1.6],[4,-17,1.5],[10,-17,2]]},
 {name:'Bernardo Silva',role:'mci',style:MCI({number:20,hairStyle:'curly',build:{height:1.73,bulk:.92},skin:SKIN_M,seed:20}),key:true,keys:[[-7,-31,17.4],[-4,-27.6,15.8],[-2.5,-25.4,14.6],[-1.6,-24.4,14],[PASS,-23.8,13.6],[-.4,-23.4,13],[1,-21.5,11.5],[3,-18,10],[6,-15,11],[10,-13,12]]},
 {name:'Haaland',role:'mci',style:MCI({number:9,hairStyle:'long',hair:[Y,.7],build:{height:1.95,bulk:1.08},seed:9}),key:true,keys:[[-7,-12.4,-.6],[0,-11.5,-2.5],[SHOT,-11.2,-2.8],[3,-12,-1],[10,-13,4]]},
 {name:'Soucek',role:'whu',style:WHU({number:28,build:{height:1.92},seed:78}),keys:[[-7,-15.6,-2.2],[0,-17.2,-1.2],[SHOT,-17.6,-.8],[10,-17,-1]]},
 {name:'Paquetá',role:'whu',style:WHU({number:10,skin:SKIN_M,seed:60}),keys:[[-7,-17.6,-11.4],[0,-19,-9],[10,-19,-7]]},
 {name:'Emerson',role:'whu',style:WHU({number:33,skin:SKIN_M,seed:83}),keys:[[-7,-9.8,15.4],[0,-10.5,13],[10,-11,12]]},
 {name:'Cresswell',role:'whu',style:WHU({number:3,seed:53}),keys:[[-7,-8.8,7.2],[0,-9.5,6],[10,-10,5]]},
 {name:'Mavropanos',role:'whu',style:WHU({number:15,build:{height:1.94},seed:65}),keys:[[-7,-8.8,.2],[0,-9.8,-.5],[10,-10,0]]},
 {name:'Zouma',role:'whu',style:WHU({number:4,skin:SKIN_D,build:{height:1.9},seed:54}),keys:[[-7,-8.8,-7.2],[0,-9.6,-6.5],[10,-10,-6]]},
 {name:'Coufal',role:'whu',style:WHU({number:5,seed:55}),keys:[[-7,-10.8,-17.2],[0,-12,-16.5],[10,-12,-14]]},
 {name:'Kudus',role:'whu',style:WHU({number:14,skin:SKIN_D,seed:64}),keys:[[-7,-24.5,-1.5],[0,-23.5,-2.5],[10,-22,0]]},
 {name:'Antonio',role:'whu',style:WHU({number:9,skin:SKIN_D,seed:59}),keys:[[-7,-35.4,2.2],[0,-34,1],[10,-31,1]]},
 {name:'Doku',role:'mci',style:MCI({number:11,skin:SKIN_D,seed:11}),keys:[[-7,-17.6,-22.4],[0,-15,-20],[10,-14,-12]]},
 {name:'De Bruyne',role:'mci',style:MCI({number:17,hair:[Y,.6],seed:17}),keys:[[-7,-27.6,-8.2],[0,-25,-7],[10,-20,-2]]},
 {name:'Rodri',role:'mci',style:MCI({number:16,build:{height:1.91},seed:16}),keys:[[-7,-35.6,1.2],[0,-32,0],[10,-26,2]]},
 {name:'Walker',role:'mci',style:MCI({number:2,skin:SKIN_D,hairStyle:'bald',seed:2}),keys:[[-7,-38.4,20.2],[0,-36,19],[10,-30,15]]},
 {name:'Gvardiol',role:'mci',style:MCI({number:24,build:{height:1.85},seed:24}),keys:[[-7,-37.4,-16],[0,-35,-16],[10,-30,-12]]},
 {name:'Dias',role:'mci',style:MCI({number:3,skin:SKIN_M,build:{height:1.87},seed:3}),keys:[[-7,-48.4,7.2],[0,-46,6],[10,-40,5]]},
 {name:'Akanji',role:'mci',style:MCI({number:25,skin:SKIN_M,build:{height:1.88},seed:25}),keys:[[-7,-48.4,-7.2],[0,-46,-6],[10,-40,-5]]},
 {name:'Ortega',role:'gk',style:ORTEGA,keys:[[-7,-95.4,0],[10,-93,0]]},
 {name:'Brooks',role:'ref',style:REF,keys:[[-7,-33.6,-9.2],[0,-30,-8],[10,-24,-6]]},
];
const FO=0,GKI=1,WP=2,BS=3,HAAL=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const TA=-7,TB=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};
/** a ball spot just ahead of a (non-hero) player's boot, along his run */
function bootOf(k:number,tau:number,ahead=.5):V3{const[x,z]=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1]);const dx=l>.3?v[0]/l:1,dz=l>.3?v[1]/l:0;return[x+dx*ahead-dz*.1,.11,z+dz*ahead+dx*.1];}
/** the demonstration keeper (chapter 4 only) is still walking back across his goal when the shot comes: an offset from Areola's spot */
function demoGkOff(tau:number):[number,number]{const u=sm(-1.2,SHOT+.35,tau);return[-1.4*(1-u),-1.9*(1-u)];}
function placeXZ(k:number,tau:number,demo=false):[number,number]{const p=posOf(k,tau);if(demo&&k===GKI){const o=demoGkOff(tau);return[p[0]+o[0],p[1]+o[1]];}return p;}

// ---- Foden: the run into the space, the feint, ONE touch across his body, the left-foot strike, the celebration ----
const HIT:V3=[0,2.12,2.95];// the far top corner (which post is inferred: the one nearer the main-stand camera)
const LOWHIT:V3=[0,.3,2.95];// the lesson demonstration only: the same strike kept low, into the bottom corner
function yawFo(tau:number){const v=velOf(FO,tau),run=Math.hypot(v[0],v[1])>.4?YAW(v[0],v[1]):0,[x,z]=posOf(FO,tau),toGoal=YAW(HIT[0]-x,HIT[2]-z);return lerpAng(run,toGoal,sm(SHOT-.55,SHOT-.2,tau)*(1-sm(SHOT+.6,SHOT+1.2,tau)));}
/** the ball spot at his boot: ahead and a touch to the side of that foot */
function footAt(tau:number,foot:'l'|'r',ahead=.5):[number,number]{const p=posOf(FO,tau),y=yawFo(tau),fx=Math.cos(y),fz=-Math.sin(y),rx=Math.sin(y),rz=Math.cos(y),sd=foot==='r'?.1:-.12;return[p[0]+fx*ahead+rx*sd,p[1]+fz*ahead+rz*sd];}
/** the feint: weight and shoulders dropped to his right (toward Ward-Prowse), just before the touch goes the other way */
const FEINT:Partial<Pose>={roll:10,bend:14,twist:-14,lean:18,rShA:50,lShA:28,neckY:-6,squash:-.05};
/** over(): blend channel overrides (degrees) into a pose */
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const SD=.9,S_ST=SHOT-STRIKE_CONTACT*SD;
function foPose(tau:number):Pose{
 const v=velOf(FO,tau),sp=Math.hypot(v[0],v[1]),s=clamp((sp-2)/5);
 let p=blendPose(stand(),runCycle(distOf(FO,tau)/(2.3+2.1*s),{speed:s}),clamp((sp-.4)/.8));
 p=over(p,{neckY:-38,neckP:10},bump(-3,-.25,tau));// eyes on Bernardo out to his right
 // the touch: a short dribble stride whose LEFT foot meets the ball at τ = 0 (touchPhase .97)
 p=blendPose(p,dribble(.97+tau/.6,{foot:'l',speed:.5}),bump(-.5,.32,tau));
 p=over(p,FEINT,bump(-.6,.08,tau)*.9);
 const u=(tau-S_ST)/SD;
 if(u>-.1&&u<1.5)p=blendPose(p,strike(clamp(u),{foot:'l',power:1}),Math.min(sm(-.1,.12,u),1-sm(1.05,1.5,u)));
 if(tau>SHOT+1.2)p=blendPose(p,celebrate((tau-SHOT-1.2)*1.1,{kind:'run'}),sm(SHOT+1.2,SHOT+1.7,tau));
 return p;}
/** the strike point: his LEFT boot at contact (from the solved skeleton), a touch ahead of the toe, on the grass */
const M:V3=(()=>{const[x,z]=posOf(FO,SHOT),y=yawFo(SHOT),sk=solve(foPose(SHOT),FODEN.build,{x,z,yaw:y});return[sk.lToe[0]+Math.cos(y)*.1,.11,sk.lToe[2]-Math.sin(y)*.1];})();
/** where his first touch meets the ball (τ = 0), left foot */
const TP0:V3=(()=>{const[x,z]=footAt(0,'l',.4);return[x,.11,z];})();

// ---- the ball: Bernardo's carry, the square pass, the touch, the strike, the net ----
const G0=9.81,FL=.74,IN_NET=SHOT+FL,BACKT=IN_NET+.08;
const VY=(HIT[1]-M[1]+.5*G0*FL*FL)/FL;
const A0=bootOf(BS,PASS,.45);
const roll=(a:V3,b:V3,u:number)=>mix3(a,b,u*(1.3-.3*u));
function ballAt(tau:number,demo=false):V3{
 const hit=demo?LOWHIT:HIT,back:V3=[1.9,demo?.25:1.9,2.9],rest:V3=[1.4,.11,2.4];
 if(tau<PASS)return bootOf(BS,tau,.45);
 if(tau<0)return roll(A0,TP0,(tau-PASS)/-PASS);
 if(tau<SHOT)return mix3(TP0,M,easeOut(tau/SHOT));
 if(tau<IN_NET){const s=tau-SHOT,u=s/FL;return demo?[lerp(M[0],hit[0],u),lerp(M[1],hit[1],u)+.22*Math.sin(Math.PI*u),lerp(M[2],hit[2],u)]:[lerp(M[0],hit[0],u),M[1]+VY*s-.5*G0*s*s,lerp(M[2],hit[2],u)];}
 if(tau<BACKT)return mix3(hit,back,(tau-IN_NET)/(BACKT-IN_NET));
 const u=clamp((tau-BACKT)/.75),y=u<.55?lerp(back[1],.11,(u/.55)*(u/.55)):.11+.3*Math.sin(Math.PI*(u-.55)/.45)*(demo?.3:1);return[lerp(back[0],rest[0],easeOut(u)),y,lerp(back[2],rest[2],u)];
}
const NET_HIT:V3=[2,1.95,2.95],NET_LOW:V3=[2,.3,2.95];

// ---- everyone else ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DIVE_T=SHOT+.3,DIVE_D=1;
/** a pass: the strike blended in round its contact time */
function passAt(p:Pose,tau:number,at:number,power:number,foot:'l'|'r',D=.9){const u=(tau-(at-STRIKE_CONTACT*D))/D;return u>-.2&&u<1.4?blendPose(p,strike(clamp(u),{foot,power}),Math.min(sm(-.2,0,u),1-sm(1,1.4,u))):p;}
/** a pose + yaw for actor k at τ */
function poseOf(k:number,tau:number,demo=false):{p:Pose;yaw:number}{
 if(k===FO)return{p:foPose(tau),yaw:yawFo(tau)};
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=placeXZ(k,tau,demo),b=ballAt(tau,demo);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='whu'?READY:stand();
 let p:Pose;
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);const s=clamp((sp-1)/5);p=blendPose(idle,runCycle(distOf(k,tau)/2.6,{speed:s}),clamp((sp-.6)/1));
  if(k===GKI&&demo){// still walking back across his goal, not yet set, when the low shot comes
   p=blendPose(runCycle(tau*1.3,{speed:0}),idle,sm(SHOT+.1,SHOT+.4,tau));yaw=lerpAng(YAW(.6,1),YAW(M[0]-x,M[2]-z),sm(SHOT-.4,SHOT+.3,tau));
   const dT=SHOT+.42;if(tau>dT){p=keeperDive(clamp((tau-dT)/DIVE_D),{side:'l',height:.12});yaw=YAW(M[0]-x,M[2]-z);}}
  else if(k===GKI&&tau>DIVE_T){const u=(tau-DIVE_T)/DIVE_D;yaw=YAW(M[0]-x,M[2]-z);p=keeperDive(clamp(u),{side:'l',height:.9});
   if(tau>IN_NET+.4)p=over(p,{neckP:-30,neckY:40},sm(IN_NET+.4,IN_NET+1,tau));}
  return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(a.role==='whu'&&k!==WP&&tau<SHOT+.2){yaw=lerpAng(yaw,YAW(b[0]-x,b[2]-z),.7);}
 if(k===BS){if(tau<PASS-.25)p=blendPose(p,dribble(distOf(k,tau)/2.6,{foot:'l',speed:.4}),.8);
  if(Math.abs(tau-PASS)<.5)yaw=YAW(TP0[0]-x,TP0[2]-z);p=passAt(p,tau,PASS,.45,'l');}
 // Ward-Prowse closes Foden down, then jabs his right leg at the ball as the touch takes it away from him
 if(k===WP){const[fx,fz]=posOf(FO,tau);if(tau>-2&&tau<1.2)yaw=YAW(fx-x,fz-z);const t0=.18-.6*.8,u=(tau-t0)/.8;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'r'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
 if(tau>IN_NET+.4&&(k===HAAL||k===BS))p=blendPose(p,celebrate((tau-IN_NET)*1.1+k*.13,{kind:'arms'}),sm(IN_NET+.4,IN_NET+1,tau));
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted; `hero` draws Foden with motion smear + secondary motion;
 * `demo` draws the lesson's training-pitch demonstration (training kits, the low strike, the keeper not yet set) */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;trail?:number;only?:number[];demo?:boolean}):World{
 const demo=!!o.demo,b=ballAt(tau,demo),items:Item[]=[],res=new Map<number,DrawResult>();
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 const PL=(k:number,tt:number):Place=>{const[x,z]=placeXZ(k,tt,demo);return{x,z,yaw:poseOf(k,tt,demo).yaw};};
 ACTORS.forEach((a,k)=>{if(o.only&&!o.only.includes(k))return;const[x,z]=placeXZ(k,tau,demo),g:V3=[x,0,z],d=depthOf(c,g);if(d<(k===FO?1:3.5))return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  const style=demo?(k===FO?TRAIN:TRAIN_GK):a.style;
  items.push({depth:d,draw:()=>{const pose=poseOf(k,tp,demo).p,yaw=PL(k,tp).yaw,px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===FO?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===FO||a.key);
   const prev=big?{pose:poseOf(k,tp-1/12,demo).p,place:{...PL(k,tp-1/12),x:placeXZ(k,tau-1/12,demo)[0],z:placeXZ(k,tau-1/12,demo)[1]}}:undefined;
   res.set(k,drawPlayer(s,pose,c,{...style,detail},place,{prev,smear:!!o.hero&&k===FO}));}});});
 items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,ballAt(tau-.03,demo)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  // the strike: speed streaks behind the ball in flight
  if(o.trail&&tau>SHOT&&tau<IN_NET+.05){const back=P(c,ballAt(Math.max(SHOT,tau-.14),demo));speedLines(s,K,q[0],q[1],Math.atan2(back[1]-q[1],back[0]-q[0]),{n:5,seed:77,len:Math.max(r*3,Math.hypot(back[0]-q[0],back[1]-q[1])),spread:r*1.6,width:Math.max(3,r*.35),cov:.6*o.trail});}
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.6,q[1]+Math.sin(i/20*TAU)*r*1.6] as Pt),true),r*.25*o.glow,.95);
  ball(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());
 return{ball:b,res};}

// ================= teaching marks =================
/** a ribbon on the grass along ground points (metres), width in metres; progress 0..1; optional arrowhead */
function groundTrail(s:Sheet,c:Camera,pts:[number,number][],wm:number,ink:string,o:{progress?:number;cov?:number;head?:boolean;dashed?:boolean;seed?:number}={}){
 const{progress=1,cov=.95,head=true,dashed=false,seed=5}=o;if(progress<=.01||cov<=.01)return;
 const n=Math.max(2,Math.round(pts.length*clamp(progress))),q:Pt[]=[];let d=1;for(const p of pts.slice(0,n)){const g:V3=[p[0],.03,p[1]];const dd=depthOf(c,g);if(dd<NEAR+.2)continue;q.push(P(c,g));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.08;x<.95;x+=.14)gaps.push([x,x+.07]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.8,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.8,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
/** ground points along the ball's path between two times */
const ballPath=(t0:number,t1:number,n=12,demo=false):[number,number][]=>Array.from({length:n+1},(_,i)=>{const b=ballAt(t0+(t1-t0)*i/n,demo);return[b[0],b[2]];});
/** the ball's flight in the air (3D points), a ribbon that draws as `progress` grows */
function airTrail(s:Sheet,c:Camera,t0:number,t1:number,ink:string,o:{progress?:number;cov?:number;wm?:number;dashed?:boolean;seed?:number;head?:boolean;demo?:boolean}={}){
 const{progress=1,cov=.95,wm=.1,dashed=false,seed=81,head=true}=o;if(progress<=.01||cov<=.01)return;
 const n=14,q:Pt[]=[];let d=1;for(let i=0;i<=Math.round(n*clamp(progress));i++){const b=ballAt(t0+(t1-t0)*i/n,o.demo),dd=depthOf(c,b);if(dd<NEAR+.2)continue;q.push(P(c,b));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.06;x<.95;x+=.12)gaps.push([x,x+.06]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.6,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.6,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
/** a ring on the grass (centre, radii in metres) */
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,rx:number,rz:number,wm:number,ink:string,cov:number,seed=7){
 if(cov<=.02)return;const pts:Pt[]=[];let d=1;for(let i=0;i<40;i++){const g:V3=[cx+Math.cos(i/40*TAU)*rx,.03,cz+Math.sin(i/40*TAU)*rz];const dd=depthOf(c,g);if(dd<NEAR+.2)return;pts.push(P(c,g));d=dd;}
 const w=Math.max(5,c.F*wm/d);s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1}),cov);}
/** a screen-space ring round a joint pair (a boot), 0..1 */
function bootRing(s:Sheet,a:Pt,b:Pt,ink:string,w:number,seed:number){if(w<=.02)return;const r=Math.max(10,Math.hypot(a[0]-b[0],a[1]-b[1])*1.2)*w+2,cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2;
 s.knockout(ribbon(Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt),Math.max(5,r*.34),{seed,close:true,taper:0,wobble:.8}),.7*w);
 s.fill(ink,ribbon(Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt),Math.max(3,r*.2),{seed,close:true,taper:0,wobble:.8}),.95*w);}
/** a ring round a figure (head to ankle), 0..1 */
function bodyRing(s:Sheet,hero:DrawResult,ink:string,w:number,seed=143){if(w<=.02)return;const h=hero.joints.head,f=hero.joints.rAn,cy=(h[1]+f[1])/2,ry=Math.max(70,Math.abs(f[1]-h[1])*.7+8);
 const pts=Array.from({length:24},(_,i)=>[h[0]+Math.cos(i/24*TAU)*ry*.62*w,cy+Math.sin(i/24*TAU)*ry*w] as Pt),wd=Math.max(5,ry*.08);
 s.knockout(ribbon(pts,wd*1.9,{close:true,seed,taper:0,wobble:.8}),.75*w);s.fill(ink,ribbon(pts,wd,{close:true,seed,taper:0,wobble:.8}),.95*w);}
/** the goal mouth, lit: a yellow outline round posts and bar and a light screen inside */
function goalMouth(s:Sheet,c:Camera,w:number){if(w<=.02)return;const q=clipPoly(c,[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]]);if(q.length<3)return;
 const p=new Path2D();addPoly(p,q);s.tone(Y,p,.3*w);s.stroke(Y,p,Math.max(6,.1*kAt(c,[0,1.2,0])),.95*w);}
/** a ring in the goal plane round the corner the ball flies into (top, or the lesson's low corner) */
function cornerRing(s:Sheet,c:Camera,w:number,sz=1,h:V3=HIT){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU,p:V3=[h[0],Math.max(.05,h[1]+Math.sin(a)*.62*w*sz),h[2]+Math.cos(a)*.8*w*sz];if(depthOf(c,p)<NEAR+.2)return;pts.push(P(c,p));}
 const wd=Math.max(5,.1*sz*kAt(c,h)),cv=Math.min(1,w*1.5);s.knockout(ribbon(pts,wd*1.8,{close:true,seed:145,taper:0,wobble:.8}),.7*cv);s.fill(Y,ribbon(pts,wd,{close:true,seed:145,taper:0,wobble:.8}),.95*cv);}
/** the left toe's arc through the strike (screen points from solved skeletons), for the follow-through mark */
function toeArc(c:Camera,t0:number,t1:number,n=10):Pt[]{const out:Pt[]=[];for(let i=0;i<=n;i++){const tau=t0+(t1-t0)*i/n,[x,z]=posOf(FO,tau),sk=solve(foPose(tau),FODEN.build,{x,z,yaw:yawFo(tau)});if(depthOf(c,sk.lToe)<NEAR+.2)continue;out.push(P(c,sk.lToe));}return out;}
function spark(s:Sheet,c:Camera,p:V3,age:number,size:number,seed:number){if(age<=-.03||age>=.3)return;const q=P(c,p);sparkBurst(s,Y,q[0],q[1],kAt(c,p)*size,{n:9,seed,g:easeOutBack(clamp((age+.03)/.08))*(1-clamp((age-.15)/.15)),width:8});}

// ================= chapter 1 (live, near real time): the high main-stand camera; the ground, the square pass, one touch, bang, top corner =================
const tau1=(t:number)=>{const jt=T(0,'Two minutes'),bs=T(0,'Bernardo Silva'),pf=T(0,'Phil Foden'),sb=T(0,'in sky blue'),ot=T(0,'One touch'),bg=T(0,'bang'),tc=T(0,'Top corner'),E=SEC(0);
 return key(t,mono([[0,-7],[jt,-5],[bs,-3],[pf,PASS-.05],[sb+.2,PASS+.5],[ot+.1,0],[bg,SHOT],[tc+.2,IN_NET+.12],[E+1,IN_NET+.12+(E+.8-tc)]]),linear);};
const CAM1:V3=[-48,23,64];
function look1(tau:number):V3{const b=ballAt(tau),[fx,fz]=posOf(FO,tau);
 if(tau<SHOT){const u=sm(-3,-1,tau);return[lerp(lerp(b[0],fx,.35),lerp(b[0],fx,.5),u)+3,1,lerp(b[2],fz,.45)*.8];}
 if(tau<IN_NET){const u=sm(SHOT-.2,IN_NET,tau);return[lerp(lerp(b[0],fx,.5)+3,-7,u),1,lerp(lerp(b[2],fz,.45)*.8,1.5,u)];}
 return mix3([-7,1.2,1.5],[fx,1,fz*.8],sm(IN_NET+.4,IN_NET+2.2,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const te=T(0,'The Etihad'),wn=T(0,'Win');
 // wide on the Etihad and its masts first, then down onto the play
 const up=1-sm(te+1.1,wn+.4,t,easeInOutSine);
 const F=key(t,mono([[0,1350],[te+1.1,1450],[wn+.4,3600],[T(0,'Two minutes'),4800],[T(0,'Bernardo Silva'),5600],[T(0,'Phil Foden'),6000],[T(0,'One touch'),6300],[T(0,'bang'),6200],[T(0,'Top corner')+.4,5600],[SEC(0),5400]]),easeInOutSine);
 return cam(CAM1,mix3(look,[-46,12,-80],up),F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET,te=T(0,'The Etihad'),wn=T(0,'Win'),bs=T(0,'Bernardo Silva'),sq=T(0,'squares it'),pf=T(0,'Phil Foden'),sb=T(0,'in sky blue'),ot=T(0,'One touch'),tc=T(0,'Top corner');frame(s);
  stadium(s,c,{t,cheer:.08+.9*sm(0,.5,goalIn),flash:.1+1.2*sm(0,.4,goalIn),masts:sm(te-.1,te+.4,t)*(1-sm(wn-.6,wn,t))});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "Win": the goal City must score in lights up
  goalMouth(s,c,sm(wn-.1,wn+.4,t)*(1-sm(wn+1.6,wn+2.2,t)));
  // "squares it": the pass across the grass, dashed, drawn as it travels
  groundTrail(s,c,ballPath(PASS,0,12),.35,Y,{progress:clamp((tau-PASS)/-PASS),dashed:true,cov:.95*(1-sm(ot+.4,ot+.9,t)),seed:91});
  airTrail(s,c,SHOT,IN_NET,Y,{progress:clamp((tau-SHOT)/FL),cov:.95*(1-sm(tc+1,tc+1.5,t)),wm:.3,seed:147,head:false});
  const w=drawWorld(s,c,tau,tp,{ballMin:13,trail:1});
  // "Bernardo Silva": a ring round him; "Phil Foden" / "in sky blue": a ring round Foden
  const bern=w.res.get(BS);if(bern)bodyRing(s,bern,Y,sm(bs-.15,bs+.25,t,easeOutBack)*(1-sm(sq+.6,sq+1,t)),149);
  const hero=w.res.get(FO);if(hero){bodyRing(s,hero,Y,sm(pf-.15,pf+.25,t,easeOutBack)*(1-sm(sb+1,sb+1.4,t)));
   // "One touch": the left boot lit as it meets the ball
   bootRing(s,hero.joints.lToe,hero.joints.lAn,Y,sm(ot-.1,ot+.25,t,easeOutBack)*(1-sm(ot+.9,ot+1.3,t)),151);}
  spark(s,c,TP0,tau,1.6,97);
  // "bang": a spark at the boot
  spark(s,c,M,tau-SHOT,2.2,99);
  // "Top corner": the corner lights up as it goes in
  cornerRing(s,c,sm(tc-.3,tc+.1,t,easeOutBack)*(1-sm(tc+1.2,tc+1.6,t)),2.2);},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:12,
};

// ================= chapter 2 (TV replay, slow motion, low behind him on the pass side): the touch across his body, the ball set, the left foot =================
const tau2=(t:number)=>{const E=SEC(1),ft=T(1,'His first touch'),ab=T(1,'across his body'),ad=T(1,'away from the defender'),sf=T(1,'set for'),lf=T(1,'left foot');
 return key(t,mono([[0,-1.3],[ft,-.12],[ab+.3,.12],[ad+.4,.3],[sf+.2,.42],[lf+.2,SHOT],[E,SHOT+.5]]),linear);};
function cam2(t:number){const tau=tau2(t),E=SEC(1),[x,z]=posOf(FO,clamp(tau,-1.5,SHOT+.3)),lf=T(1,'left foot'),push=sm(T(1,'His first touch')-.6,T(1,'His first touch')+.4,t,easeInOutSine),out=sm(lf-.1,E,t,easeInOutSine);
 const look:V3=[lerp(x+2.6-.8*push,-6,out),lerp(.95,.9,out),lerp(z-.3,z*.5+.8,out)];
 return cam([x-6.2+1.6*push-2*out,lerp(3.2-1.3*push,3.4,out),z+5.4-.8*push+1.4*out],look,key(t,mono([[0,2000],[T(1,'His first touch')+.4,2350],[lf,2250],[E,1500]])));}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),ft=T(1,'His first touch'),ab=T(1,'across his body'),ad=T(1,'away from the defender'),sf=T(1,'set for'),lf=T(1,'left foot');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c);
  // "across his body": the touch's path on the grass, red, from where it met him to where it sits for the strike
  groundTrail(s,c,ballPath(0,SHOT,10),.12,R,{progress:sm(ab-.15,ab+.7,t,easeOut),cov:.95*(1-sm(lf,lf+.5,t)),seed:101});
  // "away from the defender": a red ring round Ward-Prowse's feet
  const dw=sm(ad-.15,ad+.3,t,easeOutBack)*(1-sm(sf,sf+.4,t));if(dw>.02){const[wx,wz]=posOf(WP,tau);groundRing(s,c,wx,wz,.9,.9,.06,R,.95*clamp(dw),103);}
  // "set for": the ball, set, ringed on the grass where the strike will meet it
  groundRing(s,c,M[0],M[2],.45,.45,.05,Y,.95*sm(sf-.1,sf+.3,t,easeOutBack)*(1-sm(lf+.2,lf+.6,t)),105);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,glow:sm(lf-.1,lf+.2,t)*(1-sm(lf+.9,lf+1.3,t)),trail:1});
  const hero=w.res.get(FO);
  if(hero){
   // "His first touch": the left boot ringed as it meets the ball; "left foot": the same boot at the strike, then the follow-through arc
   bootRing(s,hero.joints.lToe,hero.joints.lAn,Y,sm(ft-.1,ft+.25,t,easeOutBack)*(1-sm(ab+.3,ab+.7,t)),107);
   bootRing(s,hero.joints.lToe,hero.joints.lAn,Y,sm(lf-.15,lf+.2,t,easeOutBack)*(1-sm(E-.6,E-.25,t)),109);
   const fw=sm(lf+.2,lf+.8,t,easeOut)*(1-sm(E-.6,E-.2,t));if(fw>.02&&tau>SHOT){const arc=toeArc(c,SHOT-.02,Math.min(SHOT+.5,tau));if(arc.length>2){const wd=Math.max(5,kAt(c,M)*.05);s.knockout(ribbon(arc,wd*1.7,{seed:111,taper:.2}),.6*fw);laneArrow(s,R,arc[0],arc[arc.length-1],wd,{seed:111,head:wd*3,cov:.95*fw});}}}
  spark(s,c,TP0,tp,.8,112);spark(s,c,M,tp-SHOT,.9,113);
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:115,len:900,spread:520,width:22,cov:.5*(1-t/.5)});},
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (reverse angle from behind the net): the keeper beaten, the celebration, the title =================
const tau3=(t:number)=>{const E=SEC(2),tk=T(2,'The keeper'),nt=T(2,'no time'),gs=T(2,'get set'),cw=T(2,'City won');
 return key(t,mono([[0,SHOT-.35],[tk+.2,SHOT+.12],[nt+.5,IN_NET-.04],[gs+.4,IN_NET+.35],[cw,IN_NET+1.3],[E,IN_NET+1.3+(E-cw)*.9]]),linear);};
function cam3(t:number){const tau=tau3(t),[x,z]=posOf(FO,tau),c1=sm(IN_NET+.4,IN_NET+1.1,tau,easeInOutSine),c2=sm(IN_NET+.9,IN_NET+1.9,tau,easeInOutSine);
 // behind the net for the strike, then out round the post (never through the net) to the celebration
 const look=mix3([-9,1.5,2.4],[x+1.2,1.1,z],Math.max(c1*.6,c2));
 const pos=mix3(mix3([6.2,1.7,1.2],[4.2,2,7.4],c1),[-1.2,2.1,10.5],c2);
 return cam(pos,look,key(t,mono([[0,1500],[T(2,'no time'),1550],[T(2,'City won'),2600],[SEC(2),3000]]),easeInOutSine));}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-IN_NET,E=SEC(2),tk=T(2,'The keeper'),nt=T(2,'no time'),gs=T(2,'get set'),cw=T(2,'City won'),tl=T(2,'the league');frame(s);
  stadium(s,c,{t,cheer:.1+sm(0,.5,goalIn)+.3*sm(cw-.2,cw+.4,t),flash:.1+1.2*sm(0,.4,goalIn)+.6*sm(cw-.2,cw+.4,t)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "The keeper": a red ring on the grass where he stands
  const gw=sm(tk-.1,tk+.3,t,easeOutBack)*(1-sm(tk+1.1,tk+1.5,t)),[kx,kz]=posOf(GKI,tau);groundRing(s,c,kx,kz,1.1,1.1,.07,R,.95*clamp(gw),117);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,trail:1});
  // "no time": the gap between his glove and the ball
  const gk=w.res.get(GKI),nw=sm(nt-.1,nt+.3,t)*(1-sm(nt+1.2,nt+1.6,t));
  if(gk&&nw>.02&&depthOf(c,w.ball)>NEAR){const q=P(c,w.ball),hnd=gk.joints.lHa;laneArrow(s,R,hnd,[lerp(hnd[0],q[0],.8),lerp(hnd[1],q[1],.8)],Math.max(5,kAt(c,w.ball)*.04),{dashed:true,progress:nw,seed:119,head:12,cov:.95});}
  // "get set": his feet, still moving across when it flew past
  if(gk){const fw=sm(gs-.1,gs+.3,t,easeOutBack)*(1-sm(gs+1,gs+1.4,t));bootRing(s,gk.joints.lToe,gk.joints.lAn,R,fw,121);bootRing(s,gk.joints.rToe,gk.joints.rAn,R,fw,123);}
  // "the league": a ring round Foden as he celebrates
  const hero=w.res.get(FO);if(hero)bodyRing(s,hero,Y,sm(tl-.15,tl+.3,t,easeOutBack)*(1-sm(E-.5,E-.15,t)),125);
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:127,len:900,spread:520,width:22,cov:.5*(1-t/.45)});},
 aperture(t){const c=cam3(t),[x,z]=posOf(FO,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4,
};

// ================= chapter 4 (the lesson, a training-pitch DEMONSTRATION, not the match): one touch to set, then a LOW strike before the keeper is set =================
const tau4=(t:number)=>{const E=SEC(3),yt=T(3,'Your turn'),ot=T(3,'one touch'),sb=T(3,'set the ball'),sl=T(3,'strike it low'),bk=T(3,'before the keeper'),ir=T(3,'is ready');
 return key(t,mono([[0,-1.6],[yt+.4,-.7],[ot+.1,0],[sb+.3,.3],[sl+.15,SHOT],[bk,SHOT+.4],[ir+.2,IN_NET+.12],[E,IN_NET+.6]]),linear);};
function cam4(t:number){const tau=tau4(t),[x,z]=posOf(FO,clamp(tau,-1.6,SHOT+.2)),sl=T(3,'strike it low'),bk=T(3,'before the keeper');
 const push=sm(T(3,'one touch')-.5,T(3,'set the ball'),t,easeInOutSine),pan=sm(sl-.35,bk-.1,t,easeInOutSine);
 // beat A: low beside him on the grass; beat B: swing round behind him to look down the line of the low shot at the goal
 const posA:V3=[x-1.2+push,1.15,z+6.8-1.4*push],posB:V3=[M[0]-4.5,1.7,M[2]+2.2];
 const lookA:V3=[x+1.2,.9,z],lookB:V3=[-.5,.9,1.4];
 return cam(mix3(posA,posB,pan),mix3(lookA,lookB,pan),lerp(2200+350*push,2500,pan));}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),yt=T(3,'Your turn'),ot=T(3,'one touch'),sb=T(3,'set the ball'),sl=T(3,'strike it low'),qk=T(3,'quick'),bk=T(3,'before the keeper'),ir=T(3,'is ready'),goalIn=tau-IN_NET;frame(s);
  trainingGround(s,c);
  ground(s,c,{boards:false,net:goalIn>0?netRipple(goalIn,NET_LOW):undefined});
  // "Your turn": a ring round the ball as it rolls in
  const b0=ballAt(tau,true);groundRing(s,c,b0[0],b0[2],.5,.5,.05,Y,.95*sm(yt-.1,yt+.3,t,easeOutBack)*(1-sm(ot-.3,ot,t)),127);
  // "set the ball": the touch's path and the spot where the ball sits for the strike
  groundTrail(s,c,ballPath(0,SHOT,10,true),.1,R,{progress:sm(sb-.2,sb+.5,t,easeOut),cov:.95*(1-sm(sl+.3,sl+.7,t)),seed:129});
  groundRing(s,c,M[0],M[2],.45,.45,.05,Y,.95*sm(sb-.1,sb+.3,t,easeOutBack)*(1-sm(sl,sl+.4,t)),131);
  // "strike it low": the low line into the bottom corner, dashed, and the lit goal mouth
  const lw=sm(sl-.2,sl+.5,t,easeOut)*(1-sm(E-.5,E-.15,t));airTrail(s,c,SHOT,IN_NET,Y,{progress:lw,wm:.08,dashed:true,seed:133,demo:true});goalMouth(s,c,lw*.7);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,trail:sm(qk-.2,qk+.2,t),only:[FO,GKI],demo:true});
  const hero=w.res.get(FO);
  if(hero){
   // "one touch": the left boot lit as it meets the ball; the strike: the same boot again
   bootRing(s,hero.joints.lToe,hero.joints.lAn,Y,sm(ot-.1,ot+.25,t,easeOutBack)*(1-sm(sb,sb+.4,t)),135);
   bootRing(s,hero.joints.lToe,hero.joints.lAn,Y,sm(sl-.1,sl+.25,t,easeOutBack)*(1-sm(qk+.5,qk+.9,t)),137);}
  // "before the keeper": a red ring round the keeper, still walking across his goal
  const gk=w.res.get(GKI);if(gk)bodyRing(s,gk,R,sm(bk-.15,bk+.25,t,easeOutBack)*(1-sm(ir+.6,ir+1,t)),139);
  // "is ready": the low corner lights up as it goes in
  cornerRing(s,c,sm(ir-.1,ir+.3,t,easeOutBack)*(1-sm(E-.4,E-.1,t)),1.3,LOWHIT);
  spark(s,c,TP0,tp,.8,141);spark(s,c,M,tp-SHOT,.9,143);},
 aperture(t){const c=cam4(t),p=ballAt(tau4(t),true),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:4,
};

const story:RisoStory={
 id:'foden-signature',format:'11v11',title:'Foden: set and strike, 2024',
 theme:'Set and strike: take one touch to set the ball, then strike low before the keeper is ready.',
 ageNote:'Premier League final day, Manchester City 3–1 West Ham United, Etihad Stadium, Manchester, 19 May 2024 (79 seconds in). The win made City champions for a fourth season in a row. Foden was 23.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a camera-flash spark and the ball rockets up from the point. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*150,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);s.knockout(polyPath([[x+Math.cos(a)*30,y-up-70*fl],[x+14,y-up],[x,y-up+70*fl],[x-14,y-up]],true));sparkBurst(s,Y,x,y-up,140*g,{n:9,seed,g:fl,width:12});}
  ball(s,x,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
