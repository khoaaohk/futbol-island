/** Signature-move film: Raphinha, "the left-foot strike" — his early, curled finish for Barcelona 3–1 Bayern Munich (45'), UEFA Champions
 * League league phase, Barcelona 4–1 Bayern Munich, Estadi Olímpic Lluís Companys (Montjuïc), Barcelona, 23 October 2024 (his hat-trick night).
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/raphinha-signature/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/raphinha-signature/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/raphinha-signature/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * WHY THIS MOMENT: the card's signature is "the left-foot strike" with the lesson "when you have space, shoot early before the defender
 *  closes you down". Wikipedia's playing-style section: a right winger who "uses his left foot to cut inside, creating goal-scoring
 *  opportunities". Of the goals the written sources describe move by move, this one shows the lesson most clearly: released into open space
 *  by a long diagonal, he drives at the box and shoots at the first chance, before Bayern's defenders can recover. NOTE FOR THE LEAD: every
 *  source places this run on the LEFT wing, not "from the right" as the card title says, so the narration says "on the left" and never
 *  "from the right". No move-by-move source for a right-side left-foot goal could be confirmed within the fetch budget.
 *
 * SOURCES (fetched Sept 2026 with curl, cached in scratchpad/films/src-cache; the footage itself was not reviewed):
 *  - The Guardian, Sid Lowe, "Raphinha hits hat-trick in Barcelona's vengeful demolition of Bayern Munich" (23 Oct 2024)
 *    https://www.theguardian.com/football/2024/oct/23/barcelona-bayern-munich-champions-league-match-report
 *  - The Guardian live blog, "Barcelona 4-1 Bayern Munich, Manchester City 5-0 Sparta Prague: Champions League – as it happened"
 *    https://www.theguardian.com/football/live/2024/oct/23/barcelona-v-bayern-munich-manchester-city-v-sparta-prague-champions-league-live
 *    (key events, the goal description, the photo caption; one match photo from the report — Kane's volley — used to check both kits)
 *  - Wikipedia, "Raphinha" (raw): the 23 Oct 2024 hat-trick in a 4–1 home win over Bayern, Player of the Match; playing style.
 *    https://en.wikipedia.org/wiki/Raphinha
 * CONFIRMED by those accounts: 23 October 2024, Estadi Olímpic Lluís Companys (Montjuïc hill), Champions League; evening kick-off (the
 *  live blog posts the goal at 21:46 local time); Raphinha scored at 1', 45' and 56' (a hat-trick, on his 100th Barcelona game), Kane
 *  equalised (18'), Lewandowski made it 2–1 (36'); THIS goal (45', "on the stroke of half-time") made it 3–1: "seemingly cornered deep in
 *  his own half, Casadó worked a way out and struck a wonderful long diagonal to Raphinha, running free again to send a fantastic shot into
 *  the corner" (Lowe); "A crossfield pass finds Raphinha on the left wing, he drives for the box and curls the ball beyond Neuer" (live
 *  blog); Manuel Neuer in Bayern's goal; Marc Casadó wore 17, Pau Cubarsí 2, Iñigo Martínez 5, Harry Kane 9, Joshua Kimmich 6 (match
 *  photo); KITS (match photo): Barcelona in their home blue-and-garnet shirts with dark-blue shorts and socks and yellow-gold numbers,
 *  Bayern in cream shirts, cream shorts and white socks with dark numbers; Iñaki Peña (Barcelona keeper) in orange.
 * INFERRED / ILLUSTRATIVE: every position, run and speed in metres; the shooting foot (drawn LEFT, his strong foot — no source names the
 *  foot for this goal, so the narration never does); the number of touches on the drive; that he shot from just inside the left of the box;
 *  that the curl started toward Neuer's side and bent away into the far corner at mid height (the sources say only "curls the ball beyond
 *  Neuer" / "into the corner"); Neuer's position and late dive; the Bayern defender chasing him (not named in any source, drawn without a
 *  number) and every other player's position (Kim Min-jae, Upamecano, Guerreiro, Kimmich, Kane and one unnamed Bayern presser; Lewandowski,
 *  Lamine Yamal, Fermín López, Pedri, Koundé, Cubarsí, Iñigo Martínez, Balde); shirt numbers other than 2, 5, 6, 9 (Kane) and 17 (the
 *  usual 2024–25 squad numbers: Raphinha 11, Lewandowski 9, Yamal 19, Fermín 16, Pedri 8, Koundé 23, Balde 3, Neuer 1, Kim 3, Upamecano 2,
 *  Guerreiro 22); Neuer's kit colour (drawn charcoal, never narrated); Casadó striking with his right foot; the celebration run (toward the
 *  near-side fans); which way Barcelona attacked on the main camera (drawn right to left, Raphinha on the near side); hair styles; the ball
 *  design; the stadium drawn as an open oval bowl round a dark track band with a roof over the main stand, floodlights on the rim, green and
 *  blue LED boards, night sky; crowd colours; camera placements and lenses; no referee drawn.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation on a real clock τ
 * (seconds, τ = 0 Raphinha takes Casadó's diagonal): ch1 = the high main-stand broadcast camera, live (Casadó pressed deep, the long
 * diagonal, Raphinha free on the left, the drive, the early shot, the net); ch2 = the TV slow-motion replay, low behind Raphinha (the gap to
 * the chasing defender, the plant, the curl away from Neuer); ch3 = the replay from behind the far post (the ball bends away from Neuer into
 * the corner, then his celebration, three hat-trick balls pop up on "three"); ch4 = a duotone lesson (the space, shoot early, the defender
 * arrives too late). Seams are forward passages into the ball. The curl is a quadratic Bézier on the ground (it starts toward Neuer's side
 * and bends away to the far corner) with a rising-dipping height profile; contact reads the solved skeleton's LEFT toe so ball and boot meet.
 * Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Framing: world centred on the CANVAS centre (never sheet.safe)
 * with a lens that widens for a square window. Inks: yellow (light, grass with blue, Barça numbers), red (Barça garnet, skin), blue (Barça
 * blue, sky, grass), navy (key line, shorts, night). Scenes read only their local t; poses on twos, cameras on ones; all randomness is
 * seeded. Budget ≈ 150–260 plate ops per frame (small wide-shot figures print at 'low'). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,blendPose,posed,runCycle,stand,strike,dribble,backpedal,lunge,celebrate,keeperSet,keeperDive,STRIKE_CONTACT,
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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`raphinha film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py raphinha-signature (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/raphinha-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Montjuïc, live','Barcelona, in blue and red, face Bayern Munich. Casadó, trapped deep, hits a long diagonal. Raphinha runs free on the left. Space in front! He drives at the box and shoots early. Goal!',
  ['Barcelona, in blue and red','Bayern Munich','trapped deep','hits a long diagonal','Raphinha runs free','on the left','Space in front','He drives','shoots early','Goal']),
 prov('Watch again',"Watch again, slowly. No defender is close yet. He doesn't wait. He curls it beyond Neuer.",
  ['Watch again','slowly','No defender','close yet',"He doesn't wait",'curls it','beyond Neuer']),
 prov('Into the corner','From behind: it bends away from Neuer, into the corner! Raphinha scored three that night.',
  ['From behind','bends away','Neuer','into the corner','Raphinha scored','three']),
 prov('Your turn','Your turn: when you have space, shoot early, before the defender closes you down.',
  ['Your turn','when you have space','shoot early','before the defender','closes you down']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`raphinha film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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
function groundLine(path:Path2D,c:Camera,a:[number,number],b:[number,number],w=.12){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;addPoly(path,clipPoly(c,[[a[0]+nx,.02,a[1]+nz],[b[0]+nx,.02,b[1]+nz],[b[0]-nx,.02,b[1]-nz],[a[0]-nx,.02,a[1]-nz]]));}
function groundRing(c:Camera,x:number,z:number,r:number,n=28,rz=r):Pt[]{const o:Pt[]=[];for(let i=0;i<n;i++){const a=i/n*TAU,p:V3=[x+Math.cos(a)*r,.02,z+Math.sin(a)*rz];if(depthOf(c,p)<NEAR)return[];o.push(P(c,p));}return o;}
/** facing yaw for a ground direction (athlete: yaw 0 faces +x, + turns left) */
const YAW=(dx:number,dz:number)=>Math.atan2(-dz,dx);
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
const bump=(a:number,b:number,t:number)=>t<=a||t>=b?0:Math.sin(Math.PI*(t-a)/(b-a));

/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** an arrow head at the end of a projected polyline */
function head(pts:Pt[],w:number):Path2D{const e=pts[pts.length-1],d=pts[pts.length-2],a=Math.atan2(e[1]-d[1],e[0]-d[0]);return polyPath([[e[0]+Math.cos(a)*w*2.2,e[1]+Math.sin(a)*w*2.2],[e[0]+Math.cos(a+2.4)*w*1.7,e[1]+Math.sin(a+2.4)*w*1.7],[e[0]+Math.cos(a-2.4)*w*1.7,e[1]+Math.sin(a-2.4)*w*1.7]],true);}
/** a yellow ground arrow through world points (metres), drawn to fraction u */
function groundArrow(s:Sheet,c:Camera,pts3:[number,number][],u:number,wm=.35,cov=.95,dash=false){if(u<=.02)return;const pts:Pt[]=[],n=24;
 for(let i=0;i<=n;i++){const v=i/n*u*(pts3.length-1),j=Math.min(pts3.length-2,Math.floor(v)),f=v-j,p:V3=[lerp(pts3[j][0],pts3[j+1][0],f),.03,lerp(pts3[j][1],pts3[j+1][1],f)];if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
 if(pts.length<2)return;const mid=pts3[Math.floor((pts3.length-1)*u/2)],w=Math.max(6,wm*kAt(c,[mid[0],0,mid[1]]));const gaps:[number,number][]=[];if(dash)for(let x=.05;x<.95;x+=.1)gaps.push([x,x+.045]);
 yInk(s,ribbon(pts,w,{taper:.1,wobble:.8,gaps:dash?gaps:undefined}),cov);yInk(s,head(pts,w),cov);}

// ================= Montjuïc: an open oval bowl round a dark track band, a roof over the main stand, floodlights on the rim, night sky =================
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-121,1.2,47],[16,1.2,47],[16,27,77],[-121,27,77]],// far side, across from the TV camera
 [[15,1.2,46],[15,1.2,-46],[42,23,-46],[42,23,46]],// behind the goal Barcelona attack
 [[16,1.2,-47],[-121,1.2,-47],[-121,27,-77],[16,27,-77]],// the main stand under the camera
 [[-120,1.2,-46],[-120,1.2,46],[-147,23,46],[-147,23,-46]],// far end
];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper / 1 red (garnet) / 2 yellow (senyeres) / 3 blue / 4 navy, phase] — Barça's blue and garnet */
const CROWD=(()=>{const r=rng(2310),out:[number,number,number,number,number][]=[];[780,320,640,320].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r(),v=.03+r()*.93;if(Math.abs(v-.5)<.03)continue;out.push([st,r(),v,c<.2?0:c<.46?1:c<.54?2:c<.84?3:4,r()*TAU]);}});return out;})();
type Crowd={cheer?:number;flash?:number;t:number;net?:(p:V3)=>V3};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // night over Montjuïc: navy sky, a faint blue glow from the floodlights low down
 s.field(K,.72,.6);s.tone(B,polyPath([[-Bnd,-Bnd*2],[Bnd,-Bnd*2],[Bnd,Bnd],[-Bnd,Bnd]],true),.2);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];s.tone(B,polyPath([[-Bnd,hz-220],[Bnd,hz-220],[Bnd,hz+400],[-Bnd,hz+400]],true),.25);
 // the bowl: knocked out, a navy-grey screen, rows, a light walkway band; the main-stand roof; floodlights along the rims
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),walk=new Path2D(),lamps=new Path2D();
 STANDS.forEach((q,si)=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<16;k+=2)addPoly(rows,clipPoly(c,[bil(q,0,k/16),bil(q,1,k/16),bil(q,1,(k+1)/16),bil(q,0,(k+1)/16)]));
  addPoly(walk,clipPoly(c,[bil(q,0,.47),bil(q,1,.47),bil(q,1,.53),bil(q,0,.53)]));
  const lift:V3=[0,si===2?6:1.5,0];
  if(si===2)addPoly(roof,clipPoly(c,[add(q[3],lift),add(q[2],lift),add(q[2],[0,6,30]),add(q[3],[0,6,30])]));
  for(let k=0;k<(si===0||si===2?20:9);k++){const u=(k+.5)/(si===0||si===2?20:9),p=add(bil(q,u,1),lift);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),3,14);lamps.rect(x-sz,y-sz*.35,sz*2,sz*.7);}});
 s.knockout(stands);s.tone(K,stands,.46);s.tone(B,stands,.22);s.tone(K,rows,.18);
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0,0];
 for(const[st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,4,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(R,heads[1],.95);if(seen[2])s.fill(Y,heads[2],.95);if(seen[3])s.fill(B,heads[3],.95);if(seen[4])s.fill(K,heads[4],.9);
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(24*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.05+r()*.85);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.knockout(walk);s.tone(K,walk,.4);s.fill(K,roof,.92);s.knockout(lamps,.95);
 // the dark track band between the pitch and the stands
 const band=new Path2D();addPoly(band,clipPoly(c,[[-119,0,-46],[14,0,-46],[14,0,46],[-119,0,46]]));s.knockout(band);s.tone(K,band,.55);s.tone(B,band,.4);
 // LED boards along the touchlines and behind the goal: green (yellow × blue) and blue
 const bG=new Path2D(),bB=new Path2D();for(const z of[-35.6,35.6])for(let x=-104;x<4;x+=8){addPoly((Math.round(x/8)&1)?bB:bG,clipPoly(c,[[x,0,z],[x+7.6,0,z],[x+7.6,.9,z],[x,.9,z]]));}
 for(let z=-24;z<24;z+=8)addPoly((Math.round(z/8)&1)?bB:bG,clipPoly(c,[[5,0,z],[5,0,z+7.6],[5,.9,z+7.6],[5,.9,z]]));
 s.knockout(bG);s.knockout(bB);s.fill(Y,bG,.85);s.tone(B,bG,.6);s.fill(B,bB,.9);
 // grass: yellow × blue = green, mowing stripes, paper lines (the box, the D, the six-yard box, the spot, halfway and the centre circle)
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-109,0,-38],[4,0,-38],[4,0,38],[-109,0,38]]));s.knockout(gp);yInk(s,gp,.86);s.tone(B,gp,.64);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.13);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=24;i++){const a=i/24*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
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

// ================= the ball (2024–25 Champions League ball: white with navy star panels — design illustrative) =================
const BALL_R=.11;
function whiteBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);if(duo)s.fill(Y,disc,.2);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
 // two navy stars turning with the spin (reads as the Champions League ball's star panels)
 const pan=new Path2D();for(let k=0;k<2;k++){const a=spin+k*Math.PI,cx=Math.cos(a)*r*.45,cy=Math.sin(a)*r*.45,rr=r*.34,pts:Pt[]=[];for(let i=0;i<10;i++){const b=spin*.6+i/10*TAU,q=i&1?rr*.45:rr;pts.push([cx+Math.cos(b)*q,cy+Math.sin(b)*q]);}pan.addPath(polyPath(pts,true));}
 s.fill(K,pan,.9);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (23 October 2024, from the match photo) and the figure adapter =================
const SKIN_L:AthleteStyle['skin']=[[Y,.32],[R,.2]],SKIN_M:AthleteStyle['skin']=[[Y,.42],[R,.3],[B,.1]],SKIN_D:AthleteStyle['skin']=[[R,.42],[Y,.5],[K,.22]];
type Kit=AthleteStyle;
/** Barcelona: blue-and-garnet shirts, dark-blue shorts and socks, yellow-gold numbers in the photo (drawn as paper numbers: a yellow number under the blue-garnet stripes prints green) */
const BAR=(n:number|null,o:Partial<Kit>={}):Kit=>({shirt:B,pattern:'stripes',patternInk:[R,.95],shorts:[K,.9],socks:[K,.85],trim:Y,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:'paper',seed:40+(n??0),...o});
/** Bayern: cream shirts and shorts, white socks, dark numbers (photo); dark-red trim (inferred) */
const BAY=(n:number|null,o:Partial<Kit>={}):Kit=>({shirt:[Y,.16],shorts:[Y,.16],socks:'paper',trim:R,boots:K,skin:SKIN_L,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,seed:60+(n??7),...o});
const RAPHINHA:Kit=BAR(11,{skin:SKIN_M,hair:[K,.92],hairStyle:'curly',build:{height:1.76,bulk:.9,thighs:.96},seed:11});
const CHASER:Kit=BAY(null,{hair:[K,.8],build:{height:1.8},seed:77});
const NEUER:Kit={shirt:[K,.5],shorts:[K,.7],socks:[K,.5],trim:Y,boots:K,skin:SKIN_L,hair:[Y,.55],hairStyle:'short',gloves:'paper',line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:'paper',build:{height:1.93,bulk:1.05},seed:1};
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:Kit,lead=false):Kit=>({...st,pattern:'plain',patternInk:null,shirt:lead?[K,.45]:[Y,.6],shorts:lead?'paper':[K,.32],socks:lead?'paper':[Y,.6],trim:lead?'paper':K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[K,.9]:K,shade:[K,.2],numberInk:lead?'paper':K,gloves:st.gloves?'paper':undefined});

/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}):DrawResult{
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Raphinha takes Casadó's diagonal) =================
const RB:Build=RAPHINHA.build!;
/** the drive: the diagonal lands at P0; his touches push the ball to P1…P3; B2 is where he strikes it (all inferred, left channel) */
const P0:[number,number]=[-39.2,-22.4],P1:[number,number]=[-33.0,-19.8],P2:[number,number]=[-26.7,-16.9],P3:[number,number]=[-21.3,-14.3],B2:[number,number]=[-16.4,-12.1];
const TOUCH:[number,[number,number]][]=[[0,P0],[.9,P1],[1.75,P2],[2.5,P3]];
const CAS_K=-2.1,CONTACT=3.2,TF=.86,T_GOAL=CONTACT+TF;
/** the curl: from B2 it heads toward Neuer's side (control point left of the straight line), then bends away into the far corner */
const HIT:V3=[0,1.35,2.85],CTRL:[number,number]=[-6.05,-6.98];
const D1:V3=[1.9,1.2,3.1],D2:V3=[1.6,.11,2.8],NET_HIT:V3=[2,1.25,3.0];
const curl=(u:number):V3=>{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return[a*B2[0]+b*CTRL[0]+c*HIT[0],lerp(.11,HIT[1],u)+.9*Math.sin(Math.PI*u)*(1-.3*u),a*B2[1]+b*CTRL[1]+c*HIT[2]];};
/** the body turned a little open (left of the straight line to the corner) at the strike */
const YS=YAW(HIT[0]-B2[0],HIT[2]-B2[1])+10*D2R;
const SHOT_SK=solve(strike(STRIKE_CONTACT,{foot:'l',power:.85}),RB,{yaw:YS});
const YP:[number,number]=[B2[0]-SHOT_SK.lToe[0],B2[1]-SHOT_SK.lToe[2]];
const [sfx,sfz]=dirOf(YS);
/** the drive direction and a point on the drive behind the ball (his body ≈ .5 m behind it) */
const DRV=(()=>{const dx=B2[0]-P0[0],dz=B2[1]-P0[1],l=Math.hypot(dx,dz);return[dx/l,dz/l] as [number,number];})();
const behind=(p:[number,number],d=.5):[number,number]=>[p[0]-DRV[0]*d,p[1]-DRV[1]*d];
/** Casadó's spot (cornered deep in his own half) and the ball at his feet when he strikes the diagonal */
const CB:[number,number]=[-63.4,9.4];

type Role='hero'|'bar'|'bay'|'gk';
type Actor={name:string;role:Role;style:Kit;keys:number[][];key?:boolean};
const ACTORS:Actor[]=[
 {name:'Raphinha',role:'hero',style:RAPHINHA,key:true,keys:[[-9,-62,-30.4],[-5,-60.4,-30.6],[-3.4,-58,-30],[CAS_K,-53.5,-28.8],[-1,-46.6,-25.9],[0,...behind(P0,.45)],[.9,...behind(P1)],[1.75,...behind(P2)],[2.5,...behind(P3)],[CONTACT,YP[0],YP[1]],[CONTACT+.5,YP[0]+sfx*.5,YP[1]+sfz*.5],[T_GOAL+.4,YP[0]+1.6,YP[1]-.8],[T_GOAL+1.6,-10.5,-24],[T_GOAL+3,-7,-30.5],[T_GOAL+4.2,-6,-32],[T_GOAL+7,-6,-32]]},
 {name:'defender',role:'bay',style:CHASER,key:true,keys:[[-9,-45.6,-21],[-4,-45,-21.4],[CAS_K,-44.4,-21.8],[-1,-44.6,-21.8],[0,-42.6,-20.6],[1.75,-30.6,-15.7],[CONTACT,-19.3,-10.4],[CONTACT+.8,-16.4,-9.6],[T_GOAL+2,-15.5,-9.2],[T_GOAL+7,-15.5,-9.2]]},
 {name:'Neuer',role:'gk',style:NEUER,key:true,keys:[[-9,-3.5,.5],[0,-2.6,-1.2],[2,-2.8,-2],[CONTACT,-2.9,-2.3],[T_GOAL+7,-2.9,-2.3]]},
 {name:'Casadó',role:'bar',style:BAR(17,{skin:SKIN_L,hair:[K,.85]}),key:true,keys:[[-9,-67.6,12.2],[-6.4,-65.2,10.8],[-5,-64.6,10.2],[-3.4,-64.4,10],[CAS_K,CB[0]-.55,CB[1]+.3],[-1,-62.6,8.8],[2,-58,6],[T_GOAL+7,-52,4]]},
 {name:'Kane',role:'bay',style:BAY(9,{hair:[Y,.45]}),keys:[[-9,-58,4],[-5,-61.2,7.4],[-3.4,-62.2,8.4],[CAS_K,-62.2,8.8],[0,-60.5,8],[4,-58,6]]},
 {name:'presser',role:'bay',style:BAY(null,{hair:[K,.7]}),keys:[[-9,-60,17],[-5,-63,13.2],[-3.4,-63.6,11.9],[CAS_K,-63.2,11.4],[0,-61.2,10.8],[4,-58,9]]},
 {name:'Kim',role:'bay',style:BAY(3,{hair:[K,.85],build:{height:1.9,bulk:1.05}}),keys:[[-9,-45,-7.6],[CAS_K,-43.6,-8.6],[0,-37.6,-9],[1.75,-26.4,-7.2],[CONTACT,-15.2,-4.6],[T_GOAL+1,-11,-3.4],[T_GOAL+7,-10,-3]]},
 {name:'Upamecano',role:'bay',style:BAY(2,{skin:SKIN_D,build:{height:1.86,bulk:1.08}}),keys:[[-9,-45.6,2.4],[CAS_K,-44.8,1.8],[0,-39.4,1.2],[CONTACT,-17.4,1.2],[T_GOAL+1,-12.6,1],[T_GOAL+7,-12,1]]},
 {name:'Guerreiro',role:'bay',style:BAY(22,{hair:[K,.8],build:{height:1.7}}),keys:[[-9,-46.6,17],[CAS_K,-45.4,15.4],[0,-40.4,13],[CONTACT,-22.4,9],[T_GOAL+7,-18,8]]},
 {name:'Kimmich',role:'bay',style:BAY(6,{hair:[Y,.4],build:{height:1.77}}),keys:[[-9,-55,-3],[CAS_K,-53.6,-1.6],[CONTACT,-36,-3],[T_GOAL+7,-30,-3]]},
 {name:'Lewandowski',role:'bar',style:BAR(9,{hair:[K,.8],build:{height:1.85}}),keys:[[-9,-47.4,-1.6],[CAS_K,-46.4,-2.2],[0,-39,-2.6],[CONTACT,-14.2,-1.2],[T_GOAL+1,-10.5,-3],[T_GOAL+7,-10,-8]]},
 {name:'Yamal',role:'bar',style:BAR(19,{skin:SKIN_D,hair:[K,.9]}),keys:[[-9,-50,23],[CAS_K,-47,21.6],[CONTACT,-26,17.6],[T_GOAL+7,-20,14]]},
 {name:'Fermín',role:'bar',style:BAR(16,{hair:[K,.85]}),keys:[[-9,-50.6,8.6],[CAS_K,-48,7.2],[CONTACT,-24,3.6],[T_GOAL+7,-18,-4]]},
 {name:'Pedri',role:'bar',style:BAR(8,{hair:[K,.85]}),keys:[[-9,-60,-6],[CAS_K,-57,-5],[CONTACT,-44,-4],[T_GOAL+7,-36,-6]]},
 {name:'Koundé',role:'bar',style:BAR(23,{skin:SKIN_D}),keys:[[-9,-71,26],[CONTACT,-61,23]]},
 {name:'Cubarsí',role:'bar',style:BAR(2,{hair:[K,.8]}),keys:[[-9,-79,6],[CONTACT,-69,5]]},
 {name:'Iñigo Martínez',role:'bar',style:BAR(5,{hair:[K,.6]}),keys:[[-9,-79,-8],[CONTACT,-69,-7]]},
 {name:'Balde',role:'bar',style:BAR(3,{skin:SKIN_D}),keys:[[-9,-72,-27],[CONTACT,-58,-24]]},
];
const RAP=0,CHS=1,GK=2,CAS=3,KANE=4,PRS=5;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:number[][],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:number)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const T0=-9,T1=12,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(T1-T0)/DT;i++){const[x,z]=herm(a.keys,T0+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-T0)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.08),b=posOf(k,tau+.08);return[(b[0]-a[0])/.16,(b[1]-a[1])/.16];};

// ---- the ball: Casadó's feet → the long diagonal → Raphinha's touches on the drive → the curl → the net ----
const fwdBall=(k:number,tau:number,d=.5):[number,number]=>{const p=posOf(k,tau),v=velOf(k,tau),sp=Math.hypot(v[0],v[1]);if(sp<.3){const g=YAW(P0[0]-p[0],P0[1]-p[1]),[fx,fz]=dirOf(g);return[p[0]+fx*d,p[1]+fz*d];}return[p[0]+v[0]/sp*d,p[1]+v[1]/sp*d];};
const DIAG_H=8.5;
function ballAt(tau:number):V3{
 if(tau<CAS_K){const f=fwdBall(CAS,tau,.5+.1*Math.sin(tau*4));return[f[0],.11,f[1]];}
 if(tau<0){const u=(tau-CAS_K)/-CAS_K;return[lerp(CB[0],P0[0],u),.11+4*DIAG_H*u*(1-u),lerp(CB[1],P0[1],u)];}
 if(tau<CONTACT){let i=0;while(i+1<TOUCH.length&&tau>=TOUCH[i+1][0])i++;const[t0,a]=TOUCH[i],[t1,b]=i+1<TOUCH.length?TOUCH[i+1]:[CONTACT,B2],u=clamp((tau-t0)/(t1-t0)),e=1.5*u-.5*u*u;return[lerp(a[0],b[0],e),.11,lerp(a[1],b[1],e)];}
 const s=tau-CONTACT;if(s<TF){const u=s/TF;return curl(1.1*u-.1*u*u);}
 const e=s-TF;if(e<.16)return mix3(HIT,D1,easeOut(e/.16));
 const d=clamp((e-.16)/.5),h=D1[1]*(1-d*d)+.11*d*d;return[lerp(D1[0],D2[0],d),Math.max(.11,h)+(d>=1?.08*Math.abs(Math.sin((e-.66)*8))*Math.exp(-(e-.66)*3):0),lerp(D1[2],D2[2],d)];
}

// ---- poses ----
const RAD=D2R;
const LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
/** blend channel overrides (degrees) into a pose with weight w */
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as (keyof Pose)[]){const v=LINEAR.has(k)?d[k]!:d[k]!*RAD;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:12,rHipA:12,lean:18,pitch:4,lShA:28,rShA:28,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-4});
/** taking the diagonal on the run: eyes up to the dropping ball, arms out for balance */
const TAKE:Partial<Pose>={lean:8,neckP:-26,lShA:52,rShA:46,lElb:34,rElb:34,lHipF:34,lKnee:40};
/** the look up before the strike (the space is there: no one close) */
const LOOK:Partial<Pose>={neckP:-8,neckY:18,lean:10};
const SD=.95,S_START=CONTACT-STRIKE_CONTACT*SD;
const goalYaw=(x:number,z:number)=>YAW(-x,1.5-z);
function poseOf(k:number,tau:number):{pose:Pose;place:Place}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau),toBall=YAW(b[0]-x,b[2]-z);
 let yaw=sp>.6?YAW(v[0],v[1]):toBall,p:Pose;
 if(a.role==='hero'){
  if(tau<-.25){p=blendPose(idle(tau,1),runCycle(distOf(k,tau)/3.4,{speed:clamp(sp/7.5)}),clamp(sp/1.1));p=over(p,TAKE,sm(-1.2,-.5,tau)*(1-sm(-.3,0,tau)));}
  else if(tau<T_GOAL+.25){const dr=dribble(distOf(k,tau)/2.2,{foot:'l',speed:.55+.4*clamp(sp/7)});p=blendPose(READY,dr,clamp(sp/.9));
   yaw=sp>.5?lerpAng(YAW(v[0],v[1]),goalYaw(x,z),.15+.4*sm(1.8,2.6,tau)):goalYaw(x,z);
   p=over(p,LOOK,bump(1.9,2.7,tau));
   const u=(tau-S_START)/SD;if(u>-.2){yaw=lerpAng(yaw,YS,sm(-.2,.25,u));p=blendPose(p,strike(clamp(u),{foot:'l',power:.85}),Math.min(sm(-.15,.12,u),1-sm(1.05,1.5,u)));
    p=over(p,{twist:-12},bump(.25,.8,u));}}
  else if(tau<T_GOAL+3.4){p=blendPose(READY,celebrate(distOf(k,tau)/3.4,{kind:'run'}),sm(T_GOAL+.25,T_GOAL+.7,tau));}
  else{p=celebrate((tau-(T_GOAL+3.4))*.9,{kind:'arms'});yaw=YAW(0,-1);}
 }else if(a.role==='gk'){
  yaw=YAW(b[0]-x,b[2]-z);const q=keeperSet(tau*1.5),dAt=T_GOAL-.2,dd=.95,t0=dAt-.55*dd,u=(tau-t0)/dd;
  p=u>0?keeperDive(Math.min(1,u),{side:'l',height:.6}):q;if(u>0)yaw=YAW(-1,0);
  if(u<=0&&tau<0)p=blendPose(p,idle(tau,4),.4);
 }else{
  const bay=a.role==='bay',along=v[0]*Math.cos(toBall)-v[1]*Math.sin(toBall);
  if(bay&&sp>.4&&sp<3.2&&along<0){p=blendPose(READY,backpedal(distOf(k,tau)/1.1),clamp((sp-.4)/.8));yaw=toBall;}
  else{const s=clamp((sp-1.5)/5.5);p=blendPose(bay?READY:idle(tau,k),runCycle(distOf(k,tau)/3.3+k*.37,{speed:s}),clamp((sp-.3)/.9));if(sp<.6)yaw=toBall;}
  if(k===CHS){const lu=(tau-(CONTACT-.08-.6*.8))/.8;if(lu>0&&lu<1.7)p=blendPose(p,lunge(Math.min(1,lu),{side:'r'}),Math.min(sm(0,.15,lu),1-sm(1,1.7,lu)));
   if(tau>-1&&tau<CONTACT+.3){const r=posOf(RAP,tau);yaw=YAW(r[0]-x,r[1]-z);}}
  if(k===CAS){if(tau<CAS_K-.9&&tau>-6)p=over(p,{lean:22,neckP:20,bend:10*Math.sin(tau*3)},1);// shielding, cornered
   const u=(tau-(CAS_K-STRIKE_CONTACT*.85))/.85;if(u>0&&u<1.3){p=blendPose(p,strike(Math.min(1,u),{power:.9}),Math.min(sm(0,.15,u),1-sm(1,1.3,u)));yaw=YAW(P0[0]-CB[0],P0[1]-CB[1]);}}
  if((k===KANE||k===PRS)&&tau<CAS_K+.3){const c=posOf(CAS,tau);yaw=YAW(c[0]-x,c[1]-z);}
  if(a.role==='bar'&&tau>T_GOAL+.5)p=over(p,{lShA:150,rShA:150,lShF:20,rShF:20,lElb:14,rElb:14,neckP:-20,lHand:1,rHand:1},sm(T_GOAL+.5,T_GOAL+1,tau)*(k===CAS?.5:.7));
  if(bay&&tau>T_GOAL+.8)p=over(p,{lean:34,neckP:30,lShA:10,rShA:10},sm(T_GOAL+.8,T_GOAL+1.6,tau)*.8);
 }
 return{pose:p,place:{x,z,yaw}};
}

type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Raphinha with motion smear + secondary motion; `cap` limits figure detail
 * (passages), small figures in wide shots print at 'low'. `style` swaps kits (the duotone lesson). */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean;only?:number[];style?:(k:number)=>Kit;duoBall?:boolean;noBall?:boolean}){
 const ball=ballAt(tau),items:Item[]=[],ppu=pxPer(s);
 ACTORS.forEach((a,k)=>{if(o.only&&!o.only.includes(k))return;const st=poseOf(k,tp),g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(k===RAP?1:2.5))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&k!==RAP&&hPx<30)return;const detail:Detail|undefined=hPx<55||(!a.key&&hPx<100)||(o.cap&&k!==RAP&&hPx<150)?'low':o.cap?'mid':undefined;
  const style=o.style?o.style(k):a.style,hero=k===RAP&&!!o.hero&&!o.cap;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev:hero?poseOf(k,tp-1/12):undefined,smear:hero,detail})});});
 if(!o.noBall)items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  whiteBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx),duo:o.duoBall});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball};}
/** ground ring round a player (team rings, the defender) */
function ringAt(path:Path2D,c:Camera,k:number,tp:number,g:number,r=.9){const p=posOf(k,tp),q=groundRing(c,p[0],p[1],r*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[p[0],0,p[1]])),{close:true,taper:0,wobble:.6}));}
/** the curl's path on the grass (projected shadow line) or in the air, u ∈ [0, n] */
function curlPath(c:Camera,n:number,air:boolean):Pt[]{const pts:Pt[]=[];for(let i=0;i<=30;i++){const u=i/30*n,p=curl(u),q:V3=air?p:[p[0],.03,p[2]];if(depthOf(c,q)>NEAR)pts.push(P(c,q));}return pts;}
/** the ball's flight so far as dots (the diagonal or the curl) */
function flightDots(c:Camera,from:number,to:number,rMin:number,rMax:number,k=.05):Path2D{const dots=new Path2D();for(let i=0;i<=18;i++){const t2=from+(to-from)*i/18,p=ballAt(t2);if(depthOf(c,p)<NEAR+.5)continue;const pp=P(c,p),r=clamp(k*kAt(c,p),rMin,rMax);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);}return dots;}
/** "space": a stippled yellow pool on the grass in front of him, toward the box (the lesson's picture) */
function spacePool(s:Sheet,c:Camera,tp:number,w:number){if(w<=.02)return;const r=posOf(RAP,tp),cx=lerp(r[0],B2[0],.55)+DRV[0]*2,cz=lerp(r[1],B2[1],.55)+DRV[1]*2,rx=Math.max(4,Math.hypot(B2[0]-r[0],B2[1]-r[1])*.55+2.5)*w;
 const g=groundRing(c,cx,cz,rx,36,rx*.62);if(g.length>2){const p=polyPath(g,true);s.knockout(p,.5);s.tone(Y,p,.55);s.fill(Y,ribbon(g,Math.max(4,.1*kAt(c,[cx,0,cz])),{close:true,taper:0,wobble:.8,gaps:[[.1,.16],[.35,.41],[.6,.66],[.85,.91]]}),.95);}}
/** the gap between the chasing defender and Raphinha: a dashed yellow measure */
function gapLine(s:Sheet,c:Camera,tp:number,w:number){if(w<=.02)return;const a=posOf(CHS,tp),b=posOf(RAP,tp),m:[number,number]=[lerp(a[0],b[0],.5),lerp(a[1],b[1],.5)],pa=P(c,[a[0],.05,a[1]]),pb=P(c,[lerp(a[0],b[0],w),.05,lerp(a[1],b[1],w)]),k=kAt(c,[m[0],0,m[1]]),gaps:[number,number][]=[];for(let u=.08;u<1;u+=.2)gaps.push([u,u+.09]);
 yInk(s,ribbon([pa,pb],Math.max(5,.1*k),{taper:0,wobble:0,gaps}),.95);}

// ================= chapter 1 (live): the high main-stand camera; Casadó pressed deep, the diagonal, Raphinha free, the drive, the early shot =================
const ch1q=()=>({bl:T(0,'Barcelona, in blue and red'),bm:T(0,'Bayern Munich'),td:T(0,'trapped deep'),hl:T(0,'hits a long diagonal'),rf:T(0,'Raphinha runs free'),ol:T(0,'on the left'),sf:T(0,'Space in front'),hd:T(0,'He drives'),se:T(0,'shoots early'),g:T(0,'Goal'),end:SEC(0)});
/** τ keyed to the words: a pre-roll with Casadó under pressure, then the play at roughly real time between the cues */
const tau1=(t:number)=>{const q=ch1q();return key(t,mono([[0,-7.2],[q.bm,-5.6],[q.td,-3.9],[q.hl,-2.35],[q.rf,-.55],[q.ol,.3],[q.sf,1.0],[q.hd,1.75],[q.se,CONTACT],[q.g,T_GOAL+.45],[q.end,T_GOAL+.45+(q.end-q.g)*.95]]),x=>x);};
const BCAM:V3=[-42,22,-62];
function ch1Look(tau:number):V3{const b=ballAt(Math.min(tau,T_GOAL+.2)),r=posOf(RAP,tau);
 if(tau<CAS_K)return[b[0]+2,1,b[2]-2];
 if(tau<0){const u=sm(CAS_K,0,tau,easeInOutSine);return mix3([CB[0]+2,1,CB[1]-2],[P0[0]+2,1.5,P0[1]+3],u);}
 if(tau<CONTACT)return[b[0]+3,1,b[2]+2];
 if(tau<T_GOAL+.6)return mix3([b[0],1.2,b[2]],[-4,1.3,-1],sm(CONTACT,T_GOAL,tau)*.6);
 return mix3([-4,1.3,-1],[r[0],1.2,r[1]],sm(T_GOAL+.6,T_GOAL+2.2,tau,easeInOutSine));}
function ch1Cam(t:number){const q=ch1q(),tau=tau1(t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.25),c=f(tau-.5);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const wide:V3=[-45,2,4],look=mix3(wide,av(ch1Look),sm(q.bl+.4,q.bm+.6,t,easeInOutSine));
 const F=key(t,mono([[0,1500],[q.bm,2600],[q.td,5400],[q.hl,4600],[q.hl+.8,3000],[q.rf,3800],[q.ol,4600],[q.sf,4200],[q.hd,5000],[q.se,5400],[q.g,4700],[q.g+.6,4500],[q.end,5000]]),easeInOutSine);return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const q=ch1q(),tt=twos(t),c=ch1Cam(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-T_GOAL;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // team rings: blue for Barcelona on "Barcelona, in blue and red", navy for Bayern on "Bayern Munich"; "trapped deep": yellow on Casadó, navy on his two pressers
  const ra=sm(q.bl,q.bl+.3,tt,easeOutBack)*(1-sm(q.bm,q.bm+.5,tt)),rb=sm(q.bm,q.bm+.3,tt,easeOutBack)*(1-sm(q.td,q.td+.5,tt)),rc=sm(q.td,q.td+.3,tt,easeOutBack)*(1-sm(q.hl+.2,q.hl+.7,tt));
  const rr=sm(q.rf,q.rf+.3,tt,easeOutBack)*(1-sm(q.sf+.2,q.sf+.8,tt));
  if(ra>.02||rb>.02||rc>.02||rr>.02){const pa=new Path2D(),pb=new Path2D(),py=new Path2D();
   ACTORS.forEach((a,k)=>{if((a.role==='bar'||a.role==='hero')&&ra>.02)ringAt(pa,c,k,tp,ra);if((a.role==='bay'||a.role==='gk')&&rb>.02)ringAt(pb,c,k,tp,rb);});
   if(rc>.02){ringAt(py,c,CAS,tp,rc*1.2);ringAt(pb,c,KANE,tp,rc);ringAt(pb,c,PRS,tp,rc);}if(rr>.02)ringAt(py,c,RAP,tp,rr*1.3);
   s.fill(B,pa,.95);s.fill(K,pb,.9);yInk(s,py,.95);}
  // "hits a long diagonal": the flight traced as yellow dots across the pitch
  if(tp>CAS_K&&tp<.6){const fade=1-sm(.1,.6,tp);yInk(s,flightDots(c,CAS_K,Math.min(tp,0),5,11,.09),.9*fade);}
  // "on the left": a dashed yellow lane along the left channel; "Space in front": the empty grass ahead lights up
  groundArrow(s,c,[[-44,-29],[-30,-27],[-18,-22]],sm(q.ol-.1,q.ol+.6,tt,easeOut)*(1-sm(q.sf,q.sf+.5,tt)),.5,.9,true);
  spacePool(s,c,tp,sm(q.sf-.1,q.sf+.4,tt,easeOutBack)*(1-sm(q.se,q.se+.5,tt)));
  // "He drives": an arrow from him to the box
  const hd=sm(q.hd-.1,q.hd+.5,tt,easeOut)*(1-sm(q.se+.1,q.se+.5,tt));if(hd>.02){const r=posOf(RAP,Math.min(tp,2)),e:[number,number]=[B2[0]+.4,B2[1]+.2];groundArrow(s,c,[[r[0]+DRV[0]*1.2,r[1]+DRV[1]*1.2],e],hd,.4);}
  drawWorld(s,c,tau,tp,{ballMin:10,cap:t>q.end-.7});
  // "shoots early": a spark off the boot
  if(tp>=CONTACT&&tp<CONTACT+.25){const b=P(c,[B2[0],.2,B2[1]]);sparkBurst(s,Y,b[0],b[1],70+60*sm(CONTACT,CONTACT+.1,tp,easeOut),{n:9,seed:11,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:9});}
  if(tp>=T_GOAL&&tp<T_GOAL+.35){const b=P(c,HIT);sparkBurst(s,Y,b[0],b[1],80*easeOutBack(clamp((tp-T_GOAL)/.12)),{n:9,seed:12,g:1-sm(T_GOAL+.12,T_GOAL+.35,tp),width:9});}},
 aperture(t){const c=ch1Cam(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:10,
};

// ================= chapter 2 (TV replay, slow motion, low behind Raphinha): the gap, no one close, the strike, the curl beyond Neuer =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),nd:T(1,'No defender'),cy:T(1,'close yet'),hw:T(1,"He doesn't wait"),ci:T(1,'curls it'),bn:T(1,'beyond Neuer'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,1.2],[q.sl,1.55],[q.nd,1.95],[q.cy,2.3],[q.hw,2.62],[q.ci,CONTACT+.04],[q.bn,CONTACT+.55],[q.end,T_GOAL+.15]]),x=>x);};
function ch2Cam(t:number){const q=ch2q(),tau=tau2(t),b=ballAt(tau),r=posOf(RAP,Math.min(tau,CONTACT+.3)),orbit=sm(q.w,q.hw,t,easeInOutSine),follow=sm(q.ci,q.bn+.4,t,easeInOutSine);
 const hero:V3=[r[0],.95,r[1]],base=YAW(DRV[0],DRV[1]),a0=base+Math.PI-70*D2R,a1=base+Math.PI-18*D2R,ang=lerp(a0,a1,orbit),[dx,dz]=dirOf(ang),D=lerp(5.6,4.6,orbit)+2.4*follow;
 const pos:V3=[hero[0]+dx*D,1.1+.6*follow,hero[2]+dz*D];
 const look=mix3(mix3(hero,[b[0],Math.min(b[1],2.2),b[2]],.35),[b[0],clamp(b[1],.8,2.4),b[2]],follow);
 const F=key(t,mono([[0,1500],[q.sl,1650],[q.nd,1500],[q.cy,1600],[q.hw,1900],[q.ci,1800],[q.bn,1700],[q.end,1900]]));return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.05});
  // "No defender": the dashed gap to the chasing defender, a ring on him; "close yet": the open grass ahead
  const nd=sm(q.nd-.1,q.nd+.4,tt,easeOut)*(1-sm(q.hw,q.hw+.5,tt));gapLine(s,c,tp,nd);
  if(nd>.02){const pr=new Path2D();ringAt(pr,c,CHS,tp,nd,1);yInk(s,pr,.95);}
  spacePool(s,c,tp,sm(q.cy-.1,q.cy+.4,tt,easeOutBack)*(1-sm(q.ci,q.ci+.5,tt)));
  // "curls it": the ball's path traced in the air as dots; "beyond Neuer": a ring on the keeper
  if(tp>CONTACT&&tp<T_GOAL+.3)yInk(s,flightDots(c,CONTACT,Math.min(tp,T_GOAL),6,14,.06),.9);
  const bn=sm(q.bn-.1,q.bn+.3,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.4,tt));if(bn>.02){const pr=new Path2D();ringAt(pr,c,GK,tp,bn,1.1);yInk(s,pr,.95);}
  const w=drawWorld(s,c,tau,tp,{ballMin:20,hero:true,glow:sm(q.w,q.w+.4,tt)*(1-sm(q.sl+.2,q.nd,tt)),cap:t>q.end-.7||t<.6});
  // "He doesn't wait": a ring on the striking (left) boot as the leg swings through
  const hw=sm(q.hw-.1,q.hw+.25,tt,easeOutBack)*(1-sm(q.ci+.2,q.ci+.6,tt));if(hw>.02){const st=poseOf(RAP,tp),sk=solve(st.pose,RB,st.place),p=P(c,sk.lToe),r=.3*kAt(c,sk.lToe)*hw;yRing(s,p[0],p[1],r,Math.max(4,.035*kAt(c,sk.lToe)));}
  if(tp>=CONTACT&&tp<CONTACT+.25){const p=P(c,[B2[0],.15,B2[1]]);sparkBurst(s,Y,p[0],p[1],110+100*sm(CONTACT,CONTACT+.1,tp,easeOut),{n:10,seed:14,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:12});}
  if(tp>=CONTACT&&tp<CONTACT+.6&&depthOf(c,w.ball)>NEAR+.5){const a=P(c,ballAt(tp-.05)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:15,len:150,width:6,cov:.8});}},
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t));if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[x,y]=P(c,p),r=Math.max(20,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5,
};

// ================= chapter 3 (replay from behind the far post): the ball bends away from Neuer into the corner, then the celebration =================
const ch3q=()=>({fb:T(2,'From behind'),ba:T(2,'bends away'),ne:T(2,'Neuer'),ic:T(2,'into the corner'),rs:T(2,'Raphinha scored'),th:T(2,'three'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,CONTACT+.08],[q.ba,CONTACT+.32],[q.ne,T_GOAL-.3],[q.ic,T_GOAL+.02],[q.rs,T_GOAL+1.4],[q.th,T_GOAL+2.3],[q.end,T_GOAL+3.9]]),x=>x);};
const GCAM:V3=[7.2,1.9,5.6];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.min(tau,T_GOAL-.02)),r=posOf(RAP,tau);
 const toBall=sm(0,q.ne,t,easeInOutSine),toHero=sm(q.ic+.4,q.rs+.6,t,easeInOutSine);
 const look0:V3=[B2[0]+5,1.3,B2[1]+3],look1:V3=[b[0],clamp(b[1],1,2.6),b[2]],look2:V3=[r[0],1.1,r[1]];
 const look=mix3(mix3(look0,look1,toBall),look2,toHero);
 const pos:V3=add(GCAM,[-3*toHero,3.2*toHero,-7*toHero]),F=key(t,mono([[0,2300],[q.ba,2000],[q.ne,1750],[q.ic,1650],[q.ic+.8,1800],[q.rs,3600],[q.th,4600],[q.end,5000]]));return cam(pos,look,F);}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_GOAL,hitT=q.ic;
  const shake=t>=hitT?8*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.12+1.1*sm(0,.5,goalIn),flash:.1+1.4*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "bends away": the ball's path as dotted ink while it bends; the straight line it did NOT take, dashed yellow toward Neuer
  if(tp>CONTACT&&tp<T_GOAL+.3)s.fill(K,flightDots(c,CONTACT,Math.min(tp,T_GOAL),3,14,.045),.6);
  const ba=sm(q.ba-.1,q.ba+.4,tt,easeOut)*(1-sm(q.ic,q.ic+.5,tt));if(ba>.02){const pts=curlPath(c,ba,true);if(pts.length>1){const w=Math.max(6,.05*kAt(c,[-6,1,-5]));yInk(s,ribbon(pts,w,{taper:.2,wobble:.6}),.95);yInk(s,head(pts,w),.95);}}
  // "Neuer": a ring on the keeper as the ball goes past his reach
  const ne=sm(q.ne-.1,q.ne+.3,tt,easeOutBack)*(1-sm(q.ic+.3,q.ic+.8,tt));if(ne>.02){const pr=new Path2D();ringAt(pr,c,GK,tp,ne,1.2);yInk(s,pr,.95);}
  const w=drawWorld(s,c,tau,tp,{ballMin:13,hero:t>q.rs,cap:t>q.end-.7||t<.6});
  if(tp>CONTACT+.4&&tp<T_GOAL+.1&&depthOf(c,w.ball)>NEAR+.6){const a=P(c,ballAt(tp-.06)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:21,len:160,width:7,cov:.8});}
  // "into the corner": a yellow corner bracket in the angle of the far post and the bar, a spark where the ball hits the net
  const ic=sm(q.ic-.1,q.ic+.3,tt,easeOutBack)*(1-sm(q.rs,q.rs+.5,tt));if(ic>.02){const C0:V3=[0,2.44,3.66];if(depthOf(c,C0)>NEAR+.3){const k=kAt(c,C0),a=P(c,[0,2.44-1.1*ic,3.66]),m=P(c,C0),b=P(c,[0,2.44,3.66-1.1*ic]);yInk(s,ribbon([a,m,b],Math.max(7,.12*k),{taper:.1,wobble:1}),.95);}}
  if(tp>=T_GOAL&&tp<T_GOAL+.35&&depthOf(c,NET_HIT)>NEAR+.3){const p=P(c,NET_HIT);sparkBurst(s,Y,p[0],p[1],(90+.6*kAt(c,NET_HIT))*easeOutBack(clamp((tp-T_GOAL)/.1)),{n:9,seed:22,g:1-sm(T_GOAL+.12,T_GOAL+.35,tp),width:11});}
  // "Raphinha scored": a ring round him; "three": three yellow balls pop up over his head, one by one (his hat-trick that night)
  const rs=sm(q.rs,q.rs+.35,tt,easeOutBack);if(rs>.02){const pr=new Path2D();ringAt(pr,c,RAP,tp,rs,1.3);yInk(s,pr,.95);}
  const th=t-q.th;if(th>0){const r=posOf(RAP,tp),hp:V3=[r[0],2.9,r[1]];if(depthOf(c,hp)>NEAR+.5){const[hx,hy]=P(c,hp),k=kAt(c,hp),rad=Math.max(12,.2*k),gap=rad*2.6;
   for(let i=0;i<3;i++){const u=easeOutBack(clamp((th-i*.28)/.3));if(u<=0)continue;const x=hx+(i-1)*gap,y=hy-rad*.4*u;yRing(s,x,y,rad*1.45*u,Math.max(3,rad*.22));whiteBall(s,x,y,rad*u,i*1.7+t*2);}}}},
 aperture(t){const c=ch3Cam(t),tau=tau3(t),[x,z]=posOf(RAP,tau),p:V3=[x,1.1,z];if(depthOf(c,p)<NEAR+.5)return apertureDisc(0,0,40,12);const[px,py]=P(c,p);return apertureDisc(px,py,Math.max(20,.2*kAt(c,p)),12);},
 still:4.4,
};

// ================= chapter 4 (duotone lesson): when you have space, shoot early, before the defender closes you down =================
const ch4q=()=>({yt:T(3,'Your turn'),wh:T(3,'when you have space'),se:T(3,'shoot early'),bd:T(3,'before the defender'),cd:T(3,'closes you down'),end:SEC(3)});
const tau4=(t:number)=>{const q=ch4q();return key(t,mono([[0,1.9],[q.wh,2.3],[q.se,CONTACT],[q.bd,CONTACT+.3],[q.cd,T_GOAL-.1],[q.end,T_GOAL+.3]]),x=>x);};
const LCAM=(t:number)=>{const q=ch4q(),v=key(t,mono([[0,-4.6,3.2,-9.6,1900],[q.wh,-3.6,3,-9.4,2000],[q.se,-2.6,3,-9.2,1900],[q.cd,-1.8,3.2,-9,1750],[q.end,-1.4,3.4,-9,1700]]),easeInOutSine,true);
 const r=posOf(RAP,Math.min(tau4(t),CONTACT)),lk=sm(q.wh,q.cd,t,easeInOutSine);return cam([B2[0]+v[0],v[1],B2[1]+v[2]],mix3([r[0]+1.5,.9,r[1]+.8],[-8,.9,-4],lk*.6),v[3]);};
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  // the stage: a navy print, the ground as stepped yellow light round Raphinha, the goal in paper
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-30],[4,0,-30],[4,0,30],[-60,0,30]]));s.tone(K,floor,.2);
  const pool=(x:number,z:number,r:number)=>{const g=groundRing(c,x,z,r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(B2[0]+.5,B2[1],6),.2);s.tone(Y,pool(B2[0]+.3,B2[1],3.2),.2);s.tone(Y,pool(-1,1,5),.15);
  goal(s,c,tp>T_GOAL?netRipple(tp-T_GOAL,NET_HIT):undefined);
  // "Your turn": a ring round the ball at his feet
  const yt=sm(q.yt,q.yt+.4,tt,easeOutBack)*(1-sm(q.wh,q.wh+.4,tt));if(yt>.02){const b=ballAt(tp),g=groundRing(c,b[0],b[2],.55*yt,24);if(g.length>2)yInk(s,ribbon(g,Math.max(5,.07*kAt(c,b)),{close:true,taper:0,wobble:.6}),.95);}
  // "when you have space": the open grass between him and goal lights up
  spacePool(s,c,tp,sm(q.wh-.1,q.wh+.5,tt,easeOutBack)*(1-sm(q.cd+.2,q.cd+.7,tt)));
  // "shoot early": the curl draws itself ahead of the strike, dotted in the air, its shadow on the grass
  const se=sm(q.se-.4,q.se+.6,tt,easeOut);if(se>.02){const air=curlPath(c,se,true),gr=curlPath(c,se,false),dots=new Path2D();air.forEach((p,i)=>{if(i%2)return;dots.moveTo(p[0]+7,p[1]);dots.arc(p[0],p[1],7,0,TAU);});yInk(s,dots,.95);
   if(gr.length>1)s.tone(Y,ribbon(gr,10,{taper:.2,wobble:.6}),.5);}
  // "before the defender": a ring on the chasing defender and his run; "closes you down": his arrow reaches the shooting spot — too late, the ball has gone
  const bd=sm(q.bd-.1,q.bd+.3,tt,easeOutBack)*(1-sm(q.end-.8,q.end-.3,tt));if(bd>.02){const pr=new Path2D();ringAt(pr,c,CHS,tp,bd,1);yInk(s,pr,.95);}
  const cd=sm(q.cd-.2,q.cd+.5,tt,easeOut)*(1-sm(q.end-.8,q.end-.3,tt));if(cd>.02){const a=posOf(CHS,CONTACT);groundArrow(s,c,[[a[0]+.4,a[1]+.2],[B2[0]-.3,B2[1]+.1]],cd,.12,.95,true);
   if(cd>.8){const m=P(c,[B2[0],.05,B2[1]]),k=kAt(c,[B2[0],0,B2[1]]),d=Math.max(8,.3*k)*sm(.8,1,cd);s.fill(Y,ribbon([[m[0]-d,m[1]-d*.5],[m[0]+d,m[1]+d*.5]],Math.max(4,.06*k),{taper:0,wobble:.4}),.95);s.fill(Y,ribbon([[m[0]-d,m[1]+d*.5],[m[0]+d,m[1]-d*.5]],Math.max(4,.06*k),{taper:0,wobble:.4}),.95);}}
  const styleOf=(k:number)=>k===RAP?duo(RAPHINHA,true):duo(ACTORS[k].style);
  drawWorld(s,c,tau,tp,{ballMin:14,hero:true,only:[RAP,CHS,GK],style:styleOf,duoBall:true});
  if(tp>=CONTACT&&tp<CONTACT+.25){const p=P(c,[B2[0],.15,B2[1]]);sparkBurst(s,Y,p[0],p[1],110,{n:10,seed:41,g:1-sm(CONTACT+.1,CONTACT+.25,tp),width:11});}},
 still:5.5,
};

const story:RisoStory={
 id:'raphinha-signature',format:'11v11',title:"Raphinha's early strike",
 theme:'When you have space, shoot early before the defender closes you down.',
 ageNote:'UEFA Champions League, Barcelona 4–1 Bayern Munich, Estadi Olímpic Lluís Companys, 23 October 2024. His 45th-minute goal, the second of his hat-trick.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: an early strike — the ball bends away from the point along a yellow curling trail. Reduced motion: the ball and the curve, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?0:clamp(age/.8),pt=(v:number):Pt=>[x+v*260+Math.sin(v*Math.PI)*110,y-v*150-Math.sin(v*Math.PI)*40];
  const trail:Pt[]=[];for(let i=0;i<=16;i++)trail.push(pt(i/16*Math.max(.15,u)));
  s.fill(Y,ribbon(trail,14,{taper:.6,wobble:1}),.9);
  if(age>0&&age<.3)sparkBurst(s,Y,x,y,110,{n:8,seed,g:1-clamp(age/.3),width:11});
  const b=pt(u);whiteBall(s,b[0],b[1],48,age*12+hash(seed,3)*TAU);
 },
};
export default story;
