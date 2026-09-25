/** Iconic-play film (signature): "the studied dribble". Kaoru Mitoma's solo goal: Wolverhampton Wanderers 1–4 Brighton & Hove Albion,
 * Premier League (matchday 2), Molineux, Wolverhampton, Saturday 19 August 2023 (15:00 BST). The goal came after 15 minutes and made it 0–1;
 * it was the Premier League Goal of the Month for August 2023, the first monthly Premier League award ever won by a Japanese player.
 * WHY THIS MOMENT: lib/town/iconicPlays.json gives Mitoma a signature, not a match ("Signature: the studied dribble", solo_dribble_goal,
 * left side, beaten 2, right foot; lesson "Watch the defender's hips, not their feet, to know when to go past"). Wikipedia says he is "best
 * known for his dribbling ability" and "wrote his university thesis on dribbling" (University of Tsukuba). This is his best-documented
 * DRIBBLING goal: the Guardian describes the play itself ("a memorable solo effort"; "Mitoma finished his finest run with a brilliant solo
 * goal, cruising past three defenders before opening his body to score"), so the run past three defenders and the open-body finish are
 * staged inside the real match. (The 2022 World Cup "millimetres" cross v Spain is better known, but it is a cross, not a dribble; the
 * FA Cup winner v Liverpool (29 Jan 2023) is a volley, not a run.) The card says "beaten 2"; the written report says three, so three are drawn.
 * HOW HE READS THE DEFENDER (the hips) is NOT described for this goal by any source read, so the match chapters never show or narrate it:
 * the lesson is a separate, clearly labelled "How he does it" DEMONSTRATION on a training pitch in training tops (chapter 4).
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/mitoma-signature/script.json. The voice is generated later by the lead (local Kokoro). Until then
 * every chapter runs on provisional cue times (≈2.6 words/s, see prov()); every action time is read from cue onsets and chapter seconds,
 * so once timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/mitoma-signature/timing.json exists, replace `null` in `const VOICE` below with the timing
 *   import timingJson from '../../../public/plays/narration/mitoma-signature/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026 with curl, generic UA; cached under the session scratchpad films/src-cache/; written accounts + one agency photo
 * from the Guardian report; the video footage was not reviewed):
 *  - The Guardian, Peter Lansley at Molineux, "Brighton thrash sorry Wolves with second-half blitz led by Solly March", 19 Aug 2023:
 *    "a memorable solo effort from Kaoru Mitoma"; "Mitoma finished his finest run with a brilliant solo goal, cruising past three defenders
 *    before opening his body to score"; "Wolves responded to Mitoma's opener"; the 4-1 and the second-half goals (Estupiñán from Mitoma's
 *    pullback, March twice). https://www.theguardian.com/football/2023/aug/19/wolves-brighton-premier-league-match-report
 *    (cache: guardian-wol-bha-2023.txt). Its photo (Clive Mason/Getty) of March's goal the same afternoon shows the KITS and the weather
 *    (cache: mitoma-wol-march.jpg).
 *  - Wikipedia, "2023–24 Brighton & Hove Albion F.C. season" (raw): Wolves 1–4 Brighton, 19 August 2023, 15:00 BST, Mitoma 15'.
 *    (cache: wiki-2023-24-brighton-season.txt)
 *  - Wikipedia, "Kaoru Mitoma" (raw): "sensational solo goal" in the 4–1 away win at Wolves, 19 Aug 2023; Goal of the Month for August,
 *    "the first ever Japanese player to win a Premier League monthly award"; BBC Goal of the Month August 2023; left winger; club number 22;
 *    University of Tsukuba, "He wrote his university thesis on dribbling". (cache: wiki-kaoru-mitoma-clean.txt)
 *  - lib/town/playerAppearance.json (Japan; skin 1, short black hair) and lib/town/playerCareers.json (Brighton & Hove Albion 2021–).
 * CONFIRMED by those accounts: the match, date, ground, the 15th minute, the score (Wolves 1–4 Brighton, Mitoma's goal the opener); a SOLO
 *  run past THREE defenders; he OPENED HIS BODY to score; Goal of the Month. KITS (the photo, same match): Brighton in their HOME blue-and-
 *  white striped shirts, blue shorts, blue socks; a white ball with orange and dark graphics; a bright, SUNNY afternoon; gold seats behind
 *  the goal. Mitoma's number 22.
 * INFERRED / ILLUSTRATIVE: every position, run and speed in metres and seconds; where the run started (drawn: picked up on the LEFT, his usual
 *  wing and the card's side, after a short pass from a team-mate); which way each defender was beaten (drawn: inside, outside, inside);
 *  who the three defenders were (unnamed, no numbers); the RIGHT-foot finish (the card, and "opening his body" from the left side) low into
 *  the FAR corner (drawn: the post nearer the main-stand camera); which way Brighton attacked (drawn left → right on screen); Wolves in their
 *  home old-gold shirts, black shorts, gold socks (they were at home; not in the photo); the keeper's kit colour (drawn grey), the referee's
 *  black; every other player's spot; the celebration. Wolves' keeper is not named.
 *  Chapter 4 (reading the hips) is a DEMONSTRATION on a training pitch, not match footage.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock
 * τ (seconds, τ = 0 the shot): ch1 = the high main-stand broadcast camera, near real time (sunny Molineux, the pick-up, the run past three
 * defenders, the open-body finish); ch2 = the TV slow-motion replay, low behind him (the small touches, the ball glued to his feet);
 * ch3 = the reverse angle from behind the net (the ball in, the celebration, 4–1, Goal of the Month); ch4 = "How he does it", a training
 * demonstration: feet can trick you, the hips cannot; when the defender's hips turn, go past the other way.
 * Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Inks: yellow (grass with blue, Wolves' gold, the seats, the hips
 * bar), red (Mitoma's route marks, skin, the ball's orange), blue (grass, Brighton's blue), navy (key line, black shorts, roofs, beaten rings).
 * Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,runCycle,dribble,stand,strike,backpedal,lunge,celebrate,keeperSet,keeperDive,solve,
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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`mitoma film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/mitoma-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Past three','A sunny day at Molineux. Mitoma picks up the ball and runs at the defence. Past one, past two, past three! He opens his body and scores!',
  ['sunny day','Molineux','Mitoma','picks up','runs at','Past one','past two','past three','opens his body','scores']),
 prov('Glued to his feet','Watch again, slowly. Small touches keep the ball glued to his feet.',
  ['Watch again','slowly','Small touches','glued','his feet']),
 prov('Goal of the Month','Brighton won four to one. Later, it was named Goal of the Month!',
  ['Brighton won','four to one','Later','Goal of the Month']),
 prov('How he does it','How does he do it? Mitoma wrote a university project on dribbling. Feet can trick you. Watch the defender\'s hips, not their feet, to know when to go past!',
  ['How does','university project','Feet can trick','Watch the defender','not their feet','know when','go past']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`mitoma film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; Wolves' goal is at x = 0, the pitch runs to
// x = −105; the main-stand camera sits at +z, so Brighton attack left → right on screen; Brighton's LEFT wing is the far side, −z) =================
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

// ================= Molineux on a sunny August afternoon: four separate rectangular stands, old-gold seats, dark roofs =================
/** stand planes (a along, b up the rake 0..1): 0 the far side (−z, two tiers with a box band), 1 behind Wolves' goal (+x), 2 the other end
 * (−x), 3 the near side (+z, behind the main camera: drawn only by the reverse angle). Corners open. */
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
 const{t,cheer=0,flash=0,which=[0,1,2]}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt)=>Math.abs(p[0])<Bnd&&Math.abs(p[1])<Bnd;
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
 // the crowd: gold shirts, black, white summer shirts, orange; Brighton's blue-and-white in one far corner; they bob when they cheer
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of SEATS){if(!which.includes(q.si))continue;const d=depthOf(c,q.P);if(d<14)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),away=q.si===0&&q.a<.13,lift=cheer>0&&!away?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
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
/** the lesson's training pitch (no stands, no crowd): open summer sky, a tree line behind the goal and down one side */
function trainingGround(s:Sheet,c:Camera){
 s.field(B,.1,.5);
 const Bnd=Math.max(s.W,s.H)*1.5,hz=P(c,[c.eye[0]+c.f[0]*1e4,c.eye[1],c.eye[2]+c.f[2]*1e4])[1];
 s.tone(B,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-460],[-Bnd,hz-420]],true),.2);
 const trees=new Path2D(),row=(a:[number,number],b:[number,number],n:number,seed:number)=>{const top:V3[]=[],base:V3[]=[];for(let i=0;i<=n;i++){const u=i/n,x=lerp(a[0],b[0],u),z=lerp(a[1],b[1],u),h=8+5*hash(i,seed)+2*Math.sin(i*1.7+seed);top.push([x,h,z]);base.push([x,0,z]);}
  addPoly(trees,clipPoly(c,[...base,...top.reverse()]));};
 row([30,-70],[30,70],28,3);row([-120,-48],[30,-48],30,5);row([-120,48],[30,48],30,7);
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
/** Mitoma: No. 22, 1.78 m, slim, short black hair; the finish drawn with the right foot (inferred) */
const MITOMA:AthleteStyle=BHA({number:22,skin:SKIN_E,hair:[K,.95],hairStyle:'short',build:{height:1.78,bulk:.92,thighs:1.02},seed:22});
const KEEP:AthleteStyle={shirt:[K,.5],shorts:[K,.5],socks:[K,.5],boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,sleeves:'long',gloves:'paper',shade:[K,.3],number:null,build:{height:1.92},seed:1};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'balding',line:K,sleeves:'short',seed:33};
/** the "how he does it" demonstration (not the match): an attacker in a blue training top, a defender in a red training top */
const TRAIN:AthleteStyle={shirt:[B,.9],shorts:K,socks:'paper',boots:K,trim:'paper',skin:SKIN_E,hair:[K,.95],hairStyle:'short',line:K,shade:[K,.3],number:null,build:{height:1.78,bulk:.92},seed:22};
const TRAIN_D:AthleteStyle={shirt:[R,.9],shorts:K,socks:[R,.9],boots:K,trim:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.3],number:null,build:{height:1.84},seed:61};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the shot) =================
type TK=[number,number,number];// τ, x, z
type Role='mt'|'bha'|'wol'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean;beat?:number;side?:'l'|'r'};
/** the beats: the team-mate's pass, the pick-up, the three defenders beaten, the shot */
const PASS0=-7.75,RCV=-7.05,BEATS=[-4.3,-2.8,-1.5],SHOT=0;
/** Positions are Hermite-interpolated between keys (all illustrative, see INFERRED). Brighton attack toward x = 0. */
const ACTORS:Actor[]=[
 // Mitoma: jogs to the pass on the left, then carries it in on a diagonal (≈4.3 m/s): inside past the first, outside past the second,
 // inside past the third onto his right foot, slows, opens his body and shoots
 {name:'Mitoma',role:'mt',style:MITOMA,key:true,keys:[[-9.5,-43.6,-22.9],[-8.6,-42,-22.6],[-7.8,-40.4,-22.3],[-7,-38.4,-21.9],[-6.2,-35.4,-21],[-5.4,-32.4,-19.5],[-4.8,-30.4,-18.3],[-4.4,-29.1,-17.2],[-4,-27.5,-15.9],[-3.6,-25.9,-15.2],[-3.2,-24.3,-15.1],[-2.8,-22.7,-15.4],[-2.4,-21,-15.1],[-2,-19.4,-14.4],[-1.6,-17.9,-13.6],[-1.2,-16.6,-12.3],[-.8,-15.6,-11],[-.4,-14.8,-9.7],[0,-14.3,-8.8],[.5,-13.7,-8.1],[1.2,-12.8,-7],[2.5,-11.6,-5.2],[4,-10.8,-3.6],[6,-10.4,-2.6]]},
 {name:'Keeper',role:'gk',style:KEEP,key:true,keys:[[-9.5,-1.6,-.6],[-4,-1.9,-1.6],[-1,-2.2,-2.3],[SHOT,-2.2,-2.3],[6,-2.2,-2.3]]},
 // the three defenders: each steps in, jockeys, jabs for the ball as he goes past, then turns and chases
 {name:'Defender 1',role:'wol',style:WOL({seed:201,skin:SKIN_M}),key:true,beat:BEATS[0],side:'r',keys:[[-9.5,-30.5,-19.8],[-7,-28.9,-18.9],[-5.4,-27.8,-18.3],[-4.6,-27.9,-18.1],[-4.2,-28.1,-18.2],[-3.6,-28.4,-18.5],[-2.8,-27.4,-17.6],[-1,-22.8,-14.6],[1,-19.6,-12.6],[6,-18.4,-11.8]]},
 {name:'Defender 2',role:'wol',style:WOL({seed:202,skin:SKIN_D,build:{height:1.8}}),key:true,beat:BEATS[1],side:'l',keys:[[-9.5,-18,-8],[-6,-20.4,-11],[-4,-21.8,-12.9],[-3.2,-22.2,-13.7],[-2.8,-22.4,-14],[-2.2,-22.7,-14.1],[-1.4,-21.6,-13.3],[0,-18.6,-11.2],[2,-16.4,-9.8],[6,-15.8,-9.4]]},
 {name:'Defender 3',role:'wol',style:WOL({seed:203,build:{height:1.9}}),key:true,beat:BEATS[2],side:'r',keys:[[-9.5,-11,-12],[-5,-13.4,-13.2],[-3,-15.3,-14.3],[-2,-16.3,-14.7],[-1.5,-16.8,-14.6],[-1,-17.1,-14.3],[-.4,-16.5,-13.1],[.4,-15.5,-11.6],[2,-14.6,-10.6],[6,-14.2,-10.2]]},
 {name:'Wolves CB',role:'wol',style:WOL({seed:204,build:{height:1.88}}),keys:[[-9.5,-9.6,-1.5],[-3,-9.2,-3],[0,-9,-4.2],[2,-8.6,-4.8],[6,-7,-6.4]]},
 {name:'Wolves LB',role:'wol',style:WOL({seed:205,skin:SKIN_D}),keys:[[-9.5,-17,13],[-3,-12.5,8.4],[0,-10.8,6.6],[6,-11,5]]},
 {name:'Wolves CM',role:'wol',style:WOL({seed:206}),keys:[[-9.5,-30,-6],[-3,-25,-8],[0,-21.5,-7.4],[6,-17,-5]]},
 {name:'Wolves CM2',role:'wol',style:WOL({seed:207,skin:SKIN_M}),keys:[[-9.5,-36,5],[-3,-30,1],[0,-26.5,-1.5],[6,-21,-1]]},
 {name:'Wolves FW',role:'wol',style:WOL({seed:208,skin:SKIN_E}),keys:[[-9.5,-46,-12],[-3,-40,-13],[0,-35,-12],[6,-30,-10]]},
 {name:'Wolves W',role:'wol',style:WOL({seed:209,skin:SKIN_M}),keys:[[-9.5,-47,10],[0,-40,6],[6,-35,4]]},
 // Brighton team-mates: the passer, the striker in the middle, the far winger, a midfielder, the overlapping full-back
 {name:'Passer',role:'bha',style:BHA({seed:301,skin:SKIN_M}),key:true,keys:[[-9.5,-51,-15.5],[-8.4,-49.5,-15.2],[PASS0,-48.8,-15],[-6,-47,-13.6],[0,-40,-10],[6,-34,-8]]},
 {name:'Striker',role:'bha',style:BHA({seed:302,skin:SKIN_D,build:{height:1.87}}),keys:[[-9.5,-18,-1.5],[-3,-12,.2],[0,-9.2,.8],[2,-9.8,1.4],[6,-11.5,-.5]]},
 {name:'Winger',role:'bha',style:BHA({seed:303}),keys:[[-9.5,-27,15],[-3,-19,11],[0,-15.4,8.6],[6,-13,4]]},
 {name:'Midfielder',role:'bha',style:BHA({seed:304,skin:SKIN_M}),keys:[[-9.5,-39,-3],[-3,-32,-5],[0,-28,-5],[6,-22,-4]]},
 {name:'Full-back',role:'bha',style:BHA({seed:305,skin:SKIN_M}),keys:[[-9.5,-55,-25],[-3,-44,-25],[0,-37,-24],[6,-30,-20]]},
 {name:'Referee',role:'ref',style:REF,keys:[[-9.5,-38,5],[-3,-31,4],[0,-26,3],[6,-21,2]]},
];
const MT=0,GKI=1,D1=2,D2=3,D3=4,PAS=11,STK=12;
const DEF=[D1,D2,D3];
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position, distance run (the gait phase) and, for Mitoma, the touch phase (a touch every ~1.4 m) */
const TA=-9.5,TB=6,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[],H:number[]=[];let d=0,h=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i){const dd=Math.hypot(x-px,z-pz);d+=dd;h+=dd/1.4;}X.push(x);Z.push(z);D.push(d);H.push(h);px=x;pz=z;}return{X,Z,D,H};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};
const speedOf=(k:number,tau:number)=>{const v=velOf(k,tau);return Math.hypot(v[0],v[1]);};
/** a ball spot just ahead of a (non-hero) player's boot, along his run */
function bootOf(k:number,tau:number,ahead=.5):V3{const[x,z]=posOf(k,tau),v=velOf(k,tau),l=Math.hypot(v[0],v[1]);const dx=l>.3?v[0]/l:1,dz=l>.3?v[1]/l:0;return[x+dx*ahead-dz*.1,.11,z+dz*ahead+dx*.1];}

// ---- Mitoma: the jog to the pass, the carry with small touches, three changes of direction, the open-body finish, the celebration ----
const HIT:V3=[0,.3,2.9];// low in the far corner (inferred: the post nearer the main-stand camera)
const AIM:[number,number]=[0,3.3];
/** the three changes of direction: +1 = cut to his right (inside, +z), −1 = to his left (outside) */
const CUTS:[number,number][]=[[BEATS[0],1],[BEATS[1],-1],[BEATS[2],1]];
/** over(): blend channel overrides (degrees) into a pose */
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
function yawMt(tau:number){const v=velOf(MT,tau),run=Math.hypot(v[0],v[1])>.4?YAW(v[0],v[1]):0,[x,z]=posOf(MT,tau);
 const aimY=YAW(AIM[0]-x,AIM[1]-z);
 return lerpAng(run,aimY,sm(SHOT-.45,SHOT-.15,tau)*(1-sm(SHOT+.7,SHOT+1.3,tau)));}
const SD=.85,S_ST=SHOT-STRIKE_CONTACT*SD;
function mtPose(tau:number):Pose{
 const sp=speedOf(MT,tau),s=clamp((sp-3)/3),d=distOf(MT,tau);
 // the carry: low, head over the ball, short quick strides (dribble), opening into a run only when he pushes it further
 let p=blendPose(dribble(d/1.4,{foot:'r',speed:.55}),runCycle(d/(2.3+1.6*s),{speed:.3+.5*s}),.25+.4*s);
 if(tau<RCV)p=runCycle(d/2.4,{speed:.35});
 p=blendPose(stand(),p,clamp((sp-.3)/.8));
 // each change of direction: drop the hips, lean and side-bend into the new line
 for(const[bt,dir] of CUTS)p=over(p,{roll:dir*14,bend:dir*16,lean:26,pitch:8,squash:-.05},bump(bt-.38,bt+.3,tau));
 const v=(tau-S_ST)/SD;
 if(v>-.1&&v<1.5)p=blendPose(p,strike(clamp(v),{foot:'r',power:.72}),Math.min(sm(-.1,.12,v),1-sm(1.05,1.5,v)));
 if(tau>SHOT+1.2)p=blendPose(p,celebrate((tau-SHOT-1.2)*1.1,{kind:'run'}),sm(SHOT+1.2,SHOT+1.7,tau));
 return p;}
/** his right toe at a given τ (from the solved skeleton), a touch ahead, on the grass */
function toeAt(tau:number):V3{const[x,z]=posOf(MT,tau),y=yawMt(tau),sk=solve(mtPose(tau),MITOMA.build,{x,z,yaw:y});return[sk.rToe[0]+Math.cos(y)*.1,.11,sk.rToe[2]-Math.sin(y)*.1];}
const M=toeAt(SHOT);

// ---- the ball: the pass, the carry (small touches), the side-footed shot low into the far corner, the net ----
const FL=.82,IN_NET=SHOT+FL,BACKT=IN_NET+.08;
const roll=(a:V3,b:V3,u:number)=>mix3(a,b,u*(1.3-.3*u));
/** the carried ball: just ahead of his run by a touch rhythm (it never runs more than ~1 m from his boot) */
function carry(tau:number):V3{const[x,z]=posOf(MT,tau),v=velOf(MT,tau),l=Math.hypot(v[0],v[1]),dx=l>.3?v[0]/l:1,dz=l>.3?v[1]/l:0;
 const ph=samp(TABLES[MT].H,tau),u=ph-Math.floor(ph),sh=u<.2?easeOut(u/.2):1-(u-.2)/.8,ah=.36+.55*sh;
 return[x+dx*ah-dz*.1,.11,z+dz*ah+dx*.1];}
const PB=bootOf(PAS,PASS0,.45);
/** the shot: a low, slightly bending side-foot finish that hugs the grass */
function shot(u:number):V3{const dx=HIT[0]-M[0],dz=HIT[2]-M[2],l=Math.hypot(dx,dz),rx=-dz/l,rz=dx/l,b=.6*Math.sin(Math.PI*u)*(1-.25*u);
 return[lerp(M[0],HIT[0],u)+rx*b,lerp(M[1],HIT[1],u)+.25*Math.sin(Math.PI*u),lerp(M[2],HIT[2],u)+rz*b];}
function ballAt(tau:number):V3{
 const back:V3=[1.9,.22,2.8],rest:V3=[1.4,.11,2.3];
 if(tau<PASS0)return bootOf(PAS,tau,.45);
 if(tau<RCV)return roll(PB,carry(RCV),(tau-PASS0)/(RCV-PASS0));
 if(tau<SHOT){const c=carry(tau);return tau<-.35?c:mix3(c,M,sm(-.35,0,tau));}
 if(tau<IN_NET)return shot((tau-SHOT)/FL);
 if(tau<BACKT)return mix3(HIT,back,(tau-IN_NET)/(BACKT-IN_NET));
 const u=clamp((tau-BACKT)/.75);return[lerp(back[0],rest[0],easeOut(u)),lerp(back[1],.11,u),lerp(back[2],rest[2],u)];
}
const NET_HIT:V3=[2,.3,2.9];

// ---- everyone else ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const DIVE_T=SHOT+.18,DIVE_D=1;
/** a pass: the strike blended in round its contact time */
function passAt(p:Pose,tau:number,at:number,power:number,foot:'l'|'r',D=.9){const u=(tau-(at-STRIKE_CONTACT*D))/D;return u>-.2&&u<1.4?blendPose(p,strike(clamp(u),{foot,power}),Math.min(sm(-.2,0,u),1-sm(1,1.4,u))):p;}
const LD=.8;
/** a pose + yaw for actor k at τ */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 if(k===MT)return{p:mtPose(tau),yaw:yawMt(tau)};
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='wol'?READY:stand();
 let p:Pose;
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);const s=clamp((sp-1)/5);p=blendPose(idle,runCycle(distOf(k,tau)/2.6,{speed:s}),clamp((sp-.6)/1));
  if(tau>DIVE_T){const u=(tau-DIVE_T)/DIVE_D;yaw=YAW(M[0]-x,M[2]-z);p=keeperDive(clamp(u),{side:'l',height:.1});
   if(tau>IN_NET+.4)p=over(p,{neckP:-30,neckY:40},sm(IN_NET+.4,IN_NET+1,tau));}
  return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 // the three defenders face the ball until he is past, jab a leg at it, then turn and chase
 if(a.beat!==undefined){const bt=a.beat;if(tau<bt+.35)yaw=YAW(b[0]-x,b[2]-z);
  const u=(tau-(bt-.6*LD))/LD;if(u>-.1&&u<1.2)p=blendPose(p,lunge(clamp(u),{side:a.side}),Math.min(sm(-.1,.15,u),1-sm(.85,1.2,u)));}
 else if(a.role==='wol'&&tau<SHOT+.2)yaw=lerpAng(yaw,YAW(b[0]-x,b[2]-z),.7);
 if(k===PAS){if(tau<PASS0+.3)yaw=YAW(posOf(MT,RCV)[0]-x,posOf(MT,RCV)[1]-z);p=passAt(p,tau,PASS0,.45,'l',.8);}
 if(tau>IN_NET+.4&&a.role==='bha'&&(k===STK||k===PAS+3))p=blendPose(p,celebrate((tau-IN_NET)*1.1+k*.13,{kind:'arms'}),sm(IN_NET+.4,IN_NET+1,tau));
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted; `hero` draws Mitoma with motion smear + secondary motion */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;trail?:number}):World{
 const b=ballAt(tau),items:Item[]=[],res=new Map<number,DrawResult>();
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 const PL=(k:number,tt:number):Place=>{const[x,z]=posOf(k,tt);return{x,z,yaw:poseOf(k,tt).yaw};};
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<(k===MT?1:3.5))return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const pose=poseOf(k,tp).p,yaw=PL(k,tp).yaw,px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===MT?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===MT||a.key);
   const prev=big?{pose:poseOf(k,tp-1/12).p,place:{...PL(k,tp-1/12),x:posOf(k,tau-1/12)[0],z:posOf(k,tau-1/12)[1]}}:undefined;
   res.set(k,drawPlayer(s,pose,c,{...a.style,detail},place,{prev,smear:!!o.hero&&k===MT&&speedOf(MT,tau)>4}));}});});
 items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,ballAt(tau-.03)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  if(o.trail&&tau>SHOT&&tau<IN_NET+.05){const back=P(c,ballAt(Math.max(SHOT,tau-.14)));speedLines(s,K,q[0],q[1],Math.atan2(back[1]-q[1],back[0]-q[0]),{n:5,seed:77,len:Math.max(r*3,Math.hypot(back[0]-q[0],back[1]-q[1])),spread:r*1.6,width:Math.max(3,r*.35),cov:.6*o.trail});}
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
const ballPath=(t0:number,t1:number,n=12):[number,number][]=>Array.from({length:n+1},(_,i)=>{const b=ballAt(t0+(t1-t0)*i/n);return[b[0],b[2]];});
const runPath=(k:number,t0:number,t1:number,n=12):[number,number][]=>Array.from({length:n+1},(_,i)=>posOf(k,t0+(t1-t0)*i/n));
/** a ring on the grass (centre, radii in metres) */
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,rx:number,rz:number,wm:number,ink:string,cov:number,seed=7){
 if(cov<=.02)return;const pts:Pt[]=[];let d=1;for(let i=0;i<40;i++){const g:V3=[cx+Math.cos(i/40*TAU)*rx,.03,cz+Math.sin(i/40*TAU)*rz];const dd=depthOf(c,g);if(dd<NEAR+.2)return;pts.push(P(c,g));d=dd;}
 const w=Math.max(5,c.F*wm/d);s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1}),cov);}
/** a screen-space ring round a joint pair (a boot, the feet), 0..1 */
function bootRing(s:Sheet,a:Pt,b:Pt,ink:string,w:number,seed:number,dashed=false,minR=10){if(w<=.02)return;const r=Math.max(minR,Math.hypot(a[0]-b[0],a[1]-b[1])*1.2)*w+2,cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2,gaps:[number,number][]=[];if(dashed)for(let x=.04;x<.95;x+=.12)gaps.push([x,x+.05]);
 const pts=Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt);
 s.knockout(ribbon(pts,Math.max(5,r*.34),{seed,close:true,taper:0,wobble:.8,gaps}),.7*w);s.fill(ink,ribbon(pts,Math.max(3,r*.2),{seed,close:true,taper:0,wobble:.8,gaps}),.95*w);}
/** a ring round a figure (head to ankle), 0..1 */
function bodyRing(s:Sheet,hero:DrawResult,ink:string,w:number,seed=143){if(w<=.02)return;const h=hero.joints.head,f=hero.joints.rAn,cy=(h[1]+f[1])/2,ry=Math.max(40,Math.abs(f[1]-h[1])*.7+8);
 const pts=Array.from({length:24},(_,i)=>[h[0]+Math.cos(i/24*TAU)*ry*.62*w,cy+Math.sin(i/24*TAU)*ry*w] as Pt),wd=Math.max(5,ry*.08);
 s.knockout(ribbon(pts,wd*1.9,{close:true,seed,taper:0,wobble:.8}),.75*w);s.fill(ink,ribbon(pts,wd,{close:true,seed,taper:0,wobble:.8}),.95*w);}
/** a ring in the goal plane round the corner the ball goes into */
function cornerRing(s:Sheet,c:Camera,w:number,sz=1,h:V3=HIT){if(w<=.02)return;const pts:Pt[]=[];for(let i=0;i<24;i++){const a=i/24*TAU,p:V3=[h[0],Math.max(.05,h[1]+Math.sin(a)*.62*w*sz),h[2]+Math.cos(a)*.8*w*sz];if(depthOf(c,p)<NEAR+.2)return;pts.push(P(c,p));}
 const wd=Math.max(5,.1*sz*kAt(c,h)),cv=Math.min(1,w*1.5);s.knockout(ribbon(pts,wd*1.8,{close:true,seed:145,taper:0,wobble:.8}),.7*cv);s.fill(R,ribbon(pts,wd,{close:true,seed:145,taper:0,wobble:.8}),.95*cv);}
function spark(s:Sheet,c:Camera,p:V3,age:number,size:number,seed:number,ink=R){if(age<=-.03||age>=.3)return;const q=P(c,p);sparkBurst(s,ink,q[0],q[1],kAt(c,p)*size,{n:9,seed,g:easeOutBack(clamp((age+.03)/.08)),width:8,cov:1-clamp((age-.15)/.15)});}
/** a navy "beaten" ring on the grass under defender k, popping as Mitoma goes past him (τ = his beat) */
function beatenRing(s:Sheet,c:Camera,k:number,tau:number,pop:number,wm:number,seed:number){if(pop<=.02)return;const[x,z]=posOf(k,Math.min(tau,(ACTORS[k].beat??0)+.4));groundRing(s,c,x,z,.95,.95,wm,K,.95*clamp(pop),seed);}

// ================= chapter 1 (live, near real time): the high main-stand camera; the pick-up, the run past three, the finish =================
const tau1=(t:number)=>{const mt=T(0,'Mitoma'),pu=T(0,'picks up'),ra=T(0,'runs at'),p1=T(0,'Past one'),p2=T(0,'past two'),p3=T(0,'past three'),ob=T(0,'opens his body'),sc=T(0,'scores'),E=SEC(0);
 return key(t,mono([[0,-9.3],[mt,-8.3],[pu+.1,RCV],[ra+.1,-5.9],[p1+.2,BEATS[0]],[p2+.2,BEATS[1]],[p3+.2,BEATS[2]],[ob+.2,SHOT-.12],[sc+.1,IN_NET-.1],[E+1,IN_NET-.1+(E+1-sc-.1)]]),linear);};
const CAM1:V3=[-32,21,54];
function look1(tau:number):V3{const b=ballAt(tau),[fx,fz]=posOf(MT,tau);
 if(tau<SHOT){return[lerp(b[0],fx,.4)+1.8,1,lerp(b[2],fz,.45)*.85];}
 if(tau<IN_NET){const u=sm(SHOT-.1,IN_NET,tau);return[lerp(lerp(b[0],fx,.4)+1.8,-6,u),1,lerp(lerp(b[2],fz,.45)*.85,-2,u)];}
 return mix3([-6,1.2,-2],[fx,1,fz*.8],sm(IN_NET+.4,IN_NET+2.2,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const sd=T(0,'sunny day'),mo=T(0,'Molineux'),mt=T(0,'Mitoma');
 // wide on sunny Molineux and its gold stands first, then down onto the play
 const up=1-sm(mo+.5,mt+.25,t,easeInOutSine);
 const F=key(t,mono([[0,1300],[mo+.5,1400],[mt+.25,6400],[T(0,'runs at'),7200],[T(0,'Past one'),7800],[T(0,'past three'),7600],[T(0,'opens his body'),6800],[T(0,'scores')+.4,5800],[SEC(0),5600]]),easeInOutSine);
 void sd;return cam(CAM1,mix3(look,[-40,10,-80],up),F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET,sd=T(0,'sunny day'),mo=T(0,'Molineux'),mt=T(0,'Mitoma'),pu=T(0,'picks up'),ra=T(0,'runs at'),p1=T(0,'Past one'),p3=T(0,'past three'),ob=T(0,'opens his body'),sc=T(0,'scores');frame(s);
  stadium(s,c,{t,cheer:.08+.9*sm(0,.5,goalIn),flash:.1+1.2*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "sunny day": a sun glint over the gold stand
  if(t<mt+.3){const g=sm(sd-.1,sd+.4,t,easeOutBack)*(1-sm(mo+.6,mt+.2,t));if(g>.02){const q=P(c,[-40,40,-110]);sparkBurst(s,Y,q[0],q[1],90*g,{n:12,seed:301,g,width:10,cov:.95});}}
  // "picks up": the pass in, dashed; "runs at": his route, drawn as he runs it (red)
  groundTrail(s,c,ballPath(PASS0,RCV,8),.22,R,{progress:sm(PASS0,RCV,tau),dashed:true,head:false,cov:.9*(1-sm(p1,p1+.5,t)),seed:89});
  groundTrail(s,c,runPath(MT,RCV,SHOT,24),.36,R,{progress:clamp((tau-RCV)/(SHOT-RCV))*sm(ra-.2,ra+.1,t),cov:.95*(1-sm(sc+.8,sc+1.3,t)),head:true,seed:90});
  // "opens his body": the aim line to the far post, dashed
  groundTrail(s,c,[[M[0],M[2]],[lerp(M[0],HIT[0],.5),lerp(M[2],HIT[2],.5)],[HIT[0]-.3,HIT[2]]],.22,R,{progress:sm(ob-.2,ob+.3,t),dashed:true,cov:.9*(1-sm(sc+.5,sc+1,t)),seed:92});
  // "past one / two / three": a navy ring pops under each defender as he goes past
  for(let i=0;i<3;i++)beatenRing(s,c,DEF[i],tau,sm(BEATS[i]-.05,BEATS[i]+.25,tau,easeOutBack)*(1-sm(sc+.6,sc+1.1,t)),.2,91+i);
  const w=drawWorld(s,c,tau,tp,{ballMin:12,trail:1});
  const hero=w.res.get(MT);if(hero)bodyRing(s,hero,R,sm(mt-.15,mt+.25,t,easeOutBack)*(1-sm(pu+.6,ra,t)));
  for(let i=0;i<3;i++){const[x,z]=posOf(MT,BEATS[i]);spark(s,c,[x,.3,z],tau-BEATS[i],1.1,95+i);}
  spark(s,c,M,tau-SHOT,1.6,99);
  // "scores": the far corner lights up as it goes in
  cornerRing(s,c,sm(sc-.3,sc+.1,t,easeOutBack)*(1-sm(sc+1.2,sc+1.6,t)),2.2);
  void p3;},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:12,
};

// ================= chapter 2 (TV replay, slow motion, low behind him): the small touches, the ball glued to his feet =================
const tau2=(t:number)=>{const E=SEC(1),wa=T(1,'Watch again'),st=T(1,'Small touches'),gl=T(1,'glued'),hf=T(1,'his feet');
 return key(t,mono([[0,-5.5],[wa+.2,-5.3],[st,-4.5],[gl,-2.9],[hf+.2,-1.6],[E,-.2]]),linear);};
function cam2(t:number){const tau=tau2(t),E=SEC(1),[x,z]=posOf(MT,tau),a=posOf(MT,tau-.7),b=posOf(MT,tau+.7),l=Math.hypot(b[0]-a[0],b[1]-a[1])||1,dx=(b[0]-a[0])/l,dz=(b[1]-a[1])/l;
 // low behind him and a little to his right (the near side), his heading smoothed over 1.4 s so the cuts do not whip the camera
 const look:V3=[x+dx*1.3,.85,z+dz*1.3];
 const pos:V3=[x-dx*5.6-dz*2.6,1.9,z-dz*5.6+dx*2.6];
 return cam(pos,look,key(t,mono([[0,1750],[T(1,'Small touches'),2000],[T(1,'glued'),2150],[E,1950]]),easeInOutSine));}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),st=T(1,'Small touches'),gl=T(1,'glued'),hf=T(1,'his feet');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c);
  // "Small touches": a red tick on the grass at every touch, left behind him as he goes
  const ticks=new Path2D();let nt=0;const h0=samp(TABLES[MT].H,-5.6),h1=samp(TABLES[MT].H,tau);
  for(let k=Math.ceil(h0);k<=h1;k++){let lo=-5.6,hi=tau;for(let it=0;it<14;it++){const mid=(lo+hi)/2;if(samp(TABLES[MT].H,mid)<k)lo=mid;else hi=mid;}const b=carry(lo+.01),g:V3=[b[0],.03,b[2]];if(depthOf(c,g)<NEAR+.3)continue;const q=P(c,g),r=Math.max(4,kAt(c,g)*.09);ticks.addPath(polyPath(Array.from({length:10},(_,i)=>[q[0]+Math.cos(i/10*TAU)*r*1.4,q[1]+Math.sin(i/10*TAU)*r*.6] as Pt),true));nt++;}
  if(nt)s.fill(R,ticks,.9*sm(st-.1,st+.3,t)*(1-sm(E-.5,E-.15,t)));
  for(let i=0;i<3;i++)beatenRing(s,c,DEF[i],tau,sm(BEATS[i]-.05,BEATS[i]+.25,tau,easeOutBack)*(1-sm(E-.5,E-.15,t)),.06,111+i);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  const hero=w.res.get(MT);
  // "glued": a red tether from his boot to the ball; "his feet": both boots lit
  if(hero&&depthOf(c,w.ball)>NEAR){const q=P(c,w.ball),ft=hero.joints.rToe,gw=sm(gl-.1,gl+.3,t)*(1-sm(E-.6,E-.2,t));
   if(gw>.02)laneArrow(s,R,ft,q,Math.max(4,kAt(c,w.ball)*.035),{dashed:true,head:0,seed:115,cov:.95*gw});
   bootRing(s,hero.joints.lToe,hero.joints.rToe,R,sm(hf-.1,hf+.25,t,easeOutBack)*(1-sm(E-.6,E-.2,t)),117,false,Math.abs(hero.joints.head[1]-hero.joints.rAn[1])*.16);}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:119,len:900,spread:520,width:22,cov:.5*(1-t/.5)});},
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:4,
};

// ================= chapter 3 (reverse angle from behind the net): the shot in, the celebration, 4–1, Goal of the Month =================
const tau3=(t:number)=>{const E=SEC(2),bw=T(2,'Brighton won'),ft=T(2,'four to one'),la=T(2,'Later');
 return key(t,mono([[0,SHOT-.5],[bw,IN_NET-.05],[bw+.9,IN_NET+.6],[ft+.6,IN_NET+2],[la,IN_NET+2.8],[E,IN_NET+2.8+(E-la)*.9]]),linear);};
function cam3(t:number){const tau=tau3(t),[x,z]=posOf(MT,tau),c1=sm(IN_NET+.2,IN_NET+1,tau,easeInOutSine),c2=sm(IN_NET+.8,IN_NET+2.2,tau,easeInOutSine);
 // behind the net for the shot, then out round the post (never through the net) to the celebration
 const look=mix3([-10,1,-4],[x+1.2,1.2,z],Math.max(c1*.6,c2));
 const pos=mix3(mix3([6.4,1.6,1.4],[4.4,2,8],c1),[x+4.5,2.1,z+9.5],c2);
 return cam(pos,look,key(t,mono([[0,1450],[T(2,'Brighton won'),1500],[T(2,'four to one'),2000],[SEC(2),2200]]),easeInOutSine));}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-IN_NET,E=SEC(2),bw=T(2,'Brighton won'),ft=T(2,'four to one'),gm=T(2,'Goal of the Month');frame(s);
  stadium(s,c,{t,cheer:.1+sm(0,.5,goalIn),flash:.1+1.2*sm(0,.4,goalIn)+.5*sm(gm-.2,gm+.4,t),which:[0,2,3]});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,trail:1});
  const hero=w.res.get(MT);
  if(hero){const h=hero.joints.head,sz=Math.max(14,Math.abs(hero.joints.rAn[1]-h[1])*.12),fade=1-sm(E-.5,E-.15,t);
   // "four to one": four balls pop up over him, then one smaller, apart
   for(let i=0;i<5;i++){const g=sm(ft+.1+i*.22,ft+.35+i*.22,t,easeOutBack)*fade*(1-sm(gm-.3,gm,t));if(g<=.02)continue;const one=i===4;ball(s,h[0]+(i-2)*sz*2.5+(one?sz*1.2:0),h[1]-sz*3.4-sz*.4*Math.sin(tt*6+i),sz*g*(one?.7:1),i*1.3);}
   // "Goal of the Month": a gold star burst and a ring round him
   const gs=sm(gm-.15,gm+.3,t,easeOutBack)*fade;if(gs>.02){sparkBurst(s,Y,h[0],h[1]-sz*3.6,sz*5*gs,{n:12,seed:125,g:gs,width:12,cov:.95});ball(s,h[0],h[1]-sz*3.6,sz*1.1*gs,tt*3);}
   bodyRing(s,hero,R,sm(bw-.15,bw+.3,t,easeOutBack)*(1-sm(ft,ft+.4,t)),127);}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:129,len:900,spread:520,width:22,cov:.5*(1-t/.45)});},
 aperture(t){const c=cam3(t),[x,z]=posOf(MT,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4,
};

// ================= chapter 4 ("How he does it": a training-pitch DEMONSTRATION, not the match): feet can trick you; read the hips =================
// its own little simulation on σ (seconds, σ = 0 the defender's hips turn): the attacker A walks the ball at the defender D; D's feet jab
// twice while his hips stay square (the feet trick); A dips his shoulder right, D's hips open to that side (σ = 0, toward the camera, so
// the hips bar widens on screen), A goes past the other way, behind his back.
const DEMO_A:TK[]=[[-5.5,-31.5,0],[-4.5,-30.3,0],[-3.5,-29.1,0],[-2.5,-28,0],[-1.5,-27,.05],[-.6,-26.3,.3],[0,-25.9,.35],[.35,-25.4,.1],[.7,-24.4,-.7],[1.1,-22.8,-1.4],[1.6,-20.6,-1.7],[2.4,-17.4,-1.5],[3.4,-13.6,-1.1]];
const DEMO_D:TK[]=[[-5.5,-20.8,0],[-4.5,-21.6,0],[-3.5,-22.3,0],[-2.5,-22.7,0],[-1.5,-22.9,0],[0,-23,.05],[.4,-23,.3],[.9,-22.9,.55],[1.5,-22.4,.3],[2.4,-20.6,-.5],[3.4,-18.2,-.9]];
const dPos=(keys:TK[],s:number)=>herm(keys,s);
const dVel=(keys:TK[],s:number):[number,number]=>{const a=herm(keys,s-.1),b=herm(keys,s+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};
function dDist(keys:TK[],s:number){let d=0,[px,pz]=herm(keys,-5.5);for(let u=-5.5+.05;u<=s+1e-6;u+=.05){const[x,z]=herm(keys,u);d+=Math.hypot(x-px,z-pz);px=x;pz=z;}return d;}
const JAB=[-3.1,-2.2];// the two feet jabs (hips stay square)
const GO=.35;// the push past
function demoBall(s:number):V3{
 if(s<GO){const[x,z]=dPos(DEMO_A,s),ph=(s+5.5)/.8,u=ph-Math.floor(ph),sh=u<.2?easeOut(u/.2):1-(u-.2)/.8;return[x+.42+.4*sh,.11,z-.08];}
 const A0:V3=[-24.95,.11,.25],B0:V3=[-21.6,.11,-1.75],C0:V3=[-18.6,.11,-1.7],D0:V3=[-13,.11,-1.1];
 if(s<1.2)return mix3(A0,B0,easeOut((s-GO)/.85));
 if(s<2)return mix3(B0,C0,easeOut((s-1.2)/.8));
 return mix3(C0,D0,clamp((s-2)/1.4));}
function demoA(s:number):{p:Pose;yaw:number;x:number;z:number}{const[x,z]=dPos(DEMO_A,s),v=dVel(DEMO_A,s),sp=Math.hypot(v[0],v[1]),k=clamp((sp-2.4)/3.4),d=dDist(DEMO_A,s);
 let p=blendPose(dribble(d/1.4,{foot:'r',speed:.3}),runCycle(d/(2.3+2.1*k),{speed:k}),k);
 p=over(p,{roll:12,bend:14,twist:-14,lean:18},bump(-1.2,.3,s));// the shoulder dip to his right (the bait)
 p=over(p,{roll:-14,bend:-16,lean:30,pitch:12,squash:-.06},bump(GO-.2,GO+.55,s));// the push off to his left
 return{p,yaw:sp>.4?YAW(v[0],v[1]):0,x,z};}
/** the defender's HIPS yaw: square to the attacker (facing −x) until σ = 0, then they open to +z (his left, toward the camera) and are slow to come back */
function dHipYaw(s:number){return lerpAng(lerpAng(Math.PI,-Math.PI/2-.15,sm(-.15,.3,s)),0,sm(1.1,2.1,s));}
function demoD(s:number):{p:Pose;yaw:number;x:number;z:number}{const[x,z]=dPos(DEMO_D,s),v=dVel(DEMO_D,s),sp=Math.hypot(v[0],v[1]),d=dDist(DEMO_D,s);
 let p=blendPose(READY,backpedal(d/1.25),clamp((sp-.3)/.6)*(1-sm(-2,-1.4,s)));
 // the feet trick: two quick jabs, alternate legs, hips square
 for(const[i,j] of JAB.entries()){const u=(s-(j-.3))/.6;if(u>-.1&&u<1.1)p=blendPose(p,lunge(clamp(u)*.62,{side:i?'l':'r'}),.7*Math.min(sm(-.1,.15,u),1-sm(.8,1.1,u)));}
 // the turn: hips open, weight goes that way; then the late turn and chase
 p=over(p,{lean:22,roll:10,lKnee:40,rKnee:52},bump(-.1,1.3,s));
 const chase=sm(1.1,1.8,s);if(chase>0)p=blendPose(p,runCycle(d/3,{speed:.7}),chase);
 return{p,yaw:dHipYaw(s),x,z};}
const tau4=(t:number)=>{const E=SEC(3),hd=T(3,'How does'),up=T(3,'university project'),ft=T(3,'Feet can trick'),wd=T(3,'Watch the defender'),nf=T(3,'not their feet'),kw=T(3,'know when'),gp=T(3,'go past');
 return key(t,mono([[0,-5.4],[hd,-5.1],[up,-4.2],[ft,JAB[0]-.4],[wd+.3,-1.5],[nf+.3,-.8],[kw,-.1],[gp,GO],[E,2.7]]),linear);};
function cam4(t:number){const s=tau4(t),[ax]=dPos(DEMO_A,clamp(s,-5.5,3.4)),[dx]=dPos(DEMO_D,clamp(s,-5.5,3.4)),mx=lerp(ax,dx,.48),far=1-sm(-3.5,-1.2,s);
 return cam([mx-1,3+.6*far,8.6+3.4*far],[mx,.95,.3],key(t,mono([[0,1100],[T(3,'university project'),1250],[T(3,'Feet can trick'),1550],[T(3,'Watch the defender'),2150],[T(3,'go past'),2000],[SEC(3),1800]]),easeInOutSine));}
/** the notebook (his university project on dribbling): a paper page with ruled lines and a little dribble zig-zag, over his head */
function notebook(s:Sheet,x:number,y:number,sz:number,g:number,seed:number){if(g<=.02)return;const w=sz*1.5*g,h=sz*1.9*g,pg=polyPath([[x-w/2,y-h/2],[x+w/2,y-h/2+sz*.06],[x+w/2,y+h/2],[x-w/2,y+h/2-sz*.04]],true);
 s.fill(K,ribbon([[x-w/2,y-h/2],[x+w/2,y-h/2+sz*.06],[x+w/2,y+h/2],[x-w/2,y+h/2-sz*.04]],Math.max(3,sz*.12),{close:true,seed,taper:0,wobble:.6}),.9);s.knockout(pg);
 const ln=new Path2D();for(let i=0;i<4;i++){const yy=y-h*.3+i*h*.14;ln.moveTo(x-w*.36,yy);ln.lineTo(x+w*.36,yy);}s.stroke(B,ln,Math.max(1.5,sz*.05),.8);
 const zz:Pt[]=[[x-w*.3,y+h*.32],[x-w*.12,y+h*.2],[x+w*.04,y+h*.34],[x+w*.2,y+h*.18],[x+w*.32,y+h*.26]];s.fill(R,ribbon(zz,Math.max(2.5,sz*.09),{seed:seed+1,taper:.2,wobble:.4}),.95);}
/** the HIPS bar: a thick yellow bar across the hip joints, and an arrow on the grass the way the hips point */
function hipsBar(s:Sheet,c:Camera,r:DrawResult,x:number,z:number,yaw:number,w:number,seed:number){if(w<=.02)return;
 // the hip line in the world: through the pelvis, across the body (his left-right axis), 0.5 m each side; it widens on screen as the hips turn to the camera
 const pv=r.sk.pelvis as V3,rx=Math.sin(yaw),rz=Math.cos(yaw),L=.5*w,a:V3=[pv[0]-rx*L,pv[1],pv[2]-rz*L],b:V3=[pv[0]+rx*L,pv[1],pv[2]+rz*L];
 if(depthOf(c,a)<NEAR+.3||depthOf(c,b)<NEAR+.3)return;const pts:Pt[]=[P(c,a),P(c,b)],kk=kAt(c,pv);
 s.knockout(ribbon(pts,Math.max(8,kk*.16),{seed,taper:0,wobble:.4}),.85*w);s.fill(Y,ribbon(pts,Math.max(5,kk*.1),{seed,taper:0,wobble:.4}),.95*w);
 const f:V3=[x+Math.cos(yaw)*1.5,.03,z-Math.sin(yaw)*1.5];if(depthOf(c,f)<NEAR+.3)return;
 groundTrail(s,c,[[x,z],[lerp(x,f[0],.5),lerp(z,f[2],.5)],[f[0],f[2]]],.12,Y,{progress:w,cov:.95*w,seed:seed+2});}
const ch4:Scene={
 draw(s,t){const c=cam4(t),sg=tau4(t),sp=tau4(twos(t)),E=SEC(3),hd=T(3,'How does'),up=T(3,'university project'),ft=T(3,'Feet can trick'),wd=T(3,'Watch the defender'),nf=T(3,'not their feet'),kw=T(3,'know when'),gp=T(3,'go past');frame(s);
  trainingGround(s,c);
  ground(s,c,{boards:false});
  const fade=1-sm(E-.5,E-.15,t);
  // "go past": one long arrow round the far side of the turned defender
  const burst:[number,number][]=Array.from({length:11},(_,i)=>{const[x,z]=dPos(DEMO_A,GO-.1+i*.26);return[x,z];});
  groundTrail(s,c,burst,.2,R,{progress:sm(gp-.2,gp+.6,t,easeOut),cov:.95*fade,seed:131});
  const A=demoA(sp),D=demoD(sp),Ap=demoA(sp-1/12),Dp=demoD(sp-1/12),b=demoBall(sg);
  const items:Item[]=[];let ra:DrawResult|undefined,rd:DrawResult|undefined;
  items.push({depth:depthOf(c,[D.x,0,D.z]),draw:()=>{rd=drawPlayer(s,D.p,c,TRAIN_D,{x:D.x,z:D.z,yaw:D.yaw},{prev:{pose:Dp.p,place:{x:Dp.x,z:Dp.z,yaw:Dp.yaw}}});}});
  items.push({depth:depthOf(c,[A.x,0,A.z]),draw:()=>{ra=drawPlayer(s,A.p,c,TRAIN,{x:A.x,z:A.z,yaw:A.yaw},{prev:{pose:Ap.p,place:{x:Ap.x,z:Ap.z,yaw:Ap.yaw}},smear:sg>GO&&sg<1.8});}});
  items.push({depth:depthOf(c,b),draw:()=>{const q=P(c,b),r=Math.max(8,BALL_R*kAt(c,b));ballShadow(s,c,b);ball(s,q[0],q[1],r,sg*9);}});
  items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());
  // "How does": a ring round the attacker; "university project": his notebook pops up over his head
  if(ra){bodyRing(s,ra,R,sm(hd-.1,hd+.3,t,easeOutBack)*(1-sm(up,up+.4,t)),133);
   const h=ra.joints.head,sz=Math.max(22,Math.abs(ra.joints.rAn[1]-h[1])*.3);notebook(s,h[0]+sz*.6,h[1]-sz*2.8,sz,sm(up-.1,up+.3,t,easeOutBack)*(1-sm(ft-.2,ft+.2,t)),135);
   if(sg>GO-.1){const v=dVel(DEMO_A,sg),hip=P(c,[A.x,1,A.z]),bk=P(c,[A.x-v[0]*.2,1,A.z-v[1]*.2]);const kk=kAt(c,[A.x,1,A.z]);speedLines(s,K,hip[0],hip[1],Math.atan2(hip[1]-bk[1],hip[0]-bk[0]),{n:6,seed:137,len:kk*1.8,spread:kk*.55,width:Math.max(3,kk*.05),cov:.85*sm(gp-.1,gp+.2,t)*(1-sm(gp+1.4,gp+1.8,t))});}}
  if(rd){// "Feet can trick": a dashed navy ring round his jabbing feet; "not their feet": crossed out (navy on a paper cut, clear of his red socks)
   const fh=Math.abs(rd.joints.head[1]-rd.joints.rAn[1]),fr=sm(ft-.1,ft+.3,t,easeOutBack)*(1-sm(kw,kw+.4,t));bootRing(s,rd.joints.lToe,rd.joints.rToe,K,fr,139,true,fh*.3);
   const xw=sm(nf-.1,nf+.25,t)*(1-sm(kw,kw+.4,t));if(xw>.02){const a=rd.joints.lToe,b2=rd.joints.rToe,cx=(a[0]+b2[0])/2,cy=(a[1]+b2[1])/2,r=Math.max(fh*.34,Math.hypot(a[0]-b2[0],a[1]-b2[1])*.9)*xw;
    const x1=ribbon([[cx-r,cy-r*.7],[cx+r,cy+r*.7]],Math.max(5,r*.24),{seed:141,taper:.1}),x2=ribbon([[cx+r,cy-r*.7],[cx-r,cy+r*.7]],Math.max(5,r*.24),{seed:142,taper:.1});
    s.knockout(ribbon([[cx-r,cy-r*.7],[cx+r,cy+r*.7]],Math.max(9,r*.44),{seed:141,taper:.1}),.9);s.knockout(ribbon([[cx+r,cy-r*.7],[cx-r,cy+r*.7]],Math.max(9,r*.44),{seed:142,taper:.1}),.9);s.fill(K,x1,.95);s.fill(K,x2,.95);}
   // "Watch the defender's hips": the yellow hips bar and its arrow, which swings when the hips turn ("know when")
   hipsBar(s,c,rd,D.x,D.z,D.yaw,sm(wd-.1,wd+.3,t,easeOutBack)*fade*(1-sm(gp+1.2,gp+1.6,t)),143);
   bodyRing(s,rd,Y,sm(kw-.05,kw+.3,t,easeOutBack)*(1-sm(gp,gp+.4,t)),145);}
  spark(s,c,[-25,.2,.2],sg-GO,1.2,147);void fade;},
 aperture(t){const c=cam4(t),b=demoBall(tau4(t)),[x,y]=P(c,b),r=Math.max(9,BALL_R*kAt(c,b));return apertureDisc(x,y,r*1.1,12);},
 still:4,
};

const story:RisoStory={
 id:'mitoma-signature',format:'11v11',title:'Mitoma: past three, 2023',
 theme:'The studied dribble: watch the defender\'s hips, not their feet, to know when to go past.',
 ageNote:'Premier League, Wolves 1–4 Brighton, Molineux, Wolverhampton, 19 August 2023 (15 minutes). Mitoma ran past three defenders to score; it was Goal of the Month, the first Premier League monthly award won by a Japanese player. He was 26.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a sunny sparkle and the white ball hops up from the point. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*150,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(R,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);s.knockout(polyPath([[x+Math.cos(a)*30,y-up-70*fl],[x+14,y-up],[x,y-up+70*fl],[x-14,y-up]],true));sparkBurst(s,Y,x,y-up,140*g,{n:9,seed,g:fl,width:12});}
  ball(s,x,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
