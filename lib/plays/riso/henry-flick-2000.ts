/** Iconic play film: Thierry Henry's flick and volley, Arsenal 1–0 Manchester United, Premier League, Highbury, London, 1 October 2000.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/henry-flick-2000/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/henry-flick-2000/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/henry-flick-2000/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026 through web-search summaries; the pages could not be fetched in this session and the footage was not reviewed):
 *  - Arsenal.com, "GGG2: Henry v Manchester United, 2000" https://www.arsenal.com/history/ggg2-henry-v-manchester-united-2000
 *  - Arsenal.com, "'A little bit crazy' - Henry's stunner 25 years on" https://www.arsenal.com/news/little-bit-crazy-henrys-stunner-25-years
 *  - Arsenal.com, "Thierry Henry's top 10 Arsenal goals" https://www.arsenal.com/news/features/20141216/thierry-henry
 *  - NBC Sports, "Premier League top 30 moments: No. 27 - Henry's volley proves greatness"
 *    https://www.nbcsports.com/soccer/news/premier-league-top-30-moments-thioerry-henry-volley-underlines-greatness
 *  - FootballCritic, "Goal scored by Thierry Henry against Man Utd (2000/2001)" https://www.footballcritic.com/great-goals/arsenal-fc-manchester-united-fc/thierry-henry/183
 *    and "Why Thierry Henry's flick-and-volley is the greatest Premier League goal ever" https://www.footballcritic.com/features/why-thierry-henrys-flick-and-volley-is-the-greatest-premier-league-goal-ever/814
 *  - Bleacher Report, "Thierry Henry vs. Manchester United 2000: Why This Is My Favourite Goal Ever" https://bleacherreport.com/articles/982186
 *  - Wikipedia, "2000–01 Arsenal F.C. season" (attendance 38,146) https://en.wikipedia.org/wiki/2000%E2%80%9301_Arsenal_F.C._season
 *  - 11v11.com and mufcinfo.com match records (Arsenal 1–0 Manchester United, 1 Oct 2000)
 *  - Football Kit Archive / The Kitman / Classic Football Kit listings, "Manchester United 2000-01 Away Kit" (white Umbro shirt, navy collar,
 *    navy Vodafone lettering) https://www.footballkitarchive.com/manchester-united-2000-01-away-kit/970/
 * CONFIRMED by those accounts: 1 October 2000, Highbury, Premier League; Arsenal won 1–0 and this was the only goal (30th minute, first
 *  half); attendance 38,146; Freddie Ljungberg was fouled by David Beckham and from the free kick Gilles Grimandi played the ball in to Henry;
 *  Henry was about 20–25 yards out with his BACK TO GOAL and Denis Irwin in close attention; holding Irwin off he flicked the ball up with
 *  his RIGHT foot, swivelled/spun and, wrapping his RIGHT leg round the ball, hit a dipping, swerving volley that looped over his France
 *  team-mate Fabien Barthez into the (far) top corner; Barthez was left "rooted to the spot"; Henry wore 14; Wenger: "When you haven't been
 *  scoring goals, sometimes you need to try something a little bit crazy." United's 2000–01 away shirt was white with navy trim.
 * INFERRED / ILLUSTRATIVE: that United wore that white away kit on the day (Arsenal were at home in red) and its navy shorts and white socks;
 *  Arsenal's white shorts and white socks, short sleeves; Barthez's keeper kit colour (drawn blue, long sleeves, gloves), his shaved head is
 *  well documented; every position and run in metres (free kick ≈ 37 m out on the right, Henry received ≈ 21 m out); the pass as a firm
 *  ground ball; flight times, the flick's height (≈ 2 m), which way he spun (drawn over his LEFT shoulder, pivoting on his left foot, which
 *  flows into a right-foot volley) and the exact corner (drawn: the top corner at the far post from the main camera); other players shown and
 *  their numbers (Irwin 3, Beckham 7, Stam 6, Keane 16, G. Neville 2; Ljungberg 8, Vieira 4); the referee's black kit; the white ball design;
 *  the autumn afternoon light; Highbury's stands drawn as compact two-tier side stands, the Clock End with its clock and the North Bank;
 *  camera placements and lenses; Henry's celebration run.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation
 * on a real clock τ (seconds, τ = 0 Grimandi's pass): ch1 = the high main-stand broadcast camera in real time (free kick, pass, flick, spin,
 * volley, net); ch2 = the TV slow-motion replay, low and close, orbiting Henry (the right-foot flick, the spin, the volley before the ball
 * lands); ch3 = the replay from behind the goal, low through the net (the loop over Barthez, the dip into the top corner, the crowd);
 * ch4 = a duotone lesson (first touch sets up the shot; flick, turn, strike as one movement, printed as a chronophotograph).
 * Seams are forward passages into the ball. Ball physics: the pass decelerates, the flick is ballistic (g = 9.81), the shot is a dipping
 * curler; contact points are read from the solved skeleton (right toe) so the ball always meets the boot. Figures: lib/plays/riso/athlete.ts
 * through ONE adapter, drawPlayer() (which also prints Arsenal's white sleeves as a paper knockout, since the library has one shirt ink).
 * Framing: the world is centred on the CANVAS centre (never sheet.safe) with a lens that widens for a square window (1.45:1 … 1:1).
 * Inks: yellow (light, grass with blue), red (Arsenal, skin), blue (sky, grass, keeper), navy (key line, United trim). Scenes read only their
 * local t; drawn objects pose on twos, cameras on ones; all randomness is seeded. Budget ≈ 150–260 plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIO,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,stand,strike,volley,backpedal,celebrate,keeperSet,STRIKE_CONTACT,
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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`henry film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py henry-flick-2000 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header): withTiming swaps in the clips, the chapter
 * lengths and the word onsets, and every action below re-times itself. */
import timingJson from '../../../public/plays/narration/henry-flick-2000/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Highbury',"Highbury, 2000. Arsenal, in red with white sleeves, play Manchester United. Thierry Henry is far from goal, back to it, with a defender tight behind him. Here comes the pass. Look at this... goal!",
  ['Highbury','Arsenal','red with white sleeves','Manchester United','Thierry Henry','far from goal','back to it','a defender','Here comes the pass','Look at this','goal']),
 prov('Flick and spin','Watch again, slowly. Henry flicks the ball up with his right foot, spins round, and volleys it before it lands.',
  ['Watch again','slowly','Henry flicks','right foot','spins round','volleys it','before it lands']),
 prov('Top corner','From behind, see it loop over Barthez and dip into the top corner. The only goal of the game!',
  ['From behind','loop over Barthez','dip into','top corner','The only goal']),
 prov('First touch','A clever first touch can set up your shot. Flick, turn and strike in one smooth movement.',
  ['A clever first touch','set up your shot','Flick','turn','strike','one smooth movement']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`henry film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; goal line x = 0, net toward +x, pitch to x = −100) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
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
function groundLine(path:Path2D,c:Camera,a:[number,number],b:[number,number],w=.12){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
function groundRing(c:Camera,x:number,z:number,r:number,n=28):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p:V3=[x+Math.cos(a)*r,.02,z+Math.sin(a)*r];if(depthOf(c,p)<NEAR)return[];o.push(P(c,p));}return o;}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
function hull2(pts:Pt[]):Pt[]{if(pts.length<3)return pts.slice();const p=pts.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o:Pt,a:Pt,b:Pt)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo:Pt[]=[],up:Pt[]=[];for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q);}
 for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q);}up.pop();lo.pop();return lo.concat(up);}

/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}

// ================= Highbury: compact two-tier side stands close to the pitch, the Clock End (with its clock), the North Bank =================
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-104,.9,-37],[6,.9,-37],[6,17,-54],[-104,17,-54]],// West Stand (far side, across from the TV camera)
 [[6.5,.9,40],[6.5,.9,-40],[21,11,-40],[21,11,40]],// Clock End (behind the goal Arsenal attack)
 [[6,.9,37],[-104,.9,37],[-104,17,54],[6,17,54]],// East Stand (the main stand under the camera)
 [[-106,.9,-40],[-106,.9,40],[-121,13,40],[-121,13,-40]],// North Bank (far end)
];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper faces / 1 red shirts and scarves / 2 navy coats / 3 yellow, phase] */
const CROWD=(()=>{const r=rng(2000),out:[number,number,number,number,number][]=[];[720,300,560,320].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r(),v=.04+r()*.9;if(st!==1&&Math.abs(v-.52)<.04)continue;out.push([st,r(),v,c<.44?0:c<.8?1:c<.95?2:3,r()*TAU]);}});return out;})();
const CLOCK:V3=[20.6,13.4,-13];// the Clock End clock, on the front of the roof
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // autumn afternoon: a warm yellow screen, stepped blue bands deepening upward (no clouds: the sky is a printed gradient)
 s.field(Y,.14,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 [.1,.2,.32,.45].forEach((d,i)=>s.tone(B,polyPath([[-Bnd,hz-260-i*190],[Bnd,hz-260-i*190],[Bnd,i===3?-Bnd*2:hz-450-i*190],[-Bnd,i===3?-Bnd*2:hz-450-i*190]],true),d));
 // stands: knocked out, a navy screen, stepped rows; the upper-tier fascia with paper box windows; roofs as navy slabs
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),fascia=new Path2D(),windows=new Path2D();
 STANDS.forEach((q,si)=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<14;k+=2)addPoly(rows,clipPoly(c,[bil(q,0,k/14),bil(q,1,k/14),bil(q,1,(k+1)/14),bil(q,0,(k+1)/14)]));
  // roof: a slab above the top edge, reaching out over the stand
  const lift:V3=[0,4.2,0],over=si===0?[0,0,6]:si===2?[0,0,-6]:si===1?[-5,0,0]:[5,0,0];
  addPoly(roof,clipPoly(c,[add(q[3],lift),add(q[2],lift),add(add(q[2],lift),over as V3),add(add(q[3],lift),over as V3)]));
  if(si!==1){addPoly(fascia,clipPoly(c,[bil(q,0,.48),bil(q,1,.48),bil(q,1,.56),bil(q,0,.56)]));
   for(let k=0;k<16;k++){const u0=(k+.2)/16,u1=(k+.8)/16;addPoly(windows,clipPoly(c,[bil(q,u0,.5),bil(q,u1,.5),bil(q,u1,.54),bil(q,u0,.54)]));}}});
 s.knockout(stands);s.tone(K,stands,.45);s.tone(R,rows,.2);s.tone(K,rows,.2);
 // crowd heads: faces, red shirts and scarves, coats — bobbing on the twos when they cheer
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,4,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(R,heads[1],.95);if(seen[2])s.fill(K,heads[2],.9);if(seen[3])s.fill(Y,heads[3],.95);
 // camera flashes when the goal goes in (paper sparks on the twos)
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.08+r()*.8);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.knockout(fascia);s.fill(K,fascia,.85);s.knockout(windows,.9);s.fill(K,roof,.9);
 clock(s,c,tt);
 // advertising boards along the touchlines (red and paper panels) — Highbury's crowd sits right behind them
 const boardsR=new Path2D(),boardsP=new Path2D();for(const z of[-35.2,35.2])for(let x=-100;x<4;x+=8){const q:V3[]=[[x,0,z],[x+7.6,0,z],[x+7.6,.9,z],[x,.9,z]];addPoly((Math.round(x/8)&1)?boardsR:boardsP,clipPoly(c,q));}
 s.knockout(boardsR);s.knockout(boardsP);s.fill(R,boardsR,.9);s.tone(K,boardsP,.1);
 // grass: yellow × blue = green, Highbury's mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-108,0,-35],[6.5,0,-35],[6.5,0,35],[-108,0,35]]));s.knockout(gp);yInk(s,gp,.88);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-100;x<0;x+=11)addPoly(stripes,clipPoly(c,[[x,0,-33.5],[x+5.5,0,-33.5],[x+5.5,0,33.5],[x,0,33.5]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-100,-33.5],[0,-33.5]);Ln([-100,33.5],[0,33.5]);Ln([0,-33.5],[0,33.5]);Ln([-50,-33.5],[-50,33.5]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 goal(s,c,o.net);
}
/** the Clock End clock: a paper face, a navy rim and two hands (it faces the pitch, −x) */
function clock(s:Sheet,c:Camera,tt:number){
 if(depthOf(c,CLOCK)<3)return;const face:Pt[]=[];for(let i=0;i<20;i++){const a=i/20*TAU;face.push(P(c,[CLOCK[0],CLOCK[1]+Math.sin(a)*1.5,CLOCK[2]+Math.cos(a)*1.5]));}
 const fp=polyPath(face,true),k=kAt(c,CLOCK);s.knockout(fp);s.fill(K,ribbon(face,Math.max(2,.22*k),{close:true,taper:0,wobble:.4}),.95);
 const hand=(a:number,l:number)=>ribbon([P(c,CLOCK),P(c,[CLOCK[0]-.05,CLOCK[1]+Math.cos(a)*l,CLOCK[2]+Math.sin(a)*l])],Math.max(1.6,.16*k),{taper:.3,wobble:0});
 const hp=new Path2D();hp.addPath(hand(TAU*(4.5/12),.8));hp.addPath(hand(TAU*(tt/60+.5),1.2));s.fill(K,hp,.95);
}
/** the goal at x = 0: posts, bar, a box net held by stanchions; `net` displaces the mesh for the ripple */
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
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.55*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the ball (2000: a white Premier League ball — design illustrative): paper, navy panels, a red accent, a blue shade =================
const BALL_R=.11;
function whiteBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);if(duo)s.fill(Y,disc,.2);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
 // three curved triangular panels turning with the spin, and one accent swoosh
 const pan=new Path2D(),acc=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,cx=Math.cos(a)*r*.58,cy=Math.sin(a)*r*.58*Math.cos(spin*.6);const tri:Pt[]=[];for(let j=0;j<3;j++){const b=a+j*TAU/3+.3;tri.push([cx+Math.cos(b)*r*.3,cy+Math.sin(b)*r*.3]);}pan.addPath(polyPath(tri,true));}
 const aa=spin*.8;acc.addPath(ribbon([[Math.cos(aa)*r*.1,Math.sin(aa)*r*.1],[Math.cos(aa+.9)*r*.45,Math.sin(aa+.9)*r*.45],[Math.cos(aa+1.8)*r*.2,Math.sin(aa+1.8)*r*.2]],Math.max(2,r*.16),{taper:.6,wobble:0}));
 s.fill(K,pan,.95);if(!duo)s.fill(R,acc,.95);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (2000–01) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.32],[R,.2]],SKIN_M:AthleteStyle['skin']=[[Y,.42],[R,.3],[B,.1]],SKIN_D:AthleteStyle['skin']=[[R,.42],[Y,.5],[K,.22]];
/** a kit for this film: athlete.ts has one shirt ink, so Arsenal's white sleeves are printed by the adapter (whiteSleeves) */
type Kit=AthleteStyle&{whiteSleeves?:boolean};
const ARS=(o:Partial<Kit>={}):Kit=>({shirt:R,shorts:'paper',socks:'paper',trim:R,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',whiteSleeves:true,...o});
const UTD=(n:number,o:Partial<Kit>={}):Kit=>({shirt:'paper',shorts:[K,.88],socks:'paper',trim:K,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:30+n,...o});
const HENRY:Kit=ARS({number:14,numberInk:'paper',skin:SKIN_D,hair:[K,.9],hairStyle:'short',build:{height:1.88,bulk:.95,thighs:1.02},seed:14});
const IRWIN:Kit=UTD(3,{hair:[K,.7],build:{height:1.73,bulk:1.02}});
const BARTHEZ:Kit={shirt:[B,.85],shorts:[K,.8],socks:[B,.85],boots:K,skin:SKIN_L,hair:null,hairStyle:'bald',gloves:[Y,.9],line:K,sleeves:'long',shade:[K,.26],build:{height:1.8},seed:22};
const REF:Kit={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_L,hair:[K,.6],hairStyle:'balding',line:K,sleeves:'short',seed:33};
/** duotone versions for the lesson chapter (navy + yellow only; Henry keeps his paper sleeves) */
const duo=(st:Kit,lead=false):Kit=>({...st,shirt:lead?[K,.45]:[Y,.6],shorts:lead?'paper':[K,.32],socks:lead?'paper':[Y,.6],trim:lead?'paper':K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[K,.9]:K,shade:[K,.2],numberInk:lead?'paper':K});
/** a halftone echo print of a pose (chronophotograph stamps in the lesson) */
const ECHO:Kit={shirt:[Y,.45],shorts:[Y,.3],socks:[Y,.3],boots:[K,.6],skin:[[Y,.3]],hair:[K,.5],line:K,shade:null,shadow:false,lineWeight:.8,detail:'low',sleeves:'short',seed:99};

/** Arsenal's white sleeves: a paper knockout over each upper arm, narrowed so the key line survives; an arm printed BEHIND the torso is
 * clipped to outside the torso so the red shirt never gets a hole. ≤ 3 ops per Arsenal figure. */
function whiteSleeves(s:Sheet,r:DrawResult,c:Camera,st:AthleteStyle){
 const sk=r.sk,ppu=pxPer(s),lw=clamp(r.heightPx*.0115,.9,3.6)*(st.lineWeight??1)/ppu,b=st.build?.bulk??1,dC=depthOf(c,sk.chest);
 const front=new Path2D(),back=new Path2D();let nf=0,nb=0;
 for(const sd of['l','r'] as const){const sh=sk[sd==='l'?'lSh':'rSh'],el=sk[sd==='l'?'lEl':'rEl'],a=mix3(sh,el,.1),e=mix3(sh,el,.5),m=mix3(sh,el,.3);
  const pa=P(c,a),pe=P(c,e),w=(.128*b*sk.s*kAt(c,m)-lw*(r.detail==='low'?2.2:1.7))/2;if(w*ppu<.7)continue;
  const dx=pe[0]-pa[0],dy=pe[1]-pa[1],l=Math.hypot(dx,dy);if(l<1e-6)continue;const nx=-dy/l*w,ny=dx/l*w,ang=Math.atan2(dy,dx),q:Pt[]=[[pa[0]+nx,pa[1]+ny]];
  for(let i=0;i<=6;i++){const t=ang+Math.PI/2-i/6*Math.PI;q.push([pe[0]+Math.cos(t)*w,pe[1]+Math.sin(t)*w]);}q.push([pa[0]-nx,pa[1]-ny]);
  if(depthOf(c,m)>dC+.03){back.addPath(polyPath(q,true));nb++;}else{front.addPath(polyPath(q,true));nf++;}}
 if(nf)s.knockout(front);
 if(nb){const J=r.joints,rad=.12*sk.s*kAt(c,sk.chest),pts:Pt[]=[];for(const j of [J.lSh,J.rSh,J.neck,J.chest,J.pelvis,J.lHip,J.rHip])for(let i=0;i<8;i++)pts.push([j[0]+Math.cos(i/8*TAU)*rad,j[1]+Math.sin(i/8*TAU)*rad]);
  const out=new Path2D();out.rect(-1e5,-1e5,2e5,2e5);out.addPath(polyPath(hull2(pts),true));s.save();s.clip(out,'evenodd');s.knockout(back);s.restore();}
}
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}){
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 const r=drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
 if(style.whiteSleeves)whiteSleeves(s,r,c,st);
 return r;
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Grimandi's pass) =================
const G=9.81;
const HB:Build=HENRY.build!;
const KICK:V3=[-37.4,.11,8.6];// the free kick, out on the right
const HP:[number,number]=[-21.4,2.4];// Henry receives ≈ 21 m out, back to goal
const YH=YAW(KICK[0]-HP[0],KICK[2]-HP[1]);// facing the pass
const TP=1.2,TFL=TP;// the pass rolls 1.2 s; the flick is the first touch
type MKey=[number,number,number];// τ, x, z
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** idle: a standing body that breathes and looks around (never a frozen hold) */
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
/** a running body: stride phase from distance run, speed from velocity, facing the run (or the ball when still) */
function runner(p:MKey[],tau:number,look:V3,seed=0,rest?:Pose):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp)+seed*.37,{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(rest??idle(tau,seed),run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}

// ---- Henry: drift in → wait, back to goal → right-foot flick (first touch) → spin over his left shoulder → right-foot volley → celebrate ----
const FLK=.36;// flick half-window, contact at its middle
const FLICK_KEYS:[number,Pose][]=[
 [0,posed({lHipF:22,rHipF:18,lKnee:32,rKnee:30,lean:14,lShA:30,rShA:34,lElb:40,rElb:40,neckP:24})],
 [.3,posed({lHipF:18,lKnee:32,rHipF:-8,rKnee:62,rAnk:26,lean:12,lShA:46,rShA:40,lElb:36,rElb:36,neckP:32,bend:-6})],
 [.5,posed({lHipF:14,lKnee:30,lAnk:6,rHipF:34,rKnee:32,rAnk:-24,lean:3,lShA:54,rShA:48,lShF:-10,rShF:14,lElb:34,rElb:30,neckP:26,twist:6})],
 [.75,posed({lHipF:10,lKnee:28,rHipF:48,rKnee:40,rAnk:-8,lean:-6,twist:16,lShA:60,rShA:42,lElb:36,rElb:40,neckP:-12,neckY:18})],
 [1,posed({lHipF:16,lKnee:36,rHipF:14,rKnee:64,rAnk:22,lean:4,twist:22,lShA:62,rShA:36,lElb:40,rElb:50,neckP:-20,neckY:28})],
];
const flickSk=solve(keyPoses(.5,FLICK_KEYS),HB,{x:HP[0],z:HP[1],yaw:YH});
const REC:V3=[flickSk.rToe[0],.11,flickSk.rToe[2]];// where the pass meets the right boot
const APEX=2.1;// the flick: up to about head height
const V_AIM:[number,number]=[HP[0]+1.0,HP[1]-.6];// where it drops beside him after the spin
const NET_TO:V3=[0,2.12,-2.95];// the top corner (the far post from the main camera)
const VOL=(u:number)=>volley(u,{foot:'r',height:.42});
const YV=YAW(NET_TO[0]-V_AIM[0],NET_TO[2]-V_AIM[1])+24*D2R;
const VOL_SK=solve(VOL(.5),HB,{yaw:YV});
const V_HIT:V3=[V_AIM[0],VOL_SK.rToe[1]+.1,V_AIM[1]];
const PV:[number,number]=[V_AIM[0]-VOL_SK.rToe[0],V_AIM[1]-VOL_SK.rToe[2]];
const UP=Math.sqrt(2*G*(APEX-REC[1])),FL=UP/G+Math.sqrt(2*(APEX-V_HIT[1])/G),TV=TFL+FL;
const SHT=1.15,T_GOAL=TV+SHT;
/** the spin: body yaw from facing the pass to the volley's side-on start, turning LEFT (unwrapped so it never takes the short way round) */
const YEND=(()=>{let y=YV-62*D2R;while(y<YH)y+=TAU;return y;})();
const spinU=(t:number)=>sm(TFL+.06,TV-.5,t,easeInOutSine);
const spinPlace=(t:number):Place=>{const u=spinU(t);return{x:lerp(HP[0],PV[0],u),z:lerp(HP[1],PV[1],u),yaw:lerp(YH,YEND,u)};};
const SPIN_KEYS:[number,Pose][]=[
 [0,FLICK_KEYS[4][1]],
 [.5,posed({lHipF:12,lKnee:36,lAnk:10,rHipF:24,rKnee:74,rAnk:30,rHipA:22,lean:4,twist:18,lShA:70,rShA:54,lElb:34,rElb:40,neckP:-26,neckY:26,air:.03})],
 [1,{...VOL(0),yaw:0}],
];
const CELEB:MKey[]=[[TV+.5,PV[0],PV[1]],[TV+1.5,PV[0]+2.6,PV[1]+3.2],[TV+2.4,PV[0]+3.4,PV[1]+5.4]];
type Seg=[number,(t:number)=>{pose:Pose;place:Place}];
const HENRY_SEGS:Seg[]=[
 [-99,t=>runner([[-10,-24.6,5.4],[-6,-23.4,4.2],[-2.2,HP[0],HP[1]]],t,[KICK[0],0,KICK[2]],2,FLICK_KEYS[0][1])],
 [TFL-FLK,t=>({pose:keyPoses(clamp((t-(TFL-FLK))/(2*FLK)),FLICK_KEYS),place:spinPlace(t)})],
 [TFL+FLK,t=>({pose:keyPoses(clamp((t-(TFL+FLK))/Math.max(.05,TV-.5-(TFL+FLK))),SPIN_KEYS),place:spinPlace(t)})],
 [TV-.5,t=>({pose:VOL(clamp((t-(TV-.5))/1)),place:{x:PV[0],z:PV[1],yaw:YV}})],
 [TV+.5,t=>{const q=pathPos(CELEB,t),v=Math.hypot(q.vx,q.vz);return{pose:celebrate(Math.max(0,q.dist)/3,{kind:'run'}),place:{x:q.x,z:q.z,yaw:v>.3?YAW(q.vx,q.vz):YAW(CELEB[2][1]-CELEB[1][1],CELEB[2][2]-CELEB[1][2])}};}],
 [TV+2.4,t=>{const e=CELEB[CELEB.length-1];return{pose:celebrate(Math.max(0,t-TV-2.4)/.9,{kind:'arms'}),place:{x:e[1],z:e[2],yaw:YAW(CELEB[2][1]-CELEB[1][1],CELEB[2][2]-CELEB[1][2])}};}],
];
/** Henry at τ: the active segment, crossfaded (both evaluated at τ) over ±.1 s at every boundary so no pose pops */
function henryAt(tau:number):{pose:Pose;place:Place}{
 let i=0;while(i+1<HENRY_SEGS.length&&tau>=HENRY_SEGS[i+1][0])i++;
 const mixSeg=(a:number,b:number,u:number)=>{const A=HENRY_SEGS[a][1](tau),Bq=HENRY_SEGS[b][1](tau);return{pose:blendPose(A.pose,Bq.pose,u),place:{x:lerp(A.place.x??0,Bq.place.x??0,u),z:lerp(A.place.z??0,Bq.place.z??0,u),yaw:lerpAng(A.place.yaw??0,Bq.place.yaw??0,u)}};};
 const st=HENRY_SEGS[i][0];if(i>0&&tau<st+.1)return mixSeg(i-1,i,sm(st-.1,st+.1,tau,easeInOutSine));
 const nx=HENRY_SEGS[i+1]?.[0];if(nx!==undefined&&tau>nx-.1)return mixSeg(i,i+1,sm(nx-.1,nx+.1,tau,easeInOutSine));
 return HENRY_SEGS[i][1](tau);}

// ---- the ball: placed for the free kick → firm ground pass → flicked up → volleyed on the drop → dipping curler into the top corner ----
function ballAt(tau:number):V3{
 if(tau<0)return KICK;
 if(tau<TP){const u=tau/TP,e=(1.6*u-.6*u*u);return[lerp(KICK[0],REC[0],e),.11,lerp(KICK[2],REC[2],e)];}
 if(tau<TV){const s=tau-TFL,u=s/FL;return[lerp(REC[0],V_HIT[0],u),REC[1]+UP*s-.5*G*s*s,lerp(REC[2],V_HIT[2],u)];}
 const s=tau-TV;if(s<SHT){const u=s/SHT;return[lerp(V_HIT[0],NET_TO[0],u),lerp(V_HIT[1],NET_TO[1],u)+2.5*4*u*(1-u)*(1-.12*u),lerp(V_HIT[2],NET_TO[2],u)+1.15*Math.sin(Math.PI*u)*(1-.35*u)];}
 const e=s-SHT,u=clamp(e/.16);if(u<1)return mix3(NET_TO,[1.75,1.95,-3.1],easeOut(u));
 const d=clamp((e-.16)/.55),h=1.95*(1-d*d)+.11*d*d;return[1.75-.25*d,Math.max(.11,h)+(d>=1?.08*Math.abs(Math.sin((e-.71)*8))*Math.exp(-(e-.71)*3):0),-3.1+.2*d];}
const NET_HIT:V3=[2,1.95,-3.05];

// ---- everybody else ----
type Actor={style:Kit;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:Kit,p:MKey[],seed:number,rest?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,seed,rest)});
/** Grimandi: stands over the free kick, runs up, passes with the right foot (contact at τ = 0), jogs on */
const YG=YAW(REC[0]-KICK[0],REC[2]-KICK[2]);
const GR_SK=solve(strike(STRIKE_CONTACT,{power:.55}),{},{yaw:YG});
const GP:[number,number]=[KICK[0]-GR_SK.rToe[0],KICK[2]-GR_SK.rToe[2]];
const [gbx,gbz]=dirOf(YG);
const GRIM:MKey[]=[[-10,GP[0]-gbx*3.2-.8,GP[1]-gbz*3.2+.6],[-1.5,GP[0]-gbx*3.2,GP[1]-gbz*3.2],[-.6,GP[0]-gbx*1.1,GP[1]-gbz*1.1],[.5,GP[0]+gbx*.6,GP[1]+gbz*.6],[5,GP[0]+gbx*9,GP[1]+gbz*6]];
/** Irwin: tight behind Henry, a hand on his back; beaten by the spin, he turns late and watches it go */
const [hfx,hfz]=dirOf(YH);
const IRW:[number,number]=[HP[0]-hfx*.85,HP[1]-hfz*.85];
const IRWIN_PRESS=posed({lHipF:30,rHipF:24,lKnee:40,rKnee:34,lean:18,lShF:62,lShA:14,lElb:16,rShF:20,rShA:30,rElb:50,neckP:10});
const ACTORS:Actor[]=[
 {style:ARS({seed:18,skin:SKIN_M}),at:(t,b)=>{const r=runner(GRIM,t,b,1);if(t>-.7&&t<.7){const u=clamp((t+.62)/1.2);r.pose=blendPose(r.pose,strike(u,{power:.55}),Math.sin(clamp((t+.7)/1.4)*Math.PI));r.place.yaw=YG;}return r;}},// Gilles Grimandi
 {style:IRWIN,at:(t,b)=>{
  if(t<TFL+.1){const r=runner([[-10,-23.4,4.6],[-6,-22.4,3.6],[-2,IRW[0],IRW[1]]],t,b,3,IRWIN_PRESS);if(t>-2)r.place.yaw=lerpAng(r.place.yaw??0,YH,sm(-2,-1.4,t));return r;}
  const u=sm(TFL+.1,TV+.2,t),x=lerp(IRW[0],IRW[0]+.5,u),z=lerp(IRW[1],IRW[1]-.7,u),look=YAW(b[0]-x,b[2]-z);
  return{pose:blendPose(IRWIN_PRESS,{...backpedal(t*2.2),neckP:-26*D2R},u),place:{x,z,yaw:lerpAng(YH,look,sm(TFL+.2,TV,t))}};}},// Denis Irwin
 mover(UTD(16,{skin:SKIN_L,hair:[K,.8]}),[[-10,-28.6,8],[-2,-27.5,6.5],[TFL,-25.4,4.8],[TV+.4,-23.6,3.8]],4),// Roy Keane, closing
 mover(UTD(6,{hair:null,hairStyle:'bald',build:{height:1.91,bulk:1.12}}),[[-10,-15.6,1.6],[TFL,-14.8,1.2],[T_GOAL+1,-13.4,1]],5,backpedal(0)),// Jaap Stam
 mover(UTD(2,{hair:[K,.8]}),[[-10,-18,-8.4],[TV,-16.6,-6.8]],6,backpedal(0)),// Gary Neville
 mover(UTD(7,{hair:[Y,.7]}),[[-10,-32.6,14],[-1,-32.4,13.6],[TV,-29.6,11.4]],7),// David Beckham, ten yards from the free kick
 mover(ARS({seed:8,skin:SKIN_L}),[[-10,-30,-3.4],[0,-27,-5],[TV,-22.4,-6.6],[T_GOAL+2,-16,-4]],8),// Freddie Ljungberg, running into the box
 mover(ARS({seed:4,skin:SKIN_D,build:{height:1.92,bulk:.96}}),[[-10,-45,-2],[TV,-39,-1]],9),// Patrick Vieira
 {style:BARTHEZ,at:(t,b)=>{const q=pathPos([[-10,-2.8,.9],[TFL,-3.1,.6],[TV,-3.3,.2]],t),yaw=YAW(b[0]-q.x,b[2]-q.z);// Fabien Barthez: set, then rooted as it loops over
  const look=posed({lHipF:34,rHipF:30,lKnee:40,rKnee:34,lean:-4,pitch:-3,lShA:44,rShA:40,lShF:70,rShF:62,lElb:34,rElb:40,neckP:-42,neckY:-10,lHand:1,rHand:1,dx:-.25});
  return{pose:blendPose(keeperSet(t*1.6),look,sm(TV+.25,TV+.85,t)),place:{x:q.x,z:q.z,yaw:t<TV+.2?yaw:lerpAng(YAW(V_HIT[0]-q.x,V_HIT[2]-q.z),YAW(NET_TO[0]-q.x+2,NET_TO[2]-q.z),sm(TV+.6,T_GOAL+.3,t)*.5)}};}},
 mover(REF,[[-10,-43,15],[0,-38,13],[TV,-32,12]],10),// the referee
];
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Henry with motion smear + secondary motion; `cap` limits figure detail
 * (passages), small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean;skip?:number[]}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s);
 const put=(style:Kit,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(style===HENRY?1:3.4))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&style!==HENRY&&hPx<34)return;const detail:Detail|undefined=hPx<62||(o.cap&&style!==HENRY&&hPx<150)?'low':o.cap?'mid':undefined;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev,smear:smear&&!o.cap,detail})});};
 ACTORS.forEach((a,i)=>{if(!o.skip?.includes(i))put(a.style,a.at(tp,bp));});
 const he=henryAt(tp);put(HENRY,he,o.hero?henryAt(tp-1/12):undefined,!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  whiteBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,henry:he};}

// ================= chapter 1 (live, real time): the high main-stand camera; the free kick, the flick, the spin, the volley, the net =================
const ch1q=()=>({ar:T(0,'Arsenal'),mu:T(0,'Manchester United'),th:T(0,'Thierry Henry'),fg:T(0,'far from goal'),bk:T(0,'back to it'),de:T(0,'a defender'),here:T(0,'Here comes the pass'),lk:T(0,'Look at this'),g:T(0,'goal'),end:SEC(0)});
/** the lead-in: τ = t − TL. The goal crosses the line on "goal" when the voice allows, the pass always rolls on "Here comes the pass". */
const ch1T=()=>{const q=ch1q(),TL=clamp(q.g-T_GOAL+.1,q.here-.3,Math.max(q.here-.3,Math.min(q.here+.8,q.end-T_GOAL-1.3)));return{TL,end:q.end};};
const BCAM:V3=[-30,17.5,47];
/** before the pass the director's camera tells the story with the words: stadium → the teams → Henry → his back to goal → the defender */
function ch1Pre(t:number):V3{const q=ch1q(),v=key(t,mono([[0,-46,6,-24],[q.ar,-34,2,-4],[q.th,HP[0]+.5,1.2,HP[1]],[q.bk,HP[0]+4,1.2,HP[1]-.6],[q.de+.2,HP[0]+.3,1.1,HP[1]-.2],[q.here-.2,-29,1,5.5]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
function ch1Play(tau:number):V3{const b=ballAt(tau);
 if(tau<TFL){const u=sm(-.2,TFL,tau);return mix3([-29,1,5.5],[lerp(b[0],HP[0],.55),1.2,lerp(b[2],HP[1],.55)],u);}
 if(tau<TV)return[lerp(HP[0],b[0],.35)+.4,1.3,lerp(HP[1],b[2],.35)];
 return mix3([lerp(V_HIT[0],b[0],.6),1.4,lerp(V_HIT[2],b[2],.6)],[-3,1.4,-1.4],sm(TV+.4,T_GOAL,tau));}
function ch1Cam(t:number){const q=ch1q(),{TL}=ch1T(),tau=t-TL,w=sm(TL-1.4,TL-.1,t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.2),c=f(tau-.4);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const look=mix3(ch1Pre(t),av(ch1Play),w);
 const F=key(t,mono([[0,2300],[q.ar,2900],[q.th,7200],[q.de+.3,8400],[TL-1.3,4400],[TL+TFL-.35,6200],[TL+TV-.1,6000],[TL+TV+.45,4200],[TL+T_GOAL+.3,5000],[q.end,5400]]),easeInOutSine);return cam(BCAM,look,F);}
/** team rings: on "Arsenal" red rings print round the red shirts, on "Manchester United" navy rings round the white ones */
function teamRings(s:Sheet,c:Camera,tp:number,t:number){
 const q=ch1q(),ra=sm(q.ar,q.ar+.3,t,easeOutBack)*(1-sm(q.mu+.2,q.mu+.8,t)),ru=sm(q.mu,q.mu+.3,t,easeOutBack)*(1-sm(q.th,q.th+.6,t)),rd=sm(q.de,q.de+.3,t,easeOutBack)*(1-sm(q.here,q.here+.5,t));
 if(ra<.02&&ru<.02&&rd<.02)return;const bp=ballAt(tp),pa=new Path2D(),pu=new Path2D(),pd=new Path2D();
 const ring=(path:Path2D,x:number,z:number,g:number)=>{const q=groundRing(c,x,z,.9*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.6}));};
 ACTORS.forEach(a=>{const p=a.at(tp,bp).place,isArs=a.style.whiteSleeves,isUtd=a.style.shirt==='paper';if(isArs&&ra>.02)ring(pa,p.x??0,p.z??0,ra);if(isUtd&&ru>.02)ring(pu,p.x??0,p.z??0,ru);});
 const h=henryAt(tp).place;if(ra>.02)ring(pa,h.x??0,h.z??0,ra);
 if(rd>.02){const p=ACTORS[1].at(tp,bp).place;ring(pd,p.x??0,p.z??0,rd*1.2);}
 s.fill(R,pa,.95);s.fill(K,pu,.9);yInk(s,pd,.95);
}
const ch1:Scene={
 draw(s,t){const q=ch1q(),{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),goalIn=t-TL-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  teamRings(s,c,tt-TL,t);
  // "far from goal" / "back to it": a dotted chalk line from Henry's heels back to the goal behind him
  const bl=sm(q.fg,q.fg+.8,t)*(1-sm(q.here-.3,q.here+.2,t));if(bl>.02){const pts:Pt[]=[];for(let i=0;i<=24;i++){const u=i/24*bl,p:V3=[lerp(HP[0]+.7,-.3,u),.03,lerp(HP[1]-.1,0,u)];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   if(pts.length>1){const w=Math.max(10,.3*kAt(c,[HP[0],0,HP[1]])),gaps:[number,number][]=[];for(let x=.06;x<1;x+=.1)gaps.push([x,x+.04]);yInk(s,ribbon(pts,w,{taper:.1,wobble:1,gaps}),.95);
    const e=pts[pts.length-1],d=pts[pts.length-2],a=Math.atan2(e[1]-d[1],e[0]-d[0]);yInk(s,polyPath([[e[0]+Math.cos(a)*w*2.2,e[1]+Math.sin(a)*w*2.2],[e[0]+Math.cos(a+2.4)*w*1.7,e[1]+Math.sin(a+2.4)*w*1.7],[e[0]+Math.cos(a-2.4)*w*1.7,e[1]+Math.sin(a-2.4)*w*1.7]],true),.95);}}
  drawWorld(s,c,t-TL,tt-TL,{ballMin:14,cap:t>q.end-.7});},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, low and close, orbiting Henry): the flick, the spin, the volley before it lands =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),f:T(1,'Henry flicks'),rf:T(1,'right foot'),sp:T(1,'spins round'),v:T(1,'volleys it'),b:T(1,'before it lands'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,TFL-1.0],[q.f+.25,TFL],[q.rf+.35,TFL+.3],[q.sp+.6,TV-.45],[q.v+.3,TV],[q.b+.6,TV+.4],[q.end,TV+.7]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),b=ballAt(tau),orbit=sm(q.rf,q.v+.2,t,easeInOutSine),ang=YH-.35+1.25*orbit,[fx,fz]=dirOf(ang),D=lerp(7.2,6.2,sm(0,q.sl+.5,t))+.8*sm(q.v,q.end,t);
 const body:V3=[lerp(HP[0],PV[0],orbit),1.0,lerp(HP[1],PV[1],orbit)],pos:V3=[body[0]+fx*D,.95+.25*sm(q.v,q.end,t),body[2]+fz*D];
 const w=key(t,mono([[0,.75],[q.f,.6],[q.rf+.3,.5],[q.v,.6],[q.b+.3,.55],[q.end,.6]])),F=key(t,mono([[0,1300],[q.sl,1600],[q.rf,1850],[q.sp+.4,1650],[q.v+.2,1500],[q.end,1150]]));
 return cam(pos,mix3([b[0],Math.min(b[1],2.4),b[2]],body,w),F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.05});
  // "spins round": a yellow arc printed on the grass round his feet, drawing itself as he turns (over his left shoulder)
  const sp=sm(q.sp-.1,q.sp+.9,tt)*(1-sm(q.b+.4,q.b+1.1,tt));
  if(sp>.02){const cx=lerp(HP[0],PV[0],.5),cz=lerp(HP[1],PV[1],.5),pts:Pt[]=[];for(let i=0;i<=24;i++){const a=YH+Math.PI+(i/24)*2.6*clamp(sm(q.sp-.1,q.sp+.9,tt)),p:V3=[cx+Math.cos(a)*1.25,.02,cz-Math.sin(a)*1.25];if(depthOf(c,p)<NEAR)continue;pts.push(P(c,p));}
   if(pts.length>2){const w=Math.max(8,.1*kAt(c,[cx,0,cz]));yInk(s,ribbon(pts,w,{taper:.2,wobble:1}),.95*sp);const e=pts[pts.length-1],d=pts[pts.length-2],a=Math.atan2(e[1]-d[1],e[0]-d[0]);yInk(s,polyPath([[e[0]+Math.cos(a)*w*2,e[1]+Math.sin(a)*w*2],[e[0]+Math.cos(a+2.3)*w*1.6,e[1]+Math.sin(a+2.3)*w*1.6],[e[0]+Math.cos(a-2.3)*w*1.6,e[1]+Math.sin(a-2.3)*w*1.6]],true),.95*sp);}}
  // "before it lands": the ball's shadow on the grass with a drop line — it never reaches it
  const bl=sm(q.sp,q.sp+.4,tt)*(1-sm(q.v+.2,q.v+.6,tt));const w=drawWorld(s,c,tau,tp,{ballMin:30,hero:true,glow:sm(q.f-.1,q.f+.3,tt)*(1-sm(q.sp,q.sp+.5,tt)),cap:t>q.end-.7});
  if(bl>.02&&w.ball[1]>.3){const g=groundRing(c,w.ball[0],w.ball[2],.3,20);if(g.length>2)yInk(s,ribbon(g,Math.max(5,.07*kAt(c,w.ball)),{close:true,taper:0,wobble:.5}),.9*bl);
   const a=P(c,w.ball),b=P(c,[w.ball[0],.05,w.ball[2]]),gaps:[number,number][]=[];for(let x=.08;x<1;x+=.16)gaps.push([x,x+.08]);yInk(s,ribbon([a,b],Math.max(4,.035*kAt(c,w.ball)),{taper:0,wobble:0,gaps}),.9*bl);}
  // "right foot": a yellow ring flashes round his right boot at the flick
  const rf=sm(q.f+.1,q.f+.35,tt,easeOutBack)*(1-sm(q.sp,q.sp+.4,tt));if(rf>.02){const sk=solve(w.henry.pose,HB,w.henry.place),p=P(c,sk.rToe),r=.34*kAt(c,sk.rToe)*rf;yRing(s,p[0],p[1],r,Math.max(5,.04*kAt(c,sk.rToe)));}
  // the volley: sparks at the contact, speed lines as the ball leaves
  if(tp>=TV&&tp<TV+.25){const p=P(c,V_HIT);sparkBurst(s,Y,p[0],p[1],110+110*sm(TV,TV+.1,tp,easeOut),{n:10,seed:14,g:1-sm(TV+.1,TV+.25,tp),width:12});}
  if(tp>=TV&&tp<TV+.6){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:15,len:160,width:7,cov:.85});}
 },
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(26,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5.5,
};

// ================= chapter 3 (replay from behind the goal, low through the net): the loop over Barthez, the dip, the top corner, the crowd =================
const ch3q=()=>({bg:T(2,'From behind'),lo:T(2,'loop over Barthez'),di:T(2,'dip into'),tc:T(2,'top corner'),og:T(2,'The only goal'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,TV-.3],[q.lo+.1,TV+.25],[q.di+.1,TV+.8],[q.tc+.25,T_GOAL+.02],[q.og+.1,T_GOAL+.8],[q.end,T_GOAL+.8+(q.end-q.og-.1)*.9]]),x=>x);};
const GCAM:V3=[6.4,2.1,1.8];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.min(tau,T_GOAL-.02));
 const toBall=sm(q.bg,q.lo+.3,t,easeInOutSine),toFans=sm(q.og-.1,q.og+1.2,t,easeInOutSine);
 const look0:V3=[HP[0],1.3,HP[1]-.4],look1:V3=[b[0],clamp(b[1],1,3.4),b[2]],look2:V3=[PV[0]+3.2,1.4,PV[1]+4.6];
 const look=mix3(mix3(look0,look1,toBall*(1-.35*sm(q.tc,q.tc+.4,t))),look2,toFans);
 const pos:V3=add(GCAM,[.4*toFans,.6*toFans,.8*toFans]),F=key(t,mono([[0,3000],[q.lo,2300],[q.di,1800],[q.tc+.3,1500],[q.og,1500],[q.og+1.2,3800],[q.end,4200]]));return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.tc+.25;
  const shake=t>=hitT?7*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.12+1.1*sm(0,.5,goalIn),flash:.1+1.4*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "loop over Barthez": his reach — a dashed line up from his gloves to the top of his jump — and the ball sailing above it
  const reach=sm(q.lo,q.lo+.35,tt,easeOutBack)*(1-sm(q.tc,q.tc+.5,tt));
  const w=drawWorld(s,c,tau,tp,{ballMin:34,hero:false,cap:t>q.end-.7||t<.75,skip:[5,7,9]});
  if(reach>.02){const bk=ACTORS[8].at(tp,ballAt(tp)).place,x=bk.x??0,z=bk.z??0,a=P(c,[x,2.05,z]),b=P(c,[x,2.05+.6*reach,z]),gaps:[number,number][]=[];for(let u=.1;u<1;u+=.22)gaps.push([u,u+.1]);
   const k=kAt(c,[x,2,z]);yInk(s,ribbon([a,b],Math.max(6,.07*k),{taper:0,wobble:0,gaps}),.95);yInk(s,ribbon([[b[0]-.3*k,b[1]],[b[0]+.3*k,b[1]]],Math.max(6,.07*k),{taper:.2,wobble:0}),.95);}
  // the ball's path: dotted ink while it hangs in the air
  if(tp>TV&&tp<T_GOAL+.3){const dots=new Path2D();for(let i=0;i<=18;i++){const t2=TV+(Math.min(tp,T_GOAL)-TV)*i/18,p=ballAt(t2);if(depthOf(c,p)<NEAR+.5)continue;const pp=P(c,p),r=clamp(.045*kAt(c,p),4,14);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);}s.fill(K,dots,.6);}
  // "dip into": speed lines as it drops; "top corner": a yellow corner bracket printed in the angle of post and bar
  if(tp>TV+.6&&tp<T_GOAL+.1&&depthOf(c,w.ball)>NEAR+.6){const a=P(c,ballAt(tp-.06)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:21,len:170,width:7,cov:.8});}
  const br=sm(q.tc,q.tc+.3,tt,easeOutBack)*(1-sm(q.og+.6,q.og+1.4,tt));if(br>.02){const C0:V3=[0,2.44,-3.66],k=kAt(c,C0),a=P(c,[0,2.44-.9*br,-3.66]),m=P(c,C0),b=P(c,[0,2.44,-3.66+.9*br]);yInk(s,ribbon([a,m,b],Math.max(8,.14*k),{taper:.1,wobble:1}),.95);}
 },
 aperture(t){const c=ch3Cam(t),tau=tau3(t),p=ballAt(tau);let x:number,y:number;if(depthOf(c,p)>NEAR+.6){[x,y]=P(c,p);}else{x=0;y=0;}const r=Math.max(22,Math.min(160,BALL_R*kAt(c,p)));return apertureDisc(x,y,r*.92,12);},
 still:4.2,
};

// ================= chapter 4 (duotone lesson): the first touch sets up the shot — flick, turn, strike, printed as one movement =================
const ch4q=()=>({a:T(3,'A clever first touch'),su:T(3,'set up your shot'),fl:T(3,'Flick'),tu:T(3,'turn'),st:T(3,'strike'),om:T(3,'one smooth movement'),end:SEC(3)});
/** lesson clock: the pass rolls in slowly under "A clever first touch", the move itself runs at real speed from "Flick" to "strike" */
const tau4=(t:number)=>{const q=ch4q(),stT=Math.max(q.st,q.fl+.6);return key(t,mono([[0,-.4],[q.a,0],[q.fl,TFL],[stT,TV],[stT+1.2,TV+1.2],[q.end,TV+1.2+(q.end-stT-1.2)*.5]]),x=>x);};
const HENRY4=duo(HENRY,true),IRWIN4=duo(IRWIN);
const LCAM=(t:number)=>{const q=ch4q(),v=key(t,mono([[0,-2.6,1.5,9.4,2300],[q.a,-2.2,1.3,8.2,2900],[q.su,-1.4,1.4,8.8,2600],[q.fl,-.8,1.1,8.2,3000],[q.st,.4,1.2,8.6,2800],[q.om,.8,1.6,9.6,2200],[q.end,1,1.7,10,2100]]),easeInOutSine,true);
 return cam([HP[0]+v[0],v[1],HP[1]+v[2]],[HP[0]+v[0]*.6+.4,1.05,HP[1]-.2],v[3]);};
/** the three stamps: the flick at contact, the spin half way, the volley at contact */
const STAMPS:[number,number][]=[[TFL,0],[(TFL+.36+TV-.5)/2+.12,1],[TV,2]];
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  // the stage: a navy print, the ground as stepped yellow light round Henry, a paper lane toward goal
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[HP[0]-40,0,HP[1]-30],[HP[0]+40,0,HP[1]-30],[HP[0]+40,0,HP[1]+6],[HP[0]-40,0,HP[1]+6]]));s.tone(K,floor,.2);
  const pool=(r:number)=>{const g=groundRing(c,HP[0]+.4,HP[1]-.3,r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(5.5),.2);s.tone(Y,pool(3.2),.2);s.tone(Y,pool(1.7),.32);
  // "set up your shot": the plan — a dotted arc from the boot up and round to where he will strike, and a target ring in the air
  const plan=sm(q.su,q.su+.6,tt)*(1-sm(q.st+.2,q.st+.6,tt));
  if(plan>.02){const dots=new Path2D(),n=Math.round(16*plan);for(let i=0;i<=n;i++){const u=i/16,s2=u*FL,p:V3=[lerp(REC[0],V_HIT[0],u),REC[1]+UP*s2-.5*G*s2*s2,lerp(REC[2],V_HIT[2],u)],pp=P(c,p);dots.moveTo(pp[0]+8,pp[1]);dots.arc(pp[0],pp[1],8,0,TAU);}yInk(s,dots,.95);
   const tg=P(c,V_HIT),r=.3*kAt(c,V_HIT)*sm(q.su+.3,q.su+.8,tt,easeOutBack);if(r>1)yRing(s,tg[0],tg[1],r,Math.max(6,.035*kAt(c,V_HIT)));}
  // chronophotograph: at "Flick", "turn" and "strike" the body leaves a short-lived halftone echo print of that instant; on "one smooth
  // movement" the three instants print side by side as a strip (flick → turn → strike) tied by one yellow ribbon through the ball
  const cues=[q.fl,q.tu,q.st],om=sm(q.om,q.om+1.1,tt,easeOut),strip=tt>=q.om;
  if(!strip)STAMPS.forEach(([ts,i])=>{if(tp<ts||tt>cues[i]+1.1)return;const h=henryAt(ts);drawPlayer(s,h.pose,c,ECHO,h.place,{detail:'low'});});
  const items:Item[]=[],ib=ballAt(tp),h=henryAt(tp),hp=henryAt(tp-1/12);
  if(strip){const R3:V3=[c.r[0],0,c.r[2]],sp=2.1*Math.min(1,LENS+.1)*easeOutBack(clamp((tt-q.om)/.6));
   const shift=(p:V3,i:number):V3=>add(p,mul(R3,(i-1)*sp)),pts:Pt[]=[];
   STAMPS.forEach(([ts,i])=>{const hh=henryAt(ts),pl=hh.place,g=shift([pl.x??0,0,pl.z??0],i),pop=sm(q.om+i*.22,q.om+i*.22+.3,tt,easeOutBack);if(pop<.02)return;
    const place:Place={x:g[0],z:g[2],yaw:pl.yaw};items.push({depth:depthOf(c,g),draw:()=>{drawPlayer(s,hh.pose,c,HENRY4,place,{detail:'mid'});const bpp=shift(ballAt(ts),i),bp=P(c,bpp);whiteBall(s,bp[0],bp[1],Math.max(18,BALL_R*kAt(c,bpp)),ts*9,{duo:true});}});});
   for(let k=0;k<=36;k++){const u=k/36*om,seg=u*2,i=Math.min(1,Math.floor(seg)),f=seg-i,ts0=STAMPS[i][0],ts1=STAMPS[i+1][0],tb=lerp(ts0,ts1,f),p=add(ballAt(tb),mul(R3,((i+f)-1)*sp));if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   if(pts.length>1)yInk(s,ribbon(pts,Math.max(10,.07*kAt(c,[HP[0],1,HP[1]])),{taper:.3,wobble:1.2}),.95);}
  else{
   // Irwin as a ghost at his back, Henry live
   const ir=ACTORS[1].at(tp,ib);items.push({depth:depthOf(c,[ir.place.x??0,0,ir.place.z??0]),draw:()=>drawPlayer(s,ir.pose,c,IRWIN4,ir.place,{detail:'mid'})});
   items.push({depth:depthOf(c,[h.place.x??0,0,h.place.z??0]),draw:()=>drawPlayer(s,h.pose,c,HENRY4,h.place,{prev:hp,smear:true})});}
  const bpos=ballAt(tau);if(!strip||tp<TV+1.2)items.push({depth:depthOf(c,bpos),draw:()=>{if(depthOf(c,bpos)<NEAR+.3)return;ballShadow(s,c,bpos);const bp=P(c,bpos),a=P(c,ballAt(tau-.03)),r=Math.max(22,BALL_R*kAt(c,bpos));whiteBall(s,bp[0],bp[1],r,tau*9,{duo:true,sq:clamp(Math.hypot(bp[0]-a[0],bp[1]-a[1])/(r*3),0,.7),dir:Math.atan2(bp[1]-a[1],bp[0]-a[0])});}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  // "A clever first touch": a ring glows round the right boot as the ball arrives
  const ft=sm(q.a+.2,q.a+.6,tt,easeOutBack)*(1-sm(q.fl+.2,q.fl+.5,tt));if(ft>.02){const sk=solve(h.pose,HB,h.place),p=P(c,sk.rToe),r=.32*kAt(c,sk.rToe)*ft;yRing(s,p[0],p[1],r,Math.max(6,.04*kAt(c,sk.rToe)));}
  // the strike: sparks, and the ball flies off toward the goal
  if(tp>=TV&&tp<TV+.25){const p=P(c,V_HIT);sparkBurst(s,Y,p[0],p[1],120,{n:10,seed:41,g:1-sm(TV+.1,TV+.25,tp),width:12});}
  if(tp>=TV&&tp<TV+.7&&depthOf(c,bpos)>NEAR+.5){const a=P(c,ballAt(tp-.05)),b=P(c,ballAt(tp));speedLines(s,Y,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:42,len:170,width:7,cov:.9});}
 },
 still:6,
};

const story:RisoStory={
 id:'henry-flick-2000',format:'11v11',title:"Henry's flick and volley",
 theme:'A clever first touch can set up your shot.',
 ageNote:'Premier League, Arsenal 1–0 Manchester United, Highbury, London, 1 October 2000. The only goal of the game.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a flick — the ball pops up from the point with a yellow ring on the grass. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*170,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*100*g,y+Math.sin(q)*30*g] as Pt;}),true),12,.95);
  if(age>0&&age<.35)sparkBurst(s,Y,x,y-up,120*g,{n:8,seed,g:1-clamp(age/.35),width:11});
  whiteBall(s,x,y-up,52,age*10+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
