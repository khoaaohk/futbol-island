/** Iconic-play film (signature): "the overlap and cross". Pervis Estupiñán arrives from left-back to score from Kaoru Mitoma's lay-off:
 * Wolverhampton Wanderers 1–4 Brighton & Hove Albion, Premier League (matchday 2), Molineux, Wolverhampton, Saturday 19 August 2023 (15:00 BST),
 * less than a minute into the SECOND half (Wikipedia: 46'), making it 0–2. It was his second goal for Brighton.
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives Estupiñán a signature, not a match ("Signature: the overlap and cross", overlap_run, left side;
 * lesson "Time your overlap so you arrive just as your winger is ready to pass"). This is the best-documented goal in which the left-back's
 * forward run ARRIVES just as his left winger passes: the written reports describe the whole play (March's ball down the channel, Welbeck's
 * powerful shot parried by José Sá to Mitoma, "who cleverly laid it into Estupinan whose low left-footer found the corner"; "Matheus did not track
 * Estupiñán"), so that play is staged inside the real match. No source describes an OVERLAP (running round the outside of the winger) or a
 * CROSS in this goal, so the match chapters never show or narrate one: the overlap-and-cross itself is a separate, clearly labelled
 * "How he does it" DEMONSTRATION on a training pitch in training tops (chapter 3).
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/estupinan-signature/script.json. The voice is generated later by the lead (local Kokoro). Until then
 * every chapter runs on provisional cue times (≈2.6 words/s, see prov()); every action time is read from cue onsets and chapter seconds,
 * so once timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/estupinan-signature/timing.json exists, replace `null` in `const VOICE` below with the timing
 *   import timingJson from '../../../public/plays/narration/estupinan-signature/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026 with curl, generic UA; cached under the session scratchpad films/src-cache/; written accounts + one agency photo;
 * the video footage was not reviewed):
 *  - Brighton & Hove Albion, "Albion March to top of the table", 19 Aug 2023 (web.archive.org copy of brightonandhovealbion.com/news/3640283):
 *    "on a sunny Molineux Saturday"; "Less than a minute into the second half it was 2-0. March played a great ball down the channel for Danny
 *    Welbeck. His powerful shot was parried by Sa to Mitoma who cleverly laid it into Estupinan whose low left-footer found the corner."; the
 *    Albion XI (Steele; Milner, Webster, Dunk, Estupinan; Gilmour, Gross, March, Mitoma; Enciso, Welbeck); "3,000 or so Albion fans in the
 *    Billy Wright Stand". (cache: archive-bha-wol-bha-2023.txt)
 *  - The Guardian, Peter Lansley at Molineux, 19 Aug 2023: "Brighton scored immediately in the second half. After a Wolves attack, Matheus did
 *    not track Estupiñán who scored from Mitoma's pullback after Danny Welbeck's shot was parried"; "a close-range finish from Pervis
 *    Estupiñán"; matching 4-4-2 formations; final score 1–4. Its photo (Clive Mason/Getty) of March's goal the same afternoon shows the KITS
 *    and the sun. (cache: guardian-wol-bha-2023.txt, mitoma-wol-march.jpg)
 *  - Wikipedia, "Pervis Estupiñán" (raw): left-back / left wing-back; his second Brighton goal on 19 Aug 2023 in the 4–1 win at Wolves.
 *    Wikipedia, "2023–24 Brighton & Hove Albion F.C. season" (raw): Estupiñán 46', squad number 30. (cache: wiki-pervis-estupinan.txt,
 *    wiki-2023-24-brighton-season.txt)
 *  - lib/town/playerAppearance.json (Ecuador; skin 6, short black hair) and lib/town/playerCareers.json (Brighton & Hove Albion 2022–25).
 *  - Sibling film lib/plays/riso/mitoma-signature.ts (same match, first half): the same ground, kits and ball are drawn the same way.
 * CONFIRMED by those accounts: the match, date, ground, SUNNY weather, less than a minute into the second half, 0–2, final 1–4; March's pass
 *  down the channel to Welbeck; Welbeck's POWERFUL shot PARRIED by the keeper (Sá) to Mitoma; Mitoma LAID IT into Estupiñán's path (a
 *  "pullback"); Estupiñán's LOW LEFT-FOOTED finish into the corner from close range; Matheus (Nunes) did not track his run, which came
 *  after a Wolves attack. KITS (the photo, same match): Brighton in their HOME blue-and-white striped shirts, blue shorts, blue socks; a white
 *  ball with orange and dark graphics. Estupiñán's number 30, Mitoma's 22.
 * INFERRED / ILLUSTRATIVE: every position, run and speed in metres and seconds; that the channel was the LEFT one and Mitoma was on the left
 *  (his usual wing, the card's side); which way Brighton attacked (drawn right → left on screen from the main-stand camera, the opposite end to
 *  the first-half film, so his left flank is the near side); how far back his run started; which way the keeper dived to parry (drawn to his
 *  right); WHICH corner (drawn: the far post, away from the keeper who had gone down to parry); Mitoma's lay-off foot (drawn right, first-time
 *  after one settling touch); Welbeck's shooting foot (right) and March's passing foot (left); Wolves in their home old-gold shirts, black
 *  shorts, gold socks (they were at home; not in the photo); the keeper's kit colour (drawn grey), the referee's black; the away fans' block;
 *  every other player's spot; the celebration.
 *  Chapter 3 (the overlap and cross) is a DEMONSTRATION on a training pitch, not match footage.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock
 * τ (seconds, τ = 0 his shot): ch1 = the high main-stand broadcast camera, near real time (sunny Molineux, his run from deep, March → Welbeck,
 * the parry, Mitoma's lay-off, the low left-footed finish); ch2 = the TV slow-motion replay from a low rail camera beside his run (no one
 * follows him, the lay-off into his path, the goal, 4–1); ch3 = "How he does it", a training demonstration: wait behind the winger, burst
 * round the outside, receive in stride, cross; arrive just as the winger is ready to pass.
 * Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Inks: yellow (grass with blue, Wolves' gold, the seats, timing marks),
 * red (his route and shot, skin, the ball's orange), blue (grass, Brighton's blue), navy (key line, black shorts, roofs, pass lines).
 * Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,runCycle,stand,strike,header,backpedal,celebrate,keeperSet,keeperDive,solve,
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
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9éñá]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`estupinan film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/estupinan-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Right on time','Seconds into the second half at Molineux. Pervis Estupiñán races forward. March finds Welbeck. Powerful shot, saved! Mitoma lays it back. Low left foot, into the corner!',
  ['Seconds','Molineux','Pervis','races forward','March finds','Welbeck','Powerful shot','saved','Mitoma','lays it back','Low left foot','corner']),
 prov('No one follows','Watch again, slowly. He sprints from deep, and no one follows. Mitoma cleverly lays it into his path. Brighton won four to one.',
  ['Watch again','sprints','no one follows','Mitoma','cleverly','his path','Brighton won','four to one']),
 prov('How he does it','How does he do it? He waits behind his winger, then bursts round the outside. Pass, and cross! Time your overlap so you arrive just as your winger is ready to pass!',
  ['How does','waits behind','bursts round','Pass','cross','Time your overlap','arrive','ready to pass']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`estupinan film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; Wolves' goal is at x = 0, the pitch runs to
// x = −105; Brighton attack toward x = 0. The main-stand camera sits at −z (second half: Brighton attack right → left on screen), so
// Brighton's LEFT wing, −z, is the near side) =================
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

// ================= Molineux on a sunny August afternoon: four separate rectangular stands, old-gold seats, dark roofs =================
/** stand planes (a along, b up the rake 0..1): 0 the camera side (−z), 1 behind Wolves' goal (+x), 2 the other end (−x), 3 the far side
 * (+z, two tiers with a box band). Corners open. */
const STANDS:((a:number,b:number)=>V3)[]=[
 (a,b)=>[lerp(-113,8,a),1.2+19*b,-40-24*b],
 (a,b)=>[8+22*b,1.2+15*b,lerp(37,-37,a)],
 (a,b)=>[-113-22*b,1.2+15*b,lerp(-37,37,a)],
 (a,b)=>[lerp(8,-113,a),1.2+19*b,40+24*b],
];
const STAND_COLS=[84,46,46,84],STAND_ROWS=[11,9,9,11],BOX=[[.5,.58],null,null,[.5,.58]] as([number,number]|null)[];
type Seat={P:V3;h:number;si:number;a:number};
const SEATS:Seat[]=(()=>{const o:Seat[]=[];STANDS.forEach((S,si)=>{const cols=STAND_COLS[si],rows=STAND_ROWS[si],bx=BOX[si];
 for(let j=0;j<rows;j++){const b=(j+.5)/rows;if(bx&&b>bx[0]-.03&&b<bx[1]+.03)continue;for(let i=0;i<cols;i++){const h=hash(i*131+j*7919+si*17,13);if(h<.16)continue;const a=(i+.5+(hash(i+j*31,9)-.5)*.6)/cols;const p=S(a,b);o.push({P:[p[0],p[1]+.4,p[2]],h,si,a});}}});return o;})();
type Crowd={t:number;cheer?:number;flash?:number;which?:number[]};
/** a bright summer sky: a pale blue field, a little deeper overhead */
function sunSky(s:Sheet,c:Camera){const Bnd=Math.max(s.W,s.H)*1.5,hz=P(c,[c.eye[0]+c.f[0]*1e4,c.eye[1],c.eye[2]+c.f[2]*1e4])[1];
 s.field(B,.08,.5);s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-380],[-Bnd,hz-340]],true),.18);}
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flash=0,which=[3,1,2]}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt)=>Math.abs(p[0])<Bnd&&Math.abs(p[1])<Bnd;
 sunSky(s,c);
 const planes=new Path2D(),box=new Path2D(),roof=new Path2D(),fas=new Path2D(),back=new Path2D();
 for(const si of which){const S=STANDS[si],bx=BOX[si],top=(a:number):V3=>{const p=S(a,1);return[p[0],p[1]+2,p[2]];},front=(a:number):V3=>{const p=S(a,.42),q=S(a,1);return[p[0],q[1]+3.2,p[2]];};
  addPoly(back,clipPoly(c,[S(0,1),S(1,1),top(1),top(0)]));
  addPoly(planes,clipPoly(c,[S(0,0),S(1,0),S(1,1),S(0,1)]));
  if(bx)addPoly(box,clipPoly(c,[S(0,bx[0]),S(1,bx[0]),S(1,bx[1]),S(0,bx[1])]));
  addPoly(roof,clipPoly(c,[top(0),top(1),front(1),front(0)]));
  const f0=front(0),f1=front(1);addPoly(fas,clipPoly(c,[f0,f1,[f1[0],f1[1]-1.2,f1[2]],[f0[0],f0[1]-1.2,f0[2]]]));}
 // old-gold seats under the crowd
 s.knockout(planes);s.tone(Y,planes,.72);s.tone(R,planes,.22);s.tone(K,planes,.12);
 s.knockout(back);s.fill(K,back,.7);
 s.knockout(box);s.fill(K,box,.8);
 // the crowd: gold shirts, black, white summer shirts, orange; Brighton's blue-and-white in one corner (inferred); the home crowd bob
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of SEATS){if(!which.includes(q.si))continue;const d=depthOf(c,q.P);if(d<14)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),away=q.si===3&&q.a<.13,lift=cheer>0&&away?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[away?(q.h<.6?3:1):q.h<.5?0:q.h<.7?1:q.h<.92?2:4].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.fill(Y,inks[0],.95);s.knockout(inks[1],.85);s.fill(K,inks[2],.8);s.fill(B,inks[3],.9);s.fill(R,inks[4],.9);}
 s.knockout(roof);s.fill(K,roof,.88);
 s.knockout(fas,.9);s.tone(Y,fas,.5);
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const q=SEATS[Math.floor(r()*SEATS.length)];if(!which.includes(q.si))continue;const d=depthOf(c,q.P);if(d<16)continue;const[x,y]=P(c,q.P),sz=clamp(c.F*1/d,8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
}
/** the pitch: a grass apron with LED boards, sunlit striped grass (yellow × blue), paper lines, both goals */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3;boards?:boolean}={}){
 const ap=new Path2D();addPoly(ap,clipPoly(c,[[-111,0,-39],[7,0,-39],[7,0,39],[-111,0,39]]));s.knockout(ap);s.fill(Y,ap,.72);s.tone(B,ap,.66);s.tone(K,ap,.2);
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-109,0,-37],[4,0,-37],[4,0,37],[-109,0,37]]));s.knockout(gp);s.fill(Y,gp,.8);s.tone(B,gp,.62);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{let prev:[number,number]|null=null;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,p:[number,number]=[cx+Math.cos(a)*r,cz+Math.sin(a)*r];if(prev)Ln(prev,p);prev=p;}};
 arc(-52.5,0,9.15,0,TAU,24);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)arc(gx-11,0,9.15,Math.PI-a,Math.PI+a,8);else arc(gx+11,0,9.15,-a,a,8);
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.95);
 if(o.boards!==false){const bd=new Path2D(),band=new Path2D(),seg=(a:[number,number],b:[number,number])=>{const q=clipPoly(c,[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],.9,b[1]],[a[0],.9,a[1]]]);if(depthOf(c,[(a[0]+b[0])/2,.5,(a[1]+b[1])/2])<6)return;addPoly(bd,q);addPoly(band,clipPoly(c,[[a[0],.35,a[1]],[b[0],.35,b[1]],[b[0],.6,b[1]],[a[0],.6,a[1]]]));};
  for(let x=-104;x<0;x+=8){seg([x,-38],[x+8,-38]);seg([x,38],[x+8,38]);}for(let z=-30;z<30;z+=8){if(Math.abs(z+4)<6)continue;seg([5,z],[5,z+8]);seg([-110,z],[-110,z+8]);}
  s.knockout(bd);s.fill(K,bd,.82);s.fill(Y,band,.8);}
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
 s.knockout(vol,.3);s.tone(K,vol,.14);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[X,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a0:V3,b0:V3,w0=.12)=>{const a:V3=[X+dir*a0[0],a0[1],a0[2]],b:V3=[X+dir*b0[0],b0[1],b0[2]];if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.05);bar([Dp,0,W],[Dp,H,W],.05);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.6*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};
/** the lesson's training pitch (no stands, no crowd): open summer sky, a tree line behind the goal and down the far side */
function trainingGround(s:Sheet,c:Camera){
 s.field(B,.1,.5);
 const Bnd=Math.max(s.W,s.H)*1.5,hz=P(c,[c.eye[0]+c.f[0]*1e4,c.eye[1],c.eye[2]+c.f[2]*1e4])[1];
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-460],[-Bnd,hz-420]],true),.2);
 const trees=new Path2D(),row=(a:[number,number],b:[number,number],n:number,seed:number)=>{const top:V3[]=[],base:V3[]=[];for(let i=0;i<=n;i++){const u=i/n,x=lerp(a[0],b[0],u),z=lerp(a[1],b[1],u),h=8+5*hash(i,seed)+2*Math.sin(i*1.7+seed);top.push([x,h,z]);base.push([x,0,z]);}
  addPoly(trees,clipPoly(c,[...base,...top.reverse()]));};
 row([30,-70],[30,70],28,3);row([-120,48],[30,48],30,7);row([-125,-70],[-125,70],28,9);
 s.knockout(trees);s.fill(K,trees,.5);s.tone(B,trees,.45);s.tone(Y,trees,.25);
}

// ================= the ball: the 2023–24 Premier League ball, white with orange and dark graphics (the photo) =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(K,crescent(0,0,r*1.02,[-.4,-.45]),.22);
 const sw=new Path2D(),seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);
  const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=Math.sin(u*1.5+a)*r*.18;pts.push([px*ca-py*sa,px*sa+py*ca]);}sw.addPath(ribbon(pts,Math.max(2,r*.28),{taper:.4,wobble:0}));
  for(const off of[-.4,.4]){const q:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;q.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(q,false));}}
 s.fill(R,sw,.9);s.stroke(K,seams,Math.max(1.4,r*.1),.7);
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad+b[1]*.25,.02,b[2]+Math.sin(a)*rad+b[1]*.15];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (19 August 2023) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[R,.2],[Y,.45]],SKIN_E:AthleteStyle['skin']=[[R,.16],[Y,.52]],SKIN_M:AthleteStyle['skin']=[[R,.28],[Y,.55],[K,.06]],SKIN_D:AthleteStyle['skin']=[[R,.42],[Y,.5],[K,.34]];
/** Brighton & Hove Albion at Molineux (the photo): home blue-and-white striped shirts, blue shorts, blue socks */
const BHA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.92],pattern:'stripes',patternInk:'paper',shorts:[B,.92],socks:[B,.92],boots:K,trim:'paper',skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.3],numberInk:K,number:null,...o});
/** Wolves at home (inferred): old-gold shirts, black shorts, gold socks */
const WOL=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[Y,.95],shorts:[K,.9],socks:[Y,.95],boots:K,trim:[K,.9],skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[R,.34],number:null,...o});
/** Estupiñán: No. 30, left-back, about 1.75 m, compact and quick, dark skin, short black hair (playerAppearance: skin 6); LEFT-footed finish */
const ESTUPINAN:AthleteStyle=BHA({number:30,skin:SKIN_D,hair:[K,.95],hairStyle:'short',build:{height:1.75,bulk:1.02,thighs:1.1},seed:30});
/** Mitoma: No. 22, 1.78 m, slim, short black hair */
const MITOMA:AthleteStyle=BHA({number:22,skin:SKIN_E,hair:[K,.95],hairStyle:'short',build:{height:1.78,bulk:.92,thighs:1.02},seed:22});
const KEEP:AthleteStyle={shirt:[K,.5],shorts:[K,.5],socks:[K,.5],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,sleeves:'long',gloves:'paper',shade:[K,.3],number:null,build:{height:1.9},seed:1};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'balding',line:K,sleeves:'short',seed:33};
/** the "how he does it" demonstration (not the match): the full-back and the winger in blue training tops, a defender in red */
const TRAIN_FB:AthleteStyle={shirt:[B,.9],shorts:K,socks:'paper',boots:K,trim:'paper',skin:SKIN_D,hair:[K,.95],hairStyle:'short',line:K,shade:[K,.3],number:null,build:{height:1.75,bulk:1.02,thighs:1.1},seed:30};
const TRAIN_W:AthleteStyle={...TRAIN_FB,skin:SKIN_M,build:{height:1.78,bulk:.94},seed:71};
const TRAIN_ST:AthleteStyle={...TRAIN_FB,skin:SKIN_L,build:{height:1.86},seed:73};
const TRAIN_D:AthleteStyle={shirt:[R,.9],shorts:K,socks:[R,.9],boots:K,trim:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.3],number:null,build:{height:1.84},seed:61};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= simulation machinery (shared by the match and the demo) =================
type TK=[number,number,number];// time, x, z
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
type Sim={pos:(k:number,t:number)=>[number,number];dist:(k:number,t:number)=>number;vel:(k:number,t:number)=>[number,number];speed:(k:number,t:number)=>number;boot:(k:number,t:number,ahead?:number)=>V3};
/** per-actor tables at 50 Hz: position and distance run (the gait phase) */
function makeSim(keys:TK[][],TA:number,TB:number):Sim{const DT=.02;
 const TB_=keys.map(ks=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(ks,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
 const samp=(arr:number[],t:number)=>{const u=clamp((t-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
 const pos=(k:number,t:number):[number,number]=>[samp(TB_[k].X,t),samp(TB_[k].Z,t)];
 const vel=(k:number,t:number):[number,number]=>{const a=pos(k,t-.1),b=pos(k,t+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};
 return{pos,vel,dist:(k,t)=>samp(TB_[k].D,t),speed:(k,t)=>{const v=vel(k,t);return Math.hypot(v[0],v[1]);},
  boot:(k,t,ahead=.5)=>{const[x,z]=pos(k,t),v=vel(k,t),l=Math.hypot(v[0],v[1]);const dx=l>.3?v[0]/l:1,dz=l>.3?v[1]/l:0;return[x+dx*ahead-dz*.1,.11,z+dz*ahead+dx*.1];}};}
/** over(): blend channel overrides (degrees) into a pose */
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** a kick (pass, shot, cross): the strike blended in round its contact time */
function kickAt(p:Pose,tau:number,at:number,power:number,foot:'l'|'r',D=.9){const u=(tau-(at-STRIKE_CONTACT*D))/D;return u>-.2&&u<1.4?blendPose(p,strike(clamp(u),{foot,power}),Math.min(sm(-.2,0,u),1-sm(1,1.4,u))):p;}
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const roll=(a:V3,b:V3,u:number)=>mix3(a,b,u*(1.3-.3*u));
/** a generic running / backpedalling / standing footballer at speed sp facing yaw */
function gait(sim:Sim,k:number,t:number,yaw:number,idle:Pose):Pose{const v=sim.vel(k,t),sp=Math.hypot(v[0],v[1]),along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)return blendPose(idle,backpedal(sim.dist(k,t)/1.25),clamp((sp-.5)/.8));
 const s=clamp((sp-2.2)/5.5);return blendPose(idle,runCycle(sim.dist(k,t)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}

// ================= the goal as ONE simulation on τ (seconds; τ = 0 his shot) =================
type Role='est'|'mt'|'bha'|'wol'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
/** the beats: March's pass, Welbeck's touch and shot, the parry, Mitoma's touch and lay-off, the finish */
const PASS_M=-4.7,W_RCV=-3.7,W_SHOT=-3.0,PARRY=-2.5,M_RCV=-1.75,LAY=-.95,SHOT=0;
/** Positions are Hermite-interpolated between keys (all illustrative, see INFERRED). Brighton attack toward x = 0. */
const ACTORS:Actor[]=[
 // Estupiñán: jogs back up after the Wolves attack, then sprints ≈7 m/s from deep on the left, steadies and meets the lay-off
 {name:'Estupiñán',role:'est',style:ESTUPINAN,key:true,keys:[[-9.5,-52,-26],[-8,-50.2,-25.9],[-7,-48.6,-25.8],[-6,-45.6,-25.4],[-5,-41,-24.5],[-4,-35.2,-22.7],[-3,-29,-19.9],[-2,-22.9,-16.3],[-1,-17,-12.1],[-.4,-13.2,-9.2],[0,-11.5,-7.8],[.5,-10.6,-7.6],[1.4,-9.8,-9.2],[2.6,-9.6,-12.6],[5,-10.4,-17.5]]},
 {name:'Mitoma',role:'mt',style:MITOMA,key:true,keys:[[-9.5,-20,-19],[-6,-16,-17.8],[-4,-12.6,-15.6],[-2.6,-10.4,-14],[M_RCV,-8.4,-12.4],[LAY,-8.5,-12],[0,-9,-11.4],[1.2,-9.6,-10.4],[2.6,-9.4,-12],[5,-10.2,-16.4]]},
 {name:'Welbeck',role:'bha',style:BHA({seed:302,skin:SKIN_D,build:{height:1.85}}),key:true,keys:[[-9.5,-27,-1],[-6,-24.6,-2],[-4.6,-22.2,-3.6],[W_RCV,-19.6,-4.6],[W_SHOT,-17.4,-4.8],[-2.4,-16.2,-4.6],[-1,-14.4,-3.6],[0,-13.4,-2.8],[5,-11.5,-5]]},
 {name:'March',role:'bha',style:BHA({seed:307,skin:SKIN_L}),key:true,keys:[[-9.5,-42,8],[-6,-37,5.5],[PASS_M,-34,3.9],[-3,-31,2.6],[0,-25,.8],[5,-20,-1.5]]},
 {name:'Keeper',role:'gk',style:KEEP,key:true,keys:[[-9.5,-4.2,-.4],[-5,-3.8,-1],[-3.2,-3,-1.2],[-2.2,-3.1,-1.9],[-1.4,-3,-2.1],[-.6,-2.6,-1.5],[0,-2.4,-1],[5,-2.4,-1]]},
 {name:'Matheus',role:'wol',style:WOL({seed:201,skin:SKIN_M}),keys:[[-9.5,-46,-18],[-7,-43,-18],[-5,-39.4,-17.6],[-3,-35.2,-16.8],[-1,-31,-15.6],[0,-29.2,-15],[5,-22,-12]]},
 {name:'Wolves RB',role:'wol',style:WOL({seed:202,skin:SKIN_D}),keys:[[-9.5,-15,-21],[-5,-11.6,-17.8],[-2.6,-9.4,-15.6],[M_RCV,-8.2,-14.6],[LAY,-7.6,-13.6],[0,-7.8,-12.8],[5,-8.6,-12]]},
 {name:'Wolves CB',role:'wol',style:WOL({seed:203,build:{height:1.9}}),keys:[[-9.5,-24,-6],[-6,-21.4,-5.4],[W_RCV,-17.6,-5.6],[W_SHOT,-15.8,-5.8],[-2,-13.8,-5.4],[-1,-11.4,-5],[0,-9.2,-4.6],[5,-7.4,-4]]},
 {name:'Wolves CB2',role:'wol',style:WOL({seed:204,skin:SKIN_M,build:{height:1.88}}),keys:[[-9.5,-20,4],[-5,-14,1.6],[-2,-9.4,.6],[0,-7.2,.6],[5,-6.2,1]]},
 {name:'Wolves LB',role:'wol',style:WOL({seed:205,skin:SKIN_E}),keys:[[-9.5,-24,15],[-5,-17,10],[0,-10.4,6.4],[5,-9.4,5.4]]},
 {name:'Wolves CM',role:'wol',style:WOL({seed:206}),keys:[[-9.5,-42,-4],[-5,-36,-3.6],[0,-28.4,-3],[5,-23,-2.4]]},
 {name:'Wolves FW',role:'wol',style:WOL({seed:207,skin:SKIN_D}),keys:[[-9.5,-58,-8],[-5,-52,-8.6],[0,-45,-8],[5,-40,-7]]},
 {name:'Enciso',role:'bha',style:BHA({seed:303,skin:SKIN_M,build:{height:1.72}}),keys:[[-9.5,-30,11],[-5,-21,8],[-2,-14,5.6],[0,-10.6,4.4],[5,-10.8,2]]},
 {name:'Gross',role:'bha',style:BHA({seed:304}),keys:[[-9.5,-46,-4],[-5,-40,-2.4],[0,-32,-3],[5,-26,-4]]},
 {name:'Gilmour',role:'bha',style:BHA({seed:305,skin:SKIN_E,build:{height:1.7}}),keys:[[-9.5,-56,3],[-5,-52,2],[0,-46,1],[5,-41,0]]},
 {name:'Referee',role:'ref',style:REF,keys:[[-9.5,-44,4],[-5,-37,3],[0,-29,1.5],[5,-24,0]]},
];
const EST=0,MT=1,WEL=2,MAR=3,GK=4,MAT=5;
const TA=-9.5,TB=6;
const SIM=makeSim(ACTORS.map(a=>a.keys),TA,TB);
const posOf=SIM.pos,velOf=SIM.vel,speedOf=SIM.speed,distOf=SIM.dist,bootOf=SIM.boot;

// ---- Estupiñán: the sprint, the steadying stride, the low LEFT-footed finish, the celebration ----
const HIT:V3=[0,.28,2.9];// low in the far corner (inferred: away from the keeper, who went down to his right to parry)
const AIM:[number,number]=[0,3.2];
function yawEst(tau:number){const v=velOf(EST,tau),run=Math.hypot(v[0],v[1])>.4?YAW(v[0],v[1]):0,[x,z]=posOf(EST,tau);
 const aimY=YAW(AIM[0]-x,AIM[1]-z);
 return lerpAng(run,aimY,sm(SHOT-.5,SHOT-.15,tau)*(1-sm(SHOT+.7,SHOT+1.3,tau)));}
const SD=.8,S_ST=SHOT-STRIKE_CONTACT*SD;
function estPose(tau:number):Pose{
 const sp=speedOf(EST,tau),s=clamp((sp-2.6)/4.2),d=distOf(EST,tau);
 let p=runCycle(d/(2.3+2*s),{speed:.25+.75*s});
 p=blendPose(stand(),p,clamp((sp-.3)/.8));
 const v=(tau-S_ST)/SD;
 if(v>-.1&&v<1.5)p=blendPose(p,strike(clamp(v),{foot:'l',power:.8}),Math.min(sm(-.1,.12,v),1-sm(1.05,1.5,v)));
 if(tau>SHOT+1.1)p=blendPose(p,celebrate((tau-SHOT-1.1)*1.1,{kind:'run'}),sm(SHOT+1.1,SHOT+1.6,tau));
 return p;}
/** his left toe at the shot (from the solved skeleton), a touch ahead, on the grass: where the lay-off must arrive */
const M:V3=(()=>{const[x,z]=posOf(EST,SHOT),y=yawEst(SHOT),sk=solve(estPose(SHOT),ESTUPINAN.build,{x,z,yaw:y});return[sk.lToe[0]+Math.cos(y)*.1,.11,sk.lToe[2]-Math.sin(y)*.1];})();

// ---- the ball: March's pass, Welbeck's touch and shot, the parry, Mitoma's touch and lay-off, the low finish, the net ----
const PB=bootOf(MAR,PASS_M,.45),WR=bootOf(WEL,W_RCV,.4),WS=bootOf(WEL,W_SHOT,.3);
const PP:V3=[-3.4,.62,-3.1];// the parry, at the keeper's hands (his right)
const MR=bootOf(MT,M_RCV,.35),MS:V3=(()=>{const[x,z]=posOf(MT,LAY);return[x-.3,.11,z+.35];})();
const FL=.62,IN_NET=SHOT+FL,BACKT=IN_NET+.08;
/** the finish: low and hard, skimming the grass */
function shot(u:number):V3{return[lerp(M[0],HIT[0],u),lerp(M[1],HIT[1],u)+.18*Math.sin(Math.PI*u),lerp(M[2],HIT[2],u)];}
function ballAt(tau:number):V3{
 const back:V3=[1.9,.2,2.8],rest:V3=[1.4,.11,2.3];
 if(tau<PASS_M)return bootOf(MAR,tau,.45);
 if(tau<W_RCV)return roll(PB,WR,(tau-PASS_M)/(W_RCV-PASS_M));
 if(tau<W_SHOT){const u=(tau-W_RCV)/(W_SHOT-W_RCV);return mix3(mix3(WR,bootOf(WEL,tau,.55),easeOut(clamp(u*2.5))),WS,sm(.55,1,u));}
 if(tau<PARRY){const u=(tau-W_SHOT)/(PARRY-W_SHOT);const q=mix3(WS,PP,u);return[q[0],q[1]+.35*Math.sin(Math.PI*u),q[2]];}
 if(tau<M_RCV){const u=(tau-PARRY)/(M_RCV-PARRY),q=mix3(PP,MR,easeOut(u)*.4+u*.6);return[q[0],Math.max(.11,lerp(PP[1],.11,u)+1.1*Math.sin(Math.PI*u)*(1-u*.3)),q[2]];}
 if(tau<LAY){const u=(tau-M_RCV)/(LAY-M_RCV);return mix3(MR,MS,easeOut(clamp(u*1.6)));}
 if(tau<SHOT)return roll(MS,M,(tau-LAY)/(SHOT-LAY));
 if(tau<IN_NET)return shot((tau-SHOT)/FL);
 if(tau<BACKT)return mix3(HIT,back,(tau-IN_NET)/(BACKT-IN_NET));
 const u=clamp((tau-BACKT)/.75);return[lerp(back[0],rest[0],easeOut(u)),lerp(back[1],.11,u),lerp(back[2],rest[2],u)];
}
const NET_HIT:V3=[2,.3,2.9];

// ---- everyone else ----
const DIVE1=PARRY-.55,DIVE2=SHOT+.12;
/** a pose + yaw for actor k at τ */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 if(k===EST)return{p:estPose(tau),yaw:yawEst(tau)};
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);let p=blendPose(keeperSet(tau*1.4),runCycle(distOf(k,tau)/2.6,{speed:clamp((sp-1)/5)}),clamp((sp-.6)/1));
  // the parry: a full dive to his right; down on the grass; back up; a late, beaten dive to his left for the finish
  const u1=(tau-DIVE1)/1.1;if(u1>0&&tau<-.4){yaw=YAW(WS[0]-x,WS[2]-z);p=blendPose(keeperDive(clamp(u1),{side:'r',height:.3}),stand(),sm(-1.5,-.6,tau));}
  const u2=(tau-DIVE2)/1;if(u2>0){yaw=YAW(M[0]-x,M[2]-z);p=keeperDive(clamp(u2),{side:'l',height:.05});if(tau>IN_NET+.4)p=over(p,{neckP:-30,neckY:40},sm(IN_NET+.4,IN_NET+1,tau));}
  return{p,yaw};}
 const idle=a.role==='wol'?READY:stand();
 let p=gait(SIM,k,tau,yaw,idle);
 if(a.role==='wol'&&tau<SHOT+.2&&k!==MAT)yaw=lerpAng(yaw,YAW(b[0]-x,b[2]-z),.6);
 if(k===MAR){if(tau<PASS_M+.3)yaw=YAW(WR[0]-x,WR[2]-z);p=kickAt(p,tau,PASS_M,.5,'l',.8);}
 if(k===WEL){if(tau>W_RCV-.6&&tau<W_SHOT+.3)yaw=lerpAng(yaw,YAW(PP[0]-x,PP[2]-z),sm(W_RCV-.6,W_RCV,tau));p=kickAt(p,tau,W_SHOT,1,'r',.85);}
 if(k===MT){if(tau>PARRY-.3&&tau<LAY+.4)yaw=tau<M_RCV?YAW(PP[0]-x,PP[2]-z):lerpAng(YAW(PP[0]-x,PP[2]-z),YAW(M[0]-x,M[2]-z)+.5,sm(M_RCV,LAY-.2,tau));
  p=kickAt(p,tau,LAY,.35,'r',.75);
  if(tau>M_RCV-.2&&tau<M_RCV+.35)p=over(p,{rHipF:28,rKnee:30,lKnee:36,lean:20},Math.sin(Math.PI*clamp((tau-M_RCV+.2)/.55)));}
 if(tau>IN_NET+.4&&(k===MT||k===WEL||k===12))p=blendPose(p,celebrate((tau-IN_NET)*1.1+k*.13,{kind:'arms'}),sm(IN_NET+.4,IN_NET+1,tau));
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted; `hero` draws Estupiñán with motion smear + secondary motion */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;trail?:number}):World{
 const b=ballAt(tau),items:Item[]=[],res=new Map<number,DrawResult>();
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 const PL=(k:number,tt:number):Place=>{const[x,z]=posOf(k,tt);return{x,z,yaw:poseOf(k,tt).yaw};};
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<(k===EST?1:3.5))return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const pose=poseOf(k,tp).p,yaw=PL(k,tp).yaw,px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===EST?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===EST||a.key);
   const prev=big?{pose:poseOf(k,tp-1/12).p,place:{...PL(k,tp-1/12),x:posOf(k,tau-1/12)[0],z:posOf(k,tau-1/12)[1]}}:undefined;
   res.set(k,drawPlayer(s,pose,c,{...a.style,detail},place,{prev,smear:!!o.hero&&k===EST&&speedOf(EST,tau)>4.5}));}});});
 items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,ballAt(tau-.03)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  const hard=(tau>W_SHOT&&tau<PARRY)?[W_SHOT,PARRY]:(tau>SHOT&&tau<IN_NET+.05)?[SHOT,IN_NET]:null;
  if(o.trail&&hard){const back=P(c,ballAt(Math.max(hard[0],tau-.14)));speedLines(s,K,q[0],q[1],Math.atan2(back[1]-q[1],back[0]-q[0]),{n:5,seed:77,len:Math.max(r*3,Math.hypot(back[0]-q[0],back[1]-q[1])),spread:r*1.6,width:Math.max(3,r*.35),cov:.6*o.trail});}
  ball(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());
 return{ball:b,res};}

// ================= teaching marks =================
/** a ribbon on the grass along ground points (metres), width in metres; progress 0..1; optional arrowhead */
function groundTrail(s:Sheet,c:Camera,pts:[number,number][],wm:number,ink:string,o:{progress?:number;cov?:number;head?:boolean;dashed?:boolean;seed?:number;dash?:number}={}){
 const{progress=1,cov=.95,head=true,dashed=false,seed=5,dash=.14}=o;if(progress<=.01||cov<=.01)return;
 const n=Math.max(2,Math.round(pts.length*clamp(progress))),q:Pt[]=[];let d=1;for(const p of pts.slice(0,n)){const g:V3=[p[0],.03,p[1]];const dd=depthOf(c,g);if(dd<NEAR+.2)continue;q.push(P(c,g));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=dash*.55;x<.95;x+=dash)gaps.push([x,x+dash/2]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.8,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.8,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
/** the same, through 3D points (a ball in the air) */
function airTrail(s:Sheet,c:Camera,pts:V3[],wm:number,ink:string,o:{progress?:number;cov?:number;dashed?:boolean;seed?:number}={}){
 const{progress=1,cov=.95,dashed=true,seed=5}=o;if(progress<=.01||cov<=.01)return;
 const n=Math.max(2,Math.round(pts.length*clamp(progress))),q:Pt[]=[];let d=1;for(const p of pts.slice(0,n)){const dd=depthOf(c,p);if(dd<NEAR+.2)continue;q.push(P(c,p));d=dd;}
 if(q.length<2)return;const w=Math.max(4,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.07;x<.95;x+=.14)gaps.push([x,x+.07]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.6,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.6,gaps}),cov);}
const ballPath=(t0:number,t1:number,n=12):[number,number][]=>Array.from({length:n+1},(_,i)=>{const b=ballAt(t0+(t1-t0)*i/n);return[b[0],b[2]];});
const runPath=(k:number,t0:number,t1:number,n=12):[number,number][]=>Array.from({length:n+1},(_,i)=>posOf(k,t0+(t1-t0)*i/n));
/** a ring on the grass (centre, radii in metres) */
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,rx:number,rz:number,wm:number,ink:string,cov:number,seed=7,dashed=false){
 if(cov<=.02)return;const pts:Pt[]=[];let d=1;for(let i=0;i<40;i++){const g:V3=[cx+Math.cos(i/40*TAU)*rx,.03,cz+Math.sin(i/40*TAU)*rz];const dd=depthOf(c,g);if(dd<NEAR+.2)return;pts.push(P(c,g));d=dd;}
 const gaps:[number,number][]=[];if(dashed)for(let x=.03;x<.95;x+=.1)gaps.push([x,x+.05]);
 const w=Math.max(5,c.F*wm/d);s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1,gaps}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1,gaps}),cov);}
/** a screen-space ring round a joint pair (a boot, the feet), 0..1 */
function bootRing(s:Sheet,a:Pt,b:Pt,ink:string,w:number,seed:number){if(w<=.02)return;const r=Math.max(10,Math.hypot(a[0]-b[0],a[1]-b[1])*.6)*w+2,cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2;
 const pts=Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt);
 s.knockout(ribbon(pts,Math.max(5,r*.34),{seed,close:true,taper:0,wobble:.8}),.7*w);s.fill(ink,ribbon(pts,Math.max(3,r*.2),{seed,close:true,taper:0,wobble:.8}),.95*w);}
/** a ring round a figure (head to ankle), 0..1 */
function bodyRing(s:Sheet,hero:DrawResult,ink:string,w:number,seed=143){if(w<=.02)return;const h=hero.joints.head,f=hero.joints.rAn,cy=(h[1]+f[1])/2,ry=Math.max(26,Math.abs(f[1]-h[1])*.7+8);
 const pts=Array.from({length:24},(_,i)=>[h[0]+Math.cos(i/24*TAU)*ry*.62*w,cy+Math.sin(i/24*TAU)*ry*w] as Pt),wd=Math.max(5,ry*.08);
 s.knockout(ribbon(pts,wd*1.9,{close:true,seed,taper:0,wobble:.8}),.75*w);s.fill(ink,ribbon(pts,wd,{close:true,seed,taper:0,wobble:.8}),.95*w);}
/** a ring in the goal plane round the corner the ball goes into */
function cornerRing(s:Sheet,c:Camera,w:number,sz=1,h:V3=HIT){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU,p:V3=[h[0],Math.max(.05,h[1]+Math.sin(a)*.62*w*sz),h[2]+Math.cos(a)*.8*w*sz];if(depthOf(c,p)<NEAR+.2)return;pts.push(P(c,p));}
 const wd=Math.max(5,.1*sz*kAt(c,h)),cv=Math.min(1,w*1.5);s.knockout(ribbon(pts,wd*1.8,{close:true,seed:145,taper:0,wobble:.8}),.7*cv);s.fill(R,ribbon(pts,wd,{close:true,seed:145,taper:0,wobble:.8}),.95*cv);}
function spark(s:Sheet,c:Camera,p:V3,age:number,size:number,seed:number,ink=R){if(age<=-.03||age>=.3)return;const q=P(c,p);sparkBurst(s,ink,q[0],q[1],kAt(c,p)*size,{n:9,seed,g:easeOutBack(clamp((age+.03)/.08)),width:8,cov:1-clamp((age-.15)/.15)});}
/** the lay-off line, Mitoma's boot to where Estupiñán meets it */
const layPath:[number,number][]=[[MS[0],MS[2]],[lerp(MS[0],M[0],.5),lerp(MS[2],M[2],.5)],[M[0],M[2]]];

// ================= chapter 1 (live, near real time): the high main-stand camera; the run from deep, the parry, the lay-off, the finish =================
const tau1=(t:number)=>{const pv=T(0,'Pervis'),rf=T(0,'races forward'),ms=T(0,'March finds'),wb=T(0,'Welbeck'),ps=T(0,'Powerful shot'),sv=T(0,'saved'),mt=T(0,'Mitoma'),lb=T(0,'lays it back'),ll=T(0,'Low left foot'),co=T(0,'corner'),E=SEC(0);
 return key(t,mono([[0,-8.6],[pv,-6.4],[rf+.2,-5.5],[ms+.2,PASS_M],[wb+.2,W_RCV],[ps+.1,W_SHOT],[sv,PARRY+.08],[mt+.1,M_RCV],[lb+.25,LAY],[ll+.25,-.12],[co-.1,IN_NET],[E+1,IN_NET+(E+1-co+.1)*.9]]),linear);};
const CAM1:V3=[-24,21,-58];
function look1(tau:number):V3{const b=ballAt(tau),[ex,ez]=posOf(EST,tau);
 // the ball and his run in one frame; after the goal, onto him
 const w=lerp(.95,.3,sm(PASS_M-.4,PARRY,tau));
 const play:V3=[lerp(b[0],ex,w),1,lerp(b[2],ez,w)];
 return mix3(play,[ex,1,ez],sm(IN_NET+.3,IN_NET+2,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const mo=T(0,'Molineux'),pv=T(0,'Pervis');
 // wide on sunny Molineux and its gold stands first, then down onto the play
 const up=1-sm(mo+.3,pv+.1,t,easeInOutSine);
 const F=key(t,mono([[0,1300],[mo+.3,1400],[pv+.1,4400],[T(0,'March finds'),3300],[T(0,'Welbeck'),3500],[T(0,'saved'),4800],[T(0,'lays it back'),5300],[T(0,'Low left foot'),5600],[T(0,'corner')+.4,5000],[SEC(0),5400]]),easeInOutSine);
 return cam(CAM1,mix3(look,[-40,10,80],up),F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET,lt=T(0,'Seconds'),mo=T(0,'Molineux'),pv=T(0,'Pervis'),rf=T(0,'races forward'),ms=T(0,'March finds'),mt=T(0,'Mitoma'),lb=T(0,'lays it back'),ll=T(0,'Low left foot'),co=T(0,'corner');frame(s);
  stadium(s,c,{t,cheer:.08+.9*sm(0,.5,goalIn),flash:.1+1.2*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "Seconds": a sun glint over the far stand
  if(t<pv+.3){const g=sm(lt-.1,lt+.4,t,easeOutBack)*(1-sm(mo+.6,pv+.2,t));if(g>.02){const q=P(c,[-40,40,110]);sparkBurst(s,Y,q[0],q[1],90*g,{n:12,seed:301,g,width:10,cov:.95});}}
  // "races forward": his run, drawn as he runs it (red); "March finds": the pass, dashed navy
  groundTrail(s,c,runPath(EST,-6.4,SHOT,26),.36,R,{progress:clamp((tau+6.4)/6.4)*sm(rf-.3,rf+.1,t),cov:.95*(1-sm(co+.8,co+1.3,t)),head:true,seed:90});
  groundTrail(s,c,ballPath(PASS_M,W_RCV,8),.22,K,{progress:sm(PASS_M,W_RCV,tau),dashed:true,head:true,cov:.85*(1-sm(mt,mt+.5,t)),seed:89});
  // "lays it back": the lay-off into his path, dashed red
  groundTrail(s,c,layPath,.22,R,{progress:sm(LAY-.05,SHOT,tau),dashed:true,head:true,cov:.9*(1-sm(co,co+.5,t)),seed:92});
  const w=drawWorld(s,c,tau,tp,{ballMin:10,trail:1});
  const hero=w.res.get(EST);if(hero)bodyRing(s,hero,R,sm(pv-.15,pv+.25,t,easeOutBack)*(1-sm(rf+.6,ms,t)));
  const mit=w.res.get(MT);if(mit)bodyRing(s,mit,K,sm(mt-.15,mt+.25,t,easeOutBack)*(1-sm(lb+.3,lb+.7,t)),151);
  // "saved": the parry bursts off the keeper's gloves; "Low left foot": his left boot lit at the strike
  spark(s,c,PP,tau-PARRY,1.3,97,Y);
  if(hero)bootRing(s,hero.joints.lToe,hero.joints.lAn,R,sm(ll-.1,ll+.25,t,easeOutBack)*(1-sm(co-.2,co+.2,t)),153);
  spark(s,c,M,tau-SHOT,1.5,99);
  // "corner": the corner lights up as it goes in
  cornerRing(s,c,sm(co-.3,co+.1,t,easeOutBack)*(1-sm(co+1.2,co+1.6,t)),2.2);},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:12,
};

// ================= chapter 2 (TV replay, slow motion, a low rail camera beside his run): no one follows; into his path; 4–1 =================
const tau2=(t:number)=>{const E=SEC(1),hp=T(1,'his path'),bw=T(1,'Brighton won');
 return key(t,mono([[0,-4.6],[hp+.35,SHOT],[bw+.2,IN_NET+.05],[E,IN_NET+.05+(E-bw-.2)*.6]]),linear);};
function cam2(t:number){const tau=tau2(t),[x0,z0]=posOf(EST,Math.min(tau,.6)),g=sm(-1.2,.3,tau,easeInOutSine),a=sm(IN_NET,IN_NET+1.6,tau,easeInOutSine);
 // "no one follows": the rail glances back a little toward the man who should be tracking him
 const no=T(1,'no one follows'),nf=sm(no-.6,no,t,easeInOutSine)*(1-sm(no+1.2,no+1.9,t,easeInOutSine)),x=x0,z=z0;
 // level with him, low, on the near (left) touchline side; it swings round behind him for the lay-off and the finish
 const pos=mix3([x-1,1.9,z-14],[x-7.5,2.3,z-7.5],g);
 const look=mix3(mix3([x-1.5-2.5*nf,1,z+1.5],[lerp(x,HIT[0],.45),.9,lerp(z,HIT[2],.45)],g),[x+1,1.3,z],a);
 return cam(pos,look,lerp(1,.85,nf)*key(t,mono([[0,1900],[T(1,'no one follows'),1700],[T(1,'Mitoma'),1700],[T(1,'his path'),1600],[T(1,'Brighton won'),1500],[SEC(1),1800]]),easeInOutSine));}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),goalIn=tau-IN_NET,E=SEC(1),sp=T(1,'sprints'),no=T(1,'no one follows'),mt=T(1,'Mitoma'),cl=T(1,'cleverly'),hp=T(1,'his path'),bw=T(1,'Brighton won'),ft=T(1,'four to one');frame(s);
  const fade=1-sm(E-.5,E-.15,t);
  stadium(s,c,{t,cheer:.1+.9*sm(0,.5,goalIn),flash:.1+sm(0,.4,goalIn),which:[3,1,2]});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "sprints": his run from deep (red); "no one follows": a dashed navy ring under the man who should track him, and the empty gap
  groundTrail(s,c,runPath(EST,-4.6,SHOT,20),.34,R,{progress:clamp((tau+4.6)/4.6)*sm(sp-.2,sp+.2,t),cov:.95*(1-sm(bw,bw+.5,t)),seed:111});
  const nw=sm(no-.1,no+.3,t,easeOutBack)*(1-sm(cl,cl+.5,t));
  if(nw>.02){const[mx,mz]=posOf(MAT,tau),[ex,ez]=posOf(EST,tau);groundRing(s,c,mx,mz,1,1,.12,K,.95*nw,113,true);groundTrail(s,c,[[mx+1,mz],[lerp(mx,ex,.5),lerp(mz,ez,.5)],[ex-1.2,ez]],.1,K,{progress:nw,dashed:true,head:false,cov:.85*nw,seed:114});}
  // "cleverly": the lay-off, dashed red; "his path": a ring on the grass where the ball meets his stride
  groundTrail(s,c,layPath,.2,R,{progress:sm(cl-.1,cl+.9,t),dashed:true,head:true,cov:.95*(1-sm(bw-.3,bw+.2,t)),seed:115});
  groundRing(s,c,M[0],M[2],.7,.7,.1,R,.95*sm(hp-.1,hp+.25,t,easeOutBack)*(1-sm(hp+.8,hp+1.2,t)),117);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,trail:1});
  const hero=w.res.get(EST),mit=w.res.get(MT);
  if(mit)bodyRing(s,mit,K,sm(mt-.15,mt+.25,t,easeOutBack)*(1-sm(cl+.4,cl+.8,t)),119);
  spark(s,c,M,tau-SHOT,1.3,121);
  if(hero){const h=hero.joints.head,sz=Math.max(12,Math.abs(hero.joints.rAn[1]-h[1])*.12);
   bodyRing(s,hero,R,sm(bw-.15,bw+.3,t,easeOutBack)*(1-sm(ft,ft+.4,t)),127);
   // "four to one": four balls pop up over him, then one smaller, apart
   for(let i=0;i<5;i++){const g=sm(ft+.1+i*.22,ft+.35+i*.22,t,easeOutBack)*fade;if(g<=.02)continue;const one=i===4;ball(s,h[0]+(i-2)*sz*2.5+(one?sz*1.2:0),h[1]-sz*3.4-sz*.4*Math.sin(tt*6+i),sz*g*(one?.7:1),i*1.3);}}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:129,len:900,spread:520,width:22,cov:.5*(1-t/.45)});},
 aperture(t){const c=cam2(t),tau=tau2(t),[x,z]=posOf(EST,tau),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4,
};

// ================= chapter 3 ("How he does it": a training-pitch DEMONSTRATION, not the match): the overlap and cross =================
// its own little simulation on σ (seconds, σ = 0 the winger's pass): the full-back FB waits behind the winger W, who carries the ball at the
// defender D; FB bursts round W's outside; W draws D inside and passes into FB's stride just as he arrives (σ = 0); FB crosses with his
// left foot (σ = CROSS) for the striker ST, who heads it in. Attack toward x = 0 (screen-left), the left touchline (z = −34) is near.
const DKEYS:TK[][]=[
 /* FB */[[-5,-47,-29],[-4,-45.4,-29.3],[-3,-43.6,-29.6],[-2,-41.6,-30],[-1.3,-39,-30.8],[-.6,-35.4,-31.6],[0,-31.6,-32],[.6,-27.6,-32.1],[1.2,-23.8,-31.8],[1.9,-20.4,-31.2],[2.6,-18.2,-30.3],[3.6,-16.6,-29],[5,-15.6,-28]],
 /* W */[[-5,-39,-28],[-3.5,-36.6,-27.8],[-2,-34.2,-27.2],[-1,-32.4,-26.2],[-.4,-31.2,-25.3],[0,-30.6,-24.7],[.6,-29.8,-24],[1.6,-28.8,-23.2],[3,-27.6,-22.4],[5,-26.4,-21.6]],
 /* D */[[-5,-25,-27.4],[-3.5,-26.8,-27.2],[-2,-28.4,-26.9],[-1,-29.2,-26.2],[-.4,-29.4,-25.6],[0,-29.4,-25.1],[.6,-29.2,-25.6],[1.4,-28,-27.4],[2.4,-25.6,-28.8],[5,-21,-29.2]],
 /* ST */[[-5,-18,-8],[-2,-16,-8],[0,-14.4,-8.4],[1.9,-12.2,-7.4],[2.8,-9.6,-5.8],[3.4,-8.2,-5],[5,-7.6,-4.6]],
];
const FB=0,DW=1,DD=2,ST=3;
const DSIM=makeSim(DKEYS,-5.2,5.2);
const D_PASS=0,D_RCV=.95,CROSS=1.9,HEAD=3.05,D_GOAL=3.5;
const HEAD_AT:V3=(()=>{const[x,z]=DSIM.pos(ST,HEAD);return[x+.2,2.05,z+.1];})();
const GOAL2:V3=[0,1.3,-1.6];
function dFbPose(s:number):Pose{const sp=DSIM.speed(FB,s),k=clamp((sp-2.4)/3.6),d=DSIM.dist(FB,s);
 let p=blendPose(stand(),runCycle(d/(2.3+2*k),{speed:.2+.8*k}),clamp((sp-.3)/.8));
 return kickAt(p,s,CROSS,.75,'l',.85);}
const dFbToe=(s:number):V3=>{const[x,z]=DSIM.pos(FB,s),y=yawOf(FB,s),sk=solve(dFbPose(s),TRAIN_FB.build,{x,z,yaw:y});return[sk.lToe[0]+Math.cos(y)*.1,.11,sk.lToe[2]-Math.sin(y)*.1];};
function yawOf(k:number,s:number){const v=DSIM.vel(k,s);if(Math.hypot(v[0],v[1])>.4)return YAW(v[0],v[1]);return k===DD?Math.PI:0;}
const CR0=dFbToe(CROSS),PASS_FROM=DSIM.boot(DW,D_PASS,.45),PASS_TO=DSIM.boot(FB,D_RCV,.5);
function demoBall(s:number):V3{
 if(s<D_PASS)return DSIM.boot(DW,s,.5+.12*Math.sin(s*7));
 if(s<D_RCV)return roll(PASS_FROM,PASS_TO,(s-D_PASS)/(D_RCV-D_PASS));
 if(s<CROSS){const u=(s-D_RCV)/(CROSS-D_RCV);return mix3(DSIM.boot(FB,s,.6),CR0,sm(.5,1,u));}
 if(s<HEAD){const u=(s-CROSS)/(HEAD-CROSS),q=mix3(CR0,HEAD_AT,u);return[q[0],lerp(CR0[1],HEAD_AT[1],u)+4.2*Math.sin(Math.PI*u),q[2]];}
 if(s<D_GOAL)return mix3(HEAD_AT,GOAL2,(s-HEAD)/(D_GOAL-HEAD));
 const u=clamp((s-D_GOAL)/.6);return[lerp(GOAL2[0],1.4,easeOut(u)),lerp(GOAL2[1],.11,u),lerp(GOAL2[2],-1.2,u)];}
function demoPose(k:number,s:number):{p:Pose;yaw:number}{
 if(k===FB)return{p:dFbPose(s),yaw:s>CROSS-.5&&s<CROSS+.4?lerpAng(yawOf(FB,s),YAW(HEAD_AT[0]-DSIM.pos(FB,s)[0],HEAD_AT[2]-DSIM.pos(FB,s)[1]),.6):yawOf(FB,s)};
 const b=demoBall(s),[x,z]=DSIM.pos(k,s);let yaw=yawOf(k,s);
 if(k===DD){yaw=s<1.2?YAW(b[0]-x,b[2]-z):yaw;return{p:gait(DSIM,k,s,yaw,READY),yaw};}
 let p=gait(DSIM,k,s,yaw,stand());
 if(k===DW){if(s>-.6&&s<.4)yaw=lerpAng(yaw,YAW(PASS_TO[0]-x,PASS_TO[2]-z),sm(-.6,-.2,s));p=kickAt(p,s,D_PASS,.45,'l',.75);}
 if(k===ST){if(s>CROSS)yaw=YAW(CR0[0]-x,CR0[2]-z);const u=(s-(HEAD-.52*.9))/.9;if(u>-.1&&u<1.3)p=blendPose(p,header(clamp(u)),Math.min(sm(-.1,.1,u),1-sm(1,1.3,u)));
  if(s>D_GOAL+.3)p=blendPose(p,celebrate((s-D_GOAL)*1.1,{kind:'arms'}),sm(D_GOAL+.3,D_GOAL+.8,s));}
 return{p,yaw};}
const tau3=(t:number)=>{const E=SEC(2),hd=T(2,'How does'),wb=T(2,'waits behind'),br=T(2,'bursts round'),bc=T(2,'Pass'),cr=T(2,'cross'),to=T(2,'Time your overlap');
 return key(t,mono([[0,-5],[hd,-4.8],[wb,-3.6],[br,-1.45],[bc+.1,D_PASS+.1],[cr+.15,CROSS],[to,HEAD+.25],[E,D_GOAL+2.2]]),linear);};
function look3(s:number):V3{const q=clamp(s,-5,5),[fx,fz]=DSIM.pos(FB,q),[wx,wz]=DSIM.pos(DW,q),b=demoBall(q),u=sm(CROSS+.2,HEAD+.2,q,easeInOutSine);
 const ww=.5-.35*sm(D_PASS,D_RCV,q),duo:V3=[lerp(fx,wx,ww)+1.5,.8,lerp(fz,wz,ww)],[ax,az]=DSIM.pos(FB,D_RCV),[px,pz]=DSIM.pos(DW,D_PASS);
 return mix3(mix3(duo,[b[0],.9,b[2]],u),[(ax+px)/2,.6,(az+pz)/2],sm(D_GOAL-.1,D_GOAL+.4,q,easeInOutSine));}
function cam3(t:number){const s=tau3(t),a=look3(s),b=look3(s-.4),look:V3=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
 return cam([look[0]-9,6.5,look[2]-17],look,key(t,mono([[0,2300],[T(2,'waits behind'),2500],[T(2,'bursts round'),2300],[T(2,'Pass'),2400],[T(2,'cross'),2600],[T(2,'Time your overlap'),2400],[SEC(2),2200]]),easeInOutSine));}
const ch3:Scene={
 draw(s,t){const c=cam3(t),sg=tau3(t),sp=tau3(twos(t)),E=SEC(2),hd=T(2,'How does'),wb=T(2,'waits behind'),br=T(2,'bursts round'),bc=T(2,'Pass'),cr=T(2,'cross'),to=T(2,'Time your overlap'),ar=T(2,'arrive'),rp=T(2,'ready to pass');frame(s);
  trainingGround(s,c);
  ground(s,c,{boards:false,net:sg>D_GOAL?netRipple(sg-D_GOAL,[2,1.3,-1.6]):undefined});
  const fade=1-sm(E-.5,E-.15,t);
  // "waits behind": a dashed yellow ring under him, behind the winger; "bursts round": his overlap route round the outside (red)
  {const[x,z]=DSIM.pos(FB,Math.min(sg,-1.4));groundRing(s,c,x,z,.9,.9,.12,Y,.95*sm(wb-.1,wb+.3,t,easeOutBack)*(1-sm(br,br+.4,t)),161,true);}
  const route:[number,number][]=Array.from({length:17},(_,i)=>DSIM.pos(FB,-1.45+i*(CROSS+1.45)/16));
  groundTrail(s,c,route,.3,R,{progress:sm(br-.2,br+1.6,t,easeOut),cov:.95*fade,seed:163});
  // "Pass": the winger's pass into his stride (dashed navy); "cross": the cross in the air (dashed red)
  groundTrail(s,c,[[PASS_FROM[0],PASS_FROM[2]],[lerp(PASS_FROM[0],PASS_TO[0],.5),lerp(PASS_FROM[2],PASS_TO[2],.5)],[PASS_TO[0],PASS_TO[2]]],.2,K,{progress:sm(D_PASS-.05,D_RCV,sg),dashed:true,cov:.9*fade,seed:165});
  airTrail(s,c,Array.from({length:17},(_,i)=>demoBall(CROSS+(HEAD-CROSS)*i/16)),.1,R,{progress:sm(CROSS,HEAD,sg),cov:.9*fade*(1-sm(to+1,to+1.5,t)),seed:167});
  // "Time your overlap … arrive … ready to pass": his spot and the winger's spot at the SAME moment (the pass), joined in yellow
  const[ax,az]=DSIM.pos(FB,D_RCV),[wx,wz]=DSIM.pos(DW,D_PASS),lk=sm(to-.1,to+.4,t)*fade;
  if(lk>.02)groundTrail(s,c,[[wx,wz],[lerp(wx,ax,.5),lerp(wz,az,.5)],[ax,az]],.12,Y,{progress:lk,dashed:true,head:false,cov:.95*lk,seed:169});
  groundRing(s,c,ax,az,1.1,1.1,.16,Y,.95*sm(ar-.1,ar+.3,t,easeOutBack)*fade,171);
  groundRing(s,c,wx,wz,1.1,1.1,.16,Y,.95*sm(rp-.1,rp+.3,t,easeOutBack)*fade,173);
  const items:Item[]=[],res=new Map<number,DrawResult>(),st=[TRAIN_FB,TRAIN_W,TRAIN_D,TRAIN_ST],b=demoBall(sg);
  for(let k=0;k<4;k++){const[x,z]=DSIM.pos(k,sg),A=demoPose(k,sp),Ap=demoPose(k,sp-1/12),[px,pz]=DSIM.pos(k,sg-1/12),d=depthOf(c,[x,0,z]);if(d<2)continue;
   items.push({depth:d,draw:()=>{res.set(k,drawPlayer(s,A.p,c,st[k],{x,z,yaw:A.yaw},{prev:{pose:Ap.p,place:{x:px,z:pz,yaw:Ap.yaw}},smear:k===FB&&DSIM.speed(FB,sg)>4.5}));}});}
  items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const q=P(c,b),r=Math.max(7,BALL_R*kAt(c,b));ballShadow(s,c,b);ball(s,q[0],q[1],r,sg*9);}});
  items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());
  // "How does": a ring round the full-back
  const fb=res.get(FB);if(fb)bodyRing(s,fb,R,sm(hd-.1,hd+.3,t,easeOutBack)*(1-sm(wb,wb+.4,t)),175);
  if(fb&&sg>-1.5&&sg<CROSS){const[x,z]=DSIM.pos(FB,sg),v=DSIM.vel(FB,sg),hip=P(c,[x,1,z]),bk=P(c,[x-v[0]*.2,1,z-v[1]*.2]),kk=kAt(c,[x,1,z]);
   speedLines(s,K,hip[0],hip[1],Math.atan2(hip[1]-bk[1],hip[0]-bk[0]),{n:6,seed:177,len:kk*1.6,spread:kk*.5,width:Math.max(3,kk*.05),cov:.8*sm(br-.1,br+.3,t)*(1-sm(cr,cr+.4,t))});}
  if(fb)bootRing(s,fb.joints.lToe,fb.joints.lAn,R,sm(cr-.1,cr+.25,t,easeOutBack)*(1-sm(to-.2,to+.2,t)),179);
  spark(s,c,CR0,sg-CROSS,1.1,181);spark(s,c,HEAD_AT,sg-HEAD,1.1,183);void bc;},
 aperture(t){const c=cam3(t),b=demoBall(tau3(t)),[x,y]=P(c,b),r=Math.max(9,BALL_R*kAt(c,b));return apertureDisc(x,y,r*1.1,12);},
 still:4,
};

const story:RisoStory={
 id:'estupinan-signature',format:'11v11',title:'Estupiñán: right on time, 2023',
 theme:'The overlap and cross: time your run so you arrive just as your winger is ready to pass.',
 ageNote:'Premier League, Wolves 1–4 Brighton, Molineux, Wolverhampton, 19 August 2023 (46 minutes). Brighton\'s left-back Pervis Estupiñán ran from deep and scored from Kaoru Mitoma\'s lay-off. He was 25.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: a sunny sparkle and the white ball hops up from the point. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*150,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(R,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);s.knockout(polyPath([[x+Math.cos(a)*30,y-up-70*fl],[x+14,y-up],[x,y-up+70*fl],[x-14,y-up]],true));sparkBurst(s,Y,x,y-up,140*g,{n:9,seed,g:fl,width:12});}
  ball(s,x,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
