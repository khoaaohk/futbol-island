/** Iconic play film: Ronaldinho's standing toe-poke, Chelsea 4–2 Barcelona, Champions League last 16 (second leg), Stamford Bridge, London,
 * 8 March 2005. A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/ronaldinho-chelsea-2005/script.json. The lead voices it later with local Kokoro. Until then every
 * chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/ronaldinho-chelsea-2005/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/ronaldinho-chelsea-2005/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026 as raw pages, cached in the session scratchpad films/src-cache/; the footage was not reviewed):
 *  - BBC Sport, "Chelsea 4-2 Barcelona" match report, 8 March 2005 http://news.bbc.co.uk/sport2/hi/football/europe/4321491.stm
 *    ("There seemed no danger when the Brazilian took control 20 yards out, but with a trademark shimmy and no back-lift, he flashed a shot
 *    past a stunned Petr Cech"; seven minutes before the interval; line-ups; att. 41,515; referee Pierluigi Collina)
 *  - BBC Three, Carl Anka, "Noughty Boys: Ronaldinho was a magician, we just stood there gawping" (22 Oct 2018)
 *    https://www.bbc.co.uk/bbcthree/article/b3cf523a-62e5-40af-91c5-49185d3f1579 ("on the edge of the D ... options blocked off by Ricardo
 *    Carvalho, John Terry and Eidur Gudjohnsen. Sensing Frank Lampard bearing down on him from behind, Ronaldinho feinted to shoot twice with
 *    his right foot, shimmed his hips twice ... a no-lift toe punt"; his quote "It's like someone pressed pause and for three seconds all the
 *    players stopped and I'm the only one that moves.")
 *  - Wikipedia, "Ronaldinho" (feinted to shoot, struck with little back-lift past Čech from 20 yards; the toe-poke quote)
 *    https://en.wikipedia.org/wiki/Ronaldinho
 *  - Wikipedia, "2004–05 Chelsea F.C. season" (8 March 2005 19:45, 4–2, agg. 5–4, goals Gudjohnsen 8, Lampard 17, Duff 19, Terry 76;
 *    Ronaldinho 27 pen, 38; Chelsea's home kit "all blue with a white collar", Umbro, "Fly Emirates")
 *  - Wikipedia, "2004–05 FC Barcelona season" and "2004–05 UEFA Champions League knockout stage" (first leg 2–1 Barcelona; Ronaldinho no. 10)
 * CONFIRMED by those pages: 8 March 2005, Stamford Bridge, Champions League last 16 second leg, an evening kick-off (19:45); Chelsea led 3–1
 *  (after 19 minutes they were 3–0 up, Ronaldinho's penalty made it 3–1); the goal came seven minutes before half-time (38'); Ronaldinho, no.
 *  10, took control about 20 yards out on the edge of the D; Carvalho, Terry and Gudjohnsen blocked his options and Lampard came at him from
 *  behind (four Chelsea shirts); he feinted to shoot twice with his RIGHT foot, shimmied his hips twice and toe-poked it with no back-lift past
 *  a stunned Petr Čech; the "pressed pause" quote; Chelsea wore their home blue; referee Collina (famously bald); Chelsea went through 5–4.
 * WIDELY KNOWN, NOT RE-READ THIS SESSION: the shirt numbers Čech 1, Carvalho 6, Lampard 8, Gallas 13, Gudjohnsen 22, Terry 26, Eto'o 9;
 *  Ronaldinho's long curly hair and headband; the Adidas Champions League "starball" design (white with dark stars).
 * INFERRED / ILLUSTRATIVE: Barcelona's change kit that night (drawn yellow shirts, navy shorts, yellow socks — could not be verified, so the
 *  narration never names it); Chelsea's white socks; Čech's keeper kit (drawn red) and Collina's black kit; every position in metres
 *  (Ronaldinho ≈ 19.5 m out, just left of centre); who played the pass and from where (drawn: an unnamed team-mate from his right) and how he
 *  controlled it; the exact rhythm of the feints (≈ 3 s from control to shot, after his quote); which corner (drawn low, inside the post to
 *  Čech's right, the far side from the main camera); Čech's late, small reaction; the celebration; Stamford Bridge drawn as four close
 *  roofed stands with floodlights along the roof fronts and blue seats; the crowd colours; camera placements and lenses.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation
 * on a real clock τ (seconds, τ = 0 Ronaldinho's first touch): ch1 = the high main-stand broadcast camera in real time (the pass, the stand
 * still, the shot, the net); ch2 = the TV slow-motion replay, low and close, orbiting him (two shot feints, the hip shimmy, the defenders
 * frozen, and the replay literally paused before the shot); ch3 = the replay from behind the goal (no back-lift, the toe-poke, past Čech);
 * ch4 = a duotone lesson (a small feint freezes defenders; no big backswing needed; the quick toe-poke surprises the keeper).
 * Seams are forward passages into the ball. The ball's contact points are read from the solved skeleton (right toe) so it always meets the
 * boot. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer() (which also prints his headband). Framing: the world is centred
 * on the CANVAS centre (never sheet.safe) with a lens that widens for a square window (1.45:1 … 1:1). Inks: yellow (floodlights, Barcelona,
 * grass with blue), red (skin, keeper), blue (Chelsea, seats, grass), navy (night sky, key line). Scenes read only their local t; drawn
 * objects pose on twos, cameras on ones; all randomness is seeded. Budget ≈ 150–260 plate ops per frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,stand,strike,lunge,celebrate,keeperSet,keeperDive,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type DrawResult,type Detail} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** a narrower (square) window gets a slightly wider lens so the action still fits; set by frame() */
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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`ronaldinho film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py ronaldinho-chelsea-2005 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/ronaldinho-chelsea-2005/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Stamford Bridge','Stamford Bridge, 2005: Barcelona are losing to Chelsea. Ronaldinho gets the ball twenty yards out, four blue shirts around him. Then... goal!',
  ['Stamford Bridge','Barcelona','Chelsea','Ronaldinho','gets the ball','twenty yards out','four blue shirts','Then','goal']),
 prov('The shimmy','Watch again, slowly. He pretends to shoot, twice, and his hips sway left and right. The defenders freeze, like someone pressed pause!',
  ['Watch again','slowly','pretends to shoot','twice','hips sway','left and right','defenders freeze','pressed pause']),
 prov('Toe-poke','From behind: no big backswing. He pokes it with his toe, past a stunned Petr Čech.',
  ['From behind','no big backswing','pokes it','his toe','past a stunned']),
 prov('Freeze them','A small body feint freezes defenders, and you can score without a big backswing. A quick toe-poke surprises the keeper.',
  ['A small body feint','freezes defenders','score without','big backswing','quick toe-poke','surprises the keeper']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`ronaldinho film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; goal line x = 0, net toward +x, pitch to x = −103) =================
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

/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** a pause symbol (two bars) — "someone pressed pause" — added to a path so many print in one op */
function pauseBars(path:Path2D,x:number,y:number,h:number){const w=h*.3,g=h*.22;for(const dx of[-g-w,g])path.addPath(polyPath([[x+dx,y-h/2],[x+dx+w,y-h/2],[x+dx+w,y+h/2],[x+dx,y+h/2]],true));}
/** a dashed/solid arrow along screen points (the tip is a filled triangle), for yInk */
function arrowPath(pts:Pt[],w:number,gaps?:[number,number][]){const p=ribbon(pts,w,{taper:.1,wobble:.8,gaps});if(pts.length>1){const e=pts[pts.length-1],d=pts[pts.length-2],a=Math.atan2(e[1]-d[1],e[0]-d[0]);p.addPath(polyPath([[e[0]+Math.cos(a)*w*2.2,e[1]+Math.sin(a)*w*2.2],[e[0]+Math.cos(a+2.4)*w*1.7,e[1]+Math.sin(a+2.4)*w*1.7],[e[0]+Math.cos(a-2.4)*w*1.7,e[1]+Math.sin(a-2.4)*w*1.7]],true));}return p;}

// ================= Stamford Bridge at night: four close roofed stands, blue seats, floodlights along the roof fronts =================
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-108,.9,-37],[6,.9,-37],[6,21,-58],[-108,21,-58]],// West Stand (far side, three tiers)
 [[6.5,.9,40],[6.5,.9,-40],[22,14,-40],[22,14,40]],// the end behind the goal Barcelona attack
 [[6,.9,37],[-108,.9,37],[-108,19,56],[6,19,56]],// East Stand (the main stand under the camera)
 [[-109.5,.9,-40],[-109.5,.9,40],[-125,14,40],[-125,14,-40]],// the far end
];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper faces / 1 Chelsea blue / 2 navy coats / 3 yellow (the away end), phase] */
const CROWD=(()=>{const r=rng(2005),out:[number,number,number,number,number][]=[];[640,300,520,300].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r(),v=.04+r()*.9;if(st!==1&&Math.abs(v-.5)<.035)continue;out.push([st,r(),v,st===3&&c<.3?3:c<.42?0:c<.8?1:c<.96?2:3,r()*TAU]);}});return out;})();
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3;/** passages: skip the crowd, rows, stripes and halos (plate-op budget) */lite?:boolean};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t,lite=false}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a March night: a navy field with a blue haze lifting toward the floodlights (stepped screens, never flat black)
 s.field(K,.78,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 [.16,.26].forEach((d,i)=>s.tone(B,polyPath([[-Bnd,hz-120-i*260],[Bnd,hz-120-i*260],[Bnd,hz+900],[-Bnd,hz+900]],true),d));
 // stands: knocked out, blue seats (blue screen + navy), stepped rows; the tier fascias; roofs as navy slabs
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),fascia=new Path2D(),lamps=new Path2D(),halo=new Path2D();
 STANDS.forEach((q,si)=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<14;k+=2)addPoly(rows,clipPoly(c,[bil(q,0,k/14),bil(q,1,k/14),bil(q,1,(k+1)/14),bil(q,0,(k+1)/14)]));
  const lift:V3=[0,3.6,0],over=si===0?[0,0,7]:si===2?[0,0,-7]:si===1?[-6,0,0]:[6,0,0];
  const r0=add(q[3],lift),r1=add(q[2],lift),r2=add(r1,over as V3),r3=add(r0,over as V3);
  addPoly(roof,clipPoly(c,[r0,r1,r2,r3]));
  for(const v of si===1||si===3?[.5]:[.34,.68])addPoly(fascia,clipPoly(c,[bil(q,0,v),bil(q,1,v),bil(q,1,v+.05),bil(q,0,v+.05)]));
  // floodlights: a paper-and-yellow lamp strip under the roof front, and a soft halo round it
  for(let k=0;k<6;k++){const u0=(k+.15)/6,u1=(k+.85)/6,a=mix3(r3,r2,u0),b=mix3(r3,r2,u1),d:V3=[0,-.9,0];const qq=clipPoly(c,[a,b,add(b,d),add(a,d)]);addPoly(lamps,qq);
   const m=mix3(a,b,.5);if(depthOf(c,m)>8){const[x,y]=P(c,m),rr=clamp(2.6*kAt(c,m),14,120);if(Math.abs(x)<Bnd&&Math.abs(y)<Bnd)halo.addPath(polyPath(Array.from({length:14},(_,i)=>[x+Math.cos(i/14*TAU)*rr*1.8,y+Math.sin(i/14*TAU)*rr] as Pt),true));}}});
 s.knockout(stands);s.tone(B,stands,.55);s.tone(K,stands,.3);if(!lite)s.tone(K,rows,.22);
 // crowd heads: faces, Chelsea blue, coats, a yellow away end — bobbing on the twos when they react
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 if(!lite)for(const[st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,4,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.8);if(seen[1])s.fill(B,heads[1],.95);if(seen[2])s.fill(K,heads[2],.9);if(seen[3])s.fill(Y,heads[3],.95);
 // camera flashes (paper sparks on the twos)
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.08+r()*.8);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.fill(K,fascia,.9);s.fill(K,roof,.95);
 if(!lite)s.tone(Y,halo,.2);s.knockout(lamps);s.fill(Y,lamps,.9);
 // advertising boards along the touchlines (blue and paper panels)
 const boardsB=new Path2D(),boardsP=new Path2D();for(const z of[-35.2,35.2])for(let x=-103;x<4;x+=8){const q:V3[]=[[x,0,z],[x+7.6,0,z],[x+7.6,.9,z],[x,.9,z]];addPoly((Math.round(x/8)&1)?boardsB:boardsP,clipPoly(c,q));}
 const boards=new Path2D();boards.addPath(boardsB);boards.addPath(boardsP);s.knockout(boards);s.fill(B,boardsB,.9);
 // grass under the lights: yellow × blue = green, mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-35],[6.5,0,-35],[6.5,0,35],[-110,0,35]]));s.knockout(gp);s.fill(Y,gp,.9);s.tone(B,gp,.55);
 const stripes=new Path2D();for(let x=-103;x<0;x+=10.3)addPoly(stripes,clipPoly(c,[[x,0,-33.5],[x+5.15,0,-33.5],[x+5.15,0,33.5],[x,0,33.5]]));if(!lite)s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-103,-33.5],[0,-33.5]);Ln([-103,33.5],[0,33.5]);Ln([0,-33.5],[0,33.5]);Ln([-51.5,-33.5],[-51.5,33.5]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}// the D
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 goal(s,c,o.net);
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
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the ball (the Champions League "starball": white with dark stars — design illustrative) =================
const BALL_R=.11;
const starPts=(cx:number,cy:number,r:number,a:number):Pt[]=>Array.from({length:10},(_,i)=>{const rr=i%2?r*.45:r,q=a+i/10*TAU;return[cx+Math.cos(q)*rr,cy+Math.sin(q)*rr] as Pt;});
function starBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);if(duo)s.fill(Y,disc,.2);
 s.save();s.clip(disc);
 // shade on the side away from the floodlights, then three stars turning with the spin
 s.tone(duo?K:B,polyPath(Array.from({length:20},(_,i)=>{const a=i/20*TAU;return[Math.cos(a)*r*1.02+r*.34,Math.sin(a)*r*1.02+r*.38] as Pt;}),true),duo?.3:.4);
 const st=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,cx=Math.cos(a)*r*.55,cy=Math.sin(a)*r*.55*Math.cos(spin*.6);st.addPath(polyPath(starPts(cx,cy,r*.34,a),true));}
 s.fill(K,st,.95);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (2004–05) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.32],[R,.2]],SKIN_M:AthleteStyle['skin']=[[Y,.42],[R,.3],[B,.1]],SKIN_D:AthleteStyle['skin']=[[Y,.45],[R,.36],[K,.16]];
/** a kit for this film: athlete.ts has no headband, so Ronaldinho's is printed by the adapter */
type Kit=AthleteStyle&{headband?:boolean};
const CHE=(n:number|null,o:Partial<Kit>={}):Kit=>({shirt:[B,.95],shorts:[B,.95],socks:'paper',trim:'paper',boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',number:n,numberInk:'paper',seed:40+(n??0),...o});
const BAR=(n:number|null,o:Partial<Kit>={}):Kit=>({shirt:[Y,.95],shorts:[K,.85],socks:[Y,.9],trim:R,boots:K,skin:SKIN_M,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:10+(n??0),...o});
const RONNIE:Kit=BAR(10,{skin:SKIN_D,hair:[K,.95],hairStyle:'long',headband:true,build:{height:1.81,bulk:.95,thighs:1.02},seed:10});
const CARVALHO:Kit=CHE(6,{hair:[K,.8],build:{height:1.83,bulk:1}}),TERRY:Kit=CHE(26,{hair:[K,.85],build:{height:1.87,bulk:1.08}});
const LAMPARD:Kit=CHE(8,{hair:[K,.7],build:{height:1.84,bulk:1.05}}),GUDJ:Kit=CHE(22,{hair:[Y,.5],build:{height:1.85,bulk:1.05}});
const CECH:Kit={shirt:[R,.9],shorts:[K,.85],socks:[R,.9],boots:K,skin:SKIN_L,hair:[K,.8],hairStyle:'short',gloves:'paper',line:K,sleeves:'long',shade:[K,.28],number:1,numberInk:'paper',build:{height:1.96},seed:1};
const REF:Kit={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_L,hair:null,hairStyle:'bald',line:K,sleeves:'short',seed:33};
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:Kit,lead=false):Kit=>({...st,shirt:lead?[Y,.9]:[K,.45],shorts:lead?[K,.7]:[K,.3],socks:lead?[Y,.8]:'paper',trim:lead?K:'paper',skin:lead?[[Y,.6],[K,.25]]:[[Y,.35]],hair:lead?[K,.95]:K,shade:[K,.2],numberInk:lead?K:'paper',gloves:st.gloves?[Y,.8]:undefined});
/** a halftone echo print of a pose (chronophotograph stamps / the "big backswing" ghost in the lesson) */
const ECHO:Kit={shirt:[Y,.45],shorts:[Y,.3],socks:[Y,.3],boots:[K,.6],skin:[[Y,.3]],hair:[K,.5],line:K,shade:null,shadow:false,lineWeight:.8,detail:'low',sleeves:'short',seed:99};

/** Ronaldinho's headband: a paper band round the front of the head, over the hair (≤ 1 op; only when the figure is big enough to see it) */
function headband(s:Sheet,r:DrawResult,c:Camera,st:AthleteStyle){
 if(r.heightPx<70)return;const sk=r.sk,H=sk.fr.H,hs=(st.build?.head??1)*sk.s,hr=.105*hs*1.07,hc=sk.head,dh=depthOf(c,hc);let run:Pt[]=[];const out=new Path2D();
 const flush=()=>{if(run.length>1)out.addPath(ribbon(run,Math.max(2,.032*hs*kAt(c,hc)),{taper:.35,wobble:.3}));run=[];};
 for(let i=0;i<=24;i++){const a=i/24*TAU,l:V3=[Math.cos(a)*hr,.035*hs,Math.sin(a)*hr],w:V3=[H[0]*l[0]+H[1]*l[1]+H[2]*l[2],H[3]*l[0]+H[4]*l[1]+H[5]*l[2],H[6]*l[0]+H[7]*l[1]+H[8]*l[2]],p=add(hc,w);
  if(depthOf(c,p)<dh+.01)run.push(P(c,p));else flush();}
 flush();s.knockout(out,.95);
}
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}){
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 const r=drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
 if(style.headband&&r.detail!=='low')headband(s,r,c,st);
 return r;
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Ronaldinho's first touch) =================
const RB:Build=RONNIE.build!;
const RP:[number,number]=[-19.6,-1.5];// on the edge of the D, just left of centre
const NET_TO:V3=[0,.3,-2.95];// low, inside the post to Čech's right (the far side from the main camera)
const YR=YAW(-RP[0],-1.9-RP[1]);// facing the goal
const [rfx,rfz]=dirOf(YR),rRx=-rfz,rRz=rfx;// forward and right (ground) of Ronaldinho
const TC=2.9,SHT=.82,T_GOAL=TC+SHT;// contact ≈ 3 s after the first touch ("for three seconds all the players stopped")
const FEINT=[.98,1.62],HIPS=[1.86,2.12];// the two shot feints (the swing stops over the ball), the two hip sways
const CONTACT_POSE=posed({lHipF:12,lKnee:34,lAnk:4,rHipF:30,rKnee:8,rAnk:-6,lean:16,pitch:4,lShA:46,lShF:20,lElb:36,rShA:34,rShF:-18,rElb:40,neckP:40,twist:-4});
const RK:[number,Pose][]=[
 [-.9,posed({lHipF:14,rHipF:10,lKnee:26,rKnee:24,lean:10,lShA:22,rShA:24,lElb:40,rElb:40,neckP:10,neckY:-30})],// waiting, eyes on the passer (his right)
 [-.2,posed({lHipF:18,lKnee:32,rHipF:6,rKnee:30,rHipA:8,rHipR:20,lean:12,lShA:30,rShA:34,lElb:36,rElb:36,neckP:30,neckY:-22})],
 [0,posed({lHipF:14,lKnee:34,lAnk:4,rHipF:18,rHipA:16,rHipR:34,rKnee:32,rAnk:-8,lean:14,lShA:40,rShA:36,lElb:34,rElb:34,neckP:38,neckY:-10,twist:-6})],// cushions it: inside of the right foot
 [.4,posed({lHipF:10,rHipF:8,lHipA:9,rHipA:9,lKnee:30,rKnee:30,lean:14,pitch:3,lShA:30,rShA:30,lElb:40,rElb:40,neckP:12})],// over the ball, head up
 [.72,posed({lHipF:12,lKnee:36,rHipF:-24,rKnee:70,rAnk:30,lean:12,twist:14,lShA:54,lShF:20,lElb:30,rShA:38,rShF:-22,rElb:36,neckP:28,bend:-4})],// feint 1: the backswing…
 [FEINT[0],posed({lHipF:14,lKnee:34,rHipF:8,rKnee:42,rAnk:28,lean:18,twist:-8,lShA:46,lShF:-10,rShA:34,rShF:16,lElb:30,rElb:38,neckP:34})],// …stops over the ball
 [1.2,posed({lHipF:9,rHipF:9,lHipA:9,rHipA:10,lKnee:32,rKnee:30,lean:14,lShA:32,rShA:32,lElb:40,rElb:40,neckP:18,dz:-.03,bend:-5})],
 [1.42,posed({lHipF:12,lKnee:36,rHipF:-18,rKnee:62,rAnk:28,lean:12,twist:12,lShA:50,lShF:16,rShA:36,rShF:-16,lElb:30,rElb:36,neckP:26})],// feint 2
 [FEINT[1],posed({lHipF:14,lKnee:34,rHipF:6,rKnee:42,rAnk:26,lean:17,twist:-6,lShA:44,rShA:34,rShF:12,lElb:32,rElb:38,neckP:32})],
 [HIPS[0],posed({lHipF:6,rHipF:12,lHipA:15,rHipA:5,lKnee:40,rKnee:28,dz:.07,bend:12,roll:5,twist:-16,lean:14,lShA:54,rShA:20,lElb:36,rElb:46,neckP:18,neckY:-8})],// hips sway right…
 [HIPS[1],posed({lHipF:12,rHipF:6,lHipA:5,rHipA:15,lKnee:28,rKnee:42,dz:-.07,bend:-12,roll:-5,twist:16,lean:14,lShA:20,rShA:54,lElb:46,rElb:36,neckP:18,neckY:8})],// …and left
 [2.36,posed({lHipF:8,rHipF:10,lHipA:12,rHipA:8,lKnee:36,rKnee:30,dz:.04,bend:6,twist:-9,lean:15,lShA:42,rShA:28,lElb:38,rElb:42,neckP:24})],
 [2.66,posed({lHipF:14,lKnee:34,rHipF:-8,rKnee:36,rAnk:4,lean:16,lShA:40,rShA:30,lElb:36,rElb:40,neckP:38})],// the tiny load: no back-lift
 [TC,CONTACT_POSE],
 [3.12,posed({lHipF:10,lKnee:30,rHipF:36,rKnee:14,rAnk:12,lean:10,lShA:44,rShA:30,lElb:36,rElb:40,neckP:14})],
 [3.7,posed({lHipF:12,rHipF:18,lKnee:24,rKnee:26,lean:4,lShA:30,rShA:30,lElb:40,rElb:40,neckP:-2})],
];
const LAG={torso:.04,arms:.07,head:.03};
const RON_PLACE:Place={x:RP[0],z:RP[1],yaw:YR};
const CON_SK=solve(CONTACT_POSE,RB,RON_PLACE);
const BALL0:V3=[CON_SK.rToe[0]+rfx*.1,.11,CON_SK.rToe[2]+rfz*.1];// the ball sits where the toe will meet it
const CTRL:V3=[BALL0[0]-rfx*.2+rRx*.32,.11,BALL0[2]-rfz*.2+rRz*.32];// where the pass meets his right boot
const PASSER:V3=[-27.6,.11,6.4];const TP=1.15;// an unnamed team-mate's pass from his right
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

// ---- Ronaldinho: waits → cushions the pass → two shot feints with the right foot → hips sway twice → toe-poke (no back-lift) → celebrates ----
const CELEB:MKey[]=[[TC+1.1,RP[0],RP[1]],[TC+2.1,RP[0]+1.6,RP[1]-3.2],[TC+3.2,RP[0]+2.4,RP[1]-6.2]];
function ronnieAt(tau:number):{pose:Pose;place:Place}{
 const breath=(p:Pose)=>{if(tau<RK[0][0]){p.neckY+=.15*Math.sin(tau*.7);p.lKnee+=.04*Math.sin(tau*1.3);}return p;};
 const kp=breath(keyPoses(tau,RK,LAG));
 if(tau<TC+.9)return{pose:kp,place:RON_PLACE};
 const q=pathPos(CELEB,tau),v=Math.hypot(q.vx,q.vz),run=celebrate(Math.max(0,q.dist)/3,{kind:'run'}),arms=celebrate(Math.max(0,tau-TC-3.2)/.9,{kind:'arms'});
 const pose=tau<TC+3.2?blendPose(kp,run,sm(TC+.9,TC+1.3,tau)):blendPose(run,arms,sm(TC+3.2,TC+3.5,tau));
 return{pose,place:{x:q.x,z:q.z,yaw:v>.3?lerpAng(YR,YAW(q.vx,q.vz),sm(TC+.9,TC+1.3,tau)):YAW(CELEB[2][1]-CELEB[1][1],CELEB[2][2]-CELEB[1][2])}};
}

// ---- the ball: the pass → cushioned in front of him → still under the feints → toe-poked, low and fast → the net ----
function ballAt(tau:number):V3{
 if(tau<-TP)return PASSER;
 if(tau<0){const u=(tau+TP)/TP,e=1.5*u-.5*u*u;return[lerp(PASSER[0],CTRL[0],e),.11,lerp(PASSER[2],CTRL[2],e)];}
 if(tau<.36){const u=easeOut(tau/.36);return mix3(CTRL,BALL0,u);}
 if(tau<TC)return BALL0;
 const s=tau-TC;if(s<SHT){const u=s/SHT;return[lerp(BALL0[0],NET_TO[0],u),lerp(.11,NET_TO[1],u)+.16*Math.sin(Math.PI*u),lerp(BALL0[2],NET_TO[2],u)];}
 const e=s-SHT,u=clamp(e/.14);if(u<1)return mix3(NET_TO,[1.7,.34,-3.1],easeOut(u));
 const d=clamp((e-.14)/.9);return[1.7-.5*d,.11+.23*(1-d)*Math.abs(Math.cos(d*5)),-3.1+.15*d];}
const NET_HIT:V3=[2,.34,-3.05];

// ---- everybody else ----
type Actor={style:Kit;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:Kit,p:MKey[],seed:number,rest?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,seed,rest)});
/** a defender's jockey stance: low, side-on, arms out for balance */
const JOCKEY=posed({lHipF:40,rHipF:30,lKnee:56,rKnee:46,lHipA:14,rHipA:14,lean:24,pitch:4,lShA:34,rShA:34,lElb:60,rElb:60,neckP:-8});
/** a defender who reads each shot feint as a real shot: a flinch toward the ball, then stuck (frozen) — `w` scales the flinch */
function frozenDefender(pos:[number,number],seed:number,side:'l'|'r',w:number,shift:[number,number]=[0,0]):Actor['at']{
 return(t,b)=>{const flinch=Math.max(sm(FEINT[0]-.2,FEINT[0]+.05,t)*(1-sm(FEINT[0]+.25,FEINT[0]+.55,t)),.7*sm(FEINT[1]-.18,FEINT[1]+.05,t)*(1-sm(FEINT[1]+.25,FEINT[1]+.5,t)));
  const froze=sm(HIPS[0]-.2,HIPS[1],t),after=sm(TC+.15,TC+.7,t),u=sm(FEINT[0]-.2,FEINT[0]+.3,t);
  let pose=blendPose(idle(t,seed),JOCKEY,sm(-3,-1.2,t));pose=blendPose(pose,lunge(.55,{side}),w*flinch);
  if(froze>0){pose={...pose,lean:pose.lean+.12*froze,lKnee:pose.lKnee+.1*froze};}
  if(after>0)pose={...pose,neckY:pose.neckY+(side==='l'?-1:1)*.7*after,twist:pose.twist+(side==='l'?-1:1)*.35*after,lean:pose.lean-.15*after};
  const x=pos[0]+shift[0]*u,z=pos[1]+shift[1]*u;return{pose,place:{x,z,yaw:YAW(b[0]-x,b[2]-z)*(1-after)+YAW(BALL0[0]-x,BALL0[2]-z)*after}};};}
const PASS_YAW=YAW(CTRL[0]-PASSER[0],CTRL[2]-PASSER[2]);
const PASS_SK=solve(strike(.52,{power:.5}),{},{yaw:PASS_YAW});
const PP:[number,number]=[PASSER[0]-PASS_SK.rToe[0],PASSER[2]-PASS_SK.rToe[2]];
const [pbx,pbz]=dirOf(PASS_YAW);
const PASSRUN:MKey[]=[[-10,PP[0]-pbx*2.4,PP[1]-pbz*2.4],[-2.4,PP[0]-pbx*2.2,PP[1]-pbz*2.2],[-1.5,PP[0]-pbx*.8,PP[1]-pbz*.8],[-.4,PP[0]+pbx*.5,PP[1]+pbz*.5],[4,PP[0]+pbx*5,PP[1]+pbz*3]];
const ACTORS:Actor[]=[
 {style:CARVALHO,at:frozenDefender([-17.3,-2.2],1,'l',.55,[.1,.25])},// Ricardo Carvalho, straight in front
 {style:TERRY,at:frozenDefender([-16.5,.9],2,'r',.4,[0,-.35])},// John Terry, blocking the right
 {style:GUDJ,at:(t,b)=>{const r=runner([[-10,-24,6.4],[-1,-22.2,4.4],[.7,-19.9,2.7],[TC+2,-19.6,2.4]],t,b,3,JOCKEY);return r;}},// Eidur Gudjohnsen, tracking back
 {style:LAMPARD,at:(t,b)=>runner([[-10,-29,-7.2],[-1,-26.6,-5.6],[TC,-21.9,-3.2],[TC+.8,-21.2,-2.9]],t,b,4,JOCKEY)},// Frank Lampard, bearing down from behind
 {style:BAR(null,{skin:SKIN_L}),at:(t,b)=>{const r=runner(PASSRUN,t,b,1);if(t>-1.9&&t<-.3){const u=clamp((t+1.75)/1.2);r.pose=blendPose(r.pose,strike(u,{power:.5}),Math.sin(clamp((t+1.9)/1.6)*Math.PI));r.place.yaw=PASS_YAW;}return r;}},// the passer (unnamed)
 mover(BAR(9,{skin:SKIN_D}),[[-10,-12.8,-9.6],[TC,-10.6,-6.8],[TC+2,-9.4,-5.2]],5),// Samuel Eto'o, in the box
 mover(CHE(13,{skin:SKIN_D,hair:[K,.9]}),[[-10,-11.6,-8.2],[TC,-9.8,-5.9],[TC+2,-9,-4.8]],6),// William Gallas, marking him
 mover(BAR(null,{hair:[K,.7]}),[[-10,-31,-4],[TC,-27.4,-3],[TC+3,-24,-2.4]],7),// a Barcelona midfielder
 mover(CHE(null,{skin:SKIN_D}),[[-10,-25.6,1],[TC,-24.4,.2]],8),// a Chelsea midfielder, too far off
 {style:CECH,at:(t,b)=>{const x=-2.3,z=-.55,face=YAW(b[0]-x,b[2]-z);// Petr Čech: set, then too late
  const ds=TC+.62;if(t<ds)return{pose:keeperSet(t*1.6),place:{x,z,yaw:face}};
  return{pose:keeperDive(clamp((t-ds)/1.3),{side:'r',height:.08}),place:{x,z,yaw:YAW(BALL0[0]-x,BALL0[2]-z)}};}},
 mover(REF,[[-10,-32,-12],[0,-30.5,-11],[TC+2,-28,-9]],10),// Pierluigi Collina
];
const DEF=[0,1,2,3];// the four blue shirts round him
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Ronaldinho with motion smear + secondary motion; `cap` limits figure detail
 * (passages); small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean;skip?:number[]}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s);
 const put=(style:Kit,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(style===RONNIE?1:3))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&style!==RONNIE&&hPx<34)return;const detail:Detail|undefined=hPx<62||(o.cap&&style!==RONNIE)?'low':o.cap?'mid':undefined;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev,smear:smear&&!o.cap,detail})});};
 ACTORS.forEach((a,i)=>{if(!o.skip?.includes(i))put(a.style,a.at(tp,bp));});
 const he=ronnieAt(tp);put(RONNIE,he,o.hero?ronnieAt(tp-1/12):undefined,!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  starBall(s,q[0],q[1],r,tau>TC?(tau-TC)*14:0,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,ron:he};}
/** the pause bars over the four frozen defenders (one yInk for all) */
function freezeMarks(s:Sheet,c:Camera,tp:number,amt:number){if(amt<.02)return;const path=new Path2D(),bp=ballAt(tp);let n=0;
 for(const i of DEF){const pl=ACTORS[i].at(tp,bp).place,p:V3=[(pl.x??0)+c.r[0]*.55,1.95,(pl.z??0)+c.r[2]*.55];if(depthOf(c,p)<1.5)continue;const q=P(c,p),h=clamp(.42*kAt(c,p),10,90)*easeOutBack(clamp(amt));pauseBars(path,q[0],q[1]-h*.2,h);n++;}
 if(n)yInk(s,path,.95);}

// ================= chapter 1 (live, real time): the high main-stand camera; the pass, the stand-off, the shot, the net =================
const ch1q=()=>({sb:T(0,'Stamford Bridge'),ba:T(0,'Barcelona'),ch:T(0,'Chelsea'),ro:T(0,'Ronaldinho'),gb:T(0,'gets the ball'),ty:T(0,'twenty yards out'),fb:T(0,'four blue shirts'),th:T(0,'Then'),g:T(0,'goal'),end:SEC(0)});
/** the lead-in: τ = t − TL. The toe-poke lands on "Then" when the voice allows; the pass is always rolling soon after "gets the ball". */
const ch1T=()=>{const q=ch1q(),TL=clamp(q.th-TC+.1,q.gb+.2,Math.max(q.gb+.2,Math.min(q.gb+2.2,q.end-T_GOAL-1.4)));return{TL,end:q.end};};
const BCAM:V3=[-24,17,47];
/** before the pass the director's camera tells the story with the words: the stadium → the teams → Ronaldinho → the pass → the goal */
function ch1Pre(t:number):V3{const q=ch1q(),v=key(t,mono([[0,-40,10,-32],[q.ba,-26,2,-2],[q.ro,RP[0]+.4,1.1,RP[1]],[q.gb,lerp(RP[0],PASSER[0],.4),1,lerp(RP[1],PASSER[2],.4)]]),easeInOutSine,true);return[v[0],v[1],v[2]];}
function ch1Play(tau:number):V3{const b=ballAt(tau);
 if(tau<0)return[lerp(b[0],RP[0],.6),1,lerp(b[2],RP[1],.6)];
 if(tau<TC)return[RP[0]+1.2,1.05,RP[1]-.1];
 return mix3([RP[0]+1.2,1.05,RP[1]-.1],[-5,1,-1.8],sm(TC,T_GOAL+.2,tau));}
function ch1Cam(t:number){const q=ch1q(),{TL}=ch1T(),tau=t-TL,w=sm(TL-1.6,TL-.3,t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.2),c=f(tau-.4);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 let look=mix3(ch1Pre(t),av(ch1Play),w);
 // "twenty yards out": the camera glances down the line to the goal and back
 const ty=sm(q.ty,q.ty+.6,t)*(1-sm(q.fb-.1,q.fb+.5,t));look=mix3(look,[-9,1,-1],.55*ty);
 const F=key(t,mono([[0,2200],[q.ba,2800],[q.ro,6600],[q.gb,5200],[q.ty+.3,3900],[q.fb+.2,5600],[TL+TC-.3,5400],[TL+TC+.35,3500],[TL+T_GOAL+.3,3900],[q.end,4300]]),easeInOutSine);return cam(BCAM,look,F);}
/** team rings: on "Barcelona" yellow rings round the yellow shirts, on "Chelsea" blue rings round the blue ones; on "four blue shirts" the
 * four defenders round him ring up and are tied to him by dashed lines (the cage) */
function teamRings(s:Sheet,c:Camera,tp:number,t:number){
 const q=ch1q(),ra=sm(q.ba,q.ba+.3,t,easeOutBack)*(1-sm(q.ch+.2,q.ch+.8,t)),rc=sm(q.ch,q.ch+.3,t,easeOutBack)*(1-sm(q.ro,q.ro+.6,t)),rr=sm(q.ro,q.ro+.3,t,easeOutBack)*(1-sm(q.gb+.4,q.gb+1,t)),rf=sm(q.fb,q.fb+.35,t,easeOutBack)*(1-sm(q.th-.3,q.th+.3,t));
 if(ra<.02&&rc<.02&&rr<.02&&rf<.02)return;const bp=ballAt(tp),pa=new Path2D(),pc=new Path2D(),py=new Path2D();
 const ring=(path:Path2D,x:number,z:number,g:number)=>{const q=groundRing(c,x,z,.9*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.6}));};
 const ro=ronnieAt(tp).place;
 ACTORS.forEach((a,i)=>{const p=a.at(tp,bp).place,x=p.x??0,z=p.z??0;if(a.style.shirt?.[0]===Y&&ra>.02)ring(pa,x,z,ra);if(a.style.shirt?.[0]===B&&rc>.02)ring(pc,x,z,rc);
  if(rf>.02&&DEF.includes(i)){ring(py,x,z,rf);const A=P(c,[x,.05,z]),Bq=P(c,[ro.x??0,.05,ro.z??0]),gaps:[number,number][]=[];for(let g=.08;g<1;g+=.16)gaps.push([g,g+.08]);py.addPath(ribbon([A,[lerp(A[0],Bq[0],rf),lerp(A[1],Bq[1],rf)]],Math.max(4,.07*kAt(c,[x,0,z])),{taper:0,wobble:.4,gaps}));}});
 if(ra>.02)ring(pa,ro.x??0,ro.z??0,ra);if(rr>.02)ring(py,ro.x??0,ro.z??0,rr*1.3);
 if(ra>.02){s.knockout(pa,.9);s.fill(Y,pa,.95);}if(rc>.02){s.knockout(pc,.9);s.fill(B,pc,.95);}if(rr>.02||rf>.02)yInk(s,py,.95);
}
const ch1:Scene={
 draw(s,t){const q=ch1q(),{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),goalIn=t-TL-T_GOAL;frame(s);
  stadium(s,c,{t,lite:t>q.end-.7,cheer:.1+.9*sm(0,.5,goalIn)*(1-.6*sm(1.5,3,goalIn)),flash:.1+1.2*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  teamRings(s,c,tt-TL,t);
  // "gets the ball": the pass lane lights up ahead of the ball, from the team-mate to his right boot
  const pl=sm(q.gb,q.gb+.5,t)*(1-sm(TL+.1,TL+.6,t));if(pl>.02){const pts:Pt[]=[];for(let i=0;i<=12;i++){const p=mix3(PASSER,CTRL,i/12*pl);if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   if(pts.length>1){const gaps:[number,number][]=[];for(let x=.06;x<1;x+=.14)gaps.push([x,x+.06]);yInk(s,arrowPath(pts,Math.max(6,.16*kAt(c,CTRL)),gaps),.9);}}
  // "twenty yards out": a dotted chalk line from the ball to the goal
  const dl=sm(q.ty,q.ty+.8,t)*(1-sm(q.fb+.2,q.fb+.7,t));if(dl>.02){const pts:Pt[]=[];for(let i=0;i<=20;i++){const u=i/20*dl,p:V3=[lerp(BALL0[0]+.4,-.3,u),.03,lerp(BALL0[2],-.4,u)];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   if(pts.length>1){const gaps:[number,number][]=[];for(let x=.05;x<1;x+=.1)gaps.push([x,x+.04]);yInk(s,arrowPath(pts,Math.max(8,.24*kAt(c,BALL0)),gaps),.95);}}
  drawWorld(s,c,t-TL,tt-TL,{ballMin:13,cap:t>q.end-.7});
  // the shot: speed lines behind the ball as it flashes in
  const tau=tt-TL;if(tau>TC&&tau<T_GOAL){const a=P(c,ballAt(tau-.06)),b=P(c,ballAt(tau));speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:4,seed:5,len:120,width:6,cov:.85});}},
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(13,BALL_R*kAt(c,p))*.95,12);},
 still:8.6,
};

// ================= chapter 2 (TV replay, slow motion, low and close, orbiting him): the two feints, the hip sway, the freeze, pause =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),pr:T(1,'pretends to shoot'),tw:T(1,'twice'),hs:T(1,'hips sway'),lr:T(1,'left and right'),df:T(1,'defenders freeze'),pp:T(1,'pressed pause'),end:SEC(1)});
/** replay clock: slow; each feint lands on its words; on "pressed pause" the replay really pauses a beat before the toe-poke */
const tau2=(t:number)=>{const q=ch2q(),pp=Math.max(q.pp,q.df+.8);return key(t,mono([[0,.1],[q.pr+.35,FEINT[0]],[q.tw+.35,FEINT[1]],[q.hs+.3,HIPS[0]],[q.lr+.4,HIPS[1]],[q.df+.3,2.5],[pp,TC-.3],[q.end,TC-.26]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),orbit=sm(0,q.end,t,easeInOutSine),ang=YR-1.25+.75*orbit,[fx,fz]=dirOf(ang),D=lerp(7.4,5.6,sm(0,q.hs,t))+.9*sm(q.df,q.pp+.4,t);
 const body:V3=[RP[0],1.0,RP[1]],pos:V3=[body[0]+fx*D,.95+.35*sm(q.df,q.end,t),body[2]+fz*D];
 const look=mix3(mix3([BALL0[0],.5,BALL0[2]],body,.62),[RP[0]+2.2,1,RP[1]-.1],.5*sm(q.df-.2,q.df+.6,t)*(1-sm(q.pp,q.end,t)));
 const F=key(t,mono([[0,1400],[q.sl,1650],[q.pr,1850],[q.hs,1750],[q.df,1350],[q.pp,1750],[q.end,2000]]));
 return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.08,flash:.05,lite:t>q.end-.7||t<.6});
  // "hips sway": a yellow double arrow on the grass under his hips, swinging with them
  const hs=sm(q.hs-.1,q.hs+.3,tt)*(1-sm(q.df+.2,q.df+.7,tt));if(hs>.02){const off=ronnieAt(tp).pose.dz*1.5,pts:Pt[]=[];for(let i=0;i<=12;i++){const o=(i/12-.5)*2.4*hs+off,p:V3=[RP[0]+rRx*o,.02,RP[1]+rRz*o];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   if(pts.length>2){const w=Math.max(10,.13*kAt(c,[RP[0],0,RP[1]])),a=arrowPath(pts,w);a.addPath(arrowPath(pts.slice(0,2).reverse(),w));yInk(s,a,.95);}}
  const w=drawWorld(s,c,tau,tp,{ballMin:26,hero:true,glow:sm(q.w,q.w+.4,tt)*(1-sm(q.pr,q.pr+.5,tt)),cap:t>q.end-.7});
  // "pretends to shoot" / "twice": each fake swing flashes a ring round the right boot and a ghost shot line that never leaves
  const fk=(cue:number)=>sm(cue+.1,cue+.35,tt,easeOutBack)*(1-sm(cue+.8,cue+1.2,tt));
  const f1=fk(q.pr),f2=fk(q.tw),fa=Math.max(f1,f2);
  if(fa>.02){const sk=solve(w.ron.pose,RB,w.ron.place),p=P(c,sk.rToe),r=.3*kAt(c,sk.rToe)*fa;yRing(s,p[0],p[1],r,Math.max(5,.035*kAt(c,sk.rToe)));
   const pts:Pt[]=[];for(let i=0;i<=10;i++){const p3=mix3(BALL0,[-2,.3,-1.5],i/10*.35*fa);if(depthOf(c,p3)>NEAR)pts.push(P(c,p3));}
   if(pts.length>1){const gaps:[number,number][]=[];for(let x=.1;x<1;x+=.25)gaps.push([x,x+.12]);s.fill(K,arrowPath(pts,Math.max(5,.05*kAt(c,BALL0)),gaps),.7*fa);}}
  // "defenders freeze" / "pressed pause": pause bars over every blue shirt; on "pressed pause" one big pause print over the frozen frame
  freezeMarks(s,c,tp,sm(q.df,q.df+.35,tt)*(1-sm(q.end-.6,q.end-.3,tt)));
  const pz=sm(q.pp,q.pp+.3,tt,easeOutBack)*(1-sm(q.end-.7,q.end-.35,tt));if(pz>.02){const path=new Path2D(),hw=540*s.W/Math.max(1,s.H);pauseBars(path,-hw+190,-540+200,170*pz);yInk(s,path,.9);}
 },
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(26,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5.5,
};

// ================= chapter 3 (replay from behind the goal, low through the net): no back-lift, the toe-poke, past a stunned Čech =================
const ch3q=()=>({fb:T(2,'From behind'),nb:T(2,'no big backswing'),pk:T(2,'pokes it'),ht:T(2,'his toe'),ps:T(2,'past a stunned'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,TC-.9],[q.nb+.2,TC-.3],[q.pk+.1,TC-.06],[q.ht+.2,TC+.05],[q.ps+.5,T_GOAL+.05],[q.end,T_GOAL+.05+(q.end-q.ps-.5)*.9]]),x=>x);};
/** from behind him, just over his right shoulder: the whole swing of the right leg, then the ball's flight to the corner */
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.min(tau,T_GOAL+.1)),fly=sm(TC,T_GOAL,tau,easeInOutSine),toCeleb=sm(q.ps+1,q.end,t,easeInOutSine);
 const pos:V3=[RP[0]-rfx*4.3+rRx*1.7,2.8+.3*toCeleb,RP[1]-rfz*4.3+rRz*1.7];
 const look0:V3=[RP[0]+rfx*4,.35,RP[1]+rfz*4],look1:V3=[b[0],clamp(b[1],.5,1.4),b[2]],rp=ronnieAt(tau).place,look2:V3=[(rp.x??0)+rfx*1.5,1.1,(rp.z??0)+rfz*1.5];
 const look=mix3(mix3(look0,look1,fly),look2,toCeleb*.6);
 const F=key(t,mono([[0,1300],[q.fb+.3,1500],[q.nb,1750],[q.ht+.35,1650],[q.ps+.2,4000],[q.ps+1,4400],[q.end,2400]]));return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.ps+.5;
  const shake=t>=hitT?6*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,lite:t>q.end-.7||t<.6,cheer:.1+1.1*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  const w=drawWorld(s,c,tau,tp,{ballMin:18,hero:true,cap:t>q.end-.7||t<.6,skip:[4,7,10]});
  // "no big backswing": the whole swing of the right toe drawn as a short yellow arc — load to contact, a hand's width
  const nb=sm(q.nb,q.nb+.4,tt)*(1-sm(q.ps,q.ps+.5,tt));if(nb>.02){const pts:Pt[]=[];for(let i=0;i<=10;i++){const ts=lerp(2.66,TC,i/10*nb),sk=solve(ronnieAt(ts).pose,RB,RON_PLACE);if(depthOf(c,sk.rToe)>NEAR)pts.push(P(c,sk.rToe));}
   if(pts.length>1)yInk(s,arrowPath(pts,Math.max(5,.05*kAt(c,BALL0))),.95);}
  // "pokes it" / "his toe": a yellow ring on the toe tip and sparks at the contact
  const ht=sm(q.pk,q.pk+.25,tt,easeOutBack)*(1-sm(q.ps-.1,q.ps+.3,tt));if(ht>.02){const sk=solve(w.ron.pose,RB,w.ron.place),p=P(c,sk.rToe),r=.3*kAt(c,sk.rToe)*ht;yRing(s,p[0],p[1],r,Math.max(5,.04*kAt(c,sk.rToe)));}
  if(tp>=TC&&tp<TC+.18){const p=P(c,BALL0);sparkBurst(s,Y,p[0],p[1],90+90*sm(TC,TC+.08,tp,easeOut),{n:9,seed:10,g:1-sm(TC+.08,TC+.18,tp),width:10});}
  if(tp>TC&&tp<T_GOAL&&depthOf(c,w.ball)>NEAR+.8){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:11,len:150,width:7,cov:.85});}
  // "past a stunned": little surprise marks round Čech's head as it flashes by
  const st=sm(q.ps+.3,q.ps+.6,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.4,tt));if(st>.02){const kp=ACTORS[9].at(tp,ballAt(tp)),sk=solve(kp.pose,CECH.build,kp.place),h=P(c,sk.head),k=kAt(c,sk.head),path=new Path2D();
   for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.42,r0=.2*k,r1=r0+.16*k*st;path.addPath(ribbon([[h[0]+Math.cos(a)*r0,h[1]+Math.sin(a)*r0],[h[0]+Math.cos(a)*r1,h[1]+Math.sin(a)*r1]],Math.max(4,.035*k),{taper:.4,wobble:0}));}yInk(s,path,.95);}
 },
 aperture(t){const c=ch3Cam(t),tau=tau3(t),p=ballAt(tau);let x=0,y=0;if(depthOf(c,p)>NEAR+.6)[x,y]=P(c,p);const r=Math.max(22,Math.min(140,BALL_R*kAt(c,p)));return apertureDisc(x,y,r*.92,12);},
 still:4.4,
};

// ================= chapter 4 (duotone lesson): a small feint freezes defenders; no big backswing; the quick toe-poke surprises the keeper =================
const ch4q=()=>({sf:T(3,'A small body feint'),fd:T(3,'freezes defenders'),sw:T(3,'score without'),bb:T(3,'big backswing'),qt:T(3,'quick toe-poke'),sk:T(3,'surprises the keeper'),end:SEC(3)});
/** lesson clock: the shimmy on "A small body feint", held (frozen) through the backswing comparison, the toe-poke at real speed on "quick" */
const tau4=(t:number)=>{const q=ch4q();return key(t,mono([[0,.3],[q.sf,.5],[q.fd,HIPS[1]],[q.sw,2.5],[q.qt,2.66],[q.qt+.24,TC],[q.sk+.1,T_GOAL],[q.end,T_GOAL+.2+(q.end-q.sk-.1)*.3]]),x=>x);};
const RONNIE4=duo(RONNIE,true),DEF4=[duo(CARVALHO),duo(TERRY)],CECH4=duo(CECH);
/** side-on from his right (the leg swings read in profile); after the toe-poke a whip-pan trucks down the line to the goal and the keeper */
function LCAM(t:number){const q=ch4q(),w=sm(q.qt+.45,Math.max(q.qt+.95,q.sk-.1),t,easeInOutSine),v=key(t,mono([[0,5.8,1.5,1700],[q.sf,5.2,1.2,1900],[q.fd,6.2,1.5,1650],[q.bb,5.0,1.1,2000],[q.qt,5.4,1.2,1850],[q.sk,7.2,1.5,2000],[q.end,7.6,1.6,2050]]),easeInOutSine,true);
 const along=1+13*w,pos:V3=[RP[0]+rfx*along+rRx*v[0],v[1],RP[1]+rfz*along+rRz*v[0]],rest:V3=[RP[0]+rfx*1.3,.95,RP[1]+rfz*1.3],look=mix3(rest,[-1.2,1,-1.6],w);return cam(pos,look,v[2]);}
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  // the stage: a navy print, the ground as stepped yellow light round him, the goal ahead
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-30],[8,0,-30],[8,0,30],[-60,0,30]]));s.tone(K,floor,.2);
  const pool=(r:number)=>{const g=groundRing(c,RP[0]+.6,RP[1],r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(5.2),.2);s.tone(Y,pool(3),.2);s.tone(Y,pool(1.6),.32);
  goal(s,c);
  const items:Item[]=[],h=ronnieAt(tp),hp=ronnieAt(tp-1/12),bp=ballAt(tp);
  // "A small body feint": halftone echoes of the two hip sways, left and right of him
  const ec=sm(q.sf+.3,q.sf+.8,tt)*(1-sm(q.sw,q.sw+.4,tt));if(ec>.02)for(const hs of HIPS){if(tp<hs-.05)continue;const e=ronnieAt(hs);items.push({depth:depthOf(c,[RP[0],0,RP[1]])+.05,draw:()=>drawPlayer(s,e.pose,c,ECHO,e.place,{detail:'low'})});}
  // "big backswing": the ghost of a full shot's wind-up (the leg swung high behind) prints over him with its long dashed swing arc…
  const bb=sm(q.bb,q.bb+.35,tt,easeOutBack)*(1-sm(q.qt-.2,q.qt+.2,tt));
  if(bb>.02){const g=strike(.4),pl:Place={x:RP[0]-rfx*.25,z:RP[1]-rfz*.25,yaw:YR};items.push({depth:depthOf(c,[RP[0],0,RP[1]])-.05,draw:()=>{drawPlayer(s,g,c,ECHO,pl,{detail:'low'});
    const pts:Pt[]=[];for(let i=0;i<=16;i++){const sk=solve(strike(lerp(.3,.52,i/16)),RB,pl);if(depthOf(c,sk.rToe)>NEAR)pts.push(P(c,sk.rToe));}const gaps:[number,number][]=[];for(let x=.06;x<1;x+=.14)gaps.push([x,x+.07]);if(pts.length>1)yInk(s,arrowPath(pts,Math.max(6,.05*kAt(c,BALL0)*bb),gaps),.9);}});}
  // …and the real one: a short solid arc, load to contact
  const sa=sm(q.sw,q.sw+.4,tt)*(1-sm(q.sk,q.sk+.5,tt));
  // the defenders (ghosts) — "freezes defenders": pause bars over them; the keeper at the goal
  [0,1].forEach(i=>{const a=ACTORS[i].at(tp,bp);items.push({depth:depthOf(c,[a.place.x??0,0,a.place.z??0]),draw:()=>drawPlayer(s,a.pose,c,DEF4[i],a.place,{detail:'mid'})});});
  {const a=ACTORS[9].at(tp,bp);items.push({depth:depthOf(c,[a.place.x??0,0,a.place.z??0]),draw:()=>drawPlayer(s,a.pose,c,CECH4,a.place,{detail:'low'})});}
  items.push({depth:depthOf(c,[RP[0],0,RP[1]]),draw:()=>drawPlayer(s,h.pose,c,RONNIE4,h.place,{prev:hp,smear:true})});
  const bpos=ballAt(tau);items.push({depth:depthOf(c,bpos),draw:()=>{if(depthOf(c,bpos)<NEAR+.3)return;ballShadow(s,c,bpos);const b2=P(c,bpos),a=P(c,ballAt(tau-.03)),r=Math.max(18,BALL_R*kAt(c,bpos));starBall(s,b2[0],b2[1],r,tau>TC?(tau-TC)*14:0,{duo:true,sq:clamp(Math.hypot(b2[0]-a[0],b2[1]-a[1])/(r*3),0,.7),dir:Math.atan2(b2[1]-a[1],b2[0]-a[0])});}});
  items.filter(i=>i.depth>1.2).sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  if(sa>.02&&depthOf(c,BALL0)>1.2){const pts:Pt[]=[];for(let i=0;i<=8;i++){const sk=solve(ronnieAt(lerp(2.66,TC,i/8)).pose,RB,RON_PLACE);if(depthOf(c,sk.rToe)>NEAR)pts.push(P(c,sk.rToe));}if(pts.length>1)yInk(s,arrowPath(pts,Math.max(6,.05*kAt(c,BALL0))),.95*sa);}
  // "freezes defenders": pause bars over the two ghosts
  const fz=sm(q.fd,q.fd+.35,tt)*(1-sm(q.qt,q.qt+.3,tt));if(fz>.02){const path=new Path2D();for(const i of[0,1]){const pl=ACTORS[i].at(tp,bp).place,p:V3=[(pl.x??0)+c.r[0]*.55,1.95,(pl.z??0)+c.r[2]*.55];if(depthOf(c,p)<1)continue;const pp=P(c,p),hh=clamp(.4*kAt(c,p),14,120)*easeOutBack(clamp(fz));pauseBars(path,pp[0],pp[1]-hh*.2,hh);}yInk(s,path,.95);}
  // "quick toe-poke": sparks at the toe and the ball fires off; "surprises the keeper": a yellow burst in the net behind the late keeper
  if(tp>=TC&&tp<TC+.2){const p=P(c,BALL0);sparkBurst(s,Y,p[0],p[1],110,{n:10,seed:41,g:1-sm(TC+.08,TC+.2,tp),width:12});}
  if(tp>TC&&tp<T_GOAL+.1&&depthOf(c,bpos)>NEAR+.5){const a=P(c,ballAt(tp-.05)),b=P(c,ballAt(tp));speedLines(s,Y,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:42,len:150,width:7,cov:.9});}
  const sk=sm(q.sk,q.sk+.3,tt,easeOutBack)*(1-sm(q.end-.8,q.end-.3,tt));if(sk>.02){const p=P(c,NET_HIT);sparkBurst(s,Y,p[0],p[1],Math.max(40,.9*kAt(c,NET_HIT))*sk,{n:12,seed:43,g:sk,width:10});}
 },
 still:6,
};

const story:RisoStory={
 id:'ronaldinho-chelsea-2005',format:'11v11',title:"Ronaldinho's toe-poke",
 theme:'A small body feint freezes defenders, and you can score without a big backswing.',
 ageNote:'Champions League last 16, Chelsea 4–2 Barcelona, Stamford Bridge, London, 8 March 2005. Chelsea went through 5–4 on aggregate.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a toe-poke — the ball shoots off low from the point with a yellow ring on the grass. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const dx=age<=0?0:easeOut(clamp(age/.5))*220,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*100*g,y+Math.sin(q)*30*g] as Pt;}),true),12,.95);
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,110*g,{n:8,seed,g:1-clamp(age/.3),width:11});
  starBall(s,x+dx,y-20,52,age*14+hash(seed,3)*TAU,{sq:age>0?.2*Math.max(0,1-age*4):0,dir:0});
 },
};
export default story;
